# -*- coding: utf-8 -*-
# pylint: disable=unnecessary-lambda,use-implicit-booleaness-not-comparison
# pylint: disable=protected-access
from __future__ import annotations

import json
from datetime import datetime

import pytest

from qwenpaw.components.service import (
    ComponentUpdateService,
    configured_service,
    queue_all_component_updates,
    queue_component_update,
    resolve_component_destination,
    run_startup_updates,
    set_component_update_adoption,
    _bundled_directory_records,
    _default_managed_components,
    _resolve_managed_directory,
)
from qwenpaw.components.update import ComponentUpdateError
from qwenpaw.components.update import ComponentUpdater


class _Client:
    def __init__(self, manifest):
        self.manifest = manifest

    def fetch_manifest(self, _url):
        return self.manifest


def test_invalid_bundled_runtime_version_does_not_break_component_checks(
    monkeypatch,
    tmp_path,
):
    resource_root = tmp_path / "resources"
    active_path = resource_root / "state" / "active.json"
    java_root = resource_root / "runtimes" / "java"
    java_root.mkdir(parents=True)
    active_path.parent.mkdir(parents=True)
    active_path.write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "target": "macos-aarch64",
                "components": {
                    "java-runtime": {
                        "version": (
                            "jdk-21.0.12+8-mac-aarch64-"
                            "36bb71d6fa5184e12a6483e7662783c2cbd383f5dca"
                            "8034140f0add5aa797d"
                        ),
                        "path": "runtimes/java",
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    monkeypatch.setenv("QWENPAW_TAURI_RESOURCE_DIR", str(resource_root))

    assert _bundled_directory_records() == {}


def test_remote_install_can_be_adopted_by_signed_component_manifest(
    monkeypatch,
    tmp_path,
):
    # pylint: disable=protected-access
    adopted_path = tmp_path / "components" / "adopted.json"
    monkeypatch.setattr(
        "qwenpaw.components.service._ADOPTED_COMPONENTS_PATH",
        adopted_path,
    )
    plugins = tmp_path / "plugins"
    plugin = plugins / "demo"
    plugin.mkdir(parents=True)
    (plugin / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"base"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    service = ComponentUpdateService(updater, _Client({}), "https://example")

    set_component_update_adoption("demo", True)
    service._adopt_signed_new_components(
        {"components": {"demo": {"version": "1.1.0"}}},
        plugins,
    )

    assert "demo" in updater.managed_components
    assert json.loads(adopted_path.read_text(encoding="utf-8"))[
        "components"
    ] == [
        "demo",
    ]


def test_invalid_adopted_id_does_not_discard_valid_entries(
    monkeypatch,
    tmp_path,
):
    # pylint: disable=protected-access
    adopted_path = tmp_path / "components" / "adopted.json"
    adopted_path.parent.mkdir(parents=True)
    adopted_path.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "components": ["valid-plugin", "../invalid", "other"],
            },
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._ADOPTED_COMPONENTS_PATH",
        adopted_path,
    )

    set_component_update_adoption("new-plugin", True)

    assert json.loads(adopted_path.read_text(encoding="utf-8"))[
        "components"
    ] == [
        "new-plugin",
        "other",
        "valid-plugin",
    ]


def test_default_managed_components_include_ugsci_and_u_series() -> None:
    managed = _default_managed_components()
    assert {"ugsci", "ugsci_research", "uideas", "ulit"} <= managed


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


def test_runtime_component_uses_external_versioned_root(monkeypatch, tmp_path):
    managed = tmp_path / "managed"
    active = tmp_path / "state" / "active.json"
    installed = managed / "backend" / "1.0.0"
    installed.mkdir(parents=True)
    active.parent.mkdir()
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {
                        "version": "1.0.0",
                        "path": str(installed.absolute()),
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._MANAGED_COMPONENTS_ROOT",
        managed,
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )
    service = ComponentUpdateService(
        updater,
        _Client(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {
                        "version": "1.1.0",
                        "files": {},
                        "full": {
                            "url": "https://oss/backend.zip",
                            "sha256": "a" * 64,
                            "signature": "sig",
                            "size": 1,
                        },
                    },
                },
            },
        ),
        "https://oss/manifest.json",
    )

    plans = service.check()

    assert plans[0]["component"] == "backend"
    assert plans[0]["from_version"] == "1.0.0"
    assert plans[0]["preserve_paths"] == ()


def test_runtime_active_pointer_cannot_escape_managed_root(
    monkeypatch,
    tmp_path,
):
    managed = tmp_path / "managed"
    active = tmp_path / "state" / "active.json"
    escaped = tmp_path / "outside"
    escaped.mkdir()
    active.parent.mkdir()
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {
                        "version": "1.0.0",
                        "path": str(escaped),
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._MANAGED_COMPONENTS_ROOT",
        managed,
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )

    with pytest.raises(ComponentUpdateError, match="escapes"):
        _resolve_managed_directory(updater, "backend")


def test_signed_manifest_adopts_new_plugin_as_full(monkeypatch, tmp_path):
    plugins = tmp_path / "plugins"
    monkeypatch.setattr(
        "qwenpaw.components.service.get_plugins_dir",
        lambda: plugins,
    )
    manifest = {
        "components": {
            "new-plugin": {
                "version": "1.0.0",
                "files": {},
                "full": {
                    "url": "https://oss/new-plugin.zip",
                    "sha256": "a" * 64,
                    "signature": "sig",
                    "size": 1,
                },
            },
        },
    }
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"existing"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    service = ComponentUpdateService(
        updater,
        _Client(manifest),
        "https://oss/manifest.json",
    )

    plans = service.check()

    assert updater.managed_components == frozenset(
        {"existing", "new-plugin"},
    )
    assert len(plans) == 1
    assert plans[0]["component"] == "new-plugin"
    assert plans[0]["from_version"] is None
    assert plans[0]["target_version"] == "1.0.0"
    assert plans[0]["artifact_kind"] == "full"
    assert plans[0]["artifact_url"] == "https://oss/new-plugin.zip"


def test_signed_new_plugin_can_install_after_service_restart(
    monkeypatch,
    tmp_path,
):
    plugins = tmp_path / "plugins"
    adopted_path = tmp_path / "components" / "adopted.json"
    monkeypatch.setattr(
        "qwenpaw.components.service.get_plugins_dir",
        lambda: plugins,
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._ADOPTED_COMPONENTS_PATH",
        adopted_path,
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._COMPONENT_INSTALL_LOCKS",
        tmp_path / "component-install-locks",
    )
    manifest = {
        "components": {
            "new-plugin": {
                "version": "1.0.0",
                "files": {},
                "full": {
                    "url": "https://oss/new-plugin.zip",
                    "sha256": "a" * 64,
                    "signature": "sig",
                    "size": 1,
                },
            },
        },
    }
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"existing"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    monkeypatch.setattr(updater, "plan", lambda *_args, **_kwargs: None)
    service = ComponentUpdateService(
        updater,
        _Client(manifest),
        "https://oss/manifest.json",
    )

    result = service.install("new-plugin")

    assert result == {
        "component": "new-plugin",
        "updated": False,
        "reason": "up-to-date",
    }
    assert "new-plugin" in updater.managed_components
    assert json.loads(adopted_path.read_text(encoding="utf-8"))[
        "components"
    ] == [
        "new-plugin",
    ]

    # Simulate the next backend process after the plugin now exists on disk.
    installed = plugins / "new-plugin"
    installed.mkdir(parents=True)
    (installed / "plugin.json").write_text(
        json.dumps({"id": "new-plugin", "version": "1.0.0"}),
        encoding="utf-8",
    )
    restarted_updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"existing"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    restarted = ComponentUpdateService(
        restarted_updater,
        _Client(manifest),
        "https://oss/manifest.json",
    )

    assert restarted.check() == []
    assert "new-plugin" in restarted_updater.managed_components


def test_component_directory_alias_is_resolved_by_manifest_id(
    monkeypatch,
    tmp_path,
):
    plugins = tmp_path / "plugins"
    alias = plugins / "thinking-log-middleware"
    alias.mkdir(parents=True)
    (alias / "plugin.json").write_text(
        json.dumps(
            {
                "id": "middleware-demo-thinking-log",
                "version": "1.0.0",
            },
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service.get_plugins_dir",
        lambda: plugins,
    )
    manifest = {
        "components": {
            "middleware-demo-thinking-log": {
                "version": "1.1.0",
                "files": {},
                "full": {
                    "url": "https://oss/thinking-log.zip",
                    "sha256": "a" * 64,
                    "signature": "sig",
                    "size": 1,
                },
            },
        },
    }
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"middleware-demo-thinking-log"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    service = ComponentUpdateService(
        updater,
        _Client(manifest),
        "https://oss/manifest.json",
    )

    plans = service.check()

    assert plans[0]["component"] == "middleware-demo-thinking-log"
    assert plans[0]["from_version"] == "1.0.0"


def test_component_destination_rejects_reparse_plugins_root(
    monkeypatch,
    tmp_path,
):
    plugins = tmp_path / "plugins"
    plugins.mkdir()
    monkeypatch.setattr(
        "qwenpaw.components.service._is_link_like",
        lambda path: path == plugins,
    )

    with pytest.raises(ComponentUpdateError, match="plugins directory"):
        resolve_component_destination(plugins, "demo")
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    monkeypatch.setattr(
        "qwenpaw.components.update._is_link_like",
        lambda path: path == plugins,
    )
    with pytest.raises(ComponentUpdateError, match="plugins directory"):
        updater.pending_activation_components(plugins)


def test_component_destination_recovers_alias_from_hidden_previous(tmp_path):
    plugins = tmp_path / "plugins"
    previous = plugins / ".alias.previous"
    previous.mkdir(parents=True)
    (previous / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )

    destination = resolve_component_destination(plugins, "demo")

    assert destination == plugins / "alias"
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=tmp_path / "active.json",
    )
    assert updater.rollback_activation("demo", destination) is True
    assert destination.is_dir()
    assert not previous.exists()


def test_component_destination_ignores_unsafe_previous_alias(tmp_path):
    plugins = tmp_path / "plugins"
    previous = plugins / "....previous"
    previous.mkdir(parents=True)
    (previous / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )

    assert resolve_component_destination(plugins, "demo") == plugins / "demo"
    assert updater.pending_activation_components(plugins) == set()


def test_component_destination_rejects_conflicting_direct_directory(tmp_path):
    plugins = tmp_path / "plugins"
    direct = plugins / "demo"
    direct.mkdir(parents=True)
    (direct / "plugin.json").write_text(
        json.dumps({"id": "market-plugin", "version": "1.0.0"}),
        encoding="utf-8",
    )

    try:
        resolve_component_destination(plugins, "demo")
    except ComponentUpdateError as exc:
        assert "occupied" in str(exc)
    else:  # pragma: no cover - assertion guard
        raise AssertionError("conflicting direct directory was accepted")


def test_component_destination_rejects_direct_reparse_point(
    monkeypatch,
    tmp_path,
):
    plugins = tmp_path / "plugins"
    direct = plugins / "demo"
    direct.mkdir(parents=True)
    (direct / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._is_link_like",
        lambda path: path == direct,
    )

    with pytest.raises(ComponentUpdateError, match="must not be a link"):
        resolve_component_destination(plugins, "demo")


def test_component_destination_rejects_duplicate_aliases(tmp_path):
    plugins = tmp_path / "plugins"
    for name in ("alias-a", "alias-b"):
        alias = plugins / name
        alias.mkdir(parents=True)
        (alias / "plugin.json").write_text(
            json.dumps({"id": "demo", "version": "1.0.0"}),
            encoding="utf-8",
        )

    try:
        resolve_component_destination(plugins, "demo")
    except ComponentUpdateError as exc:
        assert "multiple plugin directories" in str(exc)
    else:  # pragma: no cover - assertion guard
        raise AssertionError("duplicate aliases were accepted")


def test_component_destination_rejects_linked_alias(monkeypatch, tmp_path):
    plugins = tmp_path / "plugins"
    alias = plugins / "legacy-demo"
    alias.mkdir(parents=True)
    (alias / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._is_link_like",
        lambda path: path == alias,
    )

    with pytest.raises(ComponentUpdateError, match="alias must not be a link"):
        resolve_component_destination(plugins, "demo")


def test_component_destination_rejects_linked_previous_target(
    monkeypatch,
    tmp_path,
):
    plugins = tmp_path / "plugins"
    previous = plugins / ".legacy-demo.previous"
    previous.mkdir(parents=True)
    (previous / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    destination = plugins / "legacy-demo"
    destination.mkdir()
    (destination / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.1.0"}),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._is_link_like",
        lambda path: path == destination,
    )

    with pytest.raises(ComponentUpdateError, match="must not be a link"):
        resolve_component_destination(plugins, "demo")


def test_component_destination_rejects_direct_and_alias_duplicate(tmp_path):
    plugins = tmp_path / "plugins"
    for name in ("demo", "legacy-demo"):
        plugin = plugins / name
        plugin.mkdir(parents=True)
        (plugin / "plugin.json").write_text(
            json.dumps({"id": "demo", "version": "1.0.0"}),
            encoding="utf-8",
        )

    try:
        resolve_component_destination(plugins, "demo")
    except ComponentUpdateError as exc:
        assert "multiple plugin directories" in str(exc)
    else:  # pragma: no cover - assertion guard
        raise AssertionError("direct and alias duplicate was accepted")


def test_alias_activation_marker_is_discovered(tmp_path):
    plugins = tmp_path / "plugins"
    alias = plugins / "thinking-log-middleware"
    alias.mkdir(parents=True)
    (alias / "plugin.json").write_text(
        json.dumps(
            {
                "id": "middleware-demo-thinking-log",
                "version": "1.1.0",
            },
        ),
        encoding="utf-8",
    )
    (plugins / ".thinking-log-middleware.activation.json").write_text(
        json.dumps(
            {
                "schema_version": 1,
                "component": "middleware-demo-thinking-log",
                "version": "1.1.0",
            },
        ),
        encoding="utf-8",
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"middleware-demo-thinking-log"},
        target="windows-x86_64",
        core_version="1.0.0",
    )

    assert updater.pending_activation_components(plugins) == {
        "middleware-demo-thinking-log",
    }


def test_signed_manifest_does_not_take_over_unmanaged_local_plugin(
    monkeypatch,
    tmp_path,
):
    plugins = tmp_path / "plugins"
    local = plugins / "local-directory"
    local.mkdir(parents=True)
    (local / "plugin.json").write_text(
        json.dumps({"id": "market-plugin", "version": "1.0.0"}),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service.get_plugins_dir",
        lambda: plugins,
    )
    manifest = {
        "components": {
            "market-plugin": {
                "version": "2.0.0",
                "files": {},
                "full": {
                    "url": "https://oss/market-plugin.zip",
                    "sha256": "a" * 64,
                    "signature": "sig",
                    "size": 1,
                },
            },
        },
    }
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"existing"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    service = ComponentUpdateService(
        updater,
        _Client(manifest),
        "https://oss/manifest.json",
    )

    assert service.check() == []
    assert updater.managed_components == frozenset({"existing"})


def test_signed_manifest_cannot_adopt_denied_plugin(monkeypatch, tmp_path):
    monkeypatch.setattr(
        "qwenpaw.components.service.get_plugins_dir",
        lambda: tmp_path / "plugins",
    )
    manifest = {
        "components": {
            "cloudpaw": {
                "version": "1.0.0",
                "files": {},
                "full": {
                    "url": "https://oss/cloudpaw.zip",
                    "sha256": "a" * 64,
                    "signature": "sig",
                    "size": 1,
                },
            },
        },
    }
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"existing"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    service = ComponentUpdateService(
        updater,
        _Client(manifest),
        "https://oss/manifest.json",
    )

    assert service.check() == []
    assert updater.managed_components == frozenset({"existing"})


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
    tombstones = plugins / ".uninstalled"
    tombstones.mkdir(parents=True)
    (tombstones / "demo").write_text("1", encoding="utf-8")
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


def test_startup_updates_require_an_explicit_queue(monkeypatch, tmp_path):
    monkeypatch.delenv("QWENPAW_COMPONENT_UPDATES", raising=False)
    monkeypatch.setattr(
        "qwenpaw.components.service._PENDING_UPDATES_PATH",
        tmp_path / "missing.json",
    )

    class _Service:
        def __init__(self):
            self.client = type("Client", (), {"close": lambda self: None})()

        def snapshot(self):
            return {"release": "one"}, []

    result = run_startup_updates()
    assert result == {"enabled": False, "updated": [], "errors": []}


def test_queued_startup_update_failure_is_non_fatal(monkeypatch, tmp_path):
    pending = tmp_path / "pending.json"
    pending.write_text(
        json.dumps({"schema_version": 1, "components": ["demo"]}),
        encoding="utf-8",
    )

    class _BrokenService:
        def __init__(self):
            self.client = type("Client", (), {"close": lambda self: None})()

        def snapshot(self):
            raise RuntimeError("offline")

    monkeypatch.setattr(
        "qwenpaw.components.service._PENDING_UPDATES_PATH",
        pending,
    )
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
    payload = json.loads(pending.read_text(encoding="utf-8"))
    assert payload["schema_version"] == 2
    assert list(payload["components"]) == ["demo"]
    assert payload["components"]["demo"]["attempts"] == 0
    assert payload["components"]["demo"]["queued_at"]


def test_queue_unmanaged_component_sets_not_managed_reason(monkeypatch):
    class _Service:
        def __init__(self):
            self.updater = type(
                "Updater",
                (),
                {"managed_components": {"demo"}},
            )()
            self.client = type("Client", (), {"close": lambda self: None})()

        def check(self):
            return []

    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        lambda: _Service(),
    )
    with pytest.raises(ComponentUpdateError) as caught:
        queue_component_update("ugsci")
    assert caught.value.reason == "not_managed"
    assert (
        ComponentUpdateError(
            "component updates are not configured",
        ).reason
        == "conflict"
    )


def test_all_available_updates_are_queued_together(monkeypatch, tmp_path):
    pending = tmp_path / "pending.json"

    class _Service:
        def __init__(self):
            self.client = type("Client", (), {"close": lambda self: None})()

        def check(self):
            return [
                {"component": "beta"},
                {"component": "alpha"},
            ]

    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        lambda: _Service(),
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._PENDING_UPDATES_PATH",
        pending,
    )

    assert queue_all_component_updates() == {
        "enabled": True,
        "queued": ["alpha", "beta"],
        "restart_required": True,
    }
    payload = json.loads(pending.read_text(encoding="utf-8"))
    assert payload["schema_version"] == 2
    assert list(payload["components"]) == ["alpha", "beta"]


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


def test_unavailable_pending_update_is_removed(monkeypatch, tmp_path):
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
    assert not pending.exists()


def test_failed_pending_update_is_pruned_after_retry_limit(
    monkeypatch,
    tmp_path,
):
    pending = tmp_path / "pending.json"
    pending.write_text(
        json.dumps(
            {
                "schema_version": 2,
                "components": {
                    "demo": {
                        "queued_at": "2026-08-14T00:00:00+00:00",
                        "attempts": 4,
                        "last_error": "offline",
                    },
                },
            },
        ),
        encoding="utf-8",
    )

    class _BrokenService:
        def __init__(self):
            self.client = type("Client", (), {"close": lambda self: None})()

        def snapshot(self):
            raise RuntimeError("still offline")

    monkeypatch.setattr(
        "qwenpaw.components.service._PENDING_UPDATES_PATH",
        pending,
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._pending_now",
        lambda: datetime.fromisoformat("2026-08-14T01:00:00+00:00"),
    )
    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        lambda: _BrokenService(),
    )

    result = run_startup_updates()

    assert result["errors"][0]["component"] == "manifest"
    assert not pending.exists()


def test_queued_startup_batch_reuses_one_manifest_snapshot(
    monkeypatch,
    tmp_path,
):
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
    pending = tmp_path / "pending.json"
    pending.write_text(
        json.dumps(
            {"schema_version": 1, "components": ["alpha", "beta"]},
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "qwenpaw.components.service._PENDING_UPDATES_PATH",
        pending,
    )
    monkeypatch.setattr(
        "qwenpaw.components.service.configured_service",
        lambda: service,
    )
    result = run_startup_updates()

    assert client.fetches == 1
    assert [component for component, _ in installed] == ["alpha", "beta"]
    assert all(snapshot is manifest for _, snapshot in installed)
    assert len(result["updated"]) == 2


def test_install_uses_cross_process_component_lock() -> None:
    """Claim 2: installs must hold a cross-process per-component lock."""
    import inspect

    import qwenpaw.components.service as svc

    source = inspect.getsource(svc.ComponentUpdateService._install)
    assert "plugin_install_lock" in source, (
        "_install_from_manifest must take the cross-process component lock; "
        "threading.RLock alone cannot stop two backend processes racing "
        "_atomic_activate"
    )
    assert "_component_install_lock_path" in source
    assert hasattr(svc, "_component_install_lock_path")


def test_component_install_lock_timeout_fails_closed(
    monkeypatch,
) -> None:
    """A timed-out component lock must never proceed into activation."""
    from contextlib import contextmanager

    @contextmanager
    def unavailable_lock(*_args, **_kwargs):
        yield False

    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    service = ComponentUpdateService(updater, _Client({}), "https://example")
    called = False

    def should_not_install(*_args, **_kwargs):
        nonlocal called
        called = True

    monkeypatch.setattr(
        "qwenpaw.components.service.plugin_install_lock",
        unavailable_lock,
    )
    monkeypatch.setattr(service, "_install_locked", should_not_install)

    with pytest.raises(ComponentUpdateError, match="already in progress"):
        service.install("demo")
    assert called is False


def test_delta_lease_contention_does_not_fall_back_to_full() -> None:
    """Claim 2: delta lease contention must propagate, not trigger full."""
    import inspect

    import qwenpaw.components.service as svc

    source = inspect.getsource(svc.ComponentUpdateService._install_component)
    marker = '"already in progress" in str(exc)'
    fallback = source.find("falling back to full")
    contention = source.find(marker)
    assert contention != -1, (
        "delta contention must be detected and re-raised before the full "
        "fallback; otherwise two processes race activation via different "
        "artifact leases"
    )
    assert contention < fallback
