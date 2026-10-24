# -*- coding: utf-8 -*-
"""Real signed archives and compensating metadata promotion."""

import base64
import copy
import importlib.util
import io
import json
import sys
from pathlib import Path
from zipfile import ZipFile

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

ROOT = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location(
    "capacity_publisher",
    ROOT / "scripts/pack/publish_storage_capacity.py",
)
assert spec and spec.loader
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)


class Bucket:
    def __init__(self):
        self.objects = {}
        self.fail_key = None

    def get_object(self, key):
        if key not in self.objects:
            raise publisher.oss2.exceptions.NoSuchKey(404, {}, b"", {})
        return io.BytesIO(self.objects[key])

    def put_object(self, key, content, headers=None):
        if key == self.fail_key:
            self.fail_key = None
            raise OSError("simulated promotion write failure")
        if (headers or {}).get(
            "x-oss-forbid-overwrite",
        ) == "true" and key in self.objects:
            raise OSError("immutable object already exists")
        self.objects[key] = content


def test_actual_app_archive_rejects_private_extra_files_and_modified_bytes(
    tmp_path,
):
    source = ROOT / "plugins/apps/storage-capacity"
    archive = tmp_path / "app.zip"
    with ZipFile(archive, "w") as z:
        for name in sorted(publisher.EXPECTED):
            z.writestr(
                "storage-capacity/" + name,
                (source / name).read_bytes(),
            )
    manifest = json.loads((source / "plugin.json").read_bytes())
    entry = {
        "plugin_id": "storage-capacity",
        "version": manifest["version"],
        "qwenpaw_version": manifest["qwenpaw_version"],
        "sha256": publisher.digest(archive.read_bytes()),
        "size_bytes": archive.stat().st_size,
    }
    assert publisher.verify_app(archive, entry) == archive.read_bytes()
    with ZipFile(archive, "a") as z:
        z.writestr("storage-capacity/data/project.xlsx", b"private project")
    entry.update(
        sha256=publisher.digest(archive.read_bytes()),
        size_bytes=archive.stat().st_size,
    )
    with pytest.raises(ValueError, match="Unexpected"):
        publisher.verify_app(archive, entry)


def test_promotion_restores_prior_objects_on_partial_write_failure():
    bucket = Bucket()
    bucket.objects = {
        "windows": b"old-w",
        "macos": b"old-m",
        "catalog": b"old-c",
    }
    before = copy.deepcopy(bucket.objects)
    bucket.fail_key = "catalog"
    with pytest.raises(OSError, match="write failure"):
        publisher.promote(
            bucket,
            [(k, v, b"new-" + v) for k, v in before.items()],
            "test",
        )
    assert {k: bucket.objects[k] for k in before} == before


def test_catalog_and_immutable_publication_preserve_existing_versions():
    old = {
        "files": {"other-1": {"plugin_id": "other", "version": "1"}},
        "platforms": {"apps": {"versions": ["other-1"]}},
    }
    new = {
        "updated_at": "now",
        "files": {
            "storage-capacity-0.2.0": {
                "plugin_id": "storage-capacity",
                "version": "0.2.0",
                "sha256": "example",
                "updated_at": "now",
            },
        },
    }
    original = copy.deepcopy(old)
    merged = publisher.merge_catalog(old, new)
    assert old == original
    assert merged["files"]["other-1"] == old["files"]["other-1"]
    assert merged["platforms"]["apps"]["versions"] == [
        "storage-capacity-0.2.0",
        "other-1",
    ]
    later = copy.deepcopy(new)
    later["files"]["storage-capacity-0.2.0"]["updated_at"] = "later"
    publisher.merge_catalog(merged, later)
    later["files"]["storage-capacity-0.2.0"]["sha256"] = "changed"
    with pytest.raises(ValueError, match="different metadata"):
        publisher.merge_catalog(merged, later)
    bucket = Bucket()
    publisher.immutable(bucket, "app.zip", b"reviewed", "application/zip")
    with pytest.raises(ValueError, match="collision"):
        publisher.immutable(bucket, "app.zip", b"different", "application/zip")
    assert bucket.objects["app.zip"] == b"reviewed"


def test_signed_application_release_preserves_other_components_and_host_policy(
    tmp_path,
    monkeypatch,
):
    if sys.platform == "win32":
        tmp_path = Path("\\\\?\\" + str(tmp_path))
    key = Ed25519PrivateKey.generate()
    private = base64.b64encode(
        key.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        ),
    ).decode()
    public = base64.b64encode(
        key.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    monkeypatch.setenv("COMPONENT_SIGNING_PUBLIC_KEY", public)
    monkeypatch.setattr(publisher, "PUBLIC_KEY", public)
    base = "https://release.example"
    old_stage = tmp_path / "old-stage"
    for app in ("storage-capacity", "unrelated"):
        directory = old_stage / app
        directory.mkdir(parents=True)
        (directory / "plugin.json").write_text(
            json.dumps(
                {
                    "id": app,
                    "version": "0.1.5",
                    "entry": {"backend": "backend.py"},
                },
            ),
        )
        (directory / "backend.py").write_text("print('old')")
    prior = tmp_path / "prior"
    old_manifest = publisher.build_release(
        old_stage,
        prior,
        product="ugsci",
        channel="stable",
        target="windows-x86_64",
        core_min_version="2.2.2b9",
        base_url=base,
        private_key_b64=private,
        release_id="previous",
        release_version="2.2.2b9",
        release_sequence=1,
        release_attempt=1,
    )
    bucket = Bucket()
    for path in prior.rglob("*"):
        if path.is_file():
            bucket.objects[
                path.relative_to(prior).as_posix()
            ] = path.read_bytes()
    original = json.loads(old_manifest.read_bytes())
    new_stage = tmp_path / "new-stage"
    directory = new_stage / "storage-capacity"
    directory.mkdir(parents=True)
    (directory / "plugin.json").write_text(
        json.dumps(
            {
                "id": "storage-capacity",
                "version": "0.2.0",
                "entry": {"backend": "backend.py"},
            },
        ),
    )
    (directory / "backend.py").write_text("print('new implementation')")
    result = publisher.prepare_target(
        bucket,
        tmp_path / "release",
        new_stage,
        "windows-x86_64",
        base,
        private,
        "app-0.2.0",
        2,
        1,
    )
    pointer = json.loads(result[2])
    manifest = json.loads(
        bucket.objects[publisher.key_for(pointer["manifest_url"], base)],
    )
    assert manifest["components"]["storage-capacity"]["version"] == "0.2.0"
    assert (
        manifest["components"]["unrelated"]
        == original["components"]["unrelated"]
    )
    assert manifest["host_fingerprint"] == original["host_fingerprint"]
    assert manifest["core_min_version"] == original["core_min_version"]
    assert (
        result[1] == bucket.objects[result[0]]
    )  # Not promoted before transaction.
    # Corrupting a byte in the signed current manifest fails closed.
    old_pointer = json.loads(result[1])
    old_key = publisher.key_for(old_pointer["manifest_url"], base)
    bucket.objects[old_key] += b" "
    with pytest.raises(ValueError, match="digest mismatch"):
        publisher.prepare_target(
            bucket,
            tmp_path / "damaged",
            new_stage,
            "windows-x86_64",
            base,
            private,
            "app-retry",
            3,
            1,
        )
