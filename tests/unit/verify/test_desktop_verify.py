# -*- coding: utf-8 -*-
"""Tests for release verification of the real Tauri plugin registry."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

SCRIPT = Path(__file__).parents[3] / "scripts" / "verify" / "desktop_verify.py"
SPEC = importlib.util.spec_from_file_location("desktop_verify", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
desktop_verify = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(desktop_verify)


def _write_report(path: Path, *, nonce: str, complete: bool = True) -> None:
    path.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "nonce": nonce,
                "complete": complete,
                "menus": [
                    {"id": "core.run-center"},
                    {"id": "ugsci.experts"},
                    {"id": "ugsci.tools-skills"},
                ],
                "routes": [
                    {
                        "id": "flowforge.editor",
                        "path": "/flowforge",
                        "source": "flowforge",
                    },
                    {
                        "id": "qwenpaw-run-center.run-center",
                        "path": "/run-center",
                        "source": "qwenpaw-run-center",
                    },
                    {
                        "id": "ugsci.market",
                        "path": "/ugsci-market",
                        "source": "ugsci",
                    },
                ],
                "slots": [
                    {
                        "name": "header.left",
                        "kind": "fill",
                        "source": "ugsci_research",
                        "id": "research-artifact-panel",
                    },
                ],
            },
        ),
        encoding="utf-8",
    )


def test_missing_plugins_report_backend_startup_failure(monkeypatch):
    ticks = iter((0, 0, 2))
    monkeypatch.setattr(desktop_verify, "DEFAULT_TIMEOUT", 1)
    monkeypatch.setattr(
        desktop_verify.time,
        "monotonic",
        lambda: next(ticks, 2),
    )
    monkeypatch.setattr(desktop_verify.time, "sleep", lambda _seconds: None)
    responses = {
        "frontend_plugin": "[]",
        "startup/status": '{"state":"error","message":"missing dependency"}',
        "plugins/bundled/status": '{"state":"error","loaded_count":0}',
    }
    monkeypatch.setattr(
        desktop_verify,
        "_http",
        lambda _method, url: responses[url.split("/api/")[1]],
    )
    with pytest.raises(RuntimeError, match="missing dependency") as error:
        desktop_verify.verify_bundled_plugins("http://127.0.0.1:9999")
    assert "flowforge" in str(error.value)
    assert "loaded_count" in str(error.value)


def test_native_ui_report_accepts_required_capabilities(
    tmp_path: Path,
) -> None:
    report = tmp_path / "report.json"
    _write_report(report, nonce="launch-1")

    desktop_verify.verify_native_ui_report(str(report), "launch-1", 1)


def test_native_ui_report_rejects_stale_nonce(tmp_path: Path) -> None:
    report = tmp_path / "report.json"
    _write_report(report, nonce="old-launch")

    with pytest.raises(RuntimeError, match="nonce"):
        desktop_verify.verify_native_ui_report(str(report), "new-launch", 1)


def test_native_ui_report_rejects_incomplete_registration(
    tmp_path: Path,
) -> None:
    report = tmp_path / "report.json"
    _write_report(report, nonce="launch-1", complete=False)

    with pytest.raises(RuntimeError, match="complete=False"):
        desktop_verify.verify_native_ui_report(str(report), "launch-1", 1)
