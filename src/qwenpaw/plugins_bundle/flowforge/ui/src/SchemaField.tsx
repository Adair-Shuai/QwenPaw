import { useWorkflowI18n } from "./i18n";
import React from "react";
import { AgentField } from "./AgentField";
import { fieldLabel, typeLabel } from "./fieldPresentation";
import type { Api } from "./model";
export interface InputSource {
  nodeId: string;
  nodeLabel: string;
  output: string;
  missing?: boolean;
}

/** Shared schema rendering; data bindings are handled before literal controls. */
export function SchemaField({
  field,
  value,
  onChange,
  antd,
  classType,
  api,
  agentId,
  scopeKey,
  nodeId,
  sources = [],
  diagnostics = [],
}: {
  field: any;
  value: any;
  onChange: (value: any) => void;
  antd: any;
  classType: string;
  api: Api;
  agentId: string;
  scopeKey: string;
  nodeId: string;
  sources?: InputSource[];
  diagnostics?: {
    message: string;
    severity: string;
  }[];
}) {
  const { t, locale } = useWorkflowI18n();
  const { Form, Input, InputNumber, Select, Switch } = antd;
  const type = String(field.type || "any").toLowerCase();
  const name = String(field.name);
  const label = fieldLabel(field, locale);
  const id = `ff-input-${nodeId}-${name}`;
  const description = t(field.description || field.info || "");
  const common = {
    id,
    "aria-label": label,
  };
  let control: React.ReactNode;
  let help: React.ReactNode =
    description ||
    `${typeLabel(type, locale)}${field.required ? t(" · 必填") : t(" · 选填")}`;
  if (sources.length) {
    control = (
      <Input
        {...common}
        disabled
        value={sources
          .map(
            (source) =>
              `${source.nodeLabel} → ${source.output}${
                source.missing ? t("（来源已失效）") : ""
              }`,
          )
          .join("；")}
      />
    );
    help = t(
      "此参数由上游连线提供。请先断开该输入的连线，再填写固定值；修改其他配置不会覆盖此连接。",
    );
  } else if (
    typeof value === "string" &&
    value.includes("${") &&
    ["number", "int", "float", "integer", "boolean", "bool"].includes(type)
  ) {
    control = (
      <Input.TextArea
        {...common}
        value={value}
        onChange={(event: any) => onChange(event.target.value)}
        autoSize={{ minRows: 2, maxRows: 8 }}
      />
    );
    help = t(
      "变量表达式将在运行时解析，并按输入类型验证。",
      "This variable expression is resolved and checked against the input type at runtime.",
    );
  } else if (classType === "AgentNode" && name === "agent_id") {
    control = (
      <AgentField
        {...common}
        value={value}
        onChange={onChange}
        api={api}
        antd={antd}
        agentId={agentId}
        scopeKey={scopeKey}
      />
    );
    help = t("使用宿主中已配置的智能体及其模型、工具和权限。");
  } else if (
    ["LLMNode", "LLMCallNode"].includes(classType) &&
    name === "model"
  ) {
    control = (
      <Input
        {...common}
        value={value ?? field.default ?? ""}
        onChange={(event: any) => onChange(event.target.value)}
        placeholder={t(
          "留空继承；或填写 provider/model",
          "Inherit, or enter provider/model",
        )}
      />
    );
    help = t(
      "留空继承运行专家的模型。model 使用当前供应商，provider/model 同时指定供应商与模型。",
      "Leave empty to inherit the run agent's model. A model ID uses its current provider; provider/model overrides both.",
    );
  } else if (["number", "int", "float", "integer"].includes(type)) {
    control = (
      <InputNumber
        {...common}
        value={value ?? field.default}
        onChange={onChange}
        min={field.min}
        max={field.max}
        precision={["int", "integer"].includes(type) ? 0 : undefined}
        placeholder={typeLabel(type, locale)}
        style={{
          width: "100%",
        }}
      />
    );
  } else if (["boolean", "bool"].includes(type)) {
    control = (
      <Switch
        {...common}
        checked={!!(value ?? field.default)}
        onChange={onChange}
      />
    );
  } else if (
    ["select", "enum"].includes(type) ||
    (Array.isArray(field.options) && field.options.length > 0)
  ) {
    const responseFormat =
      classType === "LLMCallNode" && name === "response_format";
    const options = (field.options || []).map((option: any) =>
      typeof option === "object" && option !== null
        ? {
            label: option.label ?? option.value,
            value: option.value,
          }
        : {
            label: String(option),
            value: option,
          },
    );
    if (responseFormat) {
      for (const option of options) {
        if (option.value === "text") option.label = t("文本", "Text");
        if (option.value === "json_schema")
          option.label = t("JSON Schema 校验", "JSON Schema validation");
      }
      help = t(
        "文本模式保留原始响应。JSON Schema 模式向模型提供结构要求，并在返回后严格解析与校验。",
        "Text preserves the original response. JSON Schema provides the schema to the model, then strictly parses and validates the response.",
      );
    }
    control = (
      <Select
        {...common}
        value={value ?? field.default}
        options={options}
        onChange={onChange}
        allowClear
        placeholder={t("请选择")}
      />
    );
  } else if (
    ["object", "array"].includes(type) ||
    (["any", "*"].includes(type) && value !== null && typeof value === "object")
  ) {
    control = (
      <Input.TextArea
        {...common}
        value={
          typeof value === "string"
            ? value
            : JSON.stringify(
                value ?? field.default ?? (type === "array" ? [] : {}),
                null,
                2,
              )
        }
        autoSize={{
          minRows: 3,
          maxRows: 10,
        }}
        onChange={(event: any) => {
          try {
            onChange(JSON.parse(event.target.value));
          } catch {
            onChange(event.target.value);
          }
        }}
        placeholder={type === "array" ? "[]" : "{}"}
      />
    );
    help =
      description ||
      t("使用 JSON 编辑结构化数据；格式不完整的草稿会保留，运行前需修正。");
    if (classType === "LLMCallNode" && name === "output_schema") {
      help = t(
        "填写 JSON Schema。支持本地 $defs 与 $ref，模型返回值通过校验后从结构化结果端口输出。",
        "Enter a JSON Schema. Local $defs and $ref are supported. Validated values are available on the structured result output.",
      );
    }
  } else if (["file", "image", "video", "audio"].includes(type)) {
    control = (
      <Input
        {...common}
        value={typeof value === "string" ? value : value?.path || ""}
        onChange={(event: any) => onChange(event.target.value)}
        placeholder={t("文件路径 / 资源 URI")}
      />
    );
    help = t("填写运行环境可访问的文件路径或已上传的资源引用");
  } else if (
    field.multiline ||
    ["textarea", "multiline"].includes(type) ||
    [
      "query",
      "prompt",
      "system",
      "system_prompt",
      "instruction",
      "instructions",
      "code",
      "script",
    ].includes(name)
  ) {
    control = (
      <Input.TextArea
        {...common}
        value={value ?? field.default ?? ""}
        onChange={(event: any) => onChange(event.target.value)}
        placeholder={
          name === "query"
            ? t("描述该智能体要完成的任务；上游材料可连接到“上游上下文”")
            : t("填写{v0}", {
                v0: label,
              })
        }
        autoSize={{
          minRows: 3,
          maxRows: 10,
        }}
      />
    );
  } else {
    control = (
      <Input
        {...common}
        value={value ?? field.default ?? ""}
        onChange={(event: any) => onChange(event.target.value)}
        placeholder={t("填写{v0}", {
          v0: label,
        })}
      />
    );
  }
  return (
    <div data-field-name={name}>
      <Form.Item
        label={label}
        htmlFor={id}
        required={field.required}
        help={
          diagnostics.length ? (
            <>
              <div role="alert">
                {diagnostics.map((item) => item.message).join("；")}
              </div>
              {help}
            </>
          ) : (
            help
          )
        }
        validateStatus={
          diagnostics.some((item) => item.severity === "error")
            ? "error"
            : diagnostics.length
            ? "warning"
            : undefined
        }
      >
        {control}
      </Form.Item>
    </div>
  );
}
