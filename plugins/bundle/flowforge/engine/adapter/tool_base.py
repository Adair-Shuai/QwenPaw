# -*- coding: utf-8 -*-
"""Adapter: ``BaseTool`` / ``ToolCategory`` bridging QwenPaw ``ToolDescriptor``.

LeAgent's workflow engine expects every tool to be a ``BaseTool`` instance
with attributes like ``name``, ``description``, ``parameters`` (JSON Schema),
``category``, ``is_read_only``, ``is_destructive``, ``aliases``, ``version``.

QwenPaw tools are plain functions decorated with ``@tool_descriptor`` that
carry a :class:`~qwenpaw.runtime.tool_registry.ToolDescriptor`.  This module
wraps each ``ToolDescriptor`` into a ``BaseTool``-compatible facade so the
auto-generated ``Tool.<name>`` workflow nodes can be built from QwenPaw's
native tool registry — without any ``leagent`` dependency.
"""

from __future__ import annotations

import inspect
from enum import Enum
from typing import Any, Callable, get_type_hints

from pydantic import BaseModel


class ToolCategory(str, Enum):
    """Mirror of LeAgent's ``ToolCategory`` enum."""

    GENERAL = "general"
    FILE = "file"
    WEB = "web"
    DATA = "data"
    DATABASE = "database"
    AGENT = "agent"
    SYSTEM = "system"
    MEDIA = "media"
    CODING = "coding"
    UTILITY = "utility"


# Mapping from QwenPaw tool module prefixes to ToolCategory values
_MODULE_PREFIX_MAP: list[tuple[str, ToolCategory]] = [
    ("file_io", ToolCategory.FILE),
    ("file_search", ToolCategory.FILE),
    ("shell", ToolCategory.SYSTEM),
    ("browser", ToolCategory.WEB),
    ("web_search", ToolCategory.WEB),
    ("web_fetch", ToolCategory.WEB),
    ("send_file", ToolCategory.MEDIA),
    ("desktop", ToolCategory.SYSTEM),
    ("view_media", ToolCategory.MEDIA),
    ("get_current_time", ToolCategory.UTILITY),
    ("get_token_usage", ToolCategory.UTILITY),
    ("agent_management", ToolCategory.AGENT),
    ("delegate_external", ToolCategory.AGENT),
    ("make_skill", ToolCategory.UTILITY),
    ("ast_tool", ToolCategory.CODING),
    ("goal", ToolCategory.AGENT),
    ("mission", ToolCategory.AGENT),
]


def _guess_category(desc: Any) -> ToolCategory:
    """Best-effort category inference from the descriptor or func module."""
    # Check explicit metadata
    meta = getattr(desc, "metadata", None) or {}
    cat_raw = meta.get("category") or meta.get("tool_category")
    if cat_raw:
        if isinstance(cat_raw, ToolCategory):
            return cat_raw
        try:
            return ToolCategory(str(cat_raw).lower())
        except ValueError:
            pass

    # Check sandbox requirements for hints
    sandbox = getattr(desc, "requires_sandbox", None) or ()
    if "shell_exec" in sandbox:
        return ToolCategory.SYSTEM
    if "file_write" in sandbox:
        return ToolCategory.FILE

    # Check func module
    func = getattr(desc, "func", None)
    if func is not None:
        module = getattr(func, "__module__", "") or ""
        for prefix, cat in _MODULE_PREFIX_MAP:
            if prefix in module:
                return cat

    return ToolCategory.GENERAL


# ── Python type → JSON Schema type mapping ──────────────────────────────────

_PY_TYPE_MAP: dict[type, str] = {
    str: "string",
    int: "integer",
    float: "number",
    bool: "boolean",
    list: "array",
    dict: "object",
}


def _build_json_schema(func: Callable[..., Any]) -> dict[str, Any]:
    """Infer a JSON Schema ``object`` from ``func``'s type-annotated signature.

    Falls back to an empty object schema when annotations are missing so
    the workflow editor still renders the node (with a single ``params``
    free-form input).
    """
    try:
        sig = inspect.signature(func)
    except (ValueError, TypeError):
        return {"type": "object", "properties": {}}

    try:
        hints = get_type_hints(func)
    except Exception:  # noqa: BLE001
        hints = {}

    properties: dict[str, Any] = {}
    required: list[str] = []

    for param_name, param in sig.parameters.items():
        if param_name in ("self", "cls"):
            continue
        if param.kind in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD):
            continue

        annotation = hints.get(param_name, param.annotation)
        if annotation is inspect.Parameter.empty:
            # No annotation — treat as string fallback
            prop: dict[str, Any] = {"type": "string"}
        elif annotation in _PY_TYPE_MAP:
            prop = {"type": _PY_TYPE_MAP[annotation]}
        else:
            # Handle Optional[X], Union[X, None], etc.
            origin = getattr(annotation, "__origin__", None)
            args = getattr(annotation, "__args__", ())
            if origin is type(None):  # noqa: E721
                prop = {"type": "string"}
            elif hasattr(annotation, "__origin__") and origin is not None:
                # typing.List, typing.Dict, etc.
                type_name = getattr(origin, "__name__", "") or getattr(origin, "_name", "")
                if type_name in ("list", "List"):
                    prop = {"type": "array"}
                elif type_name in ("dict", "Dict"):
                    prop = {"type": "object"}
                elif type_name in ("set", "Set"):
                    prop = {"type": "array"}
                elif type_name in ("tuple", "Tuple"):
                    prop = {"type": "array"}
                else:
                    # Could be Optional — extract non-None type
                    non_none = [a for a in args if a is not type(None)]  # noqa: E721
                    if len(non_none) == 1 and non_none[0] in _PY_TYPE_MAP:
                        prop = {"type": _PY_TYPE_MAP[non_none[0]]}
                    else:
                        prop = {"type": "string"}
            else:
                # Pydantic model or other complex type → object
                if isinstance(annotation, type) and issubclass(annotation, BaseModel):
                    prop = {"type": "object"}
                else:
                    prop = {"type": "string"}

        # Description from docstring or param default
        doc = getattr(func, "__doc__", None) or ""
        if doc:
            prop.setdefault("description", "")

        # Default value
        if param.default is not inspect.Parameter.empty:
            prop["default"] = param.default
        else:
            required.append(param_name)

        properties[param_name] = prop

    return {
        "type": "object",
        "properties": properties,
        "required": required,
    }


class BaseTool:
    """LeAgent-compatible ``BaseTool`` facade wrapping a QwenPaw ``ToolDescriptor``.

    Exposes the attributes the workflow ``tool_factory`` and ``schema_bridge``
    expect, without requiring the ``leagent`` package:

    * ``name``            — tool name (from descriptor)
    * ``description``     — human-readable summary
    * ``parameters``      — JSON Schema ``object`` inferred from the func signature
    * ``category``        — :class:`ToolCategory`
    * ``aliases``         — empty list (QwenPaw has no alias system)
    * ``version``         — ``"1.0.0"``
    * ``is_read_only``    — True if no ``file_write`` / ``shell_exec`` sandbox needed
    * ``is_destructive``  — False by default
    """

    def __init__(self, descriptor: Any) -> None:
        self._descriptor = descriptor
        self.name: str = getattr(descriptor, "name", "") or ""
        self.description: str = getattr(descriptor, "description", "") or ""
        self._category: ToolCategory = _guess_category(descriptor)
        self.aliases: list[str] = []
        self.version: str = "1.0.0"

        sandbox = set(getattr(descriptor, "requires_sandbox", None) or ())
        self.is_read_only: bool = not sandbox
        self.is_destructive: bool = "file_write" in sandbox and "shell_exec" in sandbox

        # Build JSON Schema from the function signature
        func = getattr(descriptor, "func", None)
        if func is not None:
            self.parameters: dict[str, Any] = _build_json_schema(func)
        else:
            self.parameters = {"type": "object", "properties": {}}

    @property
    def category(self) -> ToolCategory:
        return self._category

    @property
    def descriptor(self) -> Any:
        """The underlying QwenPaw ``ToolDescriptor``."""
        return self._descriptor

    @property
    def func(self) -> Callable[..., Any]:
        """The underlying callable."""
        return self._descriptor.func

    def __repr__(self) -> str:
        return f"<BaseTool {self.name!r} category={self._category.value}>"


def wrap_descriptor(descriptor: Any) -> BaseTool:
    """Convenience: wrap a QwenPaw ``ToolDescriptor`` into a ``BaseTool``."""
    return BaseTool(descriptor)


__all__ = ["BaseTool", "ToolCategory", "wrap_descriptor"]
