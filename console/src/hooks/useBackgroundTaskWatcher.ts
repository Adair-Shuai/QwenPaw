/**
 * Watches offloaded tool calls via ToolStream SSE (+ polling fallback).
 * Updates backgroundTasksStore with liveOutput and final status/result.
 */

import { message } from "antd";
import i18n from "../i18n";
import {
  extractOutputText,
  subscribeToolCallStream,
  toolCallsApi,
} from "../api/modules/toolCalls";
import { useBackgroundTasksStore } from "../stores/backgroundTasksStore";
import { resolveBackendSessionId } from "../utils/resolveBackendSessionId";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_INTERVAL_MS = 30_000;
const MISSING_CONFIRMATIONS = 3;
const LIVE_OUTPUT_MAX = 80_000;

type AbortFn = () => void;

const activeWatchers = new Map<string, AbortFn>();
const finalizedIds = new Map<string, number>();
const FINALIZED_TTL_MS = 60 * 60 * 1000;
const FINALIZED_MAX = 2000;
const OUTPUT_RETRY_DELAYS_MS = [1000, 3000, 10000];
const OUTPUT_RETRY_COOLDOWN_MS = 30_000;
const SESSION_RESOLVE_ATTEMPTS = 120;
const SESSION_RESOLVE_INTERVAL_MS = 500;

function watcherKey(sessionId: string, toolCallId: string): string {
  return `${sessionId}\u0000${toolCallId}`;
}

function markFinalized(sessionId: string, toolCallId: string): void {
  const now = Date.now();
  for (const [id, at] of finalizedIds) {
    if (now - at > FINALIZED_TTL_MS) finalizedIds.delete(id);
  }
  finalizedIds.set(watcherKey(sessionId, toolCallId), now);
  while (finalizedIds.size > FINALIZED_MAX) {
    const oldest = finalizedIds.keys().next().value;
    if (!oldest) break;
    finalizedIds.delete(oldest);
  }
}
function isFinalized(sessionId: string, toolCallId: string): boolean {
  const key = watcherKey(sessionId, toolCallId);
  const at = finalizedIds.get(key);
  if (!at) return false;
  if (Date.now() - at > FINALIZED_TTL_MS) { finalizedIds.delete(key); return false; }
  return true;
}

function isNotFoundError(error: unknown): boolean {
  const status = (error as { status?: unknown })?.status;
  return status === 404 || (error instanceof Error && /\b404\b/.test(error.message));
}

function chunkToText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const p = payload as { data?: unknown; type?: string };
  const data = p.data;
  if (data == null) return "";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.text === "string") return d.text;
    if (typeof d.content === "string") return d.content;
    // ToolChunk / ToolResponse-like: content may be array of blocks
    if (Array.isArray(d.content)) {
      return d.content
        .map((b) =>
          b &&
          typeof b === "object" &&
          typeof (b as { text?: string }).text === "string"
            ? (b as { text: string }).text
            : "",
        )
        .filter(Boolean)
        .join("");
    }
    try {
      return JSON.stringify(data);
    } catch {
      return "";
    }
  }
  return String(data);
}

async function finalizeFromOutput(
  sessionId: string,
  toolCallId: string,
  fallbackLive: string,
  cancelled: boolean,
  attempt = 0,
): Promise<void> {
  if (isFinalized(sessionId, toolCallId)) return;

  const store = useBackgroundTasksStore.getState();
  let resultText = fallbackLive;
  let status: "done" | "cancelled" = cancelled ? "cancelled" : "done";

  try {
    const output = await toolCallsApi.getOutput(sessionId, toolCallId);
    const extracted = extractOutputText(output);
    if (extracted) resultText = extracted;
    if (
      output.final_state === "interrupted" ||
      output.final_state === "cancelled"
    ) {
      status = "cancelled";
    }
  } catch (error) {
    if (!isNotFoundError(error) && attempt < OUTPUT_RETRY_DELAYS_MS.length) {
      await new Promise((resolve) =>
        setTimeout(resolve, OUTPUT_RETRY_DELAYS_MS[attempt]),
      );
      return finalizeFromOutput(
        sessionId,
        toolCallId,
        fallbackLive,
        cancelled,
        attempt + 1,
      );
    }
    if (!isNotFoundError(error)) {
      console.error(
        "[backgroundTaskWatcher] final output unavailable after retries:",
        sessionId,
        toolCallId,
        error,
      );
      setTimeout(() => {
        const task = useBackgroundTasksStore
          .getState()
          .tasks.find((item) => item.sessionId === sessionId && item.toolCallId === toolCallId);
        if (task?.status === "running") {
          startBackgroundTaskWatcher(sessionId, toolCallId);
        }
      }, OUTPUT_RETRY_COOLDOWN_MS);
      return;
    }
    resultText = fallbackLive;
  }
  markFinalized(sessionId, toolCallId);

  if (resultText.length > LIVE_OUTPUT_MAX) {
    resultText = resultText.slice(resultText.length - LIVE_OUTPUT_MAX);
  }

  const task = store.tasks.find(
    (t) => t.sessionId === sessionId && t.toolCallId === toolCallId,
  );
  // Skip toast if already terminal (e.g. user cancelled from panel)
  const alreadyTerminal =
    task?.status === "done" || task?.status === "cancelled";

  store.updateTaskForSession(sessionId, toolCallId, {
    status,
    result: resultText || null,
    hintVisible: true,
  });

  if (alreadyTerminal) return;

  const toolName = task?.toolName || toolCallId;
  if (status === "cancelled") {
    message.info(
      i18n.t("tool.control.toast.bgCancelled", {
        tool: toolName,
        defaultValue: `Background tool cancelled: ${toolName}`,
      }),
    );
  } else {
    message.success(
      i18n.t("tool.control.toast.bgComplete", {
        tool: toolName,
        defaultValue: `Background tool complete: ${toolName}`,
      }),
    );
  }
}

function startPolling(sessionId: string, toolCallId: string): AbortFn {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let transientFailures = 0;
  let missingCount = 0;
  let polling = false;

  const schedule = (delay: number) => {
    if (stopped) return;
    timer = setTimeout(() => void poll(), delay);
  };

  const poll = async () => {
    if (stopped) return;
    if (polling) return;
    polling = true;
    const finishPoll = async (cancelled: boolean) => {
      if (stopped) return;
      stopped = true;
      if (timer) clearTimeout(timer);
      const key = watcherKey(sessionId, toolCallId);
      const abort = activeWatchers.get(key);
      activeWatchers.delete(key);
      // Abort stream leg only; poll already stopped
      abort?.();
      const live =
        useBackgroundTasksStore
          .getState()
          .tasks.find((t) => t.sessionId === sessionId && t.toolCallId === toolCallId)?.liveOutput || "";
      await finalizeFromOutput(sessionId, toolCallId, live, cancelled);
    };
    try {
      const info = await toolCallsApi.getInfo(sessionId, toolCallId);
      if (!info) {
        missingCount += 1;
        transientFailures = 0;
        if (missingCount < MISSING_CONFIRMATIONS) {
          schedule(POLL_INTERVAL_MS);
          return;
        }
        // A task that was observed/offloaded and then disappears is normally
        // backend GC after terminal completion. Confirm via /output first;
        // finalize from the captured live stream only when output was GC'd too.
        try {
          const output = await toolCallsApi.getOutput(sessionId, toolCallId);
          const cancelled =
            output.final_state === "interrupted" ||
            output.final_state === "cancelled";
          await finishPoll(cancelled);
        } catch (err) {
          if (isNotFoundError(err)) {
            await finishPoll(false);
          } else {
            transientFailures += 1;
            schedule(
              Math.min(
                POLL_MAX_INTERVAL_MS,
                POLL_INTERVAL_MS * 2 ** Math.min(transientFailures, 4),
              ),
            );
          }
        }
        return;
      }
      missingCount = 0;
      transientFailures = 0;
      if (info.status === "running" || info.status === "offloaded") {
        schedule(POLL_INTERVAL_MS);
        return;
      }
      const cancelled =
        info.end_state === "interrupted" || !!info.force_cancelled;
      await finishPoll(cancelled);
    } catch {
      transientFailures += 1;
      schedule(
        Math.min(
          POLL_MAX_INTERVAL_MS,
          POLL_INTERVAL_MS * 2 ** Math.min(transientFailures, 4),
        ),
      );
    } finally {
      polling = false;
    }
  };

  schedule(POLL_INTERVAL_MS);

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

/**
 * Register a task in the background queue and start the SSE/poll watcher.
 * Idempotent: safe for both manual offload and system auto-offload.
 *
 * sessionId may be empty on the first turn before window.currentSessionId is
 * set — we still enqueue the task (panel shows it) and resolve session later
 * for the watcher from window when possible.
 */
export function registerBackgroundTask(opts: {
  sessionId: string;
  toolCallId: string;
  toolName: string;
  startTime?: number;
  /** When true, skip SSE and hydrate /output immediately (fast bg finish). */
  alreadyCompleted?: boolean;
}): void {
  const {
    toolCallId,
    toolName,
    startTime = Date.now(),
    alreadyCompleted = false,
  } = opts;
  if (!toolCallId) return;

  const resolvedSessionId = resolveBackendSessionId(opts.sessionId);

  useBackgroundTasksStore.getState().addTask({
    toolCallId,
    toolName: toolName || toolCallId,
    sessionId: resolvedSessionId,
    startTime,
  });

  const backfillSessionId = (sid: string) => {
    useBackgroundTasksStore.setState((state) => ({
      tasks: state.tasks.map((t) =>
        t.toolCallId === toolCallId && !t.sessionId
          ? { ...t, sessionId: sid }
          : t,
      ),
    }));
  };

  if (alreadyCompleted) {
    const hydrate = (sid: string) => {
      if (!sid) return false;
      backfillSessionId(sid);
      void finalizeFromOutput(sid, toolCallId, "", false);
      return true;
    };
    if (!hydrate(resolvedSessionId)) {
      let attempts = 0;
      const retry = () => {
        attempts += 1;
        const sid = resolveBackendSessionId();
        if (hydrate(sid) || attempts >= SESSION_RESOLVE_ATTEMPTS) return;
        setTimeout(retry, SESSION_RESOLVE_INTERVAL_MS);
      };
      setTimeout(retry, SESSION_RESOLVE_INTERVAL_MS);
    }
    return;
  }

  // Watcher needs a session id for API paths; retry briefly if still empty.
  const startWatcher = (sid: string) => {
    if (!sid) return false;
    startBackgroundTaskWatcher(sid, toolCallId);
    // Back-fill sessionId on the task if it was empty at enqueue time.
    backfillSessionId(sid);
    return true;
  };

  if (!startWatcher(resolvedSessionId)) {
    let attempts = 0;
    const retry = () => {
      attempts += 1;
      const sid = resolveBackendSessionId();
      if (startWatcher(sid) || attempts >= SESSION_RESOLVE_ATTEMPTS) return;
      setTimeout(retry, SESSION_RESOLVE_INTERVAL_MS);
    };
    setTimeout(retry, SESSION_RESOLVE_INTERVAL_MS);
  }
}

/**
 * Start watching an offloaded tool call. Idempotent per toolCallId.
 */
export function startBackgroundTaskWatcher(
  sessionId: string,
  toolCallId: string,
): void {
  const key = watcherKey(sessionId, toolCallId);
  if (activeWatchers.has(key) || isFinalized(sessionId, toolCallId)) return;

  let settled = false;
  let pollAbort: AbortFn | null = null;
  let streamAbort: AbortFn = () => {};

  const abortAll = () => {
    streamAbort();
    pollAbort?.();
  };

  const settle = async (cancelled: boolean) => {
    if (settled) return;
    settled = true;
    activeWatchers.delete(key);
    abortAll();
    const live =
      useBackgroundTasksStore
        .getState()
        .tasks.find((t) => t.sessionId === sessionId && t.toolCallId === toolCallId)?.liveOutput || "";
    await finalizeFromOutput(sessionId, toolCallId, live, cancelled);
  };

  streamAbort = subscribeToolCallStream(sessionId, toolCallId, {
    onChunk: (payload) => {
      const text = chunkToText(payload);
      if (text) {
        useBackgroundTasksStore.getState().appendLiveOutputForSession(sessionId, toolCallId, text);
      }
    },
    onDone: () => {
      void settle(false);
    },
    onError: () => {
      if (settled || pollAbort) return;
      pollAbort = startPolling(sessionId, toolCallId);
    },
  });

  activeWatchers.set(key, abortAll);
}

/** Stop watcher without changing task status (e.g. user removed row). */
export function stopBackgroundTaskWatcher(toolCallId: string): void {
  for (const [key, abort] of activeWatchers) {
    if (!key.endsWith(`\u0000${toolCallId}`)) continue;
    abort();
    activeWatchers.delete(key);
  }
}

/**
 * User cancelled from panel: stop stream, call cancel API, update store.
 * On API failure, resume the watcher so the task is not orphaned.
 */
export async function cancelBackgroundTask(
  sessionId: string,
  toolCallId: string,
): Promise<void> {
  const sid = (sessionId || "").trim();
  if (!sid) {
    message.error(
      i18n.t(
        "chat.backgroundTasks.cancelFailed",
        "Failed to cancel background task",
      ),
    );
    throw new Error("Missing backend session id for cancel");
  }
  stopBackgroundTaskWatcher(toolCallId);
  try {
    await toolCallsApi.cancel(sid, toolCallId);
  } catch (err) {
    for (const key of finalizedIds.keys()) {
      if (key.endsWith(`\u0000${toolCallId}`)) finalizedIds.delete(key);
    }
    startBackgroundTaskWatcher(sid, toolCallId);
    message.error(
      i18n.t(
        "chat.backgroundTasks.cancelFailed",
        "Failed to cancel background task",
      ),
    );
    throw err;
  }
  markFinalized(sid, toolCallId);
  const live =
    useBackgroundTasksStore
      .getState()
      .tasks.find((t) => t.sessionId === sid && t.toolCallId === toolCallId)?.liveOutput || "";
  useBackgroundTasksStore.getState().updateTaskForSession(sid, toolCallId, {
    status: "cancelled",
    result: live || null,
    hintVisible: true,
  });
}

/**
 * Stop watchers and drop store rows that do not belong to the given session.
 * Call before hydrating a newly selected session to avoid leaking SSE/poll.
 * Pass an empty session id to tear down every tracked task (e.g. blank "new" chat).
 * Orphan rows with empty sessionId are always treated as stale on switch.
 */
export function stopBackgroundWatchersNotInSession(
  backendSessionId: string,
): void {
  const store = useBackgroundTasksStore.getState();
  const staleTasks = !backendSessionId
    ? store.tasks.map((t) => ({ sessionId: t.sessionId, toolCallId: t.toolCallId }))
    : store.tasks
        .filter((t) => !t.sessionId || t.sessionId !== backendSessionId)
        .map((t) => ({ sessionId: t.sessionId, toolCallId: t.toolCallId }));
  for (const { toolCallId } of staleTasks) {
    stopBackgroundTaskWatcher(toolCallId);
  }
  if (staleTasks.length > 0) {
    store.removeTasksForSession(staleTasks);
  }
}

/**
 * Rehydrate the background task panel from the backend list of still-offloaded
 * tool calls. Idempotent with live registerBackgroundTask paths.
 */
export async function hydrateBackgroundTasksForSession(
  backendSessionId: string,
): Promise<void> {
  if (!backendSessionId) return;
  try {
    const { items } = await toolCallsApi.list(backendSessionId);
    for (const item of items) {
      if (item.status !== "offloaded" && item.status !== "running") continue;
      const elapsedMs = Math.max(0, Math.round((item.elapsed || 0) * 1000));
      registerBackgroundTask({
        sessionId: item.session_id || backendSessionId,
        toolCallId: item.tool_call_id,
        toolName: item.tool_name || item.tool_call_id,
        startTime: Date.now() - elapsedMs,
      });
    }
  } catch (err) {
    console.error(
      "[hydrateBackgroundTasksForSession] list failed:",
      backendSessionId,
      err,
    );
  }
}
