import React, { useEffect, useRef, useState } from "react";
import { useWorkflowI18n } from "./i18n";
import { type Api, type FlowDocument } from "./model";
import type { RunRecord } from "./runRecord";

interface DebugSample {
  id: string;
  name: string;
  revision: number;
  updatedAt: number;
  inputs: Record<string, unknown>;
  nodeInputs: Record<string, unknown>;
  pins: Record<string, unknown[]>;
  source?: { runId: string; revision?: number; edited: boolean };
}
const SAMPLE_PREFIX = "flowforge:debug-sample:v1:";
const controlTypes = new Set([
  "ConditionNode",
  "HumanReviewNode",
  "QualityGateNode",
  "IterativeRefineNode",
  "ParallelNode",
  "WaitNode",
  "ErrorHandlerNode",
  "SubworkflowNode",
  "StartNode",
  "EndNode",
]);
const pretty = (value: unknown) => JSON.stringify(value, null, 2);
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isDebugSample(value: unknown): value is DebugSample {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Number.isFinite(value.revision) &&
    Number.isFinite(value.updatedAt) &&
    isObject(value.inputs) &&
    isObject(value.nodeInputs) &&
    isObject(value.pins) &&
    Object.values(value.pins).every(Array.isArray) &&
    (value.source === undefined ||
      (isObject(value.source) &&
        typeof value.source.runId === "string" &&
        typeof value.source.edited === "boolean" &&
        (value.source.revision === undefined ||
          Number.isFinite(value.source.revision))))
  );
}
function jsonObject(text: string): Record<string, unknown> {
  const value = JSON.parse(text || "{}");
  if (!isObject(value)) throw new Error("JSON must be an object");
  return value;
}

export function DebugWorkspace({
  flow,
  agentId,
  userId,
  record,
  targetId,
  onTarget,
  beforeRun,
  onRun,
  api,
  antd,
}: {
  flow: FlowDocument;
  agentId: string;
  userId: string;
  record?: RunRecord;
  targetId: string | null;
  onTarget: (id: string) => void;
  beforeRun: () => Promise<FlowDocument | null>;
  onRun?: (id: string) => void;
  api: Api;
  antd: any;
}) {
  const { t } = useWorkflowI18n();
  const { Button, Input, Select, Alert, Space, Tag } = antd;
  const scope = JSON.stringify([userId, agentId, flow.id]);
  const samplePrefix = SAMPLE_PREFIX + encodeURIComponent(scope) + ":";
  const [inputsText, setInputsText] = useState("{}");
  const [nodeInputsText, setNodeInputsText] = useState("{}");
  const [pins, setPins] = useState<Record<string, string>>({});
  const [originalPins, setOriginalPins] = useState<Record<string, string>>({});
  const [sourceRun, setSourceRun] = useState("");
  const [sourceRevision, setSourceRevision] = useState<number>();
  const [sourceBaseEdited, setSourceBaseEdited] = useState(false);
  const [pinNode, setPinNode] = useState<string>();
  const [sampleName, setSampleName] = useState("");
  const [samples, setSamples] = useState<DebugSample[]>([]);
  const [loadedSample, setLoadedSample] = useState<DebugSample | null>(null);
  const [error, setError] = useState("");
  const [storageError, setStorageError] = useState("");
  const [busy, setBusy] = useState(false);
  const visitRef = useRef({ scope, alive: true });
  if (visitRef.current.scope !== scope) {
    visitRef.current.alive = false;
    visitRef.current = { scope, alive: true };
  }
  const visit = visitRef.current;
  const controller = useRef<AbortController | null>(null);
  const refreshSamples = () => {
    const values: DebugSample[] = [];
    let invalid = false;
    setSamples([]);
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (!key?.startsWith(samplePrefix)) continue;
        try {
          const value = JSON.parse(localStorage.getItem(key) || "null");
          if (!isDebugSample(value)) throw new Error("Invalid test sample");
          values.push(value);
        } catch {
          invalid = true;
        }
      }
      setSamples(
        values.sort((left, right) => right.updatedAt - left.updatedAt),
      );
      setStorageError(
        invalid
          ? t(
              "部分测试案例损坏，已保留原始数据，其余案例仍可使用。",
              "Some test cases are invalid. Their original data was preserved and other cases remain available.",
            )
          : "",
      );
    } catch (failure: any) {
      setStorageError(failure.message);
    }
  };
  useEffect(() => {
    visit.alive = true;
    setInputsText(
      pretty(
        Object.fromEntries(
          (flow.inputs || [])
            .filter((field) => field.default !== undefined)
            .map((field) => [field.name, field.default]),
        ),
      ),
    );
    setNodeInputsText("{}");
    setPins({});
    setOriginalPins({});
    setSourceRun("");
    setSourceRevision(undefined);
    setSourceBaseEdited(false);
    setError("");
    setBusy(false);
    setLoadedSample(null);
    setSamples([]);
    setSampleName("");
    setPinNode(undefined);
    refreshSamples();
    return () => {
      visit.alive = false;
      controller.current?.abort();
    };
  }, [visit]);
  const usableRecord =
    record?.flow_id === flow.id && record.agent_id === agentId
      ? record
      : undefined;
  const sourceEdited =
    sourceBaseEdited || JSON.stringify(pins) !== JSON.stringify(originalPins);
  const pinValues = () =>
    Object.fromEntries(
      Object.entries(pins).map(([id, value]) => {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed))
          throw new Error(
            t(
              "固定输出必须是槽位数组",
              "Pinned output must be an array of output slots",
            ),
          );
        return [id, parsed];
      }),
    );
  const readVariables = () => {
    if (!usableRecord) return;
    const values: Record<string, string> = {};
    for (const [id, detail] of Object.entries(
      usableRecord.node_details || {},
    )) {
      if (
        flow.nodes[id] &&
        !controlTypes.has(flow.nodes[id].class_type) &&
        Array.isArray(detail.outputs)
      )
        values[id] = pretty(detail.outputs);
    }
    setPins(values);
    setOriginalPins(values);
    setSourceRun(usableRecord.run_id);
    setSourceRevision(usableRecord.flow_revision);
    setSourceBaseEdited(false);
    setError("");
  };
  const start = async (mode: "node" | "until") => {
    if (!targetId || !flow.nodes[targetId] || busy) return;
    setError("");
    setBusy(true);
    try {
      const inputs = jsonObject(inputsText);
      const nodeInputs = jsonObject(nodeInputsText);
      const fixed = pinValues();
      // The selected node always executes, even when its previous output is fixed.
      delete fixed[targetId];
      const saved = await beforeRun();
      if (!saved || !visit.alive || visitRef.current !== visit) return;
      const request = new AbortController();
      controller.current = request;
      const response = await api<{ run_id: string }>(
        `/flowforge/flows/${encodeURIComponent(saved.id)}/debug`,
        {
          method: "POST",
          headers: { "X-Agent-Id": agentId },
          signal: request.signal,
          body: JSON.stringify({
            mode,
            target_node_id: targetId,
            expected_revision: saved.revision ?? 0,
            inputs,
            pins: fixed,
            node_inputs: nodeInputs,
          }),
        },
      );
      if (visit.alive && visitRef.current === visit) onRun?.(response.run_id);
    } catch (failure: any) {
      if (
        visit.alive &&
        visitRef.current === visit &&
        failure.name !== "AbortError"
      )
        setError(failure.message);
    } finally {
      if (visit.alive && visitRef.current === visit) setBusy(false);
    }
  };
  const saveSample = () => {
    try {
      const sample: DebugSample = {
        id: crypto.randomUUID(),
        name: sampleName.trim(),
        revision: flow.revision ?? 0,
        updatedAt: Date.now(),
        inputs: jsonObject(inputsText),
        nodeInputs: jsonObject(nodeInputsText),
        pins: pinValues(),
        source: sourceRun
          ? { runId: sourceRun, revision: sourceRevision, edited: sourceEdited }
          : undefined,
      };
      if (!sample.name)
        throw new Error(t("请填写测试案例名称", "Enter a test case name"));
      if (userId === "pending")
        throw new Error(t("正在确认账户身份", "Resolving account identity"));
      localStorage.setItem(samplePrefix + sample.id, JSON.stringify(sample));
      setSampleName("");
      setError("");
      refreshSamples();
    } catch (failure: any) {
      setError(failure.message);
    }
  };
  const loadSample = (id: string) => {
    const sample = samples.find((entry) => entry.id === id);
    if (!sample) return;
    setInputsText(pretty(sample.inputs));
    setNodeInputsText(pretty(sample.nodeInputs));
    const fixed = Object.fromEntries(
      Object.entries(sample.pins).map(([node, value]) => [node, pretty(value)]),
    );
    setPins(fixed);
    setOriginalPins(fixed);
    setLoadedSample(sample);
    setSourceRun(sample.source?.runId || "");
    setSourceRevision(sample.source?.revision);
    setSourceBaseEdited(sample.source?.edited || false);
    setError("");
  };
  const actualInput = targetId
    ? usableRecord?.node_details?.[targetId]
    : undefined;
  return (
    <section
      className="ff-debug-workspace"
      aria-label={t("调试与变量", "Debug and variables")}
    >
      <header>
        <strong>{t("调试与变量", "Debug and variables")}</strong>
        <Tag>{t("仅用于调试", "Debug only")}</Tag>
        <span className="ff-muted">
          {t(
            "固定变量只在以下调试操作中生效。普通试运行使用实际节点。",
            "Pinned variables apply to these debug actions. Normal test runs execute real nodes.",
          )}
        </span>
      </header>
      {error && <Alert type="error" showIcon message={error} />}
      {storageError && (
        <Alert
          type="warning"
          message={t("测试案例存储不可用", "Test case storage is unavailable")}
          description={storageError}
        />
      )}
      <div className="ff-debug-grid">
        <div>
          <label>{t("目标节点", "Target node")}</label>
          <Select
            aria-label={t("目标节点", "Target node")}
            disabled={busy}
            value={targetId || undefined}
            options={Object.entries(flow.nodes).map(([id, node]) => ({
              value: id,
              label: `${node.label || id} · ${id}`,
            }))}
            onChange={onTarget}
            style={{ width: "100%" }}
          />
          <label htmlFor="ff-debug-inputs">
            {t("工作流输入 JSON", "Workflow inputs JSON")}
          </label>
          <Input.TextArea
            id="ff-debug-inputs"
            aria-label={t("工作流输入 JSON", "Workflow inputs JSON")}
            disabled={busy}
            value={inputsText}
            onChange={(event: any) => setInputsText(event.target.value)}
            rows={4}
          />
          <label htmlFor="ff-debug-node-inputs">
            {t("目标节点输入覆盖 JSON", "Target node input overrides JSON")}
          </label>
          <Input.TextArea
            id="ff-debug-node-inputs"
            aria-label={t(
              "目标节点输入覆盖 JSON",
              "Target node input overrides JSON",
            )}
            disabled={busy}
            value={nodeInputsText}
            onChange={(event: any) => setNodeInputsText(event.target.value)}
            rows={4}
          />
          <Space wrap>
            <Button
              disabled={!actualInput?.inputs_available}
              onClick={() =>
                setNodeInputsText(pretty(actualInput?.inputs || {}))
              }
            >
              {t("使用实际输入", "Use actual inputs")}
            </Button>
            <Button
              type="primary"
              disabled={!targetId || busy}
              loading={busy}
              onClick={() => void start("node")}
            >
              {t("运行此节点", "Run this node")}
            </Button>
            <Button
              disabled={!targetId || busy}
              onClick={() => void start("until")}
            >
              {t("运行到此处", "Run to this node")}
            </Button>
          </Space>
        </div>
        <div>
          <Space wrap>
            <strong>{t("固定输出槽位", "Pinned output slots")}</strong>
            <Button disabled={!usableRecord} onClick={readVariables}>
              {t("导入本次运行变量", "Import variables from this run")}
            </Button>
            <Button
              disabled={
                busy ||
                (!Object.keys(pins).length && !Object.keys(originalPins).length)
              }
              onClick={() => {
                setPins(originalPins);
                setError("");
              }}
            >
              {t("重置变量", "Reset variables")}
            </Button>
            <Button
              disabled={!Object.keys(pins).length}
              onClick={() => {
                setPins({});
              }}
            >
              {t("清空固定变量", "Clear pinned variables")}
            </Button>
          </Space>
          <p className="ff-muted">
            {t(
              "每个节点填写输出槽位数组。单个槽位输出数组时，需要外层数组。",
              "Enter output slots for each node. An array-valued single slot needs an outer array.",
            )}
          </p>
          {sourceRun && (
            <p className="ff-muted">
              {t("来源运行 {id}", "Source run {id}", { id: sourceRun })} ·{" "}
              {t("来源修订 {revision}", "Source revision {revision}", {
                revision: sourceRevision ?? "—",
              })}{" "}
              ·{" "}
              {sourceEdited
                ? t("测试变量已编辑", "Test variables edited")
                : t("原始运行变量", "Original run variables")}
            </p>
          )}
          {sourceRun &&
            sourceRevision !== undefined &&
            sourceRevision !== flow.revision && (
              <Alert
                type="warning"
                message={t(
                  "变量来自修订 {old}，当前修订 {current}，复用前请核对字段和槽位。",
                  "Variables are from revision {old}, current revision is {current}. Check fields and output slots before reuse.",
                  { old: sourceRevision, current: flow.revision ?? 0 },
                )}
              />
            )}
          {Object.entries(pins).map(([id, text]) => (
            <div className="ff-debug-pin" key={id}>
              <label htmlFor={`ff-pin-${id}`}>
                {flow.nodes[id]?.label || id} <code>{id}</code>
              </label>
              <Input.TextArea
                id={`ff-pin-${id}`}
                aria-label={t(
                  "节点 {id} 的固定输出",
                  "Pinned output for node {id}",
                  { id },
                )}
                disabled={busy}
                value={text}
                onChange={(event: any) =>
                  setPins((previous) => ({
                    ...previous,
                    [id]: event.target.value,
                  }))
                }
                rows={3}
              />
              <Button
                size="small"
                onClick={() =>
                  setPins((previous) =>
                    Object.fromEntries(
                      Object.entries(previous).filter(([key]) => key !== id),
                    ),
                  )
                }
              >
                {t("移除固定输出", "Remove pinned output")}
              </Button>
            </div>
          ))}
          <Space.Compact style={{ width: "100%" }}>
            <Select
              aria-label={t("固定输出节点", "Node to pin")}
              value={pinNode}
              options={Object.entries(flow.nodes)
                .filter(([, node]) => !controlTypes.has(node.class_type))
                .map(([id, node]) => ({ value: id, label: node.label || id }))}
              onChange={setPinNode}
              style={{ flex: 1 }}
            />
            <Button
              disabled={!pinNode}
              onClick={() => {
                if (pinNode)
                  setPins((previous) => ({
                    ...previous,
                    [pinNode]: previous[pinNode] || "[]",
                  }));
              }}
            >
              {t("添加固定输出", "Add pinned output")}
            </Button>
          </Space.Compact>
        </div>
      </div>
      <div className="ff-debug-cases">
        <strong>{t("命名测试案例", "Named test cases")}</strong>
        <Select
          aria-label={t("选择测试案例", "Choose a test case")}
          value={loadedSample?.id}
          placeholder={t("选择测试案例", "Choose a test case")}
          options={samples.map((sample) => ({
            value: sample.id,
            label: sample.name,
          }))}
          onChange={loadSample}
          style={{ minWidth: 180 }}
        />
        <Input
          aria-label={t("测试案例名称", "Test case name")}
          value={sampleName}
          onChange={(event: any) => setSampleName(event.target.value)}
          placeholder={t(
            "如 中文、English、混排或异常输入",
            "For example Chinese, English, mixed, or invalid input",
          )}
        />
        <Button onClick={saveSample}>
          {t("保存测试案例", "Save test case")}
        </Button>
        {loadedSample && (
          <Button
            onClick={() => {
              try {
                localStorage.removeItem(samplePrefix + loadedSample.id);
                setLoadedSample(null);
                refreshSamples();
              } catch (failure: any) {
                setStorageError(failure.message);
              }
            }}
          >
            {t("删除测试案例", "Delete test case")}
          </Button>
        )}
        {loadedSample && loadedSample.revision !== flow.revision && (
          <p className="ff-muted">
            {t(
              "案例来自修订 {old}，当前修订 {current}，运行前请核对字段和槽位。",
              "This case is from revision {old}. Current revision is {current}. Check fields and slots before running.",
              { old: loadedSample.revision, current: flow.revision ?? 0 },
            )}
          </p>
        )}
      </div>
    </section>
  );
}
