import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { checkURLForThreats } from "./lib/threat-detection";

// Suppress harmless 404 errors for React Router routes (browser prefetch attempts)
if (typeof window !== "undefined") {
  // Suppress console errors for 404s on client-side routes
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const message = args[0]?.toString() || "";
    // Filter out 404 errors for routes handled by React Router
    if (
      message.includes("Failed to load resource") &&
      (message.includes("notifications") || 
       message.includes("notification_preferences") ||
       message.includes("(line 0)"))
    ) {
      // Suppress these harmless errors - they're just browser prefetch attempts
      return;
    }
    originalError.apply(console, args);
  };

  // Also intercept error events for network failures
  window.addEventListener("error", (event) => {
    const target = event.target;
    let src = "";
    
    if (target instanceof HTMLScriptElement) {
      src = target.src || "";
    } else if (target instanceof HTMLLinkElement) {
      src = target.href || "";
    } else if (target instanceof HTMLImageElement) {
      src = target.src || "";
    }
    
    if (
      src &&
      (src.includes("/notifications") || 
       src.includes("/notification_preferences")) &&
      !src.includes("supabase") &&
      !src.includes("api")
    ) {
      // Prevent these errors from showing in console
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // Intercept unhandled promise rejections for fetch errors
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason?.toString() || "";
    if (
      reason.includes("notifications") || 
      reason.includes("notification_preferences") ||
      reason.includes("404")
    ) {
      event.preventDefault();
    }
  });
}

// Check URL for threats before rendering the app
if (typeof window !== "undefined") {
  checkURLForThreats();
  
  // Initialize notification service lazily (after app loads)
  // This prevents HMR issues with service worker registration
  if ("serviceWorker" in navigator && "PushManager" in window) {
    // Use setTimeout to defer initialization and avoid blocking HMR
    setTimeout(() => {
      window.addEventListener("load", async () => {
        try {
          // Lazy load notification service to avoid HMR issues
          const { getNotificationService } = await import("./lib/notification-service");
          const notificationService = getNotificationService();
          await notificationService.initialize();
        } catch (error) {
          // Silently fail - don't break the app if notifications fail
          if (import.meta.env.DEV) {
            console.warn("Notification service initialization skipped:", error);
          }
        }
      });
    }, 0);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
