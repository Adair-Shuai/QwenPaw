/**
 * UGSci frontend plugin for QwenPaw
 *
 * Transforms the QwenPaw UI into a petroleum-domain-friendly interface with
 * three user-facing modules: Experts & Collaboration, Tools & Skills, and
 * Marketplace.
 *
 * Key design: Expert display data is LINKED to real Agent data — each expert
 * card/drawer fetches the agent's actual skills, MCP clients, tools, and
 * system prompt files from the existing QwenPaw API.
 *
 * Uses window.QwenPaw plugin API for route + menu registration.
 */

import { getHost } from "./core/runtime";
import { ExpertCenterPage } from "./expert/ExpertCenterPage";
import {
  LegacySkillsCenterPage,
  LegacyToolsCenterPage,
  ToolsSkillsCenterPage,
} from "./capability/ToolsSkillsCenterPage";
import { MarketplacePage } from "./market/MarketplacePage";
import { WelcomePromptsInjector } from "./WelcomePromptsInjector";
import { registerGenuiFrontend } from "./genui/index";
import { GenUiSettingsPage } from "./genui/GenUiSettingsPage";
import { registerVisualizationFrontend } from "./visualization";
import { StorageDynamicsPage } from "./storage/StorageDynamicsPage";

// ─── Plugin Registration ──────────────────────────────────────────────────────

function buildPlugin() {
  const QP = (window as any).QwenPaw;
  if (!QP?.menu || !QP?.route) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled",
    );
    return;
  }

  const React = getHost().React;
  const PLUGIN_ID = "ugsci";

  function EmbeddedMarketplacePage() {
    const React = getHost().React;
    return React.createElement(MarketplacePage as any, { embedded: true });
  }

  function LegacyMarketplaceRedirect() {
    const React = getHost().React;
    React.useEffect(() => {
      const target = "/market?tab=ugsci";
      window.history.replaceState({}, "", target);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, []);
    return null;
  }

  // ── Register Welcome Prompts Injector ────────────────────────────────
  // Register a hidden component in the rightHeader slot so it stays mounted
  // for the lifetime of the chat page and can react to agent switches.
  if (QP.chat?.rightHeader?.add) {
    QP.chat.rightHeader.add(
      PLUGIN_ID,
      React.createElement(WelcomePromptsInjector),
      {
        id: "ugsci.welcome-injector",
        order: -1, // render before other right-header items (invisible anyway)
      },
    );
    console.info("[ugsci] WelcomePromptsInjector registered via rightHeader");
  } else {
    console.warn(
      "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled",
    );
  }

  // ── Register Routes + Menu Items ─────────────────────────────────────
  // Use the new QwenPaw.route.add / QwenPaw.menu.add API so items appear
  // in the agent-scoped section, not under plugins-group.

  const antdIcons = getHost().antdIcons || {};
  const UserSwitchOutlined = antdIcons.UserSwitchOutlined;
  const ToolOutlined = antdIcons.ToolOutlined;
  const AppstoreOutlined = antdIcons.AppstoreOutlined;

  QP.route.add(PLUGIN_ID, {
    id: "ugsci.storage-dynamics",
    path: "/ugsci-storage-dynamics",
    component: StorageDynamicsPage,
  });
  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.storage-dynamics",
    location: "primary.agentScoped",
    label: () => "储气库动态",
    icon: antdIcons.LineChartOutlined
      ? React.createElement(antdIcons.LineChartOutlined, {
          style: { fontSize: 16 },
        })
      : undefined,
    route: "ugsci.storage-dynamics",
    order: 7,
  });

  // Expert Center
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: ExpertCenterPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: UserSwitchOutlined
      ? React.createElement(UserSwitchOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "ugsci.experts",
    order: 5,
  });

  QP.route.add(PLUGIN_ID, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: GenUiSettingsPage,
  });
  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.genui-settings",
    location: "primary.settings",
    parentId: "plugins-group",
    label: () => "GenUI 设置",
    icon: AppstoreOutlined
      ? React.createElement(AppstoreOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "ugsci.genui-settings",
    order: 30,
  });

  // Unified Tools & Skills Center
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: ToolsSkillsCenterPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: ToolOutlined
      ? React.createElement(ToolOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "ugsci.tools-skills",
    order: 6,
  });

  // Compatibility routes: keep old bookmarks and in-plugin links working,
  // while rendering them through the unified composition layer.
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: LegacyToolsCenterPage,
  });

  QP.route.add(PLUGIN_ID, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: LegacySkillsCenterPage,
  });

  // Marketplace compatibility route. The visible entry now lives inside the
  // host's official marketplace as the UGSci section.
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: LegacyMarketplaceRedirect,
  });

  QP.marketplace?.add(PLUGIN_ID, {
    id: "ugsci",
    label: "UGSci",
    component: EmbeddedMarketplacePage,
    order: 30,
  });

  // ── Register for Simple Mode ─────────────────────────────────────────
  // Register the center + marketplace IDs so they remain visible when the
  // user switches the sidebar to "simple" mode.
  if (QP.sidebar?.registerSimpleModeItems) {
    QP.sidebar.registerSimpleModeItems([
      "ugsci.experts",
      "ugsci.tools-skills",
      "ugsci.storage-dynamics",
    ]);
    console.info(
      "[ugsci] Registered 3 entries for legacy simple-mode compatibility",
    );
  } else {
    console.warn(
      "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode",
    );
  }

  // The host owns sidebar visibility through its per-entry preferences.
  // Do not gate plugin entries or override core entries using the retired
  // qwenpaw_sidebar_mode key: fresh desktop profiles never have that key.

  // The standalone oilgas-visualization plugin was removed, but an already
  // running host/HMR session can still retain its old menu registration.
  // Hide that stale item so UGSci remains the single visible entry point.
  try {
    const snapshot = QP.menu.snapshot("primary.agentScoped");
    const stale = snapshot.find((item: any) => item.id === "oilgas-vis.page");
    if (stale) {
      QP.menu.replace(PLUGIN_ID, "oilgas-vis.page", {
        ...stale,
        visible: () => false,
      });
    }
  } catch {}

  // ── Register GenUI Frontend ─────────────────────────────────────────
  // Registers tool card renderers (emit_ui_tree, emit_ui_patch, etc.)
  // and the response.append slot for inline GenUI rendering.
  registerGenuiFrontend(QP, React);
  registerVisualizationFrontend(QP, React);

  console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, host-managed navigation",
  );
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

function tryBuildPlugin() {
  try {
    buildPlugin();
  } catch (err) {
    console.error("[ugsci] Failed to build plugin:", err);
    setTimeout(tryBuildPlugin, 500);
  }
}

// Wait for host to be ready
if ((window as any).QwenPaw?.host) {
  tryBuildPlugin();
} else {
  const interval = setInterval(() => {
    if ((window as any).QwenPaw?.host) {
      clearInterval(interval);
      tryBuildPlugin();
    }
  }, 200);
  setTimeout(() => clearInterval(interval), 10000);
}
