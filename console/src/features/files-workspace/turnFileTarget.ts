import {
  turnFilesApi,
  type SessionFilesScope,
  type TurnFileEntry,
  type TurnFileManifest,
  type TurnFileVersion,
} from "../../api/modules/turnFiles";
import type { FileTarget } from "./types";
import { mimeFromExtension } from "../../utils/mimeForPreview";

/** Archive identity is deliberately separate from the mutable workspace path. */
export function turnFileTarget(
  scope: SessionFilesScope,
  turn: TurnFileManifest,
  file: TurnFileEntry,
  version: TurnFileVersion = "after",
): FileTarget {
  const url = turnFilesApi.fileUrl(scope, turn.id, file.id, version);
  const size = version === "before" ? file.before_size : file.size;
  return {
    source: "artifact",
    path: file.path,
    root: file.root,
    size,
    artifactUrl: url,
    artifact: {
      id: `turn-file:${JSON.stringify([
        scope.agentId,
        turn.session_id,
        turn.id,
        file.id,
        version,
      ])}`,
      title: file.name,
      source: "tool_call",
      mimeType:
        mimeFromExtension(file.name) ??
        (file.binary ? "application/octet-stream" : "text/plain"),
      extension: file.name.includes(".")
        ? file.name.split(".").pop()
        : undefined,
      binaryUrl: url,
      size,
      workspacePath: file.path,
      workspaceRoot: file.root,
      agentId: scope.agentId,
      sessionId: scope.sessionId,
      chatId: scope.chatId,
      meta: {
        turnFileArchive: true,
        turnId: turn.id,
        fileId: file.id,
        version,
        startedAt: turn.started_at,
        finishedAt: turn.finished_at,
        status: file.status,
      },
    },
  };
}
