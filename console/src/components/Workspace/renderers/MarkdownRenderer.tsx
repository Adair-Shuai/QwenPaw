/**
 * Adapter for the upstream Files Workspace Markdown preview.
 *
 * The visual renderer follows pages/Coding/FilePreview while the adapter keeps
 * authenticated relative resources and workspace-internal file navigation.
 */
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { buildWorkspaceScopeHeaders } from "../../../api/authHeaders";
import { chatApi } from "../../../api/modules/chat";
import { workspaceApi as workspaceFileApi } from "../../../api/modules/workspace";
import { isAbsoluteLocalFilePath } from "../../../features/files-workspace/internalFileLinks";
import { useAuthenticatedWorkspaceBlob } from "../../../hooks/useAuthenticatedWorkspaceBlob";
import { mimeFromExtension } from "../../../utils/mimeForPreview";
import { parseMarkdownFrontmatter } from "../../../utils/markdown";
import { resolveWorkspaceMarkdownTarget } from "../../../utils/workspaceMarkdownLinks";
import { ExternalMarkdownLink } from "../../Markdown/externalLinkComponents";
import { MermaidCodeBlock } from "@/components/MermaidCodeBlock";
import styles from "../../../pages/Coding/FilePreview.module.less";
import type { RendererContext } from "../types";

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

const upstreamMarkdownComponents = {
  pre({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
  },
  code({
    node,
    inline,
    className,
    children,
    ...rest
  }: React.ComponentPropsWithoutRef<"code"> & {
    node?: unknown;
    inline?: boolean;
  }) {
    void node;
    void inline;
    const match = /language-([\w-]+)/.exec(className || "");
    const language = match?.[1]?.toLowerCase();
    const codeText = String(children).replace(/\n$/, "");
    if (language === "mermaid") {
      return <MermaidCodeBlock chart={codeText} />;
    }
    if (language) {
      return (
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: "6px",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          {codeText}
        </SyntaxHighlighter>
      );
    }
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },
};

const MarkdownRenderer: React.FC<RendererContext> = ({
  artifact,
  workspace,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const content = artifact.textContent ?? "";
  const parsedMarkdown = useMemo(
    () => parseMarkdownFrontmatter(content),
    [content],
  );

  useEffect(() => {
    if (artifact.isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [artifact.isStreaming, content]);

  const handleOpenWorkspaceFile = useCallback(
    async (path: string) => {
      const mimeType = mimeFromExtension(path) ?? "application/octet-stream";
      const extension = path.includes(".") ? path.split(".").pop() : undefined;
      const title = path.split("/").pop() || path;
      const id = `${artifact.id}:workspace-file:${path}`;
      const isAbsolutePath = isAbsoluteLocalFilePath(path);
      const baseArtifact = {
        id,
        title,
        source: artifact.source,
        mimeType,
        extension,
        workspacePath: path,
        agentId: artifact.agentId,
        projectRoot: artifact.projectRoot,
        workspaceRoot: artifact.workspaceRoot,
        chatId: artifact.chatId,
        projectDirOverride: artifact.projectDirOverride,
        sessionId: artifact.sessionId,
      } as const;

      if (!isTextMime(mimeType)) {
        workspace.openArtifact({
          ...baseArtifact,
          binaryUrl: isAbsolutePath
            ? chatApi.filePreviewUrl(path)
            : workspaceFileApi.getFileDownloadUrl(path, artifact.workspaceRoot),
        });
        return;
      }

      workspace.openArtifact({
        ...baseArtifact,
        textContent: "",
        isStreaming: true,
      });
      try {
        const result = isAbsolutePath
          ? await fetch(chatApi.filePreviewUrl(path), {
              headers: buildWorkspaceScopeHeaders({
                agentId: artifact.agentId,
                chatId: artifact.chatId,
                projectDirOverride: artifact.projectDirOverride,
              }),
            }).then(async (response) => {
              if (!response.ok) throw new Error(`${response.status}`);
              return { content: await response.text() };
            })
          : workspaceFileApi.loadFileText
          ? await workspaceFileApi.loadFileText(
              path,
              artifact.chatId,
              artifact.workspaceRoot,
              artifact.projectDirOverride,
            )
          : await workspaceFileApi.loadCodeFile(path, {
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
    [artifact, workspace],
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
        artifact.chatId || artifact.projectDirOverride || artifact.workspaceRoot
          ? {
              agentId: artifact.agentId,
              chatId: artifact.chatId,
              root: artifact.workspaceRoot,
              projectDirOverride: artifact.projectDirOverride,
            }
          : artifact.agentId,
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

    return {
      ...upstreamMarkdownComponents,
      a: WorkspaceLink,
      img: WorkspaceImage,
    };
  }, [
    artifact.agentId,
    artifact.chatId,
    artifact.projectDirOverride,
    artifact.title,
    artifact.workspacePath,
    artifact.workspaceRoot,
    handleOpenWorkspaceFile,
  ]);

  if (!content) {
    return <div className={styles.previewStatus} />;
  }

  return (
    <div ref={containerRef} className={styles.markdownWrap}>
      {parsedMarkdown.entries.length > 0 && (
        <dl className={styles.frontmatter} aria-label="Front matter">
          {parsedMarkdown.entries.map(({ key, value }, index) => (
            <div className={styles.frontmatterRow} key={`${key}:${index}`}>
              <dt className={styles.frontmatterKey}>{key}</dt>
              <dd className={styles.frontmatterValue}>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {parsedMarkdown.body}
      </ReactMarkdown>
      {artifact.isStreaming && <span className="cursor-blink">▋</span>}
    </div>
  );
};

export default MarkdownRenderer;
