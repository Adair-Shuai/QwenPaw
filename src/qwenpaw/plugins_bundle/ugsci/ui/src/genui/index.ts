/**
 * GenUI frontend registration — registers tool renderers and response.append
 * for the GenUI module within the UGSci plugin.
 *
 * Called by the main UGSci `buildPlugin()` function. Registers:
 * 1. ToolCard renderer for `emit_ui_tree` via `QP.chat.toolRender`.
 * 2. ToolCard renderer for `list_ui_components` via `QP.chat.toolRender`.
 * 3. ToolCard renderer for `get_genui_guide` via `QP.chat.toolRender`.
 * 4. Response.append slot to render GenUI trees inline.
 */

import { GenUiToolCall } from "./components/GenUiToolCall";
import { GenUiInline } from "./components/GenUiInline";
import { GenUiStoreProvider } from "./stores/genUi";

export function registerGenuiFrontend(QP: any, React: any): void {
  const PLUGIN_ID = "ugsci";

  // ── 1. Register ToolCard renderers ────────────────────────────────────
  if (QP.chat?.toolRender) {
    QP.chat.toolRender(PLUGIN_ID, "emit_ui_tree", GenUiToolCall);
    QP.chat.toolRender(PLUGIN_ID, "list_ui_components", GenUiToolCall);
    QP.chat.toolRender(PLUGIN_ID, "get_genui_guide", GenUiToolCall);
    console.info("[ugsci.genui] Registered 3 tool card renderers");
  } else {
    console.warn(
      "[ugsci.genui] QP.chat.toolRender not available — tool cards disabled",
    );
  }

  // ── 2. Register response.append for inline GenUI rendering ────────────
  if (QP.chat?.response?.append) {
    QP.chat.response.append(
      PLUGIN_ID,
      (ctx: { data: Record<string, unknown> }) => {
        // Wrap GenUiInline in the store provider
        return React.createElement(
          GenUiStoreProvider,
          null,
          React.createElement(GenUiInline, { data: ctx.data }),
        );
      },
      { id: "ugsci.genui.response-append", order: 50 },
    );
    console.info("[ugsci.genui] Registered response.append slot");
  } else {
    console.warn(
      "[ugsci.genui] QP.chat.response.append not available — inline rendering disabled",
    );
  }
}
