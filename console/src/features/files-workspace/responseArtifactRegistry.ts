import { useSyncExternalStore } from "react";
import type { FileTarget } from "./types";

const groups = new Map<string, FileTarget[]>();
const listeners = new Set<() => void>();
const EMPTY_ARTIFACTS: FileTarget[] = [];
let snapshot: FileTarget[] = [];

function publish() {
  const seen = new Set<string>();
  snapshot = Array.from(groups.values())
    .flat()
    .filter((target) => {
      const key = target.artifact?.id ?? `${target.source}:${target.path}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  listeners.forEach((listener) => listener());
}

export function setResponseArtifactGroup(id: string, targets: FileTarget[]) {
  groups.set(id, targets);
  publish();
  return () => {
    groups.delete(id);
    publish();
  };
}

export function useResponseArtifacts(): FileTarget[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
    () => EMPTY_ARTIFACTS,
  );
}
