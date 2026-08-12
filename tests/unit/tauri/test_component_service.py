# -*- coding: utf-8 -*-
from __future__ import annotations

import json

from qwenpaw.components.service import (
    ComponentUpdateService,
    queue_component_update,
    run_startup_updates,
)
from qwenpaw.components.update import ComponentUpdater


class _Client:
    def __init__(self, manifest):
        self.manifest = manifest

    def fetch_manifest(self, _url):
        return self.manifest


def test_new_plugin_is_planned_as_full(monkeypatch, tmp_path):
    monkeypatch.setattr(
        "qwenpaw.components.service.get_plugins_dir",
        lambda: tmp_path / "plugins",
    )
    manifest = {
        "components": {
            "demo": {
                "version": "1.0.0",
                "files": {},
                "full": {
                    "url": "https://oss/full.zip",
                    "sha256": "a" * 64,
                    "signature": "sig",
                    "size": 1,
                },
            },
        },
    }
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    service = ComponentUpdateService(
        updater,
        _Client(manifest),
        "https://oss/manifest.json",
    )
    plans = service.check()
    assert plans[0]["artifact_kind"] == "full"


def test_existing_newer_plugin_is_not_downgraded(monkeypatch, tmp_path):
    plugins = tmp_path / "plugins"
    installed = plugins / "demo"
    installed.mkdir(parents=True)
    (installed / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "2.0.0"}),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service.get_plugins_dir",
        lambda: plugins,
    )
    manifest = {
        "components": {
            "demo": {
                "version": "1.0.0",
                "files": {},
                "full": {
                    "url": "https://oss/full.zip",
                    "sha256": "a" * 64,
                    "signature": "sig",
                    "size": 1,
                },
            },
        },
    }
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    service = ComponentUpdateService(
        updater,
        _Client(manifest),
        "https://oss/manifest.json",
    )
    assert not service.check()


def test_uninstalled_plugin_is_not_offered_or_installed(monkeypatch, tmp_path):
    plugins = tmp_path / "plugins"
    installed = plugins / "demo"
    installed.mkdir(parents=True)
    (installed / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    (installed / ".uninstalled").write_text("1", encoding="utf-8")
    monkeypatch.setattr(
        "qwenpaw.components.service.get_plugins_dir",
        lambda: plugins,
    )
    manifest = {
        "components": {
            "demo": {
                "version": "1.1.0",
                "files": {},
                "full": {
                    "url": "https://oss/full.zip",
                    "sha256": "a" * 64,
                    "signature": "sig",
                    "size": 1,
                },
            },
        },
    }
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    service = ComponentUpdateService(
        updater,
        _Client(manifest),
        "https://oss/manifest.json",
    )
    assert not service.check()
    assert service.install("demo") == {
        "component": "demo",
        "updated": False,
        "reason": "uninstalled",
    }


def test_startup_updates_are_disabled_by_default(monkeypatch):
    monkeypatch.delenv("QWENPAW_COMPONENT_UPDATES", raising=False)
    assert run_startup_updates() == {
        "enabled": False,
        "updated": [],
        "errors": [],
    }


def test_startup_update_failure_is_non_fatal(monkeypatch):
    class _BrokenService:
        def __init__(self):
            self.client = type(
                "Client",
                (),
                {"close": staticmethod(lambda: None)},
            )()

        def check(self):
            raise RuntimeError("offline")

    monkeypatch.setenv("QWENPAW_COMPONENT_UPDATES", "startup")

    def configured_service():
        return _BrokenService()

    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        configured_service,
    )
    result = run_startup_updates()
    assert result["enabled"] is True
    assert result["errors"][0]["component"] == "manifest"


def test_manual_update_is_queued_for_safe_restart(monkeypatch, tmp_path):
    pending = tmp_path / "pending.json"

    class _Service:
        def __init__(self):
            self.updater = type(
                "Updater",
                (),
                {"managed_components": {"demo"}},
            )()
            self.client = type(
                "Client",
                (),
                {"close": staticmethod(lambda: None)},
            )()

        def check(self):
            return [{"component": "demo"}]

    service = _Service()
    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        service.__class__,
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._PENDING_UPDATES_PATH",
        pending,
    )
    assert queue_component_update("demo") == {
        "component": "demo",
        "queued": True,
        "restart_required": True,
    }
    assert json.loads(pending.read_text(encoding="utf-8"))["components"] == [
        "demo",
    ]


def test_pending_update_runs_even_when_automatic_updates_are_disabled(
    monkeypatch,
    tmp_path,
):
    pending = tmp_path / "pending.json"
    pending.write_text(
        json.dumps({"schema_version": 1, "components": ["demo"]}),
        encoding="utf-8",
    )

    class _Service:
        def __init__(self):
            self.client = type(
                "Client",
                (),
                {"close": staticmethod(lambda: None)},
            )()

        def check(self):
            return [{"component": "demo"}]

        def install(self, component):
            return {"component": component, "updated": True}

    monkeypatch.delenv("QWENPAW_COMPONENT_UPDATES", raising=False)
    monkeypatch.setattr(
        "qwenpaw.components.service._PENDING_UPDATES_PATH",
        pending,
    )
    service = _Service()
    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        service.__class__,
    )
    result = run_startup_updates()
    assert result["updated"] == [{"component": "demo", "updated": True}]
    assert not pending.exists()


def test_unavailable_pending_update_is_retained(monkeypatch, tmp_path):
    pending = tmp_path / "pending.json"
    pending.write_text(
        json.dumps({"schema_version": 1, "components": ["demo"]}),
        encoding="utf-8",
    )

    class _Service:
        def __init__(self):
            self.client = type(
                "Client",
                (),
                {"close": staticmethod(lambda: None)},
            )()

        def check(self):
            return []

    monkeypatch.delenv("QWENPAW_COMPONENT_UPDATES", raising=False)
    monkeypatch.setattr(
        "qwenpaw.components.service._PENDING_UPDATES_PATH",
        pending,
    )
    service = _Service()
    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        service.__class__,
    )
    run_startup_updates()
    assert json.loads(pending.read_text(encoding="utf-8"))["components"] == [
        "demo",
    ]
