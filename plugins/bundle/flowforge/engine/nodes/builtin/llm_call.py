# -*- coding: utf-8 -*-
"""``LLMCallNode`` — call the LLMService with a templated prompt."""

from __future__ import annotations

import math
import time
from typing import Any

from ...adapter.log_compat import get_logger

from ...io import IO, Hidden, HiddenHolder, NodeOutput, Schema
from ..base import WorkflowNode
from .structured_output import (
    OutputSchemaInput,
    StructuredOutputError,
    parse_structured_output,
    prepare_output_schema,
)

logger = get_logger(__name__)


class LLMCallNode(WorkflowNode):
    NODE_ID = "LLMCallNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id="LLMCallNode",
            display_name="LLM Call",
            category="workflow/ai",
            description=(
                "Call the configured LLM service with a templated prompt."
            ),
            inputs=[
                IO.String.Input(id="prompt", multiline=True),
                IO.String.Input(
                    id="system",
                    optional=True,
                    default="",
                    multiline=True,
                    tooltip=(
                        "System instructions, sent before the user prompt."
                    ),
                ),
                IO.String.Input(id="model", optional=True, default=""),
                IO.Float.Input(
                    id="temperature",
                    optional=True,
                    default=0.1,
                    min=0.0,
                    max=2.0,
                    step=0.1,
                ),
                IO.Int.Input(
                    id="max_tokens",
                    optional=True,
                    default=4096,
                    min=1,
                    max=32768,
                ),
                IO.Combo.Input(
                    id="response_format",
                    choices=["text", "json_schema"],
                    optional=True,
                    default="text",
                    tooltip=(
                        "Text preserves the original response. JSON Schema "
                        "parses strict JSON and validates it locally."
                    ),
                ),
                OutputSchemaInput(
                    id="output_schema",
                    optional=True,
                    default={},
                    tooltip=(
                        "JSON Schema used in the model instructions and local "
                        "validation. Supports local references."
                    ),
                ),
                IO.String.Input(id="output", optional=True),
            ],
            outputs=[
                IO.String.Output(id="content"),
                IO.Any.Output(
                    id="parsed",
                    tooltip=(
                        "Validated JSON value when JSON Schema mode "
                        "is enabled."
                    ),
                ),
            ],
            hidden=[
                Hidden.UNIQUE_ID,
                Hidden.TOOL_CONTEXT,
                Hidden.WORKFLOW_STATE,
            ],
            not_idempotent=True,
        )

    async def execute(
        self,
        *,
        hidden: HiddenHolder,
        **inputs: Any,
    ) -> NodeOutput:
        # pylint: disable=too-many-branches,too-many-statements
        ctx = hidden.tool_context
        llm = getattr(ctx, "llm_service", None) if ctx else None
        if llm is None:
            return NodeOutput(error="LLM service not available")
        prompt = inputs.get("prompt")
        if not prompt:
            return NodeOutput(error="Missing 'prompt' input")

        state = hidden.workflow_state
        system = inputs.get("system") or ""
        if state is not None:
            prompt = state.resolve_template(prompt)
            system = state.resolve_template(system)

        start = time.monotonic()
        metadata: dict[str, Any] = {}
        try:
            from ...adapter import ChatMessage

            raw_temperature = inputs.get("temperature")
            temperature = (
                0.1 if raw_temperature is None else float(raw_temperature)
            )
            if (
                isinstance(raw_temperature, bool)
                or not math.isfinite(temperature)
                or not 0 <= temperature <= 2
            ):
                raise ValueError("temperature must be a number from 0 to 2")
            raw_max_tokens = inputs.get("max_tokens")
            max_tokens = (
                4096 if raw_max_tokens is None else int(raw_max_tokens)
            )
            if (
                isinstance(raw_max_tokens, bool)
                or isinstance(raw_max_tokens, float)
                and not raw_max_tokens.is_integer()
                or not 1 <= max_tokens <= 32768
            ):
                raise ValueError(
                    "max_tokens must be an integer from 1 to 32768",
                )
            response_format = inputs.get("response_format") or "text"
            if response_format not in {"text", "json_schema"}:
                raise ValueError("response_format must be text or json_schema")
            validator = None
            if response_format == "json_schema":
                import json

                validator = prepare_output_schema(
                    inputs.get("output_schema", {}),
                )
                instructions = (
                    "Return exactly one JSON value matching this JSON Schema. "
                    "Use valid JSON without Markdown fences or commentary.\n"
                    + json.dumps(validator.schema, ensure_ascii=False)
                )
                system = (
                    f"{system}\n\n{instructions}" if system else instructions
                )
            messages = []
            if system:
                messages.append(ChatMessage.system(system))
            messages.append(ChatMessage.user(prompt))
            response = await llm.complete(
                messages=messages,
                model=inputs.get("model") or None,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            content = response.content or ""
            duration_ms = int((time.monotonic() - start) * 1000)
            metadata = {
                "model": getattr(response, "model", "") or None,
                "provider": getattr(response, "provider", "") or None,
                "usage": getattr(response, "usage", None),
                "model_source": (
                    "override" if inputs.get("model") else "inherited"
                ),
                "duration_ms": duration_ms,
                "response_length": len(content),
                "response_format": response_format,
            }
            if metadata["usage"] is not None:
                metadata["usage_scope"] = "attempt"
            values = (content,)
            if validator is not None:
                values = (content, parse_structured_output(content, validator))
            if state is not None and inputs.get("output"):
                state.set(inputs["output"], content)
            return NodeOutput(
                values=values,
                metadata=metadata,
            )
        except Exception as exc:  # noqa: BLE001
            duration_ms = int((time.monotonic() - start) * 1000)
            logger.error(
                "llm_call_failed",
                error=str(exc),
                duration_ms=duration_ms,
                exc_info=True,
            )
            metadata["duration_ms"] = duration_ms
            if isinstance(exc, StructuredOutputError):
                metadata["diagnostics"] = [exc.diagnostic]
                metadata["retryable"] = False
            return NodeOutput(
                error=str(exc),
                metadata=metadata,
            )
