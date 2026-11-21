# -*- coding: utf-8 -*-
"""Exercise the upload route with actual Office XML and PDF bytes."""

import importlib.util
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject

spec = importlib.util.spec_from_file_location(
    "brainstorm_materials",
    Path(__file__).parents[1] / "backend/materials.py",
)
materials = importlib.util.module_from_spec(spec)
spec.loader.exec_module(materials)
app = FastAPI()
app.include_router(materials.router)


def office(files):
    data = BytesIO()
    with ZipFile(data, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, content.encode("utf-8"))
    return data.getvalue()


def upload(name, data):
    with TestClient(app) as client:
        return client.post("/materials/extract", files={"file": (name, data)})


def document(text):
    return office(
        {
            "word/document.xml": (
                f'<w:document xmlns:w="{materials.WORD[1:-1]}"><w:body>'
                f"<w:p><w:r><w:t>{text}</w:t></w:r></w:p>"
                "</w:body></w:document>"
            ),
        }
    )


def test_word_paragraph_location_and_explicit_truncation():
    response = upload("notes.docx", document("预算从三万增加到五万"))
    assert response.json() == {
        "text": "[第 1 段]\n预算从三万增加到五万",
        "truncated": False,
    }
    long = upload("notes.docx", document("研" * 13000)).json()
    assert long["truncated"] and len(long["text"]) == materials.MAX_TEXT


def test_slides_use_presentation_order_including_reordered_slides():
    data = {
        "ppt/presentation.xml": (
            f'<p:presentation xmlns:p="{materials.PRESENTATION[1:-1]}"'
            f' xmlns:r="{materials.RELATION[1:-1]}"><p:sldIdLst>'
            '<p:sldId r:id="two"/><p:sldId r:id="one"/>'
            "</p:sldIdLst></p:presentation>"
        ),
        "ppt/_rels/presentation.xml.rels": (
            "<Relationships>"
            '<Relationship Id="one" Target="slides/slide1.xml"/>'
            '<Relationship Id="two" Target="/ppt/slides/slide2.xml"/>'
            "</Relationships>"
        ),
    }
    for i in (1, 2):
        data[f"ppt/slides/slide{i}.xml"] = (
            f'<a:p xmlns:a="{materials.DRAWING[1:-1]}">'
            f"<a:r><a:t>idea {i}</a:t></a:r></a:p>"
        )
    assert upload("talk.pptx", office(data)).json()["text"] == (
        "[幻灯片 1]\nidea 2\n\n[幻灯片 2]\nidea 1"
    )


def test_pdf_page_evidence_and_image_only_feedback():
    writer = PdfWriter()
    page = writer.add_blank_page(200, 200)
    output = BytesIO()
    writer.write(output)
    assert "扫描件" in upload("scan.pdf", output.getvalue()).json()["detail"]
    font = DictionaryObject(
        {
            NameObject("/Type"): NameObject("/Font"),
            NameObject("/Subtype"): NameObject("/Type1"),
            NameObject("/BaseFont"): NameObject("/Helvetica"),
        }
    )
    page[NameObject("/Resources")] = DictionaryObject(
        {
            NameObject("/Font"): DictionaryObject({NameObject("/F1"): font}),
        }
    )
    stream = DecodedStreamObject()
    stream.set_data(b"BT /F1 12 Tf 10 20 Td (Consider a counterexample) Tj ET")
    page[NameObject("/Contents")] = writer._add_object(stream)
    output = BytesIO()
    writer.write(output)
    assert upload("research.pdf", output.getvalue()).json()["text"] == (
        "[第 1 页]\nConsider a counterexample"
    )


@pytest.mark.parametrize(
    ("name", "data", "status"),
    [
        ("bad.pptx", b"broken", 422),
        ("old.doc", b"old", 415),
        ("huge.pdf", b"x" * (materials.MAX_BYTES + 1), 413),
    ],
    ids=["broken-slides", "unsupported-type", "oversize"],
)
def test_bad_material_does_not_enter_the_discussion(name, data, status):
    assert upload(name, data).status_code == status
