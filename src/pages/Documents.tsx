import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, FileText, Upload, Download, PenTool, CheckCircle, Clock, AlertCircle, FolderOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CreateDocumentDialog } from "@/components/dialogs/CreateDocumentDialog";
import { CreateFolderDialog } from "@/components/dialogs/CreateFolderDialog";
import { toast } from "sonner";

const statusConfig = {
  signed: { label: "Completed", icon: CheckCircle, className: "bg-green-500/20 text-green-400 border-green-500/30" },
  pending: { label: "In Progress", icon: Clock, className: "bg-accent/20 text-accent border-accent/30" },
  action_required: { label: "Action Required", icon: AlertCircle, className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const Documents = () => {
  // Fetch documents
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*, document_signatures(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch folders
  const { data: folders = [] } = useQuery({
    queryKey: ["document-folders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_folders")
        .select("*, documents(count)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Calculate document status based on signatures
  const getDocumentStatus = (doc: any) => {
    if (!doc.requires_signature) return "signed";
    const signedCount = doc.document_signatures?.[0]?.count || 0;
    if (signedCount === 0) return "action_required";
    if (signedCount >= doc.total_signers) return "signed";
    return "pending";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground mt-1">Manage and sign important documents</p>
          </div>
          <div className="flex items-center gap-3">
            <CreateDocumentDialog 
              trigger={
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              }
            />
            <CreateDocumentDialog 
              trigger={
                <Button variant="hero" size="sm">
                  <PenTool className="w-4 h-4 mr-2" />
                  New Document
                </Button>
              }
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-10 bg-secondary/50" />
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.info("Filter coming soon!")}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Folders Sidebar */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">Folders</h3>
              <CreateFolderDialog 
                trigger={
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="w-4 h-4" />
                  </Button>
                }
              />
            </div>
            {folders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No folders yet</p>
            ) : (
              <div className="space-y-2">
                {folders.map((folder: any) => (
                  <button
                    key={folder.id}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <FolderOpen className="w-5 h-5 text-accent" />
                    <span className="flex-1 text-foreground">{folder.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {folder.documents?.[0]?.count || 0}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Documents List */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 bg-secondary/50 text-sm font-semibold text-muted-foreground">
                <div className="col-span-5">Document</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Signatures</div>
                <div className="col-span-2">Modified</div>
                <div className="col-span-1"></div>
              </div>

              {docsLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading documents...
                </div>
              ) : documents.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="w-12 h-12 mb-4 opacity-50" />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                documents.map((doc: any) => {
                  const docStatus = getDocumentStatus(doc);
                  const status = statusConfig[docStatus as keyof typeof statusConfig];
                  const signedCount = doc.document_signatures?.[0]?.count || 0;
                  const progress = doc.total_signers > 0 ? (signedCount / doc.total_signers) * 100 : 100;
                  
                  return (
                    <div
                      key={doc.id}
                      className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/30 transition-colors cursor-pointer border-t border-border"
                    >
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.file_type} • {doc.file_size || "Unknown size"}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Badge variant="outline" className={cn("text-xs", status.className)}>
                          <status.icon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        {doc.requires_signature ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {signedCount}/{doc.total_signers}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        {format(new Date(doc.updated_at), "MMM d, yyyy")}
                      </div>
                      <div className="col-span-1 flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Download coming soon!")}>
                          <Download className="w-4 h-4" />
                        </Button>
                        {docStatus !== "signed" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => toast.info("Sign coming soon!")}>
                            <PenTool className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Documents;
