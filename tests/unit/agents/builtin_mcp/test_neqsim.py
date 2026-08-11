# -*- coding: utf-8 -*-
"""Tests for the always-present built-in NeqSim Driver."""

# pylint: disable=protected-access

from __future__ import annotations

import asyncio
import io
import json
import os
import stat
import tarfile
import zipfile
from pathlib import Path
from types import SimpleNamespace

import pytest

from qwenpaw.agents.builtin_mcp import neqsim_runtime as runtime
from qwenpaw.agents.builtin_mcp.neqsim import (
    LEGACY_NEQSIM_CLIENT_KEY,
    NEQSIM_CLIENT_KEY,
    ensure_neqsim_driver_registered,
)
from qwenpaw.agents.builtin_mcp.neqsim_runtime import (
    InstallTask,
    NeqSimInstallManager,
    NeqSimRuntimeStatus,
    build_endpoint,
    discover_runtime,
)


def _clear_external_runtime(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in (
        "QWENPAW_DESKTOP_JAVA_HOME",
        "QWENPAW_DESKTOP_NEQSIM_JAR",
        "QWENPAW_TAURI_RESOURCE_DIR",
        "JAVA_HOME",
        "NEQSIM_JAR",
        "NEQSIM_HOME",
    ):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("PATH", "")


def test_user_runtime_discovery(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _clear_external_runtime(monkeypatch)
    java = (
        tmp_path
        / "java"
        / "bin"
        / ("java.exe" if __import__("os").name == "nt" else "java")
    )
    java.parent.mkdir(parents=True)
    java.write_bytes(b"java")
    jar = tmp_path / "neqsim-mcp-server.jar"
    jar.write_bytes(b"jar")
    (tmp_path / ".neqsim-version").write_text("3.17.0", encoding="utf-8")
    monkeypatch.setattr(runtime, "_java_major_version", lambda _path: 21)

    status = discover_runtime(tmp_path)

    assert status.ready is True
    assert status.state == "ready"
    assert status.validated is True
    assert status.java_major_version == 21
    assert status.detected_neqsim_version == "3.17.0"
    assert status.java_source == "user"
    assert status.jar_source == "user"
    assert build_endpoint(status)["command"] == str(java.resolve())


def test_missing_runtime_is_installable(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _clear_external_runtime(monkeypatch)

    status = discover_runtime(tmp_path)

    assert status.ready is False
    assert status.state == "needs_install"
    assert status.installable is True
    assert set(status.missing) == {"java-runtime", "neqsim-mcp-server"}


def test_runtime_does_not_mix_sources(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _clear_external_runtime(monkeypatch)
    user_root = tmp_path / "user-runtime"
    user_root.mkdir()
    jar = user_root / "neqsim-mcp-server.jar"
    jar.write_bytes(b"jar")
    (user_root / ".neqsim-version").write_text("3.17.0", encoding="utf-8")

    desktop_root = tmp_path / "desktop-java"
    java = desktop_root / "bin" / ("java.exe" if os.name == "nt" else "java")
    java.parent.mkdir(parents=True)
    java.write_bytes(b"java")
    monkeypatch.setenv("QWENPAW_DESKTOP_JAVA_HOME", str(desktop_root))
    monkeypatch.setenv("QWENPAW_NEQSIM_RUNTIME_DIR", str(user_root))
    monkeypatch.setattr(runtime, "_java_major_version", lambda _path: 21)

    status = discover_runtime()

    assert status.ready is False
    assert status.validated is False
    assert any("different runtime sources" in issue for issue in status.issues)


def test_runtime_rejects_old_java(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _clear_external_runtime(monkeypatch)
    java = (
        tmp_path / "java" / "bin" / ("java.exe" if os.name == "nt" else "java")
    )
    java.parent.mkdir(parents=True)
    java.write_bytes(b"java")
    (tmp_path / "neqsim-mcp-server.jar").write_bytes(b"jar")
    (tmp_path / ".neqsim-version").write_text("3.17.0", encoding="utf-8")
    monkeypatch.setattr(runtime, "_java_major_version", lambda _path: 17)

    status = discover_runtime(tmp_path)

    assert status.ready is False
    assert status.state == "incompatible"
    assert any("Java 17 is unsupported" in issue for issue in status.issues)


def test_runtime_rejects_unsupported_neqsim_version(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _clear_external_runtime(monkeypatch)
    java = (
        tmp_path / "java" / "bin" / ("java.exe" if os.name == "nt" else "java")
    )
    java.parent.mkdir(parents=True)
    java.write_bytes(b"java")
    (tmp_path / "neqsim-mcp-server.jar").write_bytes(b"jar")
    (tmp_path / ".neqsim-version").write_text("3.16.2", encoding="utf-8")
    monkeypatch.setattr(runtime, "_java_major_version", lambda _path: 21)

    status = discover_runtime(tmp_path)

    assert status.ready is False
    assert status.state == "incompatible"
    assert any("3.16.2 is unsupported" in issue for issue in status.issues)


@pytest.mark.parametrize("link_type", [tarfile.SYMTYPE, tarfile.LNKTYPE])
def test_tar_extraction_rejects_links(
    tmp_path: Path,
    link_type: bytes,
) -> None:
    archive = tmp_path / "runtime.tar.gz"
    with tarfile.open(archive, "w:gz") as bundle:
        link = tarfile.TarInfo("runtime/bin/java")
        link.type = link_type
        link.linkname = "../../outside"
        bundle.addfile(link)

    with pytest.raises(RuntimeError, match="Links and special files"):
        runtime._extract_archive(archive, tmp_path / "work")


def test_zip_extraction_rejects_symlinks(tmp_path: Path) -> None:
    archive = tmp_path / "runtime.zip"
    link = zipfile.ZipInfo("runtime/bin/java")
    link.create_system = 3
    link.external_attr = (stat.S_IFLNK | 0o777) << 16
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr(link, "../../outside")

    with pytest.raises(RuntimeError, match="Links and special files"):
        runtime._extract_archive(archive, tmp_path / "work")


def test_tar_extraction_rejects_parent_traversal(tmp_path: Path) -> None:
    archive = tmp_path / "runtime.tar.gz"
    payload = b"escape"
    with tarfile.open(archive, "w:gz") as bundle:
        member = tarfile.TarInfo("../outside")
        member.size = len(payload)
        bundle.addfile(member, io.BytesIO(payload))

    with pytest.raises(RuntimeError, match="Unsafe path"):
        runtime._extract_archive(archive, tmp_path / "work")


def test_tar_extraction_preserves_java_executable(tmp_path: Path) -> None:
    archive = tmp_path / "runtime.tar.gz"
    payload = b"java"
    java_name = (
        "runtime/bin/java.exe" if os.name == "nt" else "runtime/bin/java"
    )
    with tarfile.open(archive, "w:gz") as bundle:
        member = tarfile.TarInfo(java_name)
        member.mode = 0o755
        member.size = len(payload)
        bundle.addfile(member, io.BytesIO(payload))

    java_root = runtime._extract_archive(archive, tmp_path / "work")
    java = java_root / "bin" / ("java.exe" if os.name == "nt" else "java")

    assert java.read_bytes() == payload
    if os.name != "nt":
        assert java.stat().st_mode & stat.S_IXUSR


@pytest.mark.asyncio
async def test_install_task_is_persisted_and_reloaded(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    state_path = tmp_path / "neqsim-install-tasks.json"
    ready = NeqSimRuntimeStatus(
        state="ready",
        ready=True,
        installable=True,
        runtime_dir=str(tmp_path / "runtime"),
        java_path="java",
        jar_path="neqsim.jar",
        missing=(),
    )

    def fake_install_runtime(*, progress):
        progress("正在安装", 50)
        return ready

    monkeypatch.setattr(runtime, "install_runtime", fake_install_runtime)
    manager = NeqSimInstallManager(state_path)
    started = manager.start()
    for _ in range(100):
        current = manager.get(started.id)
        if current and current.status == "completed":
            break
        await asyncio.sleep(0.01)

    restored = NeqSimInstallManager(state_path).get(started.id)

    assert restored is not None
    assert restored.status == "completed"
    assert restored.progress == 100
    assert restored.runtime is not None
    assert (
        json.loads(state_path.read_text(encoding="utf-8"))["schema_version"]
        == 1
    )
    assert not list(tmp_path.glob(".*.tmp"))


@pytest.mark.asyncio
async def test_driver_refresh_failure_does_not_fail_installed_runtime(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    state_path = tmp_path / "neqsim-install-tasks.json"
    ready = NeqSimRuntimeStatus(
        state="ready",
        ready=True,
        installable=True,
        runtime_dir=str(tmp_path / "runtime"),
        java_path="java",
        jar_path="neqsim.jar",
        missing=(),
    )
    monkeypatch.setattr(runtime, "install_runtime", lambda *, progress: ready)

    def failed_refresh() -> None:
        raise RuntimeError("driver registry temporarily unavailable")

    manager = NeqSimInstallManager(state_path)
    started = manager.start(failed_refresh)
    for _ in range(100):
        current = manager.get(started.id)
        if current and current.status not in {"queued", "running"}:
            break
        await asyncio.sleep(0.01)

    current = manager.get(started.id)
    assert current is not None
    assert current.status == "completed"
    assert current.progress == 100
    assert current.error == ""
    assert "Driver 即时刷新失败" in current.warning
    assert current.runtime is not None


def test_interrupted_task_recovers_as_completed_when_runtime_is_ready(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    state_path = tmp_path / "neqsim-install-tasks.json"
    interrupted = InstallTask(
        id="interrupted",
        status="running",
        progress=90,
        message="正在启用",
    )
    state_path.write_text(
        json.dumps({"schema_version": 1, "tasks": [interrupted.to_dict()]}),
        encoding="utf-8",
    )
    ready = NeqSimRuntimeStatus(
        state="ready",
        ready=True,
        installable=True,
        runtime_dir=str(tmp_path / "runtime"),
        java_path="java",
        jar_path="neqsim.jar",
        missing=(),
    )
    monkeypatch.setattr(runtime, "discover_runtime", lambda: ready)

    recovered = NeqSimInstallManager(state_path).get(interrupted.id)

    assert recovered is not None
    assert recovered.status == "completed"
    assert recovered.progress == 100
    assert recovered.recovered is True
    assert recovered.runtime is not None


def test_interrupted_task_becomes_retryable_failure_when_runtime_is_incomplete(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    state_path = tmp_path / "neqsim-install-tasks.json"
    interrupted = InstallTask(id="interrupted", status="queued")
    state_path.write_text(
        json.dumps({"schema_version": 1, "tasks": [interrupted.to_dict()]}),
        encoding="utf-8",
    )
    missing = NeqSimRuntimeStatus(
        state="needs_install",
        ready=False,
        installable=True,
        runtime_dir=str(tmp_path / "runtime"),
        missing=("java-runtime", "neqsim-mcp-server"),
    )
    monkeypatch.setattr(runtime, "discover_runtime", lambda: missing)

    recovered = NeqSimInstallManager(state_path).get(interrupted.id)

    assert recovered is not None
    assert recovered.status == "failed"
    assert recovered.recovered is True
    assert "重新安装" in recovered.error
    assert recovered.runtime is not None


class _Store:
    def __init__(self) -> None:
        self.card = None

    async def stored_path(self, _name: str):
        return None


class _Manager:
    def __init__(self) -> None:
        self.card_store = _Store()
        self.registered = None

    async def register_driver(self, card) -> None:
        self.registered = card


@pytest.mark.asyncio
async def test_missing_runtime_still_registers_disabled_card(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    status = NeqSimRuntimeStatus(
        state="needs_install",
        ready=False,
        installable=True,
        runtime_dir="runtime",
        missing=("java-runtime", "neqsim-mcp-server"),
    )
    monkeypatch.setattr(
        "qwenpaw.agents.builtin_mcp.neqsim.discover_runtime",
        lambda: status,
    )
    manager = _Manager()

    await ensure_neqsim_driver_registered(
        SimpleNamespace(agent_id="default"),
        manager,
    )

    assert manager.registered is not None
    assert manager.registered.name == NEQSIM_CLIENT_KEY
    assert manager.registered.enabled is False
    assert manager.registered.config["builtin"] is True
    assert manager.registered.config["display_name"] == "UGSci NeqSim"
    assert manager.registered.config["installable"] is True
    assert manager.registered.config["runtime_status"] == "needs_install"


class _CardStore:
    def __init__(self, cards: dict[str, object]) -> None:
        self.cards = cards

    async def stored_path(self, name: str):
        return name if name in self.cards else None

    async def load_path(self, name: str):
        return self.cards[name]


class _MigrationManager:
    def __init__(self, cards: dict[str, object]) -> None:
        self.card_store = _CardStore(cards)
        self.registered = None
        self.deleted: list[str] = []

    async def register_driver(self, card) -> None:
        self.registered = card
        self.card_store.cards[card.name] = card

    async def delete_driver(self, name: str) -> None:
        self.deleted.append(name)
        self.card_store.cards.pop(name, None)


@pytest.mark.asyncio
async def test_legacy_builtin_card_migrates_without_claiming_user_neqsim(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from qwenpaw.drivers.constants import POLICY_EFFECT_ASK, PROTOCOL_MCP
    from qwenpaw.drivers.contracts import DriverCard, DriverPolicy

    status = NeqSimRuntimeStatus(
        state="ready",
        ready=True,
        installable=True,
        runtime_dir="runtime",
        java_path="java",
        jar_path="neqsim.jar",
        missing=(),
    )
    monkeypatch.setattr(
        "qwenpaw.agents.builtin_mcp.neqsim.discover_runtime",
        lambda: status,
    )
    legacy = DriverCard(
        name=LEGACY_NEQSIM_CLIENT_KEY,
        protocol=PROTOCOL_MCP,
        endpoint={},
        config={"builtin": True},
        enabled=False,
        policy=DriverPolicy(default_effect=POLICY_EFFECT_ASK, rules=[]),
    )
    user = DriverCard(
        name="neqsim-user",
        protocol=PROTOCOL_MCP,
        endpoint={},
        config={},
        enabled=True,
        policy=DriverPolicy(default_effect=POLICY_EFFECT_ASK, rules=[]),
    )
    manager = _MigrationManager(
        {LEGACY_NEQSIM_CLIENT_KEY: legacy, "neqsim-user": user},
    )

    await ensure_neqsim_driver_registered(
        SimpleNamespace(agent_id="default"),
        manager,
    )

    assert manager.registered is not None
    assert manager.registered.name == NEQSIM_CLIENT_KEY
    assert manager.registered.enabled is False
    assert manager.deleted == [LEGACY_NEQSIM_CLIENT_KEY]
    assert "neqsim-user" in manager.card_store.cards


@pytest.mark.asyncio
async def test_user_neqsim_card_coexists_with_namespaced_builtin(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from qwenpaw.drivers.constants import POLICY_EFFECT_ASK, PROTOCOL_MCP
    from qwenpaw.drivers.contracts import DriverCard, DriverPolicy

    status = NeqSimRuntimeStatus(
        state="ready",
        ready=True,
        installable=True,
        runtime_dir="runtime",
        java_path="java",
        jar_path="neqsim.jar",
        missing=(),
    )
    monkeypatch.setattr(
        "qwenpaw.agents.builtin_mcp.neqsim.discover_runtime",
        lambda: status,
    )
    user_card = DriverCard(
        name=LEGACY_NEQSIM_CLIENT_KEY,
        protocol=PROTOCOL_MCP,
        endpoint={"transport": "stdio", "command": "custom"},
        config={"display_name": "My NeqSim"},
        enabled=True,
        policy=DriverPolicy(default_effect=POLICY_EFFECT_ASK, rules=[]),
    )
    manager = _MigrationManager({LEGACY_NEQSIM_CLIENT_KEY: user_card})

    await ensure_neqsim_driver_registered(
        SimpleNamespace(agent_id="default"),
        manager,
    )

    assert manager.registered is not None
    assert manager.registered.name == NEQSIM_CLIENT_KEY
    assert not manager.deleted
    assert manager.card_store.cards[LEGACY_NEQSIM_CLIENT_KEY] is user_card


@pytest.mark.asyncio
async def test_runtime_recovery_does_not_reenable_user_disabled_builtin(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from qwenpaw.drivers.constants import POLICY_EFFECT_ASK, PROTOCOL_MCP
    from qwenpaw.drivers.contracts import DriverCard, DriverPolicy

    status = NeqSimRuntimeStatus(
        state="ready",
        ready=True,
        installable=True,
        runtime_dir="runtime",
        java_path="java",
        jar_path="neqsim.jar",
        missing=(),
    )
    monkeypatch.setattr(
        "qwenpaw.agents.builtin_mcp.neqsim.discover_runtime",
        lambda: status,
    )
    existing = DriverCard(
        name=NEQSIM_CLIENT_KEY,
        protocol=PROTOCOL_MCP,
        endpoint={},
        config={"builtin": True, "auto_disabled": False},
        enabled=False,
        policy=DriverPolicy(default_effect=POLICY_EFFECT_ASK, rules=[]),
    )
    manager = _MigrationManager({NEQSIM_CLIENT_KEY: existing})

    await ensure_neqsim_driver_registered(
        SimpleNamespace(agent_id="default"),
        manager,
    )

    assert manager.registered is not None
    assert manager.registered.enabled is False


@pytest.mark.asyncio
async def test_runtime_recovery_reenables_only_auto_disabled_builtin(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from qwenpaw.drivers.constants import POLICY_EFFECT_ASK, PROTOCOL_MCP
    from qwenpaw.drivers.contracts import DriverCard, DriverPolicy

    status = NeqSimRuntimeStatus(
        state="ready",
        ready=True,
        installable=True,
        runtime_dir="runtime",
        java_path="java",
        jar_path="neqsim.jar",
        missing=(),
    )
    monkeypatch.setattr(
        "qwenpaw.agents.builtin_mcp.neqsim.discover_runtime",
        lambda: status,
    )
    existing = DriverCard(
        name=NEQSIM_CLIENT_KEY,
        protocol=PROTOCOL_MCP,
        endpoint={},
        config={"builtin": True, "auto_disabled": True},
        enabled=False,
        policy=DriverPolicy(default_effect=POLICY_EFFECT_ASK, rules=[]),
    )
    manager = _MigrationManager({NEQSIM_CLIENT_KEY: existing})

    await ensure_neqsim_driver_registered(
        SimpleNamespace(agent_id="default"),
        manager,
    )

    assert manager.registered is not None
    assert manager.registered.enabled is True
    assert manager.registered.config["auto_disabled"] is False


@pytest.mark.asyncio
async def test_user_disabled_preference_survives_runtime_loss_and_recovery(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from qwenpaw.drivers.constants import POLICY_EFFECT_ASK, PROTOCOL_MCP
    from qwenpaw.drivers.contracts import DriverCard, DriverPolicy

    states = iter(
        [
            NeqSimRuntimeStatus(
                state="needs_install",
                ready=False,
                installable=True,
                runtime_dir="runtime",
                missing=("java-runtime", "neqsim-mcp-server"),
            ),
            NeqSimRuntimeStatus(
                state="ready",
                ready=True,
                installable=True,
                runtime_dir="runtime",
                java_path="java",
                jar_path="neqsim.jar",
                missing=(),
            ),
        ],
    )
    monkeypatch.setattr(
        "qwenpaw.agents.builtin_mcp.neqsim.discover_runtime",
        lambda: next(states),
    )
    existing = DriverCard(
        name=NEQSIM_CLIENT_KEY,
        protocol=PROTOCOL_MCP,
        endpoint={},
        config={"builtin": True, "auto_disabled": False},
        enabled=False,
        policy=DriverPolicy(default_effect=POLICY_EFFECT_ASK, rules=[]),
    )
    manager = _MigrationManager({NEQSIM_CLIENT_KEY: existing})

    await ensure_neqsim_driver_registered(
        SimpleNamespace(agent_id="default"),
        manager,
    )
    assert manager.registered.config["user_enabled"] is False
    assert manager.registered.config["auto_disabled"] is True

    await ensure_neqsim_driver_registered(
        SimpleNamespace(agent_id="default"),
        manager,
    )

    assert manager.registered.enabled is False
    assert manager.registered.config["user_enabled"] is False
    assert manager.registered.config["auto_disabled"] is False
