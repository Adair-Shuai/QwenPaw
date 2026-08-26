# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import importlib.util
from pathlib import Path
import sys
import types

import pytest

PLUGIN_DIR = (
    Path(__file__).parents[3] / "plugins" / "apps" / "storage-capacity"
)


def _load_evaluation_module():
    package = "test_storage_capacity_plugin"
    backend_package = f"{package}.backend"
    root_module = types.ModuleType(package)
    root_module.__path__ = [str(PLUGIN_DIR)]
    backend_module = types.ModuleType(backend_package)
    backend_module.__path__ = [str(PLUGIN_DIR / "backend")]
    sys.modules[package] = root_module
    sys.modules[backend_package] = backend_module
    spec = importlib.util.spec_from_file_location(
        f"{backend_package}.evaluation",
        PLUGIN_DIR / "backend" / "evaluation.py",
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


_evaluation = _load_evaluation_module()
demo_case = _evaluation.demo_case
evaluate_case = _evaluation.evaluate_case
fallback_expert_summary = _evaluation.fallback_expert_summary
blank_case = _evaluation.blank_case
ingest_uploaded_documents = _evaluation.ingest_uploaded_documents


def test_demo_evaluation_matches_report_acceptance_values():
    evaluation = evaluate_case(demo_case())
    result = evaluation["result"]

    assert result["effective_inventory"] == pytest.approx(105.0)
    assert result["layers"][0]["effective_inventory"] == pytest.approx(78.3)
    assert result["layers"][1]["effective_inventory"] == pytest.approx(26.7)
    assert result["working_gas_compliance_percent"] == pytest.approx(
        43.5 / 45.1 * 100,
    )
    assert result["peak_daily_compliance_percent"] == pytest.approx(
        3950 / 4020 * 100,
    )
    assert (
        result["review_status"] == "calculated_recommendation_pending_review"
    )
    assert result["review_reference"] is None


def test_evaluation_has_complete_audit_chain():
    evaluation = evaluate_case(demo_case())

    assert evaluation["source_quality_score"] >= 90
    assert len(evaluation["documents"]) == 4
    assert len(evaluation["parameters"]) == 16
    assert [step["status"] for step in evaluation["trace"]] == [
        "completed",
    ] * 5
    assert evaluation["audit"]["deterministic"] is True
    assert len(evaluation["audit"]["input_fingerprint"]) == 16
    assert any("计算/复核候选值" in warning for warning in evaluation["warnings"])


def test_input_fingerprint_changes_with_engineering_input():
    first = demo_case()
    second = demo_case()
    second["layers"][0]["evaluation_pressure"] -= 0.2

    assert (
        evaluate_case(first)["audit"]["input_fingerprint"]
        != evaluate_case(second)["audit"]["input_fingerprint"]
    )


def test_expert_fallback_separates_quantities_and_approval_state():
    summary = fallback_expert_summary(evaluate_case(demo_case()))
    text = "\n".join(summary)

    assert "有效控制库存" in text
    assert "账面库存" in text
    assert "工作气量" in text
    assert "冲峰" in text
    assert "批准流程" in text


def test_manifest_and_frontend_contract():
    manifest = json.loads(
        (PLUGIN_DIR / "plugin.json").read_text(encoding="utf-8"),
    )
    frontend = (PLUGIN_DIR / "ui" / "index.js").read_text(encoding="utf-8")

    assert manifest["id"] == "storage-capacity"
    assert manifest["version"] == "0.1.4"
    assert manifest["type"] == "app"
    assert manifest["dependencies"] == ["ugsci"]
    assert manifest["entry"]["backend"] == "backend/main.py"
    assert manifest["entry"]["frontend"] == "ui/index.js"
    assert "/apps/storage-capacity" in frontend
    assert "/storage-capacity/evaluate" in frontend
    assert "/storage-capacity/ingest" in frontend
    assert "ready_for_evaluation" in frontend


def test_blank_case_is_storage_agnostic_and_does_not_use_demo_values():
    case = blank_case()

    assert case["case_name"] == "待识别储气库 · 库容评估"
    assert case["design_capacity"] is None
    assert case["layers"] == []
    assert case["documents"] == []


def test_ingest_complete_json_case_is_ready_for_any_storage_site():
    payload = {
        "case_name": "示例之外的任意储气库",
        "cycle_id": "2025-cycle",
        "injection_end_state_id": "2025-10-31",
        "evaluation_state_id": "2026-03-31",
        "pressure_basis": "absolute",
        "design_capacity": 80,
        "book_inventory": 76,
        "working_gas": 32,
        "design_working_gas": 34,
        "peak_daily_rate": 2800,
        "design_peak_daily_rate": 3000,
        "layers": [
            {
                "name": "Layer-A",
                "produced_gas": 12,
                "injection_end_pressure": 20,
                "injection_end_z": 0.9,
                "evaluation_pressure": 15,
                "evaluation_z": 0.88,
            },
        ],
    }
    result = ingest_uploaded_documents(
        [
            {
                "filename": "any-storage.json",
                "content": json.dumps(payload).encode("utf-8"),
            },
        ],
    )

    assert result["ready_for_evaluation"] is True
    assert result["case"]["case_name"] == "示例之外的任意储气库"
    assert result["case"]["layers"][0]["name"] == "Layer-A"
    assert result["extraction"]["parsed_file_count"] == 1


def test_ingest_unstructured_evidence_does_not_fake_values():
    result = ingest_uploaded_documents(
        [
            {
                "filename": "pressure-report.pdf",
                "content": b"unstructured pressure report",
            },
        ],
    )

    assert result["ready_for_evaluation"] is False
    assert "设计库容" in result["missing_fields"]
    assert result["case"]["documents"][0]["name"] == "pressure-report.pdf"
    assert result["case"]["design_capacity"] is None
