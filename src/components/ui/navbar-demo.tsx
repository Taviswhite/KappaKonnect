import { Home, User, Briefcase, FileText } from "lucide-react";
import { NavBar, type NavItem } from "@/components/ui/tubelight-navbar";

const demoNavItems: NavItem[] = [
  { name: "Home", url: "/", icon: Home },
  { name: "About", url: "/profile", icon: User },
  { name: "Projects", url: "/alumni", icon: Briefcase },
  { name: "Resume", url: "/documents", icon: FileText },
];

/**
 * Demo usage of the tubelight NavBar with placeholder routes.
 * Use <AppNavBar /> in AppLayout for the real app nav.
 */
export function NavBarDemo() {
  return <NavBar items={demoNavItems} />;
}
