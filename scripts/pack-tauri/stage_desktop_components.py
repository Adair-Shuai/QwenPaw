#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Stage active desktop layers as generic managed component sources."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import shutil

from packaging.version import InvalidVersion, Version


SAFE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")


def _safe_relative(value: str) -> PurePosixPath:
    path = PurePosixPath(value)
    if not value or path.is_absolute() or ".." in path.parts or "\\" in value:
        raise ValueError(f"unsafe active component path: {value!r}")
    return path


def _tree_digest(root: Path) -> str:
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


def _release_version(value: str, fallback: str, digest: str) -> str:
    try:
        return str(Version(value))
    except InvalidVersion:
        base = Version(fallback)
        return f"{base.public}+sha.{digest[:12]}"


def stage(binaries: Path, output: Path, fallback_version: str) -> list[dict]:
    active_path = binaries / "state" / "active.json"
    active = json.loads(active_path.read_text(encoding="utf-8"))
    if active.get("schemaVersion") != 1 or not isinstance(active.get("components"), dict):
        raise ValueError("desktop active.json is invalid")
    resource_root = binaries.parent.resolve()
    output.mkdir(parents=True, exist_ok=True)
    staged: list[dict] = []
    for component_id, entry in sorted(active["components"].items()):
        if not isinstance(component_id, str) or not SAFE_ID.fullmatch(component_id):
            raise ValueError(f"unsafe desktop component id: {component_id!r}")
        if not isinstance(entry, dict):
            raise ValueError(f"invalid active component entry: {component_id}")
        relative = _safe_relative(str(entry.get("path", "")))
        source = (resource_root / Path(*relative.parts)).resolve()
        if resource_root not in source.parents or not source.is_dir():
            raise ValueError(f"active component source is missing or outside resources: {source}")
        digest = _tree_digest(source)
        version = _release_version(str(entry.get("version", "")), fallback_version, digest)
        destination = output / component_id
        if destination.exists():
            shutil.rmtree(destination)
        shutil.copytree(source, destination, symlinks=False)
        descriptor = {
            "schema_version": 1,
            "id": component_id,
            "version": version,
            "kind": str(entry.get("kind") or "directory"),
            "install_scope": "desktop-runtime",
            "active_path": relative.as_posix(),
            "content_sha256": digest,
            "preserve": [],
        }
        (destination / "component.json").write_text(
            json.dumps(descriptor, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        staged.append(descriptor)
    return staged


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--binaries", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--fallback-version", required=True)
    args = parser.parse_args()
    staged = stage(
        args.binaries.resolve(),
        args.output.resolve(),
        args.fallback_version.strip(),
    )
    print(json.dumps(staged, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
