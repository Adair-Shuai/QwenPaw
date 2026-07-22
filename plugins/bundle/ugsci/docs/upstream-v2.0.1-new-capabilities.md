# QwenPaw v2.0.1 新增能力与接口文档

> 上游合并日期：2026-07-21  
> 上游版本：v2.0.1b1（从 v2.0.0 升级）  
> 合并提交：`0c39b5ec` (Merge remote-tracking branch 'upstream/main' into lobehub-style)

---

## 目录

1. [PawApp SDK — 应用开发框架](#1-pawapp-sdk--应用开发框架)
2. [ReMe Light 记忆系统增强](#2-reme-light-记忆系统增强)
3. [Token 使用量追踪增强](#3-token-使用量追踪增强)
4. [多 Agent 启动优化](#4-多-agent-启动优化)
5. [Langfuse 可观测性增强](#5-langfuse-可观测性增强)
6. [默认循环重构为 Agent Mode](#6-默认循环重构为-agent-mode)
7. [Bug 修复](#7-bug-修复)
8. [对 UGSci 插件开发的影响与演进路线](#8-对-ugsci-插件开发的影响与演进路线)

---

## 1. PawApp SDK — 应用开发框架

**提交**: `8a9f8ab0` (#6150)  
**规模**: ~7000 行新增代码，涉及 40 个文件  
**核心模块**: `src/qwenpaw/pawapp/`

PawApp SDK 是本次最大的新增功能，提供了一套高于 PluginApi 的应用开发范式，让开发者可以用装饰器模式快速构建带前后端的 AI 应用。

### 1.1 架构概览

```
┌─────────────────────────────────────────────────────┐
│                   PawApp SDK                         │
│                                                     │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │ PawApp   │   │ PawAppContext│   │ TaskManager │ │
│  │ (装饰器) │──▶│ (ctx 对象)   │   │ (长任务+SSE)│ │
│  └──────────┘   └──────────────┘   └─────────────┘ │
│       │                │                  │         │
│       ▼                ▼                  ▼         │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │ PluginApi│   │ Workspace    │   │ SSEChannel  │ │
│  │ (底层)   │   │ (Agent对话)  │   │ (实时推送)  │ │
│  └──────────┘   └──────────────┘   └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 1.2 后端 SDK — `PawApp` 类

**源文件**: `src/qwenpaw/pawapp/app.py`  
**导入**: `from qwenpaw.pawapp import PawApp, PawAppContext, get_ctx`

`PawApp` 是对底层 `PluginApi` 的薄封装，提供装饰器语法糖。在插件加载时由 `PluginLoader` 调用 `register(api)` 注入真实 API 实例，之前的装饰器注册会被缓冲，在 `register` 时统一应用。

#### 装饰器 API

| 装饰器 | 用途 | 示例 |
|--------|------|------|
| `@app.route(path, methods=["POST"])` | 注册 HTTP 路由，handler 自动注入 `ctx` | `@app.route("/analyze")` |
| `@app.tool(name, description, icon, enabled)` | 注册 Agent 可调用的工具 | `@app.tool("run_sim", icon="🚀")` |
| `@app.command(name, description)` | 注册斜杠命令 | `@app.command("/deck")` |
| `@app.hook(phase, priority)` | 注册生命周期钩子 (startup/shutdown) | `@app.hook("startup", priority=80)` |
| `@app.on_install` | 首次安装时调用 | |
| `@app.on_launch` | 每次会话启动时调用 | |
| `@app.on_terminate` | 会话关闭时调用 | |
| `@app.on_uninstall` | 卸载时调用 | |
| `app.include_router(router)` | 挂载 FastAPI Router | |

#### 使用示例

```python
from qwenpaw.pawapp import PawApp, get_ctx
from fastapi import APIRouter, Depends

app = PawApp(name="My App", app_id="my-app")

# 装饰器模式：注册 HTTP 路由
@app.route("/analyze", methods=["POST"])
async def analyze(ctx, deck_path: str, engine: str = "eclipse"):
    # ctx 自动注入，可调用 Agent 能力
    result = run_simulation(deck_path, engine)
    reply = await ctx.chat(f"请分析以下模拟结果：{result.summary}")
    return {"analysis": reply.text}

# 装饰器模式：注册 Agent 工具
@app.tool("run_simulation", description="启动数值模拟", icon="🚀")
async def run_sim(ctx, deck_path: str):
    job_id = launch(deck_path)
    await ctx.ui.push("launched", {"job_id": job_id})
    return {"job_id": job_id}

# Router 模式：挂载 FastAPI Router
router = APIRouter()

@router.get("/projects")
async def list_projects(ctx=Depends(get_ctx)):
    return await ctx.storage.get("projects", default=[])

app.include_router(router)
```

### 1.3 上下文对象 — `PawAppContext` (ctx)

**源文件**: `src/qwenpaw/pawapp/context.py`

`ctx` 是 PawApp 开发者与 QwenPaw 核心能力交互的网关。由 `get_ctx` 依赖注入按请求创建。

#### ctx 属性与方法

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `ctx.app_id` | `str` | 当前应用 ID |
| `ctx.agent_id` | `str` | 当前 Agent ID（默认 "default"） |
| `ctx.channel` | `str` | 渠道名称（console / dingtalk 等） |
| `ctx.user_id` | `str` | 用户标识 |
| `ctx.user` | `Dict` | 用户信息（id, timezone, locale） |
| `ctx.config` | `Dict` | 当前配置（active_model 等） |

#### ctx.chat() — 调用 Agent 对话

```python
# 同步获取回复
reply = await ctx.chat("请分析这个模拟结果的收敛性")
print(reply.text)

# 流式获取
async for event in ctx.chat_stream("分析结果"):
    print(event)
```

**参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `message` | `str` | (必填) | 发送给 Agent 的消息 |
| `skill` | `str?` | `None` | 可选技能调用 |
| `session_id` | `str?` | `f"pawapp:{app_id}"` | 会话 ID |
| `channel` | `str?` | ctx.channel | 渠道 |
| `user_id` | `str?` | ctx.user_id | 用户 ID |

**返回**: `ChatReply` 对象，`.text` 属性提取最终文本，`.chunks` 获取原始流数据。

#### ctx.get_session_history() — 获取对话历史

```python
messages = await ctx.get_session_history()
# 返回 List[Dict]，包含历史消息
```

#### ctx.storage — 命名空间 KV 存储

```python
# 基于 SafeJSONSession 的命名空间存储
await ctx.storage.set("project_config", {"engine": "eclipse", "deck": "case1.data"})
config = await ctx.storage.get("project_config", default={})
await ctx.storage.delete("project_config")
keys = await ctx.storage.keys()
await ctx.storage.clear_namespace()
```

存储命名空间为 `f"pawapp:{app_id}"`，不同应用的数据相互隔离。

#### ctx.tools — 工具调用代理

```python
# 调用其他已注册的工具
result = await ctx.tools.invoke("read_simulation_results", {"job_id": "12345"})
```

#### ctx.ui — 实时 UI 通信

```python
# 非阻塞推送：向前端发送实时事件
await ctx.ui.push("progress", {"step": 2, "total": 10})

# 阻塞等待：暂停直到前端用户响应
decision = await ctx.ui.confirm("检测到孔隙度异常值，是否继续？", timeout=300)
if decision["action"] == "approve":
    proceed()
```

UIBridge 通过 SSE (Server-Sent Events) 和 ApprovalService 实现 Agent → UI 的实时通信。

#### ctx.toast() — 前端弹窗通知

```python
await ctx.toast("模拟已完成", kind="success")
# kind: "info" | "success" | "warning" | "error"
```

#### ctx.notify() — 多渠道通知

```python
await ctx.notify(
    channels=["dingtalk", "feishu"],
    title="模拟任务完成",
    body="ECLIPSE 模拟已运行完毕，请查看结果",
)
```

#### ctx.settings — 应用配置

```python
# 读取 manifest 中 meta.settings 定义的配置
timeout = ctx.settings.get("simulation_timeout", default=3600)
```

### 1.4 长任务管理 — TaskManager + SSEChannel

**源文件**: `src/qwenpaw/pawapp/task.py`

为长时间运行的任务提供 SSE 实时推送基础设施。

#### 后端 API

```python
from qwenpaw.pawapp.task import get_task_manager

task_manager = get_task_manager()

# 创建长任务
task_id = await task_manager.create_task(
    app_id="ugsci",
    handler=my_long_running_handler,  # async def handler(ctx, **params)
    ctx=ctx,
    params={"deck_path": "case1.data"},
)

# 前端通过 SSE 订阅事件
# GET /api/pawapps/{app_id}/task/{task_id}/stream
async for event_str in task_manager.stream(task_id):
    yield event_str  # SSE 格式字符串
```

#### SSEChannel 事件格式

```json
// ctx.ui.push("progress", {"step": 2}) 发送的事件：
{"type": "pawapp:ui_event", "event": "progress", "data": {"step": 2}}

// 任务完成事件：
{"type": "done", "data": {...}}

// 任务错误事件：
{"type": "error", "message": "..."}
```

#### 前端订阅

```typescript
const task = paw.api.task("/run_simulation", { deck_path: "case1.data" });

task.on("progress", (data) => {
  setProgress(data.step);
});

task.on("done", (result) => {
  console.log("完成:", result);
});

task.on("error", (err) => {
  console.error("失败:", err.message);
});

const finalResult = await task.result;
task.cancel(); // 取消任务
```

### 1.5 PawApp REST API

**源文件**: `src/qwenpaw/app/routers/pawapps.py`  
**路由前缀**: `/api/pawapps`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/pawapps` | 列出所有已安装的 PawApp |
| GET | `/api/pawapps/{app_id}` | 获取单个 PawApp 详情 |
| DELETE | `/api/pawapps/{app_id}` | 卸载 PawApp |
| GET | `/api/pawapps/{app_id}/settings` | 获取 PawApp 设置 schema |
| GET | `/api/pawapps/{app_id}/static/{file_path}` | 提供静态文件服务 |

### 1.6 前端 SDK

**源文件**: `console/src/plugins/pawapp-sdk/`

| 文件 | 说明 |
|------|------|
| `types.ts` | TypeScript 类型定义 |
| `api.ts` | 后端 API 通信（post / get / stream / task） |
| `host.ts` | 宿主能力封装（chat / storage / toast / notify） |
| `task.ts` | PawTask 长任务 SSE 订阅 |
| `index.ts` | SDK 入口，组装 `paw` 全局对象 |

#### 前端 SDK 接口

```typescript
// paw.api — 后端 API 通信
paw.api.post<T>("/analyze", { deck_path: "..." })
paw.api.get<T>("/projects")
paw.api.stream("/chat", { message: "..." })  // AsyncGenerator
paw.api.task("/run_sim", { deck: "..." })     // PawTaskHandle

// paw.host — 宿主能力
paw.host.chat("分析这个结果")        // Promise<string>
paw.host.storage.get("key")         // Promise<T>
paw.host.storage.set("key", value)  // Promise<void>
paw.host.toast("完成", "success")    // Promise<void>
paw.host.notify("标题", "内容")      // Promise<void>
```

#### PawTaskHandle 接口

```typescript
interface PawTaskHandle {
  on(event: string, handler: (data: unknown) => void): PawTaskHandle;
  off(event: string, handler: (data: unknown) => void): PawTaskHandle;
  cancel(): void;
  readonly result: Promise<unknown>;
  readonly taskId: string;
}
```

### 1.7 应用中心（AppCenter）

**源文件**: `console/src/pages/AppCenter/`

新增的 Console 页面，用于展示和管理 PawApp 应用：
- 已安装应用网格展示（支持搜索和分类筛选）
- 应用市场（AppMarket）支持浏览和安装
- 应用内嵌渲染（不跳转页面，URL 镜像同步）
- 导航菜单位置：侧边栏新增「应用中心」入口

### 1.8 插件清单格式 (plugin.json)

PawApp 类型的插件需要在 `plugin.json` 中声明 `meta.pawapp` 字段：

```json
{
  "id": "my-app",
  "name": "My App",
  "version": "0.1.0",
  "type": "app",
  "entry": {
    "backend": "backend/main.py",
    "frontend": "ui/index.js"
  },
  "qwenpaw_version": { "min": "2.0.1" },
  "meta": {
    "pawapp": {
      "icon": "🔬",
      "category": "science",
      "entry_page": "/apps/my-app",
      "launch_scope": "page"
    },
    "permissions": {
      "chat": true,
      "storage": true
    },
    "settings": []
  }
}
```

### 1.9 参考实现：Agent Kanban

**源文件**: `plugins/apps/agent-kanban/`

上游附带了一个完整的 Kanban 看板应用作为 PawApp SDK 的参考实现：
- 5 列看板（待规划 → 等待调度 → 进行中 → 审核中 → 已完成）
- Agent 自动调度，智能分配任务
- SSE 实时流式输出任务执行过程
- 拖拽操作切换任务状态
- 支持任务视图和 Agent 视图切换
- 后端 1313 行 Python + 前端 1547 行 JS

---

## 2. ReMe Light 记忆系统增强

**提交**: `872c8158` (#6235)

### 2.1 手动重建记忆索引

**新增 API**: `POST /api/agents/{agent_id}/memory/reindex`

```bash
curl -X POST http://localhost:8088/api/agents/{agent_id}/memory/reindex
```

**响应**:
```json
{
  "status": "ok",
  "message": "Memory index rebuilt successfully",
  "details": { "chunks_indexed": 42 }
}
```

**特性**:
- 使用 async lock 防止并发重建冲突
- 移除了旧的 `rebuild_memory_index_on_start` 配置项（改为手动触发）
- Console UI 提供确认对话框和警告提示
- 后端在 `BaseMemoryManager` 和 `ReMeLightManager` 中实现 `rebuild_index()` 方法

**前端调用**:
```typescript
import { agentsApi } from "@/api/modules/agents";

await agentsApi.reindexMemory(agentId);
```

### 2.2 Dream 任务随机延迟

- 定时 dream（记忆整理）任务增加 0-60 秒随机延迟
- 避免多个 Agent 同时调用记忆整理导致资源争抢
- 配置项 `dream_cron` 文档已更新

### 2.3 其他改进

- `reme-ai` 依赖升级至 `0.4.1.3`
- OpenAI 嵌入模型支持 `use_dimensions` 字段
- `log_to_console` 设置项用于控制 ReMe 日志输出
- 多语言文案更新：将 "memory manager" 改为 "long-term memory management"

---

## 3. Token 使用量追踪增强

**提交**: `f7d5225e` (#6159), `78c77257` (#6220)

### 3.1 每轮 Token/上下文用量

在所有渠道（Channel）中注入每轮对话的 token 和上下文使用量。

**影响文件**:
- `src/qwenpaw/app/channels/base.py` — 基础渠道增加 token 追踪（+120 行）
- `src/qwenpaw/app/channels/console/channel.py` — Console 渠道适配
- `src/qwenpaw/token_usage/turn_usage.py` — 核心追踪逻辑重构

### 3.2 缓存持久化修复

修复了关闭时未种子化的缓存被错误持久化的问题（`src/qwenpaw/token_usage/buffer.py`）。

### 3.3 前端展示

`TurnUsageAction` 组件已内置在聊天界面中，每轮对话后展示 token 消耗。

---

## 4. 多 Agent 启动优化

**提交**: `fef7e64d` (#6198)

### 4.1 启动约束

绑定多 Agent 启动流程，提升就绪状态 UX。避免启动时的竞态条件。

### 4.2 前端增强

| 组件 | 改动 | 说明 |
|------|------|------|
| `AgentSelector` | +456 行 | 长按手势支持、状态展示增强 |
| `useAgentLongPress` | 新增 | 长按手势 Hook |
| `AgentStatusIndicator` | +29 行 | Agent 状态指示器 |
| `AgentStatusPollingController` | +10 行 | 状态轮询控制器 |
| `useAgentStatusPolling` | 新增 | 状态轮询 Hook |

### 4.3 新增 API

```typescript
// agents.ts 新增
agentsApi.getAgentStatus(agentId)  // 获取 Agent 就绪状态
agentsApi.waitForReady(agentId)    // 等待 Agent 就绪
```

---

## 5. Langfuse 可观测性增强

**提交**: `9bd03ef5` (#5922)

### 5.1 Trace 上下文增强

在 Langfuse traces 中追踪 `user` / `session` / `version` 信息。

**影响文件**:
- `src/qwenpaw/observability/langfuse.py` — 核心追踪逻辑
- `src/qwenpaw/hooks/observability/langfuse_hook.py` — 钩子适配

### 5.2 测试

新增 `test_langfuse_context.py`（132 行）和 `test_langfuse_integration.py`（49 行）测试。

对 UGSci 开发最有价值的上游 Feature
OMP 工作流模式 — 多角色团队协作、自动驾驶、QA 验证，直接可用于科研流程编排
用户可编辑 Agent Mode — Goal/Mission 模式参数可调，适合设定科研目标和多步骤任务
Governance 工具自动注册 — UGSci 插件工具不再被误判为"unknown tool"
子 agent 审批路由 — 多专家协作时的审批能正确路由
实时事件元数据 — 模拟任务可携带 job_id/model_type 等上下文信息
---

## 6. 默认循环重构为 Agent Mode

**提交**: `9359788e` (#6210)

### 6.1 AgentMode 基类

**源文件**: `src/qwenpaw/modes/base.py`

`AgentMode` 是一个行为_bundle_，将命令、工具、钩子和提示词贡献者打包在一起。

```python
class AgentMode:
    name: str
    
    def setup(self, workspace) -> None:
        """注册所有贡献到 workspace"""
        
    def commands(self) -> list[CommandSpec]: ...
    def tools(self) -> list[ToolDescriptor]: ...
    def hooks(self) -> list[HookBase]: ...
    def prompt_contributors(self) -> list[PromptContributor]: ...
    
    async def on_turn_start(self, ctx: HookContext) -> None: ...
    def on_conversation_reset(self, ctx: HookContext) -> None: ...
    def is_active(self, ctx: HookContext) -> bool: ...
```

### 6.2 DefaultMode

**源文件**: `src/qwenpaw/modes/default/mode.py`

默认 ReAct 循环现在作为 `DefaultMode` 存在，统一管理门控策略：

```python
class DefaultMode(AgentMode):
    name = "default"
    
    def _build_gates(self, running_config) -> list[StopGate]:
        gates = []
        if loop_config.iteration.enabled:
            gates.append(IterationGate(max_iterations=...))
        if loop_config.doom_loop.enabled:
            gates.append(DoomLoopGate(window_size=..., similarity_threshold=...))
        if loop_config.rubric.enabled:
            gates.append(StandaloneRubricGate(prompt=..., max_interventions=...))
        return gates
```

### 6.3 移除的旧代码

- `src/qwenpaw/loop/react_gates.py`（131 行，已删除）
- `src/qwenpaw/loop/handler_registry.py`（78 行，已删除）

### 6.4 ModeGatedHook

新增 `ModeGatedHook` 基类，自动在模式不活跃时跳过钩子执行，避免忘记添加门控导致的 bug。

---

## 7. Bug 修复

### 7.1 后台聊天注册修复 (#6272)

**提交**: `db379b4e`

- 正确注册后台聊天，移除遗留的 runner
- 删除 `_app.py` 中 93 行遗留代码
- 简化 `task_tracker.py`（从 67 行精简）

### 7.2 MemorySpace OSError 修复 (#6247)

**提交**: `8c2cceff`

- `_saved_tool_refs` 的 `is_file()` 在遇到超长路径时抛出 `OSError: [Errno 36] File name too long`
- 添加 `try/except OSError` 保护，跳过非法路径

### 7.3 Runtime model_slot_override 修复 (#6218)

**提交**: `d0e98e53`

- 从 HTTP 请求中传递 `model_slot_override` 到模型工厂
- 影响文件：`src/qwenpaw/runtime/builder.py`

### 7.4 多模态能力检测修复 (#6217)

**提交**: `a2fdc836`

- 未探测的多模态能力改为 fail-open 策略
- 防止图片被错误剥离
- 影响文件：`src/qwenpaw/agents/prompt.py`

### 7.5 Tauri 入口绝对导入修复 (#6234)

**提交**: `a15a69fc`

- Tauri 入口点改用绝对导入
- 影响文件：`src/qwenpaw/tauri/entry.py`

### 7.6 Token Usage 缓存修复 (#6220)

**提交**: `78c77257`

- 关闭时未种子化的缓存不再被持久化
- 影响文件：`src/qwenpaw/token_usage/buffer.py`

---

## 8. 对 UGSci 插件开发的影响与演进路线

### 8.1 当前 UGSci 架构现状

UGSci 插件当前使用**底层 PluginApi 手动注册模式**：

| 模块 | 当前实现 | 文件位置 |
|------|---------|---------|
| 插件入口 | `UGSciPlugin.register(api)` 手动注册 | `plugin.py` (795行) |
| HTTP 路由 | `_build_engine_router()` + `_build_avatar_router()` | `plugin.py` |
| 工具注册 | `api.register_tool(...)` 循环注册 5 个模拟工具 | `plugin.py` L689-743 |
| 生命周期 | `api.register_startup_hook(...)` 手动注册 | `plugin.py` L604-630 |
| 前端 UI | 独立 Vite 构建，注入到 Console | `ui/src/index.ts` (11896行) |

### 8.2 PawApp SDK 对 UGSci 的价值

#### 8.2.1 简化后端样板代码

**当前**（`plugin.py` L596-743，约 150 行注册代码）：
```python
class UGSciPlugin:
    def register(self, api) -> None:
        api.register_startup_hook(hook_name="ugsci_sync_skills_to_pool", callback=self._on_startup_sync_skills, priority=80)
        api.register_http_router(_build_engine_router(), prefix="/ugsci/engines", tags=["ugsci-engines"])
        api.register_http_router(_build_avatar_router(), prefix="/ugsci/avatar", tags=["ugsci-avatar"])
        for tool_name, tool_func, desc, icon in sim_tools_meta:
            api.register_tool(tool_name=tool_name, tool_func=tool_func, description=desc, icon=icon, enabled=True)
```

**迁移后**（装饰器声明式，约 30 行）：
```python
from qwenpaw.pawapp import PawApp

app = PawApp(name="UGSci", app_id="ugsci")

@app.hook("startup", priority=80)
async def sync_skills(ctx):
    ...

@app.tool("launch_simulation", description="启动数值模拟 (Eclipse/CMG/COMSOL)", icon="🚀")
async def launch_simulation(ctx, deck_path: str, engine: str = "eclipse"):
    ...

@app.tool("check_simulation_status", description="查询模拟运行状态与收敛性", icon="📊")
async def check_simulation_status(ctx, job_id: str):
    ...
```

#### 8.2.2 ctx 上下文带来的新能力

当前 UGSci 的模拟工具是**纯函数**，无法与 Agent 交互。`ctx` 对象带来闭环能力：

| ctx 能力 | UGSci 应用场景 |
|---------|--------------|
| `ctx.chat()` | 模拟完成后自动让 Agent 分析结果 |
| `ctx.chat_stream()` | 流式输出 Agent 对模拟结果的实时解读 |
| `ctx.storage` | 持久化模拟项目配置、引擎参数、历史运行记录 |
| `ctx.tools.invoke()` | 在工具内部链式调用（先 `edit_deck` 再 `launch_simulation`） |
| `ctx.ui.push()` | 模拟运行进度实时推送到前端（替代轮询） |
| `ctx.ui.confirm()` | 修改 Deck 文件前让用户确认：「检测到异常值，是否继续？」 |
| `ctx.toast()` | 模拟完成/失败时前端弹窗通知 |
| `ctx.notify()` | 长时间模拟完成后通过钉钉/飞书通知用户 |

**典型场景示例** — 模拟启动 + 自动分析闭环：
```python
@app.tool("launch_and_analyze", description="启动模拟并自动分析", icon="🔬")
async def launch_and_analyze(ctx, deck_path: str):
    # 1. 启动模拟
    job_id = await _launch(ctx, deck_path)
    await ctx.ui.push("launched", {"job_id": job_id})
    
    # 2. 等待完成
    result = await _wait_for_completion(job_id)
    await ctx.storage.set(f"result_{job_id}", result.to_dict())
    
    # 3. 自动让 Agent 分析
    reply = await ctx.chat(
        f"ECLIPSE 模拟已完成（{result.time_steps} 步），请分析收敛性和物质平衡误差。"
    )
    
    # 4. 推送分析结果到前端
    await ctx.ui.push("analysis", {"text": reply.text, "job_id": job_id})
    
    return {"job_id": job_id, "analysis": reply.text}
```

#### 8.2.3 长任务管理 — 模拟进度实时推送

数值模拟通常运行数小时甚至数天。TaskManager + SSE 提供了理想的基础设施：

**当前做法**：前端轮询 `check_simulation_status` 工具

**PawApp 方式**：
```python
# 后端
@app.route("/run_long_simulation", methods=["POST"])
async def run_long_simulation(ctx, deck_path: str):
    task_manager = get_task_manager()
    task_id = await task_manager.create_task(
        app_id="ugsci",
        handler=_simulation_handler,
        ctx=ctx,
        params={"deck_path": deck_path},
    )
    return {"task_id": task_id}

async def _simulation_handler(ctx, deck_path: str):
    # ctx._sse_channel 已被 TaskManager 注入
    for step in run_simulation_steps(deck_path):
        await ctx.ui.push("progress", {"step": step.current, "total": step.total})
    result = get_final_result()
    return result  # 自动发送 {"type": "done", "data": result}
```

```typescript
// 前端
const task = paw.api.task("/run_long_simulation", { deck_path: "case1.data" });

task.on("progress", (data) => {
  setProgressBar(data.step, data.total);
});

task.on("done", (result) => {
  showResult(result);
});

await task.result;
```

#### 8.2.4 应用中心分发

将 UGSci 从「插件」升级为「应用」：
- 在 `plugin.json` 中添加 `meta.pawapp` 字段
- 拥有独立入口页面（`/apps/ugsci`）
- 出现在应用中心，支持一键安装
- 可参考 `agent-kanban` 的实现模式

### 8.3 ReMe Light 记忆增强的直接影响

#### 手动重建索引

在 UGSci 专家配置页面添加「重建记忆索引」按钮：

```typescript
// 在 ExpertConfigModal 中添加
const handleReindex = async () => {
  Modal.confirm({
    title: "重建记忆索引",
    content: "此操作将重建专家的长期记忆搜索索引，可能需要几分钟。期间记忆搜索功能可能不可用。",
    onOk: async () => {
      await agentsApi.reindexMemory(expert.agent.id);
      message.success("记忆索引重建完成");
    },
  });
};
```

#### Dream 任务延迟

如果 UGSci 配置了多个专家同时运行定时分析任务，0-60 秒随机延迟可避免资源争抢。

### 8.4 Token 追踪的直接影响

- 每次专家调用模拟工具的 token 消耗都可追踪
- 可在专家配置页面展示累计 token 消耗
- `TurnUsageAction` 组件已内置在聊天界面中

### 8.5 多 Agent 启动优化的直接影响

- UGSci 专家团队（coordinator/sequential/roundtable 模式）启动更稳定
- `AgentStatusIndicator` 可用于专家团队视图，显示每个成员的在线/离线/忙碌状态
- `AgentStatusPollingController` 提供自动状态轮询

### 8.6 Langfuse 可观测性的直接影响

- UGSci 专家调用模拟工具的完整链路可在 Langfuse 中按 session 追踪
- `version` 字段可区分不同 UGSci 版本的生产行为
- 可对比不同专家配置对模拟分析质量的影响

### 8.7 默认循环重构的直接影响

- DoomLoopGate 在专家分析复杂模拟结果陷入循环时自动干预
- `max_iterations` 配置统一通过 `DefaultMode` 解析
- `ModeGatedHook` 可用于为 UGSci 专家定制模式门控

### 8.8 Bug 修复的直接影响

| 修复 | UGSci 影响 |
|-----|-----------|
| MemorySpace OSError | 专家的 `recall_history` 处理含超长 Deck 文件路径的历史记录时不再崩溃 |
| model_slot_override | 通过 API 指定模型槽位能正确传递，专家可使用指定模型 |
| 多模态 fail-open | 专家可正常处理包含图表/示意图的对话 |
| Tauri 绝对导入 | 桌面应用模式下 UGSci 插件加载更稳定 |
| 后台聊天注册 | 后台定时分析任务（如定时巡检）能正确注册 |

### 8.9 建议的 UGSci 演进路线

#### 第一阶段（短期，低成本）

1. **记忆重建按钮**：利用 ReMe Light 手动重建索引 API，在专家配置页添加「重建记忆」按钮
2. **Token 用量展示**：在专家详情页展示该专家的累计 token 消耗

#### 第二阶段（中期，中成本）

1. **PawApp SDK 迁移**：将 `plugin.py` 的工具注册迁移到装饰器模式
2. **ctx.storage 持久化**：用 `ctx.storage` 替代当前的临时文件存储，持久化模拟项目配置
3. **AgentStatusIndicator 集成**：在专家团队视图中使用新的状态指示器组件

#### 第三阶段（长期，高价值）

1. **PawApp 应用升级**：将 UGSci 升级为 PawApp 应用，添加 `meta.pawapp` 声明
2. **TaskManager + SSE**：实现模拟进度实时推送，替代前端轮询
3. **ctx.chat() 闭环**：实现模拟完成后自动分析，构建「启动 → 监控 → 分析 → 通知」全链路自动化
4. **ctx.ui.confirm()**：在 Deck 修改、异常值检测等关键节点添加人工确认流程
5. **ctx.notify()**：长时间模拟完成后通过钉钉/飞书等多渠道通知用户

---

## 附录：合并提交清单

| Commit | PR | 类型 | 标题 |
|--------|-----|------|------|
| `8a9f8ab0` | #6150 | feat | PawApp SDK + Kanban app |
| `872c8158` | #6235 | feat | ReMe Light 记忆增强 |
| `9bd03ef5` | #5922 | feat | Langfuse 可观测性增强 |
| `9359788e` | #6210 | refactor | 默认循环重构为 Agent Mode |
| `f7d5225e` | #6159 | feat | Token 使用量追踪增强 |
| `fef7e64d` | #6198 | feat | 多 Agent 启动优化 |
| `db379b4e` | #6272 | fix | 后台聊天注册修复 |
| `8c2cceff` | #6247 | fix | MemorySpace OSError 修复 |
| `d0e98e53` | #6218 | fix | model_slot_override 修复 |
| `a2fdc836` | #6217 | fix | 多模态能力检测修复 |
| `a15a69fc` | #6234 | fix | Tauri 绝对导入修复 |
| `78c77257` | #6220 | fix | Token Usage 缓存修复 |
| `f433bbff` | #6266 | chore | 版本号升级至 v2.0.1b1 |
