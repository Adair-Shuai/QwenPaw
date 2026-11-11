#!/usr/bin/env python3
"""Reserve new patch versions only when an independently published ZIP changes.

The remote index is advisory; the actual immutable OSS object is always read.
No compatibility bounds are changed, no published object is overwritten, and
the caller must repack and run the ordinary upload preflight afterwards.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

from packaging.version import Version

from upload_plugin_artifacts import _oss, artifact_plan


def oss_sdk(arguments: list[str]) -> subprocess.CompletedProcess:
    """Read authoritative objects through the same credentials as app uploaders."""
    import oss2
    from urllib.parse import urlsplit

    operation, uri, *destination = arguments
    parsed = urlsplit(uri)
    bucket = oss2.Bucket(
        oss2.Auth(
            os.environ["OSS_ACCESS_KEY_ID"],
            os.environ["OSS_ACCESS_KEY_SECRET"],
        ),
        os.environ["OSS_ENDPOINT"],
        parsed.netloc,
    )
    try:
        if operation == "stat":
            bucket.head_object(parsed.path.lstrip("/"))
        elif operation == "cp" and len(destination) == 1:
            bucket.get_object_to_file(parsed.path.lstrip("/"), destination[0])
        else:
            raise ValueError(
                "Version preparation supports read operations only"
            )
    except oss2.exceptions.NoSuchKey:
        return subprocess.CompletedProcess(arguments, 1, "", "NoSuchKey")
    return subprocess.CompletedProcess(arguments, 0, "", "")


def object_exists(uri: str) -> bool:
    """Treat only an authoritative 404 as absence; fail on access errors."""
    result = _oss(["stat", uri])
    if result.returncode == 0:
        return True
    if re.search(
        r"StatusCode.?[:=]? ?404|NoSuchKey|ObjectNotExist",
        result.stdout + result.stderr, re.I,
    ):
        return False
    raise RuntimeError(result.stdout + result.stderr)


def read_catalog(bucket: str) -> dict:
    uri = f"oss://{bucket}/metadata/plugins/index.json"
    if not object_exists(uri):
        return {"files": {}}
    with tempfile.TemporaryDirectory() as temporary:
        index = Path(temporary) / "index.json"
        result = _oss(["cp", uri, str(index)])
        if result.returncode:
            raise RuntimeError(result.stdout + result.stderr)
        return json.loads(index.read_text("utf-8"))


def reconcile(repo: Path, dist: Path, remote_index: dict) -> list[Path]:
    """Advance colliding versions and synchronize existing source mirrors."""
    sources = {}
    for source_path in (repo / "plugins").glob("*/*/plugin.json"):
        document = json.loads(source_path.read_text("utf-8"))
        sources[document["id"]] = (source_path, document)
    local = json.loads((dist / "index.json").read_text("utf-8"))
    plan = dict((key, source) for source, key in artifact_plan(dist))
    changed = []
    # Prepare all decisions before writing source files.
    updates = []
    for row in local["files"].values():
        identifier = row["plugin_id"]
        source, manifest = sources[identifier]
        versions = [Version(manifest["version"])]
        versions.extend(
            Version(item["version"])
            for item in remote_index.get("files", {}).values()
            if item.get("plugin_id") == identifier
        )
        latest = max(versions)
        if Version(manifest["version"]) < latest:
            raise ValueError(
                f"{identifier}: source version is older than published "
                f"{latest}; update the source before releasing"
            )
        relative = row["url"].removeprefix("/files/plugins/")
        uri = f"oss://{remote_index['_bucket']}/files/plugins/{relative}"
        if not object_exists(uri):
            continue
        with tempfile.TemporaryDirectory() as temporary:
            remote = Path(temporary) / "published.zip"
            result = _oss(["cp", uri, str(remote)])
            if result.returncode:
                raise RuntimeError(result.stdout + result.stderr)
            if remote.read_bytes() == plan[relative].read_bytes():
                continue
        next_version = f"{latest.major}.{latest.minor}.{latest.micro + 1}"
        # An interrupted prior publication can leave an unindexed ZIP.
        while True:
            candidate = (
                f"oss://{remote_index['_bucket']}/files/plugins/"
                f"{row['platform']}/{identifier}/{identifier}-{next_version}.zip"
            )
            if not object_exists(candidate):
                break
            version = Version(next_version)
            next_version = f"{version.major}.{version.minor}.{version.micro + 1}"
        updates.append((source, manifest, next_version))
    for source, manifest, version in updates:
        print(f"{manifest['id']}: {manifest['version']} -> {version}")
        manifest["version"] = version
        source.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        changed.append(source)
        for mirror in (repo / "src/qwenpaw/plugins_bundle").glob(
            "*/plugin.json"
        ):
            document = json.loads(mirror.read_text("utf-8"))
            if document.get("id") == manifest["id"]:
                document["version"] = version
                mirror.write_text(
                    json.dumps(document, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8",
                    newline="\n",
                )
                changed.append(mirror)
    return changed


def main():
    global _oss
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    parser.add_argument("--dist", type=Path, required=True)
    parser.add_argument("--index", type=Path)
    parser.add_argument("--bucket", required=True)
    parser.add_argument("--commit", action="store_true")
    parser.add_argument("--sdk", action="store_true")
    parser.add_argument("--repack", action="store_true")
    parser.add_argument(
        "--branch",
        help="Push the version commit to this branch, without force",
    )
    args = parser.parse_args()
    if args.branch and not args.commit:
        parser.error("--branch requires --commit")
    if args.sdk:
        _oss = oss_sdk
    if args.index:
        remote = json.loads(args.index.read_text("utf-8"))
    else:
        remote = read_catalog(args.bucket)
    remote["_bucket"] = args.bucket
    original_index = json.loads((args.dist / "index.json").read_text("utf-8"))
    identifiers = sorted(
        {row["plugin_id"] for row in original_index["files"].values()}
    )
    if args.repack and len(identifiers) != 1:
        parser.error(
            "--repack requires exactly one independently built extension"
        )
    if args.branch:
        subprocess.run(
            ["git", "check-ref-format", f"refs/heads/{args.branch}"],
            check=True,
        )
    changes = reconcile(args.repo.resolve(), args.dist.resolve(), remote)
    if args.commit and changes:
        subprocess.run(
            ["git", "add", "--", *(str(path) for path in changes)],
            cwd=args.repo,
            check=True,
        )
        subprocess.run(
            [
                "git",
                "commit",
                "-m",
                "chore: advance changed extension release versions",
            ],
            cwd=args.repo,
            check=True,
        )
        if args.branch:
            subprocess.run(
                ["git", "push", "origin", f"HEAD:refs/heads/{args.branch}"],
                cwd=args.repo,
                check=True,
            )
    if args.repack:
        # Delete only archives verified by the old local index, never a source tree.
        for archive, _ in artifact_plan(args.dist):
            archive.unlink()
        subprocess.run(
            [
                sys.executable,
                str(Path(__file__).with_name("generate_plugin_metadata.py")),
                "--plugins-root",
                str(args.repo / "plugins"),
                "--dist",
                str(args.dist),
                "--metadata-out",
                str(args.dist / "index.json"),
                "--cdn-prefix",
                "/files/plugins",
                "--only",
                identifiers[0],
            ],
            check=True,
        )


if __name__ == "__main__":
    main()
