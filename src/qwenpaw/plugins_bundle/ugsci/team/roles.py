# -*- coding: utf-8 -*-
"""Petroleum-domain role identities and spawn formatting helpers.

Each role has:
- A system-prompt fragment that defines the expert's identity,
  boundaries, and expected output format.
- A tool whitelist (from ``constants.UGSCI_ROLE_ALLOWED_TOOLS``).
- A skills whitelist (from ``constants.UGSCI_ROLE_SKILLS``).

The ``format_spawn_call`` and ``format_batch_item`` helpers produce
``spawn_subagent(...)`` example snippets for controller prompts, embedding
role identity so that spawned sub-agents know their boundaries.

This module is the UGSci equivalent of OMP's ``shared/role_prompts.py``,
tailored for petroleum engineering domain experts.
"""

from __future__ import annotations

from .constants import (
    UGSCI_DISPLAY_NAME_TO_ROLE,
    UGSCI_ROLE_ALLOWED_TOOLS,
    UGSCI_ROLE_DISPLAY_NAMES,
    UGSCI_ROLE_SKILLS,
)

# ── Role identity prompts ────────────────────────────────────────────
UGSCI_ROLE_PROMPTS: dict[str, str] = {
    "log-analyst": (
        "你是一位资深测井分析师（Log Analyst）。\n"
        "你的专长：岩性识别、孔隙度计算、饱和度分析、"
        "测井曲线解释与质量控制。\n"
        "你可以读取 LAS/DLIS 测井数据文件，执行解释处理。\n"
        "不要：进行储量计算、钻井设计、生产工艺优化、数值模拟。\n"
        "输出格式：结构化的测井解释结果（JSON），"
        "包含孔隙度、饱和度、岩性剖面、渗透率估算。"
    ),
    "geophysicist": (
        "你是一位地球物理专家（Geophysicist）。\n"
        "你的专长：地震资料解释、储层预测、AVO 分析、"
        "流体检测、构造建模。\n"
        "你可以运行地震处理脚本，分析地震属性体。\n"
        "不要：进行测井解释、钻井设计、PVT 分析。\n"
        "输出格式：储层预测报告，含含油气性概率、"
        "厚度分布图描述、构造解释结果。"
    ),
    "reservoir-engineer": (
        "你是一位油藏工程师（Reservoir Engineer）。\n"
        "你的专长：储量评估、油藏数值模拟、历史拟合、"
        "开发方案设计、EOR 方案评估。\n"
        "你可以使用 launch_simulation、analyze_simulation 等工具"
        "运行和分析 Eclipse/CMG 数值模拟。\n"
        "不要：进行测井解释、地震资料处理、钻井工程设计。\n"
        "输出格式：储量评估报告或模拟分析报告，"
        "含 OOIP/IP、采出程度、剩余油分布。"
    ),
    "drilling-engineer": (
        "你是一位钻井工程师（Drilling Engineer）。\n"
        "你的专长：井身结构设计、套管程序设计、"
        "钻井液体系选择、钻头选型、钻井风险控制。\n"
        "你可以编写钻井设计文档。\n"
        "不要：进行储量计算、地震解释、油藏数值模拟。\n"
        "输出格式：钻井工程设计报告，含井身结构图描述、"
        "套管程序、钻井液方案、风险矩阵。"
    ),
    "production-engineer": (
        "你是一位采油工程师（Production Engineer）。\n"
        "你的专长：完井方案设计、举升方式选择、"
        "生产动态分析、增产措施评估、人工举升优化。\n"
        "你可以运行生产工艺计算脚本，读取模拟结果。\n"
        "不要：进行储量计算、地震解释、井身结构设计。\n"
        "输出格式：采油工程方案，含完井方式、举升参数、"
        "预期产量、增产建议。"
    ),
    "pvt-analyst": (
        "你是一位 PVT 分析师（PVT Analyst）。\n"
        "你的专长：流体物性分析、PVT 实验拟合、"
        "相态行为研究、组分模型构建、EOS 参数标定。\n"
        "你可以运行 PVT 拟合脚本和流体性质计算程序。\n"
        "不要：进行储量计算、地震解释、钻井设计。\n"
        "输出格式：PVT 分析报告，含流体组分、"
        "相态图描述、拟合参数、物性参数表。"
    ),
    "domain-reviewer": (
        "你是一位领域审核专家（Domain Reviewer）。\n"
        "你的职责：交叉验证各专家结果的完整性和一致性，"
        "检查数据合理性、方法适用性、结论可靠性。\n"
        "你不要修改任何项目文件。\n"
        "输出格式：审核结论（PASS/FAIL/PARTIAL），"
        "含具体问题清单和改进建议。"
    ),
    # Generic OMP roles (for interop with OMP-style teams)
    "executor": (
        "You are a code executor.\n"
        "Implement the assigned task following the design spec.\n"
        "Run quality checks. Follow existing patterns.\n"
        "OUTPUT: working code + progress report."
    ),
    "planner": (
        "You are a strategic planner.\n"
        "Create implementation plans from specifications.\n"
        "Define task breakdown and dependency order.\n"
        "DO NOT write implementation code.\n"
        "OUTPUT: ordered task list with dependencies."
    ),
    "analyst": (
        "You are a requirements analyst.\n"
        "Extract concrete requirements, identify hidden constraints,\n"
        "define measurable acceptance criteria.\n"
        "DO NOT: write code, create files, run commands.\n"
        "OUTPUT: structured requirements in JSON format."
    ),
    "verifier": (
        "You are an adversarial verifier.\n"
        "Your job is to BREAK the implementation.\n"
        "Try every edge case, invalid input, and race condition.\n"
        "DO NOT modify any project files.\n"
        "OUTPUT: VERDICT: PASS/FAIL/PARTIAL with evidence."
    ),
}

# Aliases: Chinese display name or shorthand → role key.
_ROLE_ALIASES: dict[str, str] = {
    # Chinese → role key
    "测井分析师": "log-analyst",
    "地球物理专家": "geophysicist",
    "油藏工程师": "reservoir-engineer",
    "钻井工程师": "drilling-engineer",
    "采油工程师": "production-engineer",
    "PVT 分析师": "pvt-analyst",
    "PVT分析师": "pvt-analyst",
    "领域审核专家": "domain-reviewer",
    "审核专家": "domain-reviewer",
    # OMP aliases
    "ralph": "executor",
    "codex": "verifier",
}


def resolve_role(role: str) -> str:
    """Map *role* (or alias) onto a known UGSCI_ROLE_PROMPTS key.

    Resolution order:
    1. Direct key match.
    2. Chinese display name → role key.
    3. Alias map.
    4. Fail closed to the restricted ``"analyst"`` role.
    """
    if role in UGSCI_ROLE_PROMPTS:
        return role
    mapped = UGSCI_DISPLAY_NAME_TO_ROLE.get(role)
    if mapped and mapped in UGSCI_ROLE_PROMPTS:
        return mapped
    mapped = _ROLE_ALIASES.get(role)
    if mapped and mapped in UGSCI_ROLE_PROMPTS:
        return mapped
    # Try case-insensitive match
    lower = role.lower().replace("-", "_").replace("_", "-")
    if lower in UGSCI_ROLE_PROMPTS:
        return lower
    return "analyst"


def get_display_name(role: str) -> str:
    """Return the Chinese display name for *role*."""
    key = resolve_role(role)
    return UGSCI_ROLE_DISPLAY_NAMES.get(key, key)


def tools_literal(role: str) -> str | None:
    """Return a Python-list literal for *role*'s tools, or None to omit."""
    tools = UGSCI_ROLE_ALLOWED_TOOLS.get(resolve_role(role))
    if tools is None:
        return None
    inner = ", ".join(f'"{t}"' for t in tools)
    return f"[{inner}]"


def skills_literal(role: str) -> str | None:
    """Return a Python-list literal for *role*'s skills, or None to omit."""
    skills = UGSCI_ROLE_SKILLS.get(resolve_role(role))
    if skills is None:
        return None
    inner = ", ".join(f'"{s}"' for s in skills)
    return f"[{inner}]"


def format_spawn_call(
    role: str,
    task_body: str,
    *,
    fork: bool = False,
    background: bool = True,
    indent: str = "   ",
) -> str:
    """Format a ``spawn_subagent(...)`` example for controller prompts."""
    resolved = resolve_role(role)
    display = get_display_name(resolved)
    task_preview = (
        f"<角色身份: {display} (role={resolved}) "
        f"— 从 ugsci-roles 技能获取完整定义>\\n\\n"
        f"## 任务\\n{task_body}"
    )
    pad = indent
    lines = [
        f"{pad}spawn_subagent(",
        f'{pad}    task="{task_preview}",',
    ]
    tools = tools_literal(resolved)
    if tools is not None:
        lines.append(f"{pad}    allowed_tools={tools},")
    skills = skills_literal(resolved)
    if skills is not None:
        lines.append(f"{pad}    skills={skills},")
    if fork:
        lines.append(f"{pad}    fork=True,")
    if background:
        lines.append(f"{pad}    background=True,")
    lines.append(f"{pad})")
    return "\n".join(lines)


def format_batch_item(
    role: str,
    task_body: str,
    *,
    fork: bool = False,
    indent: str = "     ",
) -> str:
    """Format one batch-mode dict entry for controller prompts."""
    resolved = resolve_role(role)
    display = get_display_name(resolved)
    task_preview = (
        f"<角色身份: {display} (role={resolved}) "
        f"— 从 ugsci-roles 技能获取完整定义>\\n\\n"
        f"## 任务\\n{task_body}"
    )
    pad = indent
    lines = [
        f"{pad}{{",
        f'{pad}  "task": "{task_preview}",',
    ]
    tools = tools_literal(resolved)
    if tools is not None:
        lines.append(f'{pad}  "allowed_tools": {tools},')
    skills = skills_literal(resolved)
    if skills is not None:
        lines.append(f'{pad}  "skills": {skills},')
    if fork:
        lines.append(f'{pad}  "fork": true,')
    lines.append(f"{pad}}}")
    return "\n".join(lines)


# ── Fork merge protocol (adapted from OMP) ───────────────────────────

FORK_MERGE_PROTOCOL = """\
Fork 集成协议（当任何 worker 使用 fork=True 时必须执行）：
- 每个 fork worker 的结果包含 [FORK_BRANCH: <branch>] 标记，
  并在独立的 git worktree 中工作。Worker 完成前必须 commit。
  `git merge <branch>` 只带入 commits，不带入未提交的修改。
- 所有 worker 完成后，对每个 [FORK_BRANCH] 执行：
  1. `git merge --no-ff <branch>` 将分支合并到当前主工作区分支。
  2. 冲突处理：解决冲突或中止合并。在冲突未解决前，
     不要推进工作流阶段，不要报告完成。
- 合并过程中保持目标阶段不变（不要回退到 dispatch 阶段）。
- 如果没有 worker 使用 fork=True，仍需设置 forks_integrated=true。
- 成功集成后，更新 state.json: 设置 forks_integrated=true (JSON 布尔值)。
- Stop gate 在 forks_integrated=true 且所有 fork commits 都是 HEAD 祖先时
  才允许阶段推进。"""


def fork_merge_instructions(indent: str = "") -> str:
    """Return the fork merge protocol block, optionally indented."""
    if not indent:
        return FORK_MERGE_PROTOCOL
    return "\n".join(
        indent + line for line in FORK_MERGE_PROTOCOL.splitlines()
    )
