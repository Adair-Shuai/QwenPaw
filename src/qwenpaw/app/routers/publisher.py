# -*- coding: utf-8 -*-
"""UGSci plugin/application packaging and publication endpoints.

The publisher is part of the runtime API so it works in packaged desktop
builds.  The Vite development server must not own this workflow: production
desktop builds serve static frontend assets and never start Vite.
"""

from __future__ import annotations

import base64
import asyncio
import hashlib
import io
import json
import os
import re
import stat
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any, Literal, cast
from urllib.parse import urlsplit, urlunsplit

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field

from ...config.utils import get_plugins_dir
from ...constant import WORKING_DIR

router = APIRouter(prefix="/publisher", tags=["publisher"])

PublishAssetKind = Literal["plugin", "app", "expert"]
PublishMode = Literal["release", "submission"]

_ARCHIVE_LIMIT = 256 * 1024 * 1024
_EXTRACTED_LIMIT = 512 * 1024 * 1024
_FILE_LIMIT = 20_000
_ZIP_COMPRESS_LEVEL = 6
_SEGMENT_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._+-]{0,127}$")
_SKIPPED_DIRECTORIES = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
}
_PUBLISH_ROOT = Path(WORKING_DIR) / "plugin-publish"


class InstalledPublishRequest(BaseModel):
    """Request to inspect or publish an installed asset."""

    model_config = ConfigDict(populate_by_name=True)

    plugin_id: str = Field(alias="pluginId")
    kind: PublishAssetKind
    mode: PublishMode = "submission"


def inspect_expert(value: Any) -> dict[str, Any]:
    """Accept only an explicitly composed public template, never runtime state."""
    if not isinstance(value, dict):
        raise ValueError("专家模板必须是 JSON 对象")
    allowed = {
        "id",
        "name",
        "description",
        "version",
        "author",
        "tags",
        "system_prompt",
        "recommended_skills",
    }
    if set(value) - allowed:
        raise ValueError(
            "专家模板只接受公开元数据、提示词与技能名称；不能包含模型凭证、记忆、知识文件或本机配置"
        )
    for key, maximum in {
        "id": 128,
        "version": 128,
        "name": 160,
        "description": 4000,
        "author": 160,
        "system_prompt": 100000,
    }.items():
        if not isinstance(value.get(key, ""), str) or len(value.get(key, "")) > maximum:
            raise ValueError(f"专家字段 {key} 格式或长度无效")
    if not value.get("name", "").strip() or not value.get("system_prompt", "").strip():
        raise ValueError("请填写专家名称和公开提示词")
    for key in ("tags", "recommended_skills"):
        items = value.get(key, [])
        if (
            not isinstance(items, list)
            or len(items) > 100
            or any(not isinstance(item, str) or len(item) > 160 for item in items)
        ):
            raise ValueError(f"专家字段 {key} 必须为文本列表")
    data = json.dumps(value, ensure_ascii=False, sort_keys=True).encode()
    return {
        "id": _segment(value.get("id"), "expert id"),
        "version": _segment(value.get("version"), "expert version"),
        "manifest": value,
        "catalog_kind": "agents",
        "file_count": 1,
        "source_size": len(data),
    }


def _private_path(relative: str) -> bool:
    parts = PurePosixPath(relative.lower()).parts
    # Mandatory exclusions do not depend on a contributor-controlled manifest.
    return (
        bool(
            set(parts)
            & {".git", ".ssh", ".aws", ".codex", "__pycache__", "node_modules"}
        )
        or any(
            part == ".env"
            or part.startswith(".env.")
            or part.endswith((".pem", ".key", ".sqlite", ".sqlite3"))
            for part in parts
        )
        or relative.lower().startswith(
            (
                "visualization/data/",
                "data/",
                "workspaces/",
                "sessions/",
                "memory/",
                "logs/",
            )
        )
    )


def _segment(value: Any, label: str) -> str:
    text = str(value or "").strip()
    if not _SEGMENT_PATTERN.fullmatch(text):
        raise ValueError(f"Invalid {label}")
    return text


def _catalog_kind(
    manifest: dict[str, Any],
) -> Literal["bundle", "tool", "apps"]:
    meta = manifest.get("meta")
    if isinstance(meta, dict) and meta.get("pawapp"):
        return "apps"
    if manifest.get("type") == "app":
        return "apps"
    return "tool" if manifest.get("type") == "tool" else "bundle"


def _asset_root(plugin_id: str) -> Path:
    plugin_id = _segment(plugin_id, "plugin id")
    root = (get_plugins_dir() / plugin_id).resolve()
    plugins_root = get_plugins_dir().resolve()
    if not root.is_relative_to(plugins_root) or not root.is_dir():
        raise ValueError(f"Installed plugin not found: {plugin_id}")
    return root


def _read_manifest(root: Path) -> tuple[dict[str, Any], str, str]:
    try:
        manifest = json.loads(
            (root / "plugin.json").read_text(encoding="utf-8"),
        )
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Invalid plugin.json: {exc}") from exc
    if not isinstance(manifest, dict):
        raise ValueError("plugin.json must contain a JSON object")
    _validate_public_manifest(manifest)
    return (
        manifest,
        _segment(manifest.get("id"), "plugin id"),
        _segment(manifest.get("version"), "plugin version"),
    )


def _validate_public_manifest(manifest: dict[str, Any]) -> None:
    if manifest.get("publish") is False:
        raise ValueError("此应用已在 plugin.json 禁止公开发布")
    if manifest.get("id") == "document-forms":
        raise ValueError(
            "外协助手包含受保护的标准文书模板；请使用现有专用发布流程执行模板清单、摘要与隐私校验，通用发布器不能绕过该检查"
        )


def _normalize_pack_exclude(manifest: dict[str, Any]) -> list[str]:
    raw = manifest.get("pack_exclude")
    if not isinstance(raw, list):
        return []
    cleaned: list[str] = []
    for item in raw:
        text = str(item).strip().replace("\\", "/").strip("/")
        parts = [part for part in text.split("/") if part]
        if not parts or "." in parts or ".." in parts or ":" in parts[0]:
            continue
        cleaned.append("/".join(parts))
    return cleaned


def _protected_relpaths(manifest: dict[str, Any]) -> set[str]:
    return {"plugin.json", *_declared_entries(manifest)}


def _is_pack_excluded(
    relative: str,
    patterns: list[str],
    protected: set[str],
) -> bool:
    if relative in protected:
        return False
    return any(
        relative == pattern or relative.startswith(f"{pattern}/")
        for pattern in patterns
    )


def _collect_publish_files(
    root: Path,
    manifest: dict[str, Any],
) -> tuple[list[Path], int]:
    files: list[Path] = []
    excluded = 0
    patterns = _normalize_pack_exclude(manifest)
    protected = _protected_relpaths(manifest)

    def walk(current: Path) -> None:
        nonlocal excluded
        for entry in sorted(current.iterdir(), key=lambda item: item.name):
            relative = entry.relative_to(root).as_posix()
            if _private_path(relative + ("/" if entry.is_dir() else "")):
                if relative in protected:
                    raise ValueError(
                        f"Private data cannot be a plugin entry: {relative}"
                    )
                excluded += 1
                continue
            if _is_pack_excluded(relative, patterns, protected):
                # Prune excluded directories before descending into them.
                # Large generated datasets must not make metadata inspection
                # as expensive as a full package build.
                excluded += 1
                continue
            if entry.is_symlink():
                raise ValueError("Plugin symlinks are not allowed")
            if entry.is_dir():
                if entry.name not in _SKIPPED_DIRECTORIES:
                    walk(entry)
            elif entry.is_file():
                files.append(entry)

    walk(root)
    if root / "plugin.json" not in files:
        raise ValueError("plugin.json is required")
    if len(files) > _FILE_LIMIT:
        raise ValueError("Plugin contains too many files")
    return files, excluded


def _declared_entries(manifest: dict[str, Any]) -> list[str]:
    entry = manifest.get("entry")
    values = list(entry.values()) if isinstance(entry, dict) else []
    required = manifest.get("pack_requires", [])
    if isinstance(required, list):
        values += required
    return [
        value.replace("\\", "/")
        for value in values
        if isinstance(value, str) and value.strip()
    ]


def _prepare_directory(root: Path) -> tuple[list[Path], dict[str, Any]]:
    manifest, plugin_id, version = _read_manifest(root)
    paths, excluded_files = _collect_publish_files(root, manifest)
    relative_files = [path.relative_to(root).as_posix() for path in paths]
    for entry in _declared_entries(manifest):
        if entry not in relative_files:
            raise ValueError(f"Declared plugin entry is missing: {entry}")

    source_size = sum(path.stat().st_size for path in paths)
    if source_size > _EXTRACTED_LIMIT:
        raise ValueError("Extracted plugin exceeds the 512 MB limit")

    return paths, {
        "manifest": manifest,
        "id": plugin_id,
        "version": version,
        "file_count": len(relative_files),
        "source_size": source_size,
        "catalog_kind": _catalog_kind(manifest),
        "excluded_files": excluded_files,
    }


def _inspect_directory(root: Path) -> dict[str, Any]:
    """Validate an installed plugin without creating and compressing a ZIP."""

    _paths, inspected = _prepare_directory(root)
    return inspected


def _package_directory(root: Path) -> tuple[bytes, dict[str, Any]]:
    paths, inspected = _prepare_directory(root)
    plugin_id = inspected["id"]
    relative_files = [path.relative_to(root).as_posix() for path in paths]

    output = io.BytesIO()
    with zipfile.ZipFile(
        output,
        "w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=_ZIP_COMPRESS_LEVEL,
    ) as archive:
        for path, relative in zip(paths, relative_files):
            info = zipfile.ZipInfo(
                f"{plugin_id}/{relative}",
                date_time=(1980, 1, 1, 0, 0, 0),
            )
            info.compress_type = zipfile.ZIP_DEFLATED
            mode = path.stat().st_mode & 0o777
            info.external_attr = (stat.S_IFREG | mode) << 16
            archive.writestr(
                info,
                path.read_bytes(),
                compress_type=zipfile.ZIP_DEFLATED,
                compresslevel=_ZIP_COMPRESS_LEVEL,
            )
    data = output.getvalue()
    if len(data) > _ARCHIVE_LIMIT:
        raise ValueError("Plugin archive exceeds the 256 MB limit")
    return data, inspected


def _safe_zip_name(name: str) -> PurePosixPath:
    if not name or "\x00" in name:
        raise ValueError("Plugin archive contains an unsafe path")
    normalized = PurePosixPath(name.replace("\\", "/"))
    if (
        normalized.is_absolute()
        or ".." in normalized.parts
        or any(not part or part == "." for part in normalized.parts)
        or (normalized.parts and re.match(r"^[A-Za-z]:", normalized.parts[0]))
    ):
        raise ValueError("Plugin archive contains an unsafe path")
    return normalized


def _inspect_archive(  # pylint: disable=too-many-branches
    data: bytes,
) -> dict[str, Any]:
    if len(data) > _ARCHIVE_LIMIT:
        raise ValueError("Plugin archive exceeds the 256 MB limit")
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            members = archive.infolist()
            if len(members) > _FILE_LIMIT:
                raise ValueError("Plugin archive contains too many files")
            names = [_safe_zip_name(item.filename) for item in members]
            manifest_indexes = [
                index
                for index, (item, name) in enumerate(zip(members, names))
                if not item.is_dir() and name.name == "plugin.json"
            ]
            if len(manifest_indexes) != 1:
                raise ValueError(
                    "Plugin archive must contain exactly one plugin.json",
                )

            manifest_name = names[manifest_indexes[0]]
            root_parts = manifest_name.parts[:-1]
            relative_files: set[str] = set()
            extracted_size = 0
            file_count = 0
            for item, name in zip(members, names):
                unix_mode = (item.external_attr >> 16) & 0xFFFF
                file_type = stat.S_IFMT(unix_mode)
                if file_type not in (0, stat.S_IFREG, stat.S_IFDIR):
                    raise ValueError(
                        "Plugin archive links and special files are not " "allowed",
                    )
                if name.parts[: len(root_parts)] != root_parts:
                    raise ValueError(
                        "Plugin archive contains files outside the plugin " "root",
                    )
                relative_parts = name.parts[len(root_parts) :]
                if not relative_parts:
                    continue
                if item.is_dir():
                    continue
                relative = PurePosixPath(*relative_parts).as_posix()
                if _private_path(relative):
                    raise ValueError(
                        f"Archive contains private or generated data: {relative}"
                    )
                if relative in relative_files:
                    raise ValueError("Plugin archive contains duplicate paths")
                relative_files.add(relative)
                file_count += 1
                extracted_size += item.file_size
                if extracted_size > _EXTRACTED_LIMIT:
                    raise ValueError(
                        "Extracted plugin exceeds the 512 MB limit",
                    )
                archive.read(
                    item,
                )  # CRC verification and malformed-stream detection.

            manifest = json.loads(
                archive.read(members[manifest_indexes[0]]).decode("utf-8"),
            )
    except (
        zipfile.BadZipFile,
        UnicodeDecodeError,
        json.JSONDecodeError,
    ) as exc:
        raise ValueError(f"Invalid plugin archive: {exc}") from exc
    if not isinstance(manifest, dict):
        raise ValueError("plugin.json must contain a JSON object")
    _validate_public_manifest(manifest)
    plugin_id = _segment(manifest.get("id"), "plugin id")
    version = _segment(manifest.get("version"), "plugin version")
    for entry in _declared_entries(manifest):
        if entry not in relative_files:
            raise ValueError(f"Declared plugin entry is missing: {entry}")
    return {
        "manifest": manifest,
        "id": plugin_id,
        "version": version,
        "file_count": file_count,
        "source_size": extracted_size,
        "catalog_kind": _catalog_kind(manifest),
    }


def _inspection(
    inspected: dict[str, Any],
    kind: PublishAssetKind,
) -> dict[str, Any]:
    manifest = inspected["manifest"]
    excluded = int(inspected.get("excluded_files") or 0)
    return {
        "plugin_id": inspected["id"],
        "name": str(manifest.get("name") or inspected["id"]),
        "version": inspected["version"],
        "asset_kind": kind,
        "catalog_kind": inspected["catalog_kind"],
        "file_count": inspected["file_count"],
        "source_size_bytes": inspected["source_size"],
        "warnings": (
            [f"plugin.json pack_exclude excluded {excluded} path(s)"]
            if excluded
            else []
        ),
        "blockers": [],
    }


def _endpoint(mode: PublishMode) -> str:
    key = "UGSCI_PUBLISH_ENDPOINT" if mode == "release" else "UGSCI_SUBMISSION_ENDPOINT"
    return os.environ.get(key, "").strip()


def _display_endpoint(endpoint: str) -> str | None:
    if not endpoint:
        return None
    parsed = urlsplit(endpoint)
    hostname = parsed.hostname or ""
    try:
        if parsed.port:
            hostname = f"{hostname}:{parsed.port}"
    except ValueError:
        return None
    return urlunsplit((parsed.scheme, hostname, parsed.path, "", ""))


async def _forward(
    mode: PublishMode, payload: dict[str, Any], token: str = "", *, inspect=False
) -> Any | None:
    endpoint = _endpoint(mode)
    if not endpoint:
        return None
    parsed = urlsplit(endpoint)
    if parsed.scheme != "https" and not (
        parsed.scheme == "http" and parsed.hostname in {"localhost", "127.0.0.1", "::1"}
    ):
        raise ValueError("发布服务必须使用 HTTPS")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError("发布服务地址不能包含凭证或查询参数")
    if inspect:
        endpoint = endpoint.rstrip("/") + "/inspect"
    token = (
        token.strip()
        or os.environ.get(
            "UGSCI_PUBLISH_TOKEN" if mode == "release" else "UGSCI_SUBMISSION_TOKEN", ""
        ).strip()
    )
    if not token:
        raise ValueError("请填写管理员分配的投稿或发布凭证")
    async with httpx.AsyncClient(timeout=httpx.Timeout(180.0)) as client:
        response = await client.post(
            endpoint,
            headers={
                "Content-Type": "application/json",
                "X-UGSci-Publisher": "qwenpaw-local",
                "Authorization": f"Bearer {token}",
            },
            json=payload,
        )
    try:
        body: Any = response.json()
    except ValueError:
        body = {"message": response.text}
    if response.is_error:
        detail = None
        if isinstance(body, dict):
            detail = body.get("detail") or body.get("message")
        raise ValueError(
            str(detail or f"Publish service failed ({response.status_code})"),
        )
    expected = (
        "checked" if inspect else "published" if mode == "release" else "submitted"
    )
    if (
        not isinstance(body, dict)
        or body.get("status") != expected
        or not body.get("receipt_id")
        or body.get("sha256") != payload["sha256"]
        or (mode == "release" and not inspect and body.get("verified") is not True)
    ):
        raise ValueError("发布服务未返回可验证回执，未确认提交或发布成功")
    return body


def _store_local(
    archive: bytes,
    sha256: str,
    inspected: dict[str, Any],
    mode: PublishMode,
    kind: PublishAssetKind,
) -> tuple[Path, Path]:
    base = _PUBLISH_ROOT / ("outbox" if mode == "release" else "inbox")
    base.mkdir(parents=True, exist_ok=True)
    archive_path = base / f"{inspected['id']}-{inspected['version']}.zip"
    metadata_path = archive_path.with_suffix(".json")
    if archive_path.exists():
        if archive_path.read_bytes() != archive:
            raise ValueError(
                "Plugin content changed without a version bump; "
                "update plugin.json version",
            )
    else:
        with archive_path.open("xb") as stream:
            stream.write(archive)
    manifest = inspected["manifest"]
    metadata = {
        "asset_kind": kind,
        "catalog_kind": inspected["catalog_kind"],
        "plugin_id": inspected["id"],
        "name": manifest.get("name") or inspected["id"],
        "version": inspected["version"],
        "author": manifest.get("author") or "",
        "filename": archive_path.name,
        "url": (
            f"/files/plugins/{inspected['catalog_kind']}/{inspected['id']}/"
            f"{archive_path.name}"
        ),
        "size_bytes": len(archive),
        "sha256": sha256,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    with tempfile.NamedTemporaryFile(
        "w",
        encoding="utf-8",
        dir=base,
        prefix=f".{metadata_path.name}.",
        suffix=".tmp",
        delete=False,
    ) as stream:
        json.dump(metadata, stream, ensure_ascii=False, indent=2)
        temporary = Path(stream.name)
    temporary.replace(metadata_path)
    return archive_path, metadata_path


async def _publish(
    archive: bytes,
    inspected: dict[str, Any],
    mode: PublishMode,
    kind: PublishAssetKind,
    token: str = "",
) -> dict[str, Any]:
    if mode == "release" and not _endpoint(mode):
        raise ValueError("尚未配置正式发布服务；可先生成本地发布包")
    if (kind == "app") != (inspected["catalog_kind"] == "apps"):
        raise ValueError(
            "Package type does not match the selected " f"{kind} publishing channel",
        )
    sha256 = hashlib.sha256(archive).hexdigest()
    archive_path, metadata_path = await asyncio.to_thread(
        _store_local,
        archive,
        sha256,
        inspected,
        mode,
        kind,
    )
    remote = await _forward(
        mode,
        {
            "asset_kind": kind,
            "catalog_kind": inspected["catalog_kind"],
            "plugin_id": inspected["id"],
            "version": inspected["version"],
            "manifest": inspected["manifest"],
            "sha256": sha256,
            "archive_base64": base64.b64encode(archive).decode("ascii"),
        },
        token,
    )
    return {
        **_inspection(inspected, kind),
        "status": (
            "published"
            if remote is not None and mode == "release"
            else "submitted" if remote is not None else "prepared"
        ),
        "sha256": sha256,
        "archive_size_bytes": len(archive),
        "archive_path": str(archive_path),
        "metadata_path": str(metadata_path),
        "remote": remote,
    }


@router.get("/status")
async def publisher_status() -> dict[str, Any]:
    publish_endpoint = _endpoint("release")
    submission_endpoint = _endpoint("submission")
    return {
        "direct_publish_configured": bool(publish_endpoint),
        "submission_configured": bool(submission_endpoint),
        "publish_endpoint": _display_endpoint(publish_endpoint),
        "submission_endpoint": _display_endpoint(submission_endpoint),
        "outbox_dir": str(_PUBLISH_ROOT / "outbox"),
        "inbox_dir": str(_PUBLISH_ROOT / "inbox"),
        "max_archive_mb": _ARCHIVE_LIMIT // 1024 // 1024,
    }


@router.post("/inspect")
async def inspect_installed_asset(
    request: InstalledPublishRequest,
) -> dict[str, Any]:
    try:
        inspected = await asyncio.to_thread(
            _inspect_directory, _asset_root(request.plugin_id)
        )
        if (request.kind == "app") != (inspected["catalog_kind"] == "apps"):
            raise ValueError("Package type does not match selected publishing channel")
        return _inspection(inspected, request.kind)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/publish")
async def publish_installed_asset(
    request: InstalledPublishRequest,
    http_request: Request,
) -> dict[str, Any]:
    try:
        archive, inspected = await asyncio.to_thread(
            _package_directory, _asset_root(request.plugin_id)
        )
        return await _publish(
            archive,
            inspected,
            request.mode,
            request.kind,
            http_request.headers.get("X-UGSci-Publisher-Token", ""),
        )
    except (ValueError, httpx.HTTPError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/upload")
async def upload_publish_archive(request: Request) -> dict[str, Any]:
    size = 0
    chunks: list[bytes] = []
    async for chunk in request.stream():
        size += len(chunk)
        if size > _ARCHIVE_LIMIT:
            raise HTTPException(
                status_code=413,
                detail="Plugin archive exceeds the 256 MB limit",
            )
        chunks.append(chunk)
    try:
        kind_value = request.headers.get("X-UGSci-Asset-Kind", "plugin")
        mode_value = request.headers.get(
            "X-UGSci-Publish-Mode",
            "submission",
        )
        if kind_value not in ("plugin", "app") or mode_value not in (
            "release",
            "submission",
        ):
            raise ValueError("Invalid publish options")
        kind = cast(PublishAssetKind, kind_value)
        mode = cast(PublishMode, mode_value)
        archive = b"".join(chunks)
        inspected = await asyncio.to_thread(_inspect_archive, archive)
        if request.headers.get("X-UGSci-Inspect-Only") == "true":
            if (kind == "app") != (inspected["catalog_kind"] == "apps"):
                raise ValueError(
                    "Package type does not match selected publishing channel"
                )
            return _inspection(inspected, kind)
        return await _publish(
            archive,
            inspected,
            mode,
            kind,
            request.headers.get("X-UGSci-Publisher-Token", ""),
        )
    except (ValueError, httpx.HTTPError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/expert/{action}")
async def publish_expert(action: str, request: Request):
    if action not in ("inspect", "publish"):
        raise HTTPException(404, "Unknown publisher action")
    chunks, size = [], 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > 1024 * 1024:
            raise HTTPException(413, "专家模板过大")
        chunks.append(chunk)
    try:
        body = json.loads(b"".join(chunks))
        inspected = inspect_expert(body.get("expert"))
        mode = body.get("mode", "submission")
        if mode not in ("release", "submission"):
            raise ValueError("Invalid publish mode")
        if not _endpoint(mode):
            raise ValueError("管理员尚未配置远端发布服务，专家未上传到 OSS")
        payload = {
            "asset_kind": "expert",
            "expert": inspected["manifest"],
            "sha256": hashlib.sha256(
                json.dumps(
                    inspected["manifest"], ensure_ascii=False, sort_keys=True
                ).encode()
            ).hexdigest(),
        }
        remote = await _forward(
            mode,
            payload,
            request.headers.get("X-UGSci-Publisher-Token", ""),
            inspect=action == "inspect",
        )
        return {**_inspection(inspected, "expert"), **remote}
    except (ValueError, httpx.HTTPError) as exc:
        raise HTTPException(400, str(exc)) from exc
