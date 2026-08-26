import { useEffect, useMemo, useRef } from "react";
import type { ToolCallContent } from "../components/Chat/ToolCards/shared/types";
import { stringifyResult } from "../components/Chat/ToolCards/shared/utils";
import {
  useBackgroundTasksStore,
  type AgentProcessEventType,
  type BackgroundTaskStatus,
} from "../stores/backgroundTasksStore";
import { resolveBackendSessionId } from "../utils/resolveBackendSessionId";

const DIRECT_AGENT_TOOLS = new Set(["chat_with_agent", "spawn_subagent"]);
const SUBMIT_AGENT_TOOL = "submit_to_agent";
const CHECK_AGENT_TOOL = "check_agent_task";

function stringParam(content: ToolCallContent, keys: string[]): string {
  for (const key of keys) {
    const value = content.params?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function targetAgent(content: ToolCallContent): string {
  return (
    stringParam(content, ["to_agent", "agent_id", "agent", "name"]) ||
    "子智能体"
  );
}

function taskSummary(content: ToolCallContent): string {
  return stringParam(content, ["text", "message", "task", "prompt"]);
}

function resultTaskId(content: ToolCallContent, result: string): string {
  return (
    stringParam(content, ["task_id"]) ||
    result.match(/\[TASK_ID:\s*([^\]]+)\]/i)?.[1]?.trim() ||
    ""
  );
}

function isSemanticFailure(result: string): boolean {
  return /(?:^|\b)(?:error|failed|failure)(?::|\b)|task failed|no response received|no text content in response|not exists|空响应/i.test(
    result,
  );
}

function checkedTaskStatus(result: string): BackgroundTaskStatus {
  if (isSemanticFailure(result)) return "error";
  if (/\[STATUS:\s*running\]/i.test(result)) return "running";
  return "done";
}

function stringArrayParam(content: ToolCallContent, key: string): string[] {
  const value = content.params?.[key];
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && !!item.trim(),
    );
  }
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string => typeof item === "string" && !!item.trim(),
        )
      : [value.trim()];
  } catch {
    return [value.trim()];
  }
}

interface BatchAgentTask {
  task: string;
  agentId?: string;
}

function batchTasks(content: ToolCallContent): BatchAgentTask[] {
  const value = content.params?.batch;
  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const task = typeof record.task === "string" ? record.task.trim() : "";
    if (!task) return [];
    const agentId = [record.to_agent, record.agent_id, record.agent].find(
      (candidate): candidate is string =>
        typeof candidate === "string" && !!candidate.trim(),
    );
    return [{ task, agentId: agentId?.trim() }];
  });
}

function allResultTaskIds(result: string): string[] {
  return Array.from(result.matchAll(/\[TASK_ID:\s*([^\]]+)\]/gi), (match) =>
    match[1].trim(),
  );
}

function eventTypeForTool(
  content: ToolCallContent,
  retryOf?: string,
): AgentProcessEventType {
  if (retryOf) return "retry";
  const explicit = stringParam(content, ["event_type", "relation"]);
  if (explicit === "handoff") return "handoff";
  if (content.name === "spawn_subagent") return "delegation";
  if (content.name === SUBMIT_AGENT_TOOL) return "background";
  return "consultation";
}

/** Mirror inter-agent tool calls into the shared process timeline. */
export function useAgentProcessTracking(
  sessionId: string,
  content: ToolCallContent,
): void {
  const startedAt = useRef(Date.now());
  const tracked =
    DIRECT_AGENT_TOOLS.has(content.name) ||
    content.name === SUBMIT_AGENT_TOOL ||
    content.name === CHECK_AGENT_TOOL;
  const agentId = useMemo(() => targetAgent(content), [content]);
  const summary = useMemo(() => taskSummary(content), [content]);
  const batch = useMemo(() => batchTasks(content), [content]);
  const explicitDependsOn = useMemo(
    () => stringArrayParam(content, "depends_on"),
    [content],
  );
  const explicitParent = useMemo(
    () => stringParam(content, ["parent_task_id", "parent_id"]),
    [content],
  );
  const explicitRetryOf = useMemo(
    () => stringParam(content, ["retry_of", "retry_task_id"]),
    [content],
  );
  const explicitEventType = useMemo(() => eventTypeForTool(content), [content]);
  const resultText = useMemo(
    () => stringifyResult(content.result),
    [content.result],
  );
  const parsedTaskId = useMemo(
    () => resultTaskId(content, resultText),
    [content, resultText],
  );

  useEffect(() => {
    if (!tracked || !content.id) return;
    const resolvedSessionId = resolveBackendSessionId(sessionId);
    if (!resolvedSessionId) return;

    const store = useBackgroundTasksStore.getState();
    const isCheck = content.name === CHECK_AGENT_TOOL;
    const isSubmit = content.name === SUBMIT_AGENT_TOOL;
    const stableTaskId = parsedTaskId
      ? `agent-task:${parsedTaskId}`
      : content.id;
    const existing = store.tasks.find(
      (task) =>
        task.sessionId === resolvedSessionId &&
        task.toolCallId === stableTaskId,
    );
    const effectiveAgentId =
      agentId === "子智能体" && existing?.agentId ? existing.agentId : agentId;

    const batchTaskIds = allResultTaskIds(resultText);
    if (
      content.name === "spawn_subagent" &&
      batch.length > 0 &&
      batchTaskIds.length > 0
    ) {
      store.removeTasksForSession([
        { sessionId: resolvedSessionId, toolCallId: content.id },
      ]);
      const groupId = `agent-group:${content.id}`;
      batchTaskIds.forEach((taskId, index) => {
        const spec = batch[index];
        const batchAgentId = spec?.agentId || `子智能体 ${index + 1}`;
        const toolCallId = `agent-task:${taskId}`;
        store.addTask(
          {
            sessionId: resolvedSessionId,
            toolCallId,
            toolName: `Agent · ${batchAgentId}`,
            agentId: batchAgentId,
            sourceTool: content.name,
            taskSummary: spec?.task || `并行子任务 ${index + 1}`,
            eventType: "delegation",
            groupId,
            relationInferred: false,
            startTime: startedAt.current,
          },
          { kind: "agent" },
        );
        store.updateTaskForSession(resolvedSessionId, toolCallId, {
          status: "running",
          liveOutput: spec?.task ? `任务：${spec.task}` : "",
        });
      });
      return;
    }

    if (isSubmit && parsedTaskId && stableTaskId !== content.id) {
      store.removeTasksForSession([
        { sessionId: resolvedSessionId, toolCallId: content.id },
      ]);
    }

    const retryOf = existing?.retryOf || explicitRetryOf || undefined;
    const eventType = retryOf ? "retry" : explicitEventType;

    store.addTask(
      {
        sessionId: resolvedSessionId,
        toolCallId: stableTaskId,
        toolName: `Agent · ${effectiveAgentId}`,
        agentId: effectiveAgentId,
        sourceTool: content.name,
        taskSummary: summary,
        eventType,
        dependsOn: explicitDependsOn,
        retryOf,
        relationInferred: false,
        ...(explicitParent ? { parentTaskId: explicitParent } : {}),
        startTime: existing?.startTime ?? startedAt.current,
      },
      { kind: "agent" },
    );

    let status: BackgroundTaskStatus;
    if (content.status === "calling") {
      status = "running";
    } else if (content.status === "error") {
      status = "error";
    } else if (isSubmit && parsedTaskId) {
      status = "running";
    } else if (isCheck) {
      status = checkedTaskStatus(resultText);
    } else {
      status = isSemanticFailure(resultText) ? "error" : "done";
    }

    store.updateTaskForSession(resolvedSessionId, stableTaskId, {
      status,
      toolName: `Agent · ${effectiveAgentId}`,
      agentId: effectiveAgentId,
      sourceTool: existing?.sourceTool || content.name,
      taskSummary: existing?.taskSummary || summary,
      eventType: existing?.eventType || eventType,
      dependsOn: existing?.dependsOn || explicitDependsOn,
      retryOf,
      relationInferred: existing?.relationInferred || false,
      ...(summary ? { liveOutput: `任务：${summary}` } : {}),
      result:
        status === "running"
          ? null
          : resultText || summary || existing?.result || null,
    });
  }, [
    agentId,
    content.id,
    content.name,
    content.status,
    parsedTaskId,
    batch,
    explicitDependsOn,
    explicitEventType,
    explicitParent,
    explicitRetryOf,
    summary,
    resultText,
    sessionId,
    tracked,
  ]);
}
