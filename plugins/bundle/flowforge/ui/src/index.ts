/**
 * FlowForge frontend plugin for QwenPaw — full-featured ReactFlow DAG editor + run monitor.
 *
 * Ported from LeAgent's workflow editor, adapted to QwenPaw's plugin pattern:
 *   - Uses window.QwenPaw.host for React/antd/getApiUrl (no bundled React copy)
 *   - Uses @xyflow/react (ReactFlow v12) — bundled into dist/index.js by vite
 *   - Registration: window.QwenPaw.route.add + window.QwenPaw.menu.add
 *
 * Features ported from LeAgent:
 *   - FlowListPage: list/create/edit/delete/duplicate/run flows
 *   - FlowEditorPage: ReactFlow canvas + searchable node palette + typed node inspector
 *   - Custom bezier edges with inline label editing and delete buttons
 *   - Node search/filter, drag-to-add, keyboard delete, duplicate node
 *   - Run mode with real-time node status overlay on canvas
 *   - Workflow inputs/outputs configuration panel
 *   - Validation feedback in editor
 *   - Alignment tools (align left/right/top/bottom, distribute H/V)
 *   - Connection type validation
 *   - RunMonitorDrawer: real-time run progress via SSE + node timeline
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// @ts-ignore — @xyflow/react is bundled by vite, types resolved at build time
import {
  ReactFlow,
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
  type EdgeProps,
  BackgroundVariant,
  getConnectedEdges,
  MarkerType,
  getBezierPath,
  EdgeLabelRenderer,
  Panel,
} from "@xyflow/react";
// Import ReactFlow CSS as a string and inject at runtime.
// In blob URL loading context, external CSS files are not loaded,
// so we must inline the CSS into the JS bundle.
// @ts-ignore — ?inline imports CSS as a string
import reactFlowCss from "@xyflow/react/dist/style.css?inline";

if (typeof document !== "undefined") {
  const styleId = "flowforge-reactflow-css";
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.textContent = reactFlowCss;
    document.head.appendChild(styleEl);
  }
}

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
  try { return getHost().getApiToken() || ""; } catch { return ""; }
}

function apiUrl(path: string): string { return getHost().getApiUrl(path); }

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken();
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra };
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const resp = await fetch(apiUrl(path), { ...opts, headers: { ...authHeaders(), ...(opts?.headers || {}) } });
  if (!resp.ok) { const text = await resp.text().catch(() => ""); throw new Error(text || `HTTP ${resp.status}`); }
  if (resp.status === 204) return null as T;
  return resp.json();
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface FlowSummary { id: string; name: string; description: string; version: string; node_count: number; updated_at: number; }
interface NodeTypeSpec {
  class_type: string; display_name: string; description: string; category: string; icon: string;
  inputs_schema: any[]; outputs_schema: any[]; control_schema: string[];
}
interface FlowDocument {
  id: string; name: string; description: string;
  nodes: Record<string, any>; edges: any[];
  inputs: any[]; outputs: any; start_id: string | null;
  metadata: Record<string, any>; version: string;
}
interface RunStatus {
  run_id: string; flow_id: string; state_id: string; status: string;
  started_at: number; finished_at: number | null; error: string | null;
  node_statuses: Record<string, string>; outputs: Record<string, any>;
  errors: string[]; duration_ms: number;
}

// ─── Node category colors ───────────────────────────────────────────────────

const NODE_COLORS: Record<string, string> = {
  StartNode: "#52c41a", EndNode: "#fa541c", InputNode: "#52c41a", OutputNode: "#fa541c",
  ToolCallNode: "#1677ff", ToolNode: "#1677ff", AgentNode: "#722ed1",
  ConditionNode: "#faad14", LLMCallNode: "#13c2c2", LLMNode: "#13c2c2",
  CodeNode: "#eb2f96", ScriptNode: "#eb2f96", ParallelNode: "#874d00",
  WaitNode: "#8c8c8c", TransformNode: "#0958d9", ErrorHandlerNode: "#cf1322",
  HumanReviewNode: "#d4380d", SubworkflowNode: "#5b8c00", QualityGateNode: "#7cb305",
  IterativeRefineNode: "#08979c", AssetExportNode: "#c41d7f",
};

function nodeColor(classType: string): string { return NODE_COLORS[classType] || "#1677ff"; }

function statusColor(s: string): string {
  return s === "completed" || s === "success" ? "#52c41a" : s === "running" ? "#1677ff"
    : s === "failed" || s === "error" ? "#ff4d4f" : s === "skipped" ? "#bfbfbf"
    : s === "blocked" ? "#faad14" : s === "cancelled" ? "#fa8c16" : "#d9d9d9";
}

// ─── Custom Node Card (240×120, matching LeAgent) ──────────────────────────

function NodeCard({ id, data, selected }: NodeProps) {
  const antd = getHost().antd;
  const Tag = antd?.Tag;
  const d = data as any;
  const classType: string = d?.class_type || d?.type || "ToolNode";
  const label: string = d?.label || classType;
  const color = nodeColor(classType);
  const st: string = d?._status || "pending";
  const stColor = statusColor(st);
  const inputSockets = (d?.inputs_schema || []).filter((field: any) => field.forceInput || field.socket);
  const outputSockets = d?.outputs_schema || [];

  return React.createElement("div", {
    style: {
      padding: "10px 14px", borderRadius: 8,
      border: `2px solid ${selected ? color : stColor}`,
      background: "#fff", width: "240px", minWidth: "240px", maxWidth: "240px", minHeight: "120px", fontSize: 12,
      boxShadow: st === "running" ? `0 0 0 3px ${color}33` : selected ? "0 2px 8px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.08)",
      transition: "border-color 0.2s, box-shadow 0.2s",
      display: "flex", flexDirection: "column",
    },
  },
    ...(inputSockets.length
      ? inputSockets.map((field: any, index: number) =>
          React.createElement(Handle, {
            key: `in-${field.name}`, id: field.name, type: "target",
            position: Position.Left,
            style: { top: 38 + index * 18, background: field.color || color },
            title: `${field.name}: ${field.type}`,
          }),
        )
      : [React.createElement(Handle, { key: "in-default", type: "target", position: Position.Left })]),
    // Header row: icon + label + status tag
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
      React.createElement("span", { style: { fontSize: 16 } }, d?.icon || "🔧"),
      React.createElement("strong", { style: { color, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, label),
      Tag ? React.createElement(Tag, { color: stColor, style: { marginLeft: "auto", fontSize: 10 } }, st) : null,
    ),
    // Description
    d?.description ? React.createElement("div", { style: { color: "#8c8c8c", marginTop: 4, fontSize: 11, maxWidth: 212, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, d.description) : null,
    // Node ID footer
    React.createElement("div", { style: { marginTop: "auto", paddingTop: 4, color: "#bfbfbf", fontSize: 10, fontFamily: "monospace" } }, id),
    ...(outputSockets.length
      ? outputSockets.map((field: any, index: number) =>
          React.createElement(Handle, {
            key: `out-${field.name}`, id: field.name, type: "source",
            position: Position.Right,
            style: { top: 38 + index * 18, background: field.color || color },
            title: `${field.name}: ${field.type}`,
          }),
        )
      : [React.createElement(Handle, { key: "out-default", type: "source", position: Position.Right })]),
  );
}

// ─── Custom Bezier Edge with label editing and delete ───────────────────────

function LabeledEdge(props: EdgeProps & any) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected, markerEnd } = props;
  const antd = getHost().antd;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const onDelete = useCallback((e: any) => {
    e.stopPropagation();
    // Dispatch a custom event that the parent ReactFlow can listen to
    const evt = new CustomEvent("flowforge:edge-delete", { detail: { id } });
    window.dispatchEvent(evt);
  }, [id]);

  const startEdit = useCallback((e: any) => {
    e.stopPropagation();
    setEditValue(data?.label || "");
    setEditing(true);
  }, [data]);

  const commitEdit = useCallback(() => {
    setEditing(false);
    const evt = new CustomEvent("flowforge:edge-label", { detail: { id, label: editValue } });
    window.dispatchEvent(evt);
  }, [id, editValue]);

  return React.createElement(React.Fragment, null,
    React.createElement("path", {
      id, d: edgePath,
      stroke: selected ? "#1677ff" : (data?.color || "#bfbfbf"),
      strokeWidth: selected ? 3 : 2,
      fill: "none",
      markerEnd: markerEnd,
      style: { transition: "stroke 0.2s" },
    }),
    React.createElement(EdgeLabelRenderer, null,
      React.createElement("div", {
        style: {
          position: "absolute",
          transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          pointerEvents: "all",
          display: "flex", alignItems: "center", gap: 4,
        },
        className: "nodrag nopan",
      },
        editing
          ? React.createElement("input", {
              value: editValue,
              onChange: (e: any) => setEditValue(e.target.value),
              onBlur: commitEdit,
              onKeyDown: (e: any) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false); },
              style: {
                width: 80, fontSize: 10, border: "1px solid #1677ff",
                borderRadius: 4, padding: "2px 4px", textAlign: "center",
              },
              autoFocus: true,
            })
          : React.createElement("div", {
              onDoubleClick: startEdit,
              style: {
                background: "#fff", border: selected ? "1px solid #1677ff" : "1px solid #d9d9d9",
                borderRadius: 4, padding: "2px 6px", fontSize: 10, textAlign: "center",
                cursor: "pointer", maxWidth: 100,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              },
              title: "双击编辑标签",
            }, data?.label || "···"),
        selected ? React.createElement("button", {
          onClick: onDelete,
          style: {
            border: "none", background: "#ff4d4f", color: "#fff",
            borderRadius: "50%", width: 18, height: 18, fontSize: 11,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1, padding: 0,
          },
          title: "删除连线",
        }, "×") : null,
      ),
    ),
  );
}

const nodeTypes = { workflow: NodeCard };
const edgeTypes = { labeled: LabeledEdge };

// ─── Typed Input Field Renderer ─────────────────────────────────────────────

function TypedInput({ field, value, onChange }: { field: any; value: any; onChange: (v: any) => void }) {
  const antd = getHost().antd;
  const { Input, InputNumber, Select, Switch, Upload, Button, Input: { TextArea } } = antd;
  const type = String(field?.type || "any").toLowerCase();
  const name = field?.name || "";
  const required = field?.required;
  const label = name + (required ? " *" : "");
  const placeholder = `${type}`;

  if (type === "number" || type === "int" || type === "float") {
    return React.createElement(antd.Form.Item, { key: name, label },
      React.createElement(InputNumber, {
        value: value ?? "", onChange: (v: any) => onChange(v),
        placeholder, style: { width: "100%" },
      }),
    );
  }
  if (type === "boolean" || type === "bool") {
    return React.createElement(antd.Form.Item, { key: name, label },
      React.createElement(Switch, { checked: !!value, onChange: (v: any) => onChange(v) }),
    );
  }
  if (type === "select" || type === "enum") {
    const options = (field?.options || []).map((o: any) => ({ label: typeof o === "string" ? o : o.label, value: typeof o === "string" ? o : o.value }));
    return React.createElement(antd.Form.Item, { key: name, label },
      React.createElement(Select, { value: value ?? "", onChange: (v: any) => onChange(v), options, placeholder, allowClear: true }),
    );
  }
  if (type === "object" || type === "array") {
    const rendered = typeof value === "string" ? value : JSON.stringify(value ?? (type === "array" ? [] : {}), null, 2);
    return React.createElement(antd.Form.Item, { key: name, label },
      React.createElement(TextArea, {
        value: rendered, autoSize: { minRows: 3, maxRows: 10 },
        onChange: (e: any) => {
          try { onChange(JSON.parse(e.target.value)); }
          catch { onChange(e.target.value); }
        },
        placeholder: type === "array" ? "[]" : "{}",
      }),
    );
  }
  if (type === "file" || type === "image" || type === "video" || type === "audio") {
    return React.createElement(antd.Form.Item, { key: name, label },
      React.createElement(Upload, {
        beforeUpload: (file: any) => { onChange({ name: file.name, path: file.path || "", type: file.type, size: file.size }); return false; },
        maxCount: 1, showUploadList: true,
      }, React.createElement(Button, null, value?.name ? `已选择 ${value.name}` : "选择文件")),
    );
  }
  if (type === "textarea" || type === "multiline" || name === "prompt" || name === "system" || name === "instruction") {
    return React.createElement(antd.Form.Item, { key: name, label },
      React.createElement(TextArea, {
        value: value ?? "", onChange: (e: any) => onChange(e.target.value),
        placeholder, autoSize: { minRows: 2, maxRows: 6 },
      }),
    );
  }
  return React.createElement(antd.Form.Item, { key: name, label },
    React.createElement(Input, {
      value: value ?? "", onChange: (e: any) => onChange(e.target.value),
      placeholder,
    }),
  );
}

// ─── Flow List Page ─────────────────────────────────────────────────────────

function FlowListPage({ onEdit, onRun }: { onEdit: (id: string) => void; onRun: (id: string) => void }) {
  const antd = getHost().antd;
  const antdIcons = getHost().antdIcons;
  const { Table, Button, Space, Input, Modal, message, Typography, Card, Empty } = antd;
  const { Title } = Typography;
  const PlusOutlined = antdIcons?.PlusOutlined;
  const ReloadOutlined = antdIcons?.ReloadOutlined;

  const [flows, setFlows] = useState<FlowSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newModalOpen, setNewModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<FlowSummary[]>("/flowforge/flows");
      setFlows(data || []);
    } catch (e: any) { message?.error(`加载失败: ${e.message}`); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = flows.filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.id.toLowerCase().includes(search.toLowerCase()));

  const createFlow = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      const doc = await apiFetch<FlowDocument>("/flowforge/flows", {
        method: "POST", body: JSON.stringify({ id: newName, name: newName, nodes: {}, edges: [], outputs: [] }),
      });
      message?.success(`已创建工作流 ${doc.id}`);
      setNewName(""); setNewModalOpen(false);
      onEdit(doc.id);
    } catch (e: any) { message?.error(`创建失败: ${e.message}`); }
  }, [newName, onEdit]);

  const duplicateFlow = useCallback(async (id: string) => {
    try {
      const doc = await apiFetch<FlowDocument>(`/flowforge/flows/${encodeURIComponent(id)}`);
      const newId = `${id}_copy_${Date.now().toString(36)}`;
      doc.id = newId; doc.name = `${doc.name} (副本)`;
      await apiFetch(`/flowforge/flows/${encodeURIComponent(newId)}`, { method: "PUT", body: JSON.stringify(doc) });
      message?.success(`已复制为 ${newId}`);
      refresh();
    } catch (e: any) { message?.error(`复制失败: ${e.message}`); }
  }, [refresh]);

  const deleteFlow = useCallback(async (id: string) => {
    Modal.confirm({
      title: "删除工作流", content: `确认删除 "${id}" 吗？此操作不可恢复。`,
      okType: "danger",
      onOk: async () => {
        try { await apiFetch(`/flowforge/flows/${encodeURIComponent(id)}`, { method: "DELETE" }); message?.success("已删除"); refresh(); }
        catch (e: any) { message?.error(`删除失败: ${e.message}`); }
      },
    });
  }, [refresh]);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", render: (id: string) => React.createElement("span", { style: { fontFamily: "monospace", fontSize: 12 } }, id) },
    { title: "名称", dataIndex: "name", key: "name" },
    { title: "描述", dataIndex: "description", key: "description", ellipsis: true },
    { title: "节点", dataIndex: "node_count", key: "node_count", width: 70 },
    { title: "版本", dataIndex: "version", key: "version", width: 70 },
    {
      title: "操作", key: "actions", width: 280,
      render: (_: any, row: FlowSummary) => React.createElement(Space, null,
        React.createElement(Button, { size: "small", onClick: () => onEdit(row.id) }, "编辑"),
        React.createElement(Button, { size: "small", onClick: () => duplicateFlow(row.id) }, "复制"),
        React.createElement(Button, { size: "small", type: "primary", onClick: () => onRun(row.id) }, "运行"),
        React.createElement(Button, { size: "small", danger: true, onClick: () => deleteFlow(row.id) }, "删除"),
      ),
    },
  ];

  return React.createElement("div", { style: { padding: 24 } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 } },
      React.createElement(Title, { level: 4, style: { margin: 0 } }, "工作流", React.createElement("span", { style: { fontSize: 14, color: "#8c8c8c", marginLeft: 8 } }, "可视化 DAG 工作流引擎")),
      React.createElement(Space, null,
        React.createElement(Input.Search, { placeholder: "搜索工作流", value: search, onChange: (e: any) => setSearch(e.target.value), style: { width: 220 }, allowClear: true }),
        React.createElement(Button, { icon: ReloadOutlined ? React.createElement(ReloadOutlined) : undefined, onClick: refresh, loading: loading }),
        React.createElement(Button, { type: "primary", icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined, onClick: () => setNewModalOpen(true) }, "新建工作流"),
      ),
    ),
    React.createElement(Table, {
      rowKey: "id", columns, dataSource: filtered, loading,
      pagination: { pageSize: 20 }, size: "small",
      locale: { emptyText: React.createElement(Empty, { description: "暂无工作流，点击「新建工作流」创建" }) },
    }),
    React.createElement(Modal, {
      title: "新建工作流", open: newModalOpen, onOk: createFlow,
      onCancel: () => { setNewModalOpen(false); setNewName(""); },
      okText: "创建", cancelText: "取消", okButtonProps: { disabled: !newName.trim() },
    }, React.createElement(Input, {
      placeholder: "输入工作流 ID（如 my-workflow）",
      value: newName, onChange: (e: any) => setNewName(e.target.value),
      onPressEnter: createFlow,
    })),
  );
}

// ─── Flow Editor Page ───────────────────────────────────────────────────────

interface EditorProps {
  flowId: string; onBack: () => void; onRun: (id: string) => void;
  runStatuses: Record<string, string>;
}

function FlowEditorPage({ flowId, onBack, onRun, runStatuses }: EditorProps) {
  const antd = getHost().antd;
  const antdIcons = getHost().antdIcons;
  const { Button, Space, Input, Drawer, Form, Select, message, Typography, Tag, Empty, Tooltip, Popconfirm, Tabs, Spin, Collapse } = antd;
  const { Title, Text, Paragraph } = Typography;
  const ArrowLeftOutlined = antdIcons?.ArrowLeftOutlined;
  const SaveOutlined = antdIcons?.SaveOutlined;
  const PlayCircleOutlined = antdIcons?.PlayCircleOutlined;
  const CopyOutlined = antdIcons?.CopyOutlined;
  const DeleteOutlined = antdIcons?.DeleteOutlined;
  const SearchOutlined = antdIcons?.SearchOutlined;
  const CheckCircleOutlined = antdIcons?.CheckCircleOutlined;
  const ExclamationCircleOutlined = antdIcons?.ExclamationCircleOutlined;
  const AlignLeftOutlined = antdIcons?.AlignLeftOutlined;
  const AlignRightOutlined = antdIcons?.AlignRightOutlined;
  // AlignTopOutlined / AlignBottomOutlined don't exist in antd; use vertical align icons
  const VerticalAlignTopOutlined = antdIcons?.VerticalAlignTopOutlined;
  const VerticalAlignBottomOutlined = antdIcons?.VerticalAlignBottomOutlined;

  const [doc, setDoc] = useState<FlowDocument | null>(null);
  const [nodeTypesList, setNodeTypesList] = useState<NodeTypeSpec[]>([]);
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [validation, setValidation] = useState<{ ok: boolean; errors: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState("nodes");
  const [ioModalOpen, setIoModalOpen] = useState(false);
  const rfWrapper = useRef<HTMLDivElement>(null);

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
        setDoc(flow); setNodeTypesList(types || []);
        const savedPositions = (flow.metadata?.positions || {}) as Record<string, { x: number; y: number }>;
        const rfN: Node[] = Object.entries(flow.nodes || {}).map(([id, n]: [string, any], idx) => {
          const ct = n.class_type || n.type || "ToolNode";
          const spec = (types || []).find((t) => t.class_type === ct);
          const pos = savedPositions[id] || { x: 100 + (idx % 4) * 300, y: 80 + Math.floor(idx / 4) * 180 };
          return { id, type: "workflow", position: pos,
            data: {
              ...n, label: n.label || spec?.display_name || ct,
              icon: spec?.icon, class_type: ct, description: spec?.description,
              inputs_schema: spec?.inputs_schema || [],
              outputs_schema: spec?.outputs_schema || [],
            } };
        });
        const rfE: Edge[] = (flow.edges || []).map((e: any, idx: number) => ({
          id: e.id || `e${idx}`, source: e.source, target: e.target,
          sourceHandle: e.source_handle, targetHandle: e.target_handle,
          type: "labeled", animated: true, data: { label: e.label || "" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#bfbfbf" },
        }));
        setRfNodes(rfN); setRfEdges(rfE);
      } catch (e: any) { message?.error(`加载工作流失败: ${e.message}`); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [flowId]);

  // Sync run statuses to canvas nodes (execution overlay)
  useEffect(() => {
    setRfNodes((nds: Node[]) => nds.map((n) => ({
      ...n,
      data: { ...n.data, _status: runStatuses[n.id] || (n.data as any)?._status || "pending" },
    })));
  }, [runStatuses]);

  // Listen for edge events from LabeledEdge component
  useEffect(() => {
    const onEdgeDelete = (e: any) => {
      const edgeId = e.detail?.id;
      if (edgeId) {
        setRfEdges((eds: Edge[]) => eds.filter((ed) => ed.id !== edgeId));
      }
    };
    const onEdgeLabel = (e: any) => {
      const { id, label } = e.detail || {};
      if (id) {
        setRfEdges((eds: Edge[]) => eds.map((ed) => ed.id === id ? { ...ed, data: { ...ed.data, label } } : ed));
      }
    };
    window.addEventListener("flowforge:edge-delete", onEdgeDelete);
    window.addEventListener("flowforge:edge-label", onEdgeLabel);
    return () => {
      window.removeEventListener("flowforge:edge-delete", onEdgeDelete);
      window.removeEventListener("flowforge:edge-label", onEdgeLabel);
    };
  }, [setRfEdges]);

  const onConnect = useCallback((conn: Connection) => {
    setRfEdges((eds: Edge[]) => addEdge({ ...conn, type: "labeled", animated: true, data: { label: "" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#bfbfbf" } }, eds));
  }, [setRfEdges]);

  // Connection validation: no self-loops, no duplicates
  const isValidConnection = useCallback((conn: Connection | Edge) => {
    if (conn.source === conn.target) return false;
    const exists = rfEdges.some((e) => e.source === conn.source && e.target === conn.target);
    return !exists;
  }, [rfEdges]);

  const addNode = useCallback((spec: NodeTypeSpec) => {
    const id = `${spec.class_type.toLowerCase()}_${Date.now().toString(36)}`;
    const newNode: Node = {
      id, type: "workflow",
      position: { x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 },
      data: { label: spec.display_name, class_type: spec.class_type, icon: spec.icon, description: spec.description, inputs: {}, control: {} },
    };
    setRfNodes((nds: Node[]) => nds.concat(newNode));
  }, [setRfNodes]);

  const duplicateNode = useCallback((node: Node) => {
    const newId = `${node.id}_copy_${Date.now().toString(36)}`;
    const newNode: Node = {
      ...node, id: newId,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: { ...node.data, label: `${(node.data as any)?.label || ""} (副本)` },
      selected: false,
    };
    setRfNodes((nds: Node[]) => nds.concat(newNode));
    message?.success("已复制节点");
  }, [setRfNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setRfNodes((nds: Node[]) => nds.filter((n) => n.id !== nodeId));
    setRfEdges((eds: Edge[]) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) { setSelectedNode(null); setInspectorOpen(false); }
  }, [setRfNodes, setRfEdges, selectedNode]);

  // Keyboard delete
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNode && inspectorOpen) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        deleteNode(selectedNode.id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedNode, inspectorOpen, deleteNode]);

  // ─── Alignment tools ──────────────────────────────────────────────────────

  const alignNodes = useCallback((direction: "left" | "right" | "top" | "bottom") => {
    const selected = rfNodes.filter((n) => n.selected);
    if (selected.length < 2) { message?.warning("请先选中至少 2 个节点"); return; }
    const ref = direction === "left" ? Math.min(...selected.map((n) => n.position.x))
      : direction === "right" ? Math.max(...selected.map((n) => n.position.x + 240))
      : direction === "top" ? Math.min(...selected.map((n) => n.position.y))
      : Math.max(...selected.map((n) => n.position.y + 120));
    setRfNodes((nds: Node[]) => nds.map((n) => {
      if (!n.selected) return n;
      const pos = direction === "left" ? { ...n.position, x: ref }
        : direction === "right" ? { ...n.position, x: ref - 240 }
        : direction === "top" ? { ...n.position, y: ref }
        : { ...n.position, y: ref - 120 };
      return { ...n, position: pos };
    }));
  }, [rfNodes, setRfNodes]);

  const distributeNodes = useCallback((axis: "h" | "v") => {
    const selected = rfNodes.filter((n) => n.selected);
    if (selected.length < 3) { message?.warning("请先选中至少 3 个节点"); return; }
    const sorted = [...selected].sort((a, b) => axis === "h" ? a.position.x - b.position.x : a.position.y - b.position.y);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalSpan = axis === "h" ? last.position.x - first.position.x : last.position.y - first.position.y;
    const step = totalSpan / (sorted.length - 1);
    const idToPos = new Map<string, { x: number; y: number }>();
    sorted.forEach((n, i) => {
      if (axis === "h") idToPos.set(n.id, { ...n.position, x: first.position.x + step * i });
      else idToPos.set(n.id, { ...n.position, y: first.position.y + step * i });
    });
    setRfNodes((nds: Node[]) => nds.map((n) => idToPos.has(n.id) ? { ...n, position: idToPos.get(n.id)! } : n));
  }, [rfNodes, setRfNodes]);

  const save = useCallback(async () => {
    if (!doc) return;
    setSaving(true);
    try {
      const nodes: Record<string, any> = {};
      const positions: Record<string, { x: number; y: number }> = {};
      for (const n of rfNodes) {
        const {
          label, icon, description, _status,
          inputs_schema, outputs_schema, ...rest
        } = (n.data || {}) as any;
        nodes[n.id] = { ...rest, id: n.id, class_type: rest.class_type || "ToolNode" };
        positions[n.id] = n.position;
      }
      const edges = rfEdges.map((e: Edge, idx: number) => {
        const sourceNode = rfNodes.find((node) => node.id === e.source);
        const outputFields = ((sourceNode?.data as any)?.outputs_schema || []) as any[];
        const sourceSlot = Math.max(0, outputFields.findIndex((field) => field.name === e.sourceHandle));
        return {
          id: e.id || `e${idx}`, source: e.source, target: e.target,
          kind: (e.data as any)?.kind || "data",
          source_handle: e.sourceHandle, target_handle: e.targetHandle,
          source_slot: sourceSlot,
          label: (e.data as any)?.label || "",
        };
      });
      const payload: FlowDocument = { ...doc, nodes, edges, metadata: { ...doc.metadata, positions } };
      const saved = await apiFetch<FlowDocument>(`/flowforge/flows/${encodeURIComponent(flowId)}`, { method: "PUT", body: JSON.stringify(payload) });
      setDoc(saved); message?.success("已保存");
    } catch (e: any) { message?.error(`保存失败: ${e.message}`); }
    finally { setSaving(false); }
  }, [doc, flowId, rfEdges, rfNodes]);

  const validateFlow = useCallback(async () => {
    if (!doc) return;
    try {
      const nodes: Record<string, any> = {};
      for (const n of rfNodes) {
        const {
          label, icon, description, _status,
          inputs_schema, outputs_schema, ...rest
        } = (n.data || {}) as any;
        nodes[n.id] = { ...rest, id: n.id, class_type: rest.class_type || "ToolNode" };
      }
      const edges = rfEdges.map((e: Edge, idx: number) => {
        const sourceNode = rfNodes.find((node) => node.id === e.source);
        const outputs = ((sourceNode?.data as any)?.outputs_schema || []) as any[];
        return {
          id: e.id || `e${idx}`, source: e.source, target: e.target,
          kind: (e.data as any)?.kind || "data",
          source_handle: e.sourceHandle, target_handle: e.targetHandle,
          source_slot: Math.max(0, outputs.findIndex((field) => field.name === e.sourceHandle)),
        };
      });
      const payload = { ...doc, nodes, edges };
      const result = await apiFetch<{ ok: boolean; errors: string[] }>("/flowforge/flows/validate", { method: "POST", body: JSON.stringify(payload) });
      setValidation({ ok: result.ok, errors: result.errors || [] });
      if (result.ok) message?.success("验证通过"); else message?.warning(`验证发现 ${result.errors.length} 个问题`);
    } catch (e: any) { message?.error(`验证失败: ${e.message}`); }
  }, [doc, rfNodes, rfEdges]);

  // Palette with search
  const palette = useMemo(() => {
    const groups: Record<string, NodeTypeSpec[]> = {};
    const filtered = nodeTypesList.filter((t) =>
      !paletteSearch ||
      t.display_name.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      t.class_type.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(paletteSearch.toLowerCase())
    );
    for (const t of filtered) { (groups[t.category] ||= []).push(t); }
    return groups;
  }, [nodeTypesList, paletteSearch]);

  if (loading) return React.createElement("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", height: "100%" } }, React.createElement(Spin, { size: "large" }));

  return React.createElement("div", { style: { display: "flex", flexDirection: "column", height: "100%" }, "data-flowforge-editor": true },
    // Toolbar
    React.createElement("div", { style: { padding: "8px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 } },
      React.createElement(Button, { icon: ArrowLeftOutlined ? React.createElement(ArrowLeftOutlined) : undefined, onClick: onBack }, "返回"),
      React.createElement(Title, { level: 5, style: { margin: 0 } }, doc?.name || flowId),
      React.createElement(Tag, null, `${rfNodes.length} 节点 / ${rfEdges.length} 连接`),
      validation ? (validation.ok
        ? React.createElement(Tag, { icon: CheckCircleOutlined ? React.createElement(CheckCircleOutlined) : undefined, color: "success" }, "验证通过")
        : React.createElement(Tooltip, { title: validation.errors.join("\n") },
            React.createElement(Tag, { icon: ExclamationCircleOutlined ? React.createElement(ExclamationCircleOutlined) : undefined, color: "error" }, `${validation.errors.length} 个问题`)))
        : null,
      // Run status indicator
      Object.keys(runStatuses).length > 0 ? React.createElement(Tag, { color: "processing" }, `运行中: ${Object.values(runStatuses).filter((s) => s === "running").length} 执行中`) : null,
      React.createElement(Space, { style: { marginLeft: "auto" } },
        React.createElement(Button, { onClick: () => setIoModalOpen(true) }, "输入/输出配置"),
        React.createElement(Button, { icon: CheckCircleOutlined ? React.createElement(CheckCircleOutlined) : undefined, onClick: validateFlow }, "验证"),
        React.createElement(Button, { icon: SaveOutlined ? React.createElement(SaveOutlined) : undefined, onClick: save, loading: saving }, "保存"),
        React.createElement(Button, { type: "primary", icon: PlayCircleOutlined ? React.createElement(PlayCircleOutlined) : undefined, onClick: () => onRun(flowId) }, "运行"),
      ),
    ),
    // Body: palette + canvas + inspector
    React.createElement("div", { style: { display: "flex", flex: 1, minHeight: 0 } },
      // Palette sidebar
      React.createElement("div", { style: { width: 240, borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column", background: "#fafafa" } },
        React.createElement("div", { style: { padding: "8px 12px", borderBottom: "1px solid #f0f0f0" } },
          React.createElement(Input, {
            placeholder: "搜索节点...", prefix: SearchOutlined ? React.createElement(SearchOutlined) : undefined,
            value: paletteSearch, onChange: (e: any) => setPaletteSearch(e.target.value),
            allowClear: true, size: "small",
          }),
        ),
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "8px 12px" } },
          Object.entries(palette).map(([cat, items]) => React.createElement("div", { key: cat, style: { marginBottom: 12 } },
            React.createElement(Text, { type: "secondary", style: { fontSize: 10, textTransform: "uppercase", fontWeight: 600 } }, cat),
            items.map((spec) => React.createElement("div", {
              key: spec.class_type,
              onClick: () => addNode(spec),
              style: {
                padding: "6px 8px", margin: "4px 0", background: "#fff",
                border: "1px solid #e8e8e8", borderRadius: 4, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, fontSize: 12,
                borderLeft: `3px solid ${nodeColor(spec.class_type)}`,
              },
              onMouseEnter: (e: any) => { e.currentTarget.style.borderColor = nodeColor(spec.class_type); },
              onMouseLeave: (e: any) => { e.currentTarget.style.borderColor = "#e8e8e8"; },
              title: spec.description,
            },
              React.createElement("span", { style: { fontSize: 14 } }, spec.icon),
              React.createElement("span", null, spec.display_name),
            )),
          )),
        ),
      ),
      // Canvas
      React.createElement("div", { ref: rfWrapper, style: { flex: 1, position: "relative" } },
        React.createElement(ReactFlow, {
          nodes: rfNodes, edges: rfEdges,
          onNodesChange, onEdgesChange, onConnect,
          onNodeClick: (_: any, node: Node) => { setSelectedNode(node); setInspectorOpen(true); },
          nodeTypes, edgeTypes,
          isValidConnection,
          fitView: true, style: { background: "#f5f5f5" },
          deleteKeyCode: null,
        },
          React.createElement(Background, { variant: BackgroundVariant.Dots, gap: 16, size: 1 }),
          React.createElement(Controls, null),
          React.createElement(MiniMap, { style: { background: "#fafafa" }, nodeColor: (n: Node) => nodeColor((n.data as any)?.class_type || ""), nodeStrokeWidth: 2 }),
          // Alignment tools panel
          React.createElement(Panel, { position: "top-left" },
            React.createElement("div", {
              style: {
                background: "#fff", borderRadius: 6, padding: "4px 8px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)", display: "flex", gap: 4,
              },
            },
              React.createElement(Tooltip, { title: "左对齐" },
                React.createElement(Button, { size: "small", type: "text", icon: AlignLeftOutlined ? React.createElement(AlignLeftOutlined) : undefined, onClick: () => alignNodes("left") }),
              ),
              React.createElement(Tooltip, { title: "右对齐" },
                React.createElement(Button, { size: "small", type: "text", icon: AlignRightOutlined ? React.createElement(AlignRightOutlined) : undefined, onClick: () => alignNodes("right") }),
              ),
              React.createElement(Tooltip, { title: "顶部对齐" },
                React.createElement(Button, { size: "small", type: "text", icon: VerticalAlignTopOutlined ? React.createElement(VerticalAlignTopOutlined) : undefined, onClick: () => alignNodes("top") }, !VerticalAlignTopOutlined ? "⬆" : null),
              ),
              React.createElement(Tooltip, { title: "底部对齐" },
                React.createElement(Button, { size: "small", type: "text", icon: VerticalAlignBottomOutlined ? React.createElement(VerticalAlignBottomOutlined) : undefined, onClick: () => alignNodes("bottom") }, !VerticalAlignBottomOutlined ? "⬇" : null),
              ),
              React.createElement("div", { style: { width: 1, background: "#e8e8e8", margin: "0 2px" } }),
              React.createElement(Tooltip, { title: "水平分布" },
                React.createElement(Button, { size: "small", type: "text", onClick: () => distributeNodes("h") }, "H··"),
              ),
              React.createElement(Tooltip, { title: "垂直分布" },
                React.createElement(Button, { size: "small", type: "text", onClick: () => distributeNodes("v") }, "V··"),
              ),
            ),
          ),
        ),
      ),
      // Inspector drawer
      React.createElement(Drawer, {
        title: "节点属性", open: inspectorOpen,
        onClose: () => setInspectorOpen(false), width: 380,
        extra: selectedNode ? React.createElement(Space, null,
          React.createElement(Tooltip, { title: "复制节点" },
            React.createElement(Button, { size: "small", icon: CopyOutlined ? React.createElement(CopyOutlined) : undefined, onClick: () => duplicateNode(selectedNode) }),
          ),
          React.createElement(Popconfirm, { title: "确认删除此节点？", onConfirm: () => deleteNode(selectedNode.id) },
            React.createElement(Button, { size: "small", danger: true, icon: DeleteOutlined ? React.createElement(DeleteOutlined) : undefined }),
          ),
        ) : null,
      },
        selectedNode ? React.createElement(NodeInspector, {
          node: selectedNode, nodeTypes: nodeTypesList,
          onUpdate: (updated: Node) => {
            setRfNodes((nds: Node[]) => nds.map((n) => n.id === updated.id ? updated : n));
            setSelectedNode(updated);
          },
        }) : React.createElement(Empty, { description: "点击节点查看属性" }),
      ),
    ),
    // IO Config Modal
    React.createElement(IoConfigModal, {
      open: ioModalOpen, doc: doc,
      onClose: () => setIoModalOpen(false),
      onSave: (inputs: any[], outputs: any, startId: string | null) => {
        setDoc((d) => d ? { ...d, inputs, outputs, start_id: startId } : d);
        setIoModalOpen(false);
        message?.success("输入/输出配置已更新（需保存生效）");
      },
    }),
  );
}

// ─── Node Inspector ─────────────────────────────────────────────────────────

function NodeInspector({ node, nodeTypes, onUpdate }: { node: Node; nodeTypes: NodeTypeSpec[]; onUpdate: (n: Node) => void }) {
  const antd = getHost().antd;
  const { Form, Input, Select, Typography, Divider, Collapse } = antd;
  const { Title: AntTitle, Text: AntText, Paragraph } = Typography;
  const data = (node.data || {}) as any;
  const classType = data.class_type || "ToolNode";
  const spec = nodeTypes.find((t) => t.class_type === classType);

  const update = (key: string, value: any) => { onUpdate({ ...node, data: { ...data, [key]: value } }); };
  const updateInput = (name: string, value: any) => { update("inputs", { ...(data.inputs || {}), [name]: value }); };
  const updateControl = (key: string, value: any) => { update("control", { ...(data.control || {}), [key]: value }); };

  const controlItems: any[] = [
    React.createElement(Form.Item, { key: "retry_count", label: "重试次数" },
      React.createElement(antd.InputNumber, { value: data.control?.retry_count ?? 0, onChange: (v: any) => updateControl("retry_count", v ?? 0), min: 0, max: 10, style: { width: "100%" } }),
    ),
    React.createElement(Form.Item, { key: "retry_delay", label: "重试延迟(秒)" },
      React.createElement(antd.InputNumber, { value: data.control?.retry_delay_sec ?? 1, onChange: (v: any) => updateControl("retry_delay_sec", v ?? 1), min: 0, step: 0.5, style: { width: "100%" } }),
    ),
    React.createElement(Form.Item, { key: "output_var", label: "输出变量名" },
      React.createElement(Input, { value: data.control?.output || "", onChange: (e: any) => updateControl("output", e.target.value), placeholder: "如：result" }),
    ),
    React.createElement(Form.Item, { key: "mode", label: "执行模式" },
      React.createElement(Select, {
        value: data.control?.mode || "run", onChange: (v: any) => updateControl("mode", v),
        options: [
          { label: "正常运行 (run)", value: "run" },
          { label: "静默跳过 (mute)", value: "mute" },
          { label: "直通上游 (bypass)", value: "bypass" },
        ],
      }),
    ),
  ];
  for (const field of spec?.control_schema || []) {
    if (["mode", "retry_count", "retry_delay_sec", "output"].includes(field)) continue;
    if (field === "conditions" || field === "branches") {
      const rendered = typeof data.control?.[field] === "string"
        ? data.control[field]
        : JSON.stringify(data.control?.[field] || [], null, 2);
      controlItems.push(
        React.createElement(Form.Item, { key: field, label: field },
          React.createElement(antd.Input.TextArea, {
            value: rendered, autoSize: { minRows: 4, maxRows: 12 },
            onChange: (event: any) => {
              try { updateControl(field, JSON.parse(event.target.value)); }
              catch { updateControl(field, event.target.value); }
            },
          }),
        ),
      );
    } else {
      controlItems.push(
        React.createElement(Form.Item, { key: field, label: field },
          React.createElement(Input, {
            value: data.control?.[field] || "",
            onChange: (event: any) => updateControl(field, event.target.value),
            placeholder: "目标节点 ID",
          }),
        ),
      );
    }
  }

  return React.createElement(Form, { layout: "vertical" },
    React.createElement(Form.Item, { label: "节点 ID" }, React.createElement(Input, { value: node.id, disabled: true, style: { fontFamily: "monospace", fontSize: 11 } })),
    React.createElement(Form.Item, { label: "节点类型" },
      React.createElement(Select, {
        value: classType, onChange: (v: string) => update("class_type", v),
        options: nodeTypes.map((t) => ({ label: `${t.icon} ${t.display_name}`, value: t.class_type })),
        showSearch: true, optionFilterProp: "label",
      }),
    ),
    React.createElement(Form.Item, { label: "显示标签" },
      React.createElement(Input, { value: data.label || "", onChange: (e: any) => update("label", e.target.value), placeholder: "节点显示名称" }),
    ),
    spec?.description ? React.createElement(Paragraph, { type: "secondary", style: { fontSize: 12, background: "#f5f5f5", padding: 8, borderRadius: 4 } }, spec.description) : null,
    React.createElement(Divider, { style: { margin: "12px 0" } }),
    React.createElement(AntTitle, { level: 5 }, "输入参数"),
    (spec?.inputs_schema || []).length === 0
      ? React.createElement(AntText, { type: "secondary", style: { fontSize: 12 } }, "此节点类型没有定义输入参数")
      : (spec?.inputs_schema || []).map((field: any) =>
          React.createElement(TypedInput, { key: field.name, field, value: (data.inputs || {})[field.name], onChange: (v: any) => updateInput(field.name, v) }),
        ),
    React.createElement(Divider, { style: { margin: "12px 0" } }),
    React.createElement(Collapse, { ghost: true, defaultActiveKey: ["control"],
      items: [{ key: "control", label: "执行控制", children: controlItems }],
    }),
  );
}

// ─── IO Config Modal ────────────────────────────────────────────────────────

function IoConfigModal({ open, doc, onClose, onSave }: {
  open: boolean; doc: FlowDocument | null;
  onClose: () => void; onSave: (inputs: any[], outputs: any, startId: string | null) => void;
}) {
  const antd = getHost().antd;
  const { Modal: AntModal, Form, Input, Button, Select, Space, Typography, Empty } = antd;
  const { Title: AntTitle, Text: AntText } = Typography;
  const [inputs, setInputs] = useState<any[]>([]);
  const [outputs, setOutputs] = useState<any>([]);
  const [startId, setStartId] = useState<string | null>(null);

  useEffect(() => {
    if (open && doc) {
      setInputs(doc.inputs || []);
      setOutputs(doc.outputs || []);
      setStartId(doc.start_id || null);
    }
  }, [open, doc]);

  const nodeIds = doc ? Object.keys(doc.nodes || {}) : [];

  return React.createElement(AntModal, {
    title: "工作流输入/输出配置", open, onCancel: onClose, width: 600,
    footer: React.createElement(Space, null,
      React.createElement(Button, { onClick: onClose }, "取消"),
      React.createElement(Button, { type: "primary", onClick: () => onSave(inputs, outputs, startId) }, "确定"),
    ),
  },
    // Start node
    React.createElement(Form.Item, { label: "起始节点" },
      React.createElement(Select, {
        value: startId, onChange: (v: any) => setStartId(v || null),
        options: [{ label: "(自动)", value: null }, ...nodeIds.map((id) => ({ label: id, value: id }))],
        allowClear: true, placeholder: "选择起始节点",
      }),
    ),
    React.createElement(AntTitle, { level: 5 }, "工作流输入参数"),
    inputs.length === 0 ? React.createElement(AntText, { type: "secondary" }, "无输入参数定义") : null,
    inputs.map((inp, idx) => React.createElement(Space, { key: idx, style: { marginBottom: 8 } },
      React.createElement(Input, { placeholder: "名称", value: inp.name || "", onChange: (e: any) => { const ni = [...inputs]; ni[idx] = { ...inp, name: e.target.value }; setInputs(ni); }, style: { width: 120 } }),
      React.createElement(Select, { value: inp.type || "any", onChange: (v: any) => { const ni = [...inputs]; ni[idx] = { ...inp, type: v }; setInputs(ni); },
        options: [{ label: "any", value: "any" }, { label: "string", value: "string" }, { label: "number", value: "number" }, { label: "boolean", value: "boolean" }, { label: "object", value: "object" }],
        style: { width: 100 },
      }),
      React.createElement(Input, { placeholder: "默认值", value: inp.default ?? "", onChange: (e: any) => { const ni = [...inputs]; ni[idx] = { ...inp, default: e.target.value }; setInputs(ni); }, style: { width: 120 } }),
      React.createElement(Button, { danger: true, size: "small", onClick: () => setInputs(inputs.filter((_, i) => i !== idx)) }, "删除"),
    )),
    React.createElement(Button, { size: "small", type: "dashed", onClick: () => setInputs([...inputs, { name: "", type: "any", default: "" }]), style: { marginTop: 4 } }, "+ 添加输入"),
    React.createElement(AntTitle, { level: 5, style: { marginTop: 16 } }, "工作流输出"),
    React.createElement(Select, {
      mode: "tags", value: Array.isArray(outputs) ? outputs : [],
      onChange: (v: any) => setOutputs(v),
      options: nodeIds.map((id) => ({ label: id, value: id })),
      placeholder: "选择输出节点ID",
      style: { width: "100%" },
    }),
  );
}

// ─── Run Monitor Drawer ─────────────────────────────────────────────────────

function RunMonitorDrawer({ runId, onClose, onStatusUpdate }: { runId: string | null; onClose: () => void; onStatusUpdate?: (statuses: Record<string, string>) => void }) {
  const antd = getHost().antd;
  const { Drawer, Typography, Tag, Button, Spin, Empty, Timeline, message, Tabs, List, Tooltip } = antd;
  const { Title, Text, Paragraph } = Typography;
  const [run, setRun] = useState<RunStatus | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!runId) return;
    try {
      const data = await apiFetch<RunStatus>(`/flowforge/runs/${encodeURIComponent(runId)}`);
      setRun(data);
      if (onStatusUpdate && data?.node_statuses) {
        onStatusUpdate(data.node_statuses);
      }
    } catch (e: any) { message?.error(`获取运行状态失败: ${e.message}`); }
  }, [runId, onStatusUpdate]);

  useEffect(() => {
    if (!runId) return;
    setLoading(true); setEvents([]);
    refresh().finally(() => setLoading(false));
    const es = new EventSource(apiUrl(`/flowforge/runs/${encodeURIComponent(runId)}/events`));
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        setEvents((prev) => [...prev, payload]);
        if (payload.type?.startsWith("execution_")) refresh();
      } catch {}
    };
    es.onerror = () => {};
    const timer = setInterval(refresh, 2000);
    return () => { es.close(); clearInterval(timer); };
  }, [runId, refresh]);

  const isFinished = run?.status === "completed" || run?.status === "failed" || run?.status === "cancelled";

  return React.createElement(Drawer, {
    title: runId ? `运行监控 — ${runId.slice(0, 8)}` : "运行监控",
    open: !!runId, onClose, width: 560,
    extra: run && !isFinished ? React.createElement(Button, { size: "small", danger: true, onClick: async () => {
      try { await apiFetch(`/flowforge/runs/${encodeURIComponent(runId!)}/cancel`, { method: "POST" }); message?.success("已取消"); }
      catch (e: any) { message?.error(`取消失败: ${e.message}`); }
    }}, "取消运行") : null,
  },
    loading && !run ? React.createElement(Spin, null) : null,
    run ? React.createElement(React.Fragment, null,
      // Status header
      React.createElement("div", { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
        React.createElement(Tag, { color: statusColor(run.status) }, run.status),
        React.createElement(Text, { type: "secondary" }, `${run.duration_ms}ms`),
        run.flow_id ? React.createElement(Text, { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } }, `flow: ${run.flow_id}`) : null,
      ),
      // Tabs
      React.createElement(Tabs, {
        items: [
          {
            key: "nodes",
            label: "节点状态",
            children: React.createElement("div", null,
              Object.entries(run.node_statuses || {}).length === 0
                ? React.createElement(Empty, { description: "无节点状态" })
                : Object.entries(run.node_statuses || {}).map(([nid, st]) => React.createElement("div", {
                  key: nid, style: { display: "flex", gap: 8, marginBottom: 6, alignItems: "center" },
                },
                  React.createElement(Text, { style: { fontFamily: "monospace", fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis" } }, nid),
                  React.createElement(Tag, { color: statusColor(st) }, st),
                )),
            ),
          },
          {
            key: "outputs",
            label: "输出",
            children: Object.keys(run.outputs || {}).length
              ? React.createElement("pre", { style: { background: "#f5f5f5", padding: 8, borderRadius: 4, fontSize: 11, overflow: "auto", maxHeight: 400 } }, JSON.stringify(run.outputs, null, 2))
              : React.createElement(Empty, { description: "无输出" }),
          },
          {
            key: "errors",
            label: React.createElement("span", null, "错误", run.errors?.length ? React.createElement(Tag, { color: "error", style: { marginLeft: 4 } }, run.errors.length) : null),
            children: run.errors?.length
              ? run.errors.map((e, i) => React.createElement(Paragraph, { key: i, type: "danger", style: { fontSize: 12, background: "#fff2f0", padding: 8, borderRadius: 4, marginBottom: 4 } }, e))
              : React.createElement(Empty, { description: "无错误" }),
          },
          {
            key: "events",
            label: `事件流 (${events.length})`,
            children: events.length === 0
              ? React.createElement(Empty, { description: "等待事件..." })
              : React.createElement(Timeline, {
                items: events.slice(-50).map((ev: any) => ({
                  color: ev.type === "execution_success" ? "green"
                    : ev.type === "execution_failed" || ev.type?.includes("failed") ? "red"
                    : ev.type?.includes("running") ? "blue"
                    : ev.type?.includes("completed") ? "green"
                    : ev.type?.includes("blocked") ? "orange"
                    : "gray",
                  children: React.createElement("div", { style: { fontSize: 12 } },
                    React.createElement(Text, { strong: true }, ev.type),
                    ev.node_id ? React.createElement(Text, { type: "secondary" }, ` · ${ev.node_id}`) : null,
                    ev.data ? React.createElement("pre", { style: { fontSize: 10, margin: "4px 0 0 0", background: "#f5f5f5", padding: 4, borderRadius: 2, overflow: "auto", maxHeight: 120 } }, JSON.stringify(ev.data, null, 2)) : null,
                  ),
                })),
              }),
          },
        ],
      }),
    ) : React.createElement(Empty, { description: "未找到运行" }),
  );
}

// ─── Top-level App ──────────────────────────────────────────────────────────

function FlowForgeApp() {
  const initialFlowId = new URLSearchParams(window.location.search).get("flow");
  const initialRunId = new URLSearchParams(window.location.search).get("run");
  const [route, setRoute] = useState<"list" | "editor">(
    initialFlowId ? "editor" : "list",
  );
  const [flowId, setFlowId] = useState<string | null>(initialFlowId);
  const [runId, setRunId] = useState<string | null>(initialRunId);
  const [runStatuses, setRunStatuses] = useState<Record<string, string>>({});

  const editFlow = useCallback((id: string) => {
    setFlowId(id);
    setRoute("editor");
    window.history.replaceState({}, "", `/flowforge?flow=${encodeURIComponent(id)}`);
  }, []);
  const backToList = useCallback(() => {
    setRoute("list");
    setFlowId(null);
    setRunStatuses({});
    window.history.replaceState({}, "", "/flowforge");
  }, []);
  const runFlow = useCallback(async (id: string) => {
    try {
      const res = await apiFetch<{ run_id: string }>(`/flowforge/flows/${encodeURIComponent(id)}/run`, {
        method: "POST", body: JSON.stringify({ inputs: {} }),
      });
      setRunId(res.run_id);
    } catch (e: any) {
      const antd = getHost().antd;
      antd?.message?.error(`启动运行失败: ${e.message}`);
    }
  }, []);

  const handleStatusUpdate = useCallback((statuses: Record<string, string>) => {
    setRunStatuses(statuses);
  }, []);

  const handleCloseRun = useCallback(() => {
    setRunId(null);
    setRunStatuses({});
  }, []);

  if (route === "editor" && flowId) {
    return React.createElement(React.Fragment, null,
      React.createElement(FlowEditorPage, { flowId, onBack: backToList, onRun: runFlow, runStatuses }),
      React.createElement(RunMonitorDrawer, { runId, onClose: handleCloseRun, onStatusUpdate: handleStatusUpdate }),
    );
  }
  return React.createElement(React.Fragment, null,
    React.createElement(FlowListPage, { onEdit: editFlow, onRun: runFlow }),
    React.createElement(RunMonitorDrawer, { runId, onClose: handleCloseRun, onStatusUpdate: handleStatusUpdate }),
  );
}

// ─── Plugin Registration ────────────────────────────────────────────────────

function buildPlugin() {
  const QP = (window as any).QwenPaw;
  if (!QP?.route) {
    console.warn("[flowforge] QwenPaw.route API not available — plugin disabled");
    return;
  }
  const PLUGIN_ID = "flowforge";
  QP.route.add(PLUGIN_ID, {
    id: "flowforge.editor",
    path: "/flowforge",
    component: FlowForgeApp,
  });

  // FlowForge is the execution/editor surface behind
  // “专家·协作 / 协作工作流”, so it intentionally has no competing top-level
  // sidebar entry. The route remains directly navigable from that module.
  console.info("[flowforge] Plugin registered: DAG editor route active");
}

function tryBuildPlugin() {
  try { buildPlugin(); }
  catch (err) { console.error("[flowforge] Failed to build plugin:", err); setTimeout(tryBuildPlugin, 500); }
}

if ((window as any).QwenPaw?.host) {
  tryBuildPlugin();
} else {
  const interval = setInterval(() => {
    if ((window as any).QwenPaw?.host) { clearInterval(interval); tryBuildPlugin(); }
  }, 100);
}
