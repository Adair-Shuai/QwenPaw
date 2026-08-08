# -*- coding: utf-8 -*-
"""Portability regressions for UGSci engine discovery."""

from __future__ import annotations

import json
from pathlib import Path

from plugins.bundle.ugsci.engine.detector import _find_lmutil
from plugins.bundle.ugsci.engine.manager import EngineInfo


def test_bundled_engine_templates_do_not_contain_machine_paths() -> None:
    """Bundled templates must be portable and rely on detection at runtime."""
    engine_dir = Path("plugins/bundle/ugsci/engines")

    for config_path in engine_dir.glob("*.json"):
        config = json.loads(config_path.read_text(encoding="utf-8"))
        assert config["executable_path"] == ""
        assert config["install_dir"] == ""
        assert config["license_server"] == ""


def test_find_lmutil_derives_path_from_detected_engine(
    tmp_path: Path,
    monkeypatch,
) -> None:
    """License utility lookup follows the detected installation root."""
    monkeypatch.delenv("LMUTIL_PATH", raising=False)
    monkeypatch.delenv("LMUTIL", raising=False)
    monkeypatch.setattr("shutil.which", lambda _command: None)

    install_root = tmp_path / "simulator" / "2025.1"
    executable = install_root / "bin" / "e300.exe"
    executable.parent.mkdir(parents=True)
    executable.write_text("stub", encoding="utf-8")

    lmutil = tmp_path / "simulator" / "home" / "lmutil.exe"
    lmutil.parent.mkdir(parents=True)
    lmutil.write_text("stub", encoding="utf-8")

    engine = EngineInfo(
        id="eclipse",
        name="Eclipse",
        executable_path=str(executable),
        install_dir=str(install_root),
    )

    assert _find_lmutil(engine) == str(lmutil)


def test_find_lmutil_honors_explicit_environment_override(
    tmp_path: Path,
    monkeypatch,
) -> None:
    """An explicit LMUTIL_PATH takes precedence over derived locations."""
    lmutil = tmp_path / "custom" / "lmutil"
    lmutil.parent.mkdir()
    lmutil.write_text("stub", encoding="utf-8")
    monkeypatch.setenv("LMUTIL_PATH", str(lmutil))
    monkeypatch.setattr("shutil.which", lambda _command: None)

    engine = EngineInfo(id="eclipse", name="Eclipse")

    assert _find_lmutil(engine) == str(lmutil)
