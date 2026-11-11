#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Publish every indexed plugin ZIP, preserving immutable object contents."""

from __future__ import annotations

import argparse
import filecmp
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import tempfile
from urllib.parse import urlsplit


def artifact_plan(root: Path) -> list[tuple[Path, str]]:
    """Require a complete index-to-artifact mapping before touching OSS."""
    root = root.resolve(strict=True)
    index = json.loads((root / "index.json").read_text("utf-8"))
    files = index.get("files")
    if not isinstance(files, dict) or not files:
        raise ValueError("Plugin index must contain release artifacts")
    plan = {}
    for row in files.values():
        parsed = urlsplit(row["url"])
        prefix = "/files/plugins/"
        relative = PurePosixPath(parsed.path.removeprefix(prefix))
        unsafe_url = any(
            (
                parsed.scheme,
                parsed.netloc,
                parsed.query,
                parsed.fragment,
                not parsed.path.startswith(prefix),
                relative.is_absolute(),
                ".." in relative.parts,
                any(char in relative.as_posix() for char in "\\:%"),
                relative.suffix != ".zip",
                row["filename"] != relative.name,
            ),
        )
        if unsafe_url:
            raise ValueError(f"Unsafe plugin artifact URL: {row['url']}")
        source = root.joinpath(*relative.parts)
        if (
            not source.is_file()
            or not source.resolve().is_relative_to(root)
            or source.is_symlink()
        ):
            raise ValueError(f"Indexed plugin artifact is missing: {relative}")
        with source.open("rb") as stream:
            digest = hashlib.file_digest(stream, "sha256").hexdigest()
        if (
            digest != row["sha256"]
            or source.stat().st_size != row["size_bytes"]
        ):
            raise ValueError(f"Indexed plugin artifact differs: {relative}")
        key = relative.as_posix()
        if key in plan:
            raise ValueError(f"Duplicate plugin artifact URL: {key}")
        plan[key] = source
    actual = {path.relative_to(root).as_posix() for path in root.rglob("*.zip")}
    if actual != plan.keys():
        raise ValueError("Plugin ZIP inventory differs from release index")
    return [(source, key) for key, source in sorted(plan.items())]


def _oss(arguments: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["ossutil", *arguments],
        capture_output=True,
        text=True,
        check=False,
    )


def _copy(source: str, destination: str, *, upload: bool = False) -> None:
    command = ["cp", source, destination]
    if upload:
        command.extend(
            [
                "--acl",
                "public-read",
                "--meta",
                "x-oss-forbid-overwrite:true#"
                "Cache-Control:public, max-age=31536000, immutable",
            ],
        )
    result = _oss(command)
    if result.returncode:
        raise RuntimeError(result.stdout + result.stderr)


def upload_artifacts(
    root: Path,
    bucket: str,
    *,
    preflight_only: bool = False,
) -> None:
    """Validate immutable objects and optionally upload new archives."""
    plan = artifact_plan(root)
    existing, conflicts = set(), []
    with tempfile.TemporaryDirectory(prefix="qwenpaw-plugin-upload-") as work:
        for index, (source, relative) in enumerate(plan):
            uri = f"oss://{bucket}/files/plugins/{relative}"
            result = _oss(["stat", uri])
            if result.returncode == 0:
                remote = Path(work) / str(index)
                _copy(uri, str(remote))
                if not filecmp.cmp(source, remote, shallow=False):
                    conflicts.append(relative)
                existing.add(relative)
            elif not re.search(
                r"StatusCode.?[:=]? ?404|NoSuchKey|ObjectNotExist",
                result.stdout + result.stderr,
                re.IGNORECASE,
            ):
                raise RuntimeError(result.stdout + result.stderr)
        if conflicts:
            raise ValueError(
                "Plugin content changed without a version bump: "
                + ", ".join(conflicts),
            )
        if preflight_only:
            print(
                f"Verified {len(plan)} plugin versions "
                "against immutable OSS objects",
            )
            return
        for index, (source, relative) in enumerate(plan):
            if relative in existing:
                print(f"Reusing unchanged immutable plugin: {relative}")
                continue
            uri = f"oss://{bucket}/files/plugins/{relative}"
            _copy(str(source), uri, upload=True)
            remote = Path(work) / f"uploaded-{index}"
            _copy(uri, str(remote))
            if not filecmp.cmp(source, remote, shallow=False):
                raise ValueError(f"Remote plugin verification failed: {uri}")
            print(f"Published and verified plugin: {relative}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path("dist/plugins"))
    parser.add_argument("--bucket", required=True)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--preflight", action="store_true")
    args = parser.parse_args()
    if args.check:
        print(f"Validated {len(artifact_plan(args.root))} indexed plugin ZIPs")
    else:
        upload_artifacts(args.root, args.bucket, preflight_only=args.preflight)


if __name__ == "__main__":
    main()
