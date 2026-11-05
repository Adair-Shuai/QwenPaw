# 上游合并完整验证报告

验证对象为 `lobehub-style` 上的合并结果及原有未提交功能，验证基准提交 `a5515320daf50385538d484701f19da7fe9d7bda`，上游快照 `33bcbfe8748965eea8720c3a521acdf787cf766f`。验证收口时改动保留在工作区；随后按用户要求保存并推送检查点，验证结论不变。**全仓验收仍未全绿，不能据此宣布可以直接发布。**

新增功能、用途和使用建议见 [上游功能报告](../upstream-merge-2026-11-05/REPORT.md)。本报告集中说明实际验证、保留的自有行为与剩余问题。

源码提交包含报告、组件冻结清单和精简保存审计；表中引用的原始日志、JUnit 与运行快照保留在本机同名证据目录，不随源码推送。此次检查点使用已执行的完整门禁记录，不重新执行会改写文件的本地提交钩子；CI 配置及保护清单保持原样。

验证于北京时间 **2026-11-05 22:23** 收口。三路子智能体分别完成前端、后端／SDK、Windows／更新兼容性验证，主智能体完成构建产物、真实启动、HTTP、界面及证据交叉核对。优先处理默认启动与 SDK／依赖安装超时，再修复实际静态错误并补跑对应门禁；完整覆盖率和跨平台发布验收仍需另行完成。

## 最终冻结版本补验

验证期间，另一个组件更新修复聊天也在修改同一仓库。发现漂移后保留了原始日志和文件副本，经用户明确授权协调，该聊天于 **北京时间 21:19:37（UTC 13:19:37）** 冻结源码。交付的 234 项修改／新增文件摘要全部核对一致后才启动以下补验；234 项包含共享工作区原有修改，不代表全由某一个聊天新增。组件更新十项修复及独立复核记录见 `deliverables/component-update-repair-2026-11-05/REPORT.txt`，冻结清单见同目录 `freeze.json`。

| 冻结版本检查 | 结果 | 证据（本报告同目录） |
| --- | --- | --- |
| 后端自有保护 155 套 | **3741 通过、3 失败、23 跳过、0 错误**，共 3767 项。3 项为真实依赖安装／修复子进程超过原 90 秒；未用单项复测改写整轮结果 | windows/coordinated-155-28-final/fork.xml、fork-failures.json |
| 更新兼容性 28 套 | **473 通过、21 跳过、0 失败／错误**。跳过为 18 项 Ubuntu Bash 上传、1 项符号链接权限、2 项 POSIX 信号处理 | windows/coordinated-155-28-final/updates.xml |
| 前端自有保护 127 套 | **2036 通过、4 失败**，共 2040 项；126 套通过、文书填报 1 套失败。四项均为原 30／45 秒超时，清单、AST guard 与原 123 套保留核对通过 | coordinated-final/frontend/results.json、fork-features-failures.json |
| 控制台类型、全目录格式与生产构建 | 全部通过，源码摘要未变；583 项预压缩，初始包 8.75 MiB raw／2.25 MiB Brotli | coordinated-final/frontend/ |
| 最新 console/src ESLint | **476 errors、69 warnings**，1738 个文件中 106 个有诊断；未自动修复。冻结清单内 18 个 console 文件有 130 errors／29 warnings，不能一概归为历史问题 | coordinated-final/frontend/eslint-src-final-summary.json |
| Rust 原生宿主 | **109 项测试通过**，Release cargo check 与修改的 command.rs／daemon.rs 格式检查通过 | coordinated-final/additional/rust-toolchain-final-steps.json |
| 新 wheel／sdist | 实际构建、独立 venv 安装通过；两个产物中 **1151 个应用 Python 文件逐字节一致**，本地数据与依赖缓存排除通过 | coordinated-final/sdk/package-content.json、all-application-python-content.json |
| 最新公开 SDK 默认门禁 | **未通过**。保持默认 600 秒整阶段、45 秒单例；第一个应用 HTTP／存储／reload 用例触发 45 秒线程超时。导出模板、导出前端、真实模板合规与工具调用／reload／工作区隔离分别通过 | coordinated-final/sdk/steps.json、author-public-author-tests.log |
| 最新公开 SDK 全 165 节点补充执行 | **163 通过、2 个 worker 崩溃、0 未执行／跳过**（wheel `e86d5362…`）。原 45 秒约束保留，全部安装源码 1555 个 .py 与 23 个作者输入前后相同；双 worker 结果不替代原单进程门禁 | backend-startup/sdk-author165-latest-n2/exact-node-audit.json |
| 公开前端 SDK | Node 22 外部作者检查通过；最新 wheel 导出的 8 个文件与该次输入路径、字节完全相同 | coordinated-final/sdk/frontend-export-comparison.json、frontend/sdk-frontend-final-node22.run.json |
| 真实启动 | **290.16 秒**就绪，4 个工作区 running，插件 ready；默认 120 秒门槛未满足 | coordinated-final/additional/runtime-startup-probe-result.json |
| 最新健康／插件／应用 HTTP 四个完整模块 | **21 通过、1 失败**。CloudPaw 安装的 pip wheel 超过内部 300 秒；功能诊断使用 600 秒 HTTP／启动等待，不证明默认预算通过 | coordinated-final/additional/integration-changed.xml、integration-changed-result.json |
| 最新构建 Chromium 基础界面 | **4 项通过**；隔离 API 响应 | coordinated-final/additional/browser-ui-smoke.xml |
| 全仓 pinned pre-commit | **10 项通过、1 项跳过、6 项失败**。mypy 通过；失败为编码标记、尾逗号、Black、Flake8、Pylint、Prettier。索引精确匹配 10855 项源码输入，无源漂移，自动修复仅在副本 | coordinated-final/static/result.json、classification.json |

## 前期全仓验证与诊断

环境为 Windows x64、Python 3.11、官方 Node 22.23.4。以下为冻结前各批验证，其中前端全集与 HTTP 全集跨越并发源码修改，不能当作最终冻结版本认证。各批原始失败保留，单独复测不改写整轮结果。

| 检查 | 最终结果 | 证据 |
| --- | --- | --- |
| 前端自有功能固定 123 套 | **2002 项全部通过**；清单校验的 9 项自测通过 | frontend/fork-features-quiet-node22.log |
| 后端自有功能固定 147 套 | **3581 通过、2 失败、21 既有跳过**；两项真实依赖修复子进程超过原 90 秒上限。并发修改期间执行，不能代表统一冻结版本 | windows/fixed-147-final.xml、windows/repair-retained-source-copy-evidence.json |
| 完整 unit + contract 基线 | 当时收集的 20,355 个唯一节点全部有终态：20,042 通过、271 跳过、41 失败、1 项既有预期失败。41 项均为 WinError 1314 创建符号链接权限不足。**这是分批组合结果，并非一次全绿，也不覆盖后续并发修改。** | backend-startup/combined-backend-results.json、combined-backend-node-history.json |
| 更新兼容性固定 21 套 | **357 通过、19 既有平台跳过、0 失败**；新增 6 项真实安装／数据保留回归全部通过 | windows/updates-21-runtime-final.xml |
| 前端完整覆盖率运行 | **761 套、9754 项：9734 通过、20 失败**。16 项超时、4 项页面查询失败；未生成覆盖率报告，阈值未评估。运行期间有并发源码修改 | frontend/coverage-final-node22-junit.xml、frontend/coverage-final-failures.json |
| 控制台格式、类型、生产构建 | 全部通过；包含 Monaco、583 项预压缩与入口体积预算 | frontend/frontend-results.json |
| UGSci、Run Center、OpenUI、OpenViking 前端 | 实际类型检查与构建通过；OpenUI 完整 7 套单进程复测 80／80 通过 | plugins-steps.json、openui-recheck.xml、openviking-steps.json |
| Rust 原生宿主 | **107 项测试通过**，Release cargo check 通过 | rust-tests-final.log、rust-release-check.log |
| OfficeCLI 审定引擎 | **7 项真实文件操作通过**，涵盖 Word／Excel／PowerPoint、预览与宏等内容保留，执行前后 SHA-256 相同 | officecli-pinned-real-engine.xml |
| Chromium 界面基础验收 | **4 项通过**，使用当时该批生产构建和隔离 API 响应 | browser-ui-smoke.xml |
| 真实 HTTP 全量集成 | 默认启动预算未通过；较长等待的完整 1802 项为 **1764 通过、16 失败、15 setup 错误、5 跳过、2 既有 xpass**，运行跨越并发修改，不能认证最终版本 | integration-runtime-functional.xml、integration-runtime-functional-classification.json |
| 前一版 wheel／sdist 与公开 SDK | 实际构建安装及独立导出／模板运行通过（wheel `f0918ba3…`）。原单进程公开测试第 31 项触发 45 秒超时；额外双 worker 全 165 项有终态：**154 通过、11 个 worker 崩溃、0 未执行／跳过**。这不证明原门禁通过 | sdk-runtime-final-package-content.json、backend-startup/sdk-author165-n2/ |
| 公开前端 SDK／Node 22 | 仓库外冻结产物的 NodeNext、bundler 类型检查和运行时能力／编码路由检查全部通过；输入前后摘要相同 | frontend/sdk-frontend-final-node22.run.json、frontend/sdk-frontend-author-node22/results.json |
| 前两轮全仓 pre-commit | 初轮 7 个失败 hook；二轮有同样 7 项失败及一项 mypy 缓存伪红：类型错误为 0，但副本索引误纳入 5218 个缓存文件。原记录保留，最终冻结复验已纠正索引选择 | precommit-all-files.log、windows/precommit-full-final-classification.json |

## 自有功能保留证据

- 聊天实际页面与原生 SDK 集成继续覆盖 @ Agent 选择、直接指派／共同协作、排队与暂停、编辑排序、打断发送、引导当前回答、导航后的回执恢复、历史原位编辑重发、草稿与附件，以及归档文件预览。采用真实挂载页面、队列 Store／Hook、SDK Builder 和服务端状态回归。
- 文书填报继续执行 `plugins/apps/document-forms/tests`，并验证真实前端插件产物；没有用只跑 `tests/unit` 代替它。UGSci 设置保持 `/settings/ugsci`，GenUI 仍在该设置中心内；源码、内置副本及打包前端继续受同步与页面集成回归保护。
- 更新回归保留签名包内容校验、差量／全量消费、回滚、兼容声明与用户数据保留。UGSci `visualization/data` 源数据仍在，市场包、更新包、桌面暂存、Python wheel／sdist 和 Docker 排除检查没有取消。
- 合并前后保护清单均只增加：后端从合并前 136、完整验证前 139 到本轮 147，协同冻结时为 155；前端从 121 到 123 再到 127；更新器从 21 到 28。原套件与关键用例、guard 字面量没有移除。新增前端四套覆盖 AppCenter 更新、应用卡片、插件加载与 OS 卸载清理。
- 原有 143 项未提交源码均存在，当前核对为 109 项字节相同、34 项含本轮及协同修改／格式调整，缺失为 0；原始副本与补丁仍在 `.git` 下的两份备份中。没有新增暂存或提交。此前前端 141 项机械格式调整另有证明：131 个 TS／TSX 编译后的 JavaScript AST 相同、7 个 JSON 解析值相同、3 个 LESS 的编译 CSS 相同；这项证明不将后续功能改动算成机械调整。

文件存在或哈希相同只用于证明源码保存，功能保留以实际行为回归为依据。完整保存核对见 `source-preservation.json`、`inventory-both-baselines.json` 和 `preservation-audit-summary.json`。

最终清理仅通过官方同步脚本移除打包镜像中的 143 个生成字节码缓存；复制的源码及生成产物均为 0，随后 `--check` 通过。清理前后本地源数据的 **127 个文件、537110125 字节及每文件 SHA-256 完全相同**，详见 `coordinated-final/ugsci-source-data-preservation.json`。各门禁有重叠用例，表内数字不简单相加为独立用例总数。

收口复核的 234 项冻结源码及全仓静态检查输入的 10855 项文件均无缺失、无内容漂移，冻结清单本身摘要相同，HEAD 未变、暂存区为空，详见 `coordinated-final/final-source-audit.json`。

## 实际修复

| 问题 | 修复与验证 |
| --- | --- |
| 冷启动提前导入 AgentScope | 延后兼容修补至 SDK 正常加载完成，备份接口保持惰性导出；保留 Msg 身份、旧参数、工具注解、自定义加载器与并发行为。原生产 5 秒约束未调高。 |
| 插件退出反复解析 Windows 路径 | 已存在路径每次只做一次真实系统解析，缺失或无权限时回退原 realpath；没有持久缓存或文本前缀绕过。9118 个真实输入的身份与旧算法一致；真实目录链接重定向、命名空间清理及本机可执行的原隔离用例通过，文件符号链接分支仍有权限限制。 |
| 开发内置安装复制 UGSci 本地样例 | 排除明确的 `visualization/data`，保留源数据和既有安装中的用户导入。UGSci 安装体积由 525.690 降至 13.462 MiB，恰好排除源目录的 127 个样例文件；其他有效文件哈希与旧算法相同，开发依赖及缓存目录提前剪枝。 |
| 内置频道离线资源与宿主身份不一致 | 用实际打包器重建 18 个频道并核对索引、描述符、依赖与源码内容，补充 19 项回归。 |
| Windows OpenViking 私有身份权限不可靠 | 写入前设置当前用户专用 DACL，复用时修复，失败时拒绝写入；POSIX 保留 0600。128 项完整后端回归包含真实权限检查。 |
| NTFS junction 可绕过目录边界 | 检查声明根到叶子的真实链接，覆盖记忆、技能、计划任务与依赖发布，同时允许可信根上方系统别名。37 项实际目录链接及兼容回归通过。 |
| OfficeCLI 自行更新破坏审定二进制 | 工具、预览、文书打印、Shell、原生宿主子进程及构建探测均强制禁止自更新，探测后再次校验 SHA-256。实际审定引擎文件读写验证通过。 |
| Windows Shell 取消遗留子进程 | 终止真实进程树并有界回收；验证运行延长、取消、全部 PID 退出与 stdin EOF。生产执行预算和取消宽限保持。 |
| 专家显示配置并发创建目录误判越界 | 统一 Windows 已解析比较路径的表示，保留文件读写、版本 CAS 与逃逸拒绝；旧代码可稳定重现的四项竞争失败修复后通过，真实越界链接仍拒绝。 |
| Skills 空 task_id 导入无效轮询 | 拒绝空／空白 ID，显示既有失败提示并清理 importing 状态；两项原预期失败转为普通通过，断言增加。 |

测试设施还修复了旧频道 QR 接口测试、失败路径不释放异步任务、插件卸载后的陈旧模块引用、异步清理方法的错误替身协议、独立 SDK 验证继承父 pytest 参数，以及集成应用共用依赖状态等问题。Matrix 与 QQ 的本地真实 HTTP／WebSocket 模拟服务器从删除前的上游提交原样恢复。没有删除或跳过关键用例。后端另加 pytest 外层 300 秒防挂与 240 秒堆栈记录，用例内部 90 秒及生产 5 秒等约束未调高；覆盖率门槛保留。两处局部测试等待有调整：复杂文书流程从 30 秒增为 45 秒，Shell 取消生命周期从 3 秒增为 6 秒以覆盖原生产 5 秒宽限加回收；这些变化不证明旧局部预算通过。

## 未通过和未验证的范围

**启动与完整集成。** 协同冻结版本成功进入 ready，4 个工作区均运行，但整体就绪为 290.16 秒，应用日志后台启动为 266.520 秒；默认 120 秒未满足。此前探针为 264.20 秒、后台启动 243.374 秒，不能套用到最终版本；默认集成曾有 6 个 worker 在 setup 超时退出。样例排除的安装阶段由旧记录 42 秒变为新记录 18 秒，运行负载不受控，不能据此宣称整体冷启动变快。完整功能诊断和最终四模块补验采用既有环境开关将 HTTP／启动等待设为 600 秒，pytest 整例上限 2000 秒；它们不证明默认预算通过。六个既有 contract_batch 模块会把 HTTP 超时转换为合成 200 响应，该部分通过不能计为真实传输证明；本轮没有把该替身扩大使用。较早被中断的批次不根据进度点推算通过数量。

**公开 SDK。** 前一 wheel 的原 600 秒整阶段门禁失败，临时副本仅把整阶段等待改为 7200 秒后，仍在第 31 项 `test_three_idle_reloads_leave_one_callable_generation` 触发原 45 秒单例超时，进程退出；随后双 worker 补充执行才使 165 项均有终态（154 通过、11 个 worker 崩溃）。最新协同冻结 wheel 使用原脚本默认 600／45 秒，在首项 `test_app_http_identity_storage_and_reload` 触发 45 秒线程超时，堆栈位于依赖清单读取及 importlib.metadata 的 METADATA 文件读取；不能归为前次 native 路径扫描的同一根因。默认门禁按 600／45 秒单列，7200 秒仅为前一版整阶段诊断，SDK 单例 45 秒始终未改。仓库脚本增加了清理父环境、详细日志与 JUnit 记录，不能称为完全未修改。最新模板导出、前端导出、真实合规及工具调用／reload／工作区隔离独立通过，不能替代公开测试全集。外部 venv 复用本机已安装依赖，未验证全新依赖解析或 Python 3.12／3.13。

**后端依赖安装与修复。** 最新冻结版 3 个失败为 `test_install_includes_every_declared_dependency` 的两组参数，以及 `test_repair_installs_manifest_dependency_after_boot_failure`，均在真实离线依赖安装子进程的原 90 秒上限失败；原始父进程栈停在 stdout reader join，尚不能据此判定内部卡点。前一 147 套的两个失败还包括 `test_missing_boot_dependency_can_be_repaired_explicitly`，它在最新 155 套中通过；不同版本不混算。没有证据把这些失败全部归为机器负载，也没有提高预算让门禁通过。

对第一组安装参数只做了一次原预算诊断，子进程 37.594 秒完成、原断言通过；host-enter 10.266 秒、install 20.875 秒，25 秒采样仍在安装阶段等待。它没有复现整批 90 秒失败，不能宣称已经定位死锁或解决全部三例。诊断只在私有运行副本加入阶段日志／faulthandler，原测试及业务源码未改，差异与原始 body 均留档。

**公开 SDK 的补充定位。** 最新双 worker 失败为应用 HTTP／存储／重载与失败任务诊断保留两例；各 worker 在约 45 秒退出，但没有逐例原生超时栈。后者仅单次 n0 独立复测在原 45 秒内通过（26.51 秒），20 秒采样位于重载清理的 namespace 路径刷新和文件 stat。采样不等于整批崩溃时根因，单项通过也不能改写整批 2 个崩溃。三次 idle reload 在最新整批实际 29.757 秒通过，旧 wheel 的同节点失败仍保留。

**前端保护与全集。** 最终 127 套中的四个文书超时分别为单项目表单布局、compatible 页面的 Excel→审查确认→Word 流程、关联意见事实填充、内联意见粘贴，预算依次为 30／45／30／45 秒，均没有字段或 DOM 断言不符。随后只进行一次原预算的独立完整 24 项复测，24／24 通过（299.53 秒），四项分别耗时 18.461／31.790／22.676／25.223 秒；源码未变。这不能改写原 127 套的四次超时，也不能宣布整轮保护门禁通过。

早先跨版本的完整 coverage 中，文书 11 项、专家演示 2 项、OpenUI／UIdeas／UProject 各 1 项为超时，Hub 2 项与 JobDrawer 2 项为页面查询失败。最终冻结版本未重新跑完整 coverage；没有生成覆盖率百分比，阈值没有评估，不能宣称覆盖率验收通过。

**完整静态门禁。** 最终 console/src 为 476 errors／69 warnings，106 个文件有诊断；234 项冻结清单中涉及的 18 个 console 文件有 130 errors／29 warnings，不能把全部修改范围说成零诊断。主要为 no-explicit-any 等规则，也含 unused-vars、multiline 等错误。旧全目录 2404／206 包含临时与第三方目录，范围不同，不作为最终 src 统计。

最终 pre-commit 的六个失败中，Flake8 有 258 条 E501 与 1 条 F841（80 文件）；Pylint 有 1139 条诊断（166 文件），其中 6 条 E1125 缺失关键字参数及 1 次 Astroid 内部崩溃；它们不是 1139 个运行时缺陷。Black 修改副本中 6 个源文件，Prettier 列出 536 个格式修改路径。mypy 无类型错误且 hook 通过。Rust 全仓 rustfmt 的 lib.rs／tray 格式问题仍未修复，修改的 command.rs／daemon.rs 检查通过。全仓检查的自动修复仅在逐文件摘要一致的独立副本中进行；没有覆盖用户源码，也没有用局部通过替代全仓结果。

**Windows 权限与未收集测试。** 当前账户创建文件或目录符号链接返回 WinError 1314，相关原测试继续保留失败；真实 NTFS junction 验证不能代替文件符号链接分支。另有 5 个既有整模块 skip，30 个测试函数未收集：旧 ACP 文件链接 6、流参数 2、MCP 后台启动 4，以及缺少真实 Langfuse SDK 的上下文 8／集成 10。现代 ACP 文本／接收更新与 MCP 状态回归部分通过，不等价证明旧资源链接发射、三快照流参数、defer 后台时序或真实 Langfuse 集成；这些能力不能宣布验收。271 个已收集节点的 skip 与这 5 个整模块分别计数。

**真实引擎和发布。** 用户已有 OfficeCLI 缓存实际为 1.0.160，与审定 1.0.157 不一致，原缓存没有替换；7 项真实文件验收使用独立临时缓存中的审定版本。浏览器基础验收采用真实 Chromium 和最终构建，但 API 为隔离响应。本轮没有调用用户真实模型、即时通信账户、OpenViking 服务或实际通知送达，也没有执行桌面安装、跨版本实际安装器升级、macOS 签名／公证或 Linux Docker 运行。这些平台仍需对应验收。
