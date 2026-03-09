import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Video = {
    id : Nat;
    title : Text;
    description : Text;
    thumbnailUrl : Text;
    videoUrl : Text;
    category : Text;
    views : Nat;
    likes : Nat;
    dislikes : Nat;
    duration : Text;
    uploadedAt : Int;
  };

  module Video {
    public func compareById(video1 : Video, video2 : Video) : Order.Order {
      Nat.compare(video1.id, video2.id);
    };
  };

  type Comment = {
    id : Nat;
    videoId : Nat;
    author : Text;
    body : Text;
    createdAt : Int;
  };

  module Comment {
    public func compareByCreatedAt(comment1 : Comment, comment2 : Comment) : Order.Order {
      Int.compare(comment1.createdAt, comment2.createdAt);
    };
  };

  type Channel = {
    name : Text;
    description : Text;
    subscriberCount : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextVideoId = 7;
  var nextCommentId = 1;

  var channel : Channel = {
    name = "America Now";
    description = "Exploring America's culture, history, and entertainment.";
    subscriberCount = 0;
  };

  let videos = Map.empty<Nat, Video>();
  let comments = Map.empty<Nat, List.List<Comment>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Seed 6 sample videos
  let initialVideos = [
    {
      id = 1;
      title = "The Founding of America";
      description = "A deep dive into America's early history.";
      thumbnailUrl = "https://example.com/founding_thumbnail.jpg";
      videoUrl = "https://example.com/founding_video.mp4";
      category = "History";
      views = 0;
      likes = 0;
      dislikes = 0;
      duration = "45:20";
      uploadedAt = Time.now();
    },
    {
      id = 2;
      title = "Grand Canyon Wonders";
      description = "Exploring America's iconic Grand Canyon.";
      thumbnailUrl = "https://example.com/grandcanyon_thumbnail.jpg";
      videoUrl = "https://example.com/grandcanyon_video.mp4";
      category = "Nature";
      views = 0;
      likes = 0;
      dislikes = 0;
      duration = "30:10";
      uploadedAt = Time.now();
    },
    {
      id = 3;
      title = "Thanksgiving Traditions";
      description = "Unveiling the cultural significance of Thanksgiving.";
      thumbnailUrl = "https://example.com/thanksgiving_thumbnail.jpg";
      videoUrl = "https://example.com/thanksgiving_video.mp4";
      category = "Culture";
      views = 0;
      likes = 0;
      dislikes = 0;
      duration = "25:45";
      uploadedAt = Time.now();
    },
    {
      id = 4;
      title = "Super Bowl Highlights";
      description = "Analyzing the top moments in Super Bowl history.";
      thumbnailUrl = "https://example.com/superbowl_thumbnail.jpg";
      videoUrl = "https://example.com/superbowl_video.mp4";
      category = "Sports";
      views = 0;
      likes = 0;
      dislikes = 0;
      duration = "18:30";
      uploadedAt = Time.now();
    },
    {
      id = 5;
      title = "Jazz: America's Music";
      description = "The evolution and global impact of Jazz music.";
      thumbnailUrl = "https://example.com/jazz_thumbnail.jpg";
      videoUrl = "https://example.com/jazz_video.mp4";
      category = "Music";
      views = 0;
      likes = 0;
      dislikes = 0;
      duration = "29:56";
      uploadedAt = Time.now();
    },
    {
      id = 6;
      title = "Route 66 - The American Road Trip";
      description = "Journey along the legendary Route 66.";
      thumbnailUrl = "https://example.com/route66_thumbnail.jpg";
      videoUrl = "https://example.com/route66_video.mp4";
      category = "Travel";
      views = 0;
      likes = 0;
      dislikes = 0;
      duration = "55:42";
      uploadedAt = Time.now();
    },
  ];

  for (video in initialVideos.values()) {
    videos.add(video.id, video);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Channel Management
  public query ({ caller }) func getChannel() : async Channel {
    channel;
  };

  public shared ({ caller }) func updateChannel(newChannel : Channel) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update the channel");
    };
    channel := newChannel;
  };

  // Video Management
  public query ({ caller }) func getVideos() : async [Video] {
    videos.values().toArray().sort(Video.compareById);
  };

  public query ({ caller }) func getVideosByCategory(category : Text) : async [Video] {
    videos.values().toArray().filter(func(v) { Text.equal(v.category, category) });
  };

  public query ({ caller }) func searchVideos(keyword : Text) : async [Video] {
    videos.values().toArray().filter(
      func(v) {
        v.title.contains(#text keyword) or v.description.contains(#text keyword);
      }
    );
  };

  public query ({ caller }) func getVideo(id : Nat) : async ?Video {
    videos.get(id);
  };

  public shared ({ caller }) func addVideo(video : Video) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add videos");
    };
    let newVideo : Video = {
      id = nextVideoId;
      thumbnailUrl = video.thumbnailUrl;
      videoUrl = video.videoUrl;
      category = video.category;
      title = video.title;
      description = video.description;
      duration = video.duration;
      likes = video.likes;
      dislikes = video.dislikes;
      views = video.views;
      uploadedAt = Time.now();
    };
    videos.add(nextVideoId, newVideo);
    nextVideoId += 1;
  };

  public shared ({ caller }) func updateVideo(id : Nat, updatedVideo : Video) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update videos");
    };
    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let videoWithId = {
          id = id;
          videoUrl = updatedVideo.videoUrl;
          thumbnailUrl = updatedVideo.thumbnailUrl;
          title = updatedVideo.title;
          category = updatedVideo.category;
          description = updatedVideo.description;
          duration = updatedVideo.duration;
          likes = updatedVideo.likes;
          dislikes = updatedVideo.dislikes;
          views = updatedVideo.views;
          uploadedAt = updatedVideo.uploadedAt;
        };
        videos.add(id, videoWithId);
      };
    };
  };

  public shared ({ caller }) func deleteVideo(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };
    if (not videos.containsKey(id)) {
      Runtime.trap("Video not found");
    };
    videos.remove(id);
  };

  // Video Interaction
  public shared ({ caller }) func likeVideo(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like videos");
    };
    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        let updatedVideo = { video with likes = video.likes + 1 };
        videos.add(id, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func dislikeVideo(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can dislike videos");
    };
    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        let updatedVideo = { video with dislikes = video.dislikes + 1 };
        videos.add(id, updatedVideo);
      };
    };
  };

  public shared ({ caller }) func incrementViews(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can increment views");
    };
    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        let updatedVideo = { video with views = video.views + 1 };
        videos.add(id, updatedVideo);
      };
    };
  };

  // Comments
  public query ({ caller }) func getComments(videoId : Nat) : async [Comment] {
    switch (comments.get(videoId)) {
      case (null) { [] };
      case (?commentList) { commentList.toArray().sort(Comment.compareByCreatedAt) };
    };
  };

  public shared ({ caller }) func addComment(videoId : Nat, author : Text, body : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };
    if (not videos.containsKey(videoId)) {
      Runtime.trap("Video not found");
    };
    let newComment : Comment = {
      id = nextCommentId;
      videoId;
      author;
      body;
      createdAt = Time.now();
    };
    let currentComments = switch (comments.get(videoId)) {
      case (null) { List.empty<Comment>() };
      case (?list) { list };
    };
    currentComments.add(newComment);
    comments.add(videoId, currentComments);
    nextCommentId += 1;
  };

  // Subscriptions
  public shared ({ caller }) func subscribe() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can subscribe");
    };
    channel := {
      channel with
      subscriberCount = channel.subscriberCount + 1;
    };
  };
};
