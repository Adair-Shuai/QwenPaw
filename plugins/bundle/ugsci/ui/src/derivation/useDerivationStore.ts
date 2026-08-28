import { getHost } from "../core/runtime";

export interface DerivationRecord {
  uiId: string;
  sessionId: string;
  payload: any;
  updatedAt: number;
}
export interface ReplaySummary {
  replayId: string;
  status: string;
  reproducible: boolean;
  elapsedMs?: number;
  diff: Record<string, unknown>;
}
const MAX_RECORDS = 128;
let records: DerivationRecord[] = [];
let selectedId = "";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => records;

export function isDerivationPayload(value: any): boolean {
  return Boolean(
    value &&
      typeof value === "object" &&
      value.trace &&
      Array.isArray(value.trace.steps) &&
      value.provenance &&
      (value.operation || value.trace.formula_id),
  );
}

function replayDerivation(value: any): any | null {
  if (
    !value ||
    typeof value !== "object" ||
    !value.replay_id ||
    !value.status ||
    !isDerivationPayload(value.result)
  ) {
    return null;
  }
  const replay: ReplaySummary = {
    replayId: String(value.replay_id),
    status: String(value.status),
    reproducible: value.reproducible === true,
    elapsedMs:
      typeof value.elapsed_ms === "number" ? value.elapsed_ms : undefined,
    diff:
      value.diff && typeof value.diff === "object" ? value.diff : {},
  };
  return { ...value.result, replay };
}

export function addDerivation(
  payload: any,
  sessionId?: string,
): DerivationRecord | null {
  if (!isDerivationPayload(payload)) return null;
  const id = payload.replay?.replayId
    ? `replay:${payload.replay.replayId}`
    : `${payload.trace?.formula_id || "derivation"}:${
        payload.provenance?.input_fingerprint ||
        payload.operation ||
        crypto.randomUUID()
      }`;
  const record = {
    uiId: id,
    sessionId: sessionId || getHost().getCurrentSessionId?.() || "",
    payload,
    updatedAt: Date.now(),
  };
  records = [record, ...records.filter((item) => item.uiId !== id)].slice(
    0,
    MAX_RECORDS,
  );
  emit();
  return record;
}
export function selectDerivation(uiId: string) {
  selectedId = uiId;
  emit();
}
export function useSelectedDerivationId(): string {
  const React = getHost().React as any;
  return React.useSyncExternalStore(
    subscribe,
    () => selectedId,
    () => "",
  );
}
export function extractDerivations(output: unknown): any[] {
  const found: any[] = [];
  const visit = (value: any): void => {
    if (value == null) return;
    if (typeof value === "string") {
      try {
        visit(JSON.parse(value));
      } catch {
        /* text */
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value !== "object") return;
    const replay = replayDerivation(value);
    if (replay) {
      found.push(replay);
      return;
    }
    if (isDerivationPayload(value)) found.push(value);
    Object.values(value).forEach(visit);
  };
  visit(output);
  return Array.from(
    new Map(
      found.map((item) => [
        String(item.provenance?.replay_token || item.trace?.formula_id) +
          JSON.stringify(item.result || {}),
        item,
      ]),
    ).values(),
  );
}
export function hydrateDerivations(output: unknown, sessionId?: string) {
  extractDerivations(output).forEach((payload) =>
    addDerivation(payload, sessionId),
  );
}
export function clearDerivations(sessionId: string) {
  records = records.filter((item) => item.sessionId !== sessionId);
  emit();
}
export function useDerivationRecords(sessionId: string): DerivationRecord[] {
  const React = getHost().React as any;
  const all = React.useSyncExternalStore(subscribe, snapshot, snapshot);
  return React.useMemo(
    () => all.filter((item: DerivationRecord) => item.sessionId === sessionId),
    [all, sessionId],
  );
}
export function resetDerivationStore() {
  records = [];
  selectedId = "";
  emit();
}
