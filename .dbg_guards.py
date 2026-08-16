# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
import subprocess
import sys

for name, f in [
    (
        "test_old_owner_cannot_delete_reclaimed_lease",
        "test_component_client.py",
    ),
    (
        "test_install_uses_cross_process_component_lock",
        "test_component_service.py",
    ),
]:
    r = subprocess.run(
        [
            sys.executable,
            "-m",
            "pytest",
            f"tests/unit/tauri/{f}::{name}",
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
        if "Error" in l or "assert" in l.lower() or ".py:" in l
    ]
    print(f"===== {name} =====")
    print("\n".join(lines[:12]).encode("ascii", "replace").decode("ascii"))
    print()
