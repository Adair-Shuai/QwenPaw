# -*- coding: utf-8 -*-
"""Agent tool definitions and Viewer Command Bridge.

Registers 7 agent tools that allow the AI agent to control the
visualization viewer through structured tool calls. The bridge
ensures commands are delivered to the viewer even if it's not
currently mounted (pending queue with deduplication).
"""

from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.tools")

# ─── Viewer Command Bridge ──────────────────────────────────────────────────

@dataclass
class PendingCommand:
    """A command queued for delivery to the viewer."""
    command_id: str
    command: str
    args: dict[str, Any]
    result: Any | None = None


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

    def enqueue(self, command: str, args: dict[str, Any] | None = None) -> str:
        """Submit a command. Returns the command_id."""
        command_id = str(uuid.uuid4())[:8]

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

    def drain(self) -> list[PendingCommand]:
        """Consume all pending commands."""
        cmds = list(self._queue)
        self._queue.clear()
        return cmds

    def pending_count(self) -> int:
        return len(self._queue)


# Singleton bus
command_bus = ViewerCommandBus()


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
            cmd_id = command_bus.enqueue("set-property", {"property": prop})
            return {"kind": "oilgas.viewer-command", "commandId": cmd_id, "command": "set-property", "property": prop}

        elif tool_name == "set_visualization_timestep":
            ts = args.get("time_step", 0)
            cmd_id = command_bus.enqueue("set-timestep", {"timeStep": ts})
            return {"kind": "oilgas.viewer-command", "commandId": cmd_id, "command": "set-timestep", "timeStep": ts}

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
