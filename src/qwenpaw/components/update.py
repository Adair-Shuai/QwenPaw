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


_PRESERVED_PREFIXES = ("engines/",)
_PRESERVED_NAMES = {"engines", ".uninstalled", ".bundle_hash", ".bundle_revision", ".bundle_complete"}
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
    if path.is_absolute() or ".." in path.parts or path.as_posix() != value:
        raise ComponentUpdateError(f"unsafe component path: {value!r}")
    return value


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _inventory(root: Path) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for path in root.rglob("*"):
        if path.is_symlink():
            raise ComponentUpdateError(f"symlink in component tree: {path}")
        if not path.is_file():
            continue
        relative = _safe_path(path.relative_to(root).as_posix())
        if relative in _PRESERVED_NAMES or relative.startswith(_PRESERVED_PREFIXES):
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


class ComponentUpdater:
    """Plan and apply managed plugin updates; never auto-runs at startup."""

    def __init__(self, *, public_key_b64: str, managed_components: set[str], target: str | None = None, core_version: str, active_path: Path | None = None):
        self.public_key_b64 = public_key_b64
        self.managed_components = frozenset(_safe_component_id(item) for item in managed_components)
        self.target = target or detect_target()
        self.core_version = core_version
        self.active_path = active_path.resolve() if active_path is not None else None
        self._lock = threading.RLock()

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
        if installed is not None and (installed / "plugin.json").is_file():
            data = json.loads((installed / "plugin.json").read_text(encoding="utf-8"))
            current_version = str(data.get("version", "0.0.0"))
            if _version(current_version, "installed version") >= _version(target_version, "target version"):
                return None
        for delta in entry.get("deltas", []):
            if delta.get("from") == current_version:
                return ComponentUpdatePlan(component, current_version, target_version, "delta", str(delta["url"]), str(delta["sha256"]), str(delta.get("signature", "")))
        full = entry.get("full")
        if not isinstance(full, dict):
            raise ComponentUpdateError("no compatible full artifact")
        return ComponentUpdatePlan(component, current_version, target_version, "full", str(full["url"]), str(full["sha256"]), str(full.get("signature", "")))

    def apply_delta(self, plan: ComponentUpdatePlan, base: Path, archive: Path, destination: Path) -> None:
        if plan.artifact_kind != "delta" or plan.component not in self.managed_components:
            raise ComponentUpdateError("invalid component update plan")
        if (base / ".uninstalled").exists():
            raise ComponentUpdateError("component is marked uninstalled")
        base = base.resolve()
        destination = destination.resolve()
        if destination.exists() and (destination / ".uninstalled").exists():
            raise ComponentUpdateError("component is marked uninstalled")
        if base.is_symlink() or destination.is_symlink():
            raise ComponentUpdateError("component roots may not be symlinks")
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
                if not _content_matches(_inventory(base), delta.get("base_files", {})):
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
                    if relative in _PRESERVED_NAMES or relative.startswith(_PRESERVED_PREFIXES):
                        continue
                    candidate = (staged / relative).resolve()
                    candidate.relative_to(staged.resolve())
                    if candidate.exists() and not candidate.is_file():
                        raise ComponentUpdateError(f"delete target is not a file: {relative}")
                    candidate.unlink(missing_ok=True)
                for relative in [*adds, *replaces]:
                    relative = _safe_path(relative)
                    candidate = (staged / relative).resolve()
                    candidate.relative_to(staged.resolve())
                    candidate.parent.mkdir(parents=True, exist_ok=True)
                    with bundle.open(f"files/{relative}") as source, candidate.open("wb") as target:
                        shutil.copyfileobj(source, target, length=1024 * 1024)
            expected = delta.get("final_files", {})
            actual = _inventory(staged)
            if not _content_matches(actual, expected):
                raise ComponentUpdateError("final file verification failed")
            if not (staged / "plugin.json").is_file():
                raise ComponentUpdateError("updated component has no plugin.json")
            plugin = json.loads((staged / "plugin.json").read_text(encoding="utf-8"))
            if plugin.get("id") != plan.component or str(plugin.get("version")) != plan.target_version:
                raise ComponentUpdateError("updated plugin identity/version mismatch")
            self._atomic_activate(staged, destination, plan.component, plan.target_version)

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
        destination = destination.resolve()
        if destination.exists() and (destination / ".uninstalled").exists():
            raise ComponentUpdateError("component is marked uninstalled")
        if destination.exists() and destination.is_symlink():
            raise ComponentUpdateError("destination may not be a symlink")
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
            if not _content_matches(_inventory(staged), expected_files):
                raise ComponentUpdateError("full artifact inventory mismatch")
            if preserve_from is not None and (preserve_from / "engines").is_dir():
                for item in (preserve_from / "engines").rglob("*"):
                    if item.is_symlink() or item.is_file() and item.stat().st_size > _MAX_MEMBER_BYTES:
                        raise ComponentUpdateError("invalid or oversized preserved engine data")
                shutil.copytree(preserve_from / "engines", staged / "engines", dirs_exist_ok=True)
            plugin_path = staged / "plugin.json"
            if not plugin_path.is_file():
                raise ComponentUpdateError("full artifact has no plugin.json")
            plugin = json.loads(plugin_path.read_text(encoding="utf-8"))
            if plugin.get("id") != plan.component or str(plugin.get("version")) != plan.target_version:
                raise ComponentUpdateError("full plugin identity/version mismatch")
            self._atomic_activate(staged, destination, plan.component, plan.target_version)
