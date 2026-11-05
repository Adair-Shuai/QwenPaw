# -*- coding: utf-8 -*-
"""Real HTTP and storage regression for display-only expert metadata."""

import importlib.util
import errno
import json
import os
import stat
import subprocess
import sys
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[4]


@pytest.fixture(
    name="presentation_env",
    params=["plugins/bundle/ugsci", "src/qwenpaw/plugins_bundle/ugsci"],
)
def _presentation_env(request, tmp_path, monkeypatch):
    spec = importlib.util.spec_from_file_location(
        "expert_presentation_under_test",
        ROOT / request.param / "expert_presentation.py",
    )
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    workspaces = {key: tmp_path / key for key in ["a", "b"]}
    for workspace in workspaces.values():
        workspace.mkdir()
        (workspace / "PROFILE.md").write_text("原有角色提示词", encoding="utf-8")
        (workspace / "agent.json").write_text(
            '{"name":"original"}',
            encoding="utf-8",
        )
    from qwenpaw.config import utils as config_utils

    config_path = tmp_path / "config.json"
    config_path.write_text(
        json.dumps(
            {
                "agents": {
                    "profiles": {
                        key: {
                            "id": key,
                            "name": key,
                            "workspace_dir": str(workspace),
                        }
                        for key, workspace in workspaces.items()
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(config_utils, "get_config_path", lambda: config_path)
    monkeypatch.setattr(config_utils, "_config_cache", None)
    monkeypatch.setattr(config_utils, "_config_mtime", None)
    app = FastAPI()
    app.include_router(
        module.build_expert_presentation_router(),
        prefix="/experts",
    )
    return TestClient(app), workspaces


def test_display_metadata_roundtrip_preserves_prompts_and_agent_isolation(
    presentation_env,
):
    client, workspaces = presentation_env
    initial = client.get("/experts/a/presentation").json()
    assert initial["revision"] == 0
    edited = {
        **initial,
        "display_name": "库存评价",
        "category": "油气工程",
        "summary": "检查资料与计算结果",
    }
    result = client.put("/experts/a/presentation", json=edited)
    assert result.status_code == 200
    assert result.json()["revision"] == 1
    assert client.get("/experts/a/presentation").json() == result.json()
    assert client.get("/experts/b/presentation").json() == initial
    saved = json.loads(
        (workspaces["a"] / "ugsci/expert-card.json").read_text("utf-8"),
    )
    assert saved == result.json()
    assert (workspaces["a"] / "PROFILE.md").read_text("utf-8") == "原有角色提示词"
    assert (workspaces["a"] / "agent.json").read_text(
        "utf-8",
    ) == '{"name":"original"}'


def test_display_metadata_rejects_stale_invalid_and_unknown_updates(
    presentation_env,
):
    client, workspaces = presentation_env
    body = client.get("/experts/a/presentation").json()
    with ThreadPoolExecutor(2) as pool:
        responses = list(
            pool.map(
                lambda _: client.put("/experts/a/presentation", json=body),
                range(2),
            ),
        )
    assert sorted(r.status_code for r in responses) == [200, 409], [
        (r.status_code, r.text) for r in responses
    ]
    snapshot = (workspaces["a"] / "ugsci/expert-card.json").read_bytes()
    assert (
        client.put(
            "/experts/a/presentation",
            json={**body, "category": "不存在"},
        ).status_code
        == 422
    )
    assert (
        client.put(
            "/experts/a/presentation",
            json={**body, "summary": "x" * 181},
        ).status_code
        == 422
    )
    assert (
        client.put(
            "/experts/a/presentation",
            json={**body, "tools": {}},
        ).status_code
        == 422
    )
    assert (
        client.put("/experts/missing/presentation", json=body).status_code
        == 404
    )
    assert (
        workspaces["a"] / "ugsci/expert-card.json"
    ).read_bytes() == snapshot


def test_display_metadata_corruption_is_not_silently_overwritten(
    presentation_env,
):
    client, workspaces = presentation_env
    path = workspaces["a"] / "ugsci/expert-card.json"
    path.parent.mkdir()
    path.write_text("broken-json", encoding="utf-8")
    assert client.get("/experts/a/presentation").status_code == 500
    assert (
        client.put("/experts/a/presentation", json={"revision": 0}).status_code
        == 500
    )
    assert path.read_text("utf-8") == "broken-json"


@pytest.mark.parametrize("operation", ["get", "put"])
def test_display_metadata_handles_directory_creation_during_resolution(
    presentation_env,
    monkeypatch,
    operation,
):
    """Real directory creation can change the error during path resolution."""
    client, workspaces = presentation_env
    target = workspaces["a"] / "ugsci/expert-card.json"
    entered, release = threading.Event(), threading.Event()
    if os.name == "nt":
        import ntpath

        owner, attribute = ntpath, "_getfinalpathname"
        missing_path = target
    else:
        owner, attribute = os, "lstat"
        missing_path = target.parent
    original = getattr(owner, attribute)
    missing_key = os.path.normcase(str(missing_path))

    def lookup(path, *args, **kwargs):
        try:
            return original(path, *args, **kwargs)
        except OSError as exc:
            if (
                exc.errno == errno.ENOENT
                and os.path.normcase(path) == missing_key
                and not entered.is_set()
            ):
                entered.set()
                assert release.wait(5), "Directory creation was not released"
            raise

    monkeypatch.setattr(owner, attribute, lookup)
    with ThreadPoolExecutor(1) as pool:
        request = pool.submit(
            getattr(client, operation),
            "/experts/a/presentation",
            **({"json": {"revision": 0}} if operation == "put" else {}),
        )
        try:
            assert entered.wait(
                5,
            ), "Request never reached the real missing parent"
            target.parent.mkdir()
        finally:
            release.set()
        response = request.result(timeout=5)
    assert response.status_code == 200, response.text
    assert response.json()["revision"] == (1 if operation == "put" else 0)


def test_display_metadata_rejects_real_directory_link_escape(presentation_env):
    """Containment still rejects a real redirected metadata directory."""
    client, workspaces = presentation_env
    outside = workspaces["a"].parent / "outside"
    outside.mkdir()
    external = outside / "expert-card.json"
    external.write_text('{"revision": 8}', encoding="utf8")
    before = external.read_bytes()
    link = workspaces["a"] / "ugsci"
    if os.name == "nt":
        result = subprocess.run(
            ["cmd.exe", "/c", "mklink", "/J", str(link), str(outside)],
            capture_output=True,
            check=False,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
        assert result.returncode == 0, result.stderr
        assert link.lstat().st_reparse_tag == stat.IO_REPARSE_TAG_MOUNT_POINT
    else:
        link.symlink_to(outside, target_is_directory=True)
    try:
        assert client.get("/experts/a/presentation").status_code == 400
        assert (
            client.put(
                "/experts/a/presentation",
                json={"revision": 8},
            ).status_code
            == 400
        )
        assert external.read_bytes() == before
    finally:
        if os.name == "nt":
            link.rmdir()
        else:
            link.unlink()
