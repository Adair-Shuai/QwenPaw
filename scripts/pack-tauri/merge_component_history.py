#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Merge live immutable history into a pending component promotion."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from packaging.version import Version

from component_common import (
    atomic_write_bytes,
    atomic_write_text,
    canonical_json,
    decode_base64,
    verify_private_key_public_key,
)


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


def _verify_document(path: Path, private: Ed25519PrivateKey) -> dict:
    document = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(document, dict):
        raise ValueError(f"signed component document is invalid: {path}")
    signature = document.get("signature")
    payload = dict(document)
    payload.pop("signature", None)
    private.public_key().verify(
        base64.b64decode(str(signature or "").strip(), validate=True),
        canonical_json(payload),
    )
    return document


def _verify_history(
    pointer: dict,
    history_path: Path,
    signature_path: Path,
    private: Ed25519PrivateKey,
) -> dict:
    raw = history_path.read_bytes()
    signature = signature_path.read_text(encoding="utf-8").strip()
    private.public_key().verify(
        base64.b64decode(signature, validate=True),
        raw,
    )
    if len(raw) != pointer.get("history_size"):
        raise ValueError("component history size does not match pointer")
    if hashlib.sha256(raw).hexdigest() != pointer.get("history_sha256"):
        raise ValueError("component history hash does not match pointer")
    if signature != pointer.get("history_signature"):
        raise ValueError("component history signature does not match pointer")
    history = json.loads(raw.decode("utf-8"))
    if not isinstance(history, dict) or not isinstance(
        history.get("releases"),
        list,
    ):
        raise ValueError("component history document is invalid")
    return history


def _order(entry: dict) -> tuple[Version, int, int]:
    return (
        Version(str(entry.get("release_version", ""))),
        int(entry.get("release_sequence", 0)),
        int(entry.get("release_attempt", 0)),
    )


def merge_history(
    local_pointer_path: Path,
    local_history_path: Path,
    local_signature_path: Path,
    remote_pointer_path: Path,
    remote_history_path: Path,
    remote_signature_path: Path,
    *,
    private_key_b64: str,
    expected_target: str,
    limit: int = 10,
) -> None:
    if not 1 <= limit <= 10:
        raise ValueError("history limit must be between 1 and 10")
    private = _private_key(private_key_b64)
    local_pointer = _verify_document(local_pointer_path, private)
    remote_pointer = _verify_document(remote_pointer_path, private)
    if (
        local_pointer.get("target") != expected_target
        or remote_pointer.get("target") != expected_target
    ):
        raise ValueError("component pointer target mismatch")
    local_id = local_pointer.get("release_id")
    remote_id = remote_pointer.get("release_id")
    if _order(local_pointer) < _order(remote_pointer):
        raise ValueError("component history promotion is stale or a rollback")
    if (
        _order(local_pointer) == _order(remote_pointer)
        and local_id != remote_id
    ):
        raise ValueError("component pointer release order collision")
    local_history = _verify_history(
        local_pointer,
        local_history_path,
        local_signature_path,
        private,
    )
    remote_history = _verify_history(
        remote_pointer,
        remote_history_path,
        remote_signature_path,
        private,
    )
    for pointer, history in (
        (local_pointer, local_history),
        (remote_pointer, remote_history),
    ):
        if history.get("target") != expected_target or not history["releases"]:
            raise ValueError("component history target or head is invalid")
        head = history["releases"][0]
        if (
            not isinstance(head, dict)
            or head.get("release_id") != pointer.get("release_id")
            or head.get("manifest_url") != pointer.get("manifest_url")
        ):
            raise ValueError("component history head does not match pointer")
    releases: dict[str, dict] = {}
    for entry in [*local_history["releases"], *remote_history["releases"]]:
        if (
            not isinstance(entry, dict)
            or entry.get("target") != expected_target
        ):
            raise ValueError("component history entry is invalid")
        release_id = entry.get("release_id")
        if not isinstance(release_id, str) or not release_id:
            raise ValueError("component history release id is invalid")
        releases.setdefault(release_id, entry)
    merged = sorted(releases.values(), key=_order, reverse=True)[:limit]
    if merged[0].get("release_id") not in {
        local_pointer.get("release_id"),
        remote_pointer.get("release_id"),
    }:
        raise ValueError("live history is newer than the proposed release")
    history_payload = {
        "schema_version": 1,
        "target": expected_target,
        "releases": merged,
    }
    history_raw = canonical_json(history_payload)
    history_signature = base64.b64encode(private.sign(history_raw)).decode(
        "ascii",
    )
    atomic_write_bytes(local_history_path, history_raw)
    atomic_write_text(local_signature_path, history_signature + "\n")
    pointer_payload = dict(local_pointer)
    pointer_payload.pop("signature", None)
    pointer_payload["history_size"] = len(history_raw)
    pointer_payload["history_sha256"] = hashlib.sha256(history_raw).hexdigest()
    pointer_payload["history_signature"] = history_signature
    pointer = dict(pointer_payload)
    pointer["signature"] = base64.b64encode(
        private.sign(canonical_json(pointer_payload)),
    ).decode("ascii")
    atomic_write_bytes(local_pointer_path, canonical_json(pointer))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--local-pointer", type=Path, required=True)
    parser.add_argument("--local-history", type=Path, required=True)
    parser.add_argument("--local-history-signature", type=Path, required=True)
    parser.add_argument("--remote-pointer", type=Path, required=True)
    parser.add_argument("--remote-history", type=Path, required=True)
    parser.add_argument("--remote-history-signature", type=Path, required=True)
    parser.add_argument("--target", required=True)
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument(
        "--private-key",
        default=os.environ.get("COMPONENT_SIGNING_PRIVATE_KEY", ""),
    )
    args = parser.parse_args()
    if not args.private_key:
        raise SystemExit(
            "COMPONENT_SIGNING_PRIVATE_KEY or --private-key is required",
        )
    merge_history(
        args.local_pointer.resolve(),
        args.local_history.resolve(),
        args.local_history_signature.resolve(),
        args.remote_pointer.resolve(),
        args.remote_history.resolve(),
        args.remote_history_signature.resolve(),
        private_key_b64=args.private_key,
        expected_target=args.target,
        limit=args.limit,
    )
    print(f"merged signed component history: {args.local_history}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
