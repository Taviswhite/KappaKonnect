import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { checkURLForThreats } from "./lib/threat-detection";

// Check URL for threats before rendering the app
if (typeof window !== "undefined") {
  checkURLForThreats();
}

createRoot(document.getElementById("root")!).render(<App />);
