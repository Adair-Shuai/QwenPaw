# 右侧任务交互

OpenUI 插件提供结构化澄清、参数确认与输入表单。AI 通过 `request_user_input` 创建持久请求，当前 Console 会话在右侧工作区打开“任务交互”。用户提交后，答复进入原会话的消息队列，由新的 Agent 轮次继续处理。

## 试用

1. 使用包含本功能的 Console 与 OpenUI 插件，启用 OpenUI，并进入一个已经发送过消息的会话。
2. 打开右侧工作区的“任务交互”，点击“试用参数确认”。示例要求确认长方体长、宽、高与计算类型；这是可编辑的示例输入，不包含伪造的计算结果。
3. 调整参数并点击“确认并继续”。答复成功加入队列后，AI 在聊天中继续计算。模型和工具的实际输出仍需核对。
4. 也可以对 AI 说：“请先用 request_user_input 在右侧向我确认计算参数，等我提交后再计算。”

默认值、单位、范围应来自实际业务工具或已知资料；未知条件应明确向用户询问。第一版支持文字、数字、整数、布尔、单选、多选以及只读事实预览。复杂文件／曲线预览可通过后续注册业务组件扩展。

## 模块边界

| 模块 | 责任 |
| --- | --- |
| `plugins/bundle/qwenpaw-openui/interactions/schema.py` | 请求定义、字段类型、默认值与提交校验 |
| `interactions/store.py` | SQLite 存储和事务隔离 |
| `interactions/service.py` | 创建、草稿、提交、取消、消息入队状态 |
| `interactions/scope.py`、`router.py` | 宿主会话归属验证及 HTTP 接口 |
| `interactions/tool.py` | 请求级能力门禁、Agent 工具与提示词 |
| `frontend/src/interactions/` | 官方 OpenUI Renderer、私有组件目录与受控表单 |
| `console/src/features/user-input/api.ts`、`types.ts` | Console 与插件的版本一契约 |
| `drafts.ts`、`delivery.ts` | 本地草稿、提交后的聊天队列连接与确认重试 |
| `InteractionPanel.tsx` | 待处理列表、编辑和任务状态 |
| `useInteractionNotifications.ts` | 当前会话发现新请求并展开工作区 |
| `features/files-workspace/WorkbenchExtensions.tsx` | 工作区面板唯一挂载边界 |

业务模块可调用 `InteractionService.create(scope, definition)` 创建请求，复用同一校验与持久化层。`scope` 必须由宿主解析，不能从模型生成的字段中取值。前端共享能力为 `window.QwenPaw.openui.InteractionForm`，保留原有 `TaskLayout` 与卸载协议；它只接受受控值和回调，不自行访问业务 API。

OpenUI 的布局源固定，标题、描述、字段和值通过数据上下文传递。用户文本不会被拼进可执行布局源，重新填写不会重新挂载整张表单。专业组件后续可加入私有目录，服务端仍掌握字段校验规则。

## 请求与接口

请求包含 `id`、`kind`、`title`、`description`、`fields`、`preview`、`values`、`revision`、归属和状态。`kind` 为 `clarify`、`confirm` 或 `form`。字段有 `name`、`label`、`type`，可附带 `required`、`default`、`unit`、`description`、`minimum`、`maximum` 或 `options`。

所有接口位于 `/api/openui/interactions`，使用宿主鉴权与明确的 `X-Agent-Id`。`session_id` 为实际后端 Console 会话标识。

| 方法与路径 | 请求／用途 |
| --- | --- |
| `GET ?session_id=...` | 返回当前归属的 `{requests: [...]}` |
| `GET /{id}?session_id=...` | 读取单条请求 |
| `POST /demo` | `{session_id}`，显式创建试用请求 |
| `PUT /{id}/draft` | `{session_id, expected_revision, values}`，保存未完成草稿 |
| `POST /{id}/submit` | 同上，校验完整答复；返回 `{request, continuation}` |
| `POST /{id}/cancel` | `{session_id, expected_revision}`，取消请求 |
| `POST /{id}/queued` | `{session_id}`，记录答复已获宿主队列接收 |

状态从 `pending` 变为 `submitted` 或 `cancelled`。同内容重复提交幂等，已提交答复不可改写。空数字不会变成零；零和 false 保留。草稿允许尚未填完，正式提交要求完整且满足约束。

## 生命周期与边界

- 本地编辑即时保存到按 Agent／会话／请求隔离的浏览器草稿；“保存草稿”写入后端 SQLite。关闭面板不取消请求。后端请求和显式保存的草稿可跨服务重启恢复。
- 草稿更新检查 revision；其他窗口更新时提示重新载入，后台轮询不能覆盖正在编辑的值或回退已成功提交的版本。
- 新请求只为当前活动会话展开面板；已有待填请求时不抢占正在填写的表单。切换会话后，迟到的网络响应不能更新另一会话或发送答复。
- 保存答案与加入聊天队列是两个步骤。入队失败可重试；队列接收成功后保存本地回执，再确认服务端状态。确认失败的重试不会再次入队。这不是浏览器崩溃、存储被清除和跨设备竞争下的分布式 exactly-once 保证。
- “已加入对话队列”仅表示宿主接收了消息，不表示模型或计算已完成；后续执行状态由原聊天／队列展示。
- 普通 Agent 通过新轮次继续；本功能没有声称恢复任意 Agent 调用栈。提示词要求创建待答请求后结束当前轮次，依赖输入的计算必须等答复。真实模型是否遵循该要求需要实际会话验收。
- 第一版不接管 FlowForge 恢复接口，也不自动执行任意 UI 提供的 URL、脚本或计算接口。后续工作流适配可在服务层与明确的任务引用之间增加适配器。
- OpenUI 禁用后共享渲染器撤销，后台发现停止，数据保留。非 Console、后台自动任务和子 Agent 不开放该工具；旧 Console 只有 `openui` 标记时不开放新交互能力。

## 回归

后端使用实际路由、SQLite 与工具 middleware 验证归属、持久化、默认值、非法输入、revision、取消和幂等。插件使用实际构建产物验证 OpenUI 表单；Console 挂载真实工作区和发布渲染器验证填写、草稿恢复、提交重试及卸载。

固定检查包括 `npm run test:fork-features`、Console 类型检查、OpenUI 插件完整测试和 `python scripts/verify_fork_regressions.py`。这些自动化测试使用合成记录，不代替真实模型、专业计算和桌面安装包验收。

## 本次验收记录（2026-10-30）

- 新增真实工作区集成：10/10 通过；覆盖草稿、失败重试、关闭后提交、会话隔离、版本竞争和插件卸载恢复。
- 完整前端固定清单本轮执行 86 套、1412 项：1405 通过，7 项失败均为下述并行更新中的专家召唤套件；任务交互套件在完整执行和独立执行中均通过。
- OpenUI 插件完整测试：80/80 通过，包含类型检查与产物构建。命令为 `npm test -- --maxWorkers=1 --testTimeout=30000 --reporter=dot`，业务断言保持不变。
- OpenUI 后端专项：44/44 通过，使用真实 HTTP、SQLite、工具及 middleware。
- 文书填报两套固定回归：81/81 通过。
- 完整后端固定清单：2907 通过、3 项原有跳过、1 项失败。失败为 `test_derivation_workbench_frontend.py::test_host_has_dedicated_compute_slot_and_open_event` 的旧静态路径断言；它仍要求 `FilesDrawer.tsx` 直接包含已在本任务之前抽到 `WorkbenchExtensions.tsx` 的计算面板。未删除或跳过该断言。
- 现有计算面板四个定向页面用例中三项通过；`keeps an explicit compute request visible while file tabs hydrate` 单独运行时失败在隐藏文件加载调用断言，虽已显示计算轨道，也不能视为整项通过。
- 浏览器通过真实表单、隔离后端与宿主消息队列验证了零值、选择项、草稿重开、提交回执和明暗主题；验收页未配置模型执行器。
- Console 最终 `npx tsc -b --noEmit` 通过；最新源码已完成 Vite 打包、Monaco 样式检查、预压缩和首屏产物检查，深色主题修正已验证进入最终 CSS。

本次工作区同时存在其他界面改动。完整前端运行期间，专家按钮名称与两份发布产物更新不同步，专家召唤套件出现七项失败；失败快照仍显示“召唤专家”，测试已经查找“开始对话”。当前产物一致后，该套件单独重跑 22/22 通过。并行新增专家展示测试的类型错误在后续更新中消除，最终 Console 类型检查通过。由于完整门禁的上述失败记录仍在，不能宣称本轮全仓回归全部通过。用户其他未提交改动均保留。
