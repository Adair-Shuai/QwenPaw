import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWorkflowI18n } from "./i18n";

export function RunSurface({
  docked,
  open,
  title,
  onClose,
  extra,
  antd,
  children,
}: {
  docked: boolean;
  open: boolean;
  title: string;
  onClose: () => void;
  extra?: React.ReactNode;
  antd: any;
  children: React.ReactNode;
}) {
  const { t } = useWorkflowI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [height, setHeight] = useState(340);
  const [maxHeight, setMaxHeight] = useState(700);
  const panel = useRef<HTMLElement>(null);
  const gesture = useRef<{
    id: number;
    y: number;
    height: number;
    handle: HTMLDivElement;
  } | null>(null);
  const minHeight = Math.min(180, maxHeight);
  const resize = (value: number) =>
    setHeight(Math.max(minHeight, Math.min(maxHeight, value)));
  const finishDrag = useCallback(() => {
    const current = gesture.current;
    gesture.current = null;
    if (current?.handle.hasPointerCapture?.(current.id))
      current.handle.releasePointerCapture(current.id);
  }, []);
  useEffect(() => {
    if (!docked || !open || collapsed) return;
    const container = panel.current?.parentElement;
    const adapt = () => {
      const available =
        container?.getBoundingClientRect().height || window.innerHeight;
      const limit = Math.min(700, Math.floor(available * 0.75));
      setMaxHeight(limit);
      setHeight((value) =>
        Math.max(Math.min(180, limit), Math.min(limit, value)),
      );
    };
    adapt();
    const observer = new ResizeObserver(adapt);
    if (container) observer.observe(container);
    window.addEventListener("resize", adapt);
    window.addEventListener("blur", finishDrag);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", adapt);
      window.removeEventListener("blur", finishDrag);
      finishDrag();
    };
  }, [docked, open, collapsed, finishDrag]);
  const { Drawer, Button } = antd;
  if (!docked)
    return (
      <Drawer
        title={title}
        open={open}
        onClose={onClose}
        width={760}
        extra={extra}
      >
        {children}
      </Drawer>
    );
  if (!open) return null;
  return (
    <section
      ref={panel}
      aria-label={t("工作流调试栏", "Workflow debug panel")}
      className="ff-run-dock"
      style={{ height: collapsed ? "auto" : `${height}px` }}
    >
      {!collapsed && (
        <div
          role="separator"
          tabIndex={0}
          className="ff-run-dock-resize"
          aria-label={t("调整调试栏高度", "Resize debug panel")}
          title={t(
            "拖动调整调试栏高度，方向键可微调",
            "Drag to resize the debug panel, or use arrow keys",
          )}
          aria-orientation="horizontal"
          aria-valuemin={minHeight}
          aria-valuemax={maxHeight}
          aria-valuenow={height}
          onPointerDown={(event) => {
            if (event.button !== 0 || gesture.current) return;
            event.preventDefault();
            event.currentTarget.focus();
            gesture.current = {
              id: event.pointerId,
              y: event.clientY,
              height: panel.current?.getBoundingClientRect().height || height,
              handle: event.currentTarget,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const current = gesture.current;
            if (current?.id === event.pointerId)
              resize(current.height + current.y - event.clientY);
          }}
          onPointerUp={(event) => {
            const current = gesture.current;
            if (current?.id !== event.pointerId) return;
            resize(current.height + current.y - event.clientY);
            finishDrag();
          }}
          onPointerCancel={(event) => {
            if (gesture.current?.id === event.pointerId) finishDrag();
          }}
          onLostPointerCapture={(event) => {
            if (gesture.current?.id === event.pointerId) finishDrag();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              finishDrag();
              return;
            }
            const next =
              event.key === "ArrowUp"
                ? height + 20
                : event.key === "ArrowDown"
                ? height - 20
                : event.key === "Home"
                ? minHeight
                : event.key === "End"
                ? maxHeight
                : null;
            if (next !== null) {
              event.preventDefault();
              resize(next);
            }
          }}
        />
      )}
      <header className="ff-run-dock-header">
        <strong>{title}</strong>
        {extra}
        <Button
          size="small"
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
        >
          {collapsed
            ? t("展开调试栏", "Expand debug panel")
            : t("收起调试栏", "Collapse debug panel")}
        </Button>
        <Button
          size="small"
          onClick={onClose}
          aria-label={t("关闭调试栏", "Close debug panel")}
        >
          ×
        </Button>
      </header>
      <div hidden={collapsed} className="ff-run-dock-body">
        {children}
      </div>
    </section>
  );
}
