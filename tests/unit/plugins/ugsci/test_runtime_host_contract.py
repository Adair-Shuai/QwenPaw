# -*- coding: utf-8 -*-
"""Public runtime installation retains host locks and durable task identity."""

import importlib
import json
import sys
import threading
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from types import SimpleNamespace

import pytest

from qwenpaw.plugins import install_lock, loader


@pytest.mark.parametrize(
    "frozen,desktop,runtime_path,expected",
    [
        (False, "", "missing", True),
        (False, "1", "missing", False),
        (True, "", "missing", False),
        (True, "", "file", True),
        (False, "1", "file", True),
        (True, "", "directory", False),
    ],
)
def test_public_runtime_probe_retains_desktop_interpreter_rules(
    monkeypatch,
    tmp_path,
    frozen,
    desktop,
    runtime_path,
    expected,
):
    monkeypatch.setattr(sys, "frozen", frozen, raising=False)
    monkeypatch.setenv("QWENPAW_DESKTOP_APP", desktop)
    candidate = tmp_path / "standalone python"
    if runtime_path == "file":
        candidate.write_bytes(b"probe only")
    elif runtime_path == "directory":
        candidate.mkdir()
    monkeypatch.setenv("QWENPAW_DESKTOP_PY_RUNTIME", str(candidate))
    assert loader.has_dependency_install_runtime() is expected


@pytest.mark.parametrize(
    "held_name",
    [
        "ugsci-domain-runtime.lock",
        "_shared-target.lock",
    ],
)
def test_public_runtime_installer_uses_both_actual_host_locks(
    monkeypatch,
    tmp_path,
    held_name,
):
    runtime_dir = tmp_path / "runtime"
    monkeypatch.setattr(loader, "_plugin_runtime_dir", lambda: runtime_dir)
    requirements = tmp_path / "requirements.txt"
    requirements.write_text("# already satisfied\n", encoding="utf-8")
    original_lock = install_lock.plugin_install_lock
    attempted = threading.Event()
    paths = []

    @contextmanager
    def observed_lock(path, *args, **kwargs):
        paths.append(path.name)
        if path.name == held_name:
            attempted.set()
        with original_lock(path, *args, **kwargs) as acquired:
            yield acquired

    def forbid_package_process(*_args, **_kwargs):
        raise AssertionError("Satisfied requirements must not launch pip")

    monkeypatch.setattr(install_lock, "plugin_install_lock", observed_lock)
    monkeypatch.setattr(loader.subprocess, "run", forbid_package_process)
    instance = loader.PluginLoader([])
    held_path = runtime_dir / "install-locks" / held_name
    with ThreadPoolExecutor(max_workers=1) as worker:
        with original_lock(held_path) as acquired:
            assert acquired
            future = worker.submit(
                instance.install_runtime_requirements,
                requirements,
                "ugsci-domain-runtime",
            )
            assert attempted.wait(2)
            assert not future.done()
        assert future.result(timeout=3) is None
    assert paths == ["ugsci-domain-runtime.lock", "_shared-target.lock"]
    assert requirements.read_text(encoding="utf-8") == "# already satisfied\n"


@pytest.fixture(
    name="runtime_scene",
    params=[
        "plugins.bundle",
        "qwenpaw.plugins_bundle",
    ],
)
def load_runtime_scene(request, monkeypatch, tmp_path):
    prefix = request.param + ".ugsci.domain_engine"
    module = importlib.import_module(prefix + ".runtime_install")
    catalog = importlib.import_module(prefix + ".catalog")
    engine = next(
        item
        for item in catalog.list_engines()
        if item.dependencies == ("sympy",)
    )
    monkeypatch.setattr(sys, "frozen", False, raising=False)
    monkeypatch.delenv("QWENPAW_DESKTOP_APP", raising=False)
    monkeypatch.delenv("QWENPAW_DESKTOP_PY_RUNTIME", raising=False)
    monkeypatch.delenv("QWENPAW_RUNTIME_PROVISIONER", raising=False)
    monkeypatch.setattr(
        module,
        "probe_engine",
        lambda _engine: SimpleNamespace(
            dependencies=[],
            overall="missing",
        ),
    )
    submitted = []

    def submit(function, *args):
        submitted.append((function, args))

    monkeypatch.setattr(module, "_executor", SimpleNamespace(submit=submit))
    path = tmp_path / "tasks.json"
    return module, module.RuntimeInstallManager(path), engine, path, submitted


def test_runtime_task_uuid_matches_executor_and_retained_disk_records(
    runtime_scene,
):
    _module, manager, engine, path, submitted = runtime_scene
    previous = {
        f"old-{index}": {
            "id": f"old-{index}",
            "engine_id": engine.id,
            "status": "completed",
            "progress": 100,
            "message": "done",
            "error": "",
            "extra": {"value": index},
        }
        for index in range(20)
    }
    path.write_text(json.dumps(previous), encoding="utf-8")
    task = manager.start(engine.id)
    assert task["status"] == "queued"
    assert isinstance(task["id"], str)
    assert submitted[0][1] == (task["id"], engine)
    assert callable(submitted[0][0])
    assert manager.get_task(task["id"]) == task
    persisted = json.loads(path.read_text(encoding="utf-8"))
    assert len(persisted) == 20
    assert "old-0" not in persisted
    assert persisted["old-1"]["extra"] == {"value": 1}
    assert persisted[task["id"]] == task
    assert manager.start(engine.id) == task
    assert len(submitted) == 1


def test_runtime_submit_failure_persists_the_same_sanitized_task(
    runtime_scene,
    monkeypatch,
):
    module, manager, engine, path, _submitted = runtime_scene

    def fail_submit(*_args):
        raise RuntimeError("private executor credential")

    monkeypatch.setattr(
        module,
        "_executor",
        SimpleNamespace(submit=fail_submit),
    )
    task = manager.start(engine.id)
    assert task["status"] == "failed"
    assert task["progress"] == 0
    assert task["error"] == "安装任务未能启动"
    assert manager.get_task(task["id"]) == task
    persisted = path.read_text(encoding="utf-8")
    assert "private executor credential" not in persisted
    assert json.loads(persisted)[task["id"]] == task


def test_runtime_ready_result_does_not_submit_or_persist_a_worker(
    runtime_scene,
    monkeypatch,
):
    module, manager, engine, path, submitted = runtime_scene
    monkeypatch.setattr(
        module,
        "probe_engine",
        lambda current: SimpleNamespace(
            dependencies=[
                SimpleNamespace(name=name, status="available")
                for name in current.dependencies
            ],
            overall="available",
        ),
    )
    task = manager.start(engine.id)
    assert task["status"] == "completed"
    assert task["progress"] == 100
    assert isinstance(task["id"], str)
    assert not submitted
    assert manager.get_task(task["id"]) is None
    assert not path.exists()


@pytest.mark.parametrize("policy", ["local", "desktop"])
def test_runtime_admission_retains_managed_and_desktop_guards(
    runtime_scene,
    monkeypatch,
    policy,
):
    _module, manager, engine, path, submitted = runtime_scene
    if policy == "local":
        monkeypatch.setenv("QWENPAW_RUNTIME_PROVISIONER", "local")
        message = "管理员"
    else:
        monkeypatch.setattr(sys, "frozen", True)
        message = "桌面 Python"
    assert manager.runtime(engine.id)["state"] == "blocked"
    with pytest.raises(ValueError, match=message):
        manager.start(engine.id)
    assert not submitted
    assert not path.exists()
