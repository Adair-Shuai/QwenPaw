# -*- coding: utf-8 -*-
"""The public FlowForge registry discovers real configured workspaces."""

import importlib
import json
import os

import pytest

from qwenpaw.config import utils as config_utils
from qwenpaw.config.config import AgentProfileRef, Config


pytestmark = pytest.mark.parametrize(
    "namespace",
    [
        "plugins.bundle.flowforge.engine.adapter.agent_registry",
        "qwenpaw.plugins_bundle.flowforge.engine.adapter.agent_registry",
    ],
)


@pytest.fixture(name="config_files")
def isolated_config_files(tmp_path, monkeypatch):
    path = tmp_path / "root" / "config.json"
    path.parent.mkdir()
    monkeypatch.setattr(config_utils, "get_config_path", lambda: path)
    monkeypatch.setattr(config_utils, "_config_cache", None)
    monkeypatch.setattr(config_utils, "_config_mtime", None)
    monkeypatch.setattr(config_utils, "_agent_config_cache", {})
    config = Config()
    config.agents.profiles = {}

    def write(agent_id, name):
        # IDs deliberately differ from directory names. Discovery must use
        # the configured references, including workspaces outside root.
        workspace = tmp_path / f"custom-location-{agent_id}"
        workspace.mkdir(exist_ok=True)
        profile = {
            "id": agent_id,
            "name": name,
            "description": f"Research profile {agent_id}",
            "workspace_dir": str(workspace),
            "running": {"max_iters": 7},
            "active_model": {"provider_id": "configured", "model": "model-a"},
        }
        (workspace / "agent.json").write_text(
            json.dumps(profile),
            encoding="utf-8",
        )
        config.agents.profiles[agent_id] = AgentProfileRef(
            id=agent_id,
            workspace_dir=str(workspace),
        )
        # Avoid filesystem timestamp granularity affecting the real config
        # cache when a second profile is added in the same clock tick.
        previous = path.stat().st_mtime_ns if path.exists() else 0
        path.write_text(config.model_dump_json(), encoding="utf-8")
        stamp = max(path.stat().st_mtime_ns, previous + 2_000_000_000)
        os.utime(path, ns=(stamp, stamp))
        return workspace

    return write


def test_registry_discovers_configured_workspace_profiles(
    namespace,
    config_files,
    tmp_path,
):
    config_files("first-id", "Beta scientist")
    config_files("second-id", "Alpha scientist")
    unrelated = tmp_path / "unreferenced-workspace"
    unrelated.mkdir()
    (unrelated / "agent.json").write_text(
        '{"id": "stray", "name": "Not configured"}',
        encoding="utf-8",
    )
    registry = importlib.import_module(namespace).AgentRegistry()
    assert [item.name for item in registry.all()] == [
        "Beta scientist",
        "Alpha scientist",
    ]
    assert registry.names() == ["Alpha scientist", "Beta scientist"]
    assert len(registry) == 2
    assert "Not configured" not in registry
    assert "Alpha scientist" in registry
    assert 1 not in registry
    definition = registry.get("Beta scientist")
    assert definition is not None
    assert definition.description == "Research profile first-id"
    assert definition.max_turns == 7
    assert definition.model.provider == "configured"
    assert definition.model.model == "model-a"
    assert registry.get("missing") is None


def test_registry_retains_lazy_snapshot_until_a_new_instance(
    namespace,
    config_files,
):
    config_files("first-id", "First scientist")
    module = importlib.import_module(namespace)
    registry = module.AgentRegistry()
    first = registry.get("First scientist")
    assert first is not None
    config_files("second-id", "Second scientist")
    assert registry.all() == [first]
    assert registry.get("First scientist") is first
    assert "Second scientist" not in registry
    assert module.AgentRegistry().names() == [
        "First scientist",
        "Second scientist",
    ]


def test_registry_continues_after_an_invalid_agent_file(
    namespace,
    config_files,
):
    workspace = config_files("broken-id", "Broken scientist")
    (workspace / "agent.json").write_text("{invalid-json", encoding="utf-8")
    config_files("valid-id", "Valid scientist")
    registry = importlib.import_module(namespace).AgentRegistry()
    assert registry.names() == ["Valid scientist"]
    assert registry.get("Valid scientist") is not None
    assert len(registry) == 1
