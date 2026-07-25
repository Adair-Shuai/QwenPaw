# -*- coding: utf-8 -*-
"""Adapter: control-agent prompts and playbook helpers.

LeAgent's ``control_agent`` node imports ``compose_control_messages``,
``mode_choices``, and ``try_parse_json_payload`` from
``leagent.prompts.control_agent``, and ``playbook_ids_from_context`` from
``leagent.prompts.playbooks``.

This module reimplements those functions with the same signatures so the
node code works without modification.  The prompt templates are
self-contained (not dependent on LeAgent's prompt registry).
"""

from __future__ import annotations

import json
import re
from typing import Any

# ── Control Agent modes ──────────────────────────────────────────────────────

_MODE_DEFAULTS: dict[str, dict[str, str]] = {
    "prompt_generate": {
        "system": (
            "You are a prompt engineering specialist. Given an instruction "
            "and optional context, synthesize a precise, effective prompt "
            "for a downstream AI model (image, video, text). Output only "
            "the prompt text unless asked for JSON."
        ),
        "context_template": "Context: ${context}",
        "output_contract": "Output: a single prompt string.",
    },
    "param_generate": {
        "system": (
            "You are a parameter synthesis agent. Given an instruction and "
            "context, produce a JSON object with the parameters needed by "
            "the target node. Only include parameters that are specified "
            "or can be reasonably inferred."
        ),
        "context_template": "Context: ${context}",
        "output_contract": "Output: a JSON object with parameter key-value pairs.",
    },
    "state_patch": {
        "system": (
            "You are a workflow state manager. Given an instruction and "
            "the current workflow context, produce a JSON object whose "
            "keys are workflow variable names and values are the new "
            "values to set."
        ),
        "context_template": "Current state: ${context}",
        "output_contract": "Output: a JSON object of variable → value patches.",
    },
    "route_decision": {
        "system": (
            "You are a workflow routing agent. Given an instruction and "
            "context, decide the next step. Output a JSON object with a "
            "'route' key containing the target node or branch name."
        ),
        "context_template": "Context: ${context}",
        "output_contract": "Output: {\"route\": \"<target>\"}",
    },
    "custom": {
        "system": "",
        "context_template": "${context}",
        "output_contract": "",
    },
}


def mode_choices() -> list[str]:
    """Return the list of supported control-agent modes."""
    return list(_MODE_DEFAULTS.keys())


def _render_template(template: str, context: Any, state: Any = None) -> str:
    """Render a ``${...}`` template against context and state."""
    if not template:
        return ""

    # Build replacement context
    repl: dict[str, Any] = {}
    if isinstance(context, dict):
        repl.update(context)
    repl["context"] = context if context is not None else ""

    if state is not None:
        # Add state variables
        variables = getattr(state, "variables", None) or {}
        repl["variables"] = variables
        repl["var"] = variables
        repl["inputs"] = getattr(state, "inputs", None) or {}
        repl["outputs"] = getattr(state, "outputs", None) or {}

    # Replace ${key} or ${key.subkey} patterns
    pattern = re.compile(r"\$\{([^}]+)\}")

    def replace_match(m: re.Match[str]) -> str:
        path = m.group(1)
        value = _get_nested(repl, path)
        return str(value) if value is not None else m.group(0)

    return pattern.sub(replace_match, template)


def _get_nested(obj: dict[str, Any], path: str) -> Any:
    """Get nested value using dot notation."""
    parts = path.split(".")
    current: Any = obj
    for part in parts:
        if isinstance(current, dict):
            current = current.get(part)
        elif hasattr(current, part):
            current = getattr(current, part)
        else:
            return None
        if current is None:
            return None
    return current


def compose_control_messages(
    *,
    mode: str,
    instruction: str,
    system_template: str = "",
    context_template: str = "",
    output_contract: str = "",
    examples: str = "",
    context: Any = None,
    state: Any = None,
    target: str = "",
) -> tuple[str, str]:
    """Compose ``(system_msg, user_msg)`` for a control-agent step.

    Mirrors ``leagent.prompts.control_agent.compose_control_messages``.
    """
    defaults = _MODE_DEFAULTS.get(mode, _MODE_DEFAULTS["custom"])

    system = system_template or defaults.get("system", "")
    ctx_tpl = context_template or defaults.get("context_template", "")
    contract = output_contract or defaults.get("output_contract", "")

    # Build user message
    parts: list[str] = []

    # Render context
    if ctx_tpl:
        rendered_ctx = _render_template(ctx_tpl, context, state)
        if rendered_ctx:
            parts.append(rendered_ctx)

    # Instruction
    if instruction:
        parts.append(f"Instruction:\n{instruction}")

    # Target
    if target:
        parts.append(f"Target: {target}")

    # Output contract
    if contract:
        parts.append(contract)

    # Examples
    if examples:
        parts.append(f"Examples:\n{examples}")

    user_msg = "\n\n".join(parts)
    return system, user_msg


def try_parse_json_payload(text: str) -> dict[str, Any] | None:
    """Best-effort JSON extraction from a model response.

    Handles:
    * Plain JSON objects
    * JSON inside ```json ... ``` fences
    * JSON embedded in prose (first ``{...}`` block)
    """
    if not text:
        return None

    text = text.strip()

    # Direct parse
    try:
        result = json.loads(text)
        if isinstance(result, dict):
            return result
    except (json.JSONDecodeError, ValueError):
        pass

    # ```json fence
    fence_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if fence_match:
        try:
            result = json.loads(fence_match.group(1).strip())
            if isinstance(result, dict):
                return result
        except (json.JSONDecodeError, ValueError):
            pass

    # First {...} block
    brace_match = re.search(r"\{.*\}", text, re.DOTALL)
    if brace_match:
        try:
            result = json.loads(brace_match.group(0))
            if isinstance(result, dict):
                return result
        except (json.JSONDecodeError, ValueError):
            pass

    return None


# ── Playbook helpers ─────────────────────────────────────────────────────────


def playbook_ids_from_context(
    *,
    tool_extra: dict[str, Any] | None = None,
    metadata: dict[str, Any] | None = None,
) -> list[str]:
    """Extract playbook IDs from tool_extra or workflow metadata.

    QwenPaw doesn't have a playbook system, so this always returns
    an empty list unless the caller explicitly provides playbook IDs
    in ``tool_extra`` or ``metadata``.
    """
    ids: list[str] = []

    if tool_extra:
        raw = tool_extra.get("playbook_ids")
        if isinstance(raw, list):
            ids.extend(str(pid) for pid in raw if pid)
        elif isinstance(raw, str) and raw:
            ids.append(raw)

    if metadata:
        raw = metadata.get("playbook_ids")
        if isinstance(raw, list):
            ids.extend(str(pid) for pid in raw if pid)
        elif isinstance(raw, str) and raw:
            ids.append(raw)

    return ids


__all__ = [
    "compose_control_messages",
    "mode_choices",
    "playbook_ids_from_context",
    "try_parse_json_payload",
]
