# -*- coding: utf-8 -*-
"""Argument parsing tests for the UGSci team slash command."""

from plugins.bundle.ugsci.team.mode import _parse_args
from plugins.bundle.ugsci.team.prompts import (
    _member_dispatch_call,
    _member_role_key,
)


def test_parse_explicit_mode_and_preset_team() -> None:
    parsed = _parse_args(
        "roundtable 开发方案评审团队 评估 A 区块开发方案",
    )

    assert parsed is not None
    assert parsed["team_mode"] == "roundtable"
    assert parsed["team_name"] == "开发方案评审团队"
    assert parsed["task"] == "评估 A 区块开发方案"
    assert len(parsed["members"]) == 3


def test_parse_defaults_to_pipeline() -> None:
    parsed = _parse_args("储层评价团队 对 XX 区块进行评价")

    assert parsed is not None
    assert parsed["team_mode"] == "pipeline"
    assert parsed["team_name"] == "储层评价团队"


def test_parse_unknown_single_token_team() -> None:
    parsed = _parse_args("coordinator 自定义团队 完成联合评估")

    assert parsed is not None
    assert parsed["team_name"] == "自定义团队"
    assert parsed["members"] == []


def test_parse_rejects_missing_task() -> None:
    assert _parse_args("pipeline 储层评价团队") is None
    assert _parse_args("") is None


def test_parse_accepts_extended_workflow_modes() -> None:
    for mode in ("router", "review_loop", "debate"):
        parsed = _parse_args(f"{mode} 储层评价团队 完成复杂储层评价")
        assert parsed is not None
        assert parsed["team_mode"] == mode


def test_custom_team_uses_saved_mode_without_explicit_override(
    monkeypatch,
) -> None:
    monkeypatch.setattr(
        "plugins.bundle.ugsci.team.custom_store.load_custom_team",
        lambda _team_id: {
            "name": "闭环评审",
            "mode": "review_loop",
            "members": [
                {"name": "执行者", "role": "executor"},
                {"name": "审核者", "role": "verifier"},
            ],
        },
    )

    parsed = _parse_args("@review-flow 审查并修订开发方案")

    assert parsed is not None
    assert parsed["team_mode"] == "review_loop"
    assert parsed["team_id"] == "review-flow"


def test_explicit_role_key_wins_over_ambiguous_expert_name() -> None:
    member = {
        "name": "现场专家 Copy",
        "role": "自定义描述",
        "role_key": "reservoir-engineer",
    }

    assert _member_role_key(member) == "reservoir-engineer"


def test_member_dispatch_call_enforces_binding_semantics() -> None:
    fixed = _member_dispatch_call(
        {
            "name": "油藏工程师",
            "role_key": "reservoir-engineer",
            "binding_mode": "fixed",
            "agent_id": "reservoir-001",
        },
        "完成储量复核",
    )
    preferred = _member_dispatch_call(
        {
            "name": "评审专家",
            "role_key": "domain-reviewer",
            "binding_mode": "preferred",
            "agent_id": "reviewer-001",
        },
        "完成独立评审",
    )
    temporary = _member_dispatch_call(
        {
            "name": "临时分析员",
            "role_key": "analyst",
            "binding_mode": "temporary",
        },
        "完成临时分析",
    )

    assert 'chat_with_agent(to_agent="reservoir-001"' in fixed
    assert "禁止自动替换" in fixed
    assert 'chat_with_agent(to_agent="reviewer-001"' in preferred
    assert "spawn_subagent(" in preferred
    assert "spawn_subagent(" in temporary
    assert "chat_with_agent(" not in temporary
