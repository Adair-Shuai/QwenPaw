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

export interface GenUiActionContext {
  formValues?: Record<string, unknown>;
  formId?: string;
}

export interface GenUiActionResult {
  ok: boolean;
  message: string;
}

function interpolate(template: string, values: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key: string) => {
    const value = values[key];
    return value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  });
}

export function dispatchGenUiAction(action: unknown, context: GenUiActionContext = {}): GenUiActionResult {
  let act: GenUiAction;
  if (typeof action === "string") act = { type: action };
  else if (action && typeof action === "object") act = action as GenUiAction;
  else return { ok: false, message: "无效操作" };

  // submit_form is a safe semantic alias of send_message. It lets the model
  // express intent while keeping the host security boundary unchanged.
  const effectiveType = act.type === "submit_form" ? "send_message" : act.type;

  const allowed = getAllowedActions();
  if (!allowed.has(effectiveType)) {
    console.warn(
      "[ugsci.genui] Action '" + act.type + "' not allowed " +
        "(allowed: " + Array.from(allowed).join(", ") + ")",
    );
    return { ok: false, message: "此操作未获允许" };
  }

  if (isThrottled(effectiveType)) return { ok: false, message: "操作过于频繁，请稍后重试" };

  if (effectiveType === "send_message") {
    const values = context.formValues || {};
    let content = (act.payload?.content as string) || (act.payload?.message as string) || "";
    const hasTemplate = /\{\{\s*[\w.-]+\s*\}\}/.test(content);
    content = interpolate(content, values).trim();
    if (content && !hasTemplate && Object.keys(values).length > 0) {
      content += `\n${Object.entries(values).map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`).join("\n")}`;
    }
    if (!content && Object.keys(values).length > 0) {
      const heading = context.formId ? `提交表单 ${context.formId}` : "提交表单";
      content = `${heading}\n${Object.entries(values).map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`).join("\n")}`;
    }
    if (!content || !content.trim()) {
      console.warn("[ugsci.genui] send_message: content is empty");
      return { ok: false, message: "消息内容为空" };
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      console.warn("[ugsci.genui] send_message: content length " + content.length + " exceeds max " + MAX_CONTENT_LENGTH);
      return { ok: false, message: "消息内容过长" };
    }
    const sent = Boolean((window as any).QwenPaw?.chat?.sendMessage?.(content));
    if (!sent) {
      console.info("[ugsci.genui] send_message: could not find chat sender, content:", content);
      return { ok: false, message: "当前无法发送消息" };
    }
    return { ok: true, message: "已提交" };
  }

  if (effectiveType === "open_url") {
    const raw = (act.payload?.url as string) || (act.payload?.href as string) || "";
    const href = typeof raw === "string" ? raw.trim() : "";
    if (!/^https?:\/\//i.test(href)) {
      console.warn("[ugsci.genui] open_url: only http(s) URLs are allowed");
      return { ok: false, message: "仅允许 http(s) 链接" };
    }
    window.open(href, "_blank", "noopener,noreferrer");
    return { ok: true, message: "已打开链接" };
  }
  return { ok: false, message: "尚未实现此操作" };
}

export function isActionBusy(actionType: string): boolean {
  const now = Date.now();
  const last = _lastDispatchTime[actionType] || 0;
  return now - last < THROTTLE_MS;
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
