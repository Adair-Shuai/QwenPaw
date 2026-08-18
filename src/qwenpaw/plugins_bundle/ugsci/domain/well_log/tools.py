# -*- coding: utf-8 -*-
"""Well log domain tools — stable, namespaced public interface.

Tool names are frozen: ``ugsci_welllog_read``, ``ugsci_welllog_validate``,
``ugsci_welllog_export``.  These names must not change without a migration
plan.

Each tool returns an AgentScope ``ToolChunk``.  The ``agentscope`` import
is deferred to the function body so that importing this module does not
require agentscope at module load time.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from qwenpaw.config.context import (
    get_current_project_dir,
    get_current_workspace_dir,
)

from ..common.errors import DomainError, DomainErrorCode, wrap_unknown_error
from ..common.tool_chunk import emit_tool_chunk
from .adapters.lasio_adapter import LasioAdapter
from .service import WellLogService

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.domain.well_log.tools")

# Singleton service — created lazily
_service: WellLogService | None = None

# --- agentscope availability check -------------------------------------------

_agentscope_available: bool | None = None


def _check_agentscope() -> bool:
    """Return True if agentscope can be imported, False otherwise."""
    global _agentscope_available
    if _agentscope_available is None:
        try:
            from agentscope.message import TextBlock, ToolResultState  # noqa: F401
            from agentscope.tool import ToolChunk  # noqa: F401

            _agentscope_available = True
        except Exception:
            # Catch ImportError, ModuleNotFoundError, and any other
            # exception that might arise from a broken agentscope install.
            _agentscope_available = False
    return _agentscope_available


def _get_service() -> WellLogService:
    global _service
    if _service is None:
        _service = WellLogService(LasioAdapter())
    return _service


def _resolve_workspace_path(path: str) -> str:
    """Resolve a user path against the current Agent project/workspace."""
    candidate = Path(path).expanduser()
    if candidate.is_absolute():
        return str(candidate.resolve())
    base = get_current_project_dir() or get_current_workspace_dir() or Path.cwd()
    return str((base / candidate).resolve())


def _make_error_chunk(exc: DomainError) -> Any:
    """Build a ToolChunk for an error result.

    If agentscope is unavailable, returns a plain dict fallback
    so that the tool never crashes the agent session.
    """
    payload = json.dumps(exc.to_dict(), ensure_ascii=False, indent=2)
    if not _check_agentscope():
        logger.error(
            "agentscope not available; returning plain dict error: %s",
            exc.message,
        )
        return {"error": True, "payload": exc.to_dict()}

    from agentscope.message import TextBlock, ToolResultState
    from agentscope.tool import ToolChunk

    return ToolChunk(
        is_last=True,
        state=ToolResultState.ERROR,
        content=[
            TextBlock(
                type="text",
                text=payload,
            ),
        ],
    )


def _make_success_chunk(result_dict: dict[str, Any]) -> Any:
    return emit_tool_chunk(result_dict, error=False)


async def ugsci_welllog_read(
    path: str,
    encoding: str = "",
    sample_rows: int = 20,
) -> Any:
    """Read a LAS file and return metadata, curve summaries, and sample rows.

    Args:
        path: Path to the LAS file (relative to agent workspace).
        encoding: Optional file encoding (e.g. ``"latin-1"``).
        sample_rows: Number of sample rows from head and tail (default 20, max 200).

    Returns:
        ToolChunk with JSON containing metadata, curve summaries,
        sample data, and QC warnings.
    """
    try:
        service = _get_service()
        result = service.read(
            _resolve_workspace_path(path),
            encoding=encoding,
            sample_rows=sample_rows,
        )
        return _make_success_chunk(result.to_dict())
    except DomainError as exc:
        return _make_error_chunk(exc)
    except Exception as exc:
        return _make_error_chunk(wrap_unknown_error(exc))


async def ugsci_welllog_validate(
    path: str,
    encoding: str = "",
) -> Any:
    """Validate a LAS file and return a QC report.

    Args:
        path: Path to the LAS file.
        encoding: Optional file encoding.

    Returns:
        ToolChunk with JSON containing pass/fail status, errors, warnings,
        and individual check results.
    """
    try:
        service = _get_service()
        result = service.validate(_resolve_workspace_path(path), encoding=encoding)
        return _make_success_chunk(result.to_dict())
    except DomainError as exc:
        return _make_error_chunk(exc)
    except Exception as exc:
        return _make_error_chunk(wrap_unknown_error(exc))


async def ugsci_welllog_export(
    input_path: str,
    output_path: str,
    encoding: str = "utf-8",
) -> Any:
    """Export a LAS file to a new normalised copy.

    The input and output paths must be different.  Only ``.las`` files
    are supported.

    Args:
        input_path: Path to the source LAS file.
        output_path: Path for the output LAS file.
        encoding: File encoding for reading and writing (default ``"utf-8"``).

    Returns:
        ToolChunk with JSON containing the output path and artifact reference.
    """
    try:
        service = _get_service()
        result = service.export(
            _resolve_workspace_path(input_path),
            _resolve_workspace_path(output_path),
            encoding=encoding,
        )
        return _make_success_chunk(result.to_dict())
    except DomainError as exc:
        return _make_error_chunk(exc)
    except Exception as exc:
        return _make_error_chunk(wrap_unknown_error(exc))
