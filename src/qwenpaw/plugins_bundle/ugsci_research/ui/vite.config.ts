import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "UGSciResearchPlugin",
      fileName: () => "index.js",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
    minify: true,
    emptyOutDir: true,
  },
});
