import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Clock, Plus, Filter, Search, MoreVertical, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const columns = [
  { id: "todo", title: "To Do", color: "border-muted" },
  { id: "in_progress", title: "In Progress", color: "border-accent" },
  { id: "completed", title: "Completed", color: "border-green-500" },
];

const tasks = [
  {
    id: 1,
    title: "Review budget proposal for spring semester",
    description: "Analyze the proposed budget and prepare recommendations",
    assignee: { name: "David Williams", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
    dueDate: "Jan 12",
    priority: "high",
    status: "in_progress",
    committee: "Finance",
  },
  {
    id: 2,
    title: "Finalize community service schedule",
    description: "Coordinate with local organizations for spring events",
    assignee: { name: "Chris Martinez", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
    dueDate: "Jan 14",
    priority: "medium",
    status: "todo",
    committee: "Service",
  },
  {
    id: 3,
    title: "Book venue for formal event",
    description: "Research and book venue for spring formal",
    assignee: { name: "Michael Brown", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100" },
    dueDate: "Jan 20",
    priority: "high",
    status: "todo",
    committee: "Social",
  },
  {
    id: 4,
    title: "Update member contact information",
    description: "Collect and verify contact details for all members",
    assignee: { name: "Alex Thompson", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100" },
    dueDate: "Jan 16",
    priority: "low",
    status: "completed",
    committee: "Executive",
  },
  {
    id: 5,
    title: "Plan new member education program",
    description: "Develop curriculum for spring pledge class",
    assignee: { name: "Marcus Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    dueDate: "Jan 25",
    priority: "high",
    status: "in_progress",
    committee: "Education",
  },
  {
    id: 6,
    title: "Create social media calendar",
    description: "Plan posts for the month across all platforms",
    assignee: { name: "James Davis", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    dueDate: "Jan 10",
    priority: "medium",
    status: "completed",
    committee: "Communications",
  },
];

const priorityColors = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-accent/20 text-accent border-accent/30",
  low: "bg-muted text-muted-foreground border-muted",
};

const Tasks = () => {
  const [search, setSearch] = useState("");

  const getTasksByStatus = (status: string) =>
    tasks.filter((t) => t.status === status && t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage committee assignments and track progress</p>
          </div>
          <Button variant="hero" size="sm">
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
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Kanban Board */}
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
                  <div
                    key={task.id}
                    className="glass-card rounded-xl p-4 hover:scale-[1.02] transition-transform cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge
                        variant="outline"
                        className={cn("text-xs capitalize", priorityColors[task.priority as keyof typeof priorityColors])}
                      >
                        {task.priority}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>

                    <h4 className="font-semibold text-foreground mb-2">{task.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{task.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-border">
                          <AvatarImage src={task.assignee.avatar} />
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {task.assignee.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {task.dueDate}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                      <Badge variant="outline" className="text-xs bg-secondary/50">
                        {task.committee}
                      </Badge>
                    </div>
                  </div>
                ))}

                {/* Add Task Button */}
                <button className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tasks;
