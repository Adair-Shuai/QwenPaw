# -*- coding: utf-8 -*-
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from qwenpaw.plugins_bundle.ugsci.docs_api import build_docs_router


PLUGIN_DIR = (
    Path(__file__).resolve().parents[4]
    / "src"
    / "qwenpaw"
    / "plugins_bundle"
    / "ugsci"
)


def _client() -> TestClient:
    app = FastAPI()
    app.include_router(
        build_docs_router(PLUGIN_DIR),
        prefix="/api/ugsci/docs",
    )
    return TestClient(app)


def test_offline_manual_and_assets_are_served() -> None:
    client = _client()

    index = client.get("/api/ugsci/docs/")
    assert index.status_code == 200
    assert "零基础使用手册" in index.text
    assert "UGSci 0.6.0" in index.text

    stylesheet = client.get("/api/ugsci/docs/css/style.css")
    assert stylesheet.status_code == 200
    assert "--sidebar-w" in stylesheet.text

    screenshot = client.get(
        "/api/ugsci/docs/assets/screenshots/01-home.png",
    )
    assert screenshot.status_code == 200
    assert screenshot.headers["content-type"].startswith("image/png")
    assert screenshot.content.startswith(b"\x89PNG\r\n\x1a\n")


def test_docs_router_rejects_path_traversal() -> None:
    response = _client().get("/api/ugsci/docs/%2e%2e/plugin.py")
    assert response.status_code == 404


def test_legacy_software_doc_is_not_served_as_a_second_source() -> None:
    """The retired hand-written HTML document must stay out of runtime docs."""
    docs_dir = PLUGIN_DIR / "static" / "docs"
    assert not (docs_dir / "ugsci-software-doc.html").exists()

    response = _client().get("/api/ugsci/docs/ugsci-software-doc.html")
    assert response.status_code == 404

    expert_teams = _client().get("/api/ugsci/docs/expert-teams.html")
    assert expert_teams.status_code == 200
    assert "后端是唯一真源" in expert_teams.text
    assert "自定义团队存储在浏览器" not in expert_teams.text
