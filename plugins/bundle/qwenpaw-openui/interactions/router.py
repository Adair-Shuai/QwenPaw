# -*- coding: utf-8 -*-
"""Small HTTP adapter; lifecycle rules live in InteractionService."""

import asyncio

from fastapi import APIRouter, HTTPException, Query, Request

from .schema import RevisionBody, SessionBody, ValuesBody
from .scope import resolve_scope
from .service import ConflictError, InteractionService


def build_router(service: InteractionService) -> APIRouter:
    router = APIRouter()

    async def scope_for(request: Request, session_id: str):
        from qwenpaw.app.agent_context import get_agent_for_request

        workspace = await get_agent_for_request(request)
        try:
            return await resolve_scope(workspace, session_id)
        except KeyError:
            raise HTTPException(404, "Console chat not found") from None

    async def run(action, *args):
        try:
            return await asyncio.to_thread(action, *args)
        except KeyError:
            raise HTTPException(404, "Interaction not found") from None
        except ConflictError as exc:
            raise HTTPException(409, str(exc)) from None
        except ValueError as exc:
            raise HTTPException(422, str(exc)) from None

    @router.get("")
    async def list_requests(
        request: Request,
        session_id: str = Query(min_length=1, max_length=512),
    ):
        scope = await scope_for(request, session_id)
        return {"requests": await run(service.list, scope)}

    @router.post("/demo")
    async def create_demo(request: Request, body: SessionBody):
        scope = await scope_for(request, body.session_id)
        return await run(service.demo, scope)

    @router.get("/{request_id}")
    async def get_request(
        request: Request,
        request_id: str,
        session_id: str = Query(min_length=1, max_length=512),
    ):
        scope = await scope_for(request, session_id)
        return await run(service.get, scope, request_id)

    @router.put("/{request_id}/draft")
    async def save_draft(request: Request, request_id: str, body: ValuesBody):
        scope = await scope_for(request, body.session_id)
        return await run(
            service.draft,
            scope,
            request_id,
            body.expected_revision,
            body.values,
        )

    @router.post("/{request_id}/submit")
    async def submit(request: Request, request_id: str, body: ValuesBody):
        scope = await scope_for(request, body.session_id)
        return await run(
            service.submit,
            scope,
            request_id,
            body.expected_revision,
            body.values,
        )

    @router.post("/{request_id}/cancel")
    async def cancel(request: Request, request_id: str, body: RevisionBody):
        scope = await scope_for(request, body.session_id)
        return await run(
            service.cancel,
            scope,
            request_id,
            body.expected_revision,
        )

    @router.post("/{request_id}/queued")
    async def mark_queued(
        request: Request,
        request_id: str,
        body: SessionBody,
    ):
        scope = await scope_for(request, body.session_id)
        return await run(service.queued, scope, request_id)

    return router
