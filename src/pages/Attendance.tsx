import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrCode, Download, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useSearchParams } from "react-router-dom";

// Use a configurable base URL so QR codes work from phones (not just localhost)
const QR_BASE_URL =
  import.meta.env.VITE_PUBLIC_BASE_URL && import.meta.env.VITE_PUBLIC_BASE_URL.trim().length > 0
    ? import.meta.env.VITE_PUBLIC_BASE_URL.trim().replace(/\/+$/, "")
    : window.location.origin;

const Attendance = () => {
  const [showQR, setShowQR] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Check for QR code check-in parameter
  const eventIdFromQR = searchParams.get("event");
  const checkinFromQR = searchParams.get("checkin") === "true";

  // Fetch upcoming events
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["upcoming-events-attendance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(1);
      if (error) throw error;
      return data;
    },
  });

  // If QR code has event ID, fetch that specific event
  const { data: qrEvent } = useQuery({
    queryKey: ["event-by-id", eventIdFromQR],
    queryFn: async () => {
      if (!eventIdFromQR) return null;
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventIdFromQR)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!eventIdFromQR,
  });

  const currentEvent = qrEvent || upcomingEvents[0];

  // Check if current user is checked in
  const { data: userAttendance } = useQuery({
    queryKey: ["user-attendance", currentEvent?.id, user?.id],
    queryFn: async () => {
      if (!currentEvent || !user) return null;
      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("event_id", currentEvent.id)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!currentEvent && !!user,
  });

  // Check-in mutation (users can only check themselves in)
  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user || !currentEvent) throw new Error("Missing user or event");
      const { error } = await supabase.from("attendance").insert({
        user_id: user.id,
        event_id: currentEvent.id,
        checked_in_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-count", currentEvent?.id] });
      toast.success("Successfully checked in!");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        toast.error("You are already checked in for this event");
      } else {
        toast.error("Failed to check in. Please try again.");
      }
    },
  });

  // Get attendance count
  const { data: attendanceCount = 0 } = useQuery({
    queryKey: ["attendance-count", currentEvent?.id],
    queryFn: async () => {
      if (!currentEvent) return 0;
      const { count, error } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("event_id", currentEvent.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!currentEvent,
  });

  const isCheckedIn = !!userAttendance;
  const attendanceRate = currentEvent ? Math.round((attendanceCount / 50) * 100) : 0;

  // Auto-check-in if coming from QR code
  useEffect(() => {
    if (checkinFromQR && currentEvent && user && !isCheckedIn && !checkInMutation.isPending) {
      // Small delay to ensure user sees the page
      const timer = setTimeout(() => {
        checkInMutation.mutate();
        // Remove query params after check-in
        setSearchParams({});
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [checkinFromQR, currentEvent, user, isCheckedIn, checkInMutation, setSearchParams]);

  if (!currentEvent) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground mt-1">QR code check-in for events</p>
          </div>
          <div className="glass-card rounded-xl p-12 text-center">
            <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-display font-bold text-foreground mb-2">No Upcoming Events</h3>
            <p className="text-muted-foreground">There are no upcoming events to check in to.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">Check in to upcoming events</p>
        </div>

        <div className="glass-card rounded-xl p-8">
          {/* Event Header */}
          <div className="text-center mb-8">
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 mb-3">
              Active Event
            </Badge>
            <h2 className="text-2xl font-display font-bold mb-2">{currentEvent.title}</h2>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>
                  {format(parseISO(currentEvent.start_time), "MMMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              {currentEvent.end_time && (
                <>
                  <span>•</span>
                  <span>Ends {format(parseISO(currentEvent.end_time), "h:mm a")}</span>
                </>
              )}
              {currentEvent.location && (
                <>
                  <span>•</span>
                  <span>📍 {currentEvent.location}</span>
                </>
              )}
            </div>
            {currentEvent.description && (
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{currentEvent.description}</p>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-8 mb-8 pb-6 border-b">
            <div className="text-center">
              <p className="text-3xl font-display font-bold gradient-text">
                {attendanceCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Checked In</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-display font-bold gradient-text-gold">
                {attendanceRate}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Attendance Rate</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center">
            {showQR ? (
              <div className="relative mb-6">
                <div className="w-64 h-64 bg-white rounded-2xl p-4 border-2 border-black flex items-center justify-center shadow-lg">
                  {currentEvent && (
                    <QRCodeSVG
                      value={`${QR_BASE_URL}/attendance?event=${currentEvent.id}&checkin=true`}
                      size={230}
                      level="H"
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2"
                  onClick={() => {
                    setShowQR(false);
                    setTimeout(() => setShowQR(true), 100);
                  }}
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
                className="mb-6"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Show QR Code
              </Button>
            )}

            {/* Check-in Status */}
            {user ? (
              <div className="w-full max-w-md">
                {isCheckedIn ? (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-foreground">You're checked in!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Checked in at {format(parseISO(userAttendance.checked_in_at), "h:mm a")}
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={() => checkInMutation.mutate()}
                    disabled={checkInMutation.isPending}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {checkInMutation.isPending ? "Checking in..." : "Check In"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-secondary/30 text-center max-w-md w-full">
                <p className="text-sm text-muted-foreground">Please log in to check in</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Attendance;
