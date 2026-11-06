# -*- coding: utf-8 -*-
"""Real filesystem checks for the bundled-plugin startup inventory."""
# pylint: disable=protected-access

import json
import os
from pathlib import Path
import subprocess

import pytest

from qwenpaw.plugins import bundled


def _marker(root, files):
    (root / ".bundle_complete").write_text(
        json.dumps({"format": 1, "files": files}),
        encoding="utf-8",
    )


def test_bundle_marker_checks_all_files_with_one_scan_per_directory(
    tmp_path,
    monkeypatch,
):
    files = []
    for group in range(4):
        directory = tmp_path / f"group-{group}"
        directory.mkdir()
        for item in range(60):
            path = directory / f"module-{item}.py"
            path.write_text("VALUE = 1\n", encoding="utf-8")
            files.append(path.relative_to(tmp_path).as_posix())
    _marker(tmp_path, files)
    # User data is deliberately unlisted and must not be descended into.
    (tmp_path / "data").mkdir()
    scans, resolutions = [], []
    real_scandir, real_resolve = os.scandir, Path.resolve

    def observe_scandir(path):
        scans.append(os.fspath(path))
        return real_scandir(path)

    def observe_resolve(path, *args, **kwargs):
        resolutions.append(path)
        return real_resolve(path, *args, **kwargs)

    monkeypatch.setattr(bundled.os, "scandir", observe_scandir)
    monkeypatch.setattr(Path, "resolve", observe_resolve)
    assert bundled._has_bundle_complete_marker(tmp_path)
    assert len(scans) == 4
    assert len(resolutions) == 5
    assert not any(Path(path).name == "data" for path in scans)
    # No persistent fast-path cache may hide damage between startups.
    (tmp_path / files[-1]).unlink()
    assert not bundled._has_bundle_complete_marker(tmp_path)
    (tmp_path / files[-1]).mkdir()
    assert not bundled._has_bundle_complete_marker(tmp_path)


@pytest.mark.parametrize(
    "files",
    [
        ["../outside.py"],
        ["C:/outside.py"],
        ["/outside.py"],
        ["a:stream"],
        [""],
        [None],
        "not-a-list",
    ],
)
def test_bundle_marker_rejects_unsafe_or_malformed_files(tmp_path, files):
    _marker(tmp_path, files)
    assert not bundled._has_bundle_complete_marker(tmp_path)
    (tmp_path / ".bundle_complete").write_text("[]", encoding="utf-8")
    assert not bundled._has_bundle_complete_marker(tmp_path)


def test_bundle_marker_resolves_directory_links_before_enumeration(tmp_path):
    root, outside = tmp_path / "plugin", tmp_path / "outside"
    root.mkdir()
    outside.mkdir()
    (outside / "module.py").write_text("VALUE = 1\n", encoding="utf-8")
    inside = root / "real"
    inside.mkdir()
    (inside / "module.py").write_text("VALUE = 2\n", encoding="utf-8")
    link = root / "linked"
    _marker(root, ["linked/module.py"])
    for destination, expected in ((outside, False), (inside, True)):
        if os.name == "nt":
            subprocess.run(
                [
                    "cmd",
                    "/D",
                    "/C",
                    "mklink",
                    "/J",
                    str(link),
                    str(destination),
                ],
                check=True,
                capture_output=True,
                timeout=15,
            )
        else:
            link.symlink_to(destination, target_is_directory=True)
        try:
            assert bundled._has_bundle_complete_marker(root) is expected
        finally:
            if os.name == "nt":
                link.rmdir()
            else:
                link.unlink()
    assert (outside / "module.py").read_text("utf-8") == "VALUE = 1\n"


def test_bundle_marker_retains_case_and_permission_fallback(
    tmp_path,
    monkeypatch,
):
    (tmp_path / "module.py").write_text("VALUE = 1\n", encoding="utf-8")
    _marker(tmp_path, ["module.py"])

    def denied(_path):
        raise PermissionError("enumeration denied; file is still readable")

    with monkeypatch.context() as patch:
        patch.setattr(bundled.os, "scandir", denied)
        assert bundled._has_bundle_complete_marker(tmp_path)
    if os.name == "nt":
        _marker(tmp_path, ["MODULE.PY"])
        assert bundled._has_bundle_complete_marker(tmp_path)


def test_bundle_marker_does_not_merge_differently_cased_directories(
    tmp_path,
    monkeypatch,
):
    # Both spellings must be checked even on a default case-insensitive volume.
    # This also runs on case-sensitive filesystems, where they are distinct.
    for name in ("A", "a"):
        directory = tmp_path / name
        directory.mkdir(exist_ok=True)
        (directory / "module.py").write_text("VALUE = 1\n", encoding="utf-8")
    _marker(tmp_path, ["A/module.py", "a/module.py"])
    scans = []
    original = os.scandir

    def observe(path):
        scans.append(os.fspath(path))
        return original(path)

    monkeypatch.setattr(bundled.os, "scandir", observe)
    assert bundled._has_bundle_complete_marker(tmp_path)
    assert len(scans) == 2
    (tmp_path / "a/module.py").unlink()
    assert not bundled._has_bundle_complete_marker(tmp_path)
