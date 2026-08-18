/** Session-wide GenUI external store shared by every response bubble. */
import type { GenUiSnapshot, GenUiTreeResult, GenUiPatchPayload } from "../types/genUi";

type ReactFn = any;

export interface GenUiStoreState {
  snapshots: Record<string, GenUiSnapshot>;
  setSnapshot: (snapshot: GenUiSnapshot) => void;
  applyPatch: (payload: GenUiPatchPayload, tree: GenUiSnapshot["tree"], revision: number, sessionId?: string) => void;
  getSnapshot: (sessionId: string, uiId: string) => GenUiSnapshot | undefined;
  clearSession: (sessionId: string) => void;
  hydrateFromMessages: (sessionId: string, output: unknown[]) => void;
}

const MAX_SNAPSHOTS = 256;
let snapshots: Record<string, GenUiSnapshot> = {};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); };
const getSnapshots = () => snapshots;

const pickCache = new Map<string, GenUiSnapshot[]>();

function snapshotsFor(sessionId: string, uiIds: readonly string[]): GenUiSnapshot[] {
  const picked: GenUiSnapshot[] = [];
  for (const uiId of uiIds) {
    if (!uiId) continue;
    const snap = snapshots[genUiSnapshotKey(sessionId, uiId)]
      || Object.values(snapshots).find((item) => item.uiId === uiId);
    if (snap) picked.push(snap);
  }
  const ident = `${sessionId}::${uiIds.join("\0")}`;
  const prev = pickCache.get(ident);
  if (prev && prev.length === picked.length && prev.every((item, index) => item === picked[index])) {
    return prev;
  }
  pickCache.set(ident, picked);
  return picked;
}

export function genUiSnapshotKey(sessionId: string, uiId: string): string {
  return `${sessionId}::${uiId}`;
}

function coerceGenUiEnvelope(parsed: any): GenUiTreeResult | null {
  if (!parsed || typeof parsed !== "object") return null;
  if (parsed.ok === true && (parsed.kind === "genui" || parsed.kind === "genui_patch")) {
    return parsed as GenUiTreeResult;
  }
  if (parsed.genui && typeof parsed.genui === "object") {
    return coerceGenUiEnvelope(parsed.genui);
  }
  if (parsed.ui && typeof parsed.ui === "object") {
    return coerceGenUiEnvelope(parsed.ui.genui);
  }
  return null;
}

export function parseGenUiResult(resultText: string): GenUiTreeResult | null {
  if (!resultText || typeof resultText !== "string") return null;
  try {
    const parsed = JSON.parse(resultText);
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const text = item?.type === "text" ? item.text : undefined;
        const nested = typeof text === "string" ? parseGenUiResult(text) : coerceGenUiEnvelope(item);
        if (nested) return nested;
      }
      return null;
    }
    return coerceGenUiEnvelope(parsed);
  } catch { return null; }
}

export function parseGenUiError(resultText: string): GenUiTreeResult | null {
  if (!resultText || typeof resultText !== "string") return null;
  try {
    const parsed = JSON.parse(resultText);
    if (Array.isArray(parsed)) {
      const text = parsed.find((item: any) => item?.type === "text")?.text;
      return typeof text === "string" ? parseGenUiError(text) : null;
    }
    return parsed && parsed.ok === false ? parsed : null;
  }
  catch { return null; }
}

const TOOL_OUTPUT_TYPES = new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]);
const GENUI_TOOL_NAMES = new Set(["emit_ui_tree", "emit_ui_patch"]);

export function extractGenUiResults(output: unknown): GenUiTreeResult[] {
  if (!Array.isArray(output)) return [];
  const results: GenUiTreeResult[] = [];
  const visit = (value: unknown, allowSiblingEnvelope = false): void => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      // AgentScope's live V1 envelope keeps the tool call and its output as
      // sibling content blocks. Associate them before recursively visiting
      // nested wrappers so an unrelated JSON payload can never become GenUI.
      const siblingNames = allowSiblingEnvelope ? value
        .map((item: any) => item?.data?.name ?? item?.name)
        .filter((name: unknown) => Boolean(name))
        .map((name: unknown) => String(name)) : [];
      if (allowSiblingEnvelope && siblingNames.length) {
        const namedEmit = siblingNames.some((name: string) => GENUI_TOOL_NAMES.has(name));
        for (const item of value as any[]) {
          const rawValue = item?.data?.output ?? item?.output
            ?? item?.data?.result ?? item?.result
            ?? item?.data?.content ?? item?.content;
          if (rawValue == null) continue;
          const textValue = typeof rawValue === "string" ? rawValue : JSON.stringify(rawValue);
          const parsed = parseGenUiResult(textValue) || (namedEmit ? parseGenUiError(textValue) : null);
          if (parsed) results.push(parsed);
        }
      }
      value.forEach((item) => visit(item));
      return;
    }
    const block = value as Record<string, any>;
    if (block.type === "tool_result") {
      const outputBlocks = Array.isArray(block.output) ? block.output : [];
      const texts = outputBlocks.filter((item: any) => item?.type === "text").map((item: any) => item.text);
      const rawValue = texts.length ? texts.join("\n") : block.output;
      const candidates = texts.length ? texts : [typeof rawValue === "string" ? rawValue : JSON.stringify(rawValue)];
      for (const textValue of candidates) {
        const parsed = parseGenUiResult(textValue) || (
          GENUI_TOOL_NAMES.has(String(block.name || "")) ? parseGenUiError(textValue) : null
        );
        if (parsed) results.push(parsed);
      }
      return;
    }
    const isToolEnvelope = TOOL_OUTPUT_TYPES.has(String(block.type || ""));
    Object.entries(block).forEach(([key, child]) =>
      visit(child, isToolEnvelope && key === "content"),
    );
  };
  // The live SDK and replay adapter wrap AgentScope messages differently;
  // recursively accept both without coupling GenUI to vendor card internals.
  visit(output);
  for (const raw of output) {
    if (!raw || typeof raw !== "object") continue;
    const msg = raw as Record<string, unknown>;
    // Historical/replayed responses use AgentScope's native message shape:
    // {role, content:[{type:"tool_result", name, output:[{type:"text",text}]}]}.
    // Live vendor envelopes below use plugin_call_output instead.
    if (!TOOL_OUTPUT_TYPES.has(String(msg.type || "")) || !Array.isArray(msg.content)) continue;
    const content = msg.content as Array<Record<string, any>>;
    const name = content[0]?.data?.name;
    if (!name) continue;
    const value = content[1]?.data?.output;
    if (value == null) continue;
    const text = typeof value === "string" ? value : JSON.stringify(value);
    const parsed = parseGenUiResult(text) || (
      GENUI_TOOL_NAMES.has(String(name)) ? parseGenUiError(text) : null
    );
    if (parsed) results.push(parsed);
  }
  return Array.from(new Map(results.map((item) => [`${item.kind}:${item.ui_id}:${item.revision}`, item])).values());
}

function setSnapshot(snapshot: GenUiSnapshot): void {
  const key = genUiSnapshotKey(snapshot.sessionId, snapshot.uiId);
  const matching = Object.entries(snapshots)
    .filter(([, value]) => value.uiId === snapshot.uiId)
    .sort(([, a], [, b]) => b.revision - a.revision);
  const existing = snapshots[key] || matching[0]?.[1];
  if (existing && snapshot.revision < existing.revision) return;
  const next = { ...snapshots };
  // ui_id values are server-generated and globally unique. Re-key fallback
  // snapshots when the real session id becomes available.
  for (const [oldKey] of matching) if (oldKey !== key) delete next[oldKey];
  next[key] = existing && snapshot.revision === existing.revision
    ? { ...existing, ...snapshot, tree: existing.tree }
    : snapshot;
  const ordered = Object.entries(next).sort(([, a], [, b]) => b.updatedAt - a.updatedAt);
  snapshots = Object.fromEntries(ordered.slice(0, MAX_SNAPSHOTS));
  emit();
}

export function hydrateGenUiFromMessages(sessionId: string, output: unknown[]): void {
  for (const result of extractGenUiResults(output)) {
    if (!result.ui_id || !result.tree) continue;
    setSnapshot({
      schemaVersion: "1", uiId: result.ui_id, revision: result.revision || 1,
      tree: result.tree, sessionId, sourceToolCallId: result.tool_call_id,
      updatedAt: Date.now(),
    });
  }
}

const actions = {
  setSnapshot,
  applyPatch(payload: GenUiPatchPayload, tree: GenUiSnapshot["tree"], revision: number, explicitSessionId?: string) {
    const host = (window as any).QwenPaw?.host;
    const sessionId = explicitSessionId || host?.getCurrentSessionId?.() || "";
    const key = genUiSnapshotKey(sessionId, payload.ui_id);
    const existing = snapshots[key] || Object.values(snapshots).find((item) => item.uiId === payload.ui_id);
    if (!existing || revision <= existing.revision) return;
    const next = Object.fromEntries(Object.entries(snapshots).filter(([, item]) => item.uiId !== payload.ui_id));
    snapshots = { ...next, [key]: { ...existing, sessionId, tree, revision, updatedAt: Date.now() } };
    emit();
  },
  getSnapshot: (sessionId: string, uiId: string) => snapshots[genUiSnapshotKey(sessionId, uiId)],
  clearSession(sessionId: string) {
    snapshots = Object.fromEntries(Object.entries(snapshots).filter(([, value]) => value.sessionId !== sessionId));
    for (const key of [...pickCache.keys()]) {
      if (key.startsWith(`${sessionId}::`)) pickCache.delete(key);
    }
    emit();
  },
  hydrateFromMessages: hydrateGenUiFromMessages,
};

export function GenUiStoreProvider({ children }: { children: any }) { return children; }

export function useGenUiActions(): Omit<GenUiStoreState, "snapshots"> {
  return actions;
}

export function useGenUiSnapshots(sessionId: string, uiIds: readonly string[]): GenUiSnapshot[] {
  const React = (window as any).QwenPaw?.host?.React as ReactFn | undefined;
  if (!React) throw new Error("useGenUiSnapshots: host React not available");
  const key = uiIds.join("\0");
  const ids = key === "" ? [] : key.split("\0");
  return React.useSyncExternalStore(
    subscribe,
    () => snapshotsFor(sessionId, ids),
    () => snapshotsFor(sessionId, ids),
  );
}

export function clearSession(sessionId: string): void {
  actions.clearSession(sessionId);
}

export function useGenUiStore(): GenUiStoreState {
  const React = (window as any).QwenPaw?.host?.React as ReactFn | undefined;
  if (!React) throw new Error("useGenUiStore: host React not available");
  const current = React.useSyncExternalStore(subscribe, getSnapshots, getSnapshots);
  return { snapshots: current, ...actions };
}

export function resetGenUiStore(): void {
  snapshots = {};
  pickCache.clear();
  emit();
}
