# -*- coding: utf-8 -*-
"""Final desktop archives must contain usable bundled plugin trees."""

from __future__ import annotations

import importlib.util
import json
import tarfile
import zipfile
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
VERIFIER = REPO_ROOT / "scripts" / "pack-tauri" / "verify_frozen_plugins.py"


def _load_verifier():
    spec = importlib.util.spec_from_file_location(
        "qwenpaw_frozen_plugin_archive_test",
        VERIFIER,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _plugin_tree(tmp_path: Path) -> Path:
    root = (
        tmp_path
        / "UGSci Desktop.app"
        / "Contents"
        / "Resources"
        / "binaries"
        / "qwenpaw-backend"
        / "_internal"
        / "qwenpaw"
        / "plugins_bundle"
    )
    for plugin_id in ("flowforge", "ugsci", "ugsci_research"):
        plugin = root / plugin_id
        (plugin / "ui").mkdir(parents=True)
        (plugin / "plugin.py").write_text("VALUE = 1\n", encoding="utf-8")
        ui_entry = plugin / "ui" / "index.js"
        ui_entry.write_text("export {};\n", encoding="utf-8")
        (plugin / "plugin.json").write_text(
            json.dumps(
                {
                    "id": plugin_id,
                    "entry": {
                        "backend": "plugin.py",
                        "frontend": "ui/index.js",
                    },
                },
            ),
            encoding="utf-8",
        )
    return root


def test_verifies_zip_and_tar_archives(tmp_path: Path) -> None:
    verifier = _load_verifier()
    plugin_root = _plugin_tree(tmp_path)
    app_root = tmp_path / "UGSci Desktop.app"
    zip_path = tmp_path / "desktop.zip"
    tar_path = tmp_path / "desktop.app.tar.gz"

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in app_root.rglob("*"):
            if path.is_file():
                archive.write(path, path.relative_to(tmp_path).as_posix())
    with tarfile.open(tar_path, "w:gz") as archive:
        archive.add(app_root, arcname=app_root.name)

    assert plugin_root.is_dir()
    verifier.verify_archive(zip_path)
    verifier.verify_archive(tar_path)


def test_rejects_archive_with_missing_frontend_entry(tmp_path: Path) -> None:
    verifier = _load_verifier()
    plugin_root = _plugin_tree(tmp_path)
    (plugin_root / "flowforge" / "ui" / "index.js").unlink()
    zip_path = tmp_path / "desktop.zip"

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in (tmp_path / "UGSci Desktop.app").rglob("*"):
            if path.is_file():
                archive.write(path, path.relative_to(tmp_path).as_posix())

    with pytest.raises(ValueError, match="missing frontend entry"):
        verifier.verify_archive(zip_path)


def test_accepts_directory_name_that_differs_from_manifest_id(
    tmp_path: Path,
) -> None:
    verifier = _load_verifier()
    root = _plugin_tree(tmp_path)
    alias = root / "thinking_log_middleware"
    (alias / "ui").mkdir(parents=True)
    (alias / "plugin.py").write_text("VALUE = 1\n", encoding="utf-8")
    (alias / "ui" / "index.js").write_text("export {};\n", encoding="utf-8")
    (alias / "plugin.json").write_text(
        json.dumps(
            {
                "id": "middleware-demo-thinking-log",
                "entry": {
                    "backend": "plugin.py",
                    "frontend": "ui/index.js",
                },
            },
        ),
        encoding="utf-8",
    )
    zip_path = tmp_path / "desktop.zip"

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in (tmp_path / "UGSci Desktop.app").rglob("*"):
            if path.is_file():
                archive.write(path, path.relative_to(tmp_path).as_posix())

    verifier.verify_archive(zip_path)


def test_rejects_plugin_tree_outside_frozen_backend(tmp_path: Path) -> None:
    verifier = _load_verifier()
    real_root = _plugin_tree(tmp_path)
    decoy_root = (
        tmp_path
        / "UGSci Desktop.app"
        / "Contents"
        / "Resources"
        / "qwenpaw"
        / "plugins_bundle"
    )
    decoy_root.parent.mkdir(parents=True, exist_ok=True)
    real_root.rename(decoy_root)
    zip_path = tmp_path / "desktop.zip"

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in (tmp_path / "UGSci Desktop.app").rglob("*"):
            if path.is_file():
                archive.write(path, path.relative_to(tmp_path).as_posix())

    with pytest.raises(ValueError, match="outside the selected backend path"):
        verifier.verify_archive(zip_path)


def test_verifies_layered_windows_portable_archive(tmp_path: Path) -> None:
    verifier = _load_verifier()
    payload = tmp_path / "payload"
    plugin_root = (
        payload
        / "binaries"
        / "app"
        / "backend"
        / "2.1.1b7"
        / "qwenpaw"
        / "plugins_bundle"
    )
    for plugin_id in ("flowforge", "ugsci", "ugsci_research"):
        plugin = plugin_root / plugin_id
        (plugin / "ui").mkdir(parents=True)
        (plugin / "plugin.py").write_text("VALUE = 1\n", encoding="utf-8")
        (plugin / "ui/index.js").write_text("export {};\n", encoding="utf-8")
        (plugin / "plugin.json").write_text(
            json.dumps(
                {
                    "id": plugin_id,
                    "entry": {
                        "backend": "plugin.py",
                        "frontend": "ui/index.js",
                    },
                },
            ),
            encoding="utf-8",
        )
    state = payload / "binaries/state"
    state.mkdir(parents=True)
    (state / "active.json").write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "components": {
                    "backend": {
                        "version": "2.1.1b7",
                        "kind": "python",
                        "path": "binaries/app/backend/2.1.1b7",
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    archive_path = tmp_path / "windows-portable.zip"
    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in payload.rglob("*"):
            if path.is_file():
                archive.write(path, path.relative_to(tmp_path).as_posix())

    verifier.verify_archive(archive_path)


def test_ignores_macos_appledouble_metadata(tmp_path: Path) -> None:
    verifier = _load_verifier()
    plugin_root = _plugin_tree(tmp_path)
    zip_path = tmp_path / "desktop.zip"

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in (tmp_path / "UGSci Desktop.app").rglob("*"):
            if path.is_file():
                archive.write(path, path.relative_to(tmp_path).as_posix())
        archive.writestr("__MACOSX/._UGSci Desktop.app", b"AppleDouble")
        archive.writestr(
            "__MACOSX/UGSci Desktop.app/Contents/._Info.plist",
            b"AppleDouble",
        )

    assert plugin_root.is_dir()
    verifier.verify_archive(zip_path)
