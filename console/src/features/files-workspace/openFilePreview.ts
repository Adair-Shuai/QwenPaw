import type { WorkspaceArtifact } from "../../components/Workspace/types";
import { chatApi } from "../../api/modules/chat";
import { isAbsoluteLocalFilePath } from "./internalFileLinks";
import type { FileTarget } from "./types";

export const OPEN_FILE_PREVIEW_EVENT = "qwenpaw:open-file-preview";
export const UPDATE_FILE_PREVIEW_EVENT = "qwenpaw:update-file-preview";

export interface OpenFilePreviewDetail {
  target: FileTarget;
  trigger?: HTMLElement | null;
}

export interface UpdateFilePreviewDetail {
  id: string;
  patch: Partial<WorkspaceArtifact>;
}

/** Convert local file URLs/paths into an authenticated backend preview URL. */
export function normalizeArtifactUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (isAbsoluteLocalFilePath(url) && !url.startsWith("/api/")) {
    return chatApi.filePreviewUrl(url);
  }
  return url;
}

function normalizeTarget(target: FileTarget): FileTarget {
  return {
    ...target,
    artifactUrl: normalizeArtifactUrl(target.artifactUrl),
    artifact: target.artifact
      ? {
          ...target.artifact,
          binaryUrl: normalizeArtifactUrl(target.artifact.binaryUrl),
        }
      : undefined,
  };
}

export function openFilePreview(
  target: FileTarget,
  trigger: HTMLElement | null = null,
): void {
  window.dispatchEvent(
    new CustomEvent<OpenFilePreviewDetail>(OPEN_FILE_PREVIEW_EVENT, {
      detail: { target: normalizeTarget(target), trigger },
    }),
  );
}

function previewPathForArtifact(artifact: WorkspaceArtifact): string {
  const raw = artifact.workspacePath || artifact.title;
  const extension = artifact.extension?.replace(/^\./, "");
  if (
    extension &&
    !raw.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
  ) {
    return `${raw}.${extension}`;
  }
  return raw;
}

export function artifactToFileTarget(artifact: WorkspaceArtifact): FileTarget {
  const normalizedArtifact = {
    ...artifact,
    binaryUrl: normalizeArtifactUrl(artifact.binaryUrl),
  };
  return {
    source: "artifact",
    path: previewPathForArtifact(normalizedArtifact),
    root: normalizedArtifact.workspaceRoot,
    artifactUrl: normalizedArtifact.binaryUrl,
    artifact: normalizedArtifact,
  };
}

export function openArtifactPreview(
  artifact: WorkspaceArtifact,
  trigger: HTMLElement | null = null,
): void {
  openFilePreview(artifactToFileTarget(artifact), trigger);
}

export function updateArtifactPreview(
  id: string,
  patch: Partial<WorkspaceArtifact>,
): void {
  window.dispatchEvent(
    new CustomEvent<UpdateFilePreviewDetail>(UPDATE_FILE_PREVIEW_EVENT, {
      detail: { id, patch },
    }),
  );
}
