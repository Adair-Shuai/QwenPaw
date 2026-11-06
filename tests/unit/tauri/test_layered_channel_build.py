# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Exercise isolated channel wheel resolution and desktop build wiring."""

from importlib.util import module_from_spec, spec_from_file_location
import csv
import io
from pathlib import Path
import subprocess
import sys
import zipfile

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
PACK = REPO_ROOT / "scripts/pack-tauri"


def _load(name):
    spec = spec_from_file_location(name, PACK / f"{name}.py")
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _wheel(directory, name, version="1.0", requirements=(), extras=()):
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
    }
    record = io.StringIO()
    writer = csv.writer(record)
    writer.writerows((path, "", "") for path in files)
    writer.writerow((f"{info}/RECORD", "", ""))
    files[f"{info}/RECORD"] = record.getvalue()
    path = directory / f"{stem}-{version}-py3-none-any.whl"
    with zipfile.ZipFile(path, "w") as archive:
        for member, content in files.items():
            archive.writestr(member, content)
    return path


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
