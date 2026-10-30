# -*- coding: utf-8 -*-
"""Bounded, read-only snapshots without following links or user Git state."""

from __future__ import annotations

import hashlib
import os
import stat
from dataclasses import dataclass, field
from pathlib import Path

from ..checkpoints.policy import is_qwenpaw_state_path

MAX_FILE_BYTES = 32 * 1024 * 1024
MAX_TOTAL_BYTES = 128 * 1024 * 1024
MAX_FILES = 2000
MAX_TEXT_BYTES = 2 * 1024 * 1024
_SKIP_DIRS = {
    ".git",
    ".hg",
    ".svn",
    ".turn-files",
    "node_modules",
    ".venv",
    "venv",
    "__pycache__",
    ".cache",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".next",
    ".tox",
    ".ssh",
    ".aws",
    ".azure",
}
_INTERNAL_DIRS = {"harnesses", "config", "logs", "cache", "caches"}


def linked(info: os.stat_result) -> bool:
    return stat.S_ISLNK(info.st_mode) or bool(
        getattr(info, "st_file_attributes", 0) & 0x400,
    )


def safe_path(path: Path) -> Path:
    """Reject linked path components, including Windows junctions."""
    path = Path(os.path.abspath(path))
    for current in (*reversed(path.parents), path):
        try:
            if linked(current.lstat()):
                raise OSError("Symbolic links and reparse points are excluded")
        except FileNotFoundError:
            continue
    return path


def excluded(parts: tuple[str, ...], *, workspace: bool) -> bool:
    lowered = tuple(part.casefold() for part in parts)
    if any(part in _SKIP_DIRS for part in lowered):
        return True
    name = lowered[-1] if lowered else ""
    if (
        name == ".env"
        or name.startswith(".env.")
        or name.startswith(("credentials", "secrets.", "secret."))
        or name in {"id_rsa", "id_ed25519", ".netrc", ".npmrc", ".pypirc"}
        or name.endswith((".pem", ".key", ".p12", ".pfx", ".pyc"))
    ):
        return True
    return workspace and (
        (bool(lowered) and lowered[0] in _INTERNAL_DIRS)
        or is_qwenpaw_state_path("/".join(parts))
    )


@dataclass(frozen=True)
class Root:
    label: str
    directory: Path
    prefix: str = ""

    def key(self, relative: str) -> tuple[str, str]:
        return self.label, f"{self.prefix}{relative}"


def normalize_roots(roots: list[tuple[str, Path]]) -> tuple[Root, ...]:
    result: list[Root] = []
    for label, path in roots:
        # The host may restrict the workspace scan to its output directory.
        root = Root(
            "workspace" if label == "output" else label,
            Path(os.path.abspath(path)),
            "output/" if label == "output" else "",
        )
        if root not in result:
            result.append(root)
    return tuple(result)


@dataclass
class FileState:
    size: int
    fingerprint: str
    content: bytes | None
    binary: bool = False
    uncertain: bool = False


@dataclass
class Snapshot:
    files: dict[tuple[str, str], FileState] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
    incomplete: bool = False
    bytes_read: int = 0
    # Missing paths below these prefixes cannot safely be called deleted.
    unreadable: set[tuple[str, str]] = field(default_factory=set)

    def warn(self, message: str) -> None:
        self.incomplete = True
        if message not in self.warnings and len(self.warnings) < 100:
            self.warnings.append(message)


def text_content(data: bytes) -> str | None:
    if b"\x00" in data:
        return None
    try:
        return data.decode("utf-8-sig")
    except UnicodeError:
        return None


def read_file(path: Path, snapshot: Snapshot, display: str) -> FileState:
    """Read stable bytes, marking changing or oversized files incomplete."""
    safe_path(path)
    before = path.lstat()
    if linked(before) or not stat.S_ISREG(before.st_mode):
        raise OSError("Only regular files are captured")
    fingerprint = f"metadata:{before.st_size}:{before.st_mtime_ns}"
    if before.st_size > MAX_FILE_BYTES:
        snapshot.warn(f"File exceeds snapshot size limit: {display}")
        return FileState(before.st_size, fingerprint, None, uncertain=True)
    if snapshot.bytes_read + before.st_size > MAX_TOTAL_BYTES:
        snapshot.warn(
            "Snapshot byte budget reached; some contents unavailable",
        )
        return FileState(before.st_size, fingerprint, None, uncertain=True)
    flags = os.O_RDONLY | getattr(os, "O_BINARY", 0)
    flags |= getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags)
    with os.fdopen(fd, "rb") as stream:
        opened = os.fstat(stream.fileno())
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            raise OSError("File changed before snapshot read")
        data = stream.read(MAX_FILE_BYTES + 1)
        after = os.fstat(stream.fileno())
    safe_path(path)
    current = path.lstat()

    def identity(value):
        return (
            value.st_dev,
            value.st_ino,
            value.st_size,
            value.st_mtime_ns,
        )

    if (
        len(data) > MAX_FILE_BYTES
        or len(data) != before.st_size
        or identity(before) != identity(after)
        or identity(before) != identity(current)
    ):
        snapshot.warn(f"File changed while reading: {display}")
        return FileState(current.st_size, fingerprint, None, uncertain=True)
    snapshot.bytes_read += len(data)
    return FileState(
        len(data),
        hashlib.sha256(data).hexdigest(),
        data,
        binary=text_content(data) is None,
    )


def scan(roots: tuple[Root, ...]) -> Snapshot:
    snapshot = Snapshot()
    visited = 0
    for root in roots:
        pending = [(root.directory, "")]
        while pending:
            directory, relative = pending.pop()
            try:
                safe_path(directory)
                # An output root may not exist before the first generated file.
                if not directory.exists():
                    continue
                with os.scandir(directory) as iterator:
                    entries = []
                    for entry in iterator:
                        visited += 1
                        if visited > MAX_FILES * 10:
                            snapshot.warn("Directory scan limit reached")
                            snapshot.unreadable.update(
                                item.key("") for item in roots
                            )
                            return snapshot
                        entries.append(entry)
                entries.sort(key=lambda entry: entry.name.casefold())
                for entry in entries:
                    rel = f"{relative}{entry.name}"
                    logical = f"{root.prefix}{rel}"
                    if excluded(
                        tuple(logical.split("/")),
                        workspace=root.label == "workspace",
                    ):
                        continue
                    try:
                        info = entry.stat(follow_symlinks=False)
                        if linked(info):
                            snapshot.warn(f"Skipped linked path: {logical}")
                            snapshot.unreadable.add(root.key(rel))
                            continue
                        if stat.S_ISDIR(info.st_mode):
                            pending.append((Path(entry.path), rel + "/"))
                        elif stat.S_ISREG(info.st_mode):
                            if len(snapshot.files) >= MAX_FILES:
                                snapshot.warn("File count limit reached")
                                snapshot.unreadable.update(
                                    item.key("") for item in roots
                                )
                                return snapshot
                            snapshot.files[root.key(rel)] = read_file(
                                Path(entry.path),
                                snapshot,
                                logical,
                            )
                    except OSError:
                        snapshot.warn(f"Unable to read file: {logical}")
                        snapshot.unreadable.add(root.key(rel))
            except OSError:
                snapshot.warn(
                    f"Unable to scan directory: {root.label}/{relative}",
                )
                snapshot.unreadable.add(root.key(relative))
    return snapshot
