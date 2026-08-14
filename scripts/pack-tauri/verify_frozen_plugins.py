#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify the complete runtime shape of desktop-bundled plugins."""

from __future__ import annotations

import json
import argparse
import stat
import tarfile
import zipfile
from pathlib import Path, PurePosixPath
from typing import Callable

CRITICAL_PLUGINS = frozenset({"flowforge", "ugsci", "ugsci_research"})
MACOS_PLUGIN_SUFFIX = PurePosixPath(
    "Contents/Resources/binaries/qwenpaw-backend/_internal/qwenpaw/plugins_bundle",
)


def _safe_entry(root: Path, value: object, label: str) -> Path | None:
    if value in (None, ""):
        return None
    if not isinstance(value, str):
        raise ValueError(f"{label} must be a string")
    relative = Path(value)
    if relative.is_absolute() or ".." in relative.parts:
        raise ValueError(f"{label} is unsafe: {value}")
    target = (root / relative).resolve()
    try:
        target.relative_to(root.resolve())
    except ValueError as exc:
        raise ValueError(f"{label} escapes its plugin directory") from exc
    return target


def verify(root: Path) -> None:
    if not root.is_dir():
        raise ValueError(f"bundled plugin directory is missing: {root}")
    seen: set[str] = set()
    seen_dirs: set[str] = set()
    for manifest_path in sorted(root.glob("*/plugin.json")):
        plugin_root = manifest_path.parent
        real_plugin_root = str(plugin_root.resolve())
        if real_plugin_root in seen_dirs:
            raise ValueError(
                f"duplicate plugin directory alias: {manifest_path}",
            )
        seen_dirs.add(real_plugin_root)
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        plugin_id = str(manifest.get("id") or "").strip()
        if not plugin_id or plugin_id in seen:
            raise ValueError(
                f"invalid or duplicate plugin id: {manifest_path}",
            )
        seen.add(plugin_id)
        entry = manifest.get("entry")
        if not isinstance(entry, dict):
            raise ValueError(f"plugin {plugin_id} has no entry object")
        for kind in ("backend", "frontend"):
            target = _safe_entry(
                plugin_root,
                entry.get(kind),
                f"{plugin_id}.{kind}",
            )
            if target is not None and not target.is_file():
                raise ValueError(
                    f"plugin {plugin_id} is missing {kind} entry: {target}",
                )
    missing = CRITICAL_PLUGINS - seen
    if missing:
        raise ValueError(
            "critical bundled plugins are missing: "
            + ", ".join(sorted(missing)),
        )
    print("Verified bundled plugins: " + ", ".join(sorted(seen)))


def _normalise_archive_member(value: str) -> str:
    if not value or "\\" in value:
        raise ValueError(f"unsafe archive member path: {value!r}")
    path = PurePosixPath(value)
    if path.is_absolute() or ".." in path.parts:
        raise ValueError(f"unsafe archive member path: {value!r}")
    normalised = path.as_posix()
    while normalised.startswith("./"):
        normalised = normalised[2:]
    return normalised


def _safe_archive_entry(
    plugin_root: str,
    value: object,
    label: str,
) -> str | None:
    if value in (None, ""):
        return None
    if not isinstance(value, str):
        raise ValueError(f"{label} must be a string")
    relative = PurePosixPath(value.replace("\\", "/"))
    if relative.is_absolute() or ".." in relative.parts:
        raise ValueError(f"{label} is unsafe: {value}")
    target = (PurePosixPath(plugin_root) / relative).as_posix()
    if not target.startswith(plugin_root + "/"):
        raise ValueError(f"{label} escapes its plugin directory")
    return target


def _verify_archive_files(
    files: set[str],
    read_file: Callable[[str], bytes],
) -> None:
    payload_files = {
        name
        for name in files
        if "__MACOSX" not in PurePosixPath(name).parts
        and not any(
            part.startswith("._") for part in PurePosixPath(name).parts
        )
    }
    app_roots = {
        PurePosixPath(*PurePosixPath(name).parts[: index + 1]).as_posix()
        for name in payload_files
        for index, part in enumerate(PurePosixPath(name).parts)
        if part.endswith(".app")
        and index + 1 < len(PurePosixPath(name).parts)
        and PurePosixPath(name).parts[index + 1] == "Contents"
    }
    if len(app_roots) != 1:
        raise ValueError(
            "macOS desktop archive must contain exactly one .app bundle; "
            f"found {sorted(app_roots)}",
        )
    app_root = next(iter(app_roots))
    expected_root = (PurePosixPath(app_root) / MACOS_PLUGIN_SUFFIX).as_posix()

    all_manifests = sorted(
        name
        for name in payload_files
        if name.endswith("/plugin.json")
        and len(PurePosixPath(name).parts) >= 3
        and PurePosixPath(name).parts[-3] == "plugins_bundle"
    )
    unexpected = [
        name
        for name in all_manifests
        if PurePosixPath(name).parent.parent.as_posix() != expected_root
    ]
    if unexpected:
        raise ValueError(
            "bundled plugin manifests exist outside the frozen backend path: "
            + ", ".join(unexpected),
        )
    manifests = [
        name
        for name in all_manifests
        if PurePosixPath(name).parent.parent.as_posix() == expected_root
    ]
    seen: set[str] = set()
    for manifest_name in manifests:
        plugin_root = str(PurePosixPath(manifest_name).parent)
        manifest = json.loads(read_file(manifest_name).decode("utf-8"))
        plugin_id = str(manifest.get("id") or "").strip()
        if not plugin_id or plugin_id in seen:
            raise ValueError(
                f"invalid or duplicate plugin id in archive: {manifest_name}",
            )
        seen.add(plugin_id)
        entry = manifest.get("entry")
        if not isinstance(entry, dict):
            raise ValueError(f"plugin {plugin_id} has no entry object")
        for kind in ("backend", "frontend"):
            target = _safe_archive_entry(
                plugin_root,
                entry.get(kind),
                f"{plugin_id}.{kind}",
            )
            if target is not None and target not in files:
                raise ValueError(
                    f"plugin {plugin_id} is missing {kind} entry in archive: {target}",
                )
            if target is not None and not read_file(target):
                raise ValueError(
                    f"plugin {plugin_id} has an empty {kind} entry in archive: {target}",
                )
    missing = CRITICAL_PLUGINS - seen
    if missing:
        raise ValueError(
            "critical bundled plugins are missing from archive: "
            + ", ".join(sorted(missing)),
        )
    print("Verified archived bundled plugins: " + ", ".join(sorted(seen)))


def verify_archive(archive: Path) -> None:  # pylint: disable=too-many-branches
    if not archive.is_file():
        raise ValueError(f"plugin archive is missing: {archive}")
    if archive.suffix.lower() == ".zip":
        with zipfile.ZipFile(archive) as zip_handle:
            corrupt = zip_handle.testzip()
            if corrupt is not None:
                raise ValueError(f"corrupt ZIP member: {corrupt}")
            zip_members: dict[str, zipfile.ZipInfo] = {}
            for zip_info in zip_handle.infolist():
                name = _normalise_archive_member(zip_info.filename)
                if not name or zip_info.is_dir():
                    continue
                mode = (zip_info.external_attr >> 16) & 0o170000
                if mode == stat.S_IFLNK and "/plugins_bundle/" in f"/{name}":
                    raise ValueError(
                        f"symbolic links are not allowed in plugin archive: {name}",
                    )
                if name in zip_members:
                    raise ValueError(f"duplicate archive member: {name}")
                zip_members[name] = zip_info
            _verify_archive_files(
                set(zip_members),
                lambda name: zip_handle.read(zip_members[name]),
            )
        return

    if archive.name.endswith((".tar.gz", ".tgz")):
        with tarfile.open(archive, mode="r:gz") as tar_handle:
            tar_members: dict[str, tarfile.TarInfo] = {}
            for tar_info in tar_handle.getmembers():
                name = _normalise_archive_member(tar_info.name)
                if not name or tar_info.isdir():
                    continue
                if not tar_info.isfile():
                    if "/plugins_bundle/" in f"/{name}":
                        raise ValueError(
                            "links and special files are not allowed in plugin archive: "
                            + name,
                        )
                    continue
                if name in tar_members:
                    raise ValueError(f"duplicate archive member: {name}")
                tar_members[name] = tar_info

            def read_tar_member(name: str) -> bytes:
                stream = tar_handle.extractfile(tar_members[name])
                if stream is None:
                    raise ValueError(f"cannot read archive member: {name}")
                return stream.read()

            _verify_archive_files(set(tar_members), read_tar_member)
        return

    raise ValueError(f"unsupported plugin archive format: {archive}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify bundled plugin trees or final desktop archives",
    )
    parser.add_argument("plugins_bundle", nargs="?", type=Path)
    parser.add_argument("--archive", type=Path)
    args = parser.parse_args()
    if bool(args.plugins_bundle) == bool(args.archive):
        parser.error(
            "provide exactly one plugins_bundle directory or --archive",
        )
    try:
        if args.archive:
            verify_archive(args.archive)
        else:
            verify(args.plugins_bundle)
    except (
        OSError,
        ValueError,
        UnicodeDecodeError,
        json.JSONDecodeError,
        tarfile.TarError,
        zipfile.BadZipFile,
    ) as exc:
        raise SystemExit(str(exc)) from exc
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
