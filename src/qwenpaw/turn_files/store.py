# -*- coding: utf-8 -*-
"""Persistent per-turn manifests with immutable, content-addressed file bytes.

The service never changes project files or their Git index. Its synchronous
calls run through ``run_sync_io`` at the runtime boundary.
"""

from __future__ import annotations

import copy
import difflib
import hashlib
import io
import json
import os
import re
import threading
import tempfile
import uuid
import zipfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any

from ..utils.io_utils import write_json_atomic
from . import scanner
from .scanner import FileState, Root, Snapshot, normalize_roots, safe_path

_ID = re.compile(r"^[a-f0-9]{32}$")
_HASH = re.compile(r"^[a-f0-9]{64}$")
_REGISTRY_LOCK = threading.RLock()
_STORES: dict[str, "TurnFileStore"] = {}
_ACTIVE: dict[str, "Capture"] = {}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")


def _write_blob_atomic(path: Path, data: bytes) -> None:
    descriptor, name = tempfile.mkstemp(prefix=".blob-", dir=path.parent)
    temporary = Path(name)
    try:
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        safe_path(path)
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def _public(value: dict) -> dict:
    result = {
        key: copy.deepcopy(item)
        for key, item in value.items()
        if not key.startswith("_")
    }
    result["files"] = [
        {key: item for key, item in entry.items() if not key.startswith("_")}
        for entry in result.get("files", [])
    ]
    return result


def _overlapping(left: tuple[Root, ...], right: tuple[Root, ...]) -> bool:
    return any(
        first.directory.is_relative_to(second.directory)
        or second.directory.is_relative_to(first.directory)
        for first in left
        for second in right
    )


@dataclass
class Capture:
    id: str
    roots: tuple[Root, ...]
    manifest: dict[str, Any]
    before: Snapshot = field(default_factory=Snapshot)
    deliveries: dict[tuple[str, str, str], FileState] = field(
        default_factory=dict,
    )
    delivery_bytes: int = 0
    overlap: bool = False
    finished: bool = False
    owner: "TurnFileStore | None" = field(default=None, repr=False)


class TurnFileStore:
    """One agent's durable manifest store; project roots may be shared."""

    def __init__(self, workspace_dir: str | Path):
        self.workspace_dir = Path(os.path.abspath(workspace_dir))
        self.directory = self.workspace_dir / ".turn-files"
        self._lock = threading.RLock()
        for directory in (
            self.directory,
            self.directory / "turns",
            self.directory / "blobs",
        ):
            safe_path(directory)
            directory.mkdir(parents=True, exist_ok=True)

    def _manifest_path(self, turn_id: str) -> Path:
        if not _ID.fullmatch(turn_id):
            raise FileNotFoundError("Turn files not found")
        return safe_path(self.directory / "turns" / f"{turn_id}.json")

    def _write(self, manifest: dict) -> None:
        write_json_atomic(
            self._manifest_path(manifest["id"]),
            manifest,
            indent=2,
        )

    def start(
        self,
        *,
        session_id: str,
        user_id: str,
        channel: str,
        agent_id: str,
        client_message_id: str,
        response_id: str,
        roots: list[tuple[str, Path]],
    ) -> Capture:
        if not session_id:
            raise ValueError("A session identity is required")
        turn_id = uuid.uuid4().hex
        manifest = {
            "id": turn_id,
            "response_id": response_id,
            "client_message_id": client_message_id,
            "session_id": session_id,
            "agent_id": agent_id,
            "status": "running",
            "started_at": _now(),
            "finished_at": None,
            "incomplete": False,
            "warnings": [],
            "overlap": False,
            "files": [],
            "_user_id": user_id,
            "_channel": channel,
        }
        capture = Capture(
            turn_id,
            normalize_roots(roots),
            manifest,
            owner=self,
        )
        with _REGISTRY_LOCK:
            for other in _ACTIVE.values():
                if _overlapping(capture.roots, other.roots):
                    capture.overlap = other.overlap = True
            _ACTIVE[capture.id] = capture
        try:
            capture.before = scanner.scan(capture.roots)
            manifest["incomplete"] = capture.before.incomplete
            manifest["warnings"] = list(capture.before.warnings)
            manifest["overlap"] = capture.overlap
            with self._lock:
                self._write(manifest)
            return capture
        except BaseException:
            with _REGISTRY_LOCK:
                _ACTIVE.pop(capture.id, None)
            raise

    def record_delivery(self, capture: Capture, path: str | Path) -> bool:
        """Freeze explicitly delivered bytes before later overwrites."""
        if capture.owner is not self:
            raise ValueError("Capture belongs to another store")
        candidate = Path(path).expanduser()
        if not candidate.is_absolute():
            if not capture.roots:
                return False
            candidate = capture.roots[0].directory / candidate
        candidate = Path(os.path.abspath(candidate))
        root = next(
            (
                item
                for item in capture.roots
                if candidate.is_relative_to(item.directory)
            ),
            None,
        )
        if root is None:
            # The delivery tool has separately authorized this concrete file.
            # Capture that file only: never expand observation to its siblings.
            root = Root(f"project:{candidate.parent}", candidate.parent)
        relative = candidate.relative_to(root.directory).as_posix()
        key = root.key(relative)
        if scanner.excluded(
            tuple(key[1].split("/")),
            workspace=root.label == "workspace",
        ):
            capture.before.warn(
                "Delivered file was excluded by snapshot policy",
            )
            return False
        with self._lock:
            if capture.finished:
                return False
            snapshot = Snapshot(bytes_read=capture.delivery_bytes)
            if len(capture.deliveries) >= scanner.MAX_FILES:
                capture.before.warn("Delivery count limit reached")
                return False
            try:
                state = scanner.read_file(candidate, snapshot, key[1])
            except OSError:
                capture.before.warn(
                    f"Unable to snapshot delivered file: {key[1]}",
                )
                return False
            capture.delivery_bytes = snapshot.bytes_read
            for warning in snapshot.warnings:
                capture.before.warn(warning)
            capture.deliveries[(*key, state.fingerprint)] = state
            # A successful send must survive a process exit before the turn
            # ends. The same content identity is retained by finish().
            identifier = hashlib.sha256(
                json.dumps(
                    (*key, state.fingerprint),
                    ensure_ascii=False,
                ).encode(),
            ).hexdigest()[:32]
            warnings = list(capture.before.warnings)
            digest = self._blob(state, [0, set()], warnings)
            row = {
                "id": identifier,
                "root": key[0],
                "path": key[1],
                "name": PurePosixPath(key[1]).name,
                "status": "delivered",
                "size": state.size,
                "before_size": 0,
                "binary": state.binary,
                "before_available": False,
                "after_available": digest is not None,
                "delivered": True,
                "delivery_version": True,
                "_before_blob": None,
                "_after_blob": digest,
                "_before_exists": False,
                "_after_exists": True,
            }
            capture.manifest["files"] = [
                item
                for item in capture.manifest["files"]
                if item["id"] != identifier
            ] + [row]
            capture.manifest.update(
                warnings=warnings,
                incomplete=capture.before.incomplete,
                overlap=capture.overlap,
            )
            self._write(capture.manifest)
            return state.content is not None

    @staticmethod
    def _unknown(snapshot: Snapshot, key: tuple[str, str]) -> bool:
        return any(
            key[0] == label
            and (
                not prefix
                or key[1] == prefix
                or key[1].startswith(prefix.rstrip("/") + "/")
            )
            for label, prefix in snapshot.unreadable
        )

    def _blob(
        self,
        state: FileState | None,
        budget: list,
        warnings: list[str],
    ) -> str | None:
        if state is None or state.content is None:
            return None
        digest = hashlib.sha256(state.content).hexdigest()
        path = safe_path(self.directory / "blobs" / digest)
        if digest in budget[1]:
            return digest
        if budget[0] + len(state.content) > scanner.MAX_TOTAL_BYTES:
            message = (
                "Turn archive byte budget reached; some versions unavailable"
            )
            if message not in warnings:
                warnings.append(message)
            return None
        budget[0] += len(state.content)
        budget[1].add(digest)
        if not path.exists():
            _write_blob_atomic(path, state.content)
        return digest

    def finish(self, capture: Capture, status: str = "completed") -> dict:
        if capture.owner is not self:
            raise ValueError("Capture belongs to another store")
        if status not in {
            "completed",
            "failed",
            "canceled",
            "cancelled",
            "interrupted",
        }:
            raise ValueError("Unsupported terminal status")
        with self._lock:
            try:
                return self._finish(capture, status)
            except BaseException:
                # Preserve the last durable manifest (and any already sent
                # file versions). A running manifest without an active owner
                # is reported as interrupted on the next read.
                capture.manifest.update(
                    status="interrupted",
                    incomplete=True,
                    warnings=[
                        *capture.manifest.get("warnings", []),
                        "Final file snapshot could not be persisted",
                    ],
                )
                raise
            finally:
                capture.finished = True
                capture.before.files.clear()
                capture.deliveries.clear()
                with _REGISTRY_LOCK:
                    _ACTIVE.pop(capture.id, None)

    def _finish(self, capture: Capture, status: str) -> dict:
        with self._lock:
            if capture.finished:
                return _public(capture.manifest)
            after = scanner.scan(capture.roots)
            warnings = list(
                dict.fromkeys(capture.before.warnings + after.warnings),
            )
            files = []
            budget = [0, set()]
            keys = set(capture.before.files) | set(after.files)
            candidates = []
            for key in sorted(keys):
                before = capture.before.files.get(key)
                end = after.files.get(key)
                delivered = bool(
                    end and (*key, end.fingerprint) in capture.deliveries,
                )
                # Absence during a partial scan is not proof of deletion.
                if end is None and self._unknown(after, key):
                    continue
                if before is None and self._unknown(capture.before, key):
                    warnings.append(f"Initial version unavailable: {key[1]}")
                if (
                    before
                    and end
                    and before.fingerprint == end.fingerprint
                    and not delivered
                ):
                    continue
                state = (
                    "created"
                    if before is None
                    else (
                        "deleted"
                        if end is None
                        else (
                            "delivered"
                            if before.fingerprint == end.fingerprint
                            else "modified"
                        )
                    )
                )
                candidates.append((key, before, end, state, delivered, False))
            for (
                label,
                relative,
                fingerprint,
            ), delivered_state in capture.deliveries.items():
                key = (label, relative)
                current = after.files.get(key)
                if current and current.fingerprint == fingerprint:
                    continue
                candidates.append(
                    (key, None, delivered_state, "delivered", True, True),
                )
            # Explicitly delivered versions get first claim on the archive
            # budget. The actual end-of-turn change remains its own row.
            candidates.sort(key=lambda item: not item[4])
            for (
                key,
                before,
                end,
                state,
                delivered,
                separate_delivery,
            ) in candidates:
                identity = (
                    *key,
                    end.fingerprint if delivered and end else "change",
                )
                identifier = hashlib.sha256(
                    json.dumps(identity, ensure_ascii=False).encode(),
                ).hexdigest()[:32]
                row: dict[str, Any] = {
                    "id": identifier,
                    "root": key[0],
                    "path": key[1],
                    "name": PurePosixPath(key[1]).name,
                    "status": state,
                    "size": end.size if end else 0,
                    "before_size": before.size if before else 0,
                    "binary": bool(
                        (before and before.binary) or (end and end.binary),
                    ),
                    "delivered": delivered,
                    "_after_blob": self._blob(end, budget, warnings),
                    "_before_blob": self._blob(before, budget, warnings),
                    "_before_exists": before is not None,
                    "_after_exists": end is not None,
                }
                row["before_available"] = row["_before_blob"] is not None
                row["after_available"] = row["_after_blob"] is not None
                if separate_delivery:
                    row["delivery_version"] = True
                    # Outside-root deliveries have no observed end state.
                    if key in after.files or key in capture.before.files:
                        row["current_differs"] = True
                old = before.content if before else b""
                new = end.content if end else b""
                if (
                    old is not None
                    and new is not None
                    and not row["binary"]
                    and max(len(old), len(new))
                    <= min(scanner.MAX_TEXT_BYTES, 256 * 1024)
                ):
                    old_text = scanner.text_content(old)
                    new_text = scanner.text_content(new)
                    if old_text is not None and new_text is not None:
                        # Bound SequenceMatcher's potentially quadratic work.
                        old_lines, new_lines = (
                            old_text.splitlines(),
                            new_text.splitlines(),
                        )
                        if len(old_lines) + len(new_lines) <= 4000:
                            additions = deletions = 0
                            for (
                                operation,
                                a,
                                b,
                                c,
                                d,
                            ) in difflib.SequenceMatcher(
                                None,
                                old_lines,
                                new_lines,
                            ).get_opcodes():
                                if operation in {"insert", "replace"}:
                                    additions += d - c
                                if operation in {"delete", "replace"}:
                                    deletions += b - a
                            row.update(
                                additions=additions,
                                deletions=deletions,
                            )
                files.append(row)
            capture.manifest.update(
                status="canceled" if status == "cancelled" else status,
                finished_at=_now(),
                files=files,
                overlap=capture.overlap,
                warnings=list(dict.fromkeys(warnings))[:100],
                incomplete=capture.before.incomplete
                or after.incomplete
                or bool(warnings),
            )
            self._write(capture.manifest)
            capture.finished = True
            capture.before.files.clear()
            capture.deliveries.clear()
        return _public(capture.manifest)

    def _load(
        self,
        turn_id: str,
        *,
        session_id: str,
        agent_id: str | None = None,
        user_id: str | None = None,
        channel: str | None = None,
    ) -> dict:
        try:
            value = json.loads(
                self._manifest_path(turn_id).read_text(encoding="utf-8"),
            )
        except (OSError, ValueError) as exc:
            raise FileNotFoundError("Turn files not found") from exc
        if (
            not isinstance(value, dict)
            or value.get("id") != turn_id
            or value.get("session_id") != session_id
        ):
            raise FileNotFoundError("Turn files not found")
        for field_name, expected in (
            ("agent_id", agent_id),
            ("_user_id", user_id),
            ("_channel", channel),
        ):
            if expected is not None and value.get(field_name) != expected:
                raise FileNotFoundError("Turn files not found")
        if value.get("status") == "running":
            with _REGISTRY_LOCK:
                capture = _ACTIVE.get(turn_id)
                if capture is not None:
                    value["overlap"] = capture.overlap
                else:
                    value.update(status="interrupted", incomplete=True)
                    value["warnings"] = [
                        *value.get("warnings", []),
                        "Capture interrupted before final snapshot",
                    ]
        return value

    def get_turn(self, turn_id: str, **scope) -> dict:
        return _public(self._load(turn_id, **scope))

    def list_turns(
        self,
        *,
        session_id: str,
        limit: int = 100,
        offset: int = 0,
        response_id: str | None = None,
        client_message_id: str | None = None,
        **scope,
    ) -> list[dict]:
        results = []
        directory = safe_path(self.directory / "turns")
        for path in directory.glob("*.json"):
            try:
                value = self.get_turn(
                    path.stem,
                    session_id=session_id,
                    **scope,
                )
                if (
                    response_id is not None
                    and value.get("response_id") != response_id
                ):
                    continue
                if (
                    client_message_id is not None
                    and value.get("client_message_id") != client_message_id
                ):
                    continue
                results.append(value)
            except (OSError, ValueError, TypeError):
                continue
        results.sort(
            key=lambda item: (item.get("started_at", ""), item["id"]),
            reverse=True,
        )
        start = max(0, offset)
        end = start + max(1, min(limit, 500))
        return results[start:end]

    def _entry(self, turn_id: str, file_id: str, **scope) -> dict:
        if not _ID.fullmatch(file_id):
            raise FileNotFoundError("File version not found")
        manifest = self._load(turn_id, **scope)
        entry = next(
            (
                item
                for item in manifest.get("files", [])
                if item.get("id") == file_id
            ),
            None,
        )
        if entry is None:
            raise FileNotFoundError("File version not found")
        return entry

    def _read_blob(self, digest: str | None) -> bytes:
        if not digest or not _HASH.fullmatch(digest):
            raise FileNotFoundError("File version unavailable")
        path = safe_path(self.directory / "blobs" / digest)
        state = scanner.read_file(path, Snapshot(), "archived version")
        data = state.content
        if data is None or hashlib.sha256(data).hexdigest() != digest:
            raise FileNotFoundError("File version failed integrity validation")
        return data

    def get_file(
        self,
        turn_id: str,
        file_id: str,
        *,
        version: str = "after",
        **scope,
    ) -> tuple[bytes, str]:
        if version not in {"before", "after"}:
            raise ValueError("Invalid file version")
        entry = self._entry(turn_id, file_id, **scope)
        return self._read_blob(entry.get(f"_{version}_blob")), entry["name"]

    def diff(self, turn_id: str, file_id: str, **scope) -> dict:
        entry = self._entry(turn_id, file_id, **scope)
        if entry.get("binary"):
            raise ValueError("Binary files do not have a text diff")
        contents = []
        truncated = False
        for version in ("before", "after"):
            absent = entry.get(f"_{version}_exists") is False
            data = (
                b""
                if absent
                else self._read_blob(entry.get(f"_{version}_blob"))
            )
            truncated = truncated or len(data) > scanner.MAX_TEXT_BYTES
            text = scanner.text_content(data[: scanner.MAX_TEXT_BYTES])
            if text is None:
                # A truncated UTF-8 codepoint may be incomplete, but original
                # bytes remain available in the immutable download.
                text = data[: scanner.MAX_TEXT_BYTES].decode(
                    "utf-8",
                    errors="replace",
                )
            lines = text.splitlines(keepends=True)
            if len(lines) > 20000:
                text = "".join(lines[:20000])
                truncated = True
            contents.append(text)
        return {
            "before": contents[0],
            "after": contents[1],
            "truncated": truncated,
        }

    def bundle(self, turn_id: str, **scope) -> bytes:
        manifest = self._load(turn_id, **scope)
        output = io.BytesIO()
        with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
            for item in manifest.get("files", []):
                version = (
                    "after"
                    if item.get("after_available")
                    else (
                        "before"
                        if item.get("status") == "deleted"
                        and item.get("before_available")
                        else None
                    )
                )
                if version is None:
                    continue
                relative = PurePosixPath(item["path"])
                if relative.is_absolute() or any(
                    part in {".", ".."} or ":" in part or "\\" in part
                    for part in relative.parts
                ):
                    raise ValueError("Invalid archived path")
                root = item["root"]
                folder = (
                    "workspace"
                    if root == "workspace"
                    else "project-"
                    + hashlib.sha256(root.encode()).hexdigest()[:12]
                )
                if item.get("delivery_version"):
                    folder = f"delivered-versions/{item['id']}/{folder}"
                elif version == "before":
                    folder = f"deleted-before/{folder}"
                archive.writestr(
                    f"{folder}/{relative.as_posix()}",
                    self._read_blob(item.get(f"_{version}_blob")),
                )
            archive.writestr(
                "turn-manifest.json",
                json.dumps(_public(manifest), ensure_ascii=False, indent=2),
            )
        return output.getvalue()


def get_store(workspace_dir: str | Path) -> TurnFileStore:
    key = os.path.normcase(os.path.abspath(workspace_dir))
    with _REGISTRY_LOCK:
        if key not in _STORES:
            _STORES[key] = TurnFileStore(workspace_dir)
        return _STORES[key]
