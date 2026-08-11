# -*- coding: utf-8 -*-
"""Fail-closed diagnostics and bounded tuning candidates for simulations."""
from __future__ import annotations

import hashlib
import json
import math
import os
import re
import tempfile
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class ParameterChange:
    keyword: str
    previous: int
    proposed: int
    minimum: int
    maximum: int


_PARAMETER_RULES = {
    "NSTACK": (1, 100, lambda value: max(value + 5, math.ceil(value * 1.5))),
    "LITMAX": (1, 100, lambda value: max(value + 5, math.ceil(value * 1.5))),
}
_CONVERGENCE_MARKERS = (
    "converg",
    "newton",
    "timestep",
    "time step",
    "cutback",
    "nstack",
    "litmax",
    "iteration limit",
)


def _int_env(name: str, default: int, minimum: int, maximum: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        value = default
    return min(max(value, minimum), maximum)


def max_diagnosis_rounds() -> int:
    return _int_env("QWENPAW_UGSCI_MAX_DIAGNOSIS_ROUNDS", 2, 1, 5)


def max_tuning_attempts() -> int:
    return _int_env("QWENPAW_UGSCI_MAX_TUNING_ATTEMPTS", 2, 0, 5)


def human_approval_required() -> bool:
    raw = os.getenv("QWENPAW_UGSCI_AUTO_TUNE_REQUIRE_APPROVAL", "true")
    return raw.strip().casefold() not in {"0", "false", "no", "off"}


def _read_evidence(job: Any) -> list[str]:
    evidence: list[str] = []
    if job.error:
        evidence.append(str(job.error))
    try:
        from ..adapters import get_adapter

        adapter = get_adapter(job.simulator)
        progress = adapter.parse_progress(job.working_dir)
        evidence.extend(
            [
                f"adapter_status={progress.status}",
                f"time_step={progress.current_step}",
                f"newton_iterations={progress.newton_iterations}",
            ]
        )
        for warning in adapter.parse_warnings(job.working_dir, limit=30):
            evidence.append(str(warning.message))
    except Exception as exc:
        evidence.append(f"adapter_diagnostics_unavailable={exc}")
    log_path = Path(str(job.extra.get("log_path") or ""))
    if log_path.is_file():
        try:
            tail = log_path.read_text(encoding="utf-8", errors="replace")[-40_000:]
            evidence.extend(line.strip() for line in tail.splitlines()[-80:] if line.strip())
        except OSError:
            pass
    return evidence[-120:]


def diagnose_terminal_job(job: Any) -> dict[str, Any]:
    evidence = _read_evidence(job)
    folded = "\n".join(evidence).casefold()
    convergence = any(marker in folded for marker in _CONVERGENCE_MARKERS)
    if job.status == "completed":
        category = "completed"
        recommendation = "Verify outputs and compare convergence metrics with the baseline."
    elif convergence:
        category = "convergence"
        recommendation = "Create a bounded NSTACK/LITMAX candidate and re-run only after validation."
    elif job.status == "timeout":
        category = "runtime_timeout"
        recommendation = "Inspect progress and CPU activity before increasing the runtime limit."
    elif job.status == "interrupted":
        category = "process_interrupted"
        recommendation = "Verify simulator completion markers and restart/checkpoint support."
    else:
        category = "simulator_failure"
        recommendation = "Inspect the terminal log and simulator return code before changing inputs."
    try:
        from ..adapters import get_adapter

        adapter = get_adapter(job.simulator)
        supports_auto_tune = bool(adapter.capabilities.supports_auto_tune)
    except Exception:
        supports_auto_tune = False
    return {
        "schema_version": 1,
        "job_id": job.job_id,
        "status": job.status,
        "category": category,
        "confidence": "high" if convergence else "medium",
        "evidence": evidence[-30:],
        "recommendations": [recommendation],
        "safe_to_generate_candidate": bool(
            convergence
            and supports_auto_tune
            and job.status in {"failed", "timeout", "error", "interrupted"}
        ),
    }


def _replace_parameter(
    text: str,
    keyword: str,
    propose: Any,
    minimum: int,
    maximum: int,
) -> tuple[str, ParameterChange | None]:
    pattern = re.compile(
        rf"(?im)^(?P<head>\s*{re.escape(keyword)}(?![A-Za-z0-9_])\s*(?:\r?\n\s*)?)(?P<value>\d+)(?P<tail>\s*(?:/)?[^\r\n]*)(?P<newline>\r?\n|$)"
    )
    match = pattern.search(text)
    if not match:
        return text, None
    previous = int(match.group("value"))
    proposed = min(max(int(propose(previous)), minimum), maximum)
    if proposed <= previous:
        return text, None
    replacement = (
        match.group("head")
        + str(proposed)
        + match.group("tail")
        + match.group("newline")
    )
    return (
        text[: match.start()] + replacement + text[match.end() :],
        ParameterChange(keyword, previous, proposed, minimum, maximum),
    )


def create_tuning_candidate(
    job: Any,
    diagnosis: dict[str, Any],
    *,
    attempt: int,
) -> dict[str, Any] | None:
    """Create an idempotent versioned candidate; never edit the source deck."""
    if not diagnosis.get("safe_to_generate_candidate"):
        return None
    if attempt < 1 or attempt > max_tuning_attempts():
        return None
    source = Path(job.deck_file).expanduser().resolve()
    working_dir = Path(str(getattr(job, "working_dir", "") or "")).expanduser().resolve()
    try:
        source.relative_to(working_dir)
    except ValueError:
        # Job metadata is durable input; fail closed if it was tampered with.
        return None
    if not source.is_file():
        return None
    original_bytes = source.read_bytes()
    original_sha = hashlib.sha256(original_bytes).hexdigest()
    text = original_bytes.decode("utf-8", errors="replace")
    try:
        from ..adapters import get_adapter

        adapter_rules = get_adapter(job.simulator).tuning_rules()
    except Exception:
        adapter_rules = {}
    parameter_rules = adapter_rules or _PARAMETER_RULES
    changes: list[ParameterChange] = []
    for keyword, (minimum, maximum, propose) in parameter_rules.items():
        text, change = _replace_parameter(text, keyword, propose, minimum, maximum)
        if change is not None:
            changes.append(change)
    if not changes:
        return None
    candidate = source.with_name(
        f"{source.stem}.autotune.{job.job_id}.r{attempt}{source.suffix}"
    )
    candidate_bytes = text.encode("utf-8")
    candidate_sha = hashlib.sha256(candidate_bytes).hexdigest()
    if candidate.exists():
        if hashlib.sha256(candidate.read_bytes()).hexdigest() != candidate_sha:
            raise RuntimeError(f"Tuning candidate already exists with different content: {candidate}")
    else:
        fd, tmp_name = tempfile.mkstemp(
            dir=str(candidate.parent),
            prefix=candidate.name + ".",
            suffix=".tmp",
        )
        try:
            with os.fdopen(fd, "wb") as handle:
                handle.write(candidate_bytes)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(tmp_name, candidate)
        except Exception:
            try:
                os.unlink(tmp_name)
            except OSError:
                pass
            raise
    manifest = {
        "schema_version": 1,
        "source_deck": str(source),
        "source_sha256": original_sha,
        "candidate_deck": str(candidate),
        "candidate_sha256": candidate_sha,
        "job_id": job.job_id,
        "attempt": attempt,
        "changes": [asdict(change) for change in changes],
        "approval_required": human_approval_required(),
        "rollback": {"action": "discard_candidate", "source_unchanged": True},
    }
    manifest_path = candidate.with_suffix(candidate.suffix + ".tuning.json")
    manifest_bytes = json.dumps(manifest, ensure_ascii=False, indent=2).encode("utf-8")
    fd, tmp_name = tempfile.mkstemp(
        dir=str(manifest_path.parent),
        prefix=manifest_path.name + ".",
        suffix=".tmp",
    )
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(manifest_bytes)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp_name, manifest_path)
    except Exception:
        try:
            os.unlink(tmp_name)
        except OSError:
            pass
        raise
    return manifest


__all__ = [
    "create_tuning_candidate",
    "diagnose_terminal_job",
    "human_approval_required",
    "max_diagnosis_rounds",
    "max_tuning_attempts",
]
