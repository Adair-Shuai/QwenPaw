# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
"""One-shot: append phase-2 dep-check guards to test_plugin_startup_perf.py."""
from pathlib import Path

p = Path("tests/unit/plugins/test_plugin_startup_perf.py")
text = p.read_text(encoding="utf-8")
assert "test_phase2_skips_dep_check" not in text

guard = '''

@pytest.mark.asyncio
async def test_phase2_skips_dep_check_for_phase1_successes(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
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
                }
            ),
            encoding="utf-8",
        )
        (pdir / "plugin.py").write_text(
            "from qwenpaw.plugins.architecture import Plugin\\n"
            "plugin = Plugin()\\n",
            encoding="utf-8",
        )

    loader = PluginLoader(plugin_dirs=[tmp_path])
    calls: list[str] = []

    async def _spy_ensure(self, source_path: Path, plugin_id: str) -> None:
        calls.append(plugin_id)

    monkeypatch.setattr(
        PluginLoader, "_ensure_dependencies_installed", _spy_ensure
    )

    captured: dict[str, bool] = {}

    async def _fake_load(
        self, manifest, source_path, config=None, *, deps_ensured: bool = False
    ):
        captured[manifest.id] = deps_ensured
        return None

    monkeypatch.setattr(PluginLoader, "load_plugin", _fake_load)

    await loader.load_all_plugins(configs={})

    # Phase 1 checked each plugin exactly once; phase 2 told load_plugin the
    # deps were already ensured, so no second check per plugin.
    assert sorted(calls) == plugin_ids
    assert captured == {"p-alpha": True, "p-beta": True}, (
        "phase 2 must pass deps_ensured=True for plugins phase 1 finished"
    )


@pytest.mark.asyncio
async def test_phase2_retries_dep_check_for_phase1_failures(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A plugin whose phase-1 install failed must be retried (deps_ensured=False)."""
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
            }
        ),
        encoding="utf-8",
    )
    (pdir / "plugin.py").write_text(
        "from qwenpaw.plugins.architecture import Plugin\\nplugin = Plugin()\\n",
        encoding="utf-8",
    )

    loader = PluginLoader(plugin_dirs=[tmp_path])

    async def _boom(self, source_path: Path, plugin_id: str) -> None:
        raise RuntimeError("simulated install failure")

    monkeypatch.setattr(PluginLoader, "_ensure_dependencies_installed", _boom)

    captured: dict[str, bool] = {}

    async def _fake_load(
        self, manifest, source_path, config=None, *, deps_ensured: bool = False
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

    assert isinstance(loader_mod._SATISFIED_LOCK, type(_threading.Lock())), (
        "_SATISFIED_LOCK must be a threading.Lock"
    )
    source = _inspect.getsource(loader_mod.PluginLoader._find_unsatisfied_dependencies)
    assert source.count("with _SATISFIED_LOCK") >= 2, (
        "cache check and cache add in _find_unsatisfied_dependencies must "
        "both hold _SATISFIED_LOCK"
    )
    install_source = _inspect.getsource(loader_mod.PluginLoader._install_requirements)
    assert "_SATISFIED_LOCK" in install_source, (
        "post-install cache invalidation must hold _SATISFIED_LOCK"
    )


def test_installs_serialised_through_shared_target_lock() -> None:
    """Guard: pip runs must hold the shared-target lock, inside per-plugin lock."""
    import inspect as _inspect

    source = _inspect.getsource(loader_mod.PluginLoader._install_requirements_locked)
    plugin_pos = source.find("_install_lock_path(plugin_id)")
    shared_pos = source.find("_shared_install_lock_path()")
    assert plugin_pos != -1, "per-plugin install lock missing"
    assert shared_pos != -1, (
        "shared-target install lock missing: concurrent pip installs into "
        "the same target dir are not safe"
    )
    assert plugin_pos < shared_pos, (
        "lock order must be per-plugin -> shared-target (fixed order, no cycle)"
    )
    assert "_shared_install_lock_path" in _inspect.getsource(
        loader_mod
    ), "_shared_install_lock_path helper must exist"
'''

p.write_text(text.rstrip("\n") + "\n" + guard, encoding="utf-8", newline="\n")
print(
    "appended:",
    "test_phase2_skips_dep_check" in p.read_text(encoding="utf-8"),
)
