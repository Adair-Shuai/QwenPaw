# -*- coding: utf-8 -*-
# flake8: noqa: E501
# pylint: disable=line-too-long,too-many-return-statements
import os
import mimetypes
import re
import unicodedata
import zipfile
from urllib.parse import unquote

from agentscope.tool import ToolChunk
from agentscope.message import ToolResultState
from agentscope.message import TextBlock, DataBlock, URLSource

from ...runtime.tool_registry import tool_descriptor
from .file_io import _resolve_file_path, _path_to_file_url


@tool_descriptor(
    requires_sandbox=("file_read",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="SendFileToUser",
    default_policy="allow",
    policy_reason="File send to user (global)",
    ui_description="Send files to user",
    ui_icon="📤",
)
async def send_file_to_user(
    file_path: str,
    required_text: list[str] | None = None,
    forbidden_text: list[str] | None = None,
) -> ToolChunk:
    """Send a file to the user after optional artifact assertions.

    Args:
        file_path (`str`):
            Path to the file to send.
        required_text (`list[str] | None`):
            Text strings that must be present before sending. For DOCX,
            visible Word text is extracted from ``word/*.xml``.
        forbidden_text (`list[str] | None`):
            Text strings that must not be present before sending.

    Returns:
        `ToolChunk`:
            The tool response containing the file or an error message.
    """

    # Decode percent-encoded chars (model may pass URL-encoded paths from context)
    # then normalize Unicode (macOS NFD vs NFC).
    file_path = unquote(file_path)
    file_path = os.path.expanduser(unicodedata.normalize("NFC", file_path))

    # Join a relative path onto the primary project dir. NOT a containment
    # check — access is gated by the governance rules and the guard chain
    # (see ``_resolve_file_path``). The guard is only for malformed input
    # that ``Path`` itself rejects (e.g. an embedded NUL byte).
    try:
        file_path = _resolve_file_path(file_path)
    except ValueError as e:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.SUCCESS,
            content=[TextBlock(text=f"Error: {e}")],
        )

    if not os.path.exists(file_path):
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    text=f"Error: The file {file_path} does not exist.",
                ),
            ],
        )

    if not os.path.isfile(file_path):
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    text=f"Error: The path {file_path} is not a file.",
                ),
            ],
        )

    office_ext = os.path.splitext(file_path)[1].lower()
    extracted_text = ""
    if office_ext in {".docx", ".xlsx", ".pptx"}:
        try:
            with zipfile.ZipFile(file_path) as archive:
                bad_member = archive.testzip()
                if bad_member is not None:
                    raise ValueError(f"corrupt ZIP member: {bad_member}")
                if "[Content_Types].xml" not in archive.namelist():
                    raise ValueError("missing [Content_Types].xml")
                xml_parts = [
                    name
                    for name in archive.namelist()
                    if name.endswith(".xml")
                    and (
                        name.startswith("word/")
                        or name.startswith("xl/")
                        or name.startswith("ppt/")
                    )
                ]
                extracted_text = "\n".join(
                    re.sub(
                        r"<[^>]+>",
                        "",
                        archive.read(name).decode("utf-8", "ignore"),
                    )
                    for name in xml_parts
                )
        except (OSError, zipfile.BadZipFile, ValueError) as exc:
            return ToolChunk(
                is_last=True,
                state=ToolResultState.ERROR,
                content=[
                    TextBlock(
                        text=f"Error: invalid Office artifact {file_path}: {exc}",
                    ),
                ],
            )

    missing = [
        text for text in (required_text or []) if text not in extracted_text
    ]
    unexpected = [
        text for text in (forbidden_text or []) if text in extracted_text
    ]
    if missing or unexpected:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    text=(
                        "Error: artifact content assertions failed: "
                        f"missing={missing}, forbidden_present={unexpected}"
                    ),
                ),
            ],
        )

    # Detect MIME type
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type is None:
        # Default to application/octet-stream for unknown types
        mime_type = "application/octet-stream"

    try:
        file_url = _path_to_file_url(file_path)

        return ToolChunk(
            is_last=True,
            state=ToolResultState.SUCCESS,
            content=[
                DataBlock(
                    source=URLSource(
                        url=file_url,
                        media_type=mime_type,
                    ),
                    name=os.path.basename(file_path),
                ),
                TextBlock(text="File sent successfully."),
            ],
        )

    except Exception as e:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    text=f"Error: Send file failed due to \n{e}",
                ),
            ],
        )
