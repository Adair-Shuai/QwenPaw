# -*- coding: utf-8 -*-
"""Refresh component identities after transformations such as macOS signing."""

import argparse
import json
import os
from pathlib import Path, PurePosixPath

from stage_desktop_components import describe_component


def _channel_interpreter_path(binaries: Path, active: dict, value) -> str:
    """Relocate only an interpreter owned by the staged or selected runtime."""
    resources = binaries.parent
    record = active["components"].get("python-runtime", {})
    destination = record.get("path")
    relative_paths: list[PurePosixPath] = []
    for path in (value, destination):
        if not isinstance(path, str) or not path:
            raise ValueError("channel interpreter path is invalid")
        if (
            "\\" in path
            or ":" in path
            or PurePosixPath(path).is_absolute()
            or ".." in PurePosixPath(path).parts
        ):
            raise ValueError("channel interpreter path is invalid")
        relative_paths.append(PurePosixPath(path))
    original, current = relative_paths
    staged = PurePosixPath("binaries/python-runtime")
    if original.is_relative_to(staged):
        executable = current / original.relative_to(staged)
    elif original.is_relative_to(current):
        executable = original
    else:
        raise ValueError("channel interpreter is outside the Python runtime")
    runtime_root = (resources / Path(*current.parts)).resolve()
    target = resources / Path(*executable.parts)
    if (
        not runtime_root.is_relative_to(binaries.resolve())
        or not target.resolve().is_relative_to(runtime_root)
        or not target.is_file()
    ):
        raise ValueError("assembled channel interpreter is missing or unsafe")
    return executable.as_posix()


def _refresh_channel_runtime(binaries: Path, active: dict) -> None:
    """Keep the readable worker manifest aligned with the assembled runtime."""
    resources = binaries.parent
    backend = active["components"].get("backend", {})
    support_root = resources
    if backend.get("kind") == "python":
        support_root = (resources / backend["path"]).resolve()
        if not support_root.is_relative_to(binaries.resolve()):
            raise ValueError("channel backend path escapes binaries directory")
    compact = support_root != resources and os.path.lexists(support_root / "c")
    runtime = support_root / ("c" if compact else "channel-runtime")
    manifest = runtime / "runtime.json"
    if support_root == resources:
        manifest = binaries / "channel-runtime" / "runtime.json"
    if not manifest.is_file():
        if compact:
            raise ValueError("compact channel runtime manifest is missing")
        return  # Desktop layouts predating readable channels have no manifest.
    if manifest.is_symlink() or not manifest.resolve().is_relative_to(
        binaries.resolve(),
    ):
        raise ValueError("channel runtime manifest is outside binaries")
    data = json.loads(manifest.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or data.get("schema_version") != 1:
        raise ValueError("channel runtime manifest is invalid")
    support = (
        (manifest.parent / ("s" if compact else "site"))
        .relative_to(support_root)
        .as_posix()
    )
    previous_support = data.get("support_root")
    allowed_support = {"binaries/channel-runtime/site", support}
    if compact:
        allowed_support.add("channel-runtime/site")
    if previous_support not in allowed_support:
        raise ValueError("channel support path is outside its backend")
    if data.get("dependency_paths") != [previous_support]:
        raise ValueError("channel dependency paths differ from its support")
    value = data.get("python_executable")
    executable = _channel_interpreter_path(binaries, active, value)
    if value != executable or previous_support != support:
        data["python_executable"] = executable
        data["support_root"] = support
        data["dependency_paths"] = [support]
        manifest.write_text(
            json.dumps(data, indent=2) + "\n",
            encoding="utf-8",
            newline="\n",
        )


def refresh(binaries: Path, version: str, active: dict | None = None) -> dict:
    pointer = binaries / "state" / "active.json"
    if active is None:
        active = json.loads(pointer.read_text(encoding="utf-8"))
    _refresh_channel_runtime(binaries, active)
    for component, record in active["components"].items():
        source = binaries.parent / record["path"]
        if not source.resolve().is_relative_to(binaries.resolve()):
            raise ValueError("component path escapes binaries directory")
        descriptor = describe_component(source, component, record, version)
        (source / "component.json").write_text(
            json.dumps(
                descriptor,
                ensure_ascii=False,
                indent=2,
                sort_keys=True,
            )
            + "\n",
            encoding="utf-8",
            newline="\n",
        )
        record["version"] = descriptor["version"]
    pointer.parent.mkdir(parents=True, exist_ok=True)
    pointer.write_text(
        json.dumps(active, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    return active


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--binaries", type=Path, required=True)
    parser.add_argument("--version", required=True)
    args = parser.parse_args()
    refresh(args.binaries.resolve(), args.version)
