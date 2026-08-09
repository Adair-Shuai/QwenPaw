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
from .engine.api import EngineRequest, build_engine_router
from .sim_api import build_sim_router
from .genui.api import build_genui_router
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


def _build_domain_engine_router():
    """Build the domain engine catalog router."""
    return build_domain_engine_router()


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
        self._register_simulation_tools(api)
        self._register_domain_tools(api)
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
                hook_name="ugsci_sync_domain_tools",
                callback=self._on_startup_sync_domain_tools,
                priority=95,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Domain tool sync hook unavailable: %s",
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

            # Each tool declares its governance type and target parameter
            # so the Tool Guard policy engine can perform proper Phase 0 / 1
            # checks on the actual file or process targets (BUG-001).
            tools = [
                (
                    "launch_simulation",
                    launch_simulation,
                    "启动数值模拟 (Eclipse/CMG/COMSOL)",
                    "🚀",
                    "shell",
                    "working_dir",
                ),
                (
                    "check_simulation_status",
                    check_simulation_status,
                    "查询模拟运行状态与收敛性",
                    "📊",
                    "internal",
                    "",
                ),
                (
                    "wait_for_simulation",
                    wait_for_simulation,
                    "等待模拟完成 (内部轮询，零token消耗)",
                    "⏳",
                    "internal",
                    "",
                ),
                (
                    "read_simulation_results",
                    read_simulation_results,
                    "读取模拟结果数据",
                    "📖",
                    "file",
                    "result_file",
                ),
                (
                    "edit_simulation_deck",
                    edit_simulation_deck,
                    "修改模拟器输入文件",
                    "✏️",
                    "file",
                    "deck_file",
                ),
                (
                    "analyze_simulation",
                    analyze_simulation,
                    "分析模拟结果 (收敛/平衡/性能/对比)",
                    "🔬",
                    "file",
                    "result_file",
                ),
            ]
            for tool_name, tool_func, description, icon, tool_type, target_param in tools:
                try:
                    api.register_tool(
                        tool_name=tool_name,
                        tool_func=tool_func,
                        description=description,
                        icon=icon,
                        enabled=True,
                        tool_type=tool_type,
                        target_param=target_param,
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

    @staticmethod
    def _register_domain_tools(api) -> None:
        """Register domain computing tools (well log + decline analysis).

        These tools are disabled by default — users enable them per-agent
        via the Tools page.  Each tool is registered independently so that
        a failure in one does not block others.
        """
        try:
            from .domain.well_log.tools import (
                ugsci_welllog_read,
                ugsci_welllog_validate,
                ugsci_welllog_export,
            )
            from .domain.decline.tools import (
                ugsci_decline_fit,
                ugsci_decline_forecast,
                ugsci_decline_eur,
            )
            from .domain.computation.tools import (
                ugsci_bayesian_normal_estimate,
                ugsci_geospatial_points_analyze,
                ugsci_graph_analyze,
                ugsci_ml_regression,
                ugsci_multiobjective_quadratic,
                ugsci_queue_simulate,
                ugsci_statistical_regression,
                ugsci_symbolic_polynomial_roots,
            )

            tools = [
                (
                    "ugsci_welllog_read",
                    ugsci_welllog_read,
                    "读取 LAS 测井文件并返回井信息、曲线摘要和采样数据",
                    "📡",
                    "file",
                    "path",
                ),
                (
                    "ugsci_welllog_validate",
                    ugsci_welllog_validate,
                    "校验 LAS 测井文件的数据质量（深度单调性、NULL、单位等）",
                    "✅",
                    "file",
                    "path",
                ),
                (
                    "ugsci_welllog_export",
                    ugsci_welllog_export,
                    "将 LAS 测井文件规范化导出为新文件",
                    "📤",
                    "file",
                    "output_path",
                ),
                (
                    "ugsci_decline_fit",
                    ugsci_decline_fit,
                    "拟合 Arps 递减曲线（exponential/harmonic/hyperbolic/auto）",
                    "📉",
                    "internal",
                    "",
                ),
                (
                    "ugsci_decline_forecast",
                    ugsci_decline_forecast,
                    "基于递减参数预测未来产量",
                    "🔮",
                    "internal",
                    "",
                ),
                (
                    "ugsci_decline_eur",
                    ugsci_decline_eur,
                    "计算预计最终采收率（EUR）",
                    "🛢️",
                    "internal",
                    "",
                ),
                ("ugsci_symbolic_polynomial_roots", ugsci_symbolic_polynomial_roots, "计算多项式的全部实根与复根", "🧮", "internal", ""),
                ("ugsci_bayesian_normal_estimate", ugsci_bayesian_normal_estimate, "使用 PyMC 估计正态总体均值的后验分布", "🎲", "internal", ""),
                ("ugsci_multiobjective_quadratic", ugsci_multiobjective_quadratic, "使用 pymoo 求解结构化双目标或多目标二次优化", "🎯", "internal", ""),
                ("ugsci_queue_simulate", ugsci_queue_simulate, "使用 SimPy 执行确定性 FIFO 队列仿真", "⏱️", "internal", ""),
                ("ugsci_graph_analyze", ugsci_graph_analyze, "使用 NetworkX 分析网络连通性、中心性和最短路径", "🕸️", "internal", ""),
                ("ugsci_geospatial_points_analyze", ugsci_geospatial_points_analyze, "使用 GeoPandas 分析结构化空间点集", "🗺️", "internal", ""),
                ("ugsci_ml_regression", ugsci_ml_regression, "使用 scikit-learn 进行确定性线性回归和预测", "🤖", "internal", ""),
                ("ugsci_statistical_regression", ugsci_statistical_regression, "使用 statsmodels 执行带推断统计的 OLS 回归", "📊", "internal", ""),
            ]
            for tool_name, tool_func, description, icon, tool_type, target_param in tools:
                try:
                    api.register_tool(
                        tool_name=tool_name,
                        tool_func=tool_func,
                        description=description,
                        icon=icon,
                        enabled=False,
                        tool_type=tool_type,
                        target_param=target_param,
                    )
                except Exception as exc:
                    logger.error(
                        "[%s] Failed to register domain tool '%s': %s",
                        PLUGIN_ID,
                        tool_name,
                        exc,
                    )
            logger.info(
                "[%s] Domain computing tools registered (%d tools)",
                PLUGIN_ID,
                len(tools),
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register domain tools: %s",
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
        """Finish avatar warming before the desktop enters the workspace."""
        logger.info("[%s] Startup hook executed", PLUGIN_ID)
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

    async def _on_startup_sync_domain_tools(self) -> None:
        """Persist missing UGSci tool entries for every configured Agent.

        Plugin tool registration runs before a current-Agent context exists,
        so ``PluginApi.register_tool`` cannot persist per-Agent preferences at
        that point.  Synchronising from the plugin manifest closes that gap
        without changing any existing enabled/disabled choice.
        """
        await asyncio.to_thread(self._sync_domain_tools_to_all_agents)

    @staticmethod
    def _sync_domain_tools_to_all_agents() -> None:
        from qwenpaw.config.config import (
            BuiltinToolConfig,
            ToolsConfig,
            load_agent_config,
            save_agent_config,
        )
        from qwenpaw.config.utils import load_config

        manifest_path = PLUGIN_DIR / "plugin.json"
        try:
            import json

            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            raw_tools = manifest.get("meta", {}).get("tools", [])
        except (OSError, ValueError, TypeError) as exc:
            logger.error("[%s] Cannot read domain tool manifest: %s", PLUGIN_ID, exc)
            return

        specs = {
            item["name"]: item
            for item in raw_tools
            if isinstance(item, dict)
            and isinstance(item.get("name"), str)
            and item["name"].startswith("ugsci_")
        }
        if not specs:
            return

        profiles = load_config().agents.profiles
        for agent_id in profiles:
            try:
                agent_config = load_agent_config(agent_id)
                if not agent_config.tools:
                    agent_config.tools = ToolsConfig()
                changed = False
                for name, spec in specs.items():
                    if name in agent_config.tools.builtin_tools:
                        continue
                    agent_config.tools.builtin_tools[name] = BuiltinToolConfig(
                        name=name,
                        enabled=bool(spec.get("enabled_by_default", False)),
                        description=str(spec.get("description", "")),
                        display_to_user=True,
                        async_execution=False,
                        icon=str(spec.get("icon", "🔧")),
                    )
                    changed = True
                if changed:
                    save_agent_config(agent_id, agent_config)
            except Exception as exc:  # noqa: BLE001
                logger.warning(
                    "[%s] Failed to sync domain tools for Agent '%s': %s",
                    PLUGIN_ID,
                    agent_id,
                    exc,
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

__all__ = ["EngineRequest", "UGSciPlugin", "plugin", "build_domain_engine_router"]
