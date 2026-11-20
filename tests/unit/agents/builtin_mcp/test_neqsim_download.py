# -*- coding: utf-8 -*-
"""Real signed archives through the optional-runtime download and admission
path.
"""

import base64
import hashlib
import io
import json
import os
import sys
import zipfile
from pathlib import Path

import httpx
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from qwenpaw.agents.builtin_mcp import neqsim_download as download
from qwenpaw.agents.builtin_mcp import neqsim_health as health
from qwenpaw.agents.builtin_mcp import neqsim_runtime as runtime
from qwenpaw.components.update import ComponentUpdateError


def _cloud(monkeypatch, *, corrupt=False, fingerprint=None):
    key = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        key.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    monkeypatch.setenv("QWENPAW_COMPONENT_PUBLIC_KEY", public)
    monkeypatch.setenv(
        "QWENPAW_COMPONENT_MANIFEST_URL",
        "https://runtime.example/current.json",
    )
    monkeypatch.setenv("QWENPAW_DESKTOP_VERSION", "2.3.0b6")
    monkeypatch.delenv("QWENPAW_TAURI_RESOURCE_DIR", raising=False)
    calls = []
    objects = {}
    components = {}
    for name, files in {
        "python-runtime": {"python": b"must not install this"},
        "java-runtime": {
            "bin/java.exe" if os.name == "nt" else "bin/java": b"java",
            "LICENSE": b"Java license",
        },
        "neqsim": {
            "neqsim-mcp-server.jar": b"jar",
            ".neqsim-version": b"3.17.0",
            "NOTICE": b"NeqSim notice",
        },
    }.items():
        data = io.BytesIO()
        with zipfile.ZipFile(data, "w") as archive:
            for path, content in files.items():
                archive.writestr(path, content)
        blob = data.getvalue()
        objects[f"/{name}.zip"] = blob
        components[name] = {
            "kind": "directory",
            "version": "2.3.0b6",
            "preserve": [],
            "files": {
                p: {"size": len(c), "sha256": hashlib.sha256(c).hexdigest()}
                for p, c in files.items()
            },
            "full": {
                "url": f"https://runtime.example/{name}.zip",
                "size": len(blob),
                "sha256": hashlib.sha256(blob).hexdigest(),
                "signature": base64.b64encode(key.sign(blob)).decode(),
            },
        }
    manifest = json.dumps(
        {
            "schema_version": 1,
            "protocol_version": 2,
            "target": download.detect_target(),
            "core_min_version": "2.2.2b9",
            "components": components,
            "host_fingerprint": fingerprint,
        },
    ).encode()
    signature = base64.b64encode(key.sign(manifest)).decode()
    objects["/manifest.json"] = manifest
    objects["/manifest.json.sig"] = signature.encode()
    payload = {
        "schema_version": 1,
        "target": download.detect_target(),
        "release_id": "test",
        "manifest_url": "https://runtime.example/manifest.json",
        "manifest_size": len(manifest),
        "manifest_sha256": hashlib.sha256(manifest).hexdigest(),
        "manifest_signature": signature,
    }
    payload["signature"] = base64.b64encode(
        key.sign(
            json.dumps(
                payload,
                ensure_ascii=False,
                sort_keys=True,
                separators=(",", ":"),
            ).encode()
            + b"\n",
        ),
    ).decode()
    if corrupt:
        payload["manifest_sha256"] = "0" * 64
    objects["/current.json"] = json.dumps(payload).encode()

    def handle(request):
        calls.append(request.url.path)
        return httpx.Response(200, content=objects[request.url.path])

    original = download.ComponentClient
    monkeypatch.setattr(
        download,
        "ComponentClient",
        lambda *a, **kw: original(
            *a,
            **kw,
            client=httpx.Client(transport=httpx.MockTransport(handle)),
        ),
    )
    return calls


def test_cloud_first_install_verifies_archives_without_active_record(
    tmp_path,
    monkeypatch,
):
    calls = _cloud(monkeypatch)
    published_manifests = []
    replace = os.replace

    def publish(source, target):
        if Path(source).parent.name == "manifests":
            assert len(Path(source).name) <= 40
            assert len(Path(target).name) == 64
            published_manifests.append(Path(target))
        return replace(source, target)

    monkeypatch.setattr(os, "replace", publish)
    staging = tmp_path / "staging"
    staging.mkdir()
    assert download.stage_cloud_runtime(
        staging,
        tmp_path / "cache",
        lambda *_: None,
    )
    assert (staging / "neqsim-mcp-server.jar").read_bytes() == b"jar"
    assert (staging / ".neqsim-version").read_text() == "3.17.0"
    assert (staging / "java" / "LICENSE").read_bytes() == b"Java license"
    assert (staging / "NOTICE").read_bytes() == b"NeqSim notice"
    assert "/java-runtime.zip" in calls and "/neqsim.zip" in calls
    assert "/python-runtime.zip" not in calls
    assert not (tmp_path / "active.json").exists()
    assert len(published_manifests) == 1


def test_cloud_signature_failure_never_falls_back(tmp_path, monkeypatch):
    calls = _cloud(monkeypatch, corrupt=True)
    with pytest.raises(ComponentUpdateError, match="signature"):
        download.stage_cloud_runtime(
            tmp_path / "staging",
            tmp_path / "cache",
            lambda *_: None,
        )
    assert not any(path.endswith(".zip") for path in calls)


def test_cloud_first_install_preserves_desktop_compatibility_guards(
    tmp_path,
    monkeypatch,
):
    calls = _cloud(monkeypatch, fingerprint="other-host")
    monkeypatch.setenv("QWENPAW_TAURI_RESOURCE_DIR", str(tmp_path))
    monkeypatch.setenv("QWENPAW_COMPONENT_PROTOCOL", "2")
    monkeypatch.setenv("QWENPAW_HOST_FINGERPRINT", "my-host")
    with pytest.raises(ComponentUpdateError, match="host changed"):
        download.stage_cloud_runtime(
            tmp_path / "staging",
            tmp_path / "cache",
            lambda *_: None,
        )
    assert not any(path.endswith(".zip") for path in calls)


def test_runtime_admission_failure_keeps_old_files(tmp_path, monkeypatch):
    _cloud(monkeypatch)
    root = tmp_path / "runtime"
    root.mkdir()
    (root / "user-file").write_text("keep")
    monkeypatch.setenv("QWENPAW_NEQSIM_RUNTIME_DIR", str(root))
    for key in (
        "JAVA_HOME",
        "NEQSIM_JAR",
        "NEQSIM_HOME",
        "QWENPAW_DESKTOP_JAVA_HOME",
        "QWENPAW_DESKTOP_NEQSIM_JAR",
    ):
        monkeypatch.delenv(key, raising=False)
    monkeypatch.setattr(runtime, "_java_major_version", lambda _: 21)

    def reject(_):
        raise RuntimeError("calculation failed")

    monkeypatch.setattr(health, "verify_runtime", reject)
    with pytest.raises(RuntimeError, match="calculation failed"):
        runtime.install_runtime()
    assert (root / "user-file").read_text() == "keep"
    assert not (root / "neqsim-mcp-server.jar").exists()


def test_downloaded_runtime_is_selected_without_changing_desktop_environment(
    tmp_path,
    monkeypatch,
):
    user = tmp_path / "user"
    bundled = tmp_path / "bundled"
    for root in (user, bundled):
        # pylint: disable-next=protected-access
        java = root / "java" / "bin" / runtime._java_name()
        java.parent.mkdir(parents=True)
        java.write_bytes(b"java")
        (root / "neqsim-mcp-server.jar").write_bytes(b"jar")
        (root / ".neqsim-version").write_text("3.17.0")
    monkeypatch.setenv("QWENPAW_NEQSIM_RUNTIME_DIR", str(user))
    monkeypatch.setenv("QWENPAW_DESKTOP_JAVA_HOME", str(bundled / "java"))
    monkeypatch.setenv(
        "QWENPAW_DESKTOP_NEQSIM_JAR",
        str(bundled / "neqsim-mcp-server.jar"),
    )
    monkeypatch.setattr(runtime, "_java_major_version", lambda _: 21)
    current = runtime.discover_runtime()
    assert current.ready and current.runtime_source == "user"
    assert runtime.build_endpoint(current)["command"].startswith(str(user))
    (user / ".neqsim-version").write_text("9.0.0")
    # pylint: disable-next=protected-access
    runtime._probe_jar_version_cached.cache_clear()
    assert runtime.discover_runtime().runtime_source == "desktop"


@pytest.mark.parametrize("failed", [False, True, "reported"])
def test_runtime_health_executes_stdio_tools_and_flash(tmp_path, failed):
    server = tmp_path / "mcp_server.py"
    receipt = tmp_path / "requests.jsonl"
    server.write_text(
        """import json, sys

for line in sys.stdin:
    p = json.loads(line)
    with open(sys.argv[1], "a") as f:
        f.write(json.dumps(p) + "\\n")
    if "id" not in p:
        continue
    result = {}
    if p["method"] == "tools/list":
        result = {
            "tools": [
                {"name": n}
                for n in [
                    "runFlash",
                    "runPVT",
                    "getPhaseEnvelope",
                    "runProcess",
                    "runPipeline",
                ]
            ]
        }
    if p["method"] == "tools/call":
        result = {
            "isError": sys.argv[2] == "True",
            "content": [
                {
                    "type": "text",
                    "text": json.dumps(
                        {
                            "status": "error"
                            if sys.argv[2] == "reported"
                            else "success",
                            "flash": {"numberOfPhases": 1},
                            "fluid": {"properties": {"density_kgm3": 85.5969}},
                        }
                    ),
                }
            ],
        }
    print(
        json.dumps({"jsonrpc": "2.0", "id": p["id"], "result": result}),
        flush=True,
    )
""",
        encoding="utf-8",
    )
    endpoint = {
        "command": sys.executable,
        "args": [str(server), str(receipt), str(failed)],
    }
    if failed:
        with pytest.raises(RuntimeError, match="闪蒸"):
            health.verify_runtime(endpoint)
    else:
        health.verify_runtime(endpoint)
    requests = [json.loads(line) for line in receipt.read_text().splitlines()]
    assert requests[-1]["params"]["name"] == "runFlash"
    assert requests[-1]["params"]["arguments"]["pressure"] == 100.0
