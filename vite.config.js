import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    // Bind all interfaces (Docker) but tell the browser to reach the
    // dev server via localhost: 0.0.0.0 is not routable and Chrome blocks it.
    hmr: {
      host: "localhost",
    },
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    laravel({
      input: ["resources/css/app.css", "resources/js/app.jsx"],
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": "/resources/js",
    },
  },
});
