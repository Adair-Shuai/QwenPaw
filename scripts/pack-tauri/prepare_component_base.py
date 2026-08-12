#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fetch and verify the previous component release for delta generation.

The previous signed Manifest is read before a new release is published.  Its
full artifacts are downloaded, independently signature-checked and extracted
into a safe base tree consumed by ``build_component_release.py --base-root``.
Missing history is a supported first-release case; all other failures are
fatal so a bad base can never produce a misleading delta.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import shutil
import tempfile
import urllib.error
import urllib.request
from urllib.parse import urljoin, urlparse
import zipfile
from pathlib import Path, PurePosixPath

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from component_common import (
    file_inventory,
    read_plugin_metadata,
    safe_relative_path,
    sha256_file,
)

_MAX_MEMBERS = 10_000
_MAX_TOTAL_BYTES = 512 * 1024 * 1024
_MAX_MEMBER_BYTES = 128 * 1024 * 1024


def _private_key(value: str) -> Ed25519PrivateKey:
    raw = base64.b64decode(value.strip(), validate=True)
    if len(raw) != 32:
        raise ValueError(
            "component Ed25519 private key must contain 32 raw bytes",
        )
    return Ed25519PrivateKey.from_private_bytes(raw)


def _verify(data: bytes, signature: str, private: Ed25519PrivateKey) -> None:
    try:
        public = private.public_key()
        public.verify(base64.b64decode(signature.strip(), validate=True), data)
    except Exception as exc:  # noqa: BLE001
        raise ValueError(
            "previous component signature verification failed",
        ) from exc


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):  # type: ignore[no-untyped-def]
        raise ValueError(
            f"component base download must not redirect: {newurl}",
        )


_HTTP_OPENER = urllib.request.build_opener(_NoRedirect)


def _get(url: str) -> bytes:
    parsed = urlparse(url)
    if parsed.scheme not in {"https", "http"} or not parsed.netloc:
        raise ValueError(f"unsupported component URL: {url!r}")
    if parsed.scheme == "http" and parsed.hostname not in {
        "127.0.0.1",
        "localhost",
        "::1",
    }:
        raise ValueError("component base downloads require HTTPS")
    request = urllib.request.Request(
        url,
        headers={"Cache-Control": "no-cache"},
    )
    with _HTTP_OPENER.open(request, timeout=60) as response:  # noqa: S310
        return response.read()


def _safe_extract(archive_bytes: bytes, destination: Path) -> None:
    with zipfile.ZipFile(__import__("io").BytesIO(archive_bytes)) as archive:
        infos = archive.infolist()
        names = [info.filename for info in infos]
        if len(names) > _MAX_MEMBERS or len(set(names)) != len(names):
            raise ValueError("previous full artifact has invalid members")
        if sum(info.file_size for info in infos) > _MAX_TOTAL_BYTES:
            raise ValueError("previous full artifact is too large")
        for info in infos:
            if info.is_dir() or info.file_size > _MAX_MEMBER_BYTES:
                raise ValueError(
                    "previous full artifact contains an unsafe member",
                )
            relative = safe_relative_path(info.filename)
            candidate = (destination / PurePosixPath(relative)).resolve()
            candidate.relative_to(destination.resolve())
            candidate.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(info) as source, candidate.open("wb") as target:
                shutil.copyfileobj(source, target, length=1024 * 1024)


def prepare_base(
    source_root: Path,
    base_root: Path,
    *,
    manifest_url: str,
    private_key_b64: str,
    expected_target: str | None = None,
    allow_missing: bool = True,
) -> bool:
    """Populate *base_root* from the previous signed release.

    Returns ``True`` when a previous release was found and ``False`` for the
    supported first-release/missing-history case.
    """
    # pylint: disable=too-many-branches,too-many-statements
    private = _private_key(private_key_b64)
    try:
        manifest_raw = _get(manifest_url)
    except urllib.error.HTTPError as exc:
        if allow_missing and exc.code == 404:
            base_root.mkdir(parents=True, exist_ok=True)
            return False
        raise
    manifest_doc = json.loads(manifest_raw.decode("utf-8"))
    pointer_fields = {
        "schema_version",
        "target",
        "release_id",
        "manifest_url",
        "manifest_size",
        "manifest_sha256",
        "manifest_signature",
        "signature",
    }
    is_pointer = (
        isinstance(manifest_doc, dict)
        and manifest_doc.get("schema_version") == 1
        and pointer_fields.issubset(manifest_doc)
    )
    if is_pointer:
        if (
            expected_target is not None
            and manifest_doc.get("target") != expected_target
        ):
            raise ValueError("previous component pointer target mismatch")
        if (
            not isinstance(manifest_doc.get("release_id"), str)
            or not manifest_doc["release_id"]
        ):
            raise ValueError(
                "previous component pointer release id is invalid",
            )
        pointer_url = urlparse(manifest_url)
        resolved_manifest_url = urljoin(
            manifest_url,
            str(manifest_doc["manifest_url"]),
        )
        resolved = urlparse(resolved_manifest_url)
        if (
            resolved.scheme != pointer_url.scheme
            or resolved.netloc != pointer_url.netloc
        ):
            raise ValueError(
                "previous component pointer manifest host mismatch",
            )
        pointer_signature = str(manifest_doc.get("signature", ""))
        pointer_payload = dict(manifest_doc)
        pointer_payload.pop("signature", None)
        _verify(
            json.dumps(
                pointer_payload,
                ensure_ascii=False,
                sort_keys=True,
                separators=(",", ":"),
            ).encode("utf-8")
            + b"\n",
            pointer_signature,
            private,
        )
        manifest_url = resolved_manifest_url
        manifest_raw = _get(manifest_url)
        if (
            type(manifest_doc.get("manifest_size")) is not int
            or len(manifest_raw) != manifest_doc["manifest_size"]
        ):
            raise ValueError("previous component manifest size mismatch")
        import hashlib

        if (
            hashlib.sha256(manifest_raw).hexdigest().lower()
            != str(manifest_doc["manifest_sha256"]).lower()
        ):
            raise ValueError("previous component manifest hash mismatch")
        signature_raw = _get(f"{manifest_url}.sig")
        if (
            signature_raw.decode("utf-8").strip()
            != str(manifest_doc["manifest_signature"]).strip()
        ):
            raise ValueError("previous component manifest signature mismatch")
    else:
        signature_raw = _get(f"{manifest_url}.sig")
    _verify(manifest_raw, signature_raw.decode("utf-8"), private)
    manifest = json.loads(manifest_raw.decode("utf-8"))
    if not isinstance(manifest, dict) or manifest.get("schema_version") != 1:
        raise ValueError("previous component manifest is invalid")
    if (
        expected_target is not None
        and manifest.get("target") != expected_target
    ):
        raise ValueError("previous component manifest target mismatch")
    if not isinstance(manifest.get("components"), dict):
        raise ValueError("previous component manifest has no components")

    base_root.parent.mkdir(parents=True, exist_ok=True)
    temporary = Path(
        tempfile.mkdtemp(
            prefix=f".{base_root.name}-",
            dir=str(base_root.parent),
        ),
    )
    try:
        for source in sorted(
            item
            for item in source_root.iterdir()
            if (item / "plugin.json").is_file()
        ):
            component, _ = read_plugin_metadata(source)
            entry = manifest["components"].get(component)
            if not isinstance(entry, dict):
                continue
            full = entry.get("full")
            if not isinstance(full, dict):
                raise ValueError(
                    f"previous manifest has no full artifact for {component}",
                )
            artifact = _get(str(full["url"]))
            if len(artifact) != int(full["size"]):
                raise ValueError(
                    f"previous full artifact size mismatch for {component}",
                )
            artifact_path = temporary / f"{component}.zip"
            artifact_path.write_bytes(artifact)
            if (
                sha256_file(artifact_path).lower()
                != str(full["sha256"]).lower()
            ):
                raise ValueError(
                    f"previous full artifact hash mismatch for {component}",
                )
            _verify(artifact, str(full["signature"]), private)
            # Keep the source directory name because build_component_release
            # resolves bases by source.name, while still validating the
            # manifest/plugin ID independently.
            component_base = temporary / "tree" / source.name
            component_base.mkdir(parents=True)
            _safe_extract(artifact, component_base)
            installed_id, installed_version = read_plugin_metadata(
                component_base,
            )
            if installed_id != component or installed_version != str(
                entry["version"],
            ):
                raise ValueError(
                    f"previous artifact identity mismatch for {component}",
                )
            preserve_paths = tuple(entry.get("preserve") or ("engines",))
            if file_inventory(component_base, preserve_paths) != entry.get(
                "files",
            ):
                raise ValueError(
                    f"previous artifact inventory mismatch for {component}",
                )

        staged_tree = temporary / "tree"
        base_root.parent.mkdir(parents=True, exist_ok=True)
        if base_root.exists():
            shutil.rmtree(base_root)
        staged_tree.replace(base_root)
        return True
    finally:
        shutil.rmtree(temporary, ignore_errors=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--base-root", type=Path, required=True)
    parser.add_argument("--manifest-url", required=True)
    parser.add_argument("--target")
    parser.add_argument(
        "--private-key",
        default=os.environ.get("COMPONENT_SIGNING_PRIVATE_KEY", ""),
    )
    args = parser.parse_args()
    if not args.private_key:
        raise SystemExit(
            "COMPONENT_SIGNING_PRIVATE_KEY or --private-key is required",
        )
    found = prepare_base(
        args.source_root.resolve(),
        args.base_root.resolve(),
        manifest_url=args.manifest_url,
        private_key_b64=args.private_key,
        expected_target=args.target,
    )
    print(
        "previous component base prepared"
        if found
        else "no previous component release; full-only release",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
