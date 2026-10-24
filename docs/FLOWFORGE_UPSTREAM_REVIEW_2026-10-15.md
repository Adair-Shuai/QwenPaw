# FlowForge 上游对照与增强建议

审查日期：2026-10-15。来源：本地 `src/qwenpaw/plugins_bundle/flowforge/ARCHITECTURE.md` 明确标注移植自 LeAgent；本次对照 [vixues/LeAgent](https://github.com/vixues/LeAgent) main 检出提交 `1f16badc834abbd829d3cb7e9f8fcb5b2d57f443`（提交日期 2026-07-17）。没有找到本地移植时锁定的上游提交，不能据此断言某能力是移植后上游新增。以下为静态源码审查，未启动上游服务。

## 结论

当前最有价值的工作是完善已经移植的执行能力及宿主适配。双向调用入口已经补上，但企业级调用需要共同的身份、运行关系、停止信号、恢复状态和输出契约。

| 优先级 | 上游依据 | 本地现状 | 建议与验收条件 |
| --- | --- | --- | --- |
| P0 | `workflow/services.py` 的统一启动及 compiled document 运行；`runtime/execution_run.py` 的父子运行模型 | `start_run` 共用服务，但无持久化父子关系；`SubworkflowNode` 依赖的 registry 在默认插件装配中未注入，且直接新建 executor | 让子流程统一进入服务，记录 parent/root run、触发方式及调用者。验收 A→智能体→B 可追踪，取消 A 能传递到 B，循环限制覆盖子流程入口。 |
| P0 | `runtime/context.py` 注入 checkpoint store；`runtime/execution_run.py` 的 PauseToken | 工作流已有暂停恢复和持久化基础；智能体适配器 `resume` 只是将 checkpoint ID 拼进新提示，启动新一轮 | 区分流程恢复和智能体恢复。恢复真实会话及检查点，不重复执行已成功的有副作用步骤；无法支持的后端应明确报不支持。 |
| P0 | 上游 agent runtime / workflow agent node 的运行边界 | 本地 `delegate` 接收 allowed_tools、max_turns、inherit_abort 等参数，但当前未完整落实；上一轮仅打通基础文本往返 | 让参数确实约束宿主运行时；身份和取消信号端到端传播，增加真实运行时集成测试，而非只验证接口桩。 |
| P1 | `tools/workflow/workflow_save.py` 校验图、规范化、返回 digest；`workflow_crud.py` 提供 run/status/pause/resume | 已有查询、执行、取消工具，以及服务层校验能力；生成流程目前主要把步骤文本拆成线性 AgentNode | 增加节点目录、校验、保存草稿工具，形成“需求→草稿→校验→预览→试运行”闭环。区分草稿和发布版，执行绑定快照。 |
| P1 | `HumanReviewNode` 和统一 PauseToken 设计 | 本地节点已有等待和恢复数据语义，但默认装配没有 review_service；不能等同于审批系统 | 建待办、审核人权限、批准/拒绝/补充材料、超时、审计记录；审批回调须验证运行及节点身份。 |
| P1 | `workflow_run` 检查 quality_passed/quality_score/quality_threshold | 当前工具主要报告执行状态；执行完不保证业务合格 | 区分 execution_status 与 business_result；按工作流声明校验结构化输出，设置有限重试次数和成本预算。 |
| P2 | `workflow/queue/base.py`、`queue/memory.py`、`worker.py`、服务 enqueue | 本地每次运行直接提交到后台循环，运行元数据为 JSON 文件；引擎内节点并发不等于任务队列限流 | 先做有界队列、业务幂等键、全局/智能体并发配额、退避重试；多实例部署再做租约和共享存储。 |
| P2 | `tools/workflow/chat_workflow.py`、`workflow_embed_emit.py`；执行拓扑中的聊天步骤编译 | 有独立画布和监控；本轮未全面审计聊天前端 | 将聊天流程卡片接入同一服务，展示当前节点、审批状态、结果，并可打开画布继续编辑。 |

## 不宜照搬的部分

1. **文档与实现不完全一致。** 上游拓扑文档要求子流程使用统一服务，但当前 `nodes/builtin/subworkflow.py` 仍直接创建 WorkflowExecutor。因此应借鉴统一入口原则，不能直接复制该节点就认为治理完整。
2. **分布式能力不能根据配置表认定完成。** operations 文档提到 Redis 队列，但本次检出的 `workflow/queue` 只有协议和内存实现；执行拓扑也明确运行注册表为进程内单例。需要另行验证 worker、持久队列、租约与跨进程恢复。
3. **质量不通过不应无限重跑。** 上游工具描述建议不断改进直到通过。企业业务应限制次数、费用和时间，涉及支付、发信、写入时先保证幂等。
4. **默认发布和可变覆盖不足以支持企业版本治理。** 上游 save 工具默认 publish=true，并可覆盖既有 Flow；digest 是内容标识，不是完整的不可变版本系统。QwenPaw 应采用草稿、发布快照和运行版本绑定。
5. **通用能力与领域节点分开。** 上游美术资产质量节点可借鉴“生成→校验→修正”的模式，不应让企业流程核心依赖图片评分字段。

## 建议的下一轮交付

先做一条可验收链路：业务智能体启动主流程 → 主流程调用专业智能体 → 专业智能体调用子流程 → 人工审核 → 从原状态继续 → 返回结构化结果。所有环节共享根运行 ID，拥有独立子运行 ID，并能查询、取消和追踪错误。

第一批实施范围：子流程服务接入、持久化运行关系、身份/取消传播、流程及智能体恢复语义校正。第二批：可校验的草稿生成、发布版本、审批产品界面。第三批：队列、幂等和多实例运行。

## 上游源码索引（固定审查提交）

- [执行拓扑与状态归属](https://github.com/vixues/LeAgent/blob/1f16badc834abbd829d3cb7e9f8fcb5b2d57f443/docs/technical/execution-topology.md)
- [工作流服务](https://github.com/vixues/LeAgent/blob/1f16badc834abbd829d3cb7e9f8fcb5b2d57f443/backend/leagent/workflow/services.py)
- [工作流保存与校验](https://github.com/vixues/LeAgent/blob/1f16badc834abbd829d3cb7e9f8fcb5b2d57f443/backend/leagent/tools/workflow/workflow_save.py)
- [工作流工具与质量结果](https://github.com/vixues/LeAgent/blob/1f16badc834abbd829d3cb7e9f8fcb5b2d57f443/backend/leagent/tools/workflow/workflow_crud.py)
- [子流程节点](https://github.com/vixues/LeAgent/blob/1f16badc834abbd829d3cb7e9f8fcb5b2d57f443/backend/leagent/workflow/nodes/builtin/subworkflow.py)
- [任务队列协议](https://github.com/vixues/LeAgent/blob/1f16badc834abbd829d3cb7e9f8fcb5b2d57f443/backend/leagent/workflow/queue/base.py)

上游 LICENSE 为 Apache-2.0；后续实际移植应保留适用的许可证、声明及修改记录，并记录来源提交。本轮只新增审查文档，未改动执行代码。
