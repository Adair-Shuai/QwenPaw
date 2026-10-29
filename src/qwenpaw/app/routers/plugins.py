# -*- coding: utf-8 -*-
# pylint:disable=too-many-branches
"""Plugin API routes: list plugins with UI metadata and serve plugin
static files.  Also provides runtime install / uninstall endpoints."""

import asyncio
import hashlib
from urllib.parse import urlsplit
import http.client
import json
import logging
import mimetypes
import os
import re
import shutil
import stat
import ssl
import tempfile
import urllib.error
import urllib.request
import uuid
import zipfile
from pathlib import Path
from types import SimpleNamespace
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel

from ..utils import schedule_agent_reload
from ...plugins.runtime import invoke_plugin_callback
from ...distribution import (
    EXTERNAL_PLUGIN_UPGRADE_HOSTS,
    upgrade_source_requires_digest,
)
from ...utils.windows_paths import copy_tree, extract_zip, io_path, remove_tree

from ...market.registry import MarketProviderBusyError
from ...plugins.activity import PluginBusyError
from ...plugins.registry import MemoryBackendInUseError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/plugins", tags=["plugins"])

# Upstream catalogs plus the UGSci-download OSS host (fork endpoint set).
_EXTERNAL_PLUGIN_UPGRADE_HOSTS = EXTERNAL_PLUGIN_UPGRADE_HOSTS
_PLUGIN_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
_PLUGIN_UPGRADE_MAX_ARCHIVE_BYTES = 256 * 1024 * 1024
_PLUGIN_UPGRADE_MAX_EXTRACTED_BYTES = 512 * 1024 * 1024
_PLUGIN_UPGRADE_MAX_MEMBERS = 20_000


def _interrupt_options(interrupt_tasks: bool) -> dict[str, Any]:
    """Keep existing callers unchanged unless interruption is explicit."""
    return {"interrupt_tasks": True} if interrupt_tasks else {}


def _log_safe(value: object) -> str:
    """Strip CR/LF so request-derived values cannot forge log entries."""
    return str(value).replace("\r", "").replace("\n", "")


class UnquiescentUnloadError(RuntimeError):
    """Unload / uninstall could not finish runtime or disk cleanup."""

    def __init__(self, plugin_id: str, report, *, loaded: bool) -> None:
        self.plugin_id = plugin_id
        self.report = report
        self.loaded = loaded
        super().__init__(
            unload_http_detail(plugin_id, report, loaded=loaded)["message"],
        )


def unload_http_detail(
    plugin_id: str,
    report,
    *,
    loaded: bool,
    kind: str = "Plugin",
    message: str | None = None,
) -> dict:
    """Structured 409 body shared by unload and DELETE uninstall."""
    return {
        "id": plugin_id,
        "loaded": loaded,
        "clean": bool(getattr(report, "clean", False)),
        "quiescent": bool(getattr(report, "quiescent", False)),
        "needs_restart": bool(getattr(report, "needs_restart", True)),
        "errors": list(getattr(report, "errors", None) or []),
        "message": message
        or (
            f"{kind} '{plugin_id}' cleanup is incomplete."
            if not getattr(report, "clean", False)
            and getattr(report, "quiescent", False)
            else f"{kind} '{plugin_id}' did not go quiescent."
        ),
    }


def memory_in_use_detail(
    plugin_id: str,
    exc: BaseException,
    *,
    loaded: bool,
    kind: str = "Plugin",
) -> dict:
    """Structured 409 when a memory backend still holds the plugin."""
    return {
        "id": plugin_id,
        "loaded": loaded,
        "clean": False,
        "quiescent": False,
        "needs_restart": True,
        "errors": [str(exc)],
        "message": f"{kind} '{plugin_id}': {exc}",
    }


# ── Helpers ──────────────────────────────────────────────────────────────


def _frontend_revision(
    plugin_dir: Path,
    frontend_entry: str | None,
    version: object,
) -> str:
    """Return a stable cache key that changes with frontend content."""
    # Release bundles use a cheap version revision marker. Development
    # bundles keep the legacy content hash for hot-reload cache busting.
    revision_file = plugin_dir / ".bundle_revision"
    try:
        revision = revision_file.read_text(encoding="utf-8").strip()
        if revision:
            return f"{version}-{revision[:20]}"
    except OSError:
        pass
    # Backward compatibility for installations created before the revision
    # marker was introduced. Ignore the old pseudo-hash version marker here;
    # it is not a content revision.
    try:
        legacy = (
            (plugin_dir / ".bundle_hash").read_text(encoding="utf-8").strip()
        )
        if legacy and not legacy.startswith("version:"):
            return f"{version}-{legacy[:20]}"
    except OSError:
        pass
    if frontend_entry:
        entry_path = (plugin_dir / frontend_entry).resolve()
        try:
            entry_path.relative_to(plugin_dir.resolve())
            content = entry_path.read_bytes()
            return f"{version}-{hashlib.sha256(content).hexdigest()[:20]}"
        except (OSError, ValueError):
            pass
    return str(version)


def _list_plugins_from_disk() -> list[dict]:
    """List installed plugins, including those that could not be loaded."""
    from ...config.utils import get_plugins_dir
    from ...plugins.architecture import PluginManifest

    plugins_dir: Path = get_plugins_dir()
    if not plugins_dir.exists():
        return []

    from ...plugins.loader import _is_disabled_plugin_dir

    result: list[dict] = []
    for item in sorted(plugins_dir.iterdir()):
        if not item.is_dir():
            continue
        if _is_disabled_plugin_dir(item):
            continue
        manifest_path = item / "plugin.json"
        if not manifest_path.exists():
            continue
        try:
            with open(manifest_path, encoding="utf-8") as f:
                manifest = PluginManifest.from_dict(json.load(f))
        except Exception as exc:
            logger.warning("Failed to read %s: %s", manifest_path, exc)
            continue

        from ...plugins.settings import is_plugin_enabled

        raw = _plugin_config_row(manifest.id)
        result.append(
            {
                "id": manifest.id,
                "name": manifest.name,
                "version": manifest.version,
                "description": manifest.description,
                "author": manifest.author,
                "enabled": is_plugin_enabled(raw),
                "loaded": False,
                "plugin_type": manifest.plugin_type,
                "frontend_entry": manifest.entry.frontend,
                "frontend_revision": _frontend_revision(
                    item,
                    manifest.entry.frontend,
                    manifest.version,
                ),
            },
        )
    return result


def _plugin_config_row(plugin_id: str) -> dict:
    from ...config.utils import load_config

    return dict((load_config().plugins or {}).get(plugin_id) or {})


def _safe_extract_zip(
    zip_ref: zipfile.ZipFile,
    extract_path: Path,
) -> None:
    """Extract zip safely, rejecting any Zip Slip path traversal.

    Args:
        zip_ref: Open ZipFile object
        extract_path: Destination directory (must be resolved)

    Raises:
        ValueError: If any member would escape extract_path
    """
    resolved_root = extract_path.resolve()
    for info in zip_ref.infolist():
        normalized = info.filename.replace("\\", "/")
        candidate = Path(normalized)
        if (
            not normalized
            or "\x00" in normalized
            or candidate.is_absolute()
            or ".." in candidate.parts
            or any(":" in part for part in candidate.parts)
        ):
            raise ValueError(f"Zip Slip detected: {info.filename}")
        output_path = extract_path.joinpath(*candidate.parts)
        if not output_path.resolve().is_relative_to(resolved_root):
            raise ValueError(f"Zip Slip detected: {info.filename}")
        output = io_path(output_path)
        if info.is_dir():
            os.makedirs(output, exist_ok=True)
            continue
        os.makedirs(os.path.dirname(output), exist_ok=True)
        with zip_ref.open(info) as source, open(output, "xb") as target:
            shutil.copyfileobj(source, target, length=1024 * 1024)


def _find_plugin_dir(base: Path) -> Path:
    """Return the directory that contains plugin.json.

    Args:
        base: Root of the extracted archive

    Returns:
        Directory containing plugin.json

    Raises:
        ValueError: If no plugin.json found
    """
    if (base / "plugin.json").exists():
        return base
    sub_dirs = [d for d in base.iterdir() if d.is_dir()]
    for sub in sub_dirs:
        if (sub / "plugin.json").exists():
            return sub
    raise ValueError(
        "No plugin.json found in archive root or top-level subdirectory",
    )


async def _load_plugin_with_optional_force_reinstall(
    loader,
    request: Request,
    source_path: Path,
    *,
    force: bool,
    interrupt_tasks: bool = False,
    reload_agents: bool = True,
    pawport_owner: dict | None = None,
    recover_incomplete: bool = False,
):
    """Load a plugin, optionally unloading first under one lifecycle lock.

    Force-reinstall is handled inside
    :meth:`PluginLoader.load_plugin_from_path` so this router never reads
    ``plugin.json`` from a user-supplied path (CodeQL path-injection).

    The full install transaction — unload (if force), load, and activate —
    runs under one
    :meth:`PluginLoader.plugin_lifecycle` critical section.

    Dropped tools are removed at the activate commit point from the
    provision inventory, not from ``plugin.json`` meta.
    """
    from ...config.utils import get_plugins_dir

    del request, reload_agents

    def _before_force_unload(plugin_id: str) -> None:
        logger.info(
            "Force-reinstall: unloading '%s' before re-installing",
            plugin_id,
        )
        del plugin_id

    return await loader.load_plugin_from_path(
        source_path=source_path,
        install_dir=get_plugins_dir(),
        force=force,
        **_interrupt_options(interrupt_tasks),
        before_force_unload=_before_force_unload if force else None,
        pawport_owner=pawport_owner,
        recover_incomplete=recover_incomplete,
    )


def _extract_plugin_zip_bytes(content: bytes, temp_dir: Path) -> Path:
    """Write ZIP bytes, safely extract, return plugin dir (sync I/O)."""
    zip_path = temp_dir / "plugin.zip"
    zip_path.write_bytes(content)
    extract_zip(zip_path, temp_dir)
    zip_path.unlink(missing_ok=True)
    return _find_plugin_dir(temp_dir)


def _extract_downloaded_plugin_zip(zip_path: Path, temp_dir: Path) -> Path:
    """Safely extract an on-disk ZIP and return the plugin dir (sync I/O)."""
    extract_zip(zip_path, temp_dir)
    zip_path.unlink(missing_ok=True)
    return _find_plugin_dir(temp_dir)


def _validate_external_upgrade_source(source: str) -> str:
    """Validate an external catalog URL used for an installed-plugin update."""
    value = source.strip()
    parsed = urlsplit(value)
    if (
        parsed.scheme.lower() != "https"
        or not parsed.hostname
        or parsed.hostname.lower() not in _EXTERNAL_PLUGIN_UPGRADE_HOSTS
        or parsed.username is not None
        or parsed.password is not None
    ):
        raise ValueError("Plugin source is not an approved external catalog")
    return value


def _validate_upgrade_archive(
    zip_path: Path,
    *,
    expected_plugin_id: str,
    expected_version: str | None,
) -> None:
    """Reject unsafe or mismatched external plugin upgrade archives."""
    if zip_path.stat().st_size > _PLUGIN_UPGRADE_MAX_ARCHIVE_BYTES:
        raise ValueError("Plugin archive exceeds the 256 MB limit")

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        members = zip_ref.infolist()
        if len(members) > _PLUGIN_UPGRADE_MAX_MEMBERS:
            raise ValueError("Plugin archive contains too many files")

        extracted_size = 0
        manifests: list[zipfile.ZipInfo] = []
        for member in members:
            normalized = member.filename.replace("\\", "/")
            if "\x00" in normalized:
                raise ValueError("Plugin archive contains an unsafe path")
            mode = (member.external_attr >> 16) & 0o170000
            if mode == stat.S_IFLNK:
                raise ValueError("Plugin archive links are not allowed")
            if not member.is_dir():
                extracted_size += member.file_size
                if extracted_size > _PLUGIN_UPGRADE_MAX_EXTRACTED_BYTES:
                    raise ValueError(
                        "Extracted plugin exceeds the 512 MB limit",
                    )
                if normalized == "plugin.json" or normalized.endswith(
                    "/plugin.json",
                ):
                    manifests.append(member)

        if len(manifests) != 1:
            raise ValueError(
                "Plugin archive must contain exactly one plugin.json",
            )
        try:
            manifest = json.loads(zip_ref.read(manifests[0]))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError(
                "Plugin archive contains an invalid plugin.json",
            ) from exc

    if not isinstance(manifest, dict):
        raise ValueError("Plugin archive contains an invalid plugin.json")
    if str(manifest.get("id") or "") != expected_plugin_id:
        raise ValueError("Plugin id does not match the selected catalog entry")
    actual_version = str(manifest.get("version") or "")
    if expected_version and actual_version != expected_version:
        raise ValueError(
            "Plugin version does not match the selected catalog entry",
        )


def _sha256_file(path: Path) -> str:
    """Return a streaming SHA256 digest for a downloaded archive."""
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


# ── Routes ───────────────────────────────────────────────────────────────


@router.get(
    "",
    summary="List installed plugins",
    description="Return installed plugins with their runtime state.",
)
async def list_plugins(request: Request):
    """Keep failed installations visible and removable in the installed UI."""
    loader = getattr(request.app.state, "plugin_loader", None)
    result = {
        item["id"]: item
        for item in await asyncio.to_thread(_list_plugins_from_disk)
    }
    if loader is None:
        return list(result.values())

    from ...plugins.settings import is_plugin_enabled

    for plugin_id, record in loader.get_all_loaded_plugins().items():
        manifest = record.manifest
        raw = _plugin_config_row(plugin_id)
        result[manifest.id] = {
            **result.get(manifest.id, {}),
            "id": manifest.id,
            "name": manifest.name,
            "version": manifest.version,
            "description": manifest.description,
            "author": manifest.author,
            "enabled": is_plugin_enabled(raw),
            "loaded": True,
            "status": getattr(record, "status", "active"),
            "diagnostics": list(getattr(record, "diagnostics", None) or []),
            "plugin_type": manifest.plugin_type,
            "frontend_entry": manifest.entry.frontend,
        }

    return list(result.values())


@router.get(
    "/catalog",
    summary="Official plugin catalog",
    description=(
        "Proxy the download CDN plugin manifest for in-app browsing. "
        "Marks plugins already installed under the working directory."
    ),
)
async def get_plugin_catalog():
    """Return official plugins from OSS metadata (server-side fetch)."""
    from ...plugins.download_catalog import fetch_plugin_catalog_async

    return await fetch_plugin_catalog_async()


class InstallPluginRequest(BaseModel):
    """Request body for installing a plugin from a path or URL."""

    source: str
    # Kept for wire compatibility. Public install routes reject force so all
    # installed-plugin updates remain owned by the signed component updater.
    force: bool = False
    interrupt_tasks: bool = False


class ReplacePluginRequest(BaseModel):
    """Verified external update for an already installed plugin."""

    source: str
    plugin_id: str
    version: str | None = None
    sha256: str | None = None
    interrupt_tasks: bool = False


async def install_plugin_source(
    source: str,
    *,
    app,
    force: bool = False,
    interrupt_tasks: bool = False,
    reload_agents: bool = True,
    pawport_owner: dict | None = None,
    recover_incomplete: bool = False,
):
    """Install through the native plugin lifecycle used by the HTTP route."""
    request = SimpleNamespace(app=app)
    loader = getattr(app.state, "plugin_loader", None)
    if loader is None:
        raise RuntimeError("Plugin loader is not ready yet.")

    normalized = str(source or "").strip()
    temp_dir: Optional[Path] = None
    try:
        if normalized.startswith(("http://", "https://")):
            temp_dir = Path(await asyncio.to_thread(tempfile.mkdtemp))
            zip_path = temp_dir / "plugin.zip"
            logger.info("Downloading plugin from %s", _log_safe(normalized))
            await _async_download(normalized, zip_path)
            source_path = await asyncio.to_thread(
                _extract_downloaded_plugin_zip,
                zip_path,
                temp_dir,
            )
        else:
            source_path = await asyncio.to_thread(Path(normalized).resolve)
            if not await asyncio.to_thread(source_path.exists):
                raise FileNotFoundError(f"Path not found: {normalized}")
        return await _load_plugin_with_optional_force_reinstall(
            loader,
            request,
            source_path,
            force=force,
            **_interrupt_options(interrupt_tasks),
            reload_agents=reload_agents,
            pawport_owner=pawport_owner,
            recover_incomplete=recover_incomplete,
        )
    finally:
        if temp_dir is not None:
            await asyncio.to_thread(shutil.rmtree, temp_dir, True)


async def uninstall_plugin_source(
    plugin_id: str,
    *,
    app,
    reload_agents: bool = True,
    interrupt_tasks: bool = False,
) -> None:
    """Uninstall through the native plugin lifecycle.

    ``reload_agents`` is kept for callers (e.g. portability). Uninstall
    must not rebuild agents; live workspaces are updated by revoke.
    """
    del reload_agents
    loader = getattr(app.state, "plugin_loader", None)
    if loader is None:
        raise RuntimeError("Plugin loader is not ready yet.")
    async with loader.plugin_lifecycle(plugin_id):
        from ...plugins.lifecycle import UnloadMode

        # Keep explicit uninstalls out of bundled startup and signed updates.
        # The native loader owns teardown; this host entry owns user intent.
        roots = getattr(loader, "plugin_dirs", None)
        root = (
            Path(roots[0])
            if isinstance(roots, (list, tuple)) and roots
            else None
        )
        was_marked = False
        was_adopted = False
        if root is not None:
            from ...plugins.bundled import (
                is_plugin_uninstalled,
                mark_plugin_uninstalled,
                clear_uninstalled_marker,
            )
            from ...components.service import (
                is_component_update_adopted,
                set_component_update_adoption,
            )

            was_marked = await asyncio.to_thread(
                is_plugin_uninstalled,
                plugin_id,
                plugins_dir=root,
            )
            was_adopted = await asyncio.to_thread(
                is_component_update_adopted,
                plugin_id,
            )
        try:
            if root is not None:
                if was_adopted:
                    await asyncio.to_thread(
                        set_component_update_adoption,
                        plugin_id,
                        False,
                    )
                await asyncio.to_thread(
                    mark_plugin_uninstalled,
                    plugin_id,
                    plugins_dir=root,
                )
            report = await loader.lifecycle.unload(
                plugin_id,
                UnloadMode.UNINSTALL,
                delete_files=True,
                **_interrupt_options(interrupt_tasks),
            )
            still_loaded = loader.get_loaded_plugin(plugin_id) is not None
            if not report.clean or not report.quiescent or still_loaded:
                raise UnquiescentUnloadError(
                    plugin_id,
                    report,
                    loaded=still_loaded,
                )
        except BaseException:
            if root is not None:
                if was_adopted:
                    await asyncio.to_thread(
                        set_component_update_adoption,
                        plugin_id,
                        True,
                    )
                if not was_marked:
                    await asyncio.to_thread(
                        clear_uninstalled_marker,
                        plugin_id,
                        plugins_dir=root,
                    )
            raise


# Compatibility helpers for native integrations; HTTP uses lifecycle.
async def _post_load_setup(  # pylint: disable=too-many-branches
    request: Request,
    plugin_id: str,
) -> None:
    """Perform post-load integration for a newly loaded plugin.

    Registers newly created providers / control-commands, executes
    startup hooks, and syncs tool entries into agent configs.

    Does **not** schedule agent reloads — callers must do that after any
    follow-up config cleanup (e.g. removing obsolete tools on
    force-reinstall) so reload never races stale tool entries.

    Args:
        request: Current FastAPI request (for app.state access)
        plugin_id: ID of the plugin that was just loaded
    """
    loader = getattr(request.app.state, "plugin_loader", None)
    if loader is None:
        return

    registry = loader.registry

    # Register any providers the plugin registered
    provider_manager = getattr(
        request.app.state,
        "provider_manager",
        None,
    )
    if provider_manager is not None:
        for pid, reg in registry.get_all_providers().items():
            if reg.plugin_id != plugin_id:
                continue
            try:
                await provider_manager.register_plugin_provider_async(
                    provider_id=pid,
                    provider_class=reg.provider_class,
                    label=reg.label,
                    base_url=reg.base_url,
                    metadata=reg.metadata,
                )
            except Exception as exc:
                logger.warning(
                    f"Could not register provider '{pid}': {exc}",
                )

    # Register any control commands the plugin registered
    try:
        from ...runtime.commands.control import register_command
        from ...app.channels.command_registry import CommandRegistry

        command_registry = CommandRegistry()
        for cmd_reg in registry.get_control_commands():
            if cmd_reg.plugin_id != plugin_id:
                continue
            try:
                register_command(cmd_reg.handler)
                command_registry.register_command(
                    f"/{cmd_reg.handler.command_name}",
                    priority_level=cmd_reg.priority_level,
                )
            except Exception as exc:
                logger.warning(
                    f"Could not register control command "
                    f"'{cmd_reg.handler.command_name}': {exc}",
                )
    except Exception as exc:
        logger.warning(f"Control command setup skipped: {exc}")

    # Execute startup hooks for the new plugin
    for hook in registry.get_startup_hooks():
        if hook.plugin_id != plugin_id:
            continue
        try:
            await invoke_plugin_callback(hook.callback)
        except Exception as exc:
            logger.error(
                f"Startup hook '{hook.hook_name}' failed: {exc}",
            )

    # Sync the plugin's tools into every agent's builtin_tools config
    # (config file I/O — keep off the event loop).
    await asyncio.to_thread(_sync_plugin_tools_to_agents, loader, plugin_id)


def _tool_names_from_meta(meta: dict) -> list[str]:
    """Extract tool names from plugin manifest ``meta`` (legacy + multi).

    Malformed ``meta.tools`` (``null``, non-list, non-dict entries) must
    never raise — callers run this after the plugin is already loaded.
    """
    if not isinstance(meta, dict):
        return []

    tool_names: list[str] = []
    seen: set[str] = set()

    def _add(name: object) -> None:
        if not isinstance(name, str):
            return
        stripped = name.strip()
        if not stripped or stripped in seen:
            return
        seen.add(stripped)
        tool_names.append(stripped)

    _add(meta.get("tool_name"))
    raw_tools = meta.get("tools")
    if not isinstance(raw_tools, list):
        raw_tools = []
    for tool in raw_tools:
        if not isinstance(tool, dict):
            continue
        _add(tool.get("name"))
    return tool_names


def _sync_plugin_tools_to_agents(loader, plugin_id: str) -> None:
    """Add plugin tool entries to all existing agents.

    Supports both old (``meta.tool_name``) and new (``meta.tools[]``)
    manifest formats.

    Args:
        loader: PluginLoader instance
        plugin_id: Plugin whose tools should be synced
    """
    record = loader.get_loaded_plugin(plugin_id)
    if record is None:
        return

    tool_names = _tool_names_from_meta(record.manifest.meta or {})
    if not tool_names:
        return

    try:
        from ...config.utils import load_config
        from ...config.config import (
            BuiltinToolConfig,
            load_agent_config,
            save_agent_config,
        )

        raw_meta = record.manifest.meta
        meta = raw_meta if isinstance(raw_meta, dict) else {}
        raw_manifest_tools = meta.get("tools", [])
        if not isinstance(raw_manifest_tools, list):
            raw_manifest_tools = []
        manifest_tools = {
            item["name"].strip(): item
            for item in raw_manifest_tools
            if (
                isinstance(item, dict)
                and isinstance(item.get("name"), str)
                and item["name"].strip()
            )
        }

        config = load_config()
        if not config.agents or not config.agents.profiles:
            return

        for agent_id in config.agents.profiles:
            try:
                agent_cfg = load_agent_config(agent_id)
                changed = False
                for tool_name in tool_names:
                    if tool_name in agent_cfg.tools.builtin_tools:
                        continue
                    declaration = manifest_tools.get(tool_name, {})
                    raw_enabled = declaration.get("enabled_by_default")
                    raw_description = declaration.get("description")
                    raw_icon = declaration.get("icon")
                    agent_cfg.tools.builtin_tools[
                        tool_name
                    ] = BuiltinToolConfig(
                        name=tool_name,
                        enabled=(
                            raw_enabled
                            if isinstance(raw_enabled, bool)
                            else False
                        ),
                        description=(
                            raw_description
                            if isinstance(raw_description, str)
                            else ""
                        ),
                        display_to_user=True,
                        async_execution=False,
                        icon=(raw_icon if isinstance(raw_icon, str) else None),
                        config={},
                    )
                    changed = True
                if changed:
                    save_agent_config(agent_id, agent_cfg)
            except Exception as exc:
                logger.warning(
                    f"Failed to sync tools to agent '{agent_id}': {exc}",
                )
    except Exception as exc:
        logger.warning(f"Tool sync skipped: {exc}")


def _remove_named_tools_from_agents(
    plugin_id: str,
    tool_names: list[str],
) -> None:
    """Remove the given tool names from all agents' builtin_tools config."""
    if not tool_names:
        return

    try:
        from ...config.utils import load_config
        from ...config.config import load_agent_config, save_agent_config

        config = load_config()
        if not config.agents or not config.agents.profiles:
            return

        for agent_id in config.agents.profiles:
            try:
                agent_cfg = load_agent_config(agent_id)
                changed = False
                for tool_name in tool_names:
                    if tool_name in agent_cfg.tools.builtin_tools:
                        del agent_cfg.tools.builtin_tools[tool_name]
                        changed = True
                if changed:
                    save_agent_config(agent_id, agent_cfg)
            except Exception as exc:
                logger.warning(
                    "Failed to remove tools from agent "
                    f"'{_log_safe(agent_id)}': {_log_safe(exc)}",
                )
    except Exception as exc:
        logger.warning(
            "Tool removal from agents skipped for "
            f"'{_log_safe(plugin_id)}': {_log_safe(exc)}",
        )


def _remove_plugin_tools_from_agents(plugin_id: str, meta: dict) -> None:
    """Remove plugin tool entries from all agents.

    Args:
        plugin_id: Plugin being uninstalled (for logging)
        meta: Plugin manifest ``meta`` section
    """
    _remove_named_tools_from_agents(
        plugin_id,
        _tool_names_from_meta(meta),
    )


async def _schedule_all_agents_reload(request: Request) -> None:
    """Schedule a reload for every configured agent.

    Args:
        request: FastAPI request (for app.state access)
    """
    try:
        from ...config.utils import load_config

        config = await asyncio.to_thread(load_config)
        if not config.agents or not config.agents.profiles:
            return
        for agent_id in config.agents.profiles:
            schedule_agent_reload(request, agent_id)
    except Exception as exc:
        logger.warning(f"Could not schedule agent reloads: {exc}")


def _post_unload_cleanup(
    request: Request,
    plugin_id: str,
    provider_ids: list,
    command_names: list,
) -> None:
    """Clean up runtime registrations after a plugin has been unloaded.

    Removes the plugin's providers from ``provider_manager`` and its
    control commands from both the handler registry and the priority
    registry.  Called after ``loader.unload_plugin()`` so that UI lists
    and command routing reflect the removal immediately.

    Args:
        request: FastAPI request (for ``app.state`` access).
        plugin_id: ID of the unloaded plugin (for logging).
        provider_ids: Provider IDs that were registered by this plugin.
        command_names: Command names that were registered by this plugin.
    """
    # ── Providers ────────────────────────────────────────────────────────
    provider_manager = getattr(
        request.app.state,
        "provider_manager",
        None,
    )
    if provider_manager is not None:
        for pid in provider_ids:
            try:
                provider_manager.unregister_plugin_provider(pid)
            except Exception as exc:
                logger.warning(
                    f"Could not unregister provider '{_log_safe(pid)}' "
                    f"for plugin '{_log_safe(plugin_id)}': {exc}",
                )

    # ── Control commands ─────────────────────────────────────────────────
    if command_names:
        try:
            from ...runtime.commands.control import (
                unregister_command as unregister_handler,
            )
            from ...app.channels.command_registry import CommandRegistry

            command_registry = CommandRegistry()
            for cmd_name in command_names:
                try:
                    unregister_handler(cmd_name)
                except Exception as exc:
                    logger.warning(
                        f"Could not unregister handler '{cmd_name}': {exc}",
                    )
                try:
                    command_registry.unregister_command(f"/{cmd_name}")
                except Exception as exc:
                    logger.warning(
                        f"Could not unregister priority for"
                        f" '/{cmd_name}': {exc}",
                    )
        except Exception as exc:
            logger.warning(
                f"Command cleanup skipped for plugin "
                f"'{_log_safe(plugin_id)}': {exc}",
            )


def _collect_plugin_runtime_ids(
    registry,
    plugin_id: str,
) -> tuple:
    """Collect provider IDs and command names registered by a plugin.

    Must be called *before* ``loader.unload_plugin()`` clears the
    registry entries.

    Args:
        registry: ``PluginRegistry`` instance.
        plugin_id: Plugin whose registrations should be collected.

    Returns:
        ``(provider_ids, command_names)`` tuple of lists.
    """
    provider_ids = [
        pid
        for pid, reg in registry.get_all_providers().items()
        if reg.plugin_id == plugin_id
    ]
    command_names = [
        cmd_reg.handler.command_name
        for cmd_reg in registry.get_control_commands()
        if cmd_reg.plugin_id == plugin_id
    ]
    return provider_ids, command_names


async def _finish_plugin_install_after_load(
    request: Request,
    record,
    *,
    force: bool,
    old_tools: set,
    reload_agents: bool = True,
) -> None:
    """Post-load setup with force-reinstall tool cleanup before reload.

    Guaranteed order:
    1. sync new tools / providers / hooks (``_post_load_setup``)
    2. remove obsolete tools (``old_tools - new_tools``) when *force*
    3. schedule agent reload
    """
    await _post_load_setup(request, record.manifest.id)
    if force:
        new_tools = set(
            _tool_names_from_meta(record.manifest.meta or {}),
        )
        removed_tools = sorted(old_tools - new_tools)
        if removed_tools:
            await asyncio.to_thread(
                _remove_named_tools_from_agents,
                record.manifest.id,
                removed_tools,
            )
    if reload_agents:
        await _schedule_all_agents_reload(request)


async def _rollback_failed_remote_install(loader, _request: Request, record):
    """Revoke a URL install whose signed updater enrollment failed."""
    from ...plugins.lifecycle import UnloadMode

    async with loader.plugin_lifecycle(record.manifest.id):
        report = await loader.lifecycle.unload(
            record.manifest.id,
            UnloadMode.UNINSTALL,
            delete_files=True,
        )
        if not report.clean or not report.quiescent:
            raise UnquiescentUnloadError(
                record.manifest.id,
                report,
                loaded=loader.get_loaded_plugin(record.manifest.id)
                is not None,
            )


@router.post(
    "/install",
    summary="Install plugin from path or URL",
    description=(
        "Install a plugin at runtime from a local directory path or a "
        "remote ZIP URL.  The plugin is loaded immediately — no restart "
        "required."
    ),
)
async def install_plugin(
    body: InstallPluginRequest,
    request: Request,
):
    """Install and hot-load a plugin from a local path or HTTP(S) URL.

    On success the plugin is immediately available; all agents are
    reloaded in the background so that newly registered tools can be
    used without a server restart.
    """
    loader = getattr(request.app.state, "plugin_loader", None)
    if loader is None:
        raise HTTPException(
            status_code=503,
            detail="Plugin loader is not ready yet. Try again shortly.",
        )

    if body.force:
        raise HTTPException(
            status_code=409,
            detail=(
                "Installed plugins can only be updated from the update "
                "button next to the application version."
            ),
        )

    source = body.source.strip()
    is_url = source.startswith(("http://", "https://"))
    try:
        record = await install_plugin_source(
            body.source,
            app=request.app,
            force=body.force,
            **_interrupt_options(body.interrupt_tasks),
        )
        if is_url:
            from ...components.service import set_component_update_adoption

            try:
                await asyncio.to_thread(
                    set_component_update_adoption,
                    record.manifest.id,
                    True,
                )
            except Exception:
                # A URL install is only complete once it is enrolled in the
                # signed component updater. Remove the just-installed copy so
                # a retry cannot be trapped behind an "already loaded" 409.
                await _rollback_failed_remote_install(loader, request, record)
                raise
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except PluginBusyError as exc:
        raise HTTPException(status_code=409, detail=exc.detail) from exc
    except MarketProviderBusyError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (FileNotFoundError, RuntimeError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.error(f"Plugin install failed: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Plugin installation failed: {exc}",
        ) from exc
    return {
        "id": record.manifest.id,
        "name": record.manifest.name,
        "version": record.manifest.version,
        "description": record.manifest.description,
        "author": record.manifest.author,
        "loaded": True,
        "diagnostics": list(getattr(record, "diagnostics", None) or []),
        "message": (
            f"Plugin '{record.manifest.name}' installed successfully."
        ),
    }


@router.post(
    "/replace",
    summary="Replace an installed plugin from an approved catalog",
    description=(
        "Download and verify an official or marketplace plugin archive, "
        "then replace the installed copy under the plugin lifecycle lock."
    ),
)
async def replace_installed_plugin(
    body: ReplacePluginRequest,
    request: Request,
):  # pylint: disable=too-many-statements
    """Securely upgrade an installed external plugin with rollback."""
    loader = getattr(request.app.state, "plugin_loader", None)
    if loader is None:
        raise HTTPException(
            status_code=503,
            detail="Plugin loader is not ready yet. Try again shortly.",
        )

    plugin_id = body.plugin_id.strip()
    if not _PLUGIN_ID_PATTERN.fullmatch(plugin_id):
        raise HTTPException(status_code=400, detail="Invalid plugin id")
    try:
        source = _validate_external_upgrade_source(body.source)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    expected_sha256 = (body.sha256 or "").strip().lower()
    if expected_sha256 and not re.fullmatch(r"[0-9a-f]{64}", expected_sha256):
        raise HTTPException(
            status_code=400,
            detail="Invalid plugin archive SHA256",
        )
    if upgrade_source_requires_digest(source) and not expected_sha256:
        raise HTTPException(
            status_code=400,
            detail="UGSci plugin upgrades require a SHA256 digest",
        )

    from ...config.utils import get_plugins_dir

    plugins_dir = get_plugins_dir().resolve()
    destination = (plugins_dir / plugin_id).resolve()
    if not destination.is_relative_to(plugins_dir):
        raise HTTPException(status_code=400, detail="Invalid plugin id")
    if not await asyncio.to_thread(destination.is_dir):
        raise HTTPException(
            status_code=404,
            detail=f"Plugin '{plugin_id}' is not installed.",
        )

    temp_dir = Path(await asyncio.to_thread(tempfile.mkdtemp))
    zip_path = temp_dir / "plugin.zip"
    backup_path: Path | None = None
    replacement_started = False
    try:
        await _async_download(source, zip_path)
        actual_sha256 = await asyncio.to_thread(_sha256_file, zip_path)
        if expected_sha256 and actual_sha256 != expected_sha256:
            raise ValueError("Plugin archive SHA256 verification failed")
        await asyncio.to_thread(
            _validate_upgrade_archive,
            zip_path,
            expected_plugin_id=plugin_id,
            expected_version=(body.version or "").strip() or None,
        )
        source_path = await asyncio.to_thread(
            _extract_downloaded_plugin_zip,
            zip_path,
            temp_dir,
        )

        backup_root = plugins_dir.parent / "plugin-upgrades" / "backups"
        await asyncio.to_thread(backup_root.mkdir, parents=True, exist_ok=True)
        concrete_backup_path = backup_root / f"{plugin_id}-{uuid.uuid4().hex}"
        backup_path = concrete_backup_path
        await asyncio.to_thread(
            copy_tree,
            destination,
            concrete_backup_path,
        )

        replacement_started = True
        record = await _load_plugin_with_optional_force_reinstall(
            loader,
            request,
            source_path,
            force=True,
            **_interrupt_options(body.interrupt_tasks),
        )
    except HTTPException:
        raise
    except PluginBusyError as exc:
        # Busy is raised before the lifecycle transaction mutates the plugin.
        # Preserve the confirmation contract and do not attempt a reinstall.
        raise HTTPException(status_code=409, detail=exc.detail) from exc
    except Exception as exc:
        if replacement_started and backup_path is not None:
            try:
                await _load_plugin_with_optional_force_reinstall(
                    loader,
                    request,
                    backup_path,
                    force=True,
                )
            except Exception as rollback_exc:  # noqa: BLE001
                logger.exception(
                    "Plugin upgrade rollback failed for '%s'",
                    _log_safe(plugin_id),
                )
                raise HTTPException(
                    status_code=500,
                    detail=(
                        f"Plugin upgrade failed and rollback also failed: "
                        f"{rollback_exc}"
                    ),
                ) from exc
            logger.warning(
                "Plugin upgrade failed for '%s'; restored previous version",
                _log_safe(plugin_id),
            )
            raise HTTPException(
                status_code=500,
                detail=(
                    "Plugin upgrade failed; previous version restored: "
                    f"{exc}"
                ),
            ) from exc
        if isinstance(exc, (ValueError, zipfile.BadZipFile)):
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        logger.exception(
            "Plugin upgrade failed for '%s'",
            _log_safe(plugin_id),
        )
        raise HTTPException(
            status_code=500,
            detail=f"Plugin upgrade failed: {exc}",
        ) from exc
    finally:
        if await asyncio.to_thread(temp_dir.exists):
            await asyncio.to_thread(remove_tree, temp_dir)

    return {
        "id": record.manifest.id,
        "name": record.manifest.name,
        "version": record.manifest.version,
        "restart_required": True,
        "backup_path": str(backup_path) if backup_path else None,
    }


@router.post(
    "/upload",
    summary="Install plugin from ZIP upload",
    description=(
        "Upload a plugin ZIP file and install it at runtime.  The "
        "plugin is loaded immediately — no restart required.  Pass "
        "``force=true`` as a query parameter to reinstall an already-"
        "loaded plugin."
    ),
)
async def upload_plugin(
    request: Request,
    file: UploadFile = File(..., description="Plugin ZIP archive"),
    force: bool = False,
    interrupt_tasks: bool = False,
):
    """Install and hot-load a plugin from an uploaded ZIP file."""
    loader = getattr(request.app.state, "plugin_loader", None)
    if loader is None:
        raise HTTPException(
            status_code=503,
            detail="Plugin loader is not ready yet. Try again shortly.",
        )

    if force:
        raise HTTPException(
            status_code=409,
            detail=(
                "Installed plugins can only be updated from the update "
                "button next to the application version."
            ),
        )

    if not file.filename or not file.filename.endswith(".zip"):
        raise HTTPException(
            status_code=400,
            detail="Only .zip archives are accepted.",
        )

    temp_dir = Path(await asyncio.to_thread(tempfile.mkdtemp))
    try:
        content = await file.read()
        source_path = await asyncio.to_thread(
            _extract_plugin_zip_bytes,
            content,
            temp_dir,
        )

        # Load + post-load setup share one lifecycle lock.
        record = await _load_plugin_with_optional_force_reinstall(
            loader,
            request,
            source_path,
            force=force,
            **_interrupt_options(interrupt_tasks),
        )
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except PluginBusyError as exc:
        raise HTTPException(status_code=409, detail=exc.detail) from exc
    except MarketProviderBusyError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (FileNotFoundError, RuntimeError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.error(f"Plugin upload failed: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Plugin installation failed: {exc}",
        ) from exc
    finally:
        if await asyncio.to_thread(temp_dir.exists):
            await asyncio.to_thread(remove_tree, temp_dir)

    return {
        "id": record.manifest.id,
        "name": record.manifest.name,
        "version": record.manifest.version,
        "description": record.manifest.description,
        "author": record.manifest.author,
        "loaded": True,
        "diagnostics": list(getattr(record, "diagnostics", None) or []),
        "message": (
            f"Plugin '{record.manifest.name}' installed successfully."
        ),
    }


@router.delete(
    "/{plugin_id}",
    summary="Uninstall a plugin",
    description=(
        "Unload and permanently delete a plugin, including plugins "
        "that are not currently loaded (disabled or FAILED)."
    ),
)
async def uninstall_plugin(
    plugin_id: str,
    request: Request,
    interrupt_tasks: bool = False,
):
    """Unload and delete a plugin by ID."""
    loader = getattr(request.app.state, "plugin_loader", None)
    if loader is None:
        raise HTTPException(
            status_code=503,
            detail="Plugin loader is not ready yet.",
        )

    try:
        await uninstall_plugin_source(
            plugin_id,
            app=request.app,
            **_interrupt_options(interrupt_tasks),
        )
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PluginBusyError as exc:
        raise HTTPException(status_code=409, detail=exc.detail) from exc
    except MarketProviderBusyError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except UnquiescentUnloadError as exc:
        raise HTTPException(
            status_code=409,
            detail=unload_http_detail(
                exc.plugin_id,
                exc.report,
                loaded=exc.loaded,
            ),
        ) from exc
    except MemoryBackendInUseError as exc:
        still_loaded = loader.get_loaded_plugin(plugin_id) is not None
        raise HTTPException(
            status_code=409,
            detail=memory_in_use_detail(
                plugin_id,
                exc,
                loaded=still_loaded,
            ),
        ) from exc
    except Exception as exc:
        logger.error(
            f"Plugin uninstall failed for '{_log_safe(plugin_id)}': {exc}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"Plugin uninstallation failed: {exc}",
        ) from exc

    return {
        "id": plugin_id,
        "message": f"Plugin '{plugin_id}' uninstalled successfully.",
    }


@router.post(
    "/{plugin_id}/unload",
    summary="Unload a plugin without deleting user data",
    description=(
        "Remove the plugin from the process (mode=unload). "
        "agent.json and config.plugins are left unchanged."
    ),
)
async def unload_plugin_keep_config(
    plugin_id: str,
    request: Request,
    interrupt_tasks: bool = False,
):
    """Callable entry for ``unload(mode=unload)``."""
    loader = getattr(request.app.state, "plugin_loader", None)
    if loader is None:
        raise HTTPException(
            status_code=503,
            detail="Plugin loader is not ready yet.",
        )
    from ...plugins.lifecycle import UnloadMode

    try:
        async with loader.plugin_lifecycle(plugin_id):
            report = await loader.lifecycle.unload(
                plugin_id,
                UnloadMode.UNLOAD,
                delete_files=False,
                **_interrupt_options(interrupt_tasks),
            )
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PluginBusyError as exc:
        raise HTTPException(status_code=409, detail=exc.detail) from exc
    except MemoryBackendInUseError as exc:
        still_loaded = loader.get_loaded_plugin(plugin_id) is not None
        raise HTTPException(
            status_code=409,
            detail=memory_in_use_detail(
                plugin_id,
                exc,
                loaded=still_loaded,
            ),
        ) from exc
    still_loaded = loader.get_loaded_plugin(plugin_id) is not None
    payload = unload_http_detail(
        plugin_id,
        report,
        loaded=still_loaded,
    )
    if not report.quiescent or still_loaded:
        raise HTTPException(status_code=409, detail=payload)
    return {
        **payload,
        "message": f"Plugin '{plugin_id}' unloaded.",
    }


@router.post(
    "/{plugin_id}/repair-dependencies",
    summary="Repair plugin dependencies",
    description=(
        "Explicitly install missing plugin dependencies, then load. "
        "Host-package upgrades are rejected and require a backend restart."
    ),
)
async def repair_plugin_dependencies(plugin_id: str, request: Request):
    """User-triggered dependency repair (boot never installs)."""
    loader = getattr(request.app.state, "plugin_loader", None)
    if loader is None:
        raise HTTPException(
            status_code=503,
            detail="Plugin loader is not ready yet.",
        )
    try:
        record = await loader.repair_dependencies(plugin_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except Exception as exc:
        logger.error(
            "Repair dependencies failed for '%s': %s",
            _log_safe(plugin_id),
            exc,
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"Repair failed: {exc}",
        ) from exc
    return {
        "id": plugin_id,
        "status": record.status,
        "enabled": record.enabled,
        "diagnostics": list(getattr(record, "diagnostics", None) or []),
        "message": (
            f"Plugin '{plugin_id}' repaired."
            if record.status != "failed"
            else f"Plugin '{plugin_id}' still failed."
        ),
    }


@router.get(
    "/{plugin_id}/status",
    summary="Get plugin status",
    description="Return the runtime status of a single plugin.",
)
async def get_plugin_status(plugin_id: str, request: Request):
    """Return the runtime status of a plugin."""
    loader = getattr(request.app.state, "plugin_loader", None)

    from ...plugins.settings import is_plugin_enabled

    raw = _plugin_config_row(plugin_id)
    enabled = is_plugin_enabled(raw)
    if loader is not None:
        record = loader.get_loaded_plugin(plugin_id)
        if record is not None:
            return {
                "id": plugin_id,
                "loaded": True,
                "enabled": enabled,
                "status": getattr(record, "status", "active"),
                "diagnostics": list(
                    getattr(record, "diagnostics", None) or [],
                ),
                "version": record.manifest.version,
            }

    # Check disk even if loader is not ready or plugin is not loaded
    from ...config.utils import get_plugins_dir

    plugin_dir = get_plugins_dir() / plugin_id
    if plugin_dir.is_dir() and (plugin_dir / "plugin.json").exists():
        return {
            "id": plugin_id,
            "loaded": False,
            "enabled": enabled,
        }

    raise HTTPException(
        status_code=404,
        detail=f"Plugin '{plugin_id}' not found.",
    )


class UpdatePluginConfigRequest(BaseModel):
    """Replace the plugin-facing config without reimporting the module."""

    config: dict
    confirm_legacy: bool = False
    interrupt_tasks: bool = False


class SetPluginEnabledRequest(BaseModel):
    """Enable or disable a plugin via ``config.plugins.<id>.enabled``."""

    enabled: bool
    interrupt_tasks: bool = False


@router.put(
    "/{plugin_id}/config",
    summary="Update plugin configuration",
    description=(
        "Rebuild the plugin's runtime contributions from a new config "
        "without reimporting the module. Legacy uninstall hooks require "
        "``confirm_legacy=true``."
    ),
)
async def update_plugin_config(
    plugin_id: str,
    body: UpdatePluginConfigRequest,
    request: Request,
):
    """Apply a new plugin config, rolling back on a half-finished register."""
    loader = getattr(request.app.state, "plugin_loader", None)
    if loader is None:
        raise HTTPException(
            status_code=503,
            detail="Plugin loader is not ready yet.",
        )
    try:
        report = await loader.lifecycle.update_config(
            plugin_id,
            body.config,
            confirm_legacy=body.confirm_legacy,
            **_interrupt_options(body.interrupt_tasks),
        )
    except PluginBusyError as exc:
        raise HTTPException(status_code=409, detail=exc.detail) from exc
    if report.requires_confirmation:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "legacy_uninstall_hook",
                "message": (
                    report.errors[0]
                    if report.errors
                    else "legacy uninstall hook requires confirmation"
                ),
                "legacy_hooks": report.legacy_hooks,
                "requires_confirmation": True,
            },
        )
    if not report.ok:
        if report.needs_restart or report.conflict:
            status = 409
        elif report.unchanged:
            status = 404
        else:
            status = 400
        raise HTTPException(
            status_code=status,
            detail={
                "message": (
                    report.errors[0]
                    if report.errors
                    else "config update failed"
                ),
                "errors": report.errors,
                "unchanged": report.unchanged,
                "needs_restart": report.needs_restart,
                "quiescent": report.quiescent,
            },
        )
    return {
        "id": plugin_id,
        "ok": True,
        "message": f"Plugin '{plugin_id}' config updated.",
    }


@router.post(
    "/{plugin_id}/enabled",
    summary="Enable or disable a plugin",
    description=(
        "Persist ``enabled`` in config.plugins. Disabling unloads the "
        "instance without deleting files; enabling loads it from disk."
    ),
)
async def set_plugin_enabled(
    plugin_id: str,
    body: SetPluginEnabledRequest,
    request: Request,
):
    """Toggle whether a plugin is loaded on this host."""
    loader = getattr(request.app.state, "plugin_loader", None)
    if loader is None:
        raise HTTPException(
            status_code=503,
            detail="Plugin loader is not ready yet.",
        )
    from ...config.utils import get_plugins_dir

    plugin_dir = get_plugins_dir() / plugin_id
    if not (plugin_dir / "plugin.json").is_file():
        if loader.get_loaded_plugin(plugin_id) is None:
            raise HTTPException(
                status_code=404,
                detail=f"Plugin '{plugin_id}' not found.",
            )
    try:
        if not body.enabled:
            result = await loader.lifecycle.set_enabled(
                plugin_id,
                False,
                **_interrupt_options(body.interrupt_tasks),
            )
            clean = getattr(result, "clean", True)
            quiescent = getattr(result, "quiescent", True)
            needs_restart = getattr(result, "needs_restart", False)
            still_loaded = loader.get_loaded_plugin(plugin_id) is not None
            payload = {
                "id": plugin_id,
                "enabled": False,
                "loaded": still_loaded,
                "clean": clean,
                "quiescent": quiescent,
                "needs_restart": needs_restart,
                "errors": list(getattr(result, "errors", []) or []),
            }
            if not quiescent or still_loaded:
                from ...plugins.settings import is_plugin_enabled

                raise HTTPException(
                    status_code=409,
                    detail={
                        **payload,
                        "enabled": is_plugin_enabled(
                            _plugin_config_row(plugin_id),
                        ),
                        "message": (
                            f"Plugin '{plugin_id}' did not go quiescent."
                        ),
                    },
                )
            return {
                **payload,
                "message": f"Plugin '{plugin_id}' disabled.",
            }
        record = await loader.lifecycle.set_enabled(plugin_id, True)
        return {
            "id": plugin_id,
            "enabled": True,
            "loaded": record is not None,
            "status": getattr(record, "status", "inactive"),
            "message": f"Plugin '{plugin_id}' enabled.",
        }
    except HTTPException:
        raise
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PluginBusyError as exc:
        raise HTTPException(status_code=409, detail=exc.detail) from exc
    except Exception as exc:
        logger.error(
            "Failed to set enabled=%s for plugin '%s': %s",
            body.enabled,
            _log_safe(plugin_id),
            exc,
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update plugin enabled state: {exc}",
        ) from exc


@router.get(
    "/{plugin_id}/files/{file_path:path}",
    summary="Serve plugin static file",
    description="Serve a static file from a plugin's directory.",
)
async def serve_plugin_ui_file(
    plugin_id: str,
    file_path: str,
    request: Request,
):
    """Serve a static file that belongs to a plugin (JS / CSS / images).

    When the plugin loader is ready, the plugin's source path is taken
    from the in-memory record.  If the loader is not yet initialised,
    the file is resolved directly from the plugins directory on disk.

    A path-traversal guard ensures the resolved path stays inside the
    plugin's source directory.
    """
    loader = getattr(request.app.state, "plugin_loader", None)

    if loader is not None:
        record = loader.get_loaded_plugin(plugin_id)
        if record is None:
            raise HTTPException(
                404,
                f"Plugin '{plugin_id}' not found",
            )
        source_path: Path = record.source_path
    else:
        from ...config.utils import get_plugins_dir

        candidate = get_plugins_dir() / plugin_id
        if not candidate.is_dir() or not (candidate / "plugin.json").exists():
            raise HTTPException(
                404,
                f"Plugin '{plugin_id}' not found",
            )
        source_path = candidate

    full_path = (source_path / file_path).resolve()

    if not full_path.is_relative_to(source_path.resolve()):
        raise HTTPException(403, "Access denied")

    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(404, f"File not found: {file_path}")

    content_type, _ = mimetypes.guess_type(str(full_path))

    if full_path.suffix in (".js", ".mjs"):
        content_type = "application/javascript"
    elif full_path.suffix == ".css":
        content_type = "text/css"

    # Content-hashed chunks are safe to cache long-term; entry files must
    # revalidate on every request or browsers keep serving stale bundles
    # after a plugin hot update.
    hashed_asset = re.search(r"-[A-Za-z0-9_]{8,}\.[a-z0-9]+$", full_path.name)
    versioned_entry = bool(request.query_params.get("v"))
    cache_control = (
        "public, max-age=31536000, immutable"
        if hashed_asset or versioned_entry
        else "no-cache"
    )
    headers = {"Cache-Control": cache_control}

    if content_type:
        return FileResponse(
            str(full_path),
            media_type=content_type,
            headers=headers,
        )

    return FileResponse(str(full_path), headers=headers)


# ── Plugin market proxy ───────────────────────────────────────────────────

_PLUGIN_MARKET_BASE_URL = "https://platform.agentscope.io"
_PLUGIN_MARKET_TIMEOUT = 15


@router.get(
    "/market/search",
    summary="Search plugins from AgentScope Platform",
)
async def search_market_plugins(
    page_number: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    category: Optional[str] = None,
    sort_by: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_trending: Optional[bool] = None,
):
    """Proxy plugin search to AgentScope Platform to avoid CORS."""
    import httpx

    params: dict = {
        "page_number": page_number,
        "page_size": page_size,
    }
    if search:
        params["search"] = search
    if category:
        params["category"] = category
    if sort_by:
        params["sort_by"] = sort_by
    if is_featured is not None:
        params["is_featured"] = is_featured
    if is_trending is not None:
        params["is_trending"] = is_trending

    try:
        async with httpx.AsyncClient(
            timeout=_PLUGIN_MARKET_TIMEOUT,
        ) as client:
            resp = await client.get(
                f"{_PLUGIN_MARKET_BASE_URL}/openapi/v1/plugins",
                params=params,
            )
            resp.raise_for_status()
            payload = resp.json()
            installed = {
                str(plugin.get("id") or ""): str(
                    plugin.get("version") or "0.0.0",
                )
                for plugin in _list_plugins_from_disk()
                if plugin.get("id")
            }
            data = payload.get("data") if isinstance(payload, dict) else None
            plugins = data.get("plugins") if isinstance(data, dict) else None
            if isinstance(plugins, list):
                for entry in plugins:
                    if not isinstance(entry, dict):
                        continue
                    plugin_id = str(entry.get("id") or "")
                    candidates = {
                        plugin_id,
                        plugin_id.removeprefix("@"),
                        f"@{plugin_id}" if plugin_id else "",
                    }
                    installed_id = next(
                        (
                            candidate
                            for candidate in candidates
                            if candidate in installed
                        ),
                        None,
                    )
                    entry["installed"] = installed_id is not None
                    if installed_id is not None:
                        entry["installed_version"] = installed[installed_id]
            return payload
    except Exception as exc:
        logger.warning("Plugin market search failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch from plugin market: {exc}",
        ) from exc


# ── OSS proxy (avoid CORS for UGSci official manifests) ────────────────────

_OSS_BASE_URL = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com"
_OSS_PROXY_TIMEOUT = 15


@router.get(
    "/oss-proxy",
    summary="Proxy OSS resources to avoid CORS",
)
async def oss_proxy(request: Request, path: str, refresh: bool = False):
    """Proxy a file from the UGSci OSS bucket to the frontend.

    The OSS bucket does not send CORS headers, so the browser cannot fetch
    directly.  This endpoint fetches server-side and returns the content
    with permissive CORS headers.
    """
    from ...plugins.oss_cache import fetch_oss_resource

    clean_path = path.lstrip("/")
    try:
        content, content_type, cache_state = await fetch_oss_resource(
            clean_path,
            force=refresh,
        )
        from fastapi.responses import Response

        etag = f'"{hashlib.sha256(content).hexdigest()}"'
        headers = {
            "Cache-Control": (
                "no-store"
                if refresh
                else (
                    "private, no-cache"
                    if clean_path.endswith("manifest.json")
                    else "public, max-age=21600"
                )
            ),
            "ETag": etag,
            "X-QwenPaw-Cache": cache_state,
        }
        validators = request.headers.get("if-none-match", "").split(",")
        if not refresh and any(
            value.strip().removeprefix("W/") in {etag, "*"}
            for value in validators
        ):
            return Response(status_code=304, headers=headers)
        return Response(
            content=content,
            media_type=content_type,
            headers=headers,
        )
    except Exception as exc:
        logger.warning("OSS proxy failed for %s: %s", clean_path, exc)
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch from OSS: {exc}",
        ) from exc


_DOWNLOAD_TIMEOUT = 60  # seconds per socket operation; no total limit

_MAX_DOWNLOAD_BYTES = 500 * 1024 * 1024  # 500 MB safety cap


async def _async_download(url: str, dest: Path) -> None:
    """Download a URL to a file using a thread pool.

    Streams the response in chunks with a per-operation socket timeout.
    This does not impose a total download time limit.

    Args:
        url: HTTP(S) URL to download
        dest: Destination file path

    Raises:
        RuntimeError: If the download exceeds the size cap, times out,
            or fails with a network or HTTP protocol error.
    """

    def _download() -> None:
        with urllib.request.urlopen(
            url,
            timeout=_DOWNLOAD_TIMEOUT,
        ) as resp:
            total = 0
            with open(dest, "wb") as fh:
                while True:
                    chunk = resp.read(65536)
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > _MAX_DOWNLOAD_BYTES:
                        raise RuntimeError(
                            f"Download aborted: response exceeds "
                            f"{_MAX_DOWNLOAD_BYTES // (1024 * 1024)} MB",
                        )
                    fh.write(chunk)

    try:
        await asyncio.to_thread(_download)
    except (
        urllib.error.URLError,
        TimeoutError,
        ConnectionError,
        ssl.SSLError,
        http.client.HTTPException,
    ) as exc:
        raise RuntimeError(f"Plugin download failed: {exc}") from exc


# Keep the catch-all lookup after every literal GET route (market, oss-proxy).
@router.get(
    "/{plugin_id}",
    summary="Get a plugin",
    description="Return one plugin's runtime status, or 404 if missing.",
)
async def get_plugin(plugin_id: str, request: Request):
    """Return one plugin. Missing ids are 404, never 405."""
    return await get_plugin_status(plugin_id, request)
