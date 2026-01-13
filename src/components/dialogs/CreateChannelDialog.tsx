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
import { Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const channelSchema = z.object({
  name: z.string().min(1, "Channel name is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed"),
  description: z.string().optional(),
});

type ChannelFormData = z.infer<typeof channelSchema>;

interface CreateChannelDialogProps {
  children: React.ReactNode;
  onChannelCreated?: () => void;
}

export function CreateChannelDialog({ children, onChannelCreated }: CreateChannelDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
  });

  const onSubmit = async (data: ChannelFormData) => {
    if (!user) {
      toast.error("You must be logged in to create a channel");
      return;
    }

    try {
      const { error } = await supabase
        .from("channels")
        .insert({
          name: data.name,
          description: data.description || null,
          created_by: user.id,
          is_private: false,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("A channel with this name already exists");
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Channel #${data.name} created!`);
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      reset();
      setOpen(false);
      onChannelCreated?.();
    } catch (error) {
      console.error("Error creating channel:", error);
      toast.error("Failed to create channel. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Create Channel
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name *</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">#</span>
              <Input
                id="name"
                {...register("name")}
                placeholder="general"
                className={errors.name ? "border-destructive" : ""}
              />
            </div>
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            <p className="text-xs text-muted-foreground">Use lowercase letters, numbers, and hyphens only</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="What is this channel about?"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
