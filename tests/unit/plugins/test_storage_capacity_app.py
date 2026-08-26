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
    assert manifest["type"] == "app"
    assert manifest["dependencies"] == ["ugsci"]
    assert manifest["entry"]["backend"] == "backend/main.py"
    assert manifest["entry"]["frontend"] == "ui/index.js"
    assert "/apps/storage-capacity" in frontend
    assert "/storage-capacity/evaluate" in frontend
