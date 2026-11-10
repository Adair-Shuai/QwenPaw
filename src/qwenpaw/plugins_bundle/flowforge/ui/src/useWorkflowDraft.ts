import { useEffect, useMemo, useRef, useState } from "react";
import { fingerprint, type FlowDocument } from "./model";
import {
  draftScopePrefix,
  readDrafts,
  removeDraft,
  writeDraft,
  type DraftScope,
  type StoredDraft,
} from "./draftStore";

interface DraftVisit {
  scope: DraftScope;
  ownerId: string;
  loaded: boolean;
  dirty: boolean;
  document: FlowDocument | null;
  own: StoredDraft | null;
  adopted: StoredDraft[];
  baseRevision: number;
}

export function useWorkflowDraft({
  userId,
  agentId,
  flowId,
  current,
  dirty,
}: DraftScope & { current: FlowDocument | null; dirty: boolean }) {
  const scopeKey = JSON.stringify([userId, agentId, flowId]);
  const visit = useMemo<DraftVisit>(
    () => ({
      scope: { userId, agentId, flowId },
      ownerId: crypto.randomUUID(),
      loaded: false,
      dirty: false,
      document: null,
      own: null,
      adopted: [],
      baseRevision: 0,
    }),
    [scopeKey],
  );
  const active = useRef(visit);
  active.current = visit;
  visit.document = current?.id === flowId ? current : null;
  visit.dirty = dirty;
  const [candidates, setCandidates] = useState<StoredDraft[]>([]);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pendingRecovery, setPendingRecovery] = useState(false);

  const persist = (owner = visit, notify = true) => {
    if (
      !owner.loaded ||
      owner.scope.userId === "pending" ||
      !owner.dirty ||
      !owner.document
    )
      return true;
    try {
      const updatedAt = Date.now();
      owner.own = writeDraft(owner.scope, {
        version: 1,
        ownerId: owner.ownerId,
        updatedAt,
        baseRevision: owner.document.revision ?? owner.baseRevision,
        document: owner.document,
      });
      if (notify && active.current === owner) {
        setSavedAt(updatedAt);
        setError("");
      }
      return true;
    } catch (failure: any) {
      if (notify && active.current === owner)
        setError(failure.message || String(failure));
      return false;
    }
  };

  const prepare = (server: FlowDocument) => {
    visit.loaded = true;
    visit.baseRevision = server.revision ?? 0;
    setSavedAt(null);
    setError("");
    if (userId === "pending") return;
    try {
      const existing = readDrafts(visit.scope, localStorage, (failure) =>
        setError(failure.message),
      ).filter(
        (draft) => fingerprint(draft.value.document) !== fingerprint(server),
      );
      setCandidates(existing);
      setPendingRecovery(existing.length > 0);
    } catch (failure: any) {
      setError(failure.message || String(failure));
    }
  };
  const adopt = (draft: StoredDraft, revision?: number): FlowDocument => {
    visit.adopted.push(draft);
    setPendingRecovery(false);
    setCandidates((previous) =>
      previous.filter((entry) => entry.key !== draft.key),
    );
    return {
      ...draft.value.document,
      revision: revision ?? draft.value.baseRevision,
    };
  };
  const discard = (draft: StoredDraft) => {
    try {
      removeDraft(draft);
      setCandidates((previous) =>
        previous.filter((entry) => entry.key !== draft.key),
      );
      setPendingRecovery(false);
    } catch (failure: any) {
      setError(failure.message || String(failure));
    }
  };
  const markSaved = (saved: FlowDocument) => {
    try {
      if (
        visit.own &&
        fingerprint(visit.own.value.document) === fingerprint(saved)
      ) {
        removeDraft(visit.own);
        visit.own = null;
      }
      visit.adopted.forEach((record) => removeDraft(record));
      visit.adopted = [];
      visit.baseRevision = saved.revision ?? visit.baseRevision;
      setError("");
      setSavedAt(null);
    } catch (failure: any) {
      setError(failure.message || String(failure));
    }
  };
  const discardOwn = () => {
    try {
      if (visit.own) removeDraft(visit.own);
      visit.adopted.forEach((record) => removeDraft(record));
      visit.own = null;
      visit.adopted = [];
      visit.dirty = false;
      return true;
    } catch (failure: any) {
      setError(failure.message || String(failure));
      return false;
    }
  };
  const currentKey = current ? fingerprint(current) : "";
  useEffect(() => {
    if (!visit.loaded || !dirty || pendingRecovery) return;
    const timer = setTimeout(() => persist(visit), 300);
    return () => clearTimeout(timer);
  }, [visit, currentKey, current?.revision, dirty, pendingRecovery]);
  useEffect(() => {
    const flush = () => {
      persist(visit);
    };
    const changed = (event: StorageEvent) => {
      if (!event.key?.startsWith(draftScopePrefix(visit.scope))) return;
      try {
        const existing = readDrafts(visit.scope, localStorage, (failure) =>
          setError(failure.message),
        ).filter(
          (draft) =>
            draft.value.ownerId !== visit.ownerId &&
            !visit.adopted.some((source) => source.raw === draft.raw),
        );
        setCandidates(existing);
      } catch (failure: any) {
        setError(failure.message || String(failure));
      }
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    window.addEventListener("storage", changed);
    return () => {
      persist(visit, false);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("storage", changed);
    };
  }, [visit]);
  return {
    candidates,
    error,
    savedAt,
    pendingRecovery,
    prepare,
    persist,
    adopt,
    discard,
    markSaved,
    discardOwn,
    dismiss: () => setPendingRecovery(false),
  };
}
