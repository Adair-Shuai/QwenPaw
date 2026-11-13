"""Persistent conversations use latest drafts and isolate workflow evidence."""

import asyncio
import json
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from qwenpaw.plugins_bundle.flowforge.service import WorkflowService
from qwenpaw.plugins_bundle.flowforge.router import build_router


def document(flow_id="one"):
    return {
        "id": flow_id,
        "name": flow_id,
        "nodes": {
            "input": {"class_type": "InputNode", "inputs": {"name": "data"}},
            "output": {
                "class_type": "OutputNode",
                "inputs": {"value": ["input", 0]},
            },
        },
        "outputs": ["output"],
    }


class Model:
    def __init__(self):
        self.contexts = []

    async def complete(self, **options):
        request = json.loads(options["messages"][1].content)
        self.contexts.append(request)
        if request["instruction"] == "修改说明":
            draft = request["current_flow"]
            draft["description"] = "changed"
            return SimpleNamespace(
                content=json.dumps({"reply": "已修改说明", "flow": draft})
            )
        return SimpleNamespace(content=json.dumps({"reply": "这是普通答复"}))


def test_persistent_chat_apply_receipt_latest_canvas_and_workflow_isolation(
    tmp_path,
):
    service = WorkflowService(flows_dir=tmp_path)
    model = Model()
    service.executor.llm_service = model
    saved = service.save_flow("one", document())
    service.save_flow("two", document("two"))
    chat = service.conversations.create("one", "account")

    async def send(prompt, flow):
        return await service.conversations.send(
            chat["id"],
            "account",
            "default",
            {"request_id": uuid4().hex, "prompt": prompt, "flow": flow},
        )

    try:
        answer = asyncio.run(send("为什么", saved))
        assert answer["messages"][0]["reply"] == "这是普通答复"
        assert "proposal" not in answer["messages"][0]
        draft = {**saved, "name": "手工重命名"}
        answer = asyncio.run(send("修改说明", draft))
        turn = answer["messages"][-1]
        assert turn["base_flow"] == draft
        assert turn["execution_agent_id"] == "default"
        assert (
            model.contexts[-1]["chat_context"]["messages"][0]["assistant"]
            == "这是普通答复"
        )
        applied = asyncio.run(
            service.conversations.apply(
                chat["id"], "account", "default", turn["id"], 1
            )
        )
        assert applied["name"] == "手工重命名"
        assert applied["revision"] == 2
        assert (
            service.conversations.chat(chat["id"], "account")["messages"][-1][
                "applied"
            ]
            == applied
        )
        assert (
            asyncio.run(
                service.conversations.apply(
                    chat["id"], "account", "default", turn["id"], 1
                )
            )
            == applied
        )
        answer = asyncio.run(send("继续解释", applied))
        assert len(answer["messages"]) == 3
        assert model.contexts[-1]["current_flow"]["revision"] == 2
        assert service.conversations.list("two", "account") == []
        with pytest.raises(FileNotFoundError):
            service.conversations.chat(chat["id"], "other")
    finally:
        service.close(timeout=2)
    restarted = WorkflowService(flows_dir=tmp_path)
    try:
        assert (
            len(
                restarted.conversations.chat(chat["id"], "account")["messages"]
            )
            == 3
        )
    finally:
        restarted.close(timeout=2)


def test_conversation_http_validates_scope_and_deduplicates_requests(tmp_path):
    service = WorkflowService(flows_dir=tmp_path)
    model = Model()
    service.executor.llm_service = model
    saved = service.save_flow("one", document())
    app = FastAPI()
    app.include_router(build_router(service))
    try:
        with TestClient(app) as client:
            chat = client.post("/flows/one/conversations").json()
            url = f"/authoring/conversations/{chat['id']}/messages"
            body = {"request_id": "stable", "prompt": "为什么", "flow": saved}
            assert client.post(url, json=body).status_code == 200
            assert client.post(url, json=body).status_code == 200
            assert len(model.contexts) == 1
            body.update(request_id="wrong", flow=document("two"))
            assert client.post(url, json=body).status_code == 422
            assert (
                len(
                    client.get(
                        f"/authoring/conversations/{chat['id']}"
                    ).json()["messages"]
                )
                == 1
            )
    finally:
        service.close(timeout=2)


def test_real_repair_verification_preserves_failed_attempt_and_current_code(
    tmp_path,
):
    import time
    from qwenpaw.plugins_bundle.flowforge.assistant_verification import verify

    service = WorkflowService(flows_dir=tmp_path)
    flow = {
        "id": "repair",
        "name": "修复",
        "nodes": {
            "compute": {
                "class_type": "ScriptNode",
                "inputs": {
                    "source": "result = 10 / amount",
                    "inputs": {"amount": 0, "enabled": False, "nothing": None},
                },
            },
            "output": {
                "class_type": "OutputNode",
                "inputs": {"value": ["compute", 0]},
            },
        },
        "outputs": ["output"],
    }
    try:
        saved = service.save_flow("repair", flow)
        failed = service.start_run("repair")
        deadline = time.monotonic() + 10
        while not failed.is_done and time.monotonic() < deadline:
            time.sleep(0.01)
        assert failed.is_done and failed.status.value == "failed"

        class RepairModel:
            async def complete(self, **options):
                request = json.loads(options["messages"][1].content)
                candidate = request["current_flow"]
                candidate["nodes"]["compute"]["inputs"]["source"] = (
                    "result = {'amount': amount, 'enabled': enable"
                    "d, 'nothing': nothing}"
                )
                return SimpleNamespace(
                    content=json.dumps(
                        {"reply": "修复除零", "flow": candidate}
                    )
                )

        service.executor.llm_service = RepairModel()
        chat = service.conversations.create("repair", "account")
        response = asyncio.run(
            service.conversations.send(
                chat["id"],
                "account",
                "default",
                {
                    "request_id": "repair-turn",
                    "prompt": "修复",
                    "flow": saved,
                    "repair_run_id": failed.run_id,
                    "repair_node_id": "compute",
                },
            )
        )
        turn = response["messages"][-1]
        assert (
            service.conversations.experiences("repair", "account")[0]["status"]
            == "observed"
        )
        applied = asyncio.run(
            service.conversations.apply(
                chat["id"], "account", "default", turn["id"], 1
            )
        )
        result = asyncio.run(
            verify(
                service.conversations,
                chat["id"],
                "account",
                "default",
                turn["id"],
                applied["revision"],
            )
        )
        run_id = result["messages"][-1]["verification"]["run_id"]
        handle = service.get_run(run_id)
        deadline = time.monotonic() + 10
        while not handle.is_done and time.monotonic() < deadline:
            time.sleep(0.01)
        assert handle.is_done and handle.status.value == "completed"
        service.conversations.chat(chat["id"], "account")
        record = service.conversations.experiences("repair", "account")[0]
        assert record["status"] == "verified"
        assert record["evidence"]["run_id"] == failed.run_id
        assert record["fixes"][0]["summary"] == "修复除零"
        assert record["fixes"][0]["changes"]
        assert record["attempts"][0]["run_id"] == run_id
        assert service.get_run_record(run_id)["node_details"]["compute"][
            "outputs"
        ][0] == {"amount": 0, "enabled": False, "nothing": None}
    finally:
        service.close(timeout=2)


def test_authenticated_http_accounts_cannot_read_other_workflow_chat(tmp_path):
    service = WorkflowService(flows_dir=tmp_path)
    service.save_flow("one", document())
    app = FastAPI()

    @app.middleware("http")
    async def trusted_identity(request, call_next):
        request.state.user = request.headers.get("test-authenticated-user")
        return await call_next(request)

    app.include_router(build_router(service))
    try:
        with TestClient(app) as client:
            chat = client.post(
                "/flows/one/conversations",
                headers={"test-authenticated-user": "alice"},
            ).json()
            assert (
                client.get(
                    f"/authoring/conversations/{chat['id']}",
                    headers={"test-authenticated-user": "bob"},
                ).status_code
                == 404
            )
            assert (
                client.get(
                    "/flows/one/conversations",
                    headers={"test-authenticated-user": "bob"},
                ).json()
                == []
            )
            assert (
                client.get(
                    f"/authoring/conversations/{chat['id']}",
                    headers={"test-authenticated-user": "alice"},
                ).status_code
                == 200
            )
    finally:
        service.close(timeout=2)


def test_normal_expert_text_is_saved_as_discussion_without_a_proposal(
    tmp_path,
):
    service = WorkflowService(flows_dir=tmp_path)
    saved = service.save_flow("one", document())

    class TextModel:
        async def complete(self, **_options):
            return SimpleNamespace(content="已记住，本流程使用验收总量。")

    service.executor.llm_service = TextModel()
    try:
        chat = service.conversations.create("one", "account")
        result = asyncio.run(
            service.conversations.send(
                chat["id"],
                "account",
                "default",
                {
                    "request_id": "text",
                    "prompt": "记住术语",
                    "flow": saved,
                    "mode": "ask",
                },
            )
        )
        assert result["messages"][0]["reply"] == "已记住，本流程使用验收总量。"
        assert "proposal" not in result["messages"][0]
        assert service.get_flow("one") == saved
    finally:
        service.close(timeout=2)


def test_assistant_bridge_uses_stable_session_and_only_final_answer(
    monkeypatch,
):
    from qwenpaw.config import utils
    from qwenpaw.plugins_bundle.flowforge.assistant_runtime import (
        AssistantModel,
        AGENT_ID,
    )
    from qwenpaw.plugins_bundle.flowforge.engine.adapter.chat_message import (
        ChatMessage,
    )

    monkeypatch.setattr(
        utils,
        "load_config",
        lambda: SimpleNamespace(
            agents=SimpleNamespace(
                profiles={AGENT_ID: SimpleNamespace(enabled=True)}
            )
        ),
    )
    requests = []

    class Workspace:
        async def stream_query(self, request):
            requests.append(request)
            for kind, text in [
                ("message", "中间说明"),
                ("reasoning", "internal reasoning"),
                ("message", '{"reply":"最终答复"}'),
            ]:
                yield {
                    "object": "message",
                    "role": "assistant",
                    "status": "completed",
                    "type": kind,
                    "content": [{"type": "text", "text": text}],
                }

    class Catalog:
        manager = SimpleNamespace(get_agent=None)

        async def _on_host(self, operation):
            return await operation()

    async def get_agent(_agent):
        return Workspace()

    catalog = Catalog()
    catalog.manager = SimpleNamespace(get_agent=get_agent)
    model = AssistantModel(catalog, "stable-workflow-chat", "account")
    for _ in range(2):
        result = asyncio.run(
            model.complete(messages=[ChatMessage.user("问题")])
        )
        assert result.content == '{"reply":"最终答复"}'
    assert [item["session_id"] for item in requests] == [
        "stable-workflow-chat"
    ] * 2
    assert requests[0]["request_context"]["subagent_allowed_tools"] == []


def test_discussion_preserves_node_reference_labels_after_restart(tmp_path):
    service = WorkflowService(flows_dir=tmp_path)
    service.executor.llm_service = Model()
    flow = document()
    flow["nodes"]["input"]["label"] = "原始输入"
    saved = service.save_flow("one", flow)
    chat = service.conversations.create("one", "account")
    try:
        answer = asyncio.run(
            service.conversations.send(
                chat["id"],
                "account",
                "default",
                {
                    "request_id": "quoted-question",
                    "prompt": "为什么",
                    "flow": saved,
                    "mode": "ask",
                    "selected_node_ids": ["input"],
                },
            )
        )
        assert "proposal" not in answer["messages"][0]
        assert answer["messages"][0]["references"] == [
            {"id": "input", "label": "原始输入"}
        ]
        saved["nodes"]["input"]["label"] = "已重命名"
        saved = service.save_flow("one", saved, expected_revision=1)

        async def fail(**options):
            raise RuntimeError("model temporarily unavailable")

        service.executor.llm_service = SimpleNamespace(complete=fail)
        with pytest.raises(RuntimeError):
            asyncio.run(
                service.conversations.send(
                    chat["id"],
                    "account",
                    "default",
                    {
                        "request_id": "failed-reference",
                        "prompt": "继续解释",
                        "flow": saved,
                        "selected_node_ids": ["input"],
                    },
                )
            )
        failed = service.conversations.chat(chat["id"], "account")["messages"][
            1
        ]
        assert failed["status"] == "failed"
        assert failed["references"] == [{"id": "input", "label": "已重命名"}]
    finally:
        service.close(timeout=2)
    restarted = WorkflowService(flows_dir=tmp_path)
    try:
        restored = restarted.conversations.chat(chat["id"], "account")
        assert restored["messages"][0]["references"] == [
            {"id": "input", "label": "原始输入"}
        ]
    finally:
        restarted.close(timeout=2)


@pytest.mark.parametrize("edit", [False, True])
@pytest.mark.parametrize("fenced", [False, True])
def test_conversation_accepts_json_answer_with_native_footer(
    tmp_path, edit, fenced
):
    service = WorkflowService(flows_dir=tmp_path)

    class FooterModel:
        async def complete(self, **options):
            request = json.loads(options["messages"][1].content)
            answer = {"reply": "核对 **text** 字段"}
            if edit:
                answer["flow"] = {
                    **request["current_flow"],
                    "description": "字段说明",
                }
            content = json.dumps(answer, ensure_ascii=False)
            if fenced:
                content = "```json\n" + content + "\n```"
            return SimpleNamespace(content=content + "\n\n⟦工作流会话摘要⟧")

    service.executor.llm_service = FooterModel()
    saved = service.save_flow("one", document())
    chat = service.conversations.create("one", "account")
    try:
        answer = asyncio.run(
            service.conversations.send(
                chat["id"],
                "account",
                "default",
                {
                    "request_id": "native-footer",
                    "prompt": "说明字段",
                    "flow": saved,
                },
            )
        )
        turn = answer["messages"][0]
        assert turn["reply"] == "核对 **text** 字段"
        assert ("proposal" in turn) is edit
        if edit:
            assert turn["proposal"]["validation"]["ok"]
            assert turn["proposal"]["flow"]["description"] == "字段说明"
        with pytest.raises(ValueError, match="JSON"):
            asyncio.run(service.create_proposal("说明字段", flow=saved))
        assert service.get_flow("one")["revision"] == 1
    finally:
        service.close(timeout=2)


def test_parallel_chats_keep_context_and_revision_checks(
    tmp_path,
):
    from qwenpaw.plugins_bundle.flowforge.flow_repository import (
        RevisionConflict,
    )

    service = WorkflowService(flows_dir=tmp_path)
    saved = service.save_flow("one", document())
    first = service.conversations.create("one", "account")
    second = service.conversations.create("one", "account")

    async def scenario():
        entered = {"input": asyncio.Event(), "output": asyncio.Event()}
        release = {"input": asyncio.Event(), "output": asyncio.Event()}
        requests = []

        class ParallelModel:
            async def complete(self, **options):
                request = json.loads(options["messages"][1].content)
                node_id = request["selected_node_ids"][0]
                requests.append(request)
                entered[node_id].set()
                await release[node_id].wait()
                flow = request["current_flow"]
                flow["nodes"][node_id]["label"] = request["instruction"]
                return SimpleNamespace(
                    content=json.dumps(
                        {"reply": request["instruction"], "flow": flow}
                    )
                )

        service.executor.llm_service = ParallelModel()

        async def send(chat, node_id, flow):
            return await service.conversations.send(
                chat["id"],
                "account",
                "default",
                {
                    "request_id": uuid4().hex,
                    "prompt": "输入方案" if node_id == "input" else "输出方案",
                    "flow": flow,
                    "selected_node_ids": [node_id],
                },
            )

        tasks = [
            asyncio.create_task(send(first, "input", saved)),
            asyncio.create_task(send(second, "output", saved)),
        ]
        try:
            await asyncio.wait_for(
                asyncio.gather(*(event.wait() for event in entered.values())),
                5,
            )
            assert all(
                service.conversations.chat(chat["id"], "account")["messages"][
                    0
                ]["status"]
                == "running"
                for chat in (first, second)
            )
            assert all(
                request["chat_context"]["messages"] == []
                for request in requests
            )
            release["output"].set()
            completed_second = await tasks[1]
            assert not tasks[0].done()
            release["input"].set()
            completed_first = await tasks[0]
            second_turn = completed_second["messages"][0]
            applied = await service.conversations.apply(
                second["id"], "account", "default", second_turn["id"], 1
            )
            assert applied["revision"] == 2
            assert applied["nodes"]["output"]["label"] == "输出方案"
            with pytest.raises(RevisionConflict):
                await service.conversations.apply(
                    first["id"],
                    "account",
                    "default",
                    completed_first["messages"][0]["id"],
                    1,
                )
            refreshed_first = await send(first, "input", applied)
            assert [
                item["assistant"]
                for item in requests[-1]["chat_context"]["messages"]
            ] == ["输入方案"]
            final = await service.conversations.apply(
                first["id"],
                "account",
                "default",
                refreshed_first["messages"][-1]["id"],
                2,
            )
            assert final["revision"] == 3
            assert final["nodes"]["input"]["label"] == "输入方案"
            assert final["nodes"]["output"]["label"] == "输出方案"
        finally:
            for event in release.values():
                event.set()
            await asyncio.gather(*tasks, return_exceptions=True)

    try:
        asyncio.run(scenario())
    finally:
        service.close(timeout=2)
