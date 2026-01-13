import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const tasks = [
  {
    id: 1,
    title: "Review budget proposal for spring semester",
    assignee: "Finance Committee",
    dueDate: "Jan 12",
    priority: "high",
    status: "in_progress",
  },
  {
    id: 2,
    title: "Finalize community service schedule",
    assignee: "Service Chair",
    dueDate: "Jan 14",
    priority: "medium",
    status: "todo",
  },
  {
    id: 3,
    title: "Book venue for formal event",
    assignee: "Social Chair",
    dueDate: "Jan 20",
    priority: "high",
    status: "todo",
  },
  {
    id: 4,
    title: "Update member contact information",
    assignee: "Secretary",
    dueDate: "Jan 16",
    priority: "low",
    status: "completed",
  },
];

const priorityColors = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-accent/20 text-accent border-accent/30",
  low: "bg-muted text-muted-foreground border-muted",
};

const statusIcons = {
  completed: CheckCircle2,
  in_progress: Clock,
  todo: Circle,
};

export function TaskList() {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">My Tasks</h2>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => navigate("/tasks")}>
          View All
        </Button>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {tasks.map((task, index) => {
          const StatusIcon = statusIcons[task.status as keyof typeof statusIcons];
          return (
            <div
              key={task.id}
              className={cn(
                "flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all cursor-pointer group",
                task.status === "completed"
                  ? "bg-muted/30 opacity-60"
                  : "bg-secondary/30 hover:bg-secondary/50"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <button
                className={cn(
                  "shrink-0 transition-colors mt-0.5 sm:mt-0",
                  task.status === "completed" ? "text-green-500" : "text-muted-foreground hover:text-primary"
                )}
              >
                <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-medium text-sm sm:text-base truncate",
                    task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                  )}
                >
                  {task.title}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{task.assignee}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={cn("text-[10px] sm:text-xs capitalize", priorityColors[task.priority as keyof typeof priorityColors])}
                >
                  {task.priority}
                </Badge>
                <span className="text-[10px] sm:text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {task.dueDate}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
