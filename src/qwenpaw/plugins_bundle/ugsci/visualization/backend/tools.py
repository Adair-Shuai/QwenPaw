# -*- coding: utf-8 -*-
"""Agent tool definitions and Viewer Command Bridge.

Registers Agent tools that allow the AI agent to control the
visualization viewer through structured tool calls. The bridge
ensures commands are delivered to the viewer even if it's not
currently mounted (pending queue with deduplication).
"""

from __future__ import annotations

import logging
import threading
import uuid
import json
import math
import struct
import time
from dataclasses import dataclass, field
from typing import Any
from pathlib import Path

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.tools")

# ─── Viewer Command Bridge ──────────────────────────────────────────────────

@dataclass
class PendingCommand:
    """A command queued for delivery to the viewer."""
    command_id: str
    command: str
    args: dict[str, Any]
    result: Any | None = None
    created_at: float = field(default_factory=time.time)
    delivered_to: set[str] = field(default_factory=set)
    status: str = "pending"
    acked_at: float | None = None
    error: str | None = None


class ViewerCommandBus:
    """Bridge between agent tools and the browser viewer.

    - Agent tools call enqueue() to submit commands.
    - The viewer (when mounted) calls drain() to consume pending commands.
    - Commands are deduplicated by commandId.
    - The bus only carries small structured commands, never geometry arrays.
    """

    def __init__(self, max_queue: int = 50) -> None:
        self._queue: list[PendingCommand] = []
        self._max_queue = max_queue
        self._seen_ids: set[str] = set()
        self._lock = threading.Lock()

    def enqueue(self, command: str, args: dict[str, Any] | None = None) -> str:
        """Submit a command. Returns the command_id."""
        command_id = str(uuid.uuid4())[:8]

        with self._lock:
            # Deduplicate: if same command+args already pending, reuse id
            for existing in self._queue:
                if existing.command == command and existing.args == (args or {}):
                    return existing.command_id

            if len(self._queue) >= self._max_queue:
                self._queue.pop(0)  # Drop oldest

            cmd = PendingCommand(
                command_id=command_id,
                command=command,
                args=args or {},
            )
            self._queue.append(cmd)
            self._seen_ids.add(command_id)
        logger.info("[oilgas-vis] Command queued: %s (%s)", command, command_id)
        return command_id

    def drain(self, viewer_id: str = "default") -> list[PendingCommand]:
        """Return commands once per viewer instance.

        Commands are broadcast to all mounted viewers instead of being
        destructively consumed by whichever tab happens to poll first.  This
        matters when the workspace is open in more than one tab or an old
        renderer is still unmounting.  The bounded queue and TTL keep this
        delivery state from growing indefinitely.
        """
        viewer_id = (viewer_id or "default")[:128]
        now = time.time()
        with self._lock:
            self._queue = [item for item in self._queue if now - item.created_at < 300]
            cmds = [item for item in self._queue if viewer_id not in item.delivered_to]
            for item in cmds:
                item.delivered_to.add(viewer_id)
        return cmds

    def pending_count(self) -> int:
        with self._lock:
            return len(self._queue)

    def acknowledge(
        self,
        command_id: str,
        *,
        status: str = "completed",
        result: Any | None = None,
        error: str | None = None,
    ) -> bool:
        """Record the result of a command executed by a mounted viewer."""
        if status not in {"completed", "failed"}:
            return False
        with self._lock:
            item = next((candidate for candidate in self._queue if candidate.command_id == command_id), None)
            if item is None:
                return False
            item.status = status
            item.result = result
            item.error = error
            item.acked_at = time.time()
            return True

    def status(self, command_id: str) -> dict[str, Any] | None:
        with self._lock:
            item = next((candidate for candidate in self._queue if candidate.command_id == command_id), None)
            if item is None:
                return None
            return {
                "commandId": item.command_id,
                "command": item.command,
                "status": item.status,
                "result": item.result,
                "error": item.error,
                "createdAt": item.created_at,
                "ackedAt": item.acked_at,
            }


# Singleton bus
command_bus = ViewerCommandBus()
_plugin_dir: Path | None = None


def configure_tools(plugin_dir: Path) -> None:
    """Configure runtime paths after the plugin is loaded."""
    global _plugin_dir
    _plugin_dir = plugin_dir.resolve()


def _viewer_result(command: str, args: dict[str, Any]) -> dict[str, Any]:
    command_id = command_bus.enqueue(command, args)
    return {
        "kind": "oilgas.viewer-command",
        "commandId": command_id,
        "command": command,
        "args": args,
        "route": "/oilgas-visualization",
    }


async def import_subsurface_dataset(
    file_path: str,
    name: str = "",
    property_files: list[str] | None = None,
) -> dict[str, Any]:
    """Import a local EGRID/ROFF/LAS/DLIS/network file asynchronously."""
    if _plugin_dir is None:
        return {"kind": "error", "error": "Plugin tools are not configured"}
    source = Path(file_path).expanduser().resolve()
    if not source.is_file():
        return {"kind": "error", "error": f"File not found: {file_path}"}
    companion = None
    if property_files:
        companion = Path(property_files[0]).expanduser().resolve()
        if not companion.is_file():
            return {"kind": "error", "error": f"Property file not found: {property_files[0]}"}
    from .jobs.manager import job_manager
    from .security import sanitize_identifier
    dataset_name = sanitize_identifier(name or source.stem)
    job = job_manager.submit_import(
        dataset_name,
        source,
        companion,
        _plugin_dir / "data" / "bin",
    )
    return {
        "kind": "oilgas.import-result",
        "job_id": job.job_id,
        "status": job.status,
        "dataset": dataset_name,
    }


async def open_oilgas_visualization(dataset_id: str = "") -> dict[str, Any]:
    """Queue opening the visualization page with an optional dataset."""
    return _viewer_result("open", {"datasetId": dataset_id})


async def set_visualization_property(
    property: str, dataset_id: str = "",  # pylint: disable=redefined-builtin
) -> dict[str, Any]:
    """Queue a property-coloring change in the viewer."""
    return _viewer_result(
        "set-property", {"property": property, "datasetId": dataset_id},
    )


async def set_visualization_timestep(time_step: int) -> dict[str, Any]:
    """Queue a simulation time-step change in the viewer."""
    if not isinstance(time_step, int) or time_step < 0:
        return {"kind": "error", "error": "time_step must be a non-negative integer"}
    return _viewer_result("set-timestep", {"timeStep": time_step})


async def configure_visualization_view(
    colormap: str = "",
    opacity: float | None = None,
    wireframe: bool | None = None,
    view: str = "",
) -> dict[str, Any]:
    """Configure visual appearance and the active professional view."""
    commands: list[dict[str, Any]] = []
    if colormap:
        if colormap not in {"viridis", "plasma", "turbo", "gray"}:
            return {"kind": "error", "error": f"Unsupported colormap: {colormap}"}
        commands.append(_viewer_result("set-colormap", {"colormap": colormap}))
    if opacity is not None:
        if not math.isfinite(float(opacity)) or not 0 <= float(opacity) <= 1:
            return {"kind": "error", "error": "opacity must be between 0 and 1"}
        commands.append(_viewer_result("set-opacity", {"opacity": float(opacity)}))
    if wireframe is not None:
        commands.append(_viewer_result("set-wireframe", {"enabled": bool(wireframe)}))
    if view:
        valid_views = {"reservoir", "wellbore", "intersection", "welllog", "network", "benchmark"}
        if view not in valid_views:
            return {"kind": "error", "error": f"Unsupported view: {view}"}
        commands.append(_viewer_result("set-view", {"view": view}))
    if not commands:
        return {"kind": "error", "error": "At least one display option is required"}
    return {"kind": "oilgas.viewer-commands", "commands": commands}


async def get_visualization_command_status(command_id: str) -> dict[str, Any]:
    """Return pending/completed/failed state for a viewer command."""
    status = command_bus.status(command_id)
    if status is None:
        return {"kind": "error", "error": f"Command not found: {command_id}"}
    return {"kind": "oilgas.viewer-command-status", **status}


async def focus_visualization_object(
    object_type: str, object_id: str,
) -> dict[str, Any]:
    """Queue focus on a cell, well, or network segment."""
    if object_type not in {"cell", "well", "segment"}:
        return {"kind": "error", "error": f"Unsupported object_type: {object_type}"}
    return _viewer_result(
        "focus", {"objectType": object_type, "objectId": object_id},
    )


async def create_intersection(
    dataset_id: str,
    polyline_x: list[float],
    polyline_y: list[float],
    z_min: float = 0.0,
    z_max: float = 5000.0,
    name: str = "section",
) -> dict[str, Any]:
    """Queue creation of a curtain section in the active viewer."""
    if len(polyline_x) != len(polyline_y) or len(polyline_x) < 2:
        return {"kind": "error", "error": "polyline_x and polyline_y must contain at least two matching points"}
    if not all(math.isfinite(float(value)) for value in [*polyline_x, *polyline_y, z_min, z_max]) or z_max <= z_min:
        return {"kind": "error", "error": "section coordinates must be finite and z_max must be greater than z_min"}
    return _viewer_result("create-intersection", {
        "datasetId": dataset_id,
        "polyline_x": polyline_x,
        "polyline_y": polyline_y,
        "z_min": z_min,
        "z_max": z_max,
        "name": name,
    })


async def capture_visualization() -> dict[str, Any]:
    """Queue a PNG capture of the active viewer."""
    return _viewer_result("capture", {})


async def run_visualization_benchmark() -> dict[str, Any]:
    """Queue the five-second rendering benchmark."""
    return _viewer_result("benchmark", {})


def _well_radius_bounds(well_id: str, radius: float) -> list[float]:
    """Resolve a well trajectory to a conservative 3-D selection bounds.

    Well trajectories are stored as regular datasets in the same manifest as
    grids.  ``well_id`` accepts the dataset id (``well_foo``), the trajectory
    name, or the display name.  The viewer uses this box as a fast spatial
    pre-filter; the well id and radius are also forwarded so a future exact
    tube-distance selector can refine it without changing the Agent API.
    """
    if _plugin_dir is None:
        raise RuntimeError("Plugin tools are not configured")
    if not well_id.strip():
        raise ValueError("well_id must not be empty")
    if not math.isfinite(radius) or radius <= 0:
        raise ValueError("radius must be a positive finite number")

    manifest_path = _plugin_dir / "data" / "bin" / "manifest.json"
    if not manifest_path.is_file():
        raise ValueError("Visualization manifest is not available")
    manifest = json.loads(manifest_path.read_text())
    needle = well_id.strip().lower()
    candidates = []
    for item in manifest.get("datasets", []):
        if item.get("source") not in {"wellbore", "well", "trajectory"}:
            continue
        haystack = " ".join(str(item.get(key, "")) for key in ("id", "name", "source")).lower()
        if needle == str(item.get("id", "")).lower() or needle in haystack:
            candidates.append(item)
    if not candidates:
        raise ValueError(f"Well trajectory not found: {well_id}")
    if len(candidates) > 1:
        raise ValueError(f"Well id is ambiguous: {well_id}")

    positions_file = candidates[0].get("files", {}).get("positions")
    if not positions_file:
        raise ValueError(f"Well trajectory has no positions: {well_id}")
    path = (_plugin_dir / "data" / "bin" / str(positions_file)).resolve()
    bin_root = (_plugin_dir / "data" / "bin").resolve()
    if bin_root not in path.parents or not path.is_file():
        raise ValueError(f"Well trajectory data is unavailable: {well_id}")
    raw = path.read_bytes()
    if len(raw) < 12 or len(raw) % 12:
        raise ValueError(f"Invalid well trajectory positions: {well_id}")
    values = struct.unpack(f"<{len(raw) // 4}f", raw)
    points = list(zip(values[0::3], values[1::3], values[2::3]))
    finite_points = [point for point in points if all(math.isfinite(value) for value in point)]
    if not finite_points:
        raise ValueError(f"Well trajectory contains no finite points: {well_id}")
    xs, ys, zs = zip(*finite_points)
    cx = (min(xs) + max(xs)) / 2.0
    cy = (min(ys) + max(ys)) / 2.0
    return [cx - radius, cx + radius, cy - radius, cy + radius, min(zs), max(zs)]


async def filter_visualization(
    property: str = "",  # pylint: disable=redefined-builtin
    dataset_id: str = "",
    property_min: float | None = None,
    property_max: float | None = None,
    ijk_i: str = "",
    ijk_j: str = "",
    ijk_k: str = "",
    bounds: list[float] | None = None,
    well_id: str = "",
    radius: float | None = None,
) -> dict[str, Any]:
    """Apply engineering filters to the active viewer scene.

    ``bounds`` is [xmin, xmax, ymin, ymax, zmin, zmax] in world coordinates.
    The viewer applies I/J/K, property, and world-coordinate bounds directly.
    """
    if bounds is not None and (len(bounds) != 6 or any(not isinstance(value, (int, float)) or not math.isfinite(float(value)) for value in bounds)):
        return {"kind": "error", "error": "bounds must contain 6 numbers"}
    if property_min is not None and property_max is not None and property_min > property_max:
        return {"kind": "error", "error": "property_min must not be greater than property_max"}
    if well_id and radius is None:
        return {"kind": "error", "error": "radius is required when well_id is provided"}
    if radius is not None and not well_id:
        return {"kind": "error", "error": "well_id is required when radius is provided"}
    if well_id and radius is not None:
        try:
            bounds = _well_radius_bounds(well_id, float(radius))
        except (TypeError, ValueError, RuntimeError) as exc:
            return {"kind": "error", "error": str(exc)}
    args = {
        "datasetId": dataset_id,
        "property": property,
        "propertyMin": property_min,
        "propertyMax": property_max,
        "i": ijk_i,
        "j": ijk_j,
        "k": ijk_k,
        "bounds": bounds,
        "wellId": well_id,
        "radius": radius,
    }
    return _viewer_result("set-filter", args)


def _local_dataset_report(dataset_id: str, property_name: str = "") -> dict[str, Any]:
    if _plugin_dir is None:
        raise RuntimeError("Plugin tools are not configured")
    manifest_path = _plugin_dir / "data" / "bin" / "manifest.json"
    manifest = json.loads(manifest_path.read_text())
    dataset = next((item for item in manifest.get("datasets", []) if item.get("id") == dataset_id), None)
    if not dataset:
        raise ValueError(f"Dataset not found: {dataset_id}")
    scalars = dataset.get("files", {}).get("scalars", {}) or {}
    if not property_name:
        property_name = next(iter(scalars), "")
    filename = scalars.get(property_name)
    values: list[float] = []
    if filename:
        raw = (_plugin_dir / "data" / "bin" / filename).read_bytes()
        code = "f" if filename.endswith(".f32") else "I"
        values = [float(value) for value in struct.unpack(f"<{len(raw) // 4}{code}", raw) if math.isfinite(float(value))]
    ordered = sorted(values)
    if ordered:
        percentile = lambda p: ordered[min(len(ordered) - 1, int((len(ordered) - 1) * p))]
        stats = {
            "count": len(values), "min": min(values), "max": max(values),
            "mean": sum(values) / len(values), "p10": percentile(0.1),
            "p50": percentile(0.5), "p90": percentile(0.9),
        }
    else:
        stats = {"count": 0, "min": None, "max": None, "mean": None, "p10": None, "p50": None, "p90": None}
    return {"dataset_id": dataset_id, "dataset": dataset.get("name", dataset_id), "property": property_name, "stats": stats}


async def generate_visualization_report(
    dataset_id: str,
    property: str = "",  # pylint: disable=redefined-builtin
    title: str = "油气可视化分析报告",
) -> dict[str, Any]:
    """Generate a compact structured report and show it in the active Viewer."""
    try:
        report = _local_dataset_report(dataset_id, property)
        report["title"] = title
        report["kind"] = "oilgas.analysis-report"
        return {**report, "viewer": _viewer_result("show-report", report)}
    except Exception as exc:
        return {"kind": "error", "error": str(exc)}


async def save_visualization_report(
    dataset_id: str,
    output_path: str,
    property: str = "",  # pylint: disable=redefined-builtin
    title: str = "油气可视化分析报告",
    overwrite: bool = False,
) -> dict[str, Any]:
    """Write a structured analysis report to an explicitly approved path."""
    try:
        target = Path(output_path).expanduser().resolve()
        if target.suffix.lower() != ".json":
            return {"kind": "error", "error": "output_path must end with .json"}
        if target.exists() and not overwrite:
            return {"kind": "error", "error": f"File already exists: {target}"}
        if not target.parent.is_dir():
            return {"kind": "error", "error": f"Parent directory not found: {target.parent}"}
        report = _local_dataset_report(dataset_id, property)
        report.update({"title": title, "kind": "oilgas.analysis-report"})
        target.write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        return {
            "kind": "oilgas.report-file",
            "file_path": str(target),
            "dataset_id": dataset_id,
            "property": report["property"],
        }
    except Exception as exc:
        return {"kind": "error", "error": str(exc)}


def get_tool_bindings() -> list[tuple[str, Any, str, str, str]]:
    """Return host registration tuples: name, callable, description, type, target."""
    functions = {
        "import_subsurface_dataset": import_subsurface_dataset,
        "open_oilgas_visualization": open_oilgas_visualization,
        "set_visualization_property": set_visualization_property,
        "set_visualization_timestep": set_visualization_timestep,
        "configure_visualization_view": configure_visualization_view,
        "get_visualization_command_status": get_visualization_command_status,
        "focus_visualization_object": focus_visualization_object,
        "create_intersection": create_intersection,
        "capture_visualization": capture_visualization,
        "run_visualization_benchmark": run_visualization_benchmark,
        "filter_visualization": filter_visualization,
        "generate_visualization_report": generate_visualization_report,
        "save_visualization_report": save_visualization_report,
    }
    descriptions = {
        item["name"]: item["description"] for item in get_tool_definitions()
    }
    file_tools = {
        "import_subsurface_dataset": "file_path",
        "save_visualization_report": "output_path",
    }
    return [
        (
            name,
            func,
            descriptions[name],
            "file" if name in file_tools else "internal",
            file_tools.get(name, ""),
        )
        for name, func in functions.items()
    ]


# ─── Tool Definitions ───────────────────────────────────────────────────────

def get_tool_definitions() -> list[dict[str, Any]]:
    """Return tool descriptors for QwenPaw's tool registry."""
    return [
        {
            "name": "import_subsurface_dataset",
            "description": "导入油气数据文件（EGRID/ROFF/LAS/DLIS）到可视化插件",
            "parameters": {
                "type": "object",
                "properties": {
                    "file_path": {"type": "string", "description": "Workspace relative path"},
                    "name": {"type": "string", "description": "Dataset display name"},
                    "property_files": {"type": "array", "items": {"type": "string"}, "description": "Companion property files"},
                },
                "required": ["file_path"],
            },
        },
        {
            "name": "open_oilgas_visualization",
            "description": "打开油气可视化页面并加载指定数据集",
            "parameters": {
                "type": "object",
                "properties": {
                    "dataset_id": {"type": "string", "description": "Dataset to display"},
                },
            },
        },
        {
            "name": "set_visualization_property",
            "description": "切换可视化属性（孔隙度/渗透率/岩相等）",
            "parameters": {
                "type": "object",
                "properties": {
                    "property": {"type": "string", "description": "Property name"},
                    "dataset_id": {"type": "string"},
                },
                "required": ["property"],
            },
        },
        {
            "name": "set_visualization_timestep",
            "description": "切换动态属性的时间步",
            "parameters": {
                "type": "object",
                "properties": {
                    "time_step": {"type": "integer", "description": "Time step index"},
                },
                "required": ["time_step"],
            },
        },
        {
            "name": "configure_visualization_view",
            "description": "配置油气三维视图、色图、透明度和线框显示",
            "parameters": {
                "type": "object",
                "properties": {
                    "colormap": {"type": "string", "enum": ["viridis", "plasma", "turbo", "gray"]},
                    "opacity": {"type": ["number", "null"], "minimum": 0, "maximum": 1},
                    "wireframe": {"type": ["boolean", "null"]},
                    "view": {"type": "string", "enum": ["reservoir", "wellbore", "intersection", "welllog", "network", "benchmark"]},
                },
            },
        },
        {
            "name": "get_visualization_command_status",
            "description": "查询油气可视化 Agent 命令是否执行成功及失败原因",
            "parameters": {
                "type": "object",
                "properties": {"command_id": {"type": "string"}},
                "required": ["command_id"],
            },
        },
        {
            "name": "focus_visualization_object",
            "description": "聚焦到指定对象（网格单元、井、管段）",
            "parameters": {
                "type": "object",
                "properties": {
                    "object_type": {"type": "string", "enum": ["cell", "well", "segment"]},
                    "object_id": {"type": "string"},
                },
                "required": ["object_type", "object_id"],
            },
        },
        {
            "name": "create_intersection",
            "description": "沿折线生成剖面",
            "parameters": {
                "type": "object",
                "properties": {
                    "dataset_id": {"type": "string"},
                    "polyline_x": {"type": "array", "items": {"type": "number"}},
                    "polyline_y": {"type": "array", "items": {"type": "number"}},
                    "z_min": {"type": "number", "default": 0},
                    "z_max": {"type": "number", "default": 5000},
                    "name": {"type": "string"},
                },
                "required": ["dataset_id", "polyline_x", "polyline_y"],
            },
        },
        {
            "name": "capture_visualization",
            "description": "截取当前可视化场景为图片",
            "parameters": {"type": "object", "properties": {}},
        },
        {
            "name": "run_visualization_benchmark",
            "description": "运行可视化性能基准测试",
            "parameters": {"type": "object", "properties": {}},
        },
        {
            "name": "filter_visualization",
            "description": "按属性范围、I/J/K 和空间范围筛选当前油气三维场景",
            "parameters": {
                "type": "object",
                "properties": {
                    "property": {"type": "string"},
                    "dataset_id": {"type": "string"},
                    "property_min": {"type": ["number", "null"]},
                    "property_max": {"type": ["number", "null"]},
                    "ijk_i": {"type": "string"}, "ijk_j": {"type": "string"}, "ijk_k": {"type": "string"},
                    "bounds": {"type": "array", "items": {"type": "number"}, "minItems": 6, "maxItems": 6},
                    "well_id": {"type": "string", "description": "Well dataset id/name used as the spatial centerline"},
                    "radius": {"type": ["number", "null"], "description": "Radius in world coordinate units around the well"},
                },
            },
        },
        {
            "name": "generate_visualization_report",
            "description": "生成当前油气数据集的属性统计分析报告并显示在 Viewer",
            "parameters": {
                "type": "object",
                "properties": {
                    "dataset_id": {"type": "string"},
                    "property": {"type": "string"},
                    "title": {"type": "string"},
                },
                "required": ["dataset_id"],
            },
        },
        {
            "name": "save_visualization_report",
            "description": "将油气属性分析报告保存为工作区 JSON 文件",
            "parameters": {
                "type": "object",
                "properties": {
                    "dataset_id": {"type": "string"},
                    "output_path": {"type": "string", "description": "Explicit workspace .json output path"},
                    "property": {"type": "string"},
                    "title": {"type": "string"},
                    "overwrite": {"type": "boolean", "default": False},
                },
                "required": ["dataset_id", "output_path"],
            },
        },
    ]


async def execute_tool(tool_name: str, args: dict[str, Any], api_base: str) -> dict[str, Any]:
    """Execute a tool call. Returns structured result."""
    import json
    import urllib.request

    try:
        if tool_name == "import_subsurface_dataset":
            # Trigger import via API
            file_path = args.get("file_path", "")
            name = args.get("name", "")
            result = _api_post(api_base, "/imports", {
                "workspacePath": file_path,
                "name": name,
            })
            return {"kind": "oilgas.import-result", "job_id": result.get("job_id")}

        elif tool_name == "open_oilgas_visualization":
            dataset_id = args.get("dataset_id", "")
            cmd_id = command_bus.enqueue("open", {"datasetId": dataset_id})
            return {"kind": "oilgas.viewer-command", "commandId": cmd_id, "command": "open", "datasetId": dataset_id}

        elif tool_name == "set_visualization_property":
            prop = args.get("property", "")
            cmd_id = command_bus.enqueue("set-property", {
                "property": prop, "datasetId": args.get("dataset_id", ""),
            })
            return {"kind": "oilgas.viewer-command", "commandId": cmd_id, "command": "set-property", "property": prop}

        elif tool_name == "set_visualization_timestep":
            ts = args.get("time_step", 0)
            cmd_id = command_bus.enqueue("set-timestep", {"timeStep": ts})
            return {"kind": "oilgas.viewer-command", "commandId": cmd_id, "command": "set-timestep", "timeStep": ts}

        elif tool_name == "configure_visualization_view":
            result = await configure_visualization_view(
                colormap=args.get("colormap", ""),
                opacity=args.get("opacity"),
                wireframe=args.get("wireframe"),
                view=args.get("view", ""),
            )
            return result

        elif tool_name == "get_visualization_command_status":
            return await get_visualization_command_status(str(args.get("command_id", "")))

        elif tool_name == "focus_visualization_object":
            obj_type = args.get("object_type", "")
            obj_id = args.get("object_id", "")
            cmd_id = command_bus.enqueue("focus", {"objectType": obj_type, "objectId": obj_id})
            return {"kind": "oilgas.viewer-command", "commandId": cmd_id, "command": "focus", "objectType": obj_type, "objectId": obj_id}

        elif tool_name == "create_intersection":
            result = _api_post(api_base, f"/datasets/{args['dataset_id']}/intersections", {
                "polyline_x": args["polyline_x"],
                "polyline_y": args["polyline_y"],
                "z_min": args.get("z_min", 0),
                "z_max": args.get("z_max", 5000),
                "name": args.get("name", "section"),
            })
            return {"kind": "oilgas.intersection-result", "result": result}

        elif tool_name == "capture_visualization":
            cmd_id = command_bus.enqueue("capture", {})
            return {"kind": "oilgas.viewer-command", "commandId": cmd_id, "command": "capture"}

        elif tool_name == "run_visualization_benchmark":
            cmd_id = command_bus.enqueue("benchmark", {})
            return {"kind": "oilgas.viewer-command", "commandId": cmd_id, "command": "benchmark"}

        elif tool_name == "filter_visualization":
            bounds = args.get("bounds")
            well_id = str(args.get("well_id", "") or "")
            radius = args.get("radius")
            if well_id and radius is None:
                return {"kind": "error", "error": "radius is required when well_id is provided"}
            if radius is not None and not well_id:
                return {"kind": "error", "error": "well_id is required when radius is provided"}
            if well_id and radius is not None:
                bounds = _well_radius_bounds(well_id, float(radius))
            cmd_id = command_bus.enqueue("set-filter", {
                "datasetId": args.get("dataset_id", ""),
                "property": args.get("property", ""),
                "propertyMin": args.get("property_min"), "propertyMax": args.get("property_max"),
                "i": args.get("ijk_i", ""), "j": args.get("ijk_j", ""), "k": args.get("ijk_k", ""),
                "bounds": bounds,
                "wellId": well_id, "radius": radius,
            })
            return {"kind": "oilgas.viewer-command", "commandId": cmd_id, "command": "set-filter"}

        elif tool_name == "generate_visualization_report":
            report = _local_dataset_report(args["dataset_id"], args.get("property", ""))
            report["title"] = args.get("title", "油气可视化分析报告")
            report["kind"] = "oilgas.analysis-report"
            cmd_id = command_bus.enqueue("show-report", report)
            report["commandId"] = cmd_id
            return report

        elif tool_name == "save_visualization_report":
            return await save_visualization_report(
                dataset_id=args["dataset_id"],
                output_path=args["output_path"],
                property=args.get("property", ""),
                title=args.get("title", "油气可视化分析报告"),
                overwrite=bool(args.get("overwrite", False)),
            )

        else:
            return {"kind": "error", "error": f"Unknown tool: {tool_name}"}

    except Exception as exc:
        logger.error("Tool %s failed: %s", tool_name, exc, exc_info=True)
        return {"kind": "error", "error": str(exc)}


def _api_post(api_base: str, path: str, data: dict) -> dict:
    """Simple HTTP POST helper."""
    import json
    import urllib.request
    url = f"{api_base}{path}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())
