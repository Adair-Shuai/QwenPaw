# -*- coding: utf-8 -*-
"""Plugin-owned expert card metadata, separate from executable prompts."""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Callable, Literal

from fastapi import APIRouter, HTTPException
from filelock import FileLock
from pydantic import BaseModel, ConfigDict, Field, ValidationError

Category = Literal["油气工程", "数据与研究", "通用助手", "应用专家"]


class ExpertPresentation(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    revision: int = Field(default=0, ge=0)
    display_name: str = Field(default="", max_length=60)
    category: Category | None = None
    specialty: str = Field(default="", max_length=50)
    summary: str = Field(default="", max_length=180)


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
        if not target.resolve().is_relative_to(root):
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
            updated = body.model_copy(
                update={"revision": current.revision + 1},
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
