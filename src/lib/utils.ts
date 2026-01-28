import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const UI_AVATARS_BASE = "https://ui-avatars.com/api";

/**
 * Avatar URL for alumni (or any { avatar_url?, full_name? }).
 * Prefers stored avatar_url; otherwise falls back to UI Avatars (initials) — free, no API key.
 */
export function avatarUrlForAlumni(p: { avatar_url?: string | null; full_name?: string | null }): string | undefined {
  if (p?.avatar_url && p.avatar_url.trim() !== "") return p.avatar_url;
  const name = (p?.full_name ?? "").trim();
  if (!name) return undefined;
  const q = new URLSearchParams({ name, size: "200" });
  return `${UI_AVATARS_BASE}?${q.toString()}`;
}

/** Format crossing for display, e.g. "1-Xi-24" or "Xi-24". Used on Members, Alumni, task assignees, etc. */
export function formatCrossingDisplay(p: {
  crossing_year?: number | null;
  chapter?: string | null;
  line_order?: number | null;
}): string | null {
  const year = p?.crossing_year;
  if (year == null) return null;
  const yearShort = String(year).slice(-2);
  const chapterRaw = p?.chapter || "";
  const chapterAbbrev = chapterRaw.startsWith("Xi") ? "Xi" : (chapterRaw.split(/[\s(]/)[0] || chapterRaw || "Xi");
  const lineNum = p?.line_order;
  if (lineNum != null) return `${lineNum}-${chapterAbbrev}-${yearShort}`;
  return `${chapterAbbrev}-${yearShort}`;
}
