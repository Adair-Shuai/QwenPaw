/// <reference types="vitest" />
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import os from "os";

// Vitest-only plugin: transforms .css imports inside node_modules to empty
// stubs. This prevents errors from packages like @agentscope-ai/icons that
// import CSS.
//
// It must never run for real builds: stubbing node_modules CSS also strips
// monaco-editor's stylesheet, which makes the hidden `.monaco-editor
// .inputarea` textarea render with browser default styles (a big white box
// over the code) and breaks cursor positioning in Coding Mode (issue #6547).
const cssStubPlugin: Plugin = {
  name: "css-stub",
  transform(_code: string, id: string) {
    if (id.includes("node_modules") && id.endsWith(".css")) {
      return { code: "export default {}" };
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Plugin bundle watcher
//
// Plugin UIs (e.g. UGSci) are pre-built bundles served by the backend from
// the runtime directory (~/.qwenpaw/plugins/<id>/), not processed by Vite.
// This means Vite's HMR doesn't apply to them.
//
// This plugin solves two problems:
//   1. **Auto-sync**: When `vite build --watch` (run in the plugin UI dir)
//      rebuilds `plugins/bundle/ugsci/ui/dist/index.js`, the watcher copies
//      the new bundle to:
//        - src/qwenpaw/plugins_bundle/<id>/ui/dist/index.js  (package bundle)
//        - src/qwenpaw/plugins_bundle/<id>/static/index.js   (static fallback)
//        - ~/.qwenpaw/plugins/<id>/ui/dist/index.js           (runtime — what the backend serves)
//        - ~/.qwenpaw/plugins/<id>/static/index.js            (runtime static fallback)
//        - plugins/bundle/<id>/static/index.js                (source static fallback)
//   2. **Auto-reload**: After syncing, it sends a `full-reload` event via
//      Vite's HMR WebSocket so the browser refreshes and picks up the new
//      bundle on the next page load.
//
// Usage:
//   Terminal 1: cd console && npx vite --host          (this dev server)
//   Terminal 2: cd plugins/bundle/ugsci/ui && npm run dev  (vite build --watch)
//   Edit plugins/bundle/ugsci/ui/src/index.ts → auto-rebuild → auto-sync → auto-reload
// ─────────────────────────────────────────────────────────────────────────────
// Each entry: { source: <dist/index.js>, syncTargets: [...] }
const PLUGIN_WATCH_ENTRIES: { source: string; syncTargets: string[] }[] = [
  {
    source: path.resolve(__dirname, "../plugins/bundle/ugsci/ui/dist/index.js"),
    syncTargets: [
      path.resolve(
        __dirname,
        "../src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
      ),
      path.resolve(
        __dirname,
        "../src/qwenpaw/plugins_bundle/ugsci/static/index.js",
      ),
      path.resolve(__dirname, "../plugins/bundle/ugsci/static/index.js"),
      path.join(os.homedir(), ".qwenpaw/plugins/ugsci/ui/dist/index.js"),
      path.join(os.homedir(), ".qwenpaw/plugins/ugsci/static/index.js"),
    ],
  },
  {
    source: path.resolve(
      __dirname,
      "../plugins/bundle/ugsci_research/ui/dist/index.js",
    ),
    syncTargets: [
      path.resolve(
        __dirname,
        "../src/qwenpaw/plugins_bundle/ugsci_research/ui/dist/index.js",
      ),
      path.resolve(
        __dirname,
        "../src/qwenpaw/plugins_bundle/ugsci_research/static/index.js",
      ),
      path.resolve(
        __dirname,
        "../plugins/bundle/ugsci_research/static/index.js",
      ),
      path.join(
        os.homedir(),
        ".qwenpaw/plugins/ugsci_research/ui/dist/index.js",
      ),
      path.join(
        os.homedir(),
        ".qwenpaw/plugins/ugsci_research/static/index.js",
      ),
    ],
  },
];

function pluginBundleWatcher() {
  return {
    name: "plugin-bundle-watcher",
    configureServer(server: any) {
      const watched: { source: string; syncTargets: string[] }[] = [];
      for (const entry of PLUGIN_WATCH_ENTRIES) {
        if (fs.existsSync(entry.source)) {
          watched.push(entry);
        }
      }

      if (watched.length === 0) return;

      console.info(
        `[plugin-bundle-watcher] Watching ${watched.length} plugin bundle(s) for rebuild → auto-sync + auto-reload`,
      );

      for (const entry of watched) {
        let debounceTimer: NodeJS.Timeout | null = null;
        // Track the last known content so we can skip spurious
        // fs.watch events (common on macOS FSEvents — the file is
        // reported as "changed" even when only its atime was updated).
        let lastContent: Buffer | null = null;
        try {
          lastContent = fs.readFileSync(entry.source);
        } catch {
          lastContent = null;
        }

        fs.watch(entry.source, () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            let newContent: Buffer | null = null;
            try {
              newContent = fs.readFileSync(entry.source);
            } catch {
              return;
            }
            if (lastContent && newContent.equals(lastContent)) {
              // Content unchanged — spurious fs.watch event, skip.
              return;
            }
            lastContent = newContent;

            const pluginName = path.basename(
              path.dirname(path.dirname(entry.source)),
            );
            try {
              // Sync the rebuilt bundle to all target locations
              let synced = 0;
              for (const target of entry.syncTargets) {
                try {
                  // Ensure parent directory exists
                  fs.mkdirSync(path.dirname(target), { recursive: true });
                  fs.copyFileSync(entry.source, target);
                  synced++;
                } catch {
                  // Target might not exist yet (e.g. runtime dir not created) — skip silently
                }
              }
              console.info(
                `[plugin-bundle-watcher] ${pluginName}/index.js rebuilt → synced to ${synced}/${entry.syncTargets.length} locations → triggering full reload`,
              );
            } catch (err) {
              console.warn(
                `[plugin-bundle-watcher] Failed to sync ${pluginName}:`,
                err,
              );
            }
            // Trigger browser full reload to pick up the new bundle
            server.ws.send({ type: "full-reload" });
          }, 500);
        });
      }
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Optional-deps plugin
//
// Workspace renderers dynamically import some optional packages (TipTap,
// @codesandbox/sandpack-react) that are NOT in package.json by default.
// In dev mode, Vite's import-analysis tries to resolve every `import()` call,
// even those inside try/catch — causing a hard error overlay.
//
// This plugin intercepts those specifiers and returns a virtual module that
// throws at runtime. The renderers' try/catch (or .catch()) handlers swallow
// the error and fall back to a simpler renderer.
//
// Note: react-pdf is now a regular dependency and excluded from this list.
// For production builds, `build.rollupOptions.external` (below) takes
// precedence, so the plugin is never called in build mode.
// ─────────────────────────────────────────────────────────────────────────────
// react-pdf is now a regular dependency (in package.json) and can be
// pre-bundled by Vite in dev mode without issues.
const OPTIONAL_DEPS = [
  "@codesandbox/sandpack-react",
  "@tiptap/static-renderer",
  "@tiptap/starter-kit",
  "@tiptap/markdown",
];

const optionalDepsPlugin = {
  name: "optional-deps-stub",
  enforce: "pre" as const,
  resolveId(source: string) {
    // Match exact specifiers and deep imports (e.g. @tiptap/static-renderer)
    if (OPTIONAL_DEPS.includes(source)) {
      return `\0optional-dep:${source}`;
    }
    return null;
  },
  load(id: string) {
    if (!id.startsWith("\0optional-dep:")) return null;
    const dep = id.slice("\0optional-dep:".length);
    return (
      `// Virtual stub for optional dependency: ${dep}\n` +
      `// The real package is not installed. The dynamic import() will reject,\n` +
      `// and the caller's try/catch or .catch() handler should fall back gracefully.\n` +
      `throw new Error("Optional dependency '${dep}' is not installed. " +\n` +
      `  \"Install it (npm i ${dep}) or rely on the fallback renderer.\");\n`
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Fix @ant-design/x CodeHighlighter dynamic import
//
// @ant-design/x's CodeHighlighter uses a template-literal dynamic import:
//   import(`react-syntax-highlighter/dist/esm/languages/prism/${lang}`)
//
// Vite's import-analysis rewrites static bare imports to pre-bundled URLs,
// but NOT dynamic imports with template literals (variables). The browser
// receives the bare specifier and fails with:
//   "Failed to resolve module specifier 'react-syntax-highlighter/...'"
//
// This plugin rewrites the bare specifier to use Vite's /@id/ prefix, which
// Vite resolves at runtime to the pre-bundled dependency.
// ─────────────────────────────────────────────────────────────────────────────
const fixCodeHighlighterPlugin: Plugin = {
  name: "fix-code-highlighter-dynamic-import",
  enforce: "pre",
  transform(code: string, id: string) {
    if (!id.includes("@ant-design/x") || !id.includes("CodeHighlighter")) {
      return null;
    }
    const oldPattern =
      "import(`react-syntax-highlighter/dist/esm/languages/prism/${lang}`)";
    if (!code.includes(oldPattern)) return null;
    return code.replace(
      oldPattern,
      "import(/* @vite-ignore */ `/@id/react-syntax-highlighter/dist/esm/languages/prism/${lang}`)",
    );
  },
};

export default defineConfig(({ command, mode }) => {
  // Vitest resolves the config as a dev server (`serve`) with mode "test",
  // while `vite build --mode test` is a real build that needs real CSS.
  const isVitest = command === "serve" && mode === "test";
  const env = loadEnv(mode, process.cwd(), "");
  // Empty = same-origin; frontend and backend served together, no hardcoded host.
  // Use a dedicated Vite-prefixed key so unrelated shell BASE_URL values don't leak into the build.
  const apiBaseUrl = env.VITE_API_BASE_URL ?? "";

  return {
    define: {
      VITE_API_BASE_URL: JSON.stringify(apiBaseUrl),
      TOKEN: JSON.stringify(env.TOKEN || ""),
      MOBILE: false,
    },
    plugins: [
      react(),
      optionalDepsPlugin,
      fixCodeHighlighterPlugin,
      ...(isVitest ? [cssStubPlugin] : []),
      pluginBundleWatcher(),
    ],
    css: {
      modules: {
        localsConvention: "camelCase",
        generateScopedName: "[name]__[local]__[hash:base64:5]",
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8088",
          changeOrigin: false,
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      testTimeout: 15_000,
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      // all @agentscope-ai/* packages excluded from inline — they are large / have CSS imports
      // aliases below redirect each to a stub or compiled entry
      deps: {
        inline: [/@agentscope-ai\/(?!icons|chat|design)/],
      },
      alias: {
        // GenUI plugin source (for testing pure logic functions)
        "@genui-src": path.resolve(
          __dirname,
          "../src/qwenpaw/plugins_bundle/ugsci/ui/src/genui",
        ),
        // Preserve vendor deep imports before aliasing the package entrypoint.
        "@agentscope-ai/chat/lib": path.resolve(
          __dirname,
          "node_modules/@agentscope-ai/chat/lib",
        ),
        // chat is aliased to a tiny stub to avoid OOM from the 2.3MB real package
        // Tests that need specific behavior override with vi.mock('@agentscope-ai/chat', factory)
        "@agentscope-ai/chat": path.resolve(__dirname, "src/test/chat-mock.ts"),
        // design is aliased to a stub to avoid hanging from its 3MB lib
        "@agentscope-ai/design": path.resolve(
          __dirname,
          "src/test/design-mock.ts",
        ),
        "@agentscope-ai/icons": path.resolve(
          __dirname,
          "src/test/icons-mock.ts",
        ),
        "@tauri-apps/api/core": path.resolve(
          __dirname,
          "src/test/tauri-mock.ts",
        ),
        "@tauri-apps/plugin-dialog": path.resolve(
          __dirname,
          "src/test/tauri-mock.ts",
        ),
      },
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        // 旧测试用 node:test，与 vitest 不兼容，待迁移
        "**/testConnectionMessage.test.ts",
        // ChatPage test causes worker crash - pre-existing issue, needs more mock setup
        "**/pages/Chat/ChatPage.test.tsx",
        // Tauri modules require @tauri-apps/api which only exists in desktop builds
        "**/src/tauri/**",
      ],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "json", "json-summary", "lcov", "cobertura"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/test/**",
          "src/tauri/**",
          "src/**/*.d.ts",
          "src/main.tsx",
          "src/vite-env.d.ts",
        ],
        thresholds: {
          statements: 5,
          branches: 4,
          functions: 3,
          lines: 5,
        },
      },
    },
    optimizeDeps: {
      include: [
        "diff",
        // react-syntax-highlighter language modules are dynamically imported
        // by @agentscope-ai/chat's CodeHighlighter. Pre-bundle the common
        // languages so Vite's dev server can resolve them at runtime.
        // NOTE: only modules that actually exist under
        // react-syntax-highlighter/dist/esm/languages/prism/ can be listed
        // here — Vite will error on non-existent paths.
        "react-syntax-highlighter/dist/esm/languages/prism/json",
        "react-syntax-highlighter/dist/esm/languages/prism/javascript",
        "react-syntax-highlighter/dist/esm/languages/prism/typescript",
        "react-syntax-highlighter/dist/esm/languages/prism/jsx",
        "react-syntax-highlighter/dist/esm/languages/prism/tsx",
        "react-syntax-highlighter/dist/esm/languages/prism/python",
        "react-syntax-highlighter/dist/esm/languages/prism/bash",
        "react-syntax-highlighter/dist/esm/languages/prism/java",
        "react-syntax-highlighter/dist/esm/languages/prism/go",
        "react-syntax-highlighter/dist/esm/languages/prism/rust",
        "react-syntax-highlighter/dist/esm/languages/prism/cpp",
        "react-syntax-highlighter/dist/esm/languages/prism/c",
        "react-syntax-highlighter/dist/esm/languages/prism/csharp",
        "react-syntax-highlighter/dist/esm/languages/prism/sql",
        "react-syntax-highlighter/dist/esm/languages/prism/yaml",
        // markup covers HTML, XML, and SVG in Prism
        "react-syntax-highlighter/dist/esm/languages/prism/markup",
        "react-syntax-highlighter/dist/esm/languages/prism/css",
        "react-syntax-highlighter/dist/esm/languages/prism/markdown",
        "react-syntax-highlighter/dist/esm/languages/prism/docker",
        "react-syntax-highlighter/dist/esm/languages/prism/git",
        "react-syntax-highlighter/dist/esm/languages/prism/ini",
        "react-syntax-highlighter/dist/esm/languages/prism/toml",
        "react-syntax-highlighter/dist/esm/languages/prism/powershell",
        "react-syntax-highlighter/dist/esm/languages/prism/ruby",
        "react-syntax-highlighter/dist/esm/languages/prism/php",
        "react-syntax-highlighter/dist/esm/languages/prism/swift",
        "react-syntax-highlighter/dist/esm/languages/prism/kotlin",
        "react-syntax-highlighter/dist/esm/languages/prism/scala",
        "react-syntax-highlighter/dist/esm/languages/prism/lua",
        "react-syntax-highlighter/dist/esm/languages/prism/r",
        "react-syntax-highlighter/dist/esm/languages/prism/perl",
        "react-syntax-highlighter/dist/esm/languages/prism/makefile",
        "react-syntax-highlighter/dist/esm/languages/prism/nginx",
        "react-syntax-highlighter/dist/esm/languages/prism/latex",
      ],
    },
    build: {
      // Output to QwenPaw's console directory,
      // so we don't need to copy files manually after build.
      // outDir: path.resolve(__dirname, "../src/qwenpaw/console"),
      // emptyOutDir: true,
      cssCodeSplit: true,
      sourcemap: mode !== "production",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        // Optional Workspace renderer deps — not installed by default.
        // They are dynamically imported inside try/catch, so marking them
        // external prevents Rollup from failing the build at resolution time.
        // PdfRenderer uses pdfjs-dist directly; keep react-pdf external so the
        // legacy research reader cannot inflate the default application graph.
        external: ["react-pdf", "@codesandbox/sandpack-react", /@tiptap\//],
        output: {
          manualChunks(id) {
            // Only isolate large, leaf-like feature runtimes. Grouping React,
            // Ant Design and shared utilities by hand created circular chunks
            // because those packages depend on each other. Rollup can split
            // the application graph more safely when shared UI code is left
            // to its default chunking algorithm.
            if (id.includes("node_modules/monaco-editor/")) {
              return "monaco-vendor";
            }
            if (id.includes("node_modules/mermaid/")) {
              return "diagram-vendor";
            }
            if (id.includes("node_modules/pdfjs-dist/")) {
              return "pdf-vendor";
            }
            if (
              id.includes("node_modules/mammoth/") ||
              id.includes("node_modules/read-excel-file/") ||
              id.includes("node_modules/jszip/")
            ) {
              return "document-vendor";
            }
          },
        },
      },
    },
  };
});
