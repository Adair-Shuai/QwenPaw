#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Reject stale component pointer promotions.

Both local and remote pointers are independently signature-checked.  Semantic
release versions prevent an older desktop release from replacing a newer one;
the monotonically increasing GitHub run/attempt tuple orders component-only
publishes of the same release version.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
from pathlib import Path
from typing import Any

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from packaging.version import InvalidVersion, Version

from component_common import canonical_json


def _private_key(value: str) -> Ed25519PrivateKey:
    raw = base64.b64decode(value.strip(), validate=True)
    if len(raw) != 32:
        raise ValueError(
            "component Ed25519 private key must contain 32 raw bytes",
        )
    return Ed25519PrivateKey.from_private_bytes(raw)


def _load_verified(
    path: Path,
    private: Ed25519PrivateKey,
    expected_target: str,
) -> dict[str, Any]:
    try:
        pointer = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"invalid component pointer JSON: {path}") from exc
    if not isinstance(pointer, dict) or pointer.get("schema_version") != 1:
        raise ValueError(f"invalid component pointer schema: {path}")
    if pointer.get("target") != expected_target:
        raise ValueError(f"component pointer target mismatch: {path}")
    signature = pointer.get("signature")
    if not isinstance(signature, str) or not signature:
        raise ValueError(f"component pointer signature is missing: {path}")
    payload = dict(pointer)
    payload.pop("signature", None)
    try:
        private.public_key().verify(
            base64.b64decode(signature, validate=True),
            canonical_json(payload),
        )
    except Exception as exc:  # noqa: BLE001
        raise ValueError(
            f"component pointer signature verification failed: {path}",
        ) from exc
    return pointer


def _version(pointer: dict[str, Any], path: Path) -> Version | None:
    value = pointer.get("release_version")
    if value is None:
        return None
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"invalid component pointer release_version: {path}")
    try:
        return Version(value)
    except InvalidVersion as exc:
        raise ValueError(
            f"invalid component pointer release_version: {path}",
        ) from exc


def _order(pointer: dict[str, Any], path: Path) -> tuple[int, int] | None:
    sequence = pointer.get("release_sequence")
    attempt = pointer.get("release_attempt")
    if sequence is None and attempt is None:
        return None
    if (
        type(sequence) is not int
        or sequence < 0
        or type(attempt) is not int
        or attempt < 0
    ):
        raise ValueError(f"invalid component pointer release order: {path}")
    return sequence, attempt


def check_promotion(
    local_path: Path,
    remote_path: Path | None,
    *,
    private_key_b64: str,
    expected_target: str,
) -> None:
    private = _private_key(private_key_b64)
    local = _load_verified(local_path, private, expected_target)
    local_version = _version(local, local_path)
    local_order = _order(local, local_path)
    if local_version is None or local_order is None:
        raise ValueError(
            "new component pointer has no monotonic release metadata",
        )
    if remote_path is None:
        return
    remote = _load_verified(remote_path, private, expected_target)
    remote_version = _version(remote, remote_path)
    remote_order = _order(remote, remote_path)
    # A signed legacy pointer may be replaced once to migrate to the monotonic
    # format.  Every subsequent promotion is strictly ordered.
    if remote_version is None or remote_order is None:
        return
    if local_version < remote_version:
        raise ValueError(
            f"refusing component pointer rollback: {local_version} < {remote_version}",
        )
    if local_version > remote_version:
        return
    if local_order < remote_order:
        raise ValueError(
            f"refusing stale component pointer promotion: {local_order} < {remote_order}",
        )
    if local_order == remote_order and local.get("release_id") != remote.get(
        "release_id",
    ):
        raise ValueError("component pointer release order collision")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--local", type=Path, required=True)
    parser.add_argument("--remote", type=Path)
    parser.add_argument("--target", required=True)
    parser.add_argument(
        "--private-key",
        default=os.environ.get("COMPONENT_SIGNING_PRIVATE_KEY", ""),
    )
    args = parser.parse_args()
    if not args.private_key:
        raise SystemExit(
            "COMPONENT_SIGNING_PRIVATE_KEY or --private-key is required",
        )
    check_promotion(
        args.local.resolve(),
        args.remote.resolve() if args.remote else None,
        private_key_b64=args.private_key,
        expected_target=args.target,
    )
    print("component pointer promotion is monotonic")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
