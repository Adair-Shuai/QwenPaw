# -*- coding: utf-8 -*-
"""Signed backend updates transact their channel support together."""

import base64
import hashlib
import importlib
import json
import random
import shutil
import zipfile
from pathlib import Path

import httpx
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from qwenpaw.components.client import ComponentClient
from qwenpaw.components.service import ComponentUpdateService
from qwenpaw.components.update import ComponentUpdateError, ComponentUpdater

ROOT = Path(__file__).resolve().parents[3]
BASE_URL = "https://example.test/channels"
SCRIPTS = ROOT / "scripts/pack-tauri"


def _helpers(monkeypatch):
    monkeypatch.syspath_prepend(str(SCRIPTS))
    return tuple(
        importlib.import_module(name)
        for name in (
            "stage_desktop_components",
            "build_component_release",
            "verify_component_release",
            "component_host",
        )
    )


def _backend(root, version):
    backend = root / "binaries/app/backend" / version
    support = backend / "channel-runtime/site/qwenpaw"
    support.mkdir(parents=True)
    (backend / "stable.bin").write_bytes(random.Random(17).randbytes(100_000))
    (backend / "qwenpaw").mkdir()
    (backend / "qwenpaw/__version__.py").write_text(
        f"__version__ = {version!r}\n",
        encoding="utf-8",
    )
    (support / "channel_protocol").mkdir()
    (support / "channel_protocol/shared_worker.py").write_text(
        f"HOST = {version!r}\n",
        encoding="utf-8",
    )
    (backend / "channel-runtime/runtime.json").write_text(
        json.dumps(
            {
                "schema_version": 1,
                "host_version": version,
                "support_root": "channel-runtime/site",
                "dependency_paths": ["channel-runtime/site"],
            },
        ),
        encoding="utf-8",
    )
    state = root / "binaries/state"
    state.mkdir()
    (state / "active.json").write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "components": {
                    "backend": {
                        "version": version,
                        "kind": "python",
                        "path": backend.relative_to(root).as_posix(),
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    return backend


def _release(tmp_path, monkeypatch, target, delta):
    stage, builder, verifier, host = _helpers(monkeypatch)
    old = _backend(tmp_path / "old-resources", "2.3.0b3")
    new = _backend(tmp_path / "new-resources", "2.3.0b4")
    bases, source = tmp_path / "bases/base", tmp_path / "source"
    stage.stage(old.parents[2], bases, "2.3.0b3")
    stage.stage(new.parents[2], source, "2.3.0b4")
    private = Ed25519PrivateKey.generate()
    raw = private.private_bytes(
        serialization.Encoding.Raw,
        serialization.PrivateFormat.Raw,
        serialization.NoEncryption(),
    )
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    output = tmp_path / "release"
    manifest = builder.build_release(
        source,
        output,
        product="qwenpaw",
        channel="stable",
        target=target,
        core_min_version="2.2.2b9",
        protocol_version=2,
        release_version="2.3.0b4",
        release_id="candidate",
        base_url=BASE_URL,
        private_key_b64=base64.b64encode(raw).decode(),
        base_root=bases.parent if delta else None,
    )
    verified = verifier.verify_release(
        output,
        manifest,
        target=target,
        base_url=BASE_URL,
        public_key=public,
    )
    assert verified["artifacts"] == (2 if delta else 1)
    return bases / "backend", source, output, manifest, private, public, host


@pytest.mark.parametrize("target", ["windows-x86_64", "macos-aarch64"])
@pytest.mark.parametrize("route", ["full", "delta"])
def test_signed_backend_update_switches_channel_support_atomically(
    tmp_path,
    monkeypatch,
    target,
    route,
):
    # One real signed download/install transaction and its previous pointer.
    # pylint: disable=too-many-statements
    old, _, output, manifest_path, _, public, _ = _release(
        tmp_path,
        monkeypatch,
        target,
        route == "delta",
    )
    service_module = importlib.import_module("qwenpaw.components.service")
    managed = tmp_path / "working/components/managed"
    installed = managed / "backend/2.3.0b3"
    shutil.copytree(old, installed)
    active = managed.parent / "active.json"
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": target,
                "components": {
                    "backend": {
                        "version": "2.3.0b3",
                        "kind": "python",
                        "path": str(installed),
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    monkeypatch.setenv(
        "QWENPAW_TAURI_RESOURCE_DIR",
        str(tmp_path / "resources"),
    )
    monkeypatch.setenv("QWENPAW_COMPONENT_PROTOCOL", "2")
    monkeypatch.setenv(
        "QWENPAW_HOST_FINGERPRINT",
        manifest["host_fingerprint"],
    )
    monkeypatch.setattr(service_module, "_MANAGED_COMPONENTS_ROOT", managed)
    monkeypatch.setattr(
        service_module,
        "_COMPONENT_INSTALL_LOCKS",
        tmp_path / "install-locks",
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"backend"},
        directory_components={"backend"},
        target=target,
        core_version="2.3.0b3",
        active_path=active,
        defer_activation_cleanup=True,
    )

    def respond(request):
        relative = str(request.url).removeprefix(BASE_URL + "/")
        return httpx.Response(200, content=(output / relative).read_bytes())

    client = ComponentClient(
        updater,
        tmp_path / "cache",
        client=httpx.Client(transport=httpx.MockTransport(respond)),
        default_allowed_host="example.test",
    )
    service = ComponentUpdateService(
        updater,
        client,
        BASE_URL + f"/metadata/components/stable/{target}.current.json",
    )
    try:
        with updater.directory_transaction():
            # This is the actual service installer; only transport is local.
            # pylint: disable=protected-access
            result = service._install_component("backend")
            assert (
                json.loads(active.read_text(encoding="utf-8"))["components"][
                    "backend"
                ]["version"]
                == "2.3.0b3"
            )
        assert result["kind"] == route
        payload = json.loads(active.read_text(encoding="utf-8"))
        selected = Path(payload["components"]["backend"]["path"])
        assert selected == managed / "backend/2.3.0b4"
        assert (
            json.loads(
                (selected / "channel-runtime/runtime.json").read_text(
                    encoding="utf-8",
                ),
            )["host_version"]
            == "2.3.0b4"
        )
        assert "2.3.0b4" in (
            selected / "channel-runtime/site/qwenpaw/"
            "channel_protocol/shared_worker.py"
        ).read_text(encoding="utf-8")
        assert payload["previous_runtime_components"]["backend"][
            "path"
        ] == str(installed)
        assert (
            json.loads(
                (installed / "channel-runtime/runtime.json").read_text(
                    encoding="utf-8",
                ),
            )["host_version"]
            == "2.3.0b3"
        )
        assert set(manifest["components"]) == {"backend"}
    finally:
        client.close()


def test_signed_backend_gate_rejects_changed_channel_support(
    tmp_path,
    monkeypatch,
):
    _, _, output, manifest_path, private, public, _ = _release(
        tmp_path,
        monkeypatch,
        "windows-x86_64",
        False,
    )
    verifier = importlib.import_module("verify_component_release")
    canonical = importlib.import_module("component_common").canonical_json
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    artifact = manifest["components"]["backend"]["full"]
    archive_path = output / artifact["url"].removeprefix(BASE_URL + "/")
    with zipfile.ZipFile(archive_path) as archive:
        entries = {name: archive.read(name) for name in archive.namelist()}
    entries["channel-runtime/runtime.json"] = b'{"host_version":"wrong"}'
    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, content in entries.items():
            archive.writestr(name, content)
    raw = archive_path.read_bytes()
    artifact.update(
        size=len(raw),
        sha256=hashlib.sha256(raw).hexdigest(),
        signature=base64.b64encode(private.sign(raw)).decode(),
    )
    manifest_path.write_bytes(canonical(manifest))
    manifest_path.with_suffix(".json.sig").write_text(
        base64.b64encode(private.sign(manifest_path.read_bytes())).decode(),
        encoding="utf-8",
    )
    with pytest.raises(ValueError, match="payload differs"):
        verifier.verify_release(
            output,
            manifest_path,
            target="windows-x86_64",
            base_url=BASE_URL,
            public_key=public,
        )


def test_channel_launcher_changes_host_fingerprint_and_blocks_old_desktop(
    tmp_path,
    monkeypatch,
):
    _, _, _, manifest_path, _, public, host = _release(
        tmp_path,
        monkeypatch,
        "windows-x86_64",
        False,
    )
    path = tmp_path / "host/console/src-tauri/src/channel_runtime.rs"
    path.parent.mkdir(parents=True)
    path.write_bytes(
        (ROOT / "console/src-tauri/src/channel_runtime.rs").read_bytes(),
    )
    old = host.host_fingerprint(tmp_path / "host")
    path.write_bytes(
        path.read_bytes() + b"\n// changed launcher resource contract\n",
    )
    assert host.host_fingerprint(tmp_path / "host") != old
    monkeypatch.setenv(
        "QWENPAW_TAURI_RESOURCE_DIR",
        str(tmp_path / "resources"),
    )
    monkeypatch.setenv("QWENPAW_COMPONENT_PROTOCOL", "2")
    monkeypatch.setenv("QWENPAW_HOST_FINGERPRINT", old)
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="2.3.0b3",
    )
    with pytest.raises(ComponentUpdateError, match="host changed"):
        updater.load_manifest(
            manifest_path,
            manifest_path.with_suffix(".json.sig"),
        )
