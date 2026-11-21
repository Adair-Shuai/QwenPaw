#!/usr/bin/env python3
"""Publish legacy desktop URLs as OSS symlinks to versioned packages."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
from urllib.request import Request, urlopen

import oss2
from packaging.version import Version

DESKTOP_PREFIX = "files/apps/desktop/"
ARTIFACTS = (
    ("win-tauri", "Windows-updater.exe"),
    ("win-tauri", "Windows-portable.zip"),
    ("mac-tauri", "macOS.dmg"),
    ("mac-tauri", "macOS.zip"),
    ("mac-tauri", "macOS.app.tar.gz"),
)
INDEX_KEYS = (
    "metadata/qwenpaw-tauri-latest.json",
    "metadata/apps/desktop/index.json",
    "metadata/index.json",
)
PUBLIC = {"x-oss-object-acl": "public-read"}
MUTABLE = {**PUBLIC, "Cache-Control": "public, max-age=0, must-revalidate"}
MISSING = (oss2.exceptions.NoSuchKey, oss2.exceptions.NotFound)


def artifact_keys(version: str) -> tuple[str, ...]:
    return tuple(
        f"{DESKTOP_PREFIX}{platform}/UGSci-Tauri-{version}-{suffix}"
        for platform, suffix in ARTIFACTS
    )


def metadata_key(key: str) -> str:
    return f"metadata/{key.removeprefix('files/')}.json"


def symlink_target(bucket, key: str, head) -> str | None:
    if head.headers.get("x-oss-object-type") != "Symlink":
        return None
    return bucket.get_symlink(key).target_key


def put_link(bucket, key: str, target: str) -> None:
    # PutSymlink can replace the existing object and set its ACL in one call.
    bucket.put_symlink(target, key, headers=MUTABLE)
    if bucket.get_symlink(key).target_key != target:
        raise ValueError(f"OSS returned the wrong target for {key}")


def snapshot(bucket, backup: Path) -> None:
    aliases = artifact_keys("latest")
    objects = {}
    for key in (
        *aliases,
        *(metadata_key(key) for key in aliases),
        *INDEX_KEYS,
    ):
        try:
            head = bucket.head_object(key)
        except MISSING:
            objects[key] = None
            continue
        target = symlink_target(bucket, key, head)
        if target:
            objects[key] = {"target": target}
            continue
        local = backup / key
        local.parent.mkdir(parents=True, exist_ok=True)
        bucket.get_object_to_file(key, str(local))
        objects[key] = {
            name: head.headers[name]
            for name in (
                "Content-Type",
                "Cache-Control",
                "Content-Disposition",
            )
            if name in head.headers
        }
    (backup / "snapshot.json").write_text(
        json.dumps(objects), encoding="utf-8"
    )


def restore(bucket, backup: Path) -> None:
    objects = json.loads(
        (backup / "snapshot.json").read_text(encoding="utf-8")
    )
    failed = []
    for key, previous in objects.items():
        try:
            if previous is None:
                bucket.delete_object(key)
            elif "target" in previous:
                put_link(bucket, key, previous["target"])
            else:
                oss2.resumable_upload(
                    bucket,
                    key,
                    str(backup / key),
                    headers={**PUBLIC, **previous},
                )
        except (oss2.exceptions.OssError, OSError, ValueError) as error:
            print(f"Could not restore {key}: {error}", flush=True)
            failed.append(key)
    if failed:
        raise RuntimeError(
            f"Desktop pointer rollback failed for {', '.join(failed)}"
        )


def verify_public_link(public_url: str, etag: str, size: int) -> None:
    request = Request(
        public_url,
        headers={"Range": "bytes=0-0", "Cache-Control": "no-cache"},
    )
    with urlopen(request, timeout=30) as response:
        if (
            response.status != 206
            or response.headers.get("Content-Range") != f"bytes 0-0/{size}"
            or response.headers.get("ETag", "").strip('"') != etag
            or len(response.read(2)) != 1
        ):
            raise ValueError(
                f"Public alias did not serve the versioned object: {public_url}"
            )


def promote(bucket, version: str, public_base: str) -> None:
    for key, target in zip(artifact_keys("latest"), artifact_keys(version)):
        metadata = bucket.get_object(metadata_key(target)).read()
        doc = json.loads(metadata)
        head = bucket.head_object(target)
        if (
            doc.get("version") != version
            or doc.get("url") != f"/{target}"
            or doc.get("filename") != target.rsplit("/", 1)[-1]
            or doc.get("size_bytes") != head.content_length
            or head.headers.get("x-oss-object-type") == "Symlink"
            or not re.fullmatch(r"[a-f0-9]{64}", doc.get("sha256", ""))
        ):
            raise ValueError(
                f"Versioned desktop metadata mismatch for {target}"
            )
        put_link(bucket, key, target)
        public_url = (
            f"{public_base.rstrip('/')}/{key.removeprefix(DESKTOP_PREFIX)}"
        )
        verify_public_link(public_url, head.etag, head.content_length)
        # A client holding older metadata must still get the bytes it describes.
        alias_metadata = metadata_key(key)
        bucket.put_object(
            alias_metadata,
            metadata,
            headers={**MUTABLE, "Content-Type": "application/json"},
        )
        if bucket.get_object(alias_metadata).read() != metadata:
            raise ValueError(f"OSS readback failed for {alias_metadata}")
        print(f"{key} -> {target}", flush=True)


def protected_targets(bucket) -> set[str]:
    targets = set()
    for key in artifact_keys("latest"):
        try:
            head = bucket.head_object(key)
        except MISSING:
            continue
        target = symlink_target(bucket, key, head)
        if target:
            targets.update((target, metadata_key(target)))
    return targets


def current_alias_version(bucket, public_base: str) -> tuple[str, int]:
    manifest = json.loads(bucket.get_object(INDEX_KEYS[0]).read())
    version = str(Version(manifest["version"]))
    targets = artifact_keys(version)
    for platform, key in (
        ("windows-x86_64", targets[0]),
        ("darwin-aarch64", targets[-1]),
    ):
        signed = manifest["platforms"][platform]
        url = f"{public_base.rstrip('/')}/{key.removeprefix(DESKTOP_PREFIX)}"
        if signed["url"] != url or not signed["signature"]:
            raise ValueError(
                f"Current updater manifest target mismatch for {platform}"
            )

    duplicate_bytes = 0
    for alias, target in zip(artifact_keys("latest"), targets):
        legacy = bucket.head_object(alias)
        versioned = bucket.head_object(target)
        if (
            not legacy.etag
            or legacy.etag != versioned.etag
            or legacy.content_length != versioned.content_length
        ):
            raise ValueError(
                f"Current alias does not match the immutable package: {alias}"
            )
        if symlink_target(bucket, alias, legacy) is None:
            duplicate_bytes += legacy.content_length
    return version, duplicate_bytes


def migrate_current(bucket, public_base: str, backup: Path) -> None:
    version, duplicate_bytes = current_alias_version(bucket, public_base)
    snapshot(bucket, backup)
    try:
        promote(bucket, version, public_base)
    except Exception:
        restore(bucket, backup)
        raise
    print(
        f"Replaced {duplicate_bytes} bytes of duplicate desktop alias objects",
        flush=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("snapshot", "restore"):
        commands.add_parser(name).add_argument("backup", type=Path)
    publish = commands.add_parser("promote")
    publish.add_argument("version")
    publish.add_argument("public_base")
    migrate = commands.add_parser("migrate-current")
    migrate.add_argument("public_base")
    migrate.add_argument("backup", type=Path)
    commands.add_parser("protected-targets")
    args = parser.parse_args()
    bucket = oss2.Bucket(
        oss2.Auth(
            os.environ["OSS_ACCESS_KEY_ID"],
            os.environ["OSS_ACCESS_KEY_SECRET"],
        ),
        os.environ["OSS_ENDPOINT"],
        os.environ["OSS_BUCKET"],
    )
    if args.command == "snapshot":
        snapshot(bucket, args.backup)
    elif args.command == "restore":
        restore(bucket, args.backup)
    elif args.command == "promote":
        promote(bucket, args.version, args.public_base)
    elif args.command == "migrate-current":
        migrate_current(bucket, args.public_base, args.backup)
    else:
        print("\n".join(sorted(protected_targets(bucket))))


if __name__ == "__main__":
    main()
