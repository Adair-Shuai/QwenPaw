# -*- coding: utf-8 -*-
"""Instance-owned native approval dispatch, without host Agent execution."""


class TelegramCardHandler:
    def __init__(self, platform):
        self._platform = platform

    async def handle_callback_query(self, query):
        # The card dispatcher delegates to its owning platform callback.
        # pylint: disable=protected-access
        await self._platform._handle_callback(query)
