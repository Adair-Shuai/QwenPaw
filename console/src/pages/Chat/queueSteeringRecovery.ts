import {
  type QueueItem,
  useMessageQueueStore,
} from "../../stores/messageQueueStore";
import { chatApi } from "../../api/modules/chat";
import { ApiError } from "../../api/request";
import i18n from "../../i18n";

/** Background handoff must resolve the receipt before advancing the FIFO. */
export async function recoverQueuedSteering(
  chatId: string,
  queueKey: string,
  item: QueueItem,
  signal: AbortSignal,
): Promise<boolean> {
  const claim = item.steering;
  if (!claim || item.status !== "steering") return false;
  const agentId = item.agentId || "default";
  const store = useMessageQueueStore.getState();
  try {
    let receipt;
    try {
      receipt = await chatApi.getSteeringReceipt(
        chatId,
        agentId,
        claim.requestId,
        signal,
      );
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 404 ||
        signal.aborted
      )
        throw error;
      receipt = await chatApi.steer(
        chatId,
        agentId,
        {
          expected_run_id: claim.runId,
          request_id: claim.requestId,
          text: item.text,
        },
        signal,
      );
    }
    if (
      signal.aborted ||
      receipt.request_id !== claim.requestId ||
      receipt.run_id !== claim.runId ||
      receipt.text !== item.text
    )
      return false;
    if (receipt.status === "applied" || receipt.status === "returned") {
      return store.resolveSteering(
        queueKey,
        item.id,
        claim.requestId,
        receipt.status,
        receipt.status === "returned"
          ? i18n.t("chat.queue.steerReturned")
          : undefined,
      );
    }
  } catch (error) {
    if (signal.aborted) return false;
    if (
      error instanceof ApiError &&
      [400, 404, 409, 413, 422].includes(error.status)
    ) {
      return store.resolveSteering(
        queueKey,
        item.id,
        claim.requestId,
        "returned",
        i18n.t("chat.queue.steerRejected"),
      );
    }
    store.setSteeringError(
      queueKey,
      item.id,
      claim.requestId,
      i18n.t("chat.queue.steerConfirming"),
    );
  }
  return false;
}
