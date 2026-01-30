import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity } from "lucide-react";

export function RecentActivity() {
  const activities: Array<{
    id: number;
    user: { name: string; avatar?: string };
    action: string;
    target: string;
    time: string;
    iconColor: string;
  }> = [];

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in card-hover">
      <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-4">
        Recent Activity
      </h2>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="icon-container icon-container-muted mb-3">
            <Activity className="w-6 h-6" strokeWidth={2} />
          </div>
          <p className="font-semibold text-foreground">No recent activity yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Activity will appear here as members interact
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-150"
            >
              <Avatar className="w-9 h-9 border border-border shrink-0">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {activity.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold text-foreground">
                    {activity.user.name}
                  </span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  {activity.target && (
                    <span className="font-semibold text-primary">
                      {activity.target}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
