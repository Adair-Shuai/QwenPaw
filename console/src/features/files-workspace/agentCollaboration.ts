import type { BackgroundTask } from "../../stores/backgroundTasksStore";

export type CollaborationKind =
  | "direct"
  | "delegation"
  | "parallel"
  | "supervisor"
  | "handoff"
  | "retry";

export type CollaborationRelation =
  | "dispatch"
  | "sequence"
  | "parallel"
  | "dependency"
  | "handoff"
  | "retry";

export interface CollaborationNode {
  task: BackgroundTask;
  relation: CollaborationRelation;
  relationInferred: boolean;
}

export interface AgentCollaborationModel {
  kind: CollaborationKind;
  nodes: CollaborationNode[];
  total: number;
  completed: number;
  running: number;
  failed: number;
  hasRetries: boolean;
  hasParallel: boolean;
  inferred: boolean;
}

export interface CollaborationStage {
  id: string;
  kind: "task" | "parallel";
  nodes: CollaborationNode[];
}

/**
 * Groups tasks from the same explicit batch into one visual stage while
 * retaining the original call order for all other tasks.
 */
export function buildCollaborationStages(
  nodes: CollaborationNode[],
): CollaborationStage[] {
  const groupedIds = new Set<string>();
  const stages: CollaborationStage[] = [];

  for (const node of nodes) {
    const groupId = node.task.groupId;
    if (!groupId) {
      stages.push({
        id: node.task.toolCallId,
        kind: "task",
        nodes: [node],
      });
      continue;
    }
    if (groupedIds.has(groupId)) continue;

    groupedIds.add(groupId);
    const groupedNodes = nodes.filter(
      (candidate) => candidate.task.groupId === groupId,
    );
    stages.push({
      id: groupId,
      kind: groupedNodes.length > 1 ? "parallel" : "task",
      nodes: groupedNodes,
    });
  }

  return stages;
}

export function deriveAgentCollaboration(
  sourceTasks: BackgroundTask[],
): AgentCollaborationModel {
  const tasks = sourceTasks
    .filter((task) => task.kind === "agent")
    .sort((left, right) => left.startTime - right.startTime);
  const groupCounts = new Map<string, number>();
  for (const task of tasks) {
    if (task.groupId) {
      groupCounts.set(task.groupId, (groupCounts.get(task.groupId) || 0) + 1);
    }
  }

  const lastFailedByAgent = new Map<string, string>();
  const nodes = tasks.map<CollaborationNode>((task, index) => {
    const agentKey = task.agentId || task.toolName;
    const inferredRetryOf = lastFailedByAgent.get(agentKey);
    let node: CollaborationNode;
    if (task.retryOf) {
      node = {
        task,
        relation: "retry",
        relationInferred: task.relationInferred ?? false,
      };
    } else if (inferredRetryOf) {
      node = { task, relation: "retry", relationInferred: true };
    } else if (task.eventType === "handoff") {
      node = { task, relation: "handoff", relationInferred: false };
    } else if (task.dependsOn?.length) {
      node = { task, relation: "dependency", relationInferred: false };
    } else if (task.groupId && (groupCounts.get(task.groupId) || 0) > 1) {
      node = { task, relation: "parallel", relationInferred: false };
    } else if (index === 0) {
      node = { task, relation: "dispatch", relationInferred: false };
    } else {
      node = { task, relation: "sequence", relationInferred: true };
    }
    if (task.status === "error")
      lastFailedByAgent.set(agentKey, task.toolCallId);
    else if (task.status === "done") lastFailedByAgent.delete(agentKey);
    return node;
  });

  const agentIds = new Set(tasks.map((task) => task.agentId).filter(Boolean));
  const hasRetries = nodes.some((node) => node.relation === "retry");
  const hasParallel = nodes.some((node) => node.relation === "parallel");
  const hasHandoff = nodes.some((node) => node.relation === "handoff");
  const hasDelegation = tasks.some((task) => task.eventType === "delegation");

  let kind: CollaborationKind = "direct";
  if (hasParallel) kind = "parallel";
  else if (hasHandoff) kind = "handoff";
  else if (agentIds.size > 1) kind = "supervisor";
  else if (hasRetries) kind = "retry";
  else if (hasDelegation) kind = "delegation";

  return {
    kind,
    nodes,
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "done").length,
    running: tasks.filter((task) => task.status === "running").length,
    failed: tasks.filter((task) => task.status === "error").length,
    hasRetries,
    hasParallel,
    inferred: nodes.some((node) => node.relationInferred),
  };
}

export interface TimelinePlacement {
  task: BackgroundTask;
  lane: number;
  left: number;
  width: number;
  waitLeft: number;
  waitWidth: number;
  startAt: number | null;
  endAt: number | null;
  executionMs: number;
  waitingMs: number;
  isLogical: boolean;
}

export function buildAgentTimeline(
  nodes: CollaborationNode[],
  now = Date.now(),
): TimelinePlacement[] {
  if (nodes.length === 0) return [];
  const lanes = new Map<string, number>();
  const logicalStep = 1000;
  const hasRealTimestamps = nodes.some(
    (node) => node.task.startTime >= 946_684_800_000,
  );
  const allStartAtOnce =
    hasRealTimestamps &&
    Math.max(...nodes.map((node) => node.task.startTime)) -
      Math.min(...nodes.map((node) => node.task.startTime)) <
      250;

  const logicalSlots = new Map<string, number>();
  for (const node of nodes) {
    const groupKey =
      node.task.groupId &&
      nodes.filter((candidate) => candidate.task.groupId === node.task.groupId)
        .length > 1
        ? `group:${node.task.groupId}`
        : `task:${node.task.toolCallId}`;
    if (!logicalSlots.has(groupKey))
      logicalSlots.set(groupKey, logicalSlots.size);
  }

  const ranges = nodes.map((node, index) => {
    const laneKey = node.task.agentId || node.task.toolCallId;
    if (!lanes.has(laneKey)) lanes.set(laneKey, lanes.size);
    const groupKey =
      node.task.groupId &&
      nodes.filter((candidate) => candidate.task.groupId === node.task.groupId)
        .length > 1
        ? `group:${node.task.groupId}`
        : `task:${node.task.toolCallId}`;
    const logicalIndex = logicalSlots.get(groupKey) ?? index;
    const start =
      !hasRealTimestamps || allStartAtOnce
        ? logicalIndex * logicalStep
        : node.task.startTime;
    const measuredEnd = node.task.endTime ?? now;
    const end = allStartAtOnce
      ? start + Math.max(logicalStep * 0.72, measuredEnd - node.task.startTime)
      : Math.max(start + 250, measuredEnd);
    return {
      node,
      start,
      end,
      lane: lanes.get(laneKey) || 0,
      isLogical: !hasRealTimestamps || allStartAtOnce,
    };
  });
  const min = Math.min(...ranges.map((range) => range.start));
  const max = Math.max(...ranges.map((range) => range.end));
  const span = Math.max(1, max - min);
  return ranges.map(({ node, start, end, lane, isLogical }, index) => {
    const previous = [...ranges]
      .slice(0, index)
      .reverse()
      .find(
        (candidate) =>
          !node.task.groupId ||
          candidate.node.task.groupId !== node.task.groupId,
      );
    const previousEnd = previous?.end ?? start;
    const waitingMs = Math.max(0, start - previousEnd);
    const executionMs = Math.max(0, end - start);
    const left = ((start - min) / span) * 100;
    const width = Math.max(7, (executionMs / span) * 100);
    return {
      task: node.task,
      lane,
      left,
      width,
      waitLeft: Math.max(0, ((previousEnd - min) / span) * 100),
      waitWidth: (waitingMs / span) * 100,
      startAt: isLogical ? null : node.task.startTime,
      endAt: isLogical ? null : node.task.endTime ?? now,
      executionMs,
      waitingMs,
      isLogical,
    };
  });
}
