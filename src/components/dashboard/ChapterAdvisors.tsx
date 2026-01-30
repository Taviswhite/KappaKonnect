import { useState } from "react";
import { ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { avatarUrlForAlumni } from "@/lib/utils";
import XScroll from "@/components/ui/x-scroll";

// Chapter Advisor names to display (deference order: alphabetical by last name)
const ADVISOR_NAMES = [
  "Abdullah Zaki",
  "Carnegie",
  "Demar",
  "Pawlos Germay",
  "Presley Nelson Jr",
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

const ADVISOR_CARD_CLASS =
  "shrink-0 w-[120px] flex flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-2.5 py-2.5";

function AdvisorCard({
  alum,
  index,
}: {
  alum: AdvisorAlumni;
  index: number;
}) {
  return (
    <div
      className={ADVISOR_CARD_CLASS}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Avatar className="w-10 h-10 border border-primary shrink-0">
        <AvatarImage src={avatarUrlForAlumni(alum) || undefined} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-display">
          {alum.full_name?.split(" ").map((n) => n[0]).join("") || "A"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 flex flex-col items-center text-center w-full">
        <p className="font-semibold text-xs text-foreground truncate w-full">
          {alum.full_name}
        </p>
        <p className="text-xs text-muted-foreground truncate w-full">
          {alum.industry || "Chapter Advisor"}
        </p>
      </div>
    </div>
  );
}

export function ChapterAdvisors() {
  const [expanded, setExpanded] = useState(false);
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
    <div className="glass-card rounded-xl px-2 py-2.5 sm:px-2 sm:py-3 animate-fade-in card-hover min-w-0 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
          Chapter Advisors
        </h2>
        {advisors.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground h-7 px-2 gap-1"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                View all <ChevronDown className="w-3 h-3" />
              </>
            )}
          </Button>
        )}
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
      ) : expanded ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-1 overflow-auto min-h-0 flex-1">
          {advisors.map((alum, index) => (
            <AdvisorCard key={alum.id} alum={alum} index={index} />
          ))}
        </div>
      ) : (
        <XScroll className="w-full overflow-x-auto min-h-[140px]">
          <div className="flex gap-2 pb-1">
            {advisors.map((alum, index) => (
              <AdvisorCard key={alum.id} alum={alum} index={index} />
            ))}
          </div>
        </XScroll>
      )}
    </div>
  );
}
