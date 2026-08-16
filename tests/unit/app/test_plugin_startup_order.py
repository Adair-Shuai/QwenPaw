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
    assert min(loader_publish_lines) < min(unrestricted_load_lines)
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


def test_directory_components_skip_plugin_health_check_rollback() -> None:
    """P0-2 guard: directory components must be skipped in the health loop.

    A directory component (backend, runtimes) is not a plugin, so
    ``loaded_plugins.get(id)`` is always None. Without the skip, the health
    check would "roll back" every successfully updated directory component,
    find no previous tree, and delete its freshly committed active.json
    record -- permanently breaking updates for that component. This scans the
    health-check loop and requires the ``is_directory_component`` guard to
    appear before the rollback call.
    """
    startup = _background_startup_node()
    loop_lines = {
        "guard": [],
        "rollback": [],
    }
    for node in ast.walk(startup):
        if not isinstance(node, ast.Call):
            continue
        func = node.func
        attr = func.attr if isinstance(func, ast.Attribute) else None
        if attr == "is_directory_component":
            loop_lines["guard"].append(node.lineno)
        elif attr == "rollback_activation":
            loop_lines["rollback"].append(node.lineno)
    assert loop_lines[
        "rollback"
    ], "rollback_activation call not found in _background_startup"
    assert loop_lines["guard"], (
        "health-check loop must skip directory components via "
        "is_directory_component before any rollback (P0-2 regression)"
    )
    assert min(loop_lines["guard"]) < max(
        loop_lines["rollback"],
    ), "the is_directory_component skip must precede the rollback call"


def test_bundled_candidates_are_health_checked_before_agent_startup() -> None:
    """Bundled software upgrades must finalize or roll back after loading."""
    startup = _background_startup_node()
    calls: dict[str, list[int]] = {
        "load_all_plugins": [],
        "finalize_bundled_plugin_activation": [],
        "rollback_bundled_plugin_activation": [],
        "start_all_configured_agents": [],
    }
    for node in ast.walk(startup):
        if not isinstance(node, ast.Call):
            continue
        func = node.func
        name = (
            func.attr
            if isinstance(func, ast.Attribute)
            else func.id
            if isinstance(func, ast.Name)
            else None
        )
        if name in calls:
            calls[name].append(node.lineno)

    assert calls["finalize_bundled_plugin_activation"]
    assert calls["rollback_bundled_plugin_activation"]
    assert max(calls["load_all_plugins"]) < min(
        calls["finalize_bundled_plugin_activation"],
    )
    assert max(calls["rollback_bundled_plugin_activation"]) < min(
        calls["start_all_configured_agents"],
    )
