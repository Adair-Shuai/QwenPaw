import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Alert, Button, Modal } from "antd";
import { ArrowUpRight, ListChecks, Network } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useCodingTabsStore,
  useTabsForScope,
  useDiffsForScope,
  useActiveTabPathForScope,
} from "../../stores/codingTabsStore";
import {
  selectTasksForSession,
  useBackgroundTasksStore,
} from "../../stores/backgroundTasksStore";
import { useTerminalSurfaceStore } from "../../stores/terminalSurfaceStore";
import BackgroundTaskPanel from "../../pages/Chat/components/BackgroundTaskPanel";
import { listenForProjectDirectoryChanges } from "../project-directory/projectDirectoryChangeEvent";
import { isProjectRoot } from "./directorySources";
import { interactionApi } from "../user-input/api";
import { useInteractionRuntime } from "../user-input/runtime";
import type { InteractionRequest } from "../user-input/types";
import {
  filesWorkspaceScopeKey,
  type FilesWorkspaceScope,
} from "./filesWorkspaceScope";
import { fileTabPath, fileTabTarget } from "./fileIdentity";
import type { FilesDrawerState, FileTarget, WorkbenchMode } from "./types";
import type { FilesWorkspaceController } from "./FilesWorkspace";
import {
  WorkbenchContentPanel,
  WorkbenchNavigation,
} from "./WorkbenchExtensions";
import WorkbenchTabBar from "./WorkbenchTabBar";
import WorkbenchStartPage from "./WorkbenchStartPage";
import {
  EMPTY_WORKBENCH,
  useWorkbenchTabsStore,
  type WorkbenchTab,
  type BrowserSession,
} from "./workbenchTabsStore";
import styles from "./WorkbenchTabs.module.less";
import workspaceStyles from "./FilesWorkspace.module.less";

const FilesWorkspace = lazy(() => import("./FilesWorkspace"));
const fileId = (path: string) => `file:${path}`;
const basename = (path: string) =>
  path.replace(/\\/g, "/").split("/").pop() || path;
const EMPTY_BROWSER: BrowserSession = { pages: [], index: -1, input: "" };

function ToolTab({
  tab,
  active,
  scope,
  runtimeSessionId,
  onOpenFiles,
  onClose,
  onRequestsChange,
  browserStartContent,
}: {
  tab: WorkbenchTab;
  active: boolean;
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
  runtimeSessionId?: string;
  onOpenFiles: () => void;
  onClose: () => void;
  onRequestsChange: (requests: InteractionRequest[]) => void;
  browserStartContent: ReactNode;
}) {
  const scopeKey = filesWorkspaceScopeKey(scope);
  const browserChanged = useCallback(
    (browser: BrowserSession) => {
      const page = browser.pages[browser.index];
      const title =
        page?.kind === "url" ? new URL(page.url).hostname : tab.title;
      useWorkbenchTabsStore
        .getState()
        .update(scopeKey, tab.id, { browser, title });
    },
    [scopeKey, tab.id, tab.title],
  );
  const clearTarget = useCallback(() => {
    useWorkbenchTabsStore
      .getState()
      .update(scopeKey, tab.id, { target: undefined, title: "GenUI" });
  }, [scopeKey, tab.id]);
  if (tab.kind === "files" || tab.kind === "graph") return null;
  if (tab.taskId)
    return active ? (
      <BackgroundTaskPanel
        sessionId={runtimeSessionId ?? scope.sessionId}
        selectedTaskId={tab.taskId}
        defaultCollapsed={false}
        listMaxHeight="none"
        showFinished
      />
    ) : null;
  return (
    <WorkbenchContentPanel
      key={tab.browserRevision ?? 0}
      mode={tab.kind}
      active={active}
      scope={scope}
      runtimeSessionId={runtimeSessionId}
      simulationRunId={tab.runId}
      interactionRequestId={tab.requestId}
      target={tab.target}
      browserStartContent={browserStartContent}
      browserSession={tab.browser ?? EMPTY_BROWSER}
      onBrowserSessionChange={browserChanged}
      onRequestsChange={onRequestsChange}
      onClearTarget={clearTarget}
      onOpenFiles={onOpenFiles}
      onClose={onClose}
    />
  );
}

export default function WorkbenchContent({
  state,
  scope,
  runtimeSessionId,
  panelActions,
  footerActions,
  onActiveTargetChange,
  onBrowseMemoryTag,
}: {
  state: Exclude<FilesDrawerState, { kind: "closed" }>;
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
  runtimeSessionId?: string;
  panelActions: ReactNode;
  footerActions: ReactNode;
  onActiveTargetChange: (target: FileTarget | undefined) => void;
  onBrowseMemoryTag: () => void;
}) {
  const { t } = useTranslation();
  const scopeKey = filesWorkspaceScopeKey(scope);
  const idPrefix = `workbench-${encodeURIComponent(scopeKey)}`;
  const model = useWorkbenchTabsStore(
    (store) => store.scopes[scopeKey] ?? EMPTY_WORKBENCH,
  );
  const nativeTabs = useTabsForScope(scopeKey);
  const nativeDiffs = useDiffsForScope(scopeKey);
  const nativeActive = useActiveTabPathForScope(scopeKey);
  const activeTab = model.tabs.find((tab) => tab.id === model.activeId);
  const activeRef = useRef(activeTab);
  activeRef.current = activeTab;
  const controller = useRef<FilesWorkspaceController | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const [browsing, setBrowsing] = useState(false);
  const [requestedFile, setRequestedFile] = useState<FileTarget | undefined>(
    state.target?.preferredView === "visualization" ? undefined : state.target,
  );
  const browsingRef = useRef(browsing);
  browsingRef.current = browsing;
  const [requests, setRequests] = useState<InteractionRequest[]>([]);
  const [closing, setClosing] = useState<WorkbenchTab[]>([]);
  const [saving, setSaving] = useState(false);
  const [closeError, setCloseError] = useState("");
  const closingRef = useRef(false);
  const allTasks = useBackgroundTasksStore((store) => store.tasks);
  const tasks = useMemo(
    () =>
      selectTasksForSession(
        allTasks,
        runtimeSessionId ?? scope.sessionId,
      ).filter((task) => task.status === "running"),
    [allTasks, runtimeSessionId, scope.sessionId],
  );
  const pending = requests.filter((request) => request.status === "pending");
  const runtime = useInteractionRuntime();

  const nativeReferences = useMemo(
    () =>
      nativeTabs.map(
        (tab): WorkbenchTab => ({
          id: fileId(tab.path),
          kind: "files",
          filePath: tab.path,
          title: basename(tab.displayPath ?? tab.path),
          target: fileTabTarget(tab),
        }),
      ),
    [nativeTabs],
  );
  useLayoutEffect(() => {
    useWorkbenchTabsStore
      .getState()
      .syncFiles(scopeKey, nativeReferences, nativeActive);
  }, [scopeKey, nativeReferences, nativeActive]);

  useEffect(
    () =>
      listenForProjectDirectoryChanges((changedScopeKey, options) => {
        if (changedScopeKey !== scopeKey || options.preserveTabs) return;
        useWorkbenchTabsStore.getState().clearProjectTabs(scopeKey);
        setRequestedFile((target) =>
          target?.source === "workspace" && isProjectRoot(target.root)
            ? undefined
            : target,
        );
      }),
    [scopeKey],
  );

  const select = useCallback(
    (tab: WorkbenchTab) => {
      if (tab.kind === "terminal")
        useTerminalSurfaceStore.getState().setSessionOpen(scopeKey, false);
      useWorkbenchTabsStore.getState().select(scopeKey, tab.id);
      setBrowsing(false);
      if (tab.kind === "files" && tab.filePath)
        controller.current?.select(tab.filePath);
      if (tab.kind === "graph")
        controller.current?.showGraph(tab.graphRoot ?? null);
    },
    [scopeKey],
  );
  const openFiles = useCallback(() => {
    const store = useWorkbenchTabsStore.getState();
    const files =
      store.scopes[scopeKey]?.tabs.filter(
        (tab) => tab.kind === "files" || tab.kind === "graph",
      ) ?? [];
    const file =
      files.find(
        (tab) =>
          tab.filePath ===
          useCodingTabsStore.getState().activeTabByAgent[scopeKey],
      ) ?? files[files.length - 1];
    if (file) select(file);
    else setBrowsing(true);
    controller.current?.showFiles();
  }, [scopeKey, select]);
  const openTool = useCallback(
    (
      kind: WorkbenchMode,
      fresh = false,
      details: Partial<WorkbenchTab> = {},
    ) => {
      if (kind === "terminal")
        useTerminalSurfaceStore.getState().setSessionOpen(scopeKey, false);
      if (kind === "files") {
        openFiles();
        return;
      }
      const store = useWorkbenchTabsStore.getState();
      const existing = store.scopes[scopeKey]?.tabs.find(
        (tab) => tab.kind === kind,
      );
      if (kind === "interactions" && details.requestId) {
        const matching = store.scopes[scopeKey]?.tabs.find(
          (tab) => tab.kind === kind && tab.requestId === details.requestId,
        );
        if (matching) {
          select(matching);
          return;
        }
        const inbox = store.scopes[scopeKey]?.tabs.find(
          (tab) => tab.kind === kind && !tab.requestId,
        );
        if (inbox) {
          store.open(scopeKey, {
            ...inbox,
            ...details,
            title: details.title ?? inbox.title,
          });
          setBrowsing(false);
          return;
        }
      }
      if (
        !fresh &&
        !details.requestId &&
        !details.runId &&
        !details.target &&
        !details.taskId &&
        existing
      ) {
        select(existing);
        return;
      }
      const identity =
        details.requestId ??
        details.runId ??
        details.taskId ??
        (details.target ? fileTabPath(details.target) : "default");
      const id =
        kind === "browser"
          ? `browser:${crypto.randomUUID()}`
          : `${kind}:${identity}`;
      const title =
        details.title ??
        (details.target
          ? basename(details.target.path)
          : details.runId
          ? `${t(`workbench.activity.${kind}`)} · ${details.runId}`
          : t(
              kind === "browser"
                ? "workbench.tabs.newTab"
                : `workbench.activity.${kind}`,
            ));
      store.open(scopeKey, {
        id,
        kind,
        title,
        ...details,
        ...(kind === "browser" ? { browser: EMPTY_BROWSER } : {}),
      });
      setBrowsing(false);
    },
    [scopeKey, openFiles, select, t],
  );

  const lastNavigation = useRef<FilesDrawerState>();
  // Only explicit navigation changes focus. Hydration and background updates do not.
  useLayoutEffect(() => {
    if (lastNavigation.current === state) return;
    lastNavigation.current = state;
    setRequestedFile(
      state.target?.preferredView === "visualization"
        ? undefined
        : state.target,
    );
    if (state.kind === "workspace" && state.mode && state.mode !== "files") {
      openTool(state.mode, false, {
        requestId: state.interactionRequestId,
        runId: state.simulationRunId,
      });
    } else if (state.target?.preferredView === "visualization") {
      openTool("genui", false, { target: state.target });
    } else if (
      state.target ||
      (state.kind === "workspace" && state.mode === "files")
    ) {
      openFiles();
    }
  }, [state, openFiles, openTool]);

  const fileActivated = useCallback(
    (path: string) => {
      if (closingRef.current) return;
      const tab = useCodingTabsStore
        .getState()
        .tabsByAgent[scopeKey]?.find((item) => item.path === path);
      if (!tab) return;
      const current = activeRef.current;
      const focus =
        browsingRef.current ||
        !current ||
        current.kind === "files" ||
        current.kind === "graph";
      useWorkbenchTabsStore.getState().open(
        scopeKey,
        {
          id: fileId(path),
          kind: "files",
          filePath: path,
          title: basename(tab.displayPath ?? path),
          target: fileTabTarget(tab),
        },
        focus,
      );
      if (focus) setBrowsing(false);
    },
    [scopeKey],
  );
  const controllerReady = useCallback(
    (value: FilesWorkspaceController | null) => {
      controller.current = value;
      const tab = activeRef.current;
      if (
        value &&
        tab?.kind === "files" &&
        tab.filePath &&
        useCodingTabsStore.getState().activeTabByAgent[scopeKey] !==
          tab.filePath
      )
        value.select(tab.filePath);
      if (value && tab?.kind === "graph")
        value.showGraph(tab.graphRoot ?? null);
    },
    [scopeKey],
  );
  const openBrowserFile = useCallback(
    (path: string) => {
      const file = useCodingTabsStore
        .getState()
        .tabsByAgent[scopeKey]?.find((tab) => tab.path === path);
      const current = activeRef.current;
      useWorkbenchTabsStore.getState().open(
        scopeKey,
        {
          id: `browser:file:${path}`,
          kind: "browser",
          title: basename(file?.displayPath ?? path),
          browser: {
            pages: [{ kind: "file", tabPath: path }],
            index: 0,
            input: file?.displayPath ?? path,
          },
        },
        !current ||
          current.kind === "files" ||
          current.kind === "browser" ||
          browsingRef.current,
      );
    },
    [scopeKey],
  );
  useEffect(() => {
    if (!activeTab) return;
    if (
      activeTab.kind === "files" &&
      activeTab.filePath &&
      nativeActive !== activeTab.filePath
    )
      controller.current?.select(activeTab.filePath);
  }, [activeTab, nativeActive]);

  useEffect(() => {
    const store = useWorkbenchTabsStore.getState();
    for (const tab of store.scopes[scopeKey]?.tabs ?? []) {
      const request = requests.find((item) => item.id === tab.requestId);
      if (tab.kind === "interactions" && request && request.title !== tab.title)
        store.update(scopeKey, tab.id, { title: request.title });
    }
  }, [requests, scopeKey]);

  const interactionActive = activeTab?.kind === "interactions" && !browsing;
  useEffect(() => {
    if (!runtimeSessionId || !runtime?.InteractionForm || interactionActive)
      return;
    const abort = new AbortController();
    let loading = false;
    const refresh = async () => {
      if (loading) return;
      loading = true;
      try {
        const response = await interactionApi.list(
          { agentId: scope.agentId, sessionId: runtimeSessionId },
          abort.signal,
        );
        if (!abort.signal.aborted)
          setRequests(
            response.requests.filter(
              (item) =>
                item.agent_id === scope.agentId &&
                item.session_id === runtimeSessionId,
            ),
          );
      } catch {
        /* The panel displays actionable API errors when opened. */
      } finally {
        loading = false;
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 10000);
    return () => {
      abort.abort();
      window.clearInterval(timer);
    };
  }, [
    scope.agentId,
    runtimeSessionId,
    runtime?.InteractionForm,
    interactionActive,
  ]);
  useEffect(() => {
    setRequests([]);
  }, [scope.agentId, runtimeSessionId]);

  const finishClose = (tabs: WorkbenchTab[]) => {
    closingRef.current = true;
    for (const tab of tabs) {
      if (tab.kind === "files" && tab.filePath) {
        if (controller.current) controller.current.close(tab.filePath);
        else {
          const native = useCodingTabsStore.getState();
          native.closeTab(scopeKey, tab.filePath);
          if (native.activeTabByAgent[scopeKey] === tab.filePath)
            native.setActiveTab(
              scopeKey,
              useCodingTabsStore.getState().tabsByAgent[scopeKey]?.[0]?.path ??
                "",
            );
        }
      }
      if (tab.kind === "graph" && tab.id === activeRef.current?.id)
        controller.current?.showGraph(null);
    }
    const native = useCodingTabsStore.getState();
    const remaining = native.tabsByAgent[scopeKey] ?? [];
    if (
      native.activeTabByAgent[scopeKey] &&
      !remaining.some((tab) => tab.path === native.activeTabByAgent[scopeKey])
    )
      native.setActiveTab(scopeKey, remaining[0]?.path ?? "");
    useWorkbenchTabsStore.getState().close(
      scopeKey,
      tabs.map((tab) => tab.id),
    );
    closingRef.current = false;
    setRequestedFile(undefined);
    setBrowsing(false);
    setClosing([]);
    setCloseError("");
  };
  const requestClose = (tabs: WorkbenchTab[]) => {
    const live = useCodingTabsStore.getState().tabsByAgent[scopeKey] ?? [];
    if (
      tabs.some((tab) =>
        live.some((file) => file.path === tab.filePath && file.dirty),
      )
    ) {
      setClosing(tabs);
      setCloseError("");
    } else finishClose(tabs);
  };
  const saveAndClose = async () => {
    if (saving) return;
    setSaving(true);
    setCloseError("");
    try {
      for (const tab of closing) {
        const file = useCodingTabsStore
          .getState()
          .tabsByAgent[scopeKey]?.find((item) => item.path === tab.filePath);
        if (file?.dirty) {
          if (!controller.current) throw new Error(t("files.loadFailed"));
          await controller.current.save(file.path);
        }
      }
      if (!alive.current) return;
      if (
        closing.some(
          (tab) =>
            useCodingTabsStore
              .getState()
              .tabsByAgent[scopeKey]?.some(
                (file) => file.path === tab.filePath && file.dirty,
              ),
        )
      )
        throw new Error(
          t(
            "workbench.tabs.changedDuringSave",
            "内容已变化，请检查后再次关闭。",
          ),
        );
      finishClose(closing);
    } catch (error) {
      if (alive.current)
        setCloseError(error instanceof Error ? error.message : String(error));
    } finally {
      if (alive.current) setSaving(false);
    }
  };
  const reopen = (tab: WorkbenchTab) => {
    if (tab.kind === "files" && tab.target) {
      setBrowsing(true);
      setRequestedFile({ ...tab.target });
    } else {
      useWorkbenchTabsStore.getState().open(scopeKey, tab);
      select(tab);
    }
  };
  const hasBackground = pending.length + tasks.length > 0;
  const background = hasBackground ? (
    <div className={styles.emptyRows}>
      {pending.map((request) => (
        <button
          type="button"
          key={request.id}
          className={styles.emptyRow}
          onClick={() =>
            openTool("interactions", false, {
              requestId: request.id,
              title: request.title,
            })
          }
        >
          <ListChecks size={17} />
          <span>
            <strong>{request.title}</strong>
            <small>{t("workbench.empty.pending", "待填写")}</small>
          </span>
          <ArrowUpRight size={15} />
        </button>
      ))}
      {tasks.map((task) => (
        <button
          type="button"
          key={task.toolCallId}
          className={styles.emptyRow}
          onClick={() =>
            openTool("agents", false, {
              taskId: task.toolCallId,
              title: task.taskSummary || task.toolName,
            })
          }
        >
          <Network size={17} />
          <span>
            <strong>{task.taskSummary || task.toolName}</strong>
            <small>{t("workbench.empty.running", "运行中")}</small>
          </span>
          <ArrowUpRight size={15} />
        </button>
      ))}
    </div>
  ) : undefined;
  const launch = (kind: WorkbenchMode) => openTool(kind, kind === "browser");
  const startContent = (
    <WorkbenchStartPage
      recent={model.recent}
      onOpen={launch}
      onReopen={reopen}
      background={background}
    />
  );
  const empty = (
    <WorkbenchStartPage
      empty
      recent={model.recent}
      onOpen={launch}
      onReopen={reopen}
      background={background}
    />
  );
  const filesVisible =
    browsing || activeTab?.kind === "files" || activeTab?.kind === "graph";

  return (
    <>
      <WorkbenchTabBar
        idPrefix={idPrefix}
        tabs={model.tabs}
        activeId={browsing ? "" : model.activeId}
        changedPaths={new Set(Object.keys(nativeDiffs))}
        dirtyPaths={
          new Set(nativeTabs.filter((tab) => tab.dirty).map((tab) => tab.path))
        }
        onSelect={select}
        onClose={(tab) => requestClose([tab])}
        onCloseOthers={(tab) =>
          requestClose(model.tabs.filter((item) => item.id !== tab.id))
        }
        onCloseAll={() => requestClose(model.tabs)}
        onNew={() => openTool("browser", true)}
        actions={panelActions}
      />
      <div className={workspaceStyles.workspace}>
        <WorkbenchNavigation
          mode={
            browsing
              ? "files"
              : activeTab?.kind === "graph"
              ? "files"
              : activeTab?.kind
          }
          onSelect={(kind) => openTool(kind)}
          indicators={{ interactions: pending.length, agents: tasks.length }}
        />
        <div className={styles.content}>
          <div
            className={styles.panel}
            hidden={!filesVisible}
            role="tabpanel"
            id={`${idPrefix}-files`}
            aria-labelledby={
              activeTab?.kind === "files" || activeTab?.kind === "graph"
                ? `${idPrefix}-tab-${encodeURIComponent(activeTab.id)}`
                : undefined
            }
          >
            <Suspense
              fallback={
                <div className={workspaceStyles.empty}>
                  {t("common.loading")}
                </div>
              }
            >
              <FilesWorkspace
                controllerRef={controllerReady}
                unifiedTabs
                emptyContent={empty}
                initialTarget={requestedFile}
                scope={scope}
                active={filesVisible}
                hideNavigator={state.kind !== "workspace" && !browsing}
                onActiveTargetChange={onActiveTargetChange}
                onFileActivated={fileActivated}
                onGraphSelect={(root) => {
                  useWorkbenchTabsStore.getState().open(scopeKey, {
                    id: `graph:${root}`,
                    kind: "graph",
                    graphRoot: root,
                    title: t("workbench.tabs.memoryGraph", "记忆图谱"),
                  });
                  setBrowsing(false);
                }}
                onOpenBrowser={openBrowserFile}
                onBrowseMemoryTag={onBrowseMemoryTag}
                footerActions={footerActions}
              />
            </Suspense>
          </div>
          {!filesVisible && !activeTab && empty}
          {model.tabs
            .filter((tab) => tab.kind !== "files" && tab.kind !== "graph")
            .map((tab) => (
              <div
                key={tab.id}
                className={styles.panel}
                role="tabpanel"
                id={`${idPrefix}-panel-${encodeURIComponent(tab.id)}`}
                aria-labelledby={`${idPrefix}-tab-${encodeURIComponent(
                  tab.id,
                )}`}
                hidden={browsing || tab.id !== model.activeId}
              >
                <ToolTab
                  tab={tab}
                  active={!browsing && tab.id === model.activeId}
                  scope={scope}
                  runtimeSessionId={runtimeSessionId}
                  onOpenFiles={openFiles}
                  onClose={() => requestClose([tab])}
                  browserStartContent={startContent}
                  onRequestsChange={setRequests}
                />
              </div>
            ))}
          {!filesVisible && !activeTab && state.kind === "preview" && (
            <footer className={workspaceStyles.documentFooter}>
              {footerActions}
            </footer>
          )}
        </div>
      </div>
      <Modal
        open={!!closing.length}
        title={t("workbench.tabs.unsavedTitle", "保存更改后关闭？")}
        onCancel={() => {
          if (!saving) setClosing([]);
        }}
        closable={!saving}
        maskClosable={!saving}
        footer={
          <>
            <Button disabled={saving} onClick={() => setClosing([])}>
              {t("common.cancel", "取消")}
            </Button>
            <Button disabled={saving} onClick={() => finishClose(closing)}>
              {t("workbench.tabs.discard", "放弃更改并关闭")}
            </Button>
            <Button
              type="primary"
              loading={saving}
              onClick={() => void saveAndClose()}
            >
              {t("workbench.tabs.saveClose", "保存并关闭")}
            </Button>
          </>
        }
      >
        <p>{t("workbench.tabs.unsavedHint", "以下文件包含未保存的更改。")}</p>
        <ul>
          {closing
            .filter((tab) =>
              nativeTabs.some(
                (file) => file.path === tab.filePath && file.dirty,
              ),
            )
            .map((tab) => (
              <li key={tab.id}>{tab.title}</li>
            ))}
        </ul>
        {closeError && <Alert type="error" message={closeError} showIcon />}
      </Modal>
    </>
  );
}
