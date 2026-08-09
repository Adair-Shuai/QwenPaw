# -*- coding: utf-8 -*-
"""Unit tests for the GenUI schema module (normalize / validate / catalog).

Covers plan section 9.1:
- Legal tree, bare root, type→kind coercion, props lift, nodeId fill
- Depth limit, node count limit, string limit, array limit
- Component catalog structure
"""

from __future__ import annotations

from typing import Any

import pytest
from jsonschema.exceptions import ValidationError

from qwenpaw.plugins_bundle.ugsci.genui.schema import (
    GENUI_MAX_CHART_POINTS,
    GENUI_MAX_NODES,
    GENUI_MAX_STRING_CHARS,
    GENUI_MAX_TABLE_ROWS,
    GENUI_MAX_TREE_DEPTH,
    list_component_catalog,
    normalize_ui_tree,
    validate_ui_tree,
)


# ─── normalize_ui_tree ──────────────────────────────────────────────────────


class TestNormalizeBareRoot:
    """
    A bare root node (no envelope) should be wrapped into {schemaVersion,
    root}.
    """

    def test_bare_root_wrapped(self) -> None:
        bare = {"kind": "Stack", "props": {}, "children": []}
        result = normalize_ui_tree(bare)
        assert result["schemaVersion"] == "1"
        assert result["root"]["kind"] == "Stack"

    def test_bare_root_with_type_coerced(self) -> None:
        """Legacy `type` field should be coerced to `kind`."""
        bare = {"type": "Stack", "props": {}, "children": []}
        result = normalize_ui_tree(bare)
        assert result["root"]["kind"] == "Stack"
        assert "type" not in result["root"]

    def test_full_envelope_preserved(self) -> None:
        envelope = {
            "schemaVersion": "1",
            "root": {"kind": "Text", "props": {"value": "hi"}, "children": []},
        }
        result = normalize_ui_tree(envelope)
        assert result["schemaVersion"] == "1"
        assert result["root"]["kind"] == "Text"

    def test_missing_schema_version_filled(self) -> None:
        envelope = {"root": {"kind": "Text", "props": {}, "children": []}}
        result = normalize_ui_tree(envelope)
        assert result["schemaVersion"] == "1"


class TestNormalizeNodeIdFill:
    """Missing or empty nodeId should be auto-filled with a UUID hex string."""

    def test_missing_nodeId_filled(self) -> None:
        tree = {
            "kind": "Stack",
            "children": [{"kind": "Text", "props": {"value": "a"}}],
        }
        result = normalize_ui_tree(tree)
        root = result["root"]
        assert isinstance(root["nodeId"], str) and len(root["nodeId"]) > 0
        child = root["children"][0]
        assert isinstance(child["nodeId"], str) and len(child["nodeId"]) > 0

    def test_empty_nodeId_filled(self) -> None:
        tree = {"kind": "Stack", "nodeId": "", "children": []}
        result = normalize_ui_tree(tree)
        assert result["root"]["nodeId"] != ""

    def test_existing_nodeId_preserved(self) -> None:
        tree = {"kind": "Stack", "nodeId": "my-id", "children": []}
        result = normalize_ui_tree(tree)
        assert result["root"]["nodeId"] == "my-id"


class TestNormalizePropsLift:
    """Flat props on known component kinds should be lifted into `props`."""

    def test_text_value_lifted(self) -> None:
        tree = {"kind": "Text", "value": "hello", "children": []}
        result = normalize_ui_tree(tree)
        assert result["root"]["props"]["value"] == "hello"
        assert (
            "value" not in result["root"]
            or result["root"]["value"] is None
            or "value"
            not in {
                k
                for k in result["root"]
                if k not in ("nodeId", "kind", "props", "children")
            }
        )

    def test_heading_level_lifted(self) -> None:
        tree = {
            "kind": "Heading",
            "level": 2,
            "value": "Title",
            "children": [],
        }
        result = normalize_ui_tree(tree)
        assert result["root"]["props"]["level"] == 2
        assert result["root"]["props"]["value"] == "Title"

    def test_unknown_flat_key_not_lifted(self) -> None:
        """
        Keys not in the known prop set should remain on the node (and fail
        validation).
        """
        tree = {"kind": "Stack", "randomKey": "oops", "children": []}
        result = normalize_ui_tree(tree)
        # randomKey is not a known Stack prop, so it stays on the node
        assert "randomKey" in result["root"]


class TestNormalizePropAliases:
    """Alias renaming: e.g. Heading text→value, Image url→src."""

    def test_heading_text_alias(self) -> None:
        tree = {
            "kind": "Heading",
            "props": {"text": "My Title"},
            "children": [],
        }
        result = normalize_ui_tree(tree)
        assert result["root"]["props"]["value"] == "My Title"

    def test_image_url_alias(self) -> None:
        tree = {
            "kind": "Image",
            "props": {"url": "http://example.com/img.png"},
            "children": [],
        }
        result = normalize_ui_tree(tree)
        assert result["root"]["props"]["src"] == "http://example.com/img.png"

    def test_markdown_content_alias(self) -> None:
        tree = {
            "kind": "Markdown",
            "props": {"text": "# Hello"},
            "children": [],
        }
        result = normalize_ui_tree(tree)
        assert result["root"]["props"]["content"] == "# Hello"

    def test_badge_text_alias(self) -> None:
        tree = {"kind": "Badge", "props": {"text": "New"}, "children": []}
        result = normalize_ui_tree(tree)
        assert result["root"]["props"]["value"] == "New"


class TestNormalizeNumberCoercion:
    """String size tokens like 'sm', '16px' should be coerced to numbers."""

    def test_size_token_coerced(self) -> None:
        tree = {"kind": "Spacer", "props": {"size": "lg"}, "children": []}
        result = normalize_ui_tree(tree)
        assert result["root"]["props"]["size"] == 16

    def test_px_suffix_coerced(self) -> None:
        tree = {"kind": "Spacer", "props": {"size": "24px"}, "children": []}
        result = normalize_ui_tree(tree)
        assert result["root"]["props"]["size"] == 24

    def test_numeric_string_coerced(self) -> None:
        tree = {"kind": "Spacer", "props": {"size": "32"}, "children": []}
        result = normalize_ui_tree(tree)
        assert result["root"]["props"]["size"] == 32


# ─── validate_ui_tree ───────────────────────────────────────────────────────


class TestValidateSuccess:
    """Valid trees should pass validation and return a normalized copy."""

    def test_simple_stack(self) -> None:
        tree = {
            "schemaVersion": "1",
            "root": {"kind": "Stack", "props": {"gap": 12}, "children": []},
        }
        result = validate_ui_tree(tree)
        assert result["root"]["kind"] == "Stack"
        assert result["root"]["props"]["gap"] == 12

    def test_nested_tree(self) -> None:
        tree: dict[str, Any] = {
            "root": {
                "kind": "Card",
                "props": {"title": "Test"},
                "children": [
                    {
                        "kind": "Text",
                        "props": {"value": "Hello"},
                        "children": [],
                    },
                    {
                        "kind": "Text",
                        "props": {"value": "World"},
                        "children": [],
                    },
                ],
            },
        }
        result = validate_ui_tree(tree)
        assert len(result["root"]["children"]) == 2

    def test_bare_root_validates(self) -> None:
        tree = {"kind": "Text", "props": {"value": "hi"}, "children": []}
        result = validate_ui_tree(tree)
        assert result["root"]["kind"] == "Text"


class TestValidateFailures:
    """Invalid trees should raise ValidationError."""

    def test_invalid_kind_rejected(self) -> None:
        tree = {"kind": "NonExistentKind", "props": {}, "children": []}
        with pytest.raises(ValidationError):
            validate_ui_tree(tree)

    def test_missing_kind_rejected(self) -> None:
        tree = {"nodeId": "x", "props": {}, "children": []}
        with pytest.raises(ValidationError):
            validate_ui_tree(tree)

    def test_unknown_top_level_key_rejected(self) -> None:
        tree = {
            "schemaVersion": "1",
            "root": {"kind": "Stack", "props": {}, "children": []},
            "extra": True,
        }
        with pytest.raises(ValidationError):
            validate_ui_tree(tree)

    def test_invalid_schema_version_rejected(self) -> None:
        tree = {
            "schemaVersion": "2",
            "root": {"kind": "Stack", "props": {}, "children": []},
        }
        with pytest.raises(ValidationError):
            validate_ui_tree(tree)


class TestValidateLimits:
    """Depth, node count, string length, and array size limits."""

    def test_depth_limit_exceeded(self) -> None:
        """Build a tree deeper than GENUI_MAX_TREE_DEPTH."""
        depth = GENUI_MAX_TREE_DEPTH + 2
        node: dict[str, Any] = {"kind": "Stack", "props": {}, "children": []}
        for _ in range(depth):
            node = {"kind": "Stack", "props": {}, "children": [node]}
        tree = {"root": node}
        with pytest.raises(ValidationError, match="depth"):
            validate_ui_tree(tree)

    def test_depth_at_limit_ok(self) -> None:
        """A tree exactly at the max depth should pass."""
        depth = GENUI_MAX_TREE_DEPTH
        node: dict[str, Any] = {
            "kind": "Text",
            "props": {"value": "leaf"},
            "children": [],
        }
        for _ in range(depth - 1):
            node = {"kind": "Stack", "props": {}, "children": [node]}
        tree = {"root": node}
        result = validate_ui_tree(tree)
        assert result is not None

    def test_node_count_limit_exceeded(self) -> None:
        """Build a tree with more than GENUI_MAX_NODES nodes."""
        children = [
            {"kind": "Text", "props": {"value": "x"}, "children": []}
            for _ in range(GENUI_MAX_NODES + 1)
        ]
        tree = {"root": {"kind": "Stack", "props": {}, "children": children}}
        with pytest.raises(ValidationError, match="node count"):
            validate_ui_tree(tree)

    def test_string_limit_exceeded(self) -> None:
        """A string value longer than GENUI_MAX_STRING_CHARS should fail."""
        long_str = "x" * (GENUI_MAX_STRING_CHARS + 1)
        tree = {"kind": "Text", "props": {"value": long_str}, "children": []}
        with pytest.raises(ValidationError, match="string"):
            validate_ui_tree(tree)

    def test_array_limit_exceeded(self) -> None:
        """An array prop longer than GENUI_MAX_TABLE_ROWS should fail."""
        long_arr = [str(i) for i in range(GENUI_MAX_TABLE_ROWS + 1)]
        tree = {
            "kind": "Table",
            "props": {"headers": long_arr},
            "children": [],
        }
        with pytest.raises(ValidationError, match="array"):
            validate_ui_tree(tree)


# ─── list_component_catalog ─────────────────────────────────────────────────


class TestComponentCatalog:
    def test_returns_list(self) -> None:
        catalog = list_component_catalog()
        assert isinstance(catalog, list)
        assert len(catalog) > 0

    def test_each_entry_has_kind_and_props(self) -> None:
        catalog = list_component_catalog()
        for entry in catalog:
            assert "kind" in entry
            assert "description" in entry
            assert "props" in entry

    def test_known_kinds_present(self) -> None:
        catalog = list_component_catalog()
        kinds = {e["kind"] for e in catalog}
        assert {
            "Stack",
            "Text",
            "Heading",
            "Card",
            "Chart",
            "Table",
            "Button",
        } <= kinds

    def test_catalog_is_cached(self) -> None:
        """list_component_catalog should return the same cached list object."""
        a = list_component_catalog()
        b = list_component_catalog()
        assert a is b


# ─── URL scheme validation ──────────────────────────────────────────────────


class TestUrlSchemeValidation:
    """Dangerous URL schemes must be rejected to prevent XSS attacks."""

    def test_javascript_scheme_rejected(self) -> None:
        tree = {
            "kind": "Image",
            "props": {"src": "javascript:alert(1)"},
            "children": [],
        }
        with pytest.raises(ValidationError, match="javascript"):
            validate_ui_tree(tree)

    def test_vbscript_scheme_rejected(self) -> None:
        tree = {
            "kind": "Image",
            "props": {"src": "vbscript:msgbox(1)"},
            "children": [],
        }
        with pytest.raises(ValidationError, match="vbscript"):
            validate_ui_tree(tree)

    def test_file_scheme_rejected(self) -> None:
        tree = {
            "kind": "Image",
            "props": {"src": "file:///etc/passwd"},
            "children": [],
        }
        with pytest.raises(ValidationError, match="file"):
            validate_ui_tree(tree)

    def test_data_text_html_rejected(self) -> None:
        tree = {
            "kind": "Image",
            "props": {"src": "data:text/html,<script>alert(1)</script>"},
            "children": [],
        }
        with pytest.raises(ValidationError, match="text/html"):
            validate_ui_tree(tree)

    def test_https_scheme_allowed(self) -> None:
        tree = {
            "kind": "Image",
            "props": {"src": "https://example.com/img.png"},
            "children": [],
        }
        result = validate_ui_tree(tree)
        assert result["root"]["props"]["src"] == "https://example.com/img.png"

    def test_http_scheme_allowed(self) -> None:
        tree = {
            "kind": "Image",
            "props": {"src": "http://example.com/img.png"},
            "children": [],
        }
        result = validate_ui_tree(tree)
        assert result is not None

    def test_data_image_allowed(self) -> None:
        tree = {
            "kind": "Image",
            "props": {"src": "data:image/png;base64,abc123"},
            "children": [],
        }
        result = validate_ui_tree(tree)
        assert result is not None

    def test_blob_scheme_allowed(self) -> None:
        tree = {
            "kind": "Image",
            "props": {"src": "blob:abc-123"},
            "children": [],
        }
        result = validate_ui_tree(tree)
        assert result is not None

    def test_url_validation_in_avatar_prop(self) -> None:
        """The 'avatar' prop should also be URL-validated."""
        tree = {
            "kind": "ProfileCard",
            "props": {"name": "User", "avatar": "javascript:alert(1)"},
            "children": [],
        }
        with pytest.raises(ValidationError, match="javascript"):
            validate_ui_tree(tree)

    def test_url_validation_in_href_prop(self) -> None:
        """The 'href' prop should also be URL-validated."""
        tree = {
            "kind": "Button",
            "props": {"label": "Click", "href": "javascript:alert(1)"},
            "children": [],
        }
        with pytest.raises(ValidationError, match="javascript"):
            validate_ui_tree(tree)


# ─── Chart points limit ─────────────────────────────────────────────────────


class TestChartPointsLimit:
    """Chart series with too many points should be rejected."""

    def test_chart_points_at_limit_ok(self) -> None:
        tree = {
            "kind": "Chart",
            "props": {
                "chart": "line",
                "categories": ["A", "B"],
                "series": [
                    {
                        "name": "S",
                        "values": list(range(GENUI_MAX_CHART_POINTS)),
                    },
                ],
            },
            "children": [],
        }
        result = validate_ui_tree(tree)
        assert result is not None

    def test_chart_points_exceeded(self) -> None:
        tree = {
            "kind": "Chart",
            "props": {
                "chart": "line",
                "categories": ["A", "B"],
                "series": [
                    {
                        "name": "S",
                        "values": list(range(GENUI_MAX_CHART_POINTS + 1)),
                    },
                ],
            },
            "children": [],
        }
        with pytest.raises(ValidationError, match="chart series"):
            validate_ui_tree(tree)


def test_nested_url_and_string_limits_are_enforced() -> None:
    tree = {
        "kind": "Button",
        "props": {
            "label": "Open",
            "action": {
                "type": "send_message",
                "payload": {"url": "javascript:alert(1)"},
            },
        },
        "children": [],
    }
    with pytest.raises(ValidationError, match="javascript"):
        validate_ui_tree(tree)
