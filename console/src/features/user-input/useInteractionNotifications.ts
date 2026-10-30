import { useEffect } from "react";
import type { FilesDrawerEvent } from "../files-workspace/types";
import type { FilesWorkspaceScope } from "../files-workspace/filesWorkspaceScope";
import { interactionApi } from "./api";
import { useInteractionRuntime } from "./runtime";

interface Options {
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
  isActive: () => boolean;
  getRuntimeSessionId: () => string | undefined;
  dispatch: (event: FilesDrawerEvent) => void;
}

/** Lives with the active chat, so requests can reveal a currently closed drawer. */
export function useInteractionNotifications({
  scope,
  isActive,
  getRuntimeSessionId,
  dispatch,
}: Options) {
  const runtime = useInteractionRuntime();
  useEffect(() => {
    if (!runtime?.InteractionForm) return;
    let disposed = false;
    const seen = new Set<string>();
    let busy = false;
    let controller: AbortController | undefined;
    const check = async () => {
      if (disposed || busy || !isActive()) return;
      const sessionId = getRuntimeSessionId();
      if (!sessionId || sessionId === "new") return;
      busy = true;
      controller = new AbortController();
      try {
        const { requests } = await interactionApi.list(
          { agentId: scope.agentId, sessionId },
          controller.signal,
        );
        if (disposed || !isActive() || getRuntimeSessionId() !== sessionId)
          return;
        const owned = requests.filter(
          (item) =>
            item.status === "pending" &&
            item.agent_id === scope.agentId &&
            item.session_id === sessionId,
        );
        // Another request must not replace a form the user is already filling.
        if (owned.some((item) => seen.has(item.id))) return;
        const pending = owned.find((item) => !seen.has(item.id));
        if (pending) {
          seen.add(pending.id);
          dispatch({
            type: "OPEN_WORKSPACE",
            mode: "interactions",
            interactionRequestId: pending.id,
            trigger: null,
          });
        }
      } catch {
        /* The panel provides explicit load errors and retry; background discovery stays quiet. */
      } finally {
        busy = false;
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 2500);
    return () => {
      disposed = true;
      controller?.abort();
      window.clearInterval(timer);
    };
  }, [runtime, scope, isActive, getRuntimeSessionId, dispatch]);
}
