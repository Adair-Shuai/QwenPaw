# -*- coding: utf-8 -*-
"""Request-scoped OpenUI instructions for capable Console clients."""

from pathlib import Path

from agentscope.middleware import MiddlewareBase

from .interactions import (
    InteractionMiddleware,
    InteractionService,
    InteractionStore,
    build_router,
    build_tool,
    is_available,
)
from .interactions.tool import capable_context


class OpenUIMiddleware(MiddlewareBase):
    """Append the catalog without modifying messages or agent config."""

    def __init__(self, prompt: str):
        self.prompt = prompt

    async def on_system_prompt(self, _agent, current_prompt: str) -> str:
        if self.prompt in current_prompt:
            return current_prompt
        return f"{current_prompt.rstrip()}\n\n{self.prompt}".strip()


class OpenUIPlugin:
    """The frontend capability disappears when the plugin is disabled."""

    def register(self, api):
        from qwenpaw.constant import WORKING_DIR

        prompt = (
            (Path(__file__).parent / "dist" / "system-prompt.txt")
            .read_text(encoding="utf-8")
            .strip()
        )
        if not prompt:
            raise ValueError(
                "OpenUI system prompt is empty; rebuild the plugin",
            )

        def factory(ctx, _agent_config):
            root_session = getattr(ctx, "root_session_id", None)
            if root_session and root_session != getattr(
                ctx,
                "session_id",
                None,
            ):
                return None
            request = getattr(ctx, "request", None)
            if getattr(request, "channel", None) != "console":
                return None
            context = getattr(request, "request_context", None)
            if not isinstance(context, dict):
                return None
            capabilities = context.get("ui_capabilities")
            if (
                not isinstance(capabilities, dict)
                or capabilities.get("openui") != "v1"
            ):
                return None
            if (
                context.get("source")
                in {
                    "cron",
                    "heartbeat",
                    "portability_adaptation",
                    "subagent",
                }
                or context.get("subagent_allowed_tools") is not None
            ):
                return None
            return OpenUIMiddleware(prompt)

        api.register_middleware(factory)

        service = InteractionService(
            InteractionStore(
                Path(WORKING_DIR) / "openui" / "interactions.sqlite3",
            ),
        )
        api.register_http_router(
            build_router(service),
            prefix="/openui/interactions",
            tags=["openui"],
        )
        tool = build_tool(service)
        api.register_tool(
            tool_name=tool.__name__,
            tool_func=tool,
            description=tool.__doc__,
            enabled=True,
            tool_type="internal",
            icon="📝",
            allowed_channels=("console",),
            availability_check=is_available,
        )
        api.register_middleware(
            lambda ctx, _config: (
                InteractionMiddleware(ctx) if capable_context(ctx) else None
            ),
        )


plugin = OpenUIPlugin()
