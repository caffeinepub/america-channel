import { motion } from "motion/react";
import type { Video } from "../backend.d";
import { formatRelativeTime, formatViews } from "../utils/formatters";

interface VideoCardProps {
  video: Video;
  index: number;
  onClick: (video: Video) => void;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  History:
    "from-[oklch(0.22_0.06_255)] via-[oklch(0.3_0.08_255)] to-[oklch(0.55_0.22_25)]",
  Nature:
    "from-[oklch(0.25_0.1_150)] via-[oklch(0.35_0.12_140)] to-[oklch(0.5_0.15_120)]",
  Culture:
    "from-[oklch(0.3_0.1_280)] via-[oklch(0.4_0.12_260)] to-[oklch(0.55_0.18_25)]",
  Sports:
    "from-[oklch(0.2_0.05_255)] via-[oklch(0.55_0.22_25)] to-[oklch(0.82_0.18_85)]",
  Music:
    "from-[oklch(0.25_0.12_300)] via-[oklch(0.35_0.15_280)] to-[oklch(0.55_0.22_25)]",
  Travel:
    "from-[oklch(0.25_0.1_220)] via-[oklch(0.35_0.12_200)] to-[oklch(0.55_0.18_170)]",
  All: "from-[oklch(0.22_0.06_255)] via-[oklch(0.4_0.08_255)] to-[oklch(0.55_0.22_25)]",
};

function ThumbnailPlaceholder({
  title,
  category,
}: { title: string; category: string }) {
  const gradient = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.All;
  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-4 relative overflow-hidden`}
    >
      {/* Stars decoration */}
      <div className="absolute top-2 right-2 text-gold-light/60 text-xs">
        ★ ★ ★
      </div>
      <div className="absolute bottom-2 left-2 text-gold-light/40 text-xs">
        ★ ★
      </div>
      {/* Stripes overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, white 0px, white 4px, transparent 4px, transparent 16px)",
        }}
      />
      <span className="text-white/90 font-heading font-bold text-center text-sm leading-tight line-clamp-3 relative z-10 drop-shadow-lg">
        {title}
      </span>
      <span className="text-gold-light/80 text-xs mt-2 font-body relative z-10">
        {category}
      </span>
    </div>
  );
}

export default function VideoCard({ video, index, onClick }: VideoCardProps) {
  const hasThumbnail = video.thumbnailUrl?.startsWith("http");

  return (
    <motion.article
      data-ocid={`video.item.${index + 1}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="group cursor-pointer"
      onClick={() => onClick(video)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-navy shadow-navy-sm group-hover:shadow-navy-md transition-shadow duration-300">
        {hasThumbnail ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div
          className={`${hasThumbnail ? "hidden" : ""} w-full h-full absolute inset-0`}
        >
          <ThumbnailPlaceholder title={video.title} category={video.category} />
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-navy-dark/90 text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded">
          {video.duration}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              role="img"
            >
              <title>Play</title>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <div className="flex items-start gap-2">
          {/* Category dot */}
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-crimson mt-1.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-navy transition-colors duration-200">
              {video.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatRelativeTime(video.uploadedAt)}</span>
            </div>
            <div className="mt-1">
              <span className="inline-block text-[10px] font-heading font-bold uppercase tracking-wider text-crimson border border-crimson/30 px-1.5 py-0.5 rounded-sm">
                {video.category}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
