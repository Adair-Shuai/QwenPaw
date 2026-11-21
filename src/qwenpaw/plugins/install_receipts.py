# -*- coding: utf-8 -*-
"""Durable evidence of a successful explicit plugin installation."""

import hashlib
import json
import re
from pathlib import Path
from uuid import uuid4

from ..utils.io_utils import write_json_atomic

INSTALL_COMMIT = ".plugin-install-commit.json"


def plugin_tree_digest(directory: Path) -> str:
    """Bind installed source and manifest, excluding host/cache metadata."""
    digest = hashlib.sha256()
    for path in sorted(directory.rglob("*")):
        if path.is_symlink():
            raise ValueError(
                "Plugin installation evidence cannot follow links",
            )
        relative = path.relative_to(directory)
        if (
            not path.is_file()
            or "__pycache__" in relative.parts
            or path.suffix == ".pyc"
            or any(part.startswith(".") for part in relative.parts)
        ):
            continue
        digest.update(relative.as_posix().encode())
        digest.update(b"\0")
        digest.update(path.read_bytes())
    return digest.hexdigest()


def write_install_commit(
    directory: Path,
    plugin_id: str,
    *,
    channel_cleanup_pending: bool = False,
) -> None:
    """Publish only after explicit installation and post-load work commit."""
    receipt = {
        "schema": 1,
        "plugin_id": plugin_id,
        "transaction": uuid4().hex,
        "digest": plugin_tree_digest(directory),
    }
    if channel_cleanup_pending:
        receipt["channel_cleanup_pending"] = True
    write_json_atomic(directory / INSTALL_COMMIT, receipt)


def finish_channel_cleanup(directory: Path) -> None:
    """Acknowledge cleanup without issuing a new installation transaction."""
    path = directory / INSTALL_COMMIT
    receipt = json.loads(path.read_text(encoding="utf-8"))
    if receipt.pop("channel_cleanup_pending", False):
        write_json_atomic(path, receipt)


def has_install_commit(
    directory: Path,
    plugin_id: str,
    *,
    channel_cleanup_pending: bool = False,
) -> bool:
    """Authorize reconciliation only while the receipt matches its source."""
    try:
        value = json.loads(
            (directory / INSTALL_COMMIT).read_text(encoding="utf-8"),
        )
        return (
            isinstance(value, dict)
            and type(value.get("schema")) is int
            and value["schema"] == 1
            and value.get("plugin_id") == plugin_id
            and isinstance(value.get("transaction"), str)
            and re.fullmatch(r"[a-f0-9]{32}", value["transaction"]) is not None
            and (
                not channel_cleanup_pending
                or value.get("channel_cleanup_pending") is True
            )
            and value.get("digest") == plugin_tree_digest(directory)
        )
    except (OSError, ValueError):
        return False
