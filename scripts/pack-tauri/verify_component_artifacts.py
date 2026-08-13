#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify and safely apply a component delta archive."""

from __future__ import annotations

import argparse
import json
import shutil
import tempfile
import zipfile
from pathlib import Path

from component_common import (
    file_inventory,
    read_plugin_metadata,
    safe_relative_path,
)

_MAX_ARCHIVE_MEMBERS = 10_000
_MAX_ARCHIVE_BYTES = 768 * 1024 * 1024


def apply_delta(base: Path, archive_path: Path, output: Path) -> dict:
    # pylint: disable=too-many-branches,too-many-statements
    base = base.resolve()
    output = output.resolve()
    if output == base or base in output.parents:
        raise ValueError(
            "output must not replace or reside inside base component",
        )
    if output.exists() and not output.is_dir():
        raise ValueError("output must be a directory when it exists")
    with zipfile.ZipFile(archive_path) as archive:
        infos = archive.infolist()
        if len({info.filename for info in infos}) != len(infos):
            raise ValueError(
                "component delta contains duplicate archive members",
            )
        if len(infos) > _MAX_ARCHIVE_MEMBERS:
            raise ValueError(
                "component delta contains too many archive members",
            )
        if sum(info.file_size for info in infos) > _MAX_ARCHIVE_BYTES:
            raise ValueError("component delta is too large to extract")
        for info in infos:
            if (
                info.is_dir()
                or (info.external_attr >> 16) & 0o170000 == 0o120000
            ):
                raise ValueError(
                    "component delta may not contain links or directories",
                )
        try:
            delta = json.loads(archive.read("delta.json"))
        except (KeyError, json.JSONDecodeError) as exc:
            raise ValueError("invalid component delta archive") from exc
        if not isinstance(delta, dict):
            raise ValueError("delta.json must contain an object")
        if delta.get("schema_version") != 1:
            raise ValueError("unsupported component delta schema")
        if not isinstance(delta.get("base_files"), dict) or not isinstance(
            delta.get("final_files"),
            dict,
        ):
            raise ValueError("delta must contain base_files and final_files")
        component_id, base_version = read_plugin_metadata(base)
        if (
            delta.get("component") != component_id
            or delta.get("base_version") != base_version
        ):
            raise ValueError(
                "delta component or base version does not match base",
            )
        if (
            not isinstance(delta.get("target_version"), str)
            or not delta["target_version"]
        ):
            raise ValueError("delta target_version is required")
        operations = {}
        for operation in ("add", "replace", "delete"):
            values = delta.get(operation, [])
            if not isinstance(values, list) or any(
                not isinstance(item, str) for item in values
            ):
                raise ValueError(f"invalid {operation} list")
            normalized = [safe_relative_path(item) for item in values]
            if len(normalized) != len(set(normalized)):
                raise ValueError(f"duplicate paths in {operation} list")
            operations[operation] = normalized
        if set(operations["add"]) & set(operations["replace"]):
            raise ValueError("path cannot be both added and replaced")
        if (set(operations["add"]) | set(operations["replace"])) & set(
            operations["delete"],
        ):
            raise ValueError("path cannot be both written and deleted")
        expected_members = {
            "delta.json",
            *(
                f"files/{path}"
                for path in operations["add"] + operations["replace"]
            ),
        }
        actual_members = {info.filename for info in infos}
        if actual_members != expected_members:
            raise ValueError(
                "delta archive contains unexpected or missing members",
            )
        current = file_inventory(base)
        expected_base = delta.get("base_files")
        if expected_base is not None and current != expected_base:
            raise ValueError("base component does not match delta")
        with tempfile.TemporaryDirectory(prefix="qwenpaw-component-") as temp:
            staged = Path(temp) / "component"
            shutil.copytree(base, staged)
            for relative in operations["delete"]:
                candidate = (staged / relative).resolve()
                candidate.relative_to(staged.resolve())
                if candidate.exists():
                    candidate.unlink()
            for relative in [*operations["add"], *operations["replace"]]:
                member = f"files/{relative}"
                if member not in archive.namelist():
                    raise ValueError(f"delta payload missing {relative}")
                candidate = (staged / relative).resolve()
                candidate.relative_to(staged.resolve())
                candidate.parent.mkdir(parents=True, exist_ok=True)
                candidate.write_bytes(archive.read(member))
                metadata = delta["final_files"].get(relative, {})
                mode = metadata.get("mode")
                if type(mode) is int and 0 <= mode <= 0o7777:
                    candidate.chmod(mode)
            actual = file_inventory(staged)
            if actual != delta.get("final_files"):
                raise ValueError(
                    "final component inventory does not match delta",
                )
            output.parent.mkdir(parents=True, exist_ok=True)
            previous = output.parent / f".{output.name}.previous"
            if previous.exists():
                shutil.rmtree(previous)
            if output.exists():
                output.replace(previous)
            try:
                staged.replace(output)
            except Exception:
                if previous.exists() and not output.exists():
                    previous.replace(output)
                raise
            if previous.exists():
                shutil.rmtree(previous)
        return delta


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    delta = apply_delta(
        args.base.resolve(),
        args.archive.resolve(),
        args.output.resolve(),
    )
    print(f"verified {delta['component']} {delta['target_version']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
