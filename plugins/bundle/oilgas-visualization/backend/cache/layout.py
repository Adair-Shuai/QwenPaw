# -*- coding: utf-8 -*-
"""Cache path layout manager.

Determines where cached datasets, manifests, and resources are stored.
Uses content fingerprints to avoid redundant conversions.

Cache structure:
  <runtime>/cache/oilgas-visualization/
  └── datasets/<fingerprint>/
      ├── manifest.json
      ├── resources/
      ├── benchmark.json
      └── import-meta.json
"""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.cache.layout")


class CacheLayout:
    """Manages cache directory structure."""

    def __init__(self, base_dir: Path) -> None:
        self.base = base_dir / "cache" / "oilgas-visualization"
        self.datasets = self.base / "datasets"
        self.datasets.mkdir(parents=True, exist_ok=True)

    def dataset_dir(self, fingerprint: str) -> Path:
        """Get the cache directory for a specific dataset fingerprint."""
        d = self.datasets / fingerprint
        d.mkdir(parents=True, exist_ok=True)
        return d

    def resources_dir(self, fingerprint: str) -> Path:
        """Get the resources subdirectory for a fingerprint."""
        d = self.dataset_dir(fingerprint) / "resources"
        d.mkdir(parents=True, exist_ok=True)
        return d

    def manifest_path(self, fingerprint: str) -> Path:
        """Path to the cached manifest for a fingerprint."""
        return self.dataset_dir(fingerprint) / "manifest.json"

    def benchmark_path(self, fingerprint: str) -> Path:
        """Path to the cached benchmark for a fingerprint."""
        return self.dataset_dir(fingerprint) / "benchmark.json"

    def import_meta_path(self, fingerprint: str) -> Path:
        """Path to the import metadata for a fingerprint."""
        return self.dataset_dir(fingerprint) / "import-meta.json"

    def compute_fingerprint(
        self,
        file_path: Path,
        converter_version: str = "0.1.0",
        options: dict | None = None,
    ) -> str:
        """Compute a content-based fingerprint for a source file.

        Includes file size, modification time, and content SHA-256.
        """
        import os
        stat = file_path.stat()
        h = hashlib.sha256()
        h.update(f"{stat.st_size}:{stat.st_mtime}:".encode())
        h.update(f"converter={converter_version}:".encode())
        if options:
            h.update(str(sorted(options.items())).encode())
        # Sample content hash (first + last 1MB for large files)
        with open(file_path, "rb") as f:
            chunk = f.read(1024 * 1024)
            h.update(chunk)
            if stat.st_size > 2 * 1024 * 1024:
                f.seek(-1024 * 1024, 2)  # type: ignore[arg-type]
                h.update(f.read(1024 * 1024))
            else:
                rest = f.read()
                if rest:
                    h.update(rest)
        return h.hexdigest()[:16]  # 16-char fingerprint

    def has_cached(self, fingerprint: str) -> bool:
        """Check if a cached dataset exists and is complete."""
        manifest = self.manifest_path(fingerprint)
        if not manifest.exists():
            return False
        try:
            import json
            data = json.loads(manifest.read_text())
            return bool(data.get("files"))
        except Exception:
            return False

    def clear_all(self) -> int:
        """Clear all cached datasets. Returns count removed."""
        count = 0
        if self.datasets.exists():
            for d in self.datasets.iterdir():
                if d.is_dir():
                    import shutil
                    shutil.rmtree(d)
                    count += 1
        return count

    def clear_dataset(self, fingerprint: str) -> bool:
        """Clear a single cached dataset."""
        d = self.dataset_dir(fingerprint)
        if d.exists():
            import shutil
            shutil.rmtree(d)
            return True
        return False
