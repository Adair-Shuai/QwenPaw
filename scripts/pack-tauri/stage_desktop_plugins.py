#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Reuse complete plugin payloads from the verified versioned desktop backend."""

from __future__ import annotations

import argparse
import json
from pathlib import Path, PurePosixPath
import shutil
import stat
import tempfile

from packaging.version import Version

from stage_bundled_plugins import discover_bundled_plugins, iter_runtime_files
from verify_frozen_plugins import verify


def _source_plugins(binaries: Path, target: str, version: str) -> Path:
    """Reject foreign platforms, releases, and linked source trees."""
    active = json.loads((binaries / "state/active.json").read_text("utf-8"))
    backend = active.get("components", {}).get("backend", {})
    backend_version = backend.get("version", "")
    if (
        active.get("schemaVersion") != 1
        or active.get("target") != target
        or Version(backend_version) != Version(version)
    ):
        raise ValueError(
            "desktop plugin source target/version differs from release",
        )
    relative = PurePosixPath(str(backend.get("path", "")))
    if relative.as_posix() != f"binaries/app/backend/{backend_version}":
        raise ValueError("unsafe desktop backend path")
    source = (
        binaries / "app/backend" / backend_version / "qwenpaw/plugins_bundle"
    )
    if not source.resolve(strict=True).is_relative_to(binaries):
        raise ValueError("desktop plugin source escapes binaries")
    for path in [*source.parents, source, *source.rglob("*")]:
        if not path.is_relative_to(binaries):
            continue
        metadata = path.lstat()
        if path.is_symlink() or getattr(
            metadata,
            "st_file_attributes",
            0,
        ) & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 1024):
            raise ValueError(f"desktop plugin source contains a link: {path}")
    verify(source)
    return source


def stage(
    repo: Path,
    binaries: Path,
    output: Path,
    target: str,
    version: str,
) -> None:
    """Bind platform, backend, and every delivered plugin to this release tree."""
    repo, binaries = repo.resolve(strict=True), binaries.resolve(strict=True)
    source = _source_plugins(binaries, target, version)
    installed = {}
    for manifest_path in source.glob("*/plugin.json"):
        manifest = json.loads(manifest_path.read_text("utf-8"))
        installed[manifest["id"]] = (manifest_path.parent, manifest)
    selected = discover_bundled_plugins(repo)
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(
        prefix=".desktop-plugins-",
        dir=output.parent,
    ) as temporary:
        staged = Path(temporary)
        for canonical in selected:
            expected = json.loads(
                (canonical / "plugin.json").read_text("utf-8"),
            )
            record = installed.get(expected["id"])
            if record is None or record[1] != expected:
                raise ValueError(
                    f"desktop plugin manifest differs from release: {expected['id']}",
                )
            plugin_root = record[0]
            for path in iter_runtime_files(plugin_root):
                destination = (
                    staged / canonical.name / path.relative_to(plugin_root)
                )
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, destination)
        verify(staged)
        # This stage also supports an existing root containing generic layers.
        output.mkdir(parents=True, exist_ok=True)
        for canonical in selected:
            destination = output / canonical.name
            if destination.exists():
                if (
                    destination.is_symlink()
                    or not destination.resolve().is_relative_to(
                        output.resolve(),
                    )
                ):
                    raise ValueError(
                        "plugin staging destination escapes output",
                    )
                shutil.rmtree(destination)
            shutil.move(str(staged / canonical.name), destination)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--binaries", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--target", required=True)
    parser.add_argument("--version", required=True)
    stage(**vars(parser.parse_args()))


if __name__ == "__main__":
    main()
