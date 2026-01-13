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
import { FileText } from "lucide-react";

const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface CreateDocumentDialogProps {
  children: React.ReactNode;
}

export function CreateDocumentDialog({ children }: CreateDocumentDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  });

  const onSubmit = async (data: DocumentFormData) => {
    // Note: This would require a documents table in the database
    // For now, we'll just show a success message
    // In a real implementation, you would:
    // 1. Create a documents table in Supabase
    // 2. Upload file to Supabase Storage
    // 3. Insert document record: await supabase.from("documents").insert({ name: data.name, ... })
    
    toast.success(`Document "${data.name}" created! (Note: Database table needed for persistence)`);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create Document
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Document Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Chapter Constitution"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Document description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx"
            />
            <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX files only</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
