# -*- coding: utf-8 -*-
"""Small durable references for the chat/side-panel simulation monitor.

The reference survives both streamed ToolChunk output and historical \
tool_result
replay. Numerical arrays stay in the result service, outside model \
context.
"""
from __future__ import annotations

import json
from typing import Any


def simulation_reference(
    run_id: str,
    simulator: str = "",
    **scope: Any,
) -> Any:
    from agentscope.message import TextBlock

    payload = json.dumps(
        {
            "kind": "ugsci_simulation",
            "schema_version": 1,
            "run_id": run_id,
            "simulator": simulator,
            **{
                key: str(scope[key])
                for key in ("agent_id", "session_id")
                if scope.get(key)
            },
        },
        ensure_ascii=False,
    )
    # The live SDK concatenates TextBlocks without separators. Explicit
    # boundaries keep the reference readable beside ordinary tool prose.
    return TextBlock(
        type="text",
        text=f"\n<ugsci-simulation-ref>{payload}</ugsci-simulation-ref>\n",
    )
