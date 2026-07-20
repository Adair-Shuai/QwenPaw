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

try:
    import winreg
except ImportError:
    winreg = None

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
    # Detected sub-modules / executables (e.g. CMG IMEX/GEM/STARS)
    modules: List[str] = field(default_factory=list)
    # Detected module paths (parallel to modules)
    module_paths: Dict[str, str] = field(default_factory=dict)


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
        local_appdata = os.environ.get("LOCALAPPDATA", "")
        dirs.extend([
            program_files, program_files_x86,
            # CMG
            os.path.join(program_files, "CMG"),
            os.path.join(program_files_x86, "CMG"),
            "C:\\CMG",
            "D:\\Program Files\CMG",
            "D:\\CMG",
            # Schlumberger
            os.path.join(program_files, "Schlumberger"),
            os.path.join(program_files_x86, "Schlumberger"),
            "C:\\Schlumberger",
            "D:\\Schlumberger",
            "D:\\Program Files\Schlumberger",
            # COMSOL
            os.path.join(program_files, "COMSOL"),
            os.path.join(program_files_x86, "COMSOL"),
            "C:\\COMSOL",
            "D:\\COMSOL",
            "D:\\Program Files\COMSOL",
        ])
        if local_appdata:
            dirs.append(os.path.join(local_appdata, "CMG"))
    elif system == "linux":
        dirs.extend([
            "/opt", "/opt/CMG", "/opt/Schlumberger", "/opt/comsol",
            "/usr/local",
        ])
    elif system == "darwin":
        dirs.extend([
            "/Applications", "/opt/CMG", "/opt/Schlumberger",
            "/opt/comsol",
        ])
    return [d for d in dirs if d and os.path.isdir(d)]


# ──────────────────────────────────────────────────────────────────────────────
# Registry-based detection (Windows only)
# ──────────────────────────────────────────────────────────────────────────────


def _get_from_registry(vendor_key: str) -> Optional[str]:
    """Check Windows registry for software installation path.

    Args:
        vendor_key: Registry subkey name to look for, e.g. "COMSOL\\COMSOL" or "CMG".
    """
    if platform.system().lower() != "windows" or not winreg:
        return None

    registry_paths = [
        (winreg.HKEY_LOCAL_MACHINE, f"SOFTWARE\\{vendor_key}"),
        (winreg.HKEY_LOCAL_MACHINE, f"SOFTWARE\\WOW6432Node\\{vendor_key}"),
        (winreg.HKEY_CURRENT_USER, f"SOFTWARE\\{vendor_key}"),
    ]

    try:
        for hkey, reg_path in registry_paths:
            try:
                with winreg.OpenKey(hkey, reg_path) as key:
                    for value_name in ["COMSOLROOT", "InstallDir", "Location", "Path", ""]:
                        try:
                            install_path, _ = winreg.QueryValueEx(key, value_name)
                            if install_path and os.path.exists(install_path):
                                return install_path
                        except OSError:
                            continue
            except OSError:
                continue
    except Exception as e:
        logger.debug("Error reading registry for %s: %s", vendor_key, e)

    return None


def _get_cmg_from_registry() -> Optional[str]:
    """Check Windows registry for CMG installation path."""
    return _get_from_registry("CMG")


def _get_comsol_from_registry() -> Optional[str]:
    """Check Windows registry for COMSOL installation path."""
    return _get_from_registry("COMSOL\\COMSOL")


def _get_comsol_version_dirs(base_dir: str) -> List[str]:
    """Find COMSOL version directories like COMSOL61, COMSOL56, etc."""
    version_dirs = []
    if not os.path.exists(base_dir):
        return version_dirs

    try:
        for item in os.listdir(base_dir):
            item_path = os.path.join(base_dir, item)
            if os.path.isdir(item_path) and re.match(r"COMSOL\d+", item):
                version_dirs.append(item_path)
    except (PermissionError, OSError):
        pass

    version_dirs.sort(
        key=lambda x: re.search(r"COMSOL(\d+)", x).group(1)
        if re.search(r"COMSOL(\d+)", x) else "0",
        reverse=True,
    )
    return version_dirs


def _get_cmg_version_dirs(base_dir: str) -> List[str]:
    """Find CMG version directories like 2023.10, 2024.10, etc."""
    version_dirs = []
    if not os.path.exists(base_dir):
        return version_dirs

    try:
        for item in os.listdir(base_dir):
            item_path = os.path.join(base_dir, item)
            if os.path.isdir(item_path) and re.match(r"\d{4}\.\d+", item):
                version_dirs.append(item_path)
    except (PermissionError, OSError):
        pass

    version_dirs.sort(reverse=True)
    return version_dirs


def _extract_comsol_version(install_dir: str) -> Optional[str]:
    """Extract COMSOL version from install directory name."""
    dir_name = os.path.basename(install_dir)
    match = re.search(r"COMSOL(\d+)", dir_name, re.IGNORECASE)
    if match:
        version_num = match.group(1)
        if len(version_num) >= 2:
            major = version_num[:2]
            minor = version_num[2:] if len(version_num) > 2 else "0"
            return f"{major}.{minor}"
    return None


def _extract_cmg_version(install_dir: str) -> Optional[str]:
    """Extract CMG version from install directory name (e.g. 2024.10 → 2024.10)."""
    dir_name = os.path.basename(install_dir)
    match = re.match(r"(\d{4}\.\d+)", dir_name)
    if match:
        return match.group(1)
    # Also try to extract from executable name like mx2300 → 2023
    match = re.search(r"mx(\d)(\d)00", install_dir, re.IGNORECASE)
    if match:
        return f"202{match.group(1)}.10"
    match = re.search(r"gm(\d)(\d)00", install_dir, re.IGNORECASE)
    if match:
        return f"202{match.group(1)}.10"
    return None


def _detect_cmg_modules(cmg_install_dir: str) -> tuple[List[str], Dict[str, str]]:
    """Detect which CMG modules are available.

    Returns:
        Tuple of (module_names, module_paths) where module_names is a list
        like ["IMEX", "GEM", "STARS", "Builder"] and module_paths maps
        module name to executable path.
    """
    modules: List[str] = []
    module_paths: Dict[str, str] = {}

    # Search in the install directory and its subdirectories
    search_bases = [cmg_install_dir]
    for subdir in _CMG_SUBDIRS:
        candidate = os.path.join(cmg_install_dir, subdir)
        if os.path.isdir(candidate):
            search_bases.append(candidate)

    for base in search_bases:
        try:
            for match in Path(base).rglob("*"):
                if not match.is_file():
                    continue
                lower_name = match.name.lower()
                if lower_name in _CMG_MODULE_MAP:
                    module_name = _CMG_MODULE_MAP[lower_name]
                    if module_name not in modules:
                        modules.append(module_name)
                        module_paths[module_name] = str(match)
        except (PermissionError, OSError):
            continue

    return modules, module_paths


def _find_executable(
    patterns: List[str],
    search_dirs: List[str],
    software_id: str = "",
) -> Optional[str]:
    """Search for an executable matching any pattern.

    For COMSOL and CMG, uses registry-based fast path first.
    """
    # Fast path: COMSOL via registry
    if software_id == "comsol":
        comsol_path = _get_comsol_from_registry()
        if comsol_path:
            version_dirs = _get_comsol_version_dirs(comsol_path)
            for version_dir in version_dirs:
                for subdir in _COMSOL_SUBDIRS:
                    bin_path = Path(version_dir) / subdir
                    if not bin_path.is_dir():
                        continue
                    for pattern in patterns:
                        for match in bin_path.glob("*"):
                            if match.name.lower() == pattern.lower() and match.is_file():
                                return str(match)

    # Fast path: CMG via registry
    if software_id == "cmg":
        cmg_path = _get_cmg_from_registry()
        if cmg_path:
            for subdir in _CMG_SUBDIRS:
                bin_path = Path(cmg_path) / subdir
                if not bin_path.is_dir():
                    continue
                for pattern in patterns:
                    for match in bin_path.glob("*"):
                        if match.name.lower() == pattern.lower() and match.is_file():
                            return str(match)

    # Standard search logic
    patterns_lower = [p.lower() for p in patterns]
    for base_dir in search_dirs:
        base_path = Path(base_dir)
        try:
            for match in base_path.rglob("*"):
                if match.name.lower() in patterns_lower:
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
    "cmg": [
        "mx2300.exe", "mx2200.exe", "mx2100.exe", "imex.exe",
        "gm2300.exe", "gm2200.exe", "gm2100.exe", "gem.exe",
        "st2300.exe", "st2200.exe", "st2100.exe", "stars.exe",
        "builder.exe", "results.exe", "launcher.exe",
    ],
    "eclipse": ["eclipse.exe", "e100.exe", "e300.exe", "eclipse"],
    "intersect": ["intersect.exe", "intersect"],
    "comsol": ["comsol.exe", "comsol", "comsolbatch.exe", "comsolmphserver.exe"],
}

# CMG module mapping: executable pattern → module name
_CMG_MODULE_MAP: Dict[str, str] = {
    "mx2300.exe": "IMEX", "mx2200.exe": "IMEX", "mx2100.exe": "IMEX", "imex.exe": "IMEX",
    "gm2300.exe": "GEM", "gm2200.exe": "GEM", "gm2100.exe": "GEM", "gem.exe": "GEM",
    "st2300.exe": "STARS", "st2200.exe": "STARS", "st2100.exe": "STARS", "stars.exe": "STARS",
    "builder.exe": "Builder",
    "results.exe": "Results",
    "launcher.exe": "Launcher",
}

# CMG subdirectories to search for executables
_CMG_SUBDIRS = ["exe", "bin", "bin\\win64", "bin\\win32", "win\\exe", "win\\bin"]

# COMSOL subdirectories to search for executables
_COMSOL_SUBDIRS = ["bin", "bin\\win64", "bin\\wine64", "exe"]


def detect_engines() -> List[EngineInfo]:
    """Auto-detect installed engines and update their info on disk.

    Uses per-engine optimized detection strategies:
    - COMSOL: registry-first, then version-directory scan
    - CMG: registry-first, then module-by-module detection
    - Others: standard path search

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
            _write_engine(engine)
            continue

        patterns = _DETECT_PATTERNS.get(engine.id, [])
        if not patterns:
            if engine.executable_path and os.path.isfile(engine.executable_path):
                engine.status = "detected"
            else:
                engine.status = "configured"
            _write_engine(engine)
            continue

        # ── COMSOL: optimized detection ──────────────────────────────
        if engine.id == "comsol":
            found_path = _find_executable(patterns, search_dirs, "comsol")
            if found_path:
                engine.executable_path = found_path
                engine.install_dir = str(Path(found_path).parent)
                # Try version extraction from install dir
                comsol_ver = _extract_comsol_version(engine.install_dir)
                if comsol_ver:
                    engine.version = comsol_ver
                else:
                    ver = _extract_version(found_path)
                    if ver:
                        engine.version = ver
                engine.status = "detected"
            else:
                engine.status = "not_found"
            _write_engine(engine)
            continue

        # ── CMG: optimized detection with modules ────────────────────
        if engine.id == "cmg":
            # Try to find CMG install directory first
            cmg_install_dir = _get_cmg_from_registry()
            if not cmg_install_dir:
                # Search in known directories
                for base_dir in search_dirs:
                    base_path = Path(base_dir)
                    try:
                        for item in base_path.iterdir():
                            if item.is_dir() and item.name.lower() == "cmg":
                                cmg_install_dir = str(item)
                                break
                    except (PermissionError, OSError):
                        continue
                    if cmg_install_dir:
                        break

            # Also check for version directories
            if cmg_install_dir:
                version_dirs = _get_cmg_version_dirs(cmg_install_dir)
                if version_dirs:
                    # Use the latest version directory
                    cmg_install_dir = version_dirs[0]

            if cmg_install_dir:
                # Detect all CMG modules
                modules, module_paths = _detect_cmg_modules(cmg_install_dir)
                if modules:
                    engine.modules = modules
                    engine.module_paths = module_paths
                    # Use the first found executable as the main path
                    first_module = modules[0]
                    engine.executable_path = module_paths.get(first_module, "")
                    engine.install_dir = cmg_install_dir
                    # Extract version
                    cmg_ver = _extract_cmg_version(cmg_install_dir)
                    if cmg_ver:
                        engine.version = cmg_ver
                    else:
                        ver = _extract_version(engine.executable_path)
                        if ver:
                            engine.version = ver
                    engine.status = "detected"
                    _write_engine(engine)
                    continue

            # Fall back to standard search
            found_path = _find_executable(patterns, search_dirs, "cmg")
            if found_path:
                engine.executable_path = found_path
                engine.install_dir = str(Path(found_path).parent)
                # Detect modules from the parent directory
                modules, module_paths = _detect_cmg_modules(engine.install_dir)
                if modules:
                    engine.modules = modules
                    engine.module_paths = module_paths
                ver = _extract_version(found_path)
                if ver:
                    engine.version = ver
                else:
                    cmg_ver = _extract_cmg_version(engine.install_dir)
                    if cmg_ver:
                        engine.version = cmg_ver
                engine.status = "detected"
            else:
                engine.status = "not_found"
            _write_engine(engine)
            continue

        # ── Standard detection for other engines ─────────────────────
        found_path = _find_executable(patterns, search_dirs, engine.id)
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
    if "modules" in data:
        engine.modules = data["modules"]
    if "module_paths" in data:
        engine.module_paths = data["module_paths"]

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
        if e.modules:
            lines.append(f"- **Modules**: {', '.join(e.modules)}")
        lines.append(f"- **Status**: {e.status}")
        lines.append("")

    lines.append(
        "Use the paths above to invoke the engines from scripts or commands. "
        "Always verify the executable path before running.",
    )
    return "\n".join(lines)
