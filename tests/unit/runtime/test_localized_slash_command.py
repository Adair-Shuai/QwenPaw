# -*- coding: utf-8 -*-
"""Chinese IME-friendly slash command and Skill fallback tests."""
import json
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import ANY, AsyncMock

import pytest
from agentscope.message import Msg, TextBlock

from qwenpaw.runtime.slash_command_registry import (
    CommandSpec,
    SlashCommandRegistry,
    normalize_command_prefix,
)
from qwenpaw.runtime.builtin_commands import _skill_fallback_handler


def test_normalize_command_prefix_only_rewrites_leading_dunhao():
    assert normalize_command_prefix("、compact now") == "/compact now"
    assert normalize_command_prefix("  、skills") == "  /skills"
    assert normalize_command_prefix("比较甲、乙") == "比较甲、乙"


@pytest.mark.asyncio
async def test_registry_dispatches_dunhao_command_and_normalizes_fallback():
    handler = AsyncMock(return_value="handled")
    registry = SlashCommandRegistry()
    registry.register(CommandSpec(name="compact", handler=handler))

    result = await registry.dispatch("、compact 保留参数", MagicContext())

    assert result == "handled"
    handler.assert_awaited_once_with(ANY, "保留参数")

    fallback = AsyncMock(return_value="fallback")
    fallback_registry = SlashCommandRegistry()
    fallback_registry.register_fallback(fallback)
    await fallback_registry.dispatch("、custom 参数", MagicContext())
    assert fallback.await_args.args[0] == "/custom 参数"


class MagicContext:
    """Minimal opaque context accepted by registry handlers."""


def _skill_context(workspace_dir: Path, channel: str = "console"):
    return SimpleNamespace(
        workspace=SimpleNamespace(workspace_dir=workspace_dir),
        request=SimpleNamespace(channel=channel),
        input_msgs=[],
    )


def _write_skill_manifest(
    workspace_dir: Path,
    entry: dict,
    *,
    name: str = "demo",
) -> None:
    (workspace_dir / "skill.json").write_text(
        json.dumps({"skills": {name: entry}}),
        encoding="utf-8",
    )


@pytest.mark.asyncio
async def test_skill_fallback_reports_unknown_skill(tmp_path: Path):
    result = await _skill_fallback_handler(
        "/missing 做事",
        _skill_context(tmp_path),
    )

    assert result is not None
    assert "未找到 Skill" in result.content[0].text
    assert "/skills" in result.content[0].text


@pytest.mark.asyncio
async def test_skill_fallback_reports_disabled_skill(tmp_path: Path):
    _write_skill_manifest(
        tmp_path,
        {"enabled": False, "channels": ["console"]},
    )

    result = await _skill_fallback_handler(
        "/DEMO 做事",
        _skill_context(tmp_path),
    )

    assert result is not None
    assert "当前未启用" in result.content[0].text


@pytest.mark.asyncio
async def test_skill_fallback_reports_channel_mismatch(tmp_path: Path):
    _write_skill_manifest(
        tmp_path,
        {"enabled": True, "channels": ["discord"]},
    )

    result = await _skill_fallback_handler(
        "、demo 做事",
        _skill_context(tmp_path, channel="console"),
    )

    assert result is not None
    assert "不支持当前渠道 `console`" in result.content[0].text


@pytest.mark.asyncio
async def test_skill_fallback_still_injects_enabled_skill(tmp_path: Path):
    _write_skill_manifest(
        tmp_path,
        {"enabled": True, "channels": ["console"]},
    )
    skill_dir = tmp_path / "skills" / "demo"
    skill_dir.mkdir(parents=True)
    (skill_dir / "SKILL.md").write_text(
        "---\nname: Demo Skill\ndescription: Test skill\n---\nFollow this.",
        encoding="utf-8",
    )
    ctx = _skill_context(tmp_path)
    ctx.input_msgs = [
        Msg(
            name="user",
            role="user",
            content=[TextBlock(type="text", text="/demo 做事")],
        ),
    ]

    result = await _skill_fallback_handler("/demo 做事", ctx)

    assert result is None
    assert "<name>Demo Skill</name>" in ctx.input_msgs[0].content[0].text
    assert "Follow this." in ctx.input_msgs[0].content[0].text
