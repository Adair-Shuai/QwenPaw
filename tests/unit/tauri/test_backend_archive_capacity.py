# -*- coding: utf-8 -*-
"""Real signed backend archives retain finite, component-specific bounds."""

import base64
from dataclasses import replace
import hashlib
import importlib
import json
from pathlib import Path
import random
import shutil
from types import SimpleNamespace
import zipfile

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.exceptions import InvalidSignature
import httpx
import pytest

from qwenpaw.components.client import ComponentClient
from qwenpaw.components.service import ComponentUpdateService
from qwenpaw.components.update import (
    ComponentUpdateError,
    ComponentUpdatePlan,
    ComponentUpdater,
)

ROOT = Path(__file__).resolve().parents[3]
BASE_URL = "https://example.test/updates"
OLD_HOST = "285c7ac38d9ffdc36f7144ab7a27e1b0b1ba3c1f61318d8bcb9cf5cd6bf5a854"


@pytest.fixture(scope="module", name="helpers")
def helper_modules():
    with pytest.MonkeyPatch.context() as patch:
        patch.syspath_prepend(str(ROOT / "scripts/pack-tauri"))
        return SimpleNamespace(
            release=importlib.import_module("build_component_release"),
            verifier=importlib.import_module("verify_component_release"),
            artifacts=importlib.import_module("verify_component_artifacts"),
            prepare=importlib.import_module("prepare_component_base"),
            update=importlib.import_module("qwenpaw.components.update"),
            service=importlib.import_module("qwenpaw.components.service"),
            common=importlib.import_module("component_common"),
        )


def _component(root, version, stable):
    root.mkdir(parents=True)
    (root / "component.json").write_text(
        json.dumps(
            {
                "schema_version": 1,
                "id": "backend",
                "version": version,
                "install_scope": "desktop-runtime",
                "preserve": [],
            },
        ),
        encoding="utf-8",
    )
    (root / "main.py").write_text(f"VERSION={version!r}\n", encoding="utf-8")
    (root / "stable.bin").write_bytes(stable)


@pytest.fixture(
    scope="module",
    params=["windows-x86_64", "macos-aarch64"],
    name="large_release",
)
def signed_backend_release(tmp_path_factory, helpers, request):
    root = tmp_path_factory.mktemp("backend-capacity")
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
    stable = random.Random(217).randbytes(2 * 1024 * 1024)
    old = root / "old/backend"
    source = root / "source/backend"
    _component(old, "2.3.0b3", stable)
    _component(source, "2.3.0b4", stable)
    support = source / "c/s/provider"
    support.mkdir(parents=True)
    for index in range(10_010):
        (support / f"module_{index}.py").write_bytes(b"VALUE = 1\n")
    output = root / "release"
    with pytest.MonkeyPatch.context() as patch:
        patch.delenv("COMPONENT_SIGNING_PUBLIC_KEY", raising=False)
        manifest = helpers.release.build_release(
            source.parent,
            output,
            product="qwenpaw",
            channel="stable",
            target=request.param,
            core_min_version="2.2.2b9",
            release_version="2.3.0b4",
            protocol_version=2,
            base_url=BASE_URL,
            private_key_b64=raw_key,
            base_root=old.parent,
            release_id="large-backend",
        )
    document = json.loads(manifest.read_text(encoding="utf-8"))
    entry = document["components"]["backend"]
    assert len(entry["deltas"]) == 1
    for item in (entry["full"], entry["deltas"][0]):
        path = output / item["url"].removeprefix(BASE_URL + "/")
        with zipfile.ZipFile(path) as archive:
            assert 10_000 < len(archive.infolist()) < 50_000
    result = helpers.verifier.verify_release(
        output,
        manifest,
        target=request.param,
        base_url=BASE_URL,
        public_key=public,
    )
    assert result["artifacts"] == 2
    return SimpleNamespace(
        root=root,
        source=source,
        old=old,
        output=output,
        manifest=manifest,
        document=document,
        entry=entry,
        private=private,
        public=public,
        raw_key=raw_key,
        target=request.param,
    )


def _limits(module, component):
    if "_archive_limits" in vars(module):
        return vars(module)["_archive_limits"](component)
    return vars(module)["_LARGE_DIRECTORY_ARCHIVE_LIMITS"].get(
        component,
        (10_000, 768 * 1024**2, 128 * 1024**2),
    )


def test_backend_archive_capacity_contract_is_consistent(helpers):
    for module in (
        helpers.release,
        helpers.artifacts,
        helpers.prepare,
        helpers.update,
    ):
        assert _limits(module, "backend") == (
            50_000,
            1024**3,
            128 * 1024**2,
        )
        assert _limits(module, "python-packages") == (
            150_000,
            6 * 1024**3,
            1024**3,
        )
        for component in ("demo", "ugsci", "backend-extra", "python-runtime"):
            assert _limits(module, component) == (
                10_000,
                768 * 1024**2,
                128 * 1024**2,
            )


def _configure(
    large_release,
    tmp_path,
    monkeypatch,
    helpers,
    *,
    old_host=False,
):
    monkeypatch.setenv(
        "QWENPAW_TAURI_RESOURCE_DIR",
        str(tmp_path / "resources"),
    )
    monkeypatch.setenv("QWENPAW_COMPONENT_PROTOCOL", "2")
    monkeypatch.setenv(
        "QWENPAW_HOST_FINGERPRINT",
        OLD_HOST if old_host else large_release.document["host_fingerprint"],
    )
    monkeypatch.delenv("COMPONENT_SIGNING_PUBLIC_KEY", raising=False)
    monkeypatch.setattr(
        helpers.service,
        "_MANAGED_COMPONENTS_ROOT",
        tmp_path / "managed",
    )
    monkeypatch.setattr(
        helpers.service,
        "_COMPONENT_INSTALL_LOCKS",
        tmp_path / "locks",
    )
    monkeypatch.setattr(
        helpers.service,
        "get_plugins_dir",
        lambda: tmp_path / "plugins",
    )
    installed = tmp_path / "managed/backend/2.3.0b3"
    shutil.copytree(large_release.old, installed)
    active = tmp_path / "active.json"
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": large_release.target,
                "components": {
                    "backend": {
                        "version": "2.3.0b3",
                        "path": str(installed),
                        "kind": "python",
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    updater = ComponentUpdater(
        public_key_b64=large_release.public,
        managed_components={"backend"},
        directory_components={"backend"},
        core_version="2.3.0b4",
        target=large_release.target,
        active_path=active,
        defer_activation_cleanup=True,
    )
    return updater, installed, active


@pytest.mark.parametrize("route", ["delta", "full"])
@pytest.mark.parametrize("abort", [False, True])
def test_large_backend_signed_full_delta_and_rollback(
    large_release,
    helpers,
    tmp_path,
    monkeypatch,
    route,
    abort,
):
    if route == "full" and not abort:
        monkeypatch.setattr(
            helpers.prepare,
            "_get",
            lambda url: (
                large_release.output / url.removeprefix(BASE_URL + "/")
            ).read_bytes(),
        )
        prepared = tmp_path / "prepared"
        assert helpers.prepare.prepare_base(
            large_release.source.parent,
            prepared,
            manifest_url=BASE_URL
            + "/"
            + large_release.manifest.relative_to(
                large_release.output,
            ).as_posix(),
            private_key_b64=large_release.raw_key,
            expected_target=large_release.target,
            allow_missing=False,
        )
        assert (
            helpers.common.file_inventory(prepared / "backend", ())
            == large_release.entry["files"]
        )
    updater, installed, active = _configure(
        large_release,
        tmp_path,
        monkeypatch,
        helpers,
    )
    original = active.read_bytes()
    requests = []

    def respond(request):
        url = str(request.url)
        requests.append(url)
        if route == "full" and url.endswith("/delta.zip"):
            return httpx.Response(404, content=b"force real full fallback")
        return httpx.Response(
            200,
            content=(
                large_release.output / url.removeprefix(BASE_URL + "/")
            ).read_bytes(),
        )

    client = ComponentClient(
        updater,
        tmp_path / "cache",
        client=httpx.Client(transport=httpx.MockTransport(respond)),
        default_allowed_host="example.test",
    )
    try:
        pointer = (
            BASE_URL
            + "/metadata/components/stable/"
            + f"{large_release.target}.current.json"
        )
        manifest = client.fetch_manifest(pointer)
        service = ComponentUpdateService(updater, client, pointer)

        def install():
            with updater.directory_transaction():
                outcome = service.install_from_manifest("backend", manifest)
                assert outcome["kind"] == route
                assert active.read_bytes() == original
                assert (
                    updater.candidate_directory_records["backend"]["version"]
                    == "2.3.0b4"
                )
                if abort:
                    raise ComponentUpdateError(
                        "later runtime candidate rejected",
                    )

        if abort:
            with pytest.raises(ComponentUpdateError, match="later runtime"):
                install()
            assert active.read_bytes() == original
            assert updater.active_directory_record("backend")[1] == installed
        else:
            install()
            payload = json.loads(active.read_text(encoding="utf-8"))
            selected = Path(payload["components"]["backend"]["path"])
            assert (
                helpers.common.file_inventory(selected, ())
                == large_release.entry["files"]
            )
            assert payload["previous_runtime_components"]["backend"][
                "path"
            ] == str(installed)
        assert (installed / "main.py").read_text(
            encoding="utf-8",
        ) == "VERSION='2.3.0b3'\n"
        assert not (installed / "c").exists()
        assert any(url.endswith("/delta.zip") for url in requests)
        assert any(url.endswith("/full.zip") for url in requests) == (
            route == "full"
        )
    finally:
        client.close()


def _plan(archive, private, *, component="backend", kind="full"):
    raw = archive.read_bytes()
    return ComponentUpdatePlan(
        component,
        "2.3.0b3",
        "2.3.0b4",
        kind,
        BASE_URL + "/full.zip",
        hashlib.sha256(raw).hexdigest(),
        base64.b64encode(private.sign(raw)).decode(),
        (),
    )


def _updater(public, *, component="backend"):
    return ComponentUpdater(
        public_key_b64=public,
        managed_components={component},
        directory_components={component} if component == "backend" else set(),
        core_version="2.3.0b4",
        target="windows-x86_64",
    )


def _byte_budget_archive(archive, budget):
    # Compress real streamed bytes: headers describe actual payload sizes,
    # without allocating a GiB buffer or extracting an unsafe archive.
    chunk = bytes(64 * 1024)
    sizes = (
        [128 * 1024**2] * 8 if budget == "total" else [128 * 1024**2 + 1]
    )
    with zipfile.ZipFile(
        archive,
        "w",
        compression=zipfile.ZIP_DEFLATED,
    ) as bundle:
        bundle.writestr("delta.json", '{"component":"backend"}')
        for index, size in enumerate(sizes):
            with bundle.open(f"c/s/provider_{index}.bin", "w") as member:
                while size:
                    length = min(size, len(chunk))
                    member.write(chunk[:length])
                    size -= length


@pytest.mark.parametrize("budget", ["members", "total", "member"])
def test_backend_archive_capacity_rejects_above_budget(
    helpers,
    tmp_path,
    budget,
):
    archive = tmp_path / "oversized.zip"
    if budget == "members":
        with zipfile.ZipFile(archive, "w") as bundle:
            bundle.writestr("delta.json", '{"component":"backend"}')
            for index in range(49_999):
                bundle.writestr(f"c/s/f{index}.py", b"")
        vars(helpers.release)["_validate_archive"](
            archive,
            component="backend",
        )
        with zipfile.ZipFile(archive, "a") as bundle:
            bundle.writestr("c/s/above_budget.py", b"")
        message = r"backend.*members=50001/50000.*bytes="
    else:
        _byte_budget_archive(archive, budget)
        message = (
            r"backend.*bytes=1073741847/1073741824"
            if budget == "total"
            else r"backend.*member_bytes=134217729/134217728"
        )
    with pytest.raises(ValueError, match=message):
        vars(helpers.release)["_validate_archive"](
            archive,
            component="backend",
        )
    with pytest.raises(ValueError, match="limits"):
        vars(helpers.verifier)["_verify_archive"](archive, "backend", {}, None)
    prepare_message = {
        "members": "invalid members",
        "total": "too large",
        "member": "unsafe member",
    }[budget]
    with pytest.raises(ValueError, match=prepare_message):
        vars(helpers.prepare)["_safe_extract"](
            archive.read_bytes(),
            tmp_path / "prepared",
            component="backend",
        )
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    updater = _updater(public)
    plan = _plan(archive, private)
    full_message = (
        "invalid full artifact member"
        if budget == "member"
        else "safety limits"
    )
    with pytest.raises(ComponentUpdateError, match=full_message):
        updater.apply_full(
            plan,
            archive,
            tmp_path / "managed/new",
            expected_files={},
        )
    base = tmp_path / "base"
    base.mkdir()
    with pytest.raises(ComponentUpdateError, match="safety limit"):
        updater.apply_delta(
            replace(plan, artifact_kind="delta"),
            base,
            archive,
            tmp_path / "managed/delta",
        )
    delta_message = (
        "too many archive members" if budget == "members" else "too large"
    )
    with pytest.raises(ValueError, match=delta_message):
        helpers.artifacts.apply_delta(base, archive, tmp_path / "delta-output")
    assert not (tmp_path / "managed/new").exists()


def test_backend_archive_capacity_does_not_relax_plugin_limit(
    large_release,
    helpers,
    tmp_path,
):
    archive = large_release.output / large_release.entry["full"][
        "url"
    ].removeprefix(BASE_URL + "/")
    with pytest.raises(ValueError, match="too many members"):
        vars(helpers.release)["_validate_archive"](archive, component="demo")
    with pytest.raises(ValueError, match="limits"):
        vars(helpers.verifier)["_verify_archive"](archive, "demo", {}, None)
    with pytest.raises(ValueError, match="invalid members"):
        vars(helpers.prepare)["_safe_extract"](
            archive.read_bytes(),
            tmp_path / "prepared",
            component="demo",
        )
    updater = _updater(large_release.public, component="demo")
    with pytest.raises(ComponentUpdateError, match="safety limits"):
        updater.apply_full(
            _plan(archive, large_release.private, component="demo"),
            archive,
            tmp_path / "plugins/demo",
            expected_files={},
        )


@pytest.mark.parametrize("fault", ["hash", "signature", "inventory"])
def test_large_backend_rejects_tampering_and_inventory_changes(
    large_release,
    helpers,
    tmp_path,
    monkeypatch,
    fault,
):
    output = tmp_path / "release"
    shutil.copytree(large_release.output, output)
    manifest = output / large_release.manifest.relative_to(
        large_release.output,
    )
    document = json.loads(manifest.read_text(encoding="utf-8"))
    entry = document["components"]["backend"]
    entry["deltas"] = []
    archive = output / entry["full"]["url"].removeprefix(BASE_URL + "/")
    if fault == "hash":
        archive.write_bytes(archive.read_bytes() + b"tampered")
    elif fault == "signature":
        entry["full"]["signature"] = base64.b64encode(bytes(64)).decode()
    else:
        with zipfile.ZipFile(archive, "a") as bundle:
            bundle.writestr("unlisted.py", b"unexpected payload")
        raw = archive.read_bytes()
        entry["full"].update(
            size=len(raw),
            sha256=hashlib.sha256(raw).hexdigest(),
            signature=base64.b64encode(
                large_release.private.sign(raw),
            ).decode(),
        )
    manifest.write_bytes(helpers.common.canonical_json(document))
    manifest.with_suffix(".json.sig").write_text(
        base64.b64encode(
            large_release.private.sign(manifest.read_bytes()),
        ).decode(),
        encoding="utf-8",
    )
    with pytest.raises((ValueError, InvalidSignature)):
        helpers.verifier.verify_release(
            output,
            manifest,
            target=large_release.target,
            base_url=BASE_URL,
            public_key=large_release.public,
        )
    updater, installed, active = _configure(
        large_release,
        tmp_path,
        monkeypatch,
        helpers,
    )
    original = active.read_bytes()
    loaded = updater.load_manifest(manifest, manifest.with_suffix(".json.sig"))
    plan = updater.plan(loaded, "backend", installed)
    with pytest.raises(ComponentUpdateError):
        updater.apply_full(
            plan,
            archive,
            tmp_path / "managed/backend/new",
            expected_files=entry["files"],
            preserve_from=installed,
        )
    assert active.read_bytes() == original
    assert not (tmp_path / "managed/backend/new").exists()


@pytest.mark.parametrize(
    "name",
    ["../outside.py", "c/s/../../../../outside.py"],
)
def test_backend_capacity_keeps_path_and_inventory_guards(
    helpers,
    tmp_path,
    name,
):
    archive = tmp_path / "unsafe.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr(name, b"escape")
    with pytest.raises(ValueError):
        vars(helpers.verifier)["_verify_archive"](archive, "backend", {}, None)
    with pytest.raises(ValueError):
        vars(helpers.prepare)["_safe_extract"](
            archive.read_bytes(),
            tmp_path / "prepared",
            component="backend",
        )
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    with pytest.raises(ComponentUpdateError):
        _updater(public).apply_full(
            _plan(archive, private),
            archive,
            tmp_path / "managed/new",
            expected_files={},
        )
    assert not (tmp_path / "outside.py").exists()


def test_large_backend_manifest_rejects_older_host_before_download(
    large_release,
    helpers,
    tmp_path,
    monkeypatch,
):
    updater, installed, active = _configure(
        large_release,
        tmp_path,
        monkeypatch,
        helpers,
        old_host=True,
    )
    assert large_release.document["host_fingerprint"] != OLD_HOST
    original = active.read_bytes()
    requests = []

    def respond(request):
        url = str(request.url)
        requests.append(url)
        return httpx.Response(
            200,
            content=(
                large_release.output / url.removeprefix(BASE_URL + "/")
            ).read_bytes(),
        )

    client = ComponentClient(
        updater,
        tmp_path / "cache",
        client=httpx.Client(transport=httpx.MockTransport(respond)),
        default_allowed_host="example.test",
    )
    try:
        with pytest.raises(
            ComponentUpdateError,
            match="host changed",
        ) as error:
            client.fetch_manifest(
                BASE_URL
                + "/metadata/components/stable/"
                + f"{large_release.target}.current.json",
            )
        assert error.value.reason == "core_below_minimum"
        assert not any(url.endswith(".zip") for url in requests)
        assert active.read_bytes() == original
        assert (installed / "main.py").exists()
    finally:
        client.close()
