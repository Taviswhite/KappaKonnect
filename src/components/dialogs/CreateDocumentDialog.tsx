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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { FileText, Globe, Lock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
  file_type: z.string().default("PDF"),
  visibility: z.enum(["public", "private", "shared"]).default("private"),
  shared_with_roles: z.array(z.string()).optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface CreateDocumentDialogProps {
  children: React.ReactNode;
  /** When provided, new document is created in this folder */
  folderId?: string | null;
}

export function CreateDocumentDialog({ children, folderId }: CreateDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [fileType, setFileType] = useState("PDF");
  const [visibility, setVisibility] = useState<"public" | "private" | "shared">("private");
  const [sharedRoles, setSharedRoles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  
  const isEBoardOrAdmin = hasRole("admin") || hasRole("e_board");

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
      visibility: "private",
    },
  });

  const onSubmit = async (data: DocumentFormData) => {
    if (!user) {
      toast.error("You must be logged in to create documents");
      return;
    }

    console.log("Creating document with data:", { name: data.name, fileType, user: user.id });

    try {
      const file = fileInputRef.current?.files?.[0];
      let fileUrl = null;
      let fileSize = null;

      // Upload file to Supabase Storage if provided
      if (file) {
        fileSize = `${file.size}`;
        
        try {
          // Create a unique filename
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${user.id}/${fileName}`;

          console.log("Uploading file to:", filePath);

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error("Storage upload error:", uploadError);
            // If bucket doesn't exist or permission denied, continue without file
            if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('new row violates')) {
              toast.warning("Storage bucket not configured. Document will be saved without file attachment. Please set up the 'documents' bucket in Supabase Storage.");
            } else {
              toast.warning(`File upload failed: ${uploadError.message}. Document will be saved without file attachment.`);
            }
            fileUrl = null;
          } else if (uploadData) {
            // Get public URL for the uploaded file
            const { data: publicUrlData } = supabase.storage
              .from('documents')
              .getPublicUrl(uploadData.path);
            
            fileUrl = publicUrlData.publicUrl;
            console.log("File uploaded successfully:", fileUrl);
          }
        } catch (storageError) {
          console.error("Storage error:", storageError);
          toast.warning("File upload failed. Document will be saved without file attachment.");
          fileUrl = null;
        }
      }

      // Prepare insert data
      const insertData: any = {
        name: data.name,
        file_type: fileType,
        file_size: fileSize,
        file_url: fileUrl,
        created_by: user.id,
        visibility: visibility,
      };
      if (folderId) {
        insertData.folder_id = folderId;
      }

      // Add sharing fields if visibility is "shared"
      if (visibility === "shared" && sharedRoles.length > 0) {
        insertData.shared_with_roles = sharedRoles;
      }

      console.log("Inserting document:", insertData);

      // Always try to save document metadata, even without file
      const { error: dbError, data: insertedData } = await supabase
        .from("documents")
        .insert(insertData)
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        console.error("Error code:", dbError.code);
        console.error("Error message:", dbError.message);
        console.error("Error details:", dbError.details);
        console.error("Error hint:", dbError.hint);
        
        // Show detailed error message
        let errorMsg = "Failed to create document. ";
        if (dbError.code === '42501') {
          errorMsg += "Permission denied. Please ensure you're logged in and have the correct permissions.";
        } else if (dbError.code === '42P01') {
          errorMsg += "Documents table not found. Please run database migrations.";
        } else if (dbError.code === '42703') {
          errorMsg += `Database schema mismatch: ${dbError.message}`;
        } else if (dbError.message) {
          errorMsg += dbError.message;
        } else {
          errorMsg += "Please check console for details.";
        }
        toast.error(errorMsg);
        throw dbError;
      }

      console.log("Document created successfully:", insertedData);

      toast.success(`Document "${data.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      reset();
      setFileType("PDF");
      setVisibility("private");
      setSharedRoles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setOpen(false);
    } catch (error) {
      console.error("Error creating document:", error);
      // Error toast already shown above, don't show duplicate
      if (!(error instanceof Error && error.message.includes("Failed to create document"))) {
        const errorMessage = error instanceof Error ? error.message : "Failed to create document. Please try again.";
        toast.error(errorMessage);
      }
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

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility *</Label>
            <Select 
              value={visibility} 
              onValueChange={(value: "public" | "private" | "shared") => {
                setVisibility(value);
                setValue("visibility", value);
                if (value !== "shared") {
                  setSharedRoles([]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {isEBoardOrAdmin && (
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Public (Visible to all members)</span>
                    </div>
                  </SelectItem>
                )}
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Private (Only you can see)</span>
                  </div>
                </SelectItem>
                <SelectItem value="shared">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Shared (Share with specific roles)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {!isEBoardOrAdmin && visibility === "public" && (
              <p className="text-xs text-destructive">Only E-Board and admins can create public documents.</p>
            )}
          </div>

          {visibility === "shared" && (
            <div className="space-y-2">
              <Label>Share with Roles</Label>
              <div className="space-y-2 p-3 border rounded-lg bg-secondary/30">
                {["e_board", "committee_chairman", "member", "alumni"].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={sharedRoles.includes(role)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSharedRoles([...sharedRoles, role]);
                        } else {
                          setSharedRoles(sharedRoles.filter(r => r !== role));
                        }
                      }}
                    />
                    <Label htmlFor={`role-${role}`} className="font-normal cursor-pointer capitalize">
                      {role.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
              {sharedRoles.length === 0 && (
                <p className="text-xs text-muted-foreground">Select at least one role to share with.</p>
              )}
            </div>
          )}

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
