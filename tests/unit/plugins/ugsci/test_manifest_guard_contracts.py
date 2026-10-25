# -*- coding: utf-8 -*-
"""Preserve manifest validation and team guards in both plugin bundles."""

import importlib
import json

import pytest


pytestmark = pytest.mark.parametrize(
    "namespace",
    ["plugins.bundle.ugsci", "qwenpaw.plugins_bundle.ugsci"],
)


def _tool_spec(**changes):
    return {
        "name": "guarded_tool",
        "group": "domain",
        "description": "A guarded tool",
        "icon": "file",
        "enabled_by_default": False,
        "tool_type": "file",
        "target_param": "path",
        **changes,
    }


def _write_manifest(root, tools):
    (root / "plugin.json").write_text(
        json.dumps({"meta": {"tools": tools}}),
        encoding="utf-8",
    )


@pytest.mark.parametrize("plan", [None, {}, [], False, {"steps": ["first"]}])
def test_team_plan_guard_returns_boolean_without_changing_protected_paths(
    namespace,
    tmp_path,
    plan,
):
    module = importlib.import_module(f"{namespace}.team.state_guard")
    guard = module.TeamStateWriteGuard(tmp_path)
    root = tmp_path / ".qwenpaw/ugsci_teams/run"
    root.mkdir(parents=True)
    (root / "state.json").write_text(
        json.dumps({"artifact_protocol": 1, "artifact_plan": plan}),
        encoding="utf-8",
    )
    assert guard.blocked(
        "write_file",
        {"path": str(root / "handoffs/plan.json")},
    ) is bool(plan)
    for path in (
        "state.json",
        "artifacts/result.json",
        "results/result.json",
        "reviews/verify-report.json",
        "handoffs/final-report.md",
    ):
        assert guard.blocked("edit_file", {"file_path": str(root / path)})
        assert not guard.blocked("read_file", {"file_path": str(root / path)})
    assert guard.blocked("write_file", {"file_path": None}) is False
    assert (
        guard.blocked(
            "write_file",
            {"file_path": str(root / "candidates/new.json")},
        )
        is False
    )


def test_tool_manifest_checks_duplicate_names_before_filtering(
    namespace,
    tmp_path,
):
    module = importlib.import_module(f"{namespace}.tool_manifest")
    _write_manifest(
        tmp_path,
        [_tool_spec(), _tool_spec(name="simulation_tool", group="simulation")],
    )
    specs = module.load_tool_manifest(tmp_path, groups=["domain"])
    assert [spec.name for spec in specs] == ["guarded_tool"]
    assert specs[0].target_param == "path"
    _write_manifest(tmp_path, [_tool_spec(), _tool_spec(group="simulation")])
    with pytest.raises(
        module.ToolManifestError,
        match="duplicate tool declaration",
    ):
        module.load_tool_manifest(tmp_path, groups=["domain"])


@pytest.mark.parametrize(
    ("changes", "message"),
    [
        ({"name": ""}, "name is invalid"),
        ({"group": "unknown"}, "invalid group"),
        ({"description": ""}, "no description"),
        ({"icon": ""}, "no icon"),
        ({"enabled_by_default": "false"}, "must be boolean"),
        ({"tool_type": "unknown"}, "invalid tool_type"),
        ({"target_param": None}, "target_param is invalid"),
    ],
)
def test_tool_manifest_keeps_field_validation(
    namespace,
    tmp_path,
    changes,
    message,
):
    module = importlib.import_module(f"{namespace}.tool_manifest")
    _write_manifest(tmp_path, [_tool_spec(**changes)])
    with pytest.raises(module.ToolManifestError, match=message):
        module.load_tool_manifest(tmp_path)


def test_tool_manifest_keeps_callable_and_target_binding_validation(
    namespace,
    tmp_path,
):
    module = importlib.import_module(f"{namespace}.tool_manifest")
    _write_manifest(tmp_path, [_tool_spec()])

    def implementation(path):
        return path

    bindings = {"guarded_tool": implementation}
    assert (
        module.validate_tool_bindings(tmp_path, bindings)[0].name
        == "guarded_tool"
    )
    with pytest.raises(module.ToolManifestError, match="cannot inspect tool"):
        module.validate_tool_bindings(tmp_path, {"guarded_tool": object()})
    with pytest.raises(
        module.ToolManifestError,
        match="not present in its signature",
    ):
        module.validate_tool_bindings(tmp_path, {"guarded_tool": lambda: None})
    with pytest.raises(module.ToolManifestError, match="bindings mismatch"):
        module.validate_tool_bindings(tmp_path, {})
