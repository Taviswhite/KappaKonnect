import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, FileText, Upload, Download, PenTool, CheckCircle, Clock, AlertCircle, FolderOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateDocumentDialog } from "@/components/dialogs/CreateDocumentDialog";
import { CreateFolderDialog } from "@/components/dialogs/CreateFolderDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const statusConfig = {
  signed: { label: "Completed", icon: CheckCircle, className: "bg-green-500/20 text-green-400 border-green-500/30" },
  pending: { label: "In Progress", icon: Clock, className: "bg-accent/20 text-accent border-accent/30" },
  action_required: { label: "Action Required", icon: AlertCircle, className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const Documents = () => {
  const [search, setSearch] = useState("");

  // Fetch documents from database (when table exists)
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      // Check if documents table exists, if not return empty array
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        // Table doesn't exist yet, return empty array
        if (error.code === "42P01") {
          return [];
        }
        throw error;
      }
      return data || [];
    },
  });

  // Filter documents by search
  const filteredDocuments = documents.filter((doc) =>
    doc.name?.toLowerCase().includes(search.toLowerCase()) ||
    doc.file_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground mt-1">Manage and sign important documents</p>
          </div>
          <div className="flex items-center gap-3">
            <CreateDocumentDialog>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </CreateDocumentDialog>
            <CreateDocumentDialog>
              <Button variant="hero" size="sm">
                <PenTool className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </CreateDocumentDialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {isLoading ? (
          <div className="glass-card rounded-xl p-12">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-secondary/30 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-display font-bold text-foreground mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground mb-6">
              {search ? "No documents match your search" : "Upload your first document to get started"}
            </p>
            <CreateDocumentDialog>
              <Button variant="hero">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </CreateDocumentDialog>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-secondary/50 text-sm font-semibold text-muted-foreground">
              <div className="col-span-5">Document</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Modified</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-1"></div>
            </div>

            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/30 transition-colors border-t border-border"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{doc.name || "Untitled Document"}</p>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground">{doc.description}</p>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <Badge variant="outline" className="text-xs">
                    {doc.file_type || "Document"}
                  </Badge>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {doc.updated_at ? format(new Date(doc.updated_at), "MMM d, yyyy") : "-"}
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {doc.file_size ? doc.file_size : "-"}
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  {doc.file_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(doc.file_url, "_blank")}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Documents;
