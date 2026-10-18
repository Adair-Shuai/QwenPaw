#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify the actual signed update payloads before upload or promotion."""

from __future__ import annotations

import argparse
import hashlib
import json
import mmap
import os
import stat
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlsplit

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from packaging.version import Version

from component_common import decode_base64, safe_relative_path, sha256_file
from component_manifest import validate_manifest
from verify_component_artifacts import _archive_limits, _is_preserved


def _verify_signature(
    path: Path,
    signature: str,
    key: Ed25519PublicKey,
) -> None:
    with path.open("rb") as stream:
        with mmap.mmap(stream.fileno(), 0, access=mmap.ACCESS_READ) as data:
            key.verify(decode_base64(signature, label="signature"), data)


def _artifact_path(root: Path, base_url: str, url: str) -> Path:
    base, target = urlsplit(base_url.rstrip("/") + "/"), urlsplit(url)
    if (
        (base.scheme, base.netloc) != (target.scheme, target.netloc)
        or target.query
        or target.fragment
        or not target.path.startswith(base.path)
    ):
        raise ValueError("artifact URL is outside the release base")
    relative = unquote(target.path[len(base.path) :])
    if safe_relative_path(relative) != relative:
        raise ValueError("artifact URL is not a canonical relative path")
    path = root / relative
    if not path.resolve().is_relative_to(root.resolve()) or path.is_symlink():
        raise ValueError("artifact path escapes the release root")
    return path


def _verify_payload(
    archive: zipfile.ZipFile,
    name: str,
    expected: dict,
) -> None:
    digest = hashlib.sha256()
    size = 0
    with archive.open(name) as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            size += len(chunk)
            digest.update(chunk)
    if size != expected["size"] or digest.hexdigest() != expected["sha256"]:
        raise ValueError(f"artifact payload differs from manifest: {name}")


def _verify_archive(
    path: Path,
    component: str,
    entry: dict,
    delta: dict | None,
) -> None:
    # pylint: disable=too-many-branches,too-many-boolean-expressions
    with zipfile.ZipFile(path) as archive:
        infos = archive.infolist()
        names = [info.filename for info in infos]
        limits = _archive_limits(component)
        if (
            len(names) != len(set(names))
            or len(infos) > limits[0]
            or sum(info.file_size for info in infos) > limits[1]
            or any(info.file_size > limits[2] for info in infos)
        ):
            raise ValueError("invalid archive inventory or size limits")
        for info in infos:
            if (
                info.is_dir()
                or safe_relative_path(info.filename) != info.filename
                or stat.S_IFMT(info.external_attr >> 16)
                not in (0, stat.S_IFREG)
            ):
                raise ValueError(
                    f"unsupported archive member: {info.filename}",
                )
            relative = (
                info.filename.removeprefix("files/")
                if delta is not None
                else info.filename
            )
            if component == "ugsci" and (
                relative == "visualization/data"
                or relative.startswith("visualization/data/")
            ):
                raise ValueError(
                    "UGSci visualization test data must not be published",
                )
        if delta is None:
            managed = {
                name
                for name in names
                if not _is_preserved(name, tuple(entry["preserve"]))
            }
            if managed != set(entry["files"]):
                raise ValueError(
                    f"full artifact inventory differs: {component}",
                )
            for name in managed:
                _verify_payload(archive, name, entry["files"][name])
            # Preserved defaults are allowed for a first install, but CRC
            # errors in them must still fail before publication.
            for name in set(names) - managed:
                with archive.open(name) as stream:
                    while stream.read(1024 * 1024):
                        pass
            return
        document = json.loads(archive.read("delta.json"))
        if (
            document.get("schema_version") != 1
            or document.get("component") != component
            or document.get("base_version") != delta["from"]
            or document.get("target_version") != entry["version"]
            or document.get("final_files") != entry["files"]
            or not isinstance(document.get("base_files"), dict)
        ):
            raise ValueError(f"delta identity/inventory differs: {component}")
        operations = {}
        for operation in ("add", "replace", "delete"):
            values = document.get(operation)
            if not isinstance(values, list) or any(
                not isinstance(p, str) for p in values
            ):
                raise ValueError("invalid delta operation list")
            if len(values) != len(set(values)):
                raise ValueError("duplicate delta operation")
            for name in values:
                if safe_relative_path(name) != name or _is_preserved(
                    name,
                    tuple(entry["preserve"]),
                ):
                    raise ValueError(
                        "delta modifies a preserved or unsafe path",
                    )
            operations[operation] = set(values)
        adds, replaces, deletes = (
            operations[key] for key in ("add", "replace", "delete")
        )
        before, after = set(document["base_files"]), set(entry["files"])
        if (
            adds & replaces
            or (adds | replaces) & deletes
            or adds != after - before
            or deletes != before - after
            or not replaces <= (before & after)
            or any(
                document["base_files"][name] != entry["files"][name]
                for name in (before & after) - replaces
            )
            or set(names)
            != {"delta.json", *(f"files/{name}" for name in adds | replaces)}
        ):
            raise ValueError(
                "delta operations cannot reconstruct target inventory",
            )
        for name in adds | replaces:
            _verify_payload(archive, f"files/{name}", entry["files"][name])


def verify_release(
    root: Path,
    manifest_path: Path,
    *,
    target: str,
    base_url: str,
    public_key: str,
) -> dict:
    key = Ed25519PublicKey.from_public_bytes(
        decode_base64(public_key, label="public key"),
    )
    _verify_signature(
        manifest_path,
        manifest_path.with_suffix(".json.sig").read_text().strip(),
        key,
    )
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    validate_manifest(
        manifest,
        expected_target=target,
        core_version=manifest["release_version"],
    )
    count = 0
    for component, entry in manifest["components"].items():
        if not isinstance(entry.get("full"), dict):
            raise ValueError(f"full fallback is required: {component}")
        for delta in [None, *entry.get("deltas", [])]:
            item = entry["full"] if delta is None else delta
            path = _artifact_path(root, base_url, item["url"])
            if (
                path.stat().st_size != item["size"]
                or sha256_file(path) != item["sha256"]
            ):
                raise ValueError(f"artifact size/hash mismatch: {component}")
            _verify_signature(path, item["signature"], key)
            _verify_archive(path, component, entry, delta)
            count += 1
    return {
        "target": target,
        "version": manifest["release_version"],
        "components": len(manifest["components"]),
        "artifacts": count,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release-root", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--target", required=True)
    parser.add_argument("--base-url", required=True)
    parser.add_argument(
        "--public-key",
        default=os.environ.get("COMPONENT_SIGNING_PUBLIC_KEY", ""),
    )
    args = parser.parse_args()
    policy = json.loads(
        Path(__file__)
        .with_name("component_compatibility.json")
        .read_text(encoding="utf-8"),
    )
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    if manifest.get("protocol_version") != policy[
        "protocol_version"
    ] or Version(
        manifest["core_min_version"],
    ) < Version(
        policy["core_min_version"],
    ):
        raise SystemExit(
            "release does not satisfy the desktop compatibility policy",
        )
    print(
        json.dumps(
            verify_release(
                args.release_root,
                args.manifest,
                target=args.target,
                base_url=args.base_url,
                public_key=args.public_key,
            ),
        ),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
