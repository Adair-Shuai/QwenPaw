# -*- coding: utf-8 -*-
"""FastAPI router for UGSci visualization.

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
import math
import struct
import io
import csv
import asyncio
import logging
import tempfile
from pathlib import Path
from typing import Any, Literal

from fastapi import (
    APIRouter, HTTPException, UploadFile, File,
    Request, Response, Query,
)
from fastapi.responses import (
    FileResponse, JSONResponse, PlainTextResponse, StreamingResponse,
)
from pydantic import BaseModel, Field

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.api")

MAX_UPLOAD_SIZE = 500 * 1024 * 1024


class IntersectionRequest(BaseModel):
    """Validated JSON body for a curtain-section request."""

    polyline_x: list[float] = Field(min_length=2, max_length=10_000)
    polyline_y: list[float] = Field(min_length=2, max_length=10_000)
    z_min: float = 0.0
    z_max: float = 5000.0
    name: str = Field(default="section", max_length=128)


class CommandAckRequest(BaseModel):
    status: str = Field(default="completed", pattern="^(completed|failed)$")
    result: Any | None = None
    error: str | None = Field(default=None, max_length=2000)


class WorkspaceImportRequest(BaseModel):
    """Reference a workspace file without copying it through the browser."""

    path: str = Field(min_length=1, max_length=4096)
    root: Literal["project", "workspace"] = "project"
    name: str = Field(default="", max_length=256)


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
            "status": "ok", "service": "ugsci-visualization",
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
        companion_file: UploadFile | None = None,
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

        companion_paths: list[Path] = []
        if companion_file:
            safe_companion_name = sanitize_filename(companion_file.filename or "companion")
            if safe_companion_name is None:
                raise HTTPException(400, "Invalid companion filename")
            companion_suffix = Path(safe_companion_name).suffix
            with tempfile.NamedTemporaryFile(
                dir=data_dir, prefix=".upload_companion_", suffix=companion_suffix,
                delete=True,
            ) as marker:
                companion_path = Path(marker.name)
            try:
                await _save_upload(companion_file, companion_path)
                companion_paths.append(companion_path)
            except Exception:
                upload_path.unlink(missing_ok=True)
                if prop_path:
                    prop_path.unlink(missing_ok=True)
                raise

        job = job_manager.submit_import(
            safe_dataset_name, upload_path, prop_path, bin_dir,
            companion_paths=companion_paths,
        )
        return JSONResponse({
            "job_id": job.job_id, "name": name, "status": job.status,
            "message": "Import submitted. Poll /imports/{job_id}/events for progress.",
        }, status_code=202)

    @router.post("/imports/workspace")
    async def create_workspace_import(
        payload: WorkspaceImportRequest,
        request: Request,
    ):
        """Import a workspace file by path, avoiding browser-side buffering.

        The worker reads the resolved source file directly.  This keeps large
        CMG/Eclipse decks out of the browser heap and removes the old
        download-to-Blob-to-multipart round trip.  Resolution is performed
        against the authenticated agent/project root and never accepts an
        arbitrary filesystem path.
        """
        from qwenpaw.app.agent_context import (
            get_agent_for_request,
            get_project_dir_for_request,
        )
        from qwenpaw.services.workspace_files import (
            InvalidWorkspacePath,
            resolve_workspace_path,
        )

        workspace = await get_agent_for_request(request)
        files_root = (
            workspace.workspace_dir
            if payload.root == "workspace"
            else await get_project_dir_for_request(request, workspace)
        )

        try:
            target = await asyncio.to_thread(
                resolve_workspace_path, files_root, payload.path,
            )
            info = await asyncio.to_thread(target.stat)
        except InvalidWorkspacePath as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except (FileNotFoundError, OSError) as exc:
            raise HTTPException(status_code=404, detail="File not found") from exc
        if not info or not target.is_file():
            raise HTTPException(status_code=404, detail="File not found")

        # Keep the same filename/suffix routing as multipart imports while
        # never copying the source.  resolve_workspace_path already enforces
        # the workspace root boundary.
        safe_name = sanitize_filename(target.name)
        if safe_name is None:
            raise HTTPException(status_code=400, detail="Invalid workspace filename")
        from .security import sanitize_identifier
        dataset_name = sanitize_identifier(
            payload.name or target.stem,
            Path(safe_name).stem,
        )

        job = job_manager.submit_import(
            dataset_name,
            target,
            None,
            bin_dir,
        )
        return JSONResponse({
            "job_id": job.job_id,
            "name": payload.name or target.stem,
            "status": job.status,
            "source": "workspace",
            "size": info.st_size,
            "message": "Workspace import submitted; poll /imports/{job_id} for progress.",
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
    async def drain_viewer_commands(
        viewer_id: str = Query("default", alias="viewerId", max_length=128),
    ):
        """Return pending Agent commands once for this viewer instance."""
        return {
            "commands": [
                {
                    "commandId": item.command_id,
                    "command": item.command,
                    "args": item.args,
                }
                for item in command_bus.drain(viewer_id)
            ],
        }

    @router.post("/commands/{command_id}/ack")
    async def acknowledge_viewer_command(command_id: str, payload: CommandAckRequest):
        """Receive an execution ACK from the browser viewer."""
        if not command_bus.acknowledge(
            command_id,
            status=payload.status,
            result=payload.result,
            error=payload.error,
        ):
            raise HTTPException(404, f"Command not found: {command_id}")
        return {"commandId": command_id, "status": payload.status}

    @router.get("/commands/{command_id}")
    async def get_viewer_command_status(command_id: str):
        status = command_bus.status(command_id)
        if status is None:
            raise HTTPException(404, f"Command not found: {command_id}")
        return status

    @router.get("/datasets/{dataset_id}/manifest")
    async def get_dataset_manifest(dataset_id: str):
        ds = manifest_store.get_dataset(dataset_id)
        if not ds:
            raise HTTPException(404, f"Dataset not found: {dataset_id}")
        ds["resources"] = _build_resource_descriptors(ds, resource_store)
        return JSONResponse(ds)

    @router.get("/datasets/{dataset_id}/stats")
    async def dataset_property_stats(dataset_id: str, property: str = ""):
        """Return descriptive statistics for one cached scalar property."""
        ds = manifest_store.get_dataset(dataset_id)
        if not ds:
            raise HTTPException(404, f"Dataset not found: {dataset_id}")
        filename = (ds.get("files", {}).get("scalars", {}) or {}).get(property)
        if not filename:
            raise HTTPException(404, f"Property not found: {property}")
        try:
            path = resource_store.get_path(filename)
        except ValueError:
            raise HTTPException(400, "Invalid property resource")
        if not path.exists():
            raise HTTPException(404, "Property resource is missing")
        raw = path.read_bytes()
        type_code = "f" if filename.endswith(".f32") else "I"
        width = 4
        values = struct.unpack(f"<{len(raw) // width}{type_code}", raw)
        finite = [float(v) for v in values if math.isfinite(float(v))]
        if not finite:
            raise HTTPException(422, "Property contains no finite values")
        ordered = sorted(finite)
        percentile = lambda p: ordered[min(len(ordered) - 1, int((len(ordered) - 1) * p))]
        return {
            "dataset_id": dataset_id,
            "property": property,
            "count": len(finite),
            "min": min(finite),
            "max": max(finite),
            "mean": sum(finite) / len(finite),
            "p10": percentile(0.10),
            "p50": percentile(0.50),
            "p90": percentile(0.90),
        }

    @router.get("/datasets/{dataset_id}/cells/{cell_id}")
    async def dataset_cell_details(dataset_id: str, cell_id: int):
        """Return I/J/K, center coordinate and all scalar values for a cell."""
        ds = manifest_store.get_dataset(dataset_id)
        if not ds:
            raise HTTPException(404, f"Dataset not found: {dataset_id}")
        cell_offset = cell_id
        cell_ids_file = ds.get("files", {}).get("cell_ids")
        if cell_ids_file:
            try:
                raw_ids = resource_store.get_path(cell_ids_file).read_bytes()
                cell_ids = struct.unpack(f"<{len(raw_ids) // 4}I", raw_ids)
                cell_offset = cell_ids.index(cell_id)
            except (ValueError, OSError, struct.error):
                raise HTTPException(404, f"Cell not found: {cell_id}")
        elif cell_id < 0 or cell_id >= int(ds.get("n_cells", 0)):
            raise HTTPException(404, f"Cell not found: {cell_id}")
        dims = ds.get("grid_dims") or []
        ijk = None
        if len(dims) == 3 and all(int(v) > 0 for v in dims):
            ni, nj, _nk = (int(v) for v in dims)
            ijk = [cell_id % ni + 1, (cell_id // ni) % nj + 1, cell_id // (ni * nj) + 1]
        positions_file = ds.get("files", {}).get("positions")
        center = None
        if positions_file:
            try:
                raw = resource_store.get_path(positions_file).read_bytes()
                positions = struct.unpack(f"<{len(raw) // 4}f", raw)
                if len(positions) >= (cell_offset + 1) * 24:
                    points = [positions[(cell_offset * 8 + i) * 3:(cell_offset * 8 + i + 1) * 3] for i in range(8)]
                    center = [sum(point[axis] for point in points) / 8 for axis in range(3)]
            except (ValueError, OSError, struct.error):
                center = None
        properties = {}
        for name, filename in (ds.get("files", {}).get("scalars", {}) or {}).items():
            try:
                raw = resource_store.get_path(filename).read_bytes()
                values = struct.unpack(f"<{len(raw) // 4}{'f' if filename.endswith('.f32') else 'I'}", raw)
                if cell_offset < len(values):
                    properties[name] = values[cell_offset]
            except (ValueError, OSError, struct.error):
                continue
        return {"dataset_id": dataset_id, "cell_id": cell_id, "ijk": ijk, "center": center, "properties": properties}

    @router.get("/datasets/{dataset_id}/export")
    async def export_dataset(dataset_id: str, format: str = "json"):
        """Export a portable manifest or a scalar-cell CSV."""
        ds = manifest_store.get_dataset(dataset_id)
        if not ds:
            raise HTTPException(404, f"Dataset not found: {dataset_id}")
        if format == "json":
            return JSONResponse(ds)
        if format != "csv":
            raise HTTPException(400, "format must be json or csv")
        output = io.StringIO()
        fields = ["cell_id"] + list((ds.get("files", {}).get("scalars", {}) or {}).keys())
        writer = csv.DictWriter(output, fieldnames=fields)
        writer.writeheader()
        columns: dict[str, tuple] = {}
        for name, filename in (ds.get("files", {}).get("scalars", {}) or {}).items():
            raw = resource_store.get_path(filename).read_bytes()
            columns[name] = struct.unpack(f"<{len(raw) // 4}{'f' if filename.endswith('.f32') else 'I'}", raw)
        export_cell_ids: tuple[int, ...] | range
        cell_ids_file = ds.get("files", {}).get("cell_ids")
        if cell_ids_file:
            raw_ids = resource_store.get_path(cell_ids_file).read_bytes()
            export_cell_ids = struct.unpack(f"<{len(raw_ids) // 4}I", raw_ids)
        else:
            export_cell_ids = range(int(ds.get("n_cells", 0)))
        for cell_offset, original_cell_id in enumerate(export_cell_ids):
            row = {"cell_id": original_cell_id}
            for name, values in columns.items():
                if cell_offset < len(values): row[name] = values[cell_offset]
            writer.writerow(row)
        return Response(
            output.getvalue(), media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={dataset_id}.csv"},
        )

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

        if not ds.get("metadata", {}).get("managed", False):
            raise HTTPException(409, "Built-in datasets cannot be deleted through cache cleanup")

        deleted = 0
        for filename in set(_get_all_files(ds).values()):
            try:
                deleted += int(resource_store.delete(filename))
            except ValueError:
                logger.warning("Skipped unsafe resource during cleanup: %s", filename)
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
        if not all(math.isfinite(value) for value in [
            *payload.polyline_x, *payload.polyline_y, payload.z_min, payload.z_max,
        ]):
            raise HTTPException(422, "section coordinates must be finite")

        try:
            from .converters.intersection import create_intersection_along_polyline
            from .security import sanitize_identifier
            # The current curtain-section converter constructs geometry from
            # the requested polyline and Z range.  It does not inspect the
            # source grid arrays, so avoid loading potentially gigabytes of
            # positions/indices/cell IDs just to discard them.
            result = create_intersection_along_polyline(
                [], [], [],
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
            "Formats: CMG DAT; Eclipse/tNavigator EGRID/GRID/GRDECL/INIT/UNRST; "
            "ROFF; LAS/DLIS; VTK family; CSV/Arrow/Parquet.\n"
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
        "cmg": True,
        "tnavigator": has_module("xtgeo"),
        "vtk": has_module("meshio"),
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
