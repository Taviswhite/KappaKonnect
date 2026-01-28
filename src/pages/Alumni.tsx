import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Mail, Linkedin, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { formatCrossingDisplay, avatarUrlForAlumni } from "@/lib/utils";
import { CreateAlumniDialog } from "@/components/dialogs/CreateAlumniDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Alumni = () => {
  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState<string>("all");
  const { hasRole, user } = useAuth();

  // Check if user can add alumni (admin or alumni role)
  const canAddAlumni = hasRole("admin") || hasRole("alumni");

  // Fetch alumni from database (alumni table), enrich with crossing display from profiles
  const { data: alumni = [], isLoading, error: alumniError } = useQuery({
    queryKey: ["alumni"],
    queryFn: async () => {
      if (!user) {
        console.warn("User not authenticated - RLS will block query");
        return [];
      }
      
      const { data, error } = await supabase
        .from("alumni")
        .select("*")
        .order("graduation_year", { ascending: false });
      
      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === "42P01") {
          console.warn("Alumni table does not exist");
          return [];
        }
        // RLS policy violation
        if (error.code === "42501" || error.message?.includes("permission denied")) {
          console.error("RLS policy blocked query. User:", user.id);
          throw new Error("Permission denied. Make sure you're logged in.");
        }
        console.error("Error fetching alumni:", error);
        throw error;
      }
      
      // Deduplicate by multiple criteria: ID (primary), email, or normalized name
      // Keep the most complete record (prefer records with email, then with more fields)
      const seenById = new Set<string>();
      const seenByEmail = new Set<string>();
      const seenByName = new Map<string, number>(); // normalized name -> index of best record
      
      // Normalize name for comparison (lowercase, remove extra spaces, remove common suffixes, remove middle initials)
      const normalizeName = (name: string | null | undefined): string => {
        if (!name) return "";
        return name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, " ")
          .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/gi, "")
          .replace(/\b[a-z]\.\s*/g, "") // Remove middle initials like "John A. Smith" -> "John Smith"
          .replace(/[^\w\s]/g, "") // Remove punctuation
          .trim();
      };
      
      // Extract first and last name for better matching
      const getFirstLast = (normalizedName: string): string => {
        const parts = normalizedName.split(/\s+/).filter(p => p.length > 0);
        if (parts.length === 0) return "";
        if (parts.length === 1) return parts[0];
        // Return first and last name only
        return `${parts[0]} ${parts[parts.length - 1]}`;
      };
      
      const list: typeof data = [];
      
      for (const alum of (data || [])) {
        const id = alum.id;
        const email = alum.email?.toLowerCase().trim() || null;
        const normalizedName = normalizeName(alum.full_name);
        const firstLast = getFirstLast(normalizedName);
        
        // Skip if we've already seen this exact ID
        if (seenById.has(id)) continue;
        
        // Check for duplicate by email (strictest match)
        if (email && seenByEmail.has(email)) {
          const existingIdx = list.findIndex(a => a.email?.toLowerCase().trim() === email);
          if (existingIdx >= 0) {
            const existing = list[existingIdx];
            // Keep the one with more complete data
            const existingScore = [
              existing.email, existing.industry, existing.current_company,
              existing.current_position, existing.location, existing.linkedin_url, existing.avatar_url
            ].filter(Boolean).length;
            const newScore = [
              alum.email, alum.industry, alum.current_company,
              alum.current_position, alum.location, alum.linkedin_url, alum.avatar_url
            ].filter(Boolean).length;
            
            if (newScore > existingScore) {
              list[existingIdx] = alum; // Replace with more complete record
            }
            continue; // Skip this duplicate
          }
        }
        
        // Check for duplicate by normalized name (first + last name match)
        if (firstLast && firstLast.length > 3) { // Only check if we have a meaningful name
          const existingIdx = seenByName.get(firstLast);
          if (existingIdx !== undefined) {
            const existing = list[existingIdx];
            // If both have emails and they're different, don't consider them duplicates
            if (existing.email && alum.email && 
                existing.email.toLowerCase().trim() !== alum.email.toLowerCase().trim()) {
              // Different emails, treat as different people
            } else {
              // Same name, keep the more complete record
              const existingScore = [
                existing.email, existing.industry, existing.current_company,
                existing.current_position, existing.location, existing.linkedin_url, existing.avatar_url
              ].filter(Boolean).length;
              const newScore = [
                alum.email, alum.industry, alum.current_company,
                alum.current_position, alum.location, alum.linkedin_url, alum.avatar_url
              ].filter(Boolean).length;
              
              if (newScore > existingScore) {
                list[existingIdx] = alum; // Replace with more complete record
              }
              continue; // Skip this duplicate
            }
          }
        }
        
        // Add this record (not a duplicate)
        seenById.add(id);
        if (email) seenByEmail.add(email);
        if (firstLast && firstLast.length > 3) {
          seenByName.set(firstLast, list.length);
        }
        list.push(alum);
      }

      // Get crossing info from profiles (match by user_id or email)
      const { data: profiles = [] } = await supabase
        .from("profiles")
        .select("user_id, email, crossing_year, chapter, line_order");
      type P = { user_id?: string; email?: string; crossing_year?: number | null; chapter?: string | null; line_order?: number | null };
      const byUserId = new Map<string, P>((profiles as P[]).map((p) => [p.user_id ?? "", p]));
      const byEmail = new Map<string, P>((profiles as P[]).map((p) => [p.email ?? "", p]));

      const enriched = list.map((alum) => {
        const profile = (alum as { user_id?: string | null }).user_id
          ? byUserId.get((alum as { user_id: string }).user_id)
          : byEmail.get((alum as { email?: string }).email ?? "");
        // Use profile crossing if matched; otherwise use alumni's own crossing_year/chapter/line_order (older members)
        const crossingSource = profile ?? {
          crossing_year: (alum as { crossing_year?: number | null }).crossing_year,
          chapter: (alum as { chapter?: string | null }).chapter,
          line_order: (alum as { line_order?: number | null }).line_order,
        };
        return {
          ...alum,
          crossing_display: formatCrossingDisplay(crossingSource ?? {}),
        };
      });

      // Final deduplication pass after enrichment (in case merging created duplicates)
      const finalSeen = new Set<string>();
      const finalList: typeof enriched = [];
      
      // Reuse normalizeName function for final pass
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
      
      for (const alum of enriched) {
        const emailKey = alum.email?.toLowerCase().trim();
        const nameKey = normalizeNameFinal(alum.full_name);
        const key = emailKey || `${nameKey}-${alum.id}`;
        
        if (!finalSeen.has(key)) {
          finalSeen.add(key);
          finalList.push(alum);
        }
      }
      
      return finalList;
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  // Normalize line_label to short form only (e.g. SPRING 2022, FALL 2023) — strips " - ..." descriptive names, dedupes
  const toShortLineLabel = (label: string | null | undefined): string => {
    if (!label || !String(label).trim()) return "";
    const s = String(label).trim();
    const match = s.match(/^(SPRING|FALL|Spring|Fall)\s+(\d{4})/i);
    return match ? `${match[1].toUpperCase()} ${match[2]}` : s;
  };
  const yearFromLineLabel = (label: string): number => {
    const m = label.match(/\b(19|20)\d{2}\b/);
    return m ? parseInt(m[0], 10) : 0;
  };
  const shortLabels = (alumni || [])
    .map((a) => toShortLineLabel((a as { line_label?: string | null }).line_label))
    .filter(Boolean);
  const lineLabels = [...new Set(shortLabels)] as string[];
  lineLabels.sort((a, b) => yearFromLineLabel(a) - yearFromLineLabel(b));

  // Filter alumni by search and by line (match on normalized short label)
  const filteredAlumni = (alumni || []).filter((alum) => {
    const crossing = (alum as { crossing_display?: string }).crossing_display?.toLowerCase() ?? "";
    const matchesSearch =
      alum.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      alum.email?.toLowerCase().includes(search.toLowerCase()) ||
      crossing.includes(search.toLowerCase()) ||
      alum.current_company?.toLowerCase().includes(search.toLowerCase()) ||
      alum.current_position?.toLowerCase().includes(search.toLowerCase()) ||
      alum.industry?.toLowerCase().includes(search.toLowerCase()) ||
      alum.location?.toLowerCase().includes(search.toLowerCase()) ||
      (toShortLineLabel((alum as { line_label?: string }).line_label)?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const shortLabel = toShortLineLabel((alum as { line_label?: string | null }).line_label);
    const matchesLine = lineFilter === "all" || shortLabel === lineFilter;
    return matchesSearch && matchesLine;
  });

  // Group by normalized short line label; section headers show short form only (no descriptive names)
  const groupedByLine = lineFilter === "all"
    ? (() => {
        const map = new Map<string, typeof filteredAlumni>();
        for (const alum of filteredAlumni) {
          const label = toShortLineLabel((alum as { line_label?: string | null }).line_label) || "Other";
          if (!map.has(label)) map.set(label, []);
          map.get(label)!.push(alum);
        }
        return Array.from(map.entries())
          .map(([label, group]) => [label, [...group].sort((a, b) => ((a as { line_order?: number | null }).line_order ?? 0) - ((b as { line_order?: number | null }).line_order ?? 0))] as [string, typeof filteredAlumni])
          .sort(([a], [b]) => yearFromLineLabel(b) - yearFromLineLabel(a)); // newest first
      })()
    : [[lineFilter, [...filteredAlumni].sort((a, b) => ((a as { line_order?: number | null }).line_order ?? 0) - ((b as { line_order?: number | null }).line_order ?? 0))]] as [string, typeof filteredAlumni][];

  // Calculate stats
  const totalAlumni = alumni.length;
  const activeMentors = alumni.filter((a) => a.linkedin_url).length;
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Alumni Portal</h1>
            <p className="text-muted-foreground mt-1">Connect with brothers who came before</p>
          </div>
          {canAddAlumni && (
            <CreateAlumniDialog>
              <Button variant="hero" size="sm">
                Add Alumni
              </Button>
            </CreateAlumniDialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold gradient-text">{totalAlumni}</p>
            <p className="text-sm text-muted-foreground">Total Alumni</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold gradient-text">{activeMentors}</p>
            <p className="text-sm text-muted-foreground">With LinkedIn</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold gradient-text">
              {new Set(alumni.map((a) => a.industry).filter(Boolean)).size}
            </p>
            <p className="text-sm text-muted-foreground">Industries</p>
          </div>
        </div>

        {!user && (
          <div className="glass-card rounded-xl p-6 border-yellow-500/30 border-2 bg-yellow-500/10">
            <p className="text-yellow-600 dark:text-yellow-400 font-semibold mb-2">
              ⚠️ Please log in to view alumni
            </p>
            <p className="text-sm text-muted-foreground">
              The alumni directory requires authentication. Please sign in to view alumni profiles.
            </p>
          </div>
        )}

        {/* Alumni directory + controls - full-width, responsive */}
        <div className="grid grid-cols-1 gap-6">
          {/* Alumni Directory */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search alumni..."
                  className="pl-10 bg-secondary/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={lineFilter} onValueChange={setLineFilter}>
                <SelectTrigger className="w-full sm:w-[280px]" aria-label="Filter by line">
                  <Filter className="w-4 h-4 mr-2 shrink-0" />
                  <SelectValue placeholder="Filter by line" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All lines</SelectItem>
                  {lineLabels.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card rounded-xl p-6 h-32 bg-secondary/30 animate-pulse" />
                ))}
              </div>
            ) : alumniError ? (
              <div className="glass-card rounded-xl p-12 text-center border-destructive border-2">
                <p className="text-destructive font-semibold mb-2">Error loading alumni</p>
                <p className="text-sm text-muted-foreground">{alumniError.message}</p>
                <p className="text-xs text-muted-foreground mt-2">Check browser console for details</p>
              </div>
            ) : filteredAlumni.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">No Alumni Found</h3>
                <p className="text-muted-foreground mb-2">
                  {search ? "Try a different search term" : "No alumni profiles yet"}
                </p>
                {!search && alumni.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Add alumni via the button above or run migrations to seed historic lines.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {groupedByLine.map(([lineLabel, group]) => (
                  <div key={lineLabel} className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                      {lineLabel}
                    </h3>
                    <div className="space-y-4">
                      {group.map((alum, index) => (
                        <div
                          key={alum.id}
                          className="glass-card rounded-xl p-6 hover:scale-[1.01] transition-all animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="w-16 h-16 border-2 border-primary">
                              <AvatarImage src={avatarUrlForAlumni(alum) || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground font-display">
                                {alum.full_name?.split(" ").map((n: string) => n[0]).join("") || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-display font-bold text-lg text-foreground">{alum.full_name}</h3>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {(alum as { crossing_display?: string | null }).crossing_display && (
                                      <Badge variant="outline" className="text-xs font-medium">
                                        {(alum as { crossing_display: string }).crossing_display}
                                      </Badge>
                                    )}
                                    {alum.graduation_year && (
                                      <Badge variant="outline" className="text-xs bg-secondary/50">
                                        <GraduationCap className="w-3 h-3 mr-1" />
                                        Class of {alum.graduation_year}
                                      </Badge>
                                    )}
                                    {alum.linkedin_url && (
                                      <Badge variant="outline" className="text-xs bg-accent/20 text-accent border-accent/30">
                                        Available
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {alum.email && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => window.location.href = `mailto:${alum.email}`}
                                    >
                                      <Mail className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {alum.linkedin_url ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => window.open(alum.linkedin_url!, "_blank")}
                                      title="Open LinkedIn profile"
                                    >
                                      <Linkedin className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(alum.full_name ?? "")}`, "_blank")}
                                      title="Find on LinkedIn"
                                    >
                                      <Search className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="mt-3 space-y-2">
                                {/* Career Information - Industry Only */}
                                {alum.industry && (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-medium">
                                      {alum.industry}
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* Contact & Location */}
                                <div className="space-y-1 text-sm">
                                  {alum.email && (
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="w-4 h-4 shrink-0" />
                                      <span className="text-foreground">{alum.email}</span>
                                    </p>
                                  )}
                                  {alum.location && (
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                      <MapPin className="w-4 h-4 shrink-0" />
                                      <span className="text-foreground">{alum.location}</span>
                                    </p>
                                  )}
                                  {alum.degree && (
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                      <GraduationCap className="w-4 h-4 shrink-0" />
                                      <span className="text-foreground">{alum.degree}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Alumni;
