import { workspaceApi } from "../../api/modules/workspace";
import type { FileSource, WorkspaceRoot } from "./types";

export const WORKSPACE_ROOT_TAB_PREFIX = "workspace-root::";

export interface EditorRevealTab {
  displayPath?: string;
  source?: FileSource;
  workspaceRoot?: WorkspaceRoot;
}

export function stripEditorTabPath(path: string): string {
  if (path.startsWith(WORKSPACE_ROOT_TAB_PREFIX)) {
    return path.slice(WORKSPACE_ROOT_TAB_PREFIX.length);
  }
  const separator = path.indexOf("::");
  return separator < 0 ? path : path.slice(separator + 2);
}

export function revealTargetFromEditorTab(
  tab: EditorRevealTab | undefined,
  tabPath: string,
): { path: string; root: WorkspaceRoot } | null {
  const separator = tabPath.indexOf("::");
  const sourceFromPath =
    separator < 0 || tabPath.startsWith(WORKSPACE_ROOT_TAB_PREFIX)
      ? "workspace"
      : (tabPath.slice(0, separator) as FileSource);
  const source = tab?.source ?? sourceFromPath;
  if (source !== "workspace") {
    return null;
  }

  const root: WorkspaceRoot =
    tab?.workspaceRoot ??
    (tabPath.startsWith(WORKSPACE_ROOT_TAB_PREFIX) ? "workspace" : "project");
  const path = (tab?.displayPath ?? stripEditorTabPath(tabPath))
    .trim()
    .replace(/\\/g, "/");
  if (!path) {
    return null;
  }
  return { path, root };
}

export async function revealWorkspacePath(options: {
  path: string;
  root?: WorkspaceRoot;
  chatId?: string;
  projectDirOverride?: string;
}): Promise<void> {
  const path = options.path.trim();
  if (!path) {
    throw new Error("Reveal path is empty");
  }
  await workspaceApi.revealInFileManager(
    path,
    options.chatId,
    options.root ?? "project",
    options.projectDirOverride,
  );
}
