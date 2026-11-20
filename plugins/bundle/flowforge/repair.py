# -*- coding: utf-8 -*-
"""Build bounded, public diagnostic evidence from one recorded node failure."""

from __future__ import annotations

import copy
import json


def _bounded_value(value, limit=16000):
    encoded = json.dumps(value, ensure_ascii=False, allow_nan=False)
    if len(encoded) <= limit:
        return copy.deepcopy(value)
    return {
        "truncated": True,
        "preview": encoded[:limit],
        "original_json_chars": len(encoded),
    }


async def build_repair_context(service, base, scope_id, run_id, node_id):
    """Read authoritative observations without changing the recorded run."""
    if not isinstance(run_id, str) or not isinstance(node_id, str):
        raise ValueError("AI修复需要同时提供运行ID和节点ID。")
    if not run_id or not node_id:
        raise ValueError("AI修复的运行ID和节点ID不能为空。")
    if not base or node_id not in base["nodes"]:
        raise ValueError("当前草稿中没有该节点，请先查看对应工作流。")
    record = await service.get_public_run_record(run_id)
    if record is None:
        raise FileNotFoundError("找不到用于AI修复的运行记录。")
    if (record.get("agent_id") or "default") != scope_id:
        raise ValueError("运行记录属于其他专家，请切换到运行所属专家。")
    if record.get("flow_id") != base.get("id"):
        raise ValueError("运行记录与当前工作流不匹配。")
    detail = (record.get("node_details") or {}).get(node_id)
    if not detail:
        raise ValueError("运行记录中没有该节点的观察数据。")
    status = (record.get("node_statuses") or {}).get(node_id) or detail.get(
        "status",
    )
    if status not in {"failed", "error", "timeout"}:
        raise ValueError("该节点当前记录的状态不是失败或超时。")
    events = [
        event
        for event in record.get("events") or []
        if event.get("node_id") == node_id
    ][-30:]
    error = detail.get("error")
    if error is None:
        error = next(
            (
                event["state"]["error"]
                for event in reversed(events)
                if (event.get("state") or {}).get("error") is not None
            ),
            None,
        )
    context = {
        "run_id": run_id,
        "flow_id": record["flow_id"],
        "flow_revision": record.get("flow_revision"),
        "node_id": node_id,
        "node_label": detail.get("label") or node_id,
        "node_status": status,
        "run_status": record.get("status"),
        "configuration_available": bool(detail.get("class_type")),
        "configuration": _bounded_value(detail.get("configuration")),
        "inputs_available": bool(detail.get("inputs_available"))
        and "inputs" in detail,
        "outputs_available": "outputs" in detail,
        "error": _bounded_value(error),
        "events": [_bounded_value(event, 2000) for event in events],
    }
    if context["inputs_available"]:
        context["inputs"] = _bounded_value(detail["inputs"])
    if context["outputs_available"]:
        context["outputs"] = _bounded_value(detail["outputs"])
    return context
