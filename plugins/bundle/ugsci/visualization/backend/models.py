# -*- coding: utf-8 -*-
"""Pydantic data models for API request/response validation.

These models define the contract between the frontend and backend,
matching the schemas in contracts/.
"""

from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field


class ImportSource(BaseModel):
    """Source file specification for an import request."""
    workspacePath: str = Field(..., description="Relative path within workspace")
    companionFiles: list[str] = Field(
        default_factory=list, description="Companion files (INIT, UNRST)"
    )


class ImportOptions(BaseModel):
    """Options controlling how a grid is converted."""
    representation: str = Field(
        "full-hexahedron",
        description="boundary-surface | cell-faces-chunked | full-hexahedron",
    )
    properties: list[str] = Field(
        default_factory=list, description="Property names to extract"
    )
    timeSteps: str = Field(
        "manifest-only", description="manifest-only | all | range"
    )
    timeStepRange: list[int] | None = Field(
        None, description="Time step indices when timeSteps='range'"
    )
    chunkTargetTriangles: int = Field(
        500000, ge=10000, description="Max triangles per chunk"
    )
    coordinateOrigin: str = Field(
        "auto", description="auto | origin | centroid"
    )


class ImportRequest(BaseModel):
    """Full import request."""
    source: ImportSource
    options: ImportOptions = Field(default_factory=ImportOptions)
    name: str = ""


class DatasetSummary(BaseModel):
    """Summary of a dataset for listing."""
    id: str
    name: str
    n_cells: int
    n_vertices: int
    source: str = "unknown"


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    service: str = "ugsci-visualization"
    version: str = "0.1.0"
    datasets: list[DatasetSummary] = []
    capabilities: dict[str, bool] = {}


class ResourceDescriptorModel(BaseModel):
    """Resource descriptor matching Section 5.3 of the plan."""
    id: str
    role: str
    url: str
    mediaType: str = "application/octet-stream"
    encoding: str = "raw"
    compression: str | None = "none"
    dtype: str | None = None
    shape: list[int] | None = None
    byteOrder: str = "little"
    byteLength: int
    sha256: str = ""
    objectId: str | None = None
    propertyName: str | None = None
    timeStep: int | None = None


class BenchmarkResult(BaseModel):
    """A single benchmark result."""
    datasetId: str
    p50: float
    p95: float
    p99: float
    fps: float
    drawCalls: int
    triangles: int
    jsHeapMB: float
    duration: int
