# -*- coding: utf-8 -*-
"""Real signed archives, offline wheel installs, stdio MCP and registration."""

import asyncio
import base64
import json
from pathlib import Path
import sys
import zipfile

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
import httpx
import pytest

from qwenpaw.components.update import detect_target
from qwenpaw.expert_packages.models import relative_path
from qwenpaw.expert_packages.service import ExpertInstallService
from qwenpaw.expert_packages.source import Channel
from qwenpaw.expert_packages.runtime import host_python
from scripts.build_expert_release import build
from tests.integration.driver_mcp_fakes import (
    mcp_runtime_host,  # noqa: F401
    sdk_mcp_manager,
)

SERVER = """import json, sys
from example_method import answer

for line in sys.stdin:
    request = json.loads(line)
    if "id" not in request:
        continue
    method = request["method"]
    if method == "initialize":
        result = {
            "protocolVersion": request["params"]["protocolVersion"],
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "method", "version": "1"},
        }
    elif method == "tools/list":
        result = {
            "tools": [
                {
                    "name": "calculate",
                    "description": "known-answer test",
                    "inputSchema": {"type": "object", "properties": {}},
                }
            ]
        }
        # INSERT_TOOL_LIST_VARIANT
    elif method == "tools/call":
        result = {
            "content": [
                {"type": "text", "text": json.dumps({"answer": answer()})}
            ],
            "structuredContent": {"answer": answer()},
            "isError": False,
        }
    else:
        result = {}
    print(
        json.dumps({"jsonrpc": "2.0", "id": request["id"], "result": result}),
        flush=True,
    )
"""


def payload(root, requires=""):
    root.mkdir()
    (root / "skills" / "example").mkdir(parents=True)
    (root / "skills/example/SKILL.md").write_text(
        (
            "---\nname: example\ndescription: Use calculate for known-answer"
            " arithmetic.\n---\nCall calculate and report the actual answer.\n"
        ),
    )
    (root / "AGENTS.md").write_text(
        "Use the example skill and its verified method.",
    )
    (root / "server.py").write_text(SERVER)
    wheel = "example_method-1.0.0-py3-none-any.whl"
    with zipfile.ZipFile(root / wheel, "w") as bundle:
        entries = {
            "example_method/__init__.py": "def answer(): return 42\n",
            "example_method-1.0.0.dist-info/METADATA": (
                "Metadata-Version: 2.1\nName: example-method\nVersion: 1.0.0\n"
                + requires
            ),
            "example_method-1.0.0.dist-info/WHEEL": (
                "Wheel-Version: 1.0\nGenerator: test\nRoot-Is-Purelib:"
                " true\nTag: py3-none-any\n"
            ),
        }
        for name, value in entries.items():
            bundle.writestr(name, value)
        bundle.writestr(
            "example_method-1.0.0.dist-info/RECORD",
            "\n".join(f"{p},," for p in entries)
            + "\nexample_method-1.0.0.dist-info/RECORD,,\n",
        )
    return {
        "schema_version": 1,
        "id": "ugsci.example",
        "version": "1.0.0",
        "name": "测试专家",
        "core_min": "0.0.1",
        "target": detect_target(),
        "python": f"3.{sys.version_info.minor}",
        "instructions": "AGENTS.md",
        "skills": ["skills/example"],
        "wheels": [wheel],
        "mcp": {
            "entrypoint": "server.py",
            "tools": ["calculate"],
            "smoke": [
                {
                    "tool": "calculate",
                    "arguments": {},
                    "expected": {"answer": 42},
                },
            ],
        },
    }


@pytest.fixture(name="isolated")
def isolated_fixture(monkeypatch, tmp_path):
    # Keep real configuration transactions while isolating all user data.
    import qwenpaw.config.utils as config_utils
    from qwenpaw import constant

    monkeypatch.setattr(config_utils, "WORKING_DIR", tmp_path / "user")
    monkeypatch.setattr(constant, "WORKING_DIR", tmp_path / "user")
    return tmp_path


async def fixture_release(tmp_path, spec_change=None):
    source = tmp_path / "source"
    spec = payload(source)
    if spec_change:
        spec_change(spec)
    key = Ed25519PrivateKey.generate()
    output = tmp_path / "channel"
    result = await build(source, spec, output, key)

    def respond(request):
        path = output / request.url.path.lstrip("/")
        return (
            httpx.Response(200, content=path.read_bytes())
            if path.is_file()
            else httpx.Response(404)
        )

    client = httpx.Client(transport=httpx.MockTransport(respond))
    channel = Channel(
        "https://channel.example",
        base64.b64encode(key.public_key().public_bytes_raw()).decode(),
        client,
    )
    return channel, result["manifest_path"], output, key


@pytest.mark.asyncio
async def test_signed_install_runs_real_mcp_and_registers_only_after_validation(  # noqa: E501
    isolated,
):
    channel, path, _, _ = await fixture_release(isolated)
    service = ExpertInstallService(isolated / "中文 工作区", channel, "99.0.0")
    plan = await service.plan(path)
    from qwenpaw.config.utils import load_config

    before = set(load_config().agents.profiles)
    assert plan["skills"] == 1
    await service.start(plan["id"])
    await service.tasks[plan["id"]]
    state = service.status(plan["id"])
    assert state["status"] == "ready", state.get("error")
    assert state["verification"]["tools"] == ["calculate"]
    assert state["verification"]["checks"] == 1
    assert len(state["verification"]["schemas"]["calculate"]) == 64
    config = load_config()
    assert set(config.agents.profiles) == before | {state["agent_id"]}
    workspace = Path(config.agents.profiles[state["agent_id"]].workspace_dir)
    assert json.loads((workspace / "skill.json").read_text())["skills"][
        "example"
    ]["enabled"]
    assert list((workspace / "drivers").rglob("*.yaml"))
    assert not (workspace / "BOOTSTRAP.md").exists()
    (workspace / "AGENTS.md").write_text("user customization")
    await service.start(plan["id"])
    assert (workspace / "AGENTS.md").read_text() == "user customization"
    # Simulate power loss after durable registration but before job completion.
    (service.path(plan["id"]) / "state.json").write_text(
        json.dumps({"id": plan["id"], "status": "activating"}),
    )
    restored = ExpertInstallService(service.root, channel, "99.0.0")
    assert restored.status(plan["id"])["status"] == "interrupted"
    await restored.start(plan["id"])
    await restored.tasks[plan["id"]]
    assert restored.status(plan["id"])["status"] == "ready"
    assert (workspace / "AGENTS.md").read_text() == "user customization"


@pytest.mark.asyncio
@pytest.mark.parametrize("failure", ["false", "model"])
async def test_expert_startup_is_awaited_and_retried_without_reinstall(
    isolated,
    failure,
):
    from qwenpaw.expert_packages.readiness import ReadinessError

    channel, path, _, _ = await fixture_release(isolated)
    entered, finish = asyncio.Event(), asyncio.Event()
    attempts = []

    async def startup(agent_id):
        attempts.append(agent_id)
        entered.set()
        await finish.wait()
        if len(attempts) == 1 and failure == "model":
            raise ReadinessError("model_required", "请选择对话模型", "models")
        return len(attempts) > 1

    service = ExpertInstallService(
        isolated / "startup",
        channel,
        "99.0.0",
        on_ready=lambda agent_id: asyncio.create_task(startup(agent_id)),
    )
    plan = await service.plan(path)
    try:
        await service.start(plan["id"])
        task = service.tasks[plan["id"]]
        await asyncio.wait_for(entered.wait(), 30)
        assert service.status(plan["id"])["status"] == "starting"
        finish.set()
        await task
        assert service.status(plan["id"])["status"] == "startup_failed"
        problem = service.status(plan["id"])["problem"]
        assert problem["code"] == (
            "model_required" if failure == "model" else "startup_failed"
        )
        reader = ExpertInstallService(service.root, channel, "99.0.0")
        assert reader.status(plan["id"])["problem"] == problem
        folder = service.path(plan["id"])
        before = (folder / "environment.json").stat().st_mtime_ns
        (folder / "workspace/AGENTS.md").write_text("custom prompt")
        await service.start(plan["id"])
        await service.tasks[plan["id"]]
        state = service.status(plan["id"])
        assert state["status"] == "ready"
        assert state["runtime_verified"] is True
        assert state["problem"] is None
        assert len(attempts) == 2
        assert (folder / "environment.json").stat().st_mtime_ns == before
        assert (folder / "workspace/AGENTS.md").read_text() == "custom prompt"
        restored = ExpertInstallService(
            service.root,
            channel,
            "99.0.0",
            on_ready=startup,
        )
        assert restored.status(plan["id"])["runtime_verified"] is False
        await restored.start(plan["id"])
        await restored.tasks[plan["id"]]
        assert restored.status(plan["id"])["runtime_verified"] is True
        assert len(attempts) == 3
        await restored.close()
    finally:
        finish.set()
        await service.close()


@pytest.mark.asyncio
# Exercise registration and the real host driver in one lifecycle.
# pylint: disable-next=too-many-statements
async def test_installed_expert_runs_through_host_drivers_and_checks_prerequisites(  # noqa: E501
    isolated,
    monkeypatch,
    mcp_runtime_host,
):
    from types import SimpleNamespace
    from qwenpaw.config.config import ModelSlotConfig
    from qwenpaw.config.utils import load_config
    from qwenpaw.providers import ProviderManager
    from qwenpaw.drivers.capabilities import (
        DriverInvocation,
        format_capability_id,
    )
    from qwenpaw.expert_packages.readiness import (
        check_configuration,
        verify_runtime,
    )
    from qwenpaw.agents.skill_system.workspace_service import SkillService

    channel, path, _, _ = await fixture_release(isolated)
    service = ExpertInstallService(isolated / "host", channel, "99.0.0")
    plan = await service.plan(path)
    await service.start(plan["id"])
    await service.tasks[plan["id"]]
    agent_id = service.status(plan["id"])["agent_id"]
    workspace = Path(load_config().agents.profiles[agent_id].workspace_dir)
    provider = SimpleNamespace(active_model=None)
    monkeypatch.setattr(ProviderManager, "get_instance", lambda: provider)
    with pytest.raises(ValueError, match="模型") as missing_model:
        check_configuration(agent_id)
    assert missing_model.value.problem == {
        "code": "model_required",
        "action": "models",
        "items": [],
    }
    provider.active_model = ModelSlotConfig(provider_id="test", model="test")
    assert check_configuration(agent_id) == ["calculate"]
    skills = SkillService(workspace)
    skills.disable_skill("example")
    with pytest.raises(ValueError, match="必需技能") as missing_skill:
        check_configuration(agent_id)
    assert missing_skill.value.problem == {
        "code": "skills_required",
        "action": "skills",
        "items": ["example"],
    }
    skills.enable_skill("example")

    class Gate:
        calls = 0

        async def request_approval(self, context):
            self.calls += 1
            assert context.driver_name == "expert-methods"

    gate = Gate()
    drivers = await sdk_mcp_manager(
        mcp_runtime_host,
        workspace,
        approval_gate=gate,
    )

    class Host:
        def schedule_agent_startup(self, _agent_id):
            async def start():
                await drivers.start()
                return True

            return asyncio.create_task(start())

        async def get_agent(self, _agent_id):
            return SimpleNamespace(driver_manager=drivers)

    try:
        assert await verify_runtime(Host(), agent_id, ["calculate"])
        capabilities = await drivers.list_driver_capabilities("expert-methods")
        result = await drivers.invoke_capability(
            DriverInvocation(
                capability_id=capabilities[0].capability_id,
                payload={},
            ),
        )
        assert result.ok, result
        assert result.value.structured_content == {"answer": 42}
        assert gate.calls == 1
        denied = await drivers.invoke_capability(
            DriverInvocation(
                capability_id=format_capability_id(
                    "mcp",
                    "expert-methods",
                    "tool",
                    "invoke",
                    "undeclared",
                ),
                payload={},
            ),
        )
        assert not denied.ok and denied.error_type == "tool_disabled"
        assert gate.calls == 1
        with pytest.raises(ValueError, match="工具缺失") as missing_tool:
            await verify_runtime(Host(), agent_id, ["calculate", "missing"])
        assert missing_tool.value.problem == {
            "code": "tools_required",
            "action": "tools",
            "items": ["missing"],
        }
    finally:
        await drivers.shutdown_all()
        await service.close()


@pytest.mark.asyncio
async def test_signature_and_tampered_archive_never_register_an_expert(
    isolated,
):
    channel, path, output, key = await fixture_release(isolated)
    service = ExpertInstallService(isolated / "installs", channel, "99.0.0")
    from qwenpaw.config.utils import load_config

    before = set(load_config().agents.profiles)
    manifest = output / path
    original = manifest.read_bytes()
    manifest.write_bytes(original + b" ")
    with pytest.raises(Exception, match="signature"):
        await service.plan(path)
    manifest.write_bytes(original)
    plan = await service.plan(path)
    release = json.loads(original)
    archive = output / release["artifact"]["path"]
    archive_bytes = archive.read_bytes()
    archive.write_bytes(b"corrupt")
    await service.start(plan["id"])
    await service.tasks[plan["id"]]
    assert service.status(plan["id"])["status"] == "failed"
    assert set(load_config().agents.profiles) == before
    # A valid signature is not evidence that the method meets its contract.
    archive.write_bytes(archive_bytes)
    release["mcp"]["smoke"][0]["expected"]["answer"] = 43
    modified = json.dumps(release).encode()
    manifest.write_bytes(modified)
    Path(str(manifest) + ".sig").write_bytes(
        base64.b64encode(key.sign(modified)),
    )
    broken = await service.plan(path)
    await service.start(broken["id"])
    await service.tasks[broken["id"]]
    assert service.status(broken["id"])["status"] == "failed"
    assert set(load_config().agents.profiles) == before


@pytest.mark.asyncio
async def test_failed_method_check_blocks_publication(isolated):
    with pytest.raises(Exception):
        await fixture_release(
            isolated,
            lambda spec: spec["mcp"]["smoke"][0]["expected"].update(answer=43),
        )
    assert not list((isolated / "channel").rglob("*.sig"))


@pytest.mark.parametrize(
    "name",
    ["../x", "/x", "a\\x", "CON.txt", "x/../y", "x%2fy", "a/b."],
)
def test_rejects_unsafe_paths(name):
    with pytest.raises(ValueError):
        relative_path(name)


@pytest.mark.asyncio
async def test_missing_offline_dependency_is_rejected_without_network(
    isolated,
):
    source = isolated / "source"
    spec = payload(source, "Requires-Dist: missing-library>=1\n")
    with pytest.raises(ValueError, match="Offline dependency"):
        await build(
            source,
            spec,
            isolated / "output",
            Ed25519PrivateKey.generate(),
        )
    assert not list((isolated / "output").rglob("*.sig"))


@pytest.mark.asyncio
async def test_cancel_and_restart_reuse_verified_download_without_creating_ghosts(  # noqa: E501
    isolated,
):
    channel, path, _, _ = await fixture_release(isolated)
    service = ExpertInstallService(isolated / "installs", channel, "99.0.0")
    plan = await service.plan(path)
    await service.start(plan["id"])
    service.cancel(plan["id"])
    await service.tasks[plan["id"]]
    assert service.status(plan["id"])["status"] == "cancelled"
    from qwenpaw.config.utils import load_config

    assert "ep-" + plan["id"][:20] not in load_config().agents.profiles
    await service.close()
    with pytest.raises(ValueError):
        await service.start(plan["id"])
    restored = ExpertInstallService(service.root, channel, "99.0.0")
    # Resume must not need the network for a previously verified download.
    channel.client = httpx.Client(
        transport=httpx.MockTransport(lambda request: httpx.Response(503)),
    )
    await restored.start(plan["id"])
    await restored.tasks[plan["id"]]
    assert restored.status(plan["id"])["status"] == "ready"


@pytest.mark.asyncio
async def test_rejects_foreign_platform_and_private_payload_before_publication(
    isolated,
):
    source = isolated / "source"
    spec = payload(source)
    key = Ed25519PrivateKey.generate()
    spec["target"] = "different-system"
    with pytest.raises(ValueError, match="target platform"):
        await build(source, spec, isolated / "output", key)
    spec["target"] = detect_target()
    (source / ".env").write_text("TOKEN=do-not-publish")
    with pytest.raises(ValueError, match="Private"):
        await build(source, spec, isolated / "output", key)
    assert not list((isolated / "output").rglob("*.sig"))


def test_frozen_host_requires_its_bundled_python(monkeypatch, tmp_path):
    monkeypatch.setenv("QWENPAW_DESKTOP_APP", "1")
    monkeypatch.delenv("QWENPAW_DESKTOP_PY_RUNTIME", raising=False)
    with pytest.raises(ValueError, match="Python"):
        host_python()
    interpreter = tmp_path / "python.exe"
    interpreter.write_bytes(b"path-selection-only")
    monkeypatch.setenv("QWENPAW_DESKTOP_PY_RUNTIME", str(interpreter))
    assert host_python() == str(interpreter)


@pytest.mark.asyncio
async def test_same_version_changed_content_is_rejected(isolated):
    source = isolated / "source"
    spec = payload(source)
    key = Ed25519PrivateKey.generate()
    output = isolated / "release"
    first = await build(source, spec, output, key)
    repeated = await build(source, spec, output, key)
    assert repeated["manifest_path"] == first["manifest_path"]
    (source / "AGENTS.md").write_text("changed without version bump")
    with pytest.raises(ValueError, match="version already exists"):
        await build(source, spec, output, key)
    assert (
        len(list((output / "expert-packages/manifests").glob("*.json"))) == 1
    )


@pytest.mark.asyncio
async def test_nested_wheel_private_files_block_signing(isolated):
    source = isolated / "source"
    spec = payload(source)
    with zipfile.ZipFile(source / spec["wheels"][0], "a") as archive:
        archive.writestr("example_method/.env", "AUDIT_CANARY=not-real")
    with pytest.raises(ValueError, match="Private file"):
        await build(
            source,
            spec,
            isolated / "output",
            Ed25519PrivateKey.generate(),
        )
    assert not list((isolated / "output").rglob("*.sig"))


@pytest.mark.asyncio
@pytest.mark.parametrize("pagination", [False, True])
async def test_undeclared_mcp_tools_block_signing(isolated, pagination):
    source = isolated / "source"
    spec = payload(source)
    server = source / "server.py"
    marker = "        # INSERT_TOOL_LIST_VARIANT"
    assert SERVER.count(marker) == 1
    undeclared = {"name": "undeclared", "inputSchema": {"type": "object"}}
    if pagination:
        variant = (
            '        if request.get("params", {}).get("cursor") == "next":\n'
            f'            result = {{"tools": [{undeclared!r}]}}\n'
            "        else:\n"
            '            result["nextCursor"] = "next"'
        )
    else:
        variant = f'        result["tools"].insert(0, {undeclared!r})'
    server.write_text(SERVER.replace(marker, variant), encoding="utf-8")
    with pytest.raises(Exception):
        await build(
            source,
            spec,
            isolated / "output",
            Ed25519PrivateKey.generate(),
        )
    assert not list((isolated / "output").rglob("*.sig"))


@pytest.mark.asyncio
async def test_deleted_expert_reinstalls_preserving_customization_and_tool_scope(  # noqa: E501
    isolated,
):
    from qwenpaw.config.utils import load_config, mutate_config
    from qwenpaw.drivers.storage import AsyncDriverCardStore
    from qwenpaw.drivers.capabilities import (
        mcp_tool_whitelist,
        mcp_tool_is_enabled,
    )

    channel, path, _, _ = await fixture_release(isolated)
    installer = ExpertInstallService(isolated / "installs", channel, "99.0.0")
    plan = await installer.plan(path)
    await installer.start(plan["id"])
    await installer.tasks[plan["id"]]
    state = installer.status(plan["id"])
    workspace = Path(
        load_config().agents.profiles[state["agent_id"]].workspace_dir,
    )
    (workspace / "AGENTS.md").write_text("my custom instructions")
    custom_config = json.loads(
        (workspace / "agent.json").read_text(encoding="utf-8"),
    )
    custom_config["name"] = "My customized expert"
    (workspace / "agent.json").write_text(
        json.dumps(custom_config),
        encoding="utf-8",
    )
    (workspace / "skills/example/SKILL.md").write_text(
        "my custom method guidance",
    )
    store = AsyncDriverCardStore(workspace / "drivers")
    card = await store.load("expert-methods", protocol="mcp")
    whitelist = mcp_tool_whitelist(card.config["tools"])
    assert mcp_tool_is_enabled(whitelist, "calculate")
    assert not mcp_tool_is_enabled(whitelist, "undeclared")
    card.enabled = False
    await store.save(card)
    (installer.path(plan["id"]) / "environment.json").write_text(
        json.dumps("previous-host-identity"),
    )
    assert installer.status(plan["id"])["status"] == "repair_required"
    with pytest.raises(ValueError, match="Python"):
        await installer.start(plan["id"])
    mutate_config(lambda cfg: cfg.agents.profiles.pop(state["agent_id"]))
    assert installer.status(plan["id"])["status"] == "removed"
    await installer.start(plan["id"])
    await installer.tasks[plan["id"]]
    reinstalled = installer.status(plan["id"])
    assert reinstalled["status"] == "ready", reinstalled.get("error")
    assert state["agent_id"] in load_config().agents.profiles
    assert (
        json.loads((workspace / "agent.json").read_text(encoding="utf-8"))[
            "name"
        ]
        == "My customized expert"
    )
    assert (workspace / "AGENTS.md").read_text() == "my custom instructions"
    assert (
        workspace / "skills/example/SKILL.md"
    ).read_text() == "my custom method guidance"
    assert not (await store.load("expert-methods", protocol="mcp")).enabled
    await installer.close()


def test_secret_scan_preserves_scientific_data_and_public_certificates(
    tmp_path,
):
    from qwenpaw.expert_packages.audit import inspect_payload

    with zipfile.ZipFile(tmp_path / "science.whl", "w") as archive:
        archive.writestr("science/data/table.csv", "x,y\n1,2")
        archive.writestr(
            "science/cacert.pem",
            "-----BEGIN CERTIFICATE-----\npublic",
        )
    inspect_payload(tmp_path)
    secret = "ghp_" + "a" * 36
    (tmp_path / "normal.py").write_text('TOKEN="' + secret + '"')
    with pytest.raises(ValueError, match="Possible credential") as error:
        inspect_payload(tmp_path)
    assert secret not in str(error.value)
