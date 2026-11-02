import type { QueueItem } from "../../stores/messageQueueStore";
import {
  getQueuedAgentMentionContext,
  getSubmittedAgentMention,
} from "./agentMentionSubmission";

/** Steering only adds user text to the existing run; it cannot change dispatch. */
export function queueSteeringBlockReason(
  item: QueueItem,
  agentId: string,
): string | undefined {
  if (item.status !== "pending") return "chat.queue.steerBusy";
  if ((item.agentId || "default") !== agentId)
    return "chat.queue.steerOtherAgent";
  const context = getQueuedAgentMentionContext(item);
  const params = item.bizParams;
  if (
    !item.text.trim() ||
    item.text.length > 32000 ||
    item.attachments?.length ||
    item.images?.length ||
    item.mentions?.length ||
    item.quote ||
    getSubmittedAgentMention(context) ||
    context?.agent_coordination_requested ||
    params?.target_agent_id ||
    params?.fileList ||
    /^\s*\//.test(item.text) ||
    /(^|\s)@\S/.test(item.text)
  )
    return "chat.queue.steerTextOnly";
  return undefined;
}
