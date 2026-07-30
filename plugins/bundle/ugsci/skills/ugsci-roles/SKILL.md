# UGSci 石油领域角色工具配置

当使用 spawn_subagent（单次或 batch 模式）分派子 agent 时，根据子 agent 的角色设置相应的 allowed_tools 和 skills 参数。

**代码中的权威定义来源：**
`plugins/bundle/ugsci/team/constants.py`
（`UGSCI_ROLE_ALLOWED_TOOLS`、`UGSCI_ROLE_SKILLS`、`TOOL_*` 名称）和
`plugins/bundle/ugsci/team/roles.py`
（`UGSCI_ROLE_PROMPTS`、`build_worker_prompt`、`format_spawn_call`）。
工具名称必须与 ToolRegistry 注册名称一致，不要自创别名。

## 角色定义

### log-analyst（测井分析师）📡
- **allowed_tools**: ["read_file", "grep_search", "glob_search", "ast_search"]
- **skills**: []
- **边界**: 岩性识别、孔隙度计算、饱和度分析。不做储量计算、钻井设计、数值模拟。
- **输出**: 结构化测井解释结果（JSON），含孔隙度、饱和度、岩性剖面。

### geophysicist（地球物理专家）🌍
- **allowed_tools**: ["read_file", "grep_search", "glob_search", "ast_search", "execute_shell_command"]
- **skills**: []
- **边界**: 地震资料解释、储层预测、AVO 分析。不做测井解释、钻井设计。
- **输出**: 储层预测报告，含含油气性概率、厚度分布。

### reservoir-engineer（油藏工程师）🛢️
- **allowed_tools**: null（继承所有工具）
- **skills**: null（继承所有技能）
- **边界**: 储量评估、油藏数值模拟、历史拟合、开发方案设计。
- **输出**: 储量评估报告，含 OOIP/IP、采出程度、剩余油分布。

### drilling-engineer（钻井工程师）⛏️
- **allowed_tools**: ["read_file", "grep_search", "glob_search", "write_file", "execute_shell_command"]
- **skills**: []
- **边界**: 井身结构设计、套管程序设计、钻井液体系选择。不做储量计算、地震解释。
- **输出**: 钻井工程设计报告，含井身结构、套管程序、钻井液方案。

### production-engineer（采油工程师）⚙️
- **allowed_tools**: ["read_file", "grep_search", "glob_search", "execute_shell_command", "check_simulation_status", "read_simulation_results", "analyze_simulation"]
- **skills**: []
- **边界**: 完井方案设计、举升方式选择、生产动态分析。不做储量计算、井身结构设计。
- **输出**: 采油工程方案，含完井方式、举升参数、预期产量。

### pvt-analyst（PVT 分析师）🧪
- **allowed_tools**: ["read_file", "grep_search", "glob_search", "execute_shell_command"]
- **skills**: []
- **边界**: 流体物性分析、PVT 实验拟合、相态行为研究。不做储量计算、地震解释。
- **输出**: PVT 分析报告，含流体组分、相态图、拟合参数。

### domain-reviewer（领域审核专家）🔬
- **allowed_tools**: ["read_file", "grep_search", "glob_search", "ast_search", "execute_shell_command"]
- **skills**: []
- **边界**: 交叉验证各专家结果的完整性和一致性。不修改任何文件。
- **输出**: 审核结论（PASS/FAIL/PARTIAL），含问题清单和改进建议。

### executor（通用执行者）
- **allowed_tools**: null（继承所有工具）
- **skills**: null（继承所有技能）
- **边界**: 通用代码执行，用于非领域特定任务。

### planner（规划者）
- **allowed_tools**: ["read_file", "grep_search", "glob_search", "write_file", "ast_search"]
- **skills**: []
- **边界**: 创建任务分解计划，不写实现代码。

### analyst（需求分析师）
- **allowed_tools**: ["read_file", "grep_search", "glob_search", "write_file", "execute_shell_command"]
- **skills**: []
- **边界**: 提取需求，定义验收标准，不写代码。

### verifier（验证者）
- **allowed_tools**: ["read_file", "grep_search", "glob_search", "ast_search", "execute_shell_command"]
- **skills**: []
- **边界**: 对抗性验证，尝试打破实现。不修改文件。

## 用法

```text
spawn_subagent(
    task="<角色身份提示词 — 从 ugsci-roles 技能获取>\n\n## 任务\n<任务描述>",
    allowed_tools=<角色工具列表 or 省略 if null>,
    skills=<角色技能列表 or 省略 if null>,
    fork=True,         # 如果需要 worktree 隔离
    background=True,   # 如果需要后台执行
)
```

当 allowed_tools 或 skills 为 null 时，省略该参数（使用默认 None）。
对于 batch 模式，传递 `task=""` 并将每个 item 的角色配置放在各自 dict 中。

## 角色名称别名

支持中文名称和英文 key 两种方式：
- `测井分析师` → `log-analyst`
- `地球物理专家` → `geophysicist`
- `油藏工程师` → `reservoir-engineer`
- `钻井工程师` → `drilling-engineer`
- `采油工程师` → `production-engineer`
- `PVT 分析师` → `pvt-analyst`
- `领域审核专家` / `审核专家` → `domain-reviewer`

## 工作流阶段

UGSci 专家团工作流有 5 个阶段：

1. **plan**（规划）— 分析任务，创建任务分解，分配专家
2. **dispatch**（分派）— 按模式分派专家（pipeline 串行 / roundtable 并行 / coordinator 按需）
3. **verify**（验证）— domain-reviewer 交叉验证各专家结果
4. **synthesize**（综合）— 综合所有结果形成最终报告
5. **completed**（完成）— 工作流结束

每个阶段的结果通过文件传递（handoffs/、results/ 目录），不依赖上下文窗口。
