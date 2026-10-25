import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
    },
  },

  build: {
    // Raise the warning threshold — individual chunks can be up to 1 MB
    // before Rollup warns.  The split below keeps real chunks well under this.
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: {
          // ── Core React runtime ─────────────────────────────────────────
          "react-vendor": ["react", "react-dom", "react-router-dom"],

          // ── State management ──────────────────────────────────────────
          "redux-vendor": ["react-redux", "@reduxjs/toolkit"],

          // ── Server-state / caching ────────────────────────────────────
          "query-vendor": ["@tanstack/react-query"],

          // ── Animation (framer-motion is large — isolate it) ───────────
          "motion-vendor": ["framer-motion"],

          // ── Icon libraries ────────────────────────────────────────────
          // react-icons ships tree-shakeable sub-packages; putting the
          // top-level package here catches any cross-page shared icons.
          "icons-vendor": ["react-icons", "lucide-react"],

          // ── UI / carousel ─────────────────────────────────────────────
          "ui-vendor": ["swiper"],
        },
      },
    },
  },
});
