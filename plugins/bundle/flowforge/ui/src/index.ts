/**
 * FlowForge frontend plugin for QwenPaw — ReactFlow DAG editor + run monitor.
 *
 * Source layout (compiled to `ui/dist/index.js` via `vite build`):
 *   - FlowListPage      — list saved flows; create / edit / delete / run.
 *   - FlowEditorPage    — ReactFlow canvas + node palette + inspector + toolbar.
 *   - RunMonitorDrawer  — real-time run progress via SSE /api/flowforge/runs/{id}/events.
 *
 * Uses `window.QwenPaw.host` for React/antd/getApiUrl (no bundled React copy).
 * Uses `@xyflow/react` (ReactFlow v12) — bundled into dist/index.js by vite.
 *
 * Registration follows the same pattern as the ugsci plugin:
 *   window.QwenPaw.route.add(pluginId, { id, path, component })
 *   window.QwenPaw.menu.add(pluginId, { id, label, icon, route, order })
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// @ts-ignore — @xyflow/react is bundled by vite, types resolved at build time
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// ─── Host access shim ───────────────────────────────────────────────────────

function getHost() {
  const host = (window as any).QwenPaw?.host;
  if (!host) throw new Error("[flowforge] QwenPaw.host not available");
  return host as {
    React: typeof React;
    antd: any;
    antdIcons: any;
    getApiUrl: (path: string) => string;
    getApiToken: () => string;
  };
}

function getToken(): string {
  try {
    return getHost().getApiToken() || "";
  } catch {
    return "";
  }
}

function apiUrl(path: string): string {
  return getHost().getApiUrl(path);
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const resp = await fetch(apiUrl(path), {
    ...opts,
    headers: { ...authHeaders(), ...(opts?.headers || {}) },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || `HTTP ${resp.status}`);
  }
  if (resp.status === 204) return null as T;
  return resp.json();
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface FlowSummary {
  id: string;
  name: string;
  description: string;
  version: string;
  node_count: number;
  updated_at: number;
}

interface NodeTypeSpec {
  class_type: string;
  display_name: string;
  description: string;
  category: string;
  icon: string;
  inputs_schema: any[];
  outputs_schema: any[];
  control_schema: string[];
}

interface FlowDocument {
  id: string;
  name: string;
  description: string;
  nodes: Record<string, any>;
  edges: any[];
  inputs: any[];
  outputs: any;
  start_id: string | null;
  metadata: Record<string, any>;
  version: string;
}

interface RunStatus {
  run_id: string;
  flow_id: string;
  state_id: string;
  status: string;
  started_at: number;
  finished_at: number | null;
  error: string | null;
  node_statuses: Record<string, string>;
  outputs: Record<string, any>;
  errors: string[];
  duration_ms: number;
}

// ─── ReactFlow custom node components ───────────────────────────────────────

const NODE_COLORS: Record<string, string> = {
  InputNode: "#52c41a",
  OutputNode: "#fa541c",
  ToolNode: "#1677ff",
  AgentNode: "#722ed1",
  ConditionNode: "#faad14",
  LLMNode: "#13c2c2",
  CodeNode: "#eb2f96",
};

function NodeCard({ id, data, selected }: NodeProps) {
  const antd = getHost().antd;
  const Tag = antd?.Tag;
  const d = data as any;
  const classType: string = d?.class_type || d?.type || "ToolNode";
  const label: string = d?.label || classType;
  const color = NODE_COLORS[classType] || "#1677ff";
  const status: string = d?._status || "pending";
  const statusColor =
    status === "completed"
      ? "#52c41a"
      : status === "running"
      ? "#1677ff"
      : status === "failed"
      ? "#ff4d4f"
      : status === "skipped"
      ? "#bfbfbf"
      : "#d9d9d9";

  return React.createElement(
    "div",
    {
      style: {
        padding: "10px 16px",
        borderRadius: 8,
        border: `2px solid ${selected ? color : statusColor}`,
        background: "#fff",
        width: 220,
        fontSize: 12,
        boxSizing: "border-box",
        boxShadow: status === "running" ? `0 0 0 3px ${color}33` : "0 2px 8px rgba(0,0,0,0.08)",
      },
    },
    React.createElement(Handle, { type: "target", position: Position.Left }),
    React.createElement(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 6 } },
      React.createElement("span", { style: { fontSize: 16 } }, d?.icon || "🔧"),
      React.createElement(
        "strong",
        { style: { color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
        label,
      ),
      Tag
        ? React.createElement(
            Tag,
            {
              color: statusColor,
              style: { marginLeft: "auto", fontSize: 10, flexShrink: 0 },
            },
            status,
          )
        : null,
    ),
    d?.description
      ? React.createElement(
          "div",
          { style: { color: "#8c8c8c", marginTop: 4, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
          d.description,
        )
      : null,
    React.createElement(Handle, { type: "source", position: Position.Right }),
  );
}

const nodeTypes = { default: NodeCard, tool: NodeCard, agent: NodeCard, condition: NodeCard, io: NodeCard, llm: NodeCard, code: NodeCard };

// ─── Flow List Page ─────────────────────────────────────────────────────────

function FlowListPage({ onEdit, onRun }: { onEdit: (id: string) => void; onRun: (id: string) => void }) {
  const antd = getHost().antd;
  const { Table, Button, Space, Input, Modal, message, Typography } = antd;
  const { Title } = Typography;
  const [flows, setFlows] = useState<FlowSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<FlowSummary[]>("/flowforge/flows");
      setFlows(data || []);
    } catch (e: any) {
      message?.error(`加载失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = flows.filter((f) => !search || f.name.includes(search) || f.id.includes(search));

  const createFlow = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      const doc = await apiFetch<FlowDocument>("/flowforge/flows", {
        method: "POST",
        body: JSON.stringify({ id: newName, name: newName, nodes: {}, edges: [], outputs: [] }),
      });
      message?.success(`已创建工作流 ${doc.id}`);
      setNewName("");
      onEdit(doc.id);
    } catch (e: any) {
      message?.error(`创建失败: ${e.message}`);
    }
  }, [newName, onEdit]);

  const deleteFlow = useCallback(async (id: string) => {
    Modal.confirm({
      title: "删除工作流",
      content: `确认删除 "${id}" 吗？此操作不可恢复。`,
      okType: "danger",
      onOk: async () => {
        try {
          await apiFetch(`/flowforge/flows/${encodeURIComponent(id)}`, { method: "DELETE" });
          message?.success("已删除");
          refresh();
        } catch (e: any) {
          message?.error(`删除失败: ${e.message}`);
        }
      },
    });
  }, [refresh]);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "名称", dataIndex: "name", key: "name" },
    { title: "描述", dataIndex: "description", key: "description", ellipsis: true },
    { title: "节点数", dataIndex: "node_count", key: "node_count", width: 80 },
    { title: "版本", dataIndex: "version", key: "version", width: 80 },
    {
      title: "操作",
      key: "actions",
      width: 240,
      render: (_: any, row: FlowSummary) => React.createElement(
        Space, null,
        React.createElement(Button, { size: "small", onClick: () => onEdit(row.id) }, "编辑"),
        React.createElement(Button, { size: "small", type: "primary", onClick: () => onRun(row.id) }, "运行"),
        React.createElement(Button, { size: "small", danger: true, onClick: () => deleteFlow(row.id) }, "删除"),
      ),
    },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(
      "div",
      { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 } },
      React.createElement(Title, { level: 4, style: { margin: 0 } }, "工作流"),
      React.createElement(
        Space,
        null,
        React.createElement(Input.Search, {
          placeholder: "搜索工作流",
          value: search,
          onChange: (e: any) => setSearch(e.target.value),
          style: { width: 240 },
          onSearch: refresh,
        }),
        React.createElement(Button, { onClick: refresh, loading }, "刷新"),
      ),
    ),
    React.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8 } },
      React.createElement(Input, {
        placeholder: "新工作流名称",
        value: newName,
        onChange: (e: any) => setNewName(e.target.value),
        style: { width: 240 },
        onPressEnter: createFlow,
      }),
      React.createElement(Button, { type: "dashed", onClick: createFlow, disabled: !newName.trim() }, "+ 新建工作流"),
    ),
    React.createElement(Table, {
      rowKey: "id",
      columns,
      dataSource: filtered,
      loading,
      pagination: { pageSize: 20 },
      size: "small",
    }),
  );
}

// ─── Flow Editor Page (ReactFlow canvas) ───────────────────────────────────

interface EditorProps {
  flowId: string;
  onBack: () => void;
  onRun: (id: string) => void;
}

function FlowEditorPage({ flowId, onBack, onRun }: EditorProps) {
  const antd = getHost().antd;
  const antdIcons = getHost().antdIcons;
  const { Button, Space, Input, Drawer, Form, Select, message, Typography, Tag, Empty } = antd;
  const { Title, Text } = Typography;
  const ArrowLeftOutlined = antdIcons?.ArrowLeftOutlined;
  const SaveOutlined = antdIcons?.SaveOutlined;
  const PlayCircleOutlined = antdIcons?.PlayCircleOutlined;

  const [doc, setDoc] = useState<FlowDocument | null>(null);
  const [nodeTypesList, setNodeTypesList] = useState<NodeTypeSpec[]>([]);
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load flow + node types
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [flow, types] = await Promise.all([
          apiFetch<FlowDocument>(`/flowforge/flows/${encodeURIComponent(flowId)}`),
          apiFetch<NodeTypeSpec[]>("/flowforge/node-types"),
        ]);
        if (cancelled) return;
        setDoc(flow);
        setNodeTypesList(types || []);
        // Convert flow nodes (dict) → ReactFlow nodes (array) with positions
        const savedPositions = (flow.metadata?.positions || {}) as Record<string, { x: number; y: number }>;
        const rfNodes: Node[] = Object.entries(flow.nodes || {}).map(([id, n]: [string, any], idx) => {
          const ct = n.class_type || n.type || "ToolNode";
          const spec = (types || []).find((t) => t.class_type === ct);
          const pos = savedPositions[id] || { x: 100 + (idx % 4) * 260, y: 80 + Math.floor(idx / 4) * 140 };
          return {
            id,
            type: "default",
            position: pos,
            data: { ...n, label: n.label || spec?.display_name || ct, icon: spec?.icon, class_type: ct, description: spec?.description },
          };
        });
        const rfEdges: Edge[] = (flow.edges || []).map((e: any, idx: number) => ({
          id: e.id || `e${idx}`,
          source: e.source,
          target: e.target,
          sourceHandle: e.source_handle,
          targetHandle: e.target_handle,
          animated: true,
        }));
        setRfNodes(rfNodes);
        setRfEdges(rfEdges);
      } catch (e: any) {
        message?.error(`加载工作流失败: ${e.message}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [flowId]);

  const onConnect = useCallback((conn: Connection) => {
    setRfEdges((eds: Edge[]) => addEdge({ ...conn, animated: true }, eds));
  }, [setRfEdges]);

  const addNode = useCallback((spec: NodeTypeSpec) => {
    const id = `${spec.class_type.toLowerCase()}_${Date.now().toString(36)}`;
    const newNode: Node = {
      id,
      type: "default",
      position: { x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 },
      data: {
        label: spec.display_name,
        class_type: spec.class_type,
        icon: spec.icon,
        description: spec.description,
        inputs: {},
        control: {},
      },
    };
    setRfNodes((nds: Node[]) => nds.concat(newNode));
  }, [setRfNodes]);

  const save = useCallback(async () => {
    if (!doc) return;
    setSaving(true);
    try {
      const nodes: Record<string, any> = {};
      const positions: Record<string, { x: number; y: number }> = {};
      for (const n of rfNodes) {
        const { label, icon, description, _status, ...rest } = (n.data || {}) as any;
        nodes[n.id] = { ...rest, id: n.id, class_type: rest.class_type || "ToolNode" };
        positions[n.id] = n.position;
      }
      const edges = rfEdges.map((e: Edge, idx: number) => ({
        id: e.id || `e${idx}`,
        source: e.source,
        target: e.target,
        source_handle: e.sourceHandle,
        target_handle: e.targetHandle,
      }));
      const payload: FlowDocument = {
        ...doc,
        nodes,
        edges,
        metadata: { ...doc.metadata, positions },
      };
      const saved = await apiFetch<FlowDocument>(`/flowforge/flows/${encodeURIComponent(flowId)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setDoc(saved);
      message?.success("已保存");
    } catch (e: any) {
      message?.error(`保存失败: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }, [doc, flowId, rfEdges, rfNodes]);

  // Group node types by category for the palette
  const palette = useMemo(() => {
    const groups: Record<string, NodeTypeSpec[]> = {};
    for (const t of nodeTypesList) {
      (groups[t.category] ||= []).push(t);
    }
    return groups;
  }, [nodeTypesList]);

  if (loading) return React.createElement(antd.Spin, { size: "large" });

  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden" },
      "data-flowforge-editor": true },
    // Toolbar
    React.createElement(
      "div",
      { style: { padding: "8px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 } },
      React.createElement(Button, { icon: ArrowLeftOutlined ? React.createElement(ArrowLeftOutlined) : undefined, onClick: onBack }, "返回"),
      React.createElement(Title, { level: 5, style: { margin: 0 } }, doc?.name || flowId),
      React.createElement(Tag, null, `${rfNodes.length} 节点 / ${rfEdges.length} 连接`),
      React.createElement(Space, { style: { marginLeft: "auto" } },
        React.createElement(Button, { icon: SaveOutlined ? React.createElement(SaveOutlined) : undefined, onClick: save, loading: saving }, "保存"),
        React.createElement(Button, { type: "primary", icon: PlayCircleOutlined ? React.createElement(PlayCircleOutlined) : undefined, onClick: () => onRun(flowId) }, "运行"),
      ),
    ),
    // Body: palette + canvas (flex row, fills remaining height)
    React.createElement(
      "div",
      { style: { display: "flex", flex: 1, minHeight: 0, overflow: "hidden" } },
      // Palette
      React.createElement(
        "div",
        { style: { width: 220, flexShrink: 0, borderRight: "1px solid #f0f0f0", padding: 12, overflowY: "auto", background: "#fafafa" } },
        React.createElement(Text, { strong: true }, "节点面板"),
        Object.entries(palette).map(([cat, items]) => React.createElement(
          "div",
          { key: cat, style: { marginTop: 12 } },
          React.createElement(Text, { type: "secondary", style: { fontSize: 11, textTransform: "uppercase" } }, cat),
          items.map((spec) => React.createElement(
            "div",
            {
              key: spec.class_type,
              onClick: () => addNode(spec),
              style: {
                padding: "6px 8px",
                margin: "4px 0",
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: 4,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
              },
              onMouseEnter: (e: any) => { e.currentTarget.style.borderColor = "#1677ff"; },
              onMouseLeave: (e: any) => { e.currentTarget.style.borderColor = "#e8e8e8"; },
            },
            React.createElement("span", null, spec.icon),
            React.createElement("span", null, spec.display_name),
          )),
        )),
      ),
      // Canvas — must have explicit height for ReactFlow to work.
      // We use position:absolute + top/left/right/bottom:0 to ensure
      // the container fills its flex parent regardless of CSS quirks.
      React.createElement(
        "div",
        { style: { flex: 1, position: "relative", minWidth: 0, minHeight: 200 } },
        React.createElement(
          ReactFlowProvider,
          null,
          React.createElement(
            ReactFlow,
          {
            nodes: rfNodes,
            edges: rfEdges,
            onNodesChange,
            onEdgesChange,
            onConnect,
            onNodeClick: (_: any, node: Node) => { setSelectedNode(node); setInspectorOpen(true); },
            nodeTypes,
            fitView: true,
            nodesDraggable: true,
            nodesConnectable: true,
            elementsSelectable: true,
            style: { background: "#f5f5f5", width: "100%", height: "100%" },
          },
            React.createElement(Background, { variant: BackgroundVariant.Dots, gap: 16, size: 1 }),
            React.createElement(Controls, null),
            React.createElement(MiniMap, { style: { background: "#fafafa" } }),
          ),
        ),
      ),
    ),
    // Inspector drawer — rendered OUTSIDE the flex body so it overlays correctly
    React.createElement(
      Drawer,
      {
        title: "节点属性",
        open: inspectorOpen,
        onClose: () => setInspectorOpen(false),
        width: 360,
      },
      selectedNode ? React.createElement(NodeInspector, { node: selectedNode, nodeTypes: nodeTypesList, onUpdate: (updated: Node) => {
        setRfNodes((nds: Node[]) => nds.map((n) => n.id === updated.id ? updated : n));
        setSelectedNode(updated);
      }}) : React.createElement(Empty, { description: "点击节点查看属性" }),
    ),
  );
}

function NodeInspector({ node, nodeTypes, onUpdate }: { node: Node; nodeTypes: NodeTypeSpec[]; onUpdate: (n: Node) => void }) {
  const antd = getHost().antd;
  const { Form, Input, Select, InputNumber, Typography } = antd;
  const data = (node.data || {}) as any;
  const classType = data.class_type || "ToolNode";
  const spec = nodeTypes.find((t) => t.class_type === classType);

  const update = (key: string, value: any) => {
    const newData = { ...data, [key]: value };
    onUpdate({ ...node, data: newData });
  };
  const updateInput = (name: string, value: any) => {
    const inputs = { ...(data.inputs || {}), [name]: value };
    update("inputs", inputs);
  };

  return React.createElement(
    Form,
    { layout: "vertical" },
    React.createElement(Form.Item, { label: "节点 ID" }, React.createElement(Input, { value: node.id, disabled: true })),
    React.createElement(Form.Item, { label: "类型" }, React.createElement(Select, {
      value: classType,
      onChange: (v: string) => update("class_type", v),
      options: nodeTypes.map((t) => ({ label: `${t.icon} ${t.display_name}`, value: t.class_type })),
    })),
    React.createElement(Form.Item, { label: "标签" }, React.createElement(Input, {
      value: data.label || "",
      onChange: (e: any) => update("label", e.target.value),
    })),
    spec?.description ? React.createElement(Typography.Paragraph, { type: "secondary", style: { fontSize: 12 } }, spec.description) : null,
    React.createElement(Typography.Title, { level: 5 }, "输入参数"),
    (spec?.inputs_schema || []).map((field: any) => React.createElement(
      Form.Item,
      { key: field.name, label: field.name + (field.required ? " *" : "") },
      React.createElement(Input, {
        value: (data.inputs || {})[field.name] ?? "",
        onChange: (e: any) => updateInput(field.name, e.target.value),
        placeholder: `${field.type || "any"}`,
      }),
    )),
  );
}

// ─── Run Monitor Drawer ─────────────────────────────────────────────────────

function RunMonitorDrawer({ runId, onClose }: { runId: string | null; onClose: () => void }) {
  const antd = getHost().antd;
  const { Drawer, Typography, Tag, Button, Spin, Empty, Timeline, message } = antd;
  const { Title, Text, Paragraph } = Typography;
  const [run, setRun] = useState<RunStatus | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const refresh = useCallback(async () => {
    if (!runId) return;
    try {
      const data = await apiFetch<RunStatus>(`/flowforge/runs/${encodeURIComponent(runId)}`);
      setRun(data);
    } catch (e: any) {
      message?.error(`获取运行状态失败: ${e.message}`);
    }
  }, [runId]);

  useEffect(() => {
    if (!runId) return;
    setLoading(true);
    refresh().finally(() => setLoading(false));
    // SSE stream
    const es = new EventSource(apiUrl(`/flowforge/runs/${encodeURIComponent(runId)}/events`));
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        setEvents((prev) => [...prev, payload]);
        if (payload.type?.startsWith("execution_")) refresh();
      } catch {}
    };
    es.onerror = () => { /* will reconnect */ };
    eventSourceRef.current = es;
    // Poll status every 2s as fallback
    const timer = setInterval(refresh, 2000);
    return () => {
      es.close();
      clearInterval(timer);
    };
  }, [runId, refresh]);

  const statusColor = (s: string) =>
    s === "completed" ? "green" : s === "running" ? "blue" : s === "failed" ? "red" : s === "cancelled" ? "orange" : "default";

  return React.createElement(
    Drawer,
    {
      title: runId ? `运行监控 — ${runId.slice(0, 8)}` : "运行监控",
      open: !!runId,
      onClose,
      width: 520,
    },
    loading && !run ? React.createElement(Spin, null) : null,
    run ? React.createElement(
      React.Fragment,
      null,
      React.createElement("div", { style: { marginBottom: 12, display: "flex", gap: 8, alignItems: "center" } },
        React.createElement(Tag, { color: statusColor(run.status) }, run.status),
        React.createElement(Text, { type: "secondary" }, `${run.duration_ms}ms`),
      ),
      React.createElement(Title, { level: 5 }, "节点状态"),
      React.createElement(
        "div",
        null,
        Object.entries(run.node_statuses || {}).map(([nid, st]) => React.createElement(
          "div",
          { key: nid, style: { display: "flex", gap: 8, marginBottom: 4 } },
          React.createElement(Text, { style: { fontFamily: "monospace" } }, nid),
          React.createElement(Tag, { color: statusColor(st) }, st),
        )),
      ),
      run.errors?.length ? React.createElement(React.Fragment, null,
        React.createElement(Title, { level: 5, style: { marginTop: 16 } }, "错误"),
        run.errors.map((e, i) => React.createElement(Paragraph, { key: i, type: "danger", style: { fontSize: 12 } }, e)),
      ) : null,
      Object.keys(run.outputs || {}).length ? React.createElement(React.Fragment, null,
        React.createElement(Title, { level: 5, style: { marginTop: 16 } }, "输出"),
        React.createElement("pre", { style: { background: "#f5f5f5", padding: 8, borderRadius: 4, fontSize: 11, overflow: "auto" } },
          JSON.stringify(run.outputs, null, 2)),
      ) : null,
      React.createElement(Title, { level: 5, style: { marginTop: 16 } }, "事件流"),
      events.length === 0 ? React.createElement(Empty, { description: "等待事件..." }) : React.createElement(
        Timeline,
        {
          items: events.slice(-30).map((ev: any, i: number) => ({
            key: ev.type + '_' + i + '_' + (ev.node_id || ''),
            color: ev.type === "execution_success" ? "green"
              : ev.type === "execution_failed" || ev.type?.includes("failed") ? "red"
              : ev.type?.includes("running") ? "blue"
              : ev.type?.includes("completed") ? "green"
              : "gray",
            children: React.createElement(
              "span",
              { style: { fontSize: 12 } },
              React.createElement(Text, { strong: true }, ev.type),
              ev.node_id ? React.createElement(Text, { type: "secondary" }, ` · ${ev.node_id}`) : null,
              ev.data ? React.createElement("pre", { style: { fontSize: 10, margin: 0 } }, JSON.stringify(ev.data)) : null,
            ),
          })),
        }
      ),
    ) : React.createElement(Empty, { description: "未找到运行" }),
  );
}

// ─── Top-level App (route switching) ─────────────────────────────────────────

function FlowForgeApp() {
  const [route, setRoute] = useState<"list" | "editor">("list");
  const [flowId, setFlowId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const editFlow = useCallback((id: string) => { setFlowId(id); setRoute("editor"); }, []);
  const backToList = useCallback(() => { setRoute("list"); setFlowId(null); }, []);
  const runFlow = useCallback(async (id: string) => {
    try {
      const res = await apiFetch<{ run_id: string }>(`/flowforge/flows/${encodeURIComponent(id)}/run`, {
        method: "POST",
        body: JSON.stringify({ inputs: {} }),
      });
      setRunId(res.run_id);
    } catch (e: any) {
      const antd = getHost().antd;
      antd?.message?.error(`启动运行失败: ${e.message}`);
    }
  }, []);

  if (route === "editor" && flowId) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(FlowEditorPage, { flowId, onBack: backToList, onRun: runFlow }),
      React.createElement(RunMonitorDrawer, { runId, onClose: () => setRunId(null) }),
    );
  }
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(FlowListPage, { onEdit: editFlow, onRun: runFlow }),
    React.createElement(RunMonitorDrawer, { runId, onClose: () => setRunId(null) }),
  );
}

// ─── Plugin Registration ────────────────────────────────────────────────────

function buildPlugin() {
  const QP = (window as any).QwenPaw;
  if (!QP?.menu || !QP?.route) {
    console.warn("[flowforge] QwenPaw.menu/route API not available — plugin disabled");
    return;
  }
  const React = getHost().React;
  const PLUGIN_ID = "flowforge";
  const antdIcons = getHost().antdIcons || {};
  const ApartmentOutlined = antdIcons.ApartmentOutlined;
  const NodeIndexOutlined = antdIcons.NodeIndexOutlined;

  // ── Inject global CSS to ensure the route container fills the page ──
  // The host's route container may not have height:100% by default,
  // which collapses the flex chain and makes ReactFlow invisible.
  const flowforgeCss = document.createElement("style");
  flowforgeCss.textContent = `
[data-flowforge-editor] { height: 100% !important; min-height: 0 !important; }
[data-flowforge-editor] > div:first-child { flex-shrink: 0; }
[data-flowforge-editor] .react-flow { background: #f5f5f5; }
[data-flowforge-editor] .react-flow__node { cursor: grab; }
[data-flowforge-editor] .react-flow__node.dragging { cursor: grabbing; }
`;
  document.head.appendChild(flowforgeCss);

  QP.route.add(PLUGIN_ID, {
    id: "flowforge.editor",
    path: "/flowforge",
    component: FlowForgeApp,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "flowforge.editor",
    location: "primary.agentScoped",
    label: () => "工作流",
    icon: ApartmentOutlined
      ? React.createElement(ApartmentOutlined, { style: { fontSize: 16 } })
      : React.createElement(NodeIndexOutlined || "span", NodeIndexOutlined ? { style: { fontSize: 16 } } : null, "⚡"),
    route: "flowforge.editor",
    order: 9,
  });

  // Register for Simple Mode so the workflow menu item stays visible
  // when the sidebar is in "simple" mode.
  if (QP.sidebar?.registerSimpleModeItem) {
    QP.sidebar.registerSimpleModeItem("flowforge.editor");
    console.info("[flowforge] Registered for simple-mode visibility");
  } else {
    console.warn("[flowforge] sidebar.registerSimpleModeItem not available");
  }

  console.info("[flowforge] Plugin registered: DAG editor route + menu active");
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

function tryBuildPlugin() {
  try {
    buildPlugin();
  } catch (err) {
    console.error("[flowforge] Failed to build plugin:", err);
    setTimeout(tryBuildPlugin, 500);
  }
}

if ((window as any).QwenPaw?.host) {
  tryBuildPlugin();
} else {
  const interval = setInterval(() => {
    if ((window as any).QwenPaw?.host) {
      clearInterval(interval);
      tryBuildPlugin();
    }
  }, 100);
}
