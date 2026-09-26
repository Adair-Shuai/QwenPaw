import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["iife"],
      name: "QwenPawRunCenter",
      fileName: () => "index.js",
    },
    target: "es2020",
    emptyOutDir: true,
  },
});
