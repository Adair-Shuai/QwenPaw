# -*- coding: utf-8 -*-
"""Regression checks for desktop plugin startup ordering."""

from __future__ import annotations

import ast
from pathlib import Path

APP_SOURCE = (
    Path(__file__).resolve().parents[3] / "src" / "qwenpaw" / "app" / "_app.py"
)


def _background_startup_node() -> ast.AsyncFunctionDef:
    tree = ast.parse(APP_SOURCE.read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.AsyncFunctionDef)
            and node.name == "_background_startup"
        ):
            return node
    raise AssertionError("_background_startup was not found")


def test_frontend_plugins_are_published_before_agent_startup() -> None:
    """Slow or broken MCP startup must not hide bundled desktop plugins."""
    startup = _background_startup_node()

    agent_start_lines = [
        node.lineno
        for node in ast.walk(startup)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "start_all_configured_agents"
    ]
    unrestricted_load_lines = [
        node.lineno
        for node in ast.walk(startup)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "load_all_plugins"
        and not any(keyword.arg == "types" for keyword in node.keywords)
    ]
    loader_publish_lines = [
        node.lineno
        for node in ast.walk(startup)
        if isinstance(node, ast.Assign)
        and any(
            isinstance(target, ast.Attribute)
            and target.attr == "plugin_loader"
            and isinstance(target.value, ast.Attribute)
            and target.value.attr == "state"
            for target in node.targets
        )
    ]
    activation_reconcile_lines = [
        node.lineno
        for node in ast.walk(startup)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr in {"finalize_activation", "rollback_activation"}
    ]

    assert agent_start_lines, "agent startup call was not found"
    assert unrestricted_load_lines, "full plugin load call was not found"
    assert (
        loader_publish_lines
    ), "app.state.plugin_loader assignment was not found"
    assert (
        activation_reconcile_lines
    ), "component health reconciliation was not found"

    agent_start = min(agent_start_lines)
    assert min(unrestricted_load_lines) < agent_start
    assert min(loader_publish_lines) < agent_start
    assert max(activation_reconcile_lines) < agent_start


def test_registry_and_runtime_readiness_are_distinct() -> None:
    """Menus may publish early, but runtime-ready waits for startup hooks."""
    startup = _background_startup_node()
    state_lines: dict[str, list[int]] = {}
    hook_invoke_lines: list[int] = []

    for node in ast.walk(startup):
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Dict):
            mapping = {
                key.value: value.value
                for key, value in zip(node.value.keys, node.value.values)
                if isinstance(key, ast.Constant)
                and isinstance(key.value, str)
                and isinstance(value, ast.Constant)
            }
            state = mapping.get("state")
            if isinstance(state, str):
                state_lines.setdefault(state, []).append(node.lineno)
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Name)
            and node.func.id == "invoke_plugin_callback"
        ):
            hook_invoke_lines.append(node.lineno)

    assert state_lines.get("registry_ready")
    assert state_lines.get("ready")
    assert hook_invoke_lines
    assert min(state_lines["registry_ready"]) < min(hook_invoke_lines)
    assert max(state_lines["ready"]) > max(hook_invoke_lines)
