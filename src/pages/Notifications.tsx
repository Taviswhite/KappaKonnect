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
  MessageSquare, 
  CheckSquare, 
  Users,
  Check,
  Trash2,
  Settings,
  Megaphone
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import { SendAnnouncementDialog } from "@/components/dialogs/SendAnnouncementDialog";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "announcement" | "event" | "task" | "message" | "member" | "system";
  link: string | null;
  read: boolean;
  created_at: string;
  created_by: string | null;
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "announcement":
      return <Megaphone className="w-5 h-5 text-primary" />;
    case "event":
      return <Calendar className="w-5 h-5 text-primary" />;
    case "task":
      return <CheckSquare className="w-5 h-5 text-green-500" />;
    case "message":
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case "member":
      return <Users className="w-5 h-5 text-purple-500" />;
    case "system":
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
};

export default function Notifications() {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const isAdminOrEBoard = hasRole("admin") || hasRole("e_board");

  // Fetch notifications from database
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return (data || []) as Notification[];
    },
    enabled: !!user,
  });

  // Fetch notification preferences
  const { data: preferences = null } = useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    },
    enabled: !!user,
  });

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
          queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("user_id", user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user?.id)
        .eq("read", false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: any) => {
      if (!user) return;
      
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          ...newPreferences,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", user?.id] });
    },
  });

  const [localPreferences, setLocalPreferences] = useState({
    email: preferences?.email_enabled ?? true,
    push: preferences?.push_enabled ?? false,
    events: preferences?.events_enabled ?? true,
    tasks: preferences?.tasks_enabled ?? true,
    messages: preferences?.messages_enabled ?? true,
    members: preferences?.members_enabled ?? true,
    announcements: preferences?.announcements_enabled ?? true,
  });

  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        email: preferences.email_enabled ?? true,
        push: preferences.push_enabled ?? false,
        events: preferences.events_enabled ?? true,
        tasks: preferences.tasks_enabled ?? true,
        messages: preferences.messages_enabled ?? true,
        members: preferences.members_enabled ?? true,
        announcements: preferences.announcements_enabled ?? true,
      });
    }
  }, [preferences]);

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const deleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  const savePreferences = () => {
    updatePreferencesMutation.mutate({
      email_enabled: localPreferences.email,
      push_enabled: localPreferences.push,
      events_enabled: localPreferences.events,
      tasks_enabled: localPreferences.tasks,
      messages_enabled: localPreferences.messages,
      members_enabled: localPreferences.members,
      announcements_enabled: localPreferences.announcements,
    });
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
            {isAdminOrEBoard && (
              <SendAnnouncementDialog>
                <Button variant="hero" size="sm">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Send Announcement
                </Button>
              </SendAnnouncementDialog>
            )}
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead} disabled={markAllAsReadMutation.isPending}>
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
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
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-secondary/30 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                          notification.read
                            ? "bg-background border-border"
                            : "bg-primary/5 border-primary/20"
                        }`}
                        onClick={() => {
                          if (!notification.read) markAsRead(notification.id);
                          if (notification.link) window.open(notification.link, "_blank");
                        }}
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
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
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
                      <Label htmlFor="announcements" className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-primary" />
                        Announcements
                      </Label>
                      <Switch
                        id="announcements"
                        checked={localPreferences.announcements}
                        onCheckedChange={(checked) =>
                          setLocalPreferences((p) => ({ ...p, announcements: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="events" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Events
                      </Label>
                      <Switch
                        id="events"
                        checked={localPreferences.events}
                        onCheckedChange={(checked) =>
                          setLocalPreferences((p) => ({ ...p, events: checked }))
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
                        checked={localPreferences.tasks}
                        onCheckedChange={(checked) =>
                          setLocalPreferences((p) => ({ ...p, tasks: checked }))
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
                        checked={localPreferences.messages}
                        onCheckedChange={(checked) =>
                          setLocalPreferences((p) => ({ ...p, messages: checked }))
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
                        checked={localPreferences.members}
                        onCheckedChange={(checked) =>
                          setLocalPreferences((p) => ({ ...p, members: checked }))
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
                        checked={localPreferences.email}
                        onCheckedChange={(checked) =>
                          setLocalPreferences((p) => ({ ...p, email: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push">Push notifications</Label>
                      <Switch
                        id="push"
                        checked={localPreferences.push}
                        onCheckedChange={(checked) => {
                          setLocalPreferences((p) => ({ ...p, push: checked }));
                          if (checked) {
                            // Request notification permission
                            if ("Notification" in window && Notification.permission === "default") {
                              Notification.requestPermission();
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4" onClick={savePreferences} disabled={updatePreferencesMutation.isPending}>
                  {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
