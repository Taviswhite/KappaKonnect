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
    <div className="glass-card rounded-xl p-3 sm:p-4 md:p-6 animate-fade-in hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-display font-bold mt-1 sm:mt-2 text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                "text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-2 font-medium truncate",
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
            "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0",
            iconColor === "primary" && "bg-primary/20 text-primary",
            iconColor === "accent" && "bg-accent/20 text-accent",
            iconColor === "muted" && "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
}
