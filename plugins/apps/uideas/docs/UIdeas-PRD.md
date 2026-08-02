# Product Requirements Document (PRD) — UIdeas

## Document Information
- **Product Name**: UIdeas（主动思考型科研灵感实验室）
- **Version**: v1.0
- **Date**: 2026-08-02 ｜ **Status**: Draft
- **平台**: QwenPaw PawApp 应用（内置 UGSci）
- **代码位置**: `plugins/apps/uideas/`

---

## 1. Problem Statement

### 1.1 Background
UGSci 面向油气/地下储气库科研，已具备 40+ 油气技能（reservoir-simulation-workflow、history-matching、sensitivity-analysis、multi-objective-optimization 等）、仿真引擎适配器（CMG/Eclipse/COMSOL + sim_api SSE）、专家团（6 位专家 + roundtable 编排）、以及 QwenPaw 主动记忆机制（proactive_trigger_loop）。

研究人员的工作模式是非线性、碎片化的：灵感随时产生（读文献、跑完仿真、讨论中），但缺乏"承接点"。

### 1.2 Pain Points
| # | 痛点 | 后果 |
|---|------|------|
| P1 | 灵感记在零散处，无处沉淀 | 想法丢失，重复思考 |
| P2 | 想法之间缺乏关联 | 无法形成研究方向 |
| P3 | 想法不被"喂养"（不结合技能库/仿真/其他讨论） | "一句话"到"研究方案"的鸿沟无人跨越 |
| P4 | 系统被动应答 | 明明有可行动机会，系统不主动提醒 |
| P5 | 仿真任务、Agent 讨论用完即弃 | 跨会话知识无法复用 |

### 1.3 Opportunity
- **差异化**：Notion/Obsidian/Trello 都是"被动存储"；UIdeas 是**主动思考型记忆体**——记录 → 整理 → 扩充 → 主动建议。
- **资产复用**：技能库、仿真引擎、专家团、主动记忆机制全部现成，UIdeas 是它们的第一块产品化拼图。
- **可验证**：以"建议采纳率"和"灵感→实验转化"为核心指标，MVP 即可验证假设。

### 1.4 Target Users
| Persona | 画像 | 核心诉求 |
|---------|------|---------|
| 仿真研究者（主力） | 博士生/工程师，跑 COMSOL/CMG | 沉淀灵感、得到下一步实验建议 |
| 数值模拟工程师 | 负责历史拟合、敏感性分析 | 追踪多轮调参思路 |
| 课题负责人 | 统筹多个方向 | 俯瞰聚类，识别值得投入的方向 |

---

## 2. User Stories

### Story 1: 随手记录灵感（Must-have）
```
As a 仿真研究者
I want 用一句话快速记录灵感（支持 #标签、@实验编号）
So that 想法能即时捕获，不因记录成本丢失
```
**AC:**
- Given 输入"垫底气突破时间受渗透率非均质性影响 #敏感性 @实验3"并回车，Then 生成 idea 卡片并展示
- Given 含 `#xxx`，Then 自动解析出标签；含 `@实验N`，Then 关联实验编号（纯文本标记）
- Given 输入为空按回车，Then 不创建卡片并提示
- Given 刷新/重开页面，Then 数据从 `ctx.storage` 持久化恢复

### Story 2: 灵感自动整理（Must-have）
```
As a 仿真研究者
I want 系统自动把零散想法聚类成研究方向并去重
So that 我能看到"我在研究哪些方向"
```
**AC:**
- Given 灵感数达阈值（默认5）且超过整理间隔，Then 后台调用 `ctx.chat` 生成聚类写入 `clusters`
- Given 手动点"立即整理"，Then 立即执行（绕过阈值）
- Given 整理完成，Then 思考面板"聚类方向"展示 cluster（名称/成员/insight）
- Given 两条相似 idea，Then insight 标注"重复项"并保留主卡片
- Given Agent 输出非法 JSON，Then 回退上一版 clusters，不阻塞其他功能

### Story 3: 想法自动扩充（Should-have）
```
As a 仿真研究者
I want 系统结合 UGSci 技能库补充研究方法、仿真手段、数据建议
So that "一句话想法"变成"半张研究方案"
```
**AC:**
- Given idea 为"待验证"或入新 cluster，Then 调用 `ctx.chat`（注入技能）生成扩充卡片
- Then 卡片含：研究方法 / 仿真手段 / 数据建议 / 相关技能名
- Given 用户对单条点"扩充"，Then 仅该 idea 执行并覆盖旧内容（带版本号）

### Story 4: 主动思考与建议推送（Should-have）⭐ 核心
```
As a 仿真研究者
I want 系统结合灵感库、仿真记录、其他 Agent 对话记忆，主动提可行动建议
So that 我不用盯所有上下文就能发现"下一步该做什么"
```
**AC:**
- Given 后台循环启动（`@app.hook("startup")`），When 达到间隔（默认1h），Then 执行一次主动思考
- Then 聚合：① `ctx.storage` ideas/clusters ② `ctx.get_session_history` 其他 Agent 会话 ③ 技能库
- Given 结论为空或 hash 重复，Then 不推送并更新冷却
- Given 新建议，Then 落库并通过 `ctx.notify` + `ctx.toast` 推送（含 idea 编号、来源会话、建议动作）
- Given 设置中关闭"主动思考"，Then 不执行不推送

### Story 5: 建议反馈闭环（Should-have）
```
As a 仿真研究者
I want 对建议采纳/忽略，采纳后自动转实验待办
So that 建议沉淀为行动
```
**AC:**
- Given 点"采纳"，Then 标记 adopted 并生成待办（`meta.todo_queue`）
- Given 点"忽略"，Then 标记 ignored，移出待处理区
- Given 同 hash 建议已被采纳，Then 不再推送

### Story 6: 灵感管理与检索（Must-have）
```
As a 仿真研究者
I want 按状态/标签筛选、编辑、删除灵感
So that 维护干净可追溯的研究素材库
```
**AC:** 状态筛选、标签过滤、编辑更新 updated_at、删除持久化，均生效。

### Story 7: 关联仿真实验（Could-have）
```
As a 仿真研究者
I want 在灵感中关联 @实验编号并看到任务状态
So that 灵感与实验双向追溯
```
**AC:** 关联实验号高亮；未接入 sim_api 时仅作文本标记不报错。

### 2.2 User Journey Map
```
产生灵感（读文献/跑仿真/讨论）→ 随手记录（回车即存）
→ 自动整理（聚类/打标/去重）→ 主动思考（跨 Agent 记忆）
→ 建议推送（notify+toast）→ 采纳 → 转实验待办 → 下一轮研究
```
**被动路径**：打开应用 → 浏览聚类/扩充卡片 → 手动触发整理。

---

## 3. Requirements Prioritization

### 3.1 MoSCoW
| Requirement | Class | Rationale |
|-------------|-------|-----------|
| 灵感记录（#标签 @实验解析） | Must-have | 产品存在前提 |
| 灵感 CRUD + 筛选 | Must-have | 基本能力 |
| 手动"立即整理" | Must-have | 用户可控入口 |
| 自动整理（阈值触发） | Should-have | 核心价值，手动可兜底 |
| 想法自动扩充 | Should-have | 差异化之一 |
| 主动思考 + 跨 Agent 记忆 | Should-have | 核心差异化，MVP 后首个增量 |
| 建议反馈闭环 | Should-have | 支撑指标 |
| 去重 + 冷却 + 开关 | Should-have | 防打扰 |
| 仿真任务状态联动 | Could-have | 依赖 sim_api |
| 导出 / 备份 | Could-have | 增强项 |
| 多用户 / 移动端 | Won't-have | v1 不做 |

### 3.2 MVP Scope
MVP = Must-have 全量 + Should-have 中的"自动整理、扩充、建议列表展示（不要求后台自动推送）"
- 灵感 CRUD + 标签/实验解析 + 筛选
- 手动整理 + 阈值自动整理
- 聚类方向展示 + 想法扩充卡片
- 建议列表页（采纳/忽略；支持手动触发思考）
- 设置页（阈值/冷却/主动开关）
- **MVP 不做**：后台定时自动推送、跨 Agent 会话记忆、仿真任务状态联动

---

## 4. Success Metrics

### 4.1 North Star Metric
**每周"灵感→行动"转化数**：每周从灵感产出可执行研究行动（采纳建议/发起新仿真/标记进行中）的总数。

### 4.2 OKR
```
Objective: 让 UGSci 用户科研灵感可沉淀、可喂养、可行动
KR1: 30 天内每周新增灵感 ≥ 10 条/活跃用户
KR2: 灵感 7 日留存率 ≥ 40%
KR3: 建议采纳率 ≥ 25%
KR4: 建议忽略率 ≤ 30%
```

### 4.3 Monitoring Metrics
| Metric | Target | Frequency |
|--------|--------|-----------|
| 每周新增灵感 | ≥10/活跃用户 | 每周 |
| 灵感 7 日留存 | ≥40% | 每周 |
| 建议采纳率 | ≥25% | 每周 |
| 建议忽略率 | ≤30% | 每周 |
| 整理任务成功率 | ≥95% | 每日 |
| 主动思考耗时 | ≤3min/次 | 每日 |

---

## 5. Non-Functional Requirements
- **性能**：记录保存 ≤200ms（本地 KV）；整理/扩充/思考异步不阻塞；500 条内列表首屏 ≤1s
- **安全**：数据仅存 `ctx.storage` 命名空间 `pawapp:uideas`；跨会话读取限本机 Agent 会话；思考 prompt 会话内容截断 ≤20 条
- **兼容**：QwenPaw PawApp 运行时；前端 `window.QwenPaw.host.React/antd`；v1 无额外 runtime_dependencies
- **可靠**：后台循环异常 catch + 重试退避；写操作先写临时 key 再原子提交

---

## 6. Technical Solution

### 6.1 架构
```
Frontend (ui/index.js)                     Backend (backend/)
├─ 灵感记录页（输入框/列表/筛选）            ├─ main.py      PawApp 定义 + 路由
├─ 思考面板页（聚类/扩充/建议）              ├─ store.py     ctx.storage 封装
├─ EventSource /api/stream                 ├─ analyze.py   L1 整理 + L2 扩充
└─ paw.api / paw.chat / paw.toast          ├─ proactive.py L3 主动思考循环
                                           ├─ memory.py    跨会话记忆聚合
                                           └─ sse.py       SSE 通道
                    │ ctx.chat / ctx.get_session_history / ctx.notify
                    ▼
        QwenPaw Agent 层（UGSci 技能库 + 专家团 + 仿真引擎）
```

### 6.2 plugin.json（草案）
```json
{
  "id": "uideas",
  "name": "UIdeas",
  "version": "0.1.0",
  "type": "app",
  "meta": {
    "pawapp": {
      "icon": "💡",
      "title": "UIdeas 科研灵感实验室",
      "description": "主动思考型科研灵感管理：随手记录、自动整理扩充、跨 Agent 记忆主动建议",
      "category": "research",
      "entry_page": "/uideas",
      "launch_scope": "global"
    },
    "features": ["ideas", "clusters", "suggestions"]
  },
  "permissions": { "chat": true, "storage": true, "session_history": true, "notify": true }
}
```
> 注：`permissions` 按 QwenPaw 实际 schema 校准（参考 agent-kanban/plugin.json）。

### 6.3 数据模型（ctx.storage 命名空间 pawapp:uideas）
**`ideas`**（列表）
```json
{ "id": "idea_001", "text": "垫底气突破时间受渗透率非均质性影响",
  "tags": ["敏感性"], "related_experiments": ["实验3"],
  "status": "pending", "cluster_id": "cluster_001",
  "expansion": {"version": 2, "content": "..."},
  "created_at": "...", "updated_at": "..." }
```
**`clusters`**（列表）
```json
{ "id": "cluster_001", "name": "垫底气动态与注采优化",
  "idea_ids": ["idea_001"], "insight": "聚类洞见...", "duplicates": ["idea_005"],
  "formed_at": "..." }
```
**`suggestions`**（列表）
```json
{ "id": "sugg_001", "text": "你 3 天前在仿真 Agent 讨论了...建议合并为 COMSOL 参数研究",
  "idea_ids": ["idea_001"], "source_sessions": ["session_sim_xxx"],
  "hash": "sha256:...", "status": "pending", "pushed_at": "..." }
```
**`meta`**（单对象）
```json
{ "idea_count": 12, "last_organize_at": "...", "organize_threshold": 5,
  "thinking_interval_min": 60, "cooldown_until": "...",
  "proactive_enabled": true, "todo_queue": [] }
```

### 6.4 API 路由（backend/main.py）
| Method | Path | 说明 |
|--------|------|------|
| GET/POST | `/api/ideas` | 列表（status/tag 过滤）/ 新增（解析 #标签 @实验，达阈值排队整理） |
| PUT/DELETE | `/api/ideas/{id}` | 更新 / 删除（清理 cluster 引用） |
| GET | `/api/clusters` | 聚类列表 |
| POST | `/api/analyze` | 手动整理 |
| POST | `/api/expand/{id}` | 单条扩充 |
| GET | `/api/suggestions` | 建议列表 |
| POST | `/api/suggestions/{id}/feedback` | 采纳（写 todo_queue）/ 忽略 |
| POST | `/api/think` | 手动触发一次主动思考（调试/演示） |
| GET/PUT | `/api/meta` | 设置读写 |
| GET | `/api/stream` | SSE 事件流 |

### 6.5 三层机制实现要点

**L1 整理（analyze.py）**
```python
async def run_organize(ctx, manual=False):
    ideas = await store.get_ideas(ctx)
    if not manual and len(ideas) < threshold:
        return {"skipped": True}
    prompt = build_organize_prompt(ideas)          # 要求输出结构化 JSON
    result = await ctx.chat(prompt, skill="reservoir-simulation-workflow")
    clusters = parse_clusters(result)              # 失败回退旧版
    await store.save_clusters(ctx, clusters)
    await sse.push({"type": "organize:done", "clusters": clusters})
```

**L2 扩充（analyze.py）**
```python
async def run_expand(ctx, idea_id):
    idea = await store.get_idea(ctx, idea_id)
    result = await ctx.chat(build_expand_prompt(idea), skill="history-matching")
    await store.save_expansion(ctx, idea_id, parse_expansion(result))  # version+1
```

**L3 主动思考（proactive.py）核心**
```python
@app.hook("startup")
async def _start_proactive(ctx):
    asyncio.create_task(proactive_loop(ctx))

async def proactive_loop(ctx):
    """参考 proactive_trigger_loop：轮询 + 空闲检测 + 防打扰"""
    while True:
        await asyncio.sleep(60)                    # 轮询步长
        meta = await store.get_meta(ctx)
        if not meta["proactive_enabled"]: continue
        if now() < meta["cooldown_until"]: continue
        if now() - meta["last_think"] < interval: continue
        await think_once(ctx)

async def think_once(ctx):
    ideas, clusters = await store.get_ideas(ctx), await store.get_clusters(ctx)
    sessions = await memory.collect_recent(ctx, max_msgs=20)   # 跨会话记忆
    result = await ctx.chat(build_think_prompt(ideas, clusters, sessions),
                            skill="reservoir-simulation-workflow")
    suggestion = parse_suggestion(result)
    if suggestion and not is_duplicate(suggestion):            # hash 去重
        suggestion["hash"] = sha256(canonical(suggestion))
        await store.save_suggestion(ctx, suggestion)
        await ctx.notify(title="UIdeas 新建议", body=suggestion["text"][:80])
        await ctx.toast(f"💡 {suggestion['text'][:40]}…")
        await store.set_cooldown(ctx, hours=6)
```

**memory.py 跨会话聚合**
```python
async def collect_recent(ctx, max_msgs=20):
    # 默认读 pawapp:uideas 自身会话历史
    history = await ctx.get_session_history("pawapp:uideas")
    # v3 扩展：遍历配置的 agent_session_ids，截断到最近 max_msgs 条，
    # 先让 Agent 压缩为摘要再参与综合分析，控制 token 成本
    return compact(history, max_msgs)
```

**防打扰三件套**：hash 去重（canonical→sha256 对比全量）+ 冷却 6h + 主动开关。

### 6.6 前端（ui/index.js）
**路由**：`window.QwenPaw.registerRoutes` 注册 `/uideas`（单页 Tabs）。

**Page 1 灵感记录页**：顶部输入框（placeholder 提示 #标签 @实验，回车即存）；状态 Tabs（全部/待验证/进行中/已放弃）；标签 chips 过滤；卡片列表（text/tags/关联实验/状态徽标/编辑/删除/扩充）；"立即整理"按钮 + 设置入口。

**Page 2 思考面板页**：三栏 Tabs——聚类方向（cluster 卡片含 insight 与"重复项"标注）/ 扩充卡片（expansion 内容）/ 主动建议（来源会话 + 采纳/忽略）；EventSource 订阅 `/api/stream` 实时刷新。

### 6.7 目录结构
```
plugins/apps/uideas/
├── plugin.json          # type:"app", meta.pawapp, entry_page
├── backend/
│   ├── main.py          # PawApp 定义 + 路由
│   ├── store.py         # ctx.storage 封装
│   ├── analyze.py       # L1 整理 / L2 扩充
│   ├── proactive.py     # L3 后台思考循环
│   ├── memory.py        # 跨会话记忆聚合
│   └── sse.py           # SSE 通道
├── ui/
│   └── index.js         # 前端 registerRoutes
└── README.md
```

---

## 7. Milestones and Timeline

| Phase | Content | Timeline |
|-------|---------|----------|
| v1 MVP | 灵感 CRUD + 标签/实验解析 + 手动整理 + 聚类展示 + 设置页 | 0.5~1 天 |
| v2 | 自动整理阈值 + 扩充卡片 + 建议列表（手动触发思考） | +0.5 天 |
| v3 | 后台主动循环 + 跨 Agent 会话记忆 + 去重/冷却/开关 + notify/toast 推送 | +0.5 天 |
| v4 | 仿真任务状态联动（sim_api）+ 指标埋点 | 迭代 |

---

## 8. Risks and Dependencies

### 8.1 Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| 主动建议打扰用户 | High | hash 去重 + 冷却 6h + 一键关闭 |
| 跨会话记忆量大/成本高 | Medium | 截断 ≤20 条 + Agent 摘要压缩 |
| 后台循环与 Agent 冲突 | Medium | 复用 is_agent_busy 检查，忙时不触发 |
| Agent 输出非法 JSON | Medium | try/except 回退旧版 + 重试退避 |
| ctx.get_session_history 依赖具体 session_id | Medium | 先支持自身会话，v3 扩展会话发现 |
| 重复想法聚类不准确 | Low | insight 标注 + 人工可改 cluster |

### 8.2 Dependencies
- PawApp 运行时：`ctx.chat / chat_stream / storage / get_session_history / notify / toast / hook("startup")`
- 技能库：`reservoir-simulation-workflow`、`history-matching`、`sensitivity-analysis` 等（已在 UGSci 中存在）
- v4 依赖：`sim_api.py` 任务查询接口（已有）

---

## 9. Appendix

### 9.1 Glossary
| Term | 含义 |
|------|------|
| idea | 灵感卡片（核心实体） |
| cluster | Agent 聚类出的研究方向 |
| suggestion | 主动建议（含 hash 去重） |
| L1/L2/L3 | 自动整理 / 自动扩充 / 主动思考 |
| 垫底气/工作气 | 储气库库存中不可采/可采部分 |

### 9.2 Reference Documents
- PawApp SDK: `src/qwenpaw/pawapp/context.py`（ctx API）
- 参考应用: `plugins/apps/agent-kanban/`（CRUD+SSE+审批模式）
- 主动机制: `src/qwenpaw/agents/memory/proactive/`（proactive_trigger_loop）
- UGSci 技能/引擎: `plugins/bundle/ugsci/`

**Change Log:**
| Version | Date | Change | Author |
|---------|------|--------|--------|
| v1.0 | 2026-08-02 | 基于 prd-writing-expert 方法论完成可实施 PRD | QwenPaw Core Team |
