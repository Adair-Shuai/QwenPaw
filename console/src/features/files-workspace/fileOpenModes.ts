import { addRouterBasename } from "../../utils/navigationMode";
import { chatProjectDirectoryApi } from "../../api/modules/chatProjectDirectory";
import { projectDirectoryApi } from "../../api/modules/projectDirectory";
import {
  isAbsoluteLocalFilePath,
  toProjectRelativePath,
} from "./internalFileLinks";
import type { FileTarget } from "./types";

const TEXT_DECK_EXTENSIONS = new Set(["data", "dat", "inc", "grdecl"]);

const OIL_GAS_VISUALIZATION_EXTENSIONS = new Set([
  "egrid",
  "grid",
  "grdecl",
  "init",
  "unrst",
  "roff",
  "roffbin",
  "dat",
  "sr3",
  "irf",
  "data",
  "model",
  "tnav",
  "tpr",
  "las",
  "las3",
  "dlis",
  "vtk",
  "vtu",
  "pvtu",
  "vti",
  "xdmf",
  "arrow",
  "parquet",
  "well.json",
  "surface.json",
  "network.json",
]);

export interface VisualizationOpenContext {
  agentId?: string;
  chatId?: string;
  projectDirOverride?: string;
}

export function fileExtension(path: string): string {
  const name = path.replace(/\\/g, "/").split("/").pop()?.toLowerCase() ?? "";
  const compound = ["well.json", "surface.json", "network.json"].find((ext) =>
    name.endsWith(`.${ext}`),
  );
  if (compound) return compound;
  return name.includes(".") ? name.split(".").pop() ?? "" : "";
}

export function isEclipseTextDeck(path: string): boolean {
  return TEXT_DECK_EXTENSIONS.has(fileExtension(path));
}

export function supportsOilGasVisualization(path: string): boolean {
  return OIL_GAS_VISUALIZATION_EXTENSIONS.has(fileExtension(path));
}

export function withDefaultFileView(target: FileTarget): FileTarget {
  if (target.preferredView || !isEclipseTextDeck(target.path)) return target;
  return { ...target, preferredView: "text" };
}

export async function resolveVisualizationTarget(
  target: FileTarget,
  context: VisualizationOpenContext = {},
): Promise<FileTarget> {
  if (!isAbsoluteLocalFilePath(target.path)) {
    return {
      ...target,
      source: "workspace",
      root: target.root ?? "project",
      artifactUrl: undefined,
    };
  }

  try {
    const agentInfo = await projectDirectoryApi.get();
    const projectDirs = context.chatId
      ? (await chatProjectDirectoryApi.getProjectDirs(context.chatId))
          .project_dirs
      : [
          {
            path: agentInfo.path,
            is_workspace: false,
          },
        ];
    const candidates = projectDirs.length
      ? projectDirs
      : [{ path: agentInfo.path, is_workspace: false }];

    for (let index = 0; index < candidates.length; index += 1) {
      const directory = candidates[index];
      const relativePath = toProjectRelativePath(target.path, directory.path);
      if (!relativePath) continue;
      const root = directory.is_workspace
        ? "workspace"
        : index === 0
        ? "project"
        : (`project:${directory.path}` as const);
      return {
        ...target,
        source: "workspace",
        path: relativePath,
        root,
        artifactUrl: undefined,
        artifact: target.artifact
          ? {
              ...target.artifact,
              workspacePath: relativePath,
              workspaceRoot: root,
            }
          : undefined,
      };
    }
  } catch {
    // Preserve the original target; the renderer will surface a scoped error.
  }
  return target;
}

export function visualizationCenterHref(
  target: FileTarget,
  context: VisualizationOpenContext = {},
): string {
  const search = new URLSearchParams({
    path: target.path,
    root: target.root ?? "project",
    name: target.path.replace(/\\/g, "/").split("/").pop() || target.path,
  });
  if (context.agentId) search.set("agentId", context.agentId);
  if (context.chatId) search.set("chatId", context.chatId);
  if (context.projectDirOverride) {
    search.set("projectDirOverride", context.projectDirOverride);
  }
  const route = addRouterBasename(
    window.location.pathname,
    `/oilgas-visualization?${search.toString()}`,
  );
  return new URL(route, window.location.origin).toString();
}

export function openVisualizationCenter(
  target: FileTarget,
  context: VisualizationOpenContext = {},
  openedWindow?: Window | null,
): Window | null {
  const href = visualizationCenterHref(target, context);
  if (openedWindow) {
    openedWindow.location.href = href;
    return openedWindow;
  }
  if (openedWindow === null) {
    window.location.assign(href);
    return null;
  }
  const nextWindow = window.open(href, "_blank");
  if (nextWindow) {
    nextWindow.opener = null;
    return nextWindow;
  }
  window.location.assign(href);
  return null;
}
