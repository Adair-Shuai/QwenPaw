# -*- coding: utf-8 -*-
"""Signed plugin hot updates and downloaded updates awaiting restart."""

# Reuse the internal update kernel and its transaction boundaries.
# pylint: disable=protected-access

from __future__ import annotations

import asyncio
from dataclasses import replace
import logging
from pathlib import Path
import re
import tempfile

from packaging.version import Version

from ..plugins.activity import PluginBusyError
from ..plugins.bundled import is_plugin_uninstalled
from ..plugins.errors import SDKRestartRequiredError
from ..plugins.downloaded_updates import pending_dependency_operation
from ..plugins.dependency_upgrade import (
    DependencyUpgradeRequired,
    install_with_upgrade,
)
from . import service as services
from .update import (
    ComponentUpdateError,
    ComponentUpdatePlan,
    _verify_signature_file,
)

logger = logging.getLogger(__name__)


def cached_pending_manifest(service, records):
    """Reverify a downloaded signed snapshot, allowing an offline restart."""
    cache_root = getattr(service.client, "cache_root", None)
    if cache_root is None:
        return None
    ordered = sorted(
        records.values(),
        key=lambda row: row["queued_at"],
        reverse=True,
    )
    for record in ordered:
        cache_id = record.get("manifest_cache", "")
        if not re.fullmatch(r"[0-9a-f]{64}", cache_id):
            continue
        root = cache_root / "manifests" / cache_id
        if root.is_symlink():
            continue
        try:
            return service.updater.load_manifest(
                root / "manifest.json",
                root / "manifest.json.sig",
            )
        except (OSError, ComponentUpdateError):
            logger.warning(
                "Downloaded update manifest is unavailable",
                exc_info=True,
            )
    return None


def unpin_pending(component, record, *, keep=None):
    """Release only cache entries acknowledged by the queue consumer."""
    cache = services.WORKING_DIR / "components" / "cache"
    for group, key in (
        ("manifests", "manifest_cache"),
        ("artifacts", "artifact_sha256"),
    ):
        digest = record.get(key, "")
        if re.fullmatch(r"[0-9a-f]{64}", digest) and digest != (
            keep or {}
        ).get(key):
            try:
                (cache / group / digest / f".pending-{component}").unlink(
                    missing_ok=True,
                )
            except OSError:
                logger.warning(
                    "Pending update cache release failed",
                    exc_info=True,
                )


def _download_full(service, manifest, plan):
    full = manifest["components"][plan.component]["full"]
    full_plan = replace(
        plan,
        artifact_kind="full",
        artifact_url=str(full["url"]),
        artifact_sha256=str(full["sha256"]),
        artifact_signature=str(full["signature"]),
    )
    archive = service.client.download_artifact(
        full_plan.artifact_url,
        sha256=full_plan.artifact_sha256,
        size=int(full["size"]),
        name=f"{plan.component}-{plan.target_version}-full.zip",
    )
    service.client.protected_paths.add(archive.parent)
    _verify_signature_file(
        archive,
        full_plan.artifact_signature,
        service.updater.public_key_b64,
    )
    return full_plan, archive


def _queue_downloaded(
    service,
    manifest,
    plans,
    *,
    confirmation=None,
    dependency_operation_id=None,
):
    """Queue only complete verified downloads and pin their offline inputs."""
    services._authorize_component_install()
    if service.client.manifest_cache_id:
        service.client.protected_paths.add(
            service.client.cache_root
            / "manifests"
            / service.client.manifest_cache_id,
        )
    downloaded = []
    for plan in plans:
        full_plan, archive = _download_full(service, manifest, plan)
        if not service.updater.is_directory_component(plan.component):
            with tempfile.TemporaryDirectory(
                prefix="qwenpaw-update-check-",
            ) as temporary:
                service.updater.prepare_full(
                    full_plan,
                    archive,
                    Path(temporary) / "candidate",
                    expected_files=manifest["components"][plan.component][
                        "files"
                    ],
                )
        downloaded.append(full_plan)
    cache_id = service.client.manifest_cache_id
    if not cache_id:
        raise ComponentUpdateError("verified update manifest was not cached")
    with services._pending_transaction():
        pending = services._load_pending_records()
        for plan in downloaded:
            previous = pending.get(plan.component, {})
            if previous.get("target_version") and Version(
                previous["target_version"],
            ) > Version(plan.target_version):
                continue
            record = services._new_pending_record()
            record.update(
                manifest_cache=cache_id,
                target_version=plan.target_version,
                artifact_sha256=plan.artifact_sha256,
                source=plan.artifact_url,
            )
            if confirmation:
                record["confirmation"] = confirmation
            if dependency_operation_id:
                record["dependency_operation_id"] = dependency_operation_id
            for group, digest in (
                ("manifests", cache_id),
                ("artifacts", plan.artifact_sha256),
            ):
                root = service.client.cache_root / group / digest
                (root / f".pending-{plan.component}").touch()
            pending[plan.component] = record
            unpin_pending(plan.component, previous, keep=record)
        services._store_pending_records(pending)


def preserve_candidate_data(updater, plan, destination, candidate):
    """Snapshot user data after old plugin resources become quiescent."""
    backup = updater._backup_component_data(plan, destination, destination)
    updater._restore_backup_to_staging(backup, candidate, plan)
    updater._prune_backups(backup)


async def _try_hot_update(service, manifest, plan, loader, destination):
    """Return a live result, or None when a fresh process is required."""
    component = plan.component
    full_plan, archive = await asyncio.to_thread(
        _download_full,
        service,
        manifest,
        plan,
    )
    temporary = Path(
        await asyncio.to_thread(
            tempfile.mkdtemp,
            prefix="qwenpaw-plugin-update-",
        ),
    )
    try:
        candidate = temporary / "candidate"
        await asyncio.to_thread(
            service.updater.prepare_full,
            full_plan,
            archive,
            candidate,
            expected_files=manifest["components"][component]["files"],
        )
        async with loader.plugin_lifecycle(component):
            _, current = await asyncio.to_thread(
                loader.read_source_manifest,
                destination,
            )
            if Version(current.version) >= Version(plan.target_version):
                return {
                    "component": component,
                    "queued": False,
                    "updated": False,
                    "reason": "up-to-date",
                }

            async def preserve(_plugin_id):
                await asyncio.to_thread(
                    preserve_candidate_data,
                    service.updater,
                    full_plan,
                    destination,
                    candidate,
                )

            if loader.get_loaded_plugin(component) is None:
                await preserve(component)
            try:
                record = await install_with_upgrade(
                    loader,
                    candidate,
                    install_dir=services.get_plugins_dir(),
                    force=True,
                    interrupt_tasks=False,
                    after_force_unload=preserve,
                )
            except (PluginBusyError, SDKRestartRequiredError):
                record = None
            except RuntimeError as error:
                if not (
                    getattr(error, "needs_restart", False)
                    or "needs_restart" in str(error)
                ):
                    raise
                record = None
        if record is not None:
            return {
                "component": component,
                "queued": False,
                "updated": True,
                "version": record.manifest.version,
                "loaded": record.status == "active" and record.enabled,
                "restart_required": record.update_needs_restart,
            }
    finally:
        await loader.cleanup_preparation_source(temporary)


async def update_component(
    component,
    loader,
    *,
    service=None,
    snapshot=None,
    background=False,
):
    """Hot-load a signed plugin or download its update for startup."""
    owns_service = service is None
    service = service or await asyncio.to_thread(services.configured_service)
    if service is None:
        raise ComponentUpdateError("component updates are not configured")
    try:
        services._authorize_component_install()
        manifest, raw_plans = snapshot or await asyncio.to_thread(
            service.snapshot,
        )
        if component not in service.updater.managed_components:
            raise ComponentUpdateError(
                f"component is not managed: {component}",
                reason="not_managed",
            )
        plans = [ComponentUpdatePlan(**row) for row in raw_plans]
        plan = next(
            (item for item in plans if item.component == component),
            None,
        )
        if plan is None:
            return {
                "component": component,
                "queued": False,
                "updated": False,
                "reason": "up-to-date",
            }
        destination = services.resolve_component_destination(
            services.get_plugins_dir(),
            component,
        )
        if not destination.is_dir() or is_plugin_uninstalled(
            component,
            plugins_dir=services.get_plugins_dir(),
            plugin_dir=destination,
        ):
            return {
                "component": component,
                "queued": False,
                "updated": False,
                "reason": "uninstalled",
            }
        deferred = [plan]
        pending = (
            await asyncio.to_thread(services._load_pending_records)
        ).get(component, {})
        operation = await pending_dependency_operation(
            loader,
            pending,
            plan.target_version,
            background=background,
        )
        if operation is not None:
            raise DependencyUpgradeRequired(operation)
        if loader is None or plan.migration:
            await asyncio.to_thread(
                _queue_downloaded,
                service,
                manifest,
                deferred,
            )
            return {
                "component": component,
                "queued": True,
                "downloaded": True,
                "restart_required": True,
            }
        try:
            applied = await _try_hot_update(
                service,
                manifest,
                plan,
                loader,
                destination,
            )
        except DependencyUpgradeRequired as error:
            await asyncio.to_thread(
                _queue_downloaded,
                service,
                manifest,
                deferred,
                confirmation="dependencies",
                dependency_operation_id=error.operation["id"],
            )
            if not background:
                raise
            return {
                "component": component,
                "queued": True,
                "downloaded": True,
                "restart_required": False,
                "requires_confirmation": True,
            }
        if applied is not None:
            if (
                applied.get("updated")
                and pending
                and Version(applied["version"])
                >= Version(pending.get("target_version", "0"))
            ):
                await asyncio.to_thread(
                    services._acknowledge_pending,
                    {component: pending},
                    {},
                )
            return applied
        await asyncio.to_thread(_queue_downloaded, service, manifest, deferred)
        return {
            "component": component,
            "queued": True,
            "downloaded": True,
            "restart_required": True,
        }
    finally:
        if owns_service:
            await asyncio.to_thread(service.client.close)
