# -*- coding: utf-8 -*-
"""``SubworkflowNode`` — invoke another Flow by id."""

from __future__ import annotations

import asyncio
import time
from typing import Any

import logging

from ...io import IO, Hidden, HiddenHolder, NodeOutput, Schema
from ..base import WorkflowNode

logger = logging.getLogger(__name__)


class SubworkflowNode(WorkflowNode):
    NODE_ID = "SubworkflowNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id="SubworkflowNode",
            display_name="Subworkflow",
            category="workflow/control",
            description="Delegate execution to another flow by id.",
            inputs=[
                IO.String.Input(id="subworkflow_id"),
                IO.Object.Input(id="subworkflow_inputs", optional=True, default={}),
                IO.String.Input(id="output", optional=True),
            ],
            outputs=[IO.Object.Output(id="outputs")],
            hidden=[
                Hidden.UNIQUE_ID,
                Hidden.TOOL_CONTEXT,
                Hidden.WORKFLOW_STATE,
                Hidden.EXECUTION_ID,
                Hidden.AGENT_RUNTIME,
                Hidden.USER_ID,
                Hidden.SESSION_ID,
            ],
            enable_expand=True,
            not_idempotent=True,
        )

    async def execute(self, *, hidden: HiddenHolder, **inputs: Any) -> NodeOutput:
        sub_id = inputs.get("subworkflow_id")
        if not sub_id:
            return NodeOutput(error="Subworkflow node missing 'subworkflow_id'")

        ctx = hidden.tool_context
        service = getattr(ctx, "workflow_service", None) if ctx else None
        if service is None:
            return NodeOutput(error="Workflow service not available")
        state = hidden.workflow_state
        if state is None:
            return NodeOutput(error="Subworkflow requires workflow state")
        resolved = state.resolve_template(inputs.get("subworkflow_inputs") or {})
        child_runs = state.metadata.setdefault("subworkflow_runs", {})
        key = str(hidden.unique_id)
        child_id = child_runs.get(key)
        started = time.monotonic()
        try:
            if child_id:
                record = service.get_run_record(child_id)
                if record is None:
                    return NodeOutput(error=f"Child run '{child_id}' not found")
                # A reviewer may resume the child directly. Follow the existing
                # continuation rather than repeat its side effects.
                while record.get("resumed_by_run_id"):
                    child_id = record["resumed_by_run_id"]
                    record = service.get_run_record(child_id)
                    if record is None:
                        return NodeOutput(error="Child continuation not found")
                payload = state.variables.pop(f"__resume__{key}", None)
                if record["status"] in {"paused", "waiting_human"} and payload is not None:
                    child_payload = payload.get("child_inputs", payload)
                    if not isinstance(child_payload, dict):
                        return NodeOutput(error="child_inputs must be an object")
                    child_id = service.resume_run(child_id, child_payload).run_id
            else:
                child_id = service.start_run(sub_id, resolved, trigger_type="subworkflow").run_id
            child_runs[key] = child_id
            while True:
                record = service.get_run_record(child_id)
                handle = service.get_run(child_id)
                if record is None:
                    return NodeOutput(error="Child run disappeared")
                if (handle is None or handle.is_done) and record["status"] not in {"queued", "running"}:
                    break
                await asyncio.sleep(0.02)
            metadata = {"subworkflow_id": sub_id, "child_run_id": child_id,
                        "duration_ms": int((time.monotonic() - started) * 1000)}
            if record["status"] in {"paused", "waiting_human"}:
                return NodeOutput(
                    values=({},), block_execution="awaiting_review" if record["status"] == "waiting_human" else "child_paused",
                    ui={"child_run_id": child_id}, metadata=metadata,
                )
            if record["status"] == "completed":
                if inputs.get("output"):
                    state.set(inputs["output"], record["outputs"])
                return NodeOutput(values=(record["outputs"],), metadata=metadata)
            return NodeOutput(error=record.get("error") or "; ".join(record.get("errors") or []) or f"Subworkflow {record['status']}", metadata=metadata)
        except asyncio.CancelledError:
            if child_id:
                service.cancel_run(child_id)
            raise
        except Exception as exc:
            logger.exception("Subworkflow %s failed", sub_id)
            return NodeOutput(error=str(exc))
