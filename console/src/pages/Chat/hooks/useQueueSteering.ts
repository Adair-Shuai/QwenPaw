import { useCallback, useEffect, useRef, useState } from "react";
import {
  chatApi,
  type ChatSteeringState,
  type SteeringReceipt,
} from "../../../api/modules/chat";
import { ApiError } from "../../../api/request";
import {
  type QueueItem,
  useMessageQueueStore,
  withSendLock,
} from "../../../stores/messageQueueStore";
import i18n from "../../../i18n";
import { queueSteeringBlockReason } from "../queueSteering";
import { yieldQueueReadinessWaits } from "../chatRunLifecycle";

interface Options {
  chatId?: string;
  queueKey: string;
  agentId: string;
  enabled: boolean;
  isOwner: boolean;
}

/** An unresolved POST remains quarantined until its idempotent receipt resolves. */
export function useQueueSteering(options: Options) {
  const { chatId, queueKey, agentId, enabled, isOwner } = options;
  const current = useRef(options);
  current.current = options;
  const hasItems = useMessageQueueStore((s) =>
    Boolean(s.queues[queueKey]?.length),
  );
  const [available, setAvailable] = useState<{
    scope: string;
    runId: string | null;
    supported: boolean;
  }>();
  const [history, setHistory] = useState({ queueKey: "", revision: 0 });
  const scope = `${agentId}:${chatId ?? ""}`;
  const inFlight = useRef(new Set<string>());
  const retryAfter = useRef(new Map<string, number>());

  const acceptReceipt = useCallback(
    (key: string, item: QueueItem, receipt: SteeringReceipt) => {
      const request = item.steering;
      if (
        !request ||
        receipt.request_id !== request.requestId ||
        receipt.run_id !== request.runId ||
        receipt.text !== item.text
      )
        return;
      const store = useMessageQueueStore.getState();
      if (receipt.status === "pending") {
        store.setSteeringError(key, item.id, request.requestId, undefined);
      } else if (
        receipt.status === "applied" ||
        receipt.status === "returned"
      ) {
        const resolved = store.resolveSteering(
          key,
          item.id,
          request.requestId,
          receipt.status,
          receipt.status === "returned"
            ? i18n.t("chat.queue.steerReturned")
            : undefined,
        );
        if (
          resolved &&
          receipt.status === "applied" &&
          current.current.queueKey === key
        ) {
          setHistory((v) => ({ queueKey: key, revision: v.revision + 1 }));
        }
        retryAfter.current.delete(request.requestId);
      }
    },
    [],
  );

  const sendClaimed = useCallback(
    async (
      key: string,
      targetChat: string,
      targetAgent: string,
      item: QueueItem,
      signal?: AbortSignal,
    ) => {
      const request = item.steering;
      if (!request || inFlight.current.has(request.requestId)) return;
      inFlight.current.add(request.requestId);
      retryAfter.current.set(request.requestId, Date.now() + 5000);
      try {
        const receipt = await chatApi.steer(
          targetChat,
          targetAgent,
          {
            expected_run_id: request.runId,
            request_id: request.requestId,
            text: item.text,
          },
          signal,
        );
        acceptReceipt(key, item, receipt);
      } catch (error) {
        if (signal?.aborted) return;
        const store = useMessageQueueStore.getState();
        // These are authoritative refusals. Network/timeout errors may have
        // committed server-side and must NEVER return to normal auto-send.
        if (
          error instanceof ApiError &&
          [400, 404, 409, 413, 422].includes(error.status)
        ) {
          store.resolveSteering(
            key,
            item.id,
            request.requestId,
            "returned",
            i18n.t("chat.queue.steerRejected"),
          );
        } else {
          store.setSteeringError(
            key,
            item.id,
            request.requestId,
            i18n.t("chat.queue.steerConfirming"),
          );
        }
      } finally {
        inFlight.current.delete(request.requestId);
      }
    },
    [acceptReceipt],
  );

  useEffect(() => {
    if (!enabled || !chatId || !hasItems) {
      setAvailable(undefined);
      return;
    }
    const ctrl = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      let snapshot: ChatSteeringState | undefined;
      try {
        snapshot = await chatApi.getSteeringState(chatId, agentId, ctrl.signal);
        if (ctrl.signal.aborted) return;
        setAvailable((old) =>
          old?.scope === scope &&
          old.runId === snapshot!.active_run_id &&
          old.supported === snapshot!.supported
            ? old
            : {
                scope,
                runId: snapshot!.active_run_id,
                supported: snapshot!.supported,
              },
        );
      } catch {
        if (!ctrl.signal.aborted) setAvailable(undefined);
      }
      if (ctrl.signal.aborted) return;
      // Only one queue owner retries uncertain requests; every tab may read
      // receipts. Always address the captured Agent/Chat, never the new route.
      const items = useMessageQueueStore
        .getState()
        .getQueue(queueKey)
        .filter((item) => item.status === "steering" && item.steering);
      await Promise.all(
        items.map(async (item) => {
          const request = item.steering!;
          try {
            const known = snapshot?.receipts.find(
              (r) => r.request_id === request.requestId,
            );
            const receipt =
              known ??
              (await chatApi.getSteeringReceipt(
                chatId,
                agentId,
                request.requestId,
                ctrl.signal,
              ));
            if (!ctrl.signal.aborted) acceptReceipt(queueKey, item, receipt);
          } catch (error) {
            if (ctrl.signal.aborted) return;
            // Missing receipt is not proof that the original request failed:
            // retry the identical id/run/text, so a late POST cannot duplicate it.
            if (
              error instanceof ApiError &&
              error.status === 404 &&
              current.current.isOwner &&
              Date.now() >= (retryAfter.current.get(request.requestId) ?? 0)
            ) {
              await sendClaimed(queueKey, chatId, agentId, item, ctrl.signal);
            }
          }
        }),
      );
      if (!ctrl.signal.aborted) timer = setTimeout(() => void tick(), 1500);
    };
    void tick();
    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [
    enabled,
    chatId,
    agentId,
    queueKey,
    scope,
    hasItems,
    acceptReceipt,
    sendClaimed,
  ]);

  const activeRunId =
    enabled &&
    hasItems &&
    isOwner &&
    available?.scope === scope &&
    available.supported
      ? available.runId
      : null;
  const steer = useCallback(
    (item: QueueItem) => {
      if (!activeRunId || !chatId || queueSteeringBlockReason(item, agentId))
        return;
      const expected = { chatId, agentId, queueKey };
      yieldQueueReadinessWaits(queueKey);
      void withSendLock(
        queueKey,
        () => {
          const now = current.current;
          if (
            !now.enabled ||
            !now.isOwner ||
            now.chatId !== expected.chatId ||
            now.agentId !== expected.agentId ||
            now.queueKey !== expected.queueKey
          )
            return;
          const store = useMessageQueueStore.getState();
          const fresh = store
            .getQueue(queueKey)
            .find((entry) => entry.id === item.id);
          if (
            !fresh ||
            queueSteeringBlockReason(fresh, agentId) ||
            !store.beginSteering(queueKey, item.id, activeRunId)
          )
            return;
          return store.getQueue(queueKey).find((entry) => entry.id === item.id);
        },
        { wait: true },
      ).then(async (claimed) => {
        // A slow POST must not hold the lock needed by the background
        // receipt watcher after navigation. The persisted claim prevents
        // normal re-sends, and identical steering retries are idempotent.
        if (claimed) {
          // Another tab may resolve the shared receipt before this tab polls
          // it. Remember to refresh the original input on idle regardless.
          if (current.current.queueKey === queueKey) {
            setHistory((v) => ({ queueKey, revision: v.revision + 1 }));
          }
          await sendClaimed(queueKey, chatId, agentId, claimed);
        }
      });
    },
    [activeRunId, chatId, queueKey, agentId, sendClaimed],
  );

  return {
    steer,
    activeRunId,
    historyRevision: history.queueKey === queueKey ? history.revision : 0,
  };
}
