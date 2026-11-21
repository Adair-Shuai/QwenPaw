"""Read, install and diagnostics must agree on each plugin's consumer."""

import importlib
import os
from pathlib import Path
import sys
import subprocess
from types import ModuleType, SimpleNamespace

import pytest

from qwenpaw.app.routers.plugins import get_dependency_diagnostics
from qwenpaw.plugins.dependency_gate import DependencyGate
from qwenpaw.plugins.execution.dependencies import read_dependency_inventory
from qwenpaw.plugins.execution.errors import ProtocolValidationError
from qwenpaw.plugins.python_backend import PythonBackend


@pytest.mark.asyncio
async def test_app_registration_and_http_listing_preserve_per_app_constraints(
    tmp_path,
    monkeypatch,
    fresh_registry,
):
    import httpx
    from fastapi import FastAPI
    from qwenpaw import config as config_module
    from qwenpaw.config import Config
    from qwenpaw.app.routers import pawapps, plugins
    from qwenpaw.plugins import python_backend
    from qwenpaw.plugins.lifecycle import UnloadMode
    from qwenpaw.plugins.loader import PluginLoader
    from .test_pawapp_listing import _write_app

    sites = [make_provider(tmp_path / str(v), v) for v in (1, 2)]
    monkeypatch.setitem(sys.modules, "demo_module", None)
    del sys.modules["demo_module"]
    monkeypatch.syspath_prepend(str(sites[0]))
    assert importlib.import_module("demo_module").VERSION == 1
    monkeypatch.syspath_prepend(str(sites[1]))
    monkeypatch.setattr(
        python_backend,
        "_host_paths",
        lambda cwd: tuple(map(str, reversed(sites))),
    )
    apps = tmp_path / "apps"
    apps.mkdir()
    monkeypatch.setattr(config_module, "load_config", lambda: Config())
    monkeypatch.setattr(pawapps, "_get_apps_dir", lambda: apps)
    loader = PluginLoader([apps])
    loader.registry = fresh_registry
    app = FastAPI()
    app.state.plugin_loader = loader
    app.state.plugin_registry = fresh_registry
    app.include_router(pawapps.router, prefix="/api")
    app.include_router(plugins.router, prefix="/api")
    try:
        for name, bound in (("first-app", 1), ("second-app", 2)):
            manifest, path = _write_app(apps, name)
            (path / "requirements.txt").write_text(f"demo-provider>={bound}\n")
            (path / "main.py").write_text(
                "class Plugin:\n    def register(self, api):\n"
                "        import demo_module\n        assert demo_module.VERSION == 1\n"
                "plugin = Plugin()\n"
            )
            record = await loader.load_plugin(manifest, path, {})
            assert record.status == "active", record.diagnostics
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            items = (await client.get("/api/pawapps")).json()["apps"]
            rows = {item["id"]: item for item in items}
            assert all(
                rows[name]["loaded"] for name in ("first-app", "second-app")
            )
            assert not any(
                "AMBIGUOUS" in m for m in rows["first-app"]["diagnostics"]
            )
            assert any(
                "AMBIGUOUS" in m for m in rows["second-app"]["diagnostics"]
            )
            response = await client.get(
                "/api/plugins/second-app/dependency-diagnostics"
            )
            assert response.status_code == 200
            package = response.json()["packages"]["demo-provider"]
            assert package["action"] == "review_versions"
            assert Path(package["observed_metadata_path"]).parent == sites[0]
    finally:
        await loader.lifecycle.unload_all(UnloadMode.SHUTDOWN)


@pytest.mark.asyncio
async def test_frozen_installer_metadata_cannot_certify_a_host_module(
    tmp_path, monkeypatch
):
    from qwenpaw.plugins import loader as loader_module, python_backend
    from qwenpaw.plugins.dependency_gate import SharedDependencyError
    from qwenpaw.plugins.loader import PluginLoader

    source = tmp_path / "app"
    source.mkdir()
    requirements = source / "requirements.txt"
    requirements.write_text("consumer-only-module>=4\n")
    host = tmp_path / "host"
    host.mkdir()
    (host / "consumer_only_module.py").write_text("VERSION = 1\n")
    installer = tmp_path / "installer"
    info = installer / "consumer_only_module-9.dist-info"
    info.mkdir(parents=True)
    (info / "METADATA").write_text("Name: consumer-only-module\nVersion: 9\n")
    loader = PluginLoader([source.parent])
    monkeypatch.setattr(loader_module, "_is_frozen", lambda: True)
    monkeypatch.setattr(loader_module, "_plugin_site_dir", lambda: host)
    monkeypatch.setattr(
        loader,
        "_dependency_environment",
        lambda: SimpleNamespace(dependency_paths=(installer,)),
    )
    monkeypatch.syspath_prepend(str(host))
    monkeypatch.setattr(python_backend, "_host_paths", lambda _: (str(host),))
    with pytest.raises(SharedDependencyError) as refused:
        await loader._ensure_requirements_installed(
            requirements, source, "consumer", allow_install=True
        )
    assert refused.value.reason_code == "DEPENDENCY_ENVIRONMENT_PROTECTED"
    assert not list(host.glob("*.dist-info"))


def make_provider(site, version, dependency=""):
    info = site / f"demo_provider-{version}.dist-info"
    info.mkdir(parents=True)
    (info / "METADATA").write_text(
        f"Name: demo-provider\nVersion: {version}\n{dependency}",
    )
    (info / "RECORD").write_text(
        "demo_module/__init__.py,,\ndemo_module/sub.py,,\n"
    )
    module = site / "demo_module"
    module.mkdir()
    (module / "__init__.py").write_text(f"VERSION = {version}\n")
    (module / "sub.py").write_text("")
    return site


@pytest.mark.asyncio
@pytest.mark.parametrize("loaded", [True, False])
async def test_duplicate_providers_follow_the_consumer_across_plugins(
    tmp_path,
    monkeypatch,
    loaded,
):
    sites = [make_provider(tmp_path / f"site-{v}", v) for v in (1, 2)]
    monkeypatch.syspath_prepend(str(sites[0]))
    monkeypatch.setitem(sys.modules, "demo_module", None)
    del sys.modules["demo_module"]
    if loaded:
        assert importlib.import_module("demo_module").VERSION == 1
    monkeypatch.syspath_prepend(str(sites[1]))
    backend = PythonBackend(SimpleNamespace())
    records = {}
    loader = SimpleNamespace(get_loaded_plugin=records.get)
    request = SimpleNamespace(
        app=SimpleNamespace(state=SimpleNamespace(plugin_loader=loader))
    )
    for plugin, requirement in (
        ("app-a", "demo-provider>=2"),
        ("app-b", "demo-provider>=1"),
    ):
        source = tmp_path / plugin
        source.mkdir()
        requirements = source / "requirements.txt"
        requirements.write_text(requirement)
        description = SimpleNamespace(
            source_path=source, requirements=(requirement,)
        )
        records[plugin] = SimpleNamespace(
            backend_binding=SimpleNamespace(
                backend=backend, description=description
            ),
        )
        decision = DependencyGate().evaluate(
            requirements, allow_install=True, plugin_id=plugin
        )
        assert decision.already_satisfied == (plugin == "app-b")
        assert not decision.allow_install
        if plugin == "app-a":
            assert decision.reason_code == "DEPENDENCY_ENVIRONMENT_AMBIGUOUS"
        view, _ = read_dependency_inventory(
            source, reversed(sites), (requirement,)
        )
        assert view.distributions["demo-provider"]["version"] == (
            "1" if loaded else None
        )
        assert any("AMBIGUOUS" in w for w in view.warnings) == (
            not loaded or plugin == "app-a"
        )
        package = (await get_dependency_diagnostics(plugin, request))[
            "packages"
        ]["demo-provider"]
        assert {p["version"] for p in package["candidates"]} == {"1", "2"}
        assert package["requirements"] == [requirement]
        if loaded:
            assert Path(package["observed_metadata_path"]).parent == sites[0]
            assert (
                Path(package["loaded_modules"]["demo_module"]).parents[1]
                == sites[0]
            )
        else:
            assert package["observed_metadata_path"] is None
            assert "demo_module" not in sys.modules
        assert package["action"] == (
            "review_versions"
            if plugin == "app-a"
            else "reuse" if loaded else "compatible_candidates"
        )


def test_duplicate_provider_requires_consistent_metadata_and_ownership(
    tmp_path, monkeypatch
):
    source = tmp_path / "plugin"
    source.mkdir()
    sites = [
        make_provider(tmp_path / "one", 1),
        make_provider(tmp_path / "two", 2, "Requires-Dist: shadow-only\n"),
    ]
    for name, file in (
        ("demo_module", sites[0] / "demo_module" / "__init__.py"),
        ("demo_module.sub", sites[1] / "demo_module" / "sub.py"),
    ):
        module = ModuleType(name)
        module.__file__ = str(file)
        monkeypatch.setitem(sys.modules, name, module)
    view, _ = read_dependency_inventory(source, sites, ("demo-provider",))
    choice = view.duplicates["demo-provider"]
    assert choice.observed is None
    assert set(choice.modules) == {"demo_module", "demo_module.sub"}
    assert not choice.same_requirements
    assert choice.unresolved_source
    assert any("declarations differ" in w for w in view.warnings)
    broken = tmp_path / "malformed" / "demo_provider-3.dist-info"
    broken.mkdir(parents=True)
    (broken / "METADATA").write_text(
        "Name: demo-provider\nVersion: 3\nVersion: 4\n"
    )
    for paths in ([broken.parent, *sites], [*sites, broken.parent]):
        with pytest.raises(ProtocolValidationError) as exc:
            read_dependency_inventory(source, paths, ("demo-provider",))
        assert exc.value.reason_code == "DEPENDENCY_METADATA_INVALID"


def test_only_matching_recorded_payloads_quiet_unloaded_duplicates(
    tmp_path, monkeypatch
):
    import base64
    import hashlib

    source = tmp_path / "app"
    source.mkdir()
    sites = [make_provider(tmp_path / name, 1) for name in ("one", "two")]
    monkeypatch.delitem(sys.modules, "demo_module", raising=False)
    for site in sites:
        info = next(site.glob("*.dist-info"))
        paths = [info / "METADATA", *(site / "demo_module").glob("*.py")]
        lines = []
        for path in paths:
            data = path.read_bytes()
            digest = (
                base64.urlsafe_b64encode(hashlib.sha256(data).digest())
                .rstrip(b"=")
                .decode()
            )
            lines.append(
                f"{path.relative_to(site).as_posix()},sha256={digest},{len(data)}"
            )
        lines.append(f"{info.name}/RECORD,,")
        (info / "RECORD").write_text("\n".join(lines) + "\n")

    def read():
        return read_dependency_inventory(source, sites, ("demo-provider>=1",))[
            0
        ]

    view = read()
    assert not view.warnings
    assert view.duplicates["demo-provider"].observed is None
    # Equal version and RECORD claims do not hide an on-disk difference.
    (sites[1] / "demo_module" / "__init__.py").write_text("VERSION = 9\n")
    changed = read()
    assert any("AMBIGUOUS" in w for w in changed.warnings)
    assert changed.payload_checks["demo-provider"] == "different"
    for site in sites:
        monkeypatch.syspath_prepend(str(site))
    requirements = source / "requirements.txt"
    requirements.write_text("demo-provider>=1\n")
    decision = DependencyGate().evaluate(
        requirements, allow_install=True, plugin_id="same-version"
    )
    assert not decision.allow_install and not decision.already_satisfied
    assert "Recorded package files differ" in decision.reason
    assert "demo_module" not in sys.modules


def test_worker_reports_its_own_version_and_ambiguous_writes_remain_guarded(
    tmp_path, monkeypatch
):
    from qwenpaw.plugins.execution.dependencies import (
        DependencyReadEvidence,
        observe_dependencies,
    )

    source = tmp_path / "plugin"
    source.mkdir()
    sites = [make_provider(tmp_path / str(v), v) for v in (1, 2)]
    monkeypatch.setitem(sys.modules, "demo_module", None)
    del sys.modules["demo_module"]
    packet = {
        "mode": "probe",
        "code_root": source,
        "_audit_sites": sites,
        "_requirements": ("demo-provider>=1",),
    }
    evidence = observe_dependencies(packet)
    assert DependencyReadEvidence.from_mapping(
        evidence.to_mapping()
    ).versions == {"demo-provider": None}
    monkeypatch.syspath_prepend(str(sites[1]))
    assert importlib.import_module("demo_module").VERSION == 2
    evidence = observe_dependencies(packet)
    assert evidence.versions == {"demo-provider": "2"}
    assert any("AMBIGUOUS" in message for message in evidence.warnings)
    monkeypatch.syspath_prepend(str(sites[0]))
    requirements = source / "requirements.txt"
    requirements.write_text("demo-provider>=1\nmissing-peer-package>=1\n")
    decision = DependencyGate().evaluate(
        requirements, allow_install=True, plugin_id="other"
    )
    assert decision.reason_code == "DEPENDENCY_ENVIRONMENT_AMBIGUOUS"
    assert not decision.allow_install
    assert "Loaded provider: 2" in decision.reason


@pytest.mark.asyncio
async def test_channel_reprobes_duplicate_sources_and_rejects_stale_worker_metadata(
    tmp_path, monkeypatch
):
    from dataclasses import replace
    from qwenpaw.plugins.channel_adapter import ChannelBackend
    from qwenpaw.plugins.execution.dependencies import observe_dependencies
    from qwenpaw.plugins.execution_backend import PreparedDependencyTargets

    sites = [make_provider(tmp_path / str(v), v) for v in (1, 2)]
    source = tmp_path / "channel"
    source.mkdir()
    requirements = ("demo-provider>=1",)
    description = SimpleNamespace(
        source_path=source,
        manifest=SimpleNamespace(id="channel"),
        source_identity="fixture",
        requirements=requirements,
    )
    monkeypatch.setitem(sys.modules, "demo_module", None)
    del sys.modules["demo_module"]
    monkeypatch.syspath_prepend(str(sites[0]))
    assert importlib.import_module("demo_module").VERSION == 1
    parent = observe_dependencies(
        {
            "mode": "probe",
            "code_root": source,
            "_audit_sites": sites,
            "_requirements": requirements,
        }
    )
    assert parent.versions["demo-provider"] == "1"
    worker = replace(parent, versions={"demo-provider": "2"})
    backend = ChannelBackend(SimpleNamespace())

    async def targets(_description):
        return PreparedDependencyTargets(tuple(sites), lambda: None)

    monkeypatch.setattr(backend, "prepare_dependency_targets", targets)
    monkeypatch.setattr(
        backend,
        "runtime_for",
        lambda _: SimpleNamespace(python_executable="worker"),
    )
    calls = []

    async def probe():
        calls.append(True)
        return worker

    async with backend.preparation_scope("channel"):
        assert await backend._probe_once(description, probe) is worker
        assert await backend._probe_once(description, probe) is worker
        assert len(calls) == 2
        (sites[1] / "demo_provider-2.dist-info" / "METADATA").write_text(
            "Name: demo-provider\nVersion: 3\n"
        )
        with pytest.raises(
            RuntimeError, match="DEPENDENCY_ENVIRONMENT_IDENTITY_CHANGED"
        ):
            await backend._probe_once(description, probe)


def test_desktop_keeps_task_packages_available_only_to_task_children(
    tmp_path, monkeypatch
):
    from qwenpaw.tauri import execution_runtime as runtime

    host = make_provider(tmp_path / "host", 1)
    task = make_provider(tmp_path / "task", 2)
    monkeypatch.setenv("LOCALAPPDATA", str(tmp_path))
    old = tmp_path / "UGSci/execution/py3.9-windows-amd64/site"
    old.mkdir(parents=True)
    monkeypatch.setenv("QWENPAW_EXECUTION_SITE_DIR", str(task))
    monkeypatch.setenv("QWENPAW_EXECUTION_PYTHON_MODE", "builtin")
    monkeypatch.setenv("PIP_TARGET", str(task))
    monkeypatch.setenv(
        "PYTHONPATH", os.pathsep.join(map(str, (old, task, host)))
    )
    monkeypatch.setattr(
        sys, "path", [str(old), str(task), str(host), *sys.path]
    )
    monkeypatch.setattr(runtime, "_detached_task_site", None)
    monkeypatch.setattr(runtime, "_detached_pip_target", None)
    monkeypatch.setattr(runtime, "_detached_import_files", frozenset())
    monkeypatch.setitem(sys.modules, "demo_module", None)
    del sys.modules["demo_module"]
    assert importlib.import_module("demo_module").VERSION == 2
    runtime.isolate_desktop_task_site()
    runtime.isolate_desktop_task_site()
    assert str(old) not in sys.path and str(task) not in sys.path
    assert os.environ["PYTHONPATH"] == str(host)
    assert "PIP_TARGET" not in os.environ
    # A module already resident at bootstrap still belongs to the old site.
    source = tmp_path / "app"
    source.mkdir()
    view, _ = read_dependency_inventory(source, (host,), ("demo-provider<2",))
    assert view.distributions["demo-provider"]["version"] is None
    choice = view.duplicates["demo-provider"]
    assert Path(choice.modules["demo_module"]).parents[1] == task
    goal = source / "requirements.txt"
    goal.write_text("demo-provider<2\n")
    assert (
        DependencyGate()
        .evaluate(goal, allow_install=True, plugin_id="app")
        .reason_code
        == "DEPENDENCY_ENVIRONMENT_AMBIGUOUS"
    )
    read = [
        sys.executable,
        "-S",
        "-c",
        "import demo_module;print(demo_module.VERSION)",
    ]
    env = {**os.environ, **runtime.task_site_overrides(os.environ)}
    assert subprocess.check_output(read, cwd=tmp_path).strip() == b"1"
    assert subprocess.check_output(read, env=env, cwd=tmp_path).strip() == b"2"
    assert env["PIP_TARGET"] == str(task)
    assert str(old) not in env["PYTHONPATH"].split(os.pathsep)
    assert (task / "demo_module" / "__init__.py").is_file()
    # A configured shared plugin root remains available to the host.
    monkeypatch.setenv("QWENPAW_PLUGIN_SITE", str(host))
    monkeypatch.setenv("QWENPAW_EXECUTION_SITE_DIR", str(host))
    runtime.isolate_desktop_task_site()
    assert str(host) in sys.path and os.environ["PYTHONPATH"] == str(host)
