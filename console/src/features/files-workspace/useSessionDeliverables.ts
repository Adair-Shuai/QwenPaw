import { useCallback, useEffect, useState } from "react";
import {
  turnFilesApi,
  TURN_FILES_UPDATED_EVENT,
} from "../../api/modules/turnFiles";
import type { FileTarget } from "./types";
import {
  responseArtifactIdentity,
  type ResponseArtifactScope,
} from "./responseArtifactRegistry";
import {
  fileRequestMatchesScope,
  type FilePreviewScope,
} from "./openFilePreview";
import { turnFileTarget } from "./turnFileTarget";

interface DeliverablesState {
  key: string;
  artifacts: FileTarget[];
  loading: boolean;
  error: boolean;
  hasMore: boolean;
  nextOffset: number;
}

/** Persistent results remain readable when bubbles are virtualized or history is reloaded. */
export function useSessionDeliverables(
  scope: ResponseArtifactScope | undefined,
  active: boolean,
) {
  const agentId = scope?.agentId;
  const sessionId = scope?.sessionId;
  const chatId = scope?.chatId;
  const key = JSON.stringify([agentId, sessionId, chatId]);
  const [request, setRequest] = useState({ key, offset: 0, revision: 0 });
  const offset = request.key === key ? request.offset : 0;
  const revision = request.key === key ? request.revision : 0;
  const [state, setState] = useState<DeliverablesState>({
    key: "",
    artifacts: [],
    loading: false,
    error: false,
    hasMore: false,
    nextOffset: 0,
  });
  const refresh = useCallback(
    () =>
      setRequest((previous) => ({
        key,
        offset: 0,
        revision: previous.revision + 1,
      })),
    [key],
  );
  const loadMore = useCallback(() => {
    if (state.key !== key || state.loading || !state.hasMore) return;
    setRequest((previous) => ({
      key,
      offset: state.nextOffset,
      revision: previous.revision + 1,
    }));
  }, [key, state.key, state.loading, state.hasMore, state.nextOffset]);

  useEffect(() => {
    if (request.key !== key) setRequest({ key, offset: 0, revision: 0 });
  }, [key, request.key]);

  useEffect(() => {
    if (!agentId || !sessionId || !active) return;
    const requestScope: ResponseArtifactScope = {
      kind: "session",
      agentId,
      sessionId,
      chatId,
    };
    let cancelled = false;
    setState((previous) => ({
      key,
      artifacts: previous.key === key ? previous.artifacts : [],
      loading: true,
      error: false,
      hasMore: previous.key === key && previous.hasMore,
      nextOffset: previous.key === key ? previous.nextOffset : 0,
    }));
    void turnFilesApi
      .list(requestScope, { offset, limit: 100, refresh: revision > 0 })
      .then((page) => {
        if (cancelled) return;
        const hasMore = Boolean(page.has_more);
        const nextOffset = page.next_offset ?? offset + page.turns.length;
        if (hasMore && (!Number.isInteger(nextOffset) || nextOffset <= offset))
          throw new Error("Result history did not advance");
        const loaded = page.turns.flatMap((turn) =>
          turn.files
            .filter(
              (file) =>
                (file.delivered ||
                  ((file.status === "created" || file.status === "modified") &&
                    /^output\//i.test(file.path.replace(/\\/g, "/")))) &&
                file.after_available &&
                file.status !== "deleted",
            )
            .map((file) => turnFileTarget(requestScope, turn, file)),
        );
        setState((previous) => {
          const combined = new Map<string, FileTarget>();
          for (const artifact of [
            ...(offset > 0 && previous.key === key ? previous.artifacts : []),
            ...loaded,
          ]) {
            combined.set(responseArtifactIdentity(artifact), artifact);
          }
          return {
            key,
            artifacts: Array.from(combined.values()),
            loading: false,
            error: false,
            hasMore,
            nextOffset,
          };
        });
      })
      .catch(() => {
        if (!cancelled)
          setState((previous) => ({
            ...previous,
            key,
            artifacts: previous.key === key ? previous.artifacts : [],
            loading: false,
            error: true,
          }));
      });
    return () => {
      cancelled = true;
    };
  }, [active, agentId, sessionId, chatId, key, offset, revision]);

  useEffect(() => {
    if (!agentId || !sessionId || !active) return;
    const requestScope: ResponseArtifactScope = {
      kind: "session",
      agentId,
      sessionId,
      chatId,
    };
    const updated = (event: Event) => {
      const detail = (event as CustomEvent<FilePreviewScope>).detail;
      if (
        detail?.agentId &&
        detail.sessionId &&
        fileRequestMatchesScope(detail, requestScope)
      )
        refresh();
    };
    window.addEventListener(TURN_FILES_UPDATED_EVENT, updated);
    return () => window.removeEventListener(TURN_FILES_UPDATED_EVENT, updated);
  }, [active, agentId, sessionId, chatId, refresh]);

  // Hide old results during the render that changes scope, before effects run.
  return {
    artifacts: state.key === key ? state.artifacts : [],
    loading: state.key === key ? state.loading : active,
    loadingMore: state.key === key && state.loading && offset > 0,
    error: state.key === key && state.error,
    moreError: state.key === key && state.error && offset > 0,
    hasMore: state.key === key && state.hasMore,
    refresh,
    loadMore,
  };
}
