import { CheckCircle2, Circle, Clock, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const priorityColors: Record<string, string> = {
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
  const { user } = useAuth();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["my-tasks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in card-hover">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
          My Tasks
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => navigate("/tasks")}
        >
          View All
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-muted/50 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="icon-container icon-container-muted mb-3">
            <ListTodo className="w-6 h-6" strokeWidth={2} />
          </div>
          <p className="font-semibold text-foreground">No tasks assigned yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tasks will appear here when assigned to you
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const status = (task.status || "todo") as keyof typeof statusIcons;
            const priority = (task.priority || "medium") as keyof typeof priorityColors;
            const StatusIcon = statusIcons[status] || Circle;

            return (
              <div
                key={task.id}
                onClick={() => navigate("/tasks")}
                className={cn(
                  "flex items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl transition-all duration-150 cursor-pointer group card-press",
                  status === "completed"
                    ? "bg-muted/30 opacity-60"
                    : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                <div className="shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors duration-150">
                  <StatusIcon
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5",
                      status === "completed" && "text-green-500"
                    )}
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-semibold text-sm truncate",
                      status === "completed"
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {task.committee || "General"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs capitalize",
                      priorityColors[priority] || priorityColors.medium
                    )}
                  >
                    {priority}
                  </Badge>
                  {task.due_date && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      {format(new Date(task.due_date), "MMM d")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
