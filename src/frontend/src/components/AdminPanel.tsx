import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit2,
  Film,
  Loader2,
  Plus,
  Save,
  Settings,
  Trash2,
  Tv,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Channel, Video } from "../backend.d";
import {
  useAddVideo,
  useChannel,
  useDeleteVideo,
  useUpdateChannel,
  useUpdateVideo,
  useVideos,
} from "../hooks/useQueries";
import { formatViews } from "../utils/formatters";

const CATEGORIES = [
  "History",
  "Nature",
  "Culture",
  "Sports",
  "Music",
  "Travel",
];

interface VideoFormData {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: string;
  duration: string;
}

const EMPTY_FORM: VideoFormData = {
  title: "",
  description: "",
  thumbnailUrl: "",
  videoUrl: "",
  category: "History",
  duration: "0:00",
};

function VideoForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  initial: VideoFormData;
  onSubmit: (data: VideoFormData) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<VideoFormData>(initial);

  const update = (key: keyof VideoFormData, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.category) {
      toast.error("Category is required");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label className="text-xs uppercase tracking-wide font-heading text-muted-foreground">
            Title *
          </Label>
          <Input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. The Story of the Grand Canyon"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide font-heading text-muted-foreground">
            Category *
          </Label>
          <Select
            value={form.category}
            onValueChange={(v) => update("category", v)}
          >
            <SelectTrigger className="mt-1" data-ocid="admin.select">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wide font-heading text-muted-foreground">
            Duration
          </Label>
          <Input
            value={form.duration}
            onChange={(e) => update("duration", e.target.value)}
            placeholder="e.g. 12:34"
            className="mt-1"
          />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs uppercase tracking-wide font-heading text-muted-foreground">
            Video URL
          </Label>
          <Input
            value={form.videoUrl}
            onChange={(e) => update("videoUrl", e.target.value)}
            placeholder="e.g. https://www.youtube.com/watch?v=..."
            className="mt-1"
          />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs uppercase tracking-wide font-heading text-muted-foreground">
            Thumbnail URL
          </Label>
          <Input
            value={form.thumbnailUrl}
            onChange={(e) => update("thumbnailUrl", e.target.value)}
            placeholder="https://..."
            className="mt-1"
          />
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs uppercase tracking-wide font-heading text-muted-foreground">
            Description
          </Label>
          <Textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe this video..."
            rows={3}
            className="mt-1 resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button
          data-ocid="admin.save_button"
          type="submit"
          disabled={isPending}
          className="bg-navy hover:bg-navy-dark text-white gap-2"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ChannelEditForm({ channel }: { channel: Channel }) {
  const [form, setForm] = useState({
    name: channel.name,
    description: channel.description,
  });
  const updateChannel = useUpdateChannel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateChannel.mutateAsync({
        name: form.name,
        description: form.description,
        subscriberCount: channel.subscriberCount,
      });
      toast.success("Channel updated!");
    } catch {
      toast.error("Failed to update channel");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-xs uppercase tracking-wide font-heading text-muted-foreground">
          Channel Name
        </Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide font-heading text-muted-foreground">
          Description
        </Label>
        <Textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={3}
          className="mt-1 resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={updateChannel.isPending}
        className="bg-gold hover:bg-gold-light text-navy-dark font-heading font-bold gap-2"
        data-ocid="admin.save_button"
      >
        {updateChannel.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save Channel
      </Button>
    </form>
  );
}

export default function AdminPanel() {
  const { data: videos = [], isLoading: videosLoading } = useVideos();
  const { data: channel } = useChannel();
  const addVideo = useAddVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<bigint | null>(null);
  const [activeSection, setActiveSection] = useState<"videos" | "channel">(
    "videos",
  );

  const handleAdd = async (data: VideoFormData) => {
    try {
      await addVideo.mutateAsync(data);
      setShowAddForm(false);
      toast.success("Video added!");
    } catch {
      toast.error("Failed to add video");
    }
  };

  const handleEdit = async (data: VideoFormData) => {
    if (!editingVideo) return;
    try {
      await updateVideo.mutateAsync({
        id: editingVideo.id,
        video: { ...editingVideo, ...data },
      });
      setEditingVideo(null);
      toast.success("Video updated!");
    } catch {
      toast.error("Failed to update video");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteVideo.mutateAsync(id);
      setConfirmDelete(null);
      toast.success("Video deleted");
    } catch {
      toast.error("Failed to delete video");
    }
  };

  return (
    <motion.div
      data-ocid="admin.panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background border border-border rounded-2xl shadow-navy-sm overflow-hidden"
    >
      {/* Admin Header */}
      <div className="bg-navy-dark text-white px-6 py-4 flex items-center gap-3">
        <Settings className="w-5 h-5 text-gold" />
        <div>
          <h2 className="font-heading font-bold text-lg">Admin Panel</h2>
          <p className="text-white/60 text-xs">Manage channel content</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveSection("videos")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-heading font-bold transition-colors ${
            activeSection === "videos"
              ? "border-b-2 border-crimson text-crimson"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Film className="w-4 h-4" />
          Videos ({videos.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("channel")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-heading font-bold transition-colors ${
            activeSection === "channel"
              ? "border-b-2 border-crimson text-crimson"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tv className="w-4 h-4" />
          Channel Info
        </button>
      </div>

      <div className="p-6">
        {activeSection === "videos" && (
          <div className="space-y-6">
            {/* Add Video Button */}
            {!showAddForm && !editingVideo && (
              <Button
                data-ocid="admin.add_video_button"
                onClick={() => setShowAddForm(true)}
                className="bg-crimson hover:bg-crimson-light text-white gap-2 font-heading"
              >
                <Plus className="w-4 h-4" />
                Add New Video
              </Button>
            )}

            {/* Add Form */}
            {showAddForm && (
              <div className="border border-border rounded-xl p-5 bg-muted/20">
                <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-crimson" />
                  New Video
                </h3>
                <VideoForm
                  initial={EMPTY_FORM}
                  onSubmit={handleAdd}
                  onCancel={() => setShowAddForm(false)}
                  isPending={addVideo.isPending}
                  submitLabel="Add Video"
                />
              </div>
            )}

            <Separator />

            {/* Video List */}
            {videosLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No videos yet. Add your first video!
              </p>
            ) : (
              <div className="space-y-3">
                {videos.map((video, i) => (
                  <div key={video.id.toString()}>
                    {editingVideo?.id === video.id ? (
                      <div className="border border-navy/30 rounded-xl p-5 bg-muted/20">
                        <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
                          <Edit2 className="w-4 h-4 text-navy" />
                          Editing: {video.title}
                        </h3>
                        <VideoForm
                          initial={{
                            title: video.title,
                            description: video.description,
                            thumbnailUrl: video.thumbnailUrl,
                            videoUrl: video.videoUrl,
                            category: video.category,
                            duration: video.duration,
                          }}
                          onSubmit={handleEdit}
                          onCancel={() => setEditingVideo(null)}
                          isPending={updateVideo.isPending}
                          submitLabel="Save Changes"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-navy/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-bold text-sm truncate">
                            {video.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant="outline"
                              className="text-xs border-crimson/30 text-crimson"
                            >
                              {video.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatViews(video.views)} views
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {video.duration}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingVideo(video)}
                            className="h-8 w-8 p-0 text-navy hover:bg-navy/10"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          {confirmDelete === video.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(video.id)}
                                disabled={deleteVideo.isPending}
                                className="h-7 px-2 text-xs"
                                data-ocid={`admin.delete_button.${i + 1}`}
                              >
                                {deleteVideo.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Confirm"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirmDelete(null)}
                                className="h-7 px-2 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setConfirmDelete(video.id)}
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              title="Delete"
                              data-ocid={`admin.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "channel" && channel && (
          <div>
            <h3 className="font-heading font-bold mb-4">
              Edit Channel Information
            </h3>
            <ChannelEditForm channel={channel} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
