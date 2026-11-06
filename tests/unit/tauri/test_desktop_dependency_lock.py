# -*- coding: utf-8 -*-
"""Keep the desktop lock aligned with the selected dependency profile."""

from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import re
import tomllib

from packaging.markers import default_environment
from packaging.requirements import Requirement
from packaging.utils import canonicalize_name
from packaging.version import Version
import pytest

ROOT = Path(__file__).resolve().parents[3]


def _desktop_requirements():
    project = tomllib.loads((ROOT / "pyproject.toml").read_text("utf-8"))[
        "project"
    ]
    pending = [ROOT / "requirements-desktop.in"]
    requirements = []
    while pending:
        path = pending.pop()
        for line in path.read_text("utf-8").splitlines():
            line = line.split("#", 1)[0].strip()
            if not line:
                continue
            if line.startswith("-r "):
                pending.append(path.parent / line[3:].strip())
            elif line.startswith(".["):
                requirements.extend(project["dependencies"])
                extras = line[2:-1].split(",")
                assert "full" not in extras
                for extra in extras:
                    requirements.extend(
                        project["optional-dependencies"][extra],
                    )
            else:
                requirements.append(line)
    # Match the real desktop staging inventory, including bundled apps. A
    # developer environment may hide a missing plugin dependency such as ULit's
    # PyMuPDF even when every core requirement is already locked.
    spec = spec_from_file_location(
        "desktop_bundled_plugins",
        ROOT / "scripts/pack-tauri/stage_bundled_plugins.py",
    )
    assert spec and spec.loader
    staging = module_from_spec(spec)
    spec.loader.exec_module(staging)
    for plugin in staging.discover_bundled_plugins(ROOT):
        manifest = json.loads((plugin / "plugin.json").read_text("utf-8"))
        requirements.extend(manifest.get("dependencies", []))
    return [Requirement(value) for value in requirements]


@pytest.mark.parametrize("python_version", ["3.11", "3.12", "3.13"])
@pytest.mark.parametrize("platform", ["win32", "darwin"])
def test_desktop_lock_satisfies_every_selected_direct_dependency(
    python_version,
    platform,
):
    """Catch stale pins such as ReMe without relying on the developer venv."""
    environment = {
        **default_environment(),
        "python_version": python_version,
        "python_full_version": f"{python_version}.0",
        "sys_platform": platform,
        "platform_system": "Windows" if platform == "win32" else "Darwin",
        "os_name": "nt" if platform == "win32" else "posix",
        "platform_machine": "AMD64" if platform == "win32" else "arm64",
        "extra": "",
    }
    pins = {}
    for line in (
        (ROOT / "requirements-desktop.lock")
        .read_text(
            "utf-8",
        )
        .splitlines()
    ):
        if not re.match(r"^[A-Za-z0-9_.-]+==", line):
            continue
        requirement = Requirement(line.rstrip(" \\"))
        if requirement.marker and not requirement.marker.evaluate(environment):
            continue
        name = canonicalize_name(requirement.name)
        assert name not in pins, f"Overlapping lock entries for {name}"
        pins[name] = Version(next(iter(requirement.specifier)).version)

    for required in _desktop_requirements():
        if required.marker and not required.marker.evaluate(environment):
            continue
        name = canonicalize_name(required.name)
        assert name in pins, f"Desktop lock omits {required}"
        assert (
            pins[name] in required.specifier
        ), f"Desktop lock has {name}=={pins[name]}, requires {required}"
