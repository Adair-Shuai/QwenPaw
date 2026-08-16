# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
import subprocess
import sys

r = subprocess.run(
    [
        sys.executable,
        "-m",
        "pytest",
        "tests/unit/tauri/test_component_updater.py::test_delta_directory_component_base_may_be_bundled",
        "--tb=short",
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
lines = [
    l
    for l in out.splitlines()
    if "Error" in l or "update.py" in l or "assert" in l.lower()
]
print("\n".join(lines[:15]))
