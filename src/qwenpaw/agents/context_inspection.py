# -*- coding: utf-8 -*-
"""Bounded, read-only evidence of the latest model invocation.

This is deliberately not a token counter or a reconstruction of provider wire
payloads. It runs last in the model middleware chain, after temporary memory
injections, and never reads files named by messages. The snapshot belongs to
one agent invocation and is persisted by the normal atomic session save.
"""

from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timezone
from pathlib import PureWindowsPath
from typing import Any
from urllib.parse import urlsplit, urlunsplit

from agentscope.middleware import MiddlewareBase

from ..constant import AUTO_MEMORY_SEARCH_BLOCK_IDS_KEY

logger = logging.getLogger(__name__)
SNAPSHOT_KEY = "context_inspection"
MAX_SOURCES = 64
MAX_CONTENT = 8000
MAX_TOTAL_CONTENT = 64000
MAX_SUMMARY = 16000


def _get(value: Any, key: str, default: Any = None) -> Any:
    return (
        value.get(key, default)
        if isinstance(value, dict)
        else getattr(value, key, default)
    )


def _text(value: Any) -> str:
    return value if isinstance(value, str) else ""


def _content_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if not isinstance(content, (list, tuple)):
        return ""
    # Do not serialize image/base64 bytes, hidden reasoning, tool arguments or
    # arbitrary object reprs. Tool results remain available in normal history.
    return "\n".join(
        _text(
            _get(block, "hint")
            if _get(block, "type") == "hint"
            else _get(block, "text"),
        )
        for block in content
        if _get(block, "type") in {"text", "hint"}
    )


def _safe_source_url(value: Any) -> str | None:
    raw = _text(value)
    if not raw or raw.startswith("data:"):
        return None
    try:
        parsed = urlsplit(raw)
        if parsed.scheme in {"http", "https"}:
            # Signed query strings and embedded credentials are not labels.
            return urlunsplit(
                (parsed.scheme, parsed.hostname or "", parsed.path, "", ""),
            )[:1000]
        return raw[:1000] if parsed.scheme == "file" else None
    except ValueError:
        return None


def collect_sources(
    messages: list[Any],
    *,
    provenance: str,
    prompt_sources: list[dict] | None = None,
) -> tuple[list[dict], bool]:
    """Copy safe strings from the supplied messages, with explicit limits."""
    # Classify frozen model inputs in one bounded evidence pass.
    # pylint: disable=R0912,R0915
    sources: list[dict] = []
    remaining = MAX_TOTAL_CONTENT
    truncated = False

    def append(kind: str, label: str, content: str = "", **extra: Any) -> None:
        nonlocal remaining, truncated
        if len(sources) >= MAX_SOURCES or remaining <= 0:
            truncated = True
            return
        clipped = content[: min(MAX_CONTENT, remaining)]
        shortened = len(clipped) < len(content)
        remaining -= len(clipped)
        truncated = truncated or shortened
        sources.append(
            {
                "id": f"source-{len(sources)}",
                "kind": kind,
                "label": label[:200],
                "provenance": provenance,
                "content": clipped or None,
                "message_id": extra.get("message_id"),
                "path": extra.get("path"),
                "truncated": shortened,
            },
        )

    # Prompt files are identified at the actual read/assembly point, then
    # checked against the final post-middleware system messages. Configuration
    # alone never establishes that a file was included.
    system_texts = [
        _content_text(_get(m, "content"))
        for m in messages
        if _get(m, "role") == "system"
    ]
    for source in prompt_sources or []:
        rendered = _text(source.get("content"))
        if rendered and any(rendered in text for text in system_texts):
            append(
                "system",
                _text(source.get("label")),
                rendered,
                path=_text(source.get("path")) or None,
            )

    # Keep the latest context tail while retaining system messages. This only
    # limits the inspector; it does not trim messages sent to the model.
    selected = [m for m in messages if _get(m, "role") == "system"]
    conversation = [m for m in messages if _get(m, "role") != "system"]
    truncated = truncated or len(conversation) > 40
    selected.extend(conversation[-40:])
    read_calls: dict[str, str] = {}
    for message in selected:
        blocks = _get(message, "content")
        for block in blocks if isinstance(blocks, (list, tuple)) else []:
            if (
                _get(block, "type") == "tool_call"
                and _get(block, "name") == "read_file"
            ):
                raw_input = _get(block, "input")
                try:
                    args = (
                        json.loads(raw_input)
                        if isinstance(raw_input, str)
                        and len(raw_input) < MAX_CONTENT
                        else raw_input
                    )
                    path = (
                        _text(args.get("file_path"))
                        if isinstance(args, dict)
                        else ""
                    )
                    if path:
                        read_calls[_text(_get(block, "id"))] = path[:1000]
                except (ValueError, TypeError):
                    pass
    for message in selected:
        role = _text(_get(message, "role")) or "message"
        message_id = _text(_get(message, "id"))[:200] or None
        metadata = _get(message, "metadata", {}) or {}
        content = _get(message, "content")
        kind = "system" if role == "system" else "conversation"
        marker = (
            metadata.get(AUTO_MEMORY_SEARCH_BLOCK_IDS_KEY)
            if isinstance(metadata, dict)
            else None
        )
        memory_ids = (
            {value for value in marker if isinstance(value, str)}
            if isinstance(marker, list)
            else set()
        )
        memory_blocks = (
            [
                block
                for block in content
                if _get(block, "type") == "hint"
                and _get(block, "id") in memory_ids
            ]
            if isinstance(content, (list, tuple))
            else []
        )
        ordinary_content = (
            [
                block
                for block in content
                if not (
                    _get(block, "type") == "hint"
                    and _get(block, "id") in memory_ids
                )
            ]
            if isinstance(content, (list, tuple))
            else content
        )
        text = _content_text(ordinary_content)
        if text:
            append(kind, role, text, message_id=message_id)
        for block in memory_blocks:
            memory_text = _content_text([block])
            if memory_text:
                append("memory", "memory", memory_text, message_id=message_id)
        if isinstance(metadata, dict):
            quotes = metadata.get("qwenpaw_answer_quotes")
            if isinstance(quotes, list):
                for quote in quotes[:12]:
                    if not isinstance(quote, dict):
                        continue
                    quote_text = _text(quote.get("text"))
                    quoted = "\n".join(
                        "> " + line for line in quote_text.split("\n")
                    )
                    if quote_text and quoted in text:
                        append(
                            "quote",
                            "quote",
                            quote_text,
                            message_id=_text(quote.get("messageId"))[:200]
                            or None,
                        )
        if isinstance(content, (list, tuple)):
            for block in content:
                block_type = _get(block, "type")
                if block_type == "tool_result":
                    output = _content_text(_get(block, "output"))
                    path = read_calls.get(_text(_get(block, "id")))
                    if (
                        output
                        and path
                        and _get(block, "name") == "read_file"
                        and _get(block, "state") == "success"
                    ):
                        append(
                            "file",
                            PureWindowsPath(path).name,
                            output,
                            message_id=message_id,
                            path=path,
                        )
                    elif output:
                        append(
                            kind,
                            _text(_get(block, "name")) or role,
                            output,
                            message_id=message_id,
                        )
                    continue
                if block_type not in {
                    "file",
                    "image",
                    "audio",
                    "video",
                    "data",
                }:
                    continue
                source = _get(block, "source", {}) or {}
                path = _safe_source_url(_get(source, "url"))
                label = (
                    _text(_get(block, "filename"))
                    or _text(_get(block, "name"))
                    or (path.rsplit("/", 1)[-1] if path else block_type)
                )
                append("file", label, message_id=message_id, path=path)
    return sources, truncated


def saved_summary(agent_data: dict) -> dict:
    """Read only the durable native/scroll summary, never run compaction."""
    scroll = agent_data.get("scroll")
    if isinstance(scroll, dict) and isinstance(
        scroll.get("continuation_summary"),
        dict,
    ):
        from .context.scroll.continuation_summary import ContinuationSummary

        summary = ContinuationSummary.from_dict(scroll["continuation_summary"])
        if summary is not None:
            text = summary.render()
            return {
                "kind": "scroll",
                "content": text[:MAX_SUMMARY],
                "stale": bool(scroll.get("summary_update_failed")),
                "truncated": len(text) > MAX_SUMMARY,
            }
    state = agent_data.get("state") or {}
    text = _text(state.get("summary")) if isinstance(state, dict) else ""
    if not text:
        legacy = agent_data.get("memory") or {}
        text = (
            _text(legacy.get("_compressed_summary"))
            if isinstance(legacy, dict)
            else ""
        )
    return {
        "kind": "native" if text else "none",
        "content": text[:MAX_SUMMARY],
        "stale": False,
        "truncated": len(text) > MAX_SUMMARY,
    }


class ContextInspectionMiddleware(MiddlewareBase):
    """Observe the final AgentScope invocation without changing its input."""

    async def on_model_call(
        self,
        agent: Any,
        input_kwargs: dict,
        next_handler: Any,
    ) -> Any:
        # The observer records bounded evidence on its owning agent.
        # pylint: disable=protected-access
        try:
            messages = list(input_kwargs.get("messages") or [])
            sources, truncated = collect_sources(
                messages,
                provenance="model_request",
                prompt_sources=getattr(
                    agent,
                    "_context_inspection_prompt_sources",
                    None,
                ),
            )
            context = getattr(getattr(agent, "state", None), "context", [])
            latest_user = next(
                (m for m in reversed(context) if _get(m, "role") == "user"),
                None,
            )
            captured_at = datetime.now(timezone.utc).isoformat()
            payload = {
                "version": 1,
                "captured_at": captured_at,
                "basis": "model_request",
                "message_count": len(messages),
                "tool_count": len(input_kwargs.get("tools") or []),
                "sources": sources,
                "truncated": truncated,
                "root_message_id": _text(_get(latest_user, "id")),
            }
            payload["id"] = hashlib.sha256(
                json.dumps(payload, ensure_ascii=False, sort_keys=True).encode(
                    "utf-8",
                ),
            ).hexdigest()[:24]
            agent._context_inspection = payload
        except Exception:
            # Inspection must never break, re-run, or alter inference.
            logger.debug("Context inspection snapshot failed", exc_info=True)
        return await next_handler(**input_kwargs)


def inspection_view(agent_data: dict) -> dict:
    """Build a bounded response from one already-authorized session read."""
    summary = saved_summary(agent_data)
    recorded = agent_data.get(SNAPSHOT_KEY)
    if (
        isinstance(recorded, dict)
        and recorded.get("version") == 1
        and isinstance(recorded.get("sources"), list)
    ):
        # Re-bound persisted content too: imported/older session data need not
        # have been produced by the current writer.
        sources = []
        remaining = MAX_TOTAL_CONTENT
        truncated = bool(recorded.get("truncated"))
        for source in recorded["sources"][:MAX_SOURCES]:
            if not isinstance(source, dict) or source.get("kind") not in {
                "conversation",
                "file",
                "quote",
                "system",
                "summary",
                "memory",
            }:
                continue
            text = _text(source.get("content"))
            clipped = text[: min(MAX_CONTENT, remaining)]
            remaining -= len(clipped)
            shortened = bool(source.get("truncated")) or len(clipped) < len(
                text,
            )
            truncated = truncated or shortened
            sources.append(
                {
                    "id": _text(source.get("id"))[:200],
                    "kind": source["kind"],
                    "label": _text(source.get("label"))[:200],
                    "provenance": "model_request",
                    "content": clipped or None,
                    "message_id": _text(source.get("message_id"))[:200]
                    or None,
                    "path": _text(source.get("path"))[:1000] or None,
                    "truncated": shortened,
                },
            )
        truncated = (
            truncated
            or len(recorded["sources"]) > MAX_SOURCES
            or summary["truncated"]
        )
        snapshot = {
            "id": _text(recorded.get("id"))[:200],
            "captured_at": _text(recorded.get("captured_at"))[:100] or None,
            "message_count": (
                recorded.get("message_count")
                if type(recorded.get("message_count")) is int
                else None
            ),
            "tool_count": (
                recorded.get("tool_count")
                if type(recorded.get("tool_count")) is int
                else None
            ),
        }
        snapshot["basis"] = "model_request"
        limitations = ["provider_payload_not_recorded"]
    else:
        state = agent_data.get("state") or {}
        messages = state.get("context", []) if isinstance(state, dict) else []
        if not messages and isinstance(agent_data.get("memory"), dict):
            messages = [
                row[0]
                for row in agent_data["memory"].get("content", [])
                if isinstance(row, list) and row and isinstance(row[0], dict)
            ]
        sources, truncated = collect_sources(
            messages if isinstance(messages, list) else [],
            provenance="saved_session",
        )
        snapshot = (
            {
                "id": "saved-session",
                "captured_at": None,
                "basis": "saved_session",
                "message_count": len(messages),
                "tool_count": None,
            }
            if messages or summary["content"]
            else None
        )
        limitations = ["legacy_snapshot", "runtime_sources_unavailable"]
        truncated = truncated or summary["truncated"]
    if truncated:
        limitations.append("snapshot_truncated")
    return {
        "status": "saved" if snapshot else "empty",
        "snapshot": snapshot,
        "sources": sources,
        "summary": summary,
        "limitations": limitations,
    }
