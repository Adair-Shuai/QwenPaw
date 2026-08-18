# -*- coding: utf-8 -*-
"""JSON repair utilities for recovering GenUI tree payloads from malformed LLM output.

Ported from LeAgent ``backend/leagent/tools/executor.py`` (Apache-2.0).
"""

import json
import re
from typing import Any

def _strip_json_prefix(raw: str) -> str:
    return raw.lstrip("\ufeff\u200b\u200c\u200d\u2060")

def _strip_json_code_fence(raw: str) -> str:
    text = _strip_json_prefix(raw).strip()
    match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, flags=re.DOTALL)
    if match: return _strip_json_prefix(match.group(1)).strip()
    return text

def _repair_trailing_commas(raw: str) -> str:
    out: list[str] = []; in_string = False; escaped = False; i = 0
    while i < len(raw):
        ch = raw[i]
        if in_string:
            out.append(ch)
            if escaped: escaped = False
            elif ch == "\\": escaped = True
            elif ch == '"': in_string = False
            i += 1; continue
        if ch == '"': in_string = True; out.append(ch); i += 1; continue
        if ch == ",":
            j = i + 1
            while j < len(raw) and raw[j].isspace(): j += 1
            if j < len(raw) and raw[j] in "}]": i += 1; continue
        out.append(ch); i += 1
    return "".join(out)

def _escape_control_chars_in_json_strings(raw: str) -> str:
    out: list[str] = []; in_string = False; escaped = False
    for ch in raw:
        if in_string:
            if escaped: out.append(ch); escaped = False; continue
            if ch == "\\": out.append(ch); escaped = True; continue
            if ch == '"': out.append(ch); in_string = False; continue
            if ch == "\n": out.append("\\n"); continue
            if ch == "\r": out.append("\\r"); continue
            if ch == "\t": out.append("\\t"); continue
            if ord(ch) < 0x20: out.append(f"\\u{ord(ch):04x}"); continue
            out.append(ch); continue
        out.append(ch)
        if ch == '"': in_string = True
    return "".join(out)

def _is_json_string_terminator_after_quote(raw: str, quote_pos: int) -> bool:
    j = quote_pos + 1
    while j < len(raw) and raw[j] in " \t\n\r": j += 1
    if j >= len(raw): return True
    return raw[j] in ",}]:"

def _escape_unescaped_quotes_in_json_strings(raw: str) -> str:
    out: list[str] = []; in_string = False; escaped = False; i = 0; n = len(raw)
    while i < n:
        ch = raw[i]
        if not in_string: out.append(ch); in_string = ch == '"'; i += 1; continue
        if escaped: out.append(ch); escaped = False; i += 1; continue
        if ch == "\\": out.append(ch); escaped = True; i += 1; continue
        if ch == '"':
            if _is_json_string_terminator_after_quote(raw, i): out.append(ch); in_string = False
            else: out.append('\\"')
            i += 1; continue
        out.append(ch); i += 1
    return "".join(out)

def _candidate_json_texts(raw: str) -> list[str]:
    candidates: list[str] = []
    def add(v: str):
        if v not in candidates: candidates.append(v)
    add(raw); add(_strip_json_prefix(raw).strip())
    fenced = _strip_json_code_fence(raw); add(fenced)
    for value in list(candidates):
        add(_repair_trailing_commas(value))
        escaped = _escape_control_chars_in_json_strings(value); add(escaped)
        add(_repair_trailing_commas(escaped))
        quoted = _escape_unescaped_quotes_in_json_strings(value); add(quoted)
        quoted_ctrl = _escape_control_chars_in_json_strings(quoted); add(quoted_ctrl)
        add(_repair_trailing_commas(quoted)); add(_repair_trailing_commas(quoted_ctrl))
    return candidates

def _loads_json_dict(candidate: str) -> dict[str, Any] | None:
    try: parsed = json.loads(candidate)
    except json.JSONDecodeError: return None
    if isinstance(parsed, str):
        for nested in _candidate_json_texts(parsed):
            try: parsed = json.loads(nested)
            except json.JSONDecodeError: continue
            break
        else: return None
    return parsed if isinstance(parsed, dict) else None

def _try_repair_superfluous_closing_delimiter(candidate: str, *, max_deletions: int = 3) -> dict[str, Any] | None:
    stripped = candidate.strip()
    def parse_or_error(v: str) -> tuple[dict[str, Any] | None, int | None]:
        try: parsed = json.loads(v)
        except json.JSONDecodeError as e: return None, getattr(e, "pos", None) if isinstance(getattr(e, "pos", None), int) else None
        return (parsed if isinstance(parsed, dict) else None), None
    parsed, pos = parse_or_error(stripped)
    if parsed is not None: return parsed
    queue: list[tuple[str, int | None, int]] = [(stripped, pos, 0)]; seen = {stripped}; window = 24
    while queue:
        text, err_pos, deletions = queue.pop(0)
        if err_pos is None or deletions >= max_deletions: continue
        lo, hi = max(0, err_pos - window), min(len(text), err_pos + window + 1)
        for i in range(lo, hi):
            if text[i] not in "]}": continue
            cand = text[:i] + text[i+1:]
            if cand in seen: continue
            seen.add(cand)
            parsed, next_pos = parse_or_error(cand)
            if parsed is not None: return parsed
            queue.append((cand, next_pos, deletions + 1))
    return None

def _close_truncated_json_object(raw: str) -> str | None:
    text = raw.strip()
    if not text.startswith("{"): return None
    stack: list[str] = []; in_string = False; escaped = False
    for ch in text:
        if in_string:
            if escaped: escaped = False
            elif ch == "\\": escaped = True
            elif ch == '"': in_string = False
            continue
        if ch == '"': in_string = True
        elif ch == "{": stack.append("}")
        elif ch == "[": stack.append("]")
        elif ch in "}]":
            if not stack or stack[-1] != ch: return None
            stack.pop()
    if not in_string and not stack: return None
    suffix = ""
    if in_string:
        if escaped: suffix += "\\"
        suffix += '"'
    suffix += "".join(reversed(stack))
    return text + suffix

def _extract_json_object_value(raw: str, key: str) -> dict[str, Any] | None:
    match = re.search(rf'"{re.escape(key)}"\s*:\s*', raw)
    if not match: return None
    vs = match.end()
    while vs < len(raw) and raw[vs].isspace(): vs += 1
    if vs >= len(raw) or raw[vs] != "{": return None
    try: parsed, _ = json.JSONDecoder().raw_decode(raw[vs:])
    except json.JSONDecodeError: return None
    return parsed if isinstance(parsed, dict) else None

def _looks_like_stream_truncation(raw: str) -> bool:
    text = raw.rstrip()
    if len(text) < 2: return False
    if text[-1] in "{[,:": return True
    in_string = False; escaped = False
    for ch in text:
        if in_string:
            if escaped: escaped = False
            elif ch == "\\": escaped = True
            elif ch == '"': in_string = False
        elif ch == '"': in_string = True
    if in_string: return True
    try: json.loads(text); return False
    except json.JSONDecodeError as exc:
        pos = getattr(exc, "pos", None)
        return isinstance(pos, int) and pos >= max(0, len(text) - 8)

def _tree_dict_from_parsed(parsed: dict[str, Any]) -> dict[str, Any] | None:
    inner = parsed.get("tree")
    if isinstance(inner, dict) and set(parsed.keys()) <= {"tree", "canvas_id"}: return inner
    if "root" in parsed or "schemaVersion" in parsed: return parsed
    if isinstance(parsed.get("kind"), str) or isinstance(parsed.get("type"), str): return parsed
    return None

def try_parse_json_object(raw: str) -> dict[str, Any] | None:
    text = raw.strip()
    if not text: return None
    if '"tree"' in text:
        for candidate in _candidate_json_texts(_strip_json_code_fence(text)):
            tree = _extract_json_object_value(candidate, "tree")
            if tree is None:
                closed = _close_truncated_json_object(candidate)
                if closed:
                    parsed = _loads_json_dict(closed)
                    if parsed and isinstance(parsed.get("tree"), dict): tree = parsed["tree"]
            if tree: return tree
    for candidate in _candidate_json_texts(text):
        try:
            obj, _ = json.JSONDecoder().raw_decode(candidate.strip())
            if isinstance(obj, dict):
                tree = _tree_dict_from_parsed(obj)
                if tree: return tree
        except json.JSONDecodeError: pass
        for max_del in (3,):
            repaired = _try_repair_superfluous_closing_delimiter(candidate, max_deletions=max_del)
            if isinstance(repaired, dict):
                tree = _tree_dict_from_parsed(repaired)
                if tree: return tree
        for parser in (_loads_json_dict, _try_repair_superfluous_closing_delimiter):
            parsed = parser(candidate)
            if isinstance(parsed, dict):
                tree = _tree_dict_from_parsed(parsed)
                if tree: return tree
    if text.startswith("{") and ("schemaVersion" in text or '"root"' in text):
        closed = _close_truncated_json_object(text)
        if closed:
            parsed = _loads_json_dict(closed)
            if isinstance(parsed, dict):
                tree = _tree_dict_from_parsed(parsed)
                if tree: return tree
    return None

__all__ = ["try_parse_json_object"]
