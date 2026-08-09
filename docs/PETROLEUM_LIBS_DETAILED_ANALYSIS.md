# 石油领域 Python 库详细调研报告

> 调研日期：2026-08-08
> 对象：lasio / welly / bruges / SimPEG / PetroPy

---

## 一、lasio — 测井 LAS 文件读写

### 基本信息

| 属性 | 值 |
|------|-----|
| GitHub | `kinverarity1/lasio` |
| Stars | 398★ / Forks 173 / Open Issues 53 |
| 许可证 | **MIT** ✅ |
| 语言 | Python (GitHub 标注为 "Lasso" 是误识别) |
| PyPI 版本 | 0.32（38 个发布） |
| 创建时间 | 2013-12-24 |
| 最近提交 | 2026-02-13（6 个月前） |
| 最近 Push | 2026-02-13 |
| Python 要求 | >=3.9 |
| 文档 | https://lasio.readthedocs.io（Sphinx/ReadTheDocs，完整） |

### 出品方

**个人开发者：Kent Inverarity**（GitHub: `kinverarity1`）

- 澳大利亚地质学家/程序员
- 主要贡献者：927 次提交（占 82%）
- 第二贡献者 `dcslagel`：150 次提交
- 共 5+ 贡献者
- 无商业公司背书，但**活跃维护了 13 年**

### 功能详解

**lasio 解决的核心问题**：测井数据以 LAS (Log ASCII Standard) 格式存储，这是加拿大测井协会 (CWLS) 制定的行业标准。LAS 文件有 1.2、2.0、3.0 三个版本，格式复杂且实际文件常有格式错误。

**具体功能**：

```
lasio.read("well.las")     → 读取 LAS 文件（支持文件路径/URL/文件对象）
las.curves                → 获取所有曲线（GR, NPHI, RHOB 等）
las['GR']                 → 按名获取单条曲线（返回 numpy 数组）
las.header                → 获取井头信息（井名、深度范围等）
lasio.write(las, "out.las") → 写入 LAS 文件
las.to_excel("out.xlsx")  → 导出为 Excel
las.to_dataframe()         → 转为 pandas DataFrame
```

**源码结构**（11 个 .py 文件）：

| 文件 | 大小 | 职责 |
|------|------|------|
| `las.py` | 50 KB | 主类 `LASFile`，文件解析入口 |
| `reader.py` | 36 KB | 底层解析器（处理格式容错） |
| `writer.py` | 16 KB | LAS 文件写入 |
| `las_items.py` | 18 KB | 曲线项、头项数据结构 |
| `defaults.py` | 6 KB | 默认值和常量 |
| `excel.py` | 5 KB | Excel 导出 |

### 代码质量评估

| 检查项 | 状态 | 说明 |
|--------|------|------|
| CI/CD | ✅ | `ci-tests.yml`（GitHub Actions） |
| 测试 | ✅ | 20 个测试文件（test_api, test_encoding, test_examples 等） |
| 代码规范 | ✅ | 使用 black 格式化 |
| 文档 | ✅ | ReadTheDocs 完整文档，含快速入门和 API 参考 |
| Issue 响应 | ⚠️ | 53 个 Open Issues，部分较老 |
| 依赖 | ✅ | 仅依赖 numpy（极轻量） |
| PyPI 发布 | ✅ | 38 个版本，稳定发布流程 |

### 可靠性判定

| 维度 | 评分 | 理由 |
|------|------|------|
| 成熟度 | ⭐⭐⭐⭐⭐ | 13 年历史，38 个 PyPI 版本 |
| 维护活跃度 | ⭐⭐⭐⭐ | 最近提交 2026-02，6 个月前仍活跃 |
| 社区规模 | ⭐⭐⭐⭐ | 398 Stars，173 Forks |
| 代码质量 | ⭐⭐⭐⭐ | 有 CI，20 个测试文件，black 规范 |
| 文档质量 | ⭐⭐⭐⭐⭐ | ReadTheDocs 完整文档 |
| 依赖安全性 | ⭐⭐⭐⭐⭐ | 仅依赖 numpy |
| **综合** | **⭐⭐⭐⭐½** | **推荐集成** |

### 实际使用示例

```python
import lasio
import numpy as np

# 读取 LAS 文件
las = lasio.read("well.las")

# 查看曲线列表
print(f"Curves: {[c.mnemonic for c in las.curves]}")
# → Curves: ['DEPT', 'GR', 'NPHI', 'RHOB', 'RT']

# 获取数据
depth = las['DEPT']
gr = las['GR']

# 统计
print(f"GR: mean={np.mean(gr):.1f}, std={np.std(gr):.1f}")
print(f"Depth range: {depth.min():.1f} - {depth.max():.1f} m")

# 转为 DataFrame 做进一步分析
df = las.to_dataframe()
```

---

## 二、welly — 测井数据分析

### 基本信息

| 属性 | 值 |
|------|-----|
| GitHub | `agilescientific/welly` |
| Stars | 372★ / Forks 141 / Open Issues 116 |
| 许可证 | **Apache-2.0** ✅ |
| 语言 | Python |
| PyPI 版本 | 0.5.2（25 个发布） |
| 创建时间 | 2015-11-09 |
| 最近提交 | 2025-07-16（1 年前） |
| Python 要求 | >=3.6 |
| 文档 | https://code.agilescientific.com/welly |
| 社区 | Software Underground Mattermost #welly-and-lasio 频道 |

### 出品方

**Agile Scientific**（GitHub: `agilescientific` / `agile-geoscience`，组织账号）

- 加拿大地球科学咨询公司，专注于地球科学教育和软件开发
- 创始人：Matt Hall（`kwinkunks`），421 次提交
- 共 5+ 贡献者，包括 Patrick Reinhard（110 次）、Wenting Xu（32 次）
- **同时维护 welly 和 bruges 两个库**
- 公司官网：http://www.agilescientific.com
- 活跃于 Software Underground 社区

### 功能详解

**welly 在 lasio 之上构建了什么**：lasio 只负责文件读写，welly 提供完整的测井分析能力。

**具体功能**：

| 模块 | 功能 | 源码大小 |
|------|------|---------|
| `well.py` | Well 类：加载井、管理曲线、井间对比 | 51 KB |
| `curve.py` | Curve 类：曲线操作、插值、滤波、归一化 | 38 KB |
| `project.py` | Project 类：多井管理、批量处理 | 33 KB |
| `quality.py` | 质量控制：异常值检测、完整性检查 | 13 KB |
| `plot.py` | 测井曲线绘图（matplotlib 后端） | 18 KB |
| `synthetic.py` | 合成地震记录生成 | 3 KB |
| `location.py` | 井位坐标、CRS 投影 | 14 KB |
| `canstrat.py` | CanStrat 岩性数据支持 | 7 KB |
| `scales.py` | 曲线尺度转换 | 3 KB |

**与 lasio 的关系**（lasio README 原文）：
> "welly uses lasio for I/O but provides a lot more functionality aimed at working with curves, wells, and projects. I would recommend starting there in most cases."

### 代码质量评估

| 检查项 | 状态 | 说明 |
|--------|------|------|
| CI/CD | ✅ | 三个 workflow：run-tests, build-docs, pypi-release |
| 测试 | ✅ | 13 个测试文件 |
| 代码规范 | ✅ | 有 CONTRIBUTING.md |
| 文档 | ✅ | 独立文档站点 + 教程 notebooks |
| Issue 响应 | ⚠️ | 116 个 Open Issues（较多） |
| 依赖 | ⚠️ | 依赖 lasio + numpy + scipy + matplotlib + pandas |
| PyPI 发布 | ✅ | 25 个版本，有 rc 预发布流程 |

### 可靠性判定

| 维度 | 评分 | 理由 |
|------|------|------|
| 成熟度 | ⭐⭐⭐⭐ | 10 年历史，25 个 PyPI 版本 |
| 维护活跃度 | ⭐⭐⭐ | 最近提交 2025-07，1 年前 |
| 社区规模 | ⭐⭐⭐⭐ | 372 Stars，公司背书 |
| 代码质量 | ⭐⭐⭐⭐ | 有 CI，13 个测试文件 |
| 文档质量 | ⭐⭐⭐⭐ | 有文档站和教程 |
| 依赖安全性 | ⭐⭐⭐⭐ | 依赖均为成熟的科学计算库 |
| **综合** | **⭐⭐⭐⭐** | **推荐集成（与 lasio 配合）** |

### 实际使用示例

```python
from welly import Well, Project

# 加载单口井
w = Well.from_las('my_well.las')

# 获取曲线
gr = w.data['GR']
gr.plot()  # 直接画测井曲线

# 质量控制
qc = w.data['GR'].quality  # 质量检查对象

# 加载多口井
p = Project.from_las('wells/*.las')
for well in p:
    print(f"{well.name}: {well.data.keys()}")
```

---

## 三、bruges — 地球物理方程库

### 基本信息

| 属性 | 值 |
|------|-----|
| GitHub | `agile-geoscience/bruges` |
| Stars | 311★ / Forks 117 / Open Issues 34 |
| 许可证 | **Apache-2.0** ✅ |
| 语言 | Python |
| PyPI 版本 | 0.5.4（25 个发布） |
| 创建时间 | 2013-09-06 |
| 最近提交 | 2023-12-19（**2.5 年前**） |
| Python 要求 | >=3.6 |
| 文档 | https://code.agilescientific.com/bruges |

### 出品方

**与 welly 同属 Agile Scientific**（同一团队、同一维护者 `kwinkunks`）

- 主要贡献者：`kwinkunks`（268 次提交）
- 第二贡献者 `ben-bougher`（67 次提交）
- 第三贡献者 `JesperDramsch`（17 次，知名地球物理科学传播者）

### 功能详解

**bruges 是什么**：一个地球物理方程集合——"from Aki-Richards to Zoeppritz"（从 Aki-Richards 到 Zoeppritz 方程，覆盖了地震勘探中的全部核心反射系数模型）。

**模块结构**（子包形式）：

| 子包 | 功能 | 石油工程用途 |
|------|------|-------------|
| `bruges.reflection` | 反射系数：Aki-Richards, Zoeppritz, Shuey, Fatti | AVO 分析（直接油气指示） |
| `bruges.rockphysics` | 岩石物理模型 | 储层表征 |
| `bruges.petrophysics` | 孔隙度、渗透率相关性 | 储层参数计算 |
| `bruges.filters` | 子波：Ricker, Ormsby, Butterworth | 地震数据处理 |
| `bruges.noise` | 噪声模型 | 数据质量评估 |
| `bruges.transform` | 坐标变换 | 井孔到地表 |
| `bruges.models` | 简单地层模型 | 正演验证 |
| `bruges.attribute` | 地震属性 | 储层预测 |

**关键方程举例**：

```python
import bruges as bg

# Gassmann 流体替换：给定干岩样弹性参数，预测饱和不同流体后的参数
# 这是地震反演中最核心的方程之一
vp_sat, vs_sat, rho_sat = bg.rockphysics.gassmann(
    vp_dry, vs_dry, rho_dry,     # 干岩样参数
    k_mineral,                   # 矿物体积模量
    k_fluid_new, rho_fluid_new,  # 新流体参数
    porosity,                    # 孔隙度
)

# Aki-Richards 反射系数：计算两个地层界面的反射系数
# 用于 AVO (Amplitude Versus Offset) 分析
rc = bg.reflection.akirichards(
    vp1, vs1, rho1,  # 上层参数
    vp2, vs2, rho2,  # 下层参数
    theta,           # 入射角
)

# Ricker 子波
w, t = bg.filters.ricker(0.256, 0.002, 30)  # 30 Hz
```

### 代码质量评估

| 检查项 | 状态 | 说明 |
|--------|------|------|
| CI/CD | ✅ | run-tests, build-docs, pypi-release |
| 测试 | ⚠️ | 仅 3 个测试文件（偏少） |
| 文档 | ✅ | 有独立文档站 |
| Issue 响应 | ⚠️ | 34 个 Open Issues |
| 维护状态 | 🔴 | **最近提交 2023-12，2.5 年无更新** |
| 依赖 | ✅ | 仅依赖 numpy + scipy |

### 可靠性判定

| 维度 | 评分 | 理由 |
|------|------|------|
| 成熟度 | ⭐⭐⭐⭐ | 13 年历史，25 个版本 |
| 维护活跃度 | ⭐⭐ | **2.5 年无提交**，可能有维护风险 |
| 社区规模 | ⭐⭐⭐⭐ | 311 Stars，Agile Scientific 背书 |
| 代码质量 | ⭐⭐⭐ | 有 CI 但测试少 |
| 文档质量 | ⭐⭐⭐ | 有文档站但不完整 |
| 依赖安全性 | ⭐⭐⭐⭐⭐ | 仅 numpy + scipy |
| **综合** | **⭐⭐⭐½** | **可用但需关注维护状态** |

### 维护风险与缓解

**风险**：bruges 最近提交是 2023-12-19，已经 2.5+ 年没有更新。

**缓解措施**：
1. 代码本身是**纯数学函数**，不依赖外部 API 或服务，不会因缺乏维护而失效
2. 方程（Aki-Richards、Gassmann、Zoeppritz）是地球物理学的基础公式，不会变
3. 如果后续发现问题，可以 fork 维护
4. 替代方案：将 bruges 中的关键函数直接提取到技能代码中（< 200 行）

---

## 四、SimPEG — 地球物理正演与反演

### 基本信息

| 属性 | 值 |
|------|-----|
| GitHub | `simpeg/simpeg` |
| Stars | 665★ / Forks 293 / Open Issues 184 |
| 许可证 | **MIT** ✅ |
| 语言 | Python |
| PyPI 版本 | 0.25.2（78 个发布） |
| 创建时间 | 2013-11-26 |
| 最近 Push | 2026-08-04（**4 天前！**） |
| Python 要求 | >=3.11 |
| 文档 | http://simpeg.xyz |
| DOI | 10.5281/zenodo.596373（学术引用） |
| 社区 | Discourse 论坛 + Mattermost 频道 + YouTube 频道 + 每周三会议 |

### 出品方

**SimPEG 组织**（学术研究团队）

- 主要维护者：
  - `lheagy`（Lindsey Heagy）：2,253 次提交
  - `jcapriot`（Joseph Capriot）：1,608 次提交
  - `sgkang`（Seogi Kang）：825 次提交
  - `thast`：792 次提交
  - `fourndo`（Thibaut Astic）：708 次提交
- **超过 10 位核心贡献者，总计 6,000+ 次提交**
- 来自 UC Berkeley、多伦多大学等学术机构
- **有 SimPEG 论文**（Computational Geosciences 期刊发表）
- 有 Zenodo DOI（学术引用标识）

### 功能详解

**SimPEG 是什么**：一个地球物理正演模拟和参数估计（反演）框架。

**模块结构**：

| 模块 | 功能 | 石油工程用途 |
|------|------|-------------|
| `simpeg.electromagnetics` | 电磁正演/反演 | 海底 CSEM 油气探测 |
| `simpeg.potential_fields` | 重磁正演/反演 | 盆地结构反演 |
| `simpeg.seismic` | 地震层析成像 | 井间地震成像 |
| `simpeg.flow` | 地下水流模拟 | 油藏流体流动 |
| `simpeg.optimization` | 优化算法 | 反演优化器 |
| `simpeg.regularization` | 正则化 | 反演稳定性 |
| `simpeg.maps` | 模型映射 | 参数化 |
| `simpeg.directives` | 反演指令 | 迭代控制 |

**电磁模块详细**（与石油勘探最相关）：

```
simpeg/electromagnetics/
├── frequency_domain/      → 频域电磁（FDEM）
├── time_domain/           → 时域电磁（TDEM）
├── natural_source/       → 大地电磁（MT）
├── static/               → 直流电法（DC）/ 激发极化（IP）
├── analytics/            → 解析解
└── viscous_remanent_magnetization/  → VRM
```

**反演流程示例**：

```python
from simpeg import simpeg, maps
from simpeg.electromagnetics import time_domain as tdem

# 1. 创建观测系统（发射/接收位置）
src_location = np.array([0, 0, 0])
rx_location = np.array([10, 0, 0])
times = np.logspace(-4, -1, 20)
src_list = [tdem.sources.LineCurrent(...)]

# 2. 创建正演模拟
survey = tdem.Survey(src_list)
simulation = tdem.Simulation3DElectricField(
    mesh, survey=survey, sigmaMap=maps.IdentityMap(nP=mesh.nC)
)

# 3. 设置反演
reg = simpeg.regularization.WeightedLeastSquares(mesh)
opt = simpeg.optimization.InexactGaussNewton(maxIter=10)
inv_prob = simpeg.Inversion(survey, simulation, reg, opt)

# 4. 运行反演
model = inv_prob.run(dobs)  # 观测数据 → 地下电导率模型
```

### 代码质量评估

| 检查项 | 状态 | 说明 |
|--------|------|------|
| CI/CD | ✅ | pull_request.yml + zizmor.yml（安全扫描） |
| 测试 | ✅ | 12 个测试文件 |
| 代码规范 | ✅ | 有 CODEOWNERS, PR 审查流程 |
| 文档 | ✅ | simpeg.xyz 独立文档站 + 教程 + YouTube |
| 学术发表 | ✅ | 有 DOI，Computational Geosciences 论文 |
| 覆盖率 | ✅ | 有 Codecov 集成 |
| 依赖 | ⚠️ | 较多：numpy, scipy, matplotlib, discretize, pymatsolver |
| PyPI 发布 | ✅ | 78 个版本，非常活跃的发布周期 |

### 可靠性判定

| 维度 | 评分 | 理由 |
|------|------|------|
| 成熟度 | ⭐⭐⭐⭐⭐ | 13 年历史，78 个 PyPI 版本 |
| 维护活跃度 | ⭐⭐⭐⭐⭐ | **4 天前刚推送代码**，极度活跃 |
| 社区规模 | ⭐⭐⭐⭐⭐ | 665 Stars，10+ 核心贡献者，学术团队 |
| 代码质量 | ⭐⭐⭐⭐⭐ | 有 CI、安全扫描、覆盖率、PR 审查 |
| 文档质量 | ⭐⭐⭐⭐⭐ | 文档站 + 教程 + YouTube + 论坛 + 每周会议 |
| 依赖安全性 | ⭐⭐⭐ | 依赖较多，但均为成熟科学计算库 |
| **综合** | **⭐⭐⭐⭐⭐** | **强烈推荐，质量最高的库** |

### 注意事项

1. **体积较大**（~30 MB）：因包含多个物理模块，但 numpy/scipy 已预装
2. **Python >=3.11 要求**：需确认内置 Python 版本是否满足（当前预装的 3.13 满足）
3. **计算密集型**：反演计算可能耗时较长，建议在脚本中设置合理的 maxIter

---

## 五、PetroPy — 地层评价

### 基本信息

| 属性 | 值 |
|------|-----|
| GitHub | `toddheitmann/PetroPy` |
| Stars | 204★ / Forks 68 / Open Issues 12 |
| 许可证 | **MIT** ✅ |
| 语言 | Python |
| PyPI 版本 | 0.1.6（7 个发布） |
| 创建时间 | 2017-06-02 |
| 最近提交 | **2019-05-21（7+ 年前！）** |
| Python 要求 | 未指定 |
| 文档 | https://toddheitmann.github.io/PetroPy/ |

### 出品方

**个人开发者：Todd Heitmann**

- **唯一贡献者**：仅 23 次提交
- 无组织背书
- 无 CI/CD
- **自 2019 年 5 月以来无任何更新**

### 功能详解

**PetroPy 做什么**：基于 lasio 读取 LAS 文件，提供完整的地层评价工作流——从原始测井曲线到储层参数（孔隙度、饱和度、矿物组分）。

**源码结构**（仅 2 个核心文件）：

| 文件 | 大小 | 问题 |
|------|------|------|
| `log.py` | **111 KB** | **单文件过大**，所有逻辑塞在一个文件里 |
| `graphs.py` | 40 KB | 绘图代码 |
| `electrofacies.py` | 7 KB | 电相分类 |
| `datasets.py` | 1 KB | 示例数据 |
| `download.py` | 9 KB | 数据下载 |

**功能包括**：
- 读取 LAS 文件（依赖 lasio）
- 流体物性计算（地层压力、温度、水电阻率、粘度）
- 多矿物模型（石英-黏土-方解石-白云石-黄铁矿-有机质）
- 含水饱和度（Archie/Simandoux/Indonesia 等公式）
- 有效孔隙度计算
- TOC（总有机碳）估算
- 测井曲线绘图（基于 XML 模板）

### 代码质量评估

| 检查项 | 状态 | 说明 |
|--------|------|------|
| CI/CD | 🔴 | **无** |
| 测试 | ⚠️ | 仅 3 个测试文件 |
| 代码规范 | 🔴 | 单文件 111 KB，无模块化 |
| 文档 | ⚠️ | 有 GitHub Pages 文档但不完整 |
| 维护状态 | 🔴 | **7+ 年未更新** |
| 依赖 | ⚠️ | 依赖 cchardet（已弃用） |

### 可靠性判定

| 维度 | 评分 | 理由 |
|------|------|------|
| 成熟度 | ⭐⭐ | 9 年历史但仅 7 个版本 |
| 维护活跃度 | ⭐ | **7+ 年未更新，实质已停止维护** |
| 社区规模 | ⭐⭐⭐ | 204 Stars 但仅 1 位贡献者 |
| 代码质量 | ⭐⭐ | 无 CI，单文件 111KB，无模块化 |
| 文档质量 | ⭐⭐ | 有文档但不完整 |
| 依赖安全性 | ⭐⭐ | 依赖已弃用的 cchardet |
| **综合** | **⭐⭐** | **⚠️ 不推荐直接集成** |

### 替代方案

PetroPy 的核心功能（孔隙度、饱和度计算）可以**直接在技能代码中实现**，因为这些方程本身就是标准公式：

```python
# Archie 公式计算含水饱和度（PetroPy 核心功能之一，但只是简单公式）
import numpy as np

def archie_sw(rt, rw, phi, a=1.0, m=2.0, n=2.0):
    """Archie 含水饱和度公式。
    Sw = (a * Rw / (Rt * phi^m))^(1/n)
    """
    sw = (a * rw / (rt * phi**m))**(1/n)
    return np.clip(sw, 0, 1)

# 密度-中子交会孔隙度
def density_neutron_porosity(rhob, nphi, rhoma=2.65, rhof=1.0):
    """密度-中子交会孔隙度。"""
    phi_d = (rhoma - rhob) / (rhoma - rhof)  # 密度孔隙度
    phi_avg = np.sqrt(phi_d * nphi)           # 平均孔隙度
    return phi_avg
```

这些公式不到 20 行代码，**不需要依赖一个 7 年未维护的库**。

---

## 六、对比总结

### 综合评估矩阵

| 库 | Stars | 维护活跃度 | 贡献者 | CI | 测试 | 许可证 | 体积 | 推荐 |
|----|-------|----------|--------|-----|------|--------|------|------|
| **lasio** | 398 | ⭐⭐⭐⭐ 6 月前 | 5+ | ✅ | 20 文件 | MIT | 2 MB | ✅ **强烈推荐** |
| **welly** | 372 | ⭐⭐⭐ 1 年前 | 5+ | ✅ | 13 文件 | Apache | 5 MB | ✅ **推荐** |
| **bruges** | 311 | ⭐⭐ 2.5 年前 | 5+ | ✅ | 3 文件 | Apache | 3 MB | ⚠️ **可用但关注维护** |
| **SimPEG** | 665 | ⭐⭐⭐⭐⭐ 4 天前 | 10+ | ✅ | 12 文件 | MIT | 30 MB | ✅ **强烈推荐** |
| **PetroPy** | 204 | ⭐ 7+ 年前 | 1 | ❌ | 3 文件 | MIT | 5 MB | ❌ **不推荐** |

### 出品方对比

| 库 | 出品方 | 类型 | 信誉 |
|----|--------|------|------|
| lasio | Kent Inverarity（个人） | 地质学家/程序员 | 高（13 年持续维护） |
| welly | Agile Scientific（公司） | 地球科学咨询公司 | 高（公司背书 + 社区活跃） |
| bruges | Agile Scientific（同上） | 同上 | 高但维护停滞 |
| SimPEG | SimPEG 组织（学术团队） | UC Berkeley 等 | **最高**（学术发表 + DOI + 活跃社区） |
| PetroPy | Todd Heitmann（个人） | 个人项目 | **低**（7 年未维护） |

### 最终推荐

| 推荐级别 | 库 | 集成方式 | 体积 |
|---------|-----|---------|------|
| ✅ 强烈推荐 | **lasio** | pip install + SKILL.md | ~2 MB |
| ✅ 强烈推荐 | **SimPEG** | pip install + SKILL.md | ~30 MB |
| ✅ 推荐 | **welly** | pip install + SKILL.md | ~5 MB |
| ⚠️ 可选 | **bruges** | pip install 或提取关键函数 | ~3 MB |
| ❌ 不推荐 | ~~PetroPy~~ | **不安装库，将关键公式写入 SKILL.md** | 0 MB |

> **PetroPy 的替代方案**：不安装这个 7 年未维护的库，而是在技能的 SKILL.md 中直接写明 Archie、Simandoux 等标准公式。这些公式本身就是 5-10 行 numpy 代码，Agent 完全能直接写出来。
