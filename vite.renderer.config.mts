import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Builds the kiosk face renderer that the Python SDK serves on the robot.
 *
 * It compiles the playground's own components straight from this repo and runs
 * on the root dependency tree, so the robot's face uses the identical motion and
 * React versions as the preview and the two cannot drift apart.
 */
export default defineConfig({
  root: "renderer",
  base: "./",
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  build: {
    outDir: "../sdk/python/nori_face/_bundle",
    emptyOutDir: true,
    target: "chrome108",
    rollupOptions: {
      output: {
        entryFileNames: "face.js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
