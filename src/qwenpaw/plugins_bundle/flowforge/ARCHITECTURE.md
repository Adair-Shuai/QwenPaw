# FlowForge 工作流引擎架构文档

> **版本**: 1.0.0
> **位置**: `src/qwenpaw/plugins_bundle/flowforge/`
> **移植来源**: LeAgent 工作流内核（方案 A — 完全重写适配层）
> **最后更新**: 2026-07-25

---

## 目录

1. [总体架构概览](#1-总体架构概览)
2. [目录结构](#2-目录结构)
3. [分层架构详解](#3-分层架构详解)
4. [后端引擎核心](#4-后端引擎核心)
5. [适配层（Adapter Layer）](#5-适配层adapter-layer)
6. [节点系统](#6-节点系统)
7. [IO 层与数据契约](#7-io-层与数据契约)
8. [REST API 与实时通信](#8-rest-api-与实时通信)
9. [前端架构](#9-前端架构)
10. [数据流与执行时序](#10-数据流与执行时序)
11. [关键设计决策](#11-关键设计决策)
12. [扩展指南](#12-扩展指南)

---

## 1. 总体架构概览

FlowForge 是一个完全自包含的 QwenPaw 插件，将 LeAgent 的可视化 DAG 工作流引擎移植到 QwenPaw 的插件体系中。它**不依赖** `leagent` 包——所有 LeAgent 的接口都通过适配层（`engine/adapter/`）桥接到 QwenPaw 的原生能力。

```
┌─────────────────────────────────────────────────────────────────┐
│                     QwenPaw 宿主应用                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ ToolRegistry │  │ ProviderMgr  │  │ WorkspaceManager       │ │
│  │ (原生工具)    │  │ (LLM 提供商)  │  │ (Agent 运行时)          │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘ │
│         │                 │                      │              │
│  ┌──────┴─────────────────┴──────────────────────┴────────────┐ │
│  │              FlowForge Plugin (flowforge/)                  │ │
│  │                                                             │ │
│  │  ┌─────────┐    ┌──────────┐    ┌────────────────────────┐  │ │
│  │  │ Router  │◄──►│ Service  │◄──►│    WorkflowExecutor    │  │ │
│  │  │ (FastAPI)│   │ (运行管理) │    │  (调度+执行管线)        │  │ │
│  │  └────┬────┘    └────┬─────┘    └──────────┬─────────────┘  │ │
│  │       │              │                     │                │ │
│  │       │         ┌────┴─────────────────────┘                │ │
│  │       │         ▼                                              │ │
│  │  ┌────┴────────────────────────────────────────────────┐     │ │
│  │  │           Adapter Layer (engine/adapter/)            │     │ │
│  │  │  ToolRegistry ←→ QwenPaw ToolDescriptor              │     │ │
│  │  │  LLMService   ←→ QwenPaw ProviderManager             │     │ │
│  │  │  AgentRuntime ←→ QwenPaw WorkspaceManager            │     │ │
│  │  └─────────────────────────────────────────────────────┘     │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │           Frontend (ui/dist/index.js)                   │ │ │
│  │  │  ReactFlow DAG 编辑器 + 运行监控面板                       │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 核心设计原则

| 原则 | 说明 |
|------|------|
| **零侵入** | 不修改 QwenPaw 任何底层代码，全部以插件形式封装 |
| **零 leagent 依赖** | 适配层完全替代 `leagent.*` 导入，插件可独立运行 |
| **声明式文档** | 工作流以 `WorkflowDocument`（JSON）持久化，结构即数据 |
| **拓扑调度** | 基于 DAG 拓扑排序的并发批量执行器，自动发现依赖闭包 |
| **实时可观测** | SSE + WebSocket 双通道进度推送，节点级状态实时同步 |
| **可扩展** | 节点注册表支持热加载、文件系统发现、entrypoint 发现 |

---

## 2. 目录结构

```
flowforge/
├── plugin.json              # 插件清单（ID、入口、元数据）
├── plugin.py                # 插件后端入口：注册路由 + 启动钩子 + 服务连接
├── service.py               # 服务层：工作流 CRUD + 运行生命周期管理
├── router.py                # FastAPI 路由：REST API + SSE + WebSocket
├── requirements.txt         # Python 依赖
├── ARCHITECTURE.md          # 本文档
│
├── engine/                  # 工作流引擎核心
│   ├── __init__.py          # 扁平导出（统一入口）
│   ├── types.py             # 运行时模型：状态、条件、结果
│   ├── errors.py            # 错误分类体系
│   ├── document.py          # WorkflowDocument + load/validate
│   ├── progress.py          # 进度事件 + 处理器注册表
│   ├── graph.py             # DynamicPrompt + TopologicalSort + ExecutionList
│   ├── executor.py          # WorkflowExecutor（异步批量执行管线）
│   ├── runner.py            # NodeRunner（缓存→输入解析→执行→重试→回写）
│   ├── state_store.py       # 状态持久化（JSON / 内存）
│   ├── caching.py           # 多级缓存（Null/Basic/LRU/RAM/Hierarchical）
│   ├── cache_provider.py    # 可插拔缓存提供者接口
│   │
│   ├── adapter/             # 适配层（LeAgent → QwenPaw 桥接）
│   │   ├── __init__.py
│   │   ├── tool_base.py         # BaseTool 包装 ToolDescriptor
│   │   ├── tool_registry.py     # ToolRegistry / ToolExecutor 适配
│   │   ├── chat_message.py      # ChatMessage → agentscope Msg
│   │   ├── llm_service.py       # LLMService → ProviderManager
│   │   ├── agent_definition.py  # AgentDefinition / ModelPolicy
│   │   ├── agent_registry.py    # AgentRegistry → QwenPaw AgentConfig
│   │   ├── agent_events.py      # AgentEventType 枚举
│   │   ├── agent_runtime.py     # AgentRuntime → QwenPaw 工作区
│   │   ├── prompts.py           # 控制代理提示词
│   │   ├── sandbox.py           # 进程内 Python 沙箱
│   │   ├── tool_output.py       # 工具产物注册
│   │   ├── service_manager.py   # 服务管理器门面
│   │   ├── execution.py         # 执行范围存根
│   │   ├── domain_registry.py   # 领域模型注册表存根
│   │   └── log_compat.py        # StructuredLogger 兼容层
│   │
│   ├── io/                  # IO 层（文档与执行器之间的桥梁）
│   │   ├── __init__.py
│   │   ├── types.py             # IO / Input / Output 类型系统
│   │   ├── schema.py            # Schema 数据类（节点元数据）
│   │   ├── hidden.py            # Hidden 枚举 + HiddenHolder
│   │   ├── node_output.py       # NodeOutput 结果封装
│   │   ├── contract.py          # 缓存契约钩子
│   │   ├── schema_bridge.py     # JSON Schema → Input 转换
│   │   ├── loader.py            # 工作流文档加载器
│   │   ├── validator.py         # 结构验证器
│   │   ├── serializer.py        # 导出/序列化
│   │   ├── media.py             # 媒体引用
│   │   ├── authoring.py         # 创作辅助
│   │   └── hidden.py            # 隐藏输入
│   │
│   └── nodes/               # 节点系统
│       ├── __init__.py          # 导出 + bootstrap()
│       ├── base.py              # WorkflowNode 抽象基类
│       ├── registry.py          # NodeRegistry（线程安全注册表）
│       ├── compat.py            # 兼容层（旧 API + NodeRunner）
│       ├── loader.py            # 节点发现（内置/entrypoint/文件系统）
│       ├── extension.py         # NodeExtension 打包契约
│       ├── hot_reload.py        # 热重载监视器
│       ├── replacement.py       # 节点替换注册表
│       ├── tool_factory.py      # 工具→节点自动生成工厂
│       ├── agent_exec.py        # 代理执行辅助
│       ├── agent_model.py       # 代理模型辅助
│       ├── agent_node_factory.py# 代理节点工厂
│       ├── domain_model_*.py    # 领域模型节点
│       ├── prompt_resolve.py    # 提示词解析
│       │
│       └── builtin/             # 内置节点（23 种）
│           ├── __init__.py          # BUILTIN_NODES 列表
│           ├── start.py             # StartNode
│           ├── end.py               # EndNode
│           ├── condition.py         # ConditionNode（条件分支）
│           ├── tool_call.py         # ToolCallNode（工具调用）
│           ├── llm_call.py          # LLMCallNode（LLM 调用）
│           ├── script.py            # ScriptNode（Python 脚本）
│           ├── parallel.py          # ParallelNode（并行扇出）
│           ├── wait.py              # WaitNode（延时等待）
│           ├── transform.py         # TransformNode（数据变换）
│           ├── error_handler.py     # ErrorHandlerNode（错误处理）
│           ├── human_review.py      # HumanReviewNode（人工审核）
│           ├── subworkflow.py       # SubworkflowNode（子工作流）
│           ├── quality_gate.py      # QualityGateNode（质量门控）
│           ├── iterative_refine.py  # IterativeRefineNode（迭代优化）
│           ├── preview.py           # PreviewNode（预览）
│           ├── control_agent.py     # ControlAgentNode（控制代理）
│           ├── script_agent.py      # ScriptAgentNode（脚本代理）
│           ├── coding_agent.py      # CodingAgentNode（编程代理）
│           ├── load_image.py        # LoadImageNode（加载图像）
│           ├── load_mesh3d.py       # LoadMesh3DNode（加载 3D 网格）
│           ├── asset_export.py      # AssetExportNode（资产导出）
│           └── export_profiles.py   # 导出配置工具
│
└── ui/                      # 前端
    ├── package.json
    ├── vite.config.ts           # IIFE 构建 + React 外部化 + CSS 内联
    ├── tsconfig.json
    ├── src/
    │   └── index.ts             # 完整前端（1119 行）
    └── dist/
        └── index.js             # 构建产物（供宿主加载）
```

---

## 3. 分层架构详解

FlowForge 采用 **5 层架构**，每层职责单一、依赖单向向下：

```
┌─────────────────────────────────────────────────────────┐
│  L5: 前端 UI 层 (ui/src/index.ts)                        │
│  ReactFlow DAG 编辑器 + 运行监控 + 调色板 + 属性检查器     │
├─────────────────────────────────────────────────────────┤
│  L4: API 层 (router.py)                                  │
│  REST CRUD + SSE 事件流 + WebSocket 实时更新               │
├─────────────────────────────────────────────────────────┤
│  L3: 服务层 (service.py)                                 │
│  工作流持久化 + 运行生命周期 + 进度路由 + 后台事件循环      │
├─────────────────────────────────────────────────────────┤
│  L2: 引擎层 (engine/)                                    │
│  Executor + Graph + Runner + Cache + StateStore           │
├─────────────────────────────────────────────────────────┤
│  L1: 适配层 (engine/adapter/)                            │
│  ToolRegistry / LLMService / AgentRuntime 桥接            │
├─────────────────────────────────────────────────────────┤
│  L0: QwenPaw 宿主能力                                    │
│  ToolDescriptor / ProviderManager / WorkspaceManager      │
└─────────────────────────────────────────────────────────┘
```

### 层间依赖规则

| 层 | 可依赖 | 不可依赖 |
|----|--------|----------|
| L5 前端 | L4 API（通过 HTTP/SSE） | L0-L3 |
| L4 API | L3 Service | L2 引擎内部 |
| L3 Service | L2 引擎 | L1 适配层 |
| L2 引擎 | L1 适配层、L0（通过适配层） | L3/L4 |
| L1 适配层 | L0 QwenPaw 原生 | L2-L4 |

---

## 4. 后端引擎核心

### 4.1 WorkflowDocument（声明式工作流文档）

**文件**: `engine/document.py`

工作流的唯一持久化形态，是前端编辑器、后端 API 和执行器之间的共享数据契约。

```python
class WorkflowDocument(BaseModel):
    id: str                                    # 工作流唯一标识
    name: str = ""                             # 显示名称
    description: str = ""                      # 描述
    nodes: dict[str, dict[str, Any]]           # 节点字典 {node_id: node_def}
    edges: list[dict[str, Any]]                # 边列表（ReactFlow 风格）
    inputs: list[dict[str, Any]]               # 工作流输入参数声明
    outputs: list[str] | dict[str, Any]        # 输出节点 ID 列表或映射
    start_id: str | None                       # 起始节点 ID（可选）
    metadata: dict[str, Any]                   # 元数据（位置、超时等）
    version: str = "1.0"                       # 文档版本
```

**节点定义结构**（`nodes` 字典的 value）：

```json
{
  "class_type": "ToolCallNode",
  "inputs": {
    "tool": "read_file",
    "params": { "path": "${input.file_path}" },
    "retry_count": 3,
    "output": "file_content"
  },
  "control": {
    "next": "process_node",
    "error_handler": "error_node",
    "mode": "run",
    "retry_count": 3,
    "retry_delay_sec": 1.0
  }
}
```

**数据链接**（输入引用上游节点输出）：

```json
"inputs": {
  "content": ["upstream_node_id", 0]
}
```

- `[node_id, slot]` — 单链接：引用 `node_id` 的第 `slot` 个输出
- `[[id1, 0], [id2, 0]]` — 多链接：聚合为列表

**控制流边**（`control` 字典）：

| 字段 | 说明 |
|------|------|
| `next` | 默认后继节点 |
| `conditions` | 条件分支列表 `[{if: expr, then_node: id}]` |
| `else_node` | 条件不匹配时的回退节点 |
| `error_handler` | 错误时跳转的节点 |
| `mode` | 执行模式：`run` / `mute`（静默跳过）/ `bypass`（直通上游） |

### 4.2 图调度原语

**文件**: `engine/graph.py`

#### DynamicPrompt（动态提示词视图）

在原始工作流文档之上叠加一层临时（ephemeral）节点层，支持运行时子图展开（`NodeOutput.expand`）。展开的节点 ID 以 `{parent_id}:{call_idx}:{original_id}` 命名空间隔离。

#### TopologicalSort（拓扑排序器）

从 `DynamicPrompt` 中发现节点的上游依赖（递归遍历 `inputs` 中的 `[upstream_id, slot]` 引用），并跟踪活跃后继者（控制流分支选择后，非选中分支被剪枝）。

#### ExecutionList（执行列表 / 调度器）

核心调度原语，管理节点的生命周期状态机：

```
                ┌─────────┐
                │  ready  │ ← 无依赖或依赖已完成
                └────┬────┘
                     │ stage_ready_batch()
                     ▼
                ┌─────────────┐
                │ in_progress │ ← 正在执行
                └─────┬───────┘
              complete│  fail   │ block
              ┌───────┘    │    │
              ▼            ▼    ▼
        ┌──────────┐ ┌────────┐ ┌─────────┐
        │completed │ │skipped │ │ blocked │
        └──────────┘ └────────┘ └─────────┘
```

关键方法：

| 方法 | 说明 |
|------|------|
| `add_node(seed_id)` | 从种子节点回溯上游依赖闭包，将就绪节点加入 `ready` |
| `stage_ready_batch(limit)` | 批量取出就绪节点移入 `in_progress`，支持并发限制 |
| `complete_node_execution(id)` | 标记完成，提升下游就绪节点 |
| `select_branch(node, chosen)` | 剪枝非选中分支，跳过其子树 |
| `add_external_block(node, tag)` | 暂停节点等待外部事件（如人工审核） |
| `release_external_block(node, tag)` | 释放阻塞，恢复执行 |
| `reopen(node_id)` | 重置已完成节点及其后代（循环回边） |
| `detect_cycles()` | DFS 检测强依赖图中的环 |

### 4.3 WorkflowExecutor（工作流执行器）

**文件**: `engine/executor.py`

编排单次工作流执行的入口，持有所有运行时依赖但不保存跨运行状态。

```
execute_async(doc, inputs, prompt_id)
│
├── 1. validate(doc) → 确定输出节点列表
├── 2. 合并 schema 默认输入 + 用户输入 → WorkflowState
├── 3. 构建 DynamicPrompt + TopologicalSort + ExecutionList
├── 4. 从输出节点回溯，注册依赖闭包到 ExecutionList
├── 5. 检测依赖环
├── 6. 构建 HiddenHolder（注入 tool_context / llm_service / agent_runtime）
│
└── 7. _run_loop():
     ├── while not exec_list.is_done():
     │   ├── 检查超时
     │   ├── batch = await stage_ready_batch(max_parallelism)
     │   ├── 并发执行 batch 中所有节点（asyncio.gather + Semaphore）
     │   └── 对每个结果调用 _apply_node_result():
     │       ├── 记录输出到 upstream_values
     │       ├── 处理 block_execution → 暂停 + 持久化快照
     │       ├── 处理 expand → 子图展开
     │       ├── 处理 next_node → 分支剪枝 + 路由
     │       ├── 处理 error → 错误处理器路由
     │       └── 完成节点 → 提升下游就绪
     │
     └── 8. 汇总结果 → WorkflowResult
```

**并发模型**：使用 `asyncio.Semaphore(max_parallelism)` 限制单批并发量（默认 8）。每批通过 `asyncio.gather` 并发执行，批内节点完成后统一处理结果。

**超时处理**：支持 `metadata.timeout_sec` 配置，通过 `asyncio.wait_for` 包装 gather 调用。

**模式旁路**：`control.mode` 为 `mute` 或 `bypass` 时，跳过实际执行，直接透传上游值。

### 4.4 NodeRunner（节点运行器）

**文件**: `engine/runner.py`（新式）+ `engine/nodes/compat.py`（兼容式）

单节点执行管线，包含完整的缓存、输入解析、重试和进度报告机制。

```
runner.run(node_id, node_def, upstream_values, hidden)
│
├── 1. 从 registry 获取节点类
├── 2. 解析输入（链接引用 → upstream_values 取值）
├── 3. 运行时输入验证（类型/范围/枚举）
├── 4. 实例缓存（node_id → 单例实例）
├── 5. 缓存查找（fingerprint → cache key → output_cache）
│   └── 若命中：set_status(CACHED) → 返回缓存结果
├── 6. 懒输入检查（check_lazy_status）
├── 7. 执行（CurrentNodeContext 上下文）
│   └── 重试策略：瞬态错误（timeout/429/503）指数退避重试
├── 8. 结果验证（NodeOutput 类型检查）
├── 9. 缓存回写（output_cache + cache_provider）
└── 10. set_status(SUCCESS/ERROR/BLOCKED)
```

**瞬态错误判定**：

```python
_TRANSIENT_EXCEPTIONS = (asyncio.TimeoutError, ConnectionError, TimeoutError, OSError)
_TRANSIENT_MARKERS = ("timeout", "timed out", "rate limit", "429", "503", "502", ...)
```

### 4.5 进度系统

**文件**: `engine/progress.py`

每个运行拥有独立的 `ProgressRegistry`，记录所有节点的状态变化并转发给注册的处理器。

```python
class NodeStatus(str, Enum):
    PENDING   = "pending"
    RUNNING   = "running"
    SUCCESS   = "success"
    ERROR     = "error"
    BLOCKED   = "blocked"
    CACHED    = "cached"
    SKIPPED   = "skipped"
    COMPLETED = "completed"   # 兼容
    FAILED    = "failed"      # 兼容
```

`CurrentNodeContext` 使用 `contextvars.ContextVar` 在节点执行协程内自动追踪当前节点 ID，使节点内部可以调用 `progress.update(value=0.5, preview=...)` 而无需显式传递 `node_id`。

### 4.6 状态持久化

**文件**: `engine/state_store.py`

| 实现 | 用途 |
|------|------|
| `JsonWorkflowStateStore` | 默认实现，JSON 文件持久化到 `<flows_dir>/runs/<state_id>.json` |
| `InMemoryWorkflowStateStore` | 测试用内存存储 |

持久化时机：当节点返回 `block_execution`（如人工审核暂停）时，执行器将 `WorkflowRunSnapshot`（状态 + 阻塞节点列表 + prompt_id）持久化，以便后续 `resume()` 恢复。

### 4.7 缓存系统

**文件**: `engine/caching.py` + `engine/cache_provider.py`

| 缓存策略 | 说明 |
|----------|------|
| `NullCache` | 禁用缓存 |
| `BasicCache` | 无界字典，单次运行内有效 |
| `LRUCache` | 基于条目数的 LRU |
| `RAMPressureCache` | 基于近似内存使用量 |
| `HierarchicalCache` | 分层缓存，隔离子图展开帧 |

缓存键由 `CacheKeySet` 生成：

- `CacheKeySetID` — 仅基于 `(node_id, class_type)`
- `CacheKeySetInputSignature` — 基于直接输入签名 + 上游签名

节点的 `fingerprint_inputs()` 返回 `NOT_CACHEABLE` 哨兵可跳过缓存。

---

## 5. 适配层（Adapter Layer）

**位置**: `engine/adapter/`

适配层是 FlowForge 的核心设计——它让 LeAgent 的工作流引擎代码**无需修改**即可在 QwenPaw 上运行，同时完全消除对 `leagent` 包的依赖。

### 5.1 适配映射表

| LeAgent 接口 | 适配层模块 | QwenPaw 原生能力 |
|--------------|-----------|------------------|
| `BaseTool` | `tool_base.py` | `ToolDescriptor`（装饰器函数） |
| `ToolRegistry` | `tool_registry.py` | QwenPaw `ToolRegistry._descs` |
| `ToolExecutor` | `tool_registry.py` | 直接调用 `descriptor.func(**params)` |
| `ChatMessage` | `chat_message.py` | agentscope `Msg` + `TextBlock` |
| `LLMService` | `llm_service.py` | `ProviderManager` → `ChatModelBase` |
| `AgentDefinition` | `agent_definition.py` | QwenPaw `AgentConfig` |
| `AgentRegistry` | `agent_registry.py` | `list_agent_ids()` + `load_agent_config()` |
| `AgentRuntime` | `agent_runtime.py` | `WorkspaceManager` → workspace `.process()` |
| `execute_script` | `sandbox.py` | 独立实现（进程内 `exec` + 安全内置） |
| `ServiceManager` | `service_manager.py` | `PluginRegistry` → `WorkspaceManager` |
| `structlog` | `log_compat.py` | `StructuredLogger` 包装 `logging.Logger` |

### 5.2 工具适配详解

```
QwenPaw ToolDescriptor          BaseTool (adapter)
┌──────────────────┐           ┌──────────────────────┐
│ name: "read_file"│    wrap   │ name: "read_file"     │
│ description: ... │ ────────► │ description: ...      │
│ func: <function> │           │ parameters: JSONSchema│
│ requires_sandbox │           │ category: FILE        │
│   = ["file_read"]│           │ is_read_only: bool    │
└──────────────────┘           │ func: <same function> │
                               └──────────────────────┘
```

`BaseTool` 从函数签名自动推断 JSON Schema（`_build_json_schema`），支持 Python 类型注解 → JSON Schema 类型映射，并处理 `Optional[X]`、`List[X]` 等泛型类型。

`ToolExecutor.execute()` 调用 `descriptor.func(**params)`，自动处理同步/异步函数，并标准化返回值（支持 agentscope `ToolChunk`、`.content`、`.text` 等多种返回类型）。

### 5.3 LLM 适配详解

```
ChatMessage.user("Hello")
       │
       ▼ to_msg()
agentscope Msg(role="user", content=[TextBlock(text="Hello")])
       │
       ▼ LLMService.complete()
ProviderManager.get_active_model() → ChatModelBase.__call__(msgs, **gen_config)
       │
       ▼ _extract_text()
LLMResponse(content="Hi there!", model="...", provider="...")
```

支持 `model="provider/model"` 格式的模型覆盖，或通过 `provider` + `model` 分开指定。

### 5.4 Agent 适配详解

`AgentRuntime` 按优先级尝试三种分发方式：

1. `workspace.process(prompt)` — 单代理工作区
2. `workspace.process_agent_message(agent_id, prompt)` — 多代理工作区
3. 直接 LLM 调用（回退）

`delegate()` 方法将流式事件聚合为标准信封（`text`、`success`、`steps_count`、`activity`、`error`），供 `AgentNode` 消费。

### 5.5 日志兼容

`StructuredLogger` 包装标准 `logging.Logger`，将 structlog 风格的 `logger.info("event", key=value)` 调用转换为 `logger.info("event key=value")`，使 LeAgent 节点代码的日志调用无需修改即可工作。

---

## 6. 节点系统

### 6.1 节点基类

**文件**: `engine/nodes/base.py`

```python
class WorkflowNode(abc.ABC, metaclass=_WorkflowNodeMeta):
    NODE_ID: ClassVar[str] = ""           # 注册 ID
    
    @classmethod
    @abc.abstractmethod
    def define_schema(cls) -> Schema: ... # 声明输入/输出/隐藏/类别
    
    @abc.abstractmethod
    async def execute(self, *, hidden: HiddenHolder, **inputs) -> NodeOutput: ...
    
    def fingerprint_inputs(self, **kwargs) -> Any: ...  # 缓存指纹
    def check_lazy_status(self, **kwargs) -> list[str]: ...  # 懒输入检查
```

### 6.2 兼容层

**文件**: `engine/nodes/compat.py`

提供旧式 API（`run()` 方法 + 类属性 `class_type`/`display_name`/`icon`），使执行器和服务层代码无需修改。兼容层同时注册旧式 7 个基础节点和新式 Schema 驱动的 23 个内置节点。

### 6.3 内置节点清单

| 类别 | 节点 | 说明 |
|------|------|------|
| **控制流** | `StartNode` | 工作流入口 |
| | `EndNode` | 工作流出口 |
| | `ConditionNode` | 条件分支（15 种比较操作符 + AND/OR/NOT 逻辑组合） |
| | `ParallelNode` | 并行扇出执行 |
| | `WaitNode` | 延时等待 |
| | `ErrorHandlerNode` | 错误捕获与处理 |
| | `SubworkflowNode` | 嵌套子工作流 |
| **动作** | `ToolCallNode` | 调用注册工具（支持模板参数 + 重试） |
| | `LLMCallNode` | LLM 补全调用（温度/最大 token 可配） |
| | `ScriptNode` | Python 脚本执行（沙箱） |
| | `TransformNode` | 数据变换 |
| **人机协作** | `HumanReviewNode` | 人工审核暂停（block_execution + resume） |
| | `QualityGateNode` | 质量门控 |
| | `IterativeRefineNode` | 迭代优化循环（有界自纠正） |
| **代理** | `ControlAgentNode` | 控制代理 |
| | `ScriptAgentNode` | 脚本代理 |
| | `CodingAgentNode` | 编程代理 |
| **IO** | `InputNode` | 工作流输入（兼容层） |
| | `OutputNode` | 工作流输出（兼容层） |
| | `PreviewNode` | 预览输出 |
| **资产** | `LoadImageNode` | 加载图像 |
| | `LoadMesh3DNode` | 加载 3D 网格 |
| | `AssetExportNode` | 资产导出 |

### 6.4 工具节点工厂

**文件**: `engine/nodes/tool_factory.py`

自动为每个注册的 QwenPaw 工具生成一个专用的 `WorkflowNode` 子类：

- 节点 ID: `Tool.<tool_name>`（如 `Tool.read_file`）
- 类别: `tools/<category>`（如 `tools/file`）
- 输入: 从工具的 JSON Schema 自动推导（`schema_bridge.json_schema_to_inputs`）
- 输出: 单个 `ANY` 类型 socket

这使得工作流编辑器可以为每个工具渲染带类型化输入控件的专用节点，而非通用的 `ToolCallNode`。

### 6.5 节点注册表

**文件**: `engine/nodes/registry.py`

线程安全（`threading.RLock`），支持：

- `register(cls)` — 注册节点类
- `unregister(node_id)` — 注销（热重载）
- `unregister_module(path)` — 按模块批量注销
- `snapshot()` — 生成 `/object_info` 端点负载
- `schemas()` — 返回所有节点 Schema

### 6.6 节点发现

**文件**: `engine/nodes/loader.py`

三个发现源（按序应用）：

1. **内置节点** — `builtin.BUILTIN_NODES` 列表
2. **Entrypoint** — Python 包声明 `flowforge.workflow.nodes` entrypoint 组
3. **文件系统** — `~/.flowforge/custom_nodes/*.py` 目录扫描

每个模块可暴露 `NODE_CLASSES: list[type[WorkflowNode]]` 或异步 `flowforge_entrypoint() -> NodeExtension`。

---

## 7. IO 层与数据契约

### 7.1 类型系统

**文件**: `engine/io/types.py`

```python
class IO:
    String   = _IOFactory("STRING")
    Int      = _IOFactory("INT")
    Float    = _IOFactory("FLOAT")
    Boolean  = _IOFactory("BOOLEAN")
    Object   = _IOFactory("OBJECT")
    Any      = _IOFactory("*")        # 通配符类型
```

每种类型有 `.Input(id=..., ...)` 和 `.Output(id=...)` 工厂方法。`types_compatible(from, to)` 检查连线类型兼容性（`*` 与任何类型兼容）。

### 7.2 Schema（节点元数据）

**文件**: `engine/io/schema.py`

每个节点类通过 `define_schema()` 声明其元数据：

```python
Schema(
    node_id="ToolCallNode",
    display_name="Tool Call",
    category="workflow/action",
    description="...",
    inputs=[IO.String.Input(id="tool"), ...],
    outputs=[IO.Any.Output(id="result")],
    hidden=[Hidden.UNIQUE_ID, Hidden.TOOL_CONTEXT, ...],
    not_idempotent=True,      # 不缓存
    enable_expand=False,       # 不支持子图展开
    control_flow=False,        # 非控制流节点
)
```

### 7.3 NodeOutput（结果封装）

**文件**: `engine/io/node_output.py`

```python
@dataclass
class NodeOutput:
    values: Any = None               # 位置输出值（匹配 RETURN_TYPES）
    ui: dict | None = None           # UI 载荷（WebSocket 推送）
    expand: dict | None = None       # 子图展开描述
    block_execution: str | None      # 阻塞标签（如 "awaiting_review"）
    next_node: str | None = None     # 控制流路由覆盖
    error: str | None = None         # 错误信息
    metadata: dict = field(...)      # 执行元数据
```

### 7.4 HiddenHolder（隐藏输入注入）

**文件**: `engine/io/hidden.py`

引擎自动注入的上下文，节点通过 Schema 声明所需隐藏输入：

| Hidden 字段 | 注入内容 |
|-------------|---------|
| `UNIQUE_ID` | 当前节点 ID |
| `PROMPT` | 完整工作流文档节点字典 |
| `DYNPROMPT` | DynamicPrompt 实例 |
| `EXECUTION_ID` | 运行 ID (prompt_id) |
| `TOOL_CONTEXT` | `_ContextShim`（桥接到执行器） |
| `LLM_SERVICE` | LLM 服务适配器 |
| `AGENT_RUNTIME` | Agent 运行时适配器 |
| `WORKFLOW_STATE` | `WorkflowState` 可变状态 |
| `PROGRESS` | `ProgressRegistry` 进度注册表 |
| `ABORT_EVENT` | 取消事件 |

### 7.5 模板解析

`WorkflowState` 支持 `${variable.path}` 模板表达式，在运行时解析：

- `${input.file_path}` — 工作流输入参数
- `${var.result}` — 工作流变量
- `${outputs.node_id}` — 节点输出
- `${state.workflow_id}` — 状态元数据

支持点号嵌套路径和递归解析（dict / list 中的模板也会被解析）。

---

## 8. REST API 与实时通信

### 8.1 API 端点

所有端点挂载在 `/api/flowforge` 前缀下。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/health` | 健康检查 |
| `GET` | `/node-types` | 列出所有注册节点类型 |
| `GET` | `/flows` | 列出所有工作流 |
| `POST` | `/flows` | 创建/更新工作流 |
| `GET` | `/flows/{id}` | 获取工作流 |
| `PUT` | `/flows/{id}` | 更新工作流 |
| `DELETE` | `/flows/{id}` | 删除工作流 |
| `POST` | `/flows/{id}/validate` | 验证已保存的工作流 |
| `POST` | `/flows/validate` | 验证工作流载荷（未保存） |
| `POST` | `/flows/{id}/run` | 启动运行 → `{run_id}` |
| `GET` | `/runs` | 列出所有运行 |
| `GET` | `/runs/{run_id}` | 获取运行状态 |
| `POST` | `/runs/{run_id}/cancel` | 取消运行 |
| `POST` | `/runs/{run_id}/resume` | 恢复暂停的运行 |
| `GET` | `/runs/{run_id}/events` | SSE 事件流 |
| `WS` | `/ws` | WebSocket 实时更新 |

### 8.2 SSE 事件流

```
GET /api/flowforge/runs/{run_id}/events
Accept: text/event-stream
```

事件格式：

```
data: {"type": "execution_start", "prompt_id": "...", "data": {...}}

data: {"type": "node_running", "prompt_id": "...", "node_id": "...", "state": {...}}

data: {"type": "node_success", "prompt_id": "...", "node_id": "...", "state": {...}}

data: {"type": "execution_completed", "prompt_id": "...", "data": {"outputs": {...}}}
```

SSE 端点以 100ms 轮询 `ProgressRegistry.history()`，增量推送新事件。运行完成后推送终止事件并关闭流。

### 8.3 WebSocket

WebSocket 端点支持 `subscribe` / `ping` 控制消息，订阅后通过 `ProgressRegistry.attach_queue()` 接收实时事件推送（无需轮询）。运行完成后推送 `run_finished` 消息。

### 8.4 后台事件循环

`WorkflowService` 在独立守护线程上运行专用 `asyncio` 事件循环，使工作流运行的生命周期与任何单个 HTTP 请求解耦。`asyncio.run_coroutine_threadsafe()` 将协程调度到后台循环，返回 `concurrent.futures.Future` 供主线程查询/取消。

---

## 9. 前端架构

### 9.1 构建配置

**文件**: `ui/vite.config.ts`

| 配置 | 值 | 原因 |
|------|----|------|
| 格式 | IIFE | 宿主通过 `<script>` 加载，非模块系统 |
| React | 外部化 | 宿主提供 `window.QwenPaw.host.React` |
| ReactDOM | 外部化 | 宿主提供 `window.QwenPaw.host.ReactDOM` |
| JSX | classic (`React.createElement`) | 避免 jsx-runtime 冲突（React 错误 #31） |
| Banner | React/process shim | IIFE 执行前注入全局 React/process |
| ReactFlow CSS | 内联（`?inline`） | blob URL 上下文无法加载外部 CSS |
| Minify | false | 便于调试 |
| Target | es2020 | 兼容性 |

### 9.2 组件架构

```
FlowForgeApp (顶层状态管理)
├── FlowListPage (工作流列表)
│   ├── 搜索 / 新建 / 刷新
│   ├── Table (ID / 名称 / 描述 / 节点数 / 操作)
│   └── 新建工作流 Modal
│
├── FlowEditorPage (DAG 编辑器)
│   ├── Toolbar (返回 / 标题 / 验证状态 / 保存 / 运行)
│   ├── Node Palette (240px 侧边栏)
│   │   ├── 搜索框
│   │   └── 按类别分组的节点列表（点击添加）
│   ├── ReactFlow Canvas
│   │   ├── NodeCard (240×120 自定义节点)
│   │   ├── LabeledEdge (贝塞尔曲线 + 标签编辑 + 删除)
│   │   ├── Background (点阵背景)
│   │   ├── Controls (缩放/居中)
│   │   ├── MiniMap (小地图)
│   │   └── Alignment Panel (对齐工具)
│   ├── Inspector Drawer (380px 属性面板)
│   │   ├── 节点 ID / 类型 / 标签
│   │   ├── TypedInput (类型化输入字段)
│   │   └── Control Section (重试 / 模式 / 输出变量)
│   └── IO Config Modal (输入/输出配置)
│
└── RunMonitorDrawer (560px 运行监控)
    ├── 状态头 (状态标签 / 耗时 / Flow ID)
    ├── Tabs
    │   ├── 节点状态 (节点 ID + 状态标签)
    │   ├── 输出 (JSON 预览)
    │   ├── 错误 (错误列表)
    │   └── 事件流 (Timeline)
    └── 取消运行按钮
```

### 9.3 节点卡片规格

```css
width: 240px;
min-width: 240px;
max-width: 240px;
min-height: 120px;
```

| 元素 | 规格 |
|------|------|
| 图标 | 16px emoji |
| 标签 | 加粗，颜色随节点类型变化 |
| 状态标签 | antd Tag，颜色随状态变化 |
| 描述 | 11px，灰色，溢出省略 |
| 节点 ID | 10px，等宽字体，底部 |
| Handle | 左侧 target，右侧 source |

### 9.4 节点颜色映射

| 节点类型 | 颜色 |
|----------|------|
| StartNode / InputNode | `#52c41a` (绿) |
| EndNode / OutputNode | `#fa541c` (橙红) |
| ToolCallNode / ToolNode | `#1677ff` (蓝) |
| AgentNode | `#722ed1` (紫) |
| ConditionNode | `#faad14` (金黄) |
| LLMCallNode / LLMNode | `#13c2c2` (青) |
| CodeNode / ScriptNode | `#eb2f96` (品红) |
| ParallelNode | `#874d00` (深棕) |
| HumanReviewNode | `#d4380d` (深橙) |
| SubworkflowNode | `#5b8c00` (橄榄绿) |

### 9.5 状态颜色映射

| 状态 | 颜色 |
|------|------|
| completed / success | `#52c41a` |
| running | `#1677ff` |
| failed / error | `#ff4d4f` |
| skipped | `#bfbfbf` |
| blocked | `#faad14` |
| cancelled | `#fa8c16` |

### 9.6 对齐工具

| 工具 | 图标 | 条件 |
|------|------|------|
| 左对齐 | `AlignLeftOutlined` | 选中 ≥ 2 节点 |
| 右对齐 | `AlignRightOutlined` | 选中 ≥ 2 节点 |
| 顶部对齐 | `VerticalAlignTopOutlined` | 选中 ≥ 2 节点 |
| 底部对齐 | `VerticalAlignBottomOutlined` | 选中 ≥ 2 节点 |
| 水平分布 | `H··` | 选中 ≥ 3 节点 |
| 垂直分布 | `V··` | 选中 ≥ 3 节点 |

### 9.7 插件注册

前端通过 `window.QwenPaw.route.add()` 注册路由，`window.QwenPaw.menu.add()` 注册侧边栏菜单项。使用轮询检测 `window.QwenPaw.host` 可用性，确保在宿主加载完成后自动注册。

---

## 10. 数据流与执行时序

### 10.1 编辑→保存→运行 完整时序

```
用户操作              前端                 后端
─────────────────────────────────────────────────────────────
点击"新建工作流"  ──►  POST /flows         ──►  service.save_flow()
                                                      │
                                                      ▼
                                              ~/.qwenpaw/flowforge/
                                              flows/{id}.json
                                                      │
跳转到编辑器     ──►  GET /flows/{id}      ──►  service.get_flow()
                ──►  GET /node-types       ──►  service.node_types()
                                                      │
                                                      ▼
                                              NodeRegistry.all_types()
                                              → [{class_type, display_name,
                                                  icon, category, ...}]

拖拽节点到画布   ──►  (前端状态更新)
连接节点         ──►  (前端状态更新)
点击"保存"       ──►  PUT /flows/{id}       ──►  service.save_flow()
                                                      │
                                                      ▼
                                              doc = load(payload)
                                              validate(doc, registry)
                                              → JSON 持久化

点击"运行"       ──►  POST /flows/{id}/run ──►  service.start_run()
                                                      │
                                                      ▼
                                              doc = load(flow_payload)
                                              progress = ProgressRegistry()
                                              future = run_coroutine_threadsafe(
                                                executor.execute_async(doc, inputs),
                                                background_loop
                                              )
                                              → {run_id}

打开运行监控     ──►  GET /runs/{run_id}    ──►  handle.to_dict()
                ──►  EventSource(events)    ──►  SSE 流:
                                                      │
                                                      ▼
                                              while not done:
                                                yield new events
                                                sleep(100ms)
                                              yield terminal event
```

### 10.2 节点执行内部时序

```
stage_ready_batch() → [node_a, node_b]
                          │           │
                 ┌────────┘           └────────┐
                 ▼                             ▼
          _execute_node(a)             _execute_node(b)
                 │                             │
          ┌──────┴──────┐              ┌──────┴──────┐
          │ mode check  │              │ mode check  │
          └──────┬──────┘              └──────┬──────┘
                 │ run/bypass                  │ run/bypass
                 ▼                             ▼
          runner.run(a)                runner.run(b)
                 │                             │
          ┌──────┴──────┐              ┌──────┴──────┐
          │ resolve_in  │              │ resolve_in  │
          │ validate    │              │ validate    │
          │ cache check │              │ cache check │
          │ execute()   │              │ execute()   │
          │ retry?      │              │ retry?      │
          │ cache write │              │ cache write │
          └──────┬──────┘              └──────┬──────┘
                 │                             │
                 ▼                             ▼
          NodeOutput                      NodeOutput
                 │                             │
                 └──────────┬──────────────────┘
                            ▼
                   _apply_node_result()
                            │
                   ┌────────┴────────┐
                   │ upstream_values │
                   │ block? → pause  │
                   │ expand? → splice│
                   │ next_node? → route
                   │ error? → handler│
                   │ complete → promote downstream
                   └─────────────────┘
```

---

## 11. 关键设计决策

### 11.1 为什么选择 IIFE 而非 ES Module？

QwenPaw 宿主通过 blob URL 加载插件脚本（`URL.createObjectURL`），blob URL 在某些浏览器中不支持 `import` 语句。IIFE 格式将所有代码打包到单个自执行函数中，不依赖模块加载器。

### 11.2 为什么内联 ReactFlow CSS？

ReactFlow 的 CSS 文件通过 `<link>` 标签加载时，在 blob URL 上下文中会因路径解析失败而不生效。通过 Vite 的 `?inline` 导入将 CSS 作为字符串嵌入 JS，运行时注入 `<style>` 标签。

### 11.3 为什么使用后台事件循环？

FastAPI 的 TestClient 和某些部署模式下，每个请求可能使用独立的事件循环。如果工作流运行绑定到请求循环，请求结束后运行会被取消。独立的后台 `asyncio` 循环确保运行生命周期与请求解耦。

### 11.4 为什么有兼容层（compat.py）？

LeAgent 原始节点使用 `run()` 方法和类属性 API，而移植后的 Schema 驱动节点使用 `define_schema()` + `execute()` 方法。兼容层让两种 API 共存于同一个 `NodeRegistry` 中，`NodeRunner` 自动检测并路由到正确的执行路径。

### 11.5 为什么适配层不直接调用 leagent？

适配层的核心目标是**完全消除 leagent 依赖**。这样 FlowForge 插件可以独立分发和运行，不需要安装 leagent 包。所有 leagent 的接口都由适配层重新实现，桥接到 QwenPaw 的原生能力。

---

## 12. 扩展指南

### 12.1 添加新节点类型

1. 创建 `engine/nodes/builtin/my_node.py`：

```python
from ...io import IO, Hidden, HiddenHolder, NodeOutput, Schema
from ..base import WorkflowNode

class MyNode(WorkflowNode):
    NODE_ID = "MyNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id="MyNode",
            display_name="My Node",
            category="workflow/custom",
            description="Does something useful.",
            inputs=[
                IO.String.Input(id="text", tooltip="Input text"),
            ],
            outputs=[IO.String.Output(id="result")],
            hidden=[Hidden.UNIQUE_ID, Hidden.WORKFLOW_STATE],
        )

    async def execute(self, *, hidden: HiddenHolder, **inputs: Any) -> NodeOutput:
        text = inputs.get("text", "")
        result = text.upper()
        return NodeOutput(values=(result,))
```

2. 在 `engine/nodes/builtin/__init__.py` 中注册：

```python
try:
    from .my_node import MyNode
    BUILTIN_NODES.append(MyNode)
except Exception:
    pass
```

### 12.2 通过文件系统添加节点

在 `~/.flowforge/custom_nodes/` 下创建 `.py` 文件：

```python
from flowforge.engine.io import IO, Hidden, HiddenHolder, NodeOutput, Schema
from flowforge.engine.nodes.base import WorkflowNode

NODE_CLASSES = [MyCustomNode]  # 模块级列表
```

### 12.3 连接新的 QwenPaw 服务

在 `plugin.py` 的 `_wire_services()` 中添加连接逻辑：

```python
def _wire_services(self) -> None:
    # ... 现有工具/LLM/Agent 连接 ...
    
    # 连接新服务
    from .engine.adapter import SomeNewAdapter
    executor.some_service = SomeNewAdapter(qwenpaw_native_service)
```

### 12.4 添加新的 REST 端点

在 `router.py` 的 `build_router()` 中添加：

```python
@router.post("/flows/{flow_id}/export")
async def export_flow(flow_id: str) -> dict[str, Any]:
    flow = service.get_flow(flow_id)
    # 导出逻辑
    return {"exported": True}
```

### 12.5 前端添加新功能

在 `ui/src/index.ts` 中修改对应组件，然后重新构建：

```bash
cd src/qwenpaw/plugins_bundle/flowforge/ui
npm run build
```

构建产物 `dist/index.js` 会自动被宿主加载。

---

## 附录 A: 错误分类体系

| 错误类 | 场景 | 处理方式 |
|--------|------|---------|
| `WorkflowEngineError` | 引擎基础错误 | 基类 |
| `ValidationError` | 文档验证失败 | 返回错误列表给前端 |
| `DependencyCycleError` | 依赖环检测 | 中止运行 |
| `NodeExecutionError` | 节点执行失败 | 路由到 error_handler 或标记失败 |
| `BlockedError` | 外部阻塞 | 暂停运行，等待 resume |

## 附录 B: 配置项

| 配置 | 位置 | 默认值 | 说明 |
|------|------|--------|------|
| 工作流存储目录 | `~/.qwenpaw/flowforge/flows/` | - | JSON 文件持久化 |
| 运行快照目录 | `~/.qwenpaw/flowforge/runs/` | - | 暂停/恢复快照 |
| 最大并发 | `WorkflowExecutor.max_parallelism` | 8 | 单批并发节点数 |
| 缓存模式 | `WORKFLOW_CACHE_MODE` 环境变量 | classic | classic/lru/ram/none |
| SSE 轮询间隔 | `router.py` | 100ms | 事件流推送频率 |
| 运行状态轮询 | `RunMonitorDrawer` | 2000ms | 前端状态刷新频率 |

## 附录 C: 内置节点 Schema 速查

### ConditionNode

```json
{
  "inputs": [],
  "outputs": [{"id": "result", "type": "OBJECT"}],
  "control": {
    "conditions": [
      {"if": {"left": "${var.score}", "operator": "gt", "right": 0.8}, "then_node": "approve"},
      {"if": {"left": "${var.score}", "operator": "lt", "right": 0.5}, "then_node": "reject"}
    ],
    "else_node": "manual_review"
  }
}
```

### ToolCallNode

```json
{
  "inputs": {
    "tool": "read_file",
    "params": {"path": "${input.file_path}"},
    "retry_count": 3,
    "retry_delay_sec": 1.0,
    "output": "file_content"
  }
}
```

### LLMCallNode

```json
{
  "inputs": {
    "prompt": "Summarize: ${outputs.read_file}",
    "model": "deepseek/deepseek-chat",
    "temperature": 0.1,
    "max_tokens": 4096,
    "output": "summary"
  }
}
```

### HumanReviewNode

```json
{
  "inputs": {
    "reviewer": "admin",
    "review_prompt": "Please review: ${outputs.generate}",
    "timeout_sec": 86400,
    "output": "review_decision"
  }
}
```

### IterativeRefineNode

```json
{
  "inputs": {
    "max_iterations": 3,
    "iteration_var": "refine_iteration",
    "feedback": "${outputs.quality_gate.feedback}"
  },
  "control": {
    "retry_node": "generate",
    "exhausted_node": "final_output"
  }
}
```
