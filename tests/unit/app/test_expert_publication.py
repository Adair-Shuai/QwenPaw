# -*- coding: utf-8 -*-
"""Real signed release publication; only the OSS transport is in-memory."""

import base64
import hashlib
import json
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from qwenpaw import publisher_service as publisher
from qwenpaw.expert_packages.source import Channel
from qwenpaw.expert_packages.publication import index_path, manifest_path
from scripts.build_expert_release import build
from scripts.seal_expert_release import seal
from tests.unit.app.test_expert_packages import payload, fixture_release
from tests.unit.app.routers.test_publisher_service import Bucket, headers


def endpoint(monkeypatch, key):
    bucket = Bucket()
    monkeypatch.setattr(publisher, "_bucket", lambda kind: bucket)
    monkeypatch.setenv(
        "UGSCI_EXPERT_PUBLIC_KEY",
        base64.b64encode(key.public_key().public_bytes_raw()).decode(),
    )
    monkeypatch.setenv(
        "UGSCI_PUBLISH_IDENTITIES",
        json.dumps(
            [
                {
                    "namespace": name,
                    "role": role,
                    "token_sha256": hashlib.sha256(
                        (name + "-token").encode(),
                    ).hexdigest(),
                }
                for name, role in [
                    ("admin", "admin"),
                    ("alice", "contributor"),
                ]
            ],
        ),
    )
    return TestClient(publisher.app), bucket


@pytest.mark.asyncio
async def test_signed_publication_preflight_idempotence_conflicts_and_readback(
    tmp_path,
    monkeypatch,
):
    _, _, output, key = await fixture_release(tmp_path)
    public = base64.b64encode(key.public_key().public_bytes_raw()).decode()
    bundle = seal(output, key, public)
    client, bucket = endpoint(monkeypatch, key)
    catalog_key = "agents/manifest.json"
    original = json.dumps(
        {"agents": [{"id": "unrelated", "name": "Keep me"}]},
    ).encode()
    bucket.objects[catalog_key] = original
    url = "/v1/expert-packages/releases"
    assert client.post(url, json=bundle, headers=headers()).status_code == 403
    assert (
        client.post(
            url + "/inspect",
            json=bundle,
            headers=headers("admin"),
        ).status_code
        == 200
    )
    assert bucket.objects == {catalog_key: original}
    bucket.corrupt = ".zip"
    failed = client.post(url, json=bundle, headers=headers("admin"))
    assert failed.status_code == 502
    assert bucket.objects[catalog_key] == original
    bucket.corrupt = ""
    result = client.post(url, json=bundle, headers=headers("admin"))
    assert result.status_code == 200, result.text
    assert result.json()["verified"]
    assert (
        client.post(url, json=bundle, headers=headers("admin")).status_code
        == 200
    )
    rows = json.loads(bucket.objects[catalog_key])["agents"]
    assert len(rows) == 2 and rows[0]["id"] == "unrelated"
    # The actual download client consumes exactly what the publisher wrote.
    channel = Channel(
        "https://channel.example",
        public,
        httpx.Client(
            transport=httpx.MockTransport(
                lambda req: httpx.Response(
                    200,
                    content=bucket.objects[req.url.path.lstrip("/")],
                ),
            ),
        ),
    )
    selected, _, _ = channel.release(
        result.json()["package_manifest"],
        "99.0.0",
    )
    assert selected.id == "ugsci.example"
    # A separate build machine must not bypass remote version uniqueness.
    source = tmp_path / "changed"
    spec = payload(source)
    (source / "AGENTS.md").write_text("changed content")
    await build(source, spec, tmp_path / "other-release", key)
    conflicting = seal(tmp_path / "other-release", key, public)
    snapshot = dict(bucket.objects)
    assert (
        client.post(
            url,
            json=conflicting,
            headers=headers("admin"),
        ).status_code
        == 409
    )
    assert bucket.objects == snapshot


@pytest.mark.asyncio
async def test_multi_platform_index_binds_identity_and_rejects_tampering(
    tmp_path,
    monkeypatch,
):
    _, path, output, key = await fixture_release(tmp_path)
    public = base64.b64encode(key.public_key().public_bytes_raw()).decode()
    original = json.loads((output / path).read_bytes())
    foreign = {**original, "target": "foreign-test-target"}
    raw = json.dumps(foreign, sort_keys=True).encode()
    other = output / manifest_path(raw)
    other.write_bytes(raw)
    # Pure-Python fixture models another signed native build; no claim that
    # another OS is actually run by this test.
    bundle = seal(output, key, public)
    client, bucket = endpoint(monkeypatch, key)
    result = client.post(
        "/v1/expert-packages/releases",
        json=bundle,
        headers=headers("admin"),
    )
    assert result.status_code == 200, result.text
    channel = Channel(
        "https://channel.example",
        public,
        httpx.Client(
            transport=httpx.MockTransport(
                lambda req: httpx.Response(
                    200,
                    content=bucket.objects[req.url.path.lstrip("/")],
                ),
            ),
        ),
    )
    selected, _, _ = channel.release(
        result.json()["package_manifest"],
        "99.0.0",
    )
    assert selected.target == original["target"]
    bucket.objects[path] += b" "
    with pytest.raises(ValueError, match="digest mismatch"):
        channel.release(result.json()["package_manifest"], "99.0.0")
    # A valid index signature may not rename/relabel another expert's release.
    bucket.objects[path] = bucket.objects[path].rstrip()
    index = json.loads(base64.b64decode(bundle["index_base64"]))
    index["id"] = "another.expert"
    raw = json.dumps(index).encode()
    pointer = index_path(raw)
    bucket.objects[pointer] = raw
    bucket.objects[pointer + ".sig"] = base64.b64encode(key.sign(raw))
    with pytest.raises(ValueError, match="identity mismatch"):
        channel.release(pointer, "99.0.0")


@pytest.mark.asyncio
async def test_signer_and_publisher_reject_wrong_key_or_changed_artifact(
    tmp_path,
    monkeypatch,
):
    _, _, output, key = await fixture_release(tmp_path)
    public = base64.b64encode(key.public_key().public_bytes_raw()).decode()
    with pytest.raises(ValueError, match="configured expert channel"):
        seal(output, Ed25519PrivateKey.generate(), public)
    # Signing does not execute any package subprocess.
    import asyncio

    async def forbidden(*args, **kwargs):
        raise AssertionError("Signing must not run package code")

    monkeypatch.setattr(asyncio, "create_subprocess_exec", forbidden)
    bundle = seal(output, key, public)
    client, bucket = endpoint(monkeypatch, key)
    bundle["releases"][0]["archive_base64"] = base64.b64encode(
        b"tampered",
    ).decode()
    assert (
        client.post(
            "/v1/expert-packages/releases",
            json=bundle,
            headers=headers("admin"),
        ).status_code
        == 400
    )
    assert not bucket.objects


def test_template_import_preserves_packages_and_contributions(monkeypatch):
    client, bucket = endpoint(monkeypatch, Ed25519PrivateKey.generate())
    existing = [
        {"id": "packaged", "package_manifest": "expert-packages/example.json"},
        {"id": "contributed", "publisher_namespace": "alice"},
        {"id": "legacy"},
    ]
    bucket.objects["agents/manifest.json"] = json.dumps(
        {"agents": existing},
    ).encode()
    new = {
        "id": "new-expert",
        "name": "New",
        "config": "agents/new-expert/agent.json",
    }
    incoming = {
        "catalog": {
            "agents": [
                {"id": "_template"},
                {"id": "packaged", "name": "Overwrite?"},
                {"id": "contributed", "name": "Overwrite?"},
                new,
            ],
        },
    }
    url = "/v1/expert-catalog/import"
    assert (
        client.post(url, json=incoming, headers=headers("admin")).status_code
        == 400
    )
    bucket.objects[new["config"]] = b"{}"
    assert (
        client.post(url, json=incoming, headers=headers("admin")).status_code
        == 200
    )
    rows = json.loads(bucket.objects["agents/manifest.json"])["agents"]
    assert rows[:3] == existing and rows[3] == new
    # Legacy template release endpoint cannot replace a signed package.
    from tests.unit.app.routers.test_publisher_service import expert_payload

    old_flow = expert_payload("9.0.0")
    old_flow["expert"]["id"] = "packaged"
    assert (
        client.post(
            "/v1/releases",
            json=old_flow,
            headers=headers("admin"),
        ).status_code
        == 409
    )


def test_recipe_installs_only_hash_locked_native_wheels(tmp_path):
    import shutil
    import subprocess
    import sys
    from qwenpaw.components.update import detect_target
    from scripts.prepare_expert_recipe import prepare

    root = tmp_path / "recipe"
    root.mkdir()
    spec = payload(root / "payload")
    wheel = root / "payload" / spec["wheels"][0]
    vendor = root / "vendor"
    vendor.mkdir()
    shutil.move(str(wheel), vendor / wheel.name)
    lock = root / "requirements.lock"
    digest = hashlib.sha256((vendor / wheel.name).read_bytes()).hexdigest()
    lock.write_text(f"./vendor/{wheel.name} --hash=sha256:{digest}\n")
    recipe = {
        "schema_version": "expert-recipe.v1",
        "release": spec,
        "variants": [
            {
                "target": detect_target(),
                "python": f"3.{sys.version_info.minor}",
                "lock": "requirements.lock",
            },
        ],
    }
    path = root / "recipe.json"
    path.write_text(json.dumps(recipe))
    prepare(path, tmp_path / "stage")
    assert (tmp_path / "stage/payload/wheels" / wheel.name).read_bytes() == (
        vendor / wheel.name
    ).read_bytes()
    lock.write_text(f"./vendor/{wheel.name} --hash=sha256:{'0' * 64}\n")
    with pytest.raises(subprocess.CalledProcessError):
        prepare(path, tmp_path / "rejected")
    assert not (tmp_path / "rejected/recipe.json").exists()


def test_awsome_workflows_isolate_signing_and_preserve_published_catalog():
    import yaml

    root = (
        Path(__file__).resolve().parents[3]
        / "scripts/expert_channel/Awsome-tools/.github/workflows"
    )
    release = yaml.safe_load(
        (root / "expert-release.yml").read_text(encoding="utf-8"),
    )
    jobs = release["jobs"]
    build_job_json = json.dumps(jobs["build"])
    assert (
        "UGSCI_EXPERT_SIGNING_KEY" not in build_job_json
        and "UGSCI_PUBLISH_TOKEN" not in build_job_json
    )
    assert "--unsigned" in build_job_json
    assert "prepare_expert_recipe.py" in build_job_json
    assert jobs["seal-and-publish"]["needs"] == ["plan", "build"]
    assert jobs["seal-and-publish"]["if"] == "inputs.publish"
    assert jobs["seal-and-publish"]["environment"] == "expert-release"
    steps = jobs["seal-and-publish"]["steps"]
    key_steps = [
        s for s in steps if "UGSCI_EXPERT_SIGNING_KEY" in s.get("env", {})
    ]
    assert (
        len(key_steps) == 1 and "seal_expert_release.py" in key_steps[0]["run"]
    )
    sync = yaml.safe_load(
        (root / "sync-to-oss.yml").read_text(encoding="utf-8"),
    )
    commands = [s.get("run", "") for s in sync["jobs"]["sync"]["steps"]]
    agent_sync = [s for s in commands if "ossutil sync agents/" in s]
    assert len(agent_sync) == 1 and "--delete" not in agent_sync[0]
    assert '--exclude "manifest.json"' in agent_sync[0]
    assert any("publish_expert_release.py --templates" in s for s in commands)


def test_demo_mcp_reports_invalid_input_without_losing_request_identity():
    import subprocess
    import sys

    server = (
        Path(__file__).resolve().parents[3]
        / "scripts/expert_channel/Awsome-tools/experts/version-demo"
        / "payload/server.py"
    )
    request = {
        "jsonrpc": "2.0",
        "id": 42,
        "method": "tools/call",
        "params": {
            "name": "compare_versions",
            "arguments": {"left": "not-a-version", "right": "1.0"},
        },
    }
    result = subprocess.run(
        [sys.executable, "-B", str(server)],
        input=json.dumps(request) + "\n",
        text=True,
        capture_output=True,
        timeout=15,
        check=True,
    )
    response = json.loads(result.stdout)
    assert response["id"] == 42 and response["error"]["code"] == -32602
