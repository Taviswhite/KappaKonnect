import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const events = [
  {
    id: 1,
    title: "Chapter Meeting",
    date: "Jan 15, 2026",
    time: "7:00 PM",
    location: "Chapter House",
    attendees: 42,
    type: "meeting",
  },
  {
    id: 2,
    title: "Community Service Day",
    date: "Jan 18, 2026",
    time: "9:00 AM",
    location: "City Park",
    attendees: 28,
    type: "service",
  },
  {
    id: 3,
    title: "Alumni Networking Event",
    date: "Jan 22, 2026",
    time: "6:00 PM",
    location: "Downtown Hotel",
    attendees: 65,
    type: "social",
  },
  {
    id: 4,
    title: "Executive Board Meeting",
    date: "Jan 25, 2026",
    time: "5:00 PM",
    location: "Conference Room A",
    attendees: 8,
    type: "executive",
  },
];

const typeColors = {
  meeting: "bg-primary/20 text-primary border-primary/30",
  service: "bg-green-500/20 text-green-400 border-green-500/30",
  social: "bg-accent/20 text-accent border-accent/30",
  executive: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function UpcomingEvents() {
  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">Upcoming Events</h2>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
          View All
        </Button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {events.map((event, index) => (
          <div
            key={event.id}
            className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center border border-primary/20 shrink-0">
              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase">
                {event.date.split(" ")[0]}
              </span>
              <span className="text-sm sm:text-lg font-bold text-primary">
                {event.date.split(" ")[1].replace(",", "")}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{event.title}</h3>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] sm:text-xs capitalize w-fit", typeColors[event.type as keyof typeof typeColors])}
                >
                  {event.type}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="truncate max-w-[100px] sm:max-w-none">{event.location}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {event.attendees}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              RSVP
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
