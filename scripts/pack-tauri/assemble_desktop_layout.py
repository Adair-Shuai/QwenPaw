#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Move staged desktop resources into versioned b7 component boundaries."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tempfile

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
    source_root = source.resolve()
    links = [path for path in source.rglob("*") if path.is_symlink()]
    if links:
        for link in links:
            target = link.resolve()
            if source_root not in target.parents:
                raise ValueError(
                    "component tree contains a link outside its source: "
                    f"{link}",
                )
        # Python runtimes distributed by python-build-standalone contain
        # harmless internal links such as bin/2to3.  Materialize those links
        # before hashing and archiving because managed component trees must be
        # self-contained and link-free.
        shutil.copytree(source, destination, symlinks=False)
        remove_tree(source)
        return
    source.replace(destination)


def _component_directory(version: str) -> str:
    """Return a stable directory name that leaves room for deep runtime files."""
    safe = re.sub(r"[^A-Za-z0-9._+-]", "-", version).strip(".-")
    if len(safe) <= 48:
        return safe
    digest = hashlib.sha256(version.encode("utf-8")).hexdigest()[:16]
    prefix = safe[:28].rstrip(".-")
    return f"{prefix}-{digest}"


def _relocate_channel_interpreter(
    root: Path,
    source: Path,
    destination: Path,
) -> None:
    manifest = root / "channel-runtime" / "runtime.json"
    if not manifest.is_file():
        return
    data = json.loads(manifest.read_text(encoding="utf-8"))
    value = data["python_executable"]
    if not isinstance(value, str) or "\\" in value or ":" in value:
        raise ValueError("invalid channel interpreter path")
    executable = PurePosixPath(value)
    relative = executable.relative_to(
        source.relative_to(root.parent).as_posix(),
    )
    if not relative.parts or ".." in relative.parts:
        raise ValueError(
            "channel interpreter must remain inside Python runtime",
        )
    relocated = destination.joinpath(*relative.parts)
    if not relocated.is_file():
        raise FileNotFoundError(f"channel interpreter is missing: {relocated}")
    data["python_executable"] = relocated.relative_to(root.parent).as_posix()
    manifest.write_text(
        json.dumps(data, indent=2) + "\n",
        encoding="utf-8",
    )


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
    _relocate_channel_interpreter(root, python_source, python_destination)
    _move(node_source, node_destination)
    java_home = java_source / "Contents" / "Home"
    if (java_home / "bin" / "java").is_file():
        # Component metadata cannot live beside Contents in a signed bundle.
        # The launcher already supports a flat JRE home; retain all runtime
        # files while leaving the vendor's outer bundle shell out of the layer.
        _move(java_home, java_destination)
        remove_tree(java_source)
    else:
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
    # The layer can be assembled for a target platform from a different host
    # (for example, contract tests assemble a Windows tree on Linux). Prefer
    # the explicit target when available and fall back to the host only for
    # local callers that do not provide one.
    target_is_windows = (
        target.startswith("windows-") if target else sys.platform == "win32"
    )
    helper_name = (
        "qwenpaw-computer-use-helper.exe"
        if target_is_windows
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
    # Both distribution paths must contain exactly the same descriptor and
    # normalized dependency metadata, including on the very first delta.
    from refresh_desktop_descriptors import refresh

    return refresh(root, desktop_version, active)


def verify_channel_runtime(root: Path, active: dict) -> None:
    """Read staged policy under the relocated interpreter before native builds."""
    resource = root.parent
    components = active["components"]
    runtime = resource / components["python-runtime"]["path"] / "python"
    executable = runtime / (
        "python.exe"
        if active["target"].startswith("windows-")
        else "bin/python3"
    )
    backend = resource / components["backend"]["path"]
    dependencies = resource / components["python-packages"]["path"]
    support = root / "channel-runtime/site"
    environment = dict(os.environ)
    for key in ("PYTHONHOME", "PYTHONPATH", "PYTHONPYCACHEPREFIX"):
        environment.pop(key, None)
    with tempfile.TemporaryDirectory(
        prefix="qwenpaw-runtime-check-",
    ) as working:
        environment.update(
            {
                "QWENPAW_DESKTOP_APP": "1",
                "QWENPAW_TAURI_RESOURCE_DIR": str(resource),
                "QWENPAW_CHANNEL_RUNTIME_MANIFEST": str(
                    root / "channel-runtime/runtime.json",
                ),
                "QWENPAW_DESKTOP_PY_RUNTIME": str(executable),
                "QWENPAW_CHANNEL_SUPPORT_ROOT": str(support),
                "QWENPAW_CHANNEL_DEPENDENCY_PATHS": json.dumps([str(support)]),
                "QWENPAW_WORKING_DIR": working,
                "QWENPAW_SECRET_DIR": working,
                "PYTHONDONTWRITEBYTECODE": "1",
                "OFFICECLI_SKIP_UPDATE": "1",
            },
        )
        subprocess.run(
            [
                str(executable),
                "-I",
                "-B",
                "-c",
                "import sys; sys.path[:0] = sys.argv[1:]; "
                "from qwenpaw.plugins.channel_bootstrap import "
                "resolve_default_channel_runtime; "
                "runtime = resolve_default_channel_runtime(provision=False); "
                "\nif runtime.runtime_identity is None:\n"
                "    raise RuntimeError('Desktop runtime identity is missing')\n"
                "print('PASS relocated desktop channel runtime')",
                str(backend),
                str(dependencies),
            ],
            env=environment,
            cwd=working,
            check=True,
            timeout=60,
        )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--binaries", type=Path, required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--target", required=True)
    parser.add_argument("--verify-runtime", action="store_true")
    args = parser.parse_args()
    root = args.binaries.resolve()
    active = assemble(root, args.version.strip(), args.target.strip())
    if args.verify_runtime:
        verify_channel_runtime(root, active)
    print(
        json.dumps(
            active,
            sort_keys=True,
        ),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
