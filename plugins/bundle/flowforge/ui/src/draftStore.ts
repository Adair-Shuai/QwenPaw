import type { FlowDocument } from "./model";

export interface DraftScope {
  userId: string;
  agentId: string;
  flowId: string;
}
export interface WorkflowDraft {
  version: 1;
  ownerId: string;
  updatedAt: number;
  baseRevision: number;
  document: FlowDocument;
}
export interface StoredDraft {
  key: string;
  raw: string;
  value: WorkflowDraft;
}

export const DRAFT_PREFIX = "flowforge:editor-draft:v1:";
export function draftScopePrefix(scope: DraftScope) {
  return DRAFT_PREFIX + encodeURIComponent(JSON.stringify(scope)) + ":";
}

/** Every editor owns a separate record, including duplicated browser tabs. */
export function writeDraft(
  scope: DraftScope,
  draft: WorkflowDraft,
  storage: Storage = window.localStorage,
): StoredDraft {
  const key = draftScopePrefix(scope) + draft.ownerId;
  const raw = JSON.stringify(draft);
  storage.setItem(key, raw);
  return { key, raw, value: draft };
}

export function readDrafts(
  scope: DraftScope,
  storage: Storage = window.localStorage,
  onInvalid?: (failure: Error) => void,
): StoredDraft[] {
  const prefix = draftScopePrefix(scope);
  const drafts: StoredDraft[] = [];
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(prefix)) continue;
    const raw = storage.getItem(key);
    if (!raw) continue;
    try {
      const value = JSON.parse(raw) as WorkflowDraft;
      if (
        value.version !== 1 ||
        value.document?.id !== scope.flowId ||
        !value.document.nodes ||
        typeof value.document.nodes !== "object" ||
        Array.isArray(value.document.nodes) ||
        !Array.isArray(value.document.edges) ||
        typeof value.ownerId !== "string" ||
        !Number.isFinite(value.updatedAt) ||
        !Number.isInteger(value.baseRevision) ||
        value.baseRevision < 0
      )
        throw new Error("Invalid workflow draft");
      drafts.push({ key, raw, value });
    } catch (failure) {
      onInvalid?.(
        failure instanceof Error ? failure : new Error(String(failure)),
      );
    }
  }
  return drafts.sort(
    (left, right) => right.value.updatedAt - left.value.updatedAt,
  );
}

/** Clear only the exact record the user reviewed, preserving concurrent edits. */
export function removeDraft(
  draft: StoredDraft,
  storage: Storage = window.localStorage,
) {
  if (storage.getItem(draft.key) === draft.raw) storage.removeItem(draft.key);
}
