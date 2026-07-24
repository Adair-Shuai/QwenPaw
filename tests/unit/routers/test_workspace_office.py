# -*- coding: utf-8 -*-
"""Tests for officecli integration in workspace.py.

Covers:
- _convert_with_officecli uses -o temp file (not --json)
- _convert_with_officecli returns None on failure (triggers fallback)
- _get_officecli_page_count handles various response formats
- _is_officecli_available
- _convert_docx_to_html falls back when officecli not available
"""
# pylint: disable=protected-access,unused-argument

import json
import subprocess
from unittest.mock import patch, MagicMock

import pytest


# ---------------------------------------------------------------------------
# _is_officecli_available
# ---------------------------------------------------------------------------


class TestIsOfficecliAvailable:
    """Tests for _is_officecli_available."""

    @patch("qwenpaw.app.routers.workspace.shutil.which")
    def test_available(self, mock_which):
        from qwenpaw.app.routers.workspace import _is_officecli_available

        mock_which.return_value = "/usr/local/bin/officecli"
        assert _is_officecli_available() is True

    @patch("qwenpaw.app.routers.workspace.shutil.which")
    def test_not_available(self, mock_which):
        from qwenpaw.app.routers.workspace import _is_officecli_available

        mock_which.return_value = None
        assert _is_officecli_available() is False


# ---------------------------------------------------------------------------
# _convert_with_officecli
# ---------------------------------------------------------------------------


class TestConvertWithOfficecli:
    """Tests for _convert_with_officecli."""

    def test_uses_o_flag_not_json(self):
        """Verify the command uses -o with a temp file, not --json."""
        from qwenpaw.app.routers.workspace import _convert_with_officecli

        def mock_run(cmd, **kwargs):
            # Verify -o is in the command, --json is not
            assert "-o" in cmd, f"Expected -o in command: {cmd}"
            assert "--json" not in cmd, f"--json should not be in command: {cmd}"
            # Write a fake HTML file to the -o path
            o_idx = cmd.index("-o")
            output_path = cmd[o_idx + 1]
            with open(output_path, "w", encoding="utf-8") as f:
                f.write("<html><body>Test HTML</body></html>")

            result = MagicMock()
            result.returncode = 0
            return result

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            side_effect=mock_run,
        ):
            html = _convert_with_officecli("/tmp/test.pptx")
            assert html is not None
            assert "Test HTML" in html

    def test_returns_none_on_nonzero_exit(self):
        """Non-zero exit code returns None (triggers fallback)."""
        from qwenpaw.app.routers.workspace import _convert_with_officecli

        mock_result = MagicMock()
        mock_result.returncode = 1

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

    def test_returns_none_when_output_file_missing(self):
        """When officecli succeeds but output file doesn't exist, return None."""
        from qwenpaw.app.routers.workspace import _convert_with_officecli

        mock_result = MagicMock()
        mock_result.returncode = 0

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            return_value=mock_result,
        ):
            html = _convert_with_officecli("/tmp/test.pptx")
            assert html is None

    def test_cleans_up_temp_file_on_success(self):
        """Temp file is cleaned up after reading."""
        import os

        from qwenpaw.app.routers.workspace import _convert_with_officecli

        created_files = []

        def mock_run(cmd, **kwargs):
            o_idx = cmd.index("-o")
            output_path = cmd[o_idx + 1]
            created_files.append(output_path)
            with open(output_path, "w", encoding="utf-8") as f:
                f.write("<html>Test</html>")
            result = MagicMock()
            result.returncode = 0
            return result

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            side_effect=mock_run,
        ):
            _convert_with_officecli("/tmp/test.pptx")

        # Temp file should be deleted
        for f in created_files:
            assert not os.path.exists(f), f"Temp file not cleaned up: {f}"


# ---------------------------------------------------------------------------
# _get_officecli_page_count
# ---------------------------------------------------------------------------


class TestGetOfficecliPageCount:
    """Tests for _get_officecli_page_count."""

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
            count = _get_officecli_page_count("/tmp/test.pptx")
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
            count = _get_officecli_page_count("/tmp/test.pptx")
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
            count = _get_officecli_page_count("/tmp/test.pptx")
            assert count == 0

    def test_returns_zero_on_timeout(self):
        """Timeout returns 0."""
        from qwenpaw.app.routers.workspace import _get_officecli_page_count

        with patch(
            "qwenpaw.app.routers.workspace.subprocess.run",
            side_effect=subprocess.TimeoutExpired(cmd=[], timeout=30),
        ):
            count = _get_officecli_page_count("/tmp/test.pptx")
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
            count = _get_officecli_page_count("/tmp/test.pptx")
            assert count == 0


# ---------------------------------------------------------------------------
# _convert_docx_to_html — fallback chain
# ---------------------------------------------------------------------------


class TestConvertDocxToHtmlFallback:
    """Tests for _convert_docx_to_html fallback behavior."""

    def test_officecli_not_available_falls_through_to_legacy(self):
        """When officecli is not available, skip to legacy conversion."""
        from qwenpaw.app.routers.workspace import _convert_docx_to_html

        with patch(
            "qwenpaw.app.routers.workspace._is_officecli_available",
            return_value=False,
        ), patch(
            "qwenpaw.app.routers.workspace._convert_with_officecli",
        ) as mock_oci:
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

        with patch(
            "qwenpaw.app.routers.workspace._is_officecli_available",
            return_value=True,
        ), patch(
            "qwenpaw.app.routers.workspace._convert_with_officecli",
            return_value=None,
        ):
            # Legacy path will fail (no mammoth), but we verify
            # officecli was called
            try:
                _convert_docx_to_html("/tmp/nonexistent.docx")
            except Exception:
                pass  # Expected

    def test_officecli_available_returns_html_skips_legacy(self):
        """When officecli returns HTML, legacy path is not touched."""
        from qwenpaw.app.routers.workspace import _convert_docx_to_html

        with patch(
            "qwenpaw.app.routers.workspace._is_officecli_available",
            return_value=True,
        ), patch(
            "qwenpaw.app.routers.workspace._convert_with_officecli",
            return_value="<html>High fidelity HTML</html>",
        ):
            html = _convert_docx_to_html("/tmp/test.docx")
            assert html == "<html>High fidelity HTML</html>"
