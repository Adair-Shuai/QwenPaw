import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// FlowForge plugin UI build config.
//
// React / react-dom are treated as external because the host app
// (window.QwenPaw.host.React) injects them at runtime — we must NOT
// bundle a second copy. @xyflow/react (ReactFlow) is bundled into the
// output so the host doesn't need to ship it.
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["iife"],
      name: "FlowForgePlugin",
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        entryFileNames: "index.js",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    target: "es2020",
    minify: false,
    sourcemap: false,
    emptyOutDir: true,
  },
});
