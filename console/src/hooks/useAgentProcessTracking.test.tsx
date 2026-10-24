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

  it.each([
    ["finished", "done"],
    ["running", "running"],
    ["cancelled", "cancelled"],
    ["failed", "error"],
  ])(
    "uses explicit %s status rather than words in the task report",
    (reported, expected) => {
      renderHook(() =>
        useAgentProcessTracking("session-1", {
          ...baseContent,
          name: "check_agent_task",
          params: { task_id: "task-42" },
          status: "done",
          result: `[STATUS: ${reported}]\nPrevious error was resolved.`,
        }),
      );
      expect(useBackgroundTasksStore.getState().tasks[0].status).toBe(expected);
    },
  );

  it("merges streamed spawn and check identities without leaving provisional running rows", () => {
    const spawn: ToolCallContent = {
      ...baseContent,
      name: "spawn_subagent",
      params: { task: "Synthetic analysis" },
    };
    const { rerender } = renderHook(
      ({ content }) => useAgentProcessTracking("session-1", content),
      { initialProps: { content: spawn } },
    );
    const start = useBackgroundTasksStore.getState().tasks[0].startTime;
    rerender({
      content: {
        ...spawn,
        status: "done",
        result: "[TASK_ID: task-42]\nTask submitted successfully.",
      },
    });
    expect(useBackgroundTasksStore.getState().tasks).toMatchObject([
      { toolCallId: "agent-task:task-42", status: "running", startTime: start },
    ]);
    expect(useBackgroundTasksStore.getState().tasks).toHaveLength(1);
    rerender({
      content: {
        ...spawn,
        id: "check-stream",
        name: "check_agent_task",
        params: {},
        status: "calling",
      },
    });
    expect(useBackgroundTasksStore.getState().tasks).toHaveLength(1);
    rerender({
      content: {
        ...spawn,
        id: "check-stream",
        name: "check_agent_task",
        params: { task_id: "task-42" },
        status: "done",
        result: "[STATUS: finished]\nTask completed.",
      },
    });
    expect(useBackgroundTasksStore.getState().tasks).toHaveLength(1);
    expect(useBackgroundTasksStore.getState().tasks[0]).toMatchObject({
      toolCallId: "agent-task:task-42",
      status: "done",
      startTime: start,
    });
  });

  it.each(["done", "error", "cancelled"] as const)(
    "does not reopen a %s task when old checks or submissions remount",
    (status) => {
      const store = useBackgroundTasksStore.getState();
      store.addTask(
        {
          sessionId: "session-1",
          toolCallId: "agent-task:task-42",
          toolName: "Agent",
          startTime: 100,
        },
        { kind: "agent" },
      );
      store.updateTaskForSession("session-1", "agent-task:task-42", {
        status,
        result: "Final result",
        endTime: 200,
      });
      for (const name of [
        "check_agent_task",
        "spawn_subagent",
        "submit_to_agent",
      ]) {
        const view = renderHook(() =>
          useAgentProcessTracking("session-1", {
            ...baseContent,
            id: `${name}-old`,
            name,
            params: { task_id: "task-42" },
            status: "done",
            result: "[TASK_ID: task-42]\n[STATUS: running]",
          }),
        );
        view.unmount();
      }
      expect(useBackgroundTasksStore.getState().tasks).toHaveLength(1);
      expect(useBackgroundTasksStore.getState().tasks[0]).toMatchObject({
        status,
        result: "Final result",
        endTime: 200,
      });
    },
  );

  it("cleans previously tracked check aliases only in their own session", () => {
    const store = useBackgroundTasksStore.getState();
    for (const sessionId of ["session-1", "session-2"]) {
      store.addTask(
        {
          sessionId,
          toolCallId: "check-alias",
          toolName: "Agent",
          startTime: 10,
        },
        { kind: "agent" },
      );
    }
    renderHook(() =>
      useAgentProcessTracking("session-1", {
        ...baseContent,
        id: "check-alias",
        name: "check_agent_task",
        params: { task_id: "task-42" },
        status: "done",
        result: "[STATUS: finished]",
      }),
    );
    expect(useBackgroundTasksStore.getState().tasks).toMatchObject([
      { sessionId: "session-2", toolCallId: "check-alias", status: "running" },
      {
        sessionId: "session-1",
        toolCallId: "agent-task:task-42",
        status: "done",
      },
    ]);
  });

  it("does not reopen completed batch members or finish their still-running siblings", () => {
    const store = useBackgroundTasksStore.getState();
    store.addTask(
      {
        sessionId: "session-1",
        toolCallId: "agent-task:task-a",
        toolName: "Agent",
        startTime: 100,
      },
      { kind: "agent" },
    );
    store.updateTaskForSession("session-1", "agent-task:task-a", {
      status: "done",
      result: "Complete",
      endTime: 200,
    });
    renderHook(() =>
      useAgentProcessTracking("session-1", {
        ...baseContent,
        id: "old-batch",
        name: "spawn_subagent",
        params: { batch: [{ task: "A" }, { task: "B" }] },
        status: "done",
        result: "[TASK_ID: task-a]\n[TASK_ID: task-b]",
      }),
    );
    expect(useBackgroundTasksStore.getState().tasks).toMatchObject([
      {
        toolCallId: "agent-task:task-a",
        status: "done",
        result: "Complete",
        endTime: 200,
      },
      { toolCallId: "agent-task:task-b", status: "running" },
    ]);
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
