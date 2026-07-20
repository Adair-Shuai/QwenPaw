# -*- coding: utf-8 -*-
"""Engine detector — per-software detection strategies with multi-drive search.

Each software has its own optimized detection strategy:

* **CMG**    — multi-drive search for ``<DRIVE>:\\CMG\\<MODULE>\\<VERSION>\\Win_x64\\EXE\\mx*.exe``
* **COMSOL** — multi-drive search for ``<DRIVE>:\\Program Files\\COMSOL\\COMSOL*\\bin\\win64\\comsol.exe``
* **Eclipse** — Schlumberger directory structure
* **Intersect** — Schlumberger directory structure

All engines are detected **in parallel** via ``ThreadPoolExecutor``.
"""
from __future__ import annotations

import logging
import os
import platform
import re
import shutil
import subprocess
import string
import time
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

try:
    import winreg
except ImportError:
    winreg = None

from concurrent.futures import ThreadPoolExecutor, as_completed

from .manager import (
    EngineInfo,
    _read_all_engines,
    _write_engine,
)

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.engine.detector")

# ──────────────────────────────────────────────────────────────────────────────
# Multi-drive enumeration
# ──────────────────────────────────────────────────────────────────────────────


def _get_available_drives() -> List[str]:
    """Return all available drive letters on Windows, **C: first**.

    On non-Windows platforms returns an empty list (Linux/macOS use
    a single root filesystem).
    """
    if platform.system().lower() != "windows":
        return []

    drives: List[str] = []
    for letter in string.ascii_uppercase:
        drive_root = f"{letter}:\\"
        if os.path.exists(drive_root):
            drives.append(letter)

    # Sort: C: first, then A-B, then D-Z
    drives.sort(key=lambda d: (d != "C", d))
    return drives


def _build_search_paths(folder_name: str) -> List[str]:
    """Build a prioritised list of candidate paths across all drives.

    Checks ``<DRIVE>:\\<folder_name>`` and
    ``<DRIVE>:\\Program Files\\<folder_name>`` and
    ``<DRIVE>:\\Program Files (x86)\\<folder_name>``
    for every available drive, **C: first**.
    """
    candidates: List[str] = []
    for drive_letter in _get_available_drives():
        drive = f"{drive_letter}:"
        candidates.extend([
            os.path.join(drive, os.sep, folder_name),
            os.path.join(drive, os.sep, "Program Files", folder_name),
            os.path.join(drive, os.sep, "Program Files (x86)", folder_name),
        ])
    return candidates


# ──────────────────────────────────────────────────────────────────────────────
# Registry helpers (Windows only)
# ──────────────────────────────────────────────────────────────────────────────


def _reg_get_value(key, name: str) -> Optional[str]:
    """Read a single registry value, returning None if not found."""
    try:
        val, _ = winreg.QueryValueEx(key, name)
        return str(val) if val else None
    except (FileNotFoundError, OSError):
        return None


def _get_from_registry(vendor_key: str) -> Optional[str]:
    """Check Windows registry for a software installation path.

    Args:
        vendor_key: Registry subkey, e.g. ``"COMSOL\\COMSOL"`` or ``"CMG"``.
    """
    if platform.system().lower() != "windows" or not winreg:
        return None

    registry_paths = [
        (winreg.HKEY_LOCAL_MACHINE, f"SOFTWARE\\{vendor_key}"),
        (winreg.HKEY_LOCAL_MACHINE, f"SOFTWARE\\WOW6432Node\\{vendor_key}"),
        (winreg.HKEY_CURRENT_USER, f"SOFTWARE\\{vendor_key}"),
    ]

    value_names = [
        "COMSOLROOT", "CMG_HOME", "InstallDir", "InstallPath",
        "Location", "Path", "BaseDir", "Home", "",
    ]

    for hkey, reg_path in registry_paths:
        try:
            with winreg.OpenKey(hkey, reg_path) as key:
                for value_name in value_names:
                    try:
                        install_path, _ = winreg.QueryValueEx(key, value_name)
                        if install_path and os.path.exists(install_path):
                            return install_path
                    except OSError:
                        continue
        except OSError:
            continue

    return None


def _get_from_registry_subkeys(
    vendor_key: str,
    value_names: Optional[List[str]] = None,
) -> List[Tuple[str, str]]:
    """Enumerate all subkeys under ``vendor_key`` and collect paths.

    This is useful for COMSOL which stores per-version keys like
    ``SOFTWARE\\COMSOL\\COMSOL61``.

    Returns a list of ``(subkey_name, install_path)`` tuples.
    """
    if platform.system().lower() != "windows" or not winreg:
        return []

    if value_names is None:
        value_names = ["COMSOLROOT", "InstallDir", "Location", "Path", ""]

    results: List[Tuple[str, str]] = []
    hkey_roots = [
        (winreg.HKEY_LOCAL_MACHINE, f"SOFTWARE\\{vendor_key}"),
        (winreg.HKEY_LOCAL_MACHINE, f"SOFTWARE\\WOW6432Node\\{vendor_key}"),
        (winreg.HKEY_CURRENT_USER, f"SOFTWARE\\{vendor_key}"),
    ]

    for hkey, reg_path in hkey_roots:
        try:
            with winreg.OpenKey(hkey, reg_path) as key:
                # First, try direct value
                for vn in value_names:
                    try:
                        val, _ = winreg.QueryValueEx(key, vn)
                        if val and os.path.exists(val):
                            results.append(("", val))
                    except OSError:
                        continue
                # Enumerate subkeys
                sub_idx = 0
                while True:
                    try:
                        sub_name = winreg.EnumKey(key, sub_idx)
                        sub_path = f"{reg_path}\\{sub_name}"
                        sub_idx += 1
                        try:
                            with winreg.OpenKey(hkey, sub_path) as sub_key:
                                for vn in value_names:
                                    try:
                                        val, _ = winreg.QueryValueEx(sub_key, vn)
                                        if val and os.path.exists(val):
                                            results.append((sub_name, val))
                                    except OSError:
                                        continue
                        except OSError:
                            continue
                    except OSError:
                        break  # No more subkeys
        except OSError:
            continue

    return results


# ──────────────────────────────────────────────────────────────────────────────
# CMG detection strategy
# ──────────────────────────────────────────────────────────────────────────────

# CMG module directory → (glob pattern, module display name)
_CMG_MODULE_DIRS: Dict[str, Tuple[str, str]] = {
    "IMEX": ("mx*.exe", "IMEX"),
    "GEM": ("gm*.exe", "GEM"),
    "STARS": ("st*.exe", "STARS"),
    "BR": ("Builder.exe", "Builder"),
    "RESULTS": ("Results.exe", "Results"),
    "Launcher": ("CMG.exe", "Launcher"),
}

# Platform subdirectories to check (newer CMG versions)
_CMG_PLATFORM_DIRS = ["Win_x64", "win64", "Win32", "win32", ""]

# Executable subdirectories within version/platform directory
_CMG_EXE_SUBDIRS = ["EXE", "exe", "bin", os.path.join("bin", "win64")]

# Legacy subdirectories (older CMG versions, flat structure)
_CMG_LEGACY_SUBDIRS = ["exe", "bin", os.path.join("bin", "win64"), os.path.join("bin", "win32"), os.path.join("win", "exe")]


def _detect_cmg_from_home(cmg_home: str) -> Optional[Tuple[List[str], Dict[str, str], str]]:
    """Detect CMG modules and version from a CMG home directory.

    Returns ``(modules, module_paths, version)`` or ``None``.
    """
    home_path = Path(cmg_home)
    modules: List[str] = []
    module_paths: Dict[str, str] = {}

    for mod_dir_name, (exe_pattern, mod_name) in _CMG_MODULE_DIRS.items():
        mod_dir = home_path / mod_dir_name
        if not mod_dir.is_dir():
            continue

        # Find version subdirectories (e.g. 2025.30)
        version_dirs: List[Path] = []
        try:
            for item in mod_dir.iterdir():
                if item.is_dir() and re.match(r"\d{4}\.\d+", item.name):
                    version_dirs.append(item)
        except (PermissionError, OSError):
            continue

        if not version_dirs:
            # Legacy: no version subdirs — check exe/ directly under module dir
            for subdir in _CMG_LEGACY_SUBDIRS:
                exe_dir = mod_dir / subdir
                if not exe_dir.is_dir():
                    continue
                for exe_file in exe_dir.glob(exe_pattern):
                    if exe_file.is_file() and mod_name not in modules:
                        modules.append(mod_name)
                        module_paths[mod_name] = str(exe_file)
                        break
                if mod_name in modules:
                    break
            continue

        # Sort by version, latest first
        version_dirs.sort(key=lambda x: x.name, reverse=True)

        for ver_dir in version_dirs:
            found = _find_cmg_exe_in_version_dir(ver_dir, exe_pattern)
            if found and mod_name not in modules:
                modules.append(mod_name)
                module_paths[mod_name] = str(found)
                break

    if not modules:
        return None

    # Extract version
    version = _extract_cmg_version(cmg_home, modules, module_paths)
    return modules, module_paths, version or ""


def _find_cmg_exe_in_version_dir(ver_dir: Path, exe_pattern: str) -> Optional[Path]:
    """Find an executable in a CMG version directory.

    Checks ``<VERSION>/<PLATFORM>/<EXE_SUBDIR>/`` pattern.
    """
    for platform_name in _CMG_PLATFORM_DIRS:
        plat_dir = ver_dir / platform_name if platform_name else ver_dir
        if not plat_dir.is_dir():
            continue
        for exe_subdir in _CMG_EXE_SUBDIRS:
            exe_dir = plat_dir / exe_subdir
            if not exe_dir.is_dir():
                continue
            for exe_file in exe_dir.glob(exe_pattern):
                if exe_file.is_file():
                    return exe_file
    return None


def _extract_cmg_version(
    cmg_home: str,
    modules: List[str],
    module_paths: Dict[str, str],
) -> Optional[str]:
    """Extract CMG version from multiple sources.

    Strategy:
    1. InstallManifest XML  2. Version directory name  3. Executable name
    """
    # 1. Parse InstallManifest XML
    manifest_dir = Path(cmg_home) / "InstallManifest"
    if manifest_dir.is_dir():
        try:
            for xml_file in manifest_dir.glob("MF_*.xml"):
                try:
                    content = xml_file.read_text(encoding="utf-8", errors="ignore")
                    match = re.search(
                        r"<ProductVersion>([^<]+)</ProductVersion>", content,
                    )
                    if match:
                        return match.group(1).strip()
                except Exception:
                    continue
        except (PermissionError, OSError):
            pass

    # 2. Version directory name (e.g. IMEX/2025.30)
    for mod_dir_name in ["IMEX", "GEM", "STARS", "Launcher"]:
        mod_path = Path(cmg_home) / mod_dir_name
        if not mod_path.is_dir():
            continue
        try:
            for item in mod_path.iterdir():
                if item.is_dir() and re.match(r"\d{4}\.\d+", item.name):
                    return item.name
        except (PermissionError, OSError):
            continue

    # 3. Executable name (e.g. mx202530.exe → 2025.30)
    for path_str in module_paths.values():
        name = Path(path_str).name
        # New naming: mx202530.exe → 2025.30
        match = re.search(r"[a-z]{2}(\d{4})(\d{2})\.exe", name, re.IGNORECASE)
        if match:
            return f"{match.group(1)}.{match.group(2)}"
        # Old naming: mx2300.exe → 2023.10
        match = re.search(r"[a-z]{2}(\d)(\d)00\.exe", name, re.IGNORECASE)
        if match:
            return f"202{match.group(1)}.10"

    return None


def _detect_cmg(engine: EngineInfo) -> EngineInfo:
    """CMG detection strategy: multi-drive search, C: first.

    CMG directory structure (consistent across all drives):
      ``<DRIVE>:\\CMG\\<MODULE>\\<VERSION>\\<PLATFORM>\\EXE\\mx*.exe``
    e.g. ``D:\\CMG\\IMEX\\2025.30\\Win_x64\\EXE\\mx202530.exe``
    """
    # 1. Registry
    reg_path = _get_from_registry("CMG")
    if reg_path and os.path.isdir(reg_path):
        result = _detect_cmg_from_home(reg_path)
        if result:
            modules, module_paths, version = result
            return _apply_cmg_result(engine, reg_path, modules, module_paths, version)

    # 2. Multi-drive search: C: first, then other drives
    for candidate in _build_search_paths("CMG"):
        if not os.path.isdir(candidate):
            continue
        # Verify it looks like a CMG install (has module subdirs or version dirs)
        has_module = any(
            os.path.isdir(os.path.join(candidate, mod))
            for mod in _CMG_MODULE_DIRS
        )
        if not has_module:
            # Also accept if it has version dirs directly (legacy layout)
            try:
                has_version = any(
                    re.match(r"\d{4}\.\d+", item)
                    for item in os.listdir(candidate)
                )
            except (PermissionError, OSError):
                has_version = False
            if not has_version:
                continue

        result = _detect_cmg_from_home(candidate)
        if result:
            modules, module_paths, version = result
            return _apply_cmg_result(engine, candidate, modules, module_paths, version)

    # 3. Fallback: try PATH
    for exe_name in ["mx202530.exe", "mx2300.exe", "CMG.exe"]:
        found = shutil.which(exe_name)
        if found:
            engine.executable_path = found
            engine.install_dir = str(Path(found).parent)
            engine.status = "detected"
            return engine

    engine.status = "not_found"
    return engine


def _apply_cmg_result(
    engine: EngineInfo,
    cmg_home: str,
    modules: List[str],
    module_paths: Dict[str, str],
    version: str,
) -> EngineInfo:
    """Apply CMG detection result to an EngineInfo."""
    engine.modules = modules
    engine.module_paths = module_paths
    # Use IMEX as the primary executable if available
    primary = "IMEX" if "IMEX" in modules else modules[0]
    engine.executable_path = module_paths.get(primary, "")
    engine.install_dir = cmg_home
    if version:
        engine.version = version
    engine.status = "detected"
    logger.info(
        "CMG detected: version=%s, modules=%s, home=%s",
        version, modules, cmg_home,
    )
    return engine


# ──────────────────────────────────────────────────────────────────────────────
# COMSOL detection strategy
# ──────────────────────────────────────────────────────────────────────────────

# COMSOL subdirectories to search for executables
# COMSOL 6.x layout:  COMSOL61\Multiphysics\bin\win64\comsol.exe
# COMSOL 5.x layout:  COMSOL56\Multiphysics\bin\win64\comsol.exe
# Some installs also have: COMSOL61\bin\win64\comsol.exe (without Multiphysics)
_COMSOL_BIN_SUBDIRS = [
    os.path.join("Multiphysics", "bin", "win64"),
    os.path.join("Multiphysics", "bin", "wine64"),
    os.path.join("Multiphysics", "bin"),
    os.path.join("Multiphysics", "exe"),
    os.path.join("bin", "win64"),
    os.path.join("bin", "wine64"),
    os.path.join("bin"),
    "exe",
]

# COMSOL executable names to look for
_COMSOL_EXECUTABLES = [
    "comsol.exe",
    "comsolbatch.exe",
    "comsolmphserver.exe",
]


def _detect_comsol_from_base(base_dir: str) -> Optional[Tuple[str, str, str]]:
    """Detect COMSOL from a base installation directory.

    COMSOL structure:
      ``<BASE>\\COMSOL<version>\\bin\\win64\\comsol.exe``
    e.g. ``C:\\Program Files\\COMSOL\\COMSOL61\\bin\\win64\\comsol.exe``

    Returns ``(executable_path, install_dir, version)`` or ``None``.
    """
    base_path = Path(base_dir)
    if not base_path.is_dir():
        return None

    # Find COMSOL version directories (e.g. COMSOL61, COMSOL56)
    version_dirs: List[Path] = []
    try:
        for item in base_path.iterdir():
            if item.is_dir() and re.match(r"COMSOL\d+", item.name, re.IGNORECASE):
                version_dirs.append(item)
    except (PermissionError, OSError):
        return None

    # Sort by version number (highest first)
    version_dirs.sort(
        key=lambda x: int(re.search(r"COMSOL(\d+)", x.name, re.IGNORECASE).group(1))
        if re.search(r"COMSOL(\d+)", x.name, re.IGNORECASE) else 0,
        reverse=True,
    )

    for ver_dir in version_dirs:
        for subdir in _COMSOL_BIN_SUBDIRS:
            bin_path = ver_dir / subdir
            if not bin_path.is_dir():
                continue
            for exe_name in _COMSOL_EXECUTABLES:
                exe_path = bin_path / exe_name
                if exe_path.is_file():
                    version = _extract_comsol_version(ver_dir.name)
                    return str(exe_path), str(ver_dir), version or ""

    # Also check if base_dir itself is a version directory
    # (e.g. registry returns the COMSOL61 directory directly)
    dir_name = base_path.name
    if re.match(r"COMSOL\d+", dir_name, re.IGNORECASE):
        for subdir in _COMSOL_BIN_SUBDIRS:
            bin_path = base_path / subdir
            if not bin_path.is_dir():
                continue
            for exe_name in _COMSOL_EXECUTABLES:
                exe_path = bin_path / exe_name
                if exe_path.is_file():
                    version = _extract_comsol_version(dir_name)
                    return str(exe_path), str(base_path), version or ""

    return None


def _extract_comsol_version(dir_name: str) -> Optional[str]:
    """Extract COMSOL version from directory name.

    ``COMSOL61`` → ``6.1``, ``COMSOL562`` → ``5.6.2``
    """
    match = re.search(r"COMSOL(\d+)", dir_name, re.IGNORECASE)
    if match:
        version_num = match.group(1)
        if len(version_num) == 2:
            return f"{version_num[0]}.{version_num[1]}"
        elif len(version_num) == 3:
            return f"{version_num[0]}.{version_num[1]}.{version_num[2]}"
        elif len(version_num) >= 4:
            return f"{version_num[:2]}.{version_num[2]}.{version_num[3:]}"
    return None


def _detect_comsol(engine: EngineInfo) -> EngineInfo:
    """COMSOL detection strategy: registry + multi-drive, C: first.

    COMSOL directory structure (consistent across all drives):
      ``<DRIVE>:\\Program Files\\COMSOL\\COMSOL<version>\\bin\\win64\\comsol.exe``
    """
    # 1. Registry — check multiple possible keys and subkeys
    for reg_key in ["COMSOL\\COMSOL", "COMSOL", "COMSOL AB"]:
        # Direct registry value
        reg_path = _get_from_registry(reg_key)
        if reg_path and os.path.isdir(reg_path):
            result = _detect_comsol_from_base(reg_path)
            if result:
                exe, install_dir, version = result
                return _apply_comsol_result(engine, exe, install_dir, version)
            # Maybe registry returns the version dir directly
            result = _detect_comsol_from_base(
                str(Path(reg_path).parent) if re.match(r"COMSOL\d+", Path(reg_path).name, re.IGNORECASE) else reg_path,
            )
            if result:
                exe, install_dir, version = result
                return _apply_comsol_result(engine, exe, install_dir, version)

        # Enumerate subkeys (for per-version keys like COMSOL61)
        subkey_results = _get_from_registry_subkeys(reg_key)
        for sub_name, sub_path in subkey_results:
            result = _detect_comsol_from_base(sub_path)
            if result:
                exe, install_dir, version = result
                return _apply_comsol_result(engine, exe, install_dir, version)
            # Also try parent directory (registry might return bin/win64 path)
            parent = str(Path(sub_path).parent.parent) if len(Path(sub_path).parts) > 2 else sub_path
            if parent != sub_path:
                result = _detect_comsol_from_base(parent)
                if result:
                    exe, install_dir, version = result
                    return _apply_comsol_result(engine, exe, install_dir, version)

    # 2. Multi-drive search: C: first, then other drives
    for candidate in _build_search_paths("COMSOL"):
        if not os.path.isdir(candidate):
            continue
        result = _detect_comsol_from_base(candidate)
        if result:
            exe, install_dir, version = result
            return _apply_comsol_result(engine, exe, install_dir, version)

    # 3. Fallback: try PATH
    for exe_name in _COMSOL_EXECUTABLES:
        found = shutil.which(exe_name)
        if found:
            engine.executable_path = found
            engine.install_dir = str(Path(found).parent.parent)
            engine.status = "detected"
            return engine

    engine.status = "not_found"
    return engine


def _apply_comsol_result(
    engine: EngineInfo,
    exe_path: str,
    install_dir: str,
    version: str,
) -> EngineInfo:
    """Apply COMSOL detection result to an EngineInfo."""
    engine.executable_path = exe_path
    engine.install_dir = install_dir
    if version:
        engine.version = version
    else:
        ver = _extract_version_from_exe(exe_path)
        if ver:
            engine.version = ver
    engine.status = "detected"
    logger.info(
        "COMSOL detected: version=%s, path=%s",
        engine.version, exe_path,
    )
    return engine


# ──────────────────────────────────────────────────────────────────────────────
# Eclipse / Intersect detection strategy (Schlumberger)
# ──────────────────────────────────────────────────────────────────────────────

# All Schlumberger simulator executable names (lowercase)
# Eclipse family — E100, E300, ECLRUN, FrontSim, Visage, Petrel
_ECLIPSE_EXE_NAMES: set = {
    "eclipse.exe", "eclipse_msmpi.exe",
    "e100.exe", "e100_msmpi.exe",
    "e300.exe", "e300_msmpi.exe",
    "eclrun.exe",
    "frontsim.exe",
    "visage.exe",
    "petrel.exe", "petrel_b.exe",
}
# Intersect family
_INTERSECT_EXE_NAMES: set = {
    "intersect.exe", "ix.exe",
}
# Combined set — used when scanning a Schlumberger install root
# that may contain products from multiple families.
_ALL_SCHLUMBERGER_EXE_NAMES: set = _ECLIPSE_EXE_NAMES | _INTERSECT_EXE_NAMES

# Product identification rules: (exe-name regex, sub-product label)
_ECLIPSE_PRODUCT_RULES = [
    (re.compile(r"^eclipse(_msmpi)?\.exe$", re.I), "ECLIPSE_100"),
    (re.compile(r"^e100(_msmpi)?\.exe$", re.I),    "ECLIPSE_100"),
    (re.compile(r"^e300(_msmpi)?\.exe$", re.I),    "ECLIPSE_300"),
    (re.compile(r"^eclrun\.exe$", re.I),           "ECLRUN"),
    (re.compile(r"^frontsim\.exe$", re.I),         "FRONTSIM"),
    (re.compile(r"^visage\.exe$", re.I),           "VISAGE"),
    (re.compile(r"^petrel(_b)?\.exe$", re.I),      "PETREL"),
]
_INTERSECT_PRODUCT_RULES = [
    (re.compile(r"^intersect\.exe$", re.I),         "INTERSECT"),
    (re.compile(r"^ix\.exe$", re.I),                 "INTERSECT"),
]

# tNavigator executable patterns (used by tNavigator strategy)
_TNAVIGATOR_PATTERNS = ["tnav.exe", "tnavigator.exe", "tnavigator"]

# Schlumberger common install roots (relative to drive, by priority)
_SCHLUMBERGER_FOLDER_NAMES = [
    "ecl", "SLB", "Schlumberger", "Petrel",
]

# Architecture subdirectories within bin/ (Eclipse/Intersect)
# Includes MPI variant dirs used by Intersect (x64_ilmpi, x64_msmpi)
_SCHLUMBERGER_ARCH_DIRS = [
    "pc_x86_64", "pc_x86_64e", "pc_win32",
    "win64", "win32", "x64", "x86_64",
    "x64_ilmpi", "x64_msmpi",  # Intersect MPI variants
    "",  # flat layout (no arch subdir)
]

# Subdirectories to search for executables (relative to version dir)
# Covers all known Schlumberger directory layouts:
#   <version>/bin/<arch>/eclipse.exe          — Eclipse E100/E300
#   <version>/IX/x64_ilmpi/ix.exe              — Intersect (Intel MPI)
#   <version>/IX/x64_msmpi/ix.exe              — Intersect (MS MPI)
#   <version>/Visage/pc_x86_64/visage.exe      — Visage
#   <version>/Petrel.exe                       — Petrel (direct)
#   macros/eclrun.exe                          — ECLRUN launcher
#   macros/compat/eclrun.exe                   — ECLRUN compat
_SCHLUMBERGER_BIN_SUBDIRS = [
    os.path.join("bin"),
    os.path.join("bin", "win64"),
    os.path.join("exe"),
    os.path.join("IX", "bin"),
    os.path.join("IX", "x64_ilmpi"),
    os.path.join("IX", "x64_msmpi"),
    os.path.join("IX"),
    os.path.join("eclipse", "bin"),
    os.path.join("Visage"),
    os.path.join("macros"),
    os.path.join("macros", "compat"),
    "",  # check directly in the version/product dir (e.g. Petrel 2022)
]

# Version pattern: 2022.2, 2024.1, etc.
_SCHLUMBERGER_VERSION_PATTERN = re.compile(r"^(\d{4}\.\d+)$")

# PRT file version extraction pattern
_PRT_VERSION_PATTERN = re.compile(
    r"(?:Schlumberger\s+)?(?:ECLIPSE|E300|INTERSECT|FrontSim|VISAGE)\s+([\d.]+)\s*"
    r"(?:\(Build\s+([\d.]+)\)\s*)?(?:\(?(\d+\s*bit)?\)?)?",
    re.I,
)

# License environment variables (Schlumberger)
_LICENSE_ENV_VARS = [
    "SLBSLS_LICENSE_FILE",
    "SLBSLS_HOME",
    "FLEXLM_LICENSE_FILE",
    "LM_LICENSE_FILE",
    "LSERV_HOST",
    "ECLIPSE_LICENSE_FILE",
]

# Registry uninstall keys (Windows) for Schlumberger products
_REGISTRY_UNINSTALL_KEYS = [
    (winreg.HKEY_LOCAL_MACHINE,
     r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall") if winreg else None,
    (winreg.HKEY_LOCAL_MACHINE,
     r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall") if winreg else None,
    (winreg.HKEY_CURRENT_USER,
     r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall") if winreg else None,
]
_REGISTRY_UNINSTALL_KEYS = [k for k in _REGISTRY_UNINSTALL_KEYS if k is not None]

# Registry name match pattern for Schlumberger products
_REGISTRY_NAME_PATTERN = re.compile(
    r"eclipse|petrel|schlumberger|intersect|frontsim|visage|\becl\b|slb",
    re.I,
)

# Utility/launcher executables that should NOT be matched in PATH search
# (they are not the simulator itself — we want the real simulator exe).
# These are still searched in Layers 2-3 (registry + common paths).
_PATH_SKIP_EXES: set = {
    "eclrun.exe",     # ECLRUN launcher
    "petrel.exe",     # Petrel platform (not a simulator)
    "petrel_b.exe",   # Petrel batch
}

# Minimal smoke-test deck (1x1x1, single-phase gas, ~seconds to run)
_SMOKE_TEST_DECK = """-- Smoke test case (auto-generated by engine detector)
-- 1x1x1 grid, single-phase gas, single producer

RUNSPEC

TITLE
 SMOKE TEST - AUTOGEN /

DIMENS
 1 1 1 /

START
 1 'JAN' 2020 /

METRIC

GAS

WELLDIMS
 1 1 2 1 /


GRID

DX
 1000 /
DY
 1000 /
DZ
 100 /
TOPS
 2000 /

PORO
 0.20 /
PERMX
 100 /
PERMY
 100 /
PERMZ
 10 /
NTG
 1.0 /


PROPS

ROCK
 250 1.0E-5 /

-- Dry gas PVT: P, 1/Bg, visg
PVDG
 1     1.00    0.015
 50    0.020   0.015
 250   0.0040  0.025
 500   0.0020  0.025
 1000  0.0010  0.030 /

DENSITY
 850 1000 0.80 /


SOLUTION

PRESSURE
 250 /


SUMMARY

FPR
FGPR
FGPT


SCHEDULE

WELSPECS
 'P1' 'G1' 1 1 2000 'GAS' /
/

COMPDAT
 'P1' 1 1 1 1 'OPEN' 1* 10 /
/

WCONPROD
 'P1' 'OPEN' 'GRAT' 1* 1* 50000 100 1* 1* /
/

TSTEP
 5 5 5 5 /

END
"""


def _detect_schlumberger(
    engine: EngineInfo,
    exe_names: set,
    product_rules: List[Tuple[re.Pattern, str]],
) -> EngineInfo:
    """Schlumberger detection: 4-layer cascade.

    Layer 1 — Environment variable PATH
    Layer 2 — Windows registry (uninstall keys + vendor keys)
    Layer 3 — Common install paths (multi-drive, C: first)
    Layer 4 — License verification (env vars + lmutil)

    Each layer fills in as much info as possible; later layers
    enrich fields left empty by earlier ones.
    """
    found_exe: Optional[str] = None
    found_version: Optional[str] = None
    found_arch: Optional[str] = None
    found_install_root: Optional[str] = None
    source: str = "unknown"

    # ── Layer 1: PATH environment variable ───────────────────────
    # Skip utility/launcher exes in PATH — we want the real simulator.
    path_env = os.environ.get("PATH", "")
    for p in path_env.split(os.pathsep):
        if not p:
            continue
        try:
            pp = Path(p)
            for exe in pp.glob("*.exe"):
                exe_lower = exe.name.lower()
                if exe_lower in exe_names and exe_lower not in _PATH_SKIP_EXES:
                    found_exe = str(exe)
                    source = "env"
                    found_version, found_install_root, found_arch = (
                        _infer_schlumberger_version_and_root(exe)
                    )
                    break
            if found_exe:
                break
        except (PermissionError, OSError):
            continue

    # ── Layer 2: Windows registry ─────────────────────────────────
    # Skip non-simulator exes in registry too — we want the real
    # simulator, not Petrel platform or ECLRUN launcher.
    if not found_exe:
        reg_exe_names = exe_names - _PATH_SKIP_EXES
        reg_result = _search_registry_for_schlumberger(reg_exe_names)
        if reg_result:
            found_exe, found_version, found_install_root, found_arch = reg_result
            source = "registry"

    # ── Layer 3: Common install paths (multi-drive) ───────────────
    if not found_exe:
        for drive_letter in _get_available_drives():
            drive = f"{drive_letter}:"
            for folder in _SCHLUMBERGER_FOLDER_NAMES:
                candidates = [
                    os.path.join(drive, os.sep, folder),
                    os.path.join(drive, os.sep, "Program Files", folder),
                    os.path.join(drive, os.sep, "Program Files (x86)", folder),
                ]
                for candidate in candidates:
                    if not os.path.isdir(candidate):
                        continue
                    result = _scan_schlumberger_dir(
                        Path(candidate), exe_names,
                    )
                    if result:
                        found_exe, found_version, found_install_root, found_arch = result
                        source = "common_path"
                        break
                if found_exe:
                    break
            if found_exe:
                break

    # ── Apply detection result ────────────────────────────────────
    if found_exe and os.path.isfile(found_exe):
        engine.executable_path = found_exe
        engine.status = "detected"
        if found_version:
            engine.version = found_version
        if found_arch:
            engine.arch = found_arch
        if found_install_root:
            engine.install_dir = found_install_root
        else:
            engine.install_dir = str(Path(found_exe).parent.parent)

        # Identify sub-product (E100/E300/Intersect)
        for pattern, product_label in product_rules:
            if pattern.match(Path(found_exe).name):
                engine.extra_info["sub_product"] = product_label
                break

        # Enrich version from file info if still missing
        if not engine.version:
            ver = _extract_version_from_exe(found_exe)
            if ver:
                engine.version = ver

        # Enrich version from path inference if still missing
        if not engine.version:
            ver, _, _ = _infer_schlumberger_version_and_root(Path(found_exe))
            if ver:
                engine.version = ver

        logger.info(
            "%s detected: version=%s, arch=%s, path=%s, source=%s",
            engine.name, engine.version, engine.arch, found_exe, source,
        )
    else:
        engine.status = "not_found"

    # ── Layer 4: License verification ─────────────────────────────
    _verify_schlumberger_license(engine)

    return engine


def _search_registry_for_schlumberger(
    exe_names: set,
) -> Optional[Tuple[str, Optional[str], Optional[str], Optional[str]]]:
    """Search Windows registry uninstall keys for Schlumberger products.

    Returns ``(exe_path, version, install_root, arch)`` or ``None``.
    """
    if not winreg:
        return None

    for root, subkey in _REGISTRY_UNINSTALL_KEYS:
        try:
            with winreg.OpenKey(root, subkey) as k:
                n_sub = winreg.QueryInfoKey(k)[0]
                for i in range(n_sub):
                    try:
                        subname = winreg.EnumKey(k, i)
                        with winreg.OpenKey(k, subname) as sk:
                            name = _reg_get_value(sk, "DisplayName")
                            if not name or not _REGISTRY_NAME_PATTERN.search(name):
                                continue
                            loc = _reg_get_value(sk, "InstallLocation")
                            ver = _reg_get_value(sk, "DisplayVersion")
                            if loc and os.path.isdir(loc):
                                result = _scan_schlumberger_dir(
                                    Path(loc), exe_names,
                                )
                                if result:
                                    exe_path, _, install_root, arch = result
                                    return exe_path, ver, install_root, arch
                    except OSError:
                        continue
        except OSError:
            continue
    return None


def _scan_schlumberger_dir(
    root: Path,
    exe_names: set,
) -> Optional[Tuple[str, Optional[str], Optional[str], Optional[str]]]:
    """Scan a Schlumberger install directory for simulator executables.

    Uses a two-pass strategy to prioritise primary simulator executables
    (eclipse.exe, e300.exe) over secondary products (visage.exe,
    frontsim.exe, petrel.exe) across ALL version directories.

    Pass 1: scan every version dir for **primary** exes only.
    Pass 2: scan every version dir for **all** exes (fallback).

    Returns ``(exe_path, version, install_root, arch)`` or ``None``.
    """
    if not root.is_dir():
        return None

    # Primary simulator executables — the actual simulators, not
    # platform/utility tools.
    primary_exes = exe_names - _PATH_SKIP_EXES - {
        "visage.exe", "frontsim.exe",
    }

    # Collect version subdirectories (e.g. 2022.2, 2022.3)
    try:
        version_dirs: List[Path] = []
        for item in root.iterdir():
            if item.is_dir() and _SCHLUMBERGER_VERSION_PATTERN.match(item.name):
                version_dirs.append(item)
    except (PermissionError, OSError):
        version_dirs = []

    version_dirs.sort(key=lambda x: x.name, reverse=True)

    # ── Pass 1: primary exes across all version dirs ──────────────
    for ver_dir in version_dirs:
        result = _find_exe_in_version_dir(ver_dir, primary_exes)
        if result:
            exe_path, arch = result
            return exe_path, ver_dir.name, str(ver_dir), arch

    # ── Pass 2: all exes across all version dirs (fallback) ──────
    for ver_dir in version_dirs:
        result = _find_exe_in_version_dir(ver_dir, exe_names)
        if result:
            exe_path, arch = result
            return exe_path, ver_dir.name, str(ver_dir), arch

    # Strategy B: Look directly in root (no version subdir)
    for names in (primary_exes, exe_names):
        result = _find_exe_in_version_dir(root, names)
        if result:
            exe_path, arch = result
            ver, install_root, _ = _infer_schlumberger_version_and_root(
                Path(exe_path),
            )
            return exe_path, ver, install_root, arch

    # Strategy C: Scan one level of subdirectories (for non-version dirs)
    try:
        for sub in root.iterdir():
            if not sub.is_dir():
                continue
            if _SCHLUMBERGER_VERSION_PATTERN.match(sub.name):
                continue
            for names in (primary_exes, exe_names):
                result = _find_exe_in_version_dir(sub, names)
                if result:
                    exe_path, arch = result
                    ver, install_root, _ = _infer_schlumberger_version_and_root(
                        Path(exe_path),
                    )
                    return exe_path, ver, install_root, arch
    except (PermissionError, OSError):
        pass

    return None


def _find_exe_in_version_dir(
    ver_dir: Path,
    exe_names: set,
) -> Optional[Tuple[str, Optional[str]]]:
    """Find a target executable inside a version directory.

    Checks ``bin/<arch>/`` for each known architecture subdir,
    plus flat ``bin/`` and ``exe/`` layouts.

    Returns ``(exe_path, arch)`` or ``None``.
    """
    for bin_subdir in _SCHLUMBERGER_BIN_SUBDIRS:
        bin_path = ver_dir / bin_subdir
        if not bin_path.is_dir():
            continue

        # Check architecture subdirs
        for arch_dir_name in _SCHLUMBERGER_ARCH_DIRS:
            if arch_dir_name:
                arch_path = bin_path / arch_dir_name
            else:
                arch_path = bin_path
            if not arch_path.is_dir():
                continue
            for exe in arch_path.iterdir():
                if exe.is_file() and exe.name.lower() in exe_names:
                    return str(exe), arch_dir_name or ""

        # Also check directly in bin_path (already covered by arch_dir="")
        for exe in bin_path.iterdir():
            if exe.is_file() and exe.name.lower() in exe_names:
                return str(exe), ""

    return None


def _infer_schlumberger_version_and_root(
    exe: Path,
) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """Extract version, install root, and arch from an executable path.

    Typical paths:
      ``C:\\ecl\\2022.2\\bin\\pc_x86_64\\eclipse.exe``
      ``C:\\ecl\\2022.1\\IX\\bin\\intersect.exe``
      ``C:\\Program Files\\Schlumberger\\Petrel 2022.2\\Petrel.exe``
    """
    parts = exe.parts
    version: Optional[str] = None
    install_root: Optional[str] = None
    arch: Optional[str] = None

    # Pattern 1: <root>/<version>/bin/<arch>/exe
    for i, p in enumerate(parts):
        if _SCHLUMBERGER_VERSION_PATTERN.match(p):
            version = _SCHLUMBERGER_VERSION_PATTERN.match(p).group(1)
            install_root = str(Path(*parts[: i + 1]))
            # Look for bin/<arch> after version
            if i + 2 < len(parts) and parts[i + 1].lower() == "bin":
                arch = parts[i + 2]
            break

    # Pattern 2: "Petrel 2022.2" in path
    if version is None:
        for i, p in enumerate(parts):
            m = re.search(r"(\d{4}\.\d+)", p)
            if m and any(
                kw in p.lower()
                for kw in ("petrel", "eclipse", "schlumberger", "ecl", "slb")
            ):
                version = m.group(1)
                install_root = str(Path(*parts[: i + 1]))
                break

    # Pattern 3: generic version number
    if version is None:
        for p in parts:
            m = _SCHLUMBERGER_VERSION_PATTERN.match(p)
            if m:
                version = m.group(1)
                break

    # Normalize install_root path separators
    if install_root:
        install_root = install_root.replace("/", "\\")

    return version, install_root, arch


# ──────────────────────────────────────────────────────────────────────────────
# License verification for Schlumberger engines
# ──────────────────────────────────────────────────────────────────────────────


def _verify_schlumberger_license(engine: EngineInfo) -> None:
    """Multi-dimensional license verification for Schlumberger engines.

    1. Check license environment variables
    2. Find lmutil.exe and run lmstat
    3. (Optional) Run a smoke test — only for ECLIPSE variants
    """
    # 1. Environment variables
    license_env: Dict[str, str] = {}
    for var in _LICENSE_ENV_VARS:
        val = os.environ.get(var, "")
        if val:
            license_env[var] = val

    if license_env:
        # Parse server info from the first env var that has port@host
        for key, val in license_env.items():
            m = re.match(r"(\d+)@([\w.\-]+)", val)
            if m:
                engine.license_server = val
                engine.extra_info["license_port"] = int(m.group(1))
                engine.extra_info["license_host"] = m.group(2)
                engine.extra_info["license_type"] = "network"
                break
            elif "@" in val or val.startswith("28000"):
                engine.license_server = val
                engine.extra_info["license_type"] = "network"
                break
            else:
                engine.license_server = val
                engine.extra_info["license_type"] = "node_locked_or_unknown"

        engine.extra_info["license_env_vars"] = license_env

    # 2. Find lmutil and run lmstat
    lmutil_path = _find_lmutil(engine)
    if lmutil_path:
        engine.lmutil_path = lmutil_path
        if engine.license_server:
            lmstat_summary = _run_lmstat(lmutil_path, engine.license_server)
            if lmstat_summary:
                engine.extra_info["lmstat_summary"] = lmstat_summary

    # 3. Run smoke test for detected Eclipse engines
    if engine.status == "detected":
        _run_smoke_test(engine)

    # 4. Determine overall license status
    # If no license env vars at all → unknown
    # If smoke test passes → ok
    # If smoke test shows license_denied → no_license
    if not license_env and not engine.lmutil_path:
        engine.license_status = "unknown"
    elif engine.license_status != "no_license":
        # Default to unknown until smoke test confirms
        engine.license_status = "unknown"


def _find_lmutil(engine: EngineInfo) -> Optional[str]:
    """Locate lmutil.exe across multiple sources."""
    candidates: List[str] = []

    # 1. PATH
    path_lmutil = shutil.which("lmutil")
    if path_lmutil:
        candidates.append(path_lmutil)

    # 2. Common install locations
    common_paths = [
        r"C:\ecl\home\lmutil.exe",
        r"C:\ecl\macros\lmutil.exe",
        r"C:\Program Files\Schlumberger\lmutil.exe",
        r"C:\Program Files (x86)\Schlumberger\lmutil.exe",
        r"C:\Program Files\FLEXlm\lmutil.exe",
    ]

    # 3. Derive from detected engine install root
    if engine.install_dir:
        install_root = Path(engine.install_dir)
        common_paths.extend([
            str(install_root / "bin" / "lmutil.exe"),
            str(install_root / "home" / "lmutil.exe"),
            str(install_root.parent / "home" / "lmutil.exe"),
        ])

    for c in common_paths:
        if c and os.path.isfile(c):
            candidates.append(c)

    # Deduplicate
    seen: set = set()
    for c in candidates:
        cl = c.lower()
        if cl not in seen:
            seen.add(cl)
            if os.path.isfile(c):
                return c

    return None


def _run_lmstat(lmutil_path: str, license_str: str) -> Optional[str]:
    """Run ``lmutil lmstat -c <license> -a`` and return a summary."""
    try:
        result = subprocess.run(
            [lmutil_path, "lmstat", "-c", license_str, "-a"],
            capture_output=True, text=True, timeout=15,
        )
        output = result.stdout + result.stderr
        # Extract key lines
        summary_lines: List[str] = []
        for line in output.split("\n"):
            if any(
                kw in line.lower()
                for kw in [
                    "server", "license", "feature", "error",
                    "up", "down", "vendor", "daemon", "conn",
                ]
            ):
                summary_lines.append(line.strip())
        return "\n".join(summary_lines[:30]) if summary_lines else output[:1500]
    except subprocess.TimeoutExpired:
        logger.warning("lmutil lmstat query timed out")
    except Exception as e:
        logger.warning("lmutil query failed: %s", e)
    return None


def _run_smoke_test(engine: EngineInfo) -> None:
    """Run a minimal smoke test to verify the engine and license.

    Only runs for ECLIPSE variants (E100/E300). Sets
    ``engine.license_status`` and populates ``engine.extra_info``.
    """
    import tempfile

    sub_product = engine.extra_info.get("sub_product", "")
    # Smoke test only makes sense for Eclipse E100/E300
    if sub_product not in ("ECLIPSE_100", "ECLIPSE_300"):
        return

    exe_path = engine.executable_path
    if not exe_path or not os.path.isfile(exe_path):
        return

    case_name = "SMOKE"
    smoke_result: Dict[str, Any] = {
        "product": sub_product,
        "ok": False,
        "duration_sec": 0.0,
        "error": None,
    }

    # Prepare environment with license vars
    env = os.environ.copy()
    for var in _LICENSE_ENV_VARS:
        val = engine.extra_info.get("license_env_vars", {}).get(var)
        if val and var not in env:
            env[var] = val

    t0 = 0.0
    try:
        with tempfile.TemporaryDirectory(prefix="ecl_smoke_") as td:
            td_path = Path(td)
            (td_path / f"{case_name}.DATA").write_text(
                _SMOKE_TEST_DECK, encoding="utf-8",
            )

            t0 = time.time()
            r = subprocess.run(
                [exe_path, case_name],
                cwd=str(td_path),
                env=env,
                capture_output=True,
                text=True,
                timeout=120,
            )
            smoke_result["duration_sec"] = round(time.time() - t0, 2)
            smoke_result["returncode"] = r.returncode

            # Parse .PRT file
            prt = td_path / f"{case_name}.PRT"
            if prt.exists():
                head = prt.read_text(
                    encoding="latin-1", errors="ignore",
                )[:1500]
                smoke_result["prt_head"] = head

                head_lower = head.lower()
                # Check for license denial
                if any(
                    kw in head_lower
                    for kw in [
                        "no license", "flexlm error",
                        "license error", "cannot get license",
                    ]
                ):
                    smoke_result["error"] = "license_denied"
                    engine.license_status = "no_license"
                else:
                    # Extract version/build from PRT
                    m = _PRT_VERSION_PATTERN.search(head)
                    if m:
                        smoke_result["extracted_version"] = m.group(1)
                        if m.group(2):
                            smoke_result["extracted_build"] = m.group(2)
                            engine.build = m.group(2)
                        if not engine.version:
                            engine.version = m.group(1)

                    # Check error count and ECLEND
                    full_prt = prt.read_text(
                        encoding="latin-1", errors="ignore",
                    )
                    err_match = re.search(
                        r"^\s*Errors?\s+(\d+)\s*$",
                        full_prt, re.MULTILINE | re.IGNORECASE,
                    )
                    error_count = (
                        int(err_match.group(1)) if err_match else None
                    )
                    smoke_result["error_count"] = error_count

                    ecle = td_path / f"{case_name}.ECLEND"
                    if not ecle.exists():
                        smoke_result["error"] = "no_ecle_end"
                        if engine.license_status != "no_license":
                            engine.license_status = "unknown"
                    elif error_count == 0:
                        smoke_result["ok"] = True
                        engine.license_status = "ok"
                    elif error_count and error_count > 0:
                        smoke_result["error"] = f"case_errors_{error_count}"
                        # License works if we got this far
                        if engine.license_status != "no_license":
                            engine.license_status = "ok"
                    else:
                        # Fallback: has ECLEND, no license error → pass
                        smoke_result["ok"] = True
                        engine.license_status = "ok"

                    # List output files
                    smoke_result["outputs"] = sorted(
                        f.name for f in td_path.glob(f"{case_name}.*")
                    )
            else:
                # No PRT → likely license failure
                combined = (r.stdout + r.stderr).lower()
                if "license" in combined:
                    smoke_result["error"] = "license_denied"
                    engine.license_status = "no_license"
                else:
                    smoke_result["error"] = "no_prt_file"
                    if engine.license_status != "no_license":
                        engine.license_status = "unknown"

    except subprocess.TimeoutExpired:
        smoke_result["duration_sec"] = 120.0
        smoke_result["error"] = "timeout"
    except Exception as e:
        smoke_result["error"] = f"exception: {e}"
        smoke_result["duration_sec"] = round(time.time() - t0, 2)

    engine.extra_info["smoke_test"] = smoke_result


def _find_exe_in_dir(
    base_dir: str,
    patterns: List[str],
    subdirs: List[str],
) -> Optional[str]:
    """Search for an executable in base_dir and its subdirectories.

    Checks up to 2 levels deep — **no rglob** for performance.
    """
    base_path = Path(base_dir)
    if not base_path.is_dir():
        return None

    # Check direct directory
    for pattern in patterns:
        if "*" in pattern or "?" in pattern:
            for match in base_path.glob(pattern):
                if match.is_file():
                    return str(match)
        else:
            direct = base_path / pattern
            if direct.is_file():
                return str(direct)

    # Check known subdirectories
    for subdir in subdirs:
        sub_path = base_path / subdir
        if not sub_path.is_dir():
            continue
        for pattern in patterns:
            if "*" in pattern or "?" in pattern:
                for match in sub_path.glob(pattern):
                    if match.is_file():
                        return str(match)
            else:
                direct = sub_path / pattern
                if direct.is_file():
                    return str(direct)

    # Check one level of subdirectories (for version dirs)
    try:
        for sub in base_path.iterdir():
            if not sub.is_dir():
                continue
            for subdir in subdirs:
                sub_path = sub / subdir
                if not sub_path.is_dir():
                    continue
                for pattern in patterns:
                    if "*" in pattern or "?" in pattern:
                        for match in sub_path.glob(pattern):
                            if match.is_file():
                                return str(match)
                    else:
                        direct = sub_path / pattern
                        if direct.is_file():
                            return str(direct)
    except (PermissionError, OSError):
        pass

    return None


# ──────────────────────────────────────────────────────────────────────────────
# Version extraction from executable
# ──────────────────────────────────────────────────────────────────────────────


def _extract_version_from_exe(executable: str) -> Optional[str]:
    """Try to get version info from an executable via CLI."""
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


# ──────────────────────────────────────────────────────────────────────────────
# Per-engine detection dispatch
# ──────────────────────────────────────────────────────────────────────────────

# Registry of detection strategies
_DETECTION_STRATEGIES: Dict[str, Callable[[EngineInfo], EngineInfo]] = {}


def _register_strategy(engine_id: str):
    """Decorator to register a detection strategy for an engine ID."""
    def decorator(func: Callable[[EngineInfo], EngineInfo]):
        _DETECTION_STRATEGIES[engine_id] = func
        return func
    return decorator


@_register_strategy("cmg")
def _strategy_cmg(engine: EngineInfo) -> EngineInfo:
    return _detect_cmg(engine)


@_register_strategy("comsol")
def _strategy_comsol(engine: EngineInfo) -> EngineInfo:
    return _detect_comsol(engine)


@_register_strategy("eclipse")
def _strategy_eclipse(engine: EngineInfo) -> EngineInfo:
    return _detect_schlumberger(engine, _ECLIPSE_EXE_NAMES, _ECLIPSE_PRODUCT_RULES)


@_register_strategy("intersect")
def _strategy_intersect(engine: EngineInfo) -> EngineInfo:
    return _detect_schlumberger(engine, _INTERSECT_EXE_NAMES, _INTERSECT_PRODUCT_RULES)


@_register_strategy("tnavigator")
def _strategy_tnavigator(engine: EngineInfo) -> EngineInfo:
    """tNavigator detection: multi-drive search for Rock Flow Technologies."""
    # 1. Registry
    for reg_key in ["Rock Flow Technologies", "tNavigator", "RFT"]:
        reg_path = _get_from_registry(reg_key)
        if reg_path and os.path.isdir(reg_path):
            found = _find_exe_in_dir(reg_path, _TNAVIGATOR_PATTERNS, ["bin", os.path.join("bin", "win64"), "exe", "bin64"])
            if found:
                engine.executable_path = found
                engine.install_dir = str(Path(found).parent.parent)
                engine.status = "detected"
                ver = _extract_version_from_exe(found)
                if ver:
                    engine.version = ver
                return engine

    # 2. Multi-drive search for Rock Flow Technologies and tNavigator folders
    _tnav_subdirs = ["bin", os.path.join("bin", "win64"), "exe", "bin64"]
    for folder_name in ["Rock Flow Technologies", "tNavigator", "RFT"]:
        for candidate in _build_search_paths(folder_name):
            if not os.path.isdir(candidate):
                continue
            found = _find_exe_in_dir(candidate, _TNAVIGATOR_PATTERNS, _tnav_subdirs)
            if found:
                engine.executable_path = found
                engine.install_dir = str(Path(found).parent.parent)
                engine.status = "detected"
                ver = _extract_version_from_exe(found)
                if ver:
                    engine.version = ver
                logger.info("tNavigator detected: path=%s", found)
                return engine

    # 3. Fallback: try PATH
    for pattern in _TNAVIGATOR_PATTERNS:
        if "*" in pattern or "?" in pattern:
            continue
        found = shutil.which(pattern)
        if found:
            engine.executable_path = found
            engine.install_dir = str(Path(found).parent)
            engine.status = "detected"
            return engine

    engine.status = "not_found"
    return engine


def _detect_generic(engine: EngineInfo) -> EngineInfo:
    """Generic fallback: verify existing path or try PATH lookup."""
    if engine.executable_path and os.path.isfile(engine.executable_path):
        engine.status = "detected"
    elif engine.executable_path:
        engine.status = "not_found"
    else:
        engine.status = "configured"
    return engine


# ──────────────────────────────────────────────────────────────────────────────
# Parallel detection entry point
# ──────────────────────────────────────────────────────────────────────────────


def detect_engines() -> List[EngineInfo]:
    """Auto-detect **all** engines **in parallel**.

    Each engine's detection strategy runs in its own thread via
    ``ThreadPoolExecutor``. Results are written back to JSON files.

    Returns the updated list of all engines (re-read from disk).
    """
    engines = _read_all_engines()
    if not engines:
        return engines

    def _detect_one(engine: EngineInfo) -> EngineInfo:
        """Run detection for a single engine."""
        # Custom engines with user-set path: just verify
        if engine.is_custom and engine.executable_path:
            if os.path.isfile(engine.executable_path):
                engine.status = "detected"
            else:
                engine.status = "not_found"
            return engine

        # Use registered strategy if available
        strategy = _DETECTION_STRATEGIES.get(engine.id)
        if strategy:
            return strategy(engine)

        # Generic fallback
        return _detect_generic(engine)

    # Run all detections in parallel
    with ThreadPoolExecutor(max_workers=4) as executor:
        future_to_id = {
            executor.submit(_detect_one, e): e.id for e in engines
        }
        for future in as_completed(future_to_id):
            engine_id = future_to_id[future]
            try:
                updated = future.result()
                _write_engine(updated)
                logger.info(
                    "Detection complete: %s → status=%s",
                    updated.name, updated.status,
                )
            except Exception as exc:
                logger.error(
                    "Detection failed for '%s': %s", engine_id, exc,
                    exc_info=True,
                )
                # Mark as error
                err_engine = next(
                    (e for e in engines if e.id == engine_id), None,
                )
                if err_engine:
                    err_engine.status = "error"
                    _write_engine(err_engine)

    return _read_all_engines()
