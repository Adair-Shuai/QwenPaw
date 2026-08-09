import { defineConfig } from "vite";
import { resolve } from "path";

/**
 * Bootstrap build config — produces the lightweight index.js
 * that QwenPaw loads at startup. Must be <150 KiB.
 * Does NOT include Three.js.
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "OilGasVisualizationBootstrap",
      fileName: () => "index.js",
      formats: ["iife"],
    },
    minify: true,
    sourcemap: false,
    rollupOptions: {
      external: ["three", "three/addons"],
    },
    outDir: "dist",
    emptyOutDir: false,
  },
});
