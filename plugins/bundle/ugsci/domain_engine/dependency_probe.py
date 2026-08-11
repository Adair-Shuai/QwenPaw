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
    install_hint: str = ""
    enable_hint: str = ""


@dataclass
class EngineProbeResult:
    """Aggregated probe result for an engine."""

    engine_id: str
    overall: ProbeStatus
    dependencies: list[DependencyProbeResult]


_PYTHON_PACKAGE_IMPORTS = {
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
    "pytoolbox": "pytoolbox",
}


def _guidance(name: str) -> tuple[str, str]:
    if name in _PYTHON_PACKAGE_IMPORTS:
        return (
            f"在 QwenPaw 使用的 Python 环境中运行：python -m pip install {name}",
            "安装后重启 QwenPaw，或点击刷新重新检测依赖。",
        )
    if name == "java-runtime":
        return (
            "安装 JRE 21 或更高版本，并确保 java 命令可用。",
            "重启 QwenPaw 后重新检测 Java 运行时。",
        )
    if name == "neqsim-mcp-server":
        return (
            "安装或使用 QwenPaw 随附的 NeqSim MCP Server。",
            "在 MCP 管理中配置并启用 NeqSim Driver，然后刷新检测。",
        )
    return ("", "检查对应 Provider 的安装和启用状态。")


def serialize_dependency(result: DependencyProbeResult) -> dict[str, str]:
    """Return a stable public dependency result including recovery guidance."""
    install_hint, enable_hint = _guidance(result.name)
    return {
        "name": result.name,
        "status": result.status,
        "reason": result.reason,
        "install_hint": result.install_hint or install_hint,
        "enable_hint": result.enable_hint or enable_hint,
    }


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
    runtime_reason = ""
    # Honor explicit desktop/PATH configuration before the aggregate NeqSim
    # runtime probe.  The aggregate probe can be unavailable even when Java
    # itself is valid and independently configured.
    java_path = shutil.which("java")
    if java_path:
        return DependencyProbeResult(name="java-runtime", status="available")
    for java_home_var in ("QWENPAW_DESKTOP_JAVA_HOME", "JAVA_HOME"):
        java_home = os.environ.get(java_home_var, "")
        if not java_home:
            continue
        executable_names = ("java.exe", "java") if os.name == "nt" else ("java",)
        candidates = tuple(
            candidate
            for executable_name in executable_names
            for candidate in (
                Path(java_home) / "bin" / executable_name,
                Path(java_home) / "Contents" / "Home" / "bin" / executable_name,
            )
        )
        if any(candidate.exists() for candidate in candidates):
            return DependencyProbeResult(name="java-runtime", status="available")

    try:
        from qwenpaw.agents.builtin_mcp.neqsim_runtime import discover_runtime

        status = discover_runtime()
        if status.ready or (
            status.java_path
            and status.java_major_version is not None
            and not any("Java" in issue for issue in status.issues)
        ):
            return DependencyProbeResult(name="java-runtime", status="available")
        runtime_reason = "; ".join(status.issues)
    except Exception as exc:
        runtime_reason = f"runtime discovery failed: {exc}"

    return DependencyProbeResult(
        name="java-runtime",
        status="unavailable",
        reason=runtime_reason or "java executable not found in the configured runtime or PATH",
    )


def probe_neqsim_mcp_server() -> DependencyProbeResult:
    """Check if NeqSim MCP server environment is configured.

    This is a lightweight check — it only verifies that the necessary
    environment variables exist, not that the server is running.
    """
    # Explicit desktop bundles are authoritative for this lightweight probe;
    # they must be recognized even if aggregate runtime discovery is partial.
    desktop_jar = os.environ.get("QWENPAW_DESKTOP_NEQSIM_JAR", "").strip()
    if desktop_jar and Path(desktop_jar).is_file():
        return DependencyProbeResult(name="neqsim-mcp-server", status="available")
    resource_dir = os.environ.get("QWENPAW_TAURI_RESOURCE_DIR", "").strip()
    if resource_dir:
        bundled_jar = (
            Path(resource_dir) / "binaries" / "neqsim" / "neqsim-mcp-server.jar"
        )
        if bundled_jar.is_file():
            return DependencyProbeResult(name="neqsim-mcp-server", status="available")

    try:
        from qwenpaw.agents.builtin_mcp.neqsim_runtime import discover_runtime

        status = discover_runtime()
        if status.ready or (
            status.jar_path
            and status.detected_neqsim_version == status.neqsim_version
            and not any("different runtime sources" in issue for issue in status.issues)
        ):
            return DependencyProbeResult(name="neqsim-mcp-server", status="available")
        runtime_reason = "; ".join(status.issues)
    except Exception as exc:
        runtime_reason = f"runtime discovery failed: {exc}"

    # Preserve support for externally managed NeqSim installations before
    # reporting an unavailable aggregate runtime.
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
        status="unavailable",
        reason=runtime_reason or "NeqSim MCP Server package is not installed",
    )


def probe_dependency(name: str) -> DependencyProbeResult:
    """Probe a single dependency by name."""
    if name in _PYTHON_PACKAGE_IMPORTS:
        result = probe_python_package(_PYTHON_PACKAGE_IMPORTS[name])
        result.name = name
        return result
    if name == "java-runtime":
        return probe_java_runtime()
    if name == "neqsim-mcp-server":
        return probe_neqsim_mcp_server()
    # Unknown dependency
    return DependencyProbeResult(
        name=name, status="unknown", reason="Unknown dependency type"
    )


def _probe_neqsim_runtime_dependencies() -> list[DependencyProbeResult]:
    """Probe NeqSim's Java/JAR pair as one validated runtime descriptor.

    The standalone dependency probes intentionally remain lightweight because
    they are also used for externally managed components. The built-in NeqSim
    engine, however, must never combine Java and a JAR from different sources
    or report an unsupported version as ready.
    """
    dependency_names = ("java-runtime", "neqsim-mcp-server")
    try:
        from qwenpaw.agents.builtin_mcp.neqsim_runtime import discover_runtime

        runtime = discover_runtime()
    except Exception as exc:
        reason = f"NeqSim runtime discovery failed: {exc}"
        return [
            DependencyProbeResult(name=name, status="unknown", reason=reason)
            for name in dependency_names
        ]

    if runtime.ready and runtime.validated:
        return [
            DependencyProbeResult(name=name, status="available")
            for name in dependency_names
        ]

    reason = "; ".join(runtime.issues) or "NeqSim runtime is incomplete"
    cross_source = any(
        "different runtime sources" in issue for issue in runtime.issues
    )
    try:
        required_java_major = int(runtime.java_version)
    except (TypeError, ValueError):
        required_java_major = None

    java_available = bool(
        not cross_source
        and runtime.java_path
        and runtime.java_major_version is not None
        and required_java_major is not None
        and runtime.java_major_version >= required_java_major
    )
    jar_available = bool(
        not cross_source
        and runtime.jar_path
        and runtime.detected_neqsim_version
        and runtime.detected_neqsim_version == runtime.neqsim_version
    )
    return [
        DependencyProbeResult(
            name="java-runtime",
            status="available" if java_available else "unavailable",
            reason="" if java_available else reason,
        ),
        DependencyProbeResult(
            name="neqsim-mcp-server",
            status="available" if jar_available else "unavailable",
            reason="" if jar_available else reason,
        ),
    ]


def probe_engine(engine: DomainEngineDefinition) -> EngineProbeResult:
    """Probe all dependencies for an engine."""
    if engine.id == "neqsim" and engine.provider.id == "ugsci-neqsim":
        neqsim_results = {
            result.name: result for result in _probe_neqsim_runtime_dependencies()
        }
        dep_results = [
            neqsim_results[dependency]
            if dependency in neqsim_results
            else probe_dependency(dependency)
            for dependency in engine.dependencies
        ]
    else:
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
