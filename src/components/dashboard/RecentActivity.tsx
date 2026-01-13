import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, CheckCircle, MessageSquare, CreditCard, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    user: { name: "Marcus Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    action: "RSVP'd to",
    target: "Chapter Meeting",
    time: "5 min ago",
    icon: Calendar,
    iconColor: "text-primary",
  },
  {
    id: 2,
    user: { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    action: "completed task",
    target: "Budget Review",
    time: "1 hour ago",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    id: 3,
    user: { name: "David Williams", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    action: "sent message in",
    target: "General Chat",
    time: "2 hours ago",
    icon: MessageSquare,
    iconColor: "text-blue-400",
  },
  {
    id: 4,
    user: { name: "Alex Thompson", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
    action: "made payment",
    target: "Spring Dues",
    time: "3 hours ago",
    icon: CreditCard,
    iconColor: "text-accent",
  },
  {
    id: 5,
    user: { name: "Michael Brown", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100" },
    action: "joined the chapter",
    target: "",
    time: "1 day ago",
    icon: UserPlus,
    iconColor: "text-purple-400",
  },
];

export function RecentActivity() {
  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in">
      <h2 className="text-lg sm:text-xl font-display font-bold text-foreground mb-4 sm:mb-6">Recent Activity</h2>

      <div className="space-y-3 sm:space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-2 sm:gap-3"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Avatar className="w-8 h-8 sm:w-9 sm:h-9 border border-border shrink-0">
              <AvatarImage src={activity.user.avatar} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px] sm:text-xs">
                {activity.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm">
                <span className="font-medium text-foreground">{activity.user.name}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                {activity.target && (
                  <span className="font-medium text-primary">{activity.target}</span>
                )}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{activity.time}</p>
            </div>

            <activity.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mt-0.5", activity.iconColor)} />
          </div>
        ))}
      </div>
    </div>
  );
}
