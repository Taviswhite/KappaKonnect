import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CheckCircle2, Circle, Clock, Plus, Filter, Search, MoreVertical, Calendar, ListTodo, Edit, Trash2, Copy, X } from "lucide-react";
import { cn, formatCrossingDisplay } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { CreateTaskDialog } from "@/components/dialogs/CreateTaskDialog";
import { useAuth } from "@/contexts/AuthContext";

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    assignee: "all",
  });
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

  // Fetch profiles for assignee filter (exclude admin account so it stays in background)
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-for-filter"],
    queryFn: async () => {
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .order("full_name");
      if (error) return [];
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminUserIds = new Set(adminRoles?.map((r) => r.user_id) || []);
      return (profilesData || []).filter((p) => !adminUserIds.has(p.user_id));
    },
  });

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => {
      const matchesStatus = filters.status === "all" || (t.status || "todo") === status;
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = filters.priority === "all" || (t.priority || "medium") === filters.priority;
      const matchesAssignee = filters.assignee === "all" || t.assigned_to === filters.assignee;
      
      return matchesStatus && matchesSearch && matchesPriority && matchesAssignee && (t.status || "todo") === status;
    });
  };

  const activeFiltersCount = 
    (filters.status !== "all" ? 1 : 0) +
    (filters.priority !== "all" ? 1 : 0) +
    (filters.assignee !== "all" ? 1 : 0);

  const clearFilters = () => {
    setFilters({ status: "all", priority: "all", assignee: "all" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage committee assignments and track progress</p>
          </div>
          <CreateTaskDialog>
            <Button variant="hero" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </CreateTaskDialog>
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
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Filters</h4>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select value={filters.assignee} onValueChange={(value) => setFilters({ ...filters, assignee: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      {profiles.map((profile) => {
                        const crossing = formatCrossingDisplay({
                          crossing_year: profile.crossing_year,
                          chapter: profile.chapter,
                          line_order: profile.line_order,
                        });
                        return (
                          <SelectItem key={profile.user_id} value={profile.user_id}>
                            {crossing ? `${profile.full_name} (${crossing})` : profile.full_name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
            <CreateTaskDialog>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </CreateTaskDialog>
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
                  {getTasksByStatus(column.id).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={() => {
                        queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
                        queryClient.invalidateQueries({ queryKey: ["open-tasks-count"] });
                      }}
                    />
                  ))}

                  {/* Add Task Button */}
                  <CreateTaskDialog>
                    <Button
                      variant="ghost"
                      className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </CreateTaskDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

// Task Card Component with Status Cycling
function TaskCard({ task, onStatusChange }: { task: Database["public"]["Tables"]["tasks"]["Row"]; onStatusChange: () => void }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const statusCycle: Record<string, string> = {
    todo: "in_progress",
    in_progress: "completed",
    completed: "todo",
  };

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks-count"] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      onStatusChange();
    },
    onError: () => {
      toast.error("Failed to update task status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks-count"] });
      toast.success("Task deleted");
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: `${task.title} (Copy)`,
          description: task.description,
          status: "todo",
          priority: task.priority,
          assigned_to: task.assigned_to,
          committee: task.committee,
          due_date: task.due_date,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      toast.success("Task duplicated");
    },
    onError: () => {
      toast.error("Failed to duplicate task");
    },
  });

  const handleClick = () => {
    const currentStatus = task.status || "todo";
    const newStatus = statusCycle[currentStatus] || "todo";
    statusMutation.mutate(newStatus);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate();
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateMutation.mutate();
  };

  const priority = task.priority || "medium";
  const StatusIcon = task.status === "completed" ? CheckCircle2 : task.status === "in_progress" ? Clock : Circle;

  return (
    <div
      onClick={handleClick}
      className="glass-card rounded-xl p-4 hover:scale-[1.02] transition-transform cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <Badge
          variant="outline"
          className={cn("text-xs capitalize", priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium)}
        >
          {priority}
        </Badge>
        <div className="flex items-center gap-2">
          <StatusIcon className={cn(
            "w-4 h-4",
            task.status === "completed" ? "text-green-500" : task.status === "in_progress" ? "text-accent" : "text-muted-foreground"
          )} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info("Edit task coming soon!"); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h4 className={cn("font-semibold mb-2", task.status === "completed" && "line-through text-muted-foreground")}>
        {task.title}
      </h4>
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
}

export default Tasks;