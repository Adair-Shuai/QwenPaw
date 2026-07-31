/**
 * MarkdownRenderer — Markdown 渲染器
 *
 * 使用项目中已有的 @agentscope-ai/chat Markdown 组件进行渲染，
 * 支持 GitHub Flavored Markdown（表格、代码高亮、数学公式等）。
 *
 * 视图模式：
 * - preview: 渲染后的 Markdown 预览
 * - code: 原始 Markdown 源码
 *
 * 工具栏：预览/源码切换、下载、全屏
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Segmented, Space, Tooltip, Spin } from "antd";
import {
  CodeOutlined,
  EyeOutlined,
  DownloadOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Markdown } from "@agentscope-ai/chat";
import { workspaceApi as workspaceFileApi } from "../../../api/modules/workspace";
import { ExternalMarkdownLink } from "../../Markdown/externalLinkComponents";
import { useAuthenticatedWorkspaceBlob } from "../../../hooks/useAuthenticatedWorkspaceBlob";
import { mimeFromExtension } from "../../../utils/mimeForPreview";
import { resolveWorkspaceMarkdownTarget } from "../../../utils/workspaceMarkdownLinks";
import type { RendererContext } from "../types";

type ViewMode = "preview" | "code";

type XMarkdownElementProps<T extends "a" | "img"> =
  React.ComponentPropsWithoutRef<T> & {
    domNode?: unknown;
    streamStatus?: unknown;
  };

function isTextMime(mimeType: string): boolean {
  return (
    mimeType.startsWith("text/") ||
    /(?:json|javascript|xml|yaml|toml)$/.test(mimeType)
  );
}

const MarkdownRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const containerRef = useRef<HTMLDivElement>(null);

  const content = artifact.textContent ?? "";

  // 流式模式自动滚动到底部
  useEffect(() => {
    if (artifact.isStreaming && containerRef.current) {
      const el = containerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [content, artifact.isStreaming]);

  const handleDownload = useCallback(() => {
    if (workspace.download) workspace.download(artifact);
  }, [workspace, artifact]);

  const handleFullscreen = useCallback(() => {
    if (workspace.fullscreen) workspace.fullscreen(artifact);
  }, [workspace, artifact]);

  const handleOpenWorkspaceFile = useCallback(
    async (path: string) => {
      const mimeType = mimeFromExtension(path) ?? "application/octet-stream";
      const extension = path.includes(".") ? path.split(".").pop() : undefined;
      const title = path.split("/").pop() || path;
      const id = `${artifact.id}:workspace-file:${path}`;
      const baseArtifact = {
        id,
        title,
        source: artifact.source,
        mimeType,
        extension,
        workspacePath: path,
        agentId: artifact.agentId,
        projectRoot: artifact.projectRoot,
        sessionId: artifact.sessionId,
      } as const;

      if (!isTextMime(mimeType)) {
        workspace.openArtifact({
          ...baseArtifact,
          binaryUrl: workspaceFileApi.getBinaryFileUrl(path),
        });
        return;
      }

      workspace.openArtifact({
        ...baseArtifact,
        textContent: "",
        isStreaming: true,
      });
      try {
        const result = await workspaceFileApi.loadCodeFile(path, {
          agentId: artifact.agentId ?? "default",
          projectRoot: artifact.projectRoot,
        });
        workspace.updateArtifact(id, {
          textContent: result.content,
          isStreaming: false,
        });
      } catch {
        workspace.updateArtifact(id, {
          textContent: `无法加载文件内容。文件路径: ${path}`,
          isStreaming: false,
        });
      }
    },
    [
      artifact.agentId,
      artifact.id,
      artifact.projectRoot,
      artifact.sessionId,
      artifact.source,
      workspace,
    ],
  );

  const markdownComponents = useMemo(() => {
    const markdownPath = artifact.workspacePath ?? artifact.title;

    const WorkspaceImage = ({
      domNode,
      streamStatus,
      src,
      alt,
      ...props
    }: XMarkdownElementProps<"img">) => {
      void domNode;
      void streamStatus;
      const target = src
        ? resolveWorkspaceMarkdownTarget(src, markdownPath)
        : { kind: "invalid" as const };
      const resource = useAuthenticatedWorkspaceBlob(
        target.kind === "workspace" ? target.path : null,
        artifact.agentId,
      );

      if (target.kind === "external") {
        return <img src={target.href} alt={alt} {...props} />;
      }
      if (target.kind !== "workspace") return <span>{alt}</span>;
      return resource.status === "ready" && resource.url ? (
        <img src={resource.url} alt={alt} {...props} />
      ) : null;
    };

    const WorkspaceLink = ({
      domNode,
      streamStatus,
      href,
      children,
      ...props
    }: XMarkdownElementProps<"a">) => {
      void domNode;
      void streamStatus;
      const target = href
        ? resolveWorkspaceMarkdownTarget(href, markdownPath)
        : { kind: "invalid" as const };
      if (target.kind === "external") {
        return (
          <ExternalMarkdownLink href={target.href} {...props}>
            {children}
          </ExternalMarkdownLink>
        );
      }
      if (target.kind === "anchor") {
        return (
          <a href={target.href} {...props}>
            {children}
          </a>
        );
      }
      if (target.kind !== "workspace") return <span>{children}</span>;
      return (
        <a
          href={target.path}
          {...props}
          onClick={(event) => {
            event.preventDefault();
            void handleOpenWorkspaceFile(target.path);
          }}
        >
          {children}
        </a>
      );
    };

    return { a: WorkspaceLink, img: WorkspaceImage };
  }, [
    artifact.agentId,
    artifact.title,
    artifact.workspacePath,
    handleOpenWorkspaceFile,
  ]);

  // ── 渲染预览 ──
  const previewContent = useMemo(() => {
    if (!content) {
      return (
        <div style={{ padding: "24px", textAlign: "center", color: "#999" }}>
          {artifact.isStreaming ? (
            <Spin tip={t("workspace.streaming")}>
              <div style={{ minHeight: 48 }} />
            </Spin>
          ) : (
            t("workspace.emptyContent")
          )}
        </div>
      );
    }

    return (
      <div
        className={`workspace-markdown-preview ${
          theme === "dark" ? "dark" : "light"
        }`}
        style={{
          padding: "12px 16px",
          fontSize: 14,
          lineHeight: 1.8,
          color: theme === "dark" ? "#e0e0e0" : "#333",
          minHeight: "100%",
        }}
      >
        <Markdown content={content} components={markdownComponents} />
        {artifact.isStreaming && <span className="cursor-blink">▋</span>}
      </div>
    );
  }, [content, artifact.isStreaming, markdownComponents, theme, t]);

  // ── 渲染代码视图 ──
  const codeContent = useMemo(
    () => (
      <pre
        style={{
          margin: 0,
          padding: "12px",
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily:
            "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: theme === "dark" ? "#e0e0e0" : "#333",
          background: theme === "dark" ? "#1e1e1e" : "#fafafa",
        }}
      >
        {content}
      </pre>
    ),
    [content, theme],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: theme === "dark" ? "#1e1e1e" : "#fff",
      }}
    >
      {/* 工具栏 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px",
          borderBottom: `1px solid ${theme === "dark" ? "#333" : "#f0f0f0"}`,
          flexShrink: 0,
        }}
      >
        <Segmented
          size="small"
          value={viewMode}
          onChange={(v) => setViewMode(v as ViewMode)}
          options={[
            { label: <EyeOutlined />, value: "preview" },
            { label: <CodeOutlined />, value: "code" },
          ]}
        />
        <Space size={2}>
          <Tooltip title={t("workspace.download")}>
            <Button
              size="small"
              type="text"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            />
          </Tooltip>
          <Tooltip title={t("workspace.fullscreen")}>
            <Button
              size="small"
              type="text"
              icon={<FullscreenOutlined />}
              onClick={handleFullscreen}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 内容区域 */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "auto",
          position: "relative",
        }}
      >
        {viewMode === "preview" && previewContent}
        {viewMode === "code" && codeContent}
      </div>
    </div>
  );
};

export default MarkdownRenderer;
