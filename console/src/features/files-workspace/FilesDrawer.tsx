import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { FilesDrawerEvent, FilesDrawerState } from "./types";
import type { FilesWorkspaceScope } from "./filesWorkspaceScope";
import styles from "./FilesWorkspace.module.less";

const PREVIEW_WIDTH_STORAGE_KEY = "qwenpaw-files-preview-width";
const MIN_DRAWER_WIDTH = 420;
const MIN_CHAT_WIDTH = 420;
const FilesWorkspace = lazy(() => import("./FilesWorkspace"));

interface FilesDrawerProps {
  state: Exclude<FilesDrawerState, { kind: "closed" }>;
  dispatch: (event: FilesDrawerEvent) => void;
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
}

export default function FilesDrawer({
  state,
  dispatch,
  scope,
}: FilesDrawerProps) {
  const { t } = useTranslation();
  const drawerRef = useRef<HTMLElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const widthStorageKey = PREVIEW_WIDTH_STORAGE_KEY;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const stored = Number(localStorage.getItem(widthStorageKey));
    setWidth(Number.isFinite(stored) && stored > 0 ? stored : 0);
  }, [widthStorageKey]);

  const close = useCallback(() => {
    const trigger = state.trigger;
    dispatch({ type: "CLOSE" });
    requestAnimationFrame(() => trigger?.focus());
  }, [dispatch, state.trigger]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    };
    document.addEventListener("keydown", handleKeyDown);
    drawerRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  const resizeFromPointer = (event: React.PointerEvent) => {
    event.preventDefault();
    setIsResizing(true);
    const startX = event.clientX;
    const initial = drawerRef.current?.getBoundingClientRect().width ?? 0;
    const containerWidth =
      drawerRef.current?.parentElement?.getBoundingClientRect().width ??
      window.innerWidth;
    const maximum = Math.max(MIN_DRAWER_WIDTH, containerWidth - MIN_CHAT_WIDTH);
    const move = (nextEvent: PointerEvent) => {
      setWidth(
        Math.min(
          Math.max(MIN_DRAWER_WIDTH, initial + startX - nextEvent.clientX),
          maximum,
        ),
      );
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      setIsResizing(false);
      const current = drawerRef.current?.getBoundingClientRect().width;
      if (current) localStorage.setItem(widthStorageKey, String(current));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  return (
    <motion.aside
      ref={drawerRef}
      className={`${styles.drawer} ${styles.drawerPreview} ${
        isResizing ? styles.drawerResizing : ""
      }`}
      style={width > 0 ? { width: `${width}px` } : undefined}
      layout={isResizing || prefersReducedMotion ? false : "size"}
      initial={prefersReducedMotion ? false : { opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: prefersReducedMotion ? 0 : 14 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              layout: { type: "spring", stiffness: 360, damping: 38 },
              opacity: { duration: 0.18 },
              x: { duration: 0.24, ease: [0.22, 0.78, 0.24, 1] },
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
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          setWidth((current) => {
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
                (current || 640) + (event.key === "ArrowLeft" ? 24 : -24),
              ),
              maximum,
            );
            localStorage.setItem(widthStorageKey, String(next));
            return next;
          });
        }}
      />

      <Suspense
        fallback={<div className={styles.empty}>{t("common.loading")}</div>}
      >
        <FilesWorkspace
          initialTarget={state.target}
          scope={scope}
          compact
          onClose={close}
        />
      </Suspense>
    </motion.aside>
  );
}
