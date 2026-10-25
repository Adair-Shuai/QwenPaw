# -*- coding: utf-8 -*-
"""Mutation tests: guards reject test loss without touching real sources."""

import importlib.util
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
