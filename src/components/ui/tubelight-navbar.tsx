import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  moreItems?: NavItem[];
  showAdmin?: boolean;
  alwaysBottom?: boolean;
  className?: string;
}

export function NavBar({ items, moreItems = [], alwaysBottom = false, className }: NavBarProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Hide navbar when scrolling down, show when scrolling up
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Always show if near top
          if (currentScrollY < 80) {
            setIsVisible(true);
          } 
          // Hide when scrolling down (with threshold to avoid flickering)
          else if (currentScrollY > lastScrollY.current && currentScrollY - lastScrollY.current > 10) {
            setIsVisible(false);
          } 
          // Show when scrolling up (with threshold)
          else if (currentScrollY < lastScrollY.current && lastScrollY.current - currentScrollY > 10) {
            setIsVisible(true);
          }
          
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const allItems = [...items, ...(moreItems || [])];
  const isActive = (url: string) => location?.pathname === url;

  // Always show main items, rest go in More menu
  const visible = items;
  const hidden = moreItems;
  const hasMoreItems = hidden.length > 0;

  // Don't render if no items
  if (!allItems || allItems.length === 0) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50 flex justify-center",
        alwaysBottom ? "bottom-4" : "top-4"
      )}
      style={{ 
        maxWidth: 'calc(100vw - 2rem)',
        width: '100%',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.nav
            key="navbar"
            initial={{ y: alwaysBottom ? 100 : -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: alwaysBottom ? 100 : -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn("w-fit", className)}
          >
            <div className="glass-card rounded-full px-2 py-2 shadow-lg border border-border/50">
              <div className="flex items-center justify-center gap-1">
                {visible.map((item) => {
                  if (!item || !item.icon) return null;
                  const Icon = item.icon;
                  const active = isActive(item.url);
                  
                  return (
                    <Link
                      key={item.url}
                      to={item.url}
                      className={cn(
                        "relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 shrink-0",
                        active
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={active ? 2.5 : 2} />
                      {active && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-full bg-primary/20 border-2 border-primary/30"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  );
                })}
                
                {hasMoreItems && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 shrink-0",
                          hidden.some(item => isActive(item.url))
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                        {hidden.some(item => isActive(item.url)) && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 rounded-full bg-primary/20 border-2 border-primary/30"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="center" 
                      side={alwaysBottom ? "top" : "bottom"}
                      sideOffset={8}
                      className="glass-card border border-border/50 min-w-[180px]"
                    >
                      {hidden.map((item) => {
                        if (!item || !item.icon) return null;
                        const Icon = item.icon;
                        const active = isActive(item.url);
                        
                        return (
                          <DropdownMenuItem key={item.url} asChild>
                            <Link
                              to={item.url}
                              className={cn(
                                "flex items-center gap-2 cursor-pointer",
                                active && "bg-primary/10 text-primary"
                              )}
                            >
                              <Icon className="w-4 h-4" strokeWidth={2} />
                              <span>{item.name}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
