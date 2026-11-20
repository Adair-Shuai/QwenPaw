# -*- coding: utf-8 -*-
"""Bounded inspection of redistributable payload, including nested wheels.

This is a release gate for common mistakes, not a proof that code is safe.
Scientific library data and public certificates are permitted inside wheels.
"""

import io
from pathlib import Path
import re
import stat
import zipfile

from .models import relative_path

_SECRET = re.compile(
    rb"-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE"
    rb" KEY-----\s+[A-Za-z0-9+/=]{32,}"
    rb"|\b(?:ghp_|gho_|ghu_|ghs_)[A-Za-z0-9]{36}\b"
    rb"|\bAKIA[A-Z0-9]{16}\b"
    rb"|(?i:(?:api[_-]?key|access[_-]?token|client[_-]?secret)"
    rb"\s*[=:]\s*[\"'](?:sk-|github_pat_)[A-Za-z0-9_-]{24,})",
)


def private_path(name: str, *, nested=False):
    parts = name.lower().split("/")
    denied = {
        ".git",
        ".venv",
        "venv",
        "node_modules",
        "workspaces",
        "sessions",
        "memory",
        "logs",
        ".ssh",
        ".aws",
        "credentials.yaml",
        "credentials.json",
    }
    if not nested:
        denied |= {"data", "__pycache__"}
    return any(
        p in denied
        or p.startswith(".env")
        or p.endswith((".key", ".sqlite", ".sqlite3"))
        for p in parts
    )


def inspect_payload(root: Path):
    budget = {"bytes": 0, "files": 0}

    def inspect(name, data, depth=0):
        budget["files"] += 1
        budget["bytes"] += len(data)
        if budget["files"] > 100000 or budget["bytes"] > 2 * 1024**3:
            raise ValueError("Expanded dependency inspection exceeds limit")
        if private_path(name, nested=depth > 0):
            raise ValueError(f"Private file in release: {name}")
        if _SECRET.search(data):
            # Never echo the matched value, even in a build log.
            raise ValueError(f"Possible credential in release file: {name}")
        if name.lower().endswith((".whl", ".zip", ".npz")):
            if depth >= 3:
                raise ValueError(
                    "Nested archive inspection exceeds depth limit",
                )
            with zipfile.ZipFile(io.BytesIO(data)) as archive:
                infos = archive.infolist()
                if (
                    len(infos) > 100000
                    or sum(i.file_size for i in infos) + budget["bytes"]
                    > 2 * 1024**3
                ):
                    raise ValueError(
                        "Expanded dependency inspection exceeds limit",
                    )
                seen = set()
                for info in infos:
                    path = relative_path(info.filename.rstrip("/"))
                    if path.casefold() in seen or stat.S_ISLNK(
                        info.external_attr >> 16,
                    ):
                        raise ValueError(
                            "Linked or duplicate dependency member",
                        )
                    seen.add(path.casefold())
                    if not info.is_dir():
                        inspect(path, archive.read(info), depth + 1)

    for path in root.rglob("*"):
        if path.is_file():
            inspect(path.relative_to(root).as_posix(), path.read_bytes())
