import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Users, Plus, FileText, Download, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const upcomingMeetings = [
  {
    id: 1,
    title: "Chapter Meeting",
    date: "Jan 15, 2026",
    time: "7:00 PM",
    duration: "2 hours",
    location: "Chapter House",
    type: "chapter",
    attendees: 48,
    agenda: ["Budget Review", "Community Service Update", "New Member Education", "Open Forum"],
  },
  {
    id: 2,
    title: "Executive Board Meeting",
    date: "Jan 18, 2026",
    time: "5:00 PM",
    duration: "1.5 hours",
    location: "Conference Room A",
    type: "executive",
    attendees: 8,
    agenda: ["Strategic Planning", "Budget Allocation", "Event Calendar"],
  },
  {
    id: 3,
    title: "Finance Committee",
    date: "Jan 20, 2026",
    time: "6:00 PM",
    duration: "1 hour",
    location: "Virtual",
    type: "committee",
    attendees: 5,
    agenda: ["Q1 Budget Review", "Dues Collection Status"],
  },
];

const pastMeetings = [
  {
    id: 4,
    title: "Chapter Meeting",
    date: "Jan 8, 2026",
    time: "7:00 PM",
    location: "Chapter House",
    type: "chapter",
    attendees: 45,
    hasMinutes: true,
    hasRecording: true,
  },
  {
    id: 5,
    title: "Executive Board Meeting",
    date: "Jan 4, 2026",
    time: "5:00 PM",
    location: "Conference Room A",
    type: "executive",
    attendees: 8,
    hasMinutes: true,
    hasRecording: false,
  },
];

const typeColors = {
  chapter: "bg-primary/20 text-primary border-primary/30",
  executive: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  committee: "bg-accent/20 text-accent border-accent/30",
};

const Meetings = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Meetings</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage chapter meetings</p>
          </div>
          <Button variant="hero" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Meetings */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-display font-bold">Upcoming Meetings</h2>
            
            {upcomingMeetings.map((meeting, index) => (
              <div
                key={meeting.id}
                className="glass-card rounded-xl p-6 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs capitalize", typeColors[meeting.type as keyof typeof typeColors])}
                      >
                        {meeting.type}
                      </Badge>
                      {meeting.location === "Virtual" && (
                        <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <Video className="w-3 h-3 mr-1" />
                          Virtual
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-display font-bold text-foreground">{meeting.title}</h3>
                  </div>
                  <Button variant="hero" size="sm">
                    Join
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {meeting.date}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {meeting.time} ({meeting.duration})
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {meeting.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {meeting.attendees} expected
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Agenda</h4>
                  <ul className="space-y-1">
                    {meeting.agenda.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Past Meetings */}
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold">Past Meetings</h2>
            
            {pastMeetings.map((meeting) => (
              <div key={meeting.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={cn("text-xs capitalize", typeColors[meeting.type as keyof typeof typeColors])}
                  >
                    {meeting.type}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground">{meeting.title}</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {meeting.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {meeting.attendees}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  {meeting.hasMinutes && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="w-4 h-4 mr-1" />
                      Minutes
                    </Button>
                  )}
                  {meeting.hasRecording && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Video className="w-4 h-4 mr-1" />
                      Recording
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full">
              View All Past Meetings
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Meetings;
