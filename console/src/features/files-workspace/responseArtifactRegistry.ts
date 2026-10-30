import { useSyncExternalStore } from "react";
import type { FileTarget } from "./types";
import type { FilesWorkspaceScope } from "./filesWorkspaceScope";

export type ResponseArtifactScope = Extract<
  FilesWorkspaceScope,
  { kind: "session" }
>;
interface ArtifactGroup {
  scopeKey: string;
  targets: FileTarget[];
}

const groups = new Map<string, ArtifactGroup>();
const listeners = new Set<() => void>();
const EMPTY_ARTIFACTS: FileTarget[] = [];
let snapshots = new Map<string, FileTarget[]>();

function scopeKey(scope?: ResponseArtifactScope): string {
  // Unscoped legacy bubbles may render locally but never enter a session shelf.
  return scope ? JSON.stringify([scope.agentId, scope.sessionId]) : "legacy";
}

export function responseArtifactIdentity(target: FileTarget): string {
  return JSON.stringify([
    target.source,
    target.root ?? "",
    target.artifact?.id ?? target.path.replace(/\\/g, "/"),
    target.source === "attachment" ? target.artifactUrl ?? "" : "",
  ]);
}

function publish() {
  const grouped = new Map<string, Map<string, FileTarget>>();
  for (const group of groups.values()) {
    const targets =
      grouped.get(group.scopeKey) ?? new Map<string, FileTarget>();
    for (const target of group.targets) {
      targets.set(responseArtifactIdentity(target), target);
    }
    grouped.set(group.scopeKey, targets);
  }
  snapshots = new Map(
    Array.from(grouped, ([key, targets]) => [
      key,
      Array.from(targets.values()),
    ]),
  );
  listeners.forEach((listener) => listener());
}

export function setResponseArtifactGroup(
  id: string,
  targets: FileTarget[],
  scope?: ResponseArtifactScope,
) {
  const group = { scopeKey: scopeKey(scope), targets };
  groups.set(id, group);
  publish();
  return () => {
    // A late cleanup from an old render cannot remove its replacement.
    if (groups.get(id) !== group) return;
    groups.delete(id);
    publish();
  };
}

export function useResponseArtifacts(
  scope?: ResponseArtifactScope,
): FileTarget[] {
  const key = scopeKey(scope);
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshots.get(key) ?? EMPTY_ARTIFACTS,
    () => EMPTY_ARTIFACTS,
  );
}
