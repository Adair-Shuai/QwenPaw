# -*- coding: utf-8 -*-
"""Public tool schemas and registry entry points survive type cleanup."""

import importlib
import inspect
from types import SimpleNamespace
from typing import Dict, List, Optional, Set, Tuple, Union

import pytest
from pydantic import BaseModel


class Payload(BaseModel):
    count: int


pytestmark = pytest.mark.parametrize(
    "namespace",
    [
        "plugins.bundle.flowforge.engine",
        "qwenpaw.plugins_bundle.flowforge.engine",
    ],
)


@pytest.mark.parametrize(
    ("annotation", "json_type"),
    [
        (inspect.Parameter.empty, "string"),
        (str, "string"),
        (int, "integer"),
        (float, "number"),
        (bool, "boolean"),
        (list, "array"),
        (dict, "object"),
        (List[int], "array"),
        (Dict[str, int], "object"),
        (Set[int], "array"),
        (Tuple[int, ...], "array"),
        (Optional[int], "integer"),
        (Union[int, str], "string"),
        (type(None), "string"),
        (Payload, "object"),
        (object, "string"),
    ],
)
def test_public_tool_schema_preserves_parameter_contract(
    namespace,
    annotation,
    json_type,
):
    module = importlib.import_module(f"{namespace}.adapter.tool_base")

    def report(required, defaulted=0, *args, **kwargs):
        """A report tool with required, defaulted and variadic arguments."""
        return required, defaulted, args, kwargs

    if annotation is not inspect.Parameter.empty:
        report.__annotations__["required"] = annotation
    report.__annotations__["defaulted"] = float
    tool = module.BaseTool(
        SimpleNamespace(
            name="report",
            func=report,
            metadata={"category": "data"},
        ),
    )
    assert tool.parameters == {
        "type": "object",
        "properties": {
            "required": {"type": json_type, "description": ""},
            "defaulted": {"type": "number", "description": "", "default": 0},
        },
        "required": ["required"],
    }
    assert tool.func is report
    assert tool.category is module.ToolCategory.DATA


def test_native_tool_schema_keeps_identity_and_empty_fallback(namespace):
    module = importlib.import_module(f"{namespace}.adapter.tool_base")
    native = {
        "type": "object",
        "properties": {"enabled": {"type": "boolean"}},
        "required": ["enabled"],
        "additionalProperties": False,
    }
    tool = module.BaseTool(SimpleNamespace(name="native", input_schema=native))
    assert tool.parameters is native
    assert module.BaseTool(SimpleNamespace(name="empty")).parameters == {
        "type": "object",
        "properties": {},
    }


def test_public_registry_entry_points_share_native_singleton(
    namespace,
    monkeypatch,
):
    nodes = importlib.import_module(f"{namespace}.nodes")
    registry = importlib.import_module(f"{namespace}.nodes.registry")
    monkeypatch.setattr(registry, "_DEFAULT_REGISTRY", None)
    first = nodes.get_registry()
    assert first is registry.get_registry()
    assert nodes.bootstrap() is first
    assert nodes.get_registry() is first
    nodes.reset_registry()
    assert nodes.get_registry() is registry.get_registry()
    assert nodes.get_registry() is not first
    assert all(hasattr(nodes, name) for name in nodes.__all__)
    for name in (
        "AgentNode",
        "CodeNode",
        "ConditionNode",
        "InputNode",
        "LLMNode",
        "OutputNode",
        "ToolNode",
    ):
        assert getattr(nodes, name).get_schema().node_id == name


def test_public_registry_retains_legacy_getter_fallback(
    namespace,
    monkeypatch,
):
    nodes = importlib.import_module(f"{namespace}.nodes")
    registry = importlib.import_module(f"{namespace}.nodes.registry")
    monkeypatch.delattr(registry, "get_registry")
    monkeypatch.setattr(nodes, "_fallback_registry", None, raising=False)
    first = nodes.get_registry()
    assert isinstance(first, registry.NodeRegistry)
    assert nodes.get_registry() is first
