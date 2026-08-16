# -*- coding: utf-8 -*-
# pylint: disable=protected-access
from __future__ import annotations

import base64
import hashlib
import json
import os
import time

import httpx
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from qwenpaw.components.client import ComponentClient
from qwenpaw.components.update import ComponentUpdater
from qwenpaw.components.update import ComponentUpdateError


def test_oss_manifest_and_artifact_download(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    manifest = json.dumps(
        {
            "schema_version": 1,
            "target": "windows-x86_64",
            "core_min_version": "1.0.0",
            "components": {},
        },
        separators=(",", ":"),
    ).encode()
    signature = base64.b64encode(private.sign(manifest))
    artifact = b"artifact-bytes"

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("manifest.json"):
            return httpx.Response(200, content=manifest)
        if request.url.path.endswith("manifest.json.sig"):
            return httpx.Response(200, content=signature)
        return httpx.Response(
            200,
            content=artifact,
            headers={"Content-Length": str(len(artifact))},
        )

    client = httpx.Client(transport=httpx.MockTransport(handler))
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    downloader = ComponentClient(updater, tmp_path / "cache", client=client)
    assert (
        downloader.fetch_manifest("https://oss.example/manifest.json")[
            "schema_version"
        ]
        == 1
    )
    path = downloader.download_artifact(
        "https://oss.example/artifact.zip",
        sha256=hashlib.sha256(artifact).hexdigest(),
        size=len(artifact),
        name="artifact.zip",
    )
    assert path.read_bytes() == artifact
    downloader.close()


def test_signed_manifest_pointer_prevents_json_signature_mismatch(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    manifest = (
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "core_min_version": "1.0.0",
                "components": {},
            },
            separators=(",", ":"),
        ).encode()
        + b"\n"
    )
    manifest_signature = base64.b64encode(private.sign(manifest)).decode()
    pointer_payload = {
        "schema_version": 1,
        "target": "windows-x86_64",
        "release_id": "run-1",
        "manifest_url": "https://oss.example/manifest-run-1.json",
        "manifest_size": len(manifest),
        "manifest_sha256": hashlib.sha256(manifest).hexdigest(),
        "manifest_signature": manifest_signature,
    }
    pointer = json.dumps(
        {
            **pointer_payload,
            "signature": base64.b64encode(
                private.sign(
                    json.dumps(
                        pointer_payload,
                        ensure_ascii=False,
                        sort_keys=True,
                        separators=(",", ":"),
                    ).encode()
                    + b"\n",
                ),
            ).decode(),
        },
        separators=(",", ":"),
    ).encode()

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("current.json"):
            return httpx.Response(200, content=pointer)
        if request.url.path.endswith("manifest-run-1.json"):
            return httpx.Response(200, content=manifest)
        if request.url.path.endswith("manifest-run-1.json.sig"):
            return httpx.Response(200, content=manifest_signature.encode())
        raise AssertionError(request.url)

    client = httpx.Client(transport=httpx.MockTransport(handler))
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    downloader = ComponentClient(updater, tmp_path / "cache", client=client)
    assert (
        downloader.fetch_manifest("https://oss.example/current.json")["target"]
        == "windows-x86_64"
    )
    downloader.close()


def test_legacy_manifest_can_be_disabled(monkeypatch, tmp_path):
    monkeypatch.setenv("QWENPAW_COMPONENT_ALLOW_LEGACY_MANIFEST", "0")
    client = httpx.Client(
        transport=httpx.MockTransport(
            lambda _request: httpx.Response(
                200,
                json={"schema_version": 1, "components": {}},
            ),
        ),
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    downloader = ComponentClient(updater, tmp_path / "cache", client=client)
    with pytest.raises(
        ComponentUpdateError,
        match="legacy component manifests are disabled",
    ):
        downloader.fetch_manifest("https://oss.example/manifest.json")
    downloader.close()


def test_legacy_manifest_cutoff_cannot_be_overridden(monkeypatch, tmp_path):
    monkeypatch.setenv("QWENPAW_COMPONENT_ALLOW_LEGACY_MANIFEST", "1")
    client = httpx.Client(
        transport=httpx.MockTransport(
            lambda _request: httpx.Response(
                200,
                json={"schema_version": 1, "components": {}},
            ),
        ),
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(),
        target="windows-x86_64",
        core_version="2.2.0",
    )
    downloader = ComponentClient(updater, tmp_path / "cache", client=client)
    with pytest.raises(
        ComponentUpdateError,
        match="legacy component manifests are disabled",
    ):
        downloader.fetch_manifest("https://oss.example/manifest.json")
    downloader.close()


def test_malformed_pointer_does_not_fall_back_to_legacy(tmp_path):
    client = httpx.Client(
        transport=httpx.MockTransport(
            lambda _request: httpx.Response(
                200,
                json={"schema_version": 1, "release_id": "incomplete"},
            ),
        ),
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    downloader = ComponentClient(updater, tmp_path / "cache", client=client)
    with pytest.raises(
        ComponentUpdateError,
        match="malformed component pointer",
    ):
        downloader.fetch_manifest("https://oss.example/current.json")
    downloader.close()


def test_completed_artifact_cache_hit_uses_no_network(tmp_path):
    artifact = b"cached-artifact"
    calls = 0

    def handler(_request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(200, content=artifact)

    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    downloader = ComponentClient(
        updater,
        tmp_path / "cache",
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )
    digest = hashlib.sha256(artifact).hexdigest()
    first = downloader.download_artifact(
        "https://oss.example/artifact.zip",
        sha256=digest,
        size=len(artifact),
        name="artifact.zip",
    )
    second = downloader.download_artifact(
        "https://oss.example/artifact.zip",
        sha256=digest,
        size=len(artifact),
        name="artifact.zip",
    )
    assert first == second and calls == 1
    downloader.close()


def test_cache_prunes_orphan_part_and_old_manifests(
    tmp_path,
):  # pylint: disable=protected-access
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    downloader = ComponentClient(
        updater,
        tmp_path / "cache",
        client=httpx.Client(
            transport=httpx.MockTransport(
                lambda _request: httpx.Response(500),
            ),
        ),
    )
    orphan = downloader.cache_root / "artifacts" / ("a" * 64) / "old.zip.part"
    orphan.parent.mkdir(parents=True)
    orphan.write_bytes(b"old")
    old = time.time() - 8 * 24 * 60 * 60
    os.utime(orphan, (old, old))
    manifests = downloader.cache_root / "manifests"
    for index in range(10):
        directory = manifests / f"{index:064x}"
        directory.mkdir(parents=True)
        (directory / "manifest.json").write_text("{}", encoding="utf-8")
        os.utime(directory, (old + index, old + index))
    downloader._prune_cache(protected=set())
    assert not orphan.exists()
    assert len([item for item in manifests.iterdir() if item.is_dir()]) == 8
    downloader.close()


def _p1_client(tmp_path, handler):
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    return ComponentClient(
        updater,
        tmp_path / "cache",
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )


def test_stale_download_lease_is_reclaimed(tmp_path):
    """P1-1a: a crash-remnant lease older than the TTL must not block a day."""
    artifact = b"data"
    calls = 0

    def handler(_request):
        nonlocal calls
        calls += 1
        return httpx.Response(
            200,
            content=artifact,
            headers={"Content-Length": str(len(artifact))},
        )

    downloader = _p1_client(tmp_path, handler)
    digest = hashlib.sha256(artifact).hexdigest()
    lease = downloader.cache_root / "artifacts" / digest / ".download.lock"
    lease.mkdir(parents=True)
    # Age the lease well past the staleness TTL (simulated crash remnant).
    old = time.time() - 3600
    os.utime(lease, (old, old))

    path = downloader.download_artifact(
        "https://oss.example/artifact.zip",
        sha256=digest,
        size=len(artifact),
        name="artifact.zip",
    )
    assert path.read_bytes() == artifact
    assert calls == 1
    downloader.close()


def test_fresh_download_lease_still_blocks(tmp_path):
    """P1-1a guard rail: a live (fresh) lease must still fail fast."""
    artifact = b"data"
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    downloader = ComponentClient(
        updater,
        tmp_path / "cache",
        client=httpx.Client(
            transport=httpx.MockTransport(
                lambda _r: httpx.Response(200, content=artifact),
            ),
        ),
    )
    digest = hashlib.sha256(artifact).hexdigest()
    lease = downloader.cache_root / "artifacts" / digest / ".download.lock"
    lease.mkdir(parents=True)  # fresh mtime => live download
    with pytest.raises(ComponentUpdateError, match="already in progress"):
        downloader.download_artifact(
            "https://oss.example/artifact.zip",
            sha256=digest,
            size=len(artifact),
            name="artifact.zip",
        )
    downloader.close()


def test_long_download_lease_with_fresh_part_is_not_reclaimed(tmp_path):
    """Claim 1: a >TTL download with an actively written .part stays live."""
    artifact = b"data"
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    downloader = ComponentClient(
        updater,
        tmp_path / "cache",
        client=httpx.Client(
            transport=httpx.MockTransport(
                lambda _r: httpx.Response(200, content=artifact),
            ),
        ),
    )
    digest = hashlib.sha256(artifact).hexdigest()
    root = downloader.cache_root / "artifacts" / digest
    lease = root / ".download.lock"
    part = root / "artifact.zip.part"
    lease.mkdir(parents=True)
    # Lease dir looks ancient (long download started 2h ago)...
    old = time.time() - 7200
    os.utime(lease, (old, old))
    # ...but the payload is being written right now => still live.
    part.write_bytes(b"partial")

    with pytest.raises(ComponentUpdateError, match="already in progress"):
        downloader.download_artifact(
            "https://oss.example/artifact.zip",
            sha256=digest,
            size=len(artifact),
            name="artifact.zip",
        )
    downloader.close()


def test_old_owner_cannot_delete_reclaimed_lease(tmp_path):
    """Claim 1: releasing with a stale token must not remove the new lease."""
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    downloader = ComponentClient(
        updater,
        tmp_path / "cache",
        client=httpx.Client(
            transport=httpx.MockTransport(
                lambda _r: httpx.Response(200, content=b"data"),
            ),
        ),
    )
    root = downloader.cache_root / "artifacts" / "abc"
    root.mkdir(parents=True)
    lease = root / ".download.lock"
    part = root / "a.zip.part"
    # Process A acquires.
    token_a = downloader._acquire_download_lease(lease, part)
    # Force staleness (lease + part both ancient).
    old = time.time() - 7200
    os.utime(lease, (old, old))
    # Process B reclaims and acquires.
    token_b = downloader._acquire_download_lease(lease, part)
    assert token_b != token_a
    # A finally finishes and tries to release; must NOT delete B's lease.
    downloader._release_download_lease(lease, token_a)
    assert lease.is_dir(), "old owner must not remove the reclaimed lease"
    # B releases normally.
    downloader._release_download_lease(lease, token_b)
    assert not lease.exists()
    downloader.close()
