import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, FileText, Upload, Download, PenTool, CheckCircle, Clock, AlertCircle, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const documents = [
  {
    id: 1,
    name: "Chapter Constitution",
    type: "PDF",
    size: "2.4 MB",
    lastModified: "Dec 15, 2025",
    status: "signed",
    signers: 48,
    totalSigners: 48,
  },
  {
    id: 2,
    name: "Liability Waiver - Spring 2026",
    type: "PDF",
    size: "1.1 MB",
    lastModified: "Jan 8, 2026",
    status: "pending",
    signers: 32,
    totalSigners: 48,
  },
  {
    id: 3,
    name: "Code of Conduct Agreement",
    type: "PDF",
    size: "890 KB",
    lastModified: "Jan 5, 2026",
    status: "pending",
    signers: 45,
    totalSigners: 48,
  },
  {
    id: 4,
    name: "Financial Responsibility Form",
    type: "PDF",
    size: "456 KB",
    lastModified: "Jan 2, 2026",
    status: "action_required",
    signers: 0,
    totalSigners: 48,
  },
  {
    id: 5,
    name: "Event Planning Template",
    type: "DOCX",
    size: "320 KB",
    lastModified: "Dec 20, 2025",
    status: "signed",
    signers: 8,
    totalSigners: 8,
  },
];

const folders = [
  { id: 1, name: "Meeting Minutes", count: 24 },
  { id: 2, name: "Financial Reports", count: 12 },
  { id: 3, name: "Event Documentation", count: 36 },
  { id: 4, name: "Member Forms", count: 15 },
];

const statusConfig = {
  signed: { label: "Completed", icon: CheckCircle, className: "bg-green-500/20 text-green-400 border-green-500/30" },
  pending: { label: "In Progress", icon: Clock, className: "bg-accent/20 text-accent border-accent/30" },
  action_required: { label: "Action Required", icon: AlertCircle, className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const Documents = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground mt-1">Manage and sign important documents</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button variant="hero" size="sm">
              <PenTool className="w-4 h-4 mr-2" />
              Request Signature
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-10 bg-secondary/50" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Folders Sidebar */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-display font-bold mb-4">Folders</h3>
            <div className="space-y-2">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <FolderOpen className="w-5 h-5 text-accent" />
                  <span className="flex-1 text-foreground">{folder.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {folder.count}
                  </Badge>
                </button>
              ))}
            </div>
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

              {documents.map((doc) => {
                const status = statusConfig[doc.status as keyof typeof statusConfig];
                const progress = (doc.signers / doc.totalSigners) * 100;
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
                          {doc.type} • {doc.size}
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
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {doc.signers}/{doc.totalSigners}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">{doc.lastModified}</div>
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                      {doc.status !== "signed" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                          <PenTool className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Documents;
