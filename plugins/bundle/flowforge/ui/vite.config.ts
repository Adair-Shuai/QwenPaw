import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// FlowForge plugin UI build config.
//
// React / react-dom are treated as external because the host app
// (window.QwenPaw.host.React) injects them at runtime — we must NOT
// bundle a second copy. @xyflow/react (ReactFlow) is bundled into the
// output so the host doesn't need to ship it.
//
// CRITICAL: `react/jsx-runtime` is aliased to a local shim that delegates
// to the host's React.createElement.  Without this, Vite would bundle the
// jsx-runtime from the plugin's node_modules (which may be React 19 even
// when the host runs React 18), producing elements with a mismatched
// `$$typeof` symbol → "Objects are not valid as a React child".
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react/jsx-runtime": resolve(__dirname, "jsx-runtime-shim.mjs"),
      "react/jsx-dev-runtime": resolve(__dirname, "jsx-runtime-shim.mjs"),
    },
  },
  // Replace process.env.NODE_ENV at build time so the browser bundle
  // doesn't reference the Node.js `process` global at runtime.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": "{}",
    "process.platform": JSON.stringify("browser"),
  },
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
        // Inject a shim that maps window.QwenPaw.host.React to global
        // React/ReactDOM so the externalized imports resolve correctly.
        // Also define a minimal `process` global so Node.js-isms in
        // @xyflow/react don't throw ReferenceError in the browser.
        banner: `var __qp=typeof window!=="undefined"&&window.QwenPaw||{};var __h=__qp.host||{};if(__h.React&&!window.React)window.React=__h.React;if(__h.ReactDOM&&!window.ReactDOM)window.ReactDOM=__h.ReactDOM;if(typeof process==="undefined")window.process={env:{NODE_ENV:"production"},platform:"browser",versions:{},cwd:function(){return"/"}};`,
      },
    },
    target: "es2020",
    minify: false,
    sourcemap: false,
    emptyOutDir: true,
  },
});
