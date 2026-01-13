import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      {/* Main content area - responsive padding for sidebar with smooth transition */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="p-3 sm:p-4 md:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}