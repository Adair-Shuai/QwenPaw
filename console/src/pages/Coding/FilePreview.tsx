/** Unified read-only preview adapter for the files workspace renderer registry. */
import { useMemo } from "react";
import { chatApi } from "../../api/modules/chat";
import { workspaceApi } from "../../api/modules/workspace";
import ArtifactPreview from "../../components/Workspace/ArtifactPreview";
import { registerBuiltinRenderers } from "../../components/Workspace/store/builtinRenderers";
import { rendererRegistry } from "../../components/Workspace/store/rendererRegistry";
import type { WorkspaceArtifact } from "../../components/Workspace/types";
import type { WorkspaceRoot } from "../../features/files-workspace/types";
import { useAgentStore } from "../../stores/agentStore";
import { mimeFromExtension } from "../../utils/mimeForPreview";

registerBuiltinRenderers();

export type PreviewType =
  | "image"
  | "pdf"
  | "markdown"
  | "html"
  | "csv"
  | "rich"
  | "none";

export function getPreviewType(filePath: string): PreviewType {
  const extension = filePath.split(".").pop()?.toLowerCase() ?? "";
  if (
    ["png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "bmp"].includes(
      extension,
    )
  ) {
    return "image";
  }
  if (extension === "pdf") return "pdf";
  if (["md", "mdx", "markdown"].includes(extension)) return "markdown";
  if (["html", "htm"].includes(extension)) return "html";
  if (["csv", "tsv"].includes(extension)) return "csv";
  const mimeType = mimeFromExtension(filePath) ?? "application/octet-stream";
  return rendererRegistry.supports(mimeType, extension) ? "rich" : "none";
}

export function isPreviewable(filePath: string): boolean {
  return getPreviewType(filePath) !== "none";
}

export interface FilePreviewProps {
  filePath: string;
  content: string;
  chatId?: string;
  binaryUrl?: string;
  root?: WorkspaceRoot;
  projectDirOverride?: string;
  workspaceBacked?: boolean;
  mimeType?: string;
  size?: number;
  artifact?: WorkspaceArtifact;
  onOpenWorkspaceFile?: (path: string) => void;
}

export default function FilePreview({
  filePath,
  content,
  chatId,
  binaryUrl,
  root = "project",
  projectDirOverride,
  workspaceBacked = false,
  mimeType,
  size,
  artifact: artifactProp,
  onOpenWorkspaceFile,
}: FilePreviewProps) {
  const selectedAgent = useAgentStore((state) => state.selectedAgent);
  const artifact = useMemo<WorkspaceArtifact>(() => {
    if (artifactProp) {
      const isInlineTextArtifact = artifactProp.textContent !== undefined;
      const inheritsWorkspaceRoot = workspaceBacked || isInlineTextArtifact;
      const generatedBinaryUrl =
        !workspaceBacked && !isInlineTextArtifact && artifactProp.workspacePath
          ? chatApi.filePreviewUrl(artifactProp.workspacePath)
          : undefined;
      return {
        ...artifactProp,
        textContent: artifactProp.textContent ?? content,
        binaryUrl: artifactProp.binaryUrl ?? binaryUrl ?? generatedBinaryUrl,
        chatId: artifactProp.chatId ?? chatId,
        workspaceRoot:
          artifactProp.workspaceRoot ??
          (inheritsWorkspaceRoot ? root : undefined),
        projectDirOverride:
          artifactProp.projectDirOverride ?? projectDirOverride,
      };
    }
    const extension = filePath.includes(".")
      ? filePath.split(".").pop()?.toLowerCase()
      : undefined;
    const resolvedMime =
      mimeType ?? mimeFromExtension(filePath) ?? "application/octet-stream";
    const isMarkdown = ["md", "mdx", "markdown"].includes(
      extension?.toLowerCase() ?? "",
    );
    const needsBinaryUrl =
      !resolvedMime.startsWith("text/") &&
      !/(?:json|javascript|xml|yaml|toml)$/.test(resolvedMime);
    const workspaceBinaryUrl =
      workspaceBacked && needsBinaryUrl
        ? typeof workspaceApi.getFileDownloadUrl === "function"
          ? workspaceApi.getFileDownloadUrl(filePath, root)
          : typeof workspaceApi.getBinaryFileUrl === "function"
            ? workspaceApi.getBinaryFileUrl(filePath)
            : undefined
        : undefined;
    return {
      id: `file-preview:${chatId ?? "local"}:${root}:${filePath}`,
      title: filePath.split("/").pop() || filePath,
      source: workspaceBacked
        ? "link"
        : binaryUrl
          ? "file_upload"
          : "generated",
      mimeType: resolvedMime,
      extension,
      textContent: content,
      binaryUrl: binaryUrl ?? workspaceBinaryUrl,
      workspacePath: workspaceBacked || isMarkdown ? filePath : undefined,
      workspaceRoot: workspaceBacked ? root : undefined,
      chatId,
      projectDirOverride,
      agentId: selectedAgent,
      size,
      meta: content ? { textSample: content.slice(0, 8192) } : undefined,
    };
  }, [
    artifactProp,
    binaryUrl,
    chatId,
    content,
    filePath,
    mimeType,
    projectDirOverride,
    root,
    selectedAgent,
    size,
    workspaceBacked,
  ]);

  return (
    <ArtifactPreview
      artifact={artifact}
      hostControls
      onOpenArtifact={
        onOpenWorkspaceFile
          ? (target) => {
              if (target.workspacePath)
                onOpenWorkspaceFile(target.workspacePath);
            }
          : undefined
      }
    />
  );
}
