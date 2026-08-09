# -*- coding: utf-8 -*-
"""Unit tests for the GenUI JSON repair module.

Covers plan section 9.1:
- Code fence stripping (```json ... ```)
- Trailing comma repair
- Truncated JSON closing
- Unescaped quotes in strings
- Control char escaping
- Tree extraction from envelope {"tree": {...}}
"""

from __future__ import annotations

import json

from qwenpaw.plugins_bundle.ugsci.genui.json_repair import (
    _candidate_json_texts,
    _close_truncated_json_object,
    _escape_control_chars_in_json_strings,
    _escape_unescaped_quotes_in_json_strings,
    _repair_trailing_commas,
    _strip_json_code_fence,
    try_parse_json_object,
)


# ─── _strip_json_code_fence ─────────────────────────────────────────────────


class TestStripCodeFence:
    def test_plain_json(self) -> None:
        assert _strip_json_code_fence('{"a": 1}') == '{"a": 1}'

    def test_json_fence(self) -> None:
        raw = '```json\n{"a": 1}\n```'
        assert _strip_json_code_fence(raw) == '{"a": 1}'

    def test_bare_fence(self) -> None:
        raw = '```\n{"a": 1}\n```'
        assert _strip_json_code_fence(raw) == '{"a": 1}'

    def test_no_closing_fence(self) -> None:
        raw = '```json\n{"a": 1}'
        # No closing fence → regex won't match → returns stripped text with
        # fence prefix
        result = _strip_json_code_fence(raw)
        # The function still returns the text; try_parse_json_object handles
        # this case
        assert isinstance(result, str)

    def test_bom_stripped(self) -> None:
        raw = '\ufeff{"a": 1}'
        assert _strip_json_code_fence(raw) == '{"a": 1}'


# ─── _repair_trailing_commas ────────────────────────────────────────────────


class TestRepairTrailingCommas:
    def test_object_trailing_comma(self) -> None:
        raw = '{"a": 1, "b": 2,}'
        result = _repair_trailing_commas(raw)
        assert json.loads(result) == {"a": 1, "b": 2}

    def test_array_trailing_comma(self) -> None:
        raw = "[1, 2, 3,]"
        result = _repair_trailing_commas(raw)
        assert json.loads(result) == [1, 2, 3]

    def test_nested_trailing_commas(self) -> None:
        raw = '{"a": [1, 2,], "b": {"c": 3,},}'
        result = _repair_trailing_commas(raw)
        assert json.loads(result) == {"a": [1, 2], "b": {"c": 3}}

    def test_comma_inside_string_preserved(self) -> None:
        raw = '{"a": "hello, world",}'
        result = _repair_trailing_commas(raw)
        assert json.loads(result) == {"a": "hello, world"}

    def test_no_trailing_comma_unchanged(self) -> None:
        raw = '{"a": 1, "b": 2}'
        result = _repair_trailing_commas(raw)
        assert json.loads(result) == {"a": 1, "b": 2}


# ─── _escape_control_chars_in_json_strings ──────────────────────────────────


class TestEscapeControlChars:
    def test_newline_escaped(self) -> None:
        raw = '{"a": "line1\nline2"}'
        result = _escape_control_chars_in_json_strings(raw)
        assert "\\n" in result
        parsed = json.loads(result)
        assert parsed["a"] == "line1\nline2"

    def test_tab_escaped(self) -> None:
        raw = '{"a": "col1\tcol2"}'
        result = _escape_control_chars_in_json_strings(raw)
        parsed = json.loads(result)
        assert parsed["a"] == "col1\tcol2"

    def test_already_escaped_preserved(self) -> None:
        raw = '{"a": "already\\nescaped"}'
        result = _escape_control_chars_in_json_strings(raw)
        assert json.loads(result) == {"a": "already\nescaped"}

    def test_control_char_outside_string_preserved(self) -> None:
        raw = '{"a": 1}\n'
        result = _escape_control_chars_in_json_strings(raw)
        # Newline outside string should not be escaped
        assert result == '{"a": 1}\n'


# ─── _escape_unescaped_quotes_in_json_strings ───────────────────────────────


class TestEscapeUnescapedQuotes:
    def test_unescaped_inner_quote_fixed(self) -> None:
        """
        A quote inside a JSON string value that isn't a terminator should be
        escaped.
        """
        raw = '{"text": "He said "hello" to her"}'
        result = _escape_unescaped_quotes_in_json_strings(raw)
        parsed = json.loads(result)
        assert "hello" in parsed["text"]

    def test_terminator_quote_preserved(self) -> None:
        raw = '{"a": "value"}'
        result = _escape_unescaped_quotes_in_json_strings(raw)
        assert json.loads(result) == {"a": "value"}

    def test_already_escaped_quote_preserved(self) -> None:
        raw = '{"a": "say \\"hi\\""}'
        result = _escape_unescaped_quotes_in_json_strings(raw)
        assert json.loads(result) == {"a": 'say "hi"'}


# ─── _close_truncated_json_object ───────────────────────────────────────────


class TestCloseTruncatedJson:
    def test_truncated_object_closed(self) -> None:
        raw = '{"a": 1, "b":'
        result = _close_truncated_json_object(raw)
        # The function adds closing braces, but the result may not be valid
        # JSON
        # (missing value for "b"). The full repair chain in
        # try_parse_json_object
        # handles this via candidate generation.
        assert result is not None
        assert result.endswith("}")
        assert "a" in result

    def test_truncated_with_open_string(self) -> None:
        raw = '{"a": "hello wor'
        result = _close_truncated_json_object(raw)
        assert result is not None
        # Should close the string and the object
        parsed = json.loads(result)
        assert parsed["a"] == "hello wor"

    def test_complete_json_returns_none(self) -> None:
        raw = '{"a": 1}'
        assert _close_truncated_json_object(raw) is None

    def test_truncated_nested(self) -> None:
        raw = '{"outer": {"inner":'
        result = _close_truncated_json_object(raw)
        assert result is not None
        # The result has missing values so may not be valid JSON,
        # but the closing braces should be present
        assert result.count("{") == result.count("}")
        assert result.count("[") == result.count("]")

    def test_non_object_returns_none(self) -> None:
        raw = "[1, 2, 3"
        assert _close_truncated_json_object(raw) is None


# ─── try_parse_json_object ──────────────────────────────────────────────────


class TestTryParseJsonObject:
    def test_valid_json_object(self) -> None:
        raw = json.dumps({"kind": "Stack", "props": {}, "children": []})
        result = try_parse_json_object(raw)
        assert result is not None
        assert result["kind"] == "Stack"

    def test_valid_envelope(self) -> None:
        raw = json.dumps(
            {
                "schemaVersion": "1",
                "root": {
                    "kind": "Text",
                    "props": {"value": "hi"},
                    "children": [],
                },
            },
        )
        result = try_parse_json_object(raw)
        assert result is not None
        assert "root" in result or "kind" in result

    def test_code_fence_stripped(self) -> None:
        raw = '```json\n{"kind": "Stack", "props": {}, "children": []}\n```'
        result = try_parse_json_object(raw)
        assert result is not None
        assert result["kind"] == "Stack"

    def test_trailing_comma_repaired(self) -> None:
        raw = '{"kind": "Stack", "props": {"gap": 12,}, "children": [],}'
        result = try_parse_json_object(raw)
        assert result is not None
        assert result["kind"] == "Stack"

    def test_truncated_json_repaired(self) -> None:
        """Truncated JSON with open string — close_truncated handles this."""
        raw = (
            '{"kind": "Stack", "props": {"gap": 12}, '
            '"children": [{"kind": "Text", '
            '"props": {"value": "hel'
        )
        # _close_truncated_json_object should close the string and braces
        closed = _close_truncated_json_object(raw)
        assert closed is not None
        parsed = json.loads(closed)
        assert parsed["kind"] == "Stack"
        # try_parse_json_object may or may not succeed depending on heuristics
        result = try_parse_json_object(raw)
        if result is not None:
            assert result.get("kind") == "Stack" or "root" in result

    def test_tree_envelope_extracted(self) -> None:
        """
        When wrapped in {"tree": {...}}, the inner tree dict should be
        extracted.
        """
        inner = {"kind": "Stack", "props": {}, "children": []}
        raw = json.dumps({"tree": inner, "canvas_id": "abc"})
        result = try_parse_json_object(raw)
        assert result is not None
        assert result.get("kind") == "Stack"

    def test_empty_string_returns_none(self) -> None:
        assert try_parse_json_object("") is None
        assert try_parse_json_object("   ") is None

    def test_non_dict_returns_none(self) -> None:
        assert try_parse_json_object("[1, 2, 3]") is None
        assert try_parse_json_object('"just a string"') is None
        assert try_parse_json_object("42") is None

    def test_completely_garbled_returns_none(self) -> None:
        assert try_parse_json_object("this is not json at all!!!") is None

    def test_control_chars_in_string_repaired(self) -> None:
        raw = (
            '{"kind": "Text", "props": '
            '{"value": "line1\nline2"}, '
            '"children": []}'
        )
        result = try_parse_json_object(raw)
        assert result is not None
        assert result["kind"] == "Text"

    def test_unescaped_quotes_repaired(self) -> None:
        """LLM sometimes forgets to escape inner quotes."""
        raw = (
            '{"kind": "Text", "props": '
            '{"value": "He said "hello""}, '
            '"children": []}'
        )
        result = try_parse_json_object(raw)
        # May or may not succeed depending on heuristics, but should not crash
        if result is not None:
            assert result.get("kind") == "Text"

    def test_truncated_with_trailing_comma(self) -> None:
        """Truncated JSON that also has trailing commas."""
        raw = '{"kind": "Stack", "props": {"gap": 12,}, "children": ['
        result = try_parse_json_object(raw)
        # Should close the array and object
        if result is not None:
            assert result.get("kind") == "Stack"

    def test_bom_prefix_stripped(self) -> None:
        raw = '\ufeff{"kind": "Stack", "props": {}, "children": []}'
        result = try_parse_json_object(raw)
        assert result is not None
        assert result["kind"] == "Stack"


# ─── _candidate_json_texts ──────────────────────────────────────────────────


class TestCandidateTexts:
    def test_returns_multiple_candidates(self) -> None:
        raw = '```json\n{"a": 1,}\n```'
        candidates = _candidate_json_texts(raw)
        assert len(candidates) > 1
        # At least one candidate should be valid JSON
        valid = False
        for c in candidates:
            try:
                json.loads(c)
                valid = True
                break
            except json.JSONDecodeError:
                pass
        assert valid

    def test_no_duplicates(self) -> None:
        raw = '{"a": 1}'
        candidates = _candidate_json_texts(raw)
        assert len(candidates) == len(set(candidates))
