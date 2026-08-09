# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Unit tests for the GenUI patch module (emit_ui_patch, validate_ui_patch,
apply_ui_patches, GenUiStateStore.apply_patch).

Covers plan section 9.1:
- Patch revision conflict
- Patch success (replace, add, remove)
- Protected path rejection
- Invalid patch structure
- ui_id not found in session
- Re-validation after patch
- Empty / oversized / invalid-type patches
- emit_ui_patch result format matches frontend contract
"""

from __future__ import annotations

import json
from typing import Any

import pytest
from jsonschema.exceptions import ValidationError

from qwenpaw.plugins_bundle.ugsci.genui.schema import (
    apply_ui_patches,
    validate_ui_patch,
)
from qwenpaw.plugins_bundle.ugsci.genui.state import GenUiStateStore
from qwenpaw.plugins_bundle.ugsci.genui.tools import (
    emit_ui_patch,
    emit_ui_tree,
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
    store = GenUiStateStore()
    monkeypatch.setattr(
        "qwenpaw.plugins_bundle.ugsci.genui.state._global_store",
        store,
    )


@pytest.fixture(autouse=True)
def _mock_session_id(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "qwenpaw.app.agent_context.get_current_session_id",
        lambda: "test-session-patch",
        raising=False,
    )


def _emit_and_get_ui_id(tree: dict[str, Any] | None = None) -> str:
    """Emit a tree and return the ui_id."""
    chunk = emit_ui_tree(json.dumps(tree or _simple_tree()))
    data = _extract_json(chunk)
    assert data["ok"] is True, f"Setup emit failed: {data}"
    return data["ui_id"]


# ─── validate_ui_patch ──────────────────────────────────────────────────────


class TestValidateUiPatch:
    def test_valid_patch(self) -> None:
        patch = {
            "ui_id": "ui_abc",
            "base_revision": 1,
            "patches": [
                {"op": "replace", "path": "/root/props/gap", "value": 24},
            ],
        }
        result = validate_ui_patch(patch)
        assert result["ui_id"] == "ui_abc"
        assert result["base_revision"] == 1
        assert len(result["patches"]) == 1

    def test_missing_ui_id_rejected(self) -> None:
        patch = {"base_revision": 1, "patches": []}
        with pytest.raises(ValidationError):
            validate_ui_patch(patch)

    def test_missing_base_revision_rejected(self) -> None:
        patch = {"ui_id": "ui_abc", "patches": []}
        with pytest.raises(ValidationError):
            validate_ui_patch(patch)

    def test_missing_patches_rejected(self) -> None:
        patch = {"ui_id": "ui_abc", "base_revision": 1}
        with pytest.raises(ValidationError):
            validate_ui_patch(patch)

    def test_protected_path_schemaVersion_rejected(self) -> None:
        patch = {
            "ui_id": "ui_abc",
            "base_revision": 1,
            "patches": [
                {"op": "replace", "path": "/schemaVersion", "value": "2"},
            ],
        }
        with pytest.raises(ValidationError, match="protected"):
            validate_ui_patch(patch)

    def test_protected_path_nodeId_rejected(self) -> None:
        patch = {
            "ui_id": "ui_abc",
            "base_revision": 1,
            "patches": [
                {"op": "replace", "path": "/root/nodeId", "value": "new-id"},
            ],
        }
        with pytest.raises(ValidationError, match="protected"):
            validate_ui_patch(patch)

    def test_protected_path_kind_rejected(self) -> None:
        patch = {
            "ui_id": "ui_abc",
            "base_revision": 1,
            "patches": [
                {"op": "replace", "path": "/root/kind", "value": "Card"},
            ],
        }
        with pytest.raises(ValidationError, match="protected"):
            validate_ui_patch(patch)

    def test_path_not_starting_with_root_rejected(self) -> None:
        patch = {
            "ui_id": "ui_abc",
            "base_revision": 1,
            "patches": [{"op": "replace", "path": "/foo/bar", "value": "x"}],
        }
        with pytest.raises(ValidationError, match="must start with /root"):
            validate_ui_patch(patch)

    def test_invalid_op_rejected(self) -> None:
        patch = {
            "ui_id": "ui_abc",
            "base_revision": 1,
            "patches": [{"op": "move", "path": "/root/props/gap", "value": 1}],
        }
        with pytest.raises(ValidationError):
            validate_ui_patch(patch)

    def test_too_many_patches_rejected(self) -> None:
        """Patch array exceeding maxItems should fail."""
        patch = {
            "ui_id": "ui_abc",
            "base_revision": 1,
            "patches": [
                {"op": "replace", "path": "/root/props/gap", "value": i}
                for i in range(101)
            ],
        }
        with pytest.raises(ValidationError):
            validate_ui_patch(patch)


# ─── apply_ui_patches ───────────────────────────────────────────────────────


class TestApplyUiPatches:
    def test_replace_operation(self) -> None:
        tree = _simple_tree()
        patches = [{"op": "replace", "path": "/root/props/gap", "value": 24}]
        result = apply_ui_patches(tree, patches)
        assert result["root"]["props"]["gap"] == 24
        # Original tree should not be modified (deep copy)
        assert tree["root"]["props"]["gap"] == 12

    def test_add_operation(self) -> None:
        tree = _simple_tree()
        patches = [
            {
                "op": "add",
                "path": "/root/children/-",
                "value": {
                    "kind": "Text",
                    "props": {"value": "New"},
                    "children": [],
                },
            },
        ]
        # RFC 6902: "-" means append to end of array
        result = apply_ui_patches(tree, patches)
        assert len(result["root"]["children"]) == 3
        assert result["root"]["children"][2]["props"]["value"] == "New"

    def test_remove_operation(self) -> None:
        tree = _simple_tree()
        patches = [{"op": "remove", "path": "/root/children/1"}]
        result = apply_ui_patches(tree, patches)
        assert len(result["root"]["children"]) == 1
        assert result["root"]["children"][0]["props"]["value"] == "Hello"

    def test_replace_nested_prop(self) -> None:
        tree = _simple_tree()
        patches = [
            {
                "op": "replace",
                "path": "/root/children/0/props/value",
                "value": "Updated",
            },
        ]
        result = apply_ui_patches(tree, patches)
        assert result["root"]["children"][0]["props"]["value"] == "Updated"

    def test_multiple_patches_applied_sequentially(self) -> None:
        tree = _simple_tree()
        patches = [
            {"op": "replace", "path": "/root/props/gap", "value": 20},
            {
                "op": "replace",
                "path": "/root/children/0/props/value",
                "value": "First",
            },
            {"op": "remove", "path": "/root/children/1"},
        ]
        result = apply_ui_patches(tree, patches)
        assert result["root"]["props"]["gap"] == 20
        assert result["root"]["children"][0]["props"]["value"] == "First"
        assert len(result["root"]["children"]) == 1

    def test_out_of_bounds_index_raises(self) -> None:
        tree = _simple_tree()
        patches = [
            {
                "op": "replace",
                "path": "/root/children/99/props/value",
                "value": "x",
            },
        ]
        with pytest.raises(ValidationError, match="out of bounds"):
            apply_ui_patches(tree, patches)

    def test_key_not_found_raises(self) -> None:
        tree = _simple_tree()
        patches = [
            {"op": "replace", "path": "/root/props/nonexistent", "value": "x"},
        ]
        with pytest.raises(ValidationError, match="not found"):
            apply_ui_patches(tree, patches)

    def test_original_tree_not_mutated(self) -> None:
        tree = _simple_tree()
        original = json.loads(json.dumps(tree))
        patches = [{"op": "replace", "path": "/root/props/gap", "value": 999}]
        apply_ui_patches(tree, patches)
        assert tree == original


# ─── GenUiStateStore.apply_patch ────────────────────────────────────────────


class TestStateStoreApplyPatch:
    def test_successful_patch_increments_revision(self) -> None:
        store = GenUiStateStore()
        snap = store.create(session_id="s1", tree=_simple_tree())
        patches = [{"op": "replace", "path": "/root/props/gap", "value": 24}]
        new_snap = store.apply_patch(
            "s1",
            snap.ui_id,
            base_revision=1,
            patches=patches,
        )
        assert new_snap.revision == 2
        assert new_snap.tree["root"]["props"]["gap"] == 24

    def test_revision_conflict_raises(self) -> None:
        store = GenUiStateStore()
        snap = store.create(session_id="s1", tree=_simple_tree())
        patches = [{"op": "replace", "path": "/root/props/gap", "value": 24}]
        with pytest.raises(ValueError, match="revision conflict"):
            store.apply_patch(
                "s1",
                snap.ui_id,
                base_revision=99,
                patches=patches,
            )

    def test_ui_id_not_found_raises(self) -> None:
        store = GenUiStateStore()
        patches = [{"op": "replace", "path": "/root/props/gap", "value": 24}]
        with pytest.raises(ValueError, match="not found"):
            store.apply_patch(
                "s1",
                "ui_nonexistent",
                base_revision=1,
                patches=patches,
            )

    def test_wrong_session_raises(self) -> None:
        store = GenUiStateStore()
        snap = store.create(session_id="s1", tree=_simple_tree())
        patches = [{"op": "replace", "path": "/root/props/gap", "value": 24}]
        with pytest.raises(ValueError, match="not found"):
            store.apply_patch(
                "s2",
                snap.ui_id,
                base_revision=1,
                patches=patches,
            )

    def test_invalid_patch_result_rejected(self) -> None:
        """If the patched tree fails validation, apply_patch should raise."""
        store = GenUiStateStore()
        snap = store.create(session_id="s1", tree=_simple_tree())
        # Replace kind with an invalid kind → validation should fail
        patches = [
            {
                "op": "replace",
                "path": "/root/children/0/kind",
                "value": "InvalidKind",
            },
        ]
        with pytest.raises(ValueError, match="invalid"):
            store.apply_patch(
                "s1",
                snap.ui_id,
                base_revision=1,
                patches=patches,
            )

    def test_multiple_patches_revision_sequence(self) -> None:
        """Apply multiple patches in sequence, each incrementing revision."""
        store = GenUiStateStore()
        snap = store.create(session_id="s1", tree=_simple_tree())

        # Patch 1: revision 1 → 2
        patches1 = [{"op": "replace", "path": "/root/props/gap", "value": 20}]
        snap1 = store.apply_patch("s1", snap.ui_id, 1, patches1)
        assert snap1.revision == 2

        # Patch 2: revision 2 → 3
        patches2 = [{"op": "replace", "path": "/root/props/gap", "value": 30}]
        snap2 = store.apply_patch("s1", snap.ui_id, 2, patches2)
        assert snap2.revision == 3
        assert snap2.tree["root"]["props"]["gap"] == 30

    def test_old_revision_after_patch_rejected(self) -> None:
        """After a patch, using the old revision should fail."""
        store = GenUiStateStore()
        snap = store.create(session_id="s1", tree=_simple_tree())
        patches = [{"op": "replace", "path": "/root/props/gap", "value": 20}]
        store.apply_patch("s1", snap.ui_id, 1, patches)
        # Try to patch again with revision 1 (now current is 2)
        with pytest.raises(ValueError, match="revision conflict"):
            store.apply_patch("s1", snap.ui_id, 1, patches)


# ─── emit_ui_patch tool ─────────────────────────────────────────────────────


class TestEmitUiPatchSuccess:
    def test_successful_patch(self) -> None:
        ui_id = _emit_and_get_ui_id()
        patch_payload = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {"op": "replace", "path": "/root/props/gap", "value": 24},
                ],
            },
        )
        chunk = emit_ui_patch(patch_payload)
        data = _extract_json(chunk)
        assert data["ok"] is True
        assert data["kind"] == "genui_patch"
        assert data["ui_id"] == ui_id
        assert data["base_revision"] == 1
        assert data["revision"] == 2
        assert "tree" in data
        assert data["tree"]["root"]["props"]["gap"] == 24

    def test_patch_result_format_matches_frontend_contract(self) -> None:
        """The patch result must contain all fields the frontend expects."""
        ui_id = _emit_and_get_ui_id()
        patch_payload = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {
                        "op": "replace",
                        "path": "/root/children/0/props/value",
                        "value": "Patched",
                    },
                ],
            },
        )
        chunk = emit_ui_patch(patch_payload)
        data = _extract_json(chunk)

        # Frontend checks: ok === true, kind === "genui_patch"
        assert data["ok"] is True
        assert data["kind"] == "genui_patch"
        # Required fields
        assert "ui_id" in data
        assert "base_revision" in data
        assert "revision" in data
        assert "patches" in data
        assert "tree" in data
        assert "root" in data["tree"]

    def test_dict_input_accepted(self) -> None:
        """Defensive: dict input should be accepted."""
        ui_id = _emit_and_get_ui_id()
        patch_payload = {
            "ui_id": ui_id,
            "base_revision": 1,
            "patches": [
                {"op": "replace", "path": "/root/props/gap", "value": 24},
            ],
        }
        chunk = emit_ui_patch(patch_payload)  # type: ignore[arg-type]
        data = _extract_json(chunk)
        assert data["ok"] is True

    def test_chunk_is_last(self) -> None:
        ui_id = _emit_and_get_ui_id()
        patch_payload = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {"op": "replace", "path": "/root/props/gap", "value": 24},
                ],
            },
        )
        chunk = emit_ui_patch(patch_payload)
        assert chunk.is_last is True


class TestEmitUiPatchErrors:
    def test_revision_conflict(self) -> None:
        ui_id = _emit_and_get_ui_id()
        patch_payload = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 99,  # Wrong revision
                "patches": [
                    {"op": "replace", "path": "/root/props/gap", "value": 24},
                ],
            },
        )
        chunk = emit_ui_patch(patch_payload)
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "revision_conflict"
        assert "hint" in data

    def test_ui_id_not_found(self) -> None:
        patch_payload = json.dumps(
            {
                "ui_id": "ui_nonexistent",
                "base_revision": 1,
                "patches": [
                    {"op": "replace", "path": "/root/props/gap", "value": 24},
                ],
            },
        )
        chunk = emit_ui_patch(patch_payload)
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "ui_id_not_found"

    def test_empty_patches_string(self) -> None:
        chunk = emit_ui_patch("")
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "empty_patches"

    def test_invalid_json(self) -> None:
        chunk = emit_ui_patch("this is not json!!!")
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "parse_failed"

    def test_invalid_type_input(self) -> None:
        chunk = emit_ui_patch(42)  # type: ignore[arg-type]
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "invalid_type"

    def test_invalid_patch_structure(self) -> None:
        """Missing required fields should return invalid_patch error."""
        patch_payload = json.dumps(
            {
                "ui_id": "ui_abc",
                "patches": [
                    {"op": "replace", "path": "/root/props/gap", "value": 24},
                ],
                # Missing base_revision
            },
        )
        chunk = emit_ui_patch(patch_payload)
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "invalid_patch"

    def test_protected_path_rejected(self) -> None:
        ui_id = _emit_and_get_ui_id()
        patch_payload = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {"op": "replace", "path": "/root/kind", "value": "Card"},
                ],
            },
        )
        chunk = emit_ui_patch(patch_payload)
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "invalid_patch"

    def test_oversized_payload(self) -> None:
        from qwenpaw.plugins_bundle.ugsci.genui.schema import (
            GENUI_MAX_JSON_CHARS,
        )

        huge = (
            '{"ui_id":"ui_x","base_revision":1,'
            '"patches":[{"op":"replace",'
            '"path":"/root/props/gap",'
            '"value":"' + "x" * (GENUI_MAX_JSON_CHARS + 10) + '"}]}'
        )
        chunk = emit_ui_patch(huge)
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "payload_too_large"

    def test_error_state_on_chunk(self) -> None:
        chunk = emit_ui_patch("")
        assert hasattr(chunk, "state")

    def test_patch_makes_tree_invalid(self) -> None:
        """Patching to produce an invalid tree should be rejected."""
        ui_id = _emit_and_get_ui_id()
        patch_payload = json.dumps(
            {
                "ui_id": ui_id,
                "base_revision": 1,
                "patches": [
                    {
                        "op": "replace",
                        "path": "/root/children/0/kind",
                        "value": "NonExistentKind",
                    },
                ],
            },
        )
        chunk = emit_ui_patch(patch_payload)
        data = _extract_json(chunk)
        assert data["ok"] is False
        assert data["error_code"] == "patch_failed"
