# QwenPaw GenUI 最终移植与实施方案

> 状态：最终确认版，可直接实施
> 日期：2026-08-08
> 来源：/Users/lzw/Downloads/LeAgent-main
> 目标：增加 GenUI，同时保持 QwenPaw 上游可持续合并。
> 相关评审：docs/GENUI_MIGRATION_REVIEW.md

---

## 0. 最终结论

LeAgent 的 GenUI DSL、Schema、组件语义和渲染器值得复用，但不能按目录直接覆盖到 QwenPaw。
UGSci 已经是 QwenPaw 的领域增强 bundled plugin，拥有后端入口、前端 bundle、工具注册、提示词注入和发布同步链路。因此 GenUI 不再单独创建第二个插件，而是作为 UGSci 内部的独立 `genui` 能力模块交付。

最终采用：

1. GenUI 合并到现有 `ugsci` bundled plugin，插件 ID 仍为 `ugsci`。
2. 第一阶段只使用 QwenPaw 标准 ToolChunk → PLUGIN_CALL_OUTPUT → AgentScope Chat SDK 链路。
3. 不增加 ui_tree/ui_patch 私有 SSE。
4. 状态以服务端生成的 ui_id 和 revision 为核心，不以 messageId 为主键。
5. 通过 adapter 适配文件、主题、路由、Chat 和 Workspace。
6. 第一阶段只实现安全声明式组件，HtmlFrame、Three.js、摄像头和工作流动作后置。
7. 使用 feature flag、渠道检测、工具冲突检测和 GenUI 模块级构建检查保证可回滚、可关闭、可合并上游；最终前端产物仍随 UGSci UI bundle 发布。

目标是复用 LeAgent 的协议和产品能力，保留 QwenPaw 自己的运行时、消息模型和插件生命周期。

### 0.1 为什么合并到 UGSci，而不是新增插件

- `plugins/bundle/ugsci` 已经是当前发行版的主领域插件，具备后端入口、前端 UI bundle、工具注册、提示词注入、生命周期和同步脚本；复用这些能力可以少维护一套 manifest、安装状态和发布产物。
- GenUI 的主要使用场景是 UGSci 的油藏分析、数值模拟、研究结果和专家协作。把它放在 UGSci 内部，模型可以直接把领域工具结果渲染为 KPI、表格、图表和分析卡片。
- 不合并到 `ugsci_research`：该插件是研究模式/工具插件，生命周期和 UI 入口较窄，不应承担通用 Chat response slot、ToolCard 和跨领域渲染能力。
- 合并不等于耦合：GenUI 仍位于 `ugsci/genui` 和 `ugsci/ui/src/genui`，通过明确接口与 UGSci 其他模块隔离，可单独测试、关闭，未来也可低成本抽成独立插件。
- “独立 bundle”只表示 UGSci 前端内部的 lazy chunk 或构建模块，不表示新增插件 ID、manifest 或安装目录。

---

## 1. 范围

### 1.1 第一阶段目标

- 卡片、KPI、表格、列表、图表、图片和简单表单。
- GenUI 内联显示在聊天回复中。
- ToolCard 显示生成状态、错误和节点数量。
- 刷新页面后从历史消息恢复。
- Button/Input 只允许受控的 send_message。
- 暗色模式、中文文本、QwenPaw 工作区图片 URL 正常工作。
- 关闭 GenUI 后完全回退到 Markdown。

### 1.2 第一阶段不实现

- canvas_publish、独立 Canvas 工作区。
- 自定义 ui_tree/ui_patch SSE。
- 任意 HTML/JavaScript。
- Three.js、Model3D、LiveCamera。
- open_artifact、run_workflow、resume_workflow。
- 微信、钉钉、Slack 等非 Web 渠道的 GenUI。
- LeAgent Chat Store、Artifact Store、文件服务和路由。

### 1.3 成功链路

~~~text
用户请求 KPI 卡片
  → emit_ui_tree
  → 后端 normalize/validate
  → 普通 ToolChunk JSON 结果
  → QwenPaw 原有 SSE/SDK
  → GenUI ToolCard + response.append
  → 页面刷新后从 PLUGIN_CALL_OUTPUT 恢复
~~~

---

## 2. 总体架构

~~~text
QwenPaw core
  AgentBuilder / ToolRegistry / LocalWorkspace
  Envelope / Chat SSE / Message persistence
  PluginApi / ChatExtensions
             │ stable extension points
             ▼
UGSci bundled plugin
  existing: expert / skill / team / engine / simulation
  genui module: schema / tools / guide / prompt / feature gates
  genui UI: types / store / renderer / tool card / actions
             │ normal tool result
             ▼
PLUGIN_CALL → PLUGIN_CALL_OUTPUT → response.append → GenUiTreeView
~~~

运行时步骤：

1. Web Console 请求带上 genui_enabled，或服务端按渠道判断。
2. `ugsci` 插件仅在 GenUI 能力开启且渠道支持时注册 `emit_ui_tree`、`list_ui_components`、`get_genui_guide`。
3. 插件用 register_prompt_section 注入短版路由提示。
4. 工具解析、修复、规范化、校验并生成 ui_id。
5. 通过普通 ToolChunk 返回 JSON 文本，不改变 Envelope/SSE。
6. ToolCard 解析结果并写入 useGenUiStore。
7. response.append 根据 ui_id 渲染 GenUiInline。
8. 历史消息直接读取 PLUGIN_CALL_OUTPUT 的工具结果。

第一阶段不使用自定义 SSE。QwenPaw 的标准工具结果已由 runtime/envelope.py 处理。额外事件会与 AgentScope ResponseBuilder、重连和版本升级耦合。

---

## 3. 上游兼容边界

### 3.1 默认不修改的文件

- src/qwenpaw/runtime/envelope.py
- src/qwenpaw/app/channels/base.py
- console/src/pages/Chat/index.tsx
- console/src/pages/Chat/HostBubbles.tsx
- console/src/main.tsx
- console/vite.config.ts
- 现有 ToolCard

使用已有插件扩展点：

- 后端工具：src/qwenpaw/plugins/api.py 的 register_tool
- 后端提示词：src/qwenpaw/plugins/api.py 的 register_prompt_section
- 前端工具 renderer：console/src/plugins/registry/chatExtensions.ts
- 回复扩展槽：console/src/pages/Chat/HostBubbles.tsx

### 3.2 唯一允许的通用 core 扩展

若 AgentScope FunctionTool 生成的嵌套参数 Schema 不够用，增加通用 input_schema 能力：

~~~text
ToolDescriptor.input_schema: dict | None
@tool_descriptor(input_schema=...)
QwenPawLocalWorkspace.list_tools() 把 input_schema 传给工具包装器
~~~

该能力必须不包含 GenUI 名称判断，并有独立测试。

### 3.3 工具/能力冲突

插件启动时检查：

- 是否已有 emit_ui_tree。
- 是否已有原生 GenUI capability。
- 当前渠道是否 supports_genui。

规则：

| 情况 | 行为 |
|---|---|
| 没有原生 GenUI | 注册插件实现 |
| 已有原生 emit_ui_tree | 不重复注册，使用兼容 renderer |
| 同名但协议不同 | disabled，不覆盖上游 |
| 渠道不支持 | 不暴露工具，或返回 Markdown fallback |

### 3.4 UGSci 内部模块边界

GenUI 与 UGSci 共用一个插件包，但必须保持明确的模块边界：

- 插件身份、生命周期和发布入口统一使用 `ugsci`，不新增 `genui` plugin manifest、plugin ID 或独立安装目录。
- GenUI 后端放在 `plugins/bundle/ugsci/genui/`，只依赖 QwenPaw PluginApi、标准工具结果和显式配置；不得直接导入 UGSci team、engine、simulation 的私有状态。
- GenUI 前端放在 `plugins/bundle/ugsci/ui/src/genui/`，通过现有 UGSci UI 的 host runtime 注册 Chat 扩展；不得把 GenUI 组件散落到 expert、skill、team 页面。
- 插件内部注册名称使用 `ugsci.genui.*` 命名空间；工具对模型暴露的稳定名称仍为 `emit_ui_tree`、`list_ui_components`、`get_genui_guide`，以便未来协议兼容。
- GenUI 的 schema、renderer、store、action bus 必须可以在 UGSci 内部独立测试、独立关闭，并保留未来抽成通用插件的低成本路径。
- UGSci 其他能力不可反向依赖 GenUI；只有需要可视化输出的功能通过标准 `emit_ui_tree` 工具结果接入。

### 3.5 同步规则

- GenUI 代码与 UGSci 代码放在同一个插件提交序列中，但每个提交按 `genui:`、`ugsci:` 前缀区分模块，便于 cherry-pick 和回滚。
- 不替换 QwenPaw 上游文件，也不改变 UGSci 现有工具和路由的协议。
- 记录 LeAgent 来源 commit、Apache 2.0 许可证和修改点。
- 同步 LeAgent 只同步协议、Schema 和组件变化。
- 同步 QwenPaw upstream 主要解决插件目录冲突。

---

## 4. 协议

### 4.1 UI 树

~~~json
{
  "schemaVersion": "1",
  "root": {
    "nodeId": "root",
    "kind": "Stack",
    "props": {"gap": "md"},
    "children": [
      {
        "nodeId": "title",
        "kind": "Heading",
        "props": {"text": "销售概览", "level": 2}
      }
    ]
  }
}
~~~

规则：

- kind 是组件类型。
- props 放所有组件字段。
- children 只放节点数组。
- nodeId 后端补齐并校验。
- 后端只允许 catalog 中的 kind；前端未知 kind 显示安全占位。
- 默认最大深度 20、最大节点 500。
- 限制字符串、数组、媒体数量、图表点数和总 JSON 大小。

### 4.2 emit_ui_tree 结果

成功：

~~~json
{
  "ok": true,
  "kind": "genui",
  "schema_version": "1",
  "ui_id": "ui_01J...",
  "revision": 1,
  "tree": {"schemaVersion": "1", "root": {}},
  "tool_call_id": "call_..."
}
~~~

失败：

~~~json
{
  "ok": false,
  "kind": "genui_error",
  "error_code": "invalid_tree",
  "message": "root.children must be an array",
  "hint": "Call list_ui_components and retry."
}
~~~

失败也返回普通工具结果，不抛出破坏 AgentScope 流的异常。

### 4.3 状态键

- 第一次调用没有 ui_id 时后端生成。
- 已有 ui_id 必须属于当前 session。
- 前端主键为 sessionId::uiId。
- tool_call_id 关联工具调用。
- messageId 只作为展示锚点。

### 4.4 Patch（二期）

~~~json
{
  "ok": true,
  "kind": "genui_patch",
  "ui_id": "ui_01J...",
  "base_revision": 1,
  "revision": 2,
  "patches": [
    {"op": "replace", "path": "/root/children/0/props/text", "value": "更新"}
  ],
  "tree": {}
}
~~~

后端应用 Patch、重新校验、递增 revision，并返回完整 tree。旧 revision、重复 revision 和跨 session ui_id 一律拒绝或丢弃。

---

## 5. 后端实施

### 5.1 目录

~~~text
plugins/bundle/ugsci/
├── plugin.json                 # 现有 UGSci manifest，不新增插件 manifest
├── plugin.py                   # 现有入口，增加 _register_genui 编排
├── genui/
│   ├── README.md
│   ├── LICENSES/LEAGENT-APACHE-2.0.txt
│   ├── schema.py
│   ├── tools.py
│   ├── guide.py
│   ├── json_repair.py
│   ├── state.py
│   ├── prompt.py
│   └── registration.py
└── ui/
    ├── package.json             # 复用现有 UGSci UI bundle
    ├── src/genui/
    │   ├── types/genUi.ts
    │   ├── stores/genUi.ts
    │   ├── components/GenUiRegistry.tsx
    │   ├── components/GenUiInline.tsx
    │   ├── components/GenUiToolCall.tsx
    │   └── lib/
    └── dist/index.js            # 仍由 UGSci UI 构建产物统一发布
~~~

### 5.1.1 UGSci 入口改造

只在现有 `plugins/bundle/ugsci/plugin.py` 增加一个编排方法，不创建新的插件入口：

```python
class UGSciPlugin:
    def register(self, api) -> None:
        # 现有 UGSci 注册逻辑保持不变
        self._register_lifecycle_hooks(api)
        self._register_team(api)
        self._initialize_engines()
        self._register_simulation_tools(api)
        self._register_genui(api)

    def _register_genui(self, api) -> None:
        from .genui.registration import register_genui
        register_genui(api, plugin_id="ugsci")
```

`register_genui` 必须做到：

- 读取 `ugsci.genui.enabled`、渠道能力和上游原生 capability，再决定是否注册工具和 prompt。
- 使用现有 `api.register_tool`、`api.register_prompt_section` 以及前端 ChatExtensions，不修改 UGSci 现有团队/仿真工具的注册方式。
- 把所有返回的 disposable/registration 句柄交给 UGSci 生命周期管理；UGSci 卸载时统一清理。
- 注册失败只禁用 GenUI 模块并记录结构化日志，不影响 UGSci 其他能力启动。
- 上游已经提供兼容 `emit_ui_tree` 时，不注册同名工具，只注册必要的 renderer adapter。

### 5.2 Schema

来源：

~~~text
/Users/lzw/Downloads/LeAgent-main/backend/leagent/services/gen_ui/schema.py
~~~

移植：

- UI_TREE_SCHEMA、UI_PATCH_SCHEMA。
- component catalog。
- normalize_ui_tree、validate_ui_tree、validate_ui_patch。
- 节点数和深度限制。

必须删除 LeAgent 的 ServiceManager、CanvasService、ArtifactService 依赖，改为插件配置。jsonschema 必须声明为正式依赖，不能依赖测试环境。

默认配置：

~~~python
GENUI_MAX_TREE_DEPTH = 20
GENUI_MAX_NODES = 500
GENUI_MAX_JSON_CHARS = 32_000
GENUI_MAX_STRING_CHARS = 8_000
GENUI_MAX_TABLE_ROWS = 200
GENUI_MAX_CHART_POINTS = 2_000
~~~

### 5.3 工具

第一阶段：

~~~text
emit_ui_tree
list_ui_components
get_genui_guide
~~~

要求：

- internal、read-only、默认关闭。
- 工具返回 JSON 文本 TextBlock。
- 返回前完成 JSON repair、normalize、validate、quota check。
- 不执行 HTML、JS、URL、文件和工作流操作。
- 不使用 from __future__ import annotations，除非已验证运行时注解。

参数策略：

1. 首选 tree 为对象、patches 为数组，保持 LeAgent wire format。
2. JSON repair 兼容 JSON 字符串、代码围栏、尾逗号和截断。
3. M0 用测试固定 AgentScope 实际生成的 schema。
4. 若 schema 过于宽泛，增加通用 input_schema override，不把 GenUI 特判写入 FunctionTool。

### 5.4 状态服务（二期）

~~~python
class GenUiStateStore:
    async def create(self, session_id: str, tree: dict) -> GenUiSnapshot: ...
    async def get(self, session_id: str, ui_id: str) -> GenUiSnapshot | None: ...
    async def apply_patch(
        self, session_id: str, ui_id: str,
        base_revision: int, patches: list[dict],
    ) -> GenUiSnapshot: ...
~~~

第一期可用进程内 LRU；正式版本使用 workspace/session 数据库或 message metadata。

### 5.5 Prompt

通过 register_prompt_section 注入短版提示：

- Markdown 是默认格式。
- dashboard/card/chart/form 等真实视觉交互需求才使用 GenUI。
- 先调用 list_ui_components。
- 复杂树调用 get_genui_guide。
- 不支持渠道不要调用。
- 第一阶段只允许 send_message。

### 5.6 注册冲突处理

~~~python
if not genui_enabled_for_context(ctx):
    return

if tool_registry.get("emit_ui_tree") is not None:
    logger.info("native emit_ui_tree exists; plugin will not override it")
else:
    api.register_tool(...)
~~~

---

## 6. 前端实施

### 6.1 插件职责

UGSci 的 GenUI 模块负责 types、store、ToolCard、response.append、Registry、Action Bus、主题和文件 URL adapter。宿主只提供 React/antd、当前 session、发送消息、路由和文件预览能力；UGSci 的专家、技能和团队页面继续由各自模块负责。

### 6.2 Store

~~~ts
interface GenUiSnapshot {
  schemaVersion: '1';
  uiId: string;
  revision: number;
  tree: GenUiTreeV1;
  sessionId: string;
  messageId?: string;
  sourceToolCallId?: string;
  updatedAt: number;
}

interface GenUiState {
  snapshots: Record<string, GenUiSnapshot>;
  setSnapshot(snapshot: GenUiSnapshot): void;
  applyPatch(payload: UiPatchPayload): void;
  hydrateFromMessages(sessionId: string, messages: Message[]): void;
  clearSession(sessionId: string): void;
}
~~~

状态键固定为 sessionId::uiId，不能使用 messageId 作为唯一 key。

### 6.3 ToolCard

实现 BuiltinCardProps，显示运行状态、节点数、ui_id、revision 和验证错误。成功树的实际显示交给 response.append，避免重复渲染。

### 6.4 response.append

1. 遍历 ChatResponseData output。
2. 找到 emit_ui_tree 成功结果。
3. 解析 ui_id/tree。
4. 写入 store。
5. 按 tool call 顺序渲染 GenUiInline。
6. 同一 ui_id 只显示最新 revision。

### 6.5 历史恢复

读取 PLUGIN_CALL_OUTPUT 中 FunctionCallOutput.name 和 output：

- tree 结果调用 setSnapshot。
- patch 结果优先读取返回的完整 tree。
- 没有完整 tree 时按 revision 排序应用 Patch。
- 解析失败只记录日志。

若工具结果被上下文裁剪，增加独立 GenUI snapshot 持久化。

### 6.6 组件迁移分批

第一阶段：

~~~text
Stack / Row / Grid / Spacer
Text / Heading / Markdown / Divider
Card / Stat / Badge / Tag / Progress
Table / TableRow / TableCell / List / ListItem
Image / Chart
Button / Input / Select
~~~

第二阶段：

~~~text
Tabs / Accordion / Form / Switch / Slider / Textarea
ImageGallery / MetricCard / TimelineCard / KpiBoard
截图 / PDF 导出
~~~

第三阶段：

~~~text
HtmlFrame / ThreeJsFrame / Model3D / LiveCamera / SlideDeck
~~~

LeAgent 的 GenUiRegistry 约 1,300 行、相关目录约 29 个文件，必须按 adapter 拆分，不做整目录覆盖。

### 6.7 样式与依赖

- 插件独立编译 Tailwind utilities。
- 不修改主 Console Vite/Tailwind。
- 不引入 Preflight。
- 使用 .qwenpaw-genui wrapper 和宿主 theme variables。
- Chart 使用已有 @ant-design/plots。
- three、html-to-image、PDF 导出延迟加载。
- 复制 LeAgent 前先补齐 clsx/tailwind-merge 或改用 QwenPaw 自己的 class helper。

---

## 7. Action 与安全

第一阶段只允许真实用户点击触发的 send_message：

~~~json
{"type": "send_message", "payload": {"content": "请总结这张表"}}
~~~

后续再按 allowlist 开放 open_url、navigate、open_file、open_artifact、submit_form、run_workflow、resume_workflow，并复用 QwenPaw 现有权限和审批。

HtmlFrame 默认不提供；启用后必须 JS 默认关闭、使用 sandbox、CSP、大小限制、网络 allowlist，且禁止自动调用宿主 action。

---

## 8. 渠道与配置

~~~json
{
  "genui_enabled": false,
  "genui_channels": ["console"],
  "genui_allow_html": false,
  "genui_allow_actions": ["send_message"]
}
~~~

关闭时不注册工具、不注入 prompt、不加载前端 bundle，Markdown 完全不受影响。

---

## 9. 测试验收

### 9.1 后端

- 合法树、bare root、type→kind、props lift、nodeId 补齐。
- 深度、节点数、字符串、数组、媒体和 JSON 总大小限制。
- JSON 字符串、代码围栏、尾逗号、截断 JSON 修复。
- ui_id session 隔离。
- Patch revision 冲突。
- feature/channel gating。
- UGSci 卸载后的 toolkit 和 GenUI registration 清理。

### 9.2 前端

- setSnapshot、applyPatch、revision。
- 多树互不覆盖。
- V1 ToolCard 解析。
- 历史恢复。
- UnknownNode 安全展示。
- action payload 和 URL allowlist。
- UGSci 卸载无残留 GenUI registration。

### 9.3 集成

1. emit_ui_tree → ToolChunk → SSE → ToolCard → inline renderer。
2. 刷新页面恢复。
3. 重连不重复、不丢树。
4. 关闭 GenUI 后 Markdown 正常。
5. 非 Console 渠道不暴露工具。
6. 上游同名工具不覆盖。
7. 恶意 HTML 不影响主聊天流。

### 9.4 性能

- 首屏不加载 three、PDF 等重依赖。
- 500 节点树首次渲染目标低于 100ms。
- Patch 不触发整页重渲染。
- 超大 JSON 后端拒绝。
- UGSci 的 GenUI 模块关闭或卸载后，主 Console 不增加重依赖。

---

## 10. 里程碑

- M0 兼容性基线：1～2 天。
- M1 后端 Schema/工具：3～5 天。
- M2 前端基础渲染：5～8 天。
- M3 历史恢复和安全 action：3～5 天。
- M4 Patch 和高级组件：8～12 天。
- M5 HtmlFrame/3D/摄像头/工作流：单独排期。

基础 MVP 预计 12～20 个工作日，完整能力预计 25～35 个工作日。

---

## 11. 最终文件规划

~~~text
plugins/bundle/ugsci/plugin.json
plugins/bundle/ugsci/plugin.py
plugins/bundle/ugsci/genui/schema.py
plugins/bundle/ugsci/genui/tools.py
plugins/bundle/ugsci/genui/guide.py
plugins/bundle/ugsci/genui/json_repair.py
plugins/bundle/ugsci/genui/prompt.py
plugins/bundle/ugsci/genui/state.py
plugins/bundle/ugsci/genui/registration.py
plugins/bundle/ugsci/genui/LICENSES/LEAGENT-APACHE-2.0.txt
plugins/bundle/ugsci/ui/package.json
plugins/bundle/ugsci/ui/src/genui/types/genUi.ts
plugins/bundle/ugsci/ui/src/genui/stores/genUi.ts
plugins/bundle/ugsci/ui/src/genui/components/GenUiRegistry.tsx
plugins/bundle/ugsci/ui/src/genui/components/GenUiInline.tsx
plugins/bundle/ugsci/ui/src/genui/components/GenUiToolCall.tsx
plugins/bundle/ugsci/ui/src/genui/lib/genUiActionBus.ts
plugins/bundle/ugsci/ui/src/genui/lib/genUiMedia.ts
plugins/bundle/ugsci/ui/dist/index.js
~~~

只有 M0 证明需要时才新增通用 core：

~~~text
src/qwenpaw/runtime/tool_schema.py
tests/unit/runtime/test_tool_schema.py
~~~

不得在通用模块内出现 GenUI 名称特判。

---

## 12. 合并判定

- 主聊天 SSE 没有 GenUI 特判。
- 主 ChatPage/HostBubbles 没有 GenUI 业务逻辑，或只增加通用插件槽。
- UGSci 可卸载；卸载时其 GenUI registrations 一并 dispose。
- 无 GenUI 时 Markdown 和现有测试不受影响。
- Web 可生成和恢复 KPI、表格、图表、图片。
- 非 Web 渠道不会得到不可渲染的 GenUI 工具。
- 上游新增同名工具时不会被覆盖。
- LeAgent 代码有来源和许可证记录。

## 13. 原则摘要

~~~text
复用协议，不复制运行时。
复用组件，不复制宿主状态。
标准工具结果优先，不增加私有 SSE。
用 ui_id/revision 管状态，不用 messageId 猜状态。
插件优先，core 只增加通用扩展。
先做安全基础组件，再做 HTML/3D/工作流。
~~~
