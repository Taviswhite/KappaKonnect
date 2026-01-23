import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Filter, Mail, Phone, Grid, List, UserPlus, Users, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditUserRoleDialog } from "@/components/dialogs/EditUserRoleDialog";
import { useAuth } from "@/contexts/AuthContext";

const roleColors: Record<string, string> = {
  admin: "bg-primary/20 text-primary border-primary/30",
  officer: "bg-primary/20 text-primary border-primary/30",
  committee_chairman: "bg-accent/20 text-accent border-accent/30",
  member: "bg-secondary text-secondary-foreground border-secondary",
  alumni: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const Members = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const { hasRole } = useAuth();

  // Only admins can edit roles
  const canEditRoles = hasRole("admin");

  // Fetch profiles from database
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch roles
  const { data: userRoles = [] } = useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const getRoleForUser = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || "member";
  };

  const filteredMembers = profiles.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.committee?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const totalMembers = profiles.length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Members</h1>
            <p className="text-muted-foreground mt-1">Directory of all chapter members</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.info("Filter options coming soon!")}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{totalMembers}</p>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{totalMembers}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground">Alumni</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground">New This Year</p>
          </div>
        </div>

        {/* Members Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card rounded-xl p-6 h-40 animate-pulse" />
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              {search ? "No members found" : "No members yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search ? "Try a different search term" : "Members will appear here when they sign up"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => {
              const role = getRoleForUser(member.user_id);
              const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
              return (
                <div
                  key={member.id}
                  className="glass-card rounded-xl p-6 hover:scale-[1.02] transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-display">
                        {member.full_name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-foreground">
                        {member.full_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", roleColors[role] || "bg-muted")}
                        >
                          {roleLabel}
                        </Badge>
                        {canEditRoles && (
                          <EditUserRoleDialog
                            userId={member.user_id}
                            userName={member.full_name}
                            currentRole={role}
                          >
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Shield className="w-3 h-3" />
                            </Button>
                          </EditUserRoleDialog>
                        )}
                      </div>
                      {member.committee && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {member.committee}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </a>
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {member.phone}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px]">Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Committee</TableHead>
                    <TableHead>Contact</TableHead>
                    {canEditRoles && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const role = getRoleForUser(member.user_id);
                    const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                    return (
                      <TableRow key={member.id} className="hover:bg-secondary/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-primary">
                              <AvatarImage src={member.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {member.full_name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{member.full_name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", roleColors[role] || "bg-muted")}>
                            {roleLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{member.committee || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={`mailto:${member.email}`}>
                                <Mail className="w-4 h-4" />
                              </a>
                            </Button>
                            {member.phone && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={`tel:${member.phone}`}>
                                  <Phone className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        {canEditRoles && (
                          <TableCell className="text-right">
                            <EditUserRoleDialog
                              userId={member.user_id}
                              userName={member.full_name}
                              currentRole={role}
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Shield className="w-4 h-4" />
                              </Button>
                            </EditUserRoleDialog>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Members;