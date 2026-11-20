# -*- coding: utf-8 -*-
import base64
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI

from qwenpaw.app.routers import turn_files as router
from qwenpaw.services import desktop_associations as associations
from qwenpaw.services import desktop_delivery as desktop
from qwenpaw.services.desktop_associations import file_extension


@pytest.fixture(name="app")
def app_fixture(monkeypatch, tmp_path):
    class Chats:
        async def get_chat(self, chat_id):
            return SimpleNamespace(
                session_id=chat_id,
                user_id="u",
                channel="console",
            )

    async def resolve(_request):
        return SimpleNamespace(
            agent_id="a",
            workspace_dir=tmp_path,
            chat_manager=Chats(),
        )

    monkeypatch.setattr(router, "get_agent_for_request", resolve)
    monkeypatch.setattr(
        router.desktop_associations,
        "list_applications",
        lambda name: {
            "applications": [
                {"id": "sheet", "name": "Sheets", "isDefault": True},
            ],
            "canOpenDefault": True,
            "canChooseApplication": True,
        },
    )
    # pylint: disable-next=protected-access
    desktop._files.clear()
    result = FastAPI()
    result.include_router(router.router)
    yield result
    # pylint: disable-next=protected-access
    desktop._files.clear()


BASE = "/workspace/turn-files/desktop"
HEADERS = {
    "X-Agent-Id": "a",
    "X-Chat-Id": "s",
    "Origin": "http://127.0.0.1:5173",
}


@pytest.mark.asyncio
async def test_local_console_lists_real_associations_and_opens_scoped_delivered_bytes(  # noqa: E501
    app,
    monkeypatch,
):
    calls = []
    monkeypatch.setattr(
        desktop,
        "open_file",
        lambda path, application: calls.append(
            (path.read_bytes(), application),
        ),
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://localhost",
        headers=HEADERS,
    ) as client:
        response = await client.get(
            f"{BASE}/applications?session_id=s&file_name=report.csv",
        )
        assert response.json()["applications"][0]["name"] == "Sheets"
        staged = await client.post(
            f"{BASE}/stage?session_id=s",
            json={
                "fileName": "report.csv",
                "contentBase64": base64.b64encode(b"archived,120").decode(),
            },
        )
        assert staged.status_code == 200
        token = staged.json()["token"]
        opened = await client.post(
            f"{BASE}/action?session_id=s",
            json={"token": token, "action": "open", "applicationId": "sheet"},
        )
        assert opened.status_code == 200
        assert calls == [(b"archived,120", "sheet")]
        foreign = await client.post(
            f"{BASE}/action?session_id=other",
            headers={**HEADERS, "X-Chat-Id": "other"},
            json={"token": token, "action": "open"},
        )
        assert foreign.status_code == 404
        assert len(calls) == 1


@pytest.mark.asyncio
async def test_desktop_actions_reject_remote_clients_and_foreign_origins(app):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app, client=("10.1.2.3", 12)),
        base_url="http://localhost",
        headers=HEADERS,
    ) as client:
        assert (
            await client.get(
                f"{BASE}/applications?session_id=s&file_name=report.csv",
            )
        ).status_code == 403
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://localhost",
        headers={**HEADERS, "Origin": "https://foreign.example"},
    ) as client:
        assert (
            await client.post(
                f"{BASE}/action?session_id=s",
                json={"token": "bad", "action": "open"},
            )
        ).status_code == 403


def test_staged_files_reject_modified_content_and_cross_scope_actions(
    monkeypatch,
):
    # pylint: disable-next=protected-access
    desktop._files.clear()
    owner = ("a", "s")
    value = desktop.stage_file(owner, "report.csv", b"original")
    assert (
        desktop.stage_file(owner, "report.csv", b"original")["token"]
        == value["token"]
    )
    with pytest.raises(FileNotFoundError):
        desktop.act_on_file(("other", "s"), value["token"], "open", None)
    # pylint: disable-next=protected-access
    path = desktop._files[value["token"]][2]
    path.chmod(0o600)
    path.write_bytes(b"changed")
    opened = []
    monkeypatch.setattr(
        desktop,
        "open_file",
        lambda *args: opened.append(args),
    )
    with pytest.raises(ValueError, match="changed"):
        desktop.act_on_file(owner, value["token"], "open", None)
    assert not opened
    # pylint: disable-next=protected-access
    desktop._files.clear()


@pytest.mark.parametrize(
    "name",
    ["../report.csv", "CON.csv", "file/other.csv", "report.csv "],
)
def test_staging_rejects_non_file_names(name):
    with pytest.raises(ValueError):
        desktop.stage_file(("owner",), name, b"data")


def test_script_default_actions_stay_unavailable():
    for name in ("tool.exe", "script.py", "launch.ps1", "link.url"):
        with pytest.raises(ValueError):
            file_extension(name)


@pytest.mark.asyncio
async def test_reveal_uses_the_staged_file_and_rejects_invalid_base64(
    app,
    monkeypatch,
):
    revealed = []
    monkeypatch.setattr(
        desktop,
        "open_in_file_manager",
        lambda path: revealed.append(path.read_bytes()),
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://localhost",
        headers=HEADERS,
    ) as client:
        bad = await client.post(
            f"{BASE}/stage?session_id=s",
            json={"fileName": "report.csv", "contentBase64": "!bad!"},
        )
        assert bad.status_code == 422
        staged = await client.post(
            f"{BASE}/stage?session_id=s",
            json={"fileName": "report.csv", "contentBase64": "eA=="},
        )
        response = await client.post(
            f"{BASE}/action?session_id=s",
            json={"token": staged.json()["token"], "action": "reveal"},
        )
        assert response.status_code == 200
        assert revealed == [b"x"]


def test_selected_executable_is_resolved_from_shell_handlers(
    monkeypatch,
    tmp_path,
):
    from contextlib import nullcontext

    executable = tmp_path / "Sheets.exe"
    executable.touch()
    path = tmp_path / "report.csv"
    path.write_bytes(b"data")
    monkeypatch.setattr(associations, "_apartment", nullcontext)
    monkeypatch.setattr(
        associations,
        "_handlers",
        lambda extension: nullcontext(["handler"]),
    )
    monkeypatch.setattr(
        associations,
        "_string",
        lambda handler, index: str(executable),
    )
    calls = []
    monkeypatch.setattr(
        associations.subprocess,
        "Popen",
        lambda argv, **kwargs: calls.append(argv),
    )
    # pylint: disable-next=protected-access
    associations._windows_open(path, str(executable))
    assert calls == [[str(executable), str(path)]]
    with pytest.raises(ValueError, match="associated"):
        # pylint: disable-next=protected-access
        associations._windows_open(path, str(tmp_path / "untrusted.exe"))
    assert len(calls) == 1


def test_scripts_open_only_in_an_explicit_installed_editor(
    monkeypatch,
    tmp_path,
):
    from contextlib import nullcontext

    monkeypatch.setattr(associations.sys, "platform", "win32")
    for variable in (
        "ProgramFiles",
        "ProgramFiles(x86)",
        "ProgramW6432",
        "SystemRoot",
    ):
        monkeypatch.delenv(variable, raising=False)
    monkeypatch.setenv("LOCALAPPDATA", str(tmp_path))
    editor = tmp_path / "Programs" / "Microsoft VS Code" / "Code.exe"
    editor.parent.mkdir(parents=True)
    editor.touch()
    script = tmp_path / "my script.PY"
    script.write_text("print(42)", encoding="utf-8")
    icon = "data:image/png;base64,aWNvbg=="
    monkeypatch.setattr(associations, "_apartment", nullcontext)
    monkeypatch.setattr(
        associations,
        "_association",
        lambda suffix, kind: str(editor)
        if (suffix, kind) == (".py", 2)
        else "",
    )
    monkeypatch.setattr(
        associations,
        "_icon_from_file",
        lambda source: icon if source == str(editor) else None,
    )
    calls = []
    monkeypatch.setattr(
        associations.subprocess,
        "Popen",
        lambda argv, **_kwargs: calls.append(argv),
    )

    assert associations.list_applications(script.name) == {
        "applications": [
            {
                "id": "editor:vscode",
                "name": "Visual Studio Code",
                "isDefault": True,
                "iconDataUrl": icon,
            },
        ],
        "canOpenDefault": False,
        "canChooseApplication": True,
        "editorOnly": True,
    }
    for application_id in (
        None,
        "system-default",
        str(editor),
        "editor:cursor",
    ):
        with pytest.raises(ValueError, match="Choose an available editor"):
            associations.open_file(script, application_id)
    assert not calls
    associations.open_file(script, "editor:vscode")
    assert calls == [[str(editor), str(script)]]
    monkeypatch.setattr(
        associations,
        "_association",
        lambda *_args: "python.exe",
    )
    app = associations.list_applications(script.name)["applications"][0]
    assert not app["isDefault"]
    editor.unlink()
    assert associations.list_applications(script.name)["applications"] == []
    with pytest.raises(ValueError, match="Choose an available editor"):
        associations.open_file(script, "editor:vscode")
    assert len(calls) == 1


def test_default_executable_does_not_require_an_optional_open_with_handler(
    monkeypatch,
    tmp_path,
):
    from contextlib import nullcontext

    executable = tmp_path / "Default.exe"
    executable.touch()
    path = tmp_path / "report.csv"
    monkeypatch.setattr(associations, "_apartment", nullcontext)
    monkeypatch.setattr(
        associations,
        "_association",
        lambda *args: str(executable),
    )
    calls = []
    monkeypatch.setattr(
        associations.subprocess,
        "Popen",
        lambda argv, **kwargs: calls.append(argv),
    )
    # pylint: disable-next=protected-access
    associations._windows_default_open(path)
    assert calls == [[str(executable), str(path)]]
