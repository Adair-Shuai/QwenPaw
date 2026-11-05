# -*- coding: utf-8 -*-
# pylint: disable=protected-access,redefined-outer-name
"""Real replacement transactions keep version and enable intent isolated."""

import asyncio
import hashlib
import json
import shutil
import zipfile
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from qwenpaw.app.routers import plugins as router
from qwenpaw.plugins.architecture import PluginManifest
from qwenpaw.plugins.loader import PluginLoader


PLUGIN_ID = "transaction-update-fixture"


def _source(root, version, *, kind="general", broken=False, maximum="3.0.0"):
    root.mkdir(parents=True)
    manifest = {
        "id": PLUGIN_ID,
        "name": PLUGIN_ID,
        "version": version,
        "type": kind,
        "qwenpaw_version": {"min": "2.0.0", "max": maximum},
        "entry": {"backend": "main.py"},
    }
    (root / "plugin.json").write_text(json.dumps(manifest), encoding="utf-8")
    (root / "main.py").write_text(
        "class Plugin:\n    def register(self, api):\n"
        "        raise RuntimeError('candidate broken')\nplugin = Plugin()\n"
        if broken
        else "class Plugin:\n    def register(self, api):\n        pass\n"
        "plugin = Plugin()\n",
        encoding="utf-8",
    )
    return root


def _archive(source, archive):
    with zipfile.ZipFile(archive, "w") as bundle:
        for path in source.rglob("*"):
            if path.is_file():
                bundle.write(
                    path,
                    f"{PLUGIN_ID}/{path.relative_to(source).as_posix()}",
                )
    return router.ReplacePluginRequest(
        source=f"https://download.qwenpaw.agentscope.io/{archive.name}",
        plugin_id=PLUGIN_ID,
        version=json.loads((source / "plugin.json").read_text())["version"],
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
async def test_replace_preserves_structured_dependency_confirmation(
    tmp_path,
    monkeypatch,
    update_environment,
    upgrade_required,
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
    body = _archive(candidate, tmp_path / "candidate.zip")
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
