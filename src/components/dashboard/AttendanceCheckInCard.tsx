import { CalendarCheck2, QrCode, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function AttendanceCheckInCard() {
  const navigate = useNavigate();

  const { data: event, isLoading } = useQuery({
    queryKey: ["next-event-attendance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_time, location")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in card-hover h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
            Attendance Check-In
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Quickly check in members for your next event.
          </p>
        </div>
        <div className="icon-container icon-container-primary">
          <CalendarCheck2 className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 rounded-xl bg-muted/50 animate-pulse" />
      ) : event ? (
        <div className="flex-1 flex flex-col gap-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <p className="font-semibold text-foreground truncate">{event.title}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                {format(new Date(event.start_time), "EEE, MMM d • h:mm a")}
              </p>
              {event.location && (
                <p className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" strokeWidth={2} />
                  <span className="truncate">{event.location}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-auto flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              onClick={() => navigate("/attendance")}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Open check-in
            </Button>
            <Button
              variant="outline"
              className="sm:w-auto"
              onClick={() => navigate("/events")}
            >
              Manage events
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
          <div className="icon-container icon-container-muted mb-2">
            <CalendarCheck2 className="w-6 h-6" strokeWidth={2} />
          </div>
          <p className="font-semibold text-foreground">No upcoming events</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Create an event first, then you&apos;ll be able to check members in here.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigate("/events")}
          >
            Create event
          </Button>
        </div>
      )}
    </div>
  );
}

