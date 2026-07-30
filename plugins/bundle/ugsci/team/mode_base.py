# -*- coding: utf-8 -*-
"""Mode base for UGSci team workflow — adapted from OMP's mode_base.

Provides:
- Gate lifecycle management (create StopHandler + gate on setup)
- Stop handler registration into workspace plugins
- Mutual exclusion via ``claim_workflow()``
- Session reset support
- Common helpers (info_msg, rewrite_user_msg)
"""

from __future__ import annotations

import logging
import weakref
from typing import Any, ClassVar

from agentscope.message import Msg, TextBlock

from qwenpaw.modes.base import AgentMode
from qwenpaw.runtime.hooks import HookContext

logger = logging.getLogger(__name__)


class UGSciModeBase(AgentMode):
    """Common setup / lifecycle for UGSci workflow modes.

    Subclasses must set ``name``, ``gate_cls``, ``plugin_id``,
    ``handler_name``, and ``scope``.
    """

    gate_cls: type
    plugin_id: str
    handler_name: str
    scope: str

    _instances: ClassVar[list[weakref.ReferenceType]] = []

    def __init__(self) -> None:
        self._gate: Any = None
        self._workspace_ref: weakref.ReferenceType[Any] | None = None
        UGSciModeBase._instances.append(weakref.ref(self))

    def setup(self, workspace: object) -> None:
        super().setup(workspace)
        self._workspace_ref = weakref.ref(workspace)
        from qwenpaw.loop.gates import StopHandler, StopHandlerRegistration

        handler = StopHandler()
        gate = self.gate_cls()
        handler.register(gate)
        self._gate = gate

        plugins = getattr(workspace, "plugins", None)
        if plugins is not None:
            if not hasattr(plugins, "stop_handlers"):
                plugins.stop_handlers = []
            plugins.stop_handlers.append(
                StopHandlerRegistration(
                    plugin_id=self.plugin_id,
                    handler=handler,
                    priority=0,
                    name=self.handler_name,
                    scope=self.scope,
                ),
            )

    def is_active(
        self,
        ctx: Any,  # pylint: disable=unused-argument
    ) -> bool:
        # pylint: disable=protected-access
        return self._gate is not None and self._gate._state() is not None

    async def on_conversation_reset(
        self,
        ctx: HookContext,  # pylint: disable=unused-argument
    ) -> None:
        """Clear gate state on /new and /clear."""
        if self._gate is not None:
            self._gate.reset_session()

    def claim_workflow(self) -> None:
        """Deactivate peer UGSci/OMP workflows so only this scope is active."""
        my_ws = self._workspace_ref() if self._workspace_ref else None
        alive: list[weakref.ReferenceType] = []
        for ref in UGSciModeBase._instances:
            mode = ref()
            if mode is None:
                continue
            alive.append(ref)
            peer_gate = mode._gate  # pylint: disable=protected-access
            if mode is self or peer_gate is None:
                continue
            peer_ws = (
                mode._workspace_ref()  # pylint: disable=protected-access
                if mode._workspace_ref  # pylint: disable=protected-access
                else None
            )
            if my_ws is not None and peer_ws is not my_ws:
                continue
            if peer_gate._state() is not None:  # pylint: disable=protected-access
                logger.info(
                    "Deactivating peer mode '%s' for '%s'",
                    mode.name,
                    self.name,
                )
                peer_gate.reset_session()
        UGSciModeBase._instances = alive


def info_msg(text: str) -> Msg:
    """Build a system info message for slash-command help/errors."""
    return Msg(
        name="system",
        content=[TextBlock(type="text", text=text)],
        role="system",
    )


def rewrite_user_msg(ctx: Any, text: str) -> None:
    """Replace the last user message content with *text*."""
    msgs = getattr(ctx, "input_msgs", None)
    if not msgs:
        return
    last = msgs[-1]
    if isinstance(last, Msg):
        last.content = [TextBlock(type="text", text=text)]


__all__ = ["UGSciModeBase", "info_msg", "rewrite_user_msg"]
