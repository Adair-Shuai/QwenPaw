# 本项目功能保留规则

本仓库是带有 UGSci 自有功能的上游分支。上游合并不能只以编译通过或组件文件仍存在作为功能保留的证据。

- 进行上游合并、聊天 SDK 升级或聊天／扩展页面重构时，先阅读 `docs/FORK_FEATURE_REGRESSION.md`，对照历史实现保留自有行为。
- 合并前后运行 `cd console && npm run test:fork-features` 和类型检查；改动服务端指派、组件更新等逻辑时，同时运行对应后端回归。
- 保留 `console/scripts/verify-fork-features.mjs` 的测试清单以及 CI 中的清单检查步骤。新增自有功能时补充行为测试和清单；不得通过删除、跳过或仅模拟被保护的功能来让合并通过。
- 重点检查聊天页面实际挂载的 @ Agent 选择、直接指派／共同协作、消息排队、文件预览，以及应用安装／更新状态；不能只测试脱离页面的辅助函数。
- 合并报告应说明保留的自有功能、测试结果和未验证范围。工作区中其他未提交改动应保留。
- 新增 UGSci 相关设置统一放入设置中心的“UGSci 设置”（`/settings/ugsci`），扩展插件中的 `ui/src/settings/UgsciSettingsPage.ts`；GenUI 是其中一项，不再增加主侧栏的独立设置入口。同步两份插件源码及打包产物，并保留 `ugsciSettings.test.tsx` 的页面集成回归。
- `plugins/bundle/ugsci/visualization/data` 中的示例和转换缓存仅供本地测试，不能进入插件市场包、组件更新包、桌面安装包、Python wheel／sdist 或 Docker 镜像；保留本地源数据，打包镜像不复制该目录。不得取消对应排除规则和发布产物检查。
- 修改更新器、打包、发布流程或合并涉及这些部分的上游改动时，阅读 `docs/UPDATE_COMPATIBILITY_GUARD.md` 并运行 `python scripts/verify_update_regressions.py`。保留构建及上传前的签名更新包内容校验，不得用仅检查文件存在替代。
