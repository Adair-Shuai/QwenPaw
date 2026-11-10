# -*- coding: utf-8 -*-
"""Identify data dependencies without interpreting literal configuration."""

from typing import Any


def is_opaque_input(node: dict[str, Any], name: str, value: Any) -> bool:
    return (
        node.get("class_type") == "LLMCallNode"
        and name == "output_schema"
        and isinstance(value, dict)
    )


def node_dependency_inputs(node: dict[str, Any]) -> dict[str, Any]:
    inputs = node.get("inputs") or {}
    if not isinstance(inputs, dict):
        return {}
    return {
        name: value
        for name, value in inputs.items()
        if not is_opaque_input(node, name, value)
    }
