# -*- coding: utf-8 -*-
"""Office document tools powered by OfficeCLI.

These tools wrap the ``officecli`` command-line utility to provide
structured Office document creation, modification, and inspection
capabilities for AI agents.

OfficeCLI supports Word (.docx), Excel (.xlsx), and PowerPoint (.pptx)
with high-fidelity rendering. When ``officecli`` is not installed, all
tools return a friendly error message guiding the user to install it.

Tool list (11 tools):
    - office_create_document
    - office_add_element
    - office_set_properties
    - office_get_element
    - office_query_elements
    - office_remove_element
    - office_view_document
    - office_view_screenshot
    - office_validate_document
    - office_merge_template
    - office_batch_operations
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import shutil
from pathlib import Path
from typing import Any

from agentscope.message import DataBlock, TextBlock, URLSource
from agentscope.message import ToolResultState
from agentscope.tool import ToolChunk

from ...config.context import get_current_workspace_dir
from ...constant import WORKING_DIR
from ...runtime.tool_registry import tool_descriptor
from .file_io import _path_to_file_url, _resolve_file_path

logger = logging.getLogger(__name__)

_OFFICECLI_TIMEOUT = 60  # seconds


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _officecli_available() -> bool:
    """Check if the officecli binary is on PATH."""
    return shutil.which("officecli") is not None


def _officecli_bin() -> str:
    """Return the resolved officecli executable path.

    On Windows, npm-installed CLIs are ``.cmd`` wrappers.
    ``asyncio.create_subprocess_exec`` cannot find them by bare name,
    so we resolve the full path via ``shutil.which``.
    """
    resolved = shutil.which("officecli")
    return resolved or "officecli"


def _not_installed_error() -> ToolChunk:
    """Return a standard error ToolChunk when officecli is missing."""
    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[
            TextBlock(
                type="text",
                text=json.dumps(
                    {
                        "ok": False,
                        "error": (
                            "officecli is not installed. "
                            "Install from: "
                            "https://github.com/iOfficeAI/OfficeCLI/releases"
                        ),
                    },
                    ensure_ascii=False,
                    indent=2,
                ),
            ),
        ],
    )


def _json_toolchunk(data: Any) -> ToolChunk:
    """Wrap a dict/list as a ToolChunk with pretty-printed JSON text."""
    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[
            TextBlock(
                type="text",
                text=json.dumps(data, ensure_ascii=False, indent=2),
            ),
        ],
    )


async def _run_officecli(  # pylint: disable=too-many-return-statements
    *args: str,
    timeout: float = _OFFICECLI_TIMEOUT,
) -> dict[str, Any]:
    """Run an officecli command and return parsed JSON output.

    Returns ``{"ok": False, "error": "..."}`` on any failure.
    """
    if not _officecli_available():
        return {
            "ok": False,
            "error": (
                "officecli is not installed. "
                "Install from: "
                "https://github.com/iOfficeAI/OfficeCLI/releases"
            ),
        }

    cmd = [_officecli_bin(), *args, "--json"]
    logger.debug("Running officecli: %s", " ".join(cmd))

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
    except FileNotFoundError:
        return {"ok": False, "error": "officecli binary not found"}

    try:
        stdout, stderr = await asyncio.wait_for(
            proc.communicate(),
            timeout=timeout,
        )
    except asyncio.TimeoutError:
        proc.kill()
        await proc.wait()
        return {"ok": False, "error": "officecli command timed out"}

    stdout_text = stdout.decode(errors="replace") if stdout else ""
    stderr_text = stderr.decode(errors="replace") if stderr else ""

    # OfficeCLI outputs structured JSON on stdout even on non-zero exit.
    # Try to parse stdout JSON first, regardless of return code.
    parsed: Any = None
    if stdout_text.strip():
        try:
            parsed = json.loads(stdout_text)
        except json.JSONDecodeError:
            pass

    if proc.returncode != 0:
        if isinstance(parsed, dict):
            # OfficeCLI error format: {"success": false, "error": {...}}
            # Normalise into our own shape
            err_obj = parsed.get("error", parsed.get("message", ""))
            if isinstance(err_obj, dict):
                err_str = err_obj.get("error", str(err_obj))
            else:
                err_str = str(err_obj)
            return {
                "ok": False,
                "success": False,
                "error": err_str or stderr_text.strip()
                or f"officecli exited with code {proc.returncode}",
            }
        return {
            "ok": False,
            "success": False,
            "error": stderr_text.strip()
            or f"officecli exited with code {proc.returncode}",
        }

    if parsed is None:
        return {
            "ok": False,
            "success": False,
            "error": "officecli returned no output",
            "raw": stdout_text[:500],
        }

    # Normalise: ensure "ok" key exists for success cases
    if isinstance(parsed, dict) and "ok" not in parsed:
        parsed["ok"] = parsed.get("success", True)
    return parsed


def _resolve_workspace_path(file_path: str) -> str:
    """Resolve a file path relative to the workspace."""
    return _resolve_file_path(file_path)


# ---------------------------------------------------------------------------
# Tool 1: office_create_document
# ---------------------------------------------------------------------------


@tool_descriptor(
    requires_sandbox=("file_write",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeCreate",
    ui_description="Create Office documents (Word/Excel/PowerPoint)",
    ui_icon="📄",
)
async def office_create_document(file_path: str) -> ToolChunk:
    """Create a blank Office document (.docx, .xlsx, or .pptx).

    The document type is determined by the file extension.

    Args:
        file_path (`str`):
            Path for the new document. Must end with .docx, .xlsx,
            or .pptx.

    Returns:
        `ToolChunk`:
            JSON with creation result.
    """
    resolved = _resolve_workspace_path(file_path)
    result = await _run_officecli("create", resolved)
    return _json_toolchunk(result)


# ---------------------------------------------------------------------------
# Tool 2: office_add_element
# ---------------------------------------------------------------------------


@tool_descriptor(
    requires_sandbox=("file_write",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeAddElement",
    ui_description="Add elements to Office documents",
    ui_icon="➕",
)
async def office_add_element(
    file_path: str,
    parent_path: str,
    element_type: str,
    props: dict[str, Any] | None = None,
) -> ToolChunk:
    """Add an element to an Office document.

    Args:
        file_path (`str`):
            Document path.
        parent_path (`str`):
            Parent element path (e.g. "/" for root, "/slide[1]" for
            slide 1).
        element_type (`str`):
            Element type (slide, shape, paragraph, sheet, row, cell,
            etc.).
        props (`dict[str, Any] | None`):
            Element properties (e.g. {"title": "Hello",
            "background": "1A1A2E"}).

    Returns:
        `ToolChunk`:
            JSON with the added element info.
    """
    resolved = _resolve_workspace_path(file_path)
    args = ["add", resolved, parent_path, "--type", element_type]
    for key, value in (props or {}).items():
        args.extend(["--prop", f"{key}={value}"])
    result = await _run_officecli(*args)
    return _json_toolchunk(result)


# ---------------------------------------------------------------------------
# Tool 3: office_set_properties
# ---------------------------------------------------------------------------


@tool_descriptor(
    requires_sandbox=("file_write",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeSetProperties",
    ui_description="Set properties on Office document elements",
    ui_icon="✏️",
)
async def office_set_properties(
    file_path: str,
    path: str,
    props: dict[str, Any],
) -> ToolChunk:
    """Set properties on an element in an Office document.

    Args:
        file_path (`str`):
            Document path.
        path (`str`):
            Element path (e.g. "/slide[1]/shape[2]").
        props (`dict[str, Any]`):
            Properties to set (e.g. {"width": "10cm", "fill": "FF0000"}).

    Returns:
        `ToolChunk`:
            JSON with the update result.
    """
    resolved = _resolve_workspace_path(file_path)
    args = ["set", resolved, path]
    for key, value in props.items():
        args.extend(["--prop", f"{key}={value}"])
    result = await _run_officecli(*args)
    return _json_toolchunk(result)


# ---------------------------------------------------------------------------
# Tool 4: office_get_element
# ---------------------------------------------------------------------------


@tool_descriptor(
    requires_sandbox=("file_read",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeGetElement",
    ui_description="Get element details from Office documents",
    ui_icon="🔍",
)
async def office_get_element(
    file_path: str,
    path: str,
    depth: int = 1,
) -> ToolChunk:
    """Get detailed information about an element in an Office document.

    Args:
        file_path (`str`):
            Document path.
        path (`str`):
            Element path (e.g. "/" for root, "/slide[1]").
        depth (`int`):
            Depth of children to include (default 1).

    Returns:
        `ToolChunk`:
            JSON with element details and children.
    """
    resolved = _resolve_workspace_path(file_path)
    result = await _run_officecli(
        "get",
        resolved,
        path,
        "--depth",
        str(depth),
    )
    return _json_toolchunk(result)


# ---------------------------------------------------------------------------
# Tool 5: office_query_elements
# ---------------------------------------------------------------------------


@tool_descriptor(
    requires_sandbox=("file_read",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeQueryElements",
    ui_description="Query elements in Office documents by selector",
    ui_icon="🔎",
)
async def office_query_elements(
    file_path: str,
    selector: str,
) -> ToolChunk:
    """Query elements in an Office document using a CSS-like selector.

    Args:
        file_path (`str`):
            Document path.
        selector (`str`):
            CSS-like selector (e.g. "slide", "shape[type=text]",
            "paragraph").

    Returns:
        `ToolChunk`:
            JSON with matching elements.
    """
    resolved = _resolve_workspace_path(file_path)
    result = await _run_officecli("query", resolved, selector)
    return _json_toolchunk(result)


# ---------------------------------------------------------------------------
# Tool 6: office_remove_element
# ---------------------------------------------------------------------------


@tool_descriptor(
    requires_sandbox=("file_write",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeRemoveElement",
    ui_description="Remove elements from Office documents",
    ui_icon="🗑️",
)
async def office_remove_element(
    file_path: str,
    path: str,
) -> ToolChunk:
    """Remove an element from an Office document.

    Args:
        file_path (`str`):
            Document path.
        path (`str`):
            Element path to remove (e.g. "/slide[1]/shape[3]").

    Returns:
        `ToolChunk`:
            JSON with removal result.
    """
    resolved = _resolve_workspace_path(file_path)
    result = await _run_officecli("remove", resolved, path)
    return _json_toolchunk(result)


# ---------------------------------------------------------------------------
# Tool 7: office_view_document
# ---------------------------------------------------------------------------


@tool_descriptor(
    requires_sandbox=("file_read",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeViewDocument",
    ui_description="View Office document content (html/outline/issues)",
    ui_icon="👁️",
)
async def office_view_document(
    file_path: str,
    mode: str = "outline",
) -> ToolChunk:
    """View an Office document in text/JSON form.

    Args:
        file_path (`str`):
            Document path (.docx/.xlsx/.pptx).
        mode (`str`):
            View mode: "outline" (document structure), "html" (rendered
            HTML), or "issues" (formatting/accessibility issues).
            Default: "outline".

    Returns:
        `ToolChunk`:
            JSON or text with the document view.
    """
    resolved = _resolve_workspace_path(file_path)
    valid_modes = {"outline", "html", "issues"}
    if mode not in valid_modes:
        return _json_toolchunk({
            "ok": False,
            "error": f"Invalid mode '{mode}'. Use one of: {valid_modes}",
        })

    if mode == "html":
        # "view html" without -o may open a browser.
        # Use -o with a temp file, then read and return the HTML.
        workspace_dir = get_current_workspace_dir() or WORKING_DIR
        tmp_html = str(workspace_dir / f"office_view_{os.getpid()}.html")
        try:
            proc = await asyncio.create_subprocess_exec(
                _officecli_bin(), "view", resolved, "html",
                "-o", tmp_html,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            _stdout, stderr = await asyncio.wait_for(
                proc.communicate(), timeout=_OFFICECLI_TIMEOUT,
            )
            if proc.returncode != 0:
                err = stderr.decode(errors="replace").strip() if stderr else ""
                return _json_toolchunk({
                    "ok": False,
                    "error": f"view html failed: {err}",
                })
            try:
                with open(tmp_html, "r", encoding="utf-8") as f:
                    html_content = f.read()
            finally:
                Path(tmp_html).unlink(missing_ok=True)
            return _json_toolchunk({
                "ok": True,
                "success": True,
                "mode": "html",
                "html": html_content[:50000],  # truncate to avoid huge context
                "truncated": len(html_content) > 50000,
            })
        except asyncio.TimeoutError:
            Path(tmp_html).unlink(missing_ok=True)
            return _json_toolchunk({
                "ok": False,
                "error": "officecli view html timed out",
            })

    result = await _run_officecli("view", resolved, mode)
    return _json_toolchunk(result)


# ---------------------------------------------------------------------------
# Tool 8: office_view_screenshot
# ---------------------------------------------------------------------------


@tool_descriptor(
    requires_sandbox=("file_read",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeScreenshot",
    ui_description="Screenshot Office document pages as PNG",
    ui_icon="📸",
    display_to_user=False,
)
async def office_view_screenshot(
    file_path: str,
    page: int = 1,
) -> ToolChunk:
    """Take a PNG screenshot of an Office document page.

    Used for AI visual inspection — see the rendered document and fix
    issues. The screenshot is returned as an image block that the model
    can perceive (if multimodal) and the user can see.

    Args:
        file_path (`str`):
            Document path (.docx/.xlsx/.pptx).
        page (`int`):
            Page/slide number (1-based). Default: 1.

    Returns:
        `ToolChunk`:
            An image block with the PNG screenshot, or an error message.
    """
    if not _officecli_available():
        return _not_installed_error()

    resolved = _resolve_workspace_path(file_path)

    # Use workspace dir for temp file so it's accessible
    workspace_dir = get_current_workspace_dir() or WORKING_DIR
    tmp_path = str(
        workspace_dir / f"office_screenshot_{os.getpid()}_{page}.png",
    )

    try:
        proc = await asyncio.create_subprocess_exec(
            _officecli_bin(),
            "view",
            resolved,
            "screenshot",
            "--page",
            str(page),
            "-o",
            tmp_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
    except FileNotFoundError:
        return _not_installed_error()

    try:
        _stdout, stderr = await asyncio.wait_for(
            proc.communicate(),
            timeout=_OFFICECLI_TIMEOUT,
        )
    except asyncio.TimeoutError:
        proc.kill()
        await proc.wait()
        return _json_toolchunk({
            "ok": False,
            "error": "officecli screenshot timed out",
        })

    if proc.returncode != 0 or not Path(tmp_path).exists():
        err = stderr.decode(errors="replace").strip() if stderr else ""
        return _json_toolchunk({
            "ok": False,
            "error": f"Screenshot failed: {err}",
        })

    # Return as DataBlock so the model can see the image
    file_url = _path_to_file_url(tmp_path)
    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[
            DataBlock(
                source=URLSource(url=file_url, media_type="image/png"),
                name=Path(resolved).name,
            ),
            TextBlock(
                type="text",
                text=json.dumps(
                    {
                        "ok": True,
                        "path": os.path.abspath(tmp_path),
                        "page": page,
                        "message": (
                            f"Screenshot of {Path(resolved).name} "
                            f"page {page}"
                        ),
                    },
                    ensure_ascii=False,
                    indent=2,
                ),
            ),
        ],
    )


# ---------------------------------------------------------------------------
# Tool 9: office_validate_document
# ---------------------------------------------------------------------------


@tool_descriptor(
    requires_sandbox=("file_read",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeValidate",
    ui_description="Validate Office document format and structure",
    ui_icon="✅",
)
async def office_validate_document(file_path: str) -> ToolChunk:
    """Validate an Office document's format and structure.

    Args:
        file_path (`str`):
            Document path to validate.

    Returns:
        `ToolChunk`:
            JSON with validation results (issues, warnings, etc.).
    """
    resolved = _resolve_workspace_path(file_path)
    result = await _run_officecli("validate", resolved)
    return _json_toolchunk(result)


# ---------------------------------------------------------------------------
# Tool 10: office_merge_template
# ---------------------------------------------------------------------------


@tool_descriptor(
    requires_sandbox=("file_write",),
    async_execution=True,
    tool_type="file",
    target_param="template_path",
    policy_name="OfficeMergeTemplate",
    ui_description="Merge data into Office document templates",
    ui_icon="🔄",
)
async def office_merge_template(
    template_path: str,
    output_path: str,
    data: dict[str, Any],
) -> ToolChunk:
    """Merge data into an Office document template.

    Args:
        template_path (`str`):
            Path to the template document (.docx/.xlsx/.pptx).
        output_path (`str`):
            Path for the output merged document.
        data (`dict[str, Any]`):
            Data to merge into the template (key-value pairs).

    Returns:
        `ToolChunk`:
            JSON with merge result.
    """
    resolved_template = _resolve_workspace_path(template_path)
    resolved_output = _resolve_workspace_path(output_path)

    # Write data to a temp JSON file for officecli --data
    workspace_dir = get_current_workspace_dir() or WORKING_DIR
    data_file = str(workspace_dir / f"merge_data_{os.getpid()}.json")
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    try:
        result = await _run_officecli(
            "merge",
            resolved_template,
            resolved_output,
            "--data",
            data_file,
        )
    finally:
        Path(data_file).unlink(missing_ok=True)

    return _json_toolchunk(result)


# ---------------------------------------------------------------------------
# Tool 11: office_batch_operations
# ---------------------------------------------------------------------------


@tool_descriptor(
    requires_sandbox=("file_write",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeBatch",
    ui_description="Batch multiple operations on Office documents",
    ui_icon="📦",
)
async def office_batch_operations(
    file_path: str,
    commands: list[dict[str, Any]],
) -> ToolChunk:
    """Execute multiple operations on an Office document in sequence.

    Args:
        file_path (`str`):
            Document path.
        commands (`list[dict[str, Any]]`):
            List of operations, each with "action" (add/set/remove/get)
            and relevant parameters (path, type, props, etc.).

    Returns:
        `ToolChunk`:
            JSON with results for each operation.
    """
    resolved = _resolve_workspace_path(file_path)

    # Write commands to a temp JSON file
    workspace_dir = get_current_workspace_dir() or WORKING_DIR
    cmd_file = str(workspace_dir / f"batch_cmds_{os.getpid()}.json")
    with open(cmd_file, "w", encoding="utf-8") as f:
        json.dump(commands, f, ensure_ascii=False)

    try:
        result = await _run_officecli(
            "batch",
            resolved,
            "--input",
            cmd_file,
        )
    finally:
        Path(cmd_file).unlink(missing_ok=True)

    return _json_toolchunk(result)
