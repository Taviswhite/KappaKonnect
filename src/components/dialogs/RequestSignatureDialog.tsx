import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PenTool } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface RequestSignatureDialogProps {
  children: React.ReactNode;
  /** When provided, preselect this document in the dialog */
  preselectedDocumentId?: string | null;
  /** Documents list for the selector (when not preselected) */
  documents?: { id: string; name: string; requires_signature?: boolean | null; total_signers?: number | null }[];
}

export function RequestSignatureDialog({
  children,
  preselectedDocumentId,
  documents = [],
}: RequestSignatureDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(preselectedDocumentId ?? null);
  const [totalSigners, setTotalSigners] = useState<string>("1");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedDocId(preselectedDocumentId ?? null);
      setTotalSigners("1");
    }
    setOpen(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to request signatures.");
      return;
    }
    const docId = selectedDocId ?? preselectedDocumentId;
    if (!docId) {
      toast.error("Please select a document.");
      return;
    }
    const n = parseInt(totalSigners, 10);
    if (Number.isNaN(n) || n < 1) {
      toast.error("Enter a valid number of signers (at least 1).");
      return;
    }

    try {
      const { error } = await supabase
        .from("documents")
        .update({
          requires_signature: true,
          total_signers: n,
        })
        .eq("id", docId);

      if (error) {
        console.error("Request signature error:", error);
        toast.error(error.message || "Failed to update document.");
        return;
      }

      toast.success("Signature request updated. Members can now sign this document.");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document_signatures"] });
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  const docOptions = documents.length > 0 ? documents : [];
  const showDocSelect = !preselectedDocumentId && docOptions.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Request Signatures
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showDocSelect && (
            <div className="space-y-2">
              <Label>Document</Label>
              <Select
                value={selectedDocId ?? ""}
                onValueChange={(v) => setSelectedDocId(v || null)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent>
                  {docOptions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {preselectedDocumentId && (
            <p className="text-sm text-muted-foreground">
              Requesting signatures for the selected document.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="total_signers">Number of signers required</Label>
            <Input
              id="total_signers"
              type="number"
              min={1}
              value={totalSigners}
              onChange={(e) => setTotalSigners(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              Request Signatures
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
