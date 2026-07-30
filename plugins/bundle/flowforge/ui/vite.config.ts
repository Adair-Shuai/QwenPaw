import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// FlowForge plugin UI build config.
//
// React / react-dom / react/jsx-runtime are all externalized because the
// host app (window.QwenPaw.host.React) provides them at runtime.
// @xyflow/react (ReactFlow) is bundled into the output.
//
// Uses IIFE format with a banner that shims window.React, window.ReactDOM,
// and the jsx-runtime globals from the host before the IIFE is evaluated.
//
// The jsx-runtime is externalized AND shimmed to prevent a bundled copy
// from creating React elements incompatible with the host's React instance
// (React error #31: "Objects are not valid as a React child").
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "classic", // Use React.createElement, not jsx() from react/jsx-runtime
    }),
  ],
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
        banner: [
          "/* FlowForge plugin — React + process shim */",
          "if (typeof window !== 'undefined' && window.QwenPaw && window.QwenPaw.host) {",
          "  if (!window.React) window.React = window.QwenPaw.host.React;",
          "  if (!window.ReactDOM) window.ReactDOM = window.QwenPaw.host.ReactDOM;",
          "}",
          "if (typeof process === 'undefined') {",
          "  var process = (typeof window !== 'undefined' && window.process) ? window.process : { env: { NODE_ENV: 'production' }, platform: 'browser' };",
          "}",
        ].join("\n"),
      },
    },
    target: "es2020",
    minify: false,
    sourcemap: false,
    emptyOutDir: true,
  },
});
