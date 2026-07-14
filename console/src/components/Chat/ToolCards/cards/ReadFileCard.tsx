import React from "react";
import { useTranslation } from "react-i18next";
import { FileTextOutlined } from "@ant-design/icons";
import type { ToolCallContent } from "../shared/types";
import { ToolCardShell, DefaultBlock } from "../shared";
import { shortFileName, countLines, stringifyResult } from "../shared/utils";
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
  const ext = filePath.match(/\.([^.]+)$/)?.[1] || "";

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
      badges={badge}
    >
      {resultText && (
        <DefaultBlock
          title="Output"
          content={resultText}
          workspaceTitle={file || undefined}
          workspaceExtension={ext || undefined}
        />
      )}
    </ToolCardShell>
  );
};

export default ReadFileCard;
