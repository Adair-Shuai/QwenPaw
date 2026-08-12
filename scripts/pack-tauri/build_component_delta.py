#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build a deterministic, file-level component delta archive."""

from __future__ import annotations

import argparse
import json
import os
import tempfile
import zipfile
from pathlib import Path

from component_common import (
    canonical_json,
    file_inventory,
    read_plugin_metadata,
)


def build_delta(
    base: Path,
    target: Path,
    preserve_paths: tuple[str, ...] = ("engines",),
) -> dict:
    base_files = file_inventory(base, preserve_paths)
    target_files = file_inventory(target, preserve_paths)
    add = sorted(set(target_files) - set(base_files))
    delete = sorted(set(base_files) - set(target_files))
    replace = sorted(
        path
        for path in set(base_files) & set(target_files)
        if base_files[path]["sha256"] != target_files[path]["sha256"]
        or base_files[path].get("mode") != target_files[path].get("mode")
    )
    component_id, base_version = read_plugin_metadata(base)
    target_id, target_version = read_plugin_metadata(target)
    if component_id != target_id:
        raise ValueError(
            f"component id changed: {component_id!r} -> {target_id!r}",
        )
    return {
        "schema_version": 1,
        "component": component_id,
        "base_version": base_version,
        "target_version": target_version,
        "add": add,
        "replace": replace,
        "delete": delete,
        "base_files": base_files,
        "files": {
            path: target_files[path]
            for path in sorted(set(add) | set(replace))
        },
        "final_files": target_files,
    }


def write_delta(
    base: Path,
    target: Path,
    output: Path,
    preserve_paths: tuple[str, ...] = ("engines",),
) -> dict:
    delta = build_delta(base, target, preserve_paths)
    output.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary_name = tempfile.mkstemp(
        prefix=f".{output.name}.",
        suffix=".tmp",
        dir=output.parent,
    )
    os.close(fd)
    temporary = Path(temporary_name)
    try:
        with zipfile.ZipFile(
            temporary,
            "w",
            compression=zipfile.ZIP_DEFLATED,
            compresslevel=9,
        ) as archive:
            info = zipfile.ZipInfo(
                "delta.json",
                date_time=(1980, 1, 1, 0, 0, 0),
            )
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, canonical_json(delta))
            for relative in sorted(set(delta["add"]) | set(delta["replace"])):
                source = target / Path(relative)
                info = zipfile.ZipInfo(
                    f"files/{relative}",
                    date_time=(1980, 1, 1, 0, 0, 0),
                )
                info.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(info, source.read_bytes())
        os.replace(temporary, output)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise
    return delta


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--target", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    delta = write_delta(
        args.base.resolve(),
        args.target.resolve(),
        args.output.resolve(),
    )
    print(
        json.dumps(
            {
                "component": delta["component"],
                "base_version": delta["base_version"],
                "target_version": delta["target_version"],
            },
        ),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
