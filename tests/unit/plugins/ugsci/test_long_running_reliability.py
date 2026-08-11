# -*- coding: utf-8 -*-
"""Boundaries for multi-day simulation persistence and recovery."""

# pylint: disable=protected-access,unused-argument

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from types import SimpleNamespace

import pytest

from plugins.bundle.ugsci.engine.tools import job_store
from plugins.bundle.ugsci.engine.tools.autotune import (
    create_tuning_candidate,
    diagnose_terminal_job,
)


def _use_tmp_store(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        job_store,
        "_store_file",
        lambda: tmp_path / "jobs.json",
    )


def test_sqlite_store_claims_terminal_and_wake_once(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _use_tmp_store(tmp_path, monkeypatch)
    job_store.save_job("job-1", {"job_id": "job-1", "status": "failed"})
    assert job_store.claim_terminal_notification("job-1") is True
    assert job_store.claim_terminal_notification("job-1") is False
    claimed, attempt, run_key = job_store.claim_wake_attempt(
        "job-1",
        max_attempts=2,
    )
    assert (claimed, attempt, run_key) == (
        True,
        1,
        "simulation:job-1:terminal",
    )
    claimed_again, _, _ = job_store.claim_wake_attempt("job-1", max_attempts=2)
    assert claimed_again is False
    job_store.finish_wake_attempt("job-1", success=True, run_id="cron-run")
    assert job_store.load_job("job-1")["wake_status"] == "completed"


def test_wake_lease_covers_full_agent_runtime(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _use_tmp_store(tmp_path, monkeypatch)
    job_store.save_job(
        "job-lease",
        {"job_id": "job-lease", "status": "failed"},
    )
    monkeypatch.setattr(job_store.time, "time", lambda: 100.0)
    assert job_store.claim_wake_attempt("job-lease")[0] is True
    monkeypatch.setattr(job_store.time, "time", lambda: 700.0)
    assert job_store.claim_wake_attempt("job-lease")[0] is False
    monkeypatch.setattr(job_store.time, "time", lambda: 1301.0)
    claimed, attempt, _ = job_store.claim_wake_attempt("job-lease")
    assert claimed is True
    assert attempt == 2


def test_legacy_json_is_archived_after_successful_migration(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _use_tmp_store(tmp_path, monkeypatch)
    legacy = tmp_path / "jobs.json"
    legacy.write_text(
        json.dumps({"old-job": {"job_id": "old-job", "status": "completed"}}),
        encoding="utf-8",
    )
    assert job_store.load_job("old-job")["status"] == "completed"
    assert not legacy.exists()
    assert (tmp_path / "jobs.json.migrated").is_file()


def test_job_event_log_is_idempotent_and_replayable(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _use_tmp_store(tmp_path, monkeypatch)
    job_store.save_job("job-2", {"job_id": "job-2", "status": "running"})
    seq1, changed1 = job_store.append_job_event_if_changed(
        "job-2",
        {"job_id": "job-2", "status": "running"},
    )
    seq2, changed2 = job_store.append_job_event_if_changed(
        "job-2",
        {"job_id": "job-2", "status": "running"},
    )
    assert seq1 == seq2
    assert changed1 is True
    assert changed2 is False
    assert (
        job_store.list_job_events("job-2", after_sequence=0)[0]["sequence"]
        == seq1
    )


def test_autotune_creates_versioned_candidate_without_mutating_source(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("QWENPAW_UGSCI_MAX_TUNING_ATTEMPTS", "2")
    deck = tmp_path / "CASE.DATA"
    original = "RUNSPEC\nNSTACK\n 10 /\nLITMAX\n 20 /\n"
    deck.write_text(original, encoding="utf-8")
    job = SimpleNamespace(
        job_id="sim_fail",
        simulator="eclipse",
        deck_file=str(deck),
        working_dir=str(tmp_path),
        status="failed",
        error="Newton convergence failed",
        extra={},
    )
    diagnosis = diagnose_terminal_job(job)
    candidate = create_tuning_candidate(job, diagnosis, attempt=1)
    assert candidate is not None
    assert deck.read_text(encoding="utf-8") == original
    candidate_path = Path(candidate["candidate_deck"])
    assert candidate_path.name == "CASE.autotune.sim_fail.r1.DATA"
    text = candidate_path.read_text(encoding="utf-8")
    assert "NSTACK\n 15 /" in text
    assert "LITMAX\n 30 /" in text
    assert (
        hashlib.sha256(deck.read_bytes()).hexdigest()
        == candidate["source_sha256"]
    )
    assert (
        json.loads(
            candidate_path.with_suffix(
                candidate_path.suffix + ".tuning.json",
            ).read_text(encoding="utf-8"),
        )["rollback"]["source_unchanged"]
        is True
    )


@pytest.mark.asyncio
async def test_resume_retries_are_bounded_and_idempotent(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from plugins.bundle.ugsci.engine.tools import launcher

    calls: list[int] = []
    monkeypatch.setattr(
        job_store,
        "claim_wake_attempt",
        lambda *args, **kwargs: (
            (True, len(calls) + 1, "key")
            if len(calls) < 2
            else (False, 2, "key")
        ),
    )

    async def _fail(*args, **kwargs):
        calls.append(1)
        raise RuntimeError("workspace unavailable")

    monkeypatch.setattr(launcher, "_run_agent_resume", _fail)

    async def _noop_sleep(_delay: float) -> None:
        return None

    monkeypatch.setattr(launcher.asyncio, "sleep", _noop_sleep)
    job = SimpleNamespace(job_id="job-3", deck_file="CASE.DATA", extra={})
    await launcher._resume_agent_with_retries(job, {}, None)
    assert len(calls) == 2


def test_recover_dead_eclipse_uses_deck_output_dir_and_terminal_artifacts(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from plugins.bundle.ugsci.engine.tools import launcher

    output_dir = tmp_path / "CASE_run"
    output_dir.mkdir()
    deck = output_dir / "CASE.DATA"
    deck.write_text("RUNSPEC\n", encoding="utf-8")
    (output_dir / "CASE.ECLEND").write_text("", encoding="utf-8")
    (output_dir / "CASE.PRT").write_text(
        "Final cpu 6863.68\nErrors 0\nProblems 0\n",
        encoding="utf-8",
    )
    now = 2_000_000.0
    stored = {
        "job_id": "artifact_success",
        "simulator": "eclipse",
        "deck_file": str(deck),
        "working_dir": str(tmp_path),
        "pid": 60988,
        "status": "running",
        # Even an overdue recovered record must inspect a dead process's
        # terminal artifacts before classifying it as a timeout.
        "start_ts": now - 86401.0,
        "timeout": 86400.0,
        "returncode": None,
        "error": None,
    }
    status_updates: list[tuple[tuple[object, ...], dict[str, object]]] = []
    field_updates: list[tuple[tuple[object, ...], dict[str, object]]] = []
    monkeypatch.setattr(job_store, "load_job", lambda _job_id: stored)
    monkeypatch.setattr(job_store, "is_pid_alive", lambda _pid: False)
    monkeypatch.setattr(
        job_store,
        "update_job_status",
        lambda *args, **kwargs: status_updates.append((args, kwargs)),
    )
    monkeypatch.setattr(
        job_store,
        "update_job_fields",
        lambda *args, **kwargs: field_updates.append((args, kwargs)),
    )
    monkeypatch.setattr(launcher.time, "time", lambda: now)
    launcher._sim_jobs.pop("artifact_success", None)

    recovered = launcher._recover_job("artifact_success")

    assert recovered is not None
    assert recovered.status == "completed"
    assert recovered.returncode == 0
    assert recovered.working_dir == str(output_dir.resolve())
    assert recovered.extra["output_dir"] == str(output_dir.resolve())
    assert field_updates[-1][1] == {
        "working_dir": str(output_dir.resolve()),
        "output_dir": str(output_dir.resolve()),
        "execution_dir": str(tmp_path),
    }
    assert status_updates[-1][0][:2] == ("artifact_success", "completed")
    assert status_updates[-1][1]["returncode"] == 0
    launcher._sim_jobs.pop("artifact_success", None)


def test_eclipse_terminal_summary_with_errors_is_failed(
    tmp_path: Path,
) -> None:
    from plugins.bundle.ugsci.engine.tools import launcher

    deck = tmp_path / "BAD.DATA"
    deck.write_text("RUNSPEC\n", encoding="utf-8")
    (tmp_path / "BAD.ECLEND").write_text("", encoding="utf-8")
    (tmp_path / "BAD.PRT").write_text(
        "END OF SIMULATION\nFINAL CPU 12.0\nErrors: 2\nProblems: 1\n",
        encoding="utf-8",
    )
    job = launcher.SimJob(
        job_id="artifact_failure",
        simulator="eclipse",
        deck_file=str(deck),
        working_dir=str(tmp_path),
        pid=0,
        start_ts=(tmp_path / "BAD.PRT").stat().st_mtime,
    )

    status, returncode, error = launcher._terminal_status_from_artifacts(job)

    assert status == "failed"
    assert returncode is None
    assert "errors=2" in str(error)
    assert "problems=1" in str(error)


def test_unknown_start_time_does_not_trust_terminal_artifacts(
    tmp_path: Path,
) -> None:
    from plugins.bundle.ugsci.engine.tools import launcher

    deck = tmp_path / "UNKNOWN.DATA"
    deck.write_text("RUNSPEC\n", encoding="utf-8")
    (tmp_path / "UNKNOWN.ECLEND").write_text("", encoding="utf-8")
    (tmp_path / "UNKNOWN.PRT").write_text(
        "FINAL CPU 1.0\nErrors 0\nProblems 0\n",
        encoding="utf-8",
    )
    job = launcher.SimJob(
        job_id="unknown-start",
        simulator="eclipse",
        deck_file=str(deck),
        working_dir=str(tmp_path),
        pid=0,
        start_ts=0,
    )

    assert launcher._terminal_status_from_artifacts(job) == (None, None, None)


def test_stale_terminal_artifacts_are_not_accepted(tmp_path: Path) -> None:
    from plugins.bundle.ugsci.engine.tools import launcher

    deck = tmp_path / "STALE.DATA"
    deck.write_text("RUNSPEC\n", encoding="utf-8")
    eclend = tmp_path / "STALE.ECLEND"
    prt = tmp_path / "STALE.PRT"
    eclend.write_text("", encoding="utf-8")
    prt.write_text("FINAL CPU 1\nErrors 0\nProblems 0\n", encoding="utf-8")
    os.utime(eclend, (100.0, 100.0))
    os.utime(prt, (100.0, 100.0))
    job = launcher.SimJob(
        job_id="stale-artifacts",
        simulator="eclipse",
        deck_file=str(deck),
        working_dir=str(tmp_path),
        pid=0,
        start_ts=1_000.0,
    )

    assert launcher._terminal_status_from_artifacts(job) == (None, None, None)


@pytest.mark.asyncio
async def test_pid_exit_during_identity_check_uses_terminal_artifacts(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from plugins.bundle.ugsci.engine.tools import launcher

    deck = tmp_path / "RACE.DATA"
    deck.write_text("RUNSPEC\n", encoding="utf-8")
    (tmp_path / "RACE.ECLEND").write_text("", encoding="utf-8")
    (tmp_path / "RACE.PRT").write_text(
        "FINAL CPU 1\nErrors 0\nProblems 0\n",
        encoding="utf-8",
    )
    job = launcher.SimJob(
        job_id="pid-race",
        simulator="eclipse",
        deck_file=str(deck),
        working_dir=str(tmp_path),
        pid=123,
        status="running",
        start_ts=1.0,
        process=None,
    )
    alive_results = iter((True, False))
    monkeypatch.setattr(
        job_store,
        "is_pid_alive",
        lambda _pid: next(alive_results),
    )
    monkeypatch.setattr(job_store, "is_pid_ours", lambda *args: False)
    updates: list[tuple[tuple[object, ...], dict[str, object]]] = []
    monkeypatch.setattr(
        job_store,
        "update_job_status",
        lambda *args, **kwargs: updates.append((args, kwargs)),
    )

    async def _noop_notify(_job) -> None:
        return None

    monkeypatch.setattr(launcher, "_notify_terminal_job", _noop_notify)

    await launcher._monitor_recovered_job(job)

    assert job.status == "completed"
    assert job.returncode == 0
    assert updates[-1][0][:2] == ("pid-race", "completed")


@pytest.mark.asyncio
async def test_failed_recovered_timeout_termination_stays_running(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from plugins.bundle.ugsci.engine.tools import launcher

    job = launcher.SimJob(
        job_id="termination-failed",
        simulator="eclipse",
        deck_file="CASE.DATA",
        working_dir=".",
        pid=123,
        status="running",
        start_ts=1.0,
        timeout=1.0,
        process=None,
    )
    monkeypatch.setattr(job_store, "is_pid_alive", lambda _pid: True)
    monkeypatch.setattr(job_store, "is_pid_ours", lambda *args: True)
    monkeypatch.setattr(launcher.time, "time", lambda: 100.0)

    async def _cannot_terminate(_job) -> bool:
        return False

    async def _stop_after_first_retry(_delay: float) -> None:
        assert job.status == "running"
        assert "still alive" in str(job.error)
        raise RuntimeError("stop test loop")

    monkeypatch.setattr(
        launcher,
        "_terminate_recovered_process",
        _cannot_terminate,
    )
    monkeypatch.setattr(launcher.asyncio, "sleep", _stop_after_first_retry)

    with pytest.raises(RuntimeError, match="stop test loop"):
        await launcher._monitor_recovered_job(job)

    assert job.status == "running"


@pytest.mark.asyncio
async def test_terminal_cleanup_deletes_only_matching_recurring_monitors(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from plugins.bundle.ugsci.engine.tools import launcher
    from qwenpaw.plugins import registry

    recurring = SimpleNamespace(type="cron")
    once = SimpleNamespace(type="once")
    specs = [
        SimpleNamespace(
            id="structured-monitor",
            name="watch",
            schedule=recurring,
            text=None,
            request=SimpleNamespace(
                input="check status",
                request_context={"simulation_job_id": "sim_target"},
            ),
            dispatch=SimpleNamespace(meta={}),
            meta={},
        ),
        SimpleNamespace(
            id="legacy-monitor",
            name="旧模拟监测",
            schedule=recurring,
            text=None,
            request=SimpleNamespace(
                input="每十分钟监测模拟任务 sim_target 的状态",
                request_context={},
            ),
            dispatch=SimpleNamespace(meta={}),
            meta={},
        ),
        SimpleNamespace(
            id="one-shot-resume",
            name="Resume simulation sim_target",
            schedule=once,
            text=None,
            request=SimpleNamespace(
                input="simulation sim_target completed",
                request_context={"simulation_job_id": "sim_target"},
            ),
            dispatch=SimpleNamespace(meta={}),
            meta={"simulation_job_id": "sim_target"},
        ),
        SimpleNamespace(
            id="other-monitor",
            name="模拟监测",
            schedule=recurring,
            text=None,
            request=SimpleNamespace(
                input="监测模拟任务 sim_other 的状态",
                request_context={},
            ),
            dispatch=SimpleNamespace(meta={}),
            meta={},
        ),
        SimpleNamespace(
            id="structured-report",
            name="archive simulation results",
            schedule=recurring,
            text=None,
            request=SimpleNamespace(
                input="archive results every day",
                request_context={"simulation_job_id": "sim_target"},
            ),
            dispatch=SimpleNamespace(meta={}),
            meta={},
        ),
    ]

    class FakeCronManager:
        def __init__(self) -> None:
            self.deleted: list[str] = []

        async def list_jobs(self):
            return specs

        async def delete_job(self, cron_id: str):
            self.deleted.append(cron_id)
            return True

    fake_cron_manager = FakeCronManager()

    class FakeWorkspaceManager:
        async def get_agent(self, agent_id: str):
            assert agent_id == "agent-1"
            return SimpleNamespace(cron_manager=fake_cron_manager)

    class FakeRegistry:
        def get_workspace_manager(self):
            return FakeWorkspaceManager()

    monkeypatch.setattr(registry, "PluginRegistry", FakeRegistry)
    job = SimpleNamespace(job_id="sim_target", extra={"agent_id": "agent-1"})

    deleted = await launcher._cleanup_simulation_monitor_crons(job)

    assert deleted == ["structured-monitor", "legacy-monitor"]
    assert fake_cron_manager.deleted == deleted


@pytest.mark.asyncio
async def test_failed_cron_cleanup_is_retried_without_model_wakeup(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from plugins.bundle.ugsci.engine.tools import launcher

    _use_tmp_store(tmp_path, monkeypatch)
    job_store.save_job(
        "cleanup-retry",
        {
            "job_id": "cleanup-retry",
            "status": "completed",
            "cron_cleanup_status": "failed",
            "cron_cleanup_attempts": 1,
        },
    )
    job = launcher.SimJob(
        job_id="cleanup-retry",
        simulator="eclipse",
        deck_file="CASE.DATA",
        working_dir=str(tmp_path),
        pid=0,
        status="completed",
    )
    launcher._sim_jobs[job.job_id] = job
    calls = 0

    async def _cleanup(_job) -> list[str]:
        nonlocal calls
        calls += 1
        if calls == 1:
            raise RuntimeError("cron store unavailable")
        return ["monitor-1"]

    async def _no_wait(_delay: float) -> None:
        return None

    monkeypatch.setattr(
        launcher,
        "_cleanup_simulation_monitor_crons",
        _cleanup,
    )
    monkeypatch.setattr(launcher.asyncio, "sleep", _no_wait)

    try:
        await launcher._retry_simulation_monitor_cleanup(job.job_id)
        stored = job_store.load_job(job.job_id)
        assert calls == 2
        assert stored["cron_cleanup_status"] == "completed"
        assert stored["cron_cleanup_attempts"] == 3
    finally:
        launcher._sim_jobs.pop(job.job_id, None)


@pytest.mark.asyncio
async def test_completed_wake_skips_repeated_diagnosis_and_resume(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from plugins.bundle.ugsci.engine.tools import launcher

    stored = {
        "job_id": "cleanup-only",
        "status": "completed",
        "terminal_notified": True,
        "wake_status": "completed",
        "cron_cleanup_status": "completed",
        "diagnosis_rounds": 1,
        "diagnosis": {"category": "completed"},
    }
    monkeypatch.setattr(job_store, "load_job", lambda _job_id: stored)
    monkeypatch.setattr(
        job_store,
        "claim_terminal_notification",
        lambda _job_id: False,
    )

    async def _unexpected_resume(*_args, **_kwargs):
        raise AssertionError("a completed wake must not be resumed again")

    monkeypatch.setattr(
        launcher,
        "_resume_agent_with_retries",
        _unexpected_resume,
    )
    job = SimpleNamespace(
        job_id="cleanup-only",
        deck_file="CASE.DATA",
        status="completed",
        pid=1,
        extra={},
    )

    await launcher._notify_terminal_job(job)
