/** After a desktop-core install, the next session should check components. */
export const RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY =
  "ugsci.resumeComponentUpdatesAfterCore";

export const RESUME_COMPONENT_UPDATES_RETRY_MS = 2000;

let markedInThisRuntime = false;

export function markResumeComponentUpdatesAfterCore(): void {
  markedInThisRuntime = true;
  try {
    window.localStorage.setItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY, "1");
  } catch {
    // Private mode / quota must not block a core install.
  }
}

export function hasResumeComponentUpdatesAfterCore(): boolean {
  // The same JS runtime that queued the core install must not consume the
  // flag before the desktop actually restarts onto the new version.
  if (markedInThisRuntime) return false;
  try {
    return (
      window.localStorage.getItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function clearResumeComponentUpdatesAfterCore(): void {
  markedInThisRuntime = false;
  try {
    window.localStorage.removeItem(RESUME_COMPONENT_UPDATES_AFTER_CORE_KEY);
  } catch {
    // ignore
  }
}

export type ResumeComponentUpdatesDecision = "retry" | "open" | "done";

/**
 * After a core-install restart, only a successful *component* probe may
 * consume the durable flag. A core-only result (components not checked) or
 * a failed probe must retry; clearing here would skip component updates.
 */
export function decideResumeComponentUpdates(result: {
  ok: boolean;
  componentsChecked?: boolean;
  componentCount?: number;
}): ResumeComponentUpdatesDecision {
  if (!result.ok || !result.componentsChecked) return "retry";
  return (result.componentCount ?? 0) > 0 ? "open" : "done";
}
