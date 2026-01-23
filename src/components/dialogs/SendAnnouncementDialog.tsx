import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Megaphone, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  message: z.string().min(1, "Message is required").max(500, "Message must be less than 500 characters"),
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface SendAnnouncementDialogProps {
  children: React.ReactNode;
}

export function SendAnnouncementDialog({ children }: SendAnnouncementDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
  });

  const onSubmit = async (data: AnnouncementFormData) => {
    if (!user) {
      toast.error("You must be logged in to send announcements");
      return;
    }

    try {
      // Call the create_announcement function
      const { error } = await supabase.rpc('create_announcement', {
        _title: data.title,
        _message: data.message,
        _link: data.link || null,
        _created_by: user.id,
      });

      if (error) {
        console.error("Error creating announcement:", error);
        throw error;
      }

      toast.success("Announcement sent to all members!");
      
      // Invalidate notifications query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
      
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error sending announcement:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send announcement. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Send Announcement
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Important Chapter Update"
              className={errors.title ? "border-destructive" : ""}
              maxLength={100}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Enter your announcement message..."
              rows={5}
              className={errors.message ? "border-destructive" : ""}
              maxLength={500}
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Optional Link</Label>
            <Input
              id="link"
              type="url"
              {...register("link")}
              placeholder="https://example.com"
              className={errors.link ? "border-destructive" : ""}
            />
            {errors.link && <p className="text-sm text-destructive">{errors.link.message}</p>}
            <p className="text-xs text-muted-foreground">Add a link for members to click (optional)</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send to All Members"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
