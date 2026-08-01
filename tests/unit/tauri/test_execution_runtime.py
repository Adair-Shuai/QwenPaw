# -*- coding: utf-8 -*-
# pylint: disable=protected-access,missing-function-docstring
from __future__ import annotations

import os

from qwenpaw.tauri import execution_runtime


def test_builtin_selection_uses_bundled_python(monkeypatch, tmp_path):
    python = tmp_path / "python.exe"
    python.write_bytes(b"")
    monkeypatch.setenv("QWENPAW_DESKTOP_PY_RUNTIME", str(python))
    monkeypatch.setenv("QWENPAW_EXECUTION_PYTHON_MODE", "")
    monkeypatch.setenv("QWENPAW_EXECUTION_PYTHON", "")
    monkeypatch.delenv("QWENPAW_TAURI_RESOURCE_DIR", raising=False)

    assert execution_runtime.configure_execution_runtime() == (
        "builtin",
        str(python),
    )
    assert execution_runtime.execution_python() == str(python)


def test_external_selection_is_validated(monkeypatch, tmp_path):
    resource_dir = tmp_path / "resources"
    selection = resource_dir / "execution-runtime" / "selection.txt"
    selection.parent.mkdir(parents=True)
    selection.write_text(
        "external\nC:\\Python311\\python.exe\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("QWENPAW_TAURI_RESOURCE_DIR", str(resource_dir))
    monkeypatch.setenv("QWENPAW_EXECUTION_PYTHON_MODE", "")
    monkeypatch.setenv("QWENPAW_EXECUTION_PYTHON", "")
    monkeypatch.setattr(
        execution_runtime,
        "_valid_external_python",
        lambda _: True,
    )

    assert execution_runtime.configure_execution_runtime() == (
        "external",
        "C:\\Python311\\python.exe",
    )


def test_prepare_execution_env_replaces_bundled_prefix(monkeypatch, tmp_path):
    bundled_dir = tmp_path / "bundled"
    external_dir = tmp_path / "external"
    bundled_dir.mkdir()
    external_dir.mkdir()
    bundled = bundled_dir / "python.exe"
    external = external_dir / "python.exe"
    bundled.write_bytes(b"")
    external.write_bytes(b"")
    monkeypatch.setenv("QWENPAW_DESKTOP_PY_RUNTIME", str(bundled))
    monkeypatch.setenv("QWENPAW_EXECUTION_PYTHON_MODE", "external")
    monkeypatch.setenv("QWENPAW_EXECUTION_PYTHON", str(external))
    env = {"PATH": os.pathsep.join([str(bundled_dir), "system-bin"])}

    execution_runtime.prepare_execution_env(env)

    assert env["PATH"].split(os.pathsep) == [
        str(external_dir),
        "system-bin",
    ]


def test_builtin_execution_uses_user_writable_pip_target(
    monkeypatch,
    tmp_path,
):
    bundled_dir = tmp_path / "bundled"
    bundled_dir.mkdir()
    bundled = bundled_dir / "python.exe"
    bundled.write_bytes(b"")
    site_dir = tmp_path / "execution-site"
    monkeypatch.setenv("QWENPAW_DESKTOP_PY_RUNTIME", str(bundled))
    monkeypatch.setenv("QWENPAW_EXECUTION_PYTHON_MODE", "builtin")
    monkeypatch.setenv("QWENPAW_EXECUTION_PYTHON", str(bundled))
    monkeypatch.setenv("QWENPAW_EXECUTION_SITE_DIR", str(site_dir))
    env = {"PATH": "system-bin", "PYTHONPATH": "user-site"}

    execution_runtime.prepare_execution_env(env)

    assert env["PIP_TARGET"] == str(site_dir)
    assert env["PYTHONPATH"].split(os.pathsep) == [
        str(site_dir),
        "user-site",
    ]
    assert env["PATH"].split(os.pathsep) == [
        str(bundled_dir),
        str(site_dir / "Scripts"),
        str(site_dir / "bin"),
        "system-bin",
    ]


def test_external_execution_drops_internal_component_pythonpath(
    monkeypatch,
    tmp_path,
):
    local_app_data = tmp_path / "local"
    component_site = local_app_data / "UGSci" / "components" / "science"
    external_dir = tmp_path / "external"
    external_dir.mkdir()
    external = external_dir / "python.exe"
    external.write_bytes(b"")
    monkeypatch.setenv("LOCALAPPDATA", str(local_app_data))
    monkeypatch.setenv("QWENPAW_EXECUTION_PYTHON_MODE", "external")
    monkeypatch.setenv("QWENPAW_EXECUTION_PYTHON", str(external))
    env = {
        "PATH": "system-bin",
        "PYTHONPATH": os.pathsep.join([str(component_site), "user-site"]),
        "PYTHONNOUSERSITE": "1",
    }

    execution_runtime.prepare_execution_env(env)

    assert env["PYTHONPATH"] == "user-site"
    assert "PIP_TARGET" not in env
    assert env["PYTHONNOUSERSITE"] == ""
