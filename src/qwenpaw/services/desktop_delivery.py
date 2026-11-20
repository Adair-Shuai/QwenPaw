# -*- coding: utf-8 -*-
"""Bounded, session-owned copies for opening delivered bytes on this computer.
"""

from __future__ import annotations

import hashlib
import tempfile
import threading
import uuid
from pathlib import Path

from .desktop_associations import open_file
from .reveal_file import open_in_file_manager

MAX_FILE_BYTES = 32 * 1024 * 1024
_files: dict[str, tuple[tuple, tempfile.TemporaryDirectory, Path, bytes]] = {}
_lock = threading.RLock()


def stage_file(owner: tuple, name: str, content: bytes) -> dict:
    if (
        not name
        or len(name) > 240
        or name.strip(" .") != name
        or any(ord(c) < 32 or c in '\\/:*?"<>|' for c in name)
    ):
        raise ValueError("Invalid delivery filename")
    stem = name.split(".")[0].upper()
    if stem in {"CON", "PRN", "AUX", "NUL", "CONIN$", "CONOUT$"} or (
        len(stem) == 4 and stem[:3] in {"COM", "LPT"} and stem[3].isdigit()
    ):
        raise ValueError("Reserved delivery filename")
    if len(content) > MAX_FILE_BYTES:
        raise ValueError("Delivery file exceeds 32 MiB")
    digest = hashlib.sha256(content).digest()
    with _lock:
        for token, (
            existing_owner,
            _,
            path,
            existing_digest,
        ) in _files.items():
            if (
                existing_owner == owner
                and path.name == name
                and existing_digest == digest
                and path.is_file()
                and hashlib.sha256(path.read_bytes()).digest() == digest
            ):
                return {"token": token, "fileName": name}
        if (
            len(_files) >= 128
            or sum(
                entry[2].stat().st_size
                for entry in _files.values()
                if entry[2].is_file()
            )
            + len(content)
            > 512 * 1024 * 1024
        ):
            raise ValueError("Delivery opening cache is full")
        # The delivery token owns this directory until eviction.
        # pylint: disable-next=consider-using-with
        directory = tempfile.TemporaryDirectory(
            prefix="ugsci-delivery-",
            ignore_cleanup_errors=True,
        )
        path = Path(directory.name) / name
        path.write_bytes(content)
        path.chmod(0o444)
        token = uuid.uuid4().hex
        _files[token] = (owner, directory, path, digest)
        return {"token": token, "fileName": name}


def act_on_file(
    owner: tuple,
    token: str,
    action: str,
    application_id: str | None,
) -> None:
    with _lock:
        entry = _files.get(token)
        if not entry or entry[0] != owner:
            raise FileNotFoundError("Delivery file not found")
        _, directory, path, digest = entry
        if (
            path.is_symlink()
            or path.parent.resolve() != Path(directory.name).resolve()
            or hashlib.sha256(path.read_bytes()).digest() != digest
        ):
            raise ValueError(
                "Staged delivery changed; reopen the archived version",
            )
        if action == "reveal":
            open_in_file_manager(path)
        elif action == "open":
            open_file(path, application_id)
        else:
            raise ValueError("Unsupported delivery action")
