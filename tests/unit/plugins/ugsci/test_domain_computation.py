# -*- coding: utf-8 -*-
"""Tests for UGSci-owned scientific computation contracts."""

from __future__ import annotations

import json

import pytest

from plugins.bundle.ugsci.domain.computation.adapters import (
    NetworkXAdapter,
    SymPyAdapter,
)
from plugins.bundle.ugsci.domain.computation.models import (
    GraphAnalysisRequest,
    PolynomialRootsRequest,
)
from plugins.bundle.ugsci.domain.computation.service import ComputationService
from plugins.bundle.ugsci.domain.common.errors import DomainError


def test_service_returns_stable_json_safe_envelope() -> None:
    class FakeAdapter:
        provider_id = "ugsci-test-provider"
        operation = "test.compute"

        def compute(
            self,
            request: PolynomialRootsRequest,
        ) -> dict[str, object]:
            return {"coefficients": request.coefficients}

    result = (
        ComputationService()
        .execute(
            "test-engine",
            FakeAdapter(),
            PolynomialRootsRequest([1.0, -1.0]),
            method="test_method",
        )
        .to_dict()
    )

    assert result["engine_id"] == "test-engine"
    assert result["provider_id"] == "ugsci-test-provider"
    assert result["operation"] == "test.compute"
    assert json.loads(json.dumps(result))["result"]["coefficients"] == [
        1.0,
        -1.0,
    ]


def test_service_rejects_non_finite_inputs_before_adapter_call() -> None:
    class UnexpectedAdapter:
        provider_id = "never-called"
        operation = "never.called"

        def compute(
            self,
            request: PolynomialRootsRequest,
        ) -> dict[str, object]:
            raise AssertionError("adapter must not be called")

    with pytest.raises(DomainError) as caught:
        ComputationService().execute(
            "test-engine",
            UnexpectedAdapter(),
            PolynomialRootsRequest([1.0, float("nan")]),
            method="test_method",
        )
    assert caught.value.code.value == "invalid_input"


def test_sympy_adapter_computes_polynomial_roots() -> None:
    pytest.importorskip("sympy")
    result = SymPyAdapter().compute(PolynomialRootsRequest([1.0, 0.0, -1.0]))
    roots = sorted(round(root["real"], 8) for root in result["roots"])
    assert roots == [-1.0, 1.0]
    assert all(abs(root["imag"]) < 1e-8 for root in result["roots"])


def test_networkx_adapter_computes_graph_metrics_and_path() -> None:
    pytest.importorskip("networkx")
    result = NetworkXAdapter().compute(
        GraphAnalysisRequest(
            nodes=["a", "b", "c"],
            edges=[["a", "b"], ["b", "c"]],
            directed=False,
            source="a",
            target="c",
        ),
    )
    assert result["node_count"] == 3
    assert result["component_count"] == 1
    assert result["shortest_path"] == ["a", "b", "c"]
