# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Safety regressions for bundled-plugin startup synchronization."""

from __future__ import annotations

import json
import sys

import pytest

from qwenpaw.plugins import bundled
from qwenpaw.app.routers.plugins import _frontend_revision
from qwenpaw.plugins.loader import PluginLoader


def _write_plugin(directory, version: str, *, frontend: bool = True) -> dict:
    directory.mkdir(parents=True)
    manifest = {
        "id": "critical-plugin",
        "version": version,
        "entry": {
            "backend": "plugin.py",
            "frontend": "ui/dist/index.js",
        },
    }
    (directory / "plugin.json").write_text(
        json.dumps(manifest),
        encoding="utf-8",
    )
    (directory / "plugin.py").write_text(
        f'VERSION = "{version}"\n',
        encoding="utf-8",
    )
    if frontend:
        frontend_path = directory / "ui" / "dist" / "index.js"
        frontend_path.parent.mkdir(parents=True)
        frontend_path.write_text(f"// {version}\n", encoding="utf-8")
    return manifest


def test_uninstall_tombstone_survives_deleted_plugin_directory(tmp_path):
    plugins = tmp_path / "plugins"

    assert bundled.mark_plugin_uninstalled(
        "critical-plugin",
        plugins_dir=plugins,
    )
    assert not (plugins / "critical-plugin").exists()
    assert (plugins / ".uninstalled" / "critical-plugin").is_file()
    assert bundled.is_plugin_uninstalled(
        "critical-plugin",
        plugins_dir=plugins,
    )


@pytest.mark.parametrize(
    "plugin_id",
    ["", ".", "..", "../escape", "a/b", r"a\b", "C:escape", " bad"],
)
def test_uninstall_tombstone_rejects_unsafe_plugin_ids(
    tmp_path,
    plugin_id,
):
    plugins = tmp_path / "plugins"

    with pytest.raises(ValueError, match="unsafe plugin id"):
        bundled.mark_plugin_uninstalled(plugin_id, plugins_dir=plugins)
    assert not (tmp_path / "escape").exists()


def test_legacy_uninstall_marker_is_migrated_and_cleared(tmp_path):
    plugins = tmp_path / "plugins"
    installed = plugins / "critical-plugin"
    _write_plugin(installed, "1.0.0")
    legacy = installed / ".uninstalled"
    legacy.write_text("legacy", encoding="utf-8")

    assert bundled.is_plugin_uninstalled(
        "critical-plugin",
        plugins_dir=plugins,
        plugin_dir=installed,
    )
    assert not legacy.exists()
    assert (plugins / ".uninstalled" / "critical-plugin").is_file()
    assert bundled.clear_uninstalled_marker(
        "critical-plugin",
        plugins_dir=plugins,
    )
    assert not bundled.is_plugin_uninstalled(
        "critical-plugin",
        plugins_dir=plugins,
        plugin_dir=installed,
    )


def test_sync_and_loader_skip_persistent_uninstall_tombstone(
    monkeypatch,
    tmp_path,
):
    source_root = tmp_path / "bundle"
    _write_plugin(source_root / "critical-plugin", "1.0.0")
    plugins = tmp_path / "plugins"
    bundled.mark_plugin_uninstalled(
        "critical-plugin",
        plugins_dir=plugins,
    )
    monkeypatch.setattr(
        bundled,
        "_get_bundled_plugins_dirs",
        lambda: [source_root],
    )
    monkeypatch.setattr(
        "qwenpaw.config.utils.get_plugins_dir",
        lambda: plugins,
    )

    assert not bundled.ensure_bundled_plugins_installed()
    assert not (plugins / "critical-plugin").exists()

    _write_plugin(plugins / "critical-plugin", "1.0.0")
    assert not PluginLoader([plugins]).discover_plugins()


def test_macos_onedir_fallback_discovers_plugins_next_to_executable(
    monkeypatch,
    tmp_path,
) -> None:
    """Finder-launched PyInstaller apps can resolve from the onedir root."""
    backend_root = (
        tmp_path
        / "UGSci Desktop.app"
        / "Contents"
        / "Resources"
        / "binaries"
        / "qwenpaw-backend"
    )
    plugin_root = backend_root / "_internal" / "qwenpaw" / "plugins_bundle"
    _write_plugin(plugin_root / "critical-plugin", "1.0.0")

    # Make package-relative and source-checkout discovery unavailable so this
    # exercises the macOS onedir executable fallback specifically.
    import qwenpaw

    fake_package = tmp_path / "unrelated" / "qwenpaw" / "__init__.py"
    fake_package.parent.mkdir(parents=True)
    fake_package.write_text("", encoding="utf-8")
    monkeypatch.setattr(qwenpaw, "__file__", str(fake_package))
    monkeypatch.setattr(bundled, "__file__", str(fake_package))
    backend_executable = backend_root / "qwenpaw-backend"
    monkeypatch.setattr(sys, "executable", str(backend_executable))
    monkeypatch.delattr(sys, "_MEIPASS", raising=False)

    discovered = bundled._get_bundled_plugins_dirs()

    assert plugin_root.resolve() in discovered


def test_frozen_runtime_never_discovers_plugins_from_checkout_parent(
    monkeypatch,
    tmp_path,
) -> None:
    """A signed desktop must not borrow plugins from a nearby source tree."""
    checkout = tmp_path / "checkout"
    fake_module = checkout / "src" / "qwenpaw" / "plugins" / "bundled.py"
    fake_module.parent.mkdir(parents=True)
    fake_module.write_text("", encoding="utf-8")
    source_plugins = checkout / "plugins" / "bundle"
    _write_plugin(source_plugins / "source-only", "1.0.0")

    import qwenpaw

    unrelated_package = tmp_path / "installed" / "qwenpaw" / "__init__.py"
    unrelated_package.parent.mkdir(parents=True)
    unrelated_package.write_text("", encoding="utf-8")
    monkeypatch.setattr(qwenpaw, "__file__", str(unrelated_package))
    monkeypatch.setattr(bundled, "__file__", str(fake_module))
    monkeypatch.setattr(sys, "executable", str(tmp_path / "app" / "backend"))
    monkeypatch.setattr(sys, "frozen", True, raising=False)
    monkeypatch.delattr(sys, "_MEIPASS", raising=False)

    discovered = bundled._get_bundled_plugins_dirs()

    assert source_plugins.resolve() not in discovered


def test_desktop_marker_never_discovers_plugins_from_checkout_parent(
    monkeypatch,
    tmp_path,
) -> None:
    """Python-mode desktop diagnostics must obey the frozen plugin boundary."""
    checkout = tmp_path / "checkout"
    fake_module = checkout / "src" / "qwenpaw" / "plugins" / "bundled.py"
    fake_module.parent.mkdir(parents=True)
    fake_module.write_text("", encoding="utf-8")
    source_plugins = checkout / "plugins" / "bundle"
    _write_plugin(source_plugins / "source-only", "1.0.0")

    import qwenpaw

    unrelated_package = tmp_path / "installed" / "qwenpaw" / "__init__.py"
    unrelated_package.parent.mkdir(parents=True)
    unrelated_package.write_text("", encoding="utf-8")
    monkeypatch.setattr(qwenpaw, "__file__", str(unrelated_package))
    monkeypatch.setattr(bundled, "__file__", str(fake_module))
    monkeypatch.setattr(sys, "executable", str(tmp_path / "app" / "backend"))
    monkeypatch.setattr(sys, "frozen", False, raising=False)
    monkeypatch.delattr(sys, "_MEIPASS", raising=False)
    monkeypatch.setenv("QWENPAW_DESKTOP_APP", "1")

    discovered = bundled._get_bundled_plugins_dirs()

    assert source_plugins.resolve() not in discovered


def test_desktop_fast_path_repairs_missing_entry(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")
    _write_plugin(target, "1.0.0", frontend=False)
    bundle_hash_file = target / bundled._BUNDLE_HASH_FILE
    bundle_hash_file.write_text(  # pylint: disable=protected-access
        "previous-complete-install",
        encoding="utf-8",
    )
    monkeypatch.setenv("QWENPAW_DESKTOP_APP", "1")

    install_or_update = bundled._install_or_update_plugin
    changed = install_or_update(  # pylint: disable=protected-access
        source,
        target,
        "critical-plugin",
        manifest,
    )

    assert changed is True
    assert (target / "ui" / "dist" / "index.js").is_file()


def test_packaged_same_version_skips_content_hash(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")
    _write_plugin(target, "1.0.0")
    monkeypatch.setattr(bundled, "_is_development_environment", lambda: False)
    (target / bundled._BUNDLE_REVISION_FILE).write_text(
        "version:1.0.0",
        encoding="utf-8",
    )
    bundled._write_bundle_complete(target, target)

    def _fail_hash(*_args, **_kwargs):
        raise AssertionError("packaged startup must not compute bundle hashes")

    monkeypatch.setattr(bundled, "_compute_bundle_hash", _fail_hash)

    changed = bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
    )

    assert changed is False
    assert (target / bundled._BUNDLE_REVISION_FILE).read_text(
        encoding="utf-8",
    ) == "version:1.0.0"
    assert (target / bundled._BUNDLE_COMPLETE_FILE).is_file()


def test_packaged_same_version_repairs_missing_completion_marker(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")
    _write_plugin(target, "1.0.0")
    monkeypatch.setattr(bundled, "_is_development_environment", lambda: False)
    (target / bundled._BUNDLE_REVISION_FILE).write_text(
        "version:1.0.0",
        encoding="utf-8",
    )

    assert bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
    )
    assert (target / bundled._BUNDLE_COMPLETE_FILE).is_file()
    assert (target / bundled._BUNDLE_REVISION_FILE).read_text(
        encoding="utf-8",
    ) == "version:1.0.0"


def test_packaged_same_version_repairs_missing_non_entry_file(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")
    (source / "runtime.py").write_text("VALUE = 1\n", encoding="utf-8")
    _write_plugin(target, "1.0.0")
    (target / "runtime.py").write_text("VALUE = 1\n", encoding="utf-8")
    bundled._write_bundle_revision(target, "version:1.0.0")
    bundled._write_bundle_complete(target, target)
    (target / "runtime.py").unlink()
    monkeypatch.setattr(bundled, "_is_development_environment", lambda: False)

    assert bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
    )
    assert (target / "runtime.py").is_file()


def test_development_same_version_still_detects_content_changes(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")
    _write_plugin(target, "1.0.0")
    monkeypatch.setattr(bundled, "_is_development_environment", lambda: True)

    # Seed the installed marker from the original source, then change a file
    # without changing plugin.json/version.
    original_hash = bundled._compute_bundle_hash(source, manifest)
    (target / bundled._BUNDLE_HASH_FILE).write_text(
        original_hash,
        encoding="utf-8",
    )
    (source / "plugin.py").write_text(
        'VERSION = "1.0.0-dev-edit"\n',
        encoding="utf-8",
    )

    changed = bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
    )

    assert changed is True
    assert (target / "plugin.py").read_text(encoding="utf-8") == (
        'VERSION = "1.0.0-dev-edit"\n'
    )


def test_failed_update_keeps_previous_plugin(monkeypatch, tmp_path) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "2.0.0")
    _write_plugin(target, "1.0.0")

    def _fail_copy(_source, _target) -> None:
        raise OSError("simulated antivirus lock")

    monkeypatch.setattr(bundled, "_copy_bundle", _fail_copy)

    with pytest.raises(OSError, match="antivirus"):
        bundled._install_or_update_plugin(  # pylint: disable=protected-access
            source,
            target,
            "critical-plugin",
            manifest,
        )
    plugin_source = (target / "plugin.py").read_text(encoding="utf-8")
    assert plugin_source == 'VERSION = "1.0.0"\n'
    assert (target / "ui" / "dist" / "index.js").is_file()


def test_failed_rollback_retains_previous_plugin_backup(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "2.0.0")
    _write_plugin(target, "1.0.0")
    original_replace = bundled.Path.replace

    def _fail_new_and_rollback(path, destination):
        if path.name == "plugin" or path.name.startswith(
            ".critical-plugin.previous-",
        ):
            raise OSError("simulated persistent Windows file lock")
        return original_replace(path, destination)

    monkeypatch.setattr(bundled.Path, "replace", _fail_new_and_rollback)

    with pytest.raises(RuntimeError, match="backup retained"):
        bundled._install_or_update_plugin(  # pylint: disable=protected-access
            source,
            target,
            "critical-plugin",
            manifest,
        )
    backups = list(
        (tmp_path / "installed").glob(
            ".critical-plugin.previous-*",
        ),
    )
    assert len(backups) == 1
    assert (backups[0] / "plugin.py").read_text(encoding="utf-8") == (
        'VERSION = "1.0.0"\n'
    )


def test_deferred_bundled_update_rolls_back_after_failed_load(
    tmp_path,
) -> None:
    source = tmp_path / "source"
    plugins = tmp_path / "plugins"
    target = plugins / "critical-plugin"
    manifest = _write_plugin(source, "2.0.0")
    _write_plugin(target, "1.0.0")

    assert bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
        defer_activation_cleanup=True,
    )
    assert (target / "plugin.py").read_text(encoding="utf-8") == (
        'VERSION = "2.0.0"\n'
    )
    _target, previous, marker = bundled._bundled_activation_paths(
        "critical-plugin",
        plugins_dir=plugins,
    )
    assert previous.is_dir()
    assert marker.is_file()

    assert bundled.rollback_bundled_plugin_activation(
        "critical-plugin",
        plugins_dir=plugins,
    )
    assert (target / "plugin.py").read_text(encoding="utf-8") == (
        'VERSION = "1.0.0"\n'
    )
    assert not previous.exists()
    assert not marker.exists()


def test_deferred_bundled_update_finalizes_only_after_health(tmp_path) -> None:
    source = tmp_path / "source"
    plugins = tmp_path / "plugins"
    target = plugins / "critical-plugin"
    manifest = _write_plugin(source, "2.0.0")
    _write_plugin(target, "1.0.0")

    assert bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
        defer_activation_cleanup=True,
    )
    bundled.finalize_bundled_plugin_activation(
        "critical-plugin",
        plugins_dir=plugins,
    )

    _target, previous, marker = bundled._bundled_activation_paths(
        "critical-plugin",
        plugins_dir=plugins,
    )
    assert (target / "plugin.py").read_text(encoding="utf-8") == (
        'VERSION = "2.0.0"\n'
    )
    assert not previous.exists()
    assert not marker.exists()


def test_failed_first_bundled_install_removes_unhealthy_candidate(
    tmp_path,
) -> None:
    source = tmp_path / "source"
    plugins = tmp_path / "plugins"
    target = plugins / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")

    assert bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
        defer_activation_cleanup=True,
    )
    assert not bundled.rollback_bundled_plugin_activation(
        "critical-plugin",
        plugins_dir=plugins,
    )
    assert not target.exists()


def test_interrupted_bundled_activation_restores_previous_tree(
    tmp_path,
) -> None:
    source = tmp_path / "source"
    plugins = tmp_path / "plugins"
    target = plugins / "critical-plugin"
    manifest = _write_plugin(source, "2.0.0")
    _write_plugin(target, "1.0.0")
    bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
        defer_activation_cleanup=True,
    )

    assert bundled.recover_interrupted_bundled_activation(
        "critical-plugin",
        plugins_dir=plugins,
    )
    assert (target / "plugin.py").read_text(encoding="utf-8") == (
        'VERSION = "1.0.0"\n'
    )


def test_frontend_revision_changes_without_version_bump(tmp_path) -> None:
    plugin_dir = tmp_path / "plugin"
    manifest = _write_plugin(plugin_dir, "1.0.0")
    entry = manifest["entry"]["frontend"]
    first = _frontend_revision(plugin_dir, entry, "1.0.0")

    (plugin_dir / entry).write_text("// hotfix\n", encoding="utf-8")
    second = _frontend_revision(plugin_dir, entry, "1.0.0")

    assert first != second


def test_frontend_revision_prefers_release_revision_marker(tmp_path) -> None:
    plugin_dir = tmp_path / "plugin"
    manifest = _write_plugin(plugin_dir, "1.0.0")
    (plugin_dir / bundled._BUNDLE_REVISION_FILE).write_text(
        "version:1.0.0",
        encoding="utf-8",
    )

    revision = _frontend_revision(
        plugin_dir,
        manifest["entry"]["frontend"],
        "1.0.0",
    )

    assert revision == "1.0.0-version:1.0.0"


def _write_startup_plugin(directory, version):
    manifest = _write_plugin(directory, version)
    (directory / "plugin.py").write_text(
        f'VERSION = "{version}"\n'
        "class Plugin:\n"
        "    def register(self, api):\n"
        "        pass\n"
        "plugin = Plugin()\n",
        encoding="utf-8",
    )
    return manifest


@pytest.mark.asyncio
@pytest.mark.parametrize("stops_cleanly", [False, True])
@pytest.mark.usefixtures("bounded_dependency_environment")
async def test_startup_recovery_waits_for_real_lifecycle_teardown(
    tmp_path,
    fresh_registry,
    stops_cleanly,
):
    from functools import partial
    from qwenpaw.app.plugin_activation import reconcile_plugin_activation
    from qwenpaw.plugins.lifecycle import QuiescenceError

    source = tmp_path / "source"
    plugins = tmp_path / "plugins"
    target = plugins / "critical-plugin"
    manifest = _write_startup_plugin(source, "2.0.0")
    _write_startup_plugin(target, "1.0.0")
    bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
        defer_activation_cleanup=True,
    )
    loader = PluginLoader([plugins])
    loader.registry = fresh_registry
    records = await loader.load_all_plugins()
    record = records["critical-plugin"]
    instance = loader.lifecycle.get_instance("critical-plugin")
    stopped = []

    def stop():
        stopped.append(True)
        if not stops_cleanly:
            raise QuiescenceError("worker remains alive")

    instance.record_runtime("fixture worker", stop)
    instance.mark_failed("fixture activation failure")
    record.status = "failed"
    record.enabled = False
    healthy = await reconcile_plugin_activation(
        loader,
        "critical-plugin",
        finalize=partial(
            bundled.finalize_bundled_plugin_activation,
            "critical-plugin",
            plugins_dir=plugins,
        ),
        rollback=partial(
            bundled.rollback_bundled_plugin_activation,
            "critical-plugin",
            plugins_dir=plugins,
        ),
    )
    assert healthy is False
    assert stopped
    _, previous, marker = bundled._bundled_activation_paths(
        "critical-plugin",
        plugins_dir=plugins,
    )
    if stops_cleanly:
        assert not marker.exists()
        assert not previous.exists()
        assert (
            loader.get_loaded_plugin("critical-plugin").manifest.version
            == "1.0.0"
        )
        await loader.unload_plugin("critical-plugin")
    else:
        assert marker.exists() and previous.exists()
        assert loader.get_loaded_plugin("critical-plugin") is record
        assert "2.0.0" in (target / "plugin.py").read_text(encoding="utf-8")
        # Release the real ledger after verifying the blocked recovery.
        stops_cleanly = True
        await loader.unload_plugin("critical-plugin")


@pytest.mark.asyncio
async def test_disabled_startup_candidate_commits_without_importing_code(
    tmp_path,
    fresh_registry,
):
    from functools import partial
    from qwenpaw.app.plugin_activation import reconcile_plugin_activation

    source = tmp_path / "source"
    plugins = tmp_path / "plugins"
    target = plugins / "critical-plugin"
    manifest = _write_startup_plugin(source, "2.0.0")
    (source / "plugin.py").write_text(
        'raise AssertionError("disabled imported")',
        encoding="utf-8",
    )
    _write_startup_plugin(target, "1.0.0")
    bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
        defer_activation_cleanup=True,
    )
    loader = PluginLoader([plugins])
    loader.registry = fresh_registry
    config = {"enabled": False}
    records = await loader.load_all_plugins(
        configs={"critical-plugin": config},
    )
    assert "critical-plugin" not in records
    assert await reconcile_plugin_activation(
        loader,
        "critical-plugin",
        config=config,
        finalize=partial(
            bundled.finalize_bundled_plugin_activation,
            "critical-plugin",
            plugins_dir=plugins,
        ),
        rollback=partial(
            bundled.rollback_bundled_plugin_activation,
            "critical-plugin",
            plugins_dir=plugins,
        ),
    )
    _, previous, marker = bundled._bundled_activation_paths(
        "critical-plugin",
        plugins_dir=plugins,
    )
    assert not previous.exists() and not marker.exists()
    assert (
        json.loads((target / "plugin.json").read_text(encoding="utf-8"))[
            "version"
        ]
        == "2.0.0"
    )
    assert loader.get_loaded_plugin("critical-plugin") is None


@pytest.mark.asyncio
@pytest.mark.usefixtures("bounded_dependency_environment")
async def test_healthy_candidate_cleanup_failure_never_rolls_back_live_code(
    tmp_path,
    fresh_registry,
):
    from functools import partial
    from qwenpaw.app.plugin_activation import reconcile_plugin_activation

    source = tmp_path / "source"
    plugins = tmp_path / "plugins"
    target = plugins / "critical-plugin"
    manifest = _write_startup_plugin(source, "2.0.0")
    _write_startup_plugin(target, "1.0.0")
    bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
        defer_activation_cleanup=True,
    )
    loader = PluginLoader([plugins])
    loader.registry = fresh_registry
    await loader.load_all_plugins()
    await loader.activate_all_loaded()

    def failed_cleanup():
        raise OSError("backup temporarily locked")

    with pytest.raises(OSError, match="temporarily locked"):
        await reconcile_plugin_activation(
            loader,
            "critical-plugin",
            finalize=failed_cleanup,
            rollback=partial(
                bundled.rollback_bundled_plugin_activation,
                "critical-plugin",
                plugins_dir=plugins,
            ),
        )
    record = loader.get_loaded_plugin("critical-plugin")
    assert record.manifest.version == "2.0.0"
    assert record.status == "active"
    _, previous, marker = bundled._bundled_activation_paths(
        "critical-plugin",
        plugins_dir=plugins,
    )
    assert previous.exists() and marker.exists()
    await loader.unload_plugin("critical-plugin")


@pytest.mark.asyncio
@pytest.mark.parametrize("orphan_stops", [False, True])
@pytest.mark.usefixtures("bounded_dependency_environment")
async def test_invalid_manifest_recovery_drains_orphan_ledger_before_restore(
    tmp_path,
    fresh_registry,
    orphan_stops,
):
    from functools import partial
    from qwenpaw.app.plugin_activation import reconcile_plugin_activation
    from qwenpaw.plugins.lifecycle import QuiescenceError

    source = tmp_path / "source"
    plugins = tmp_path / "plugins"
    target = plugins / "critical-plugin"
    manifest = _write_startup_plugin(source, "2.0.0")
    _write_startup_plugin(target, "1.0.0")
    bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
        defer_activation_cleanup=True,
    )
    (target / "plugin.json").write_text("corrupt candidate", encoding="utf-8")
    loader = PluginLoader([plugins])
    loader.registry = fresh_registry
    assert not await loader.load_all_plugins()
    instance = loader.lifecycle.ensure_instance("critical-plugin")
    attempts = []

    def stop_orphan():
        attempts.append(True)
        if not orphan_stops:
            raise QuiescenceError("orphan still running")

    instance.record_runtime("orphan worker", stop_orphan)
    assert not await reconcile_plugin_activation(
        loader,
        "critical-plugin",
        finalize=partial(
            bundled.finalize_bundled_plugin_activation,
            "critical-plugin",
            plugins_dir=plugins,
        ),
        rollback=partial(
            bundled.rollback_bundled_plugin_activation,
            "critical-plugin",
            plugins_dir=plugins,
        ),
    )
    assert attempts
    _, previous, marker = bundled._bundled_activation_paths(
        "critical-plugin",
        plugins_dir=plugins,
    )
    if orphan_stops:
        assert not marker.exists() and not previous.exists()
        assert (
            loader.get_loaded_plugin("critical-plugin").manifest.version
            == "1.0.0"
        )
        await loader.unload_plugin("critical-plugin")
    else:
        assert marker.exists() and previous.exists()
        assert loader.lifecycle.get_instance("critical-plugin") is instance
        assert (target / "plugin.json").read_text(
            encoding="utf-8",
        ) == "corrupt candidate"
        orphan_stops = True
        assert (await loader.quiesce_for_recovery("critical-plugin")).quiescent


@pytest.mark.asyncio
async def test_disabled_descriptor_channel_commits_without_starting_worker(
    tmp_path,
    fresh_registry,
    monkeypatch,
):
    import asyncio
    from functools import partial
    from pathlib import Path
    import shutil
    import subprocess
    from qwenpaw.app.plugin_activation import reconcile_plugin_activation

    official = Path(__file__).resolve().parents[3] / "plugins/channel/discord"
    source = tmp_path / "source"
    plugins = tmp_path / "plugins"
    target = plugins / "discord"
    for root, version in ((source, "2.0.0"), (target, "1.0.0")):
        shutil.copytree(official, root)
        path = root / "plugin.json"
        manifest = json.loads(path.read_text(encoding="utf-8"))
        manifest["version"] = version
        path.write_text(json.dumps(manifest), encoding="utf-8")
    manifest = json.loads((source / "plugin.json").read_text(encoding="utf-8"))
    bundled._install_or_update_plugin(
        source,
        target,
        "discord",
        manifest,
        defer_activation_cleanup=True,
    )

    def forbidden(*_args, **_kwargs):
        raise AssertionError("disabled channel started subprocess")

    monkeypatch.setattr(subprocess, "Popen", forbidden)
    monkeypatch.setattr(asyncio, "create_subprocess_exec", forbidden)
    loader = PluginLoader([plugins])
    loader.registry = fresh_registry
    config = {"enabled": False}
    records = await loader.load_all_plugins(configs={"discord": config})
    record = records["discord"]
    assert record.global_enabled is False and not record.enabled
    assert record.status in {"inactive", "registered"}
    assert await reconcile_plugin_activation(
        loader,
        "discord",
        config=config,
        finalize=partial(
            bundled.finalize_bundled_plugin_activation,
            "discord",
            plugins_dir=plugins,
        ),
        rollback=partial(
            bundled.rollback_bundled_plugin_activation,
            "discord",
            plugins_dir=plugins,
        ),
    )
    _, previous, marker = bundled._bundled_activation_paths(
        "discord",
        plugins_dir=plugins,
    )
    assert not marker.exists() and not previous.exists()
    current = loader.get_loaded_plugin("discord")
    assert current is not None
    assert current.global_enabled is False and not current.enabled
    assert current.status in {"inactive", "registered"}
    assert current.manifest.version == "2.0.0"
    assert "discord" in fresh_registry.get_channel_catalog()
    await loader.unload_plugin("discord")


@pytest.mark.asyncio
async def test_disabled_candidate_invalid_entry_restores_without_import(
    tmp_path,
    fresh_registry,
):
    from functools import partial
    from qwenpaw.app.plugin_activation import reconcile_plugin_activation

    source = tmp_path / "source"
    plugins = tmp_path / "plugins"
    target = plugins / "critical-plugin"
    manifest = _write_startup_plugin(source, "2.0.0")
    _write_startup_plugin(target, "1.0.0")
    (target / "plugin.py").write_text(
        'raise AssertionError("disabled imported")',
        encoding="utf-8",
    )
    bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
        defer_activation_cleanup=True,
    )
    (target / "plugin.py").unlink()
    loader = PluginLoader([plugins])
    loader.registry = fresh_registry
    assert not await reconcile_plugin_activation(
        loader,
        "critical-plugin",
        config={"enabled": False},
        finalize=partial(
            bundled.finalize_bundled_plugin_activation,
            "critical-plugin",
            plugins_dir=plugins,
        ),
        rollback=partial(
            bundled.rollback_bundled_plugin_activation,
            "critical-plugin",
            plugins_dir=plugins,
        ),
    )
    assert loader.get_loaded_plugin("critical-plugin") is None
    restored = json.loads((target / "plugin.json").read_text(encoding="utf-8"))
    assert restored["version"] == "1.0.0"
    assert "disabled imported" in (target / "plugin.py").read_text(
        encoding="utf-8",
    )


def _stage_disabled_startup_candidate(tmp_path):
    source = tmp_path / "source"
    plugins = tmp_path / "plugins"
    target = plugins / "critical-plugin"
    manifest = _write_startup_plugin(source, "2.0.0")
    (source / "plugin.py").write_text(
        'raise AssertionError("disabled imported")',
        encoding="utf-8",
    )
    _write_startup_plugin(target, "1.0.0")
    bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
        defer_activation_cleanup=True,
    )
    return plugins, target, manifest


@pytest.mark.asyncio
@pytest.mark.parametrize("has_record", [False, True])
@pytest.mark.parametrize("worker_stops", [False, True])
async def test_disabled_candidate_drains_retained_ledger_before_commit(
    tmp_path,
    fresh_registry,
    has_record,
    worker_stops,
):
    import asyncio
    from functools import partial
    from qwenpaw.app.plugin_activation import reconcile_plugin_activation
    from qwenpaw.plugins.architecture import PluginManifest
    from qwenpaw.plugins.lifecycle import QuiescenceError

    plugins, target, manifest = _stage_disabled_startup_candidate(tmp_path)
    loader = PluginLoader([plugins])
    loader.registry = fresh_registry
    config = {"enabled": False}
    if has_record:
        record = await loader.load_plugin(
            PluginManifest.from_dict(manifest),
            target,
            config,
            activate=False,
        )
        assert record.global_enabled is False and not record.enabled
    instance = loader.lifecycle.ensure_instance("critical-plugin")
    attempts = []
    worker = asyncio.create_task(asyncio.Event().wait())
    await asyncio.sleep(0)

    async def stop_worker():
        attempts.append(True)
        if not worker_stops:
            raise QuiescenceError("retained worker still running")
        worker.cancel()
        try:
            await worker
        except asyncio.CancelledError:
            pass

    instance.record_runtime("retained worker", stop_worker)
    committed = await reconcile_plugin_activation(
        loader,
        "critical-plugin",
        config=config,
        finalize=partial(
            bundled.finalize_bundled_plugin_activation,
            "critical-plugin",
            plugins_dir=plugins,
        ),
        rollback=partial(
            bundled.rollback_bundled_plugin_activation,
            "critical-plugin",
            plugins_dir=plugins,
        ),
    )
    assert attempts
    assert committed is worker_stops
    _, previous, marker = bundled._bundled_activation_paths(
        "critical-plugin",
        plugins_dir=plugins,
    )
    if worker_stops:
        assert not previous.exists() and not marker.exists()
        assert worker.done()
        assert loader.lifecycle.get_instance("critical-plugin") is not instance
        current = loader.get_loaded_plugin("critical-plugin")
        if has_record:
            assert current.manifest.version == "2.0.0"
            assert current.global_enabled is False and not current.enabled
        else:
            assert current is None
    else:
        assert previous.exists() and marker.exists()
        assert instance.has_runtime_ledger()
        assert not worker.done()
        assert loader.lifecycle.get_instance("critical-plugin") is instance
    worker_stops = True
    assert (await loader.quiesce_for_recovery("critical-plugin")).quiescent
