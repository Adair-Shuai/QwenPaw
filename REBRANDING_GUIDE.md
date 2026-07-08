# UGSci 换标与定制化指南

本文档记录了将 QwenPaw 换标为 UGSci（地下储气库领域桌面 Agent）所做的全部修改，以及项目提供的编译时/运行时可配置项，供后续维护和上游同步参考。

---

## 1. 换标策略

### 核心原则：只改用户可见层，不改内部标识符

为保证 `Custom` 分支能持续 `git merge` 上游 `main` 分支的更新，我们采用 **最小侵入换标策略**：

| 类别 | 是否修改 | 原因 |
|------|----------|------|
| **用户可见的显示名称**（UI 文本、窗口标题、登录页、文档） | ✅ 修改 | 用户直接看到的品牌名 |
| **Python 包名/模块路径** (`qwenpaw`) | ❌ 不修改 | 改动涉及数百个文件和 import 路径，merge 冲突极大 |
| **CLI 命令名** (`qwenpaw`) | ❌ 不修改 | 改动影响 `pyproject.toml` scripts、shell 脚本、用户已安装的命令 |
| **环境变量前缀** (`QWENPAW_`) | ❌ 不修改 | 改动影响所有配置解析逻辑，且与 `COPAW_` 遗留兼容链耦合 |
| **Tauri identifier** (`io.agentscope.qwenpaw.desktop`) | ❌ 不修改 | 改变 identifier 会导致已安装版本无法升级 |
| **Rust crate 名** (`qwenpaw-desktop`) | ❌ 不修改 | 改动涉及 `Cargo.toml`、`Cargo.lock`、构建脚本 |
| **Agent ID** (`QwenPaw_QA_Agent_0.2`) | ❌ 不修改 | 已持久化在用户的 `config.json` / `agent.json` 中，改动会丢失配置 |

### 上游同步方法

```bash
# 添加上游远程（如果尚未添加）
git remote add upstream https://github.com/agentscope-ai/QwenPaw.git

# 拉取上游最新代码
git fetch upstream

# 切换到 Custom 分支并合并上游 main
git checkout Custom
git merge upstream/main

# 如果有冲突，通常只在以下文件中出现：
# - src/qwenpaw/constant.py        → PROJECT_NAME 行
# - console/src/locales/*.json     → 翻译文本中的品牌名
# - console/src-tauri/tauri.conf.json → 产品名/窗口标题
# 解决冲突时保持 UGSci 品牌名即可
```

---

## 2. 已修改的文件清单

### 2.1 Python 后端

| 文件 | 修改内容 |
|------|----------|
| `src/qwenpaw/constant.py` | `PROJECT_NAME` 改为通过 `QWENPAW_BRAND_NAME` 环境变量覆盖，默认值 `UGSci` |
| `src/qwenpaw/market/providers/qwenpaw.py` | 技能商店 provider label 从 `"QwenPaw"` 改为 `"UGSci"` |
| `src/qwenpaw/utils/telemetry.py` | docstring 中的品牌名 |
| `src/qwenpaw/agents/md_files/**/*.md` | QA Agent 人格文件（SOUL.md、PROFILE.md）中的品牌名 |
| `Makefile` | 注释中的品牌名 |
| `pyproject.toml` | `description` 字段中的品牌名（包名 `qwenpaw` 保留不变） |

### 2.2 Tauri 桌面端

| 文件 | 修改内容 |
|------|----------|
| `console/src-tauri/tauri.conf.json` | `productName` → `"UGSci Desktop"`，窗口 `title` → `"UGSci Desktop"` |
| `console/src-tauri/Cargo.toml` | `description` 字段 |
| `console/src-tauri/src/tray.rs` | 系统托盘 tooltip |
| `console/src-tauri/src/lib.rs` | 启动错误日志前缀 |
| `console/tauri.html` | `<title>` 标签 |
| `console/index.html` | `<title>` 标签 |

### 2.3 前端 Console

| 文件 | 修改内容 |
|------|----------|
| `console/src/locales/*.json` | 所有 7 种语言的 UI 翻译文本中的品牌名 |
| `console/src/layouts/constants.ts` | `UPDATE_MD` 更新说明文本中的品牌名 |
| `console/src/layouts/Header.tsx` | 正则匹配模式 + logo alt 文本 |
| `console/src/pages/Login/index.tsx` | 登录页 logo alt 文本 |
| `console/src/pages/Chat/index.tsx` | 默认聊天昵称 |
| `console/src/pages/Chat/OptionsPanel/defaultConfig.ts` | 默认标题 |
| `console/src/pages/Settings/Market/components/SkillIcon.tsx` | 技能商店 source label 和 fallback letter |
| `console/src/pages/Settings/PluginManager/components/MarketPluginList.tsx` | 插件兼容性标签 |
| `console/src/pages/Control/Channels/components/ChannelDrawer.tsx` | 变量名 `isQwenPawDoc` → `isUGSciDoc` |
| `console/src/tauri/BackendLoadingPage.tsx` | 加载页 logo alt 文本 |
| `console/src/api/modules/pluginMarket.ts` | 注释中的品牌名 |

### 2.4 测试

| 文件 | 修改内容 |
|------|----------|
| `e2e/pages/agent_stats_page.py` | `PAGE_TITLE` |

---

## 3. 编译时可配置的环境变量

以下环境变量可以在 **编译时**（构建桌面端时）或 **启动前** 设置，用于定制 UGSci 的行为：

### 3.1 品牌与显示

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `QWENPAW_BRAND_NAME` | `UGSci` | 产品显示名称。影响后端 API 返回的 `PROJECT_NAME`，可在运行时覆盖 |

### 3.2 工作目录与文件路径

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `QWENPAW_WORKING_DIR` | `~/.qwenpaw` | 主工作目录（存储 config.json、workspaces 等） |
| `QWENPAW_SECRET_DIR` | `{WORKING_DIR}.secret` | 密钥存储目录 |
| `QWENPAW_BACKUP_DIR` | `{WORKING_DIR}.backups` | 备份目录 |
| `QWENPAW_CONFIG_FILE` | `config.json` | 全局配置文件名 |
| `QWENPAW_JOBS_FILE` | `jobs.json` | 定时任务文件名 |
| `QWENPAW_CHATS_FILE` | `chats.json` | 聊天记录文件名 |
| `QWENPAW_TOKEN_USAGE_FILE` | `token_usage.json` | Token 用量统计文件名 |
| `QWENPAW_HEARTBEAT_FILE` | `HEARTBEAT.md` | 心跳文件名 |
| `QWENPAW_DEBUG_HISTORY_FILE` | `debug_history.jsonl` | 调试历史文件名 |
| `QWENPAW_KEYRING_ACCOUNT` | - | OS keychain 中主密钥的账户名 |

### 3.3 网络与服务

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `QWENPAW_DESKTOP_PORT` | 自动分配 | 桌面端后端固定端口 |
| `QWENPAW_CORS_ORIGINS` | 空（不启用） | CORS 允许的源，逗号分隔。如 `"http://localhost:5173"` |
| `QWENPAW_RUNNING_IN_CONTAINER` | `false` | 是否运行在容器中（影响安装方式检测） |
| `QWENPAW_OPENAPI_DOCS` | `false` | 是否暴露 `/docs`、`/redoc`、`/openapi.json` |
| `QWENPAW_UPLOAD_MAX_SIZE_MB` | 无限制 | 上传文件大小限制（MB） |

### 3.4 LLM 调用控制

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `QWENPAW_LLM_MAX_RETRIES` | `3` | LLM API 调用最大重试次数 |
| `QWENPAW_LLM_BACKOFF_BASE` | `1.0` | 重试退避基准时间（秒） |
| `QWENPAW_LLM_BACKOFF_CAP` | `10.0` | 重试退避上限（秒） |
| `QWENPAW_LLM_MAX_CONCURRENT` | `10` | LLM 最大并发调用数 |
| `QWENPAW_LLM_MAX_QPM` | `600` | 每分钟最大查询数（0=不限制） |
| `QWENPAW_LLM_RATE_LIMIT_PAUSE` | `5.0` | 429 时的默认暂停时间（秒） |
| `QWENPAW_LLM_RATE_LIMIT_JITTER` | `1.0` | 暂停后的随机抖动（秒） |
| `QWENPAW_LLM_ACQUIRE_TIMEOUT` | `300.0` | 获取并发槽位的超时时间（秒） |
| `QWENPAW_MODEL_PROVIDER_CHECK_TIMEOUT` | `5.0` | 模型提供商可达性检查超时（秒） |

### 3.5 记忆与上下文

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `QWENPAW_MEMORY_COMPACT_KEEP_RECENT` | `3` | 记忆压缩时保留的最近消息轮数 |
| `QWENPAW_MEMORY_COMPACT_RATIO` | `0.7` | 记忆压缩比率 |

### 3.6 工具守卫

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `QWENPAW_TOOL_GUARD_APPROVAL_TIMEOUT_SECONDS` | `300` | 工具审批超时（秒） |
| `QWENPAW_TOOL_GUARD_APPROVAL_HEARTBEAT_INTERVAL` | `15` | 审批等待时的心跳间隔（秒） |

### 3.7 技能商店 Hub

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `QWENPAW_SKILLS_HUB_BASE_URL` | `https://clawhub.ai` | 技能 Hub 基础 URL（**可改为自己的技能商店**） |
| `QWENPAW_SKILLS_HUB_SEARCH_PATH` | `/api/v1/search` | 搜索路径 |
| `QWENPAW_SKILLS_HUB_VERSION_PATH` | `/api/v1/skills/{slug}/versions/{version}` | 版本查询路径 |
| `QWENPAW_SKILLS_HUB_DETAIL_PATH` | `/api/v1/skills/{slug}` | 技能详情路径 |
| `QWENPAW_SKILLS_HUB_FILE_PATH` | `/api/v1/skills/{slug}/file` | 技能文件下载路径 |
| `QWENPAW_SKILLS_HUB_HTTP_TIMEOUT` | `30` | Hub HTTP 请求超时（秒） |
| `QWENPAW_SKILLS_HUB_HTTP_RETRIES` | `3` | Hub HTTP 请求重试次数 |
| `QWENPAW_SKILLS_HUB_HTTP_BACKOFF_BASE` | `0.8` | Hub HTTP 退避基准 |
| `QWENPAW_SKILLS_HUB_HTTP_BACKOFF_CAP` | `6` | Hub HTTP 退避上限 |
| `QWENPAW_GITHUB_CACHE_TTL` | - | GitHub API 缓存 TTL（秒） |
| `QWENPAW_SKILL_CONFIG_{SKILL_NAME}` | - | 单个技能的完整 JSON 配置 |

### 3.8 日志与调试

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `QWENPAW_LOG_LEVEL` | - | 日志级别（DEBUG/INFO/WARNING/ERROR） |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | - | Playwright Chromium 路径（Docker 环境用） |

---

## 4. 可定制的外部链接

以下链接散布在代码中，换标后可能需要改为自己的服务：

### 4.1 文档站（高优先级）

| 当前 URL | 所在文件 | 用途 | 修改建议 |
|----------|----------|------|----------|
| `https://qwenpaw.agentscope.io/docs/...` | `console/src/layouts/constants.ts` | 前端文档链接 | 改为自己的文档站 URL |
| `https://qwenpaw.agentscope.io/docs/channels/...` | `console/src/pages/Control/Channels/components/ChannelDrawer.tsx` | 频道配置文档 | 改为自己的文档站 URL |
| `https://qwenpaw.agentscope.io/docs/acp-integration` | `console/src/pages/Agent/ACP/components/ACPDrawer.tsx` | ACP 集成文档 | 改为自己的文档站 URL |
| `https://qwenpaw.agentscope.io/docs/faq` | `console/src/layouts/constants.ts` | FAQ 页面 | 改为自己的文档站 URL |
| `https://qwenpaw.agentscope.io/release-notes` | `console/src/layouts/constants.ts` | 发布说明 | 改为自己的发布说明 URL |

**建议做法**：在 `constants.ts` 中添加一个 `DOCS_BASE_URL` 常量，统一管理所有文档链接：
```typescript
export const DOCS_BASE_URL = "https://your-docs.ugsci.com";
export const getDocsUrl = (lang: string): string =>
  `${DOCS_BASE_URL}/docs/intro?lang=${getWebsiteLang(lang)}`;
```

### 4.2 下载与更新服务

| 当前 URL | 所在文件 | 用途 | 修改建议 |
|----------|----------|------|----------|
| `https://download.qwenpaw.agentscope.io` | `src/qwenpaw/plugins/download_catalog.py` (`PLUGIN_DOWNLOAD_CDN`) | 插件下载 CDN | 改为自己的 CDN |
| `https://download.qwenpaw.agentscope.io/files/models/llama_cpp` | `src/qwenpaw/local_models/manager.py` | 本地模型下载 | 改为自己的模型仓库 |
| `https://pypi.org/pypi/qwenpaw/json` | `src/qwenpaw/cli/update_cmd.py` (`_PYPI_JSON_URL`) | 版本检查 | 如自建 PyPI 仓库则修改 |
| `https://pypi.org/pypi/qwenpaw/json` | `console/src/layouts/constants.ts` (`PYPI_URL`) | 前端版本检查 | 同上 |
| Tauri updater endpoints | `console/src-tauri/tauri.conf.json` | 桌面端自动更新 | 改为自己的更新服务器 |

### 4.3 技能商店 Market Providers

项目内置了 4 个技能商店 provider，定义在 `src/qwenpaw/market/providers/` 中：

| Provider | 当前 Base URL | 所在文件 | 说明 |
|----------|---------------|----------|------|
| `qwenpaw` (现为 UGSci) | `https://platform.agentscope.io` | `providers/qwenpaw.py` | 官方技能平台 |
| `clawhub` | `https://clawhub.ai` | `providers/clawhub.py` | ClawHub 社区 |
| `modelscope` | `https://www.modelscope.cn` | `providers/modelscope.py` | ModelScope |
| `aliyun` | `https://api.aliyun.com` | `providers/aliyun.py` | 阿里云 AgentExplorer |

**定制方式**：
1. **修改现有 provider 的 URL**：直接修改对应 provider 文件中的 `_BASE_URL`
2. **通过环境变量配置 Hub**：使用 `QWENPAW_SKILLS_HUB_BASE_URL` 等环境变量覆盖 ClawHub 的 URL
3. **禁用不需要的 provider**：在 `providers/__init__.py` 中注释掉不需要的 provider
4. **添加自己的 provider**：新建一个 provider 文件，实现 `MarketProvider` 接口，然后在 `__init__.py` 中注册

### 4.4 遥测

| 当前 URL | 所在文件 | 说明 |
|----------|----------|------|
| `https://qwenpawelemetry-sukzkbfzhc.ap-southeast-1.fcapp.run` | `src/qwenpaw/utils/telemetry.py` (`TELEMETRY_ENDPOINT`) | 安装遥测上报 |

**禁用方法**：遥测只在首次安装时触发一次，可通过设置 `TELEMETRY_MARKER_FILE` 或在网络层面屏蔽该域名。如需完全禁用，可在 `telemetry.py` 中将 `TELEMETRY_ENDPOINT` 改为空字符串。

### 4.5 GitHub 仓库

| 当前 URL | 所在文件 | 说明 |
|----------|----------|------|
| `https://github.com/agentscope-ai/QwenPaw` | `console/src/layouts/constants.ts` (`GITHUB_URL`) | 前端 GitHub 链接 |

**建议**：保留上游 GitHub URL 用于跟踪更新，或改为自己的 fork 仓库地址。

---

## 5. 编译时添加定制内容

### 5.1 添加定制 Skill

**完全可行**，有两种方式：

#### 方式 A：内置到源码中（推荐，编译时生效）

将技能目录放到 `src/qwenpaw/agents/skills/` 下：

```
src/qwenpaw/agents/skills/
├── ug-gas-injection/          # 你的定制技能
│   ├── SKILL.md               # 技能定义（YAML front matter + Markdown）
│   ├── references/            # 参考文档
│   └── scripts/               # 脚本
├── guidance-zh/               # 已有技能
├── guidance-en/
└── ...
```

每个技能需要一个 `SKILL.md` 文件：
```markdown
---
name: ug-gas-injection
description: 地下储气库注气采气方案设计
metadata:
  requires:
    env: [GAS_API_KEY]
---

## 技能说明
...
```

PyInstaller 打包时会通过 `qwenpaw.spec` 中的 `collect_tree` 自动收集 `agents/skills` 目录。

#### 方式 B：通过插件系统注入

参考 `plugins/bundle/cloudpaw/plugin.py` 中的 `_install_plugin_skills()` 方法，在插件启动时将技能复制到技能池中。

#### 方式 C：预置到技能池

在构建脚本中，于 PyInstaller 打包前将技能文件复制到 `~/.qwenpaw/skill_pool/` 目录。

### 5.2 添加定制 MCP 服务

**完全可行**，有三种方式：

#### 方式 A：修改默认 MCP 配置

在 `src/qwenpaw/config/config.py` 的 `MCPConfig` 类中修改默认 `clients` 字典：

```python
class MCPConfig(BaseModel):
    clients: Dict[str, MCPClientConfig] = Field(
        default_factory=lambda: {
            "tavily_search": MCPClientConfig(...),
            # 添加你的定制 MCP
            "ug_data_service": MCPClientConfig(
                name="ug_data_service",
                description="地下储气库数据服务",
                enabled=True,
                transport="streamable_http",
                url="https://your-mcp-server.ugsci.com/mcp",
            ),
        },
    )
```

#### 方式 B：通过插件系统注册

在插件 `hooks.py` 的 `on_agent_build` hook 中动态注册 MCP 客户端。

#### 方式 C：预置 MCP 配置

在首次启动的初始化逻辑中（`src/qwenpaw/cli/init_cmd.py`），将定制 MCP 配置写入用户的 `config.json`。

### 5.3 添加定制智能体（Agent）

**完全可行**，有三种方式：

#### 方式 A：内置 Agent 配置

在 `src/qwenpaw/constant.py` 中添加内置 Agent 定义：

```python
BUILTIN_UG_AGENT_ID = "UGSci_Reservoir_Agent_1.0"
BUILTIN_UG_AGENT_NAME = "储气库 Agent"
BUILTIN_UG_AGENT_SKILL_NAMES = (
    "ug-gas-injection",
    "ug-reservoir-analysis",
    "guidance",
)
```

然后在初始化逻辑中注册该 Agent（参考 `BUILTIN_QA_AGENT_ID` 的使用方式）。

#### 方式 B：通过插件系统注入

参考 `plugins/bundle/cloudpaw/agents_setup.py`，在插件中定义 Agent 规格（spec），包括：
- `agent_id`：Agent 唯一标识
- `name`：显示名称
- `description`：描述
- `skill_names`：绑定的技能列表
- `persona_pack`：人格文件
- `extra_tools`：额外工具
- `acp_agent`：ACP 外部 Agent 配置

#### 方式 C：预置 Agent 工作空间

在构建时将预配置好的 Agent 工作空间（包括 `agent.json`、`SOUL.md`、`PROFILE.md` 等）打包到应用中，首次启动时复制到用户的 `~/.qwenpaw/workspaces/` 目录。

### 5.4 添加定制工具（Tool）

参考 `plugins/bundle/cloudpaw/tools/` 的实现方式：

1. 在插件目录下创建 `tools/` 子目录
2. 实现工具函数（使用 `@tool` 装饰器或直接定义函数）
3. 在插件的 `hooks.py` 中通过 `on_toolkit_build` hook 注册工具

### 5.5 添加定制前端页面

参考 `plugins/bundle/cloudpaw/ui/` 的实现方式：

1. 在插件目录下创建 `ui/` 子目录
2. 使用 React 编写前端组件
3. 通过 Vite 构建为 `dist/index.js`
4. 在 `plugin.json` 的 `entry.frontend` 中指定入口

---

## 6. 推荐的 UGSci 定制化清单

以下是针对地下储气库领域推荐的定制化步骤：

### 6.1 必做项

- [ ] 替换 Logo：将 `console/public/qwenpaw.png`、`logo-dark.svg`、`logo-light.svg` 替换为 UGSci 品牌图标
- [ ] 替换 Tauri 图标：重新运行 `npx tauri icon path/to/ugsci-icon.svg`
- [ ] 修改文档链接：将 `qwenpaw.agentscope.io` 替换为自己的文档站
- [ ] 禁用或修改遥测端点

### 6.2 领域定制项

- [ ] 创建地下储气库领域技能（如注气采气方案、库容计算、地质评价等）
- [ ] 配置领域 MCP 服务（如连接储气库数据库、地质建模工具等）
- [ ] 创建领域专业 Agent（预置领域知识和工作流）
- [ ] 修改 Agent 人格文件（SOUL.md）以匹配领域语气和专业性
- [ ] 配置领域工具（如数据查询、可视化、报告生成等）

### 6.3 可选优化项

- [ ] 修改 Tauri identifier（如 `com.ugsci.desktop`）——注意这会阻止已安装版本升级
- [ ] 修改 PyPI 发布名称——注意需要同步修改 `pyproject.toml` 和所有 import 路径
- [ ] 配置自动更新服务器
- [ ] 配置自己的技能商店

---

## 7. 构建命令速查

```bash
# 1. 安装依赖
cd console && npm install && cd ..
uv venv .venv --python python3.11
uv pip install --python .venv/bin/python -e ".[full]"
uv pip install --python .venv/bin/python "pyinstaller>=6.0.0"

# 2. 生成 Tauri 图标
cd console && npx tauri icon ../scripts/pack/assets/icon.svg

# 3. 同步版本号
node ../scripts/pack-tauri/sync_tauri_version.mjs

# 4. 构建前端
npm run build:prod

# 5. 构建 PyInstaller 后端
cd .. && bash scripts/pack-tauri/build_pyinstaller.sh

# 6. 签名后端（macOS ad-hoc）
bash scripts/pack-tauri/sign_macos_bundle.sh console/src-tauri/binaries/qwenpaw-backend "-"

# 7. 构建 Tauri 桌面端
cd console && npx tauri build --config src-tauri/tauri.version.conf.json --bundles app

# 8. 签名最终应用
cd .. && bash scripts/pack-tauri/sign_macos_bundle.sh \
  "console/src-tauri/target/release/bundle/macos/UGSci Desktop.app" "-"
```

或直接使用一键构建脚本：
```bash
APPLE_SIGNING_IDENTITY="-" bash scripts/pack-tauri/build_macos_pyinstaller.sh
```
