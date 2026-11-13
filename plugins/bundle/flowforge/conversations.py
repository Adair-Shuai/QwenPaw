# -*- coding: utf-8 -*-
"""Durable workflow chats and evidence-backed debugging observations."""

from __future__ import annotations

import json
import time
from uuid import uuid4

from .assistant_runtime import AGENT_ID, AssistantModel
from .authoring import propose
from .flow_repository import RevisionConflict
from .repair import build_repair_context


def owner_id(request=None):
    from qwenpaw.app.agent_context import get_current_user_id

    authenticated = getattr(getattr(request, "state", None), "user", None)
    return str(authenticated or get_current_user_id() or "default")


class Conversations:
    def __init__(self, service):
        self.service = service
        self.repository = service._flow_repository
        with self.repository.transaction() as db:
            db.executescript(
                """
                CREATE TABLE IF NOT EXISTS authoring_chats (
                    id TEXT PRIMARY KEY, owner TEXT NOT NULL,
                    flow_id TEXT NOT NULL, title TEXT NOT NULL,
                    updated REAL NOT NULL);
                CREATE INDEX IF NOT EXISTS authoring_chat_scope
                    ON authoring_chats(owner,flow_id,updated);
                CREATE TABLE IF NOT EXISTS authoring_turns (
                    id TEXT PRIMARY KEY, chat_id TEXT NOT NULL,
                    prompt TEXT NOT NULL, status TEXT NOT NULL,
                    payload TEXT NOT NULL, created REAL NOT NULL);
                CREATE TABLE IF NOT EXISTS authoring_experience (
                    id TEXT PRIMARY KEY, owner TEXT NOT NULL,
                    flow_id TEXT NOT NULL, payload TEXT NOT NULL);
            """,
            )

    def chat(self, chat_id, owner):
        with self.repository.transaction() as db:
            row = db.execute(
                (
                    "SELECT flow_id,title FROM authoring_chats WHE"
                    "RE id=? AND owner=?"
                ),
                (chat_id, owner),
            ).fetchone()
            messages = []
            for turn_id, prompt, status, payload in db.execute(
                (
                    "SELECT id,prompt,status,payload FROM authorin"
                    "g_turns WHERE chat_id=? ORDER BY created,rowi"
                    "d"
                ),
                (chat_id,),
            ):
                data = json.loads(payload)
                messages.append(
                    {
                        "id": turn_id,
                        "prompt": prompt,
                        "status": status,
                        **data,
                    },
                )
        if not row or not self.service.get_flow(row[0]):
            raise FileNotFoundError("工作流会话不存在。")
        from .assistant_verification import refresh

        refresh(self, owner, row[0], messages)
        return {
            "id": chat_id,
            "flow_id": row[0],
            "title": row[1],
            "authoring_agent_id": AGENT_ID,
            "messages": messages,
        }

    def list(self, flow_id, owner):
        if not self.service.get_flow(flow_id):
            raise FileNotFoundError("工作流不存在。")
        with self.repository.transaction() as db:
            return [
                {"id": row[0], "title": row[1]}
                for row in db.execute(
                    (
                        "SELECT id,title FROM authoring_chats WHERE fl"
                        "ow_id=? AND owner=? ORDER BY updated DESC"
                    ),
                    (flow_id, owner),
                )
            ]

    def create(self, flow_id, owner):
        self.list(flow_id, owner)
        chat_id = uuid4().hex
        with self.repository.transaction() as db:
            db.execute(
                "INSERT INTO authoring_chats VALUES(?,?,?,?,?)",
                (chat_id, owner, flow_id, "新对话", time.time()),
            )
        return self.chat(chat_id, owner)

    def experiences(self, flow_id, owner):
        self.list(flow_id, owner)
        with self.repository.transaction() as db:
            return [
                json.loads(row[0])
                for row in db.execute(
                    (
                        "SELECT payload FROM authoring_experience WHER"
                        "E owner=? AND flow_id=? ORDER BY rowid DESC"
                    ),
                    (owner, flow_id),
                )
            ]

    def update_experience(self, flow_id, owner, record_id, summary, status):
        records = self.experiences(flow_id, owner)
        record = next(
            (item for item in records if item["id"] == record_id),
            None,
        )
        if not record:
            raise FileNotFoundError("经验记录不存在。")
        record["summary"] = summary.strip()[:4000]
        if status == "invalidated":
            record["status"] = status
        with self.repository.transaction() as db:
            db.execute(
                (
                    "UPDATE authoring_experience SET payload=? WHE"
                    "RE id=? AND owner=?"
                ),
                (json.dumps(record, ensure_ascii=False), record_id, owner),
            )
        return record

    def observe(self, flow_id, owner, evidence, summary):
        record_id = f"{owner}:{evidence['run_id']}:{evidence['node_id']}"
        record = {
            "id": record_id,
            "summary": summary,
            "status": "observed",
            "evidence": evidence,
            "attempts": [],
        }
        with self.repository.transaction() as db:
            db.execute(
                "INSERT OR IGNORE INTO authoring_experience VALUES(?,?,?,?)",
                (
                    record_id,
                    owner,
                    flow_id,
                    json.dumps(record, ensure_ascii=False),
                ),
            )
        return record_id

    def _reserve_turn(self, chat, payload, references):
        chat_id = chat["id"]
        turn_id = payload["request_id"]
        now = time.time()
        with self.repository.transaction() as db:
            existing = db.execute(
                (
                    "SELECT chat_id,status,payload FROM authoring_"
                    "turns WHERE id=?"
                ),
                (turn_id,),
            ).fetchone()
            if existing:
                if existing[0] != chat_id:
                    raise RevisionConflict("请求身份与会话不匹配。")
                if existing[1] == "running":
                    raise RevisionConflict(
                        "该消息仍在处理中，请稍后刷新会话。",
                    )
            else:
                running = db.execute(
                    (
                        "SELECT created FROM authoring_turns WHERE cha"
                        "t_id=? AND status='running'"
                    ),
                    (chat_id,),
                ).fetchone()
                if running and now - running[0] < 180:
                    raise RevisionConflict("上一条消息仍在处理中。")
                db.execute(
                    (
                        "UPDATE authoring_turns SET status='failed', "
                        "payload=json_set(payload,'$.error',?) "
                        "WHERE chat_id=? AND status='running'"
                    ),
                    (
                        "上次处理已中断，可以重新发送。",
                        chat_id,
                    ),
                )
                db.execute(
                    "INSERT INTO authoring_turns VALUES(?,?,?,?,?,?)",
                    (
                        turn_id,
                        chat_id,
                        payload["prompt"],
                        "running",
                        json.dumps(
                            {"references": references},
                            ensure_ascii=False,
                        ),
                        now,
                    ),
                )
                db.execute(
                    "UPDATE authoring_chats SET title=?,updated=? WHERE id=?",
                    (
                        (
                            chat["title"]
                            if chat["messages"]
                            else payload["prompt"][:30]
                        ),
                        now,
                        chat_id,
                    ),
                )
        return bool(existing)

    async def send(self, chat_id, owner, agent_id, payload):
        chat = self.chat(chat_id, owner)
        draft = payload["flow"]
        if draft.get("id") != chat["flow_id"]:
            raise ValueError("草稿与会话工作流不匹配。")
        references = [
            {
                "id": node_id,
                "label": str(draft["nodes"][node_id].get("label") or node_id),
            }
            for node_id in payload.get("selected_node_ids") or []
            if isinstance(node_id, str)
            and isinstance(draft.get("nodes", {}).get(node_id), dict)
        ]
        turn_id = payload["request_id"]
        if self._reserve_turn(chat, payload, references):
            return self.chat(chat_id, owner)
        try:
            evidence = None
            previous = next(
                (
                    item
                    for item in reversed(chat["messages"])
                    if item.get("repair_context")
                ),
                None,
            )
            if previous and not payload.get("repair_run_id"):
                result = previous.get("verification") or {}
                payload["repair_run_id"] = (
                    result.get("run_id")
                    if result.get("status") in {"failed", "timeout"}
                    else previous["repair_context"]["run_id"]
                )
                payload["repair_node_id"] = previous["repair_context"][
                    "node_id"
                ]
            if payload.get("repair_run_id"):
                evidence = await build_repair_context(
                    self.service,
                    draft,
                    agent_id,
                    payload["repair_run_id"],
                    payload.get("repair_node_id"),
                )
                self.observe(
                    chat["flow_id"],
                    owner,
                    evidence,
                    str(evidence.get("error") or "节点执行失败"),
                )
            context = {
                "messages": [
                    {
                        "user": item["prompt"],
                        "assistant": item.get("reply", ""),
                        "status": item["status"],
                    }
                    for item in chat["messages"][-30:]
                ],
                "experience": [
                    item
                    for item in self.experiences(chat["flow_id"], owner)
                    if item["status"] != "invalidated"
                ][:20],
            }
            model = (
                AssistantModel(
                    self.service.node_catalog,
                    f"flowforge-authoring:{chat_id}",
                    owner,
                )
                if self.service.node_catalog is not None
                else None
            )
            result = await propose(
                self.service,
                payload["prompt"],
                flow=draft,
                agent_id=agent_id,
                scope_agent_id=agent_id,
                selected_node_ids=payload.get("selected_node_ids"),
                repair_run_id=payload.get("repair_run_id"),
                repair_node_id=payload.get("repair_node_id"),
                conversation_context=context,
                model=model,
                discussion=payload.get("mode") == "ask",
            )
            data = {
                "reply": result.get(
                    "reply",
                    result.get("explanation", "已准备修改方案。"),
                ),
                "execution_agent_id": agent_id,
                "references": references,
            }
            if "proposal_id" in result:
                data["proposal"] = result
                data["base_flow"] = draft
            if evidence:
                data["repair_context"] = evidence
                if data.get("proposal"):
                    record_id = (
                        f"{owner}:{evidence['run_id']}:{evidence['node_id']}"
                    )
                    with self.repository.transaction() as db:
                        row = db.execute(
                            "SELECT payload FROM authoring_experience "
                            "WHERE id=? AND owner=?",
                            (record_id, owner),
                        ).fetchone()
                        record = json.loads(row[0])
                        record.setdefault("fixes", []).append(
                            {
                                "proposal_id": result["proposal_id"],
                                "chat_id": chat_id,
                                "turn_id": turn_id,
                                "summary": data["reply"],
                                "changes": result["changes"],
                            },
                        )
                        db.execute(
                            "UPDATE authoring_experience SET payload=? "
                            "WHERE id=? AND owner=?",
                            (
                                json.dumps(record, ensure_ascii=False),
                                record_id,
                                owner,
                            ),
                        )
            self.finish(turn_id, "completed", data)
        except BaseException as exc:
            self.finish(
                turn_id,
                "failed",
                {
                    "references": references,
                    "error": (
                        str(exc)
                        if isinstance(exc, (ValueError, FileNotFoundError))
                        else "助手处理失败，可以重新发送。"
                    ),
                },
            )
            raise
        return self.chat(chat_id, owner)

    def finish(self, turn_id, status, data):
        with self.repository.transaction() as db:
            db.execute(
                "UPDATE authoring_turns SET status=?,payload=? WHERE id=?",
                (status, json.dumps(data, ensure_ascii=False), turn_id),
            )

    async def apply(self, chat_id, owner, agent_id, turn_id, revision):
        chat = self.chat(chat_id, owner)
        turn = next(
            (item for item in chat["messages"] if item["id"] == turn_id),
            None,
        )
        if not turn or not turn.get("proposal"):
            raise FileNotFoundError("修改卡片不存在。")
        if turn.get("applied"):
            return turn["applied"]
        proposal = turn["proposal"]
        # Save and card receipt share the repository transaction below.
        result = await self.service.apply_proposal_for_agent(
            proposal["proposal_id"],
            revision,
            agent_id,
        )
        data = {
            key: value
            for key, value in turn.items()
            if key not in {"id", "prompt", "status"}
        }
        data["applied"] = result
        self.finish(turn_id, "completed", data)
        return result
