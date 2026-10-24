# 2026-10-23 上游合并与回归报告

## 合并结果

- 分支：`lobehub-style`；原提交 `f7ba871d7c54eeb40327cd64776dfe890661c039`。
- 已合入 `agentscope-ai/QwenPaw` 上游 `main` 截至 `33f04faf8` 的 12 个新提交，增量涉及 346 个文件。
- 合并提交 `30e9e56d2`；兼容修复提交 `50fc5532c`。已验证上游提交是当前 HEAD 的祖先。
- 核心仍为 `2.3.0b1`；本轮没有人为追加版本号。
- 原有未提交改动已恢复并保留未提交状态，没有混入上述两个提交。合并前 stash：`b2848447694eb69c5d84c32685ea5ce862f7da11`，未删除。
- 最终验证针对当前工作区，包含原有定制代码和本轮整合修复；本地恢复引用为 `refs/codex/verified-upstream-2026-10-23`。没有推送、发布、上传或替换桌面安装包。

## 本轮新增与改进

### 聊天、审批与交互

- 删除聊天后立即标记失效路由，避免导航和列表刷新期间继续请求已删除会话；处理删除等待期间切换 Agent 或聊天的情况。
- 多个工具审批以队列方式呈现，避免同时出现的审批卡互相遮挡；侧栏复用审批上下文，减少重复轮询。
- 输入框、附件、语音与操作按钮补充可访问名称；改善键盘操作、焦点及跳到主要内容入口。
- 会话主体操作与更多操作分开，改善可访问性与点击行为；加强窄屏布局和主题样式的一致性。
- 大型工具原始输入输出在展开时才格式化，减少折叠卡片的额外开销。

### 文件工作区和设置

- 文件导航增强目录请求的过期响应处理和失败恢复，改善文件操作与导航体验。
- 窄屏工作区可在导航、源码管理和文档面板间切换。
- ACP、MCP、工具、备份、语音转写等配置页加强加载失败提示、重试、重复提交与 Agent 切换隔离。
- 模型管理、弹窗、抽屉及设置页面调整响应式布局和交互目标。

### 模型与 Hub

- 模型供应商明确拒绝视频输入时，可移除本轮视频部分后重试；保留同一请求中的图片和音频，不把内容安全拒绝误判为能力不足。
- 支持缓存已确认的视频能力限制，减少后续重复失败。
- Hub 网关可配置超时，保留供应商上游错误，改善用量策略相关处理；模型策略草稿在刷新时保留。
- 网页正文转换用标准库实现替代 GPL 依赖 html2text，并补充转换回归。

### 桌面与发布

- 修复 desktop.log 因多个文件句柄导致轮转失败的问题。
- Node 统一从 `.nvmrc` 读取，当前锁定 `22.23.4`；Python standalone 发布锁定更新为 `20261021`，uv 最低为 `0.13.4`。
- 上游增加安装器版本检查和证书依赖要求：pip >= 26.2.2、certifi >= 2026.10.19；旧运行时可能需要桌面完整更新。
- CI 兼容 release 分支，并更新若干跨平台测试夹具和端到端页面定位；本地未运行线上 nightly 或真实发布。

## 定制功能保留与冲突处理

| 范围 | 保留与验证方式 |
| --- | --- |
| @ Agent、直接指派／共同协作 | 保留真实 ChatPage 挂载、不可变提交上下文及前后台队列路由；固定页面集成回归通过；现场输入 @ 验证候选列表 |
| 消息排队与跨 Agent 隔离 | 保留原请求身份、附件、审批设置及指派目标；追加验证会话删除、审批队列与路由状态 |
| 文件预览与工作区 | 保留 file://、绝对路径编码、预览／完整工作区切换、隐藏导航、成果面板及过期文件请求保护；合入上游窄屏导航 |
| UGSci 工具与专家页面 | 保留嵌入式 ACP/MCP/工具布局；ACP 同时支持上游失败重试和旧请求隔离；现场专家列表和应用专属入口正常显示 |
| GenUI、团队、领域计算、可视化、FlowForge | 两份原有插件代码及构建产物随原改动恢复；固定后端清单覆盖对应行为，未用 OpenUI 替换 GenUI |
| 文书填报与 Office | 固定后端入口包含 plugins/apps/document-forms/tests；实际打包页面、Word/Excel/项目归档相关原有回归继续执行 |
| 设置、头像、MCP 市场 | 保留统一 /settings/ugsci、内置头像和既有页面集成回归 |
| 更新与产物保护 | 保留签名包实际内容、差量／全量恢复与用户数据保护校验；保留 visualization/data 发布排除规则及清单门禁 |

具体整合修复：

1. 合并加载两边测试夹具时出现重复 openTab 字段，已合并为同一个真实测试替身，原有行为用例全部保留。
2. ACP 的嵌入式页面不回退为独立上游页面；加载失败和切换 Agent 时隐藏不可操作入口，提供重试和状态语义。
3. 发布流程保留 fork 的 pnpm、组件签名及恢复门禁，补入上游运行时版本要求。补齐 release-resume 和两个自有应用发布流程的 Node 版本来源，并同步 Windows/macOS 的 Python 发布锁定。
4. 新增 Node 升级测试采用真实临时 ZIP/tar 与 SHA-256，通过原子安装函数验证跨目标平台升级和重复运行缓存，不移除摘要检查。
5. 临时文件暂存期间停止前端开发服务，恢复后带 --force 重启依赖预构建，避免前次合并中旧进程缓存的“文件不存在”错误。

## 测试结果

| 检查 | 合并前 | 合并后 |
| --- | --- | --- |
| 固定前端 test:fork-features | 45 文件、783 通过 | 45 文件、791 通过 |
| 前端类型检查 | 通过 | 通过 |
| 固定后端 verify_fork_regressions.py | 65 套、1243 通过、26 既有跳过 | 65 套、1243 通过、26 既有跳过 |
| 更新 verify_update_regressions.py | 本轮未重复基线 | 16 套、261 通过、1 既有跳过 |
| 生产构建 | — | 通过；Monaco CSS、预压缩和初始包检查均通过；8.68 MiB 原始／2.23 MiB Brotli |
| 本轮上游后端定向 | — | 首轮 324 通过；7 个运行时测试失败后修复；运行时及发布安全完整重跑 36 通过 |
| 本轮上游前端定向 | — | 首轮 163 通过、4 个 ACP 失败；修复后 ACP 6 通过；路由／审批／输入可访问性等 5 文件 123 通过；SessionApi 46 通过 |

上述定向测试存在交叉，不应把各行相加当成唯一用例总数。原有跳过条件保留，没有新增跳过、删除清单或将关键测试改成空实现。Hub／模型协议及 SDK 真实依赖安装补测 208 项通过，证据见 evidence/README.md。

## 现场页面复核

- 使用右侧现有浏览器打开的专家页检查，UGSci 专家、专家团和工作流入口正常，应用专属专家继续显示“打开应用”。
- 点击新建任务进入聊天，输入 @ 后真实候选列表出现；未发送消息，验证后已清空输入并返回专家页。
- 没有出现模块解析覆盖层或页面崩溃；控制台可见既有第三方 forwardRef 警告，未将它误报为完全无警告。
- 现场使用重新启动的前端开发服务，连接既有本地后端；没有重启用户后端或中断其运行任务，不代表一次全新桌面启动验收。

## 未验证范围

未执行完整仓库所有测试、真实外部模型调用、供应商认证、真实视频供应商端到端请求、Hub 线上连接、完整桌面签名安装、Docker 实际构建或线上发布。跨平台 Node 测试验证的是隔离归档与安装流程，不是实际运行另一操作系统的二进制。运行时版本要求已进入代码，但当前本机开发环境没有因此被自动升级。

## 上游提交清单

- `33f04faf8` fix(hub): preserve model policy drafts on refresh (#8399)
- `6db1eaa80` test(security): keep the sips preflight cases platform-neutral (#8383)
- `d2ca7030c` test(unit): make advisor listing and tui drain assertions platform-stable (#8381)
- `86ef9dba4` test(pawapp): answer the sidecar probe with a raw socket (#8382)
- `a4501e767` test(e2e): re-anchor thirteen nightly cases and remove two silent-skip fallbacks (#8393)
- `ead6c69ae` fix(desktop): let desktop.log rotate by sharing one file handle (#8390)
- `d98264253` fix(agents): retry without video when providers reject video input (#8299)
- `064d256ee` fix(hub): configure gateway timeout and preserve upstream errors (#8387)
- `b24f729d7` chore(deps): replace GPL-licensed html2text with stdlib converter (#8366)
- `d905bf242` chore: merge Release/v2.2.2post1 into main (#8391)
- `fdf7e0243` fix: prevent stale requests after deleting chat (#8375)
- `ce748971e` refactor(console): improve usability, resilience, and responsive UX (#8332)
