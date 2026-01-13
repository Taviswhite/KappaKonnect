import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateChannelDialogProps {
  trigger: React.ReactNode;
}

export function CreateChannelDialog({ trigger }: CreateChannelDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_private: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a channel");
      return;
    }

    if (!formData.name) {
      toast.error("Please enter a channel name");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("channels").insert({
        name: formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description || null,
        is_private: formData.is_private,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Channel created successfully!");
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        is_private: false,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="font-display">Create New Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. general, announcements"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this channel about?"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_private">Private Channel</Label>
            <Switch
              id="is_private"
              checked={formData.is_private}
              onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? "Creating..." : "Create Channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
