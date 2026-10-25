"""Publish the app and signed updates together, preserving other products."""

# Release helpers are standalone scripts outside the Python package.
# pylint: disable=wrong-import-position

from __future__ import annotations

import base64
import copy
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import sys
from urllib.parse import urlsplit
from zipfile import ZipFile

import oss2
from packaging.version import Version

SCRIPTS = Path(__file__).resolve().parents[1] / "pack-tauri"
sys.path.insert(0, str(SCRIPTS))
from build_component_release import (  # noqa: E402
    _private_key,
    _sign,
    _write_history,
    _write_signed_pointer,
    build_release,
)
from check_component_pointer_promotion import (  # noqa: E402
    _load_verified,
    check_promotion,
)
from component_common import canonical_json  # noqa: E402
from component_manifest import validate_manifest  # noqa: E402
from verify_component_release import verify_release  # noqa: E402

APP = "storage-capacity"
PUBLIC_KEY = "T0VO6V4iNHzSxU3eV68N4nifjq2CqtDfMO0QPtH72mw="
EXPECTED = {
    "plugin.json",
    "README.md",
    "ui/index.js",
    "backend/__init__.py",
    "backend/main.py",
    "backend/evaluation.py",
    "backend/catalog.py",
    "backend/intake.py",
    "backend/methods.py",
    "backend/reports.py",
    "backend/service.py",
    "backend/workbench.py",
    "backend/workflow.py",
    "backend/assistant.py",
}


def digest(payload):
    return hashlib.sha256(payload).hexdigest()


def verify_app(archive, entry):
    """Check actual ZIP contents, not just filenames or the manifest entry."""
    payload = archive.read_bytes()
    if (
        digest(payload) != entry["sha256"]
        or len(payload) != entry["size_bytes"]
    ):
        raise ValueError("Application size or digest mismatch")
    with ZipFile(archive) as z:
        expected = {f"{APP}/{name}" for name in EXPECTED}
        if set(z.namelist()) != expected or len(z.namelist()) != len(expected):
            raise ValueError("Unexpected, missing or duplicate app files")
        if z.testzip() is not None:
            raise ValueError("Corrupt application archive")
        manifest = json.loads(z.read(f"{APP}/plugin.json"))
        for key in ("version", "qwenpaw_version"):
            if manifest[key] != entry[key]:
                raise ValueError(f"Application manifest mismatch: {key}")
        if manifest["id"] != APP or entry["plugin_id"] != APP:
            raise ValueError("Wrong application identity")
        # Every packaged member is read and checked against the reviewed tree.
        source = Path(__file__).resolve().parents[2] / "plugins/apps" / APP
        for name in EXPECTED:
            if z.read(f"{APP}/{name}") != (source / name).read_bytes():
                raise ValueError(f"Packaged source mismatch: {name}")
    return payload


def merge_catalog(old, new):
    if not isinstance(old.get("files"), dict) or not old["files"]:
        raise ValueError("Existing catalog must be valid and non-empty")
    if len(new.get("files", {})) != 1:
        raise ValueError("Only the storage application may be published")
    file_id, entry = next(iter(new["files"].items()))
    if entry["plugin_id"] != APP:
        raise ValueError("Wrong catalog application")
    existing = old["files"].get(file_id)
    if existing is not None and {
        k: v for k, v in existing.items() if k != "updated_at"
    } != {k: v for k, v in entry.items() if k != "updated_at"}:
        raise ValueError("Version already exists with different metadata")
    for item in old["files"].values():
        if item.get("plugin_id") == APP and Version(item["version"]) > Version(
            entry["version"]
        ):
            raise ValueError("Refusing application downgrade")
    result = copy.deepcopy(old)
    result["files"][file_id] = entry
    versions = (
        result.setdefault("platforms", {})
        .setdefault("apps", {})
        .setdefault("versions", [])
    )
    if file_id not in versions:
        versions.insert(0, file_id)
    result["updated_at"] = new["updated_at"]
    return result


def immutable(bucket, key, payload, content_type):
    try:
        current = bucket.get_object(key).read()
    except oss2.exceptions.NoSuchKey:
        bucket.put_object(
            key,
            payload,
            headers={
                "x-oss-forbid-overwrite": "true",
                "x-oss-object-acl": "public-read",
                "Content-Type": content_type,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        )
        current = bucket.get_object(key).read()
    if current != payload:
        raise ValueError(f"Immutable object collision: {key}")


def promote(bucket, updates, release_id):
    """Read back staging, compare snapshots, compensate any partial switch."""
    headers = {
        "x-oss-object-acl": "public-read",
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
    }
    for key, before, after in updates:
        staging = key + ".staging-" + release_id
        bucket.put_object(staging, after, headers=headers)
        if bucket.get_object(staging).read() != after:
            raise ValueError(f"Staging readback mismatch: {key}")
        if bucket.get_object(key).read() != before:
            raise ValueError(f"Metadata changed concurrently: {key}")
    switched = []
    try:
        for key, before, after in updates:
            if bucket.get_object(key).read() != before:
                raise ValueError(f"Metadata changed concurrently: {key}")
            # Include uncertain writes in compensation if the request fails.
            switched.append((key, before, after))
            bucket.put_object(key, after, headers=headers)
            if bucket.get_object(key).read() != after:
                raise ValueError(f"Promotion readback mismatch: {key}")
    except Exception as exc:
        failures = []
        for key, before, after in reversed(switched):
            try:
                current = bucket.get_object(key).read()
                if current not in (before, after):
                    raise ValueError(
                        "Concurrent change prevents compensation"
                    ) from exc
                bucket.put_object(key, before, headers=headers)
                if bucket.get_object(key).read() != before:
                    raise ValueError("Compensation readback mismatch") from exc
            except Exception as rollback:
                failures.append(f"{key}: {rollback}")
        if failures:
            raise RuntimeError(
                "Metadata compensation failed: " + "; ".join(failures)
            ) from exc
        raise


def key_for(url, base):
    parsed, allowed = urlsplit(url), urlsplit(base)
    if (
        parsed.scheme != "https"
        or parsed.netloc != allowed.netloc
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("Signed metadata URL is outside the release origin")
    key = parsed.path.lstrip("/")
    if ".." in PurePosixPath(key).parts or "\\" in key:
        raise ValueError("Unsafe signed metadata path")
    return key


def signed_document(bucket, pointer, label, base, private, folder):
    key = key_for(pointer[label + "_url"], base)
    payload = bucket.get_object(key).read()
    if (
        len(payload) != pointer[label + "_size"]
        or digest(payload) != pointer[label + "_sha256"]
    ):
        raise ValueError(f"Signed {label} digest mismatch")
    signature = bucket.get_object(key + ".sig").read().decode().strip()
    if signature != pointer[label + "_signature"]:
        raise ValueError(f"Signed {label} signature reference mismatch")
    private.public_key().verify(
        base64.b64decode(signature, validate=True), payload
    )
    path = folder / (label + ".json")
    path.write_bytes(payload)
    path.with_suffix(".json.sig").write_text(signature, encoding="utf-8")
    return path, json.loads(payload)


def prepare_target(
    bucket,
    root,
    stage,
    target,
    base,
    private_b64,
    release_id,
    sequence,
    attempt,
):
    folder = root / target
    folder.mkdir(parents=True, exist_ok=True)
    pointer_key = f"metadata/components/stable/{target}.current.json"
    before = bucket.get_object(pointer_key).read()
    old_pointer_path = folder / "pointer-before.json"
    old_pointer_path.write_bytes(before)
    private = _private_key(private_b64)
    old_pointer = _load_verified(old_pointer_path, private, target)
    _, old = signed_document(
        bucket, old_pointer, "manifest", base, private, folder
    )
    validate_manifest(
        old, expected_target=target, core_version=old["release_version"]
    )
    history_path, _ = signed_document(
        bucket, old_pointer, "history", base, private, folder
    )
    generated = build_release(
        stage,
        folder,
        product=old["product"],
        channel=old["channel"],
        target=target,
        core_min_version=old["core_min_version"],
        base_url=base,
        private_key_b64=private_b64,
        release_version=old["release_version"],
        protocol_version=old["protocol_version"],
    )
    # Full package content, signatures and file inventories are mandatory gates.
    verify_release(
        folder, generated, target=target, base_url=base, public_key=PUBLIC_KEY
    )
    single = json.loads(generated.read_bytes())
    incoming = single["components"][APP]
    previous = old["components"].get(APP)
    if previous and Version(incoming["version"]) < Version(
        previous["version"]
    ):
        raise ValueError("Refusing signed application downgrade")
    if (
        previous
        and incoming["version"] == previous["version"]
        and incoming["files"] != previous["files"]
    ):
        raise ValueError(
            "Signed version already exists with different content"
        )
    merged = copy.deepcopy(old)
    merged["generated_at"] = single["generated_at"]
    merged["components"][APP] = incoming
    if previous:
        incoming["preserve"] = sorted(
            set(incoming["preserve"]) | set(previous.get("preserve", []))
        )
    validate_manifest(
        merged, expected_target=target, core_version=old["release_version"]
    )
    # Core compatibility, host fingerprint and every other component stay exact.
    if {
        k: v
        for k, v in merged.items()
        if k not in {"components", "generated_at"}
    } != {
        k: v for k, v in old.items() if k not in {"components", "generated_at"}
    }:
        raise ValueError("Application release changed host metadata")
    if {k: v for k, v in merged["components"].items() if k != APP} != {
        k: v for k, v in old["components"].items() if k != APP
    }:
        raise ValueError("Application release changed another component")
    manifest = generated.with_name(f"{target}-{release_id}.json")
    manifest.write_bytes(canonical_json(merged))
    signature = _sign(manifest, private)
    history = manifest.with_name(f"{target}-{release_id}.history.json")
    history_signature = _write_history(
        history,
        target=target,
        release_id=release_id,
        release_version=old_pointer["release_version"],
        release_sequence=sequence,
        release_attempt=attempt,
        manifest_url=base + "/metadata/components/stable/" + manifest.name,
        manifest_path=manifest,
        manifest_signature=signature,
        private=private,
        history_input=history_path,
        history_signature_input=history_path.with_suffix(".json.sig"),
        history_count=10,
    )
    pointer = manifest.with_name(target + ".current.json")
    _write_signed_pointer(
        pointer,
        target=target,
        release_id=release_id,
        release_version=old_pointer["release_version"],
        release_sequence=sequence,
        release_attempt=attempt,
        manifest_url=base + "/metadata/components/stable/" + manifest.name,
        manifest_path=manifest,
        manifest_signature=signature,
        history_url=base + "/metadata/components/stable/" + history.name,
        history_path=history,
        history_signature=history_signature,
        private=private,
    )
    check_promotion(
        pointer,
        old_pointer_path,
        private_key_b64=private_b64,
        expected_target=target,
    )
    # Recheck actual new archives immediately before upload, including signature.
    verify_release(
        folder, generated, target=target, base_url=base, public_key=PUBLIC_KEY
    )
    for path in sorted((folder / "artifacts").rglob("*.zip")):
        immutable(
            bucket,
            path.relative_to(folder).as_posix(),
            path.read_bytes(),
            "application/zip",
        )
    for path in (
        manifest,
        manifest.with_suffix(".json.sig"),
        history,
        history.with_suffix(".json.sig"),
    ):
        immutable(
            bucket,
            "metadata/components/stable/" + path.name,
            path.read_bytes(),
            "application/json",
        )
    return pointer_key, before, pointer.read_bytes()


def main():
    root = Path("dist/storage-capacity")
    new = json.loads((root / "index.json").read_bytes())
    if len(new["files"]) != 1:
        raise ValueError("Expected one app package")
    entry = next(iter(new["files"].values()))
    key = entry["url"].lstrip("/")
    if not key.startswith(f"files/plugins/apps/{APP}/"):
        raise ValueError("Application URL mismatch")
    archive = root / key.removeprefix("files/plugins/")
    payload = verify_app(archive, entry)
    stage = root / "staging"
    with ZipFile(archive) as z:
        for name in z.namelist():
            path = stage / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(z.read(name))
    bucket = oss2.Bucket(
        oss2.Auth(
            os.environ["OSS_ACCESS_KEY_ID"],
            os.environ["OSS_ACCESS_KEY_SECRET"],
        ),
        os.environ["OSS_ENDPOINT"],
        os.environ["OSS_BUCKET"],
    )
    base = os.environ.get(
        "COMPONENT_BASE_URL",
        "https://ugsci-download.oss-cn-beijing.aliyuncs.com",
    ).rstrip("/")
    private_b64 = os.environ["COMPONENT_SIGNING_PRIVATE_KEY"]
    os.environ["COMPONENT_SIGNING_PUBLIC_KEY"] = PUBLIC_KEY
    _private_key(
        private_b64
    )  # Fail before any writes on a trust-root mismatch.
    sequence, attempt = int(os.environ["GITHUB_RUN_ID"]), int(
        os.environ["GITHUB_RUN_ATTEMPT"]
    )
    release_id = f"storage-capacity-{entry['version']}-{sequence}-{attempt}"
    catalog_key = "metadata/plugins/index.json"
    old = bucket.get_object(catalog_key).read()
    merged = canonical_json(merge_catalog(json.loads(old), new))
    (root / "catalog-before.json").write_bytes(old)
    (root / "catalog-after.json").write_bytes(merged)
    updates = []
    for target in ("windows-x86_64", "macos-aarch64"):
        updates.append(
            prepare_target(
                bucket,
                root,
                stage,
                target,
                base,
                private_b64,
                release_id,
                sequence,
                attempt,
            )
        )
    immutable(bucket, key, payload, "application/zip")
    verify_app(archive, entry)
    updates.append((catalog_key, old, merged))
    promote(bucket, updates, release_id)
    report = {
        "status": "published",
        "plugin_id": APP,
        "version": entry["version"],
        "sha256": digest(payload),
        "object_key": key,
        "targets": ["windows-x86_64", "macos-aarch64"],
        "release_id": release_id,
    }
    (root / "publication.json").write_bytes(canonical_json(report))
    print(json.dumps(report))


if __name__ == "__main__":
    main()
