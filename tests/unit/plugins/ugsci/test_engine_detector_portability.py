# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Portability regressions for UGSci engine discovery."""

from __future__ import annotations

import json
from pathlib import Path

from plugins.bundle.ugsci.engine import detector
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


def test_engine_detector_does_not_guess_machine_install_roots() -> None:
    """Discovery must use configuration, registry, or PATH, not drive scans."""
    detector_source = Path(
        "plugins/bundle/ugsci/engine/detector.py",
    ).read_text(encoding="utf-8")

    for forbidden in (
        "_get_available_drives",
        "_build_search_paths",
        '"Program Files"',
        '"Program Files (x86)"',
        "common_path",
    ):
        assert forbidden not in detector_source


def test_comsol_detection_honors_environment_root(
    tmp_path: Path,
    monkeypatch,
) -> None:
    """An explicit COMSOLROOT is portable and needs no guessed install path."""
    install_root = tmp_path / "vendor-root"
    executable = (
        install_root
        / "COMSOL62"
        / "Multiphysics"
        / "bin"
        / "win64"
        / "comsol.exe"
    )
    executable.parent.mkdir(parents=True)
    executable.write_text("stub", encoding="utf-8")

    monkeypatch.setenv("COMSOLROOT", str(install_root))
    monkeypatch.setattr(detector, "_get_from_registry", lambda _key: None)
    monkeypatch.setattr(
        detector,
        "_get_from_registry_subkeys",
        lambda _key: [],
    )
    monkeypatch.setattr(detector.shutil, "which", lambda _command: None)

    engine = EngineInfo(id="comsol", name="COMSOL")
    detected = detector._detect_comsol(engine)

    assert detected.status == "detected"
    assert detected.executable_path == str(executable)
    assert detected.install_dir == str(install_root / "COMSOL62")


def test_cmg_detection_honors_environment_root(
    tmp_path: Path,
    monkeypatch,
) -> None:
    install_root = tmp_path / "cmg-root"
    executable = (
        install_root / "IMEX" / "2025.30" / "Win_x64" / "EXE" / "mx202530.exe"
    )
    executable.parent.mkdir(parents=True)
    executable.write_text("stub", encoding="utf-8")

    monkeypatch.setenv("CMG_HOME", str(install_root))
    monkeypatch.setattr(detector, "_get_from_registry", lambda _key: None)
    monkeypatch.setattr(detector.shutil, "which", lambda _command: None)

    detected = detector._detect_cmg(EngineInfo(id="cmg", name="CMG"))

    assert detected.status == "detected"
    assert detected.executable_path == str(executable)
    assert detected.install_dir == str(install_root)


def test_eclipse_detection_honors_environment_root(
    tmp_path: Path,
    monkeypatch,
) -> None:
    install_root = tmp_path / "slb-root"
    executable = install_root / "2025.1" / "bin" / "pc_x86_64" / "e300.exe"
    executable.parent.mkdir(parents=True)
    executable.write_text("stub", encoding="utf-8")

    monkeypatch.setenv("ECLIPSE_HOME", str(install_root))
    monkeypatch.setenv("PATH", "")
    monkeypatch.setattr(
        detector,
        "_search_registry_for_schlumberger",
        lambda _names: None,
    )
    monkeypatch.setattr(
        detector,
        "_verify_schlumberger_license",
        lambda _engine: None,
    )

    detected = detector._strategy_eclipse(
        EngineInfo(id="eclipse", name="Eclipse"),
    )

    assert detected.status == "detected"
    assert detected.executable_path == str(executable)
    assert detected.install_dir == str(install_root / "2025.1")


def test_intersect_detection_honors_environment_root(
    tmp_path: Path,
    monkeypatch,
) -> None:
    install_root = tmp_path / "slb-root"
    executable = install_root / "2025.1" / "IX" / "x64_ilmpi" / "ix.exe"
    executable.parent.mkdir(parents=True)
    executable.write_text("stub", encoding="utf-8")

    monkeypatch.setenv("INTERSECT_HOME", str(install_root))
    monkeypatch.setenv("PATH", "")
    monkeypatch.setattr(
        detector,
        "_search_registry_for_schlumberger",
        lambda _names: None,
    )
    monkeypatch.setattr(
        detector,
        "_verify_schlumberger_license",
        lambda _engine: None,
    )

    detected = detector._strategy_intersect(
        EngineInfo(id="intersect", name="Intersect"),
    )

    assert detected.status == "detected"
    assert detected.executable_path == str(executable)
    assert detected.install_dir == str(install_root / "2025.1")
    assert detected.extra_info["sub_product"] == "INTERSECT"


def test_tnavigator_detection_honors_configured_root(
    tmp_path: Path,
    monkeypatch,
) -> None:
    install_root = tmp_path / "tnav-root"
    executable = install_root / "bin" / "tnav.exe"
    executable.parent.mkdir(parents=True)
    executable.write_text("stub", encoding="utf-8")

    monkeypatch.setattr(detector, "_get_from_registry", lambda _key: None)
    monkeypatch.setattr(detector.shutil, "which", lambda _command: None)
    monkeypatch.setattr(
        detector,
        "_extract_version_from_exe",
        lambda _path: None,
    )

    detected = detector._strategy_tnavigator(
        EngineInfo(
            id="tnavigator",
            name="tNavigator",
            extra_paths=[str(install_root)],
        ),
    )

    assert detected.status == "detected"
    assert detected.executable_path == str(executable)
    assert detected.install_dir == str(install_root)


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
