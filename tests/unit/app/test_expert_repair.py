# -*- coding: utf-8 -*-
"""Repair the real offline environment without replacing the expert workspace.
"""

import asyncio
import json
import threading
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI

from qwenpaw.app.multi_agent_manager import MultiAgentManager
from qwenpaw.app.routers.expert_packages import router
from qwenpaw.config.utils import load_config, mutate_config
from qwenpaw.drivers import storage
from qwenpaw.drivers.storage import AsyncDriverCardStore
from qwenpaw.expert_packages import runtime
from qwenpaw.expert_packages.environments import active_environment
from qwenpaw.expert_packages.service import ExpertInstallService
from tests.unit.app.test_expert_packages import fixture_release
from tests.unit.app.test_expert_packages import isolated_fixture  # noqa: F401

# pytest discovers the shared named fixture through the module namespace.
__all__ = ["isolated_fixture"]


async def installed(root):
    channel, path, _, _ = await fixture_release(root)
    manager = MultiAgentManager()
    service = ExpertInstallService(
        root / "repair",
        channel,
        "99.0.0",
        on_repair=manager.inactive_agent_maintenance,
    )
    plan = await service.plan(path)
    await service.start(plan["id"])
    await service.tasks[plan["id"]]
    assert service.status(plan["id"])["status"] == "ready"
    return service, manager, plan["id"]


@pytest.mark.asyncio
# Assert every preserved user setting on the same repaired instance.
# pylint: disable-next=too-many-statements
async def test_repair_retains_instance_files_policy_and_recovers_committed_switch(  # noqa: E501
    isolated,
    monkeypatch,
):
    service, manager, job = await installed(isolated)
    folder = service.path(job)
    agent_id = service.status(job)["agent_id"]
    workspace = folder / "workspace"
    store = AsyncDriverCardStore(workspace / "drivers")
    card = await store.load("expert-methods", protocol="mcp")
    card.enabled = False
    card.config["tools"] = []
    card.endpoint["env"] = {"CUSTOM_OPTION": "keep"}
    await store.save(card)
    (workspace / "AGENTS.md").write_text("custom instructions")
    (workspace / "business.csv").write_text("pressure,12.5")
    (workspace / "skills/example/SKILL.md").write_text("custom skill")
    mutate_config(
        lambda config: setattr(
            config.agents.profiles[agent_id],
            "enabled",
            False,
        ),
    )
    originals = {
        p.relative_to(workspace): p.read_bytes()
        for p in workspace.rglob("*")
        if p.is_file() and "drivers" not in p.relative_to(workspace).parts
    }
    old_environment = active_environment(folder)
    (folder / "environment.json").write_text('"old-python"')
    assert service.status(job)["status"] == "repair_required"
    manager.agents[agent_id] = SimpleNamespace()
    app = FastAPI()
    app.include_router(router)
    app.state.expert_install_service = service
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.post(
            f"/expert-packages/installations/{job}/repair",
        )
        assert response.status_code == 409
        assert not list(folder.glob("env-*"))
        del manager.agents[agent_id]
        assert (
            await client.post(f"/expert-packages/installations/{job}/repair")
        ).status_code == 200
        task = service.tasks[job]
        await service.repair(job)
        assert service.tasks[job] is task
        await task
    state = service.status(job)
    assert state["status"] == "repaired", state
    assert not state["runtime_verified"]
    assert load_config().agents.profiles[agent_id].workspace_dir == str(
        workspace,
    )
    assert not load_config().agents.profiles[agent_id].enabled
    assert all(
        (workspace / p).read_bytes() == content
        for p, content in originals.items()
    )
    replacement = await store.load("expert-methods", protocol="mcp")
    assert (
        replacement.config == card.config and replacement.policy == card.policy
    )
    assert (
        replacement.credentials == card.credentials and not replacement.enabled
    )
    assert replacement.endpoint["env"] == card.endpoint["env"]
    assert active_environment(folder) != old_environment
    assert old_environment.is_dir() and service.environment_current(folder)
    assert len(list(folder.glob("env-*"))) == 1
    # Crash after atomic card commit, before writing the final state.
    state["status"] = "repair_committing"
    (folder / "state.json").write_text(json.dumps(state))
    restored = ExpertInstallService(
        service.root,
        service.channel,
        "99.0.0",
        on_repair=manager.inactive_agent_maintenance,
    )

    async def never_rebuild(*_):
        raise AssertionError("Already committed repair must not rebuild")

    monkeypatch.setattr(runtime, "prepare_environment", never_rebuild)
    await restored.repair(job)
    await restored.tasks[job]
    assert restored.status(job)["status"] == "repaired"
    await service.close()
    await restored.close()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "failure",
    ["selftest", "edited", "started", "cancelled", "tampered", "customized"],
)
async def test_repair_failure_or_race_never_replaces_current_environment(
    isolated,
    monkeypatch,
    failure,
):
    service, manager, job = await installed(isolated)
    folder = service.path(job)
    agent_id = service.status(job)["agent_id"]
    old_environment = active_environment(folder)
    store = AsyncDriverCardStore(folder / "workspace/drivers")
    original = await store.load("expert-methods", protocol="mcp")
    if failure == "tampered":
        (folder / "package/unlisted.py").write_text("print('unexpected')")
    elif failure == "customized":
        original.endpoint["args"] = ["-c", "print('custom method')"]
        await store.save(original)
    verify = runtime.verify

    async def controlled_verify(*args):
        if failure == "selftest":
            raise ValueError("known-answer selftest failed")
        result = await verify(*args)
        if failure == "edited":
            edited = await store.load("expert-methods", protocol="mcp")
            edited.endpoint["env"] = {"NEW_USER_SETTING": "preserved"}
            await store.save(edited)
        elif failure == "started":
            manager.agents[agent_id] = SimpleNamespace()
        elif failure == "cancelled":
            service.cancel(job)
        return result

    monkeypatch.setattr(runtime, "verify", controlled_verify)
    await service.repair(job)
    await service.tasks[job]
    assert service.status(job)["status"] == (
        "cancelled" if failure == "cancelled" else "repair_failed"
    )
    assert active_environment(folder) == old_environment
    current = await store.load("expert-methods", protocol="mcp")
    assert current.endpoint["command"] == original.endpoint["command"]
    if failure in {"tampered", "customized"}:
        assert not list(folder.glob("env-*"))
        assert current.endpoint["args"] == original.endpoint["args"]
    if failure == "edited":
        assert current.endpoint["env"] == {"NEW_USER_SETTING": "preserved"}
    assert load_config().agents.profiles.get(agent_id)
    manager.agents.clear()
    await service.close()


@pytest.mark.asyncio
async def test_inactive_repair_guard_blocks_startup_and_releases_after_error():
    manager = MultiAgentManager()
    with pytest.raises(RuntimeError, match="repairing"):
        async with manager.inactive_agent_maintenance("expert"):
            await manager.get_agent("expert")
    manager.assert_agent_available("expert")
    finish = asyncio.Event()
    task = asyncio.create_task(finish.wait())
    # pylint: disable-next=protected-access
    manager._agent_startup_tasks["expert"] = task
    try:
        with pytest.raises(ValueError, match="启动"):
            async with manager.inactive_agent_maintenance("expert"):
                pytest.fail("Must reject queued startup")
    finally:
        finish.set()
        await task


@pytest.mark.asyncio
async def test_repair_cancellation_keeps_guard_until_atomic_commit_finishes(
    isolated,
    monkeypatch,
):
    service, manager, job = await installed(isolated)
    folder = service.path(job)
    agent_id = service.status(job)["agent_id"]
    entered, release = threading.Event(), threading.Event()
    original_dump = storage.dump_card

    def delayed_dump(card, path):
        entered.set()
        assert release.wait(15), "Commit was never released"
        original_dump(card, path)

    monkeypatch.setattr(storage, "dump_card", delayed_dump)
    await service.repair(job)
    task = service.tasks[job]
    try:
        assert await asyncio.to_thread(entered.wait, 30)
        with pytest.raises(ValueError):
            service.cancel(job)
        task.cancel()
        await asyncio.sleep(0)
        with pytest.raises(RuntimeError, match="repairing"):
            manager.assert_agent_available(agent_id)
        assert not task.done()
    finally:
        release.set()
        with pytest.raises(asyncio.CancelledError):
            await task
    manager.assert_agent_available(agent_id)
    assert service.environment_current(folder)
    assert active_environment(folder).name.startswith("env-")
    assert service.status(job)["status"] == "interrupted"
    await service.repair(job)
    await service.tasks[job]
    assert service.status(job)["status"] == "repaired"
    assert len(list(folder.glob("env-*"))) == 1
    await service.close()
