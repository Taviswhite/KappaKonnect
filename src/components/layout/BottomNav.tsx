import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  GraduationCap,
  MoreHorizontal,
  CheckSquare,
  FileText,
  CalendarDays,
  QrCode,
  Bell,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: Users, label: "Members", path: "/members" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: GraduationCap, label: "Alumni", path: "/alumni" },
];

const moreNavItems = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: CalendarDays, label: "Meetings", path: "/meetings" },
  { icon: QrCode, label: "Attendance", path: "/attendance" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

// In production (e.g. Vercel), hide Admin unless VITE_SHOW_ADMIN_PANEL is set
const showAdminInNav = () => {
  if (!import.meta.env.PROD) return true;
  return import.meta.env.VITE_SHOW_ADMIN_PANEL === "true";
};

export function BottomNav() {
  const location = useLocation();
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin") && showAdminInNav();
  const mainItems = mainNavItems;
  const moreItems = moreNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around h-14 px-1">
        {mainItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
              <span className="text-[10px] font-medium truncate max-w-full px-0.5">{item.label}</span>
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 h-full py-2 rounded-lg transition-colors",
                moreItems.some((i) => location.pathname === i.path) || (canSeeAdminPanel && location.pathname === "/admin")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <MoreHorizontal className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="center" className="mb-2 w-56">
            {moreItems.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    location.pathname === item.path && "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
            {canSeeAdminPanel && (
              <DropdownMenuItem asChild>
                <Link
                  to="/admin"
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    location.pathname === "/admin" && "bg-primary/10 text-primary"
                  )}
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
