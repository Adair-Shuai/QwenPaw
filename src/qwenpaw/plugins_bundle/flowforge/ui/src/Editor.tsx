import { NodeIcon } from "./NodeIcon";
import { EditorToolbar, SelectionToolbar } from "./EditorToolbar";
import { ToolbarIcon } from "./ToolbarIcon";
import { CanvasNote, CanvasGroup } from "./CanvasNote";
import {
  canvasTools,
  duplicateSubgraph,
  type CanvasTools,
} from "./editorTools";
import { InputBindings } from "./InputBindings";
import { DebugWorkspace } from "./DebugWorkspace";
import { InspectorPanel } from "./InspectorPanel";
import { useWorkflowDraft } from "./useWorkflowDraft";
import { useWorkflowNavigationGuard } from "./useWorkflowNavigationGuard";
import { useWorkflowI18n } from "./i18n";
import type { RunRecord } from "./runRecord";
import {
  configurationDiagnostics,
  connectionIssue,
  validationDiagnostics,
  type Diagnostic,
  type ValidationResult,
} from "./graphContracts";
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

type Validation = ValidationResult;
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
  userId = "local",
  debugRecord,
  onDebugRun,
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
  userId?: string;
  debugRecord?: RunRecord;
  onDebugRun?: (runId: string) => void;
  antd: any;
  api: Api;
  nodeTypes: any;
  edgeTypes: any;
  Inspector: any;
  IoConfig: any;
}) {
  const { t, locale } = useWorkflowI18n();
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
  const editorRoot = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<Record<string, any>>
  >([]);
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
  const [debugOpen, setDebugOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [grid, setGrid] = useState(true),
    [snap, setSnap] = useState(false);
  const [focusMode, setFocusMode] = useState(false),
    [panMode, setPanMode] = useState(false);
  const [findOpen, setFindOpen] = useState(false),
    [findQuery, setFindQuery] = useState("");
  const [clipboard, setClipboard] = useState<{
    document: FlowDocument;
    ids: string[];
  } | null>(null);
  const [importOpen, setImportOpen] = useState(false),
    [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const tools = useMemo(() => canvasTools(doc), [doc]);
  const selectedIds = nodes
    .filter((node) => node.selected)
    .map((node) => node.id);
  const selectedGroup = tools.groups.find(
    (group) =>
      group.nodeIds.some((id) => selectedIds.includes(id)) &&
      selectedIds.every((id) => group.nodeIds.includes(id)),
  );
  useEffect(() => {
    setClipboard(null);
    setFindOpen(false);
    setFindQuery("");
    setLocked(false);
    setFocusMode(false);
    setImportOpen(false);
    setImportText("");
  }, [flowId, agentId, userId]);
  const [recoverOpen, setRecoverOpen] = useState(false);
  const serverFlow = useRef<FlowDocument | null>(null);
  const lastSaved = useRef<FlowDocument | null>(null);
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
  const drafts = useWorkflowDraft({ userId, agentId, flowId, current, dirty });
  const currentRef = useRef(current);
  currentRef.current = current;
  const scopeRef = useRef({ flowId, agentId, userId });
  if (
    scopeRef.current.flowId !== flowId ||
    scopeRef.current.agentId !== agentId ||
    scopeRef.current.userId !== userId
  )
    scopeRef.current = { flowId, agentId, userId };
  const renderScope = scopeRef.current;
  const validationRequest = useRef(0);
  const saveRequest = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      ++validationRequest.current;
      ++saveRequest.current;
    };
  }, []);
  useEffect(() => {
    ++validationRequest.current;
    ++saveRequest.current;
    setSaving(false);
    setValidating(false);
    setValidation(null);
  }, [flowId, agentId]);
  const [focusedField, setFocusedField] = useState<string | undefined>();
  const diagnostics = useMemo(
    () =>
      validation
        ? validationDiagnostics(validation, locale)
        : configurationDiagnostics(current, specs, locale),
    [validation, current, specs, locale],
  );
  const selectedRaw = schemaNodes.find((node) => node.id === selectedId);
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
      if (saved) {
        setSavedKey(fingerprint(normalized));
        lastSaved.current = normalized;
      }
      if (reset) {
        history.current = { past: [], current: normalized, future: [] };
        skipHistory.current = true;
        tickHistory((value) => value + 1);
      }
      setTimeout(
        () => canvas?.fitView({ padding: 0.18, maxZoom: 1, duration: 200 }),
        30,
      );
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
          const localized = (types || []).map((spec) =>
            localizedSpec(spec, locale),
          );
          specsRef.current = localized;
          setSpecs(localized);
          setCatalogueError("");
        }
      } catch (error: any) {
        if (request === catalogueRequest.current) {
          specsRef.current = [];
          setSpecs([]);
          setCatalogueError(t("节点目录暂时不可用，请重试刷新"));
          if (manual)
            message.error(
              t("刷新节点失败：{value0}", { value0: error.message }),
            );
        }
      } finally {
        if (request === catalogueRequest.current) setRefreshing(false);
      }
    },
    [agentId, locale],
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
        if (alive) {
          serverFlow.current = flow;
          drafts.prepare(flow);
          install(flow, true, true);
        }
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
  }, [flowId, agentId, userId]);
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
      drafts.persist();
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const validate = async () => {
    if (!current || !mounted.current || scopeRef.current !== renderScope)
      return false;
    const request = ++validationRequest.current;
    const scope = renderScope;
    const matches = () =>
      mounted.current &&
      request === validationRequest.current &&
      scope === scopeRef.current &&
      !!currentRef.current &&
      fingerprint(currentRef.current) === currentKey;
    setValidating(true);
    try {
      const result = await api<Validation>("/flowforge/flows/validate", {
        method: "POST",
        headers: { "X-Agent-Id": agentId },
        body: JSON.stringify(current),
      });
      if (!matches()) return false;
      setValidation(result);
      return result.ok;
    } catch (error: any) {
      if (matches())
        message.error(t("验证失败：{value0}", { value0: error.message }));
      return false;
    } finally {
      if (request === validationRequest.current) setValidating(false);
    }
  };
  const locateDiagnostic = (diagnostic: Diagnostic) => {
    const node = nodes.find((item) => item.id === diagnostic.node_id);
    const edge = edges.find((item) => item.id === diagnostic.edge_id);
    if (!node && !edge) return;
    setSelectedId(node?.id || null);
    setFocusedField(node ? diagnostic.field : undefined);
    if (edge) {
      setNodes((list) => list.map((item) => ({ ...item, selected: false })));
      setEdges((list) =>
        list.map((item) => ({ ...item, selected: item.id === edge.id })),
      );
    }
    const targets = edge
      ? nodes.filter(
          (item) => item.id === edge.source || item.id === edge.target,
        )
      : node
      ? [node]
      : [];
    if (targets.length)
      void canvas?.fitView({
        nodes: targets,
        padding: 0.6,
        maxZoom: 1,
        duration: 200,
      });
  };
  const connect = (connection: Connection) => {
    if (locked) return;
    const issue = connectionIssue(connection, schemaNodes, edges, locale);
    if (issue) {
      message.warning(issue);
      return;
    }
    setEdges((list) =>
      addEdge(
        {
          ...connection,
          type: "labeled",
          data: {
            kind: isControlHandle(connection.sourceHandle) ? "control" : "data",
          },
        },
        list,
      ),
    );
  };
  const bindInput = (field: string, source?: string, handle?: string) => {
    if (!selected || locked) return;
    const rest = edges.filter(
      (edge) =>
        !(
          edge.target === selected.id &&
          edge.targetHandle === field &&
          edge.data?.kind !== "control"
        ),
    );
    if (source && handle) {
      const connection = {
        source,
        sourceHandle: handle,
        target: selected.id,
        targetHandle: field,
      };
      const issue = connectionIssue(connection, schemaNodes, rest, locale);
      if (issue) {
        message.warning(issue);
        return;
      }
      setEdges(
        addEdge(
          { ...connection, type: "labeled", data: { kind: "data" } },
          rest,
        ),
      );
    } else setEdges(rest);
  };
  const save = async (): Promise<boolean> => {
    if (
      !current ||
      saving ||
      !mounted.current ||
      scopeRef.current !== renderScope
    )
      return false;
    const scope = renderScope,
      request = ++saveRequest.current;
    const ownsRequest = () =>
      mounted.current &&
      scopeRef.current === scope &&
      request === saveRequest.current;
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
      if (!ownsRequest()) return false;
      setDoc((previous) =>
        previous ? { ...previous, revision: result.revision } : result,
      );
      setSavedKey(currentKey);
      lastSaved.current = { ...current, revision: result.revision };
      drafts.markSaved(lastSaved.current);
      message.success(t("工作流已保存"));
      return true;
    } catch (error: any) {
      if (ownsRequest()) {
        drafts.persist();
        message.error(
          t("保存失败，草稿已保留：{value0}", { value0: error.message }),
        );
      }
      return false;
    } finally {
      if (ownsRequest()) setSaving(false);
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
  const updateTools = (change: (previous: CanvasTools) => CanvasTools) => {
    if (locked) return;
    setDoc((previous) =>
      previous
        ? {
            ...previous,
            metadata: {
              ...previous.metadata,
              canvas_tools: change(canvasTools(previous)),
            },
          }
        : previous,
    );
  };
  const cloneSelection = (source = clipboard) => {
    if (!current || !source || locked) return;
    const copied = duplicateSubgraph(source.document, source.ids);
    const next = {
      ...current,
      nodes: { ...current.nodes, ...copied.nodes },
      edges: [...current.edges, ...copied.edges],
      metadata: {
        ...current.metadata,
        positions: { ...current.metadata.positions, ...copied.positions },
      },
    };
    install(next);
    setNodes((list) =>
      list.map((node) => ({ ...node, selected: copied.ids.includes(node.id) })),
    );
  };
  const toolbarAction = (action: string) => {
    const editActions = [
      "paste",
      "duplicate",
      "group",
      "mute",
      "note",
      "delete",
      "auto",
      "left",
      "right",
      "top",
      "bottom",
      "distribute-h",
      "distribute-v",
      "undo",
      "redo",
      "import",
    ];
    if (locked && editActions.includes(action)) return;
    if (
      current &&
      editActions.includes(action) &&
      !["undo", "redo", "import"].includes(action)
    ) {
      const h = history.current;
      if (h.current && fingerprint(h.current) !== currentKey) {
        h.past = [...h.past.slice(-59), h.current];
        h.current = current;
        h.future = [];
      }
    }
    switch (action) {
      case "back":
        back();
        break;
      case "palette":
        setPaletteOpen((open) => !open);
        setFocusMode(false);
        break;
      case "ai":
        setAiOpen(true);
        break;
      case "validate":
        void validate();
        break;
      case "save":
        void save();
        break;
      case "undo":
        travel();
        break;
      case "redo":
        travel(true);
        break;
      case "history":
        onHistory();
        break;
      case "debug":
        setDebugOpen((open) => !open);
        setFocusMode(false);
        break;
      case "versions":
        void showVersions();
        break;
      case "io":
        setIoOpen(true);
        break;
      case "select-all":
        setNodes((list) => list.map((node) => ({ ...node, selected: true })));
        setSelectedId(null);
        break;
      case "clear":
        setNodes((list) => list.map((node) => ({ ...node, selected: false })));
        setEdges((list) => list.map((edge) => ({ ...edge, selected: false })));
        setSelectedId(null);
        break;
      case "copy":
        if (current && selectedIds.length) {
          setClipboard({
            document: JSON.parse(JSON.stringify(current)),
            ids: selectedIds,
          });
          message.success(t("已复制选中节点", "Selected nodes copied"));
        }
        break;
      case "paste":
        cloneSelection();
        break;
      case "duplicate":
        if (current) cloneSelection({ document: current, ids: selectedIds });
        break;
      case "delete":
        removeNodes(selectedIds);
        break;
      case "group":
        if (selectedGroup)
          updateTools((value) => ({
            ...value,
            groups: value.groups.filter(
              (group) => group.id !== selectedGroup.id,
            ),
          }));
        else if (selectedIds.length > 1)
          updateTools((value) => ({
            ...value,
            groups: [
              ...value.groups
                .map((group) => ({
                  ...group,
                  nodeIds: group.nodeIds.filter(
                    (id) => !selectedIds.includes(id),
                  ),
                }))
                .filter((group) => group.nodeIds.length > 1),
              {
                id: `group_${crypto.randomUUID()}`,
                label: t("节点分组", "Node group"),
                nodeIds: selectedIds,
              },
            ],
          }));
        break;
      case "mute": {
        const enable = nodes
          .filter((node) => selectedIds.includes(node.id))
          .every((node) => node.data.control?.mode === "mute");
        updateTools((value) => ({
          ...value,
          previousModes: {
            ...value.previousModes,
            ...Object.fromEntries(
              nodes
                .filter((node) => selectedIds.includes(node.id))
                .map((node) => [
                  node.id,
                  enable
                    ? undefined
                    : node.data.control?.mode === "mute"
                    ? value.previousModes?.[node.id] || "run"
                    : node.data.control?.mode || "run",
                ]),
            ),
          },
        }));
        setNodes((list) =>
          list.map((node) =>
            selectedIds.includes(node.id)
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    control: {
                      ...node.data.control,
                      mode: enable
                        ? tools.previousModes?.[node.id] || "run"
                        : "mute",
                    },
                  },
                }
              : node,
          ),
        );
        break;
      }
      case "note":
        updateTools((value) => ({
          ...value,
          notes: [
            ...value.notes,
            {
              id: `note_${crypto.randomUUID()}`,
              text: t("在这里记录流程说明…", "Write workflow notes here…"),
              position: canvas?.screenToFlowPosition({
                x: window.innerWidth * 0.45,
                y: window.innerHeight * 0.35,
              }) || { x: 100, y: 100 },
            },
          ],
        }));
        break;
      case "grid":
        setGrid((value) => !value);
        break;
      case "snap":
        setSnap((value) => !value);
        break;
      case "lock":
        setLocked((value) => !value);
        setSelectedId(null);
        break;
      case "focus":
        setFocusMode((value) => !value);
        setSelectedId(null);
        break;
      case "find":
        setFindOpen((value) => !value);
        break;
      case "fit":
        void canvas?.fitView({ padding: 0.18, maxZoom: 1, duration: 200 });
        break;
      case "locate":
        void canvas?.fitView({
          nodes: nodes.filter((node) => node.selected),
          padding: 0.6,
          maxZoom: 1,
          duration: 200,
        });
        break;
      case "zoom-reset":
        void canvas?.zoomTo(1, { duration: 200 });
        break;
      case "select-mode":
        setPanMode(false);
        break;
      case "pan-mode":
        setPanMode(true);
        break;
      case "import":
        setImportText("");
        setImportError("");
        setImportOpen(true);
        break;
      case "export": {
        if (!current) return;
        const url = URL.createObjectURL(
          new Blob([JSON.stringify(current, null, 2)], {
            type: "application/json",
          }),
        );
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${flowId.replace(/[^\w.-]/g, "_")}.json`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        break;
      }
      case "shortcuts":
        Modal.info({
          title: t("快捷键", "Keyboard shortcuts"),
          content: (
            <div className="ff-shortcuts">
              <p>Ctrl / ⌘ Z · {t("撤销")}</p>
              <p>Ctrl / ⌘ Shift Z · {t("重做")}</p>
              <p>
                Ctrl / ⌘ C / V / D ·{" "}
                {t("复制 / 粘贴 / 副本", "Copy / paste / duplicate")}
              </p>
              <p>
                Ctrl / ⌘ A / G / F ·{" "}
                {t("全选 / 分组 / 查找", "Select all / group / find")}
              </p>
              <p>Ctrl / ⌘ S · {t("保存")}</p>
              <p>
                Shift + {t("单击多选", "click to multiselect")} · Esc{" "}
                {t("取消选择", "clears selection")}
              </p>
            </div>
          ),
        });
        break;
      default:
        arrange(action);
    }
  };
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (
        event.target instanceof Element &&
        event.target !== document.body &&
        !editorRoot.current?.contains(event.target)
      )
        return;
      if (
        isTypingTarget(event.target) ||
        aiOpen ||
        ioOpen ||
        versionsOpen ||
        importOpen
      )
        return;
      const key = event.key.toLowerCase();
      if (
        (event.metaKey || event.ctrlKey) &&
        ["a", "c", "v", "d", "g", "f"].includes(key)
      ) {
        event.preventDefault();
        toolbarAction(
          (
            {
              a: "select-all",
              c: "copy",
              v: "paste",
              d: "duplicate",
              g: "group",
              f: "find",
            } as Record<string, string>
          )[key],
        );
        return;
      }
      if (key === "escape") {
        setFindOpen(false);
        toolbarAction("clear");
        return;
      }
      if (!event.metaKey && !event.ctrlKey && ["0", "1"].includes(key)) {
        event.preventDefault();
        toolbarAction(key === "0" ? "zoom-reset" : "fit");
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "s") {
        event.preventDefault();
        void save();
      }
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        if (!locked) travel(event.shiftKey);
      }
      if ((event.metaKey || event.ctrlKey) && key === "y") {
        event.preventDefault();
        if (!locked) travel(true);
      }
      if (!locked && ["Delete", "Backspace"].includes(event.key)) {
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
  }, [
    currentKey,
    saving,
    nodes,
    edges,
    aiOpen,
    ioOpen,
    versionsOpen,
    travel,
    locked,
    clipboard,
    tools,
    importOpen,
  ]);
  useEffect(() => {
    const remove = (event: any) => {
      if (!locked)
        setEdges((list) => list.filter((edge) => edge.id !== event.detail?.id));
    };
    const label = (event: any) =>
      !locked &&
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
  }, [locked]);
  const addNode = (spec: NodeTypeSpec) => {
    if (locked) return;
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
      setTimeout(() => canvas?.fitView({ padding: 0.15, maxZoom: 1 }), 30);
      return;
    }
    const distribution = mode.startsWith("distribute");
    if (selected.length < (distribution ? 3 : 2)) {
      message.info(
        t("请先选中至少 {value0} 个节点", { value0: distribution ? 3 : 2 }),
      );
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
      setAiError(t("草稿或当前专家已变化，请重新生成方案。"));
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
      drafts.discardOwn();
      tickHistory((value) => value + 1);
      setAiOpen(false);
      setProposal(null);
      setPrompt("");
      message.success(t("方案已应用并保存，可撤销为草稿"));
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
          title: t("离开前保存修改？"),
          content: t("当前有未保存的草稿。"),
          okText: t("保存并返回"),
          cancelText: t("继续编辑"),
          onOk: async () => {
            if (await save()) onBack();
            else throw new Error(t("保存未完成"));
          },
          footer: (_: any, { OkBtn, CancelBtn }: any) => (
            <Space>
              <Button
                danger
                onClick={() => {
                  if (drafts.discardOwn()) {
                    Modal.destroyAll();
                    onBack();
                  }
                }}
              >
                {t("放弃修改")}
              </Button>
              <CancelBtn />
              <OkBtn />
            </Space>
          ),
        })
      : onBack();
  const leaving = useRef(false);
  useWorkflowNavigationGuard(
    dirty,
    (retry) => {
      if (leaving.current) return;
      leaving.current = true;
      const finish = () => {
        leaving.current = false;
      };
      const dialog = Modal.confirm({
        title: t("离开前保存修改？", "Save changes before leaving?"),
        content: t(
          "当前有未保存的草稿。",
          "This workflow has unsaved changes.",
        ),
        okText: t("保存并离开", "Save and leave"),
        cancelText: t("继续编辑", "Keep editing"),
        onCancel: finish,
        afterClose: finish,
        onOk: async () => {
          if (!(await save()))
            throw new Error(t("保存未完成", "Save did not complete"));
          retry();
        },
        footer: (_: any, { OkBtn, CancelBtn }: any) => (
          <Space wrap>
            <Button
              onClick={() => {
                if (drafts.persist()) {
                  dialog.destroy();
                  finish();
                  retry();
                }
              }}
            >
              {t("保留草稿并离开", "Keep draft and leave")}
            </Button>
            <CancelBtn />
            <OkBtn />
          </Space>
        ),
      });
    },
    () => drafts.persist(),
  );
  const beforeDebugRun = async () => {
    const scope = renderScope;
    const snapshot = currentRef.current;
    if (!snapshot) return null;
    const key = fingerprint(snapshot);
    if (dirty && !(await save())) return null;
    if (
      scope !== scopeRef.current ||
      !mounted.current ||
      !currentRef.current ||
      fingerprint(currentRef.current) !== key
    )
      return null;
    return lastSaved.current;
  };
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
            (groups[spec.category || t("其他")] ||= []).push(spec);
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
            _status: runStatuses[node.id],
            _diagnostics: diagnostics.filter(
              (item) => item.node_id === node.id,
            ),
            _controlHandles: edges
              .filter(
                (edge) =>
                  edge.source === node.id && edge.data?.kind === "control",
              )
              .map((edge) => edge.sourceHandle || "next"),
            _sourceHandles: edges
              .filter(
                (edge) =>
                  edge.source === node.id && edge.data?.kind !== "control",
              )
              .map(
                (edge) =>
                  edge.sourceHandle ||
                  spec?.outputs_schema?.[Number(edge.data?.source_slot || 0)]
                    ?.name,
              )
              .filter(Boolean),
            _targetHandles: edges
              .filter((edge) => edge.target === node.id)
              .map((edge) => edge.targetHandle)
              .filter(Boolean),
          },
        };
      }),
    [nodes, specs, edges, runStatuses, diagnostics],
  );
  const renderNodeTypes = useMemo(
    () => ({ ...nodeTypes, editorNote: CanvasNote, editorGroup: CanvasGroup }),
    [nodeTypes],
  );
  const auxiliaryNodes: Node[] = [
    ...tools.groups.flatMap((group) => {
      const members = nodes.filter((node) => group.nodeIds.includes(node.id));
      if (members.length < 2) return [];
      const x = Math.min(...members.map((node) => node.position.x)) - 22;
      const y = Math.min(...members.map((node) => node.position.y)) - 38;
      return [
        {
          id: `canvas-group:${group.id}`,
          type: "editorGroup",
          position: { x, y },
          data: { label: group.label },
          style: {
            width:
              Math.max(
                ...members.map(
                  (node) => node.position.x + (node.measured?.width || 270),
                ),
              ) -
              x +
              22,
            height:
              Math.max(
                ...members.map(
                  (node) => node.position.y + (node.measured?.height || 180),
                ),
              ) -
              y +
              22,
          },
          className: "ff-canvas-group",
          draggable: false,
          selectable: false,
          connectable: false,
          deletable: false,
          zIndex: -1,
        },
      ];
    }),
    ...tools.notes.map((note) => ({
      id: `canvas-note:${note.id}`,
      initialWidth: 280,
      initialHeight: 156,
      type: "editorNote",
      position: note.position,
      data: {
        text: note.text,
        locked,
        onText: (text: string) =>
          updateTools((value) => ({
            ...value,
            notes: value.notes.map((item) =>
              item.id === note.id ? { ...item, text } : item,
            ),
          })),
        onRemove: () =>
          updateTools((value) => ({
            ...value,
            notes: value.notes.filter((item) => item.id !== note.id),
          })),
      },
      dragHandle: ".ff-note-handle",
      draggable: !locked && !panMode,
      selectable: false,
      connectable: false,
      deletable: false,
    })),
  ];
  const importDocument = () => {
    try {
      if (!current || locked) return;
      const value = JSON.parse(importText);
      if (
        ["name", "description", "version"].some(
          (key) => value?.[key] !== undefined && typeof value[key] !== "string",
        )
      )
        throw new Error(
          t(
            "流程名称、描述与版本必须是文本",
            "Workflow name, description and version must be text",
          ),
        );
      if (
        !value ||
        typeof value !== "object" ||
        !value.nodes ||
        Array.isArray(value.nodes) ||
        typeof value.nodes !== "object" ||
        !Array.isArray(value.edges) ||
        !value.metadata ||
        Array.isArray(value.metadata) ||
        typeof value.metadata !== "object" ||
        !Array.isArray(value.inputs) ||
        !value.outputs ||
        typeof value.outputs !== "object"
      )
        throw new Error(
          t(
            "请选择完整的工作流 JSON",
            "Choose a complete workflow JSON document",
          ),
        );
      for (const [id, node] of Object.entries(value.nodes) as [string, any][])
        if (
          ["__proto__", "constructor", "prototype"].includes(id) ||
          !node ||
          typeof node !== "object" ||
          typeof (node.class_type || node.type) !== "string" ||
          (node.label != null && typeof node.label !== "string") ||
          (node.inputs != null &&
            (typeof node.inputs !== "object" || Array.isArray(node.inputs))) ||
          (node.control != null &&
            (typeof node.control !== "object" || Array.isArray(node.control)))
        )
          throw new Error(t("节点定义无效", "Invalid node definition"));
      if (
        value.edges.some(
          (edge: any) =>
            !edge ||
            !Object.prototype.hasOwnProperty.call(value.nodes, edge.source) ||
            !Object.prototype.hasOwnProperty.call(value.nodes, edge.target),
        )
      )
        throw new Error(
          t("连线引用了不存在的节点", "An edge references a missing node"),
        );
      install({
        ...current,
        ...value,
        id: current.id,
        revision: doc?.revision,
      });
      setImportOpen(false);
    } catch (error: any) {
      setImportError(error.message);
    }
  };

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
          message={t("工作流加载失败")}
          description={loadError}
          action={<Button onClick={onBack}>{t("返回列表")}</Button>}
        />
      </div>
    );
  return (
    <div ref={editorRoot} className="ff-editor" data-flowforge-editor="true">
      <EditorToolbar
        antd={antd}
        t={t}
        name={doc.name || flowId}
        summary={t(
          "{nodes} 个节点 · {edges} 条连线 · 修订 {revision}",
          "{nodes} nodes · {edges} connections · Revision {revision}",
          {
            nodes: nodes.length,
            edges: edges.length,
            revision: doc.revision ?? 0,
          },
        )}
        agentId={agentId}
        dirty={dirty}
        saving={saving}
        validating={validating}
        canUndo={!!canUndo}
        canRedo={!!history.current.future.length}
        paletteOpen={paletteOpen}
        debugOpen={debugOpen}
        count={selectedIds.length}
        grouped={!!selectedGroup}
        muted={
          selectedIds.length > 0 &&
          nodes
            .filter((node) => node.selected)
            .every((node) => node.data.control?.mode === "mute")
        }
        locked={locked}
        grid={grid}
        snap={snap}
        focus={focusMode}
        canPaste={!!clipboard}
        onAction={toolbarAction}
        onRun={async () => {
          const scope = scopeRef.current;
          if (
            !(await validate()) ||
            !mounted.current ||
            scopeRef.current !== scope
          )
            return;
          if (dirty && !(await save())) return;
          if (
            scopeRef.current !== scope ||
            !currentRef.current ||
            fingerprint(currentRef.current) !== currentKey
          ) {
            message.info(t("草稿或当前专家已变化，请重新验证后试运行"));
            return;
          }
          onRun(flowId);
        }}
      />
      <Modal
        open={importOpen}
        title={t("导入工作流 JSON", "Import workflow JSON")}
        onCancel={() => setImportOpen(false)}
        onOk={importDocument}
        okText={t("应用到当前草稿", "Apply to current draft")}
        okButtonProps={{ disabled: !importText.trim() || locked }}
      >
        <p>
          {t(
            "导入将替换当前草稿中的节点与配置，当前工作流标识和修订保持不变。可撤销后恢复。",
            "Import replaces the current draft's nodes and configuration, preserving its workflow ID and revision. Undo restores the previous draft.",
          )}
        </p>
        <input
          type="file"
          accept=".json,application/json"
          aria-label={t("选择 JSON 文件", "Choose JSON file")}
          onChange={async (event) => {
            const scope = scopeRef.current;
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
              setImportError(
                t("JSON 文件不能超过 5 MB", "JSON files must be at most 5 MB"),
              );
              return;
            }
            try {
              const text = await file.text();
              if (scope !== scopeRef.current || !mounted.current) return;
              setImportText(text);
              setImportError("");
            } catch (error: any) {
              if (scope === scopeRef.current && mounted.current)
                setImportError(error.message);
            }
          }}
        />
        <Input.TextArea
          aria-label={t("工作流 JSON", "Workflow JSON")}
          rows={10}
          value={importText}
          onChange={(event: any) => {
            setImportText(event.target.value);
            setImportError("");
          }}
        />
        {importText.trim() &&
          (() => {
            try {
              const parsed = JSON.parse(importText);
              return (
                <p>
                  {t("将导入 {count} 个节点", "Importing {count} nodes", {
                    count: Object.keys(parsed.nodes || {}).length,
                  })}
                </p>
              );
            } catch {
              return null;
            }
          })()}
        {importError && (
          <Alert type="error" role="alert" message={importError} />
        )}
      </Modal>
      {drafts.error && (
        <Alert
          type="warning"
          showIcon
          message={t(
            "本地草稿保存不可用，请手动保存工作流",
            "Local draft storage is unavailable. Save the workflow manually.",
          )}
          description={drafts.error}
          action={
            <Button onClick={() => drafts.persist()}>
              {t("重试", "Retry")}
            </Button>
          }
        />
      )}
      {drafts.savedAt && dirty && (
        <div className="ff-draft-status" role="status">
          {t("本地草稿已保存", "Local draft saved")} ·{" "}
          {new Date(drafts.savedAt).toLocaleTimeString(locale)}
        </div>
      )}
      {drafts.candidates.length > 0 && !drafts.pendingRecovery && (
        <Alert
          type="info"
          message={t(
            "还有 {count} 份本地草稿可恢复",
            "{count} local drafts are available",
            { count: drafts.candidates.length },
          )}
          action={
            <Button onClick={() => setRecoverOpen(true)}>
              {t("查看草稿", "Review drafts")}
            </Button>
          }
        />
      )}
      {(validation || diagnostics.length > 0) && (
        <Alert
          closable
          showIcon
          onClose={() => setValidation(null)}
          type={
            diagnostics.some((item) => item.severity === "error")
              ? "error"
              : diagnostics.length
              ? "warning"
              : "success"
          }
          message={
            diagnostics.length
              ? t("{value0} 个问题 · {value1} 个提醒", {
                  value0: diagnostics.filter(
                    (item) => item.severity === "error",
                  ).length,
                  value1: diagnostics.filter(
                    (item) => item.severity === "warning",
                  ).length,
                })
              : t("工作流结构验证通过")
          }
          description={
            diagnostics.length > 0 && (
              <ul className="ff-errors">
                {diagnostics.map((item, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="ff-diagnostic"
                      disabled={
                        !nodes.some((node) => node.id === item.node_id) &&
                        !edges.some((edge) => edge.id === item.edge_id)
                      }
                      onClick={() => locateDiagnostic(item)}
                    >
                      {item.severity === "warning" ? t("提醒：") : ""}
                      {item.node_id
                        ? `${
                            current?.nodes[item.node_id]?.label || item.node_id
                          }：`
                        : ""}
                      {item.edge_id
                        ? t("连线 {value0}：", { value0: item.edge_id })
                        : ""}
                      {item.message}
                    </button>
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
            paletteOpen && !focusMode ? "ff-palette-open" : "ff-palette-closed"
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
            {nodes.length
              ? t("✦ 用自然语言修改", "✦ Edit with natural language")
              : t("✦ 用自然语言搭建", "✦ Build with natural language")}
          </Button>
          <p className="ff-muted">
            {t("描述目标、条件和异常处理，预览后应用。")}
          </p>
          <Input
            value={search}
            aria-label={t("搜索节点")}
            placeholder={t("搜索节点或能力")}
            allowClear
            onChange={(event: any) => setSearch(event.target.value)}
          />
          <Button
            size="small"
            aria-label={t("刷新节点")}
            loading={refreshing}
            onClick={() => void refreshCatalogue(true)}
            style={{ marginTop: 8 }}
          >
            {t("刷新节点")}
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
                description={
                  refreshing ? t("正在加载节点目录…") : t("没有匹配节点")
                }
              />
            )}
          </div>
        </aside>
        <main className="ff-canvas">
          <SelectionToolbar
            antd={antd}
            t={t}
            count={selectedIds.length}
            grouped={!!selectedGroup}
            muted={
              selectedIds.length > 0 &&
              nodes
                .filter((node) => node.selected)
                .every((node) => node.data.control?.mode === "mute")
            }
            locked={locked}
            onAction={toolbarAction}
          />
          {findOpen && (
            <div
              className="ff-canvas-search"
              role="search"
              aria-label={t("查找画布节点", "Find canvas nodes")}
            >
              <Input
                autoFocus
                value={findQuery}
                aria-label={t("查找节点名称或 ID", "Find node name or ID")}
                placeholder={t("查找节点名称或 ID", "Find node name or ID")}
                onChange={(event: any) => setFindQuery(event.target.value)}
                suffix={
                  <Button
                    type="text"
                    aria-label={t("关闭查找", "Close search")}
                    icon={<ToolbarIcon name="close" />}
                    onClick={() => setFindOpen(false)}
                  />
                }
              />
              <div className="ff-search-results">
                {nodes
                  .filter((node) =>
                    `${node.data.label || node.data.class_type} ${node.id}`
                      .toLowerCase()
                      .includes(findQuery.toLowerCase()),
                  )
                  .map((node) => (
                    <Button
                      key={node.id}
                      type="text"
                      onClick={() => {
                        setSelectedId(null);
                        setNodes((list) =>
                          list.map((item) => ({
                            ...item,
                            selected: item.id === node.id,
                          })),
                        );
                        void canvas?.fitView({
                          nodes: [node],
                          padding: 0.6,
                          maxZoom: 1,
                          duration: 200,
                        });
                        setFindOpen(false);
                      }}
                    >
                      {String(node.data.label || node.data.class_type)}
                      <small>{node.id}</small>
                    </Button>
                  ))}
                {!nodes.some((node) =>
                  `${node.data.label || node.data.class_type} ${node.id}`
                    .toLowerCase()
                    .includes(findQuery.toLowerCase()),
                ) && <span>{t("没有匹配的节点", "No matching nodes")}</span>}
              </div>
            </div>
          )}
          <ReactFlow
            nodes={[...auxiliaryNodes, ...canvasNodes]}
            edges={edges}
            nodeTypes={renderNodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={(changes) => {
              const noteMoves = changes.filter(
                (change) =>
                  change.type === "position" &&
                  change.position &&
                  change.id.startsWith("canvas-note:"),
              );
              if (noteMoves.length && !locked)
                updateTools((value) => ({
                  ...value,
                  notes: value.notes.map((note) => {
                    const move = noteMoves.find(
                      (change) =>
                        change.type === "position" &&
                        change.id === `canvas-note:${note.id}`,
                    );
                    return move?.type === "position" && move.position
                      ? { ...note, position: move.position }
                      : note;
                  }),
                }));
              onNodesChange(
                changes.filter(
                  (change) =>
                    "id" in change &&
                    nodes.some((node) => node.id === change.id) &&
                    (!locked ||
                      change.type === "select" ||
                      change.type === "dimensions"),
                ),
              );
            }}
            onEdgesChange={(changes) =>
              onEdgesChange(
                changes.filter((change) => !locked || change.type === "select"),
              )
            }
            nodesDraggable={!locked && !panMode}
            nodesConnectable={!locked}
            edgesReconnectable={!locked}
            panOnDrag={panMode ? true : [1, 2]}
            selectionOnDrag={!panMode}
            multiSelectionKeyCode="Shift"
            snapToGrid={snap}
            snapGrid={[20, 20]}
            onInit={setCanvas}
            onNodeClick={(event, node) => {
              if (node.type !== "workflow" || locked || panMode) return;
              setSelectedId(event.shiftKey ? null : node.id);
              setFocusedField(undefined);
            }}
            onConnect={connect}
            isValidConnection={(connection) =>
              !connectionIssue(connection, schemaNodes, edges, locale)
            }
            deleteKeyCode={null}
            fitView
            fitViewOptions={{ maxZoom: 1, padding: 0.18 }}
            minZoom={0.15}
            maxZoom={2}
          >
            {grid && <Background gap={20} />}
            <Controls showInteractive={false} />
            <div
              className="ff-canvas-modes nodrag nopan"
              role="group"
              aria-label={t("画布交互模式", "Canvas interaction mode")}
            >
              <Button
                type="text"
                aria-label={t("选择模式", "Selection mode")}
                aria-pressed={!panMode}
                icon={<ToolbarIcon name="pointer" />}
                onClick={() => setPanMode(false)}
              />
              <Button
                type="text"
                aria-label={t("拖动画布模式", "Pan mode")}
                aria-pressed={panMode}
                icon={<ToolbarIcon name="hand" />}
                onClick={() => setPanMode(true)}
              />
              {locked && <span>{t("已锁定", "Locked")}</span>}
            </div>
            <MiniMap pannable zoomable />
          </ReactFlow>
          {!nodes.length && (
            <div className="ff-empty-canvas">
              <span>✦</span>
              <h2>{t("从业务目标开始")}</h2>
              <p>{t("描述工作流，或从节点库添加步骤。")}</p>
              <Button type="primary" onClick={() => setAiOpen(true)}>
                {t("描述我的工作流")}
              </Button>
            </div>
          )}
          <div className="ff-canvas-help">
            {t("拖动节点编排 · 连线传递数据 · Shift 多选 · Ctrl / ⌘ Z 撤销")}
          </div>
        </main>
        <InspectorPanel
          antd={antd}
          open={!!selected && !locked && !focusMode}
          onClose={() => setSelectedId(null)}
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
                  {t("复制")}
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() =>
                    Modal.confirm({
                      title: t("删除节点及关联连线？"),
                      okText: t("删除"),
                      cancelText: t("取消"),
                      onOk: () => removeNodes([selected.id]),
                    })
                  }
                >
                  {t("删除")}
                </Button>
              </Space>
            )
          }
        >
          {selected && (
            <Inspector
              antd={antd}
              api={api}
              agentId={agentId}
              flowId={flowId}
              edges={edges}
              focusedField={focusedField}
              diagnostics={diagnostics.filter(
                (item) => item.node_id === selected.id,
              )}
              node={selected}
              nodeTypes={specs}
              availableNodes={schemaNodes}
              bindings={
                <InputBindings
                  node={selected}
                  nodes={schemaNodes}
                  edges={edges}
                  onBind={bindInput}
                  onDisconnect={(field) => bindInput(field)}
                  snapshot={{
                    flowId,
                    agentId,
                    revision: current?.revision,
                    record: debugRecord,
                    sourceChangedIds: Object.keys(current?.nodes || {}).filter(
                      (id) => {
                        const sourceConfiguration = (entry: any) =>
                          JSON.stringify({
                            class_type: entry?.class_type,
                            inputs: entry?.inputs || {},
                            control: entry?.control || {},
                          });
                        return (
                          sourceConfiguration(current?.nodes[id]) !==
                          sourceConfiguration(lastSaved.current?.nodes[id])
                        );
                      },
                    ),
                  }}
                  workflowInputs={current?.inputs}
                  onExpression={(field, expression) => {
                    setEdges((list) =>
                      list.filter(
                        (edge) =>
                          !(
                            edge.target === selected.id &&
                            edge.targetHandle === field &&
                            edge.data?.kind !== "control"
                          ),
                      ),
                    );
                    setNodes((list) =>
                      list.map((node) =>
                        node.id === selected.id
                          ? {
                              ...node,
                              data: {
                                ...node.data,
                                inputs: {
                                  ...((node.data.inputs || {}) as Record<
                                    string,
                                    unknown
                                  >),
                                  [field]: expression,
                                },
                              },
                            }
                          : node,
                      ),
                    );
                  }}
                  onLocateSource={(nodeId, output) => {
                    setNodes((list) =>
                      list.map((node) => ({
                        ...node,
                        selected: node.id === nodeId,
                      })),
                    );
                    locateDiagnostic({
                      code: "variable_source",
                      severity: "warning",
                      message: "",
                      node_id: nodeId,
                      field: `outputs.${output}`,
                    });
                  }}
                />
              }
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
                            label:
                              existing.data?.label ?? generated.data?.label,
                          },
                        }
                      : generated;
                  }),
                ]);
              }}
            />
          )}
        </InspectorPanel>
      </div>
      {debugOpen && !focusMode && current && (
        <DebugWorkspace
          key={JSON.stringify([userId, agentId, flowId])}
          flow={current}
          agentId={agentId}
          userId={userId}
          record={debugRecord}
          targetId={selectedId}
          onTarget={(id) => {
            setSelectedId(id);
            setNodes((list) =>
              list.map((node) => ({ ...node, selected: node.id === id })),
            );
          }}
          beforeRun={beforeDebugRun}
          onRun={onDebugRun}
          api={api}
          antd={antd}
        />
      )}
      <Modal
        title={t("恢复本地草稿", "Recover local drafts")}
        open={drafts.pendingRecovery || recoverOpen}
        onCancel={() => {
          drafts.dismiss();
          setRecoverOpen(false);
        }}
        footer={
          <Button
            onClick={() => {
              drafts.dismiss();
              setRecoverOpen(false);
            }}
          >
            {t("继续使用服务器版本", "Continue with the server version")}
          </Button>
        }
      >
        <p>
          {t(
            "本地草稿按账户、专家和工作流分别保存。请选择需要恢复的记录。",
            "Local drafts are isolated by account, agent, and workflow. Choose a draft to recover.",
          )}
        </p>
        {drafts.candidates.map((draft) => (
          <div className="ff-draft-entry" key={draft.key}>
            <strong>{draft.value.document.name || flowId}</strong>
            <p>
              {new Date(draft.value.updatedAt).toLocaleString(locale)} ·{" "}
              {t("基于修订 {revision}", "Based on revision {revision}", {
                revision: draft.value.baseRevision,
              })}
            </p>
            {draft.value.baseRevision !== serverFlow.current?.revision && (
              <Alert
                type="warning"
                message={t(
                  "服务器修订已变化，恢复后保存会检查版本冲突。",
                  "The server revision changed. Saving a restored draft checks for version conflicts.",
                )}
              />
            )}
            <Space wrap>
              <Button
                onClick={() => {
                  install(drafts.adopt(draft), false, true);
                  setRecoverOpen(false);
                }}
              >
                {t("恢复草稿", "Restore draft")}
              </Button>
              {draft.value.baseRevision !== serverFlow.current?.revision && (
                <Button
                  onClick={() =>
                    Modal.confirm({
                      title: t(
                        "以当前服务器修订恢复草稿？",
                        "Restore this draft on the current server revision?",
                      ),
                      content: t(
                        "保存时将采用这份草稿的完整内容，请先核对其他编辑者的修改。",
                        "Saving will use this draft's complete content. Review changes made by other editors first.",
                      ),
                      okText: t("确认恢复", "Confirm restore"),
                      cancelText: t("取消", "Cancel"),
                      onOk: () => {
                        install(
                          drafts.adopt(draft, serverFlow.current?.revision),
                          false,
                          true,
                        );
                        setRecoverOpen(false);
                      },
                    })
                  }
                >
                  {t("以当前修订恢复", "Restore on current revision")}
                </Button>
              )}
              <Button danger onClick={() => drafts.discard(draft)}>
                {t("删除这份草稿", "Delete this draft")}
              </Button>
            </Space>
          </div>
        ))}
      </Modal>
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
        title={
          nodes.length ? t("用自然语言修改工作流") : t("用自然语言搭建工作流")
        }
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
              {t("取消")}
            </Button>
            {proposal && (
              <Button
                aria-label={t("应用并保存")}
                type="primary"
                loading={aiBusy}
                disabled={
                  !proposal.validation.ok ||
                  currentKey !== proposalBase.current ||
                  agentId !== proposalAgent.current
                }
                onClick={applyProposal}
              >
                {t("应用并保存")}
              </Button>
            )}
          </Space>
        }
      >
        <Alert
          type="info"
          showIcon
          message={t("先预览，再应用")}
          description={t(
            "AI 根据当前专家可用能力与最新草稿生成方案。应用会创建新版本，不会自动执行工作流。",
          )}
        />
        <label className="ff-field-label" htmlFor="ff-prompt">
          {t("业务目标与修改要求")}
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
          placeholder={t(
            "例如：检查生产数据，并行计算库存和注采能力；异常转人工审核，通过后生成报告。失败重试 2 次。",
          )}
        />
        <div className="ff-example-row">
          {[
            t("增加人工审核，通过后再继续"),
            t("失败重试 2 次，并设置超时"),
            t("独立分析并行执行后汇总"),
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
          aria-label={proposal ? t("重新生成方案") : t("生成变更预览")}
          loading={aiBusy}
          disabled={!prompt.trim()}
          onClick={propose}
        >
          {proposal ? t("重新生成方案") : t("生成变更预览")}
        </Button>
        {aiError && (
          <Alert
            className="ff-spaced"
            type="error"
            showIcon
            message={t("方案未应用")}
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
                  ? t("结构验证通过，请检查业务逻辑")
                  : t("方案未通过验证，不能应用")
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
                message={t("草稿或当前专家已变化，请重新生成方案。")}
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
                  label: t("变更明细 ({value0})", {
                    value0: proposal.changes.length,
                  }),
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
                            <strong>{change.node_id || t("工作流")}</strong>
                            <p>{change.description}</p>
                            {!!change.details?.length && (
                              <table className="ff-diff-table">
                                <thead>
                                  <tr>
                                    <th>{t("参数")}</th>
                                    <th>{t("修改前")}</th>
                                    <th>{t("修改后")}</th>
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
                                            t("未设置")}
                                      </td>
                                      <td>
                                        {typeof detail.after === "string"
                                          ? detail.after
                                          : JSON.stringify(detail.after) ??
                                            t("未设置")}
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
                  label: t("完整工作流"),
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
        title={t("工作流版本")}
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
                <strong>
                  {t("版本")}
                  {version.revision}
                </strong>
                <p>
                  {version.name} · {version.node_count} {t("个节点")}
                </p>
              </div>
              <Button
                disabled={version.revision === doc.revision}
                onClick={() =>
                  Modal.confirm({
                    title: t("恢复到版本 {value0}？", {
                      value0: version.revision,
                    }),
                    content: dirty
                      ? t("当前草稿将被替换。恢复会创建新版本。")
                      : t("恢复会创建新版本，历史记录仍保留。"),
                    okText: t("恢复版本"),
                    cancelText: t("取消"),
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
                      drafts.discardOwn();
                      install(restored, true, true);
                      setVersionsOpen(false);
                    },
                  })
                }
              >
                {t("恢复")}
              </Button>
            </div>
          ))
        ) : (
          <Empty description={t("暂无已保存版本")} />
        )}
      </Drawer>
    </div>
  );
}
