import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrCode, Download, CheckCircle, Clock, RefreshCw, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, isFuture } from "date-fns";
import { toast } from "sonner";

const Attendance = () => {
  const [showQR, setShowQR] = useState(true);

  // Fetch the next upcoming event
  const { data: currentEvent } = useQuery({
    queryKey: ["current-event"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  // Fetch attendance for the current event
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["attendance", currentEvent?.id],
    queryFn: async () => {
      if (!currentEvent?.id) return [];
      const { data, error } = await supabase
        .from("attendance")
        .select("*, profiles:user_id(full_name, avatar_url)")
        .eq("event_id", currentEvent.id);
      if (error) throw error;
      return data;
    },
    enabled: !!currentEvent?.id,
  });

  // Fetch all members for attendance list
  const { data: members = [] } = useQuery({
    queryKey: ["all-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  // Merge members with attendance data
  const attendees = members.map((member) => {
    const attendance = attendanceRecords.find((a: any) => a.user_id === member.user_id);
    return {
      ...member,
      checkedIn: !!attendance,
      time: attendance ? format(new Date(attendance.checked_in_at), "h:mm a") : null,
    };
  });

  const checkedInCount = attendees.filter((a) => a.checkedIn).length;
  const totalCount = attendees.length;
  const attendanceRate = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground mt-1">QR code check-in for events</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => toast.info("Export coming soon!")}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center">
            {!currentEvent ? (
              <div className="text-center text-muted-foreground">
                <CalendarX className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No upcoming events</p>
                <p className="text-sm">Create an event to enable attendance tracking</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 mb-2">
                    Active Event
                  </Badge>
                  <h2 className="text-2xl font-display font-bold">{currentEvent.title}</h2>
                  <p className="text-muted-foreground mt-1">
                    {format(new Date(currentEvent.start_time), "MMMM d, yyyy")} • {format(new Date(currentEvent.start_time), "h:mm a")}
                  </p>
                </div>

                {showQR ? (
                  <div className="relative">
                    <div className="w-64 h-64 bg-foreground rounded-2xl p-4 glow-primary">
                      <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                        {/* QR Code Pattern Simulation */}
                        <div className="grid grid-cols-8 gap-1 p-4">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-4 h-4 rounded-sm",
                                (i + Math.floor(i / 8)) % 2 === 0 ? "bg-foreground" : "bg-transparent"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -bottom-12 left-1/2 -translate-x-1/2"
                      onClick={() => setShowQR(false)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => setShowQR(true)}
                    className="mt-8"
                  >
                    <QrCode className="w-6 h-6 mr-2" />
                    Show QR Code
                  </Button>
                )}

                <div className="mt-12 flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-display font-bold gradient-text">
                      {checkedInCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Checked In</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <p className="text-4xl font-display font-bold text-foreground">
                      {totalCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <p className="text-4xl font-display font-bold gradient-text-gold">
                      {attendanceRate}%
                    </p>
                    <p className="text-sm text-muted-foreground">Attendance</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Attendee List */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">Attendees</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  {checkedInCount}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {totalCount - checkedInCount}
                </span>
              </div>
            </div>

            {attendees.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No members found
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {attendees.map((attendee) => (
                  <div
                    key={attendee.user_id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg transition-all",
                      attendee.checkedIn ? "bg-green-500/10" : "bg-secondary/30"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-border">
                        <AvatarImage src={attendee.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {attendee.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {attendee.checkedIn && (
                        <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-green-500 bg-card rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{attendee.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {attendee.checkedIn ? `Checked in at ${attendee.time}` : "Not checked in"}
                      </p>
                    </div>
                    {!attendee.checkedIn && (
                      <Button variant="outline" size="sm" onClick={() => toast.info("Manual check-in coming soon!")}>
                        Manual Check-in
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Attendance;
