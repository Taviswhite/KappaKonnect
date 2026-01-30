import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, GraduationCap } from "lucide-react";
import { formatCrossingDisplay, avatarUrlForAlumni } from "@/lib/utils";
import { AlumniAvatar } from "@/components/AlumniAvatar";
import { CreateAlumniDialog } from "@/components/dialogs/CreateAlumniDialog";
import { FeaturedAlumni } from "@/components/dashboard/FeaturedAlumni";
import { useQuery } from "@tanstack/react-query";
import { fetchAlumniList } from "@/lib/alumni-data";
import { useAuth } from "@/contexts/AuthContext";

type AlumniRow = {
  id: string;
  full_name: string | null;
  industry?: string | null;
  graduation_year?: number | null;
  crossing_year?: number | null;
  crossing_display?: string | null;
  line_label?: string | null;
  line_order?: number | null;
  [k: string]: unknown;
};

// Line filter options: "All lines" plus every line that has at least one member (so filter never shows empty)
function getLineFilterOptions(alumni: { line_label?: string | null }[]): string[] {
  const toShort = (label: string | null | undefined): string => {
    if (!label || !String(label).trim()) return "";
    const s = String(label).trim();
    const m = s.match(/^(SPRING|FALL|Spring|Fall)\s+(\d{4})/i);
    return m ? `${m[1].toUpperCase()} ${m[2]}` : s;
  };
  const yearFrom = (label: string): number => {
    const n = label.match(/\b(19|20)\d{2}\b/);
    return n ? parseInt(n[0], 10) : 0;
  };
  const labels = new Set<string>();
  for (const a of alumni) {
    const short = toShort(a.line_label);
    if (short) labels.add(short);
  }
  return ["All lines", ...Array.from(labels).sort((a, b) => yearFrom(b) - yearFrom(a))];
}

const Alumni = () => {
  const [search, setSearch] = useState("");
  const [lineFilter, setLineFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();

  const canAddAlumni = hasRole("admin") || hasRole("alumni");

  // Fetch alumni from database using shared helper (keeps counts in sync with dashboard)
  const { data: alumni = [], isLoading, error: alumniError } = useQuery({
    queryKey: ["alumni"],
    queryFn: () => fetchAlumniList(user),
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

  // Display graduation year:
  // - For most alumni: use stored graduation_year if valid (>= 1900), otherwise show nothing.
  // - For older lines (Spring 2016 and earlier): if graduation_year is missing/0,
  //   assume grad year is crossing_year + 1.
  const getDisplayGraduationYear = (alum: {
    graduation_year?: number | null;
    crossing_year?: number | null;
  }): number | undefined => {
    const gy = alum.graduation_year ?? null;
    if (gy && gy >= 1900) return gy;
    const cy = alum.crossing_year ?? null;
    // Only apply fallback for Spring 2016 and earlier
    if (cy && cy >= 1900 && cy <= 2016) return cy + 1;
    return undefined;
  };


  return (
    <AppLayout>
      <div className="space-y-8 sm:space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Alumni Portal
            </h1>
          </div>
          {canAddAlumni && (
            <CreateAlumniDialog>
              <Button variant="hero" size="sm">Add Alumni</Button>
            </CreateAlumniDialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 text-center card-hover">
            <p className="text-2xl sm:text-3xl font-display font-bold gradient-text">{totalAlumni}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Alumni</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center card-hover">
            <p className="text-2xl sm:text-3xl font-display font-bold gradient-text">{activeMentors}</p>
            <p className="text-xs text-muted-foreground mt-1">With LinkedIn</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center card-hover">
            <p className="text-2xl sm:text-3xl font-display font-bold gradient-text">
              {new Set(alumni.map((a) => a.industry).filter(Boolean)).size}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Industries</p>
          </div>
        </div>

        {/* Featured Alumni */}
        <section>
          <FeaturedAlumni variant="Featured Alumni" />
        </section>

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

        {/* Search + Line filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
            <Input
              placeholder="Search alumni by name, industry, location..."
              className="pl-10 w-full bg-muted/40 border-border rounded-xl h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={lineFilter} onValueChange={setLineFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl bg-muted/40 border-border">
              <SelectValue placeholder="Filter by line" />
            </SelectTrigger>
            <SelectContent>
              {getLineFilterOptions(alumni).map((opt) => (
                <SelectItem key={opt} value={opt === "All lines" ? "all" : opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Alumni list */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-muted/50 animate-pulse"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          ) : alumniError ? (
            <div className="glass-card rounded-xl p-12 text-center border-destructive border-2">
              <p className="text-destructive font-semibold mb-2">Error loading alumni</p>
              <p className="text-sm text-muted-foreground">{alumniError.message}</p>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <div className="icon-container icon-container-muted mx-auto mb-4">
                <GraduationCap className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">No Alumni Found</h3>
              <p className="text-sm text-muted-foreground">
                {search ? "Try a different search term" : "No alumni profiles yet"}
              </p>
            </div>
          ) : (
            groupedByLine.map(([lineLabel, group]) => (
              <div key={lineLabel} className="space-y-4">
                <h3 className="text-xl font-display font-bold text-foreground border-b border-border pb-2">
                  {lineLabel}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.map((alum, index) => {
                    const gy = getDisplayGraduationYear(alum as { graduation_year?: number | null; crossing_year?: number | null });
                    const crossing = (alum as { crossing_display?: string | null }).crossing_display;
                    return (
                      <div
                        key={alum.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/alumni/${alum.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(`/alumni/${alum.id}`);
                          }
                        }}
                        className="glass-card rounded-xl p-6 hover:scale-[1.02] transition-all cursor-pointer animate-fade-in card-hover"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <AlumniAvatar alum={alum} className="w-16 h-16 border-2 border-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-bold text-lg text-foreground truncate">
                              {alum.full_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {crossing && (
                                <Badge variant="outline" className="text-xs font-medium">
                                  {crossing}
                                </Badge>
                              )}
                              {gy != null && gy >= 1900 && (
                                <Badge variant="outline" className="text-xs bg-muted/50">
                                  Class of {gy}
                                </Badge>
                              )}
                            </div>
                            {alum.industry && (
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                                  {alum.industry}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Alumni;
