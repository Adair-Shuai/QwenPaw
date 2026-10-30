# -*- coding: utf-8 -*-
"""Real filesystem capture through runtime completion, failure and stop."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from qwenpaw.config import context
from qwenpaw.runtime.hooks import HookResult
from qwenpaw.runtime.phases import Phase
from qwenpaw.runtime.runtime import Runtime
from qwenpaw.turn_files.store import get_store


def request():
    return SimpleNamespace(
        session_id="session",
        user_id="user",
        channel="console",
        input=[
            SimpleNamespace(metadata={"qwenpaw_client_message_id": "client"}),
        ],
        request_context={},
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "outcome",
    ["completed", "failed", "canceled", "closed"],
)
async def test_native_turn_archives_real_files_on_all_exit_paths(
    tmp_path,
    monkeypatch,
    outcome,
):
    from qwenpaw.runtime import runtime as module

    project = tmp_path / "project"
    project.mkdir()
    (project / "user-draft.txt").write_text("already dirty", encoding="utf-8")
    (project / "report.txt").write_text("before", encoding="utf-8")
    workspace_dir = tmp_path / "agent"
    workspace_dir.mkdir()
    tokens = [
        (context.current_project_dirs, context.current_project_dirs.set(None)),
        (
            context.current_project_dir,
            context.current_project_dir.set(project),
        ),
        (
            context.current_workspace_dir,
            context.current_workspace_dir.set(workspace_dir),
        ),
    ]
    agent = SimpleNamespace(close=AsyncMock())

    async def hooks(phase, ctx):
        return HookResult()

    class Executor:
        def __init__(self, *_args):
            pass

        async def run(self, _messages):
            (project / "report.txt").write_text("after", encoding="utf-8")
            (project / "shell-result.txt").write_text(
                "generated",
                encoding="utf-8",
            )
            yield {"file_written": True}
            if outcome == "failed":
                raise ValueError("execution failed")
            if outcome == "canceled":
                raise asyncio.CancelledError()

    monkeypatch.setattr(
        module,
        "AgentBuilder",
        lambda **_: SimpleNamespace(build=AsyncMock(return_value=agent)),
    )
    monkeypatch.setattr(module, "AgentExecutor", Executor)
    monkeypatch.setattr(module, "record_agent_activity", AsyncMock())
    workspace = SimpleNamespace(
        workspace_dir=workspace_dir,
        agent_id="agent",
        plugins=SimpleNamespace(
            modes=[],
            hook_registry=SimpleNamespace(run=hooks),
            slash_command_registry=SimpleNamespace(
                dispatch=AsyncMock(return_value=None),
            ),
        ),
    )
    runtime = Runtime(workspace=workspace, app_services=None)
    monkeypatch.setattr(runtime, "_try_save_on_cancel", AsyncMock())
    req = request()
    req.input = []
    stream = runtime.run(req)
    try:
        if outcome == "closed":
            async for event in stream:
                if isinstance(event, dict) and event.get("file_written"):
                    break
            await stream.aclose()
        elif outcome in {"failed", "canceled"}:
            with pytest.raises(
                ValueError if outcome == "failed" else asyncio.CancelledError,
            ):
                async for _ in stream:
                    pass
        else:
            async for _ in stream:
                pass
        turns = get_store(workspace_dir).list_turns(
            session_id="session",
            user_id="user",
            channel="console",
            agent_id="agent",
        )
        assert len(turns) == 1
        assert turns[0]["status"] == (
            "canceled" if outcome == "closed" else outcome
        )
        assert {
            item["path"]: item["status"] for item in turns[0]["files"]
        } == {
            "report.txt": "modified",
            "shell-result.txt": "created",
        }
        assert turns[0]["response_id"].startswith("response_")
        agent.close.assert_awaited_once()
    finally:
        await stream.aclose()
        for var, token in reversed(tokens):
            var.reset(token)


@pytest.mark.asyncio
async def test_successful_send_freezes_delivered_bytes_before_later_overwrite(
    tmp_path,
):
    from qwenpaw.agents.tools.send_file import send_file_to_user
    from qwenpaw.turn_files.lifecycle import begin_turn_files

    tracker = await begin_turn_files(
        workspace_dir=tmp_path,
        request=request(),
        agent_id="agent",
        response_id="response_delivery",
        project_dirs=[tmp_path],
    )
    path = tmp_path / "report.txt"
    path.write_text("delivered", encoding="utf-8")
    result = await send_file_to_user(str(path))
    assert any(
        getattr(block, "type", None) == "data" for block in result.content
    )
    path.write_text("later", encoding="utf-8")
    await tracker.finish("completed")
    store = get_store(tmp_path)
    scope = dict(
        session_id="session",
        user_id="user",
        channel="console",
        agent_id="agent",
    )
    turn = store.list_turns(**scope)[0]
    delivered = next(item for item in turn["files"] if item["delivered"])
    assert (
        store.get_file(turn["id"], delivered["id"], version="after", **scope)[
            0
        ]
        == b"delivered"
    )


@pytest.mark.asyncio
async def test_repeated_cancellation_keeps_archive_task_alive(
    tmp_path,
    monkeypatch,
):
    import threading
    from qwenpaw.turn_files.lifecycle import begin_turn_files, _pending

    tracker = await begin_turn_files(
        workspace_dir=tmp_path,
        request=request(),
        agent_id="agent",
        response_id="response_cancel",
        project_dirs=[tmp_path],
    )
    (tmp_path / "result.txt").write_text("partial", encoding="utf-8")
    started, release = threading.Event(), threading.Event()
    original = tracker.store.finish

    def slow_finish(*args, **kwargs):
        started.set()
        assert release.wait(5)
        return original(*args, **kwargs)

    monkeypatch.setattr(tracker.store, "finish", slow_finish)
    task = asyncio.create_task(tracker.finish("canceled"))
    await asyncio.to_thread(started.wait, 5)
    task.cancel()
    task.cancel()
    await task
    release.set()
    await asyncio.gather(*tuple(_pending))
    turns = tracker.store.list_turns(
        session_id="session",
        user_id="user",
        channel="console",
        agent_id="agent",
    )
    assert turns[0]["status"] == "canceled"
    assert turns[0]["files"][0]["path"] == "result.txt"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "outcome",
    ["completed", "failed", "canceled", "closed"],
)
async def test_third_party_turn_has_same_durable_file_contract(
    tmp_path,
    outcome,
):
    from qwenpaw.harnesses.runtime import HarnessRuntime
    from qwenpaw.harnesses.events import HarnessEvent, HarnessEventKind
    from qwenpaw.schemas import AgentRequest, Message, TextContent

    workspace = tmp_path / "agent"
    project = tmp_path / "project"
    project.mkdir()
    runtime = HarnessRuntime(workspace, agent_id="agent")
    runtime._capability_resolver.resolve = AsyncMock(return_value={})

    async def run_turn(**_kwargs):
        try:
            (project / "external-result.txt").write_text(
                "external",
                encoding="utf-8",
            )
            yield HarnessEvent(
                kind=HarnessEventKind.TEXT_DELTA,
                text="written",
            )
            if outcome == "failed":
                raise ValueError("external failed")
            if outcome == "canceled":
                raise asyncio.CancelledError()
            yield HarnessEvent(kind=HarnessEventKind.COMPLETED)
        finally:
            await asyncio.sleep(0)
            (project / "finalized.txt").write_text(
                "cleanup done",
                encoding="utf-8",
            )

    runtime._adapters["codex"] = SimpleNamespace(run_turn=run_turn)
    req = AgentRequest(
        session_id="session",
        user_id="user",
        channel="console",
        input=[
            Message(
                role="user",
                content=[TextContent(text="create result")],
                metadata={"qwenpaw_client_message_id": "external-client"},
            ),
        ],
    )
    stream = runtime.stream(backend="codex", request=req, cwd=project)
    if outcome == "closed":
        async for _ in stream:
            if (project / "external-result.txt").exists():
                break
        await stream.aclose()
    elif outcome == "canceled":
        with pytest.raises(asyncio.CancelledError):
            async for _ in stream:
                pass
    else:
        async for _ in stream:
            pass
    store = get_store(workspace)
    turns = store.list_turns(
        session_id="session",
        user_id="user",
        channel="console",
        agent_id="agent",
    )
    assert len(turns) == 1
    turn = turns[0]
    assert turn["status"] == ("canceled" if outcome == "closed" else outcome)
    assert turn["client_message_id"] == "external-client"
    assert {file["path"] for file in turn["files"]} == {
        "external-result.txt",
        "finalized.txt",
    }
    assert (
        store.get_file(
            turn["id"],
            turn["files"][0]["id"],
            session_id="session",
        )[0]
        == b"external"
    )


@pytest.mark.asyncio
async def test_harness_captures_bound_additional_project_roots(
    tmp_path,
    monkeypatch,
):
    from qwenpaw.harnesses.runtime import HarnessRuntime
    from qwenpaw.config import config

    workspace_dir = tmp_path / "agent"
    primary, extra = tmp_path / "primary", tmp_path / "extra"
    primary.mkdir()
    extra.mkdir()
    manager = SimpleNamespace(
        get_chat_id_by_session=AsyncMock(return_value="chat"),
        get_chat=AsyncMock(
            return_value=SimpleNamespace(
                meta={
                    "runtime_context": {
                        "project_dirs": [str(primary), str(extra)],
                    },
                },
            ),
        ),
    )
    monkeypatch.setattr(
        config,
        "load_agent_config",
        lambda _id: SimpleNamespace(project_dirs=[], project_dir=None),
    )
    runtime = HarnessRuntime(
        workspace_dir,
        workspace=SimpleNamespace(chat_manager=manager),
    )
    roots, warning = await runtime._file_capture_dirs(request(), workspace_dir)
    assert set(roots) == {primary, extra, workspace_dir}
    assert warning is None
    manager.get_chat.side_effect = OSError("offline")
    roots, warning = await runtime._file_capture_dirs(request(), workspace_dir)
    assert roots == [workspace_dir]
    assert warning is not None


@pytest.mark.asyncio
async def test_capture_storage_failure_does_not_abort_the_agent(
    tmp_path,
    monkeypatch,
):
    from qwenpaw.turn_files import store
    from qwenpaw.turn_files.lifecycle import begin_turn_files

    def fail(_path):
        raise OSError("archive storage unavailable")

    monkeypatch.setattr(store, "get_store", fail)
    assert (
        await begin_turn_files(
            workspace_dir=tmp_path,
            request=request(),
            agent_id="agent",
            response_id="response-unavailable",
            project_dirs=[tmp_path],
        )
        is None
    )
