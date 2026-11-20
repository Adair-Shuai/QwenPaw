# -*- coding: utf-8 -*-
"""Check the installed expert through the host's actual runtime boundary."""

import asyncio
import json
from pathlib import Path

from ..utils.io_utils import run_sync_io


class ReadinessError(ValueError):
    (
        "Stable diagnosis with an app-owned recovery action, never a remote "
        "URL."
    )

    def __init__(self, code: str, message: str, action: str, items=()):
        super().__init__(message)
        self.problem = {"code": code, "action": action, "items": sorted(items)}


def check_configuration(agent_id: str):
    from ..config.config import load_agent_config
    from ..config.utils import load_config
    from ..providers import ProviderManager
    from ..agents.skill_system.workspace_service import SkillService
    from .models import Release

    profile = load_config().agents.profiles.get(agent_id)
    if profile is None or not profile.enabled:
        raise ReadinessError(
            "agent_disabled",
            "专家未启用，请在专家中心启用后重试启动",
            "experts",
        )
    config = load_agent_config(agent_id)
    # This is a configuration check, not a paid model/network probe. Request-
    # specific model selection can still override this default during chat.
    selected = (
        config.active_model or ProviderManager.get_instance().active_model
    )
    if not selected or not selected.provider_id or not selected.model:
        raise ReadinessError(
            "model_required",
            "请先在模型设置中选择默认对话模型，或为此专家选择模型，再重试启动",
            "models",
        )
    workspace = Path(profile.workspace_dir)
    plan = json.loads(
        (workspace.parent / "plan.json").read_text(encoding="utf-8"),
    )
    # The install service has verified this exact signed plan before calling
    # us.
    release = Release.model_validate_json(plan["raw"])
    available = {
        s.name for s in SkillService(workspace).list_available_skills()
    }
    missing = {Path(s).name for s in release.skills} - available
    if missing:
        raise ReadinessError(
            "skills_required",
            "必需技能未启用或缺失，请在技能中心检查：" + "、".join(sorted(missing)),
            "skills",
            missing,
        )
    return release.mcp.tools


async def verify_runtime(manager, agent_id: str, tools: list[str]):
    # Startup is managed centrally and may be shared by another request.
    if not await asyncio.shield(manager.schedule_agent_startup(agent_id)):
        raise ReadinessError(
            "startup_failed",
            "专家启动失败，请在专家中心查看启动诊断后重试",
            "experts",
        )
    workspace = await manager.get_agent(agent_id)
    drivers = workspace.driver_manager
    if drivers is None:
        raise ReadinessError(
            "service_unavailable",
            "专家方法服务尚未加载，请在能力中心检查后重试启动",
            "tools",
        )
    from ..drivers.errors import DriverNotFoundError

    try:
        capabilities = await drivers.list_driver_capabilities("expert-methods")
    except DriverNotFoundError as exc:
        raise ReadinessError(
            "service_unavailable",
            "专家方法服务未加载或已停用，请在能力中心检查后重试启动",
            "tools",
        ) from exc
    enabled = {item.name for item in capabilities if item.enabled}
    if enabled != set(tools):
        raise ReadinessError(
            "tools_required",
            "专家方法工具缺失或已停用，请在能力中心检查后重试启动",
            "tools",
            set(tools) - enabled,
        )
    return True


async def start_expert(manager, agent_id: str):
    tools = await run_sync_io(check_configuration, agent_id)
    return await verify_runtime(manager, agent_id, tools)
