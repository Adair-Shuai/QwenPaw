# -*- coding: utf-8 -*-
"""Actual card builders, schema validation and persistent form delivery."""

import copy
import importlib
import json

import pytest


pytestmark = pytest.mark.parametrize(
    "namespace",
    ["plugins.bundle.ugsci.genui", "qwenpaw.plugins_bundle.ugsci.genui"],
)


def walk(node):
    yield node
    for child in node.get("children", []):
        yield from walk(child)


@pytest.fixture(name="card_host")
def isolated_card_host(namespace, tmp_path, monkeypatch):
    cards = importlib.import_module(namespace + ".domain_cards")
    settings = importlib.import_module(namespace + ".settings")
    state = importlib.import_module(namespace + ".state")
    registration = importlib.import_module(namespace + ".registration")
    path = tmp_path / "settings.json"
    path.write_text(json.dumps({"enabled": True}), encoding="utf-8")
    monkeypatch.setattr(settings, "_PATH", path)
    monkeypatch.setattr(
        "qwenpaw.app.agent_context.get_current_session_id",
        lambda: "card-stage-contract",
    )
    monkeypatch.setattr(registration, "_get_current_channel", lambda: None)
    store = state.GenUiStateStore(path=tmp_path / "cards.sqlite")
    monkeypatch.setattr(state, "_global_store", store)
    try:
        yield cards, store
    finally:
        store.close()


@pytest.mark.parametrize(
    "source",
    ["forecast", "rates", "curve", "series", "table", "fits", "absent"],
)
@pytest.mark.parametrize("mapping_fields", [True, False])
def test_domain_card_keeps_chart_priority_stats_and_validated_storage(
    card_host,
    source,
    mapping_fields,
):
    cards, store = card_host
    points = [{"time": 1, "rate": 2}, {"time": 2, "rate": 1}]
    result = (
        {source: points} if source in {"forecast", "rates", "curve"} else {}
    )
    if source in {"table", "fits"}:
        result["rows" if source == "table" else "fits"] = [
            {"model": "first", "score": 0.5},
            {"model": "second", "score": 1},
        ]
    payload = {
        "operation": "contract.forecast",
        "method": "retained_method",
        "title": "Contract result",
        "result": None if source == "absent" else result,
        "metrics": {"answer": 1, "zero": 0} if mapping_fields else None,
        "stats": {"answer": 3, "flag": False} if mapping_fields else [],
        "units": {"answer": "m"} if mapping_fields else "invalid mapping",
        "warnings": ["retained warning"],
        "assumptions": ["retained assumption"],
    }
    if source == "series":
        payload["series"] = points
    before = copy.deepcopy(payload)
    tree = cards.build_domain_tree(payload)
    assert tree is not None
    nodes = list(walk(tree["root"]))
    kinds = [node["kind"] for node in nodes]
    if source in {"forecast", "rates", "curve", "series"}:
        chart = next(node for node in nodes if node["kind"] == "Chart")
        assert chart["props"]["series"][0]["values"] == [2.0, 1.0]
    if source in {"table", "fits"}:
        assert "Table" in kinds
    if mapping_fields:
        metrics = [
            node["props"] for node in nodes if node["kind"] == "MetricCard"
        ]
        assert metrics == [
            {"title": "answer", "value": "3 m"},
            {"title": "zero", "value": "0"},
            {"title": "flag", "value": "false"},
        ]
    merged = cards.attach_genui(payload)
    assert merged["genui"]["ok"] is True
    assert merged["genui"]["ui_id"] == "ui_dom_contract_forecast"
    saved = store.get("card-stage-contract", merged["genui"]["ui_id"])
    assert saved.tree == merged["genui"]["tree"]
    assert payload == before


@pytest.mark.parametrize("trace", [True, False])
def test_card_storage_failure_preserves_original_payload(card_host, trace):
    cards, store = card_host
    payload = (
        traced_payload(False, (0, 5), True)
        if trace
        else {"operation": "contract", "result": {"answer": 2}}
    )
    before = copy.deepcopy(payload)
    store.close()
    assert cards.attach_genui(payload) is payload
    assert payload == before
    assert "genui" not in payload


@pytest.mark.parametrize("guard", ["disabled", "existing-card", "no-session"])
def test_card_admission_guards_preserve_original_payload(
    namespace,
    card_host,
    monkeypatch,
    guard,
):
    cards, _store = card_host
    payload = {"operation": "contract", "result": {"answer": 2}}
    if guard == "disabled":
        importlib.import_module(namespace + ".settings").save_settings(
            enabled=False,
        )
    elif guard == "existing-card":
        payload["genui"] = {"ui_id": "existing"}
    else:
        monkeypatch.setattr(
            "qwenpaw.app.agent_context.get_current_session_id",
            lambda: "",
        )
    assert cards.attach_genui(payload) is payload


def traced_payload(freeform, bounds, metric_result):
    return {
        "operation": "contract.trace",
        "metrics": {"answer": 5} if metric_result else None,
        "units": {"answer": "m"},
        "result": {"answer": 5},
        "warnings": ["keep warning"],
        "assumptions": ["keep assumption"],
        "applicability": ["keep applicability"],
        "provenance": {
            "source": "freeform" if freeform else "library",
            "expression": "x + y",
            "output_symbol": "z",
            "units": {"x": "m", "y": "m", "z": "m"},
            "unit_unknown": ["unknown"],
            "inferred_units": ["inferred"],
            "parser_hash": "parser-fixture",
            "formula_fingerprint": "stable-fixture",
        },
        "trace": {
            "formula_id": "contract",
            "formula_name": "x + y",
            "title": "Contract derivation",
            "source": "freeform" if freeform else "library",
            "input_bounds": {"x": bounds},
            "input_units": {"x": "m", "y": "m"},
            "variables": [
                {
                    "name": "x",
                    "symbol": "x",
                    "value": 2,
                    "editable": True,
                    "source": "input",
                },
                {
                    "name": "y",
                    "symbol": "y",
                    "value": 3,
                    "editable": True,
                    "source": "input",
                },
                {"name": "z", "symbol": "z", "value": 5, "source": "output"},
            ],
            "steps": [
                {
                    "kind": "bind",
                    "group": "assemble",
                    "title": "not a derivation card",
                },
                {
                    "kind": "symbolic",
                    "group": "assemble",
                    "unicode": "z = x + y",
                },
                {
                    "kind": "evaluate",
                    "group": "substitute",
                    "value": 5.0,
                    "display_unit": "m",
                    "substitutions": [["x", 2], ["y", 3]],
                },
                {
                    "kind": "assert",
                    "group": "verify",
                    "value": False,
                    "note": "keep note",
                },
                {
                    "kind": "symbolic",
                    "group": "other",
                    "expression": "ungrouped",
                    "description": "keep explanation",
                },
            ],
        },
    }


@pytest.mark.parametrize("freeform", [True, False])
@pytest.mark.parametrize("bounds", [(0, 5), (0, None), (None, None)])
@pytest.mark.parametrize("metric_result", [True, False])
def test_trace_form_preserves_delivery_content_groups_and_revision(
    card_host,
    freeform,
    bounds,
    metric_result,
):
    cards, store = card_host
    payload = traced_payload(freeform, bounds, metric_result)
    before = copy.deepcopy(payload)
    tree = cards.build_trace_tree(payload)
    nodes = list(walk(tree["root"]))
    form = next(node for node in nodes if node["kind"] == "Form")
    assert [field["props"]["name"] for field in form["children"]] == ["x", "y"]
    assert form["children"][0]["kind"] == (
        "Slider" if bounds == (0, 5) else "NumberInput"
    )
    assert form["props"]["action"]["type"] == "submit_form"
    content = form["props"]["action"]["payload"]["content"]
    for name in ("x", "y"):
        assert f"\n{name}: {{{{ {name} }}}}" in content
        assert f"\n{name}: m" in content
    assert ("ugsci_evaluate_formula" in content) == freeform
    assert [
        node["props"]["label"] for node in nodes if node["kind"] == "Divider"
    ] == [
        "组装方程",
        "代入数值",
        "校验",
        "计算结果",
    ]
    assert sum(node["kind"] == "Card" for node in nodes) == 4
    assert any(
        node["kind"] == "Badge" and node["props"]["value"] == "校验失败"
        for node in nodes
    )
    first = cards.attach_genui(payload)
    second = cards.attach_genui(payload)
    assert first["genui"]["ui_id"] == second["genui"]["ui_id"]
    assert second["genui"]["revision"] == first["genui"]["revision"] + 1
    saved = store.get("card-stage-contract", first["genui"]["ui_id"])
    assert saved.tree == second["genui"]["tree"]
    assert saved.revision == 2
    assert payload == before
