import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { avatarUrlForAlumni } from "@/lib/utils";

// Chapter Advisor names to display
const ADVISOR_NAMES = [
  "Presley Nelson Jr",
  "Demar",
  "Innocent",
  "Pawlos Germay",
  "Carnegie"
];

type AdvisorAlumni = {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  industry?: string | null;
  crossing_year?: number | null;
  chapter?: string | null;
  line_order?: number | null;
};

export function ChapterAdvisors() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: advisors = [], isLoading } = useQuery({
    queryKey: ["alumni-advisors"],
    queryFn: async () => {
      // Build OR conditions for case-insensitive name matching
      const orConditions = ADVISOR_NAMES.map(name => `full_name.ilike.%${name}%`).join(",");
      
      const { data, error } = await supabase
        .from("alumni")
        .select("id, full_name, avatar_url, industry, crossing_year, chapter, line_order")
        .or(orConditions);
      if (error) throw error;
      
      // Filter to ensure we only get exact matches (case-insensitive) and remove duplicates
      // Use a Map to track the best match for each advisor name
      const advisorMap = new Map<string, AdvisorAlumni>();
      const seenIds = new Set<string>();
      
      (data ?? []).forEach((alum) => {
        if (!alum.id || seenIds.has(alum.id)) return;
        
        // Find which advisor name this matches
        const matchedName = ADVISOR_NAMES.find((name) =>
          alum.full_name?.toLowerCase().includes(name.toLowerCase())
        );
        
        if (matchedName) {
          // If we haven't seen this advisor name yet, or if this is a better match (fuller name)
          const existing = advisorMap.get(matchedName);
          if (!existing || 
              (alum.full_name && existing.full_name && 
               alum.full_name.length > existing.full_name.length)) {
            advisorMap.set(matchedName, alum as AdvisorAlumni);
            seenIds.add(alum.id);
          }
        }
      });
      
      // Build list in ADVISOR_NAMES order, then sort by deference (seniority): oldest line first
      const list = ADVISOR_NAMES.map(name => advisorMap.get(name)).filter((alum): alum is AdvisorAlumni => alum !== undefined);
      return [...list].sort((a, b) => {
        const ay = a.crossing_year ?? 0;
        const by = b.crossing_year ?? 0;
        return ay - by;
      });
    },
    enabled: !!user,
  });

  return (
    <div className="glass-card rounded-xl p-2.5 sm:p-3 animate-fade-in card-hover">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-display font-bold text-foreground">
          Chapter Advisors
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] text-muted-foreground h-7 px-2"
          onClick={() => navigate("/alumni")}
        >
          View all
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-muted/50 animate-pulse h-16"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      ) : advisors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="icon-container icon-container-primary mb-3">
            <GraduationCap className="w-6 h-6" strokeWidth={2} />
          </div>
          <p className="font-semibold text-foreground">Chapter Advisors</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
            Chapter advisors will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {advisors.map((alum, index) => (
            <div
              key={alum.id}
              className="w-full flex flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-2.5 py-2.5"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <Avatar className="w-8 h-8 border border-primary shrink-0">
                <AvatarImage src={avatarUrlForAlumni(alum) || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-display">
                  {alum.full_name?.split(" ").map((n) => n[0]).join("") || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 flex flex-col items-center text-center">
                <p className="font-semibold text-xs text-foreground truncate w-full">
                  {alum.full_name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate w-full">
                  {alum.industry || "Chapter Advisor"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
