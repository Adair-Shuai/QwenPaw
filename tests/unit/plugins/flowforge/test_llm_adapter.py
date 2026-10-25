"""Exercise the real AgentScope streaming contract at the provider boundary."""

import asyncio
import json
from types import SimpleNamespace

import pytest
from agentscope.message import TextBlock, ThinkingBlock
from agentscope.model import (
    ChatModelBase,
    ChatResponse,
    ChatUsage,
    FinishedReason,
)

from qwenpaw.plugins_bundle.flowforge.engine.adapter.chat_message import (
    ChatMessage,
)
from qwenpaw.plugins_bundle.flowforge.engine.adapter.llm_service import (
    LLMService,
)


class HostProtocolModel(ChatModelBase):
    """Only transport is deterministic; the SDK accumulates its real deltas."""

    def __init__(self, factory):
        super().__init__(
            credential=SimpleNamespace(id="fixture"),
            model="fixture-model",
            parameters=self.Parameters(),
            stream=True,
            max_retries=0,
        )
        self.factory = factory
        self.calls = 0

    async def _call_api(self, model_name, messages, **kwargs):
        self.calls += 1
        assert messages[-1].role == "user"
        return self.factory()


def service(model):
    provider = SimpleNamespace(get_chat_model_instance=lambda _: model)
    manager = SimpleNamespace(
        get_provider=lambda _: provider,
        get_active_model=lambda: SimpleNamespace(
            provider_id="fixture", model="fixture-model"
        ),
    )
    return LLMService(manager)


def delta(text):
    return ChatResponse(
        content=[TextBlock(id="body", text=text)], is_last=False
    )


@pytest.mark.asyncio
async def test_host_sdk_stream_returns_final_accumulated_json_once():
    async def transport():
        yield delta('{"answer":')
        yield delta("42}")
        # Usage-only chunks are absorbed by the host accumulator.
        yield ChatResponse(
            content=[],
            is_last=False,
            usage=ChatUsage(input_tokens=7, output_tokens=5, time=0.1),
        )

    model = HostProtocolModel(transport)
    result = await service(model).complete(
        messages=[ChatMessage.user("calculate")]
    )

    assert result.content == '{"answer":42}'
    assert json.loads(result.content) == {"answer": 42}
    assert result.raw.is_last is True
    assert result.usage["input_tokens"] == 7
    assert result.usage["output_tokens"] == 5
    assert (result.provider, result.model) == ("fixture", "fixture-model")
    assert model.calls == 1


@pytest.mark.asyncio
async def test_terminal_response_is_authoritative_and_stream_is_closed():
    closed = []

    async def transport():
        try:
            yield delta("partial")
            yield delta("partial cumulative preview")
            yield ChatResponse(
                content=[
                    ThinkingBlock(thinking="private reasoning"),
                    TextBlock(text="final"),
                ],
                is_last=True,
            )
        finally:
            closed.append(True)

    result = await service(HostProtocolModel(transport)).complete(
        messages=[ChatMessage.user("summarize")],
    )
    assert result.content == "final"
    assert closed == [True]


@pytest.mark.asyncio
async def test_provider_type_error_is_not_reinvoked_or_stringified():
    model = HostProtocolModel(
        lambda: (_ for _ in ()).throw(TypeError("provider failed"))
    )
    with pytest.raises(TypeError, match="provider failed"):
        await service(model).complete(messages=[ChatMessage.user("test")])
    assert model.calls == 1


@pytest.mark.asyncio
async def test_stream_error_discards_partial_text_and_closes_transport():
    closed = []

    async def transport():
        try:
            yield delta("partial answer")
            raise ConnectionError("transport failed")
        finally:
            closed.append(True)

    model = HostProtocolModel(transport)
    with pytest.raises(ConnectionError, match="transport failed"):
        await service(model).complete(messages=[ChatMessage.user("test")])
    assert closed == [True]
    assert model.calls == 1


@pytest.mark.asyncio
async def test_sdk_swallowed_cancellation_remains_cancellation():
    started, closed = asyncio.Event(), asyncio.Event()

    async def transport():
        try:
            yield delta("partial answer")
            started.set()
            await asyncio.Event().wait()
        finally:
            closed.set()

    task = asyncio.create_task(
        service(HostProtocolModel(transport)).complete(
            messages=[ChatMessage.user("test")],
        )
    )
    await asyncio.wait_for(started.wait(), 1)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert closed.is_set()


@pytest.mark.asyncio
async def test_authoring_timeout_is_not_converted_to_partial_success():
    closed = []

    async def transport():
        try:
            yield delta("partial answer")
            await asyncio.Event().wait()
        finally:
            closed.append(True)

    with pytest.raises(TimeoutError):
        await asyncio.wait_for(
            service(HostProtocolModel(transport)).complete(
                messages=[ChatMessage.user("test")]
            ),
            timeout=0.03,
        )
    assert closed == [True]


@pytest.mark.asyncio
async def test_explicit_interrupted_terminal_response_cannot_succeed():
    model = HostProtocolModel(
        lambda: ChatResponse(
            content=[TextBlock(text="incomplete")],
            is_last=True,
            finished_reason=FinishedReason.INTERRUPTED,
        )
    )
    with pytest.raises(asyncio.CancelledError):
        await service(model).complete(messages=[ChatMessage.user("test")])


@pytest.mark.asyncio
async def test_stream_without_terminal_response_is_not_accepted():
    async def incomplete():
        yield delta("only a prefix")

    # An adapter outside ChatModelBase must not mark partial text final.
    model = lambda *args, **kwargs: incomplete()
    with pytest.raises(RuntimeError, match="without a complete response"):
        await service(model).complete(messages=[ChatMessage.user("test")])


@pytest.mark.asyncio
async def test_structured_failure_is_not_a_successful_text_response():
    model = lambda *args, **kwargs: {"content": "partial", "status": "failed"}
    with pytest.raises(RuntimeError, match="completion failed"):
        await service(model).complete(messages=[ChatMessage.user("test")])


@pytest.mark.asyncio
async def test_nonstreaming_response_preserves_text_without_calling_twice():
    calls = []

    def model(*args, **kwargs):
        calls.append(True)
        return {
            "content": [
                {"type": "text", "text": "hello "},
                {"type": "text", "text": "world"},
            ]
        }

    result = await service(model).complete(messages=[ChatMessage.user("test")])
    assert result.content == "hello world"
    assert calls == [True]


@pytest.mark.asyncio
async def test_workflow_proposal_uses_real_host_streaming_adapter(tmp_path):
    from qwenpaw.plugins_bundle.flowforge.service import WorkflowService

    document = {
        "nodes": {
            "output": {"class_type": "OutputNode", "inputs": {"value": "done"}}
        },
        "outputs": ["output"],
    }
    text = json.dumps({"flow": document, "warnings": []})

    async def transport():
        midpoint = len(text) // 2
        yield delta(text[:midpoint])
        yield delta(text[midpoint:])

    workflow_service = WorkflowService(flows_dir=tmp_path)
    workflow_service.executor.llm_service = service(
        HostProtocolModel(transport)
    )
    try:
        proposal = await workflow_service.create_proposal("输出done")
        assert proposal["validation"]["ok"], proposal["validation"]
        assert proposal["flow"]["nodes"]["output"]["inputs"]["value"] == "done"
        assert workflow_service.list_flows() == []
        assert workflow_service.list_runs() == []
    finally:
        workflow_service._loop.call_soon_threadsafe(
            workflow_service._loop.stop
        )
        workflow_service._loop_thread.join(timeout=3)
