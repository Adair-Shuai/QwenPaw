# -*- coding: utf-8 -*-
"""Durable verified plugin archives that activate after a backend restart."""

# Reuse the internal update kernel and its transaction boundaries.
# pylint: disable=protected-access

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import re
import shutil
from pathlib import Path
import uuid

from packaging.version import Version

from ..constant import WORKING_DIR
from ..utils.io_utils import write_json_atomic
from .install_lock import plugin_install_lock

logger = logging.getLogger(__name__)
_ROOT = WORKING_DIR / "plugin_updates" / "downloaded"


def _records():
    try:
        payload = json.loads(
            (_ROOT / "pending.json").read_text(encoding="utf-8"),
        )
        return payload if isinstance(payload, dict) else {}
    except (OSError, ValueError):
        return {}


def _digest(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def cached_archive(body):
    record = _records().get(body.plugin_id, {})
    digest = record.get("sha256", "")
    if (
        re.fullmatch(r"[0-9a-f]{64}", digest) is None
        or record.get("source") != body.source
        or record.get("version") != body.version
        or body.sha256
        and body.sha256.lower() != digest
    ):
        return None
    path = _ROOT / f"{digest}.zip"
    if path.is_file() and not path.is_symlink() and _digest(path) == digest:
        return path
    return None


def queue_downloaded_plugin(body, archive, *, dependency_operation_id=None):
    """Keep the exact archive verified by the update route."""
    digest = _digest(archive)
    _ROOT.mkdir(parents=True, exist_ok=True)
    with plugin_install_lock(_ROOT / ".queue.lock", timeout=30):
        records = _records()
        previous = records.get(body.plugin_id, {})
        if previous and Version(previous["version"]) > Version(body.version):
            return
        destination = _ROOT / f"{digest}.zip"
        if not destination.is_file() or _digest(destination) != digest:
            temporary = _ROOT / f".{uuid.uuid4().hex}.tmp"
            try:
                shutil.copyfile(archive, temporary)
                os.replace(temporary, destination)
            finally:
                temporary.unlink(missing_ok=True)
        records[body.plugin_id] = {
            "operation_id": uuid.uuid4().hex,
            "plugin_id": body.plugin_id,
            "source": body.source,
            "version": body.version,
            "sha256": digest,
        }
        if dependency_operation_id:
            records[body.plugin_id].update(
                confirmation="dependencies",
                dependency_operation_id=dependency_operation_id,
            )
        write_json_atomic(_ROOT / "pending.json", records)


def acknowledge_downloaded_plugin(plugin_id, version, operation_id=None):
    if not _ROOT.is_dir():
        return
    with plugin_install_lock(_ROOT / ".queue.lock", timeout=30):
        records = _records()
        record = records.get(plugin_id)
        if (
            record
            and Version(record["version"]) <= Version(version)
            and (
                operation_id is None
                or record.get("operation_id") == operation_id
            )
        ):
            records.pop(plugin_id)
            write_json_atomic(_ROOT / "pending.json", records)
        retained = {f"{row.get('sha256')}.zip" for row in records.values()}
        for archive in _ROOT.glob("*.zip"):
            if archive.name not in retained and not archive.is_symlink():
                archive.unlink(missing_ok=True)


def _prepare_downloaded_candidate(
    updater,
    body,
    archive,
    destination,
    current_version,
):
    """Verify, preserve data and atomically stage one cold-start candidate."""
    import tempfile

    from .._version_compat import check_plugin_version_compat
    from ..app.routers.plugins import (
        _validate_upgrade_archive,
        _extract_downloaded_plugin_zip,
        _market_id_from_source,
        _MARKET_MARKER_FILE,
    )
    from ..components.update import ComponentUpdatePlan
    from ..update_policy import DEFAULT_PRESERVE_PATHS
    from .architecture import PluginManifest

    plugin_id = body.plugin_id
    plugins = destination.parent
    _validate_upgrade_archive(
        archive,
        expected_plugin_id=plugin_id,
        expected_version=body.version,
    )
    with tempfile.TemporaryDirectory(
        prefix=".plugin-update-",
        dir=str(plugins),
    ) as temporary:
        root = Path(temporary)
        extracted_archive = root / "plugin.zip"
        shutil.copyfile(archive, extracted_archive)
        candidate = _extract_downloaded_plugin_zip(extracted_archive, root)
        market_id = _market_id_from_source(body.source)
        if market_id:
            (candidate / _MARKET_MARKER_FILE).write_text(
                json.dumps({"schema_version": 1, "market_id": market_id}),
                encoding="utf-8",
            )
        manifest = PluginManifest.from_dict(
            json.loads(
                (candidate / "plugin.json").read_text(encoding="utf-8"),
            ),
        )
        compatible, reason = check_plugin_version_compat(manifest)
        if not compatible:
            raise RuntimeError(reason)
        preserve = (
            (*DEFAULT_PRESERVE_PATHS, "visualization/data")
            if plugin_id == "ugsci"
            else DEFAULT_PRESERVE_PATHS
        )
        plan = ComponentUpdatePlan(
            plugin_id,
            current_version,
            body.version,
            "full",
            body.source,
            body.sha256,
            "",
            preserve,
            None,
        )
        updater.recover_interrupted_activation(plugin_id, destination)
        backup = updater._backup_component_data(plan, destination, destination)
        updater._restore_backup_to_staging(backup, candidate, plan)
        updater._atomic_activate(
            candidate,
            destination,
            plugin_id,
            body.version,
        )
        updater._prune_backups(backup)


def prepare_downloaded_plugins():
    """Stage downloaded files before startup imports any installed plugins."""
    from ..__version__ import __version__
    from ..app.routers.plugins import (
        ReplacePluginRequest,
        _validate_external_upgrade_source,
    )
    from ..components.service import resolve_component_destination
    from ..components.update import ComponentUpdater
    from ..config.utils import get_plugins_dir
    from .bundled import is_plugin_uninstalled

    records = _records()
    if not records:
        return None, {}
    profile = _ROOT.parent.parent
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(records),
        core_version=__version__,
        active_path=profile / "components" / "active.json",
        backup_root=profile / "components" / "backups",
        defer_activation_cleanup=True,
    )
    prepared = {}
    plugins = get_plugins_dir()
    for plugin_id, record in records.items():
        try:
            body = ReplacePluginRequest(**record)
            _validate_external_upgrade_source(body.source)
            destination = resolve_component_destination(plugins, plugin_id)
            if not destination.is_dir() or is_plugin_uninstalled(
                plugin_id,
                plugins_dir=plugins,
                plugin_dir=destination,
            ):
                acknowledge_downloaded_plugin(
                    plugin_id,
                    body.version,
                    record.get("operation_id"),
                )
                continue
            current = json.loads(
                (destination / "plugin.json").read_text(encoding="utf-8"),
            )
            if Version(current["version"]) >= Version(body.version):
                if updater.activation_pending(destination):
                    prepared[plugin_id] = record
                else:
                    acknowledge_downloaded_plugin(
                        plugin_id,
                        current["version"],
                        record.get("operation_id"),
                    )
                continue
            if record.get("confirmation"):
                continue
            archive = cached_archive(body)
            if archive is None:
                raise RuntimeError(
                    "Downloaded update archive is missing or corrupted",
                )
            _prepare_downloaded_candidate(
                updater,
                body,
                archive,
                destination,
                current["version"],
            )
            prepared[plugin_id] = record
        except Exception:
            logger.warning(
                "Downloaded plugin preparation failed for %s",
                plugin_id,
                exc_info=True,
            )
    return updater, prepared


async def reconcile_downloaded_plugins(loader, updater, prepared, configs):
    """Keep the previous version until normal startup health checks finish."""
    from functools import partial

    from ..app.plugin_activation import reconcile_plugin_activation
    from ..components.service import resolve_component_destination
    from ..config.utils import get_plugins_dir

    for plugin_id, record in prepared.items():
        destination = resolve_component_destination(
            get_plugins_dir(),
            plugin_id,
        )
        try:
            healthy = await reconcile_plugin_activation(
                loader,
                plugin_id,
                finalize=partial(
                    updater.finalize_activation,
                    plugin_id,
                    destination,
                ),
                rollback=partial(
                    updater.rollback_activation,
                    plugin_id,
                    destination,
                ),
                config=configs.get(plugin_id),
            )
            if healthy:
                await asyncio.to_thread(
                    acknowledge_downloaded_plugin,
                    plugin_id,
                    record["version"],
                    record.get("operation_id"),
                )
        except Exception:
            logger.warning(
                "Downloaded plugin activation recovery deferred for %s",
                plugin_id,
                exc_info=True,
            )


def pending_update_summaries():
    """Expose downloaded updates that need shared dependency confirmation."""
    from ..components.service import _load_pending_records

    summaries = {}
    for plugin_id, record in _records().items():
        if record.get("confirmation"):
            summaries[plugin_id] = {
                key: record.get(key)
                for key in ("version", "source", "sha256", "confirmation")
            }
    for plugin_id, record in _load_pending_records().items():
        if record.get("confirmation"):
            summaries[plugin_id] = {
                "version": record.get("target_version"),
                "source": record.get("source", ""),
                "sha256": record.get("artifact_sha256", ""),
                "channel": "ugsci",
                "confirmation": record["confirmation"],
            }
    return summaries


async def pending_dependency_operation(
    loader,
    pending,
    version,
    source=None,
    *,
    background=False,
):
    """Reuse a valid review or allow rebuilding an unavailable frozen plan."""
    from .dependency_upgrade import dependency_upgrades

    target = pending.get("target_version") or pending.get("version")
    if (
        background
        or pending.get("confirmation") != "dependencies"
        or target != version
    ):
        return None
    if source is not None and pending.get("source") != source:
        return None
    try:
        operation = await asyncio.to_thread(
            dependency_upgrades(loader).status,
            pending["dependency_operation_id"],
        )
    except (FileNotFoundError, RuntimeError, ValueError):
        logger.info("Rebuilding the unavailable dependency confirmation")
        return None
    return operation if operation["status"] == "needs_confirmation" else None


async def install_confirmed_update(
    loader,
    source,
    operation,
    *,
    files_only=False,
):
    """Preserve current data when continuing a downloaded dependency review."""
    import tempfile

    from ..components import service as components
    from ..components.runtime_updates import preserve_candidate_data
    from ..components.update import ComponentUpdatePlan, ComponentUpdater
    from ..update_policy import DEFAULT_PRESERVE_PATHS

    plugin_id = operation["plugin_id"]
    signed = components._load_pending_records().get(plugin_id, {})
    downloaded = _records().get(plugin_id, {})
    matching = any(
        pending.get("dependency_operation_id") == operation["id"]
        for pending in (signed, downloaded)
    )
    install = (
        loader.install_plugin_files
        if files_only
        else loader.load_plugin_from_path
    )
    if not matching:
        return await install(source, force=operation["force"])
    _, destination = loader._install_paths(plugin_id, None)
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={plugin_id},
        core_version="0.0.0",
        backup_root=destination.parent.parent / "components" / "backups",
    )
    version = json.loads((source / "plugin.json").read_text(encoding="utf-8"))[
        "version"
    ]
    preserve = (
        (*DEFAULT_PRESERVE_PATHS, "visualization/data")
        if plugin_id == "ugsci"
        else DEFAULT_PRESERVE_PATHS
    )
    plan = ComponentUpdatePlan(
        plugin_id,
        None,
        version,
        "full",
        "",
        "",
        "",
        preserve,
        None,
    )
    temporary = Path(
        await asyncio.to_thread(
            tempfile.mkdtemp,
            prefix="qwenpaw-approved-update-",
        ),
    )
    candidate = temporary / "candidate"
    try:
        await asyncio.to_thread(shutil.copytree, source, candidate)
        await asyncio.to_thread(
            preserve_candidate_data,
            updater,
            plan,
            destination,
            candidate,
        )
        return await install(candidate, force=operation["force"])
    finally:
        await loader.cleanup_preparation_source(temporary)
