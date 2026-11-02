# -*- coding: utf-8 -*-
"""Channel wheels preserve host ownership and one backend plugin root."""

import base64
import csv
from email.parser import BytesParser
import hashlib
import importlib
import importlib.util
import io
import json
from pathlib import Path
import zipfile

from packaging.utils import parse_wheel_filename
import pytest

from qwenpaw.__version__ import __version__

ROOT = Path(__file__).resolve().parents[3]


@pytest.fixture(name="tools")
def _tools(monkeypatch):
    monkeypatch.syspath_prepend(str(ROOT / "scripts/pack-tauri"))
    spec = importlib.util.spec_from_file_location(
        "channel_support_wheel_fixture",
        Path(__file__).with_name("test_channel_runtime_layout.py"),
    )
    assert spec and spec.loader
    fixture = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(fixture)
    return importlib.import_module("build_channel_support_wheel"), fixture


def _members(wheel):
    with zipfile.ZipFile(wheel) as archive:
        return {name: archive.read(name) for name in archive.namelist()}


def _write_recorded_wheel(wheel, files):
    record = f"qwenpaw-{__version__}.dist-info/RECORD"
    files = {
        name: content for name, content in files.items() if name != record
    }
    output = io.StringIO(newline="")
    writer = csv.writer(output, lineterminator="\n")
    for name, content in sorted(files.items()):
        digest = base64.urlsafe_b64encode(hashlib.sha256(content).digest())
        writer.writerow(
            (name, "sha256=" + digest.decode().rstrip("="), len(content)),
        )
    writer.writerow((record, "", ""))
    files[record] = output.getvalue().encode()
    with zipfile.ZipFile(wheel, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, content in files.items():
            archive.writestr(name, content)


def _source_wheel(directory, fixture):
    directory.mkdir()
    # The fixture builds the real official archives, with their real drivers.
    # pylint: disable-next=protected-access
    wheel = fixture._host_wheel(directory)
    files = _members(wheel)
    for relative in (
        "channel_protocol/shared_worker.py",
        "plugins/execution/worker.py",
        "app/channels/utils.py",
        "schemas.py",
    ):
        files["qwenpaw/" + relative] = (
            ROOT / "src/qwenpaw" / relative
        ).read_bytes()
    for plugin_id in (
        "flowforge",
        "qwenpaw-run-center",
        "ugsci",
        "ugsci_research",
    ):
        source = ROOT / "src/qwenpaw/plugins_bundle" / plugin_id
        manifest = json.loads(
            (source / "plugin.json").read_text(encoding="utf-8"),
        )
        for relative in {"plugin.json", *manifest["entry"].values()}:
            files[f"qwenpaw/plugins_bundle/{plugin_id}/{relative}"] = (
                source / relative
            ).read_bytes()
    _write_recorded_wheel(wheel, files)
    return wheel


def _assert_complete_record(files):
    record = f"qwenpaw-{__version__}.dist-info/RECORD"
    rows = list(csv.reader(io.StringIO(files[record].decode())))
    assert len(rows) == len(files)
    assert {row[0] for row in rows} == set(files)
    for name, digest, size in rows:
        if name == record:
            assert digest == size == ""
        else:
            expected = base64.urlsafe_b64encode(
                hashlib.sha256(files[name]).digest(),
            )
            assert digest == "sha256=" + expected.decode().rstrip("=")
            assert int(size) == len(files[name])


def test_channel_support_wheel_preserves_recorded_host_and_official_resources(
    tmp_path,
    tools,
):
    builder, fixture = tools
    source = _source_wheel(tmp_path / "source", fixture)
    before = source.read_bytes()
    original = _members(source)
    derived = builder.build_channel_support_wheel(source, tmp_path / "derived")
    repeated = builder.build_channel_support_wheel(
        source,
        tmp_path / "repeated",
    )
    assert source.read_bytes() == before
    assert derived.read_bytes() == repeated.read_bytes()
    assert parse_wheel_filename(derived.name)[2] == (1, "channelsupport")
    retained = _members(derived)
    record = f"qwenpaw-{__version__}.dist-info/RECORD"
    wheel = f"qwenpaw-{__version__}.dist-info/WHEEL"
    assert set(retained) == {
        name
        for name in original
        if not name.startswith("qwenpaw/plugins_bundle/")
    }
    for name, content in retained.items():
        if name not in {record, wheel}:
            assert content == original[name]
    identity = BytesParser().parsebytes(retained[wheel])
    assert identity["Build"] == "1channelsupport"
    assert identity["Qwenpaw-Channel-Support"] == "backend-plugins-excluded"
    assert (
        identity["Qwenpaw-Source-Wheel-SHA256"]
        == hashlib.sha256(before).hexdigest()
    )
    _assert_complete_record(retained)


@pytest.mark.parametrize(
    "changed",
    [
        "qwenpaw/channel_protocol/shared_worker.py",
        "qwenpaw/plugins_bundle/ugsci/plugin.json",
    ],
    ids=["retained-core", "excluded-backend-plugin"],
)
def test_channel_support_derivation_rejects_changed_source_record(
    tmp_path,
    tools,
    changed,
):
    builder, fixture = tools
    source = _source_wheel(tmp_path / "source", fixture)
    files = _members(source)
    files[changed] += b"\nunauthenticated source change\n"
    with zipfile.ZipFile(source, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, content)
    with pytest.raises(ValueError, match="RECORD payload differs"):
        builder.build_channel_support_wheel(source, tmp_path / "derived")
    assert not (tmp_path / "derived").exists()


def test_channel_support_derivation_rejects_unrecorded_source_payload(
    tmp_path,
    tools,
):
    builder, fixture = tools
    source = _source_wheel(tmp_path / "source", fixture)
    with zipfile.ZipFile(source, "a") as archive:
        archive.writestr("qwenpaw/plugins_bundle/extra/plugin.json", "{}")
    with pytest.raises(ValueError, match="RECORD inventory differs"):
        builder.build_channel_support_wheel(source, tmp_path / "derived")
    assert not (tmp_path / "derived").exists()


def _write_desktop_zip(path, resources, prefix):
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as archive:
        for item in resources.rglob("*"):
            if item.is_file():
                archive.write(
                    item,
                    prefix + item.relative_to(resources).as_posix(),
                )


@pytest.mark.parametrize("target", ["windows-x86_64", "macos-aarch64"])
def test_derived_channel_runtime_keeps_final_plugin_archive_single_owner(
    tmp_path,
    tools,
    target,
):
    builder, fixture = tools
    source = _source_wheel(tmp_path / "source", fixture)
    original = source.read_bytes()
    expected = builder.build_channel_support_wheel(
        source,
        tmp_path / "expected",
    )
    # This invokes the actual stager, ABI/closure checks and official archive
    # authentication before assembly. No validator or driver is replaced.
    # pylint: disable-next=protected-access
    binaries, path = fixture._staged_resources(tmp_path, target, wheel=source)
    data = json.loads(path.read_text(encoding="utf-8"))
    assert (
        data["host_wheel_sha256"]
        == hashlib.sha256(expected.read_bytes()).hexdigest()
    )
    assert data["host_wheel_sha256"] != hashlib.sha256(original).hexdigest()
    assert not (path.parent / "site/qwenpaw/plugins_bundle").exists()
    _assert_complete_record(_members(expected))
    assert {
        item.relative_to(path.parent / "site").as_posix(): item.read_bytes()
        for item in (path.parent / "site").rglob("*")
        if item.is_file()
    } == _members(expected)
    backend = binaries / "app/backend" / __version__
    for name, content in _members(source).items():
        if name.startswith("qwenpaw/plugins_bundle/"):
            destination = backend / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(content)
    active = importlib.import_module("assemble_desktop_layout").assemble(
        binaries,
        __version__,
        target,
    )
    resources = binaries.parent
    assert resources / active["components"]["backend"]["path"] == backend
    prefix = (
        "payload/"
        if target.startswith("windows")
        else "UGSci Desktop.app/Contents/Resources/"
    )
    artifact = tmp_path / "desktop.zip"
    _write_desktop_zip(artifact, resources, prefix)
    verifier = importlib.import_module("verify_frozen_plugins")
    verifier.verify_archive(artifact)
    # The original negative gate must still reject even one restored duplicate.
    with zipfile.ZipFile(artifact, "a") as archive:
        duplicate = backend / "c/s/qwenpaw/plugins_bundle/ugsci/plugin.json"
        archive.writestr(
            prefix + duplicate.relative_to(resources).as_posix(),
            _members(source)["qwenpaw/plugins_bundle/ugsci/plugin.json"],
        )
    with pytest.raises(ValueError, match="outside the selected backend path"):
        verifier.verify_archive(artifact)
    assert source.read_bytes() == original
