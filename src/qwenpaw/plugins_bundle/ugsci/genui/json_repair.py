# -*- coding: utf-8 -*-
"""JSON repair utilities for recovering GenUI tree payloads from malformed LLM output.

Ported from LeAgent ``backend/leagent/tools/executor.py`` (Apache-2.0).
Simplified to include only the functions needed for GenUI tree recovery:

- Strip code fences and BOM prefixes.
- Repair trailing commas.
- Escape control characters inside JSON strings.
- Escape unescaped interior quotes (common in CJK prose).
- Close truncated JSON objects/arrays.
- Drop superfluous closing delimiters.
- Salvage truncated JSON prefixes.
- Recover ``emit_ui_tree`` args from broken outer JSON.

All functions are pure (no side effects, no I/O).
"""

import json
import re
from typing import Any


def _strip_json_prefix(raw: str) -> str:
    """Trim BOM and invisible prefix characters that commonly precede JSON."""
    return raw.lstrip("\ufeff\u200b\u200c\u200d\u2060")


def _strip_json_code_fence(raw: str) -> str:
    """Remove optional markdown code fences around JSON payloads."""
    text = _strip_json_prefix(raw).strip()
    match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, flags=re.DOTALL)
    if match:
        return _strip_json_prefix(match.group(1)).strip()
    return text


def _repair_trailing_commas(raw: str) -> str:
    """Remove trailing commas before object/array terminators outside strings."""
    out: list[str] = []
    in_string = False
    escaped = False
    i = 0
    while i < len(raw):
        ch = raw[i]
        if in_string:
            out.append(ch)
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = False
            i += 1
            continue
        if ch == '"':
            in_string = True
            out.append(ch)
            i += 1
            continue
        if ch == ",":
            j = i + 1
            while j < len(raw) and raw[j].isspace():
                j += 1
            if j < len(raw) and raw[j] in "}]":
                i += 1
                continue
        out.append(ch)
        i += 1
    return "".join(out)


def _escape_control_chars_in_json_strings(raw: str) -> str:
    """Escape raw control characters that appear inside JSON strings."""
    out: list[str] = []
    in_string = False
    escaped = False
    for ch in raw:
        if in_string:
            if escaped:
                out.append(ch)
                escaped = False
                continue
            if ch == "\\":
                out.append(ch)
                escaped = True
                continue
            if ch == '"':
                out.append(ch)
                in_string = False
                continue
            if ch == "\n":
                out.append("\\n")
                continue
            if ch == "\r":
                out.append("\\r")
                continue
            if ch == "\t":
                out.append("\\t")
                continue
            if ord(ch) < 0x20:
                out.append(f"\\u{ord(ch):04x}")
                continue
            out.append(ch)
            continue
        out.append(ch)
        if ch == '"':
            in_string = True
    return "".join(out)


def _is_json_string_terminator_after_quote(raw: str, quote_pos: int) -> bool:
    """True when the quote at *quote_pos* likely ends a JSON string key/value."""
    j = quote_pos + 1
    while j < len(raw) and raw[j] in " \t\n\r":
        j += 1
    if j >= len(raw):
        return True
    return raw[j] in ",}]:"


def _escape_unescaped_quotes_in_json_strings(raw: str) -> str:
    """Escape interior ASCII ``"`` that LLMs leave unescaped inside string values."""
    out: list[str] = []
    in_string = False
    escaped = False
    i = 0
    n = len(raw)
    while i < n:
        ch = raw[i]
        if not in_string:
            out.append(ch)
            if ch == '"':
                in_string = True
            i += 1
            continue
        if escaped:
            out.append(ch)
            escaped = False
            i += 1
            continue
        if ch == "\\":
            out.append(ch)
            escaped = True
            i += 1
            continue
        if ch == '"':
            if _is_json_string_terminator_after_quote(raw, i):
                out.append(ch)
                in_string = False
            else:
                out.append('\\"')
            i += 1
            continue
        out.append(ch)
        i += 1
    return "".join(out)


def _candidate_json_texts(raw: str) -> list[str]:
    """Return increasingly repaired JSON candidates, preserving order."""
    candidates: list[str] = []

    def add(value: str) -> None:
        if value not in candidates:
            candidates.append(value)

    add(raw)
    add(_strip_json_prefix(raw).strip())
    fenced = _strip_json_code_fence(raw)
    add(fenced)
    for value in list(candidates):
        repaired = _repair_trailing_commas(value)
        add(repaired)
        escaped = _escape_control_chars_in_json_strings(value)
        add(escaped)
        add(_repair_trailing_commas(escaped))
        quoted = _escape_unescaped_quotes_in_json_strings(value)
        add(quoted)
        quoted_ctrl = _escape_control_chars_in_json_strings(quoted)
        add(quoted_ctrl)
        add(_repair_trailing_commas(quoted))
        add(_repair_trailing_commas(quoted_ctrl))
    return candidates


def _loads_json_dict(candidate: str) -> dict[str, Any] | None:
    """Parse a JSON object candidate, including double-encoded objects."""
    try:
        parsed = json.loads(candidate)
    except json.JSONDecodeError:
        return None
    if isinstance(parsed, str):
        for nested in _candidate_json_texts(parsed):
            try:
                parsed = json.loads(nested)
            except json.JSONDecodeError:
                continue
            break
        else:
            return None
    if isinstance(parsed, dict):
        return parsed
    return None


def _try_json_dict_raw_decode_trailing_junk(
    candidate: str,
) -> dict[str, Any] | None:
    """Accept a leading object if trailing junk is only ``]``/``}``."""
    text = candidate.strip()
    try:
        obj, end = json.JSONDecoder().raw_decode(text)
    except json.JSONDecodeError:
        return None
    if not isinstance(obj, dict):
        return None
    rest = text[end:].strip()
    if not rest:
        return obj
    if all(ch in "]}" for ch in rest):
        return obj
    return None


def _try_repair_superfluous_closing_delimiter(
    candidate: str,
    *,
    max_deletions: int = 3,
) -> dict[str, Any] | None:
    """Drop a few stray ``]``/``}`` near decode errors."""
    stripped = candidate.strip()

    def parse_or_error(value: str) -> tuple[dict[str, Any] | None, int | None]:
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError as e:
            pos = getattr(e, "pos", None)
            return None, pos if isinstance(pos, int) else None
        return (parsed if isinstance(parsed, dict) else None), None

    parsed, pos = parse_or_error(stripped)
    if parsed is not None:
        return parsed
    queue: list[tuple[str, int | None, int]] = [(stripped, pos, 0)]
    seen = {stripped}
    window = 24
    while queue:
        text, err_pos, deletions = queue.pop(0)
        if err_pos is None or deletions >= max_deletions:
            continue
        lo = max(0, err_pos - window)
        hi = min(len(text), err_pos + window + 1)
        for i in range(lo, hi):
            if text[i] not in "]}":
                continue
            cand = text[:i] + text[i + 1:]
            if cand in seen:
                continue
            seen.add(cand)
            parsed, next_pos = parse_or_error(cand)
            if parsed is not None:
                return parsed
            queue.append((cand, next_pos, deletions + 1))
    return None


def _close_truncated_json_object(raw: str) -> str | None:
    """Close an otherwise well-formed JSON object prefix after truncation."""
    text = raw.strip()
    if not text.startswith("{"):
        return None
    stack: list[str] = []
    in_string = False
    escaped = False
    for ch in text:
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
        elif ch == "{":
            stack.append("}")
        elif ch == "[":
            stack.append("]")
        elif ch in "}]":
            if not stack or stack[-1] != ch:
                return None
            stack.pop()
    if not in_string and not stack:
        return None
    suffix = ""
    if in_string:
        if escaped:
            suffix += "\\"
        suffix += '"'
    suffix += "".join(reversed(stack))
    return text + suffix


def _close_truncated_json_array(raw: str) -> str | None:
    """Close a truncated JSON array prefix after truncation."""
    text = raw.strip()
    if not text.startswith("["):
        return None
    stack: list[str] = []
    in_string = False
    escaped = False
    for ch in text:
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
        elif ch == "{":
            stack.append("}")
        elif ch == "[":
            stack.append("]")
        elif ch in "}]":
            if not stack or stack[-1] != ch:
                return None
            stack.pop()
    if not in_string and not stack:
        return None
    suffix = ""
    if in_string:
        if escaped:
            suffix += "\\"
        suffix += '"'
    suffix += "".join(reversed(stack))
    return text + suffix


def _try_parse_closed_json_prefix(text: str) -> Any | None:
    """Bracket-close a truncated object/array prefix and parse when possible."""
    stripped = text.strip()
    if not stripped:
        return None
    closed: str | None = None
    if stripped.startswith("{"):
        closed = _close_truncated_json_object(stripped)
    elif stripped.startswith("["):
        closed = _close_truncated_json_array(stripped)
    if closed is None:
        return None
    try:
        return json.loads(_repair_trailing_commas(closed))
    except json.JSONDecodeError:
        return None


def _extract_json_object_value(raw: str, key: str) -> dict[str, Any] | None:
    """Extract a complete object value for *key* even when outer JSON is malformed."""
    match = re.search(rf'"{re.escape(key)}"\s*:\s*', raw)
    if not match:
        return None
    value_start = match.end()
    while value_start < len(raw) and raw[value_start].isspace():
        value_start += 1
    if value_start >= len(raw) or raw[value_start] != "{":
        return None
    try:
        parsed, _ = json.JSONDecoder().raw_decode(raw[value_start:])
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


def _looks_like_stream_truncation(raw: str) -> bool:
    """Heuristic: provider cut the JSON stream mid-token."""
    text = raw.rstrip()
    if len(text) < 2:
        return False
    if text[-1] in "{[,:":
        return True
    in_string = False
    escaped = False
    for ch in text:
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = False
        elif ch == '"':
            in_string = True
    if in_string:
        return True
    try:
        json.loads(text)
        return False
    except json.JSONDecodeError as exc:
        pos = getattr(exc, "pos", None)
        if isinstance(pos, int) and pos >= max(0, len(text) - 8):
            return True
        return False


def _salvage_truncated_json_prefix(
    raw: str,
    *,
    max_trim: int = 4000,
) -> Any | None:
    """Trim a truncated JSON prefix until bracket-closing yields valid parse."""
    text = raw.strip()
    if not text or text[0] not in "{[":
        return None
    min_len = max(1, len(text) - max_trim)
    for end in range(len(text), min_len - 1, -1):
        prefix = text[:end].rstrip()
        if not prefix:
            continue
        while prefix and prefix[-1] in ",:":
            prefix = prefix[:-1].rstrip()
        parsed = _try_parse_closed_json_prefix(prefix)
        if parsed is not None:
            return parsed
    return None


def _salvage_truncated_json_after_key(raw: str, key: str) -> Any | None:
    """Salvage the JSON value for *key* when the stream was truncated."""
    match = re.search(rf'"{re.escape(key)}"\s*:\s*', raw)
    if not match:
        return None
    value_start = match.end()
    while value_start < len(raw) and raw[value_start].isspace():
        value_start += 1
    if value_start >= len(raw):
        return None
    fragment = raw[value_start:]
    if not _looks_like_stream_truncation(fragment):
        return None
    return _salvage_truncated_json_prefix(fragment)


def _extract_and_close_truncated_tree(raw: str) -> dict[str, Any] | None:
    """Extract the ``"tree"`` value from *raw* even when truncated mid-stream."""
    match = re.search(r'"tree"\s*:\s*', raw)
    if not match:
        return None
    value_start = match.end()
    while value_start < len(raw) and raw[value_start].isspace():
        value_start += 1
    if value_start >= len(raw) or raw[value_start] != "{":
        return None
    tree_fragment = raw[value_start:]
    closed = _close_truncated_json_object(tree_fragment)
    if closed is not None:
        try:
            parsed = json.loads(_repair_trailing_commas(closed))
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            pass
    for wrapped in (tree_fragment, f'{{"tree":{tree_fragment}}}'):
        repaired = _try_repair_superfluous_closing_delimiter(
            wrapped, max_deletions=16,
        )
        if isinstance(repaired, dict):
            inner = repaired.get("tree")
            if isinstance(inner, dict):
                return inner
    salvaged = _salvage_truncated_json_after_key(raw, "tree")
    return salvaged if isinstance(salvaged, dict) else None


def _find_json_string_end(raw: str, start: int) -> int | None:
    """Find the end quote for a JSON string by normal escape rules."""
    escaped = False
    for i in range(start, len(raw)):
        ch = raw[i]
        if escaped:
            escaped = False
        elif ch == "\\":
            escaped = True
        elif ch == '"':
            return i
    return None


def _extract_json_string_value(
    raw: str, key: str,
) -> tuple[str, int, int] | None:
    """Extract a normally escaped JSON string value for *key*."""
    match = re.search(rf'"{re.escape(key)}"\s*:\s*"', raw)
    if not match:
        return None
    value_start = match.end()
    value_end = _find_json_string_end(raw, value_start)
    if value_end is None:
        return None
    try:
        value = json.loads(f'"{raw[value_start:value_end]}"')
    except json.JSONDecodeError:
        return None
    return value, value_start, value_end


def recover_emit_ui_tree_args(raw: str) -> dict[str, Any] | None:
    """Recover ``emit_ui_tree`` args when the outer JSON is malformed or truncated."""
    for candidate in _candidate_json_texts(_strip_json_code_fence(raw)):
        tree = _extract_json_object_value(candidate, "tree")
        if tree is None:
            closed = _close_truncated_json_object(candidate)
            if closed is not None:
                parsed = _loads_json_dict(closed)
                if parsed is not None and isinstance(parsed.get("tree"), dict):
                    tree = parsed["tree"]
                else:
                    tree = _extract_json_object_value(closed, "tree")
        if tree is None:
            tree = _extract_and_close_truncated_tree(candidate)
        if tree is None and _looks_like_stream_truncation(candidate):
            outer = _salvage_truncated_json_prefix(candidate)
            if isinstance(outer, dict):
                inner = outer.get("tree")
                if isinstance(inner, dict):
                    tree = inner
                elif "root" in outer or "schemaVersion" in outer:
                    tree = outer
        if tree is None:
            continue
        recovered: dict[str, Any] = {"tree": tree}
        canvas_info = _extract_json_string_value(candidate, "canvas_id")
        if canvas_info is not None:
            recovered["canvas_id"] = canvas_info[0]
        return recovered
    return None


def _tree_dict_from_parsed(parsed: dict[str, Any]) -> dict[str, Any] | None:
    """Normalize a parsed object to the gen UI tree envelope."""
    inner = parsed.get("tree")
    if isinstance(inner, dict) and set(parsed.keys()) <= {"tree", "canvas_id"}:
        return inner
    if "root" in parsed or "schemaVersion" in parsed:
        return parsed
    return None


def try_parse_json_object(raw: str) -> dict[str, Any] | None:
    """Parse a JSON object string, applying the full repair pipeline."""
    text = raw.strip()
    if not text:
        return None
    if '"tree"' in text:
        recovered = recover_emit_ui_tree_args(text)
        if recovered is not None:
            inner = recovered.get("tree")
            if isinstance(inner, dict):
                return inner
    parsers = (
        _loads_json_dict,
        _try_json_dict_raw_decode_trailing_junk,
        _try_repair_superfluous_closing_delimiter,
    )
    for candidate in _candidate_json_texts(text):
        try:
            obj, _ = json.JSONDecoder().raw_decode(candidate.strip())
            if isinstance(obj, dict):
                tree = _tree_dict_from_parsed(obj)
                if tree is not None:
                    return tree
        except json.JSONDecodeError:
            pass
        for max_del in (3, 8, 16):
            repaired = _try_repair_superfluous_closing_delimiter(
                candidate, max_deletions=max_del,
            )
            if isinstance(repaired, dict):
                tree = _tree_dict_from_parsed(repaired)
                if tree is not None:
                    return tree
        for parser in parsers:
            parsed = parser(candidate)
            if not isinstance(parsed, dict):
                continue
            tree = _tree_dict_from_parsed(parsed)
            if tree is not None:
                return tree
    if text.startswith("{") and ("schemaVersion" in text or '"root"' in text):
        for wrapped in (f'{{"tree":{text}}}', f'{{"tree": {text}}}'):
            recovered = recover_emit_ui_tree_args(wrapped)
            if recovered is not None and isinstance(recovered.get("tree"), dict):
                return recovered["tree"]
        closed = _close_truncated_json_object(text)
        if closed is not None:
            parsed = _loads_json_dict(closed)
            if isinstance(parsed, dict):
                tree = _tree_dict_from_parsed(parsed)
                if tree is not None:
                    return tree
    return None


__all__ = [
    "recover_emit_ui_tree_args",
    "try_parse_json_object",
]
