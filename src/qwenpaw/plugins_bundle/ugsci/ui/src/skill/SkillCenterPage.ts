/**
 * Skill center page — tabs for agent skills and skill pool.
 */

import { getHost, clearAgentCache } from "../core/runtime";
import { PageHeader } from "../core/shared";
import type { AgentSummary, PoolSkillSpec, WorkspaceSkillSummary } from "../core/types";
import { fetchAgents, fetchPoolSkills, fetchWorkspaceSkills } from "../core/api";
import { CurrentAgentSkillsTab } from "./CurrentAgentSkillsTab";
import { SkillPoolTab } from "./SkillPoolTab";

export function SkillCenterPage() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo } = React;
  const { Tabs, message: antdMsg } = getHost().antd;
  const { ThunderboltOutlined, AppstoreOutlined } =
    getHost().antdIcons || {};

  // Track the currently selected agent via the host hook
  const host = getHost();
  const useSelectedAgent = host.useSelectedAgent;
  const selectedAgentInfo = useSelectedAgent ? useSelectedAgent() : null;
  const currentAgentId = selectedAgentInfo?.id || "default";

  // Clear agent-scoped cache when the selected agent changes to ensure
  // this page always loads fresh data for the current agent.
  useEffect(() => {
    clearAgentCache();
  }, [currentAgentId]);

  // Also fetch agent list to resolve names
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [poolSkills, setPoolSkills] = useState<PoolSkillSpec[]>([]);
  const [workspaceSkills, setWorkspaceSkills] = useState<
    WorkspaceSkillSummary[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("agent-skills");

  const loadPoolData = useCallback(async () => {
    setLoading(true);
    try {
      const [pool, agentList, wsSkills] = await Promise.all([
        fetchPoolSkills(true),
        fetchAgents(),
        fetchWorkspaceSkills(),
      ]);
      setPoolSkills(pool);
      setAgents(agentList);
      setWorkspaceSkills(wsSkills);
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能列表失败");
      setPoolSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPoolData();
  }, [loadPoolData]);

  const currentAgentName = useMemo(() => {
    const agent = agents.find((a) => a.id === currentAgentId);
    return agent?.name || currentAgentId;
  }, [agents, currentAgentId]);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const tabItems = [
    {
      key: "agent-skills",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        ThunderboltOutlined
          ? React.createElement(ThunderboltOutlined, { style: { fontSize: 14 } })
          : null,
        "当前Agent加载技能",
      ),
      children: React.createElement(CurrentAgentSkillsTab, {
        agentId: currentAgentId,
        agentName: currentAgentName,
        onNavigate: navigateTo,
      }),
    },
    {
      key: "skill-pool",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        AppstoreOutlined
          ? React.createElement(AppstoreOutlined, { style: { fontSize: 14 } })
          : null,
        "技能池",
      ),
      children: React.createElement(SkillPoolTab, {
        poolSkills,
        workspaceSkills,
        agents,
        loading,
        onReload: loadPoolData,
        agentId: currentAgentId,
        agentName: currentAgentName,
      }),
    },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(PageHeader, {
      title: "技能",
      subtitle: `技能池共 ${poolSkills.length} 个技能 · 当前智能体：${currentAgentName}`,
    }),
    React.createElement(Tabs, {
      items: tabItems,
      activeKey: activeTab,
      onChange: (k: string) => setActiveTab(k),
    }),
  );
}

