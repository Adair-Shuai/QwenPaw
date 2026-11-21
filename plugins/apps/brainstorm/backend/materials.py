# -*- coding: utf-8 -*-
"""Extract editable, location-labelled source material for a discussion."""

from __future__ import annotations

import posixpath
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

from fastapi import APIRouter, File, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

router = APIRouter()
MAX_BYTES = 8 * 1024 * 1024
MAX_TEXT = 12_000
OFFICE = "http://schemas.openxmlformats.org"
WORD = f"{{{OFFICE}/wordprocessingml/2006/main}}"
DRAWING = f"{{{OFFICE}/drawingml/2006/main}}"
PRESENTATION = f"{{{OFFICE}/presentationml/2006/main}}"
RELATION = f"{{{OFFICE}/officeDocument/2006/relationships}}"


class MaterialError(ValueError):
    """A source document needs user action before it can be read."""


def _paragraphs(root, namespace):
    for node in root.iter(namespace + "p"):
        yield "".join(t.text or "" for t in node.iter(namespace + "t"))


def _office_sections(raw, suffix):
    from defusedxml.ElementTree import fromstring

    with ZipFile(BytesIO(raw)) as archive:
        entries = archive.infolist()
        if (
            len(entries) > 4000
            or sum(e.file_size for e in entries) > 64 * 1024**2
        ):
            raise MaterialError("文稿展开后过大，请拆分材料。")

        def read_xml(name):
            if archive.getinfo(name).file_size > MAX_BYTES:
                raise MaterialError("文稿单页内容过大，请拆分材料。")
            return fromstring(archive.read(name))

        if suffix == ".docx":
            document = read_xml("word/document.xml")
            for number, paragraph in enumerate(_paragraphs(document, WORD), 1):
                yield f"第 {number} 段", paragraph
            return

        slides = read_xml("ppt/presentation.xml")
        links = read_xml("ppt/_rels/presentation.xml.rels")
        targets = {
            link.attrib["Id"]: link.attrib["Target"]
            for link in links
            if link.get("TargetMode") != "External"
        }
        slide_ids = list(slides.iter(PRESENTATION + "sldId"))
        if len(slide_ids) > 250:
            raise MaterialError("幻灯片超过 250 页，请拆分材料。")
        for number, slide in enumerate(slide_ids, 1):
            target = targets[slide.attrib[RELATION + "id"]]
            path = posixpath.normpath(posixpath.join("/ppt", target)).lstrip(
                "/"
            )
            if not path.startswith("ppt/slides/"):
                raise MaterialError("幻灯片引用无效。")
            yield f"幻灯片 {number}", "\n".join(
                _paragraphs(read_xml(path), DRAWING)
            )


def _pdf_sections(raw):
    from pypdf import PdfReader

    reader = PdfReader(BytesIO(raw))
    if reader.is_encrypted:
        raise MaterialError("请上传已解除密码保护的 PDF。")
    if len(reader.pages) > 250:
        raise MaterialError("PDF 超过 250 页，请拆分材料。")
    for number, page in enumerate(reader.pages, 1):
        yield f"第 {number} 页", page.extract_text() or ""


def _extract(raw, suffix):
    sections = (
        _pdf_sections(raw)
        if suffix == ".pdf"
        else _office_sections(raw, suffix)
    )
    chunks = []
    size = 0
    try:
        for label, text in sections:
            if not text.strip():
                continue
            chunk = ("\n\n" if chunks else "") + f"[{label}]\n{text.strip()}"
            available = MAX_TEXT - size
            if len(chunk) > available:
                chunks.append(chunk[:available])
                return {"text": "".join(chunks), "truncated": True}
            chunks.append(chunk)
            size += len(chunk)
    finally:
        sections.close()
    if not chunks:
        raise MaterialError(
            "没有可读取的文字。扫描件可先识别文字，再粘贴摘录。"
        )
    return {"text": "".join(chunks), "truncated": False}


@router.post("/materials/extract")
async def extract_material(file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".docx", ".pptx", ".pdf"}:
        raise HTTPException(
            415, "请选择 PDF、Word（DOCX）或 PowerPoint（PPTX）。"
        )
    raw = await file.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise HTTPException(413, "单份文稿最多 8 MB，请拆分材料。")
    try:
        return await run_in_threadpool(_extract, raw, suffix)
    except MaterialError as exc:
        raise HTTPException(422, str(exc)) from exc
    except ImportError as exc:
        raise HTTPException(
            503, "文稿读取组件不可用，请修复应用依赖或粘贴文字。"
        ) from exc
    except Exception as exc:
        raise HTTPException(
            422, "无法读取文稿，请检查格式或粘贴文字。"
        ) from exc
