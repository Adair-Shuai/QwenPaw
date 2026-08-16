# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
import subprocess
import sys

names = [
    "test_directory_recovery_completes_applied_candidate",
    "test_directory_recovery_discards_partial_candidate",
    "test_directory_recovery_clears_orphan_previous",
    "test_gc_removes_superseded_versions_keeps_active_and_latest",
    "test_gc_never_removes_active_version",
    "test_remove_readonly_clears_readonly_bit",
]
r = subprocess.run(
    [
        sys.executable,
        "-m",
        "pytest",
        *[f"tests/unit/tauri/test_component_updater.py::{n}" for n in names],
        "--tb=line",
        "-p",
        "no:cacheprovider",
        "-q",
    ],
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace",
)
out = (r.stdout or "") + (r.stderr or "")
print(out[-2500:])
