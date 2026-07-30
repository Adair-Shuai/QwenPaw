# -*- coding: utf-8 -*-
"""HTTP API for the UGSci expert-team workflow."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Callable, Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field

from .constants import (
    UGSCI_ROLE_ALLOWED_TOOLS,
    UGSCI_ROLE_DISPLAY_NAMES,
    UGSCI_ROLE_SKILLS,
)
from .presets import PRESET_UGSCI_TEAMS
from .roles import UGSCI_ROLE_PROMPTS
from .state import (
    TeamStateInvalidError,
    WORKFLOW_ACTIVE,
    WORKFLOW_COMPLETED,
    WORKFLOW_TERMINATED,
    validate_state_document,
)

logger = logging.getLogger(__name__)

WorkspaceResolver = Callable[[str], Path | None]


class TeamMemberDefinition(BaseModel):
    """One expert in a preset team."""

    name: str
    role: str
    emoji: str = ""


class PresetTeamDefinition(BaseModel):
    """Validated preset expert-team metadata."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    emoji: str
    category: str
    mode: Literal["pipeline", "coordinator", "roundtable"]
    description: str
    members: list[TeamMemberDefinition]
    coordinator_name: str | None = Field(
        default=None,
        alias="coordinatorName",
    )
    task_template: str = Field(alias="taskTemplate")
    orchestration_prompt: str = Field(alias="orchestrationPrompt")


class PresetTeamsResponse(BaseModel):
    """Preset expert-team definitions returned to the UI."""

    teams: list[PresetTeamDefinition]


class RoleDefinition(BaseModel):
    """Public role metadata used by the expert-team UI."""

    key: str
    display_name: str
    allowed_tools: list[str] | None = None
    skills: list[str] | None = None
    prompt: str


class RolesResponse(BaseModel):
    """Collection of public UGSci role definitions."""

    roles: list[RoleDefinition]


class TeamStateResponse(BaseModel):
    """Latest workflow state for one registered Agent workspace."""

    active: bool = False
    status: Literal[
        "idle",
        "active",
        "completed",
        "terminated",
        "unreadable",
    ] = "idle"
    state: dict[str, Any] = Field(default_factory=dict)
    instance_id: str | None = None
    error: str | None = None


def _resolve_registered_workspace(agent_id: str) -> Path | None:
    """Resolve an Agent workspace through QwenPaw's runtime registry."""
    from qwenpaw.plugins.registry import PluginRegistry

    manager = PluginRegistry().get_workspace_manager()
    if manager is None:
        return None
    workspaces = getattr(
        manager,
        "agents",
        getattr(manager, "workspaces", {}),
    )
    workspace = workspaces.get(agent_id)
    if workspace is None:
        return None
    workspace_dir = getattr(workspace, "workspace_dir", None)
    if workspace_dir is None:
        return None
    return Path(workspace_dir).expanduser().resolve()


def _latest_team_state(workspace_dir: Path, agent_id: str) -> TeamStateResponse:
    """Read the newest workflow state under a trusted workspace root."""
    base = workspace_dir / ".qwenpaw" / "ugsci_teams"
    try:
        base_resolved = base.resolve()
        instances = sorted(
            (
                path
                for path in base.iterdir()
                if path.is_dir()
                and not path.is_symlink()
                and path.resolve().is_relative_to(base_resolved)
            ),
            key=_instance_sort_key,
            reverse=True,
        )
    except FileNotFoundError:
        return TeamStateResponse()
    except OSError:
        logger.warning(
            "UGSci team state directory is unreadable",
            extra={"agent_id": agent_id},
            exc_info=True,
        )
        return TeamStateResponse(
            status="unreadable",
            error="state_directory_unreadable",
        )

    for instance in instances:
        state_file = instance / "state.json"
        if not state_file.is_file() or state_file.is_symlink():
            continue
        try:
            data = validate_state_document(
                json.loads(state_file.read_text(encoding="utf-8")),
            )
        except (
            json.JSONDecodeError,
            UnicodeDecodeError,
            TeamStateInvalidError,
        ):
            logger.warning(
                "UGSci team state JSON is invalid",
                extra={
                    "agent_id": agent_id,
                    "instance_id": instance.name,
                },
                exc_info=True,
            )
            return TeamStateResponse(
                status="unreadable",
                instance_id=instance.name,
                error="state_json_invalid",
            )
        except OSError:
            logger.warning(
                "UGSci team state file is unreadable",
                extra={
                    "agent_id": agent_id,
                    "instance_id": instance.name,
                },
                exc_info=True,
            )
            return TeamStateResponse(
                status="unreadable",
                instance_id=instance.name,
                error="state_file_unreadable",
            )

        phase = data["current_phase"]
        workflow_status = data.get("workflow_status", WORKFLOW_ACTIVE)
        active = (
            workflow_status == WORKFLOW_ACTIVE
            and phase != "completed"
        )
        if active:
            response_status = "active"
        elif workflow_status == WORKFLOW_TERMINATED:
            response_status = "terminated"
        elif (
            workflow_status == WORKFLOW_COMPLETED
            or phase == "completed"
        ):
            response_status = "completed"
        else:
            response_status = "unreadable"
        return TeamStateResponse(
            active=active,
            status=response_status,
            state=data,
            instance_id=instance.name,
        )

    return TeamStateResponse()


def _instance_sort_key(instance: Path) -> tuple[int, str]:
    """Return a deterministic, cross-platform recency key."""
    try:
        state_file = instance / "state.json"
        timestamp = (
            state_file.stat().st_mtime_ns
            if state_file.exists()
            else instance.stat().st_mtime_ns
        )
        return timestamp, instance.name
    except OSError:
        return 0, instance.name


def build_team_router(
    workspace_resolver: WorkspaceResolver | None = None,
) -> APIRouter:
    """Build the team router.

    ``workspace_resolver`` is injectable so the security boundary can be
    tested without initializing the complete application runtime.
    """
    resolve_workspace = workspace_resolver or _resolve_registered_workspace
    router = APIRouter()

    @router.get("/preset-teams", response_model=PresetTeamsResponse)
    def get_preset_teams() -> PresetTeamsResponse:
        return PresetTeamsResponse(teams=PRESET_UGSCI_TEAMS)

    @router.get("/roles", response_model=RolesResponse)
    def get_role_config() -> RolesResponse:
        roles = [
            RoleDefinition(
                key=role_key,
                display_name=UGSCI_ROLE_DISPLAY_NAMES.get(
                    role_key,
                    role_key,
                ),
                allowed_tools=UGSCI_ROLE_ALLOWED_TOOLS.get(role_key),
                skills=UGSCI_ROLE_SKILLS.get(role_key),
                prompt=prompt,
            )
            for role_key, prompt in UGSCI_ROLE_PROMPTS.items()
        ]
        return RolesResponse(roles=roles)

    @router.get("/state", response_model=TeamStateResponse)
    def get_team_state(request: Request) -> TeamStateResponse:
        agent_id = request.headers.get("X-Agent-Id", "").strip()
        if not agent_id:
            raise HTTPException(
                status_code=400,
                detail="X-Agent-Id header is required",
            )

        workspace_dir = resolve_workspace(agent_id)
        if workspace_dir is None:
            raise HTTPException(
                status_code=404,
                detail="Agent workspace is not registered",
            )
        return _latest_team_state(workspace_dir, agent_id)

    return router


__all__ = [
    "PresetTeamsResponse",
    "PresetTeamDefinition",
    "RoleDefinition",
    "RolesResponse",
    "TeamMemberDefinition",
    "TeamStateResponse",
    "build_team_router",
]
