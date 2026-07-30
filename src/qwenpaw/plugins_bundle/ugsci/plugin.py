# -*- coding: utf-8 -*-
"""UGSci plugin entry point.

The entry module deliberately contains registration orchestration only.
HTTP APIs, avatar processing, simulation monitoring, and skill-pool
lifecycle logic live in dedicated modules and are imported here through
compatibility aliases.
"""

from __future__ import annotations

import logging
import threading
from pathlib import Path
from typing import Any, Callable

from .avatar import (
    BACKGROUND_COLOR as _BG_COLOR,
    CANVAS_SIZE as _CANVAS_SIZE,
    AvatarService,
)
from .engine.api import EngineRequest, build_engine_router
from .sim_api import build_sim_router
from .skill_pool import (
    remove_plugin_pool_skills,
    sync_plugin_skills_to_pool,
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


def _build_sim_router():
    """Compatibility wrapper for the extracted simulation API."""
    return build_sim_router(PLUGIN_ID)


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
        self._register_simulation_tools(api)

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
            api.register_startup_hook(
                hook_name="ugsci_init",
                callback=self._on_startup,
                priority=50,
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
        except Exception as exc:
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
        except Exception as exc:
            logger.error(
                "[%s] Failed to register %s HTTP router: %s",
                PLUGIN_ID,
                label,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _register_simulation_tools(api) -> None:
        """Register simulation tools without coupling them to HTTP routers."""
        try:
            from .engine.tools import (
                analyze_simulation,
                check_simulation_status,
                edit_simulation_deck,
                launch_simulation,
                read_simulation_results,
                wait_for_simulation,
            )

            tools = [
                (
                    "launch_simulation",
                    launch_simulation,
                    "启动数值模拟 (Eclipse/CMG/COMSOL)",
                    "🚀",
                ),
                (
                    "check_simulation_status",
                    check_simulation_status,
                    "查询模拟运行状态与收敛性",
                    "📊",
                ),
                (
                    "wait_for_simulation",
                    wait_for_simulation,
                    "等待模拟完成 (内部轮询，零token消耗)",
                    "⏳",
                ),
                (
                    "read_simulation_results",
                    read_simulation_results,
                    "读取模拟结果数据",
                    "📖",
                ),
                (
                    "edit_simulation_deck",
                    edit_simulation_deck,
                    "修改模拟器输入文件",
                    "✏️",
                ),
                (
                    "analyze_simulation",
                    analyze_simulation,
                    "分析模拟结果 (收敛/平衡/性能/对比)",
                    "🔬",
                ),
            ]
            for tool_name, tool_func, description, icon in tools:
                try:
                    api.register_tool(
                        tool_name=tool_name,
                        tool_func=tool_func,
                        description=description,
                        icon=icon,
                        enabled=True,
                    )
                except Exception as exc:
                    logger.error(
                        "[%s] Failed to register tool '%s': %s",
                        PLUGIN_ID,
                        tool_name,
                        exc,
                    )
            logger.info(
                "[%s] Simulation control tools registered (%d tools)",
                PLUGIN_ID,
                len(tools),
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register simulation tools: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    async def _on_startup(self) -> None:
        """Start non-blocking avatar cache warming."""
        logger.info("[%s] Startup hook executed", PLUGIN_ID)
        threading.Thread(
            target=_prewarm_avatar_cache,
            name="ugsci-avatar-prewarm",
            daemon=True,
        ).start()

    async def _on_startup_sync_skills(self) -> None:
        """Synchronize bundled skills into the shared pool."""
        skills_dir = PLUGIN_DIR / "skills"
        if not skills_dir.exists():
            return
        try:
            count = _sync_plugin_skills_to_pool(PLUGIN_ID, skills_dir)
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


plugin = UGSciPlugin()

__all__ = ["EngineRequest", "UGSciPlugin", "plugin"]
