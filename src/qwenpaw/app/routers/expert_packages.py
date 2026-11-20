# -*- coding: utf-8 -*-
"""UGSci signed expert-package install API."""

import os
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict

from ...__version__ import __version__
from ...constant import WORKING_DIR
from ...distribution import COMPONENT_PUBLIC_KEY
from ...expert_packages.service import ExpertInstallService
from ...expert_packages.readiness import start_expert
from ...expert_packages.source import Channel

router = APIRouter(prefix="/expert-packages", tags=["expert-packages"])


class PlanRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    manifest_path: str


def service(request: Request) -> ExpertInstallService:
    if not hasattr(request.app.state, "expert_install_service"):
        from .agents import _get_multi_agent_manager

        request.app.state.expert_install_service = ExpertInstallService(
            Path(WORKING_DIR) / "expert-packages",
            Channel(
                os.environ.get(
                    "UGSCI_EXPERT_CHANNEL_URL",
                    "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com",
                ),
                os.environ.get(
                    "UGSCI_EXPERT_PUBLIC_KEY",
                    COMPONENT_PUBLIC_KEY,
                ),
            ),
            os.environ.get("QWENPAW_DESKTOP_VERSION", "") or __version__,
            on_ready=lambda agent_id: start_expert(
                _get_multi_agent_manager(request),
                agent_id,
            ),
            on_repair=lambda agent_id: _get_multi_agent_manager(
                request,
            ).inactive_agent_maintenance(agent_id),
        )
    return request.app.state.expert_install_service


@router.post("/plan")
async def plan(body: PlanRequest, request: Request):
    try:
        return await service(request).plan(body.manifest_path)
    except Exception as exc:
        raise HTTPException(400, detail=str(exc)) from exc


@router.get("/installations")
async def installations(request: Request):
    return service(request).list_jobs()


@router.get("/installations/{job_id}")
async def installation(job_id: str, request: Request):
    try:
        return service(request).status(job_id)
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(404, detail=str(exc)) from exc


@router.post("/installations/{job_id}")
async def install(job_id: str, request: Request):
    try:
        return await service(request).start(job_id)
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(400, detail=str(exc)) from exc


@router.post("/installations/{job_id}/cancel")
async def cancel(job_id: str, request: Request):
    try:
        return service(request).cancel(job_id)
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(400, detail=str(exc)) from exc


@router.post("/installations/{job_id}/repair")
async def repair(job_id: str, request: Request):
    try:
        return await service(request).repair(job_id)
    except FileNotFoundError as exc:
        raise HTTPException(404, detail=str(exc)) from exc
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(409, detail=str(exc)) from exc
