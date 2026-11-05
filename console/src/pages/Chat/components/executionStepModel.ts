import {
  AgentScopeRuntimeMessageType,
  type IAgentScopeRuntimeMessage,
} from "@agentscope-ai/chat";
import { deriveToolStatus } from "@/components/Chat/ToolCards/adapters/v1Adapter";
import { isToolLikeResponseMessageType } from "../responseMessageTypes";

export type ExecutionState =
  | "preparing"
  | "running"
  | "returned"
  | "failed"
  | "interrupted"
  | "thinking"
  | "ended";

const TOOL_LABELS: Record<string, string> = {
  read_file: "readFile",
  write_file: "writeFile",
  edit_file: "editFile",
  execute_shell_command: "shell",
  send_file: "sendFile",
  send_file_to_user: "sendFile",
  browser_use: "browser",
  search_web: "search",
  web_search: "search",
};

/** Call delivery is not execution completion; share the native card's result semantics. */
export function describeExecutionStep(
  message: IAgentScopeRuntimeMessage,
  turnEnded: boolean,
) {
  const tool = isToolLikeResponseMessageType(message.type);
  const callContent = message.content?.[0];
  const callData = (
    callContent && "data" in callContent ? callContent.data : undefined
  ) as Record<string, unknown> | undefined;
  const toolName = typeof callData?.name === "string" ? callData.name : "";
  const status = tool
    ? deriveToolStatus(
        (message.content?.[1] ??
          (String(message.type).endsWith("_output")
            ? message.content?.[0]
            : undefined)) as unknown as Record<string, unknown> | undefined,
        message as unknown as Record<string, unknown>,
        turnEnded,
      )
    : null;
  const state: ExecutionState = status
    ? status.interrupted
      ? "interrupted"
      : status.status === "done"
      ? "returned"
      : status.status === "error"
      ? "failed"
      : message.content?.[0]?.delta
      ? "preparing"
      : "running"
    : message.status === "failed"
    ? "failed"
    : message.status === "canceled" || message.status === "rejected"
    ? "interrupted"
    : message.status === "in_progress" || message.status === "created"
    ? turnEnded
      ? "interrupted"
      : "thinking"
    : "ended";
  const kind = tool
    ? "tool"
    : message.type === AgentScopeRuntimeMessageType.REASONING
    ? "reasoning"
    : "record";
  return {
    message,
    state,
    kind,
    toolName,
    labelKey: tool
      ? TOOL_LABELS[toolName]
        ? `chat.execution.actions.${TOOL_LABELS[toolName]}`
        : toolName
        ? null
        : "chat.execution.tool"
      : kind === "reasoning"
      ? "chat.execution.thinkingStep"
      : "chat.execution.record",
  };
}

export type ExecutionStep = ReturnType<typeof describeExecutionStep>;
