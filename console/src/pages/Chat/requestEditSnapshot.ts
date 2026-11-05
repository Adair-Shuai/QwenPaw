import type { QueueAttachment } from "../../stores/messageQueueStore";
import { extractClientMessageId } from "../../utils/clientMessageId";
import type { AgentMentionModesSnapshot } from "./components/agentMentionModes";

export interface RequestEditSnapshot {
  text: string;
  attachments: QueueAttachment[];
  unsupported: boolean;
  mentionModes?: AgentMentionModesSnapshot;
}

type RecordValue = Record<string, unknown>;
const mentionKey = "qwenpaw_agent_mention_dispatch";
const record = (value: unknown): RecordValue | undefined =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : undefined;
const string = (...values: unknown[]): string | undefined =>
  values.find(
    (value): value is string => typeof value === "string" && !!value.trim(),
  );

/** Match one request frame for inline editing; never a new submission ID.
 * ID-less messages deliberately use object identity, not text or timestamps.
 */
export function createRequestEditKeyResolver(): (
  data: unknown,
) => string | object {
  const opaqueKeys = new WeakMap<object, object>();
  return (data) => {
    const root = record(data);
    const firstUser = Array.isArray(root?.input)
      ? root.input.map(record).find((message) => message?.role === "user")
      : undefined;
    const metadata = record(firstUser?.metadata);
    const clientId = string(extractClientMessageId(metadata));
    if (clientId) return `cid:${clientId}`;
    const originalId = string(
      metadata?.original_id,
      record(metadata?.metadata)?.original_id,
    );
    if (originalId) return `original:${originalId}`;
    if (
      (typeof data === "object" && data !== null) ||
      typeof data === "function"
    ) {
      const object = data as object;
      let key = opaqueKeys.get(object);
      if (!key) {
        key = Object.freeze({});
        opaqueKeys.set(object, key);
      }
      return key;
    }
    // Invalid/non-request primitives have no persistent message identity.
    return Object.freeze({});
  };
}

function reference(value: unknown): string | undefined {
  const url = string(value, record(value)?.url);
  if (!url || /^(?:javascript|vbscript):/i.test(url.trim())) return undefined;
  return url;
}

function mediaType(part: RecordValue): string | undefined {
  const mime = string(
    part.mime_type,
    part.mimeType,
    part.media_type,
    part.content_type,
  );
  return mime && /^[\w!#$&^.+-]+\/[\w!#$&^.+*-]+$/.test(mime)
    ? mime
    : undefined;
}

function attachment(part: RecordValue): QueueAttachment | undefined {
  const type = part.type;
  let url: string | undefined;
  let mime = mediaType(part);
  if (type === "image" || type === "image_url") {
    url = reference(part.image_url);
    mime = mime?.startsWith("image/") ? mime : "image/*";
  } else if (type === "video") {
    url = reference(part.video_url);
    mime = mime?.startsWith("video/") ? mime : "video/*";
  } else if (type === "audio") {
    url = reference(part.audio_url) || reference(part.data);
    const format = string(part.format);
    // The native builder derives `format` from fileList.type. A URL alone
    // cannot recover an absent format, and raw audio bytes are not URLs.
    if (format && /^[\w.+-]+$/.test(format)) mime = `audio/${format}`;
    else if (!mime?.startsWith("audio/") || mime === "audio/*")
      return undefined;
    if (
      url &&
      url === part.data &&
      !/^(?:[a-z][a-z\d+.-]*:|\/|\.\.?\/)/i.test(url)
    )
      return undefined;
  } else if (type === "file") {
    url = reference(part.file_url);
    // Native fileList uses MIME to choose the content category. A file block
    // declaring a media MIME cannot be replayed as a file through that API.
    if (mime && /^(?:image|video|audio)\//.test(mime)) return undefined;
  } else return undefined;
  if (!url) return undefined;
  const name = string(part.file_name, part.filename, part.fileName, part.name);
  const rawSize = part.file_size ?? part.size;
  const size =
    typeof rawSize === "number" && Number.isFinite(rawSize) && rawSize >= 0
      ? rawSize
      : undefined;
  return {
    url,
    ...(name ? { name } : {}),
    ...(mime ? { type: mime } : {}),
    ...(size !== undefined ? { size } : {}),
  };
}

function mentionModes(
  metadata: unknown,
): AgentMentionModesSnapshot | undefined {
  const root = record(metadata);
  if (!root || !Object.prototype.hasOwnProperty.call(root, mentionKey))
    return undefined;
  const dispatch = record(root[mentionKey]);
  if (!dispatch || !Object.prototype.hasOwnProperty.call(dispatch, "modes"))
    return undefined;
  const modes = record(dispatch.modes);
  if (!modes) return undefined;
  const entries = Object.entries(modes).filter(
    ([id, mode]) =>
      /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/.test(id) &&
      !["__proto__", "constructor", "prototype"].includes(id) &&
      (mode === "delegate" || mode === "collaborate"),
  );
  return entries.length
    ? (Object.freeze(Object.fromEntries(entries)) as AgentMentionModesSnapshot)
    : undefined;
}

/** Copy editable user content only; no original request identity or controls.
 * Unknown content is explicit so the caller cannot silently resend a subset.
 */
export function getRequestEditSnapshot(
  data: unknown,
): RequestEditSnapshot | undefined {
  const root = record(data);
  if (!root || !Array.isArray(root.input)) return undefined;
  const users = root.input
    .map(record)
    .filter((message) => message?.role === "user");
  if (!users.length) return undefined;
  const text: string[] = [];
  const attachments: QueueAttachment[] = [];
  let unsupported = false;
  for (const message of users) {
    const content = message!.content;
    if (typeof content === "string") {
      text.push(content);
      continue;
    }
    if (!Array.isArray(content)) {
      unsupported = true;
      continue;
    }
    for (const raw of content) {
      const part = record(raw);
      if (part?.type === "text" && typeof part.text === "string")
        text.push(part.text);
      else {
        const copied = part && attachment(part);
        if (copied) attachments.push(copied);
        else unsupported = true;
      }
    }
  }
  const modes = mentionModes(root.metadata) ?? mentionModes(users[0]!.metadata);
  return {
    text: text.join("\n"),
    attachments,
    unsupported,
    ...(modes ? { mentionModes: modes } : {}),
  };
}
