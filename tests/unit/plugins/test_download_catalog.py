# -*- coding: utf-8 -*-
"""Unit tests for src/qwenpaw/plugins/download_catalog.py."""

from __future__ import annotations

from packaging.version import Version

from qwenpaw.__version__ import __version__
from qwenpaw.plugins.download_catalog import (
    _catalog_channel,
    _is_entry_compatible,
)


_CURRENT = Version(__version__)
_CURRENT_MINOR_FLOOR = f"{_CURRENT.major}.{_CURRENT.minor}.0"
_NEXT_MINOR_BOUNDARY = f"{_CURRENT.major}.{_CURRENT.minor + 1}.0"


def test_entry_with_qwenpaw_version_compatible() -> None:
    entry = {
        "id": "demo",
        "version": "1.0.0",
        # Keep the bound tied to the running minor so a release bump does not
        # leave this compatibility smoke test stale.
        "qwenpaw_version": {
            "min": "1.1.6",
            "max": _NEXT_MINOR_BOUNDARY,
        },
    }
    assert _is_entry_compatible(entry) is True


def test_entry_with_qwenpaw_version_max_enforced() -> None:
    """Declared max excludes a newer running QwenPaw (upper bound is live)."""
    entry = {
        "id": "demo",
        "version": "1.0.0",
        "qwenpaw_version": {"min": "0.1.0", "max": "1.1.0"},
    }
    assert _is_entry_compatible(entry) is False


def test_entry_with_only_min_compatible() -> None:
    entry = {
        "id": "demo",
        "version": "1.0.0",
        # Derived exclusive max is the next minor for the running version.
        "qwenpaw_version": {"min": _CURRENT_MINOR_FLOOR},
    }
    assert _is_entry_compatible(entry) is True


def test_entry_with_only_min_incompatible() -> None:
    entry = {
        "id": "demo",
        "version": "1.0.0",
        "qwenpaw_version": {"min": "3.0.0"},
    }
    assert _is_entry_compatible(entry) is False


def test_entry_without_version_constraints_is_compatible() -> None:
    entry = {
        "id": "demo",
        "version": "1.0.0",
    }
    assert _is_entry_compatible(entry) is True


def test_entry_with_malformed_qwenpaw_version_falls_to_legacy() -> None:
    """Non-dict qwenpaw_version falls back to min_version/max_version."""
    entry = {
        "id": "demo",
        "version": "1.0.0",
        "qwenpaw_version": "not-a-dict",
        "min_version": "1.0.0",
        "max_version": _NEXT_MINOR_BOUNDARY,
    }
    assert _is_entry_compatible(entry) is True


def test_entry_with_malformed_qwenpaw_version_no_legacy() -> None:
    """Non-dict qwenpaw_version with no legacy fields is compatible."""
    entry = {
        "id": "demo",
        "version": "1.0.0",
        "qwenpaw_version": "not-a-dict",
    }
    assert _is_entry_compatible(entry) is True


def test_legacy_min_version_compatible() -> None:
    """Legacy min_version within range is compatible."""
    entry = {
        "id": "demo",
        "version": "1.0.0",
        "min_version": _CURRENT_MINOR_FLOOR,
    }
    assert _is_entry_compatible(entry) is True


def test_legacy_min_version_incompatible() -> None:
    """Legacy min_version above current QwenPaw is incompatible."""
    entry = {
        "id": "demo",
        "version": "1.0.0",
        "min_version": "3.0.0",
    }
    assert _is_entry_compatible(entry) is False


def test_legacy_min_max_version_compatible() -> None:
    """Legacy min+max still loads when both bounds include the core."""
    entry = {
        "id": "demo",
        "version": "1.0.0",
        "min_version": "1.0.0",
        "max_version": _NEXT_MINOR_BOUNDARY,
    }
    assert _is_entry_compatible(entry) is True


def test_legacy_max_version_enforced() -> None:
    """Legacy max_version below the running QwenPaw is incompatible."""
    entry = {
        "id": "demo",
        "version": "1.0.0",
        "min_version": "0.1.0",
        "max_version": "1.0.0",
    }
    assert _is_entry_compatible(entry) is False


def test_entry_with_empty_dict_qwenpaw_version() -> None:
    """Empty dict qwenpaw_version triggers compat check with defaults."""
    entry = {
        "id": "demo",
        "version": "1.0.0",
        "qwenpaw_version": {},
    }
    # Empty dict is isinstance(dict) but has no min/max, should
    # still pass through PluginManifest validation or fallback gracefully
    result = _is_entry_compatible(entry)
    assert isinstance(result, bool)


def test_catalog_channel_defaults_ugsci_oss_rows() -> None:
    assert _catalog_channel(author="QwenPaw Team", channel="") == "ugsci"
    assert _catalog_channel(author="UGSci Team", channel="") == "ugsci"
    assert _catalog_channel(author="Someone", channel="ugsci") == "ugsci"
    assert _catalog_channel(author="Someone", channel="community") == (
        "community"
    )
    assert _catalog_channel(author="UGSci Team", channel="community") == (
        "community"
    )
