# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import shlex
from pathlib import Path
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
    original_mkstemp = runtime.tempfile.mkstemp

    def mkstemp(*args, **kwargs):
        kwargs.setdefault("dir", install_temp)
        return original_mkstemp(*args, **kwargs)

    monkeypatch.setattr(runtime.tempfile, "mkstemp", mkstemp)

    class Loader:
        def __init__(self, plugins):
            assert plugins == []

        def install_runtime_requirements(self, path, plugin_id):
            captured["requirements"] = path.read_text(encoding="utf-8")
            constraints_path = next(
                shlex.split(line)[1]
                for line in captured["requirements"].splitlines()
                if line.startswith("--constraint ")
            )
            captured["constraints"] = Path(constraints_path).read_text(
                encoding="utf-8",
            )
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
