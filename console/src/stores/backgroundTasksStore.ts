import { create } from "zustand";

export type BackgroundTaskStatus = "running" | "done" | "cancelled";

export interface BackgroundTask {
  toolCallId: string;
  toolName: string;
  sessionId: string;
  startTime: number;
  /** Frozen when status becomes done/cancelled; used for stable duration display. */
  endTime: number | null;
  status: BackgroundTaskStatus;
  /** SSE incremental text (may be truncated). */
  liveOutput: string;
  /** Final result text after completion. */
  result: string | null;
  /** Show purple system-hint strip in the panel. */
  hintVisible: boolean;
}

interface BackgroundTasksState {
  tasks: BackgroundTask[];
  addTask: (
    task: Omit<
      BackgroundTask,
      "status" | "liveOutput" | "result" | "hintVisible" | "endTime"
    >,
  ) => void;
  updateTask: (
    toolCallId: string,
    updates: Partial<
      Pick<
        BackgroundTask,
        | "status"
        | "liveOutput"
        | "result"
        | "hintVisible"
        | "toolName"
        | "endTime"
      >
    >,
  ) => void;
  appendLiveOutput: (toolCallId: string, chunk: string) => void;
  removeTask: (toolCallId: string) => void;
  removeTasks: (toolCallIds: string[]) => void;
  dismissHint: (toolCallId: string) => void;
  updateTaskForSession: (
    sessionId: string,
    toolCallId: string,
    updates: Parameters<BackgroundTasksState["updateTask"]>[1],
  ) => void;
  appendLiveOutputForSession: (sessionId: string, toolCallId: string, chunk: string) => void;
  removeTasksForSession: (tasks: Array<{ sessionId: string; toolCallId: string }>) => void;
}

const LIVE_OUTPUT_MAX = 80_000;

function truncateLive(text: string): string {
  if (text.length <= LIVE_OUTPUT_MAX) return text;
  return text.slice(text.length - LIVE_OUTPUT_MAX);
}

export const useBackgroundTasksStore = create<BackgroundTasksState>((set) => ({
  tasks: [],

  addTask: (task) =>
    set((state) => {
      if (state.tasks.some((t) => t.sessionId === task.sessionId && t.toolCallId === task.toolCallId)) {
        return state;
      }
      return {
        tasks: [
          ...state.tasks,
          {
            ...task,
            status: "running",
            endTime: null,
            liveOutput: "",
            result: null,
            hintVisible: false,
          },
        ],
      };
    }),

  updateTask: (toolCallId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.toolCallId !== toolCallId) return t;
        const next = { ...t, ...updates };
        const becomingTerminal =
          (updates.status === "done" || updates.status === "cancelled") &&
          t.endTime == null &&
          next.endTime == null;
        if (becomingTerminal) {
          next.endTime = Date.now();
        }
        return next;
      }),
    })),

  appendLiveOutput: (toolCallId, chunk) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.toolCallId === toolCallId
          ? { ...t, liveOutput: truncateLive(t.liveOutput + chunk) }
          : t,
      ),
    })),

  removeTask: (toolCallId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.toolCallId !== toolCallId),
    })),

  removeTasks: (toolCallIds) =>
    set((state) => {
      if (toolCallIds.length === 0) return state;
      const drop = new Set(toolCallIds);
      return {
        tasks: state.tasks.filter((t) => !drop.has(t.toolCallId)),
      };
    }),

  dismissHint: (toolCallId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.toolCallId === toolCallId ? { ...t, hintVisible: false } : t,
      ),
    })),

  updateTaskForSession: (sessionId, toolCallId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.sessionId === sessionId && t.toolCallId === toolCallId
          ? (() => {
              const next = { ...t, ...updates };
              if (
                (updates.status === "done" || updates.status === "cancelled") &&
                t.endTime == null &&
                next.endTime == null
              ) next.endTime = Date.now();
              return next;
            })()
          : t,
      ),
    })),

  appendLiveOutputForSession: (sessionId, toolCallId, chunk) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.sessionId === sessionId && t.toolCallId === toolCallId
          ? { ...t, liveOutput: truncateLive(t.liveOutput + chunk) }
          : t,
      ),
    })),

  removeTasksForSession: (items) =>
    set((state) => {
      if (items.length === 0) return state;
      const drop = new Set(items.map((item) => `${item.sessionId}\u0000${item.toolCallId}`));
      return { tasks: state.tasks.filter((t) => !drop.has(`${t.sessionId}\u0000${t.toolCallId}`)) };
    }),
}));

export function selectTasksForSession(
  tasks: BackgroundTask[],
  sessionId: string,
): BackgroundTask[] {
  // Empty/pending filter → show nothing (avoid cross-session flash).
  // Tasks with empty sessionId must NOT appear under other sessions.
  if (!sessionId) return [];
  return tasks.filter((t) => t.sessionId === sessionId);
}
