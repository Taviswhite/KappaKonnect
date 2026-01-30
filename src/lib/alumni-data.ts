import { supabase } from "@/integrations/supabase/client";
import { formatCrossingDisplay } from "@/lib/utils";

export type AlumniRecord = {
  id: string;
  full_name: string | null;
  email?: string | null;
  industry?: string | null;
  graduation_year?: number | null;
  crossing_year?: number | null;
  chapter?: string | null;
  line_order?: number | null;
  line_label?: string | null;
  current_company?: string | null;
  current_position?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  avatar_url?: string | null;
  user_id?: string | null;
  crossing_display?: string | null;
  [k: string]: unknown;
};

/**
 * Shared alumni fetcher used by both the Alumni page and the dashboard.
 * Mirrors the logic in Alumni.tsx so counts and lists stay in sync.
 */
export async function fetchAlumniList(user: { id: string } | null | undefined) {
  if (!user) {
    console.warn("User not authenticated - RLS will block alumni query");
    return [] as AlumniRecord[];
  }

  const { data, error } = await supabase
    .from("alumni")
    .select("id, full_name, email, industry, graduation_year, crossing_year, chapter, line_order, line_label, current_company, current_position, location, linkedin_url, avatar_url, user_id")
    .order("graduation_year", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      console.warn("Alumni table does not exist");
      return [] as AlumniRecord[];
    }
    if (error.code === "42501" || error.message?.includes("permission denied")) {
      console.error("RLS policy blocked alumni query. User:", user.id);
      throw new Error("Permission denied. Make sure you're logged in.");
    }
    // 400 / schema mismatch / missing columns: don't break the app
    console.warn("Alumni fetch failed, returning empty list:", error.message);
    return [] as AlumniRecord[];
  }

  // Skip "Do Not Exist" / DNE placeholders so they never show; numbering stays correct (e.g. Spring 2016 skip 3)
  const isDnePlaceholder = (a: { full_name?: string | null; email?: string | null }): boolean => {
    const name = a.full_name;
    if (name && String(name).trim()) {
      const n = String(name).toLowerCase().trim();
      if (n === "dne" || n.includes("do not exist") || n.includes("does not exist")) return true;
    }
    return a.email?.toLowerCase().trim() === "doesnotexist@example.com";
  };
  const rows = (data || []).filter((a) => !isDnePlaceholder(a));

  const seenById = new Set<string>();
  const seenByEmail = new Set<string>();
  const seenByName = new Map<string, number>();

  const normalizeName = (name: string | null | undefined): string => {
    if (!name) return "";
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/gi, "")
      .replace(/\b[a-z]\.\s*/g, "")
      .replace(/[^\w\s]/g, "")
      .trim();
  };

  const getFirstLast = (normalizedName: string): string => {
    const parts = normalizedName.split(/\s+/).filter((p) => p.length > 0);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };

  const list: AlumniRecord[] = [];

  for (const alum of rows as AlumniRecord[]) {
    const id = alum.id;
    const email = alum.email?.toLowerCase().trim() || null;
    const normalizedName = normalizeName(alum.full_name);
    const firstLast = getFirstLast(normalizedName);

    if (seenById.has(id)) continue;

    if (email && seenByEmail.has(email)) {
      const existingIdx = list.findIndex(
        (a) => a.email?.toLowerCase().trim() === email,
      );
      if (existingIdx >= 0) {
        const existing = list[existingIdx];
        const existingScore = [
          existing.email,
          existing.industry,
          existing.current_company,
          existing.current_position,
          existing.location,
          existing.linkedin_url,
          existing.avatar_url,
        ].filter(Boolean).length;
        const newScore = [
          alum.email,
          alum.industry,
          alum.current_company,
          alum.current_position,
          alum.location,
          alum.linkedin_url,
          alum.avatar_url,
        ].filter(Boolean).length;

        if (newScore > existingScore) {
          list[existingIdx] = alum;
        }
        continue;
      }
    }

    // Only merge by name when same person (same email). Different lines = different people.
    if (firstLast && firstLast.length > 3) {
      const existingIdx = seenByName.get(firstLast);
      if (existingIdx !== undefined) {
        const existing = list[existingIdx];
        const sameEmail =
          existing.email &&
          alum.email &&
          existing.email.toLowerCase().trim() === alum.email.toLowerCase().trim();
        const bothNoEmail = !existing.email?.trim() && !alum.email?.trim();
        // Merge only when same email (same person). Never merge two no-email records by name alone (could be different lines).
        if (sameEmail) {
          const existingScore = [
            existing.email,
            existing.industry,
            existing.current_company,
            existing.current_position,
            existing.location,
            existing.linkedin_url,
            existing.avatar_url,
          ].filter(Boolean).length;
          const newScore = [
            alum.email,
            alum.industry,
            alum.current_company,
            alum.current_position,
            alum.location,
            alum.linkedin_url,
            alum.avatar_url,
          ].filter(Boolean).length;

          if (newScore > existingScore) {
            list[existingIdx] = alum;
          }
          continue;
        }
        if (bothNoEmail) {
          // Different people (e.g. same name from different lines) — don't merge, fall through to push
        }
      }
    }

    seenById.add(id);
    if (email) seenByEmail.add(email);
    if (firstLast && firstLast.length > 3) {
      seenByName.set(firstLast, list.length);
    }
    list.push(alum);
  }

  const { data: profiles = [] } = await supabase
    .from("profiles")
    .select("user_id, email, crossing_year, chapter, line_order");

  type P = {
    user_id?: string;
    email?: string;
    crossing_year?: number | null;
    chapter?: string | null;
    line_order?: number | null;
  };

  const byUserId = new Map<string, P>(
    (profiles as P[]).map((p) => [p.user_id ?? "", p]),
  );
  const byEmail = new Map<string, P>(
    (profiles as P[]).map((p) => [p.email ?? "", p]),
  );

  const enriched = list.map((alum) => {
    const profile = (alum as { user_id?: string | null }).user_id
      ? byUserId.get((alum as { user_id: string }).user_id)
      : byEmail.get((alum as { email?: string }).email ?? "");

    const alumniCrossing = {
      crossing_year: (alum as { crossing_year?: number | null }).crossing_year,
      chapter: (alum as { chapter?: string | null }).chapter,
      line_order: (alum as { line_order?: number | null }).line_order,
    };

    const crossingSource =
      alumniCrossing.crossing_year != null ? alumniCrossing : profile ?? alumniCrossing;

    return {
      ...alum,
      crossing_display: formatCrossingDisplay(crossingSource ?? {}),
    };
  });

  // Dedupe by (line_label, line_order, full_name) so we show one person per line position (no duplicate names in same line)
  const toShortLineLabel = (label: string | null | undefined): string => {
    if (!label || !String(label).trim()) return "";
    const s = String(label).trim();
    const match = s.match(/^(SPRING|FALL|Spring|Fall)\s+(\d{4})/i);
    return match ? `${match[1].toUpperCase()} ${match[2]}` : s;
  };
  const normalizeNameFinal = (name: string | null | undefined): string => {
    if (!name) return "";
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/gi, "")
      .replace(/\b[a-z]\.\s*/g, "")
      .replace(/[^\w\s]/g, "")
      .trim();
  };
  const linePositionKey = (a: AlumniRecord): string => {
    const label = toShortLineLabel(a.line_label);
    const order = a.line_order ?? 0;
    const name = normalizeNameFinal(a.full_name);
    return `${label || "OTHER"}-${order}-${name}`;
  };
  const careerScore = (a: AlumniRecord): number =>
    [a.email, a.industry, a.current_company, a.current_position, a.location, a.linkedin_url, a.avatar_url].filter(
      (x) => x != null && String(x).trim() !== "",
    ).length;

  const byLinePosition = new Map<string, AlumniRecord>();
  for (const alum of enriched) {
    const key = linePositionKey(alum);
    const existing = byLinePosition.get(key);
    if (!existing || careerScore(alum) > careerScore(existing)) {
      byLinePosition.set(key, alum);
    }
  }

  return Array.from(byLinePosition.values());
}

