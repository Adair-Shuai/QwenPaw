import { defineConfig } from "vite";
import { resolve } from "path";

/**
 * Viewer runtime build config — produces the heavy viewer-runtime.js
 * that contains Three.js and all rendering logic.
 * Loaded lazily by the bootstrap when user opens the visualization page.
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/visualization/viewer/index.tsx"),
      name: "OilGasViewerRuntime",
      fileName: (chunk: any) => {
        // Content hash will be appended by Vite's assetFileName
        // For IIFE, we use a fixed name and rely on version
        return "viewer-runtime.js";
      },
      formats: ["iife"],
    },
    minify: true,
    sourcemap: false,
    // Three.js is bundled into the IIFE, not external
    rollupOptions: {
      output: {
        // Single file, no code splitting
        inlineDynamicImports: true,
      },
    },
    outDir: "dist",
    emptyOutDir: false,
    chunkSizeWarningLimit: 15000,
  },
});
