import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppMessage } from "../../hooks/useAppMessage";
import type { FilesWorkspaceScope } from "./filesWorkspaceScope";
import type { FilesDrawerEvent, FileTarget } from "./types";
import { revealWorkspacePath } from "./workspaceReveal";
import { useInteractionNotifications } from "../user-input/useInteractionNotifications";
import {
  fileRequestMatchesScope,
  type FilePreviewScope,
} from "./openFilePreview";

/** Optional ownership for extension requests; existing unscoped events remain valid. */
export type WorkbenchRequestScope = FilePreviewScope;

interface WorkbenchRequestsOptions {
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
  isActive: () => boolean;
  getRuntimeSessionId: () => string | undefined;
  dispatch: (event: FilesDrawerEvent) => void;
}

/** Adapt extension events to the native session drawer without owning its state. */
export function useWorkbenchRequests({
  scope,
  isActive,
  getRuntimeSessionId,
  dispatch,
}: WorkbenchRequestsOptions): void {
  useInteractionNotifications({
    scope,
    isActive,
    getRuntimeSessionId,
    dispatch,
  });
  const { t } = useTranslation();
  const { message } = useAppMessage();

  useEffect(() => {
    let listening = true;
    const accepts = (request?: WorkbenchRequestScope | null) => {
      if (!listening || !isActive()) return false;
      // Hydration may resolve a runtime identity without changing the route.
      // Read it when the request arrives, not when the listener was installed.
      return fileRequestMatchesScope(
        request ?? undefined,
        scope,
        getRuntimeSessionId(),
      );
    };

    const revealFile = (event: Event) => {
      const detail = (
        event as CustomEvent<WorkbenchRequestScope & { target?: FileTarget }>
      ).detail;
      if (!accepts(detail)) return;
      const target = detail?.target;
      if (
        !target ||
        !["workspace", "attachment"].includes(target.source) ||
        typeof target.path !== "string" ||
        !target.path.trim()
      )
        return;
      void revealWorkspacePath({
        path: target.path,
        root: target.root ?? "project",
        chatId: scope.chatId,
        projectDirOverride: scope.chatId ? undefined : scope.projectDirOverride,
      }).catch(() => {
        if (accepts(detail))
          message.error(t("workspace.revealFailed", "无法在文件管理器中打开"));
      });
    };

    const openCompute = (event: Event) => {
      if (!accepts((event as CustomEvent<WorkbenchRequestScope>).detail))
        return;
      dispatch({ type: "OPEN_WORKSPACE", mode: "compute", trigger: null });
    };

    const openSimulation = (event: Event) => {
      const detail = (
        event as CustomEvent<WorkbenchRequestScope & { runId?: string }>
      ).detail;
      if (
        !accepts(detail) ||
        typeof detail?.runId !== "string" ||
        !/^[\w:.-]{1,160}$/.test(detail.runId)
      )
        return;
      dispatch({
        type: "OPEN_WORKSPACE",
        mode: "simulation",
        simulationRunId: detail.runId,
        trigger: null,
      });
    };

    const openInteraction = (event: Event) => {
      const detail = (
        event as CustomEvent<WorkbenchRequestScope & { requestId?: string }>
      ).detail;
      // New interactions require complete ownership; legacy events keep their own compatibility.
      if (!detail?.agentId || !detail.sessionId || !accepts(detail)) return;
      if (detail.requestId && !/^[\w.-]{1,160}$/.test(detail.requestId)) return;
      dispatch({
        type: "OPEN_WORKSPACE",
        mode: "interactions",
        interactionRequestId: detail.requestId,
        trigger: null,
      });
    };

    window.addEventListener("qwenpaw:reveal-file", revealFile);
    window.addEventListener("qwenpaw:open-compute-workbench", openCompute);
    window.addEventListener(
      "qwenpaw:open-interaction-workbench",
      openInteraction,
    );
    window.addEventListener(
      "qwenpaw:open-simulation-workbench",
      openSimulation,
    );
    return () => {
      listening = false;
      window.removeEventListener("qwenpaw:reveal-file", revealFile);
      window.removeEventListener("qwenpaw:open-compute-workbench", openCompute);
      window.removeEventListener(
        "qwenpaw:open-interaction-workbench",
        openInteraction,
      );
      window.removeEventListener(
        "qwenpaw:open-simulation-workbench",
        openSimulation,
      );
    };
  }, [scope, isActive, getRuntimeSessionId, dispatch, message, t]);
}
