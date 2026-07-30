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

import logging
from pathlib import Path
from typing import Any

from fastapi import APIRouter

from .engine import (
    NodeRegistry,
    WorkflowExecutor,
    build_workflow_state_store,
    get_registry,
)
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

        # 1. Build the service (default flows dir under ~/.qwenpaw/flowforge).
        try:
            self._service = build_service()
        except Exception as exc:
            logger.error("Failed to build WorkflowService: %s", exc)
            return

        # 2. Register the FastAPI router at /api/flowforge.
        try:
            router = build_router(self._service)
            api.register_http_router(
                router,
                prefix="/flowforge",
                tags=["flowforge"],
            )
            logger.info(
                "[%s] HTTP router registered at /api/flowforge", PLUGIN_ID,
            )
        except Exception as exc:
            logger.error("Failed to register HTTP router: %s", exc)

        # 3. Wire the executor to the host's services once they are ready.
        api.register_startup_hook(
            hook_name=f"{PLUGIN_ID}_wire_services",
            callback=self._wire_services,
            priority=90,
        )

        # 4. Cleanup on uninstall (clear in-memory runs).
        api.register_uninstall_hook(
            hook_name=f"{PLUGIN_ID}_cleanup",
            callback=self._on_uninstall,
        )

    # ------------------------------------------------------------------
    # Startup wiring
    # ------------------------------------------------------------------
    def _wire_services(self) -> None:
        """Populate executor.tool_registry / tool_executor / agent_runtime / llm_service.

        Wires the adapter-layer components that bridge QwenPaw's native
        systems (ToolRegistry, ProviderManager, workspace manager) into the
        workflow engine.
        """
        if self._service is None:
            return
        executor = self._service.executor

        # ── 1. Tool layer ────────────────────────────────────────────────
        # Wrap QwenPaw's native ToolRegistry with the adapter's ToolRegistry
        # and create a ToolExecutor that calls tool functions directly.
        try:
            from qwenpaw.plugins.registry import PluginRegistry

            registry = PluginRegistry()
            mgr = registry.get_workspace_manager()
            if mgr is not None:
                agents = getattr(mgr, "agents", None) or getattr(
                    mgr, "workspaces", None,
                )
                if agents:
                    first_ws = next(iter(agents.values()))
                    plugins_ctx = getattr(first_ws, "plugins", None)
                    if plugins_ctx is not None:
                        qp_tool_reg = getattr(plugins_ctx, "tool_registry", None)
                        if qp_tool_reg is not None:
                            from .engine.adapter import ToolRegistry as AdapterToolRegistry
                            from .engine.adapter import ToolExecutor as AdapterToolExecutor

                            adapter_reg = AdapterToolRegistry(qp_tool_reg)
                            executor.tool_registry = adapter_reg
                            executor.tool_executor = AdapterToolExecutor(adapter_reg)
                            logger.info(
                                "[%s] Wired tool_registry + tool_executor (%d tools)",
                                PLUGIN_ID, len(adapter_reg),
                            )
                # Wire the agent runtime adapter
                from .engine.adapter import AgentRuntime

                executor.agent_runtime = AgentRuntime(workspace_manager=mgr)
                logger.info("[%s] Wired agent_runtime", PLUGIN_ID)
        except Exception as exc:
            logger.warning("[%s] Failed to wire tool/agent services: %s", PLUGIN_ID, exc)

        # ── 2. LLM layer ────────────────────────────────────────────────
        # Wire the LLMService adapter that uses ProviderManager.
        try:
            from .engine.adapter import LLMService

            executor.llm_service = LLMService()
            logger.info("[%s] Wired llm_service", PLUGIN_ID)
        except Exception as exc:
            logger.warning("[%s] Failed to wire llm_service: %s", PLUGIN_ID, exc)

    # ------------------------------------------------------------------
    # Uninstall cleanup
    # ------------------------------------------------------------------
    def _on_uninstall(self, *, plugin_id: str, delete_files: bool = False) -> None:
        if self._service is not None:
            self._service._runs.clear()  # noqa: SLF001
        logger.info("[%s] Uninstall cleanup complete", PLUGIN_ID)

    # ------------------------------------------------------------------
    # Public accessor (used by tests)
    # ------------------------------------------------------------------
    @property
    def service(self) -> WorkflowService | None:
        return self._service


plugin = FlowForgePlugin()


__all__ = ["PLUGIN_DIR", "PLUGIN_ID", "PLUGIN_NAME", "FlowForgePlugin", "plugin"]
