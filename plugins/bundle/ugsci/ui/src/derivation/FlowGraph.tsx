import { getHost } from "../core/runtime";
export function FlowGraph({ payload }: { payload: any }) {
  const React = getHost().React;
  const vars = payload?.trace?.variables || [];
  const steps = payload?.trace?.steps || [];
  const positioned = [
    ...vars.map((v: any, i: number) => ({
      id: v.name,
      label: v.symbol || v.name,
      x: 20,
      y: 30 + i * 54,
      kind: "variable",
    })),
    ...steps.map((s: any, i: number) => ({
      id: s.id,
      label: s.title,
      x: 380,
      y: 30 + i * 54,
      kind: "step",
      step: s,
    })),
  ];
  const byId = new Map(positioned.map((node: any) => [node.id, node]));
  const edges: any[] = [];
  for (const step of steps) {
    for (const read of step.reads || [])
      if (byId.has(read)) edges.push({ from: read, to: step.id });
    if (step.writes && byId.has(step.writes))
      edges.push({ from: step.id, to: step.writes });
  }
  return React.createElement(
    "svg",
    {
      viewBox: `0 0 760 ${Math.max(
        220,
        Math.max(vars.length, steps.length) * 54 + 50,
      )}`,
      width: "100%",
      role: "img",
      "aria-label": "推导流程图",
    },
    React.createElement(
      "defs",
      null,
      React.createElement(
        "marker",
        {
          id: "arrow",
          markerWidth: 8,
          markerHeight: 8,
          refX: 7,
          refY: 3,
          orient: "auto",
        },
        React.createElement("path", { d: "M0,0 L0,6 L8,3 z", fill: "#94a3b8" }),
      ),
    ),
    ...edges.map((edge, i) => {
      const from: any = byId.get(edge.from);
      const to: any = byId.get(edge.to);
      return React.createElement("line", {
        key: `e${i}`,
        x1: from.x + 155,
        y1: from.y + 16,
        x2: to.x,
        y2: to.y + 16,
        stroke: "#94a3b8",
        markerEnd: "url(#arrow)",
      });
    }),
    ...positioned.map((node: any) =>
      React.createElement(
        "g",
        { key: node.id, transform: `translate(${node.x} ${node.y})` },
        React.createElement("rect", {
          width: 155,
          height: 32,
          rx: 6,
          fill: node.kind === "variable" ? "#eff6ff" : "#f8fafc",
          stroke: "#cbd5e1",
        }),
        React.createElement(
          "text",
          { x: 8, y: 20, fill: "#334155", fontSize: 11 },
          `${node.id} · ${String(node.label).slice(0, 18)}`,
        ),
      ),
    ),
  );
}
