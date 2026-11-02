# -*- coding: utf-8 -*-
"""Route QQ interactions without unowned cross-thread futures."""

from .tool_guard import parse_interaction_event


class QQCardHandler:
    def __init__(self, platform):
        self._platform = platform

    async def handle_interaction_event(self, event_data):
        # The card dispatcher delegates to its owning platform callback.
        # pylint: disable=protected-access
        parsed = parse_interaction_event(event_data)
        if parsed is None:
            return True
        return await self._platform._handle_approval(event_data, parsed)
