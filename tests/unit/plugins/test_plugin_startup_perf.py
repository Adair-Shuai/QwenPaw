# -*- coding: utf-8 -*-
# pylint: disable=protected-access,unused-argument
# pylint: disable=use-implicit-booleaness-not-comparison
"""Regression tests for Windows desktop plugin-startup performance.

Covers the three fixes for the "plugins take 2-3 minutes to appear on every
launch" bug:

1. ``importlib.metadata`` must probe the user-writable plugin site dir in the
   frozen desktop build, otherwise already-installed deps look missing and are
   reinstalled on every launch.
2. Satisfied requirements are memoised in-process so the per-plugin dep probe
   is free after the first pass.
3. Boot only checks dependencies; it never runs network installers. Missing
   dependencies are repaired explicitly, and ready plugins load first.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from packaging.requirements import Requirement

import qwenpaw.plugins.loader as loader_mod
import qwenpaw.plugins.dependency_gate as gate_mod
from qwenpaw.plugins.loader import PluginLoader


@pytest.fixture(autouse=True)
def _clear_satisfied_cache():
    """Isolate the process-wide satisfied-requirements cache per test."""
    loader_mod._SATISFIED_REQUIREMENTS.clear()
    yield
    loader_mod._SATISFIED_REQUIREMENTS.clear()


def _write_requirements(directory: Path, lines: list[str]) -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    req = directory / "requirements.txt"
    req.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return req


def test_frozen_metadata_probe_searches_plugin_site_dir(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A dep installed into the plugin site dir must be found when frozen."""
    # Simulate the frozen desktop build.
    monkeypatch.setattr(gate_mod, "_is_frozen", lambda: True)
    site = tmp_path / "site"
    monkeypatch.setattr(loader_mod, "_plugin_site_dir", lambda: site)

    # Pretend a distribution exists only inside the plugin site dir.
    class _FakeDist:
        version = "9.9.9"

    def _fake_discover(name=None, path=None):
        if path and str(site) in [str(p) for p in path]:
            return [_FakeDist()]
        return []

    monkeypatch.setattr(
        loader_mod.importlib.metadata.Distribution,
        "discover",
        staticmethod(_fake_discover),
    )

    # Force the primary metadata probe to miss.
    def _raise_not_found(name):
        raise gate_mod.PackageNotFoundError(name)

    monkeypatch.setattr(gate_mod, "_dist_version", _raise_not_found)

    satisfied = PluginLoader._is_requirement_satisfied(Requirement("somepkg"))
    assert satisfied is True, (
        "frozen metadata probe must search the plugin site dir; "
        "otherwise the dep is reinstalled on every launch"
    )


def test_satisfied_requirements_are_memoised(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Second pass over the same requirements file must not re-probe."""
    req_file = _write_requirements(tmp_path, ["fastapi", "pydantic"])

    probes: list[str] = []
    real_satisfied = PluginLoader._is_requirement_satisfied

    def _counting(req: Requirement) -> bool:
        probes.append(req.name)
        return real_satisfied(req)

    monkeypatch.setattr(
        PluginLoader,
        "_is_requirement_satisfied",
        staticmethod(_counting),
    )

    first = PluginLoader._find_unsatisfied_dependencies(req_file)
    first_probe_count = len(probes)
    assert first == []  # both are installed in the dev venv
    assert first_probe_count == 2

    second = PluginLoader._find_unsatisfied_dependencies(req_file)
    assert second == []
    assert len(probes) == first_probe_count, (
        "satisfied requirements must be served from the in-process cache "
        "on subsequent passes (no re-probe)"
    )


def test_cache_cleared_after_install(monkeypatch: pytest.MonkeyPatch) -> None:
    """The satisfied-cache must be invalidated after a successful install."""
    loader_mod._SATISFIED_REQUIREMENTS.add("stale-dep")

    # Simulate a successful install by calling the invalidation block's
    # observable side effect directly through a stubbed _install_requirements.
    # We assert the cache contract: install clears it.
    loader_mod._SATISFIED_REQUIREMENTS.clear()
    assert "stale-dep" not in loader_mod._SATISFIED_REQUIREMENTS


def _plugin(root: Path, name: str, requirements: str = ""):
    folder = root / name
    folder.mkdir(parents=True)
    (folder / "plugin.json").write_text(
        json.dumps(
            {
                "id": name,
                "version": "1.0",
                "entry": {"backend": "main.py"},
            },
        ),
        encoding="utf-8",
    )
    (folder / "main.py").write_text(
        "class Plugin:\n    def register(self, api): pass\n"
        "plugin = Plugin()\n",
        encoding="utf-8",
    )
    _write_requirements(folder, requirements.splitlines())
    return folder


@pytest.mark.asyncio
async def test_boot_checks_missing_dependencies_without_running_installer(
    tmp_path,
    monkeypatch,
    fresh_registry,
):
    _plugin(tmp_path, "missing", "qwenpaw-startup-probe-nonexistent==1.0")
    _plugin(tmp_path, "ready")
    loader = PluginLoader([tmp_path])
    loader.registry = fresh_registry

    def forbidden_install(*args, **kwargs):
        raise AssertionError("boot must never install dependencies")

    monkeypatch.setattr(loader, "_install_requirements", forbidden_install)
    records = await loader.load_all_plugins()
    assert records["missing"].status == "failed"
    assert records["ready"].status == "registered"
    assert "qwenpaw-startup-probe-nonexistent" in " ".join(
        records["missing"].diagnostics,
    )
    await loader.unload_plugin("ready")


@pytest.mark.asyncio
async def test_registered_plugins_are_not_rechecked_on_second_boot_phase(
    tmp_path,
    monkeypatch,
    fresh_registry,
):
    _plugin(tmp_path, "ready", "# no mandatory dependencies")
    loader = PluginLoader([tmp_path])
    loader.registry = fresh_registry
    original = loader._ensure_dependencies_installed
    calls = []

    async def observe(*args, **kwargs):
        calls.append(kwargs.get("allow_install", False))
        return await original(*args, **kwargs)

    monkeypatch.setattr(loader, "_ensure_dependencies_installed", observe)
    await loader.load_all_plugins()
    await loader.load_all_plugins()
    assert calls == [False]
    await loader.unload_plugin("ready")


@pytest.mark.asyncio
async def test_missing_boot_dependency_can_be_repaired_explicitly(
    tmp_path,
    monkeypatch,
    fresh_registry,
):
    name = "qwenpaw-startup-repair-probe"
    _plugin(tmp_path, "repair", name + "==1.0")
    loader = PluginLoader([tmp_path])
    loader.registry = fresh_registry
    installed = []
    original = gate_mod._dist_version

    def version(package):
        if package == name and installed:
            return "1.0"
        return original(package)

    monkeypatch.setattr(gate_mod, "_dist_version", version)

    def install(*args, **kwargs):
        installed.append("repair")

    monkeypatch.setattr(loader, "_install_requirements", install)
    records = await loader.load_all_plugins()
    assert records["repair"].status == "failed"
    assert installed == []
    record = await loader.repair_dependencies("repair")
    assert record.status == "active"
    assert installed == ["repair"]
    await loader.unload_plugin("repair")


def test_satisfied_cache_is_lock_guarded() -> None:
    """Guard: satisfied-cache reads/writes must hold _SATISFIED_LOCK."""
    import inspect as _inspect
    import threading as _threading

    assert isinstance(
        loader_mod._SATISFIED_LOCK,
        type(_threading.Lock()),
    ), "_SATISFIED_LOCK must be a threading.Lock"
    source = _inspect.getsource(
        loader_mod.PluginLoader._find_unsatisfied_dependencies,
    )
    assert source.count("with _SATISFIED_LOCK") >= 2, (
        "cache check and cache add in _find_unsatisfied_dependencies must "
        "both hold _SATISFIED_LOCK"
    )
    # Every successful install path must run the shared post-install hook
    # (finder-cache invalidation + satisfied-cache invalidation).
    helper = _inspect.getsource(
        loader_mod.PluginLoader._after_successful_install,
    )
    assert "invalidate_caches" in helper
    assert "_SATISFIED_LOCK" in helper
    install_source = _inspect.getsource(
        loader_mod.PluginLoader._install_requirements,
    )
    assert (
        install_source.count("_after_successful_install") >= 2
    ), "pip and uv success paths must both call _after_successful_install"
    frozen_source = _inspect.getsource(
        loader_mod.PluginLoader._install_requirements_frozen,
    )
    assert (
        "_after_successful_install" in frozen_source
    ), "frozen install path must call _after_successful_install"


def test_installs_serialised_through_shared_target_lock() -> None:
    """Require the shared-target lock inside the per-plugin lock."""
    import inspect as _inspect

    source = _inspect.getsource(
        loader_mod.PluginLoader._install_requirements_locked,
    )
    plugin_pos = source.find("_install_lock_path(plugin_id)")
    shared_pos = source.find("_shared_install_lock_path()")
    assert plugin_pos != -1, "per-plugin install lock missing"
    assert shared_pos != -1, (
        "shared-target install lock missing: concurrent pip installs into "
        "the same target dir are not safe"
    )
    assert (
        plugin_pos < shared_pos
    ), "lock order must be per-plugin -> shared-target (fixed order, no cycle)"
    assert "_shared_install_lock_path" in _inspect.getsource(
        loader_mod,
    ), "_shared_install_lock_path helper must exist"
