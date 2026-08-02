# -*- coding: utf-8 -*-
"""ULit AI routes — sessions, Q&A, reading cards."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException

from qwenpaw.pawapp import get_ctx

from ..job_runner import JobRunner
from ..schemas import AIQuestion, AISessionCreate
from ..services import AIService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/ai/sessions")
async def create_ai_session(body: AISessionCreate) -> dict:
    return await AIService.get_or_create_session(
        body.scope_type, body.scope_id, body.title
    )


@router.get("/ai/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    ctx=Depends(get_ctx),
) -> dict:
    history = await AIService.get_session_history(ctx, session_id)
    return {"messages": history}


@router.post("/papers/{paper_id}/reading-card")
async def generate_reading_card(
    paper_id: str,
    ctx=Depends(get_ctx),
) -> dict:
    """Generate a quick reading card for a paper (synchronous)."""
    try:
        result = await AIService.generate_reading_card(ctx, paper_id)
        return result
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc
    except Exception as exc:
        logger.exception("[ulit] Reading card generation failed")
        raise HTTPException(500, str(exc)) from exc


@router.post("/papers/{paper_id}/ask")
async def ask_paper(
    paper_id: str,
    body: AIQuestion,
    ctx=Depends(get_ctx),
) -> dict:
    """Ask a question about a paper with evidence grounding (synchronous)."""
    try:
        result = await AIService.ask(
            ctx,
            body.question,
            paper_id=paper_id,
            scope=body.scope,
            selected_text=body.selected_text,
            page_index=body.page_index,
        )
        return result
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc
    except Exception as exc:
        logger.exception("[ulit] AI ask failed")
        raise HTTPException(500, str(exc)) from exc


@router.post("/papers/{paper_id}/ask-async")
async def ask_paper_async(
    paper_id: str,
    body: AIQuestion,
    ctx=Depends(get_ctx),
) -> dict:
    """Submit a question as a background job (returns job_id)."""
    job = JobRunner.enqueue(
        "answer_question",
        payload={
            "paper_id": paper_id,
            "question": body.question,
            "scope": body.scope,
            "selected_text": body.selected_text,
            "page_index": body.page_index,
        },
        ctx=ctx,
        paper_id=paper_id,
    )
    return job


@router.get("/ai/runs/{run_id}")
async def get_ai_run(run_id: str) -> dict:
    run = await AIService.get_run(run_id)
    if run is None:
        raise HTTPException(404, "AI run not found")
    return run
