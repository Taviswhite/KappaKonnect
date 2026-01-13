import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, CheckCircle, MessageSquare, CreditCard, UserPlus, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecentActivity() {
  // Empty state - will be populated with real data when available
  const activities: Array<{
    id: number;
    user: { name: string; avatar?: string };
    action: string;
    target: string;
    time: string;
    icon: typeof Calendar;
    iconColor: string;
  }> = [];

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in">
      <h2 className="text-lg sm:text-xl font-display font-bold text-foreground mb-4 sm:mb-6">Recent Activity</h2>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Activity className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No recent activity yet</p>
          <p className="text-xs text-muted-foreground mt-1">Activity will appear here as members interact</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
