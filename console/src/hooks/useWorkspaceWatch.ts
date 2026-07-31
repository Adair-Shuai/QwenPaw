/** Subscribe to the workspace file-change SSE stream for one Agent/project. */
import { useEffect, useMemo, useRef } from "react";
import { workspaceApi } from "../api/modules/workspace";
import { buildAuthHeaders } from "../api/authHeaders";
import { useAgentStore } from "../stores/agentStore";
import { useCodingModeStore } from "../stores/codingModeStore";
import {
  makeWorkspaceFileCacheKey,
  type WorkspaceFileScope,
} from "../stores/codeFileCacheStore";

export interface FileChangeEvent {
  change: "added" | "modified" | "deleted";
  path: string;
}

type FileChangeCallback = (events: FileChangeEvent[]) => void;

interface WatchConnection {
  scope: WorkspaceFileScope;
  listeners: Set<FileChangeCallback>;
  controller: AbortController;
  running: boolean;
}

const connections = new Map<string, WatchConnection>();

function scopeKey(scope: WorkspaceFileScope): string {
  return makeWorkspaceFileCacheKey(scope, "<watch>");
}

function emit(connection: WatchConnection, events: FileChangeEvent[]) {
  connection.listeners.forEach((callback) => {
    try {
      callback(events);
    } catch {
      // A consumer failure must not stop the shared SSE connection.
    }
  });
}

async function runLoop(connection: WatchConnection) {
  const { signal } = connection.controller;
  const url = workspaceApi.getWatchUrl();
  let retryDelay = 1_000;

  while (!signal.aborted) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: buildAuthHeaders(connection.scope.agentId),
        signal,
      });

      if (!response.ok || !response.body) {
        await sleep(retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30_000);
        continue;
      }

      retryDelay = 1_000;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw) continue;
          try {
            const message = JSON.parse(raw) as {
              type: string;
              events?: FileChangeEvent[];
            };
            if (message.type === "file_change" && message.events) {
              emit(connection, message.events);
            }
          } catch {
            // Ignore malformed SSE messages and keep the stream alive.
          }
        }
      }
    } catch (error) {
      if (signal.aborted) break;
      if (error instanceof DOMException && error.name === "AbortError") break;
      await sleep(retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30_000);
    }
  }

  connection.running = false;
}

function ensureConnection(scope: WorkspaceFileScope): WatchConnection {
  const key = scopeKey(scope);
  const existing = connections.get(key);
  if (existing) return existing;

  const connection: WatchConnection = {
    scope,
    listeners: new Set(),
    controller: new AbortController(),
    running: true,
  };
  connections.set(key, connection);
  void runLoop(connection);
  return connection;
}

function releaseConnection(connection: WatchConnection) {
  if (connection.listeners.size > 0) return;
  connection.controller.abort();
  connection.running = false;
  connections.delete(scopeKey(connection.scope));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useWorkspaceWatch(
  onFileChange: FileChangeCallback,
  enabled = true,
  scopeOverride?: WorkspaceFileScope,
): void {
  const selectedAgent = useAgentStore((state) => state.selectedAgent);
  const projectRoot = useCodingModeStore(
    (state) => state.projectDirByAgent[selectedAgent],
  );
  const scope = useMemo<WorkspaceFileScope>(
    () =>
      scopeOverride ?? {
        agentId: selectedAgent,
        projectRoot,
      },
    [projectRoot, scopeOverride, selectedAgent],
  );
  const key = scopeKey(scope);

  const callbackRef = useRef<FileChangeCallback>(onFileChange);
  callbackRef.current = onFileChange;

  useEffect(() => {
    if (!enabled) return undefined;

    const connection = ensureConnection(scope);
    const listener: FileChangeCallback = (events) =>
      callbackRef.current(events);
    connection.listeners.add(listener);

    return () => {
      connection.listeners.delete(listener);
      releaseConnection(connection);
    };
  }, [enabled, key, scope]);
}
