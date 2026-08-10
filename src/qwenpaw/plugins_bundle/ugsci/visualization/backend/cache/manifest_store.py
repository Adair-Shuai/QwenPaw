# -*- coding: utf-8 -*-
"""Manifest store — atomic manifest read/write with fingerprint-based caching.

Ensures manifest.json is never corrupted by concurrent writes or
process crashes. Uses temp-file + atomic rename pattern.
"""

from __future__ import annotations

import json
import logging
import os
import tempfile
import threading
from pathlib import Path
from typing import Any

from .layout import CacheLayout

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.cache.manifest")


class ManifestStore:
    """Manages manifest.json with atomic writes and cache integration."""

    def __init__(self, bin_dir: Path, cache: CacheLayout) -> None:
        self.bin_dir = bin_dir
        self.bin_dir.mkdir(parents=True, exist_ok=True)
        self.manifest_path = bin_dir / "manifest.json"
        self.cache = cache
        self._lock = threading.RLock()

    def read(self) -> dict[str, Any]:
        """Read manifest with error recovery."""
        with self._lock:
            try:
                if self.manifest_path.exists():
                    return json.loads(self.manifest_path.read_text())
            except (json.JSONDecodeError, OSError):
                logger.warning("Manifest unreadable or corrupted, starting fresh")
            return {"version": 1, "datasets": []}

    def upsert(self, dataset_info: dict[str, Any]) -> None:
        """Insert or replace a dataset in the manifest (atomic)."""
        with self._lock:
            manifest = self.read()

            existing_ids = {d["id"] for d in manifest["datasets"]}
            if dataset_info["id"] in existing_ids:
                manifest["datasets"] = [
                    dataset_info if d["id"] == dataset_info["id"] else d
                    for d in manifest["datasets"]
                ]
            else:
                manifest["datasets"].insert(0, dataset_info)
            self._atomic_write(manifest)

    def remove(self, dataset_id: str) -> bool:
        """Remove a dataset from the manifest."""
        with self._lock:
            manifest = self.read()
            before = len(manifest["datasets"])
            manifest["datasets"] = [
                d for d in manifest["datasets"] if d["id"] != dataset_id
            ]
            if len(manifest["datasets"]) < before:
                self._atomic_write(manifest)
                return True
            return False

    def get_dataset(self, dataset_id: str) -> dict[str, Any] | None:
        """Get a single dataset by ID."""
        for ds in self.read().get("datasets", []):
            if ds["id"] == dataset_id:
                return ds
        return None

    def _atomic_write(self, data: dict) -> None:
        """Write manifest atomically: temp file + rename."""
        content = json.dumps(data, indent=2, ensure_ascii=False)
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                dir=self.bin_dir,
                prefix=".manifest_",
                suffix=".tmp",
                delete=False,
            ) as tmp:
                tmp.write(content)
                tmp_path = Path(tmp.name)

            os.replace(tmp_path, self.manifest_path)
        except Exception as exc:
            logger.error("Atomic manifest write failed: %s", exc)
            if "tmp_path" in locals() and tmp_path.exists():
                tmp_path.unlink()
            raise
