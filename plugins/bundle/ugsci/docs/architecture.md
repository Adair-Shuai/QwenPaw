# 架构设计

## 总体架构

UGSci 是一个 QwenPaw 插件，由前端（TypeScript/React）和后端（Python/FastAPI）两部分组成，通过 QwenPaw 插件 API 进行注册和通信。

```
┌─────────────────────────────────────────────────────────┐
│                    QwenPaw 主应用                         │
│                                                          │
│  ┌──────────────┐     ┌───────────────────────────────┐ │
│  │  前端 Console  │     │      后端 FastAPI              │ │
│  │  (React)      │     │                                │ │
│  │               │     │  ┌──────────────────────────┐  │ │
│  │  ┌─────────┐  │     │  │  UGSci Backend           │  │ │
│  │  │ UGSci   │  │     │  │  (plugin.py)             │  │ │
│  │  │ Frontend│  │     │  │                          │  │ │
│  │  │ (index  │  │     │  │  · 技能池同步钩子          │  │ │
│  │  │  .js)   │  │     │  │  · 软件检测 HTTP 路由      │  │ │
│  │  └────┬────┘  │     │  │  · 卸载清理钩子            │  │ │
│  │       │       │     │  └──────────────────────────┘  │ │
│  │       │       │     │                                │ │
│  │  ┌────▼────┐  │     │  ┌──────────────────────────┐  │ │
│  │  │ QwenPaw│  │     │  │  QwenPaw Core API         │  │ │
│  │  │ Plugin │  │     │  │  · /agents                │  │ │
│  │  │ API    │  │     │  │  · /skills                │  │ │
│  │  │(window.│◄─┼─────┼──│  · /mcp                   │  │ │
│  │  │ QwenPaw│  │ HTTP│  │  · /market/*               │  │ │
│  │  │ )      │  │ 请求 │  │  · /console/chat          │  │ │
│  │  └─────────┘  │     │  └──────────────────────────┘  │ │
│  └──────────────┘     └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 前端架构

### 注册机制

前端通过 `window.QwenPaw` 全局对象与宿主通信，核心 API：

| API | 用途 |
|-----|------|
| `QP.route.add(pluginId, config)` | 注册前端路由 |
| `QP.menu.add(pluginId, config)` | 注册侧边栏菜单项 |
| `QP.menu.replace(pluginId, itemId, config)` | 替换（隐藏）已有菜单项 |
| `QP.menu.snapshot(location)` | 获取某个 location 下的菜单快照 |
| `QP.sidebar.registerSimpleModeItems(ids)` | 注册 Simple Mode 可见项 |
| `host.React` / `host.antd` / `host.antdIcons` | 宿主提供的 React 和 Ant Design |
| `host.getApiUrl(path)` / `host.getApiToken()` | API 地址和认证令牌 |
| `host.setSelectedAgent(agentId)` | 设置当前选中的 Agent |
| `host.ReactMarkdown` / `host.remarkGfm` | Markdown 渲染 |

### 启动流程

```
浏览器加载 index.js (ES module)
        │
        ▼
检测 window.QwenPaw.host 是否可用
        │
   ┌────┴────┐
   │ 可用     │ 不可用 → 每 200ms 轮询，10s 后超时
   └────┬────┘
        │
        ▼
  tryBuildPlugin()
        │
        ▼
  buildPlugin() ─── 注册 4 条路由 + 4 个菜单项
        │            注册 Simple Mode 白名单
        │            隐藏 7 个内置菜单项（仅 Simple Mode）
        │
        ▼
  注册完成，页面可用
```

### 路由与菜单注册

```typescript
// 路由注册示例
QP.route.add(PLUGIN_ID, {
  id: "ugsci.experts",
  path: "/ugsci-experts",
  component: ExpertCenterPage,
});

// 菜单注册示例
QP.menu.add(PLUGIN_ID, {
  id: "ugsci.experts",
  location: "primary.agentScoped",
  label: () => "专家中心",
  icon: React.createElement("span", { style: { fontSize: 16 } }, "🧑‍🔬"),
  route: "ugsci.experts",
  order: 5,
  visible: () => isSimpleMode(),
});
```

### Simple Mode vs Full Mode

插件通过 `localStorage.getItem("qwenpaw_sidebar_mode")` 判断当前模式：

- **Simple Mode** (`simple`)：显示 UGSci 的 4 个模块菜单，隐藏 7 个内置菜单项
- **Full Mode**（其他值）：所有内置菜单项保持可见，UGSci 模块菜单隐藏

### 数据流

#### 专家中心数据流

```
ExpertCenterPage
  │
  ├── fetchAgents()           → GET /api/agents
  ├── fetchMCPClients()       → GET /api/mcp
  │
  └── for each agent (并行):
        ├── fetchAgentConfig()  → GET /api/agents/{id}
        ├── fetchAgentSkills()  → GET /api/skills (X-Agent-Id)
        │
        └── extractMCPKeys(config.mcp)
              └── 交叉引用全局 MCP 列表
              └── 得到 agentMCPs
```

#### 技能中心数据流

```
SkillCenterPage
  │
  ├── fetchPoolSkills()       → GET /api/skills/pool
  ├── fetchAgents()           → GET /api/agents
  └── fetchWorkspaceSkills()  → GET /api/skills/workspaces
        │
        └── computeInstalledAgents(skillName)
              └── 遍历 workspaceSkills，找出安装了该技能的 Agent
```

#### 软件检测数据流

```
CapabilityCenterPage → LocalSoftwareSection
  │
  ├── fetchSoftwareDetection() → GET /api/ugsci/software/detect
  ├── fetchSoftwareList()      → GET /api/ugsci/software/list
  └── addScanPath(paths)       → POST /api/ugsci/software/scan-path
```

## 后端架构

### 插件生命周期

```
QwenPaw 启动
    │
    ├── 加载插件 → UGSciPlugin.register(api)
    │
    ├── register_startup_hook("ugsci_sync_skills_to_pool", priority=80)
    │       │
    │       └── _on_startup_sync_skills()
    │             └── skill_pool.sync_plugin_skills_to_pool()
    │                   ├── 扫描 skills/ 目录
    │                   ├── 复制到共享技能池
    │                   ├── 注册 manifest 条目 (installed_from: "plugin:ugsci")
    │                   └── reconcile_pool_manifest()
    │
    ├── register_startup_hook("ugsci_init", priority=50)
    │       └── _on_startup()  # 日志记录
    │
    ├── register_uninstall_hook("ugsci_remove_pool_skills")
    │       └── _on_uninstall_remove_skills()
    │             └── skill_pool.remove_plugin_pool_skills()
    │                   ├── 查找 installed_from == "plugin:ugsci" 的技能
    │                   ├── 从 manifest 移除
    │                   ├── 删除技能目录
    │                   └── reconcile_pool_manifest()
    │
    ├── register_http_router(engine.api, prefix="/ugsci/engines")
    ├── register_http_router(avatar, prefix="/ugsci/avatar")
    ├── register_http_router(sim_api, prefix="/ugsci/sim")
    └── register_http_router(team.api, prefix="/ugsci/team")
```

### 技能池同步设计

插件将技能同步到 **共享技能池**（skill pool），而非各 Agent 的 workspace，原因：

1. **不自动注入** — 技能进入池后不会自动安装到任何 Agent，用户按需下载
2. **全局可见** — 所有 Agent 都能看到这些技能并选择安装
3. **可追溯** — 通过 `installed_from: "plugin:ugsci"` 标记来源，卸载时可精确清理

### HTTP 路由设计

软件检测路由使用 **进程内缓存**（`_cached_result` dict），避免重复扫描文件系统。缓存策略：

| 端点 | 缓存行为 |
|------|----------|
| `GET /detect` | 强制重新扫描，更新缓存 |
| `GET /list` | 返回缓存；无缓存则自动触发首次扫描 |
| `POST /scan-path` | 添加路径后重新扫描，更新缓存 |
| `GET /summary` | 基于缓存数据生成摘要 |
| `GET /known` | 无缓存，直接返回静态目录 |

## 构建系统

### Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],        // ES module
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["react", "react-dom"],  // 运行时由宿主提供
    },
  },
});
```

- **输出格式**：ES module（`ui/dist/index.js`）
- **React 外部化**：`react` 和 `react-dom` 不打包，运行时由 QwenPaw 宿主通过 `window.QwenPaw.host.React` 提供
- **无 CSS 提取**：样式内联在 JS 中，使用宿主的 Ant Design 组件库
