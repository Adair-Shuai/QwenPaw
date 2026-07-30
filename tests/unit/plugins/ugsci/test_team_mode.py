# -*- coding: utf-8 -*-
"""Argument parsing tests for the UGSci team slash command."""

from plugins.bundle.ugsci.team.mode import _parse_args


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
