# -*- coding: utf-8 -*-
"""Opt-in signed component planning and atomic plugin activation."""

# pylint: disable=too-many-branches,too-many-return-statements
# pylint: disable=unused-argument

from __future__ import annotations

import base64
import binascii
import contextlib
import errno
import hashlib
import json
import logging
import mmap
import os
import platform
import shutil
import tempfile
import uuid
import zipfile
import stat
import threading
import time
import importlib.util
from datetime import datetime, timezone
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

from packaging.version import InvalidVersion, Version

from ..plugins.bundled import is_plugin_uninstalled
from ..update_policy import ALLOWED_PRESERVE_PATHS, DEFAULT_PRESERVE_PATHS
from ..utils.windows_paths import copy_tree, remove_tree

logger = logging.getLogger(__name__)

try:
    from cryptography.hazmat.primitives.asymmetric.ed25519 import (
        Ed25519PublicKey,
    )
except ImportError:  # pragma: no cover - dependency is declared by the project
    Ed25519PublicKey = None  # type: ignore[assignment,misc]


class ComponentUpdateError(ValueError):
    """A component update failed validation or activation."""


def _remove_readonly(func: Any, path: str, _exc_info: Any) -> None:
    """``shutil.rmtree`` onerror handler that clears the read-only bit.

    Windows refuses to delete files with the read-only attribute (common in
    archives, VCS checkouts, and some installers), which turns
    ``rmtree(ignore_errors=True)`` into silent residue that later blocks
    activation. Retrying after ``chmod`` removes that residue.
    """
    try:
        os.chmod(path, stat.S_IWRITE | stat.S_IREAD)
    except OSError:
        pass
    func(path)


def _long_path(path: Path) -> Path:
    """Prefix a Windows path with ``\\\\?\\`` when it nears MAX_PATH.

    Component trees (python-packages especially) nest deeply enough that
    ``<managed>/<component>/<version>/...`` can exceed the legacy 260-char
    limit, after which extraction and deletion fail with opaque
    ``FileNotFoundError``/``OSError``. The extended-length prefix opts the
    path out of that limit. Only over-length paths are rewritten (shorter
    ones are returned unchanged) so normal path semantics — ``lstat``-based
    link checks, ``relative_to`` — are preserved everywhere else. On
    non-Windows platforms it is a no-op.
    """
    if os.name != "nt":
        return path
    text = str(path.absolute())
    if text.startswith("\\\\?\\") or len(text) < 240:
        return path
    # Extended-length paths require absolute, backslash-separated form.
    normalized = text.replace("/", "\\")
    if normalized.startswith("\\\\"):
        return Path("\\\\?\\UNC\\" + normalized[2:])
    return Path("\\\\?\\" + normalized)


_INTERNAL_PRESERVED_NAMES = {
    ".uninstalled",
    ".bundle_hash",
    ".bundle_revision",
    ".bundle_complete",
}

_ACTIVE_LOCKS_GUARD = threading.Lock()
_ACTIVE_LOCKS: dict[str, threading.RLock] = {}
_ACTIVE_LOCK_STATE = threading.local()


def _active_process_lock(path: Path) -> threading.RLock:
    """Return the process-wide lock shared by every updater for *path*."""
    key = os.path.normcase(str(path.absolute()))
    with _ACTIVE_LOCKS_GUARD:
        return _ACTIVE_LOCKS.setdefault(key, threading.RLock())


@contextlib.contextmanager
def _active_file_lock(active_path: Path):
    """Serialize active.json RMW across threads and backend processes."""
    key = os.path.normcase(os.path.abspath(active_path))
    process_lock = _active_process_lock(active_path)
    lock_path = active_path.with_name(f".{active_path.name}.lock")
    with process_lock:
        held = getattr(_ACTIVE_LOCK_STATE, "paths", set())
        if key in held:
            # The process lock is re-entrant. Do not attempt to lock the same
            # byte through a second file descriptor, which can self-deadlock
            # on some Windows/POSIX implementations.
            yield
            return
        lock_path.parent.mkdir(parents=True, exist_ok=True)
        fd = os.open(str(lock_path), os.O_RDWR | os.O_CREAT, 0o644)
        acquired = False
        try:
            if os.name == "nt":
                import msvcrt

                while not acquired:
                    try:
                        os.lseek(fd, 0, os.SEEK_SET)
                        msvcrt.locking(fd, msvcrt.LK_NBLCK, 1)
                        acquired = True
                    except OSError as exc:
                        if exc.errno not in (errno.EACCES, errno.EDEADLOCK):
                            raise
                        time.sleep(0.05)
            else:
                import fcntl

                fcntl.flock(fd, fcntl.LOCK_EX)
                acquired = True
            held.add(key)
            _ACTIVE_LOCK_STATE.paths = held
            yield
        finally:
            held.discard(key)
            if acquired:
                if os.name == "nt":
                    import msvcrt

                    os.lseek(fd, 0, os.SEEK_SET)
                    msvcrt.locking(fd, msvcrt.LK_UNLCK, 1)
                else:
                    import fcntl

                    fcntl.flock(fd, fcntl.LOCK_UN)
            os.close(fd)


_FORBIDDEN_PRESERVE_PATHS = {"plugin.json", *_INTERNAL_PRESERVED_NAMES}
_MAX_ARCHIVE_MEMBERS = 10_000
_MAX_ARCHIVE_BYTES = 768 * 1024 * 1024
_MAX_MEMBER_BYTES = 128 * 1024 * 1024
_LARGE_DIRECTORY_ARCHIVE_LIMITS = {
    # Scientific Python dependency layers legitimately contain tens of
    # thousands of small files. Keep a finite, component-scoped ceiling so
    # production artifacts fit without weakening plugin archive limits.
    "python-packages": (150_000, 6 * 1024**3, 1024**3),
}


def _archive_limits(component: str) -> tuple[int, int, int]:
    return _LARGE_DIRECTORY_ARCHIVE_LIMITS.get(
        component,
        (_MAX_ARCHIVE_MEMBERS, _MAX_ARCHIVE_BYTES, _MAX_MEMBER_BYTES),
    )


def _safe_component_id(value: Any) -> str:
    component = str(value or "")
    if (
        not component
        or component in {".", ".."}
        or any(ch in component for ch in ("/", "\\", "\x00"))
    ):
        raise ComponentUpdateError(f"unsafe component id: {component!r}")
    return component


def detect_target() -> str:
    system = platform.system().lower()
    machine = platform.machine().lower()
    arch = "aarch64" if machine in {"aarch64", "arm64"} else "x86_64"
    if system == "windows":
        return f"windows-{arch}"
    if system == "darwin":
        return f"macos-{arch}"
    return f"{system}-{arch}"


def _version(value: Any, field: str) -> Version:
    try:
        return Version(str(value))
    except InvalidVersion as exc:
        raise ComponentUpdateError(f"invalid {field}: {value!r}") from exc


def _safe_path(value: str) -> str:
    if not value or "\\" in value or "\x00" in value:
        raise ComponentUpdateError(f"unsafe component path: {value!r}")
    path = PurePosixPath(value)
    if (
        path.is_absolute()
        or path.as_posix() in {"", "."}
        or ".." in path.parts
        or path.as_posix() != value
    ):
        raise ComponentUpdateError(f"unsafe component path: {value!r}")
    return value


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _is_link_like(path: Path) -> bool:
    try:
        attrs = path.lstat().st_file_attributes
    except (AttributeError, FileNotFoundError, OSError):
        attrs = 0
    return path.is_symlink() or bool(
        attrs & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0),
    )


def _resolve_plugin_child(
    path: Path,
    *,
    plugins_root: Path,
    label: str,
) -> Path:
    """Resolve one direct plugin child without following link-like roots."""
    if _is_link_like(plugins_root):
        raise ComponentUpdateError("plugins directory may not be a link")
    if _is_link_like(path):
        raise ComponentUpdateError(f"{label} may not be a link")
    resolved_root = plugins_root.resolve()
    resolved = path.resolve()
    if resolved.parent != resolved_root:
        raise ComponentUpdateError(
            f"{label} must remain directly inside the plugins directory",
        )
    return resolved


def _supports_posix_modes() -> bool:
    return os.name != "nt"


def _file_mode(path: Path) -> int | None:
    if not _supports_posix_modes():
        return None
    return stat.S_IMODE(path.stat().st_mode)


def _apply_expected_mode(path: Path, metadata: Any, *, relative: str) -> None:
    if not isinstance(metadata, dict) or "mode" not in metadata:
        return
    mode = metadata["mode"]
    if type(mode) is not int or not 0 <= mode <= 0o7777:
        raise ComponentUpdateError(f"invalid file mode for {relative}")
    if _supports_posix_modes():
        path.chmod(mode)


def _normalize_preserve_paths(
    value: Any,
    *,
    default: tuple[str, ...] = DEFAULT_PRESERVE_PATHS,
) -> tuple[str, ...]:
    if value is None:
        return default
    if not isinstance(value, (list, tuple)) or not value:
        raise ComponentUpdateError(
            "component preserve must be a non-empty array",
        )
    result: list[str] = []
    for item in value:
        if not isinstance(item, str):
            raise ComponentUpdateError(
                "component preserve paths must be strings",
            )
        relative = _safe_path(item.rstrip("/"))
        if (
            relative != relative.lower()
            or relative not in ALLOWED_PRESERVE_PATHS
        ):
            raise ComponentUpdateError(
                "component preserve path is not an allowed data root: "
                f"{relative}",
            )
        if relative in _FORBIDDEN_PRESERVE_PATHS:
            raise ComponentUpdateError(
                f"component preserve path is reserved: {relative}",
            )
        if any(
            relative == existing
            or relative.startswith(f"{existing}/")
            or existing.startswith(f"{relative}/")
            for existing in result
        ):
            raise ComponentUpdateError(
                f"component preserve paths overlap: {relative}",
            )
        if relative not in result:
            result.append(relative)
    return tuple(result)


def _is_preserved(relative: str, preserve_paths: tuple[str, ...]) -> bool:
    return relative in _INTERNAL_PRESERVED_NAMES or any(
        relative == prefix or relative.startswith(f"{prefix}/")
        for prefix in preserve_paths
    )


def _inventory(
    root: Path,
    preserve_paths: tuple[str, ...] = DEFAULT_PRESERVE_PATHS,
) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for path in root.rglob("*"):
        if _is_link_like(path):
            raise ComponentUpdateError(f"link in component tree: {path}")
        if not path.is_file():
            continue
        metadata = path.stat()
        if metadata.st_nlink > 1:
            raise ComponentUpdateError(f"hard link in component tree: {path}")
        relative = _safe_path(path.relative_to(root).as_posix())
        if _is_preserved(relative, preserve_paths):
            continue
        entry: dict[str, Any] = {
            "size": metadata.st_size,
            "sha256": _sha256(path),
        }
        mode = _file_mode(path)
        if mode is not None:
            entry["mode"] = mode
        result[relative] = entry
    return dict(sorted(result.items()))


def _copy_component_file(source: str, destination: str) -> None:
    """Copy one regular component file after rejecting links/hard links."""
    path = Path(source)
    if _is_link_like(path):
        raise ComponentUpdateError(f"link in component tree: {path}")
    if path.stat().st_nlink > 1:
        raise ComponentUpdateError(f"hard link in component tree: {path}")
    shutil.copy2(path, destination)


def _content_matches(
    actual: dict[str, dict[str, Any]],
    expected: dict[str, dict[str, Any]],
) -> bool:
    if set(actual) != set(expected):
        return False
    for path, metadata in expected.items():
        if not isinstance(metadata, dict):
            return False
        if "mode" in metadata and (
            type(metadata["mode"]) is not int
            or not 0 <= metadata["mode"] <= 0o7777
        ):
            return False
        if actual[path].get("size") != metadata.get("size"):
            return False
        if (
            actual[path].get("sha256")
            != str(metadata.get("sha256", "")).lower()
        ):
            return False
        if (
            _supports_posix_modes()
            and "mode" in metadata
            and actual[path].get("mode") != metadata["mode"]
        ):
            return False
    return True


def _verify_signature(
    data: bytes,
    signature_b64: str,
    public_key_b64: str,
) -> None:
    if Ed25519PublicKey is None:
        raise ComponentUpdateError(
            "cryptography is required for component signatures",
        )
    try:
        public_key = _decode_base64(
            public_key_b64,
            label="component public key",
        )
        signature = _decode_base64(
            signature_b64,
            label="component signature",
        )
        if len(public_key) != 32 or len(signature) != 64:
            raise ValueError("invalid Ed25519 key or signature length")
        key = Ed25519PublicKey.from_public_bytes(
            public_key,
        )
        key.verify(signature, data)
    except Exception as exc:  # noqa: BLE001
        raise ComponentUpdateError(
            "component signature verification failed",
        ) from exc


def _verify_signature_file(
    path: Path,
    signature_b64: str,
    public_key_b64: str,
) -> None:
    """Verify an Ed25519 signature over a potentially large file stream."""
    if Ed25519PublicKey is None:
        raise ComponentUpdateError(
            "cryptography is required for component signatures",
        )
    try:
        public_key = _decode_base64(
            public_key_b64,
            label="component public key",
        )
        signature = _decode_base64(
            signature_b64,
            label="component signature",
        )
        if len(public_key) != 32 or len(signature) != 64:
            raise ValueError("invalid Ed25519 key or signature length")
        key = Ed25519PublicKey.from_public_bytes(public_key)
        with path.open("rb") as stream:
            mapped = mmap.mmap(stream.fileno(), 0, access=mmap.ACCESS_READ)
            try:
                key.verify(signature, mapped)
            finally:
                mapped.close()
    except Exception as exc:  # noqa: BLE001
        raise ComponentUpdateError(
            "component signature verification failed",
        ) from exc


def _decode_base64(value: str, *, label: str) -> bytes:
    normalized = value.strip()
    if len(normalized) % 4 == 1:
        raise ValueError(f"{label} has an invalid Base64 length")
    try:
        return base64.b64decode(
            normalized + "=" * (-len(normalized) % 4),
            validate=True,
        )
    except (binascii.Error, ValueError) as exc:
        raise ValueError(f"{label} must be valid Base64") from exc


@dataclass(frozen=True)
class ComponentUpdatePlan:
    component: str
    from_version: str | None
    target_version: str
    artifact_kind: str
    artifact_url: str
    artifact_sha256: str
    artifact_signature: str
    preserve_paths: tuple[str, ...] = DEFAULT_PRESERVE_PATHS
    migration: dict[str, Any] | None = None


@dataclass(frozen=True)
class _BackupSnapshot:
    path: Path
    metadata: dict[str, Any]


class ComponentUpdater:
    """Plan and apply signed managed updates; never auto-runs at startup."""

    def __init__(
        self,
        *,
        public_key_b64: str,
        managed_components: set[str],
        target: str | None = None,
        core_version: str,
        active_path: Path | None = None,
        backup_root: Path | None = None,
        defer_activation_cleanup: bool = False,
        directory_components: set[str] | None = None,
        bundled_directory_records: dict[str, tuple[str, Path]] | None = None,
    ):
        self.public_key_b64 = public_key_b64
        self.managed_components = frozenset(
            _safe_component_id(item) for item in managed_components
        )
        self.target = target or detect_target()
        self.core_version = core_version
        if active_path is not None and _is_link_like(active_path):
            raise ComponentUpdateError("active path may not be a symlink")
        self.active_path = (
            active_path.absolute() if active_path is not None else None
        )
        if (
            backup_root is not None
            and backup_root.exists()
            and _is_link_like(backup_root)
        ):
            raise ComponentUpdateError("backup root may not be a symlink")
        self.backup_root = (
            backup_root.absolute() if backup_root is not None else None
        )
        # Production startup keeps the previous tree until PluginLoader has
        # successfully loaded the candidate. Unit/test callers retain the
        # historical eager cleanup behavior unless explicitly enabled.
        self.defer_activation_cleanup = defer_activation_cleanup
        # These are signed, managed directory trees (runtimes/tools/backend),
        # not plugins.  Keeping the distinction explicit prevents a signed
        # manifest from silently turning an arbitrary plugin into executable
        # runtime content.
        self.directory_components = frozenset(
            _safe_component_id(item)
            for item in (directory_components or set())
        )
        if not self.directory_components <= self.managed_components:
            raise ComponentUpdateError(
                "directory components must also be managed components",
            )
        self.bundled_directory_records: dict[str, tuple[str, Path]] = {}
        for item, record in (bundled_directory_records or {}).items():
            item = _safe_component_id(item)
            if item not in self.directory_components:
                raise ComponentUpdateError(
                    "bundled directory record is not a directory component",
                )
            version, path = record
            _version(version, "bundled component version")
            if not path.is_absolute() or _is_link_like(path):
                raise ComponentUpdateError(
                    "bundled directory component path is unsafe",
                )
            self.bundled_directory_records[item] = (version, path)
        self._lock = threading.RLock()

    def extend_managed_components(self, components: set[str]) -> None:
        """Trust additional IDs obtained from a verified signed manifest."""
        validated = {_safe_component_id(item) for item in components}
        self.managed_components = frozenset(
            set(self.managed_components) | validated,
        )

    def is_directory_component(self, component: str) -> bool:
        return component in self.directory_components

    def active_directory_record(
        self,
        component: str,
    ) -> tuple[str | None, Path | None]:
        component = _safe_component_id(component)
        if self.active_path is None or not self.active_path.is_file():
            return None, None
        try:
            payload = json.loads(self.active_path.read_text(encoding="utf-8"))
            if payload.get("schema_version") != 1:
                return None, None
            if payload.get("target") != self.target:
                return None, None
            record = payload["components"][component]
            version = str(record["version"])
            path = Path(str(record["path"]))
            return version, path
        except (
            OSError,
            KeyError,
            TypeError,
            ValueError,
            json.JSONDecodeError,
        ):
            return None, None

    def bundled_directory_record(
        self,
        component: str,
    ) -> tuple[str | None, Path | None]:
        record = self.bundled_directory_records.get(
            _safe_component_id(component),
        )
        return record if record is not None else (None, None)

    def _activation_marker(self, destination: Path) -> Path:
        return destination.parent / f".{destination.name}.activation.json"

    def activation_pending(self, destination: Path) -> bool:
        """Return whether a component awaits its health check."""
        return self._activation_marker(destination).is_file()

    def pending_activation_components(self, plugins_root: Path) -> set[str]:
        """Return managed component IDs with an uncommitted activation."""
        if _is_link_like(plugins_root):
            raise ComponentUpdateError("plugins directory may not be a link")
        pending: set[str] = set()
        for marker in plugins_root.glob(".*.activation.json"):
            try:
                payload = json.loads(marker.read_text(encoding="utf-8"))
                component = _safe_component_id(payload["component"])
            except (
                OSError,
                KeyError,
                TypeError,
                ValueError,
                json.JSONDecodeError,
            ):
                continue
            if component in self.managed_components:
                pending.add(component)

        # Recover pre-marker crash windows too. Directory names may be aliases
        # of the manifest ID, so identify the component from plugin.json.
        for previous in plugins_root.glob(".*.previous"):
            destination_name = previous.name[1 : -len(".previous")]
            try:
                _safe_component_id(destination_name)
            except ComponentUpdateError:
                continue
            destination = plugins_root / destination_name
            identity_source = destination if destination.is_dir() else previous
            try:
                payload = json.loads(
                    (identity_source / "plugin.json").read_text(
                        encoding="utf-8",
                    ),
                )
                component = _safe_component_id(payload["id"])
            except (
                OSError,
                KeyError,
                TypeError,
                ValueError,
                json.JSONDecodeError,
            ):
                continue
            if component in self.managed_components:
                pending.add(component)

        for component in self.managed_components:
            destination = plugins_root / component
            if is_plugin_uninstalled(
                component,
                plugins_dir=plugins_root,
                plugin_dir=destination,
            ):
                continue
            marker = self._activation_marker(destination)
            if (
                marker.is_file()
                or (destination.parent / f".{component}.previous").exists()
            ):
                pending.add(component)
        return pending

    def _remove_active(self, component: str) -> None:
        if self.active_path is None:
            return
        with _active_file_lock(self.active_path):
            # Re-read only after both locks are held. Another updater may have
            # committed a sibling component while this caller was waiting.
            if not self.active_path.is_file():
                return
            try:
                payload = json.loads(
                    self.active_path.read_text(encoding="utf-8"),
                )
                components = (
                    payload.get("components")
                    if isinstance(payload, dict)
                    else None
                )
                if isinstance(components, dict):
                    components.pop(component, None)
                    self._write_active_payload(payload)
            except (OSError, TypeError, ValueError, json.JSONDecodeError):
                return

    def _write_active_payload(self, payload: dict[str, Any]) -> None:
        """Atomically replace active.json; caller must hold its file lock."""
        assert self.active_path is not None
        temporary = self.active_path.with_name(
            f".{self.active_path.name}.{uuid.uuid4().hex}.staging",
        )
        try:
            temporary.write_text(
                json.dumps(payload, ensure_ascii=False, sort_keys=True) + "\n",
                encoding="utf-8",
            )
            os.replace(temporary, self.active_path)
        finally:
            temporary.unlink(missing_ok=True)

    def finalize_activation(self, component: str, destination: Path) -> None:
        """Commit a candidate after PluginLoader health checks succeed."""
        component = _safe_component_id(component)
        plugins_root = destination.parent
        destination = _resolve_plugin_child(
            destination,
            plugins_root=plugins_root,
            label="component destination",
        )
        previous = _resolve_plugin_child(
            plugins_root / f".{destination.name}.previous",
            plugins_root=plugins_root,
            label="component previous tree",
        )
        marker = self._activation_marker(destination)
        if previous.exists():
            remove_tree(previous)
        marker.unlink(missing_ok=True)
        # Reclaim superseded versions of directory components; they are never
        # read again once a new version commits, and runtimes can be GiB each.
        if component in self.directory_components:
            self._gc_managed_versions(component, keep=destination)

    def _gc_managed_versions(
        self,
        component: str,
        *,
        keep: Path,
        retain: int = 1,
    ) -> None:
        """Delete superseded version trees of a directory component.

        Managed directory components live at ``<component>/<version>`` and
        accumulate one tree per update (python-packages alone can be several
        GiB). Only the active version is ever read again after a successful
        commit, so older trees are pure disk growth. We keep the just-committed
        tree plus ``retain`` previous version(s) as a manual-rollback cushion
        and delete the rest, best-effort: a locked tree (Windows file handle)
        is skipped, never fatal.

        Safety rails: only directories under the component's own root whose
        names parse as versions are touched; the active version and the keep
        tree are always skipped; link-like entries are never descended.
        """
        component_root = keep.parent
        if _is_link_like(component_root):
            return
        active_version: str | None = None
        if self.active_path is not None and self.active_path.is_file():
            try:
                payload = json.loads(
                    self.active_path.read_text(encoding="utf-8"),
                )
                active_version = str(
                    payload["components"][component]["version"],
                )
            except (
                OSError,
                KeyError,
                TypeError,
                ValueError,
                json.JSONDecodeError,
            ):
                active_version = None
        keep_resolved = keep.resolve()
        candidates: list[tuple[Version, Path]] = []
        try:
            children = list(component_root.iterdir())
        except OSError:
            return
        for child in children:
            if not child.is_dir() or _is_link_like(child):
                continue
            # Skip activation artifacts and non-version directories.
            if child.name.startswith("."):
                continue
            try:
                parsed = Version(child.name)
            except InvalidVersion:
                continue
            if active_version is not None and child.name == active_version:
                continue
            if child.resolve() == keep_resolved:
                continue
            candidates.append((parsed, child))
        # Newest first; keep ``retain`` of the newest, delete the rest.
        candidates.sort(key=lambda item: item[0], reverse=True)
        for _, stale in candidates[retain:]:
            try:
                # Managed runtime trees nest deeply; on Windows the path may
                # exceed MAX_PATH, so delete through the extended-length form.
                remove_tree(stale)
                logger.info(
                    "Reclaimed superseded directory component %s: %s",
                    component,
                    stale,
                )
            except OSError as exc:
                logger.warning(
                    "Could not reclaim superseded directory component %s "
                    "(left for a later pass): %s",
                    stale,
                    exc,
                )

    def rollback_activation(self, component: str, destination: Path) -> bool:
        """Restore the last-known-good tree; return whether one existed."""
        component = _safe_component_id(component)
        plugins_root = destination.parent
        destination = _resolve_plugin_child(
            destination,
            plugins_root=plugins_root,
            label="component destination",
        )
        previous = _resolve_plugin_child(
            plugins_root / f".{destination.name}.previous",
            plugins_root=plugins_root,
            label="component previous tree",
        )
        marker = self._activation_marker(destination)
        if previous.exists():
            if destination.exists():
                # A read-only remnant here must not silently survive: the
                # previous.replace() below requires a clear destination.
                remove_tree(destination)
            previous.replace(destination)
            try:
                plugin = json.loads(
                    (destination / "plugin.json").read_text(encoding="utf-8"),
                )
                self._commit_active(
                    component,
                    str(plugin.get("version", "")),
                    destination,
                )
            except (
                OSError,
                UnicodeDecodeError,
                ValueError,
                TypeError,
                json.JSONDecodeError,
            ) as exc:
                raise ComponentUpdateError(
                    "failed to restore previous component",
                ) from exc
            marker.unlink(missing_ok=True)
            return True
        if destination.exists():
            remove_tree(destination)
        self._remove_active(component)
        marker.unlink(missing_ok=True)
        return False

    def _run_migration(self, plan: ComponentUpdatePlan, staged: Path) -> None:
        """Run an optional, in-process plugin data migration hook.

        The hook is declared by the signed manifest and must be a safe
        ``module:function`` reference rooted in the staged component. No
        shell/subprocess execution is permitted. The hook receives the staged
        component data root and both semantic versions.
        """
        migration = plan.migration
        if not migration:
            return
        hook = migration.get("hook")
        if not isinstance(hook, str) or hook.count(":") != 1:
            raise ComponentUpdateError("invalid component migration hook")
        module_name, function_name = hook.split(":", 1)
        if not module_name.isidentifier() or not function_name.isidentifier():
            raise ComponentUpdateError("unsafe component migration hook")
        allowed_from = migration.get("from")
        if allowed_from not in (None, "*", plan.from_version):
            raise ComponentUpdateError(
                "component migration source version mismatch",
            )
        if migration.get("to") not in (None, plan.target_version):
            raise ComponentUpdateError(
                "component migration target version mismatch",
            )
        data_root = staged
        if not any((staged / root).exists() for root in plan.preserve_paths):
            return
        module_path = staged / f"{module_name}.py"
        if not module_path.is_file() or _is_link_like(module_path):
            raise ComponentUpdateError("component migration module is missing")
        spec = importlib.util.spec_from_file_location(
            f"_qwenpaw_component_migration_{plan.component}",
            module_path,
        )
        if spec is None or spec.loader is None:
            raise ComponentUpdateError("component migration module is invalid")
        try:
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            callback = getattr(module, function_name, None)
            if not callable(callback):
                raise ComponentUpdateError(
                    "component migration hook is not callable",
                )
            callback(data_root, plan.from_version, plan.target_version)
        except ComponentUpdateError:
            raise
        except Exception as exc:  # noqa: BLE001
            raise ComponentUpdateError(
                "component data migration failed",
            ) from exc

    def _backup_component_data(
        self,
        plan: ComponentUpdatePlan,
        source: Path,
        destination: Path,
    ) -> _BackupSnapshot | None:
        """Persist and verify data before component activation."""
        # pylint: disable=too-many-branches,too-many-statements
        if not plan.preserve_paths or not source.is_dir():
            return None
        if _is_link_like(source):
            raise ComponentUpdateError("backup source may not be a symlink")
        root = (
            self.backup_root
            or destination.parent / ".qwenpaw-component-backups"
        )
        if root.exists() and _is_link_like(root):
            raise ComponentUpdateError("backup root may not be a symlink")
        root.mkdir(parents=True, exist_ok=True)
        component_root = root / plan.component
        if component_root.exists() and _is_link_like(component_root):
            raise ComponentUpdateError(
                "component backup directory may not be a symlink",
            )
        component_root.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
        backup_id = f"{timestamp}-{uuid.uuid4().hex}"
        staging = component_root / f".{backup_id}.staging"
        committed = component_root / backup_id
        staging.mkdir()
        data_root = staging / "data"
        files: dict[str, dict[str, Any]] = {}
        try:
            for relative in plan.preserve_paths:
                candidate = source / relative
                if _is_link_like(candidate):
                    raise ComponentUpdateError(
                        f"preserved data may not be a link: {relative}",
                    )
                if not candidate.exists():
                    continue
                target = data_root / relative
                if candidate.is_dir():
                    for item in candidate.rglob("*"):
                        if (
                            _is_link_like(item)
                            or item.is_file()
                            and item.stat().st_nlink > 1
                        ):
                            raise ComponentUpdateError(
                                "preserved data may not contain links: "
                                f"{item}",
                            )
                    copy_tree(candidate, target)
                elif candidate.is_file():
                    if candidate.stat().st_nlink > 1:
                        raise ComponentUpdateError(
                            "preserved data may not be a hard link: "
                            f"{relative}",
                        )
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(candidate, target)
                else:
                    raise ComponentUpdateError(
                        f"unsupported preserved data entry: {relative}",
                    )
            if data_root.exists():
                for item in sorted(
                    path for path in data_root.rglob("*") if path.is_file()
                ):
                    relative = _safe_path(
                        item.relative_to(data_root).as_posix(),
                    )
                    files[relative] = {
                        "size": item.stat().st_size,
                        "sha256": _sha256(item),
                    }
            metadata = {
                "schema_version": 1,
                "component": plan.component,
                "source_version": plan.from_version,
                "target_version": plan.target_version,
                "created_at": datetime.now(timezone.utc)
                .isoformat()
                .replace("+00:00", "Z"),
                "preserve": list(plan.preserve_paths),
                "files": files,
            }
            (staging / "backup.json").write_text(
                json.dumps(metadata, ensure_ascii=False, sort_keys=True)
                + "\n",
                encoding="utf-8",
            )
            for relative, expected in files.items():
                item = data_root / relative
                if (
                    item.stat().st_size != expected["size"]
                    or _sha256(item) != expected["sha256"]
                ):
                    raise ComponentUpdateError(
                        "preserved data backup verification failed: "
                        f"{relative}",
                    )
            os.replace(staging, committed)
            return _BackupSnapshot(committed, metadata)
        except Exception as exc:
            remove_tree(staging, ignore_errors=True)
            if isinstance(exc, ComponentUpdateError):
                raise
            raise ComponentUpdateError(
                "failed to back up preserved component data",
            ) from exc

    @staticmethod
    def _prune_backups(backup: _BackupSnapshot | None, keep: int = 3) -> None:
        if backup is None:
            return
        try:
            committed = sorted(
                (
                    item
                    for item in backup.path.parent.iterdir()
                    if item.is_dir() and not item.name.startswith(".")
                ),
                key=lambda item: item.name,
                reverse=True,
            )
            for expired in committed[keep:]:
                if not _is_link_like(expired):
                    remove_tree(expired)
        except OSError:
            pass

    @staticmethod
    def _restore_backup_to_staging(
        backup: _BackupSnapshot | None,
        staged: Path,
        plan: ComponentUpdatePlan,
    ) -> None:
        # pylint: disable=too-many-branches,too-many-statements
        if backup is None:
            return
        try:
            metadata_path = backup.path / "backup.json"
            data_root = backup.path / "data"
            if (
                _is_link_like(backup.path)
                or _is_link_like(metadata_path)
                or data_root.exists()
                and _is_link_like(data_root)
            ):
                raise ComponentUpdateError("backup contains an unsafe link")
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            if metadata != backup.metadata:
                raise ComponentUpdateError(
                    "backup metadata changed after creation",
                )
            if (
                metadata.get("schema_version") != 1
                or metadata.get("component") != plan.component
            ):
                raise ValueError("invalid backup metadata")
            if (
                metadata.get("source_version") != plan.from_version
                or metadata.get("target_version") != plan.target_version
            ):
                raise ValueError("incomplete backup metadata")
            if (
                _normalize_preserve_paths(metadata.get("preserve"), default=())
                != plan.preserve_paths
            ):
                raise ValueError(
                    "backup preserve paths do not match update plan",
                )
            files = metadata["files"]
            if not isinstance(files, dict):
                raise ValueError("invalid files inventory")
            resolved_data_root = data_root.resolve()
            actual_files = (
                {
                    _safe_path(item.relative_to(data_root).as_posix())
                    for item in data_root.rglob("*")
                    if item.is_file()
                }
                if data_root.exists()
                else set()
            )
            if actual_files != set(files):
                raise ComponentUpdateError(
                    "backup data inventory changed after creation",
                )
            for relative, expected in files.items():
                if (
                    not isinstance(expected, dict)
                    or type(expected.get("size")) is not int
                    or not isinstance(expected.get("sha256"), str)
                ):
                    raise ValueError("invalid backup file metadata")
                relative = _safe_path(relative)
                if not _is_preserved(relative, plan.preserve_paths):
                    raise ValueError(
                        "backup inventory contains a non-preserved path",
                    )
                source = data_root / relative
                if (
                    _is_link_like(source)
                    or not source.is_file()
                    or resolved_data_root not in source.resolve().parents
                ):
                    raise ComponentUpdateError(
                        f"backup file is missing or unsafe: {relative}",
                    )
                if source.stat().st_size != expected.get("size") or _sha256(
                    source,
                ) != expected.get("sha256"):
                    raise ComponentUpdateError(
                        f"backup data verification failed: {relative}",
                    )
            for relative in files:
                source = data_root / relative
                target = staged / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                if target.exists() and target.is_dir():
                    remove_tree(target)
                shutil.copy2(source, target)
            for relative, expected in files.items():
                restored = staged / relative
                if (
                    restored.stat().st_size != expected["size"]
                    or _sha256(restored) != expected["sha256"]
                ):
                    raise ComponentUpdateError(
                        f"restored data verification failed: {relative}",
                    )
        except ComponentUpdateError:
            raise
        except Exception as exc:
            raise ComponentUpdateError(
                "failed to restore preserved component data",
            ) from exc

    def _commit_active(
        self,
        component: str,
        version: str,
        destination: Path,
    ) -> None:
        if self.active_path is None:
            return
        self.active_path.parent.mkdir(parents=True, exist_ok=True)
        with _active_file_lock(self.active_path):
            payload: dict[str, Any] = {
                "schema_version": 1,
                "target": self.target,
                "components": {},
            }
            # Re-read inside the cross-process critical section so concurrent
            # commits merge rather than replacing one another.
            if self.active_path.is_file():
                try:
                    existing = json.loads(
                        self.active_path.read_text(encoding="utf-8"),
                    )
                    if (
                        isinstance(existing, dict)
                        and existing.get("target") == self.target
                        and isinstance(existing.get("components"), dict)
                    ):
                        payload["components"].update(existing["components"])
                except (OSError, json.JSONDecodeError, TypeError):
                    pass
            record = {
                "version": version,
                "path": str(destination),
            }
            # Runtime execution type is derived from the fixed client
            # allowlist, never from remote Manifest input.
            if (
                component == "backend"
                and component in self.directory_components
            ):
                record["kind"] = "python"
            payload["components"][component] = record
            self._write_active_payload(payload)

    def recover_interrupted_directory_activation(
        self,
        component: str,
        destination: Path,
        expected_files: dict[str, dict[str, Any]] | None = None,
        expected_version: str | None = None,
        preserve_paths: tuple[str, ...] = DEFAULT_PRESERVE_PATHS,
    ) -> None:
        """Clear a directory component's leftover activation artifacts.

        Directory components (backend, runtimes) finalize inline in the
        service after ``apply_full``/``apply_delta``. A crash between
        ``_atomic_activate`` and that finalize leaves a stale activation
        marker and/or ``.previous`` tree under the target-version directory,
        which would otherwise permanently block retrying that version.

        Unlike the plugin recovery path, this never restores or commits:
        a directory component's currently-running version is owned by
        ``active.json`` and lives in a *different* version directory than
        ``destination`` (which is the not-yet-active target tree). We only:

        * complete a fully-applied candidate (content matches the signed
          manifest) by dropping the stale marker + previous tree — this is
          the finalize the crash interrupted;
        * discard a partially-applied candidate (content mismatch) so the
          version can be downloaded and applied fresh;
        * remove an orphaned ``.previous`` tree with no marker (crash during
          the atomic swap) so the next apply is not blocked by it.
        """
        component = _safe_component_id(component)
        if component not in self.directory_components:
            raise ComponentUpdateError(
                "directory recovery requires a directory component",
            )
        previous = destination.parent / f".{destination.name}.previous"
        marker = self._activation_marker(destination)
        if _is_link_like(previous) or _is_link_like(marker):
            raise ComponentUpdateError(
                "interrupted directory activation contains an unsafe link",
            )
        # Never touch the tree that active.json currently points at: when the
        # manifest version equals the running version, ``destination`` IS the
        # live component, and deleting it would break the running app.
        _, active_dir = self.active_directory_record(component)
        destination_is_active = (
            active_dir is not None
            and active_dir.resolve() == destination.resolve()
        )
        if marker.exists():
            complete = (
                expected_files is not None
                and destination.is_dir()
                and _content_matches(
                    _inventory(destination, preserve_paths),
                    expected_files,
                )
            )
            if complete:
                # The crash hit after a successful apply but before finalize.
                logger.info(
                    "Completing interrupted directory activation for %s",
                    component,
                )
                if previous.exists():
                    remove_tree(previous, ignore_errors=True)
                marker.unlink(missing_ok=True)
                return
            if destination_is_active:
                # The "partial" tree is actually the live component (manifest
                # version == running version, e.g. a hand-edited file). Leave
                # it and the marker alone rather than deleting a running tree.
                logger.warning(
                    "Leaving marker on live directory component %s; its "
                    "content differs from the signed manifest",
                    component,
                )
                return
            # Partially applied candidate: discard so the version is retried.
            logger.warning(
                "Discarding partially applied directory component %s",
                component,
            )
            if destination.exists():
                remove_tree(destination, ignore_errors=True)
            if previous.exists():
                remove_tree(previous, ignore_errors=True)
            marker.unlink(missing_ok=True)
            return
        if previous.exists():
            if destination_is_active:
                # The stale previous belongs to the live component's own
                # failed swap; removing it is safe (the live tree stays).
                logger.warning(
                    "Removing stale previous tree for live directory "
                    "component %s",
                    component,
                )
                remove_tree(previous, ignore_errors=True)
                return
            # Crash during the atomic swap: the candidate never activated.
            # The running version lives in its own directory, so this stale
            # tree is pure residue blocking the next apply.
            logger.warning(
                "Removing stale previous tree for directory component %s",
                component,
            )
            remove_tree(previous, ignore_errors=True)

    def recover_interrupted_activation(
        self,
        component: str,
        destination: Path,
        expected_files: dict[str, dict[str, Any]] | None = None,
        expected_version: str | None = None,
        preserve_paths: tuple[str, ...] = DEFAULT_PRESERVE_PATHS,
    ) -> None:
        """Resolve a crash window before reading the installed component."""
        component = _safe_component_id(component)
        previous = destination.parent / f".{destination.name}.previous"
        marker = self._activation_marker(destination)
        if not previous.exists():
            return
        if (
            _is_link_like(previous)
            or destination.exists()
            and _is_link_like(destination)
        ):
            raise ComponentUpdateError(
                "interrupted component activation contains an unsafe link",
            )
        if not destination.exists():
            # ``previous`` is the exact directory that was atomically moved
            # aside before activation. It is an older verified version, so it
            # cannot be compared against the new manifest's expected_files.
            # Validate links/hard links and identity, then restore it as the
            # last known-good component.
            _inventory(previous, preserve_paths)
            try:
                plugin = json.loads(
                    (previous / "plugin.json").read_text(encoding="utf-8"),
                )
            except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise ComponentUpdateError(
                    "interrupted previous plugin.json is invalid",
                ) from exc
            if not isinstance(plugin, dict) or plugin.get("id") != component:
                raise ComponentUpdateError(
                    "interrupted previous component identity mismatch",
                )
            previous.replace(destination)
            self._commit_active(
                component,
                str(plugin.get("version", "")),
                destination,
            )
            return
        active_version: str | None = None
        if self.active_path is not None and self.active_path.is_file():
            try:
                payload = json.loads(
                    self.active_path.read_text(encoding="utf-8"),
                )
                active_version = str(
                    payload["components"][component]["version"],
                )
            except (
                OSError,
                KeyError,
                TypeError,
                ValueError,
                json.JSONDecodeError,
            ):
                active_version = None
        installed_version: str | None = None
        try:
            installed_version = str(
                json.loads(
                    (destination / "plugin.json").read_text(encoding="utf-8"),
                )["version"],
            )
        except (
            OSError,
            KeyError,
            TypeError,
            ValueError,
            json.JSONDecodeError,
        ):
            pass
        if marker.exists():
            # The candidate is intentionally kept for PluginLoader health
            # validation. Do not mistake a valid candidate for an interrupted
            # activation and delete its last-known-good rollback tree.
            return
        if (
            expected_files is not None
            and expected_version is not None
            and installed_version == expected_version
            and _content_matches(
                _inventory(destination, preserve_paths),
                expected_files,
            )
        ):
            self._commit_active(component, installed_version, destination)
            remove_tree(previous)
            return
        if (
            active_version is not None
            and active_version == installed_version
            and expected_files is not None
            and _content_matches(
                _inventory(destination, preserve_paths),
                expected_files,
            )
        ):
            remove_tree(previous)
            return
        if active_version is not None and active_version == installed_version:
            _inventory(destination, preserve_paths)
            remove_tree(previous)
            return
        raise ComponentUpdateError(
            "interrupted component activation requires verified recovery",
        )

    def _atomic_activate(
        self,
        staged: Path,
        destination: Path,
        component: str,
        version: str,
    ) -> None:
        # pylint: disable=too-many-branches
        plugins_root = destination.parent
        plugins_root.mkdir(parents=True, exist_ok=True)
        destination = _resolve_plugin_child(
            destination,
            plugins_root=plugins_root,
            label="component destination",
        )
        previous = _resolve_plugin_child(
            plugins_root / f".{destination.name}.previous",
            plugins_root=plugins_root,
            label="component previous tree",
        )
        failed = (
            plugins_root / f".{destination.name}.failed-{uuid.uuid4().hex}"
        )
        if previous.exists():
            raise ComponentUpdateError(
                f"stale previous backup exists: {previous}",
            )
        if destination.exists():
            destination.replace(previous)
        try:
            staged.replace(destination)
        except Exception:
            if previous.exists() and not destination.exists():
                previous.replace(destination)
            raise
        marker = self._activation_marker(destination)
        temporary_marker = marker.with_name(
            f".{marker.name}.{uuid.uuid4().hex}.staging",
        )
        try:
            if marker.exists() or _is_link_like(marker):
                raise ComponentUpdateError(
                    f"stale or unsafe activation marker exists: {marker}",
                )
            with temporary_marker.open("x", encoding="utf-8") as stream:
                stream.write(
                    json.dumps(
                        {
                            "schema_version": 1,
                            "component": component,
                            "version": version,
                        },
                        sort_keys=True,
                    )
                    + "\n",
                )
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(temporary_marker, marker)
        except Exception as exc:
            temporary_marker.unlink(missing_ok=True)
            if destination.exists():
                destination.replace(failed)
            if previous.exists() and not destination.exists():
                previous.replace(destination)
            remove_tree(failed, ignore_errors=True)
            if isinstance(exc, ComponentUpdateError):
                raise
            raise ComponentUpdateError(
                "failed to publish component activation marker",
            ) from exc
        try:
            self._commit_active(component, version, destination)
        except Exception:
            if destination.exists():
                destination.replace(failed)
            if previous.exists() and not destination.exists():
                previous.replace(destination)
            remove_tree(failed, ignore_errors=True)
            marker.unlink(missing_ok=True)
            raise
        # Keep the previous tree until the startup PluginLoader confirms that
        # the new component can actually be imported. This is the critical
        # last-known-good rollback boundary. Legacy/direct callers can opt in
        # to eager cleanup through ``defer_activation_cleanup=False``.
        if not self.defer_activation_cleanup:
            self.finalize_activation(component, destination)

    def load_manifest(
        self,
        path: Path,
        signature_path: Path,
    ) -> dict[str, Any]:
        # pylint: disable=too-many-branches,too-many-statements
        raw = path.read_bytes()
        _verify_signature(
            raw,
            signature_path.read_text(encoding="utf-8").strip(),
            self.public_key_b64,
        )
        try:
            manifest = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ComponentUpdateError(
                "invalid component manifest JSON",
            ) from exc
        if not isinstance(manifest, dict):
            raise ComponentUpdateError("component manifest must be an object")
        if (
            manifest.get("schema_version") != 1
            or manifest.get("target") != self.target
        ):
            raise ComponentUpdateError(
                "component manifest schema or target mismatch",
            )
        if _version(self.core_version, "core_version") < _version(
            manifest["core_min_version"],
            "core_min_version",
        ):
            raise ComponentUpdateError(
                "core version is below component minimum",
            )
        components = manifest.get("components")
        if not isinstance(components, dict):
            raise ComponentUpdateError(
                "component manifest components must be an object",
            )
        for component, entry in components.items():
            _safe_component_id(component)
            if not isinstance(entry, dict):
                raise ComponentUpdateError(
                    f"invalid manifest entry for {component}",
                )
            _version(entry.get("version"), f"component {component} version")
            if entry.get("kind", "directory") != "directory":
                raise ComponentUpdateError(
                    f"unsupported component kind for {component}",
                )
            if entry.get("min_core_version") is not None and _version(
                self.core_version,
                "core_version",
            ) < _version(
                entry["min_core_version"],
                f"component {component} minimum",
            ):
                raise ComponentUpdateError(
                    f"core version is below {component} minimum",
                )
            raw_preserve = entry.get("preserve")
            entry["preserve"] = list(
                ()
                if self.is_directory_component(component)
                and raw_preserve == []
                else _normalize_preserve_paths(
                    raw_preserve,
                    default=(
                        ()
                        if self.is_directory_component(component)
                        else DEFAULT_PRESERVE_PATHS
                    ),
                ),
            )
            migration = entry.get("migration")
            if migration is not None:
                if not isinstance(migration, dict):
                    raise ComponentUpdateError(
                        f"invalid migration metadata for {component}",
                    )
                hook = migration.get("hook")
                if not isinstance(hook, str) or hook.count(":") != 1:
                    raise ComponentUpdateError(
                        f"invalid migration hook for {component}",
                    )
                module_name, function_name = hook.split(":", 1)
                if (
                    not module_name.isidentifier()
                    or not function_name.isidentifier()
                ):
                    raise ComponentUpdateError(
                        f"unsafe migration hook for {component}",
                    )
                for key in ("from", "to"):
                    value = migration.get(key)
                    if value is not None:
                        _version(value, f"migration {component} {key}")
            full = entry.get("full")
            if not isinstance(full, dict):
                raise ComponentUpdateError(
                    f"missing full artifact for {component}",
                )
            artifacts = [full, *(entry.get("deltas") or [])]
            for artifact in artifacts:
                valid_artifact = isinstance(artifact, dict)
                if valid_artifact:
                    valid_artifact = bool(str(artifact.get("url", "")))
                    valid_artifact = (
                        valid_artifact
                        and type(
                            artifact.get("size"),
                        )
                        is int
                    )
                    valid_artifact = valid_artifact and artifact["size"] >= 0
                    valid_artifact = (
                        valid_artifact
                        and len(
                            str(artifact.get("sha256", "")),
                        )
                        == 64
                    )
                    valid_artifact = valid_artifact and bool(
                        artifact.get("signature"),
                    )
                if not valid_artifact:
                    raise ComponentUpdateError(
                        f"invalid artifact metadata for {component}",
                    )
        return manifest

    def plan(
        self,
        manifest: dict[str, Any],
        component: str,
        installed: Path | None,
        *,
        plugins_root: Path | None = None,
    ) -> ComponentUpdatePlan | None:
        component = _safe_component_id(component)
        if component not in self.managed_components:
            raise ComponentUpdateError(
                f"component is not managed: {component}",
            )
        entry = (manifest.get("components") or {}).get(component)
        if not isinstance(entry, dict):
            return None
        if plugins_root is None and installed is not None:
            plugins_root = installed.parent
        directory_component = self.is_directory_component(component)
        if (
            not directory_component
            and plugins_root is not None
            and is_plugin_uninstalled(
                component,
                plugins_dir=plugins_root,
                plugin_dir=installed,
            )
        ):
            return None
        target_version = str(entry.get("version", ""))
        if not target_version:
            raise ComponentUpdateError("component target version is missing")
        current_version: str | None = None
        raw_preserve = entry.get("preserve")
        preserve_paths = (
            ()
            if directory_component and raw_preserve == []
            else _normalize_preserve_paths(
                raw_preserve,
                default=(
                    () if directory_component else DEFAULT_PRESERVE_PATHS
                ),
            )
        )
        if directory_component:
            active_version, active_directory = self.active_directory_record(
                component,
            )
            if (
                installed is not None
                and active_directory is not None
                and installed.absolute() == active_directory.absolute()
            ):
                current_version = active_version
            if current_version is None and installed is not None:
                (
                    bundled_version,
                    bundled_directory,
                ) = self.bundled_directory_record(component)
                if (
                    bundled_directory is not None
                    and installed.absolute() == bundled_directory.absolute()
                ):
                    current_version = bundled_version
            if current_version is not None and _version(
                current_version,
                "installed version",
            ) >= _version(target_version, "target version"):
                return None
        elif installed is not None and (installed / "plugin.json").is_file():
            data = json.loads(
                (installed / "plugin.json").read_text(encoding="utf-8"),
            )
            current_version = str(data.get("version", "0.0.0"))
            if _version(current_version, "installed version") >= _version(
                target_version,
                "target version",
            ):
                return None
        for delta in entry.get("deltas", []):
            if delta.get("from") == current_version:
                return ComponentUpdatePlan(
                    component,
                    current_version,
                    target_version,
                    "delta",
                    str(delta["url"]),
                    str(delta["sha256"]),
                    str(delta.get("signature", "")),
                    preserve_paths,
                    entry.get("migration"),
                )
        full = entry.get("full")
        if not isinstance(full, dict):
            raise ComponentUpdateError("no compatible full artifact")
        return ComponentUpdatePlan(
            component,
            current_version,
            target_version,
            "full",
            str(full["url"]),
            str(full["sha256"]),
            str(full.get("signature", "")),
            preserve_paths,
            entry.get("migration"),
        )

    def apply_delta(
        self,
        plan: ComponentUpdatePlan,
        base: Path,
        archive: Path,
        destination: Path,
    ) -> None:
        # pylint: disable=too-many-branches,too-many-statements
        if (
            plan.artifact_kind != "delta"
            or plan.component not in self.managed_components
        ):
            raise ComponentUpdateError("invalid component update plan")
        plugins_root = destination.parent
        directory_component = self.is_directory_component(plan.component)
        if directory_component:
            # The delta base of a directory component is either its managed
            # version dir (a sibling of destination) or, on the first update
            # after installation, the bundled tree inside the Tauri resource
            # dir. Both are validated by service-side resolution before
            # reaching here, so the plugins-root sibling constraint does not
            # apply; only link-like traversal is rejected.
            if _is_link_like(base):
                raise ComponentUpdateError(
                    "component base may not be a link",
                )
            base = base.resolve()
        else:
            base = _resolve_plugin_child(
                base,
                plugins_root=plugins_root,
                label="component base",
            )
        destination = _resolve_plugin_child(
            destination,
            plugins_root=plugins_root,
            label="component destination",
        )
        if not directory_component and is_plugin_uninstalled(
            plan.component,
            plugins_dir=plugins_root.resolve(),
            plugin_dir=base,
        ):
            raise ComponentUpdateError("component is marked uninstalled")
        if not directory_component and is_plugin_uninstalled(
            plan.component,
            plugins_dir=destination.parent,
            plugin_dir=destination,
        ):
            raise ComponentUpdateError("component is marked uninstalled")
        destination.parent.mkdir(parents=True, exist_ok=True)
        # Replacing the installed directory is the normal runtime path.  The
        # base is copied into a same-parent staging directory before the
        # destination is renamed, so equality is safe; only a destination
        # nested inside the base could invalidate the copy/activation boundary.
        if base in destination.parents:
            raise ComponentUpdateError(
                "destination must not be nested inside base",
            )
        if _sha256(archive) != plan.artifact_sha256:
            raise ComponentUpdateError("delta artifact sha256 mismatch")
        if not plan.artifact_signature:
            raise ComponentUpdateError("delta artifact signature is required")
        _verify_signature_file(
            archive,
            plan.artifact_signature,
            self.public_key_b64,
        )
        with tempfile.TemporaryDirectory(
            prefix=f".{plan.component}.staging-",
            dir=str(destination.parent),
        ) as temp:
            staged = Path(temp) / "component"
            base_inventory = _inventory(base, plan.preserve_paths)
            copy_tree(base, staged)
            with zipfile.ZipFile(archive) as bundle:
                infos = bundle.infolist()
                max_members, max_bytes, max_member_bytes = _archive_limits(
                    plan.component,
                )
                if (
                    len(infos) > max_members
                    or sum(info.file_size for info in infos) > max_bytes
                ):
                    raise ComponentUpdateError(
                        "delta artifact exceeds safety limits",
                    )
                names = [info.filename for info in infos]
                if len(set(names)) != len(names):
                    raise ComponentUpdateError(
                        "delta artifact contains duplicate members",
                    )
                if any(info.is_dir() for info in infos):
                    raise ComponentUpdateError(
                        "delta artifact contains directory members",
                    )
                if any(info.file_size > max_member_bytes for info in infos):
                    raise ComponentUpdateError(
                        "delta artifact member exceeds safety limit",
                    )
                try:
                    delta = json.loads(bundle.read("delta.json"))
                except (
                    KeyError,
                    UnicodeDecodeError,
                    json.JSONDecodeError,
                ) as exc:
                    raise ComponentUpdateError(
                        "invalid delta.json JSON",
                    ) from exc
                if not isinstance(delta, dict):
                    raise ComponentUpdateError(
                        "delta.json must contain an object",
                    )
                if (
                    delta.get("component") != plan.component
                    or delta.get("base_version") != plan.from_version
                    or delta.get("target_version") != plan.target_version
                ):
                    raise ComponentUpdateError(
                        "delta metadata does not match plan",
                    )
                if not _content_matches(
                    base_inventory,
                    delta.get("base_files", {}),
                ):
                    raise ComponentUpdateError(
                        "delta base inventory does not match base",
                    )
                deletes = delta.get("delete", [])
                adds = delta.get("add", [])
                replaces = delta.get("replace", [])
                if any(
                    not isinstance(items, list)
                    or len(items) != len(set(items))
                    for items in (deletes, adds, replaces)
                ):
                    raise ComponentUpdateError(
                        "delta operation lists must be unique arrays",
                    )
                payload_names = {info.filename for info in infos}
                expected_payloads = {
                    f"files/{relative}" for relative in [*adds, *replaces]
                }
                if payload_names != {"delta.json", *expected_payloads}:
                    raise ComponentUpdateError(
                        "delta payload members do not match operations",
                    )
                for relative in deletes:
                    relative = _safe_path(relative)
                    if _is_preserved(relative, plan.preserve_paths):
                        raise ComponentUpdateError(
                            f"delta may not modify preserved data: {relative}",
                        )
                    candidate = (staged / relative).resolve()
                    candidate.relative_to(staged.resolve())
                    if candidate.exists() and not candidate.is_file():
                        raise ComponentUpdateError(
                            f"delete target is not a file: {relative}",
                        )
                    candidate.unlink(missing_ok=True)
                for relative in [*adds, *replaces]:
                    relative = _safe_path(relative)
                    if _is_preserved(relative, plan.preserve_paths):
                        raise ComponentUpdateError(
                            f"delta may not modify preserved data: {relative}",
                        )
                    candidate = (staged / relative).resolve()
                    candidate.relative_to(staged.resolve())
                    candidate.parent.mkdir(parents=True, exist_ok=True)
                    with (
                        bundle.open(
                            f"files/{relative}",
                        ) as source,
                        candidate.open("wb") as target,
                    ):
                        shutil.copyfileobj(source, target, length=1024 * 1024)
                    _apply_expected_mode(
                        candidate,
                        delta.get("final_files", {}).get(relative),
                        relative=relative,
                    )
            expected = delta.get("final_files", {})
            if not isinstance(expected, dict):
                raise ComponentUpdateError(
                    "delta final_files must contain an object",
                )
            actual = _inventory(staged, plan.preserve_paths)
            if not _content_matches(actual, expected):
                raise ComponentUpdateError("final file verification failed")
            if (
                not directory_component
                and not (staged / "plugin.json").is_file()
            ):
                raise ComponentUpdateError(
                    "updated component has no plugin.json",
                )
            if not directory_component:
                try:
                    plugin = json.loads(
                        (staged / "plugin.json").read_text(encoding="utf-8"),
                    )
                except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                    raise ComponentUpdateError(
                        "invalid updated plugin JSON",
                    ) from exc
                if (
                    plugin.get("id") != plan.component
                    or str(plugin.get("version")) != plan.target_version
                ):
                    raise ComponentUpdateError(
                        "updated plugin identity/version mismatch",
                    )
            backup = self._backup_component_data(plan, base, destination)
            self._restore_backup_to_staging(backup, staged, plan)
            self._run_migration(plan, staged)
            if not _content_matches(
                _inventory(staged, plan.preserve_paths),
                expected,
            ):
                raise ComponentUpdateError(
                    "restored delta component inventory mismatch",
                )
            if not directory_component:
                plugin = json.loads(
                    (staged / "plugin.json").read_text(encoding="utf-8"),
                )
                if (
                    plugin.get("id") != plan.component
                    or str(plugin.get("version")) != plan.target_version
                ):
                    raise ComponentUpdateError(
                        "restored delta plugin identity/version mismatch",
                    )
            self._atomic_activate(
                staged,
                destination,
                plan.component,
                plan.target_version,
            )
            self._prune_backups(backup)

    def apply_full(
        self,
        plan: ComponentUpdatePlan,
        archive: Path,
        destination: Path,
        *,
        expected_files: dict[str, dict[str, Any]],
        preserve_from: Path | None = None,
    ) -> None:
        """Apply a signed ZIP full artifact using the same atomic boundary."""
        # pylint: disable=too-many-branches,too-many-statements
        if (
            plan.artifact_kind != "full"
            or plan.component not in self.managed_components
        ):
            raise ComponentUpdateError("invalid full component update plan")
        if not plan.artifact_signature:
            raise ComponentUpdateError("full artifact signature is required")
        if _sha256(archive) != plan.artifact_sha256:
            raise ComponentUpdateError("full artifact sha256 mismatch")
        _verify_signature_file(
            archive,
            plan.artifact_signature,
            self.public_key_b64,
        )
        plugins_root = destination.parent
        destination = _resolve_plugin_child(
            destination,
            plugins_root=plugins_root,
            label="component destination",
        )
        directory_component = self.is_directory_component(plan.component)
        legacy_source = (
            preserve_from if preserve_from is not None else destination
        )
        if directory_component and preserve_from is not None:
            # Directory components preserve data from their managed version
            # dir or, on the first update after installation, from the
            # bundled tree in the Tauri resource dir -- both resolved by the
            # service before reaching here. The plugins-root sibling
            # constraint only applies to plugin components; for directory
            # components, reject link-like traversal instead.
            if _is_link_like(legacy_source):
                raise ComponentUpdateError(
                    "component preserve source may not be a link",
                )
            legacy_source = legacy_source.resolve()
        else:
            legacy_source = _resolve_plugin_child(
                legacy_source,
                plugins_root=plugins_root,
                label="component preserve source",
            )
        if not directory_component and is_plugin_uninstalled(
            plan.component,
            plugins_dir=plugins_root.resolve(),
            plugin_dir=legacy_source,
        ):
            raise ComponentUpdateError("component is marked uninstalled")
        destination.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(
            prefix=f".{plan.component}.staging-",
            dir=str(destination.parent),
        ) as temp:
            staged = Path(temp) / "component"
            staged.mkdir()
            with zipfile.ZipFile(archive) as bundle:
                infos = bundle.infolist()
                max_members, max_bytes, max_member_bytes = _archive_limits(
                    plan.component,
                )
                if (
                    len(infos) > max_members
                    or sum(info.file_size for info in infos) > max_bytes
                ):
                    raise ComponentUpdateError(
                        "full artifact exceeds safety limits",
                    )
                names = {info.filename for info in infos}
                if len(names) != len(infos):
                    raise ComponentUpdateError(
                        "full artifact contains duplicate members",
                    )
                for info in infos:
                    if (
                        info.is_dir()
                        or info.filename.startswith("/")
                        or info.file_size > max_member_bytes
                    ):
                        raise ComponentUpdateError(
                            "invalid full artifact member",
                        )
                    mode = (info.external_attr >> 16) & 0o170000
                    if mode in {stat.S_IFLNK, stat.S_IFDIR}:
                        raise ComponentUpdateError(
                            "full artifact may not contain links",
                        )
                    relative = _safe_path(info.filename)
                    candidate = (staged / relative).resolve()
                    candidate.relative_to(staged.resolve())
                    candidate.parent.mkdir(parents=True, exist_ok=True)
                    with (
                        bundle.open(info) as source,
                        candidate.open(
                            "wb",
                        ) as target,
                    ):
                        shutil.copyfileobj(source, target, length=1024 * 1024)
                    _apply_expected_mode(
                        candidate,
                        expected_files.get(relative),
                        relative=relative,
                    )
            if not _content_matches(
                _inventory(staged, plan.preserve_paths),
                expected_files,
            ):
                raise ComponentUpdateError("full artifact inventory mismatch")
            plugin_path = staged / "plugin.json"
            if not directory_component:
                if not plugin_path.is_file():
                    raise ComponentUpdateError(
                        "full artifact has no plugin.json",
                    )
                try:
                    plugin = json.loads(
                        plugin_path.read_text(encoding="utf-8"),
                    )
                except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                    raise ComponentUpdateError(
                        "invalid full plugin JSON",
                    ) from exc
                if (
                    plugin.get("id") != plan.component
                    or str(plugin.get("version")) != plan.target_version
                ):
                    raise ComponentUpdateError(
                        "full plugin identity/version mismatch",
                    )
            backup = (
                self._backup_component_data(plan, preserve_from, destination)
                if preserve_from is not None
                else None
            )
            self._restore_backup_to_staging(backup, staged, plan)
            self._run_migration(plan, staged)
            if not _content_matches(
                _inventory(staged, plan.preserve_paths),
                expected_files,
            ):
                raise ComponentUpdateError(
                    "restored full component inventory mismatch",
                )
            if not directory_component:
                plugin = json.loads(plugin_path.read_text(encoding="utf-8"))
                if (
                    plugin.get("id") != plan.component
                    or str(plugin.get("version")) != plan.target_version
                ):
                    raise ComponentUpdateError(
                        "restored full plugin identity/version mismatch",
                    )
            self._atomic_activate(
                staged,
                destination,
                plan.component,
                plan.target_version,
            )
            self._prune_backups(backup)
