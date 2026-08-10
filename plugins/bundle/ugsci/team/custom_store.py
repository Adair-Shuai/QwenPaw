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
import os
import re
import shutil
import threading
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    ValidationError,
    field_validator,
)

from .constants import TeamMode, UGSCI_ROLE_DISPLAY_NAMES

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.team")

_lock = threading.Lock()

# Maximum number of custom teams to keep (oldest pruned)
_MAX_STORED_TEAMS = 100


class CustomTeamConflictError(RuntimeError):
    """Raised when an edit was based on a stale stored team version."""


class CustomTeamStoreError(RuntimeError):
    """Raised when a write cannot safely proceed because storage is corrupt."""


class _PersistedTeamMember(BaseModel):
    """Validated shape of one member in the on-disk custom-team record."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    name: str
    role: str
    emoji: str = ""
    agent_id: str | None = Field(default=None, alias="agentId")
    role_key: str | None = Field(default=None, alias="roleKey")
    binding_mode: Literal["fixed", "preferred", "temporary"] = Field(
        default="preferred",
        alias="bindingMode",
    )

    @field_validator("role_key")
    @classmethod
    def _validate_role_key(cls, value: str | None) -> str | None:
        if value is not None and value not in UGSCI_ROLE_DISPLAY_NAMES:
            raise ValueError(f"Unknown UGSci role key: {value}")
        return value


class _PersistedTeamStep(BaseModel):
    """Validated shape of one orchestration step on disk."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    agent_name: str = Field(alias="agentName")
    instruction: str
    pass_context: bool = Field(default=False, alias="passContext")


class _PersistedCustomTeam(BaseModel):
    """Complete, forward-compatible schema for a stored custom team."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    team_id: str = Field(min_length=1)
    name: str = ""
    description: str = ""
    emoji: str = "🤝"
    category: str = "自定义"
    mode: TeamMode = "pipeline"
    members: list[_PersistedTeamMember] = Field(default_factory=list)
    steps: list[_PersistedTeamStep] = Field(default_factory=list)
    max_review_rounds: int = Field(default=2, ge=1, le=5)
    routing_instruction: str = ""
    success_criteria: str = ""
    orchestration_prompt: str = ""
    coordinator_name: str | None = None
    task_template: str = ""
    created_at: float = Field(default=0, ge=0)
    updated_at: float = Field(default=0, ge=0)
    version: int = Field(default=1, ge=1)


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


def _backup_file() -> Path:
    return _store_file().with_name("custom_teams.json.bak")


def _quarantine_file(path: Path) -> Path | None:
    """Move a corrupt store aside so it remains recoverable."""
    if not path.is_file():
        return None
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    target = path.with_name(f"{path.name}.corrupt-{stamp}")
    suffix = 1
    while target.exists():
        target = path.with_name(f"{path.name}.corrupt-{stamp}-{suffix}")
        suffix += 1
    try:
        os.replace(path, target)
        logger.error("Quarantined corrupt custom team store at %s", target)
        return target
    except OSError as exc:
        logger.error("Could not quarantine corrupt custom team store: %s", exc)
        return None


def _decode_store(
    path: Path,
    *,
    strict_records: bool = False,
) -> dict[str, dict[str, Any]]:
    """Decode and validate the store, isolating malformed records.

    A valid JSON container may still contain records written by an older
    version or edited by hand. Read paths skip those records so healthy teams
    remain usable. Write paths request strict validation and fail safely rather
    than silently dropping data that cannot be round-tripped.
    """
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("custom team store must contain a JSON object")
    clean: dict[str, dict[str, Any]] = {}
    for key, record in data.items():
        if not isinstance(key, str) or not key or not isinstance(record, dict):
            message = f"custom team record '{key}' must be a JSON object"
            if strict_records:
                raise ValueError(message)
            logger.warning("Ignoring malformed custom team record: %s", message)
            continue
        candidate = dict(record)
        candidate.setdefault("team_id", key)
        try:
            validated = _PersistedCustomTeam.model_validate(candidate)
        except ValidationError as exc:
            message = f"custom team record '{key}' is invalid"
            if strict_records:
                raise ValueError(message) from exc
            logger.warning(
                "Ignoring malformed custom team record '%s': %s",
                key,
                exc,
            )
            continue
        if validated.team_id != key:
            message = (
                f"custom team record key '{key}' does not match "
                f"team_id '{validated.team_id}'"
            )
            if strict_records:
                raise ValueError(message)
            logger.warning("Ignoring malformed custom team record: %s", message)
            continue
        # Keep the established storage naming for top-level fields while
        # retaining API aliases (agentId, roleKey, ...) in nested definitions.
        clean[key] = validated.model_dump(by_alias=True)
    return clean


def _load_store(*, strict: bool = False) -> dict[str, dict[str, Any]]:
    """Load the store, optionally refusing to mutate a corrupt primary file.

    Read paths quarantine and recover automatically. Write paths use strict
    mode so a corrupt file is never silently replaced by a new empty store.
    """
    f = _store_file()
    if not f.is_file():
        return {}
    try:
        return _decode_store(f, strict_records=strict)
    except Exception as exc:
        logger.warning("Failed to load custom team store: %s", exc)
        if strict:
            raise CustomTeamStoreError(
                "Custom expert team store is unreadable",
            ) from exc
        _quarantine_file(f)

    backup = _backup_file()
    if backup.is_file():
        try:
            recovered = _decode_store(backup, strict_records=False)
            # Restore the primary atomically so subsequent reads are healthy.
            restore_tmp = f.with_suffix(".recover.tmp")
            shutil.copy2(backup, restore_tmp)
            os.replace(restore_tmp, f)
            logger.warning("Recovered custom team store from %s", backup)
            return recovered
        except Exception as backup_exc:
            logger.error("Backup custom team store is also unreadable: %s", backup_exc)

    # No usable backup: isolate the bad file and keep the API usable with an
    # empty store. The quarantined file remains available for manual recovery.
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
        if f.is_file():
            try:
                shutil.copy2(f, _backup_file())
            except OSError:
                logger.warning("Could not rotate custom team store backup")
        os.replace(tmp, f)
    except Exception as exc:
        logger.warning("Failed to save custom team store: %s", exc)
        if tmp.exists():
            tmp.unlink(missing_ok=True)
        raise RuntimeError("Failed to persist custom expert team") from exc


def _generate_team_id(team_def: dict[str, Any]) -> str:
    """Generate a stable, whitespace-free team ID from the team name."""
    name = team_def.get("name", "custom")
    # Keep word chars + CJK, replace everything else with '-'
    slug = re.sub(r"[^\w\u4e00-\u9fff]", "-", name)[:40].strip("-")
    if not slug:
        slug = "custom"
    # A short random suffix prevents same-second requests from overwriting
    # one another. The returned ID is then persisted and remains stable.
    return f"{slug}-{uuid.uuid4().hex[:8]}"[-60:]


def save_custom_team(
    team_def: dict[str, Any],
    *,
    expected_updated_at: float | None = None,
    expected_version: int | None = None,
) -> str:
    """Save a custom team definition and return its ``team_id``.

    The caller may provide ``id`` in *team_def*; otherwise one is
    generated from the team name.  Existing definitions with the same
    ``team_id`` are overwritten.
    """
    team_id = str(team_def.get("id") or team_def.get("team_id") or "")
    if not team_id:
        team_id = _generate_team_id(team_def)

    # Ensure the team_id is stable, whitespace-free and URL-safe.
    team_id = re.sub(r"[^\w\u4e00-\u9fff-]", "-", team_id)
    team_id = re.sub(r"-+", "-", team_id).strip("-")[:60] or "custom"

    now = time.time()

    with _lock:
        store = _load_store(strict=True)
        existing = store.get(team_id, {})
        actual_version = int(existing.get("version", 1)) if existing else 0
        if expected_version is not None and existing:
            if actual_version != expected_version:
                raise CustomTeamConflictError(
                    f"Custom expert team '{team_id}' was updated elsewhere",
                )
        if expected_updated_at is not None and existing:
            actual_updated_at = float(existing.get("updated_at", 0))
            # The browser transports timestamps at millisecond precision.
            if abs(actual_updated_at - expected_updated_at) > 0.002:
                raise CustomTeamConflictError(
                    f"Custom expert team '{team_id}' was updated elsewhere",
                )
        record = {
            "team_id": team_id,
            "name": team_def.get("name", team_id),
            "description": team_def.get("description", ""),
            "emoji": team_def.get("emoji", "🤝"),
            "category": team_def.get("category", "自定义"),
            "mode": team_def.get("mode", "pipeline"),
            "members": team_def.get("members", []),
            "steps": team_def.get("steps", []),
            "max_review_rounds": team_def.get("maxReviewRounds", 2),
            "routing_instruction": team_def.get("routingInstruction", ""),
            "success_criteria": team_def.get("successCriteria", ""),
            "orchestration_prompt": team_def.get("orchestrationPrompt", ""),
            "coordinator_name": team_def.get("coordinatorName", ""),
            "task_template": team_def.get("taskTemplate", ""),
            "created_at": (
                team_def.get("createdAt")
                or existing.get("created_at")
                or now
            ),
            "updated_at": now,
            "version": actual_version + 1,
        }
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
        # Refuse to rewrite a store containing an invalid record; otherwise a
        # delete could silently discard data that the read path isolated.
        store = _load_store(strict=True)
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
    "CustomTeamConflictError",
    "CustomTeamStoreError",
]
