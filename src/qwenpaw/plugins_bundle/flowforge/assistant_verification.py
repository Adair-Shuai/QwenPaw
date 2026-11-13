# -*- coding: utf-8 -*-
"""Replay a failed node's business values against current saved config."""

from __future__ import annotations

import json

from .engine.document import _links, canonicalize
from .engine.template_paths import template_expressions


async def verify(conversations, chat_id, owner, agent_id, turn_id, revision):
    chat = conversations.chat(chat_id, owner)
    turn = next(
        (item for item in chat["messages"] if item["id"] == turn_id),
        None,
    )
    if not turn or not turn.get("applied"):
        raise ValueError("请先应用修复方案。")
    if turn.get("execution_agent_id") != agent_id:
        raise ValueError("请使用修复时的执行专家验证。")
    if turn.get("verification"):
        return chat
    evidence = turn.get("repair_context")
    if not evidence or not evidence.get("inputs_available"):
        raise ValueError("原运行没有完整输入，请在节点调试中提供样本。")
    recorded = evidence["inputs"]
    if not isinstance(recorded, dict) or recorded.get("truncated"):
        raise ValueError("原输入已截断，请在节点调试中提供完整样本。")
    saved = conversations.service.get_flow(chat["flow_id"])
    node_id = evidence["node_id"]
    node = canonicalize(saved)["nodes"][node_id]
    # Constants (including code) come from the current saved document.
    # Only linked or templated sockets reuse recorded business values.
    inputs = {
        name: recorded[name]
        for name, value in node.get("inputs", {}).items()
        if name in recorded
        and (list(_links(value)) or list(template_expressions(value)))
    }
    if any(
        marker in json.dumps(inputs)
        for marker in ("[REDACTED]", "[凭据已隐藏]", "***")
    ):
        raise ValueError("原输入含隐藏值，请在节点调试中提供完整样本。")
    data = {
        key: value
        for key, value in turn.items()
        if key not in {"id", "prompt", "status"}
    }
    with conversations.repository.transaction() as db:
        current = json.loads(
            db.execute(
                "SELECT payload FROM authoring_turns WHERE id=?",
                (turn_id,),
            ).fetchone()[0],
        )
        if current.get("verification"):
            raise ValueError("验证已提交，请刷新对话查看进度。")
        data["verification"] = {"status": "preparing", "revision": revision}
        db.execute(
            "UPDATE authoring_turns SET payload=? WHERE id=?",
            (json.dumps(data, ensure_ascii=False), turn_id),
        )
    try:
        handle = await conversations.service.start_debug_run(
            chat["flow_id"],
            mode="node",
            target_node_id=node_id,
            expected_revision=revision,
            node_inputs=inputs,
            agent_id=agent_id,
        )
    except BaseException:
        data.pop("verification")
        conversations.finish(turn_id, "completed", data)
        raise
    data["verification"] = {
        "run_id": handle.run_id,
        "revision": revision,
        "status": handle.status.value,
    }
    conversations.finish(turn_id, "completed", data)
    return conversations.chat(chat_id, owner)


def refresh(conversations, owner, flow_id, turns):
    for turn in turns:
        result = turn.get("verification")
        if not result or not result.get("run_id"):
            continue
        run = conversations.service.get_run_record(result["run_id"])
        if not run:
            continue
        result["status"] = run["status"]
        data = {
            key: value
            for key, value in turn.items()
            if key not in {"id", "prompt", "status"}
        }
        conversations.finish(turn["id"], turn["status"], data)
        evidence = turn.get("repair_context")
        if not evidence:
            continue
        record_id = f"{owner}:{evidence['run_id']}:{evidence['node_id']}"
        with conversations.repository.transaction() as db:
            row = db.execute(
                (
                    "SELECT payload FROM authoring_experience WHER"
                    "E id=? AND owner=? AND flow_id=?"
                ),
                (record_id, owner, flow_id),
            ).fetchone()
            if row:
                record = json.loads(row[0])
                record["attempts"] = [
                    item
                    for item in record["attempts"]
                    if item["run_id"] != result["run_id"]
                ] + [result]
                if record["status"] != "invalidated":
                    record["status"] = (
                        "verified"
                        if run["status"] == "completed"
                        else "observed"
                    )
                db.execute(
                    "UPDATE authoring_experience SET payload=? WHERE id=?",
                    (json.dumps(record, ensure_ascii=False), record_id),
                )
