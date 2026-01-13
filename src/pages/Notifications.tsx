import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  CheckSquare, 
  Users,
  Check,
  Trash2,
  Settings
} from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  type: "event" | "payment" | "task" | "message" | "member";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "event",
    title: "Chapter Meeting Tonight",
    description: "Don't forget the meeting at 7 PM in the chapter house",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "task",
    title: "New Task Assigned",
    description: "You've been assigned to review the budget proposal",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "payment",
    title: "Payment Reminder",
    description: "Your dues payment is due in 3 days",
    time: "1 day ago",
    read: false,
  },
  {
    id: "4",
    type: "message",
    title: "New Message from John",
    description: "Hey, can we discuss the event planning?",
    time: "2 days ago",
    read: true,
  },
  {
    id: "5",
    type: "member",
    title: "New Member Joined",
    description: "Marcus Johnson has joined the chapter",
    time: "3 days ago",
    read: true,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "event":
      return <Calendar className="w-5 h-5 text-primary" />;
    case "payment":
      return <CreditCard className="w-5 h-5 text-amber-500" />;
    case "task":
      return <CheckSquare className="w-5 h-5 text-green-500" />;
    case "message":
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case "member":
      return <Users className="w-5 h-5 text-purple-500" />;
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [preferences, setPreferences] = useState({
    events: true,
    payments: true,
    tasks: true,
    messages: true,
    members: true,
    email: true,
    push: false,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with chapter activities
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Notifications
                    {unreadCount > 0 && (
                      <Badge className="bg-primary">{unreadCount} new</Badge>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                          notification.read
                            ? "bg-background border-border"
                            : "bg-primary/5 border-primary/20"
                        }`}
                      >
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-foreground">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {notification.time}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">
                    Notification Types
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="events" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Events
                      </Label>
                      <Switch
                        id="events"
                        checked={preferences.events}
                        onCheckedChange={(checked) =>
                          setPreferences((p) => ({ ...p, events: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="payments" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-500" />
                        Payments
                      </Label>
                      <Switch
                        id="payments"
                        checked={preferences.payments}
                        onCheckedChange={(checked) =>
                          setPreferences((p) => ({ ...p, payments: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tasks" className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-green-500" />
                        Tasks
                      </Label>
                      <Switch
                        id="tasks"
                        checked={preferences.tasks}
                        onCheckedChange={(checked) =>
                          setPreferences((p) => ({ ...p, tasks: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="messages" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        Messages
                      </Label>
                      <Switch
                        id="messages"
                        checked={preferences.messages}
                        onCheckedChange={(checked) =>
                          setPreferences((p) => ({ ...p, messages: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="members" className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        Members
                      </Label>
                      <Switch
                        id="members"
                        checked={preferences.members}
                        onCheckedChange={(checked) =>
                          setPreferences((p) => ({ ...p, members: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">
                    Delivery Methods
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email notifications</Label>
                      <Switch
                        id="email"
                        checked={preferences.email}
                        onCheckedChange={(checked) =>
                          setPreferences((p) => ({ ...p, email: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push">Push notifications</Label>
                      <Switch
                        id="push"
                        checked={preferences.push}
                        onCheckedChange={(checked) =>
                          setPreferences((p) => ({ ...p, push: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4">Save Preferences</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
