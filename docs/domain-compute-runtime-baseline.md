# 领域计算运行环境基线

> 状态：已完成初始基线
> 更新日期：2026-08-09
> 对应文档：`plugins/bundle/ugsci/docs/domain-compute-engine-implementation-plan.md` G0

## 1. 目的

记录 UGSci 领域计算依赖在开发环境和桌面打包后端中的实际可用性。
本文档是 G0 任务的交付物，为后续平台验证提供基线参考。

## 2. 依赖清单

| 依赖 | 用途 | 必需性 | 探测方式 |
| --- | --- | --- | --- |
| lasio | LAS 2.0 文件读取与导出 | 测井引擎必需 | `importlib.util.find_spec("lasio")` |
| numpy | 数值计算基础 | 递减引擎必需 | `importlib.util.find_spec("numpy")` |
| scipy | 曲线拟合 (curve_fit) | 递减引擎必需 | `importlib.util.find_spec("scipy")` |
| welly | 高级测井对象模型（后续可选） | 可选，MVP 不使用 | `importlib.util.find_spec("welly")` |
| java-runtime | NeqSim JRE | NeqSim 必需 | `shutil.which("java")` + `JAVA_HOME` |
| neqsim-mcp-server | NeqSim MCP 服务 | NeqSim 必需 | 环境变量 `NEQSIM_HOME` / `NEQSIM_JAR` |

## 3. 开发环境验证

### 3.1 macOS (开发机)

- **Python**: 3.11.15 (`.venv/bin/python`)
- **lasio**: 已安装
- **numpy**: 已安装
- **scipy**: 已安装（`scipy.optimize.curve_fit` 可用）
- **welly**: 未安装（MVP 不需要）
- **java-runtime**: 通过 Homebrew 安装
- **neqsim-mcp-server**: 通过 QwenPaw Driver 配置

验证命令：

```bash
# Python 包
python -c "import importlib.util; print(importlib.util.find_spec('lasio'))"
python -c "import importlib.util; print(importlib.util.find_spec('numpy'))"
python -c "import importlib.util; print(importlib.util.find_spec('scipy'))"

# Java
java -version

# NeqSim (通过 QwenPaw Driver 管理)
# 不在 UGSci 插件中直接探测 JAR 路径
```

### 3.2 Windows (打包目标)

- **Python**: 随 Tauri 打包的嵌入式 Python
- **lasio**: 需在打包脚本中包含
- **numpy**: 需在打包脚本中包含
- **scipy**: 需在打包脚本中包含
- **java-runtime**: 用户自行安装或随 NeqSim Driver 配置

## 4. 插件工具运行进程

UGSci 领域工具（`ugsci_welllog_*`, `ugsci_decline_*`）在 QwenPaw 主后端进程中执行。
工具模块顶层不 import lasio/numpy/scipy，延迟到函数体内部 import。
缺少可选依赖时插件仍可完成注册，调用时返回 `dependency_unavailable` 错误。

## 5. 依赖探测实现

探测逻辑位于 `plugins/bundle/ugsci/domain_engine/dependency_probe.py`：

- Python 包：`importlib.util.find_spec()` — 不实际 import 模块
- Java 运行时：`shutil.which("java")` + `JAVA_HOME` 回退
  - Windows 上 `shutil.which` 自动查找 `java.exe`
  - `JAVA_HOME` 回退显式检查 `java.exe` (Windows) 或 `java` (POSIX)
- NeqSim MCP Server：检查环境变量 `NEQSIM_HOME` 和 `NEQSIM_JAR`
  - 未检测到环境变量时返回 `unknown`（不阻断，因为 MCP Driver 可能另行配置）

## 6. 缺失依赖时的行为

| 场景 | 行为 |
| --- | --- |
| lasio 未安装 | 测井工具返回 `dependency_unavailable`；递减工具正常 |
| numpy/scipy 未安装 | 递减工具返回 `dependency_unavailable`；测井工具正常 |
| Java 未安装 | NeqSim 引擎显示 `unavailable`；测井和递减正常 |
| 所有依赖缺失 | UGSci 插件仍可加载；Catalog API 返回三个引擎定义，依赖状态为 `unavailable` |

## 7. 后续验证计划

1. 在 Windows 打包环境中验证 `find_spec` 结果
2. 确认 Tauri 打包脚本包含 lasio/numpy/scipy
3. 在实际桌面应用中验证依赖探测 API 返回正确状态
4. 如果某平台依赖不可用，将对应 Provider 标为 `unavailable`，不通过运行时 pip 安装规避

## 8. 版本记录

| 依赖 | 已验证版本 | 平台 |
| --- | --- | --- |
| lasio | 0.30+ | macOS |
| numpy | 1.26+ | macOS |
| scipy | 1.12+ | macOS |
| Python | 3.11.15 | macOS |

> Windows 版本号待打包验证后补充。
