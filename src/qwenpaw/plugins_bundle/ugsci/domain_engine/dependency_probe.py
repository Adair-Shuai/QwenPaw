# -*- coding: utf-8 -*-
"""Dependency probe — read-only checks for domain engine dependencies.

Probes never install packages, never download anything, and never
import heavy modules (SimPEG, etc.) at probe time.  They use
``importlib.util.find_spec`` for Python packages and filesystem checks
for external runtimes.
"""

from __future__ import annotations

import importlib.util
import os
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from .models import DomainEngineDefinition

ProbeStatus = Literal["available", "unavailable", "unknown"]


@dataclass
class DependencyProbeResult:
    """Result of probing a single dependency."""

    name: str
    status: ProbeStatus
    reason: str = ""


@dataclass
class EngineProbeResult:
    """Aggregated probe result for an engine."""

    engine_id: str
    overall: ProbeStatus
    dependencies: list[DependencyProbeResult]


def probe_python_package(name: str) -> DependencyProbeResult:
    """Check if a Python package is importable."""
    # Map common package names to import names
    import_name = name.replace("-", "_")
    try:
        spec = importlib.util.find_spec(import_name)
        if spec is not None:
            return DependencyProbeResult(name=name, status="available")
    except (ImportError, ValueError):
        pass
    # Try original name
    try:
        spec = importlib.util.find_spec(name)
        if spec is not None:
            return DependencyProbeResult(name=name, status="available")
    except (ImportError, ValueError):
        pass
    return DependencyProbeResult(
        name=name,
        status="unavailable",
        reason=f"Package '{name}' not found",
    )


def probe_java_runtime() -> DependencyProbeResult:
    """Check if a Java runtime is available.

    On Windows, ``shutil.which`` automatically appends ``.exe`` when
    searching PATHEXT, so ``shutil.which("java")`` finds ``java.exe``.
    The JAVA_HOME fallback explicitly checks for the platform-correct
    executable name.
    """
    java_path = shutil.which("java")
    if java_path:
        return DependencyProbeResult(name="java-runtime", status="available")
    desktop_java_home = os.environ.get("QWENPAW_DESKTOP_JAVA_HOME", "")
    if desktop_java_home:
        exe_name = "java.exe" if os.name == "nt" else "java"
        candidates = (
            Path(desktop_java_home) / "bin" / exe_name,
            Path(desktop_java_home) / "Contents" / "Home" / "bin" / exe_name,
        )
        if any(candidate.is_file() for candidate in candidates):
            return DependencyProbeResult(name="java-runtime", status="available")
    # Check common JAVA_HOME
    java_home = os.environ.get("JAVA_HOME", "")
    if java_home:
        # On Windows the executable is java.exe; on POSIX it's java
        exe_name = "java.exe" if os.name == "nt" else "java"
        java_exe = Path(java_home) / "bin" / exe_name
        if java_exe.exists():
            return DependencyProbeResult(name="java-runtime", status="available")
    return DependencyProbeResult(
        name="java-runtime",
        status="unavailable",
        reason="java executable not found in PATH or JAVA_HOME",
    )


def probe_neqsim_mcp_server() -> DependencyProbeResult:
    """Check if NeqSim MCP server environment is configured.

    This is a lightweight check — it only verifies that the necessary
    environment variables exist, not that the server is running.
    """
    # Match the bundled Driver's desktop environment contract first.
    desktop_jar = os.environ.get("QWENPAW_DESKTOP_NEQSIM_JAR", "").strip()
    if desktop_jar and Path(desktop_jar).is_file():
        return DependencyProbeResult(name="neqsim-mcp-server", status="available")
    resource_dir = os.environ.get("QWENPAW_TAURI_RESOURCE_DIR", "").strip()
    if resource_dir:
        bundled_jar = (
            Path(resource_dir)
            / "binaries"
            / "neqsim"
            / "neqsim-mcp-server.jar"
        )
        if bundled_jar.is_file():
            return DependencyProbeResult(name="neqsim-mcp-server", status="available")

    # Preserve support for externally managed NeqSim installations.
    neqsim_home = os.environ.get("NEQSIM_HOME", "")
    if neqsim_home and Path(neqsim_home).exists():
        return DependencyProbeResult(name="neqsim-mcp-server", status="available")
    # Check for JAR path
    neqsim_jar = os.environ.get("NEQSIM_JAR", "")
    if neqsim_jar and Path(neqsim_jar).exists():
        return DependencyProbeResult(name="neqsim-mcp-server", status="available")
    # The MCP server might be configured via QwenPaw Driver even without env vars
    return DependencyProbeResult(
        name="neqsim-mcp-server",
        status="unknown",
        reason="NeqSim environment not detected; check MCP Driver configuration",
    )


def probe_dependency(name: str) -> DependencyProbeResult:
    """Probe a single dependency by name."""
    python_packages = {
        "numpy": "numpy",
        "scipy": "scipy",
        "lasio": "lasio",
        "welly": "welly",
        "pandas": "pandas",
        "matplotlib": "matplotlib",
        "sympy": "sympy",
        "pymc": "pymc",
        "pymoo": "pymoo",
        "simpy": "simpy",
        "networkx": "networkx",
        "geopandas": "geopandas",
        "scikit-learn": "sklearn",
        "statsmodels": "statsmodels",
    }
    if name in python_packages:
        result = probe_python_package(python_packages[name])
        result.name = name
        return result
    if name == "java-runtime":
        return probe_java_runtime()
    if name == "neqsim-mcp-server":
        return probe_neqsim_mcp_server()
    # Unknown dependency
    return DependencyProbeResult(name=name, status="unknown", reason="Unknown dependency type")


def probe_engine(engine: DomainEngineDefinition) -> EngineProbeResult:
    """Probe all dependencies for an engine."""
    dep_results = [probe_dependency(d) for d in engine.dependencies]

    # Determine overall status
    if not dep_results:
        overall: ProbeStatus = "available"
    elif all(r.status == "available" for r in dep_results):
        overall = "available"
    elif any(r.status == "unknown" for r in dep_results):
        overall = "unknown"
    else:
        overall = "unavailable"

    return EngineProbeResult(
        engine_id=engine.id,
        overall=overall,
        dependencies=dep_results,
    )


def probe_engine_by_id(engine_id: str) -> EngineProbeResult | None:
    """Probe an engine by ID.  Returns None if engine not found."""
    from .catalog import get_engine
    engine = get_engine(engine_id)
    if engine is None:
        return None
    return probe_engine(engine)
