# -*- coding: utf-8 -*-
"""Runtime helper functions for plugins."""

import asyncio
import inspect
import logging
from typing import Any, Callable, List

logger = logging.getLogger(__name__)


async def invoke_plugin_callback(
    callback: Callable[..., Any],
    *args: Any,
) -> Any:
    """Run a plugin callback without blocking the application's event loop.

    Plugin hooks support synchronous and asynchronous callables.  Synchronous
    hooks often perform file, process, or network I/O, so invoking them on the
    FastAPI loop can freeze both the startup-progress endpoint and every other
    request.  A sync callback that returns an awaitable is supported as well.
    """
    if inspect.iscoroutinefunction(callback):
        return await callback(*args)
    result = await asyncio.to_thread(callback, *args)
    if inspect.isawaitable(result):
        return await result
    return result


class RuntimeHelpers:
    """Runtime helper functions accessible to plugins."""

    def __init__(self, provider_manager=None):
        """Initialize runtime helpers.

        Args:
            provider_manager: ProviderManager instance
        """
        self.provider_manager = provider_manager

    def get_provider(self, provider_id: str):
        """Get provider instance.

        Args:
            provider_id: Provider identifier

        Returns:
            Provider instance or None
        """
        if self.provider_manager:
            return self.provider_manager.get_provider(provider_id)
        return None

    def list_providers(self) -> List[str]:
        """List all available providers.

        Returns:
            List of provider IDs
        """
        if self.provider_manager:
            return [p.id for p in self.provider_manager.list_providers()]
        return []

    def log_info(self, message: str):
        """Log info message.

        Args:
            message: Log message
        """
        logger.info(message)

    def log_error(self, message: str, exc_info=False):
        """Log error message.

        Args:
            message: Log message
            exc_info: Include exception info
        """
        logger.error(message, exc_info=exc_info)

    def log_debug(self, message: str):
        """Log debug message.

        Args:
            message: Log message
        """
        logger.debug(message)
