import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for the frontend application.  This file
// defines the plugin set and dev server proxy to forward API
// requests to the backend.  The config lives at the project root
// to keep build tools separate from application code.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "^/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});