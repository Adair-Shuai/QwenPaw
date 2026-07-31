# -*- coding: utf-8 -*-
"""Engine manager — data model, persistence, and CRUD operations.

This module is responsible for:
- The ``EngineInfo`` dataclass
- Default engine definitions
- JSON file-per-engine persistence
- CRUD operations (list / get / add / update / delete)
- Agent-facing capability summary

Detection logic lives in ``engine/detector.py``.
"""
from __future__ import annotations

import json
import logging
import os
import re
import shutil
import uuid
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.engine")

# Plugin source directory — used only for legacy migration reference.
PLUGIN_DIR = Path(__file__).resolve().parent.parent  # plugins/bundle/ugsci/

# Legacy engine-config location inside the plugin installation directory.
# Kept as a module-level constant so tests can monkeypatch it.
_LEGACY_ENGINES_DIR = PLUGIN_DIR / "engines"


def _resolve_engines_dir() -> Path:
    """Resolve the engine config directory under ``WORKING_DIR``.

    Engine configs are stored in ``QWENPAW_WORKING_DIR/ugsci/engines``
    so they survive plugin upgrades (cf. BUG-009).  Previously they
    lived inside the plugin installation directory and were deleted
    whenever the bundled plugin was updated via ``shutil.rmtree``.
    """
    try:
        from qwenpaw.constant import WORKING_DIR

        base = Path(WORKING_DIR)
    except Exception:
        base = Path.home() / ".qwenpaw"
    return base / "ugsci" / "engines"


# Module-level for backward compatibility — tests monkeypatch this.
ENGINES_DIR = _resolve_engines_dir()


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
    # ── Schlumberger-specific fields (Eclipse / Intersect) ──────────
    # Architecture subdir (e.g. pc_x86_64, pc_x86_64e, pc_win32)
    arch: str = ""
    # Build number extracted from PRT or file version info
    build: str = ""
    # License verification status: ok | no_license | unknown | ""
    license_status: str = ""
    # lmutil.exe path (if found)
    lmutil_path: str = ""
    # Extra metadata dict (smoke test results, lmstat summary, etc.)
    extra_info: Dict[str, Any] = field(default_factory=dict)


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
        "invocation_hint": "IMEX: mx2300.exe -f <model.dat> -o <output.out>\n"
        "GEM: gm2300.exe -f <model.dat> -o <output.out>\n"
        "STARS: st2300.exe -f <model.dat> -o <output.out>\n"
        "注意: CMG 使用 -f 指定输入文件, -o 指定输出文件。",
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
        "invocation_hint": "eclipse.exe <case_name>  (不带 .DATA 后缀!)\n"
        "例如: e300.exe BAI6_E300  (而非 BAI6_E300.DATA)\n"
        "模拟器会自动查找 <case_name>.DATA 文件。",
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
        "invocation_hint": "intersect.exe <case_name>  (不带 .DATA 后缀)",
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
        "invocation_hint": "comsolbatch.exe -input <model.mph> -output <result.mph>\n"
        "批处理模式运行, 不启动 GUI。",
        "license_server": "",
        "extra_paths": [],
        "status": "configured",
        "is_default": True,
        "is_custom": False,
    },
    {
        "id": "tnavigator",
        "name": "tNavigator",
        "vendor": "Rock Flow Technologies",
        "version": "",
        "executable_path": "",
        "install_dir": "",
        "category": "reservoir_simulation",
        "description": "tNavigator 高性能并行油藏模拟器",
        "invocation_hint": "tnav.exe <model.DATA>  (需要完整文件名)",
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
    """Write an engine record to its JSON file.

    Uses a temporary file plus ``os.replace()`` so that an interrupted
    write never leaves a partially-written (and thus corrupt) JSON
    file that ``_read_all_engines()`` would silently skip.
    """
    path = _engine_file_path(engine.id)
    data = asdict(engine)
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    try:
        tmp.write_text(payload, encoding="utf-8")
        os.replace(tmp, path)
    finally:
        try:
            tmp.unlink(missing_ok=True)
        except OSError:
            logger.debug("Failed to remove engine temp file %s", tmp)
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


def _migrate_legacy_engines() -> int:
    """Migrate engine configs from the old plugin-dir location.

    Copies JSON files from ``_LEGACY_ENGINES_DIR`` (inside the plugin
    installation directory) to the current ``ENGINES_DIR``
    (``WORKING_DIR/ugsci/engines``).  Only copies files that don't
    already exist in the new location, so user modifications are
    never overwritten.

    Returns the count of migrated files.
    """
    legacy_dir = _LEGACY_ENGINES_DIR
    if not legacy_dir.is_dir():
        return 0

    new_dir = _ensure_engines_dir()
    count = 0
    for f in sorted(legacy_dir.glob("*.json")):
        target = new_dir / f.name
        if target.exists():
            continue  # Don't overwrite existing configs
        try:
            shutil.copy2(f, target)
            count += 1
            logger.info("Migrated engine config: %s", f.name)
        except Exception as exc:
            logger.warning("Failed to migrate engine %s: %s", f, exc)

    if count:
        logger.info(
            "Migrated %d engine config(s) from %s to %s",
            count, legacy_dir, new_dir,
        )
    return count


def init_default_engines() -> int:
    """Ensure default engine JSON files exist. Returns count created.

    Also performs a one-time migration from the legacy plugin-dir
    location so existing user configs are preserved across the
    transition to ``WORKING_DIR``-based storage (BUG-009).
    """
    _migrate_legacy_engines()
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
# CRUD operations
# ──────────────────────────────────────────────────────────────────────────────


def list_engines() -> List[EngineInfo]:
    """Return all registered engines."""
    return _read_all_engines()


def get_engine(engine_id: str) -> Optional[EngineInfo]:
    """Return a single engine by ID."""
    return _read_engine(engine_id)


def add_engine(data: Dict[str, Any]) -> EngineInfo:
    """Add a new custom engine."""
    engine_id = data.get("id", "").strip()
    name = data.get("name", "").strip()
    if not name:
        raise ValueError("Engine name is required")

    if not engine_id:
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

    if engine.executable_path and os.path.isfile(engine.executable_path):
        engine.status = "detected"
        engine.install_dir = str(Path(engine.executable_path).parent)

    _write_engine(engine)
    logger.info("Added custom engine: %s (%s)", engine.name, engine.id)
    return engine


def update_engine(engine_id: str, data: Dict[str, Any]) -> EngineInfo:
    """Update an existing engine. Returns the updated engine."""
    engine = _read_engine(engine_id)
    if engine is None:
        raise ValueError(f"Engine '{engine_id}' not found")

    for key in [
        "name", "vendor", "version", "executable_path", "install_dir",
        "category", "description", "invocation_hint", "license_server",
        "extra_paths", "modules", "module_paths",
        "arch", "build", "license_status", "lmutil_path", "extra_info",
    ]:
        if key in data:
            setattr(engine, key, data[key])

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
    """Build a concise text summary for agent system-prompt injection.

    The summary is structured so the agent can quickly determine:
    - Which engines are **ready** (detected) and how to invoke them.
    - Which engines are **configured** but not yet detected.
    """
    if not engines:
        return ""

    detected = [
        e for e in engines
        if e.status == "detected" and e.executable_path
    ]
    configured = [
        e for e in engines
        if e.status != "detected"
        and not e.is_custom
    ]
    # Custom engines that are configured but not verified
    custom_pending = [
        e for e in engines
        if e.status != "detected"
        and e.is_custom
    ]

    if not detected and not configured and not custom_pending:
        return ""

    lines: List[str] = ["## 可用计算引擎", ""]

    # ── Ready engines ──────────────────────────────────────────────
    if detected:
        lines.append("以下引擎已检测到并可直接调用：")
        lines.append("")
        for e in detected:
            parts: List[str] = []
            if e.version:
                parts.append(f"v{e.version}")
            if e.modules:
                parts.append(f"模块: {', '.join(e.modules)}")
            if e.license_status == "ok":
                parts.append("许可证正常")
            elif e.license_status == "no_license":
                parts.append("许可证不可用")
            info = f" ({', '.join(parts)})" if parts else ""
            lines.append(f"- **{e.name}**{info}")
            if e.invocation_hint:
                lines.append(f"  调用: {e.invocation_hint}")
        lines.append("")

    # ── Configured but not detected ───────────────────────────────
    if configured:
        names = ", ".join(e.name for e in configured)
        lines.append(
            f"已配置但尚未检测到安装: {names}。"
            "可通过 /api/ugsci/engines/detect 触发自动检测。"
        )
        lines.append("")

    if custom_pending:
        names = ", ".join(e.name for e in custom_pending)
        lines.append(
            f"自定义引擎待验证: {names}。"
            "请确认路径正确后再使用。"
        )
        lines.append("")

    lines.append("## 模拟工具使用指南")
    lines.append("")
    lines.append(
        "本机已安装以下模拟工具，**必须优先使用这些工具**而非裸 shell 命令："
    )
    lines.append("")
    lines.append("- `launch_simulation(simulator, deck_file)` — 启动模拟")
    lines.append("  - simulator 可选: eclipse, cmg_imex, cmg_stars, cmg_gem, comsol")
    lines.append("  - 工具会自动从引擎注册表解析可执行文件路径")
    lines.append("  - 工具会自动处理各模拟器的参数约定 (如 Eclipse 不带 .DATA 后缀)")
    lines.append("  - 返回 job_id，可用于后续监控")
    lines.append("- `check_simulation_status(job_id)` — 查询运行状态")
    lines.append("- `read_simulation_results(job_id)` — 读取结果数据")
    lines.append("- `edit_simulation_deck(deck_file, edits)` — 修改输入文件")
    lines.append("- `analyze_simulation(job_id, analysis_type)` — 分析结果")
    lines.append("")
    lines.append(
        "⚠️ **禁止**直接使用 execute_shell_command 调用模拟器可执行文件。"
        "裸 shell 调用会绕过适配器层，导致参数错误、许可证缺失、"
        "路径解析失败等问题。如果 launch_simulation 返回错误，"
        "应根据错误信息排查而非回退到 shell。"
    )
    return "\n".join(lines)
