/**
 * In-memory cache for Coding Mode file contents.
 *
 *   • Keyed by Agent + coding project root + relative file path.
 *   • LRU-bounded so a marathon session doesn't bloat heap.
 *   • NOT persisted — file contents must never spill to localStorage.
 *   • Invalidated by the SSE workspace watcher when the file is modified
 *     or deleted; tab switches in the IDE then read straight from cache.
 *
 * Layout decision: ETag is stored alongside content so we can send
 * `If-None-Match` and short-circuit to 304 even after a hard refresh
 * (when the in-memory cache is gone but the browser HTTP cache may still
 * be primed). For pure tab-switch reads we just return content directly.
 */
import { create } from "zustand";

const MAX_ENTRIES = 50;

interface CacheEntry {
  content: string;
  etag: string | null;
  /** Monotonic counter — last access wins on eviction */
  touchedAt: number;
}

export interface WorkspaceFileScope {
  agentId: string;
  projectRoot: string | null | undefined;
}

function normalizeScopePart(value: string | null | undefined): string {
  if (!value) return "<default>";
  return value.replace(/\\/g, "/").replace(/\/+$/, "") || "<default>";
}

function normalizeFilePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function makeWorkspaceFileCacheKey(
  scope: WorkspaceFileScope,
  path: string,
): string {
  return [
    scope.agentId || "default",
    normalizeScopePart(scope.projectRoot),
    normalizeFilePath(path),
  ].join("\0");
}

interface CodeFileCacheState {
  entries: Map<string, CacheEntry>;
  counter: number;

  get: (scope: WorkspaceFileScope, path: string) => CacheEntry | undefined;
  set: (
    scope: WorkspaceFileScope,
    path: string,
    content: string,
    etag: string | null,
  ) => void;
  invalidate: (scope: WorkspaceFileScope, path: string) => void;
  clear: () => void;
}

export const useCodeFileCacheStore = create<CodeFileCacheState>((set, get) => ({
  entries: new Map(),
  counter: 0,

  get: (scope, path) => {
    const entry = get().entries.get(makeWorkspaceFileCacheKey(scope, path));
    if (!entry) return undefined;
    // Bump touchedAt on read so LRU reflects access patterns
    entry.touchedAt = ++get().counter;
    return entry;
  },

  set: (scope, path, content, etag) => {
    set((state) => {
      const next = new Map(state.entries);
      const newCounter = state.counter + 1;
      next.set(makeWorkspaceFileCacheKey(scope, path), {
        content,
        etag,
        touchedAt: newCounter,
      });

      // LRU eviction
      if (next.size > MAX_ENTRIES) {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;
        for (const [k, v] of next) {
          if (v.touchedAt < oldestTime) {
            oldestTime = v.touchedAt;
            oldestKey = k;
          }
        }
        if (oldestKey !== null) next.delete(oldestKey);
      }

      return { entries: next, counter: newCounter };
    });
  },

  invalidate: (scope, path) => {
    set((state) => {
      const key = makeWorkspaceFileCacheKey(scope, path);
      if (!state.entries.has(key)) return state;
      const next = new Map(state.entries);
      next.delete(key);
      return { entries: next };
    });
  },

  clear: () => set({ entries: new Map(), counter: 0 }),
}));
