# -*- coding: utf-8 -*-
"""Persist and activate the built-in NeqSim MCP Driver for every workspace."""

from __future__ import annotations

import logging
from dataclasses import replace
from typing import Any

from .neqsim_runtime import build_endpoint, discover_runtime

logger = logging.getLogger(__name__)

NEQSIM_CLIENT_KEY = "ugsci-neqsim"
LEGACY_NEQSIM_CLIENT_KEY = "neqsim"
_DEFAULT_DISPLAY_NAME = "UGSci NeqSim"
_DEFAULT_DESCRIPTION = (
    "QwenPaw built-in thermodynamic and process simulation capability "
    "(flash, PVT, process, pipeline, phase envelope)."
)


def _builtin_config(
    status: Any,
    previous: dict[str, Any] | None = None,
) -> dict[str, Any]:
    config = dict(previous or {})
    if (
        not config.get("display_name")
        or config.get("display_name") == "NeqSim"
    ):
        config["display_name"] = _DEFAULT_DISPLAY_NAME
    config.setdefault("description", _DEFAULT_DESCRIPTION)
    config.setdefault("tools", None)
    config.update(
        {
            "builtin": True,
            "installable": True,
            "builtin_namespace": "ugsci",
            "runtime_status": status.state,
            "runtime_missing": list(status.missing),
            "runtime_source": {
                "java": status.java_source,
                "jar": status.jar_source,
            },
        },
    )
    return config


async def _load_card(driver_manager: Any, name: str) -> Any | None:
    stored_path = await driver_manager.card_store.stored_path(name)
    if stored_path is None:
        return None
    return await driver_manager.card_store.load_path(stored_path)


async def ensure_neqsim_driver_registered(
    workspace: Any,
    driver_manager: Any,
) -> None:
    """Ensure the built-in Driver card exists before runtime installation.

    User-created cards named ``neqsim`` remain untouched. A prior built-in
    card under that legacy key is migrated once into the ``ugsci-neqsim``
    namespace. Runtime loss temporarily disables the built-in card, while
    runtime recovery never overwrites a user's explicit enabled choice.
    """
    from ...drivers.constants import POLICY_EFFECT_ASK, PROTOCOL_MCP
    from ...drivers.contracts import DriverCard, DriverPolicy

    status = discover_runtime()
    existing = await _load_card(driver_manager, NEQSIM_CLIENT_KEY)
    legacy = await _load_card(driver_manager, LEGACY_NEQSIM_CLIENT_KEY)
    if existing is not None and not bool(existing.config.get("builtin")):
        logger.info(
            "Preserving user-managed %s Driver card",
            NEQSIM_CLIENT_KEY,
        )
        return
    if (
        existing is None
        and legacy is not None
        and not bool(legacy.config.get("builtin"))
    ):
        logger.info(
            "Preserving user-managed legacy NeqSim Driver card alongside %s",
            NEQSIM_CLIENT_KEY,
        )

    legacy_builtin_to_remove = legacy is not None and bool(
        legacy.config.get("builtin"),
    )
    migrating_legacy = existing is None and legacy_builtin_to_remove
    if migrating_legacy and legacy is not None:
        existing = replace(legacy, name=NEQSIM_CLIENT_KEY)

    if existing is None:
        config = _builtin_config(status)
        config["auto_disabled"] = not status.ready
        config["user_enabled"] = True
        card = DriverCard(
            name=NEQSIM_CLIENT_KEY,
            protocol=PROTOCOL_MCP,
            endpoint=build_endpoint(status),
            config=config,
            enabled=status.ready,
            policy=DriverPolicy(default_effect=POLICY_EFFECT_ASK, rules=[]),
        )
    else:
        previous_config = dict(existing.config)
        was_auto_disabled = bool(previous_config.get("auto_disabled"))
        config = _builtin_config(status, previous_config)
        if status.ready:
            enabled = (
                bool(previous_config.get("user_enabled", True))
                if was_auto_disabled
                else bool(existing.enabled)
            )
            config["user_enabled"] = enabled
            config["auto_disabled"] = False
        else:
            if not was_auto_disabled:
                config["user_enabled"] = bool(existing.enabled)
            else:
                config.setdefault("user_enabled", True)
            config["auto_disabled"] = True
            enabled = False
        card = replace(
            existing,
            endpoint=build_endpoint(status),
            config=config,
            enabled=enabled,
        )

    try:
        await driver_manager.register_driver(card)
        if legacy_builtin_to_remove:
            await driver_manager.delete_driver(LEGACY_NEQSIM_CLIENT_KEY)
        logger.info(
            "NeqSim built-in Driver %s registered for %s (runtime=%s)",
            NEQSIM_CLIENT_KEY,
            workspace.agent_id,
            status.state,
        )
    except Exception:
        logger.warning(
            "Failed to register built-in NeqSim Driver",
            exc_info=True,
        )


__all__ = [
    "LEGACY_NEQSIM_CLIENT_KEY",
    "NEQSIM_CLIENT_KEY",
    "ensure_neqsim_driver_registered",
]
