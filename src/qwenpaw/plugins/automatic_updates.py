# -*- coding: utf-8 -*-
"""Background updates for installed plugins and applications."""

# Reuse the internal update kernel and its transaction boundaries.
# pylint: disable=protected-access

from __future__ import annotations

import asyncio
import logging
from types import SimpleNamespace
from urllib.parse import quote

from packaging.version import InvalidVersion, Version

from ..constant import WORKING_DIR
from ..components import service as components
from ..components.runtime_updates import update_component
from .downloaded_updates import (
    _records,
    cached_archive,
    acknowledge_downloaded_plugin,
)
from .install_lock import InstallLockError, plugin_install_lock

logger = logging.getLogger(__name__)
CHECK_INTERVAL_SECONDS = 3600
RETRY_INTERVAL_SECONDS = 300
INITIAL_DELAY_SECONDS = 30


def _newer(candidate, current):
    try:
        return Version(candidate) > Version(current)
    except (InvalidVersion, TypeError):
        return False


def _market_matches(plugin, entry):
    def normalize(value):
        return str(value or "").strip().removeprefix("@").lower()

    market_id = normalize(entry.get("id"))
    recorded_id = normalize(plugin.get("market_id"))
    if recorded_id:
        return recorded_id == market_id
    plugin_id = normalize(plugin["id"])
    if plugin_id == market_id:
        return True
    author = normalize(plugin.get("author"))
    return (
        plugin_id == market_id.rsplit("/", 1)[-1]
        and bool(author)
        and author
        in {normalize(entry.get("owner")), normalize(entry.get("developer"))}
    )


class AutomaticPluginUpdates:
    """One serial updater per backend, drained before runtime shutdown."""

    def __init__(self, app):
        self.app = app
        self._stop = asyncio.Event()
        self._task = None

    def start(self):
        self._task = asyncio.create_task(
            self._run(),
            name="plugin-auto-updates",
        )

    async def aclose(self):
        self._stop.set()
        if self._task is not None:
            await self._task

    async def _run(self):
        delay = INITIAL_DELAY_SECONDS
        while not self._stop.is_set():
            try:
                await asyncio.wait_for(self._stop.wait(), timeout=delay)
                return
            except asyncio.TimeoutError:
                pass
            try:
                await self.check_once()
                delay = CHECK_INTERVAL_SECONDS
            except Exception:
                logger.warning(
                    "Background plugin updates will retry",
                    exc_info=True,
                )
                delay = RETRY_INTERVAL_SECONDS

    async def check_once(self):
        try:
            with plugin_install_lock(
                WORKING_DIR / "plugin_updates" / ".automatic.lock",
                timeout=0,
            ):
                await self._check_installed()
        except InstallLockError:
            logger.debug(
                "Another backend is checking installed plugin updates",
            )

    async def _check_installed(self):
        from ..app.routers.plugins import _list_plugins_from_disk

        installed = {
            row["id"]: row
            for row in await asyncio.to_thread(_list_plugins_from_disk)
        }
        if not installed:
            return
        managed, signed_checked = await self._update_signed(installed)
        if self._stop.is_set():
            return
        await self._update_catalog(installed, managed, signed_checked)
        if self._stop.is_set():
            return
        await self._update_market(installed, managed)

    async def _update_signed(self, installed):
        service = await asyncio.to_thread(components.configured_service)
        if service is None:
            return set(), False
        try:
            snapshot = await asyncio.to_thread(service.snapshot)
            pending = await asyncio.to_thread(components._pending_snapshot)
            for plan in snapshot[1]:
                plugin_id = plan["component"]
                if self._stop.is_set():
                    break
                if (
                    plugin_id not in installed
                    or plugin_id in components.DIRECTORY_COMPONENT_IDS
                ):
                    continue
                if not _newer(
                    plan["target_version"],
                    installed[plugin_id]["version"],
                ):
                    continue
                if (
                    pending.get(plugin_id, {}).get("target_version")
                    == plan["target_version"]
                ):
                    continue
                try:
                    await update_component(
                        plugin_id,
                        self.app.state.plugin_loader,
                        service=service,
                        snapshot=snapshot,
                        background=True,
                    )
                except Exception:
                    logger.warning(
                        "Signed background update failed for %s",
                        plugin_id,
                        exc_info=True,
                    )
            return (
                set(service.updater.managed_components)
                & set(snapshot[0]["components"]),
                True,
            )
        except Exception:
            logger.warning(
                "Signed background update discovery failed",
                exc_info=True,
            )
            return set(service.updater.managed_components), False
        finally:
            await asyncio.to_thread(service.client.close)

    async def _replace(self, plugin, source, version, digest=None):
        from ..app.routers.plugins import (
            ReplacePluginRequest,
            replace_installed_plugin,
        )

        queued = (await asyncio.to_thread(_records)).get(plugin["id"], {})
        if queued and not _newer(version, queued["version"]):
            pending = ReplacePluginRequest(**queued)
            if await asyncio.to_thread(cached_archive, pending) is not None:
                return
            await asyncio.to_thread(
                acknowledge_downloaded_plugin,
                plugin["id"],
                queued["version"],
                queued.get("operation_id"),
            )
        body = ReplacePluginRequest(
            plugin_id=plugin["id"],
            source=source,
            version=version,
            sha256=digest or None,
            defer_if_needed=True,
            background=True,
        )
        try:
            await replace_installed_plugin(body, SimpleNamespace(app=self.app))
        except Exception:
            logger.warning(
                "Background plugin update failed for %s",
                plugin["id"],
                exc_info=True,
            )

    async def _update_catalog(self, installed, managed, signed_checked):
        from .download_catalog import fetch_plugin_catalog_async

        catalog = await fetch_plugin_catalog_async()
        for entry in catalog.get("plugins", []):
            if self._stop.is_set():
                return
            plugin_id = entry.get("plugin_id")
            plugin = installed.get(plugin_id)
            if plugin is None or plugin_id in managed:
                continue
            if entry.get("channel") == "ugsci" and not signed_checked:
                continue
            source = entry.get("install_url", "")
            if not source.startswith("https://") or not _newer(
                entry.get("version"),
                plugin["version"],
            ):
                continue
            await self._replace(
                plugin,
                source,
                entry["version"],
                entry.get("sha256"),
            )

    async def _update_market(self, installed, managed):
        from ..app.routers.plugins import search_market_plugins

        candidates = {
            key: value
            for key, value in installed.items()
            if key not in managed
        }
        if not candidates:
            return
        seen = set()
        for page in range(1, 21):
            if self._stop.is_set():
                return
            payload = await search_market_plugins(
                page_number=page,
                page_size=100,
                sort_by="updated_time",
            )
            data = payload.get("data", {})
            entries = data.get("plugins", [])
            fresh = [entry for entry in entries if entry.get("id") not in seen]
            if not fresh:
                return
            for entry in fresh:
                seen.add(entry.get("id"))
                plugin = next(
                    (
                        item
                        for item in candidates.values()
                        if _market_matches(item, entry)
                    ),
                    None,
                )
                if plugin is None or not _newer(
                    entry.get("version"),
                    plugin["version"],
                ):
                    continue
                parts = str(entry["id"]).removeprefix("@").split("/")
                if len(parts) != 2 or not all(parts):
                    continue
                source = (
                    "https://platform.agentscope.io/plugins/"
                    f"{quote(parts[0], safe='')}/{quote(parts[1], safe='')}"
                    "/archive/zip/master"
                )
                await self._replace(plugin, source, entry["version"])
                candidates.pop(plugin["id"], None)
            if not candidates or len(seen) >= data.get("total", len(seen)):
                return
