# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Real filesystem identities used by plugin import cleanup."""

import importlib.machinery
import importlib.util
import os
import subprocess
import sys

import pytest

from qwenpaw.plugins import module_isolation


def _alias(link, target):
    if os.name == "nt":
        subprocess.run(
            ["cmd", "/c", "mklink", "/J", str(link), str(target)],
            check=True,
            capture_output=True,
        )
        assert link.lstat().st_reparse_tag == 0xA0000003
    else:
        link.symlink_to(target, target_is_directory=True)


def _unlink_alias(link):
    if os.name == "nt":
        link.rmdir()
    else:
        link.unlink()


def test_existing_module_path_needs_one_native_resolution(
    tmp_path,
    monkeypatch,
):
    """Resolve every real path once, without a second prefix probe."""
    source = tmp_path / "actual.py"
    source.write_text("VALUE = 1\n", encoding="utf8")
    calls = []
    attribute = "_getfinalpathname" if os.name == "nt" else "realpath"
    original = getattr(os.path, attribute)

    def resolve(path):
        calls.append(str(path))
        return original(path)

    monkeypatch.setattr(os.path, attribute, resolve)
    first = module_isolation._norm(source)
    assert len(calls) == 1
    assert module_isolation._norm(source) == first
    assert (
        len(calls) == 2
    )  # No persistent path cache, including between sweeps.


@pytest.mark.parametrize("namespace", [False, True])
def test_cleanup_rechecks_real_directory_alias_targets(
    tmp_path,
    monkeypatch,
    namespace,
):
    """Retargeted links change file and namespace cleanup decisions."""
    inside = tmp_path / "inside"
    outside = tmp_path / "outside"
    inside.mkdir()
    outside.mkdir()
    for directory in (inside, outside):
        (directory / "payload.py").write_text("VALUE = 7\n", encoding="utf8")
        (directory / "portion").mkdir()
    link = tmp_path / "alias"
    _alias(link, outside)
    name = "_qwenpaw_real_alias_cleanup_probe"
    if namespace:
        spec = importlib.machinery.PathFinder.find_spec("portion", [str(link)])
    else:
        spec = importlib.util.spec_from_file_location(
            name,
            link / "payload.py",
        )
    assert spec is not None
    module = importlib.util.module_from_spec(spec)
    if not namespace:
        spec.loader.exec_module(module)
        assert module.VALUE == 7
    monkeypatch.setitem(sys.modules, name, module)
    original_path = list(sys.path)
    try:
        sys.path.insert(0, str(link))
        module_isolation.sweep_bare_tree_modules(inside)
        module_isolation.strip_plugin_sys_path(inside)
        assert sys.modules[name] is module
        assert str(link) in sys.path
        _unlink_alias(link)
        _alias(link, inside)
        module_isolation.sweep_bare_tree_modules(inside)
        module_isolation.strip_plugin_sys_path(inside)
        assert name not in sys.modules
        assert str(link) not in sys.path
        assert (inside / "payload.py").read_text(
            encoding="utf8",
        ) == "VALUE = 7\n"
        assert (outside / "payload.py").is_file()
    finally:
        sys.path[:] = original_path
        _unlink_alias(link)


@pytest.mark.parametrize("missing_parent", [False, True])
def test_missing_alias_children_keep_realpath_fallback(
    tmp_path,
    missing_parent,
):
    """A missing module still resolves existing linked parent directories."""
    target = tmp_path / "target"
    target.mkdir()
    link = tmp_path / "alias"
    _alias(link, target)
    suffix = "missing/child.py" if missing_parent else "child.py"
    try:
        assert module_isolation._norm(link / suffix) == module_isolation._norm(
            target / suffix,
        )
    finally:
        _unlink_alias(link)


def test_comparison_spelling_preserves_unc_and_device_roots(tmp_path):
    """Prefix formatting after resolution cannot turn UNC into local paths."""
    spelling = module_isolation._comparison_spelling
    if os.name == "nt":
        assert spelling(r"\\server\share\file.py") == (
            r"\\?\unc\server\share\file.py"
        )
        assert spelling(r"\\?\UNC\server\share\file.py") == spelling(
            r"\\server\share\file.py",
        )
        assert spelling(r"\\.\NUL") == r"\\.\nul"
        assert module_isolation._norm(tmp_path) == module_isolation._norm(
            "\\\\?\\" + str(tmp_path),
        )
    else:
        assert module_isolation._norm(tmp_path) == os.path.realpath(tmp_path)
        assert spelling("//server/share/file.py") == "//server/share/file.py"
