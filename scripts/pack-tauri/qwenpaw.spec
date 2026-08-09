# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for QwenPaw Desktop (Tauri sidecar).

Shared spec for both macOS and Windows. Builds an onedir backend bundle so the
desktop startup can load Python directly without onefile extraction. The same
bundle also includes a qwenpaw CLI executable for the Windows installer PATH
option.
"""

import os
import sys
import importlib.util
from pathlib import Path

from PyInstaller.utils.hooks import (
    collect_data_files,
    collect_submodules,
    copy_metadata,
    get_package_paths,
)

REPO_ROOT = Path(SPECPATH).parent.parent

SRC = REPO_ROOT / "src" / "qwenpaw"
if sys.platform == "darwin":
    codesign_identity = os.environ.get(
        "PYINSTALLER_CODESIGN_IDENTITY"
    ) or os.environ.get("APPLE_SIGNING_IDENTITY")
    if not codesign_identity:
        codesign_identity = None
else:
    codesign_identity = None

def collect_tree(source_dir, target_dir):
    return [
        (str(path), str(Path(target_dir) / path.relative_to(source_dir).parent))
        for path in source_dir.rglob("*")
        if path.is_file()
    ]


_plugin_helper_path = REPO_ROOT / "scripts" / "pack-tauri" / "stage_bundled_plugins.py"
_plugin_helper_spec = importlib.util.spec_from_file_location(
    "qwenpaw_bundled_plugin_stage",
    _plugin_helper_path,
)
if _plugin_helper_spec is None or _plugin_helper_spec.loader is None:
    raise SystemExit(f"cannot load plugin staging helper: {_plugin_helper_path}")
_plugin_helper = importlib.util.module_from_spec(_plugin_helper_spec)
_plugin_helper_spec.loader.exec_module(_plugin_helper)


# Match the legacy desktop package: the FastAPI backend serves the web console
# from qwenpaw/console, so Tauri can navigate to the backend-hosted same-origin
# console after the sidecar is ready.
CONSOLE_DIST = REPO_ROOT / "console" / "dist"
if not (CONSOLE_DIST / "index.html").is_file():
    raise SystemExit(
        f"console dist not found at {CONSOLE_DIST}; "
        "run npm run build:prod in console/ before PyInstaller"
    )

_data_dirs = [
    ("agents/skills", "qwenpaw/agents/skills"),
    ("agents/md_files", "qwenpaw/agents/md_files"),
    ("tokenizer", "qwenpaw/tokenizer"),
    ("security/tool_guard/rules", "qwenpaw/security/tool_guard/rules"),
    ("security/skill_scanner/rules", "qwenpaw/security/skill_scanner/rules"),
    ("security/skill_scanner/data", "qwenpaw/security/skill_scanner/data"),
    ("app/channels/yuanbao/proto", "qwenpaw/app/channels/yuanbao/proto"),
]
datas = [
    (str(SRC / src), dst) for src, dst in _data_dirs if (SRC / src).is_dir()
]
datas += collect_tree(CONSOLE_DIST, "qwenpaw/console")
for _plugin_dir in _plugin_helper.discover_bundled_plugins(REPO_ROOT):
    for _plugin_file in _plugin_helper.iter_runtime_files(_plugin_dir):
        _relative = _plugin_file.relative_to(_plugin_dir)
        datas.append(
            (
                str(_plugin_file),
                str(
                    Path("qwenpaw/plugins_bundle")
                    / _plugin_dir.name
                    / _relative.parent
                ),
            ),
        )
datas.append(
    (
        str(SRC / "browser/control_link/injected/engine.js"),
        "qwenpaw/browser/control_link/injected",
    ),
)

# Include reme package data files (configs, tool yamls, etc.)
datas += collect_data_files("reme")
datas += collect_data_files("whisper")
datas += collect_data_files("agentscope")
datas += collect_data_files(
    "agentscope.tool._builtin._scripts",
    include_py_files=True,
)
datas += collect_data_files(
    "agentscope.workspace._mcp_gateway",
    include_py_files=True,
)

# The Qoder SDK ships a platform-specific qodercli executable. Classify it as
# a binary so PyInstaller preserves executable permissions and signs it with
# the rest of the macOS bundle.
_, _qoder_sdk_dir = get_package_paths("qoder_agent_sdk")
_qoder_cli_name = "qodercli.exe" if sys.platform == "win32" else "qodercli"
_qoder_cli = Path(_qoder_sdk_dir) / "_bundled" / _qoder_cli_name
if not _qoder_cli.is_file():
    raise SystemExit(
        f"Qoder SDK CLI not found at {_qoder_cli}; reinstall qoder-agent-sdk"
    )
qoder_binaries = [
    (str(_qoder_cli), "qoder_agent_sdk/_bundled"),
]

# The official Codex Python SDK depends on a platform wheel that exposes a
# stable bundled_codex_path() API. Preserve its runtime layout because Codex
# resolves sibling hosts and resources relative to the main executable.
_, _codex_bin_dir = get_package_paths("codex_cli_bin")
_codex_bin_dir = Path(_codex_bin_dir)
_codex_executable = (
    "codex.exe" if sys.platform == "win32" else "codex"
)
_codex_cli = _codex_bin_dir / "bin" / _codex_executable
if not _codex_cli.is_file():
    raise SystemExit(
        f"Codex SDK CLI not found at {_codex_cli}; reinstall openai-codex"
    )
codex_binaries = [
    (
        str(path),
        str(Path("codex_cli_bin") / path.relative_to(_codex_bin_dir).parent),
    )
    for directory_name in ("bin", "codex-path", "codex-resources")
    for path in (_codex_bin_dir / directory_name).rglob("*")
    if path.is_file()
]
datas.append(
    (
        str(_codex_bin_dir / "codex-package.json"),
        "codex_cli_bin",
    ),
)

# Collect package metadata for packages that use importlib.metadata at runtime.
# Keep this allowlist in sync when adding runtime dependencies that query
# importlib.metadata, otherwise packaged sidecars may fail only after install.
_metadata_pkgs = [
    "qwenpaw",
    "fastmcp",
    "mcp",
    "httpx",
    "httpcore",
    "anyio",
    "sniffio",
    "starlette",
    "pydantic",
    "pydantic-core",
    "pydantic-settings",
    "uvicorn",
    "openai",
    "anthropic",
    "tiktoken",
    "agentscope",
    "agentscope-runtime",
    "huggingface_hub",
    "modelscope",
    "openai-whisper",
    "openai-codex",
    "openai-codex-cli-bin",
    "qoder-agent-sdk",
]
for _pkg in _metadata_pkgs:
    try:
        datas += copy_metadata(_pkg)
    except Exception:
        pass

a = Analysis(
    [
        str(SRC / "tauri" / "entry.py"),
        str(SRC / "tauri" / "cli_entry.py"),
    ],
    pathex=[str(REPO_ROOT), str(REPO_ROOT / "src")],
    binaries=[*qoder_binaries, *codex_binaries],
    datas=datas,
    hiddenimports=[
        "codex_cli_bin",
        # uvicorn internals (not auto-discovered by PyInstaller)
        "uvicorn.logging",
        "uvicorn.loops",
        "uvicorn.loops.auto",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan",
        "uvicorn.lifespan.on",
        # All CLI sub-commands (dynamically loaded by Click)
        *collect_submodules("qwenpaw.cli"),
        # All channel adapters (imported on-demand at runtime)
        *collect_submodules("qwenpaw.app.channels"),
        # ACP runner support is lazily imported by delegate_external_agent.
        *collect_submodules("qwenpaw.agents.acp"),
        # Built-in MCP server auto-registration (NeqSim, etc.) is imported
        # lazily inside create_driver_service; collect explicitly so the
        # frozen backend finds it without a runtime import failure.
        *collect_submodules("qwenpaw.agents.builtin_mcp"),
        # Petroleum domain libraries pre-installed into the bundled Python
        # runtime. Collect their subpackages so the agent's scripts can
        # import them without runtime discovery failures.
        *collect_submodules("lasio"),
        *collect_submodules("welly"),
        *collect_submodules("bruges"),
        *collect_submodules("simpeg"),
        *collect_submodules("dlisio"),
        *collect_submodules("xtgeo"),
        *collect_submodules("pvtlib"),
        # PawApp SDK modules are imported by installed app plugins at runtime.
        *collect_submodules("qwenpaw.pawapp"),
        # ASGI app entry points
        "qwenpaw.app._app",
        "qwenpaw.app.multi_agent_manager",
        "qwenpaw.app.chats",
        "qwenpaw.app.task_tracker",
        "qwenpaw.runtime.commands",
        # Backup modules are exposed through qwenpaw.backup.__getattr__, which
        # PyInstaller cannot discover from static imports.
        *collect_submodules("qwenpaw.backup"),
        # Third-party packages that use dynamic imports. Use
        # collect_submodules() for packages that load many submodules by name;
        # keep the bare package string when runtime code imports only the
        # package root or when PyInstaller needs the top-level module anchor.
        *collect_submodules("dotenv"),
        "dotenv",
        *collect_submodules("acp"),
        "acp",
        "psutil",
        "multipart",
        "websockets",
        "modelscope",
        "modelscope.hub.api",
        "modelscope.hub.snapshot_download",
        *collect_submodules("agentscope.tool._builtin._scripts"),
        *collect_submodules("agentscope.workspace._mcp_gateway"),
        *collect_submodules("whisper"),
        *collect_submodules("chromadb"),
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)

pyz = PYZ(a.pure)

def script_entry(file_name):
    for item in a.scripts:
        if Path(item[1]).name == file_name:
            return [item]
    raise SystemExit(f"script entry not found: {file_name}")


backend_exe = EXE(
    pyz,
    script_entry("entry.py"),
    [],
    name="qwenpaw-backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    # UPX triggers antivirus false positives and can corrupt binaries.
    upx=False,
    console=False,
    disable_windowed_traceback=True,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=codesign_identity,
    exclude_binaries=True,
)

cli_exe = EXE(
    pyz,
    script_entry("cli_entry.py"),
    [],
    name="qwenpaw",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=codesign_identity,
    exclude_binaries=True,
)

coll = COLLECT(
    backend_exe,
    cli_exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    name="qwenpaw-backend",
)
