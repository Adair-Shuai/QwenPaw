import { useEffect, useRef } from "react";

/** The host owns Router navigation. Native browser history is guarded here. */
export function useWorkflowNavigationGuard(
  dirty: boolean,
  confirmLeave: (retry: () => void) => void,
  persist: () => boolean,
) {
  const current = useRef({ dirty, confirmLeave, persist });
  current.current = { dirty, confirmLeave, persist };
  useEffect(() => {
    let index = window.history.state?.idx;
    let alive = true;
    let restoring = false;
    let replay: (() => void) | undefined;
    let allowedIndex: number | null | undefined;
    let expiry: ReturnType<typeof setTimeout> | undefined;
    const confirm = (retry: () => void, popDelta?: number) =>
      current.current.confirmLeave(() => {
        if (popDelta !== undefined) {
          allowedIndex = Number.isInteger(index) ? index + popDelta : null;
          clearTimeout(expiry);
          expiry = setTimeout(() => {
            allowedIndex = undefined;
          }, 1000);
        }
        retry();
        if (popDelta === undefined) index = window.history.state?.idx;
      });
    const navigating = (event: Event) => {
      const detail = (
        event as CustomEvent<{ to: string; retry: () => void; method?: string }>
      ).detail;
      if (!detail?.retry) return;
      index = window.history.state?.idx;
      if (detail.method !== "go")
        queueMicrotask(() => {
          if (alive && !event.defaultPrevented)
            index = window.history.state?.idx;
        });
      if (
        !current.current.dirty ||
        detail.to ===
          window.location.pathname +
            window.location.search +
            window.location.hash
      )
        return;
      event.preventDefault();
      const delta =
        detail.method === "go"
          ? Number(detail.to.replace(/^history:/, ""))
          : undefined;
      confirm(detail.retry, delta);
    };
    const pop = (event: PopStateEvent) => {
      const targetIndex = event.state?.idx;
      if (allowedIndex !== undefined) {
        const accepted = allowedIndex === null || allowedIndex === targetIndex;
        allowedIndex = undefined;
        clearTimeout(expiry);
        if (accepted) {
          index = targetIndex;
          return;
        }
      }
      if (restoring) {
        event.stopImmediatePropagation();
        restoring = false;
        if (replay) confirm(replay, replayDelta);
        return;
      }
      if (!current.current.dirty) {
        index = targetIndex;
        return;
      }
      current.current.persist();
      if (
        !Number.isInteger(index) ||
        !Number.isInteger(targetIndex) ||
        index === targetIndex
      )
        return;
      event.stopImmediatePropagation();
      const delta = targetIndex - index;
      replayDelta = delta;
      replay = () => window.history.go(delta);
      restoring = true;
      window.history.go(-delta);
    };
    let replayDelta = 0;
    window.addEventListener("qwenpaw:before-navigate", navigating);
    window.addEventListener("popstate", pop, true);
    return () => {
      alive = false;
      clearTimeout(expiry);
      window.removeEventListener("qwenpaw:before-navigate", navigating);
      window.removeEventListener("popstate", pop, true);
    };
  }, []);
}
