import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "favicon.svg",
        "icon-192.png",
        "icon-512.png",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "SCINCE 自然探索室",
        short_name: "SCINCE",
        description: "完整學測自然單元、原創練習與專用數學化學渲染工具。",
        lang: "zh-Hant",
        start_url: ".",
        scope: ".",
        display: "standalone",
        background_color: "#f7f8fa",
        theme_color: "#102f36",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"],
        globIgnores: ["**/tutor.worker-*.js", "**/webllm-*.js"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallbackDenylist: [/\/papers\//],
        cacheId: "scince-courses-v2",
        cleanupOutdatedCaches: true,
        importScripts: ["sw-cleanup.js"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /\/assets\/(webllm-|tutor\.worker-)/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "scince-inference-sdk-v1",
              expiration: { maxEntries: 4, maxAgeSeconds: 31536000 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("@mlc-ai") ||
            id.includes("tvmjs") ||
            id.includes("@huggingface/jinja")
          )
            return "webllm";
        },
      },
    },
  },
});
