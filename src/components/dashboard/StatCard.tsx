import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: "primary" | "accent" | "muted";
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "primary",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-4 sm:p-6 animate-fade-in card-hover card-press",
        "transition-transform duration-150"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-3xl sm:text-4xl font-display font-bold mt-1 text-foreground tracking-tight">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "text-xs mt-1.5 truncate",
                changeType === "positive" && "text-green-500",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "icon-container",
            iconColor === "primary" && "icon-container-primary",
            iconColor === "accent" && "icon-container-accent",
            iconColor === "muted" && "icon-container-muted"
          )}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
