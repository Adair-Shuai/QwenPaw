import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: { entry: resolve(__dirname, "src/charts.ts"), formats: ["es"], fileName: () => "simulation-charts.mjs" },
    target: "es2020",
    emptyOutDir: false,
    minify: true,
  },
});
