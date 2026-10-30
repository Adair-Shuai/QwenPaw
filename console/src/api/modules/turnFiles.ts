import { request } from "../request";
import { getApiToken, getApiUrl } from "../config";
import {
  buildAuthenticatedMediaUrl,
  buildWorkspaceScopeHeaders,
} from "../authHeaders";
import sessionApi from "../../pages/Chat/sessionApi";
import { downloadFileFromUrl } from "../../utils/downloadFileFromUrl";
import type { FilesWorkspaceScope } from "../../features/files-workspace/filesWorkspaceScope";
import type { WorkspaceRoot } from "../../features/files-workspace/types";

export type SessionFilesScope = Extract<
  FilesWorkspaceScope,
  { kind: "session" }
>;
export type TurnFileVersion = "before" | "after";
export interface TurnFileEntry {
  id: string;
  root: WorkspaceRoot;
  path: string;
  name: string;
  status: "created" | "modified" | "deleted" | "delivered";
  size: number;
  before_size?: number;
  binary: boolean;
  additions?: number;
  deletions?: number;
  before_available: boolean;
  after_available: boolean;
  delivered: boolean;
}
export interface TurnFileManifest {
  id: string;
  response_id?: string;
  client_message_id?: string;
  session_id: string;
  agent_id: string;
  status: string;
  started_at: string;
  finished_at?: string;
  incomplete: boolean;
  warnings: string[];
  overlap: boolean;
  files: TurnFileEntry[];
}
export interface TurnFileDiff {
  before: string;
  after: string;
  truncated: boolean;
}
export interface TurnFilesResponse {
  turns: TurnFileManifest[];
  has_more?: boolean;
  next_offset?: number;
}
export const TURN_FILES_UPDATED_EVENT = "qwenpaw:turn-files-updated";

export function turnFilesSessionId(scope: SessionFilesScope): string {
  return (
    sessionApi.getSessionIdentity(scope.sessionId).sessionId || scope.sessionId
  );
}

function endpoint(
  scope: SessionFilesScope,
  suffix = "",
  values: Record<string, string> = {},
): string {
  const query = new URLSearchParams({
    session_id: turnFilesSessionId(scope),
    ...(scope.chatId ? { chat_id: scope.chatId } : {}),
    ...values,
  });
  return `/agents/${encodeURIComponent(
    scope.agentId,
  )}/workspace/turn-files${suffix}?${query}`;
}

// A history page can mount dozens of response cards at once. Share their list
// request without sharing identity, credentials, or errors across sessions.
const listCache = new Map<
  string,
  {
    at: number;
    value?: TurnFilesResponse;
    pending?: Promise<TurnFilesResponse>;
  }
>();
const CACHE_TTL = 1000;
const MAX_CACHE_SCOPES = 32;

export const turnFilesApi = {
  list(
    scope: SessionFilesScope,
    options: {
      refresh?: boolean;
      responseId?: string;
      clientMessageId?: string;
      offset?: number;
      limit?: number;
    } = {},
  ): Promise<TurnFilesResponse> {
    const path = endpoint(scope, "", {
      ...(options.responseId ? { response_id: options.responseId } : {}),
      ...(options.clientMessageId
        ? { client_message_id: options.clientMessageId }
        : {}),
      ...(options.offset !== undefined
        ? { offset: String(options.offset) }
        : {}),
      ...(options.limit !== undefined ? { limit: String(options.limit) } : {}),
    });
    const key = JSON.stringify([path, getApiToken()]);
    const cached = listCache.get(key);
    if (cached?.pending && !options.refresh) return cached.pending;
    if (!options.refresh && cached?.value && Date.now() - cached.at < CACHE_TTL)
      return Promise.resolve(cached.value);
    const entry: {
      at: number;
      value?: TurnFilesResponse;
      pending?: Promise<TurnFilesResponse>;
    } = { at: 0 };
    entry.pending = request<TurnFilesResponse>(path, {
      headers: buildWorkspaceScopeHeaders(scope),
    })
      .then((value) => {
        entry.value = value;
        entry.at = Date.now();
        return value;
      })
      .finally(() => {
        entry.pending = undefined;
      });
    listCache.set(key, entry);
    if (listCache.size > MAX_CACHE_SCOPES)
      listCache.delete(listCache.keys().next().value!);
    return entry.pending;
  },
  get(scope: SessionFilesScope, turnId: string): Promise<TurnFileManifest> {
    return request(endpoint(scope, `/${encodeURIComponent(turnId)}`), {
      headers: buildWorkspaceScopeHeaders(scope),
    });
  },
  diff(
    scope: SessionFilesScope,
    turnId: string,
    fileId: string,
  ): Promise<TurnFileDiff> {
    return request(
      endpoint(
        scope,
        `/${encodeURIComponent(turnId)}/files/${encodeURIComponent(
          fileId,
        )}/diff`,
      ),
      { headers: buildWorkspaceScopeHeaders(scope) },
    );
  },
  fileUrl(
    scope: SessionFilesScope,
    turnId: string,
    fileId: string,
    version: TurnFileVersion = "after",
    download = false,
  ): string {
    return buildAuthenticatedMediaUrl(
      getApiUrl(
        endpoint(
          scope,
          `/${encodeURIComponent(turnId)}/files/${encodeURIComponent(fileId)}`,
          {
            version,
            download: String(download),
          },
        ),
      ),
      scope.agentId,
    );
  },
  bundleUrl(scope: SessionFilesScope, turnId: string): string {
    return getApiUrl(
      endpoint(scope, `/${encodeURIComponent(turnId)}/download`),
    );
  },
  downloadFile(
    scope: SessionFilesScope,
    turnId: string,
    file: TurnFileEntry,
    version: TurnFileVersion = "after",
  ): Promise<void> {
    return downloadFileFromUrl(
      this.fileUrl(scope, turnId, file.id, version, true),
      file.name,
      {
        headers: buildWorkspaceScopeHeaders(scope),
        preferResponseFilename: true,
      },
    );
  },
  downloadBundle(scope: SessionFilesScope, turnId: string): Promise<void> {
    return downloadFileFromUrl(
      this.bundleUrl(scope, turnId),
      `turn-${turnId}.zip`,
      {
        headers: buildWorkspaceScopeHeaders(scope),
        preferResponseFilename: true,
      },
    );
  },
};
