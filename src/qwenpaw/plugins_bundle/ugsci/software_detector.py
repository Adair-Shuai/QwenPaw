# -*- coding: utf-8 -*-
"""Local software detection for oil & gas simulation tools.

Scans the host system for installed reservoir simulation and petroleum
engineering software (CMG, Eclipse, Petrel, tNavigator, Intersect, etc.),
reports executable paths and versions, and produces a concise capability
summary that the agent can use to invoke the software.

Design principles
-----------------
1. **Non-intrusive** -?only *reads* the filesystem; never launches software.
2. **Cross-platform** -?checks Windows, Linux and macOS standard paths.
3. **Extensible** -?``KNOWN_SOFTWARE`` is a plain list; add entries freely.
4. **Cached** -?results are cached in-process and can be refreshed on demand.
"""

from __future__ import annotations

import logging
import os
import platform
import re
import shutil
import subprocess
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

try:
    import winreg
except ImportError:
    winreg = None

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.detector")

# ──────────────────────────────────────────────────────────────────────────────
# Data models
# ──────────────────────────────────────────────────────────────────────────────


@dataclass
class SoftwareInfo:
    """Detected software installation record."""

    id: str
    name: str
    category: str
    vendor: str
    version: Optional[str] = None
    executable_path: Optional[str] = None
    install_dir: Optional[str] = None
    license_server: Optional[str] = None
    status: str = "not_found"  # found | not_found | error
    description: str = ""
    # Hints for the agent on how to invoke the software
    invocation_hint: str = ""
    extra_paths: List[str] = field(default_factory=list)


@dataclass
class DetectionResult:
    """Result of a detection scan."""

    platform: str
    software_list: List[SoftwareInfo]
    custom_scan_paths: List[str]
    summary: str = ""


# ──────────────────────────────────────────────────────────────────────────────
# Known software registry
# ──────────────────────────────────────────────────────────────────────────────

# Each entry defines how to find the software on the system.
# ``patterns`` are filename patterns (case-insensitive glob) to look for in
# ``search_dirs``.  ``version_args`` is the CLI flag to get version output.

KNOWN_SOFTWARE: List[Dict] = [
    # ── CMG Suite ────────────────────────────────────────────────────────
    {
        "id": "cmg_builder",
        "name": "CMG Builder",
        "category": "reservoir_simulation",
        "vendor": "CMG",
        "description": "Computer Modelling Group -?reservoir simulation pre-processor",
        "patterns": ["builder.exe", "builder"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "Use Builder to create/edit simulation models. "
        "Launch the GUI or run in batch mode with project files (.dat).",
    },
    {
        "id": "cmg_imex",
        "name": "CMG IMEX",
        "category": "reservoir_simulation",
        "vendor": "CMG",
        "description": "CMG IMEX -?black oil reservoir simulator",
        "patterns": ["imex.exe", "imex", "mx2100.exe", "mx2300.exe"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "IMEX is a black-oil simulator. "
        "Run: <imex_path> -f <model.dat> -o <output.out>",
    },
    {
        "id": "cmg_gem",
        "name": "CMG GEM",
        "category": "reservoir_simulation",
        "vendor": "CMG",
        "description": "CMG GEM -?compositional reservoir simulator",
        "patterns": ["gem.exe", "gem", "gm2100.exe", "gm2300.exe"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "GEM is a compositional simulator. "
        "Run: <gem_path> -f <model.dat> -o <output.out>",
    },
    {
        "id": "cmg_stars",
        "name": "CMG STARS",
        "category": "reservoir_simulation",
        "vendor": "CMG",
        "description": "CMG STARS -?thermal and advanced processes simulator",
        "patterns": ["stars.exe", "stars", "st2100.exe", "st2300.exe"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "STARS is a thermal/compositional simulator. "
        "Run: <stars_path> -f <model.dat> -o <output.out>",
    },
    # ── Schlumberger Eclipse / Intersect ─────────────────────────────────
    {
        "id": "eclipse",
        "name": "Eclipse",
        "category": "reservoir_simulation",
        "vendor": "Schlumberger",
        "description": "Schlumberger Eclipse -?industry-standard reservoir simulator",
        "patterns": ["eclipse.exe", "e100.exe", "e300.exe", "eclipse"],
        "subdirs": ["bin", "exe", "eclipse/2024.1/bin", "eclipse/2023.2/bin"],
        "version_args": ["--version"],
        "invocation_hint": "Eclipse is a finite-difference reservoir simulator. "
        "Run: <eclipse_path> <model.DATA> to execute a simulation.",
    },
    {
        "id": "intersect",
        "name": "Intersect",
        "category": "reservoir_simulation",
        "vendor": "Schlumberger",
        "description": "Schlumberger Intersect -?next-generation reservoir simulator",
        "patterns": ["intersect.exe", "intersect"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "Intersect is a high-performance reservoir simulator. "
        "Run: <intersect_path> <model.DATA>",
    },
    # ── Petrel ────────────────────────────────────────────────────────────
    {
        "id": "petrel",
        "name": "Petrel",
        "category": "geological_modeling",
        "vendor": "Schlumberger",
        "description": "Schlumberger Petrel -?integrated E&P platform",
        "patterns": ["petrel.exe", "petrel"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "Petrel is used for geological modeling and reservoir "
        "engineering. Can be automated via Ocean API or Python toolkit.",
    },
    # ── tNavigator ────────────────────────────────────────────────────────
    {
        "id": "tnavigator",
        "name": "tNavigator",
        "category": "reservoir_simulation",
        "vendor": "Rock Flow Technologies",
        "description": "tNavigator -?parallel reservoir simulator",
        "patterns": ["tnav.exe", "tnavigator.exe", "tnavigator"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "tNavigator supports parallel reservoir simulation. "
        "Run: <tnav_path> <model.DATA>",
    },
    # ── Techlog ───────────────────────────────────────────────────────────
    {
        "id": "techlog",
        "name": "Techlog",
        "category": "well_log_analysis",
        "vendor": "Schlumberger",
        "description": "Schlumberger Techlog -?wellbore data analysis platform",
        "patterns": ["techlog.exe", "techlog"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "Techlog is used for well log analysis and petrophysics. "
        "Can be automated via Python API.",
    },
    # ── PIPESIM ───────────────────────────────────────────────────────────
    {
        "id": "pipesim",
        "name": "PIPESIM",
        "category": "production_engineering",
        "vendor": "Schlumberger",
        "description": "Schlumberger PIPESIM -?steady-state multiphase flow simulator",
        "patterns": ["pipesim.exe", "pipesim"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "PIPESIM is used for production network modeling. "
        "Can be automated via Python API.",
    },
    # ── OFM ───────────────────────────────────────────────────────────────
    {
        "id": "ofm",
        "name": "OFM",
        "category": "production_engineering",
        "vendor": "Schlumberger",
        "description": "Schlumberger OFM -?oilfield manager for production data analysis",
        "patterns": ["ofm.exe", "ofm"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "OFM is used for production data analysis and forecasting.",
    },
    # ── CMG Results ───────────────────────────────────────────────────────
    {
        "id": "cmg_results",
        "name": "CMG Results",
        "category": "post_processing",
        "vendor": "CMG",
        "description": "CMG Results -?post-processing and visualization",
        "patterns": ["results.exe", "results"],
        "subdirs": ["bin", "exe"],
        "version_args": ["--version"],
        "invocation_hint": "Results is used for simulation result visualization.",
    },
    # ── COMSOL Multiphysics ───────────────────────────────────────────────
    {
        "id": "comsol",
        "name": "COMSOL Multiphysics",
        "category": "multiphysics",
        "vendor": "COMSOL Inc.",
        "description": "COMSOL Multiphysics -?multiphysics simulation platform",
        "patterns": ["comsol.exe", "comsolbatch.exe", "comsolmphserver.exe", "comsol"],
        "subdirs": ["bin", "bin\\win64", "bin\\wine64", "exe"],
        "version_args": ["-version"],
        "invocation_hint": "COMSOL can be run in batch mode: "
        "comsolbatch -input <model.mph> -output <result.mph>. "
        "Or start the GUI by running: comsol.exe",
    },
]


# ──────────────────────────────────────────────────────────────────────────────
# Platform-specific search paths
# ──────────────────────────────────────────────────────────────────────────────


def _get_comsol_from_registry() -> Optional[str]:
    """Check Windows registry for COMSOL installation path."""
    if platform.system().lower() != "windows" or not winreg:
        return None

    # COMSOL registry keys to check
    registry_paths = [
        (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\COMSOL\COMSOL"),
        (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\COMSOL\COMSOL"),
        (winreg.HKEY_CURRENT_USER, r"SOFTWARE\COMSOL\COMSOL"),
    ]

    try:
        for hkey, reg_path in registry_paths:
            try:
                with winreg.OpenKey(hkey, reg_path) as key:
                    try:
                        # Try different possible value names
                        value_names = ["COMSOLROOT", "InstallDir", "Location", ""]
                        for value_name in value_names:
                            try:
                                install_path, _ = winreg.QueryValueEx(key, value_name)
                                if install_path and os.path.exists(install_path):
                                    return install_path
                            except WindowsError:
                                continue
                    except WindowsError:
                        pass
            except WindowsError:
                continue
    except Exception as e:
        logger.debug(f"Error reading COMSOL registry: {e}")

    return None


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

    # Sort by version number (COMSOL61 > COMSOL56)
    version_dirs.sort(key=lambda x: re.search(r"COMSOL(\d+)", x).group(1) if re.search(r"COMSOL(\d+)", x) else "0", reverse=True)
    return version_dirs


def _get_default_search_dirs() -> List[str]:
    """Return platform-appropriate search directories."""
    system = platform.system().lower()
    dirs: List[str] = []

    if system == "windows":
        # Common Windows install locations
        program_files = os.environ.get("PROGRAMFILES", "C:\\Program Files")
        program_files_x86 = os.environ.get(
            "PROGRAMFILES(X86)", "C:\\Program Files (x86)",
        )
        local_appdata = os.environ.get("LOCALAPPDATA", "")
        dirs.extend(
            [
                program_files,
                program_files_x86,
                # CMG
                os.path.join(program_files, "CMG"),
                os.path.join(program_files, "Schlumberger"),
                os.path.join(program_files_x86, "Schlumberger"),
                os.path.join(program_files, "Rock Flow Technologies"),
                "C:\\CMG",
                "C:\\Schlumberger",
                "D:\\CMG",
                "D:\\Schlumberger",
                "D:\\Program Files\\CMG",
                "D:\\Program Files\\Schlumberger",
                # COMSOL common install paths
                os.path.join(program_files, "COMSOL"),
                os.path.join(program_files_x86, "COMSOL"),
                "C:\\Program Files\\COMSOL",
                "C:\\COMSOL",
                "D:\\Program Files\\COMSOL",
                "D:\\COMSOL",
            ],
        )
        if local_appdata:
            dirs.append(os.path.join(local_appdata, "Programs"))

    elif system == "linux":
        dirs.extend(
            [
                "/opt",
                "/opt/CMG",
                "/opt/Schlumberger",
                "/opt/Rock Flow Technologies",
                "/usr/local",
                os.path.expanduser("~/CMG"),
                os.path.expanduser("~/Schlumberger"),
            ],
        )

    elif system == "darwin":  # macOS
        dirs.extend(
            [
                "/Applications",
                os.path.expanduser("~/Applications"),
                "/opt/CMG",
                "/opt/Schlumberger",
            ],
        )

    return [d for d in dirs if d and os.path.isdir(d)]


# ──────────────────────────────────────────────────────────────────────────────
# Detection logic
# ──────────────────────────────────────────────────────────────────────────────


def _find_executable(
    patterns: List[str],
    search_dirs: List[str],
    subdirs: List[str],
    software_id: str = "",
) -> Optional[Path]:
    """Search for an executable matching any pattern."""

    # Special fast path for COMSOL - check registry first
    if software_id == "comsol":
        comsol_path = _get_comsol_from_registry()
        if comsol_path:
            # Check version directories under registry path
            version_dirs = _get_comsol_version_dirs(comsol_path)
            for version_dir in version_dirs:
                for subdir in subdirs:
                    bin_path = Path(version_dir) / subdir
                    if not bin_path.is_dir():
                        continue
                    for pattern in patterns:
                        for match in bin_path.glob("*"):
                            if match.name.lower() == pattern.lower():
                                if match.is_file():
                                    return match

    # Standard search logic
    for base_dir in search_dirs:
        base_path = Path(base_dir)
        # Search directly in base dir
        for pattern in patterns:
            # Case-insensitive glob
            for match in base_path.glob("*"):
                if match.name.lower() == pattern.lower():
                    if match.is_file():
                        return match

        # Search in subdirs
        for subdir in subdirs:
            search_path = base_path / subdir
            if not search_path.is_dir():
                continue
            for pattern in patterns:
                for match in search_path.glob("*"):
                    if match.name.lower() == pattern.lower():
                        if match.is_file():
                            return match

            # Also try recursive search in subdir (max depth 2)
            try:
                for match in search_path.rglob("*"):
                    if match.name.lower() == pattern.lower():
                        if match.is_file():
                            return match
            except (PermissionError, OSError):
                continue

    return None


def _extract_version(
    executable: Path,
    version_args: List[str],
) -> Optional[str]:
    """Try to get version info from the executable."""
    try:
        result = subprocess.run(
            [str(executable)] + version_args,
            capture_output=True,
            text=True,
            timeout=10,
            shell=False,
        )
        output = (result.stdout + result.stderr).strip()
        if output:
            # Try to find a version-like pattern (x.y.z or YYYY.x)
            version_patterns = [
                r"(\d+\.\d+\.\d+)",
                r"(\d{4}\.\d+)",
                r"(\d+\.\d+)",
                r"version[:\s]+([^\s,]+)",
                r"v(\d+\.\d+)",
            ]
            for vp in version_patterns:
                m = re.search(vp, output, re.IGNORECASE)
                if m:
                    return m.group(1)
            # Return first 100 chars if no pattern matched
            return output[:100] if len(output) > 100 else output
    except (
        subprocess.TimeoutExpired,
        subprocess.SubprocessError,
        OSError,
        PermissionError,
    ):
        pass
    return None


def _guess_version_from_path(path: Path) -> Optional[str]:
    """Try to extract a version number from the installation path."""
    parts = path.parts
    for part in parts:
        # Match patterns like "2024.1", "2023.2", "v2024", "2024R1"
        m = re.search(r"(20\d{2}[.\-]?\d?|v?20\d{2}[a-zA-Z]?\d?)", part)
        if m:
            return m.group(1)
    return None


def _extract_comsol_version(install_dir: str) -> Optional[str]:
    """Extract COMSOL version from install directory name."""
    dir_name = os.path.basename(install_dir)

    # COMSOL version patterns: COMSOL61, COMSOL56, COMSOL56Multiphysics, etc.
    match = re.search(r"COMSOL(\d+)", dir_name, re.IGNORECASE)
    if match:
        version_num = match.group(1)
        if len(version_num) >= 2:
            major = version_num[:2]
            minor = version_num[2:] if len(version_num) > 2 else "0"
            return f"{major}.{minor}"

    return None


def _get_install_dir(executable: Path) -> str:
    """Get the installation directory from an executable path."""
    parent = executable.parent
    # If parent is 'bin' or 'exe', go one level up
    if parent.name.lower() in ("bin", "exe"):
        return str(parent.parent)
    return str(parent)


def detect_software(
    custom_paths: Optional[List[str]] = None,
) -> DetectionResult:
    """Scan the system for known oil & gas software.

    Args:
        custom_paths: Additional directories to search (user-provided).

    Returns:
        DetectionResult with all found and not-found software.
    """
    system = platform.system()
    search_dirs = _get_default_search_dirs()

    if custom_paths:
        for p in custom_paths:
            if p and os.path.isdir(p):
                search_dirs.append(p)

    # Deduplicate
    seen = set()
    unique_dirs: List[str] = []
    for d in search_dirs:
        norm = os.path.normpath(d)
        if norm not in seen:
            seen.add(norm)
            unique_dirs.append(d)

    software_list: List[SoftwareInfo] = []
    found_count = 0

    for sw_def in KNOWN_SOFTWARE:
        sw = SoftwareInfo(
            id=sw_def["id"],
            name=sw_def["name"],
            category=sw_def["category"],
            vendor=sw_def["vendor"],
            description=sw_def.get("description", ""),
            invocation_hint=sw_def.get("invocation_hint", ""),
        )

        try:
            executable = _find_executable(
                sw_def["patterns"],
                unique_dirs,
                sw_def.get("subdirs", []),
                sw_def["id"],
            )

            if executable:
                sw.executable_path = str(executable)
                sw.install_dir = _get_install_dir(executable)
                sw.version = _extract_version(
                    executable, sw_def.get("version_args", ["--version"]),
                )
                if not sw.version:
                    sw.version = _guess_version_from_path(executable)

                # Special COMSOL version extraction from path
                if sw.id == "comsol" and sw.install_dir:
                    comsol_version = _extract_comsol_version(sw.install_dir)
                    if comsol_version:
                        sw.version = comsol_version
                sw.status = "found"
                found_count += 1
            else:
                sw.status = "not_found"

        except Exception as exc:
            logger.warning(
                "Error detecting %s: %s", sw_def["name"], exc,
            )
            sw.status = "error"

        software_list.append(sw)

    # Build summary
    categories = {}
    for sw in software_list:
        if sw.status == "found":
            categories.setdefault(sw.category, []).append(sw.name)

    summary_parts = [f"Found {found_count}/{len(software_list)} software"]
    if categories:
        summary_parts.append(
            ", ".join(
                f"{cat}: {', '.join(names)}"
                for cat, names in categories.items()
            ),
        )
    summary = " | ".join(summary_parts)

    return DetectionResult(
        platform=system,
        software_list=software_list,
        custom_scan_paths=custom_paths or [],
        summary=summary,
    )


def to_dict(result: DetectionResult) -> Dict:
    """Convert DetectionResult to a JSON-serialisable dict."""
    return {
        "platform": result.platform,
        "software_list": [asdict(sw) for sw in result.software_list],
        "custom_scan_paths": result.custom_scan_paths,
        "summary": result.summary,
    }


# ──────────────────────────────────────────────────────────────────────────────
# Agent-facing capability summary
# ──────────────────────────────────────────────────────────────────────────────


def build_capability_summary(result: DetectionResult) -> str:
    """Build a concise text summary for injection into agent system prompt.

    This gives the agent a quick overview of what software is available
    on the host and how to invoke it.
    """
    found = [sw for sw in result.software_list if sw.status == "found"]
    if not found:
        return "No reservoir simulation software detected on this host."

    lines = [
        f"## Local Software Detected ({result.platform})",
        "",
        "The following oil & gas simulation software is installed on this host:",
        "",
    ]

    for sw in found:
        lines.append(f"### {sw.name} ({sw.vendor})")
        if sw.version:
            lines.append(f"- **Version**: {sw.version}")
        lines.append(f"- **Path**: `{sw.executable_path}`")
        lines.append(f"- **Category**: {sw.category}")
        if sw.invocation_hint:
            lines.append(f"- **Usage**: {sw.invocation_hint}")
        lines.append("")

    lines.append(
        "Use the paths above to invoke the software from scripts or "
        "commands. Always verify the executable path before running.",
    )

    return "\n".join(lines)
