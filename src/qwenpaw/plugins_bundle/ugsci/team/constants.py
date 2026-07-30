# -*- coding: utf-8 -*-
"""Constants for the UGSci expert-team workflow.

Defines:
- Phase names for the state machine
- Iteration / retry limits
- Role → allowed_tools / skills whitelists
- Team orchestration mode identifiers
"""

from __future__ import annotations

# ── Workflow phases ──────────────────────────────────────────────────
PHASE_PLAN = "plan"
PHASE_DISPATCH = "dispatch"
PHASE_VERIFY = "verify"
PHASE_SYNTHESIZE = "synthesize"
PHASE_COMPLETED = "completed"

ALL_PHASES = (
    PHASE_PLAN,
    PHASE_DISPATCH,
    PHASE_VERIFY,
    PHASE_SYNTHESIZE,
    PHASE_COMPLETED,
)

# Phases that occur after expert dispatch (fork-sensitive).
POST_DISPATCH_PHASES = frozenset({PHASE_VERIFY, PHASE_SYNTHESIZE, PHASE_COMPLETED})

# ── Limits ───────────────────────────────────────────────────────────
UGSCI_TEAM_MAX_ITERATIONS = 40
UGSCI_TEAM_MAX_VERIFY_RETRIES = 3
UGSCI_TEAM_MAX_DISPATCH_RETRIES = 2

# ── Team orchestration modes ─────────────────────────────────────────
MODE_PIPELINE = "pipeline"
MODE_COORDINATOR = "coordinator"
MODE_ROUNDTABLE = "roundtable"

ALL_TEAM_MODES = (MODE_PIPELINE, MODE_COORDINATOR, MODE_ROUNDTABLE)

# ── Registered QwenPaw tool names ────────────────────────────────────
# Keep in sync with the ToolRegistry names used by the host.
TOOL_READ_FILE = "read_file"
TOOL_GREP_SEARCH = "grep_search"
TOOL_GLOB_SEARCH = "glob_search"
TOOL_WRITE_FILE = "write_file"
TOOL_AST_SEARCH = "ast_search"
TOOL_EXECUTE_SHELL = "execute_shell_command"
TOOL_LAUNCH_SIM = "launch_simulation"
TOOL_CHECK_SIM = "check_simulation_status"
TOOL_WAIT_SIM = "wait_for_simulation"
TOOL_READ_SIM = "read_simulation_results"
TOOL_EDIT_SIM = "edit_simulation_deck"
TOOL_ANALYZE_SIM = "analyze_simulation"

# ── Tool bundles ─────────────────────────────────────────────────────
_TOOLS_READ = (
    TOOL_READ_FILE,
    TOOL_GREP_SEARCH,
    TOOL_GLOB_SEARCH,
)
_TOOLS_READ_SHELL = _TOOLS_READ + (TOOL_EXECUTE_SHELL,)
_TOOLS_READ_WRITE_SHELL = _TOOLS_READ + (
    TOOL_WRITE_FILE,
    TOOL_EXECUTE_SHELL,
)
_TOOLS_READ_AST = _TOOLS_READ + (TOOL_AST_SEARCH,)
_TOOLS_READ_AST_SHELL = _TOOLS_READ_AST + (TOOL_EXECUTE_SHELL,)

# Simulation tools for reservoir/production engineers.
_TOOLS_SIM_FULL = (
    TOOL_LAUNCH_SIM,
    TOOL_CHECK_SIM,
    TOOL_WAIT_SIM,
    TOOL_READ_SIM,
    TOOL_EDIT_SIM,
    TOOL_ANALYZE_SIM,
)
_TOOLS_SIM_READ_ONLY = (
    TOOL_CHECK_SIM,
    TOOL_READ_SIM,
    TOOL_ANALYZE_SIM,
)

# ── Role → allowed_tools ────────────────────────────────────────────
# ``None`` means inherit the parent agent's full tool set.
UGSCI_ROLE_ALLOWED_TOOLS: dict[str, list[str] | None] = {
    # Domain experts
    "log-analyst": list(_TOOLS_READ_AST),           # 测井分析师: read-only + AST
    "geophysicist": list(_TOOLS_READ_AST_SHELL),     # 地球物理专家: read + AST + shell
    "reservoir-engineer": None,                      # 油藏工程师: full access (incl. simulation)
    "drilling-engineer": list(_TOOLS_READ_WRITE_SHELL),  # 钻井工程师: read + write + shell
    "production-engineer": list(_TOOLS_READ_SHELL + _TOOLS_SIM_READ_ONLY),  # 采油工程师
    "pvt-analyst": list(_TOOLS_READ_SHELL),          # PVT 分析师: read + shell
    # Reviewer / verification
    "domain-reviewer": list(_TOOLS_READ_AST_SHELL),  # 领域审核: read-only + AST + shell
    # Generic OMP roles (for interop)
    "executor": None,
    "planner": list(_TOOLS_READ + (TOOL_WRITE_FILE, TOOL_AST_SEARCH)),
    "analyst": list(_TOOLS_READ_WRITE_SHELL),
    "verifier": list(_TOOLS_READ_AST_SHELL),
}

# ── Role → skills whitelist ─────────────────────────────────────────
# ``None`` = inherit all skills.  Empty list = clear inherited skills.
UGSCI_ROLE_SKILLS: dict[str, list[str] | None] = {
    "log-analyst": [],
    "geophysicist": [],
    "reservoir-engineer": None,   # keep all skills (needs simulation skills)
    "drilling-engineer": [],
    "production-engineer": [],
    "pvt-analyst": [],
    "domain-reviewer": [],
    "executor": None,
    "planner": [],
    "analyst": [],
    "verifier": [],
}

# ── Role → display name (Chinese) ────────────────────────────────────
UGSCI_ROLE_DISPLAY_NAMES: dict[str, str] = {
    "log-analyst": "测井分析师",
    "geophysicist": "地球物理专家",
    "reservoir-engineer": "油藏工程师",
    "drilling-engineer": "钻井工程师",
    "production-engineer": "采油工程师",
    "pvt-analyst": "PVT 分析师",
    "domain-reviewer": "领域审核专家",
    "executor": "执行者",
    "planner": "规划者",
    "analyst": "需求分析师",
    "verifier": "验证者",
}

# Reverse map: Chinese display name → role key.
UGSCI_DISPLAY_NAME_TO_ROLE: dict[str, str] = {
    v: k for k, v in UGSCI_ROLE_DISPLAY_NAMES.items()
}
