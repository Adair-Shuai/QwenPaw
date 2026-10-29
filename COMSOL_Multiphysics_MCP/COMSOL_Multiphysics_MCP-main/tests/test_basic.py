# -*- coding: utf-8 -*-
"""Basic tests for COMSOL MCP Server."""

import asyncio
import json
import threading

import pytest


class TestVersioning:
    """Tests for version naming utilities."""

    def test_generate_version_name(self):
        from src.utils.versioning import generate_version_name

        result = generate_version_name("model.mph")
        assert result.startswith("model_")
        assert result.endswith(".mph")
        assert len(result) > len("model.mph")

    def test_generate_version_name_no_extension(self):
        from src.utils.versioning import generate_version_name

        result = generate_version_name("model")
        assert result.startswith("model_")
        assert result.endswith(".mph")

    def test_generate_version_path(self, tmp_path, monkeypatch):
        from pathlib import Path
        from src.utils import versioning

        root = tmp_path / "models"
        monkeypatch.setattr(versioning, "MODELS_BASE_DIR", root)
        result = versioning.generate_version_path("/path/to/model.mph")
        path = Path(result)
        assert path.parent == root / "model"
        assert path.parent.is_dir()
        assert path.name.startswith("model_")
        assert result.endswith(".mph")
        info = versioning.parse_version_info(path.name)
        assert info is not None and info["base_name"] == "model"

    def test_generate_version_path_honors_custom_base(
        self,
        tmp_path,
        monkeypatch,
    ):
        from pathlib import Path
        from src.utils import versioning

        default_root = tmp_path / "default-models"
        monkeypatch.setattr(versioning, "MODELS_BASE_DIR", default_root)
        custom_root = tmp_path / "custom models"
        path = Path(
            versioning.generate_version_path("demo.mph", str(custom_root)),
        )
        assert path.parent == custom_root / "demo"
        assert path.parent.is_dir()
        assert path.name.startswith("demo_") and path.suffix == ".mph"
        assert not default_root.exists()

    def test_parse_version_info_valid(self):
        from src.utils.versioning import parse_version_info

        result = parse_version_info("model_20260215_143022.mph")
        assert result is not None
        assert result["base_name"] == "model"
        assert result["timestamp"] == "20260215_143022"

    def test_parse_version_info_invalid(self):
        from src.utils.versioning import parse_version_info

        result = parse_version_info("model.mph")
        assert result is None

        result = parse_version_info("model_20260215.mph")
        assert result is None


class TestSessionManager:
    """Tests for session manager (without actual COMSOL)."""

    def test_session_manager_singleton(self):
        from src.tools.session import SessionManager

        sm1 = SessionManager()
        sm2 = SessionManager()
        assert sm1 is sm2

    def test_session_manager_initial_state(self):
        from src.tools.session import SessionManager

        sm = SessionManager()
        assert sm.client is None
        assert not sm.is_connected
        assert sm.current_model is None
        assert isinstance(sm.models, dict) and not sm.models

    def test_get_status_disconnected(self):
        from src.tools.session import SessionManager

        sm = SessionManager()
        status = sm.get_status()
        assert status["connected"] is False


def _study_tools(monkeypatch, model):
    from mcp.server.fastmcp import FastMCP
    from src.async_handler.solver import AsyncSolver
    from src.tools import study

    solver = AsyncSolver()
    monkeypatch.setattr(study, "async_solver", solver)
    monkeypatch.setattr(
        study.session_manager,
        "get_model",
        lambda _name: model,
    )
    server = FastMCP("solver-controls")
    study.register_study_tools(server)
    return server, solver


def _call_solve(server, timeout):
    result = asyncio.run(
        server.call_tool(
            "study_solve",
            {"study_name": "study-test", "wait": True, "timeout": timeout},
        ),
    )
    return json.loads(result[0].text)


@pytest.mark.parametrize("fails", [False, True])
def test_bounded_solve_reports_the_actual_worker_outcome(monkeypatch, fails):
    calls = []

    class Model:
        def solve(self, study_name):
            calls.append(study_name)
            if fails:
                raise ValueError("external solve failure")

    server, solver = _study_tools(monkeypatch, Model())
    result = _call_solve(server, 1.0)
    assert solver.wait(timeout=2)
    assert not solver.is_running
    assert calls == ["study-test"]
    assert result["success"] is (not fails)
    if fails:
        assert result["error"] == "external solve failure"
        assert result["progress"]["status"] == "failed"
    else:
        assert result["study"] == "study-test"
        assert result["message"] == "Solving completed."


def test_bounded_solve_timeout_retains_the_owned_background_worker(
    monkeypatch,
):
    release = threading.Event()
    started = threading.Event()
    calls = []

    class Model:
        def solve(self, study_name):
            calls.append(study_name)
            started.set()
            assert release.wait(5)

    server, solver = _study_tools(monkeypatch, Model())
    try:
        result = _call_solve(server, 0.02)
        assert result["success"] is False
        assert result["timed_out"] is True
        assert result["async"] is True
        assert "continues in the background" in result["error"]
        assert started.wait(1)
        assert solver.is_running
        assert result["progress"]["status"] == "running"
        blocked = _call_solve(server, 0.02)
        assert blocked["success"] is False
        assert "Another solving operation" in blocked["error"]
        assert calls == ["study-test"]
    finally:
        release.set()
        assert solver.wait(timeout=2)
    assert solver.get_progress()["status"] == "completed"


@pytest.mark.parametrize("timeout", [0, -1, float("nan"), float("inf")])
def test_invalid_solver_wait_never_starts_a_worker(monkeypatch, timeout):
    class Model:
        def solve(self, study_name):
            pytest.fail(f"Invalid wait started study {study_name}")

    server, solver = _study_tools(monkeypatch, Model())
    result = _call_solve(server, timeout)
    assert result["success"] is False
    assert "positive and finite" in result["error"]
    assert solver.get_progress()["status"] == "idle"
    assert not solver.is_running
