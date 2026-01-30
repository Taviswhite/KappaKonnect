import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { avatarUrlForAlumni, formatCrossingDisplay } from "@/lib/utils";

type FeaturedAlumniRow = {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  industry?: string | null;
  crossing_year?: number | null;
  chapter?: string | null;
  line_order?: number | null;
  is_featured?: boolean | null;
};

export function FeaturedAlumni() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: featured = [], isLoading } = useQuery({
    queryKey: ["alumni-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumni")
        .select("id, full_name, avatar_url, industry, crossing_year, chapter, line_order, is_featured")
        .eq("is_featured", true)
        .order("crossing_year", { ascending: false });

      if (error) {
        console.error("Error loading featured alumni:", error);
        throw error;
      }

      return (data ?? []) as FeaturedAlumniRow[];
    },
    enabled: !!user,
  });

  const entries = featured;

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in card-hover">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
          Featured Alumni
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => navigate("/alumni")}
        >
          View all
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-muted/50 animate-pulse h-20"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="icon-container icon-container-primary mb-3">
            <GraduationCap className="w-6 h-6" strokeWidth={2} />
          </div>
          <p className="font-semibold text-foreground">Featured Alumni</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
            Featured alumni will appear here once added by leadership.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {entries.map((row, index) => {
            const crossing = formatCrossingDisplay({
              crossing_year: row.crossing_year,
              chapter: row.chapter,
              line_order: row.line_order,
            });
            return (
              <button
                key={row.id}
                onClick={() => navigate(`/alumni/${row.id}`)}
                className="rounded-xl border border-border bg-muted/30 hover:bg-muted/50 p-3 flex flex-col items-center gap-2 card-hover card-press text-center transition-colors duration-150"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar className="w-12 h-12 border-2 border-primary shrink-0">
                  <AvatarImage src={avatarUrlForAlumni(row) || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-display">
                    {row.full_name?.split(" ").map((n) => n[0]).join("") || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm text-foreground truncate w-full">
                  {row.full_name}
                </span>
                {crossing && (
                  <Badge variant="outline" className="text-xs font-medium bg-muted/50">
                    {crossing}
                  </Badge>
                )}
                {row.industry ? (
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                    {row.industry}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Featured</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
