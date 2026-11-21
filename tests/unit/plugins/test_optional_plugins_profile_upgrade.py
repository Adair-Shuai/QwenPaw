# -*- coding: utf-8 -*-
"""Offline upgrade of a profile using both optional plugins."""

import json
import os
import shutil
import sys

import pytest

from qwenpaw.app.mcp_plugin_upgrade import (
    prepare_startup_plugins,
    read_startup_migration,
)
from qwenpaw.config.utils import load_config, mutate_config
from qwenpaw.drivers.adapters.mcp_card_builder import (
    build_mcp_credential_record,
    build_mcp_driver_card,
)
from qwenpaw.drivers.credentials.store import AsyncCredentialStore
from qwenpaw.drivers.storage import dump_card, load_card
from qwenpaw.plugins import local_whisper, python_backend
from qwenpaw.plugins.testing import PluginTestHost
from qwenpaw.tauri import optional_components


async def _start_mcp(loader):
    await prepare_startup_plugins(
        loader,
        loader.registry.get_workspace_manager(),
        startup=read_startup_migration(
            plugins_dir=loader.plugin_dirs[0],
        ),
    )


@pytest.mark.parametrize("mcp_first", [True, False])
async def test_offline_upgrade_restarts_with_both_plugins(
    tmp_path,
    monkeypatch,
    whisper_dependency_inventory,
    mcp_first,
):
    # Exercise the desktop runtime and SDK host against the same disk profile.
    # pylint: disable=protected-access
    root = tmp_path / "profile"
    components = tmp_path / "components"
    bucket = optional_components._runtime_bucket()
    component = components / bucket / "whisper"
    site = component / "site"
    shutil.copytree(whisper_dependency_inventory, site)
    (component / "status.json").write_text(
        json.dumps(
            {
                "component": "whisper",
                "revision": 1,
                "runtime": bucket,
            },
        ),
        encoding="utf-8",
    )
    executable = (
        component / "bin" / ("ffmpeg.exe" if os.name == "nt" else "ffmpeg")
    )
    executable.parent.mkdir()
    executable.touch(mode=0o755)
    monkeypatch.setattr(sys, "path", sys.path.copy())
    monkeypatch.setenv("PATH", "")
    monkeypatch.setenv("PIP_NO_INDEX", "1")
    monkeypatch.setenv("QWENPAW_OPTIONAL_COMPONENTS_DIR", str(components))
    optional_components.activate_installed_components(("whisper",))
    monkeypatch.setattr(
        python_backend,
        "_host_paths",
        lambda _: tuple(sys.path),
    )

    async with PluginTestHost(root) as old:
        directory = (await old._workspace("existing")).workspace_dir
        mutate_config(
            lambda cfg: setattr(
                cfg.agents,
                "transcription_provider_type",
                "local_whisper",
            ),
        )
        old_client = {
            "name": "research",
            "enabled": True,
            "transport": "streamable_http",
            "url": "https://research.example/tools?apikey=existing-token",
        }
        record = build_mcp_credential_record("research", old_client)
        card = directory / "drivers/mcp/research.yaml"
        dump_card(
            build_mcp_driver_card(
                "research",
                old_client,
                record.ref,
                credential_record=record,
            ),
            card,
        )
        secrets = directory / "credentials.yaml"
        await AsyncCredentialStore(secrets).put(record)
        before = card.read_bytes(), secrets.read_bytes()

    for _ in range(2):
        async with PluginTestHost(root) as host:
            loader = host._loader
            service = local_whisper.LocalWhisperInstallService(
                loader,
                root / "plugin_runtime/migrations/local-whisper.json",
            )

            try:
                if mcp_first:
                    await _start_mcp(loader)
                await service.start()
                if service.task is not None:
                    await service.task
                if not mcp_first:
                    await _start_mcp(loader)
                await loader.load_all_plugins(configs=load_config().plugins)
                await loader.activate_all_loaded()
                assert not service.error
                assert (await local_whisper.get_runtime_status())["available"]
                assert (
                    load_config().agents.transcription_provider_type
                    == "local_whisper"
                )
                assert (
                    loader.get_loaded_plugin("qwenpaw-mcp").status == "active"
                )
                assert load_card(card).enabled
                assert before == (card.read_bytes(), secrets.read_bytes())
                assert (
                    await AsyncCredentialStore(secrets).get(record.ref)
                ).secrets == record.secrets
            finally:
                await service.close()
