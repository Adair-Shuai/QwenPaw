# -*- coding: utf-8 -*-
"""Auto-register the bundled NeqSim MCP Server as a built-in driver.

When the QwenPaw desktop app bundles a Java runtime (``java-runtime``)
and the NeqSim MCP Server fat-jar (``neqsim-mcp-server.jar``) as Tauri
resources, the Rust backend launcher exposes their paths via the
``QWENPAW_DESKTOP_JAVA_HOME`` and ``QWENPAW_DESKTOP_NEQSIM_JAR``
environment variables.

This module is called during workspace startup (after the
``DriverManager`` is created) to register a ``neqsim`` MCP client that
launches the server as a stdio subprocess.  Registration is **idempotent**:
if a driver card with key ``neqsim`` already exists, it is left untouched
so user customisations (policy, tool whitelist, display name) are
preserved.

Outside the desktop build (no bundled JRE / JAR) this module is a no-op.
"""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

#: The driver card key under which the built-in NeqSim client is registered.
NEQSIM_CLIENT_KEY = "neqsim"

#: Marker file written next to the driver card directory to make
#: auto-registration idempotent across restarts.
_REGISTRATION_MARKER = ".neqsim-auto-registered"

#: Default display name shown in the Console MCP management UI.
_DEFAULT_DISPLAY_NAME = "NeqSim"
_DEFAULT_DESCRIPTION = (
    "Built-in thermodynamic and process simulation engine "
    "(flash, PVT, process, pipeline, phase envelope)."
)


def _bundled_java_exe() -> Optional[str]:
    """Return the path to the bundled java binary, or ``None``."""
    java_home = os.environ.get("QWENPAW_DESKTOP_JAVA_HOME", "").strip()
    if not java_home or not os.path.isdir(java_home):
        return None
    exe_name = "java.exe" if sys.platform == "win32" else "java"
    # On macOS the JRE layout is Contents/Home/bin/java inside a .jdk
    # bundle, but stage_jre.py flattens this so java lives directly
    # under <java_home>/bin/java.
    candidates = [
        Path(java_home) / "bin" / exe_name,
        Path(java_home) / "bin" / "java",
        # flattened macOS bundle fallback
        Path(java_home) / "Contents" / "Home" / "bin" / "java",
    ]
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)
    return None


def _bundled_neqsim_jar() -> Optional[str]:
    """Return the path to the bundled NeqSim MCP Server JAR, or ``None``."""
    jar_path = os.environ.get("QWENPAW_DESKTOP_NEQSIM_JAR", "").strip()
    if jar_path and os.path.isfile(jar_path):
        return jar_path
    # Fallback: resolve relative to the resource dir.
    resource_dir = os.environ.get("QWENPAW_TAURI_RESOURCE_DIR", "").strip()
    if resource_dir:
        candidate = (
            Path(resource_dir)
            / "binaries"
            / "neqsim"
            / "neqsim-mcp-server.jar"
        )
        if candidate.is_file():
            return str(candidate)
    return None


def _is_neqsim_available() -> bool:
    """True when both the bundled JRE and JAR are present."""
    return (
        _bundled_java_exe() is not None and _bundled_neqsim_jar() is not None
    )


def _build_endpoint() -> dict[str, Any]:
    """Build the DriverCard endpoint dict for the NeqSim MCP client."""
    java_exe = _bundled_java_exe()
    jar_path = _bundled_neqsim_jar()
    # mypy: _is_neqsim_available() already checked these, but the type
    # checker can't narrow across function boundaries.
    assert java_exe is not None
    assert jar_path is not None
    return {
        "transport": "stdio",
        "command": java_exe,
        "args": [
            "-Dquarkus.profile=stdio",
            "-Dquarkus.log.level=WARN",
            "-jar",
            jar_path,
        ],
        "env": {},
    }


async def ensure_neqsim_driver_registered(
    workspace: Any,
    driver_manager: Any,
) -> None:
    """Register the bundled NeqSim MCP client if not already present.

    Called from ``create_driver_service`` after the ``DriverManager`` is
    created and started.  Safe to call on every workspace start: the
    marker file prevents duplicate registration.

    Args:
        workspace: The :class:`Workspace` instance (for path resolution).
        driver_manager: The ``DriverManager`` instance.
    """
    if not _is_neqsim_available():
        logger.debug(
            "NeqSim MCP Server not bundled (JRE or JAR missing); "
            "skipping auto-registration",
        )
        return

    drivers_dir = workspace.workspace_dir / "drivers"
    marker = drivers_dir / _REGISTRATION_MARKER

    # If the marker exists, the driver card was created in a previous
    # session.  Do not overwrite it — the user may have customised the
    # policy, display name, or tool whitelist through the Console.
    if marker.is_file():
        # But verify the card still exists.  If the user deleted it
        # through the UI, fall through and re-register.
        stored_path = await driver_manager.card_store.stored_path(
            NEQSIM_CLIENT_KEY,
        )
        if stored_path is not None:
            logger.debug(
                "NeqSim driver already registered (marker present); "
                "skipping",
            )
            return
        # Card was deleted but marker lingered — remove and re-register.
        marker.unlink(missing_ok=True)

    from ...drivers.contracts import DriverCard, DriverPolicy
    from ...drivers.constants import POLICY_EFFECT_ASK, PROTOCOL_MCP

    card = DriverCard(
        name=NEQSIM_CLIENT_KEY,
        protocol=PROTOCOL_MCP,
        endpoint=_build_endpoint(),
        config={
            "display_name": _DEFAULT_DISPLAY_NAME,
            "description": _DEFAULT_DESCRIPTION,
            "tools": None,  # load all tools
            "builtin": True,  # mark as a built-in driver
        },
        enabled=True,
        policy=DriverPolicy(default_effect=POLICY_EFFECT_ASK, rules=[]),
    )

    try:
        # register_driver persists the card AND builds the MCP handler
        # (starts the Java subprocess).  If the handler fails to start
        # the card is still persisted, so build_drivers() retries on
        # the next workspace restart.
        await driver_manager.register_driver(card)
        drivers_dir.mkdir(parents=True, exist_ok=True)
        marker.write_text("1", encoding="utf-8")
        logger.info(
            "Registered built-in NeqSim MCP driver for agent %s",
            workspace.agent_id,
        )
    except Exception:
        logger.warning(
            "Failed to register built-in NeqSim MCP driver",
            exc_info=True,
        )
