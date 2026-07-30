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
        "description": (
            "从测井解释到储量计算的完整储层评价流程，依次调用测井分析师、"
            "地球物理专家和油藏工程师"
        ),
        "members": [
            {"name": "测井分析师", "role": "岩性识别与孔隙度计算", "emoji": "📡"},
            {"name": "地球物理专家", "role": "储层预测与含油气检测", "emoji": "🌍"},
            {"name": "油藏工程师", "role": "储量评估与开发建议", "emoji": "🛢️"},
        ],
        "taskTemplate": (
            "请对以下区块进行储层评价：\n区块名称：{区块名}\n"
            "井号：{井号}\n评价要求：依次咨询测井分析师（岩性解释和孔隙度"
            "参数）、地球物理专家（储层预测和含油气性检测）、油藏工程师"
            "（储量计算和开发建议），综合形成储层评价报告。"
        ),
        "orchestrationPrompt": (
            "你是一个储层评价团队的协调者。请按照以下流程依次咨询团队成员：\n"
            "1. 先用 list_agents() 查看可用专家\n"
            "2. 向测井分析师发送岩性解释和孔隙度计算请求\n"
            "3. 将测井结果传递给地球物理专家，请求储层预测\n"
            "4. 将前两步结果传递给油藏工程师，请求储量评估\n"
            "5. 综合三位专家的结果，形成统一的储层评价报告\n\n"
            "重要：每步咨询使用 chat_with_agent，传递上一步的结果作为上下文。"
        ),
    },
    {
        "id": "drilling-design-team",
        "name": "钻井设计团队",
        "emoji": "⛏️",
        "category": "钻完井",
        "mode": "coordinator",
        "description": (
            "由钻井工程师主导，协调地球物理专家（地层预测）和采油工程师"
            "（完井方案），完成钻井工程设计"
        ),
        "members": [
            {"name": "钻井工程师", "role": "井身结构与套管设计", "emoji": "⛏️"},
            {"name": "地球物理专家", "role": "地层压力预测", "emoji": "🌍"},
            {"name": "采油工程师", "role": "完井方案建议", "emoji": "⚙️"},
        ],
        "coordinatorName": "钻井工程师",
        "taskTemplate": (
            "请为以下井进行钻井工程设计：\n井名：{井名}\n设计深度："
            "{深度}m\n设计要求：请协调地球物理专家进行地层压力预测，"
            "然后由你完成井身结构设计，最后咨询采油工程师确定完井方案。"
        ),
        "orchestrationPrompt": (
            "你是钻井设计团队的协调者（钻井工程师）。请按以下步骤工作：\n"
            "1. 用 list_agents() 查看可用专家\n"
            "2. 向地球物理专家发送地层压力预测请求\n"
            "3. 基于压力预测结果，完成井身结构设计和套管设计\n"
            "4. 向采油工程师发送完井方案咨询请求\n"
            "5. 综合所有结果，输出完整的钻井工程设计方案\n\n"
            "注意：每步使用 chat_with_agent 咨询，传递已获取的参数。"
        ),
    },
    {
        "id": "development-plan-team",
        "name": "开发方案评审团队",
        "emoji": "📋",
        "category": "油气开发",
        "mode": "roundtable",
        "description": (
            "油藏工程师、钻井工程师和采油工程师独立评估同一区块的开发方案，"
            "对比不同视角后综合出最优方案"
        ),
        "members": [
            {"name": "油藏工程师", "role": "储量与开发方式评估", "emoji": "🛢️"},
            {"name": "钻井工程师", "role": "工程可行性评估", "emoji": "⛏️"},
            {"name": "采油工程师", "role": "生产工艺评估", "emoji": "⚙️"},
        ],
        "taskTemplate": (
            "请对以下区块的开发方案进行多角度评审：\n区块名称："
            "{区块名}\n方案概述：{方案概述}\n评审要求：请分别咨询油藏工程师"
            "（储量和开发方式）、钻井工程师（工程可行性）、采油工程师"
            "（生产工艺），各自独立给出评估意见，然后对比综合形成最终建议。"
        ),
        "orchestrationPrompt": (
            "你是开发方案评审团队的协调者。请按以下步骤工作：\n"
            "1. 用 list_agents() 查看可用专家\n"
            "2. 分别向油藏工程师、钻井工程师、采油工程师发送同一评审请求"
            "（独立评估，不传递他人意见）\n"
            "3. 收集三位专家的独立意见后，对比分析各自观点\n"
            "4. 综合形成最终的开发方案建议，包含各专业领域的考虑\n\n"
            "重要：三位专家应独立评估，不要将一位专家的意见传递给另一位。"
        ),
    },
    {
        "id": "pvt-analysis-team",
        "name": "流体性质分析团队",
        "emoji": "🧪",
        "category": "流体性质",
        "mode": "pipeline",
        "description": (
            "PVT分析师进行流体物性计算，地球物理专家辅助相态验证，"
            "油藏工程师完成开发方案适配"
        ),
        "members": [
            {"name": "PVT 分析师", "role": "PVT实验拟合与物性计算", "emoji": "🧪"},
            {"name": "地球物理专家", "role": "相态行为验证", "emoji": "🌍"},
            {"name": "油藏工程师", "role": "开发方式适配", "emoji": "🛢️"},
        ],
        "taskTemplate": (
            "请对以下流体样品进行PVT分析：\n样品来源：{井号}-{层位}\n"
            "实验数据：{实验数据概述}\n分析要求：依次咨询PVT分析师"
            "（物性计算和相态分析）、地球物理专家（相态验证）、油藏工程师"
            "（开发方式建议），形成完整的流体评价报告。"
        ),
        "orchestrationPrompt": (
            "你是流体性质分析团队的协调者。请按以下流程工作：\n"
            "1. 用 list_agents() 查看可用专家\n"
            "2. 向PVT分析师发送流体物性计算和相态分析请求\n"
            "3. 将PVT分析结果传递给地球物理专家，请求相态行为验证\n"
            "4. 将前两步结果传递给油藏工程师，请求开发方式适配建议\n"
            "5. 综合形成完整的流体性质评价报告\n\n"
            "注意：每步使用 chat_with_agent 咨询，传递上一步的完整结果。"
        ),
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
