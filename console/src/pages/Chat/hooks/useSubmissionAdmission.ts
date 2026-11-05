import { useCallback, useEffect, useRef } from "react";
import { getSenderTextareaFromTarget } from "../utils";
import type { QueueAttachment } from "../../../stores/messageQueueStore";

export interface AdmissionInput {
  text: string;
  attachments: QueueAttachment[];
  mentionModes: Record<string, "delegate" | "collaborate">;
}

/** The SDK can call beforeSubmit again before its async admission check has
 * consumed the composer. Claim that input revision across both send paths,
 * without deduplicating intentional later messages by their text. */
export function useSubmissionAdmission() {
  const revision = useRef(0);
  const pending = useRef(new WeakMap<object, Set<string>>());

  useEffect(() => {
    const onInput = (event: Event) => {
      if (getSenderTextareaFromTarget(event.target)) revision.current += 1;
    };
    document.addEventListener("input", onInput, true);
    return () => document.removeEventListener("input", onInput, true);
  }, []);

  const inputKey = useCallback((input: AdmissionInput) => {
    return JSON.stringify([
      revision.current,
      input.text.trim(),
      input.attachments.map(({ url, name, type, size }) => [
        url,
        name,
        type,
        size,
      ]),
      Object.entries(input.mentionModes).sort(([a], [b]) => a.localeCompare(b)),
    ]);
  }, []);

  const isPending = useCallback(
    (visit: object, input: AdmissionInput) =>
      pending.current.get(visit)?.has(inputKey(input)) ?? false,
    [inputKey],
  );

  const begin = useCallback(
    (visit: object, input: AdmissionInput): (() => void) | undefined => {
      const key = inputKey(input);
      let claims = pending.current.get(visit);
      if (claims?.has(key)) return undefined;
      if (!claims) {
        claims = new Set();
        pending.current.set(visit, claims);
      }
      claims.add(key);
      return () => claims.delete(key);
    },
    [inputKey],
  );

  return { begin, isPending };
}
