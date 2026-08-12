# -*- coding: utf-8 -*-
"""Opt-in signed component planning and atomic plugin activation."""

from __future__ import annotations

import base64
import hashlib
import json
import os
import platform
import shutil
import tempfile
import uuid
import zipfile
import stat
import threading
from datetime import datetime, timezone
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

from packaging.version import InvalidVersion, Version

try:
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
except ImportError:  # pragma: no cover - dependency is declared by the project
    Ed25519PublicKey = None  # type: ignore[assignment,misc]


class ComponentUpdateError(ValueError):
    """A component update failed validation or activation."""


DEFAULT_PRESERVE_PATHS = ("engines",)
ALLOWED_PRESERVE_PATHS = frozenset({"engines", "data", "state", "workspace", "models", "user-data"})
_INTERNAL_PRESERVED_NAMES = {".uninstalled", ".bundle_hash", ".bundle_revision", ".bundle_complete"}
_FORBIDDEN_PRESERVE_PATHS = {"plugin.json", *_INTERNAL_PRESERVED_NAMES}
_MAX_ARCHIVE_MEMBERS = 10_000
_MAX_ARCHIVE_BYTES = 512 * 1024 * 1024
_MAX_MEMBER_BYTES = 128 * 1024 * 1024


def _safe_component_id(value: Any) -> str:
    component = str(value or "")
    if not component or component in {".", ".."} or any(ch in component for ch in ("/", "\\", "\x00")):
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
    if path.is_absolute() or path.as_posix() in {"", "."} or ".." in path.parts or path.as_posix() != value:
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
    return path.is_symlink() or bool(attrs & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0))


def _normalize_preserve_paths(value: Any, *, default: tuple[str, ...] = DEFAULT_PRESERVE_PATHS) -> tuple[str, ...]:
    if value is None:
        return default
    if not isinstance(value, (list, tuple)) or not value:
        raise ComponentUpdateError("component preserve must be a non-empty array")
    result: list[str] = []
    for item in value:
        if not isinstance(item, str):
            raise ComponentUpdateError("component preserve paths must be strings")
        relative = _safe_path(item.rstrip("/"))
        if relative != relative.lower() or relative not in ALLOWED_PRESERVE_PATHS:
            raise ComponentUpdateError(f"component preserve path is not an allowed data root: {relative}")
        if relative in _FORBIDDEN_PRESERVE_PATHS:
            raise ComponentUpdateError(f"component preserve path is reserved: {relative}")
        if any(relative == existing or relative.startswith(f"{existing}/") or existing.startswith(f"{relative}/") for existing in result):
            raise ComponentUpdateError(f"component preserve paths overlap: {relative}")
        if relative not in result:
            result.append(relative)
    return tuple(result)


def _is_preserved(relative: str, preserve_paths: tuple[str, ...]) -> bool:
    return relative in _INTERNAL_PRESERVED_NAMES or any(
        relative == prefix or relative.startswith(f"{prefix}/") for prefix in preserve_paths
    )


def _inventory(root: Path, preserve_paths: tuple[str, ...] = DEFAULT_PRESERVE_PATHS) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for path in root.rglob("*"):
        if path.is_symlink():
            raise ComponentUpdateError(f"symlink in component tree: {path}")
        if not path.is_file():
            continue
        relative = _safe_path(path.relative_to(root).as_posix())
        if _is_preserved(relative, preserve_paths):
            continue
        result[relative] = {"size": path.stat().st_size, "sha256": _sha256(path)}
    return dict(sorted(result.items()))


def _content_matches(actual: dict[str, dict[str, Any]], expected: dict[str, dict[str, Any]]) -> bool:
    if set(actual) != set(expected):
        return False
    return all(
        actual[path].get("size") == metadata.get("size")
        and actual[path].get("sha256") == str(metadata.get("sha256", "")).lower()
        for path, metadata in expected.items()
    )


def _verify_signature(data: bytes, signature_b64: str, public_key_b64: str) -> None:
    if Ed25519PublicKey is None:
        raise ComponentUpdateError("cryptography is required for component signatures")
    try:
        key = Ed25519PublicKey.from_public_bytes(base64.b64decode(public_key_b64, validate=True))
        signature = base64.b64decode(signature_b64, validate=True)
        key.verify(signature, data)
    except Exception as exc:  # noqa: BLE001
        raise ComponentUpdateError("component signature verification failed") from exc


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


@dataclass(frozen=True)
class _BackupSnapshot:
    path: Path
    metadata: dict[str, Any]


class ComponentUpdater:
    """Plan and apply managed plugin updates; never auto-runs at startup."""

    def __init__(self, *, public_key_b64: str, managed_components: set[str], target: str | None = None, core_version: str, active_path: Path | None = None, backup_root: Path | None = None):
        self.public_key_b64 = public_key_b64
        self.managed_components = frozenset(_safe_component_id(item) for item in managed_components)
        self.target = target or detect_target()
        self.core_version = core_version
        if active_path is not None and active_path.is_symlink():
            raise ComponentUpdateError("active path may not be a symlink")
        self.active_path = active_path.absolute() if active_path is not None else None
        if backup_root is not None and backup_root.exists() and _is_link_like(backup_root):
            raise ComponentUpdateError("backup root may not be a symlink")
        self.backup_root = backup_root.absolute() if backup_root is not None else None
        self._lock = threading.RLock()

    def _backup_component_data(self, plan: ComponentUpdatePlan, source: Path, destination: Path) -> _BackupSnapshot | None:
        """Persist and verify preserved data before any component activation."""
        if not source.is_dir():
            return None
        if _is_link_like(source):
            raise ComponentUpdateError("backup source may not be a symlink")
        root = self.backup_root or destination.parent / ".qwenpaw-component-backups"
        if root.exists() and _is_link_like(root):
            raise ComponentUpdateError("backup root may not be a symlink")
        root.mkdir(parents=True, exist_ok=True)
        component_root = root / plan.component
        if component_root.exists() and _is_link_like(component_root):
            raise ComponentUpdateError("component backup directory may not be a symlink")
        component_root.mkdir(parents=True, exist_ok=True)
        backup_id = f"{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')}-{uuid.uuid4().hex}"
        staging = component_root / f".{backup_id}.staging"
        committed = component_root / backup_id
        staging.mkdir()
        data_root = staging / "data"
        files: dict[str, dict[str, Any]] = {}
        try:
            for relative in plan.preserve_paths:
                candidate = source / relative
                if _is_link_like(candidate):
                    raise ComponentUpdateError(f"preserved data may not be a link: {relative}")
                if not candidate.exists():
                    continue
                target = data_root / relative
                if candidate.is_dir():
                    for item in candidate.rglob("*"):
                        if _is_link_like(item) or item.is_file() and item.stat().st_nlink > 1:
                            raise ComponentUpdateError(f"preserved data may not contain links: {item}")
                    shutil.copytree(candidate, target, copy_function=shutil.copy2)
                elif candidate.is_file():
                    if candidate.stat().st_nlink > 1:
                        raise ComponentUpdateError(f"preserved data may not be a hard link: {relative}")
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(candidate, target)
                else:
                    raise ComponentUpdateError(f"unsupported preserved data entry: {relative}")
            if data_root.exists():
                for item in sorted(path for path in data_root.rglob("*") if path.is_file()):
                    relative = _safe_path(item.relative_to(data_root).as_posix())
                    files[relative] = {"size": item.stat().st_size, "sha256": _sha256(item)}
            metadata = {
                "schema_version": 1,
                "component": plan.component,
                "source_version": plan.from_version,
                "target_version": plan.target_version,
                "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "preserve": list(plan.preserve_paths),
                "files": files,
            }
            (staging / "backup.json").write_text(
                json.dumps(metadata, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8",
            )
            for relative, expected in files.items():
                item = data_root / relative
                if item.stat().st_size != expected["size"] or _sha256(item) != expected["sha256"]:
                    raise ComponentUpdateError(f"preserved data backup verification failed: {relative}")
            os.replace(staging, committed)
            return _BackupSnapshot(committed, metadata)
        except Exception as exc:
            shutil.rmtree(staging, ignore_errors=True)
            if isinstance(exc, ComponentUpdateError):
                raise
            raise ComponentUpdateError("failed to back up preserved component data") from exc

    @staticmethod
    def _prune_backups(backup: _BackupSnapshot | None, keep: int = 3) -> None:
        if backup is None:
            return
        try:
            committed = sorted(
                (item for item in backup.path.parent.iterdir() if item.is_dir() and not item.name.startswith(".")),
                key=lambda item: item.name,
                reverse=True,
            )
            for expired in committed[keep:]:
                if not _is_link_like(expired):
                    shutil.rmtree(expired)
        except OSError:
            pass

    @staticmethod
    def _restore_backup_to_staging(backup: _BackupSnapshot | None, staged: Path, plan: ComponentUpdatePlan) -> None:
        if backup is None:
            return
        try:
            metadata_path = backup.path / "backup.json"
            data_root = backup.path / "data"
            if _is_link_like(backup.path) or _is_link_like(metadata_path) or data_root.exists() and _is_link_like(data_root):
                raise ComponentUpdateError("backup contains an unsafe link")
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            if metadata != backup.metadata:
                raise ComponentUpdateError("backup metadata changed after creation")
            if metadata.get("schema_version") != 1 or metadata.get("component") != plan.component:
                raise ValueError("invalid backup metadata")
            if metadata.get("source_version") != plan.from_version or metadata.get("target_version") != plan.target_version:
                raise ValueError("incomplete backup metadata")
            if _normalize_preserve_paths(metadata.get("preserve"), default=()) != plan.preserve_paths:
                raise ValueError("backup preserve paths do not match update plan")
            files = metadata["files"]
            if not isinstance(files, dict):
                raise ValueError("invalid files inventory")
            resolved_data_root = data_root.resolve()
            actual_files = {
                _safe_path(item.relative_to(data_root).as_posix())
                for item in data_root.rglob("*") if item.is_file()
            } if data_root.exists() else set()
            if actual_files != set(files):
                raise ComponentUpdateError("backup data inventory changed after creation")
            for relative, expected in files.items():
                if not isinstance(expected, dict) or type(expected.get("size")) is not int or not isinstance(expected.get("sha256"), str):
                    raise ValueError("invalid backup file metadata")
                relative = _safe_path(relative)
                if not _is_preserved(relative, plan.preserve_paths):
                    raise ValueError("backup inventory contains a non-preserved path")
                source = data_root / relative
                if _is_link_like(source) or not source.is_file() or resolved_data_root not in source.resolve().parents:
                    raise ComponentUpdateError(f"backup file is missing or unsafe: {relative}")
                if source.stat().st_size != expected.get("size") or _sha256(source) != expected.get("sha256"):
                    raise ComponentUpdateError(f"backup data verification failed: {relative}")
            for relative in files:
                source = data_root / relative
                target = staged / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                if target.exists() and target.is_dir():
                    shutil.rmtree(target)
                shutil.copy2(source, target)
            for relative, expected in files.items():
                restored = staged / relative
                if restored.stat().st_size != expected["size"] or _sha256(restored) != expected["sha256"]:
                    raise ComponentUpdateError(f"restored data verification failed: {relative}")
        except ComponentUpdateError:
            raise
        except Exception as exc:
            raise ComponentUpdateError("failed to restore preserved component data") from exc

    def _commit_active(self, component: str, version: str, destination: Path) -> None:
        if self.active_path is None:
            return
        self.active_path.parent.mkdir(parents=True, exist_ok=True)
        payload: dict[str, Any] = {"schema_version": 1, "target": self.target, "components": {}}
        if self.active_path.is_file():
            try:
                existing = json.loads(self.active_path.read_text(encoding="utf-8"))
                if isinstance(existing, dict) and isinstance(existing.get("components"), dict):
                    payload["components"].update(existing["components"])
            except (OSError, json.JSONDecodeError, TypeError):
                pass
        payload["components"][component] = {"version": version, "path": str(destination)}
        temporary = self.active_path.with_name(f".{self.active_path.name}.{uuid.uuid4().hex}.staging")
        temporary.write_text(json.dumps(payload, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")
        os.replace(temporary, self.active_path)

    def recover_interrupted_activation(self, component: str, destination: Path, expected_files: dict[str, dict[str, Any]] | None = None, preserve_paths: tuple[str, ...] = DEFAULT_PRESERVE_PATHS) -> None:
        """Resolve a crash window before reading the installed component."""
        component = _safe_component_id(component)
        previous = destination.parent / f".{destination.name}.previous"
        if not previous.exists():
            return
        if _is_link_like(previous) or destination.exists() and _is_link_like(destination):
            raise ComponentUpdateError("interrupted component activation contains an unsafe link")
        if not destination.exists():
            if expected_files is None or not _content_matches(_inventory(previous, preserve_paths), expected_files):
                raise ComponentUpdateError("cannot verify interrupted previous component")
            plugin = json.loads((previous / "plugin.json").read_text(encoding="utf-8"))
            if plugin.get("id") != component:
                raise ComponentUpdateError("interrupted previous component identity mismatch")
            previous.replace(destination)
            return
        active_version: str | None = None
        if self.active_path is not None and self.active_path.is_file():
            try:
                payload = json.loads(self.active_path.read_text(encoding="utf-8"))
                active_version = str(payload["components"][component]["version"])
            except (OSError, KeyError, TypeError, ValueError, json.JSONDecodeError):
                active_version = None
        installed_version: str | None = None
        try:
            installed_version = str(json.loads((destination / "plugin.json").read_text(encoding="utf-8"))["version"])
        except (OSError, KeyError, TypeError, ValueError, json.JSONDecodeError):
            pass
        if active_version is not None and active_version == installed_version and expected_files is not None and _content_matches(_inventory(destination, preserve_paths), expected_files):
            shutil.rmtree(previous)
            return
        raise ComponentUpdateError("interrupted component activation requires verified recovery")

    def _atomic_activate(self, staged: Path, destination: Path, component: str, version: str) -> None:
        destination.parent.mkdir(parents=True, exist_ok=True)
        previous = destination.parent / f".{destination.name}.previous"
        failed = destination.parent / f".{destination.name}.failed-{uuid.uuid4().hex}"
        if previous.exists():
            raise ComponentUpdateError(f"stale previous backup exists: {previous}")
        if destination.exists():
            destination.replace(previous)
        try:
            staged.replace(destination)
        except Exception:
            if previous.exists() and not destination.exists():
                previous.replace(destination)
            raise
        try:
            self._commit_active(component, version, destination)
        except Exception:
            if destination.exists():
                destination.replace(failed)
            if previous.exists() and not destination.exists():
                previous.replace(destination)
            shutil.rmtree(failed, ignore_errors=True)
            raise
        # Cleanup is deliberately non-fatal: a locked backup must not turn a
        # successful activation into a reported failure.
        shutil.rmtree(previous, ignore_errors=True)

    def load_manifest(self, path: Path, signature_path: Path) -> dict[str, Any]:
        raw = path.read_bytes()
        _verify_signature(raw, signature_path.read_text(encoding="utf-8").strip(), self.public_key_b64)
        try:
            manifest = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ComponentUpdateError("invalid component manifest JSON") from exc
        if not isinstance(manifest, dict):
            raise ComponentUpdateError("component manifest must be an object")
        if manifest.get("schema_version") != 1 or manifest.get("target") != self.target:
            raise ComponentUpdateError("component manifest schema or target mismatch")
        if _version(self.core_version, "core_version") < _version(manifest["core_min_version"], "core_min_version"):
            raise ComponentUpdateError("core version is below component minimum")
        components = manifest.get("components")
        if not isinstance(components, dict):
            raise ComponentUpdateError("component manifest components must be an object")
        for component, entry in components.items():
            _safe_component_id(component)
            if not isinstance(entry, dict):
                raise ComponentUpdateError(f"invalid manifest entry for {component}")
            _version(entry.get("version"), f"component {component} version")
            if entry.get("kind", "directory") != "directory":
                raise ComponentUpdateError(f"unsupported component kind for {component}")
            if entry.get("min_core_version") is not None and _version(self.core_version, "core_version") < _version(entry["min_core_version"], f"component {component} minimum"):
                raise ComponentUpdateError(f"core version is below {component} minimum")
            entry["preserve"] = list(_normalize_preserve_paths(entry.get("preserve")))
            full = entry.get("full")
            if not isinstance(full, dict):
                raise ComponentUpdateError(f"missing full artifact for {component}")
            artifacts = [full, *(entry.get("deltas") or [])]
            for artifact in artifacts:
                if (
                    not isinstance(artifact, dict) or not str(artifact.get("url", ""))
                    or type(artifact.get("size")) is not int or artifact["size"] < 0
                    or len(str(artifact.get("sha256", ""))) != 64 or not artifact.get("signature")
                ):
                    raise ComponentUpdateError(f"invalid artifact metadata for {component}")
        return manifest

    def plan(self, manifest: dict[str, Any], component: str, installed: Path | None) -> ComponentUpdatePlan | None:
        component = _safe_component_id(component)
        if component not in self.managed_components:
            raise ComponentUpdateError(f"component is not managed: {component}")
        entry = (manifest.get("components") or {}).get(component)
        if not isinstance(entry, dict):
            return None
        if installed is not None and (installed / ".uninstalled").exists():
            return None
        target_version = str(entry.get("version", ""))
        if not target_version:
            raise ComponentUpdateError("component target version is missing")
        current_version: str | None = None
        preserve_paths = _normalize_preserve_paths(entry.get("preserve"))
        if installed is not None and (installed / "plugin.json").is_file():
            data = json.loads((installed / "plugin.json").read_text(encoding="utf-8"))
            current_version = str(data.get("version", "0.0.0"))
            if _version(current_version, "installed version") >= _version(target_version, "target version"):
                return None
        for delta in entry.get("deltas", []):
            if delta.get("from") == current_version:
                return ComponentUpdatePlan(component, current_version, target_version, "delta", str(delta["url"]), str(delta["sha256"]), str(delta.get("signature", "")), preserve_paths)
        full = entry.get("full")
        if not isinstance(full, dict):
            raise ComponentUpdateError("no compatible full artifact")
        return ComponentUpdatePlan(component, current_version, target_version, "full", str(full["url"]), str(full["sha256"]), str(full.get("signature", "")), preserve_paths)

    def apply_delta(self, plan: ComponentUpdatePlan, base: Path, archive: Path, destination: Path) -> None:
        if plan.artifact_kind != "delta" or plan.component not in self.managed_components:
            raise ComponentUpdateError("invalid component update plan")
        if (base / ".uninstalled").exists():
            raise ComponentUpdateError("component is marked uninstalled")
        if base.is_symlink() or destination.is_symlink():
            raise ComponentUpdateError("component roots may not be symlinks")
        base = base.resolve()
        destination = destination.resolve()
        if destination.exists() and (destination / ".uninstalled").exists():
            raise ComponentUpdateError("component is marked uninstalled")
        destination.parent.mkdir(parents=True, exist_ok=True)
        # Replacing the installed directory is the normal runtime path.  The
        # base is copied into a same-parent staging directory before the
        # destination is renamed, so equality is safe; only a destination
        # nested inside the base could invalidate the copy/activation boundary.
        if base in destination.parents:
            raise ComponentUpdateError("destination must not be nested inside base")
        if _sha256(archive) != plan.artifact_sha256:
            raise ComponentUpdateError("delta artifact sha256 mismatch")
        if not plan.artifact_signature:
            raise ComponentUpdateError("delta artifact signature is required")
        _verify_signature(archive.read_bytes(), plan.artifact_signature, self.public_key_b64)
        with tempfile.TemporaryDirectory(prefix=f".{plan.component}.staging-", dir=str(destination.parent)) as temp:
            staged = Path(temp) / "component"
            shutil.copytree(base, staged)
            with zipfile.ZipFile(archive) as bundle:
                infos = bundle.infolist()
                if len(infos) > _MAX_ARCHIVE_MEMBERS or sum(info.file_size for info in infos) > _MAX_ARCHIVE_BYTES:
                    raise ComponentUpdateError("delta artifact exceeds safety limits")
                names = [info.filename for info in infos]
                if len(set(names)) != len(names):
                    raise ComponentUpdateError("delta artifact contains duplicate members")
                if any(info.is_dir() for info in infos):
                    raise ComponentUpdateError("delta artifact contains directory members")
                if any(info.file_size > _MAX_MEMBER_BYTES for info in infos):
                    raise ComponentUpdateError("delta artifact member exceeds safety limit")
                delta = json.loads(bundle.read("delta.json"))
                if not isinstance(delta, dict):
                    raise ComponentUpdateError("delta.json must contain an object")
                if delta.get("component") != plan.component or delta.get("base_version") != plan.from_version or delta.get("target_version") != plan.target_version:
                    raise ComponentUpdateError("delta metadata does not match plan")
                if not _content_matches(_inventory(base, plan.preserve_paths), delta.get("base_files", {})):
                    raise ComponentUpdateError("delta base inventory does not match base")
                deletes = delta.get("delete", [])
                adds = delta.get("add", [])
                replaces = delta.get("replace", [])
                if any(not isinstance(items, list) or len(items) != len(set(items)) for items in (deletes, adds, replaces)):
                    raise ComponentUpdateError("delta operation lists must be unique arrays")
                payload_names = {info.filename for info in infos}
                expected_payloads = {f"files/{relative}" for relative in [*adds, *replaces]}
                if payload_names != {"delta.json", *expected_payloads}:
                    raise ComponentUpdateError("delta payload members do not match operations")
                for relative in deletes:
                    relative = _safe_path(relative)
                    if _is_preserved(relative, plan.preserve_paths):
                        raise ComponentUpdateError(f"delta may not modify preserved data: {relative}")
                    candidate = (staged / relative).resolve()
                    candidate.relative_to(staged.resolve())
                    if candidate.exists() and not candidate.is_file():
                        raise ComponentUpdateError(f"delete target is not a file: {relative}")
                    candidate.unlink(missing_ok=True)
                for relative in [*adds, *replaces]:
                    relative = _safe_path(relative)
                    if _is_preserved(relative, plan.preserve_paths):
                        raise ComponentUpdateError(f"delta may not modify preserved data: {relative}")
                    candidate = (staged / relative).resolve()
                    candidate.relative_to(staged.resolve())
                    candidate.parent.mkdir(parents=True, exist_ok=True)
                    with bundle.open(f"files/{relative}") as source, candidate.open("wb") as target:
                        shutil.copyfileobj(source, target, length=1024 * 1024)
            expected = delta.get("final_files", {})
            actual = _inventory(staged, plan.preserve_paths)
            if not _content_matches(actual, expected):
                raise ComponentUpdateError("final file verification failed")
            if not (staged / "plugin.json").is_file():
                raise ComponentUpdateError("updated component has no plugin.json")
            plugin = json.loads((staged / "plugin.json").read_text(encoding="utf-8"))
            if plugin.get("id") != plan.component or str(plugin.get("version")) != plan.target_version:
                raise ComponentUpdateError("updated plugin identity/version mismatch")
            backup = self._backup_component_data(plan, base, destination)
            self._restore_backup_to_staging(backup, staged, plan)
            if not _content_matches(_inventory(staged, plan.preserve_paths), expected):
                raise ComponentUpdateError("restored delta component inventory mismatch")
            plugin = json.loads((staged / "plugin.json").read_text(encoding="utf-8"))
            if plugin.get("id") != plan.component or str(plugin.get("version")) != plan.target_version:
                raise ComponentUpdateError("restored delta plugin identity/version mismatch")
            self._atomic_activate(staged, destination, plan.component, plan.target_version)
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
        if plan.artifact_kind != "full" or plan.component not in self.managed_components:
            raise ComponentUpdateError("invalid full component update plan")
        if not plan.artifact_signature:
            raise ComponentUpdateError("full artifact signature is required")
        if _sha256(archive) != plan.artifact_sha256:
            raise ComponentUpdateError("full artifact sha256 mismatch")
        _verify_signature(archive.read_bytes(), plan.artifact_signature, self.public_key_b64)
        if destination.is_symlink():
            raise ComponentUpdateError("destination may not be a symlink")
        destination = destination.resolve()
        if destination.exists() and (destination / ".uninstalled").exists():
            raise ComponentUpdateError("component is marked uninstalled")
        destination.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix=f".{plan.component}.staging-", dir=str(destination.parent)) as temp:
            staged = Path(temp) / "component"
            staged.mkdir()
            with zipfile.ZipFile(archive) as bundle:
                infos = bundle.infolist()
                if len(infos) > _MAX_ARCHIVE_MEMBERS or sum(info.file_size for info in infos) > _MAX_ARCHIVE_BYTES:
                    raise ComponentUpdateError("full artifact exceeds safety limits")
                names = {info.filename for info in infos}
                if len(names) != len(infos):
                    raise ComponentUpdateError("full artifact contains duplicate members")
                for info in infos:
                    if info.is_dir() or info.filename.startswith("/") or info.file_size > _MAX_MEMBER_BYTES:
                        raise ComponentUpdateError("invalid full artifact member")
                    mode = (info.external_attr >> 16) & 0o170000
                    if mode in {stat.S_IFLNK, stat.S_IFDIR}:
                        raise ComponentUpdateError("full artifact may not contain links")
                    relative = _safe_path(info.filename)
                    candidate = (staged / relative).resolve()
                    candidate.relative_to(staged.resolve())
                    candidate.parent.mkdir(parents=True, exist_ok=True)
                    with bundle.open(info) as source, candidate.open("wb") as target:
                        shutil.copyfileobj(source, target, length=1024 * 1024)
            if not _content_matches(_inventory(staged, plan.preserve_paths), expected_files):
                raise ComponentUpdateError("full artifact inventory mismatch")
            plugin_path = staged / "plugin.json"
            if not plugin_path.is_file():
                raise ComponentUpdateError("full artifact has no plugin.json")
            plugin = json.loads(plugin_path.read_text(encoding="utf-8"))
            if plugin.get("id") != plan.component or str(plugin.get("version")) != plan.target_version:
                raise ComponentUpdateError("full plugin identity/version mismatch")
            backup = self._backup_component_data(plan, preserve_from, destination) if preserve_from is not None else None
            self._restore_backup_to_staging(backup, staged, plan)
            if not _content_matches(_inventory(staged, plan.preserve_paths), expected_files):
                raise ComponentUpdateError("restored full component inventory mismatch")
            plugin = json.loads(plugin_path.read_text(encoding="utf-8"))
            if plugin.get("id") != plan.component or str(plugin.get("version")) != plan.target_version:
                raise ComponentUpdateError("restored full plugin identity/version mismatch")
            self._atomic_activate(staged, destination, plan.component, plan.target_version)
            self._prune_backups(backup)
