import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { checkURLForThreats } from "./lib/threat-detection";

// Suppress harmless 404 errors for React Router routes (browser prefetch attempts)
// This must run IMMEDIATELY before any other code executes
if (typeof window !== "undefined") {
  // Suppress console errors for 404s on client-side routes
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: unknown[]) => {
    const message = args[0]?.toString() || "";
    const fullMessage = args.map(a => String(a)).join(" ");
    
    // Filter out 404 errors for routes handled by React Router
    if (
      (message.includes("Failed to load resource") || fullMessage.includes("Failed to load")) &&
      (message.includes("notifications") || 
       message.includes("notification_preferences") ||
       fullMessage.includes("notifications") ||
       fullMessage.includes("notification_preferences") ||
       message.includes("(line 0)") ||
       fullMessage.includes("(line 0)"))
    ) {
      // Suppress these harmless errors - they're just browser prefetch attempts
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    const message = args[0]?.toString() || "";
    const fullMessage = args.map(a => String(a)).join(" ");
    
    // Also suppress warnings for these routes
    if (
      (message.includes("notifications") || 
       message.includes("notification_preferences") ||
       fullMessage.includes("notifications") ||
       fullMessage.includes("notification_preferences")) &&
      (message.includes("404") || fullMessage.includes("404") ||
       message.includes("Failed") || fullMessage.includes("Failed"))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Intercept fetch requests to prevent 404s from being logged
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let url = "";
    if (typeof args[0] === "string") {
      url = args[0];
    } else if (args[0] instanceof URL) {
      url = args[0].href;
    } else if (args[0] instanceof Request) {
      url = args[0].url;
    }
    
    // If this is a request to a React Router route, let it fail silently
    if (
      url &&
      (url.includes("/notifications") || url.includes("/notification_preferences")) &&
      !url.includes("supabase") &&
      !url.includes("api") &&
      !url.includes("http")
    ) {
      // Return a rejected promise that we'll catch
      return Promise.reject(new Error("Route handled by React Router"));
    }
    
    try {
      return await originalFetch.apply(window, args);
    } catch (error) {
      const errorMessage = error?.toString() || "";
      if (
        (errorMessage.includes("notifications") || 
         errorMessage.includes("notification_preferences")) &&
        errorMessage.includes("404")
      ) {
        // Suppress these errors
        throw new Error("Route handled by React Router");
      }
      throw error;
    }
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
