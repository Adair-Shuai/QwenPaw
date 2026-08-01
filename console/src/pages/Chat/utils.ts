// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
import { chatApi } from "../../api/modules/chat";
export type CopyableContent = {
  type?: string;
  text?: string;
  refusal?: string;
  /** Thinking / reasoning content (Anthropic-style content blocks) */
  thinking?: string;
  /** Reasoning content (OpenAI Response API style) */
  reasoning?: string;
  /** OpenAI Chat Completions reasoning_content field */
  reasoning_content?: string;
};

export type CopyableMessage = {
  role?: string;
  /** AgentScope message type: "message" (reply) | "reasoning" (thinking) | tool types */
  type?: string;
  content?: string | CopyableContent[];
};

export type CopyableResponse = {
  output?: CopyableMessage[];
};

export type RuntimeLoadingBridgeApi = {
  getLoading?: () => boolean | string;
  setLoading?: (loading: boolean | string) => void;
};

// ---------------------------------------------------------------------------
// Text extraction utilities
// ---------------------------------------------------------------------------

/** Extract copyable text from assistant response. */
export function extractCopyableText(response: CopyableResponse): string {
  const collectText = (assistantOnly: boolean) => {
    const chunks = (response.output || []).flatMap((item: CopyableMessage) => {
      if (assistantOnly && item.role !== "assistant") return [];

      if (typeof item.content === "string") {
        return [item.content];
      }

      if (!Array.isArray(item.content)) {
        return [];
      }

      return item.content.flatMap((content: CopyableContent) => {
        if (content.type === "text" && typeof content.text === "string") {
          return [content.text];
        }

        if (content.type === "refusal" && typeof content.refusal === "string") {
          return [content.refusal];
        }

        return [];
      });
    });

    return chunks.filter(Boolean).join("\n\n").trim();
  };

  return collectText(true) || JSON.stringify(response);
}

// ---------------------------------------------------------------------------
// Workspace markdown builder — separates thinking from reply
// ---------------------------------------------------------------------------

/**
 * Build a well-structured markdown document from an assistant response,
 * separating "thinking" (reasoning) messages from "reply" (text) messages.
 *
 * In the AgentScope runtime, reasoning content is a **message-level** type:
 * messages with `type: "reasoning"` contain the thinking text, while
 * messages with `type: "message"` contain the reply text. Both use
 * regular `{ type: "text", text: "..." }` content blocks.
 *
 * The output **strictly preserves the original message order**. Consecutive
 * messages of the same type are merged into one section; each section is
 * separated by a horizontal rule. Thinking sections are wrapped in a
 * blockquote for visual distinction:
 *
 * ```markdown
 * > 💭 thinking content...
 *
 * ---
 *
 * reply content...
 *
 * ---
 *
 * > 💭 more thinking...
 *
 * ---
 *
 * more reply...
 * ```
 *
 * If no thinking blocks are present, only the reply text is returned
 * (no blockquotes or separators).
 * If no content is found at all, falls back to {@link extractCopyableText}.
 */
export function buildWorkspaceMarkdown(response: CopyableResponse): string {
  // Collect ordered segments: each is { reasoning: boolean, text: string }
  const segments: { reasoning: boolean; text: string }[] = [];

  for (const msg of response.output || []) {
    if (msg.role && msg.role !== "assistant") continue;

    // Determine whether this message is thinking or reply based on the
    // message-level `type` field.  The AgentScope runtime sets
    // `type: "reasoning"` for thinking and `type: "message"` for reply.
    // Messages without a type are treated as reply (backward-compatible).
    const msgType = (msg.type || "").toLowerCase();
    const isReasoning =
      msgType === "reasoning" || msgType === "thinking";

    // String content
    if (typeof msg.content === "string") {
      const trimmed = msg.content.trim();
      if (trimmed) {
        segments.push({ reasoning: isReasoning, text: trimmed });
      }
      continue;
    }

    if (!Array.isArray(msg.content)) continue;

    // Extract text from content blocks — both reasoning and message types
    // use regular { type: "text", text: "..." } content blocks.
    const parts: string[] = [];
    for (const block of msg.content) {
      const blockType = (block.type || "").toLowerCase();

      // Text blocks
      if (blockType === "text" && typeof block.text === "string") {
        if (block.text.trim()) parts.push(block.text.trim());
        continue;
      }

      // Refusal blocks → always reply text
      if (
        blockType === "refusal" &&
        typeof block.refusal === "string"
      ) {
        if (block.refusal.trim()) parts.push(block.refusal.trim());
        continue;
      }

      // Fallback: some edge-case providers may put thinking text directly
      // in a content block with type "thinking"/"reasoning" instead of
      // using the message-level type.
      if (blockType === "thinking" || blockType === "reasoning") {
        const thinkingText =
          block.thinking || block.reasoning || block.reasoning_content || "";
        if (typeof thinkingText === "string" && thinkingText.trim()) {
          segments.push({ reasoning: true, text: thinkingText.trim() });
        }
      }
    }

    if (parts.length > 0) {
      segments.push({ reasoning: isReasoning, text: parts.join("\n\n") });
    }
  }

  // If we found nothing at all, fall back to extractCopyableText
  if (segments.length === 0) {
    return extractCopyableText(response);
  }

  // Merge consecutive segments of the same type
  const merged: { reasoning: boolean; text: string }[] = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (last && last.reasoning === seg.reasoning) {
      last.text += "\n\n" + seg.text;
    } else {
      merged.push({ ...seg });
    }
  }

  // If all segments are reply (no thinking), just join with double newlines
  const hasThinking = merged.some((s) => s.reasoning);
  if (!hasThinking) {
    return merged.map((s) => s.text).join("\n\n").trim();
  }

  // Build sections preserving original order
  const sections: string[] = [];
  for (const seg of merged) {
    if (seg.reasoning) {
      // Wrap thinking text in a blockquote with 💭 marker on first line
      const lines = seg.text.split("\n");
      const blockquoted = lines
        .map((line, i) => (i === 0 ? `> 💭 ${line}` : `> ${line}`))
        .join("\n");
      sections.push(blockquoted);
    } else {
      sections.push(seg.text);
    }
  }

  return sections.join("\n\n---\n\n").trim();
}

/** Extract plain text from user message content. */
export function extractUserMessageText(m: any): string {
  if (typeof m.content === "string") return m.content;
  if (!Array.isArray(m.content)) return "";
  return m.content
    .filter((p: any) => p.type === "text")
    .map((p: any) => p.text || "")
    .join("\n");
}

export function extractTextFromMessage(msg: any): string {
  const innerMessage = msg?.cards?.[0]?.data?.input?.[0];
  if (!innerMessage) return "";
  return extractUserMessageText(innerMessage);
}

// ---------------------------------------------------------------------------
// Clipboard utilities
// ---------------------------------------------------------------------------

export { copyText } from "../../utils/clipboard";

// ---------------------------------------------------------------------------
// Timestamp formatting utilities
// ---------------------------------------------------------------------------

/** Format a unix timestamp (seconds or milliseconds) to a short time string (HH:mm:ss). */
export function formatMessageTime(ts: number): string {
  if (!ts) return "";
  // Normalize to milliseconds
  const ms = ts < 1e12 ? ts * 1000 : ts;
  const date = new Date(ms);
  const now = new Date();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const time = `${hours}:${minutes}:${seconds}`;

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (isToday) return time;

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  if (date.getFullYear() === now.getFullYear()) {
    return `${month}-${day} ${time}`;
  }
  return `${date.getFullYear()}-${month}-${day} ${time}`;
}

// ---------------------------------------------------------------------------
// Error response utilities
// ---------------------------------------------------------------------------

/** Build a 400 error response when model is not configured. */
export function buildModelError(): Response {
  return new Response(
    JSON.stringify({
      error: "Model not configured",
      message: "Please configure a model first",
    }),
    { status: 400, headers: { "Content-Type": "application/json" } },
  );
}

// ---------------------------------------------------------------------------
// URL normalization utilities
// ---------------------------------------------------------------------------

/** Decode each path segment; keeps `/` delimiters (including repeated `/`). */
function decodeUriPathSegments(path: string): string {
  return path
    .split("/")
    .map((segment) => {
      if (!segment) return segment;
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");
}

/** Convert file URL to stored path for backend: keep full path after `/files/preview/`. */
export function toStoredName(v: string): string {
  const marker = "/files/preview/";
  const idx = v.indexOf(marker);
  if (idx !== -1) {
    let rest = v.slice(idx + marker.length);
    const q = rest.indexOf("?");
    if (q !== -1) rest = rest.slice(0, q);
    const h = rest.indexOf("#");
    if (h !== -1) rest = rest.slice(0, h);
    if (rest) {
      const decoded = decodeUriPathSegments(rest);
      // Windows absolute path: C:\... or C:/...
      const isWindowsAbsolute = /^[a-zA-Z]:[\\/]/.test(decoded);
      if (isWindowsAbsolute) return decoded;
      return decoded.startsWith("/") ? decoded : `/${decoded}`;
    }
  }
  return v;
}

/** Convert content part URLs to stored name format. */
export function normalizeContentUrls(part: any): any {
  const p = { ...part };
  if (p.type === "image" && typeof p.image_url === "string")
    p.image_url = toStoredName(p.image_url);
  if (p.type === "file" && typeof p.file_url === "string")
    p.file_url = toStoredName(p.file_url);
  if (p.type === "audio" && typeof p.data === "string")
    p.data = toStoredName(p.data);
  if (p.type === "video" && typeof p.video_url === "string")
    p.video_url = toStoredName(p.video_url);
  return p;
}

/** Turn a backend content URL (path or full URL) into a full URL for display. */
export function toDisplayUrl(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // filePreviewUrl handles file:// URLs and absolute/relative paths.
  return chatApi.filePreviewUrl(url);
}

// ---------------------------------------------------------------------------
// DOM utilities
// ---------------------------------------------------------------------------

/** Set textarea value and trigger input event for React state sync.
 * Uses native value setter to bypass React's internal value tracker.
 */
export function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const nativeValueSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  if (nativeValueSetter) {
    nativeValueSetter.call(textarea, value);
  } else {
    textarea.value = value;
  }
  textarea.selectionStart = textarea.selectionEnd = value.length;
  const event = new Event("input", { bubbles: true });
  textarea.dispatchEvent(event);
}
