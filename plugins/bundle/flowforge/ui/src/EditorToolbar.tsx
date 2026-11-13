import React from "react";
import { ToolbarIcon } from "./ToolbarIcon";
import type { WorkflowTranslate } from "./i18n";

export function EditorToolbar({
  antd,
  t,
  name,
  summary,
  agentId,
  dirty,
  saving,
  validating,
  canUndo,
  canRedo,
  paletteOpen,
  debugOpen,
  count,
  grouped,
  muted,
  locked,
  previewing = false,
  grid,
  snap,
  focus,
  canPaste,
  onAction,
  onRun,
}: {
  antd: any;
  t: WorkflowTranslate;
  name: string;
  summary: string;
  agentId: string;
  dirty: boolean;
  saving: boolean;
  validating: boolean;
  canUndo: boolean;
  canRedo: boolean;
  paletteOpen: boolean;
  debugOpen: boolean;
  count: number;
  grouped: boolean;
  muted: boolean;
  locked: boolean;
  previewing?: boolean;
  grid: boolean;
  snap: boolean;
  focus: boolean;
  canPaste: boolean;
  onAction: (action: string) => void;
  onRun: () => void;
}) {
  const { Button, Dropdown, Tooltip } = antd;
  const button = (
    action: string,
    label: string,
    icon?: string,
    options: any = {},
  ) => (
    <Button
      key={action}
      type="text"
      icon={icon ? <ToolbarIcon name={icon} /> : undefined}
      onClick={() => onAction(action)}
      {...options}
    >
      {label}
    </Button>
  );
  const iconButton = (
    action: string,
    label: string,
    icon: string,
    options: any = {},
  ) => (
    <Tooltip title={label} key={action}>
      {button(action, "", icon, { "aria-label": label, ...options })}
    </Tooltip>
  );
  const item = (
    key: string,
    label: string,
    disabled = false,
    shortcut?: string,
  ) => ({
    key,
    disabled,
    label: (
      <span className="ff-command-label">
        <span>{label}</span>
        {shortcut && <kbd>{shortcut}</kbd>}
      </span>
    ),
  });
  const menu = (label: string, items: any[]) => (
    <Dropdown
      trigger={["click"]}
      menu={{ items, onClick: ({ key }: any) => onAction(key) }}
    >
      <Button type="text" className="ff-command-menu">
        {label}
        <ToolbarIcon name="chevron" />
      </Button>
    </Dropdown>
  );
  const groupLabel = grouped
    ? t("解除分组", "Ungroup")
    : t("创建分组", "Group nodes");
  const muteLabel = muted
    ? t("启用节点", "Enable nodes")
    : t("禁用节点", "Disable nodes");
  const noEdit = locked || !count;
  return (
    <>
      <header className="ff-toolbar">
        {iconButton("back", t("返回工作流列表", "Back to workflows"), "back")}
        <div className="ff-title">
          <div className="ff-title-line">
            <strong title={name}>{name}</strong>
            <span
              className={`ff-save-status ${dirty ? "ff-unsaved" : ""}`}
              role="status"
            >
              {dirty ? t("有未保存修改") : t("已保存")}
            </span>
          </div>
          <div className="ff-toolbar-summary">
            {summary}
            <span className="ff-agent-scope">
              {t("运行专家 {id}", "Execution agent {id}", { id: agentId })}
            </span>
          </div>
        </div>
        <div className="ff-toolbar-actions">
          <Button
            type="text"
            icon={<ToolbarIcon name="check" />}
            aria-label={t("验证")}
            loading={validating}
            disabled={previewing}
            onClick={() => onAction("validate")}
          >
            {t("验证")}
          </Button>
          <Button
            icon={<ToolbarIcon name="save" />}
            aria-label={t("保存")}
            loading={saving}
            disabled={previewing}
            onClick={() => onAction("save")}
          >
            {t("保存")}
          </Button>
          <Button
            type="primary"
            icon={<ToolbarIcon name="play" />}
            aria-label={t("试运行")}
            disabled={saving || validating || previewing}
            onClick={onRun}
          >
            {t("试运行")}
          </Button>
        </div>
      </header>
      <div
        className="ff-commandbar"
        role="toolbar"
        aria-label={t("编辑与调试工具", "Editing and debugging tools")}
      >
        <div className="ff-command-group">
          {button("palette", t("节点库"), "blocks", {
            "aria-pressed": paletteOpen && !focus,
          })}
          {button("ai", t("AI 编辑", "AI edit"), "ai")}
          <span className="ff-command-divider" />
          {iconButton("undo", t("撤销"), "undo", {
            disabled: !canUndo || locked,
          })}
          {iconButton("redo", t("重做"), "redo", {
            disabled: !canRedo || locked,
          })}
        </div>
        <div className="ff-command-group">
          {menu(t("编辑", "Edit"), [
            item("copy", t("复制"), !count, "Ctrl C"),
            item("paste", t("粘贴", "Paste"), locked || !canPaste, "Ctrl V"),
            item("duplicate", t("创建副本", "Duplicate"), noEdit, "Ctrl D"),
            item(
              "group",
              groupLabel,
              locked || (!grouped && count < 2),
              "Ctrl G",
            ),
            item("mute", muteLabel, noEdit),
            { type: "divider" },
            item(
              "select-all",
              t("全选节点", "Select all nodes"),
              false,
              "Ctrl A",
            ),
            item("clear", t("取消选择", "Clear selection"), false, "Esc"),
            item("note", t("添加备注", "Add note"), locked),
            { type: "divider" },
            {
              ...item(
                "delete",
                t("删除选中节点", "Delete selected nodes"),
                noEdit,
                "Delete",
              ),
              danger: true,
            },
          ])}
          {menu(t("排列", "Arrange"), [
            item("auto", t("自动布局"), locked),
            { type: "divider" },
            ...[
              ["left", "左对齐", "Align left"],
              ["right", "右对齐", "Align right"],
              ["top", "顶部对齐", "Align top"],
              ["bottom", "底部对齐", "Align bottom"],
              ["distribute-h", "水平分布", "Distribute horizontally"],
              ["distribute-v", "垂直分布", "Distribute vertically"],
            ].map(([key, zh, en]) =>
              item(
                key,
                t(zh, en),
                locked || count < (key.startsWith("distribute") ? 3 : 2),
              ),
            ),
            { type: "divider" },
            item(
              "snap",
              `${snap ? "✓  " : ""}${t("网格吸附", "Snap to grid")}`,
            ),
          ])}
          {menu(t("视图", "View"), [
            item("fit", t("适应画布", "Fit to canvas"), false, "1"),
            item("locate", t("聚焦选中节点", "Focus selection"), !count),
            item("zoom-reset", t("恢复 100%", "Reset to 100%"), false, "0"),
            { type: "divider" },
            item("grid", `${grid ? "✓  " : ""}${t("显示网格", "Show grid")}`),
            item(
              "lock",
              `${locked ? "✓  " : ""}${t(
                "锁定画布编辑",
                "Lock canvas editing",
              )}`,
            ),
            item(
              "focus",
              focus
                ? t("退出专注模式", "Exit focus mode")
                : t("专注模式", "Focus mode"),
            ),
          ])}
        </div>
        <div className="ff-command-group ff-command-observe">
          {iconButton("find", t("查找画布节点", "Find canvas nodes"), "search")}
          {button("debug", t("调试与变量", "Debug and variables"), "debug", {
            "aria-pressed": debugOpen && !focus,
            disabled: previewing,
          })}
          {button("history", t("运行记录"), "history")}
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                item("versions", t("版本")),
                item("io", t("输入 / 输出"), previewing),
                { type: "divider" },
                item("import", t("导入 JSON", "Import JSON"), locked),
                item("export", t("导出 JSON", "Export JSON")),
                { type: "divider" },
                item("shortcuts", t("快捷键", "Keyboard shortcuts")),
              ],
              onClick: ({ key }: any) => onAction(key),
            }}
          >
            <Button
              type="text"
              aria-label={t("更多操作", "More actions")}
              icon={<ToolbarIcon name="more" />}
            />
          </Dropdown>
        </div>
      </div>
    </>
  );
}

export function SelectionToolbar({
  antd,
  t,
  count,
  grouped,
  muted,
  locked,
  onAction,
}: {
  antd: any;
  t: WorkflowTranslate;
  count: number;
  grouped: boolean;
  muted: boolean;
  locked: boolean;
  onAction: (action: string) => void;
}) {
  if (!count) return null;
  const { Button, Tooltip } = antd;
  return (
    <div
      className="ff-selectionbar"
      role="toolbar"
      aria-label={t("选中节点操作", "Selected node actions")}
    >
      <span>
        {t("已选 {count} 个节点", "{count} nodes selected", { count })}
      </span>
      <Button
        type="text"
        icon={<ToolbarIcon name="ai" />}
        disabled={locked}
        onClick={() => onAction("ai-selection")}
      >
        {t("AI 修改", "AI modify")}
      </Button>
      <Button
        type="text"
        icon={<ToolbarIcon name="copy" />}
        disabled={locked}
        onClick={() => onAction("duplicate")}
      >
        {t("副本", "Duplicate")}
      </Button>
      <Button
        type="text"
        icon={<ToolbarIcon name="group" />}
        disabled={locked || (!grouped && count < 2)}
        onClick={() => onAction("group")}
      >
        {grouped ? t("解除分组", "Ungroup") : t("创建分组", "Group nodes")}
      </Button>
      <Tooltip
        title={t(
          "禁用使用静默跳过模式，不执行节点自身逻辑。",
          "Disabling uses mute mode and skips the node's own execution.",
        )}
      >
        <Button
          type="text"
          icon={<ToolbarIcon name="power" />}
          disabled={locked}
          onClick={() => onAction("mute")}
        >
          {muted
            ? t("启用节点", "Enable nodes")
            : t("禁用节点", "Disable nodes")}
        </Button>
      </Tooltip>
      <Button
        type="text"
        aria-label={t("取消选择", "Clear selection")}
        icon={<ToolbarIcon name="close" />}
        onClick={() => onAction("clear")}
      />
    </div>
  );
}
