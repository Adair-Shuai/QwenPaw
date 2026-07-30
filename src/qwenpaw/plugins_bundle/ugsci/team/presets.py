# -*- coding: utf-8 -*-
"""Shared preset team definitions for UGSci expert teams.

This is the single source of truth for preset team data.
Both ``mode.py`` (slash-command member lookup) and ``plugin.py``
(HTTP API endpoint) import from here.
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

# Each preset team has full metadata for the frontend API
# and a simplified member list for the mode handler.
PRESET_UGSCI_TEAMS: list[dict] = [
    {
        "id": "reservoir-eval-team",
        "name": "储层评价团队",
        "emoji": "🛢️",
        "category": "油气勘探",
        "mode": "pipeline",
        "description": "从测井解释到储量计算的完整储层评价流程",
        "members": [
            {"name": "测井分析师", "role": "岩性识别与孔隙度计算", "emoji": "📡"},
            {"name": "地球物理专家", "role": "储层预测与含油气检测", "emoji": "🌍"},
            {"name": "油藏工程师", "role": "储量评估与开发建议", "emoji": "🛢️"},
        ],
        "taskTemplate": "请对以下区块进行储层评价：\n区块名称：{区块名}\n井号：{井号}",
    },
    {
        "id": "drilling-design-team",
        "name": "钻井设计团队",
        "emoji": "⛏️",
        "category": "钻完井",
        "mode": "coordinator",
        "description": "由钻井工程师主导，协调地球物理专家和采油工程师",
        "members": [
            {"name": "钻井工程师", "role": "井身结构与套管设计", "emoji": "⛏️"},
            {"name": "地球物理专家", "role": "地层压力预测", "emoji": "🌍"},
            {"name": "采油工程师", "role": "完井方案建议", "emoji": "⚙️"},
        ],
        "taskTemplate": "请为以下井进行钻井工程设计：\n井名：{井名}\n设计深度：{深度}m",
    },
    {
        "id": "development-plan-team",
        "name": "开发方案评审团队",
        "emoji": "📋",
        "category": "油气开发",
        "mode": "roundtable",
        "description": "油藏/钻井/采油独立评估同一区块开发方案",
        "members": [
            {"name": "油藏工程师", "role": "储量与开发方式评估", "emoji": "🛢️"},
            {"name": "钻井工程师", "role": "工程可行性评估", "emoji": "⛏️"},
            {"name": "采油工程师", "role": "生产工艺评估", "emoji": "⚙️"},
        ],
        "taskTemplate": "请对以下区块的开发方案进行评审：\n区块名称：{区块名}\n方案概述：{方案概述}",
    },
    {
        "id": "pvt-analysis-team",
        "name": "流体性质分析团队",
        "emoji": "🧪",
        "category": "流体性质",
        "mode": "pipeline",
        "description": "PVT分析→相态验证→开发方式适配",
        "members": [
            {"name": "PVT 分析师", "role": "PVT实验拟合与物性计算", "emoji": "🧪"},
            {"name": "地球物理专家", "role": "相态行为验证", "emoji": "🌍"},
            {"name": "油藏工程师", "role": "开发方式适配", "emoji": "🛢️"},
        ],
        "taskTemplate": "请对以下流体样品进行PVT分析：\n样品来源：{井号}-{层位}",
    },
]

# Quick lookup: team name → member list (for mode.py)
PRESET_TEAM_MEMBERS: dict[str, list[dict[str, str]]] = {
    t["name"]: t["members"] for t in PRESET_UGSCI_TEAMS
}

# All known preset team names (for fuzzy matching)
PRESET_TEAM_NAMES: list[str] = [t["name"] for t in PRESET_UGSCI_TEAMS]


def resolve_team_members(team_name: str) -> list[dict[str, str]]:
    """Resolve team members from preset team definitions.

    Tries exact match first, then fuzzy match requiring the team name
    to contain the full preset name (not just a single character).
    Returns empty list if the team is not recognized
    (the controller will use list_agents() to discover members).
    """
    # 1. Exact match
    if team_name in PRESET_TEAM_MEMBERS:
        return PRESET_TEAM_MEMBERS[team_name]

    # 2. Fuzzy: user input contains a full preset name
    # (e.g. "储层评价团队A" matches "储层评价团队")
    # Avoids false positives from short substrings like "团队".
    for name in PRESET_TEAM_NAMES:
        if len(name) >= 2 and name in team_name:
            logger.debug("Fuzzy match: '%s' → '%s'", team_name, name)
            return PRESET_TEAM_MEMBERS[name]

    return []
