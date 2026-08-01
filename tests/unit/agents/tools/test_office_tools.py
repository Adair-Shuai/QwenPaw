# -*- coding: utf-8 -*-
"""Tests for qwenpaw.agents.tools.office_tools.

Covers:
- _run_officecli error handling (stdout JSON on non-zero exit)
- _run_officecli when officecli not installed
- _flatten_props nested dict → dotted-key flattening
- _props_to_args boolean conversion and --prop formatting
- office_batch_operations uses --input (not --file)
- office_batch_operations normalises legacy "action" → "command"
- office_batch_operations flattens nested props in commands
- office_view_document "html" mode uses -o temp file
- office_create_document command format
- office_add_element props formatting (flat, nested, bool)
- office_view_screenshot when officecli not installed
- _not_installed_error and _json_toolchunk helpers
"""
# pylint: disable=protected-access,unused-argument

import asyncio
import json
from unittest.mock import AsyncMock, patch

import pytest


# ---------------------------------------------------------------------------
# _officecli_available / _not_installed_error / _json_toolchunk
# ---------------------------------------------------------------------------


class TestOfficecliAvailable:
    """Tests for _officecli_available."""

    @patch("qwenpaw.agents.tools.office_tools.shutil.which")
    def test_available(self, mock_which):
        mock_which.return_value = "/usr/local/bin/officecli"
        from qwenpaw.agents.tools.office_tools import _officecli_available

        assert _officecli_available() is True

    @patch("qwenpaw.agents.tools.office_tools.shutil.which")
    def test_not_available(self, mock_which):
        mock_which.return_value = None
        from qwenpaw.agents.tools.office_tools import _officecli_available

        assert _officecli_available() is False


class TestNotInstalledError:
    """Tests for _not_installed_error."""

    def test_returns_toolchunk_with_error(self):
        from qwenpaw.agents.tools.office_tools import _not_installed_error

        chunk = _not_installed_error()
        assert chunk.is_last is True
        text = chunk.content[0].text
        data = json.loads(text)
        assert data["ok"] is False
        assert "not installed" in data["error"]


class TestJsonToolchunk:
    """Tests for _json_toolchunk."""

    def test_wraps_dict_as_json(self):
        from qwenpaw.agents.tools.office_tools import _json_toolchunk

        chunk = _json_toolchunk({"success": True, "path": "/slide[1]"})
        assert chunk.is_last is True
        data = json.loads(chunk.content[0].text)
        assert data["success"] is True
        assert data["path"] == "/slide[1]"


# ---------------------------------------------------------------------------
# _flatten_props / _props_to_args
# ---------------------------------------------------------------------------


class TestFlattenProps:
    """Tests for _flatten_props and _props_to_args helpers."""

    def test_flat_props_passthrough(self):
        """Already-flat dotted keys pass through unchanged."""
        from qwenpaw.agents.tools.office_tools import _flatten_props

        result = _flatten_props({"font.eastAsia": "宋体", "size": "12pt"})
        assert result == {"font.eastAsia": "宋体", "size": "12pt"}

    def test_nested_dict_flattened(self):
        """Nested dicts are flattened to dotted keys."""
        from qwenpaw.agents.tools.office_tools import _flatten_props

        result = _flatten_props(
            {"font": {"eastAsia": "宋体", "ascii": "Times New Roman"}},
        )
        assert result == {
            "font.eastAsia": "宋体",
            "font.ascii": "Times New Roman",
        }

    def test_bool_converted_to_string(self):
        """Python booleans become 'true'/'false' strings."""
        from qwenpaw.agents.tools.office_tools import _flatten_props

        result = _flatten_props({"bold": True, "italic": False})
        assert result == {"bold": "true", "italic": "false"}

    def test_none_values_skipped(self):
        """None values are silently dropped."""
        from qwenpaw.agents.tools.office_tools import _flatten_props

        result = _flatten_props({"text": "hi", "color": None})
        assert result == {"text": "hi"}
        assert "color" not in result

    def test_empty_or_none_props(self):
        """Empty dict or None returns empty dict."""
        from qwenpaw.agents.tools.office_tools import _flatten_props

        assert not _flatten_props({})
        assert not _flatten_props(None)

    def test_deeply_nested_dict(self):
        """Two-level nesting like {'a': {'b': {'c': 'd'}}} → 'a.b.c=d'."""
        from qwenpaw.agents.tools.office_tools import _flatten_props

        result = _flatten_props({"a": {"b": {"c": "d"}}})
        assert result == {"a.b.c": "d"}

    def test_props_to_args_format(self):
        """_props_to_args produces a list of --prop key=value strings."""
        from qwenpaw.agents.tools.office_tools import _props_to_args

        args = _props_to_args(
            {"text": "正文", "font": {"eastAsia": "宋体"}, "bold": True},
        )
        # Should contain --prop markers and key=value pairs
        assert "--prop" in args
        assert "text=正文" in args
        assert "font.eastAsia=宋体" in args
        assert "bold=true" in args

    def test_props_to_args_empty(self):
        """_props_to_args with no props returns empty list."""
        from qwenpaw.agents.tools.office_tools import _props_to_args

        assert not _props_to_args(None)
        assert not _props_to_args({})


# ---------------------------------------------------------------------------
# _run_officecli
# ---------------------------------------------------------------------------


class TestRunOfficecli:
    """Tests for _run_officecli."""

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._officecli_available")
    async def test_not_installed_returns_error(self, mock_avail):
        """When officecli is not installed, return friendly error."""
        mock_avail.return_value = False
        from qwenpaw.agents.tools.office_tools import _run_officecli

        result = await _run_officecli("create", "test.pptx")
        assert result["ok"] is False
        assert "not installed" in result["error"]

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._officecli_available")
    @patch("qwenpaw.agents.tools.office_tools.asyncio.create_subprocess_exec")
    async def test_success_parses_stdout_json(self, mock_exec, mock_avail):
        """Successful command returns parsed JSON from stdout."""
        mock_avail.return_value = True
        mock_proc = AsyncMock()
        mock_proc.returncode = 0
        mock_proc.communicate.return_value = (
            b'{"success": true, "path": "/slide[1]"}',
            b"",
        )
        mock_exec.return_value = mock_proc

        from qwenpaw.agents.tools.office_tools import _run_officecli

        result = await _run_officecli("add", "test.pptx", "/")
        assert result["success"] is True
        assert result["ok"] is True
        assert result["path"] == "/slide[1]"

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._officecli_available")
    @patch("qwenpaw.agents.tools.office_tools.asyncio.create_subprocess_exec")
    async def test_error_parses_stdout_json_on_nonzero_exit(
        self,
        mock_exec,
        mock_avail,
    ):
        """On non-zero exit, still parse stdout JSON for structured error."""
        mock_avail.return_value = True
        mock_proc = AsyncMock()
        mock_proc.returncode = 1
        mock_proc.communicate.return_value = (
            json.dumps(
                {
                    "success": False,
                    "error": {
                        "error": "Slide 50 not found (total: 8)",
                        "code": "not_found",
                        "suggestion": "Valid Slide index range: 1-8",
                    },
                },
            ).encode(),
            b"",
        )
        mock_exec.return_value = mock_proc

        from qwenpaw.agents.tools.office_tools import _run_officecli

        result = await _run_officecli("get", "test.pptx", "/slide[50]")
        assert result["ok"] is False
        assert result["success"] is False
        assert "Slide 50 not found" in result["error"]

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._officecli_available")
    @patch("qwenpaw.agents.tools.office_tools.asyncio.create_subprocess_exec")
    async def test_error_with_no_stdout_uses_stderr(
        self,
        mock_exec,
        mock_avail,
    ):
        """When stdout is empty on error, fall back to stderr."""
        mock_avail.return_value = True
        mock_proc = AsyncMock()
        mock_proc.returncode = 1
        mock_proc.communicate.return_value = (
            b"",
            b"Error: file not found",
        )
        mock_exec.return_value = mock_proc

        from qwenpaw.agents.tools.office_tools import _run_officecli

        result = await _run_officecli("create", "test.pptx")
        assert result["ok"] is False
        assert "file not found" in result["error"]

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._officecli_available")
    @patch("qwenpaw.agents.tools.office_tools.asyncio.create_subprocess_exec")
    async def test_timeout_returns_error(self, mock_exec, mock_avail):
        """Timeout returns a friendly error."""
        mock_avail.return_value = True
        mock_proc = AsyncMock()
        mock_proc.communicate.side_effect = asyncio.TimeoutError()
        mock_proc.kill = AsyncMock()
        mock_proc.wait = AsyncMock()
        mock_exec.return_value = mock_proc

        from qwenpaw.agents.tools.office_tools import _run_officecli

        result = await _run_officecli("create", "test.pptx")
        assert result["ok"] is False
        assert "timed out" in result["error"]

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._officecli_available")
    @patch("qwenpaw.agents.tools.office_tools.asyncio.create_subprocess_exec")
    async def test_binary_not_found(self, mock_exec, mock_avail):
        """FileNotFoundError returns a friendly error."""
        mock_avail.return_value = True
        mock_exec.side_effect = FileNotFoundError()

        from qwenpaw.agents.tools.office_tools import _run_officecli

        result = await _run_officecli("create", "test.pptx")
        assert result["ok"] is False
        assert "not found" in result["error"]

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._officecli_available")
    @patch("qwenpaw.agents.tools.office_tools.asyncio.create_subprocess_exec")
    async def test_command_includes_json_flag(self, mock_exec, mock_avail):
        """Verify --json is appended to the command."""
        mock_avail.return_value = True
        mock_proc = AsyncMock()
        mock_proc.returncode = 0
        mock_proc.communicate.return_value = (
            b'{"success": true}',
            b"",
        )
        mock_exec.return_value = mock_proc

        from qwenpaw.agents.tools.office_tools import _run_officecli

        await _run_officecli("create", "test.pptx")
        actual_cmd = mock_exec.call_args[0]
        assert "--json" in actual_cmd
        assert actual_cmd[-1] == "--json"


# ---------------------------------------------------------------------------
# office_create_document
# ---------------------------------------------------------------------------


class TestOfficeCreateDocument:
    """Tests for office_create_document."""

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._officecli_available")
    async def test_not_installed_returns_error_chunk(self, mock_avail):
        mock_avail.return_value = False
        from qwenpaw.agents.tools.office_tools import office_create_document

        chunk = await office_create_document("test.pptx")
        data = json.loads(chunk.content[0].text)
        assert data["ok"] is False

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._run_officecli")
    async def test_calls_create_command(self, mock_run):
        mock_run.return_value = {
            "success": True,
            "ok": True,
            "path": "test.pptx",
        }
        from qwenpaw.agents.tools.office_tools import office_create_document

        await office_create_document("test.pptx")
        mock_run.assert_called_once_with("create", mock_run.call_args[0][1])


# ---------------------------------------------------------------------------
# office_add_element
# ---------------------------------------------------------------------------


class TestOfficeAddElement:
    """Tests for office_add_element."""

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._run_officecli")
    async def test_props_formatted_as_prop_args(self, mock_run):
        mock_run.return_value = {"success": True, "ok": True}
        from qwenpaw.agents.tools.office_tools import office_add_element

        await office_add_element(
            "test.pptx",
            "/",
            "slide",
            {"title": "Hello", "background": "1A1A2E"},
        )
        args = mock_run.call_args[0]
        assert args[0] == "add"
        # Check that --prop key=value pairs are present
        prop_args = [
            args[i] for i in range(len(args)) if args[i - 1] == "--prop"
        ]
        assert "title=Hello" in prop_args
        assert "background=1A1A2E" in prop_args

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._run_officecli")
    async def test_no_props_no_prop_args(self, mock_run):
        mock_run.return_value = {"success": True, "ok": True}
        from qwenpaw.agents.tools.office_tools import office_add_element

        await office_add_element("test.pptx", "/", "slide", None)
        args = mock_run.call_args[0]
        assert "--prop" not in args

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._run_officecli")
    async def test_nested_dict_props_flattened(self, mock_run):
        """Nested dict props like {"font": {"eastAsia": "宋体"}} are
        flattened to font.eastAsia=宋体."""
        mock_run.return_value = {"success": True, "ok": True}
        from qwenpaw.agents.tools.office_tools import office_add_element

        await office_add_element(
            "test.docx",
            "/body",
            "paragraph",
            {
                "text": "正文",
                "font": {"eastAsia": "宋体", "ascii": "Times New Roman"},
            },
        )
        args = mock_run.call_args[0]
        prop_args = [
            args[i] for i in range(len(args)) if args[i - 1] == "--prop"
        ]
        assert "text=正文" in prop_args
        assert "font.eastAsia=宋体" in prop_args
        assert "font.ascii=Times New Roman" in prop_args

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._run_officecli")
    async def test_bool_props_converted_to_strings(self, mock_run):
        """Python True/False are converted to 'true'/'false' strings."""
        mock_run.return_value = {"success": True, "ok": True}
        from qwenpaw.agents.tools.office_tools import office_add_element

        await office_add_element(
            "test.docx",
            "/body",
            "paragraph",
            {"text": "标题", "bold": True, "italic": False},
        )
        args = mock_run.call_args[0]
        prop_args = [
            args[i] for i in range(len(args)) if args[i - 1] == "--prop"
        ]
        assert "bold=true" in prop_args
        assert "italic=false" in prop_args


# ---------------------------------------------------------------------------
# office_batch_operations — verify --input (not --file)
# ---------------------------------------------------------------------------


class TestOfficeBatchOperations:
    """Tests for office_batch_operations."""

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._run_officecli")
    @patch("qwenpaw.agents.tools.office_tools.get_current_workspace_dir")
    async def test_uses_input_flag_not_file(self, mock_ws, mock_run):
        """Verify batch command uses --input, not --file."""
        import tempfile
        from pathlib import Path

        mock_ws.return_value = Path(tempfile.gettempdir())
        mock_run.return_value = {"success": True, "ok": True}

        from qwenpaw.agents.tools.office_tools import office_batch_operations

        await office_batch_operations(
            "test.pptx",
            [{"command": "set", "path": "/slide[1]", "props": {"text": "Hi"}}],
        )
        args = mock_run.call_args[0]
        assert "--input" in args
        assert "--file" not in args

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._run_officecli")
    @patch("qwenpaw.agents.tools.office_tools.get_current_workspace_dir")
    async def test_legacy_action_field_normalised(self, mock_ws, mock_run):
        """Legacy 'action' field is normalised to 'command' in the JSON
        written to the temp file."""
        import tempfile
        from pathlib import Path

        mock_ws.return_value = Path(tempfile.gettempdir())
        mock_run.return_value = {"success": True, "ok": True}

        from qwenpaw.agents.tools.office_tools import office_batch_operations

        # Capture the temp file content by intercepting json.dump
        original_dump = json.dump
        captured: list = []

        def spy_dump(data, f, **kw):
            captured.append(data)
            return original_dump(data, f, **kw)

        with patch("json.dump", side_effect=spy_dump):
            await office_batch_operations(
                "test.pptx",
                [
                    {
                        "action": "set",
                        "path": "/slide[1]",
                        "props": {"text": "Hi"},
                    },
                ],
            )

        assert len(captured) == 1
        written = captured[0]
        assert written[0]["command"] == "set"
        assert "action" not in written[0]

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._run_officecli")
    @patch("qwenpaw.agents.tools.office_tools.get_current_workspace_dir")
    async def test_op_field_normalised_to_command(self, mock_ws, mock_run):
        """'op' field is also normalised to 'command'."""
        import tempfile
        from pathlib import Path

        mock_ws.return_value = Path(tempfile.gettempdir())
        mock_run.return_value = {"success": True, "ok": True}

        from qwenpaw.agents.tools.office_tools import office_batch_operations

        original_dump = json.dump
        captured: list = []

        def spy_dump(data, f, **kw):
            captured.append(data)
            return original_dump(data, f, **kw)

        with patch("json.dump", side_effect=spy_dump):
            await office_batch_operations(
                "test.xlsx",
                [
                    {
                        "op": "set",
                        "path": "/Sheet1/A1",
                        "props": {"value": "Done"},
                    },
                ],
            )

        assert len(captured) == 1
        written = captured[0]
        assert written[0]["command"] == "set"
        assert "op" not in written[0]

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._run_officecli")
    @patch("qwenpaw.agents.tools.office_tools.get_current_workspace_dir")
    async def test_nested_props_flattened_in_batch(self, mock_ws, mock_run):
        """Nested props in batch commands are flattened to dotted keys."""
        import tempfile
        from pathlib import Path

        mock_ws.return_value = Path(tempfile.gettempdir())
        mock_run.return_value = {"success": True, "ok": True}

        from qwenpaw.agents.tools.office_tools import office_batch_operations

        original_dump = json.dump
        captured: list = []

        def spy_dump(data, f, **kw):
            captured.append(data)
            return original_dump(data, f, **kw)

        with patch("json.dump", side_effect=spy_dump):
            await office_batch_operations(
                "test.docx",
                [
                    {
                        "command": "set",
                        "path": "/body/p[1]",
                        "props": {"font": {"eastAsia": "宋体"}, "size": "12pt"},
                    },
                ],
            )

        assert len(captured) == 1
        written = captured[0]
        assert written[0]["props"]["font.eastAsia"] == "宋体"
        assert written[0]["props"]["size"] == "12pt"
        assert "font" not in written[0]["props"]  # nested dict was flattened

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._run_officecli")
    @patch("qwenpaw.agents.tools.office_tools.get_current_workspace_dir")
    async def test_caller_dict_not_mutated(self, mock_ws, mock_run):
        """The original commands list must not be mutated."""
        import tempfile
        from pathlib import Path

        mock_ws.return_value = Path(tempfile.gettempdir())
        mock_run.return_value = {"success": True, "ok": True}

        from qwenpaw.agents.tools.office_tools import office_batch_operations

        commands = [
            {"action": "set", "path": "/slide[1]", "props": {"text": "Hi"}},
        ]
        commands_copy = [
            {"action": "set", "path": "/slide[1]", "props": {"text": "Hi"}},
        ]

        await office_batch_operations("test.pptx", commands)

        # Caller's list should be untouched
        assert commands == commands_copy
        assert "action" in commands[0]
        assert "command" not in commands[0]


# ---------------------------------------------------------------------------
# office_view_document — html mode uses -o temp file
# ---------------------------------------------------------------------------


class TestOfficeViewDocument:
    """Tests for office_view_document."""

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._run_officecli")
    async def test_outline_mode_uses_json(self, mock_run):
        mock_run.return_value = {"success": True, "ok": True, "outline": []}
        from qwenpaw.agents.tools.office_tools import office_view_document

        await office_view_document("test.pptx", "outline")
        mock_run.assert_called_once()

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._officecli_available")
    @patch("qwenpaw.agents.tools.office_tools.asyncio.create_subprocess_exec")
    @patch("qwenpaw.agents.tools.office_tools.get_current_workspace_dir")
    async def test_html_mode_returns_html_from_stdout(
        self,
        mock_ws,
        mock_exec,
        mock_avail,
    ):
        """HTML mode should capture HTML from stdout, not use --json."""
        import tempfile
        from pathlib import Path

        mock_avail.return_value = True
        mock_ws.return_value = Path(tempfile.gettempdir())

        mock_proc = AsyncMock()
        mock_proc.returncode = 0

        # Simulate officecli writing HTML to stdout
        async def mock_communicate():
            return (b"<html><body>Test</body></html>", b"")

        mock_proc.communicate = mock_communicate
        mock_exec.return_value = mock_proc

        from qwenpaw.agents.tools.office_tools import office_view_document

        chunk = await office_view_document("test.pptx", "html")

        # Verify --json is not in the command (we want raw HTML)
        cmd = mock_exec.call_args[0]
        assert "--json" not in cmd

        # Verify HTML content is returned from stdout
        data = json.loads(chunk.content[0].text)
        assert data["ok"] is True
        assert "html" in data
        assert "Test" in data["html"]

    @pytest.mark.asyncio
    async def test_invalid_mode_returns_error(self):
        from qwenpaw.agents.tools.office_tools import office_view_document

        chunk = await office_view_document("test.pptx", "invalid_mode")
        data = json.loads(chunk.content[0].text)
        assert data["ok"] is False
        assert "Invalid mode" in data["error"]


# ---------------------------------------------------------------------------
# office_view_screenshot
# ---------------------------------------------------------------------------


class TestOfficeViewScreenshot:
    """Tests for office_view_screenshot."""

    @pytest.mark.asyncio
    @patch("qwenpaw.agents.tools.office_tools._officecli_available")
    async def test_not_installed_returns_error(self, mock_avail):
        mock_avail.return_value = False
        from qwenpaw.agents.tools.office_tools import office_view_screenshot

        chunk = await office_view_screenshot("test.pptx", 1)
        data = json.loads(chunk.content[0].text)
        assert data["ok"] is False
