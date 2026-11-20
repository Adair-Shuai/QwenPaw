# 本项目功能保留规则

本仓库是带有 UGSci 自有功能的上游分支。上游合并不能只以编译通过或组件文件仍存在作为功能保留的证据。

- 进行上游合并、聊天 SDK 升级或聊天／扩展页面重构时，先阅读 `docs/FORK_FEATURE_REGRESSION.md`，对照历史实现保留自有行为。
- 合并前后运行 `cd console && npm run test:fork-features` 和类型检查；改动服务端指派、组件更新等逻辑时，同时运行对应后端回归。
- 上游合并及自有功能重构同时运行 `python scripts/verify_fork_regressions.py`。保留 `scripts/fork_backend_suites.json` 的后端清单、关键用例与 CI 门禁；不得把测试改为注释、空函数、跳过或从执行清单移除。文书填报应用测试位于 `plugins/apps/document-forms/tests`，不能仅运行 `tests/unit` 便视为已覆盖。
- 保留 `console/scripts/verify-fork-features.mjs` 的测试清单以及 CI 中的清单检查步骤。新增自有功能时补充行为测试和清单；不得通过删除、跳过或仅模拟被保护的功能来让合并通过。
- 重点检查聊天页面实际挂载的 @ Agent 选择、直接指派／共同协作、消息排队、文件预览，以及应用安装／更新状态；不能只测试脱离页面的辅助函数。
- 合并报告应说明保留的自有功能、测试结果和未验证范围。工作区中其他未提交改动应保留。
- 新增 UGSci 相关设置统一放入设置中心的“UGSci 设置”（`/settings/ugsci`），扩展插件中的 `ui/src/settings/UgsciSettingsPage.ts`；GenUI 是其中一项，不再增加主侧栏的独立设置入口。同步两份插件源码及打包产物，并保留 `ugsciSettings.test.tsx` 的页面集成回归。
- `plugins/bundle/ugsci/visualization/data` 中的示例和转换缓存仅供本地测试，不能进入插件市场包、组件更新包、桌面安装包、Python wheel／sdist 或 Docker 镜像；保留本地源数据，打包镜像不复制该目录。不得取消对应排除规则和发布产物检查。
- 修改更新器、打包、发布流程或合并涉及这些部分的上游改动时，阅读 `docs/UPDATE_COMPATIBILITY_GUARD.md` 并运行 `python scripts/verify_update_regressions.py`。保留构建及上传前的签名更新包内容校验，不得用仅检查文件存在替代。

- 所有应用通过各自独立流水线发布。主程序的桌面、Python wheel／sdist、组件更新包及统一插件发布仅包含通用扩展和频道资源。`plugins/apps` 与 `type=app` 必须同时排除，并检查实际压缩包内容。保留应用源码、独立发布、已安装应用及安装／更新接口回归。
- 主发布入口为 `release-resume.yml`，仅依赖核心构建、测试与签名产物。插件市场发布不能成为主程序的依赖或修改其发布状态。内置插件使用 `src/qwenpaw/bundled_plugin_policy.py` 白名单，新增插件默认不内置；宠物不随软件打包。扩展版本与核心版本独立，自动补丁递增不得改变兼容范围，也不得覆盖已发布 URL。规则见 `RELEASING_zh.md`。
