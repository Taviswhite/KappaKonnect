import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isSameDay } from "date-fns";
import { CreateEventDialog } from "@/components/dialogs/CreateEventDialog";
import { useAuth } from "@/contexts/AuthContext";

const typeColors = {
  meeting: "bg-primary/20 text-primary border-primary/30",
  service: "bg-green-500/20 text-green-400 border-green-500/30",
  social: "bg-accent/20 text-accent border-accent/30",
  executive: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Events = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch events from database
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["all-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      // Check if already RSVP'd
      const { data: existing } = await supabase
        .from("rsvps")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();
      
      if (existing) {
        throw new Error("You've already RSVP'd to this event");
      }

      const { error } = await supabase.from("rsvps").insert({
        event_id: eventId,
        user_id: user.id,
        status: "going",
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("RSVP confirmed!");
      queryClient.invalidateQueries({ queryKey: ["rsvps"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }

    return days;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDateFromDay = (day: number) => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
  };

  const hasEvent = (day: number) => {
    const date = getDateFromDay(day);
    return events.some((e) => isSameDay(parseISO(e.start_time), date));
  };

  const selectedEvents = selectedDate 
    ? events.filter((e) => isSameDay(parseISO(e.start_time), selectedDate))
    : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Events</h1>
            <p className="text-muted-foreground mt-1">Manage and track chapter events</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => toast.info("Filter options coming soon!")}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <CreateEventDialog />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
              {getDaysInMonth(currentDate).map((day, index) => {
                const isSelected = day && selectedDate && isSameDay(getDateFromDay(day), selectedDate);
                return (
                  <button
                    key={index}
                    onClick={() => day && setSelectedDate(getDateFromDay(day))}
                    disabled={!day}
                    className={cn(
                      "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative",
                      !day && "invisible",
                      isSelected
                        ? "bg-primary text-primary-foreground glow-primary"
                        : day
                        ? "hover:bg-secondary"
                        : "",
                      day && hasEvent(day) && !isSelected && "bg-primary/10"
                    )}
                  >
                    {day}
                    {day && hasEvent(day) && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Events */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-display font-bold mb-4">
              {selectedDate
                ? format(selectedDate, "EEEE, MMMM d")
                : "Select a date"}
            </h3>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-secondary/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : selectedEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedEvents.map((event) => {
                  const eventType = event.event_type || "meeting";
                  return (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs capitalize", typeColors[eventType as keyof typeof typeColors] || typeColors.meeting)}
                        >
                          {eventType}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(event.start_time), "h:mm a")}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-end mt-4">
                        <Button 
                          size="sm" 
                          variant="hero" 
                          onClick={() => rsvpMutation.mutate(event.id)}
                          disabled={rsvpMutation.isPending}
                        >
                          {rsvpMutation.isPending ? "..." : "RSVP"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No events scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Events;
