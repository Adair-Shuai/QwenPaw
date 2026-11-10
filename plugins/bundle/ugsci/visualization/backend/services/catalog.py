# -*- coding: utf-8 -*-
"""Catalog publication, visibility, and resource cleanup services.

Callers supply their storage context; local imports and runtime simulation
results retain their existing roots and overlay precedence. Import-job locks
remain responsible for serializing publication with cancellation.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Protocol

from ..cache.catalog_state import CatalogState
from ..cache.resource_store import ResourceStore
from .datasets import dataset_resource_files

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.catalog")


class DatasetStore(Protocol):
    """Storage operations shared by local and overlaid runtime catalogs."""

    def read(self) -> dict:
        """Read the catalog manifest."""

    def get_dataset(self, dataset_id: str) -> dict | None:
        """Resolve one dataset in the catalog."""

    def upsert(self, dataset: dict) -> None:
        """Insert or replace one dataset."""

    def remove(self, dataset_id: str) -> bool:
        """Remove a dataset, returning whether it existed."""


class DatasetNotFound(LookupError):
    """The requested dataset is absent from this storage context."""


class DatasetCatalog:
    """Visibility and managed-resource cleanup for one storage context."""

    def __init__(
        self,
        manifest_store: DatasetStore,
        resource_store: ResourceStore,
        catalog_state: CatalogState,
    ) -> None:
        self.manifest_store = manifest_store
        self.resource_store = resource_store
        self.catalog_state = catalog_state

    @staticmethod
    def is_managed(ds: dict) -> bool:
        return bool((ds.get("metadata") or {}).get("managed"))

    def collect_cascade(self, dataset_id: str) -> list[dict]:
        datasets = list(self.manifest_store.read().get("datasets") or [])
        by_parent: dict[str, list[dict]] = {}
        for item in datasets:
            parent = str(
                (item.get("metadata") or {}).get("parent_dataset") or "",
            )
            if parent:
                by_parent.setdefault(parent, []).append(item)
        target = next(
            (item for item in datasets if item.get("id") == dataset_id),
            None,
        )
        if not target:
            return []
        ordered = [target]
        queue = [dataset_id]
        seen = {dataset_id}
        while queue:
            current = queue.pop(0)
            for child in by_parent.get(current, []):
                child_id = str(child.get("id") or "")
                if not child_id or child_id in seen:
                    continue
                seen.add(child_id)
                ordered.append(child)
                queue.append(child_id)
        return ordered

    def public_datasets(self, include_hidden: bool = False) -> list[dict]:
        hidden = set() if include_hidden else self.catalog_state.hidden_ids()
        return [
            ds
            for ds in self.manifest_store.read().get("datasets", [])
            if ds.get("id") not in hidden
        ]

    def remove_dataset_files(self, ds: dict) -> int:
        deleted = 0
        for filename in set(dataset_resource_files(ds).values()):
            try:
                deleted += int(self.resource_store.delete(filename))
            except ValueError:
                logger.warning(
                    "Skipped unsafe resource during cleanup: %s",
                    filename,
                )
        return deleted

    def delete_or_hide_dataset(self, dataset_id: str) -> dict[str, Any]:
        ds = self.manifest_store.get_dataset(dataset_id)
        if not ds:
            raise DatasetNotFound(f"Dataset not found: {dataset_id}")
        hidden: list[str] = []
        removed: list[str] = []
        deleted_files = 0
        for item in self.collect_cascade(dataset_id):
            item_id = str(item.get("id") or "")
            if not item_id:
                continue
            if self.is_managed(item):
                deleted_files += self.remove_dataset_files(item)
                self.manifest_store.remove(item_id)
                removed.append(item_id)
            else:
                hidden.append(item_id)
        if hidden:
            self.catalog_state.hide(hidden)
        return {
            "dataset_id": dataset_id,
            "hidden": hidden,
            "removed": removed,
            "deleted_files": deleted_files,
            "status": "removed" if dataset_id in removed else "hidden",
        }


def publish_derived(
    result: dict,
    source: dict,
    time_step: int,
    manifest_store: DatasetStore,
) -> None:
    metadata = result.setdefault("metadata", {})
    metadata.update(
        parent_dataset=source["id"],
        time_step=time_step,
        managed=True,
    )
    run_id = (source.get("metadata") or {}).get("simulation_run_id")
    if run_id:
        metadata["simulation_run_id"] = run_id
    result["properties"] = {
        key: {
            **value,
            "count": result.get(
                (
                    "n_vertices"
                    if value.get("association") == "point"
                    else "n_cells"
                ),
                0,
            ),
        }
        for key, value in (source.get("properties") or {}).items()
        if key in result.get("files", {}).get("scalars", {})
    }
    manifest_store.upsert(result)


def publish_manifest(bin_dir: Path, dataset_info: dict[str, Any]) -> None:
    """Publish a dataset atomically through the shared per-path store lock."""
    from ..cache.manifest_store import ManifestStore
    from ..cache.layout import CacheLayout

    cache = CacheLayout(bin_dir.parent)
    store = ManifestStore(bin_dir, cache)
    store.upsert(dataset_info)
