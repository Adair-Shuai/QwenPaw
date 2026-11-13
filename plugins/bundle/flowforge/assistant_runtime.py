# -*- coding: utf-8 -*-
"""Dedicated host expert with a stable session for each workflow chat."""

from __future__ import annotations

import asyncio
from types import SimpleNamespace

AGENT_ID = "flowforge_assistant"
KNOWLEDGE_VERSION = "1"


class AssistantModel:
    def __init__(self, catalog, session_id, user_id):
        self.catalog = catalog
        self.session_id = session_id
        self.user_id = user_id

    async def complete(self, *, messages, **_options):
        async def invoke():
            from qwenpaw.config.utils import load_config
            from qwenpaw.app.routers.agents import (
                CreateAgentRequest,
                create_agent,
            )

            config = await asyncio.to_thread(load_config)
            if AGENT_ID not in config.agents.profiles:
                # Reuse the host's initialization, configuration locking and
                # model inheritance. Existing user configuration is preserved.
                try:
                    await create_agent(
                        CreateAgentRequest(
                            id=AGENT_ID,
                            name="工作流助手",
                            language="zh",
                            description="工作流搭建、接口诊断、修改与调试经验整理",
                            skill_names=[],
                        ),
                    )
                    from qwenpaw.config.config import mutate_agent_config

                    def configure(settings):
                        memory = settings.running.reme_light_memory_config
                        memory.auto_memory_interval = 0
                        memory.dream_cron_enabled = False
                        memory.auto_memory_search_config.enabled = False
                        from pathlib import Path
                        from qwenpaw.utils.io_utils import write_text_atomic
                        from .authoring import SYSTEM_PROMPT

                        knowledge = (
                            Path(settings.workspace_dir) / "FLOWFORGE.md"
                        )
                        write_text_atomic(
                            knowledge,
                            "# 工作流助手知识 v1\n\n" + SYSTEM_PROMPT,
                        )
                        if "FLOWFORGE.md" not in settings.system_prompt_files:
                            settings.system_prompt_files.append("FLOWFORGE.md")

                    await asyncio.to_thread(
                        mutate_agent_config, AGENT_ID, configure
                    )
                except Exception:
                    config = await asyncio.to_thread(load_config)
                    if AGENT_ID not in config.agents.profiles:
                        raise
            config = await asyncio.to_thread(load_config)
            if not config.agents.profiles[AGENT_ID].enabled:
                raise ValueError("工作流助手已禁用，请在专家中心启用。")
            workspace = await self.catalog.manager.get_agent(AGENT_ID)
            request = {
                "input": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "\n\n".join(
                                    message.content for message in messages
                                ),
                            }
                        ],
                    }
                ],
                "session_id": self.session_id,
                "user_id": self.user_id,
                "channel": "console",
                "request_context": {
                    "source": "flowforge-authoring",
                    "agent_id": AGENT_ID,
                    "subagent_allowed_tools": [],
                    "workflow_knowledge_version": KNOWLEDGE_VERSION,
                },
            }
            reply = ""
            async for event in workspace.stream_query(request):
                field = lambda key: (
                    event.get(key)
                    if isinstance(event, dict)
                    else getattr(event, key, None)
                )
                status = getattr(field("status"), "value", field("status"))
                if field("error") or status in {"failed", "cancelled"}:
                    raise RuntimeError(str(field("error") or status))
                role = getattr(field("role"), "value", field("role"))
                if (
                    field("object") == "message"
                    and status == "completed"
                    and role == "assistant"
                    and getattr(field("type"), "value", field("type"))
                    in (None, "message")
                ):
                    blocks = []
                    for block in field("content") or []:
                        data = (
                            block
                            if isinstance(block, dict)
                            else block.model_dump()
                        )
                        if data.get("type") == "text":
                            blocks.append(data.get("text", ""))
                    if blocks:
                        reply = "".join(blocks)
            return SimpleNamespace(content=reply)

        return await self.catalog._on_host(invoke)
