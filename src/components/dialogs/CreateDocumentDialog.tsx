import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
  file_type: z.string().default("PDF"),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface CreateDocumentDialogProps {
  children: React.ReactNode;
}

export function CreateDocumentDialog({ children }: CreateDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [fileType, setFileType] = useState("PDF");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      file_type: "PDF",
    },
  });

  const onSubmit = async (data: DocumentFormData) => {
    if (!user) {
      toast.error("You must be logged in to create documents");
      return;
    }

    try {
      const file = fileInputRef.current?.files?.[0];
      let fileUrl = null;
      let fileSize = null;

      // Upload file to Supabase Storage if provided
      if (file) {
        fileSize = `${file.size}`;
        
        // Create a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          // If bucket doesn't exist, create it or use public URL
          console.error("Storage upload error:", uploadError);
          
          // Try to get public URL if bucket exists but upload failed
          const { data: publicUrlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);
          
          if (publicUrlData?.publicUrl) {
            fileUrl = publicUrlData.publicUrl;
          } else {
            // If storage isn't set up, save document without file URL
            toast.warning("File storage not configured. Document saved without file attachment.");
          }
        } else {
          // Get public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('documents')
            .getPublicUrl(uploadData.path);
          
          fileUrl = publicUrlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from("documents")
        .insert({
          name: data.name,
          description: data.description || null,
          file_type: fileType,
          file_size: fileSize,
          file_url: fileUrl,
          created_by: user.id,
        });

      if (error) {
        console.error("Error creating document:", error);
        throw error;
      }

      toast.success(`Document "${data.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      reset();
      setFileType("PDF");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setOpen(false);
    } catch (error) {
      console.error("Error creating document:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create document. Please try again.";
      toast.error(errorMessage);
    }
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
            <Label htmlFor="file_type">File Type *</Label>
            <Select value={fileType} onValueChange={(value) => {
              setFileType(value);
              setValue("file_type", value);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="DOC">DOC</SelectItem>
                <SelectItem value="DOCX">DOCX</SelectItem>
                <SelectItem value="TXT">TXT</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File (Optional)</Label>
            <Input
              id="file"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
            />
            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, or TXT files. File upload will be available after Storage setup.</p>
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
