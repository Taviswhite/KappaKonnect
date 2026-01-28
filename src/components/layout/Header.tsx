import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MobileMenuTrigger } from "./Sidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Check, Trash2, Calendar, MessageSquare, CheckSquare, Users, Megaphone, FileText, Hash } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { profile, roles, signOut, user } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch unread notifications count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-notifications-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch recent notifications for dropdown
  const { data: recentNotifications = [] } = useQuery({
    queryKey: ["recent-notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) return [];
      return data || [];
    },
    enabled: !!user,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Megaphone className="w-4 h-4 text-primary" />;
      case "event":
        return <Calendar className="w-4 h-4 text-primary" />;
      case "task":
        return <CheckSquare className="w-4 h-4 text-green-500" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "member":
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Global search
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["global-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return { members: [], events: [], tasks: [], documents: [] };

      // Get admin user IDs to exclude from search
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      
      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

      const [membersResult, eventsResult, tasksResult, documentsResult] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, email, crossing_year, chapter, line_order").ilike("full_name", `%${searchQuery}%`).limit(10),
        supabase.from("events").select("id, title, start_time").ilike("title", `%${searchQuery}%`).limit(5),
        supabase.from("tasks").select("id, title, status").ilike("title", `%${searchQuery}%`).limit(5),
        supabase.from("documents").select("id, name, file_type").ilike("name", `%${searchQuery}%`).limit(5),
      ]);

      // Filter out admin accounts from members search results
      const filteredMembers = (membersResult.data || []).filter(m => !adminUserIds.has(m.user_id)).slice(0, 5);

      return {
        members: filteredMembers,
        events: eventsResult.data || [],
        tasks: tasksResult.data || [],
        documents: documentsResult.data || [],
      };
    },
    enabled: searchOpen && searchQuery.length >= 2,
  });

  const totalResults = (searchResults?.members.length || 0) + 
    (searchResults?.events.length || 0) + 
    (searchResults?.tasks.length || 0) + 
    (searchResults?.documents.length || 0);

  const primaryRole = roles[0]?.role || "member";
  const roleLabel = primaryRole.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const handleSearchResultClick = (type: string, id: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    switch (type) {
      case "member":
        navigate(`/members`);
        break;
      case "event":
        navigate(`/events`);
        break;
      case "task":
        navigate(`/tasks`);
        break;
      case "document":
        navigate(`/documents`);
        break;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-3 sm:px-6">
        {/* Mobile Menu Trigger */}
        <MobileMenuTrigger onClick={onMobileMenuToggle} />

        {/* Search - Hidden on mobile, visible on tablet+ */}
        <div className="relative w-48 sm:w-64 md:w-96 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-secondary/50 border-border focus:border-primary text-sm"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Mobile Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="sm:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Global Search Dialog */}
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Search</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Search members, events, tasks, documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  autoFocus
                />
                {searchQuery.length >= 2 && (
                  <div className="max-h-[400px] overflow-y-auto space-y-4">
                    {searchLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Searching...</div>
                    ) : totalResults === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No results found</div>
                    ) : (
                      <>
                        {searchResults?.members.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Members ({searchResults.members.length})
                            </h4>
                            <div className="space-y-1">
                              {searchResults.members.map((member: any) => {
                                const crossing = formatCrossingDisplay({
                                  crossing_year: member.crossing_year,
                                  chapter: member.chapter,
                                  line_order: member.line_order,
                                });
                                return (
                                  <Button
                                    key={member.user_id}
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => handleSearchResultClick("member", member.user_id)}
                                  >
                                    {[crossing ? `${member.full_name} (${crossing})` : member.full_name, member.email].filter(Boolean).join(" – ")}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {searchResults?.events.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Events ({searchResults.events.length})
                            </h4>
                            <div className="space-y-1">
                              {searchResults.events.map((event: any) => (
                                <Button
                                  key={event.id}
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={() => handleSearchResultClick("event", event.id)}
                                >
                                  {event.title}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        {searchResults?.tasks.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <CheckSquare className="w-4 h-4" />
                              Tasks ({searchResults.tasks.length})
                            </h4>
                            <div className="space-y-1">
                              {searchResults.tasks.map((task: any) => (
                                <Button
                                  key={task.id}
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={() => handleSearchResultClick("task", task.id)}
                                >
                                  {task.title}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        {searchResults?.documents.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Documents ({searchResults.documents.length})
                            </h4>
                            <div className="space-y-1">
                              {searchResults.documents.map((doc: any) => (
                                <Button
                                  key={doc.id}
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={() => handleSearchResultClick("document", doc.id)}
                                >
                                  {doc.name} ({doc.file_type})
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 sm:w-80 glass-card max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel className="font-display flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-primary">{unreadCount} new</Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recentNotifications.length === 0 ? (
                <div className="py-6 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                </div>
              ) : (
                <div className="py-2">
                  {recentNotifications.map((notification: any) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex items-start gap-3 p-3 cursor-pointer"
                      onClick={() => {
                        navigate("/notifications");
                        if (notification.link) {
                          window.open(notification.link, "_blank");
                        }
                      }}
                    >
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/notifications")} className="cursor-pointer justify-center">
                    View all notifications
                  </DropdownMenuItem>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2">
                <Avatar className="w-8 h-8 border-2 border-primary">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {profile?.full_name ? getInitials(profile.full_name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{profile?.full_name || "Member"}</p>
                  <Badge variant="outline" className="text-xs border-accent text-accent">
                    {roleLabel}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background border border-border shadow-lg z-50">
              <DropdownMenuLabel className="font-display">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
