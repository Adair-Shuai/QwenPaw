# -*- coding: utf-8 -*-
"""Deploy separately: uvicorn qwenpaw.publisher_service:app.

Only this service receives OSS credentials. Contributor tokens are scoped to a
namespace; submissions remain private until an administrator promotes them.
All writers MUST use this service's OSS lock (including catalog maintenance).
An interrupted writer leaves the lock in place for operator recovery.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import re
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from packaging.version import InvalidVersion, Version
from starlette.concurrency import run_in_threadpool

from .app.routers.publisher import _inspect_archive, _segment, inspect_expert
from .plugins.download_catalog import _get_version_constraint

app = FastAPI(title="UGSci publication service", docs_url=None, redoc_url=None)
_MAX_BODY = 360 * 1024 * 1024
_LOCK_KEY = "publisher-private/catalog-write.lock"


def _json(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True).encode(
        "utf-8",
    )


def _bucket(kind: str):
    # An optional dependency of the separately deployed server, never required
    # merely to open the desktop's publisher UI.
    import oss2  # pylint: disable=import-outside-toplevel

    bucket = oss2.Bucket(
        oss2.Auth(
            os.environ["OSS_ACCESS_KEY_ID"],
            os.environ["OSS_ACCESS_KEY_SECRET"],
        ),
        os.environ["OSS_ENDPOINT"],
        os.environ[
            "OSS_EXPERTS_BUCKET" if kind == "expert" else "OSS_APPS_BUCKET"
        ],
        connect_timeout=30,
    )
    if bucket.get_bucket_versioning().status in ("Enabled", "Suspended"):
        raise HTTPException(
            503,
            "发布存储桶必须从未启用版本控制，否则 OSS 不支持安全的禁止覆盖写入",
        )
    return bucket


def _get(bucket, key: str) -> bytes | None:
    try:
        return bucket.get_object(key).read()
    except Exception as exc:
        if getattr(exc, "status", None) == 404:
            return None
        raise


def _put(
    bucket,
    key: str,
    data: bytes,
    *,
    public=False,
    immutable=True,
    content_type="application/json",
):
    headers = {
        "x-oss-object-acl": "public-read" if public else "private",
        "Content-Type": content_type,
        "Cache-Control": (
            "public, max-age=60, must-revalidate"
            if public and not immutable
            else (
                "no-store"
                if not public
                else "public, max-age=31536000, immutable"
            )
        ),
    }
    previous = _get(bucket, key) if immutable else None
    if previous is not None:
        if previous != data:
            raise HTTPException(409, "同一版本内容已存在且不同，请增加版本号")
        bucket.put_object_acl(key, "public-read" if public else "private")
        if bucket.get_object_acl(key).acl != (
            "public-read" if public else "private"
        ):
            raise HTTPException(502, "OSS 对象访问权限校验失败")
        return
    if immutable:
        headers["x-oss-forbid-overwrite"] = "true"
    bucket.put_object(key, data, headers=headers)
    if _get(bucket, key) != data:
        raise HTTPException(502, "OSS 写入后校验失败，未确认发布成功")
    if bucket.get_object_acl(key).acl != (
        "public-read" if public else "private"
    ):
        raise HTTPException(502, "OSS 对象访问权限校验失败")


@contextmanager
def _writer(bucket):
    nonce = uuid.uuid4().hex.encode()
    try:
        bucket.put_object(
            _LOCK_KEY,
            nonce,
            headers={
                "x-oss-forbid-overwrite": "true",
                "x-oss-object-acl": "private",
            },
        )
    except Exception as exc:
        if getattr(exc, "status", None) in (409, 412):
            raise HTTPException(
                409,
                "发布服务正在处理其他写入；稍后重试。持续占用请联系管理员检查写入锁",
            ) from exc
        raise
    try:
        yield
    finally:
        if _get(bucket, _LOCK_KEY) == nonce:
            bucket.delete_object(_LOCK_KEY)


def _identity(request: Request, *, admin=False) -> dict:
    header = request.headers.get("Authorization", "")
    token = header[7:] if header.startswith("Bearer ") else ""
    digest = hashlib.sha256(token.encode()).hexdigest()
    try:
        records = json.loads(os.environ.get("UGSCI_PUBLISH_IDENTITIES", "[]"))
    except ValueError as exc:
        raise HTTPException(503, "发布服务身份配置无效") from exc
    for record in records:
        if token and hmac.compare_digest(
            digest,
            str(record.get("token_sha256", "")),
        ):
            namespace = str(record.get("namespace", ""))
            if not re.fullmatch(r"[a-z][a-z0-9-]{1,39}", namespace):
                break
            if admin and record.get("role") != "admin":
                raise HTTPException(403, "需要管理员发布凭证")
            return {
                "namespace": namespace,
                "admin": record.get("role") == "admin",
            }
    raise HTTPException(401, "投稿凭证无效或已撤销，请联系市场管理员")


async def _body(request: Request) -> dict:
    chunks, size = [], 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > _MAX_BODY:
            raise HTTPException(413, "发布请求过大")
        chunks.append(chunk)
    try:
        value = json.loads(b"".join(chunks))
        if not isinstance(value, dict):
            raise ValueError()
        return value
    except ValueError as exc:
        raise HTTPException(400, "发布请求必须为 JSON 对象") from exc


# pylint: disable-next=W0621
def _validated(payload: dict, identity: dict) -> tuple[bytes, dict]:
    kind = payload.get("asset_kind")
    if kind == "expert":
        inspected = inspect_expert(payload.get("expert", {}))
        data = _json(inspected["manifest"])
    elif kind in ("app", "plugin"):
        try:
            data = base64.b64decode(
                payload.get("archive_base64", ""),
                validate=True,
            )
        except (ValueError, TypeError) as exc:
            raise ValueError("Invalid ZIP encoding") from exc
        inspected = _inspect_archive(data)
        if (kind == "app") != (inspected["catalog_kind"] == "apps"):
            raise ValueError("Package type does not match publishing channel")
    else:
        raise ValueError("Invalid asset kind")
    if not identity["admin"] and not inspected["id"].startswith(
        identity["namespace"] + "-",
    ):
        raise HTTPException(
            403,
            f"ID 必须以您的命名空间 {identity['namespace']}- 开头",
        )
    try:
        Version(inspected["version"])
    except InvalidVersion as exc:
        raise ValueError("版本号无效，例如 1.0.0") from exc
    inspected.update(asset_kind=kind, sha256=hashlib.sha256(data).hexdigest())
    if payload.get("sha256") and payload["sha256"] != inspected["sha256"]:
        raise ValueError("内容摘要不一致")
    return data, inspected


def _catalog(bucket, kind):
    key = (
        "agents/manifest.json"
        if kind == "expert"
        else "metadata/plugins/index.json"
    )
    if kind != "expert":
        main_raw = _get(bucket, "metadata/index.json")
        main = json.loads(main_raw) if main_raw else {}
        if (
            main.get("products", {}).get("plugins", {}).get("index_url")
            != "/metadata/plugins/index.json"
        ):
            raise HTTPException(
                503,
                "应用存储桶主目录未正确指向 /metadata/plugins/index.json，请管理员先完成市场初始化",
            )
    raw = _get(bucket, key)
    value = (
        json.loads(raw)
        if raw is not None
        else (
            {"agents": []}
            if kind == "expert"
            else {"files": {}, "platforms": {}}
        )
    )
    if (
        not isinstance(value, dict)
        or (kind == "expert" and not isinstance(value.get("agents"), list))
        or (kind != "expert" and not isinstance(value.get("files"), dict))
    ):
        raise HTTPException(502, "现有市场目录格式无效，停止写入")
    return key, raw, value


# pylint: disable-next=W0621
def _check_version(bucket, inspected, identity):
    kind, asset_id, version = (
        inspected["asset_kind"],
        inspected["id"],
        inspected["version"],
    )
    _, _, catalog = _catalog(bucket, kind)
    entries = (
        catalog["agents"] if kind == "expert" else catalog["files"].values()
    )
    matches = [
        entry
        for entry in entries
        if str(entry.get("plugin_id") or entry.get("id")) == asset_id
    ]
    for entry in matches:
        if (
            not identity["admin"]
            and entry.get("publisher_namespace") != identity["namespace"]
        ):
            raise HTTPException(403, "此条目不属于您的投稿身份，不能更新")
        try:
            current = Version(str(entry.get("version", "0")))
        except InvalidVersion:
            # pylint: disable-next=raise-missing-from
            raise HTTPException(409, "现有版本无效，需要管理员核对")
        if Version(version) < current:
            raise HTTPException(409, "版本不能低于已发布版本")
        if (
            Version(version) == current
            and entry.get("sha256") != inspected["sha256"]
        ):
            raise HTTPException(409, "同一版本内容不同，请增加版本号")
    return "update" if matches else "create"


# pylint: disable-next=W0621
def _process(payload, identity, *, mode="submission", check=False):
    data, inspected = _validated(payload, identity)
    bucket = _bucket(inspected["asset_kind"])
    with _writer(bucket):
        operation = _check_version(bucket, inspected, identity)
        receipt_id = "/".join(
            [
                identity["namespace"],
                inspected["asset_kind"],
                inspected["id"],
                inspected["version"],
            ],
        )
        base = "publisher-private/submissions/" + receipt_id
        existing = _get(bucket, base + ".json")
        if (
            existing is not None
            and json.loads(existing)["sha256"] != inspected["sha256"]
        ):
            raise HTTPException(409, "该投稿版本已有不同内容，请增加版本号")
        latest_key = (
            f"publisher-private/latest/"
            f"{identity['namespace']}"
            f"/"
            f"{inspected['asset_kind']}"
            f"/"
            f"{inspected['id']}"
            f".json"
        )
        latest_raw = _get(bucket, latest_key)
        if latest_raw is not None:
            latest = json.loads(latest_raw)
            if Version(inspected["version"]) < Version(latest["version"]):
                raise HTTPException(409, "版本不能低于已提交版本")
            if (
                Version(inspected["version"]) == Version(latest["version"])
                and latest["sha256"] != inspected["sha256"]
            ):
                raise HTTPException(409, "同一版本内容不同，请增加版本号")
        receipt = {
            "receipt_id": receipt_id,
            "status": "checked" if check else "submitted",
            "operation": operation,
            "plugin_id": inspected["id"],
            "version": inspected["version"],
            "sha256": inspected["sha256"],
            "asset_kind": inspected["asset_kind"],
            "publisher_namespace": identity["namespace"],
            "object_key": base
            + (
                ".expert.json"
                if inspected["asset_kind"] == "expert"
                else ".zip"
            ),
            "administrator_submission": identity["admin"],
        }
        if check:
            return receipt
        if existing is not None:
            receipt = json.loads(existing)
        _put(
            bucket,
            receipt["object_key"],
            data,
            content_type=(
                "application/json"
                if inspected["asset_kind"] == "expert"
                else "application/zip"
            ),
        )
        _put(bucket, base + ".json", _json(receipt))
        _put(
            bucket,
            latest_key,
            _json(
                {
                    "version": inspected["version"],
                    "sha256": inspected["sha256"],
                },
            ),
            immutable=False,
        )
        if mode == "release":
            return _promote(bucket, receipt, data, inspected)
        return receipt


def _promote(bucket, receipt, data, inspected):
    kind, asset_id, version = (
        inspected["asset_kind"],
        inspected["id"],
        inspected["version"],
    )
    key, old, catalog = _catalog(bucket, kind)
    # Recheck against the submitting identity; an administrator reviewing a
    # contribution does not transfer another contributor's ownership to it.
    _check_version(
        bucket,
        inspected,
        {
            "namespace": receipt["publisher_namespace"],
            "admin": receipt.get("administrator_submission", False),
        },
    )
    manifest = inspected["manifest"]
    shared = {
        "id": asset_id,
        "name": manifest.get("name", asset_id),
        "description": manifest.get("description", ""),
        "version": version,
        "sha256": inspected["sha256"],
        "publisher_namespace": receipt["publisher_namespace"],
    }
    if kind == "expert":
        prefix = f"agents/{asset_id}/{version}"
        _put(bucket, prefix + "/expert.json", data, public=True)
        _put(
            bucket,
            prefix + "/AGENTS.md",
            manifest["system_prompt"].encode(),
            public=True,
            content_type="text/markdown; charset=utf-8",
        )
        _put(
            bucket,
            prefix + "/skills.json",
            _json(manifest.get("recommended_skills", [])),
            public=True,
        )
        entry = {
            **shared,
            "path": prefix,
            "config": prefix + "/expert.json",
            "instructions": prefix + "/AGENTS.md",
            "skills_manifest": prefix + "/skills.json",
            "tags": manifest.get("tags", []),
        }
        catalog["agents"] = [
            row for row in catalog["agents"] if row.get("id") != asset_id
        ] + [entry]
        object_key = prefix + "/expert.json"
    else:
        platform = inspected["catalog_kind"]
        filename = f"{asset_id}-{version}.zip"
        object_key = f"files/plugins/{platform}/{asset_id}/{filename}"
        _put(
            bucket,
            object_key,
            data,
            public=True,
            content_type="application/zip",
        )
        file_id = f"plugins-{platform}-{asset_id}-{version}"
        catalog["files"][file_id] = {
            **shared,
            "id": file_id,
            "plugin_id": asset_id,
            "platform": platform,
            "product": "plugins",
            "filename": filename,
            "url": "/" + object_key,
            "size_bytes": len(data),
            "type": "zip",
            "author": manifest.get("author", ""),
            "qwenpaw_version": _get_version_constraint(manifest),
            "plugin_type": manifest.get("type", "general"),
            "tags": manifest.get("tags", []),
        }
        versions = (
            catalog.setdefault("platforms", {})
            .setdefault(platform, {})
            .setdefault("versions", [])
        )
        if file_id not in versions:
            versions.insert(0, file_id)
    catalog["updated_at"] = datetime.now(timezone.utc).isoformat()
    if _get(bucket, key) != old:
        raise HTTPException(
            409,
            "目录被其他发布工具修改，请重试并停用并行写入工具",
        )
    _put(bucket, key, _json(catalog), public=True, immutable=False)
    result = {
        **receipt,
        "status": "published",
        "object_key": object_key,
        "catalog_key": key,
        "verified": True,
    }
    _put(
        bucket,
        "publisher-private/published/" + receipt["receipt_id"] + ".json",
        _json(result),
    )
    return result


async def _handle(request, *, mode, check=False):
    # pylint: disable-next=W0621
    identity = _identity(request, admin=mode == "release")
    payload = await _body(request)
    try:
        return await run_in_threadpool(
            _process,
            payload,
            identity,
            mode=mode,
            check=check,
        )
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        # SDK errors can contain signed URLs and request headers.
        raise HTTPException(
            502,
            "OSS 发布服务暂时不可用，请稍后重试；管理员可检查服务配置",
        ) from exc


@app.post("/v1/submissions")
async def submit(request: Request):
    return await _handle(request, mode="submission")


@app.get("/v1/identity")
def identity(request: Request):
    value = _identity(request)
    return {
        "namespace": value["namespace"],
        "role": "admin" if value["admin"] else "contributor",
        "id_prefix": value["namespace"] + "-",
    }


@app.post("/v1/submissions/inspect")
async def inspect(request: Request):
    return await _handle(request, mode="submission", check=True)


@app.post("/v1/releases")
async def release(request: Request):
    return await _handle(request, mode="release")


@app.post("/v1/releases/inspect")
async def inspect_release(request: Request):
    return await _handle(request, mode="release", check=True)


@app.post("/v1/approve/{namespace}/{kind}/{asset_id}/{version}")
def approve(
    namespace: str,
    kind: str,
    asset_id: str,
    version: str,
    request: Request,
):
    _identity(request, admin=True)
    try:
        parts = [
            _segment(part, "receipt")
            for part in (namespace, kind, asset_id, version)
        ]
        if kind not in ("app", "plugin", "expert"):
            raise ValueError("Invalid asset kind")
        bucket = _bucket(kind)
        with _writer(bucket):
            raw = _get(
                bucket,
                "publisher-private/submissions/" + "/".join(parts) + ".json",
            )
            if raw is None:
                raise HTTPException(404, "投稿不存在")
            receipt = json.loads(raw)
            data = _get(bucket, receipt["object_key"])
            if (
                data is None
                or hashlib.sha256(data).hexdigest() != receipt["sha256"]
            ):
                raise HTTPException(409, "投稿包缺失或已损坏")
            payload = {
                "asset_kind": kind,
                "expert": json.loads(data) if kind == "expert" else None,
                "archive_base64": (
                    base64.b64encode(data).decode() if kind != "expert" else ""
                ),
            }
            _, inspected = _validated(
                payload,
                {
                    "namespace": namespace,
                    "admin": receipt.get("administrator_submission", False),
                },
            )
            return _promote(bucket, receipt, data, inspected)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(502, "审核发布失败，未确认发布成功") from exc
