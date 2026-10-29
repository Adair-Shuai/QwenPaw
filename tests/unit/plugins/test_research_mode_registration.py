# -*- coding: utf-8 -*-
"""The shipped research mode coexists with native workspace tools."""

import importlib.util
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

from qwenpaw.agents.tools.web_search import web_search
from qwenpaw.app.workspace.workspace_plugins import WorkspacePlugins
from qwenpaw.runtime.tool_registry import ToolDescriptor


REPO = Path(__file__).resolve().parents[3]
PLUGIN = REPO / "plugins" / "bundle" / "ugsci_research"


def research_mode(monkeypatch):
    spec = importlib.util.spec_from_file_location(
        "shipped_research_mode_registration",
        PLUGIN / "plugin.py",
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, spec.name, module)
    spec.loader.exec_module(module)
    modes = []
    module._register_research_mode(  # pylint: disable=protected-access
        SimpleNamespace(register_mode=modes.append),
    )
    mode = modes[0]()
    mode.owner_plugin_id = module.PLUGIN_ID
    return mode, module


def workspace_with_native_search():
    workspace = SimpleNamespace(plugins=WorkspacePlugins())
    native = ToolDescriptor(name="web_search", func=web_search)
    workspace.plugins.tool_registry.register(native)
    return workspace, native


def test_research_mode_preserves_native_search_through_setup_and_teardown(
    monkeypatch,
):
    workspace, native = workspace_with_native_search()
    mode, module = research_mode(monkeypatch)
    registry = workspace.plugins.tool_registry

    workspace.plugins.register_mode(mode, workspace)

    assert registry.get("web_search") is native
    research = registry.get("research_web_search")
    assert research is not None
    search = module._web_search  # pylint: disable=protected-access
    assert research.func is search
    assert research.requires_modes == ("research",)
    for name in ("research_web_search", "literature_search", "data_analysis"):
        assert registry.get(name).owner_plugin_id == "ugsci_research"
    assert "research_web_search" not in {
        item.name for item in registry.filter(active_modes=set())
    }
    assert "research_web_search" in {
        item.name for item in registry.filter(active_modes={"research"})
    }

    assert workspace.plugins.unregister_mode(
        "research",
        workspace,
        expected=mode,
    )
    assert registry.get("web_search") is native
    assert registry.names() == ["web_search"]
    assert not workspace.plugins.modes


def test_research_mode_still_rejects_another_plugins_tool_occupancy(
    monkeypatch,
):
    workspace, native = workspace_with_native_search()
    mode, _module = research_mode(monkeypatch)
    registry = workspace.plugins.tool_registry
    foreign = ToolDescriptor(
        name="research_web_search",
        func=web_search,
        owner_plugin_id="other",
    )
    registry.register(foreign)

    with pytest.raises(ValueError, match="other"):
        workspace.plugins.register_mode(mode, workspace)

    assert registry.get("research_web_search") is foreign
    assert registry.get("web_search") is native
    assert not workspace.plugins.modes


@pytest.mark.parametrize("domain", ["research", "physics", "biology", "ml"])
def test_research_prompts_reference_the_distinct_search_tool(domain):
    prompt = (PLUGIN / "prompts" / f"{domain}.txt").read_text(encoding="utf-8")
    assert "`research_web_search`" in prompt
    assert "`web_search`" not in prompt
