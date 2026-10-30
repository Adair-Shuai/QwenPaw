/**
 * Tracks offloaded tool calls with polling and opens output SSE on demand.
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
const LIVE_OUTPUT_MAX = 80_000;

type AbortFn = () => void;

const activeStatusWatchers = new Map<string, AbortFn>();
const activeOutputStreams = new Map<string, AbortFn>();
const finalizedIds = new Map<string, number>();
const FINALIZED_TTL_MS = 60 * 60 * 1000;
const FINALIZED_MAX = 2000;

function watcherKey(sessionId: string, toolCallId: string): string {
  return `${sessionId}\u0000${toolCallId}`;
}
function isFinalized(sessionId: string, toolCallId: string): boolean {
  const key = watcherKey(sessionId, toolCallId);
  const at = finalizedIds.get(key);
  if (at === undefined) return false;
  if (Date.now() - at > FINALIZED_TTL_MS) {
    finalizedIds.delete(key);
    return false;
  }
  return true;
}
function markFinalized(sessionId: string, toolCallId: string): void {
  finalizedIds.set(watcherKey(sessionId, toolCallId), Date.now());
  while (finalizedIds.size > FINALIZED_MAX) {
    const oldest = finalizedIds.keys().next().value;
    if (oldest === undefined) break;
    finalizedIds.delete(oldest);
  }
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
    const notFound =
      (error as { status?: number })?.status === 404 ||
      (error instanceof Error && /\b404\b/.test(error.message));
    if (!notFound) {
      // Retry persisted output before announcing completion.
      setTimeout(() => {
        const task = useBackgroundTasksStore
          .getState()
          .tasks.find(
            (item) =>
              item.sessionId === sessionId && item.toolCallId === toolCallId,
          );
        if (task?.status === "running")
          startBackgroundTaskWatcher(sessionId, toolCallId);
      }, POLL_INTERVAL_MS);
      return;
    }
  }
  if (isFinalized(sessionId, toolCallId)) return;
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

async function finishBackgroundTask(
  sessionId: string,
  toolCallId: string,
  cancelled: boolean,
): Promise<void> {
  stopBackgroundTaskWatcher(toolCallId, sessionId);
  const liveOutput =
    useBackgroundTasksStore
      .getState()
      .tasks.find(
        (task) =>
          task.sessionId === sessionId && task.toolCallId === toolCallId,
      )?.liveOutput || "";
  await finalizeFromOutput(sessionId, toolCallId, liveOutput, cancelled);
}

function startPolling(sessionId: string, toolCallId: string): AbortFn {
  let stopped = false;
  let inFlight = false;
  const timer = setInterval(async () => {
    if (stopped || inFlight) return;
    inFlight = true;
    const finishPoll = async (cancelled: boolean) => {
      if (stopped) return;
      await finishBackgroundTask(sessionId, toolCallId, cancelled);
    };
    try {
      const info = await toolCallsApi.getInfo(sessionId, toolCallId);
      if (!info) return;
      if (info.status === "running" || info.status === "offloaded") {
        return;
      }
      const cancelled =
        info.end_state === "interrupted" || !!info.force_cancelled;
      await finishPoll(cancelled);
    } catch {
      // A transient getInfo failure must not orphan a running task. Confirm
      // absence through the session list before treating it as completed.
      try {
        const { items } = await toolCallsApi.list(sessionId);
        const stillActive = items.some(
          (item) => item.tool_call_id === toolCallId,
        );
        if (!stillActive) {
          await finishPoll(false);
        }
      } catch {
        // Keep polling while the backend is temporarily unavailable.
      }
    } finally {
      inFlight = false;
    }
  }, POLL_INTERVAL_MS);

  return () => {
    stopped = true;
    clearInterval(timer);
  };
}

/**
 * Register a task in the background queue and start status polling.
 * Idempotent: safe for both manual offload and system auto-offload.
 *
 * sessionId may be empty on the first turn before the local session resolves.
 * We still enqueue the task so the panel can display it.
 */
export function registerBackgroundTask(opts: {
  sessionId: string;
  toolCallId: string;
  toolName: string;
  startTime?: number;
  /** When true, skip polling and hydrate /output immediately. */
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
      const timer = setInterval(() => {
        attempts += 1;
        const sid = resolveBackendSessionId();
        if (hydrate(sid) || attempts >= 20) {
          clearInterval(timer);
        }
      }, 250);
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
    const timer = setInterval(() => {
      attempts += 1;
      const sid = resolveBackendSessionId();
      if (startWatcher(sid) || attempts >= 20) {
        clearInterval(timer);
      }
    }, 250);
  }
}

/**
 * Start polling an offloaded tool call status. Idempotent per toolCallId.
 */
export function startBackgroundTaskWatcher(
  sessionId: string,
  toolCallId: string,
): void {
  if (
    activeStatusWatchers.has(watcherKey(sessionId, toolCallId)) ||
    isFinalized(sessionId, toolCallId)
  ) {
    return;
  }
  activeStatusWatchers.set(
    watcherKey(sessionId, toolCallId),
    startPolling(sessionId, toolCallId),
  );
}

/** Open live output for a visible task. Idempotent per toolCallId. */
export function startBackgroundTaskStream(
  sessionId: string,
  toolCallId: string,
): void {
  if (
    activeOutputStreams.has(watcherKey(sessionId, toolCallId)) ||
    isFinalized(sessionId, toolCallId)
  ) {
    return;
  }

  let active = true;
  let transportAbort: AbortFn = () => {};
  const stop = () => {
    active = false;
    transportAbort();
  };

  transportAbort = subscribeToolCallStream(sessionId, toolCallId, {
    onChunk: (payload) => {
      if (!active) return;
      const text = chunkToText(payload);
      if (text) {
        useBackgroundTasksStore
          .getState()
          .appendLiveOutputForSession(sessionId, toolCallId, text);
      }
    },
    onDone: () => {
      if (!active) return;
      active = false;
      activeOutputStreams.delete(watcherKey(sessionId, toolCallId));
      void finishBackgroundTask(sessionId, toolCallId, false);
    },
    onError: () => {
      if (!active) return;
      active = false;
      activeOutputStreams.delete(watcherKey(sessionId, toolCallId));
    },
  });
  activeOutputStreams.set(watcherKey(sessionId, toolCallId), stop);
}

/** Stop live output without changing the task or its status polling. */
export function stopBackgroundTaskStream(
  toolCallId: string,
  sessionId?: string,
): void {
  for (const [key, abort] of activeOutputStreams) {
    if (
      sessionId !== undefined
        ? key === watcherKey(sessionId, toolCallId)
        : key.endsWith(`\u0000${toolCallId}`)
    ) {
      activeOutputStreams.delete(key);
      abort();
    }
  }
}

/** Stop tracking a task, optionally limited to its session. */
export function stopBackgroundTaskWatcher(
  toolCallId: string,
  sessionId?: string,
): void {
  for (const [key, abort] of activeStatusWatchers) {
    if (
      sessionId !== undefined
        ? key === watcherKey(sessionId, toolCallId)
        : key.endsWith(`\u0000${toolCallId}`)
    ) {
      activeStatusWatchers.delete(key);
      abort();
    }
  }
  stopBackgroundTaskStream(toolCallId, sessionId);
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
  const hadOutputStream = activeOutputStreams.has(watcherKey(sid, toolCallId));
  stopBackgroundTaskWatcher(toolCallId, sessionId);
  try {
    await toolCallsApi.cancel(sid, toolCallId);
  } catch (err) {
    finalizedIds.delete(watcherKey(sid, toolCallId));
    startBackgroundTaskWatcher(sid, toolCallId);
    if (hadOutputStream) {
      startBackgroundTaskStream(sid, toolCallId);
    }
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
      .tasks.find(
        (t) => t.sessionId === sessionId && t.toolCallId === toolCallId,
      )?.liveOutput || "";
  useBackgroundTasksStore.getState().updateTaskForSession(sid, toolCallId, {
    status: "cancelled",
    result: live || null,
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
  const staleTasks = store.tasks.filter(
    (task) =>
      !backendSessionId ||
      !task.sessionId ||
      task.sessionId !== backendSessionId,
  );
  for (const task of staleTasks) {
    stopBackgroundTaskWatcher(task.toolCallId, task.sessionId);
  }
  store.removeTasksForSession(staleTasks);
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
      if (item.status !== "offloaded") continue;
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
