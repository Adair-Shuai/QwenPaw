# QwenPaw 桌面端打包流程审查报告

> 审查日期：2026-07-31
> 审查范围：`.github/workflows/` 中的发布工作流 + `scripts/pack-tauri/` 下全部打包脚本
> 审查方式：静态代码审查（未执行实际构建）

---

## 一、流程总览

项目采用 **Tauri v2 桌面壳 + PyInstaller onedir 后端** 的混合打包方案，发布分为 4 个阶段：

```
release.yml (草稿驱动) ─► desktop-build.yml (prepare) ─► desktop-publish.yml ─► desktop-promote.yml ─► finalize
```

| 阶段 | 工作流 | 职责 |
|---|---|---|
| 编排 | `release.yml` | 草稿驱动、`resolve` 校验 tag 与 `src/qwenpaw/__version__.py` 一致、`finalize` 将 draft 转 published；支持 `dry_run`（fork 安全） |
| 构建 | `desktop-build.yml` | 并行构建 Windows(NSIS) 与 macOS(.app) 桌面包，上传 artifacts |
| 发布 | `desktop-publish.yml` | 上传**版本化文件**到 OSS + GitHub Release |
| 提升 | `desktop-promote.yml` | 版本发布成功后，更新 `latest` 文件、updater manifest（minisign 签名校验）、desktop index |

### 关键设计

- **Windows 单运行时方案**：为规避 NSIS 2GB 限制，Windows 使用 python-build-standalone 单一运行时，而非标准 `.[full]` 依赖集合。
- **macOS 无证书签名**：`sign_macos_bundle.sh` 对 Mach-O 二进制逐个重签 + ad-hoc 签名（无证书时用 `-`），并签名 frameworks 与最终 .app。
- **运行时 stage 脚本**：`stage_python_runtime.py` / `stage_node_runtime.py` / `stage_officecli.py` 分别从 GitHub Releases 拉取 Python/Node/OfficeCLI 运行时。
- **版本一致性**：`sync_tauri_version.mjs` 将 PEP 440 版本转为 semver 写入 `tauri.version.conf.json`。
- **安全护栏**：`verify_build_assets.py` 校验 console dist、插件 bundle、staleness、CSP、插件加载策略；CSP 需允许 `blob:` 与 `http://127.0.0.1:*` 供 WKWebView 插件加载。
- **OSS 缓存策略**：版本化文件 + `latest` 文件 + updater manifest 分阶段发布，避免发布中途用户拉到半成品。

---

## 二、发现的 Bug 与风险

按严重程度排序。

### 🔴 P0 — 阻断风险

#### B1. Windows 构建超时风险（`desktop-build.yml`）
- **位置**：`desktop-build.yml` Windows job，`timeout-minutes: 60`
- **问题**：Windows 端需要先 `npm install`（无锁文件全量安装）、staging Python runtime、`cargo fetch`、PyInstaller 打包、Tauri/NSIS 打包，实际耗时可超 90 分钟，60 分钟超时大概率触发。
- **影响**：Windows 构建失败率高，发布流程不可靠。
- **建议**：提升到 120+ 分钟，或拆分缓存步骤。

#### B2. NSIS 2GB 上限（历史已踩坑，仍有复发风险）
- **位置**：Windows NSIS 打包阶段
- **背景**：曾触发 NSIS "Internal compiler error #12345"（官方已知问题），通过删除 whisper/torch、改用 `.[local,codex,qoder]` 而非 `.[full]`、开启 LZMA 压缩解决。
- **风险**：安装器体积已逼近 2GB 上限，后续新增 Python 依赖随时可能复发。
- **建议**：在 CI 中增加安装器体积断言（如 >1.8GB 即告警）；持续监控依赖增量。

### 🟠 P1 — 高优先级

#### B3. 前端重复构建（`build_macos_pyinstaller.sh`）
- **位置**：`build_macos_pyinstaller.sh`
- **问题**：脚本先手动执行 `npm run build:prod`，随后 `tauri build` 的 `beforeBuildCommand` 又会触发一次构建（Tauri v2 默认配置），导致前端被重复构建两次。
- **影响**：① 构建时间翻倍；② 第二次构建产物覆盖第一次，若 `verify_build_assets.py --strict` 检查 staleness 会生成**误报**（校验的是旧产物时间戳）。
- **建议**：去掉脚本中的手动构建，仅依赖 `beforeBuildCommand`；或将 `beforeBuildCommand` 置空改为脚本显式控制。

#### B4. package-lock.json 平台不一致
- **位置**：Windows/macOS 构建脚本均存在删除 `package-lock.json` 后重新 `npm install` 的逻辑
- **根因**：macOS 生成的锁文件缺少 Windows optional deps（npm 已知问题），导致 Unix/Windows 锁文件无法共用，只能各自全量安装。
- **影响**：① 每次构建都是无锁全量安装，耗时长且不可复现；② `actions/cache` 的 npm 缓存因锁文件被删而失效。
- **建议**：用 `npm ci` 替代 `npm install` 并消除锁文件删除逻辑；如必须支持双平台，维护 `package-lock.json` + `package-lock.win.json` 双锁，或在 CI 中先归一化锁文件。

#### B5. macOS 缺失 Intel 架构产物（`desktop-build.yml` / `build_macos_pyinstaller.sh`）
- **位置**：macOS job / Tauri target 配置
- **问题**：仅构建 `darwin-aarch64` target，无 `darwin-x86_64`，Intel Mac 用户无法更新。
- **影响**：Intel 用户停留在旧版本，无安全补丁通道。
- **建议**：补 Intel target 或明确声明最低支持系统并停止 Intel 分发（需评估用户群体）。

### 🟡 P2 — 中优先级

#### B6. macOS 签名脚本变量展开风险（`sign_macos_bundle.sh`）
- **位置**：`sign_macos_bundle.sh`，`is_inside_framework` 相关行
- **问题**：脚本内联 `${IDENTITY}` 在 `IDENTITY` 未赋值时可能展开为空字符串，导致 `codesign --sign ""`，行为取决于平台（可能失败或签空）。
- **建议**：脚本开头对 `IDENTITY` 做默认值赋值（`IDENTITY="${IDENTITY:--}"`）并加 `set -u` 严格模式；对空值做显式判断。

#### B7. Windows PyInstaller 脚本变量命名不一致（`build_pyinstaller.ps1`）
- **位置**：`build_pyinstaller.ps1`
- **问题**：`$PyRuntimeBin` 与 `$PYTHON_RUNTIME_DIR` 大小写混用，同一语义变量两套命名，易混淆且可能出现空引用。
- **建议**：统一命名并做存在性断言（`if (-not (Test-Path ...)) { throw }`）。

#### B8. `$tauriExit` 检查不完全（`build_win_pyinstaller.ps1`）
- **位置**：`build_win_pyinstaller.ps1` Tauri 构建后的错误处理
- **问题**：`$tauriExit` 失败时存在 fallback 逻辑，可能掩盖真实错误（如 fallback 成功但产物错误、或 fallback 自身吞掉 exit code），导致 CI 绿但产物损坏。
- **建议**：移除静默 fallback；失败即 `exit $LASTEXITCODE`，并在后续步骤校验产物。

#### B9. `stage_python_runtime.py` 默认版本为未来日期
- **位置**：`stage_python_runtime.py`，`DEFAULT_RELEASE = "20260623"`
- **问题**：默认 release tag 是未来日期（当前为 2026-07-31 之前设定），若该 GitHub Release 不存在则依赖 fallback 到 latest，存在隐式漂移——构建结果不固定、不可复现。
- **建议**：将默认版本改为已发布的固定 tag，或改为显式参数必填；删除 fallback 静默行为。

#### B10. 敏感路径硬编码（`build_win_pyinstaller.ps1` / `build_pyinstaller.sh`）
- **位置**：脚本中对 `.venv/.../python` 等路径的硬编码引用
- **问题**：把本机/开发机路径写入脚本，跨环境（CI 镜像更新）易失效。
- **建议**：路径全部由环境变量或参数注入，脚本内做 `Test-Path`/`-f` 校验。

---

## 三、优化空间

| 编号 | 优化点 | 预期收益 | 工作量 |
|---|---|---|---|
| O1 | **去除重复前端构建**（B3） | 构建时间 -30%~50%，消除 staleness 误报 | 小 |
| O2 | **Windows job 超时提升至 120min**（B1） | 降低构建失败率 | 极小 |
| O3 | **缓存 PyInstaller 中间产物**（`build/` 目录、pip 缓存经 actions/cache 持久化） | 二次构建提速显著（依赖重装是主要耗时） | 中 |
| O4 | **锁定 python-build-standalone release 镜像**（B9），不再 fallback latest | 构建可复现，消除隐式漂移 | 小 |
| O5 | **消除锁文件删除逻辑，改用 `npm ci` + 双平台锁文件**（B4） | 可复现构建 + npm 缓存生效 | 中 |
| O6 | **增加断网/下载重试**：stage 脚本统一 retry 策略（如 3 次指数退避） | 降低 GitHub 网络抖动导致的失败 | 小 |
| O7 | **macOS 增加 Intel target 或明确 EOL 声明**（B5） | 覆盖 Intel 用户 | 中（需测试机） |
| O8 | **安装器体积断言**：CI 中校验 NSIS 产物 <1.8GB（B2） | 提前发现 2GB 溢出风险 | 极小 |
| O9 | **CI 产物冒烟测试**：构建后于 runner 上启动 GUI/后端做最小启动验证 | 提前拦截"绿但坏"（配合 B8） | 中 |
| O10 | **统一脚本严格模式**：PS1 加 `$ErrorActionPreference='Stop'`，sh 加 `set -euo pipefail` | 失败即失败，不掩盖错误（配合 B6/B8） | 小 |

---

## 四、总结与建议

1. **架构设计合理**：prepare → publish → promote 三阶段分离、版本化 + latest 文件、dry_run 支持，思路正确，不建议大改。
2. **优先修复 P0/P1**：Windows 超时（B1）与 NSIS 体积（B2）是发布稳定性的头号威胁；重复构建（B3）与锁文件（B4）是时间与可复现性的最大浪费。
3. **低成本高收益**：O1（去重构建）、O2（提超时）、O8（体积断言）、O10（严格模式）均为小改动，建议下一版发布前全部落地。
4. **建议补充 CI 内冒烟测试**（O9），配合严格错误处理，形成"构建 → 冒烟 → 发布"的完整闭环。

---

## 附录：审查文件清单

| 类别 | 文件 |
|---|---|
| 工作流 | `.github/workflows/release.yml`、`desktop-build.yml`、`desktop-publish.yml`、`desktop-promote.yml` |
| 构建脚本 | `build_win_pyinstaller.ps1`、`build_macos_pyinstaller.sh`、`build_pyinstaller.sh`、`build_pyinstaller.ps1`、`qwenpaw.spec` |
| 运行时 stage | `stage_python_runtime.py`、`stage_node_runtime.py`、`stage_officecli.py` |
| 验证/签名 | `verify_build_assets.py`、`sign_macos_bundle.sh` |
| 版本/清单 | `sync_tauri_version.mjs`、`generate_update_manifest.py`、`finalize_tauri_bootstrap.mjs` |
| 插件 UI | `build_plugin_uis.sh`、`build_plugin_uis.ps1` |
