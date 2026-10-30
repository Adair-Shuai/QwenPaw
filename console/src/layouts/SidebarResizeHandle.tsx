import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  clampSidebarWidth,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_RESIZE_STEP,
} from "./sidebarSizing";
import styles from "./dockableSidebar.module.less";

export default function SidebarResizeHandle({
  width,
  minWidth = SIDEBAR_MIN_WIDTH,
  onChange,
  onReset,
  onResizingChange,
  onCollapse,
}: {
  width: number;
  minWidth?: number;
  onChange: (width: number) => void;
  onReset?: () => void;
  onResizingChange: (resizing: boolean) => void;
  onCollapse?: () => void;
}) {
  const { t } = useTranslation();
  const handle = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; x: number; width: number } | null>(null);
  const finish = useCallback(
    (cancel = false) => {
      const current = gesture.current;
      if (!current) return;
      gesture.current = null;
      if (cancel) onChange(current.width);
      onResizingChange(false);
      if (handle.current?.hasPointerCapture?.(current.id))
        handle.current.releasePointerCapture(current.id);
    },
    [onChange, onResizingChange],
  );
  useEffect(() => {
    const cancel = () => finish(true);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && gesture.current) {
        event.preventDefault();
        cancel();
      }
    };
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", escape);
      cancel();
    };
  }, [finish]);
  const resize = (next: number) => {
    if (next <= minWidth - 60 && onCollapse) {
      // Restore the width from before this gesture, and release capture before
      // collapsing unmounts the handle. Reopening must not use the clamped width.
      finish(true);
      onCollapse();
      return;
    }
    onChange(clampSidebarWidth(next, minWidth));
  };
  return (
    <div
      ref={handle}
      role="separator"
      tabIndex={0}
      aria-label={t("sidebar.resize", "Resize sidebar")}
      title={t(
        "sidebar.resizeHint",
        "Drag to resize or collapse; double-click to reset",
      )}
      aria-orientation="vertical"
      aria-valuemin={minWidth}
      aria-valuemax={SIDEBAR_MAX_WIDTH}
      aria-valuenow={width}
      className={styles.resizeHandle}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        gesture.current = { id: event.pointerId, x: event.clientX, width };
        event.currentTarget.setPointerCapture(event.pointerId);
        onResizingChange(true);
      }}
      onPointerMove={(event) => {
        const current = gesture.current;
        if (current?.id === event.pointerId)
          resize(current.width + event.clientX - current.x);
      }}
      onPointerUp={(event) => {
        const current = gesture.current;
        if (current?.id !== event.pointerId) return;
        resize(current.width + event.clientX - current.x);
        finish();
      }}
      onPointerCancel={() => finish(true)}
      onLostPointerCapture={() => finish(true)}
      onDoubleClick={onReset}
      onKeyDown={(event) => {
        const next =
          event.key === "ArrowLeft"
            ? width - SIDEBAR_RESIZE_STEP
            : event.key === "ArrowRight"
            ? width + SIDEBAR_RESIZE_STEP
            : event.key === "Home"
            ? minWidth
            : event.key === "End"
            ? SIDEBAR_MAX_WIDTH
            : null;
        if (next !== null) {
          event.preventDefault();
          onChange(clampSidebarWidth(next, minWidth));
        }
      }}
    />
  );
}
