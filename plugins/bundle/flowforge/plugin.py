# -*- coding: utf-8 -*-
"""FlowForge plugin backend for QwenPaw.

Registers a FastAPI router at ``/api/flowforge`` exposing the full
workflow lifecycle (flow CRUD, run start/cancel, SSE event stream,
WebSocket live updates, node-type catalogue).

Wires the :class:`WorkflowExecutor` to the host's services via the
:method:`PluginApi.register_startup_hook` so that ``tool_registry``,
``agent_runtime`` and ``llm_service`` are populated once the workspace
manager is ready.

Frontend bundle at ``ui/dist/index.js`` registers a ``/flowforge``
route + sidebar menu entry (see ``ui/src/index.ts``).
"""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from .router import build_router
from .service import WorkflowService, build_service

logger = logging.getLogger("qwenpaw").getChild("plugin.flowforge")

PLUGIN_ID = "flowforge"
PLUGIN_NAME = "FlowForge"
PLUGIN_DIR = Path(__file__).parent


class FlowForgePlugin:
    """FlowForge plugin backend entry point."""

    def __init__(self) -> None:
        self._service: WorkflowService | None = None

    # ------------------------------------------------------------------
    def register(self, api) -> None:  # type: ignore[no-untyped-def]
        """Register all plugin components with the host."""
        logger.info("[%s] Plugin registering", PLUGIN_ID)

        # Record hosted cleanup before starting the service loop. The runtime
        # ledger retains a failed critical teardown for a safe unload retry.
        effect = getattr(api, "effect", None)
        try:
            if callable(effect):
                effect(
                    f"{PLUGIN_ID}_service",
                    setup=self._create_service,
                    teardown=self._close_service,
                    shutdown_critical=True,
                )
            else:
                self._create_service()
        except Exception as exc:
            logger.error("Failed to build WorkflowService: %s", exc)
            raise

        service = self._service
        if service is None:
            raise RuntimeError(
                "Workflow service setup did not create a service",
            )

        # 2. Register the FastAPI router at /api/flowforge.
        try:
            router = build_router(service)
            api.register_http_router(
                router,
                prefix="/flowforge",
                tags=["flowforge"],
            )
            logger.info(
                "[%s] HTTP router registered at /api/flowforge",
                PLUGIN_ID,
            )
        except Exception as exc:
            logger.error("Failed to register HTTP router: %s", exc)

        from .tools import build_tools

        for tool in build_tools(service):
            api.register_tool(
                tool_name=tool.__name__,
                tool_func=tool,
                description=(tool.__doc__ or "").split("\n", 1)[0],
                tool_type="internal",
                icon="🔀",
            )

        # 3. Wire the executor to the host's services once they are ready.
        api.register_startup_hook(
            hook_name=f"{PLUGIN_ID}_wire_services",
            callback=self._wire_services,
            priority=90,
        )

        # Legacy embedding hosts can still use the historical hook. Production
        # hosts use the critical runtime ledger for unload, uninstall and exit.
        if not callable(effect):
            api.register_uninstall_hook(
                hook_name=f"{PLUGIN_ID}_cleanup",
                callback=self._on_uninstall,
            )

    def _create_service(self) -> None:
        self._service = build_service()

    async def _close_service(self) -> None:
        if self._service is not None:
            await self._service.aclose()
            self._service = None

    # ------------------------------------------------------------------
    # Startup wiring
    # ------------------------------------------------------------------
    async def _wire_services(self) -> None:
        """Initialize agent-scoped discovery and the host runtime adapters.

        Wires the adapter-layer components that bridge QwenPaw's native
        systems (ToolRegistry, ProviderManager, workspace manager) into the
        workflow engine.
        """
        if self._service is None:
            return
        executor = self._service.executor

        # ── 1. Tool layer ────────────────────────────────────────────────
        try:
            from qwenpaw.plugins.registry import PluginRegistry
            from .node_catalog import AgentNodeCatalog
            from .engine.adapter import AgentRuntime

            mgr = PluginRegistry().get_workspace_manager()
            if mgr is None:
                raise RuntimeError("Workspace manager is not ready")
            self._service.node_catalog = AgentNodeCatalog(
                mgr,
                host_loop=asyncio.get_running_loop(),
            )
            executor.tool_registry = None
            executor.tool_executor = None
            executor.agent_runtime = AgentRuntime(workspace_manager=mgr)
            types = await self._service.refresh_node_types()
            logger.info(
                "[%s] Agent-scoped node catalogue ready (%d nodes)",
                PLUGIN_ID,
                len(types),
            )
        except Exception as exc:
            logger.warning(
                "[%s] Failed to wire tool/agent services: %s",
                PLUGIN_ID,
                exc,
            )

        # ── 2. LLM layer ────────────────────────────────────────────────
        # Wire the LLMService adapter that uses ProviderManager.
        try:
            from .engine.adapter import LLMService

            executor.llm_service = LLMService()
            logger.info("[%s] Wired llm_service", PLUGIN_ID)
        except Exception as exc:
            logger.warning(
                "[%s] Failed to wire llm_service: %s",
                PLUGIN_ID,
                exc,
            )

    # ------------------------------------------------------------------
    # Uninstall cleanup
    # ------------------------------------------------------------------
    async def _on_uninstall(
        self,
        *,
        plugin_id: str,
        delete_files: bool = False,
    ) -> None:
        if plugin_id != PLUGIN_ID:
            return
        # Durable files belong to the install layer, never this runtime hook.
        del delete_files
        await self._close_service()
        logger.info("[%s] Uninstall cleanup complete", PLUGIN_ID)

    # ------------------------------------------------------------------
    # Public accessor (used by tests)
    # ------------------------------------------------------------------
    @property
    def service(self) -> WorkflowService | None:
        return self._service


plugin = FlowForgePlugin()


__all__ = [
    "PLUGIN_DIR",
    "PLUGIN_ID",
    "PLUGIN_NAME",
    "FlowForgePlugin",
    "plugin",
]
