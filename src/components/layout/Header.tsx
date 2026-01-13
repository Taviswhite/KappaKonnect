import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { profile, roles, signOut } = useAuth();
  const navigate = useNavigate();

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

  const primaryRole = roles[0]?.role || "member";
  const roleLabel = primaryRole.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

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
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 sm:w-80 glass-card">
              <DropdownMenuLabel className="font-display">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium text-sm">Chapter Meeting Tonight</span>
                <span className="text-xs text-muted-foreground">Don't forget the meeting at 7 PM</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium text-sm">New Task Assigned</span>
                <span className="text-xs text-muted-foreground">Review budget proposal</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium text-sm">Payment Reminder</span>
                <span className="text-xs text-muted-foreground">Dues payment due in 3 days</span>
              </DropdownMenuItem>
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
