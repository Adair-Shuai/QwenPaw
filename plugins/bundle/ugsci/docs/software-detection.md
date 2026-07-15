# 本地软件检测

## 概述

UGSci 内置本地油气仿真软件检测引擎（`software_detector.py`），扫描主机系统已安装的石油工程软件，报告可执行路径、版本和调用提示，并生成可注入 Agent 系统提示词的能力摘要。

## 设计原则

1. **非侵入式** — 只读取文件系统，从不启动软件
2. **跨平台** — 检查 Windows、Linux 和 macOS 标准安装路径
3. **可扩展** — `KNOWN_SOFTWARE` 是普通列表，自由添加条目
4. **带缓存** — 结果在进程内缓存，可按需刷新

## 已知软件目录

插件内置 12 款石油工程软件的检测规则：

### 油藏数值模拟

| 软件 | ID | 厂商 | 可执行文件模式 |
|------|----|------|---------------|
| CMG Builder | `cmg_builder` | CMG | `builder.exe`, `builder` |
| CMG IMEX | `cmg_imex` | CMG | `imex.exe`, `mx2100.exe`, `mx2300.exe` |
| CMG GEM | `cmg_gem` | CMG | `gem.exe`, `gm2100.exe`, `gm2300.exe` |
| CMG STARS | `cmg_stars` | CMG | `stars.exe`, `st2100.exe`, `st2300.exe` |
| Eclipse | `eclipse` | Schlumberger | `eclipse.exe`, `e100.exe`, `e300.exe` |
| Intersect | `intersect` | Schlumberger | `intersect.exe` |
| tNavigator | `tnavigator` | Rock Flow Technologies | `tnav.exe`, `tnavigator.exe` |

### 地质建模

| 软件 | ID | 厂商 | 可执行文件模式 |
|------|----|------|---------------|
| Petrel | `petrel` | Schlumberger | `petrel.exe` |

### 测井分析

| 软件 | ID | 厂商 | 可执行文件模式 |
|------|----|------|---------------|
| Techlog | `techlog` | Schlumberger | `techlog.exe` |

### 采油工程

| 软件 | ID | 厂商 | 可执行文件模式 |
|------|----|------|---------------|
| PIPESIM | `pipesim` | Schlumberger | `pipesim.exe` |
| OFM | `ofm` | Schlumberger | `ofm.exe` |

### 后处理与可视化

| 软件 | ID | 厂商 | 可执行文件模式 |
|------|----|------|---------------|
| CMG Results | `cmg_results` | CMG | `results.exe` |

## 检测流程

```
detect_software(custom_paths)
    │
    ├── 获取平台 → platform.system()
    │
    ├── _get_default_search_dirs()
    │   ├── Windows: Program Files, C:\CMG, C:\Schlumberger, D:\... 等
    │   ├── Linux: /opt, /usr/local, ~/CMG, ~/Schlumberger 等
    │   └── macOS: /Applications, ~/Applications, /opt/CMG 等
    │
    ├── 合并自定义路径，去重
    │
    └── for each sw_def in KNOWN_SOFTWARE:
          ├── _find_executable(patterns, search_dirs, subdirs)
          │   ├── 在每个搜索目录下匹配文件名（大小写不敏感）
          │   ├── 在 bin/exe 子目录下查找
          │   └── 递归搜索子目录（最大深度 2）
          │
          ├── 如果找到可执行文件:
          │   ├── 设置 executable_path
          │   ├── _get_install_dir() — 推断安装目录
          │   ├── _extract_version() — 执行 <exe> --version 提取版本
          │   │   └── 失败则 _guess_version_from_path() — 从路径推断
          │   └── status = "found"
          │
          └── 如果未找到:
                └── status = "not_found"
    │
    └── 构建 summary 文本
    └── 返回 DetectionResult
```

### 版本提取策略

版本信息按以下优先级获取：

1. **执行 `--version` 参数** — 调用 `<exe> --version`，用正则匹配版本号
   - 匹配模式：`x.y.z`、`YYYY.x`、`x.y`、`version: x.y`、`vx.y`
   - 超时 10 秒
2. **从路径推断** — 搜索路径中的 `2024.1`、`v2024`、`2024R1` 等模式
3. **无版本** — 留空

### 安装目录推断

```python
def _get_install_dir(executable: Path) -> str:
    parent = executable.parent
    # 如果父目录是 bin 或 exe，再上一级
    if parent.name.lower() in ("bin", "exe"):
        return str(parent.parent)
    return str(parent)
```

## 数据模型

### SoftwareInfo

```python
@dataclass
class SoftwareInfo:
    id: str                           # 软件唯一标识
    name: str                         # 显示名称
    category: str                     # 类别
    vendor: str                       # 厂商
    version: Optional[str] = None     # 版本号
    executable_path: Optional[str] = None   # 可执行文件路径
    install_dir: Optional[str] = None     # 安装目录
    license_server: Optional[str] = None  # 许可证服务器（未使用）
    status: str = "not_found"         # found | not_found | error
    description: str = ""             # 描述
    invocation_hint: str = ""         # 调用提示
    extra_paths: List[str] = field(default_factory=list)
```

### DetectionResult

```python
@dataclass
class DetectionResult:
    platform: str                     # 操作系统
    software_list: List[SoftwareInfo] # 所有软件检测结果
    custom_scan_paths: List[str]      # 用户自定义扫描路径
    summary: str = ""                 # 摘要文本
```

## 平台搜索路径

### Windows

```
C:\Program Files
C:\Program Files (x86)
C:\Program Files\CMG
C:\Program Files\Schlumberger
C:\Program Files (x86)\Schlumberger
C:\Program Files\Rock Flow Technologies
C:\CMG
C:\Schlumberger
D:\CMG
D:\Schlumberger
D:\Program Files\CMG
D:\Program Files\Schlumberger
%LOCALAPPDATA%\Programs
```

### Linux

```
/opt
/opt/CMG
/opt/Schlumberger
/opt/Rock Flow Technologies
/usr/local
~/CMG
~/Schlumberger
```

### macOS

```
/Applications
~/Applications
/opt/CMG
/opt/Schlumberger
```

> 所有路径在检测前会过滤掉不存在的目录。

## 能力摘要

`build_capability_summary()` 生成 Markdown 格式的摘要，用于注入 Agent 系统提示词：

```markdown
## Local Software Detected (Windows)

The following oil & gas simulation software is installed on this host:

### CMG IMEX (CMG)
- **Version**: 2024.1
- **Path**: `C:\Program Files\CMG\bin\imex.exe`
- **Category**: reservoir_simulation
- **Usage**: IMEX is a black-oil simulator. Run: <imex_path> -f <model.dat> -o <output.out>

### Eclipse (Schlumberger)
- **Version**: 2024.1
- **Path**: `C:\Program Files\Schlumberger\eclipse\2024.1\bin\eclipse.exe`
- **Category**: reservoir_simulation
- **Usage**: Eclipse is a finite-difference reservoir simulator. Run: <eclipse_path> <model.DATA>

Use the paths above to invoke the software from scripts or commands.
Always verify the executable path before running.
```

## 扩展：添加新软件

在 `KNOWN_SOFTWARE` 列表中添加新条目：

```python
KNOWN_SOFTWARE: List[Dict] = [
    # ... existing entries ...

    {
        "id": "compass",
        "name": "Compass",
        "category": "well_log_analysis",
        "vendor": "Schlumberger",
        "description": "Schlumberger Compass — well path planning and surveying",
        "patterns": ["compass.exe", "compass"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "Compass is used for well path planning. "
        "Run: <compass_path> <project.compass>",
    },
]
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 唯一标识 |
| `name` | 是 | 显示名称 |
| `category` | 是 | 类别（用于 UI 分组） |
| `vendor` | 是 | 厂商名称 |
| `description` | 否 | 描述文本 |
| `patterns` | 是 | 可执行文件名列表（大小写不敏感匹配） |
| `subdirs` | 否 | 在搜索目录下查找的子目录列表（如 `bin`、`exe`） |
| `version_args` | 否 | 获取版本的 CLI 参数列表 |
| `invocation_hint` | 否 | Agent 调用该软件的提示文本 |

### UI 类别映射

前端 `CATEGORY_LABELS` 和 `CATEGORY_ICONS` 定义了类别的中文标签和图标：

```typescript
const CATEGORY_LABELS: Record<string, string> = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
};

const CATEGORY_ICONS: Record<string, string> = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
};
```

添加新类别时，需同时更新这两个映射。
