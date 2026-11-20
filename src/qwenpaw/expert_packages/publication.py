# -*- coding: utf-8 -*-
"""Admin-only publication of already validated, signed native expert bundles.

No package code executes in the publication service or signing process.
All catalog writers share the existing publisher OSS lock.
"""

import base64
import hashlib
import os
from pathlib import Path
import tempfile

from fastapi import HTTPException
from packaging.version import Version

from ..components.update import _verify_signature
from ..distribution import COMPONENT_PUBLIC_KEY
from .audit import inspect_payload
from .models import Release, ReleaseIndex, relative_path
from .source import extract


def public_key():
    return os.environ.get("UGSCI_EXPERT_PUBLIC_KEY", COMPONENT_PUBLIC_KEY)


def manifest_path(raw: bytes):
    return f"expert-packages/manifests/{hashlib.sha256(raw).hexdigest()}.json"


def index_path(raw: bytes):
    return f"expert-packages/indexes/{hashlib.sha256(raw).hexdigest()}.json"


def inspect_archive(raw: bytes, archive: bytes) -> Release:
    release = Release.model_validate_json(raw)
    if set(release.mcp.schemas) != set(release.mcp.tools):
        raise ValueError("Missing verified MCP contracts")
    if (
        release.artifact.path
        != f"expert-packages/artifacts/{release.artifact.sha256}.zip"
    ):
        raise ValueError("Artifact must use its content address")
    with tempfile.TemporaryDirectory(prefix="ep-inspect-") as temp:
        root = Path(temp)
        path = root / "package.zip"
        path.write_bytes(archive)
        extract(path, root / "payload", release)
        inspect_payload(root / "payload")
    return release


def _decode(value, limit):
    if not isinstance(value, str) or len(value) > (limit + 2) // 3 * 4:
        raise ValueError("Release input exceeds size limit")
    data = base64.b64decode(value, validate=True)
    if len(data) > limit:
        raise ValueError("Release input exceeds size limit")
    return data


def validate_publication(payload, key):
    raw = _decode(payload.get("index_base64"), 4 * 1024**2)
    signature = payload.get("index_signature", "")
    _verify_signature(raw, signature, key)
    index = ReleaseIndex.model_validate_json(raw)
    variants = payload.get("releases", [])
    if not isinstance(variants, list) or len(variants) != len(index.releases):
        raise ValueError("Incomplete multi-platform release")
    refs = {r.manifest: r for r in index.releases}
    objects = {}
    total = 0
    manifests = []
    for variant in variants:
        body = _decode(variant.get("manifest_base64"), 4 * 1024**2)
        sig = variant.get("signature", "")
        _verify_signature(body, sig, key)
        path = manifest_path(body)
        ref = refs.pop(path, None)
        if ref is None or hashlib.sha256(body).hexdigest() != ref.sha256:
            raise ValueError("Release not in signed index")
        archive = _decode(variant.get("archive_base64"), 256 * 1024**2)
        total += len(archive)
        if total > 256 * 1024**2:
            raise ValueError("Combined release archives exceed 256 MiB")
        release = inspect_archive(body, archive)
        if (release.id, release.version, release.target, release.python) != (
            index.id,
            index.version,
            ref.target,
            ref.python,
        ):
            raise ValueError("Release identity differs from signed index")
        manifests.append(release)
        objects[release.artifact.path] = archive
        objects[path + ".sig"] = sig.encode()
        objects[path] = body
    if len({(r.name, r.description) for r in manifests}) != 1:
        raise ValueError(
            "Platform releases must have the same public description",
        )
    path = index_path(raw)
    objects[path + ".sig"] = signature.encode()
    objects[path] = raw
    # This stable path is immutable and enforces release-version uniqueness.
    objects[
        f"expert-packages/releases/{index.id}/{index.version}/index.json"
    ] = raw
    return index, manifests[0], objects, path, raw


# Use the same bucket writer transaction and lock as the publisher.
def publish(payload, identity, *, check=False):
    # These operations share the publisher’s existing write lock and catalog.
    # pylint: disable=protected-access
    from .. import publisher_service as p

    index, release, objects, path, raw = validate_publication(
        payload,
        public_key(),
    )
    bucket = p._bucket("expert")
    with p._writer(bucket):
        key, old, catalog = p._catalog(bucket, "expert")
        existing = [
            row for row in catalog["agents"] if row.get("id") == index.id
        ]
        for row in existing:
            previous = Version(str(row.get("version", "0")))
            if Version(index.version) < previous:
                raise HTTPException(409, "专家版本不能降低")
            if (
                Version(index.version) == previous
                and row.get("package_manifest") != path
            ):
                raise HTTPException(409, "专家同一版本内容不同，请增加版本号")
        # Detect ALL conflicts before uploading any public content.
        for name, data in objects.items():
            previous = p._get(bucket, name)
            if previous is not None and previous != data:
                raise HTTPException(409, "专家发行内容冲突，请增加版本号")
        result = {
            "status": "checked" if check else "published",
            "id": index.id,
            "version": index.version,
            "package_manifest": path,
            "platforms": [r.target + "/" + r.python for r in index.releases],
        }
        if check:
            return result
        for name, data in objects.items():
            p._put(
                bucket,
                name,
                data,
                public=True,
                content_type=(
                    "application/zip"
                    if name.endswith(".zip")
                    else "application/json"
                ),
            )
        prior = existing[0] if existing else {}
        # Keep legacy templates readable by older hosts, but only the package
        # installer is used by hosts which recognize package_manifest.
        entry = {
            **prior,
            "id": index.id,
            "name": release.name,
            "description": release.description,
            "version": index.version,
            "package_manifest": path,
            "sha256": hashlib.sha256(raw).hexdigest(),
            "publisher_namespace": identity["namespace"],
        }
        catalog["agents"] = [
            row for row in catalog["agents"] if row.get("id") != index.id
        ] + [entry]
        if p._get(bucket, key) != old:
            raise HTTPException(409, "专家目录被外部写入，请停用旧目录同步后重试")
        p._put(bucket, key, p._json(catalog), public=True, immutable=False)
        return {**result, "verified": True}


# Share the publisher lock when merging the legacy catalog.
def import_templates(payload):
    (
        "Merge Git-maintained legacy metadata without erasing published "
        "entries."
    )
    # These operations share the publisher’s existing write lock and catalog.
    # pylint: disable=protected-access
    from .. import publisher_service as p

    catalog = payload.get("catalog")
    if not isinstance(catalog, dict) or not isinstance(
        catalog.get("agents"),
        list,
    ):
        raise ValueError("Invalid template catalog")
    incoming = {}
    for item in catalog["agents"]:
        if item.get("id") == "_template":
            continue
        asset_id = p._segment(item.get("id", ""), "expert ID")
        if asset_id in incoming:
            raise ValueError("Duplicate template ID")
        row = {
            k: item[k]
            for k in (
                "id",
                "name",
                "description",
                "path",
                "config",
                "instructions",
                "skills_manifest",
                "tags",
                "drivers",
            )
            if k in item
        }
        for field in ("path", "config", "instructions", "skills_manifest"):
            if field in row:
                relative_path(row[field])
                if (
                    not row[field].startswith(f"agents/{asset_id}/")
                    and row[field] != f"agents/{asset_id}"
                ):
                    raise ValueError(
                        "Template references another expert directory",
                    )
        incoming[asset_id] = row
    bucket = p._bucket("expert")
    with p._writer(bucket):
        key, old, live = p._catalog(bucket, "expert")
        entries = {row["id"]: row for row in live["agents"]}
        for asset_id, row in incoming.items():
            previous = entries.get(asset_id, {})
            if previous.get("package_manifest") or previous.get(
                "publisher_namespace",
            ):
                continue
            for field in ("config", "instructions", "skills_manifest"):
                if row.get(field) and p._get(bucket, row[field]) is None:
                    raise ValueError(
                        "Upload template files before updating the catalog",
                    )
            entries[asset_id] = row
        live["agents"] = list(entries.values())
        if p._get(bucket, key) != old:
            raise HTTPException(
                409,
                "Catalog changed outside publication service",
            )
        p._put(bucket, key, p._json(live), public=True, immutable=False)
        return {"status": "published", "entries": len(entries)}
