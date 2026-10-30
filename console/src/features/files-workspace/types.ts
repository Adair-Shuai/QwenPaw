export type FileSource =
  | "workspace"
  | "attachment"
  | "artifact"
  | "profile"
  | "memory"
  | "daily"
  | "digest";
/**
 * Which directory a Files API path is relative to.
 *
 * `"project"` is the PRIMARY bound project directory and `"workspace"` the
 * agent's own storage root. `` `project:${absolutePath}` `` selects any other
 * directory bound to the session — the path is carried rather than an index
 * because the bound list is reorderable ("make primary"), and an index would
 * let a persisted editor tab silently start pointing at a different directory.
 */
export type WorkspaceRoot = "project" | "workspace" | `project:${string}`;
export type MemoryGraphRoot = "wiki" | "procedure" | "personal";

export interface FileTarget {
  source: FileSource;
  path: string;
  root?: WorkspaceRoot;
  /** Explicit rendering intent for formats that support both text and GenUI. */
  preferredView?: "text" | "visualization";
  /** Latest file metadata, supplied by the native file loader. */
  size?: number;
  /** Stable URL emitted by a chat tool result for a historical artifact. */
  artifactUrl?: string;
  /** Inline or generated content that is not necessarily backed by a file. */
  artifact?: import("../../components/Workspace/types").WorkspaceArtifact;
  line?: number;
  endLine?: number;
  column?: number;
}

export type WorkbenchMode =
  | "files"
  | "browser"
  | "agents"
  | "genui"
  | "compute"
  | "simulation"
  | "interactions";

export type FilesDrawerState =
  | { kind: "closed" }
  | { kind: "preview"; target: FileTarget; trigger: HTMLElement | null }
  | {
      kind: "workspace";
      target?: FileTarget;
      mode?: WorkbenchMode;
      simulationRunId?: string;
      interactionRequestId?: string;
      trigger: HTMLElement | null;
    };

export type FilesDrawerEvent =
  | {
      type: "OPEN_PREVIEW";
      target: FileTarget;
      trigger: HTMLElement | null;
    }
  | {
      type: "OPEN_WORKSPACE";
      target?: FileTarget;
      mode?: WorkbenchMode;
      simulationRunId?: string;
      interactionRequestId?: string;
      trigger: HTMLElement | null;
    }
  | { type: "EXPAND_WORKSPACE" }
  | { type: "COLLAPSE_TO_PREVIEW"; target?: FileTarget }
  | { type: "CLOSE" };

export interface FileMetadata {
  path: string;
  size: number;
  modified_at: string;
  preview_kind: "text" | "image" | "pdf" | "csv" | "binary";
  etag: string;
}

export interface DirectoryEntry {
  name: string;
  path: string;
  kind: "file" | "directory";
  size: number | null;
  modified_at: string;
  preview_kind: string;
}

export interface DirectoryPage {
  directory: string;
  entries: DirectoryEntry[];
  next_cursor: string | null;
  has_more: boolean;
}
