# -*- coding: utf-8 -*-
"""User-triggered, allowlisted Python runtime installation for domain cards."""

from __future__ import annotations

import importlib
import importlib.metadata
import importlib.util
import json
import os
import tempfile
import threading
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any

from packaging.version import InvalidVersion, Version

from .catalog import get_engine
from .dependency_probe import probe_engine

# Constraints mirror requirements-optional.txt. Only catalog dependencies that
# have an explicit entry here may be written into the temporary requirements.
PACKAGE_REQUIREMENTS = {
    "lasio": "lasio>=0.31",
    "numpy": "numpy>=1.26",
    "scipy": "scipy>=1.12",
    "sympy": "sympy>=1.12",
    "pymc": "pymc>=5",
    "pymoo": "pymoo>=0.6",
    "simpy": "simpy>=4",
    "networkx": "networkx>=3",
    "geopandas": "geopandas>=0.14",
    "scikit-learn": "scikit-learn>=1.4",
    "statsmodels": "statsmodels>=0.14",
    "xlrd": "xlrd>=2.0.1,<3",
}
_IMPORT_NAMES = {"scikit-learn": "sklearn"}
_HOST_DISTRIBUTIONS = (
    "numpy",
    "scipy",
    "pandas",
    "sympy",
    "packaging",
    "pydantic",
    "fastapi",
    "scikit-learn",
    "statsmodels",
)
_guard = threading.RLock()
_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="ugsci-runtime")


def _task_file() -> Path:
    from qwenpaw.constant import WORKING_DIR

    return Path(WORKING_DIR) / "plugin_runtime" / "ugsci-domain-install-tasks.json"


def _probe_missing(engine: Any) -> list[str]:
    if not engine.dependencies or any(
        dep not in PACKAGE_REQUIREMENTS for dep in engine.dependencies
    ):
        return []
    result = probe_engine(engine)
    available = {d.name for d in result.dependencies if d.status == "available"}
    return [dep for dep in engine.dependencies if dep not in available]


class RuntimeInstallManager:
    def __init__(self, task_file: Path | None = None) -> None:
        self._task_file_override = task_file
        self._recovered = False

    def _path(self) -> Path:
        return self._task_file_override or _task_file()

    def _load(self) -> dict[str, dict[str, Any]]:
        try:
            raw = json.loads(self._path().read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return {}
        if not isinstance(raw, dict):
            return {}
        return {
            key: dict(task)
            for key, task in raw.items()
            if isinstance(key, str)
            and isinstance(task, dict)
            and task.get("id") == key
            and isinstance(task.get("engine_id"), str)
            and task.get("status") in {"queued", "running", "completed", "failed"}
            and isinstance(task.get("progress", 0), (int, float))
            and isinstance(task.get("message", ""), str)
            and isinstance(task.get("error", ""), str)
        }

    def _save(self, tasks: dict[str, dict[str, Any]]) -> None:
        path = self._path()
        path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp = tempfile.mkstemp(prefix=".ugsci-install-", dir=path.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as stream:
                json.dump(tasks, stream, ensure_ascii=False)
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(tmp, path)
        finally:
            try:
                os.unlink(tmp)
            except FileNotFoundError:
                pass

    def _ensure_recovered(self) -> None:
        with _guard:
            if self._recovered:
                return
            tasks = self._load()
            changed = False
            for task in tasks.values():
                if task.get("status") in {"queued", "running"}:
                    task.update(
                        status="failed",
                        message="程序重启中断了安装，请重新发起",
                        error="任务因程序重启而中断",
                    )
                    changed = True
            if changed:
                self._save(tasks)
            self._recovered = True

    def get_task(self, task_id: str) -> dict[str, Any] | None:
        self._ensure_recovered()
        with _guard:
            value = self._load().get(task_id)
            return dict(value) if value else None

    def runtime(self, engine_id: str) -> dict[str, Any]:
        self._ensure_recovered()
        engine = get_engine(engine_id)
        if engine is None:
            return {
                "engine_id": engine_id,
                "installable": False,
                "packages": [],
                "state": "unsupported",
                "message": "不支持的计算引擎",
                "active_task": None,
            }
        supported = bool(engine.dependencies) and all(
            dep in PACKAGE_REQUIREMENTS for dep in engine.dependencies
        )
        if not supported:
            state = "blocked" if engine.dependencies else "unsupported"
            msg = (
                "该引擎使用专用运行时或非 Python 依赖"
                if engine.dependencies
                else "该引擎无需安装依赖"
            )
            return {
                "engine_id": engine_id,
                "installable": False,
                "packages": [],
                "state": state,
                "message": msg,
                "active_task": None,
            }
        from qwenpaw.plugins import loader

        if os.environ.get("QWENPAW_RUNTIME_PROVISIONER") == "local" or (
            loader._is_frozen() and loader._desktop_python() is None
        ):
            return {
                "engine_id": engine_id,
                "installable": False,
                "packages": [],
                "state": "blocked",
                "message": "当前环境不支持自行安装，请联系管理员或修复桌面 Python 组件",
                "active_task": None,
            }
        missing = _probe_missing(engine)
        active = None
        with _guard:
            tasks = self._load()
            active = next(
                (
                    dict(t)
                    for t in tasks.values()
                    if t["engine_id"] == engine_id
                    and t["status"] in ("queued", "running")
                ),
                None,
            )
        return {
            "engine_id": engine_id,
            "installable": bool(missing),
            "packages": [PACKAGE_REQUIREMENTS[d] for d in missing],
            "state": "missing" if missing else "ready",
            "message": "缺少依赖，可按需安装" if missing else "依赖已就绪",
            "active_task": active,
        }

    def start(self, engine_id: str) -> dict[str, Any]:
        self._ensure_recovered()
        engine = get_engine(engine_id)
        if engine is None:
            raise ValueError("不支持的计算引擎")
        if not engine.dependencies or any(
            dep not in PACKAGE_REQUIREMENTS for dep in engine.dependencies
        ):
            raise ValueError(
                "该引擎没有可按卡片安装的 Python 依赖；请使用对应专用运行时"
            )
        from qwenpaw.plugins import loader

        if os.environ.get("QWENPAW_RUNTIME_PROVISIONER") == "local":
            raise ValueError("当前 Python 环境由管理员管理，请联系管理员安装依赖")
        if loader._is_frozen() and loader._desktop_python() is None:
            raise ValueError("桌面 Python 安装组件不可用，请修复或重新安装 QwenPaw")
        missing = _probe_missing(engine)
        with _guard:
            tasks = self._load()
            active = next(
                (t for t in tasks.values() if t["status"] in ("queued", "running")),
                None,
            )
            if active:
                if active["engine_id"] == engine_id:
                    return dict(active)
                raise ValueError("另一个计算引擎正在安装依赖，请稍后重试")
            if not missing:
                return {
                    "id": str(uuid.uuid4()),
                    "engine_id": engine_id,
                    "status": "completed",
                    "progress": 100,
                    "message": "依赖已就绪，无需安装",
                    "error": "",
                }
            task = {
                "id": str(uuid.uuid4()),
                "engine_id": engine_id,
                "status": "queued",
                "progress": 0,
                "message": "等待安装",
                "error": "",
            }
            tasks[task["id"]] = task
            self._save(dict(list(tasks.items())[-20:]))
            try:
                _executor.submit(self._run, task["id"], engine)
            except Exception:
                task.update(
                    status="failed",
                    message="无法启动安装任务，请稍后重试",
                    error="安装任务未能启动",
                )
                self._save(dict(list(tasks.items())[-20:]))
            return dict(task)

    def _update(self, task_id: str, **changes: Any) -> None:
        with _guard:
            tasks = self._load()
            if task_id in tasks:
                tasks[task_id].update(changes)
                self._save(dict(list(tasks.items())[-20:]))

    def _run(self, task_id: str, engine: Any) -> None:
        self._update(task_id, status="running", progress=5, message="正在准备依赖")
        try:
            missing = _probe_missing(engine)
            if missing:
                fd, name = tempfile.mkstemp(prefix="ugsci-domain-", suffix=".txt")
                cfd, constraints_name = tempfile.mkstemp(
                    prefix="ugsci-host-constraints-", suffix=".txt"
                )
                try:
                    target_dists = {d.lower().replace("_", "-") for d in missing}
                    constraints = []
                    for dist in _HOST_DISTRIBUTIONS:
                        if dist.lower().replace("_", "-") in target_dists:
                            continue
                        try:
                            installed = importlib.metadata.version(dist)
                            Version(installed)
                        except (
                            importlib.metadata.PackageNotFoundError,
                            InvalidVersion,
                        ):
                            continue
                        constraints.append(f"{dist}=={installed}")
                    with os.fdopen(cfd, "w", encoding="utf-8") as constraint_file:
                        constraint_file.write("\n".join(constraints) + "\n")
                    with os.fdopen(fd, "w", encoding="utf-8") as req:
                        req.write("--only-binary=:all:\n")
                        req.write(
                            f'--constraint "{Path(constraints_name).as_posix()}"\n'
                        )
                        req.write("\n".join(PACKAGE_REQUIREMENTS[p] for p in missing))
                        req.write("\n")
                    from qwenpaw.plugins.loader import PluginLoader

                    self._update(task_id, progress=20, message="正在下载并安装运行依赖")
                    PluginLoader([])._install_requirements_locked(
                        Path(name), "ugsci-domain-runtime"
                    )
                finally:
                    try:
                        os.unlink(name)
                    except OSError:
                        pass
                    try:
                        os.unlink(constraints_name)
                    except OSError:
                        pass
            from qwenpaw.plugins.loader import _ensure_plugin_site_on_path

            self._update(task_id, progress=85, message="正在重新检测依赖")
            _ensure_plugin_site_on_path()
            importlib.invalidate_caches()
            if any(
                importlib.util.find_spec(_IMPORT_NAMES.get(p, p.replace("-", "_")))
                is None
                for p in engine.dependencies
            ):
                raise RuntimeError("安装后仍有依赖无法导入")
            final = probe_engine(engine)
            if final.overall != "available":
                raise RuntimeError("安装完成后依赖检查仍未通过")
            self._update(
                task_id,
                status="completed",
                progress=100,
                message="安装完成，依赖检测已通过",
                error="",
            )
        except Exception as exc:
            # Loader errors may contain index credentials or pip output; expose
            # only a short generic message, never the exception text.
            text = str(exc).lower()
            if "administrator-managed" in text or "administrator" in text:
                msg = "当前 Python 环境由管理员管理，请联系管理员安装依赖"
            elif (
                "runtime is unavailable" in text or "qwenpaw_desktop_py_runtime" in text
            ):
                msg = "桌面 Python 安装组件不可用，请修复或重新安装 QwenPaw"
            else:
                msg = "依赖安装或安装后验证失败，请检查网络与运行环境后重试"
            self._update(task_id, status="failed", message=msg, error=msg)


runtime_install_manager = RuntimeInstallManager()
