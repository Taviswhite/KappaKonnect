import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Bell,
  Calendar,
  CheckSquare,
  Megaphone,
  MessageSquare,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActivityType = "announcement" | "event" | "task" | "message" | "member" | "system";

interface ActivityItem {
  id: string;
  type: ActivityType | "task_assigned";
  title: string;
  message: string | null;
  link: string | null;
  createdAt: string;
  read?: boolean;
}

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "announcement":
      return <Megaphone className="w-5 h-5 text-primary shrink-0" />;
    case "event":
      return <Calendar className="w-5 h-5 text-primary shrink-0" />;
    case "task":
    case "task_assigned":
      return <CheckSquare className="w-5 h-5 text-green-500 shrink-0" />;
    case "message":
      return <MessageSquare className="w-5 h-5 text-blue-500 shrink-0" />;
    case "member":
      return <Users className="w-5 h-5 text-purple-500 shrink-0" />;
    case "system":
    default:
      return <Bell className="w-5 h-5 text-muted-foreground shrink-0" />;
  }
}

const MOCK_ACTIVITIES: ActivityItem[] = (() => {
  const now = new Date();
  return [
    {
      id: "mock-1",
      type: "announcement",
      title: "Chapter meeting this Friday",
      message: "Reminder: General chapter meeting at 6 PM in the chapter room. Agenda will be shared in Chat.",
      link: "/notifications",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "mock-2",
      type: "task_assigned",
      title: "Task assigned to you",
      message: "Prepare slides for the recruitment presentation",
      link: "/tasks",
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-3",
      type: "event",
      title: "Service Day sign-up open",
      message: "Sign up for Service Day by end of week. Check the Events page for details.",
      link: "/events",
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "mock-4",
      type: "message",
      title: "New message in General",
      message: "Jordan: Can someone share the meeting notes from last week?",
      link: "/chat",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: "mock-5",
      type: "task_assigned",
      title: "Task assigned to you",
      message: "Review and sign the chapter bylaws document",
      link: "/tasks",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-6",
      type: "system",
      title: "Welcome to the chapter portal",
      message: "Get started by updating your profile and checking upcoming events.",
      link: "/profile",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ];
})();

export function RecentActivity() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const notificationsQuery = useQuery({
    queryKey: ["recent-activity-notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await (supabase as any)
        .from("notifications")
        .select("id, title, message, type, link, read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        title: string;
        message: string;
        type: ActivityType;
        link: string | null;
        read: boolean;
        created_at: string;
      }>;
    },
    enabled: !!user?.id,
    refetchInterval: 30_000,
  });
  const assignedTasksQuery = useQuery({
    queryKey: ["recent-activity-tasks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, created_at")
        .eq("assigned_to", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as Array<{ id: string; title: string; created_at: string }>;
    },
    enabled: !!user?.id,
    refetchInterval: 30_000,
  });

  const notifications = notificationsQuery.data ?? [];
  const assignedTasks = assignedTasksQuery.data ?? [];

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("recent-activity-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          notificationsQuery.refetch();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `assigned_to=eq.${user.id}`,
        },
        () => {
          assignedTasksQuery.refetch();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, notificationsQuery.refetch, assignedTasksQuery.refetch]);

  const realActivities: ActivityItem[] = [
    ...notifications.map((n) => ({
      id: n.id,
      type: n.type as ActivityItem["type"],
      title: n.title,
      message: n.message || null,
      link: n.link || "/notifications",
      createdAt: n.created_at,
      read: n.read,
    })),
    ...assignedTasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task_assigned" as const,
      title: "Task assigned to you",
      message: t.title,
      link: "/tasks",
      createdAt: t.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  const activities = realActivities.length > 0 ? realActivities : MOCK_ACTIVITIES.slice(0, 2);

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in card-hover">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
          Recent Activity
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => navigate("/notifications")}
        >
          View all
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="icon-container icon-container-muted mb-3">
            <Activity className="w-6 h-6" strokeWidth={2} />
          </div>
          <p className="font-semibold text-foreground">No recent activity yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Announcements, task assignments, and messages will appear here
          </p>
        </div>
      ) : (
        <div className="max-h-[220px] overflow-y-auto overflow-x-hidden pr-1 space-y-2">
          {activities.map((activity) => (
            <button
              key={activity.id}
              type="button"
              onClick={() => {
                if (activity.link) {
                  if (activity.link.startsWith("http")) window.open(activity.link, "_blank");
                  else navigate(activity.link);
                }
              }}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors duration-150",
                "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                !activity.read && "bg-primary/5 border border-primary/10"
              )}
            >
              <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {activity.title}
                </p>
                {activity.message && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {activity.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
