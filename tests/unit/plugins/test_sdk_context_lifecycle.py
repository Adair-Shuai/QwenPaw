# -*- coding: utf-8 -*-
# pylint: disable=redefined-outer-name
"""Bound model services retain both caller and provider resource ownership."""

import asyncio
import threading
import time
import json

import pytest

from .timing import WAIT_TIMEOUT


def package(root, plugin_id, source, capabilities):
    root.mkdir()
    (root / "plugin.json").write_text(
        json.dumps(
            {
                "id": plugin_id,
                "version": "1.0.0",
                "entry": {"backend": "main.py"},
                "sdk": {"version": "1.0", "capabilities": capabilities},
            },
        ),
    )
    (root / "main.py").write_text(source)
    return root


ASYNC_PROVIDER = """
import asyncio
from qwenpaw.plugins.messages import ContentBlock
from qwenpaw.plugins.providers import (
    ProviderSpec,
    ModelInfo,
    ModelChunk,
)


class Plugin:
    def register(self, ctx):
        async def generate(call, request):
            ctx.storage.write_json("entered.json", True)
            try:
                yield ModelChunk((ContentBlock(text="first"),))
                while not ctx.storage.read_json(
                    "release.json", False
                ):
                    await asyncio.sleep(0.01)
                yield ModelChunk(
                    (ContentBlock(text="last"),), is_last=True
                )
            finally:
                ctx.storage.write_json("provider-closed.json", True)

        ctx.register_provider(
            ProviderSpec(
                "bound-provider",
                "Bound",
                generate,
                models=(ModelInfo("bound-model", "Bound"),),
                require_api_key=False,
            )
        )


plugin = Plugin()
"""

CALLER = """
from qwenpaw.plugins.messages import ContentBlock, Message
from qwenpaw.plugins.tools import ToolSpec, ToolEvent, ToolResult

saved = None


class Plugin:
    def register(self, ctx):
        async def streaming(call, args):
            stream = call.models.stream(
                (Message("user", (ContentBlock(text="hold"),)),)
            )
            try:
                async for chunk in stream:
                    if chunk.content:
                        yield ToolEvent("delta", chunk.content)
            finally:
                await stream.aclose()
                ctx.storage.write_json("caller-closed.json", True)

        async def complete(call, args):
            result = await call.models.complete(
                (Message("user", (ContentBlock(text="hold"),)),)
            )
            return ToolResult(result.content)

        async def capture(call, args):
            global saved
            saved = call
            return ToolResult.text("captured")

        async def reuse(call, args):
            result = await saved.models.complete(
                (
                    Message(
                        "user", (ContentBlock(text="must not run"),)
                    ),
                )
            )
            return ToolResult(result.content)

        for name, handler in (
            ("bound_stream", streaming),
            ("bound_complete", complete),
            ("bound_capture", capture),
            ("bound_reuse", reuse),
        ):
            ctx.register_tool(
                ToolSpec(
                    name,
                    name,
                    {"type": "object"},
                    handler,
                    enabled=True,
                )
            )


plugin = Plugin()
"""


SYNC_PROVIDER = """
import time
from qwenpaw.plugins.messages import ContentBlock
from qwenpaw.plugins.providers import (
    ProviderSpec,
    ModelInfo,
    ModelChunk,
)


class Plugin:
    def register(self, ctx):
        def generate(call, request):
            ctx.storage.write_json("entered.json", True)
            try:
                while not ctx.storage.read_json(
                    "release.json", False
                ):
                    if call.cancelled:
                        ctx.storage.write_json(
                            "cancel-seen.json", True
                        )
                    time.sleep(0.01)
                return ModelChunk(
                    (ContentBlock(text="released"),), is_last=True
                )
            finally:
                ctx.storage.write_json("provider-closed.json", True)

        ctx.register_provider(
            ProviderSpec(
                "bound-provider",
                "Bound",
                generate,
                models=(ModelInfo("bound-model", "Bound"),),
                require_api_key=False,
            )
        )


plugin = Plugin()
"""


async def until(predicate):
    async with asyncio.timeout(WAIT_TIMEOUT):
        while not predicate():
            await asyncio.sleep(0.01)


async def load_pair(
    host,
    tmp_path,
    provider_source=ASYNC_PROVIDER,
    caller_source=CALLER,
):
    provider = await host.load(
        package(
            tmp_path / "provider",
            "bound-provider-owner",
            provider_source,
            ["providers", "storage"],
        ),
    )
    caller = await host.load(
        package(
            tmp_path / "caller",
            "bound-caller-owner",
            caller_source,
            ["tools", "storage"],
        ),
    )
    await host.configure_chat_model(
        "bound-provider",
        "bound-model",
        workspace_id="bound",
    )
    return provider, caller


async def test_context_model_cancel_waits_for_actual_sync_provider_worker(
    tmp_path,
):
    from qwenpaw.plugins import PluginBusyError
    from qwenpaw.plugins.testing import PluginTestHost

    async with PluginTestHost(tmp_path / "host") as host:
        provider, _ = await load_pair(host, tmp_path, SYNC_PROVIDER)
        task = asyncio.create_task(
            host.call_tool(
                "bound_complete",
                {},
                workspace_id="bound",
                session_id="sync",
            ),
        )
        try:
            await until(
                lambda: provider.storage.read_json("entered.json", False),
            )
            task.cancel()
            await until(
                lambda: provider.storage.read_json("cancel-seen.json", False),
            )
            assert (
                not task.done()
            ), "Cancelled caller returned while provider worker was still live"
            for owner in ("bound-caller-owner", "bound-provider-owner"):
                assert host.resource_snapshot(owner)["active_calls"] > 0
                with pytest.raises(PluginBusyError):
                    await host.reload(owner)
        finally:
            provider.storage.write_json("release.json", True)
            with pytest.raises(asyncio.CancelledError):
                await asyncio.wait_for(task, WAIT_TIMEOUT)
        assert provider.storage.read_json("provider-closed.json") is True
        for owner in ("bound-caller-owner", "bound-provider-owner"):
            assert host.resource_snapshot(owner)["active_calls"] == 0
            assert (await host.reload(owner)).ok


CAPTURE_CALLER = """
from qwenpaw.plugins.messages import ContentBlock, Message
from qwenpaw.plugins.tools import ToolSpec, ToolEvent, ToolResult

saved = None


class Plugin:
    def register(self, ctx):
        async def streaming(call, args):
            stream = call.models.stream(
                (Message("user", (ContentBlock(text="hold"),)),)
            )
            try:
                async for chunk in stream:
                    if chunk.content:
                        yield ToolEvent("delta", chunk.content)
            finally:
                await stream.aclose()
                ctx.storage.write_json("caller-closed.json", True)

        async def complete(call, args):
            result = await call.models.complete(
                (Message("user", (ContentBlock(text="hold"),)),)
            )
            return ToolResult(result.content)

        async def capture(call, args):
            global saved
            saved = call
            return ToolResult.text("captured")

        async def reuse(call, args):
            result = await saved.models.complete(
                (
                    Message(
                        "user", (ContentBlock(text="must not run"),)
                    ),
                )
            )
            return ToolResult(result.content)

        for name, handler in (
            ("bound_stream", streaming),
            ("bound_complete", complete),
            ("bound_capture", capture),
            ("bound_reuse", reuse),
        ):
            ctx.register_tool(
                ToolSpec(
                    name,
                    name,
                    {"type": "object"},
                    handler,
                    enabled=True,
                )
            )


plugin = Plugin()
"""


async def test_finished_call_context_cannot_start_another_model_invocation(
    tmp_path,
):
    from qwenpaw.plugins import StaleContextError
    from qwenpaw.plugins.testing import PluginTestHost

    async with PluginTestHost(tmp_path / "host") as host:
        provider, caller = await load_pair(
            host,
            tmp_path,
            ASYNC_PROVIDER,
            CAPTURE_CALLER,
        )
        assert not hasattr(
            caller,
            "models",
        ), "Top-level plugin context has no workspace"
        await host.call_tool(
            "bound_capture",
            {},
            workspace_id="bound",
            session_id="old",
        )
        with pytest.raises(StaleContextError):
            await host.call_tool(
                "bound_reuse",
                {},
                workspace_id="bound",
                session_id="new",
            )
        assert provider.storage.read_json("entered.json", False) is False


def _deadline_provider_source():
    return ASYNC_PROVIDER.replace(
        '            ctx.storage.write_json("entered.json", True)',
        """            measured_at = asyncio.get_running_loop().time()
            remaining = (
                call.deadline - measured_at
                if call.deadline is not None else None
            )
            ctx.storage.write_json("entered.json", True)
            ctx.storage.write_json(
                "deadline.json", {
                    "remaining": remaining,
                    "deadline": call.deadline,
                    "measured_at": measured_at,
                },
            )""",
    )


def _deadline_caller_source(tool_timeout, model_timeout):
    return f"""
from qwenpaw.plugins.messages import ContentBlock, Message
from qwenpaw.plugins.tools import ToolSpec, ToolResult
class Plugin:
    def register(self, ctx):
        async def complete(call, args):
            result = await call.models.complete(
                (Message("user", (ContentBlock(text="hold"),)),),
                timeout={model_timeout!r},
            )
            return ToolResult(result.content)
        async def warm(call, args):
            result = await call.models.complete(
                (Message("user", (ContentBlock(text="warm"),)),),
                timeout=2.0,
            )
            return ToolResult(result.content)
        ctx.register_tool(ToolSpec(
            "bound_warm", "warm", {{"type": "object"}}, warm,
            enabled=True, timeout=2.0,
        ))
        ctx.register_tool(ToolSpec(
            "bound_deadline", "deadline", {{"type": "object"}}, complete,
            enabled=True, timeout={tool_timeout!r},
        ))
plugin = Plugin()
"""


async def _warm_deadline_route(host, provider):
    # Exercise the real workspace, governed tool, configured model and provider
    # before measuring its in-flight deadline. Cold construction is verified
    # separately with a controlled slow production factory.
    provider.storage.write_json("release.json", True)
    result = await host.call_tool("bound_warm", {}, workspace_id="bound")
    assert "".join(block.text or "" for block in result.content) == "firstlast"
    assert provider.storage.read_json("provider-closed.json") is True
    # No warm-up marker may satisfy an assertion for the measured request.
    provider.storage.write_json("release.json", False)
    provider.storage.write_json("entered.json", False)
    provider.storage.write_json("provider-closed.json", False)
    provider.storage.write_json("deadline.json", None)


@pytest.mark.parametrize(
    "tool_timeout, model_timeout",
    [(300.0, 60.0), (60.0, 300.0)],
)
async def test_bound_model_uses_earliest_deadline(
    tmp_path,
    monkeypatch,
    tool_timeout,
    model_timeout,
):
    from qwenpaw.plugins.testing import PluginTestHost

    # Compare absolute deadlines; disk speed must not decide this test.
    # Cancellation and owner cleanup have separate lifecycle tests.
    # pylint: disable=protected-access
    provider_source = ASYNC_PROVIDER.replace(
        'ctx.storage.write_json("entered.json", True)',
        'ctx.storage.write_json("deadline.json", call.deadline)',
    )
    caller_source = f"""
import asyncio
from qwenpaw.plugins.messages import ContentBlock, Message
from qwenpaw.plugins.tools import ToolSpec, ToolResult
class Plugin:
    def register(self, ctx):
        async def complete(call, args):
            started = asyncio.get_running_loop().time()
            result = await call.models.complete(
                (Message("user", (ContentBlock(text="hold"),)),),
                timeout={model_timeout!r},
            )
            return ToolResult(result.content, metadata={{
                "parent_deadline": call.deadline,
                "started": started,
                "finished": asyncio.get_running_loop().time(),
            }})
        ctx.register_tool(ToolSpec(
            "bound_deadline", "deadline", {{"type": "object"}}, complete,
            enabled=True, timeout={tool_timeout!r},
        ))
plugin = Plugin()
"""
    async with PluginTestHost(tmp_path / "host") as host:
        provider = await host.load(
            package(
                tmp_path / "provider",
                "deadline-provider",
                provider_source,
                ["providers", "storage"],
            ),
        )
        caller = await host.load(
            package(
                tmp_path / "caller",
                "deadline-caller",
                caller_source,
                ["tools"],
            ),
        )
        deadlines = []
        managed_stream = caller._managed_stream

        def observe_deadline(factory, label, **kwargs):
            if label == "configured model request":
                deadlines.append(kwargs.get("deadline"))
            return managed_stream(factory, label, **kwargs)

        monkeypatch.setattr(caller, "_managed_stream", observe_deadline)
        await host.configure_chat_model(
            "bound-provider",
            "bound-model",
            workspace_id="bound",
        )
        provider.storage.write_json("release.json", True)
        result = await asyncio.wait_for(
            host.call_tool("bound_deadline", {}, workspace_id="bound"),
            WAIT_TIMEOUT,
        )
        deadline = provider.storage.read_json("deadline.json")
        parent = result.metadata["parent_deadline"]
        assert deadlines == [deadline]
        assert deadline is not None and parent is not None
        assert (
            min(parent, result.metadata["started"] + model_timeout) <= deadline
        )
        assert deadline <= min(
            parent,
            result.metadata["finished"] + model_timeout,
        )
        assert provider.storage.read_json("provider-closed.json") is True
        for owner in ("deadline-provider", "deadline-caller"):
            assert host.resource_snapshot(owner)["active_calls"] == 0
            assert (await host.reload(owner)).ok


@pytest.mark.parametrize(
    "tool_timeout, model_timeout",
    [(2.0, 0.08), (0.08, 2.0)],
)
async def test_deadline_during_model_build_releases_without_provider_call(
    tmp_path,
    monkeypatch,
    tool_timeout,
    model_timeout,
):
    from qwenpaw.agents import model_factory
    from qwenpaw.plugins import SDKError
    from qwenpaw.plugins.testing import PluginTestHost

    async with PluginTestHost(tmp_path / "host") as host:
        provider = await host.load(
            package(
                tmp_path / "provider",
                "deadline-provider",
                _deadline_provider_source(),
                ["providers", "storage"],
            ),
        )
        await host.load(
            package(
                tmp_path / "caller",
                "deadline-caller",
                _deadline_caller_source(tool_timeout, model_timeout),
                ["tools"],
            ),
        )
        await host.configure_chat_model(
            "bound-provider",
            "bound-model",
            workspace_id="bound",
        )
        await _warm_deadline_route(host, provider)
        started, finished = threading.Event(), threading.Event()
        original = model_factory.create_model_and_formatter

        def slow_build(*args, **kwargs):
            started.set()
            try:
                # Only construction latency is controlled. The actual factory,
                # model wrappers, caller custody and provider all remain real.
                time.sleep(0.12)
                return original(*args, **kwargs)
            finally:
                finished.set()

        with monkeypatch.context() as patch:
            patch.setattr(
                model_factory,
                "create_model_and_formatter",
                slow_build,
            )
            with pytest.raises(SDKError, match="deadline"):
                await host.call_tool(
                    "bound_deadline",
                    {},
                    workspace_id="bound",
                )
        # An uninterruptible construction thread must finish before ownership
        # is released, but an expired request must never enter the provider.
        assert started.is_set()
        assert finished.is_set()
        assert provider.storage.read_json("entered.json") is False
        assert provider.storage.read_json("deadline.json") is None
        assert provider.storage.read_json("provider-closed.json") is False
        for owner in ("deadline-provider", "deadline-caller"):
            assert host.resource_snapshot(owner)["active_calls"] == 0
            assert (await host.reload(owner)).ok


async def test_failed_model_scope_cleanup_keeps_ownership_until_retry(
    tmp_path,
):
    from qwenpaw.plugins import PluginBusyError
    from qwenpaw.plugins.testing import PluginTestHost

    provider_source = """
from qwenpaw.plugins.messages import ContentBlock
from qwenpaw.plugins.providers import (
    ProviderSpec,
    ModelInfo,
    ModelChunk,
)


class Plugin:
    def register(self, ctx):
        async def generate(call, request):
            async def cleanup():
                ctx.storage.write_json(
                    "cleanup-attempts.json",
                    ctx.storage.read_json(
                        "cleanup-attempts.json", 0
                    )
                    + 1,
                )
                call.logger.info(
                    "model-cleanup-log", fields={"phase": "cleanup"}
                )
                if not ctx.storage.read_json(
                    "allow-close.json", False
                ):
                    raise RuntimeError("model cleanup refused")
                ctx.storage.write_json(
                    "cleanup-finished.json", True
                )

            call.resources.defer(cleanup, "model-owned-cleanup")
            yield ModelChunk(
                (ContentBlock(text="result"),), is_last=True
            )

        ctx.register_provider(
            ProviderSpec(
                "bound-provider",
                "Bound",
                generate,
                models=(ModelInfo("bound-model", "Bound"),),
                require_api_key=False,
            )
        )


plugin = Plugin()
"""
    async with PluginTestHost(tmp_path / "host") as host:
        provider, _ = await load_pair(host, tmp_path, provider_source)
        task = asyncio.create_task(
            host.call_tool("bound_complete", {}, workspace_id="bound"),
        )
        try:
            await until(
                lambda: provider.storage.read_json("cleanup-attempts.json", 0)
                > 0,
            )
            assert (
                provider.storage.read_json("cleanup-finished.json", False)
                is False
            )
            assert host.resource_snapshot("bound-provider-owner")["resources"]
            assert (
                not task.done()
            ), "Cleanup failure must not release the live model owner"
            for owner in ("bound-provider-owner", "bound-caller-owner"):
                try:
                    report = await host.reload(owner)
                except PluginBusyError:
                    pass
                else:
                    assert (
                        not report.ok
                    ), "Failed owned cleanup must block replacement"
        finally:
            provider.storage.write_json("allow-close.json", True)
            task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await asyncio.wait_for(task, WAIT_TIMEOUT)
        assert provider.storage.read_json("cleanup-finished.json") is True
        for owner in ("bound-caller-owner", "bound-provider-owner"):
            assert host.resource_snapshot(owner)["active_calls"] == 0
            assert (await host.reload(owner)).ok


@pytest.mark.parametrize(
    "tool_timeout, model_timeout",
    [(2.0, 0.08), (0.08, 2.0)],
)
async def test_bound_model_uses_earliest_deadline_and_closes_provider(
    tmp_path,
    tool_timeout,
    model_timeout,
):
    from qwenpaw.plugins import SDKError
    from qwenpaw.plugins.testing import PluginTestHost

    provider_source = _deadline_provider_source()
    caller_source = _deadline_caller_source(tool_timeout, model_timeout)
    async with PluginTestHost(tmp_path / "host") as host:
        provider = await host.load(
            package(
                tmp_path / "provider",
                "deadline-provider",
                provider_source,
                ["providers", "storage"],
            ),
        )
        await host.load(
            package(
                tmp_path / "caller",
                "deadline-caller",
                caller_source,
                ["tools"],
            ),
        )
        await host.configure_chat_model(
            "bound-provider",
            "bound-model",
            workspace_id="bound",
        )
        await _warm_deadline_route(host, provider)
        with pytest.raises(SDKError, match="deadline"):
            await host.call_tool("bound_deadline", {}, workspace_id="bound")
        measured = provider.storage.read_json("deadline.json")
        remaining = measured["remaining"]
        assert remaining is not None and 0 < remaining
        # Compare absolute monotonic timestamps. Subtracting two large clock
        # values can turn exactly 80ms into 0.08000000000004093 on Windows.
        # Keep the real 80ms deadline and both provider-entry/closure guards.
        assert measured["deadline"] <= measured["measured_at"] + min(
            tool_timeout,
            model_timeout,
        )
        assert provider.storage.read_json("provider-closed.json") is True
        for owner in ("deadline-provider", "deadline-caller"):
            assert host.resource_snapshot(owner)["active_calls"] == 0
            assert (await host.reload(owner)).ok
