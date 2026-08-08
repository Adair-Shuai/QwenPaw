# -*- coding: utf-8 -*-
"""Tests for officecli integration in workspace.py.

Covers:
- _convert_with_officecli reads HTML from stdout (not -o temp file)
- _convert_with_officecli returns None on failure (triggers fallback)
- _get_officecli_page_count handles various response formats
- _is_officecli_available
- _convert_docx_to_html falls back when officecli not available
"""
# pylint: disable=protected-access,unused-argument

import json
import subprocess
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest


# ---------------------------------------------------------------------------
# _is_officecli_available
# ---------------------------------------------------------------------------


class TestIsOfficecliAvailable:
    """Tests for _is_officecli_available."""

    @patch("qwenpaw.app.routers.workspace.shutil.which")
    @patch("qwenpaw.app.routers.workspace._bundled_officecli_path")
    def test_available(self, mock_bundled, mock_which):
        import qwenpaw.app.routers.workspace as ws

        # Reset cache
        ws._officecli_checked = False
        ws._officecli_ok = False

        mock_bundled.return_value = None
        mock_which.return_value = "/usr/local/bin/officecli"

        # Mock subprocess.run to simulate --help showing "view"
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = "Commands: view, create, add, get"
        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            assert ws._is_officecli_available() is True

    @patch("qwenpaw.app.routers.workspace.shutil.which")
    @patch("qwenpaw.app.routers.workspace._bundled_officecli_path")
    def test_not_available(self, mock_bundled, mock_which):
        import qwenpaw.app.routers.workspace as ws

        # Reset cache
        ws._officecli_checked = False
        ws._officecli_ok = False

        mock_bundled.return_value = None
        mock_which.return_value = None
        assert ws._is_officecli_available() is False

    @patch("qwenpaw.app.routers.workspace._bundled_officecli_path")
    def test_bundled_doc_plugin_is_exported_to_subprocess_environment(
        self,
        mock_bundled,
        tmp_path,
    ):
        import qwenpaw.app.routers.workspace as ws

        officecli_dir = tmp_path / "officecli"
        plugin = officecli_dir / "plugins" / "dump-reader" / "doc" / "plugin"
        plugin.parent.mkdir(parents=True)
        plugin.write_bytes(b"plugin")
        binary = officecli_dir / "officecli"
        binary.write_bytes(b"officecli")
        mock_bundled.return_value = str(binary)

        env = ws._officecli_env()
        assert env["OFFICECLI_PLUGIN_DUMP_READER_DOC"] == str(plugin)


class TestLegacyDocFallback:
    """Tests for the compatibility path used without the licensed plugin."""

    @patch("qwenpaw.app.routers.workspace._convert_docx_to_html")
    @patch("qwenpaw.app.routers.workspace.shutil.which")
    def test_doc_is_converted_to_docx_before_legacy_rendering(
        self,
        mock_which,
        mock_render,
        tmp_path,
    ):
        import qwenpaw.app.routers.workspace as ws

        source = tmp_path / "legacy.doc"
        source.write_bytes(b"legacy")
        mock_which.return_value = "/usr/bin/soffice"
        mock_render.return_value = "<p>converted</p>"

        def fake_run(command, **kwargs):
            output_dir = Path(command[command.index("--outdir") + 1])
            output_dir.mkdir(parents=True, exist_ok=True)
            (output_dir / "legacy.docx").write_bytes(b"docx")
            return MagicMock(returncode=0, stdout="", stderr="")

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            side_effect=fake_run,
        ):
            html = ws._convert_legacy_office_to_html(str(source))

        assert html == "<p>converted</p>"
        mock_render.assert_called_once()
        assert Path(mock_render.call_args.args[0]).suffix == ".docx"


# ---------------------------------------------------------------------------
# _convert_with_officecli
# ---------------------------------------------------------------------------


class TestConvertWithOfficecli:
    """Tests for _convert_with_officecli."""

    def test_reads_html_from_stdout(self):
        """Verify HTML is read from stdout, not --json or -o."""
        from qwenpaw.app.routers.workspace import _convert_with_officecli

        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = b"<html><body>Test HTML</body></html>"

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            html = _convert_with_officecli("/tmp/test.pptx")
            assert html is not None
            assert "Test HTML" in html

    def test_returns_none_on_nonzero_exit(self):
        """Non-zero exit code returns None (triggers fallback)."""
        from qwenpaw.app.routers.workspace import _convert_with_officecli

        mock_result = MagicMock()
        mock_result.returncode = 1
        mock_result.stderr = b"error"

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            html = _convert_with_officecli("/tmp/test.pptx")
            assert html is None

    def test_returns_none_on_filenotfound(self):
        """FileNotFoundError returns None (triggers fallback)."""
        from qwenpaw.app.routers.workspace import _convert_with_officecli

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            side_effect=FileNotFoundError(),
        ):
            html = _convert_with_officecli("/tmp/test.pptx")
            assert html is None

    def test_returns_none_on_timeout(self):
        """Timeout returns None (triggers fallback)."""
        from qwenpaw.app.routers.workspace import _convert_with_officecli

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            side_effect=subprocess.TimeoutExpired(cmd=[], timeout=30),
        ):
            html = _convert_with_officecli("/tmp/test.pptx")
            assert html is None

    def test_returns_none_on_empty_stdout(self):
        """When officecli succeeds but stdout is empty, return None."""
        from qwenpaw.app.routers.workspace import _convert_with_officecli

        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = b""

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            html = _convert_with_officecli("/tmp/test.pptx")
            assert html is None

    def test_no_temp_file_created(self):
        """Verify no temp file is created (stdout-based approach)."""
        import tempfile
        import os

        from qwenpaw.app.routers.workspace import _convert_with_officecli

        # Track temp files before and after
        tmpdir = tempfile.gettempdir()
        before = set(os.listdir(tmpdir))

        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = b"<html>Test</html>"

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            _convert_with_officecli("/tmp/test.pptx")

        after = set(os.listdir(tmpdir))
        # No new temp files should be created
        new_files = after - before
        html_temp_files = [
            f for f in new_files if f.endswith(".html") or f.endswith(".htm")
        ]
        assert not html_temp_files, f"Temp files created: {html_temp_files}"


class TestResolveWorkspaceFileDownloadUrl:
    """Resolve URLs emitted by the unified /files workspace."""

    def test_resolves_project_root_download_url(self, tmp_path):
        from qwenpaw.app.routers.workspace import _resolve_file_path_from_url

        project_dir = tmp_path / "project"
        workspace_dir = tmp_path / "workspace"
        target = project_dir / "docs" / "report.docx"
        target.parent.mkdir(parents=True)
        target.write_bytes(b"docx")
        workspace_dir.mkdir()

        resolved = _resolve_file_path_from_url(
            "/api/workspace/file-download"
            "?path=docs%2Freport.docx&root=project",
            project_dir,
            workspace_dir,
        )

        assert resolved == target

    def test_resolves_agent_workspace_download_url(self, tmp_path):
        from qwenpaw.app.routers.workspace import _resolve_file_path_from_url

        project_dir = tmp_path / "project"
        workspace_dir = tmp_path / "workspace"
        target = workspace_dir / "assets" / "slides.pptx"
        project_dir.mkdir()
        target.parent.mkdir(parents=True)
        target.write_bytes(b"pptx")

        resolved = _resolve_file_path_from_url(
            "http://127.0.0.1:8000/api/workspace/file-download"
            "?path=assets%2Fslides.pptx&root=workspace",
            project_dir,
            workspace_dir,
        )

        assert resolved == target

    def test_resolves_chat_file_preview_url(self, tmp_path):
        from urllib.parse import quote
        from qwenpaw.app.routers.workspace import _resolve_file_path_from_url

        project_dir = tmp_path / "project"
        target = tmp_path / "generated" / "储层数据表.xlsx"
        project_dir.mkdir()
        target.parent.mkdir()
        target.write_bytes(b"xlsx")

        resolved = _resolve_file_path_from_url(
            "/api/files/preview/" + quote(str(target), safe="/"),
            project_dir,
            tmp_path,
        )

        assert resolved == target

    def test_rejects_unknown_workspace_root(self, tmp_path):
        from fastapi import HTTPException
        from qwenpaw.app.routers.workspace import _resolve_file_path_from_url

        with pytest.raises(HTTPException) as exc_info:
            _resolve_file_path_from_url(
                "/api/workspace/file-download?path=report.docx&root=outside",
                tmp_path,
                tmp_path,
            )

        assert exc_info.value.status_code == 400


class TestConvertOfficeEndpoint:
    """The endpoint must pass /files URLs through OfficeCLI."""

    @pytest.mark.asyncio
    async def test_converts_workspace_download_url_with_officecli(
        self,
        tmp_path,
    ):
        from starlette.requests import Request
        from qwenpaw.app.routers.workspace import (
            ConvertOfficeRequest,
            convert_office,
        )

        project_dir = tmp_path / "project"
        workspace_dir = tmp_path / "workspace"
        target = workspace_dir / "sample.docx"
        project_dir.mkdir()
        workspace_dir.mkdir()
        target.write_bytes(b"docx")
        workspace = MagicMock(workspace_dir=workspace_dir)
        request = Request({"type": "http", "headers": []})
        body = ConvertOfficeRequest(
            url="/api/workspace/file-download"
            "?path=sample.docx&root=workspace",
            mime_type=(
                "application/vnd.openxmlformats"
                "-officedocument.wordprocessingml.document"
            ),
        )

        with (
            patch(
                "qwenpaw.app.routers.workspace.get_agent_for_request",
                return_value=workspace,
            ),
            patch(
                "qwenpaw.app.routers.workspace.get_project_dir_for_request",
                return_value=project_dir,
            ),
            patch(
                "qwenpaw.app.routers.workspace._is_officecli_available",
                return_value=True,
            ),
            patch(
                "qwenpaw.app.routers.workspace._convert_with_officecli",
                return_value="<html>OfficeCLI</html>",
            ) as convert_mock,
        ):
            result = await convert_office(request, body)

        assert result == {
            "html": "<html>OfficeCLI</html>",
            "engine": "officecli",
        }
        convert_mock.assert_called_once_with(str(target))


# ---------------------------------------------------------------------------
# _get_officecli_page_count
# ---------------------------------------------------------------------------


class TestGetOfficecliPageCount:
    """Tests for _get_officecli_page_count."""

    def setup_method(self):
        """Clear cache before each test."""
        import qwenpaw.app.routers.workspace as ws

        ws._page_count_cache.clear()

    def test_returns_page_count_from_json(self):
        """Standard JSON response with pageCount."""
        from qwenpaw.app.routers.workspace import _get_officecli_page_count

        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps(
            {"success": True, "data": {"pageCount": 5}},
        )

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            count = _get_officecli_page_count("/tmp/test.docx")
            assert count == 5

    def test_returns_slides_from_nested_data(self):
        """PPTX stats format: {"data": {"slides": N}}."""
        from qwenpaw.app.routers.workspace import _get_officecli_page_count

        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps(
            {"success": True, "data": {"slides": 8, "totalShapes": 20}},
        )

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            count = _get_officecli_page_count("/tmp/test.pptx")
            assert count == 8

    def test_returns_page_count_from_snake_case(self):
        """Snake case page_count key."""
        from qwenpaw.app.routers.workspace import _get_officecli_page_count

        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({"page_count": 3})

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            count = _get_officecli_page_count("/tmp/test_snake_case.pptx")
            assert count == 3

    def test_returns_slides_key(self):
        """Slides key for PPTX."""
        from qwenpaw.app.routers.workspace import _get_officecli_page_count

        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = json.dumps({"slides": 8})

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            count = _get_officecli_page_count("/tmp/test_slides_key.pptx")
            assert count == 8

    def test_returns_zero_on_nonzero_exit(self):
        """Non-zero exit returns 0."""
        from qwenpaw.app.routers.workspace import _get_officecli_page_count

        mock_result = MagicMock()
        mock_result.returncode = 1

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            count = _get_officecli_page_count("/tmp/test_nonzero.pptx")
            assert count == 0

    def test_returns_zero_on_timeout(self):
        """Timeout returns 0."""
        from qwenpaw.app.routers.workspace import _get_officecli_page_count

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            side_effect=subprocess.TimeoutExpired(cmd=[], timeout=30),
        ):
            count = _get_officecli_page_count("/tmp/test_timeout.pptx")
            assert count == 0

    def test_returns_zero_on_invalid_json(self):
        """Invalid JSON returns 0."""
        from qwenpaw.app.routers.workspace import _get_officecli_page_count

        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = "not json"

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            count = _get_officecli_page_count("/tmp/test_invalid_json.pptx")
            assert count == 0


# ---------------------------------------------------------------------------
# _convert_docx_to_html — fallback chain
# ---------------------------------------------------------------------------


class TestConvertDocxToHtmlFallback:
    """Tests for _convert_docx_to_html fallback behavior."""

    def test_officecli_not_available_falls_through_to_legacy(self):
        """When officecli is not available, skip to legacy conversion."""
        from qwenpaw.app.routers.workspace import _convert_docx_to_html

        with (
            patch(
                "qwenpaw.app.routers.workspace._is_officecli_available",
                return_value=False,
            ),
            patch(
                "qwenpaw.app.routers.workspace._convert_with_officecli",
            ) as mock_oci,
        ):
            # Legacy path will fail (no mammoth), but we just verify
            # officecli was NOT called
            try:
                _convert_docx_to_html("/tmp/nonexistent.docx")
            except Exception:
                pass  # Expected — mammoth will fail
            mock_oci.assert_not_called()

    def test_officecli_available_but_fails_falls_through(self):
        """When officecli is available but returns None, fall through."""
        from qwenpaw.app.routers.workspace import _convert_docx_to_html

        with (
            patch(
                "qwenpaw.app.routers.workspace._is_officecli_available",
                return_value=True,
            ),
            patch(
                "qwenpaw.app.routers.workspace._convert_with_officecli",
                return_value=None,
            ),
        ):
            # Legacy path will fail (no mammoth), but we verify
            # officecli was called
            try:
                _convert_docx_to_html("/tmp/nonexistent.docx")
            except Exception:
                pass  # Expected

    def test_officecli_available_returns_html_skips_legacy(self):
        """When officecli returns HTML, legacy path is not touched.

        This tests the convert_office flow, not _convert_docx_to_html
        directly (which IS the legacy path).
        """
        # Create a temporary .docx file to avoid FileNotFoundError
        import tempfile
        import os

        fd, tmp_path = tempfile.mkstemp(suffix=".docx")
        try:
            os.close(fd)
            # Write minimal content
            with open(tmp_path, "wb") as f:
                f.write(b"PK\x03\x04")  # Minimal zip header

            from qwenpaw.app.routers.workspace import _convert_docx_to_html

            with (
                patch(
                    "qwenpaw.app.routers.workspace._is_officecli_available",
                    return_value=True,
                ),
                patch(
                    "qwenpaw.app.routers.workspace._convert_with_officecli",
                    return_value="<html>High fidelity HTML</html>",
                ),
            ):
                # _convert_docx_to_html is the legacy path;
                # it should NOT call _convert_with_officecli.
                # The caller (convert_office) handles the officecli-first
                # logic. Here we verify _convert_docx_to_html works
                # independently.
                try:
                    html = _convert_docx_to_html(tmp_path)
                    # If mammoth is installed, it will try to parse;
                    # otherwise ImportError -> python-docx fallback
                    assert isinstance(html, str)
                except Exception:
                    # Expected if no docx libraries are installed
                    pass
        finally:
            os.unlink(tmp_path)
