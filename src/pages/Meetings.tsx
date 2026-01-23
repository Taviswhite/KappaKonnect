import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Plus, FileText, Video, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateEventDialog } from "@/components/dialogs/CreateEventDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isPast } from "date-fns";

const typeColors = {
  meeting: "bg-primary/20 text-primary border-primary/30",
  executive: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  committee: "bg-accent/20 text-accent border-accent/30",
  service: "bg-green-500/20 text-green-400 border-green-500/30",
  social: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const Meetings = () => {
  // Fetch only chapter-specific meetings (not general events)
  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("event_type", ["meeting", "executive", "committee"])
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Separate upcoming and past meetings
  const now = new Date();
  const upcomingMeetings = meetings.filter((e) => !isPast(parseISO(e.start_time)));
  const pastMeetings = meetings.filter((e) => isPast(parseISO(e.start_time))).slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Meetings</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage chapter meetings</p>
          </div>
          <CreateEventDialog>
            <Button variant="hero" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </CreateEventDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Meetings */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-display font-bold">Upcoming Meetings</h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="glass-card rounded-xl p-6 h-48 animate-pulse" />
                ))}
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">No Upcoming Meetings</h3>
                <p className="text-muted-foreground">Schedule a meeting to get started</p>
              </div>
            ) : (
              upcomingMeetings.map((meeting, index) => (
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
                          className={cn("text-xs capitalize", typeColors[meeting.event_type as keyof typeof typeColors] || "bg-muted")}
                        >
                          {meeting.event_type}
                        </Badge>
                        {(!meeting.location || meeting.location.toLowerCase().includes("virtual")) && (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            <Video className="w-3 h-3 mr-1" />
                            Virtual
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-display font-bold text-foreground">{meeting.title}</h3>
                    </div>
                    {meeting.meeting_link && (
                      <Button 
                        variant="hero" 
                        size="sm"
                        onClick={() => window.open(meeting.meeting_link, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4 flex-wrap">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(meeting.start_time), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {format(parseISO(meeting.start_time), "h:mm a")}
                      {meeting.end_time && ` - ${format(parseISO(meeting.end_time), "h:mm a")}`}
                    </span>
                    {meeting.location && (
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {meeting.location}
                      </span>
                    )}
                  </div>

                  {meeting.description && (
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-sm text-foreground">{meeting.description}</p>
                    </div>
                  )}

                  {meeting.meeting_link && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-400" />
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline flex items-center gap-1"
                        >
                          {meeting.meeting_link}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Past Meetings */}
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold">Past Meetings</h2>
            
            {pastMeetings.length === 0 ? (
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">No past meetings</p>
              </div>
            ) : (
              pastMeetings.map((meeting) => (
                <div key={meeting.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs capitalize", typeColors[meeting.event_type as keyof typeof typeColors] || "bg-muted")}
                    >
                      {meeting.event_type}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{meeting.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(meeting.start_time), "MMM d, yyyy")}
                    </span>
                    {meeting.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {meeting.location}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Meetings;
