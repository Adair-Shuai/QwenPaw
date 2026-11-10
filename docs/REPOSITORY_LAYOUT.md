# 开发仓库目录与整理约定

本仓库包含 QwenPaw 核心、UGSci 自有插件、桌面端和本地验证资料。
日常开发从源码目录进入；交付证据和临时运行环境分开存放。

## 源码与开发入口

| 目录／文件 | 用途 |
| --- | --- |
| `src/qwenpaw/` | Python 服务端、运行时、Agent 和 API |
| `console/src/` | 控制台前端 |
| `console/src-tauri/src/` | Rust 桌面宿主 |
| `plugins/` | 插件源码，包括 UGSci、应用、频道和工具 |
| `packages/` | 共享 SDK 与工作区包 |
| `tests/`、`plugins/apps/document-forms/tests/` | 后端及应用回归测试 |
| `console/scripts/verify-fork-features.mjs` | 自有前端功能回归清单与执行入口 |
| `scripts/` | 构建、校验、发布及开发工具；见 [脚本说明](../scripts/README.md) |
| `scripts/pack-tauri/` | 桌面运行时准备、组件打包、Windows 安装器 |
| `scripts/archive/` | 已完成用途的一次性工具；仅供历史追查 |
| `deploy/` | 容器和部署配置 |
| `website/` | 网站及用户文档 |
| `docs/` | 架构、开发约定、兼容性与回归说明 |
| `.github/` | CI 与发布工作流 |

`plugins/` 中的源码及 `src/qwenpaw/plugins_bundle/` 中的内置副本有同步要求，
不能按“重复目录”直接删除。改动时遵守 [AGENTS.md](../AGENTS.md) 和对应同步流程。

## 本地环境与生成目录

| 路径 | 处理约定 |
| --- | --- |
| `.venv/`、各级 `node_modules/`、`.pnpm-store/` | 开发依赖，运行服务或测试时保留 |
| `console/src-tauri/binaries/` | 打包准备的运行时与组件缓存；不等同于可随意删除的临时目录 |
| `console/src-tauri/target/` | Rust 编译缓存和桌面交付包；`release/bundle/` 可能含唯一留存的安装包 |
| `build/`、`dist/`、`console/dist/` | 构建生成物；确认可重建且没有验证任务使用后再清理 |
| `.codex-tmp/`、`console/.codex-tmp/` | 临时诊断、验证脚本及隔离运行环境；不提交 |
| `.pytest_cache/`、`.mypy_cache/`、`.ruff_cache/` | 工具缓存；对应工具退出后可再生成 |
| `.tmp_*/`、`.tmp-*/`、`tmp/` | 历史临时目录；逐项确认用途，不按名字批量删除 |
| `deliverables/` | 验证报告、截图、日志、交付资料；见 [交付索引](../deliverables/README.md) |

`COMSOL_Multiphysics_MCP/`、`eclipse_test/` 等本地专业工具和算例目录保留原位，
整理时不能把算例输入、结果或外部工具当成普通缓存。

以下内容不属于常规仓库清理范围：模型权重、本地数据集、密钥、用户运行数据、
未提交的源码与测试、仍在使用的隔离环境。
尤其保留 `plugins/bundle/ugsci/visualization/data/` 的本地源数据；它必须继续被发布产物排除。
用户运行数据通常位于仓库外的 `~/.qwenpaw/` 和 `~/.qwenpaw.secret/`。

## 新增资料放在哪里

1. 正式功能放入现有源码模块；可复用开发工具放入 `scripts/`，并更新脚本说明。
2. 一次性验证使用 `.codex-tmp/<任务>/`；避免在仓库根目录创建日志、截图或补丁脚本。
3. 需要留存的结果放入 `deliverables/<任务>-YYYY-MM-DD/`，附一份 `REPORT.md`，说明结论、验证范围和未完成部分。
4. 历史散落资料归入 `deliverables/archive/<整理日期>/`，保留原路径、新路径和 SHA-256 清单。归档默认仅留本地；需要共享时单独检查内容。
5. 现有按任务组织的交付目录继续保留路径，避免使报告证据链接失效。新增重要报告同步加入交付索引。

## 清理与检查

清理前检查 `git status --short` 和正在运行的构建、测试、开发服务。
只删除确认可再生成的产物；不使用 `git clean -fdx` 或整目录重置处理混有本地数据的工作区。
Windows 下先解析目标绝对路径，确认位于仓库内且不经过链接或 junction，再执行操作。

归档后按清单核对内容哈希，并确认所有原有源码改动仍然存在。
移动资料时检查已有文档引用，归档清单用于查找旧路径；不要把历史记录内的命令或结果改写成新的验证结果。

功能改动继续遵守 [自有功能回归规则](FORK_FEATURE_REGRESSION.md)。
安装器、更新器、打包或发布逻辑改动继续遵守 [更新兼容性门禁](UPDATE_COMPATIBILITY_GUARD.md)，
运行 `python scripts/verify_update_regressions.py`。目录说明和历史资料归档不能替代这些验证。
