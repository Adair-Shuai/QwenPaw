# -*- coding: utf-8 -*-
"""UGSci plugin entry point.

The entry module deliberately contains registration orchestration only.
HTTP APIs, avatar processing, simulation monitoring, and skill-pool
lifecycle logic live in dedicated modules and are imported here through
compatibility aliases.
"""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from typing import Any, Callable

from .avatar import (
    BACKGROUND_COLOR as _BG_COLOR,
    CANVAS_SIZE as _CANVAS_SIZE,
    AvatarService,
)
from .domain_engine.api import build_domain_engine_router
from .docs_api import build_docs_router
from .engine.api import EngineRequest, build_engine_router
from .sim_api import build_sim_router
from .genui.api import build_genui_router
from .health_api import build_health_router, record_route_registration
from .skill_pool import (
    remove_plugin_pool_skills,
    sync_plugin_skills_to_pool,
)
from .tool_manifest import (
    ToolManifestError,
    sync_manifest_tools_to_all_agents,
    validate_tool_bindings,
)
from .visualization import (
    build_visualization_router as _build_provider_visualization_router,
    get_visualization_tool_bindings,
)

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci")

PLUGIN_ID = "ugsci"
PLUGIN_NAME = "UGSci"
PLUGIN_DIR = Path(__file__).parent

_avatar_service = AvatarService(PLUGIN_ID, PLUGIN_DIR)

# Backwards-compatible private names used by older integrations and tests.
_sync_plugin_skills_to_pool = sync_plugin_skills_to_pool
_remove_plugin_pool_skills = remove_plugin_pool_skills
_resource_dir = _avatar_service.resource_dir
_default_avatar_path = _avatar_service.default_avatar_path
_seed_to_filename = _avatar_service.seed_to_filename
_cached_avatar_path = _avatar_service.cached_avatar_path
_fetch_avatar_png_online = _avatar_service.fetch_avatar_png_online
_get_or_fetch_avatar_png = _avatar_service.get_or_fetch_avatar_png
_preset_avatar_data = _avatar_service.preset_avatar_data
_collect_agent_names = _avatar_service.collect_agent_names
_prewarm_avatar_cache = _avatar_service.prewarm_cache
_circle_mask = _avatar_service.circle_mask
_apply_circle_clip = _avatar_service.apply_circle_clip
_team_positions = _avatar_service.team_positions
_compose_team_avatar = _avatar_service.compose_team_avatar


def _build_engine_router():
    """Compatibility wrapper for the extracted engine API."""
    return build_engine_router(PLUGIN_DIR)


def _build_avatar_router():
    """Compatibility wrapper for the extracted avatar API."""
    return _avatar_service.build_router()


def _build_domain_engine_router():
    """Build the domain engine catalog router."""
    return build_domain_engine_router()


def _build_sim_router():
    """Compatibility wrapper for the extracted simulation API."""
    return build_sim_router(PLUGIN_ID)


def _build_visualization_router():
    """Build the UGSci-owned visualization router via its provider."""
    return _build_provider_visualization_router()


class UGSciPlugin:
    """QwenPaw registration coordinator for UGSci capabilities."""

    def register(self, api) -> None:
        """Register lifecycle hooks, modes, routers, and simulation tools."""
        logger.info(
            "[%s] Plugin registered — petroleum domain enhancement active",
            PLUGIN_ID,
        )
        self._register_lifecycle_hooks(api)
        self._register_team(api)
        self._initialize_engines()
        self._register_router(
            api,
            _build_engine_router,
            "/ugsci/engines",
            "ugsci-engines",
            "engine management",
        )
        self._register_router(
            api,
            _build_avatar_router,
            "/ugsci/avatar",
            "ugsci-avatar",
            "avatar",
        )
        self._register_router(
            api,
            _build_sim_router,
            "/ugsci/sim",
            "ugsci-sim",
            "simulation monitoring",
        )
        self._register_router(
            api,
            _build_domain_engine_router,
            "/ugsci/domain-engines",
            "ugsci-domain-engines",
            "domain engine catalog",
        )
        self._register_router(
            api,
            lambda: build_genui_router(api),
            "/ugsci/genui",
            "ugsci-genui",
            "GenUI settings",
        )
        self._register_router(
            api,
            lambda: build_docs_router(PLUGIN_DIR),
            "/ugsci/docs",
            "ugsci-docs",
            "offline documentation",
        )
        self._register_router(
            api,
            lambda: build_health_router(PLUGIN_DIR),
            "/ugsci",
            "ugsci-health",
            "capability health",
        )
        # Visualization is now a UGSci-owned capability.  The user-facing
        # page keeps its historical URL, while its API is namespaced under
        # UGSci.
        self._register_router(
            api,
            _build_visualization_router,
            "/ugsci/visualization",
            "ugsci-visualization",
            "visualization",
        )
        self._register_simulation_tools(api)
        self._register_domain_tools(api)
        self._register_visualization_tools(api)
        self._register_genui(api)

    def _register_lifecycle_hooks(self, api) -> None:
        """Register startup and uninstall hooks independently."""
        try:
            api.register_startup_hook(
                hook_name="ugsci_sync_skills_to_pool",
                callback=self._on_startup_sync_skills,
                priority=80,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Startup skill sync hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )
        try:
            api.register_startup_hook(
                hook_name="ugsci_sync_manifest_tools",
                callback=self._on_startup_sync_manifest_tools,
                priority=95,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Manifest tool sync hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )
        try:
            api.register_uninstall_hook(
                hook_name="ugsci_remove_pool_skills",
                callback=self._on_uninstall_remove_skills,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Uninstall hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )
        try:
            api.register_uninstall_hook(
                hook_name="ugsci_dispose_genui",
                callback=self._on_uninstall_dispose_genui,
            )
        except Exception as exc:
            logger.debug(
                "[%s] GenUI dispose hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )
        try:
            api.register_startup_hook(
                hook_name="ugsci_init",
                callback=self._on_startup,
                # UGSci registers runtime tools from this hook.  Run after
                # plugins such as CloudPaw that persist their built-in agent
                # definitions during startup; otherwise their stale
                # load/modify/save cycle can overwrite the tool entries that
                # PluginApi just added to agent.json.
                priority=90,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Startup initialization hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _register_team(api) -> None:
        """Register the OMP-backed Team mode and its state API."""
        try:
            from .team.mode import UGSciTeamMode

            api.register_mode(UGSciTeamMode)
            logger.info(
                "[%s] UGSci Team mode registered (/ugsci-team)",
                PLUGIN_ID,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register UGSci Team mode: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )
        try:
            from .team.api import build_team_router

            api.register_http_router(
                build_team_router(),
                prefix="/ugsci/team",
                tags=["ugsci-team"],
            )
            logger.info(
                "[%s] HTTP router registered at /api/ugsci/team",
                PLUGIN_ID,
            )
            record_route_registration("/ugsci/team", success=True)
        except Exception as exc:
            record_route_registration(
                "/ugsci/team",
                success=False,
                error=f"{type(exc).__name__}: {exc}",
            )
            logger.error(
                "[%s] Failed to register team workflow HTTP router: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _initialize_engines() -> None:
        """Create default engine records when they do not yet exist."""
        try:
            from .engine import init_default_engines

            count = init_default_engines()
            if count:
                logger.info(
                    "[%s] Created %d default engine(s)",
                    PLUGIN_ID,
                    count,
                )
        except Exception as exc:
            logger.error(
                "[%s] Failed to init default engines: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _register_router(
        api,
        factory: Callable[[], Any],
        prefix: str,
        tag: str,
        label: str,
    ) -> None:
        """Register one independently recoverable HTTP capability."""
        try:
            api.register_http_router(
                factory(),
                prefix=prefix,
                tags=[tag],
            )
            logger.info(
                "[%s] HTTP router registered at /api%s",
                PLUGIN_ID,
                prefix,
            )
            record_route_registration(prefix, success=True)
        except Exception as exc:
            record_route_registration(
                prefix,
                success=False,
                error=f"{type(exc).__name__}: {exc}",
            )
            logger.error(
                "[%s] Failed to register %s HTTP router: %s",
                PLUGIN_ID,
                label,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _register_tool_group(
        api,
        group: str,
        bindings: dict[str, Callable[..., Any]],
    ) -> int:
        """Bind implementations to one manifest-declared tool group.

        Names and all display/governance metadata come from ``plugin.json``.
        A declaration/implementation mismatch fails the whole group so drift
        cannot produce tools that exist only in the runtime or only in the UI.
        """
        specs = validate_tool_bindings(
            PLUGIN_DIR,
            bindings,
            groups={group},
        )

        registered = 0
        for spec in specs:
            try:
                api.register_tool(
                    tool_name=spec.name,
                    tool_func=bindings[spec.name],
                    description=spec.description,
                    icon=spec.icon,
                    enabled=spec.enabled_by_default,
                    tool_type=spec.tool_type,
                    target_param=spec.target_param,
                )
                registered += 1
            except Exception as exc:
                logger.error(
                    "[%s] Failed to register %s tool '%s': %s",
                    PLUGIN_ID,
                    group,
                    spec.name,
                    exc,
                )
        return registered

    @classmethod
    def _register_simulation_tools(cls, api) -> None:
        """Register manifest-declared simulation tool implementations."""
        try:
            from .engine.tools import (
                analyze_simulation,
                check_simulation_status,
                edit_simulation_deck,
                launch_simulation,
                read_simulation_results,
                wait_for_simulation,
            )

            bindings = {
                "launch_simulation": launch_simulation,
                "check_simulation_status": check_simulation_status,
                "wait_for_simulation": wait_for_simulation,
                "read_simulation_results": read_simulation_results,
                "edit_simulation_deck": edit_simulation_deck,
                "analyze_simulation": analyze_simulation,
            }
            registered = cls._register_tool_group(api, "simulation", bindings)
            logger.info(
                "[%s] Simulation control tools registered (%d tools)",
                PLUGIN_ID,
                registered,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register simulation tools: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @classmethod
    def _register_domain_tools(cls, api) -> None:
        """Register manifest-declared domain computing implementations."""
        try:
            from .domain.tool_bindings import get_domain_tool_bindings

            bindings = get_domain_tool_bindings()
            registered = cls._register_tool_group(api, "domain", bindings)
            logger.info(
                "[%s] Domain computing tools registered (%d tools)",
                PLUGIN_ID,
                registered,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register domain tools: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @classmethod
    def _register_visualization_tools(cls, api) -> None:
        """Register visualization tools under the UGSci manifest."""
        try:
            bindings = get_visualization_tool_bindings()
            registered = cls._register_tool_group(api, "visualization", bindings)
            logger.info(
                "[%s] Visualization tools registered (%d tools)",
                PLUGIN_ID,
                registered,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register visualization tools: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _register_genui(api) -> None:
        """Register GenUI tools and prompt section as an isolated UGSci module."""
        try:
            from .genui.registration import register_genui
            register_genui(api, plugin_id=PLUGIN_ID)
        except Exception as exc:
            logger.error(
                "[%s] Failed to register GenUI module: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    async def _on_startup(self) -> None:
        """Warm assets and reattach durable simulation monitors."""
        logger.info("[%s] Startup hook executed", PLUGIN_ID)
        try:
            from .engine.tools.launcher import recover_persisted_jobs

            recovered = recover_persisted_jobs()
            if recovered:
                logger.info("[%s] Recovered %d simulation job(s)", PLUGIN_ID, recovered)
        except Exception:
            logger.exception("[%s] Failed to recover simulation jobs", PLUGIN_ID)
        await asyncio.to_thread(_prewarm_avatar_cache)

    async def _on_startup_sync_skills(self) -> None:
        """Synchronize bundled skills into the shared pool."""
        skills_dir = PLUGIN_DIR / "skills"
        if not skills_dir.exists():
            return
        try:
            count = await asyncio.to_thread(
                _sync_plugin_skills_to_pool,
                PLUGIN_ID,
                skills_dir,
            )
            if count:
                logger.info(
                    "[%s] Synced %d skill(s) to skill pool",
                    PLUGIN_ID,
                    count,
                )
        except Exception as exc:
            logger.error(
                "[%s] Failed to sync skills to pool: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    async def _on_startup_sync_manifest_tools(self) -> None:
        """Persist every missing manifest tool for each configured Agent.

        Plugin tool registration runs before a current-Agent context exists,
        so ``PluginApi.register_tool`` cannot persist per-Agent preferences at
        that point.  Synchronising from the plugin manifest closes that gap
        without changing any existing enabled/disabled choice.
        """
        await asyncio.to_thread(self._sync_manifest_tools_to_all_agents)

    @staticmethod
    def _sync_manifest_tools_to_all_agents() -> None:
        """Synchronize the complete declarative catalog to Agent configs."""
        try:
            changed_agents = sync_manifest_tools_to_all_agents(PLUGIN_DIR)
            logger.info(
                "[%s] Synced manifest tools to %d Agent config(s)",
                PLUGIN_ID,
                changed_agents,
            )
        except ToolManifestError as exc:
            logger.error("[%s] Cannot sync tool manifest: %s", PLUGIN_ID, exc)
        except Exception as exc:  # noqa: BLE001
            logger.error(
                "[%s] Failed to sync manifest tools: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    async def _on_startup_sync_domain_tools(self) -> None:
        """Backward-compatible alias for the old startup callback name."""
        await self._on_startup_sync_manifest_tools()

    @staticmethod
    def _sync_domain_tools_to_all_agents() -> None:
        """Backward-compatible alias for integrations using the old name."""
        UGSciPlugin._sync_manifest_tools_to_all_agents()

    @staticmethod
    def _on_uninstall_remove_skills(
        plugin_id: str,
        delete_files: bool = False,
    ) -> None:
        """Remove plugin-owned pool skills during uninstall."""
        del delete_files
        try:
            count = _remove_plugin_pool_skills(plugin_id)
            if count:
                logger.info(
                    "[%s] Removed %d skill(s) from pool",
                    plugin_id,
                    count,
                )
        except Exception as exc:
            logger.error(
                "Failed to remove pool skills for '%s': %s",
                plugin_id,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _on_uninstall_dispose_genui(
        plugin_id: str,
        delete_files: bool = False,
    ) -> None:
        """Release GenUI tools, prompt section, and snapshot store."""
        del delete_files
        try:
            from .genui.registration import dispose_genui

            dispose_genui(plugin_id=plugin_id)
        except Exception as exc:
            logger.error(
                "Failed to dispose GenUI for '%s': %s",
                plugin_id,
                exc,
                exc_info=True,
            )


plugin = UGSciPlugin()

__all__ = ["EngineRequest", "UGSciPlugin", "plugin", "build_domain_engine_router"]
