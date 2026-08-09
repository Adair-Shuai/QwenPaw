/**
 * GenUI action bus — dispatches button actions from GenUI components.
 *
 * Allowed actions are read from host config (PLAN §8: genui_allow_actions).
 * Falls back to ["send_message"] when config is unavailable.
 *
 * Security:
 * - Only actions in the allowed set are dispatched.
 * - Content must be non-empty and under MAX_CONTENT_LENGTH.
 * - Rapid clicks are throttled to prevent flooding.
 */

export interface GenUiAction {
  type: string;
  payload?: Record<string, unknown>;
}

/** Default allowed actions when no config is provided. */
const DEFAULT_ALLOWED_ACTIONS: ReadonlySet<string> = new Set(["send_message"]);

const MAX_CONTENT_LENGTH = 10000;
const THROTTLE_MS = 500;

const _lastDispatchTime: Record<string, number> = {};

/**
 * Get the set of allowed GenUI actions from the host runtime.
 *
 * The host exposes GenUI config via `window.QwenPaw.genui.config`,
 * which is populated by the backend registration logic.
 */
function getAllowedActions(): Set<string> {
  try {
    const QP = (window as any).QwenPaw;
    const config = QP?.genui?.config;
    if (config?.allow_actions && Array.isArray(config.allow_actions)) {
      const actions = config.allow_actions.filter(
        (a: unknown) => typeof a === "string" && a.length > 0,
      );
      if (actions.length > 0) {
        return new Set(actions as string[]);
      }
    }
  } catch {
    // Fall through to default
  }
  return new Set(DEFAULT_ALLOWED_ACTIONS);
}

/**
 * Check if an action type is currently allowed.
 */
export function isActionAllowed(actionType: string): boolean {
  return getAllowedActions().has(actionType);
}

/**
 * Get the current allowed actions list (for debugging / UI display).
 */
export function getAllowedActionsList(): string[] {
  return Array.from(getAllowedActions());
}

function isThrottled(actionType: string): boolean {
  const now = Date.now();
  const last = _lastDispatchTime[actionType] || 0;
  if (now - last < THROTTLE_MS) {
    console.warn("[ugsci.genui] Action '" + actionType + "' throttled");
    return true;
  }
  _lastDispatchTime[actionType] = now;
  return false;
}

export function dispatchGenUiAction(action: unknown): void {
  let act: GenUiAction;
  if (typeof action === "string") act = { type: action };
  else if (action && typeof action === "object") act = action as GenUiAction;
  else return;

  const allowed = getAllowedActions();
  if (!allowed.has(act.type)) {
    console.warn(
      "[ugsci.genui] Action '" + act.type + "' not allowed " +
        "(allowed: " + Array.from(allowed).join(", ") + ")",
    );
    return;
  }

  if (isThrottled(act.type)) return;

  if (act.type === "send_message") {
    const content = (act.payload?.content as string) || (act.payload?.message as string) || "";
    if (!content || !content.trim()) {
      console.warn("[ugsci.genui] send_message: content is empty");
      return;
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      console.warn("[ugsci.genui] send_message: content length " + content.length + " exceeds max " + MAX_CONTENT_LENGTH);
      return;
    }
    // The host chat uses a textarea-based sender. We find the textarea,
    // set its value, and trigger a submit event.
    const sent = _sendViaTextarea(content);
    if (!sent) {
      console.info("[ugsci.genui] send_message: could not find chat sender, content:", content);
    }
  }
}

export function isActionBusy(actionType: string): boolean {
  const now = Date.now();
  const last = _lastDispatchTime[actionType] || 0;
  return now - last < THROTTLE_MS;
}

/**
 * Attempt to send a message by finding the chat sender textarea,
 * setting its value, and triggering a submit event.
 *
 * The host chat (AgentScope ChatV1 SDK) uses a textarea inside a
 * `.asr-sender` container. Setting the value via the React-controlled
 * input API (nativeInputValueSetter) and dispatching an input event
 * ensures React sees the change, then pressing Enter submits.
 *
 * Returns true if the textarea was found and the submit was triggered.
 */
function _sendViaTextarea(text: string): boolean {
  try {
    // Find the sender textarea — the AgentScope SDK wraps it in a
    // container with class containing "sender".
    const senderContainer = document.querySelector('[class*="sender"]');
    const textarea = senderContainer?.querySelector("textarea") as HTMLTextAreaElement | null;
    if (!textarea) return false;

    // Use React's internal setter to properly update the controlled input
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(textarea, text);
    } else {
      textarea.value = text;
    }

    // Dispatch input event so React's onChange fires
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    // Press Enter to submit (the SDK listens for Enter key on the textarea)
    textarea.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
      }),
    );

    return true;
  } catch (err) {
    console.warn("[ugsci.genui] _sendViaTextarea failed:", err);
    return false;
  }
}

/**
 * Reset the action bus state (throttle timers).
 * Useful for testing.
 */
export function resetActionBus(): void {
  for (const key of Object.keys(_lastDispatchTime)) {
    delete _lastDispatchTime[key];
  }
}
