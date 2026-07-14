/**
 * GenericToolCard — fallback card for tool calls not in the builtin registry.
 *
 * Shows the tool name + spinner while no output is available,
 * then a collapsible result block once the tool completes.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { ToolOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { ToolCallContent } from "../shared/types";
import { ToolCardShell } from "../shared";
import { DefaultBlock } from "../shared";
import { stringifyResult } from "../shared/utils";
import { useWorkspaceStore } from "@/components/Workspace/store/workspaceStore";

export interface GenericToolCardProps {
  content: ToolCallContent;
  isStreaming?: boolean;
}

const GenericToolCard: React.FC<GenericToolCardProps> = ({
  content,
  isStreaming,
}) => {
  const { t } = useTranslation();
  const toolLabel = content.serverLabel
    ? `${content.serverLabel} / ${content.name}`
    : content.name;
  const resultText = stringifyResult(content.result);

  const handleOpenInWorkspace = () => {
    if (!resultText) return;
    // Detect content type
    const trimmed = resultText.trim();
    let mimeType = "text/plain";
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      mimeType = "application/json";
    } else if (/^#{1,6}\s/.test(trimmed) || /\|.+\|/.test(trimmed)) {
      mimeType = "text/markdown";
    }
    useWorkspaceStore.getState().openArtifact({
      id: `tool-${content.id}`,
      title: toolLabel,
      mimeType,
      textContent: resultText,
      source: "tool_call",
    });
  };

  const workspaceBadge =
    content.status === "done" && resultText ? (
      <Tooltip title={t("workspace.openInWorkspace", "在工作区打开")}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpenInWorkspace();
          }}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "0 4px",
            color: "var(--color-primary, #1677ff)",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <FolderOpenOutlined style={{ fontSize: 12 }} />
        </button>
      </Tooltip>
    ) : null;

  return (
    <ToolCardShell
      icon={<ToolOutlined />}
      title={t("tool.execute", { tool: toolLabel })}
      content={content}
      isStreaming={isStreaming}
      badges={workspaceBadge}
    >
      {resultText && <DefaultBlock title="Output" content={resultText} />}
    </ToolCardShell>
  );
};

export default GenericToolCard;
