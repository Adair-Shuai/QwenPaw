# -*- coding: utf-8 -*-
from __future__ import annotations

import base64
import hashlib
import json

import httpx
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from qwenpaw.components.client import ComponentClient
from qwenpaw.components.update import ComponentUpdater


def test_oss_manifest_and_artifact_download(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(private.public_key().public_bytes(serialization.Encoding.Raw, serialization.PublicFormat.Raw)).decode()
    manifest = json.dumps({"schema_version": 1, "target": "windows-x86_64", "core_min_version": "1.0.0", "components": {}}, separators=(",", ":")).encode()
    signature = base64.b64encode(private.sign(manifest))
    artifact = b"artifact-bytes"
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("manifest.json"):
            return httpx.Response(200, content=manifest)
        if request.url.path.endswith("manifest.json.sig"):
            return httpx.Response(200, content=signature)
        return httpx.Response(200, content=artifact, headers={"Content-Length": str(len(artifact))})
    client = httpx.Client(transport=httpx.MockTransport(handler))
    updater = ComponentUpdater(public_key_b64=public, managed_components=set(), target="windows-x86_64", core_version="1.0.0")
    downloader = ComponentClient(updater, tmp_path / "cache", client=client)
    assert downloader.fetch_manifest("https://oss.example/manifest.json")["schema_version"] == 1
    path = downloader.download_artifact("https://oss.example/artifact.zip", sha256=hashlib.sha256(artifact).hexdigest(), size=len(artifact), name="artifact.zip")
    assert path.read_bytes() == artifact
    downloader.close()
