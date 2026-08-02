# -*- coding: utf-8 -*-
"""ULit API routes package — aggregates all route modules."""

from __future__ import annotations

from fastapi import APIRouter

from .library import router as library_router
from .reading import router as reading_router
from .ai import router as ai_router
from .jobs import router as jobs_router
from .export import router as export_router

router = APIRouter()
router.include_router(library_router)
router.include_router(reading_router)
router.include_router(ai_router)
router.include_router(jobs_router)
router.include_router(export_router)
