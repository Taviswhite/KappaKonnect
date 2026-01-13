import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Users, Clock, Plus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const events = [
  {
    id: 1,
    title: "Chapter Meeting",
    date: "2026-01-15",
    time: "7:00 PM",
    location: "Chapter House",
    attendees: 42,
    type: "meeting",
    description: "Weekly chapter meeting to discuss upcoming events and initiatives.",
  },
  {
    id: 2,
    title: "Community Service Day",
    date: "2026-01-18",
    time: "9:00 AM",
    location: "City Park",
    attendees: 28,
    type: "service",
    description: "Park cleanup and beautification project.",
  },
  {
    id: 3,
    title: "Alumni Networking Event",
    date: "2026-01-22",
    time: "6:00 PM",
    location: "Downtown Hotel",
    attendees: 65,
    type: "social",
    description: "Connect with alumni for career advice and mentorship opportunities.",
  },
];

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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>("2026-01-15");

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

  const getDateString = (day: number) => {
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${currentDate.getFullYear()}-${month}-${dayStr}`;
  };

  const hasEvent = (day: number) => {
    const dateStr = getDateString(day);
    return events.some((e) => e.date === dateStr);
  };

  const selectedEvents = events.filter((e) => e.date === selectedDate);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Events</h1>
            <p className="text-muted-foreground mt-1">Manage and track chapter events</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="hero" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
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
              {getDaysInMonth(currentDate).map((day, index) => (
                <button
                  key={index}
                  onClick={() => day && setSelectedDate(getDateString(day))}
                  disabled={!day}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative",
                    !day && "invisible",
                    day && selectedDate === getDateString(day)
                      ? "bg-primary text-primary-foreground glow-primary"
                      : day
                      ? "hover:bg-secondary"
                      : "",
                    hasEvent(day || 0) && selectedDate !== getDateString(day || 0) && "bg-primary/10"
                  )}
                >
                  {day}
                  {hasEvent(day || 0) && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Day Events */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-display font-bold mb-4">
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "Select a date"}
            </h3>

            {selectedEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs capitalize", typeColors[event.type as keyof typeof typeColors])}
                      >
                        {event.type}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-foreground">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {event.attendees} attending
                      </span>
                      <Button size="sm" variant="hero">
                        RSVP
                      </Button>
                    </div>
                  </div>
                ))}
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
