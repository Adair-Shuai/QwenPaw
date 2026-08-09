# -*- coding: utf-8 -*-
"""Resource store — manages binary resource files with metadata.

Each resource file has an associated descriptor with:
- id, role, url, mediaType, encoding, dtype, shape, byteLength, sha256
This matches the ResourceDescriptor contract in the implementation plan.
"""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.cache.resource")


class ResourceStore:
    """Manages binary resource files and their descriptors."""

    def __init__(self, bin_dir: Path) -> None:
        self.bin_dir = bin_dir

    def get_path(self, filename: str) -> Path:
        """Get the full path for a resource filename."""
        candidate = (self.bin_dir / filename).resolve()
        root = self.bin_dir.resolve()
        if not candidate.is_relative_to(root) or candidate.parent != root:
            raise ValueError(f"Invalid resource filename: {filename!r}")
        return candidate

    def exists(self, filename: str) -> bool:
        """Check if a resource file exists."""
        return self.get_path(filename).exists()

    def size(self, filename: str) -> int:
        """Get the byte size of a resource."""
        path = self.get_path(filename)
        return path.stat().st_size if path.exists() else 0

    def sha256(self, filename: str) -> str:
        """Compute SHA-256 of a resource file."""
        path = self.get_path(filename)
        if not path.exists():
            return ""
        h = hashlib.sha256()
        with open(path, "rb") as f:
            while True:
                chunk = f.read(8 * 1024 * 1024)
                if not chunk:
                    break
                h.update(chunk)
        return h.hexdigest()

    def describe(
        self,
        filename: str,
        role: str,
        dtype: str = "float32",
        shape: list[int] | None = None,
        object_id: str | None = None,
    ) -> dict[str, Any]:
        """Build a ResourceDescriptor for a file.

        Matches the ResourceDescriptor interface from Section 5.3:
        id, role, url, mediaType, encoding, compression,
        dtype, shape, byteOrder, byteLength, sha256
        """
        size = self.size(filename)
        return {
            "id": filename,
            "role": role,
            "url": f"/resource/{filename}",
            "mediaType": "application/octet-stream",
            "encoding": "raw",
            "compression": "none",
            "dtype": dtype,
            "shape": shape or [],
            "byteOrder": "little",
            "byteLength": size,
            "sha256": "",  # Computed lazily for large files
            "objectId": object_id,
        }

    def delete(self, filename: str) -> bool:
        """Delete a resource file."""
        path = self.get_path(filename)
        if path.exists():
            path.unlink()
            return True
        return False
