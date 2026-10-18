# -*- coding: utf-8 -*-
"""Exercise the real publisher against real ZIP bytes and fake transport."""
import copy
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import zipfile

import oss2
import pytest

REPO = Path(__file__).resolve().parents[4]
spec = importlib.util.spec_from_file_location(
    "document_forms_publisher",
    REPO / "scripts/pack/publish_document_forms.py",
)
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)


@pytest.fixture(name="release")
def release_fixture(tmp_path, monkeypatch):
    root = tmp_path / "dist/document-forms"
    key = "files/plugins/apps/document-forms/document-forms-1.0.0.zip"
    archive = root / key.removeprefix("files/plugins/")
    archive.parent.mkdir(parents=True)
    source = REPO / "plugins/apps/document-forms"
    with zipfile.ZipFile(archive, "w") as z:
        for name in [
            "plugin.json",
            "backend/main.py",
            "backend/engine.py",
            "ui/index.js",
            "README.md",
            "requirements.txt",
        ]:
            z.writestr("document-forms/" + name, (source / name).read_bytes())
    payload = archive.read_bytes()
    manifest = json.loads((source / "plugin.json").read_text(encoding="utf-8"))
    entry = {
        "plugin_id": "document-forms",
        "version": "1.0.0",
        "url": "/" + key,
        "sha256": hashlib.sha256(payload).hexdigest(),
        "qwenpaw_version": manifest["qwenpaw_version"],
    }
    (root / "index.json").write_text(
        json.dumps(
            {"files": {"document-forms-1.0.0": entry}, "updated_at": "now"},
        ),
        encoding="utf-8",
    )
    old = {
        "files": {"other-1.0": {"plugin_id": "other", "sha256": "keep"}},
        "platforms": {"apps": {"versions": ["other-1.0"]}},
        "custom": "preserved",
    }
    objects = {"metadata/plugins/index.json": json.dumps(old).encode()}
    writes = []

    class Bucket:
        def get_object(self, name):
            if name not in objects:
                raise oss2.exceptions.NoSuchKey(
                    404,
                    {},
                    b"",
                    {"Code": "NoSuchKey"},
                )
            return io.BytesIO(objects[name])

        def put_object(self, name, content, headers=None):
            if name != "metadata/plugins/index.json":
                assert headers["x-oss-forbid-overwrite"] == "true"
            writes.append(name)
            objects[name] = content

    bucket = Bucket()
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(publisher.oss2, "Bucket", lambda *args: bucket)
    for name in [
        "OSS_ACCESS_KEY_ID",
        "OSS_ACCESS_KEY_SECRET",
        "OSS_ENDPOINT",
        "OSS_BUCKET",
    ]:
        monkeypatch.setenv(name, "test")
    return root, key, payload, old, objects, writes


def test_publication_preserves_other_apps_and_verifies_remote_bytes(release):
    root, key, payload, old, objects, writes = release
    publisher.main()
    merged = json.loads(objects["metadata/plugins/index.json"])
    assert objects[key] == payload
    assert merged["files"]["other-1.0"] == old["files"]["other-1.0"]
    assert merged["custom"] == "preserved"
    assert merged["platforms"]["apps"]["versions"] == [
        "document-forms-1.0.0",
        "other-1.0",
    ]
    assert (
        json.loads((root / "publication.json").read_text())["status"]
        == "published"
    )
    assert writes == [key, "metadata/plugins/index.json"]


def test_immutable_package_mismatch_cannot_modify_catalog(release):
    _, key, _, _, objects, writes = release
    objects[key] = b"existing immutable version"
    original = copy.deepcopy(objects)
    with pytest.raises(AssertionError, match="Immutable"):
        publisher.main()
    assert objects == original
    assert writes == []


def test_bad_package_digest_cannot_upload(release):
    root, _, _, _, _, writes = release
    index = json.loads((root / "index.json").read_text())
    index["files"]["document-forms-1.0.0"]["sha256"] = "invalid"
    (root / "index.json").write_text(json.dumps(index))
    with pytest.raises(AssertionError):
        publisher.main()
    assert writes == []
