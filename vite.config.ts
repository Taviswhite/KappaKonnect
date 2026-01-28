import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// Validate required environment variables at build time
const validateEnvVars = (env: Record<string, string>, mode: string) => {
  const requiredEnvVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
  const missingVars = requiredEnvVars.filter((varName) => !env[varName]);

  if (missingVars.length > 0 && mode === "production") {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
      "Please ensure all required environment variables are set in your .env file.\n" +
      "Required variables:\n" +
      "  VITE_SUPABASE_URL=your_supabase_url\n" +
      "  VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key\n\n" +
      "Note: Vite requires the VITE_ prefix (not NEXT_PUBLIC_)."
    );
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars using Vite's loadEnv
  const env = loadEnv(mode, process.cwd(), "");

  // Validate env vars during build
  if (mode === "production") {
    validateEnvVars(env, mode);
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
      minify: "esbuild",
      terserOptions: undefined,
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "prompt",
        injectRegister: "auto",
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        injectManifest: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webmanifest}"],
          maximumFileSizeToCacheInBytes: 5000000,
        },
        manifest: {
          name: "KappaKonnect",
          short_name: "KappaKonnect",
          display: "standalone",
          start_url: "/",
          theme_color: "#0f172a",
          background_color: "#0f172a",
          icons: [
            {
              src: "/web-app-manifest-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/web-app-manifest-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
        devOptions: {
          enabled: mode === "development",
          type: "module",
        },
      }),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
