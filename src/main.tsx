import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { checkURLForThreats } from "./lib/threat-detection";

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
