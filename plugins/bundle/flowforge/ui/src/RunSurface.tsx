import React, { useState } from "react";
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
      aria-label={t("工作流调试栏", "Workflow debug panel")}
      className="ff-run-dock"
      style={{ height: collapsed ? "auto" : `${height}px` }}
    >
      <header className="ff-run-dock-header">
        <strong>{title}</strong>
        {!collapsed && (
          <input
            type="range"
            min={180}
            max={700}
            step={20}
            value={height}
            aria-label={t("调试栏高度", "Debug panel height")}
            onChange={(event) => setHeight(Number(event.target.value))}
          />
        )}
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
