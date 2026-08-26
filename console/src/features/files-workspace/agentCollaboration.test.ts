import { describe, expect, it } from "vitest";
import type { BackgroundTask } from "../../stores/backgroundTasksStore";
import {
  buildCollaborationStages,
  buildAgentTimeline,
  deriveAgentCollaboration,
} from "./agentCollaboration";

function task(
  id: string,
  overrides: Partial<BackgroundTask> = {},
): BackgroundTask {
  return {
    toolCallId: id,
    toolName: `Agent · ${id}`,
    kind: "agent",
    agentId: id,
    sessionId: "session-1",
    startTime: 1_000,
    endTime: 2_000,
    status: "done",
    liveOutput: "",
    result: "done",
    hintVisible: false,
    ...overrides,
  };
}

describe("deriveAgentCollaboration", () => {
  it("recognizes an explicit parallel batch", () => {
    const model = deriveAgentCollaboration([
      task("worker-1", { groupId: "batch-1", eventType: "delegation" }),
      task("worker-2", { groupId: "batch-1", eventType: "delegation" }),
    ]);

    expect(model.kind).toBe("parallel");
    expect(model.nodes.map((node) => node.relation)).toEqual([
      "parallel",
      "parallel",
    ]);
    expect(model.inferred).toBe(false);
  });

  it("recognizes supervisor coordination and marks reconstructed order", () => {
    const model = deriveAgentCollaboration([
      task("data", { agentId: "data", startTime: 1_000 }),
      task("qa", { agentId: "qa", startTime: 2_000 }),
    ]);

    expect(model.kind).toBe("supervisor");
    expect(model.nodes[1]).toMatchObject({
      relation: "sequence",
      relationInferred: true,
    });
    expect(model.inferred).toBe(true);
  });

  it("recognizes retries and preserves failure counts", () => {
    const model = deriveAgentCollaboration([
      task("first", { agentId: "qa", status: "error" }),
      task("second", {
        agentId: "qa",
      }),
    ]);

    expect(model.kind).toBe("retry");
    expect(model.hasRetries).toBe(true);
    expect(model.failed).toBe(1);
    expect(model.nodes[1].relation).toBe("retry");
    expect(model.nodes[1].relationInferred).toBe(true);
  });
});

describe("buildAgentTimeline", () => {
  it("reconstructs a readable logical sequence for historical calls", () => {
    const model = deriveAgentCollaboration([
      task("data", { agentId: "data" }),
      task("qa", { agentId: "qa" }),
    ]);
    const timeline = buildAgentTimeline(model.nodes, 3_000);

    expect(timeline).toHaveLength(2);
    expect(timeline[0].left).toBeLessThan(timeline[1].left);
    expect(timeline.every((placement) => placement.width >= 7)).toBe(true);
  });
});

describe("buildCollaborationStages", () => {
  it("collapses an explicit batch into one parallel stage", () => {
    const model = deriveAgentCollaboration([
      task("before"),
      task("worker-1", { groupId: "batch-1" }),
      task("worker-2", { groupId: "batch-1" }),
      task("after"),
    ]);

    const stages = buildCollaborationStages(model.nodes);

    expect(stages.map((stage) => stage.kind)).toEqual([
      "task",
      "parallel",
      "task",
    ]);
    expect(stages[1].nodes.map((node) => node.task.toolCallId)).toEqual([
      "worker-1",
      "worker-2",
    ]);
  });
});
