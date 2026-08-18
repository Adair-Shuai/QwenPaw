# -*- coding: utf-8 -*-
"""Domain-result to GenUI card adapters."""

from __future__ import annotations

import json

import pytest
from jsonschema.exceptions import ValidationError

from qwenpaw.plugins_bundle.ugsci.genui.domain_cards import (
    attach_genui,
    build_domain_tree,
)
from qwenpaw.plugins_bundle.ugsci.genui.schema import (
    _ALLOWED_KINDS,
    _COMPONENT_CATALOG,
    validate_ui_tree,
)
from qwenpaw.plugins_bundle.ugsci.genui.state import GenUiStateStore
from qwenpaw.plugins_bundle.ugsci.genui.tools import emit_ui_tree


def _forecast_payload() -> dict:
    return {
        "schema_version": 1,
        "engine_id": "decline-analysis",
        "operation": "production.decline.forecast",
        "method": "arps_forecast",
        "metrics": {"forecast_points": 3},
        "units": {"time": "month", "rate": "bbl/d"},
        "result": {
            "model": "exponential",
            "forecast": [
                {"time": 1, "rate": 120.0},
                {"time": 2, "rate": 100.0},
                {"time": 3, "rate": 80.0},
            ],
        },
        "warnings": ["example warning"],
    }


def test_build_forecast_includes_chart_and_kpis() -> None:
    tree = build_domain_tree(_forecast_payload())
    assert tree is not None
    kinds: list[str] = []

    def walk(node: dict) -> None:
        kinds.append(node["kind"])
        for child in node.get("children") or []:
            walk(child)

    walk(tree["root"])
    assert "Chart" in kinds
    assert "MetricCard" in kinds
    assert "Alert" in kinds
    validate_ui_tree(tree)


def test_error_payload_has_no_card() -> None:
    assert (
        build_domain_tree({"code": "invalid_input", "message": "bad"}) is None
    )


def test_catalog_kinds_match_schema_allowlist() -> None:
    catalog = {entry["kind"] for entry in _COMPONENT_CATALOG}
    assert catalog == set(_ALLOWED_KINDS)


def test_file_input_is_gated() -> None:
    tree = {"kind": "FileInput", "props": {"label": "x"}, "children": []}
    with pytest.raises(ValidationError, match="FileInput"):
        validate_ui_tree(tree)
    validate_ui_tree(tree, allow_file_input=True)


def test_action_type_is_enforced() -> None:
    tree = {
        "kind": "Button",
        "props": {
            "label": "Go",
            "action": {
                "type": "open_url",
                "payload": {"url": "https://example.com"},
            },
        },
        "children": [],
    }
    with pytest.raises(ValidationError, match="open_url"):
        validate_ui_tree(tree, allow_actions=["send_message", "submit_form"])
    validate_ui_tree(tree, allow_actions=["send_message", "open_url"])


@pytest.fixture
def _session_and_store(monkeypatch: pytest.MonkeyPatch) -> GenUiStateStore:
    store = GenUiStateStore()
    monkeypatch.setattr(
        "qwenpaw.plugins_bundle.ugsci.genui.state._global_store",
        store,
    )
    monkeypatch.setattr(
        "qwenpaw.app.agent_context.get_current_session_id",
        lambda: "test-session-123",
        raising=False,
    )
    return store


def test_attach_genui_stores_stable_id(
    _session_and_store: GenUiStateStore,
) -> None:
    first = attach_genui(_forecast_payload())
    second = attach_genui(_forecast_payload())
    assert first["genui"]["ok"] is True
    assert first["genui"]["ui_id"] == "ui_dom_production_decline_forecast"
    assert second["genui"]["ui_id"] == first["genui"]["ui_id"]
    assert second["genui"]["revision"] == first["genui"]["revision"] + 1
    snap = _session_and_store.get("test-session-123", first["genui"]["ui_id"])
    assert snap is not None
    assert snap.revision == 2


def test_emit_ui_tree_replaces_requested_id(
    _session_and_store: GenUiStateStore,
) -> None:
    tree = {"kind": "Text", "props": {"value": "one"}, "children": []}
    first = json.loads(
        emit_ui_tree(tree, ui_id="ui_custom_card_01").content[0].text,
    )
    second = json.loads(
        emit_ui_tree(
            {"kind": "Text", "props": {"value": "two"}, "children": []},
            ui_id="ui_custom_card_01",
        )
        .content[0]
        .text,
    )
    assert first["ui_id"] == "ui_custom_card_01"
    assert second["ui_id"] == "ui_custom_card_01"
    assert second["revision"] == 2
    assert second["tree"]["root"]["props"]["value"] == "two"
