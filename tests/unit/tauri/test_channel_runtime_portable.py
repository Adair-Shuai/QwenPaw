# -*- coding: utf-8 -*-
"""Preserve readable wheel bytes under the real portable extraction limit."""

import csv
import hashlib
import importlib
import importlib.util
import io
import json
from pathlib import Path
import shutil

import pytest

from qwenpaw.__version__ import __version__
from qwenpaw.plugins.channel_bootstrap import runtime_manifest

ROOT = Path(__file__).resolve().parents[3]
MODEL_SCOPE_PATHS = (
    "modelscope/msdatasets/dataset_cls/custom_datasets/"
    "image_quality_assessment_degradation/"
    "image_quality_assessment_degradation_dataset.py",
    "modelscope/msdatasets/dataset_cls/custom_datasets/"
    "referring_video_object_segmentation/"
    "referring_video_object_segmentation_dataset.py",
)
MODEL_SCOPE_RECORD = "modelscope-1.35.0.dist-info/RECORD"


@pytest.fixture(name="staged_resources")
def _staged_resources_fixture(tmp_path, monkeypatch):
    monkeypatch.syspath_prepend(str(ROOT / "scripts/pack-tauri"))
    # Reuse the real venv/wheel/official-archive fixture, without importing a
    # second installed "tests" package or replacing the protected channels.
    spec = importlib.util.spec_from_file_location(
        "channel_layout_portable_fixture",
        Path(__file__).with_name("test_channel_runtime_layout.py"),
    )
    assert spec and spec.loader
    fixture = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(fixture)
    guard = importlib.import_module("prepare_windows_portable_tree")
    # pytest's own long temporary prefix must not hide the actual 180-char
    # package-relative contract behind the separate legacy MAX_PATH limit.
    # pylint: disable-next=protected-access
    resources_root = Path(guard._filesystem_path(tmp_path))
    # pylint: disable-next=protected-access
    return fixture._staged_resources(resources_root, "windows-x86_64")


def _payload(root):
    return {
        path.relative_to(root).as_posix(): path.read_bytes()
        for path in root.rglob("*")
        if path.is_file()
    }


def _modelscope_payload(site):
    for relative in MODEL_SCOPE_PATHS:
        path = site / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(
            b"# Preserve the full dependency payload.\nVALUE = 17\n",
        )
    record = site / MODEL_SCOPE_RECORD
    record.parent.mkdir()
    rows = io.StringIO()
    writer = csv.writer(rows)
    for relative in MODEL_SCOPE_PATHS:
        writer.writerow((relative, "", len((site / relative).read_bytes())))
    record.write_text(rows.getvalue(), encoding="utf-8")
    return _payload(site)


def _assert_portable_payload(portable, prefix, original, inventory):
    guard = importlib.import_module("prepare_windows_portable_tree")
    # pylint: disable-next=protected-access
    portable = Path(guard._filesystem_path(portable))
    for relative in MODEL_SCOPE_PATHS:
        previous = f"payload/{prefix}/channel-runtime/site/{relative}"
        current = f"payload/{prefix}/c/s/{relative}"
        assert len(previous) > 180
        assert len(current) <= 180
        assert (
            f"{hashlib.sha256(original[relative]).hexdigest()}  {current}\n"
            in inventory
        )
        assert (portable / current).read_bytes() == original[relative]
    assert (
        portable / "payload" / prefix / "c/s" / MODEL_SCOPE_RECORD
    ).read_bytes() == original[MODEL_SCOPE_RECORD]


def test_compact_channel_payload_passes_real_portable_path_guard(
    tmp_path,
    staged_resources,
):
    binaries, manifest = staged_resources
    original = _modelscope_payload(manifest.parent / "site")
    active = importlib.import_module("assemble_desktop_layout").assemble(
        binaries,
        __version__,
        "windows-x86_64",
    )
    backend = binaries.parent / active["components"]["backend"]["path"]
    assert _payload(backend / "c/s") == original
    assert not (backend / "channel-runtime").exists()
    portable = tmp_path / "portable"
    guard = importlib.import_module("prepare_windows_portable_tree")
    # Use the same extended paths as the production Windows tree walker.
    # pylint: disable=protected-access
    shutil.copytree(
        guard._filesystem_path(binaries),
        guard._filesystem_path(portable / "payload/binaries"),
    )
    checksums = portable / "checksums.sha256"
    assert guard.MAX_PORTABLE_RELATIVE_PATH == 180
    guard.prepare(portable, checksums)
    prefix = backend.relative_to(binaries.parent).as_posix()
    _assert_portable_payload(
        portable,
        prefix,
        original,
        checksums.read_text(encoding="ascii"),
    )


@pytest.mark.parametrize("compact_entry", ["directory", "file"])
def test_compact_manifest_missing_never_falls_back(
    tmp_path,
    monkeypatch,
    compact_entry,
):
    monkeypatch.syspath_prepend(str(ROOT / "scripts/pack-tauri"))
    binaries = tmp_path / "binaries"
    backend = binaries / "app/backend" / __version__
    legacy = backend / "channel-runtime/runtime.json"
    legacy.parent.mkdir(parents=True)
    legacy.write_bytes(b'{"schema_version":1}')
    if compact_entry == "directory":
        (backend / "c").mkdir()
    else:
        (backend / "c").write_bytes(b"invalid compact directory")
    active = {
        "components": {
            "backend": {
                "kind": "python",
                "path": backend.relative_to(tmp_path).as_posix(),
                "version": __version__,
            },
        },
    }
    refresh = importlib.import_module("refresh_desktop_descriptors")
    with pytest.raises(
        ValueError,
        match="compact channel runtime manifest is missing",
    ):
        refresh.refresh(binaries, __version__, active)
    assert legacy.read_bytes() == b'{"schema_version":1}'
    assert not (binaries / "state/active.json").exists()


def test_refresh_preserves_legacy_layered_channel_paths(
    staged_resources,
    monkeypatch,
):
    binaries, _ = staged_resources
    assembly = importlib.import_module("assemble_desktop_layout")
    active = assembly.assemble(binaries, __version__, "windows-x86_64")
    backend = binaries.parent / active["components"]["backend"]["path"]
    (backend / "c/s").rename(backend / "c/site")
    (backend / "c").rename(backend / "channel-runtime")
    manifest = backend / "channel-runtime/runtime.json"
    data = json.loads(manifest.read_text(encoding="utf-8"))
    data["support_root"] = "channel-runtime/site"
    data["dependency_paths"] = ["channel-runtime/site"]
    manifest.write_text(json.dumps(data), encoding="utf-8")
    before = manifest.read_bytes()
    refresh = importlib.import_module("refresh_desktop_descriptors")
    refresh.refresh(binaries, __version__, active)
    assert manifest.read_bytes() == before
    support = backend / "channel-runtime/site"
    for key, value in {
        "QWENPAW_TAURI_RESOURCE_DIR": binaries.parent,
        "QWENPAW_CHANNEL_RESOURCE_DIR": backend,
        "QWENPAW_CHANNEL_RUNTIME_MANIFEST": manifest,
        "QWENPAW_DESKTOP_PY_RUNTIME": binaries.parent
        / data["python_executable"],
        "QWENPAW_CHANNEL_SUPPORT_ROOT": support,
        "QWENPAW_CHANNEL_DEPENDENCY_PATHS": json.dumps([str(support)]),
    }.items():
        monkeypatch.setenv(key, str(value))
    resolved = runtime_manifest()
    assert resolved[1:3] == (support.resolve(), (support.resolve(),))
