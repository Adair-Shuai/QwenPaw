# -*- coding: utf-8 -*-
"""Future releases must remain consumable by the actual current updater."""

import base64
import hashlib
import importlib
import json
import random
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import httpx
import pytest
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from packaging.version import Version

from qwenpaw.components.client import ComponentClient
from qwenpaw.components.service import ComponentUpdateService
from qwenpaw.components.update import ComponentUpdateError, ComponentUpdater

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scripts" / "pack-tauri"))
# Release helpers intentionally live outside the installed runtime package.
build_release = importlib.import_module(
    "build_component_release",
).build_release
canonical_json = importlib.import_module("component_common").canonical_json
verify_release = importlib.import_module(
    "verify_component_release",
).verify_release
service_module = importlib.import_module("qwenpaw.components.service")

BASE_URL = "https://example.test/updates"


@pytest.fixture(params=["windows-x86_64", "macos-aarch64"], name="release")
def _release_fixture(tmp_path, request):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    raw_key = base64.b64encode(
        private.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        ),
    ).decode()
    stable = random.Random(123).randbytes(100_000)

    def plugin(path, version):
        path.mkdir(parents=True)
        (path / "plugin.json").write_text(
            json.dumps({"id": "demo", "version": version}),
            encoding="utf-8",
        )
        (path / "stable.bin").write_bytes(stable)
        (path / "main.py").write_text(
            f"VERSION = {version!r}\n",
            encoding="utf-8",
        )
        (path / "engines").mkdir()
        (path / "engines/default.json").write_text(
            '"factory default"',
            encoding="utf-8",
        )

    for index in range(3):
        plugin(tmp_path / f"bases/release-{index}/demo", f"1.{index}.0")
    plugin(tmp_path / "source/demo", "2.0.0")
    runtime = tmp_path / "source/python-runtime"
    runtime.mkdir()
    (runtime / "component.json").write_text(
        json.dumps(
            {
                "schema_version": 1,
                "id": "python-runtime",
                "version": "3.11.9",
                "install_scope": "desktop-runtime",
                "preserve": [],
            },
        ),
        encoding="utf-8",
    )
    (runtime / "python").write_bytes(b"runtime executable fixture")
    (runtime / "python").chmod(0o755)
    output = tmp_path / "release"
    policy = json.loads(
        (ROOT / "scripts/pack-tauri/component_compatibility.json").read_text(),
    )
    minimum = Version(policy["core_min_version"])
    candidate_version = f"{minimum.major}.{minimum.minor}.{minimum.micro + 1}"
    manifest = build_release(
        tmp_path / "source",
        output,
        product="qwenpaw",
        channel="stable",
        target=request.param,
        core_min_version=policy["core_min_version"],
        protocol_version=policy["protocol_version"],
        release_version=candidate_version,
        base_url=BASE_URL,
        private_key_b64=raw_key,
        base_root=tmp_path / "bases",
        release_id="candidate",
    )
    return tmp_path, output, manifest, private, public


def resign_manifest(path, document, private):
    path.write_bytes(canonical_json(document))
    path.with_suffix(".json.sig").write_text(
        base64.b64encode(private.sign(path.read_bytes())).decode(),
        encoding="utf-8",
    )


def local_artifact(output, url):
    return output / url.removeprefix(BASE_URL + "/")


def test_publication_gate_verifies_full_fallback_and_all_deltas(release):
    _, output, manifest, _, public = release
    result = verify_release(
        output,
        manifest,
        target=json.loads(manifest.read_text())["target"],
        base_url=BASE_URL,
        public_key=public,
    )
    assert result["artifacts"] == 5  # two fulls + every supplied plugin base
    completed = subprocess.run(
        [
            sys.executable,
            str(ROOT / "scripts/pack-tauri/verify_component_release.py"),
            "--release-root",
            str(output),
            "--manifest",
            str(manifest),
            "--target",
            result["target"],
            "--base-url",
            BASE_URL,
            "--public-key",
            public,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    assert json.loads(completed.stdout) == result


@pytest.mark.parametrize(
    "fault",
    [
        "full_missing_file",
        "delta_missing_file",
        "delta_wrong_target",
        "missing_full",
        "wrong_hash",
        "wrong_signature",
    ],
)
def test_publication_gate_blocks_broken_but_present_artifacts(release, fault):
    _, output, manifest, private, public = release
    document = json.loads(manifest.read_text())
    entry = document["components"]["demo"]
    item = entry["full"] if fault.startswith("full") else entry["deltas"][0]
    path = local_artifact(output, item["url"])
    if fault == "missing_full":
        del entry["full"]
    elif fault == "wrong_hash":
        item["sha256"] = "0" * 64
    elif fault == "wrong_signature":
        item["signature"] = base64.b64encode(bytes(64)).decode()
    else:
        with zipfile.ZipFile(path) as archive:
            members = {name: archive.read(name) for name in archive.namelist()}
        if fault == "full_missing_file":
            del members["main.py"]
        elif fault == "delta_missing_file":
            del members["files/main.py"]
        else:
            delta = json.loads(members["delta.json"])
            delta["target_version"] = "99.0.0"
            members["delta.json"] = canonical_json(delta)
        with zipfile.ZipFile(
            path,
            "w",
            compression=zipfile.ZIP_DEFLATED,
        ) as archive:
            for name, data in members.items():
                archive.writestr(name, data)
        raw = path.read_bytes()
        item.update(
            size=len(raw),
            sha256=hashlib.sha256(raw).hexdigest(),
            signature=base64.b64encode(private.sign(raw)).decode(),
        )
    resign_manifest(manifest, document, private)
    with pytest.raises((ValueError, InvalidSignature)):
        verify_release(
            output,
            manifest,
            target=document["target"],
            base_url=BASE_URL,
            public_key=public,
        )


@pytest.mark.parametrize(
    "route",
    [
        "delta",
        "missing_delta",
        "modified_base",
        "no_delta_base",
        "corrupt_fallback",
        "old_protocol",
        "old_core",
        "changed_host",
    ],
)
def test_current_updater_preserves_data_across_future_release_routes(
    release,
    monkeypatch,
    route,
):
    tmp_path, output, manifest_path, _, public = release
    manifest = json.loads(manifest_path.read_text())
    plugins = tmp_path / "installed"
    installed = plugins / "demo"
    shutil.copytree(tmp_path / "bases/release-0/demo", installed)
    user_config = b'{"model":"user-selected","private":"kept locally"}'
    (installed / "engines/default.json").write_bytes(user_config)
    (installed / "workspace").mkdir()
    (installed / "workspace/chat.json").write_bytes(b"saved conversation")
    if route == "modified_base":
        (installed / "main.py").write_text(
            "local code modification",
            encoding="utf-8",
        )
    if route == "no_delta_base":
        (installed / "plugin.json").write_text(
            json.dumps({"id": "demo", "version": "0.5.0"}),
            encoding="utf-8",
        )
    original = (installed / "main.py").read_bytes()
    requests = []

    def respond(request):
        url = str(request.url)
        requests.append(url)
        if url.endswith("/delta.zip") and route in {
            "missing_delta",
            "corrupt_fallback",
        }:
            return httpx.Response(404, content=b"unavailable")
        if url.endswith("/full.zip") and route == "corrupt_fallback":
            return httpx.Response(200, content=b"corrupted")
        return httpx.Response(
            200,
            content=local_artifact(output, url).read_bytes(),
        )

    monkeypatch.setattr(service_module, "get_plugins_dir", lambda: plugins)
    monkeypatch.setattr(
        service_module,
        "_ADOPTED_COMPONENTS_PATH",
        tmp_path / "adopted.json",
    )
    monkeypatch.setenv(
        "QWENPAW_COMPONENT_PROTOCOL",
        str(
            manifest["protocol_version"] - 1
            if route == "old_protocol"
            else manifest["protocol_version"],
        ),
    )
    monkeypatch.setenv(
        "QWENPAW_TAURI_RESOURCE_DIR",
        str(tmp_path / "desktop-resources"),
    )
    monkeypatch.setenv(
        "QWENPAW_HOST_FINGERPRINT",
        "different"
        if route == "changed_host"
        else manifest["host_fingerprint"],
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo", "python-runtime"},
        core_version="0.0.0"
        if route == "old_core"
        else manifest["release_version"],
        target=manifest["target"],
        directory_components={"python-runtime"},
    )
    http = httpx.Client(transport=httpx.MockTransport(respond))
    client = ComponentClient(
        updater,
        tmp_path / "cache",
        client=http,
        default_allowed_host="example.test",
    )
    service = ComponentUpdateService(
        updater,
        client,
        BASE_URL
        + f"/metadata/components/stable/{manifest['target']}.current.json",
    )
    try:
        errors = {
            "old_protocol": "host upgrade",
            "old_core": "below component minimum",
            "changed_host": "host changed",
            "corrupt_fallback": "size|sha256",
        }
        if route in errors:
            with pytest.raises(ComponentUpdateError, match=errors[route]):
                service._install_component("demo")
            assert (installed / "main.py").read_bytes() == original
        else:
            result = service._install_component("demo")
            assert result["updated"]
            assert result["kind"] == ("delta" if route == "delta" else "full")
            assert (
                json.loads((installed / "plugin.json").read_text())["version"]
                == "2.0.0"
            )
            assert service._install_component("demo")["reason"] == "up-to-date"
        assert (installed / "engines/default.json").read_bytes() == user_config
        assert (
            installed / "workspace/chat.json"
        ).read_bytes() == b"saved conversation"
        if route in {"old_protocol", "old_core", "changed_host"}:
            assert not any(url.endswith(".zip") for url in requests)
    finally:
        client.close()


def test_update_release_gates_cannot_be_bypassed_by_publication():
    import yaml
    from qwenpaw.distribution import COMPONENT_PUBLIC_KEY

    for name, job in [
        ("component-release.yml", "build-components"),
        ("component-publish.yml", "publish"),
    ]:
        workflow = yaml.safe_load(
            (ROOT / ".github/workflows" / name).read_text(encoding="utf-8"),
        )
        steps = workflow["jobs"][job]["steps"]
        gate = next(
            index
            for index, step in enumerate(steps)
            if "python scripts/pack-tauri/verify_component_release.py"
            in step.get("run", "")
        )
        assert not steps[gate].get("if")
        assert not steps[gate].get("continue-on-error", False)
        upload = next(
            index
            for index, step in enumerate(steps)
            if step.get("uses", "").startswith("actions/upload-artifact@")
            or "ossutil cp" in step.get("run", "")
        )
        assert gate < upload
        assert (
            workflow["jobs"][job]["env"]["COMPONENT_SIGNING_PUBLIC_KEY"]
            == COMPONENT_PUBLIC_KEY
        )
    for name in ["tests.yml", "full-tests-nightly.yml"]:
        workflow = yaml.safe_load(
            (ROOT / ".github/workflows" / name).read_text(encoding="utf-8"),
        )
        run = next(
            step["run"]
            for step in workflow["jobs"]["unit-tests"]["steps"]
            if step.get("name") == "Run unit tests"
        )
        assert run.index(
            "scripts/verify_update_regressions.py --check",
        ) < run.index("pytest tests/unit")
