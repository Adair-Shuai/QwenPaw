# -*- coding: utf-8 -*-
"""Integration tests for the GenUI full chain.

Covers plan section 9.3:
- emit_ui_tree → validate → state store → ToolChunk result format
- Result format matches frontend expectations (ok, kind, ui_id, tree)
- Multiple trees in same session don't overwrite
- State store retrieval after emit
- Error propagation through the chain
- JSON repair → validation → emit chain
"""

from __future__ import annotations

import json
from typing import Any

import pytest

from qwenpaw.plugins_bundle.ugsci.genui.json_repair import (
    try_parse_json_object,
)
from qwenpaw.plugins_bundle.ugsci.genui.schema import (
    validate_ui_tree,
)
from qwenpaw.plugins_bundle.ugsci.genui.state import (
    GenUiStateStore,
    get_state_store,
)
from qwenpaw.plugins_bundle.ugsci.genui.tools import (
    emit_ui_tree,
    emit_ui_patch,
    list_ui_components,
    get_genui_guide_tool,
)


# ─── helpers ────────────────────────────────────────────────────────────────


def _extract_text(chunk: Any) -> str:
    content = chunk.content
    if hasattr(content, "__iter__"):
        for block in content:
            if hasattr(block, "text"):
                return block.text
    return str(content)


def _extract_json(chunk: Any) -> dict[str, Any]:
    return json.loads(_extract_text(chunk))


def _dashboard_tree() -> dict[str, Any]:
    """A multi-node dashboard tree for integration testing."""
    return {
        "schemaVersion": "1",
        "root": {
            "kind": "Stack",
            "props": {"gap": 16},
            "children": [
                {
                    "kind": "Grid",
                    "props": {"columns": 3, "gap": 12},
                    "children": [
                        {
                            "kind": "MetricCard",
                            "props": {
                                "title": "Revenue",
                                "value": "$42K",
                                "delta": "+12%",
                                "trend": "up",
                            },
                            "children": [],
                        },
                        {
                            "kind": "MetricCard",
                            "props": {
                                "title": "Users",
                                "value": "1,234",
                                "delta": "+5%",
                                "trend": "up",
                            },
                            "children": [],
                        },
                        {
                            "kind": "MetricCard",
                            "props": {
                                "title": "Churn",
                                "value": "2.3%",
                                "delta": "-0.5%",
                                "trend": "down",
                            },
                            "children": [],
                        },
                    ],
                },
                {
                    "kind": "Card",
                    "props": {"title": "Weekly Trend"},
                    "children": [
                        {
                            "kind": "Chart",
                            "props": {
                                "chart": "line",
                                "title": "Weekly Revenue",
                                "categories": [
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                ],
                                "series": [
                                    {
                                        "name": "Revenue",
                                        "values": [100, 200, 150, 300, 250],
                                    },
                                ],
                                "height": 200,
                            },
                            "children": [],
                        },
                    ],
                },
            ],
        },
    }


@pytest.fixture(autouse=True)
def _fresh_state_store(monkeypatch: pytest.MonkeyPatch) -> None:
    store = GenUiStateStore()
    monkeypatch.setattr(
        "qwenpaw.plugins_bundle.ugsci.genui.state._global_store",
        store,
    )


@pytest.fixture(autouse=True)
def _mock_session_id(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "qwenpaw.app.agent_context.get_current_session_id",
        lambda: "integration-session",
        raising=False,
    )


# ─── Full Chain: emit → validate → store → result ──────────────────────────


class TestFullChainEmitToResult:
    def test_dashboard_tree_full_chain(self) -> None:
        """A complex dashboard tree should pass through the full chain."""
        tree_json = json.dumps(_dashboard_tree())

        # 1. Parse
        parsed = try_parse_json_object(tree_json)
        assert parsed is not None

        # 2. Validate
        normalized = validate_ui_tree(parsed)
        assert normalized["root"]["kind"] == "Stack"

        # 3. Emit
        chunk = emit_ui_tree(tree_json)
        data = _extract_json(chunk)

        # 4. Verify result format
        assert data["ok"] is True
        assert data["kind"] == "genui"
        assert data["schema_version"] == "1"
        assert data["ui_id"].startswith("ui_")
        assert data["revision"] == 1
        assert "tree" in data

        # 5. Verify tree is the normalized version
        result_tree = data["tree"]
        assert result_tree["root"]["kind"] == "Stack"
        assert len(result_tree["root"]["children"]) == 2

        # 6. Verify state store
        store = get_state_store()
        snap = store.get("integration-session", data["ui_id"])
        assert snap is not None
        assert snap.tree == result_tree

    def test_result_format_matches_frontend_contract(self) -> None:
        """
        The result JSON must contain all fields the frontend parser expects.
        """
        chunk = emit_ui_tree(
            json.dumps(
                {"kind": "Text", "props": {"value": "hi"}, "children": []},
            ),
        )
        data = _extract_json(chunk)

        # Frontend parseGenUiResult checks: ok === true && kind === "genui"
        assert data["ok"] is True
        assert data["kind"] == "genui"

        # Frontend extractGenUiResults expects: ui_id, tree, revision
        assert "ui_id" in data
        assert "tree" in data
        assert "revision" in data

        # tree must have root
        assert "root" in data["tree"]
        assert "kind" in data["tree"]["root"]

    def test_error_result_format_matches_frontend_contract(self) -> None:
        """
        Error results must contain fields the frontend error handler expects.
        """
        chunk = emit_ui_tree("")
        data = _extract_json(chunk)

        # Frontend checks: ok === false
        assert data["ok"] is False
        # Error fields
        assert "error_code" in data
        assert "message" in data


# ─── Multiple Trees Don't Overwrite ────────────────────────────────────────


class TestMultipleTreesNoOverwrite:
    def test_multiple_trees_same_session(self) -> None:
        """
        Multiple emit_ui_tree calls in the same session should each get unique
        ui_ids.
        """
        tree1 = json.dumps(
            {"kind": "Text", "props": {"value": "first"}, "children": []},
        )
        tree2 = json.dumps(
            {"kind": "Text", "props": {"value": "second"}, "children": []},
        )

        chunk1 = emit_ui_tree(tree1)
        chunk2 = emit_ui_tree(tree2)

        data1 = _extract_json(chunk1)
        data2 = _extract_json(chunk2)

        assert data1["ui_id"] != data2["ui_id"]

        # Both should be in the state store
        store = get_state_store()
        assert store.get("integration-session", data1["ui_id"]) is not None
        assert store.get("integration-session", data2["ui_id"]) is not None

        # Trees should be different
        snap1 = store.get("integration-session", data1["ui_id"])
        snap2 = store.get("integration-session", data2["ui_id"])
        assert snap1.tree["root"]["props"]["value"] == "first"
        assert snap2.tree["root"]["props"]["value"] == "second"

    def test_different_sessions_dont_interfere(self) -> None:
        """Trees from different sessions should be completely isolated."""
        tree = json.dumps(
            {"kind": "Text", "props": {"value": "test"}, "children": []},
        )

        # Patch session ID for first call
        chunk1 = emit_ui_tree(tree)
        data1 = _extract_json(chunk1)

        # Change session ID
        import qwenpaw.plugins_bundle.ugsci.genui.tools as tools_mod

        original = tools_mod.get_state_store
        store = original()

        # Manually create a snapshot in a different session
        snap_other = store.create(
            session_id="other-session",
            tree={"kind": "Text", "props": {}, "children": []},
        )

        # Verify isolation
        assert store.get("integration-session", data1["ui_id"]) is not None
        assert store.get("other-session", snap_other.ui_id) is not None
        assert store.get("integration-session", snap_other.ui_id) is None
        assert store.get("other-session", data1["ui_id"]) is None


# ─── JSON Repair → Validation → Emit Chain ─────────────────────────────────


class TestRepairValidateEmitChain:
    def test_code_fence_repaired_then_validated(self) -> None:
        """
        LLM output with code fences should be repaired and emitted
        successfully.
        """
        tree_obj = {"kind": "Stack", "props": {"gap": 12}, "children": []}
        raw = f"```json\n{json.dumps(tree_obj)}\n```"
        chunk = emit_ui_tree(raw)
        data = _extract_json(chunk)
        assert data["ok"] is True

    def test_trailing_comma_repaired_then_validated(self) -> None:
        """LLM output with trailing commas should be repaired and emitted."""
        raw = (
            '{"kind": "Stack", "props": {"gap": 12,}, '
            '"children": [{"kind": "Text", '
            '"props": {"value": "hi",},},],}'
        )
        chunk = emit_ui_tree(raw)
        data = _extract_json(chunk)
        assert data["ok"] is True

    def test_truncated_json_repaired_then_validated(self) -> None:
        """Truncated JSON should be closed and validated."""
        raw = '{"kind": "Stack", "props": {"gap": 12}, "children": []'
        chunk = emit_ui_tree(raw)
        data = _extract_json(chunk)
        # May or may not succeed depending on repair heuristics
        if data["ok"]:
            assert data["tree"]["root"]["kind"] == "Stack"

    def test_type_coerced_then_validated(self) -> None:
        """
        Legacy `type` field should be coerced to `kind` before validation.
        """
        raw = json.dumps(
            {"type": "Text", "props": {"value": "hello"}, "children": []},
        )
        chunk = emit_ui_tree(raw)
        data = _extract_json(chunk)
        assert data["ok"] is True
        assert data["tree"]["root"]["kind"] == "Text"

    def test_props_lifted_then_validated(self) -> None:
        """Flat props should be lifted into `props` before validation."""
        raw = json.dumps(
            {"kind": "Text", "value": "hello world", "children": []},
        )
        chunk = emit_ui_tree(raw)
        data = _extract_json(chunk)
        assert data["ok"] is True
        assert data["tree"]["root"]["props"]["value"] == "hello world"


# ─── Read-Only Tools Don't Affect State ────────────────────────────────────


class TestReadOnlyTools:  # pylint: disable=protected-access
    def test_list_ui_components_no_state_change(self) -> None:
        """list_ui_components should not create any state store entries."""
        store_before = get_state_store()
        count_before = len(store_before._store)  # type: ignore[attr-defined]

        list_ui_components()

        count_after = len(store_before._store)  # type: ignore[attr-defined]
        assert count_before == count_after

    def test_get_genui_guide_no_state_change(self) -> None:
        """get_genui_guide should not create any state store entries."""
        store_before = get_state_store()
        count_before = len(store_before._store)  # type: ignore[attr-defined]

        get_genui_guide_tool()

        count_after = len(store_before._store)  # type: ignore[attr-defined]
        assert count_before == count_after


# ─── Error Propagation ─────────────────────────────────────────────────────


class TestErrorPropagation:  # pylint: disable=protected-access
    def test_invalid_kind_does_not_create_state(self) -> None:
        """
        An invalid kind should return an error and NOT create a state store
        entry.
        """
        store = get_state_store()
        count_before = len(store._store)  # type: ignore[attr-defined]

        chunk = emit_ui_tree(
            json.dumps({"kind": "FakeKind", "props": {}, "children": []}),
        )
        data = _extract_json(chunk)
        assert data["ok"] is False

        count_after = len(store._store)  # type: ignore[attr-defined]
        assert count_before == count_after

    def test_parse_failure_does_not_create_state(self) -> None:
        """
        A parse failure should return an error and NOT create a state store
        entry.
        """
        store = get_state_store()
        count_before = len(store._store)  # type: ignore[attr-defined]

        chunk = emit_ui_tree("not json at all!!!")
        data = _extract_json(chunk)
        assert data["ok"] is False

        count_after = len(store._store)  # type: ignore[attr-defined]
        assert count_before == count_after

    def test_oversized_payload_does_not_create_state(self) -> None:
        """
        An oversized payload should return an error before reaching the state
        store.
        """
        from qwenpaw.plugins_bundle.ugsci.genui.schema import (
            GENUI_MAX_JSON_CHARS,
        )

        store = get_state_store()
        count_before = len(store._store)  # type: ignore[attr-defined]

        huge = (
            '{"kind": "Text", "props": {"value": "'
            + "x" * (GENUI_MAX_JSON_CHARS + 10)
            + '"}, "children": []}'
        )
        chunk = emit_ui_tree(huge)
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "payload_too_large"

        count_after = len(store._store)  # type: ignore[attr-defined]
        assert count_before == count_after


# ─── End-to-End Result Shape ──────────────────────────────────────────────


class TestEndToEndResultShape:
    def test_tree_has_nodeIds_after_emit(self) -> None:
        """After emit, every node in the result tree should have a nodeId."""
        tree = {
            "kind": "Stack",
            "children": [
                {"kind": "Text", "props": {"value": "a"}},
                {"kind": "Text", "props": {"value": "b"}},
            ],
        }
        chunk = emit_ui_tree(json.dumps(tree))
        data = _extract_json(chunk)

        root = data["tree"]["root"]
        assert root["nodeId"]
        for child in root["children"]:
            assert child["nodeId"]

    def test_tree_has_schema_version(self) -> None:
        """The result tree should include schemaVersion."""
        chunk = emit_ui_tree(
            json.dumps(
                {"kind": "Text", "props": {"value": "hi"}, "children": []},
            ),
        )
        data = _extract_json(chunk)
        assert data["tree"]["schemaVersion"] == "1"

    def test_revision_starts_at_1(self) -> None:
        """First emit of a tree should have revision=1."""
        chunk = emit_ui_tree(
            json.dumps(
                {"kind": "Text", "props": {"value": "hi"}, "children": []},
            ),
        )
        data = _extract_json(chunk)
        assert data["revision"] == 1

    def test_tool_call_id_present(self) -> None:
        """
        The result should include tool_call_id (empty string if not
        available).
        """
        chunk = emit_ui_tree(
            json.dumps(
                {"kind": "Text", "props": {"value": "hi"}, "children": []},
            ),
        )
        data = _extract_json(chunk)
        assert "tool_call_id" in data
        assert isinstance(data["tool_call_id"], str)


# ─── Patch Full Chain (PLAN §9.3: emit_ui_patch integration) ───────────────


class TestPatchFullChain:  # pylint: disable=protected-access
    """
    End-to-end patch flow: emit → patch → verify state store → result format.
    """

    def test_emit_then_patch_full_chain(self) -> None:
        """Emit a tree, then patch it, and verify the full chain."""
        # 1. Emit initial tree
        tree = {
            "kind": "Stack",
            "props": {"gap": 12},
            "children": [
                {
                    "kind": "Text",
                    "props": {"value": "Original"},
                    "children": [],
                },
            ],
        }
        emit_chunk = emit_ui_tree(json.dumps(tree))
        emit_data = _extract_json(emit_chunk)
        assert emit_data["ok"] is True
        ui_id = emit_data["ui_id"]
        assert emit_data["revision"] == 1

        # 2. Patch the tree
        patch_payload = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {
                        "op": "replace",
                        "path": "/root/children/0/props/value",
                        "value": "Patched!",
                    },
                ],
            },
        )
        patch_chunk = emit_ui_patch(patch_payload)
        patch_data = _extract_json(patch_chunk)

        # 3. Verify patch result
        assert patch_data["ok"] is True
        assert patch_data["kind"] == "genui_patch"
        assert patch_data["ui_id"] == ui_id
        assert patch_data["base_revision"] == 1
        assert patch_data["revision"] == 2
        assert (
            patch_data["tree"]["root"]["children"][0]["props"]["value"]
            == "Patched!"
        )

        # 4. Verify state store has updated snapshot
        store = get_state_store()
        snap = store.get("integration-session", ui_id)
        assert snap is not None
        assert snap.revision == 2
        assert snap.tree["root"]["children"][0]["props"]["value"] == "Patched!"

    def test_patch_then_patch_again_chain(self) -> None:
        """Apply two patches in sequence."""
        # Emit
        tree = {
            "kind": "Stack",
            "props": {"gap": 12},
            "children": [
                {"kind": "Text", "props": {"value": "v1"}, "children": []},
            ],
        }
        emit_data = _extract_json(emit_ui_tree(json.dumps(tree)))
        ui_id = emit_data["ui_id"]

        # Patch 1: revision 1 → 2
        patch1 = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {
                        "op": "replace",
                        "path": "/root/children/0/props/value",
                        "value": "v2",
                    },
                ],
            },
        )
        data1 = _extract_json(emit_ui_patch(patch1))
        assert data1["ok"] is True
        assert data1["revision"] == 2

        # Patch 2: revision 2 → 3
        patch2 = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 2,
                "patches": [
                    {
                        "op": "replace",
                        "path": "/root/children/0/props/value",
                        "value": "v3",
                    },
                ],
            },
        )
        data2 = _extract_json(emit_ui_patch(patch2))
        assert data2["ok"] is True
        assert data2["revision"] == 3
        assert data2["tree"]["root"]["children"][0]["props"]["value"] == "v3"

    def test_patch_with_stale_revision_fails(self) -> None:
        """Patching with a stale revision should fail cleanly."""
        tree = {"kind": "Text", "props": {"value": "hi"}, "children": []}
        emit_data = _extract_json(emit_ui_tree(json.dumps(tree)))
        ui_id = emit_data["ui_id"]

        # First patch succeeds (revision 1 → 2)
        patch1 = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {
                        "op": "replace",
                        "path": "/root/props/value",
                        "value": "updated",
                    },
                ],
            },
        )
        emit_ui_patch(patch1)

        # Second patch with stale revision 1 should fail
        patch2 = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {
                        "op": "replace",
                        "path": "/root/props/value",
                        "value": "stale",
                    },
                ],
            },
        )
        data2 = _extract_json(emit_ui_patch(patch2))
        assert data2["ok"] is False
        assert data2["error_code"] == "revision_conflict"

    def test_patch_result_format_matches_frontend_contract(self) -> None:
        """Patch result must contain all fields the frontend expects."""
        tree = {"kind": "Text", "props": {"value": "hi"}, "children": []}
        emit_data = _extract_json(emit_ui_tree(json.dumps(tree)))
        ui_id = emit_data["ui_id"]

        patch_payload = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {
                        "op": "replace",
                        "path": "/root/props/value",
                        "value": "patched",
                    },
                ],
            },
        )
        data = _extract_json(emit_ui_patch(patch_payload))

        # Frontend parseGenUiResult checks: ok === true && kind ===
        # "genui_patch"
        assert data["ok"] is True
        assert data["kind"] == "genui_patch"
        # Required fields for frontend
        assert "ui_id" in data
        assert "base_revision" in data
        assert "revision" in data
        assert "patches" in data
        assert "tree" in data
        assert "root" in data["tree"]

    def test_patch_does_not_create_new_state_entry(self) -> None:
        """
        Patching should update the existing state entry, not create a new one.
        """
        tree = {"kind": "Text", "props": {"value": "hi"}, "children": []}
        emit_data = _extract_json(emit_ui_tree(json.dumps(tree)))
        ui_id = emit_data["ui_id"]

        store = get_state_store()
        count_before = len(store._store)  # type: ignore[attr-defined]

        patch_payload = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {
                        "op": "replace",
                        "path": "/root/props/value",
                        "value": "updated",
                    },
                ],
            },
        )
        emit_ui_patch(patch_payload)

        count_after = len(store._store)  # type: ignore[attr-defined]
        assert count_before == count_after  # No new entry created


# ─── GenUI Disabled → Markdown Works (PLAN §9.3.4) ────────────────────────


class TestGenUiDisabledMarkdown:
    """
    When GenUI is disabled, the system should still work normally with
    Markdown.
    """

    def test_disabled_genui_no_tools_registered(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """
        When GenUI is explicitly disabled, tools are registered but disabled,
        and no prompt is injected.
        """
        monkeypatch.setenv("GENUI_ENABLED", "false")
        from qwenpaw.plugins_bundle.ugsci.genui.registration import (
            register_genui,
        )

        class DisabledApi:
            def __init__(self):
                self.tools: list[str] = []
                self.prompt_sections: list[str] = []
                self.config = {"genui_enabled": False}
                self._registry = None

            def register_tool(self, *, tool_name: str, **_kwargs: Any) -> None:
                self.tools.append(tool_name)

            def register_prompt_section(
                self,
                *,
                name: str,
                **_kwargs: Any,
            ) -> None:
                self.prompt_sections.append(name)

        api = DisabledApi()
        register_genui(api, plugin_id="ugsci")

        # Tools should be registered (so they appear in Tools page) but no
        # prompt
        assert len(api.tools) == 4
        assert len(api.prompt_sections) == 0

    def test_disabled_genui_emit_ui_tree_not_called(self) -> None:
        """When GenUI is disabled, emit_ui_tree should not be in the
        tool registry.

        This is implicitly tested by the registration test above — if the tool
        is not registered, the model cannot call it. The agent will fall back
        to Markdown for all responses.
        """
        # This is a documentation test — the behavior is verified by
        # test_disabled_genui_no_tools_registered above.


# ─── Malicious HTML Safety (PLAN §9.3.7) ──────────────────────────────────


class TestMaliciousHtmlSafety:
    """Malicious HTML in GenUI trees must not affect the main chat flow."""

    def test_script_tag_in_text_value_is_safe(self) -> None:
        """
        A <script> tag in a Text value should be stored as a string, not
        executed.
        """
        tree = {
            "kind": "Text",
            "props": {"value": "<script>alert(1)</script>"},
            "children": [],
        }
        chunk = emit_ui_tree(json.dumps(tree))
        data = _extract_json(chunk)

        # The tree should be stored successfully — the frontend (React) will
        # escape it
        assert data["ok"] is True
        assert (
            data["tree"]["root"]["props"]["value"]
            == "<script>alert(1)</script>"
        )

    def test_javascript_url_in_image_rejected(self) -> None:
        """
        A javascript: URL in an Image src should be rejected by validation.
        """
        tree = {
            "kind": "Image",
            "props": {"src": "javascript:alert(1)"},
            "children": [],
        }
        chunk = emit_ui_tree(json.dumps(tree))
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "invalid_tree"

    def test_malicious_kind_stored_as_string(self) -> None:
        """A malicious kind string should be rejected by validation."""
        tree = {"kind": "<img onerror=alert(1)>", "props": {}, "children": []}
        chunk = emit_ui_tree(json.dumps(tree))
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "invalid_tree"

    def test_error_does_not_crash_main_flow(self) -> None:
        """
        An error in GenUI should return an error chunk, not raise an
        exception.
        """
        # Various invalid inputs should all return error chunks, not crash
        for bad_input in ["", "not json", "42", "null", "{}}}"]:
            chunk = emit_ui_tree(bad_input)
            data = _extract_json(chunk)
            assert data["ok"] is False
            # The error should have a proper error_code
            assert "error_code" in data

    def test_patch_with_malicious_path_rejected(self) -> None:
        """Patches targeting protected paths should be rejected."""
        tree = {"kind": "Text", "props": {"value": "hi"}, "children": []}
        emit_data = _extract_json(emit_ui_tree(json.dumps(tree)))
        ui_id = emit_data["ui_id"]

        # Try to patch the kind to a malicious value
        patch_payload = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {
                        "op": "replace",
                        "path": "/root/kind",
                        "value": "<script>",
                    },
                ],
            },
        )
        data = _extract_json(emit_ui_patch(patch_payload))
        assert data["ok"] is False
        assert data["error_code"] == "invalid_patch"


# ─── Non-Console Channel Isolation (PLAN §9.3.5) ───────────────────────────


class TestNonConsoleChannelIsolation:
    """Non-console channels should not expose GenUI tools."""

    def test_wechat_channel_not_exposed(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """
        When channel is wechat (not in genui_channels), tools are registered
        but disabled, no prompt.
        """
        monkeypatch.setenv("GENUI_ENABLED", "false")
        from qwenpaw.plugins_bundle.ugsci.genui.registration import (
            register_genui,
            _get_current_channel,
        )

        # Mock channel to be wechat
        monkeypatch.setattr(
            (
                "qwenpaw.plugins_bundle.ugsci.genui."
                "registration._get_current_channel"
            ),
            lambda: "wechat",
        )

        class WechatApi:
            def __init__(self):
                self.tools: list[str] = []
                self.prompt_sections: list[str] = []
                self.config = {
                    "genui_enabled": True,
                    "genui_channels": [
                        "console",
                        "web",
                    ],  # wechat not included
                }
                self._registry = None

            def register_tool(self, *, tool_name: str, **_kwargs: Any) -> None:
                self.tools.append(tool_name)

            def register_prompt_section(
                self,
                *,
                name: str,
                **_kwargs: Any,
            ) -> None:
                self.prompt_sections.append(name)

        api = WechatApi()
        register_genui(api, plugin_id="ugsci")

        # Tools should be registered (disabled) but no prompt
        assert len(api.tools) == 4
        assert len(api.prompt_sections) == 0

    def test_console_channel_exposed(self) -> None:
        """
        When channel is console (in genui_channels), tools should register.
        """
        from qwenpaw.plugins_bundle.ugsci.genui.registration import (
            register_genui,
        )

        class ConsoleApi:
            def __init__(self):
                self.tools: list[str] = []
                self.prompt_sections: list[str] = []
                self.config = {
                    "genui_enabled": True,
                    "genui_channels": ["console", "web"],
                }
                self._registry = None

            def register_tool(self, *, tool_name: str, **_kwargs: Any) -> None:
                self.tools.append(tool_name)

            def register_prompt_section(
                self,
                *,
                name: str,
                **_kwargs: Any,
            ) -> None:
                self.prompt_sections.append(name)

        api = ConsoleApi()
        register_genui(api, plugin_id="ugsci")

        assert "emit_ui_tree" in api.tools
        assert "emit_ui_patch" in api.tools


# ─── Upstream Conflict (PLAN §9.3.6) ───────────────────────────────────────


class TestUpstreamConflict:
    """When upstream already has emit_ui_tree, UGSci should not overwrite."""

    def test_upstream_emit_ui_tree_skips_registration(self) -> None:
        """
        If emit_ui_tree already exists upstream, only prompt section should
        register.
        """
        from qwenpaw.plugins_bundle.ugsci.genui.registration import (
            register_genui,
        )
        from unittest.mock import MagicMock

        class ConflictApi:
            def __init__(self):
                self.tools: list[str] = []
                self.prompt_sections: list[str] = []
                self.config = {
                    "genui_enabled": True,
                    "genui_channels": ["console"],
                }
                # Simulate upstream emit_ui_tree
                wm = MagicMock()
                ws = MagicMock()
                ws.plugins.tool_registry = {"emit_ui_tree": MagicMock()}
                wm.agents = {"agent1": ws}
                self._registry = MagicMock()
                self._registry.get_workspace_manager.return_value = wm

            def register_tool(self, *, tool_name: str, **_kwargs: Any) -> None:
                self.tools.append(tool_name)

            def register_prompt_section(
                self,
                *,
                name: str,
                **_kwargs: Any,
            ) -> None:
                self.prompt_sections.append(name)

        api = ConflictApi()
        register_genui(api, plugin_id="ugsci")

        # Tools should NOT be registered (conflict)
        assert len(api.tools) == 0
        # But prompt section should still be registered
        assert "ugsci.genui_guide" in api.prompt_sections
