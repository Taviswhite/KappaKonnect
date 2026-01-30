import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SUPABASE_URL } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const UI_AVATARS_BASE = "https://ui-avatars.com/api";

/**
 * Resolves avatar_url so it always loads. Relative paths (e.g. /avatars/foo.png or /avatars/email@example.com.png)
 * are converted to full Supabase Storage public URLs; full URLs are returned as-is.
 */
export function resolveAvatarUrl(url: string | null | undefined): string | undefined {
  if (!url || typeof url !== "string" || url.trim() === "") return undefined;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/") && SUPABASE_URL) {
    // Build Storage URL: use path as-is so firstname_example.com-uuid.png works (encoding breaks dots)
    const prefix = "/storage/v1/object/public";
    const pathAfterPrefix = u.slice("/avatars/".length);
    const segment = pathAfterPrefix || "";
    const encoded = segment.includes("@") ? encodeURIComponent(segment) : segment;
    return `${SUPABASE_URL}${prefix}/avatars/${encoded}`;
  }
  return u;
}

/**
 * Avatar URL for alumni (or any { avatar_url?, full_name? }).
 * Prefers stored avatar_url (resolved from Supabase if relative); otherwise falls back to UI Avatars.
 */
export function avatarUrlForAlumni(p: { avatar_url?: string | null; full_name?: string | null }): string | undefined {
  const resolved = resolveAvatarUrl(p?.avatar_url);
  if (resolved) return resolved;
  return uiAvatarUrlFromName(p?.full_name);
}

/** UI Avatars URL from name only (for fallback when stored image fails to load). */
export function uiAvatarUrlFromName(fullName: string | null | undefined): string | undefined {
  const name = (fullName ?? "").trim();
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
