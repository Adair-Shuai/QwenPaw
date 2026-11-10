# -*- coding: utf-8 -*-
"""Read-only run inspection; execution records remain authoritative and raw.

The UI receives a projection of a run's fixed definition, never the current
draft. Credentials are removed only at the public transport boundary so
subworkflow results and resumable state keep their original values.
"""

from __future__ import annotations

import copy
import math
import re
from typing import Any

REDACTED = "[凭据已隐藏]"


def sensitive_key(key: str) -> bool:
    normalized = re.sub(r"([a-z])([A-Z])", r"\1_\2", key).replace("-", "_")
    if normalized.lower() in {
        "input_tokens",
        "output_tokens",
        "total_tokens",
        "max_tokens",
        "token_count",
        "token_usage",
        "usage_tokens",
    }:
        return False
    return bool(
        re.search(
            r"password|secret|token|api_key|authorization|"
            r"access_key|private_key|cookie",
            normalized,
            re.I,
        ),
    )


def credential_values(*sources: Any) -> set[str]:
    values: set[str] = set()

    def visit(value: Any, sensitive: bool = False) -> None:
        if isinstance(value, dict):
            declared_name = value.get("name") or value.get("id")
            if isinstance(declared_name, str) and sensitive_key(declared_name):
                for key in ("default", "value"):
                    visit(value.get(key), True)
            for key, item in value.items():
                if key in {
                    "nodes",
                    "node_details",
                    "node_statuses",
                } and isinstance(item, dict):
                    # These keys index stable node identities, not credentials.
                    for child in item.values():
                        visit(child, sensitive)
                else:
                    visit(item, sensitive or sensitive_key(str(key)))
        elif isinstance(value, (list, tuple)):
            for item in value:
                visit(item, sensitive)
        elif sensitive and isinstance(value, str) and value:
            values.add(value)

    for source in sources:
        visit(source)
    return values


def _output_value_sources(value: Any, node_output_ids: set[str] | None):
    """Ignore only verified node identities, never arbitrary business keys."""
    if not isinstance(value, dict) or node_output_ids is None:
        return [value]
    return [
        item if key in node_output_ids else {key: item}
        for key, item in value.items()
    ]


def transport_credential_values(
    value: Any,
    node_output_ids: set[str] | None,
) -> set[str]:
    """Collect credentials using the fixed workflow's output-map contract."""
    if not isinstance(value, dict):
        return credential_values(value)
    body = dict(value)
    values: set[str] = set()
    if "run_id" in value and "flow_id" in value:
        values.update(
            credential_values(
                *_output_value_sources(
                    body.pop("outputs", None),
                    node_output_ids,
                ),
            ),
        )
        for event in body.pop("events", []) or []:
            values.update(transport_credential_values(event, node_output_ids))
    elif (
        "prompt_id" in value
        and str(value.get("type", "")).startswith("execution_")
        and isinstance(value.get("data"), dict)
    ):
        data = dict(body["data"])
        values.update(
            credential_values(
                *_output_value_sources(
                    data.pop("outputs", None),
                    node_output_ids,
                ),
            ),
        )
        body["data"] = data
    values.update(credential_values(body))
    return values


def redact_public(value: Any, secrets: set[str]) -> Any:
    """Copy JSON values, masking sensitive keys and known credential echoes."""
    replacements = sorted(secrets, key=len, reverse=True)

    def clean(item: Any) -> Any:
        if isinstance(item, dict):
            return {
                key: (
                    REDACTED
                    if sensitive_key(str(key)) and child is not None
                    else clean(child)
                )
                for key, child in item.items()
            }
        if isinstance(item, (list, tuple)):
            return [clean(child) for child in item]
        if isinstance(item, str):
            for secret in replacements:
                item = item.replace(secret, REDACTED)
        return item

    return clean(value)


def redact_transport(
    value: Any,
    secrets: set[str],
    node_output_ids: set[str] | None = None,
) -> Any:
    """Mask content without rewriting the transport's routing IDs or enums.

    A short password such as ``a`` must not corrupt a status like ``failed``.
    Output objects are still scrubbed recursively, including short echoes.
    """
    result = redact_public(value, secrets)
    if not isinstance(value, dict):
        return result

    def retain(source, target, keys):
        for key in keys:
            if key in source:
                target[key] = copy.deepcopy(source[key])

    def clean_outputs(outputs):
        if not isinstance(outputs, dict) or node_output_ids is None:
            return redact_public(outputs, secrets)
        return {
            key: (
                redact_public(item, secrets)
                if key in node_output_ids
                else redact_public({key: item}, secrets)[key]
            )
            for key, item in outputs.items()
        }

    if "prompt_id" in value and "type" in value:
        retain(value, result, ("prompt_id", "type", "node_id"))
        if isinstance(value.get("state"), dict):
            retain(value["state"], result["state"], ("node_id", "status"))
        if (
            str(value.get("type", "")).startswith("execution_")
            and isinstance(value.get("data"), dict)
            and "outputs" in value["data"]
        ):
            result["data"]["outputs"] = clean_outputs(value["data"]["outputs"])
    elif "run_id" in value and "flow_id" in value:
        retain(
            value,
            result,
            (
                "run_id",
                "flow_id",
                "state_id",
                "status",
                "parent_run_id",
                "root_run_id",
                "resumed_from_run_id",
                "resumed_by_run_id",
                "agent_id",
                "user_id",
                "session_id",
                "channel",
                "trigger_type",
                "workflow_stack",
            ),
        )
        result["node_statuses"] = dict(value.get("node_statuses") or {})
        if isinstance(value.get("debug"), dict):
            result["debug"] = copy.deepcopy(value["debug"])
        if "outputs" in value:
            result["outputs"] = clean_outputs(value["outputs"])
        result["node_details"] = {
            node_id: redact_public(detail, secrets)
            for node_id, detail in (value.get("node_details") or {}).items()
        }
        for node_id, detail in (value.get("node_details") or {}).items():
            retain(
                detail,
                result["node_details"][node_id],
                ("id", "class_type", "status"),
            )
        for original, projected in zip(
            value.get("execution_history") or [],
            result.get("execution_history") or [],
        ):
            retain(original, projected, ("node_id", "status", "next_node"))
        result["events"] = [
            redact_transport(event, secrets, node_output_ids)
            for event in value.get("events") or []
        ]
    return result


def node_details(
    record: dict[str, Any],
    snapshot: dict[str, Any],
    *,
    events: list[dict[str, Any]] | None = None,
) -> dict[str, dict[str, Any]]:
    """Inspect recorded inputs, outputs and the run's fixed configuration."""
    # pylint: disable=too-many-branches,too-many-statements
    statuses = record.get("node_statuses") or {}
    definitions = snapshot.get("nodes") or {}
    history = record.get("execution_history") or []
    details: dict[str, dict[str, Any]] = {}
    timelines: dict[str, dict[Any, dict[str, Any]]] = {}
    observed_events = (
        events if events is not None else record.get("events") or []
    )
    known_ids = [*definitions, *statuses]
    known_ids.extend(
        item["node_id"] for item in history if item.get("node_id")
    )
    for node_id in dict.fromkeys(known_ids):
        definition = definitions.get(node_id) or {}
        details[node_id] = {
            "id": node_id,
            "label": definition.get("label")
            or definition.get("title")
            or definition.get("class_type")
            or node_id,
            "class_type": definition.get("class_type"),
            "status": statuses.get(node_id, "not_executed"),
            "inputs_available": False,
            "configuration": copy.deepcopy(
                {
                    "class_type": definition.get("class_type"),
                    "inputs": {
                        key: value
                        for key, value in (
                            definition.get("inputs") or {}
                        ).items()
                        if key != "__flow_dependencies"
                    },
                    "control": definition.get("control") or {},
                },
            ),
        }
    for event in observed_events:
        node_id = event.get("node_id")
        detail = details.get(node_id) if isinstance(node_id, str) else None
        state = event.get("state") or {}
        if detail is not None:
            if event.get("type") == "node_inputs":
                data = event.get("data") or {}
                if "inputs" in data:
                    detail["inputs_available"] = True
                    detail["inputs"] = copy.deepcopy(data["inputs"])
            if state.get("error") is not None and state.get("status") in {
                "error",
                "failed",
                "timeout",
            }:
                detail["error"] = state["error"]
            else:
                detail.pop("error", None)
            metadata = state.get("metadata") or {}
            started = _nonnegative_number(state.get("started_at_ms"))
            finished = _nonnegative_number(state.get("finished_at_ms"))
            execution_index = state.get("execution_index")
            known_execution = (
                isinstance(execution_index, int)
                and not isinstance(execution_index, bool)
                and execution_index > 0
            )
            if started is not None or known_execution:
                identity = execution_index if known_execution else started
                timing = timelines.setdefault(node_id, {}).setdefault(
                    identity,
                    {},
                )
                if started is not None:
                    timing["started_at_ms"] = started
                if finished is not None:
                    timing["finished_at_ms"] = finished
                if state.get("status") is not None:
                    timing["status"] = state["status"]
                retry = (
                    0
                    if state.get("status") == "cached" and known_execution
                    else _nonnegative_number(metadata.get("retry"))
                )
                if retry is not None or known_execution:
                    timing["retry_count"] = max(
                        timing.get("retry_count", 0),
                        retry or 0,
                    )
            elif _nonnegative_number(metadata.get("retry")) is not None:
                # Legacy records can establish retries without a start time.
                detail["retry_count"] = max(
                    detail.get("retry_count", 0),
                    metadata["retry"],
                )
            if "inputs" in metadata:
                detail["inputs_available"] = True
                detail["inputs"] = copy.deepcopy(metadata["inputs"])
            if metadata:
                detail.setdefault("metadata", {}).update(
                    copy.deepcopy(metadata),
                )
            if metadata.get("debug_pinned"):
                detail["debug_pinned"] = True
            if metadata.get("duration_ms") is not None:
                detail["duration_ms"] = metadata["duration_ms"]
    # Workflow output names are aliases and can collide with node IDs. Only
    # execution-history values are evidence of a particular node's outputs.
    # Last execution wins after a bounded loop or retry; stale errors remain
    # available in history but must not label a successful node as failed.
    for item in history:
        detail = details.get(item.get("node_id"))
        if detail is not None:
            detail.pop("error", None)
            detail.pop("outputs", None)
            if "output" in item and item.get("status") in {
                "completed",
                "paused",
                "waiting_human",
            }:
                detail["outputs"] = item["output"]
            for key in ("duration_ms", "error"):
                if item.get(key) is not None:
                    detail[key] = item[key]
            metadata = item.get("metadata") or {}
            detail["metadata"] = copy.deepcopy(metadata)
            if item.get("status") in {
                "failed",
                "error",
                "timeout",
            } and not item.get("duration_ms"):
                recorded_duration = _nonnegative_number(
                    metadata.get("duration_ms"),
                )
                if recorded_duration is not None:
                    detail["duration_ms"] = recorded_duration
            if "inputs" in metadata:
                detail["inputs_available"] = True
                detail["inputs"] = copy.deepcopy(metadata["inputs"])
            if metadata.get("debug_pinned"):
                detail["debug_pinned"] = True
    for node_id, detail in details.items():
        node_timeline = list(timelines.get(node_id, {}).values())
        if node_timeline:
            detail["timeline"] = node_timeline
            recorded_retries = [
                entry["retry_count"]
                for entry in node_timeline
                if "retry_count" in entry
            ]
            if recorded_retries:
                detail["retry_count"] = sum(recorded_retries)
            latest_timing = node_timeline[-1]
            for key in ("started_at_ms", "finished_at_ms"):
                if key in latest_timing:
                    detail[key] = latest_timing[key]
        executions = [
            item for item in history if item.get("node_id") == node_id
        ]
        is_model = "LLM" in str(detail.get("class_type") or "").upper()
        if executions and (
            is_model
            or any(
                (item.get("metadata") or {}).get("usage") is not None
                for item in executions
            )
        ):
            cached_events = sum(
                event.get("node_id") == node_id
                and event.get("type") == "node_cached"
                for event in observed_events
            )
            marked_cache = sum(
                bool(
                    (item.get("metadata") or {}).get("cache_hit")
                    or (item.get("metadata") or {}).get("debug_pinned"),
                )
                for item in executions
            )
            detail["usage_summary"] = _usage_summary(
                executions,
                cached_events > marked_cache,
            )
            if detail.get("retry_count", 0) > 0:
                detail["usage_summary"]["incomplete"] = True
    return details


def _nonnegative_number(value: Any) -> int | float | None:
    if (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and (not isinstance(value, float) or math.isfinite(value))
        and value >= 0
    ):
        return value
    return None


def _usage_summary(
    executions: list[dict[str, Any]],
    legacy_cache: bool,
) -> dict[str, Any]:
    """Sum recorded execution usage without counting cached output metadata."""
    summary: dict[str, Any] = {
        "recorded_executions": 0,
        "executions": 0,
        "incomplete": legacy_cache,
    }
    aliases = {
        "input_tokens": ("input_tokens", "prompt_tokens"),
        "output_tokens": ("output_tokens", "completion_tokens"),
        "total_tokens": ("total_tokens",),
    }
    for item in executions:
        metadata = item.get("metadata") or {}
        if metadata.get("cache_hit") or metadata.get("debug_pinned"):
            continue
        summary["executions"] += 1
        if legacy_cache:
            continue
        usage = metadata.get("usage")
        if not isinstance(usage, dict):
            continue
        counts = {}
        for name, keys in aliases.items():
            for key in keys:
                count = _nonnegative_number(usage.get(key))
                if count is not None:
                    counts[name] = count
                    break
        if "total_tokens" not in counts and {
            "input_tokens",
            "output_tokens",
        }.issubset(counts):
            counts["total_tokens"] = (
                counts["input_tokens"] + counts["output_tokens"]
            )
        if counts:
            if not {"input_tokens", "output_tokens"}.issubset(counts):
                summary["incomplete"] = True
            summary["recorded_executions"] += 1
            for name, count in counts.items():
                summary[name] = summary.get(name, 0) + count
    if not summary["executions"] and not legacy_cache:
        summary.update(input_tokens=0, output_tokens=0, total_tokens=0)
    summary["incomplete"] = (
        summary["incomplete"]
        or summary["recorded_executions"] < summary["executions"]
    )
    return summary
