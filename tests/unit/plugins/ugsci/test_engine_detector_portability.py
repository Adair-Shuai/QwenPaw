# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Portability regressions for UGSci engine discovery."""

from __future__ import annotations

import json
from contextlib import contextmanager
from pathlib import Path
from types import SimpleNamespace

import pytest

from plugins.bundle.ugsci.engine import detector
from plugins.bundle.ugsci.engine.detector import _find_lmutil
from plugins.bundle.ugsci.engine.manager import EngineInfo


def test_engine_search_preserves_priority_and_depth_bound(tmp_path):
    direct_glob = tmp_path / "preferred-one.exe"
    direct_exact = tmp_path / "fallback.exe"
    known = tmp_path / "bin" / "preferred-two.exe"
    versioned = tmp_path / "2026" / "bin" / "preferred-three.exe"
    too_deep = tmp_path / "2026" / "nested" / "bin" / "preferred-four.exe"
    for candidate in (direct_glob, direct_exact, known, versioned, too_deep):
        candidate.parent.mkdir(parents=True, exist_ok=True)
        candidate.write_text("fixture executable", encoding="utf-8")
    patterns = ["preferred*.exe", "fallback.exe"]
    for expected in (direct_glob, direct_exact, known, versioned):
        assert detector._find_exe_in_dir(
            str(tmp_path),
            patterns,
            ["bin", "exe"],
        ) == str(expected)
        expected.unlink()
    assert (
        detector._find_exe_in_dir(
            str(tmp_path),
            patterns,
            ["bin", "exe"],
        )
        is None
    )
    assert too_deep.is_file()
    assert (
        detector._find_exe_in_dir(
            str(tmp_path / "absent"),
            patterns,
            ["bin"],
        )
        is None
    )


@pytest.mark.parametrize("registry_mode", ["direct", "subkey"])
def test_comsol_registry_keeps_version_priority_and_parent_fallback(
    tmp_path,
    monkeypatch,
    registry_mode,
):
    for version in ("60", "62"):
        executable = (
            tmp_path / f"COMSOL{version}" / "bin" / "win64" / "comsol.exe"
        )
        executable.parent.mkdir(parents=True)
        executable.write_text("fixture executable", encoding="utf-8")
    for variable in ("COMSOLROOT", "COMSOL_HOME"):
        monkeypatch.delenv(variable, raising=False)
    monkeypatch.setattr(detector.shutil, "which", lambda _command: None)
    monkeypatch.setattr(
        detector,
        "_get_from_registry",
        lambda _key: str(tmp_path) if registry_mode == "direct" else None,
    )
    monkeypatch.setattr(
        detector,
        "_get_from_registry_subkeys",
        lambda _key: [
            ("COMSOL62", str(tmp_path / "COMSOL62" / "bin" / "win64")),
        ],
    )
    detected = detector._detect_comsol(EngineInfo(id="comsol", name="COMSOL"))
    assert detected.status == "detected"
    assert detected.executable_path == str(
        tmp_path / "COMSOL62" / "bin" / "win64" / "comsol.exe",
    )
    assert detected.install_dir == str(tmp_path / "COMSOL62")
    assert detected.version == "6.2"


@pytest.mark.parametrize(
    ("case", "expected_error", "expected_license", "expected_ok"),
    [
        ("ok", None, "ok", True),
        ("errors", "case_errors_2", "ok", False),
        ("no_error_count", None, "ok", True),
        ("no_end", "no_ecle_end", "unknown", False),
        ("denied", "license_denied", "no_license", False),
        ("no_prt_license", "license_denied", "no_license", False),
        ("no_prt", "no_prt_file", "unknown", False),
        ("timeout", "timeout", "", False),
    ],
)
def test_smoke_probe_keeps_file_evidence_and_license_outcomes(
    tmp_path,
    monkeypatch,
    case,
    expected_error,
    expected_license,
    expected_ok,
):
    executable = tmp_path / "e300.exe"
    executable.write_text("fixture executable", encoding="utf-8")
    engine = EngineInfo(
        id="eclipse",
        name="Eclipse",
        executable_path=str(executable),
    )
    engine.extra_info["sub_product"] = "ECLIPSE_300"
    probe_directories = []

    def probe(command, **options):
        assert command == [str(executable), "SMOKE"]
        assert options["check"] is False
        assert options["timeout"] == 30
        directory = Path(options["cwd"])
        probe_directories.append(directory)
        assert (directory / "SMOKE.DATA").read_text(encoding="utf-8") == (
            detector._SMOKE_TEST_DECK
        )
        if case == "timeout":
            raise detector.subprocess.TimeoutExpired(command, 30)
        if case.startswith("no_prt"):
            return SimpleNamespace(
                returncode=1,
                stdout="license unavailable"
                if case == "no_prt_license"
                else "",
                stderr="",
            )
        content = "ECLIPSE 2026.1 (Build 88.3)\n"
        if case == "denied":
            content += "cannot get license\n"
        elif case != "no_error_count":
            content += "Errors 2\n" if case == "errors" else "Errors 0\n"
        (directory / "SMOKE.PRT").write_text(content, encoding="latin-1")
        if case != "no_end":
            (directory / "SMOKE.ECLEND").write_text(
                "finished",
                encoding="ascii",
            )
        return SimpleNamespace(returncode=0, stdout="", stderr="")

    monkeypatch.setattr(detector.subprocess, "run", probe)
    detector._run_smoke_test(engine)
    result = engine.extra_info["smoke_test"]
    assert result["ok"] is expected_ok
    assert result["error"] == expected_error
    assert engine.license_status == expected_license
    assert len(probe_directories) == 1
    assert not probe_directories[0].exists()
    if case == "timeout":
        assert result["duration_sec"] == 30.0
    if case in {"ok", "errors", "no_error_count", "no_end"}:
        assert engine.version == "2026.1"
        assert engine.build == "88.3"
        assert result["extracted_version"] == "2026.1"
        assert result["extracted_build"] == "88.3"
        expected_outputs = ["SMOKE.DATA", "SMOKE.PRT"]
        if case != "no_end":
            expected_outputs.append("SMOKE.ECLEND")
        assert result["outputs"] == sorted(expected_outputs)


def test_vendor_registry_keeps_order_and_skips_inaccessible_keys(
    tmp_path,
    monkeypatch,
):
    direct, child, wow = [
        tmp_path / name for name in ("direct", "child", "wow")
    ]
    for path in (direct, child, wow):
        path.mkdir()
    root = "SOFTWARE\\Vendor"
    tree = {
        (1, root): ({"Root": str(direct)}, ["denied", "v2"]),
        (1, root + "\\v2"): ({"Root": str(child)}, []),
        (1, "SOFTWARE\\WOW6432Node\\Vendor"): ({"Root": str(wow)}, []),
    }

    @contextmanager
    def open_key(hive, path):
        if path.endswith("\\denied"):
            raise PermissionError(path)
        if (hive, path) not in tree:
            raise FileNotFoundError(path)
        yield (hive, path)

    def query_value(handle, name):
        values, _ = tree[handle]
        if name not in values:
            raise FileNotFoundError(name)
        return values[name], 1

    def enum_key(handle, index):
        _, children = tree[handle]
        if index >= len(children):
            raise OSError("end of registry keys")
        return children[index]

    registry = SimpleNamespace(
        HKEY_LOCAL_MACHINE=1,
        HKEY_CURRENT_USER=2,
        OpenKey=open_key,
        QueryValueEx=query_value,
        EnumKey=enum_key,
    )
    monkeypatch.setattr(detector, "winreg", registry)
    monkeypatch.setattr(detector.platform, "system", lambda: "Windows")
    assert detector._get_from_registry_subkeys(
        "Vendor",
        ["Missing", "Root"],
    ) == [
        ("", str(direct)),
        ("v2", str(child)),
        ("", str(wow)),
    ]


def test_legacy_cmg_prefers_existing_subdirectory_and_manifest(
    tmp_path,
    monkeypatch,
):
    preferred = tmp_path / "IMEX" / "exe" / "mx202530.exe"
    fallback = tmp_path / "IMEX" / "bin" / "mx202630.exe"
    for path in (preferred, fallback):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("fixture executable", encoding="utf-8")
    manifest = tmp_path / "InstallManifest" / "MF_IMEX.xml"
    manifest.parent.mkdir()
    manifest.write_text(
        "<ProductVersion>2025.12</ProductVersion>",
        encoding="utf-8",
    )
    monkeypatch.setenv("CMG_HOME", str(tmp_path))
    monkeypatch.setattr(detector, "_get_from_registry", lambda _key: None)
    monkeypatch.setattr(detector.shutil, "which", lambda _command: None)
    engine = detector._detect_cmg(EngineInfo(id="cmg", name="CMG"))
    assert engine.status == "detected"
    assert engine.executable_path == str(preferred)
    assert engine.version == "2025.12"
    assert engine.modules == ["IMEX"]


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
