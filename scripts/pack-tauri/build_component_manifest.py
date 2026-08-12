#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate a signed-manifest-ready component metadata document."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from component_common import canonical_json, file_inventory, read_plugin_metadata

_SHA256 = re.compile(r"^[0-9a-f]{64}$")


def build_manifest(
    root: Path,
    *,
    product: str,
    channel: str,
    target: str,
    core_min_version: str,
    version: str | None = None,
    full_url: str | None = None,
    full_size: int | None = None,
    full_sha256: str | None = None,
    full_signature: str | None = None,
    deltas: list[dict] | None = None,
) -> dict:
    if not all(isinstance(value, str) and value.strip() for value in (product, channel, target, core_min_version)):
        raise ValueError("product, channel, target and core_min_version must be non-empty strings")
    try:
        from packaging.version import Version
        Version(core_min_version)
    except Exception as exc:
        raise ValueError("invalid core_min_version") from exc
    component_id, discovered_version = read_plugin_metadata(root)
    component_version = version or discovered_version
    if not isinstance(component_version, str):
        raise ValueError("component version must be a string")
    inventory = file_inventory(root)
    entry: dict = {
        "kind": "directory",
        "version": component_version,
        "min_core_version": core_min_version,
        "files": inventory,
    }
    if full_url:
        if type(full_size) is not int or full_size < 0 or not full_sha256 or not _SHA256.fullmatch(full_sha256) or not full_signature:
            raise ValueError(
                "--full-size, --full-sha256 and --full-signature are required when --full-url is set",
            )
        entry["full"] = {
            "url": full_url,
            "size": full_size,
            "sha256": full_sha256,
            "signature": full_signature,
        }
    if deltas:
        entry["deltas"] = deltas
    return {
        "schema_version": 1,
        "product": product,
        "channel": channel,
        "target": target,
        "core_min_version": core_min_version,
        "generated_at": os.environ.get(
            "SOURCE_DATE_EPOCH",
            datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        ),
        "components": {component_id: entry},
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--product", default="qwenpaw")
    parser.add_argument("--channel", default="stable")
    parser.add_argument("--target", required=True)
    parser.add_argument("--core-min-version", required=True)
    parser.add_argument("--version")
    parser.add_argument("--full-url")
    parser.add_argument("--full-size", type=int)
    parser.add_argument("--full-sha256")
    parser.add_argument("--full-signature")
    parser.add_argument("--delta-json", action="append", default=[])
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    deltas = [json.loads(Path(path).read_text(encoding="utf-8")) for path in args.delta_json]
    manifest = build_manifest(
        args.root.resolve(),
        product=args.product,
        channel=args.channel,
        target=args.target,
        core_min_version=args.core_min_version,
        version=args.version,
        full_url=args.full_url,
        full_size=args.full_size,
        full_sha256=args.full_sha256,
        full_signature=args.full_signature,
        deltas=deltas,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    payload = canonical_json(manifest)
    fd, temporary_name = tempfile.mkstemp(prefix=f".{args.output.name}.", suffix=".tmp", dir=args.output.parent)
    os.close(fd)
    temporary = Path(temporary_name)
    try:
        temporary.write_bytes(payload)
        os.replace(temporary, args.output)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise
    print(f"wrote {args.output} ({len(manifest['components'])} component)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
