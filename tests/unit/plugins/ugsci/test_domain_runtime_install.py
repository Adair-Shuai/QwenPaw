# -*- coding: utf-8 -*-
from __future__ import annotations

import json
from concurrent.futures import ThreadPoolExecutor
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from plugins.bundle.ugsci.domain_engine import runtime_install as runtime
from plugins.bundle.ugsci.domain_engine.api import build_domain_engine_router


@pytest.fixture(name="manager")
def load_manager(tmp_path, monkeypatch):
    from qwenpaw.plugins import loader

    monkeypatch.setattr(loader, "_is_frozen", lambda: False)
    monkeypatch.delenv("QWENPAW_RUNTIME_PROVISIONER", raising=False)
    target = tmp_path / "install-tasks.json"
    monkeypatch.setattr(runtime, "_task_file", lambda: target)
    monkeypatch.setattr(
        runtime,
        "_probe_missing",
        lambda engine: list(engine.dependencies),
    )

    def engine_by_id(engine_id):
        return {
            "sympy": SimpleNamespace(id="sympy", dependencies=("sympy",)),
            "neqsim": SimpleNamespace(
                id="neqsim",
                dependencies=("java-runtime", "neqsim-mcp-server"),
            ),
            "reservoir-visualization": SimpleNamespace(
                id="reservoir-visualization",
                dependencies=("three.js",),
            ),
            "petroleum-deterministic-core": SimpleNamespace(
                id="petroleum-deterministic-core",
                dependencies=(),
            ),
        }.get(engine_id)

    monkeypatch.setattr(runtime, "get_engine", engine_by_id)
    obj = runtime.RuntimeInstallManager()
    monkeypatch.setattr(
        runtime,
        "_executor",
        SimpleNamespace(submit=lambda fn, *args: None),
    )
    return obj, target


def test_requirements_are_allowlisted_and_unsupported_engines_rejected(
    manager,
):
    obj, _ = manager
    with pytest.raises(ValueError, match="专用运行时"):
        obj.start("neqsim")
    with pytest.raises(ValueError, match="专用运行时"):
        obj.start("reservoir-visualization")
    with pytest.raises(ValueError, match="不支持"):
        obj.start("sympy; --index-url https://evil.invalid")
    assert obj.runtime("sympy")["packages"] == ["sympy>=1.12"]
    assert (
        obj.runtime("petroleum-deterministic-core")["state"] == "unsupported"
    )


def test_one_global_task_and_same_engine_deduplication(manager, monkeypatch):
    obj, _ = manager
    from qwenpaw.plugins import loader

    monkeypatch.setattr(loader, "_is_frozen", lambda: False)
    monkeypatch.delenv("QWENPAW_RUNTIME_PROVISIONER", raising=False)
    first = obj.start("sympy")
    assert first["status"] == "queued"
    assert obj.start("sympy")["id"] == first["id"]
    other = SimpleNamespace(id="networkx", dependencies=("networkx",))
    monkeypatch.setattr(
        runtime,
        "get_engine",
        lambda eid: (
            other
            if eid == "networkx"
            else SimpleNamespace(id="sympy", dependencies=("sympy",))
        ),
    )
    with pytest.raises(ValueError, match="另一个计算引擎"):
        obj.start("networkx")


def test_worker_uses_host_installer_and_probes_after_success(
    manager,
    monkeypatch,
    tmp_path,
):
    obj, task_path = manager
    captured = {}
    install_temp = tmp_path / "runtime dependencies"
    install_temp.mkdir()
    original_temporary = runtime.tempfile.TemporaryDirectory

    def temporary_directory(*args, **kwargs):
        kwargs.setdefault("dir", install_temp)
        return original_temporary(*args, **kwargs)

    monkeypatch.setattr(
        runtime.tempfile,
        "TemporaryDirectory",
        temporary_directory,
    )

    class Loader:
        def __init__(self, plugins):
            assert plugins == []

        def install_runtime_requirements(self, path, plugin_id):
            captured["requirements"] = path.read_text(encoding="utf-8")
            from qwenpaw.plugins.dependency_gate import parse_requirements_file

            parsed = parse_requirements_file(path)
            # The API returns a list even when it is empty.
            # pylint: disable-next=use-implicit-booleaness-not-comparison
            assert parsed.unsupported == []
            constraints = path.parent / "constraints.txt"
            assert set(path.parent.iterdir()) == {path, constraints}
            captured["constraints"] = constraints.read_text(encoding="utf-8")
            captured["plugin_id"] = plugin_id

    monkeypatch.setattr("qwenpaw.plugins.loader.PluginLoader", Loader)
    monkeypatch.setattr(
        runtime.importlib.util,
        "find_spec",
        lambda name: object(),
    )
    versions = {"numpy": "1.26.4", "fastapi": "0.115.0"}

    def metadata_version(name):
        if name not in versions:
            raise runtime.importlib.metadata.PackageNotFoundError(name)
        return versions[name]

    monkeypatch.setattr(
        runtime.importlib.metadata,
        "version",
        metadata_version,
    )
    calls = iter([SimpleNamespace(overall="available", dependencies=[])])
    monkeypatch.setattr(runtime, "probe_engine", lambda _e: next(calls))
    with ThreadPoolExecutor(max_workers=1) as worker:
        monkeypatch.setattr(runtime, "_executor", worker)
        task = obj.start("sympy")
    result = obj.get_task(task["id"])
    assert result["status"] == "completed", result.get("error")
    assert (
        json.loads(task_path.read_text(encoding="utf-8"))[task["id"]] == result
    )
    assert not list(install_temp.iterdir())
    assert captured["plugin_id"] == "ugsci-domain-runtime"
    assert "sympy>=1.12" in captured["requirements"]
    assert "--only-binary=:all:" in captured["requirements"]
    assert "numpy==1.26.4" in captured["constraints"]
    assert "fastapi==0.115.0" in captured["constraints"]


def test_worker_failure_is_sanitized_and_persisted(manager, monkeypatch):
    obj, task_path = manager
    attempts = []

    class BrokenLoader:
        def __init__(self, plugins):
            pass

        def install_runtime_requirements(self, path, plugin_id):
            attempts.append((path, plugin_id))
            raise RuntimeError(
                "pip failed https://user:secret@private.example/index",
            )

    monkeypatch.setattr("qwenpaw.plugins.loader.PluginLoader", BrokenLoader)
    with ThreadPoolExecutor(max_workers=1) as worker:
        monkeypatch.setattr(runtime, "_executor", worker)
        task = obj.start("sympy")
    persisted = task_path.read_text(encoding="utf-8")
    assert len(attempts) == 1
    assert attempts[0][1] == "ugsci-domain-runtime"
    assert "secret" not in persisted and "private.example" not in persisted
    assert obj.get_task(task["id"])["status"] == "failed"


def test_recovery_marks_interrupted_tasks_failed(manager):
    obj, path = manager
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            {"a": {"id": "a", "engine_id": "sympy", "status": "running"}},
        ),
        encoding="utf-8",
    )
    task = runtime.RuntimeInstallManager().get_task("a")
    assert task["status"] == "failed"
    assert "中断" in task["message"]
    assert obj.get_task("a") == task


def test_api_status_task_404_and_runtime_path_order(manager, monkeypatch):
    obj, _ = manager
    monkeypatch.setattr(runtime, "runtime_install_manager", obj)
    app = FastAPI()
    app.include_router(build_domain_engine_router(), prefix="/domain")
    client = TestClient(app)
    assert client.get("/domain/install-tasks/missing").status_code == 404
    assert (
        client.get("/domain/unknown/runtime").json()["state"] == "unsupported"
    )
    assert client.post("/domain/unknown/install").status_code == 404
    from qwenpaw.plugins import loader

    monkeypatch.setattr(loader, "_is_frozen", lambda: False)
    monkeypatch.delenv("QWENPAW_RUNTIME_PROVISIONER", raising=False)
    assert client.post("/domain/sympy/install").status_code == 202


def test_neqsim_install_keeps_its_dedicated_route(monkeypatch):
    from qwenpaw.agents.builtin_mcp import neqsim_runtime

    sentinel = SimpleNamespace(to_dict=lambda: {"dedicated": True})
    monkeypatch.setattr(
        neqsim_runtime.install_manager,
        "start",
        lambda _refresh: sentinel,
    )
    app = FastAPI()
    app.include_router(build_domain_engine_router(), prefix="/domain")
    response = TestClient(app).post("/domain/neqsim/install")
    assert response.status_code == 202
    assert response.json() == {"dedicated": True}


def test_installed_package_must_load_in_live_process(manager, monkeypatch):
    obj, _ = manager
    monkeypatch.setattr(obj, "_install_missing", lambda *_: None)
    # Files may be discoverable despite a missing DLL or a transitive import.
    monkeypatch.setattr(
        runtime.importlib.util,
        "find_spec",
        lambda _: object(),
    )

    def broken_import(name):
        raise ImportError("missing native dependency")

    monkeypatch.setattr(runtime.importlib, "import_module", broken_import)
    with ThreadPoolExecutor(max_workers=1) as worker:
        monkeypatch.setattr(runtime, "_executor", worker)
        task = obj.start("sympy")
    assert obj.get_task(task["id"])["status"] == "failed"
    assert obj.get_task(task["id"])["progress"] < 100


def test_runtime_requirements_accept_only_bounded_pins_and_binary_restriction(
    tmp_path,
):
    from qwenpaw.plugins.dependency_gate import (
        parse_requirements_file,
        stage_pinned_constraints,
    )

    requirements = tmp_path / "requirements.txt"
    pins = tmp_path / "constraints.txt"
    pins.write_text("numpy==1.26.4\n", encoding="utf-8")
    requirements.write_text(
        f'--only-binary=:all:\n--constraint "{pins.as_posix()}"\nsimpy>=4\n',
        encoding="utf-8",
    )
    parsed = parse_requirements_file(requirements)
    assert not parsed.unsupported
    assert [str(req) for req in parsed.requirements] == ["simpy>=4"]
    staging = tmp_path / "wheel-staging"
    staging.mkdir()
    staged = staging / "requirements.txt"
    staged.write_text(
        stage_pinned_constraints(requirements, staging),
        encoding="utf-8",
    )
    assert not parse_requirements_file(staged).unsupported
    assert (
        staging / "declared-constraints-1.txt"
    ).read_text() == "numpy==1.26.4\n"
    for invalid in [
        "--index-url https://evil.example",
        "-r elsewhere.txt",
        "numpy>=1",
        "numpy==1.*",
        "numpy @ https://evil.example/numpy.whl",
    ]:
        pins.write_text(invalid, encoding="utf-8")
        assert parse_requirements_file(requirements).unsupported
    other = tmp_path / "elsewhere"
    other.mkdir()
    (other / "constraints.txt").write_text("numpy==1.26.4", encoding="utf-8")
    requirements.write_text(
        '--constraint "elsewhere/constraints.txt"\nsimpy>=4',
        encoding="utf-8",
    )
    assert parse_requirements_file(requirements).unsupported


def test_neqsim_runtime_exposes_running_task_without_starting_download(
    monkeypatch,
    tmp_path,
):
    from qwenpaw.agents.builtin_mcp import neqsim_runtime

    manager = neqsim_runtime.NeqSimInstallManager(tmp_path / "tasks.json")
    task = neqsim_runtime.InstallTask(
        id="running",
        status="running",
        progress=55,
    )
    # pylint: disable-next=protected-access
    manager._tasks[task.id] = task
    # pylint: disable-next=protected-access
    manager._active_task_id = task.id
    monkeypatch.setattr(neqsim_runtime, "install_manager", manager)
    app = FastAPI()
    app.include_router(build_domain_engine_router(), prefix="/domain")
    result = TestClient(app).get("/domain/neqsim/runtime").json()
    assert result["engine_id"] == "neqsim"
    assert result["active_task"]["id"] == "running"
    assert result["active_task"]["progress"] == 55
    assert result["packages"] == ["Java 21", "NeqSim 3.17.0"]
