import { useState } from "react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import XScroll from "@/components/ui/x-scroll";

type EBoardMember = {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  crossing_year?: number | null;
  chapter?: string | null;
  line_order?: number | null;
  role: string;
  position?: string | null;
};

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

const CARD_CLASS =
  "flex flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-2.5 py-2.5";

function MemberCard({
  member,
  index,
}: {
  member: EBoardMember;
  index: number;
}) {
  return (
    <div
      className={cn("w-[120px] shrink-0", CARD_CLASS)}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Avatar className="w-10 h-10 border border-primary shrink-0">
        <AvatarImage src={member.avatar_url || undefined} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-display">
          {member.full_name?.split(" ").map((n) => n[0]).join("") || "E"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 flex flex-col items-center text-center w-full">
        <p className="font-semibold text-xs text-foreground truncate w-full">
          {member.full_name}
        </p>
        {member.position && (
          <p className="text-xs text-muted-foreground truncate w-full">
            {member.position}
          </p>
        )}
      </div>
    </div>
  );
}

export function EBoardCard() {
  const [expanded, setExpanded] = useState(false);
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["dashboard-eboard"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, avatar_url, crossing_year, chapter, line_order");

      if (profilesError) {
        console.error("Error loading profiles for E-board:", profilesError);
        throw profilesError;
      }

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("role", "e_board");

      if (rolesError) {
        console.error("Error loading roles for E-board:", rolesError);
        throw rolesError;
      }

      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminUserIds = new Set(adminRoles?.map((r) => r.user_id) || []);

      const eboardUserIds = new Set(roles?.map((r) => r.user_id) || []);

      const eboardMembers: EBoardMember[] =
        profiles
          ?.filter((p) => eboardUserIds.has((p as any).user_id) && !adminUserIds.has((p as any).user_id))
          .map((p) => ({
            id: p.id as string,
            full_name: (p as any).full_name,
            avatar_url: (p as any).avatar_url,
            crossing_year: (p as any).crossing_year,
            chapter: (p as any).chapter,
            line_order: (p as any).line_order,
            role: "E-Board",
            position: EBOARD_TITLES[(p as any).full_name as string] ?? "Executive Board",
          })) || [];

      const normalize = (s: string | null | undefined) =>
        (s || "").toLowerCase().trim();

      const rankByOrder = (fullName: string | null | undefined) => {
        const i = EBOARD_ORDER.findIndex((name) => normalize(name) === normalize(fullName));
        return i >= 0 ? i : 9999;
      };

      return eboardMembers.sort((a, b) => {
        const rankA = rankByOrder(a.full_name);
        const rankB = rankByOrder(b.full_name);
        if (rankA !== rankB) return rankA - rankB;

        const yearA = a.crossing_year ?? -1;
        const yearB = b.crossing_year ?? -1;
        if (yearB !== yearA) return yearB - yearA;

        const lineA = a.line_order ?? 999999;
        const lineB = b.line_order ?? 999999;
        return lineA - lineB;
      });
    },
  });

  return (
    <div className="glass-card rounded-xl p-2.5 sm:p-3 animate-fade-in card-hover h-full flex flex-col min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
          Executive Board
        </h2>
        {members.length > 0 && (
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

      <div className="flex-1 min-h-0 flex flex-col">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-muted/50 animate-pulse h-16"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="icon-container icon-container-muted mb-3">
              <Users className="w-6 h-6" strokeWidth={2} />
            </div>
            <p className="font-semibold text-foreground">No E-board members yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
              Assign members the E-board role to feature them here.
            </p>
          </div>
        ) : expanded ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-1 overflow-auto min-h-0">
            {members.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        ) : (
          <XScroll className="w-full overflow-x-auto min-h-[140px]">
            <div className="flex gap-2 pb-1">
              {members.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index} />
              ))}
            </div>
          </XScroll>
        )}
      </div>
    </div>
  );
}

