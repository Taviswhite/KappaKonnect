import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateDocumentDialogProps {
  trigger: React.ReactNode;
}

export function CreateDocumentDialog({ trigger }: CreateDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    file_type: "PDF",
    folder_id: "",
    requires_signature: false,
    total_signers: 0,
  });

  // Fetch folders
  const { data: folders = [] } = useQuery({
    queryKey: ["document-folders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_folders")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (!formData.name) {
      toast.error("Please enter a document name");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("documents").insert({
        name: formData.name,
        file_type: formData.file_type,
        folder_id: formData.folder_id || null,
        requires_signature: formData.requires_signature,
        total_signers: formData.requires_signature ? formData.total_signers : 0,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Document created successfully!");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setOpen(false);
      setFormData({
        name: "",
        file_type: "PDF",
        folder_id: "",
        requires_signature: false,
        total_signers: 0,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="font-display">Create Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Document Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Document title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file_type">File Type</Label>
              <Select
                value={formData.file_type}
                onValueChange={(value) => setFormData({ ...formData, file_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="DOCX">DOCX</SelectItem>
                  <SelectItem value="XLSX">XLSX</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder">Folder</Label>
              <Select
                value={formData.folder_id}
                onValueChange={(value) => setFormData({ ...formData, folder_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="requires_signature">Requires Signatures</Label>
            <Switch
              id="requires_signature"
              checked={formData.requires_signature}
              onCheckedChange={(checked) => setFormData({ ...formData, requires_signature: checked })}
            />
          </div>

          {formData.requires_signature && (
            <div className="space-y-2">
              <Label htmlFor="total_signers">Total Signers Required</Label>
              <Input
                id="total_signers"
                type="number"
                min="1"
                value={formData.total_signers}
                onChange={(e) => setFormData({ ...formData, total_signers: parseInt(e.target.value) || 0 })}
                placeholder="Number of signatures needed"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? "Creating..." : "Create Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
