# -*- coding: utf-8 -*-
# pylint: disable=protected-access,redefined-outer-name
"""Real replacement transactions keep version and enable intent isolated."""

import asyncio
import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from qwenpaw.app.routers import plugins as router
from qwenpaw.plugins.architecture import PluginManifest
from qwenpaw.plugins.loader import PluginLoader

PLUGIN_ID = "transaction-update-fixture"


def _source(
    root,
    version,
    *,
    kind="general",
    broken=False,
    maximum="3.0.0",
    plugin_id=PLUGIN_ID,
):
    root.mkdir(parents=True)
    manifest = {
        "id": plugin_id,
        "name": plugin_id,
        "version": version,
        "type": kind,
        "qwenpaw_version": {"min": "2.0.0", "max": maximum},
        "entry": {"backend": "main.py"},
    }
    (root / "plugin.json").write_text(json.dumps(manifest), encoding="utf-8")
    (root / "main.py").write_text(
        (
            "class Plugin:\n    def register(self, api):\n"
            "        raise RuntimeError('candidate broken')\n"
            "plugin = Plugin()\n"
            if broken
            else "class Plugin:\n    def register(self, api):\n        pass\n"
            "plugin = Plugin()\n"
        ),
        encoding="utf-8",
    )
    return root


def _archive(source, archive, *, plugin_id=PLUGIN_ID):
    with zipfile.ZipFile(archive, "w") as bundle:
        for path in source.rglob("*"):
            if path.is_file():
                bundle.write(
                    path,
                    f"{plugin_id}/{path.relative_to(source).as_posix()}",
                )
    return router.ReplacePluginRequest(
        source=f"https://download.qwenpaw.agentscope.io/{archive.name}",
        plugin_id=plugin_id,
        version=json.loads(
            (source / "plugin.json").read_text(encoding="utf-8"),
        )["version"],
        sha256=hashlib.sha256(archive.read_bytes()).hexdigest(),
    )


@pytest.fixture
def update_environment(
    tmp_path,
    monkeypatch,
    fresh_registry,
    bounded_dependency_environment,
):
    del bounded_dependency_environment, fresh_registry
    from qwenpaw.config import utils as config_utils

    plugins = tmp_path / "plugins"
    monkeypatch.setattr(config_utils, "get_plugins_dir", lambda: plugins)
    monkeypatch.setattr(config_utils, "WORKING_DIR", tmp_path / "work")
    monkeypatch.setattr("qwenpaw.constant.WORKING_DIR", tmp_path / "work")
    loader = PluginLoader([plugins])
    request = SimpleNamespace(
        app=SimpleNamespace(state=SimpleNamespace(plugin_loader=loader)),
    )

    async def download(source, destination):
        shutil.copyfile(tmp_path / source.rsplit("/", 1)[1], destination)

    monkeypatch.setattr(router, "_async_download", download)
    return loader, request, plugins


@pytest.mark.asyncio
@pytest.mark.parametrize("has_record", [False, True])
async def test_replace_legacy_azure_bot_preserves_disabled_config(
    tmp_path,
    monkeypatch,
    update_environment,
    has_record,
):
    from qwenpaw.plugins.channel_adapter import ChannelRuntimeSettings
    from qwenpaw.plugins.settings import persist_plugin_settings
    from qwenpaw.config import load_config

    loader, request, plugins = update_environment
    plugin_id = "azure-bot"
    loader.registry.channel_runtime = ChannelRuntimeSettings(
        python_executable=sys.executable,
        support_root=Path(__file__).resolve().parents[3] / "src",
        qwenpaw_version="2.2.2b9",
        selected_channels=frozenset({"azure_bot"}),
    )
    installed = _source(
        plugins / plugin_id,
        "1.0.0",
        kind="channel",
        plugin_id=plugin_id,
    )
    config = {"custom": "保留配置", "tenant_id": "saved-tenant"}
    persist_plugin_settings(plugin_id, enabled=False, config=config)
    if has_record:
        await loader.load_plugin(
            PluginManifest.from_dict(
                json.loads((installed / "plugin.json").read_text()),
            ),
            installed,
            config={**config, "enabled": False},
        )
    shipped = Path(__file__).resolve().parents[3] / "plugins/channel/azure_bot"
    candidate = tmp_path / "candidate"
    candidate.mkdir()
    for name in ("plugin.json", "channel.json"):
        shutil.copyfile(shipped / name, candidate / name)
    (candidate / "requirements.txt").write_text("")

    async def forbidden_prepare(*_args, **_kwargs):
        raise AssertionError("Disabled migration executed candidate code")

    monkeypatch.setattr(loader.lifecycle, "prepare_backend", forbidden_prepare)
    result = await router.replace_installed_plugin(
        _archive(candidate, tmp_path / "azure.zip", plugin_id=plugin_id),
        request,
    )
    current = loader.get_loaded_plugin(plugin_id)
    if has_record:
        assert current.manifest.entry.descriptor == "channel.json"
        assert current.global_enabled is False and current.enabled is False
    else:
        assert current is None
    assert result["enabled"] is False and result["loaded"] is False
    assert load_config().plugins[plugin_id] == {**config, "enabled": False}
    assert json.loads(
        (installed / "plugin.json").read_text(encoding="utf-8"),
    )["entry"] == {
        "descriptor": "channel.json",
    }
    backup = Path(result["backup_path"])
    assert (
        json.loads((backup / "plugin.json").read_text())["version"] == "1.0.0"
    )


@pytest.mark.asyncio
@pytest.mark.parametrize("kind", ["general", "channel"])
async def test_replace_disabled_plugin_commits_without_activation(
    tmp_path,
    update_environment,
    kind,
):
    loader, request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0", kind=kind)
    manifest = PluginManifest.from_dict(
        json.loads((installed / "plugin.json").read_text()),
    )
    old = await loader.load_plugin(
        manifest,
        installed,
        config={"enabled": False},
    )
    assert old.global_enabled is False
    candidate = _source(tmp_path / "candidate", "2.0.0", kind=kind)
    body = _archive(candidate, tmp_path / "candidate.zip")
    result = await router.replace_installed_plugin(body, request)
    current = loader.get_loaded_plugin(PLUGIN_ID)
    assert current.manifest.version == "2.0.0"
    assert current.global_enabled is False and current.enabled is False
    assert current.status == "inactive"
    assert loader.lifecycle.get_instance(PLUGIN_ID).activated is False
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "2.0.0"
    )
    assert (
        json.loads((Path(result["backup_path"]) / "plugin.json").read_text())[
            "version"
        ]
        == "1.0.0"
    )
    assert result["enabled"] is False and result["loaded"] is False
    assert result["restart_required"] is False


@pytest.mark.asyncio
@pytest.mark.parametrize("has_record", [False, True])
async def test_replace_disabled_plugin_rejects_incompatible_candidate(
    tmp_path,
    monkeypatch,
    update_environment,
    has_record,
):
    from qwenpaw.config import Config

    config = Config(plugins={PLUGIN_ID: {"enabled": False}})
    monkeypatch.setattr("qwenpaw.config.load_config", lambda: config)
    loader, request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    manifest = PluginManifest.from_dict(
        json.loads((installed / "plugin.json").read_text()),
    )
    if has_record:
        await loader.load_plugin(
            manifest,
            installed,
            config={"enabled": False},
        )
    else:
        await loader.load_all_plugins(configs=config.plugins)
        assert loader.get_loaded_plugin(PLUGIN_ID) is None
    candidate = _source(tmp_path / "candidate", "2.0.0", maximum="2.0.0")
    body = _archive(candidate, tmp_path / "candidate.zip")
    with pytest.raises(HTTPException):
        await router.replace_installed_plugin(body, request)
    if has_record:
        assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "1.0.0"
    else:
        assert loader.get_loaded_plugin(PLUGIN_ID) is None
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "1.0.0"
    )


@pytest.mark.asyncio
async def test_failed_replace_cannot_reinstall_over_concurrent_success(
    tmp_path,
    monkeypatch,
    update_environment,
):
    loader, request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    await loader.load_plugin_from_path(installed, install_dir=plugins)
    bad = _source(tmp_path / "bad", "2.0.0", broken=True)
    good = _source(tmp_path / "good", "3.0.0")
    bad_body = _archive(bad, tmp_path / "bad.zip")
    good_body = _archive(good, tmp_path / "good.zip")
    first_failed = asyncio.Event()
    calls = []
    original = loader.load_plugin_from_path

    async def interleaved(*args, **kwargs):
        version = json.loads(
            (Path(kwargs["source_path"]) / "plugin.json").read_text(),
        )["version"]
        calls.append(version)
        try:
            return await original(*args, **kwargs)
        except RuntimeError:
            first_failed.set()
            # Ensure the second request queues before the first leaves its
            # outer critical section. The route must never reinstall v1.
            await asyncio.sleep(0.05)
            raise

    monkeypatch.setattr(loader, "load_plugin_from_path", interleaved)
    first = asyncio.create_task(
        router.replace_installed_plugin(bad_body, request),
    )
    await asyncio.wait_for(first_failed.wait(), 30)
    second = asyncio.create_task(
        router.replace_installed_plugin(good_body, request),
    )
    results = await asyncio.gather(first, second, return_exceptions=True)
    assert isinstance(results[0], HTTPException)
    assert results[1]["version"] == "3.0.0"
    assert calls == ["2.0.0", "3.0.0"]
    assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "3.0.0"
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "3.0.0"
    )
    backup = Path(results[1]["backup_path"])
    assert (
        json.loads((backup / "plugin.json").read_text())["version"] == "1.0.0"
    )


@pytest.mark.asyncio
@pytest.mark.parametrize("upgrade_required", [False, True])
@pytest.mark.parametrize("defer_update", [False, True])
async def test_replace_preserves_structured_dependency_confirmation(
    tmp_path,
    monkeypatch,
    update_environment,
    upgrade_required,
    defer_update,
):
    from qwenpaw.plugins.dependency_gate import (
        GateDecision,
        SharedDependencyError,
    )
    from qwenpaw.plugins.dependency_upgrade import dependency_upgrades

    loader, request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    await loader.load_plugin_from_path(installed, install_dir=plugins)
    candidate = _source(tmp_path / "candidate", "2.0.0")
    body = _archive(candidate, tmp_path / "candidate.zip").model_copy(
        update={"defer_if_needed": defer_update},
    )
    original = loader.lifecycle.prepare_backend
    preparations = []
    code = (
        "DEPENDENCY_RESTART_REQUIRED"
        if upgrade_required
        else "DEPENDENCY_PLAN_UNVERIFIED"
    )

    async def refuse_candidate(binding, **kwargs):
        preparations.append(binding.description.manifest.version)
        if binding.description.manifest.version == "2.0.0":
            raise SharedDependencyError(
                GateDecision(
                    False,
                    False,
                    reason="review dependencies",
                    reason_code=code,
                ),
            )
        return await original(binding, **kwargs)

    staged = []

    async def stage(source, *, force):
        retained = tmp_path / "retained-source"
        shutil.copytree(source, retained)
        staged.append((retained, force))
        return {
            "id": "a" * 32,
            "message": "confirm dependency upgrade",
            "require_restart": True,
        }

    monkeypatch.setattr(loader.lifecycle, "prepare_backend", refuse_candidate)
    monkeypatch.setattr(dependency_upgrades(loader), "stage", stage)
    with pytest.raises(HTTPException) as caught:
        await router.replace_installed_plugin(body, request)
    assert caught.value.status_code == 409
    detail = caught.value.detail
    assert detail["code"] == (
        "DEPENDENCY_UPGRADE_REQUIRED" if upgrade_required else code
    )
    if upgrade_required:
        assert detail["operation"]["id"] == "a" * 32
        assert staged[0][1] is True
        assert (staged[0][0] / "plugin.json").is_file()
    else:
        assert not staged
    assert preparations == ["2.0.0"]
    assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "1.0.0"
    assert loader.get_loaded_plugin(PLUGIN_ID).status == "active"
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "1.0.0"
    )


@pytest.mark.asyncio
async def test_concurrent_replacements_back_up_committed_predecessor(
    tmp_path,
    monkeypatch,
    update_environment,
):
    loader, request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    await loader.load_plugin_from_path(installed, install_dir=plugins)
    body2 = _archive(_source(tmp_path / "v2", "2.0.0"), tmp_path / "v2.zip")
    body3 = _archive(_source(tmp_path / "v3", "3.0.0"), tmp_path / "v3.zip")
    entered = asyncio.Event()
    release = asyncio.Event()
    original = loader.load_plugin_from_path

    async def hold_first(*args, **kwargs):
        version = json.loads(
            (Path(kwargs["source_path"]) / "plugin.json").read_text(),
        )["version"]
        if version == "2.0.0":
            entered.set()
            await release.wait()
        return await original(*args, **kwargs)

    monkeypatch.setattr(loader, "load_plugin_from_path", hold_first)
    first = asyncio.create_task(
        router.replace_installed_plugin(body2, request),
    )
    await asyncio.wait_for(entered.wait(), 30)
    second = asyncio.create_task(
        router.replace_installed_plugin(body3, request),
    )
    await asyncio.sleep(0.05)
    assert not second.done()
    release.set()
    first_result, second_result = await asyncio.gather(first, second)
    for result, predecessor in [
        (first_result, "1.0.0"),
        (second_result, "2.0.0"),
    ]:
        backup = Path(result["backup_path"])
        assert (
            json.loads((backup / "plugin.json").read_text())["version"]
            == predecessor
        )
    assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "3.0.0"
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "3.0.0"
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("has_record", "cleanup"),
    [
        (False, "commit_marker"),
        (True, "commit_marker"),
        (False, "channel_tombstone"),
        (True, "channel_tombstone"),
        (False, "uninstall_marker"),
    ],
)
async def test_replace_reports_post_commit_cleanup_restart(
    tmp_path,
    monkeypatch,
    update_environment,
    has_record,
    cleanup,
):
    from qwenpaw.config import Config
    from qwenpaw.plugins.updates import update_is_committed

    loader, request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    if has_record:
        await loader.load_plugin_from_path(installed, install_dir=plugins)
    else:
        config = Config(plugins={PLUGIN_ID: {"enabled": False}})
        monkeypatch.setattr("qwenpaw.config.load_config", lambda: config)
        await loader.load_all_plugins(configs=config.plugins)
        assert loader.get_loaded_plugin(PLUGIN_ID) is None
    candidate = _source(tmp_path / "candidate", "2.0.0")
    body = _archive(candidate, tmp_path / "candidate.zip")

    def pending_cleanup(*_args, **_kwargs):
        raise OSError("fixture marker cleanup failure")

    monkeypatch.setattr(
        {
            "commit_marker": "qwenpaw.plugins.updates.clear_updating_marker",
            "channel_tombstone": (
                "qwenpaw.plugins.settings.clear_channel_tombstone"
            ),
            "uninstall_marker": (
                "qwenpaw.plugins.bundled.clear_uninstalled_marker"
            ),
        }[cleanup],
        pending_cleanup,
    )
    result = await router.replace_installed_plugin(body, request)
    assert result["restart_required"] is True
    assert "fixture marker cleanup failure" in " ".join(result["diagnostics"])
    if cleanup == "commit_marker":
        assert update_is_committed(PLUGIN_ID)
    assert result["loaded"] is has_record and result["enabled"] is has_record
    assert result["version"] == "2.0.0"
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "2.0.0"
    )


@pytest.mark.asyncio
async def test_stale_concurrent_update_does_not_downgrade_newer_version(
    tmp_path,
    monkeypatch,
    update_environment,
):
    loader, request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    await loader.load_plugin_from_path(installed, install_dir=plugins)
    body2 = _archive(_source(tmp_path / "v2", "2.0.0"), tmp_path / "v2.zip")
    body3 = _archive(_source(tmp_path / "v3", "3.0.0"), tmp_path / "v3.zip")
    entered = asyncio.Event()
    release = asyncio.Event()
    original = loader.load_plugin_from_path
    versions = []

    async def hold_newer(*args, **kwargs):
        version = json.loads(
            (Path(kwargs["source_path"]) / "plugin.json").read_text(),
        )["version"]
        versions.append(version)
        if version == "3.0.0" and len(versions) == 1:
            entered.set()
            await release.wait()
        return await original(*args, **kwargs)

    monkeypatch.setattr(loader, "load_plugin_from_path", hold_newer)
    newer = asyncio.create_task(
        router.replace_installed_plugin(body3, request),
    )
    await asyncio.wait_for(entered.wait(), 30)
    stale = asyncio.create_task(
        router.replace_installed_plugin(body2, request),
    )
    await asyncio.sleep(0.05)
    release.set()
    success, rejected = await asyncio.gather(
        newer,
        stale,
        return_exceptions=True,
    )
    assert success["version"] == "3.0.0"
    assert isinstance(rejected, HTTPException) and rejected.status_code == 409
    assert rejected.detail == {
        "code": "plugin_update_stale",
        "message": "A newer plugin version is already installed.",
        "current_version": "3.0.0",
        "target_version": "2.0.0",
    }
    assert versions == ["3.0.0"]
    assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "3.0.0"
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "3.0.0"
    )
    # The update endpoint continues supporting same-version repair installs.
    repaired = await router.replace_installed_plugin(body3, request)
    assert repaired["version"] == "3.0.0"
    assert versions == ["3.0.0", "3.0.0"]


def _signed_downloads(
    tmp_path,
    monkeypatch,
    plugins,
    *,
    broken=False,
    extra=False,
    delta=False,
    runtime=False,
):
    import base64
    import httpx
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric.ed25519 import (
        Ed25519PrivateKey,
    )
    from qwenpaw.components.client import ComponentClient
    from qwenpaw.components.service import ComponentUpdateService
    from qwenpaw.components.update import ComponentUpdater
    from qwenpaw.components import service as component_service

    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    candidate = _source(tmp_path / "signed-candidate", "2.0.0", broken=broken)
    archive = tmp_path / "signed.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        for path in candidate.rglob("*"):
            if path.is_file():
                bundle.write(path, path.relative_to(candidate).as_posix())
    raw_archive = archive.read_bytes()
    files = {
        path.relative_to(candidate).as_posix(): {
            "size": path.stat().st_size,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        }
        for path in candidate.rglob("*")
        if path.is_file()
    }
    entry = {
        "version": "2.0.0",
        "files": files,
        "preserve": ["data"],
        "full": {
            "url": "https://oss.example/signed.zip",
            "sha256": hashlib.sha256(raw_archive).hexdigest(),
            "size": len(raw_archive),
            "signature": base64.b64encode(private.sign(raw_archive)).decode(),
        },
    }
    if delta:
        entry["deltas"] = [
            {
                **entry["full"],
                "from": "1.0.0",
                "url": "https://oss.example/delta.zip",
            },
        ]
    manifest = {
        "schema_version": 1,
        "target": "windows-x86_64",
        "core_min_version": "1.0.0",
        "components": {PLUGIN_ID: entry},
    }
    if extra:
        manifest["components"]["new-uninstalled-app"] = {
            **entry,
            "version": "1.0.0",
        }
    if runtime:
        manifest["components"]["python-packages"] = dict(entry)
    raw_manifest = json.dumps(manifest).encode()
    calls = []
    online = [True]

    def handler(request):
        calls.append(request.url.path)
        if not online[0]:
            raise httpx.ConnectError("offline", request=request)
        if request.url.path == "/manifest.json":
            return httpx.Response(200, content=raw_manifest)
        if request.url.path == "/manifest.json.sig":
            return httpx.Response(
                200,
                content=base64.b64encode(private.sign(raw_manifest)),
            )
        return httpx.Response(200, content=raw_archive)

    work = tmp_path / "work"
    monkeypatch.setattr(component_service, "WORKING_DIR", work)
    monkeypatch.setattr(component_service, "get_plugins_dir", lambda: plugins)
    monkeypatch.setattr(
        component_service,
        "_PENDING_UPDATES_PATH",
        work / "components" / "pending.json",
    )
    monkeypatch.setattr(
        component_service,
        "_COMPONENT_INSTALL_LOCKS",
        work / "components" / "locks",
    )
    monkeypatch.setattr(
        component_service,
        "_ADOPTED_COMPONENTS_PATH",
        work / "components" / "adopted.json",
    )
    runtime_source = tmp_path / "runtime-base"
    if runtime:
        runtime_source.mkdir()
        (runtime_source / "old.txt").write_text("old runtime")
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components=(
            {PLUGIN_ID, "python-packages"} if runtime else {PLUGIN_ID}
        ),
        directory_components={"python-packages"} if runtime else set(),
        bundled_directory_records=(
            {"python-packages": ("1.0.0", runtime_source)} if runtime else {}
        ),
        target="windows-x86_64",
        core_version="1.0.0",
        backup_root=work / "components" / "backups",
    )
    client = ComponentClient(
        updater,
        work / "components" / "cache",
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )
    service = ComponentUpdateService(
        updater,
        client,
        "https://oss.example/manifest.json",
    )
    return service, calls, online


@pytest.mark.asyncio
@pytest.mark.parametrize("enabled", [True, False])
async def test_signed_plugin_hot_update_preserves_data_and_enable_intent(
    tmp_path,
    monkeypatch,
    update_environment,
    enabled,
):
    from qwenpaw.components.runtime_updates import update_component
    from qwenpaw.config import Config
    from qwenpaw.components import service as component_service

    loader, _request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    (installed / "data").mkdir()
    (installed / "data" / "user.json").write_text('{"saved": true}')
    monkeypatch.setattr(
        "qwenpaw.config.load_config",
        lambda: Config(plugins={PLUGIN_ID: {"enabled": enabled}}),
    )
    await loader.load_plugin_from_path(
        installed,
        install_dir=plugins,
        config={"enabled": enabled},
    )
    service, _calls, _online = _signed_downloads(
        tmp_path,
        monkeypatch,
        plugins,
    )
    result = await update_component(PLUGIN_ID, loader, service=service)
    assert result["updated"] is True and result["queued"] is False
    assert result["loaded"] is enabled
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "2.0.0"
    )
    if enabled:
        assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "2.0.0"
        assert loader.get_loaded_plugin(PLUGIN_ID).enabled is True
    else:
        assert loader.get_loaded_plugin(PLUGIN_ID) is None
    assert (installed / "data" / "user.json").read_text() == '{"saved": true}'
    assert component_service._pending_snapshot() == {}
    service.client.close()


@pytest.mark.asyncio
@pytest.mark.parametrize("delta", [False, True])
async def test_signed_restart_update_downloads_then_activates_offline(
    tmp_path,
    monkeypatch,
    update_environment,
    delta,
):
    from qwenpaw.components.runtime_updates import update_component
    from qwenpaw.components import service as component_service
    from qwenpaw.plugins.errors import SDKRestartRequiredError
    from qwenpaw.plugins.lifecycle import UnloadMode

    loader, _request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    await loader.load_plugin_from_path(installed, install_dir=plugins)
    service, calls, online = _signed_downloads(
        tmp_path,
        monkeypatch,
        plugins,
        delta=delta,
    )
    original = loader.load_plugin_from_path

    async def require_restart(*_args, **_kwargs):
        raise SDKRestartRequiredError("fresh process required")

    monkeypatch.setattr(loader, "load_plugin_from_path", require_restart)
    result = await update_component(PLUGIN_ID, loader, service=service)
    assert (
        result["queued"]
        and result["downloaded"]
        and result["restart_required"]
    )
    assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "1.0.0"
    pending = component_service._pending_snapshot()
    assert pending[PLUGIN_ID]["manifest_cache"]
    payload = json.loads(component_service._PENDING_UPDATES_PATH.read_text())
    payload["components"][PLUGIN_ID]["queued_at"] = "2000-01-01T00:00:00+00:00"
    component_service._PENDING_UPDATES_PATH.write_text(
        json.dumps(payload),
        encoding="utf-8",
    )
    assert PLUGIN_ID in component_service._pending_snapshot()
    service.client._prune_cache(protected=set())
    monkeypatch.setattr(loader, "load_plugin_from_path", original)
    await loader.lifecycle.unload_all(UnloadMode.SHUTDOWN)
    online[0] = False
    calls.clear()
    monkeypatch.setattr(
        component_service,
        "configured_service",
        lambda: service,
    )
    result = component_service.run_startup_updates()
    assert result["errors"] == []
    assert result["updated"][0]["version"] == "2.0.0"
    assert calls == []
    assert component_service._pending_snapshot() == {}
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "2.0.0"
    )


@pytest.mark.asyncio
async def test_failed_signed_hot_update_keeps_old_runtime_and_data(
    tmp_path,
    monkeypatch,
    update_environment,
):
    from qwenpaw.components.runtime_updates import update_component
    from qwenpaw.components import service as component_service

    loader, _request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    (installed / "data").mkdir()
    (installed / "data" / "saved.txt").write_text("keep")
    await loader.load_plugin_from_path(installed, install_dir=plugins)
    service, _calls, _online = _signed_downloads(
        tmp_path,
        monkeypatch,
        plugins,
        broken=True,
    )
    with pytest.raises(RuntimeError, match="candidate broken"):
        await update_component(PLUGIN_ID, loader, service=service)
    assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "1.0.0"
    assert (installed / "data" / "saved.txt").read_text() == "keep"
    assert component_service._pending_snapshot() == {}
    service.client.close()


@pytest.mark.asyncio
async def test_automatic_updates_only_touch_installed_plugins(
    tmp_path,
    monkeypatch,
    update_environment,
):
    from qwenpaw.plugins.automatic_updates import AutomaticPluginUpdates
    from qwenpaw.components import service as component_service

    loader, request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    await loader.load_plugin_from_path(installed, install_dir=plugins)
    service, _calls, _online = _signed_downloads(
        tmp_path,
        monkeypatch,
        plugins,
        extra=True,
    )
    monkeypatch.setattr(
        component_service,
        "configured_service",
        lambda: service,
    )

    async def catalog():
        return {"plugins": []}

    monkeypatch.setattr(
        "qwenpaw.plugins.download_catalog.fetch_plugin_catalog_async",
        catalog,
    )
    updater = AutomaticPluginUpdates(request.app)
    await updater.check_once()
    assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "2.0.0"
    assert not (plugins / "new-uninstalled-app").exists()
    assert "new-uninstalled-app" not in component_service._pending_snapshot()


@pytest.mark.asyncio
@pytest.mark.parametrize("broken", [False, True])
async def test_downloaded_ordinary_update_activates_offline_after_restart(
    tmp_path,
    monkeypatch,
    update_environment,
    broken,
):
    from qwenpaw.plugins import downloaded_updates
    from qwenpaw.plugins.errors import SDKRestartRequiredError
    from qwenpaw.plugins.lifecycle import UnloadMode

    loader, request, plugins = update_environment
    monkeypatch.setattr(
        downloaded_updates,
        "_ROOT",
        tmp_path / "work" / "plugin_updates" / "downloaded",
    )
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    (installed / "data").mkdir()
    (installed / "data" / "saved.txt").write_text("keep")
    await loader.load_plugin_from_path(installed, install_dir=plugins)
    body = _archive(
        _source(tmp_path / "v2", "2.0.0", broken=broken),
        tmp_path / "v2.zip",
    ).model_copy(update={"defer_if_needed": True})
    original = loader.load_plugin_from_path

    async def require_restart(*_args, **_kwargs):
        raise SDKRestartRequiredError("fresh process required")

    monkeypatch.setattr(loader, "load_plugin_from_path", require_restart)
    result = await router.replace_installed_plugin(body, request)
    assert result["queued"] and result["downloaded"]
    assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "1.0.0"
    assert downloaded_updates.cached_archive(body).is_file()
    downloaded_updates.cached_archive(body).unlink()
    from qwenpaw.plugins.automatic_updates import AutomaticPluginUpdates

    await AutomaticPluginUpdates(request.app)._replace(
        {"id": PLUGIN_ID, "version": "1.0.0"},
        body.source,
        body.version,
        body.sha256,
    )
    assert downloaded_updates.cached_archive(body).is_file()
    monkeypatch.setattr(loader, "load_plugin_from_path", original)
    await loader.lifecycle.unload_all(UnloadMode.SHUTDOWN)

    async def offline(*_args):
        raise AssertionError(
            "Restart activation must use the downloaded archive",
        )

    monkeypatch.setattr(router, "_async_download", offline)
    updater, prepared = await asyncio.to_thread(
        downloaded_updates.prepare_downloaded_plugins,
    )
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "2.0.0"
    )
    loader = PluginLoader([plugins])
    await loader.load_all_plugins()
    await loader.activate_all_loaded()
    await downloaded_updates.reconcile_downloaded_plugins(
        loader,
        updater,
        prepared,
        {},
    )
    assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == (
        "1.0.0" if broken else "2.0.0"
    )
    assert (installed / "data" / "saved.txt").read_text() == "keep"
    if broken:
        assert downloaded_updates._records()[PLUGIN_ID]["version"] == "2.0.0"
        assert downloaded_updates.cached_archive(body).is_file()
    else:
        assert downloaded_updates._records() == {}


@pytest.mark.asyncio
async def test_background_update_loop_retries_and_drains_on_shutdown(
    monkeypatch,
):
    from qwenpaw.plugins import automatic_updates

    monkeypatch.setattr(automatic_updates, "INITIAL_DELAY_SECONDS", 0)
    monkeypatch.setattr(automatic_updates, "RETRY_INTERVAL_SECONDS", 0)
    updater = automatic_updates.AutomaticPluginUpdates(SimpleNamespace())
    completed = asyncio.Event()
    calls = []

    async def check_once():
        calls.append("check")
        if len(calls) == 1:
            raise OSError("offline")
        completed.set()

    monkeypatch.setattr(updater, "check_once", check_once)
    updater.start()
    await asyncio.wait_for(completed.wait(), 2)
    await updater.aclose()
    assert calls == ["check", "check"]
    assert updater._task.done()


@pytest.mark.asyncio
async def test_automatic_hot_update_keeps_market_provenance(
    tmp_path,
    monkeypatch,
    update_environment,
):
    from qwenpaw.plugins.automatic_updates import _market_matches

    loader, request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    await loader.load_plugin_from_path(installed, install_dir=plugins)
    archive = tmp_path / "market.zip"
    body = _archive(_source(tmp_path / "v2", "2.0.0"), archive).model_copy(
        update={
            "source": (
                "https://platform.agentscope.io/plugins/owner/fixture/"
                "archive/zip/master"
            ),
            "defer_if_needed": True,
        },
    )

    async def download(_source, destination):
        shutil.copyfile(archive, destination)

    monkeypatch.setattr(router, "_async_download", download)
    await router.replace_installed_plugin(body, request)
    assert router._read_market_id(installed) == "@owner/fixture"
    plugin = next(
        row
        for row in router._list_plugins_from_disk()
        if row["id"] == PLUGIN_ID
    )
    assert _market_matches(
        plugin,
        {"id": "@owner/fixture", "developer": "Friendly Team"},
    )


def test_downloaded_update_ack_preserves_newer_queue_generation(
    tmp_path,
    monkeypatch,
):
    from qwenpaw.plugins import downloaded_updates

    monkeypatch.setattr(
        downloaded_updates,
        "_ROOT",
        tmp_path / "work" / "plugin_updates" / "downloaded",
    )
    archive = tmp_path / "v2.zip"
    body = _archive(_source(tmp_path / "v2", "2.0.0"), archive)
    downloaded_updates.queue_downloaded_plugin(body, archive)
    first = downloaded_updates._records()[PLUGIN_ID]
    downloaded_updates.queue_downloaded_plugin(body, archive)
    second = downloaded_updates._records()[PLUGIN_ID]
    assert first["operation_id"] != second["operation_id"]
    downloaded_updates.acknowledge_downloaded_plugin(
        PLUGIN_ID,
        "2.0.0",
        first["operation_id"],
    )
    assert (
        downloaded_updates._records()[PLUGIN_ID]["operation_id"]
        == second["operation_id"]
    )
    assert downloaded_updates.cached_archive(body).is_file()
    downloaded_updates.acknowledge_downloaded_plugin(
        PLUGIN_ID,
        "2.0.0",
        second["operation_id"],
    )
    assert downloaded_updates._records() == {}


@pytest.mark.asyncio
@pytest.mark.parametrize("signed", [False, True])
@pytest.mark.parametrize("files_only", [False, True])
async def test_background_shared_dependencies_wait_for_existing_confirmation(
    tmp_path,
    monkeypatch,
    update_environment,
    signed,
    files_only,
):
    from qwenpaw.components.runtime_updates import update_component
    from qwenpaw.components import service as component_service
    from qwenpaw.plugins import downloaded_updates
    from qwenpaw.plugins.dependency_gate import (
        GateDecision,
        SharedDependencyError,
    )
    from qwenpaw.plugins.dependency_upgrade import (
        dependency_upgrades,
        DependencyUpgradeRequired,
    )

    loader, request, plugins = update_environment
    monkeypatch.setattr(
        downloaded_updates,
        "_ROOT",
        tmp_path / "work" / "plugin_updates" / "downloaded",
    )
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    await loader.load_plugin_from_path(installed, install_dir=plugins)
    data = installed / "data" / "user.json"
    data.parent.mkdir()
    data.write_text("before review", encoding="utf-8")
    original = loader.lifecycle.prepare_backend
    operation = {
        "id": "a" * 32,
        "plugin_id": PLUGIN_ID,
        "status": "needs_confirmation",
        "message": "review shared dependencies",
        "force": True,
        "requires_restart": True,
        "changes": [],
        "affected_instances": [],
    }
    staged = []

    async def refuse(binding, **kwargs):
        if binding.description.manifest.version == "2.0.0":
            raise SharedDependencyError(
                GateDecision(
                    False,
                    False,
                    reason="review shared dependencies",
                    reason_code="DEPENDENCY_RESTART_REQUIRED",
                ),
            )
        return await original(binding, **kwargs)

    async def stage(source, *, force):
        assert force
        assert (
            json.loads((source / "plugin.json").read_text())["version"]
            == "2.0.0"
        )
        retained = tmp_path / "reviewed-source"
        shutil.copytree(source, retained)
        staged.append(retained)
        return operation

    manager = dependency_upgrades(loader)
    monkeypatch.setattr(loader.lifecycle, "prepare_backend", refuse)
    monkeypatch.setattr(manager, "stage", stage)
    monkeypatch.setattr(manager, "status", lambda operation_id: operation)
    if signed:
        service, _calls, _online = _signed_downloads(
            tmp_path,
            monkeypatch,
            plugins,
        )
        result = await update_component(
            PLUGIN_ID,
            loader,
            service=service,
            background=True,
        )
        assert (
            component_service._pending_snapshot()[PLUGIN_ID]["confirmation"]
            == "dependencies"
        )
        assert component_service.run_startup_updates() == {
            "enabled": False,
            "updated": [],
            "errors": [],
        }
        with pytest.raises(DependencyUpgradeRequired) as caught:
            await update_component(PLUGIN_ID, loader, service=service)
        assert caught.value.operation["id"] == operation["id"]
        service.client.close()
    else:
        body = _archive(
            _source(tmp_path / "candidate", "2.0.0"),
            tmp_path / "candidate.zip",
        ).model_copy(update={"defer_if_needed": True, "background": True})
        result = await router.replace_installed_plugin(body, request)
        record = downloaded_updates._records()[PLUGIN_ID]
        assert record["confirmation"] == "dependencies"
        assert downloaded_updates.cached_archive(body).is_file()
        _updater, prepared = downloaded_updates.prepare_downloaded_plugins()
        assert prepared == {}
        with pytest.raises(HTTPException) as caught:
            await router.replace_installed_plugin(
                body.model_copy(update={"background": False}),
                request,
            )
        assert caught.value.detail["code"] == "DEPENDENCY_UPGRADE_REQUIRED"
        assert caught.value.detail["operation"]["id"] == operation["id"]
    assert result["requires_confirmation"] and not result["restart_required"]
    assert len(staged) == 1
    assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "1.0.0"
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "1.0.0"
    )
    assert (
        downloaded_updates.pending_update_summaries()[PLUGIN_ID][
            "confirmation"
        ]
        == "dependencies"
    )

    listed = next(
        row
        for row in router._list_plugins_from_disk()
        if row["id"] == PLUGIN_ID
    )
    assert listed["pending_update"]["confirmation"] == "dependencies"
    assert listed["pending_update"]["version"] == "2.0.0"
    # Approval can happen much later, after user data has changed.
    data.write_text("latest after review", encoding="utf-8")
    monkeypatch.setattr(loader.lifecycle, "prepare_backend", original)
    frozen = {
        path.relative_to(staged[0]): path.read_bytes()
        for path in staged[0].rglob("*")
        if path.is_file()
    }
    if files_only:
        await loader.unload_plugin(PLUGIN_ID)
    record = await downloaded_updates.install_confirmed_update(
        loader,
        staged[0],
        operation,
        files_only=files_only,
    )
    assert record.manifest.version == "2.0.0"
    assert data.read_text(encoding="utf-8") == "latest after review"
    assert frozen == {
        path.relative_to(staged[0]): path.read_bytes()
        for path in staged[0].rglob("*")
        if path.is_file()
    }
    if signed:
        component_service.run_startup_updates()
        assert component_service._pending_snapshot() == {}
    else:
        downloaded_updates.prepare_downloaded_plugins()
        assert downloaded_updates._records() == {}


@pytest.mark.asyncio
async def test_signed_plugin_hot_update_ignores_unrelated_runtime_updates(
    tmp_path,
    monkeypatch,
    update_environment,
):
    from qwenpaw.components.runtime_updates import update_component
    from qwenpaw.components import service as component_service

    loader, _request, plugins = update_environment
    installed = _source(plugins / PLUGIN_ID, "1.0.0")
    await loader.load_plugin_from_path(installed, install_dir=plugins)
    service, _calls, _online = _signed_downloads(
        tmp_path,
        monkeypatch,
        plugins,
        runtime=True,
    )
    result = await update_component(
        PLUGIN_ID,
        loader,
        service=service,
        background=True,
    )
    assert result["updated"] and not result["queued"]
    assert loader.get_loaded_plugin(PLUGIN_ID).manifest.version == "2.0.0"
    assert component_service._pending_snapshot() == {}
    assert (tmp_path / "runtime-base" / "old.txt").read_text() == "old runtime"
    assert not list(
        service.client.cache_root.rglob("python-packages-*-full.zip"),
    )
    service.client.close()
