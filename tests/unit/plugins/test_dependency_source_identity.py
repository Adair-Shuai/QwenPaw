# -*- coding: utf-8 -*-
"""Source admission compares validated declarations across module reloads."""

import subprocess
import sys
import textwrap

import pytest


@pytest.mark.parametrize("change", ["none", "manifest", "requirements"])
def test_source_admission_after_manifest_module_reload(tmp_path, change):
    """An equivalent model remains valid; changed disk declarations do not."""
    script = textwrap.dedent(
        """
        import importlib
        import json
        import sys
        from pathlib import Path

        from qwenpaw.plugins import architecture
        from qwenpaw.plugins.python_backend import (
            PythonBackend, _read_source_identity,
        )

        source, change = Path(sys.argv[1]), sys.argv[2]
        raw = {"id": "source-admission", "version": "1.0.0", "entry": {}}
        manifest_path = source / "plugin.json"
        manifest_path.write_text(json.dumps(raw), encoding="utf-8")
        requirements = source / "requirements.txt"
        requirements.write_text("packaging>=20\\n", encoding="utf-8")
        manifest = architecture.PluginManifest.from_dict(raw)
        description = PythonBackend(None).describe(source, manifest)
        _read_source_identity(description)

        importlib.reload(architecture)
        if change == "manifest":
            raw["version"] = "2.0.0"
            manifest_path.write_text(json.dumps(raw), encoding="utf-8")
        elif change == "requirements":
            requirements.write_text("packaging>=21\\n", encoding="utf-8")

        try:
            _read_source_identity(description)
        except Exception as exc:
            assert change != "none", str(exc)
            assert str(exc) == "DEPENDENCY_ORIGIN_INVALID", str(exc)
        else:
            assert change == "none", "changed declarations were admitted"
        """,
    )
    result = subprocess.run(
        [sys.executable, "-I", "-c", script, str(tmp_path), change],
        capture_output=True,
        text=True,
        check=False,
        timeout=60,
    )
    assert result.returncode == 0, result.stdout + result.stderr
