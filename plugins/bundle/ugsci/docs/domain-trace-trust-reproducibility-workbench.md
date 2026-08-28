# UGSci 计算信任与复现 — 补充方案（含右侧工作台融合）

> **Status**: Draft v0.2 for review · Scope: UGSci 插件 + QwenPaw 控制台右侧工作台
> **上一版**: [domain-trace-freeform-design.md](domain-trace-freeform-design.md)（freeform 兜底，已实现）
> **本版主线调整**: 从"功能完整性"转为"**让用户对结果放心、可复现**"。freeform 降级为覆盖盲区的兜底，方案核心转向 **审计元数据 + curated 可观测 + 一键复现**，并把复杂计算/参数引用过程 **落到右侧工作台** 以直观、生动的形态展示。

---

## 0. 一句话定位

让每一次复杂计算都具备三样东西：**来源可核验**（用了哪个公式/方法/标准）、**过程可追踪**（逐步推导 + 每个参数从哪来）、**结果可复现**（一键重跑并比对指纹）。这三样在**右侧工作台**以"推导时间线 + 参数引用图 + 可重放卡片"的形态呈现，而不是只给一个最终数值。

## 1. 问题与目标

### 现有痛点
- 计算结果是"黑盒"：用户只看到最终数字，看不到中间步骤和参数来源。
- 参数来源不可溯：一个压力值到底是用户输入的、从测井读的、还是上一步算的，没有标注。
- 结果不可复现：换个会话/换个模型再问一次，数字可能不同，用户无法确认"是不是同一个东西"。
- 无过程可视化：复杂计算（物质平衡、递减分析、多相管流）没有直观的中间态展示。

### 目标
1. **来源可核验** — 每个结果标注：公式/方法 + 标准/文献引用 + 引擎/提供方版本 + 输入指纹。
2. **过程可追踪** — 推导逐步呈现，每个参数标注**来源链**（输入/常量/上一步结果/外部数据）。
3. **结果可复现** — 一个不可变的"重放令牌"，点击即重跑，比对指纹，证明一致。
4. **可视化** — 以上全部在**右侧工作台**以"推导时间线 + 参数引用图 + 实时工作表"呈现。

### 非目标
- 不做任意 Python 执行沙箱（freeform 已有边界，本方案不扩大它）。
- 不做完整数值模拟引擎（那是 engine/ 层的事）。

## 2. 方案骨架：三个支柱

```
支柱 A  审计元数据          → 来源可核验
支柱 B  参数来源链 + 可观测  → 过程可追踪
支柱 C  重放令牌            → 结果可复现
──────────────────────────────────────────
载体    右侧工作台           → 直观、生动、可交互
```

这三个支柱**全部建立在现有的 `DomainResult` 信封 + `DerivationTrace` 之上**，
不需要推翻 Phase 1/2，而是在其上补齐信任字段并接到工作台。

---

## 3. 支柱 A — 审计元数据（来源可核验）

现有 `DomainResult.provenance` 已有：`engine_id/version`、`provider_id/version`、
`operation`、`method`、`deterministic`、`input_fingerprint`、`support_libraries`。

**补强字段**（全部可选、向后兼容）：

| 字段 | 含义 | 例 |
|---|---|---|
| `reference` | 公式/方法依据的标准或文献引用 | `Standard "Standing (1947)"` / `SPE-12345` / `API RP 11V2` |
| `formula_id` | 若来自 curated 库，其稳定 ID | `gas_material_balance_pz` |
| `source` | `curated` / `freeform` | 界面据此显示"审定"或"AI-推导"徽章 |
| `parameter_sources` | 每个输入参数的来源链 | 见支柱 B |
| `unit_audit` | 量纲一致性核对结果 | `{ok: true, per_symbol: {...}}` |
| `gate` | 本次计算通过的校验列表 | `["denominator_well_conditioned", ...]` |
| `replay_token` | 可一键重放的令牌 | 见支柱 C |

**界面呈现**：结果卡片顶部一行"来源"徽章链：
`[审定公式 · gas_material_balance_pz] [Standing 1947] [ugsci-petroleum-core v1.1.0] [指纹 sha256:...]`
点击每个徽章可展开详情。`reference` 让用户能拿回去核对，这是信任的第一步。

---

## 4. 支柱 B — 参数来源链 + 过程可观测（过程可追踪）

### 4.1 参数来源链（`parameter_sources`）

每个输入参数标出它的**来源**，而不是只给一个值：

```json
"parameter_sources": {
  "G_p":   {"source": "user_input",       "value": 1e9, "unit": "scf"},
  "p_i":   {"source": "well_log",         "well": "W-12", "depth": 2800.5},
  "z_i":   {"source": "correlation",      "method": "Standing z", "inputs": {"p_i": ..., "T": ...}},
  "OGIP":  {"source": "derived_from",     "step_id": "step14"}
}
```

来源枚举：`user_input` / `constant` / `derived_from`（上一步）/ `external_file`（测井/数据库/导出）/ `correlation`。

**为什么这个比"参数值是多少"更能建立信任**：用户的大脑首先会问"这个数哪来的？"——是用户自己填的（信任）、从上一步算的（可追踪）、还是从测井读取的（可复核）。标明来源链，等于把整条推理路径摊开。

### 4.2 过程可观测（复用 Phase 1 的 `DerivationTrace`）

curated 每个公式已能吐出 `steps`（组方程/代入/化简/求解/校验）+ `variables` + `unicode` 方程。
**本方案把它从"聊天内嵌卡片"扩展到"右侧工作台的全屏视图"**（见 §7）。

- 每步都有：Unicode 方程、数值代换、结果值+单位、校验断言、阶段分组。
- 关键差异：工作台里这些步骤是**可展开、可拖拽时间线**，而非聊天里的一长串。

---

## 5. 支柱 C — 重放令牌（结果可复现）

### 5.1 令牌内容

把"复现一个结果"所需的最小不可变集合编码成一个签名令牌：

```json
{
  "replay_token": "ugsci:replay:gas_material_balance_pz:v1:sha256:5e9a...",
  "replay_payload": {
    "kind": "curated",
    "formula_id": "gas_material_balance_pz",
    "engine_id": "ugsci-trace",
    "provider_version": "1.0.0",
    "inputs": {"G_p": 1e9, "p_i": 3000, "z_i": 0.85, "p": 2000, "z": 0.88},
    "units": {"G_p": "scf", ...},
    "opts": {"tolerance": 1e-8}
  }
}
```

令牌经过签名（HMAC，用部署密钥），防止被篡改后"重放出一个假结果"。

### 5.2 重放语义

右侧工作台卡片上的 **"重新计算"** 按钮：
1. 携带令牌调用 `ugsci_replay_calculation(replay_token)`。
2. 后端重新执行，得到新的 `DomainResult`。
3. **比对 `input_fingerprint`**：一致 → 显示"✅ 可复现，与该结果一致"并展示耗时；
   不一致（如引擎升级导致版本不同）→ 显示"⚠️ 引擎版本已变化"并列出差异。
4. 结果**不改变历史**，只在工作台追加一次"重放记录"。

### 5.3 为什么这个直接兑现"可复现"

"我放心"的最后一层是"我能自己验证"。用户不必重问一遍、不必记住参数，
点一下按钮、后端同参数重跑、指纹比对——这就是可复现的可操作定义。

---

## 6. 载体 — 右侧工作台（Concrete integration）

### 6.1 现状（已实测确认）

- 工作台是会话作用域的右侧 Drawer（`console/src/features/files-workspace/FilesDrawer.tsx`，
  挂载于 `pages/Chat/index.tsx:4011`），左侧 activityRail + 右侧内容区。
- 模式是**硬编码的 4 个字面量**（`WorkbenchPanels.tsx:33`）：
  `WorkbenchMode = "files" | "browser" | "agents" | "genui"`。
  **没有 panel registry** —— 不存在 `{id, title, icon, component}` 描述符，
  第三方插件**无法新增一个 rail 图标**。
- 插件唯一的注入点是 `WorkbenchGenUiPanel` 内的一个空置
  `<Slot name="chat.workbench.genui" kind="fill">`（`WorkbenchPanels.tsx:433`）。
  它位于 GenUI 能力卡片网格**下方**的 `.genUiExtensions` 脚注区（`font-size:11px`，
  无 `flex:1`），**不是全高面板容器**。
- 插件经 `window.QwenPaw.slot.fill(pluginId, name, render, opts)` 填充 slot
  （`console/src/plugins/registry/sdk.ts:123`，`Slot.tsx` 会把每个 fill 包进
  `SlotErrorBoundary`，崩溃降级为 null，不影响宿主布局）。`getHost()` 暴露
  `React/ReactDOM/antd/ReactMarkdown/remarkGfm`；上下文不能靠 props，只能
  `host.getCurrentSessionId()` / `host.getSelectedAgentId()`（`hostSdk/install.ts`）。
- `AgentCollaborationPanel` 已有 **flow / timeline / logs** 三视图，
  是"计算过程可视化"的现成范式，可复用其视觉语言。

### 6.2 三条落地路线（按形态正确性排序，关键修正）

> 探查后修正：§6.2 原稿假设能注入成"与 agent 面板平级的模态视图"，但 slot 在
> GenUI 面板内部的脚注区，**不是新 mode，rail 上不会有新图标**。要做到独立轨道
> 必须走路线 B（改宿主）；只改插件则走路线 A/C。

**路线 A — 纯插件注入（零宿主改动，最快）**

`slotRegistry.fill("ugsci", "chat.workbench.genui", () => <UgsciDerivationPanel/>)`。
落在 `.genUiExtensions` 内。约束：
- rail 上无新图标，用户须先点 GenUI 图标才能看到面板；
- 需在自身根节点设 `height:100%; display:flex; flex-direction:column; min-height:0`
  去撑高，且接受父容器 `.workbenchPanel` 的 `overflow:auto`；
- **只在 GenUI 能力中心态渲染** —— 当 `target && scope` 为真（`WorkbenchPanels.tsx:313`）
  走 `ArtifactPreview` 分支，slot 根本不在树里。

**路线 B — 宿主加一个 mode（推荐，形态正确）**

要独立 rail 图标 + 全高面板，最小改动集（4 处，均为 `console/src/features/files-workspace/`）：
1. `WorkbenchPanels.tsx:33` — `WorkbenchMode` 加成员 `| "compute"`。
2. `FilesDrawer.tsx:50-52` — localStorage 白名单加 `stored === "compute"`。
3. `FilesDrawer.tsx:205-210` — rail 数组加 `["compute", Calculator, "计算轨道"]`。
4. `FilesDrawer.tsx:226-240` — 内容区加 `{mode === "compute" && <Slot name="chat.workbench.compute" kind="fill"><EmptyState/></Slot>}`。

插件侧只需 `QP.slot.fill("ugsci", "chat.workbench.compute", render)`，面板作为
`.drawerContent` 直接子级拿到 `flex:1; min-height:0; overflow:hidden` —— 真正的全高。
（更进一步的正解是把 rail 本身 registry 化，但那是宿主架构改动，超出"加一个面板"。）

**路线 C — 若内容本质是"可预览产物"，走 renderer registry（完全开放）**

`window.QwenPaw.workspace.registerRenderer({id, name, component, mimeTypes, extensions, priority})`，
再从工具卡片 `window.QwenPaw.workspace.openArtifact({mimeType:"application/x-ugsci-derivation+json", jsonContent: trace, sessionId, messageId})`。
这会 dispatch `qwenpaw:open-file-preview`，Chat 页自动开 Drawer 进 **files** 模式，
在 TabbedEditor 开一个 tab，渲染器拿到完整 `RendererContext`（含 `workspace.updateArtifact`
可流式）。**能拿全高容器 + tab 化管理 + host 工具栏（`hostControls`）**，
代价是表现为"一个文件 tab"而非"一个工作台页签"。

**推荐**：先用路线 A 快速验证面板形态与数据流，确认体验后再升级路线 B 拿独立轨道；
路线 C 作为"把某次具体推导导出为可预览文件"的补充，而非主面板。

### 6.3 面板视图

面板内部三种视图，与 `AgentCollaborationPanel` 的 `flow/timeline/logs` 对应：

| 视图 | 内容 | 视觉/实现 |
|---|---|---|
| **flow**（推导流程） | 逐步推导 + 参数引用有向图 | 节点=步骤/变量，边=读/写引用；**手写 SVG**（照 `GenUiChart` 的路子）——宿主 `MemoryGraphView` 用的是 `3d-force-graph`，插件侧 **external 只有 react/react-dom，没有该依赖** |
| **timeline**（时间线） | 按执行顺序的推导时间线 | 每步卡片：Unicode 方程、代换表、结果值、校验徽章；内嵌 `Chart`/`Table` |
| **logs**（原始） | 完整 `DomainResult` JSON + 审计元数据 | 只读 JSON 树 + 来源徽章链 |

顶部三个切换按钮（**面板内**，不是 rail）：**流程 / 时间线 / 日志**。

### 6.4 聊天 → 工作台 的进入方式

> 探查后修正：reducer 里**没有 `OPEN` 事件**。正确的 open event 是 `OPEN_WORKSPACE` /
> `OPEN_PREVIEW`（`types.ts:36-58`），并且插件**拿不到 `dispatch`**，只能发全局
> CustomEvent。另外 `preferredView:"visualization"` 会触发 `FilesDrawer.tsx:66-73`
> 自动切 genui 模式并设 `genUiTarget`，但**设了 target 就走 `ArtifactPreview` 分支，
> slot 被绕过** —— 所以"打开工作台并显示自己的面板"不能靠设 visualization target。

两个主动入口：
1. **聊天卡片内"在工作台打开"按钮** — 发
   `window.dispatchEvent(new CustomEvent("qwenpaw:open-file-preview", {detail:{target, trigger}}))`
   （`openFilePreview.ts:7`）。target 的 `preferredView` **不要**设成 `visualization`
   （否则进 ArtifactPreview 分支、绕过我们的面板）；对路线 B 可用自定义 event
   打开 `compute` 模式并写入所选计算的 `ui_id`。
2. **工作台面板自身列出该会话最近 N 次计算** — 点击任意一次展开其
   flow/timeline/logs；用户随时回看历史计算。

### 6.5 面板如何拿到数据

不需要前端直连后端 API。`ugsci_trace_calculation` / `ugsci_replay_calculation`
返回的 `ToolChunk` 已带 `trace` + `provenance`。前端从**响应数据提取**
（注册 `QP.chat.response.append("ugsci", ctx => ...)`，从 `ctx.data.output`
提取，照 `genui/index.ts:48-56` + `stores/genUi.tsx` 的
`subscribe/getSnapshot/useSyncExternalStore` + LRU 结构），存入**自建 external store**：
- 无需新增 HTTP 路由；
- 天然与聊天消息绑定（一次计算对应一条消息）；
- 按 `session_id` 分组，会话删除时一并清理；
- 聊天卡片与工作台面板订阅同一 store，天然同步。

### 6.6 图表的"生动化"

对含曲线/表格的结果（递减分析、IPR、多相管流），timeline 视图内嵌**手写 SVG Chart**
（复用 `GenUiChart` 的 paint 逻辑）和 `Table`，曲线随每一步"代入/计算"动态高亮。
参数滑动（live-edit）时 `GenUiInteractionProvider` 的 `values` 改变会驱动 `Chart`
重算 —— **这是宿主已存在的现成联动机制**（`GenUiRegistry.tsx:434`，
`Chart` 从 interaction context 读 `values`），无需新造。用户拖动一个输入，
看到推导链和曲线一起变，这是"直观、生动"的落点。

---

## 7. 信息架构总览

```
聊天
 └─ 计算卡片（内嵌）          ← 轻量版：KPI + 步骤卡片 + 变量表 + 假设
     └─ [在工作台打开]  ──→  qwenpaw:open-file-preview / open compute mode
                              └─ UgsciDerivationPanel  (chat.workbench.compute slot)
                                  ├─ flow      (手写 SVG 参数引用/推导有向图)
                                  ├─ timeline  (步骤时间线 + 内嵌 Chart/Table)
                                  ├─ logs      (完整 DomainResult + 审计元数据)
                                  └─ 顶部：来源徽章链 · 重放令牌 · 重新计算按钮
```

**内嵌卡片 vs 工作台的分工**：
- 内嵌卡片：快速浏览结论（"结果多少、用了什么假设"）。
- 工作台：深入探索（"每一步怎么来的、参数从哪进、能否复现"）。
- 同一个 `TracedResult`，两种密度，一次计算。

---

## 8. 后端新增/修改

| 文件 | 改动 |
|---|---|
| `domain/common/result.py` | `DomainResult.provenance` 增加 `reference` / `source` / `parameter_sources` / `unit_audit` / `gate` / `replay_token`（可选字段，默认空） |
| `domain/common/units.py` | 新增 `unit_audit(request, output)`：逐符号量纲核对，返回 `{ok, per_symbol}` |
| `domain/common/replay.py` | `encode_replay_token(payload)` / `verify_replay_token(token)`；HMAC 签名 + 指纹比对 |
| `domain/trace/recorder.py` | 每步 read/write 关系已具备，补 `parameter_sources` 采集（bind 时记来源） |
| `domain/trace/tools.py` | 新增 `ugsci_replay_calculation(token)`；`ugsci_trace_calculation` 返回体带上 `source`/`reference`/`replay_token` |
| `domain/trace/library/*.py` | 各生成公式补 `reference`（Standing 1947、Arps 1945、Havlena–Ode…） |
| `plugin.json` / `plugin.py` | 登记 `ugsci_replay_calculation` 到 `derivation` 组 |

### 8.1 `unit_audit` 示例

```json
"unit_audit": {"ok": true,
  "per_symbol": {
    "OGIP": {"expected": "gas_volume", "actual": "scf", "ok": true},
    "p/z":  {"expected": "pressure",  "actual": "psi", "ok": true},
    "z":    {"expected": "dimensionless", "actual": "", "ok": true}
  }}
```

### 8.2 重放比对

后端执行 `ugsci_replay_calculation` 后，重新计算 `input_fingerprint`，
与令牌内记录值比对：
- 相等 → `{status:"reproducible", elapsed_ms: ...}`
- 不等（引擎升级改了序列化/单位表）→ `{status:"version_changed", diff: {...}}`

---

## 9. 前端新增/修改

| 文件 | 改动 |
|---|---|
| `ugsci/ui/src/derivation/UgsciDerivationPanel.tsx` | 新面板：flow/timeline/logs 三视图 |
| `ugsci/ui/src/derivation/FlowGraph.tsx` | 推导 + 参数引用有向图（**手写 SVG**——宿主 `MemoryGraphView` 用 `3d-force-graph`，插件 external 仅 react/react-dom，无此依赖） |
| `ugsci/ui/src/derivation/Timeline.tsx` | 步骤时间线（Unicode 方程/代换/Chart/校验徽章） |
| `ugsci/ui/src/derivation/useDerivationStore.ts` | 按 session 缓存 `TracedResult`，供工作台读取（external store + `useSyncExternalStore` + LRU） |
| `ugsci/ui/src/derivation/index.ts` | 注册 `QP.slot.fill("ugsci", "chat.workbench.compute", render)`（路线 B）或 `"chat.workbench.genui"`（路线 A）；HMR 幂等守卫 |
| `ugsci/ui/src/index.ts` | `buildPlugin()` 里调用 `registerDerivationWorkbench(QP, React)` |
| `ugsci/ui/src/genui/components/GenUiToolCall.tsx` | 工具卡片加"[在工作台打开]"按钮，**发 `qwenpaw:open-file-preview`**（或自定义 event 打开 compute 模式），`preferredView` 勿设 `visualization` |
| `console/.../files-workspace/WorkbenchPanels.tsx` + `FilesDrawer.tsx` | （仅路线 B）`WorkbenchMode` 加 `"compute"` + rail 图标 + content 分支 |

> 宿主改动仅路线 B 需要；路线 A/C 不改 `console` 一行。

---

## 10. 测试计划

`tests/unit/plugins/ugsci/test_trust_reproducibility.py`

| 类别 | 用例 |
|---|---|
| 审计 | 每个 curated 公式产出含 `reference`/`source`/`gate`/`replay_token`；`source=="freeform"` 时无 `reference` 且标"未审校" |
| 参数来源 | bind 时正确记录 `user_input`/`derived_from`/`external_file`；来源链跨步骤可达 |
| 单位审计 | 单位匹配 → `ok:true`；单位不匹配 → `ok:false, per_symbol` 指出符号 |
| 重放 | 同令牌重放指纹一致 → `reproducible`；篡改令牌 → 校验失败；引擎版本变化 → `version_changed` |
| 工作台数据 | 工具返回带 `trace`+`provenance`，前端提取逻辑单测（`useDerivationStore`） |
| 契约 | 新增字段向后兼容（旧结果无新字段仍能渲染） |
| 回归 | full UGSci suite 仍绿 |

两端契约测试（前端）：`ugsci/ui/src/derivation/__tests__/` 校验
timeline 渲染 `validate_ui_tree` 兼容、flow 图节点/边生成、replay 按钮分发。

---

## 11. 信任分级（贯穿 UI 的承诺）

| 来源 | 徽章 | 用户预期 |
|---|---|---|
| curated | `[审定公式] [Standing 1947]` | 可核对、可复现、可用于工程判断 |
| freeform | `[AI-推导 · 未审校]` | 仅供探索，需自行验证 |
| 重放 | `[✅ 可复现] / [⚠️ 版本已变化]` | 结果可独立验证 |

界面不做"看起来都一样"，而是**明确分级**，把信任的选择权交给用户。

---

## 12. 实施顺序（按对初衷贡献）

| 阶段 | 交付 | 价值 |
|---|---|---|
| 1. 审计元数据 | `reference`/`source`/`gate`/`unit_audit` 补齐到 curated 公式 | 来源可核验 |
| 2. 参数来源链 | `parameter_sources` + bind 采集 | 过程可追踪 |
| 3. 重放令牌 | `ugsci_replay_calculation` + 签名/比对 + 按钮 | 结果可复现 |
| 4. 工作台计算轨道 | `UgsciDerivationPanel`（flow/timeline/logs）· **先路线 A（纯插件）验证数据流 → 再路线 B（宿主加 `compute` mode）拿独立轨道** · "[在工作台打开]"入口 | **直观、生动** |
| 5. freeform（已有） | 保持兜底，接上来源徽章与重放 | 覆盖盲区 |

**建议**：先做 1–3（后端信任层，独立可测、风险低），再做 4（工作台可视化：
先用路线 A 把面板跑通确认数据流，再一次性申请路线 B 的宿主 4 处改动拿独立轨道），5 已实现。

---

## 13. 风险与权衡

1. **字段膨胀**：审计字段全可选、默认空，不破坏旧结果渲染；`to_dict` 只序列化非空。
2. **重放依赖确定性**：只有 `deterministic:true` 的计算才给重放令牌；
   stochastic（PyMC/Pyomo）不给，避免"重放数字不同"造成误导。
3. **工作台数据量**：`trace` 可能较大；工作台按 session 缓存且限制最近 N 条，
   超限 LRU 淘汰（复用 GenUI state store 的 1024 LRU 策略）。
4. **slot 取舍**：`chat.workbench.genui` 空置但只在 GenUI 能力中心态渲染、且是脚注区；
   要独立"计算轨道"必须走路线 B（宿主加 `compute` mode，4 处改动）。先路线 A 验证
   再路线 B 升级，避免一上来就改宿主。slot 用 fill 不 replace，避免抢占其他插件。
5. **流式图依赖**：`MemoryGraphView` 用 `3d-force-graph`（宿主依赖），插件侧没有；
   flow 图必须**手写 SVG**（照 `GenUiChart` 路子），或后续让宿主暴露依赖。
6. **reference 的真实性**：文献/标准引用必须由领域专家复核，绝不可由 LLM 自由编造。
   由 curated 公式作者人工维护 `reference`；freeform 一律不给（标未审校）。

---

## 14. 结论

你最初的诉求——**"让用户对结果放心、可复现"**——的正解不是 freeform，而是
**审计元数据（来源可核验）+ 参数来源链（过程可追踪）+ 重放令牌（结果可复现）**
这三层，加上**右侧工作台**这个直观生动的载体。本方案：
- 全部建立在已验证的 `DomainResult` + `DerivationTrace` 之上，不推翻已实现内容；
- 后端信任层（1–3）独立可测、低风险；
- 工作台落地路径**已实测确认**：三条路线（纯插件 slot / 宿主加 `compute` mode /
  renderer registry），先路线 A 验证数据流，再路线 B 拿独立轨道；
  flow 图**手写 SVG**（宿主 `3d-force-graph` 不在插件依赖内）；
- freeform 保留为兜底，并明确标注"未审校"，不冒充实审定结果。

---

## 中文要点（快速回顾）

**核心**：源头可核验 + 过程可追踪 + 结果可复现，三项全在右侧工作台直观呈现。

1. **`reference`/`source`/`gate`/`unit_audit`** —— 每步标依据、来源、校验、量纲核对。
2. **`parameter_sources`** —— 每个参数的来源链（用户输入/上一步/外部文件/经验相关式），比"参数是多少"更能建立信任。
3. **`replay_token`（HMAC 签名）** —— 一键重跑、指纹比对，返回"✅可复现"或"⚠️版本已变"，直接兑现"可复现"。
4. **右侧工作台 `UgsciDerivationPanel`** —— 注入到已存在但空置的 `chat.workbench.genui` slot；三种视图 flow（参数引用有向图）/ timeline（步骤时间线+曲线）/ logs（完整 JSON+审计），聊天卡片一键在工作台打开。
5. **信任分级** —— 审定（可核对）/ freeform（AI-推导·未审校，不冒充实审定）/ 重放（可复现）。
6. **顺序** —— 先做后端信任层（1-3），再做工作台可视化（4），freeform（5）已实现保留兜底。
