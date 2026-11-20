# -*- coding: utf-8 -*-
"""Sign native build artifacts on a fresh runner; never execute package code."""

import argparse
import base64
import hashlib
import json
import os
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from qwenpaw.expert_packages.models import ReleaseIndex
from qwenpaw.expert_packages.publication import (
    inspect_archive,
    manifest_path,
    public_key,
)


def seal(root: Path, private: Ed25519PrivateKey, expected_key: str):
    actual = base64.b64encode(private.public_key().public_bytes_raw()).decode()
    if actual != expected_key:
        raise ValueError(
            "Signing key does not match the configured expert channel",
        )
    manifests = sorted((root / "expert-packages/manifests").glob("*.json"))
    if not manifests or len(manifests) > 20:
        raise ValueError(
            "Expected one complete expert release with up to 20 variants",
        )
    items, releases = [], []
    for path in manifests:
        raw = path.read_bytes()
        if path.relative_to(root).as_posix() != manifest_path(raw):
            raise ValueError("Manifest content address mismatch")
        # Parse only to locate the artifact, then inspect full signed inventory.
        from qwenpaw.expert_packages.models import Release

        metadata = Release.model_validate_json(raw)
        artifact = root / metadata.artifact.path
        if artifact.is_symlink() or not artifact.resolve().is_relative_to(
            root.resolve(),
        ):
            raise ValueError("Artifact outside release directory")
        release = inspect_archive(raw, artifact.read_bytes())
        releases.append(release)
        items.append(
            {
                "manifest_base64": base64.b64encode(raw).decode(),
                "signature": base64.b64encode(private.sign(raw)).decode(),
                "archive_base64": base64.b64encode(
                    artifact.read_bytes(),
                ).decode(),
            },
        )
    if len({(r.id, r.version, r.name, r.description) for r in releases}) != 1:
        raise ValueError("Build artifacts must belong to one expert version")
    index = ReleaseIndex.model_validate(
        {
            "schema_version": "expert-index.v1",
            "id": releases[0].id,
            "version": releases[0].version,
            "releases": [
                {
                    "target": r.target,
                    "python": r.python,
                    "manifest": manifest_path(path.read_bytes()),
                    "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                }
                for r, path in zip(releases, manifests)
            ],
        },
    )
    raw = json.dumps(
        index.model_dump(),
        sort_keys=True,
        separators=(",", ":"),
    ).encode()
    return {
        "index_base64": base64.b64encode(raw).decode(),
        "index_signature": base64.b64encode(private.sign(raw)).decode(),
        "releases": items,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    private = Ed25519PrivateKey.from_private_bytes(
        base64.b64decode(
            os.environ.pop("UGSCI_EXPERT_SIGNING_KEY"),
            validate=True,
        ),
    )
    payload = seal(args.root, private, public_key())
    # Public signed artifacts only. No key or credential is serialized.
    args.output.write_text(json.dumps(payload), encoding="utf-8")
    print("Sealed expert release; package code was not executed")


if __name__ == "__main__":
    main()
