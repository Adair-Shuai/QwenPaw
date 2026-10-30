import { createContext, useContext } from "react";
import type { FilesWorkspaceScope } from "./filesWorkspaceScope";

export const TurnFilesScopeContext = createContext<
  Extract<FilesWorkspaceScope, { kind: "session" }> | undefined
>(undefined);

export const TurnFilesScopeProvider = TurnFilesScopeContext.Provider;
export const useTurnFilesScope = () => useContext(TurnFilesScopeContext);
