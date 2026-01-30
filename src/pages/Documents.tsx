import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, FileText, Upload, Download, PenTool, CheckCircle, Clock, AlertCircle, FolderOpen, FolderPlus, FileCheck, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateFolderDialog } from "@/components/dialogs/CreateFolderDialog";
import { CreateDocumentDialog } from "@/components/dialogs/CreateDocumentDialog";
import { RequestSignatureDialog } from "@/components/dialogs/RequestSignatureDialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusConfig = {
  signed: { label: "Completed", icon: CheckCircle, className: "bg-green-500/20 text-green-400 border-green-500/30" },
  pending: { label: "In Progress", icon: Clock, className: "bg-accent/20 text-accent border-accent/30" },
  action_required: { label: "Action Required", icon: AlertCircle, className: "bg-destructive/20 text-destructive border-destructive/30" },
};

function formatFileSize(bytes: string | null | undefined): string {
  if (!bytes) return "—";
  const n = parseInt(bytes, 10);
  if (Number.isNaN(n)) return bytes;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

const Documents = () => {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ["document_folders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_folders")
        .select("id, name, created_by")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: allDocuments = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, name, file_type, file_size, file_url, folder_id, requires_signature, total_signers, updated_at, created_by")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: signaturesData } = useQuery({
    queryKey: ["document_signatures", allDocuments.map((d) => d.id).filter(Boolean)],
    queryFn: async () => {
      const docIds = allDocuments.map((d) => d.id).filter(Boolean);
      if (docIds.length === 0) return { count: {} as Record<string, number>, userIdsByDoc: {} as Record<string, string[]> };
      const { data, error } = await supabase
        .from("document_signatures")
        .select("document_id, user_id")
        .in("document_id", docIds);
      if (error) throw error;
      const count: Record<string, number> = {};
      const userIdsByDoc: Record<string, string[]> = {};
      (data ?? []).forEach((row) => {
        count[row.document_id] = (count[row.document_id] ?? 0) + 1;
        if (!userIdsByDoc[row.document_id]) userIdsByDoc[row.document_id] = [];
        userIdsByDoc[row.document_id].push(row.user_id);
      });
      return { count, userIdsByDoc };
    },
    enabled: !!user && allDocuments.length > 0,
  });

  const signatureCount = (docId: string) => signaturesData?.count?.[docId] ?? 0;
  const userHasSigned = (docId: string) =>
    !!user && (signaturesData?.userIdsByDoc?.[docId] ?? []).includes(user.id);

  const documents = useMemo(() => {
    if (!selectedFolderId) return allDocuments;
    return allDocuments.filter((d) => d.folder_id === selectedFolderId);
  }, [allDocuments, selectedFolderId]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allDocuments.forEach((d) => {
      const fid = d.folder_id ?? "__none__";
      counts[fid] = (counts[fid] ?? 0) + 1;
    });
    folders.forEach((f) => {
      if (!(f.id in counts)) counts[f.id] = 0;
    });
    return counts;
  }, [allDocuments, folders]);

  const filteredDocuments = useMemo(() => {
    if (!search.trim()) return documents;
    const s = search.toLowerCase().trim();
    return documents.filter((d) => d.name?.toLowerCase().includes(s));
  }, [documents, search]);

  const docStatus = (
    doc: { id: string; requires_signature?: boolean | null; total_signers?: number | null }
  ) => {
    if (!doc.requires_signature || (doc.total_signers ?? 0) === 0) return "signed";
    const signed = signatureCount(doc.id);
    if (signed >= (doc.total_signers ?? 0)) return "signed";
    return "pending";
  };

  const signers = (doc: { total_signers?: number | null }) => doc.total_signers ?? 0;

  const signDoc = async (documentId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("document_signatures").insert({
        document_id: documentId,
        user_id: user.id,
      });
      if (error) {
        if (error.code === "23505") {
          toast.info("You have already signed this document.");
        } else {
          toast.error(error.message || "Failed to sign document.");
        }
        return;
      }
      toast.success("Document signed.");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document_signatures"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign document.");
    }
  };

  const canDeleteDoc = (doc: { created_by?: string | null }) =>
    !!user && (hasRole("admin") || hasRole("e_board") || doc.created_by === user.id);

  const deleteDoc = async (doc: { id: string; name: string }) => {
    if (!canDeleteDoc(doc)) return;
    if (!window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) {
        toast.error(error.message || "Failed to delete document.");
        return;
      }
      toast.success("Document deleted.");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document_signatures"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete document.");
    }
  };

  const canDeleteFolder = (folder: { created_by?: string | null }) =>
    !!user && (hasRole("admin") || hasRole("e_board") || folder.created_by === user.id);

  const deleteFolder = async (folder: { id: string; name: string }) => {
    if (!canDeleteFolder(folder)) return;
    const count = folderCounts[folder.id] ?? 0;
    const message =
      count > 0
        ? `Delete folder "${folder.name}"? ${count} document(s) inside will be moved out of this folder (not deleted).`
        : `Delete folder "${folder.name}"?`;
    if (!window.confirm(message)) return;
    try {
      const { error } = await supabase.from("document_folders").delete().eq("id", folder.id);
      if (error) {
        toast.error(error.message || "Failed to delete folder.");
        return;
      }
      toast.success("Folder deleted.");
      if (selectedFolderId === folder.id) setSelectedFolderId(null);
      queryClient.invalidateQueries({ queryKey: ["document_folders"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete folder.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground mt-1">Manage and sign important documents</p>
          </div>
          <div className="flex items-center gap-3">
            <CreateFolderDialog>
              <Button variant="outline" size="sm">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </CreateFolderDialog>
            <CreateDocumentDialog folderId={selectedFolderId ?? undefined}>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </CreateDocumentDialog>
            {(hasRole("admin") || hasRole("e_board")) && (
              <RequestSignatureDialog documents={allDocuments}>
                <Button variant="hero" size="sm">
                  <PenTool className="w-4 h-4 mr-2" />
                  Request Signature
                </Button>
              </RequestSignatureDialog>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-10 bg-secondary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-display font-bold mb-4">Folders</h3>
            {foldersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left",
                    selectedFolderId === null && "bg-secondary"
                  )}
                >
                  <FolderOpen className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 text-foreground">All documents</span>
                  <Badge variant="outline" className="text-xs">
                    {allDocuments.length}
                  </Badge>
                </button>
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors group",
                      selectedFolderId === folder.id && "bg-secondary"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedFolderId(folder.id)}
                      className="flex flex-1 min-w-0 items-center gap-3 text-left"
                    >
                      <FolderOpen className="w-5 h-5 text-accent shrink-0" />
                      <span className="flex-1 text-foreground truncate">{folder.name}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {folderCounts[folder.id] ?? 0}
                      </Badge>
                    </button>
                    {canDeleteFolder(folder) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFolder(folder);
                        }}
                        title="Delete folder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-4">
            {documentsLoading ? (
              <div className="glass-card rounded-xl p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium text-foreground">No documents yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {search ? "No documents match your search." : "Upload a document or create a folder to get started."}
                </p>
                {!search && (
                  <CreateDocumentDialog folderId={selectedFolderId ?? undefined}>
                    <Button variant="hero" size="sm" className="mt-4">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload document
                    </Button>
                  </CreateDocumentDialog>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-secondary/50 text-sm font-semibold text-muted-foreground">
                  <div className="col-span-5">Document</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Signatures</div>
                  <div className="col-span-2">Modified</div>
                  <div className="col-span-1"></div>
                </div>
                {filteredDocuments.map((doc) => {
                  const status = docStatus(doc);
                  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;
                  const total = doc.total_signers ?? 0;
                  const signed = signatureCount(doc.id);
                  const progress = total > 0 ? Math.min(100, (signed / total) * 100) : 100;
                  const canSign = doc.requires_signature && !userHasSigned(doc.id);
                  return (
                    <div
                      key={doc.id}
                      className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/30 transition-colors cursor-pointer border-t border-border"
                    >
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          {doc.file_url ? (
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-foreground truncate block hover:text-primary hover:underline"
                              title="View file"
                            >
                              {doc.name}
                            </a>
                          ) : (
                            <p className="font-medium text-foreground truncate">{doc.name}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {doc.file_type ?? "PDF"} • {formatFileSize(doc.file_size)}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Badge variant="outline" className={cn("text-xs", config.className)}>
                          <config.icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden min-w-0">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {signed}/{doc.total_signers ?? 0}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">{formatDate(doc.updated_at)}</div>
                      <div className="col-span-1 flex items-center justify-end gap-1">
                        {doc.file_url && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                              title="View file"
                            >
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                              title="Download"
                            >
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" download>
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          </>
                        )}
                        {canSign && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => signDoc(doc.id)}
                            title="Sign document"
                          >
                            <FileCheck className="w-4 h-4" />
                          </Button>
                        )}
                        {status !== "signed" && (hasRole("admin") || hasRole("e_board")) && (
                          <RequestSignatureDialog
                            preselectedDocumentId={doc.id}
                            documents={allDocuments}
                          >
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Request signatures">
                              <PenTool className="w-4 h-4" />
                            </Button>
                          </RequestSignatureDialog>
                        )}
                        {canDeleteDoc(doc) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteDoc(doc)}
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Documents;
