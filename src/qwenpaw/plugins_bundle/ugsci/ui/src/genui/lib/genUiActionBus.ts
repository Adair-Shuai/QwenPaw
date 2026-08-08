/**
 * GenUI action bus — dispatches button actions from GenUI components.
 *
 * Phase-1: only `send_message` is allowed. The action sends a new user
 * message through the QwenPaw chat API.
 */

export interface GenUiAction {
  type: string;
  payload?: Record<string, unknown>;
}

export interface GenUiActionContext {
  sessionId?: string;
  messageId?: string;
  actionId?: string;
  formValues?: Record<string, unknown>;
  formId?: string;
}

// Phase-1 allowlist
const ALLOWED_ACTION_TYPES = new Set(["send_message"]);

/**
 * Dispatch a GenUI action. Phase-1 only allows send_message.
 */
export function dispatchGenUiAction(
  action: unknown,
  ctx: GenUiActionContext,
): void {
  // Accept either a string (legacy actionId) or an object {type, payload}
  let actionObj: GenUiAction;
  if (typeof action === "string") {
    actionObj = { type: action, payload: {} };
  } else if (action && typeof action === "object") {
    actionObj = action as GenUiAction;
  } else {
    console.warn("[ugsci.genui] Invalid action:", action);
    return;
  }

  if (!ALLOWED_ACTION_TYPES.has(actionObj.type)) {
    console.warn(
      `[ugsci.genui] Action type '${actionObj.type}' is not allowed in phase-1. ` +
        `Allowed: ${Array.from(ALLOWED_ACTION_TYPES).join(", ")}`,
    );
    return;
  }

  if (actionObj.type === "send_message") {
    const content =
      (actionObj.payload?.content as string) ||
      (actionObj.payload?.message as string) ||
      "";
    if (!content) {
      console.warn("[ugsci.genui] send_message action requires payload.content");
      return;
    }
    // Use the host's chat API to send the message
    const QP = (window as any).QwenPaw;
    if (QP?.chat?.sendMessage) {
      QP.chat.sendMessage(content);
    } else {
      // Fallback: dispatch through the input element
      console.info("[ugsci.genui] Sending message via fallback:", content);
      const input = document.querySelector(
        "textarea[data-role='chat-input']",
      ) as HTMLTextAreaElement | null;
      if (input) {
        input.value = content;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
          }),
        );
      }
    }
  }
}
