# -*- coding: utf-8 -*-
"""Execute real pytest shards and prove complete, disjoint coverage."""

from __future__ import annotations

import os
from pathlib import Path
import subprocess
import sys

import pytest
import yaml

ROOT = Path(__file__).resolve().parents[3]
RUNNER = ROOT / "scripts" / "run_unit_tests.py"


@pytest.mark.parametrize("fail", [False, True])
def test_unit_shards_execute_every_case_once_and_propagate_failures(
    tmp_path,
    fail,
):
    (tmp_path / "pytest.ini").write_text("[pytest]\n", encoding="utf-8")
    (tmp_path / "test_probe.py").write_text(
        "import os, pytest\n"
        "@pytest.mark.parametrize('case', range(50))\n"
        "def test_case(case):\n"
        "    with open(os.environ['SHARD_LOG'], 'a') as out:\n"
        "        out.write(str(case) + '\\n')\n"
        "    assert not (os.environ['FAIL_PROBE'] == '1' and case == 7)\n",
        encoding="utf-8",
    )
    env = {
        **os.environ,
        "PYTEST_DISABLE_PLUGIN_AUTOLOAD": "1",
        "FAIL_PROBE": "1" if fail else "0",
    }
    arguments = ["-q", "-c", "pytest.ini", "test_probe.py"]

    def run(command, name):
        log = tmp_path / f"{name}.log"
        result = subprocess.run(
            command + arguments,
            cwd=tmp_path,
            env={**env, "SHARD_LOG": str(log)},
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
        assert result.returncode in {0, 1}, result.stdout + result.stderr
        return result.returncode, log.read_text().splitlines()

    baseline_code, baseline = run([sys.executable, "-m", "pytest"], "baseline")
    assert baseline_code == int(fail)
    parts, failures = [], 0
    for index in range(4):
        code, cases = run(
            [
                sys.executable,
                str(RUNNER),
                "--shard-count",
                "4",
                "--shard-index",
                str(index),
            ],
            str(index),
        )
        assert cases
        failures += code
        parts.extend(cases)
    assert failures == int(fail)
    assert sorted(parts) == sorted(baseline)
    assert len(parts) == len(set(parts)) == 50


@pytest.mark.parametrize("index,count", [(-1, 4), (4, 4), (0, 0)])
def test_unit_shards_reject_invalid_partition(index, count):
    result = subprocess.run(
        [
            sys.executable,
            str(RUNNER),
            "--shard-index",
            str(index),
            "--shard-count",
            str(count),
        ],
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
    assert result.returncode == 2
    assert "Require 0 <= shard-index < shard-count" in result.stderr


def test_windows_matrix_runs_all_four_unit_shards_and_app_contracts_once():
    workflow = yaml.safe_load(
        (ROOT / ".github/workflows/full-tests-nightly.yml").read_text("utf-8"),
    )
    unit = workflow["jobs"]["unit-tests"]
    windows = [
        entry
        for entry in unit["strategy"]["matrix"]["include"]
        if entry["os"] == "windows-latest"
    ]
    assert sorted(entry["shard_index"] for entry in windows) == list(range(4))
    steps = {step.get("name"): step for step in unit["steps"]}
    assert (
        "scripts/run_unit_tests.py --shard-count 4"
        in steps["Run unit tests"]["run"]
    )
    for name in (
        "Verify document forms application contracts",
        "Verify real OfficeCLI engine contracts",
    ):
        assert "matrix.shard_index == 0" in steps[name]["if"]
