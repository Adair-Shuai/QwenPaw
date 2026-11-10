import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  Blocks,
  Calculator,
  ChartNoAxesCombined,
  FileText,
  Globe2,
  Network,
  ListChecks,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import { SlotErrorBoundary } from "../../plugins/registry/Slot";
import type { FilesWorkspaceScope } from "./filesWorkspaceScope";
import type {
  FilesDrawerState,
  FileTarget,
  WorkbenchMode,
  WorkbenchBrowserFile,
} from "./types";
import {
  WorkbenchAgentPanel,
  WorkbenchBrowserPanel,
  WorkbenchComputePanel,
  WorkbenchGenUiPanel,
  WorkbenchSimulationPanel,
} from "./WorkbenchPanels";
import styles from "./FilesWorkspace.module.less";
import type { BrowserSession } from "./workbenchTabsStore";
import type { InteractionRequest } from "../user-input/types";
import { InteractionPanel } from "../user-input/InteractionPanel";

const TerminalWorkbenchPanel = lazy(
  () => import("../terminal/TerminalWorkbenchPanel"),
);

function WorkbenchTerminalPanel(context: WorkbenchPanelContext) {
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={<div className={styles.empty}>{t("common.loading")}</div>}
    >
      <TerminalWorkbenchPanel {...context} />
    </Suspense>
  );
}

/** Extensions receive the native session scope; they do not own file tabs. */
export interface WorkbenchPanelContext {
  browserStartContent?: ReactNode;
  browserSession?: BrowserSession;
  onBrowserSessionChange?: (session: BrowserSession) => void;
  onRequestsChange?: (requests: InteractionRequest[]) => void;
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
  runtimeSessionId?: string;
  target?: FileTarget;
  simulationRunId?: string;
  interactionRequestId?: string;
  browserFile?: WorkbenchBrowserFile;
  active: boolean;
  onOpenFiles: () => void;
  onClose?: () => void;
  onClearTarget: () => void;
}

interface WorkbenchPanelDefinition {
  id: Exclude<WorkbenchMode, "files">;
  label: string;
  icon: LucideIcon;
  component: ComponentType<WorkbenchPanelContext>;
  /** Only passive UI is retained. Polling/GPU panels dispose when hidden. */
  retainWhenHidden?: boolean;
}

// One integration boundary for fork panels. Existing plugin Slot/global APIs
// remain inside their adapters; adding a panel does not change the file shell.
const panels: readonly WorkbenchPanelDefinition[] = [
  {
    id: "interactions",
    label: "任务交互",
    icon: ListChecks,
    component: InteractionPanel,
  },
  {
    id: "browser",
    label: "浏览器",
    icon: Globe2,
    component: WorkbenchBrowserPanel,
    retainWhenHidden: true,
  },
  {
    id: "terminal",
    label: "终端",
    icon: SquareTerminal,
    component: WorkbenchTerminalPanel,
    retainWhenHidden: true,
  },
  {
    id: "agents",
    label: "智能体进程",
    icon: Network,
    component: WorkbenchAgentPanel,
  },
  { id: "genui", label: "GenUI", icon: Blocks, component: WorkbenchGenUiPanel },
  {
    id: "compute",
    label: "计算轨道",
    icon: Calculator,
    component: WorkbenchComputePanel,
  },
  {
    id: "simulation",
    label: "数模监测",
    icon: ChartNoAxesCombined,
    component: ({ simulationRunId, scope }) => (
      <WorkbenchSimulationPanel runId={simulationRunId} scope={scope} />
    ),
  },
];
const activities = [
  { id: "files" as const, label: "文件与预览", icon: FileText },
  ...panels,
];
const shortLabels: Record<WorkbenchMode, string> = {
  files: "文件",
  interactions: "交互",
  browser: "浏览器",
  terminal: "终端",
  agents: "智能体",
  genui: "GenUI",
  compute: "计算",
  simulation: "数模",
};
const MODE_STORAGE_KEY = "qwenpaw-workbench-mode";

export function useWorkbenchSelection(
  state: Exclude<FilesDrawerState, { kind: "closed" }>,
) {
  const [mode, setMode] = useState<WorkbenchMode>(() => {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    return activities.find((item) => item.id === saved)?.id ?? "files";
  });
  const [genUiTarget, setGenUiTarget] = useState<FileTarget>();
  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);
  // Hydrating tabs must never steal focus from an explicitly selected tool.
  useLayoutEffect(() => {
    if (state.kind === "workspace" && state.mode) {
      setMode(activities.find((item) => item.id === state.mode)?.id ?? "files");
    } else if (state.target?.preferredView === "visualization") {
      setGenUiTarget(state.target);
      setMode("genui");
    } else if (state.target) {
      setGenUiTarget(undefined);
      setMode("files");
    }
  }, [state]);
  return {
    mode,
    setMode,
    genUiTarget,
    clearGenUiTarget: () => setGenUiTarget(undefined),
  };
}

export function WorkbenchTitle({ mode }: { mode: WorkbenchMode }) {
  const { t } = useTranslation();
  const item = activities.find((item) => item.id === mode) ?? activities[0];
  return <>{t(`workbench.activity.${mode}`, item.label)}</>;
}

export function WorkbenchIcon({ mode }: { mode: WorkbenchMode }) {
  const Icon = (activities.find((item) => item.id === mode) ?? activities[0])
    .icon;
  return <Icon size={17} aria-hidden="true" />;
}

export function WorkbenchNavigation({
  mode,
  indicators,
  onSelect,
}: {
  mode?: WorkbenchMode;
  indicators?: Partial<Record<WorkbenchMode, number>>;
  onSelect: (mode: WorkbenchMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <nav
      className={styles.workbenchRail}
      aria-label={t("workbench.activities", "工作台活动")}
    >
      {activities.map(({ id, label, icon: Icon }) => (
        <Tooltip
          key={id}
          title={t(`workbench.activity.${id}`, label)}
          placement="right"
        >
          <button
            type="button"
            className={mode === id ? styles.activityActive : undefined}
            aria-label={t(`workbench.activity.${id}`, label)}
            title={t(`workbench.activity.${id}`, label)}
            aria-pressed={mode === id}
            onClick={() => onSelect(id)}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{t(`workbench.activityShort.${id}`, shortLabels[id])}</span>
            {!!indicators?.[id] && (
              <i
                className={styles.activityBadge}
                aria-label={String(indicators[id])}
              >
                {indicators[id]}
              </i>
            )}
          </button>
        </Tooltip>
      ))}
    </nav>
  );
}

export function WorkbenchExtensionPanels({
  mode,
  ...context
}: Omit<WorkbenchPanelContext, "active"> & { mode: WorkbenchMode }) {
  const { t } = useTranslation();
  const [visited, setVisited] = useState<WorkbenchMode[]>([mode]);
  useEffect(() => {
    setVisited((current) =>
      current.includes(mode) ? current : [...current, mode],
    );
  }, [mode]);
  return (
    <>
      {panels.map(({ id, component: Panel, retainWhenHidden }) => {
        const active = mode === id;
        if (!active && !(retainWhenHidden && visited.includes(id))) return null;
        return (
          <div
            key={id}
            className={styles.drawerContent}
            hidden={!active}
            style={active ? undefined : { display: "none" }}
          >
            <SlotErrorBoundary
              slot={`chat.workbench.${id}`}
              pluginId="workbench"
              fallback={
                <div role="alert" className={styles.empty}>
                  {t(
                    "workbench.panelFailed",
                    "此面板加载失败，请切换到文件或重新打开工作区。",
                  )}
                </div>
              }
            >
              <Panel {...context} active={active} />
            </SlotErrorBoundary>
          </div>
        );
      })}
    </>
  );
}

/** Each content tab owns its passive UI. Active resource views release on hide. */
export function WorkbenchContentPanel({
  mode,
  ...context
}: WorkbenchPanelContext & { mode: Exclude<WorkbenchMode, "files"> }) {
  const panel = panels.find((item) => item.id === mode);
  if (!panel || (!context.active && !panel.retainWhenHidden)) return null;
  const Panel = panel.component;
  return (
    <SlotErrorBoundary slot={`chat.workbench.${mode}`} pluginId="workbench">
      <Panel {...context} />
    </SlotErrorBoundary>
  );
}
