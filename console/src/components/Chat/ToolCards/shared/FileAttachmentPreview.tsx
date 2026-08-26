import React from "react";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import {
  parseInternalFileLink,
  filePathFromPreviewUrl,
} from "../../../../features/files-workspace/internalFileLinks";
import { openFilePreview } from "../../../../features/files-workspace/openFilePreview";
import {
  openVisualizationCenter,
  resolveVisualizationTarget,
  supportsOilGasVisualization,
} from "../../../../features/files-workspace/fileOpenModes";
import type { FileTarget } from "../../../../features/files-workspace/types";
import { useAgentStore } from "../../../../stores/agentStore";
import MediaPreview from "./MediaPreview";
import type { ToolCallContent } from "./types";
import { getFileOperationPath, getMediaInfo, shortFileName } from "./utils";
import styles from "./toolCards.module.less";

interface FileAttachmentPreviewProps {
  content: ToolCallContent;
}

function targetForPath(
  filePath: string,
  artifactUrl?: string,
): FileTarget | null {
  if (artifactUrl) {
    return {
      source: "attachment",
      path: filePathFromPreviewUrl(artifactUrl, filePath) || filePath || "file",
      artifactUrl,
    };
  }
  const workspacePath = filePath
    .trim()
    .replace(/\\/g, "/")
    .replace(/^(?:\.\/)+/, "");
  const relativeTarget = parseInternalFileLink(workspacePath);
  if (relativeTarget) {
    return { ...relativeTarget, root: "project" };
  }
  if (!filePath) return null;
  return {
    source: "attachment",
    path: filePath,
  };
}

const FileAttachmentPreview: React.FC<FileAttachmentPreviewProps> = ({
  content,
}) => {
  const filePath = getFileOperationPath(content);
  const media = getMediaInfo(content);
  const target = targetForPath(filePath, media?.url);

  if (!media || media.type === "file") return null;
  return (
    <MediaPreview
      media={media}
      onFileOpen={
        target ? (trigger) => openFilePreview(target, trigger) : undefined
      }
    />
  );
};

export const FilePreviewLink: React.FC<FileAttachmentPreviewProps> = ({
  content,
}) => {
  const { t } = useTranslation();
  const filePath = getFileOperationPath(content);
  const media = getMediaInfo(content);
  const target = targetForPath(filePath, media?.url);
  const previewPath = filePath || media?.name || "";
  if (!previewPath || !target) return null;
  const canVisualize = supportsOilGasVisualization(previewPath);
  const selectedAgent = useAgentStore.getState().selectedAgent;
  const chatId = window.location.pathname.match(/\/chat\/([^/?#]+)/)?.[1];
  const openText = (trigger: HTMLElement | null) =>
    openFilePreview(target, trigger);
  return (
    <span className={styles.filePreviewActions}>
      <button
        type="button"
        className={styles.filePreviewLink}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openText(event.currentTarget);
        }}
        aria-label={`${shortFileName(previewPath)} ${t("files.preview")}`}
      >
        {t("files.preview")}
      </button>
      {canVisualize && (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              {
                key: "workbench",
                label: "在工作台预览三维网格",
              },
              {
                key: "visualization",
                label: "在可视化中心打开",
              },
            ],
            onClick: async ({ key, domEvent }) => {
              domEvent.preventDefault();
              domEvent.stopPropagation();
              const context = { agentId: selectedAgent, chatId };
              const visualizationTarget = await resolveVisualizationTarget(
                target,
                context,
              );
              if (key === "workbench") {
                openFilePreview({
                  ...visualizationTarget,
                  preferredView: "visualization",
                });
              } else {
                openVisualizationCenter(visualizationTarget, context, null);
              }
            },
          }}
        >
          <button
            type="button"
            className={styles.filePreviewMenu}
            aria-label={`${shortFileName(previewPath)} 打开方式`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <DownOutlined />
          </button>
        </Dropdown>
      )}
    </span>
  );
};

export default FileAttachmentPreview;
