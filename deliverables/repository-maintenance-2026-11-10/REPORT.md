# 开发目录空间清理（2026-11-10）

已按“先提交推送、再删除”的顺序清理约 **32.26 GB（30.04 GiB）**、458720 个文件。
盘点中的常规文件逻辑体积约从 53.79 GB 降至 21.42 GB；统计不跟随链接，
不包含无访问权限的目录。保留 49 个因权限拒绝无法删除的原生库缓存，共约 82.08 MB。
汇总见 [cleanup-summary.json](cleanup-summary.json)，目录盘点见
[inventory-summary.json](inventory-summary.json)。

## 范围与执行顺序

用户要求先提交并推送，再执行删除；随后明确本地无需打包，可以删除本地构建。
源码检查点 `5e9213d036a5208e9ef842db3e0bceecef233d9f` 已推送至
`origin/lobehub-style`，保留原工作区的 64 个源码、资源、测试和功能记录文件。
未把历史验收目录、运行配置、业务数据或临时环境整体上传。

本轮只处理本仓库内经过逐项盘点的生成目录。最初删除计划见
[cleanup-plan-round1.json](cleanup-plan-round1.json)，执行脚本为
[clean-generated.ps1](clean-generated.ps1)。计划包含约 32.34 GB（30.12 GiB）逻辑文件：

- `console/src-tauri/target/`：Rust 编译缓存、桌面构建副本与本地安装包。
- `console/src-tauri/binaries/`：桌面打包准备的运行时与组件暂存。
- 根目录 `build/`、`dist/` 以及控制台、网站的构建输出。
- 旧的独立 CI 依赖环境、组件包实验、插件包体测量产物。
- beta3 验证后留下的本地安装包和组件下载缓存；元数据和审计报告保留。
- 可重新生成的 mypy、Ruff 缓存。

脚本在删除前要求当前 HEAD 与远端分支都等于指定的已推送提交。
每项还须通过仓库路径边界、已跟踪文件、注册 worktree、嵌套 Git、
链接或 junction、运行中可执行文件路径与文件清单变化检查。未通过的目标保留并记录。
不执行全仓库 `git clean`、重置或 Git 对象裁剪。

## 保留内容

源码和测试、插件源码及内置镜像、提交中的插件前端发布资源保持原位。
本轮不更改构建、发布、更新兼容和 CI 的保护规则，也不执行本地打包。
保留主开发 `.venv/`、各源码项目的 `node_modules/`、当前服务及其 `src/qwenpaw/console/` 静态资源、
模型和算例、工作区数据、报告和截图、已有未提交资料以及其他 Git worktree。

UGSci 本地 `visualization/data` 的 127 个文件共 537110125 字节单独记录 SHA-256，
汇总见 [protected-data-summary.json](protected-data-summary.json)。完整文件清单仅留本地，
清理后逐一复核，127 个文件内容全部一致，见
[preservation-result.json](preservation-result.json)。打包暂存或实验目录中的旧副本不作为原始数据保留。

`.codex-tmp/ci-checkout/` 存在 `34dfaecd2` 本地提交记录与三个未提交源码改动，整份保留。
`.scratch/`、历史运行工作区和含有业务资料的验证目录未按临时目录批量删除。

21:59 的复核确认 64 个源码文件仍与已推送检查点一致。其后另一个开发任务继续修改
`console/scripts/verify-fork-features.mjs`、`console/src/layouts/Sidebar.render.test.tsx`、
`console/src/layouts/Sidebar.tsx`，这些改动留在原工作区，没有覆盖或纳入清理提交。
后续清理记录在独立稀疏检出中正常执行提交钩子，再将提交快进到原分支，
避免提交钩子临时收起正在写入的源码。临时检出在最终推送后移除。

## 验证记录

- `npx tsc -b --noEmit`：清理前后均通过。
- 文书填报应用完整测试及计算轨道前端挂载契约：97 项通过。
- 固定后端清单检查：194 套保留；固定更新回归清单检查：46 套保留。
- 源码检查点正常执行提交钩子，检查通过，没有跳过或关闭检查。
- `npm run test:fork-features` 完整结束：179 套中 177 套通过、2 套失败；
  2737 项中 2735 项通过、2 项失败。固定清单自检 13 项通过。
- 失败项为 `visualizationEmbedding.test.tsx` 的真实可视化插件下原生 CSV 表格预览等待，
  以及 `openHtmlFile.test.ts` 的预先保留浏览器窗口用例超时。
  两套文件单工作进程完整复跑为 27 项通过、相同 2 项失败；没有取得全绿结果。
  本次未定位这两项失败原因，也不据此声明清理前或清理后不存在前端功能问题。

本轮没有修改功能实现、后端业务、SDK、更新器或发布流程。
上述专项和清单检查不代表全量后端、更新器、桌面安装或真实供应商模型验收通过。
测试、源码保存和数据校验的详细本地日志位于
`.codex-tmp/repository-maintenance-20261110/`。
前端复跑日志为 `console/.codex-tmp/cleanup-frontend-rerun.log`，
类型检查日志为 `console/.codex-tmp/cleanup-typecheck.log` 和 `cleanup-typecheck-after.log`。
全量前端运行期间存在并行源码写入，其结果不属于冻结源码的最终功能验收。

## 执行结果

所有删除轮次均先核验对应提交已在远端。22 项完整删除，另 2 项清理可删除内容后
保留 49 个权限受限文件：文书填报旧 CI 环境约 27.21 MB，桌面锁验证旧环境约 54.86 MB。
没有更改这些文件的 ACL、取得所有权或停止其他任务的进程。

删除期间磁盘可用空间由约 31.07 GB 增至 62.87 GB，增加约 31.79 GB。
该差值还受文件系统元数据和并行任务影响，不能与逻辑删除量机械等同。
每轮计划和执行记录保留为 `cleanup-plan-round1.json`、`cleanup-result-round1.json`、
`cleanup-plan-round2.json`、`cleanup-result-round2.json`；
`cleanup-plan.json` 和 `cleanup-result.json` 是最后两项目标的收尾记录。

首轮使用 `45b2ddd9ff6fa94e25a61e182d1b518eb75ac4e9` 核验远端后，删除了桌面
`target/` 和 `binaries/`。随后 Windows WMI 进程查询连续返回“调用已取消”，
剩余 22 项按保护规则保留。首轮完整计划和执行记录分别保存在
`cleanup-plan-round1.json`、`cleanup-result-round1.json`。
后续改用 .NET 直接读取进程映像路径，不查询 WMI 或读取其他进程内存中的参数；
保留目标目录变化、运行中镜像、编译器、文件锁和所有原有路径保护。
第二轮计划与修正的执行器再次先提交、推送，之后才处理剩余项。
最后一轮在 `345e218355c0bbc2e161a28537fc9c355fa10d6e` 推送并核验后，
继续清理两个旧环境内可以删除的文件，记录剩余数量，不更改受限文件权限。
