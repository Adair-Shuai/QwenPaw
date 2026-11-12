import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  addAnswerQuote,
  type AnswerQuoteSource,
} from "../../pages/Chat/answerQuotes";
import { getActiveSenderTextarea } from "../../pages/Chat/utils";
import { openFilePreview } from "./openFilePreview";
import { useWorkbenchTabsStore } from "./workbenchTabsStore";
import { useFilesSurfaceStore } from "../../stores/filesSurfaceStore";
import {
  filesWorkspaceScopeKey,
  type FilesWorkspaceScope,
} from "./filesWorkspaceScope";

type SessionScope = Extract<FilesWorkspaceScope, { kind: "session" }>;
interface WorkspaceQuotes {
  scope: SessionScope;
  add: (text: string, source: AnswerQuoteSource) => boolean;
}
const Context = createContext<WorkspaceQuotes | null>(null);

export function WorkspaceQuoteProvider({
  scope,
  draftKey,
  enabled,
  children,
}: {
  scope: SessionScope;
  draftKey: string;
  enabled: boolean;
  children: ReactNode;
}) {
  const { agentId, sessionId, chatId, projectDirOverride } = scope;
  const value = useMemo<WorkspaceQuotes | null>(() => {
    if (!enabled) return null;
    return {
      scope: {
        kind: "session",
        agentId,
        sessionId,
        chatId,
        projectDirOverride,
      },
      add: (text, source) => {
        const label =
          source.kind === "file"
            ? `${source.target.path}${
                source.target.line
                  ? `:${source.target.line}-${
                      source.target.endLine ?? source.target.line
                    }`
                  : ""
              }`
            : source.title;
        const added = addAnswerQuote(draftKey, {
          messageId: label,
          text,
          source,
        });
        if (added) getActiveSenderTextarea()?.focus();
        return added;
      },
    };
  }, [enabled, draftKey, agentId, sessionId, chatId, projectDirOverride]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWorkspaceQuotes() {
  return useContext(Context);
}

export function openQuoteSource(
  source: AnswerQuoteSource,
  currentScope?: SessionScope,
) {
  const draftSource =
    !source.scope.chatId &&
    (source.scope.sessionId === "new" ||
      /^\d+-[a-z0-9]+$/.test(source.scope.sessionId));
  const sameChat = Boolean(
    source.scope.chatId && source.scope.chatId === currentScope?.chatId,
  );
  const scope =
    currentScope?.agentId === source.scope.agentId && (draftSource || sameChat)
      ? currentScope
      : source.scope;
  if (source.kind === "file") {
    openFilePreview({ ...source.target, preferredView: "text" }, null, scope);
    return;
  }
  const key = filesWorkspaceScopeKey(scope);
  useWorkbenchTabsStore.getState().open(key, {
    id: "terminal:default",
    kind: "terminal",
    title: source.title,
    terminalTarget: { id: source.terminalId, nonce: crypto.randomUUID() },
  });
  useFilesSurfaceStore.getState().dispatchSession(key, {
    type: "OPEN_WORKSPACE",
    mode: "terminal",
    trigger: null,
  });
}
