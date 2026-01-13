import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Clock, Plus, Filter, Search, MoreVertical, Calendar, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const columns = [
  { id: "todo", title: "To Do", color: "border-muted" },
  { id: "in_progress", title: "In Progress", color: "border-accent" },
  { id: "completed", title: "Completed", color: "border-green-500" },
];

const priorityColors = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-accent/20 text-accent border-accent/30",
  low: "bg-muted text-muted-foreground border-muted",
};

const Tasks = () => {
  const [search, setSearch] = useState("");

  // Fetch tasks from database
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("due_date", { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getTasksByStatus = (status: string) =>
    tasks.filter((t) => 
      (t.status || "todo") === status && 
      t.title.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage committee assignments and track progress</p>
          </div>
          <Button variant="hero" size="sm" onClick={() => toast.info("Create task feature coming soon!")}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.info("Filter options coming soon!")}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <div key={column.id} className="space-y-4">
                <div className={cn("flex items-center gap-3 pb-3 border-b-2", column.color)}>
                  <h3 className="font-display font-bold text-foreground">{column.title}</h3>
                  <Badge variant="outline" className="text-xs">0</Badge>
                </div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-secondary/30 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <ListTodo className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-foreground mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-6">Create your first task to get started</p>
            <Button variant="hero" onClick={() => toast.info("Create task feature coming soon!")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <div key={column.id} className="space-y-4">
                <div className={cn("flex items-center gap-3 pb-3 border-b-2", column.color)}>
                  <h3 className="font-display font-bold text-foreground">{column.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {getTasksByStatus(column.id).length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {getTasksByStatus(column.id).map((task) => {
                    const priority = task.priority || "medium";
                    return (
                      <div
                        key={task.id}
                        className="glass-card rounded-xl p-4 hover:scale-[1.02] transition-transform cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge
                            variant="outline"
                            className={cn("text-xs capitalize", priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium)}
                          >
                            {priority}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>

                        <h4 className="font-semibold text-foreground mb-2">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{task.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6 border border-border">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {task.committee?.[0] || "T"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{task.committee || "General"}</span>
                          </div>
                          {task.due_date && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(task.due_date), "MMM d")}
                            </span>
                          )}
                        </div>

                        {task.committee && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <Badge variant="outline" className="text-xs bg-secondary/50">
                              {task.committee}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Task Button */}
                  <button 
                    onClick={() => toast.info("Add task feature coming soon!")}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Tasks;