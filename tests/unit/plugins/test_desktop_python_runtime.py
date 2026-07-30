# -*- coding: utf-8 -*-
# pylint: disable=protected-access
from __future__ import annotations

from qwenpaw.plugins import loader


def test_bundled_python_desktop_uses_read_only_install_policy(
    monkeypatch,
) -> None:
    monkeypatch.delenv("QWENPAW_DESKTOP_APP", raising=False)
    monkeypatch.delattr(loader.sys, "frozen", raising=False)
    assert loader._is_frozen() is False

    monkeypatch.setenv("QWENPAW_DESKTOP_APP", "1")
    assert loader._is_frozen() is True


def test_non_desktop_environment_value_does_not_enable_policy(
    monkeypatch,
) -> None:
    monkeypatch.delattr(loader.sys, "frozen", raising=False)
    monkeypatch.setenv("QWENPAW_DESKTOP_APP", "0")
    assert loader._is_frozen() is False
