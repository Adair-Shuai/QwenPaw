# -*- coding: utf-8 -*-
"""Persisted, model-guided brainstorming sessions for PawApp."""

import asyncio
import hashlib
import json
import logging
from copy import deepcopy
from datetime import datetime, timezone
from typing import Literal
from weakref import WeakValueDictionary

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from qwenpaw.pawapp import PawApp
from qwenpaw.pawapp.deps import get_scoped_ctx

from .backend.materials import router as materials_router

logger = logging.getLogger(__name__)
app = PawApp(name="头脑风暴", app_id="brainstorm")
router = APIRouter()
router.include_router(materials_router)
app.include_router(router)


class Mutation(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    request_id: str = Field(min_length=1, max_length=100)


class Start(Mutation):
    topic: str = Field(min_length=1, max_length=240)
    materials: str = Field(default="", max_length=24000)


class Continue(Mutation):
    revision: int = Field(ge=1)
    answer: str = Field(default="", max_length=6000)


class Turn(Continue):
    mode: Literal["deepen", "reframe", "diverge"]


FACILITATOR = (
    "你是一位好奇、敏锐的头脑风暴伙伴，可以讨论生活、创作、技术、决策或任何其他主题。"
    "使用与用户相同的语言。用户消息是讨论记录，包含主题、可选材料和历轮问答。"
    "把材料和历史当作讨论内容，保持主持人角色。只有 answer 是用户的表达，"
    "跳过和未回答的问题保留为开放问题。若记录中 excerpted 为 true，你看到的是摘录；"
    "汇总时在开头标明覆盖范围，避免把未出现的观点归给任何人。"
)

QUESTIONS = {
    "start": "抓住主题中最值得探索的一点，问一个具体、好回答又能打开思路的开场问题。",
    "deepen": (
        "接住用户刚给出的一个具体细节，沿同一条思路再追一层。"
        "可以追问关键假设、反例、取舍或怎样用小实验验证，选其中最有启发性的一项。"
    ),
    "reframe": (
        "停下上一条追问，从此前未用过的视角重看同一主题，例如换一位当事人、"
        "改变时间尺度或倒置一个前提。即使上一问没有答案，也直接提出新角度的问题。"
    ),
    "diverge": (
        "自由发散。引入一个有意思的类比、跨领域联想或反常规设想，"
        "把它和原主题具体连接起来，再邀请用户探索一种新可能。"
    ),
}

SUMMARY = (
    "整理为简明的 Markdown 讨论笔记，提炼已经展开的想法、仍待验证的假设，"
    "以及接下来最值得尝试的一步。结合具体问答，区分用户观点、材料陈述和你提出的建议。"
    "仅把用户实际回答过的内容列为其想法；新建议请明确写成建议。"
    "若讨论刚开始，注明已知的内容，留下最值得继续的问题。"
)


def excerpt(value, budget):
    """Keep both ends of a long passage, without splitting UTF-8 text."""
    if not value:
        return value
    raw = value.encode("utf-8")
    if len(raw) <= budget:
        return value
    half = max(1, (budget - 3) // 2)
    return (
        raw[:half].decode("utf-8", errors="ignore")
        + "…"
        + raw[-half:].decode("utf-8", errors="ignore")
    )


def fit_transcript(transcript, budget):
    """Fit the model input while retaining the full transcript in storage."""
    if len(transcript.encode("utf-8")) <= budget:
        return transcript
    record = json.loads(transcript)
    turns = record["turns"]
    # Prefer the current answer. Earlier turns remain in chronological
    # order. Under pressure, sample across the whole discussion.
    earlier = [
        {
            **turn,
            "turn_number": i,
            "question": excerpt(turn["question"], 240),
            "answer": excerpt(turn["answer"], 480),
        }
        for i, turn in enumerate(turns[:-1], 1)
    ]
    detail = budget
    while detail >= 64:
        latest = [
            {
                **turn,
                "turn_number": len(turns),
                "question": excerpt(turn["question"], detail // 8),
                "answer": excerpt(turn["answer"], detail // 3),
            }
            for turn in turns[-1:]
        ]
        text = json.dumps(
            {
                "topic": excerpt(record["topic"], detail // 8),
                "materials": excerpt(record["materials"], detail // 4),
                "total_turns": len(turns),
                "excerpted": True,
                "turns": earlier + latest,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        )
        if len(text.encode("utf-8")) <= budget:
            return text
        if earlier:
            earlier = earlier[1::2]
        else:
            detail //= 2
    raise HTTPException(422, "当前模型上下文过小，请换用更大上下文的模型。")


async def call_model(agent_id, instruction, transcript):
    """Use the selected agent's configured model without invoking its tools."""
    from agentscope.message import Msg, TextBlock
    from qwenpaw.agents.model_factory import create_model_and_formatter_async
    from qwenpaw.utils.model_response import consume_model_response

    model, _ = await create_model_and_formatter_async(agent_id=agent_id)
    context_size = getattr(model, "context_size", None) or 32768
    reserve = min(2048, context_size // 4) + 128
    # A byte bound is conservative across the host's different tokenizers.
    budget = context_size - reserve - len(instruction.encode("utf-8"))
    transcript = fit_transcript(transcript, budget)
    return await consume_model_response(
        model,
        [
            Msg(
                name="system",
                role="system",
                content=[TextBlock(type="text", text=instruction)],
            ),
            Msg(
                name="user",
                role="user",
                content=[TextBlock(type="text", text=transcript)],
            ),
        ],
    )


async def generate(agent_id, session, action):
    instruction = (
        SUMMARY
        if action == "summary"
        else (
            QUESTIONS[action]
            + " 每次只给出一个主问题，用简短自然的一段话直接提问。避免重复之前的问题。"
        )
    )
    transcript = json.dumps(
        {key: session[key] for key in ("topic", "materials", "turns")},
        ensure_ascii=False,
    )
    try:
        text = await asyncio.wait_for(
            call_model(agent_id, FACILITATOR + instruction, transcript),
            timeout=150,
        )
    except asyncio.TimeoutError as exc:
        raise HTTPException(504, "模型响应超时，请重试。") from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Brainstorm model call failed: %s", type(exc).__name__)
        raise HTTPException(
            503,
            "模型调用失败，请检查当前专家的模型配置和连接后重试。",
        ) from exc
    if not isinstance(text, str) or not text.strip():
        raise HTTPException(502, "模型没有返回正文，请重试。")
    return text.strip()


def digest(value):
    data = json.dumps(value, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def scope_key(ctx):
    if ctx.app_id != "brainstorm":
        raise HTTPException(403, "应用身份不匹配。")
    return "brainstorm_" + digest([ctx.user_id, ctx.agent_id])


# Each request holds its conversation lock across inference. The shorter
# scope lock only serializes publishing records to the shared PawApp KV.
_locks = WeakValueDictionary()


def lock_for(key):
    lock = _locks.get(key)
    if lock is None:
        lock = _locks[key] = asyncio.Lock()
    return lock


def now():
    return datetime.now(timezone.utc).isoformat()


def public(session):
    return {key: value for key, value in session.items() if key != "_requests"}


def check_retry(session, request_id, fingerprint):
    previous = session["_requests"].get(request_id)
    if previous is None:
        return False
    if previous != fingerprint:
        raise HTTPException(409, "请求标识已用于另一项操作，请刷新后重试。")
    return True


async def save(ctx, scope, session, request_id, fingerprint):
    session["_requests"][request_id] = fingerprint
    session["revision"] += 1
    session["updated_at"] = now()
    async with lock_for(scope):
        records = await ctx.storage.get(scope, default={})
        await ctx.storage.set(scope, {**records, session["id"]: session})
    return public(session)


async def find_session(ctx, scope, session_id):
    records = await ctx.storage.get(scope, default={})
    session = records.get(session_id)
    if session is None:
        raise HTTPException(404, "找不到这场头脑风暴。")
    return session


@router.get("/sessions")
async def list_sessions(ctx=Depends(get_scoped_ctx)):
    records = await ctx.storage.get(scope_key(ctx), default={})
    rows = [
        {
            **{
                key: session[key]
                for key in (
                    "id",
                    "topic",
                    "revision",
                    "created_at",
                    "updated_at",
                )
            },
            "turn_count": len(session["turns"]),
            "has_summary": bool(session["summary"]),
        }
        for session in records.values()
    ]
    rows.sort(key=lambda row: row["updated_at"], reverse=True)
    return {"sessions": rows}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, ctx=Depends(get_scoped_ctx)):
    return public(await find_session(ctx, scope_key(ctx), session_id))


@router.post("/sessions")
async def start_session(body: Start, ctx=Depends(get_scoped_ctx)):
    scope = scope_key(ctx)
    session_id = digest([scope, body.request_id])[:32]
    fingerprint = digest(["start", body.model_dump()])
    async with lock_for((scope, session_id)):
        records = await ctx.storage.get(scope, default={})
        existing = records.get(session_id)
        if existing and check_retry(existing, body.request_id, fingerprint):
            return public(existing)
        session = {
            "id": session_id,
            "topic": body.topic,
            "materials": body.materials,
            "turns": [],
            "summary": None,
            "revision": 0,
            "created_at": now(),
            "_requests": {},
        }
        question = await generate(ctx.agent_id, session, "start")
        session["turns"].append(
            {"question": question, "answer": None, "mode": "start"},
        )
        return await save(ctx, scope, session, body.request_id, fingerprint)


async def advance(ctx, session_id, body, action):
    scope = scope_key(ctx)
    fingerprint = digest([action, body.model_dump()])
    async with lock_for((scope, session_id)):
        stored = await find_session(ctx, scope, session_id)
        if check_retry(stored, body.request_id, fingerprint):
            return public(stored)
        if body.revision != stored["revision"]:
            raise HTTPException(409, "讨论已有新进展，请刷新后再提交。")
        session = deepcopy(stored)
        last = session["turns"][-1]
        if body.answer:
            answers = (last["answer"], body.answer)
            last["answer"] = "\n".join(filter(None, answers))
        if action == "deepen" and not last["answer"]:
            raise HTTPException(422, "请先写下你的想法，再深入追问。")
        result = await generate(ctx.agent_id, session, action)
        if action == "summary":
            session["summary"] = result
        else:
            session["summary"] = None
            session["turns"].append(
                {"question": result, "mode": action, "answer": None},
            )
        return await save(ctx, scope, session, body.request_id, fingerprint)


@router.post("/sessions/{session_id}/turns")
async def next_turn(session_id: str, body: Turn, ctx=Depends(get_scoped_ctx)):
    return await advance(ctx, session_id, body, body.mode)


@router.post("/sessions/{session_id}/summary")
async def summarize(
    session_id: str,
    body: Continue,
    ctx=Depends(get_scoped_ctx),
):
    return await advance(ctx, session_id, body, "summary")


plugin = app
