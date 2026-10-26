import {
  ArrowLeft,
  Expand,
  Blocks,
  Calculator,
  ChartNoAxesCombined,
  FileText,
  Globe2,
  MessageSquarePlus,
  Network,
  X,
} from "lucide-react";
import {
  useCallback,
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  type ForwardedRef,
} from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { setTextareaValue } from "../../pages/Chat/utils";
import type { FilesDrawerEvent, FilesDrawerState, FileTarget } from "./types";
import type { FilesWorkspaceScope } from "./filesWorkspaceScope";
import { filesWorkspaceScopeKey } from "./filesWorkspaceScope";
import {
  WorkbenchAgentPanel,
  WorkbenchBrowserPanel,
  WorkbenchComputePanel,
  WorkbenchGenUiPanel,
  WorkbenchSimulationPanel,
  type WorkbenchMode,
} from "./WorkbenchPanels";
import styles from "./FilesWorkspace.module.less";

const PREVIEW_WIDTH_STORAGE_KEY = "qwenpaw-files-preview-width";
const WORKSPACE_WIDTH_STORAGE_KEY = "qwenpaw-files-workspace-width";
const MIN_DRAWER_WIDTH = 420;
const MIN_CHAT_WIDTH = 420;
const FilesWorkspace = lazy(() => import("./FilesWorkspace"));
const WORKBENCH_MODE_STORAGE_KEY = "qwenpaw-workbench-mode";

function readStoredWidth(key: string): number {
  if (typeof window === "undefined") return 0;
  const stored = Number(localStorage.getItem(key));
  return Number.isFinite(stored) && stored > 0 ? stored : 0;
}

interface FilesDrawerProps {
  state: Exclude<FilesDrawerState, { kind: "closed" }>;
  dispatch: (event: FilesDrawerEvent) => void;
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
  runtimeSessionId?: string;
}

function insertFileReference(path: string): void {
  const textarea = document.querySelector<HTMLTextAreaElement>(
    '[class*="sender"] textarea',
  );
  if (!textarea) return;
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  const reference = `@ ${path}`;
  const prefix = textarea.value.slice(0, start);
  const suffix = textarea.value.slice(end);
  const spacing = prefix && !/\s$/.test(prefix) ? " " : "";
  const next = `${prefix}${spacing}${reference} ${suffix}`;
  setTextareaValue(textarea, next);
  const caret = prefix.length + spacing.length + reference.length + 1;
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(caret, caret);
  });
}

const FilesDrawer = forwardRef<HTMLElement, FilesDrawerProps>(
  function FilesDrawer(props, ref) {
    return (
      <SessionFilesDrawer
        key={filesWorkspaceScopeKey(props.scope)}
        {...props}
        forwardedRef={ref}
      />
    );
  },
);
export default FilesDrawer;

function SessionFilesDrawer({
  state,
  dispatch,
  scope,
  runtimeSessionId,
  forwardedRef,
}: FilesDrawerProps & { forwardedRef: ForwardedRef<HTMLElement> }) {
  const { t } = useTranslation();
  const drawerRef = useRef<HTMLElement>(null);
  useImperativeHandle(forwardedRef, () => drawerRef.current!, []);
  const resizeCleanupRef = useRef<(() => void) | undefined>(undefined);
  const [isResizing, setIsResizing] = useState(false);
  const [mode, setMode] = useState<WorkbenchMode>(() => {
    const stored = localStorage.getItem(WORKBENCH_MODE_STORAGE_KEY);
    return stored === "browser" ||
      stored === "agents" ||
      stored === "genui" ||
      stored === "compute" ||
      stored === "simulation"
      ? stored
      : "files";
  });
  const [genUiTarget, setGenUiTarget] = useState<FileTarget | undefined>();
  const prefersReducedMotion = useReducedMotion();
  const isWorkspace = state.kind === "workspace";
  const [activeFileTarget, setActiveFileTarget] = useState<FileTarget>();
  const target = activeFileTarget ?? state.target;
  const widthStorageKey = isWorkspace
    ? WORKSPACE_WIDTH_STORAGE_KEY
    : PREVIEW_WIDTH_STORAGE_KEY;
  const [width, setWidth] = useState(() => readStoredWidth(widthStorageKey));

  useLayoutEffect(() => {
    setWidth(readStoredWidth(widthStorageKey));
  }, [widthStorageKey]);

  useEffect(() => {
    localStorage.setItem(WORKBENCH_MODE_STORAGE_KEY, mode);
  }, [mode]);

  // Only an explicit open request changes tools. Background file hydration
  // must not steal the browser/compute view the user has just selected.
  useLayoutEffect(() => {
    if (state.kind === "workspace" && state.mode) {
      setMode(state.mode);
    } else if (state.target?.preferredView === "visualization") {
      setGenUiTarget(state.target);
      setMode("genui");
    } else if (state.target) {
      setGenUiTarget(undefined);
      setMode("files");
    }
  }, [state]);

  const close = useCallback(() => {
    const trigger = state.trigger;
    dispatch({ type: "CLOSE" });
    requestAnimationFrame(() => {
      if (trigger?.isConnected) trigger.focus();
    });
  }, [dispatch, state.trigger]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const origin = event.target;
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !event.isComposing &&
        origin instanceof Element &&
        drawerRef.current?.contains(origin) &&
        !origin.closest(
          'input, textarea, [contenteditable="true"], .monaco-editor, [role="dialog"], [role="menu"], [role="listbox"]',
        )
      ) {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  useEffect(() => {
    drawerRef.current?.focus();
    return () => resizeCleanupRef.current?.();
  }, []);

  const resizeFromPointer = (event: React.PointerEvent) => {
    resizeCleanupRef.current?.();
    event.preventDefault();
    setIsResizing(true);
    const startX = event.clientX;
    const initial = drawerRef.current?.getBoundingClientRect().width ?? 0;
    const containerWidth =
      drawerRef.current?.parentElement?.getBoundingClientRect().width ??
      window.innerWidth;
    const maximum = Math.max(MIN_DRAWER_WIDTH, containerWidth - MIN_CHAT_WIDTH);
    const move = (nextEvent: PointerEvent) => {
      const next = Math.min(
        Math.max(MIN_DRAWER_WIDTH, initial + startX - nextEvent.clientX),
        maximum,
      );
      setWidth(next);
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      resizeCleanupRef.current = undefined;
    };
    const up = () => {
      cleanup();
      setIsResizing(false);
      const current = drawerRef.current?.getBoundingClientRect().width;
      if (current) localStorage.setItem(widthStorageKey, String(current));
    };
    resizeCleanupRef.current = cleanup;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const drawerStyle = width > 0 ? { width: `${width}px` } : undefined;
  const filename =
    target?.path.replace(/\\/g, "/").split("/").pop() ?? t("files.title");
  return (
    <motion.aside
      ref={drawerRef}
      className={`${styles.drawer} ${
        isWorkspace ? styles.drawerWorkspace : styles.drawerPreview
      } ${isResizing ? styles.drawerResizing : ""}`}
      style={drawerStyle}
      layout={isResizing || prefersReducedMotion ? false : "size"}
      initial={
        prefersReducedMotion ? false : { opacity: 0, x: 18, scale: 0.995 }
      }
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, x: 14, scale: 0.995 }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              layout: {
                type: "spring",
                stiffness: 360,
                damping: 38,
                mass: 0.82,
              },
              opacity: { duration: 0.2, ease: "easeOut" },
              x: { duration: 0.28, ease: [0.22, 0.78, 0.24, 1] },
              scale: { duration: 0.28, ease: [0.22, 0.78, 0.24, 1] },
            }
      }
      role="region"
      aria-label={t("files.title")}
      tabIndex={-1}
    >
      <div
        className={styles.resizeHandle}
        role="separator"
        aria-orientation="vertical"
        aria-label={t("files.resize")}
        aria-valuenow={Math.round(width)}
        tabIndex={0}
        onPointerDown={resizeFromPointer}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
            return;
          }
          event.preventDefault();
          setWidth((current) => {
            const base = current || 640;
            const containerWidth =
              drawerRef.current?.parentElement?.getBoundingClientRect().width ??
              window.innerWidth;
            const maximum = Math.max(
              MIN_DRAWER_WIDTH,
              containerWidth - MIN_CHAT_WIDTH,
            );
            const next = Math.min(
              Math.max(
                MIN_DRAWER_WIDTH,
                base + (event.key === "ArrowLeft" ? 24 : -24),
              ),
              maximum,
            );
            localStorage.setItem(widthStorageKey, String(next));
            return next;
          });
        }}
      />
      <header className={styles.drawerHeader}>
        <div className={styles.fileMark}>
          <FileText size={17} />
        </div>
        <div className={styles.drawerTitle}>
          <strong>
            {mode === "files"
              ? isWorkspace && !target
                ? t("files.workspace")
                : filename
              : mode === "browser"
              ? "浏览器"
              : mode === "agents"
              ? "智能体进程"
              : mode === "compute"
              ? "计算轨道"
              : mode === "simulation"
              ? "数模监测"
              : "GenUI"}
          </strong>
          {!isWorkspace && <span>{t("files.preview")}</span>}
        </div>
        {mode === "files" && isWorkspace && target && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => dispatch({ type: "COLLAPSE_TO_PREVIEW", target })}
          >
            <ArrowLeft size={15} />
            {t("files.backToPreview")}
          </button>
        )}
        <button
          type="button"
          className={styles.iconButton}
          aria-label={t("common.close")}
          onClick={close}
        >
          <X size={17} />
        </button>
      </header>

      <div className={styles.workspace}>
        <nav className={styles.activityRail} aria-label="工作台活动">
          {(
            [
              ["files", FileText, "文件与预览"],
              ["browser", Globe2, "浏览器"],
              ["agents", Network, "智能体进程"],
              ["genui", Blocks, "GenUI"],
              ["compute", Calculator, "计算轨道"],
              ["simulation", ChartNoAxesCombined, "数模监测"],
            ] as const
          ).map(([nextMode, Icon, label]) => (
            <button
              key={nextMode}
              type="button"
              className={mode === nextMode ? styles.activityActive : undefined}
              aria-label={label}
              aria-pressed={mode === nextMode}
              onClick={() => setMode(nextMode)}
            >
              <Icon size={17} />
            </button>
          ))}
        </nav>

        {mode === "browser" && <WorkbenchBrowserPanel active />}
        {mode === "agents" && (
          <WorkbenchAgentPanel
            scope={scope}
            runtimeSessionId={runtimeSessionId}
          />
        )}
        {mode === "genui" && (
          <WorkbenchGenUiPanel
            target={genUiTarget}
            scope={scope}
            onClearTarget={() => setGenUiTarget(undefined)}
            onOpenFiles={() => setMode("files")}
          />
        )}
        {mode === "compute" && <WorkbenchComputePanel />}
        {mode === "simulation" && (
          <WorkbenchSimulationPanel
            runId={state.kind === "workspace" ? state.simulationRunId : undefined}
            scope={scope}
          />
        )}

        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key="files-workspace"
            className={styles.drawerContent}
            style={mode === "files" ? undefined : { display: "none" }}
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, x: isWorkspace ? -10 : 10 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: isWorkspace ? 8 : -8 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: [0.22, 0.78, 0.24, 1] }
            }
          >
            <Suspense
              fallback={
                <div className={styles.empty}>{t("common.loading")}</div>
              }
            >
              <FilesWorkspace
                initialTarget={state.target}
                scope={scope}
                hideNavigator={!isWorkspace}
                onActiveTargetChange={setActiveFileTarget}
              />
            </Suspense>
            {!isWorkspace && (
              <>
                <footer className={styles.drawerFooter}>
                  {target && (
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => {
                        insertFileReference(target.path);
                      }}
                    >
                      <MessageSquarePlus size={15} />
                      {t("files.mentionInChat")}
                    </button>
                  )}
                  {target && (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => dispatch({ type: "EXPAND_WORKSPACE" })}
                    >
                      <Expand size={15} />
                      {t("files.expandWorkspace")}
                    </button>
                  )}
                </footer>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
