import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";
// Keep Monaco fully local (workers + stylesheet) for both Coding Mode and
// compact workspace previews. This must run before any editor mounts.
import "./monacoSetup";
import { installHostExternals } from "./plugins/hostExternals";
import { registerHostModulesDynamic } from "./plugins/dynamicModuleRegistry";
// Bare side-effect imports: each file self-registers its data into
// menuRegistry / routeRegistry so consumers' first render sees them.
import "./layouts/registry/builtinMenu";
import "./layouts/registry/builtinRoutes.tsx";

// Expose host dependencies (React, antd, etc.) on window
// so that plugin UI modules can use them without bundling their own copies.
installHostExternals();

// window.QwenPaw.chat/host/audit SDK and built-in tool cards are installed
// by PluginProvider before the first plugin bundle executes (see
// plugins/PluginContext.tsx), so first paint stays fast.

// Dynamic module registration — fire-and-forget. Pages register into
// `moduleRegistry` as they are lazy-loaded; this background pass pre-warms
// the registry so `window.QwenPaw.modules.<page>` is populated soon after
// startup without blocking the first paint (eager mode used to synchronously
// pull all 233 page modules + transitive deps into the main thread).
if (import.meta.env.DEV) {
  const warmModules = () => void registerHostModulesDynamic();
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(warmModules, { timeout: 5000 });
  } else {
    globalThis.setTimeout(warmModules, 1500);
  }
}

if (typeof window !== "undefined") {
  // Prevent the browser/WebView from navigating away (replacing the whole
  // app) when a file is dropped outside a drop zone like the chat sender.
  // The Tauri window disables native drag-drop interception so OS file
  // drags reach the page as HTML5 drag events; any drop not consumed by a
  // drop zone would otherwise open the file directly. Drop zones stop
  // propagation, so this only sees unhandled drops. Scoped to file drags
  // to keep element drag-and-drop (e.g. queue reordering) untouched.
  const isFileDrag = (e: DragEvent) =>
    !!e.dataTransfer && Array.from(e.dataTransfer.types).includes("Files");
  window.addEventListener("dragover", (e) => {
    if (isFileDrag(e)) e.preventDefault();
  });
  window.addEventListener("drop", (e) => {
    if (isFileDrag(e)) e.preventDefault();
  });

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = function (...args: unknown[]) {
    const msg = args[0]?.toString() || "";
    if (
      msg.includes(":first-child") ||
      msg.includes("pseudo class") ||
      // antd v5 emits deprecation warnings via console.error (not
      // console.warn). These come from third-party packages
      // (@agentscope-ai/design, @agentscope-ai/chat) that we cannot
      // control, so suppress them here to keep the console clean.
      msg.includes("overlayClassName") ||
      msg.includes("overlayStyle") ||
      msg.includes("overlayInnerStyle") ||
      msg.includes("[antd: Spin] `tip` only work in nest or fullscreen pattern")
    ) {
      return;
    }
    originalError.apply(console, args as []);
  };

  console.warn = function (...args: unknown[]) {
    const msg = args[0]?.toString() || "";
    if (
      msg.includes(":first-child") ||
      msg.includes("pseudo class") ||
      msg.includes("potentially unsafe") ||
      msg.includes("Message not found for content") ||
      // antd v5 Tooltip/Popover deprecation warning from
      // @agentscope-ai/design SparkTooltip and @agentscope-ai/chat
      // UserMessageAnchors (both pass overlayClassName to antd Tooltip).
      msg.includes("overlayClassName") ||
      msg.includes("overlayStyle") ||
      msg.includes("overlayInnerStyle")
    ) {
      return;
    }
    originalWarn.apply(console, args as []);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
