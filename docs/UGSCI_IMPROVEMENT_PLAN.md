# UGSci 工程完善计划

## 目标与边界

本轮改造以“安全、可验证、可维护、可发布”为目标，在保留现有
UGSci 功能和用户工作区改动的前提下完成渐进式治理。

本轮明确不调整 `pyproject.toml` 中的默认安装依赖；依赖拆分将在
后续独立评估，避免影响现有安装和发布路径。

## 实施顺序

### 1. 团队状态 API 安全化

改动：

- 移除由客户端直接指定 `workspace_dir` 的能力。
- 使用 `X-Agent-Id` 标识工作区，由服务端已注册的
  `MultiAgentManager` 解析实际目录。
- API 只返回工作流实例 ID，不暴露本机绝对路径。
- 为 preset、role 和 state 响应增加 Pydantic 模型。
- 区分 JSON 损坏、文件系统错误和未找到状态，并记录结构化日志。

验收：

- 任意路径不再能通过 HTTP 参数传入。
- 未知 Agent 返回 404，缺少 Agent 标识返回 400。
- 损坏的状态文件不会令接口失败，并能在日志中定位。

### 2. UGSci team 自动化测试

改动：

- 覆盖 slash command 参数解析和预设团队解析。
- 覆盖工作流状态的创建、原子写入、损坏恢复和清理。
- 覆盖状态 API 的鉴权上下文、Agent 隔离和路径不泄漏。
- 覆盖状态机完成、迭代限制、验证重试和分派重试。

验收：

- 新增测试可独立运行。
- 安全边界和关键状态转换均有回归用例。

### 3. 单一源码与产物同步

改动：

- 将 `plugins/bundle/ugsci` 定义为唯一手写源码目录。
- 提供同步脚本，将发布所需内容复制到
  `src/qwenpaw/plugins_bundle/ugsci`。
- 提供 `--check` 模式，在 CI 中检测发布副本漂移。
- 明确 `static/`、`ui/dist/` 和运行时 `.qwenpaw/plugins` 的生成关系。

验收：

- 同步与检查使用同一套文件清单。
- `--check` 在源码和发布副本一致时返回 0，漂移时返回非 0。

### 4. 前端团队模块拆分与类型收紧

改动：

- 从超大 `ui/src/index.ts` 中提取团队 API、类型和状态展示模块。
- 用明确的 `TeamWorkflowState`、`TeamWorkflowResponse`、
  `PresetTeam` 和 `RoleDefinition` 替换相关 `any`。
- 状态轮询随当前 Agent 切换而更新，并在卸载时停止。

验收：

- UGSci UI TypeScript 构建通过。
- 团队模块不再依赖客户端文件系统路径。
- 切换 Agent 后不会继续展示上一个 Agent 的工作流。

### 5. 前端构建和包体治理

改动：

- 修正相互循环的 `manualChunks` 配置。
- 对 Monaco、Mermaid、PDF/Office 和图表等重型模块保留稳定分包。
- 增加构建产物预算检查脚本，优先防止体积继续回归。

验收：

- Console 正式构建通过。
- 不再出现手工 chunk 之间的循环依赖。
- 包体检查可在本地和 CI 重复执行。

### 6. Python 模块边界收敛

改动：

- 将团队 HTTP 路由从 `plugins/bundle/ugsci/plugin.py` 提取到
  `team/api.py`。
- 将工作区解析、状态读取和响应序列化限定在团队模块内部。
- 暂不对全仓库数千行模块做高风险的大爆炸式重构；后续按模块逐步拆分。

验收：

- 插件入口只负责注册，不再包含团队 API 实现细节。
- 团队模块可以被单元测试直接导入。

### 7. 质量门禁收紧

改动：

- 插件手写 Python 源码进入 AST、格式和基础静态检查。
- 前端手写源码进入 TypeScript、ESLint 和 Prettier 检查。
- 仅排除 `dist`、`static`、`node_modules`、技能模板和第三方生成内容。
- 为 UGSci 增加快速检查 Make target。

验收：

- 新规则不会扫描生成产物。
- UGSci 手写核心代码不再被整目录排除。

### 8. 项目元数据一致性

改动：

- 明确 QwenPaw 是核心包、UGSci 是内置领域插件/发行定制。
- 修正 Python 包描述中把整个项目写成 UGSci 的歧义。
- 修正 Console 仓库地址和插件描述中的不一致。

验收：

- Python 包、Console 和插件 manifest 的名称与仓库指向一致。
- 保留现有 CLI 兼容入口。

### 9. 可观测性与错误分类

改动：

- 团队工作流日志统一携带 `agent_id`、`team_id`、
  `instance_id`、`phase` 和重试计数。
- 可选能力注册失败区分 debug/warning/error，不再无条件静默。
- 状态文件错误不泄漏文件内容或绝对路径到 HTTP 响应。

验收：

- 一次工作流可通过实例 ID 串联关键日志。
- 可恢复错误和终止错误有明确日志级别。

## 最终验证

- Python 语法与新增 UGSci 测试。
- UGSci UI TypeScript/Vite 构建。
- Console TypeScript/Vite 正式构建。
- UGSci 源码/发布副本一致性检查。
- Git diff 审核，确保没有覆盖改造前已有的用户修改。

## 渐进式模块化补充

在上述计划完成后，继续按职责拆分后端入口和前端公共依赖：

- `plugin.py` 仅保留注册编排，技能池、头像、仿真监控和引擎 API
  分别进入独立模块，并保留旧工厂名兼容层。
- 前端 Host/HTTP 运行时、头像组件和 Team 领域模型从
  `ui/src/index.ts` 提取，入口只通过显式 import 依赖这些模块。
- `engine/detector.py` 的厂商策略拆分另行进行；该文件涉及 Windows
  注册表、许可证和真实软件探测，必须先建立跨平台夹具，避免仅为降低
  行数引入不可验证的检测回归。
