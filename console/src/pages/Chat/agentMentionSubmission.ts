import type { AgentSummary } from "../../api/types/agents";
import type { QueueItem } from "../../stores/messageQueueStore";
import {
  buildAgentMentionDispatch,
  getAgentMentionModesSnapshot,
  type AgentMentionDispatch,
  type AgentMentionModesSnapshot,
} from "./components/agentMentionModes";
import { withAgentCoordinationContext } from "./components/agentMentionUtils";

const MENTION_CONTEXT_KEY = "qwenpaw_agent_mention_dispatch";

interface SubmittedAgentMention extends AgentMentionDispatch {
  modes?: AgentMentionModesSnapshot;
}

/** Freeze mention intent before the SDK clears the composer or admission awaits. */
export function captureAgentMentionContext(
  text: string,
  agents: AgentSummary[],
  displayName: (agent: AgentSummary) => string,
  context: Record<string, unknown> = {},
  modes: AgentMentionModesSnapshot = getAgentMentionModesSnapshot(),
): Record<string, unknown> {
  const next = { ...context };
  delete next[MENTION_CONTEXT_KEY];
  const dispatch = buildAgentMentionDispatch(text, agents, displayName, modes);
  if (dispatch.targetAgentId || dispatch.coordinationRequested) {
    next[MENTION_CONTEXT_KEY] = { ...dispatch, modes: { ...modes } };
  }
  return next;
}

export function getSubmittedAgentMention(
  context?: Record<string, unknown>,
): SubmittedAgentMention | undefined {
  const value = context?.[MENTION_CONTEXT_KEY] as
    | SubmittedAgentMention
    | undefined;
  if (
    value &&
    typeof value.requestText === "string" &&
    typeof value.coordinationRequested === "boolean" &&
    (value.targetAgentId === undefined ||
      typeof value.targetAgentId === "string")
  )
    return value;
  return undefined;
}

/** Queues persisted before the SDK migration stored mention intent separately. */
export function getQueuedAgentMentionContext(
  item: Pick<
    QueueItem,
    "requestContext" | "agentDispatch" | "agentMentionModes"
  >,
): Record<string, unknown> | undefined {
  if (getSubmittedAgentMention(item.requestContext) || !item.agentDispatch)
    return item.requestContext;
  return {
    ...item.requestContext,
    [MENTION_CONTEXT_KEY]: {
      ...item.agentDispatch,
      modes: item.agentMentionModes,
    },
  };
}

/** Used by both foreground SDK requests and the durable background queue. */
export function applyAgentMentionSubmission(
  payload: Record<string, unknown>,
  dispatch = getSubmittedAgentMention(
    payload.request_context as Record<string, unknown> | undefined,
  ),
): Record<string, unknown> {
  if (!dispatch) return payload;
  const context = {
    ...(payload.request_context as Record<string, unknown> | undefined),
  };
  delete context[MENTION_CONTEXT_KEY];
  const input = Array.isArray(payload.input) ? [...payload.input] : [];
  for (let index = input.length - 1; index >= 0; index -= 1) {
    const message = input[index];
    if (message?.role !== "user" || !Array.isArray(message.content)) continue;
    let replaced = false;
    input[index] = {
      ...message,
      content: message.content.map((part: Record<string, unknown>) => {
        if (part.type !== "text" || typeof part.text !== "string") return part;
        const text = replaced ? "" : dispatch.requestText;
        replaced = true;
        return { ...part, text };
      }),
    };
    break;
  }
  return {
    ...payload,
    input,
    ...(dispatch.targetAgentId
      ? { target_agent_id: dispatch.targetAgentId }
      : {}),
    request_context: dispatch.coordinationRequested
      ? withAgentCoordinationContext(context)
      : context,
  };
}
