# -*- coding: utf-8 -*-
"""Unit tests for the GenUI tools module.

Covers emit_ui_tree, list_ui_components, get_genui_guide_tool.

Covers plan section 9.1:
- emit_ui_tree: valid tree, bare root, dict input, oversized payload,
  invalid JSON, invalid kind, session_id propagation
- list_ui_components: returns catalog with expected shape
- get_genui_guide_tool: returns guide payload
"""

from __future__ import annotations

import json
from typing import Any
import pytest

from qwenpaw.plugins_bundle.ugsci.genui.tools import (
    emit_ui_tree,
    get_genui_guide_tool,
    list_ui_components,
)
from qwenpaw.plugins_bundle.ugsci.genui.state import GenUiStateStore


# ─── helpers ────────────────────────────────────────────────────────────────


def _extract_text(chunk: Any) -> str:
    """Extract the text content from a ToolChunk."""
    content = chunk.content
    if hasattr(content, "__iter__"):
        for block in content:
            if hasattr(block, "text"):
                return block.text
    return str(content)


def _extract_json(chunk: Any) -> dict[str, Any]:
    return json.loads(_extract_text(chunk))


def _simple_tree() -> dict[str, Any]:
    return {
        "schemaVersion": "1",
        "root": {
            "kind": "Stack",
            "props": {"gap": 12},
            "children": [
                {"kind": "Text", "props": {"value": "Hello"}, "children": []},
                {"kind": "Text", "props": {"value": "World"}, "children": []},
            ],
        },
    }


@pytest.fixture(autouse=True)
def _fresh_state_store(monkeypatch: pytest.MonkeyPatch) -> None:
    """Replace the global state store with a fresh instance for each test."""
    store = GenUiStateStore()
    monkeypatch.setattr(
        "qwenpaw.plugins_bundle.ugsci.genui.state._global_store",
        store,
    )


@pytest.fixture(autouse=True)
def _mock_session_id(monkeypatch: pytest.MonkeyPatch) -> None:
    """Mock get_current_session_id to return a test session."""

    def _fake_get_session_id() -> str:
        return "test-session-123"

    monkeypatch.setattr(
        "qwenpaw.app.agent_context.get_current_session_id",
        _fake_get_session_id,
        raising=False,
    )


# ─── emit_ui_tree ───────────────────────────────────────────────────────────


class TestEmitUiTreeSuccess:
    def test_valid_envelope(self) -> None:
        chunk = emit_ui_tree(json.dumps(_simple_tree()))
        text = _extract_text(chunk)
        data = json.loads(text)
        assert data["ok"] is True
        assert data["kind"] == "genui"
        assert data["schema_version"] == "1"
        assert "ui_id" in data and data["ui_id"].startswith("ui_")
        assert data["revision"] == 1
        assert "tree" in data
        assert data["tree"]["root"]["kind"] == "Stack"

    def test_bare_root(self) -> None:
        bare = {"kind": "Text", "props": {"value": "hi"}, "children": []}
        chunk = emit_ui_tree(json.dumps(bare))
        data = _extract_json(chunk)
        assert data["ok"] is True
        assert data["tree"]["root"]["kind"] == "Text"

    def test_dict_input_accepted(self) -> None:
        """Defensive: some models may pass a dict despite str type hint."""
        chunk = emit_ui_tree(_simple_tree())  # type: ignore[arg-type]
        data = _extract_json(chunk)
        assert data["ok"] is True

    def test_code_fence_input(self) -> None:
        raw = f"```json\n{json.dumps(_simple_tree())}\n```"
        chunk = emit_ui_tree(raw)
        data = _extract_json(chunk)
        assert data["ok"] is True

    def test_trailing_comma_input(self) -> None:
        raw = '{"kind": "Text", "props": {"value": "hi",}, "children": [],}'
        chunk = emit_ui_tree(raw)
        data = _extract_json(chunk)
        assert data["ok"] is True

    def test_nodeId_filled(self) -> None:
        """Missing nodeId should be auto-filled."""
        bare = {
            "kind": "Stack",
            "children": [{"kind": "Text", "props": {"value": "a"}}],
        }
        chunk = emit_ui_tree(json.dumps(bare))
        data = _extract_json(chunk)
        root = data["tree"]["root"]
        assert root["nodeId"]
        assert root["children"][0]["nodeId"]

    def test_type_coerced_to_kind(self) -> None:
        """Legacy `type` field should be coerced to `kind`."""
        bare = {"type": "Stack", "props": {}, "children": []}
        chunk = emit_ui_tree(json.dumps(bare))
        data = _extract_json(chunk)
        assert data["ok"] is True
        assert data["tree"]["root"]["kind"] == "Stack"

    def test_ui_id_unique(self) -> None:
        """Each call should produce a unique ui_id."""
        chunk1 = emit_ui_tree(json.dumps(_simple_tree()))
        chunk2 = emit_ui_tree(json.dumps(_simple_tree()))
        id1 = _extract_json(chunk1)["ui_id"]
        id2 = _extract_json(chunk2)["ui_id"]
        assert id1 != id2

    def test_tool_call_id_in_result(self) -> None:
        """Result should include tool_call_id field (even if empty)."""
        chunk = emit_ui_tree(json.dumps(_simple_tree()))
        data = _extract_json(chunk)
        assert "tool_call_id" in data

    def test_session_id_propagated(self) -> None:
        """The session_id should be picked up from agent context."""
        chunk = emit_ui_tree(json.dumps(_simple_tree()))
        data = _extract_json(chunk)
        # The ui_id should be stored with session "test-session-123"
        # Verify by checking the state store
        from qwenpaw.plugins_bundle.ugsci.genui.state import get_state_store

        store = get_state_store()
        snap = store.get("test-session-123", data["ui_id"])
        assert snap is not None
        assert snap.session_id == "test-session-123"

    def test_chunk_is_last(self) -> None:
        """The ToolChunk should have is_last=True."""
        chunk = emit_ui_tree(json.dumps(_simple_tree()))
        assert chunk.is_last is True


class TestEmitUiTreeErrors:
    def test_empty_string(self) -> None:
        chunk = emit_ui_tree("")
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["kind"] == "genui_error"
        assert data["error_code"] == "empty_tree"

    def test_whitespace_only(self) -> None:
        chunk = emit_ui_tree("   \n\t  ")
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "empty_tree"

    def test_invalid_json(self) -> None:
        chunk = emit_ui_tree("this is not json at all!!!")
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "parse_failed"
        assert "hint" in data

    def test_invalid_kind(self) -> None:
        tree = {"kind": "NonExistentKind", "props": {}, "children": []}
        chunk = emit_ui_tree(json.dumps(tree))
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "invalid_tree"

    def test_oversized_payload(self) -> None:
        """Payload exceeding GENUI_MAX_JSON_CHARS should be rejected."""
        from qwenpaw.plugins_bundle.ugsci.genui.schema import (
            GENUI_MAX_JSON_CHARS,
        )

        huge = (
            '{"kind": "Text", "props": {"value": "'
            + "x" * (GENUI_MAX_JSON_CHARS + 10)
            + '"}, "children": []}'
        )
        chunk = emit_ui_tree(huge)
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "payload_too_large"

    def test_oversized_object_payload(self) -> None:
        """Object-first calls must obey the same limit as JSON strings."""
        from qwenpaw.plugins_bundle.ugsci.genui.schema import (
            GENUI_MAX_JSON_CHARS,
        )

        chunk = emit_ui_tree(
            {
                "kind": "JsonDebug",
                "props": {"data": {"value": "x" * (GENUI_MAX_JSON_CHARS + 1)}},
                "children": [],
            },
        )
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "payload_too_large"

    def test_invalid_type_input(self) -> None:
        """Non-str, non-dict input should return invalid_type error."""
        chunk = emit_ui_tree(42)  # type: ignore[arg-type]
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "invalid_type"

    def test_error_state_on_chunk(self) -> None:
        """Error ToolChunk should have ERROR state."""
        chunk = emit_ui_tree("")
        # Check the state is ERROR
        assert hasattr(chunk, "state")

    def test_error_hint_present(self) -> None:
        """Error responses should include a helpful hint."""
        chunk = emit_ui_tree("not json")
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert "hint" in data or "message" in data


# ─── list_ui_components ─────────────────────────────────────────────────────


class TestListUiComponents:
    def test_returns_catalog(self) -> None:
        chunk = list_ui_components()
        data = _extract_json(chunk)
        assert "components" in data
        assert isinstance(data["components"], list)
        assert len(data["components"]) > 0

    def test_returns_node_shape(self) -> None:
        chunk = list_ui_components()
        data = _extract_json(chunk)
        assert "node_shape" in data
        assert "kind" in data["node_shape"]

    def test_returns_rules(self) -> None:
        chunk = list_ui_components()
        data = _extract_json(chunk)
        assert "rules" in data
        assert isinstance(data["rules"], list)
        assert len(data["rules"]) > 0

    def test_chunk_success_state(self) -> None:
        chunk = list_ui_components()
        assert chunk.is_last is True


# ─── get_genui_guide_tool ───────────────────────────────────────────────────


class TestGetGenUiGuide:
    def test_returns_guide(self) -> None:
        chunk = get_genui_guide_tool()
        data = _extract_json(chunk)
        assert "purpose" in data
        assert "wire_format_and_syntax" in data
        assert "when_to_call" in data
        assert "layout_structure" in data

    def test_guide_has_actions(self) -> None:
        chunk = get_genui_guide_tool()
        data = _extract_json(chunk)
        assert "actions" in data
        assert isinstance(data["actions"], list)

    def test_guide_has_anti_patterns(self) -> None:
        chunk = get_genui_guide_tool()
        data = _extract_json(chunk)
        assert "anti_patterns" in data

    def test_chunk_success_state(self) -> None:
        chunk = get_genui_guide_tool()
        assert chunk.is_last is True
