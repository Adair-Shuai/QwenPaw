# FlowForge 工作流架构

本文以 `lobehub-style` 分支的实现为准，更新于 2026-10-25。核心代码位于 `src/qwenpaw/plugins_bundle/flowforge/`；`plugins/bundle/flowforge/` 是随宿主分发的同步副本。FlowForge 借鉴 LeAgent 的文档、节点与调度模型，不依赖 `leagent` Python 包。实际工具、模型、专家与权限由 QwenPaw 宿主提供。

## 模块职责

| 模块 | 职责 |
| --- | --- |
| `plugin.py` | 注册 `/api/flowforge` 路由、工作流工具与启动钩子；连接宿主工作区管理器和模型服务 |
| `service.py` | 工作流管理、节点目录、能力校验、AI 提案与版本接口 |
| `lifecycle.py` | `RunLifecycleMixin`：运行、恢复、取消、父子运行关联、后台事件循环与持久记录 |
| `flow_repository.py` | SQLite 工作流当前版本、不可变历史版本、AI 提案、单次恢复占用 |
| `execution_repository.py` | 每次公共运行的 JSON 记录、事件、状态、定义快照及版本 |
| `node_catalog.py` | `AgentNodeCatalog` 按专家生成节点目录；`GovernedWorkflowTools` 执行当前仍可用的工具 |
| `authoring.py` | 模型请求、凭据占位、结构解析、差异预览与提案生成；生成过程不执行工具 |
| `engine/document.py` | 统一工作流契约、边与引用归一化、结构及能力验证 |
| `engine/graph.py`、`executor.py`、`runner.py` | 数据依赖与控制路径调度、并行执行、输入解析、重试、超时和节点结果 |
| `engine/state_store.py` | 可恢复检查点：状态、输出缓存、阻塞节点、调度状态及子运行映射 |
| `engine/adapter/` | 宿主工具、模型、专家运行时以及脚本工作进程适配 |
| `ui/src/index.ts` | 插件入口、工作流列表、模板和宿主集成 |
| `ui/src/Editor.tsx`、`model.ts`、`editor.css` | 编辑器、AI 提案、属性配置、图与文档转换、样式 |
| `ui/src/RunPanels.tsx` | 运行详情、审批、父子运行导航、历史、SSE 与轮询 |

宿主实际服务通过启动钩子注入。独立 `WorkflowExecutor` 可以用于单元测试；它不等同于已连接工具目录、专家工作区和模型提供商的宿主部署。

## 文档与执行契约

工作流以 JSON 对象传输。主要字段是 `id`、`name`、`description`、`nodes`、`edges`、`inputs`、`outputs`、`start_id`、`metadata`、`version` 和持久化的 `revision`。`version` 是文档格式/业务展示字段；`revision` 是服务器分配的递增修订号，不可混用。

- `nodes` 按稳定节点 ID 索引，每项含 `class_type`、`inputs` 和 `control`。
- 数据引用使用 `[上游节点ID, 输出槽位]`，也可出现在对象或数组的嵌套参数内。模板引用支持 `${inputs.x}`、`${outputs.node.x}` 等路径。
- `inputs` 是工作流输入声明列表，例如 `[{"name":"inventory","type":"object","required":true}]`。缺失必填值或类型不匹配在业务节点执行前报错。
- 数据边明确输出槽位和目标输入字段；控制边明确 `next`、`condition:0`、`else_node`、`on_reject` 等句柄。保存、校验和执行共用归一化规则，画布连线必须与实际引用和控制目标一致。
- `metadata.positions` 保存画布位置。内部调度计数与检查点由运行时维护，业务输入不能伪造 `__resume__` 等保留变量或扩大循环预算。

调度同时考虑数据依赖和控制依赖。多个就绪节点实际并行执行；汇合节点等待所需分支，未选中的互斥分支会被跳过。控制连线限制节点何时可运行，不能只改变画布显示。失败依赖不能产生成功的下游业务结果。

## 节点能力与边界

| 能力 | 实际行为 |
| --- | --- |
| 输入、输出与变换 | 读工作流输入、解析上游结果并形成业务产物 |
| `Tool.<name>` | 根据当前专家可用工具的真实 schema 生成类型化输入节点 |
| `ToolNode` / `ToolCallNode` | 通用工具入口，宿主部署中同样经过治理执行器 |
| `AgentNode` | 通过宿主专家运行时发起真实专家任务，携带上游上下文 |
| `LLMNode` / `LLMCallNode` | 使用已配置模型服务；无模型时报告不可用 |
| `ConditionNode` | 显式条件与默认分支，支持数值/布尔/集合等受控表达式 |
| `HumanReviewNode` | 持久暂停；布尔值 `approved` 选择 `next` 或 `on_reject`；支持意见与过期时间 |
| `SubworkflowNode` | 调用同一 `WorkflowService`，产生真实子运行；支持父子追溯、暂停恢复和取消传播 |
| DAG 并行 | 多个节点共享上游，汇合节点引用各分支结果；无需 `ParallelNode` 包装 |
| `ParallelNode` | 嵌套分支执行尚未接入，目录标为不可用；运行和提案校验不得伪装成功 |
| `QualityGateNode` | 必须输入实际评分，按阈值选通过/失败路径；不按迭代次数虚构评分 |
| `IterativeRefineNode` | 有界回到 `retry_node` 真实重执行；预算耗尽到 `exhausted_node`。`max_iterations` 表示首次执行后的额外重试预算 |
| `CodeNode` / `ScriptNode` | 在可取消的 Python 子进程运行受控 JSON 输入输出，超时终止子进程 |

只有经过验证的有界优化回边允许形成循环，普通任意环会被拒绝。节点超时和重试预算受限；工具明确标记不可重试的拒绝不应因配置重试次数而重复。执行外部副作用前仍需由业务工具实现幂等键和提交策略。

脚本工作进程使用独立临时目录和精简环境，提供超时、取消及输出限制。它**不是安全沙箱**，不能据此允许不可信任任意代码访问宿主。面对不可信脚本，仍需独立 OS/容器隔离及资源策略；宿主工具自身的沙箱机制是另一层能力。

## 专家作用域与工具治理

`AgentNodeCatalog` 从当前请求的稳定专家 ID 选择工作区，读取专家是否启用、工具开关、模式及技能，再经 `QwenPawLocalWorkspace.list_tools` 构建目录。HTTP 的 `X-Agent-Id` 影响目录、校验、AI 上下文和运行。不同专家不能共享另一专家临时生成的工具节点目录。

每个运行获得独立的执行器视图和节点注册表；取消状态和检查点等运行资源仍由服务协调。宿主作用域视图把 `tool_registry` 设为 `None`，避免通用节点直接调用原始函数。

每次真正调用工具都会重新选择当前可用工具，验证真实输入 schema，再通过 `PolicyGuardedTool` 和 `ResourceGovernor` 检查权限。禁用、卸载或撤销权限在后续调用前生效；治理不可用、权限拒绝和错误工具响应返回失败，不降级为成功值。已有目录快照不代表永远获得执行授权。

`engine/adapter/tool_registry.py` 保留独立引擎兼容适配，不能替代宿主治理入口。新增工具应通过宿主注册、声明 schema 和权限类型，再由目录自动生成节点。

## 自然语言创建与修改

AI 编排采用“生成提案 → 展示差异与校验 → 应用”的流程：

1. 前端提交需求及当前草稿，包含尚未保存的画布编辑；服务检查基准 `revision`。
2. 服务向模型发送当前专家可用节点、工具、专家及工作流清单，并将凭据值替换为引用占位符。
3. 模型返回完整文档。服务解析并校验，不执行该文档。提示词要求保留无关节点 ID、配置和位置；精确字段差异供用户核对实际修改范围。
4. 提案保存于 SQLite，包含作用域、基准修订号和有效期。预览不修改已保存工作流。
5. 应用时重新准备当前作用域目录和校验，通过事务比较修订号并单次应用，产生新版本。过期、重复应用或版本冲突返回明确错误。

模型未配置、超时或响应不可解析会明确失败，不用顺序模板冒充自然语言编排。旧 `/generate` 保留显式顺序模板兼容用途；AI 编辑器使用 `/authoring/proposals`。

## 持久化与运行生命周期

| 数据 | 默认存储 | 保证与用途 |
| --- | --- | --- |
| 当前工作流、历史版本 | `<flows_dir>/workflows.sqlite3` | 事务保存与乐观锁；旧 JSON 一次性迁移，删除后不会从旧文件复活 |
| AI 提案 | 同一 SQLite 数据库 | 有效期、基准版本、作用域和单次应用 |
| 恢复占用 | SQLite `resume_claims` | 同一暂停记录仅产生一个已占用的续行；执行前准备失败可释放 |
| 公共运行记录与事件 | `<flows_dir>/executions/<run_id>.json` | 原子替换写入，保留状态、输出、定义快照、版本和父子关联 |
| 运行检查点 | `<flows_dir>/runs/` | 原子写入状态与索引；保存已完成、跳过、阻塞和循环状态，恢复不重跑已完成节点 |

`WorkflowService` 在专用后台事件循环运行流程，使其不随单个 HTTP 请求结束。`RunHandle.finalized` 仅在最终记录持久化后为真。每次执行与恢复都有独立公共 `run_id`；恢复继续原 `state_id`，通过 `resumed_from_run_id` 和旧记录的 `resumed_by_run_id` 关联。

运行开始固定 `flow_snapshot` 和 `flow_revision`，后续修改或删除当前定义不能改写该运行。子流程已经启动并暂停时，也保留自己的快照。尚未创建的子流程仍需要有效定义。公共运行接口隐藏完整 `flow_snapshot`，提供版本和执行信息。

父子运行通过 `parent_run_id`、`root_run_id` 和 `workflow_stack` 追溯；递归调用和过深调用被限制。取消父运行会传给活动或暂停的后代；取消后不可再恢复。取消能中止本地可取消任务，不能回滚已经提交到外部系统的副作用。

人工审核在恢复占用之前校验布尔决定与目标节点。多个阻塞节点需要 `node_id`，嵌套子流程可使用分层信封：

```json
{
  "inputs": {
    "node_id": "child_a",
    "child_inputs": {"node_id": "review", "approved": true, "comments": "核对通过"}
  }
}
```

简单单一审核仍支持 `{"inputs":{"approved":true}}`。也可打开子运行单独处理，然后恢复父运行沿既有子续行继续。

## API 与 UI

路由统一位于 `/api/flowforge`：

| 路由 | 用途 |
| --- | --- |
| `GET /node-types`、`POST /node-types/refresh` | 当前专家节点目录及刷新 |
| `GET/POST /flows`、`GET/PUT/DELETE /flows/{id}` | 工作流列表与保存；HTTP 写入携带 `revision` 或 `expected_revision` |
| `POST /flows/validate`、`POST /flows/{id}/validate` | 草稿或已保存定义的同源校验 |
| `GET /flows/{id}/versions`、`POST /flows/{id}/versions/{revision}/restore` | 历史版本和恢复为新修订 |
| `POST /authoring/proposals`、`POST /authoring/proposals/{id}/apply` | AI 预览与应用 |
| `POST /flows/{id}/run`、`GET /runs`、`GET /runs/{id}` | 启动、历史和详情 |
| `POST /runs/{id}/resume`、`POST /runs/{id}/cancel` | 恢复或取消 |
| `GET /runs/{id}/events`、`/ws` | SSE 历史/实时事件与 WebSocket |

前端使用 ReactFlow，React 和 Ant Design 来自宿主插件 SDK。模块化编辑器负责节点、数据与控制连线、属性、删除、撤销/重做、保存状态、导入导出、校验及版本。运行面板显示节点状态、产物、错误、事件和父子关联，通过携带宿主认证头的流式请求消费 SSE，并保留轮询恢复能力。`ui/dist/index.js` 是构建产物，不能仅修改产物而遗漏源代码。

## 适用范围与验收

当前实现面向单主机、单服务执行所有者的持久运行。SQLite 已提供版本与恢复占用的事务互斥，但 JSON 运行记录、检查点、进程内活动任务和取消信号并未构成分布式协调系统。多 worker 故障接管、跨机调度、外部副作用 exactly-once、真实模型编排质量和真实业务提供商稳定性须单独部署验收。

功能证据见仓库根目录 `docs/flowforge-production-acceptance.md`。修改时保留 `docs/FORK_FEATURE_REGRESSION.md` 所列 FlowForge 双向调用、工具作用域与权限、运行生命周期和媒体契约测试；修改 canonical 后按仓库流程构建并同步分发副本。
