import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Filter, Mail, Phone, Grid, List, UserPlus, Users, Shield, X } from "lucide-react";
import { cn, formatCrossingDisplay } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditUserRoleDialog } from "@/components/dialogs/EditUserRoleDialog";
import { useAuth } from "@/contexts/AuthContext";

const roleColors: Record<string, string> = {
  admin: "bg-primary/20 text-primary border-primary/30",
  e_board: "bg-primary/20 text-primary border-primary/30",
  committee_chairman: "bg-accent/20 text-accent border-accent/30",
  member: "bg-secondary text-secondary-foreground border-secondary",
  alumni: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

// E-board display order: Polemarch first, then by title
const EBOARD_ORDER: string[] = [
  "Bryce Perkins",           // Polemarch
  "Mael Blunt",              // Vice Polemarch
  "Doole Gaiende Edwards",   // Keeper of exchequer
  "Don Jordan Duplan",       // Keeper of Records
  "Carsen Manuel",           // Historian
  "Jeremiah Ramirez",        // Strategist
  "Grant Hill",              // Lt. Strategist
];

const Members = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: "all",
    committee: "all",
  });
  const { hasRole } = useAuth();

  // Only admins can edit roles
  const canEditRoles = hasRole("admin");

  // Fetch profiles from database (exclude admin accounts)
  const { data: profiles = [], isLoading, error: profilesError } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      // First get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Get all user roles to identify admin accounts
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        throw rolesError;
      }

      // Create a set of admin user IDs
      const adminUserIds = new Set(
        rolesData?.filter(r => r.role === "admin").map(r => r.user_id) || []
      );

      // Filter out admin accounts and deduplicate
      if (profilesData) {
        const seen = new Set<string>();
        return profilesData.filter((profile) => {
          // Exclude admin accounts
          if (adminUserIds.has(profile.user_id)) {
            return false;
          }
          // Deduplicate by user_id (keep first occurrence)
          if (seen.has(profile.user_id)) {
            return false;
          }
          seen.add(profile.user_id);
          return true;
        });
      }
      
      return [];
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

  // Get unique committees
  const committees = [...new Set(profiles.map(p => p.committee).filter(Boolean))];

  const filteredMembers = profiles.filter((m) => {
    const matchesSearch = 
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.committee?.toLowerCase() || "").includes(search.toLowerCase());
    
    const role = getRoleForUser(m.user_id);
    const matchesRole = filters.role === "all" || role === filters.role;
    const matchesCommittee = filters.committee === "all" || m.committee === filters.committee;
    
    return matchesSearch && matchesRole && matchesCommittee;
  });

  const activeFiltersCount = 
    (filters.role !== "all" ? 1 : 0) +
    (filters.committee !== "all" ? 1 : 0);

  // E-board first (in EBOARD_ORDER), then everyone by crossing year (newest) and line_order
  const sortedMembers = useMemo(() => {
    const norm = (s: string) => (s || "").toLowerCase().trim();
    const eboardRank = (fullName: string) => {
      const i = EBOARD_ORDER.findIndex((n) => norm(n) === norm(fullName));
      return i >= 0 ? i : 999999;
    };
    return [...filteredMembers].sort((a, b) => {
      const roleA = getRoleForUser(a.user_id);
      const roleB = getRoleForUser(b.user_id);
      const aIsEboard = roleA === "e_board";
      const bIsEboard = roleB === "e_board";
      if (aIsEboard && !bIsEboard) return -1;
      if (!aIsEboard && bIsEboard) return 1;
      if (aIsEboard && bIsEboard) {
        return eboardRank(a.full_name ?? "") - eboardRank(b.full_name ?? "");
      }
      // Same tier: by crossing_year desc, then line_order asc
      const yearA = (a as { crossing_year?: number | null }).crossing_year ?? -1;
      const yearB = (b as { crossing_year?: number | null }).crossing_year ?? -1;
      if (yearB !== yearA) return yearB - yearA;
      const lineA = (a as { line_order?: number | null }).line_order ?? 999999;
      const lineB = (b as { line_order?: number | null }).line_order ?? 999999;
      return lineA - lineB;
    });
  }, [filteredMembers, userRoles]);

  const clearFilters = () => {
    setFilters({ role: "all", committee: "all" });
  };

  const totalMembers = profiles.length;
  
  // Calculate active members (everyone except alumni)
  const activeMembers = profiles.filter(
    (m) => getRoleForUser(m.user_id) !== "alumni"
  ).length;
  
  // Calculate alumni count
  const alumniCount = profiles.filter(
    (m) => getRoleForUser(m.user_id) === "alumni"
  ).length;

  // Calculate "New This Year" - members from the latest crossing year
  // Find the latest crossing year
  const crossingYears = profiles
    .map((p) => (p as any).crossing_year)
    .filter((year): year is number => year !== null && year !== undefined);
  
  const latestCrossingYear = crossingYears.length > 0 ? Math.max(...crossingYears) : 0;
  
  // Count members with the latest crossing year
  const newThisYear = profiles.filter(
    (m) => (m as any).crossing_year === latestCrossingYear && latestCrossingYear > 0
  ).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Members</h1>
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
                           <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                             <X className="w-3 h-3 mr-1" />
                             Clear
                           </Button>
                         )}
                       </div>

                       <div className="space-y-2">
                         <Label>Role</Label>
                         <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                           <SelectTrigger>
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="all">All Roles</SelectItem>
                             <SelectItem value="admin">Admin</SelectItem>
                             <SelectItem value="e_board">E-Board</SelectItem>
                             <SelectItem value="committee_chairman">Committee Chairman</SelectItem>
                             <SelectItem value="member">Member</SelectItem>
                             <SelectItem value="alumni">Alumni</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>

                       <div className="space-y-2">
                         <Label>Committee</Label>
                         <Select value={filters.committee} onValueChange={(value) => setFilters({ ...filters, committee: value })}>
                           <SelectTrigger>
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="all">All Committees</SelectItem>
                             {committees.map((committee) => (
                               <SelectItem key={committee} value={committee || ""}>
                                 {committee}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                     </div>
                   </PopoverContent>
                 </Popover>
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
            <p className="text-2xl font-display font-bold text-foreground">{activeMembers}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{alumniCount}</p>
            <p className="text-sm text-muted-foreground">Alumni</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{newThisYear}</p>
            <p className="text-sm text-muted-foreground">New This Year</p>
          </div>
        </div>

        {/* Error State */}
        {profilesError && (
          <div className="glass-card rounded-xl p-12 text-center border-destructive border-2">
            <p className="text-destructive font-semibold mb-2">Error loading members</p>
            <p className="text-sm text-muted-foreground">{profilesError.message}</p>
          </div>
        )}

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
            {sortedMembers.map((member, index) => {
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
                      {formatCrossingDisplay(member) && (
                        <p className="text-sm text-muted-foreground mt-1 font-medium">
                          {formatCrossingDisplay(member)}
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
                    <TableHead>Crossing</TableHead>
                    <TableHead>Committee</TableHead>
                    <TableHead>Contact</TableHead>
                    {canEditRoles && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMembers.map((member) => {
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
                        <TableCell className="text-sm text-muted-foreground font-medium">
                          {formatCrossingDisplay(member) || "-"}
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