# -*- coding: utf-8 -*-
"""Traced derivation: models, recorder, curated formula, and GenUI contract."""

from __future__ import annotations

import asyncio
import json
from pathlib import Path

import pytest

from qwenpaw.plugins_bundle.ugsci.domain.trace.library import default_library
from qwenpaw.plugins_bundle.ugsci.domain.trace.models import (
    VariableBinding,
    TraceStepKind,
)
from qwenpaw.plugins_bundle.ugsci.domain.trace.recorder import TraceRecorder
from qwenpaw.plugins_bundle.ugsci.domain.trace.asciimath import (
    to_unicode,
    latex_fragment,
)
from qwenpaw.plugins_bundle.ugsci.domain.trace.tools import (
    _validate_inputs,
    ugsci_list_derivation_formulas,
    ugsci_trace_calculation,
)
from qwenpaw.plugins_bundle.ugsci.domain.deterministic.tools import (
    ugsci_gas_material_balance,
)
from qwenpaw.plugins_bundle.ugsci.genui.domain_cards import (
    _trace_ui_id,
    build_trace_tree,
)
from qwenpaw.plugins_bundle.ugsci.genui.schema import validate_ui_tree
from qwenpaw.plugins_bundle.ugsci.domain.common.errors import DomainError

GAS_PZ_INPUTS = {
    "produced_gas": 1000e6,
    "initial_pressure": 3000,
    "initial_z_factor": 0.85,
    "current_pressure": 2000,
    "current_z_factor": 0.88,
}

_formula = default_library.get("gas_material_balance_pz")


def _traced_payload() -> dict:
    inputs = _validate_inputs("gas_material_balance_pz", GAS_PZ_INPUTS)
    recorder = TraceRecorder(
        formula_id=_formula.formula_id,
        formula_name=_formula.name,
    )
    domain = _formula.case(inputs, recorder)
    return recorder.finish(domain).to_dict()


def _run_tool(coro) -> dict:
    """Run an async tool and parse its chunk payload as JSON."""
    result = asyncio.run(coro)
    return json.loads(result.content[0].text)


def _walk_kinds(node: dict) -> list[str]:
    kinds = [node["kind"]]
    for child in node.get("children") or []:
        kinds.extend(_walk_kinds(child))
    return kinds


# ── Models / recorder ────────────────────────────────────────────────────


def test_recorder_builds_ordered_steps_and_variables() -> None:
    recorder = TraceRecorder(
        formula_id="gas_material_balance_pz",
        title="Gas p/z",
    )
    recorder.bind("produced_gas", "G_p", 1000e6, "scf", source="input")
    recorder.solve(
        "Solve",
        "OGIP = G_p / (1 - (p/z)/(p_i/z_i))",
        for_symbol="OGIP",
    )
    recorder.evaluate("OGIP", "G_p / 0.356", 2808.5e6, "scf")
    recorder.assert_true("Denominator positive", True, detail="ok")

    trace = recorder.trace
    kinds = [step.kind for step in trace.steps]
    assert kinds == [
        TraceStepKind.BIND,
        TraceStepKind.SYMBOLIC,
        TraceStepKind.EVALUATE,
        TraceStepKind.ASSERT,
    ]
    assert "produced_gas" in trace.variables
    assert trace.variables["produced_gas"].symbol == "G_p"
    assert all(step.id.startswith("step") for step in trace.steps)


def test_trace_step_serializes_reads_writes_substitutions() -> None:
    recorder = TraceRecorder()
    recorder.bind("p", "p", 2000.0, "psi")
    recorder.bind("z", "z", 0.88, "")
    step = recorder.evaluate(
        "Current p/z",
        "p / z",
        2272.7,
        "psi",
        substitutions=(("p", "2000 psi"), ("z", "0.88")),
        reads=("p", "z"),
        writes="pz",
    )
    data = step.to_dict()
    assert data["kind"] == "evaluate"
    assert data["reads"] == ["p", "z"]
    assert data["writes"] == "pz"
    assert ["p", "2000 psi"] in data["substitutions"]


def test_variable_binding_source_defaults_to_input() -> None:
    binding = VariableBinding(name="x", symbol="x", value=1.0, unit="m")
    assert binding.source == "input"


def test_editable_binding_serializes_bounds() -> None:
    binding = VariableBinding(
        name="p",
        symbol="p_i",
        value=3000.0,
        unit="psi",
        source="input",
        editable=True,
        display_name="Initial pressure",
        input_bounds=(0.0, None),
    )
    data = binding.to_dict()
    assert data["editable"] is True
    assert data["display_name"] == "Initial pressure"
    assert data["input_bounds"] == [0.0, None]
    # A non-editable binding is flagged and bounds are omitted.
    assert (
        VariableBinding(name="x", symbol="x", value=1.0).to_dict()["editable"]
        is False
    )


# ── Curated formula: gas p/z ─────────────────────────────────────────────


def test_gas_pz_golden_matches_adapter_math() -> None:
    payload = _traced_payload()
    pi = 3000 / 0.85
    p = 2000 / 0.88
    denominator = 1.0 - p / pi
    expected_ogip = 1000e6 / denominator

    assert payload["result"]["estimated_ogip"] == pytest.approx(expected_ogip)
    assert payload["result"]["recovery_factor"] == pytest.approx(
        GAS_PZ_INPUTS["produced_gas"] / expected_ogip,
    )
    assert payload["units"]["estimated_ogip"] == "scf"
    assert len(payload["trace"]["steps"]) >= 10
    assert len(payload["trace"]["variables"]) >= 6
    # Provenance is auditable.
    assert payload["provenance"]["input_fingerprint"].startswith("sha256:")


def test_gas_pz_rejects_current_pressure_above_initial() -> None:
    inputs = dict(GAS_PZ_INPUTS, current_pressure=3100.0)
    recorder = TraceRecorder(formula_id=_formula.formula_id)
    with pytest.raises(DomainError):
        _formula.case(_validate_inputs(_formula.formula_id, inputs), recorder)


def test_failed_case_returns_partial_observable_trace() -> None:
    data = _run_tool(
        ugsci_trace_calculation(
            "gas_material_balance_pz",
            dict(
                GAS_PZ_INPUTS,
                current_pressure=3000 * 0.8 / 0.85,
                current_z_factor=0.8,
            ),
        ),
    )
    assert data["code"] == "invalid_input"
    assert data["trace"]["formula_version"] == _formula.version
    assert any(
        step["kind"] == "assert" and step["value"] is False
        for step in data["trace"]["steps"]
    )


# ── Input validation ─────────────────────────────────────────────────────


def test_validate_inputs_rejects_unknown_capability() -> None:
    with pytest.raises(DomainError):
        default_library.get("no_such_formula")


def test_trace_calculation_rejects_unknown_input_key() -> None:
    data = _run_tool(
        ugsci_trace_calculation("gas_material_balance_pz", {"bogus": 1.0}),
    )
    assert data["code"] == "invalid_input"


def test_trace_calculation_rejects_non_finite_input() -> None:
    data = _run_tool(
        ugsci_trace_calculation(
            "gas_material_balance_pz",
            dict(GAS_PZ_INPUTS, produced_gas=float("nan")),
        ),
    )
    assert data["code"] == "invalid_input"


@pytest.mark.parametrize("bad_value", [None, float("inf"), float("-inf")])
def test_trace_calculation_rejects_other_invalid_numeric_inputs(
    bad_value,
) -> None:
    data = _run_tool(
        ugsci_trace_calculation(
            "gas_material_balance_pz",
            dict(GAS_PZ_INPUTS, produced_gas=bad_value),
        ),
    )
    assert data["code"] == "invalid_input"


def test_trace_calculation_success_payload() -> None:
    data = _run_tool(
        ugsci_trace_calculation("gas_material_balance_pz", GAS_PZ_INPUTS),
    )
    assert "trace" in data
    assert data["trace"]["formula_id"] == "gas_material_balance_pz"


def test_list_derivation_formulas_returns_catalog() -> None:
    data = _run_tool(ugsci_list_derivation_formulas())
    assert data["count"] >= 1
    ids = [f["formula_id"] for f in data["formulas"]]
    assert "gas_material_balance_pz" in ids


# ── GenUI contract ───────────────────────────────────────────────────────


def test_build_trace_tree_is_valid_and_complete() -> None:
    payload = _traced_payload()
    tree = build_trace_tree(payload)
    assert tree is not None
    kinds = _walk_kinds(tree["root"])
    # Worksheet sections: derivation steps, result KPIs, variable registry,
    # and assumptions/applicability.
    assert "Card" in kinds  # derivation steps
    assert "Table" in kinds  # variable registry
    assert "KpiBoard" in kinds or "Grid" in kinds  # result envelope
    assert "Accordion" in kinds  # assumptions / applicability
    validate_ui_tree(tree)


def test_trace_tree_renders_stage_grouping() -> None:
    payload = _traced_payload()
    tree = build_trace_tree(payload)
    labels = []
    for child in tree["root"]["children"]:
        if child["kind"] == "Divider":
            labels.append(child["props"].get("label", ""))
    # Stage dividers appear for each workflow stage, plus the result divider.
    assert "组装方程" in labels
    assert "代入数值" in labels
    assert "化简" in labels
    assert "计算结果" in labels


def test_build_trace_tree_none_without_trace() -> None:
    assert build_trace_tree({"result": {}}) is None


# ── Phase 2: live-edit worksheet ─────────────────────────────────────────


def _walk_find(node: dict, kind: str) -> dict | None:
    if node.get("kind") == kind:
        return node
    for child in node.get("children") or []:
        result = _walk_find(child, kind)
        if result is not None:
            return result
    return None


def test_trace_mark_gas_pz_inputs_editable() -> None:
    payload = _traced_payload()
    editable = [
        binding
        for binding in payload["trace"]["variables"]
        if binding.get("editable") and binding.get("source") == "input"
    ]
    names = {binding["name"] for binding in editable}
    assert names == {
        "produced_gas",
        "initial_pressure",
        "initial_z_factor",
        "current_pressure",
        "current_z_factor",
    }
    bounds = payload["trace"].get("input_bounds", {})
    # z-factors carry bounded ranges (slider), pressures only a lower bound.
    assert bounds["initial_z_factor"][0] is not None
    assert bounds["initial_z_factor"][1] is not None
    assert bounds["initial_pressure"][0] == 0.0
    assert bounds["initial_pressure"][1] is None


def test_trace_tree_renders_live_edit_form() -> None:
    payload = _traced_payload()
    tree = build_trace_tree(payload)
    assert tree is not None
    validate_ui_tree(tree)

    form = _walk_find(tree["root"], "Form")
    assert form is not None
    assert form["props"]["action"]["type"] == "submit_form"
    field_names = [child["props"]["name"] for child in form["children"]]
    assert set(field_names) == {
        "produced_gas",
        "initial_pressure",
        "initial_z_factor",
        "current_pressure",
        "current_z_factor",
    }

    kinds = _walk_kinds(tree["root"])
    assert "Slider" in kinds
    assert "NumberInput" in kinds


def test_trace_form_action_interpolates_editable_inputs() -> None:
    payload = _traced_payload()
    tree = build_trace_tree(payload)
    form = _walk_find(tree["root"], "Form")
    assert form is not None
    content = form["props"]["action"]["payload"]["content"]
    # Every editable input must be referenced by a {{ name }} placeholder so
    # the renderer substitutes the control value into the re-run message.
    for name in (
        "produced_gas",
        "initial_pressure",
        "initial_z_factor",
        "current_pressure",
        "current_z_factor",
    ):
        assert f"{{{{ {name} }}}}" in content
        assert f"\n{name}:" in content

    submitted = {
        child["props"]["name"]: child["props"]["value"]
        for child in form["children"]
    }
    submitted.update(payload["trace"]["input_units"])
    assert (
        _validate_inputs("gas_material_balance_pz", submitted).keys()
        == submitted.keys()
    )


def test_trace_inputs_report_invalid_missing_and_string_values() -> None:
    missing = _run_tool(
        ugsci_trace_calculation(
            "gas_material_balance_pz",
            {"produced_gas": 1.0},
        ),
    )
    assert missing["code"] == "invalid_input"
    bad_string = _run_tool(
        ugsci_trace_calculation(
            "gas_material_balance_pz",
            dict(GAS_PZ_INPUTS, produced_gas="abc"),
        ),
    )
    assert bad_string["code"] == "invalid_input"
    boolean = _run_tool(
        ugsci_trace_calculation(
            "gas_material_balance_pz",
            dict(GAS_PZ_INPUTS, produced_gas=True),
        ),
    )
    assert boolean["code"] == "invalid_input"


def test_trace_preserves_input_units_for_form_rerun() -> None:
    payload = _run_tool(
        ugsci_trace_calculation(
            "gas_material_balance_pz",
            dict(GAS_PZ_INPUTS, gas_volume_unit="m3", pressure_unit="bar"),
        ),
    )
    assert payload["trace"]["input_units"] == {
        "gas_volume_unit": "m3",
        "pressure_unit": "bar",
    }
    tree = build_trace_tree(payload)
    form = _walk_find(tree["root"], "Form")
    assert form is not None
    content = form["props"]["action"]["payload"]["content"]
    assert "gas_volume_unit: m3" in content
    assert "pressure_unit: bar" in content
    pz_steps = [
        step
        for step in payload["trace"]["steps"]
        if step["kind"] == "evaluate"
        and step["writes"] in {"initial_pz", "current_pz"}
    ]
    assert all(step["unit"] == "psi" for step in pz_steps)
    assert all(step["display_unit"] == "bar" for step in pz_steps)


@pytest.mark.parametrize(
    ("gas_unit", "pressure_unit"),
    [("scf", "psi"), ("m3", "bar")],
)
def test_traced_and_deterministic_gas_balance_agree_across_units(
    gas_unit: str,
    pressure_unit: str,
) -> None:
    inputs = dict(
        GAS_PZ_INPUTS,
        gas_volume_unit=gas_unit,
        pressure_unit=pressure_unit,
    )
    traced = _run_tool(
        ugsci_trace_calculation("gas_material_balance_pz", inputs),
    )
    deterministic = _run_tool(
        ugsci_gas_material_balance(
            inputs["produced_gas"],
            inputs["initial_pressure"],
            inputs["initial_z_factor"],
            inputs["current_pressure"],
            inputs["current_z_factor"],
            gas_unit,
            pressure_unit,
        ),
    )
    assert traced["result"]["estimated_ogip"] == pytest.approx(
        deterministic["result"]["estimated_ogip"],
    )


def test_trace_rejects_out_of_range_z_factor() -> None:
    data = _run_tool(
        ugsci_trace_calculation(
            "gas_material_balance_pz",
            dict(GAS_PZ_INPUTS, initial_z_factor=2.0),
        ),
    )
    assert data["code"] == "invalid_input"


# ── Unicode math rendering (worksheet equations) ──────────────────────────


def test_to_unicode_renders_scientific_notation() -> None:
    assert (
        to_unicode("G_p = OGIP * (1 - (p/z) / (p_i/z_i))")
        == "Gₚ = OGIP · (1 - (p/z) / (pᵢ/zᵢ))"
    )
    assert to_unicode("q^2") == "q²"
    assert to_unicode("x * (1 - 0.2 * x)") == "x · (1 - 0.2 · x)"
    assert to_unicode("x**2") == "x²"
    assert to_unicode("x^{2}") == "x²"
    assert to_unicode("pipeline") == "pipeline"
    assert to_unicode("sqrt_value") == "sqrt_value"


def test_latex_fragment_renders_fractions() -> None:
    # A single \frac renders as a slash fraction with subscripts.
    assert (
        latex_fragment(r"\frac{p_i}{z_i} = \frac{3000}{0.85}")
        == "pᵢ / zᵢ = 3000 / 0.85"
    )
    assert latex_fragment(r"\frac{a}{1-\frac{b}{c}}") == "a / (1-b / c)"


def test_trace_step_has_unicode_equation() -> None:
    recorder = TraceRecorder(formula_id="gas_material_balance_pz")
    recorder.evaluate(
        "Current p/z",
        "p / z",
        2272.7,
        "psi",
        reads=("p", "z"),
        writes="pz",
    )
    unicode_eq = recorder.trace.steps[-1].unicode
    assert "p" in unicode_eq and "z" in unicode_eq


def test_trace_group_rejects_unknown_stage() -> None:
    recorder = TraceRecorder()
    with pytest.raises(ValueError, match="unsupported trace step group"):
        recorder.evaluate("bad", "x", 1.0, group="typo")


def test_trace_ui_id_separates_different_inputs() -> None:
    first = _traced_payload()
    second_inputs = dict(GAS_PZ_INPUTS, produced_gas=1200e6)
    inputs = _validate_inputs("gas_material_balance_pz", second_inputs)
    recorder = TraceRecorder(
        formula_id=_formula.formula_id,
        formula_name=_formula.name,
    )
    second = recorder.finish(_formula.case(inputs, recorder)).to_dict()
    assert _trace_ui_id(first, first["trace"]) != _trace_ui_id(
        second,
        second["trace"],
    )
    assert _trace_ui_id(first, first["trace"]) == _trace_ui_id(
        first,
        first["trace"],
    )


def test_bundled_and_packaged_trace_sources_stay_in_sync() -> None:
    root = Path(__file__).parents[4]
    bundled = root / "plugins" / "bundle" / "ugsci"
    packaged = root / "src" / "qwenpaw" / "plugins_bundle" / "ugsci"
    relative_files = [
        "domain/__init__.py",
        "domain/trace/__init__.py",
        "domain/trace/asciimath.py",
        "domain/trace/models.py",
        "domain/trace/recorder.py",
        "domain/trace/tools.py",
        "domain/trace/library/__init__.py",
        "domain/trace/library/material_balance.py",
        "genui/domain_cards.py",
        "plugin.py",
        "plugin.json",
        "tool_manifest.py",
    ]
    mismatches = [
        path
        for path in relative_files
        if (bundled / path).read_bytes() != (packaged / path).read_bytes()
    ]
    assert not mismatches, f"UGSci bundled/package copies differ: {mismatches}"
