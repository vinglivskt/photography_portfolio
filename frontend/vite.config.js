/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    css: true,
    include: ["src/**/*.{test,spec}.{js,jsx}"],
  },
  server: {
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: process.env.VITE_USE_POLLING === "1",
    },
    proxy: {
      "/api": { target: apiProxyTarget, changeOrigin: true },
      "/media": { target: apiProxyTarget, changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
