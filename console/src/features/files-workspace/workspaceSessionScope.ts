import sessionApi from "../../pages/Chat/sessionApi";
import { getPendingProjectDirectory } from "../project-directory/pendingProjectDirectory";
import { getSessionIdFromPath } from "../../utils/sessionRoute";

const BACKEND_CHAT_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Backend chat id only: mapped realId, or a UUID already accepted by the API. */
export function resolveBackendChatId(
  chatId?: string | null,
): string | undefined {
  if (!chatId) return undefined;
  const resolved = sessionApi.getRealIdForSession(chatId);
  if (resolved) return resolved;
  return BACKEND_CHAT_UUID.test(chatId) ? chatId : undefined;
}

export interface WorkspaceSessionScopeHeaders {
  sessionId: string;
  chatId?: string;
  projectDirOverride?: string;
}

/**
 * Same Session headers ChatPage sends to workspace APIs.
 * Never send a local timestamp id as X-Chat-Id; use the pending project dir instead.
 */
export function resolveWorkspaceSessionScope(options: {
  selectedAgent: string;
  pathname?: string;
  sessionId?: string | null;
}): WorkspaceSessionScopeHeaders {
  const routeId =
    options.sessionId !== undefined
      ? options.sessionId ?? undefined
      : options.pathname
      ? getSessionIdFromPath(options.pathname)
      : undefined;
  const sessionId = routeId ?? sessionApi.lastActiveChatId ?? "new";
  const chatId = resolveBackendChatId(routeId);
  const projectDirOverride = chatId
    ? undefined
    : getPendingProjectDirectory(options.selectedAgent, sessionId) ?? undefined;
  return {
    sessionId,
    ...(chatId ? { chatId } : {}),
    ...(projectDirOverride ? { projectDirOverride } : {}),
  };
}
