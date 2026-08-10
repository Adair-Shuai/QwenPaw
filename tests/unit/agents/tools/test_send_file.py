# -*- coding: utf-8 -*-
"""Tests for send_file_to_user artifact validation."""

import zipfile

import pytest
from agentscope.message import ToolResultState


@pytest.mark.asyncio
async def test_rejects_invalid_docx(tmp_path):
    from qwenpaw.agents.tools.send_file import send_file_to_user

    path = tmp_path / "broken.docx"
    path.write_text("not an OOXML archive", encoding="utf-8")
    chunk = await send_file_to_user(str(path))
    assert chunk.state == ToolResultState.ERROR
    assert "invalid Office artifact" in chunk.content[0].text


@pytest.mark.asyncio
async def test_required_and_forbidden_text_assertions(tmp_path):
    from qwenpaw.agents.tools.send_file import send_file_to_user

    path = tmp_path / "sample.docx"
    with zipfile.ZipFile(path, "w") as archive:
        archive.writestr("[Content_Types].xml", "<Types/>")
        archive.writestr(
            "word/document.xml",
            "<w:document><w:t>北京某公司</w:t></w:document>",
        )

    ok = await send_file_to_user(
        str(path),
        required_text=["北京某公司"],
        forbidden_text=["成都理工大学"],
    )
    assert ok.state == ToolResultState.SUCCESS

    bad = await send_file_to_user(
        str(path),
        required_text=["另一家公司"],
    )
    assert bad.state == ToolResultState.ERROR
    assert "missing=['另一家公司']" in bad.content[0].text
