import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Shield, 
  Users, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditUserRoleDialog } from "@/components/dialogs/EditUserRoleDialog";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const roleColors: Record<string, string> = {
  admin: "bg-primary/20 text-primary border-primary/30",
  officer: "bg-primary/20 text-primary border-primary/30",
  committee_chairman: "bg-accent/20 text-accent border-accent/30",
  member: "bg-secondary text-secondary-foreground border-secondary",
  alumni: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

type AppRole = "admin" | "officer" | "committee_chairman" | "member" | "alumni";

const AdminPanel = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  // Only admins can access this page
  const isAdmin = hasRole("admin");

  // Fetch profiles from database
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
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
  const { data: userRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch auth users to check email confirmation status
  const { data: authUsers = [] } = useQuery({
    queryKey: ["auth-users"],
    queryFn: async () => {
      // Note: This requires admin access to auth.users table
      // For now, we'll use profiles and assume confirmed if profile exists
      return profiles.map(p => ({ id: p.user_id, email_confirmed: true }));
    },
    enabled: isAdmin,
  });

  const getRoleForUser = (userId: string): AppRole => {
    const role = userRoles.find(r => r.user_id === userId);
    return (role?.role as AppRole) || "member";
  };

  const isLoading = profilesLoading || rolesLoading;

  // Filter members
  const filteredMembers = profiles.filter((m) => {
    const matchesSearch = 
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.phone?.toLowerCase() || "").includes(search.toLowerCase());
    
    const role = getRoleForUser(m.user_id);
    const matchesRole = roleFilter === "all" || role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const stats = {
    total: profiles.length,
    admins: userRoles.filter(r => r.role === "admin").length,
    officers: userRoles.filter(r => r.role === "officer").length,
    members: userRoles.filter(r => r.role === "member").length,
    alumni: userRoles.filter(r => r.role === "alumni").length,
    committee_chairmen: userRoles.filter(r => r.role === "committee_chairman").length,
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
    toast.success("Data refreshed");
  };

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You need admin privileges to access this page.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, roles, and system settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("Export feature coming soon!")}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Users</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold text-primary">{stats.admins}</p>
              <p className="text-xs text-muted-foreground mt-1">Admins</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold text-primary">{stats.officers}</p>
              <p className="text-xs text-muted-foreground mt-1">Officers</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold text-accent">{stats.committee_chairmen}</p>
              <p className="text-xs text-muted-foreground mt-1">Chairs</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold text-foreground">{stats.members}</p>
              <p className="text-xs text-muted-foreground mt-1">Members</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold text-purple-400">{stats.alumni}</p>
              <p className="text-xs text-muted-foreground mt-1">Alumni</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px] bg-secondary/50">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="officer">Officer</SelectItem>
                    <SelectItem value="committee_chairman">Committee Chairman</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user roles and permissions. Click the shield icon to change a user's role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-secondary/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  {search || roleFilter !== "all" ? "No users found" : "No users yet"}
                </h3>
                <p className="text-muted-foreground">
                  {search || roleFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Users will appear here when they sign up"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[50px]">User</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Committee</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => {
                      const role = getRoleForUser(member.user_id);
                      const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                      return (
                        <TableRow key={member.id} className="hover:bg-secondary/30">
                          <TableCell>
                            <Avatar className="w-10 h-10 border border-primary">
                              <AvatarImage src={member.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {member.full_name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{member.full_name}</TableCell>
                          <TableCell>
                            <a 
                              href={`mailto:${member.email}`}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            {member.phone ? (
                              <a 
                                href={`tel:${member.phone}`}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                                {member.phone}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", roleColors[role] || "bg-muted")}
                            >
                              {roleLabel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {member.committee || "-"}
                            </span>
                          </TableCell>
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Info */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="w-5 h-5" />
              Admin Controls
            </CardTitle>
            <CardDescription>
              As an admin, you have full control over the application. Use this panel to manage user roles and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Role Management
                </h4>
                <p className="text-sm text-muted-foreground">
                  Click the shield icon next to any user to change their role. You can assign Admin, Officer, Committee Chairman, Member, or Alumni roles.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Important Notes
                </h4>
                <p className="text-sm text-muted-foreground">
                  Be careful when assigning Admin roles. Admins have full access to all features and can manage other users' roles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminPanel;
