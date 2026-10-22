"""Publish only document-forms under the shared OSS metadata lock.

Credentials are supplied by GitHub Actions environment. Existing versioned
objects are immutable. An existing valid catalog is required; never bootstrap
an empty one when access fails. Other plugins and product pointers are preserved.
"""

from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import zipfile

import oss2


def verify_bundled_assets(archive):
    """Only reviewed portable templates may enter the public application."""
    source = (
        Path(__file__).resolve().parents[2]
        / "plugins/apps/document-forms/backend/builtin.py"
    )
    spec = importlib.util.spec_from_file_location(
        "public_document_templates", source
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    prefix = "document-forms/templates/"
    entries = json.loads(archive.read(prefix + "index.json"))
    assert [entry["name"] for entry in entries] == list(
        module.NAMES
    ), "Incomplete bundled templates"
    expected = {
        "document-forms/" + name
        for name in (
            "plugin.json",
            "backend/main.py",
            "backend/engine.py",
            "backend/builtin.py",
            "ui/index.js",
            "README.md",
            "requirements.txt",
            "templates/index.json",
            "templates/variables.json",
        )
    } | {prefix + name for name in module.NAMES}
    assert set(archive.namelist()) == expected, "Unexpected application files"
    for entry in entries:
        content = archive.read(prefix + entry["name"])
        assert (
            hashlib.sha256(content).hexdigest() == entry["sha256"]
        ), "Bundled template digest mismatch"
        module.verify_public_template(content)
    fields = json.loads(archive.read(prefix + "variables.json"))
    assert fields and all(
        "value" not in field for field in fields
    ), "Business values in bundled schema"


def main() -> None:
    # One ordered transaction validates bytes before promoting metadata.
    # pylint: disable=too-many-statements
    root = Path("dist/document-forms")
    new = json.loads((root / "index.json").read_text(encoding="utf-8"))
    assert len(new["files"]) == 1, "Only one app may be published"
    file_id, entry = next(iter(new["files"].items()))
    assert entry["plugin_id"] == "document-forms"
    key = entry["url"].lstrip("/")
    assert key.startswith("files/plugins/apps/document-forms/")
    archive = root / key.removeprefix("files/plugins/")
    payload = archive.read_bytes()
    digest = hashlib.sha256(payload).hexdigest()
    assert entry["sha256"] == digest
    with zipfile.ZipFile(archive) as z:
        names = set(z.namelist())
        assert len(names) == len(z.namelist()), "Duplicate ZIP members"
        assert z.testzip() is None, "Corrupt ZIP content"
        assert all(
            name.startswith("document-forms/")
            and ".." not in Path(name).parts
            and "\\" not in name
            for name in names
        ), "Unsafe ZIP path"
        for required in [
            "plugin.json",
            "backend/main.py",
            "ui/index.js",
            "README.md",
            "backend/engine.py",
            "requirements.txt",
        ]:
            assert "document-forms/" + required in names
        assert not any(
            "/tests/" in n or "/src/" in n or "__pycache__" in n for n in names
        )
        manifest = json.loads(z.read("document-forms/plugin.json"))
        assert manifest["id"] == entry["plugin_id"]
        assert manifest["version"] == entry["version"]
        assert manifest["qwenpaw_version"] == entry["qwenpaw_version"]
        verify_bundled_assets(z)

    bucket = oss2.Bucket(
        oss2.Auth(
            os.environ["OSS_ACCESS_KEY_ID"],
            os.environ["OSS_ACCESS_KEY_SECRET"],
        ),
        os.environ["OSS_ENDPOINT"],
        os.environ["OSS_BUCKET"],
    )
    catalog_key = "metadata/plugins/index.json"
    old_bytes = bucket.get_object(catalog_key).read()
    old = json.loads(old_bytes)
    assert (
        isinstance(old.get("files"), dict) and old["files"]
    ), "Existing catalog must be valid and non-empty"
    (root / "catalog-before.json").write_bytes(old_bytes)

    try:
        remote_payload = bucket.get_object(key).read()
    except oss2.exceptions.NoSuchKey:
        bucket.put_object(
            key,
            payload,
            headers={
                "x-oss-forbid-overwrite": "true",
                "x-oss-object-acl": "public-read",
                "Content-Type": "application/zip",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        )
        remote_payload = bucket.get_object(key).read()
    assert (
        remote_payload == payload
    ), "Immutable package bytes differ; bump version instead"

    if file_id in old["files"]:
        assert (
            old["files"][file_id]["sha256"] == digest
        ), "Version already exists with a different digest"
    merged = copy.deepcopy(old)
    merged["files"][file_id] = entry
    versions = (
        merged.setdefault("platforms", {})
        .setdefault("apps", {})
        .setdefault("versions", [])
    )
    if file_id not in versions:
        versions.insert(0, file_id)
    merged["updated_at"] = new.get("updated_at", old.get("updated_at"))
    for existing_id, existing in old["files"].items():
        if existing_id != file_id:
            assert merged["files"][existing_id] == existing
    merged_bytes = json.dumps(merged, ensure_ascii=False, indent=2).encode(
        "utf-8"
    )
    (root / "catalog-after.json").write_bytes(merged_bytes)
    assert (
        bucket.get_object(catalog_key).read() == old_bytes
    ), "Catalog changed concurrently; abort promotion"
    bucket.put_object(
        catalog_key,
        merged_bytes,
        headers={
            "x-oss-object-acl": "public-read",
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=60, must-revalidate",
        },
    )
    assert (
        bucket.get_object(catalog_key).read() == merged_bytes
    ), "Catalog readback mismatch"
    report = {
        "status": "published",
        "plugin_id": entry["plugin_id"],
        "version": entry["version"],
        "sha256": digest,
        "object_key": key,
        "previous_catalog_entries": len(old["files"]),
        "catalog_entries": len(merged["files"]),
    }
    (root / "publication.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    print(json.dumps(report))


if __name__ == "__main__":
    main()
