import React from "react";
import { ToolbarIcon } from "./ToolbarIcon";
import { useWorkflowI18n } from "./i18n";

export function CanvasNote({ data }: { data: any }) {
  const { t } = useWorkflowI18n();
  return (
    <section
      className="ff-canvas-note"
      aria-label={t("流程备注", "Workflow note")}
    >
      <div className="ff-note-handle">
        <ToolbarIcon name="note" />
        <span>{t("备注", "Note")}</span>
        <button
          className="nodrag"
          aria-label={t("删除备注", "Delete note")}
          disabled={data.locked}
          onClick={data.onRemove}
        >
          <ToolbarIcon name="close" />
        </button>
      </div>
      <textarea
        className="nodrag nowheel"
        aria-label={t("备注内容", "Note text")}
        value={data.text}
        readOnly={data.locked}
        onChange={(event) => data.onText(event.target.value)}
      />
    </section>
  );
}
export function CanvasGroup({ data }: { data: any }) {
  return <span className="ff-canvas-group-label">{data.label}</span>;
}
