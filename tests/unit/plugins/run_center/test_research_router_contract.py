# -*- coding: utf-8 -*-
"""Public research HTTP contracts for both shipped plugin sources."""

from __future__ import annotations

import hashlib
import importlib
import importlib.util
import sys
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


_ROOT = Path(__file__).resolve().parents[4]
_PREFIX = "/api/run-center"


def _load_runtime(source: str):
    name = f"research_router_contract_{source}"
    if name in sys.modules:
        return sys.modules[name]
    relative = (
        "plugins/bundle"
        if source == "canonical"
        else "src/qwenpaw/plugins_bundle"
    )
    directory = _ROOT / relative / "qwenpaw-run-center" / "runtime"
    spec = importlib.util.spec_from_file_location(
        name,
        directory / "__init__.py",
        submodule_search_locations=[str(directory)],
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(name="research_http", params=("canonical", "mirror"))
def _research_http(request, tmp_path):
    runtime = _load_runtime(request.param)
    repository = runtime.ResearchRepository(
        runtime.RunRepository(tmp_path / "run-center"),
    )
    repository.create_model(
        {
            "model_id": "router-model",
            "name": "Router Model",
            "project_id": "project",
        },
    )
    repository.create_model_version(
        "router-model",
        {
            "version_id": "router-version",
            "provider_id": "ugsci-eclipse",
            "manifest": {"simulator": "eclipse"},
            "parameters": {"porosity_multiplier": 1.0},
            "files": [],
        },
    )
    repository.create_study(
        {
            "study_id": "router-study",
            "project_id": "project",
            "model_version_id": "router-version",
            "type": "uncertainty",
            "name": "Router Study",
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
                ],
            },
        },
    )
    realization = repository.generate_design("router-study", budget=1, seed=4)[
        0
    ]
    for run_status in ("queued", "preparing", "running", "succeeded"):
        repository.runs.transition(realization["run_id"], run_status)
    api = importlib.import_module(f"{runtime.__name__}.research_api")
    app = FastAPI()
    router = api.build_research_router(repository)
    app.include_router(router, prefix=_PREFIX)
    with TestClient(app) as client:
        yield client, repository, realization["realization_id"], router


@pytest.mark.parametrize(
    "payload",
    (
        {},
        {"metrics": None},
        {"metrics": []},
        {"metrics": ""},
        {"metrics": 0},
        {"metrics": {}},
    ),
)
def test_metrics_http_retains_missing_null_and_non_array_errors(
    research_http,
    payload,
):
    client, _, realization_id, _ = research_http
    response = client.post(
        f"{_PREFIX}/realizations/{realization_id}/metrics",
        json=payload,
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "metrics must be a non-empty array"}


@pytest.mark.parametrize(
    ("metrics", "detail"),
    (
        ([1], "each metric must be an object"),
        (
            [{"key": "score", "value": "bad"}],
            "metric score must have a finite numeric value",
        ),
        (
            [{"key": "score", "value": 1}, {"key": "score", "value": 2}],
            "metrics must not contain duplicate key/time_basis pairs",
        ),
    ),
)
def test_metrics_http_retains_element_value_and_duplicate_errors(
    research_http,
    metrics,
    detail,
):
    client, _, realization_id, _ = research_http
    response = client.post(
        f"{_PREFIX}/realizations/{realization_id}/metrics",
        json={"metrics": metrics},
    )
    assert response.status_code == 400
    assert response.json() == {"detail": detail}


@pytest.mark.parametrize("value", (0, False))
def test_metrics_http_preserves_zero_and_existing_metric_identity(
    research_http,
    value,
):
    client, _, realization_id, _ = research_http
    url = f"{_PREFIX}/realizations/{realization_id}/metrics"
    response = client.post(
        url,
        json={
            "metrics": [
                {
                    "metric_id": "router-metric",
                    "key": "working_gas",
                    "value": value,
                },
            ],
        },
    )
    assert response.status_code == 200
    assert response.json()["metrics"][0]["value"] == 0.0
    updated = client.post(
        url,
        json={"metrics": [{"key": "working_gas", "value": 2}]},
    )
    assert updated.status_code == 200
    assert updated.json()["metrics"][0]["metric_id"] == "router-metric"
    analysis = client.get(
        f"{_PREFIX}/studies/router-study/analysis/working_gas",
    )
    assert analysis.status_code == 200
    assert analysis.json()["samples"][0]["value"] == 2.0


def test_review_http_preserves_status_alias_and_durable_transition(
    research_http,
):
    client, _, _, _ = research_http
    response = client.post(
        f"{_PREFIX}/reviews",
        json={
            "review_id": "router-review",
            "subject_type": "model_version",
            "subject_id": "router-version",
            "requested_by": "alice",
        },
    )
    assert response.status_code == 201
    pending = client.get(f"{_PREFIX}/reviews", params={"status": "pending"})
    assert pending.status_code == 200
    assert [item["review_id"] for item in pending.json()["reviews"]] == [
        "router-review",
    ]
    approved = client.post(
        f"{_PREFIX}/reviews/router-review/transition",
        json={
            "status": "approved",
            "reviewer_id": "bob",
            "decision_comment": "ok",
        },
    )
    assert approved.status_code == 200
    persisted = client.get(f"{_PREFIX}/reviews/router-review")
    assert persisted.status_code == 200
    assert persisted.json()["status"] == "approved"
    events = client.get(f"{_PREFIX}/reviews/router-review/events")
    assert events.status_code == 200
    assert [item["to_status"] for item in events.json()["events"]] == [
        "pending",
        "approved",
    ]
    assert (
        client.get(
            f"{_PREFIX}/reviews",
            params={"status": "pending"},
        ).json()["reviews"]
        == []
    )


def test_report_http_preserves_persisted_markdown_artifact(research_http):
    client, repository, realization_id, _ = research_http
    recorded = client.post(
        f"{_PREFIX}/realizations/{realization_id}/metrics",
        json={"metrics": [{"key": "working_gas", "value": 42}]},
    )
    assert recorded.status_code == 200
    response = client.post(
        f"{_PREFIX}/reports",
        json={
            "report_id": "router-report",
            "study_id": "router-study",
            "metric_key": "working_gas",
            "title": "Research Report",
            "format": "markdown",
        },
    )
    assert response.status_code == 201
    persisted = client.get(f"{_PREFIX}/reports/router-report")
    assert persisted.status_code == 200
    report = persisted.json()
    assert report == response.json() == repository.get_report("router-report")
    assert "# Research Report" in report["content"]
    content = report["content"].encode("utf-8")
    assert report["artifact"]["sha256"] == hashlib.sha256(content).hexdigest()
    assert report["artifact"]["size_bytes"] == len(content)
    listed = client.get(
        f"{_PREFIX}/reports",
        params={"study_id": "router-study"},
    )
    assert listed.status_code == 200
    assert listed.json()["reports"] == [report]


@pytest.mark.parametrize(
    ("path", "detail"),
    (
        ("/comparisons/missing", "Comparison not found"),
        ("/surrogates/missing", "Surrogate not found"),
        ("/reports/missing", "Report not found"),
        ("/reviews/missing", "Review not found"),
        ("/reviews/missing/events", "Referenced record not found"),
        ("/studies/missing/analysis/score", "Study not found"),
    ),
)
def test_research_http_retains_missing_record_errors(
    research_http,
    path,
    detail,
):
    client, _, _, _ = research_http
    response = client.get(f"{_PREFIX}{path}")
    assert response.status_code == 404
    assert response.json() == {"detail": detail}


def test_research_http_retains_openapi_and_route_order(research_http):
    client, _, _, router = research_http
    schema = client.get("/openapi.json").json()
    operation = schema["paths"][
        f"{_PREFIX}/realizations/{{realization_id}}/metrics"
    ]["post"]
    assert operation["requestBody"]["required"] is True
    parameters = schema["paths"][f"{_PREFIX}/reviews"]["get"]["parameters"]
    names = [parameter["name"] for parameter in parameters]
    assert "status" in names
    assert "review_status" not in names
    paths = [route.path for route in router.routes]
    assert paths.index(
        "/comparisons/{comparison_id}",
    ) < paths.index(
        "/comparisons",
    )
    assert paths.index("/reviews") < paths.index(
        "/reports",
    )
