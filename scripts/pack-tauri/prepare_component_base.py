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
import hashlib
import json
import os
import re
import shutil
import tempfile
import urllib.error
import urllib.request
from urllib.parse import urljoin, urlparse
import zipfile
from pathlib import Path, PurePosixPath

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from component_common import (
    DEFAULT_PRESERVE_PATHS,
    canonical_json,
    decode_base64,
    file_inventory,
    read_component_metadata,
    safe_relative_path,
    sha256_file,
    verify_private_key_public_key,
)

_MAX_MEMBERS = 10_000
_MAX_TOTAL_BYTES = 768 * 1024 * 1024
_MAX_MEMBER_BYTES = 128 * 1024 * 1024
_LARGE_DIRECTORY_ARCHIVE_LIMITS = {
    "python-packages": (150_000, 6 * 1024**3, 1024**3),
}
_RELEASE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")


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


def _safe_extract(
    archive_bytes: bytes,
    destination: Path,
    *,
    component: str,
) -> None:
    with zipfile.ZipFile(__import__("io").BytesIO(archive_bytes)) as archive:
        infos = archive.infolist()
        names = [info.filename for info in infos]
        max_members, max_bytes, max_member_bytes = (
            _LARGE_DIRECTORY_ARCHIVE_LIMITS.get(
                component,
                (_MAX_MEMBERS, _MAX_TOTAL_BYTES, _MAX_MEMBER_BYTES),
            )
        )
        if len(names) > max_members or len(set(names)) != len(names):
            raise ValueError("previous full artifact has invalid members")
        if sum(info.file_size for info in infos) > max_bytes:
            raise ValueError("previous full artifact is too large")
        for info in infos:
            if info.is_dir() or info.file_size > max_member_bytes:
                raise ValueError(
                    "previous full artifact contains an unsafe member",
                )
            relative = safe_relative_path(info.filename)
            candidate = (destination / PurePosixPath(relative)).resolve()
            candidate.relative_to(destination.resolve())
            candidate.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(info) as source, candidate.open("wb") as target:
                shutil.copyfileobj(source, target, length=1024 * 1024)


def _restore_inventory_modes(
    root: Path,
    inventory: object,
) -> None:
    """Restore signed modes that portable ZIP extraction does not preserve."""
    if not isinstance(inventory, dict):
        raise ValueError("previous component inventory is invalid")
    resolved_root = root.resolve()
    for relative, metadata in inventory.items():
        normalized = safe_relative_path(str(relative))
        if normalized != relative or not isinstance(metadata, dict):
            raise ValueError("previous component inventory is invalid")
        mode = metadata.get("mode")
        if type(mode) is not int or not 0 <= mode <= 0o7777:
            raise ValueError("previous component inventory mode is invalid")
        target = (resolved_root / PurePosixPath(normalized)).resolve()
        try:
            target.relative_to(resolved_root)
        except ValueError as exc:
            raise ValueError(
                "previous component inventory path escapes root",
            ) from exc
        if not target.is_file() or target.is_symlink():
            raise ValueError(
                f"previous component inventory file is missing: {relative}",
            )
        target.chmod(mode)


def prepare_base(
    source_root: Path,
    base_root: Path,
    *,
    manifest_url: str,
    private_key_b64: str,
    expected_target: str | None = None,
    allow_missing: bool = True,
) -> bool:
    # pylint: disable=too-many-branches,too-many-statements
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
            or (item / "component.json").is_file()
        ):
            component, _, _ = read_component_metadata(source)
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
            _safe_extract(
                artifact,
                component_base,
                component=component,
            )
            _restore_inventory_modes(component_base, entry.get("files"))
            installed_id, installed_version, _ = read_component_metadata(
                component_base,
            )
            if installed_id != component or installed_version != str(
                entry["version"],
            ):
                raise ValueError(
                    f"previous artifact identity mismatch for {component}",
                )
            preserve_value = entry.get("preserve")
            preserve_paths = (
                tuple(preserve_value)
                if isinstance(preserve_value, (list, tuple))
                else DEFAULT_PRESERVE_PATHS
            )
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


def prepare_bases(
    source_root: Path,
    base_root: Path,
    *,
    pointer_url: str,
    private_key_b64: str,
    expected_target: str,
    history_count: int = 10,
    history_output: Path | None = None,
    history_signature_output: Path | None = None,
) -> int:
    # pylint: disable=too-many-branches,too-many-statements
    """Prepare the bases bound to the currently signed pointer."""
    if not 1 <= history_count <= 10:
        raise ValueError("history_count must be between 1 and 10")
    private = _private_key(private_key_b64)
    try:
        pointer_raw = _get(pointer_url)
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            base_root.mkdir(parents=True, exist_ok=True)
            return 0
        raise
    pointer = json.loads(pointer_raw.decode("utf-8"))
    required = {"schema_version", "target", "release_id", "signature"}
    if (
        not isinstance(pointer, dict)
        or pointer.get("schema_version") != 1
        or not required.issubset(pointer)
        or pointer.get("target") != expected_target
    ):
        raise ValueError("component pointer is invalid")
    payload = dict(pointer)
    payload.pop("signature", None)
    _verify(canonical_json(payload), str(pointer["signature"]), private)
    history_fields = {
        "history_url",
        "history_size",
        "history_sha256",
        "history_signature",
    }
    if not history_fields.issubset(pointer):
        release_id = pointer.get("release_id")
        if not isinstance(release_id, str) or not _RELEASE_ID.fullmatch(
            release_id,
        ):
            raise ValueError("legacy component pointer release id is invalid")
        found = prepare_base(
            source_root,
            base_root / release_id,
            manifest_url=pointer_url,
            private_key_b64=private_key_b64,
            expected_target=expected_target,
        )
        entry = {
            key: pointer[key]
            for key in (
                "target",
                "release_id",
                "release_version",
                "release_sequence",
                "release_attempt",
                "manifest_url",
                "manifest_size",
                "manifest_sha256",
                "manifest_signature",
            )
            if key in pointer
        }
        legacy_history = {
            "schema_version": 1,
            "target": expected_target,
            "releases": [entry],
        }
        legacy_raw = canonical_json(legacy_history)
        legacy_signature = base64.b64encode(private.sign(legacy_raw)).decode(
            "ascii",
        )
        if history_output is not None:
            history_output.parent.mkdir(parents=True, exist_ok=True)
            history_output.write_bytes(legacy_raw)
        if history_signature_output is not None:
            history_signature_output.parent.mkdir(parents=True, exist_ok=True)
            history_signature_output.write_text(
                legacy_signature + "\n",
                encoding="utf-8",
            )
        return int(found)
    history_url = urljoin(pointer_url, str(pointer["history_url"]))
    pointer_host = urlparse(pointer_url)
    history_host = urlparse(history_url)
    if (
        history_host.scheme != pointer_host.scheme
        or history_host.netloc != pointer_host.netloc
    ):
        raise ValueError("component history host mismatch")
    history_raw = _get(history_url)
    if (
        type(pointer.get("history_size")) is not int
        or len(history_raw) != pointer["history_size"]
    ):
        raise ValueError("component history size mismatch")
    if (
        hashlib.sha256(history_raw).hexdigest().lower()
        != str(pointer["history_sha256"]).lower()
    ):
        raise ValueError("component history hash mismatch")
    _verify(history_raw, str(pointer["history_signature"]), private)
    history = json.loads(history_raw.decode("utf-8"))
    entries = history.get("releases") if isinstance(history, dict) else None
    if (
        history.get("schema_version") != 1
        or history.get("target") != expected_target
        or not isinstance(entries, list)
        or not entries
    ):
        raise ValueError("component history is invalid")
    head = entries[0]
    if (
        not isinstance(head, dict)
        or head.get("release_id") != pointer.get("release_id")
        or head.get("manifest_url") != pointer.get("manifest_url")
        or head.get("manifest_sha256") != pointer.get("manifest_sha256")
    ):
        raise ValueError(
            "component history head does not match current pointer",
        )
    if history_output is not None:
        history_output.parent.mkdir(parents=True, exist_ok=True)
        history_output.write_bytes(history_raw)
    if history_signature_output is not None:
        history_signature_output.parent.mkdir(parents=True, exist_ok=True)
        history_signature_output.write_text(
            str(pointer["history_signature"]) + "\n",
            encoding="utf-8",
        )
    prepared = 0
    seen: set[str] = set()
    for entry in entries[:history_count]:
        release_id = (
            entry.get("release_id") if isinstance(entry, dict) else None
        )
        if (
            not isinstance(release_id, str)
            or not _RELEASE_ID.fullmatch(release_id)
            or release_id in seen
        ):
            raise ValueError("component history release id is invalid")
        seen.add(release_id)
        if entry.get("target") != expected_target:
            raise ValueError("component history release target mismatch")
        manifest_url = str(entry.get("manifest_url", ""))
        parsed = urlparse(manifest_url)
        if (
            parsed.scheme != pointer_host.scheme
            or parsed.netloc != pointer_host.netloc
        ):
            raise ValueError("component history manifest host mismatch")
        manifest_raw = _get(manifest_url)
        if (
            type(entry.get("manifest_size")) is not int
            or len(manifest_raw) != entry["manifest_size"]
            or hashlib.sha256(manifest_raw).hexdigest().lower()
            != str(entry.get("manifest_sha256", "")).lower()
        ):
            raise ValueError("component history manifest digest mismatch")
        manifest_signature = (
            _get(f"{manifest_url}.sig").decode("utf-8").strip()
        )
        if (
            manifest_signature
            != str(entry.get("manifest_signature", "")).strip()
        ):
            raise ValueError("component history manifest signature mismatch")
        if prepare_base(
            source_root,
            base_root / release_id,
            manifest_url=manifest_url,
            private_key_b64=private_key_b64,
            expected_target=expected_target,
            allow_missing=False,
        ):
            prepared += 1
    return prepared


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--base-root", type=Path, required=True)
    parser.add_argument("--manifest-url", required=True)
    parser.add_argument("--history-count", type=int, default=10)
    parser.add_argument("--history-output", type=Path)
    parser.add_argument("--history-signature-output", type=Path)
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
    count = prepare_bases(
        args.source_root.resolve(),
        args.base_root.resolve(),
        pointer_url=args.manifest_url,
        private_key_b64=args.private_key,
        expected_target=args.target,
        history_count=args.history_count,
        history_output=(
            args.history_output.resolve() if args.history_output else None
        ),
        history_signature_output=(
            args.history_signature_output.resolve()
            if args.history_signature_output
            else None
        ),
    )
    print(f"prepared {count} historical component base(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
