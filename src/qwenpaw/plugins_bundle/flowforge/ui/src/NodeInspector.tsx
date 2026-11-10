import { useWorkflowI18n } from "./i18n";
import React, { useEffect } from "react";
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
  diagnostics?: {
    field?: string;
    message: string;
    severity: string;
  }[];
  onUpdate: (n: InspectorNode) => void;
}) {
  const { t, locale } = useWorkflowI18n();
  const { Form, Input, Select, Typography, Divider, Collapse } = antd;
  const { Title: AntTitle, Text: AntText, Paragraph } = Typography;
  const data = (node.data || {}) as any;
  const classType = data.class_type || "ToolNode";
  const spec = nodeTypes.find((t) => t.class_type === classType);
  useEffect(() => {
    if (!focusedField) return;
    const output = focusedField.startsWith("outputs.");
    const field = focusedField.replace(/^(inputs|outputs)\./, "");
    const frame = requestAnimationFrame(() => {
      const exact = document.getElementById(
        `ff-${output ? "output" : "input"}-${node.id}-${field}`,
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
  }, [focusedField, node.id]);
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
        key: "output_var",
        label: t("输出变量名"),
      },
      React.createElement(Input, {
        value: data.control?.output || "",
        onChange: (e: any) => updateControl("output", e.target.value),
        placeholder: t("如：result"),
      }),
    ),
    React.createElement(
      Form.Item,
      {
        key: "mode",
        label: t("执行模式"),
      },
      React.createElement(Select, {
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
  return React.createElement(
    Form,
    {
      layout: "vertical",
    },
    spec?.available === false
      ? React.createElement(antd.Alert, {
          type: "warning",
          showIcon: true,
          message: t("此能力当前不可用"),
          description: t(spec.unavailable_reason || ""),
          style: {
            marginBottom: 16,
          },
        })
      : null,
    React.createElement(
      Form.Item,
      {
        label: t("节点 ID"),
      },
      React.createElement(Input, {
        value: node.id,
        disabled: true,
        style: {
          fontFamily: "monospace",
          fontSize: 11,
        },
      }),
    ),
    React.createElement(
      Form.Item,
      {
        label: t("节点类型"),
      },
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
      {
        label: t("显示标签"),
      },
      React.createElement(Input, {
        value: data.label || "",
        onChange: (e: any) => update("label", e.target.value),
        placeholder: t("节点显示名称"),
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
          t(spec.description),
        )
      : null,
    React.createElement(Divider, {
      style: {
        margin: "12px 0",
      },
    }),
    React.createElement(
      AntTitle,
      {
        level: 5,
      },
      t("输入参数"),
    ),
    ["LLMNode", "LLMCallNode"].includes(classType)
      ? React.createElement(antd.Alert, {
          type: "info",
          showIcon: true,
          message: t("模型由宿主提供"),
          description: React.createElement(
            React.Fragment,
            null,
            React.createElement(
              "div",
              null,
              t("运行专家：{agent}", "Run agent: {agent}", { agent: agentId }),
            ),
            t(
              "留空模型字段时继承运行专家及宿主的当前模型；填写 model 或 provider/model 可显式覆盖。实际模型与供应商会记录在运行详情中。",
            ),
          ),
          style: {
            marginBottom: 16,
          },
        })
      : null,
    (spec?.inputs_schema || []).length === 0
      ? React.createElement(
          AntText,
          {
            type: "secondary",
            style: {
              fontSize: 12,
            },
          },
          t("此节点类型没有定义输入参数"),
        )
      : (spec?.inputs_schema || []).map((field: any) =>
          React.createElement(SchemaField, {
            key: field.name,
            field,
            antd,
            api,
            agentId,
            classType,
            nodeId: node.id,
            scopeKey: `${flowId}:${node.id}`,
            sources: sourcesFor(field.name),
            diagnostics: diagnostics.filter(
              (item) =>
                item.field === `inputs.${field.name}` ||
                item.field?.startsWith(`inputs.${field.name}/`),
            ),
            value: (data.inputs || {})[field.name],
            onChange: (v: any) => updateInput(field.name, v),
          }),
        ),
    React.createElement(Divider, {
      style: {
        margin: "12px 0",
      },
    }),
    (spec?.outputs_schema || []).length > 0 &&
      React.createElement(
        "section",
        { "aria-label": t("输出字段", "Output fields") },
        React.createElement(
          AntTitle,
          { level: 5 },
          t("输出字段", "Output fields"),
        ),
        (spec?.outputs_schema || []).map((field: any) =>
          React.createElement(
            "div",
            {
              key: field.name,
              id: `ff-output-${node.id}-${field.name}`,
              tabIndex: -1,
              className: "ff-output-field",
              "data-focused": focusedField === `outputs.${field.name}`,
            },
            fieldLabel(field, locale),
            " · ",
            typeLabel(field.type, locale),
          ),
        ),
      ),
    React.createElement(Collapse, {
      ghost: true,
      defaultActiveKey: ["control"],
      items: [
        {
          key: "control",
          label: t("执行控制"),
          children: controlItems,
        },
      ],
    }),
  );
}
