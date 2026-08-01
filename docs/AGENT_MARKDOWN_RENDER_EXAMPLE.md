---
title: Agent Reply Markdown Preview
reply_id: reply_demo_001
created_at: 2026-08-01T14:30:00+08:00
format_version: 1
---

<style>
.agent-reply-preview {
  max-width: 860px;
  margin: 0 auto;
  line-height: 1.68;
}
.agent-thought {
  margin: 18px 0;
  padding: 14px 16px;
  border-left: 4px solid #7c8db5;
  background: #f6f8fc;
  color: #34405a;
}
.agent-status {
  margin: 16px 0;
  padding: 10px 14px;
  border-left: 4px solid #5c9f78;
  background: #f4faf6;
  color: #294836;
}
.agent-tool {
  margin: 16px 0;
  padding: 10px 14px;
  border: 1px solid #d7dce7;
  border-radius: 8px;
  background: #fbfcff;
}
.agent-tool summary {
  cursor: pointer;
  color: #2f3a50;
}
.agent-error {
  margin: 16px 0;
  padding: 12px 14px;
  border-left: 4px solid #c45b4d;
  background: #fff7f5;
  color: #683027;
}
</style>

<article class="agent-reply-preview">

# Agent Reply Markdown Preview

我会把 Markdown 导出规则调整为单条回复模型。一次回复可以包含多个片段，但最终保存时应该归档到同一个文件里。

建议结构不要过度依赖标题词，而是用不同块来表达语义：

- 正式回复直接作为正文呈现。
- 可展示思考用浅色引用块呈现，默认展开。
- 运行状态用更轻的提示块呈现。
- 工具调用和结果放进可展开块。
- 错误摘要直接显示，详细信息折叠。

<blockquote class="agent-thought">
当前导出对象是一条 agent 回复，而不是完整 conversation。所以保存结构应该围绕“这一次回复”展开。正文负责阅读，思考摘要解释决策，工具记录保留调试线索。
<br><br>
这里保存的是摘要版思考，不是完整内部推理链。用户可以直接看到 agent 的判断依据，但不会被大量过程文本打断。
</blockquote>

<aside class="agent-status">
正在检查项目里的 Markdown 导出逻辑，并准备把工具调用从正文中拆出来。
</aside>

<details class="agent-tool">
<summary><code>shell.exec_command</code> · completed · 128 ms</summary>

```json
{
  "tool_call_id": "tool_001",
  "tool_name": "shell.exec_command",
  "status": "completed",
  "args": {
    "cmd": "rg \"markdown|export|preview|agent\" src docs",
    "cwd": "/Users/lzw/Documents/QwenPaw"
  }
}
```

```text
src/qwenpaw/export/markdown.ts
src/qwenpaw/events/types.ts
docs/AGENT_MARKDOWN_RENDER_EXAMPLE.md
```

</details>

<aside class="agent-error">
<strong>工具执行超时。</strong>
预览时只展示这类错误摘要；完整日志可以继续放在折叠块里，或者保存为单独附件。
</aside>

<details class="agent-tool">
<summary>error metadata</summary>

```json
{
  "event_id": "evt_error_001",
  "reply_id": "reply_demo_001",
  "source": "tool_result",
  "tool_call_id": "tool_002",
  "tool_name": "shell.exec_command",
  "status": "failed",
  "duration_ms": 30000,
  "message": "Command timed out"
}
```

</details>

## Minimal Data Shape

```ts
type AgentReplyMarkdownRecord = {
  replyId: string;
  createdAt: string;
  markdown: string;
  blocks: Array<
    | { kind: "content"; markdown: string }
    | { kind: "thought"; markdown: string }
    | { kind: "status"; markdown: string }
    | { kind: "tool"; name: string; input: unknown; output?: string; status: string }
    | { kind: "error"; markdown: string; detail?: unknown }
  >;
};
```

## Render Rule

单条回复导出时，可以只保留一个主标题。正文、思考、状态、工具、错误通过块样式区分，不需要反复显示类型标题。

</article>
