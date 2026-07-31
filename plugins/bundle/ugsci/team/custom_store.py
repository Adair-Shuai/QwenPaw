# -*- coding: utf-8 -*-
"""Custom team definition storage for UGSci expert teams.

Stores user-defined team configurations (members, steps, orchestration
prompt) in the QwenPaw working directory so they survive service
restarts and are not affected by plugin upgrades (cf. BUG-009).

A custom team is registered via ``POST /api/ugsci/team/custom`` and
referenced in the slash command as ``@<team_id>`` — for example::

    /ugsci-team pipeline @my-team 完成储层评价

This avoids the team-name-with-spaces parsing problem (BUG-004) because
``team_id`` is always a single whitespace-free token.
"""

from __future__ import annotations

import json
import logging
import re
import threading
import time
from pathlib import Path
from typing import Any

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.team")

_lock = threading.Lock()

# Maximum number of custom teams to keep (oldest pruned)
_MAX_STORED_TEAMS = 100


def _store_dir() -> Path:
    """Return the custom team storage directory.

    Uses QwenPaw's ``WORKING_DIR`` so data is correctly placed under
    ``QWENPAW_WORKING_DIR`` or legacy ``~/.copaw`` — never hardcoded
    to ``~/.qwenpaw`` (cf. BUG-012).
    """
    try:
        from qwenpaw.constant import WORKING_DIR

        base = Path(WORKING_DIR)
    except Exception:
        base = Path.home() / ".qwenpaw"
    d = base / "ugsci" / "teams"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _store_file() -> Path:
    return _store_dir() / "custom_teams.json"


def _load_store() -> dict[str, dict[str, Any]]:
    """Load the custom team store from disk."""
    try:
        f = _store_file()
        if f.is_file():
            data = json.loads(f.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                return data
    except Exception as exc:
        logger.warning("Failed to load custom team store: %s", exc)
    return {}


def _save_store(store: dict[str, dict[str, Any]]) -> None:
    """Save the custom team store to disk (atomic write)."""
    f = _store_file()
    f.parent.mkdir(parents=True, exist_ok=True)
    tmp = f.with_suffix(".tmp")
    try:
        tmp.write_text(
            json.dumps(store, indent=2, ensure_ascii=False, default=str),
            encoding="utf-8",
        )
        import os

        os.replace(tmp, f)
    except Exception as exc:
        logger.warning("Failed to save custom team store: %s", exc)
        if tmp.exists():
            tmp.unlink(missing_ok=True)


def _generate_team_id(team_def: dict[str, Any]) -> str:
    """Generate a stable, whitespace-free team ID from the team name."""
    name = team_def.get("name", "custom")
    # Keep word chars + CJK, replace everything else with '-'
    slug = re.sub(r"[^\w\u4e00-\u9fff]", "-", name)[:40].strip("-")
    if not slug:
        slug = "custom"
    # Append a short timestamp suffix to avoid collisions
    return f"{slug}-{int(time.time())}"[-60:]


def save_custom_team(team_def: dict[str, Any]) -> str:
    """Save a custom team definition and return its ``team_id``.

    The caller may provide ``id`` in *team_def*; otherwise one is
    generated from the team name.  Existing definitions with the same
    ``team_id`` are overwritten.
    """
    team_id = str(team_def.get("id") or team_def.get("team_id") or "")
    if not team_id:
        team_id = _generate_team_id(team_def)

    # Ensure the team_id is whitespace-free and URL-safe
    team_id = re.sub(r"\s+", "-", team_id)[:60]

    record = {
        "team_id": team_id,
        "name": team_def.get("name", team_id),
        "mode": team_def.get("mode", "pipeline"),
        "members": team_def.get("members", []),
        "steps": team_def.get("steps", []),
        "orchestration_prompt": team_def.get("orchestrationPrompt", ""),
        "coordinator_name": team_def.get("coordinatorName", ""),
        "task_template": team_def.get("taskTemplate", ""),
        "created_at": team_def.get("createdAt") or time.time(),
    }

    with _lock:
        store = _load_store()
        store[team_id] = record
        # Prune old entries
        if len(store) > _MAX_STORED_TEAMS:
            sorted_items = sorted(
                store.items(),
                key=lambda x: x[1].get("created_at", 0),
            )
            store = dict(sorted_items[-_MAX_STORED_TEAMS:])
        _save_store(store)
        logger.info(
            "Saved custom team '%s' (%s, %d members)",
            team_id,
            record["mode"],
            len(record["members"]),
        )
    return team_id


def load_custom_team(team_id: str) -> dict[str, Any] | None:
    """Load a custom team definition by ID. Returns ``None`` if not found."""
    with _lock:
        store = _load_store()
        return store.get(team_id)


def list_custom_teams() -> list[dict[str, Any]]:
    """Return all stored custom team definitions."""
    with _lock:
        store = _load_store()
        return list(store.values())


def delete_custom_team(team_id: str) -> bool:
    """Delete a custom team definition. Returns True if deleted."""
    with _lock:
        store = _load_store()
        if team_id not in store:
            return False
        del store[team_id]
        _save_store(store)
        return True


__all__ = [
    "delete_custom_team",
    "list_custom_teams",
    "load_custom_team",
    "save_custom_team",
]
