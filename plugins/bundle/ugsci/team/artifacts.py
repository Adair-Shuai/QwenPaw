# -*- coding: utf-8 -*-
"""Controller publications and reviews bound to immutable result versions.

Uses the existing per-instance state lock and revision check. Files are written
before the manifest commit, so an interrupted publish leaves an unreferenced
snapshot, never an approved version. This is not an OS sandbox for shell code.
"""

from __future__ import annotations

import hashlib
import json
import uuid
from pathlib import Path
from typing import NoReturn

from .state import TeamStateConflictError, TeamWorkflowState

LIMIT = 8 * 1024 * 1024


def _fail(message: str) -> NoReturn:
    raise TeamStateConflictError(message)


def _path(wf: TeamWorkflowState, relative: str) -> Path:
    root = wf.instance_dir
    if root is None or root.is_symlink():
        _fail("Invalid artifact root")
    rel = Path(relative)
    if rel.is_absolute() or ".." in rel.parts:
        _fail("Invalid artifact path")
    path = root / rel
    if not path.resolve().is_relative_to(root.resolve()):
        _fail("Artifact path escapes workflow")
    if any(p.is_symlink() for p in [path, *path.parents] if p != root.parent):
        _fail("Artifact symlinks are not supported")
    return path


def _read(wf: TeamWorkflowState, relative: str) -> bytes:
    path = _path(wf, relative)
    if not path.is_file() or path.stat().st_size > LIMIT:
        _fail("Artifact is missing or exceeds 8 MiB")
    with path.open("rb") as stream:
        raw = stream.read(LIMIT + 1)
    if len(raw) > LIMIT:
        _fail("Artifact exceeds 8 MiB")
    return raw


def _json(raw: bytes) -> dict:
    try:
        data = json.loads(raw)
    except (ValueError, UnicodeDecodeError):
        _fail("Artifact must be valid JSON")
    if not isinstance(data, dict) or not data:
        _fail("Artifact must be a nonempty JSON object")
    return data


def _hash(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def _snapshot(wf: TeamWorkflowState, relative: str, raw: bytes) -> dict:
    path = _path(wf, relative)
    path.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation; accepted snapshots are never overwritten.
    try:
        with path.open("xb") as stream:
            stream.write(raw)
    except FileExistsError:
        # A crash after snapshot creation but before state commit is safe
        # to retry only when the original bytes are identical.
        if _read(wf, relative) != raw:
            _fail(
                "An immutable artifact version already exists "
                "with other bytes",
            )
    return {"path": relative, "sha256": _hash(raw)}


def _alias(wf: TeamWorkflowState, relative: str, raw: bytes):
    path = _path(wf, relative)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + "." + uuid.uuid4().hex + ".tmp")
    try:
        tmp.write_bytes(raw)
        tmp.replace(path)
    finally:
        tmp.unlink(missing_ok=True)


def _checked(wf: TeamWorkflowState, revision: int, phase: str) -> dict:
    data = wf.read_state()
    if type(revision) is not int or data.get("revision") != revision:
        _fail("State changed; read the current revision again")
    if (
        data.get("artifact_protocol") != 1
        or data.get("workflow_status") != "active"
        or not data.get("active")
        or data.get("current_phase") != phase
    ):
        _fail("Artifact operation is not available in this phase")
    return data


def freeze_plan(wf: TeamWorkflowState, data: dict) -> dict:
    raw = _read(wf, "handoffs/plan.json")
    steps = _json(raw).get("steps")
    if not isinstance(steps, list) or not 1 <= len(steps) <= 100:
        _fail("Plan must contain 1 to 100 steps")
    numbers = [s.get("step") if isinstance(s, dict) else None for s in steps]
    if any(type(n) is not int or n < 1 or n > 100 for n in numbers) or len(
        set(numbers),
    ) != len(numbers):
        _fail("Plan step numbers must be unique integers from 1 to 100")
    old = data.get("artifact_plan")
    if old and old["sha256"] != _hash(raw):
        _fail(
            "The frozen plan changed; "
            "start a new workflow for a different plan",
        )
    dependencies = {}
    for step in steps:
        deps = step.get("depends_on", [])
        if (
            not isinstance(deps, list)
            or any(
                type(n) is not int or n not in numbers or n == step["step"]
                for n in deps
            )
            or len(set(deps)) != len(deps)
        ):
            _fail("Plan dependencies must refer to distinct other plan steps")
        dependencies[f"step-{step['step']}"] = deps
    seen, visiting = set(), set()

    def visit(number):
        if number in visiting:
            _fail("Plan dependencies contain a cycle")
        if number in seen:
            return
        visiting.add(number)
        for dep in dependencies[f"step-{number}"]:
            visit(dep)
        visiting.remove(number)
        seen.add(number)

    for number in numbers:
        visit(number)
    return {
        "steps": sorted(numbers),
        "dependencies": dependencies,
        "sha256": _hash(raw),
    }


def results_snapshot(
    wf: TeamWorkflowState,
    data: dict,
    only: list[int] | None = None,
) -> dict:
    plan = data.get("artifact_plan")
    if not plan or _hash(_read(wf, "handoffs/plan.json")) != plan["sha256"]:
        _fail("The frozen plan is missing or changed")
    result = {}

    def current(step):
        key = f"step-{step}"
        if key in result:
            return result[key]
        item = data.get("artifact_results", {}).get(key, {})
        published = item.get("published")
        if not published or item["attempt_id"] != published["attempt_id"]:
            _fail(f"{key} has no published result for its current attempt")
        for relative in [published["path"], f"results/{key}.json"]:
            if _hash(_read(wf, relative)) != published["sha256"]:
                _fail(f"{key} changed after publication")
        dependencies = {
            f"step-{dep}": current(dep)
            for dep in plan.get("dependencies", {}).get(key, [])
        }
        if item.get("input_versions", {}) != dependencies:
            _fail(
                f"{key} depends on superseded input versions; "
                "dispatch it again",
            )
        result[key] = published
        return published

    selected = plan["steps"] if only is None else only
    for step in selected:
        current(step)
    if only is not None:
        return {f"step-{step}": result[f"step-{step}"] for step in only}
    return result


def validated_review(wf: TeamWorkflowState, data: dict) -> dict:
    snapshot = results_snapshot(wf, data)
    review = data.get("artifact_review", {})
    if review.get("verdict") != "PASS" or review.get("snapshot") != snapshot:
        _fail("A PASS review of the current result versions is required")
    for relative in [review["path"], "reviews/verify-report.json"]:
        if _hash(_read(wf, relative)) != review["sha256"]:
            _fail("The accepted review changed")
    return review


def validate_phase(wf: TeamWorkflowState, data: dict):
    """Fail closed at both the state tool and gate completion boundaries."""
    if data.get("artifact_protocol") != 1:
        return
    phase = data["current_phase"]
    if phase in {"verify", "synthesize", "completed"}:
        results_snapshot(wf, data)
    if phase in {"synthesize", "completed"}:
        review = validated_review(wf, data)
        if phase == "completed":
            report = data.get("artifact_report", {})
            if report.get("review_id") != review["review_id"]:
                _fail(
                    "A final report bound to the accepted review is required",
                )
            for relative in [report["path"], "handoffs/final-report.md"]:
                if _hash(_read(wf, relative)) != report["sha256"]:
                    _fail("The final report changed after publication")


class TeamArtifacts:
    def __init__(self, wf: TeamWorkflowState):
        self.wf = wf

    def prepare_result(self, step: int, task_id: str, revision: int) -> dict:
        with self.wf.locked():
            data = _checked(self.wf, revision, "dispatch")
            if type(step) is not int or step not in data.get(
                "artifact_plan",
                {},
            ).get(
                "steps",
                [],
            ):
                _fail("Step is not in the frozen plan")
            if (
                not isinstance(task_id, str)
                or not task_id.strip()
                or len(task_id) > 200
            ):
                _fail("A task or dispatch identifier is required")
            key = f"step-{step}"
            dependencies = (
                data["artifact_plan"].get("dependencies", {}).get(key, [])
            )
            inputs = results_snapshot(self.wf, data, only=dependencies)
            attempt = uuid.uuid4().hex
            candidate = f"candidates/{key}/{attempt}.json"
            _path(self.wf, candidate).parent.mkdir(parents=True, exist_ok=True)
            results = dict(data.get("artifact_results", {}))
            results[key] = {
                "attempt_id": attempt,
                "task_id": task_id,
                "candidate_path": candidate,
                "input_versions": inputs,
            }
            state = self.wf.update_state(
                {
                    "artifact_results": results,
                    "artifact_review": {},
                    "artifact_pending_review": {},
                    "artifact_report": {},
                },
                expected_revision=revision,
            )
            return {
                **results[key],
                "step": step,
                "revision": state["revision"],
                "absolute_candidate_path": str(_path(self.wf, candidate)),
            }

    def publish_result(
        self,
        step: int,
        attempt_id: str,
        revision: int,
    ) -> dict:
        with self.wf.locked():
            data = _checked(self.wf, revision, "dispatch")
            key = f"step-{step}"
            results = dict(data.get("artifact_results", {}))
            item = dict(results.get(key, {}))
            if (
                not item
                or item.get("attempt_id") != attempt_id
                or item.get("published")
            ):
                _fail(
                    "This attempt was superseded, is unknown, "
                    "or is already published",
                )
            raw = _read(self.wf, item["candidate_path"])
            _json(raw)
            dependencies = (
                data["artifact_plan"].get("dependencies", {}).get(key, [])
            )
            if item.get("input_versions", {}) != results_snapshot(
                self.wf,
                data,
                only=dependencies,
            ):
                _fail(
                    "Candidate input versions changed; "
                    "prepare and dispatch again",
                )
            published = _snapshot(
                self.wf,
                f"artifacts/{key}/{attempt_id}.json",
                raw,
            )
            published.update(
                {"attempt_id": attempt_id, "task_id": item["task_id"]},
            )
            _alias(self.wf, f"results/{key}.json", raw)
            item["published"] = published
            results[key] = item
            state = self.wf.update_state(
                {"artifact_results": results},
                expected_revision=revision,
            )
            return {**published, "revision": state["revision"]}

    def prepare_review(self, revision: int) -> dict:
        with self.wf.locked():
            data = _checked(self.wf, revision, "verify")
            snapshot = results_snapshot(self.wf, data)
            review_id = uuid.uuid4().hex
            candidate = f"candidates/reviews/{review_id}.json"
            _path(self.wf, candidate).parent.mkdir(parents=True, exist_ok=True)
            pending = {
                "review_id": review_id,
                "snapshot": snapshot,
                "candidate_path": candidate,
            }
            state = self.wf.update_state(
                {
                    "artifact_pending_review": pending,
                    "artifact_review": {},
                    "artifact_report": {},
                },
                expected_revision=revision,
            )
            return {
                **pending,
                "revision": state["revision"],
                "absolute_candidate_path": str(_path(self.wf, candidate)),
            }

    def accept_review(self, review_id: str, revision: int) -> dict:
        with self.wf.locked():
            data = _checked(self.wf, revision, "verify")
            pending = data.get("artifact_pending_review", {})
            if pending.get("review_id") != review_id:
                _fail("This review was superseded or is unknown")
            snapshot = results_snapshot(self.wf, data)
            raw = _read(self.wf, pending["candidate_path"])
            report = _json(raw)
            if (
                report.get("review_id") != review_id
                or report.get("snapshot") != snapshot
                or pending["snapshot"] != snapshot
                or not isinstance(report.get("verdict"), str)
                or report.get("verdict") not in {"PASS", "FAIL", "PARTIAL"}
            ):
                _fail(
                    "Review identity, result versions or verdict do not match",
                )
            accepted = _snapshot(
                self.wf,
                f"artifacts/reviews/{review_id}.json",
                raw,
            )
            accepted.update(
                {
                    "review_id": review_id,
                    "snapshot": snapshot,
                    "verdict": report["verdict"],
                },
            )
            _alias(self.wf, "reviews/verify-report.json", raw)
            state = self.wf.update_state(
                {"artifact_review": accepted, "artifact_pending_review": {}},
                expected_revision=revision,
            )
            return {**accepted, "revision": state["revision"]}

    def publish_report(self, content: str, revision: int) -> dict:
        with self.wf.locked():
            data = _checked(self.wf, revision, "synthesize")
            review = validated_review(self.wf, data)
            if (
                not isinstance(content, str)
                or not content.strip()
                or len(content.encode("utf-8")) > LIMIT
            ):
                _fail("Final report must be nonempty and at most 8 MiB")
            raw = content.encode("utf-8")
            report = _snapshot(
                self.wf,
                f"artifacts/reports/{uuid.uuid4().hex}.md",
                raw,
            )
            report["review_id"] = review["review_id"]
            _alias(self.wf, "handoffs/final-report.md", raw)
            state = self.wf.update_state(
                {"artifact_report": report},
                expected_revision=revision,
            )
            return {**report, "revision": state["revision"]}
