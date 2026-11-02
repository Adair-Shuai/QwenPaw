# -*- coding: utf-8 -*-
"""Exercise lock drift and the real isolated installed-layer gate."""

from importlib.util import module_from_spec, spec_from_file_location
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

import packaging
import pytest

REPO = Path(__file__).resolve().parents[3]
VALIDATOR = REPO / "scripts/pack-tauri/validate_desktop_dependencies.py"
BUILDER = REPO / "scripts/pack-tauri/build_python_layers.py"


def _load(path):
    spec = spec_from_file_location(path.stem, path)
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _project(root, requirements, pins, *, extra=None):
    root.mkdir(parents=True, exist_ok=True)
    optional = {"local": [], "qoder": []}
    optional.update(extra or {})
    (root / "pyproject.toml").write_text(
        '[project]\nname="qwenpaw"\ndependencies='
        + json.dumps(requirements)
        + "\n[project.optional-dependencies]\n"
        + "\n".join(
            f"{name}={json.dumps(values)}" for name, values in optional.items()
        ),
        encoding="utf-8",
    )
    (root / "requirements-desktop.in").write_text(
        ".[local,qoder]\n",
        encoding="utf-8",
    )
    (root / "requirements-desktop.lock").write_text(
        "\n".join(pins) + "\n",
        encoding="utf-8",
    )
    return root


def _distribution(root, name, version, *, requirements=(), extras=()):
    info = root / f"{name.replace('-', '_')}-{version}.dist-info"
    info.mkdir(parents=True, exist_ok=True)
    (info / "METADATA").write_text(
        f"Metadata-Version: 2.3\nName: {name}\nVersion: {version}\n"
        + "".join(f"Requires-Dist: {value}\n" for value in requirements)
        + "".join(f"Provides-Extra: {value}\n" for value in extras)
        + "\n",
        encoding="utf-8",
    )
    return info


def _backend(root, requirements):
    _distribution(
        root,
        "qwenpaw",
        "2.3.0b3",
        requirements=requirements,
        extras=("local", "qoder"),
    )
    return root


def test_desktop_lock_satisfies_project_and_selected_extras():
    _load(VALIDATOR).validate_project_lock(REPO)


@pytest.mark.parametrize(
    "name,required,stale",
    [
        ("reme-ai", "0.4.2.0", "0.4.1.11"),
        ("reme-auto-fin", "0.1.3", "0.1.2"),
        ("reme-daily-paper", "0.1.3", "0.1.2"),
    ],
)
def test_desktop_lock_rejects_stale_reme_contract(
    tmp_path,
    name,
    required,
    stale,
):
    repo = _project(tmp_path, [f"{name}=={required}"], [f"{name}=={stale}"])
    with pytest.raises(ValueError, match=name):
        _load(VALIDATOR).validate_project_lock(repo)


def test_desktop_lock_evaluates_both_platform_markers(tmp_path):
    repo = _project(
        tmp_path,
        ['native>=2; sys_platform == "win32"'],
        ['native==2; sys_platform == "darwin"'],
    )
    with pytest.raises(ValueError, match="win32.*native"):
        _load(VALIDATOR).validate_project_lock(repo)
    (repo / "requirements-desktop.lock").write_text(
        'native==2; sys_platform == "win32"\n',
        encoding="utf-8",
    )
    _load(VALIDATOR).validate_project_lock(repo)


def test_desktop_lock_reads_new_selected_extras(tmp_path):
    repo = _project(tmp_path, [], [], extra={"future": ["future-sdk==2"]})
    (repo / "requirements-desktop.in").write_text(
        ".[future]\n",
        encoding="utf-8",
    )
    with pytest.raises(ValueError, match="future-sdk"):
        _load(VALIDATOR).validate_project_lock(repo)
    (repo / "requirements-desktop.in").write_text(
        ".[unknown]\n",
        encoding="utf-8",
    )
    with pytest.raises(ValueError, match="Unknown desktop project extra"):
        _load(VALIDATOR).validate_project_lock(repo)


@pytest.mark.parametrize("entry", ["-e .[local]", "../other[local]", ""])
def test_desktop_lock_rejects_unrecognized_project_inputs(tmp_path, entry):
    repo = _project(tmp_path, [], [])
    (repo / "requirements-desktop.in").write_text(entry, encoding="utf-8")
    with pytest.raises(ValueError, match="desktop|Desktop"):
        _load(VALIDATOR).validate_project_lock(repo)


def test_layer_build_rejects_stale_lock_before_install_or_cleanup(
    tmp_path,
    monkeypatch,
):
    repo = _project(
        tmp_path / "repo",
        ["reme-ai==0.4.2.0"],
        ["reme-ai==0.4.1.11"],
    )
    runtime = tmp_path / "python"
    runtime.touch()
    output = tmp_path / "output"
    output.mkdir()
    sentinel = output / "keep.txt"
    sentinel.write_text("keep", encoding="utf-8")
    builder = _load(BUILDER)

    def unexpected(*_args, **_kwargs):
        pytest.fail(
            "Stale lock must fail before starting pip or deleting output",
        )

    monkeypatch.setattr(builder, "_run", unexpected)
    monkeypatch.setattr(builder, "_safe_empty", unexpected)
    with pytest.raises(ValueError, match="reme-ai"):
        builder.build_layers(repo, runtime, runtime, output, "2.3.0b3")
    assert sentinel.read_text(encoding="utf-8") == "keep"


def test_installed_layer_cannot_use_host_distribution_to_hide_missing_provider(
    tmp_path,
    monkeypatch,
):
    repo = _project(
        tmp_path / "repo",
        ["reme-ai==0.4.2.0"],
        ["reme-ai==0.4.2.0"],
    )
    backend = _backend(tmp_path / "backend", ["reme-ai==0.4.2.0"])
    dependencies = tmp_path / "dependencies"
    dependencies.mkdir()
    host_site = tmp_path / "host-site"
    _distribution(host_site, "reme-ai", "0.4.2.0")
    monkeypatch.syspath_prepend(str(host_site))
    with pytest.raises(ValueError, match="no distribution"):
        _load(VALIDATOR).validate_installed_dependencies(
            repo,
            backend,
            dependencies,
        )


def test_isolated_target_validator_rejects_stale_and_accepts_matching_metadata(
    tmp_path,
):
    repo = _project(tmp_path / "repo", [], [])
    backend = _backend(tmp_path / "backend", ["reme-ai==0.4.2.0"])
    dependencies = tmp_path / "dependencies"
    dependencies.mkdir()
    shutil.copytree(
        Path(packaging.__file__).parent,
        dependencies / "packaging",
    )
    info = _distribution(dependencies, "reme-ai", "0.4.1.11")
    host_site = tmp_path / "host-site"
    _distribution(host_site, "reme-ai", "0.4.2.0")
    command = [
        sys.executable,
        "-I",
        str(VALIDATOR),
        "--repo",
        str(repo),
        "--backend",
        str(backend),
        "--dependencies",
        str(dependencies),
    ]
    environment = {**os.environ, "PYTHONPATH": str(host_site)}
    failed = subprocess.run(
        command,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )
    assert failed.returncode != 0
    assert "reme-ai==0.4.2.0" in failed.stderr
    assert "0.4.1.11" in failed.stderr
    shutil.rmtree(info)
    _distribution(dependencies, "reme-ai", "0.4.2.0")
    accepted = subprocess.run(
        command,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )
    assert accepted.returncode == 0, accepted.stderr
    assert "match the installed target layer" in accepted.stdout


def test_installed_layer_checks_wheel_extra_requirements(tmp_path):
    repo = _project(tmp_path / "repo", [], [])
    backend = _backend(
        tmp_path / "backend",
        ['qoder-sdk==2; extra == "qoder"'],
    )
    dependencies = tmp_path / "dependencies"
    _distribution(dependencies, "qoder-sdk", "1")
    with pytest.raises(ValueError, match="qoder-sdk==2"):
        _load(VALIDATOR).validate_installed_dependencies(
            repo,
            backend,
            dependencies,
        )


def test_layer_build_checks_installed_wheel_before_smoke_or_descriptors(
    tmp_path,
    monkeypatch,
):
    repo = _project(
        tmp_path / "repo",
        ["reme-ai==0.4.2.0"],
        ["reme-ai==0.4.2.0"],
    )
    console = repo / "console/dist"
    console.mkdir(parents=True)
    (console / "index.html").write_text(
        "<html>fixture</html>",
        encoding="utf-8",
    )
    (repo / "src/qwenpaw").mkdir(parents=True)
    builder = _load(BUILDER)
    # Keep the real subprocess gate while replacing only the install commands.
    actual_run = builder._run  # pylint: disable=protected-access
    commands = []

    def run(command, *, cwd, env=None):
        commands.append(command)
        if "-I" in command:
            actual_run(command, cwd=cwd, env=env)
            return
        if "--no-deps" in command:
            backend = Path(command[command.index("--target") + 1])
            _backend(backend, ["reme-ai==0.4.2.0"])
            packaged = backend / "qwenpaw/console"
            packaged.mkdir(parents=True)
            (packaged / "index.html").write_text("html", encoding="utf-8")
        elif "--target" in command:
            dependencies = Path(command[command.index("--target") + 1])
            shutil.copytree(
                Path(packaging.__file__).parent,
                dependencies / "packaging",
            )
            _distribution(dependencies, "reme-ai", "0.4.1.11")
        elif "build" in command:
            wheels = Path(command[command.index("--outdir") + 1])
            (wheels / "qwenpaw-2.3.0b3-py3-none-any.whl").write_bytes(b"wheel")
        else:
            pytest.fail(
                "Import smoke check must not run with an invalid layer",
            )

    monkeypatch.setattr(builder, "_run", run)
    output = tmp_path / "output"
    with pytest.raises(subprocess.CalledProcessError):
        builder.build_layers(
            repo,
            Path(sys.executable),
            Path(sys.executable),
            output,
            "2.3.0b3",
        )
    assert "--no-deps" in commands[-2]
    assert "-I" in commands[-1]
    assert not list(output.rglob(".ugsci-component.json"))
