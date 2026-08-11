# -*- coding: utf-8 -*-
"""Filename normalization and content-addressed chat upload storage."""

from __future__ import annotations

import hashlib
import re
import unicodedata
from pathlib import Path

_INTERNAL_UPLOAD_PREFIX_RE = re.compile(
    r"^(?:(?:[0-9a-fA-F]{32}|[0-9a-fA-F]{64})_)+",
)
_MAX_STORED_DISPLAY_NAME_LENGTH = 120
_MAX_FILENAME_COMPONENT_BYTES = 255
_WINDOWS_SAFE_PATH_LENGTH = 240


def _safe_filename(name: str) -> str:
    """Return a normalized display filename without internal ID prefixes."""
    normalized = unicodedata.normalize("NFC", name or "file")
    base = Path(normalized).name
    base = _INTERNAL_UPLOAD_PREFIX_RE.sub("", base)
    return re.sub(r"[^\w.\-]", "_", base)[:200] or "file"


def _store_console_upload(
    media_dir: Path,
    data: bytes,
    safe_name: str,
) -> tuple[Path, str, bool]:
    """Store one content-addressed upload and reuse identical content."""
    digest = hashlib.sha256(data).hexdigest()
    existing = next(
        (
            candidate
            for candidate in media_dir.glob(f"{digest}_*")
            if candidate.is_file()
        ),
        None,
    )
    if existing is not None:
        return existing.resolve(), digest, True

    resolved_media_dir = media_dir.resolve()
    path_budget = (
        _WINDOWS_SAFE_PATH_LENGTH
        - len(str(resolved_media_dir))
        - len(digest)
        - 2
    )
    stored_display_name = _truncate_filename(
        safe_name,
        min(_MAX_STORED_DISPLAY_NAME_LENGTH, max(path_budget, 1)),
        max_bytes=_MAX_FILENAME_COMPONENT_BYTES - len(digest) - 1,
    )
    path = (resolved_media_dir / f"{digest}_{stored_display_name}").resolve()
    try:
        with path.open("xb") as upload_file:
            upload_file.write(data)
    except FileExistsError:
        return path, digest, True
    return path, digest, False


def _truncate_filename(
    name: str,
    max_length: int,
    *,
    max_bytes: int | None = None,
) -> str:
    """Truncate a filename by characters and UTF-8 bytes, preserving suffix."""
    if len(name) <= max_length and (
        max_bytes is None or len(name.encode("utf-8")) <= max_bytes
    ):
        return name
    suffix = Path(name).suffix
    suffix_bytes = len(suffix.encode("utf-8"))
    if len(suffix) >= max_length or (
        max_bytes is not None and suffix_bytes >= max_bytes
    ):
        return _truncate_utf8(name[:max_length], max_bytes)
    stem = Path(name).stem[: max_length - len(suffix)]
    if max_bytes is not None:
        stem = _truncate_utf8(stem, max_bytes - suffix_bytes)
    return f"{stem}{suffix}"


def _truncate_utf8(value: str, max_bytes: int | None) -> str:
    """Return the longest prefix that fits within a UTF-8 byte budget."""
    if max_bytes is None or len(value.encode("utf-8")) <= max_bytes:
        return value
    encoded = value.encode("utf-8")[:max_bytes]
    return encoded.decode("utf-8", errors="ignore")
