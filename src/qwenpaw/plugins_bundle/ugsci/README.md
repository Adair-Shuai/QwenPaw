# UGSci

面向石油领域的 QwenPaw 增强插件。

## 核心功能

### 三大模块

1. **专家中心** — 将 QwenPaw 的 Agent 转化为领域专家展示。每个专家卡片实时显示该 Agent 的技能、MCP 客户端和功能简介。点击卡片打开抽屉，可查看完整的 Agent 配置信息（系统提示词文件、工具配置等）。

2. **能力中心** — 以 MCP 客户端为粒度展示底层工具能力。每张能力卡片显示 MCP 客户端的传输方式、URL/命令、工具数量等信息。

3. **技能中心** — 展示技能池中的所有技能。每张技能卡片显示技能名称、描述、版本、标签等。点击卡片可查看技能详情，并显示已安装此技能的专家列表。

### 数据联动

专家展示层数据与 Agent 真实数据完全挂钩：
- **技能**：通过 `GET /api/skills`（带 `X-Agent-Id` header）获取每个 Agent 的已安装技能
- **MCP**：从 Agent 配置的 `mcp` 字段提取 MCP 客户端 Key，与全局 MCP 列表交叉引用
- **功能简介**：直接使用 Agent 的 `description` 字段
- **模型信息**：显示 Agent 的 `active_model`
- **系统提示词**：从 Agent 配置的 `system_prompt_files` 字段获取

### 导航简化

隐藏以下内置菜单项，保持左侧导航简洁：
- `core.skills` → 技能管理（移至技能中心）
- `core.tools` → 工具管理
- `core.mcp` → MCP 管理（移至能力中心）
- `core.acp` → ACP 配置
- `core.agent-config` → Agent 配置（可在专家中心编辑）
- `core.agent-stats` → Agent 统计
- `core.skill-pool` → 技能池管理（移至技能中心）

## 构建

```bash
cd ui
npm install
npm run build
```

构建产物为 `ui/dist/index.js`（ES module 格式）。

## 安装

将 `ugsci` 目录复制到 QwenPaw 工作目录的 `plugins/` 子目录下：

```bash
cp -r plugins/bundle/ugsci ~/.qwenpaw/plugins/
```

重启 QwenPaw 后端后，插件将自动加载。
