/**
 * Unified Tools & Skills center.
 *
 * This is a composition layer. MCP, native tools, simulation engines, ACP,
 * and skills keep their existing owners and business logic; UGSci only
 * arranges those native surfaces into a domain-oriented information
 * architecture.
 */

import type { ComponentType } from "react";
import { getHost } from "../core/runtime";
import type { BuiltinPageId } from "../core/runtime";
import { PageHeader } from "../core/shared";
import { SkillCenterPage } from "../skill/SkillCenterPage";
import { EngineSection } from "./EngineSection";

type CenterTab = "tools" | "engines" | "skills";

const EmbeddedSkillCenter = SkillCenterPage as ComponentType<{
  embedded?: boolean;
}>;

const VALID_TABS = new Set<CenterTab>(["tools", "engines", "skills"]);

function tabFromLocation(fallback: CenterTab): CenterTab {
  try {
    const tab = new URLSearchParams(window.location.search).get("tab");
    return tab && VALID_TABS.has(tab as CenterTab)
      ? (tab as CenterTab)
      : fallback;
  } catch {
    return fallback;
  }
}

function updateTabInLocation(tab: CenterTab): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  } catch {
    // The center still works when history manipulation is unavailable.
  }
}

/**
 * Load and render an allow-listed native QwenPaw page in embedded mode.
 * This preserves the host page's complete CRUD, validation, state and future
 * upgrades without copying them into the plugin bundle.
 */
function HostBuiltinPage({ page }: { page: BuiltinPageId }) {
  const React = getHost().React;
  const { useEffect, useState } = React;
  const { Alert, Spin } = getHost().antd;
  const [Page, setPage] = useState<ComponentType<{
    embedded?: boolean;
    embeddedLabels?: Record<string, string>;
  }> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadBuiltinPage = getHost().loadBuiltinPage;
    setPage(null);
    if (!loadBuiltinPage) {
      setError("当前 QwenPaw 版本不支持原生页面嵌入");
      return () => {
        active = false;
      };
    }

    setError("");
    loadBuiltinPage(page)
      .then((component) => {
        if (active) setPage(() => component);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(
          reason instanceof Error ? reason.message : "加载原生管理页面失败",
        );
      });

    return () => {
      active = false;
    };
  }, [page]);

  if (error) {
    return React.createElement(Alert, {
      type: "error",
      showIcon: true,
      message: "原生管理功能加载失败",
      description: error,
    });
  }

  if (!Page) {
    return React.createElement(
      "div",
      { style: { padding: 56, textAlign: "center" } },
      React.createElement(
        Spin,
        { tip: "正在加载原生管理功能..." },
        React.createElement("div", { style: { minHeight: 24 } }),
      ),
    );
  }

  const embeddedLabels =
    page === "mcp"
      ? {
          title: "UGSci MCP",
          description: "连接外部工具、数据服务与计算能力，扩展当前专家的可调用范围",
          managedTitle: "已接入服务",
          managedDescription: "启用后可由当前专家调用，并可按工具配置访问权限",
          create: "接入 MCP 服务",
        }
      : undefined;

  return React.createElement(Page, { embedded: true, embeddedLabels });
}

function ToolsWorkspaceSection() {
  const React = getHost().React;
  const { Tabs } = getHost().antd;

  return React.createElement(Tabs, {
    defaultActiveKey: "mcp",
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: React.createElement(HostBuiltinPage, { page: "mcp" }),
      },
      {
        key: "builtin",
        label: "平台内置",
        children: React.createElement(HostBuiltinPage, { page: "tools" }),
      },
    ],
  });
}

function DomainComputeSection() {
  const React = getHost().React;
  const { Empty, Typography } = getHost().antd;
  const { Paragraph } = Typography;

  return React.createElement(
    "div",
    { style: { padding: "36px 12px" } },
    React.createElement(Empty, {
      description: React.createElement(
        "div",
        null,
        React.createElement("div", null, "暂无已注册的领域计算引擎"),
        React.createElement(
          Paragraph,
          {
            type: "secondary",
            style: { maxWidth: 560, margin: "8px auto 0" },
          },
          "后续 PVT、气藏工程、井筒计算等内核可按引擎注册，并向工具层暴露标准调用接口。",
        ),
      ),
    }),
  );
}

function EngineWorkspaceSection() {
  const React = getHost().React;
  const { Tabs } = getHost().antd;

  return React.createElement(Tabs, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: React.createElement(EngineSection),
      },
      {
        key: "domain",
        label: "领域计算",
        children: React.createElement(DomainComputeSection),
      },
      {
        key: "runtime",
        label: "运行服务",
        children: React.createElement(HostBuiltinPage, { page: "acp" }),
      },
    ],
  });
}

export function ToolsSkillsCenterPage({
  initialTab = "engines",
}: {
  initialTab?: CenterTab;
} = {}) {
  const React = getHost().React;
  const { useEffect, useState } = React;
  const { Tabs, Tag } = getHost().antd;
  const { RocketOutlined, ToolOutlined, ThunderboltOutlined } =
    getHost().antdIcons || {};
  const selected = getHost().useSelectedAgent?.();
  const agentId = selected?.id || "default";
  const [activeTab, setActiveTab] = useState<CenterTab>(() =>
    tabFromLocation(initialTab),
  );

  useEffect(() => {
    try {
      const tab = new URLSearchParams(window.location.search).get("tab");
      if (tab && !VALID_TABS.has(tab as CenterTab)) {
        updateTabInLocation(activeTab);
      }
    } catch {
      // Keep the selected tab even when the host does not expose location.
    }
  }, [activeTab]);

  const changeTab = (tab: CenterTab) => {
    setActiveTab(tab);
    updateTabInLocation(tab);
  };

  const tabLabel = (
    label: string,
    Icon?: ComponentType<{ style?: Record<string, unknown> }>,
  ) =>
    React.createElement(
      "span",
      { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
      Icon ? React.createElement(Icon, { style: { fontSize: 14 } }) : null,
      label,
    );

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(PageHeader, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: React.createElement(
        Tag,
        { color: "blue" },
        `当前专家：${agentId}`,
      ),
    }),
    React.createElement(Tabs, {
      activeKey: activeTab,
      onChange: (key: string) => changeTab(key as CenterTab),
      items: [
        {
          key: "engines",
          label: tabLabel("引擎", RocketOutlined),
          children: React.createElement(EngineWorkspaceSection),
        },
        {
          key: "tools",
          label: tabLabel("工具", ToolOutlined),
          children: React.createElement(ToolsWorkspaceSection),
        },
        {
          key: "skills",
          label: tabLabel("技能", ThunderboltOutlined),
          children: React.createElement(EmbeddedSkillCenter, {
            embedded: true,
          }),
        },
      ],
    }),
  );
}

/** Compatibility components for existing bookmarks and plugin links. */
const ToolsSkillsCenterComponent = ToolsSkillsCenterPage as ComponentType<{
  initialTab?: CenterTab;
}>;

export function LegacyToolsCenterPage() {
  return getHost().React.createElement(ToolsSkillsCenterComponent, {
    initialTab: "tools",
  });
}

export function LegacySkillsCenterPage() {
  return getHost().React.createElement(ToolsSkillsCenterComponent, {
    initialTab: "skills",
  });
}
