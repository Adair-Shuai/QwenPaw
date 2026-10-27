# -*- coding: utf-8 -*-
"""Public persistent storage and configuration boundaries."""

import errno
import json
import os
import threading
from concurrent.futures import (
    ThreadPoolExecutor,
    TimeoutError as FutureTimeout,
)
from pathlib import Path
from types import SimpleNamespace
from urllib.parse import urlparse
from urllib.request import url2pathname

import pytest


@pytest.mark.parametrize("failures", [2, 7])
def test_storage_read_retries_windows_crt_access_error_without_losing_state(
    tmp_path,
    monkeypatch,
    failures,
):
    from qwenpaw.plugins import storage

    path = tmp_path / "state.bin"
    path.write_bytes(b"complete state")
    attempts = []

    class LockedPath(type(tmp_path)):
        def read_bytes(self):
            attempts.append(True)
            if len(attempts) <= failures:
                raise PermissionError(errno.EACCES, "Windows CRT reader lock")
            return super().read_bytes()

    owned = storage.PluginStorage(tmp_path, lambda: None)
    monkeypatch.setattr(owned, "_path", lambda _name: LockedPath(path))
    monkeypatch.setattr(
        storage,
        "os",
        SimpleNamespace(**{**vars(os), "name": "nt"}),
    )
    monkeypatch.setattr(storage, "time", SimpleNamespace(sleep=lambda _: None))
    if failures == 2:
        assert owned.read_bytes("state.bin") == b"complete state"
        assert len(attempts) == 3
    else:
        with pytest.raises(PermissionError, match="Windows CRT reader lock"):
            owned.read_bytes("state.bin")
        assert len(attempts) == 7
    assert path.read_bytes() == b"complete state"
    assert list(tmp_path.iterdir()) == [path]


@pytest.mark.parametrize("operation", ["write", "delete"])
def test_storage_mutation_waits_for_other_instances_open_reader(
    tmp_path,
    monkeypatch,
    operation,
):
    from qwenpaw.plugins import storage

    path = tmp_path / "state.bin"
    path.write_bytes(b"old complete state")
    opened = threading.Event()
    release = threading.Event()
    synced = threading.Event()
    started = threading.Event()
    real_fsync = os.fsync

    class HeldPath(type(tmp_path)):
        def read_bytes(self):
            with self.open("rb") as stream:
                opened.set()
                if not release.wait(5):
                    raise TimeoutError("Reader release was not signalled")
                return stream.read()

    def fsync(handle):
        real_fsync(handle)
        synced.set()

    reader = storage.PluginStorage(tmp_path, lambda: None)
    writer = storage.PluginStorage(tmp_path, lambda: None)
    monkeypatch.setattr(reader, "_path", lambda _name: HeldPath(path))
    monkeypatch.setattr(
        storage,
        "os",
        SimpleNamespace(**{**vars(os), "fsync": fsync}),
    )

    def mutate():
        started.set()
        if operation == "write":
            writer.write_bytes("state.bin", b"new complete state")
        else:
            writer.delete("state.bin")

    with ThreadPoolExecutor(max_workers=2) as pool:
        reading = pool.submit(reader.read_bytes, "state.bin")
        writing = None
        try:
            assert opened.wait(3)
            writing = pool.submit(mutate)
            assert started.wait(3)
            if operation == "write":
                assert synced.wait(3)
            # A real open file remains under reader custody. Publication must
            # wait, including on POSIX where rename would otherwise succeed.
            with pytest.raises(FutureTimeout):
                writing.result(timeout=1)
        finally:
            release.set()
        assert reading.result(timeout=3) == b"old complete state"
        assert writing is not None
        writing.result(timeout=3)
    if operation == "write":
        assert path.read_bytes() == b"new complete state"
        assert list(tmp_path.iterdir()) == [path]
    else:
        assert not path.exists()
        assert not list(tmp_path.iterdir())


@pytest.mark.parametrize("winerror", [5, 32])
def test_storage_retries_transient_windows_replace_without_partial_publication(
    tmp_path,
    monkeypatch,
    winerror,
):
    from qwenpaw.plugins import storage

    path = tmp_path / "state.bin"
    path.write_bytes(b"old")
    attempts = []
    real_replace = os.replace

    def replace(source, destination):
        assert Path(source).read_bytes() == b"new\x00payload"
        assert path.read_bytes() == b"old"
        attempts.append(source)
        if len(attempts) < 3:
            error = PermissionError("transient Windows reader lock")
            error.winerror = winerror
            raise error
        real_replace(source, destination)

    monkeypatch.setattr(
        storage,
        "os",
        SimpleNamespace(**{**vars(os), "replace": replace}),
    )
    monkeypatch.setattr(storage, "time", SimpleNamespace(sleep=lambda _: None))
    owned = storage.PluginStorage(tmp_path, lambda: None)
    owned.write_bytes("state.bin", b"new\x00payload")
    assert len(attempts) == 3
    assert path.read_bytes() == b"new\x00payload"
    assert list(tmp_path.iterdir()) == [path]


@pytest.mark.parametrize("winerror,attempts_expected", [(None, 1), (5, 7)])
def test_storage_failed_replace_preserves_bytes_and_removes_temporary_file(
    tmp_path,
    monkeypatch,
    winerror,
    attempts_expected,
):
    from qwenpaw.plugins import storage

    path = tmp_path / "state.bin"
    path.write_bytes(b"retained")
    attempts = []

    def replace(source, _destination):
        attempts.append(source)
        error = PermissionError("persistent access failure")
        if winerror is not None:
            error.winerror = winerror
        raise error

    monkeypatch.setattr(
        storage,
        "os",
        SimpleNamespace(**{**vars(os), "replace": replace}),
    )
    monkeypatch.setattr(storage, "time", SimpleNamespace(sleep=lambda _: None))
    owned = storage.PluginStorage(tmp_path, lambda: None)
    with pytest.raises(PermissionError, match="persistent access failure"):
        owned.write_bytes("state.bin", b"must not publish")
    assert len(attempts) == attempts_expected
    assert path.read_bytes() == b"retained"
    assert list(tmp_path.iterdir()) == [path]


def test_storage_retry_rechecks_generation_before_publication(
    tmp_path,
    monkeypatch,
):
    from qwenpaw.plugins import StaleContextError, storage

    path = tmp_path / "state.bin"
    path.write_bytes(b"retained")
    valid, attempts = True, []

    def guard():
        if not valid:
            raise StaleContextError("generation ended during retry")

    def replace(source, _destination):
        nonlocal valid
        attempts.append(source)
        valid = False
        error = PermissionError("temporary Windows lock")
        error.winerror = 32
        raise error

    monkeypatch.setattr(
        storage,
        "os",
        SimpleNamespace(**{**vars(os), "replace": replace}),
    )
    monkeypatch.setattr(storage, "time", SimpleNamespace(sleep=lambda _: None))
    owned = storage.PluginStorage(tmp_path, guard)
    with pytest.raises(StaleContextError, match="generation ended"):
        owned.write_bytes("state.bin", b"stale bytes")
    assert len(attempts) == 1
    assert path.read_bytes() == b"retained"
    assert list(tmp_path.iterdir()) == [path]


def make_plugin(tmp_path):
    root = tmp_path / "storage-plugin"
    root.mkdir()
    (root / "plugin.json").write_text(
        json.dumps(
            {
                "id": "storage-contract",
                "version": "1.0.0",
                "entry": {"backend": "main.py"},
                "sdk": {
                    "version": "1.0",
                    "capabilities": ["storage", "config"],
                    "secrets": ["token"],
                },
            },
        ),
        encoding="utf-8",
    )
    (root / "main.py").write_text(
        """
class Plugin:
    def register(self, ctx):
        pass


plugin = Plugin()
""",
        encoding="utf-8",
    )
    return root


async def test_reload_preserves_data_and_rejects_old_generation_writes(
    tmp_path,
):
    from qwenpaw.plugins import StaleContextError
    from qwenpaw.plugins.testing import PluginTestHost

    async with PluginTestHost(tmp_path / "host") as host:
        old = await host.load(make_plugin(tmp_path))
        old.storage.write_json("nested/state.json", {"value": "retained"})
        assert (await host.reload("storage-contract")).ok
        current = host.context("storage-contract")
        assert current.storage.read_json("nested/state.json") == {
            "value": "retained",
        }
        with pytest.raises(StaleContextError):
            old.storage.write_json("nested/state.json", {"value": "stale"})
        with pytest.raises(StaleContextError):
            old.storage.delete("nested/state.json")
        assert current.storage.read_json("nested/state.json") == {
            "value": "retained",
        }


async def test_storage_rejects_path_escape_without_touching_other_files(
    tmp_path,
):
    from qwenpaw.plugins import SDKError
    from qwenpaw.plugins.testing import PluginTestHost

    outside = tmp_path / "outside.json"
    outside.write_text("untouched", encoding="utf-8")
    async with PluginTestHost(tmp_path / "host") as host:
        ctx = await host.load(make_plugin(tmp_path))
        for name in (
            str(outside),
            "../outside.json",
            "nested/../../outside.json",
        ):
            with pytest.raises(SDKError):
                ctx.storage.write_json(name, {"overwrite": True})
        assert outside.read_text() == "untouched"


async def test_config_snapshot_and_explicit_secret_access(tmp_path):
    from qwenpaw.plugins import SDKError
    from qwenpaw.plugins.testing import PluginTestHost

    initial = {"token": "test-only-value", "options": {"quality": "high"}}
    async with PluginTestHost(tmp_path / "host") as host:
        ctx = await host.load(make_plugin(tmp_path), config=initial)
        initial["options"]["quality"] = "changed"
        returned = ctx.config.get("options")
        assert returned == {"quality": "high"}
        returned["quality"] = "changed-again"
        assert ctx.config.get("options") == {"quality": "high"}
        with pytest.raises(SDKError):
            ctx.config.get("token")
        assert ctx.config.secret("token") == "test-only-value"
        with pytest.raises(SDKError):
            ctx.config.secret("undeclared")


async def test_media_reference_remains_readable_after_reload(tmp_path):
    from qwenpaw.plugins.messages import Attachment
    from qwenpaw.plugins.testing import PluginTestHost

    async with PluginTestHost(tmp_path / "host") as host:
        ctx = await host.load(make_plugin(tmp_path))
        attachment = ctx.media.write(
            "results/sample.txt",
            b"persistent media",
            mime_type="text/plain",
        )
        assert isinstance(attachment, Attachment)
        assert (
            attachment.mime_type == "text/plain"
            and attachment.name == "sample.txt"
        )
        parsed = urlparse(attachment.url)
        assert parsed.scheme == "file"
        path = Path(url2pathname(parsed.path))
        assert path.read_bytes() == b"persistent media"
        assert attachment.preview_url.startswith("/api/files/preview/")
        assert (await host.reload("storage-contract")).ok
        assert path.read_bytes() == b"persistent media"


async def test_tool_workspace_data_and_media_are_independent(tmp_path):
    from qwenpaw.plugins.testing import PluginTestHost
    from .sdk_author_fixture import make_plugin as extension_plugin

    source = """
from qwenpaw.plugins.tools import ToolSpec, ToolResult
from qwenpaw.plugins.messages import ContentBlock


class Plugin:
    def register(self, ctx):
        async def count(call, args):
            value = call.storage.read_json("count.json", 0) + 1
            call.storage.write_json("count.json", value)
            attachment = call.media.write(
                "same.txt",
                call.workspace_id.encode(),
                mime_type="text/plain",
            )
            return ToolResult(
                content=(ContentBlock(text=str(value)),),
                metadata={"url": attachment.url},
            )

        ctx.register_tool(
            ToolSpec(
                "workspace_count",
                "count",
                {"type": "object"},
                count,
                enabled=True,
            )
        )


plugin = Plugin()
"""
    async with PluginTestHost(tmp_path / "host") as host:
        ctx = await host.load(
            extension_plugin(tmp_path, source, ["tools", "storage"]),
        )
        ctx.storage.write_json("count.json", 99)
        one = await host.call_tool("workspace_count", {}, workspace_id="one")
        two = await host.call_tool("workspace_count", {}, workspace_id="two")
        again = await host.call_tool("workspace_count", {}, workspace_id="one")
        assert [r.content[0].text for r in (one, two, again)] == [
            "1",
            "1",
            "2",
        ]
        assert one.metadata["url"] != two.metadata["url"]
        for result, expected in ((one, b"one"), (two, b"two")):
            assert (
                Path(
                    url2pathname(urlparse(result.metadata["url"]).path),
                ).read_bytes()
                == expected
            )
        assert ctx.storage.read_json("count.json") == 99
        assert (await host.reload("extension-contract")).ok
        assert (
            await host.call_tool("workspace_count", {}, workspace_id="two")
        ).content[0].text == "2"


async def test_tool_settings_are_declared_workspace_scoped_and_persistent(
    tmp_path,
):
    from qwenpaw.plugins import SDKError
    from qwenpaw.plugins.testing import PluginTestHost
    from .sdk_author_fixture import make_plugin as extension_plugin

    source = """
from qwenpaw.plugins.tools import ToolSpec, ToolResult


class Plugin:
    def register(self, ctx):
        async def settings(call, args):
            return ToolResult.text(
                call.config.get("quality")
                + ":"
                + call.config.secret("token")
            )

        ctx.register_tool(
            ToolSpec(
                "settings_echo",
                "settings",
                {"type": "object"},
                settings,
                enabled=True,
                config_fields=(
                    {
                        "name": "quality",
                        "label": "Quality",
                        "type": "text",
                        "default": "normal",
                    },
                    {
                        "name": "token",
                        "label": "Token",
                        "type": "password",
                        "default": "test-default",
                    },
                ),
            )
        )


plugin = Plugin()
"""
    async with PluginTestHost(tmp_path / "host") as host:
        await host.load(
            extension_plugin(tmp_path, source, ["tools", "config"]),
        )
        await host.configure_tool(
            "settings_echo",
            {"quality": "high", "token": "test-one"},
            workspace_id="one",
        )
        assert (
            await host.call_tool("settings_echo", {}, workspace_id="one")
        ).content[0].text == "high:test-one"
        assert (
            await host.call_tool("settings_echo", {}, workspace_id="two")
        ).content[0].text == "normal:test-default"
        with pytest.raises(SDKError):
            await host.configure_tool("settings_echo", {"undeclared": "value"})
        assert (await host.reload("extension-contract")).ok
        assert (
            await host.call_tool("settings_echo", {}, workspace_id="one")
        ).content[0].text == "high:test-one"


async def test_tool_media_preserves_public_preview_reference(tmp_path):
    from qwenpaw.plugins.testing import PluginTestHost
    from .sdk_author_fixture import make_plugin as extension_plugin

    source = """
from qwenpaw.plugins.tools import ToolSpec, ToolResult
from qwenpaw.plugins.messages import ContentBlock


class Plugin:
    def register(self, ctx):
        async def image(call, args):
            attachment = call.media.write(
                "image.png", b"image-data", mime_type="image/png"
            )
            return ToolResult(
                (ContentBlock("image", attachment=attachment),),
                metadata={"preview": attachment.preview_url},
            )

        ctx.register_tool(
            ToolSpec(
                "preview_image",
                "preview",
                {"type": "object"},
                image,
                enabled=True,
            )
        )


plugin = Plugin()
"""
    async with PluginTestHost(tmp_path / "host") as host:
        await host.load(
            extension_plugin(tmp_path, source, ["tools", "storage"]),
        )
        result = await host.call_tool("preview_image", {})
        attachment = result.content[0].attachment
        assert attachment.preview_url == result.metadata["preview"]
        assert attachment.preview_url.startswith("/api/files/preview/")
        assert (
            Path(url2pathname(urlparse(attachment.url).path)).read_bytes()
            == b"image-data"
        )


async def test_async_storage_and_media_preserve_sync_contract(tmp_path):
    from qwenpaw.plugins import SDKError, StaleContextError
    from qwenpaw.plugins.testing import PluginTestHost

    async with PluginTestHost(tmp_path / "host") as host:
        old = await host.load(make_plugin(tmp_path))
        assert await old.storage.aread_json(
            "missing.json",
            {"default": True},
        ) == {
            "default": True,
        }
        await old.storage.awrite_bytes("nested/raw.bin", b"first")
        assert old.storage.read_bytes("nested/raw.bin") == b"first"
        old.storage.write_bytes("nested/raw.bin", b"sync")
        assert await old.storage.aread_bytes("nested/raw.bin") == b"sync"
        await old.storage.awrite_json(
            "state.json",
            {"unicode": "你好", "count": 1},
        )
        assert old.storage.read_json("state.json") == {
            "unicode": "你好",
            "count": 1,
        }
        attachment = await old.media.awrite(
            "nested/a.txt",
            b"media",
            mime_type="text/plain",
        )
        media_path = Path(url2pathname(urlparse(attachment.url).path))
        assert (
            media_path.read_bytes() == b"media"
            and attachment.mime_type == "text/plain"
        )
        await old.storage.adelete("nested/raw.bin")
        await old.storage.adelete("nested/raw.bin")
        with pytest.raises(FileNotFoundError):
            await old.storage.aread_bytes("nested/raw.bin")
        outside = tmp_path / "outside.txt"
        outside.write_text("untouched")
        with pytest.raises(SDKError):
            await old.storage.awrite_bytes(str(outside), b"escape")
        assert outside.read_text() == "untouched"
        assert (await host.reload("storage-contract")).ok
        current = host.context("storage-contract")
        assert await current.storage.aread_json("state.json") == {
            "unicode": "你好",
            "count": 1,
        }
        assert media_path.read_bytes() == b"media"
        operations = [
            lambda: old.storage.aread_bytes("state.json"),
            lambda: old.storage.aread_json("state.json"),
            lambda: old.storage.awrite_bytes("state.json", b"bad"),
            lambda: old.storage.awrite_json("state.json", {}),
            lambda: old.storage.adelete("state.json"),
            lambda: old.media.awrite("a.txt", b"bad"),
        ]
        for operation in operations:
            with pytest.raises(StaleContextError):
                await operation()
        assert await current.storage.aread_json("state.json") == {
            "unicode": "你好",
            "count": 1,
        }


async def test_only_registered_cleanup_can_write_during_reload(tmp_path):
    import asyncio
    from qwenpaw.plugins import PluginBusyError, SDKError
    from qwenpaw.plugins.resources import Registration, ResourceOwner
    from qwenpaw.plugins.testing import PluginTestHost

    entered, release = asyncio.Event(), asyncio.Event()
    async with PluginTestHost(tmp_path / "host") as host:
        ctx = await host.load(make_plugin(tmp_path))

        async def legitimate_cleanup():
            entered.set()
            await release.wait()
            child = asyncio.create_task(
                ctx.storage.awrite_json("child.json", True),
            )
            with pytest.raises((PluginBusyError, SDKError)):
                await child
            await ctx.storage.awrite_json("legitimate.json", True)

        ctx.resources.defer(legitimate_cleanup)
        reload_task = asyncio.create_task(host.reload("storage-contract"))
        try:
            await asyncio.wait_for(entered.wait(), 10)

            async def unregistered_cleanup():
                await ctx.storage.awrite_json("forged.json", True)

            forged = Registration(
                unregistered_cleanup,
                owner=ResourceOwner(ctx.plugin_id, ctx.generation),
                description="not registered with the plugin",
            )
            with pytest.raises((PluginBusyError, SDKError)):
                await forged.close()
            assert ctx.storage.read_json("forged.json") is None
        finally:
            release.set()
            result = await reload_task
        assert result.ok
        current = host.context("storage-contract")
        assert await current.storage.aread_json("legitimate.json") is True
        assert await current.storage.aread_json("forged.json") is None
        assert await current.storage.aread_json("child.json") is None
