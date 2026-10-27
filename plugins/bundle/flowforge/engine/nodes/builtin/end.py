# -*- coding: utf-8 -*-
"""``EndNode`` — return an explicit value or collect preceding outputs."""

from __future__ import annotations

from typing import Any

from ...io import IO, Hidden, HiddenHolder, NodeOutput, Schema
from ..base import WorkflowNode


class EndNode(WorkflowNode):
    NODE_ID = "EndNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id="EndNode",
            display_name="End",
            category="workflow/control",
            description="Workflow terminator. Returns value when provided; "
            "otherwise collects preceding node outputs.",
            inputs=[IO.Any.Input(id="value", optional=True)],
            outputs=[IO.Any.Output(id="outputs")],
            hidden=[Hidden.UNIQUE_ID, Hidden.WORKFLOW_STATE],
            is_output_node=True,
            control_flow=True,
        )

    async def execute(
        self,
        *,
        hidden: HiddenHolder,
        **inputs: Any,
    ) -> NodeOutput:
        if "value" in inputs:
            return NodeOutput(values=(inputs["value"],), next_node=None)
        state = hidden.workflow_state
        outs = dict(state.outputs) if state is not None else {}
        return NodeOutput(values=(outs,), next_node=None)
