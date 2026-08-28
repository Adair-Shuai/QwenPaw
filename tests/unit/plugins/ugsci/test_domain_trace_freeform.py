# -*- coding: utf-8 -*-
# flake8: noqa: E501
"""Freeform derivation mode: parser, transform, evaluate, provenance, GenUI, gating.

Tests follow the design doc §16 test plan.  SymPy is an optional dependency;
tests that need it are gated by ``pytest.importorskip("sympy")``.
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path

import pytest

from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.guards import (
    MAX_MAGNITUDE,
    MAX_SYMBOLS,
    MAX_SYMPY_OPS,
    MAX_TRACE_STEPS,
)
from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.parser import (
    is_sympy_available,
    parse_expression,
    parser_hash,
)
from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.request import (
    DeriveFormulaRequest,
    EvaluateFormulaRequest,
    FormulaPreviewRequest,
    TransformFormulaRequest,
)
from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.symbols import (
    build_symbol_table,
    infer_unit,
    inferred_symbols,
    unit_unknown_symbols,
)
from qwenpaw.plugins_bundle.ugsci.domain.common.errors import DomainError

# ── Helper ──────────────────────────────────────────────────────────────────


def _run_tool(coro) -> dict:
    """Run an async tool function and return its chunk payload parsed as JSON."""
    result = asyncio.run(coro)
    # ToolChunk object — extract text
    if hasattr(result, "content") and result.content:
        text = result.content[0].text
    elif isinstance(result, dict) and "payload" in result:
        text = json.dumps(result["payload"])
    else:
        text = json.dumps(result)
    return json.loads(text)


def _walk_kinds(node: dict) -> list[str]:
    kinds = [node["kind"]]
    for child in node.get("children") or []:
        kinds.extend(_walk_kinds(child))
    return kinds


def _walk_find(node: dict, kind: str) -> dict | None:
    if node.get("kind") == kind:
        return node
    for child in node.get("children") or []:
        result = _walk_find(child, kind)
        if result is not None:
            return result
    return None


# ── Gating (always available, no sympy needed) ──────────────────────────────


def test_freeform_disabled_by_default_returns_feature_unavailable() -> None:
    from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.tools import (
        ugsci_derive_formula,
    )

    data = _run_tool(ugsci_derive_formula(expression="x = 1"))
    assert (
        data.get("code") == "feature_unavailable"
        or data.get("error_code") == "feature_unavailable"
    )


def test_freeform_contract_valid_groups_includes_freeform() -> None:
    from qwenpaw.plugins_bundle.ugsci.tool_manifest import _VALID_GROUPS

    assert "freeform" in _VALID_GROUPS


def test_plugin_json_has_freeform_tools() -> None:
    # More robust: find the plugin.json directly
    for parent in Path(__file__).resolve().parents:
        candidate = parent / "plugins" / "bundle" / "ugsci" / "plugin.json"
        if candidate.exists():
            manifest = json.loads(candidate.read_text(encoding="utf-8"))
            tools = manifest["meta"]["tools"]
            freeform_names = [
                t["name"] for t in tools if t.get("group") == "freeform"
            ]
            assert "ugsci_derive_formula" in freeform_names
            assert "ugsci_evaluate_formula" in freeform_names
            assert "ugsci_transform_formula" in freeform_names
            assert "ugsci_formula_preview" in freeform_names
            assert all(
                not t["enabled_by_default"]
                for t in tools
                if t.get("group") == "freeform"
            )
            return
    pytest.fail("plugin.json not found")


# ── Request model validation (no sympy needed) ──────────────────────────────


def test_derive_request_rejects_empty_expression() -> None:
    with pytest.raises(DomainError):
        DeriveFormulaRequest.from_dict({"expression": ""})


def test_derive_request_rejects_invalid_max_steps() -> None:
    with pytest.raises(DomainError):
        DeriveFormulaRequest.from_dict({"expression": "x = 1", "max_steps": 0})
    with pytest.raises(DomainError):
        DeriveFormulaRequest.from_dict(
            {"expression": "x = 1", "max_steps": 200},
        )


def test_evaluate_request_rejects_non_numeric_input() -> None:
    with pytest.raises(DomainError):
        EvaluateFormulaRequest.from_dict(
            {
                "expression": "x + y",
                "inputs": {"x": "abc"},
            },
        )


def test_transform_request_rejects_invalid_operation() -> None:
    with pytest.raises(DomainError):
        TransformFormulaRequest.from_dict(
            {
                "expression": "x = y",
                "operation": "nonexistent",
                "solve_for": "x",
            },
        )


def test_transform_request_solve_for_required_for_rearrange() -> None:
    with pytest.raises(DomainError):
        TransformFormulaRequest.from_dict(
            {
                "expression": "x = y",
                "operation": "rearrange",
            },
        )


def test_preview_request_rejects_empty() -> None:
    with pytest.raises(DomainError):
        FormulaPreviewRequest.from_dict({"expression": "  "})


# ── Symbol inference (no sympy needed) ──────────────────────────────────────


def test_infer_unit_pressure() -> None:
    unit, inferred = infer_unit("p")
    assert unit == "psi"
    assert inferred is True


def test_infer_unit_unknown_symbol() -> None:
    unit, inferred = infer_unit("xyz_unknown")
    assert unit == ""
    assert inferred is False


@pytest.mark.parametrize("name", ["pi", "n", "m", "t"])
def test_ambiguous_short_symbols_are_not_inferred(name: str) -> None:
    unit, inferred = infer_unit(name)
    assert unit == ""
    assert inferred is False


def test_build_symbol_table_explicit_overrides_inferred() -> None:
    table = build_symbol_table(
        {"p": "bar"},
        expr_symbols={"p", "q"},
    )
    assert table["p"]["unit"] == "bar"
    assert table["p"]["source"] == "explicit"
    assert table["q"]["inferred"] is True


def test_unit_unknown_symbols_listed() -> None:
    table = build_symbol_table(
        {},
        expr_symbols={"p", "zzz"},
    )
    unknowns = unit_unknown_symbols(table)
    assert "zzz" in unknowns
    assert "p" not in unknowns


def test_inferred_symbols_listed() -> None:
    table = build_symbol_table(
        {"p": "bar"},
        expr_symbols={"p", "q"},
    )
    inferred = inferred_symbols(table)
    assert "q" in inferred
    assert "p" not in inferred


# ── Guards (no sympy needed) ─────────────────────────────────────────────────


def test_guards_constants_are_expected() -> None:
    assert MAX_SYMPY_OPS == 200
    assert MAX_SYMBOLS == 32
    assert MAX_TRACE_STEPS == 25
    assert MAX_MAGNITUDE == 1e15


def test_check_finite_nonnumeric_raises_domain_error() -> None:
    from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import guards

    with pytest.raises(DomainError) as exc_info:
        guards.check_finite("not-a-number", "x")
    assert exc_info.value.code.value == "invalid_result"


# ── Parser sandbox tests (require sympy) ─────────────────────────────────────

pytestmark_sympy = pytest.mark.skipif(
    not is_sympy_available(),
    reason="SymPy not installed — freeform tests require it",
)


@pytestmark_sympy
class TestParser:
    """Parser sandbox tests (§16 Parser layer)."""

    def test_safe_expression_parses(self) -> None:
        expr = parse_expression("G_p = OGIP * (1 - (p/z) / (p_i/z_i))")
        assert expr is not None

    def test_import_rejected(self) -> None:
        with pytest.raises(DomainError) as exc_info:
            parse_expression("__import__('os')")
        assert exc_info.value.code.value in (
            "invalid_input",
            "unsupported_operation",
        )

    def test_eval_rejected(self) -> None:
        with pytest.raises(DomainError):
            parse_expression("eval('1+1')")

    def test_os_rejected(self) -> None:
        with pytest.raises(DomainError):
            parse_expression("os.system('rm -rf /')")

    def test_getattr_rejected(self) -> None:
        with pytest.raises(DomainError):
            parse_expression("getattr(1, 'real')")

    def test_lambda_rejected(self) -> None:
        with pytest.raises(DomainError):
            parse_expression("lambda: 1")

    def test_symbol_outside_allowlist_rejected(self) -> None:
        with pytest.raises(DomainError) as exc_info:
            parse_expression("x + y", allowed_symbols={"x"})
        assert exc_info.value.code.value == "unsupported_operation"

    def test_parser_hash_is_stable_and_present(self) -> None:
        h = parser_hash()
        assert h.startswith("sha256:")
        assert len(h) > 10
        # Same config → same hash
        assert parser_hash() == h


# ── Transform tests (require sympy) ─────────────────────────────────────────


@pytestmark_sympy
class TestTransform:
    """Transform engine tests (§16 Transform layer)."""

    def test_solve_for_isolates_target(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.recorder import (
            TraceRecorder,
        )
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.transform import (
            do_solve,
        )

        expr = parse_expression("G_p = OGIP * (1 - (p/z) / (p_i/z_i))")
        recorder = TraceRecorder(source="freeform")
        result = do_solve(expr, "OGIP", recorder, reads=("G_p", "p", "z"))
        assert result is not None
        # Verify a solve step was recorded
        solve_steps = [
            s for s in recorder.trace.steps if s.operation == "solve"
        ]
        assert len(solve_steps) >= 1

    def test_substitute_emits_correct_reads_writes(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.recorder import (
            TraceRecorder,
        )
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.transform import (
            do_substitute,
        )

        expr = parse_expression("x + y", allowed_symbols={"x", "y"})
        recorder = TraceRecorder(source="freeform")
        do_substitute(
            expr,
            {"x": "5"},
            recorder,
            reads=("x", "y"),
            writes="result",
        )
        sub_steps = [
            s for s in recorder.trace.steps if s.operation == "substitute"
        ]
        assert len(sub_steps) >= 1

    def test_simplify_only_when_idempotent(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.recorder import (
            TraceRecorder,
        )
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.transform import (
            do_simplify,
        )

        expr = parse_expression("x**2 + 2*x + 1", allowed_symbols={"x"})
        recorder = TraceRecorder(source="freeform")

        # Without idempotent, simplify should be skipped
        do_simplify(expr, recorder, idempotent=False, reads=("x",))
        sub_steps = [
            s for s in recorder.trace.steps if s.operation == "substitute"
        ]
        assert any("skipped" in s.note.lower() for s in sub_steps)

        # With idempotent, simplify should run
        recorder2 = TraceRecorder(source="freeform")
        do_simplify(expr, recorder2, idempotent=True, reads=("x",))
        simpl_steps = [
            s for s in recorder2.trace.steps if s.operation == "simplify"
        ]
        assert len(simpl_steps) >= 1

    def test_substitution_rejects_undeclared_replacement_symbol(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.recorder import (
            TraceRecorder,
        )
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.transform import (
            do_substitute,
        )

        expr = parse_expression("x + y", allowed_symbols={"x", "y"})
        with pytest.raises(DomainError):
            do_substitute(
                expr,
                {"x": "z + 1"},
                TraceRecorder(source="freeform"),
                allowed_symbols={"x", "y"},
            )

    def test_expand_rejects_result_above_op_cap(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.recorder import (
            TraceRecorder,
        )
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.transform import (
            do_expand,
        )

        names = {f"x{index}" for index in range(20)}
        expr = parse_expression(
            f"({'+'.join(sorted(names))})**2",
            allowed_symbols=names,
        )
        recorder = TraceRecorder(source="freeform")
        with pytest.raises(DomainError) as exc_info:
            do_expand(expr, recorder)
        assert exc_info.value.code.value == "non_convergent"
        assert any(step.value is False for step in recorder.trace.steps)


# ── Evaluate tests (require sympy) ──────────────────────────────────────────


@pytestmark_sympy
class TestEvaluate:
    """Numeric evaluation tests (§16 Evaluate layer)."""

    def test_numeric_result_matches_sympy_evalf(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.recorder import (
            TraceRecorder,
        )
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.evaluate import (
            evaluate_expression,
        )

        expr = parse_expression("x * y + z", allowed_symbols={"x", "y", "z"})
        recorder = TraceRecorder(source="freeform")
        result = evaluate_expression(
            expr,
            {"x": 2.0, "y": 3.0, "z": 1.0},
            output_symbol="result",
            recorder=recorder,
        )
        assert result == pytest.approx(7.0)

    def test_nan_raises(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.recorder import (
            TraceRecorder,
        )
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.evaluate import (
            evaluate_expression,
        )

        expr = parse_expression("x / y", allowed_symbols={"x", "y"})
        recorder = TraceRecorder(source="freeform")
        with pytest.raises(DomainError) as exc_info:
            evaluate_expression(
                expr,
                {"x": 1.0, "y": 0.0},
                output_symbol="result",
                recorder=recorder,
            )
        assert exc_info.value.code.value in ("invalid_result", "invalid_input")

    def test_guard_asserts_emitted(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.recorder import (
            TraceRecorder,
        )
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.evaluate import (
            evaluate_expression,
        )

        expr = parse_expression("x + y", allowed_symbols={"x", "y"})
        recorder = TraceRecorder(source="freeform")
        evaluate_expression(
            expr,
            {"x": 1.0, "y": 2.0},
            output_symbol="result",
            recorder=recorder,
        )
        assert_steps = [
            s for s in recorder.trace.steps if s.kind.value == "assert"
        ]
        assert len(assert_steps) >= 1

    def test_magnitude_cap_exceeded(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.recorder import (
            TraceRecorder,
        )
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.evaluate import (
            evaluate_expression,
        )

        expr = parse_expression("x * y", allowed_symbols={"x", "y"})
        recorder = TraceRecorder(source="freeform")
        with pytest.raises(DomainError) as exc_info:
            evaluate_expression(
                expr,
                {"x": 1e16, "y": 1.0},
                output_symbol="result",
                recorder=recorder,
            )
        assert exc_info.value.code.value == "non_convergent"

    def test_mixed_compatible_units_are_converted(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.evaluate import (
            evaluate_expression,
        )

        expr = parse_expression("x + y", allowed_symbols={"x", "y"})
        result = evaluate_expression(
            expr,
            {"x": 1.0, "y": 1.0},
            units={"x": "m", "y": "ft", "z": "m"},
            output_symbol="z",
            expected_output_unit="m",
        )
        assert result == pytest.approx(1.3048)

    def test_equation_orientation_does_not_change_output(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.evaluate import (
            evaluate_expression,
        )

        forward = parse_expression("x = y + 1", allowed_symbols={"x", "y"})
        reverse = parse_expression("y + 1 = x", allowed_symbols={"x", "y"})
        assert (
            evaluate_expression(forward, {"y": 2.0}, output_symbol="x") == 3.0
        )
        assert (
            evaluate_expression(reverse, {"y": 2.0}, output_symbol="x") == 3.0
        )

    def test_tolerance_rejects_near_zero_denominator(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.evaluate import (
            evaluate_expression,
        )

        expr = parse_expression("x / y", allowed_symbols={"x", "y"})
        with pytest.raises(DomainError):
            evaluate_expression(expr, {"x": 1.0, "y": 1e-6}, tolerance=1.0)

    def test_max_steps_is_a_hard_trace_cap(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform.evaluate import (
            evaluate_expression,
        )
        from qwenpaw.plugins_bundle.ugsci.domain.trace.recorder import (
            TraceRecorder,
        )

        expr = parse_expression("x + y", allowed_symbols={"x", "y"})
        recorder = TraceRecorder(source="freeform")
        with pytest.raises(DomainError):
            evaluate_expression(
                expr,
                {"x": 1.0, "y": 2.0},
                max_steps=1,
                recorder=recorder,
            )
        assert len(recorder.trace.steps) == 1


# ── Provenance tests (require sympy + freeform enabled) ─────────────────────


@pytestmark_sympy
class TestProvenance:
    """Provenance tests (§16 Provenance layer)."""

    def test_freeform_provenance_fields(self, monkeypatch) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )

        # Enable freeform
        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)

        data = _run_tool(
            ff_tools.ugsci_evaluate_formula(
                expression="x + y",
                inputs={"x": 1.0, "y": 2.0},
                output_symbol="result",
            ),
        )
        prov = data.get("provenance", {})
        assert prov.get("source") == "freeform"
        assert prov.get("curated") is False
        assert "parser_hash" in prov
        assert prov["parser_hash"].startswith("sha256:")

    def test_unit_unknown_symbols_listed_in_provenance(
        self,
        monkeypatch,
    ) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)

        data = _run_tool(
            ff_tools.ugsci_evaluate_formula(
                expression="alpha + beta",
                inputs={"alpha": 1.0, "beta": 2.0},
                output_symbol="result",
            ),
        )
        prov = data.get("provenance", {})
        unit_unknown = prov.get("unit_unknown", [])
        assert "alpha" in unit_unknown or "beta" in unit_unknown


# ── GenUI tests (require sympy + freeform enabled) ──────────────────────────


@pytestmark_sympy
class TestGenUI:
    """GenUI contract tests (§16 GenUI layer)."""

    def test_build_trace_tree_emits_unverified_badge_for_freeform(
        self,
        monkeypatch,
    ) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )
        from qwenpaw.plugins_bundle.ugsci.genui.domain_cards import (
            build_trace_tree,
        )

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)

        data = _run_tool(
            ff_tools.ugsci_evaluate_formula(
                expression="x + y",
                inputs={"x": 1.0, "y": 2.0},
                output_symbol="result",
            ),
        )
        tree = build_trace_tree(data)
        assert tree is not None
        kinds = _walk_kinds(tree["root"])
        assert "Alert" in kinds
        assert "Badge" in kinds

    def test_build_trace_tree_validates_for_freeform(
        self,
        monkeypatch,
    ) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )
        from qwenpaw.plugins_bundle.ugsci.genui.domain_cards import (
            build_trace_tree,
        )
        from qwenpaw.plugins_bundle.ugsci.genui.schema import validate_ui_tree

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)

        data = _run_tool(
            ff_tools.ugsci_evaluate_formula(
                expression="x + y",
                inputs={"x": 1.0, "y": 2.0},
                output_symbol="result",
            ),
        )
        tree = build_trace_tree(data)
        assert tree is not None
        validate_ui_tree(tree)

    def test_freeform_evaluation_renders_editable_form_and_unique_id(
        self,
        monkeypatch,
    ) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )
        from qwenpaw.plugins_bundle.ugsci.genui.domain_cards import (
            _trace_ui_id,
            build_trace_tree,
        )

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)
        first = _run_tool(
            ff_tools.ugsci_evaluate_formula(
                expression="x + y",
                inputs={"x": 1.0, "y": 2.0},
                units={"x": "m", "y": "m", "z": "m"},
                output_symbol="z",
            ),
        )
        second = _run_tool(
            ff_tools.ugsci_evaluate_formula(
                expression="a * b",
                inputs={"a": 3.0, "b": 4.0},
                output_symbol="c",
            ),
        )
        tree = build_trace_tree(first)
        assert tree is not None
        assert "Form" in _walk_kinds(tree["root"])
        assert _trace_ui_id(first, first["trace"]) != _trace_ui_id(
            second,
            second["trace"],
        )


# ── Tool tests (require sympy + freeform enabled) ────────────────────────────


@pytestmark_sympy
class TestTools:
    """End-to-end tool tests (§16)."""

    def test_derive_formula_returns_trace(self, monkeypatch) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)

        data = _run_tool(
            ff_tools.ugsci_derive_formula(
                expression="G_p = OGIP * (1 - (p/z) / (p_i/z_i))",
                solve_for="OGIP",
                symbols={
                    "G_p": "scf",
                    "OGIP": "sm3",
                    "p": "psi",
                    "z": "",
                    "p_i": "psi",
                    "z_i": "",
                },
            ),
        )
        assert "trace" in data
        assert data["trace"]["source"] == "freeform"
        assert data["provenance"]["source"] == "freeform"

    def test_evaluate_formula_returns_numeric_result(
        self,
        monkeypatch,
    ) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)

        data = _run_tool(
            ff_tools.ugsci_evaluate_formula(
                expression="OGIP = G_p / (1 - (p/z) / (p_i/z_i))",
                inputs={
                    "G_p": 1e9,
                    "p_i": 3000,
                    "z_i": 0.85,
                    "p": 2000,
                    "z": 0.88,
                },
                output_symbol="OGIP",
            ),
        )
        assert "result" in data
        result = data["result"].get("result") or data["result"].get("OGIP")
        assert result is not None
        assert result == pytest.approx(2808.9e6, rel=1e-2)

    def test_transform_formula_substitute(self, monkeypatch) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)

        data = _run_tool(
            ff_tools.ugsci_transform_formula(
                expression="x + y",
                operation="substitute",
                substitution={"x": "5"},
                symbols={"x": "", "y": ""},
            ),
        )
        assert "trace" in data
        assert data["provenance"]["source"] == "freeform"

    def test_formula_preview_parses(self, monkeypatch) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)

        data = _run_tool(
            ff_tools.ugsci_formula_preview(
                expression="x + y",
                symbols={"x": "psi", "y": "psi"},
            ),
        )
        assert data.get("result", {}).get("parseable") is True
        assert "free_symbols" in data.get("result", {})

    def test_formula_preview_rejects_unparseable(self, monkeypatch) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)

        data = _run_tool(
            ff_tools.ugsci_formula_preview(
                expression="eval('bad')",
            ),
        )
        assert data.get("code") in ("invalid_input", "unsupported_operation")

    def test_failure_returns_partial_trace(self, monkeypatch) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)
        data = _run_tool(
            ff_tools.ugsci_evaluate_formula(
                expression="x / y",
                inputs={"x": 1.0, "y": 0.0},
                output_symbol="z",
            ),
        )
        assert data["code"] in ("invalid_input", "invalid_result")
        assert data["trace"]["steps"]
        assert data["warnings"]

    def test_substitution_count_cap_is_enforced(self, monkeypatch) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import guards
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)
        substitutions = {
            f"x{index}": "1" for index in range(guards.MAX_SUBS + 1)
        }
        data = _run_tool(
            ff_tools.ugsci_transform_formula(
                expression="x0 + 1",
                operation="substitute",
                substitution=substitutions,
            ),
        )
        assert data["code"] == "non_convergent"
        assert "trace" in data

    def test_persisted_freeform_defaults_are_consumed(
        self,
        monkeypatch,
    ) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )

        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)
        monkeypatch.setattr(
            ff_tools,
            "_freeform_settings",
            lambda: {
                "freeform_max_steps": 25,
                "freeform_simplify": True,
            },
        )
        simplified = _run_tool(
            ff_tools.ugsci_transform_formula(
                expression="(x + 1) * (x - 1)",
                operation="simplify",
                symbols={"x": ""},
            ),
        )
        assert simplified["result"]["transformed_expression"] == "x**2 - 1"

        monkeypatch.setattr(
            ff_tools,
            "_freeform_settings",
            lambda: {
                "freeform_max_steps": 1,
                "freeform_simplify": False,
            },
        )
        capped = _run_tool(
            ff_tools.ugsci_evaluate_formula(
                expression="x + y",
                inputs={"x": 1.0, "y": 2.0},
            ),
        )
        assert capped["code"] == "non_convergent"
        assert len(capped["trace"]["steps"]) == 1


def test_genui_toggle_preserves_freeform_settings(
    tmp_path,
    monkeypatch,
) -> None:
    from qwenpaw.plugins_bundle.ugsci.genui import settings

    monkeypatch.setattr(settings, "_PATH", tmp_path / "genui.json")
    settings.save_freeform_settings(
        freeform_enabled=True,
        freeform_max_steps=7,
        freeform_simplify=True,
    )
    settings.save_settings(enabled=False)
    saved = settings.load_settings()
    assert saved == {
        "enabled": False,
        "freeform_enabled": True,
        "freeform_max_steps": 7,
        "freeform_simplify": True,
    }


def test_genui_config_api_updates_freeform_settings(
    tmp_path,
    monkeypatch,
) -> None:
    from fastapi import FastAPI
    from fastapi.testclient import TestClient

    from qwenpaw.plugins_bundle.ugsci.genui import settings
    from qwenpaw.plugins_bundle.ugsci.genui.api import build_genui_router

    monkeypatch.setattr(settings, "_PATH", tmp_path / "genui.json")
    app = FastAPI()
    app.include_router(build_genui_router())
    response = TestClient(app).put(
        "/config",
        json={
            "freeform_enabled": True,
            "freeform_max_steps": 9,
            "freeform_simplify": True,
        },
    )
    assert response.status_code == 200
    assert response.json()["freeform_enabled"] is True
    assert response.json()["freeform_max_steps"] == 9
    assert settings.load_settings()["freeform_simplify"] is True


def test_packaged_and_source_trace_python_files_match() -> None:
    repository = Path(__file__).resolve().parents[4]
    bundled = repository / "plugins" / "bundle" / "ugsci" / "domain" / "trace"
    source = (
        repository
        / "src"
        / "qwenpaw"
        / "plugins_bundle"
        / "ugsci"
        / "domain"
        / "trace"
    )
    bundled_files = {
        path.relative_to(bundled) for path in bundled.rglob("*.py")
    }
    source_files = {path.relative_to(source) for path in source.rglob("*.py")}
    assert bundled_files == source_files
    for relative in sorted(bundled_files):
        assert (bundled / relative).read_bytes() == (
            source / relative
        ).read_bytes(), relative


# ── Golden equivalence: freeform == curated for p/z (§16) ───────────────────


@pytestmark_sympy
class TestGoldenEquivalence:
    """Golden end-to-end test: freeform derivation of the same p/z result as curated."""

    def test_freeform_matches_curated_pz(self, monkeypatch) -> None:
        from qwenpaw.plugins_bundle.ugsci.domain.trace.freeform import (
            tools as ff_tools,
        )
        from qwenpaw.plugins_bundle.ugsci.domain.trace.tools import (
            ugsci_trace_calculation,
        )

        GAS_PZ_INPUTS = {
            "produced_gas": 1000e6,
            "initial_pressure": 3000,
            "initial_z_factor": 0.85,
            "current_pressure": 2000,
            "current_z_factor": 0.88,
        }

        # Curated result
        curated_data = _run_tool(
            ugsci_trace_calculation("gas_material_balance_pz", GAS_PZ_INPUTS),
        )
        curated_ogip = curated_data["result"]["estimated_ogip"]

        # Freeform result: same formula, same inputs
        monkeypatch.setattr(ff_tools, "_is_freeform_enabled", lambda: True)
        ff_data = _run_tool(
            ff_tools.ugsci_evaluate_formula(
                expression="OGIP = G_p / (1 - (p/z) / (p_i/z_i))",
                inputs={
                    "G_p": 1000e6,
                    "p_i": 3000,
                    "z_i": 0.85,
                    "p": 2000,
                    "z": 0.88,
                },
                output_symbol="OGIP",
            ),
        )
        ff_result = ff_data["result"].get("result") or ff_data["result"].get(
            "OGIP",
        )

        # The two modes should agree (same OGIP) when the agent authors the canonical equation
        assert ff_result == pytest.approx(curated_ogip, rel=1e-6)
