import { getHost } from "../core/runtime";
import { hostViewerOptions, type WorkspaceFileRef } from "./hostAdapter";
import { loadViewerRuntime } from "./viewerLoader";
import type {
  ViewerHandle,
  ViewerMountOptions,
} from "./viewer/contracts/types";

export type EmbedOptions = Partial<ViewerMountOptions> & {
  scope?: WorkspaceFileRef;
  signal?: AbortSignal;
};

/** Shared entry for application cards, dashboards and workspace surfaces. */
export async function mountVisualization(
  container: HTMLElement,
  options: EmbedOptions = {},
): Promise<ViewerHandle> {
  const { scope, signal, ...mountOptions } = options;
  signal?.throwIfAborted();
  const hostOptions = hostViewerOptions(getHost(), scope);
  const runtime = await loadViewerRuntime();
  signal?.throwIfAborted();
  return runtime.mount(container, {
    ...hostOptions,
    autoLoad: false,
    enableCommands: false,
    ...mountOptions,
  });
}
