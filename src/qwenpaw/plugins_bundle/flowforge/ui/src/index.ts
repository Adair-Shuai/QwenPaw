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

import React, { useCallback, useEffect, useRef, useState } from "react";
import { NodeCard } from "./NodeCard";
import { WorkflowEditor } from "./Editor";
import { NodeInspector } from "./NodeInspector";
import { SchemaField } from "./SchemaField";
import { RunInputDialog, RunMonitor, RunHistory } from "./RunPanels";
import { parseRuntimeInputs } from "./model";
import type { RunRecord } from "./runRecord";
import type { RepairSource, RepairRequest } from "./authoringModel";
import { useWorkflowI18n, translateWorkflow, workflowLocale } from "./i18n";
import { useWorkflowIdentity } from "./useWorkflowIdentity";
// @ts-ignore — embedded stylesheet for blob-loaded plugin
import editorCss from "./editor.css?inline";
// @ts-ignore — embedded variable binding styles for blob-loaded plugins
import variableBindingsCss from "./variable-bindings.css?inline";
// @ts-ignore — @xyflow/react is bundled by vite, types resolved at build time
import {
  type EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
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
    styleEl.textContent =
      reactFlowCss + "\n" + editorCss + "\n" + variableBindingsCss;
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
    useSelectedAgent?: () => { id: string; name?: string };
    useLocale?: () => string;
    useLocation?: () => { pathname: string; search: string; hash: string };
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
    const error = new Error(
      resp.status === 409 && !path.includes("/runs/")
        ? `${translateWorkflow(
            "版本已变化，请重新打开最新版本后合并修改。",
            workflowLocale(),
            "The revision changed. Open the latest revision to merge your edits.",
          )}${detail}`
        : detail || `HTTP ${resp.status}`,
    );
    throw Object.assign(error, { status: resp.status });
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
  revision?: number;
  node_count: number;
  updated_at: number;
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

// ─── Custom Bezier Edge with label editing and delete ───────────────────────

function LabeledEdge(props: EdgeProps & any) {
  const { t } = useWorkflowI18n();
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
      className: "ff-edge-path",
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
                title: t("双击编辑标签", "Double-click to edit label"),
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
                title: t("删除连线", "Delete connection"),
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

// Runtime input dialogs share literal field rendering with the inspector.
function TypedInput(props: {
  field: any;
  value: any;
  onChange: (value: any) => void;
}) {
  return React.createElement(SchemaField, {
    ...props,
    antd: getHost().antd,
    api: apiFetch,
    agentId: getHost().getSelectedAgentId?.() || "default",
    classType: "RuntimeInput",
    nodeId: "runtime",
    scopeKey: "runtime",
  });
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

  const { t } = useWorkflowI18n();
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
      message?.error(`${t("加载失败", "Load failed")}: ${e.message}`);
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
      message?.success(`${t("已创建工作流", "Created workflow")} ${doc.id}`);
      setNewName("");
      setNewModalOpen(false);
      onEdit(doc.id);
    } catch (e: any) {
      message?.error(`${t("创建失败", "Creation failed")}: ${e.message}`);
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
        doc.name = `${doc.name} (${t("副本", "copy")})`;
        delete doc.revision;
        await apiFetch(`/flowforge/flows/${encodeURIComponent(newId)}`, {
          method: "PUT",
          body: JSON.stringify(doc),
        });
        message?.success(`${t("已复制为", "Copied to")} ${newId}`);
        refresh();
      } catch (e: any) {
        message?.error(`${t("复制失败", "Copy failed")}: ${e.message}`);
      }
    },
    [refresh],
  );

  const deleteFlow = useCallback(
    async (id: string) => {
      Modal.confirm({
        title: t("删除工作流", "Delete workflow"),
        content: t(
          "确认删除 {id} 吗？此操作不可恢复。",
          "Delete {id}? This operation cannot be undone.",
          { id },
        ),
        okType: "danger",
        onOk: async () => {
          try {
            await apiFetch(`/flowforge/flows/${encodeURIComponent(id)}`, {
              method: "DELETE",
            });
            message?.success(t("已删除", "Deleted"));
            refresh();
          } catch (e: any) {
            message?.error(`${t("删除失败", "Delete failed")}: ${e.message}`);
          }
        },
      });
    },
    [refresh],
  );

  const columns = [
    {
      title: t("ID", "ID"),
      dataIndex: "id",
      key: "id",
      render: (id: string) =>
        React.createElement(
          "span",
          { style: { fontFamily: "monospace", fontSize: 12 } },
          id,
        ),
    },
    { title: t("名称", "Name"), dataIndex: "name", key: "name" },
    {
      title: t("描述", "Description"),
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: t("节点", "Nodes"),
      dataIndex: "node_count",
      key: "node_count",
      width: 70,
    },
    {
      title: t("版本", "Revision"),
      dataIndex: "revision",
      key: "revision",
      width: 70,
    },
    {
      title: t("操作", "Actions"),
      key: "actions",
      width: 280,
      render: (_: any, row: FlowSummary) =>
        React.createElement(
          Space,
          null,
          React.createElement(
            Button,
            { size: "small", onClick: () => onEdit(row.id) },
            t("编辑", "Edit"),
          ),
          React.createElement(
            Button,
            { size: "small", onClick: () => duplicateFlow(row.id) },
            t("复制", "Duplicate"),
          ),
          React.createElement(
            Button,
            { size: "small", type: "primary", onClick: () => onRun(row.id) },
            t("运行", "Run"),
          ),
          React.createElement(
            Button,
            { size: "small", danger: true, onClick: () => deleteFlow(row.id) },
            t("删除", "Delete"),
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
        t("工作流", "Workflow"),
        React.createElement(
          "span",
          {
            style: {
              fontSize: 14,
              color: "var(--ant-color-text-tertiary, #8c8c8c)",
              marginLeft: 8,
            },
          },
          t("可视化 DAG 工作流引擎", "Visual DAG workflow engine"),
        ),
      ),
      React.createElement(
        Space,
        null,
        React.createElement(
          Button,
          { onClick: onHistory },
          t("运行记录", "Run history"),
        ),
        React.createElement(Input.Search, {
          placeholder: t("搜索工作流", "Search workflows"),
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
          t("新建工作流", "New workflow"),
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
          description: t(
            "暂无工作流，点击「新建工作流」创建",
            "No workflows yet. Create a new workflow to begin.",
          ),
        }),
      },
    }),
    React.createElement(
      Modal,
      {
        title: t("新建工作流", "New workflow"),
        open: newModalOpen,
        onOk: createFlow,
        onCancel: () => {
          setNewModalOpen(false);
          setNewName("");
        },
        okText: t("创建", "Create"),
        cancelText: t("取消", "Cancel"),
        okButtonProps: { disabled: !newName.trim() },
      },
      React.createElement(Input, {
        placeholder: t("输入工作流名称（如：库存日评估）", "Workflow name"),
        value: newName,
        onChange: (e: any) => setNewName(e.target.value),
        onPressEnter: createFlow,
      }),
    ),
  );
}

// ─── Flow Editor Page ───────────────────────────────────────────────────────

interface EditorProps {
  repairRequest?: RepairRequest | null;
  onRepairConsumed?: (key: string) => void;
  debugRecord?: RunRecord;
  onDebugRun?: (runId: string) => void;
  userId?: string;
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
  const { t, locale } = useWorkflowI18n();
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
      title: t("工作流输入/输出配置", "Workflow input/output configuration"),
      open,
      onCancel: onClose,
      width: 600,
      footer: React.createElement(
        Space,
        null,
        React.createElement(Button, { onClick: onClose }, t("取消", "Cancel")),
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
                  locale,
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
          t("确定", "Confirm"),
        ),
      ),
    },
    // Start node
    React.createElement(
      Form.Item,
      { label: t("起始节点", "Start node") },
      React.createElement(Select, {
        value: startId,
        onChange: (v: any) => setStartId(v || null),
        options: nodeIds.map((id) => ({ label: id, value: id })),
        allowClear: true,
        placeholder: t(
          "自动选择起始节点",
          "Choose the start node automatically",
        ),
      }),
    ),
    React.createElement(
      AntTitle,
      { level: 5 },
      t("工作流输入参数", "Workflow inputs"),
    ),
    inputs.length === 0
      ? React.createElement(
          AntText,
          { type: "secondary" },
          t("无输入参数定义", "No input parameters"),
        )
      : null,
    inputs.map((inp, idx) =>
      React.createElement(
        Space,
        { key: idx, style: { marginBottom: 8 } },
        React.createElement(Input, {
          placeholder: t("名称", "Name"),
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
          placeholder: t("默认值", "Default value"),
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
          t("必填", "Required"),
        ),
        React.createElement(
          Button,
          {
            danger: true,
            size: "small",
            onClick: () => setInputs(inputs.filter((_, i) => i !== idx)),
          },
          t("删除", "Delete"),
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
      t("+ 添加输入", "+ Add input"),
    ),
    React.createElement(
      AntTitle,
      { level: 5, style: { marginTop: 16 } },
      t("工作流输出", "Workflow outputs"),
    ),
    React.createElement(Select, {
      mode: "multiple",
      value: Array.isArray(outputs) ? outputs : [],
      onChange: (v: any) => setOutputs(v),
      options: nodeIds.map((id) => ({ label: id, value: id })),
      placeholder: t("选择输出节点ID", "Select output node IDs"),
      style: { width: "100%" },
    }),
  );
}

// ─── Top-level App ──────────────────────────────────────────────────────────

function FlowForgeApp() {
  const { t } = useWorkflowI18n();
  const host = getHost();
  const location = host.useLocation?.();
  const selectedAgent = host.useSelectedAgent?.();
  const agentId = selectedAgent?.id || host.getSelectedAgentId?.() || "default";
  const { identity, error: identityError } = useWorkflowIdentity(apiFetch);
  const [debugRecord, setDebugRecord] = useState<RunRecord | undefined>();
  const [repairRequest, setRepairRequest] = useState<RepairRequest | null>(
    null,
  );
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
  const selectRun = useCallback((nextRunId: string | null) => {
    setRunId(nextRunId);
    const url = new URL(window.location.href);
    if (nextRunId) url.searchParams.set("run", nextRunId);
    else url.searchParams.delete("run");
    window.history.replaceState(
      { ...window.history.state },
      "",
      url.pathname + url.search + url.hash,
    );
  }, []);
  const inputRequest = useRef(0);
  const activePage = useRef({ flowId, route });
  if (
    activePage.current.flowId !== flowId ||
    activePage.current.route !== route
  )
    activePage.current = { flowId, route };
  useEffect(() => {
    ++inputRequest.current;
    setPendingRun(null);
  }, [flowId, route, agentId, identity]);
  const requestScope = useRef({ agentId, identity });
  if (
    requestScope.current.agentId !== agentId ||
    requestScope.current.identity !== identity
  )
    requestScope.current = { agentId, identity };
  const renderScope = requestScope.current;
  const previousScope = useRef({ agentId, identity });
  useEffect(() => {
    const previous = previousScope.current;
    if (
      previous.agentId !== agentId ||
      (previous.identity !== undefined && previous.identity !== identity)
    ) {
      selectRun(null);
      setRunStatuses({});
      setDebugRecord(undefined);
      setRepairRequest(null);
      setHistoryOpen(false);
      setPendingRun(null);
    }
    previousScope.current = { agentId, identity };
  }, [agentId, identity, selectRun]);

  useEffect(() => {
    const syncRoute = () => {
      if (!/\/flowforge\/?$/i.test(window.location.pathname)) return;
      const params = new URLSearchParams(window.location.search);
      const selected = params.get("flow");
      setRunId(params.get("run"));
      setRepairRequest((source) =>
        source?.flowId === selected && source.runId === params.get("run")
          ? source
          : null,
      );
      setFlowId(selected);
      setRoute(selected ? "editor" : "list");
      setRunStatuses({});
      setDebugRecord(undefined);
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    if (!location || !/\/flowforge\/?$/i.test(location.pathname)) return;
    const params = new URLSearchParams(location.search);
    const selected = params.get("flow");
    setRunId(params.get("run"));
    setRepairRequest((source) =>
      source?.flowId === selected && source.runId === params.get("run")
        ? source
        : null,
    );
    setFlowId(selected);
    setRoute(selected ? "editor" : "list");
    setRunStatuses({});
    setDebugRecord(undefined);
  }, [location?.pathname, location?.search]);

  const editFlow = useCallback((id: string) => {
    setRepairRequest(null);
    ++inputRequest.current;
    setPendingRun(null);
    setFlowId(id);
    setRunStatuses({});
    setDebugRecord(undefined);
    setRoute("editor");
    window.history.replaceState(
      { ...window.history.state },
      "",
      `${window.location.pathname}?flow=${encodeURIComponent(id)}`,
    );
  }, []);
  const backToList = useCallback(() => {
    setRepairRequest(null);
    ++inputRequest.current;
    setPendingRun(null);
    setRoute("list");
    setFlowId(null);
    setRunStatuses({});
    setDebugRecord(undefined);
    window.history.replaceState(
      { ...window.history.state },
      "",
      window.location.pathname,
    );
  }, []);
  const runFlow = async (id: string) => {
    const visit = renderScope;
    const page = activePage.current;
    const request = ++inputRequest.current;
    const current = () =>
      requestScope.current === visit &&
      activePage.current === page &&
      inputRequest.current === request;
    try {
      const flow = await apiFetch<FlowDocument>(
        `/flowforge/flows/${encodeURIComponent(id)}`,
        { headers: { "X-Agent-Id": agentId } },
      );
      if (current()) setPendingRun(flow);
    } catch (error: any) {
      if (current())
        getHost().antd.message.error(
          `${t("读取运行参数失败", "Cannot load run inputs")}：${
            error.message
          }`,
        );
    }
  };
  const startRun = useCallback(
    async (inputs: Record<string, any>) => {
      if (!pendingRun) return;
      const visit = renderScope;
      const page = activePage.current;
      const result = await apiFetch<{ run_id: string }>(
        `/flowforge/flows/${encodeURIComponent(pendingRun.id)}/run`,
        {
          method: "POST",
          headers: { "X-Agent-Id": agentId },
          body: JSON.stringify({ inputs }),
        },
      );
      if (requestScope.current !== visit || activePage.current !== page) return;
      setRunStatuses({});
      selectRun(result.run_id);
      setPendingRun(null);
    },
    [pendingRun, renderScope, agentId, selectRun],
  );
  const handleStatusUpdate = useCallback(
    (statuses: Record<string, string>, runFlowId: string) => {
      setRunStatuses(flowId === runFlowId ? statuses : {});
    },
    [flowId],
  );

  const handleCloseRun = useCallback(() => {
    selectRun(null);
    setRunStatuses({});
  }, [selectRun]);

  const repairRunNode = (source: RepairSource) => {
    const page = activePage.current;
    const open = () => {
      if (
        requestScope.current !== renderScope ||
        activePage.current !== page ||
        identity === undefined
      )
        return;
      if (route !== "editor" || flowId !== source.flowId)
        editFlow(source.flowId);
      selectRun(source.runId);
      setRepairRequest({
        ...source,
        key: crypto.randomUUID(),
        agentId,
        userId: identity,
      });
    };
    if (route === "editor" && flowId !== source.flowId) {
      const url = `${window.location.pathname}?flow=${encodeURIComponent(
        source.flowId,
      )}&run=${encodeURIComponent(source.runId)}`;
      const navigating = new CustomEvent("qwenpaw:before-navigate", {
        cancelable: true,
        detail: { to: url, method: "replace", retry: open },
      });
      if (window.dispatchEvent(navigating)) open();
    } else open();
  };

  if (identityError)
    return React.createElement(host.antd.Alert, {
      type: "error",
      showIcon: true,
      message: t("无法读取账户身份", "Cannot load account identity"),
      description: identityError,
      action: React.createElement(
        host.antd.Button,
        {
          onClick: () =>
            window.dispatchEvent(new Event("qwenpaw:auth-changed")),
        },
        t("重试", "Retry"),
      ),
    });
  if (identity === undefined)
    return React.createElement(host.antd.Spin, {
      "aria-label": t("加载工作流", "Loading workflow"),
    });
  return React.createElement(
    "div",
    { className: "ff-app-shell" },
    React.createElement(
      "div",
      { className: "ff-app-page" },
      route === "editor" && flowId
        ? React.createElement(FlowEditorPage, {
            flowId,
            onBack: backToList,
            onRun: runFlow,
            onHistory: () => setHistoryOpen(true),
            runStatuses,
            debugRecord,
            repairRequest,
            onRepairConsumed: (key: string) =>
              setRepairRequest((source) =>
                source?.key === key ? null : source,
              ),
            onDebugRun: selectRun,
            userId: identity,
          })
        : React.createElement(FlowListPage, {
            onEdit: editFlow,
            onRun: runFlow,
            onHistory: () => setHistoryOpen(true),
          }),
    ),
    React.createElement(RunMonitor, {
      runId,
      key: `${identity}:${agentId}`,
      agentId,
      docked: route === "editor",
      onRecord: setDebugRecord,
      onRepair: repairRunNode,
      onClose: handleCloseRun,
      onStatusUpdate: handleStatusUpdate,
      onResumed: selectRun,
      antd: getHost().antd,
      api: apiFetch,
      streamUrl: apiUrl,
      headers: authHeaders,
    }),
    React.createElement(RunInputDialog, {
      key: JSON.stringify([identity, agentId, route, flowId, pendingRun?.id]),
      flow: pendingRun,
      onClose: () => setPendingRun(null),
      onRun: startRun,
      antd: getHost().antd,
      TypedInput,
    }),
    React.createElement(RunHistory, {
      open: historyOpen,
      agentId,
      flowId,
      onClose: () => setHistoryOpen(false),
      onSelect: (id: string) => {
        setHistoryOpen(false);
        selectRun(id);
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
    meta: {
      domain: "workspace",
      title: (locale: string) =>
        translateWorkflow("工作流", locale, "Workflow"),
      scope: "agent",
      layout: "workbench",
      navigation: "rail",
    },
  });

  // The host owns the standalone Workflows rail entry and its availability.
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
