# -*- coding: utf-8 -*-
# pylint: disable=unnecessary-lambda,use-implicit-booleaness-not-comparison
from __future__ import annotations

import json

from qwenpaw.components.service import (
    ComponentUpdateService,
    configured_service,
    queue_component_update,
    run_startup_updates,
)
from qwenpaw.components.update import ComponentUpdater


class _Client:
    def __init__(self, manifest):
        self.manifest = manifest

    def fetch_manifest(self, _url):
        return self.manifest


def test_configured_service_uses_embedded_production_defaults(monkeypatch):
    monkeypatch.delenv("QWENPAW_COMPONENT_MANIFEST_URL", raising=False)
    monkeypatch.delenv("QWENPAW_COMPONENT_PUBLIC_KEY", raising=False)
    monkeypatch.delenv("QWENPAW_COMPONENT_MANAGED", raising=False)
    monkeypatch.setattr(
        "qwenpaw.components.service.detect_target",
        lambda: "macos-aarch64",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._default_managed_components",
        lambda: {"demo"},
    )

    service = configured_service()
    assert service is not None
    try:
        assert service.manifest_url.endswith(
            "/metadata/components/stable/macos-aarch64.current.json",
        )
        assert service.updater.public_key_b64 == (
            "T0VO6V4iNHzSxU3eV68N4nifjq2CqtDfMO0QPtH72mw="
        )
        assert service.updater.managed_components == frozenset({"demo"})
    finally:
        service.client.close()


def test_configured_service_environment_overrides_defaults(monkeypatch):
    monkeypatch.setenv(
        "QWENPAW_COMPONENT_MANIFEST_URL",
        "https://updates.example/custom.current.json",
    )
    monkeypatch.setenv("QWENPAW_COMPONENT_PUBLIC_KEY", "custom-key")
    monkeypatch.setenv("QWENPAW_COMPONENT_MANAGED", "alpha, beta")

    service = configured_service()
    assert service is not None
    try:
        assert service.manifest_url == (
            "https://updates.example/custom.current.json"
        )
        assert service.updater.public_key_b64 == "custom-key"
        assert service.updater.managed_components == frozenset(
            {"alpha", "beta"},
        )
    finally:
        service.client.close()


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
    assert service.check() == []


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
    assert service.check() == []
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
            self.client = type("Client", (), {"close": lambda self: None})()

        def snapshot(self):
            raise RuntimeError("offline")

    monkeypatch.setenv("QWENPAW_COMPONENT_UPDATES", "startup")
    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        lambda: _BrokenService(),
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
            self.client = type("Client", (), {"close": lambda self: None})()

        def check(self):
            return [{"component": "demo"}]

    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        lambda: _Service(),
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
            self.client = type("Client", (), {"close": lambda self: None})()

        def snapshot(self):
            return {"release": "one"}, [{"component": "demo"}]

        def _install_from_manifest(self, component, manifest):
            assert manifest == {"release": "one"}
            return {"component": component, "updated": True}

    monkeypatch.delenv("QWENPAW_COMPONENT_UPDATES", raising=False)
    monkeypatch.setattr(
        "qwenpaw.components.service._PENDING_UPDATES_PATH",
        pending,
    )
    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        lambda: _Service(),
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
            self.client = type("Client", (), {"close": lambda self: None})()

        def snapshot(self):
            return {"release": "one"}, []

    monkeypatch.delenv("QWENPAW_COMPONENT_UPDATES", raising=False)
    monkeypatch.setattr(
        "qwenpaw.components.service._PENDING_UPDATES_PATH",
        pending,
    )
    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        lambda: _Service(),
    )
    run_startup_updates()
    assert json.loads(pending.read_text(encoding="utf-8"))["components"] == [
        "demo",
    ]


def test_startup_batch_reuses_one_manifest_snapshot(monkeypatch, tmp_path):
    manifest = {
        "components": {
            component: {
                "version": "1.0.0",
                "files": {},
                "full": {
                    "url": f"https://oss/{component}.zip",
                    "sha256": "a" * 64,
                    "signature": "sig",
                    "size": 1,
                },
            }
            for component in ("alpha", "beta")
        },
    }

    class _SnapshotClient:
        def __init__(self):
            self.fetches = 0

        def fetch_manifest(self, _url):
            self.fetches += 1
            return manifest

        def record_failure(self, _component, _exc):
            raise AssertionError("installation should not fail")

        def close(self):
            pass

    client = _SnapshotClient()
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"alpha", "beta"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    service = ComponentUpdateService(
        updater,
        client,
        "https://oss/current.json",
    )
    installed: list[tuple[str, object]] = []

    def fake_install(component, *, manifest=None):
        installed.append((component, manifest))
        return {"component": component, "updated": True}

    monkeypatch.setattr(service, "_install_component", fake_install)
    monkeypatch.setattr(
        "qwenpaw.components.service.get_plugins_dir",
        lambda: tmp_path / "plugins",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._PENDING_UPDATES_PATH",
        tmp_path / "missing.json",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        lambda: service,
    )
    monkeypatch.setenv("QWENPAW_COMPONENT_UPDATES", "startup")

    result = run_startup_updates()

    assert client.fetches == 1
    assert [component for component, _ in installed] == ["alpha", "beta"]
    assert all(snapshot is manifest for _, snapshot in installed)
    assert len(result["updated"]) == 2
