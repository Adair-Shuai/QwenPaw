# -*- coding: utf-8 -*-
"""Security utilities for safe file path handling.

Prevents path traversal, symlink escapes, and arbitrary absolute path access.
All file operations in the import/export pipeline must go through these checks.
"""

from __future__ import annotations

import hashlib
import logging
import os
import re
from pathlib import Path

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.security")

# Maximum total decompressed size for zip uploads (2 GB)
MAX_UNCOMPRESSED_SIZE = 2 * 1024 * 1024 * 1024
# Maximum number of files in a zip
MAX_ZIP_FILE_COUNT = 10_000


def safe_resolve(path: Path, base_dir: Path) -> Path | None:
    """Resolve *path* relative to *base_dir*, rejecting escapes.

    Returns the resolved path if it is within *base_dir*, or None if
    the path would escape the allowed directory.

    Checks:
    - Resolves ``..`` segments
    - Rejects symlinks that point outside *base_dir*
    - Rejects absolute paths that are not under *base_dir*
    """
    try:
        base_resolved = base_dir.resolve()
        full = (base_dir / path).resolve()
        # Check the resolved path is within base
        if not full.is_relative_to(base_resolved):
            logger.warning("Path escape blocked: %s (resolved to %s)", path, full)
            return None
        return full
    except Exception as exc:
        logger.warning("Path resolution failed for %s: %s", path, exc)
        return None


def sanitize_filename(filename: str) -> str | None:
    """Sanitize a user-provided filename for safe storage.

    Returns a safe filename or None if the filename is dangerous.
    """
    if not filename or filename in (".", ".."):
        return None
    # Reject path separators
    if "/" in filename or "\\" in filename:
        return None
    # Reject null bytes
    if "\x00" in filename:
        return None
    # Strip leading dots (hidden files / relative paths)
    safe = filename.lstrip(".")
    if not safe:
        return None
    # Limit length
    if len(safe) > 255:
        safe = safe[-255:]
    return safe


def sanitize_identifier(value: str, default: str = "dataset") -> str:
    """Return a filesystem-safe, stable identifier for generated resources."""
    cleaned = re.sub(r"[^A-Za-z0-9_-]+", "_", value.strip()).strip("_-")
    return (cleaned[:80] or default)


def compute_file_fingerprint(file_path: Path) -> str:
    """Compute a SHA-256 fingerprint of a file.

    Uses chunked reading for large files.
    Includes file size and modification time for quick mismatch.
    """
    stat = file_path.stat()
    h = hashlib.sha256()
    h.update(f"{stat.st_size}:{stat.st_mtime}:".encode())
    with open(file_path, "rb") as f:
        while True:
            chunk = f.read(8 * 1024 * 1024)  # 8 MB chunks
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def compute_content_hash(data: bytes) -> str:
    """Compute SHA-256 of raw bytes (for uploaded content)."""
    return hashlib.sha256(data).hexdigest()
