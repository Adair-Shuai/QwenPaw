/** GenUI frontend registration — registers tool renderers and response.append. */

import { GenUiToolCall } from "./components/GenUiToolCall";
import { GenUiInline } from "./components/GenUiInline";
import { GenUiStoreProvider, resetGenUiStore } from "./stores/genUi";
import { clearMediaCache } from "./lib/genUiMedia";
import { apiFetch } from "../core/runtime";

let disposeRegistrations: (() => void) | null = null;

export function registerGenuiFrontend(QP: any, React: any): () => void {
  const PLUGIN_ID = "ugsci";
  disposeRegistrations?.();
  const disposables: Array<{ dispose: () => void }> = [];

  void apiFetch<Record<string, unknown>>("/ugsci/genui/config", { bypassCache: true })
    .then((config) => {
      QP.genui = { ...(QP.genui || {}), config };
    })
    .catch((error) => {
      // Compatibility fallback for an older host that has not mounted the
      // backend route yet. Keep the degraded marker visible to the UI/logs;
      // this must never be mistaken for a healthy backend registration.
      QP.genui = {
        ...(QP.genui || {}),
        config: {
          enabled: true,
          persisted_enabled: true,
          overridden: false,
          channels: ["response.append"],
          allow_html: false,
          allow_actions: [],
          backend_unavailable: true,
        },
      };
      console.warn("[ugsci.genui] Failed to load runtime config; using compatibility fallback", error);
    });

  if (QP.chat?.toolRender) {
    disposables.push(QP.chat.toolRender(PLUGIN_ID, "emit_ui_tree", GenUiToolCall));
    disposables.push(QP.chat.toolRender(PLUGIN_ID, "emit_ui_patch", GenUiToolCall));
    disposables.push(QP.chat.toolRender(PLUGIN_ID, "list_ui_components", GenUiToolCall));
    disposables.push(QP.chat.toolRender(PLUGIN_ID, "get_genui_guide", GenUiToolCall));
    console.info("[ugsci.genui] Registered 4 tool card renderers");
  }

  if (QP.chat?.response?.append) {
    disposables.push(QP.chat.response.append(
      PLUGIN_ID,
      (ctx: { data: Record<string, unknown> }) =>
        React.createElement(GenUiStoreProvider, null, React.createElement(GenUiInline, { data: ctx.data })),
      { id: "ugsci.genui.response-append", order: 50 },
    ));
    console.info("[ugsci.genui] Registered response.append slot");
  }
  disposeRegistrations = () => {
    for (const disposable of disposables.reverse()) disposable?.dispose?.();
    resetGenUiStore();
    clearMediaCache();
    disposeRegistrations = null;
  };
  return disposeRegistrations;
}
