# -*- coding: utf-8 -*-
"""Plugin-owned expert card metadata, separate from executable prompts."""

from __future__ import annotations

import json
import os
import uuid
from pathlib import Path
from typing import Annotated, Callable, Literal

from fastapi import APIRouter, HTTPException
from filelock import FileLock
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    ValidationError,
    StringConstraints,
    model_validator,
)

Category = Literal["油气工程", "数据与研究", "通用助手", "应用专家"]
_AVATAR_ROLES = json.loads(
    Path(__file__).with_name("avatar_catalog.json").read_text("utf-8"),
)


AvatarColor = Annotated[
    str,
    StringConstraints(pattern=r"^(?:auto|#[0-9a-fA-F]{6})$"),
]
TransparentAvatarColor = Annotated[
    str,
    StringConstraints(pattern=r"^(?:auto|transparent|#[0-9a-fA-F]{6})$"),
]


class ExpertAvatarColors(BaseModel):
    model_config = ConfigDict(extra="forbid")

    shell: AvatarColor = "auto"
    visor: AvatarColor = "auto"
    eyes: TransparentAvatarColor = "auto"
    crown: AvatarColor = "auto"
    badge: AvatarColor = "auto"
    badge_ring: AvatarColor = "auto"
    background: TransparentAvatarColor = "auto"


class ExpertAvatarRecipe(BaseModel):
    """Validated composition inputs for the bundled vector renderer."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    domain: str = Field(min_length=1, max_length=40)
    role: str = Field(min_length=1, max_length=40)
    shell: Literal["auto", "round", "faceted", "shield", "industrial"] = "auto"
    visor: Literal["classic", "soft", "angular"] = "classic"
    expression: Literal["focused", "friendly", "thinking"] = "focused"
    badge: Literal[
        "none",
        "analysis",
        "teaching",
        "research",
        "coding",
        "safety",
        "documents",
        "planning",
        "operations",
        "collaboration",
        "design",
    ] = "none"
    crown_domain: str = Field(default="auto", max_length=40)
    crown_role: str = Field(default="auto", max_length=40)
    category_label: str = Field(default="", max_length=64)
    colors: ExpertAvatarColors | None = None

    @model_validator(mode="after")
    def validate_roles(self):
        if self.role not in _AVATAR_ROLES.get(self.domain, []):
            raise ValueError("头像领域或岗位无效")
        crown_domain = (
            self.domain if self.crown_domain == "auto" else self.crown_domain
        )
        if crown_domain not in _AVATAR_ROLES or (
            self.crown_role != "auto"
            and self.crown_role not in _AVATAR_ROLES[crown_domain]
        ):
            raise ValueError("头像头饰领域或岗位无效")
        return self


def _containment_path(path: Path) -> Path:
    """Compare resolved Windows paths with the same extended-path spelling."""
    if os.name != "nt":
        return path
    value = str(path)
    if value.startswith("\\\\?\\"):
        return path
    if value.startswith("\\\\"):
        return Path("\\\\?\\UNC\\" + value[2:])
    return Path("\\\\?\\" + value)


class ExpertPresentation(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    revision: int = Field(default=0, ge=0)
    display_name: str = Field(default="", max_length=60)
    category: Category | None = None
    specialty: str = Field(default="", max_length=50)
    summary: str = Field(default="", max_length=180)
    avatar: ExpertAvatarRecipe | None = None


def registered_workspace(agent_id: str) -> Path | None:
    from qwenpaw.config.utils import load_config

    profile = load_config().agents.profiles.get(agent_id)
    return (
        Path(profile.workspace_dir).expanduser().resolve() if profile else None
    )


def build_expert_presentation_router(
    resolve_workspace: Callable[[str], Path | None] = registered_workspace,
) -> APIRouter:
    router = APIRouter()

    def metadata_path(agent_id: str) -> Path:
        root = resolve_workspace(agent_id)
        if root is None:
            raise HTTPException(404, "专家不存在")
        root = root.resolve()
        target = root / "ugsci" / "expert-card.json"
        # A concurrent mkdir can make Python's non-strict Windows realpath
        # retain its extended prefix for the missing file but not its root.
        # Keep real resolution and containment; normalize only their spelling.
        if not _containment_path(target.resolve()).is_relative_to(
            _containment_path(root),
        ):
            raise HTTPException(400, "专家显示配置路径无效")
        return target

    def read(path: Path) -> ExpertPresentation:
        if not path.exists():
            return ExpertPresentation()
        try:
            return ExpertPresentation.model_validate_json(
                path.read_text("utf-8"),
            )
        except (OSError, ValueError, ValidationError) as exc:
            raise HTTPException(
                500,
                "专家显示配置无法读取，请保留原文件后检查",
            ) from exc

    @router.get("/{agent_id}/presentation", response_model=ExpertPresentation)
    def get_presentation(agent_id: str) -> ExpertPresentation:
        return read(metadata_path(agent_id))

    @router.put("/{agent_id}/presentation", response_model=ExpertPresentation)
    def put_presentation(
        agent_id: str,
        body: ExpertPresentation,
    ) -> ExpertPresentation:
        path = metadata_path(agent_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        with FileLock(str(path) + ".lock", timeout=10):
            current = read(path)
            if body.revision != current.revision:
                raise HTTPException(409, "显示配置已被更新，请重新打开设置后重试")
            avatar = (
                body.avatar
                if "avatar" in body.model_fields_set
                else current.avatar
            )
            if (
                avatar is not None
                and current.avatar is not None
                and "colors" not in avatar.model_fields_set
            ):
                avatar = avatar.model_copy(
                    update={"colors": current.avatar.colors},
                )
            updated = body.model_copy(
                update={
                    "revision": current.revision + 1,
                    "avatar": avatar,
                },
            )
            temporary = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
            try:
                temporary.write_text(
                    json.dumps(
                        updated.model_dump(),
                        ensure_ascii=False,
                        indent=2,
                    ),
                    encoding="utf-8",
                )
                temporary.replace(path)
            finally:
                temporary.unlink(missing_ok=True)
        return updated

    return router
