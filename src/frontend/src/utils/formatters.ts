/**
 * Format view count with K/M suffix
 */
export function formatViews(views: bigint | number): string {
  const n = typeof views === "bigint" ? Number(views) : views;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/**
 * Format nanosecond timestamp to relative time
 */
export function formatRelativeTime(uploadedAt: bigint | number): string {
  const msTimestamp =
    typeof uploadedAt === "bigint"
      ? Number(uploadedAt) / 1_000_000 // nanoseconds to ms
      : uploadedAt;

  const now = Date.now();
  const diff = now - msTimestamp;

  if (diff < 0) return "Just now";

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

/**
 * Format subscriber count
 */
export function formatSubscribers(count: bigint | number): string {
  const n = typeof count === "bigint" ? Number(count) : count;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M subscribers`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K subscribers`;
  return `${n} subscriber${n !== 1 ? "s" : ""}`;
}

/**
 * Check if a URL is a YouTube embed URL
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

/**
 * Convert YouTube URL to embed URL
 */
export function toYouTubeEmbed(url: string): string {
  // Already embed format
  if (url.includes("youtube.com/embed/")) return url;

  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  // youtube.com/watch?v=ID
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;

  return url;
}
