/** GenUI frontend registration — registers tool renderers and response.append. */

import { GenUiToolCall } from "./components/GenUiToolCall";
import { GenUiInline } from "./components/GenUiInline";
import { GenUiStoreProvider } from "./stores/genUi";

export function registerGenuiFrontend(QP: any, React: any): void {
  const PLUGIN_ID = "ugsci";

  if (QP.chat?.toolRender) {
    QP.chat.toolRender(PLUGIN_ID, "emit_ui_tree", GenUiToolCall);
    QP.chat.toolRender(PLUGIN_ID, "emit_ui_patch", GenUiToolCall);
    QP.chat.toolRender(PLUGIN_ID, "list_ui_components", GenUiToolCall);
    QP.chat.toolRender(PLUGIN_ID, "get_genui_guide", GenUiToolCall);
    console.info("[ugsci.genui] Registered 4 tool card renderers");
  }

  if (QP.chat?.response?.append) {
    QP.chat.response.append(
      PLUGIN_ID,
      (ctx: { data: Record<string, unknown> }) =>
        React.createElement(GenUiStoreProvider, null, React.createElement(GenUiInline, { data: ctx.data })),
      { id: "ugsci.genui.response-append", order: 50 },
    );
    console.info("[ugsci.genui] Registered response.append slot");
  }
}
