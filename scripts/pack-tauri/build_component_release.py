#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build and sign complete managed-plugin component release artifacts."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import re
import zipfile
from datetime import timedelta
from datetime import datetime, timezone
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from component_common import (
    DEFAULT_PRESERVE_PATHS,
    canonical_json,
    decode_base64,
    file_inventory,
    read_plugin_metadata,
    verify_private_key_public_key,
)
from build_component_delta import write_delta
from component_manifest import validate_manifest

_RELEASE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
_MAX_ARCHIVE_MEMBERS = 10_000
_MAX_ARCHIVE_BYTES = 768 * 1024 * 1024
_MAX_MEMBER_BYTES = 128 * 1024 * 1024


def _private_key(value: str) -> Ed25519PrivateKey:
    raw = decode_base64(value, label="component Ed25519 private key")
    if len(raw) != 32:
        raise ValueError(
            "component Ed25519 private key must contain 32 raw bytes",
        )
    private = Ed25519PrivateKey.from_private_bytes(raw)
    verify_private_key_public_key(
        private,
        os.environ.get("COMPONENT_SIGNING_PUBLIC_KEY", ""),
    )
    return private


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _sign(path: Path, private: Ed25519PrivateKey) -> str:
    signature = base64.b64encode(private.sign(path.read_bytes())).decode(
        "ascii",
    )
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
    release_version: str,
    release_sequence: int,
    release_attempt: int,
    manifest_url: str,
    manifest_path: Path,
    manifest_signature: str,
    history_url: str,
    history_path: Path,
    history_signature: str,
    private: Ed25519PrivateKey,
) -> None:
    published_at = datetime.now(timezone.utc)
    payload = {
        "schema_version": 1,
        "target": target,
        "release_id": release_id,
        "release_version": release_version,
        "release_sequence": release_sequence,
        "release_attempt": release_attempt,
        "manifest_url": manifest_url,
        "manifest_size": manifest_path.stat().st_size,
        "manifest_sha256": _sha256(manifest_path),
        "manifest_signature": manifest_signature,
        "history_url": history_url,
        "history_size": history_path.stat().st_size,
        "history_sha256": _sha256(history_path),
        "history_signature": history_signature,
        "published_at": published_at.isoformat().replace("+00:00", "Z"),
        "expires_at": (published_at + timedelta(days=30))
        .isoformat()
        .replace("+00:00", "Z"),
    }
    pointer = dict(payload)
    pointer["signature"] = base64.b64encode(
        private.sign(canonical_json(payload)),
    ).decode("ascii")
    temporary = output.with_name(f".{output.name}.tmp")
    temporary.write_bytes(canonical_json(pointer))
    os.replace(temporary, output)


def _verify_signed_file(
    path: Path,
    signature_path: Path,
    private: Ed25519PrivateKey,
) -> None:
    private.public_key().verify(
        base64.b64decode(
            signature_path.read_text(encoding="utf-8").strip(),
            validate=True,
        ),
        path.read_bytes(),
    )


def _write_history(
    output: Path,
    *,
    target: str,
    release_id: str,
    release_version: str,
    release_sequence: int,
    release_attempt: int,
    manifest_url: str,
    manifest_path: Path,
    manifest_signature: str,
    private: Ed25519PrivateKey,
    history_input: Path | None,
    history_signature_input: Path | None,
    history_count: int,
) -> str:
    if not 1 <= history_count <= 10:
        raise ValueError("history_count must be between 1 and 10")
    if not _RELEASE_ID.fullmatch(release_id):
        raise ValueError("release_id is unsafe for component history")
    current = {
        "target": target,
        "release_id": release_id,
        "release_version": release_version,
        "release_sequence": release_sequence,
        "release_attempt": release_attempt,
        "manifest_url": manifest_url,
        "manifest_size": manifest_path.stat().st_size,
        "manifest_sha256": _sha256(manifest_path),
        "manifest_signature": manifest_signature,
    }
    releases = [current]
    if history_input is not None and history_input.is_file():
        if (
            history_signature_input is None
            or not history_signature_input.is_file()
        ):
            raise ValueError(
                "previous component history signature is required",
            )
        _verify_signed_file(history_input, history_signature_input, private)
        previous = json.loads(history_input.read_text(encoding="utf-8"))
        if (
            not isinstance(previous, dict)
            or previous.get("schema_version") != 1
            or previous.get("target") != target
            or not isinstance(previous.get("releases"), list)
        ):
            raise ValueError("previous component history is invalid")
        seen = {release_id}
        for entry in previous["releases"]:
            if not isinstance(entry, dict):
                raise ValueError("previous component history entry is invalid")
            previous_id = entry.get("release_id")
            if not isinstance(previous_id, str) or not _RELEASE_ID.fullmatch(
                previous_id,
            ):
                raise ValueError(
                    "previous component history release id is invalid",
                )
            if entry.get("target") != target:
                raise ValueError("previous component history target mismatch")
            if previous_id not in seen:
                releases.append(entry)
                seen.add(previous_id)
            if len(releases) >= history_count:
                break
    payload = {
        "schema_version": 1,
        "target": target,
        "releases": releases[:history_count],
    }
    temporary = output.with_name(f".{output.name}.tmp")
    temporary.write_bytes(canonical_json(payload))
    os.replace(temporary, output)
    return _sign(output, private)


def _validate_archive(path: Path) -> None:
    with zipfile.ZipFile(path) as archive:
        infos = archive.infolist()
        if len(infos) > _MAX_ARCHIVE_MEMBERS:
            raise ValueError("component archive contains too many members")
        if sum(info.file_size for info in infos) > _MAX_ARCHIVE_BYTES:
            raise ValueError("component archive is too large")
        if any(info.file_size > _MAX_MEMBER_BYTES for info in infos):
            raise ValueError("component archive member is too large")


def _full_zip(source: Path, output: Path) -> None:
    temporary = output.with_name(f".{output.name}.tmp")
    with zipfile.ZipFile(
        temporary,
        "w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=9,
    ) as archive:
        # Full packages include default engines for first installation, while
        # the managed inventory deliberately excludes engines as user data.
        for path in sorted(
            item for item in source.rglob("*") if item.is_file()
        ):
            relative = path.relative_to(source).as_posix()
            info = zipfile.ZipInfo(relative, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, path.read_bytes())
    os.replace(temporary, output)


def _base_sources(base_root: Path | None, source_name: str) -> list[Path]:
    if base_root is None or not base_root.exists():
        return []
    direct = base_root / source_name
    if (direct / "plugin.json").is_file():
        return [direct]
    return sorted(
        candidate / source_name
        for candidate in base_root.iterdir()
        if candidate.is_dir()
        and (candidate / source_name / "plugin.json").is_file()
    )


def build_release(
    source_root: Path,
    output_root: Path,
    *,
    product: str,
    channel: str,
    target: str,
    core_min_version: str,
    base_url: str,
    private_key_b64: str,
    base_root: Path | None = None,
    release_id: str | None = None,
    release_version: str | None = None,
    release_sequence: int = 0,
    release_attempt: int = 0,
    delta_max_ratio: float = 0.8,
    history_input: Path | None = None,
    history_signature_input: Path | None = None,
    history_count: int = 10,
) -> Path:
    # pylint: disable=too-many-statements
    if not 0 < delta_max_ratio < 1:
        raise ValueError(
            "delta_max_ratio must be greater than 0 and less than 1",
        )
    if not 1 <= history_count <= 10:
        raise ValueError("history_count must be between 1 and 10")
    private = _private_key(private_key_b64)
    components: dict[str, dict] = {}
    artifact_root = output_root / "artifacts" / "components" / target
    artifact_root.mkdir(parents=True, exist_ok=True)
    seen_components: set[str] = set()
    for source in sorted(
        path
        for path in source_root.iterdir()
        if path.is_dir() and (path / "plugin.json").is_file()
    ):
        component, version = read_plugin_metadata(source)
        plugin_metadata = json.loads(
            (source / "plugin.json").read_text(encoding="utf-8-sig"),
        )
        preserve_paths = tuple(
            dict.fromkeys(
                [
                    *DEFAULT_PRESERVE_PATHS,
                    *plugin_metadata.get("component_update", {}).get(
                        "preserve",
                        [],
                    ),
                ],
            ),
        )
        if component in seen_components:
            raise ValueError(
                f"duplicate component id in release source: {component}",
            )
        seen_components.add(component)
        component_dir = artifact_root / component / version
        component_dir.mkdir(parents=True, exist_ok=True)
        artifact = component_dir / "full.zip"
        _full_zip(source, artifact)
        _validate_archive(artifact)
        signature = _sign(artifact, private)
        relative_url = (
            f"artifacts/components/{target}/{component}/{version}/full.zip"
        )
        deltas: list[dict] = []
        seen_base_versions: set[str] = set()
        for base_source in _base_sources(base_root, source.name):
            base_component, base_version = read_plugin_metadata(base_source)
            if (
                base_component != component
                or base_version == version
                or base_version in seen_base_versions
            ):
                continue
            base_metadata = json.loads(
                (base_source / "plugin.json").read_text(encoding="utf-8-sig"),
            )
            base_preserve = tuple(
                dict.fromkeys(
                    [
                        *DEFAULT_PRESERVE_PATHS,
                        *base_metadata.get("component_update", {}).get(
                            "preserve",
                            [],
                        ),
                    ],
                ),
            )
            if base_preserve != preserve_paths:
                continue
            seen_base_versions.add(base_version)
            delta_dir = artifact_root / component / f"{base_version}-{version}"
            delta_dir.mkdir(parents=True, exist_ok=True)
            delta_artifact = delta_dir / "delta.zip"
            write_delta(base_source, source, delta_artifact, preserve_paths)
            _validate_archive(delta_artifact)
            if (
                delta_artifact.stat().st_size
                >= artifact.stat().st_size * delta_max_ratio
            ):
                delta_artifact.unlink()
                delta_dir.rmdir()
                continue
            delta_signature = _sign(delta_artifact, private)
            delta_url = (
                f"artifacts/components/{target}/{component}/"
                f"{base_version}-{version}/delta.zip"
            )
            deltas.append(
                {
                    "from": base_version,
                    "url": f"{base_url.rstrip('/')}/{delta_url}",
                    "size": delta_artifact.stat().st_size,
                    "sha256": _sha256(delta_artifact),
                    "signature": delta_signature,
                },
            )
        components[component] = {
            "kind": "directory",
            "version": version,
            "min_core_version": core_min_version,
            "preserve": list(preserve_paths),
            "files": file_inventory(source, preserve_paths),
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
    manifest_name = (
        f"{target}-{release_id}.json" if release_id else f"{target}.json"
    )
    validate_manifest(
        manifest,
        expected_target=target,
        core_version=core_min_version,
    )
    manifest_path = metadata / manifest_name
    manifest_path.write_bytes(canonical_json(manifest))
    manifest_signature = _sign(manifest_path, private)
    if release_id:
        manifest_url = f"{base_url.rstrip('/')}/metadata/components/{channel}/{manifest_name}"
        history_path = metadata / f"{target}-{release_id}.history.json"
        history_signature = _write_history(
            history_path,
            target=target,
            release_id=release_id,
            release_version=release_version or core_min_version,
            release_sequence=release_sequence,
            release_attempt=release_attempt,
            manifest_url=manifest_url,
            manifest_path=manifest_path,
            manifest_signature=manifest_signature,
            private=private,
            history_input=history_input,
            history_signature_input=history_signature_input,
            history_count=history_count,
        )
        pointer_path = metadata / f"{target}.current.json"
        _write_signed_pointer(
            pointer_path,
            target=target,
            release_id=release_id,
            release_version=release_version or core_min_version,
            release_sequence=release_sequence,
            release_attempt=release_attempt,
            manifest_url=manifest_url,
            manifest_path=manifest_path,
            manifest_signature=manifest_signature,
            history_url=(
                f"{base_url.rstrip('/')}/metadata/components/{channel}/"
                f"{history_path.name}"
            ),
            history_path=history_path,
            history_signature=history_signature,
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
    parser.add_argument(
        "--private-key",
        default=os.environ.get("COMPONENT_SIGNING_PRIVATE_KEY", ""),
    )
    parser.add_argument("--release-id")
    parser.add_argument("--release-version")
    parser.add_argument("--release-sequence", type=int, default=0)
    parser.add_argument("--release-attempt", type=int, default=0)
    parser.add_argument("--delta-max-ratio", type=float, default=0.8)
    parser.add_argument("--history-input", type=Path)
    parser.add_argument("--history-signature-input", type=Path)
    parser.add_argument("--history-count", type=int, default=10)
    args = parser.parse_args()
    if not args.private_key:
        raise SystemExit(
            "COMPONENT_SIGNING_PRIVATE_KEY or --private-key is required",
        )
    path = build_release(
        args.source_root.resolve(),
        args.output_root.resolve(),
        product=args.product,
        channel=args.channel,
        target=args.target,
        core_min_version=args.core_min_version,
        base_url=args.base_url,
        private_key_b64=args.private_key,
        base_root=args.base_root.resolve() if args.base_root else None,
        release_id=args.release_id,
        release_version=args.release_version,
        release_sequence=args.release_sequence,
        release_attempt=args.release_attempt,
        delta_max_ratio=args.delta_max_ratio,
        history_input=(
            args.history_input.resolve() if args.history_input else None
        ),
        history_signature_input=(
            args.history_signature_input.resolve()
            if args.history_signature_input
            else None
        ),
        history_count=args.history_count,
    )
    print(f"wrote signed component release: {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
