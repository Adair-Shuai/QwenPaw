"""Publish FlowForge catalog and signed component updates in one transaction."""

from __future__ import annotations

import json
import os
from pathlib import Path
from zipfile import ZipFile

import oss2

from generate_plugin_metadata import _iter_tree_relpaths
from publish_storage_capacity import (
    PUBLIC_KEY,
    _private_key,
    canonical_json,
    digest,
    immutable,
    merge_catalog,
    prepare_target,
    promote,
)
from upload_plugin_artifacts import artifact_plan

PLUGIN_ID = "flowforge"
SOURCE = Path(__file__).resolve().parents[2] / "plugins/bundle/flowforge"


def verify_plugin(archive, entry):
    """Read every archived member and compare it with the reviewed source."""
    payload = archive.read_bytes()
    if (
        digest(payload) != entry["sha256"]
        or len(payload) != entry["size_bytes"]
    ):
        raise ValueError("FlowForge archive digest or length mismatch")
    manifest = json.loads((SOURCE / "plugin.json").read_bytes())
    if entry["plugin_id"] != PLUGIN_ID or manifest["id"] != PLUGIN_ID:
        raise ValueError("FlowForge archive identity mismatch")
    for field in ("version", "qwenpaw_version"):
        if manifest[field] != entry[field]:
            raise ValueError(f"FlowForge metadata mismatch: {field}")
    expected = {
        f"{PLUGIN_ID}/{name}": SOURCE / name
        for name in _iter_tree_relpaths(SOURCE, manifest)
    }
    with ZipFile(archive) as bundle:
        if set(bundle.namelist()) != expected.keys() or len(
            bundle.namelist()
        ) != len(expected):
            raise ValueError(
                "Unexpected, missing or duplicate FlowForge files"
            )
        for name, source in expected.items():
            if bundle.read(name) != source.read_bytes():
                raise ValueError(f"FlowForge packaged source mismatch: {name}")
    return payload


def main():
    root = Path("dist/flowforge")
    plan = artifact_plan(root)
    new = json.loads((root / "index.json").read_bytes())
    if len(plan) != 1 or len(new["files"]) != 1:
        raise ValueError("Expected exactly one FlowForge release artifact")
    entry = next(iter(new["files"].values()))
    archive, relative = plan[0]
    if relative != f"bundle/{PLUGIN_ID}/{PLUGIN_ID}-{entry['version']}.zip":
        raise ValueError("FlowForge release URL mismatch")
    payload = verify_plugin(archive, entry)
    stage = root / "staging"
    with ZipFile(archive) as bundle:
        for name in bundle.namelist():
            destination = stage / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(bundle.read(name))
    bucket = oss2.Bucket(
        oss2.Auth(
            os.environ["OSS_ACCESS_KEY_ID"],
            os.environ["OSS_ACCESS_KEY_SECRET"],
        ),
        os.environ["OSS_ENDPOINT"],
        os.environ["OSS_BUCKET"],
    )
    base = os.environ.get(
        "COMPONENT_BASE_URL",
        "https://ugsci-download.oss-cn-beijing.aliyuncs.com",
    ).rstrip("/")
    private = os.environ["COMPONENT_SIGNING_PRIVATE_KEY"]
    os.environ["COMPONENT_SIGNING_PUBLIC_KEY"] = PUBLIC_KEY
    _private_key(private)
    sequence = int(os.environ["GITHUB_RUN_ID"])
    attempt = int(os.environ["GITHUB_RUN_ATTEMPT"])
    release_id = f"flowforge-{entry['version']}-{sequence}-{attempt}"
    catalog_key = "metadata/plugins/index.json"
    before = bucket.get_object(catalog_key).read()
    after = canonical_json(
        merge_catalog(
            json.loads(before), new, plugin_id=PLUGIN_ID, platform="bundle"
        )
    )
    (root / "catalog-before.json").write_bytes(before)
    (root / "catalog-after.json").write_bytes(after)
    updates = [
        prepare_target(
            bucket,
            root,
            stage,
            target,
            base,
            private,
            release_id,
            sequence,
            attempt,
            component_id=PLUGIN_ID,
        )
        for target in ("windows-x86_64", "macos-aarch64")
    ]
    key = "files/plugins/" + relative
    immutable(bucket, key, payload, "application/zip")
    verify_plugin(archive, entry)
    updates.append((catalog_key, before, after))
    promote(bucket, updates, release_id)
    report = {
        "status": "published",
        "plugin_id": PLUGIN_ID,
        "version": entry["version"],
        "sha256": digest(payload),
        "object_key": key,
        "targets": ["windows-x86_64", "macos-aarch64"],
        "release_id": release_id,
    }
    (root / "publication.json").write_bytes(canonical_json(report))
    print(json.dumps(report))


if __name__ == "__main__":
    main()
