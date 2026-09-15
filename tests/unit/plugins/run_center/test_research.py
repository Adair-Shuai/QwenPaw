# -*- coding: utf-8 -*-
"""Model registry and lightweight CMOST-style Study tests."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


_PLUGIN_ROOT = Path(__file__).parents[4] / "plugins" / "bundle" / "qwenpaw-run-center"


def _runtime_module():
    name = "test_run_center_runtime"
    if name in sys.modules:
        return sys.modules[name]
    spec = importlib.util.spec_from_file_location(
        name,
        _PLUGIN_ROOT / "runtime" / "__init__.py",
        submodule_search_locations=[str(_PLUGIN_ROOT / "runtime")],
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


runtime = _runtime_module()
RunRepository = runtime.RunRepository
ResearchRepository = runtime.ResearchRepository
_research_spec = importlib.util.spec_from_file_location(
    "test_run_center_runtime.research_api",
    _PLUGIN_ROOT / "runtime" / "research_api.py",
)
assert _research_spec and _research_spec.loader
_research_module = importlib.util.module_from_spec(_research_spec)
sys.modules[_research_spec.name] = _research_module
_research_spec.loader.exec_module(_research_module)
build_research_router = _research_module.build_research_router


def _mark_succeeded(repository: ResearchRepository, run_id: str) -> None:
    repository.runs.transition(run_id, "queued")
    repository.runs.transition(run_id, "preparing")
    repository.runs.transition(run_id, "running")
    repository.runs.transition(run_id, "succeeded")


def _model_version(repository: ResearchRepository) -> dict:
    repository.create_model(
        {"model_id": "storage-a", "name": "储气库 A", "project_id": "p1"},
    )
    return repository.create_model_version(
        "storage-a",
        {
            "version_id": "storage-a-v1",
            "label": "基准模型",
            "provider_id": "ugsci-eclipse",
            "manifest": {"simulator": "eclipse"},
            "parameters": {"porosity_multiplier": 1.0},
            "files": [
                {
                    "path": "model/CASE.DATA",
                    "sha256": "a" * 64,
                    "size_bytes": 12,
                },
            ],
        },
    )


def _study(repository: ResearchRepository) -> dict:
    _model_version(repository)
    return repository.create_study(
        {
            "study_id": "study-a",
            "project_id": "p1",
            "model_version_id": "storage-a-v1",
            "type": "uncertainty",
            "name": "工作气量不确定性",
            "definition": {
                "forward_operation": "storage.capacity.evaluate",
                "provider_id": "ugsci-storage-capacity",
                "parameters": [
                    {
                        "key": "porosity_multiplier",
                        "type": "continuous",
                        "lower": 0.8,
                        "upper": 1.2,
                        "unit": "fraction",
                    },
                    {
                        "key": "max_pressure",
                        "type": "continuous",
                        "lower": 20.0,
                        "upper": 25.0,
                        "unit": "MPa",
                    },
                ],
            },
        },
    )


def test_model_versions_are_immutable_snapshots_and_diffable(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    first = _model_version(repository)
    second = repository.create_model_version(
        "storage-a",
        {
            "version_id": "storage-a-v2",
            "parent_version_id": first["version_id"],
            "parameters": {"porosity_multiplier": 1.1},
            "files": [
                {"path": "model/CASE.DATA", "sha256": "b" * 64},
                {"path": "scripts/post.py", "sha256": "c" * 64},
            ],
        },
    )

    assert first["revision"] == 1
    assert second["revision"] == 2
    assert first["snapshot_hash"] != second["snapshot_hash"]
    diff = repository.diff_model_versions(first["version_id"], second["version_id"])
    assert diff["files"]["changed"] == ["model/CASE.DATA"]
    assert diff["files"]["added"] == ["scripts/post.py"]
    assert diff["parameters"]["porosity_multiplier"] == {"left": 1.0, "right": 1.1}
    assert repository.freeze_model_version(second["version_id"])["status"] == "frozen"


def test_model_version_rejects_unsafe_file_paths(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    repository.create_model({"model_id": "m", "name": "M"})
    with pytest.raises(ValueError, match="relative"):
        repository.create_model_version(
            "m", {"files": [{"path": "../outside.DATA"}]},
        )


def test_model_version_validation_checks_manifest_and_python_syntax(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    repository.create_model({"model_id": "m", "name": "M"})
    version = repository.create_model_version(
        "m",
        {
            "version_id": "v1",
            "manifest": {"entrypoint": "scripts/run.py"},
            "parameters": {"pressure": 20.0},
            "files": [
                {"path": "scripts/run.py", "sha256": "a" * 64},
                {"path": "model/CASE.DATA", "sha256": "b" * 64},
            ],
        },
    )
    failed = repository.validate_model_version(
        version["version_id"],
        inline_files=[{"path": "scripts/run.py", "content": "def broken(:\n  pass\n"}],
    )
    assert failed["validation"]["status"] == "failed"
    assert failed["validation"]["valid"] is False
    assert repository.get_model_version("v1")["status"] == "draft"
    assert repository.get_model_version("v1")["validation"]["status"] == "failed"

    passed = repository.validate_model_version(
        version["version_id"],
        inline_files={"scripts/run.py": "def run():\n    return 1\n"},
    )
    assert passed["validation"]["status"] == "passed"
    assert passed["model_version"]["status"] == "validated"
    assert passed["model_version"]["snapshot_hash"] == version["snapshot_hash"]


def test_model_version_release_requires_validation_and_is_idempotent(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    repository.create_model({"model_id": "m", "name": "M"})
    with pytest.raises(ValueError, match="release endpoint"):
        repository.create_model_version("m", {"status": "released", "files": []})
    version = repository.create_model_version(
        "m",
        {
            "version_id": "v1",
            "manifest": {"entrypoint": "run.py"},
            "files": [{"path": "run.py", "sha256": "a" * 64}],
        },
    )
    with pytest.raises(ValueError, match="pass validation"):
        repository.release_model_version(version["version_id"])
    repository.validate_model_version(
        version["version_id"], inline_files={"run.py": "print('ok')\n"},
    )
    released = repository.release_model_version(version["version_id"])
    assert released["status"] == "released"
    assert released["frozen_at"]
    assert repository.release_model_version(version["version_id"])["status"] == "released"
    with pytest.raises(ValueError, match="immutable"):
        repository.freeze_model_version(version["version_id"])


def test_model_version_release_http_endpoint(tmp_path) -> None:
    research = ResearchRepository(RunRepository(tmp_path / "run-center"))
    app = FastAPI()
    app.include_router(build_research_router(research), prefix="/api/run-center")
    with TestClient(app) as client:
        assert client.post(
            "/api/run-center/models", json={"model_id": "m1", "name": "模型"},
        ).status_code == 201
        assert client.post(
            "/api/run-center/models/m1/versions",
            json={
                "version_id": "v1",
                "manifest": {"entrypoint": "run.py"},
                "files": [{"path": "run.py", "sha256": "a" * 64}],
            },
        ).status_code == 201
        blocked = client.post("/api/run-center/model-versions/v1/release")
        assert blocked.status_code == 400
        assert "validation" in blocked.json()["detail"]
        assert client.post(
            "/api/run-center/model-versions/v1/validate",
            json={"inline_files": {"run.py": "print('ok')\n"}},
        ).status_code == 200
        released = client.post("/api/run-center/model-versions/v1/release")
        assert released.status_code == 200
        assert released.json()["status"] == "released"


def test_model_branch_tag_lifecycle_and_model_listing_includes_versions(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    repository.create_model({"model_id": "m", "name": "模型"})
    first = repository.create_model_version("m", {"version_id": "v1", "files": []})
    branch = repository.create_model_branch(
        "m", {"name": "calibration", "head_version_id": "v1"},
    )
    second = repository.create_model_version(
        "m",
        {"version_id": "v2", "branch_name": "calibration", "parent_version_id": "v1", "files": []},
    )
    assert branch["head_version_id"] == "v1"
    assert repository.get_model_branch("m", "calibration")["head_version_id"] == "v2"
    tag = repository.create_model_tag(
        "m", {"name": "candidate", "version_id": "v2", "metadata": {"kind": "qa"}},
    )
    assert tag["version_id"] == "v2"
    model = repository.list_models()[0]
    assert [item["version_id"] for item in model["versions"]] == ["v2", "v1"]
    assert model["branches"][0]["name"] == "calibration"
    assert model["tags"][0]["name"] == "candidate"
    repository.set_model_branch_head("m", "calibration", "v1")
    assert repository.get_model_branch("m", "calibration")["head_version_id"] == "v1"
    repository.delete_model_tag("m", "candidate")
    assert repository.get_model_tag("m", "candidate") is None
    repository.restore_model_tag("m", "candidate")
    assert repository.get_model_tag("m", "candidate")["version_id"] == "v2"
    repository.delete_model_branch("m", "calibration")
    assert repository.get_model_branch("m", "calibration") is None
    repository.restore_model_branch("m", "calibration")
    assert repository.get_model_branch("m", "calibration") is not None
    assert first["branch_name"] == "main"
    assert second["branch_name"] == "calibration"


def test_model_version_and_model_soft_delete_restore_and_reference_protection(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    version = _model_version(repository)
    study = repository.create_study(
        {
            "study_id": "s-ref",
            "model_version_id": version["version_id"],
            "type": "uncertainty",
            "name": "引用保护",
            "definition": {"parameters": []},
        },
    )
    with pytest.raises(ValueError, match="still referenced") as exc_info:
        repository.delete_model_version(version["version_id"])
    assert getattr(exc_info.value, "references", [])[0]["reference_type"] == "study"
    repository.runs.create_run(
        {
            "run_id": "run-ref",
            "operation": "storage.capacity.evaluate",
            "model_version_id": version["version_id"],
        },
    )
    refs = repository.model_version_references(version["version_id"])
    assert {item["reference_type"] for item in refs} == {"run", "study"}
    # Remove the study and run rows only in this isolated test database to
    # exercise the successful lifecycle path after reference cleanup.
    with repository.runs._connection(write=True) as conn:  # noqa: SLF001
        conn.execute("DELETE FROM runs WHERE run_id='run-ref'")
        conn.execute("DELETE FROM studies WHERE study_id=?", (study["study_id"],))
    deleted = repository.delete_model_version(version["version_id"])
    assert deleted["deleted_at"]
    assert repository.get_model_version(version["version_id"]) is None
    assert repository.get_model_version(version["version_id"], include_deleted=True)["deleted_at"]
    restored = repository.restore_model_version(version["version_id"])
    assert restored["deleted_at"] is None
    deleted_model = repository.delete_model("storage-a")
    assert deleted_model["deleted_at"]
    assert repository.list_models() == []
    assert repository.list_models(include_deleted=True)[0]["deleted_at"]
    repository.restore_model("storage-a")
    assert repository.get_model("storage-a") is not None


def test_model_governance_http_api_and_conflict_status(tmp_path) -> None:
    research = ResearchRepository(RunRepository(tmp_path / "run-center"))
    app = FastAPI()
    app.include_router(build_research_router(research), prefix="/api/run-center")
    with TestClient(app) as client:
        assert client.post("/api/run-center/models", json={"model_id": "m", "name": "M"}).status_code == 201
        assert client.post(
            "/api/run-center/models/m/versions",
            json={"version_id": "v1", "files": []},
        ).status_code == 201
        assert client.post(
            "/api/run-center/models/m/branches", json={"name": "dev", "head_version_id": "v1"},
        ).status_code == 201
        assert client.post(
            "/api/run-center/models/m/tags", json={"name": "latest", "version_id": "v1"},
        ).status_code == 201
        listed = client.get("/api/run-center/models").json()["models"][0]
        assert listed["versions"][0]["version_id"] == "v1"
        assert listed["branches"][0]["name"] in {"dev", "main"}
        assert listed["tags"][0]["name"] == "latest"
        assert client.get("/api/run-center/models/m/branches/dev").json()["name"] == "dev"
        assert client.get("/api/run-center/models/m/tags/latest").json()["name"] == "latest"
        assert client.delete("/api/run-center/models/m/tags/latest").status_code == 200
        assert client.post("/api/run-center/models/m/tags/latest/restore").status_code == 200
        assert client.delete("/api/run-center/models/m/branches/dev").status_code == 200
        assert client.post("/api/run-center/models/m/branches/dev/restore").status_code == 200
        assert client.delete("/api/run-center/model-versions/v1").status_code == 200
        assert client.post("/api/run-center/model-versions/v1/restore").status_code == 200


def test_model_version_delete_http_returns_references_with_conflict(tmp_path) -> None:
    research = ResearchRepository(RunRepository(tmp_path / "run-center"))
    app = FastAPI()
    app.include_router(build_research_router(research), prefix="/api/run-center")
    with TestClient(app) as client:
        client.post("/api/run-center/models", json={"model_id": "m", "name": "M"})
        client.post(
            "/api/run-center/models/m/versions", json={"version_id": "v1", "files": []},
        )
        client.post(
            "/api/run-center/studies",
            json={
                "study_id": "s1",
                "model_version_id": "v1",
                "type": "uncertainty",
                "name": "S",
                "definition": {"parameters": []},
            },
        )
        response = client.delete("/api/run-center/model-versions/v1")
        assert response.status_code == 409
        detail = response.json()["detail"]
        assert detail["references"][0]["reference_type"] == "study"
        references = client.get("/api/run-center/model-versions/v1/references")
        assert references.status_code == 200
        assert references.json()["references"][0]["reference_id"] == "s1"


def test_reviews_are_fingerprint_bound_and_terminal_decisions_are_immutable(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    version = _model_version(repository)
    review = repository.create_review(
        {
            "review_id": "review-v1",
            "subject_type": "model_version",
            "subject_id": version["version_id"],
            "requested_by": "engineer-1",
            "request_reason": "生产发布前复核",
            "metadata": {"checklist": ["边界", "单位"]},
        },
    )
    assert review["status"] == "pending"
    assert review["input_fingerprint"] == version["snapshot_hash"]
    assert review["model_version_id"] == version["version_id"]
    assert review["snapshot"]["model_version"]["version_id"] == version["version_id"]
    assert repository.list_reviews(subject_type="model_version", subject_id="storage-a-v1")[0]["review_id"] == "review-v1"
    with pytest.raises(ValueError, match="reviewer_id"):
        repository.transition_review("review-v1", "approved")
    approved = repository.transition_review(
        "review-v1", "approved", reviewer_id="reviewer-1", decision_comment="通过",
    )
    assert approved["decided_at"]
    assert [event["to_status"] for event in repository.list_review_events("review-v1")] == [
        "pending",
        "approved",
    ]
    assert repository.has_approved_review(
        subject_type="model_version",
        subject_id=version["version_id"],
        input_fingerprint=version["snapshot_hash"],
    )
    with pytest.raises(ValueError, match="immutable"):
        repository.transition_review("review-v1", "rejected", reviewer_id="reviewer-2", decision_comment="退回")
    with pytest.raises(ValueError, match="does not match"):
        repository.create_review(
            {
                "subject_type": "model_version",
                "subject_id": version["version_id"],
                "input_fingerprint": "b" * 64,
            },
        )


def test_model_release_can_require_approved_review(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    version = _model_version(repository)
    repository.validate_model_version(version["version_id"])
    with pytest.raises(ValueError, match="approved review"):
        repository.release_model_version(version["version_id"], require_review=True)
    review = repository.create_review(
        {"subject_type": "model_version", "subject_id": version["version_id"]},
    )
    with pytest.raises(ValueError, match="approved review"):
        repository.release_model_version(version["version_id"], require_review=True)
    repository.transition_review(review["review_id"], "approved", reviewer_id="r1")
    released = repository.release_model_version(version["version_id"], require_review=True)
    assert released["status"] == "released"


def test_review_http_api_supports_query_and_transition(tmp_path) -> None:
    research = ResearchRepository(RunRepository(tmp_path / "run-center"))
    app = FastAPI()
    app.include_router(build_research_router(research), prefix="/api/run-center")
    with TestClient(app) as client:
        assert client.post(
            "/api/run-center/models", json={"model_id": "m-review", "name": "模型"},
        ).status_code == 201
        created_version = client.post(
            "/api/run-center/models/m-review/versions",
            json={"version_id": "v-review", "files": []},
        )
        assert created_version.status_code == 201
        created = client.post(
            "/api/run-center/reviews",
            json={
                "review_id": "http-review",
                "subject_type": "model_version",
                "subject_id": "v-review",
                "requested_by": "alice",
            },
        )
        assert created.status_code == 201
        assert client.get("/api/run-center/reviews?status=pending").json()["reviews"][0]["review_id"] == "http-review"
        approved = client.post(
            "/api/run-center/reviews/http-review/transition",
            json={"status": "approved", "reviewer_id": "bob", "decision_comment": "ok"},
        )
        assert approved.status_code == 200
        assert approved.json()["status"] == "approved"
        assert client.get("/api/run-center/reviews/http-review").json()["status"] == "approved"
        event_response = client.get("/api/run-center/reviews/http-review/events")
        assert event_response.status_code == 200
        assert [item["to_status"] for item in event_response.json()["events"]] == [
            "pending",
            "approved",
        ]


def test_model_version_validation_http_endpoint_is_readable(tmp_path) -> None:
    research = ResearchRepository(RunRepository(tmp_path / "run-center"))
    app = FastAPI()
    app.include_router(build_research_router(research), prefix="/api/run-center")
    with TestClient(app) as client:
        assert client.post(
            "/api/run-center/models", json={"model_id": "m1", "name": "模型"},
        ).status_code == 201
        assert client.post(
            "/api/run-center/models/m1/versions",
            json={
                "version_id": "v1",
                "manifest": {"entrypoint": "run.py"},
                "files": [{"path": "run.py", "sha256": "a" * 64}],
            },
        ).status_code == 201
        response = client.post(
            "/api/run-center/model-versions/v1/validate",
            json={"inline_files": {"run.py": "print('ok')\n"}},
        )
        assert response.status_code == 200
        assert response.json()["validation"]["status"] == "passed"
        report = client.get("/api/run-center/model-versions/v1/validation")
        assert report.status_code == 200
        assert report.json()["validation"]["status"] == "passed"


def test_model_and_study_payloads_require_objects(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    with pytest.raises(ValueError, match="payload must be an object"):
        repository.create_model(None)  # type: ignore[arg-type]
    with pytest.raises(ValueError, match="payload must be an object"):
        repository.create_study(None)  # type: ignore[arg-type]
    repository.create_model({"model_id": "m", "name": "M"})
    with pytest.raises(ValueError, match="payload must be an object"):
        repository.create_model_version("m", None)  # type: ignore[arg-type]


def test_design_generation_uses_stable_realization_ids_and_rejects_duplicate_metrics(
    tmp_path,
) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    first = repository.generate_design("study-a", method="random", budget=3, seed=9)
    second = repository.generate_design("study-a", method="random", budget=3, seed=9)
    assert [item["realization_id"] for item in first] == [
        item["realization_id"] for item in second
    ]
    with pytest.raises(ValueError, match="duplicate key/time_basis"):
        repository.record_metrics(
            first[0]["realization_id"],
            [{"key": "x", "value": 1}, {"key": "x", "value": 2}],
        )


def test_metrics_require_successful_realization_run(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    realization = repository.generate_design("study-a", budget=1)[0]
    with pytest.raises(ValueError, match="Run succeeded"):
        repository.record_metrics(
            realization["realization_id"], [{"key": "x", "value": 1.0}],
        )
    _mark_succeeded(repository, realization["run_id"])
    repository.record_metrics(
        realization["realization_id"], [{"key": "x", "value": 1.0}],
    )


def test_sobol_design_uses_seed_for_reproducible_scrambling(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    first = repository._design_points(  # noqa: SLF001 - contract regression
        [{"key": "x", "type": "continuous", "lower": 0.0, "upper": 1.0}],
        "sobol",
        4,
        1,
    )
    replay = repository._design_points(  # noqa: SLF001
        [{"key": "x", "type": "continuous", "lower": 0.0, "upper": 1.0}],
        "sobol",
        4,
        1,
    )
    other = repository._design_points(  # noqa: SLF001
        [{"key": "x", "type": "continuous", "lower": 0.0, "upper": 1.0}],
        "sobol",
        4,
        999,
    )
    assert first == replay
    assert first != other


def test_comparison_validates_scope_and_objective_direction(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    realizations = repository.generate_design("study-a", budget=2)
    with pytest.raises(ValueError, match="must belong to study_id"):
        repository.create_comparison(
            {
                "study_id": "other-study",
                "name": "bad",
                "realization_ids": [
                    item["realization_id"] for item in realizations
                ],
                "metric_keys": ["x"],
            },
        )
    with pytest.raises(ValueError, match="objective direction"):
        repository.create_comparison(
            {
                "study_id": "study-a",
                "name": "bad",
                "realization_ids": [
                    item["realization_id"] for item in realizations
                ],
                "metric_keys": ["x"],
                "objectives": [{"key": "x", "direction": "sideways"}],
            },
        )


def test_study_design_is_reproducible_and_creates_traceable_runs(tmp_path) -> None:
    runs = RunRepository(tmp_path / "run-center")
    repository = ResearchRepository(runs)
    study = _study(repository)
    points = repository.generate_design(
        study["study_id"], method="latin_hypercube", budget=12, seed=42,
    )
    replay = repository.generate_design(
        study["study_id"], method="latin_hypercube", budget=12, seed=42,
    )

    assert points == replay
    assert len(points) == 12
    assert len({item["run_id"] for item in points}) == 12
    first_run = runs.get_run(points[0]["run_id"])
    assert first_run["model_version_id"] == "storage-a-v1"
    assert first_run["study_id"] == "study-a"
    assert first_run["payload"]["input_snapshot"]["study_revision"] == 1


def test_different_doe_inputs_get_distinct_design_fingerprints(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)

    lhs = repository.generate_design(
        "study-a", method="latin_hypercube", budget=3, seed=11,
    )
    random_design = repository.generate_design(
        "study-a", method="random", budget=3, seed=11,
    )
    different_seed = repository.generate_design(
        "study-a", method="latin_hypercube", budget=3, seed=12,
    )
    different_budget = repository.generate_design(
        "study-a", method="latin_hypercube", budget=4, seed=11,
    )
    different_constraints = repository.generate_design(
        "study-a",
        method="latin_hypercube",
        budget=3,
        seed=11,
        constraints=[{"key": "max_pressure", "operator": "<=", "value": 24}],
    )

    fingerprints = {
        lhs[0]["design_fingerprint"],
        random_design[0]["design_fingerprint"],
        different_seed[0]["design_fingerprint"],
        different_budget[0]["design_fingerprint"],
        different_constraints[0]["design_fingerprint"],
    }
    assert len(fingerprints) == 5
    assert len({item["realization_id"] for item in lhs}) == 3
    assert not {
        item["realization_id"] for item in lhs
    }.intersection(item["realization_id"] for item in random_design)
    assert [item["design_version"] for item in lhs] == [1, 1, 1]
    assert [item["design_version"] for item in random_design] == [2, 2, 2]
    assert [item["design_version"] for item in different_seed] == [3, 3, 3]
    assert [item["design_version"] for item in different_budget] == [4, 4, 4, 4]
    assert [item["design_version"] for item in different_constraints] == [5, 5, 5]
    designs = repository.list_designs("study-a", revision=1)
    assert [item["realization_count"] for item in designs] == [3, 3, 3, 4, 3]


def test_study_revision_fingerprint_isolated_from_prior_realizations(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    first = repository.generate_design("study-a", budget=2, seed=1)
    revision = repository.create_study_revision(
        "study-a",
        {
            "forward_operation": "storage.capacity.evaluate",
            "provider_id": "ugsci-storage-capacity",
            "constraints": [{"key": "max_pressure", "operator": "<=", "value": 24}],
            "parameters": [
                {
                    "key": "porosity_multiplier",
                    "type": "continuous",
                    "lower": 0.7,
                    "upper": 1.2,
                },
                {
                    "key": "max_pressure",
                    "type": "continuous",
                    "lower": 20.0,
                    "upper": 24.0,
                },
            ],
        },
    )
    second = repository.generate_design("study-a", revision=2, budget=2, seed=1)
    assert revision["revision"] == 2
    assert first[0]["design_fingerprint"] != second[0]["design_fingerprint"]
    assert {item["revision"] for item in second} == {2}
    assert len(repository.list_realizations("study-a", revision=1)) == 2
    assert len(repository.list_realizations("study-a", revision=2)) == 2


def test_run_review_uses_realization_study_revision_after_study_changes(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    realization = repository.generate_design(
        "study-a", revision=1, budget=1, seed=7, enqueue=True,
    )[0]
    review = repository.create_review(
        {
            "review_id": "study-rev1-review",
            "subject_type": "study",
            "subject_id": "study-a",
            "study_revision": 1,
            "requested_by": "engineer-1",
            "request_reason": "DOE realization approval",
        },
    )
    repository.transition_review(
        review["review_id"], "approved", reviewer_id="reviewer-1",
    )
    repository.create_study_revision(
        "study-a",
        {
            "forward_operation": "storage.capacity.evaluate",
            "provider_id": "ugsci-storage-capacity",
            "parameters": [
                {
                    "key": "porosity_multiplier",
                    "type": "continuous",
                    "lower": 0.9,
                    "upper": 1.1,
                },
                {
                    "key": "max_pressure",
                    "type": "continuous",
                    "lower": 20.0,
                    "upper": 24.0,
                },
            ],
        },
    )
    run = repository.runs.get_run(realization["run_id"])
    assert run is not None
    assert run["payload"]["input_snapshot"]["study_revision"] == 1
    matched = repository.require_review_for_run(run)
    assert matched is not None
    assert matched["review_id"] == "study-rev1-review"


def test_uncertainty_sensitivity_and_pareto_comparison(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    realizations = repository.generate_design(
        "study-a", method="sobol", budget=12, seed=7,
    )
    for index, realization in enumerate(realizations):
        _mark_succeeded(repository, realization["run_id"])
        parameters = realization["parameter_values"]
        working_gas = 100.0 * parameters["porosity_multiplier"] + index * 0.01
        pressure_deviation = abs(parameters["max_pressure"] - 22.5)
        repository.record_metrics(
            realization["realization_id"],
            [
                {
                    "key": "working_gas",
                    "value": working_gas,
                    "unit": "10^8 sm3",
                    "provenance": {"model_version_id": "storage-a-v1"},
                },
                {
                    "key": "pressure_deviation",
                    "value": pressure_deviation,
                    "unit": "MPa",
                },
            ],
        )

    analysis = repository.study_analysis("study-a", "working_gas")
    assert analysis["sample_count"] == 12
    assert analysis["statistics"]["p10"] < analysis["statistics"]["p90"]
    assert analysis["sensitivity"][0]["parameter"] == "porosity_multiplier"
    comparison = repository.create_comparison(
        {
            "study_id": "study-a",
            "name": "候选方案",
            "realization_ids": [item["realization_id"] for item in realizations[:4]],
            "metric_keys": ["working_gas", "pressure_deviation"],
            "objectives": [
                {"key": "working_gas", "direction": "maximize"},
                {"key": "pressure_deviation", "direction": "minimize"},
            ],
        },
    )
    assert comparison["result"]["pareto_realization_ids"]
    assert len(comparison["result"]["rows"]) == 4
    assert repository.get_comparison(comparison["comparison_id"])["result"] == comparison["result"]
    assert repository.list_comparisons(study_id="study-a")[0]["comparison_id"] == comparison["comparison_id"]


def test_research_http_api(tmp_path) -> None:
    research = ResearchRepository(RunRepository(tmp_path / "run-center"))
    app = FastAPI()
    app.include_router(build_research_router(research), prefix="/api/run-center")
    with TestClient(app) as client:
        assert client.post(
            "/api/run-center/models", json={"model_id": "m1", "name": "模型"},
        ).status_code == 201
        assert client.post(
            "/api/run-center/models/m1/versions",
            json={"version_id": "v1", "files": []},
        ).status_code == 201
        created = client.post(
            "/api/run-center/studies",
            json={
                "study_id": "s1",
                "model_version_id": "v1",
                "type": "scenario_compare",
                "name": "方案比较",
                "definition": {
                    "parameters": [
                        {"key": "rate", "type": "integer", "lower": 1, "upper": 3},
                    ],
                },
            },
        )
        assert created.status_code == 201
        design = client.post(
            "/api/run-center/studies/s1/design",
            json={"method": "full_factorial", "budget": 3, "seed": 1},
        )
        assert design.status_code == 201
        assert len(design.json()["realizations"]) == 2
        assert design.json()["design"]["design_fingerprint"]
        assert client.get("/api/run-center/studies/s1/designs").json()["designs"]
        assert client.get("/api/run-center/comparisons").status_code == 200
        assert client.get("/api/run-center/comparisons/missing").status_code == 404


def test_analysis_exposes_samples_failures_units_assumptions_and_data_gaps(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _model_version(repository)
    repository.create_study(
        {
            "study_id": "study-review",
            "model_version_id": "storage-a-v1",
            "type": "uncertainty",
            "name": "审查输出",
            "definition": {
                "assumptions": ["孔隙度在给定范围内均匀分布"],
                "data_gaps": ["缺少最新压力监测数据"],
                "parameters": [
                    {"key": "p", "type": "continuous", "lower": 1.0, "upper": 3.0},
                ],
            },
        },
    )
    realizations = repository.generate_design("study-review", method="random", budget=3)
    _mark_succeeded(repository, realizations[0]["run_id"])
    repository.record_metrics(
        realizations[0]["realization_id"],
        [{"key": "capacity", "value": 10.0, "unit": "10^8 sm3"}],
    )
    _mark_succeeded(repository, realizations[1]["run_id"])
    repository.record_metrics(
        realizations[1]["realization_id"],
        [{"key": "capacity", "value": 11.0, "unit": "GSm3"}],
    )

    analysis = repository.study_analysis("study-review", "capacity")
    assert len(analysis["samples"]) == 3
    assert len(analysis["failures"]) == 1
    assert analysis["failure_count"] == 1
    assert analysis["units"] == ["10^8 sm3", "GSm3"]
    assert analysis["unit_consistent"] is False
    assert analysis["assumptions"] == ["孔隙度在给定范围内均匀分布"]
    assert analysis["data_gaps"] == ["缺少最新压力监测数据"]
    assert any("unit" in warning for warning in analysis["warnings"])


def test_analysis_can_filter_metric_time_basis(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    realization = repository.generate_design("study-a", budget=1)[0]
    _mark_succeeded(repository, realization["run_id"])
    repository.record_metrics(
        realization["realization_id"],
        [
            {"key": "x", "value": 1.0, "unit": "MPa", "time_basis": "monthly"},
            {"key": "x", "value": 2.0, "unit": "MPa", "time_basis": "annual"},
        ],
    )
    monthly = repository.study_analysis("study-a", "x", time_basis="monthly")
    assert monthly["sample_count"] == 1
    assert monthly["time_basis"] == "monthly"
    assert monthly["samples"][0]["value"] == 1.0


def test_research_reports_are_durable_markdown_artifacts_and_http_queryable(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    realization = repository.generate_design("study-a", budget=1)[0]
    _mark_succeeded(repository, realization["run_id"])
    repository.record_metrics(
        realization["realization_id"],
        [{"key": "working_gas", "value": 42.0, "unit": "10^8 sm3"}],
    )
    report = repository.create_report(
        {
            "report_id": "report-study-a",
            "study_id": "study-a",
            "metric_key": "working_gas",
            "title": "工作气量审查报告",
            "format": "markdown",
        },
    )
    assert report["artifact"]["kind"] == "report"
    assert report["artifact"]["media_type"].startswith("text/markdown")
    assert len(report["artifact"]["sha256"]) == 64
    assert report["artifact"]["size_bytes"] == len(report["content"].encode("utf-8"))
    assert "# 工作气量审查报告" in report["content"]
    assert "成功样本" in report["content"]
    assert repository.get_report("report-study-a")["content"] == report["content"]
    assert repository.list_reports(study_id="study-a")[0]["report_id"] == "report-study-a"

    app = FastAPI()
    app.include_router(build_research_router(repository), prefix="/api/run-center")
    with TestClient(app) as client:
        response = client.get("/api/run-center/reports/report-study-a")
        assert response.status_code == 200
        assert response.json()["artifact"]["ref_id"] == "report-report-study-a"
        assert client.get("/api/run-center/reports?study_id=study-a").json()["reports"]
        assert client.get("/api/run-center/reports/missing").status_code == 404


def test_comparison_result_contains_review_context(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    realizations = repository.generate_design("study-a", budget=2)
    for index, realization in enumerate(realizations):
        _mark_succeeded(repository, realization["run_id"])
        repository.record_metrics(
            realization["realization_id"],
            [{"key": "x", "value": float(index), "unit": "MPa"}],
        )
    comparison = repository.create_comparison(
        {
            "study_id": "study-a",
            "name": "审查比较",
            "realization_ids": [item["realization_id"] for item in realizations],
            "metric_keys": ["x"],
            "objectives": [{"key": "x", "direction": "maximize"}],
        },
    )
    result = comparison["result"]
    assert result["metric_units"] == {"x": ["MPa"]}
    assert result["unit_consistency"] == {"x": True}
    assert "input_differences" in result
    assert result["failed_rows"] == []


def test_linear_surrogate_is_reproducible_and_warns_outside_domain(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    realizations = repository.generate_design("study-a", method="random", budget=4, seed=3)
    for realization in realizations:
        _mark_succeeded(repository, realization["run_id"])
        params = realization["parameter_values"]
        repository.record_metrics(
            realization["realization_id"],
            [{"key": "capacity", "value": 2.0 * params["porosity_multiplier"] + 3.0 * params["max_pressure"], "unit": "GSm3"}],
        )
    surrogate = repository.train_surrogate("study-a", "capacity")
    assert surrogate["algorithm"] == "linear"
    assert surrogate["diagnostics"]["sample_count"] == 4
    prediction = repository.predict_surrogate(
        surrogate["surrogate_id"], {"porosity_multiplier": 1.0, "max_pressure": 22.0},
    )
    assert prediction["unit"] == "GSm3"
    assert prediction["out_of_domain"] == []
    outside = repository.predict_surrogate(
        surrogate["surrogate_id"], {"porosity_multiplier": 99.0, "max_pressure": 22.0},
    )
    assert "porosity_multiplier" in outside["out_of_domain"]
    assert outside["warning"]


def test_observed_optimization_ranks_only_completed_realizations(tmp_path) -> None:
    repository = ResearchRepository(RunRepository(tmp_path / "run-center"))
    _study(repository)
    realizations = repository.generate_design("study-a", method="random", budget=3, seed=5)
    for index, realization in enumerate(realizations[:2]):
        _mark_succeeded(repository, realization["run_id"])
        repository.record_metrics(realization["realization_id"], [{"key": "score", "value": float(index + 1), "unit": "u"}])
    result = repository.optimize_study("study-a", [{"key": "score", "direction": "maximize"}])
    assert result["algorithm"] == "observed-ranking"
    assert result["candidate_count"] == 2
    assert result["candidates"][0]["metrics"]["score"]["value"] == 2.0
    assert result["warnings"]
