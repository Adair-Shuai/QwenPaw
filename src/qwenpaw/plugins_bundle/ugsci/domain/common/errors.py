# -*- coding: utf-8 -*-
"""Domain error model.

All domain tools and services raise ``DomainError`` instead of leaking
third-party exceptions (lasio, scipy, numpy).  The ``code`` field tells
the caller what category of failure occurred; ``details`` carries
non-sensitive context; ``retryable`` hints whether a repeat call might
succeed.
"""

from __future__ import annotations

import logging
from enum import Enum
from typing import Any

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.domain")


class DomainErrorCode(str, Enum):
    """Stable error code enum used across all domain tools."""

    INVALID_INPUT = "invalid_input"
    FILE_NOT_FOUND = "file_not_found"
    UNSUPPORTED_FORMAT = "unsupported_format"
    DEPENDENCY_UNAVAILABLE = "dependency_unavailable"
    ENGINE_UNAVAILABLE = "engine_unavailable"
    UNSUPPORTED_OPERATION = "unsupported_operation"
    CALCULATION_FAILED = "calculation_failed"
    NON_CONVERGENT = "non_convergent"
    INVALID_RESULT = "invalid_result"


class DomainError(Exception):
    """Unified domain exception.

    Attributes:
        code: A ``DomainErrorCode`` categorising the failure.
        message: Human-readable summary (safe to show to agents).
        details: Non-sensitive structured context (no stack traces,
            env vars, or absolute paths containing user names).
        retryable: Whether a repeat invocation might succeed.
    """

    code: DomainErrorCode
    message: str
    details: dict[str, Any]
    retryable: bool

    def __init__(
        self,
        code: DomainErrorCode,
        message: str = "",
        *,
        details: dict[str, Any] | None = None,
        retryable: bool = False,
    ) -> None:
        self.code = code
        self.message = message or code.value
        self.details = details or {}
        self.retryable = retryable
        super().__init__(self.message)

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-safe representation for tool results."""
        return {
            "code": self.code.value,
            "message": self.message,
            "details": self.details,
            "retryable": self.retryable,
        }

    def __repr__(self) -> str:
        return (
            f"DomainError(code={self.code.value!r}, "
            f"message={self.message!r}, retryable={self.retryable})"
        )


def wrap_unknown_error(exc: Exception) -> DomainError:
    """Convert an unexpected exception into ``calculation_failed``.

    The original traceback is logged at DEBUG level so server-side logs
    retain full diagnostics, but the agent-facing error only carries the
    exception type name and message — never the full traceback.
    """
    logger.warning("Wrapping unknown exception: %s: %s", type(exc).__name__, exc, exc_info=True)
    return DomainError(
        DomainErrorCode.CALCULATION_FAILED,
        message=f"Unexpected error: {type(exc).__name__}: {exc}",
        retryable=False,
    )
