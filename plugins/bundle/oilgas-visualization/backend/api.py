# -*- coding: utf-8 -*-
"""FastAPI router for the oilgas-visualization plugin.

Provides 15 endpoints:
- GET  /health                    — Health + capabilities + datasets
- GET  /capabilities               — Available parsers/formats
- GET  /manifest                   — Dataset catalog
- GET  /resource/{filename}        — Binary data (with Range support)
- POST /imports                    — Create async import job
- GET  /imports/{job_id}           — Job status
- GET  /imports/{job_id}/events    — SSE progress
- POST /imports/{job_id}/cancel    — Cancel job
- GET  /datasets                   — List datasets
- GET  /datasets/{id}/manifest     — Per-dataset manifest
- GET  /datasets/{id}/resources/{rid} — Per-dataset resource (Range)
- DELETE /datasets/{id}/cache     — Clear dataset cache
- POST /datasets/{id}/intersections — Generate intersection
- GET  /benchmarks                 — List benchmark results
- POST /benchmarks                 — Save benchmark result
- GET  /                           — API info

Security: safe_resolve, sanitize_filename, atomic manifest write
"""

from __future__ import annotations

import json
import logging
import os
import tempfile
from pathlib import Path
from typing import Any

from fastapi import (
    APIRouter, HTTPException, UploadFile, File,
    Request, Response, Depends,
)
from fastapi.responses import (
    FileResponse, JSONResponse, PlainTextResponse, StreamingResponse,
)
from pydantic import BaseModel, Field

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.api")

MAX_UPLOAD_SIZE = 500 * 1024 * 1024


class IntersectionRequest(BaseModel):
    """Validated JSON body for a curtain-section request."""

    polyline_x: list[float] = Field(min_length=2)
    polyline_y: list[float] = Field(min_length=2)
    z_min: float = 0.0
    z_max: float = 5000.0
    name: str = "section"


async def _save_upload(upload: UploadFile, destination: Path) -> int:
    """Stream an upload to disk while enforcing the size limit."""
    total = 0
    try:
        with destination.open("xb") as output:
            while chunk := await upload.read(1024 * 1024):
                total += len(chunk)
                if total > MAX_UPLOAD_SIZE:
                    raise HTTPException(413, "File too large (max 500 MB)")
                output.write(chunk)
        return total
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        await upload.close()


def build_router(plugin_dir: Path) -> APIRouter:
    """Build the FastAPI router with all endpoints."""
    router = APIRouter()

    data_dir = plugin_dir / "data"
    bin_dir = data_dir / "bin"
    bin_dir.mkdir(parents=True, exist_ok=True)
    benchmark_dir = data_dir / "benchmarks"
    benchmark_dir.mkdir(parents=True, exist_ok=True)

    from .security import safe_resolve, sanitize_filename
    from .jobs.manager import job_manager
    from .cache.layout import CacheLayout
    from .cache.manifest_store import ManifestStore
    from .cache.resource_store import ResourceStore
    from .tools import command_bus

    cache_layout = CacheLayout(data_dir)
    manifest_store = ManifestStore(bin_dir, cache_layout)
    resource_store = ResourceStore(bin_dir)

    # ─── Health ─────────────────────────────────────────────────────────

    @router.get("/health")
    async def health():
        datasets = []
        for ds in manifest_store.read().get("datasets", []):
            datasets.append({
                "id": ds["id"], "name": ds["name"],
                "cells": ds["n_cells"], "vertices": ds["n_vertices"],
                "source": ds.get("source", "unknown"),
            })
        return {
            "status": "ok", "service": "oilgas-visualization",
            "version": "0.1.0", "datasets": datasets,
            "capabilities": _get_capabilities(),
        }

    # ─── Capabilities ──────────────────────────────────────────────────

    @router.get("/capabilities")
    async def capabilities():
        return {"capabilities": _get_capabilities()}

    # ─── Manifest ──────────────────────────────────────────────────────

    @router.get("/manifest")
    async def get_manifest():
        manifest = manifest_store.read()
        # Enrich with ResourceDescriptors
        for ds in manifest.get("datasets", []):
            ds["resources"] = _build_resource_descriptors(ds, resource_store)
        return JSONResponse(manifest)

    # ─── Binary Resource (with Range support) ──────────────────────────

    @router.get("/resource/{filename}")
    async def get_resource(filename: str, request: Request):
        safe_name = sanitize_filename(filename)
        if safe_name is None:
            raise HTTPException(400, "Invalid filename")

        file_path = safe_resolve(Path(safe_name), bin_dir)
        if file_path is None or not file_path.exists():
            raise HTTPException(404, f"Resource not found: {filename}")

        # Determine media type
        if filename.endswith((".f32", ".u32", ".i32")):
            media_type = "application/octet-stream"
        elif filename.endswith(".json"):
            media_type = "application/json"
        else:
            media_type = "application/octet-stream"

        # Range support
        file_size = file_path.stat().st_size
        range_header = request.headers.get("range")

        if range_header:
            # Parse Range: bytes=start-end
            try:
                unit, range_spec = range_header.strip().split("=", 1)
                if unit.lower() != "bytes" or "," in range_spec:
                    raise ValueError("unsupported range")
                start_str, end_str = range_spec.strip().split("-")
                if not start_str and not end_str:
                    raise ValueError("empty range")
                if not start_str:
                    suffix_length = int(end_str)
                    if suffix_length <= 0:
                        raise ValueError("invalid suffix")
                    start = max(file_size - suffix_length, 0)
                    end = file_size - 1
                else:
                    start = int(start_str)
                    end = int(end_str) if end_str else file_size - 1
                end = min(end, file_size - 1)
                if start < 0 or start >= file_size or end < start:
                    raise ValueError("unsatisfiable range")
                content_length = end - start + 1

                def range_generator():
                    with open(file_path, "rb") as f:
                        f.seek(start)
                        remaining = content_length
                        while remaining > 0:
                            chunk = f.read(min(8192, remaining))
                            if not chunk:
                                break
                            remaining -= len(chunk)
                            yield chunk

                return StreamingResponse(
                    range_generator(),
                    media_type=media_type,
                    headers={
                        "Content-Range": f"bytes {start}-{end}/{file_size}",
                        "Content-Length": str(content_length),
                        "Accept-Ranges": "bytes",
                        "Cache-Control": "public, max-age=3600",
                    },
                    status_code=206,
                )
            except (ValueError, IndexError):
                return Response(
                    status_code=416,
                    headers={"Content-Range": f"bytes */{file_size}"},
                )

        return FileResponse(
            file_path, media_type=media_type,
            headers={
                "Cache-Control": "public, max-age=3600",
                "Accept-Ranges": "bytes",
                "Access-Control-Expose-Headers": "Content-Length, Content-Range",
            },
        )

    # ─── Async Import ──────────────────────────────────────────────────

    @router.post("/imports")
    async def create_import(
        file: UploadFile = File(...),
        name: str = "",
        property_file: UploadFile | None = None,
    ):
        if not name:
            name = Path(file.filename or "imported").stem

        safe_grid_name = sanitize_filename(file.filename or "grid")
        if safe_grid_name is None:
            raise HTTPException(400, "Invalid grid filename")

        from .security import sanitize_identifier
        safe_dataset_name = sanitize_identifier(name, Path(safe_grid_name).stem)
        suffix = Path(safe_grid_name).suffix
        with tempfile.NamedTemporaryFile(
            dir=data_dir, prefix=".upload_", suffix=suffix, delete=True,
        ) as marker:
            upload_path = Path(marker.name)
        await _save_upload(file, upload_path)

        prop_path = None
        if property_file:
            safe_prop_name = sanitize_filename(property_file.filename or "prop")
            if safe_prop_name is None:
                raise HTTPException(400, "Invalid property filename")
            prop_suffix = Path(safe_prop_name).suffix
            with tempfile.NamedTemporaryFile(
                dir=data_dir, prefix=".upload_property_", suffix=prop_suffix,
                delete=True,
            ) as marker:
                prop_path = Path(marker.name)
            try:
                await _save_upload(property_file, prop_path)
            except Exception:
                upload_path.unlink(missing_ok=True)
                raise

        job = job_manager.submit_import(
            safe_dataset_name, upload_path, prop_path, bin_dir,
        )
        return JSONResponse({
            "job_id": job.job_id, "name": name, "status": job.status,
            "message": "Import submitted. Poll /imports/{job_id}/events for progress.",
        }, status_code=202)

    @router.get("/imports/{job_id}")
    async def get_job_status(job_id: str):
        job = job_manager.get_job(job_id)
        if not job:
            raise HTTPException(404, f"Job not found: {job_id}")
        return JSONResponse(job.to_dict())

    @router.get("/imports/{job_id}/events")
    async def job_events(job_id: str):
        job = job_manager.get_job(job_id)
        if not job:
            raise HTTPException(404, f"Job not found: {job_id}")

        async def event_generator():
            import asyncio
            while True:
                events = job.drain_events()
                for event in events:
                    yield f"data: {json.dumps(event)}\n\n"
                if job.status in ("completed", "failed", "cancelled"):
                    yield f"data: {json.dumps({'type': 'done', 'status': job.status, 'result': job.result})}\n\n"
                    break
                await asyncio.sleep(0.5)

        return StreamingResponse(
            event_generator(), media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )

    @router.post("/imports/{job_id}/cancel")
    async def cancel_job(job_id: str):
        if job_manager.cancel_job(job_id):
            return JSONResponse({"job_id": job_id, "status": "cancelled"})
        raise HTTPException(400, "Job not found or already finished")

    # ─── Datasets ──────────────────────────────────────────────────────

    @router.get("/datasets")
    async def list_datasets():
        manifest = manifest_store.read()
        return JSONResponse({
            "datasets": [
                {"id": d["id"], "name": d["name"], "n_cells": d["n_cells"],
                 "n_vertices": d["n_vertices"], "source": d.get("source", "")}
                for d in manifest.get("datasets", [])
            ]
        })

    @router.get("/commands")
    async def drain_viewer_commands():
        """Return and atomically consume pending Agent viewer commands."""
        return {
            "commands": [
                {
                    "commandId": item.command_id,
                    "command": item.command,
                    "args": item.args,
                }
                for item in command_bus.drain()
            ],
        }

    @router.get("/datasets/{dataset_id}/manifest")
    async def get_dataset_manifest(dataset_id: str):
        ds = manifest_store.get_dataset(dataset_id)
        if not ds:
            raise HTTPException(404, f"Dataset not found: {dataset_id}")
        ds["resources"] = _build_resource_descriptors(ds, resource_store)
        return JSONResponse(ds)

    @router.get("/datasets/{dataset_id}/resources/{resource_id}")
    async def get_dataset_resource(
        dataset_id: str, resource_id: str, request: Request,
    ):
        ds = manifest_store.get_dataset(dataset_id)
        if not ds:
            raise HTTPException(404, f"Dataset not found: {dataset_id}")

        # Resolve resource_id to actual filename
        all_files = _get_all_files(ds)
        if resource_id not in all_files:
            raise HTTPException(404, f"Resource not found: {resource_id}")

        # Reuse the /resource/{filename} logic via internal redirect
        safe_name = sanitize_filename(all_files[resource_id])
        if safe_name is None:
            raise HTTPException(400, "Invalid resource path")

        file_path = safe_resolve(Path(safe_name), bin_dir)
        if file_path is None or not file_path.exists():
            raise HTTPException(404, f"File not found: {all_files[resource_id]}")

        return FileResponse(
            file_path, media_type="application/octet-stream",
            headers={
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=3600",
            },
        )

    @router.delete("/datasets/{dataset_id}/cache")
    async def clear_dataset_cache(dataset_id: str):
        ds = manifest_store.get_dataset(dataset_id)
        if not ds:
            raise HTTPException(404, f"Dataset not found: {dataset_id}")

        # Delete resource files by prefix
        prefix = dataset_id
        deleted = resource_store.delete_by_prefix(prefix)
        # Remove from manifest
        manifest_store.remove(dataset_id)
        return JSONResponse({
            "dataset_id": dataset_id,
            "deleted_files": deleted,
            "status": "cache-cleared",
        })

    @router.post("/datasets/{dataset_id}/intersections")
    async def create_intersection(
        dataset_id: str,
        payload: IntersectionRequest,
    ):
        ds = manifest_store.get_dataset(dataset_id)
        if not ds:
            raise HTTPException(404, f"Dataset not found: {dataset_id}")
        if len(payload.polyline_x) != len(payload.polyline_y):
            raise HTTPException(422, "polyline_x and polyline_y lengths must match")
        if payload.z_max <= payload.z_min:
            raise HTTPException(422, "z_max must be greater than z_min")

        try:
            from .converters.intersection import create_intersection_along_polyline
            from .security import sanitize_identifier
            # Read grid data (not used directly but available)
            pos_file = ds["files"]["positions"]
            idx_file = ds["files"]["indices"]
            cid_file = ds["files"]["cell_ids"]

            pos_path = safe_resolve(Path(pos_file), bin_dir)
            idx_path = safe_resolve(Path(idx_file), bin_dir)
            cid_path = safe_resolve(Path(cid_file), bin_dir)

            import struct
            positions = []
            if pos_path and pos_path.exists():
                data = pos_path.read_bytes()
                n = len(data) // 4
                positions = list(struct.unpack(f"<{n}f", data))

            indices = []
            if idx_path and idx_path.exists():
                data = idx_path.read_bytes()
                n = len(data) // 4
                indices = list(struct.unpack(f"<{n}I", data))

            cell_ids = []
            if cid_path and cid_path.exists():
                data = cid_path.read_bytes()
                n = len(data) // 4
                cell_ids = list(struct.unpack(f"<{n}I", data))

            result = create_intersection_along_polyline(
                positions, indices, cell_ids,
                payload.polyline_x, payload.polyline_y,
                payload.z_min, payload.z_max,
                sanitize_identifier(payload.name, "section"), bin_dir,
            )
            manifest_store.upsert(result)
            return JSONResponse(result)
        except Exception as exc:
            logger.error("Intersection failed: %s", exc, exc_info=True)
            raise HTTPException(500, f"Intersection generation failed: {exc}")

    # ─── Benchmarks ────────────────────────────────────────────────────

    @router.get("/benchmarks")
    async def list_benchmarks():
        results = []
        if benchmark_dir.exists():
            for f in sorted(benchmark_dir.glob("*.json"), reverse=True):
                try:
                    results.append(json.loads(f.read_text()))
                except Exception:
                    pass
        return JSONResponse({"benchmarks": results})

    @router.post("/benchmarks")
    async def save_benchmark(request: Request):
        try:
            data = await request.json()
            # Validate required fields
            for field in ("datasetId", "p50", "fps"):
                if field not in data:
                    raise HTTPException(400, f"Missing field: {field}")

            import time
            filename = f"bench_{int(time.time())}.json"
            (benchmark_dir / filename).write_text(
                json.dumps(data, indent=2, ensure_ascii=False)
            )
            return JSONResponse({"status": "saved", "filename": filename})
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(500, f"Failed to save benchmark: {exc}")

    # ─── Root ──────────────────────────────────────────────────────────

    @router.get("/")
    async def root():
        return PlainTextResponse(
            "Oil & Gas Visualization API\n\n"
            "Endpoints:\n"
            "  GET  /health                         — Health + capabilities\n"
            "  GET  /capabilities                    — Parsers/formats\n"
            "  GET  /manifest                        — Dataset catalog\n"
            "  GET  /resource/{name}                 — Binary data (Range)\n"
            "  POST /imports                         — Async import\n"
            "  GET  /imports/{id}                    — Job status\n"
            "  GET  /imports/{id}/events             — SSE progress\n"
            "  POST /imports/{id}/cancel             — Cancel job\n"
            "  GET  /datasets                        — List datasets\n"
            "  GET  /datasets/{id}/manifest          — Per-dataset manifest\n"
            "  GET  /datasets/{id}/resources/{rid}    — Per-dataset resource\n"
            "  DELETE /datasets/{id}/cache           — Clear cache\n"
            "  POST /datasets/{id}/intersections     — Generate section\n"
            "  GET  /benchmarks                      — List benchmarks\n"
            "  POST /benchmarks                      — Save benchmark\n"
        )

    return router


def _get_capabilities() -> dict[str, bool]:
    def has_module(name: str) -> bool:
        try:
            __import__(name)
            return True
        except ImportError:
            return False
    return {
        "synthetic": True, "las": has_module("lasio"),
        "dlis": has_module("dlisio"), "roff": has_module("xtgeo"),
        "eclipse": has_module("xtgeo") or has_module("resdata"),
        "segy": has_module("segyio"), "arrow": has_module("pyarrow"),
    }


def _build_resource_descriptors(ds: dict, resource_store) -> list[dict]:
    """Build ResourceDescriptor list for a dataset."""
    descriptors = []
    files = ds.get("files", {})

    if files.get("positions"):
        descriptors.append(resource_store.describe(
            files["positions"], "positions", "float32",
            [ds.get("n_vertices", 0) * 3],
        ))
    if files.get("indices"):
        descriptors.append(resource_store.describe(
            files["indices"], "indices", "uint32",
            [ds.get("n_indices", 0)],
        ))
    if files.get("cell_ids"):
        descriptors.append(resource_store.describe(
            files["cell_ids"], "cell-ids", "uint32",
            [ds.get("n_cells", 0)],
        ))
    for prop_name, fname in files.get("scalars", {}).items():
        dtype = "float32" if fname.endswith(".f32") else "uint32"
        descriptors.append(resource_store.describe(
            fname, "property", dtype,
            [ds.get("n_cells", 0)], prop_name,
        ))

    return descriptors


def _get_all_files(ds: dict) -> dict[str, str]:
    """Map resource_id → filename for a dataset."""
    result = {}
    files = ds.get("files", {})
    for key in ("positions", "indices", "cell_ids"):
        if files.get(key):
            result[files[key]] = files[key]
    for prop_name, fname in files.get("scalars", {}).items():
        result[fname] = fname
    return result


def _update_manifest(bin_dir: Path, dataset_info: dict[str, Any]) -> None:
    """Atomically update the manifest (backward-compatible export)."""
    from .cache.manifest_store import ManifestStore
    from .cache.layout import CacheLayout

    cache = CacheLayout(bin_dir.parent)
    store = ManifestStore(bin_dir, cache)
    store.upsert(dataset_info)
