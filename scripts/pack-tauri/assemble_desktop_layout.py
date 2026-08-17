#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Move staged desktop resources into versioned b7 component boundaries."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sys

from packaging.version import InvalidVersion, Version

try:
    from copy_windows_tree import remove_tree
except ModuleNotFoundError:
    _helper_spec = importlib.util.spec_from_file_location(
        "qwenpaw_copy_windows_tree",
        Path(__file__).with_name("copy_windows_tree.py"),
    )
    if _helper_spec is None or _helper_spec.loader is None:
        raise
    _helper = importlib.util.module_from_spec(_helper_spec)
    _helper_spec.loader.exec_module(_helper)
    remove_tree = _helper.remove_tree


def _marker_version(path: Path, marker: str) -> str:
    value = (path / marker).read_text(encoding="utf-8").strip()
    if not value or any(character in value for character in "/\\"):
        raise ValueError(f"invalid runtime marker {path / marker}: {value!r}")
    return value


def _tree_digest(root: Path) -> str:
    """Hash a component tree using the release staging contract."""
    digest = hashlib.sha256()
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            raise ValueError(f"component trees cannot contain links: {path}")
        if not path.is_file():
            continue
        relative = path.relative_to(root).as_posix().encode()
        digest.update(len(relative).to_bytes(4, "big"))
        digest.update(relative)
        with path.open("rb") as stream:
            while chunk := stream.read(1024 * 1024):
                digest.update(chunk)
    return digest.hexdigest()


def _release_version(value: str, fallback: str, root: Path) -> str:
    """Normalize runtime markers to the component-release version format."""
    try:
        return str(Version(value))
    except InvalidVersion:
        digest = _tree_digest(root)
        base = Version(fallback)
        return f"{base.public}+sha.{digest[:12]}"


def _move(source: Path, destination: Path) -> None:
    if not source.is_dir():
        raise FileNotFoundError(f"staged component is missing: {source}")
    if destination.exists():
        remove_tree(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    source.replace(destination)


def _component_directory(version: str) -> str:
    """Return a stable directory name that leaves room for deep runtime files."""
    safe = re.sub(r"[^A-Za-z0-9._+-]", "-", version).strip(".-")
    if len(safe) <= 48:
        return safe
    digest = hashlib.sha256(version.encode("utf-8")).hexdigest()[:16]
    prefix = safe[:28].rstrip(".-")
    return f"{prefix}-{digest}"


def assemble(
    root: Path,
    desktop_version: str,
    target: str | None = None,
) -> dict[str, object]:
    python_source = root / "python-runtime"
    node_source = root / "node-runtime"
    java_source = root / "java-runtime"
    office_source = root / "officecli"
    neqsim_source = root / "neqsim"
    python_marker = _marker_version(python_source, ".python-runtime-version")
    node_marker = _marker_version(node_source, ".node-runtime-version")
    java_marker = _marker_version(java_source, ".java-runtime-version")

    python_destination = (
        root / "runtimes" / "python" / _component_directory(python_marker)
    )
    node_destination = (
        root / "runtimes" / "node" / _component_directory(node_marker)
    )
    java_destination = (
        root / "runtimes" / "java" / _component_directory(java_marker)
    )
    office_version = desktop_version
    neqsim_version = desktop_version
    office_destination = root / "tools" / "officecli" / office_version
    neqsim_destination = root / "tools" / "neqsim" / neqsim_version
    computer_use_destination = (
        root / "tools" / "computer-use" / desktop_version
    )
    _move(python_source, python_destination)
    _move(node_source, node_destination)
    _move(java_source, java_destination)
    _move(office_source, office_destination)
    _move(neqsim_source, neqsim_destination)
    python_version = _release_version(
        python_marker,
        desktop_version,
        python_destination,
    )
    node_version = _release_version(
        node_marker,
        desktop_version,
        node_destination,
    )
    java_version = _release_version(
        java_marker,
        desktop_version,
        java_destination,
    )
    helper_name = (
        "qwenpaw-computer-use-helper.exe"
        if sys.platform == "win32"
        else "qwenpaw-computer-use-helper"
    )
    if not (computer_use_destination / helper_name).is_file():
        raise FileNotFoundError(
            f"versioned Computer Use helper is missing: {computer_use_destination}",
        )

    backend_root = root / "app" / "backend" / desktop_version
    dependency_candidates = sorted(
        (root / "runtimes" / "python-packages").iterdir(),
    )
    if not (backend_root / "qwenpaw").is_dir():
        raise FileNotFoundError(
            f"layered QwenPaw backend is missing: {backend_root}",
        )
    if (
        len(dependency_candidates) != 1
        or not dependency_candidates[0].is_dir()
    ):
        raise ValueError("exactly one Python dependency layer must be staged")
    dependencies = dependency_candidates[0]

    def entry(
        version: str,
        path: Path,
        kind: str | None = None,
    ) -> dict[str, str]:
        result = {
            "version": version,
            "path": path.relative_to(root.parent).as_posix(),
        }
        if kind:
            result["kind"] = kind
        return result

    active: dict[str, object] = {
        "schemaVersion": 1,
        "target": target,
        "components": {
            "backend": entry(desktop_version, backend_root, "python"),
            "python-packages": entry(dependencies.name, dependencies),
            "python-runtime": entry(python_version, python_destination),
            "node-runtime": entry(node_version, node_destination),
            "java-runtime": entry(java_version, java_destination),
            "officecli": entry(office_version, office_destination),
            "neqsim": entry(neqsim_version, neqsim_destination),
            "computer-use-helper": entry(
                desktop_version,
                computer_use_destination,
            ),
        },
    }
    state = root / "state"
    state.mkdir(parents=True, exist_ok=True)
    (state / "active.json").write_text(
        json.dumps(active, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return active


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--binaries", type=Path, required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--target", required=True)
    args = parser.parse_args()
    print(
        json.dumps(
            assemble(
                args.binaries.resolve(),
                args.version.strip(),
                args.target.strip(),
            ),
            sort_keys=True,
        ),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
