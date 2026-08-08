# 内置能力扩展调研报告

> 调研日期：2026-08-08
> 目标：寻找可作为 QwenPaw 桌面版**出厂自带**内置能力集成的开源工具与 MCP Server

---

## 一、调研背景与筛选标准

### 1.1 QwenPaw 已有的内置能力

| 能力 | 实现方式 |
|------|---------|
| 文件读写 / 搜索 | `file_io.py`, `file_search.py` (grep/glob) |
| Shell 命令执行 | `shell.py` |
| 网页搜索 / 抓取 | `web_search.py` (web_fetch/web_search) |
| Office 文档处理 | `office_tools.py` (基于 OfficeCLI) |
| 浏览器自动化 | `browser/` (Chrome Control Link) |
| 桌面截图 | `desktop_screenshot.py` |
| LSP 代码分析 | `lsp_tool.py`, `_lsp_servers/` |
| 媒体查看 | `view_media.py` |
| Agent 管理与委派 | `agent_management.py`, `delegate_external_agent.py` |
| 批量工具执行 | `run_tool_batch.py` |
| 时间查询 | `get_current_time.py` |
| 技能系统 | `skill_system/` (40+ 内置技能) |
| **NeqSim 热力学** | ✅ 正在集成 (MCP Server, Java JRE) |

### 1.2 筛选标准

| 维度 | 要求 |
|------|------|
| **许可证** | MIT / Apache-2.0 / BSD (允许商业分发) |
| **自包含** | 可打包为独立二进制/脚本，不依赖外部服务 |
| **跨平台** | 支持 macOS (arm64/x64) + Windows x64 |
| **体积可控** | 打包后增量 < 200 MB 优先 |
| **MCP 兼容** | 已有 MCP Server 或可低成本封装 |
| **实际需求** | 与 QwenPaw 目标用户（工程/科研/开发）场景匹配 |
| **成熟度** | GitHub Stars > 100，活跃维护 |

---

## 二、推荐集成的内置能力

按优先级分三档：🔥 高优先（强烈推荐）、⚡ 中优先（值得考虑）、💡 低优先（按需扩展）

---

### 🔥 高优先级

#### 1. Pandoc 文档转换 (`mcp-pandoc`)

| 属性 | 值 |
|------|-----|
| GitHub | `vivekVells/mcp-pandoc` |
| Stars | 573★ |
| 语言 | Python |
| 许可证 | MIT |
| 体积 | ~2 MB (Python 包) + pandoc 二进制 ~150 MB |
| 依赖 | pandoc 系统二进制 |

**能力**: 在 Markdown、HTML、LaTeX、PDF、DOCX、PPTX、EPUB、RTF 等 40+ 格式间转换文档。

**推荐理由**:
- QwenPaw 已有 OfficeCLI 处理 Office 文档，但**缺少 Markdown↔LaTeX/PDF/EPUB 转换**
- AI 生成的 Markdown 报告可直接转成精美 PDF 或 Word
- Pandoc 是文档转换的事实标准，30+ 年历史
- MCP Server 已有，直接 `pip install` + 下载 pandoc 二进制

**集成方案**:
```
stage_pandoc.py  →  下载 pandoc 二进制 (跨平台预编译)
pip install mcp-pandoc
MCP 配置: stdio transport, command=pandoc, 或 python -m mcp_pandoc
```

**体积**: ~150 MB (pandoc 二进制) + ~2 MB (Python MCP wrapper)

---

#### 2. SQLite 本地数据库 (`dbhub`)

| 属性 | 值 |
|------|-----|
| GitHub | `bytebase/dbhub` |
| Stars | 3,308★ |
| 语言 | TypeScript |
| 许可证 | MIT |
| 体积 | ~20 MB (Node.js 包) + Node 运行时已内置 |
| 依赖 | Node.js (QwenPaw 已内置) |

**能力**: 为 AI 提供 SQL 查询能力——连接 SQLite/PostgreSQL/MySQL/MariaDB/SQL Server，执行查询、导出结果。

**推荐理由**:
- QwenPaw 已内置 Node.js 运行时，**零额外运行时依赖**
- 用户数据常以 SQLite 形式存储（如 Chrome 历史、消息记录）
- 支持 5 种主流数据库，覆盖面广
- Bytebase 团队维护，质量有保障

**集成方案**:
```
npx -y @bytebase/dbhub  (利用已内置的 Node.js)
MCP 配置: stdio transport, command=node, args=[dbhub.js, --db=sqlite, --path=...]
```

**体积**: ~20 MB (仅 npm 包，Node 运行时已内置)

---

#### 3. Excel 电子表格 (`excel-mcp-server`)

| 属性 | 值 |
|------|-----|
| GitHub | `haris-musa/excel-mcp-server` |
| Stars | 4,094★ |
| 语言 | Python |
| 许可证 | MIT |
| 体积 | ~5 MB (Python 包) |
| 依赖 | openpyxl (Python) |

**能力**: 创建、读取、编辑 Excel .xlsx 文件——单元格操作、公式、图表、样式、合并单元格。

**推荐理由**:
- 虽然 QwenPaw 已有 OfficeCLI，但 Excel 是最常用的数据处理场景
- OfficeCLI 侧重文档格式转换，Excel MCP 侧重**编程式数据操作**
- openpyxl 已在 QwenPaw 的 Python 运行时中预装
- 4,000+ Stars，社区活跃

**集成方案**:
```
pip install excel-mcp-server  (安装到已内置的 Python 运行时)
MCP 配置: stdio, command=python, args=[-m, excel_mcp_server]
```

**体积**: ~5 MB (仅 Python 包，openpyxl 已预装)

---

#### 4. SymPy 符号数学 (`sympy-mcp`)

| 属性 | 值 |
|------|-----|
| GitHub | `sdiehl/sympy-mcp` |
| Stars | 79★ |
| 语言 | Python |
| 许可证 | Apache-2.0 |
| 体积 | ~30 MB (sympy 库) |
| 依赖 | sympy (Python) |

**能力**: 符号微分、积分、方程求解、矩阵运算、LaTeX 渲染、极限、级数展开。

**推荐理由**:
- NeqSim 专注**热力学/过程模拟**，SymPy 补充**纯数学计算**
- AI 常需要做精确的符号运算（而非数值近似）
- sympy 已在 QwenPaw 的 Python 运行时中预装
- Stars 虽不高，但 SymPy 本身极其成熟（45,000+ Stars）

**集成方案**:
```
pip install sympy-mcp  (安装到已内置的 Python 运行时)
MCP 配置: stdio, command=python, args=[-m, sympy_mcp]
```

**体积**: ~30 MB (sympy 已预装，MCP wrapper < 1 MB)

---

#### 5. arXiv 论文检索 (`arxiv-mcp-server`)

| 属性 | 值 |
|------|-----|
| GitHub | `blazickjp/arxiv-mcp-server` |
| Stars | 3,031★ |
| 语言 | Python |
| 许可证 | Apache-2.0 |
| 体积 | ~5 MB (Python 包) |
| 依赖 | arxiv API (无需 API Key) |

**能力**: 搜索 arXiv 论文、下载 PDF、提取摘要、按关键词/作者/时间过滤。

**推荐理由**:
- NeqSim 用户（工程师/科研人员）常需要查阅学术文献
- arXiv API 免费无需认证
- 3,000+ Stars，活跃维护
- 与 NeqSim 形成配套：**计算+文献**

**集成方案**:
```
pip install arxiv-mcp-server  (安装到已内置的 Python 运行时)
MCP 配置: stdio, command=python, args=[-m, arxiv_mcp_server]
```

**体积**: ~5 MB (仅 Python 包)

---

### ⚡ 中优先级

#### 6. Markdownify 万物转 Markdown (`markdownify-mcp`)

| 属性 | 值 |
|------|-----|
| GitHub | `zcaceres/markdownify-mcp` |
| Stars | 2,907★ |
| 语言 | TypeScript |
| 许可证 | MIT |
| 体积 | ~3 MB (Node.js 包) |
| 依赖 | Node.js (已内置) |

**能力**: 将 PDF、图片(OCR)、网页、Office 文档统一转换为 Markdown，供 AI 处理。

**推荐理由**:
- QwenPaw 的 web_search + office_tools 已有部分文档处理能力，但缺少**统一的 Markdown 转换入口**
- OCR 能力可补充截图/扫描件处理
- 2,900+ Stars，Node.js 实现

**集成方案**: `npx -y markdownify-mcp` (Node 已内置)

**体积**: ~3 MB

---

#### 7. Word 文档创建 (`Office-Word-MCP-Server`)

| 属性 | 值 |
|------|-----|
| GitHub | `GongRzhe/Office-Word-MCP-Server` |
| Stars | 2,116★ |
| 语言 | Python |
| 许可证 | MIT |
| 体积 | ~3 MB (python-docx) |
| 依赖 | python-docx (已预装) |

**能力**: 创建 Word 文档、设置段落/标题/表格/图片/页眉页脚/目录。

**推荐理由**:
- QwenPaw 已预装 python-docx
- 与 Excel MCP 配合，覆盖 Office 三件套中的两件
- OfficeCLI 侧重读取，此 MCP 侧重**创建**

**集成方案**: `pip install office-word-mcp-server`

**体积**: ~3 MB

---

#### 8. PowerPoint 演示文稿 (`Office-PowerPoint-MCP-Server`)

| 属性 | 值 |
|------|-----|
| GitHub | `GongRzhe/Office-PowerPoint-MCP-Server` |
| Stars | 1,850★ |
| 语言 | Python |
| 许可证 | MIT |
| 体积 | ~5 MB (python-pptx) |
| 依赖 | python-pptx (已预装) |

**能力**: 创建/编辑 PPT——幻灯片、文本框、图片、图表、表格、主题。

**推荐理由**:
- 补齐 Office 三件套（Word + Excel + PowerPoint）
- python-pptx 已在 QwenPaw Python 运行时中预装
- AI 可以自动生成技术报告演示文稿

**集成方案**: `pip install office-powerpoint-mcp-server`

**体积**: ~5 MB

---

#### 9. OpenCV 图像处理 (`opencv-mcp-server`)

| 属性 | 值 |
|------|-----|
| GitHub | `GongRzhe/opencv-mcp-server` |
| Stars | 112★ |
| 语言 | Python |
| 许可证 | MIT |
| 体积 | ~60 MB (opencv-python) |
| 依赖 | opencv-python, numpy |

**能力**: 图像滤镜、边缘检测、人脸检测、颜色空间转换、几何变换、模板匹配。

**推荐理由**:
- 图像处理是工程/科研常见需求
- opencv-python 是计算机视觉的事实标准
- numpy 已预装，仅需额外安装 opencv-python

**集成方案**: `pip install opencv-mcp-server`

**体积**: ~60 MB

---

#### 10. FFmpeg 音视频处理 (`video-audio-mcp`)

| 属性 | 值 |
|------|-----|
| GitHub | `misbahsy/video-audio-mcp` |
| Stars | 83★ |
| 语言 | Python |
| 许可证 | MIT |
| 体积 | ~80 MB (ffmpeg 二进制) |
| 依赖 | ffmpeg 系统二进制 |

**能力**: 视频转码、音频提取、剪辑、缩略图生成、格式转换。

**推荐理由**:
- QwenPaw 已有 `view_media.py` 查看媒体，但**缺少编辑能力**
- FFmpeg 是音视频处理的事实标准
- 可与浏览器截图、桌面录屏配合

**集成方案**: 下载 ffmpeg 静态二进制 + `pip install video-audio-mcp`

**体积**: ~80 MB (ffmpeg) + ~2 MB (Python)

---

#### 11. UML/架构图生成 (`uml-mcp`)

| 属性 | 值 |
|------|-----|
| GitHub | `antoinebou12/uml-mcp` |
| Stars | 92★ |
| 语言 | TypeScript |
| 许可证 | MIT |
| 体积 | ~5 MB (Node.js 包) |
| 依赖 | Node.js (已内置) |

**能力**: 生成 UML 类图、时序图、用例图、组件图等，输出为 PlantUML/Mermaid 代码或 PNG 图片。

**推荐理由**:
- 工程师常用 UML 图表达设计
- AI 可以根据代码自动生成架构图
- Node.js 实现，利用已内置运行时

**集成方案**: `npx -y uml-mcp`

**体积**: ~5 MB

---

#### 12. 翻译服务 (`deepl-mcp-server`)

| 属性 | 值 |
|------|-----|
| GitHub | `DeepL/deepl-mcp-server` |
| Stars | 110★ |
| 语言 | Python |
| 许可证 | MIT |
| 体积 | ~2 MB |
| 依赖 | DeepL API Key (用户提供) |

**能力**: 高质量机器翻译，支持 30+ 语言。

**推荐理由**:
- QwenPaw 国际化用户需要翻译
- DeepL 翻译质量远超 Google Translate
- 官方维护，质量有保障

**注意**: 需要 DeepL API Key，非完全自包含。可设计为**可选内置**，用户配置 Key 后启用。

**集成方案**: `pip install deepl-mcp-server`

**体积**: ~2 MB

---

### 💡 低优先级（按需扩展）

#### 13. FreeCAD CAD 建模 (`freecad-mcp`)

| 属性 | 值 |
|------|-----|
| GitHub | `neka-nat/freecad-mcp` |
| Stars | 1,708★ |
| 语言 | Python |
| 许可证 | MIT |
| 体积 | ~500 MB (FreeCAD 安装) |
| 依赖 | FreeCAD 安装 |

**能力**: 参数化 3D CAD 建模——零件设计、装配、工程图。

**推荐理由**: 与 NeqSim 配合可覆盖完整工程设计流程。

**不推荐内置的理由**: FreeCAD 太大（500 MB+），不适合内置打包。建议作为**检测型内置**——检测用户是否安装了 FreeCAD，若有则自动注册 MCP。

---

#### 14. KiCAD PCB 设计 (`KiCAD-MCP-Server`)

| 属性 | 值 |
|------|-----|
| GitHub | `mixelpixx/KiCAD-MCP-Server` |
| Stars | 1,797★ |
| 语言 | Python |
| 许可证 | MIT |
| 体积 | N/A (依赖 KiCAD 安装) |

**能力**: PCB 原理图设计、布线、Gerber 输出、器件选型。

**推荐理由**: 电子工程领域需求，与 NeqSim 化工领域互补。

**注意**: 同样依赖外部 KiCAD 安装，适合**检测型内置**。

---

#### 15. 安全测试 (`pentest-ai`)

| 属性 | 值 |
|------|-----|
| GitHub | `0xSteph/pentest-ai` |
| Stars | 1,559★ |
| 语言 | Python |
| 许可证 | MIT |
| 体积 | ~5 MB (Python) + nmap/工具链 |

**能力**: 205+ 渗透测试工具（nmap、nuclei、sqlmap 等），漏洞扫描、exploit 链。

**推荐理由**: 安全工程师/红队场景。

**注意**: 工具链依赖较多（nmap、nuclei 等），适合**可选插件**而非默认内置。

---

#### 16. Blender 3D 创作 (`blender-ai-mcp`)

| 属性 | 值 |
|------|-----|
| GitHub | `PatrykIti/blender-ai-mcp` |
| Stars | 52★ |
| 语言 | Python |
| 许可证 | 未标注 |
| 体积 | ~300 MB (Blender 安装) |

**能力**: 3D 建模、动画、渲染、材质。

**注意**: 依赖 Blender 安装，体积大。

---

#### 17. Playwright 浏览器自动化 (`mcp-playwright`)

| 属性 | 值 |
|------|-----|
| GitHub | `executeautomation/mcp-playwright` |
| Stars | 5,630★ |
| 语言 | TypeScript |
| 许可证 | MIT |
| 体积 | ~200 MB (Playwright + 浏览器) |

**能力**: 浏览器自动化——页面截图、表单填写、元素提取、API 测试。

**注意**: QwenPaw 已有 Chrome Control Link 浏览器能力，功能重叠。但 Playwright 支持**多浏览器**(Chromium/Firefox/WebKit)，且 API 更丰富。**可选补充**。

---

## 三、推荐集成路线图

### Phase 1: 纯 Python 包（零额外二进制，利用已内置 Python 运行时）

| 能力 | 包名 | 增量体积 | 工作量 |
|------|------|---------|--------|
| Excel 操作 | `excel-mcp-server` | ~5 MB | 1天 |
| Word 创建 | `office-word-mcp-server` | ~3 MB | 1天 |
| PowerPoint 创建 | `office-powerpoint-mcp-server` | ~5 MB | 1天 |
| 符号数学 | `sympy-mcp` | ~30 MB | 1天 |
| arXiv 论文 | `arxiv-mcp-server` | ~5 MB | 1天 |
| **小计** | | **~48 MB** | **~5天** |

### Phase 2: 利用已内置 Node.js 运行时

| 能力 | 包名 | 增量体积 | 工作量 |
|------|------|---------|--------|
| 数据库查询 | `@bytebase/dbhub` | ~20 MB | 1天 |
| 万物转 Markdown | `markdownify-mcp` | ~3 MB | 1天 |
| UML 图表 | `uml-mcp` | ~5 MB | 1天 |
| **小计** | | **~28 MB** | **~3天** |

### Phase 3: 需要额外二进制

| 能力 | 二进制 | 增量体积 | 工作量 |
|------|--------|---------|--------|
| Pandoc 文档转换 | pandoc 静态二进制 | ~150 MB | 2天 |
| FFmpeg 音视频 | ffmpeg 静态二进制 | ~80 MB | 2天 |
| OpenCV 图像 | opencv-python | ~60 MB | 1天 |
| **小计** | | **~290 MB** | **~5天** |

### Phase 4: 检测型内置（不打包，检测系统安装后自动注册）

| 能力 | 检测目标 | 工作量 |
|------|---------|--------|
| FreeCAD CAD | `freecad` 可执行文件 | 1天 |
| KiCAD PCB | `kicad-cli` 可执行文件 | 1天 |
| Playwright 浏览器 | `npx playwright` | 1天 |
| **小计** | | **~3天** |

### 可选（需 API Key）

| 能力 | 包名 | 备注 |
|------|------|------|
| DeepL 翻译 | `deepl-mcp-server` | 用户配置 Key 后启用 |
| 天气查询 | `open-meteo-mcp-server` | 免费 API，无需 Key |

---

## 四、总量估算

| Phase | 能力数 | 增量体积 | 累计体积 |
|-------|--------|---------|---------|
| Phase 1 (Python) | 5 | ~48 MB | 48 MB |
| Phase 2 (Node) | 3 | ~28 MB | 76 MB |
| Phase 3 (二进制) | 3 | ~290 MB | 366 MB |
| Phase 4 (检测型) | 3 | ~0 MB | 366 MB |
| NeqSim (已实现) | 1 | ~130 MB | 496 MB |

> Phase 1 + 2 合计仅增加 ~76 MB，即可获得 8 项内置能力，性价比极高。

---

## 五、技术实现模式

所有内置 MCP 能力统一遵循以下模式（与 NeqSim 集成一致）：

```
scripts/pack-tauri/stage_<name>.py     ← 构建时下载/安装
src/qwenpaw/agents/builtin_mcp/<name>.py ← 运行时自动注册
scripts/pack-tauri/build_pyinstaller.sh  ← 集成 staging 步骤
scripts/pack-tauri/build_pyinstaller.ps1 ← Windows 集成
console/src-tauri/tauri.conf.json       ← 声明资源 (如有二进制)
```

### Python 类 MCP（最简单）

```python
# builtin_mcp/excel.py
NEQSIM_CLIENT_KEY = "excel"
def _build_endpoint():
    return {
        "transport": "stdio",
        "command": python_exe,  # 已内置的 Python 运行时
        "args": ["-m", "excel_mcp_server"],
        "env": {},
    }
```

无需下载额外二进制，`pip install` 到已内置 Python 运行时即可。

### Node.js 类 MCP

```python
def _build_endpoint():
    return {
        "transport": "stdio",
        "command": node_exe,  # 已内置的 Node.js 运行时
        "args": ["-y", "@bytebase/dbhub"],
        "env": {},
    }
```

利用已内置 Node.js，`npx -y` 自动下载包。

### 二进制类 MCP（需 staging）

```python
def _build_endpoint():
    return {
        "transport": "stdio",
        "command": pandoc_exe,  # 从 QWENPAW_DESKTOP_PANDOC 环境变量获取
        "args": [...],
        "env": {},
    }
```

需创建 `stage_pandoc.py` 下载跨平台预编译二进制。

---

## 六、与现有架构的兼容性

| 检查项 | 状态 |
|--------|------|
| MCP 客户端协议 | ✅ 已支持 stdio + streamable_http + SSE |
| Driver 自动注册 | ✅ `ensure_neqsim_driver_registered` 模式可复用 |
| PyInstaller 打包 | ✅ `collect_submodules` 已配置 |
| Tauri 资源打包 | ✅ `bundle.resources` 已配置 |
| 跨平台路径 | ✅ Rust launcher 统一解析 |
| 用户可禁用 | ✅ DriverCard.enabled 字段 |
| 幂等注册 | ✅ marker 文件模式 |
| 异常隔离 | ✅ try/except 不影响启动 |

---

## 七、总结

| 优先级 | 推荐能力 | 核心价值 |
|--------|---------|---------|
| 🔥 | Excel MCP | 数据处理 |
| 🔥 | Word MCP | 文档创建 |
| 🔥 | PowerPoint MCP | 演示文稿 |
| 🔥 | SymPy MCP | 精确数学计算 |
| 🔥 | arXiv MCP | 学术文献检索 |
| 🔥 | SQLite/DBHub | 数据库查询 |
| ⚡ | Pandoc MCP | 文档格式转换 |
| ⚡ | Markdownify | 统一 Markdown 转换 |
| ⚡ | FFmpeg MCP | 音视频编辑 |
| ⚡ | OpenCV MCP | 图像处理 |
| ⚡ | UML MCP | 架构图生成 |
| 💡 | DeepL MCP | 翻译 |
| 💡 | FreeCAD MCP | 3D CAD (检测型) |
| 💡 | KiCAD MCP | PCB 设计 (检测型) |

**Phase 1 (Python MCP) 是最高性价比的起点**——5 项能力仅增加 ~48 MB，无需额外运行时或二进制。
