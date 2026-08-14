# -*- coding: utf-8 -*-
"""Production desktop-version manifest proxy tests."""

from __future__ import annotations

import io

from fastapi import HTTPException
import pytest

from qwenpaw.app import _app

# pylint: disable=protected-access


class _Response(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *_args):
        self.close()


def test_latest_desktop_version_uses_fixed_oss_manifest(monkeypatch):
    requested: list[tuple[str, int]] = []

    def fake_urlopen(request, timeout):
        requested.append((request.full_url, timeout))
        return _Response(b'{"version":"2.1.1-beta.6"}')

    monkeypatch.setattr(_app.urllib.request, "urlopen", fake_urlopen)
    monkeypatch.setattr(_app, "_desktop_version_cache", None)

    assert _app.get_latest_desktop_version() == {
        "version": "2.1.1-beta.6",
    }
    assert requested == [(_app.DESKTOP_UPDATE_MANIFEST_URL, 10)]

    assert _app.get_latest_desktop_version() == {
        "version": "2.1.1-beta.6",
    }
    assert len(requested) == 1


def test_latest_desktop_version_rejects_missing_version(monkeypatch):
    monkeypatch.setattr(_app, "_desktop_version_cache", None)
    monkeypatch.setattr(
        _app.urllib.request,
        "urlopen",
        lambda *_args, **_kwargs: _Response(b"{}"),
    )

    with pytest.raises(HTTPException) as exc_info:
        _app.get_latest_desktop_version()

    assert exc_info.value.status_code == 502


def test_latest_desktop_version_rejects_oversized_manifest(monkeypatch):
    monkeypatch.setattr(_app, "_desktop_version_cache", None)
    monkeypatch.setattr(
        _app.urllib.request,
        "urlopen",
        lambda *_args, **_kwargs: _Response(
            b"{" + b" " * (_app._DESKTOP_VERSION_MAX_BYTES + 1),
        ),
    )

    with pytest.raises(HTTPException) as exc_info:
        _app.get_latest_desktop_version()

    assert exc_info.value.status_code == 502


def test_latest_desktop_version_uses_recent_stale_cache_on_network_error(
    monkeypatch,
):
    monkeypatch.setattr(_app.time, "monotonic", lambda: 120.0)
    monkeypatch.setattr(
        _app,
        "_desktop_version_cache",
        ("2.1.1-beta.6", 0.0),
    )
    monkeypatch.setattr(
        _app.urllib.request,
        "urlopen",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(OSError("offline")),
    )

    assert _app.get_latest_desktop_version() == {
        "version": "2.1.1-beta.6",
    }


def test_latest_desktop_version_rejects_expired_stale_cache(monkeypatch):
    monkeypatch.setattr(_app.time, "monotonic", lambda: 601.0)
    monkeypatch.setattr(
        _app,
        "_desktop_version_cache",
        ("2.1.1-beta.6", 0.0),
    )
    monkeypatch.setattr(
        _app.urllib.request,
        "urlopen",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(OSError("offline")),
    )

    with pytest.raises(HTTPException) as exc_info:
        _app.get_latest_desktop_version()

    assert exc_info.value.status_code == 502
