/**
 * UGSci frontend plugin for QwenPaw
 *
 * Transforms the QwenPaw UI into a petroleum-domain-friendly interface with
 * three core modules: Capabilities, Skills, and Experts.
 *
 * Key design: Expert display data is LINKED to real Agent data — each expert
 * card/drawer fetches the agent's actual skills, MCP clients, tools, and
 * system prompt files from the existing QwenPaw API.
 *
 * Uses window.QwenPaw plugin API for route + menu registration.
 */

import { getHost } from "./core/runtime";
import { isSimpleMode } from "./core/shared";
import { ExpertCenterPage } from "./expert/ExpertCenterPage";
import { CapabilityCenterPage } from "./capability/CapabilityCenterPage";
import { SkillCenterPage } from "./skill/SkillCenterPage";
import { MarketplacePage } from "./market/MarketplacePage";
import { WelcomePromptsInjector } from "./WelcomePromptsInjector";

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

  // ── Register Welcome Prompts Injector ────────────────────────────────
  // Register a hidden component in the rightHeader slot so it stays mounted
  // for the lifetime of the chat page and can react to agent switches.
  if (QP.chat?.rightHeader?.add) {
    QP.chat.rightHeader.add(PLUGIN_ID, React.createElement(WelcomePromptsInjector), {
      id: "ugsci.welcome-injector",
      order: -1, // render before other right-header items (invisible anyway)
    });
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
  const ThunderboltOutlined = antdIcons.ThunderboltOutlined;
  const ShopOutlined = antdIcons.ShopOutlined;

  // Expert Center
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: ExpertCenterPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: UserSwitchOutlined
      ? React.createElement(UserSwitchOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "ugsci.experts",
    order: 5,
    visible: () => isSimpleMode(),
  });

  // Capability Center → Tools
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: CapabilityCenterPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: ToolOutlined
      ? React.createElement(ToolOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => isSimpleMode(),
  });

  // Skill Center → Skills
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: SkillCenterPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: ThunderboltOutlined
      ? React.createElement(ThunderboltOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => isSimpleMode(),
  });

  // Marketplace
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: MarketplacePage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: ShopOutlined
      ? React.createElement(ShopOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "ugsci.market",
    order: 8,
    visible: () => isSimpleMode(),
  });

  // ── Register for Simple Mode ─────────────────────────────────────────
  // Register the center + marketplace IDs so they remain visible when the
  // user switches the sidebar to "simple" mode.
  if (QP.sidebar?.registerSimpleModeItems) {
    QP.sidebar.registerSimpleModeItems([
      "ugsci.experts",
      "ugsci.capabilities",
      "ugsci.skills-center",
      "ugsci.market",
    ]);
    console.info("[ugsci] Registered 4 items for simple-mode visibility");
  } else {
    console.warn(
      "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode",
    );
  }

  // ── Simplify Navigation (Simple Mode only) ────────────────────────────
  // In simple mode, hide these built-in items because the three UGSci
  // centers provide a simpler, domain-focused alternative.
  // Note: core.mcp is NOT hidden — the native /mcp page is reused for
  // full MCP management (edit, OAuth, access policy) and is linked from
  // the UGSci Capability Center's MCP tab.
  // In full mode, ALL built-in items remain visible (original QwenPaw).
  // Items are hidden (not removed) via menu.replace with visible callback.

  const hideItems = [
    "core.skills",
    "core.tools",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool",
  ];

  for (const itemId of hideItems) {
    // Try agent-scoped location
    try {
      const snapshot = QP.menu.snapshot("primary.agentScoped");
      const existing = snapshot.find((i: any) => i.id === itemId);
      if (existing) {
        QP.menu.replace(PLUGIN_ID, itemId, {
          ...existing,
          visible: () => !isSimpleMode(),
        });
      }
    } catch {}
    // Also try settings location (for skill-pool)
    try {
      const snapshot = QP.menu.snapshot("primary.settings");
      const existing = snapshot.find((i: any) => i.id === itemId);
      if (existing) {
        QP.menu.replace(PLUGIN_ID, itemId, {
          ...existing,
          visible: () => !isSimpleMode(),
        });
      }
    } catch {}
  }

  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active",
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
