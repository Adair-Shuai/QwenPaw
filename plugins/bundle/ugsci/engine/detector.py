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
                str(Path(reg_path).parent) if re.match(r"COMSOL\d+", Path(reg_path).name, re.IGNORECASE) else reg_path
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

_ECLIPSE_PATTERNS = ["eclipse.exe", "e100.exe", "e300.exe", "eclipse"]
_INTERSECT_PATTERNS = ["intersect.exe", "intersect"]
_TNAVIGATOR_PATTERNS = ["tnav.exe", "tnavigator.exe", "tnavigator"]

# Schlumberger subdirectories
_SCHLUMBERGER_SUBDIRS = [
    "bin", os.path.join("bin", "win64"), "exe",
    os.path.join("eclipse", "2024.1", "bin"),
    os.path.join("eclipse", "2023.2", "bin"),
]


def _detect_schlumberger(
    engine: EngineInfo,
    patterns: List[str],
    folder_name: str,
) -> EngineInfo:
    """Schlumberger detection: registry + multi-drive.

    Eclipse/Intersect structure:
      ``<DRIVE>:\\Program Files\\Schlumberger\\<product>\\<version>\\bin\\*.exe``
    or ``<DRIVE>:\\Schlumberger\\<product>\\bin\\*.exe``
    """
    # 1. Registry
    reg_path = _get_from_registry(folder_name)
    if reg_path and os.path.isdir(reg_path):
        found = _find_exe_in_dir(reg_path, patterns, _SCHLUMBERGER_SUBDIRS)
        if found:
            engine.executable_path = found
            engine.install_dir = str(Path(found).parent.parent)
            engine.status = "detected"
            ver = _extract_version_from_exe(found)
            if ver:
                engine.version = ver
            return engine

    # 2. Multi-drive search
    for candidate in _build_search_paths(folder_name):
        if not os.path.isdir(candidate):
            continue
        found = _find_exe_in_dir(candidate, patterns, _SCHLUMBERGER_SUBDIRS)
        if found:
            engine.executable_path = found
            engine.install_dir = str(Path(found).parent.parent)
            engine.status = "detected"
            ver = _extract_version_from_exe(found)
            if ver:
                engine.version = ver
            logger.info(
                "%s detected: path=%s", engine.name, found,
            )
            return engine

    # 3. Fallback: try PATH
    for pattern in patterns:
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
    return _detect_schlumberger(engine, _ECLIPSE_PATTERNS, "Schlumberger")


@_register_strategy("intersect")
def _strategy_intersect(engine: EngineInfo) -> EngineInfo:
    return _detect_schlumberger(engine, _INTERSECT_PATTERNS, "Schlumberger")


@_register_strategy("tnavigator")
def _strategy_tnavigator(engine: EngineInfo) -> EngineInfo:
    """tNavigator detection: multi-drive search for Rock Flow Technologies."""
    # 1. Registry
    for reg_key in ["Rock Flow Technologies", "tNavigator", "RFT"]:
        reg_path = _get_from_registry(reg_key)
        if reg_path and os.path.isdir(reg_path):
            found = _find_exe_in_dir(reg_path, _TNAVIGATOR_PATTERNS, _SCHLUMBERGER_SUBDIRS)
            if found:
                engine.executable_path = found
                engine.install_dir = str(Path(found).parent.parent)
                engine.status = "detected"
                ver = _extract_version_from_exe(found)
                if ver:
                    engine.version = ver
                return engine

    # 2. Multi-drive search for Rock Flow Technologies and tNavigator folders
    for folder_name in ["Rock Flow Technologies", "tNavigator", "RFT"]:
        for candidate in _build_search_paths(folder_name):
            if not os.path.isdir(candidate):
                continue
            found = _find_exe_in_dir(candidate, _TNAVIGATOR_PATTERNS, _SCHLUMBERGER_SUBDIRS)
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
                    (e for e in engines if e.id == engine_id), None
                )
                if err_engine:
                    err_engine.status = "error"
                    _write_engine(err_engine)

    return _read_all_engines()
