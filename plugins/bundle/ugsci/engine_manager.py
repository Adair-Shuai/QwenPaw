# -*- coding: utf-8 -*-
"""Computation engine manager for UGSci plugin.

Manages a JSON-based registry of computation engines (CMG, Eclipse,
Intersect, COMSOL, etc.).  Each engine is stored as an individual JSON
file under ``engines/`` and auto-loaded on startup.

Design principles
-----------------
1. **File-per-engine** — each engine has its own ``.json`` file, making
   it easy to inspect, add, or remove individual entries.
2. **Default engines** — four well-known engines are pre-registered on
   first run.
3. **CRUD via API** — the HTTP router provides list / add / update /
   delete / detect endpoints.
4. **Agent-friendly** — a capability summary can be injected into the
   agent system prompt so the model knows what engines are available.
"""

from __future__ import annotations

import json
import logging
import os
import platform
import re
import shutil
import subprocess
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.engine")

PLUGIN_DIR = Path(__file__).parent
ENGINES_DIR = PLUGIN_DIR / "engines"

# ──────────────────────────────────────────────────────────────────────────────
# Data model
# ──────────────────────────────────────────────────────────────────────────────


@dataclass
class EngineInfo:
    """A computation engine record."""

    id: str
    name: str
    vendor: str = ""
    version: str = ""
    executable_path: str = ""
    install_dir: str = ""
    category: str = ""
    description: str = ""
    invocation_hint: str = ""
    license_server: str = ""
    extra_paths: List[str] = field(default_factory=list)
    status: str = "configured"  # configured | detected | not_found | error
    is_default: bool = False
    is_custom: bool = False


# ──────────────────────────────────────────────────────────────────────────────
# Default engines
# ──────────────────────────────────────────────────────────────────────────────

DEFAULT_ENGINES: List[Dict[str, Any]] = [
    {
        "id": "cmg",
        "name": "CMG",
        "vendor": "Computer Modelling Group",
        "version": "",
        "executable_path": "",
        "install_dir": "",
        "category": "reservoir_simulation",
        "description": "CMG 油藏数值模拟套件 (IMEX/GEM/STARS/Builder/Results)",
        "invocation_hint": "IMEX: <path>/mx2300.exe -f <model.dat> -o <output.out>; "
        "GEM: <path>/gm2300.exe -f <model.dat> -o <output.out>; "
        "STARS: <path>/st2300.exe -f <model.dat> -o <output.out>",
        "license_server": "",
        "extra_paths": [],
        "status": "configured",
        "is_default": True,
        "is_custom": False,
    },
    {
        "id": "eclipse",
        "name": "Eclipse",
        "vendor": "Schlumberger",
        "version": "",
        "executable_path": "",
        "install_dir": "",
        "category": "reservoir_simulation",
        "description": "Schlumberger Eclipse 行业标准油藏模拟器 (E100/E300)",
        "invocation_hint": "Run: <eclipse_path> <model.DATA> to execute a simulation.",
        "license_server": "",
        "extra_paths": [],
        "status": "configured",
        "is_default": True,
        "is_custom": False,
    },
    {
        "id": "intersect",
        "name": "Intersect",
        "vendor": "Schlumberger",
        "version": "",
        "executable_path": "",
        "install_dir": "",
        "category": "reservoir_simulation",
        "description": "Schlumberger Intersect 新一代高性能油藏模拟器",
        "invocation_hint": "Run: <intersect_path> <model.DATA>",
        "license_server": "",
        "extra_paths": [],
        "status": "configured",
        "is_default": True,
        "is_custom": False,
    },
    {
        "id": "comsol",
        "name": "COMSOL",
        "vendor": "COMSOL Inc.",
        "version": "",
        "executable_path": "",
        "install_dir": "",
        "category": "multiphysics",
        "description": "COMSOL Multiphysics 多物理场耦合仿真平台",
        "invocation_hint": "COMSOL can be run in batch mode: "
        "comsolbatch -input <model.mph> -output <result.mph>",
        "license_server": "",
        "extra_paths": [],
        "status": "configured",
        "is_default": True,
        "is_custom": False,
    },
]


# ──────────────────────────────────────────────────────────────────────────────
# File-based persistence
# ──────────────────────────────────────────────────────────────────────────────


def _ensure_engines_dir() -> Path:
    """Ensure the engines directory exists and return its path."""
    ENGINES_DIR.mkdir(parents=True, exist_ok=True)
    return ENGINES_DIR


def _engine_file_path(engine_id: str) -> Path:
    """Return the JSON file path for a given engine ID."""
    safe_id = re.sub(r"[^a-zA-Z0-9_\-.]", "_", engine_id)
    return _ensure_engines_dir() / f"{safe_id}.json"


def _write_engine(engine: EngineInfo) -> None:
    """Write an engine record to its JSON file."""
    path = _engine_file_path(engine.id)
    data = asdict(engine)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    logger.debug("Engine '%s' written to %s", engine.id, path)


def _delete_engine_file(engine_id: str) -> bool:
    """Delete the JSON file for an engine. Returns True if deleted."""
    path = _engine_file_path(engine_id)
    if path.exists():
        path.unlink()
        logger.debug("Engine file deleted: %s", path)
        return True
    return False


def _read_all_engines() -> List[EngineInfo]:
    """Read all engine JSON files from disk."""
    engines: List[EngineInfo] = []
    engines_dir = _ensure_engines_dir()
    for f in sorted(engines_dir.glob("*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            engines.append(EngineInfo(**data))
        except Exception as exc:
            logger.warning("Failed to read engine file %s: %s", f, exc)
    return engines


def _read_engine(engine_id: str) -> Optional[EngineInfo]:
    """Read a single engine by ID."""
    path = _engine_file_path(engine_id)
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return EngineInfo(**data)
    except Exception as exc:
        logger.warning("Failed to read engine %s: %s", engine_id, exc)
        return None


def init_default_engines() -> int:
    """Ensure default engine JSON files exist. Returns count created."""
    count = 0
    for def_eng in DEFAULT_ENGINES:
        path = _engine_file_path(def_eng["id"])
        if not path.exists():
            engine = EngineInfo(**def_eng)
            _write_engine(engine)
            count += 1
            logger.info("Created default engine: %s", engine.name)
    return count


# ──────────────────────────────────────────────────────────────────────────────
# Detection logic (best-effort auto-fill version / path)
# ──────────────────────────────────────────────────────────────────────────────


def _get_default_search_dirs() -> List[str]:
    """Return platform-appropriate search directories."""
    system = platform.system().lower()
    dirs: List[str] = []
    if system == "windows":
        program_files = os.environ.get("PROGRAMFILES", "C:\\Program Files")
        program_files_x86 = os.environ.get(
            "PROGRAMFILES(X86)", "C:\\Program Files (x86)",
        )
        dirs.extend([
            program_files, program_files_x86,
            os.path.join(program_files, "CMG"),
            os.path.join(program_files, "Schlumberger"),
            os.path.join(program_files, "COMSOL"),
            "C:\\CMG", "C:\\Schlumberger", "C:\\COMSOL",
            "D:\\CMG", "D:\\Schlumberger", "D:\\COMSOL",
        ])
    elif system == "linux":
        dirs.extend(["/opt", "/opt/CMG", "/opt/Schlumberger", "/opt/comsol",
                      "/usr/local"])
    elif system == "darwin":
        dirs.extend(["/Applications", "/opt/CMG", "/opt/Schlumberger",
                      "/opt/comsol"])
    return [d for d in dirs if d and os.path.isdir(d)]


def _find_executable(patterns: List[str], search_dirs: List[str]) -> Optional[str]:
    """Search for an executable matching any pattern."""
    for base_dir in search_dirs:
        base_path = Path(base_dir)
        try:
            for match in base_path.rglob("*"):
                if match.name.lower() in [p.lower() for p in patterns]:
                    if match.is_file():
                        return str(match)
        except (PermissionError, OSError):
            continue
    return None


def _extract_version(executable: str) -> Optional[str]:
    """Try to get version info from an executable."""
    try:
        result = subprocess.run(
            [executable, "--version"],
            capture_output=True, text=True, timeout=10, shell=False,
        )
        output = (result.stdout + result.stderr).strip()
        if output:
            for vp in [r"(\d+\.\d+\.\d+)", r"(\d{4}\.\d+)", r"(\d+\.\d+)"]:
                m = re.search(vp, output, re.IGNORECASE)
                if m:
                    return m.group(1)
            return output[:80]
    except Exception:
        pass
    return None


# Patterns used for auto-detection of each default engine
_DETECT_PATTERNS: Dict[str, List[str]] = {
    "cmg": ["mx2300.exe", "mx2100.exe", "imex.exe", "gm2300.exe", "gem.exe",
            "st2300.exe", "stars.exe", "builder.exe"],
    "eclipse": ["eclipse.exe", "e100.exe", "e300.exe", "eclipse"],
    "intersect": ["intersect.exe", "intersect"],
    "comsol": ["comsol.exe", "comsol", "comsolbatch"],
}


def detect_engines() -> List[EngineInfo]:
    """Auto-detect installed engines and update their info on disk.

    Returns the updated list of all engines.
    """
    search_dirs = _get_default_search_dirs()
    engines = _read_all_engines()

    for engine in engines:
        if engine.is_custom and engine.executable_path:
            # Custom engines with user-set path: just verify it exists
            if os.path.isfile(engine.executable_path):
                engine.status = "detected"
            else:
                engine.status = "not_found"
            continue

        patterns = _DETECT_PATTERNS.get(engine.id, [])
        if not patterns:
            # Unknown default engine — skip detection
            if engine.executable_path and os.path.isfile(engine.executable_path):
                engine.status = "detected"
            else:
                engine.status = "configured"
            continue

        found_path = _find_executable(patterns, search_dirs)
        if found_path:
            engine.executable_path = found_path
            engine.install_dir = str(Path(found_path).parent)
            ver = _extract_version(found_path)
            if ver:
                engine.version = ver
            engine.status = "detected"
        else:
            engine.status = "not_found"

        _write_engine(engine)

    return engines


# ──────────────────────────────────────────────────────────────────────────────
# CRUD operations
# ──────────────────────────────────────────────────────────────────────────────


def list_engines() -> List[EngineInfo]:
    """Return all registered engines."""
    return _read_all_engines()


def get_engine(engine_id: str) -> Optional[EngineInfo]:
    """Return a single engine by ID."""
    return _read_engine(engine_id)


def add_engine(data: Dict[str, Any]) -> EngineInfo:
    """Add a new custom engine.

    Generates a unique ID from the name if not provided.
    """
    engine_id = data.get("id", "").strip()
    name = data.get("name", "").strip()
    if not name:
        raise ValueError("Engine name is required")

    if not engine_id:
        # Generate ID from name
        base = re.sub(r"[^a-zA-Z0-9_]", "_", name.lower()).strip("_")
        engine_id = base
        counter = 1
        while _engine_file_path(engine_id).exists():
            engine_id = f"{base}_{counter}"
            counter += 1

    if _engine_file_path(engine_id).exists():
        raise ValueError(f"Engine '{engine_id}' already exists")

    engine = EngineInfo(
        id=engine_id,
        name=name,
        vendor=data.get("vendor", ""),
        version=data.get("version", ""),
        executable_path=data.get("executable_path", ""),
        install_dir=data.get("install_dir", ""),
        category=data.get("category", ""),
        description=data.get("description", ""),
        invocation_hint=data.get("invocation_hint", ""),
        license_server=data.get("license_server", ""),
        extra_paths=data.get("extra_paths", []),
        status="configured",
        is_default=False,
        is_custom=True,
    )

    # If a path was provided, try to detect version
    if engine.executable_path and os.path.isfile(engine.executable_path):
        engine.status = "detected"
        engine.install_dir = str(Path(engine.executable_path).parent)
        if not engine.version:
            ver = _extract_version(engine.executable_path)
            if ver:
                engine.version = ver

    _write_engine(engine)
    logger.info("Added custom engine: %s (%s)", engine.name, engine.id)
    return engine


def update_engine(engine_id: str, data: Dict[str, Any]) -> EngineInfo:
    """Update an existing engine. Returns the updated engine."""
    engine = _read_engine(engine_id)
    if engine is None:
        raise ValueError(f"Engine '{engine_id}' not found")

    # Update fields
    if "name" in data:
        engine.name = data["name"]
    if "vendor" in data:
        engine.vendor = data["vendor"]
    if "version" in data:
        engine.version = data["version"]
    if "executable_path" in data:
        engine.executable_path = data["executable_path"]
    if "install_dir" in data:
        engine.install_dir = data["install_dir"]
    if "category" in data:
        engine.category = data["category"]
    if "description" in data:
        engine.description = data["description"]
    if "invocation_hint" in data:
        engine.invocation_hint = data["invocation_hint"]
    if "license_server" in data:
        engine.license_server = data["license_server"]
    if "extra_paths" in data:
        engine.extra_paths = data["extra_paths"]

    # Re-check status based on path
    if engine.executable_path and os.path.isfile(engine.executable_path):
        engine.status = "detected"
    elif engine.executable_path:
        engine.status = "not_found"
    else:
        engine.status = "configured"

    _write_engine(engine)
    logger.info("Updated engine: %s", engine.name)
    return engine


def delete_engine(engine_id: str) -> bool:
    """Delete an engine by ID. Default engines cannot be deleted."""
    engine = _read_engine(engine_id)
    if engine is None:
        raise ValueError(f"Engine '{engine_id}' not found")
    if engine.is_default:
        raise ValueError("Default engines cannot be deleted")
    return _delete_engine_file(engine_id)


def to_dict(engine: EngineInfo) -> Dict[str, Any]:
    """Convert EngineInfo to a JSON-serialisable dict."""
    return asdict(engine)


def engines_to_list(engines: List[EngineInfo]) -> List[Dict[str, Any]]:
    """Convert a list of engines to dicts."""
    return [to_dict(e) for e in engines]


# ──────────────────────────────────────────────────────────────────────────────
# Agent-facing capability summary
# ──────────────────────────────────────────────────────────────────────────────


def build_capability_summary(engines: List[EngineInfo]) -> str:
    """Build a concise text summary for agent system-prompt injection."""
    configured = [
        e for e in engines
        if e.status in ("detected", "configured") and (
            e.executable_path or e.invocation_hint
        )
    ]
    if not configured:
        return "No computation engines configured on this host."

    lines = [
        "## Computation Engines",
        "",
        "The following computation engines are available on this host:",
        "",
    ]

    for e in configured:
        lines.append(f"### {e.name} ({e.vendor})" if e.vendor else f"### {e.name}")
        if e.version:
            lines.append(f"- **Version**: {e.version}")
        if e.executable_path:
            lines.append(f"- **Path**: `{e.executable_path}`")
        if e.category:
            lines.append(f"- **Category**: {e.category}")
        if e.invocation_hint:
            lines.append(f"- **Usage**: {e.invocation_hint}")
        lines.append(f"- **Status**: {e.status}")
        lines.append("")

    lines.append(
        "Use the paths above to invoke the engines from scripts or commands. "
        "Always verify the executable path before running.",
    )
    return "\n".join(lines)
