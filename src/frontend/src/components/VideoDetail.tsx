import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  Loader2,
  MessageCircle,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Video } from "../backend.d";
import {
  useAddComment,
  useComments,
  useDislikeVideo,
  useIncrementViews,
  useLikeVideo,
} from "../hooks/useQueries";
import {
  formatRelativeTime,
  formatViews,
  isYouTubeUrl,
  toYouTubeEmbed,
} from "../utils/formatters";

interface VideoDetailProps {
  video: Video;
  onClose: () => void;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  History: "from-navy via-navy-light to-crimson",
  Nature:
    "from-[oklch(0.25_0.1_150)] via-[oklch(0.35_0.12_140)] to-[oklch(0.5_0.15_120)]",
  Culture: "from-[oklch(0.3_0.1_280)] via-[oklch(0.4_0.12_260)] to-crimson",
  Sports: "from-navy via-crimson to-gold",
  Music: "from-[oklch(0.25_0.12_300)] via-[oklch(0.35_0.15_280)] to-crimson",
  Travel:
    "from-[oklch(0.25_0.1_220)] via-[oklch(0.35_0.12_200)] to-[oklch(0.55_0.18_170)]",
  All: "from-navy via-navy-light to-crimson",
};

function VideoPlayer({ video }: { video: Video }) {
  if (isYouTubeUrl(video.videoUrl)) {
    return (
      <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden">
        <iframe
          src={toYouTubeEmbed(video.videoUrl)}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
        />
      </div>
    );
  }

  if (
    video.videoUrl?.startsWith("http") &&
    !video.videoUrl.includes("youtube")
  ) {
    return (
      <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden">
        {/* biome-ignore lint/a11y/useMediaCaption: user-provided video content */}
        <video
          src={video.videoUrl}
          className="absolute inset-0 w-full h-full"
          controls
          poster={video.thumbnailUrl || undefined}
        />
      </div>
    );
  }

  // Placeholder
  const gradient = CATEGORY_GRADIENTS[video.category] || CATEGORY_GRADIENTS.All;
  const hasThumbnail = video.thumbnailUrl?.startsWith("http");

  return (
    <div
      className={`relative aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br ${gradient}`}
    >
      {hasThumbnail && (
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, white 0px, white 2px, transparent 2px, transparent 14px)",
          }}
        />
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="font-heading font-bold text-xl">{video.title}</p>
          <p className="text-white/70 text-sm mt-1">
            {video.category} · {video.duration}
          </p>
          <p className="text-gold/80 text-sm mt-2">★ American Content ★</p>
        </div>
      </div>
    </div>
  );
}

export default function VideoDetail({ video, onClose }: VideoDetailProps) {
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [localLikes, setLocalLikes] = useState(Number(video.likes));
  const [localDislikes, setLocalDislikes] = useState(Number(video.dislikes));
  const [localViews, setLocalViews] = useState(Number(video.views));
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  const { data: comments = [], isLoading: commentsLoading } = useComments(
    video.id,
  );
  const likeMutation = useLikeVideo();
  const dislikeMutation = useDislikeVideo();
  const incrementViews = useIncrementViews();
  const addComment = useAddComment();

  // Increment views when opened - only run on mount (video.id won't change)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  useEffect(() => {
    incrementViews.mutate(video.id);
    setLocalViews((v) => v + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id]);

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      await likeMutation.mutateAsync(video.id);
      setLocalLikes((l) => l + 1);
      if (hasDisliked) {
        setLocalDislikes((d) => d - 1);
        setHasDisliked(false);
      }
      setHasLiked(true);
    } catch {
      toast.error("Failed to like video");
    }
  };

  const handleDislike = async () => {
    if (hasDisliked) return;
    try {
      await dislikeMutation.mutateAsync(video.id);
      setLocalDislikes((d) => d + 1);
      if (hasLiked) {
        setLocalLikes((l) => l - 1);
        setHasLiked(false);
      }
      setHasDisliked(true);
    } catch {
      toast.error("Failed to dislike video");
    }
  };

  const handleAddComment = async () => {
    if (!commentAuthor.trim() || !commentBody.trim()) {
      toast.error("Please fill in your name and comment");
      return;
    }
    try {
      await addComment.mutateAsync({
        videoId: video.id,
        author: commentAuthor,
        body: commentBody,
      });
      setCommentBody("");
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center bg-navy-dark/80 backdrop-blur-sm overflow-y-auto py-4 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        data-ocid="video_detail.dialog"
      >
        <motion.div
          className="relative w-full max-w-4xl bg-background rounded-2xl shadow-navy-lg overflow-hidden my-auto"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 bg-navy-dark/80 hover:bg-navy text-white rounded-full p-1.5 transition-colors"
            aria-label="Close"
            data-ocid="video_detail.close_button"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-4 md:p-6">
            {/* Video Player */}
            <VideoPlayer video={video} />

            {/* Title + Meta */}
            <div className="mt-4">
              <div className="flex items-start gap-2 flex-wrap">
                <Badge className="bg-crimson text-white border-0 text-xs font-heading uppercase tracking-wide">
                  {video.category}
                </Badge>
              </div>
              <h2 className="font-heading font-bold text-xl md:text-2xl mt-2 text-foreground leading-tight">
                {video.title}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatViews(BigInt(localViews))} views
                </span>
                <span>•</span>
                <span>{formatRelativeTime(video.uploadedAt)}</span>
                <span>•</span>
                <span className="font-mono">{video.duration}</span>
              </div>

              {/* Like / Dislike */}
              <div className="flex items-center gap-2 mt-3">
                <Button
                  data-ocid="video_detail.like_button"
                  variant={hasLiked ? "default" : "outline"}
                  size="sm"
                  className={`gap-1.5 ${hasLiked ? "bg-navy text-white border-navy" : "border-navy/30 text-navy hover:bg-navy hover:text-white"}`}
                  onClick={handleLike}
                  disabled={likeMutation.isPending || hasLiked}
                >
                  {likeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-4 h-4" />
                  )}
                  {formatViews(BigInt(localLikes))}
                </Button>
                <Button
                  data-ocid="video_detail.dislike_button"
                  variant={hasDisliked ? "default" : "outline"}
                  size="sm"
                  className={`gap-1.5 ${hasDisliked ? "bg-crimson text-white border-crimson" : "border-crimson/30 text-crimson hover:bg-crimson hover:text-white"}`}
                  onClick={handleDislike}
                  disabled={dislikeMutation.isPending || hasDisliked}
                >
                  {dislikeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsDown className="w-4 h-4" />
                  )}
                  {formatViews(BigInt(localDislikes))}
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Description */}
            {video.description && (
              <>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {video.description}
                  </p>
                </div>
                <Separator className="my-4" />
              </>
            )}

            {/* Comments */}
            <div>
              <h3 className="font-heading font-bold text-lg flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-crimson" />
                Comments
                {comments.length > 0 && (
                  <span className="text-sm font-body font-normal text-muted-foreground">
                    ({comments.length})
                  </span>
                )}
              </h3>

              {/* Add Comment Form */}
              <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
                <div className="flex flex-col gap-3">
                  <div>
                    <Label
                      htmlFor="comment-author"
                      className="text-xs font-heading uppercase tracking-wide text-muted-foreground mb-1 block"
                    >
                      Your Name
                    </Label>
                    <Input
                      id="comment-author"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      placeholder="e.g. John Smith"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="comment-body"
                      className="text-xs font-heading uppercase tracking-wide text-muted-foreground mb-1 block"
                    >
                      Comment
                    </Label>
                    <Textarea
                      id="comment-body"
                      data-ocid="comment.input"
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder="Share your thoughts about America..."
                      rows={3}
                      className="bg-background resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                          handleAddComment();
                      }}
                    />
                  </div>
                  <Button
                    data-ocid="comment.submit_button"
                    onClick={handleAddComment}
                    disabled={
                      addComment.isPending ||
                      !commentAuthor.trim() ||
                      !commentBody.trim()
                    }
                    className="self-end bg-navy hover:bg-navy-dark text-white gap-2"
                  >
                    {addComment.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Post Comment
                  </Button>
                </div>
              </div>

              {/* Comment List */}
              {commentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded w-24" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id.toString()} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0 bg-navy">
                        <AvatarFallback className="bg-navy text-white text-xs font-heading">
                          {comment.author.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm">
                            {comment.author}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-1 leading-relaxed">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
