import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Channel, Comment, UserProfile, Video } from "../backend.d";
import { useActor } from "./useActor";

// ── Channel ──────────────────────────────────────────────────────────────────

export function useChannel() {
  const { actor, isFetching } = useActor();
  return useQuery<Channel>({
    queryKey: ["channel"],
    queryFn: async () => {
      if (!actor)
        return {
          name: "America Channel",
          description: "",
          subscriberCount: BigInt(0),
        };
      return actor.getChannel();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Videos ────────────────────────────────────────────────────────────────────

export function useVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVideosByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideosByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchVideos(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos", "search", keyword],
    queryFn: async () => {
      if (!actor || !keyword.trim()) return [];
      return actor.searchVideos(keyword);
    },
    enabled: !!actor && !isFetching && keyword.trim().length > 0,
  });
}

// ── Comments ──────────────────────────────────────────────────────────────────

export function useComments(videoId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", videoId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(videoId);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Auth / Profile ─────────────────────────────────────────────────────────────

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useSubscribe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.subscribe();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel"] });
    },
  });
}

export function useLikeVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.likeVideo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useDislikeVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.dislikeVideo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useIncrementViews() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.incrementViews(id);
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      videoId,
      author,
      body,
    }: { videoId: bigint; author: string; body: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(videoId, author, body);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", vars.videoId.toString()],
      });
    },
  });
}

export function useAddVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      video: Omit<
        import("../backend.d").Video,
        "id" | "views" | "likes" | "dislikes" | "uploadedAt"
      >,
    ) => {
      if (!actor) throw new Error("Not connected");
      const newVideo: import("../backend.d").Video = {
        ...video,
        id: BigInt(0),
        views: BigInt(0),
        likes: BigInt(0),
        dislikes: BigInt(0),
        uploadedAt: BigInt(Date.now()),
      };
      return actor.addVideo(newVideo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useUpdateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      video,
    }: { id: bigint; video: import("../backend.d").Video }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateVideo(id, video);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteVideo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useUpdateChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (channel: import("../backend.d").Channel) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateChannel(channel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: import("../backend.d").UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}
