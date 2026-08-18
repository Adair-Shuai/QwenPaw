# -*- coding: utf-8 -*-
"""Shared AgentScope ToolChunk helper for domain tools.

Success payloads are offered to GenUI so UGSci domain results can render
as inline dashboards without each tool knowing the card schema.
"""

from __future__ import annotations

import json
from typing import Any


def emit_tool_chunk(payload: dict[str, Any], *, error: bool = False) -> Any:
    """Serialize ``payload`` as a ToolChunk, attaching GenUI on success."""
    body = payload
    if not error:
        try:
            from qwenpaw.plugins_bundle.ugsci.genui.domain_cards import attach_genui

            body = attach_genui(payload)
        except Exception:
            body = payload
    text = json.dumps(body, ensure_ascii=False, indent=2)
    try:
        from agentscope.message import TextBlock, ToolResultState
        from agentscope.tool import ToolChunk
    except Exception:
        return {"error": error, "payload": body}
    return ToolChunk(
        is_last=True,
        state=ToolResultState.ERROR if error else ToolResultState.SUCCESS,
        content=[TextBlock(type="text", text=text)],
    )


__all__ = ["emit_tool_chunk"]
