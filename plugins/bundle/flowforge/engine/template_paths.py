# -*- coding: utf-8 -*-
"""Shared, non-evaluating template paths and their node dependencies."""

from __future__ import annotations

import json
import re
from typing import Any, Iterable

TEMPLATE_PATTERN = re.compile(
    r"""\$\{((?:\[\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*\]|[^}])+)\}""",
)
_BRACKET = re.compile(
    r"""\[\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[0-9]+)\s*\]""",
)
_NAME = re.compile(r"[^.\[\]]+")


def _quoted_key(token: str) -> str:
    if token[0] == '"':
        return json.loads(token)
    characters = token[1:-1]
    converted = ['"']
    index = 0
    while index < len(characters):
        character = characters[index]
        if character == "\\":
            index += 1
            escaped = characters[index]
            converted.append("'" if escaped == "'" else "\\" + escaped)
        else:
            converted.append('\\"' if character == '"' else character)
        index += 1
    converted.append('"')
    return json.loads("".join(converted))


def parse_template_path(path: str) -> list[str | int]:
    """Read dotted keys, quoted object keys and non-negative array indices."""
    parts: list[str | int] = []
    position = 0
    while position < len(path):
        if path[position] == "[":
            match = _BRACKET.match(path, position)
            if match is None:
                raise ValueError(f"Invalid template path '{path}'")
            token = match.group(1)
            parts.append(
                int(token) if token[0].isdigit() else _quoted_key(token),
            )
            position = match.end()
            continue
        if parts:
            if path[position] != ".":
                raise ValueError(f"Invalid template path '{path}'")
            position += 1
        match = _NAME.match(path, position)
        if match is None:
            raise ValueError(f"Invalid template path '{path}'")
        parts.append(match.group())
        position = match.end()
    if not parts:
        raise ValueError("Template path must not be empty")
    return parts


def nested_template_value(obj: Any, path: str, default: Any = None) -> Any:
    """Read strict slot paths and preserve historical output-path defaults."""
    # pylint: disable=too-many-return-statements
    try:
        parts = parse_template_path(path)
    except (ValueError, SyntaxError) as exc:
        if path.startswith(("output_slots[", "output_slots.")):
            raise ValueError(f"Invalid output_slots path '{path}'") from exc
        return default
    strict = parts[0] == "output_slots"

    def missing():
        if strict:
            raise ValueError(f"Missing output_slots path '{path}'")
        return default

    current = obj
    for position, part in enumerate(parts):
        if isinstance(current, dict):
            if part not in current:
                return missing()
            current = current[part]
        elif isinstance(current, (list, tuple)):
            index = int(part) if str(part).isdecimal() else -1
            if not 0 <= index < len(current):
                return missing()
            current = current[index]
        elif isinstance(part, str) and hasattr(current, part):
            current = getattr(current, part)
        else:
            return missing()
        if current is None:
            if strict and position == len(parts) - 1:
                return None
            return missing()
    return current


def template_expressions(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        for match in TEMPLATE_PATTERN.finditer(value):
            yield match.group(1)
    elif isinstance(value, dict):
        for child in value.values():
            yield from template_expressions(child)
    elif isinstance(value, (list, tuple)):
        for child in value:
            yield from template_expressions(child)


def template_node_sources(
    value: Any,
    nodes: dict[str, dict[str, Any]],
    *,
    strict: bool = False,
) -> list[str]:
    """Use the runtime context's output and named-variable resolution rules."""
    # pylint: disable=too-many-branches
    aliases: dict[str, list[str]] = {}
    for node_id, node in nodes.items():
        alias = (node.get("inputs") or {}).get("output") or (
            node.get("control") or {}
        ).get("output")
        if isinstance(alias, str) and alias:
            aliases.setdefault(alias, []).append(node_id)
    sources: set[str] = set()
    for expression in template_expressions(value):
        try:
            parts = parse_template_path(expression)
        except (ValueError, SyntaxError) as exc:
            if strict:
                raise ValueError(
                    f"Invalid template path '{expression}'",
                ) from exc
            continue
        prefix = parts[0]
        if prefix in {"input", "inputs", "state"}:
            continue
        if prefix in {"output", "outputs", "output_slots"}:
            if len(parts) == 1:
                continue
            source = parts[1] if len(parts) > 1 else None
            if not isinstance(source, str) or source not in nodes:
                if strict:
                    raise ValueError(f"Unknown template output '{source}'")
                continue
            sources.add(source)
            continue
        if prefix in {"var", "vars", "variables"}:
            prefix = parts[1] if len(parts) > 1 else ""
        elif isinstance(prefix, str) and prefix in nodes:
            sources.add(prefix)
            continue
        if not isinstance(prefix, str):
            continue
        producers = aliases.get(prefix, [])
        if len(producers) > 1:
            if strict:
                raise ValueError(f"Ambiguous output variable '{prefix}'")
            continue
        sources.update(producers)
    return sorted(sources)
