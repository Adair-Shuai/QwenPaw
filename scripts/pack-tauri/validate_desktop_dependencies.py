#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Reject stale desktop locks and incompatible installed dependency layers."""

from __future__ import annotations

import argparse
from importlib import metadata
from pathlib import Path
import sys
import tomllib


def selected_extras(repo: Path) -> tuple[str, ...]:
    """Read the local project's extras from the actual desktop input."""
    from packaging.requirements import Requirement

    entries = []
    for line in (
        (repo / "requirements-desktop.in")
        .read_text(
            encoding="utf-8",
        )
        .splitlines()
    ):
        line = line.split("#", 1)[0].strip()
        if line.startswith("."):
            if line != "." and not line.startswith(".["):
                raise ValueError(f"Unsupported desktop project input: {line}")
            entries.append(Requirement("qwenpaw" + line[1:]))
    if len(entries) != 1:
        raise ValueError("Desktop input must select exactly one local project")
    return tuple(sorted(entries[0].extras))


def _desktop_environments():
    from packaging.markers import default_environment

    for system, os_name, platform, machines in (
        ("win32", "nt", "Windows", ("AMD64", "ARM64")),
        ("darwin", "posix", "Darwin", ("arm64", "x86_64")),
    ):
        for machine in machines:
            environment = default_environment()
            environment.update(
                sys_platform=system,
                os_name=os_name,
                platform_system=platform,
                platform_machine=machine,
            )
            yield environment


def _active(requirement, environment, extras):
    return requirement.marker is None or any(
        requirement.marker.evaluate({**environment, "extra": extra})
        for extra in ("", *extras)
    )


def _locked_requirements(lock: Path):
    from packaging.requirements import Requirement

    requirements = []
    for line in lock.read_text(encoding="utf-8").splitlines():
        line = line.strip().removesuffix("\\").strip()
        if not line or line.startswith(("#", "--hash=")):
            continue
        requirement = Requirement(line)
        pins = tuple(requirement.specifier)
        if (
            requirement.url
            or len(pins) != 1
            or pins[0].operator != "=="
            or "*" in pins[0].version
        ):
            raise ValueError(
                f"Desktop dependency is not exactly pinned: {line}",
            )
        requirements.append((requirement, pins[0].version))
    return requirements


def _project_requirements(repo: Path, extras):
    from packaging.requirements import Requirement

    project = tomllib.loads(
        (repo / "pyproject.toml").read_text(encoding="utf-8"),
    )["project"]
    values = list(project.get("dependencies", ()))
    optional = project.get("optional-dependencies", {})
    for extra in extras:
        if extra not in optional:
            raise ValueError(f"Unknown desktop project extra: {extra}")
        values.extend(optional[extra])
    return [Requirement(value) for value in values]


def _check_requirement(requirement, versions, label):
    if requirement.url:
        raise ValueError(
            f"Desktop URL dependency cannot be verified: {requirement}",
        )
    if len(versions) != 1 or not requirement.specifier.contains(
        versions[0],
        prereleases=True,
    ):
        raise ValueError(
            f"{label} does not satisfy {requirement}: "
            f"found {versions or 'no distribution'}",
        )


def validate_project_lock(repo: Path) -> None:
    """Check project requirements for both desktop targets before any install."""
    from packaging.utils import canonicalize_name

    extras = selected_extras(repo)
    requirements = _project_requirements(repo, extras)
    pins = _locked_requirements(repo / "requirements-desktop.lock")
    for environment in _desktop_environments():
        for requirement in requirements:
            if not _active(requirement, environment, extras):
                continue
            versions = [
                version
                for pinned, version in pins
                if canonicalize_name(pinned.name)
                == canonicalize_name(requirement.name)
                and _active(pinned, environment, extras)
            ]
            _check_requirement(
                requirement,
                versions,
                f"Desktop lock ({environment['sys_platform']})",
            )


def validate_installed_dependencies(
    repo: Path,
    backend: Path,
    dependencies: Path,
) -> None:
    """Use only the staged distributions, never the build host's metadata."""
    from packaging.markers import default_environment
    from packaging.requirements import Requirement
    from packaging.utils import canonicalize_name

    extras = selected_extras(repo)
    hosts = [
        distribution
        for distribution in metadata.distributions(path=[str(backend)])
        if canonicalize_name(distribution.metadata["Name"]) == "qwenpaw"
    ]
    if len(hosts) != 1:
        raise ValueError(
            "Backend layer must contain exactly one QwenPaw wheel",
        )
    provided = hosts[0].metadata.get_all("Provides-Extra") or []
    if set(extras) - set(provided):
        raise ValueError(
            f"Backend wheel does not provide desktop extras: {extras}",
        )
    installed: dict[str, list[str]] = {}
    for distribution in metadata.distributions(path=[str(dependencies)]):
        name = canonicalize_name(distribution.metadata["Name"])
        installed.setdefault(name, []).append(distribution.version)
    environment = default_environment()
    for raw in hosts[0].requires or []:
        requirement = Requirement(raw)
        if _active(requirement, environment, extras):
            _check_requirement(
                requirement,
                installed.get(canonicalize_name(requirement.name), []),
                "Installed desktop layer",
            )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--backend", type=Path, required=True)
    parser.add_argument("--dependencies", type=Path, required=True)
    args = parser.parse_args()
    # -I discards inherited PYTHONPATH; import the parser from this target layer.
    sys.path.insert(0, str(args.dependencies))
    validate_installed_dependencies(args.repo, args.backend, args.dependencies)
    print(
        "Desktop backend wheel requirements match the installed target layer",
    )


if __name__ == "__main__":
    main()
