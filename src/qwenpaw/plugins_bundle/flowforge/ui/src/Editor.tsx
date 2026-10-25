import { NodeIcon } from "./NodeIcon";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import {
  canvasFromDocument,
  controlEdges,
  documentFromCanvas,
  fingerprint,
  isControlHandle,
  isTypingTarget,
  localizedSpec,
  type Api,
  type FlowDocument,
  type NodeTypeSpec,
} from "./model";

type Validation = { ok: boolean; errors: any[] };
type Proposal = {
  proposal_id: string;
  flow: FlowDocument;
  base_revision: number;
  validation: Validation;
  warnings?: string[];
  expires_at?: number;
  changes: {
    kind: string;
    node_id?: string;
    description: string;
    details?: { path: string; before: any; after: any }[];
  }[];
};
export function WorkflowEditor({
  flowId,
  onBack,
  onRun,
  onHistory,
  runStatuses,
  agentId,
  antd,
  api,
  nodeTypes,
  edgeTypes,
  Inspector,
  IoConfig,
}: {
  flowId: string;
  onBack: () => void;
  onRun: (id: string) => void;
  onHistory: () => void;
  runStatuses: Record<string, string>;
  agentId: string;
  antd: any;
  api: Api;
  nodeTypes: any;
  edgeTypes: any;
  Inspector: any;
  IoConfig: any;
}) {
  const {
    Button,
    Input,
    Tag,
    Alert,
    Drawer,
    Modal,
    Spin,
    Empty,
    Space,
    Tabs,
    Dropdown,
    message,
  } = antd;
  const [doc, setDoc] = useState<FlowDocument | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [specs, setSpecs] = useState<NodeTypeSpec[]>([]);
  const [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState("");
  const [refreshing, setRefreshing] = useState(false),
    [catalogueError, setCatalogueError] = useState("");
  const catalogueRequest = useRef(0),
    specsRef = useRef<NodeTypeSpec[]>([]);
  const [search, setSearch] = useState(""),
    [selectedId, setSelectedId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(() => window.innerWidth > 720);
  const [saving, setSaving] = useState(false),
    [validating, setValidating] = useState(false);
  const [savedKey, setSavedKey] = useState(""),
    [validation, setValidation] = useState<Validation | null>(null);
  const [ioOpen, setIoOpen] = useState(false),
    [aiOpen, setAiOpen] = useState(false);
  const [prompt, setPrompt] = useState(""),
    [proposal, setProposal] = useState<Proposal | null>(null);
  const [aiBusy, setAiBusy] = useState(false),
    [aiError, setAiError] = useState("");
  const proposalBase = useRef(""),
    proposalAgent = useRef("");
  const [versionsOpen, setVersionsOpen] = useState(false),
    [versions, setVersions] = useState<any[]>([]),
    [versionBusy, setVersionBusy] = useState(false);
  const [canvas, setCanvas] = useState<any>(null);
  const history = useRef<{
    past: FlowDocument[];
    current: FlowDocument | null;
    future: FlowDocument[];
  }>({ past: [], current: null, future: [] });
  const skipHistory = useRef(false),
    [, tickHistory] = useState(0);
  const schemaNodes = useMemo(
    () =>
      nodes.map((node) => {
        const spec = specs.find(
          (entry) => entry.class_type === node.data.class_type,
        );
        return {
          ...node,
          data: {
            ...node.data,
            inputs_schema: spec?.inputs_schema || node.data.inputs_schema || [],
            outputs_schema:
              spec?.outputs_schema || node.data.outputs_schema || [],
          },
        };
      }),
    [nodes, specs],
  );
  const current = useMemo(
    () => (doc ? documentFromCanvas(doc, schemaNodes, edges) : null),
    [doc, schemaNodes, edges],
  );
  const currentKey = current ? fingerprint(current) : "",
    dirty = !!doc && currentKey !== savedKey;
  const currentRef = useRef(current);
  currentRef.current = current;
  const selectedRaw = nodes.find((node) => node.id === selectedId);
  const selected =
    selectedRaw && current
      ? {
          ...selectedRaw,
          data: { ...selectedRaw.data, ...current.nodes[selectedRaw.id] },
        }
      : null;
  const install = useCallback(
    (flow: FlowDocument, saved = false, reset = false) => {
      const graph = canvasFromDocument(flow, specsRef.current),
        normalized = documentFromCanvas(flow, graph.nodes, graph.edges);
      setDoc(flow);
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setSelectedId(null);
      setValidation(null);
      if (saved) setSavedKey(fingerprint(normalized));
      if (reset) {
        history.current = { past: [], current: normalized, future: [] };
        skipHistory.current = true;
        tickHistory((value) => value + 1);
      }
      setTimeout(() => canvas?.fitView({ padding: 0.18, duration: 200 }), 30);
    },
    [canvas, setNodes, setEdges],
  );

  // Preserve the fork's selected-expert catalogue, refresh API and stale-response guard.
  const refreshCatalogue = useCallback(
    async (manual = false) => {
      const request = ++catalogueRequest.current;
      setRefreshing(true);
      try {
        const types = await api<NodeTypeSpec[]>(
          manual ? "/flowforge/node-types/refresh" : "/flowforge/node-types",
          {
            method: manual ? "POST" : "GET",
            headers: { "X-Agent-Id": agentId },
          },
        );
        if (request === catalogueRequest.current) {
          const localized = (types || []).map(localizedSpec);
          specsRef.current = localized;
          setSpecs(localized);
          setCatalogueError("");
        }
      } catch (error: any) {
        if (request === catalogueRequest.current) {
          specsRef.current = [];
          setSpecs([]);
          setCatalogueError("节点目录暂时不可用，请重试刷新");
          if (manual) message.error(`刷新节点失败：${error.message}`);
        }
      } finally {
        if (request === catalogueRequest.current) setRefreshing(false);
      }
    },
    [agentId],
  );
  useEffect(() => {
    specsRef.current = [];
    setSpecs([]);
    void refreshCatalogue();
    const refresh = () => {
        void refreshCatalogue();
      },
      timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      ++catalogueRequest.current;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [refreshCatalogue]);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError("");
    api<FlowDocument>(`/flowforge/flows/${encodeURIComponent(flowId)}`)
      .then((flow) => {
        if (alive) install(flow, true, true);
      })
      .catch((error) => {
        if (alive) setLoadError(error.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [flowId]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)"),
      adapt = () => setPaletteOpen(!media.matches);
    media.addEventListener("change", adapt);
    return () => media.removeEventListener("change", adapt);
  }, []);
  useEffect(() => {
    if (!current) return;
    if (skipHistory.current) {
      skipHistory.current = false;
      return;
    }
    setValidation(null);
    const timer = setTimeout(() => {
      const h = history.current;
      if (h.current && fingerprint(h.current) !== currentKey) {
        h.past = [...h.past.slice(-59), h.current];
        h.current = current;
        h.future = [];
        tickHistory((value) => value + 1);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [currentKey]);
  const travel = useCallback(
    (redo = false) => {
      if (!current) return;
      const h = history.current;
      let target: FlowDocument | undefined;
      if (!redo && h.current && fingerprint(h.current) !== currentKey) {
        target = h.current;
        h.future.unshift(current);
      } else if (redo) {
        target = h.future.shift();
        if (target) h.past.push(current);
      } else {
        target = h.past.pop();
        if (target) h.future.unshift(current);
      }
      if (!target) return;
      h.current = { ...target, revision: doc?.revision };
      skipHistory.current = true;
      install(h.current);
      tickHistory((value) => value + 1);
    },
    [current, currentKey, doc?.revision, install],
  );
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const validate = async () => {
    if (!current) return false;
    setValidating(true);
    try {
      const result = await api<Validation>("/flowforge/flows/validate", {
        method: "POST",
        body: JSON.stringify(current),
      });
      setValidation(result);
      return result.ok;
    } catch (error: any) {
      message.error(`验证失败：${error.message}`);
      return false;
    } finally {
      setValidating(false);
    }
  };
  const save = async (): Promise<boolean> => {
    if (!current || saving) return false;
    setSaving(true);
    try {
      const result = await api<FlowDocument>(
        `/flowforge/flows/${encodeURIComponent(flowId)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            ...current,
            expected_revision: doc?.revision ?? 0,
          }),
        },
      );
      setDoc((previous) =>
        previous ? { ...previous, revision: result.revision } : result,
      );
      setSavedKey(currentKey);
      message.success("工作流已保存");
      return true;
    } catch (error: any) {
      message.error(`保存失败，草稿已保留：${error.message}`);
      return false;
    } finally {
      setSaving(false);
    }
  };
  const removeNodes = (ids: string[]) => {
    setNodes((list) => list.filter((node) => !ids.includes(node.id)));
    setEdges((list) =>
      list.filter(
        (edge) => !ids.includes(edge.source) && !ids.includes(edge.target),
      ),
    );
    setSelectedId(null);
    setDoc((previous) =>
      previous
        ? {
            ...previous,
            start_id: ids.includes(previous.start_id || "")
              ? null
              : previous.start_id,
            outputs: Array.isArray(previous.outputs)
              ? previous.outputs.filter((id) => !ids.includes(id))
              : previous.outputs,
          }
        : previous,
    );
  };
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || aiOpen || ioOpen || versionsOpen)
        return;
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "s") {
        event.preventDefault();
        void save();
      }
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        travel(event.shiftKey);
      }
      if ((event.metaKey || event.ctrlKey) && key === "y") {
        event.preventDefault();
        travel(true);
      }
      if (["Delete", "Backspace"].includes(event.key)) {
        const ids = nodes
          .filter((node) => node.selected)
          .map((node) => node.id);
        if (ids.length || edges.some((edge) => edge.selected)) {
          event.preventDefault();
          removeNodes(ids);
          setEdges((list) => list.filter((edge) => !edge.selected));
        }
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [currentKey, saving, nodes, edges, aiOpen, ioOpen, versionsOpen, travel]);
  useEffect(() => {
    const remove = (event: any) =>
      setEdges((list) => list.filter((edge) => edge.id !== event.detail?.id));
    const label = (event: any) =>
      setEdges((list) =>
        list.map((edge) =>
          edge.id === event.detail?.id
            ? { ...edge, data: { ...edge.data, label: event.detail.label } }
            : edge,
        ),
      );
    window.addEventListener("flowforge:edge-delete", remove);
    window.addEventListener("flowforge:edge-label", label);
    return () => {
      window.removeEventListener("flowforge:edge-delete", remove);
      window.removeEventListener("flowforge:edge-label", label);
    };
  }, []);
  const addNode = (spec: NodeTypeSpec) => {
    const id = `${spec.class_type.toLowerCase()}_${crypto
      .randomUUID()
      .slice(0, 8)}`;
    const inputs = Object.fromEntries(
      (spec.inputs_schema || [])
        .filter((field) => field.default !== undefined)
        .map((field) => [field.name, field.default]),
    );
    setNodes((list) =>
      list.concat({
        id,
        type: "workflow",
        position: canvas?.screenToFlowPosition({
          x: window.innerWidth * 0.55,
          y: window.innerHeight * 0.4,
        }) || { x: 200, y: 160 },
        data: {
          class_type: spec.class_type,
          label: spec.display_name,
          inputs,
          control: {},
          inputs_schema: spec.inputs_schema,
          outputs_schema: spec.outputs_schema,
        },
      }),
    );
    setSelectedId(id);
  };
  const arrange = (mode: string) => {
    const selected = nodes.filter((node) => node.selected);
    if (mode === "auto") {
      const levels = new Map<string, number>(),
        remaining = new Set(nodes.map((node) => node.id));
      for (let i = 0; i < nodes.length; i++) {
        let changed = false;
        for (const id of [...remaining]) {
          const parents = edges
            .filter(
              (edge) =>
                edge.target === id && edge.sourceHandle !== "retry_node",
            )
            .map((edge) => edge.source);
          if (parents.every((parent) => levels.has(parent))) {
            levels.set(
              id,
              parents.length
                ? Math.max(...parents.map((parent) => levels.get(parent)!)) + 1
                : 0,
            );
            remaining.delete(id);
            changed = true;
          }
        }
        if (!changed) break;
      }
      const rows = new Map<number, number>();
      setNodes((list) =>
        list.map((node) => {
          const level = levels.get(node.id) ?? 0,
            row = rows.get(level) || 0;
          rows.set(level, row + 1);
          return {
            ...node,
            position: { x: 60 + level * 340, y: 60 + row * 260 },
          };
        }),
      );
      setTimeout(() => canvas?.fitView({ padding: 0.15 }), 30);
      return;
    }
    const distribution = mode.startsWith("distribute");
    if (selected.length < (distribution ? 3 : 2)) {
      message.info(`请先选中至少 ${distribution ? 3 : 2} 个节点`);
      return;
    }
    const axis = ["left", "right", "distribute-h"].includes(mode) ? "x" : "y",
      ordered = [...selected].sort(
        (a, b) => a.position[axis] - b.position[axis],
      );
    const minimum = ordered[0].position[axis],
      maximum = ordered[ordered.length - 1].position[axis];
    setNodes((list) =>
      list.map((node) => {
        const index = ordered.findIndex((entry) => entry.id === node.id);
        return index < 0
          ? node
          : {
              ...node,
              position: {
                ...node.position,
                [axis]: distribution
                  ? minimum +
                    (index * (maximum - minimum)) / (ordered.length - 1)
                  : ["right", "bottom"].includes(mode)
                  ? maximum
                  : minimum,
              },
            };
      }),
    );
  };
  const propose = async () => {
    if (!current || !prompt.trim()) return;
    setAiBusy(true);
    setAiError("");
    setProposal(null);
    proposalBase.current = currentKey;
    proposalAgent.current = agentId;
    try {
      setProposal(
        await api<Proposal>("/flowforge/authoring/proposals", {
          method: "POST",
          headers: { "X-Agent-Id": agentId },
          body: JSON.stringify({
            prompt: prompt.trim(),
            flow: current,
            agent_id: agentId,
          }),
        }),
      );
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setAiBusy(false);
    }
  };
  const applyProposal = async () => {
    if (
      !proposal ||
      currentKey !== proposalBase.current ||
      proposalAgent.current !== agentId
    ) {
      setAiError("草稿或当前专家已变化，请重新生成方案。");
      return;
    }
    setAiBusy(true);
    setAiError("");
    try {
      const applied = await api<FlowDocument>(
        `/flowforge/authoring/proposals/${encodeURIComponent(
          proposal.proposal_id,
        )}/apply`,
        {
          method: "POST",
          body: JSON.stringify({ expected_revision: proposal.base_revision }),
        },
      );
      if (current)
        history.current = {
          past: [...history.current.past, current].slice(-60),
          current: documentFromCanvas(
            applied,
            canvasFromDocument(applied, specsRef.current).nodes,
            canvasFromDocument(applied, specsRef.current).edges,
          ),
          future: [],
        };
      skipHistory.current = true;
      install(applied, true);
      tickHistory((value) => value + 1);
      setAiOpen(false);
      setProposal(null);
      setPrompt("");
      message.success("方案已应用并保存，可撤销为草稿");
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setAiBusy(false);
    }
  };
  const showVersions = async () => {
    setVersionsOpen(true);
    setVersionBusy(true);
    try {
      setVersions(
        await api<any[]>(
          `/flowforge/flows/${encodeURIComponent(flowId)}/versions`,
        ),
      );
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setVersionBusy(false);
    }
  };
  const back = () =>
    dirty
      ? Modal.confirm({
          title: "离开前保存修改？",
          content: "当前有未保存的草稿。",
          okText: "保存并返回",
          cancelText: "继续编辑",
          onOk: async () => {
            if (await save()) onBack();
            else throw new Error("保存未完成");
          },
          footer: (_: any, { OkBtn, CancelBtn }: any) => (
            <Space>
              <Button
                danger
                onClick={() => {
                  Modal.destroyAll();
                  onBack();
                }}
              >
                放弃修改
              </Button>
              <CancelBtn />
              <OkBtn />
            </Space>
          ),
        })
      : onBack();
  const grouped = useMemo(
    () =>
      specs
        .filter((spec) => spec.available !== false)
        .filter((spec) =>
          `${spec.display_name} ${spec.class_type} ${spec.description}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .reduce(
          (groups, spec) => {
            (groups[spec.category || "其他"] ||= []).push(spec);
            return groups;
          },
          {} as Record<string, NodeTypeSpec[]>,
        ),
    [specs, search],
  );
  const canUndo =
    history.current.past.length > 0 ||
    (!!history.current.current &&
      fingerprint(history.current.current) !== currentKey);
  const canvasNodes = useMemo(
    () =>
      nodes.map((node) => {
        const spec = specs.find(
          (entry) => entry.class_type === node.data.class_type,
        );
        return {
          ...node,
          data: {
            ...node.data,
            _displayLabel: spec?.display_name || node.data.class_type,
            icon: spec?.icon,
            description: spec?.description,
            inputs_schema: spec?.inputs_schema || [],
            outputs_schema: spec?.outputs_schema || [],
            _unavailableReason:
              spec?.available === false ? spec.unavailable_reason : undefined,
            _status: runStatuses[node.id] || "pending",
            _controlHandles: edges
              .filter(
                (edge) =>
                  edge.source === node.id && edge.data?.kind === "control",
              )
              .map((edge) => edge.sourceHandle || "next"),
            _targetHandles: edges
              .filter((edge) => edge.target === node.id)
              .map((edge) => edge.targetHandle)
              .filter(Boolean),
          },
        };
      }),
    [nodes, specs, edges, runStatuses],
  );

  if (loading)
    return (
      <div className="ff-center">
        <Spin size="large" />
      </div>
    );
  if (!doc || loadError)
    return (
      <div className="ff-center">
        <Alert
          showIcon
          type="error"
          message="工作流加载失败"
          description={loadError}
          action={<Button onClick={onBack}>返回列表</Button>}
        />
      </div>
    );
  return (
    <div className="ff-editor" data-flowforge-editor="true">
      <header className="ff-toolbar">
        <Button onClick={back}>← 返回</Button>
        <div className="ff-title">
          <strong>{doc.name || flowId}</strong>
          <span>
            {nodes.length} 个节点 · {edges.length} 条连线 · v{doc.revision ?? 0}
          </span>
        </div>
        <Tag color={dirty ? "orange" : "green"}>
          {dirty ? "有未保存修改" : "已保存"}
        </Tag>
        <div className="ff-toolbar-actions">
          <Button
            onClick={() => setPaletteOpen((open) => !open)}
            aria-pressed={paletteOpen}
          >
            节点库
          </Button>
          <Button className="ff-mobile-ai" onClick={() => setAiOpen(true)}>
            ✦ AI 搭建
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: "auto", label: "自动布局" },
                { key: "left", label: "左对齐" },
                { key: "right", label: "右对齐" },
                { key: "top", label: "顶部对齐" },
                { key: "bottom", label: "底部对齐" },
                { key: "distribute-h", label: "水平分布" },
                { key: "distribute-v", label: "垂直分布" },
              ],
              onClick: ({ key }: any) => arrange(key),
            }}
          >
            <Button>排版</Button>
          </Dropdown>
          <Button
            disabled={!canUndo}
            onClick={() => travel()}
            title="Ctrl / ⌘ Z"
          >
            撤销
          </Button>
          <Button
            disabled={!history.current.future.length}
            onClick={() => travel(true)}
          >
            重做
          </Button>
          <Button onClick={showVersions}>版本</Button>
          <Button onClick={onHistory}>运行记录</Button>
          <Button onClick={() => setIoOpen(true)}>输入 / 输出</Button>
          <Button
            aria-label="验证"
            loading={validating}
            onClick={() => void validate()}
          >
            验证
          </Button>
          <Button
            aria-label="保存"
            loading={saving}
            onClick={() => void save()}
          >
            保存
          </Button>
          <Button
            type="primary"
            aria-label="试运行"
            disabled={saving || validating}
            onClick={async () => {
              if ((await validate()) && (!dirty || (await save())))
                onRun(flowId);
            }}
          >
            试运行
          </Button>
        </div>
      </header>
      {validation && (
        <Alert
          closable
          showIcon
          onClose={() => setValidation(null)}
          type={validation.ok ? "success" : "error"}
          message={
            validation.ok
              ? "工作流结构验证通过"
              : `发现 ${validation.errors.length} 个问题，请修正后运行`
          }
          description={
            !validation.ok && (
              <ul className="ff-errors">
                {validation.errors.map((error, index) => (
                  <li key={index}>
                    {typeof error === "string" ? error : JSON.stringify(error)}
                  </li>
                ))}
              </ul>
            )
          }
        />
      )}
      <div className="ff-editor-body">
        <aside
          className={`ff-palette ${
            paletteOpen ? "ff-palette-open" : "ff-palette-closed"
          }`}
        >
          <Button
            type="primary"
            block
            onClick={() => {
              setAiOpen(true);
              setAiError("");
            }}
          >
            ✦ 用自然语言{nodes.length ? "修改" : "搭建"}
          </Button>
          <p className="ff-muted">描述目标、条件和异常处理，预览后应用。</p>
          <Input
            value={search}
            aria-label="搜索节点"
            placeholder="搜索节点或能力"
            allowClear
            onChange={(event: any) => setSearch(event.target.value)}
          />
          <Button
            size="small"
            aria-label="刷新节点"
            loading={refreshing}
            onClick={() => void refreshCatalogue(true)}
            style={{ marginTop: 8 }}
          >
            刷新节点
          </Button>
          {catalogueError && (
            <Alert
              type="warning"
              message={catalogueError}
              className="ff-spaced"
            />
          )}
          <div className="ff-node-list">
            {Object.keys(grouped).length ? (
              Object.entries(grouped).map(([category, entries]) => (
                <section key={category}>
                  <h4>{category}</h4>
                  {entries.map((spec) => (
                    <button
                      className="ff-palette-item"
                      key={spec.class_type}
                      title={spec.description}
                      onClick={() => addNode(spec)}
                    >
                      <NodeIcon classType={spec.class_type} icon={spec.icon} />
                      <span>
                        {spec.display_name}
                        <small>{spec.description}</small>
                      </span>
                      <span>＋</span>
                    </button>
                  ))}
                </section>
              ))
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={refreshing ? "正在加载节点目录…" : "没有匹配节点"}
              />
            )}
          </div>
        </aside>
        <main className="ff-canvas">
          <ReactFlow
            nodes={canvasNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={setCanvas}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onConnect={(connection: Connection) =>
              setEdges((list) =>
                addEdge(
                  {
                    ...connection,
                    type: "labeled",
                    data: {
                      kind: isControlHandle(connection.sourceHandle)
                        ? "control"
                        : "data",
                    },
                  },
                  list,
                ),
              )
            }
            isValidConnection={(connection) =>
              connection.source !== connection.target &&
              !edges.some(
                (edge) =>
                  edge.source === connection.source &&
                  edge.target === connection.target &&
                  edge.sourceHandle === connection.sourceHandle &&
                  edge.targetHandle === connection.targetHandle,
              )
            }
            deleteKeyCode={null}
            fitView
            minZoom={0.15}
            maxZoom={2}
          >
            <Background gap={20} />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
          {!nodes.length && (
            <div className="ff-empty-canvas">
              <span>✦</span>
              <h2>从业务目标开始</h2>
              <p>描述工作流，或从节点库添加步骤。</p>
              <Button type="primary" onClick={() => setAiOpen(true)}>
                描述我的工作流
              </Button>
            </div>
          )}
          <div className="ff-canvas-help">
            拖动节点编排 · 连线传递数据 · Shift 多选 · Ctrl / ⌘ Z 撤销
          </div>
        </main>
      </div>
      <Drawer
        title="节点属性"
        open={!!selected}
        onClose={() => setSelectedId(null)}
        width={420}
        extra={
          selected && (
            <Space>
              <Button
                size="small"
                onClick={() => {
                  const copy = JSON.parse(JSON.stringify(selected));
                  copy.id = `${selected.id}_copy_${crypto
                    .randomUUID()
                    .slice(0, 6)}`;
                  copy.position = {
                    x: selected.position.x + 50,
                    y: selected.position.y + 60,
                  };
                  copy.selected = false;
                  setNodes((list) => list.concat(copy));
                }}
              >
                复制
              </Button>
              <Button
                danger
                size="small"
                onClick={() =>
                  Modal.confirm({
                    title: "删除节点及关联连线？",
                    okText: "删除",
                    cancelText: "取消",
                    onOk: () => removeNodes([selected.id]),
                  })
                }
              >
                删除
              </Button>
            </Space>
          )
        }
      >
        {selected && (
          <Inspector
            node={selected}
            nodeTypes={specs}
            availableNodes={nodes}
            onUpdate={(updated: Node) => {
              const spec = specs.find(
                (item) => item.class_type === updated.data.class_type,
              );
              setNodes((list) =>
                list.map((node) =>
                  node.id === updated.id
                    ? {
                        ...updated,
                        data: {
                          ...updated.data,
                          inputs_schema: spec?.inputs_schema || [],
                          outputs_schema: spec?.outputs_schema || [],
                        },
                      }
                    : node,
                ),
              );
              setEdges((list) => [
                ...list.filter(
                  (edge) =>
                    !(
                      edge.source === updated.id &&
                      edge.data?.kind === "control"
                    ),
                ),
                ...controlEdges(updated).map((generated) => {
                  const existing = list.find(
                    (edge) =>
                      edge.source === generated.source &&
                      edge.sourceHandle === generated.sourceHandle &&
                      edge.data?.kind === "control",
                  );
                  return existing
                    ? {
                        ...existing,
                        ...generated,
                        id: existing.id,
                        data: {
                          ...existing.data,
                          ...generated.data,
                          label: existing.data?.label ?? generated.data?.label,
                        },
                      }
                    : generated;
                }),
              ]);
            }}
          />
        )}
      </Drawer>
      <IoConfig
        open={ioOpen}
        doc={current}
        onClose={() => setIoOpen(false)}
        onSave={(inputs: any[], outputs: any, start_id: string | null) => {
          setDoc((previous) =>
            previous ? { ...previous, inputs, outputs, start_id } : previous,
          );
          setIoOpen(false);
        }}
      />
      <Drawer
        title={nodes.length ? "用自然语言修改工作流" : "用自然语言搭建工作流"}
        open={aiOpen}
        width={580}
        maskClosable={!aiBusy}
        closable={!aiBusy}
        onClose={() => !aiBusy && setAiOpen(false)}
        footer={
          <Space>
            <Button
              disabled={aiBusy}
              onClick={() => {
                setProposal(null);
                setAiOpen(false);
              }}
            >
              取消
            </Button>
            {proposal && (
              <Button
                aria-label="应用并保存"
                type="primary"
                loading={aiBusy}
                disabled={
                  !proposal.validation.ok ||
                  currentKey !== proposalBase.current ||
                  agentId !== proposalAgent.current
                }
                onClick={applyProposal}
              >
                应用并保存
              </Button>
            )}
          </Space>
        }
      >
        <Alert
          type="info"
          showIcon
          message="先预览，再应用"
          description="AI 根据当前专家可用能力与最新草稿生成方案。应用会创建新版本，不会自动执行工作流。"
        />
        <label className="ff-field-label" htmlFor="ff-prompt">
          业务目标与修改要求
        </label>
        <Input.TextArea
          id="ff-prompt"
          value={prompt}
          disabled={aiBusy}
          onChange={(event: any) => {
            setPrompt(event.target.value);
            setProposal(null);
          }}
          autoSize={{ minRows: 5, maxRows: 12 }}
          placeholder="例如：检查生产数据，并行计算库存和注采能力；异常转人工审核，通过后生成报告。失败重试 2 次。"
        />
        <div className="ff-example-row">
          {[
            "增加人工审核，通过后再继续",
            "失败重试 2 次，并设置超时",
            "独立分析并行执行后汇总",
          ].map((example) => (
            <Button
              size="small"
              key={example}
              disabled={aiBusy}
              onClick={() => {
                setPrompt(example);
                setProposal(null);
              }}
            >
              {example}
            </Button>
          ))}
        </div>
        <Button
          type="primary"
          aria-label={proposal ? "重新生成方案" : "生成变更预览"}
          loading={aiBusy}
          disabled={!prompt.trim()}
          onClick={propose}
        >
          {proposal ? "重新生成方案" : "生成变更预览"}
        </Button>
        {aiError && (
          <Alert
            className="ff-spaced"
            type="error"
            showIcon
            message="方案未应用"
            description={aiError}
          />
        )}
        {proposal && (
          <div className="ff-spaced">
            <Alert
              type={proposal.validation.ok ? "success" : "error"}
              showIcon
              message={
                proposal.validation.ok
                  ? "结构验证通过，请检查业务逻辑"
                  : "方案未通过验证，不能应用"
              }
              description={
                !proposal.validation.ok &&
                proposal.validation.errors
                  .map((error) =>
                    typeof error === "string" ? error : JSON.stringify(error),
                  )
                  .join("；")
              }
            />
            {(currentKey !== proposalBase.current ||
              agentId !== proposalAgent.current) && (
              <Alert
                type="warning"
                message="草稿或当前专家已变化，请重新生成方案。"
                className="ff-spaced"
              />
            )}
            {proposal.warnings?.map((warning, index) => (
              <Alert
                type="warning"
                key={index}
                message={warning}
                className="ff-spaced"
              />
            ))}
            <Tabs
              items={[
                {
                  key: "changes",
                  label: `变更明细 (${proposal.changes.length})`,
                  children: (
                    <div>
                      {proposal.changes.map((change, index) => (
                        <div className="ff-change" key={index}>
                          <Tag
                            color={
                              change.kind.includes("remove") ? "red" : "blue"
                            }
                          >
                            {change.kind}
                          </Tag>
                          <div>
                            <strong>{change.node_id || "工作流"}</strong>
                            <p>{change.description}</p>
                            {!!change.details?.length && (
                              <table className="ff-diff-table">
                                <thead>
                                  <tr>
                                    <th>参数</th>
                                    <th>修改前</th>
                                    <th>修改后</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {change.details.map((detail, i) => (
                                    <tr key={i}>
                                      <td>{detail.path}</td>
                                      <td>
                                        {typeof detail.before === "string"
                                          ? detail.before
                                          : JSON.stringify(detail.before) ??
                                            "未设置"}
                                      </td>
                                      <td>
                                        {typeof detail.after === "string"
                                          ? detail.after
                                          : JSON.stringify(detail.after) ??
                                            "未设置"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  key: "document",
                  label: "完整工作流",
                  children: (
                    <pre className="ff-code">
                      {JSON.stringify(proposal.flow, null, 2)}
                    </pre>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Drawer>
      <Drawer
        title="工作流版本"
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        width={440}
      >
        {versionBusy ? (
          <Spin />
        ) : versions.length ? (
          versions.map((version) => (
            <div key={version.revision} className="ff-version">
              <div>
                <strong>版本 {version.revision}</strong>
                <p>
                  {version.name} · {version.node_count} 个节点
                </p>
              </div>
              <Button
                disabled={version.revision === doc.revision}
                onClick={() =>
                  Modal.confirm({
                    title: `恢复到版本 ${version.revision}？`,
                    content: dirty
                      ? "当前草稿将被替换。恢复会创建新版本。"
                      : "恢复会创建新版本，历史记录仍保留。",
                    okText: "恢复版本",
                    cancelText: "取消",
                    onOk: async () => {
                      const restored = await api<FlowDocument>(
                        `/flowforge/flows/${encodeURIComponent(
                          flowId,
                        )}/versions/${version.revision}/restore`,
                        {
                          method: "POST",
                          body: JSON.stringify({
                            expected_revision: doc.revision ?? 0,
                          }),
                        },
                      );
                      install(restored, true, true);
                      setVersionsOpen(false);
                    },
                  })
                }
              >
                恢复
              </Button>
            </div>
          ))
        ) : (
          <Empty description="暂无已保存版本" />
        )}
      </Drawer>
    </div>
  );
}
