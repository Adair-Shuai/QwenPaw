/** GenUI frontend registration — registers tool renderers and response.append. */

import { GenUiToolCall } from "./components/GenUiToolCall";
import { GenUiCatalogCard } from "./components/GenUiCatalogCard";
import { GenUiInline } from "./components/GenUiInline";
import {
  GenUiStoreProvider,
  resetGenUiStore,
  clearSession,
} from "./stores/genUi";
import { clearMediaCache } from "./lib/genUiMedia";
import { apiFetch } from "../core/runtime";
import { UgsciDerivationPanel } from "../derivation/UgsciDerivationPanel";
import { DerivationToolCall } from "../derivation/DerivationToolCall";
import { hydrateDerivations } from "../derivation/useDerivationStore";

let disposeRegistrations: (() => void) | null = null;

export function registerGenuiFrontend(QP: any, React: any): () => void {
  const PLUGIN_ID = "ugsci";
  disposeRegistrations?.();
  const disposables: Array<{ dispose: () => void }> = [];

  void apiFetch<Record<string, unknown>>("/ugsci/genui/config", {
    bypassCache: true,
  })
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
      console.warn(
        "[ugsci.genui] Failed to load runtime config; using compatibility fallback",
        error,
      );
    });

  if (QP.chat?.toolRender) {
    disposables.push(
      QP.chat.toolRender(PLUGIN_ID, "emit_ui_tree", GenUiToolCall),
    );
    disposables.push(
      QP.chat.toolRender(PLUGIN_ID, "emit_ui_patch", GenUiToolCall),
    );
    disposables.push(
      QP.chat.toolRender(PLUGIN_ID, "list_ui_components", GenUiCatalogCard),
    );
    disposables.push(
      QP.chat.toolRender(PLUGIN_ID, "get_genui_guide", GenUiCatalogCard),
    );
    for (const name of [
      "ugsci_trace_calculation",
      "ugsci_replay_calculation",
      "ugsci_derive_formula",
      "ugsci_evaluate_formula",
      "ugsci_transform_formula",
      "ugsci_formula_preview",
    ]) {
      disposables.push(QP.chat.toolRender(PLUGIN_ID, name, DerivationToolCall));
    }
    console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards");
  }
  if (QP.slot?.fill) {
    disposables.push(
      QP.slot.fill(PLUGIN_ID, "chat.workbench.compute", () =>
        React.createElement(UgsciDerivationPanel),
      ),
    );
  }

  if (QP.chat?.response?.append) {
    disposables.push(
      QP.chat.response.append(
        PLUGIN_ID,
        (ctx: { data: Record<string, unknown> }) => {
          const DerivationHydrator = () => {
            React.useEffect(
              () => hydrateDerivations(ctx.data.output),
              [ctx.data.output],
            );
            return null;
          };
          return React.createElement(
            GenUiStoreProvider,
            null,
            React.createElement(DerivationHydrator),
            React.createElement(GenUiInline, { data: ctx.data }),
          );
        },
        { id: "ugsci.genui.response-append", order: 50 },
      ),
    );
    console.info("[ugsci.genui] Registered response.append slot");
  }
  disposeRegistrations = () => {
    for (const disposable of disposables.reverse()) disposable?.dispose?.();
    resetGenUiStore();
    clearMediaCache();
    if (QP.genui) {
      const next = { ...QP.genui };
      delete next.dispose;
      delete next.clearSession;
      QP.genui = next;
    }
    disposeRegistrations = null;
  };
  QP.genui = {
    ...(QP.genui || {}),
    dispose: disposeRegistrations,
    clearSession,
  };
  return disposeRegistrations;
}
