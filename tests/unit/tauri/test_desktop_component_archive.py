# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
import os
import stat
import tarfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "scripts" / "pack-tauri" / "desktop_component_archive.py"


def _load():
    spec = importlib.util.spec_from_file_location(
        "desktop_component_archive",
        SCRIPT,
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_archive_preserves_hidden_files_and_executable_mode(tmp_path):
    module = _load()
    source = tmp_path / "src" / "binaries"
    runtime = source / "runtimes" / "python" / "3.11"
    runtime.mkdir(parents=True)
    executable = runtime / "python"
    executable.write_bytes(b"runtime")
    executable.chmod(0o755)
    (runtime / ".python-runtime-version").write_text(
        "3.11",
        encoding="utf-8",
    )
    archive = tmp_path / "components.tar"
    output = tmp_path / "output"

    module.pack(source, archive)
    with tarfile.open(archive, "r:") as bundle:
        stored = bundle.getmember("binaries/runtimes/python/3.11/python")
        if os.name != "nt":
            assert stat.S_IMODE(stored.mode) == 0o755
    module.extract(archive, output)

    restored = output / "binaries" / "runtimes" / "python" / "3.11"
    assert (restored / ".python-runtime-version").read_text(
        encoding="utf-8",
    ) == "3.11"
    if os.name != "nt":
        assert stat.S_IMODE((restored / "python").stat().st_mode) == 0o755
