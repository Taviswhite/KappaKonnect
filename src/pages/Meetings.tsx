import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Plus, FileText, Video, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, isPast, isFuture } from "date-fns";
import { toast } from "sonner";
import { CreateEventDialog } from "@/components/dialogs/CreateEventDialog";

const typeColors: Record<string, string> = {
  meeting: "bg-primary/20 text-primary border-primary/30",
  chapter: "bg-primary/20 text-primary border-primary/30",
  executive: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  committee: "bg-accent/20 text-accent border-accent/30",
  social: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const Meetings = () => {
  // Fetch all events that are meetings
  const { data: allMeetings = [], isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("event_type", ["meeting", "chapter", "executive", "committee"])
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const upcomingMeetings = allMeetings.filter((m) => isFuture(new Date(m.start_time)));
  const pastMeetings = allMeetings.filter((m) => isPast(new Date(m.start_time))).slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Meetings</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage chapter meetings</p>
          </div>
          <CreateEventDialog 
            trigger={
              <Button variant="hero" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Meetings */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-display font-bold">Upcoming Meetings</h2>
            
            {isLoading ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                Loading meetings...
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground">
                <CalendarX className="w-12 h-12 mb-4 opacity-50" />
                <p>No upcoming meetings scheduled</p>
                <CreateEventDialog 
                  trigger={
                    <Button variant="hero" size="sm" className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  }
                />
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
                          className={cn("text-xs capitalize", typeColors[meeting.event_type || "meeting"])}
                        >
                          {meeting.event_type || "meeting"}
                        </Badge>
                        {meeting.location?.toLowerCase() === "virtual" && (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            <Video className="w-3 h-3 mr-1" />
                            Virtual
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-display font-bold text-foreground">{meeting.title}</h3>
                    </div>
                    <Button variant="hero" size="sm" onClick={() => toast.success("Joined meeting!")}>
                      Join
                    </Button>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(meeting.start_time), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {format(new Date(meeting.start_time), "h:mm a")}
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
                      <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{meeting.description}</p>
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
              <div className="glass-card rounded-xl p-4 text-center text-muted-foreground">
                No past meetings
              </div>
            ) : (
              pastMeetings.map((meeting) => (
                <div key={meeting.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs capitalize", typeColors[meeting.event_type || "meeting"])}
                    >
                      {meeting.event_type || "meeting"}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{meeting.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(meeting.start_time), "MMM d, yyyy")}
                    </span>
                    {meeting.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {meeting.location}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.info("Minutes coming soon!")}>
                      <FileText className="w-4 h-4 mr-1" />
                      Minutes
                    </Button>
                  </div>
                </div>
              ))
            )}

            <Button variant="outline" className="w-full" onClick={() => toast.info("View all coming soon!")}>
              View All Past Meetings
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Meetings;
