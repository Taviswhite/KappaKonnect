import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function NextEventCard() {
  const navigate = useNavigate();

  const { data: event, isLoading } = useQuery({
    queryKey: ["next-event-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_time, location, event_type")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in card-hover h-full min-h-[140px] flex flex-col">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-5">
          Next Event
        </h2>
        <div className="flex-1 rounded-xl bg-muted/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in card-hover h-full flex flex-col">
      <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-5">
        Next Event
      </h2>
      {event ? (
        <div
          onClick={() => navigate("/events")}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl cursor-pointer card-press",
            "bg-primary/5 border border-primary/20",
            "shadow-[0_0_20px_hsl(var(--primary)/0.12)]"
          )}
        >
          <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 bg-primary/15 border border-primary/20">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">
              {format(new Date(event.start_time), "MMM")}
            </span>
            <span className="text-base font-bold text-primary -mt-0.5">
              {format(new Date(event.start_time), "d")}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{event.title}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={2} />
                {format(new Date(event.start_time), "h:mm a")}
              </span>
              {event.location && (
                <span className="flex items-center gap-1 truncate max-w-[160px]">
                  <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                  <span className="truncate">{event.location}</span>
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0">
            View
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
          <div className="icon-container icon-container-muted mb-2">
            <Calendar className="w-6 h-6" strokeWidth={2} />
          </div>
          <p className="font-semibold text-foreground">No upcoming events</p>
          <p className="text-xs text-muted-foreground mt-1">Schedule one from Quick Actions</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigate("/events")}
          >
            Go to Events
          </Button>
        </div>
      )}
    </div>
  );
}
