# -*- coding: utf-8 -*-
"""Tests for the three minor engine tool fixes (5.1 / 5.2 / 5.3).

Covers:
- 5.1: ``_monitor_job`` records ``end_time`` *after* process completion.
- 5.2: ``read_simulation_results`` validates ``data_type`` and ``max_points``.
- 5.3: ``_write_engine`` uses an atomic temp-file + ``os.replace``.
"""

# pylint: disable=protected-access,redefined-outer-name,unused-argument

from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path

import pytest

from plugins.bundle.ugsci.engine.manager import (
    EngineInfo,
    _engine_file_path,
    _read_all_engines,
    _read_engine,
    _write_engine,
)
from plugins.bundle.ugsci.engine.tools.launcher import (
    SimJob,
    _monitor_job,
    _sim_jobs,
)

# ──────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────


class _FakeProcess:
    """Minimal async subprocess stand-in for _monitor_job tests."""

    def __init__(self, returncode: int = 0, hang: bool = False) -> None:
        self.returncode = returncode
        self._hang = hang
        self.killed = False
        self._wait_event = asyncio.Event()

    async def wait(self) -> int:
        if self._hang:
            await self._wait_event.wait()
        return self.returncode

    def kill(self) -> None:
        self.killed = True
        self.returncode = -9
        self._wait_event.set()

    @property
    def pid(self) -> int:
        return 99999


# ──────────────────────────────────────────────────────────────────────────
# Fix 5.1 — monotonic end_time is recorded after wait()
# ──────────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_monitor_job_end_time_is_after_wait() -> None:
    """end_time must be greater than start_time (not pre-wait)."""
    proc = _FakeProcess(returncode=0)
    loop = asyncio.get_running_loop()
    start_mono = loop.time()

    job = SimJob(
        job_id="test_end_time",
        simulator="eclipse",
        deck_file="model.DATA",
        working_dir="/tmp",
        pid=proc.pid,
        status="running",
        start_time=start_mono,
        start_ts=1_000_000.0,
        timeout=5.0,
        process=proc,
    )
    _sim_jobs["test_end_time"] = job

    await _monitor_job("test_end_time")

    assert job.status == "completed"
    assert job.end_time is not None
    assert job.end_time >= start_mono
    assert job.end_ts is not None
    assert job.end_ts > 0

    _sim_jobs.pop("test_end_time", None)


@pytest.mark.asyncio
async def test_monitor_job_timeout_records_correct_end_time() -> None:
    """end_time should be recorded after the timeout kill, not before."""
    proc = _FakeProcess(hang=True)
    loop = asyncio.get_running_loop()
    start_mono = loop.time()

    job = SimJob(
        job_id="test_timeout_end",
        simulator="eclipse",
        deck_file="model.DATA",
        working_dir="/tmp",
        pid=proc.pid,
        status="running",
        start_time=start_mono,
        start_ts=1_000_000.0,
        timeout=0.05,
        process=proc,
    )
    _sim_jobs["test_timeout_end"] = job

    await _monitor_job("test_timeout_end")

    assert job.status == "timeout"
    assert proc.killed is True
    assert job.end_time is not None
    assert job.end_time >= start_mono

    _sim_jobs.pop("test_timeout_end", None)


@pytest.mark.asyncio
async def test_monitor_job_error_path_still_sets_end_time() -> None:
    """Even on error, end_time/end_ts should be set (not None)."""

    class _ExplodingProc:
        pid = 42

        async def wait(self) -> int:
            raise RuntimeError("boom")

    loop = asyncio.get_running_loop()
    start_mono = loop.time()

    job = SimJob(
        job_id="test_error_end",
        simulator="eclipse",
        deck_file="model.DATA",
        working_dir="/tmp",
        pid=42,
        status="running",
        start_time=start_mono,
        start_ts=1_000_000.0,
        timeout=5.0,
        process=_ExplodingProc(),
    )
    _sim_jobs["test_error_end"] = job

    await _monitor_job("test_error_end")

    assert job.status == "error"
    assert job.end_time is not None
    assert job.end_time >= start_mono
    assert job.end_ts is not None

    _sim_jobs.pop("test_error_end", None)


# ──────────────────────────────────────────────────────────────────────────
# Fix 5.2 — result_reader validates data_type and max_points
# ──────────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_result_reader_rejects_unknown_data_type() -> None:
    """Unknown data_type returns an error, not a silent success."""
    from plugins.bundle.ugsci.engine.tools.result_reader import (
        read_simulation_results,
    )

    result = await read_simulation_results(
        job_id="nonexistent",
        data_type="unknown_type",
    )

    assert result is not None
    text = result.content[0].text if result.content else ""
    assert "Unknown data_type" in text
    assert "unknown_type" in text


@pytest.mark.asyncio
async def test_result_reader_zero_max_points_does_not_crash() -> None:
    """max_points=0 is corrected to default, never ZeroDivisionError."""
    from plugins.bundle.ugsci.engine.tools.result_reader import (
        read_simulation_results,
    )

    # Job won't be found, but that's fine — the point is that the
    # max_points validation runs first and prevents a ZeroDivisionError.
    # The function should return an error about the job, not a crash.
    result = await read_simulation_results(
        job_id="nonexistent_job",
        data_type="summary",
        max_points=0,
    )

    assert result is not None
    # Should reach the "job not found" error, not crash
    text = result.content[0].text if result.content else ""
    assert "not found" in text.lower()


@pytest.mark.asyncio
async def test_result_reader_negative_max_points_does_not_crash() -> None:
    """max_points<0 is also corrected to default."""
    from plugins.bundle.ugsci.engine.tools.result_reader import (
        read_simulation_results,
    )

    result = await read_simulation_results(
        job_id="nonexistent_job",
        data_type="well",
        max_points=-5,
    )

    assert result is not None
    text = result.content[0].text if result.content else ""
    assert "not found" in text.lower()


@pytest.mark.asyncio
async def test_result_reader_formats_bounded_comsol_field_preview(
    tmp_path: Path,
) -> None:
    from plugins.bundle.ugsci.engine.tools.result_reader import (
        read_simulation_results,
    )

    (tmp_path / "model_field.csv").write_text(
        "% X,Y,comp1.c(x, y) (mol/m^3)\n0,0,1\n1,0,2\n",
        encoding="utf-8",
    )
    job = SimJob(
        job_id="comsol_field",
        simulator="comsol",
        deck_file=str(tmp_path / "model.mph"),
        working_dir=str(tmp_path),
        pid=0,
        status="completed",
    )
    _sim_jobs[job.job_id] = job
    try:
        result = await read_simulation_results(job.job_id, data_type="field")
    finally:
        _sim_jobs.pop(job.job_id, None)

    text = result.content[0].text if result.content else ""
    assert "Spatial/table exports" in text
    assert "spatial_point_cloud" in text
    assert "shape=2x3" in text
    assert "comp1.c(x, y)" in text


# ──────────────────────────────────────────────────────────────────────────
# Fix 5.3 — _write_engine uses atomic temp-file + os.replace
# ──────────────────────────────────────────────────────────────────────────


def test_write_engine_uses_os_replace(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """_write_engine should use os.replace, not direct write_text."""
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager.ENGINES_DIR",
        tmp_path,
    )

    engine = EngineInfo(
        id="test_atomic",
        name="Test Atomic",
        vendor="Test",
        is_custom=True,
    )

    replace_called: list[tuple[str, str]] = []
    original_replace = os.replace

    def _tracking_replace(src: str, dst: str) -> None:
        replace_called.append((str(src), str(dst)))
        original_replace(src, dst)

    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager.os.replace",
        _tracking_replace,
    )

    _write_engine(engine)

    # Verify os.replace was called with a temp source and json dest
    assert len(replace_called) == 1
    src, dst = replace_called[0]
    assert ".tmp" in src
    assert dst.endswith("test_atomic.json")

    # Verify the file was written correctly
    written = _read_engine("test_atomic")
    assert written is not None
    assert written.name == "Test Atomic"


def test_write_engine_no_corrupt_on_success(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """After a successful write, the JSON file is valid and readable."""
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager.ENGINES_DIR",
        tmp_path,
    )

    engine = EngineInfo(
        id="test_valid",
        name="Test Valid",
        vendor="TestCo",
        version="1.0",
        is_custom=True,
    )
    _write_engine(engine)

    path = _engine_file_path("test_valid")
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["id"] == "test_valid"
    assert data["name"] == "Test Valid"

    # No temp files should remain
    remaining_tmps = list(tmp_path.glob(".*tmp"))
    assert not remaining_tmps


def test_write_engine_no_temp_file_remains(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """No leftover temp files after _write_engine."""
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager.ENGINES_DIR",
        tmp_path,
    )

    engine = EngineInfo(id="cleanup_test", name="Cleanup", is_custom=True)
    _write_engine(engine)

    all_files = list(tmp_path.iterdir())
    # Should only have the final JSON file
    assert len(all_files) == 1
    assert all_files[0].name == "cleanup_test.json"


def test_read_all_engines_skips_corrupt(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """_read_all_engines should skip corrupt files (existing behavior)."""
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager.ENGINES_DIR",
        tmp_path,
    )

    good_engine = EngineInfo(id="good", name="Good Engine", is_custom=True)
    _write_engine(good_engine)

    corrupt_path = tmp_path / "corrupt.json"
    corrupt_path.write_text("{invalid json", encoding="utf-8")

    engines = _read_all_engines()
    assert len(engines) == 1
    assert engines[0].id == "good"


# ──────────────────────────────────────────────────────────────────────────
# BUG-007 — _recover_job must not optimistically mark dead PIDs as completed
# ──────────────────────────────────────────────────────────────────────────


def test_recover_job_dead_pid_no_returncode_marks_interrupted(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """When a PID is dead and no returncode was stored, the recovered
    job must be marked 'interrupted', NOT 'completed' (BUG-007)."""
    from plugins.bundle.ugsci.engine.tools import launcher
    from plugins.bundle.ugsci.engine.tools import job_store

    # Stub job_store so we don't touch disk.
    stored_meta = {
        "job_id": "bug007_dead",
        "simulator": "eclipse",
        "deck_file": "/work/model.DATA",
        "working_dir": "/work",
        "pid": 99999,
        "status": "running",
        "start_ts": 1_000_000.0,
        "timeout": 86400.0,
        "returncode": None,
        "error": None,
    }

    monkeypatch.setattr(job_store, "load_job", lambda jid: stored_meta)
    monkeypatch.setattr(job_store, "is_pid_alive", lambda pid: False)
    monkeypatch.setattr(
        job_store,
        "update_job_status",
        lambda *a, **kw: None,
    )

    # Clear in-memory table
    launcher._sim_jobs.pop("bug007_dead", None)

    # Patch time.time so the job appears to have started recently
    # (otherwise the timeout check fires before the PID check).
    import time as _time

    _now = _time.time()
    monkeypatch.setattr(_time, "time", lambda: _now)
    stored_meta["start_ts"] = _now

    job = launcher._recover_job("bug007_dead")

    assert job is not None
    assert job.status == "interrupted"
    assert job.returncode is None

    launcher._sim_jobs.pop("bug007_dead", None)


def test_recover_job_dead_pid_with_zero_returncode_marks_completed(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """If a returncode of 0 was stored (monitor finished before restart),
    recovery should trust it and mark as 'completed'."""
    from plugins.bundle.ugsci.engine.tools import launcher
    from plugins.bundle.ugsci.engine.tools import job_store

    stored_meta = {
        "job_id": "bug007_rc0",
        "simulator": "eclipse",
        "deck_file": "/work/model.DATA",
        "working_dir": "/work",
        "pid": 99998,
        "status": "running",
        "start_ts": 1_000_000.0,
        "timeout": 86400.0,
        "returncode": 0,
        "error": None,
    }

    monkeypatch.setattr(job_store, "load_job", lambda jid: stored_meta)
    monkeypatch.setattr(job_store, "is_pid_alive", lambda pid: False)
    monkeypatch.setattr(
        job_store,
        "update_job_status",
        lambda *a, **kw: None,
    )

    launcher._sim_jobs.pop("bug007_rc0", None)

    # Patch time.time so the job appears to have started recently.
    import time as _time

    _now = _time.time()
    monkeypatch.setattr(_time, "time", lambda: _now)
    stored_meta["start_ts"] = _now

    job = launcher._recover_job("bug007_rc0")

    assert job is not None
    assert job.status == "completed"
    assert job.returncode == 0

    launcher._sim_jobs.pop("bug007_rc0", None)


def test_recover_job_dead_pid_with_nonzero_returncode_marks_failed(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """If a non-zero returncode was stored, recovery should mark as
    'failed', not 'completed'."""
    from plugins.bundle.ugsci.engine.tools import launcher
    from plugins.bundle.ugsci.engine.tools import job_store

    stored_meta = {
        "job_id": "bug007_rc1",
        "simulator": "eclipse",
        "deck_file": "/work/model.DATA",
        "working_dir": "/work",
        "pid": 99997,
        "status": "running",
        "start_ts": 1_000_000.0,
        "timeout": 86400.0,
        "returncode": 1,
        "error": None,
    }

    monkeypatch.setattr(job_store, "load_job", lambda jid: stored_meta)
    monkeypatch.setattr(job_store, "is_pid_alive", lambda pid: False)
    monkeypatch.setattr(
        job_store,
        "update_job_status",
        lambda *a, **kw: None,
    )

    launcher._sim_jobs.pop("bug007_rc1", None)

    # Patch time.time so the job appears to have started recently.
    import time as _time

    _now = _time.time()
    monkeypatch.setattr(_time, "time", lambda: _now)
    stored_meta["start_ts"] = _now

    job = launcher._recover_job("bug007_rc1")

    assert job is not None
    assert job.status == "failed"
    assert job.returncode == 1

    launcher._sim_jobs.pop("bug007_rc1", None)


def test_recover_job_pid_reuse_marks_interrupted(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """If the PID is alive but identity cannot be confirmed (PID reuse
    suspected), the job should be marked 'interrupted' (BUG-007)."""
    from plugins.bundle.ugsci.engine.tools import launcher
    from plugins.bundle.ugsci.engine.tools import job_store

    stored_meta = {
        "job_id": "bug007_reuse",
        "simulator": "eclipse",
        "deck_file": "/work/model.DATA",
        "working_dir": "/work",
        "pid": 99996,
        "status": "running",
        "start_ts": 1_000_000.0,
        "timeout": 86400.0,
        "returncode": None,
        "error": None,
    }

    monkeypatch.setattr(job_store, "load_job", lambda jid: stored_meta)
    monkeypatch.setattr(job_store, "is_pid_alive", lambda pid: True)
    monkeypatch.setattr(job_store, "is_pid_ours", lambda *a, **kw: False)
    monkeypatch.setattr(
        job_store,
        "update_job_status",
        lambda *a, **kw: None,
    )

    launcher._sim_jobs.pop("bug007_reuse", None)

    # Patch time.time so the job appears to have started recently.
    import time as _time

    _now = _time.time()
    monkeypatch.setattr(_time, "time", lambda: _now)
    stored_meta["start_ts"] = _now

    job = launcher._recover_job("bug007_reuse")

    assert job is not None
    assert job.status == "interrupted"

    launcher._sim_jobs.pop("bug007_reuse", None)


def test_recover_job_pid_alive_same_process_stays_running(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """If the PID is alive and identity is confirmed, the job stays
    'running' — the simulation is still in progress."""
    from plugins.bundle.ugsci.engine.tools import launcher
    from plugins.bundle.ugsci.engine.tools import job_store

    stored_meta = {
        "job_id": "bug007_alive",
        "simulator": "eclipse",
        "deck_file": "/work/model.DATA",
        "working_dir": "/work",
        "pid": 99995,
        "status": "running",
        "start_ts": 1_000_000.0,
        "timeout": 86400.0,
        "returncode": None,
        "error": None,
    }

    monkeypatch.setattr(job_store, "load_job", lambda jid: stored_meta)
    monkeypatch.setattr(job_store, "is_pid_alive", lambda pid: True)
    monkeypatch.setattr(job_store, "is_pid_ours", lambda *a, **kw: True)
    monkeypatch.setattr(
        job_store,
        "update_job_status",
        lambda *a, **kw: None,
    )

    launcher._sim_jobs.pop("bug007_alive", None)

    # Patch time.time so the job appears to have started recently.
    import time as _time

    _now = _time.time()
    monkeypatch.setattr(_time, "time", lambda: _now)
    stored_meta["start_ts"] = _now

    job = launcher._recover_job("bug007_alive")

    assert job is not None
    assert job.status == "running"

    launcher._sim_jobs.pop("bug007_alive", None)
