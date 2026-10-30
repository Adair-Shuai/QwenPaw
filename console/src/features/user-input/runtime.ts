import { useSyncExternalStore } from "react";
import type { InteractionRuntime } from "./types";

const eventName = "qwenpaw:openui-task-layout-ready";
export function getInteractionRuntime(): InteractionRuntime | undefined {
  return (
    window.QwenPaw as
      | (typeof window.QwenPaw & { openui?: InteractionRuntime })
      | undefined
  )?.openui;
}
const subscribe = (listener: () => void) => {
  window.addEventListener(eventName, listener);
  return () => window.removeEventListener(eventName, listener);
};
export function useInteractionRuntime() {
  return useSyncExternalStore(
    subscribe,
    getInteractionRuntime,
    () => undefined,
  );
}
