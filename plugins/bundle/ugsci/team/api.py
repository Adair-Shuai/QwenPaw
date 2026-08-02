# -*- coding: utf-8 -*-
"""HTTP API for the UGSci expert-team workflow."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Callable, Literal, TypeAlias

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, field_validator

from .constants import (
    UGSCI_ROLE_ALLOWED_TOOLS,
    UGSCI_ROLE_DISPLAY_NAMES,
    UGSCI_ROLE_SKILLS,
)
from .custom_store import save_custom_team, list_custom_teams
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
TeamMode: TypeAlias = Literal[
    "pipeline",
    "coordinator",
    "roundtable",
    "router",
    "review_loop",
    "debate",
]


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
    mode: TeamMode
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


class CustomTeamMember(BaseModel):
    """One expert in a custom team."""

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
    def validate_role_key(cls, value: str | None) -> str | None:
        if value is not None and value not in UGSCI_ROLE_DISPLAY_NAMES:
            raise ValueError(f"Unknown UGSci role key: {value}")
        return value


class CustomTeamStep(BaseModel):
    """One step in a custom team's orchestration sequence."""

    agent_name: str = Field(alias="agentName")
    instruction: str
    pass_context: bool = Field(default=False, alias="passContext")


class CustomTeamRequest(BaseModel):
    """Payload for registering a custom team definition."""

    model_config = ConfigDict(populate_by_name=True)

    name: str
    id: str | None = None
    description: str = ""
    emoji: str = "🤝"
    category: str = "自定义"
    mode: TeamMode = "pipeline"
    members: list[CustomTeamMember] = Field(default_factory=list)
    steps: list[CustomTeamStep] = Field(default_factory=list)
    orchestration_prompt: str = Field(default="", alias="orchestrationPrompt")
    coordinator_name: str | None = Field(default=None, alias="coordinatorName")
    task_template: str = Field(default="", alias="taskTemplate")
    max_review_rounds: int = Field(
        default=2,
        ge=1,
        le=5,
        alias="maxReviewRounds",
    )
    routing_instruction: str = Field(default="", alias="routingInstruction")
    success_criteria: str = Field(default="", alias="successCriteria")


class CustomTeamResponse(BaseModel):
    """Result of registering a custom team."""

    team_id: str
    name: str
    description: str = ""
    emoji: str = "🤝"
    category: str = "自定义"


class StoredCustomTeamResponse(BaseModel):
    """Complete stored expert-team definition returned to the UI."""

    model_config = ConfigDict(populate_by_name=True)

    team_id: str
    name: str
    description: str = ""
    emoji: str = "🤝"
    category: str = "自定义"
    mode: TeamMode
    members: list[CustomTeamMember] = Field(default_factory=list)
    steps: list[CustomTeamStep] = Field(default_factory=list)
    orchestration_prompt: str = Field(default="", alias="orchestrationPrompt")
    coordinator_name: str | None = Field(default=None, alias="coordinatorName")
    task_template: str = Field(default="", alias="taskTemplate")
    max_review_rounds: int = Field(default=2, alias="maxReviewRounds")
    routing_instruction: str = Field(default="", alias="routingInstruction")
    success_criteria: str = Field(default="", alias="successCriteria")
    created_at: float = Field(default=0, alias="createdAt")
    updated_at: float = Field(default=0, alias="updatedAt")


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


class TeamRunSummary(BaseModel):
    instance_id: str
    team_id: str = ""
    team_name: str = ""
    team_mode: str = "pipeline"
    status: Literal["active", "completed", "terminated", "unreadable"]
    current_phase: str = "plan"
    iteration: int = 0
    task: str = ""
    created_at_ns: int = 0
    finished_at_ns: int = 0


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

    @router.post("/custom", response_model=CustomTeamResponse)
    def register_custom_team(
        req: CustomTeamRequest,
    ) -> CustomTeamResponse:
        """Register a custom team definition and return its team_id.

        The frontend calls this before launching ``/ugsci-team`` so the
        full team definition (members, steps, orchestration prompt)
        is available to the backend without encoding complex JSON in
        the slash command text.
        """
        team_def = req.model_dump(by_alias=True)
        team_id = save_custom_team(team_def)
        return CustomTeamResponse(team_id=team_id, name=req.name)

    @router.get("/custom", response_model=list[StoredCustomTeamResponse])
    def list_custom_team_defs() -> list[StoredCustomTeamResponse]:
        """List complete custom team definitions (backend is source of truth)."""
        return [_stored_team_response(team) for team in list_custom_teams()]

    @router.get("/custom/{team_id}", response_model=StoredCustomTeamResponse)
    def get_custom_team_def(team_id: str) -> StoredCustomTeamResponse:
        from .custom_store import load_custom_team

        team = load_custom_team(team_id)
        if team is None:
            raise HTTPException(status_code=404, detail="Expert team not found")
        return _stored_team_response(team)

    @router.put("/custom/{team_id}", response_model=CustomTeamResponse)
    def update_custom_team(
        team_id: str,
        req: CustomTeamRequest,
    ) -> CustomTeamResponse:
        from .custom_store import load_custom_team

        if load_custom_team(team_id) is None:
            raise HTTPException(status_code=404, detail="Expert team not found")
        team_def = req.model_dump(by_alias=True)
        team_def["id"] = team_id
        saved_id = save_custom_team(team_def)
        return CustomTeamResponse(team_id=saved_id, name=req.name)

    @router.delete("/custom/{team_id}", status_code=204)
    def delete_custom_team_def(team_id: str) -> None:
        from .custom_store import delete_custom_team

        if not delete_custom_team(team_id):
            raise HTTPException(status_code=404, detail="Expert team not found")

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

    @router.get("/runs", response_model=list[TeamRunSummary])
    def list_team_runs(request: Request) -> list[TeamRunSummary]:
        """List expert-team runs for the selected controller workspace."""
        agent_id = request.headers.get("X-Agent-Id", "").strip()
        if not agent_id:
            raise HTTPException(status_code=400, detail="X-Agent-Id header is required")
        workspace_dir = resolve_workspace(agent_id)
        if workspace_dir is None:
            raise HTTPException(status_code=404, detail="Agent workspace is not registered")
        return _list_team_runs(workspace_dir)

    return router


def _stored_team_response(team: dict[str, Any]) -> StoredCustomTeamResponse:
    """Normalize the storage representation into the public API model."""
    return StoredCustomTeamResponse.model_validate(
        {
            "team_id": team["team_id"],
            "name": team.get("name", team["team_id"]),
            "description": team.get("description", ""),
            "emoji": team.get("emoji", "🤝"),
            "category": team.get("category", "自定义"),
            "mode": team.get("mode", "pipeline"),
            "members": team.get("members", []),
            "steps": team.get("steps", []),
            "orchestrationPrompt": team.get("orchestration_prompt", ""),
            "coordinatorName": team.get("coordinator_name") or None,
            "taskTemplate": team.get("task_template", ""),
            "maxReviewRounds": team.get("max_review_rounds", 2),
            "routingInstruction": team.get("routing_instruction", ""),
            "successCriteria": team.get("success_criteria", ""),
            "createdAt": team.get("created_at", 0),
            "updatedAt": team.get("updated_at", 0),
        },
    )


def _list_team_runs(workspace_dir: Path) -> list[TeamRunSummary]:
    base = workspace_dir / ".qwenpaw" / "ugsci_teams"
    try:
        base_resolved = base.resolve()
        instances = [
            path
            for path in base.iterdir()
            if path.is_dir()
            and not path.is_symlink()
            and path.resolve().is_relative_to(base_resolved)
        ]
    except (FileNotFoundError, OSError):
        return []
    runs: list[TeamRunSummary] = []
    for instance in instances:
        state_file = instance / "state.json"
        if not state_file.is_file() or state_file.is_symlink():
            continue
        try:
            data = validate_state_document(
                json.loads(state_file.read_text(encoding="utf-8")),
            )
            workflow_status = data.get("workflow_status", WORKFLOW_ACTIVE)
            if workflow_status == WORKFLOW_TERMINATED:
                status = "terminated"
            elif (
                workflow_status == WORKFLOW_COMPLETED
                or data.get("current_phase") == "completed"
            ):
                status = "completed"
            else:
                status = (
                    "active"
                    if workflow_status == WORKFLOW_ACTIVE
                    else workflow_status
                )
            runs.append(
                TeamRunSummary(
                    instance_id=instance.name,
                    team_id=data.get("team_id", ""),
                    team_name=data.get("team_name", ""),
                    team_mode=data.get("team_mode", "pipeline"),
                    status=status,
                    current_phase=data.get("current_phase", "plan"),
                    iteration=int(data.get("iteration", 0)),
                    task=data.get("task", ""),
                    created_at_ns=int(data.get("created_at_ns", 0)),
                    finished_at_ns=int(data.get("finished_at_ns", 0)),
                ),
            )
        except (
            OSError,
            UnicodeDecodeError,
            json.JSONDecodeError,
            TeamStateInvalidError,
        ):
            runs.append(TeamRunSummary(instance_id=instance.name, status="unreadable"))
    return sorted(
        runs,
        key=lambda run: (run.created_at_ns, run.instance_id),
        reverse=True,
    )


__all__ = [
    "CustomTeamMember",
    "CustomTeamRequest",
    "CustomTeamResponse",
    "CustomTeamStep",
    "PresetTeamsResponse",
    "PresetTeamDefinition",
    "RoleDefinition",
    "RolesResponse",
    "TeamMemberDefinition",
    "TeamStateResponse",
    "TeamRunSummary",
    "StoredCustomTeamResponse",
    "build_team_router",
]
