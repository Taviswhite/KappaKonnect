import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  TableRow,
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
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Megaphone,
} from "lucide-react";
import { SendAnnouncementDialog } from "@/components/dialogs/SendAnnouncementDialog";
import { NextEventCard } from "@/components/dashboard/NextEventCard";
import { TaskList } from "@/components/dashboard/TaskList";
import { cn, formatCrossingDisplay } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditUserRoleDialog } from "@/components/dialogs/EditUserRoleDialog";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const roleColors: Record<string, string> = {
  admin: "bg-primary/20 text-primary border-primary/30",
  e_board: "bg-primary/20 text-primary border-primary/30",
  committee_chairman: "bg-accent/20 text-accent border-accent/30",
  member: "bg-secondary text-secondary-foreground border-secondary",
  alumni: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

type AppRole = "admin" | "e_board" | "committee_chairman" | "member" | "alumni";

const AdminPanel = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { hasRole, user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  // Fetch attendance records with user and event details
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance-records"],
    queryFn: async () => {
      // Fetch attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .order("checked_in_at", { ascending: false })
        .limit(100);
      
      if (attendanceError) throw attendanceError;
      if (!attendanceData || attendanceData.length === 0) return [];

      // Get unique user IDs and event IDs
      const userIds = [...new Set(attendanceData.map(a => a.user_id))];
      const eventIds = [...new Set(attendanceData.map(a => a.event_id))];

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email")
        .in("user_id", userIds);
      
      if (profilesError) throw profilesError;

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, title, start_time, location")
        .in("id", eventIds);
      
      if (eventsError) throw eventsError;

      // Join the data
      return attendanceData.map(record => ({
        ...record,
        profiles: profilesData?.find(p => p.user_id === record.user_id) || null,
        events: eventsData?.find(e => e.id === record.event_id) || null,
      }));
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
    e_board: userRoles.filter(r => r.role === "e_board").length,
    members: userRoles.filter(r => r.role === "member").length,
    alumni: userRoles.filter(r => r.role === "alumni").length,
    committee_chairmen: userRoles.filter(r => r.role === "committee_chairman").length,
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
    queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
    toast.success("Data refreshed");
  };

  const handleExport = async (type: "users" | "attendance") => {
    try {
      let csvContent = "";
      let filename = "";

      if (type === "users") {
        // Export users data
        const headers = ["Name", "Email", "Phone", "Role", "Committee", "Created At"];
        csvContent = headers.join(",") + "\n";

        filteredMembers.forEach((member) => {
          const role = getRoleForUser(member.user_id);
          const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          const row = [
            `"${member.full_name || ""}"`,
            `"${member.email || ""}"`,
            `"${member.phone || ""}"`,
            `"${roleLabel}"`,
            `"${member.committee || ""}"`,
            `"${member.created_at ? format(new Date(member.created_at), "yyyy-MM-dd HH:mm:ss") : ""}"`,
          ];
          csvContent += row.join(",") + "\n";
        });

        filename = `users_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
      } else {
        // Export attendance data
        const headers = ["Member Name", "Member Email", "Event Title", "Event Date", "Location", "Checked In At"];
        csvContent = headers.join(",") + "\n";

        attendanceRecords.forEach((record: any) => {
          const profile = record.profiles;
          const event = record.events;
          const row = [
            `"${profile?.full_name || "Unknown"}"`,
            `"${profile?.email || ""}"`,
            `"${event?.title || "Unknown Event"}"`,
            `"${event?.start_time ? format(parseISO(event.start_time), "yyyy-MM-dd HH:mm:ss") : ""}"`,
            `"${event?.location || ""}"`,
            `"${format(parseISO(record.checked_in_at), "yyyy-MM-dd HH:mm:ss")}"`,
          ];
          csvContent += row.join(",") + "\n";
        });

        filename = `attendance_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
      }

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${type === "users" ? "users" : "attendance"} data successfully!`);
    } catch (error) {
      toast.error(`Failed to export ${type === "users" ? "users" : "attendance"} data`);
      console.error("Export error:", error);
    }
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
      <div className="space-y-8 sm:space-y-10">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("users")}>
                  Export Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("attendance")}>
                  Export Attendance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          <Card className="glass-card rounded-xl border-0 card-hover">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-3xl sm:text-4xl font-display font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Users</p>
            </CardContent>
          </Card>
          <Card className="glass-card rounded-xl border-0 card-hover">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-3xl sm:text-4xl font-display font-bold text-primary">{stats.admins}</p>
              <p className="text-xs text-muted-foreground mt-1">Admins</p>
            </CardContent>
          </Card>
          <Card className="glass-card rounded-xl border-0 card-hover">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-3xl sm:text-4xl font-display font-bold text-primary">{stats.e_board}</p>
              <p className="text-xs text-muted-foreground mt-1">E-Board</p>
            </CardContent>
          </Card>
          <Card className="glass-card rounded-xl border-0 card-hover">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-3xl sm:text-4xl font-display font-bold text-accent">{stats.committee_chairmen}</p>
              <p className="text-xs text-muted-foreground mt-1">Chairs</p>
            </CardContent>
          </Card>
          <Card className="glass-card rounded-xl border-0 card-hover">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-3xl sm:text-4xl font-display font-bold text-foreground">{stats.members}</p>
              <p className="text-xs text-muted-foreground mt-1">Members</p>
            </CardContent>
          </Card>
          <Card className="glass-card rounded-xl border-0 card-hover">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-3xl sm:text-4xl font-display font-bold text-purple-400">{stats.alumni}</p>
              <p className="text-xs text-muted-foreground mt-1">Alumni</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <button
              onClick={() => navigate("/events")}
              className="group glass-card rounded-xl p-4 sm:p-5 flex items-center gap-4 card-hover card-press text-left"
              aria-label="Add event"
            >
              <div className="icon-container icon-container-primary group-hover:scale-105 transition-transform duration-150">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Add Event</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Schedule a new chapter event
                </p>
              </div>
            </button>
            <SendAnnouncementDialog>
              <Button
                variant="ghost"
                className="group h-auto w-full justify-start glass-card rounded-xl p-4 sm:p-5 flex items-center gap-4 card-hover card-press border border-border hover:border-primary/20 transition-colors duration-150"
              >
                <div className="icon-container icon-container-accent group-hover:scale-105 transition-transform duration-150">
                  <Megaphone className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Send Announcement</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Notify all members
                  </p>
                </div>
              </Button>
            </SendAnnouncementDialog>
          </div>
        </div>

        {/* Today's Focus */}
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-4">
            Today&apos;s Focus
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NextEventCard />
            <TaskList />
          </div>
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
                    <SelectItem value="e_board">E-Board</SelectItem>
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
                          <TableCell className="text-sm text-muted-foreground">
                            {formatCrossingDisplay({ crossing_year: member.crossing_year, chapter: member.chapter, line_order: member.line_order }) || "-"}
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

        {/* Attendance Tracking */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Event Attendance Tracking
            </CardTitle>
            <CardDescription>
              View who checked in for events and when they checked in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-secondary/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  No Attendance Records
                </h3>
                <p className="text-muted-foreground">
                  Attendance records will appear here when members check in to events.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Member</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Checked In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record: any) => {
                      const profile = record.profiles;
                      const event = record.events;
                      return (
                        <TableRow key={record.id} className="hover:bg-secondary/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 border border-primary">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {profile?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground text-sm">
                                  {profile?.full_name || "Unknown User"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {profile?.email || ""}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {event?.title || "Unknown Event"}
                              </p>
                              {event?.start_time && (
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(event.start_time), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {event?.location || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-muted-foreground">
                                {format(parseISO(record.checked_in_at), "MMM d, h:mm a")}
                              </span>
                            </div>
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
                  Click the shield icon next to any user to change their role. You can assign Admin, E-Board, Committee Chairman, Member, or Alumni roles.
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
