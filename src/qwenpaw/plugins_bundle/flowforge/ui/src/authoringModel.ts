import type { Node, Edge } from "@xyflow/react";
import {
  canvasFromDocument,
  type FlowDocument,
  type NodeTypeSpec,
} from "./model";
import type { ValidationResult } from "./graphContracts";

export type RepairSource = { runId: string; nodeId: string; flowId: string };
export type RepairRequest = RepairSource & {
  key: string;
  agentId: string;
  userId: string;
};
export type RepairContext = {
  run_id: string;
  node_id: string;
  flow_revision?: number | null;
  node_label: string;
  error?: unknown;
  configuration_available: boolean;
  configuration?: unknown;
  inputs_available: boolean;
  inputs?: unknown;
  outputs_available: boolean;
  outputs?: unknown;
  events: unknown[];
};

export type Proposal = {
  proposal_id: string;
  flow: FlowDocument;
  base_revision: number;
  repair_context?: RepairContext;
  explanation?: string;
  parent_proposal_id?: string | null;
  selected_node_ids?: string[] | null;
  validation: ValidationResult;
  warnings?: string[];
  expires_at?: number;
  changes: {
    kind: string;
    node_id?: string;
    field?: string;
    description: string;
    details?: { path: string; before: unknown; after: unknown }[];
  }[];
};

const edgeKey = (edge: Edge) =>
  JSON.stringify([
    edge.source,
    edge.target,
    edge.sourceHandle || "",
    edge.targetHandle || "",
    edge.data?.kind || "data",
    edge.data?.source_slot ?? 0,
    edge.data?.label || "",
  ]);

export function proposalCanvas(
  base: FlowDocument,
  proposal: Proposal,
  specs: NodeTypeSpec[],
  measuredNodes: Node[] = [],
): { nodes: Node[]; edges: Edge[] } {
  const measurements = new Map(
    measuredNodes.map((node) => [node.id, node.measured]),
  );
  const before = canvasFromDocument(base, specs);
  const after = canvasFromDocument(proposal.flow, specs);
  const changes = new Map(
    proposal.changes
      .filter((change) => change.node_id)
      .map((change) => [change.node_id!, change.kind]),
  );
  const nodes: Node[] = after.nodes.map((node) => {
    const moved =
      base.nodes[node.id] &&
      JSON.stringify(base.metadata?.positions?.[node.id]) !==
        JSON.stringify(proposal.flow.metadata?.positions?.[node.id]);
    const kind = changes.get(node.id) || (moved ? "modified" : undefined);
    return {
      ...node,
      measured: measurements.get(node.id),
      className: kind ? `ff-ai-${kind}` : "",
      draggable: false,
      connectable: false,
      data: { ...node.data, _aiChange: kind },
    };
  });
  for (const node of before.nodes) {
    if (!proposal.flow.nodes[node.id])
      nodes.push({
        ...node,
        measured: measurements.get(node.id),
        className: "ff-ai-removed",
        draggable: false,
        connectable: false,
        data: { ...node.data, _aiChange: "removed" },
      });
  }
  const beforeKeys = new Set(before.edges.map(edgeKey));
  const afterKeys = new Set(after.edges.map(edgeKey));
  const edges: Edge[] = after.edges.map((edge) => ({
    ...edge,
    className: beforeKeys.has(edgeKey(edge)) ? "" : "ff-ai-edge-added",
    deletable: false,
    reconnectable: false,
  }));
  for (const edge of before.edges) {
    if (!afterKeys.has(edgeKey(edge)))
      edges.push({
        ...edge,
        id: `ai-removed:${edge.id}`,
        className: "ff-ai-edge-removed",
        deletable: false,
        reconnectable: false,
      });
  }
  return {
    nodes: nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        _layoutRevision: proposal.proposal_id,
        _sourceHandles: edges
          .filter(
            (edge) => edge.source === node.id && edge.data?.kind !== "control",
          )
          .map(
            (edge) =>
              edge.sourceHandle ||
              node.data.outputs_schema?.[Number(edge.data?.source_slot || 0)]
                ?.name,
          )
          .filter(Boolean),
        _targetHandles: edges
          .filter((edge) => edge.target === node.id)
          .map((edge) => edge.targetHandle)
          .filter(Boolean),
        _controlHandles: edges
          .filter(
            (edge) => edge.source === node.id && edge.data?.kind === "control",
          )
          .map((edge) => edge.sourceHandle || "next"),
      },
    })),
    edges,
  };
}
