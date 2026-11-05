import { create } from "zustand";
import {
  createClientMessageId,
  extractClientMessageId,
} from "../utils/clientMessageId";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QueueItemStatus =
  | "pending"
  | "sending"
  | "steering"
  | "failed"
  | "sent";

export type QueueRunState = "idle" | "running" | "paused" | "error";

/** Attachment reference (URL only, binary not stored in queue) */
export interface QueueAttachment {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}

/** Image reference */
export interface QueueImage {
  url: string;
  thumbUrl?: string;
}

/** Mention reference */
export interface QueueMention {
  id: string;
  name: string;
}

export interface QueueAgentDispatch {
  requestText: string;
  targetAgentId?: string;
  coordinationRequested: boolean;
}

/** Quote reference */
export interface QueueQuote {
  messageId: string;
  text: string;
}

/** Full message body for a queued item (Phase 3 ready) */
export interface QueueItem {
  id: string;
  clientMessageId?: string;
  text: string;
  attachments?: QueueAttachment[];
  images?: QueueImage[];
  mentions?: QueueMention[];
  agentMentionModes?: Record<string, "delegate" | "collaborate">;
  agentDispatch?: QueueAgentDispatch;
  quote?: QueueQuote;
  /** Agent ID captured at enqueue time to prevent cross-agent delivery */
  agentId?: string;
  /** Backend session_id captured at enqueue time so background sender uses
   *  the correct session even after agent switch clears the session list. */
  backendSessionId?: string;
  userId?: string;
  channel?: string;
  requestContext?: Record<string, unknown>;
  bizParams?: Record<string, unknown>;
  /** Unresolved delivery to a specific running turn. Only its receipt may
   * release this claim; ordinary retries must never send it a second time. */
  steering?: { requestId: string; runId: string };
  status: QueueItemStatus;
  retryCount: number;
  errorMessage?: string;
  createdAt: number;
}

/** Data required to enqueue a new item */
export interface QueueItemInput {
  text: string;
  attachments?: QueueAttachment[];
  images?: QueueImage[];
  mentions?: QueueMention[];
  agentMentionModes?: Record<string, "delegate" | "collaborate">;
  agentDispatch?: QueueAgentDispatch;
  quote?: QueueQuote;
  /** Agent identity captured by the caller before any async admission check. */
  agentId?: string;
  /** Authoritative backend session_id captured by the caller. */
  backendSessionId?: string;
  userId?: string;
  channel?: string;
  requestContext?: Record<string, unknown>;
  bizParams?: Record<string, unknown>;
}

/** Chat UUIDs are globally unique. Drafts have no UUID and must be Agent-scoped.
 * These keys belong only to storage/locks; never send them to the Chat API. */
export function getQueueKey(agentId: string, chatId?: string | null): string {
  return !chatId || chatId === "new"
    ? `draft:${encodeURIComponent(agentId || "default")}`
    : chatId;
}

export function isDraftQueueKey(key: string): boolean {
  return key === "new" || key.startsWith("draft:") || key.startsWith("new:");
}

/** Locate an item after a `new` queue has migrated to its backend chat id. */
export function findQueueItemSessionId(
  queues: Record<string, QueueItem[]>,
  itemId: string,
  preferredSessionId?: string,
): string | undefined {
  if (
    preferredSessionId &&
    queues[preferredSessionId]?.some((item) => item.id === itemId)
  ) {
    return preferredSessionId;
  }
  return Object.entries(queues).find(([, items]) =>
    items.some((item) => item.id === itemId),
  )?.[0];
}

/**
 * Return the session that most recently received a queued item for an agent.
 *
 * Queue state is synchronized across tabs, so it is the authoritative host
 * signal when another tab is actively working in an agent session. Legacy
 * queue items without an agentId belong to the default agent.
 */
export function getLatestQueuedSessionIdForAgent(
  queues: Record<string, QueueItem[]>,
  agentId: string,
): string | undefined {
  let latestSessionId: string | undefined;
  let latestCreatedAt = Number.NEGATIVE_INFINITY;

  for (const [sessionId, items] of Object.entries(queues)) {
    if (isDraftQueueKey(sessionId)) continue;
    for (const item of items) {
      if ((item.agentId ?? "default") !== agentId) continue;
      if (item.createdAt <= latestCreatedAt) continue;
      latestCreatedAt = item.createdAt;
      latestSessionId = sessionId;
    }
  }

  return latestSessionId;
}

// ---------------------------------------------------------------------------
// Storage helpers (localStorage; persists across browser close, sent items
// removed eagerly via remove())
// ---------------------------------------------------------------------------

export const STORAGE_PREFIX = "qwenpaw:message-queue:";

/** Shape persisted in localStorage per session */
interface PersistedQueue {
  items: QueueItem[];
  runState: QueueRunState;
}

export function getStorageKey(sessionId: string): string {
  return `${STORAGE_PREFIX}${sessionId}`;
}

/** Read main's business-parameter snapshots through the SDK 1.2 queue shape. */
function restoreQueueIdentity(item: QueueItem): QueueItem {
  const params = item.bizParams;
  if (!params) return item;
  const text = (value: unknown): string | undefined =>
    typeof value === "string" && value ? value : undefined;
  return {
    ...item,
    backendSessionId: item.backendSessionId || text(params.session_id),
    userId: item.userId || text(params.user_id),
    channel: item.channel || text(params.channel),
    requestContext:
      item.requestContext ||
      (params.request_context && typeof params.request_context === "object"
        ? (params.request_context as Record<string, unknown>)
        : undefined),
  };
}

function readQueueFromStorage(sessionId: string): PersistedQueue | null {
  try {
    const key = getStorageKey(sessionId);
    let saved = localStorage.getItem(key);
    // One-time migration from sessionStorage (older builds used sessionStorage)
    if (!saved) {
      try {
        const legacy = sessionStorage.getItem(key);
        if (legacy) {
          localStorage.setItem(key, legacy);
          sessionStorage.removeItem(key);
          saved = legacy;
        }
      } catch {
        // ignore
      }
    }
    if (saved) {
      const parsed = JSON.parse(saved);
      // Backward compat: old format was QueueItem[]
      if (Array.isArray(parsed)) {
        return { items: parsed as QueueItem[], runState: "idle" };
      }
      return {
        ...parsed,
        items: parsed.items.map(restoreQueueIdentity),
      } as PersistedQueue;
    }
  } catch {
    // ignore
  }
  return null;
}

const STEERING_CLAIMS_PREFIX = "qwenpaw:queue-steering-claims:";

/** Keep once-steered item identities after application removes their queue row.
 * A delayed pre-claim pending snapshot must not resurrect a delivered message. */
function readSteeringClaims(
  sessionId: string,
): Record<string, string> | undefined {
  try {
    const raw = localStorage.getItem(`${STEERING_CLAIMS_PREFIX}${sessionId}`);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      Object.values(parsed).some((value) => typeof value !== "string")
    )
      return undefined;
    return parsed as Record<string, string>;
  } catch {
    return undefined;
  }
}

/** Once a queue has steering receipts, item and run-state snapshots must
 * agree. Sources persist before broadcasting, so the stored state also orders
 * a user's explicit retry/resume after an older remote pause/error event. */
function readSteeringRunState(sessionId: string): QueueRunState | undefined {
  const claims = readSteeringClaims(sessionId);
  if (!claims || Object.keys(claims).length === 0) return undefined;
  const runState = readQueueFromStorage(sessionId)?.runState;
  return ["idle", "running", "paused", "error"].includes(runState ?? "")
    ? runState
    : undefined;
}

function preserveSteeringRunStates(
  sessionId: string,
  runStates: Record<string, QueueRunState>,
): Record<string, QueueRunState> {
  const authoritative = readSteeringRunState(sessionId);
  return authoritative !== undefined && authoritative !== runStates[sessionId]
    ? { ...runStates, [sessionId]: authoritative }
    : runStates;
}

function writeSteeringClaim(
  sessionId: string,
  id: string,
  requestId: string,
): boolean {
  const claims = readSteeringClaims(sessionId);
  if (!claims) return false;
  try {
    localStorage.setItem(
      `${STEERING_CLAIMS_PREFIX}${sessionId}`,
      JSON.stringify({ ...claims, [id]: requestId }),
    );
    return true;
  } catch {
    return false;
  }
}

/** Undefined means storage cannot be read; [] means it confirms no queue. */
function readAuthoritativeQueueItems(
  sessionId: string,
): QueueItem[] | undefined {
  const saved = readQueueFromStorage(sessionId);
  if (saved) return saved.items;
  try {
    if (localStorage.getItem(getStorageKey(sessionId)) === null) return [];
  } catch {
    // Storage is unavailable; do not infer a terminal receipt from its absence.
  }
  return undefined;
}

/** Canonicalize once-steered rows before public mutations or remote updates.
 * Persisted queue state wins over delayed pending/steering snapshots, including
 * after a receipt returned an item, a retry began, or application removed it. */
function preserveStoredSteering(
  sessionId: string,
  current: QueueItem[],
): QueueItem[] {
  const saved = readAuthoritativeQueueItems(sessionId);
  if (!saved) return current;
  const claims = readSteeringClaims(sessionId) ?? {};
  if (
    !saved.some((item) => item.status === "steering") &&
    !current.some((item) => item.status === "steering" || claims[item.id])
  )
    return current;
  const canonical = new Map(saved.map((item) => [item.id, item]));
  const items = current.flatMap((item) => {
    if (!claims[item.id] && item.status !== "steering") return [item];
    const latest = canonical.get(item.id);
    return latest ? [latest] : [];
  });
  saved.forEach((item, savedIndex) => {
    if (item.status !== "steering") return;
    const index = items.findIndex((candidate) => candidate.id === item.id);
    if (index >= 0) items[index] = item;
    else items.splice(Math.min(savedIndex, items.length), 0, item);
  });
  return items;
}

function writeQueueToStorage(
  sessionId: string,
  items: QueueItem[],
  runState: QueueRunState,
): boolean {
  try {
    if (items.length > 0) {
      localStorage.setItem(
        getStorageKey(sessionId),
        JSON.stringify({ items, runState }),
      );
    } else {
      localStorage.removeItem(getStorageKey(sessionId));
    }
    return true;
  } catch {
    return false;
  }
}

export function removeQueueFromStorage(sessionId: string) {
  if (
    readQueueFromStorage(sessionId)?.items.some(
      (item) => item.status === "steering",
    )
  )
    return;
  // Keep the claim journal: late cross-tab snapshots can outlive queue removal.
  try {
    localStorage.removeItem(getStorageKey(sessionId));
  } catch {
    // ignore
  }
  // Also clean any legacy sessionStorage entry
  try {
    sessionStorage.removeItem(getStorageKey(sessionId));
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------

let _nextQueueId = 0;
export function nextQueueId(): string {
  return "mq-" + Date.now().toString(36) + "-" + (++_nextQueueId).toString(36);
}

// ---------------------------------------------------------------------------
// Cross-tab synchronization
// ---------------------------------------------------------------------------

type BroadcastPayload = {
  type:
    | "enqueue"
    | "remove"
    | "edit"
    | "reorder"
    | "clear"
    | "setItemStatus"
    | "migrate"
    | "runState";
  sessionId: string;
  items?: QueueItem[];
  runState?: QueueRunState;
  // For migrate: target session id (sessionId is the source)
  toSessionId?: string;
  sourceItems?: QueueItem[];
};

let _channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (_channel) return _channel;
  if (typeof BroadcastChannel === "undefined") return null;
  try {
    _channel = new BroadcastChannel("qwenpaw:queue");
  } catch {
    _channel = null;
  }
  return _channel;
}

function broadcast(payload: BroadcastPayload) {
  const ch = getChannel();
  if (ch) {
    try {
      ch.postMessage(payload);
    } catch {
      // ignore
    }
  }
}

// ---------------------------------------------------------------------------
// Send lock (Web Locks API). Ensures only one tab actively sends per session.
// ---------------------------------------------------------------------------

type LockLike = { request: (...args: unknown[]) => Promise<unknown> };

function getLockManager(): LockLike | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & { locks?: LockLike };
  return nav.locks ?? null;
}

export async function withSendLock<T>(
  sessionId: string,
  fn: () => Promise<T> | T,
  options?: { wait?: boolean },
): Promise<T | null> {
  const locks = getLockManager();
  if (!locks) {
    // Environment doesn't support Web Locks: degrade to direct execution
    return await fn();
  }
  try {
    const result = (await locks.request(
      `qwenpaw:queue-send:${sessionId}`,
      options?.wait ? { mode: "exclusive" } : { ifAvailable: true },
      async (lock: unknown) => {
        if (!lock) return null;
        return await fn();
      },
    )) as T | null;
    return result;
  } catch {
    return null;
  }
}

/**
 * Run a background queue sender only when no mounted foreground tab owns the
 * conversation. Unlike `holdOwnershipLock`, this never waits: a missing lock
 * means the foreground owner is responsible for consuming the queue and
 * rendering its stream.
 */
export async function withAvailableOwnershipLock<T>(
  sessionId: string,
  fn: () => Promise<T> | T,
  abortSignal?: AbortSignal,
): Promise<T | null> {
  if (abortSignal?.aborted) return null;
  const locks = getLockManager();
  if (!locks) {
    return await fn();
  }
  try {
    const result = (await locks.request(
      `qwenpaw:queue-owner:${sessionId}`,
      { mode: "exclusive", ifAvailable: true },
      async (lock: unknown) => {
        if (!lock || abortSignal?.aborted) return null;
        return await fn();
      },
    )) as T | null;
    return result;
  } catch {
    return null;
  }
}

/** Acquire both the foreground ownership gate and the short-lived send lock. */
export function withBackgroundSendLock<T>(
  sessionId: string,
  fn: () => Promise<T> | T,
  abortSignal?: AbortSignal,
): Promise<T | null> {
  return withAvailableOwnershipLock(
    sessionId,
    () => withSendLock(sessionId, fn),
    abortSignal,
  );
}

/**
 * Hold a persistent exclusive ownership lock for a conversation. Only one
 * tab in the entire browser holds this lock at any time per session id.
 *
 * - Resolves `onAcquired()` when the lock is granted (this tab becomes the
 *   owner / active sender).
 * - Holds the lock until `abortSignal` is aborted (e.g. on component unmount
 *   or when the queueSessionId changes).
 * - Other tabs requesting the same lock will wait; when the current owner
 *   releases (page closed, navigated away, signal aborted), one of the
 *   waiters automatically becomes the new owner.
 * - Falls back to immediate ownership when Web Locks are unavailable, so
 *   single-tab functionality is preserved.
 */
export function holdOwnershipLock(
  sessionId: string,
  onAcquired: () => void,
  abortSignal: AbortSignal,
): Promise<void> {
  const locks = getLockManager();
  if (!locks) {
    onAcquired();
    return Promise.resolve();
  }
  return locks
    .request(
      `qwenpaw:queue-owner:${sessionId}`,
      { mode: "exclusive", signal: abortSignal },
      async (lock: unknown) => {
        if (!lock) return;
        if (abortSignal.aborted) return;
        onAcquired();
        // Hold the lock until the caller aborts.
        await new Promise<void>((resolve) => {
          if (abortSignal.aborted) {
            resolve();
            return;
          }
          abortSignal.addEventListener("abort", () => resolve(), {
            once: true,
          });
        });
      },
    )
    .then(() => undefined)
    .catch(() => undefined);
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface MessageQueueStore {
  /** All session queues: sessionId -> items */
  queues: Record<string, QueueItem[]>;
  /** Per-session run state: sessionId -> QueueRunState (replaces global runState) */
  runStates: Record<string, QueueRunState>;
  /** Currently sending item ID */
  currentSendingId: string | null;
  /**
   * Marks the most recent migrate target. The Chat page uses this to skip
   * loadFromStorage right after a migration (the in-memory state is already
   * authoritative).
   */
  lastMigratedTo: string | null;

  // Actions
  enqueue: (sessionId: string, input: QueueItemInput) => void;
  remove: (sessionId: string, id: string) => void;
  edit: (
    sessionId: string,
    id: string,
    text: string,
    agentMentionModes?: Record<string, "delegate" | "collaborate">,
    agentDispatch?: QueueAgentDispatch,
    requestContext?: Record<string, unknown>,
  ) => void;
  reorder: (sessionId: string, items: QueueItem[]) => void;
  clear: (sessionId: string) => void;
  /** Move all items from one session id to another (and clear the source). */
  migrateQueue: (
    fromSessionId: string,
    toSessionId: string,
    agentId?: string,
  ) => void;
  setItemStatus: (
    sessionId: string,
    id: string,
    status: QueueItemStatus,
    errorMessage?: string,
  ) => void;
  /** Claim a pending item under the caller's per-session send lock. */
  beginSteering: (sessionId: string, id: string, runId: string) => boolean;
  /** Resolve only the exact steering attempt acknowledged by the server. */
  resolveSteering: (
    sessionId: string,
    id: string,
    requestId: string,
    status: "applied" | "returned",
    errorMessage?: string,
  ) => boolean;
  /** Unknown transport outcome stays claimed until its server receipt arrives. */
  setSteeringError: (
    sessionId: string,
    id: string,
    requestId: string,
    errorMessage?: string,
  ) => boolean;
  /** Set run state for a specific session (persists to localStorage). */
  setRunState: (sessionId: string, state: QueueRunState) => void;
  /** Get run state for a specific session (defaults to "idle"). */
  getRunState: (sessionId: string) => QueueRunState;
  setCurrentSendingId: (id: string | null) => void;
  consumeMigratedTo: () => string | null;
  /** Get queue for a session (read-only) */
  getQueue: (sessionId: string) => QueueItem[];
  /** Remove only messages whose unique receipt is present in backend history. */
  reconcileHistory: (
    sessionId: string,
    agentId: string,
    messages: Array<{ role?: string; metadata?: unknown }>,
  ) => void;
  /** Persist queue to localStorage */
  persistToStorage: (sessionId: string) => void;
  /** Load queue from localStorage into memory */
  loadFromStorage: (sessionId: string) => void;
  /** Internal: apply a remote (cross-tab) update without re-broadcasting. */
  applyRemoteItems: (sessionId: string, items: QueueItem[]) => void;
  /** Internal: apply a remote run-state update without re-broadcasting. */
  applyRemoteRunState: (sessionId: string, runState: QueueRunState) => void;
}

/** Maximum number of items allowed in a single session queue */
export const MAX_QUEUE_SIZE = 50;

export const useMessageQueueStore = create<MessageQueueStore>((set, get) => ({
  queues: {},
  runStates: {},
  currentSendingId: null,
  lastMigratedTo: null,

  enqueue: (sessionId: string, input: QueueItemInput) => {
    const current = preserveStoredSteering(
      sessionId,
      get().queues[sessionId] ?? [],
    );
    if (current.length >= MAX_QUEUE_SIZE) {
      // Queue is full, reject
      return;
    }
    // Capture the current selected agent at enqueue time so that
    // background sending uses the correct X-Agent-Id even after switch.
    let agentId = input.agentId;
    try {
      if (!agentId) {
        const agentStorage =
          sessionStorage.getItem("qwenpaw-agent-storage") ||
          localStorage.getItem("qwenpaw-agent-storage");
        if (agentStorage) {
          const parsed = JSON.parse(agentStorage);
          agentId = parsed?.state?.selectedAgent || undefined;
        }
      }
    } catch {
      // ignore
    }
    // Capture backend session_id so background sender targets the correct
    // session even if the session list is cleared after agent switch.
    const backendSessionId = input.backendSessionId;
    const item: QueueItem = {
      id: nextQueueId(),
      clientMessageId: createClientMessageId(),
      text: input.text,
      attachments: input.attachments,
      images: input.images,
      mentions: input.mentions,
      agentMentionModes: input.agentMentionModes,
      agentDispatch: input.agentDispatch,
      quote: input.quote,
      agentId,
      backendSessionId,
      userId: input.userId,
      channel: input.channel,
      requestContext: input.requestContext
        ? structuredClone(input.requestContext)
        : undefined,
      bizParams: input.bizParams ? structuredClone(input.bizParams) : undefined,
      status: "pending",
      retryCount: 0,
      createdAt: Date.now(),
    };
    set((state) => {
      const nextItems = [...current, item];
      const next = { ...state.queues, [sessionId]: nextItems };
      writeQueueToStorage(sessionId, nextItems, get().getRunState(sessionId));
      broadcast({ type: "enqueue", sessionId, items: nextItems });
      return {
        queues: next,
        runStates: preserveSteeringRunStates(sessionId, state.runStates),
      };
    });
  },

  remove: (sessionId: string, id: string) => {
    set((state) => {
      const current = preserveStoredSteering(
        sessionId,
        state.queues[sessionId] ?? [],
      );
      const nextItems = current.filter(
        (it) => it.id !== id || it.status === "steering",
      );
      const next = { ...state.queues, [sessionId]: nextItems };
      writeQueueToStorage(sessionId, nextItems, get().getRunState(sessionId));
      broadcast({ type: "remove", sessionId, items: nextItems });
      return {
        queues: next,
        runStates: preserveSteeringRunStates(sessionId, state.runStates),
      };
    });
  },

  edit: (
    sessionId: string,
    id: string,
    text: string,
    agentMentionModes?: Record<string, "delegate" | "collaborate">,
    agentDispatch?: QueueAgentDispatch,
    requestContext?: Record<string, unknown>,
  ) => {
    set((state) => {
      const current = preserveStoredSteering(
        sessionId,
        state.queues[sessionId] ?? [],
      );
      const nextItems = current.map((it) =>
        it.id === id && it.status !== "steering"
          ? {
              ...it,
              text,
              agentMentionModes,
              agentDispatch,
              requestContext: requestContext ?? it.requestContext,
            }
          : it,
      );
      const next = { ...state.queues, [sessionId]: nextItems };
      writeQueueToStorage(sessionId, nextItems, get().getRunState(sessionId));
      broadcast({ type: "edit", sessionId, items: nextItems });
      return {
        queues: next,
        runStates: preserveSteeringRunStates(sessionId, state.runStates),
      };
    });
  },

  reorder: (sessionId: string, items: QueueItem[]) => {
    set((state) => {
      const current = preserveStoredSteering(
        sessionId,
        state.queues[sessionId] ?? [],
      );
      items = preserveStoredSteering(sessionId, items);
      if (current.some((item) => item.status === "steering")) {
        // A reorder is only a permutation. In-flight entries remain pinned and
        // retain the canonical request metadata even if the UI snapshot is old.
        const proposedIds = new Set(items.map((item) => item.id));
        if (
          current.length !== items.length ||
          proposedIds.size !== current.length ||
          current.some(
            (item, index) =>
              !proposedIds.has(item.id) ||
              (item.status === "steering" && items[index]?.id !== item.id),
          )
        ) {
          return { queues: { ...state.queues, [sessionId]: current } };
        }
        const protectedItems = new Map(
          current
            .filter((item) => item.status === "steering")
            .map((item) => [item.id, item]),
        );
        items = items.map((item) => protectedItems.get(item.id) ?? item);
      }
      const next = { ...state.queues, [sessionId]: items };
      writeQueueToStorage(sessionId, items, get().getRunState(sessionId));
      broadcast({ type: "reorder", sessionId, items });
      return {
        queues: next,
        runStates: preserveSteeringRunStates(sessionId, state.runStates),
      };
    });
  },

  clear: (sessionId: string) => {
    set((state) => {
      const retained = preserveStoredSteering(
        sessionId,
        state.queues[sessionId] ?? [],
      ).filter((item) => item.status === "steering");
      const queues = { ...state.queues };
      const runStates = { ...state.runStates };
      if (retained.length) queues[sessionId] = retained;
      else {
        delete queues[sessionId];
        delete runStates[sessionId];
      }
      const runState = retained.length
        ? readSteeringRunState(sessionId) ?? runStates[sessionId] ?? "idle"
        : "idle";
      if (retained.length) runStates[sessionId] = runState;
      writeQueueToStorage(sessionId, retained, runState);
      broadcast({ type: "clear", sessionId, items: retained, runState });
      return { queues, runStates };
    });
  },

  migrateQueue: (
    fromSessionId: string,
    toSessionId: string,
    agentId?: string,
  ) => {
    if (fromSessionId === toSessionId) return;
    set((state) => {
      const fromItems = preserveStoredSteering(
        fromSessionId,
        state.queues[fromSessionId] ?? [],
      );
      // A steering receipt belongs to its original backend conversation.
      const moving = fromItems.filter(
        (item) =>
          item.status !== "steering" &&
          (!agentId || (item.agentId || "default") === agentId),
      );
      if (moving.length === 0 && (agentId || !state.runStates[fromSessionId]))
        return state;
      const movingIds = new Set(moving.map((item) => item.id));
      const remaining = fromItems.filter((item) => !movingIds.has(item.id));
      const toItems = preserveStoredSteering(
        toSessionId,
        state.queues[toSessionId] ?? [],
      );
      // Preserve order: existing destination items first, migrated source items appended.
      const existingIds = new Set(toItems.map((item) => item.id));
      const merged = [
        ...toItems,
        ...moving.filter((item) => !existingIds.has(item.id)),
      ];
      const queues = { ...state.queues, [toSessionId]: merged };
      if (remaining.length) queues[fromSessionId] = remaining;
      else delete queues[fromSessionId];
      // Carry over the from-session's runState to the destination if not already set.
      const runStates = {
        ...preserveSteeringRunStates(
          fromSessionId,
          preserveSteeringRunStates(toSessionId, state.runStates),
        ),
      };
      if (!runStates[toSessionId] && runStates[fromSessionId]) {
        runStates[toSessionId] = runStates[fromSessionId];
      }
      if (!remaining.length) delete runStates[fromSessionId];
      const destRunState = runStates[toSessionId] ?? "idle";
      writeQueueToStorage(toSessionId, merged, destRunState);
      writeQueueToStorage(
        fromSessionId,
        remaining,
        runStates[fromSessionId] ?? "idle",
      );
      broadcast({
        type: "migrate",
        sessionId: fromSessionId,
        toSessionId,
        items: merged,
        sourceItems: remaining,
        runState: destRunState,
      });
      return { queues, runStates, lastMigratedTo: toSessionId };
    });
  },

  setItemStatus: (
    sessionId: string,
    id: string,
    status: QueueItemStatus,
    errorMessage?: string,
  ) => {
    set((state) => {
      const current = preserveStoredSteering(
        sessionId,
        state.queues[sessionId] ?? [],
      );
      if (status === "steering") {
        return { queues: { ...state.queues, [sessionId]: current } };
      }
      const nextItems = current.map((it) =>
        it.id === id && it.status !== "steering"
          ? {
              ...it,
              status,
              errorMessage,
              retryCount: it.retryCount + (status === "failed" ? 1 : 0),
            }
          : it,
      );
      const next = { ...state.queues, [sessionId]: nextItems };
      const failed =
        status === "failed" &&
        current.some((it) => it.id === id && it.status !== "steering");
      const runState = failed ? "error" : get().getRunState(sessionId);
      const runStates = { ...state.runStates, [sessionId]: runState };
      writeQueueToStorage(sessionId, nextItems, runState);
      broadcast({
        type: "setItemStatus",
        sessionId,
        items: nextItems,
        runState,
      });
      return { queues: next, runStates };
    });
  },

  beginSteering: (sessionId, id, runId) => {
    if (!runId.trim() || isDraftQueueKey(sessionId)) return false;
    let claimed = false;
    set((state) => {
      const current = preserveStoredSteering(
        sessionId,
        state.queues[sessionId] ?? [],
      );
      const item = current.find((candidate) => candidate.id === id);
      if (item?.status !== "pending") return state;
      const requestId = `steer-${createClientMessageId()}`;
      if (!writeSteeringClaim(sessionId, id, requestId)) return state;
      const items = current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              status: "steering" as const,
              steering: { requestId, runId },
              errorMessage: undefined,
            }
          : candidate,
      );
      const runState = get().getRunState(sessionId);
      if (!writeQueueToStorage(sessionId, items, runState)) return state;
      broadcast({ type: "setItemStatus", sessionId, items, runState });
      claimed = true;
      return {
        queues: { ...state.queues, [sessionId]: items },
        runStates: { ...state.runStates, [sessionId]: runState },
      };
    });
    return claimed;
  },

  resolveSteering: (sessionId, id, requestId, status, errorMessage) => {
    let resolved = false;
    set((state) => {
      // A terminal response in another tab may already have returned this
      // item or started a newer attempt before its storage event reaches us.
      const current =
        readAuthoritativeQueueItems(sessionId) ?? state.queues[sessionId] ?? [];
      const item = current.find((candidate) => candidate.id === id);
      if (item?.status !== "steering" || item.steering?.requestId !== requestId)
        return state;
      const items = current.flatMap((candidate) => {
        if (candidate.id !== id) return [candidate];
        if (status === "applied") return [];
        const returned = { ...candidate };
        delete returned.steering;
        return [
          {
            ...returned,
            status: "failed" as const,
            retryCount: candidate.retryCount + 1,
            errorMessage,
          },
        ];
      });
      const runState =
        status === "returned" ? "error" : get().getRunState(sessionId);
      if (!writeQueueToStorage(sessionId, items, runState)) return state;
      broadcast({ type: "setItemStatus", sessionId, items, runState });
      resolved = true;
      return {
        queues: { ...state.queues, [sessionId]: items },
        runStates: { ...state.runStates, [sessionId]: runState },
      };
    });
    return resolved;
  },

  setSteeringError: (sessionId, id, requestId, errorMessage) => {
    let updated = false;
    set((state) => {
      // A terminal response in another tab may already have returned this
      // item or started a newer attempt before its storage event reaches us.
      const current =
        readAuthoritativeQueueItems(sessionId) ?? state.queues[sessionId] ?? [];
      const item = current.find((candidate) => candidate.id === id);
      if (
        item?.status !== "steering" ||
        item.steering?.requestId !== requestId ||
        item.errorMessage === errorMessage
      )
        return state;
      const items = current.map((candidate) =>
        candidate.id === id ? { ...candidate, errorMessage } : candidate,
      );
      const runState = get().getRunState(sessionId);
      if (!writeQueueToStorage(sessionId, items, runState)) return state;
      broadcast({ type: "setItemStatus", sessionId, items, runState });
      updated = true;
      return {
        queues: { ...state.queues, [sessionId]: items },
        runStates: { ...state.runStates, [sessionId]: runState },
      };
    });
    return updated;
  },

  setRunState: (sessionId: string, runState: QueueRunState) => {
    const items = preserveStoredSteering(
      sessionId,
      get().queues[sessionId] ?? [],
    );
    set((state) => ({
      queues: { ...state.queues, [sessionId]: items },
      runStates: { ...state.runStates, [sessionId]: runState },
    }));
    // Always persist with the correct session key.
    writeQueueToStorage(sessionId, items, runState);
    broadcast({
      type: "runState",
      sessionId,
      runState,
    });
  },

  getRunState: (sessionId: string): QueueRunState => {
    return (
      readSteeringRunState(sessionId) ?? get().runStates[sessionId] ?? "idle"
    );
  },

  setCurrentSendingId: (currentSendingId: string | null) => {
    set({ currentSendingId });
  },

  consumeMigratedTo: () => {
    const v = get().lastMigratedTo;
    if (v !== null) set({ lastMigratedTo: null });
    return v;
  },

  getQueue: (sessionId: string) => {
    // Auto-senders re-read through this getter under their send lock. Do not
    // expose an old pending row while its cross-tab receipt event is delayed.
    return preserveStoredSteering(sessionId, get().queues[sessionId] ?? []);
  },

  reconcileHistory: (sessionId, agentId, messages) => {
    const received = new Set(
      messages
        .filter((message) => message.role === "user")
        .map((message) => extractClientMessageId(message.metadata))
        .filter(Boolean),
    );
    if (received.size === 0) return;
    const saved = readQueueFromStorage(sessionId);
    const current = preserveStoredSteering(
      sessionId,
      get().queues[sessionId] ?? saved?.items ?? [],
    );
    const items = current.filter(
      (item) =>
        item.status === "steering" ||
        (item.agentId || "default") !== agentId ||
        !item.clientMessageId ||
        !received.has(item.clientMessageId),
    );
    if (items.length === current.length) return;
    const previous =
      readSteeringRunState(sessionId) ??
      get().runStates[sessionId] ??
      saved?.runState ??
      "idle";
    const runState =
      previous === "error" && !items.some((item) => item.status === "failed")
        ? "idle"
        : previous;
    writeQueueToStorage(sessionId, items, runState);
    set((state) => ({
      queues: { ...state.queues, [sessionId]: items },
      runStates: { ...state.runStates, [sessionId]: runState },
    }));
    broadcast({ type: "setItemStatus", sessionId, items, runState });
  },

  persistToStorage: (sessionId: string) => {
    const items = preserveStoredSteering(
      sessionId,
      get().queues[sessionId] ?? [],
    );
    writeQueueToStorage(sessionId, items, get().getRunState(sessionId));
  },

  loadFromStorage: (sessionId: string) => {
    const saved = readQueueFromStorage(sessionId);
    if (saved) {
      set((state) => ({
        queues: { ...state.queues, [sessionId]: saved.items },
        // A failed head requires an explicit retry, including for older saves
        // that recorded its item status without recording the error run state.
        runStates: {
          ...state.runStates,
          [sessionId]:
            saved.runState === "paused"
              ? "paused"
              : saved.runState === "error" ||
                saved.items[0]?.status === "failed"
              ? "error"
              : "idle",
        },
      }));
    } else {
      // Ensure stale in-memory state is cleared so callers see an empty queue.
      set((state) => {
        if (!(sessionId in state.queues)) return state;
        const queues = { ...state.queues };
        delete queues[sessionId];
        return { queues };
      });
    }
  },

  applyRemoteItems: (sessionId: string, items: QueueItem[]) => {
    set((state) => {
      items = preserveStoredSteering(sessionId, items);
      const queues = { ...state.queues };
      if (items.length === 0) {
        delete queues[sessionId];
      } else {
        queues[sessionId] = items.map(restoreQueueIdentity);
      }
      return {
        queues,
        runStates: preserveSteeringRunStates(sessionId, state.runStates),
      };
    });
  },

  applyRemoteRunState: (sessionId: string, runState: QueueRunState) => {
    const authoritative = readSteeringRunState(sessionId) ?? runState;
    set((state) => ({
      runStates: { ...state.runStates, [sessionId]: authoritative },
    }));
  },
}));

/** Recover legacy drafts before acquiring foreground ownership. A separate
 * exclusive lock serializes the shared legacy read/partition/write across tabs. */
export async function recoverLegacyDraftQueue(
  queueKey: string,
  signal?: AbortSignal,
): Promise<void> {
  if (!queueKey.startsWith("draft:")) return;
  const agentId = decodeURIComponent(queueKey.slice(6));
  const sources = ["new", `new:${agentId}`];
  if (!sources.some((key) => readQueueFromStorage(key)?.items.length)) return;
  const recover = () => {
    if (signal?.aborted) return;
    const store = useMessageQueueStore.getState();
    store.loadFromStorage(queueKey);
    for (const source of sources) {
      if (!readQueueFromStorage(source)?.items.length) continue;
      store.loadFromStorage(source);
      store.migrateQueue(source, queueKey, agentId);
    }
  };
  const locks = getLockManager();
  if (!locks) {
    recover();
    return;
  }
  try {
    await locks.request(
      "qwenpaw:queue-migrate:legacy-new",
      { mode: "exclusive", signal },
      recover,
    );
  } catch (error) {
    if (!signal?.aborted) throw error;
  }
}

// ---------------------------------------------------------------------------
// Cross-tab listeners. These mutate in-memory state only; they never re-write
// storage or re-broadcast (which would loop).
// ---------------------------------------------------------------------------

if (typeof window !== "undefined") {
  // BroadcastChannel: same-origin, instant updates between tabs.
  const ch = getChannel();
  if (ch) {
    ch.addEventListener("message", (event: MessageEvent<BroadcastPayload>) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      const store = useMessageQueueStore.getState();
      if (data.type === "migrate") {
        // Source cleared, destination set with merged items.
        store.applyRemoteItems(data.sessionId, data.sourceItems ?? []);
        if (data.toSessionId && data.items) {
          if (data.runState) {
            store.applyRemoteRunState(data.toSessionId, data.runState);
          }
          store.applyRemoteItems(data.toSessionId, data.items);
        }
        return;
      }
      if (data.type === "runState" && data.runState) {
        useMessageQueueStore
          .getState()
          .applyRemoteRunState(data.sessionId, data.runState);
        return;
      }
      if (data.runState) {
        store.applyRemoteRunState(data.sessionId, data.runState);
      }
      if (data.items) {
        store.applyRemoteItems(data.sessionId, data.items);
      }
    });
  }

  // storage event: fallback for environments without BroadcastChannel, and
  // also covers the case where another tab wrote without our channel.
  window.addEventListener("storage", (event) => {
    if (!event.key || !event.key.startsWith(STORAGE_PREFIX)) return;
    const sessionId = event.key.slice(STORAGE_PREFIX.length);
    const store = useMessageQueueStore.getState();
    if (event.newValue == null) {
      store.applyRemoteItems(sessionId, []);
      return;
    }
    try {
      const parsed = JSON.parse(event.newValue);
      const items: QueueItem[] = Array.isArray(parsed)
        ? (parsed as QueueItem[])
        : (parsed as PersistedQueue).items ?? [];
      store.applyRemoteItems(sessionId, items);
      if (
        !Array.isArray(parsed) &&
        ["paused", "error"].includes((parsed as PersistedQueue).runState)
      ) {
        useMessageQueueStore
          .getState()
          .applyRemoteRunState(sessionId, (parsed as PersistedQueue).runState);
      }
    } catch {
      // ignore
    }
  });
}
