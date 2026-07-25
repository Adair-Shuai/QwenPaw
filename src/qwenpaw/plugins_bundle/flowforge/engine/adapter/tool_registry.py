# -*- coding: utf-8 -*-
"""Adapter: ``ToolRegistry`` / ``ToolExecutor`` bridging QwenPaw's tool system.

LeAgent's workflow engine expects:

* ``ToolRegistry.list_all()`` → ``list[BaseTool]``
* ``ToolExecutor.execute(name, params, context)`` → result with ``.result.success`` / ``.result.data`` / ``.result.error``

QwenPaw's :class:`~qwenpaw.runtime.tool_registry.ToolRegistry` stores
:class:`~qwenpaw.runtime.tool_registry.ToolDescriptor` instances (plain
decorated functions).  This adapter wraps them into :class:`BaseTool`
facades and provides a ``ToolExecutor`` that calls ``descriptor.func``
directly — honouring async vs sync and normalising the return value.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
from dataclasses import dataclass
from typing import Any

from .tool_base import BaseTool, ToolCategory, wrap_descriptor
from ..adapter.log_compat import get_logger

logger = get_logger(__name__)


@dataclass
class ToolResult:
    """Normalised tool execution result (mirrors LeAgent's ``ToolResult``)."""

    success: bool = True
    data: Any = None
    error: str | None = None


@dataclass
class ToolExecResult:
    """Wrapper around :class:`ToolResult` (mirrors LeAgent's exec result)."""

    result: ToolResult


class ToolRegistry:
    """Adapter wrapping QwenPaw's ``ToolRegistry`` into LeAgent-compatible API.

    * ``list_all()`` — returns ``list[BaseTool]`` (one per registered descriptor)
    * ``get(name)``  — returns the ``BaseTool`` or ``None``
    * ``names()``    — returns sorted tool names
    """

    def __init__(self, qwenpaw_registry: Any | None = None) -> None:
        self._qp_registry = qwenpaw_registry
        self._cache: dict[str, BaseTool] = {}
        self._refresh()

    def _refresh(self) -> None:
        """Rebuild the ``BaseTool`` cache from the underlying registry."""
        self._cache.clear()
        if self._qp_registry is None:
            return
        # QwenPaw ToolRegistry stores descriptors in ``_descs`` dict
        descs = getattr(self._qp_registry, "_descs", None)
        if descs is None:
            # Fallback: try treating it as a plain dict
            if isinstance(self._qp_registry, dict):
                descs = self._qp_registry
            else:
                return
        for name, desc in descs.items():
            try:
                self._cache[name] = wrap_descriptor(desc)
            except Exception:  # noqa: BLE001
                logger.warning("Failed to wrap tool %r", name, exc_info=True)

    def list_all(self) -> list[BaseTool]:
        """Return all registered tools as ``BaseTool`` facades."""
        return list(self._cache.values())

    def get(self, name: str) -> BaseTool | None:
        """Return the ``BaseTool`` for ``name``, or ``None``."""
        return self._cache.get(name)

    def names(self) -> list[str]:
        """Return sorted tool names."""
        return sorted(self._cache.keys())

    def __contains__(self, name: object) -> bool:
        return isinstance(name, str) and name in self._cache

    def __len__(self) -> int:
        return len(self._cache)


class ToolExecutor:
    """Adapter that executes QwenPaw tool functions directly.

    The workflow nodes call ``tool_executor.execute(tool_name, params, context)``
    and expect a result object with ``.result.success``, ``.result.data``, and
    ``.result.error``.  This executor resolves the tool from the registry,
    calls ``descriptor.func(**params)``, and normalises the return value.
    """

    def __init__(self, registry: ToolRegistry | Any | None = None) -> None:
        if isinstance(registry, ToolRegistry):
            self._registry = registry
        elif registry is not None:
            self._registry = ToolRegistry(registry)
        else:
            self._registry = ToolRegistry()

    def get_tool_context(self, state: Any | None = None) -> Any:
        """Return a context object for the tool (currently the state itself)."""
        return state

    async def execute(
        self,
        tool_name: str,
        params: dict[str, Any],
        context: Any | None = None,
    ) -> ToolExecResult:
        """Execute ``tool_name`` with ``params`` and return a normalised result."""
        tool = self._registry.get(tool_name)
        if tool is None:
            return ToolExecResult(
                result=ToolResult(
                    success=False,
                    error=f"Tool '{tool_name}' not found in registry",
                ),
            )

        func = tool.func
        try:
            if asyncio.iscoroutinefunction(func):
                raw = await func(**params)
            else:
                raw = func(**params)
                if inspect.isawaitable(raw):
                    raw = await raw
        except Exception as exc:  # noqa: BLE001
            logger.error(
                "tool_executor_error",
                tool=tool_name,
                error=str(exc),
                exc_info=True,
            )
            return ToolExecResult(
                result=ToolResult(success=False, error=f"{type(exc).__name__}: {exc}"),
            )

        # Normalise the return value into a ``ToolResult.data`` payload.
        data = _normalise_tool_output(raw)
        return ToolExecResult(result=ToolResult(success=True, data=data))


def _normalise_tool_output(raw: Any) -> Any:
    """Extract a plain data value from QwenPaw tool return types.

    QwenPaw tools may return:
    * Plain values (str, dict, list, etc.) — returned as-is.
    * ``ToolChunk`` (agentscope) — extract text content.
    * Objects with ``.content`` / ``.text`` / ``.data`` — best-effort unwrap.
    """
    if raw is None:
        return None

    # agentscope ToolChunk
    content = getattr(raw, "content", None)
    if content is not None and hasattr(content, "__iter__"):
        texts: list[str] = []
        for block in content:
            text = getattr(block, "text", None)
            if isinstance(text, str) and text:
                texts.append(text)
        if texts:
            return "\n".join(texts) if len(texts) > 1 else texts[0]

    # Objects with a text/data attribute
    for attr in ("text", "data", "output", "result"):
        val = getattr(raw, attr, None)
        if val is not None and not callable(val):
            return val

    return raw


__all__ = [
    "ToolExecResult",
    "ToolExecutor",
    "ToolRegistry",
    "ToolResult",
]
