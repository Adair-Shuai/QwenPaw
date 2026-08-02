# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Request-scoped capability activation for multi-Agent @ coordination."""

from pathlib import Path
from qwenpaw.app.workspace.local_workspace import QwenPawLocalWorkspace
from qwenpaw.runtime.builder import AgentBuilder


def test_coordination_turn_overrides_disabled_inter_agent_tools():
    allowed, denied = QwenPawLocalWorkspace._apply_coordination_tool_gates(
        None,
        {"list_agents", "chat_with_agent", "execute_shell_command"},
        {"agent_coordination_requested": True},
    )

    assert allowed is None
    assert "list_agents" not in denied
    assert "chat_with_agent" not in denied
    assert "execute_shell_command" in denied


def test_regular_turn_preserves_disabled_tools():
    allowed, denied = QwenPawLocalWorkspace._apply_coordination_tool_gates(
        None,
        {"chat_with_agent"},
        {},
    )

    assert allowed is None
    assert denied == {"chat_with_agent"}


def test_coordination_turn_loads_packaged_skill_without_installing_it():
    skill_dir = AgentBuilder._resolve_coordination_skill_loader_dir(
        {"agent_coordination_requested": True},
    )

    assert skill_dir is not None
    assert (Path(skill_dir) / "SKILL.md").is_file()
    assert AgentBuilder._resolve_coordination_skill_loader_dir({}) is None


def test_coordination_tools_survive_an_empty_subagent_whitelist():
    def chat_with_agent():
        pass

    def execute_shell_command():
        pass

    tools = AgentBuilder.apply_subagent_tool_whitelist(
        [chat_with_agent, execute_shell_command],
        {
            "subagent_allowed_tools": [],
            "agent_coordination_requested": True,
        },
    )

    assert tools == [chat_with_agent]
