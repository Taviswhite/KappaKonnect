import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const folderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
});

type FolderFormData = z.infer<typeof folderSchema>;

interface CreateFolderDialogProps {
  children: React.ReactNode;
}

export function CreateFolderDialog({ children }: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
  });

  const onSubmit = async (data: FolderFormData) => {
    if (!user) {
      toast.error("You must be logged in to create folders");
      return;
    }

    try {
      const { error } = await supabase
        .from("document_folders")
        .insert({
          name: data.name,
          created_by: user.id,
        });

      if (error) {
        console.error("Error creating folder:", error);
        if (error.code === "42501") {
          toast.error("You don't have permission to create folders. Ensure you're logged in and that migrations have been applied (supabase db push).");
        } else {
          toast.error(error.message || "Failed to create folder. Please try again.");
        }
        return;
      }

      toast.success(`Folder "${data.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["document_folders"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Create Folder
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Meeting Minutes"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Folder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
