import { request } from "../../api/request";
import type { ChatSpec, ChatHistory } from "../../api/types";
import type { TurnFilesResponse } from "../../api/modules/turnFiles";

export type SearchKind = "all" | "chat" | "message" | "file" | "artifact";
export interface SearchResult {
  key: string;
  kind: Exclude<SearchKind, "all">;
  chatId: string;
  agentId: string;
  title: string;
  text: string;
  chatName: string;
  timestamp: string;
  messageId?: string;
  role?: "user" | "assistant";
  archived: boolean;
}
export interface SearchSnapshot {
  results: SearchResult[];
  scanned: number;
  total: number;
  failed: number;
  limited: boolean;
}
export const textContent = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value
    .filter((v) => v?.type === "text" && typeof v.text === "string")
    .map((v) => v.text)
    .join("\n");
};
export function excerpt(text: string, query: string, length = 260): string {
  const match = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  const start = Math.max(0, match - 70);
  return `${start ? "…" : ""}${text.slice(start, start + length)}${
    text.length > start + length ? "…" : ""
  }`;
}

/** Read-only, bounded, cancellable search. Every request freezes agent ownership. */
export async function searchWorkspace(options: {
  query: string;
  agentId: string;
  kind: SearchKind;
  archived: boolean;
  days: number;
  limit: number;
  signal: AbortSignal;
  onProgress: (snapshot: SearchSnapshot) => void;
}): Promise<void> {
  const { signal, agentId, kind } = options;
  const headers = { "X-Agent-Id": agentId };
  const query = options.query.trim().toLocaleLowerCase();
  const matches = (text: string) => text.toLocaleLowerCase().includes(query);
  const state: SearchSnapshot = {
    results: [],
    scanned: 0,
    total: 0,
    failed: 0,
    limited: false,
  };
  const publish = () => {
    if (!signal.aborted)
      options.onProgress({ ...state, results: [...state.results] });
  };
  const chats = await request<ChatSpec[]>(
    `/chats?include_app_owned=false${
      options.archived ? "" : "&archived=false"
    }`,
    { headers, signal },
  );
  if (signal.aborted) return;
  const since = options.days ? Date.now() - options.days * 86400000 : 0;
  const eligible = chats
    .filter(
      (c) =>
        c.id &&
        (!since || Date.parse(c.updated_at || c.created_at || "") >= since),
    )
    .sort((a, b) =>
      (b.updated_at || b.created_at || "").localeCompare(
        a.updated_at || a.created_at || "",
      ),
    );
  state.total = eligible.length;
  const push = (value: SearchResult) => {
    if (state.results.length < 500) state.results.push(value);
    else state.limited = true;
  };
  const base = (chat: ChatSpec) => ({
    chatId: chat.id,
    agentId,
    chatName: chat.name || chat.id,
    timestamp: chat.updated_at || chat.created_at || "",
    archived: !!(chat.archived || chat.archived_at),
  });
  if (kind === "all" || kind === "chat") {
    for (const chat of eligible)
      if (matches(chat.name || chat.id)) {
        push({
          ...base(chat),
          key: `chat:${chat.id}`,
          kind: "chat",
          title: chat.name || chat.id,
          text: "",
        });
      }
  }
  if ((!query && kind === "all") || kind === "chat") {
    state.scanned = eligible.length;
    publish();
    return;
  }
  const batch = eligible.slice(0, options.limit);
  state.limited = state.limited || batch.length < eligible.length;
  publish();
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      while (cursor < batch.length && !signal.aborted) {
        const chat = batch[cursor++];
        if (kind === "all" || kind === "message") {
          try {
            const history = await request<ChatHistory>(
              `/chats/${encodeURIComponent(chat.id)}?include_app_owned=false`,
              { headers, signal },
            );
            for (const [index, msg] of Array.from(
              (history.messages || []).entries(),
            ).reverse()) {
              if (msg.role !== "user" && msg.role !== "assistant") continue;
              const text = textContent(msg.content);
              if (text && matches(text))
                push({
                  ...base(chat),
                  key: `message:${chat.id}:${index}`,
                  kind: "message",
                  title: excerpt(text, query, 240),
                  role: msg.role,
                  text: excerpt(text, query, 4000),
                  messageId: typeof msg.id === "string" ? msg.id : undefined,
                });
            }
          } catch {
            if (signal.aborted) return;
            state.failed++;
          }
        }
        if (kind === "all" || kind === "file" || kind === "artifact") {
          try {
            const params = new URLSearchParams({
              session_id: chat.session_id,
              chat_id: chat.id,
              limit: "100",
            });
            const page = await request<TurnFilesResponse>(
              `/agents/${encodeURIComponent(
                agentId,
              )}/workspace/turn-files?${params}`,
              { headers, signal },
            );
            if (page.has_more) state.limited = true;
            for (const turn of page.turns)
              for (const file of turn.files) {
                const fileKind = file.delivered ? "artifact" : "file";
                if (kind !== "all" && kind !== fileKind) continue;
                if (!matches(`${file.name}\n${file.path}`)) continue;
                push({
                  ...base(chat),
                  key: `file:${chat.id}:${turn.id}:${file.id}`,
                  kind: fileKind,
                  title: file.name,
                  text: file.path,
                  timestamp: turn.finished_at || turn.started_at,
                  messageId: turn.response_id,
                });
              }
          } catch {
            if (signal.aborted) return;
            state.failed++;
          }
        }
        state.scanned++;
        publish();
      }
    }),
  );
}
