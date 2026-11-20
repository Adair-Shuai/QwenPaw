# -*- coding: utf-8 -*-
"""Trusted channel transport and bounded, fully inventoried extraction."""

import hashlib
import json
import stat
import zipfile
from pathlib import Path
from urllib.parse import urlsplit

import httpx
from packaging.version import Version

from ..components.update import _verify_signature, detect_target
from .models import Release, ReleaseIndex, relative_path


class Channel:
    def __init__(self, base_url: str, public_key: str, client=None):
        url = urlsplit(base_url)
        if (
            url.scheme != "https"
            or not url.hostname
            or url.query
            or url.fragment
            or url.username
        ):
            raise ValueError("Expert channel requires an HTTPS base URL")
        self.base = base_url.rstrip("/")
        self.key = public_key
        self.client = client

    def read(self, path: str, limit: int) -> bytes:
        relative_path(path)
        with (
            httpx.Client(timeout=120, follow_redirects=False)
            if self.client is None
            else _borrow(self.client)
        ) as client:
            with client.stream("GET", f"{self.base}/{path}") as response:
                response.raise_for_status()
                data = bytearray()
                for chunk in response.iter_bytes():
                    data.extend(chunk)
                    if len(data) > limit:
                        raise ValueError("Channel response exceeds size limit")
                return bytes(data)

    def release(
        self,
        path: str,
        core_version: str,
    ) -> tuple[Release, bytes, str]:
        raw = self.read(path, 4 * 1024 * 1024)
        signature = self.read(f"{path}.sig", 4096).decode().strip()
        _verify_signature(raw, signature, self.key)
        if json.loads(raw).get("schema_version") == "expert-index.v1":
            import sys

            index = ReleaseIndex.model_validate_json(raw)
            matches = [
                r
                for r in index.releases
                if r.target == detect_target()
                and r.python
                == f"{sys.version_info.major}.{sys.version_info.minor}"
            ]
            if len(matches) != 1:
                raise ValueError("此专家版本暂无适配当前系统及 Python 的安装包")
            selected = matches[0]
            raw = self.read(selected.manifest, 4 * 1024 * 1024)
            if hashlib.sha256(raw).hexdigest() != selected.sha256:
                raise ValueError("Expert index manifest digest mismatch")
            signature = (
                self.read(selected.manifest + ".sig", 4096).decode().strip()
            )
            release = self.validate(raw, signature, core_version)
            if (
                release.id,
                release.version,
                release.target,
                release.python,
            ) != (
                index.id,
                index.version,
                selected.target,
                selected.python,
            ):
                raise ValueError("Expert index identity mismatch")
            return release, raw, signature
        release = self.validate(raw, signature, core_version)
        return release, raw, signature

    def validate(
        self,
        raw: bytes,
        signature: str,
        core_version: str,
    ) -> Release:
        _verify_signature(raw, signature, self.key)
        release = Release.model_validate_json(raw)
        if set(release.mcp.schemas) != set(release.mcp.tools):
            raise ValueError("专家包缺少已验证的工具契约")
        import sys

        if release.target != detect_target():
            raise ValueError("此专家包不支持当前系统或架构")
        if (
            release.python
            != f"{sys.version_info.major}.{sys.version_info.minor}"
        ):
            raise ValueError("专家运行环境与当前 Python 不兼容，请更新宿主")
        if Version(core_version) < Version(release.core_min):
            raise ValueError("请先更新宿主到此专家包要求的版本")
        return release


class _borrow:
    def __init__(self, value):
        self.value = value

    def __enter__(self):
        return self.value

    def __exit__(self, *_):
        return False


def digest(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def extract(archive: Path, root: Path, release: Release):
    if (
        archive.stat().st_size != release.artifact.size
        or digest(archive) != release.artifact.sha256
    ):
        raise ValueError("Expert archive integrity check failed")
    with zipfile.ZipFile(archive) as bundle:
        infos = bundle.infolist()
        if (
            len(infos) > 20000
            or sum(i.file_size for i in infos) > 1024 * 1024 * 1024
        ):
            raise ValueError("Expert archive exceeds extraction limit")
        names = [relative_path(i.filename) for i in infos]
        if len(set(names)) != len(names) or set(names) != set(release.files):
            raise ValueError("Archive differs from signed inventory")
        for item in infos:
            if item.is_dir() or stat.S_ISLNK(item.external_attr >> 16):
                raise ValueError(
                    "Links and directory entries are not supported",
                )
            target = root / item.filename
            target.parent.mkdir(parents=True, exist_ok=True)
            with bundle.open(item) as source, target.open("wb") as output:
                import shutil

                shutil.copyfileobj(source, output)
            if digest(target) != release.files[item.filename]:
                raise ValueError("Expert file integrity check failed")


def verify_tree(root: Path, release: Release):
    from ..components.update import _is_link_like

    if _is_link_like(root) or any(_is_link_like(p) for p in root.rglob("*")):
        raise ValueError("Linked package directory")
    actual = {
        p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_file()
    }
    if actual != set(release.files):
        raise ValueError("Installed package file inventory changed")
    for name, expected in release.files.items():
        path = root / name
        if path.is_symlink() or digest(path) != expected:
            raise ValueError("Installed package content changed")
