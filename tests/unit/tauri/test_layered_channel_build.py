# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Exercise isolated channel wheel resolution and desktop build wiring."""

from importlib.util import module_from_spec, spec_from_file_location
import base64
import csv
import hashlib
import io
import json
from pathlib import Path
import runpy
import stat
import subprocess
import sys
import zipfile

import packaging
import pytest
import yaml

REPO_ROOT = Path(__file__).resolve().parents[3]
PACK = REPO_ROOT / "scripts/pack-tauri"


def _load(name):
    spec = spec_from_file_location(name, PACK / f"{name}.py")
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _wheel(
    directory,
    name,
    version="1.0",
    requirements=(),
    extras=(),
    payload=None,
):
    stem = name.replace("-", "_")
    info = f"{stem}-{version}.dist-info"
    metadata = [
        "Metadata-Version: 2.1",
        f"Name: {name}",
        f"Version: {version}",
        *(f"Provides-Extra: {extra}" for extra in extras),
        *(f"Requires-Dist: {value}" for value in requirements),
    ]
    files = {
        f"{stem}/__init__.py": "VALUE = 1\n",
        f"{info}/METADATA": "\n".join(metadata) + "\n",
        f"{info}/WHEEL": (
            "Wheel-Version: 1.0\nRoot-Is-Purelib: true\n" "Tag: py3-none-any\n"
        ),
        **(payload or {}),
    }
    files = {
        path: value.encode() if isinstance(value, str) else value
        for path, value in files.items()
    }
    record = io.StringIO()
    writer = csv.writer(record)
    for path, content in files.items():
        digest = base64.urlsafe_b64encode(hashlib.sha256(content).digest())
        writer.writerow(
            (path, "sha256=" + digest.decode().rstrip("="), len(content)),
        )
    writer.writerow((f"{info}/RECORD", "", ""))
    files[f"{info}/RECORD"] = record.getvalue()
    path = directory / f"{stem}-{version}-py3-none-any.whl"
    with zipfile.ZipFile(path, "w") as archive:
        for member, content in files.items():
            archive.writestr(member, content)
    return path


@pytest.fixture(name="runtime_host_wheel")
def _runtime_host_wheel_fixture(tmp_path):
    from scripts.pack.generate_plugin_metadata import (
        build_official_channel_bundle,
    )

    version = runpy.run_path(str(REPO_ROOT / "src/qwenpaw/__version__.py"))[
        "__version__"
    ]
    bundle = tmp_path / "official-channels"
    build_official_channel_bundle(
        REPO_ROOT,
        bundle,
        host_version=version,
    )
    source = REPO_ROOT / "src/qwenpaw"
    payload = {
        "qwenpaw/" + path.relative_to(source).as_posix(): path.read_bytes()
        for directory in (
            source / "channel_protocol",
            source / "plugins",
            source / "plugins/execution",
            source / "utils",
        )
        for path in directory.glob("*.py")
    }
    payload.update(
        {
            "qwenpaw/official_channels/" + path.name: path.read_bytes()
            for path in bundle.iterdir()
            if path.is_file()
        },
    )
    wheelhouse = tmp_path / "runtime-wheels"
    wheelhouse.mkdir()
    _wheel(
        wheelhouse,
        "packaging",
        packaging.__version__,
        payload={
            "packaging/" + path.name: path.read_bytes()
            for path in Path(packaging.__file__).parent.glob("*.py")
        },
    )
    _wheel(
        wheelhouse,
        "PyYAML",
        yaml.__version__,
        payload={
            "yaml/" + path.name: path.read_bytes()
            for path in Path(yaml.__file__).parent.glob("*.py")
        },
    )
    return wheelhouse, version, payload, bundle


@pytest.mark.parametrize("relocated", [False, True])
def test_channel_runtime_excludes_bundled_plugins_with_record_integrity(
    runtime_host_wheel,
    tmp_path,
    relocated,
):
    wheelhouse, version, payload, bundle = runtime_host_wheel
    prefix = f"qwenpaw-{version}.data/purelib/" if relocated else ""
    payload.update(
        {
            prefix + "qwenpaw/plugins_bundle/__init__.py": b"",
            prefix + "qwenpaw/plugins_bundle/ugsci/plugin.json": b"{}",
            prefix + "qwenpaw/plugins_bundle/run-center/ui/index.js": b"ui",
            "qwenpaw/plugins_bundle_helpers.py": b"VALUE = 'retained'\n",
            f"qwenpaw-{version}.data/scripts/qwenpaw": b"unused entrypoint",
        },
    )
    wheel = _wheel(
        wheelhouse,
        "qwenpaw",
        version,
        requirements=(
            f"packaging=={packaging.__version__}",
            f"PyYAML=={yaml.__version__}",
        ),
        extras=("channels",),
        payload=payload,
    )
    resources = tmp_path / "resources"
    subprocess.run(
        [
            sys.executable,
            "-m",
            "venv",
            "--without-pip",
            "--copies",
            str(resources / "python"),
        ],
        check=True,
    )
    python = (
        resources
        / "python"
        / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
    )
    runtime = _load("stage_channel_runtime")
    manifest = runtime.stage_channel_runtime(
        python=python,
        wheel=wheel,
        resource_dir=resources,
        wheelhouse=wheelhouse,
    )
    data = json.loads(manifest.read_text(encoding="utf-8"))
    site = resources / data["support_root"]
    assert not (site / "qwenpaw/plugins_bundle").exists()
    assert (site / "qwenpaw/plugins_bundle_helpers.py").is_file()
    assert (
        data["host_wheel_sha256"]
        == hashlib.sha256(
            wheel.read_bytes(),
        ).hexdigest()
    )
    for original in bundle.iterdir():
        staged = site / "qwenpaw/official_channels" / original.name
        assert staged.read_bytes() == original.read_bytes()
    index = site / "qwenpaw/official_channels/index.json"
    assert (
        data["official_index_sha256"]
        == hashlib.sha256(
            index.read_bytes(),
        ).hexdigest()
    )
    record = site / f"qwenpaw-{version}.dist-info/RECORD"
    with record.open(encoding="utf-8", newline="") as stream:
        rows = list(csv.reader(stream))
    paths = {row[0] for row in rows}
    assert paths == {
        path.relative_to(site).as_posix()
        for directory in (site / "qwenpaw", record.parent)
        for path in directory.rglob("*")
        if path.is_file()
    }
    for relative, digest, size in rows:
        if relative == record.relative_to(site).as_posix():
            assert (digest, size) == ("", "")
            continue
        content = (site / relative).read_bytes()
        expected = base64.urlsafe_b64encode(hashlib.sha256(content).digest())
        assert digest == "sha256=" + expected.decode().rstrip("=")
        assert int(size) == len(content)
    # Match the real worker's namespace bootstrap, then import its actual
    # protocol and execution SDK under an otherwise empty target interpreter.
    probe = """
import importlib, pathlib, sys, types
site = pathlib.Path(sys.argv[1])
sys.path.insert(0, str(site))
package = types.ModuleType("qwenpaw")
package.__path__ = [str(site / "qwenpaw")]
sys.modules["qwenpaw"] = package
plugins = types.ModuleType("qwenpaw.plugins")
plugins.__path__ = [str(site / "qwenpaw/plugins")]
sys.modules["qwenpaw.plugins"] = plugins
protocol = importlib.import_module("qwenpaw.channel_protocol")
worker = importlib.import_module("qwenpaw.channel_protocol.shared_worker")
assert callable(worker.ChannelRuntime)
assert protocol.IdentityParams("qq", "stage-probe", 1).to_mapping() == {
    "channel_key": "qq", "instance_id": "stage-probe", "generation": 1,
}
for module in (protocol, worker):
    assert pathlib.Path(module.__file__).is_relative_to(site)
assert importlib.util.find_spec("qwenpaw.plugins_bundle") is None
"""
    result = subprocess.run(
        [str(python), "-I", "-B", "-c", probe, str(site)],
        check=False,
        text=True,
        capture_output=True,
        cwd=tmp_path,
        timeout=30,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert not list(site.rglob("__pycache__"))
    archive = next((site / "qwenpaw/official_channels").glob("*.zip"))
    archive.write_bytes(b"tampered official channel")
    with pytest.raises(ValueError, match="archive digest mismatch"):
        runtime._validate_official_resources(site, version)


@pytest.mark.parametrize("unsafe", ["traversal", "symlink"])
def test_channel_runtime_checks_unsafe_bundled_member_before_filtering(
    tmp_path,
    unsafe,
):
    wheel = _wheel(tmp_path, "qwenpaw")
    name = "qwenpaw/plugins_bundle/../escape.py"
    if unsafe == "symlink":
        name = zipfile.ZipInfo("qwenpaw/plugins_bundle/linked.py")
        name.external_attr = (stat.S_IFLNK | 0o777) << 16
    with zipfile.ZipFile(wheel, "a") as archive:
        archive.writestr(name, "outside")
    site = tmp_path / "site"
    site.mkdir()
    with pytest.raises(ValueError, match="Unsafe wheel member"):
        _load("stage_channel_runtime")._extract_wheel(wheel, site)
    assert not (site / "qwenpaw/escape.py").exists()


@pytest.fixture(name="channel_project")
def _channel_project_fixture(tmp_path, monkeypatch):
    repo = tmp_path / "project"
    repo.mkdir()
    source = tmp_path / "wheel-source"
    source.mkdir()
    _wheel(source, "runtime-dep")
    _wheel(source, "channel-sdk", requirements=("channel-transport==1.0",))
    _wheel(source, "channel-transport")
    _wheel(source, "websockets", "15.0.1")
    _wheel(source, "setuptools", "81.0.0")
    _wheel(
        repo,
        "qwenpaw",
        requirements=(
            "runtime-dep==1.0",
            'channel-sdk==1.0; extra == "channels"',
            'unavailable-full-only==1.0; extra == "full"',
        ),
        extras=("channels", "full"),
    )
    # A real PEP 517 backend with no build dependencies keeps this resolver
    # test offline, independent of the application's large dependency set.
    (repo / "pyproject.toml").write_text(
        '[build-system]\nrequires = []\nbuild-backend = "backend"\n'
        'backend-path = ["."]\n',
        encoding="utf-8",
    )
    (repo / "backend.py").write_text(
        "from pathlib import Path\nimport shutil\n"
        "def build_wheel(wheel_directory, config_settings=None, "
        "metadata_directory=None):\n"
        "    wheel = next(Path(__file__).parent.glob('qwenpaw-*.whl'))\n"
        "    shutil.copy2(wheel, Path(wheel_directory) / wheel.name)\n"
        "    return wheel.name\n",
        encoding="utf-8",
    )
    native = repo / "scripts/pack-tauri/native-host-requirements.txt"
    native.parent.mkdir(parents=True)
    native.write_text("websockets==15.0.1\n", encoding="utf-8")
    monkeypatch.setenv("PIP_NO_INDEX", "1")
    monkeypatch.setenv("PIP_FIND_LINKS", str(source))
    monkeypatch.setenv("PIP_DISABLE_PIP_VERSION_CHECK", "1")
    return repo, source


def test_layered_channel_wheels_resolve_real_offline_dependency_closure(
    channel_project,
    tmp_path,
):
    repo, _source = channel_project
    wheelhouse = tmp_path / "channel-wheels"
    host = _load("prepare_channel_wheels").prepare_channel_wheels(
        repo,
        Path(sys.executable),
        wheelhouse,
    )
    assert host.name == "qwenpaw-1.0-py3-none-any.whl"
    runtime = _load("stage_channel_runtime")
    assert {
        runtime._wheel_metadata(wheel)[0] for wheel in wheelhouse.glob("*.whl")
    } == {
        "qwenpaw",
        "runtime-dep",
        "channel-sdk",
        "channel-transport",
        "setuptools",
        "websockets",
    }
    # Inspect the actual extracted wheel metadata under an empty interpreter,
    # through the same closure validator used before shipping the runtime.
    target = tmp_path / "target"
    subprocess.run(
        [sys.executable, "-m", "venv", "--without-pip", str(target)],
        check=True,
    )
    python = target / (
        "Scripts/python.exe" if sys.platform == "win32" else "bin/python"
    )
    site = tmp_path / "site"
    site.mkdir()
    for wheel in wheelhouse.glob("*.whl"):
        runtime._extract_wheel(wheel, site)
    snapshot = runtime._snapshot(python, site)
    runtime._validate_closure(snapshot, "1.0")
    snapshot["distributions"] = [
        row
        for row in snapshot["distributions"]
        if row["name"] != "channel-transport"
    ]
    with pytest.raises(ValueError, match="Missing or duplicate dependency"):
        runtime._validate_closure(snapshot, "1.0")


def test_layered_channel_missing_dependency_stops_build(
    channel_project,
    tmp_path,
):
    repo, source = channel_project
    (source / "channel_transport-1.0-py3-none-any.whl").unlink()
    with pytest.raises(subprocess.CalledProcessError):
        _load("prepare_channel_wheels").prepare_channel_wheels(
            repo,
            Path(sys.executable),
            tmp_path / "channel-wheels",
        )


def test_layered_channel_rejects_stale_wheel_pool(tmp_path):
    wheelhouse = tmp_path / "channel-wheels"
    wheelhouse.mkdir()
    stale = wheelhouse / "old-full-only.whl"
    stale.write_bytes(b"preserve")
    with pytest.raises(ValueError, match="must be empty"):
        _load("prepare_channel_wheels").prepare_channel_wheels(
            tmp_path,
            Path(sys.executable),
            wheelhouse,
        )
    assert stale.read_bytes() == b"preserve"


@pytest.mark.parametrize("suffix", ["ps1", "sh"])
def test_desktop_build_wires_independent_layered_channel_pool(suffix):
    source = (PACK / f"build_pyinstaller.{suffix}").read_text("utf-8")
    setup = source.split("skipping PyInstaller", 1)[1].split(
        "Building readable channel runtime",
        1,
    )[0]
    assert "channel-contract-requirements.txt" in setup
    channels = source.split("Building readable channel runtime", 1)[1].split(
        "Staging bundled Node runtime",
        1,
    )[0]
    assert "validate_channel_contracts.py" in channels
    before, after = channels.split("prepare_channel_wheels.py", 1)
    assert "if ($LAYERED_DESKTOP)" in before or (
        'if [ "$LAYERED_DESKTOP" = true ]' in before
    )
    layered, legacy = after.split("else", 1)
    assert "HOST_WHEEL=" in layered or "$HOST_WHEEL =" in layered
    assert "DESKTOP_WHEELS" not in layered
    assert "pip download --no-index --only-binary=:all:" in legacy
    assert "stage_channel_runtime.py" in legacy
    assert "--wheelhouse" in legacy
    check = source.rsplit("--check-runtime", 1)[0].rsplit("try", 1)[-1]
    assert "PYTHONDONTWRITEBYTECODE" in check
    if suffix == "ps1":
        assert (
            "$env:PYTHONDONTWRITEBYTECODE = $previousDontWriteBytecode"
        ) in source
