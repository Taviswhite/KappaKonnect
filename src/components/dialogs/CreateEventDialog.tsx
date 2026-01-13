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
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().optional(),
  event_type: z.enum(["meeting", "service", "social", "executive"]),
  meeting_link: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventDialogProps {
  children: React.ReactNode;
}

export function CreateEventDialog({ children }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      event_type: "meeting",
    },
  });

  const onSubmit = async (data: EventFormData) => {
    if (!user) {
      toast.error("You must be logged in to create events");
      return;
    }

    try {
      const { error } = await supabase.from("events").insert({
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        start_time: data.start_time,
        end_time: data.end_time || null,
        event_type: data.event_type,
        created_by: user.id,
        meeting_link: data.meeting_link || null,
      });

      if (error) throw error;

      toast.success("Event created successfully!");
      queryClient.invalidateQueries({ queryKey: ["all-events"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-events-count"] });
      queryClient.invalidateQueries({ queryKey: ["next-event"] });
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create New Event
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Chapter Meeting"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_type">Event Type *</Label>
            <Select
              value={watch("event_type")}
              onValueChange={(value) => setValue("event_type", value as EventFormData["event_type"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Event details..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="Chapter House or Virtual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_link">Meeting Link (Optional)</Label>
            <Input
              id="meeting_link"
              type="url"
              {...register("meeting_link")}
              placeholder="https://zoom.us/j/..."
            />
            {errors.meeting_link && <p className="text-sm text-destructive">{errors.meeting_link.message}</p>}
            <p className="text-xs text-muted-foreground">Zoom, Google Meet, or other video conference link</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                {...register("start_time")}
                className={errors.start_time ? "border-destructive" : ""}
              />
              {errors.start_time && <p className="text-sm text-destructive">{errors.start_time.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="datetime-local"
                {...register("end_time")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
