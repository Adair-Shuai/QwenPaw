import { useWorkflowI18n } from "./i18n";
import React, {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ConditionFields } from "./ConditionFields";
import { SchemaField, type InputSource } from "./SchemaField";
import { fieldLabel, controlLabels, typeLabel } from "./fieldPresentation";
import type { Api, NodeTypeSpec } from "./model";
interface InspectorNode {
  id: string;
  data: Record<string, any>;
  position: {
    x: number;
    y: number;
  };
  type?: string;
}
interface InspectorEdge {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: Record<string, any>;
}
type InspectorTab = "inputs" | "bindings" | "outputs" | "control" | "general";

function fieldTab(
  field: string | null | undefined,
  classType: string,
): InspectorTab {
  if (field?.startsWith("outputs.") || field === "control.output")
    return "outputs";
  if (field?.startsWith("control.")) return "control";
  if (field && ["id", "class_type", "label"].includes(field)) return "general";
  if (
    ["LLMNode", "LLMCallNode"].includes(classType) &&
    ["inputs.response_format", "inputs.output_schema"].includes(
      field?.split("/")[0] || "",
    )
  )
    return "outputs";
  return "inputs";
}

export function NodeInspector({
  node,
  nodeTypes,
  availableNodes = [],
  edges = [],
  antd,
  api,
  agentId,
  flowId,
  focusedField,
  bindings,
  diagnostics = [],
  onUpdate,
}: {
  node: InspectorNode;
  nodeTypes: NodeTypeSpec[];
  availableNodes?: InspectorNode[];
  edges?: InspectorEdge[];
  antd: any;
  api: Api;
  agentId: string;
  flowId: string;
  focusedField?: string | null;
  bindings?: ReactNode;
  diagnostics?: {
    field?: string;
    message: string;
    severity: string;
  }[];
  onUpdate: (n: InspectorNode) => void;
}) {
  const { t, locale } = useWorkflowI18n();
  const { Form, Input, Select, Typography } = antd;
  const { Title: AntTitle, Text: AntText, Paragraph } = Typography;
  const data = (node.data || {}) as any;
  const classType = data.class_type || "ToolNode";
  const spec = nodeTypes.find((t) => t.class_type === classType);
  const tabId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<InspectorTab>(() =>
    fieldTab(focusedField, classType),
  );
  useEffect(() => {
    setActiveTab(fieldTab(focusedField, classType));
    root.current
      ?.querySelectorAll<HTMLElement>("[role=tabpanel]")
      .forEach((panel) => {
        panel.scrollTop = 0;
      });
  }, [node.id, flowId, agentId, classType, focusedField]);
  useEffect(() => {
    if (!focusedField || activeTab !== fieldTab(focusedField, classType))
      return;
    const output = focusedField.startsWith("outputs.");
    const control = focusedField.startsWith("control.");
    const field = focusedField.replace(/^(inputs|outputs|control)\./, "");
    const frame = requestAnimationFrame(() => {
      const exact = document.getElementById(
        `ff-${output ? "output" : control ? "control" : "input"}-${
          node.id
        }-${field}`,
      );
      const input =
        exact ||
        (!output && field.includes("/")
          ? document.getElementById(
              `ff-input-${node.id}-${field.split("/")[0]}`,
            )
          : null);
      if (!(input instanceof HTMLElement)) return;
      input.scrollIntoView?.({
        block: "nearest",
      });
      input.focus({
        preventScroll: true,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [focusedField, node.id, activeTab, classType]);
  const targetOptions = availableNodes
    .filter((entry) => entry.id !== node.id)
    .map((entry) => ({
      label: `${entry.data.label || entry.id} · ${entry.id}`,
      value: entry.id,
    }));
  const update = (key: string, value: any) => {
    onUpdate({
      ...node,
      data: {
        ...data,
        [key]: value,
      },
    });
  };
  const updateInput = (name: string, value: any) => {
    // Edges are authoritative even before the next document serialization.
    if (sourcesFor(name).length) return;
    update("inputs", {
      ...(data.inputs || {}),
      [name]: value,
    });
  };
  const updateControl = (key: string, value: any) => {
    update("control", {
      ...(data.control || {}),
      [key]: value,
    });
  };
  const sourcesFor = (field: string): InputSource[] => {
    const incoming = edges.filter(
      (edge) =>
        edge.target === node.id &&
        edge.targetHandle === field &&
        edge.data?.kind !== "control",
    );
    const source = (
      nodeId: string,
      handle?: string | null,
      slot = 0,
    ): InputSource => {
      const upstream = availableNodes.find((entry) => entry.id === nodeId);
      const schema = upstream?.data.outputs_schema || [];
      const output = handle
        ? schema.find((item: any) => item.name === handle)
        : schema[slot];
      return {
        nodeId,
        nodeLabel: String(
          upstream?.data.label || upstream?.data._displayLabel || nodeId,
        ),
        output: output
          ? fieldLabel(output, locale)
          : handle ||
            t("输出 {v0}", {
              v0: slot + 1,
            }),
        missing: !upstream || (Boolean(handle) && !output),
      };
    };
    if (incoming.length)
      return incoming.map((edge) =>
        source(
          edge.source,
          edge.sourceHandle,
          Number(edge.data?.source_slot || 0),
        ),
      );
    const value = data.inputs?.[field];
    if (
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === "string" &&
      Number.isInteger(value[1])
    )
      return [source(value[0], undefined, value[1])];
    return [];
  };
  const controlItems: any[] = [
    React.createElement(
      Form.Item,
      {
        key: "retry_count",
        label: t("重试次数"),
        help: t("0 表示不重试；只对允许重试的失败生效。"),
      },
      React.createElement(antd.InputNumber, {
        id: `ff-control-${node.id}-max_retries`,
        "aria-label": t(controlLabels["max_retries"] || "重试次数"),
        value: data.control?.max_retries ?? data.control?.retry_count ?? 0,
        onChange: (v: any) => updateControl("max_retries", v ?? 0),
        min: 0,
        max: 10,
        style: {
          width: "100%",
        },
      }),
    ),
    React.createElement(
      Form.Item,
      {
        key: "retry_delay",
        label: t("重试延迟（秒）"),
        help: t("首次重试的等待时间，后续使用指数退避。"),
      },
      React.createElement(antd.InputNumber, {
        id: `ff-control-${node.id}-retry_delay_sec`,
        "aria-label": t(controlLabels["retry_delay_sec"] || "重试延迟（秒）"),
        value: data.control?.retry_delay_sec ?? 1,
        onChange: (v: any) => updateControl("retry_delay_sec", v ?? 1),
        min: 0,
        step: 0.5,
        style: {
          width: "100%",
        },
      }),
    ),
    React.createElement(
      Form.Item,
      {
        key: "mode",
        label: t("执行模式"),
      },
      React.createElement(Select, {
        id: `ff-control-${node.id}-mode`,
        "aria-label": t(controlLabels["mode"] || "执行模式"),
        value: data.control?.mode || "run",
        onChange: (v: any) => updateControl("mode", v),
        options: [
          {
            label: t("正常运行 (run)"),
            value: "run",
          },
          {
            label: t("静默跳过 (mute)"),
            value: "mute",
          },
          {
            label: t("直通上游 (bypass)"),
            value: "bypass",
          },
        ],
      }),
    ),
  ];
  controlItems.push(
    React.createElement(
      Form.Item,
      {
        key: "timeout_sec",
        label: t("节点超时（秒）"),
        help: t("留空沿用运行时限制；填写时必须大于 0。"),
      },
      React.createElement(antd.InputNumber, {
        id: `ff-control-${node.id}-timeout_sec`,
        "aria-label": t(controlLabels["timeout_sec"] || "节点超时（秒）"),
        value: data.control?.timeout_sec,
        min: 0.1,
        placeholder: t("使用默认超时"),
        style: {
          width: "100%",
        },
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
          {
            key: field,
            label: t(controlLabels[field] || field),
          },
          React.createElement(antd.Input.TextArea, {
            id: `ff-control-${node.id}-${field}`,
            "aria-label": t(controlLabels[field] || field),
            value: rendered,
            autoSize: {
              minRows: 4,
              maxRows: 12,
            },
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
          {
            key: field,
            label: t(controlLabels[field] || field),
          },
          React.createElement(Select, {
            id: `ff-control-${node.id}-${field}`,
            "aria-label": t(controlLabels[field] || field),
            value: data.control?.[field] || undefined,
            options: targetOptions,
            allowClear: true,
            onChange: (value: any) => updateControl(field, value),
            placeholder: t("选择目标节点"),
            showSearch: true,
            optionFilterProp: "label",
          }),
        ),
      );
    }
  }
  const fields = spec?.inputs_schema || [];
  const inputFields = fields.filter(
    (field) => fieldTab(`inputs.${field.name}`, classType) === "inputs",
  );
  const outputFields = fields.filter(
    (field) => fieldTab(`inputs.${field.name}`, classType) === "outputs",
  );
  const renderField = (field: NodeTypeSpec["inputs_schema"][number]) => (
    <SchemaField
      key={field.name}
      field={field}
      antd={antd}
      api={api}
      agentId={agentId}
      classType={classType}
      nodeId={node.id}
      scopeKey={`${flowId}:${node.id}`}
      sources={sourcesFor(field.name)}
      diagnostics={diagnostics.filter(
        (item) =>
          item.field === `inputs.${field.name}` ||
          item.field?.startsWith(`inputs.${field.name}/`),
      )}
      value={(data.inputs || {})[field.name]}
      onChange={(value) => updateInput(field.name, value)}
    />
  );
  const tabs: { key: InspectorTab; label: string; children: ReactNode }[] = [
    {
      key: "inputs",
      label: t("参数", "Inputs"),
      children: (
        <>
          <AntTitle level={5}>{t("输入参数")}</AntTitle>
          {["LLMNode", "LLMCallNode"].includes(classType) && (
            <antd.Alert
              type="info"
              showIcon
              message={t("模型由宿主提供")}
              description={
                <>
                  <div>
                    {t("运行专家：{agent}", "Run agent: {agent}", {
                      agent: agentId,
                    })}
                  </div>
                  {t(
                    "留空模型字段时继承运行专家及宿主的当前模型；填写 model 或 provider/model 可显式覆盖。实际模型与供应商会记录在运行详情中。",
                  )}
                </>
              }
              style={{ marginBottom: 16 }}
            />
          )}
          {inputFields.length ? (
            inputFields.map(renderField)
          ) : (
            <AntText type="secondary">
              {t("此节点类型没有定义输入参数")}
            </AntText>
          )}
        </>
      ),
    },
    ...(bindings
      ? [
          {
            key: "bindings" as const,
            label: t("数据", "Data"),
            children: bindings,
          },
        ]
      : []),
    {
      key: "outputs",
      label: t("输出", "Outputs"),
      children: (
        <>
          <AntTitle level={5}>{t("输出配置", "Output settings")}</AntTitle>
          {outputFields.map(renderField)}
          <Form.Item
            label={t("输出变量名")}
            htmlFor={`ff-control-${node.id}-output`}
          >
            <Input
              id={`ff-control-${node.id}-output`}
              value={data.control?.output || ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateControl("output", event.target.value)
              }
              placeholder={t("如：result")}
            />
          </Form.Item>
          <section aria-label={t("输出字段", "Output fields")}>
            <AntTitle level={5}>{t("输出字段", "Output fields")}</AntTitle>
            {(spec?.outputs_schema || []).length ? (
              spec!.outputs_schema.map((field) => (
                <div
                  key={field.name}
                  id={`ff-output-${node.id}-${field.name}`}
                  tabIndex={-1}
                  className="ff-output-field"
                  data-focused={focusedField === `outputs.${field.name}`}
                >
                  {fieldLabel(field, locale)} · {typeLabel(field.type, locale)}
                </div>
              ))
            ) : (
              <AntText type="secondary">
                {t(
                  "此节点类型没有定义输出字段",
                  "This node type has no output fields",
                )}
              </AntText>
            )}
          </section>
        </>
      ),
    },
    {
      key: "control",
      label: t("执行", "Run"),
      children: (
        <>
          <AntTitle level={5}>{t("执行控制")}</AntTitle>
          {controlItems}
        </>
      ),
    },
    {
      key: "general",
      label: t("基础", "Info"),
      children: (
        <>
          <AntTitle level={5}>{t("基本信息", "Basic information")}</AntTitle>
          <Form.Item label={t("节点 ID")} htmlFor={`ff-input-${node.id}-id`}>
            <Input
              id={`ff-input-${node.id}-id`}
              value={node.id}
              disabled
              style={{ fontFamily: "monospace", fontSize: 11 }}
            />
          </Form.Item>
          <Form.Item
            label={t("节点类型")}
            htmlFor={`ff-input-${node.id}-class_type`}
          >
            <Select
              id={`ff-input-${node.id}-class_type`}
              value={classType}
              onChange={(value: string) => update("class_type", value)}
              options={nodeTypes.map((type) => ({
                label: type.display_name,
                value: type.class_type,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            label={t("显示标签")}
            htmlFor={`ff-input-${node.id}-label`}
          >
            <Input
              id={`ff-input-${node.id}-label`}
              value={data.label || ""}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                update("label", event.target.value)
              }
              placeholder={t("节点显示名称")}
            />
          </Form.Item>
          {spec?.description && (
            <Paragraph type="secondary">{t(spec.description)}</Paragraph>
          )}
        </>
      ),
    },
  ];
  return (
    <div className="ff-node-inspector" ref={root}>
      <div
        className="ff-inspector-tabs"
        role="tablist"
        aria-label={t("节点配置分类", "Node configuration sections")}
      >
        {tabs.map((tab, index) => {
          const errors = diagnostics.filter(
            (item) =>
              item.severity === "error" &&
              fieldTab(item.field, classType) === tab.key,
          ).length;
          return (
            <button
              type="button"
              role="tab"
              key={tab.key}
              id={`${tabId}-tab-${tab.key}`}
              aria-controls={`${tabId}-panel-${tab.key}`}
              aria-selected={activeTab === tab.key}
              tabIndex={activeTab === tab.key ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
              onKeyDown={(event) => {
                let next: number;
                if (event.key === "ArrowRight")
                  next = (index + 1) % tabs.length;
                else if (event.key === "ArrowLeft")
                  next = (index + tabs.length - 1) % tabs.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = tabs.length - 1;
                else return;
                event.preventDefault();
                setActiveTab(tabs[next].key);
                document
                  .getElementById(`${tabId}-tab-${tabs[next].key}`)
                  ?.focus();
              }}
            >
              {tab.label}
              {errors > 0 && (
                <span
                  className="ff-inspector-tab-error"
                  aria-label={t("{count} 个错误", "{count} errors", {
                    count: errors,
                  })}
                >
                  {errors}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Keep fields mounted so incomplete JSON and expression drafts survive tab changes. */}
      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`${tabId}-panel-${tab.key}`}
          aria-labelledby={`${tabId}-tab-${tab.key}`}
          className="ff-inspector-tabpanel"
          hidden={activeTab !== tab.key}
          tabIndex={0}
        >
          {spec?.available === false && (
            <antd.Alert
              type="warning"
              showIcon
              message={t("此能力当前不可用")}
              description={t(spec.unavailable_reason || "")}
              style={{ marginBottom: 16 }}
            />
          )}
          <Form layout="vertical">{tab.children}</Form>
        </div>
      ))}
    </div>
  );
}
