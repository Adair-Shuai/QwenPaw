import type { FilesDrawerEvent, FilesDrawerState } from "./types";

export const CLOSED_FILES_DRAWER: FilesDrawerState = { kind: "closed" };

export function filesDrawerReducer(
  state: FilesDrawerState,
  event: FilesDrawerEvent,
): FilesDrawerState {
  switch (event.type) {
    case "OPEN_PREVIEW":
      if (state.kind === "workspace") {
        return {
          kind: "workspace",
          target: event.target,
          trigger: event.trigger,
        };
      }
      return {
        kind: "preview",
        target: event.target,
        trigger: event.trigger,
      };
    case "OPEN_WORKSPACE":
      return {
        kind: "workspace",
        target: event.target,
        trigger: event.trigger,
        ...(event.mode ? { mode: event.mode } : {}),
        ...(event.simulationRunId
          ? { simulationRunId: event.simulationRunId }
          : {}),
        ...(event.interactionRequestId
          ? { interactionRequestId: event.interactionRequestId }
          : {}),
      };
    case "EXPAND_WORKSPACE":
      return state.kind === "preview"
        ? {
            kind: "workspace",
            target: state.target,
            trigger: state.trigger,
          }
        : state;
    case "COLLAPSE_TO_PREVIEW": {
      if (state.kind !== "workspace") return state;
      const target = event.target ?? state.target;
      return target
        ? {
            kind: "preview",
            target,
            trigger: state.trigger,
          }
        : state;
    }
    case "CLOSE":
      return CLOSED_FILES_DRAWER;
  }
}

/** The header expands a preview, then toggles the complete workspace. */
export function headerWorkspaceToggleEvent(
  state: FilesDrawerState,
  trigger: HTMLElement | null = null,
): FilesDrawerEvent {
  if (state.kind === "workspace") {
    return { type: "CLOSE" };
  }
  if (state.kind === "preview") return { type: "EXPAND_WORKSPACE" };
  return { type: "OPEN_WORKSPACE", trigger };
}
