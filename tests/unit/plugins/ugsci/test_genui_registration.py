# -*- coding: utf-8 -*-
"""Unit tests for the GenUI registration module.

Covers plan section 9.1:
- register_genui registers all three tools
- Conflict detection: existing emit_ui_tree skips tool registration
- Prompt section registration
- UGSci plugin registers GenUI tools (integration with plugin.register)
- Config gating: genui_enabled, genui_channels, genui_allow_actions (PLAN §8)
"""

from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock

import pytest

from qwenpaw.plugins_bundle.ugsci.genui.registration import (
    register_genui,
    dispose_genui,
    get_genui_config,
    get_allowed_actions,
    is_genui_enabled_for_context,
)


class RecordingPluginApi:
    """Small PluginApi stand-in that records registrations."""

    def __init__(
        self,
        *,
        has_existing_emit_ui: bool = False,
        config: dict[str, Any] | None = None,
    ) -> None:
        self.tools: list[str] = []
        self.prompt_sections: list[str] = []
        self._has_existing = has_existing_emit_ui
        # Default config: GenUI enabled for console channel
        self.config = (
            config
            if config is not None
            else {
                "genui_enabled": True,
                "genui_channels": ["console", "web"],
            }
        )
        self._registry = MagicMock() if has_existing_emit_ui else None
        if self._registry:
            wm = MagicMock()
            ws = MagicMock()
            ws.plugins.tool_registry = (
                {"emit_ui_tree": MagicMock()} if has_existing_emit_ui else {}
            )
            wm.agents = {"agent1": ws}
            self._registry.get_workspace_manager.return_value = wm

    def register_tool(self, *, tool_name: str, **_kwargs: Any) -> None:
        self.tools.append(tool_name)

    def register_prompt_section(self, *, name: str, **_kwargs: Any) -> None:
        self.prompt_sections.append(name)


# ─── register_genui ─────────────────────────────────────────────────────────


class TestRegisterGenui:
    def test_registers_all_three_tools(self) -> None:
        api = RecordingPluginApi()
        register_genui(api, plugin_id="ugsci")
        assert "emit_ui_tree" in api.tools
        assert "list_ui_components" in api.tools
        assert "get_genui_guide" in api.tools

    def test_registers_prompt_section(self) -> None:
        api = RecordingPluginApi()
        register_genui(api, plugin_id="ugsci")
        assert "ugsci.genui_guide" in api.prompt_sections

    def test_conflict_skips_tool_registration(self) -> None:
        """
        When emit_ui_tree already exists upstream, tools should not be
        re-registered.
        """
        api = RecordingPluginApi(has_existing_emit_ui=True)
        register_genui(api, plugin_id="ugsci")
        # Tools should NOT be registered
        assert len(api.tools) == 0
        # But prompt section should still be registered
        assert "ugsci.genui_guide" in api.prompt_sections

    def test_no_conflict_registers_tools(self) -> None:
        """When no existing emit_ui_tree, tools should be registered."""
        api = RecordingPluginApi(has_existing_emit_ui=False)
        register_genui(api, plugin_id="ugsci")
        assert (
            len(api.tools) == 4
        )  # emit_ui_tree, emit_ui_patch, list_ui_components, get_genui_guide

    def test_tools_auto_enabled_when_genui_enabled(self) -> None:
        """When GenUI is enabled, tools should be auto-enabled."""
        api = RecordingPluginApi()
        captured_kwargs: dict[str, Any] = {}

        def capture_register(*, tool_name: str, **kwargs: Any) -> None:
            captured_kwargs[tool_name] = kwargs
            api.tools.append(tool_name)

        api.register_tool = capture_register  # type: ignore[assignment]
        register_genui(api, plugin_id="ugsci")

        for name in ("emit_ui_tree", "list_ui_components", "get_genui_guide"):
            assert name in captured_kwargs
            # When GENUI_ENABLED=true, tools should be auto-enabled
            assert captured_kwargs[name].get("enabled") is True

    def test_tools_disabled_when_genui_disabled(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """
        When GenUI is explicitly disabled, tools are registered but with
        enabled=False and no prompt.
        """
        monkeypatch.setenv("GENUI_ENABLED", "false")
        api = RecordingPluginApi(config={"genui_enabled": False})
        captured_kwargs: dict[str, Any] = {}

        def capture_register(*, tool_name: str, **kwargs: Any) -> None:
            captured_kwargs[tool_name] = kwargs
            api.tools.append(tool_name)

        api.register_tool = capture_register  # type: ignore[assignment]
        register_genui(api, plugin_id="ugsci")

        # Tools should be registered (visible in Tools page) but disabled
        assert len(api.tools) == 4
        for name in ("emit_ui_tree", "list_ui_components", "get_genui_guide"):
            assert name in captured_kwargs
            assert captured_kwargs[name].get("enabled") is False
        # Prompt should NOT be registered when disabled
        assert len(api.prompt_sections) == 0

    def test_exception_does_not_crash(self) -> None:
        """If register_tool raises, register_genui should not crash."""

        class FailingApi:
            def __init__(self):
                self._registry = None
                self.config = {
                    "genui_enabled": True,
                    "genui_channels": ["console"],
                }
                self.prompt_sections: list[str] = []

            def register_tool(self, *, tool_name: str, **_kwargs: Any) -> None:
                raise RuntimeError("registration failed")

            def register_prompt_section(
                self,
                *,
                name: str,
                **_kwargs: Any,
            ) -> None:
                self.prompt_sections.append(name)

        api = FailingApi()
        # Should not raise
        register_genui(api, plugin_id="ugsci")


# ─── Config gating (PLAN §8) ────────────────────────────────────────────────


class TestConfigGating:
    """Tests for configuration-based feature/channel gating."""

    def test_enabled_by_default(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """GenUI should be enabled by default."""
        monkeypatch.delenv("GENUI_ENABLED", raising=False)
        config = get_genui_config(api=None)
        assert config["enabled"] is True

    def test_enabled_via_plugin_config(self) -> None:
        """GenUI should be enabled when api.config has genui_enabled=True."""

        class ConfigApi:
            config = {"genui_enabled": True, "genui_channels": ["console"]}

        config = get_genui_config(api=ConfigApi())
        assert config["enabled"] is True
        assert "console" in config["channels"]

    def test_enabled_via_env(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """GenUI should be enabled when GENUI_ENABLED env var is set."""
        monkeypatch.setenv("GENUI_ENABLED", "true")
        config = get_genui_config(api=None)
        assert config["enabled"] is True

    def test_env_overrides_plugin_config(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """Environment variables should override plugin config."""
        monkeypatch.setenv("GENUI_ENABLED", "false")

        class ConfigApi:
            config = {"genui_enabled": True}

        config = get_genui_config(api=ConfigApi())
        assert config["enabled"] is False

    def test_enabled_registers_tools_and_prompt(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """
        When GenUI is enabled (default), tools are auto-enabled and prompt is
        registered.
        """
        monkeypatch.delenv("GENUI_ENABLED", raising=False)
        api = RecordingPluginApi(config={"genui_enabled": True})
        register_genui(api, plugin_id="ugsci")
        assert len(api.tools) == 4
        assert len(api.prompt_sections) == 1

    def test_channel_not_in_list_disables_auto_enable(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """
        When current channel is not in genui_channels, tools are registered
        but not auto-enabled.
        """
        monkeypatch.delenv("GENUI_ENABLED", raising=False)
        # Channel detection returns "console" by default in tests
        api = RecordingPluginApi(
            config={
                "genui_enabled": True,
                "genui_channels": ["wechat"],  # console not in list
            },
        )
        register_genui(api, plugin_id="ugsci")
        # Tools should still be registered (disabled) so they appear in Tools
        # page
        assert len(api.tools) == 4
        # But prompt should NOT be registered
        assert len(api.prompt_sections) == 0

    def test_allow_actions_default(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """Default allowed actions should be send_message only."""
        monkeypatch.delenv("GENUI_ALLOW_ACTIONS", raising=False)
        actions = get_allowed_actions(api=None)
        assert "send_message" in actions
        assert len(actions) == 1

    def test_allow_actions_from_config(self) -> None:
        """Allowed actions should be read from plugin config."""

        class ConfigApi:
            config = {
                "genui_enabled": True,
                "genui_allow_actions": ["send_message", "open_url"],
            }

        actions = get_allowed_actions(api=ConfigApi())
        assert "send_message" in actions
        assert "open_url" in actions

    def test_allow_actions_from_env(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """Allowed actions should be read from env."""
        monkeypatch.setenv("GENUI_ALLOW_ACTIONS", "send_message,navigate")
        actions = get_allowed_actions(api=None)
        assert "send_message" in actions
        assert "navigate" in actions

    def test_allow_html_default_false(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """allow_html should default to False."""
        monkeypatch.delenv("GENUI_ALLOW_HTML", raising=False)
        config = get_genui_config(api=None)
        assert config["allow_html"] is False

    def test_allow_html_from_config(self) -> None:
        """allow_html should be read from plugin config."""

        class ConfigApi:
            config = {"genui_enabled": True, "genui_allow_html": True}

        config = get_genui_config(api=ConfigApi())
        assert config["allow_html"] is True

    def test_is_genui_enabled_for_context_disabled(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """
        is_genui_enabled_for_context should return False when explicitly
        disabled.
        """
        monkeypatch.setenv("GENUI_ENABLED", "false")
        assert is_genui_enabled_for_context({"enabled": False}) is False

    def test_is_genui_enabled_for_context_enabled(self) -> None:
        """
        is_genui_enabled_for_context should return True when enabled for
        console.
        """
        config = {"enabled": True, "channels": ["console"]}
        # Channel defaults to "console" in test environment
        assert is_genui_enabled_for_context(config) is True

    def test_channels_coercion_from_string(self) -> None:
        """Channels should be coerced from comma-separated string."""

        class ConfigApi:
            config = {
                "genui_enabled": True,
                "genui_channels": "console, web, pywebview",
            }

        config = get_genui_config(api=ConfigApi())
        assert "console" in config["channels"]
        assert "web" in config["channels"]
        assert "pywebview" in config["channels"]

    def test_config_precedence_env_wins(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """Environment should override plugin config for all keys."""
        monkeypatch.setenv("GENUI_ENABLED", "true")
        monkeypatch.setenv("GENUI_CHANNELS", "console")
        monkeypatch.setenv("GENUI_ALLOW_HTML", "true")
        monkeypatch.setenv("GENUI_ALLOW_ACTIONS", "send_message,open_url")

        class ConfigApi:
            config = {
                "genui_enabled": False,
                "genui_channels": ["wechat"],
                "genui_allow_html": False,
                "genui_allow_actions": ["send_message"],
            }

        config = get_genui_config(api=ConfigApi())
        assert config["enabled"] is True
        assert config["channels"] == ["console"]
        assert config["allow_html"] is True
        assert "open_url" in config["allow_actions"]


class TestPluginIntegration:
    """Verify that UGSciPlugin.register calls register_genui."""

    def test_plugin_registers_genui_tools(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """The UGSciPlugin should register GenUI tools during register()."""
        from qwenpaw.plugins_bundle.ugsci import engine
        from qwenpaw.plugins_bundle.ugsci.plugin import UGSciPlugin

        monkeypatch.setattr(engine, "init_default_engines", lambda: 0)

        api = RecordingPluginApi()
        UGSciPlugin().register(api)

        assert "emit_ui_tree" in api.tools
        assert "list_ui_components" in api.tools
        assert "get_genui_guide" in api.tools
        assert "ugsci.genui_guide" in api.prompt_sections


# ─── dispose_genui (PLAN §9.1: UGSci 卸载后的清理) ──────────────────────────


class TestDisposeGenui:
    """Tests for GenUI registration cleanup on plugin unload."""

    def test_dispose_does_not_crash(self) -> None:
        """dispose_genui should be callable without error."""
        dispose_genui(plugin_id="ugsci")

    def test_dispose_after_register(self) -> None:
        """dispose_genui should be callable after registration."""
        api = RecordingPluginApi()
        register_genui(api, plugin_id="ugsci")
        # Dispose should not raise
        dispose_genui(plugin_id="ugsci")

    def test_dispose_without_register(self) -> None:
        """
        dispose_genui should be safe to call even if nothing was registered.
        """
        dispose_genui(plugin_id="ugsci")

    def test_dispose_with_different_plugin_id(self) -> None:
        """dispose_genui should work with different plugin IDs."""
        dispose_genui(plugin_id="custom_plugin")

    def test_state_store_survives_dispose(self) -> None:
        """The state store should remain functional after dispose_genui."""
        from qwenpaw.plugins_bundle.ugsci.genui.state import get_state_store

        store = get_state_store()
        assert store is not None

        dispose_genui(plugin_id="ugsci")

        # State store should still work
        store2 = get_state_store()
        assert store2 is store  # Singleton preserved
