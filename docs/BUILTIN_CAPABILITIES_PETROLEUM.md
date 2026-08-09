# 石油领域内置能力扩展调研报告

> 调研日期：2026-08-08
> 目标：寻找可作为 QwenPaw 桌面版**出厂自带**内置能力集成的石油/天然气领域开源工具

---

## 一、调研背景

QwenPaw 已在集成 **NeqSim MCP Server**（热力学计算与过程模拟），这是石油工程链路的中间环节。本调研聚焦石油工业**全生命周期**——从勘探到生产——寻找可补充 NeqSim 的配套工具。

### 石油工程全生命周期与 NeqSim 定位

```
勘探 Geophysics     →  钻井 Drilling     →  测井 Well Logging
     ↓                                          ↓
储层表征 Reservoir  →  PVT/流体物性 ← NeqSim →  开发方案 Field Dev
     ↓                                          ↓
流动保障 Flow       →  工艺设施 Process ← NeqSim →  生产优化 Production
     ↓                                          ↓
管道/海底 Subsea    →  经济评价 Economics  →  弃井 Abandonment
```

NeqSim 覆盖了 **PVT/流体物性** 和 **工艺设施/过程模拟** 两大环节。本报告寻找覆盖其余环节的工具。

---

## 二、重大发现：NeqSim 官方生态已有 40+ 石油工程 Agent

在调研过程中，我发现了两个关键仓库：

### 2.1 NeqSim Community Agents (`equinor/neqsim-community-agents`)

| 属性 | 值 |
|------|-----|
| GitHub | `equinor/neqsim-community-agents` |
| Stars | 3★ |
| 许可证 | Apache-2.0 |
| Agent 数量 | **40+** |

**完整 Agent 清单（按石油工程环节分类）：**

| 环节 | Agent 名称 | 功能 |
|------|-----------|------|
| **PVT/流体** | `pvt-agent` | PVT 分析、流体表征 |
| | `fluid-characterization-agent` | 流体表征 (组分分析、C7+ 切割) |
| | `e300-fluid-agent` | E300 状态方程流体 |
| **流动保障** | `flow-assurance-engineer-agent` | 流动保障工程 |
| | `hydrate-screening-agent` | 水合物抑制筛选 |
| | `sand-erosion-agent` | 出砂/冲蚀评估 |
| | `subsea-cooldown-agent` | 海底管道冷却时间 |
| | `te-g-dehydration-agent` | TEG 脱水 |
| | `produced-water-scale-agent` | 产出水结垢 |
| **工艺设施** | `process-engineer-agent` | 工艺工程设计 |
| | `process-screening-agent` | 工艺方案筛选 |
| | `process-safety-agent` | 工艺安全 |
| | `gas-treatment-agent` | 天然气处理 |
| | `debottlenecking-agent` | 瓶颈消除 |
| | `utilities-screening-agent` | 公用工程筛选 |
| **管道/海底** | `gas-export-pipeline-agent` | 天然气外输管道 |
| | `pipe-route-screening-agent` | 管道路由筛选 |
| | `piping-integrity-agent` | 管道完整性 |
| | `piping-mechanical-agent` | 管道机械 |
| | `subsea-layout-screening-agent` | 海底布局筛选 |
| | `tie-in-screening-agent` | 接入点筛选 |
| **生产优化** | `production-optimization-agent` | 生产优化 |
| | `ncs-production-analysis-agent` | 挪威大陆架生产分析 |
| | `gas-lift-allocation-agent` | 气举分配优化 |
| | `artificial-lift-agent` | 人工举升 |
| **储层** | `reservoir-forecasting-agent` | 储层产量预测 |
| | `reservoir-to-facility-screening-agent` | 储层到设施筛选 |
| **经济评价** | `asset-economics-agent` | 资产经济评价 |
| | `field-development-economics-agent` | 开发方案经济评价 |
| | `concept-selection-agent` | 概念选择 |
| **设备** | `compressor-antisurge-agent` | 压缩机防喘振 |
| | `reciprocating-compressor-agent` | 往复式压缩机 |
| | `gas-turbine-screening-agent` | 燃气轮机筛选 |
| **环境/排放** | `energy-emissions-agent` | 能源与排放 |
| | `emissions-abatement-screening-agent` | 排放减排筛选 |
| **其他** | `dynamic-process-preparation-agent` | 动态工艺准备 |
| | `dynamic-instrument-controller-agent` | 动态仪表控制 |
| | `cfd-coupling-agent` | CFD 耦合 |
| | `fem-coupling-agent` | FEM 耦合 |
| | `technical-document-intelligence-agent` | 技术文档智能 |

### 2.2 NeqSim Community Skills (`equinor/neqsim-community-skills`)

| 属性 | 值 |
|------|-----|
| GitHub | `equinor/neqsim-community-skills` |
| Stars | 2★ |
| 许可证 | Apache-2.0 |
| 技能分类 | **8 大类** |

**技能分类：**

| 分类 | 覆盖领域 |
|------|---------|
| `pvt/` | PVT 计算、相态、组分物性 |
| `flow-assurance/` | 流动保障、水合物、蜡、结垢 |
| `process/` | 工艺模拟、分离器、压缩机 |
| `subsea/` | 海底系统、管道、脐带缆 |
| `field-development/` | 油田开发方案、概念选择 |
| `safety/` | HAZOP、LOPA、安全屏障 |
| `engineering-data/` | 工程数据标准、组件库 |
| `environment/` | 排放计算、碳足迹 |

> **这两个仓库是 NeqSim 官方生态的组成部分，可以直接作为 QwenPaw 的内置技能/Agent 导入。**

---

## 三、推荐集成的石油领域工具

### 🔥 第一档：强烈推荐（纯 Python，许可证兼容）

#### 1. lasio — 测井 LAS 文件读写

| 属性 | 值 |
|------|-----|
| GitHub | `kinverarity1/lasio` |
| Stars | 398★ |
| 语言 | Python |
| 许可证 | **MIT** ✅ |
| 体积 | ~2 MB |
| 依赖 | numpy (已预装) |

**能力**: 读取和写入 Log ASCII Standard (LAS) 文件——测井数据的标准交换格式。支持 LAS 1.2/2.0/3.0。

**石油工程价值**:
- LAS 是测井数据的标准格式，所有测井公司（斯伦贝谢、贝克休斯等）均使用
- AI 可读取 LAS 文件，分析孔隙度、饱和度、岩性曲线
- 与 PetroPy 配合可完成完整的地层评价

**集成方案**:
```python
# pip install lasio (安装到已内置的 Python 运行时)
# 无需额外二进制或运行时
```

**体积**: ~2 MB (纯 Python 包)

---

#### 2. welly — 测井数据分析

| 属性 | 值 |
|------|-----|
| GitHub | `agilescientific/welly` |
| Stars | 372★ |
| 语言 | Python |
| 许可证 | **Apache-2.0** ✅ |
| 体积 | ~5 MB |
| 依赖 | numpy, scipy, matplotlib (均已预装) |

**能力**: 井加载、测井曲线质量控制、数据科学、合成测井曲线生成、井间对比。

**石油工程价值**:
- 补充 lasio 的纯文件读写能力——提供**分析能力**：曲线质量检查、异常值检测、合成曲线
- 可生成测井图（matplotlib 已预装）
- Agile Geoscience 维护，业界知名

**集成方案**: `pip install welly`

**体积**: ~5 MB

---

#### 3. segyio — 地震 SEG-Y 数据处理

| 属性 | 值 |
|------|-----|
| GitHub | `equinor/segyio` |
| Stars | 581★ |
| 语言 | Python (C++ 后端) |
| 许可证 | **LGPL-3.0** ⚠️ |
| 体积 | ~10 MB |
| 依赖 | numpy (已预装) |

**能力**: 快速读写 SEG-Y 地震数据——二维/三维地震体、道头解析、数据切片。

**石油工程价值**:
- SEG-Y 是地震勘探数据的标准格式
- AI 可读取地震数据，分析地层结构、识别异常体
- Equinor（挪威国家石油公司）官方维护

**许可证注意**: LGPL-3.0 允许作为库链接使用（不要求衍生作品开源），但需要确认 QwenPaw 的分发模式是否兼容。建议作为**动态链接/子进程调用**而非嵌入打包。

**集成方案**: `pip install segyio` (有预编译 wheel)

**体积**: ~10 MB

---

#### 4. Bruges — 地球物理方程库

| 属性 | 值 |
|------|-----|
| GitHub | `agile-geoscience/bruges` |
| Stars | 311★ |
| 语言 | Python |
| 许可证 | **Apache-2.0** ✅ |
| 体积 | ~3 MB |
| 依赖 | numpy (已预装) |

**能力**: 岩石物理方程——Gassmann 流体替换、AVO 分析、弹性阻抗、波阻抗、反射系数。

**石油工程价值**:
- **Gassmann 流体替换**: 给定干岩样物性，预测饱和不同流体后的弹性参数变化——地震反演的核心
- **AVO 分析**: 振幅随偏移距变化分析——直接油气指示 (DHI)
- 与 segyio 配合：segyio 读地震数据 + Bruges 做岩石物理分析

**集成方案**: `pip install bruges`

**体积**: ~3 MB

---

#### 5. SimPEG — 地球物理正演与反演

| 属性 | 值 |
|------|-----|
| GitHub | `simpeg/simpeg` |
| Stars | 665★ |
| 语言 | Python |
| 许可证 | **MIT** ✅ |
| 体积 | ~30 MB |
| 依赖 | numpy, scipy, matplotlib (均已预装) |

**能力**: 地球物理正演模拟和梯度反演——电磁(EM)、重力、磁法、直流电法(DC)、感应电磁(IP)、地震波场。

**石油工程价值**:
- **电磁反演**: 海底电缆(CSEM)油气探测
- **重磁反演**: 盆地结构反演
- 提供从观测数据到地下模型的完整反演框架

**集成方案**: `pip install simpeg`

**体积**: ~30 MB

---

#### 6. PetroPy — 岩石物理/地层评价

| 属性 | 值 |
|------|-----|
| GitHub | `toddheitmann/PetroPy` |
| Stars | 204★ |
| 语言 | Python |
| 许可证 | **MIT** ✅ |
| 体积 | ~5 MB |
| 依赖 | numpy, scipy, matplotlib (均已预装) |

**能力**: 常规与非常规地层评价——孔隙度、饱和度(Sw)、矿物组分、TOC、脆性指数、水力压裂可行性。

**石油工程价值**:
- 从测井曲线计算储层参数：有效孔隙度、含水饱和度
- 非常规评价：TOC、脆性指数、应力各向异性
- 与 lasio + welly 配合构成**测井评价完整链路**:
  ```
  LAS 文件 → lasio 读取 → welly 质量控制 → PetroPy 计算 → 储层参数
  ```

**集成方案**: `pip install petropy`

**体积**: ~5 MB

---

#### 7. pyscal — 相对渗透率/SCAL

| 属性 | 值 |
|------|-----|
| GitHub | `equinor/pyscal` |
| Stars | 66★ |
| 语言 | Python |
| 许可证 | **LGPL-3.0** ⚠️ |
| 体积 | ~10 MB |
| 依赖 | numpy, pandas, matplotlib (均已预装) |

**能力**: 毛细压力和相对渗透率曲线的标准化、拟合、插值、尺度升级——SCAL(特殊岩心分析)到油藏模拟输入。

**石油工程价值**:
- 将实验室岩心数据（毛细压力、相对渗透率）转化为油藏模拟器输入
- 支持 Corey、LET、Stone2 等标准相关性模型
- 与 NeqSim 形成上下游配合：NeqSim 做流体物性 + pyscal 做岩石-流体相互作用

**集成方案**: `pip install pyscal` (有预编译 wheel)

**体积**: ~10 MB

---

### ⚡ 第二档：值得考虑（许可证受限或需额外依赖）

#### 8. PyLops — 地球物理线性算子

| 属性 | 值 |
|------|-----|
| GitHub | `pylops/pylops` |
| Stars | 533★ |
| 语言 | Python |
| 许可证 | **LGPL-3.0** ⚠️ |
| 体积 | ~15 MB |
| 依赖 | scipy (已预装) |

**能力**: 地球物理线性算子库——傅里叶、小波、Radon、NMO、拉冬变换、稀疏反演。用于地震数据处理和成像。

**石油工程价值**:
- 地震数据处理：NMO 校正、叠加、偏移
- 稀疏反演：从地震数据反演地层属性
- 与 segyio + Bruges + SimPEG 构成**地震处理完整链路**:
  ```
  SEG-Y → segyio 读取 → PyLops 处理 → Bruges 岩石物理 → SimPEG 反演
  ```

---

#### 9. resfo — 油藏模拟器输出解析

| 居性 | 值 |
|------|-----|
| GitHub | `equinor/resfo` |
| Stars | 19★ |
| 语言 | Python |
| 许可证 | **LGPL-3.0** ⚠️ |
| 体积 | ~1 MB |
| 依赖 | numpy (已预装) |

**能力**: 解析 ECLIPSE/OPM Flow 油藏模拟器输出文件 (.EGRID, .INIT, .S0000, .R0000 等)。

**石油工程价值**:
- 读取油藏模拟器结果，供 AI 分析
- 可与 NeqSim 的 PVT 数据配合：NeqSim 提供 PVT → ECLIPSE 模拟 → resfo 读取结果
- Equinor 官方维护

---

#### 10. ERT — 集合油藏工具

| 属性 | 值 |
|------|-----|
| GitHub | `equinor/ert` |
| Stars | 157★ |
| 语言 | Python |
| 许可证 | **GPL-3.0** ⚠️⚠️ |
| 体积 | ~50 MB |
| 依赖 | Python 3.8+ |

**能力**: 运行油藏模型集合（如 ECLIPSE/OPM Flow）的自动化工具——历史拟合、不确定性量化、敏感性分析。

**石油工程价值**:
- 油藏模型的历史拟合自动化
- 不确定性传播分析（P90/P50/P10 储量)
- 集合 Kalman 滤波

**许可证注意**: GPL-3.0 要求衍生作品也必须开源。**不建议内置打包**，但可设计为**检测型内置**——检测用户是否安装了 ERT，若有则自动注册为 MCP。

---

#### 11. 递减曲线分析

| 属性 | 值 |
|------|-----|
| GitHub | `kperry2215/automated_decline_curve_analysis_oil_and_gas_wells` |
| Stars | 46★ |
| 语言 | Python |
| 许可证 | 无明确标注 ⚠️ |
| 体积 | ~2 MB |

**能力**: 自动化的指数递减和双曲递减曲线分析。

**石油工程价值**: 油气井产量预测的核心方法。可提取为独立 Python 包封装。

---

#### 12. FormationPy — 地层评价

| 属性 | 值 |
|------|-----|
| GitHub | `yohanesnuwara/FormationPy` |
| Stars | 45★ |
| 语言 | Python |
| 许可证 | **MIT** ✅ |
| 体积 | ~5 MB |

**能力**: 地层评价和岩石物理分析——孔隙度计算、饱和度模型、渗透率估算、地层因子。

**石油工程价值**: 与 PetroPy 功能重叠，但代码更教学化，可提取部分功能。

---

### 💡 第三档：NeqSim 官方生态导入

#### 13. NeqSim Community Agents（40+ 石油工程 Agent）

| 属性 | 值 |
|------|-----|
| GitHub | `equinor/neqsim-community-agents` |
| Stars | 3★ |
| 许可证 | **Apache-2.0** ✅ |
| 体积 | ~5 MB (Python 脚本) |

**能力**: 40+ 预定义石油工程 Agent，涵盖 PVT、流动保障、工艺设施、管道海底、生产优化、储层预测、经济评价。

**集成方案**: 作为 QwenPaw **内置技能包**导入——这些 Agent 已经是针对 NeqSim MCP Server 设计的，可以与已集成的 NeqSim MCP Server 直接配合。

**推荐选择的高优先 Agent**:

| Agent | 为什么推荐 |
|-------|-----------|
| `pvt-agent` | PVT 分析是 NeqSim 核心能力 |
| `flow-assurance-engineer-agent` | 流动保障覆盖管道/水合物/出砂 |
| `hydrate-screening-agent` | 水合物筛选是海上开发必做 |
| `process-engineer-agent` | 工艺设计覆盖分离器/压缩机 |
| `reservoir-forecasting-agent` | 储层产量预测 |
| `production-optimization-agent` | 生产优化 |
| `gas-lift-allocation-agent` | 气举优化是常见工程任务 |
| `concept-selection-agent` | 概念选择是早期开发决策核心 |
| `asset-economics-agent` | 经济评价决策 |

---

#### 14. NeqSim Community Skills（8 大技能分类）

| 属性 | 值 |
|------|-----|
| GitHub | `equinor/neqsim-community-skills` |
| Stars | 2★ |
| 许可证 | **Apache-2.0** ✅ |
| 体积 | ~3 MB |

**能力**: 8 大类工程技能——PVT、流动保障、工艺、海底、油田开发、安全、工程数据、环境。

**集成方案**: 作为 QwenPaw `agents/skills/` 目录下的内置技能导入。

---

## 四、石油工程全链路覆盖矩阵

| 环节 | 推荐工具 | 许可证 | 体积 |
|------|---------|--------|------|
| **地震勘探** | segyio + Bruges + SimPEG + PyLops | LGPL/Apache/MIT | ~58 MB |
| **钻井/测井** | lasio + welly + PetroPy | MIT/Apache/MIT | ~12 MB |
| **储层表征** | pyscal + resfo | LGPL/LGPL | ~11 MB |
| **PVT/流体** | **NeqSim (已集成)** ✅ | Apache-2.0 | ~130 MB |
| **流动保障** | NeqSim Community Agents (flow-assurance) | Apache-2.0 | ~1 MB |
| **工艺设施** | NeqSim Community Agents (process) | Apache-2.0 | ~1 MB |
| **管道/海底** | NeqSim Community Agents (subsea) | Apache-2.0 | ~1 MB |
| **生产优化** | NeqSim Community Agents (production) | Apache-2.0 | ~1 MB |
| **经济评价** | NeqSim Community Agents (economics) | Apache-2.0 | ~1 MB |
| **递减分析** | decline curve (需提取封装) | TBD | ~2 MB |
| **历史拟合** | ERT (检测型) | GPL-3.0 | ~0 MB |

---

## 五、推荐集成路线图

### Phase 1: 纯 Python 包（MIT/Apache 许可证，零额外二进制）

| 工具 | 包名 | 增量体积 | 许可证 |
|------|------|---------|--------|
| 测井 LAS 读写 | `lasio` | ~2 MB | MIT ✅ |
| 测井分析 | `welly` | ~5 MB | Apache-2.0 ✅ |
| 地球物理方程 | `bruges` | ~3 MB | Apache-2.0 ✅ |
| 地球物理反演 | `simpeg` | ~30 MB | MIT ✅ |
| 岩石物理评价 | `petropy` | ~5 MB | MIT ✅ |
| **小计** | | **~45 MB** | |

### Phase 2: NeqSim 官方生态导入

| 内容 | 来源 | 增量体积 |
|------|------|---------|
| 40+ 石油工程 Agent | `neqsim-community-agents` | ~5 MB |
| 8 类工程技能 | `neqsim-community-skills` | ~3 MB |
| **小计** | | **~8 MB** |

### Phase 3: LGPL 许可证包（需法务确认）

| 工具 | 包名 | 增量体积 | 许可证 |
|------|------|---------|--------|
| SEG-Y 地震 | `segyio` | ~10 MB | LGPL-3.0 ⚠️ |
| 相对渗透率 | `pyscal` | ~10 MB | LGPL-3.0 ⚠️ |
| 油藏输出解析 | `resfo` | ~1 MB | LGPL-3.0 ⚠️ |
| 地震算子 | `pylops` | ~15 MB | LGPL-3.0 ⚠️ |
| **小计** | | **~36 MB** | |

### Phase 4: 检测型内置（不打包，检测后自动注册）

| 工具 | 检测目标 | 许可证 |
|------|---------|--------|
| ERT 历史拟合 | `ert` 可执行文件 | GPL-3.0 |
| OPM Flow 油藏模拟 | `flow` 可执行文件 | GPL-3.0 |
| MRST (MATLAB) | `matlab` + MRST 路径 | GPL-3.0 |

---

## 六、与 QwenPaw 现有架构的集成

### 6.1 Python 类工具集成模式

```python
# src/qwenpaw/agents/builtin_mcp/lasio.py
def _build_endpoint(python_exe: str) -> dict:
    return {
        "transport": "stdio",
        "command": python_exe,
        "args": ["-m", "lasio_mcp_server"],  # 需要简单封装为 MCP
        "env": {},
    }
```

> 注意：lasio、welly 等库本身不是 MCP Server。需要编写轻量 MCP 封装（< 100 行 Python），将库函数暴露为 MCP 工具。

### 6.2 NeqSim Community Agents 导入模式

```python
# 从 neqsim-community-agents 仓库同步 Agent 定义
# 每个 Agent 已包含 NeqSim MCP 工具调用配置
# 直接放入 QwenPaw agents/skills/ 目录
```

### 6.3 封装示例：lasio MCP Server

```python
# scripts/mcp_wrappers/lasio_mcp.py (示例)
from mcp.server import Server
import lasio

server = Server("lasio")

@server.tool("read_las_file")
async def read_las(path: str) -> dict:
    """Read a LAS well log file and return curves + metadata."""
    las = lasio.read(path)
    return {
        "version": las.version,
        "well": las.well,
        "curves": {c.mnemonic: c.data.tolist() for c in las.curves},
    }
```

---

## 七、总量估算

| Phase | 内容 | 增量体积 | 许可证风险 |
|-------|------|---------|-----------|
| Phase 1 | 5 个 Python 包 | +45 MB | 无风险 (MIT/Apache) |
| Phase 2 | NeqSim 生态导入 | +8 MB | 无风险 (Apache-2.0) |
| Phase 3 | 4 个 LGPL 包 | +36 MB | 需法务确认 |
| Phase 4 | 检测型内置 | +0 MB | 无风险 |
| NeqSim (已实现) | MCP Server + JRE | +130 MB | 无风险 (Apache-2.0) |
| **全部累计** | | **~219 MB** | |

> **Phase 1 + 2 合计仅 53 MB**，即可实现石油工程全链路覆盖（测井 → 岩石物理 → PVT → 工艺 → 流动保障 → 生产 → 经济），性价比极高。

---

## 八、总结

| 优先级 | 能力 | 核心价值 | 增量 |
|--------|------|---------|------|
| 🔥 | lasio (测井 LAS) | 测井数据读写 | +2 MB |
| 🔥 | welly (测井分析) | 测井曲线质量控制 | +5 MB |
| 🔥 | bruges (岩石物理) | Gassmann/AVO 方程 | +3 MB |
| 🔥 | SimPEG (地球物理) | 正演反演 | +30 MB |
| 🔥 | PetroPy (地层评价) | 孔隙度/饱和度计算 | +5 MB |
| 🔥 | NeqSim Agents (40+) | 全链路工程 Agent | +5 MB |
| 🔥 | NeqSim Skills (8类) | 工程技能库 | +3 MB |
| ⚡ | segyio (地震 SEG-Y) | 地震数据读写 | +10 MB |
| ⚡ | pyscal (相对渗透率) | SCAL → 油藏模拟 | +10 MB |
| ⚡ | resfo (油藏输出) | ECLIPSE 结果解析 | +1 MB |
| ⚡ | PyLops (地震算子) | 地震处理 | +15 MB |
| 💡 | ERT (检测型) | 历史拟合 | +0 MB |

**Phase 1 (5 个 MIT/Apache Python 包 + NeqSim 生态) 是最高优先级路线**——53 MB 增量即可实现从勘探到生产的石油工程全链路 AI 赋能。
