# UGSci 更新管线（Update Pipeline）

本文描述本 fork（基于上游 QwenPaw 二次开发）的核心、插件与应用更新机制，
以及为最小化与上游合并冲突而采用的「分发端点集中」策略。

## 1. 设计原则

1. **端点集中**：所有 UGSci 专属的下载/更新端点集中在两个 fork 自有文件里
   （上游不存在同名文件，upstream merge 永不冲突）：
   - 后端：`src/qwenpaw/distribution.py`
   - 前端：`console/src/distribution.ts`
2. **上游文件只留一行 diff**：被触碰的上游文件只做一次 import + 赋值，
   合并上游时即使冲突也只需保留我们的 import 行。
3. **兼容上游**：上游官方目录（`download.qwenpaw.agentscope.io`）保持为
   第一方可用的第二目录源；上游插件/应用的安装与升级路径不受影响。
4. **签名优先，校验兜底**：UGSci 插件/应用升级优先走 Ed25519 签名组件管线；
   仅当签名路径明确返回「未纳管 / 409」时，才回退到 sha256 校验的热替换。
   网络错误、5xx、以及签名路径已判定最新，都不得热替换。
5. **禁止覆盖成上游核心**：默认不得从公共 PyPI 安装名为 `qwenpaw` 的包。
   未配置自建索引时，`qwenpaw update` 拒绝执行。

## 2. 四条更新通道

| 通道 | 触发方式 | 端点（默认） | 关键代码 |
|------|----------|--------------|----------|
| 核心包（pip 安装） | `qwenpaw update` CLI | `<OSS>/metadata/ugsci-core-latest.json`；无自建索引则拒绝 pip | `src/qwenpaw/cli/update_cmd.py` |
| 桌面端（Tauri） | 启动时/Header 检查 | `<OSS>/metadata/qwenpaw-tauri-latest.json` | `console/src-tauri/tauri.conf.json`、`src/qwenpaw/app/_app.py` |
| Web / 源码版本徽标 | Header 检查 | `/api/version/latest-core` → `<OSS>/metadata/ugsci-core-latest.json` | `src/qwenpaw/app/_app.py`、`console/src/layouts/Header.tsx` |
| 受管组件（签名） | 启动时检查 + 控制台入队 | `<OSS>/metadata/components/stable/<target>.current.json` | `src/qwenpaw/components/{service,update,client}.py` |
| 插件/应用目录 | 控制台插件管理器、应用市场 | `<OSS>/metadata/index.json` → `plugins/index.json`；上游 CDN | `src/qwenpaw/plugins/download_catalog.py`、`console/src/api/modules/plugin.ts` |

`<OSS>` = `https://ugsci-download.oss-cn-beijing.aliyuncs.com`（UGSci-download 桶，可用 `QWENPAW_DOWNLOAD_BASE_URL` / `vars.OSS_BUCKET` 覆盖）。

### 2.1 受管组件（签名管线，UGSci 主通道）

- 清单与工件由 GitHub Actions 用 Ed25519 私钥签名后发布到 OSS
  （工作流：`component-release.yml` / `release.yml` / `desktop-publish.yml`）。
- 客户端用内置公钥验签（`distribution.COMPONENT_PUBLIC_KEY`），
  原子激活 + 回滚 + 数据保留（`update_policy.DEFAULT_PRESERVE_PATHS`）。
- **受管集合自动扩展**：`ComponentUpdateService.check()` 会「收编」签名清单中
  新出现的组件——本地不存在的新插件直接纳管；通过 URL 安装的插件会写入
  `<WORKING_DIR>/components/adopted.json`（见 `set_component_update_adoption`），
  之后同样纳入签名更新。**因此新的 UGSci 插件 / U 系列应用只需发布进签名清单，
  客户端无需改代码。**
- 默认受管集合来自 `plugins/bundle/` + `plugins/apps/` 的 manifest id
  （含 `ugsci`、`ugsci_research`、`uideas`、`ulit`），外加运行时目录组件。

### 2.2 插件/应用目录（双目录）

- 后端 `GET /api/plugins/catalog` 代理 UGSci OSS 目录索引，并计算
  `installed / upgrade_available / 版本兼容性`，同时写入 `channel`
  （缺省为 `ugsci`；显式 `community` 除外）。
- 前端拆成两个视图：UGSci 目录按 `channel` / `author` 过滤
  （`isUGSciCatalogPlugin` / `is_ugsci_catalog_plugin`，**没有硬编码 ID 列表**）
  与上游 QwenPaw 目录（浏览器直连上游 CDN）。
- **升级路径**（`upgradeInstalledUGSciPlugin`，`console/src/api/modules/plugin.ts`）：
  1. 首选 `POST /api/components/<id>/install` —— 签名组件更新，重启时生效；
  2. 仅当组件明确未纳管（HTTP 409 且消息匹配 `not managed`）时，
     回退 `POST /api/plugins/replace`。UGSci OSS 主机必须携带 64 位 hex sha256。
- `/api/plugins/replace` 的主机白名单来自
  `distribution.EXTERNAL_PLUGIN_UPGRADE_HOSTS`：上游两个官方主机 + UGSci OSS 主机。

### 2.3 桌面端（Tauri）

- 发布：`desktop-publish.yml` 上传 dmg/nsis + 签名 latest.json 到 OSS；
  `desktop-promote.yml` 提升 `metadata/qwenpaw-tauri-latest.json`。
- 后端 `/api/version/latest` 读桌面清单；Web Header **不**读该清单。

### 2.4 核心包（CLI / Web）

- 版本广告：`distribution.CORE_UPDATE_MANIFEST_URL`
  （`<OSS>/metadata/ugsci-core-latest.json`），由 `release.yml`
  `promote-release-metadata` 从 `__version__.py` 写出。
- Web / pip / 源码安装走 `/api/version/latest-core`；桌面安装器仍走 Tauri 清单。
  核心清单缺失（404）视为无更新，避免误显示桌面构建号。
- `qwenpaw update` 用上述核心清单比较版本。真正执行 pip/uv 前必须同时配置
  非公共 PyPI 的 `QWENPAW_PYPI_JSON_URL` 与 `QWENPAW_PIP_INDEX_URL`。
  默认拒绝，以免把 UGSci fork 覆盖成上游公共包 `qwenpaw`。
- Header 更新说明（`UPDATE_MD`）只给桌面 / 源码 / 自建索引三条路径，
  不再引导 `docker pull agentscope/qwenpaw` 或公共 PyPI。

## 3. 环境变量总览

| 变量 | 作用 | 默认 |
|------|------|------|
| `QWENPAW_DOWNLOAD_BASE_URL`（或 `UGSCI_DOWNLOAD_BASE_URL`） | 整体切换 OSS 根地址（目录/组件/桌面清单/核心清单/模型镜像全部随之改变） | UGSci-download OSS |
| `QWENPAW_CORE_UPDATE_MANIFEST_URL` | 覆盖核心版本清单 | `<OSS>/metadata/ugsci-core-latest.json` |
| `QWENPAW_COMPONENT_MANIFEST_URL` | 覆盖完整签名清单 URL | `<OSS>/metadata/components/stable/<target>.current.json` |
| `QWENPAW_COMPONENT_PUBLIC_KEY` | 覆盖验签公钥（测试用） | 内置公钥 |
| `QWENPAW_COMPONENT_MANAGED` | 覆盖受管组件集合 | bundled 插件 + apps + `backend/python-runtime` 等 |
| `QWENPAW_COMPONENT_ALLOWED_HOSTS` | 工件下载主机白名单 | 清单主机 |
| `QWENPAW_COMPONENT_UPDATES` | `off` 时禁用组件更新 | 开 |
| `QWENPAW_PYPI_JSON_URL` / `QWENPAW_PIP_INDEX_URL` / `QWENPAW_PYPI_PACKAGE_NAME` | 自建核心包索引；两者都指向非公共 PyPI 才允许 `qwenpaw update` | 空（拒绝公共 PyPI） |
| `VITE_UGSCI_DOWNLOAD_BASE_URL` | 前端构建期覆盖 OSS 根地址 | 同上 |
| GitHub Actions `vars.OSS_BUCKET` / `vars.OSS_ENDPOINT` | 发布桶参数化 | `ugsci-download` |

`GET /api/version` 同时返回 `download_base_url`，供前端与后端对齐下载根。

## 4. 与上游合并的策略

fork 自有文件（永不冲突）：`src/qwenpaw/distribution.py`、
`console/src/distribution.ts`、本文档、`tests/unit/test_distribution.py`。

被改为一行引用的上游文件（冲突时保留 import 行即可）：

| 上游文件 | 引用值 |
|----------|--------|
| `src/qwenpaw/plugins/download_catalog.py` | `PLUGIN_DOWNLOAD_CDN`、`is_ugsci_catalog_plugin` |
| `src/qwenpaw/components/service.py` | `COMPONENT_BASE_URL`、`COMPONENT_PUBLIC_KEY` |
| `src/qwenpaw/app/_app.py` | `DESKTOP_UPDATE_MANIFEST_URL`、`CORE_UPDATE_MANIFEST_URL` |
| `src/qwenpaw/local_models/manager.py` | `LLAMA_CPP_DOWNLOAD_BASE_URL` |
| `src/qwenpaw/cli/update_cmd.py` | `PYPI_JSON_URL`、`PYPI_PACKAGE_NAME`、`PIP_INDEX_URL` |
| `src/qwenpaw/app/routers/plugins.py` | `EXTERNAL_PLUGIN_UPGRADE_HOSTS`、`upgrade_source_requires_digest` |
| `console/src/layouts/constants.ts` | `DESKTOP_UPDATE_MANIFEST_URL`（re-export） |
| `console/src/api/modules/plugin.ts` | `UPSTREAM_PLUGIN_CDN`、`isUGSciCatalogPlugin` |

合并上游后自检：

```bash
uv run --extra test pytest tests/unit/test_distribution.py \
  tests/unit/cli/test_cli_update.py \
  tests/unit/plugins/test_download_catalog.py \
  tests/unit/tauri/test_component_service.py \
  tests/unit/app/routers/test_plugins_router.py \
  tests/unit/app/test_desktop_update_manifest.py \
  tests/unit/verify/test_release_workflow_safety.py -q
cd console && npx tsc -b --noEmit && npm run test:run -- src/api/modules/plugin.test.ts src/layouts/constants.test.ts src/distribution.test.ts
```

## 5. 发布一个新的 UGSci 插件/应用（速查）

1. 在 `plugins/bundle/<id>/` 或 `plugins/apps/<id>/` 编写 `plugin.json`
   （含 `qwenpaw_version` 兼容范围；`author` 建议含 UGSci，或显式
   `"channel": "ugsci"`）。
2. 走组件发布工作流：打 zip、签名、更新签名清单并上传 OSS
   （`component-release.yml` 会 stage `bundle` + `apps`，U 系列会进入签名管线）。
3. 更新 OSS 目录索引 `metadata/plugins/index.json`（`generate_plugin_metadata.py`
   默认写入 `channel: ugsci` 以及 `sha256`、`url`、`qwenpaw_version`）。
4. **不必**把新 ID 写进前端白名单。UGSci 目录页按 `channel` / `author` 过滤。
5. 客户端无需发版：签名清单自动收编该组件（见 2.1）。

## 6. 运维备忘（给后续改发布/更新链路的人）

这些不是再改 YAML 的任务，而是发布与清理时必须记住的约束：

1. **核心清单要正式发布才会上 OSS。** `metadata/ugsci-core-latest.json` 由
   `release.yml` 的 `promote-release-metadata` 写出。工作区里的 workflow
   改动必须进仓库，并且跑完一次正式 release，OSS 上才会有这份文件。
   在那之前，Web / CLI 探测会把 404 当成「没有更新」；桌面 Tauri 不受影响
   （桌面仍读 `metadata/qwenpaw-tauri-latest.json`）。
2. **不要用 `publish-pypi.yml` 把本 fork 发成公共 PyPI 上的 `qwenpaw`。**
   该 workflow 仍可手动推公共 PyPI。客户端默认已拒绝从公共 `qwenpaw` 升级，
   但把 fork 发成上游同名包仍会污染公共索引。自建索引才是 pip 升级的正路。
3. **清理工作流目前不会误删核心清单。** `oss-cleanup.yml` 只扫桌面
   `files/apps/desktop/` 与 `metadata/apps/desktop/`。
   `ugsci-core-latest.json` 在 `metadata/` 根下，不在清理范围内。
   以后若把清理范围扩到整个 `metadata/`，必须把
   `ugsci-core-latest.json` 和 `qwenpaw-tauri-latest.json` 都加入保留名单。
4. **桌面 updater 端点不要改成核心清单。** 仓库变量
   `TAURI_UPDATER_ENDPOINTS` 必须继续指向
   `qwenpaw-tauri-latest.json`，不要改成 `ugsci-core-latest.json`。
