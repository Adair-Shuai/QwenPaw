/**
 * Domain engine section — the main container component.
 *
 * Fetches the domain engine catalog, probes dependencies, and renders
 * cards grouped by domain.  Each card failure is isolated — one engine's
 * error does not affect the others.
 */

import { getHost } from "../core/runtime";
import {
  fetchDomainEngines,
  fetchBuiltinToolStatuses,
  fetchMcpProviderStatuses,
  fetchNeqSimInstallTask,
  fetchNeqSimRuntime,
  installNeqSimRuntime,
  fetchEngineRuntimePlan,
  type McpProviderStatus,
} from "./domainEngineApi";
import { buildEngineView } from "./runtimeStatus";
import type {
  DomainEngineView,
  NeqSimInstallTask,
  EngineRuntimePlan,
  RuntimeInstallTask,
} from "./types";
import { DomainEngineCard } from "./DomainEngineCard";
import { DomainEngineDetail } from "./DomainEngineDetail";
import { BUSINESS_GROUPS, businessGroupFor } from "./presentationGroups";
import { getOperationPresentation } from "./OperationList";
import { ENGINE_PRESENTATIONS } from "./operationPresentation";
import { RuntimeInstallDialog } from "./RuntimeInstallDialog";

function isMissingInstallTaskError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /Install task not found|HTTP 404/i.test(error.message);
}

export function DomainEngineSection({
  onNavigateToMcp,
  onNavigateToTools,
  onNavigateToSkills,
}: {
  onNavigateToMcp?: () => void;
  onNavigateToTools?: (subTab?: string) => void;
  onNavigateToSkills?: () => void;
} = {}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo, useRef } = React;
  const {
    Spin,
    Empty,
    Button,
    message: antdMsg,
    Row,
    Col,
    Input,
  } = getHost().antd;
  const { ReloadOutlined, SearchOutlined } = getHost().antdIcons || {};

  // Track the current agent so we re-fetch when it changes.
  const selected = getHost().useSelectedAgent?.();
  const agentId = selected?.id || "default";

  const [views, setViews] = useState<DomainEngineView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<DomainEngineView | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({ general: true });
  const [neqsimInstallState, setNeqsimInstallState] =
    useState<NeqSimInstallTask | null>(null);
  const [runtimeDialogView, setRuntimeDialogView] =
    useState<DomainEngineView | null>(null);
  const [runtimePlan, setRuntimePlan] = useState<EngineRuntimePlan | null>(
    null,
  );
  const [runtimeTask, setRuntimeTask] = useState<RuntimeInstallTask | null>(
    null,
  );
  const [runtimeError, setRuntimeError] = useState("");
  const [runtimeDialogOpen, setRuntimeDialogOpen] = useState(false);

  // Ref to track the latest agent ID — allows stale fetch responses
  // to be discarded without recreating the loadEngines callback.
  const agentIdRef = useRef(agentId);
  agentIdRef.current = agentId;
  const activeViewRef = useRef<DomainEngineView | null>(activeView);
  activeViewRef.current = activeView;
  const installPollGenerationRef = useRef(0);
  const runtimePlanGenerationRef = useRef(0);

  // Let the backend installation continue, but stop this component's polling
  // and state updates after the user navigates away.
  useEffect(
    () => () => {
      installPollGenerationRef.current += 1;
      runtimePlanGenerationRef.current += 1;
    },
    [],
  );

  const loadEngines = useCallback(async (force = false, background = false) => {
    if (!background) setLoading(true);
    const scrollSnapshot =
      background && typeof window !== "undefined"
        ? {
            x: window.scrollX,
            y: window.scrollY,
            drawerBody:
              typeof document !== "undefined"
                ? document.querySelector<HTMLElement>(
                    ".ugsci-domain-engine-detail-drawer .ant-drawer-body",
                  )
                : null,
            drawerTop:
              typeof document !== "undefined"
                ? document.querySelector<HTMLElement>(
                    ".ugsci-domain-engine-detail-drawer .ant-drawer-body",
                  )?.scrollTop || 0
                : 0,
          }
        : null;
    const restoreScroll = () => {
      if (!scrollSnapshot || typeof window === "undefined") return;
      const restore = () => {
        window.scrollTo(scrollSnapshot.x, scrollSnapshot.y);
        if (scrollSnapshot.drawerBody?.isConnected) {
          scrollSnapshot.drawerBody.scrollTop = scrollSnapshot.drawerTop;
        }
      };
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(restore);
      } else {
        restore();
      }
    };
    // Capture the agent at call time so stale responses from a
    // previous agent can be detected and discarded.
    const callerAgent = agentIdRef.current;
    try {
      // Fetch domain engines and MCP provider statuses in parallel.
      // When force=true, bypass the HTTP cache so the refresh button
      // always returns fresh data.
      const [responses, mcpStatuses, builtinTools] = await Promise.all([
        fetchDomainEngines(force),
        fetchMcpProviderStatuses(callerAgent, force),
        fetchBuiltinToolStatuses(callerAgent, force),
      ]);
      // If the agent changed while we were fetching, discard results.
      if (callerAgent !== agentIdRef.current) return;
      const built: DomainEngineView[] = [];
      for (const resp of responses) {
        try {
          // Look up MCP provider info for MCP-sourced engines
          let mcpInfo: McpProviderStatus | null = null;
          if (resp.engine.provider.kind === "driver") {
            const providerKey = resp.engine.provider.id;
            mcpInfo = mcpStatuses.get(providerKey) || null;
          }
          built.push(buildEngineView(resp, mcpInfo, builtinTools));
        } catch {
          // Skip individual failures
        }
      }
      setViews(built);
      const activeId = activeViewRef.current?.definition.id;
      if (activeId) {
        const refreshed = built.find((view) => view.definition.id === activeId);
        if (refreshed) {
          activeViewRef.current = refreshed;
          setActiveView(refreshed);
        }
      }
      restoreScroll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "加载领域引擎失败";
      antdMsg.error(msg);
      if (!background) setViews([]);
    } finally {
      if (!background) setLoading(false);
    }
  }, []);

  // Re-fetch when the component mounts or when the selected agent changes.
  useEffect(() => {
    loadEngines();
  }, [agentId, loadEngines]);

  const filteredViews = useMemo(() => {
    if (!searchText.trim()) return views;
    const q = searchText.trim().toLowerCase();
    return views.filter(
      (v: DomainEngineView) =>
        businessGroupFor(v.definition.domain, v.definition.id)
          .title.toLowerCase()
          .includes(q) ||
        v.definition.name.toLowerCase().includes(q) ||
        v.definition.domain.toLowerCase().includes(q) ||
        v.definition.description.toLowerCase().includes(q) ||
        [
          ENGINE_PRESENTATIONS[v.definition.id]?.description || "",
          ENGINE_PRESENTATIONS[v.definition.id]?.inputs || "",
          ENGINE_PRESENTATIONS[v.definition.id]?.outputs || "",
        ].some((value) => value.toLowerCase().includes(q)) ||
        v.definition.tags.some((t: string) => t.toLowerCase().includes(q)) ||
        v.definition.operations.some((op) => {
          const presentation = getOperationPresentation(op);
          return [
            op.name,
            op.id,
            op.description,
            ...op.tool_names,
            presentation.description,
            presentation.inputs,
            presentation.outputs,
            presentation.limitations || "",
          ].some((value) => value.toLowerCase().includes(q));
        }),
    );
  }, [views, searchText]);

  const groups = useMemo(
    () =>
      BUSINESS_GROUPS.map((group) => ({
        ...group,
        views: filteredViews.filter(
          (view) =>
            businessGroupFor(view.definition.domain, view.definition.id).key ===
            group.key,
        ),
      })).filter((group) => group.views.length > 0),
    [filteredViews],
  );

  const handleRefresh = useCallback(() => {
    loadEngines(true);
  }, [loadEngines]);

  const handleCardClick = useCallback((view: DomainEngineView) => {
    activeViewRef.current = view;
    setActiveView(view);
    setDrawerOpen(true);
  }, []);

  const handleNavigateToMcp = useCallback(() => {
    setDrawerOpen(false);
    onNavigateToMcp?.();
  }, [onNavigateToMcp]);

  const handleNavigateToTools = useCallback(
    (subTab?: string) => {
      setDrawerOpen(false);
      onNavigateToTools?.(subTab);
    },
    [onNavigateToTools],
  );

  const handleNavigateToSkills = useCallback(() => {
    setDrawerOpen(false);
    onNavigateToSkills?.();
  }, [onNavigateToSkills]);

  const handleInstallNeqsim = useCallback(async () => {
    if (
      neqsimInstallState?.status === "queued" ||
      neqsimInstallState?.status === "running"
    )
      return;
    const pollGeneration = ++installPollGenerationRef.current;
    const isCurrentPoll = () =>
      pollGeneration === installPollGenerationRef.current;
    try {
      let task = await installNeqSimRuntime();
      if (!isCurrentPoll()) return;
      setNeqsimInstallState(task);
      while (task.status === "queued" || task.status === "running") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!isCurrentPoll()) return;
        try {
          task = await fetchNeqSimInstallTask(task.id);
        } catch (pollError: unknown) {
          if (!isMissingInstallTaskError(pollError)) throw pollError;
          const runtime = await fetchNeqSimRuntime(true);
          if (!isCurrentPoll()) return;
          if (runtime.ready) {
            task = {
              ...task,
              status: "completed",
              progress: 100,
              message: "后端重启后已恢复 NeqSim 运行环境状态",
              error: "",
              runtime,
              recovered: true,
            };
          } else {
            task = {
              ...task,
              status: "failed",
              message: "安装进程因后端重启中断",
              error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
              runtime,
              recovered: true,
            };
          }
        }
        if (!isCurrentPoll()) return;
        setNeqsimInstallState(task);
      }
      if (!isCurrentPoll()) return;
      if (task.status === "completed") {
        if (task.warning) {
          antdMsg.warning(task.warning);
        } else {
          antdMsg.success("NeqSim 运行环境已安装并启用");
        }
        await loadEngines(true, true);
      } else {
        antdMsg.error(task.error || "NeqSim 安装失败");
      }
    } catch (err: unknown) {
      if (!isCurrentPoll()) return;
      antdMsg.error(err instanceof Error ? err.message : "NeqSim 安装失败");
    }
  }, [loadEngines, neqsimInstallState]);

  const handleRuntimeInstall = useCallback(
    async (view: DomainEngineView) => {
      if (view.definition.id === "neqsim") {
        if (
          neqsimInstallState?.status === "queued" ||
          neqsimInstallState?.status === "running"
        ) {
          activeViewRef.current = view;
          setActiveView(view);
          setDrawerOpen(true);
        } else {
          void handleInstallNeqsim();
        }
        return;
      }
      setRuntimeDialogView(view);
      setRuntimePlan(null);
      setRuntimeTask(null);
      setRuntimeError("");
      setRuntimeDialogOpen(true);
      const generation = ++runtimePlanGenerationRef.current;
      try {
        const plan = await fetchEngineRuntimePlan(view.definition.id);
        if (generation !== runtimePlanGenerationRef.current) return;
        setRuntimePlan(plan);
        setRuntimeTask(plan.active_task);
      } catch (err: unknown) {
        if (generation !== runtimePlanGenerationRef.current) return;
        setRuntimeError(
          err instanceof Error ? err.message : "读取运行环境失败",
        );
      }
    },
    [handleInstallNeqsim, neqsimInstallState],
  );

  const refreshRuntimePlan = useCallback(
    async (message?: string) => {
      if (message) {
        setRuntimeError(message);
        return;
      }
      if (!runtimeDialogView) return;
      setRuntimeError("");
      const generation = ++runtimePlanGenerationRef.current;
      try {
        const plan = await fetchEngineRuntimePlan(
          runtimeDialogView.definition.id,
        );
        if (generation !== runtimePlanGenerationRef.current) return;
        setRuntimePlan(plan);
        setRuntimeTask(plan.active_task);
      } catch (err: unknown) {
        if (generation !== runtimePlanGenerationRef.current) return;
        setRuntimeError(
          err instanceof Error ? err.message : "读取运行环境失败",
        );
      }
    },
    [runtimeDialogView],
  );

  const handleRuntimeCompleted = useCallback(() => {
    void loadEngines(true, true);
  }, [loadEngines]);

  const configureEngine = useCallback(
    (view: DomainEngineView) => {
      if (
        view.definition.provider.kind === "driver" ||
        view.definition.source === "mcp"
      ) {
        handleNavigateToMcp();
      } else if (
        view.definition.source === "library" ||
        view.definition.provider.kind === "skill"
      ) {
        handleNavigateToSkills();
      } else {
        handleNavigateToTools("builtin");
      }
    },
    [handleNavigateToMcp, handleNavigateToSkills, handleNavigateToTools],
  );

  return React.createElement(
    "div",
    { className: "ugsci-capability-section", "data-focused": drawerOpen },
    // Action bar
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索领域引擎...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: { target: { value: string } }) => {
          const value = e.target.value;
          setSearchText(value);
          setCollapsedGroups(value.trim() ? {} : { general: true });
        },
        allowClear: true,
        style: { maxWidth: 280 },
      }),
      React.createElement(
        Button,
        {
          icon: ReloadOutlined
            ? React.createElement(ReloadOutlined)
            : undefined,
          onClick: handleRefresh,
          loading,
        },
        "刷新",
      ),
    ),
    // Content
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, {
            size: "large",
            tip: "正在加载领域引擎...",
          }),
        )
      : filteredViews.length === 0
      ? React.createElement(Empty, {
          description: searchText ? "无匹配引擎" : "暂无领域引擎",
        })
      : React.createElement(
          "div",
          null,
          ...groups.map((group) => {
            const collapsed = !!collapsedGroups[group.key];
            return React.createElement(
              "div",
              { key: group.key, style: { marginBottom: 20 } },
              React.createElement(
                Button,
                {
                  type: "text",
                  onClick: () =>
                    setCollapsedGroups((previous) => ({
                      ...previous,
                      [group.key]: !previous[group.key],
                    })),
                  "aria-expanded": !collapsed,
                  style: {
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 8,
                    paddingInline: 0,
                  },
                },
                `${collapsed ? "▸" : "▾"} ${group.title} (${
                  group.views.length
                })`,
              ),
              collapsed
                ? null
                : React.createElement(
                    Row,
                    { gutter: [12, 12], align: "top" },
                    ...group.views.map((view: DomainEngineView) =>
                      React.createElement(
                        Col,
                        {
                          key: view.definition.id,
                          xs: 24,
                          sm: 12,
                          md: 12,
                          lg: 12,
                          style: { display: "flex", minWidth: 0 },
                        },
                        React.createElement(DomainEngineCard, {
                          view,
                          onDetails: () => handleCardClick(view),
                          onInstall: () => void handleRuntimeInstall(view),
                          onConfigure: () => configureEngine(view),
                          onRefresh: () => void loadEngines(true),
                          installTask:
                            view.definition.id === "neqsim"
                              ? neqsimInstallState
                                ? {
                                    id: neqsimInstallState.id,
                                    engine_id: "neqsim",
                                    status: neqsimInstallState.status,
                                    progress: neqsimInstallState.progress,
                                    message: neqsimInstallState.message,
                                    error: neqsimInstallState.error,
                                    warning: neqsimInstallState.warning,
                                  }
                                : null
                              : runtimeDialogView?.definition.id ===
                                view.definition.id
                              ? runtimeTask
                              : null,
                        }),
                      ),
                    ),
                  ),
            );
          }),
        ),
    // Detail drawer
    React.createElement(DomainEngineDetail, {
      view: activeView,
      open: drawerOpen,
      onClose: () => setDrawerOpen(false),
      onNavigateToMcp: handleNavigateToMcp,
      onNavigateToTools: handleNavigateToTools,
      onNavigateToSkills: handleNavigateToSkills,
      onInstallNeqsim: handleInstallNeqsim,
      neqsimInstallState,
    }),
    React.createElement(RuntimeInstallDialog, {
      open: runtimeDialogOpen,
      engineName: runtimeDialogView?.definition.name || "领域引擎",
      plan: runtimePlan,
      task: runtimeTask,
      error: runtimeError,
      onClose: () => {
        runtimePlanGenerationRef.current += 1;
        setRuntimeDialogOpen(false);
      },
      onTaskChange: setRuntimeTask,
      onRetry: refreshRuntimePlan,
      onCompleted: handleRuntimeCompleted,
      onManage: () => {
        runtimePlanGenerationRef.current += 1;
        setRuntimeDialogOpen(false);
        if (runtimeDialogView) configureEngine(runtimeDialogView);
      },
    }),
  );
}
