import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrCode, Download, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const currentEvent = {
  title: "Chapter Meeting",
  date: "January 15, 2026",
  time: "7:00 PM",
  location: "Chapter House",
  checkedIn: 28,
  total: 48,
};

const attendees = [
  { id: 1, name: "James Davis", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", checkedIn: true, time: "6:45 PM" },
  { id: 2, name: "Marcus Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", checkedIn: true, time: "6:50 PM" },
  { id: 3, name: "David Williams", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", checkedIn: true, time: "6:55 PM" },
  { id: 4, name: "Alex Thompson", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100", checkedIn: false, time: null },
  { id: 5, name: "Michael Brown", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100", checkedIn: true, time: "7:02 PM" },
  { id: 6, name: "Chris Martinez", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", checkedIn: false, time: null },
];

const Attendance = () => {
  const [showQR, setShowQR] = useState(true);
  const attendanceRate = Math.round((currentEvent.checkedIn / currentEvent.total) * 100);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground mt-1">QR code check-in for events</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center">
            <div className="text-center mb-6">
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 mb-2">
                Active Event
              </Badge>
              <h2 className="text-2xl font-display font-bold">{currentEvent.title}</h2>
              <p className="text-muted-foreground mt-1">
                {currentEvent.date} • {currentEvent.time}
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
                            Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"
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
                size="xl"
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
                  {currentEvent.checkedIn}
                </p>
                <p className="text-sm text-muted-foreground">Checked In</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <p className="text-4xl font-display font-bold text-foreground">
                  {currentEvent.total}
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
          </div>

          {/* Attendee List */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">Attendees</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  {attendees.filter((a) => a.checkedIn).length}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {attendees.filter((a) => !a.checkedIn).length}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg transition-all",
                    attendee.checkedIn ? "bg-green-500/10" : "bg-secondary/30"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-border">
                      <AvatarImage src={attendee.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {attendee.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {attendee.checkedIn && (
                      <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-green-500 bg-card rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{attendee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {attendee.checkedIn ? `Checked in at ${attendee.time}` : "Not checked in"}
                    </p>
                  </div>
                  {!attendee.checkedIn && (
                    <Button variant="outline" size="sm">
                      Manual Check-in
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Attendance;
