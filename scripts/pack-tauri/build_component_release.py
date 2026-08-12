#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build and sign complete managed-plugin component release artifacts."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import zipfile
from datetime import timedelta
from datetime import datetime, timezone
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from component_common import canonical_json, file_inventory, iter_files, read_plugin_metadata
from build_component_delta import write_delta


def _private_key(value: str) -> Ed25519PrivateKey:
    raw = base64.b64decode(value.strip(), validate=True)
    if len(raw) != 32:
        raise ValueError("component Ed25519 private key must contain 32 raw bytes")
    return Ed25519PrivateKey.from_private_bytes(raw)


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _sign(path: Path, private: Ed25519PrivateKey) -> str:
    signature = base64.b64encode(private.sign(path.read_bytes())).decode("ascii")
    signature_path = path.with_name(path.name + ".sig")
    temporary = signature_path.with_name(f".{signature_path.name}.tmp")
    temporary.write_text(signature + "\n", encoding="utf-8")
    os.replace(temporary, signature_path)
    return signature


def _write_signed_pointer(
    output: Path,
    *,
    target: str,
    release_id: str,
    manifest_url: str,
    manifest_path: Path,
    manifest_signature: str,
    private: Ed25519PrivateKey,
) -> None:
    published_at = datetime.now(timezone.utc)
    payload = {
        "schema_version": 1,
        "target": target,
        "release_id": release_id,
        "manifest_url": manifest_url,
        "manifest_size": manifest_path.stat().st_size,
        "manifest_sha256": _sha256(manifest_path),
        "manifest_signature": manifest_signature,
        "published_at": published_at.isoformat().replace("+00:00", "Z"),
        "expires_at": (published_at + timedelta(days=30)).isoformat().replace("+00:00", "Z"),
    }
    pointer = dict(payload)
    pointer["signature"] = base64.b64encode(
        private.sign(canonical_json(payload)),
    ).decode("ascii")
    temporary = output.with_name(f".{output.name}.tmp")
    temporary.write_bytes(canonical_json(pointer))
    os.replace(temporary, output)


def _full_zip(source: Path, output: Path) -> None:
    temporary = output.with_name(f".{output.name}.tmp")
    with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        # Full packages include default engines for first installation, while
        # the managed inventory deliberately excludes engines as user data.
        for path in sorted(item for item in source.rglob("*") if item.is_file()):
            relative = path.relative_to(source).as_posix()
            info = zipfile.ZipInfo(relative, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, path.read_bytes())
    os.replace(temporary, output)


def build_release(source_root: Path, output_root: Path, *, product: str, channel: str, target: str, core_min_version: str, base_url: str, private_key_b64: str, base_root: Path | None = None, release_id: str | None = None) -> Path:
    private = _private_key(private_key_b64)
    components: dict[str, dict] = {}
    artifact_root = output_root / "artifacts" / "components" / target
    artifact_root.mkdir(parents=True, exist_ok=True)
    seen_components: set[str] = set()
    for source in sorted(path for path in source_root.iterdir() if path.is_dir() and (path / "plugin.json").is_file()):
        component, version = read_plugin_metadata(source)
        if component in seen_components:
            raise ValueError(f"duplicate component id in release source: {component}")
        seen_components.add(component)
        component_dir = artifact_root / component / version
        component_dir.mkdir(parents=True, exist_ok=True)
        artifact = component_dir / "full.zip"
        _full_zip(source, artifact)
        signature = _sign(artifact, private)
        relative_url = f"artifacts/components/{target}/{component}/{version}/full.zip"
        deltas: list[dict] = []
        base_source = base_root / source.name if base_root is not None else None
        if base_source is not None and (base_source / "plugin.json").is_file():
            base_component, base_version = read_plugin_metadata(base_source)
            if base_component == component and base_version != version:
                delta_dir = artifact_root / component / f"{base_version}-{version}"
                delta_dir.mkdir(parents=True, exist_ok=True)
                delta_artifact = delta_dir / "delta.zip"
                write_delta(base_source, source, delta_artifact)
                delta_signature = _sign(delta_artifact, private)
                delta_url = f"artifacts/components/{target}/{component}/{base_version}-{version}/delta.zip"
                deltas.append({
                    "from": base_version,
                    "url": f"{base_url.rstrip('/')}/{delta_url}",
                    "size": delta_artifact.stat().st_size,
                    "sha256": _sha256(delta_artifact),
                    "signature": delta_signature,
                })
        components[component] = {
            "kind": "directory",
            "version": version,
            "min_core_version": core_min_version,
            "files": file_inventory(source),
            "full": {
                "url": f"{base_url.rstrip('/')}/{relative_url}",
                "size": artifact.stat().st_size,
                "sha256": _sha256(artifact),
                "signature": signature,
            },
            "deltas": deltas,
        }
    manifest = {
        "schema_version": 1,
        "product": product,
        "channel": channel,
        "target": target,
        "core_min_version": core_min_version,
        "generated_at": os.environ.get(
            "SOURCE_DATE_EPOCH",
            datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        ),
        "components": components,
    }
    metadata = output_root / "metadata" / "components" / channel
    metadata.mkdir(parents=True, exist_ok=True)
    manifest_name = f"{target}-{release_id}.json" if release_id else f"{target}.json"
    manifest_path = metadata / manifest_name
    manifest_path.write_bytes(canonical_json(manifest))
    manifest_signature = _sign(manifest_path, private)
    if release_id:
        pointer_path = metadata / f"{target}.current.json"
        _write_signed_pointer(
            pointer_path,
            target=target,
            release_id=release_id,
            manifest_url=f"{base_url.rstrip('/')}/metadata/components/{channel}/{manifest_name}",
            manifest_path=manifest_path,
            manifest_signature=manifest_signature,
            private=private,
        )
    return manifest_path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--base-root", type=Path)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--product", default="qwenpaw")
    parser.add_argument("--channel", default="stable")
    parser.add_argument("--target", required=True)
    parser.add_argument("--core-min-version", required=True)
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--private-key", default=os.environ.get("COMPONENT_SIGNING_PRIVATE_KEY", ""))
    parser.add_argument("--release-id")
    args = parser.parse_args()
    if not args.private_key:
        raise SystemExit("COMPONENT_SIGNING_PRIVATE_KEY or --private-key is required")
    path = build_release(args.source_root.resolve(), args.output_root.resolve(), product=args.product, channel=args.channel, target=args.target, core_min_version=args.core_min_version, base_url=args.base_url, private_key_b64=args.private_key, base_root=args.base_root.resolve() if args.base_root else None, release_id=args.release_id)
    print(f"wrote signed component release: {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
