# -*- coding: utf-8 -*-
"""Adapter: in-process Python script sandbox.

Migrated from LeAgent's ``leagent.tools._sandbox.inproc`` module.
Provides ``execute_script()``, ``ScriptExecutionError``, and
``ScriptTimeoutError`` for the workflow ``ScriptNode``.

The sandbox runs Python code in a restricted ``exec`` environment with
a curated set of safe builtins and importable modules.  A signal-based
timeout prevents infinite loops.
"""

from __future__ import annotations

import io
import signal
import threading
from dataclasses import dataclass, field
from typing import Any


class ScriptTimeoutError(Exception):
    """Raised when a script exceeds its wall-clock budget."""


class ScriptExecutionError(Exception):
    """Raised when a script fails with a runtime error."""


@dataclass
class ScriptResult:
    """Result of an in-process script execution."""

    result: Any = None
    locals: dict[str, Any] = field(default_factory=dict)
    stdout: str = ""
    duration_ms: int = 0
    truncated_stdout: bool = False


# Safe builtins for the sandbox
_SAFE_BUILTINS: dict[str, Any] = {
    # Core types
    "bool": bool, "dict": dict, "float": float, "int": int,
    "list": list, "set": set, "str": str, "tuple": tuple,
    "frozenset": frozenset, "bytes": bytes, "bytearray": bytearray,
    # Core functions
    "abs": abs, "all": all, "any": any, "ascii": ascii,
    "bin": bin, "chr": chr, "divmod": divmod, "enumerate": enumerate,
    "filter": filter, "format": format, "hex": hex, "iter": iter,
    "len": len, "map": map, "max": max, "min": min,
    "next": next, "oct": oct, "ord": ord, "pow": pow,
    "print": print, "range": range, "repr": repr, "reversed": reversed,
    "round": round, "sorted": sorted, "sum": sum, "zip": zip,
    "isinstance": isinstance, "issubclass": issubclass,
    "callable": callable, "getattr": getattr, "hasattr": hasattr,
    "setattr": setattr, "delattr": delattr,
    "id": id, "type": type, "vars": vars,
    "True": True, "False": False, "None": None,
    # Exceptions (needed for try/except)
    "Exception": Exception, "ValueError": ValueError,
    "TypeError": TypeError, "KeyError": KeyError,
    "IndexError": IndexError, "AttributeError": AttributeError,
    "RuntimeError": RuntimeError, "StopIteration": StopIteration,
    "ZeroDivisionError": ZeroDivisionError,
    "ImportError": ImportError, "ModuleNotFoundError": ModuleNotFoundError,
    "FileNotFoundError": FileNotFoundError,
    "NotImplementedError": NotImplementedError,
    "ArithmeticError": ArithmeticError, "LookupError": LookupError,
    "OverflowError": OverflowError,
}

# Safe stdlib modules
_SAFE_MODULES: dict[str, Any] = {}


def _init_safe_modules() -> None:
    """Populate ``_SAFE_MODULES`` lazily."""
    if _SAFE_MODULES:
        return
    import math
    import json
    import re
    import statistics
    import datetime
    import itertools
    import collections
    import functools
    import operator
    import string
    import random
    import decimal
    import fractions

    _SAFE_MODULES.update({
        "math": math,
        "json": json,
        "re": re,
        "statistics": statistics,
        "datetime": datetime,
        "itertools": itertools,
        "collections": collections,
        "functools": functools,
        "operator": operator,
        "string": string,
        "random": random,
        "decimal": decimal,
        "fractions": fractions,
    })


class _TimeoutManager:
    """Thread-based timeout manager (cross-platform, unlike SIGALRM)."""

    def __init__(self, timeout_sec: float) -> None:
        self._timeout = timeout_sec
        self._timer: threading.Timer | None = None
        self._timed_out = False

    def start(self) -> None:
        self._timer = threading.Timer(self._timeout, self._fire)
        self._timer.daemon = True
        self._timer.start()

    def _fire(self) -> None:
        self._timed_out = True

    def stop(self) -> None:
        if self._timer is not None:
            self._timer.cancel()
            self._timer = None

    @property
    def timed_out(self) -> bool:
        return self._timed_out


async def execute_script(
    source: str,
    *,
    inputs: dict[str, Any] | None = None,
    timeout_sec: float = 5.0,
    allow_modules: list[str] | None = None,
    max_stdout: int = 65536,
) -> ScriptResult:
    """Execute a Python snippet in the restricted in-process sandbox.

    Args:
        source: Python source code. Assign to ``result`` to emit a value.
        inputs: Mapping of variable name → value injected as globals.
        timeout_sec: Wall-clock budget.
        allow_modules: Extra stdlib module names to whitelist.
        max_stdout: Maximum captured stdout size (bytes).

    Returns:
        :class:`ScriptResult` with the result, locals, and stdout.
    """
    import asyncio
    import time

    _init_safe_modules()

    # Build the execution namespace
    safe_modules = dict(_SAFE_MODULES)
    if allow_modules:
        import importlib

        for mod_name in allow_modules:
            if mod_name not in safe_modules:
                try:
                    safe_modules[mod_name] = importlib.import_module(mod_name)
                except ImportError:
                    pass

    # Set up globals
    globals_ns: dict[str, Any] = {
        "__builtins__": _SAFE_BUILTINS,
        **safe_modules,
    }
    if inputs:
        globals_ns.update(inputs)

    # Capture stdout
    stdout_buffer = io.StringIO()
    real_print = print

    def _capped_print(*args: Any, **kwargs: Any) -> None:
        real_print(*args, file=stdout_buffer, **kwargs)

    globals_ns["print"] = _capped_print
    globals_ns["result"] = None

    locals_ns: dict[str, Any] = {}

    # Execute with timeout (using asyncio.to_thread for non-blocking)
    start = time.monotonic()
    error: Exception | None = None

    def _run() -> None:
        nonlocal error
        try:
            exec(source, globals_ns, locals_ns)  # noqa: S102 — sandboxed
        except Exception as exc:
            error = exc

    try:
        await asyncio.wait_for(
            asyncio.to_thread(_run),
            timeout=timeout_sec,
        )
    except asyncio.TimeoutError:
        duration_ms = int((time.monotonic() - start) * 1000)
        stdout = stdout_buffer.getvalue()
        return ScriptResult(
            result=None,
            locals={},
            stdout=stdout,
            duration_ms=duration_ms,
            truncated_stdout=len(stdout) > max_stdout,
        )

    duration_ms = int((time.monotonic() - start) * 1000)

    if error is not None:
        if isinstance(error, ScriptTimeoutError):
            raise ScriptTimeoutError(str(error)) from error
        raise ScriptExecutionError(f"{type(error).__name__}: {error}") from error

    stdout = stdout_buffer.getvalue()
    truncated = False
    if len(stdout) > max_stdout:
        stdout = stdout[:max_stdout]
        truncated = True

    result_value = locals_ns.get("result", globals_ns.get("result"))

    return ScriptResult(
        result=result_value,
        locals=dict(locals_ns),
        stdout=stdout,
        duration_ms=duration_ms,
        truncated_stdout=truncated,
    )


__all__ = [
    "ScriptExecutionError",
    "ScriptResult",
    "ScriptTimeoutError",
    "execute_script",
]
