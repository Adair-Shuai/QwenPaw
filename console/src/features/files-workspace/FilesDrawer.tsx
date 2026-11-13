import { ArrowLeft, PanelRight, MessageSquarePlus, X } from "lucide-react";
import { Tooltip } from "antd";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  type ForwardedRef,
} from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import { setTextareaValue } from "../../pages/Chat/utils";
import type { FilesDrawerEvent, FilesDrawerState, FileTarget } from "./types";
import type { FilesWorkspaceScope } from "./filesWorkspaceScope";
import { filesWorkspaceScopeKey } from "./filesWorkspaceScope";
import WorkbenchContent from "./WorkbenchContent";
import { EMPTY_WORKBENCH, useWorkbenchTabsStore } from "./workbenchTabsStore";
import styles from "./FilesWorkspace.module.less";
import { useTheme } from "../../contexts/ThemeContext";

const PREVIEW_WIDTH_STORAGE_KEY = "qwenpaw-files-preview-width";
const WORKSPACE_WIDTH_STORAGE_KEY = "qwenpaw-files-workspace-width";
const MIN_DRAWER_WIDTH = 420;
const MIN_CHAT_WIDTH = 420;

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
  const [maximized, setMaximized] = useState(false);
  const content = useWorkbenchTabsStore(
    (store) => store.scopes[filesWorkspaceScopeKey(scope)] ?? EMPTY_WORKBENCH,
  );
  const selected = content.tabs.find((tab) => tab.id === content.activeId);
  const mode = selected?.kind === "graph" ? "files" : selected?.kind ?? "files";
  const prefersReducedMotion = useReducedMotion();
  const isWorkspace = state.kind === "workspace";
  const [activeFileTarget, setActiveFileTarget] = useState<
    FileTarget | undefined
  >(state.target);
  // An explicit empty selection must not fall back to an already closed file.
  const target = activeFileTarget;
  const { pageStyle = "classic" } = useTheme();
  const baseWidthStorageKey = isWorkspace
    ? WORKSPACE_WIDTH_STORAGE_KEY
    : PREVIEW_WIDTH_STORAGE_KEY;
  const widthStorageKey =
    pageStyle === "classic"
      ? baseWidthStorageKey
      : `${baseWidthStorageKey}:${pageStyle}`;
  const [width, setWidth] = useState(() => readStoredWidth(widthStorageKey));

  useLayoutEffect(() => {
    setWidth(readStoredWidth(widthStorageKey));
  }, [widthStorageKey]);

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
  const panelActions = (
    <>
      {mode === "files" && isWorkspace && target && (
        <Tooltip title={t("files.backToPreview")}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={t("files.backToPreview")}
            onClick={() => dispatch({ type: "COLLAPSE_TO_PREVIEW", target })}
          >
            <ArrowLeft size={16} />
          </button>
        </Tooltip>
      )}
      <Tooltip
        title={t(
          maximized ? "files.restoreWorkspace" : "files.maximizeWorkspace",
        )}
      >
        <button
          type="button"
          className={styles.iconButton}
          aria-label={t(
            maximized ? "files.restoreWorkspace" : "files.maximizeWorkspace",
          )}
          aria-pressed={maximized}
          onClick={() => setMaximized((current) => !current)}
        >
          <PanelRight size={16} />
        </button>
      </Tooltip>
      <Tooltip title={t("common.close")}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={t("common.close")}
          onClick={close}
        >
          <X size={16} />
        </button>
      </Tooltip>
    </>
  );
  const footerActions = (
    <>
      {target && (
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => insertFileReference(target.path)}
        >
          <MessageSquarePlus size={15} />
          {t("files.mentionInChat")}
        </button>
      )}
      {!isWorkspace && (
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => dispatch({ type: "EXPAND_WORKSPACE" })}
        >
          <PanelRight size={15} />
          {t("files.expandWorkspace")}
        </button>
      )}
    </>
  );
  return (
    <motion.aside
      ref={drawerRef}
      className={`${styles.drawer} ${
        isWorkspace ? styles.drawerWorkspace : styles.drawerPreview
      } ${isResizing ? styles.drawerResizing : ""} ${
        maximized ? styles.drawerMaximized : ""
      }`}
      style={drawerStyle}
      data-workbench-maximized={maximized || undefined}
      layout={isResizing || maximized || prefersReducedMotion ? false : "size"}
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
      aria-label={t("workbench.tabs.workspace", "工作区")}
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
      <WorkbenchContent
        state={state}
        scope={scope}
        runtimeSessionId={runtimeSessionId}
        panelActions={panelActions}
        footerActions={footerActions}
        onActiveTargetChange={setActiveFileTarget}
        onBrowseMemoryTag={() => dispatch({ type: "EXPAND_WORKSPACE" })}
      />
    </motion.aside>
  );
}
