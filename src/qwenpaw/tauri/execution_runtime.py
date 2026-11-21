# -*- coding: utf-8 -*-
"""Resolve the Python environment used for user task execution."""

from __future__ import annotations

import os
import platform
import re
import subprocess
import sys
from pathlib import Path
from typing import MutableMapping

_MODE_ENV = "QWENPAW_EXECUTION_PYTHON_MODE"
_PYTHON_ENV = "QWENPAW_EXECUTION_PYTHON"
_PIP_TARGET_ENV = "PIP_TARGET"
_detached_task_site: tuple[str, int] | None = None
_detached_pip_target: str | None = None
_detached_import_files: frozenset[Path] = frozenset()


def detached_import_files():
    """Files already imported before a desktop task site was detached."""
    return _detached_import_files


def _selection_path() -> Path | None:
    resource_dir = os.environ.get("QWENPAW_TAURI_RESOURCE_DIR", "").strip()
    if not resource_dir:
        return None
    return Path(resource_dir) / "execution-runtime" / "selection.txt"


def _bundled_python() -> str:
    path = os.environ.get("QWENPAW_DESKTOP_PY_RUNTIME", "").strip()
    return path if path and Path(path).is_file() else ""


def _read_selection() -> tuple[str, str]:
    selection = _selection_path()
    if selection is None:
        return ("builtin", "")
    try:
        lines = selection.read_text(encoding="utf-8-sig").splitlines()
    except OSError:
        return ("builtin", "")
    mode = lines[0].strip().lower() if lines else "builtin"
    python = lines[1].strip() if len(lines) > 1 else ""
    return (mode if mode in {"builtin", "external"} else "builtin", python)


def _valid_external_python(path: str) -> bool:
    if not path or not Path(path).is_file():
        return False
    probe = (
        "import struct,sys; "
        "raise SystemExit(0 if "
        "(sys.version_info >= (3,11) and sys.version_info < (3,14) "
        "and struct.calcsize('P') == 8) else 1)"
    )
    try:
        result = subprocess.run(
            [path, "-c", probe],
            check=False,
            timeout=8,
            creationflags=0x08000000 if os.name == "nt" else 0,
        )
    except (OSError, subprocess.SubprocessError):
        return False
    return result.returncode == 0


def configure_execution_runtime() -> tuple[str, str]:
    """Load installer selection and expose the validated execution Python."""
    mode, selected = _read_selection()
    bundled = _bundled_python()
    if mode == "external":
        if _valid_external_python(selected):
            os.environ[_MODE_ENV] = "external"
            os.environ[_PYTHON_ENV] = selected
            return ("external", selected)
        os.environ[_MODE_ENV] = "external-invalid"
        os.environ.pop(_PYTHON_ENV, None)
        return ("external-invalid", selected)
    os.environ[_MODE_ENV] = "builtin"
    if bundled:
        os.environ[_PYTHON_ENV] = bundled
    else:
        os.environ.pop(_PYTHON_ENV, None)
    return ("builtin", bundled)


def execution_mode() -> str:
    return os.environ.get(_MODE_ENV, "builtin")


def execution_python() -> str:
    return os.environ.get(_PYTHON_ENV, "").strip()


def _runtime_bucket() -> str:
    machine = platform.machine().lower() or "unknown"
    return (
        f"py{sys.version_info.major}.{sys.version_info.minor}-"
        f"{platform.system().lower()}-{machine}"
    )


def _execution_site() -> Path | None:
    configured = os.environ.get("QWENPAW_EXECUTION_SITE_DIR", "").strip()
    if configured:
        return Path(configured).expanduser()
    local_app_data = os.environ.get("LOCALAPPDATA", "").strip()
    if not local_app_data:
        return None
    return (
        Path(local_app_data)
        / "UGSci"
        / "execution"
        / _runtime_bucket()
        / "site"
    )


def isolate_desktop_task_site() -> None:
    """Detach a legacy task site before loading the desktop's plugins."""
    global _detached_task_site, _detached_pip_target, _detached_import_files
    site = _execution_site()
    if site is None:
        return
    import sysconfig

    target = site.resolve()
    protected = {
        Path(path).resolve()
        for path in (
            *(
                sysconfig.get_path(k)
                for k in ("stdlib", "platstdlib", "purelib", "platlib")
            ),
            os.environ.get("QWENPAW_PLUGIN_SITE"),
            getattr(sys, "_MEIPASS", None),
            Path(__file__).resolve().parents[2],
        )
        if path
    }
    local = os.environ.get("LOCALAPPDATA")
    managed = (
        (Path(local) / "UGSci" / "execution").resolve() if local else None
    )
    task_mode = os.environ.get(_MODE_ENV) or _read_selection()[0]
    entries = os.environ.get("PYTHONPATH", "").split(os.pathsep)
    pip_target = os.environ.get(_PIP_TARGET_ENV)
    search_paths = [p for p in (*sys.path, *entries) if isinstance(p, str)]
    detached = {}
    for entry in (*search_paths, pip_target):
        if not isinstance(entry, str) or not entry or entry in detached:
            continue
        path = Path(os.path.realpath(entry))
        if path in protected:
            continue
        if path == target or (
            managed is not None
            and path.parent.parent == managed
            and path.name.casefold() == "site"
            and re.fullmatch(r"py\d+\.\d+-.+-.+", path.parent.name.casefold())
        ):
            detached[entry] = path
    if not detached:
        return
    roots = set(detached.values()) | {Path(p).absolute() for p in detached}
    loaded_files = set()
    for module in sys.modules.copy().values():
        if isinstance(module, type(sys)):
            origin = vars(module).get("__file__")
            if isinstance(origin, str) and any(
                Path(origin).is_relative_to(root) for root in roots
            ):
                loaded_files.add(Path(os.path.realpath(origin)))
    _detached_import_files |= loaded_files
    sys.path[:] = [
        p for p in sys.path if not isinstance(p, str) or p not in detached
    ]
    remaining = [p for p in entries if p not in detached]
    if len(remaining) != len(entries):
        if remaining:
            os.environ["PYTHONPATH"] = os.pathsep.join(remaining)
        else:
            os.environ.pop("PYTHONPATH", None)
    if task_mode == "builtin" and any(
        detached.get(p) == target for p in search_paths
    ):
        index = next(
            (i for i, p in enumerate(entries) if detached.get(p) == target), 0
        )
        _detached_task_site = str(target), sum(
            p not in detached for p in entries[:index]
        )
    if pip_target in detached:
        os.environ.pop(_PIP_TARGET_ENV)
        if task_mode == "builtin" and detached[pip_target] == target:
            _detached_pip_target = pip_target


def task_site_overrides(env):
    """Settings for local task children after a legacy site was detached."""
    overrides = {}
    if execution_mode() != "builtin":
        return overrides
    if _detached_task_site:
        path, index = _detached_task_site
        entries = (
            env["PYTHONPATH"].split(os.pathsep) if "PYTHONPATH" in env else []
        )
        if path not in entries:
            entries.insert(index, path)
        overrides["PYTHONPATH"] = os.pathsep.join(entries)
    if _detached_pip_target and _PIP_TARGET_ENV not in env:
        overrides[_PIP_TARGET_ENV] = _detached_pip_target
    return overrides


def _managed_roots() -> list[Path]:
    roots: list[Path] = []
    configured = os.environ.get("QWENPAW_OPTIONAL_COMPONENTS_DIR", "").strip()
    if configured:
        roots.append(Path(configured).expanduser())
    local_app_data = os.environ.get("LOCALAPPDATA", "").strip()
    if local_app_data:
        roots.append(Path(local_app_data) / "UGSci" / "components")
        roots.append(Path(local_app_data) / "UGSci" / "execution")
    site_dir = _execution_site()
    if site_dir is not None:
        roots.append(site_dir)
    return roots


def _is_under(path: str, roots: list[Path]) -> bool:
    candidate = os.path.normcase(os.path.abspath(path))
    for root in roots:
        normalized_root = os.path.normcase(os.path.abspath(root))
        try:
            if (
                os.path.commonpath([candidate, normalized_root])
                == normalized_root
            ):
                return True
        except ValueError:
            continue
    return False


def _without_managed_pythonpath(value: str) -> str:
    roots = _managed_roots()
    entries = [item for item in value.split(os.pathsep) if item]
    return os.pathsep.join(
        item for item in entries if not _is_under(item, roots)
    )


def _python_path_entries(python: str) -> list[str]:
    if not python:
        return []
    parent = Path(python).parent
    entries = [str(parent)]
    scripts = parent / "Scripts"
    if scripts.is_dir():
        entries.append(str(scripts))
    return entries


def prepare_execution_env(
    env: MutableMapping[str, str],
) -> MutableMapping[str, str]:
    """Route shell-level python and pip commands to the task interpreter."""
    bundled_entries = {
        os.path.normcase(os.path.normpath(item))
        for item in _python_path_entries(_bundled_python())
    }
    current = [item for item in env.get("PATH", "").split(os.pathsep) if item]
    current = [
        item
        for item in current
        if os.path.normcase(os.path.normpath(item)) not in bundled_entries
    ]
    mode = execution_mode()
    prefix = _python_path_entries(execution_python())
    env[_MODE_ENV] = mode
    pythonpath = _without_managed_pythonpath(env.get("PYTHONPATH", ""))
    if mode == "builtin":
        site_dir = _execution_site()
        if site_dir is not None:
            try:
                site_dir.mkdir(parents=True, exist_ok=True)
            except OSError:
                pass
            site = str(site_dir)
            env[_PIP_TARGET_ENV] = site
            pythonpath = site + os.pathsep + pythonpath if pythonpath else site
            for scripts_name in ("Scripts", "bin"):
                scripts = site_dir / scripts_name
                prefix.append(str(scripts))
    elif mode == "external":
        env["PYTHONNOUSERSITE"] = ""
    env["PATH"] = os.pathsep.join([*prefix, *current])
    env["PYTHONPATH"] = pythonpath
    if execution_python():
        env[_PYTHON_ENV] = execution_python()
    else:
        env.pop(_PYTHON_ENV, None)
    return env
