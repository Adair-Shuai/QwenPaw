# FlowForge 自动工具节点：启动、刷新与权限适配

日期：2026-10-16。

## 本轮交付

本轮增强 Tool.<工具名> 的自动节点发现与执行。工作流编辑器打开、切换智能体、窗口重新获得焦点、每 30 秒及手动点击“刷新节点”时，都会重新读取该智能体当前可用的工具。工具新增、卸载、开关调整和参数变化可以在下次刷新后反映到节点目录。

启动钩子改为异步，初始化 AgentNodeCatalog 并对当前智能体执行一次发现。HTTP GET /node-types 与 POST /node-types/refresh 每次重新构建独立目录；不维护所有工作区工具的共享并集，也不再选择“第一个工作区”作为所有人的工具来源。

## 代码论证

### 同一可用性入口

目录经由目标工作区的 public local_workspace.list_tools 接口，复用现有 ToolRegistry 对智能体工具配置、模式、技能、渠道和 availability_check 的过滤。全局 profile 即使已有缓存工作区，也必须存在且启用。工具节点优先使用宿主 FunctionTool 的 input_schema，而不是再次猜测函数参数。

GET/POST 节点目录、流程校验和真实运行都会准备按智能体隔离的注册表。原同步 validate_flow 保留作为独立引擎的接口；HTTP 校验使用异步的 validate_flow_for_agent。避免“目录能看见，校验却不认识”的不一致。

编辑器使用宿主 SDK 的 selected-agent hook，并将 X-Agent-Id 附在请求中；节点刷新响应带序号检查，旧智能体的迟到响应不能覆盖新目录。刷新不会重新加载或丢弃画布中未保存的修改。刷新失败会清空目录并显示可重试状态，避免继续展示另一智能体的旧目录。

### 目录快照不授予执行权限

运行固定 agent_id/channel；恢复保留原绑定，子工作流继承父绑定。智能体工具主动启动流程时使用当前实际调用智能体的 ID。

AgentNodeCatalog 为运行复制执行器外壳并替换 node_registry/tool_executor/tool_registry，避免并发运行共享另一智能体的工具表。执行器的状态与 abort 映射保持共享，原有按 run_id 取消的服务入口继续有效。

每次执行工具时重新调用 list_tools，重新读取开关和 profile；因此目录刷新后撤权或卸载，旧节点也不能继续使用该函数。Tool.<name>、ToolCallNode、通用 ToolNode 三条路径均经过同一 GovernedWorkflowTools。生产插件不再注入直接调用 descriptor.func 的旧适配器。

实际调用使用请求独立的 ResourceGovernor 和 PolicyGuardedTool：先检查权限，只有 ALLOW 才执行。拒绝、治理不可用、参数验证失败和 error/denied 工具结果会作为失败返回，并标记不可自动重试；尊重宿主明确配置的 OFF 行为。ASK 的处理由宿主治理/审批实现负责，FlowForge 不自行授予权限。

工具调用在宿主事件循环进行，保持 manager 锁及审批 future 的循环归属。后台流程等待该调用；取消会传播到宿主 task。工作区、项目目录、智能体、用户与会话上下文在独立 task 中绑定，不泄漏到其他节点。governor 在 finally 中结束。

### 节点 schema 的更新与参数冲突

工厂缓存改为同时比较当前生成的 schema。同名工具参数变化时生成新类；已经持有旧类的其他智能体注册表不会被原地修改。

原工厂会丢弃业务参数 output/retry_count/retry_delay_sec。现在优先保留真实参数，工作流控制选项冲突时递归添加 __flow_ 前缀。例如工具参数 output 仍传给工具，保存节点结果的控制字段变为 __flow_output。无冲突节点保留既有字段名。

宿主完整 JSON Schema 用于执行前验证；复杂字段在画布表单中仍可能降级为通用 JSON 输入，不能把有限的可视化控件等同于完整 JSON Schema 编辑器。

## 验证

- FlowForge 回归：62 passed（45 项既有测试 + 17 项新增节点目录/权限用例）。
- 前端生产构建：npm run build 通过，生成的 ui/dist/index.js 已同步。
- TypeScript：tsc --noEmit 通过。
- 源码与分发插件内容同步检查通过；git diff --check 通过。

新增用例使用真实 QwenPawLocalWorkspace 配置过滤、真实节点工厂/执行器/子工作流/HTTP 路由。允许执行用例通过真实 PolicyGuardedTool，但显式将测试执行级别设为 OFF 并替换 governor 初始化，避免实际沙箱和业务操作；治理缺失用例验证真实 fail-closed 路径，拒绝与取消审批等待用例使用可控的权限决策替身。

覆盖：工具启停与卸载刷新、跨智能体隔离、同名不同 schema 并发、工具 output 参数、schema 变更、执行前撤权、三种工具节点统一入口、参数错误与失败 ToolChunk、禁用缓存智能体、HTTP 刷新/校验/运行绑定、模式/技能/渠道/动态可用性门控、拒绝后不重试、启动装配、宿主循环归属与 ContextVar 隔离、子流程继承、跨循环取消审批等待。

测试未调用真实模型供应商，没有执行真实业务动作；未进行完整桌面浏览器交互验收。真实审批与平台沙箱仍需部署环境联调。现有依赖弃用及 pytest 缓存目录权限提示未导致测试失败。

## 边界

- 本轮增强自动工具节点；没有将所有其他智能体自动暴露成可调用节点，原 AgentNode 能力保留。
- 工作流级 ACL、多租户隔离、跨进程 worker 与分布式撤权不在本轮范围。过滤针对宿主注册的工具，MCP/driver 等额外工具源若未进入该工作区 list_tools，不能据此宣称已支持。
- 目录体现流程上下文下的可用性。依赖特定聊天会话或特殊请求标记的工具，不会因为普通画布刷新而获得额外授权。
- 取消和撤权不能撤销已经提交的外部副作用。授权检查到实际调用之间也不是跨系统事务。
- 遗留的底层原始工具适配器仍供独立引擎使用；生产插件的默认装配已切换到新治理路径。
