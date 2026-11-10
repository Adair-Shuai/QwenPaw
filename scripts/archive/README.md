# 历史一次性工具

这里保留已经完成用途的迁移、补丁生成和诊断脚本，不是构建或发布入口。

`regression-guards/` 来自仓库根目录的 `.add_*`、`.append_*`、`.fix_*`、
`.run_*` 等历史工具。文件只移动位置，内容保持不变；其中部分脚本会直接改写测试文件，
不要批量执行。脚本内的相对路径仍以仓库根目录为工作目录。

正式回归入口为 `scripts/verify_fork_regressions.py`、
`scripts/verify_update_regressions.py` 和 `console/scripts/verify-fork-features.mjs`。
本目录未替代或删减任何正式用例、清单或 CI 门禁。

历史根目录诊断输出保存在 `regression-guards/evidence/`。
更多目录约定见 [仓库说明](../../docs/REPOSITORY_LAYOUT.md)。
