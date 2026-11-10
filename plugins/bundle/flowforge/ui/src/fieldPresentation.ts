import { translateWorkflow, workflowLocale } from "./i18n";

/** Presentation metadata is independent from schema names and saved values. */
const labels: Record<string, string> = {
  agent_id: "执行智能体",
  query: "任务指令",
  context: "上游上下文",
  prompt: "提示词",
  system: "系统提示词",
  system_prompt: "系统提示词",
  instruction: "执行指令",
  instructions: "执行指令",
  tool_name: "工具名称",
  tool: "工具名称",
  args: "工具参数",
  arguments: "工具参数",
  name: "参数名称",
  value: "数据值",
  text: "文本",
  reply: "智能体回复",
  response: "模型回复",
  result: "执行结果",
  output: "输出结果",
  input: "输入数据",
  data: "数据",
  code: "代码",
  script: "脚本",
  expression: "转换表达式",
  transform: "转换表达式",
  mapping: "字段映射",
  workflow_id: "子工作流",
  flow_id: "子工作流",
  inputs: "输入参数",
  score: "实际评分",
  threshold: "通过阈值",
  max_iterations: "额外迭代次数",
  message: "提示信息",
  seconds: "等待时长（秒）",
  duration: "等待时长（秒）",
  timeout: "超时时长",
  temperature: "生成温度",
  max_tokens: "最大输出 token 数",
  response_format: "响应格式",
  output_schema: "输出 JSON Schema",
  parsed: "结构化结果",
  content: "响应文本",
  path: "文件路径",
  format: "输出格式",
  approved: "审核通过",
  comments: "审核意见",
  model: "覆盖模型",
  source: "脚本源码",
  allow_modules: "允许导入的模块",
  timeout_sec: "超时时长（秒）",
  emit_locals: "返回局部变量",
  stdout: "标准输出",
  stderr: "标准错误",
};

export function fieldLabel(
  field: {
    name?: string;
    display_name?: string;
    label?: string;
    title?: string;
  },
  locale: string = workflowLocale(),
): string {
  return translateWorkflow(
    field.display_name ||
      field.label ||
      field.title ||
      labels[field.name || ""] ||
      field.name ||
      "参数",
    locale,
  );
}

export function typeLabel(
  type: unknown,
  locale: string = workflowLocale(),
): string {
  const name = String(type || "any").toLowerCase();
  return translateWorkflow(
    (
      {
        string: "文本",
        str: "文本",
        text: "文本",
        textarea: "多行文本",
        multiline: "多行文本",
        number: "数值",
        float: "数值",
        int: "整数",
        integer: "整数",
        bool: "布尔值",
        boolean: "布尔值",
        object: "对象",
        array: "数组",
        any: "任意类型",
        "*": "任意类型",
        file: "文件",
        image: "图片",
        video: "视频",
        audio: "音频",
        enum: "选项",
        select: "选项",
      } as Record<string, string>
    )[name] || name,
    locale,
  );
}

export const controlLabels: Record<string, string> = {
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

export function controlLabel(
  name: string,
  locale: string = workflowLocale(),
): string {
  return /^condition:\d+$/.test(name)
    ? translateWorkflow(
        "条件分支 {number}",
        locale,
        "Condition branch {number}",
        { number: Number(name.split(":")[1]) + 1 },
      )
    : translateWorkflow(controlLabels[name] || name, locale);
}
