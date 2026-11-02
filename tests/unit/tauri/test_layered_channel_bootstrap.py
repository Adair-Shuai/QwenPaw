# -*- coding: utf-8 -*-
"""Exercise authenticated channels under the ordinary layered CPython host."""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import platform
import runpy
import shutil
import sys
from types import SimpleNamespace
import venv

from packaging.tags import sys_tags
import pytest

from qwenpaw.__version__ import __version__
from qwenpaw.plugins import channel_bootstrap as bootstrap
from qwenpaw.plugins import official_channels as official


ROOT = Path(__file__).resolve().parents[3]
LAUNCHER_PATHS = (
    "QWENPAW_TAURI_RESOURCE_DIR",
    "QWENPAW_CHANNEL_RUNTIME_MANIFEST",
    "QWENPAW_DESKTOP_PY_RUNTIME",
    "QWENPAW_CHANNEL_SUPPORT_ROOT",
    "QWENPAW_CHANNEL_DEPENDENCY_PATHS",
)


@pytest.fixture(name="layered_channel_runtime")
def _layered_channel_runtime(tmp_path, monkeypatch):
    root = tmp_path / "Resources"
    root.mkdir()
    backend = tmp_path / f"managed/backend/{__version__}"
    runtime = tmp_path / "managed/python/test-release/python"
    venv.EnvBuilder(with_pip=False, symlinks=False).create(runtime)
    if sys.platform == "win32":
        executable = runtime / "python.exe"
        shutil.copyfile(runtime / "Scripts/python.exe", executable)
    else:
        executable = runtime / "bin/python"
    (runtime.parent / ".python-runtime-version").write_text(
        "layered-bootstrap-test",
        encoding="utf-8",
    )
    support = backend / "channel-runtime/site"
    worker = support / "qwenpaw/channel_protocol/shared_worker.py"
    worker.parent.mkdir(parents=True)
    shutil.copyfile(
        ROOT / "src/qwenpaw/channel_protocol/shared_worker.py",
        worker,
    )
    resources = support / "qwenpaw/official_channels"
    builder = runpy.run_path(
        str(ROOT / "scripts/pack/generate_plugin_metadata.py"),
    )["build_official_channel_bundle"]
    builder(ROOT, resources, host_version=__version__)
    identity = {
        "version": list(sys.version_info[:2]),
        "implementation": sys.implementation.name,
        "cache_tag": sys.implementation.cache_tag,
        "sys_platform": sys.platform,
        "system": platform.system(),
        "machine": platform.machine(),
        "supported_tags": [str(tag) for tag in sys_tags()],
    }
    manifest = backend / "channel-runtime/runtime.json"
    manifest.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "host_version": __version__,
                "preset": "channels-full",
                "python_executable": (
                    "binaries/runtimes/python/packaged/python/python.exe"
                ),
                "support_root": "channel-runtime/site",
                "dependency_paths": ["channel-runtime/site"],
                "python": identity,
                "python_runtime_release": "layered-bootstrap-test",
                "host_wheel_sha256": "0" * 64,
                "official_index_sha256": hashlib.sha256(
                    (resources / "index.json").read_bytes(),
                ).hexdigest(),
            },
        ),
        encoding="utf-8",
    )
    values = (root, manifest, executable, support, json.dumps([str(support)]))
    for key, value in zip(LAUNCHER_PATHS, values):
        monkeypatch.setenv(key, str(value))
    monkeypatch.setenv("QWENPAW_CHANNEL_RESOURCE_DIR", str(backend))
    monkeypatch.setenv("QWENPAW_DESKTOP_APP", "1")
    monkeypatch.delenv("QWENPAW_CHANNEL_PRESET", raising=False)
    monkeypatch.delattr(sys, "frozen", raising=False)
    config = tmp_path / "user/config.json"
    monkeypatch.setattr("qwenpaw.config.utils.get_config_path", lambda: config)
    return executable, support, manifest, identity


def test_layered_channel_bootstrap_uses_authenticated_manifest(
    layered_channel_runtime,
):
    executable, support, _manifest, identity = layered_channel_runtime
    settings = bootstrap.resolve_default_channel_runtime(provision=False)
    assert settings.python_executable == str(executable.resolve())
    assert settings.support_root == support.resolve()
    assert settings.dependency_paths[0] == support.resolve()
    assert settings.runtime_identity == identity
    assert settings.dependency_install_target.parent.name.startswith("bundle-")
    assert bootstrap.default_channel_preset() == "channels-full"
    snapshot = runpy.run_path(
        str(ROOT / "scripts/pack-tauri/stage_channel_runtime.py"),
    )["_snapshot"](executable)
    child = SimpleNamespace(
        executable=settings.python_executable,
        marker_environment=snapshot["environment"],
        supported_tags=snapshot["python"]["supported_tags"],
    )
    bootstrap.validate_runtime_identity(
        child,
        settings.runtime_identity,
        settings.python_executable,
    )
    wrong_identity = {**identity, "machine": identity["machine"] + "-other"}
    with pytest.raises(ValueError, match="CHANNEL_RUNTIME_IDENTITY_MISMATCH"):
        bootstrap.validate_runtime_identity(
            child,
            wrong_identity,
            settings.python_executable,
        )


def test_layered_official_sources_use_authenticated_runtime(
    layered_channel_runtime,
):
    _executable, support, _manifest, _identity = layered_channel_runtime
    # Check the internal root together with the actual authenticated consumers.
    assert official._resource_root() == (  # pylint: disable=protected-access
        support / "qwenpaw/official_channels"
    )
    description = official.bundled_channel_description("feishu")
    assert description.plugin_id == "feishu"
    assert description.descriptor.channel_key == "feishu"
    with official.bundled_channel_source("feishu") as source:
        assert (source / "qwenpaw_channel_feishu/driver.py").is_file()


@pytest.mark.parametrize(
    "drift",
    [
        "host_version",
        "index_digest",
        "launcher_path",
        "runtime_release",
        "support_escape",
        "manifest_outside_backend",
        "python_path_escape",
        "incomplete_launcher",
    ],
)
def test_layered_channel_bootstrap_rejects_manifest_drift(
    layered_channel_runtime,
    monkeypatch,
    drift,
):
    _executable, support, manifest, _identity = layered_channel_runtime
    value = json.loads(manifest.read_text(encoding="utf-8"))
    if drift == "host_version":
        value["host_version"] = "0.0.0"
        expected = "CHANNEL_RUNTIME_MANIFEST_INVALID"
    elif drift == "index_digest":
        value["official_index_sha256"] = "f" * 64
        expected = "CHANNEL_RUNTIME_INDEX_MISMATCH"
    elif drift == "launcher_path":
        monkeypatch.setenv("QWENPAW_CHANNEL_SUPPORT_ROOT", str(support.parent))
        expected = "CHANNEL_RUNTIME_MANIFEST_MISMATCH"
    elif drift == "runtime_release":
        value["python_runtime_release"] = "unrelated-runtime"
        expected = "CHANNEL_RUNTIME_IDENTITY_MISMATCH"
    elif drift == "support_escape":
        value["support_root"] = "../unrelated-backend/site"
        expected = "CHANNEL_RUNTIME_MANIFEST_INVALID"
    elif drift == "python_path_escape":
        value["python_executable"] = "../unrelated-runtime/python.exe"
        expected = "CHANNEL_RUNTIME_MANIFEST_INVALID"
    elif drift == "incomplete_launcher":
        monkeypatch.delenv("QWENPAW_CHANNEL_DEPENDENCY_PATHS")
        expected = "CHANNEL_RUNTIME_MANIFEST_INVALID"
    else:
        unrelated = (
            Path(os.environ["QWENPAW_TAURI_RESOURCE_DIR"]) / "runtime.json"
        )
        shutil.copyfile(manifest, unrelated)
        monkeypatch.setenv("QWENPAW_CHANNEL_RUNTIME_MANIFEST", str(unrelated))
        expected = "CHANNEL_RUNTIME_MANIFEST_INVALID"
    manifest.write_text(json.dumps(value), encoding="utf-8")
    with pytest.raises(ValueError, match=expected):
        bootstrap.resolve_default_channel_runtime(provision=False)
    with pytest.raises(ValueError, match=expected):
        official.bundled_channel_description("feishu")


def test_source_channel_bootstrap_keeps_development_runtime(
    tmp_path,
    monkeypatch,
):
    monkeypatch.delattr(sys, "frozen", raising=False)
    monkeypatch.delenv("QWENPAW_DESKTOP_APP", raising=False)
    monkeypatch.delenv("QWENPAW_CHANNEL_RESOURCE_DIR", raising=False)
    for key in LAUNCHER_PATHS:
        monkeypatch.delenv(key, raising=False)
    monkeypatch.setenv("QWENPAW_CHANNEL_PRESET", "channels-full")
    config = tmp_path / "user/config.json"
    monkeypatch.setattr("qwenpaw.config.utils.get_config_path", lambda: config)
    settings = bootstrap.resolve_default_channel_runtime(provision=False)
    assert settings.python_executable == str(Path(sys.executable).absolute())
    assert settings.support_root == ROOT / "src"
    assert settings.runtime_identity is None
    assert not settings.dependency_install_target.parent.name.startswith(
        "bundle-",
    )
    assert bootstrap.default_channel_preset() == "channels-full"
