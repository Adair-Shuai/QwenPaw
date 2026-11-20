# -*- coding: utf-8 -*-
"""Prepare an unpublished workspace, then register only a verified expert."""

from pathlib import Path
import json

from .models import Release
from .runtime import launch


def installed_receipt(workspace: Path, release: Release, agent_id: str):
    from ..config.utils import load_config

    profile = load_config().agents.profiles.get(agent_id)
    if profile is None:
        return None
    if Path(profile.workspace_dir).resolve() != workspace.resolve():
        raise ValueError("Expert instance identity is already in use")
    marker = json.loads(
        (workspace / "expert-package.json").read_text(encoding="utf-8"),
    )
    if (
        marker.get("artifact") != release.artifact.sha256
        or "verification" not in marker
    ):
        raise ValueError("Expert registration receipt does not match")
    return marker["verification"]


def prepare(workspace: Path, package: Path, release: Release):
    from ..agents.skill_system.workspace_service import SkillService
    from ..app.routers.agents import _initialize_agent_workspace
    from ..utils.io_utils import write_json_atomic

    marker = workspace / "expert-package.json"
    if marker.exists():
        previous = json.loads(marker.read_text(encoding="utf-8"))
        if "verification" in previous:
            if previous.get("artifact") != release.artifact.sha256:
                raise ValueError("Workspace belongs to another expert release")
            # Re-registration after deletion must retain all user
            # customization.
            return
    if not marker.exists():
        workspace.mkdir(parents=True, exist_ok=True)
        # Curated experts already have an identity and operating instructions.
        # Generic templates include BOOTSTRAP.md and trigger identity
        # questions.
        _initialize_agent_workspace(
            workspace,
            skill_names=[],
            language="zh",
            apply_md_templates=False,
        )
        write_json_atomic(
            marker,
            {"package": release.id, "version": release.version},
        )
    (workspace / "AGENTS.md").write_text(
        (package / release.instructions).read_text(encoding="utf-8"),
        encoding="utf-8",
    )
    service = SkillService(workspace)
    for skill in release.skills:
        name = Path(skill).name
        target = workspace / "skills" / name
        if target.exists():
            for source in (package / skill).rglob("*"):
                if source.is_file():
                    installed = target / source.relative_to(package / skill)
                    if (
                        not installed.is_file()
                        or installed.read_bytes() != source.read_bytes()
                    ):
                        raise ValueError("暂存技能已改变，不能覆盖")
            outcome = service.enable_skill(name)
        else:
            outcome = service.install_skill_directory(
                package / skill,
                target_name=name,
                enable=True,
                installed_from=f"ugsci-expert:{release.id}@{release.version}",
            )
        if not outcome.get("success"):
            raise ValueError(f"必需技能安装失败: {name}")


async def bind(
    workspace: Path,
    package: Path,
    environment: Path,
    release: Release,
    agent_id: str,
    receipt: dict,
):
    from ..config.config import AgentProfileConfig, AgentProfileRef
    from ..config.utils import load_config
    from ..app.routers.agents import _persist_created_agent
    from ..drivers.adapters.mcp_console import build_mcp_driver_card
    from ..drivers.storage import AsyncDriverCardStore
    from ..utils.io_utils import write_json_atomic

    profiles = load_config().agents.profiles
    if agent_id in profiles:
        if (
            Path(profiles[agent_id].workspace_dir).resolve()
            != workspace.resolve()
        ):
            raise ValueError("Expert instance identity is already in use")
        return
    executable, args = launch(package, environment, workspace, release)
    card = build_mcp_driver_card(
        "expert-methods",
        {
            "name": release.name + "方法库",
            "enabled": True,
            "transport": "stdio",
            "command": executable,
            "args": args,
            "cwd": str(package),
            "env": {},
            "tools": release.mcp.tools,
        },
        "",
    )
    store = AsyncDriverCardStore(workspace / "drivers")
    if store.path_for("expert-methods", protocol="mcp").exists():
        previous = await store.load("expert-methods", protocol="mcp")
        selected = previous.config.get("tools")
        previous.config["tools"] = [
            t
            for t in release.mcp.tools
            if not isinstance(selected, list) or t in selected
        ]
        card = previous
    await store.save(card)
    write_json_atomic(
        workspace / "expert-package.json",
        {
            "package": release.id,
            "version": release.version,
            "artifact": release.artifact.sha256,
            "verification": receipt,
            "optional_setup": release.optional_setup,
        },
    )
    config = AgentProfileConfig(
        id=agent_id,
        name=release.name,
        description=release.description,
        workspace_dir=str(workspace),
        language="zh",
    )
    saved_config = workspace / "agent.json"
    if saved_config.is_file():
        config = AgentProfileConfig.model_validate_json(
            saved_config.read_text(encoding="utf-8"),
        )
        config.id = agent_id
        config.workspace_dir = str(workspace)
    _persist_created_agent(
        agent_id,
        AgentProfileRef(
            id=agent_id,
            workspace_dir=str(workspace),
            enabled=True,
        ),
        config,
    )
