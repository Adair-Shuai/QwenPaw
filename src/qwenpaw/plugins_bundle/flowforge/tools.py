# -*- coding: utf-8 -*-
"""Agent-facing tools backed by the same service as the workflow editor."""

from __future__ import annotations

import asyncio
import json
import math
from typing import Any

from agentscope.message import TextBlock, ToolResultState
from agentscope.tool import ToolChunk

from .service import WorkflowService


def _reply(value: Any, *, error: bool = False) -> ToolChunk:
    return ToolChunk(
        state=ToolResultState.ERROR if error else ToolResultState.SUCCESS,
        content=[
            TextBlock(
                type=("text"),
                text=json.dumps(value, ensure_ascii=False, default=str),
            ),
        ],
    )


def build_tools(service: WorkflowService) -> list:
    """Bind tools to the plugin instance without global service state."""

    async def flowforge_list_workflows() -> ToolChunk:
        """List saved workflows, with IDs and descriptions for discovery."""
        return _reply({"workflows": service.list_flows()})

    async def flowforge_get_workflow(flow_id: str) -> ToolChunk:
        (
            "Inspect a workflow definition and its input contract"
            " before running it.\n\n        Args:\n            flow_"
            "id: Saved workflow ID.\n        "
        )
        flow = service.get_flow(flow_id)
        return _reply(
            flow if flow is not None else {"error": "Workflow not found"},
            error=flow is None,
        )

    async def flowforge_run_workflow(
        flow_id: str,
        inputs: dict[str, Any] | None = None,
        wait_seconds: float = 0,
    ) -> ToolChunk:
        (
            "Start a saved workflow and return its run ID, status"
            " and available outputs.\n\n        Args:\n            f"
            "low_id: Saved workflow ID; inspect its input contrac"
            "t first.\n            inputs: Business inputs keyed b"
            "y the workflow's input names.\n            wait_secon"
            "ds: Wait up to 60 seconds for completion. Zero retur"
            "ns immediately.\n                Expiry leaves the ru"
            "n active; query its run ID instead of starting again"
            ".\n        "
        )
        try:
            if not math.isfinite(wait_seconds) or not 0 <= wait_seconds <= 60:
                raise ValueError("wait_seconds must be between 0 and 60")
            handle = service.start_run(flow_id, inputs, trigger_type="agent")
        except (ValueError, FileNotFoundError) as exc:
            return _reply({"error": str(exc)}, error=True)
        deadline = asyncio.get_running_loop().time() + wait_seconds
        while (
            not handle.is_done and asyncio.get_running_loop().time() < deadline
        ):
            await asyncio.sleep(
                min(
                    0.05,
                    max(0, deadline - asyncio.get_running_loop().time()),
                ),
            )
        record = handle.to_dict()
        return _reply(record, error=record["status"] == "failed")

    async def flowforge_get_run(run_id: str) -> ToolChunk:
        """Get current or persisted workflow status, outputs and errors.

        Args:
            run_id: Run ID returned by flowforge_run_workflow.
        """
        record = service.get_run_record(run_id)
        return _reply(
            record if record is not None else {"error": "Run not found"},
            error=record is None,
        )

    async def flowforge_cancel_run(run_id: str) -> ToolChunk:
        """Request cooperative cancellation of a workflow run.

        Args:
            run_id: Run ID returned by flowforge_run_workflow.
        """
        found = service.cancel_run(run_id)
        return _reply(
            {
                ("run_id"): run_id,
                ("found"): found,
                ("run"): service.get_run_record(run_id),
            },
            error=not found,
        )

    return [
        flowforge_list_workflows,
        flowforge_get_workflow,
        flowforge_run_workflow,
        flowforge_get_run,
        flowforge_cancel_run,
    ]
