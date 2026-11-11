#!/usr/bin/env python3
"""Increment the core independently, create a pinned draft and start Release Core.

Run from a clean, authenticated Git checkout. Existing drafts are resumed with
--resume TAG; starting a new release always allocates a new version. Compatibility
bounds and extension versions are never edited.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import subprocess

from packaging.version import InvalidVersion, Version


def next_version(current: str, versions: list[str], channel: str) -> str:
    """Choose a monotonically increasing version across drafts and releases."""
    parsed = [Version(current)]
    for item in versions:
        try:
            parsed.append(Version(item.removeprefix("v")))
        except InvalidVersion:
            continue
    latest = max(parsed)
    base = f"{latest.major}.{latest.minor}.{latest.micro}"
    if channel == "stable":
        return (
            base
            if latest.is_prerelease
            else f"{latest.major}.{latest.minor}.{latest.micro + 1}"
        )
    if latest.pre and latest.pre[0] in {"a", "b"}:
        return f"{base}b{latest.pre[1] + 1 if latest.pre[0] == 'b' else 1}"
    return f"{latest.major}.{latest.minor}.{latest.micro + 1}b1"


def release_tag(version: str) -> str:
    parsed = Version(version)
    base = f"v{parsed.major}.{parsed.minor}.{parsed.micro}"
    if parsed.pre:
        label = {"a": "alpha", "b": "beta", "rc": "rc"}[parsed.pre[0]]
        return f"{base}-{label}.{parsed.pre[1]}"
    return base


def command(*arguments: str) -> str:
    return subprocess.check_output(arguments, text=True).strip()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--channel", choices=("beta", "stable"), default="beta"
    )
    parser.add_argument("--resume", metavar="TAG")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    root = Path(command("git", "rev-parse", "--show-toplevel"))
    if Path.cwd().resolve() != root.resolve():
        parser.error("Run this command from the repository root")
    branch = command("git", "symbolic-ref", "--short", "HEAD")
    repository = command(
        "gh",
        "repo",
        "view",
        "--json",
        "nameWithOwner",
        "--jq",
        ".nameWithOwner",
    )
    releases = json.loads(
        command(
            "gh",
            "api",
            "--paginate",
            "--slurp",
            f"repos/{repository}/releases?per_page=100",
        )
    )
    releases = [item for page in releases for item in page]
    if args.resume:
        release = next(
            (item for item in releases if item["tag_name"] == args.resume),
            None,
        )
        if release is None or not release["draft"]:
            parser.error("--resume requires an existing draft release")
        if release["target_commitish"] != command("git", "rev-parse", "HEAD"):
            parser.error("Check out the exact draft commit before resuming")
        tag = args.resume
    else:
        if command("git", "status", "--porcelain"):
            parser.error(
                "Commit or isolate local changes before preparing a release"
            )
        source = root / "src/qwenpaw/__version__.py"
        original = source.read_text("utf-8")
        match = re.search(r'__version__\s*=\s*"([^"]+)"', original)
        if not match:
            parser.error("Cannot read the core version")
        version = next_version(
            match.group(1),
            [item["tag_name"] for item in releases],
            args.channel,
        )
        tag = release_tag(version)
        print(
            f"Core: {match.group(1)} -> {version}; draft: {tag}; branch: {branch}"
        )
        if args.dry_run:
            return
        source.write_text(
            original[: match.start(1)] + version + original[match.end(1) :],
            encoding="utf-8",
            newline="\n",
        )
        command("git", "add", "--", str(source))
        command("git", "commit", "-m", f"chore: prepare core {version}")
        command("git", "push", "origin", f"HEAD:refs/heads/{branch}")
        sha = command("git", "rev-parse", "HEAD")
        release = json.loads(
            command(
                "gh",
                "api",
                f"repos/{repository}/releases",
                "--method",
                "POST",
                "-f",
                f"tag_name={tag}",
                "-f",
                f"name=UGSci {tag}",
                "-f",
                f"target_commitish={sha}",
                "-F",
                "draft=true",
                "-F",
                f"prerelease={'true' if Version(version).is_prerelease else 'false'}",
                "-F",
                "generate_release_notes=true",
            )
        )
    print(f"Release Core: {tag} (draft {release['id']})")
    if not args.dry_run:
        command(
            "gh",
            "workflow",
            "run",
            "release-resume.yml",
            "--ref",
            branch,
            "-f",
            f"tag={tag}",
            "-f",
            f"release_id={release['id']}",
        )


if __name__ == "__main__":
    main()
