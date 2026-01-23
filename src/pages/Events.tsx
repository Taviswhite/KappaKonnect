import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Users, Clock, Plus, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isSameDay, subDays, subWeeks, subMonths, isAfter, isBefore } from "date-fns";
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
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    eventType: "all",
    dateRange: "all",
    location: "all",
  });
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty slots for days before the first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
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
    return filteredEvents.some((e) => isSameDay(parseISO(e.start_time), date));
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    // Event type filter
    if (filters.eventType !== "all" && event.event_type !== filters.eventType) {
      return false;
    }

    // Location filter
    if (filters.location !== "all") {
      if (filters.location === "virtual" && (!event.location || !event.location.toLowerCase().includes("virtual"))) {
        return false;
      }
      if (filters.location === "in_person" && (!event.location || event.location.toLowerCase().includes("virtual"))) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const eventDate = parseISO(event.start_time);
      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      switch (filters.dateRange) {
        case "upcoming":
          startDate = now;
          endDate = null; // No end date
          break;
        case "past":
          startDate = null;
          endDate = now;
          break;
        case "today":
          startDate = subDays(now, 1);
          endDate = null;
          break;
        case "week":
          startDate = subWeeks(now, 1);
          endDate = null;
          break;
        case "month":
          startDate = subMonths(now, 1);
          endDate = null;
          break;
        default:
          return true;
      }

      if (startDate && isBefore(eventDate, startDate)) {
        return false;
      }
      if (endDate && isAfter(eventDate, endDate)) {
        return false;
      }
    }

    return true;
  });

  const activeFiltersCount = 
    (filters.eventType !== "all" ? 1 : 0) +
    (filters.dateRange !== "all" ? 1 : 0) +
    (filters.location !== "all" ? 1 : 0);

  const clearFilters = () => {
    setFilters({ eventType: "all", dateRange: "all", location: "all" });
  };

  const selectedEvents = selectedDate 
    ? filteredEvents.filter((e) => isSameDay(parseISO(e.start_time), selectedDate))
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
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select value={filters.eventType} onValueChange={(value) => setFilters({ ...filters, eventType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="committee">Committee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="in_person">In Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <CreateEventDialog>
              <Button variant="hero" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </CreateEventDialog>
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
                        <RSVPButton eventId={event.id} />
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

// RSVP Button Component
function RSVPButton({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: rsvp } = useQuery({
    queryKey: ["rsvp", eventId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("rsvps")
        .select("status")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const rsvpMutation = useMutation({
    mutationFn: async (status: "going" | "maybe" | "not_going") => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("rsvps").upsert({
        user_id: user.id,
        event_id: eventId,
        status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rsvp", eventId] });
      toast.success("RSVP updated!");
    },
    onError: () => {
      toast.error("Failed to update RSVP");
    },
  });

  if (!user) return null;

  const handleRSVP = () => {
    if (!rsvp) {
      rsvpMutation.mutate("going");
    } else if (rsvp.status === "going") {
      rsvpMutation.mutate("maybe");
    } else if (rsvp.status === "maybe") {
      rsvpMutation.mutate("not_going");
    } else {
      rsvpMutation.mutate("going");
    }
  };

  const getRSVPButtonText = () => {
    if (!rsvp) return "RSVP";
    switch (rsvp.status) {
      case "going":
        return "✓ Going";
      case "maybe":
        return "? Maybe";
      case "not_going":
        return "✗ Not Going";
      default:
        return "RSVP";
    }
  };

  return (
    <Button 
      size="sm" 
      variant={rsvp?.status === "going" ? "hero" : "outline"} 
      onClick={handleRSVP}
    >
      {getRSVPButtonText()}
    </Button>
  );
}

export default Events;