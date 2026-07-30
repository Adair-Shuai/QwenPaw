# -*- coding: utf-8 -*-
"""UGSci plugin backend for QwenPaw.

A lightweight domain-enhancement plugin that reorganizes the QwenPaw UI
into a petroleum-domain-friendly interface with three core modules:
Capabilities, Skills, and Experts.

The backend syncs plugin skills into the **shared skill pool** (not
individual workspaces) so that they are available to all agents without
being auto-injected.  Users can then download specific skills from the
pool to any agent on demand.
"""

from __future__ import annotations

import hashlib
import logging
import math
import shutil
import threading
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci")

PLUGIN_ID = "ugsci"
PLUGIN_NAME = "UGSci"
PLUGIN_DIR = Path(__file__).parent


def _sync_plugin_skills_to_pool(
    plugin_id: str,
    skills_dir: Path,
) -> int:
    """Copy plugin skills into the shared skill pool.

    Returns the number of skills synced.
    Uses absolute imports because plugins are loaded as top-level
    modules (``plugin_ugsci``) — relative imports will fail.
    """
    from qwenpaw.agents.skill_system.store import (
        copy_skill_dir,
        get_skill_pool_dir,
        safe_skill_dir,
        get_pool_skill_manifest_path,
        default_pool_manifest,
        mutate_json,
    )
    from qwenpaw.agents.skill_system.registry import (
        ensure_skill_pool_initialized,
        reconcile_pool_manifest,
    )
    from qwenpaw.agents.skill_system.pool_service import (
        _register_pool_skill_entry,
    )

    ensure_skill_pool_initialized()
    pool_dir = get_skill_pool_dir()
    source_tag = f"plugin:{plugin_id}"

    skill_names = [
        d.name
        for d in skills_dir.iterdir()
        if d.is_dir() and (d / "SKILL.md").exists()
    ]

    if not skill_names:
        return 0

    for skill_name in skill_names:
        src = skills_dir / skill_name
        dst = safe_skill_dir(pool_dir, skill_name)

        if dst.exists():
            shutil.rmtree(dst)
        copy_skill_dir(src, dst)

        def _update(
            payload,
            _name=skill_name,
            _dir=dst,
            _src=source_tag,
        ):
            _register_pool_skill_entry(
                payload,
                _name,
                _dir,
                source="customized",
                installed_from=_src,
            )
            return payload

        mutate_json(
            get_pool_skill_manifest_path(),
            default_pool_manifest(),
            _update,
        )

    reconcile_pool_manifest()
    return len(skill_names)


def _remove_plugin_pool_skills(plugin_id: str) -> int:
    """Remove plugin-sourced skills from the pool on uninstall.

    Returns the number of skills removed.
    """
    from qwenpaw.agents.skill_system.store import (
        get_pool_skill_manifest_path,
        get_skill_pool_dir,
        default_pool_manifest,
        mutate_json,
        read_skill_pool_manifest,
    )
    from qwenpaw.agents.skill_system.registry import (
        reconcile_pool_manifest,
    )

    source_tag = f"plugin:{plugin_id}"
    manifest = read_skill_pool_manifest()
    to_remove = [
        name
        for name, entry in manifest.get("skills", {}).items()
        if entry.get("installed_from") == source_tag
    ]

    if not to_remove:
        return 0

    pool_dir = get_skill_pool_dir()

    def _update(payload, _names=tuple(to_remove)):
        skills = payload.get("skills", {})
        for n in _names:
            skills.pop(n, None)
        return payload

    mutate_json(
        get_pool_skill_manifest_path(),
        default_pool_manifest(),
        _update,
    )

    for name in to_remove:
        skill_dir = pool_dir / name
        if skill_dir.exists():
            shutil.rmtree(skill_dir)

    reconcile_pool_manifest()
    return len(to_remove)


# ──────────────────────────────────────────────────────────────────────────────
# Computation Engine Management — HTTP API
# ──────────────────────────────────────────────────────────────────────────────


class EngineRequest(BaseModel):
    """Request body for creating/updating an engine."""

    name: str = ""
    vendor: str = ""
    version: str = ""
    executable_path: str = ""
    install_dir: str = ""
    category: str = ""
    description: str = ""
    invocation_hint: str = ""
    license_server: str = ""
    extra_paths: List[str] = []
    modules: List[str] = []
    module_paths: Dict[str, str] = {}


def _build_engine_router() -> APIRouter:
    """Build a FastAPI router for computation engine management."""
    router = APIRouter()

    # All endpoints are plain ``def`` (not ``async def``) so that
    # FastAPI runs them in its thread-pool.  This prevents
    # synchronous file I/O and subprocess calls from blocking
    # the event loop.

    # ── Detection cache ──────────────────────────────────────────────
    # detect_engines() is expensive (multi-drive scan + subprocess calls).
    # Cache the result so that rapid re-mounts of the frontend
    # EngineSection don't trigger redundant full detections.
    _DETECT_CACHE_TTL = 300  # 5 minutes
    _detect_cache: dict = {"data": None, "ts": 0.0, "lock": threading.Lock()}

    def _invalidate_detect_cache() -> None:
        """Clear the detection cache (call after add/update/delete)."""
        with _detect_cache["lock"]:
            _detect_cache["data"] = None
            _detect_cache["ts"] = 0.0

    # ── Static routes (registered BEFORE /{engine_id} to avoid shadowing) ──

    @router.get("/list")
    def list_engines_endpoint() -> Dict[str, Any]:
        """Return all registered computation engines."""
        from .engine import list_engines, engines_to_list

        engines = list_engines()
        return {"engines": engines_to_list(engines)}

    @router.get("/summary")
    def capability_summary_endpoint() -> Dict[str, str]:
        """Return a concise text summary for agent system-prompt injection."""
        from .engine import list_engines, build_capability_summary

        engines = list_engines()
        return {"summary": build_capability_summary(engines)}

    @router.post("/detect")
    def detect_engines_endpoint() -> Dict[str, Any]:
        """Auto-detect installed engines and return updated list.

        Results are cached for 5 minutes to avoid repeated expensive
        subprocess calls.
        """
        from .engine import detect_engines, engines_to_list

        now = time.time()
        cached = _detect_cache["data"]
        if cached is not None and (now - _detect_cache["ts"]) < _DETECT_CACHE_TTL:
            return {"engines": cached}

        with _detect_cache["lock"]:
            # Double-check after acquiring lock
            cached = _detect_cache["data"]
            if cached is not None and (time.time() - _detect_cache["ts"]) < _DETECT_CACHE_TTL:
                return {"engines": cached}

            engines = detect_engines()
            result = {"engines": engines_to_list(engines)}
            _detect_cache["data"] = result["engines"]
            _detect_cache["ts"] = time.time()
            return result

    @router.post("/detect/refresh")
    def detect_engines_refresh_endpoint() -> Dict[str, Any]:
        """Force re-detection (bypasses cache)."""
        from .engine import detect_engines, engines_to_list

        with _detect_cache["lock"]:
            engines = detect_engines()
            result = {"engines": engines_to_list(engines)}
            _detect_cache["data"] = result["engines"]
            _detect_cache["ts"] = time.time()
            return result

    @router.get("/icon/{engine_id}")
    def get_engine_icon(engine_id: str):
        """Serve an engine icon from engine/icons/ directory.

        Matches icons automatically based on:
        1. sub_product (e.g., ECLIPSE_300 → ECLIPSE_icon.png)
        2. product prefix (e.g., ECLIPSE from ECLIPSE_300)
        3. engine_id (e.g., eclipse → Eclipse_icon.png)

        Supports both .png and .jpg extensions.
        """
        from fastapi import HTTPException
        from fastapi.responses import FileResponse
        import json as _json

        icon_dir = PLUGIN_DIR / "engine" / "icons"

        # Read the engine JSON to get sub_product for smarter matching
        sub_product = ""
        engine_json = PLUGIN_DIR / "engines" / f"{engine_id}.json"
        if engine_json.is_file():
            try:
                data = _json.loads(
                    engine_json.read_text(encoding="utf-8"),
                )
                sub_product = (
                    data.get("extra_info", {}).get("sub_product", "")
                    or ""
                )
            except Exception:
                pass

        # Build candidate icon names in priority order
        candidates: list[str] = []

        if sub_product:
            # 1. Sub-product specific (e.g., ECLIPSE_300_icon.png)
            candidates.append(f"{sub_product}_icon.png")
            candidates.append(f"{sub_product}_icon.jpg")
            candidates.append(f"{sub_product}.png")

            # 2. Product prefix (e.g., ECLIPSE from ECLIPSE_300)
            product_prefix = sub_product.split("_")[0]
            if product_prefix and product_prefix != sub_product:
                for name in [
                    f"{product_prefix}_icon.png",
                    f"{product_prefix}_icon.jpg",
                    f"{product_prefix}.png",
                    f"{product_prefix.capitalize()}_icon.png",
                    f"{product_prefix.lower()}_icon.png",
                ]:
                    if name not in candidates:
                        candidates.append(name)

        # 3. Engine ID based patterns
        for name in [
            f"{engine_id}_icon.png",
            f"{engine_id}_icon.jpg",
            f"{engine_id}.png",
            f"{engine_id.capitalize()}_icon.png",
            f"{engine_id.capitalize()}_icon.jpg",
            f"{engine_id.upper()}_icon.png",
            f"{engine_id.upper()}_icon.jpg",
        ]:
            if name not in candidates:
                candidates.append(name)

        # Try each candidate
        for name_pattern in candidates:
            icon_path = icon_dir / name_pattern
            if icon_path.is_file():
                # Determine media type from extension
                ext = icon_path.suffix.lower()
                media_type = (
                    "image/jpeg" if ext == ".jpg" or ext == ".jpeg"
                    else "image/png"
                )
                return FileResponse(
                    str(icon_path),
                    media_type=media_type,
                    headers={"Cache-Control": "public, max-age=86400"},
                )
        raise HTTPException(status_code=404, detail="Icon not found")

    # ── Dynamic routes (registered AFTER all static GET routes) ──

    @router.get("/{engine_id}")
    def get_engine_endpoint(engine_id: str) -> Dict[str, Any]:
        """Return a single engine by ID."""
        from .engine import get_engine, to_dict

        engine = get_engine(engine_id)
        if engine is None:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Engine not found")
        return to_dict(engine)

    @router.post("/")
    def add_engine_endpoint(body: EngineRequest) -> Dict[str, Any]:
        """Add a new custom computation engine."""
        from .engine import add_engine, to_dict

        try:
            engine = add_engine(body.model_dump())
            _invalidate_detect_cache()
            return to_dict(engine)
        except ValueError as exc:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail=str(exc))

    @router.put("/{engine_id}")
    def update_engine_endpoint(
        engine_id: str, body: EngineRequest,
    ) -> Dict[str, Any]:
        """Update an existing engine."""
        from .engine import update_engine, to_dict

        try:
            engine = update_engine(engine_id, body.model_dump())
            _invalidate_detect_cache()
            return to_dict(engine)
        except ValueError as exc:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail=str(exc))

    @router.delete("/{engine_id}")
    def delete_engine_endpoint(engine_id: str) -> Dict[str, Any]:
        """Delete a computation engine."""
        from .engine import delete_engine

        try:
            ok = delete_engine(engine_id)
            _invalidate_detect_cache()
            return {"success": ok}
        except ValueError as exc:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail=str(exc))

    return router


# ──────────────────────────────────────────────────────────────────────────────
# Avatar — Online fetch + local cache + team composition
# ──────────────────────────────────────────────────────────────────────────────


def _resource_dir() -> Path:
    """Return the avatar cache directory under the default workspace resource."""
    d = Path.home() / ".qwenpaw" / "workspaces" / "default" / "resource"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _default_avatar_path() -> Path:
    """Return the path to the bundled Default.png fallback image."""
    return PLUGIN_DIR / "ui" / "Default.png"


def _seed_to_filename(seed: str) -> str:
    """Convert a seed string to a safe filename component."""
    h = hashlib.md5(seed.encode("utf-8")).hexdigest()[:12]
    safe = "".join(c if c.isalnum() or c in "._-" else "_" for c in seed)[:20]
    return f"Avatar_{safe}_{h}.png"


def _cached_avatar_path(seed: str) -> Path:
    """Return the local cache path for a given seed's avatar PNG."""
    return _resource_dir() / _seed_to_filename(seed)


def _fetch_avatar_png_online(seed: str) -> bytes:
    """Fetch a PNG avatar from the DiceBear online API.

    Returns the raw PNG bytes.  Raises on network error.
    """
    import httpx

    resp = httpx.get(
        "https://api.dicebear.com/9.x/notionists/png",
        params={"seed": seed},
        timeout=5,
    )
    resp.raise_for_status()
    return resp.content


def _get_or_fetch_avatar_png(seed: str) -> Path:
    """Return the path to a cached avatar PNG, fetching from network if needed.

    Flow:
    1. If cached file exists -> return it
    2. If not -> fetch from DiceBear online API -> save -> return
    3. If fetch fails -> return Default.png path
    """
    cached = _cached_avatar_path(seed)
    if cached.is_file():
        return cached

    try:
        png_bytes = _fetch_avatar_png_online(seed)
        cached.write_bytes(png_bytes)
        logger.info("[%s] Fetched and cached avatar for seed '%s'", PLUGIN_ID, seed)
        return cached
    except Exception as exc:
        logger.warning("[%s] Failed to fetch avatar for seed '%s': %s",
                       PLUGIN_ID, seed, exc)
        default = _default_avatar_path()
        if default.is_file():
            return default
        raise


# ── Avatar cache pre-warming ────────────────────────────────────────────────

# Preset expert team member names (must match the frontend EXPERT_TEAMS array).
# These are the fixed names that appear in every fresh installation, so we
# can safely pre-fetch their avatars at startup.
_PRESET_EXPERT_NAMES: list[str] = [
    "测井分析师",
    "地球物理专家",
    "油藏工程师",
    "钻井工程师",
    "采油工程师",
    "PVT 分析师",
]

# Preset team compositions (must match the frontend EXPERT_TEAMS members).
_PRESET_TEAMS: list[list[str]] = [
    ["测井分析师", "地球物理专家", "油藏工程师"],
    ["钻井工程师", "地球物理专家", "采油工程师"],
    ["油藏工程师", "钻井工程师", "采油工程师"],
    ["PVT 分析师", "地球物理专家", "油藏工程师"],
]


def _collect_agent_names() -> list[str]:
    """Collect all configured agent display names from config."""
    names: list[str] = []
    try:
        from qwenpaw.config.config import load_agent_config
        from qwenpaw.config.utils import load_config

        config = load_config()
        for agent_id in config.agents.profiles:
            try:
                agent_config = load_agent_config(agent_id)
                if agent_config.name:
                    names.append(agent_config.name)
            except Exception:
                continue
    except Exception as exc:
        logger.debug("[%s] Could not collect agent names: %s", PLUGIN_ID, exc)
    return names


def _prewarm_avatar_cache() -> None:
    """Pre-fetch all known expert avatars into local cache.

    Runs in a background daemon thread at startup.  Fetches:
    1. Individual avatars for all preset expert names
    2. Individual avatars for all configured agent names
    3. Composed team avatars for all preset teams

    Already-cached files are skipped (the fetch functions check
    for existing files first).  This means subsequent on-demand
    requests from the frontend will hit the local cache and
    return instantly without any network I/O.
    """
    try:
        # Collect all unique names that need avatars
        all_names: set[str] = set(_PRESET_EXPERT_NAMES)

        # Add dynamically configured agent names
        agent_names = _collect_agent_names()
        all_names.update(agent_names)

        logger.info(
            "[%s] Pre-warming %d avatar(s) in background...",
            PLUGIN_ID, len(all_names),
        )

        # Pre-fetch individual avatars
        fetched = 0
        for name in all_names:
            try:
                path = _get_or_fetch_avatar_png(name)
                if path.is_file():
                    fetched += 1
            except Exception:
                continue

        # Pre-compose team avatars
        team_count = 0
        for team_members in _PRESET_TEAMS:
            try:
                team_hash = hashlib.md5(
                    ",".join(team_members).encode("utf-8"),
                ).hexdigest()[:12]
                team_cache = _resource_dir() / f"TeamAvatar_{team_hash}.png"
                if team_cache.is_file():
                    continue  # Already cached
                png_bytes = _compose_team_avatar(team_members)
                team_cache.write_bytes(png_bytes)
                team_count += 1
            except Exception:
                continue

        logger.info(
            "[%s] Avatar pre-warm complete: %d individual, %d team avatars",
            PLUGIN_ID, fetched, team_count,
        )
    except Exception as exc:
        logger.warning("[%s] Avatar pre-warm failed: %s", PLUGIN_ID, exc)


# ── Team avatar composition (PIL) ───────────────────────────────────────────

_CANVAS_SIZE = 256
_BG_COLOR = (240, 240, 240, 255)


def _circle_mask(size: int):
    """Return a (size, size) white circle mask (L mode)."""
    from PIL import Image, ImageDraw

    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).ellipse((0, 0, size - 1, size - 1), fill=255)
    return m


def _apply_circle_clip(img, bg_color=_BG_COLOR):
    """Crop a square image into a circle, filling the rest with bg_color."""
    from PIL import Image

    w, h = img.size
    s = min(w, h)
    result = Image.new("RGBA", (s, s), bg_color)
    mask = _circle_mask(s)
    cropped = img.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2))
    result.paste(cropped, (0, 0), mask)
    return result


def _team_positions(n: int, radius: float, cx: float, cy: float):
    """Return n positions evenly distributed on a circle arc, first at top."""
    start = -math.pi / 2
    return [
        (cx + radius * math.cos(start + 2 * math.pi * i / n),
         cy + radius * math.sin(start + 2 * math.pi * i / n))
        for i in range(n)
    ]


def _compose_team_avatar(seeds: list[str]) -> bytes:
    """Compose a team avatar from individual member avatars.

    Takes 2-5 member seeds; if more than 5, takes the first 5.
    Returns the composed PNG as bytes.
    """
    from PIL import Image, ImageDraw
    from io import BytesIO

    n = len(seeds)
    if n < 2:
        path = _get_or_fetch_avatar_png(seeds[0])
        return path.read_bytes()
    if n > 5:
        seeds = seeds[:5]
        n = 5

    canvas = Image.new("RGBA", (_CANVAS_SIZE, _CANVAS_SIZE), _BG_COLOR)

    circle_r = _CANVAS_SIZE * 0.27
    icon_sz = int(_CANVAS_SIZE * 0.40)
    cx = cy = _CANVAS_SIZE / 2

    positions = _team_positions(n, circle_r, cx, cy)
    av_mask = _circle_mask(icon_sz)

    avatars = []
    for seed in seeds:
        path = _get_or_fetch_avatar_png(seed)
        img = Image.open(path).convert("RGBA")
        img = img.resize((icon_sz, icon_sz), Image.LANCZOS)

        tile = Image.new("RGBA", (icon_sz, icon_sz))
        tile.paste(img, (0, 0), av_mask)
        draw = ImageDraw.Draw(tile)
        draw.ellipse((0, 0, icon_sz - 1, icon_sz - 1),
                     outline=(255, 255, 255, 220), width=5)
        avatars.append(tile)

    for pos, av in zip(positions, avatars):
        x = int(pos[0] - icon_sz / 2)
        y = int(pos[1] - icon_sz / 2)
        canvas.paste(av, (x, y), av)

    # Subtle connecting lines
    draw = ImageDraw.Draw(canvas)
    for i in range(n):
        for j in range(i + 1, n):
            draw.line([positions[i], positions[j]],
                      fill=(180, 190, 200, 60), width=2)

    canvas = _apply_circle_clip(canvas)

    buf = BytesIO()
    canvas.save(buf, format="PNG")
    return buf.getvalue()


def _build_avatar_router() -> APIRouter:
    """Build a FastAPI router for avatar generation."""
    router = APIRouter()

    @router.get("/{seed}")
    def get_avatar(seed: str) -> Response:
        """Return a PNG avatar for the given seed.

        Flow: local cache -> DiceBear online API -> Default.png fallback.
        """
        try:
            path = _get_or_fetch_avatar_png(seed)
            return FileResponse(
                str(path),
                media_type="image/png",
                headers={"Cache-Control": "public, max-age=3600"},
            )
        except Exception as exc:
            logger.error("[%s] Avatar serving failed for seed '%s': %s",
                         PLUGIN_ID, seed, exc)
            default = _default_avatar_path()
            if default.is_file():
                return FileResponse(
                    str(default),
                    media_type="image/png",
                    headers={"Cache-Control": "public, max-age=3600"},
                )
            from fastapi import HTTPException
            raise HTTPException(status_code=500, detail="Avatar unavailable")

    @router.get("/team/{team_id}")
    def get_team_avatar(team_id: str) -> Response:
        """Compose and return a team avatar from member seeds.

        The ``team_id`` is a comma-separated list of member names (seeds).
        Example: /team/Alice,Bob,Charlie
        """
        seeds = [s.strip() for s in team_id.split(",") if s.strip()]
        if not seeds:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="No seeds provided")

        team_hash = hashlib.md5(",".join(seeds).encode("utf-8")).hexdigest()[:12]
        team_cache = _resource_dir() / f"TeamAvatar_{team_hash}.png"

        if team_cache.is_file():
            return FileResponse(
                str(team_cache),
                media_type="image/png",
                headers={"Cache-Control": "public, max-age=3600"},
            )

        try:
            png_bytes = _compose_team_avatar(seeds)
            team_cache.write_bytes(png_bytes)
            return Response(
                content=png_bytes,
                media_type="image/png",
                headers={"Cache-Control": "public, max-age=3600"},
            )
        except Exception as exc:
            logger.error("[%s] Team avatar failed for seeds %s: %s",
                         PLUGIN_ID, seeds, exc)
            try:
                path = _get_or_fetch_avatar_png(seeds[0])
                return FileResponse(
                    str(path),
                    media_type="image/png",
                    headers={"Cache-Control": "public, max-age=3600"},
                )
            except Exception:
                default = _default_avatar_path()
                if default.is_file():
                    return FileResponse(
                        str(default),
                        media_type="image/png",
                        headers={"Cache-Control": "public, max-age=3600"},
                    )
                from fastapi import HTTPException
                raise HTTPException(status_code=500, detail="Avatar unavailable")

    return router


def _build_sim_router() -> APIRouter:
    """Build a FastAPI router for simulation job monitoring (SSE + list)."""
    import asyncio
    import json

    from fastapi.responses import StreamingResponse

    router = APIRouter()

    @router.get("/jobs")
    def list_sim_jobs() -> Dict[str, Any]:
        """List all known simulation jobs (from persistent store + memory)."""
        try:
            from .engine.tools import job_store
            from .engine.tools.launcher import get_all_jobs

            # Merge persisted jobs with in-memory jobs
            persisted = job_store.list_jobs()
            result: dict[str, Any] = {}

            # Start with persisted jobs
            for jid, meta in persisted.items():
                result[jid] = {
                    "job_id": meta.get("job_id", jid),
                    "simulator": meta.get("simulator", ""),
                    "status": meta.get("status", "unknown"),
                    "deck_file": meta.get("deck_file", ""),
                    "pid": meta.get("pid", 0),
                    "start_ts": meta.get("start_ts"),
                    "end_ts": meta.get("end_ts"),
                }

            # Overlay in-memory jobs (may have more recent status)
            for jid, job in get_all_jobs().items():
                result[jid] = {
                    "job_id": job.job_id,
                    "simulator": job.simulator,
                    "status": job.status,
                    "deck_file": job.deck_file,
                    "pid": job.pid,
                    "start_ts": job.start_ts if job.start_ts > 0 else None,
                    "end_ts": job.end_ts,
                }

            return {"jobs": list(result.values())}
        except Exception as exc:
            logger.error("[%s] Failed to list jobs: %s", PLUGIN_ID, exc)
            return {"jobs": [], "error": str(exc)}

    @router.get("/jobs/{job_id}/stream")
    async def job_stream(job_id: str):
        """SSE stream of simulation job status updates.

        Polls the job status every 5 seconds and sends updates as SSE
        events.  The stream closes when the job reaches a terminal
        status (completed / failed / timeout / error).
        """

        async def event_stream():
            try:
                from .engine.tools.launcher import _get_job
            except Exception:
                yield f"data: {json.dumps({'error': 'Job store unavailable'})}\n\n"
                return

            while True:
                job = _get_job(job_id)
                if not job:
                    yield f"data: {json.dumps({'error': 'Job not found', 'job_id': job_id})}\n\n"
                    return

                data: dict[str, Any] = {
                    "job_id": job.job_id,
                    "status": job.status,
                    "simulator": job.simulator,
                    "pid": job.pid,
                }

                if job.start_ts > 0:
                    elapsed = time.time() - job.start_ts
                    data["elapsed"] = round(elapsed, 1)
                    data["remaining"] = round(max(0, job.timeout - elapsed), 1)

                if job.returncode is not None:
                    data["returncode"] = job.returncode
                if job.error:
                    data["error"] = job.error
                if job.end_ts:
                    data["end_ts"] = job.end_ts

                yield f"data: {json.dumps(data)}\n\n"

                if job.status in ("completed", "failed", "timeout", "error"):
                    return

                await asyncio.sleep(5)

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    return router


class UGSciPlugin:
    """UGSci plugin backend entry point."""

    def register(self, api) -> None:
        """Register plugin components via the PluginApi."""
        logger.info(
            "[%s] Plugin registered — petroleum domain enhancement active",
            PLUGIN_ID,
        )

        # Sync skills into the shared skill pool (not workspaces).
        try:
            api.register_startup_hook(
                hook_name="ugsci_sync_skills_to_pool",
                callback=self._on_startup_sync_skills,
                priority=80,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Startup skill sync hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

        # Register cleanup on uninstall
        try:
            api.register_uninstall_hook(
                hook_name="ugsci_remove_pool_skills",
                callback=self._on_uninstall_remove_skills,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Uninstall hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

        # Register startup hook for any future backend-side initialization
        try:
            api.register_startup_hook(
                hook_name="ugsci_init",
                callback=self._on_startup,
                priority=50,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Startup initialization hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

        # ── Register UGSci Team workflow mode (OMP-backed) ───────────
        # Registers the /ugsci-team slash command and the 5-phase
        # state machine (plan → dispatch → verify → synthesize → completed).
        try:
            from .team.mode import UGSciTeamMode

            api.register_mode(UGSciTeamMode)
            logger.info(
                "[%s] UGSci Team mode registered (/ugsci-team)",
                PLUGIN_ID,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register UGSci Team mode: %s",
                PLUGIN_ID, exc,
                exc_info=True,
            )

        # Register HTTP routes for team workflow state queries
        try:
            from .team.api import build_team_router

            api.register_http_router(
                build_team_router(),
                prefix="/ugsci/team",
                tags=["ugsci-team"],
            )
            logger.info(
                "[%s] HTTP router registered at /api/ugsci/team",
                PLUGIN_ID,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register team workflow HTTP router: %s",
                PLUGIN_ID, exc,
            )

        # Initialize default computation engines
        try:
            from .engine import init_default_engines
            count = init_default_engines()
            if count:
                logger.info(
                    "[%s] Created %d default engine(s)",
                    PLUGIN_ID, count,
                )
        except Exception as exc:
            logger.error(
                "[%s] Failed to init default engines: %s",
                PLUGIN_ID, exc,
            )

        # Register HTTP routes for computation engine management
        try:
            api.register_http_router(
                _build_engine_router(),
                prefix="/ugsci/engines",
                tags=["ugsci-engines"],
            )
            logger.info(
                "[%s] HTTP router registered at /api/ugsci/engines",
                PLUGIN_ID,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register engine management HTTP router: %s",
                PLUGIN_ID,
                exc,
            )

        # Register HTTP routes for DiceBear avatar generation
        try:
            api.register_http_router(
                _build_avatar_router(),
                prefix="/ugsci/avatar",
                tags=["ugsci-avatar"],
            )
            logger.info(
                "[%s] HTTP router registered at /api/ugsci/avatar",
                PLUGIN_ID,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register avatar HTTP router: %s",
                PLUGIN_ID,
                exc,
            )

        # Register HTTP routes for simulation job monitoring (SSE + list)
        try:
            api.register_http_router(
                _build_sim_router(),
                prefix="/ugsci/sim",
                tags=["ugsci-sim"],
            )
            logger.info(
                "[%s] HTTP router registered at /api/ugsci/sim",
                PLUGIN_ID,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register sim monitoring HTTP router: %s",
                PLUGIN_ID,
                exc,
            )

        # ── Register simulation control tools ────────────────────────
        # Five tools that let agents launch, monitor, read, edit, and
        # analyze numerical simulations (Eclipse / CMG / COMSOL).
        # Tools are enabled by default because the plugin is purpose-built
        # for simulation workflows.  Each tool gracefully handles the
        # "no engine configured" case by returning a helpful error.
        try:
            from .engine.tools import (
                launch_simulation,
                check_simulation_status,
                wait_for_simulation,
                read_simulation_results,
                edit_simulation_deck,
                analyze_simulation,
            )

            sim_tools_meta = [
                (
                    "launch_simulation", launch_simulation,
                    "启动数值模拟 (Eclipse/CMG/COMSOL)", "🚀",
                ),
                (
                    "check_simulation_status", check_simulation_status,
                    "查询模拟运行状态与收敛性", "📊",
                ),
                (
                    "wait_for_simulation", wait_for_simulation,
                    "等待模拟完成 (内部轮询，零token消耗)", "⏳",
                ),
                (
                    "read_simulation_results", read_simulation_results,
                    "读取模拟结果数据", "📖",
                ),
                (
                    "edit_simulation_deck", edit_simulation_deck,
                    "修改模拟器输入文件", "✏️",
                ),
                (
                    "analyze_simulation", analyze_simulation,
                    "分析模拟结果 (收敛/平衡/性能/对比)", "🔬",
                ),
            ]
            for tool_name, tool_func, desc, icon in sim_tools_meta:
                try:
                    api.register_tool(
                        tool_name=tool_name,
                        tool_func=tool_func,
                        description=desc,
                        icon=icon,
                        enabled=True,
                    )
                except Exception as exc:
                    logger.error(
                        "[%s] Failed to register tool '%s': %s",
                        PLUGIN_ID, tool_name, exc,
                    )
            logger.info(
                "[%s] Simulation control tools registered (%d tools)",
                PLUGIN_ID, len(sim_tools_meta),
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register simulation tools: %s",
                PLUGIN_ID, exc,
                exc_info=True,
            )

    async def _on_startup(self) -> None:
        """Called when the QwenPaw application starts."""
        logger.info("[%s] Startup hook executed", PLUGIN_ID)

        # Pre-warm avatar cache in a background thread so that
        # expert / team avatars are already on disk by the time
        # the frontend renders them.  This avoids on-demand
        # network fetches (DiceBear API) that block request threads.
        thread = threading.Thread(
            target=_prewarm_avatar_cache,
            name="ugsci-avatar-prewarm",
            daemon=True,
        )
        thread.start()

    async def _on_startup_sync_skills(self) -> None:
        """Sync plugin skills to the shared skill pool on startup."""
        skills_dir = PLUGIN_DIR / "skills"
        if not skills_dir.exists():
            return
        try:
            count = _sync_plugin_skills_to_pool(PLUGIN_ID, skills_dir)
            if count:
                logger.info(
                    "[%s] Synced %d skill(s) to skill pool",
                    PLUGIN_ID,
                    count,
                )
        except Exception as exc:
            logger.error(
                "[%s] Failed to sync skills to pool: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _on_uninstall_remove_skills(
        plugin_id: str,
        delete_files: bool = False,
    ) -> None:
        """Remove plugin-sourced skills from the pool on uninstall."""
        try:
            count = _remove_plugin_pool_skills(plugin_id)
            if count:
                logger.info(
                    "[%s] Removed %d skill(s) from pool",
                    plugin_id,
                    count,
                )
        except Exception as exc:
            logger.error(
                "Failed to remove pool skills for '%s': %s",
                plugin_id,
                exc,
                exc_info=True,
            )


# Module-level plugin object — required by the QwenPaw plugin loader.
plugin = UGSciPlugin()
