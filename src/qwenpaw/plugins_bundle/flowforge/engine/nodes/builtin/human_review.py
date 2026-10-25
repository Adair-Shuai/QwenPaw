# -*- coding: utf-8 -*-
"""``HumanReviewNode`` — pause execution until an external reviewer resolves."""

from __future__ import annotations

from typing import Any
import time

import logging

from ...io import IO, Hidden, HiddenHolder, NodeOutput, Schema
from ..base import WorkflowNode
from ...adapter.log_compat import get_logger

logger = get_logger(__name__)


class HumanReviewNode(WorkflowNode):
    NODE_ID = "HumanReviewNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id="HumanReviewNode",
            display_name="Human Review",
            category="workflow/human",
            description=(
                "Return block_execution='awaiting_review' so the scheduler adds "
                "an external block. An approval/rejection POST resumes the run."
            ),
            inputs=[
                IO.String.Input(id="reviewer"),
                IO.String.Input(id="review_prompt", optional=True, multiline=True),
                IO.Int.Input(id="timeout_sec", optional=True, default=86400, min=0),
                IO.String.Input(id="output", optional=True),
            ],
            outputs=[IO.Object.Output(id="request")],
            hidden=[Hidden.UNIQUE_ID, Hidden.REVIEW_SERVICE, Hidden.WORKFLOW_STATE, Hidden.EXECUTION_ID],
            control_flow=True,
            not_idempotent=True,
        )

    async def execute(self, *, hidden: HiddenHolder, **inputs: Any) -> NodeOutput:
        reviewer = inputs.get("reviewer")
        if not reviewer:
            return NodeOutput(error="Missing 'reviewer' input")

        state = hidden.workflow_state
        wait_key = f"__review_wait__{hidden.unique_id}"
        waiting = state.variables.get(wait_key) if state is not None else None
        if isinstance(waiting, dict) and waiting.get("expires_at") is not None and time.time() >= waiting["expires_at"]:
            return NodeOutput(error="Review request expired")

        # Resume path: ``POST /prompts/{id}/resume`` stashes the reviewer's
        # decision under ``__resume__<node_id>``; consume it and complete the
        # node instead of blocking again.
        resume = self._take_resume_payload(state, hidden.unique_id)
        if resume is not None:
            if not isinstance(resume.get("approved"), bool):
                return NodeOutput(error="Review decision requires a boolean approved field")
            control = (hidden.prompt.get(hidden.unique_id or "", {}) or {}).get("control") or {}
            approved = resume["approved"]
            target = control.get("next") if approved else control.get("on_reject")
            if not approved and not target:
                return NodeOutput(error="Review rejected; no rejection route configured")
            decision = {
                "approved": approved,
                "comments": str(resume.get("comments") or resume.get("answer") or ""),
                "reviewer": reviewer,
                "node_id": hidden.unique_id,
            }
            if state is not None and inputs.get("output"):
                state.set(inputs["output"], decision)
            logger.info(
                "human_review_resolved", reviewer=reviewer,
                node_id=hidden.unique_id, approved=decision["approved"],
            )
            if state is not None:
                state.variables.pop(wait_key, None)
            return NodeOutput(
                values=(decision,),
                next_node=target,
                ui={"review_decision": decision},
                metadata={"reviewer": reviewer, "approved": decision["approved"]},
            )
        timeout_sec = int(inputs.get("timeout_sec", 86400))
        requested_at = time.time()
        review_data = {
            "execution_id": hidden.execution_id,
            "state_id": str(state.id) if state is not None else None,
            "node_id": hidden.unique_id,
            "reviewer": reviewer,
            "prompt": state.resolve_template(inputs.get("review_prompt")) if state is not None and inputs.get("review_prompt") else inputs.get("review_prompt"),
            "context": dict(state.variables) if state is not None else {},
            "timeout_sec": timeout_sec,
            "requested_at": requested_at,
            "expires_at": requested_at + timeout_sec if timeout_sec else None,
        }

        review_svc = hidden.review_service
        review_request_id: str | None = None
        if isinstance(waiting, dict):
            review_data = waiting["review_data"]
            review_request_id = waiting.get("review_request_id")
        elif review_svc is not None:
            try:
                rr = await review_svc.create_review(review_data)
                review_request_id = rr.get("id")
                if state is not None:
                    state.review_request_id = review_request_id
                    state.review_data = review_data
            except Exception as exc:  # noqa: BLE001
                logger.error("review_service_error", error=str(exc), exc_info=True)

        if state is not None:
            state.variables[wait_key] = {"review_data": review_data, "review_request_id": review_request_id, "expires_at": review_data["expires_at"]}
        logger.info("human_review_requested", reviewer=reviewer, node_id=hidden.unique_id)

        return NodeOutput(
            values=(review_data,),
            block_execution="awaiting_review",
            ui={"review": review_data, "review_request_id": review_request_id},
            metadata={"reviewer": reviewer, "review_request_id": review_request_id},
        )

    @staticmethod
    def _take_resume_payload(state: Any, node_id: str | None) -> dict[str, Any] | None:
        """Pop the resume decision for this node, if one was posted."""
        if state is None or not node_id:
            return None
        try:
            payload = state.variables.pop(f"__resume__{node_id}", None)
        except Exception:  # noqa: BLE001
            return None
        return payload if isinstance(payload, dict) else None
