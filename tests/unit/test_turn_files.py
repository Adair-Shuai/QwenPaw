# -*- coding: utf-8 -*-
"""Real filesystem coverage for durable per-turn changes and deliveries."""

from __future__ import annotations

import io
import json
import subprocess
import zipfile
from pathlib import Path
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI

from qwenpaw.turn_files import scanner
from qwenpaw.turn_files.store import TurnFileStore, get_store
from qwenpaw.app.routers import turn_files as router


def start(store, project, **overrides):
    values = dict(
        session_id="session-a",
        user_id="user-a",
        channel="console",
        agent_id="agent-a",
        client_message_id="client-a",
        response_id="response-a",
        roots=[(f"project:{project}", project)],
    )
    values.update(overrides)
    return store.start(**values)


@pytest.fixture
def directories(tmp_path):
    workspace, project = tmp_path / "workspace", tmp_path / "project"
    workspace.mkdir()
    project.mkdir()
    return workspace, project


def test_real_turn_diff_uses_dirty_baseline_without_touching_git_index(
    directories,
):
    workspace, project = directories
    subprocess.run(
        ["git", "init", str(project)],
        check=True,
        capture_output=True,
    )
    dirty = project / "dirty.txt"
    dirty.write_bytes(b"staged\r\n")
    subprocess.run(["git", "-C", str(project), "add", "dirty.txt"], check=True)
    index = (project / ".git" / "index").read_bytes()
    dirty.write_bytes(b"user uncommitted\r\n")
    deleted = project / "removed.txt"
    deleted.write_text("old", encoding="utf-8")
    store = TurnFileStore(workspace)
    capture = start(store, project)
    dirty.write_bytes(b"user uncommitted\r\nagent addition\r\n")
    deleted.unlink()
    (project / "shell-created.txt").write_text("new file", encoding="utf-8")
    result = store.finish(capture)
    files = {item["path"]: item for item in result["files"]}
    assert set(files) == {"dirty.txt", "removed.txt", "shell-created.txt"}
    assert files["dirty.txt"]["status"] == "modified"
    assert files["dirty.txt"]["additions"] == 1
    assert files["removed.txt"]["status"] == "deleted"
    assert files["shell-created.txt"]["status"] == "created"
    assert (
        store.get_file(
            result["id"],
            files["dirty.txt"]["id"],
            version="before",
            session_id="session-a",
        )[0]
        == b"user uncommitted\r\n"
    )
    assert (project / ".git" / "index").read_bytes() == index
    assert dirty.read_bytes().endswith(b"agent addition\r\n")
    assert not result["incomplete"]


def test_unchanged_preexisting_files_do_not_appear(directories):
    workspace, project = directories
    (project / "draft.txt").write_text("already dirty", encoding="utf-8")
    store = TurnFileStore(workspace)
    result = store.finish(start(store, project))
    assert result["files"] == []
    assert not result["incomplete"]


def test_delivery_versions_survive_same_turn_changes_and_restart(directories):
    workspace, project = directories
    file = project / "report.txt"
    file.write_bytes(b"original")
    store = TurnFileStore(workspace)
    capture = start(store, project)
    assert store.record_delivery(capture, file)
    file.write_bytes(b"first delivery")
    assert store.record_delivery(capture, file)
    file.write_bytes(b"final working copy")
    result = store.finish(capture, "canceled")
    assert result["status"] == "canceled"
    assert len(result["files"]) == 3
    assert len({item["id"] for item in result["files"]}) == 3
    reopened = TurnFileStore(workspace)
    reads = {
        reopened.get_file(result["id"], item["id"], session_id="session-a")[0]
        for item in result["files"]
    }
    assert reads == {b"original", b"first delivery", b"final working copy"}
    changed = next(
        item for item in result["files"] if item["status"] == "modified"
    )
    assert not changed["delivered"]
    assert reopened.diff(
        result["id"],
        changed["id"],
        session_id="session-a",
    ) == {
        "before": "original",
        "after": "final working copy",
        "truncated": False,
    }
    assert all(
        "_after_blob" not in item
        for item in reopened.get_turn(result["id"], session_id="session-a")[
            "files"
        ]
    )


def test_final_delivery_merges_with_change_and_old_turn_stays_immutable(
    directories,
):
    workspace, project = directories
    store = TurnFileStore(workspace)
    capture = start(store, project)
    file = project / "report.txt"
    file.write_text("version one", encoding="utf-8")
    assert store.record_delivery(capture, file)
    first = store.finish(capture)
    assert len(first["files"]) == 1
    assert first["files"][0]["delivered"]
    capture = start(store, project)
    file.write_text("version two", encoding="utf-8")
    store.finish(capture)
    file.unlink()
    assert (
        store.get_file(
            first["id"],
            first["files"][0]["id"],
            session_id="session-a",
        )[0]
        == b"version one"
    )


def test_explicit_external_delivery_captures_only_authorized_file(
    directories,
    tmp_path,
):
    workspace, project = directories
    store = TurnFileStore(workspace)
    capture = start(store, project)
    external = tmp_path / "temporary-report.txt"
    external.write_bytes(b"delivered bytes")
    sibling = tmp_path / "unrelated.txt"
    sibling.write_bytes(b"do not collect")
    assert store.record_delivery(capture, external)
    external.unlink()
    result = store.finish(capture)
    assert len(result["files"]) == 1
    item = result["files"][0]
    assert item["delivered"] and item["status"] == "delivered"
    assert item["path"] == "temporary-report.txt"
    assert (
        store.get_file(result["id"], item["id"], session_id="session-a")[0]
        == b"delivered bytes"
    )
    assert not result["incomplete"]


def test_history_filters_apply_before_limit(directories):
    workspace, project = directories
    store = TurnFileStore(workspace)
    first = store.finish(start(store, project, response_id="response-first"))
    store.finish(start(store, project, response_id="response-second"))
    found = store.list_turns(
        session_id="session-a",
        response_id="response-first",
        limit=1,
    )
    assert [item["id"] for item in found] == [first["id"]]


@pytest.mark.asyncio
async def test_history_pagination_filters_scope_before_page_boundaries(
    directories,
    monkeypatch,
):
    workspace, project = directories
    store = get_store(workspace)
    expected_ids = set()
    for index in range(5):
        result = store.finish(
            start(store, project, response_id=f"page-{index}"),
        )
        expected_ids.add(result["id"])
        store.finish(start(store, project, session_id="other-session"))
    scope = dict(
        session_id="session-a",
        agent_id="agent-a",
        user_id="user-a",
        channel="console",
    )
    expected = [item["id"] for item in store.list_turns(**scope)]
    assert set(expected) == expected_ids
    assert [
        item["id"] for item in store.list_turns(**scope, limit=2, offset=2)
    ] == expected[2:4]

    class Chats:
        async def get_chat(self, _chat_id):
            return SimpleNamespace(
                session_id="session-a",
                user_id="user-a",
                channel="console",
            )

    async def resolve(_request):
        return SimpleNamespace(
            agent_id="agent-a",
            workspace_dir=workspace,
            chat_manager=Chats(),
        )

    monkeypatch.setattr(router, "get_agent_for_request", resolve)
    app = FastAPI()
    app.include_router(router.router)
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        pages = []
        for offset in (0, 2, 4):
            response = await client.get(
                "/workspace/turn-files",
                params={
                    "session_id": "session-a",
                    "limit": 2,
                    "offset": offset,
                },
                headers={"X-Chat-Id": "chat-a"},
            )
            assert response.status_code == 200
            page = response.json()
            pages.extend(item["id"] for item in page["turns"])
            assert page["has_more"] is (offset < 4)
            if offset < 4:
                assert page["next_offset"] == offset + 2
            else:
                assert "next_offset" not in page
        assert pages == expected
        response = await client.get(
            "/workspace/turn-files",
            params={
                "session_id": "session-a",
                "limit": 1,
                "response_id": "page-0",
            },
            headers={"X-Chat-Id": "chat-a"},
        )
        assert len(response.json()["turns"]) == 1
        assert response.json()["has_more"] is False
        response = await client.get(
            "/workspace/turn-files",
            params={"session_id": "session-a", "offset": -1},
            headers={"X-Chat-Id": "chat-a"},
        )
        assert response.status_code == 422


def test_delivery_is_durable_before_finish_and_id_survives_final_merge(
    directories,
):
    from qwenpaw.turn_files.store import _ACTIVE

    workspace, project = directories
    store = TurnFileStore(workspace)
    capture = start(store, project)
    path = project / "report.txt"
    path.write_bytes(b"sent successfully")
    assert store.record_delivery(capture, path)
    running = store.get_turn(capture.id, session_id="session-a")
    assert running["status"] == "running"
    file_id = running["files"][0]["id"]
    assert (
        TurnFileStore(workspace).get_file(
            capture.id,
            file_id,
            session_id="session-a",
        )[0]
        == b"sent successfully"
    )
    # A new process has no active in-memory owner, but still retains delivery.
    _ACTIVE.pop(capture.id)
    interrupted = TurnFileStore(workspace).get_turn(
        capture.id,
        session_id="session-a",
    )
    assert interrupted["status"] == "interrupted"
    assert (
        interrupted["incomplete"]
        and interrupted["files"][0]["after_available"]
    )
    finished = store.finish(capture)
    assert len(finished["files"]) == 1
    assert finished["files"][0]["id"] == file_id
    assert not capture.before.files and not capture.deliveries


def test_failed_manifest_write_releases_capture_and_keeps_delivered_version(
    directories,
    monkeypatch,
):
    from qwenpaw.turn_files.store import _ACTIVE

    workspace, project = directories
    store = TurnFileStore(workspace)
    path = project / "report.txt"
    path.write_bytes(b"before")
    capture = start(store, project)
    path.write_bytes(b"already delivered")
    store.record_delivery(capture, path)
    durable_file_id = store.get_turn(capture.id, session_id="session-a")[
        "files"
    ][0]["id"]
    path.write_bytes(b"final edit")

    def disk_full(_manifest):
        raise OSError("disk full")

    monkeypatch.setattr(store, "_write", disk_full)
    with pytest.raises(OSError, match="disk full"):
        store.finish(capture)
    assert capture.id not in _ACTIVE
    assert capture.finished
    assert not capture.before.files and not capture.deliveries
    assert capture.manifest["status"] == "interrupted"
    persisted = store.get_turn(capture.id, session_id="session-a")
    assert persisted["status"] == "interrupted" and persisted["incomplete"]
    assert (
        store.get_file(capture.id, durable_file_id, session_id="session-a")[0]
        == b"already delivered"
    )


def test_binary_changes_are_archived_without_text_diff(directories):
    workspace, project = directories
    store = TurnFileStore(workspace)
    capture = start(store, project)
    (project / "image.bin").write_bytes(b"\x00\xff\x01")
    result = store.finish(capture)
    item = result["files"][0]
    assert item["binary"] and item["after_available"]
    assert "additions" not in item
    with pytest.raises(ValueError, match="Binary"):
        store.diff(result["id"], item["id"], session_id="session-a")


def test_limits_and_read_errors_report_incomplete_without_false_deletions(
    directories,
    monkeypatch,
):
    workspace, project = directories
    store = TurnFileStore(workspace)
    (project / "a.txt").write_bytes(b"old")
    (project / "b.txt").write_bytes(b"old")
    capture = start(store, project)
    monkeypatch.setattr(scanner, "MAX_FILES", 1)
    result = store.finish(capture)
    assert result["incomplete"] and result["warnings"]
    assert not any(item["status"] == "deleted" for item in result["files"])
    monkeypatch.setattr(scanner, "MAX_FILES", 2000)
    monkeypatch.setattr(scanner, "MAX_FILE_BYTES", 5)
    capture = start(store, project)
    (project / "huge.bin").write_bytes(b"0123456789")
    result = store.finish(capture)
    item = next(item for item in result["files"] if item["path"] == "huge.bin")
    assert item["status"] == "created" and not item["after_available"]
    assert result["incomplete"]
    capture = start(store, project)
    real_read = scanner.read_file

    def unreadable(path, snapshot, display):
        if path.name == "a.txt":
            raise PermissionError("file locked")
        return real_read(path, snapshot, display)

    monkeypatch.setattr(scanner, "read_file", unreadable)
    result = store.finish(capture)
    assert result["incomplete"]
    assert not any(
        item["path"] == "a.txt" and item["status"] == "deleted"
        for item in result["files"]
    )


def test_archive_budget_and_truncated_diff_are_explicit(
    directories,
    monkeypatch,
):
    workspace, project = directories
    store = TurnFileStore(workspace)
    capture = start(store, project)
    (project / "first.txt").write_bytes(b"12345678")
    (project / "second.txt").write_bytes(b"abcdefgh")
    monkeypatch.setattr(scanner, "MAX_TOTAL_BYTES", 10)
    result = store.finish(capture)
    assert result["incomplete"]
    assert sum(item["after_available"] for item in result["files"]) == 1
    item = next(item for item in result["files"] if item["after_available"])
    monkeypatch.setattr(scanner, "MAX_TEXT_BYTES", 4)
    difference = store.diff(result["id"], item["id"], session_id="session-a")
    assert difference["truncated"] and len(difference["after"]) == 4


def test_overlapping_agents_are_marked_without_serializing_turns(
    directories,
    tmp_path,
):
    workspace, project = directories
    first, second = TurnFileStore(workspace), TurnFileStore(
        tmp_path / "other-agent",
    )
    a = start(first, project)
    b = start(second, project, agent_id="agent-b", session_id="session-b")
    (project / "shared.txt").write_bytes(b"concurrent")
    assert first.finish(a)["overlap"]
    assert second.finish(b)["overlap"]


def test_output_root_excludes_internal_state_credentials_and_reparse_points(
    directories,
    monkeypatch,
):
    workspace, _project = directories
    store = TurnFileStore(workspace)
    capture = start(store, workspace, roots=[("workspace", workspace)])
    for name in (
        "sessions",
        "harnesses",
        "node_modules",
        "checkpoints",
        "output",
        "linked",
    ):
        (workspace / name).mkdir(exist_ok=True)
        (workspace / name / "file.txt").write_bytes(b"content")
    (workspace / ".env.local").write_bytes(b"secret")
    original_linked = scanner.linked
    linked_inode = (workspace / "linked").lstat().st_ino
    monkeypatch.setattr(
        scanner,
        "linked",
        lambda info: original_linked(info) or info.st_ino == linked_inode,
    )
    result = store.finish(capture)
    assert [item["path"] for item in result["files"]] == ["output/file.txt"]
    assert result["incomplete"]
    assert scanner.linked(SimpleNamespace(st_mode=0, st_file_attributes=0x400))
    capture = start(store, workspace, roots=[("output", workspace / "output")])
    (workspace / "output" / "file.txt").write_bytes(b"new output")
    result = store.finish(capture)
    assert result["files"][0]["root"] == "workspace"
    assert result["files"][0]["path"] == "output/file.txt"


def test_scope_traversal_and_blob_integrity_are_enforced(directories):
    workspace, project = directories
    store = TurnFileStore(workspace)
    capture = start(store, project)
    (project / "report.txt").write_bytes(b"data")
    result = store.finish(capture)
    item = result["files"][0]
    for scope in (
        {"session_id": "session-b"},
        {"session_id": "session-a", "user_id": "user-b"},
        {"session_id": "session-a", "channel": "other"},
        {"session_id": "session-a", "agent_id": "agent-b"},
    ):
        with pytest.raises(FileNotFoundError):
            store.get_file(result["id"], item["id"], **scope)
    for identifier in ("../secret", "a/../../", "a" * 64, ""):
        with pytest.raises(FileNotFoundError):
            store.get_turn(identifier, session_id="session-a")
    manifest = json.loads(
        (
            workspace / ".turn-files" / "turns" / f'{result["id"]}.json'
        ).read_text(),
    )
    (
        workspace
        / ".turn-files"
        / "blobs"
        / manifest["files"][0]["_after_blob"]
    ).write_bytes(b"corrupt")
    with pytest.raises(FileNotFoundError, match="integrity"):
        store.get_file(result["id"], item["id"], session_id="session-a")


def test_bundle_separates_roots_and_preserves_multiple_delivery_versions(
    directories,
    tmp_path,
):
    workspace, project = directories
    other = tmp_path / "other"
    other.mkdir()
    store = TurnFileStore(workspace)
    capture = start(
        store,
        project,
        roots=[(f"project:{project}", project), (f"project:{other}", other)],
    )
    (project / "same.txt").write_bytes(b"first")
    store.record_delivery(capture, project / "same.txt")
    (project / "same.txt").write_bytes(b"second")
    (other / "same.txt").write_bytes(b"other")
    result = store.finish(capture)
    with zipfile.ZipFile(
        io.BytesIO(store.bundle(result["id"], session_id="session-a")),
    ) as archive:
        names = [
            name for name in archive.namelist() if name != "turn-manifest.json"
        ]
        assert len(names) == len(set(names)) == 3
        assert {archive.read(name) for name in names} == {
            b"first",
            b"second",
            b"other",
        }


@pytest.mark.parametrize("damage", ["missing", "corrupt"])
@pytest.mark.parametrize("operation", ["file", "diff", "bundle"])
def test_damaged_archive_never_falls_back_to_mutable_workspace_bytes(
    directories,
    damage,
    operation,
):
    workspace, project = directories
    store = TurnFileStore(workspace)
    capture = start(store, project)
    path = project / "report.txt"
    path.write_bytes(b"immutable delivered report")
    assert store.record_delivery(capture, path)
    turn = store.finish(capture)
    entry = turn["files"][0]
    path.write_bytes(b"later private workspace draft")
    manifest_path = workspace / ".turn-files" / "turns" / f"{turn['id']}.json"
    manifest_bytes = manifest_path.read_bytes()
    manifest = json.loads(manifest_bytes)
    blob = (
        workspace
        / ".turn-files"
        / "blobs"
        / manifest["files"][0]["_after_blob"]
    )
    if damage == "missing":
        blob.unlink()
    else:
        blob.write_bytes(b"tampered archive")
    reopened = TurnFileStore(workspace)
    with pytest.raises(FileNotFoundError):
        if operation == "bundle":
            reopened.bundle(turn["id"], session_id="session-a")
        elif operation == "diff":
            reopened.diff(turn["id"], entry["id"], session_id="session-a")
        else:
            reopened.get_file(turn["id"], entry["id"], session_id="session-a")
    assert path.read_bytes() == b"later private workspace draft"
    assert manifest_path.read_bytes() == manifest_bytes
    assert reopened.get_turn(turn["id"], session_id="session-a") == turn


def test_deletion_only_bundle_keeps_the_clearly_labeled_before_version(
    directories,
):
    workspace, project = directories
    file = project / "deleted.txt"
    file.write_bytes(b"before deletion")
    store = TurnFileStore(workspace)
    capture = start(store, project)
    file.unlink()
    result = store.finish(capture)
    with zipfile.ZipFile(
        io.BytesIO(store.bundle(result["id"], session_id="session-a")),
    ) as archive:
        names = [
            name
            for name in archive.namelist()
            if name.startswith("deleted-before/")
        ]
        assert len(names) == 1
        assert archive.read(names[0]) == b"before deletion"


@pytest.mark.asyncio
async def test_http_routes_enforce_chat_identity_and_serve_archived_bytes(
    directories,
    monkeypatch,
):
    workspace, project = directories
    store = get_store(workspace)
    capture = start(store, project)
    file = project / "report #1.txt"
    file.write_bytes(b"archived")
    result = store.finish(capture)
    file.write_bytes(b"changed after turn")
    chat = SimpleNamespace(
        session_id="session-a",
        user_id="user-a",
        channel="console",
    )

    class Chats:
        async def get_chat(self, chat_id):
            return chat if chat_id == "chat-a" else None

        async def list_chats(self, **_kwargs):
            return [chat]

    async def resolve(_request):
        return SimpleNamespace(
            agent_id="agent-a",
            workspace_dir=workspace,
            chat_manager=Chats(),
        )

    monkeypatch.setattr(router, "get_agent_for_request", resolve)
    app = FastAPI()
    app.include_router(router.router)
    base = f'/workspace/turn-files/{result["id"]}'
    file_url = f'{base}/files/{result["files"][0]["id"]}'
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get(
            "/workspace/turn-files",
            params={"session_id": "session-a"},
            headers={"X-Agent-Id": "agent-a", "X-Chat-Id": "chat-a"},
        )
        assert (
            response.status_code == 200 and len(response.json()["turns"]) == 1
        )
        response = await client.get(
            file_url,
            params={
                "session_id": "session-a",
                "chat_id": "chat-a",
                "download": "false",
            },
        )
        assert response.status_code == 200 and response.content == b"archived"
        assert "sandbox" in response.headers["content-security-policy"]
        assert "%23" in response.headers["content-disposition"]
        for params, headers in (
            ({"session_id": "session-b"}, {"X-Chat-Id": "chat-a"}),
            (
                {"session_id": "session-a", "chat_id": "other"},
                {"X-Chat-Id": "chat-a"},
            ),
            ({"session_id": "session-a"}, {"X-Agent-Id": "agent-b"}),
        ):
            response = await client.get(
                file_url,
                params=params,
                headers=headers,
            )
            assert response.status_code == 404
        response = await client.get(
            file_url,
            params={"session_id": "session-a", "version": "../../secret"},
        )
        assert response.status_code == 422
        response = await client.get(
            f"{file_url}/diff",
            params={"session_id": "session-a"},
        )
        assert response.json() == {
            "before": "",
            "after": "archived",
            "truncated": False,
        }
        response = await client.get(
            f"{base}/download",
            params={"session_id": "session-a"},
        )
        assert (
            response.status_code == 200
            and response.headers["content-type"] == "application/zip"
        )
