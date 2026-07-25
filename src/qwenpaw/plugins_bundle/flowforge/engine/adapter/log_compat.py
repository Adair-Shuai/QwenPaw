# -*- coding: utf-8 -*-
"""Structured logger wrapper for FlowForge.

LeAgent's codebase uses ``structlog``-style logging calls like::

    logger.info("event_name", count=5, tool="read_file")

Python's standard ``logging`` module doesn't accept keyword arguments
beyond ``exc_info`` and ``stack_info``.  This wrapper converts them to
a readable format string so the existing FlowForge node code works
without modification.
"""

from __future__ import annotations

import logging
from typing import Any


class StructuredLogger:
    """Wrap a standard ``logging.Logger`` to accept keyword arguments.

    ``logger.info("event", key=value)`` becomes
    ``logger.info("event key=%r", value)``.
    """

    def __init__(self, logger: logging.Logger) -> None:
        self._logger = logger

    def _emit(self, level: int, msg: str, args: tuple, kwargs: dict) -> None:
        # Extract standard logging kwargs
        exc_info = kwargs.pop("exc_info", False)
        stack_info = kwargs.pop("stack_info", False)
        extra = kwargs.pop("extra", None)

        # Convert remaining kwargs to a suffix string
        if kwargs:
            parts = [f"{k}={v!r}" for k, v in sorted(kwargs.items())]
            suffix = " ".join(parts)
            full_msg = f"{msg} {suffix}" if msg else suffix
        else:
            full_msg = msg

        self._logger.log(
            level, full_msg, *args,
            exc_info=exc_info, stack_info=stack_info, extra=extra,
        )

    def debug(self, msg: str, *args: Any, **kwargs: Any) -> None:
        self._emit(logging.DEBUG, msg, args, kwargs)

    def info(self, msg: str, *args: Any, **kwargs: Any) -> None:
        self._emit(logging.INFO, msg, args, kwargs)

    def warning(self, msg: str, *args: Any, **kwargs: Any) -> None:
        self._emit(logging.WARNING, msg, args, kwargs)

    def error(self, msg: str, *args: Any, **kwargs: Any) -> None:
        self._emit(logging.ERROR, msg, args, kwargs)

    def critical(self, msg: str, *args: Any, **kwargs: Any) -> None:
        self._emit(logging.CRITICAL, msg, args, kwargs)

    def exception(self, msg: str, *args: Any, **kwargs: Any) -> None:
        kwargs["exc_info"] = True
        self._emit(logging.ERROR, msg, args, kwargs)

    # Delegate attribute access to the underlying logger
    def __getattr__(self, name: str) -> Any:
        return getattr(self._logger, name)


def get_logger(name: str) -> StructuredLogger:
    """Return a :class:`StructuredLogger` for ``name``."""
    return StructuredLogger(logging.getLogger(name))


__all__ = ["StructuredLogger", "get_logger"]
