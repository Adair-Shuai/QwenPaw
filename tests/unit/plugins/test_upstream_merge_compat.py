# -*- coding: utf-8 -*-
"""Release bumps must preserve bundled plugins and explicit version gates."""

import json
from pathlib import Path

import pytest

from qwenpaw._version_compat import check_plugin_version_compat
from qwenpaw.plugins.architecture import PluginManifest

ROOT = Path(__file__).resolve().parents[3]
MANIFESTS = sorted(
    path
    for folder in (
        "plugins/bundle",
        "plugins/apps",
        "plugins/hub",
        "src/qwenpaw/plugins_bundle",
    )
    for path in (ROOT / folder).glob("*/plugin.json")
)


@pytest.mark.parametrize(
    "path", MANIFESTS, ids=lambda p: str(p.relative_to(ROOT))
)
def test_shipped_plugin_accepts_current_core(path):
    manifest = PluginManifest.from_dict(
        json.loads(path.read_text(encoding="utf-8"))
    )
    compatible, reason = check_plugin_version_compat(manifest)
    assert compatible, reason


def test_unspecified_range_does_not_invent_a_legacy_upper_bound():
    manifest = PluginManifest.from_dict({"id": "sdk-probe", "version": "1.0"})
    assert check_plugin_version_compat(manifest) == (True, "")


@pytest.mark.parametrize("host", ["2.2.2", "2.4.0", "2.4.0b1"])
def test_explicit_range_still_rejects_incompatible_core(monkeypatch, host):
    monkeypatch.setattr("qwenpaw.__version__.__version__", host)
    manifest = PluginManifest.from_dict(
        {
            "id": "bounded-probe",
            "version": "1.0",
            "qwenpaw_version": {"min": "2.3.0", "max": "2.4.0"},
        }
    )
    assert check_plugin_version_compat(manifest)[0] is False


def test_explicit_legacy_minimum_keeps_derived_upper_bound():
    manifest = PluginManifest.from_dict(
        {
            "id": "legacy-probe",
            "version": "1.0",
            "min_version": "0.1.0",
        }
    )
    assert check_plugin_version_compat(manifest)[0] is False


@pytest.mark.asyncio
async def test_native_uninstall_preserves_intent_and_reinstall_clears_it(
    tmp_path, monkeypatch
):
    from types import SimpleNamespace

    from qwenpaw.app.routers.plugins import uninstall_plugin_source
    from qwenpaw.components import service
    from qwenpaw.plugins.bundled import is_plugin_uninstalled
    from qwenpaw.plugins.testing import PluginTestHost

    from .sdk_author_fixture import make_plugin

    source = make_plugin(
        tmp_path,
        "class Plugin:\n    def register(self, ctx): pass\nplugin = Plugin()\n",
        [],
    )
    adoption = {"extension-contract": True}
    monkeypatch.setattr(
        service,
        "is_component_update_adopted",
        lambda name: adoption.get(name, False),
    )
    monkeypatch.setattr(
        service,
        "set_component_update_adoption",
        lambda name, value: adoption.update({name: value}),
    )
    async with PluginTestHost(tmp_path / "host") as host:
        await host.install(source)
        loader = host._loader
        root = loader.plugin_dirs[0]
        app = SimpleNamespace(state=SimpleNamespace(plugin_loader=loader))
        await uninstall_plugin_source("extension-contract", app=app)
        assert is_plugin_uninstalled("extension-contract", plugins_dir=root)
        assert not adoption["extension-contract"]
        assert loader.get_loaded_plugin("extension-contract") is None
        assert not (root / "extension-contract").exists()
        assert (await host.install(source)).ok
        assert not is_plugin_uninstalled(
            "extension-contract", plugins_dir=root
        )
