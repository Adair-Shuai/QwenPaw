# -*- coding: utf-8 -*-
"""FlowForge media trees go through UGSci validate / store."""

from __future__ import annotations

import re

import pytest
from jsonschema.exceptions import ValidationError

from qwenpaw.plugins_bundle.flowforge.engine.io.media import (
    KIND_TO_GENUI,
    MediaRef,
    _validate_gen_ui_tree,
    flowforge_gen_ui_id,
    publish_gen_ui,
    to_gen_ui_tree,
    to_gen_ui_ui,
)
from qwenpaw.plugins_bundle.ugsci.genui.schema import validate_ui_tree

_UI_ID_RE = re.compile(r"^ui_[A-Za-z0-9_-]{4,80}$")


def test_video_and_mesh_preview_as_image() -> None:
    assert KIND_TO_GENUI["video"] == "Image"
    assert KIND_TO_GENUI["model3d"] == "Image"
    video = MediaRef(
        kind="video",
        preview_url="https://example.com/clip.png",
        filename="clip.mp4",
    )
    mesh = MediaRef(
        kind="model3d",
        preview_url="https://example.com/mesh.png",
        filename="mesh.glb",
    )
    assert video.gen_ui_node()["kind"] == "Image"
    assert mesh.gen_ui_node()["kind"] == "Image"


def test_to_gen_ui_tree_is_ugsci_valid() -> None:
    ref = MediaRef(
        kind="image",
        preview_url="https://example.com/a.png",
        filename="a.png",
    )
    tree = to_gen_ui_tree([ref], title="Loaded image")
    validated = validate_ui_tree(tree)
    assert validated["root"]["kind"] == "Stack"
    assert validated["root"]["nodeId"]
    kinds = [validated["root"]["kind"]]
    for child in validated["root"]["children"]:
        kinds.append(child["kind"])
        assert child["nodeId"]
    assert "SectionHeader" in kinds
    assert "Image" in kinds


def test_publish_gen_ui_keeps_canvas_tree_without_session() -> None:
    ref = MediaRef(
        kind="video",
        preview_url="https://example.com/v.png",
        filename="v.mp4",
    )
    ui = to_gen_ui_ui([ref], title="Loaded video")
    assert "gen_ui" in ui
    assert ui["gen_ui"]["root"]["kind"] == "Stack"
    assert "genui" not in ui


def test_publish_gen_ui_stores_when_session_exists(monkeypatch) -> None:
    captured: dict[str, object] = {}

    def fake_store(tree, ui_id=""):
        captured["tree"] = tree
        captured["ui_id"] = ui_id
        return {
            "ok": True,
            "kind": "genui",
            "schema_version": "1",
            "ui_id": ui_id or "ui_ff_stored",
            "revision": 1,
            "tree": tree,
            "tool_call_id": "",
        }

    monkeypatch.setattr(
        "qwenpaw.plugins_bundle.ugsci.genui.emit_core.get_session_id",
        lambda: "sess-1",
    )
    monkeypatch.setattr(
        "qwenpaw.plugins_bundle.ugsci.genui.emit_core.store_validated_tree",
        fake_store,
    )
    tree = to_gen_ui_tree(
        [MediaRef(kind="image", preview_url="https://example.com/a.png")],
        title="Loaded image",
    )
    ui = publish_gen_ui(tree, ui_id="ui_ff_loaded_image")
    assert ui["genui"]["ok"] is True
    assert ui["genui"]["ui_id"] == "ui_ff_loaded_image"
    assert captured["ui_id"] == "ui_ff_loaded_image"


def test_ui_ids_differ_for_different_assets(monkeypatch) -> None:
    ids: list[str] = []

    def fake_store(tree, ui_id=""):
        ids.append(ui_id)
        return {
            "ok": True,
            "kind": "genui",
            "schema_version": "1",
            "ui_id": ui_id,
            "revision": 1,
            "tree": tree,
            "tool_call_id": "",
        }

    monkeypatch.setattr(
        "qwenpaw.plugins_bundle.ugsci.genui.emit_core.get_session_id",
        lambda: "sess-1",
    )
    monkeypatch.setattr(
        "qwenpaw.plugins_bundle.ugsci.genui.emit_core.store_validated_tree",
        fake_store,
    )
    to_gen_ui_ui(
        [
            MediaRef(
                kind="image",
                preview_url="https://example.com/a.png",
                file_id="file-a",
            ),
        ],
        title="Loaded image",
    )
    to_gen_ui_ui(
        [
            MediaRef(
                kind="image",
                preview_url="https://example.com/b.png",
                file_id="file-b",
            ),
        ],
        title="Loaded image",
    )
    assert len(ids) == 2
    assert ids[0] != ids[1]
    assert all(_UI_ID_RE.match(item) for item in ids)


def test_flowforge_ui_id_fits_ugsci_pattern() -> None:
    long_src = "https://example.com/" + ("x" * 200)
    ui_id = flowforge_gen_ui_id("preview", "node-1", long_src)
    assert _UI_ID_RE.match(ui_id)
    other = flowforge_gen_ui_id("preview", "node-2", long_src)
    assert ui_id != other


def test_invalid_kind_is_not_swallowed() -> None:
    with pytest.raises(ValidationError):
        _validate_gen_ui_tree(
            {
                "schemaVersion": "1",
                "root": {"kind": "WeatherCard", "props": {}, "children": []},
            },
        )
