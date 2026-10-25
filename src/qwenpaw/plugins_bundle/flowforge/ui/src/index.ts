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

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NodeIcon } from "./NodeIcon";
import { WorkflowEditor } from "./Editor";
import { ConditionFields } from "./ConditionFields";
import { RunInputDialog, RunMonitor, RunHistory } from "./RunPanels";
import { parseRuntimeInputs } from "./model";
// @ts-ignore — embedded stylesheet for blob-loaded plugin
import editorCss from "./editor.css?inline";
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
    styleEl.textContent = reactFlowCss + "\n" + editorCss;
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
    getSelectedAgentId?: () => string;
    useSelectedAgent?: () => { id: string };
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
  const agentId = getHost().getSelectedAgentId?.();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(agentId ? { "X-Agent-Id": agentId } : {}),
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
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail =
        typeof parsed.detail === "string"
          ? parsed.detail
          : JSON.stringify(parsed.detail || parsed);
    } catch {}
    throw new Error(
      resp.status === 409 && !path.includes("/runs/")
        ? `版本已变化，请重新打开最新版本后合并修改。${detail}`
        : detail || `HTTP ${resp.status}`,
    );
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
  available?: boolean;
  unavailable_reason?: string;
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
  revision?: number;
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

// ─── Node category colors ───────────────────────────────────────────────────

const NODE_COLORS: Record<string, string> = {
  StartNode: "#52c41a",
  EndNode: "#fa541c",
  InputNode: "#52c41a",
  OutputNode: "#fa541c",
  ToolCallNode: "#1677ff",
  ToolNode: "#1677ff",
  AgentNode: "#722ed1",
  ConditionNode: "#faad14",
  LLMCallNode: "#13c2c2",
  LLMNode: "#13c2c2",
  CodeNode: "#eb2f96",
  ScriptNode: "#eb2f96",
  ParallelNode: "#874d00",
  WaitNode: "#8c8c8c",
  TransformNode: "#0958d9",
  ErrorHandlerNode: "#cf1322",
  HumanReviewNode: "#d4380d",
  SubworkflowNode: "#5b8c00",
  QualityGateNode: "#7cb305",
  IterativeRefineNode: "#08979c",
  AssetExportNode: "#c41d7f",
};

function nodeColor(classType: string): string {
  return NODE_COLORS[classType] || "#1677ff";
}

function statusColor(s: string): string {
  return s === "completed" || s === "success"
    ? "#52c41a"
    : s === "running"
    ? "#1677ff"
    : s === "failed" || s === "error"
    ? "#ff4d4f"
    : s === "skipped"
    ? "#bfbfbf"
    : s === "blocked"
    ? "#faad14"
    : s === "cancelled"
    ? "#fa8c16"
    : "#d9d9d9";
}

// ─── Custom Node Card (240×120, matching LeAgent) ──────────────────────────

function NodeCard({ id, data, selected }: NodeProps) {
  const antd = getHost().antd;
  const Tag = antd?.Tag;
  const d = data as any;
  const classType: string = d?.class_type || d?.type || "ToolNode";
  const label: string = d?.label || d?._displayLabel || classType;
  const color = nodeColor(classType);
  const st: string = d?._status || "pending";
  const stColor = statusColor(st);
  const inputSockets = [...(d?.inputs_schema || [])];
  for (const name of d?._targetHandles || [])
    if (!inputSockets.some((field: any) => field.name === name))
      inputSockets.push({ name, type: "any" });
  const controlHandles = [
    ...new Set<string>([
      ...(d?._controlHandles || []),
      ...(Array.isArray(d?.control?.conditions)
        ? d.control.conditions.map(
            (_: any, index: number) => `condition:${index}`,
          )
        : []),
      ...(classType === "ConditionNode"
        ? [
            (d?._controlHandles || []).includes("else_node")
              ? "else_node"
              : "else",
          ]
        : []),
      ...(classType === "HumanReviewNode" ? ["next", "on_reject"] : []),
      ...(classType === "QualityGateNode" ? ["pass_node", "fail_node"] : []),
      ...(classType === "IterativeRefineNode"
        ? ["retry_node", "exhausted_node"]
        : []),
    ]),
  ];
  const outputSockets = d?.outputs_schema || [];

  return React.createElement(
    "div",
    {
      style: {
        padding: "10px 14px",
        borderRadius: 8,
        border: `2px solid ${selected ? color : stColor}`,
        background: "var(--ant-color-bg-container, #fff)",
        width: "240px",
        minWidth: "240px",
        maxWidth: "240px",
        minHeight: `${Math.max(
          120,
          65 +
            Math.max(inputSockets.length, (d?.outputs_schema || []).length) *
              18,
        )}px`,
        fontSize: 12,
        boxShadow:
          st === "running"
            ? `0 0 0 3px ${color}33`
            : selected
            ? "0 2px 8px rgba(0,0,0,0.12)"
            : "0 1px 4px rgba(0,0,0,0.08)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
      },
    },
    ...(inputSockets.length
      ? inputSockets.map((field: any, index: number) =>
          React.createElement(Handle, {
            key: `in-${field.name}`,
            id: field.name,
            type: "target",
            position: Position.Left,
            style: { top: 38 + index * 18, background: field.color || color },
            title: `${field.name}: ${field.type}`,
          }),
        )
      : [
          React.createElement(Handle, {
            key: "in-default",
            type: "target",
            position: Position.Left,
          }),
        ]),
    ...controlHandles.map((handle, index) =>
      React.createElement(Handle, {
        key: `control-${handle}`,
        id: handle,
        type: "source",
        position: Position.Bottom,
        title: `控制分支：${handle}`,
        style: {
          left: `${((index + 1) * 100) / (controlHandles.length + 1)}%`,
          background: "#d97706",
          borderRadius: 2,
        },
      }),
    ),
    // Header row: icon + label + status tag
    React.createElement(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 6 } },
      React.createElement(NodeIcon, { classType, icon: d?.icon }),
      React.createElement(
        "strong",
        {
          style: {
            color,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
        },
        label,
      ),
      Tag
        ? React.createElement(
            Tag,
            { color: stColor, style: { marginLeft: "auto", fontSize: 10 } },
            (
              {
                pending: "待执行",
                running: "执行中",
                success: "完成",
                failed: "失败",
                error: "错误",
                blocked: "待审核",
                skipped: "已跳过",
                cancelled: "已取消",
              } as Record<string, string>
            )[st] || st,
          )
        : null,
    ),
    d?._unavailableReason
      ? React.createElement(
          "div",
          { style: { color: "#dc2626", fontSize: 11, marginTop: 6 } },
          "当前不可用：",
          d._unavailableReason,
        )
      : null,
    // Description
    d?.description
      ? React.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-tertiary, #8c8c8c)",
              marginTop: 4,
              fontSize: 11,
              maxWidth: 212,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          },
          d.description,
        )
      : null,
    // Node ID footer
    React.createElement(
      "div",
      {
        style: {
          marginTop: "auto",
          paddingTop: 4,
          color: "var(--ant-color-text-quaternary, #bfbfbf)",
          fontSize: 10,
          fontFamily: "monospace",
        },
      },
      id,
      controlHandles.length
        ? React.createElement(
            "div",
            {
              style: {
                marginTop: 6,
                color: "#b7791f",
                fontFamily: "sans-serif",
              },
            },
            controlHandles.join(" · "),
          )
        : null,
    ),
    ...(outputSockets.length
      ? outputSockets.map((field: any, index: number) =>
          React.createElement(Handle, {
            key: `out-${field.name}`,
            id: field.name,
            type: "source",
            position: Position.Right,
            style: { top: 38 + index * 18, background: field.color || color },
            title: `${field.name}: ${field.type}`,
          }),
        )
      : [
          React.createElement(Handle, {
            key: "out-default",
            type: "source",
            position: Position.Right,
          }),
        ]),
  );
}

// ─── Custom Bezier Edge with label editing and delete ───────────────────────

function LabeledEdge(props: EdgeProps & any) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
    markerEnd,
  } = props;
  const antd = getHost().antd;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const onDelete = useCallback(
    (e: any) => {
      e.stopPropagation();
      // Dispatch a custom event that the parent ReactFlow can listen to
      const evt = new CustomEvent("flowforge:edge-delete", { detail: { id } });
      window.dispatchEvent(evt);
    },
    [id],
  );

  const startEdit = useCallback(
    (e: any) => {
      e.stopPropagation();
      setEditValue(data?.label || "");
      setEditing(true);
    },
    [data],
  );

  const commitEdit = useCallback(() => {
    setEditing(false);
    const evt = new CustomEvent("flowforge:edge-label", {
      detail: { id, label: editValue },
    });
    window.dispatchEvent(evt);
  }, [id, editValue]);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("path", {
      id,
      d: edgePath,
      stroke: selected
        ? "var(--ant-color-primary, #1677ff)"
        : data?.color || "var(--ant-color-text-quaternary, #bfbfbf)",
      strokeWidth: selected ? 3 : 2,
      fill: "none",
      markerEnd: markerEnd,
      style: { transition: "stroke 0.2s" },
    }),
    React.createElement(
      EdgeLabelRenderer,
      null,
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            display: "flex",
            alignItems: "center",
            gap: 4,
          },
          className: "nodrag nopan",
        },
        editing
          ? React.createElement("input", {
              value: editValue,
              onChange: (e: any) => setEditValue(e.target.value),
              onBlur: commitEdit,
              onKeyDown: (e: any) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") setEditing(false);
              },
              style: {
                width: 80,
                fontSize: 10,
                border: "1px solid var(--ant-color-primary, #1677ff)",
                borderRadius: 4,
                padding: "2px 4px",
                textAlign: "center",
              },
              autoFocus: true,
            })
          : React.createElement(
              "div",
              {
                onDoubleClick: startEdit,
                style: {
                  background: "var(--ant-color-bg-container, #fff)",
                  border: selected
                    ? "1px solid var(--ant-color-primary, #1677ff)"
                    : "1px solid var(--ant-color-border, #d9d9d9)",
                  borderRadius: 4,
                  padding: "2px 6px",
                  fontSize: 10,
                  textAlign: "center",
                  cursor: "pointer",
                  maxWidth: 100,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
                title: "双击编辑标签",
              },
              data?.label || "···",
            ),
        selected
          ? React.createElement(
              "button",
              {
                onClick: onDelete,
                style: {
                  border: "none",
                  background: "var(--ant-color-error, #ff4d4f)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 11,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                  padding: 0,
                },
                title: "删除连线",
              },
              "×",
            )
          : null,
      ),
    ),
  );
}

const nodeTypes = { workflow: NodeCard };
const edgeTypes = { labeled: LabeledEdge };

// ─── Typed Input Field Renderer ─────────────────────────────────────────────

function TypedInput({
  field,
  value,
  onChange,
}: {
  field: any;
  value: any;
  onChange: (v: any) => void;
}) {
  const antd = getHost().antd;
  const {
    Input,
    InputNumber,
    Select,
    Switch,
    Upload,
    Button,
    Input: { TextArea },
  } = antd;
  const type = String(field?.type || "any").toLowerCase();
  const name = field?.name || "";
  const required = field?.required;
  const label = name + (required ? " *" : "");
  const placeholder = `${type}`;
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "string" &&
    typeof value[1] === "number"
  ) {
    return React.createElement(
      antd.Form.Item,
      {
        key: name,
        label,
        help: "此参数由画布连线提供，删除连线后可手动输入。",
      },
      React.createElement(Input, {
        disabled: true,
        value: `${value[0]} → 输出 ${value[1]}`,
      }),
    );
  }

  if (["number", "int", "float", "integer"].includes(type)) {
    return React.createElement(
      antd.Form.Item,
      { key: name, label },
      React.createElement(InputNumber, {
        value: value ?? "",
        onChange: (v: any) => onChange(v),
        placeholder,
        min: field.min,
        max: field.max,
        precision: ["int", "integer"].includes(type) ? 0 : undefined,
        style: { width: "100%" },
      }),
    );
  }
  if (type === "boolean" || type === "bool") {
    return React.createElement(
      antd.Form.Item,
      { key: name, label },
      React.createElement(Switch, {
        checked: !!value,
        onChange: (v: any) => onChange(v),
      }),
    );
  }
  if (type === "select" || type === "enum") {
    const options = (field?.options || []).map((o: any) => ({
      label: typeof o === "string" ? o : o.label,
      value: typeof o === "string" ? o : o.value,
    }));
    return React.createElement(
      antd.Form.Item,
      { key: name, label },
      React.createElement(Select, {
        value: value ?? "",
        onChange: (v: any) => onChange(v),
        options,
        placeholder,
        allowClear: true,
      }),
    );
  }
  if (type === "object" || type === "array") {
    const rendered =
      typeof value === "string"
        ? value
        : JSON.stringify(value ?? (type === "array" ? [] : {}), null, 2);
    return React.createElement(
      antd.Form.Item,
      { key: name, label },
      React.createElement(TextArea, {
        value: rendered,
        autoSize: { minRows: 3, maxRows: 10 },
        onChange: (e: any) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            onChange(e.target.value);
          }
        },
        placeholder: type === "array" ? "[]" : "{}",
      }),
    );
  }
  if (["file", "image", "video", "audio"].includes(type)) {
    return React.createElement(
      antd.Form.Item,
      {
        key: name,
        label,
        help: "填写运行环境可访问的文件路径或已上传的资源引用",
      },
      React.createElement(Input, {
        value: typeof value === "string" ? value : value?.path || "",
        onChange: (event: any) => onChange(event.target.value),
        placeholder: "文件路径 / 资源 URI",
      }),
    );
  }
  if (
    type === "textarea" ||
    type === "multiline" ||
    name === "prompt" ||
    name === "system" ||
    name === "instruction"
  ) {
    return React.createElement(
      antd.Form.Item,
      { key: name, label },
      React.createElement(TextArea, {
        value: value ?? "",
        onChange: (e: any) => onChange(e.target.value),
        placeholder,
        autoSize: { minRows: 2, maxRows: 6 },
      }),
    );
  }
  return React.createElement(
    antd.Form.Item,
    { key: name, label },
    React.createElement(Input, {
      value: value ?? "",
      onChange: (e: any) => onChange(e.target.value),
      placeholder,
    }),
  );
}

// ─── Flow List Page ─────────────────────────────────────────────────────────

function FlowListPage({
  onEdit,
  onRun,
  onHistory,
}: {
  onEdit: (id: string) => void;
  onRun: (id: string) => void;
  onHistory: () => void;
}) {
  const antd = getHost().antd;
  const antdIcons = getHost().antdIcons;
  const {
    Table,
    Button,
    Space,
    Input,
    Modal,
    message,
    Typography,
    Card,
    Empty,
  } = antd;
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
    } catch (e: any) {
      message?.error(`加载失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = flows.filter(
    (f) =>
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toLowerCase().includes(search.toLowerCase()),
  );

  const createFlow = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      const doc = await apiFetch<FlowDocument>("/flowforge/flows", {
        method: "POST",
        body: JSON.stringify({
          id: `flow_${crypto.randomUUID().slice(0, 12)}`,
          name: newName.trim(),
          nodes: {},
          edges: [],
          outputs: [],
        }),
      });
      message?.success(`已创建工作流 ${doc.id}`);
      setNewName("");
      setNewModalOpen(false);
      onEdit(doc.id);
    } catch (e: any) {
      message?.error(`创建失败: ${e.message}`);
    }
  }, [newName, onEdit]);

  const duplicateFlow = useCallback(
    async (id: string) => {
      try {
        const doc = await apiFetch<FlowDocument>(
          `/flowforge/flows/${encodeURIComponent(id)}`,
        );
        const newId = `${id}_copy_${Date.now().toString(36)}`;
        doc.id = newId;
        doc.name = `${doc.name} (副本)`;
        delete doc.revision;
        await apiFetch(`/flowforge/flows/${encodeURIComponent(newId)}`, {
          method: "PUT",
          body: JSON.stringify(doc),
        });
        message?.success(`已复制为 ${newId}`);
        refresh();
      } catch (e: any) {
        message?.error(`复制失败: ${e.message}`);
      }
    },
    [refresh],
  );

  const deleteFlow = useCallback(
    async (id: string) => {
      Modal.confirm({
        title: "删除工作流",
        content: `确认删除 "${id}" 吗？此操作不可恢复。`,
        okType: "danger",
        onOk: async () => {
          try {
            await apiFetch(`/flowforge/flows/${encodeURIComponent(id)}`, {
              method: "DELETE",
            });
            message?.success("已删除");
            refresh();
          } catch (e: any) {
            message?.error(`删除失败: ${e.message}`);
          }
        },
      });
    },
    [refresh],
  );

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) =>
        React.createElement(
          "span",
          { style: { fontFamily: "monospace", fontSize: 12 } },
          id,
        ),
    },
    { title: "名称", dataIndex: "name", key: "name" },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    { title: "节点", dataIndex: "node_count", key: "node_count", width: 70 },
    { title: "版本", dataIndex: "version", key: "version", width: 70 },
    {
      title: "操作",
      key: "actions",
      width: 280,
      render: (_: any, row: FlowSummary) =>
        React.createElement(
          Space,
          null,
          React.createElement(
            Button,
            { size: "small", onClick: () => onEdit(row.id) },
            "编辑",
          ),
          React.createElement(
            Button,
            { size: "small", onClick: () => duplicateFlow(row.id) },
            "复制",
          ),
          React.createElement(
            Button,
            { size: "small", type: "primary", onClick: () => onRun(row.id) },
            "运行",
          ),
          React.createElement(
            Button,
            { size: "small", danger: true, onClick: () => deleteFlow(row.id) },
            "删除",
          ),
        ),
    },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        },
      },
      React.createElement(
        Title,
        { level: 4, style: { margin: 0 } },
        "工作流",
        React.createElement(
          "span",
          {
            style: {
              fontSize: 14,
              color: "var(--ant-color-text-tertiary, #8c8c8c)",
              marginLeft: 8,
            },
          },
          "可视化 DAG 工作流引擎",
        ),
      ),
      React.createElement(
        Space,
        null,
        React.createElement(Button, { onClick: onHistory }, "运行记录"),
        React.createElement(Input.Search, {
          placeholder: "搜索工作流",
          value: search,
          onChange: (e: any) => setSearch(e.target.value),
          style: { width: 220 },
          allowClear: true,
        }),
        React.createElement(Button, {
          icon: ReloadOutlined
            ? React.createElement(ReloadOutlined)
            : undefined,
          onClick: refresh,
          loading: loading,
        }),
        React.createElement(
          Button,
          {
            type: "primary",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: () => setNewModalOpen(true),
          },
          "新建工作流",
        ),
      ),
    ),
    React.createElement(Table, {
      rowKey: "id",
      columns,
      dataSource: filtered,
      loading,
      pagination: { pageSize: 20 },
      size: "small",
      locale: {
        emptyText: React.createElement(Empty, {
          description: "暂无工作流，点击「新建工作流」创建",
        }),
      },
    }),
    React.createElement(
      Modal,
      {
        title: "新建工作流",
        open: newModalOpen,
        onOk: createFlow,
        onCancel: () => {
          setNewModalOpen(false);
          setNewName("");
        },
        okText: "创建",
        cancelText: "取消",
        okButtonProps: { disabled: !newName.trim() },
      },
      React.createElement(Input, {
        placeholder: "输入工作流名称（如：库存日评估）",
        value: newName,
        onChange: (e: any) => setNewName(e.target.value),
        onPressEnter: createFlow,
      }),
    ),
  );
}

// ─── Flow Editor Page ───────────────────────────────────────────────────────

interface EditorProps {
  flowId: string;
  onBack: () => void;
  onRun: (id: string) => void;
  onHistory: () => void;
  runStatuses: Record<string, string>;
}

function FlowEditorPage(props: EditorProps) {
  const host = getHost();
  const selectedAgentId =
    host.useSelectedAgent?.()?.id || host.getSelectedAgentId?.() || "default";
  return React.createElement(WorkflowEditor, {
    ...props,
    agentId: selectedAgentId,
    antd: host.antd,
    api: apiFetch,
    nodeTypes,
    edgeTypes,
    Inspector: NodeInspector,
    IoConfig: IoConfigModal,
  });
}

// ─── Node Inspector ─────────────────────────────────────────────────────────

function NodeInspector({
  node,
  nodeTypes,
  availableNodes = [],
  onUpdate,
}: {
  node: Node;
  nodeTypes: NodeTypeSpec[];
  availableNodes?: Node[];
  onUpdate: (n: Node) => void;
}) {
  const antd = getHost().antd;
  const { Form, Input, Select, Typography, Divider, Collapse } = antd;
  const { Title: AntTitle, Text: AntText, Paragraph } = Typography;
  const data = (node.data || {}) as any;
  const classType = data.class_type || "ToolNode";
  const spec = nodeTypes.find((t) => t.class_type === classType);
  const targetOptions = availableNodes
    .filter((entry) => entry.id !== node.id)
    .map((entry) => ({
      label: `${entry.data.label || entry.id} · ${entry.id}`,
      value: entry.id,
    }));
  const controlLabels: Record<string, string> = {
    next: "完成后继续",
    else: "条件不匹配时",
    else_node: "条件不匹配时",
    on_reject: "审核拒绝时",
    error_handler: "失败处理节点",
    branches: "并行分支配置",
    pass_node: "质量达标时",
    fail_node: "质量未达标时",
    retry_node: "重新执行节点",
    exhausted_node: "迭代次数耗尽时",
  };

  const update = (key: string, value: any) => {
    onUpdate({ ...node, data: { ...data, [key]: value } });
  };
  const updateInput = (name: string, value: any) => {
    update("inputs", { ...(data.inputs || {}), [name]: value });
  };
  const updateControl = (key: string, value: any) => {
    update("control", { ...(data.control || {}), [key]: value });
  };

  const controlItems: any[] = [
    React.createElement(
      Form.Item,
      { key: "retry_count", label: "重试次数" },
      React.createElement(antd.InputNumber, {
        value: data.control?.max_retries ?? data.control?.retry_count ?? 0,
        onChange: (v: any) => updateControl("max_retries", v ?? 0),
        min: 0,
        max: 10,
        style: { width: "100%" },
      }),
    ),
    React.createElement(
      Form.Item,
      { key: "retry_delay", label: "重试延迟(秒)" },
      React.createElement(antd.InputNumber, {
        value: data.control?.retry_delay_sec ?? 1,
        onChange: (v: any) => updateControl("retry_delay_sec", v ?? 1),
        min: 0,
        step: 0.5,
        style: { width: "100%" },
      }),
    ),
    React.createElement(
      Form.Item,
      { key: "output_var", label: "输出变量名" },
      React.createElement(Input, {
        value: data.control?.output || "",
        onChange: (e: any) => updateControl("output", e.target.value),
        placeholder: "如：result",
      }),
    ),
    React.createElement(
      Form.Item,
      { key: "mode", label: "执行模式" },
      React.createElement(Select, {
        value: data.control?.mode || "run",
        onChange: (v: any) => updateControl("mode", v),
        options: [
          { label: "正常运行 (run)", value: "run" },
          { label: "静默跳过 (mute)", value: "mute" },
          { label: "直通上游 (bypass)", value: "bypass" },
        ],
      }),
    ),
  ];
  controlItems.push(
    React.createElement(
      Form.Item,
      { key: "timeout_sec", label: "节点超时（秒）" },
      React.createElement(antd.InputNumber, {
        value: data.control?.timeout_sec,
        min: 0.1,
        placeholder: "使用默认超时",
        style: { width: "100%" },
        onChange: (value: any) => updateControl("timeout_sec", value),
      }),
    ),
  );
  const classControls: Record<string, string[]> = {
    HumanReviewNode: ["next", "on_reject", "error_handler"],
    QualityGateNode: ["pass_node", "fail_node", "error_handler"],
    IterativeRefineNode: ["retry_node", "exhausted_node", "error_handler"],
  };
  for (const field of [
    ...new Set(classControls[classType] || spec?.control_schema || []),
  ]) {
    if (
      [
        "mode",
        "retry_count",
        "max_retries",
        "timeout_sec",
        "retry_delay_sec",
        "output",
      ].includes(field)
    )
      continue;
    if (field === "conditions") {
      controlItems.push(
        React.createElement(ConditionFields, {
          key: field,
          value: data.control?.conditions,
          targets: targetOptions,
          antd,
          onChange: (value: any[]) => updateControl("conditions", value),
        }),
      );
    } else if (field === "branches") {
      const rendered =
        typeof data.control?.[field] === "string"
          ? data.control[field]
          : JSON.stringify(data.control?.[field] || [], null, 2);
      controlItems.push(
        React.createElement(
          Form.Item,
          { key: field, label: controlLabels[field] || field },
          React.createElement(antd.Input.TextArea, {
            value: rendered,
            autoSize: { minRows: 4, maxRows: 12 },
            onChange: (event: any) => {
              try {
                updateControl(field, JSON.parse(event.target.value));
              } catch {
                updateControl(field, event.target.value);
              }
            },
          }),
        ),
      );
    } else {
      controlItems.push(
        React.createElement(
          Form.Item,
          { key: field, label: controlLabels[field] || field },
          React.createElement(Select, {
            value: data.control?.[field] || undefined,
            options: targetOptions,
            allowClear: true,
            onChange: (value: any) => updateControl(field, value),
            placeholder: "选择目标节点",
            showSearch: true,
            optionFilterProp: "label",
          }),
        ),
      );
    }
  }

  return React.createElement(
    Form,
    { layout: "vertical" },
    spec?.available === false
      ? React.createElement(antd.Alert, {
          type: "warning",
          showIcon: true,
          message: "此能力当前不可用",
          description: spec.unavailable_reason,
          style: { marginBottom: 16 },
        })
      : null,
    React.createElement(
      Form.Item,
      { label: "节点 ID" },
      React.createElement(Input, {
        value: node.id,
        disabled: true,
        style: { fontFamily: "monospace", fontSize: 11 },
      }),
    ),
    React.createElement(
      Form.Item,
      { label: "节点类型" },
      React.createElement(Select, {
        value: classType,
        onChange: (v: string) => update("class_type", v),
        options: nodeTypes.map((t) => ({
          label: t.display_name,
          value: t.class_type,
        })),
        showSearch: true,
        optionFilterProp: "label",
      }),
    ),
    React.createElement(
      Form.Item,
      { label: "显示标签" },
      React.createElement(Input, {
        value: data.label || "",
        onChange: (e: any) => update("label", e.target.value),
        placeholder: "节点显示名称",
      }),
    ),
    spec?.description
      ? React.createElement(
          Paragraph,
          {
            type: "secondary",
            style: {
              fontSize: 12,
              background: "var(--ant-color-fill-tertiary, #f5f5f5)",
              padding: 8,
              borderRadius: 4,
            },
          },
          spec.description,
        )
      : null,
    React.createElement(Divider, { style: { margin: "12px 0" } }),
    React.createElement(AntTitle, { level: 5 }, "输入参数"),
    (spec?.inputs_schema || []).length === 0
      ? React.createElement(
          AntText,
          { type: "secondary", style: { fontSize: 12 } },
          "此节点类型没有定义输入参数",
        )
      : (spec?.inputs_schema || []).map((field: any) =>
          React.createElement(TypedInput, {
            key: field.name,
            field,
            value: (data.inputs || {})[field.name],
            onChange: (v: any) => updateInput(field.name, v),
          }),
        ),
    React.createElement(Divider, { style: { margin: "12px 0" } }),
    React.createElement(Collapse, {
      ghost: true,
      defaultActiveKey: ["control"],
      items: [{ key: "control", label: "执行控制", children: controlItems }],
    }),
  );
}

// ─── IO Config Modal ────────────────────────────────────────────────────────

function IoConfigModal({
  open,
  doc,
  onClose,
  onSave,
}: {
  open: boolean;
  doc: FlowDocument | null;
  onClose: () => void;
  onSave: (inputs: any[], outputs: any, startId: string | null) => void;
}) {
  const antd = getHost().antd;
  const {
    Modal: AntModal,
    Form,
    Input,
    Button,
    Select,
    Space,
    Typography,
    Empty,
  } = antd;
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

  return React.createElement(
    AntModal,
    {
      title: "工作流输入/输出配置",
      open,
      onCancel: onClose,
      width: 600,
      footer: React.createElement(
        Space,
        null,
        React.createElement(Button, { onClick: onClose }, "取消"),
        React.createElement(
          Button,
          {
            type: "primary",
            onClick: () => {
              try {
                const defaults = parseRuntimeInputs(
                  inputs.map((field) => ({ ...field, required: false })),
                  Object.fromEntries(
                    inputs.map((field) => [field.name, field.default]),
                  ),
                );
                onSave(
                  inputs.map((field) => ({
                    ...field,
                    default: defaults[field.name],
                  })),
                  outputs,
                  startId,
                );
              } catch (error: any) {
                antd.message.error(error.message);
              }
            },
          },
          "确定",
        ),
      ),
    },
    // Start node
    React.createElement(
      Form.Item,
      { label: "起始节点" },
      React.createElement(Select, {
        value: startId,
        onChange: (v: any) => setStartId(v || null),
        options: nodeIds.map((id) => ({ label: id, value: id })),
        allowClear: true,
        placeholder: "自动选择起始节点",
      }),
    ),
    React.createElement(AntTitle, { level: 5 }, "工作流输入参数"),
    inputs.length === 0
      ? React.createElement(AntText, { type: "secondary" }, "无输入参数定义")
      : null,
    inputs.map((inp, idx) =>
      React.createElement(
        Space,
        { key: idx, style: { marginBottom: 8 } },
        React.createElement(Input, {
          placeholder: "名称",
          value: inp.name || "",
          onChange: (e: any) => {
            const ni = [...inputs];
            ni[idx] = { ...inp, name: e.target.value };
            setInputs(ni);
          },
          style: { width: 120 },
        }),
        React.createElement(Select, {
          value: inp.type || "any",
          onChange: (v: any) => {
            const ni = [...inputs];
            ni[idx] = { ...inp, type: v };
            setInputs(ni);
          },
          options: [
            { label: "any", value: "any" },
            { label: "string", value: "string" },
            { label: "number", value: "number" },
            { label: "boolean", value: "boolean" },
            { label: "object", value: "object" },
          ],
          style: { width: 100 },
        }),
        React.createElement(Input, {
          placeholder: "默认值",
          value:
            typeof inp.default === "object"
              ? JSON.stringify(inp.default)
              : String(inp.default ?? ""),
          onChange: (e: any) => {
            const ni = [...inputs];
            ni[idx] = { ...inp, default: e.target.value };
            setInputs(ni);
          },
          style: { width: 120 },
        }),
        React.createElement(
          antd.Checkbox,
          {
            checked: !!inp.required,
            onChange: (event: any) => {
              const ni = [...inputs];
              ni[idx] = { ...inp, required: event.target.checked };
              setInputs(ni);
            },
          },
          "必填",
        ),
        React.createElement(
          Button,
          {
            danger: true,
            size: "small",
            onClick: () => setInputs(inputs.filter((_, i) => i !== idx)),
          },
          "删除",
        ),
      ),
    ),
    React.createElement(
      Button,
      {
        size: "small",
        type: "dashed",
        onClick: () =>
          setInputs([...inputs, { name: "", type: "any", default: "" }]),
        style: { marginTop: 4 },
      },
      "+ 添加输入",
    ),
    React.createElement(
      AntTitle,
      { level: 5, style: { marginTop: 16 } },
      "工作流输出",
    ),
    React.createElement(Select, {
      mode: "multiple",
      value: Array.isArray(outputs) ? outputs : [],
      onChange: (v: any) => setOutputs(v),
      options: nodeIds.map((id) => ({ label: id, value: id })),
      placeholder: "选择输出节点ID",
      style: { width: "100%" },
    }),
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
  const [pendingRun, setPendingRun] = useState<FlowDocument | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const editFlow = useCallback((id: string) => {
    setFlowId(id);
    setRunStatuses({});
    setRoute("editor");
    window.history.replaceState(
      {},
      "",
      `/flowforge?flow=${encodeURIComponent(id)}`,
    );
  }, []);
  const backToList = useCallback(() => {
    setRoute("list");
    setFlowId(null);
    setRunStatuses({});
    window.history.replaceState({}, "", "/flowforge");
  }, []);
  const runFlow = useCallback(async (id: string) => {
    try {
      setPendingRun(
        await apiFetch<FlowDocument>(
          `/flowforge/flows/${encodeURIComponent(id)}`,
        ),
      );
    } catch (error: any) {
      getHost().antd.message.error(`读取运行参数失败：${error.message}`);
    }
  }, []);
  const startRun = useCallback(
    async (inputs: Record<string, any>) => {
      if (!pendingRun) return;
      const result = await apiFetch<{ run_id: string }>(
        `/flowforge/flows/${encodeURIComponent(pendingRun.id)}/run`,
        { method: "POST", body: JSON.stringify({ inputs }) },
      );
      setRunStatuses({});
      setRunId(result.run_id);
      setPendingRun(null);
    },
    [pendingRun],
  );
  const handleStatusUpdate = useCallback(
    (statuses: Record<string, string>, runFlowId: string) => {
      setRunStatuses(flowId === runFlowId ? statuses : {});
    },
    [flowId],
  );

  const handleCloseRun = useCallback(() => {
    setRunId(null);
    setRunStatuses({});
  }, []);

  return React.createElement(
    React.Fragment,
    null,
    route === "editor" && flowId
      ? React.createElement(FlowEditorPage, {
          flowId,
          onBack: backToList,
          onRun: runFlow,
          onHistory: () => setHistoryOpen(true),
          runStatuses,
        })
      : React.createElement(FlowListPage, {
          onEdit: editFlow,
          onRun: runFlow,
          onHistory: () => setHistoryOpen(true),
        }),
    React.createElement(RunMonitor, {
      runId,
      onClose: handleCloseRun,
      onStatusUpdate: handleStatusUpdate,
      onResumed: setRunId,
      antd: getHost().antd,
      api: apiFetch,
      streamUrl: apiUrl,
      headers: authHeaders,
    }),
    React.createElement(RunInputDialog, {
      flow: pendingRun,
      onClose: () => setPendingRun(null),
      onRun: startRun,
      antd: getHost().antd,
      TypedInput,
    }),
    React.createElement(RunHistory, {
      open: historyOpen,
      flowId,
      onClose: () => setHistoryOpen(false),
      onSelect: (id: string) => {
        setHistoryOpen(false);
        setRunId(id);
      },
      antd: getHost().antd,
      api: apiFetch,
    }),
  );
}

// ─── Plugin Registration ────────────────────────────────────────────────────

function buildPlugin() {
  const QP = (window as any).QwenPaw;
  if (!QP?.route) {
    console.warn(
      "[flowforge] QwenPaw.route API not available — plugin disabled",
    );
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
