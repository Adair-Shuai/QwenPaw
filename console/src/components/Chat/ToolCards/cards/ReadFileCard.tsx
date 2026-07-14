import React from "react";
import { useTranslation } from "react-i18next";
import { FileTextOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { ToolCallContent } from "../shared/types";
import { ToolCardShell, DefaultBlock } from "../shared";
import { shortFileName, countLines, stringifyResult } from "../shared/utils";
import { useWorkspaceStore } from "@/components/Workspace/store/workspaceStore";
import styles from "../shared/toolCards.module.less";

export interface ReadFileCardProps {
  content: ToolCallContent;
  isStreaming?: boolean;
}

const ReadFileCard: React.FC<ReadFileCardProps> = ({
  content,
  isStreaming,
}) => {
  const { t } = useTranslation();
  const params = content.params || {};
  const filePath = (params.file_path || params.path || "") as string;
  const file = shortFileName(filePath);
  const title = file ? t("tool.readFile", { file }) : t("tool.readFileDefault");

  const handleOpenInWorkspace = () => {
    const resultText = stringifyResult(content.result);
    if (!resultText) return;
    const ext = filePath.match(/\.([^.]+)$/)?.[1] || "";
    const mimeType =
      ext === "md"
        ? "text/markdown"
        : ext === "json"
        ? "application/json"
        : "text/plain";
    useWorkspaceStore.getState().openArtifact({
      id: `readfile-${content.id}`,
      title: file || "file",
      mimeType,
      textContent: resultText,
      extension: ext || undefined,
      source: "tool_call",
    });
  };

  const workspaceBadge =
    content.status === "done" ? (
      <Tooltip title={t("workspace.openInWorkspace", "在工作区打开")}>
        <button
          className={styles.workspaceBtn}
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

  if (content.status === "error") {
    return (
      <ToolCardShell
        content={content}
        isStreaming={isStreaming}
        icon={<FileTextOutlined />}
        title={title}
      />
    );
  }

  const resultText = stringifyResult(content.result);
  const lineCount = countLines(resultText);

  const badge =
    content.status === "done" && lineCount > 0 ? (
      <span className={styles.lineReadBadge}>
        {t("tool.lineBadge.lines", { count: lineCount })}
      </span>
    ) : null;

  return (
    <ToolCardShell
      content={content}
      isStreaming={isStreaming}
      icon={<FileTextOutlined />}
      title={title}
      badges={
        <>
          {badge}
          {workspaceBadge}
        </>
      }
    >
      {resultText && <DefaultBlock title="Output" content={resultText} />}
    </ToolCardShell>
  );
};

export default ReadFileCard;
