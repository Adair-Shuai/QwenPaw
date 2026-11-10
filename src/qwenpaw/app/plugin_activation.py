# -*- coding: utf-8 -*-
"""Reconcile startup candidates through the normal plugin lifecycle."""

from ..utils.io_utils import run_sync_io
from .._version_compat import check_plugin_version_compat
from ..plugins.settings import is_plugin_enabled
from ..plugins.lifecycle import PluginState


def _disabled_candidate(loader, plugin_id):
    for manifest, path in loader.discover_plugins():
        if manifest.id == plugin_id:
            compatible, _ = check_plugin_version_compat(manifest)
            if not compatible:
                return None
            # Validate the package description without importing disabled code.
            try:
                root = path.resolve()
                for entry in manifest.entry.model_dump().values():
                    if not isinstance(entry, str) or not entry.strip():
                        continue
                    candidate = (root / entry).resolve()
                    if (
                        not candidate.is_relative_to(root)
                        or not candidate.is_file()
                    ):
                        return None
                loader.backend_resolver.resolve(path, manifest)
                return manifest, path
            except (OSError, ValueError, TypeError, RuntimeError):
                return None
    return None


async def reconcile_plugin_activation(
    loader,
    plugin_id,
    *,
    finalize,
    rollback,
    config=None,
):
    """Commit healthy/disabled candidates or restore only after quiescence.

    The lock also excludes a UI reload between stopping a candidate and
    restoring its files. Failed stop/finalization leaves recovery evidence
    intact for the next process; it must never force-remove runtime owners.
    """
    async with loader.plugin_lifecycle(plugin_id):
        record = loader.get_loaded_plugin(plugin_id)
        instance = loader.lifecycle.get_instance(plugin_id)
        healthy = (
            record is not None and record.enabled and record.status == "active"
        )
        if healthy:
            await run_sync_io(finalize)
            return True
        disabled_candidate = (
            record is None and not is_plugin_enabled(config)
        ) or (
            record is not None
            and record.global_enabled is False
            and not record.enabled
            and record.status in {"inactive", "registered"}
            and (
                instance is None
                or (
                    not instance.activated
                    and instance.state is not PluginState.FAILED
                )
            )
        )
        if disabled_candidate:
            config = {**(config or {}), "enabled": False}
        # A disabled public record (or no record) does not prove that a prior
        # generation released its ledger, preparation task or runtime leases.
        report = await loader.quiesce_for_recovery(plugin_id)
        if not report.clean or not report.quiescent or report.needs_restart:
            return False
        if disabled_candidate:
            candidate = await run_sync_io(
                _disabled_candidate,
                loader,
                plugin_id,
            )
            if candidate is not None:
                if record is not None:
                    # Restore static discovery after draining old custody.
                    # Disabled Python definitions never import; descriptor
                    # adapters rebuild metadata without starting a worker.
                    current = await loader.load_plugin(
                        candidate[0],
                        candidate[1],
                        {**(config or {}), "enabled": False},
                        activate=False,
                    )
                    if (
                        current.global_enabled is not False
                        or current.enabled
                        or current.status not in {"inactive", "registered"}
                    ):
                        return False
                await run_sync_io(finalize)
                return True
        restored = await run_sync_io(rollback)
        if restored is not False:
            discovered = await run_sync_io(loader.discover_plugins)
            previous = next(
                (
                    (manifest, path)
                    for manifest, path in discovered
                    if manifest.id == plugin_id
                ),
                None,
            )
            if previous is not None and is_plugin_enabled(config):
                await loader.load_plugin(previous[0], previous[1], config)
        return False
