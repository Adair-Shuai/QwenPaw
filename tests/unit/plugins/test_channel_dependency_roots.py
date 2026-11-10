# -*- coding: utf-8 -*-
"""Dependency probe reuse follows current real filesystem identities."""
import os
from pathlib import Path

from qwenpaw.plugins.channel_adapter import _dependency_sites_covered
from tests.fs_alias_support import directory_alias


def test_dependency_roots_use_physical_identity_and_windows_spelling(tmp_path):
    allowed = tmp_path / "AllowedSite"
    other = tmp_path / "OtherSite"
    allowed.mkdir()
    other.mkdir()
    spelling = str(allowed)
    if os.name == "nt":
        spelling = spelling[0].swapcase() + spelling[1:]
    assert Path(spelling).samefile(allowed)
    assert _dependency_sites_covered((str(allowed),), (spelling,))
    assert not _dependency_sites_covered((str(other),), (spelling,))


def test_dependency_root_alias_is_rechecked_after_retarget(tmp_path):
    allowed = tmp_path / "allowed"
    other = tmp_path / "other"
    allowed.mkdir()
    other.mkdir()
    alias = tmp_path / "reader"
    directory_alias(allowed, alias)
    assert _dependency_sites_covered((str(allowed),), (alias,))
    # Remove only the owned directory alias; both target directories survive.
    if alias.is_symlink():
        alias.unlink()
    else:
        alias.rmdir()
    directory_alias(other, alias)
    assert not _dependency_sites_covered((str(allowed),), (alias,))
    assert _dependency_sites_covered((str(other),), (alias,))
    assert allowed.is_dir() and other.is_dir()
