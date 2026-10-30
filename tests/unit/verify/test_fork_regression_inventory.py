# -*- coding: utf-8 -*-
"""Mutation tests: guards reject test loss without touching real sources."""

import importlib.util
import fnmatch
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location(
    "fork_inventory",
    ROOT / "scripts/verify_fork_regressions.py",
)
assert spec is not None and spec.loader is not None
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


def test_current_backend_fork_inventory_is_complete():
    assert guard.verify_inventory()


@pytest.mark.parametrize(
    "source",
    [
        "# def test_required(): pass\ndef test_other(): assert True",
        "@pytest.mark.skip\ndef test_required(): assert True",
        (
            "@pytest.mark.skipif(True)\nclass TestRemoved:\n"
            " def test_required(self): assert True"
        ),
        "pytestmark = pytest.mark.xfail\ndef test_required(): assert True",
        "def test_required():\n 'preserved title only'\n pass",
        "def test_required(): return True",
        "def test_required(): pytest.skip('feature removed')",
    ],
)
def test_missing_disabled_or_empty_critical_cases_block_merge(
    tmp_path,
    source,
):
    (tmp_path / "test_feature.py").write_text(source)
    inventory = {
        "groups": {"feature": ["test_feature.py"]},
        "required_cases": {"test_feature.py": ["test_required"]},
    }
    with pytest.raises(ValueError):
        guard.verify_inventory(tmp_path, inventory)


def test_missing_suite_blocks_merge(tmp_path):
    with pytest.raises(ValueError, match="suite missing"):
        guard.verify_inventory(
            tmp_path,
            {"groups": {"feature": ["removed.py"]}},
        )


def test_protected_suite_cannot_be_removed_only_from_execution_list(tmp_path):
    (tmp_path / "other.py").write_text("def test_other(): assert True")
    with pytest.raises(ValueError, match="execution inventory"):
        guard.verify_inventory(
            tmp_path,
            {
                "groups": {"feature": ["other.py"]},
                "required_cases": {"lost.py": ["test_required"]},
            },
        )


@pytest.mark.parametrize(
    "source",
    [
        '{"groups": {"feature": ["test_real.py"], "feature": []}}',
        (
            '{"required_cases": {"test_feature.py": ["test_original"], '
            '"test_feature.py": ["test_new"]}}'
        ),
        '{"required_cases": {"test_feature.py": ["test_real"]}, '
        '"required_cases": {}}',
    ],
)
def test_duplicate_inventory_keys_cannot_silently_remove_protected_cases(
    tmp_path,
    source,
):
    path = tmp_path / "inventory.json"
    path.write_text(source, encoding="utf-8")
    with pytest.raises(ValueError, match="Duplicate fork inventory key"):
        guard.load_inventory(path)


def test_ci_retains_fork_inventory_gates_and_application_tests():
    import yaml

    for name in ("tests.yml", "full-tests-nightly.yml"):
        workflow = yaml.safe_load(
            (ROOT / ".github/workflows" / name).read_text(encoding="utf-8"),
        )
        steps = workflow["jobs"]["unit-tests"]["steps"]
        commands = "\n".join(step.get("run", "") for step in steps)
        assert "python scripts/verify_fork_regressions.py --check" in commands
        assert (
            "python scripts/verify_update_regressions.py --check" in commands
        )
        assert "pytest plugins/apps/document-forms/tests" in commands
        build_index = next(
            index
            for index, step in enumerate(steps)
            if step.get("name")
            == "Build OpenUI runtime for plugin archive contracts"
        )
        test_index = next(
            index
            for index, step in enumerate(steps)
            if step.get("name") == "Run unit tests"
        )
        assert build_index < test_index
        build = steps[build_index]
        assert not build.get("continue-on-error", False)
        assert (
            "npm --prefix plugins/bundle/qwenpaw-openui/frontend ci"
            in build["run"]
        )
        assert (
            "npm --prefix plugins/bundle/qwenpaw-openui/frontend run build"
            in build["run"]
        )
        if name == "tests.yml":
            triggers = workflow.get("on", workflow.get(True))
            assert "lobehub-style" in triggers["push"]["branches"]
            assert "lobehub-style" in triggers["pull_request"]["branches"]
            assert "plugins/bundle/**" in triggers["push"]["paths"]
            assert (
                "plugins/apps/document-forms/**" in triggers["push"]["paths"]
            )
    frontend = (ROOT / ".github/workflows/frontend-tests.yml").read_text(
        encoding="utf-8",
    )
    assert "node scripts/verify-fork-features.mjs --check" in frontend
    assert "npx tsc -b --noEmit" in frontend
    nightly = yaml.safe_load(
        (ROOT / ".github/workflows/full-tests-nightly.yml").read_text(
            encoding="utf-8",
        ),
    )
    commands = "\n".join(
        step.get("run", "")
        for step in nightly["jobs"]["frontend-tests"]["steps"]
    )
    assert "node scripts/verify-fork-features.mjs --check" in commands
    assert "npx tsc -b --noEmit" in commands


@pytest.mark.parametrize(
    "changed_path",
    [
        (
            "plugins/bundle/qwenpaw-openui/frontend/src/interactions/"
            "InteractionForm.tsx"
        ),
        "plugins/bundle/qwenpaw-openui/dist/index.js",
        "plugins/bundle/qwenpaw-run-center/ui/src/index.tsx",
        "plugins/bundle/ugsci/static/index.js",
        "plugins/apps/uideas/ui/index.js",
        "plugins/apps/uproject/ui/index.js",
        "src/qwenpaw/plugins_bundle/ugsci/ui/dist/index.js",
    ],
)
def test_shipped_plugin_changes_trigger_frontend_behavior_regressions(
    changed_path,
):
    import yaml

    workflow = yaml.safe_load(
        (ROOT / ".github/workflows/frontend-tests.yml").read_text(
            encoding="utf-8",
        ),
    )
    triggers = workflow.get("on", workflow.get(True))
    push_paths = triggers["push"]["paths"]
    steps = workflow["jobs"]["changes"]["steps"]
    filter_step = next(step for step in steps if step.get("id") == "filter")
    pr_paths = yaml.safe_load(filter_step["with"]["filters"])["code"]
    for event, patterns in (("push", push_paths), ("pull_request", pr_paths)):
        assert any(
            fnmatch.fnmatchcase(changed_path, pattern) for pattern in patterns
        ), f"{event} silently skips frontend regressions for {changed_path}"


def test_frontend_ci_builds_real_plugin_bundles_before_inventory_and_tests():
    import yaml

    for name, job in (
        ("frontend-tests.yml", "vitest"),
        ("full-tests-nightly.yml", "frontend-tests"),
    ):
        workflow = yaml.safe_load(
            (ROOT / ".github/workflows" / name).read_text(encoding="utf-8"),
        )
        steps = workflow["jobs"][job]["steps"]
        guard_index = next(
            index
            for index, step in enumerate(steps)
            if "node scripts/verify-fork-features.mjs --check"
            in step.get("run", "")
        )
        for command in (
            "npm --prefix plugins/bundle/qwenpaw-openui/frontend test",
            "npm --prefix plugins/bundle/qwenpaw-run-center/ui run build",
        ):
            index = next(
                index
                for index, step in enumerate(steps)
                if command in step.get("run", "")
            )
            assert index < guard_index
            assert not steps[index].get("continue-on-error", False)
