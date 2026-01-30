import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  GraduationCap,
  CheckSquare,
  CalendarDays,
  QrCode,
  FileText,
  Settings,
  User,
  Bell,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NavBar, type NavItem } from "@/components/ui/tubelight-navbar";
import { useMemo } from "react";

const mainNavItems: NavItem[] = [
  { name: "Dashboard", url: "/", icon: LayoutDashboard },
  { name: "Members", url: "/members", icon: Users },
  { name: "Alumni", url: "/alumni", icon: GraduationCap },
  { name: "Attendance", url: "/attendance", icon: QrCode },
];

export function AppNavBar() {
  try {
    const { hasRole } = useAuth();
    // Admin Panel: only for admin and e_board (not shown in nav as "admin account", just a management link)
    const canSeeAdminPanel = hasRole ? (hasRole("admin") || hasRole("e_board")) : false;

    const moreNavItems = useMemo<NavItem[]>(() => {
      const items: NavItem[] = [
        { name: "Events", url: "/events", icon: Calendar },
        { name: "Chat", url: "/chat", icon: MessageSquare },
        { name: "Tasks", url: "/tasks", icon: CheckSquare },
        { name: "Meetings", url: "/meetings", icon: CalendarDays },
        { name: "Documents", url: "/documents", icon: FileText },
        { name: "Notifications", url: "/notifications", icon: Bell },
        { name: "Profile", url: "/profile", icon: User },
        { name: "Settings", url: "/settings", icon: Settings },
      ];
      
      if (canSeeAdminPanel) {
        items.push({ name: "Admin Panel", url: "/admin", icon: Shield });
      }
      
      return items;
    }, [canSeeAdminPanel]);

    return (
      <NavBar
        items={mainNavItems}
        moreItems={moreNavItems}
        showAdmin={canSeeAdminPanel}
        alwaysBottom
      />
    );
  } catch (error) {
    console.error("AppNavBar error:", error);
    // Return a fallback navbar without auth-dependent features
    const fallbackMoreItems: NavItem[] = [
      { name: "Events", url: "/events", icon: Calendar },
      { name: "Chat", url: "/chat", icon: MessageSquare },
      { name: "Tasks", url: "/tasks", icon: CheckSquare },
      { name: "Meetings", url: "/meetings", icon: CalendarDays },
      { name: "Documents", url: "/documents", icon: FileText },
      { name: "Notifications", url: "/notifications", icon: Bell },
      { name: "Profile", url: "/profile", icon: User },
      { name: "Settings", url: "/settings", icon: Settings },
    ];
    
    return (
      <NavBar
        items={mainNavItems}
        moreItems={fallbackMoreItems}
        alwaysBottom
      />
    );
  }
}
