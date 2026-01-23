import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, FileText, Upload, Download, PenTool, CheckCircle, Clock, AlertCircle, FolderOpen, Plus, Globe, Lock, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateDocumentDialog } from "@/components/dialogs/CreateDocumentDialog";
import { CreateFolderDialog } from "@/components/dialogs/CreateFolderDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subMonths, subWeeks } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

const statusConfig = {
  signed: { label: "Completed", icon: CheckCircle, className: "bg-green-500/20 text-green-400 border-green-500/30" },
  pending: { label: "In Progress", icon: Clock, className: "bg-accent/20 text-accent border-accent/30" },
  action_required: { label: "Action Required", icon: AlertCircle, className: "bg-destructive/20 text-destructive border-destructive/30" },
};

const Documents = () => {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    fileType: "all",
    visibility: "all",
    dateRange: "all",
  });
  const { user } = useAuth();

  // Fetch documents from database (RLS will filter by visibility automatically)
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        if (error.code === "42P01") {
          return [];
        }
        throw error;
      }
      return data || [];
    },
  });

  // Filter documents by search and filters
  const filteredDocuments = documents.filter((doc) => {
    // Search filter
    const matchesSearch = 
      doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.file_type?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    // File type filter
    if (filters.fileType !== "all" && doc.file_type !== filters.fileType) {
      return false;
    }

    // Visibility filter
    if (filters.visibility !== "all" && doc.visibility !== filters.visibility) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== "all" && doc.updated_at) {
      const docDate = new Date(doc.updated_at);
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.dateRange) {
        case "today":
          cutoffDate = subDays(now, 1);
          break;
        case "week":
          cutoffDate = subWeeks(now, 1);
          break;
        case "month":
          cutoffDate = subMonths(now, 1);
          break;
        case "year":
          cutoffDate = subMonths(now, 12);
          break;
        default:
          return true;
      }

      if (docDate < cutoffDate) {
        return false;
      }
    }

    return true;
  });

  const activeFiltersCount = 
    (filters.fileType !== "all" ? 1 : 0) +
    (filters.visibility !== "all" ? 1 : 0) +
    (filters.dateRange !== "all" ? 1 : 0);

  const clearFilters = () => {
    setFilters({ fileType: "all", visibility: "all", dateRange: "all" });
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
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filter
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Filters</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>File Type</Label>
                  <Select
                    value={filters.fileType}
                    onValueChange={(value) => setFilters({ ...filters, fileType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="DOC">DOC</SelectItem>
                      <SelectItem value="DOCX">DOCX</SelectItem>
                      <SelectItem value="TXT">TXT</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={filters.visibility}
                    onValueChange={(value) => setFilters({ ...filters, visibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Visibility</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Modified Date</Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
              <div className="col-span-4">Document</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Visibility</div>
              <div className="col-span-2">Modified</div>
              <div className="col-span-2">Size</div>
            </div>

            {filteredDocuments.map((doc) => {
              const VisibilityIcon = doc.visibility === "public" ? Globe : doc.visibility === "shared" ? Users : Lock;
              const visibilityLabel = doc.visibility === "public" ? "Public" : doc.visibility === "shared" ? "Shared" : "Private";
              const visibilityColor = doc.visibility === "public" ? "bg-green-500/20 text-green-400 border-green-500/30" : 
                                     doc.visibility === "shared" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                                     "bg-muted text-muted-foreground border-muted";
              
              return (
                <div
                  key={doc.id}
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/30 transition-colors border-t border-border"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doc.name || "Untitled Document"}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="outline" className="text-xs">
                      {doc.file_type || "Document"}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="outline" className={cn("text-xs flex items-center gap-1 w-fit", visibilityColor)}>
                      <VisibilityIcon className="w-3 h-3" />
                      {visibilityLabel}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {doc.updated_at ? format(new Date(doc.updated_at), "MMM d, yyyy") : "-"}
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {doc.file_size ? `${(parseInt(doc.file_size) / 1024).toFixed(1)} KB` : "-"}
                    </span>
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
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Documents;
