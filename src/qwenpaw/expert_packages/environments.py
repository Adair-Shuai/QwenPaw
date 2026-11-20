# -*- coding: utf-8 -*-
"""Resolve the environment selected by the atomically persisted MCP card."""

import re
from pathlib import Path

from ..components.update import _is_link_like
from ..drivers.storage import card_path, load_card
from .runtime import python_path


def active_environment(folder: Path) -> Path:
    card = card_path(folder / "workspace/drivers", "expert-methods", "mcp")
    if not card.exists():
        return folder / "environment"
    command = Path(load_card(card).endpoint.get("command", ""))
    environment = command.parent.parent
    if (
        environment.parent.resolve() != folder.resolve()
        or not re.fullmatch(r"environment|env-[0-9a-f]{12}", environment.name)
        or command != python_path(environment)
        or _is_link_like(environment)
    ):
        raise ValueError(
            "方法服务使用了自定义运行路径，不能自动替换，请检查专家配置",
        )
    return environment


def identity_file(folder: Path, environment: Path) -> Path:
    if environment.name == "environment":
        return folder / "environment.json"
    return environment / ".expert-runtime.json"
