# -*- coding: utf-8 -*-
"""Catalog is the single kind table; guide and renderers must not drift."""

from __future__ import annotations

import re
from pathlib import Path

from qwenpaw.plugins_bundle.ugsci.genui import schema as _schema_mod
from qwenpaw.plugins_bundle.ugsci.genui.guide import get_genui_guide
from qwenpaw.plugins_bundle.ugsci.genui.schema import (
    UI_TREE_SCHEMA,
    _ALLOWED_KINDS,
    _COMPONENT_CATALOG,
    _FULL_KINDS,
    _PHASE3_KINDS,
    list_component_catalog,
)

_QUOTED_KIND = re.compile(r'"([A-Z][A-Za-z0-9]+)"')
_LAYOUT_KEY = re.compile(r"(?:^|\n)\s+([A-Z][A-Za-z0-9]+):\s*\"")

_GENUI_UI = (
    Path(_schema_mod.__file__).resolve().parents[1] / "ui" / "src" / "genui"
)


def _catalog_kinds() -> list[str]:
    return [str(entry["kind"]) for entry in list_component_catalog()]


def _kinds_mentioned(*relative: str) -> set[str]:
    found: set[str] = set()
    for rel in relative:
        text = (_GENUI_UI / rel).read_text(encoding="utf-8")
        found.update(_QUOTED_KIND.findall(text))
        found.update(_LAYOUT_KEY.findall(text))
    return found


def test_allowed_kinds_match_catalog_order() -> None:
    kinds = _catalog_kinds()
    assert kinds == list(_ALLOWED_KINDS)
    assert kinds == [str(entry["kind"]) for entry in _COMPONENT_CATALOG]


def test_schema_enum_matches_catalog() -> None:
    enum = UI_TREE_SCHEMA["$defs"]["node"]["properties"]["kind"]["enum"]
    assert enum == _catalog_kinds()


def test_full_kinds_is_catalog_plus_phase3() -> None:
    catalog = set(_catalog_kinds())
    unsafe = set(_PHASE3_KINDS)
    assert not catalog & unsafe
    assert list(_FULL_KINDS) == _catalog_kinds() + list(_PHASE3_KINDS)


def test_guide_allowed_kinds_match_catalog() -> None:
    guide = get_genui_guide()
    assert guide["allowed_kinds"] == _catalog_kinds()
    assert "list_ui_components" in str(guide.get("kind_source", ""))


def test_registry_covers_catalog() -> None:
    catalog = set(_catalog_kinds())
    mentioned = _kinds_mentioned("components/GenUiRegistry.tsx")
    missing = sorted(catalog - mentioned)
    assert not missing, f"Registry missing catalog kinds: {missing}"


def test_html_walker_covers_catalog() -> None:
    catalog = set(_catalog_kinds())
    mentioned = _kinds_mentioned(
        "lib/genUiHtmlRender.ts",
        "lib/genUiModel.ts",
    )
    missing = sorted(catalog - mentioned)
    assert not missing, f"HTML walker missing catalog kinds: {missing}"
