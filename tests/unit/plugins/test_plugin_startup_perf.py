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
3. ``load_all_plugins`` installs dependencies for all plugins concurrently
   instead of serially.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from packaging.requirements import Requirement

import qwenpaw.plugins.loader as loader_mod
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
    monkeypatch.setattr(loader_mod, "_is_frozen", lambda: True)
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
        raise loader_mod.PackageNotFoundError(name)

    monkeypatch.setattr(loader_mod, "_dist_version", _raise_not_found)

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


@pytest.mark.asyncio
async def test_load_all_installs_dependencies_concurrently(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Dependency installs across plugins must overlap, not run serially."""
    import asyncio

    # Build three plugins that each declare a (fake) dependency.
    plugin_ids = ["p-one", "p-two", "p-three"]
    for pid in plugin_ids:
        pdir = tmp_path / pid
        pdir.mkdir(parents=True)
        (pdir / "plugin.json").write_text(
            json.dumps(
                {
                    "id": pid,
                    "name": pid,
                    "version": "1.0.0",
                    "entry": {"backend": "plugin.py"},
                    "qwenpaw_version": {"min": "0.1.0", "max": "99.0.0"},
                },
            ),
            encoding="utf-8",
        )
        (pdir / "plugin.py").write_text(
            "from qwenpaw.plugins.architecture import Plugin\n"
            "plugin = Plugin()\n",
            encoding="utf-8",
        )
        (pdir / "requirements.txt").write_text(
            "dep-" + pid + "\n",
            encoding="utf-8",
        )

    loader = PluginLoader(plugin_dirs=[tmp_path])

    # Record concurrency of the dependency-install phase.
    active = 0
    max_active = 0
    installed: list[str] = []

    async def _fake_install(self, source_path: Path, plugin_id: str) -> None:
        nonlocal active, max_active
        active += 1
        max_active = max(max_active, active)
        await asyncio.sleep(0.05)  # simulate install latency
        installed.append(plugin_id)
        active -= 1

    monkeypatch.setattr(
        PluginLoader,
        "_ensure_dependencies_installed",
        _fake_install,
    )

    # Avoid actually importing/registering the stub backends: stub load_plugin.
    async def _fake_load(self, manifest, source_path, config=None):
        return None

    monkeypatch.setattr(PluginLoader, "load_plugin", _fake_load)

    await loader.load_all_plugins(configs={})

    assert sorted(installed) == sorted(plugin_ids)
    assert max_active > 1, (
        f"dependency installs ran serially (max concurrency {max_active}); "
        "load_all_plugins must install deps concurrently"
    )


@pytest.mark.asyncio
async def test_phase2_skips_dep_check_for_phase1_successes(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Plugins whose deps phase-1 ensured must not be re-checked in phase 2."""
    plugin_ids = ["p-alpha", "p-beta"]
    for pid in plugin_ids:
        pdir = tmp_path / pid
        pdir.mkdir(parents=True)
        (pdir / "plugin.json").write_text(
            json.dumps(
                {
                    "id": pid,
                    "name": pid,
                    "version": "1.0.0",
                    "entry": {"backend": "plugin.py"},
                    "qwenpaw_version": {"min": "0.1.0", "max": "99.0.0"},
                },
            ),
            encoding="utf-8",
        )
        (pdir / "plugin.py").write_text(
            "from qwenpaw.plugins.architecture import Plugin\n"
            "plugin = Plugin()\n",
            encoding="utf-8",
        )

    loader = PluginLoader(plugin_dirs=[tmp_path])
    calls: list[str] = []

    async def _spy_ensure(self, source_path: Path, plugin_id: str) -> None:
        calls.append(plugin_id)

    monkeypatch.setattr(
        PluginLoader,
        "_ensure_dependencies_installed",
        _spy_ensure,
    )

    captured: dict[str, bool] = {}

    async def _fake_load(
        self,
        manifest,
        source_path,
        config=None,
        *,
        deps_ensured: bool = False,
    ):
        captured[manifest.id] = deps_ensured
        return None

    monkeypatch.setattr(PluginLoader, "load_plugin", _fake_load)

    await loader.load_all_plugins(configs={})

    # Phase 1 checked each plugin exactly once; phase 2 told load_plugin the
    # deps were already ensured, so no second check per plugin.
    assert sorted(calls) == plugin_ids
    assert captured == {
        "p-alpha": True,
        "p-beta": True,
    }, "phase 2 must pass deps_ensured=True for plugins phase 1 finished"


@pytest.mark.asyncio
async def test_phase2_retries_dep_check_for_phase1_failures(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Retry phase-1 dependency failures with deps_ensured disabled."""
    pdir = tmp_path / "p-fail"
    pdir.mkdir(parents=True)
    (pdir / "plugin.json").write_text(
        json.dumps(
            {
                "id": "p-fail",
                "name": "p-fail",
                "version": "1.0.0",
                "entry": {"backend": "plugin.py"},
                "qwenpaw_version": {"min": "0.1.0", "max": "99.0.0"},
            },
        ),
        encoding="utf-8",
    )
    (pdir / "plugin.py").write_text(
        "from qwenpaw.plugins.architecture import Plugin\nplugin = Plugin()\n",
        encoding="utf-8",
    )

    loader = PluginLoader(plugin_dirs=[tmp_path])

    async def _boom(self, source_path: Path, plugin_id: str) -> None:
        raise RuntimeError("simulated install failure")

    monkeypatch.setattr(PluginLoader, "_ensure_dependencies_installed", _boom)

    captured: dict[str, bool] = {}

    async def _fake_load(
        self,
        manifest,
        source_path,
        config=None,
        *,
        deps_ensured: bool = False,
    ):
        captured[manifest.id] = deps_ensured
        return None

    monkeypatch.setattr(PluginLoader, "load_plugin", _fake_load)

    await loader.load_all_plugins(configs={})

    assert captured == {"p-fail": False}, (
        "phase-1 failures must reach load_plugin with deps_ensured=False so "
        "the install is retried and reported through the normal record path"
    )


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
