# -*- coding: utf-8 -*-
"""Exercise software artifacts without independently installed applications."""

import importlib.util
import base64
import csv
import hashlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import zipfile

import pytest


ROOT = Path(__file__).resolve().parents[3]


def _script(name):
    spec = importlib.util.spec_from_file_location(
        name,
        ROOT / "scripts/pack-tauri" / f"{name}.py",
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _plugin(directory, identifier, kind="general"):
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "plugin.json").write_text(
        json.dumps(
            {
                "id": identifier,
                "type": kind,
                "version": "1.0.0",
                "entry": {"backend": "plugin.py"},
            },
        ),
        encoding="utf-8",
    )
    (directory / "plugin.py").write_bytes(b"VALUE = 'real payload'\n")


def test_software_staging_excludes_apps_and_preserves_explicit_app_release(
    tmp_path,
):
    stage = _script("stage_bundled_plugins")
    repo = tmp_path / "repo"
    _plugin(repo / "plugins/bundle/ugsci", "ugsci")
    app = repo / "plugins/apps/document-forms"
    _plugin(app, "document-forms", "app")
    source = (app / "plugin.py").read_bytes()
    installed = tmp_path / "working/plugins/document-forms"
    _plugin(installed, "document-forms", "app")
    data = installed / "user-data.json"
    data.write_bytes(b'{"form":"keep independent user data"}')
    before = {p.name: p.read_bytes() for p in installed.iterdir()}
    desktop = tmp_path / "desktop/qwenpaw/plugins_bundle"
    _plugin(desktop / "document-forms", "document-forms", "app")
    assert stage.stage_bundled_plugins(repo, desktop) == ["ugsci"]
    assert sorted(p.name for p in desktop.iterdir()) == ["ugsci"]
    assert (desktop / "ugsci/plugin.py").read_bytes() == source
    independent = tmp_path / "independent-release"
    assert stage.stage_bundled_plugins(
        repo,
        independent,
        plugin_roots=("apps",),
    ) == ["document-forms"]
    assert (independent / "document-forms/plugin.py").read_bytes() == source
    assert (app / "plugin.py").read_bytes() == source
    assert {p.name: p.read_bytes() for p in installed.iterdir()} == before


def _build(project, output, method):
    result = subprocess.run(
        [
            sys.executable,
            "-c",
            f"import sys; from setuptools.build_meta import {method}; "
            f"{method}(sys.argv[1])",
            str(output),
        ],
        cwd=project,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    assert result.returncode == 0, (result.stdout + result.stderr)[-6000:]


def _wheel_inventory(path):
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        record = next(p for p in names if p.endswith(".dist-info/RECORD"))
        rows = list(
            csv.reader(io.StringIO(archive.read(record).decode("utf-8"))),
        )
        assert {row[0] for row in rows} == set(names)
        for name, digest, size in rows:
            if name == record:
                assert not digest and not size
                continue
            content = archive.read(name)
            expected = base64.urlsafe_b64encode(
                hashlib.sha256(content).digest(),
            ).rstrip(b"=")
            assert digest == "sha256=" + expected.decode("ascii")
            assert int(size) == len(content)
        assert archive.read("qwenpaw/plugins_bundle/ugsci/plugin.py")
        assert any("qwenpaw/official_channels/" in p for p in names)
        return names


def test_python_distributions_exclude_source_and_stale_application_mirrors(
    tmp_path,
):
    # Actual setuptools archives, including source and a dirty build directory.
    # pylint: disable=too-many-locals,too-many-statements
    project = tmp_path / "project"
    project.mkdir()
    for name in (
        "pyproject.toml",
        "setup.py",
        "MANIFEST.in",
        "scripts/pack/generate_plugin_metadata.py",
        "scripts/pack/validate_channel_contracts.py",
        "scripts/pack/channel-contract-requirements.txt",
        "src/qwenpaw/plugins/official_channel_catalog.py",
    ):
        destination = project / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / name, destination)
    shutil.copytree(
        ROOT / "plugins/channel",
        project / "plugins/channel",
        ignore=shutil.ignore_patterns("__pycache__", "node_modules"),
    )
    (project / "README.md").write_text("Release fixture\n", encoding="utf-8")
    (project / "src/qwenpaw/__init__.py").write_bytes(b"")
    (project / "src/qwenpaw/__version__.py").write_bytes(
        b'__version__ = "0.0.1"\n',
    )
    mail = project / "packages/qwenpawmail-mcp/src/qwenpawmail_mcp"
    mail.mkdir(parents=True)
    (mail / "__init__.py").write_bytes(b"")
    (project / "plugins/hub").mkdir(parents=True)
    (project / "plugins/hub/__init__.py").write_bytes(b"")
    mirrors = project / "src/qwenpaw/plugins_bundle"
    _plugin(mirrors / "ugsci", "ugsci")
    _plugin(project / "plugins/apps/document-forms", "document-forms", "app")
    _plugin(mirrors / "document-forms", "document-forms", "app")
    _plugin(mirrors / "renamed-app", "document-forms")
    _plugin(mirrors / "unlisted-app", "external-app", "app")
    _plugin(
        project / "build/lib/qwenpaw/plugins_bundle/document-forms",
        "document-forms",
        "app",
    )
    before = {
        str(path.relative_to(project)): path.read_bytes()
        for path in mirrors.rglob("*")
        if path.is_file()
    }
    output = tmp_path / "artifacts"
    for method in ("build_wheel", "build_sdist"):
        _build(project, output, method)
    wheel_names = _wheel_inventory(next(output.glob("*.whl")))
    sdist = next(output.glob("*.tar.gz"))
    with tarfile.open(sdist) as archive:
        source_names = archive.getnames()
        assert any(p.endswith("ugsci/plugin.py") for p in source_names)
        assert any("/official_channels/" in p for p in source_names)
        # Read actual delivered bytes, rather than treating archive presence as
        # evidence that a clean wheel can be reproduced from it.
        unpacked = tmp_path / "unpacked"
        for member in archive.getmembers():
            if not member.isfile():
                continue
            destination = unpacked / member.name
            assert destination.resolve().is_relative_to(unpacked.resolve())
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(archive.extractfile(member).read())
    rebuilt = tmp_path / "rebuilt"
    _build(next(unpacked.iterdir()), rebuilt, "build_wheel")
    rebuilt_names = _wheel_inventory(next(rebuilt.glob("*.whl")))
    for names in (wheel_names, source_names, rebuilt_names):
        assert not any("/plugins/apps/" in p for p in names)
        for app in ("document-forms", "renamed-app", "unlisted-app"):
            assert not any(f"plugins_bundle/{app}/" in p for p in names)
    assert {
        str(path.relative_to(project)): path.read_bytes()
        for path in mirrors.rglob("*")
        if path.is_file()
    } == before
    assert (project / "plugins/apps/document-forms/plugin.py").read_bytes()


def _verify_desktop_zip(verifier, app, output):
    with zipfile.ZipFile(output, "w") as package:
        for path in app.rglob("*"):
            if path.is_file():
                package.write(path, path.relative_to(output.parent))
    verifier.verify_archive(output)


@pytest.mark.parametrize("archive", [False, True], ids=["directory", "zip"])
def test_desktop_content_gate_rejects_bundled_application_payload(
    tmp_path,
    archive,
):
    verifier = _script("verify_frozen_plugins")
    app = tmp_path / "QwenPaw.app/Contents/Resources"
    backend = "binaries/app/backend/2.3.0b3"
    root = app / backend / "qwenpaw/plugins_bundle"
    for identifier in verifier.CRITICAL_PLUGINS:
        _plugin(root / identifier, identifier)
    verifier.verify(root)
    active = app / "binaries/state/active.json"
    active.parent.mkdir(parents=True)
    active.write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "components": {"backend": {"path": backend}},
            },
        ),
        encoding="utf-8",
    )
    if archive:
        _verify_desktop_zip(verifier, app, tmp_path / "desktop.zip")
    _plugin(root / "document-forms", "document-forms", "app")
    with pytest.raises(ValueError, match="installed independently"):
        if archive:
            _verify_desktop_zip(verifier, app, tmp_path / "desktop.zip")
        else:
            verifier.verify(root)
