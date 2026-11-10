import { request } from "../request";

export interface ChatContextSource {
  id: string;
  kind: "conversation" | "file" | "quote" | "system" | "summary" | "memory";
  label: string;
  provenance: "model_request" | "saved_session";
  content?: string | null;
  message_id?: string | null;
  path?: string | null;
  truncated: boolean;
}

export interface ChatContextSnapshot {
  agent_id: string;
  chat_id: string;
  session_id: string;
  user_id: string;
  channel: string;
  status: "empty" | "saved";
  snapshot: {
    id: string;
    captured_at: string | null;
    basis: "model_request" | "saved_session";
    message_count: number | null;
    tool_count: number | null;
  } | null;
  sources: ChatContextSource[];
  summary: {
    kind: "native" | "scroll" | "none";
    content: string;
    stale: boolean;
    truncated?: boolean;
  };
  limitations: string[];
}

export const chatContextApi = {
  get: (
    chatId: string,
    agentId: string,
    options: {
      sessionId?: string;
      userId?: string;
      signal?: AbortSignal;
    } = {},
  ) => {
    const params = new URLSearchParams();
    if (options.sessionId) params.set("expected_session_id", options.sessionId);
    if (options.userId) params.set("expected_user_id", options.userId);
    return request<ChatContextSnapshot>(
      `/chats/${encodeURIComponent(chatId)}/context${
        params.size ? `?${params}` : ""
      }`,
      { headers: { "X-Agent-Id": agentId }, signal: options.signal },
    );
  },
};
