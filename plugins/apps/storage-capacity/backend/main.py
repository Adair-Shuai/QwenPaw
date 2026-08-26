# -*- coding: utf-8 -*-
"""Storage Capacity — auditable underground-gas-storage evaluation PawApp."""

from __future__ import annotations

import re
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from qwenpaw.pawapp import PawApp
from qwenpaw.pawapp.deps import get_ctx

from .backend.evaluation import (
    blank_case,
    build_expert_prompt,
    demo_case,
    evaluate_case,
    fallback_expert_summary,
    ingest_uploaded_documents,
)


app = PawApp(name="Storage Capacity", app_id="storage-capacity")
router = APIRouter()
app.include_router(router)


class LayerBody(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    produced_gas: float = Field(..., gt=0)
    injection_end_pressure: float = Field(..., gt=0)
    injection_end_z: float = Field(..., gt=0)
    evaluation_pressure: float = Field(..., gt=0)
    evaluation_z: float = Field(..., gt=0)
    source: str = "用户输入"
    confidence: float = Field(default=0.9, ge=0, le=1)


class DocumentBody(BaseModel):
    id: str = ""
    name: str = ""
    kind: str = "资料"
    pages: int = Field(default=0, ge=0)
    status: str = "verified"
    coverage: float = Field(default=100, ge=0, le=100)
    items: int = Field(default=0, ge=0)


class EvaluateBody(BaseModel):
    case_id: str = "custom-case"
    case_name: str = "自定义库容评估"
    cycle_id: str = Field(..., min_length=1)
    injection_end_state_id: str = Field(..., min_length=1)
    evaluation_state_id: str = Field(..., min_length=1)
    pressure_basis: str = "apparent_formation"
    gas_volume_unit: str = "1e8_sm3"
    pressure_unit: str = "MPa"
    daily_rate_unit: str = "1e4_sm3/d"
    design_capacity: float = Field(..., gt=0)
    book_inventory: float = Field(..., gt=0)
    working_gas: float = Field(..., gt=0)
    design_working_gas: float = Field(..., gt=0)
    peak_daily_rate: float = Field(..., gt=0)
    design_peak_daily_rate: float = Field(..., gt=0)
    layers: List[LayerBody] = Field(..., min_length=1)
    documents: List[DocumentBody] = Field(default_factory=list)


def _summary_lines(text: str) -> List[str]:
    lines = []
    for raw in (text or "").replace("\r", "").split("\n"):
        line = re.sub(r"^\s*(?:[-*•]|\d+[.)、])\s*", "", raw).strip()
        line = re.sub(r"[*_`#]+", "", line).strip()
        if line.startswith("基于本次") and "审查意见" in line:
            continue
        if len(line) >= 8:
            lines.append(line[:240])
    return lines[:6]


async def _expert_summary(ctx: Any, evaluation: Dict[str, Any]) -> tuple[List[str], str]:
    try:
        reply = await ctx.chat(build_expert_prompt(evaluation))
        lines = _summary_lines(getattr(reply, "text", "") or "")
        if len(lines) >= 3:
            return lines, "agent"
    except Exception:  # The deterministic calculation remains available offline.
        pass
    return fallback_expert_summary(evaluation), "deterministic_fallback"


@router.get("/demo")
async def api_demo() -> Dict[str, Any]:
    return {"case": demo_case()}


@router.get("/blank")
async def api_blank() -> Dict[str, Any]:
    """Return a storage-agnostic draft; the demo is never loaded implicitly."""
    return {"case": blank_case()}


@router.post("/ingest")
async def api_ingest(
    files: List[UploadFile] = File(...),
    case_name: str = Form(default=""),
    case_id: str = Form(default=""),
) -> Dict[str, Any]:
    """Ingest evidence for any underground gas storage evaluation scenario.

    JSON and CSV/TSV inputs are mapped into the deterministic evaluation
    schema when possible. PDF, Word, spreadsheet and image files remain in
    the evidence list and can be supplemented through the parameter editor.
    """
    if not files:
        raise HTTPException(status_code=400, detail="请至少上传一份评估资料")
    uploaded: List[Dict[str, Any]] = []
    total_size = 0
    for item in files:
        content = await item.read()
        total_size += len(content)
        if total_size > 50 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="单次上传资料总量不能超过 50 MB")
        uploaded.append(
            {
                "filename": item.filename or "未命名资料",
                "content_type": item.content_type or "application/octet-stream",
                "size_bytes": len(content),
                "content": content,
            }
        )
    return ingest_uploaded_documents(uploaded, case_id=case_id, case_name=case_name)


@router.post("/evaluate")
async def api_evaluate(body: EvaluateBody, ctx=Depends(get_ctx)) -> Dict[str, Any]:
    if body.pressure_basis not in {"absolute", "apparent_formation", "report_defined"}:
        raise HTTPException(status_code=400, detail="pressure_basis 不受支持")
    if body.injection_end_state_id.casefold() == body.evaluation_state_id.casefold():
        raise HTTPException(status_code=400, detail="注气末与评价期必须是不同状态")
    try:
        evaluation = evaluate_case(body.model_dump())
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        detail = getattr(exc, "message", None) or str(exc) or "确定性计算失败"
        raise HTTPException(status_code=422, detail=detail) from exc
    summary, source = await _expert_summary(ctx, evaluation)
    evaluation["expert_summary"] = summary
    evaluation["expert_summary_source"] = source
    return evaluation


# PluginLoader contract.
plugin = app
