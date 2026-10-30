import { submitChat } from "../../plugins/hostSdk/chatSubmit";
import { interactionApi } from "./api";
import type { InteractionRequest, InteractionScope } from "./types";

const inFlight = new Map<string, Promise<InteractionRequest>>();
const admitted = new Set<string>();
const receiptKey = (scope: InteractionScope, id: string) =>
  `qwenpaw:input-delivery:${encodeURIComponent(
    scope.agentId,
  )}:${encodeURIComponent(scope.sessionId)}:${encodeURIComponent(id)}`;

/** A failed server acknowledgement retries only that acknowledgement, not chat admission. */
export function deliverInteractionAnswer(
  scope: InteractionScope,
  chatSessionId: string,
  request: InteractionRequest,
  continuation: string,
) {
  const key = receiptKey(scope, request.id);
  if (request.delivery_status === "queued") return Promise.resolve(request);
  const current = inFlight.get(key);
  if (current) return current;
  const deliver = async () => {
    let hasReceipt = admitted.has(key);
    try {
      hasReceipt ||= localStorage.getItem(key) === "queued";
    } catch {
      /* in-memory receipt still applies */
    }
    if (!hasReceipt) {
      await submitChat("qwenpaw-openui", {
        agentId: scope.agentId,
        sessionId: chatSessionId,
        query: continuation,
      });
      admitted.add(key);
      try {
        localStorage.setItem(key, "queued");
      } catch {
        /* the backend acknowledgement is also durable */
      }
    }
    return interactionApi.queued(scope, request.id);
  };
  // Same-origin windows serialize admission and re-read the durable receipt.
  const promise = navigator.locks?.request
    ? navigator.locks.request(key, deliver)
    : deliver();
  inFlight.set(key, promise);
  void promise.finally(() => inFlight.delete(key)).catch(() => {});
  return promise;
}
