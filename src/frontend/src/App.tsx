import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Bell,
  ChevronDown,
  Loader2,
  LogOut,
  Search,
  Settings,
  Star,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Video } from "./backend.d";
import AdminPanel from "./components/AdminPanel";
import VideoCard from "./components/VideoCard";
import VideoDetail from "./components/VideoDetail";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useCallerProfile,
  useChannel,
  useIsAdmin,
  useSaveProfile,
  useSearchVideos,
  useSubscribe,
  useVideos,
} from "./hooks/useQueries";
import { formatSubscribers } from "./utils/formatters";

const CATEGORIES = [
  "All",
  "History",
  "Nature",
  "Culture",
  "Sports",
  "Music",
  "Travel",
] as const;
type Category = (typeof CATEGORIES)[number];

// ── Stars decoration ──────────────────────────────────────────────────────────
function StarsRow({ count = 5 }: { count?: number }) {
  return (
    <span className="text-gold" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: decorative stars need no stable key
        <span key={i}>★</span>
      ))}
    </span>
  );
}

// ── Channel Header Skeleton ───────────────────────────────────────────────────
function ChannelHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <Skeleton className="w-full h-40 md:h-52 rounded-none" />
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </div>
  );
}

// ── Video Grid Skeleton ───────────────────────────────────────────────────────
function VideoGridSkeleton() {
  return (
    <div
      data-ocid="video.loading_state"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {Array.from({ length: 8 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders with no identity
        <div key={i} className="space-y-2 animate-pulse">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

// ── Profile Setup Modal ───────────────────────────────────────────────────────
function ProfileSetupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const saveProfile = useSaveProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success("Profile saved!");
      onClose();
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/70 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-background rounded-2xl shadow-navy-lg p-8 max-w-sm w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🇺🇸</div>
          <h2 className="font-heading font-bold text-xl">
            Set Up Your Profile
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome! Choose a display name.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (e.g. John Smith)"
            autoFocus
            className="text-center"
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={saveProfile.isPending || !name.trim()}
              className="flex-1 bg-navy hover:bg-navy-dark text-white"
            >
              {saveProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Skip
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const isLoggedIn = loginStatus === "success" || !!identity;

  const { data: channel, isLoading: channelLoading } = useChannel();
  const { data: allVideos = [], isLoading: videosLoading } = useVideos();
  const { data: searchResults = [], isFetching: searchFetching } =
    useSearchVideos(searchQuery);
  const { data: isAdmin } = useIsAdmin();
  const { data: profile } = useCallerProfile();
  const subscribeMutation = useSubscribe();

  const displayedVideos = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    if (selectedCategory === "All") return allVideos;
    return allVideos.filter((v) => v.category === selectedCategory);
  }, [searchQuery, searchResults, selectedCategory, allVideos]);

  const handleSubscribe = useCallback(async () => {
    if (!isLoggedIn) {
      toast.info("Please log in to subscribe");
      return;
    }
    if (isSubscribed) return;
    try {
      await subscribeMutation.mutateAsync();
      setIsSubscribed(true);
      toast.success("Subscribed! 🇺🇸 Welcome to America Channel!");
    } catch {
      toast.error("Failed to subscribe");
    }
  }, [isLoggedIn, isSubscribed, subscribeMutation]);

  const handleLogin = useCallback(async () => {
    try {
      await login();
    } catch {
      toast.error("Login failed");
    }
  }, [login]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
  };

  const subscriberCount = channel
    ? isSubscribed
      ? Number(channel.subscriberCount) + 1
      : Number(channel.subscriberCount)
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster richColors position="top-right" />

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-40 bg-navy-dark border-b border-white/10 shadow-navy-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group"
            data-ocid="nav.link"
          >
            <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center shadow-sm group-hover:shadow-gold-glow transition-shadow">
              <span className="text-white font-display font-bold text-sm">
                🇺🇸
              </span>
            </div>
            <span className="font-heading font-bold text-white text-lg hidden sm:block">
              America<span className="text-gold">Channel</span>
            </span>
          </a>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <Input
              data-ocid="channel.search_input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search American videos..."
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-gold/50 h-9"
            />
            {searchFetching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdmin((s) => !s)}
                className={`text-white/80 hover:text-white hover:bg-white/10 gap-1.5 ${showAdmin ? "bg-white/10 text-gold" : ""}`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-heading">
                  Admin
                </span>
              </Button>
            )}

            {isInitializing ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!profile) setShowProfileSetup(true);
                  }}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-full px-3 py-1.5 transition-colors"
                >
                  <Avatar className="w-6 h-6 bg-gold">
                    <AvatarFallback className="bg-gold text-navy-dark text-xs font-heading font-bold">
                      {profile?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-xs font-heading hidden sm:block max-w-[80px] truncate">
                    {profile?.name ?? "Set name"}
                  </span>
                  {!profile && (
                    <ChevronDown className="w-3 h-3 text-white/60" />
                  )}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="text-white/60 hover:text-white hover:bg-white/10 p-1.5"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                data-ocid="auth.login_button"
                size="sm"
                onClick={handleLogin}
                disabled={loginStatus === "logging-in"}
                className="bg-gold hover:bg-gold-light text-navy-dark font-heading font-bold gap-1.5"
              >
                {loginStatus === "logging-in" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Channel Header ── */}
      {channelLoading ? (
        <ChannelHeaderSkeleton />
      ) : (
        <div>
          {/* Banner */}
          <div
            className="relative w-full overflow-hidden"
            style={{ maxHeight: "220px" }}
          >
            <img
              src="/assets/generated/america-channel-banner.dim_1280x320.jpg"
              alt="America Channel Banner"
              className="w-full h-full object-cover"
              style={{ maxHeight: "220px" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-dark/60" />
          </div>

          {/* Channel Info */}
          <div className="bg-white border-b border-border">
            <div className="max-w-7xl mx-auto px-4 py-4 md:py-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 -mt-8 sm:-mt-10 z-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-navy-md bg-navy-dark flex items-center justify-center text-3xl sm:text-4xl">
                    🇺🇸
                  </div>
                </div>

                {/* Channel details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-heading font-bold text-2xl text-navy">
                      {channel?.name ?? "America Channel"}
                    </h1>
                    <Badge className="bg-crimson text-white border-0 text-xs gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Official
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mt-0.5 line-clamp-2 max-w-lg">
                    {channel?.description ??
                      "Explore the beauty, history, and culture of the United States of America."}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>{formatSubscribers(BigInt(subscriberCount))}</span>
                    <span>•</span>
                    <span>{allVideos.length} videos</span>
                    <span>•</span>
                    <StarsRow count={3} />
                  </div>
                </div>

                {/* Subscribe */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    data-ocid="channel.subscribe_button"
                    onClick={handleSubscribe}
                    disabled={subscribeMutation.isPending || isSubscribed}
                    className={`font-heading font-bold gap-2 ${
                      isSubscribed
                        ? "bg-muted text-muted-foreground cursor-default"
                        : "bg-crimson hover:bg-crimson-light text-white shadow-navy-sm"
                    }`}
                  >
                    {subscribeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* ── Admin Panel ── */}
        <AnimatePresence>
          {showAdmin && isAdmin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <AdminPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Category Tabs ── */}
        <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              data-ocid="nav.tab"
              onClick={() => {
                setSelectedCategory(cat);
                setSearchQuery("");
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-heading font-bold transition-all duration-200 ${
                selectedCategory === cat && !searchQuery
                  ? "bg-navy text-white shadow-navy-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
          {searchQuery && (
            <div className="flex-shrink-0 flex items-center gap-2 ml-2">
              <Badge
                variant="outline"
                className="border-gold text-navy font-body"
              >
                Search: "{searchQuery}"
              </Badge>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground transition-colors text-xs"
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Video Grid ── */}
        {videosLoading || searchFetching ? (
          <VideoGridSkeleton />
        ) : displayedVideos.length === 0 ? (
          <motion.div
            data-ocid="video.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🦅</div>
            <h3 className="font-heading font-bold text-xl text-navy mb-2">
              No Videos Found
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {searchQuery
                ? `No results for "${searchQuery}". Try different keywords.`
                : `No videos in the ${selectedCategory} category yet.`}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                className="mt-4 border-navy text-navy hover:bg-navy hover:text-white"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayedVideos.map((video, index) => (
              <VideoCard
                key={video.id.toString()}
                video={video}
                index={index}
                onClick={handleVideoClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-navy-dark text-white/70 border-t border-white/10 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center text-sm">
                🇺🇸
              </div>
              <div>
                <p className="font-heading font-bold text-white text-sm">
                  America Channel
                </p>
                <p className="text-xs text-white/50">
                  Celebrating the United States of America
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-gold text-lg mb-1">★ ★ ★ ★ ★</div>
              <p className="text-xs">
                © {new Date().getFullYear()}. Built with ❤️ using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-light transition-colors underline underline-offset-2"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Video Detail Modal ── */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoDetail
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Profile Setup Modal ── */}
      <AnimatePresence>
        {showProfileSetup && (
          <ProfileSetupModal onClose={() => setShowProfileSetup(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
