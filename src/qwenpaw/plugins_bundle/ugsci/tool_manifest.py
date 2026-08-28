# -*- coding: utf-8 -*-
"""Manifest-backed tool catalog and Agent configuration synchronization."""

from __future__ import annotations

import inspect
import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.tools")

_VALID_GROUPS = frozenset({
    "genui",
    "simulation",
    "domain",
    "visualization",
    "derivation",
    "freeform",
})
_VALID_TOOL_TYPES = frozenset({"file", "internal", "network", "shell"})


class ToolManifestError(ValueError):
    """Raised when the declarative tool catalog is malformed."""


@dataclass(frozen=True, slots=True)
class ToolManifestSpec:
    """Validated metadata for one runtime tool implementation."""

    name: str
    group: str
    description: str
    icon: str
    enabled_by_default: bool
    tool_type: str
    target_param: str


def load_tool_manifest(
    plugin_dir: Path,
    *,
    groups: Iterable[str] | None = None,
) -> tuple[ToolManifestSpec, ...]:
    """Load and validate ``meta.tools`` from the plugin manifest.

    The manifest is deliberately read live so local plugin updates and bundle
    reloads cannot retain a stale in-process copy of the tool catalog.
    """
    requested_groups = set(groups) if groups is not None else None
    if requested_groups is not None:
        unknown_groups = requested_groups - _VALID_GROUPS
        if unknown_groups:
            raise ToolManifestError(
                f"unknown tool groups: {', '.join(sorted(unknown_groups))}",
            )

    manifest_path = plugin_dir / "plugin.json"
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ToolManifestError("cannot read UGSci tool manifest") from exc

    raw_tools = manifest.get("meta", {}).get("tools")
    if not isinstance(raw_tools, list):
        raise ToolManifestError("plugin meta.tools must be a list")

    specs: list[ToolManifestSpec] = []
    seen: set[str] = set()
    for index, raw in enumerate(raw_tools):
        if not isinstance(raw, dict):
            raise ToolManifestError(f"meta.tools[{index}] must be an object")
        name = raw.get("name")
        group = raw.get("group")
        description = raw.get("description")
        icon = raw.get("icon")
        enabled = raw.get("enabled_by_default")
        tool_type = raw.get("tool_type")
        target_param = raw.get("target_param", "")
        if not isinstance(name, str) or not name:
            raise ToolManifestError(f"meta.tools[{index}].name is invalid")
        if name in seen:
            raise ToolManifestError(f"duplicate tool declaration: {name}")
        if group not in _VALID_GROUPS:
            raise ToolManifestError(f"tool '{name}' has invalid group")
        if not isinstance(description, str) or not description:
            raise ToolManifestError(f"tool '{name}' has no description")
        if not isinstance(icon, str) or not icon:
            raise ToolManifestError(f"tool '{name}' has no icon")
        if not isinstance(enabled, bool):
            raise ToolManifestError(
                f"tool '{name}' enabled_by_default must be boolean",
            )
        if tool_type not in _VALID_TOOL_TYPES:
            raise ToolManifestError(f"tool '{name}' has invalid tool_type")
        if not isinstance(target_param, str):
            raise ToolManifestError(f"tool '{name}' target_param is invalid")
        seen.add(name)
        if requested_groups is None or group in requested_groups:
            specs.append(
                ToolManifestSpec(
                    name=name,
                    group=group,
                    description=description,
                    icon=icon,
                    enabled_by_default=enabled,
                    tool_type=tool_type,
                    target_param=target_param,
                ),
            )
    return tuple(specs)


def validate_tool_bindings(
    plugin_dir: Path,
    bindings: dict[str, object],
    *,
    groups: Iterable[str] | None = None,
) -> tuple[ToolManifestSpec, ...]:
    """Validate manifest declarations against callable implementations.

    The governance layer uses ``target_param`` to locate a path-like tool
    argument.  A misspelled or stale parameter name therefore weakens the
    policy boundary while leaving registration apparently successful.  Keep
    the check next to manifest loading so every registration path gets the
    same fail-closed validation.
    """
    specs = load_tool_manifest(plugin_dir, groups=groups)
    declared = {spec.name for spec in specs}
    implemented = set(bindings)
    if declared != implemented:
        missing = sorted(declared - implemented)
        undeclared = sorted(implemented - declared)
        raise ToolManifestError(
            "tool manifest bindings mismatch; "
            f"missing implementations={missing}, "
            f"undeclared implementations={undeclared}",
        )

    for spec in specs:
        if not spec.target_param:
            continue
        func = bindings[spec.name]
        try:
            parameters = inspect.signature(func).parameters
        except (TypeError, ValueError) as exc:
            raise ToolManifestError(
                f"cannot inspect tool '{spec.name}' signature",
            ) from exc
        if spec.target_param not in parameters:
            raise ToolManifestError(
                f"tool '{spec.name}' target_param "
                f"'{spec.target_param}' is not present in its signature",
            )
    return specs


def sync_manifest_tools_to_all_agents(
    plugin_dir: Path,
    *,
    groups: Iterable[str] | None = None,
) -> int:
    """Persist missing manifest tools without overwriting user preferences."""
    from qwenpaw.config.config import (
        BuiltinToolConfig,
        ToolsConfig,
        load_agent_config,
        save_agent_config,
    )
    from qwenpaw.config.utils import load_config

    specs = load_tool_manifest(plugin_dir, groups=groups)
    changed_agents = 0
    profiles = load_config().agents.profiles
    for agent_id in profiles:
        try:
            agent_config = load_agent_config(agent_id)
            if not agent_config.tools:
                agent_config.tools = ToolsConfig()
            changed = False
            for spec in specs:
                if spec.name in agent_config.tools.builtin_tools:
                    continue
                agent_config.tools.builtin_tools[spec.name] = BuiltinToolConfig(
                    name=spec.name,
                    enabled=spec.enabled_by_default,
                    description=spec.description,
                    display_to_user=True,
                    async_execution=False,
                    icon=spec.icon,
                )
                changed = True
            if changed:
                save_agent_config(agent_id, agent_config)
                changed_agents += 1
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "Failed to sync UGSci manifest tools for Agent '%s': %s",
                agent_id,
                exc,
            )
    return changed_agents


__all__ = [
    "ToolManifestError",
    "ToolManifestSpec",
    "load_tool_manifest",
    "validate_tool_bindings",
    "sync_manifest_tools_to_all_agents",
]
