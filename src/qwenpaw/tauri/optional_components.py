# -*- coding: utf-8 -*-
"""Install desktop optional components into a user-writable runtime."""

from __future__ import annotations

import importlib
import json
import logging
import os
import platform
import shutil
import site
import subprocess
import sys
import threading
import uuid
from pathlib import Path
from typing import NamedTuple

logger = logging.getLogger(__name__)


class _ComponentDefinition(NamedTuple):
    revision: int
    packages: tuple[str, ...]
    imports: tuple[str, ...]


_COMPONENTS: dict[str, _ComponentDefinition] = {
    "science": _ComponentDefinition(
        revision=1,
        packages=(
            "numpy>=1.24.0",
            "pandas>=2.0.0",
            "scipy>=1.11.0",
            "matplotlib>=3.7.0",
        ),
        imports=("numpy", "pandas", "scipy", "matplotlib"),
    ),
    "whisper": _ComponentDefinition(
        revision=1,
        packages=(
            "torch>=2.1.0",
            "openai-whisper>=20231117",
            "imageio-ffmpeg>=0.6.0",
        ),
        imports=("torch", "whisper", "imageio_ffmpeg"),
    ),
}
_INSTALL_THREAD: threading.Thread | None = None
_PATH_LOCK = threading.Lock()


def _runtime_bucket() -> str:
    machine = platform.machine().lower() or "unknown"
    return (
        f"py{sys.version_info.major}.{sys.version_info.minor}-"
        f"{platform.system().lower()}-{machine}"
    )


def _components_root() -> Path | None:
    configured = os.environ.get("QWENPAW_OPTIONAL_COMPONENTS_DIR", "").strip()
    if configured:
        return Path(configured).expanduser()
    local_app_data = os.environ.get("LOCALAPPDATA", "").strip()
    if local_app_data:
        return Path(local_app_data) / "UGSci" / "components"
    return None


def _selection_path() -> Path | None:
    resource_dir = os.environ.get("QWENPAW_TAURI_RESOURCE_DIR", "").strip()
    if not resource_dir:
        return None
    return Path(resource_dir) / "optional-components" / "pending.txt"


def _component_dir(name: str) -> Path | None:
    root = _components_root()
    if root is None:
        return None
    return root / _runtime_bucket() / name


def _status_matches(name: str, component_dir: Path) -> bool:
    definition = _COMPONENTS[name]
    try:
        status = json.loads(
            (component_dir / "status.json").read_text(encoding="utf-8"),
        )
    except (OSError, ValueError, TypeError):
        return False
    return (
        status.get("component") == name
        and status.get("revision") == definition.revision
        and status.get("runtime") == _runtime_bucket()
        and (component_dir / "site").is_dir()
    )


def _add_site_dir(site_dir: Path) -> None:
    path = str(site_dir)
    with _PATH_LOCK:
        if path not in sys.path:
            site.addsitedir(path)
            importlib.invalidate_caches()
        existing = os.environ.get("PYTHONPATH", "")
        entries = [item for item in existing.split(os.pathsep) if item]
        if path not in entries:
            entries.append(path)
            os.environ["PYTHONPATH"] = os.pathsep.join(entries)


def activate_installed_components() -> None:
    """Expose completed component sites to this process and child Python."""
    from qwenpaw.tauri.execution_runtime import execution_mode

    for name in _COMPONENTS:
        if name == "science" and execution_mode() == "external":
            continue
        component_dir = _component_dir(name)
        if component_dir is None or not _status_matches(name, component_dir):
            continue
        _add_site_dir(component_dir / "site")
        bin_dir = component_dir / "bin"
        if bin_dir.is_dir():
            current_path = os.environ.get("PATH", "")
            path_entries = (
                current_path.split(os.pathsep) if current_path else []
            )
            if str(bin_dir) not in path_entries:
                os.environ["PATH"] = os.pathsep.join(
                    [str(bin_dir), *path_entries],
                )


def _selected_components() -> list[str]:
    selection = _selection_path()
    if selection is None:
        return []
    try:
        names = selection.read_text(encoding="utf-8-sig").splitlines()
    except OSError:
        return []
    return list(
        dict.fromkeys(
            name.strip() for name in names if name.strip() in _COMPONENTS
        ),
    )


def _pip_index_args() -> list[str]:
    index_url = os.environ.get(
        "PIP_INDEX_URL",
        "https://pypi.tuna.tsinghua.edu.cn/simple/",
    )
    extra_index_url = os.environ.get(
        "PIP_EXTRA_INDEX_URL",
        "https://mirrors.aliyun.com/pypi/simple/",
    )
    return ["--index-url", index_url, "--extra-index-url", extra_index_url]


def _verify_site(
    python: str,
    site_dir: Path,
    imports: tuple[str, ...],
) -> None:
    env = dict(os.environ)
    existing = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = (
        str(site_dir) + os.pathsep + existing if existing else str(site_dir)
    )
    statement = "; ".join(f"import {name}" for name in imports)
    subprocess.run(
        [python, "-c", statement],
        check=True,
        env=env,
        creationflags=0x08000000 if os.name == "nt" else 0,
    )


def _install_component(python: str, name: str) -> None:
    component_dir = _component_dir(name)
    if component_dir is None or _status_matches(name, component_dir):
        return
    definition = _COMPONENTS[name]
    component_dir.mkdir(parents=True, exist_ok=True)
    for abandoned in component_dir.glob("site.staging-*"):
        shutil.rmtree(abandoned, ignore_errors=True)
    staging = component_dir / f"site.staging-{uuid.uuid4().hex}"
    backup = component_dir / "site.previous"
    site_dir = component_dir / "site"
    shutil.rmtree(staging, ignore_errors=True)
    try:
        subprocess.run(
            [
                python,
                "-m",
                "pip",
                "install",
                "--disable-pip-version-check",
                "--no-input",
                "--prefer-binary",
                *_pip_index_args(),
                "--target",
                str(staging),
                *definition.packages,
            ],
            check=True,
            creationflags=0x08000000 if os.name == "nt" else 0,
        )
        _verify_site(python, staging, definition.imports)
        if name == "whisper":
            env = dict(os.environ)
            env["PYTHONPATH"] = str(staging)
            ffmpeg_probe = (
                "import imageio_ffmpeg; "
                "print(imageio_ffmpeg.get_ffmpeg_exe())"
            )
            ffmpeg = subprocess.run(
                [
                    python,
                    "-c",
                    ffmpeg_probe,
                ],
                check=True,
                capture_output=True,
                text=True,
                env=env,
                creationflags=0x08000000 if os.name == "nt" else 0,
            ).stdout.strip()
            bin_dir = component_dir / "bin"
            bin_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ffmpeg, bin_dir / "ffmpeg.exe")

        shutil.rmtree(backup, ignore_errors=True)
        if site_dir.exists():
            site_dir.replace(backup)
        staging.replace(site_dir)
        shutil.rmtree(backup, ignore_errors=True)
        status = {
            "component": name,
            "revision": definition.revision,
            "runtime": _runtime_bucket(),
        }
        (component_dir / "status.json").write_text(
            json.dumps(status, ensure_ascii=True, indent=2) + "\n",
            encoding="utf-8",
        )
        _add_site_dir(site_dir)
        activate_installed_components()
        logger.info("Optional component installed: %s", name)
    except Exception:  # pylint: disable=broad-exception-caught
        shutil.rmtree(staging, ignore_errors=True)
        if backup.exists() and not site_dir.exists():
            backup.replace(site_dir)
        logger.exception("Optional component installation failed: %s", name)


def install_pending_components() -> None:
    """Install selected components synchronously during visible startup."""
    from qwenpaw.tauri.execution_runtime import execution_mode
    from qwenpaw.app.startup_state import startup_state

    python = os.environ.get("QWENPAW_DESKTOP_PY_RUNTIME", "").strip()
    if not python or not Path(python).is_file():
        return
    selected = _selected_components()
    for index, name in enumerate(selected, start=1):
        if name == "science" and execution_mode() == "external":
            continue
        label = "科学计算组件" if name == "science" else "语音识别组件"
        startup_state.update(
            "components",
            f"正在准备{label}…",
            91 + round(7 * index / max(1, len(selected))),
            current=index,
            total=len(selected),
            detail=name,
        )
        _install_component(python, name)


def start_pending_component_install() -> threading.Thread | None:
    """Start one non-blocking installer thread when components are pending."""
    # pylint: disable-next=global-statement
    global _INSTALL_THREAD  # noqa: PLW0603
    selected = _selected_components()
    if not selected:
        return None
    if _INSTALL_THREAD is not None and _INSTALL_THREAD.is_alive():
        return _INSTALL_THREAD
    _INSTALL_THREAD = threading.Thread(
        target=install_pending_components,
        name="qwenpaw-optional-components",
        daemon=True,
    )
    _INSTALL_THREAD.start()
    return _INSTALL_THREAD
