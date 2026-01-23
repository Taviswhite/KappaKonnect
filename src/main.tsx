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
       message.includes("notification_preferences"))
    ) {
      // Suppress these harmless errors - they're just browser prefetch attempts
      return;
    }
    originalError.apply(console, args);
  };
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
