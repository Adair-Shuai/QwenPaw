# 后端开发指南

## 概述

UGSci 后端按入口、引擎和专家团三个边界组织：

| 文件 | 职责 |
|------|------|
| `plugin.py` | 插件入口：生命周期钩子注册、技能池同步、HTTP 路由注册 |
| `engine/` | 本地仿真软件检测、配置管理和运行工具 |
| `team/` | OMP 专家团状态机、状态 API、角色和预设团队 |

后端通过 QwenPaw 的 PluginApi 注册自身能力，HTTP 路由由引擎和
专家团模块分别提供。

## 插件入口

### UGSciPlugin 类

```python
class UGSciPlugin:
    """UGSci plugin backend entry point."""

    def register(self, api) -> None:
        # 注册三个钩子 + 一个 HTTP 路由
        ...
```

模块底部需要暴露 `plugin` 对象：

```python
# Module-level plugin object — required by the QwenPaw plugin loader.
plugin = UGSciPlugin()
```

### register() 方法

`register()` 在插件加载时被调用，通过 PluginApi 注册以下内容：

| 注册项 | 钩子名 | 优先级 | 说明 |
|--------|--------|--------|------|
| `register_startup_hook` | `ugsci_sync_skills_to_pool` | 80 | 同步技能到技能池 |
| `register_startup_hook` | `ugsci_init` | 50 | 初始化日志 |
| `register_uninstall_hook` | `ugsci_remove_pool_skills` | — | 卸载时清理技能 |
| `register_http_router` | — | — | 注册软件检测路由 |

所有注册都包裹在 `try/except` 中，即使某个注册失败也不影响其他功能。

## 技能池同步

### 同步流程

```
_on_startup_sync_skills()
    │
    ├── 检查 skills/ 目录是否存在
    │
    └── _sync_plugin_skills_to_pool(plugin_id, skills_dir)
          │
          ├── ensure_skill_pool_initialized()
          │   └── 确保技能池已初始化
          │
          ├── 扫描 skills/ 目录下所有含 SKILL.md 的子目录
          │
          └── for each skill:
                ├── safe_skill_dir(pool_dir, skill_name)  # 防路径穿越
                ├── 如果已存在则先删除 (rmtree)
                ├── copy_skill_dir(src, dst)               # 复制技能文件
                │
                └── mutate_json(manifest_path, default, update_fn)
                      └── _register_pool_skill_entry(
                            payload, name, dir,
                            source="customized",
                            installed_from="plugin:ugsci"
                          )
                │
          └── reconcile_pool_manifest()  # 最终一致性检查
```

### 关键设计

**`installed_from` 标记**：每个同步的技能在 manifest 中标记 `installed_from: "plugin:ugsci"`，用于卸载时精确识别和清理。

**源码为 `customized`**：技能的 `source` 设为 `"customized"`，表示是用户可编辑的自定义技能，而非只读的系统技能。

**绝对导入**：插件被加载为顶层模块（`plugin_ugsci`），因此所有 import 使用绝对路径：

```python
from qwenpaw.agents.skill_system.store import copy_skill_dir, get_skill_pool_dir
```

### 卸载清理

```python
def _remove_plugin_pool_skills(plugin_id: str) -> int:
    source_tag = f"plugin:{plugin_id}"
    manifest = read_skill_pool_manifest()
    to_remove = [
        name for name, entry in manifest.get("skills", {}).items()
        if entry.get("installed_from") == source_tag
    ]
    # 从 manifest 移除 + 删除技能目录 + reconcile
```

卸载时只移除 `installed_from` 匹配的技能，不影响用户手动安装的其他技能。

## HTTP API 详解

### 路由注册

```python
api.register_http_router(
    _build_software_router(),
    prefix="/ugsci/software",
    tags=["ugsci-software"],
)
```

注册后所有端点路径为 `/api/ugsci/software/*`。

### 端点详情

#### GET /detect

触发一次完整的软件检测扫描并返回结果。

```python
@router.get("/detect")
async def detect_software_endpoint() -> Dict[str, Any]:
    custom_paths = _cached_result.get("custom_paths", [])
    result = detect_software(custom_paths=custom_paths)
    data = to_dict(result)
    _cached_result["data"] = data  # 更新缓存
    return data
```

**响应示例**：

```json
{
  "platform": "Windows",
  "software_list": [
    {
      "id": "cmg_imex",
      "name": "CMG IMEX",
      "category": "reservoir_simulation",
      "vendor": "CMG",
      "version": "2024.1",
      "executable_path": "C:\\Program Files\\CMG\\bin\\imex.exe",
      "install_dir": "C:\\Program Files\\CMG",
      "status": "found",
      "description": "CMG IMEX — black oil reservoir simulator",
      "invocation_hint": "IMEX is a black-oil simulator. Run: <imex_path> -f <model.dat> -o <output.out>",
      "extra_paths": []
    }
  ],
  "custom_scan_paths": [],
  "summary": "Found 1/12 software | reservoir_simulation: CMG IMEX"
}
```

#### GET /list

返回缓存的检测结果。如果从未扫描过，自动触发首次扫描。

#### POST /scan-path

添加自定义扫描目录并重新扫描。

**请求体**：

```json
{
  "paths": ["D:\\Software\\CMG", "E:\\Tools\\Schlumberger"]
}
```

自定义路径会追加到 `_cached_result["custom_paths"]`，后续所有扫描都会包含这些路径。

#### GET /summary

返回简洁的 Markdown 文本摘要，用于 Agent 系统提示词注入：

```markdown
## Local Software Detected (Windows)

The following oil & gas simulation software is installed on this host:

### CMG IMEX (CMG)
- **Version**: 2024.1
- **Path**: `C:\Program Files\CMG\bin\imex.exe`
- **Category**: reservoir_simulation
- **Usage**: IMEX is a black-oil simulator. Run: <imex_path> -f <model.dat> -o <output.out>

Use the paths above to invoke the software from scripts or commands.
Always verify the executable path before running.
```

#### GET /known

返回已知软件目录（静态数据），供 UI 展示软件卡片网格。

### 进程内缓存

```python
_cached_result: Dict[str, Any] = {"data": None}
```

缓存策略：

- `detect` — 强制重新扫描，更新缓存
- `list` — 返回缓存，无缓存则自动扫描
- `scan-path` — 添加路径后重新扫描，更新缓存
- `summary` — 基于缓存数据生成摘要

> **注意**：缓存是进程级的，QwenPaw 重启后缓存失效。不支持多进程/多 worker 场景下的缓存共享。

## 软件检测引擎

详细文档请参阅 [软件检测](./software-detection.md)。

## 扩展指南

### 添加新的 HTTP 端点

1. 在 `_build_software_router()` 内部添加新的路由函数
2. 使用 `from .software_detector import xxx` 导入需要的函数
3. 路由会自动挂载到 `/api/ugsci/software/*` 前缀下

### 添加新的启动钩子

```python
def register(self, api) -> None:
    try:
        api.register_startup_hook(
            hook_name="ugsci_my_hook",
            callback=self._my_startup_hook,
            priority=60,
        )
    except Exception:
        pass

async def _my_startup_hook(self) -> None:
    """启动时执行的逻辑。"""
    # 例如：初始化数据、连接外部服务等
    pass
```

### 添加新的卸载钩子

```python
def register(self, api) -> None:
    try:
        api.register_uninstall_hook(
            hook_name="ugsci_my_cleanup",
            callback=self._my_cleanup,
        )
    except Exception:
        pass

@staticmethod
def _my_cleanup(plugin_id: str, delete_files: bool = False) -> None:
    """卸载时执行的清理逻辑。"""
    pass
```

## 日志

所有日志使用统一的 logger：

```python
logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci")
# 子模块：
logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.detector")
```

日志级别：

- `INFO` — 正常操作（注册成功、同步完成）
- `WARNING` — 检测中的错误（单个软件检测失败）
- `ERROR` — 注册失败、同步失败等严重问题
