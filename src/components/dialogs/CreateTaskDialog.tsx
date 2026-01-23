import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListTodo } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional(),
  committee: z.string().optional(),
  assigned_to: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskDialogProps {
  children: React.ReactNode;
}

export function CreateTaskDialog({ children }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  // Check if user can assign tasks (only officers, admins, and committee chairmen)
  const canAssignTasks = hasRole("admin") || hasRole("officer") || hasRole("committee_chairman");

  // Fetch members for assignment
  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, user_id")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: "medium",
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    if (!user) {
      toast.error("You must be logged in to create tasks");
      return;
    }

    try {
      // Only allow assignment if user has permission
      let assignedTo = null;
      if (canAssignTasks && data.assigned_to && data.assigned_to !== "unassigned") {
        assignedTo = data.assigned_to;
      }

      const taskData: Database["public"]["Tables"]["tasks"]["Insert"] = {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
        committee: data.committee || null,
        assigned_to: assignedTo,
        created_by: user.id,
        status: "todo",
      };

      const { data: insertedTask, error } = await supabase
        .from("tasks")
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        // Show more specific error message
        if (error.code === "42501") {
          toast.error("Permission denied. Please run the 'fix_task_creation_permissions.sql' migration in Supabase.");
        } else if (error.code === "42P01") {
          toast.error("Tasks table doesn't exist. Please run the database migration.");
        } else if (error.message?.includes("assign tasks")) {
          toast.error("You don't have permission to assign tasks. The task will be created without assignment.");
          // Retry without assignment
          const retryData = { ...taskData, assigned_to: null };
          const { error: retryError } = await supabase
            .from("tasks")
            .insert(retryData)
            .select()
            .single();
          if (retryError) {
            toast.error(`Failed to create task: ${retryError.message}`);
            return;
          }
          toast.success("Task created successfully (unassigned)!");
          queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
          queryClient.invalidateQueries({ queryKey: ["open-tasks-count"] });
          queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
          reset();
          setOpen(false);
          return;
        } else if (error.message) {
          toast.error(`Failed to create task: ${error.message}`);
        } else {
          toast.error("Failed to create task. Please check the console for details.");
        }
        return;
      }

      toast.success("Task created successfully!");
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks-count"] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create task: ${errorMessage}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListTodo className="w-5 h-5" />
            Create New Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Complete budget report"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Task details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={watch("priority")}
                onValueChange={(value) => setValue("priority", value as TaskFormData["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="datetime-local"
                {...register("due_date")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="committee">Committee</Label>
            <Input
              id="committee"
              {...register("committee")}
              placeholder="Social Committee"
            />
          </div>

          {canAssignTasks ? (
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assign To (Optional)</Label>
              <Select
                value={watch("assigned_to") || undefined}
                onValueChange={(value) => setValue("assigned_to", value === "unassigned" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.user_id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assignment</Label>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground">
                <p>This task will be unassigned. Only officers, admins, and committee chairmen can assign tasks to members.</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
