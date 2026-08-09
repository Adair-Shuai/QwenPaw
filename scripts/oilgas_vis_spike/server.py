#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# pylint: skip-file
"""Standalone FastAPI server for the Oil & Gas visualization spike.

Serves the viewer HTML page, binary data files, and well log data.
No plugin infrastructure required — just run this script and open
the URL in a browser or Tauri WebView.

Usage:
    .venv/bin/python scripts/oilgas_vis_spike/server.py
    # Then open: http://localhost:8765/viewer

The server also provides:
    GET  /data/bin/manifest.json     — Dataset catalog
    GET  /data/bin/{filename}         — Binary data files
    GET  /data/{filename}.json        — Original JSON data files
    GET  /viewer                      — Three.js visualization page
    GET  /health                      — Health check
    POST /shutdown                    — Graceful shutdown
"""

from __future__ import annotations

import logging
import os
import signal
import sys
import threading
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
import uvicorn

# ─── Paths ──────────────────────────────────────────────────────────────────

SPIKE_DIR = Path(__file__).parent
DATA_DIR = SPIKE_DIR / "data"
BIN_DIR = DATA_DIR / "bin"

# ─── App ────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("oilgas_vis_spike")

app = FastAPI(title="Oil & Gas Visualization Spike", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ─────────────────────────────────────────────────────────────────


@app.get("/health")
async def health():
    """Health check endpoint."""
    datasets = []
    manifest_path = BIN_DIR / "manifest.json"
    if manifest_path.exists():
        import json

        manifest = json.loads(manifest_path.read_text())
        for ds in manifest.get("datasets", []):
            datasets.append(
                {
                    "id": ds["id"],
                    "name": ds["name"],
                    "cells": ds["n_cells"],
                    "vertices": ds["n_vertices"],
                },
            )
    return {
        "status": "ok",
        "service": "oilgas-visualization-spike",
        "version": "0.1.0",
        "data_dir": str(DATA_DIR),
        "bin_dir": str(BIN_DIR),
        "datasets": datasets,
    }


@app.get("/viewer")
async def viewer_page():
    """Serve the Three.js viewer HTML page."""
    html_path = SPIKE_DIR / "viewer.html"
    if not html_path.exists():
        raise HTTPException(404, "viewer.html not found")
    return FileResponse(
        html_path,
        media_type="text/html; charset=utf-8",
        headers={"Cache-Control": "no-cache"},
    )


@app.get("/data/bin/manifest.json")
async def get_manifest():
    """Serve the dataset manifest."""
    manifest_path = BIN_DIR / "manifest.json"
    if not manifest_path.exists():
        raise HTTPException(
            404,
            "manifest.json not found — run prepare_data.py first",
        )
    return (
        JSONResponse(
            (
                json.loads(manifest_path.read_text())
                if False  # use FileResponse for correct content-type
                else None
            ),
        )
        if False
        else FileResponse(
            manifest_path,
            media_type="application/json",
            headers={"Cache-Control": "no-cache"},
        )
    )


@app.get("/data/bin/{filename}")
async def get_binary_file(filename: str):
    """Serve binary data files."""
    # Prevent path traversal
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(400, "Invalid filename")
    file_path = BIN_DIR / filename
    if not file_path.exists():
        raise HTTPException(404, f"File not found: {filename}")

    # Determine content type
    if filename.endswith(".f32"):
        media_type = "application/octet-stream"
    elif filename.endswith(".u32"):
        media_type = "application/octet-stream"
    elif filename.endswith(".json"):
        media_type = "application/json"
    else:
        media_type = "application/octet-stream"

    return FileResponse(
        file_path,
        media_type=media_type,
        headers={
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Expose-Headers": "Content-Length",
        },
    )


@app.get("/data/{filename}")
async def get_json_file(filename: str):
    """Serve original JSON data files from the data directory."""
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(400, "Invalid filename")
    file_path = DATA_DIR / filename
    if not file_path.exists():
        raise HTTPException(404, f"File not found: {filename}")
    return FileResponse(file_path, media_type="application/json")


@app.get("/")
async def root():
    """Redirect to the viewer page."""
    return PlainTextResponse(
        "Oil & Gas Visualization Spike\n\n"
        "Endpoints:\n"
        "  /viewer          — Three.js 3D grid viewer\n"
        "  /health          — Health check & dataset list\n"
        "  /data/bin/manifest.json — Dataset manifest\n"
        "  /data/bin/{file} — Binary data files\n"
        "\n"
        "Open http://localhost:8765/viewer in your browser or Tauri WebView.\n",
    )


@app.post("/shutdown")
async def shutdown():
    """Graceful shutdown endpoint."""
    logger.info("Shutdown requested")
    os.kill(os.getpid(), signal.SIGINT)
    return {"status": "shutting down"}


# ─── Main ────────────────────────────────────────────────────────────────────


def main():
    port = int(os.environ.get("OILGAS_VIS_PORT", "8765"))
    host = os.environ.get("OILGAS_VIS_HOST", "127.0.0.1")

    logger.info("=== Oil & Gas Visualization Spike Server ===")
    logger.info("Data directory: %s", DATA_DIR)
    logger.info("Binary directory: %s", BIN_DIR)

    # Check if data is prepared
    manifest_path = BIN_DIR / "manifest.json"
    if not manifest_path.exists():
        logger.warning(
            "manifest.json not found! Run 'python prepare_data.py' first.",
        )
        logger.warning("Starting server anyway — viewer will show an error.")
    else:
        import json

        manifest = json.loads(manifest_path.read_text())
        logger.info("Datasets available:")
        for ds in manifest.get("datasets", []):
            logger.info(
                "  %s: %d cells, %d vertices",
                ds["name"],
                ds["n_cells"],
                ds["n_vertices"],
            )

    logger.info("Viewer URL: http://%s:%d/viewer", host, port)
    logger.info("Press Ctrl+C to stop.\n")

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info",
    )


if __name__ == "__main__":
    main()
