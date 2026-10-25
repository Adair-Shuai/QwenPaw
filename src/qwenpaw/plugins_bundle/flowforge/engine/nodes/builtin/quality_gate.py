# -*- coding: utf-8 -*-
"""``QualityGateNode`` — score an asset and route pass / fail.

The evaluation gate of the self-correction loop. It derives a quality
``score`` for the upstream asset and routes to ``control.pass_node`` when
``score >= threshold`` else ``control.fail_node`` (typically an
:class:`IterativeRefineNode` back-edge).

An explicit score is required from a real evaluator or upstream tool. The
runtime never invents an improving quality score from the iteration counter.
"""

from __future__ import annotations

from typing import Any

import logging

from ...io import IO, Hidden, HiddenHolder, MediaRef, NodeOutput, Schema
from ...io.media import to_gen_ui_ui

from ..base import WorkflowNode
from ...adapter.log_compat import get_logger

logger = get_logger(__name__)


class QualityGateNode(WorkflowNode):
    NODE_ID = "QualityGateNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id="QualityGateNode",
            display_name="Quality Gate",
            category="art/evaluate",
            description=(
                "Score an upstream asset against a quality bar and route to "
                "control.pass_node or control.fail_node (self-correction loop)."
            ),
            inputs=[
                IO.Any.Input(
                    id="asset", optional=True,
                    tooltip="The asset (image/video/mesh) being evaluated.",
                ),
                IO.Float.Input(
                    id="score", min=0.0, max=1.0,
                    tooltip="Actual quality score from an evaluator or upstream tool.",
                ),
                IO.Float.Input(
                    id="threshold", optional=True, default=0.7, min=0.0, max=1.0,
                    tooltip="Minimum score required to pass.",
                ),
                IO.String.Input(
                    id="criteria", optional=True, multiline=True,
                    tooltip="Human-readable acceptance criteria.",
                ),
                IO.String.Input(
                    id="iteration_var", optional=True, default="refine_iteration",
                    tooltip="State variable holding the refine iteration count.",
                ),

            ],
            outputs=[
                IO.Float.Output(id="score"),
                IO.Boolean.Output(id="passed"),
                IO.Any.Output(id="asset"),
            ],
            hidden=[Hidden.UNIQUE_ID, Hidden.WORKFLOW_STATE],
            control_flow=True,
            not_idempotent=True,
        )

    async def execute(self, *, hidden: HiddenHolder, **inputs: Any) -> NodeOutput:
        state = hidden.workflow_state
        node_id = hidden.unique_id
        threshold = float(inputs.get("threshold") if inputs.get("threshold") is not None else 0.7)

        score = self._resolve_score(inputs, state)
        passed = score >= threshold

        if state is not None:
            state.set("quality_score", round(score, 4))
            state.set("quality_passed", passed)

        control = _control_for(hidden, node_id)
        pass_node = control.get("pass_node") or _first_then(control)
        fail_node = control.get("fail_node") or control.get("else_node") or control.get("else")
        target = pass_node if passed else fail_node

        logger.info(
            "quality_gate", node_id=node_id, score=round(score, 4),
            threshold=threshold, passed=passed, target=target,
        )
        asset = inputs.get("asset")
        ref = MediaRef.from_dict(asset) if isinstance(asset, dict) else (
            asset if isinstance(asset, MediaRef) else None
        )
        meta: dict[str, Any] = {
            "score": round(score, 4),
            "threshold": threshold,
            "passed": passed,
        }
        if ref is not None and ref.src:
            meta.update({
                "kind": ref.kind,
                "file_id": ref.file_id,
                "src": ref.src,
                "preview_url": ref.src,
                "filename": ref.filename,
                "width": ref.width,
                "height": ref.height,
            })
        return NodeOutput(
            values=(round(score, 4), passed, inputs.get("asset")),
            next_node=target,
            ui=to_gen_ui_ui([ref], title="Gated asset") if ref and ref.src else None,
            metadata=meta,
        )

    def _resolve_score(self, inputs: dict[str, Any], state: Any) -> float:
        explicit = inputs.get("score")
        if not isinstance(explicit, (float, int)) or isinstance(explicit, bool):
            raise ValueError("QualityGateNode requires an explicit evaluator score")
        return float(explicit)



def _control_for(hidden: HiddenHolder, node_id: str | None) -> dict[str, Any]:
    if not node_id:
        return {}
    prompt = hidden.prompt or {}
    node = prompt.get(node_id) if isinstance(prompt, dict) else None
    if isinstance(node, dict):
        return node.get("control", {}) or {}
    return {}
