import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ToolCallContent } from "../components/Chat/ToolCards/shared/types";
import { useBackgroundTasksStore } from "../stores/backgroundTasksStore";
import { useAgentProcessTracking } from "./useAgentProcessTracking";

vi.mock("../utils/resolveBackendSessionId", () => ({
  resolveBackendSessionId: (sessionId: string) => sessionId,
}));

const baseContent: ToolCallContent = {
  type: "tool_call",
  id: "agent-call-1",
  name: "chat_with_agent",
  params: { to_agent: "qa-agent", text: "检查工作台" },
  status: "calling",
};

describe("useAgentProcessTracking", () => {
  beforeEach(() => {
    useBackgroundTasksStore.setState({ tasks: [] });
  });

  it("tracks an agent call from running through completion", async () => {
    const { rerender } = renderHook(
      ({ content }) => useAgentProcessTracking("session-1", content),
      { initialProps: { content: baseContent } },
    );

    await waitFor(() => {
      expect(useBackgroundTasksStore.getState().tasks[0]).toMatchObject({
        kind: "agent",
        agentId: "qa-agent",
        sourceTool: "chat_with_agent",
        eventType: "consultation",
        taskSummary: "检查工作台",
        status: "running",
        liveOutput: "任务：检查工作台",
      });
    });

    rerender({
      content: {
        ...baseContent,
        status: "done",
        result: "检查完成",
      },
    });

    await waitFor(() => {
      expect(useBackgroundTasksStore.getState().tasks[0]).toMatchObject({
        status: "done",
        result: "检查完成",
      });
    });
  });

  it("marks empty agent responses as failed", async () => {
    renderHook(() =>
      useAgentProcessTracking("session-1", {
        ...baseContent,
        status: "done",
        result: "[SESSION: test] (No text content in response)",
      }),
    );

    await waitFor(() => {
      expect(useBackgroundTasksStore.getState().tasks[0]?.status).toBe("error");
    });
  });

  it("keeps submitted background agent work running until checked", async () => {
    const { rerender } = renderHook(
      ({ content }) => useAgentProcessTracking("session-1", content),
      {
        initialProps: {
          content: {
            ...baseContent,
            id: "submit-call",
            name: "submit_to_agent",
            status: "done" as const,
            result: "[TASK_ID: task-42]\nTask submitted successfully.",
          },
        },
      },
    );

    await waitFor(() => {
      expect(useBackgroundTasksStore.getState().tasks[0]).toMatchObject({
        toolCallId: "agent-task:task-42",
        agentId: "qa-agent",
        status: "running",
      });
    });

    rerender({
      content: {
        ...baseContent,
        id: "check-call",
        name: "check_agent_task",
        params: { task_id: "task-42" },
        status: "done",
        result: "[TASK_ID: task-42]\n[STATUS: finished]\n\nTask completed.",
      },
    });

    await waitFor(() => {
      expect(useBackgroundTasksStore.getState().tasks).toHaveLength(1);
      expect(useBackgroundTasksStore.getState().tasks[0]).toMatchObject({
        toolCallId: "agent-task:task-42",
        agentId: "qa-agent",
        status: "done",
      });
    });
  });

  it("ignores ordinary tool calls", () => {
    renderHook(() =>
      useAgentProcessTracking("session-1", {
        ...baseContent,
        name: "execute_shell_command",
      }),
    );

    expect(useBackgroundTasksStore.getState().tasks).toEqual([]);
  });

  it("groups spawn_subagent batch results as explicit parallel work", async () => {
    renderHook(() =>
      useAgentProcessTracking("session-1", {
        ...baseContent,
        id: "batch-call",
        name: "spawn_subagent",
        params: {
          task: "",
          batch: [{ task: "检查文件预览" }, { task: "检查测试覆盖" }],
        },
        status: "done",
        result:
          "[1/2] [TASK_ID: task-a]\n[SESSION: a]\n\n" +
          "[2/2] [TASK_ID: task-b]\n[SESSION: b]",
      }),
    );

    await waitFor(() => {
      const tasks = useBackgroundTasksStore.getState().tasks;
      expect(tasks).toHaveLength(2);
      expect(tasks[0]).toMatchObject({
        toolCallId: "agent-task:task-a",
        groupId: "agent-group:batch-call",
        eventType: "delegation",
        taskSummary: "检查文件预览",
        status: "running",
      });
      expect(tasks[1]).toMatchObject({
        toolCallId: "agent-task:task-b",
        groupId: "agent-group:batch-call",
        taskSummary: "检查测试覆盖",
      });
    });
  });

  it("preserves an explicit retry relationship", async () => {
    const failedContent: ToolCallContent = {
      ...baseContent,
      id: "first-call",
      status: "done",
      result: "No text content in response",
    };
    const { rerender } = renderHook(
      ({ content }) => useAgentProcessTracking("session-1", content),
      {
        initialProps: {
          content: failedContent,
        },
      },
    );

    await waitFor(() => {
      expect(useBackgroundTasksStore.getState().tasks[0]?.status).toBe("error");
    });

    rerender({
      content: {
        ...baseContent,
        id: "retry-call",
        params: { ...baseContent.params, retry_of: "first-call" },
        status: "calling",
      },
    });

    await waitFor(() => {
      expect(useBackgroundTasksStore.getState().tasks[1]).toMatchObject({
        retryOf: "first-call",
        eventType: "retry",
        relationInferred: false,
      });
    });
  });
});
