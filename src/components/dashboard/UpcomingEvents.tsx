import { Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MiniCalendar } from "@/components/ui/mini-calendar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay } from "date-fns";
import { useMemo, useState } from "react";

const typeColors: Record<string, string> = {
  meeting: "bg-primary/20 text-primary border-primary/30",
  service: "bg-green-500/20 text-green-400 border-green-500/30",
  social: "bg-accent/20 text-accent border-accent/30",
  executive: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

type EventRow = { id: string; title?: string | null; start_time: string; event_type?: string | null; location?: string | null };

function ClosestEventCard({
  event,
  typeColors: colors,
  onViewAll,
}: {
  event: EventRow;
  typeColors: Record<string, string>;
  onViewAll: () => void;
}) {
  const eventDate = new Date(event.start_time);
  const eventType = (event.event_type || "meeting") as keyof typeof typeColors;
  return (
    <div
      onClick={onViewAll}
      className={cn(
        "flex items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl transition-all duration-150 cursor-pointer group card-press",
        "bg-primary/5 border border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.12)]"
      )}
    >
      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 bg-primary/15 border border-primary/20">
        <span className="text-xs font-medium uppercase text-muted-foreground leading-tight">
          {format(eventDate, "MMM")}
        </span>
        <span className="text-base font-bold leading-tight -mt-0.5 text-primary">
          {format(eventDate, "d")}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-0.5">
          <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
            {event.title}
          </h3>
          <Badge
            variant="outline"
            className={cn(
              "text-xs capitalize w-fit",
              colors[eventType] || colors.meeting
            )}
          >
            {eventType}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={2} />
            {format(eventDate, "h:mm a")}
          </span>
          {event.location && (
            <span className="flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">
              <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
      >
        RSVP
      </Button>
    </div>
  );
}

export function UpcomingEvents() {
  const navigate = useNavigate();
  // Start with no date filter so users see upcoming events immediately.
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const eventDates = useMemo(
    () =>
      new Set(
        events.map((e) => format(new Date(e.start_time), "yyyy-MM-dd"))
      ),
    [events]
  );

  const filteredByDate = useMemo(
    () =>
      selectedDate
        ? events.filter((e) =>
            isSameDay(new Date(e.start_time), selectedDate)
          )
        : events
  );
  const closestEvent = filteredByDate[0] ?? null;

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in card-hover">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
          Upcoming Events
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => navigate("/events")}
        >
          View All
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)] items-start">
          <div className="rounded-xl bg-muted/50 animate-pulse h-64" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-muted/50 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="icon-container icon-container-muted mb-3">
            <CalendarIcon className="w-6 h-6" strokeWidth={2} />
          </div>
          <p className="font-semibold text-foreground text-sm">No upcoming events</p>
          <p className="text-xs text-muted-foreground mt-1">
            Events will appear here once created
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)] items-start">
          <div className="rounded-xl border border-border bg-muted/20 p-2 sm:p-3 w-full max-w-[350px]">
            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              eventDates={eventDates}
            />
          </div>

          <div className="space-y-3">
            {closestEvent ? (
              <ClosestEventCard
                event={closestEvent}
                typeColors={typeColors}
                onViewAll={() => navigate("/events")}
              />
            ) : selectedDate ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No events on this day. Try another date or view all events.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
