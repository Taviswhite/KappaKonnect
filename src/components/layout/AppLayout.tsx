import { ReactNode } from "react";
import { Header } from "./Header";
import { AppNavBar } from "./AppNavBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-3 sm:p-4 md:p-6 pb-20 sm:pb-20 animate-fade-in min-h-screen">
        {children}
      </main>
      <ErrorBoundary>
        <AppNavBar />
      </ErrorBoundary>
    </div>
  );
}
