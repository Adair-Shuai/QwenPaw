# UGSci Desktop 拆分、打包、发布与更新手册

> 状态：b7 迁移设计与统一生产链路说明
> 支持平台：Windows x64、macOS Apple Silicon
> 不支持：macOS Intel 发行构建
> 原则：版本化制品不可覆盖、可变指针最后切换、用户数据先备份、失败可回滚。

## 1. 文档目的

本文是 UGSci Desktop 发行链路的权威操作手册，覆盖：

- 源码与上游合并边界；
- 桌面、Python backend、运行时、插件和工具的拆分；
- Windows/macOS 构建；
- GitHub Release 与 OSS 发布；
- 首次安装、完整更新、组件差量更新；
- b5 到 b7 的迁移；
- 失败恢复、断点续跑、日志和生产检查；
- 已经踩过的坑及其防复发规则。

旧的 `PACKAGING_REVIEW.md` 只用于历史参考，部分内容和编码已经失效，不应作为生产操作依据。

## 2. 历史过程复盘

### 2.1 初始阶段：单体桌面包

早期桌面发行将以下内容放入同一个安装制品：

- Tauri 桌面壳和 Web 前端；
- PyInstaller 冻结的 Python backend；
- 独立 Python runtime；
- Node.js runtime；
- JRE 和 NeqSim；
- OfficeCLI；
- bundled plugins；
- Setup、卸载和 PATH 注册脚本。

优点是首次安装逻辑直接；缺点是任何小改动都会重新构建、上传和下载整个包。

b6 Windows ZIP 的真实统计如下：

| 部分 | 压缩体积 | 安装后体积 |
|---|---:|---:|
| `qwenpaw-backend` | 约 635 MB | 约 1.62 GB |
| Python runtime | 约 219 MB | 约 649 MB |
| NeqSim | 约 78 MB | 约 82 MB |
| Java runtime | 约 41 MB | 约 121 MB |
| Node runtime | 约 36 MB | 约 94 MB |
| OfficeCLI | 约 12 MB | 约 32 MB |
| Tauri/UGSci | 约 6–8 MB | 约 18 MB |
| 合计 | 约 1.01 GB | 约 2.6 GB |

`qwenpaw-backend` 与独立 Python runtime 存在运行环境和依赖重复，是 b7 优先消除的成本。

### 2.2 组件差量阶段

随后引入独立组件更新：

- signed component Manifest；
- full ZIP 与从历史版本生成的 delta；
- 最近 10 个历史组件版本；
- SHA-256、独立 Ed25519 签名和客户端固定公钥；
- staging、原子激活、备份、失败回退和缓存清理；
- OSS 版本化 Manifest + signed pointer；
- 插件、应用及受管资源按自身版本选择 delta。

这解决了插件和组件的小步更新，但桌面核心仍由 Tauri updater 下载完整 Windows portable ZIP 或 macOS updater archive。

### 2.3 b5/b6 实际发布暴露的问题

1. Windows NSIS 曾因压缩器声明位置错误而失败，问题与包大小无直接关系。
2. 单个 NSIS 制品接近工具上限，因此改为 ZIP + `Setup.exe` + payload。
3. 早期 portable 包入口参数存在尾随空格，导致 backend 模块加载失败。
4. 初始安装包一度遗漏 bundled plugins；Windows 和 macOS 都必须验证插件实体和 UI 构建产物。
5. `Setup.exe` 一度只是 PowerShell 包装器，没有正常 GUI、图标和可靠错误反馈。
6. 已安装目录非空时，必须区分 UGSci 残留与用户其他文件：前者可安全覆盖，后者必须阻止并提示选择目录。
7. 插件版本化对象使用强制覆盖会导致 immutable artifact 冲突；未变化插件不应重复上传或覆盖。
8. 旧插件发布 workflow 曾绕过统一发布链路，造成 index 与制品短暂不一致。
9. Manifest 和 `.sig` 分文件覆盖存在短暂不匹配窗口，最终改为版本化 Manifest，最后切换 signed pointer。
10. 外部 runtime 必须固定版本、URL 和 SHA-256，禁止生产构建动态选择 latest。
11. tar/zip 解压必须防绝对路径、`..`、符号链接、硬链接和设备文件。
12. Windows b5→b6 下载完成后，主程序立即退出，隐藏 PowerShell 慢速解压 1 GB ZIP；无安装进度，看起来像崩溃。
13. 更新缺少跨进程锁，用户重新启动 b5 并再次点击可产生多个并发解压和安装器。
14. 只检查 CI 构建成功不够，必须实际安装、启动 backend、加载插件并验证更新后的健康状态。

## 3. b7 目标架构

### 3.1 安装目录

```text
UGSci Desktop/
├─ app/<version>/
│  ├─ UGSci.exe or UGSci.app
│  ├─ frontend/
│  └─ backend/<version>/
├─ runtimes/
│  ├─ python/<version>/
│  ├─ python-packages/<version>/
│  ├─ node/<version>/
│  └─ java/<version>/
├─ components/
│  ├─ plugins/<id>/<version>/
│  ├─ apps/<id>/<version>/
│  └─ tools/<id>/<version>/
├─ tools/
│  ├─ neqsim/<version>/
│  └─ officecli/<version>/
├─ updater/
├─ state/
│  ├─ active.json
│  ├─ update-journal.json
│  └─ install.lock
└─ logs/
```

用户数据不放在程序目录的版本化区域，继续使用用户级数据目录。更新不得直接覆盖工作区、密钥、模型、数据、状态或用户安装的插件。

### 3.2 Python backend 的位置

Python backend 不消失，也不移动上游源码。源码仍来自 `src/qwenpaw`，发布时拆为：

```text
runtimes/python/<version>       Python 解释器与标准库
runtimes/python-packages/...    通用、科学和领域依赖
app/<version>/backend/...       qwenpaw 业务代码和启动入口
```

可保留一个很小的 Windows native launcher，但不得再把完整 Python 和全部依赖冻结进 launcher。

### 3.3 组件边界

拆分以“变化频率”和“回滚边界”为准，不按仓库目录机械切割：

| 组件 | 预计下载体积 | 变化频率 |
|---|---:|---|
| Desktop shell + frontend | 8–25 MB | 高频 |
| Python backend 代码 | 20–80 MB | 高频 |
| Python runtime | 80–150 MB | 很低 |
| Python dependency layer | 150–300 MB | 中低 |
| Node runtime | 35–40 MB | 很低 |
| Java runtime | 40–45 MB | 很低 |
| NeqSim | 75–80 MB | 低 |
| OfficeCLI | 10–15 MB | 低 |
| 单个插件 | 1–50 MB | 独立变化 |
| 更新助手 | 1–5 MB | 低 |

常规更新目标是 30–100 MB；纯前端更新目标是 8–25 MB。首次安装仍需完整依赖，预计 450–700 MB。

## 4. 源码与上游合并边界

上游业务目录尽量不承载发行逻辑：

```text
上游业务层
├─ console/src
├─ src/qwenpaw
└─ plugins

UGSci 发行适配层
├─ console/src-tauri/src/runtime/
├─ console/src-tauri/src/updater/
├─ scripts/pack-tauri/
└─ .github/workflows/
```

规则：

- 不为打包而移动上游 Python 源码；
- 原业务入口最多保留薄调用层；
- 依赖层由 lockfile 和构建脚本生成，禁止维护第二份手写依赖表；
- UGSci workflow 尽量独立，避免重写上游 workflow；
- 合并上游后必须运行 backend、插件加载和更新契约测试。

## 5. 版本与制品规则

### 5.1 版本

- Desktop 使用统一发行版本，例如 `2.1.1-beta.7`，UI 可显示 `2.1.1b7`。
- 插件、runtime 和工具使用自身版本，不强制与 Desktop 相同。
- Manifest 必须声明平台、架构、channel、最低 core 版本和组件版本。
- 禁止根据文件修改时间推断版本。

### 5.2 不可变对象

以下对象一经发布不得覆盖：

- 带版本号的桌面安装包和 updater archive；
- 组件 full/delta；
- 插件 ZIP；
- 版本化 Manifest 和签名；
- runtime archive。

上传使用 OSS 禁止覆盖语义，发现同名对象时应核对 hash：相同则视为幂等成功，不同则阻断发布。

### 5.3 可变对象

仅以下对象允许切换：

- `latest`；
- `.current.json` signed pointer；
- index；
- channel pointer。

必须先上传 staging 对象、回读验证 size/hash，再切换正式 pointer。pointer 永远最后更新。

## 6. 构建流程

### 6.1 统一入口

生产发布只走：

```text
release.yml
├─ build/verify web and wheel
├─ desktop-build.yml
├─ plugin build
├─ component build
├─ publish immutable artifacts
├─ promote pointers/indexes
└─ publish GitHub Draft Release last
```

桌面单独验证可手动运行 `Desktop Build (reusable)`。正式发布前先创建 Draft Release，再运行 `Release (unified)`。

### 6.2 Windows

目标产物：

```text
UGSci-Desktop-<version>-Windows.zip
├─ Setup.exe
├─ payload/
├─ version.json
├─ checksums.sha256
└─ signature metadata
```

首次安装的 `Setup.exe` 是传统 GUI 安装程序，负责安装位置、PATH、快捷方式、卸载信息和 WebView2 检查。

b7 自动更新不得直接复用隐藏 PowerShell `Expand-Archive`。应由独立更新助手执行解压、替换和回滚。

### 6.3 macOS Apple Silicon

产物包括首次安装 DMG/ZIP 与 Tauri updater archive。生产发布必须要求：

- Tauri signing private key；
- `.app.tar.gz`；
- `.app.tar.gz.sig`；
- updater JSON；
- bundle 签名验证和启动验证。

不构建或发布 `darwin-x86_64`。

### 6.4 runtime 构建

每个 runtime 必须：

1. 固定版本、URL、SHA-256；
2. 下载到临时目录；
3. 校验 hash 后安全解压；
4. 执行最小启动测试；
5. 生成 component metadata；
6. 签名 full/delta 和 Manifest；
7. 原子移动到产物目录。

生产构建禁止 latest、动态 API 解析和无 hash fallback。

## 7. b5 到 b7 迁移

b5 用户不需要卸载或重新安装。迁移顺序：

1. 下载并校验 b7 迁移更新；
2. 启动独立更新助手并确认窗口已显示；
3. 获取系统级单实例更新锁；
4. 备份用户数据、当前安装元数据和 b5 可执行文件；
5. 安装各版本化 runtime、依赖层、backend 和 app；
6. 写入候选 `active.json`；
7. 启动候选 backend，检查端口、版本和基本 API；
8. 验证 bundled plugins、FlowForge、技能、领域工具和专家索引；
9. 原子提交 active pointer；
10. 自动启动 b7；
11. 成功后保留一个可回滚版本并异步清理旧 staging。

任一步失败：恢复原 active pointer、恢复备份并重新启动 b5。失败时更新窗口必须保留，并提供重试、恢复和打开日志。

## 8. 安装阶段 UI

保留现有应用内下载界面。下载完成后的正确交接是：

```text
应用内下载
→ 签名和 hash 校验
→ 启动 UGSci Update Assistant
→ 助手窗口确认可见
→ 旧 UGSci 退出
→ 备份/解压/安装/恢复/健康检查进度
→ 自动启动新版本
→ 助手退出
```

界面至少展示：当前阶段、总体进度、正在处理的组件、日志入口和取消/恢复策略。不得在没有可见接管窗口时退出主程序。

## 9. 插件与组件更新

- 统一通过版本号右侧的升级按钮触发检查和安装；
- Desktop、插件和 runtime 可在同一次检查中返回，但分别按自身版本决策；
- 新插件使用 full 包；已有插件优先使用匹配旧版本的 delta；
- 支持最近 10 个历史版本到当前版本的 delta；
- 未变化插件不重新上传；
- `.uninstalled`、用户插件、市场插件和用户数据不得被 bundled 更新覆盖；
- full fallback 也必须执行备份与 preserve 规则；
- 安装后验证 `plugin.json` 的 ID、版本、entry 和 UI 文件。

## 10. 数据保护

更新前必须备份：

- 工作目录；
- secret/config；
- `engines/`、`data/`、`state/`、`user-data/`、`workspace/`、`models/`；
- active pointer 和安装注册信息；
- 用户自定义插件状态。

备份必须包含版本、时间、来源路径、hash/size 摘要和恢复状态。备份成功之前禁止修改现有安装。

## 11. 日志、锁和缓存

### 11.1 更新锁

使用 OS 级命名 mutex/file lock，锁中记录 PID、开始时间、目标版本和阶段。陈旧锁只能在确认 PID 不存在且 journal 可恢复后清除。

### 11.2 日志

日志写入稳定用户目录，不写在会被删除的 staging 中。至少包含：

- Manifest/pointer ID；
- artifact URL、版本和 SHA-256；
- 各阶段开始/结束/耗时；
- 安装目录与备份目录；
- 退出码、stderr 和回滚结果。

不得记录私钥、token 或用户 secret 内容。

### 11.3 缓存

- artifact 按 SHA-256 content-addressed 保存；
- `.part` 支持断点续传并加下载锁；
- 设置总容量、最大版本数和 LRU 清理；
- 清理孤儿 `.part`、`.lock` 和 staging；
- 安装失败保留最近一次诊断日志和必要制品；
- 安装成功后删除已过期缓存，不删除最后一个回滚版本。

## 12. 断点续跑和 CI 成本

统一发布支持复用成功 run 的 artifacts：

- `artifacts_run_id`：复用整轮制品；
- `windows_artifacts_run_id`；
- `macos_artifacts_run_id`；
- `components_artifacts_run_id`；
- `plugins_artifacts_run_id`。

重试时必须校验来源 workflow、commit SHA、完成状态和 artifact attestation。不得拿其他 commit 的成功产物拼接发布。

b7 后应让 runtime、backend、frontend、plugin 成为独立 build job；未变化层从可信缓存或既有 immutable artifact 复用，避免每次完整重建。

## 13. 发布操作清单

### 13.1 发布前

- [ ] 版本在 Python、Tauri、tag 和 Draft Release 中一致；
- [ ] 工作树和 release commit 已确认；
- [ ] updater/component signing secrets 与公钥匹配；
- [ ] runtime 版本与 SHA-256 固定；
- [ ] Windows x64 和 macOS arm64 构建矩阵正确；
- [ ] 不包含 macOS Intel job；
- [ ] bundled plugins 和 UI 已同步；
- [ ] 数据备份、rollback 和 migration 测试通过；
- [ ] OSS 版本化目标不存在或 hash 完全一致。

### 13.2 构建后

- [ ] 解压制品并核对目录、版本和签名；
- [ ] Windows GUI Setup 实际安装成功；
- [ ] PATH、快捷方式和卸载信息正确；
- [ ] macOS app 可启动且签名验证通过；
- [ ] backend 能连接；
- [ ] FlowForge、插件、技能、领域工具和专家正常加载；
- [ ] 更新按钮可见并可统一检查；
- [ ] b5→b7 更新过程中始终有可见 UI；
- [ ] 成功后自动启动 b7；
- [ ] 人为制造失败时能恢复 b5。

### 13.3 发布顺序

1. 上传 immutable artifacts；
2. 回读检查 size/hash；
3. 上传版本化 Manifest 和签名；
4. 验证远端可下载和签名；
5. 切换 signed pointer/index/latest；
6. 完成端到端更新检查；
7. 最后发布 GitHub Draft Release。

## 14. 踩坑说明与防复发规则

| 踩坑 | 根因 | 防复发规则 |
|---|---|---|
| NSIS compressor error | 压缩器指令插入过晚 | 不修改 Tauri 已生成脚本的压缩阶段；CI 编译真实 installer |
| NSIS/单 EXE 体积压力 | 把所有 runtime 塞入一个制品 | Windows 首装用 ZIP+GUI Setup；更新用组件层 |
| backend module 名尾随空格 | 字符串拼接/引号错误 | 对最终命令数组做精确测试，不只检查脚本文本 |
| 安装后无插件 | bundle 同步或资源声明遗漏 | 构建后验证插件目录、manifest、entry 和 UI |
| Setup 弹 PowerShell | 脚本包装器代替 GUI | 首装和更新助手都必须是 GUI 可执行程序 |
| 更新像闪退 | 旧程序先退出，后台慢解压 | 更新助手窗口先可见，再允许旧程序退出 |
| 两次并发更新 | 只有进程内 guard | 增加跨进程 mutex 和持久 journal |
| Manifest 与签名短暂错配 | 分别覆盖两个可变文件 | 版本化对象 + 单 signed pointer 最后切换 |
| 插件对象冲突 | 对版本化 ZIP 使用 `--force` | immutable upload，hash 相同才幂等跳过 |
| 未变化插件阻断全流程 | 每次都尝试重传 | 按内容/版本判定，无变化复用旧 artifact |
| runtime 构建不可复现 | latest/API 动态解析 | 固定版本、URL、SHA-256，生产禁止 fallback |
| 解压路径穿越 | 直接 `extractall` | containment 校验并拒绝链接和特殊文件 |
| full update 丢用户数据 | preserve 范围过窄 | Manifest preserve + 更新前备份 + migration |
| 构建成功但软件不可用 | 只验证产物存在 | 安装、启动、backend、插件、更新全链路 smoke test |
| 每次失败从头构建 | jobs 耦合且不复用 artifact | 分层 job + attested artifact resume |

## 15. 故障排查入口

遇到更新退出或安装失败，依次检查：

1. 更新助手是否正在运行；
2. `install.lock` 中 PID 是否存在；
3. `update-journal.json` 最后完成阶段；
4. cached artifact 的 size、SHA-256 和签名；
5. staging 是否持续增长；
6. Setup/update assistant 日志；
7. 注册表/应用 bundle 中当前版本；
8. backend 启动日志和健康检查；
9. active pointer 是否提交；
10. rollback 是否执行并重新启动旧版本。

不要把“主窗口消失”等同于进程崩溃；先检查更新助手、后台进程和日志。但 b7 的产品要求是不再让用户自行判断这一点。

## 16. b7 完成定义

- b5 用户无需卸载即可升级 b7；
- 安装阶段始终有可见窗口和进度；
- 同一机器只能运行一个更新任务；
- Python backend 与 runtime/依赖层拆分，无重复冻结环境；
- 高频更新通常不超过 100 MB；
- 插件和 runtime 独立版本、签名、差量和回滚；
- 数据备份失败时禁止安装；
- 安装失败自动恢复 b5；
- 安装成功自动启动 b7并通过健康检查；
- Windows x64、macOS arm64 全链路验证通过；
- GitHub/OSS 发布保持不可变制品和 pointer-last 原则。
# b7 分层构建补充说明

生产桌面构建设置 `QWENPAW_LAYERED_DESKTOP=true`。在此模式下，Windows 和 macOS 构建脚本不会安装或执行 PyInstaller，也不会先生成再删除冻结 backend。独立 CPython 组件只包含解释器和基础工具；应用依赖及数据、文档、石油工程领域库统一安装到版本化的 `python-packages` 组件。

依赖输入为仓库根目录的 `requirements-desktop.lock`。该文件包含固定版本和哈希，CI 使用 `pip --require-hashes` 构建依赖层，组件版本由锁文件 SHA-256 派生。修改 Python 桌面依赖时，应先更新 `requirements-desktop.in`，重新生成并审查锁文件，再提交两者；禁止在生产脚本中临时安装未锁定的大型依赖。

推荐在仓库根目录执行：

```powershell
uv pip compile requirements-desktop.in --generate-hashes --python-version 3.11 --no-emit-package qwenpaw --output-file requirements-desktop.lock
```

必须保留 `--no-emit-package qwenpaw`。QwenPaw backend 会单独构建成 wheel；如果锁文件包含本地项目条目 `.`，`pip --require-hashes` 会因为本地目录没有制品哈希而拒绝生产构建。

非分层模式仍保留旧 PyInstaller 路径，仅用于手动兼容验证，不属于 b7 生产发行链路。Chrome Native Messaging Host 在分层模式下通过 `PYTHONPATH` 使用 `python-packages` 组件，不能把其依赖重新写入 CPython 组件。
