import { CheckCircle2, Circle, Clock, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

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
    <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">My Tasks</h2>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => navigate("/tasks")}>
          View All
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-secondary/30 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ListTodo className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No tasks assigned yet</p>
          <p className="text-xs text-muted-foreground mt-1">Tasks will appear here when assigned to you</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {tasks.map((task, index) => {
            const status = task.status || "todo";
            const priority = task.priority || "medium";
            const StatusIcon = statusIcons[status as keyof typeof statusIcons] || Circle;
            
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all cursor-pointer group",
                  status === "completed"
                    ? "bg-muted/30 opacity-60"
                    : "bg-secondary/30 hover:bg-secondary/50"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <button
                  className={cn(
                    "shrink-0 transition-colors mt-0.5 sm:mt-0",
                    status === "completed" ? "text-green-500" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-medium text-sm sm:text-base truncate",
                      status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{task.committee || "General"}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] sm:text-xs capitalize", priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium)}
                  >
                    {priority}
                  </Badge>
                  {task.due_date && (
                    <span className="text-[10px] sm:text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
