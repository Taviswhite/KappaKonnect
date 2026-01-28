import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  FileText,
  MessageSquare,
  QrCode,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Bell,
  Menu,
  X,
  User,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpeg";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: Users, label: "Members", path: "/members" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: FileText, label: "Meetings", path: "/meetings" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: QrCode, label: "Attendance", path: "/attendance" },
  { icon: GraduationCap, label: "Alumni", path: "/alumni" },
  { icon: FileText, label: "Documents", path: "/documents" },
];

const bottomItems = [
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed }: SidebarProps) {
  const location = useLocation();
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const navItems = menuItems;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setMobileOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border flex flex-col",
          "transition-all duration-300 ease-in-out",
          // Desktop: show based on collapsed state
          "hidden lg:flex",
          collapsed ? "lg:w-20" : "lg:w-64",
          // Mobile: controlled by mobileOpen
          mobileOpen && "!flex w-72"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className={cn("flex items-center gap-3 transition-all duration-300", collapsed && !mobileOpen && "justify-center w-full")}>
            <img
              src={logo}
              alt="Kappa Alpha Psi Logo"
              className="w-10 h-10 rounded-lg object-contain"
            />
            <div className={cn(
              "transition-all duration-300 overflow-hidden",
              collapsed && !mobileOpen ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              <h1 className="font-display font-bold text-lg text-foreground whitespace-nowrap">KappaKonnect</h1>
              <p className="text-xs text-muted-foreground whitespace-nowrap">Fraternity Portal</p>
            </div>
          </div>
          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg glow-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && !mobileOpen && "justify-center"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0 transition-all duration-200", isActive && "text-primary-foreground")} />
                <span className={cn(
                  "font-medium transition-all duration-300 overflow-hidden whitespace-nowrap",
                  collapsed && !mobileOpen ? "w-0 opacity-0" : "w-auto opacity-100"
                )}>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Admin Panel Link - Only visible to admins */}
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group mt-2 border-t border-sidebar-border pt-2",
                location.pathname === "/admin"
                  ? "bg-primary text-primary-foreground shadow-lg glow-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && !mobileOpen && "justify-center"
              )}
            >
              <Shield className={cn("w-5 h-5 shrink-0 transition-all duration-200", location.pathname === "/admin" && "text-primary-foreground")} />
              <span className={cn(
                "font-medium transition-all duration-300 overflow-hidden whitespace-nowrap",
                collapsed && !mobileOpen ? "w-0 opacity-0" : "w-auto opacity-100"
              )}>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Bottom Items */}
        <div className="p-3 space-y-1 border-t border-sidebar-border">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && !mobileOpen && "justify-center"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={cn(
                  "font-medium transition-all duration-300 overflow-hidden whitespace-nowrap",
                  collapsed && !mobileOpen ? "w-0 opacity-0" : "w-auto opacity-100"
                )}>{item.label}</span>
              </Link>
            );
          })}

          {/* Collapse Button - Desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 shrink-0 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 shrink-0" />
                <span className="font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

// Mobile menu trigger component for the header
export function MobileMenuTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}