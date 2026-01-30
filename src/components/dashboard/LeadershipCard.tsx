import { GraduationCap, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { resolveAvatarUrl } from "@/lib/utils";
import { AlumniAvatar } from "@/components/AlumniAvatar";

type AdvisorAlumni = {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  industry?: string | null;
  crossing_year?: number | null;
  chapter?: string | null;
  line_order?: number | null;
};

type EBoardMember = {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  position?: string | null;
};

// Chapter Advisor names to display (deference order: alphabetical by last name)
const ADVISOR_NAMES = [
  "Abdullah Zaki",
  "Carnegie",
  "Demar",
  "Pawlos Germay",
  "Presley Nelson Jr",
];

// Match the intentional E-board ordering from the Members page
const EBOARD_ORDER: string[] = [
  "Bryce Perkins",
  "Mael Blunt",
  "Doole Gaiende Edwards",
  "Don Jordan Duplan",
  "Carsen Manuel",
  "Jeremiah Ramirez",
  "Grant Hill",
];

const EBOARD_TITLES: Record<string, string> = {
  "Bryce Perkins": "Polemarch",
  "Mael Blunt": "Vice Polemarch",
  "Doole Gaiende Edwards": "Keeper of Exchequer",
  "Don Jordan Duplan": "Keeper of Records",
  "Carsen Manuel": "Historian",
  "Jeremiah Ramirez": "Strategist",
  "Grant Hill": "Lt. Strategist",
};

export function LeadershipCard() {
  const { user } = useAuth();

  const { data: advisors = [], isLoading: advisorsLoading } = useQuery({
    queryKey: ["leadership-advisors"],
    queryFn: async () => {
      const orConditions = ADVISOR_NAMES.map(
        (name) => `full_name.ilike.%${name}%`,
      ).join(",");

      const { data, error } = await supabase
        .from("alumni")
        .select(
          "id, full_name, avatar_url, industry, crossing_year, chapter, line_order",
        )
        .or(orConditions);
      if (error) throw error;

      const advisorMap = new Map<string, AdvisorAlumni>();
      const seenIds = new Set<string>();

      (data ?? []).forEach((alum) => {
        if (!alum.id || seenIds.has(alum.id)) return;
        const matchedName = ADVISOR_NAMES.find((name) =>
          alum.full_name?.toLowerCase().includes(name.toLowerCase()),
        );
        if (matchedName) {
          const existing = advisorMap.get(matchedName);
          if (
            !existing ||
            (alum.full_name &&
              existing.full_name &&
              alum.full_name.length > existing.full_name.length)
          ) {
            advisorMap.set(matchedName, alum as AdvisorAlumni);
            seenIds.add(alum.id);
          }
        }
      });

      const list = ADVISOR_NAMES.map((name) =>
        advisorMap.get(name),
      ).filter((a): a is AdvisorAlumni => a !== undefined);

      return [...list].sort((a, b) => {
        const ay = a.crossing_year ?? 0;
        const by = b.crossing_year ?? 0;
        return ay - by;
      });
    },
    enabled: !!user,
  });

  const { data: eboardMembers = [], isLoading: eboardLoading } = useQuery({
    queryKey: ["leadership-eboard"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, avatar_url");

      if (profilesError) {
        throw profilesError;
      }

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("role", "e_board");

      if (rolesError) {
        throw rolesError;
      }

      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminUserIds = new Set(adminRoles?.map((r) => r.user_id) || []);

      const eboardUserIds = new Set(roles?.map((r) => r.user_id) || []);

      const members: EBoardMember[] =
        profiles
          ?.filter((p) => eboardUserIds.has((p as any).user_id) && !adminUserIds.has((p as any).user_id))
          .map((p) => ({
            id: p.id as string,
            full_name: (p as any).full_name,
            avatar_url: (p as any).avatar_url,
            position:
              EBOARD_TITLES[(p as any).full_name as string] ?? "Executive Board",
          })) || [];

      const normalize = (s: string | null | undefined) =>
        (s || "").toLowerCase().trim();

      const rankByOrder = (fullName: string | null | undefined) => {
        const i = EBOARD_ORDER.findIndex(
          (name) => normalize(name) === normalize(fullName),
        );
        return i >= 0 ? i : 9999;
      };

      return members.sort(
        (a, b) => rankByOrder(a.full_name) - rankByOrder(b.full_name),
      );
    },
    enabled: !!user,
  });

  const isLoading = advisorsLoading || eboardLoading;

  return (
    <div className="glass-card rounded-xl p-2.5 sm:p-3 animate-fade-in card-hover">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
          Chapter Leadership
        </h2>
      </div>

      {isLoading ? (
        <div className="grid gap-1.5 lg:grid-cols-2">
          {[1, 2].map((col) => (
            <div key={col} className="space-y-1">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-md bg-muted/50 animate-pulse"
                  style={{ animationDelay: `${i * 70}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-1.5 lg:grid-cols-2">
          {/* E-board column (left) */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="icon-container icon-container-primary">
                <Users className="w-4 h-4" strokeWidth={2} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Executive Board
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-1.5 gap-y-0.5">
              {(eboardMembers || []).map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/30 px-2 py-1.5"
                >
                  <Avatar className="w-12 h-12 border border-primary shrink-0">
                    <AvatarImage src={resolveAvatarUrl(member.avatar_url) || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-display">
                      {member.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "E"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 flex flex-col items-center text-center">
                    <p className="font-semibold text-xs leading-tight text-foreground truncate w-full">
                      {member.full_name}
                    </p>
                    {member.position && (
                      <p className="text-xs text-muted-foreground truncate w-full">
                        {member.position}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advisors column (right) */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="icon-container icon-container-primary">
                <GraduationCap className="w-4 h-4" strokeWidth={2} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Chapter Advisors
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-1.5 gap-y-0.5">
              {(advisors || []).map((alum) => (
                <div
                  key={alum.id}
                  className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/30 px-2 py-1.5"
                >
                  <AlumniAvatar alum={alum} className="w-12 h-12 border border-primary shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col items-center text-center">
                    <p className="font-semibold text-xs leading-tight text-foreground truncate w-full">
                      {alum.full_name}
                    </p>
                    <p className="text-xs leading-tight text-muted-foreground truncate w-full">
                      {alum.industry || "Chapter Advisor"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

