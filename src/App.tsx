import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { appRoutes } from "./routes";
import { useNotifications } from "@/hooks/use-notifications";
import { ThemeProvider } from "next-themes";

// React Query DevTools - uncomment after installing: npm install -D @tanstack/react-query-devtools
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create QueryClient with proper configuration outside component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false,
    },
  },
});

// This component runs inside AuthProvider so it can safely use useNotifications (which uses useAuth)
const NotificationsInitializer = () => {
  useNotifications();
  return null;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsInitializer />
        <Routes>
          {appRoutes}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner />
          <AppContent />
        </TooltipProvider>
        {/* Uncomment after installing @tanstack/react-query-devtools */}
        {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
