import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Вязальный дневник",
        short_name: "Вязание",
        description:
          "Личный офлайн-трекер вязания: счётчики рядов и петель, раппорты, пряжа, фотодневник, таймер и статистика.",
        theme_color: "#c17a5c",
        background_color: "#faf3ea",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "ru",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Photos are read from IndexedDB, not fetched over the network,
        // so a runtime cache for them isn't needed — everything else is
        // precached for full offline use.
        navigateFallback: "/index.html",
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          dexie: ["dexie", "dexie-react-hooks"],
          charts: ["recharts"],
        },
      },
    },
  },
  server: {
    host: true,
  },
});
