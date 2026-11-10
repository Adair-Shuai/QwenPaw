import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { useWorkflowI18n } from "./i18n";

export function InspectorPanel({
  open,
  onClose,
  extra,
  children,
  antd,
}: {
  open: boolean;
  onClose: () => void;
  extra: ReactNode;
  children: ReactNode;
  antd: any;
}) {
  const { t } = useWorkflowI18n();
  const [narrow, setNarrow] = useState(() => window.innerWidth <= 1000);
  const [width, setWidth] = useState(380);
  const dragCleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => dragCleanup.current?.(), []);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1000px)");
    const adapt = () => setNarrow(media.matches);
    adapt();
    media.addEventListener("change", adapt);
    return () => media.removeEventListener("change", adapt);
  }, []);
  const resize = (value: number) =>
    setWidth(Math.max(300, Math.min(560, value)));
  if (narrow)
    return React.createElement(antd.Drawer, {
      title: t("节点属性", "Node properties"),
      open,
      onClose,
      width: Math.min(420, window.innerWidth),
      extra,
      children,
    });
  if (!open) return null;
  return (
    <aside
      className="ff-properties"
      aria-label={t("节点属性", "Node properties")}
      style={{ width }}
    >
      <div
        role="separator"
        aria-label={t("调整属性栏宽度", "Resize properties panel")}
        aria-orientation="vertical"
        aria-valuemin={300}
        aria-valuemax={560}
        aria-valuenow={width}
        tabIndex={0}
        className="ff-properties-resize"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            resize(width + (event.key === "ArrowLeft" ? 20 : -20));
          }
          if (event.key === "Home") resize(300);
          if (event.key === "End") resize(560);
        }}
        onPointerDown={(event) => {
          event.preventDefault();
          dragCleanup.current?.();
          const start = event.clientX;
          const previous = width;
          const move = (pointer: PointerEvent) =>
            resize(previous + start - pointer.clientX);
          const finish = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", finish);
            window.removeEventListener("pointercancel", finish);
            window.removeEventListener("blur", finish);
            dragCleanup.current = null;
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", finish, { once: true });
          window.addEventListener("pointercancel", finish, { once: true });
          window.addEventListener("blur", finish, { once: true });
          dragCleanup.current = finish;
        }}
      />
      <header>
        <strong>{t("节点属性", "Node properties")}</strong>
        {extra}
        <antd.Button
          aria-label={t("关闭节点属性", "Close node properties")}
          onClick={onClose}
        >
          ×
        </antd.Button>
      </header>
      <div className="ff-properties-content">{children}</div>
    </aside>
  );
}
