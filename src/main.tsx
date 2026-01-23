import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { checkURLForThreats } from "./lib/threat-detection";
import { notificationService } from "./lib/notification-service";

// Check URL for threats before rendering the app
if (typeof window !== "undefined") {
  checkURLForThreats();
  
  // Initialize notification service
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        await notificationService.initialize();
      } catch (error) {
        console.error("Failed to initialize notification service:", error);
      }
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
