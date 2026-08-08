# QwenPaw GenUI 最终设计评审与实施检查清单

> 状态：最终确认版
> 日期：2026-08-08
> 适用方案：docs/GENUI_MIGRATION_PLAN.md
> 用途：约束实现、Code Review、阶段验收和上游同步。
> 注意：本文件不再保留旧方案问题清单；以下决策均为最终实施约束。

---

## 1. 最终评审结论

方案可以实施，但必须采用现有 UGSci bundled plugin 内的 GenUI 模块 + 标准工具结果 + ui_id/revision 的架构。UGSci 是交付边界，GenUI 是可独立测试和关闭的内部能力模块，不新增第二个插件。

允许复用 LeAgent：

- GenUI DSL 和 Schema。
- component catalog。
- normalize/validate。
- JSON repair。
- GenUiRegistry 的组件语义。
- Action Bus 的数据结构和安全校验思路。
- 已有测试样例。

禁止直接复用 LeAgent：

- Chat Store 和消息 ID 模型。
- companion_sse_events。
- Artifact Store、CanvasService、文件服务。
- 默认启用 JavaScript 的 HtmlFrame 行为。
- Workflow、router 和 project runtime。
- Tailwind 全局构建配置。
- 以 messageId 为唯一 key 的 store。

评审通过的核心方案：

~~~text
emit_ui_tree
  → 标准 ToolChunk JSON
  → QwenPaw 原生 Envelope/SSE/SDK
  → plugin ToolCard
  → response.append
  → GenUiInline
~~~

---

## 2. 约束性设计决策

### D1：GenUI 必须合并到 UGSci bundled plugin

状态：必须。

原因：

- UGSci 已有后端入口 `plugins/bundle/ugsci/plugin.py`、独立 UI bundle、工具/路由/生命周期注册和发布同步脚本。
- 新增独立 GenUI 插件会增加 manifest、安装、构建、版本和冲突管理成本；合并到 UGSci 可以复用既有发布链路。
- GenUI 仍然必须保持 `ugsci/genui` 和 `ui/src/genui` 的模块级边界，不能把领域页面和通用渲染器耦合。
- UGSci 可卸载、可关闭，GenUI registrations 随 UGSci 一起 dispose；上游后续提供原生 GenUI 时可以只停用 UGSci 的 GenUI 模块。
- Tailwind 和重依赖可以留在独立 bundle。

这里的“独立 bundle”仅指 UGSci 前端内部的代码分包或懒加载；不得据此创建第二个插件、manifest、安装目录或独立生命周期。

验收：

- 删除 `plugins/bundle/ugsci` 后，QwenPaw 可以正常构建和运行（UGSci 整体卸载语义保持现有行为）。
- 主聊天逻辑没有 emit_ui_tree 名称判断。
- UGSci 卸载后 GenUI ToolCard、response.append 和相关工具 registration 被 dispose。
- 关闭 `ugsci.genui.enabled` 时，UGSci 其他专家、技能、团队和仿真能力不受影响。

实施目录约束：

```text
plugins/bundle/ugsci/genui/
plugins/bundle/ugsci/ui/src/genui/
```

不得创建 `plugins/bundle/genui` 或第二个 `genui` plugin manifest。

### D2：第一阶段禁止私有 SSE

状态：必须。

废弃方案：

~~~text
后端发送 {"type":"ui_tree"}
前端 TransformStream 拦截并剥离
~~~

原因：

- AgentScope ResponseBuilder 不接受没有 object 的事件。
- 每个 fetch/reconnect 入口都要包装，易遗漏。
- 工具结果与 ui_tree 事件形成两条真相来源。
- 历史恢复和重放顺序更复杂。
- 上游 SDK 变化会扩大维护成本。

允许的未来扩展：

只有在标准工具结果无法满足真实的流式 UI 需求时，才提议通用 extension_event 协议；它必须独立于 GenUI，并由 core 和 SDK 共同支持。

验收：

- runtime/envelope.py 无 GenUI 特判。
- app/channels/base.py 无 ui_tree/ui_patch。
- console Chat fetch 链路无 wrapGenUiSseStream。

### D3：工具结果是持久化真相来源

状态：必须。

emit_ui_tree 的普通工具结果包含：

- ok。
- kind。
- schema_version。
- ui_id。
- revision。
- tree。
- 可选 tool_call_id。

历史恢复从 PLUGIN_CALL_OUTPUT 读取，不依赖前端临时事件。

验收：

- 页面刷新后只靠服务器历史消息即可恢复。
- ToolCard 和 response.append 使用同一解析函数。
- JSON 解析失败不会中断聊天。

### D4：ui_id 是状态主键

状态：必须。

禁止：

~~~text
trees[sessionId::messageId]
~~~

要求：

~~~text
snapshots[sessionId::uiId]
~~~

原因：

- 请求开始时前端不知道服务端最终 messageId。
- 一条回复可能包含多棵树。
- Patch 必须稳定定位目标。
- messageId 在重放或迁移时可能变化。

验收：

- 同一 message 下两棵树互不覆盖。
- 同一 ui_id 的新 revision 替换旧 revision。
- 跨 session 使用 ui_id 被拒绝。

### D5：Patch 必须有 revision

状态：二期必须。

参数：

- ui_id。
- base_revision。
- patches。

结果：

- revision。
- patches。
- 完整 tree。

禁止只在前端内存应用 Patch 后不保存快照。

验收：

- base_revision 不匹配时返回 revision_conflict。
- 重复 Patch 不会重复应用。
- 历史缺少部分 Patch 时仍可用最新完整 tree 恢复。

### D6：树参数对象优先，字符串兼容

状态：必须。

首选 wire format 与 LeAgent 一致：

- tree 是对象。
- patches 是数组。
- JSON 字符串只作为兼容输入。

禁止为了绕过 FunctionTool Schema，把 tree 强制改成唯一字符串参数。

如果 AgentScope 生成的对象 Schema 太弱：

1. M0 先用测试固定实际行为。
2. 增加通用 ToolDescriptor input_schema。
3. 将 schema 传给工具包装器。
4. 不能在 FunctionTool 或 LocalWorkspace 中加入 emit_ui_tree 特判。

### D7：提示词必须按能力注入

状态：必须。

条件：

- genui_enabled。
- 当前渠道支持。
- 插件工具实际注册成功。
- 没有被上游原生工具接管。

提示词必须强调 Markdown 默认、GenUI 使用边界和安全 action。

验收：

- 非 Console 渠道的 system prompt 不包含 GenUI 指南。
- 工具关闭时 prompt 不引用不存在的工具。
- 普通问答不会频繁生成卡片。

### D8：第一阶段组件白名单

状态：必须。

允许：

- Stack、Row、Grid、Spacer。
- Text、Heading、Markdown、Divider。
- Card、Stat、Badge、Tag、Progress。
- Table、TableRow、TableCell、List、ListItem。
- Image、Chart。
- Button、Input、Select。

暂缓：

- HtmlFrame、ThreeJsFrame、Model3D、LiveCamera、SlideDeck。
- HostedCanvasFrame。
- Workflow 相关表单和 action。

后端 Schema 和前端 Registry 必须使用同一组件白名单。

### D9：第一阶段只允许 send_message action

状态：必须。

要求：

- 必须由真实用户点击触发。
- content 非空且有长度上限。
- 通过宿主聊天发送 API。
- 不允许 action 在首次渲染时自动执行。
- action 错误不能让整棵树崩溃。

暂缓 open_url、navigate、open_file、open_artifact、run_workflow 和 resume_workflow。

### D10：HtmlFrame 默认禁止

状态：必须。

启用前需要独立安全评审，至少包括：

- JS 默认关闭。
- iframe sandbox 不含 allow-same-origin。
- CSP。
- connect-src、form-action、frame-src 限制。
- HTML 大小、高度和刷新频率限制。
- 网络资源 allowlist 或代理。
- 禁止自动宿主 action。
- 钓鱼 UI 和全屏遮罩防护。

LeAgent 当前默认允许脚本的行为不得原样移植。

### D11：样式留在插件 bundle

状态：必须。

要求：

- 插件独立编译 Tailwind utilities。
- 不修改主 Console Vite/Tailwind。
- 不导入 Tailwind Preflight。
- 使用 .qwenpaw-genui wrapper。
- 主题来自宿主 useTheme 或 CSS variables。
- 重依赖延迟加载。

Chart 第一阶段使用 QwenPaw 已有 @ant-design/plots，避免同时维护 Recharts。

### D12：依赖必须显式声明

状态：必须。

已确认事项：

- QwenPaw 主 pyproject 未声明 jsonschema。
- LeAgent renderer 使用 clsx 和 tailwind-merge。
- LeAgent 高级组件使用 three、recharts、html-to-image。

要求：

- 后端插件 requirements 显式加入 jsonschema。
- 前端插件 package.json 显式列出自身依赖。
- 不依赖测试环境或 LeAgent node_modules。
- 不把高级依赖加入主 Console 首屏。

### D13：工具冲突不得覆盖

状态：必须。

上游新增 emit_ui_tree 时：

- 插件不调用覆盖注册。
- 记录 native capability。
- 比较协议版本。
- 协议兼容则保留前端 adapter。
- 协议不兼容则 disabled，并提示维护者迁移。

禁止 last-writer-wins 覆盖上游工具。

### D14：非 Web 渠道不暴露 GenUI

状态：必须。

QwenPaw 是多渠道系统。若渠道不能渲染 GenUI：

- 不注册工具。
- 不注入 prompt。
- 使用 Markdown。
- 可选附带纯文本摘要，但不返回不可见 UI 作为唯一答案。

### D15：LeAgent 来源和许可证必须保留

状态：必须。

插件必须包含：

- LeAgent 仓库地址。
- 来源 commit 或下载快照标识。
- Apache 2.0 LICENSE。
- 修改说明。
- 同步日期。
- 移植文件映射。

---

## 3. M0 实现前 Gate

在写正式组件前，必须先回答并测试以下问题。

### 3.1 工具 Schema Gate

测试一个最小工具：

~~~python
async def emit_ui_tree(tree: dict, ui_id: str = ""):
    ...
~~~

检查 Toolkit.get_tool_schemas 输出：

- tree 是否为 object。
- required 是否正确。
- additionalProperties 行为。
- OpenAI/Qwen provider schema sanitizer 是否保留对象。
- 模型是否能成功传入嵌套对象。

若不能满足，再实现通用 input_schema；未完成前不得把 tree 改成字符串唯一格式。

### 3.2 工具结果 Gate

用假的工具返回：

~~~json
{"ok": true, "kind": "genui", "ui_id": "ui_test", "revision": 1, "tree": {}}
~~~

验证：

- live streaming 中 ToolCard 能拿到 result。
- response.append 能读取完整 ChatResponseData。
- 历史 GET messages 后仍能找到相同 result。
- reconnect 后不会丢失。
- result 超过阈值时是否会被持久化或裁剪。

### 3.3 插件 UI Gate

验证前端插件能够：

- 注册 toolRender。
- 注册 response.append。
- 使用宿主 React，而不是打包第二份 React。
- 获取当前 session。
- dispose registration。
- 注入并隔离 CSS。

### 3.4 渠道 Gate

确定 request_context 中可用的渠道字段，并写测试：

- console/web 支持。
- CLI、IM、ACP 是否支持。
- 缺少渠道字段时默认关闭还是按 Console 判断。

推荐缺少明确能力时默认关闭。

---

## 4. 后端 Code Review 清单

### 4.1 Schema

- [ ] UI_TREE_SCHEMA 和前端 kind 同步。
- [ ] additionalProperties 策略明确。
- [ ] nodeId 字符集和长度限制。
- [ ] 最大深度、节点数、JSON 大小。
- [ ] 单字符串、单数组和总媒体数量限制。
- [ ] Table 行列限制。
- [ ] Chart series 和 point 限制。
- [ ] URL scheme 限制。
- [ ] 未启用 HtmlFrame 时 Schema 不允许 HtmlFrame。
- [ ] normalize 后再 validate。
- [ ] validate 后不再修改树结构。

### 4.2 JSON repair

- [ ] JSON code fence。
- [ ] 尾逗号。
- [ ] 完整对象后多余括号。
- [ ] 外层 arguments 损坏。
- [ ] 截断对象闭合。
- [ ] 修复有最大删除/补全次数。
- [ ] 修复后必须重新 Schema validate。
- [ ] 不允许 repair 把任意文本解释成可执行 HTML。

### 4.3 emit_ui_tree

- [ ] 获取真实 session_id，不信任模型传入 session。
- [ ] ui_id 服务端生成或校验归属。
- [ ] revision 第一版固定为 1。
- [ ] 结果含 schema_version。
- [ ] 错误结果结构稳定。
- [ ] 日志不打印完整敏感 UI 数据。
- [ ] read-only/internal governance 正确。
- [ ] feature/channel gate 正确。
- [ ] 工具名冲突不覆盖。

### 4.4 Patch

- [ ] base_revision compare-and-set。
- [ ] Patch path 限制在 /root。
- [ ] 禁止修改 schemaVersion、ui_id、revision。
- [ ] Patch 后完整树再校验。
- [ ] 成功返回物化 tree。
- [ ] 并发更新有锁或事务。
- [ ] snapshot 有淘汰和持久化策略。

### 4.5 Prompt

- [ ] Markdown 默认。
- [ ] 非视觉问答不使用 GenUI。
- [ ] 组件 catalog 按需获取。
- [ ] 复杂树先 guide。
- [ ] 只描述实际启用组件和 action。
- [ ] 非 Web 渠道不注入。

---

## 5. 前端 Code Review 清单

### 5.1 解析和 Store

- [ ] ToolCard 与历史恢复使用同一个 parseGenUiToolResult。
- [ ] 解析 unknown 输入，不做不安全类型断言。
- [ ] key 为 sessionId::uiId。
- [ ] revision 只能单调递增。
- [ ] 同一 response 多棵树按顺序展示。
- [ ] 同一 ui_id 只显示最新 snapshot。
- [ ] session 切换清理订阅和临时状态。
- [ ] structuredClone 不支持时有兼容策略。
- [ ] Patch 失败不破坏当前 tree。

### 5.2 response.append

- [ ] 不修改 HostBubbles 业务逻辑。
- [ ] 插件注册项有稳定 id。
- [ ] render 函数无副作用。
- [ ] Store 写入放在 effect 或幂等流程中，避免 render 无限循环。
- [ ] 历史和 live 数据使用同一展示路径。
- [ ] ToolCard 不重复展示完整 GenUI。

### 5.3 Renderer

- [ ] 每个 kind 有独立或明确分支。
- [ ] UnknownNode 不显示原始敏感 props。
- [ ] 文本默认转义。
- [ ] Markdown 不允许危险 HTML。
- [ ] Image URL 经过 resolver。
- [ ] Table/Chart 大数据有上限。
- [ ] 组件错误由局部 ErrorBoundary 隔离。
- [ ] React key 使用 nodeId。
- [ ] 500 节点树不会递归溢出。
- [ ] aria-label、键盘操作和焦点状态。

### 5.4 Action

- [ ] 只在 click/submit 中 dispatch。
- [ ] send_message content 长度限制。
- [ ] 按钮 disabled 时不 dispatch。
- [ ] 连续点击节流或 busy 状态。
- [ ] action adapter 卸载时复原。
- [ ] 未知 action 安全忽略并提示。
- [ ] 不使用 window.location.href 作为通用 navigate 实现。

### 5.5 样式和依赖

- [ ] 无 Tailwind Preflight。
- [ ] CSS 作用域在 .qwenpaw-genui。
- [ ] 不打包第二份 React/ReactDOM。
- [ ] 不把 three/html-to-image 放入首屏 chunk。
- [ ] 暗色主题从宿主读取。
- [ ] 不覆盖 antd 全局元素样式。
- [ ] plugin dist 可重复构建。

---

## 6. 风险矩阵

| 风险 | 等级 | 控制措施 |
|---|---:|---|
| 私有 SSE 破坏 SDK | P0 | 第一阶段禁止私有 SSE |
| messageId 在流开始时未知 | P0 | ui_id 主键 |
| Patch 乱序/重复 | P0 | base_revision + revision |
| 上游同名工具冲突 | P0 | 注册前能力探测，不覆盖 |
| 非 Web 渠道生成不可见 UI | P0 | 渠道 gate |
| HtmlFrame 执行任意脚本 | P0 | 默认禁用，单独安全评审 |
| 工具参数 Schema 太弱 | P1 | M0 测试 + 通用 input_schema |
| 历史工具结果被裁剪 | P1 | snapshot 持久化或 message metadata |
| Tailwind 污染 antd | P1 | 插件构建、无 Preflight、CSS scope |
| 依赖导致首屏变大 | P1 | 复用 antd plots、lazy load |
| LeAgent 与 QwenPaw 文件 URL 不同 | P1 | genUiMedia adapter |
| 组件 catalog 前后端漂移 | P1 | 单一 catalog + contract test |
| 500 节点性能下降 | P2 | 配额、memo、性能基准 |
| LLM 生成错误 JSON | P2 | repair + validate +可读错误 |
| 无障碍不足 | P2 | aria/keyboard/focus 验收 |

---

## 7. 测试用例矩阵

### 7.1 基础 Tree

| 用例 | 期望 |
|---|---|
| bare Card root | 自动包装 schemaVersion/root |
| type 代替 kind | normalize 为 kind |
| props 放在节点顶层 | 白名单字段 lift 到 props |
| 缺 nodeId | 后端生成稳定 ID |
| 501 节点 | 拒绝 |
| 深度 21 | 拒绝 |
| 未知 kind | 后端拒绝并返回 catalog 提示 |
| children 是字符串 | 拒绝 |
| 超长 Markdown | 拒绝或截断，策略固定 |

### 7.2 生命周期

| 用例 | 期望 |
|---|---|
| 首次 emit | ui_id 新建，revision=1 |
| 同一 response 两次 emit | 两个 ui_id，按调用顺序显示 |
| 刷新页面 | 从工具结果恢复 |
| reconnect | 不重复创建 ui_id |
| session 切换 | 不串树 |
| 插件关闭 | Markdown 正常 |
| UGSci 插件卸载 | 无 GenUI 工具和 UI registration |
| 上游已有 emit_ui_tree | 插件不覆盖 |

### 7.3 Patch

| 用例 | 期望 |
|---|---|
| base_revision 正确 | revision +1 |
| base_revision 过旧 | revision_conflict |
| 重复 Patch | 不重复应用 |
| path 越过 root | 拒绝 |
| Patch 后树非法 | 回滚 |
| 页面只保留最新 Patch 结果 | 仍可从完整 tree 恢复 |

### 7.4 安全

| 用例 | 期望 |
|---|---|
| javascript URL | 拒绝 |
| data:text/html | 拒绝 |
| action 自动执行 | 不执行 |
| 快速多次点击 | 节流或 busy |
| Markdown script 标签 | 不执行 |
| HtmlFrame kind 在 MVP | 后端拒绝 |
| 跨 session ui_id | 拒绝 |

---

## 8. 阶段 Gate

### Gate A：M0 完成

必须满足：

- 工具对象参数可调用，或通用 input_schema 已完成。
- 标准工具结果 live/history/reconnect 都可读取。
- 前端插件 toolRender/response.append/dispose 已验证。
- 渠道字段和默认策略已固定。

未满足不得开始大规模迁移 Registry。

### Gate B：M1 完成

必须满足：

- Schema、normalize、repair 和三工具完成。
- 后端测试通过。
- feature/channel gate 生效。
- 上游同名工具不覆盖。
- 无 HtmlFrame/3D/Workflow action。

### Gate C：M2 完成

必须满足：

- 基础组件白名单全部渲染。
- ToolCard 和 response.append 可用。
- CSS 不影响主 Console。
- 首屏无重依赖。
- 500 节点性能基准通过。

### Gate D：M3 完成

必须满足：

- 历史刷新恢复。
- reconnect 不重复。
- send_message action 安全可用。
- UGSci 可卸载，且 GenUI registrations 一并 dispose。
- 非 Web 渠道测试通过。

### Gate E：M4 完成

必须满足：

- Patch 服务端状态和 revision。
- 并发冲突测试。
- 完整 tree 快照返回。
- 持久化和清理策略明确。

### Gate F：高级能力

HtmlFrame、3D、摄像头或 Workflow action 任何一个启用前，都必须提交单独威胁模型和安全测试，不得随组件迁移顺带开启。

---

## 9. 上游同步检查

每次拉取 QwenPaw upstream 后：

- [ ] PluginApi.register_tool 是否变化。
- [ ] register_prompt_section 是否变化。
- [ ] Chat ToolCard props 是否变化。
- [ ] response.append slot 是否变化。
- [ ] AgentScope SDK 版本是否变化。
- [ ] 上游是否增加 GenUI/structured UI。
- [ ] 上游是否增加通用 extension event。
- [ ] 上游文件 URL、主题和 session API 是否变化。
- [ ] UGSci 插件卸载和 GenUI dispose 是否仍有效。

每次同步 LeAgent 后：

- [ ] schemaVersion 是否变化。
- [ ] kind 增删。
- [ ] props 结构变化。
- [ ] normalize 行为变化。
- [ ] JSON repair 变化。
- [ ] Action 类型变化。
- [ ] 安全默认值变化。
- [ ] 许可证/NOTICE 变化。
- [ ] 测试夹具同步。

若 QwenPaw 上游新增原生 GenUI：

1. 停止插件注册同名工具。
2. 建立协议兼容测试。
3. 仅保留缺失组件的 adapter。
4. 迁移现有 snapshot 格式。
5. 删除已经被上游覆盖的插件实现。
6. 确认用户历史 GenUI 仍可恢复。

---

## 10. 合并前最终清单

### 架构

- [ ] GenUI 位于现有 UGSci bundled plugin 内，不存在第二个 GenUI manifest。
- [ ] 无私有 SSE。
- [ ] ui_id/revision。
- [ ] 标准工具结果。
- [ ] 渠道/feature gate。
- [ ] 工具冲突不覆盖。

### 后端

- [ ] Schema、repair、quota。
- [ ] 三个 MVP 工具。
- [ ] 正式 jsonschema 依赖。
- [ ] 稳定错误协议。
- [ ] session 隔离。
- [ ] 单元和集成测试。

### 前端

- [ ] ToolCard。
- [ ] response.append。
- [ ] history hydrate。
- [ ] 基础组件白名单。
- [ ] 主题/文件 adapter。
- [ ] CSS scope 和 lazy load。
- [ ] ErrorBoundary 和无障碍。

### 安全

- [ ] 仅 send_message。
- [ ] 无自动 action。
- [ ] URL 校验。
- [ ] Markdown 安全。
- [ ] HtmlFrame 未启用。
- [ ] 非 Web 渠道不暴露。

### 上游兼容

- [ ] 无核心业务特判。
- [ ] UGSci 可卸载，且 GenUI registrations 一并 dispose。
- [ ] 同名工具探测。
- [ ] 来源 commit 和许可证。
- [ ] upstream 同步说明。
- [ ] 无 GenUI 时行为完全不变。

---

## 11. 最终否决项

出现以下任一情况，不允许合并：

- 在 Envelope 或 channel 中加入 ui_tree/ui_patch 特判。
- 用 messageId 作为唯一 GenUI 状态主键。
- 强制模型只能传 tree JSON 字符串。
- 默认开启 HtmlFrame JavaScript。
- 在非 Web 渠道全局注册 GenUI。
- 覆盖上游已有 emit_ui_tree。
- 主 Console 全局启用 Tailwind Preflight。
- ToolCard 和历史恢复分别维护两套解析逻辑。
- Patch 不带 revision 或不返回完整 tree。
- 没有 Apache 2.0 来源说明。
- 插件无法卸载或关闭。

---

## 12. 评审签署结论

本方案在以下前提下通过实施评审：

~~~text
插件优先。
标准工具结果。
ui_id/revision。
渠道能力检测。
安全组件白名单。
无私有 SSE。
无上游工具覆盖。
~~~

实施过程中若需要突破上述约束，应先更新本评审和主实施方案，再开始编码，不能用临时特判绕过。
