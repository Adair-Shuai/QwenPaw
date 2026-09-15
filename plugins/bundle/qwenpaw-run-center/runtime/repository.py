"""Durable Run Center repository with a non-invasive legacy bridge."""

from __future__ import annotations

import json
import logging
import math
import sqlite3
import threading
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

from .models import (
    TERMINAL_STATUSES,
    RunStatus,
    StageStatus,
    normalize_legacy_status,
    run_summary,
)

logger = logging.getLogger("qwenpaw").getChild("plugin.run_center.repository")


def _working_dir() -> Path:
    try:
        from qwenpaw.constant import WORKING_DIR

        return Path(WORKING_DIR)
    except Exception:  # pragma: no cover - standalone import fallback
        return Path.home() / ".qwenpaw"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _json(raw: Any) -> dict[str, Any]:
    if isinstance(raw, dict):
        value = raw
    else:
        try:
            value = json.loads(
                raw or "{}",
                parse_constant=lambda constant: (_ for _ in ()).throw(
                    ValueError(f"non-finite JSON constant: {constant}")
                ),
            )
        except (TypeError, ValueError, json.JSONDecodeError):
            return {}
    if not isinstance(value, dict):
        return {}
    try:
        # Return a JSON-safe copy.  Legacy stores may contain values accepted
        # by Python's permissive JSON decoder (NaN/Infinity); those must not
        # leak into Starlette's strict JSON responses.
        return json.loads(
            json.dumps(value, ensure_ascii=False, allow_nan=False),
        )
    except (TypeError, ValueError, json.JSONDecodeError):
        return {}


def _encode_json(
    value: Any,
    *,
    label: str | None = None,
    field: str | None = None,
) -> str:
    """Encode a public payload with strict JSON semantics."""
    name = label or field or "value"
    try:
        return json.dumps(
            value,
            ensure_ascii=False,
            sort_keys=True,
            allow_nan=False,
        )
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{name} must be JSON-safe") from exc


def _bounded_progress(value: Any) -> float | None:
    """Normalize optional progress and reject NaN/Infinity explicitly."""
    if value is None:
        return None
    try:
        normalized = float(value)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError("progress must be a finite number between 0 and 1") from exc
    if not math.isfinite(normalized) or not 0 <= normalized <= 1:
        raise ValueError("progress must be a finite number between 0 and 1")
    return normalized


class RunRepository:
    """Owns the Run Center database and reads legacy UGSci jobs read-only."""

    def __init__(self, root: Path | None = None) -> None:
        self.root = Path(root) if root else _working_dir() / "run-center"
        self.database = self.root / "runs.sqlite3"
        self._initialized = False
        self._init_lock = threading.Lock()

    @contextmanager
    def _connection(self, *, write: bool = False) -> Iterator[sqlite3.Connection]:
        self.root.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(self.database, timeout=30, isolation_level=None)
        conn.row_factory = sqlite3.Row
        try:
            conn.execute("PRAGMA busy_timeout=30000")
            conn.execute("PRAGMA foreign_keys=ON")
            if write:
                conn.execute("PRAGMA journal_mode=WAL")
                conn.execute("PRAGMA synchronous=NORMAL")
                conn.execute("BEGIN IMMEDIATE")
            yield conn
            if write and conn.in_transaction:
                conn.execute("COMMIT")
        except Exception:
            if write:
                try:
                    conn.execute("ROLLBACK")
                except sqlite3.Error:
                    pass
            raise
        finally:
            conn.close()

    def initialize(self) -> None:
        if self._initialized:
            return
        with self._init_lock:
            if self._initialized:
                return
            with self._connection(write=True) as conn:
                # Keep schema upgrades explicit.  ``CREATE TABLE IF NOT
                # EXISTS`` alone leaves older desktop databases missing new
                # columns and, more importantly, cannot change the old
                # single-column Operation primary key.
                conn.execute(
                    "CREATE TABLE IF NOT EXISTS schema_migrations ("
                    "version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)"
                )
                conn.execute(
                """CREATE TABLE IF NOT EXISTS runs (
                    run_id TEXT PRIMARY KEY,
                    operation TEXT NOT NULL,
                    status TEXT NOT NULL,
                    phase TEXT NOT NULL DEFAULT '',
                    progress REAL,
                    project_id TEXT,
                    parent_run_id TEXT,
                    model_version_id TEXT,
                    study_id TEXT,
                    idempotency_key TEXT,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )""",
                )
                conn.execute(
                """CREATE TABLE IF NOT EXISTS run_events (
                    run_id TEXT NOT NULL,
                    sequence INTEGER NOT NULL,
                    event_type TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    PRIMARY KEY (run_id, sequence)
                )""",
                )
                conn.execute(
                """CREATE TABLE IF NOT EXISTS operation_registry (
                    operation TEXT NOT NULL,
                    provider_id TEXT NOT NULL DEFAULT '',
                    descriptor TEXT NOT NULL,
                    contract_version TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (operation, provider_id)
                )""",
                )
                conn.execute(
                """CREATE TABLE IF NOT EXISTS run_stages (
                    run_id TEXT NOT NULL,
                    stage_id TEXT NOT NULL,
                    ordinal INTEGER NOT NULL DEFAULT 0,
                    operation TEXT NOT NULL,
                    status TEXT NOT NULL,
                    progress REAL,
                    attempt INTEGER NOT NULL DEFAULT 0,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (run_id, stage_id),
                    FOREIGN KEY (run_id) REFERENCES runs(run_id) ON DELETE CASCADE
                )""",
                )
                conn.execute(
                """CREATE TABLE IF NOT EXISTS run_artifacts (
                    run_id TEXT NOT NULL,
                    ref_id TEXT NOT NULL,
                    stage_id TEXT NOT NULL DEFAULT '',
                    role TEXT NOT NULL DEFAULT 'output',
                    kind TEXT NOT NULL DEFAULT 'artifact',
                    uri TEXT NOT NULL DEFAULT '',
                    media_type TEXT,
                    sha256 TEXT,
                    size_bytes INTEGER,
                    metadata TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (run_id, ref_id, stage_id, role),
                    FOREIGN KEY (run_id) REFERENCES runs(run_id) ON DELETE CASCADE
                )""",
                )
                conn.execute(
                """CREATE TABLE IF NOT EXISTS run_checkpoints (
                    checkpoint_id TEXT PRIMARY KEY,
                    run_id TEXT NOT NULL,
                    stage_id TEXT NOT NULL DEFAULT '',
                    artifact_ref TEXT,
                    state TEXT NOT NULL DEFAULT 'ready',
                    resume_token TEXT,
                    metadata TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (run_id) REFERENCES runs(run_id) ON DELETE CASCADE
                )""",
                )
                conn.execute(
                """CREATE TABLE IF NOT EXISTS run_provenance (
                    provenance_id TEXT PRIMARY KEY,
                    run_id TEXT NOT NULL,
                    artifact_ref_id TEXT NOT NULL DEFAULT '',
                    input_fingerprint TEXT,
                    provider_id TEXT,
                    provider_version TEXT,
                    software_version TEXT,
                    unit_system TEXT,
                    coordinate_system TEXT,
                    metadata TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    UNIQUE (run_id, artifact_ref_id),
                    FOREIGN KEY (run_id) REFERENCES runs(run_id) ON DELETE CASCADE
                )""",
                )
                conn.execute(
                """CREATE TABLE IF NOT EXISTS project_queue_policies (
                    project_id TEXT PRIMARY KEY,
                    max_concurrency INTEGER,
                    weight REAL NOT NULL DEFAULT 1,
                    resource_limits TEXT NOT NULL DEFAULT '{}',
                    enabled INTEGER NOT NULL DEFAULT 1,
                    updated_at TEXT NOT NULL
                )""",
                )
                conn.execute(
                """CREATE TABLE IF NOT EXISTS resource_leases (
                    lease_id TEXT PRIMARY KEY,
                    run_id TEXT NOT NULL,
                    project_id TEXT,
                    pool_id TEXT NOT NULL DEFAULT 'local',
                    resources TEXT NOT NULL DEFAULT '{}',
                    owner TEXT NOT NULL DEFAULT 'run-center',
                    state TEXT NOT NULL DEFAULT 'active',
                    acquired_at TEXT NOT NULL,
                    expires_at TEXT,
                    released_at TEXT,
                    FOREIGN KEY (run_id) REFERENCES runs(run_id) ON DELETE CASCADE
                )""",
                )
                # There may be any number of historical released leases, but
                # a Run can own only one active lease at a time.  This also
                # protects multi-threaded admission from duplicate inserts.
                conn.execute(
                    "CREATE UNIQUE INDEX IF NOT EXISTS idx_resource_leases_active_run "
                    "ON resource_leases(run_id) WHERE state = 'active'"
                )
                self._migrate_schema(conn)
                self._promote_embedded_components(conn)
                conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_runs_updated_at ON runs(updated_at DESC)",
                )
                conn.execute("CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_runs_project ON runs(project_id)")
                conn.execute(
                    "CREATE UNIQUE INDEX IF NOT EXISTS idx_runs_idempotency "
                    "ON runs(idempotency_key) WHERE idempotency_key IS NOT NULL"
                )
                conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_run_stages_order "
                    "ON run_stages(run_id, ordinal, stage_id)"
                )
                conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_run_artifacts_run "
                    "ON run_artifacts(run_id, stage_id, role)"
                )
                conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_run_checkpoints_run "
                    "ON run_checkpoints(run_id, stage_id, created_at DESC)"
                )
                conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_resource_leases_run "
                    "ON resource_leases(run_id, state)"
                )
                conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_resource_leases_project "
                    "ON resource_leases(project_id, state)"
                )
            self._initialized = True

    @staticmethod
    def _migrate_schema(conn: sqlite3.Connection) -> None:
        """Upgrade databases created by the R0 single-table schema."""
        columns = {row[1] for row in conn.execute("PRAGMA table_info(runs)")}
        if "idempotency_key" not in columns:
            conn.execute("ALTER TABLE runs ADD COLUMN idempotency_key TEXT")
        # R0 stored the key only inside the JSON payload. Promote valid keys
        # before enforcing uniqueness. Do this in Python so a malformed old
        # payload or duplicate historical key cannot make the whole backend
        # fail to start during migration.
        seen_idempotency_keys: set[str] = set()
        for row in conn.execute(
            "SELECT rowid, idempotency_key, payload FROM runs ORDER BY rowid"
        ):
            raw_key = row[1]
            if raw_key is None:
                raw_key = _json(row[2]).get("idempotency_key")
            key = str(raw_key).strip() if raw_key is not None else ""
            normalized_key = key or None
            if normalized_key in seen_idempotency_keys:
                normalized_key = None
            elif normalized_key is not None:
                seen_idempotency_keys.add(normalized_key)
            if normalized_key != row[1]:
                conn.execute(
                    "UPDATE runs SET idempotency_key = ? WHERE rowid = ?",
                    (normalized_key, row[0]),
                )

        # R0 used ``operation`` as the sole primary key.  Rebuild that table
        # once so two providers can implement the same business operation.
        op_columns = list(conn.execute("PRAGMA table_info(operation_registry)"))
        provider_not_null = any(
            row[1] == "provider_id" and int(row[3] or 0) == 1
            for row in op_columns
        )
        pk_columns = [row[1] for row in op_columns if int(row[5] or 0) > 0]
        if pk_columns != ["operation", "provider_id"] or not provider_not_null:
            conn.execute(
                "CREATE TABLE operation_registry_v2 ("
                "operation TEXT NOT NULL, provider_id TEXT NOT NULL DEFAULT '',"
                "descriptor TEXT NOT NULL, contract_version TEXT NOT NULL,"
                "updated_at TEXT NOT NULL, PRIMARY KEY(operation, provider_id))"
            )
            conn.execute(
                "INSERT OR REPLACE INTO operation_registry_v2 "
                "(operation, provider_id, descriptor, contract_version, updated_at) "
                "SELECT operation, COALESCE(provider_id, ''), descriptor, "
                "contract_version, updated_at FROM operation_registry"
            )
            conn.execute("DROP TABLE operation_registry")
            conn.execute("ALTER TABLE operation_registry_v2 RENAME TO operation_registry")

        conn.execute(
            "INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (?, ?)",
            (1, _now()),
        )
        conn.execute(
            "INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (?, ?)",
            (2, _now()),
        )
        conn.execute(
            "INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (?, ?)",
            (4, _now()),
        )

    def _promote_embedded_components(self, conn: sqlite3.Connection) -> None:
        """Promote component arrays from R0 payloads into normalized tables once."""
        if conn.execute(
            "SELECT 1 FROM schema_migrations WHERE version=3"
        ).fetchone() is not None:
            return
        for row in conn.execute("SELECT run_id, payload FROM runs ORDER BY rowid"):
            run_id = row["run_id"]
            payload = _json(row["payload"])
            stages = payload.get("stages") or []
            artifacts = payload.get("artifacts") or []
            provenance = payload.get("provenance")
            checkpoints = payload.get("checkpoints") or []
            if isinstance(stages, list):
                for ordinal, stage in enumerate(stages):
                    if not isinstance(stage, dict):
                        continue
                    try:
                        self._upsert_stage_tx(
                            conn,
                            run_id,
                            {**stage, "ordinal": stage.get("ordinal", ordinal)},
                            emit_event=False,
                        )
                    except (TypeError, ValueError) as exc:
                        logger.warning(
                            "Skipping malformed embedded stage for run %s: %s",
                            run_id,
                            exc,
                        )
            if isinstance(artifacts, list):
                for artifact in artifacts:
                    if isinstance(artifact, dict):
                        try:
                            self._upsert_artifact_tx(conn, run_id, artifact)
                        except (TypeError, ValueError) as exc:
                            logger.warning(
                                "Skipping malformed embedded artifact for run %s: %s",
                                run_id,
                                exc,
                            )
            if isinstance(provenance, dict):
                try:
                    self._upsert_provenance_tx(conn, run_id, provenance)
                except (TypeError, ValueError) as exc:
                    logger.warning(
                        "Skipping malformed embedded provenance for run %s: %s",
                        run_id,
                        exc,
                    )
            if isinstance(checkpoints, list):
                for checkpoint in checkpoints:
                    if not isinstance(checkpoint, dict):
                        continue
                    checkpoint_id = str(
                        checkpoint.get("checkpoint_id") or uuid.uuid4().hex
                    )
                    stage_id = str(checkpoint.get("stage_id") or "")
                    artifact_ref = checkpoint.get("artifact_ref")
                    conn.execute(
                        "INSERT OR IGNORE INTO run_checkpoints "
                        "(checkpoint_id, run_id, stage_id, artifact_ref, state, "
                        "resume_token, metadata, created_at, updated_at) "
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        (
                            checkpoint_id,
                            run_id,
                            stage_id,
                            _encode_json(artifact_ref, field="checkpoint artifact_ref")
                            if isinstance(artifact_ref, dict)
                            else None,
                            str(checkpoint.get("state") or "ready"),
                            checkpoint.get("resume_token"),
                            _encode_json(
                                checkpoint.get("metadata")
                                if isinstance(checkpoint.get("metadata"), dict)
                                else {},
                                field="checkpoint metadata",
                            ),
                            str(checkpoint.get("created_at") or _now()),
                            str(checkpoint.get("updated_at") or _now()),
                        ),
                    )
        conn.execute(
            "INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)",
            (3, _now()),
        )

    def register_operation(
        self,
        operation: str,
        descriptor: dict[str, Any],
        *,
        provider_id: str | None = None,
        contract_version: str = "1.0",
    ) -> None:
        """Persist a JSON-only Operation descriptor supplied by a domain plugin."""
        normalized_operation = str(operation or "").strip()
        if not normalized_operation or not isinstance(descriptor, dict):
            raise ValueError("operation and descriptor are required")
        if provider_id is not None and not isinstance(provider_id, str):
            raise ValueError("provider_id must be a string")
        normalized_provider = provider_id.strip() if provider_id else ""
        normalized_contract = str(contract_version or "").strip()
        if not normalized_contract:
            raise ValueError("contract_version is required")
        try:
            encoded_descriptor = _encode_json(descriptor, label="descriptor")
        except ValueError:
            raise
        self.initialize()
        now = _now()
        with self._connection(write=True) as conn:
            conn.execute(
                "INSERT INTO operation_registry "
                "(operation, provider_id, descriptor, contract_version, updated_at) "
                "VALUES (?, ?, ?, ?, ?) "
                "ON CONFLICT(operation, provider_id) DO UPDATE SET descriptor=excluded.descriptor, "
                "contract_version=excluded.contract_version, provider_id=excluded.provider_id, "
                "updated_at=excluded.updated_at",
                (
                    normalized_operation,
                    normalized_provider,
                    encoded_descriptor,
                    normalized_contract,
                    now,
                ),
            )

    def replace_operations(
        self,
        operations: list[dict[str, Any]],
    ) -> None:
        """Atomically replace host-published operation descriptors.

        Runtime plugin reloads can add or remove providers after the initial
        startup hook. Replacing the snapshot prevents stale providers from
        surviving indefinitely in the durable catalog.
        """
        normalized: list[tuple[str, str, str, str]] = []
        for item in operations:
            if not isinstance(item, dict):
                raise ValueError("operation registrations must be objects")
            operation = str(item.get("operation") or "").strip()
            descriptor = item.get("descriptor")
            provider_id = item.get("provider_id")
            contract_version = str(
                item.get("contract_version") or ""
            ).strip()
            if not operation or not isinstance(descriptor, dict):
                raise ValueError("operation and descriptor are required")
            if provider_id is not None and not isinstance(provider_id, str):
                raise ValueError("provider_id must be a string")
            if not contract_version:
                raise ValueError("contract_version is required")
            encoded = _encode_json(descriptor, label="descriptor")
            normalized.append(
                (
                    operation,
                    provider_id.strip() if provider_id else "",
                    encoded,
                    contract_version,
                )
            )

        self.initialize()
        now = _now()
        with self._connection(write=True) as conn:
            conn.execute("DELETE FROM operation_registry")
            conn.executemany(
                "INSERT INTO operation_registry "
                "(operation, provider_id, descriptor, contract_version, "
                "updated_at) VALUES (?, ?, ?, ?, ?)",
                [(*item, now) for item in normalized],
            )

    def list_operations(self) -> list[dict[str, Any]]:
        """Return registered Operation descriptors in stable order."""
        self.initialize()
        with self._connection() as conn:
            rows = conn.execute(
                "SELECT operation, descriptor, contract_version, provider_id, updated_at "
                "FROM operation_registry ORDER BY operation, provider_id",
            ).fetchall()
        return [
            {
                "operation": row["operation"],
                "descriptor": _json(row["descriptor"]),
                "contract_version": row["contract_version"],
                "provider_id": row["provider_id"] or None,
                "updated_at": row["updated_at"],
            }
            for row in rows
        ]

    def get_operation(
        self,
        operation: str,
        *,
        provider_id: str | None = None,
    ) -> dict[str, Any] | None:
        """Return one descriptor using deterministic provider selection.

        If no provider is requested, the lexicographically first provider is
        selected.  This mirrors the host ``PluginRegistry`` behavior and
        gives API clients a stable default while still allowing explicit
        provider pinning for reproducible runs.
        """
        normalized_operation = str(operation or "").strip()
        if not normalized_operation:
            return None
        normalized_provider = provider_id.strip() if provider_id else None
        self.initialize()
        with self._connection() as conn:
            if normalized_provider is None:
                row = conn.execute(
                    "SELECT operation, descriptor, contract_version, provider_id, updated_at "
                    "FROM operation_registry WHERE operation = ? "
                    "ORDER BY provider_id LIMIT 1",
                    (normalized_operation,),
                ).fetchone()
            else:
                row = conn.execute(
                    "SELECT operation, descriptor, contract_version, provider_id, updated_at "
                    "FROM operation_registry WHERE operation = ? AND provider_id = ?",
                    (normalized_operation, normalized_provider),
                ).fetchone()
        if row is None:
            return None
        return {
            "operation": row["operation"],
            "descriptor": _json(row["descriptor"]),
            "contract_version": row["contract_version"],
            "provider_id": row["provider_id"] or None,
            "updated_at": row["updated_at"],
        }

    # ------------------------------------------------------------------
    # Queue policy and resource lease persistence
    # ------------------------------------------------------------------
    # These records deliberately live in the Run Center repository rather
    # than in an executor's process memory.  A desktop executor can therefore
    # enforce project limits today while a future remote scheduler can reuse
    # the same contract without changing Run payloads or HTTP clients.

    @staticmethod
    def _normalize_project_id(project_id: Any) -> str:
        value = str(project_id or "").strip()
        if not value:
            raise ValueError("project_id is required")
        if len(value) > 256:
            raise ValueError("project_id is too long")
        return value

    @staticmethod
    def _normalize_resource_limits(value: Any) -> dict[str, Any]:
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise ValueError("resource_limits must be an object")
        normalized: dict[str, Any] = {}
        for key, raw in value.items():
            name = str(key).strip()
            if not name:
                continue
            if isinstance(raw, bool):
                raise ValueError(f"resource_limits.{name} must be numeric")
            if isinstance(raw, (int, float)):
                if not math.isfinite(float(raw)) or float(raw) < 0:
                    raise ValueError(f"resource_limits.{name} must be finite and non-negative")
                normalized[name] = raw
            elif isinstance(raw, list) and all(isinstance(item, str) for item in raw):
                normalized[name] = list(raw)
            else:
                raise ValueError(f"resource_limits.{name} must be numeric or a string array")
        _encode_json(normalized, field="resource_limits")
        return normalized

    def upsert_project_queue_policy(
        self,
        project_id: str,
        *,
        max_concurrency: int | None = None,
        weight: float = 1.0,
        resource_limits: dict[str, Any] | None = None,
        enabled: bool = True,
    ) -> dict[str, Any]:
        """Persist one project's scheduling policy.

        ``max_concurrency=None`` means unlimited beyond the local executor's
        worker capacity.  Weight is retained for a future scheduler; the
        process-local executor currently enforces concurrency and preserves
        priority/FIFO admission without claiming weighted fairness.
        """
        project = self._normalize_project_id(project_id)
        if max_concurrency is not None:
            try:
                max_concurrency = int(max_concurrency)
            except (TypeError, ValueError) as exc:
                raise ValueError("max_concurrency must be a positive integer") from exc
            if max_concurrency < 1:
                raise ValueError("max_concurrency must be a positive integer")
        try:
            weight = float(weight)
        except (TypeError, ValueError) as exc:
            raise ValueError("weight must be a finite positive number") from exc
        if not math.isfinite(weight) or weight <= 0:
            raise ValueError("weight must be a finite positive number")
        limits = self._normalize_resource_limits(resource_limits)
        now = _now()
        self.initialize()
        with self._connection(write=True) as conn:
            conn.execute(
                "INSERT INTO project_queue_policies "
                "(project_id, max_concurrency, weight, resource_limits, enabled, updated_at) "
                "VALUES (?, ?, ?, ?, ?, ?) "
                "ON CONFLICT(project_id) DO UPDATE SET "
                "max_concurrency=excluded.max_concurrency, weight=excluded.weight, "
                "resource_limits=excluded.resource_limits, enabled=excluded.enabled, "
                "updated_at=excluded.updated_at",
                (project, max_concurrency, weight, _encode_json(limits, field="resource_limits"), int(bool(enabled)), now),
            )
            row = conn.execute(
                "SELECT * FROM project_queue_policies WHERE project_id = ?", (project,)
            ).fetchone()
        assert row is not None
        return self._project_policy_row(row)

    @staticmethod
    def _project_policy_row(row: sqlite3.Row) -> dict[str, Any]:
        return {
            "project_id": row["project_id"],
            "max_concurrency": int(row["max_concurrency"]) if row["max_concurrency"] is not None else None,
            "weight": float(row["weight"]),
            "resource_limits": _json(row["resource_limits"]),
            "enabled": bool(row["enabled"]),
            "updated_at": row["updated_at"],
        }

    def get_project_queue_policy(self, project_id: str) -> dict[str, Any] | None:
        project = self._normalize_project_id(project_id)
        self.initialize()
        with self._connection() as conn:
            row = conn.execute(
                "SELECT * FROM project_queue_policies WHERE project_id = ?", (project,)
            ).fetchone()
        return self._project_policy_row(row) if row is not None else None

    def list_project_queue_policies(self) -> list[dict[str, Any]]:
        self.initialize()
        with self._connection() as conn:
            rows = conn.execute(
                "SELECT * FROM project_queue_policies ORDER BY project_id"
            ).fetchall()
        return [self._project_policy_row(row) for row in rows]

    def delete_project_queue_policy(self, project_id: str) -> bool:
        project = self._normalize_project_id(project_id)
        self.initialize()
        with self._connection(write=True) as conn:
            cursor = conn.execute(
                "DELETE FROM project_queue_policies WHERE project_id = ?", (project,)
            )
        return cursor.rowcount > 0

    def _project_active_lease_count_tx(
        self, conn: sqlite3.Connection, project_id: str | None
    ) -> int:
        if not project_id:
            return 0
        row = conn.execute(
            "SELECT COUNT(*) FROM resource_leases WHERE project_id = ? AND state = 'active'",
            (project_id,),
        ).fetchone()
        return int(row[0] if row else 0)

    @staticmethod
    def _lease_row(row: sqlite3.Row) -> dict[str, Any]:
        return {
            "lease_id": row["lease_id"],
            "run_id": row["run_id"],
            "project_id": row["project_id"],
            "pool_id": row["pool_id"],
            "resources": _json(row["resources"]),
            "owner": row["owner"],
            "state": row["state"],
            "acquired_at": row["acquired_at"],
            "expires_at": row["expires_at"],
            "released_at": row["released_at"],
        }

    def acquire_resource_lease(
        self,
        run_id: str,
        *,
        project_id: str | None = None,
        pool_id: str = "local",
        resources: dict[str, Any] | None = None,
        owner: str = "run-center",
        ttl_seconds: float | None = None,
    ) -> dict[str, Any] | None:
        """Atomically acquire a project-scoped lease, or return ``None``.

        The lease is intentionally generic JSON.  The local executor uses it
        for project concurrency; CPU/memory/GPU and license accounting remain
        provider-owned until a scheduler with those capabilities is installed.
        """
        if run_id.startswith("ugsci:"):
            raise ValueError("legacy runs are read-only")
        project = self._normalize_project_id(project_id) if project_id else None
        pool = str(pool_id or "local").strip() or "local"
        lease_owner = str(owner or "run-center").strip() or "run-center"
        normalized_resources = self._normalize_resource_limits(resources)
        expires_at: str | None = None
        if ttl_seconds is not None:
            try:
                ttl = float(ttl_seconds)
            except (TypeError, ValueError) as exc:
                raise ValueError("ttl_seconds must be a positive finite number") from exc
            if not math.isfinite(ttl) or ttl <= 0:
                raise ValueError("ttl_seconds must be a positive finite number")
            expires_at = datetime.fromtimestamp(
                datetime.now(timezone.utc).timestamp() + ttl, timezone.utc
            ).isoformat()
        self.initialize()
        now = _now()
        with self._connection(write=True) as conn:
            # Expired leases are not capacity claims.  Reconcile them in the
            # same write transaction before counting project usage.
            conn.execute(
                "UPDATE resource_leases SET state='released', released_at=? "
                "WHERE state='active' AND expires_at IS NOT NULL AND expires_at <= ?",
                (now, now),
            )
            run = self._own_row(conn, run_id)
            if run is None:
                raise KeyError(run_id)
            if self._canonical_status(run["status"]) in TERMINAL_STATUSES:
                raise ValueError("cannot acquire a lease for a terminal Run")
            existing = conn.execute(
                "SELECT * FROM resource_leases WHERE run_id = ? AND state = 'active' "
                "ORDER BY acquired_at DESC LIMIT 1", (run_id,)
            ).fetchone()
            if existing is not None:
                return self._lease_row(existing)
            if project:
                policy_row = conn.execute(
                    "SELECT * FROM project_queue_policies WHERE project_id = ?", (project,)
                ).fetchone()
                if policy_row is not None and bool(policy_row["enabled"]):
                    maximum = policy_row["max_concurrency"]
                    if maximum is not None and self._project_active_lease_count_tx(conn, project) >= int(maximum):
                        return None
                    limits = _json(policy_row["resource_limits"])
                    # Numeric limits (CPU, memory, GPU, disk, or provider
                    # defined counters) are summed across active leases.  A
                    # provider may use any stable key; unknown keys remain
                    # valid metadata and are only constrained when a policy
                    # declares a matching numeric limit.
                    for key, limit in limits.items():
                        if not isinstance(limit, (int, float)) or isinstance(limit, bool):
                            continue
                        requested = normalized_resources.get(key, 0)
                        if not isinstance(requested, (int, float)) or isinstance(requested, bool):
                            continue
                        row = conn.execute(
                            "SELECT resources FROM resource_leases WHERE project_id=? AND state='active'",
                            (project,),
                        ).fetchall()
                        used = 0.0
                        for active in row:
                            existing_resources = _json(active["resources"])
                            value = existing_resources.get(key, 0)
                            if isinstance(value, (int, float)) and not isinstance(value, bool):
                                used += float(value)
                        if used + float(requested) > float(limit):
                            return None
            lease_id = uuid.uuid4().hex
            conn.execute(
                "INSERT OR IGNORE INTO resource_leases "
                "(lease_id, run_id, project_id, pool_id, resources, owner, state, acquired_at, expires_at) "
                "VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)",
                (lease_id, run_id, project, pool, _encode_json(normalized_resources, field="resources"), lease_owner, now, expires_at),
            )
            row = conn.execute(
                "SELECT * FROM resource_leases WHERE run_id = ? AND state = 'active' "
                "ORDER BY acquired_at DESC LIMIT 1", (run_id,)
            ).fetchone()
        assert row is not None
        return self._lease_row(row)

    def release_resource_lease(
        self,
        lease_id: str,
        *,
        reason: str | None = None,
        allow_active_run: bool = False,
    ) -> dict[str, Any] | None:
        lease = str(lease_id or "").strip()
        if not lease:
            return None
        self.initialize()
        now = _now()
        with self._connection(write=True) as conn:
            row = conn.execute(
                "SELECT * FROM resource_leases WHERE lease_id = ?", (lease,)
            ).fetchone()
            if row is None:
                return None
            if row["state"] == "active":
                run = self._own_row(conn, row["run_id"])
                volatile = {
                    RunStatus.PREPARING,
                    RunStatus.RUNNING,
                    RunStatus.FINALIZING,
                    RunStatus.CANCELLING,
                }
                if (
                    not allow_active_run
                    and run is not None
                    and self._canonical_status(run["status"]) in volatile
                ):
                    raise ValueError("cannot release a lease while its Run is active")
                conn.execute(
                    "UPDATE resource_leases SET state='released', released_at=? WHERE lease_id=?",
                    (now, lease),
                )
            updated = conn.execute(
                "SELECT * FROM resource_leases WHERE lease_id = ?", (lease,)
            ).fetchone()
            result = self._lease_row(updated) if updated is not None else None
            if result is not None and reason:
                # Keep release reason in the event stream, while preserving a
                # small stable lease row for SQL consumers.
                try:
                    self._append_event_tx(conn, row["run_id"], "resource.lease_released", {"lease_id": lease, "reason": str(reason)})
                except (KeyError, ValueError):
                    pass
            return result

    def release_resource_leases_for_run(self, run_id: str, *, reason: str | None = None) -> int:
        if run_id.startswith("ugsci:"):
            return 0
        self.initialize()
        now = _now()
        with self._connection(write=True) as conn:
            rows = conn.execute(
                "SELECT lease_id FROM resource_leases WHERE run_id=? AND state='active'", (run_id,)
            ).fetchall()
            if not rows:
                return 0
            conn.execute(
                "UPDATE resource_leases SET state='released', released_at=? WHERE run_id=? AND state='active'",
                (now, run_id),
            )
            if reason:
                self._append_event_tx(conn, run_id, "resource.lease_released", {"reason": str(reason), "count": len(rows)})
            return len(rows)

    def list_resource_leases(
        self,
        *,
        run_id: str | None = None,
        project_id: str | None = None,
        state: str | None = None,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        self.initialize()
        limit = max(1, min(int(limit), 500))
        clauses: list[str] = []
        values: list[Any] = []
        if run_id:
            clauses.append("run_id = ?")
            values.append(str(run_id))
        if project_id:
            clauses.append("project_id = ?")
            values.append(self._normalize_project_id(project_id))
        if state:
            candidate = str(state).strip().lower()
            if candidate not in {"active", "released"}:
                raise ValueError("state must be active or released")
            clauses.append("state = ?")
            values.append(candidate)
        where = " WHERE " + " AND ".join(clauses) if clauses else ""
        with self._connection() as conn:
            rows = conn.execute(
                "SELECT * FROM resource_leases" + where + " ORDER BY acquired_at DESC LIMIT ?",
                [*values, limit],
            ).fetchall()
        return [self._lease_row(row) for row in rows]

    def cleanup_stale_resource_leases(self) -> int:
        """Release leases whose runs are no longer in a volatile state."""
        self.initialize()
        now = _now()
        with self._connection(write=True) as conn:
            cursor = conn.execute(
                "UPDATE resource_leases SET state='released', released_at=? "
                "WHERE state='active' AND run_id IN ("
                "SELECT run_id FROM runs WHERE status NOT IN (?, ?, ?, ?))",
                (now, RunStatus.PREPARING, RunStatus.RUNNING, RunStatus.FINALIZING, RunStatus.CANCELLING),
            )
        return int(cursor.rowcount)

    def recover_incomplete_runs(self) -> list[dict[str, Any]]:
        """Resolve runs left in volatile execution states after a restart.

        A run can opt into automatic requeue with
        ``payload.recovery_policy = \"requeue\"``.  The conservative default
        is ``blocked`` because repeating a simulator or engineering write may
        not be safe.  ``recovery_policy = \"resume\"`` is only requeued when a
        durable, usable checkpoint exists; its id is attached to the payload
        for the executor/provider to consume.  A cancelling run is completed
        as cancelled so it cannot become a permanent ghost task.  Queued and
        paused runs are already durable waiting states and are left untouched.
        """
        self.initialize()
        recovered: list[dict[str, Any]] = []
        volatile = {
            RunStatus.PREPARING,
            RunStatus.RUNNING,
            RunStatus.FINALIZING,
            RunStatus.CANCELLING,
        }
        with self._connection(write=True) as conn:
            rows = conn.execute(
                "SELECT * FROM runs WHERE status IN (?, ?, ?, ?)",
                tuple(status.value for status in volatile),
            ).fetchall()
            for row in rows:
                payload = _json(row["payload"])
                previous = self._canonical_status(row["status"])
                policy = str(payload.get("recovery_policy") or "block").strip().lower()
                if previous == RunStatus.CANCELLING:
                    target = RunStatus.CANCELLED
                    reason = "cancel_completed_after_restart"
                    recovery_data = {"from": previous, "to": target, "reason": reason}
                elif policy == "resume":
                    checkpoint = self._latest_checkpoint_tx(conn, row["run_id"])
                    if checkpoint is None:
                        target = RunStatus.BLOCKED
                        reason = "resume_checkpoint_missing_after_restart"
                        recovery_data = {"from": previous, "to": target, "reason": reason}
                        payload["error"] = {
                            "kind": "resume_checkpoint_missing",
                            "message": "Run requested checkpoint resume but no usable checkpoint was found",
                            "recoverable": False,
                        }
                    else:
                        target = RunStatus.QUEUED
                        reason = "resumed_from_checkpoint_after_restart"
                        payload["resume_checkpoint_id"] = checkpoint["checkpoint_id"]
                        payload["resume_checkpoint_state"] = checkpoint.get("state") or "ready"
                        recovery_data = {
                            "from": previous,
                            "to": target,
                            "reason": reason,
                            "checkpoint_id": checkpoint["checkpoint_id"],
                        }
                elif policy == "requeue":
                    target = RunStatus.QUEUED
                    reason = "requeued_after_restart"
                    recovery_data = {"from": previous, "to": target, "reason": reason}
                else:
                    target = RunStatus.BLOCKED
                    reason = "executor_interrupted_by_restart"
                    recovery_data = {"from": previous, "to": target, "reason": reason}
                    payload["error"] = {
                        "kind": "executor_interrupted",
                        "message": "Run execution was interrupted by a service restart",
                        "recoverable": True,
                    }
                now = _now()
                payload["status"] = target
                payload["updated_at"] = now
                if target in {RunStatus.CANCELLED, RunStatus.BLOCKED}:
                    payload["finished_at"] = now
                conn.execute(
                    "UPDATE runs SET status=?, phase=?, progress=?, payload=?, updated_at=? WHERE run_id=?",
                    (
                        target,
                        payload.get("phase") or "",
                        _bounded_progress(payload.get("progress")),
                        _encode_json(payload, field="run"),
                        now,
                        row["run_id"],
                    ),
                )
                event = self._append_event_tx(
                    conn,
                    row["run_id"],
                    "run.recovered",
                    recovery_data,
                )
                updated = self._own_row(conn, row["run_id"])
                assert updated is not None
                item = self._row_detail(updated, conn)
                item["event"] = event
                recovered.append(item)
        return recovered

    # The transition table is deliberately kept in the repository so every
    # producer (HTTP, a future queue worker, or a domain provider) gets the
    # same server-side lifecycle validation.  Terminal states are immutable.
    _ALLOWED_TRANSITIONS: dict[str, frozenset[str]] = {
        RunStatus.DRAFT: frozenset({RunStatus.QUEUED, RunStatus.CANCELLED}),
        RunStatus.QUEUED: frozenset({RunStatus.PREPARING, RunStatus.RUNNING, RunStatus.PAUSED, RunStatus.CANCELLING, RunStatus.CANCELLED, RunStatus.FAILED, RunStatus.BLOCKED}),
        RunStatus.PREPARING: frozenset({RunStatus.RUNNING, RunStatus.CANCELLING, RunStatus.CANCELLED, RunStatus.FAILED, RunStatus.BLOCKED}),
        RunStatus.RUNNING: frozenset({RunStatus.FINALIZING, RunStatus.PAUSED, RunStatus.CANCELLING, RunStatus.RETRY_WAIT, RunStatus.SUCCEEDED, RunStatus.FAILED, RunStatus.BLOCKED}),
        RunStatus.FINALIZING: frozenset({RunStatus.SUCCEEDED, RunStatus.CANCELLING, RunStatus.CANCELLED, RunStatus.FAILED, RunStatus.BLOCKED}),
        RunStatus.PAUSED: frozenset({RunStatus.QUEUED, RunStatus.RUNNING, RunStatus.CANCELLING, RunStatus.CANCELLED, RunStatus.FAILED}),
        RunStatus.CANCELLING: frozenset({RunStatus.CANCELLED, RunStatus.FAILED}),
        RunStatus.RETRY_WAIT: frozenset({RunStatus.QUEUED, RunStatus.RUNNING, RunStatus.CANCELLED, RunStatus.FAILED}),
        RunStatus.SUCCEEDED: frozenset(),
        RunStatus.CANCELLED: frozenset(),
        RunStatus.FAILED: frozenset(),
        RunStatus.BLOCKED: frozenset(),
    }

    @staticmethod
    def _canonical_status(value: Any, *, default: str | None = None) -> str:
        candidate = str(value if value is not None else (default or "")).strip().lower()
        try:
            return RunStatus(candidate).value
        except ValueError as exc:
            raise ValueError(f"Unsupported run status: {candidate or '<empty>'}") from exc

    def _own_row(self, conn: sqlite3.Connection, run_id: str) -> sqlite3.Row | None:
        return conn.execute("SELECT * FROM runs WHERE run_id = ?", (run_id,)).fetchone()

    @staticmethod
    def _ensure_native_run(conn: sqlite3.Connection, run_id: str) -> None:
        if run_id.startswith("ugsci:"):
            raise ValueError("legacy runs are read-only")
        if conn.execute(
            "SELECT 1 FROM runs WHERE run_id = ? LIMIT 1", (run_id,)
        ).fetchone() is None:
            raise KeyError(run_id)

    @staticmethod
    def _canonical_stage_status(value: Any) -> str:
        candidate = str(value or StageStatus.PENDING).strip().lower()
        try:
            return StageStatus(candidate).value
        except ValueError as exc:
            raise ValueError(
                f"Unsupported stage status: {candidate or '<empty>'}"
            ) from exc

    @staticmethod
    def _normalize_artifact(artifact: Any) -> dict[str, Any]:
        if hasattr(artifact, "to_dict"):
            artifact = artifact.to_dict()
        if not isinstance(artifact, dict):
            raise ValueError("artifact must be a JSON object")
        value = dict(artifact)
        ref_id = str(value.get("ref_id") or value.get("artifact_id") or "").strip()
        if not ref_id:
            raise ValueError("artifact ref_id is required")
        size_bytes = value.get("size_bytes")
        if size_bytes is not None:
            try:
                size_bytes = int(size_bytes)
            except (TypeError, ValueError) as exc:
                raise ValueError("artifact size_bytes must be an integer") from exc
            if size_bytes < 0:
                raise ValueError("artifact size_bytes cannot be negative")
        metadata = value.get("metadata") or {}
        if not isinstance(metadata, dict):
            raise ValueError("artifact metadata must be an object")
        _encode_json(metadata, field="artifact metadata")
        return {
            "ref_id": ref_id,
            "kind": str(value.get("kind") or "artifact"),
            "uri": str(value.get("uri") or ""),
            "media_type": value.get("media_type"),
            "sha256": value.get("sha256"),
            "size_bytes": size_bytes,
            "metadata": dict(metadata),
        }

    @classmethod
    def _normalize_stage(cls, stage: Any) -> dict[str, Any]:
        if hasattr(stage, "to_dict"):
            stage = stage.to_dict()
        if not isinstance(stage, dict):
            raise ValueError("stage must be a JSON object")
        value = dict(stage)
        stage_id = str(value.get("stage_id") or "").strip()
        operation = str(value.get("operation") or "").strip()
        if not stage_id or not operation:
            raise ValueError("stage_id and operation are required")
        progress = value.get("progress")
        if progress is not None:
            try:
                progress = float(progress)
            except (TypeError, ValueError, OverflowError) as exc:
                raise ValueError(
                    "stage progress must be a finite number between 0 and 1"
                ) from exc
            if not math.isfinite(progress) or not 0 <= progress <= 1:
                raise ValueError("stage progress must be a finite number between 0 and 1")
        try:
            attempt = int(value.get("attempt") or 0)
            ordinal = int(value.get("ordinal") or 0)
        except (TypeError, ValueError) as exc:
            raise ValueError("stage attempt and ordinal must be integers") from exc
        if attempt < 0 or ordinal < 0:
            raise ValueError("stage attempt and ordinal cannot be negative")
        for field_name in ("input_refs", "output_refs"):
            refs = value.get(field_name) or []
            if not isinstance(refs, (list, tuple)):
                raise ValueError(f"stage {field_name} must be an array")
            value[field_name] = [cls._normalize_artifact(ref) for ref in refs]
        checkpoint_ref = value.get("checkpoint_ref")
        if checkpoint_ref is not None:
            value["checkpoint_ref"] = cls._normalize_artifact(checkpoint_ref)
        metrics = value.get("metrics") or {}
        warnings = value.get("warnings") or []
        if not isinstance(metrics, dict):
            raise ValueError("stage metrics must be an object")
        if not isinstance(warnings, (list, tuple)):
            raise ValueError("stage warnings must be an array")
        normalized = {
            **value,
            "stage_id": stage_id,
            "operation": operation,
            "status": cls._canonical_stage_status(value.get("status")),
            "progress": progress,
            "attempt": attempt,
            "ordinal": ordinal,
            "metrics": dict(metrics),
            "warnings": [str(warning) for warning in warnings],
        }
        _encode_json(normalized, field="stage")
        return normalized

    def _row_detail(
        self,
        row: sqlite3.Row,
        conn: sqlite3.Connection | None = None,
    ) -> dict[str, Any]:
        payload = _json(row["payload"])
        item = run_summary(
            row["run_id"],
            operation=row["operation"],
            status=row["status"],
            payload={**payload, "created_at": row["created_at"], "updated_at": row["updated_at"]},
        )
        item["payload"] = payload
        if conn is None:
            with self._connection() as own_conn:
                self._hydrate_components(own_conn, item)
        else:
            self._hydrate_components(conn, item)
        return item

    def _hydrate_components(
        self,
        conn: sqlite3.Connection,
        item: dict[str, Any],
    ) -> None:
        run_id = item["run_id"]
        stages = self._list_stages_tx(conn, run_id)
        artifacts = self._list_artifacts_tx(conn, run_id)
        provenance = self._list_provenance_tx(conn, run_id)
        checkpoints = self._list_checkpoints_tx(conn, run_id)
        item["stages"] = stages
        item["artifacts"] = artifacts
        item["provenance"] = next(
            (entry for entry in provenance if entry["artifact_ref_id"] is None),
            None,
        )
        item["provenance_records"] = provenance
        item["checkpoints"] = checkpoints
        payload = item.get("payload")
        if isinstance(payload, dict):
            payload["stages"] = stages
            payload["artifacts"] = artifacts
            payload["provenance"] = item["provenance"]
            payload["provenance_records"] = provenance
            payload["checkpoints"] = checkpoints

    @classmethod
    def _artifact_row(cls, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "ref_id": row["ref_id"],
            "kind": row["kind"],
            "uri": row["uri"],
            "media_type": row["media_type"],
            "sha256": row["sha256"],
            "size_bytes": row["size_bytes"],
            "metadata": _json(row["metadata"]),
            "run_id": row["run_id"],
            "stage_id": row["stage_id"] or None,
            "role": row["role"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }

    def _upsert_artifact_tx(
        self,
        conn: sqlite3.Connection,
        run_id: str,
        artifact: Any,
        *,
        stage_id: str | None = None,
        role: str = "output",
        timestamp: str | None = None,
    ) -> dict[str, Any]:
        value = self._normalize_artifact(artifact)
        normalized_stage = str(stage_id or "").strip()
        normalized_role = str(role or "").strip()
        if not normalized_role:
            raise ValueError("artifact role is required")
        now = timestamp or _now()
        conn.execute(
            "INSERT INTO run_artifacts "
            "(run_id, ref_id, stage_id, role, kind, uri, media_type, sha256, "
            "size_bytes, metadata, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
            "ON CONFLICT(run_id, ref_id, stage_id, role) DO UPDATE SET "
            "kind=excluded.kind, uri=excluded.uri, media_type=excluded.media_type, "
            "sha256=excluded.sha256, size_bytes=excluded.size_bytes, "
            "metadata=excluded.metadata, updated_at=excluded.updated_at",
            (
                run_id,
                value["ref_id"],
                normalized_stage,
                normalized_role,
                value["kind"],
                value["uri"],
                value["media_type"],
                value["sha256"],
                value["size_bytes"],
                _encode_json(value["metadata"], field="artifact metadata"),
                now,
                now,
            ),
        )
        row = conn.execute(
            "SELECT * FROM run_artifacts WHERE run_id=? AND ref_id=? "
            "AND stage_id=? AND role=?",
            (run_id, value["ref_id"], normalized_stage, normalized_role),
        ).fetchone()
        assert row is not None
        return self._artifact_row(row)

    def _list_artifacts_tx(
        self,
        conn: sqlite3.Connection,
        run_id: str,
        *,
        stage_id: str | None = None,
        role: str | None = None,
    ) -> list[dict[str, Any]]:
        clauses = ["run_id = ?"]
        values: list[Any] = [run_id]
        if stage_id is not None:
            clauses.append("stage_id = ?")
            values.append(str(stage_id).strip())
        if role is not None:
            clauses.append("role = ?")
            values.append(str(role).strip())
        rows = conn.execute(
            "SELECT * FROM run_artifacts WHERE " + " AND ".join(clauses)
            + " ORDER BY stage_id, role, ref_id",
            values,
        ).fetchall()
        return [self._artifact_row(row) for row in rows]

    @staticmethod
    def _stage_row(row: sqlite3.Row) -> dict[str, Any]:
        payload = _json(row["payload"])
        return {
            **payload,
            "run_id": row["run_id"],
            "stage_id": row["stage_id"],
            "ordinal": int(row["ordinal"]),
            "operation": row["operation"],
            "status": row["status"],
            "progress": row["progress"],
            "attempt": int(row["attempt"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }

    def _list_stages_tx(
        self, conn: sqlite3.Connection, run_id: str
    ) -> list[dict[str, Any]]:
        rows = conn.execute(
            "SELECT * FROM run_stages WHERE run_id=? ORDER BY ordinal, stage_id",
            (run_id,),
        ).fetchall()
        return [self._stage_row(row) for row in rows]

    def _upsert_stage_tx(
        self,
        conn: sqlite3.Connection,
        run_id: str,
        stage: Any,
        *,
        emit_event: bool = True,
    ) -> dict[str, Any]:
        value = self._normalize_stage(stage)
        existing = conn.execute(
            "SELECT 1 FROM run_stages WHERE run_id=? AND stage_id=?",
            (run_id, value["stage_id"]),
        ).fetchone()
        now = _now()
        conn.execute(
            "INSERT INTO run_stages "
            "(run_id, stage_id, ordinal, operation, status, progress, attempt, "
            "payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
            "ON CONFLICT(run_id, stage_id) DO UPDATE SET ordinal=excluded.ordinal, "
            "operation=excluded.operation, status=excluded.status, "
            "progress=excluded.progress, attempt=excluded.attempt, "
            "payload=excluded.payload, updated_at=excluded.updated_at",
            (
                run_id,
                value["stage_id"],
                value["ordinal"],
                value["operation"],
                value["status"],
                value["progress"],
                value["attempt"],
                _encode_json(value, field="stage"),
                now,
                now,
            ),
        )
        conn.execute(
            "DELETE FROM run_artifacts WHERE run_id=? AND stage_id=? "
            "AND role IN ('input', 'output', 'checkpoint')",
            (run_id, value["stage_id"]),
        )
        for artifact in value["input_refs"]:
            self._upsert_artifact_tx(
                conn, run_id, artifact, stage_id=value["stage_id"], role="input", timestamp=now
            )
        for artifact in value["output_refs"]:
            self._upsert_artifact_tx(
                conn, run_id, artifact, stage_id=value["stage_id"], role="output", timestamp=now
            )
        if value.get("checkpoint_ref"):
            self._upsert_artifact_tx(
                conn,
                run_id,
                value["checkpoint_ref"],
                stage_id=value["stage_id"],
                role="checkpoint",
                timestamp=now,
            )
        if emit_event:
            self._append_event_tx(
                conn,
                run_id,
                "stage.updated" if existing else "stage.created",
                {
                    "status": value["status"],
                    "progress": value["progress"],
                    "attempt": value["attempt"],
                },
                stage_id=value["stage_id"],
            )
        row = conn.execute(
            "SELECT * FROM run_stages WHERE run_id=? AND stage_id=?",
            (run_id, value["stage_id"]),
        ).fetchone()
        assert row is not None
        return self._stage_row(row)

    @staticmethod
    def _checkpoint_row(row: sqlite3.Row) -> dict[str, Any]:
        artifact_ref = _json(row["artifact_ref"]) if row["artifact_ref"] else None
        return {
            "checkpoint_id": row["checkpoint_id"],
            "run_id": row["run_id"],
            "stage_id": row["stage_id"] or None,
            "artifact_ref": artifact_ref,
            "state": row["state"],
            "resume_token": row["resume_token"],
            "metadata": _json(row["metadata"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }

    def _list_checkpoints_tx(
        self, conn: sqlite3.Connection, run_id: str
    ) -> list[dict[str, Any]]:
        rows = conn.execute(
            "SELECT * FROM run_checkpoints WHERE run_id=? "
            "ORDER BY created_at DESC, checkpoint_id",
            (run_id,),
        ).fetchall()
        return [self._checkpoint_row(row) for row in rows]

    @classmethod
    def _latest_checkpoint_tx(
        cls,
        conn: sqlite3.Connection,
        run_id: str,
    ) -> dict[str, Any] | None:
        """Select the newest checkpoint that can be used for recovery."""
        rows = conn.execute(
            "SELECT * FROM run_checkpoints WHERE run_id=? "
            "ORDER BY created_at DESC, checkpoint_id",
            (run_id,),
        ).fetchall()
        for row in rows:
            value = cls._checkpoint_row(row)
            if str(value.get("state") or "").strip().lower() in {
                "invalid", "deleted", "failed", "aborted",
            }:
                continue
            return value
        return None

    @staticmethod
    def _provenance_row(row: sqlite3.Row) -> dict[str, Any]:
        return {
            "provenance_id": row["provenance_id"],
            "run_id": row["run_id"],
            "artifact_ref_id": row["artifact_ref_id"] or None,
            "input_fingerprint": row["input_fingerprint"],
            "provider_id": row["provider_id"],
            "provider_version": row["provider_version"],
            "software_version": row["software_version"],
            "unit_system": row["unit_system"],
            "coordinate_system": row["coordinate_system"],
            "metadata": _json(row["metadata"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }

    def _list_provenance_tx(
        self, conn: sqlite3.Connection, run_id: str
    ) -> list[dict[str, Any]]:
        rows = conn.execute(
            "SELECT * FROM run_provenance WHERE run_id=? "
            "ORDER BY artifact_ref_id, created_at",
            (run_id,),
        ).fetchall()
        return [self._provenance_row(row) for row in rows]

    def _upsert_provenance_tx(
        self,
        conn: sqlite3.Connection,
        run_id: str,
        provenance: Any,
        *,
        artifact_ref_id: str | None = None,
    ) -> dict[str, Any]:
        if hasattr(provenance, "to_dict"):
            provenance = provenance.to_dict()
        if not isinstance(provenance, dict):
            raise ValueError("provenance must be a JSON object")
        value = dict(provenance)
        artifact_id = str(
            artifact_ref_id
            if artifact_ref_id is not None
            else value.get("artifact_ref_id") or ""
        ).strip()
        if artifact_id and conn.execute(
            "SELECT 1 FROM run_artifacts WHERE run_id=? AND ref_id=? LIMIT 1",
            (run_id, artifact_id),
        ).fetchone() is None:
            raise ValueError(f"Artifact not found for provenance: {artifact_id}")
        metadata = value.get("metadata") or {}
        if not isinstance(metadata, dict):
            raise ValueError("provenance metadata must be an object")
        encoded_metadata = _encode_json(metadata, field="provenance metadata")
        existing = conn.execute(
            "SELECT provenance_id, created_at FROM run_provenance "
            "WHERE run_id=? AND artifact_ref_id=?",
            (run_id, artifact_id),
        ).fetchone()
        provenance_id = str(value.get("provenance_id") or "").strip()
        if not provenance_id:
            provenance_id = existing["provenance_id"] if existing else uuid.uuid4().hex
        now = _now()
        created_at = existing["created_at"] if existing else str(value.get("created_at") or now)
        conn.execute(
            "INSERT INTO run_provenance "
            "(provenance_id, run_id, artifact_ref_id, input_fingerprint, provider_id, "
            "provider_version, software_version, unit_system, coordinate_system, "
            "metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
            "ON CONFLICT(run_id, artifact_ref_id) DO UPDATE SET "
            "input_fingerprint=excluded.input_fingerprint, provider_id=excluded.provider_id, "
            "provider_version=excluded.provider_version, software_version=excluded.software_version, "
            "unit_system=excluded.unit_system, coordinate_system=excluded.coordinate_system, "
            "metadata=excluded.metadata, updated_at=excluded.updated_at",
            (
                provenance_id,
                run_id,
                artifact_id,
                value.get("input_fingerprint"),
                value.get("provider_id"),
                value.get("provider_version"),
                value.get("software_version"),
                value.get("unit_system"),
                value.get("coordinate_system"),
                encoded_metadata,
                created_at,
                now,
            ),
        )
        row = conn.execute(
            "SELECT * FROM run_provenance WHERE run_id=? AND artifact_ref_id=?",
            (run_id, artifact_id),
        ).fetchone()
        assert row is not None
        return self._provenance_row(row)

    def list_stages(self, run_id: str) -> list[dict[str, Any]]:
        self.initialize()
        with self._connection() as conn:
            native = self._own_row(conn, run_id) is not None
            if native:
                return self._list_stages_tx(conn, run_id)
        item = self.get_run(run_id)
        if item is None:
            raise KeyError(run_id)
        stages = item.get("stages") or []
        return [dict(stage) for stage in stages if isinstance(stage, dict)]

    def upsert_stage(self, run_id: str, stage: Any) -> dict[str, Any]:
        self.initialize()
        with self._connection(write=True) as conn:
            self._ensure_native_run(conn, run_id)
            return self._upsert_stage_tx(conn, run_id, stage)

    def list_artifacts(
        self,
        run_id: str,
        *,
        stage_id: str | None = None,
        role: str | None = None,
    ) -> list[dict[str, Any]]:
        self.initialize()
        with self._connection() as conn:
            native = self._own_row(conn, run_id) is not None
            if native:
                return self._list_artifacts_tx(
                    conn, run_id, stage_id=stage_id, role=role
                )
        item = self.get_run(run_id)
        if item is None:
            raise KeyError(run_id)
        artifacts = item.get("artifacts") or []
        result = [dict(entry) for entry in artifacts if isinstance(entry, dict)]
        if stage_id is not None:
            result = [entry for entry in result if entry.get("stage_id") == stage_id]
        if role is not None:
            result = [entry for entry in result if entry.get("role") == role]
        return result

    def add_artifact(
        self,
        run_id: str,
        artifact: Any,
        *,
        stage_id: str | None = None,
        role: str = "output",
    ) -> dict[str, Any]:
        self.initialize()
        with self._connection(write=True) as conn:
            self._ensure_native_run(conn, run_id)
            if stage_id and conn.execute(
                "SELECT 1 FROM run_stages WHERE run_id=? AND stage_id=? LIMIT 1",
                (run_id, stage_id),
            ).fetchone() is None:
                raise ValueError(f"Stage not found for artifact: {stage_id}")
            result = self._upsert_artifact_tx(
                conn, run_id, artifact, stage_id=stage_id, role=role
            )
            self._append_event_tx(
                conn,
                run_id,
                "artifact.ready",
                {"artifact": result, "role": role},
                stage_id=stage_id,
            )
            return result

    def list_checkpoints(self, run_id: str) -> list[dict[str, Any]]:
        self.initialize()
        with self._connection() as conn:
            if self._own_row(conn, run_id) is None:
                if run_id.startswith("ugsci:") or self.get_run(run_id) is not None:
                    return []
                raise KeyError(run_id)
            return self._list_checkpoints_tx(conn, run_id)

    def get_checkpoint(self, checkpoint_id: str) -> dict[str, Any] | None:
        """Return one durable checkpoint by id.

        Checkpoint ids are opaque provider values.  Looking them up through
        the repository (rather than carrying the whole snapshot in a Run
        payload) keeps restart recovery small and lets object-backed artifact
        references remain the source of truth.
        """
        normalized = str(checkpoint_id or "").strip()
        if not normalized:
            return None
        self.initialize()
        with self._connection() as conn:
            row = conn.execute(
                "SELECT * FROM run_checkpoints WHERE checkpoint_id=?",
                (normalized,),
            ).fetchone()
            return self._checkpoint_row(row) if row is not None else None

    def latest_checkpoint(
        self,
        run_id: str,
        *,
        stage_id: str | None = None,
    ) -> dict[str, Any] | None:
        """Return the newest usable checkpoint for a Run or stage."""
        checkpoints = self.list_checkpoints(run_id)
        normalized_stage = str(stage_id or "").strip() or None
        for checkpoint in checkpoints:
            if normalized_stage is not None and checkpoint.get("stage_id") != normalized_stage:
                continue
            state = str(checkpoint.get("state") or "").strip().lower()
            # Invalid/deleted checkpoints must never be selected for an
            # automatic restart.  Unknown provider states remain usable so
            # providers can add their own ready-like state without upgrading
            # Run Center first.
            if state in {"invalid", "deleted", "failed", "aborted"}:
                continue
            return checkpoint
        return None

    def mark_resume_requested(
        self,
        run_id: str,
        checkpoint_id: str | None = None,
    ) -> dict[str, Any] | None:
        """Bind the next execution attempt to the newest usable checkpoint.

        This marker is deliberately stored in the Run payload so a queued
        resume survives worker and service restarts.  Returning ``None`` means
        the Run has no checkpoint and may still be resumed from the beginning.
        """
        self.initialize()
        with self._connection(write=True) as conn:
            row = self._own_row(conn, run_id)
            if row is None:
                raise KeyError(run_id)
            checkpoint = None
            requested_id = str(checkpoint_id or "").strip()
            if requested_id:
                row_checkpoint = conn.execute(
                    "SELECT * FROM run_checkpoints WHERE checkpoint_id=? AND run_id=?",
                    (requested_id, run_id),
                ).fetchone()
                if row_checkpoint is None:
                    raise ValueError("Checkpoint not found for Run")
                checkpoint = self._checkpoint_row(row_checkpoint)
                if str(checkpoint.get("state") or "").strip().lower() in {
                    "invalid", "deleted", "failed", "aborted",
                }:
                    raise ValueError("Checkpoint is not usable for resume")
            else:
                checkpoint = self._latest_checkpoint_tx(conn, run_id)
            if checkpoint is None:
                return None
            payload = _json(row["payload"])
            payload["resume_requested"] = True
            payload["resume_checkpoint_id"] = checkpoint["checkpoint_id"]
            payload["resume_checkpoint_state"] = checkpoint.get("state") or "ready"
            now = _now()
            payload["updated_at"] = now
            conn.execute(
                "UPDATE runs SET payload=?, updated_at=? WHERE run_id=?",
                (_encode_json(payload, field="run"), now, run_id),
            )
            self._append_event_tx(
                conn,
                run_id,
                "run.resume_requested",
                {"checkpoint_id": checkpoint["checkpoint_id"]},
            )
            updated = self._own_row(conn, run_id)
            assert updated is not None
            return self._row_detail(updated, conn)

    def create_checkpoint(
        self,
        run_id: str,
        checkpoint: Any,
    ) -> dict[str, Any]:
        if hasattr(checkpoint, "to_dict"):
            checkpoint = checkpoint.to_dict()
        if not isinstance(checkpoint, dict):
            raise ValueError("checkpoint must be a JSON object")
        value = dict(checkpoint)
        checkpoint_id = str(value.get("checkpoint_id") or "").strip() or uuid.uuid4().hex
        stage_id = str(value.get("stage_id") or "").strip()
        state = str(value.get("state") or "ready").strip()
        if not state:
            raise ValueError("checkpoint state is required")
        metadata = value.get("metadata") or {}
        if not isinstance(metadata, dict):
            raise ValueError("checkpoint metadata must be an object")
        artifact_ref = value.get("artifact_ref")
        if artifact_ref is not None:
            artifact_ref = self._normalize_artifact(artifact_ref)
        now = _now()
        self.initialize()
        with self._connection(write=True) as conn:
            self._ensure_native_run(conn, run_id)
            if stage_id and conn.execute(
                "SELECT 1 FROM run_stages WHERE run_id=? AND stage_id=? LIMIT 1",
                (run_id, stage_id),
            ).fetchone() is None:
                raise ValueError(f"Stage not found for checkpoint: {stage_id}")
            if conn.execute(
                "SELECT 1 FROM run_checkpoints WHERE checkpoint_id=?",
                (checkpoint_id,),
            ).fetchone() is not None:
                raise ValueError(f"Checkpoint already exists: {checkpoint_id}")
            if artifact_ref is not None:
                self._upsert_artifact_tx(
                    conn,
                    run_id,
                    artifact_ref,
                    stage_id=stage_id,
                    role="checkpoint",
                    timestamp=now,
                )
            conn.execute(
                "INSERT INTO run_checkpoints "
                "(checkpoint_id, run_id, stage_id, artifact_ref, state, resume_token, "
                "metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    checkpoint_id,
                    run_id,
                    stage_id,
                    _encode_json(artifact_ref, field="checkpoint artifact_ref")
                    if artifact_ref is not None
                    else None,
                    state,
                    value.get("resume_token"),
                    _encode_json(metadata, field="checkpoint metadata"),
                    str(value.get("created_at") or now),
                    now,
                ),
            )
            self._append_event_tx(
                conn,
                run_id,
                "checkpoint.created",
                {"checkpoint_id": checkpoint_id, "state": state},
                stage_id=stage_id or None,
            )
            row = conn.execute(
                "SELECT * FROM run_checkpoints WHERE checkpoint_id=?",
                (checkpoint_id,),
            ).fetchone()
            assert row is not None
            return self._checkpoint_row(row)

    def list_provenance(self, run_id: str) -> list[dict[str, Any]]:
        self.initialize()
        with self._connection() as conn:
            if self._own_row(conn, run_id) is None:
                item = self.get_run(run_id)
                if item is None:
                    raise KeyError(run_id)
                provenance = item.get("provenance")
                return [dict(provenance)] if isinstance(provenance, dict) else []
            return self._list_provenance_tx(conn, run_id)

    def upsert_provenance(
        self,
        run_id: str,
        provenance: Any,
        *,
        artifact_ref_id: str | None = None,
    ) -> dict[str, Any]:
        self.initialize()
        with self._connection(write=True) as conn:
            self._ensure_native_run(conn, run_id)
            result = self._upsert_provenance_tx(
                conn, run_id, provenance, artifact_ref_id=artifact_ref_id
            )
            self._append_event_tx(
                conn,
                run_id,
                "provenance.updated",
                {
                    "provenance_id": result["provenance_id"],
                    "artifact_ref_id": result["artifact_ref_id"],
                },
            )
            return result

    def create_run(
        self,
        run: dict[str, Any] | Any,
        *,
        idempotency_key: str | None = None,
    ) -> dict[str, Any]:
        """Persist a new native Run and return its canonical detail shape.

        ``run`` accepts a JSON dictionary (the HTTP contract) or a Run-like
        object exposing ``to_dict``.  This keeps the repository independent of
        FastAPI/Pydantic while allowing providers to use the public dataclass.
        """
        if hasattr(run, "to_dict"):
            payload = dict(run.to_dict())
        elif isinstance(run, dict):
            payload = dict(run)
        else:
            raise ValueError("run must be a JSON object")
        operation = str(payload.get("operation") or "").strip()
        if not operation:
            raise ValueError("operation is required")
        run_id = str(payload.get("run_id") or "").strip() or uuid.uuid4().hex
        if run_id.startswith("ugsci:"):
            raise ValueError("native run_id cannot use the ugsci namespace")
        idem = idempotency_key if idempotency_key is not None else payload.get("idempotency_key")
        if idem is not None:
            idem = str(idem).strip() or None
        if idem is not None:
            payload["idempotency_key"] = idem
        else:
            payload.pop("idempotency_key", None)
        status = self._canonical_status(payload.get("status"), default=RunStatus.DRAFT)
        payload["progress"] = _bounded_progress(payload.get("progress"))
        payload["run_id"] = run_id
        payload["operation"] = operation
        payload["status"] = status
        now = _now()
        created_at = str(payload.get("created_at") or now)
        updated_at = str(payload.get("updated_at") or created_at)
        payload["created_at"] = created_at
        payload["updated_at"] = updated_at
        self.initialize()
        with self._connection(write=True) as conn:
            if idem:
                existing = conn.execute(
                    "SELECT * FROM runs WHERE idempotency_key = ? LIMIT 1",
                    (idem,),
                ).fetchone()
                if existing is not None:
                    return self._row_detail(existing, conn)
            if self._own_row(conn, run_id) is not None:
                raise ValueError(f"Run already exists: {run_id}")
            conn.execute(
                "INSERT INTO runs (run_id, operation, status, phase, progress, project_id, parent_run_id, model_version_id, study_id, idempotency_key, payload, created_at, updated_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    run_id,
                    operation,
                    status,
                    str(payload.get("phase") or ""),
                    payload.get("progress"),
                    payload.get("project_id"),
                    payload.get("parent_run_id"),
                    payload.get("model_version_id"),
                    payload.get("study_id"),
                    idem,
                    _encode_json(payload, label="run"),
                    created_at,
                    updated_at,
                ),
            )
            stages = payload.get("stages") or []
            artifacts = payload.get("artifacts") or []
            provenance = payload.get("provenance")
            if not isinstance(stages, (list, tuple)):
                raise ValueError("stages must be an array")
            if not isinstance(artifacts, (list, tuple)):
                raise ValueError("artifacts must be an array")
            for ordinal, stage in enumerate(stages):
                stage_value = (
                    {**stage, "ordinal": stage.get("ordinal", ordinal)}
                    if isinstance(stage, dict)
                    else stage
                )
                self._upsert_stage_tx(
                    conn, run_id, stage_value, emit_event=False
                )
            for artifact in artifacts:
                if not isinstance(artifact, dict):
                    raise ValueError("artifacts must contain objects")
                self._upsert_artifact_tx(
                    conn,
                    run_id,
                    artifact,
                    stage_id=artifact.get("stage_id"),
                    role=str(artifact.get("role") or "output"),
                )
            if provenance is not None:
                self._upsert_provenance_tx(conn, run_id, provenance)
            self._append_event_tx(conn, run_id, "run.created", {"status": status})
            row = self._own_row(conn, run_id)
            assert row is not None
            return self._row_detail(row, conn)

    def _append_event_tx(
        self,
        conn: sqlite3.Connection,
        run_id: str,
        event_type: str,
        data: dict[str, Any] | None = None,
        *,
        stage_id: str | None = None,
        created_at: str | None = None,
    ) -> dict[str, Any]:
        if not isinstance(event_type, str) or not event_type.strip():
            raise ValueError("event_type is required")
        event_type = event_type.strip()
        next_seq = int(conn.execute("SELECT COALESCE(MAX(sequence), 0) + 1 FROM run_events WHERE run_id = ?", (run_id,)).fetchone()[0])
        event_data = dict(data or {})
        if stage_id is not None:
            event_data.setdefault("stage_id", stage_id)
        timestamp = created_at or _now()
        conn.execute(
            "INSERT INTO run_events (run_id, sequence, event_type, payload, created_at) VALUES (?, ?, ?, ?, ?)",
            (run_id, next_seq, event_type, _encode_json(event_data, label="event data"), timestamp),
        )
        # Event activity is part of the run's observable freshness.  Updating
        # this in the same transaction keeps list ordering deterministic when
        # workers append logs/progress events without a status transition.
        # A replayed/late event may carry an old timestamp.  Event ordering is
        # governed by sequence; run freshness must never move backwards.
        freshness = _now()
        conn.execute(
            "UPDATE runs SET updated_at = CASE WHEN updated_at > ? THEN updated_at ELSE ? END "
            "WHERE run_id = ?",
            (freshness, freshness, run_id),
        )
        return {"run_id": run_id, "sequence": next_seq, "seq": next_seq, "type": event_type, "event_type": event_type, "data": event_data, "created_at": timestamp}

    def append_event(
        self,
        run_id: str,
        event_type: str,
        data: dict[str, Any] | None = None,
        *,
        stage_id: str | None = None,
        created_at: str | None = None,
    ) -> dict[str, Any]:
        """Append one event atomically and allocate its sequence server-side."""
        if run_id.startswith("ugsci:"):
            raise ValueError("legacy runs are read-only")
        self.initialize()
        with self._connection(write=True) as conn:
            row = self._own_row(conn, run_id)
            if row is None:
                raise KeyError(run_id)
            current = self._canonical_status(row["status"])
            if current in TERMINAL_STATUSES:
                # Terminal runs are immutable.  In particular, reject events
                # emitted by a late worker after cancellation or completion.
                raise ValueError(f"Terminal run is immutable: {current}")
            return self._append_event_tx(conn, run_id, event_type, data, stage_id=stage_id, created_at=created_at)

    def transition(
        self,
        run_id: str,
        status: str,
        *,
        phase: str | None = None,
        progress: float | None = None,
        error: dict[str, Any] | None = None,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Apply a validated lifecycle transition and append its event atomically."""
        if run_id.startswith("ugsci:"):
            raise ValueError("legacy runs are read-only")
        target = self._canonical_status(status)
        self.initialize()
        with self._connection(write=True) as conn:
            row = self._own_row(conn, run_id)
            if row is None:
                raise KeyError(run_id)
            current = self._canonical_status(row["status"])
            if current in TERMINAL_STATUSES:
                if target != current:
                    raise ValueError(f"Invalid run transition: {current} -> {target}")
                raise ValueError(f"Terminal run is immutable: {current}")
            if target != current and target not in self._ALLOWED_TRANSITIONS.get(current, frozenset()):
                raise ValueError(f"Invalid run transition: {current} -> {target}")
            payload = _json(row["payload"])
            now = _now()
            payload["status"] = target
            payload["updated_at"] = now
            if phase is not None:
                payload["phase"] = phase
            if progress is not None:
                payload["progress"] = _bounded_progress(progress)
            if error is not None:
                payload["error"] = dict(error)
            if target in {RunStatus.RUNNING, RunStatus.PREPARING} and not payload.get("started_at"):
                payload["started_at"] = now
            if target in {RunStatus.SUCCEEDED, RunStatus.CANCELLED, RunStatus.FAILED, RunStatus.BLOCKED}:
                payload["finished_at"] = now
            conn.execute(
                "UPDATE runs SET status=?, phase=?, progress=?, payload=?, updated_at=? WHERE run_id=?",
                (target, payload.get("phase") or "", payload.get("progress"), _encode_json(payload, label="run"), now, run_id),
            )
            if target in TERMINAL_STATUSES:
                # Resource ownership follows the durable Run lifecycle.  A
                # provider or API caller may transition a Run directly to a
                # terminal state, so relying only on an executor ``finally``
                # block would leave an active lease behind after cancellation,
                # failure, or an administrative transition.
                conn.execute(
                    "UPDATE resource_leases SET state='released', released_at=? "
                    "WHERE run_id=? AND state='active'",
                    (now, run_id),
                )
            event = self._append_event_tx(conn, run_id, "run.status_changed", {"from": current, "to": target, **(data or {})})
            updated = self._own_row(conn, run_id)
            assert updated is not None
            result = self._row_detail(updated, conn)
            result["event"] = event
            return result

    def control(self, run_id: str, action: str) -> dict[str, Any]:
        """Apply a user-facing lifecycle action through the state machine."""
        action = str(action or "").strip().lower()
        if action == "pause":
            return self.transition(run_id, RunStatus.PAUSED)
        if action == "resume":
            return self.transition(run_id, RunStatus.QUEUED)
        if action == "cancel":
            current = self.get_run(run_id)
            if current is None:
                raise KeyError(run_id)
            state = current["status"]
            if state in {RunStatus.DRAFT, RunStatus.QUEUED, RunStatus.PAUSED, RunStatus.RETRY_WAIT}:
                return self.transition(run_id, RunStatus.CANCELLED)
            if state == RunStatus.CANCELLING:
                return self.transition(run_id, RunStatus.CANCELLED)
            if state in {RunStatus.PREPARING, RunStatus.RUNNING, RunStatus.FINALIZING}:
                return self.transition(run_id, RunStatus.CANCELLING)
            raise ValueError(f"Run cannot be cancelled from state: {state}")
        raise ValueError(f"Unsupported run control action: {action or '<empty>'}")

    def clone_run(
        self,
        run_id: str,
        *,
        idempotency_key: str | None = None,
        overrides: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Create a new draft Run from an immutable source snapshot."""
        source = self.get_run(run_id)
        if source is None:
            raise KeyError(run_id)
        if source.get("source") == "ugsci-legacy":
            raise ValueError("legacy runs are read-only")
        payload = dict(source.get("payload") or {})
        # A clone is a new request. Never inherit the source idempotency key,
        # otherwise create_run would correctly deduplicate it back to the
        # original Run instead of creating a child.
        payload.pop("idempotency_key", None)
        payload.update(dict(overrides or {}))
        payload.pop("run_id", None)
        payload["parent_run_id"] = run_id
        payload["status"] = RunStatus.DRAFT
        # A clone/retry is a fresh execution request.  Never inherit a
        # previous attempt's checkpoint selection, otherwise the new Run can
        # silently resume stale state from its parent.
        for key in (
            "resume_requested",
            "resume_checkpoint_id",
            "resume_checkpoint_state",
        ):
            payload.pop(key, None)
        payload.pop("created_at", None)
        payload.pop("updated_at", None)
        if idempotency_key is not None:
            payload["idempotency_key"] = idempotency_key
        return self.create_run(payload, idempotency_key=idempotency_key)

    def retry_run(
        self,
        run_id: str,
        *,
        idempotency_key: str | None = None,
    ) -> dict[str, Any]:
        """Retry a terminal run as a new immutable child Run.

        The original terminal record stays auditable; callers can use the
        returned child ``run_id`` to enqueue it when an executor is present.
        """
        source = self.get_run(run_id)
        if source is None:
            raise KeyError(run_id)
        if source.get("source") == "ugsci-legacy":
            raise ValueError("legacy runs are read-only")
        if source.get("status") not in {RunStatus.FAILED, RunStatus.BLOCKED, RunStatus.CANCELLED}:
            raise ValueError("Only failed, blocked, or cancelled runs can be retried")
        return self.clone_run(
            run_id,
            idempotency_key=idempotency_key,
            overrides={"retry_of": run_id, "retry_attempt": int((source.get("payload") or {}).get("retry_attempt") or 0) + 1},
        )

    def list_runs(
        self,
        *,
        status: str | None = None,
        operation: str | None = None,
        project_id: str | None = None,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        if limit <= 0:
            return []
        limit = min(limit, 500)
        if status:
            status = self._query_status(status)
        self.initialize()
        own = self._list_own_runs(status, operation, project_id, limit)
        legacy = self._list_legacy_runs(status, operation, project_id, limit)
        merged = {item["run_id"]: item for item in [*legacy, *own]}
        return sorted(
            merged.values(),
            key=lambda item: str(item.get("updated_at") or item.get("created_at") or ""),
            reverse=True,
        )[:limit]

    @staticmethod
    def _query_status(value: Any) -> str:
        """Normalize a user supplied status, rejecting typos explicitly."""
        candidate = str(value or "").strip().lower()
        legacy = {"completed", "success", "timeout", "error", "interrupted", "unknown"}
        if candidate in legacy:
            return normalize_legacy_status(candidate)
        try:
            return RunStatus(candidate).value
        except ValueError as exc:
            raise ValueError(f"Unsupported run status: {candidate or '<empty>'}") from exc

    def _list_own_runs(self, status, operation, project_id, limit) -> list[dict[str, Any]]:
        if limit <= 0:
            return []
        clauses: list[str] = []
        values: list[Any] = []
        if status:
            clauses.append("status = ?")
            values.append(status)
        if operation:
            clauses.append("operation = ?")
            values.append(operation)
        if project_id:
            clauses.append("project_id = ?")
            values.append(project_id)
        where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
        with self._connection() as conn:
            rows = conn.execute(
                f"SELECT * FROM runs{where} ORDER BY updated_at DESC LIMIT ?",
                [*values, min(limit, 500)],
            ).fetchall()
            result: list[dict[str, Any]] = []
            for row in rows:
                item = self._row_detail(row, conn)
                item.pop("payload", None)
                result.append(item)
            return result

    def _legacy_database(self) -> Path:
        return _working_dir() / "ugsci" / "jobs.sqlite3"

    def legacy_bridge_status(self) -> dict[str, Any]:
        """Return a non-sensitive health snapshot for the optional UGSci bridge."""
        database = self._legacy_database()
        if not database.is_file():
            return {"available": False, "database": "jobs.sqlite3", "last_error": None}
        try:
            with sqlite3.connect(database, timeout=2) as conn:
                conn.execute("SELECT 1 FROM jobs LIMIT 1").fetchone()
        except sqlite3.Error as exc:
            return {
                "available": False,
                "database": "jobs.sqlite3",
                "last_error": str(exc),
            }
        return {"available": True, "database": "jobs.sqlite3", "last_error": None}

    def _list_legacy_runs(self, status, operation, project_id, limit) -> list[dict[str, Any]]:
        database = self._legacy_database()
        if limit <= 0 or not database.is_file():
            return []
        try:
            with sqlite3.connect(database, timeout=2) as conn:
                conn.row_factory = sqlite3.Row
                # Apply SQL LIMIT for the common unfiltered listing.  When a
                # payload-level filter is present, scan all retained legacy
                # rows so matching jobs are not hidden behind newer rows that
                # fail the filter (the legacy store itself prunes history).
                query = "SELECT job_id, payload, updated_at FROM jobs ORDER BY updated_at DESC"
                params: tuple[Any, ...] = ()
                if not any((status, operation, project_id)):
                    query += " LIMIT ?"
                    params = (min(limit, 500),)
                rows = conn.execute(query, params).fetchall()
        except sqlite3.Error as exc:
            logger.debug("Legacy UGSci job store unavailable: %s", exc)
            return []
        result: list[dict[str, Any]] = []
        for row in rows:
            payload = _json(row["payload"])
            source_run_id = str(row["job_id"])
            item = run_summary(
                f"ugsci:{source_run_id}",
                operation=str(payload.get("operation") or "simulation.run"),
                status=str(payload.get("status") or "blocked"),
                payload={
                    **payload,
                    "created_at": payload.get("created_at") or row["updated_at"],
                    "updated_at": row["updated_at"],
                    "source_run_id": source_run_id,
                },
                source="ugsci-legacy",
            )
            if status and item["status"] != status:
                continue
            if operation and item["operation"] != operation:
                continue
            if project_id and item.get("project_id") != project_id:
                continue
            result.append(item)
            if len(result) >= limit:
                break
        return result

    def get_run(self, run_id: str) -> dict[str, Any] | None:
        self.initialize()
        with self._connection() as conn:
            row = conn.execute("SELECT * FROM runs WHERE run_id = ?", (run_id,)).fetchone()
        if row:
            return self._row_detail(row)
        source_run_id = run_id.removeprefix("ugsci:")
        database = self._legacy_database()
        if database.is_file():
            try:
                with sqlite3.connect(database, timeout=2) as conn:
                    conn.row_factory = sqlite3.Row
                    legacy = conn.execute(
                        "SELECT job_id, payload, updated_at FROM jobs WHERE job_id = ? LIMIT 1",
                        (source_run_id,),
                    ).fetchone()
                if legacy is not None:
                    payload = _json(legacy["payload"])
                    return run_summary(
                        f"ugsci:{source_run_id}",
                        operation=str(payload.get("operation") or "simulation.run"),
                        status=str(payload.get("status") or "blocked"),
                        payload={
                            **payload,
                            "created_at": payload.get("created_at") or legacy["updated_at"],
                            "updated_at": legacy["updated_at"],
                            "source_run_id": source_run_id,
                        },
                        source="ugsci-legacy",
                    )
            except sqlite3.Error:
                pass
        return None

    def list_events(self, run_id: str, after_sequence: int = 0) -> list[dict[str, Any]]:
        self.initialize()
        with self._connection() as conn:
            native_exists = self._own_row(conn, run_id) is not None
            rows = conn.execute(
                "SELECT sequence, event_type, payload, created_at "
                "FROM run_events WHERE run_id = ? AND sequence > ? ORDER BY sequence",
                (run_id, max(0, after_sequence)),
            ).fetchall()
        if rows:
            return [
                {
                    "sequence": int(row["sequence"]),
                    "seq": int(row["sequence"]),
                    "type": row["event_type"],
                    "event_type": row["event_type"],
                    "data": _json(row["payload"]),
                    "created_at": row["created_at"],
                }
                for row in rows
            ]
        if native_exists:
            # A native run and a legacy UGSci job may share the same raw id.
            # Never attach the legacy stream to the native run merely because
            # the native stream is empty (for example after an R0 migration).
            return []
        if not run_id.startswith("ugsci:"):
            # Accept both public forms (``legacy-id`` and ``ugsci:legacy-id``)
            # consistently.  Native events were checked above, so only fall
            # back to the legacy store when no native event stream exists.
            source_run_id = run_id
        else:
            source_run_id = run_id.removeprefix("ugsci:")
        database = self._legacy_database()
        if not database.is_file():
            return []
        try:
            with sqlite3.connect(database, timeout=2) as conn:
                conn.row_factory = sqlite3.Row
                legacy = conn.execute(
                    "SELECT sequence, payload, created_at FROM job_events "
                    "WHERE job_id = ? AND sequence > ? ORDER BY sequence",
                    (source_run_id, max(0, after_sequence)),
                ).fetchall()
        except sqlite3.Error:
            return []
        result: list[dict[str, Any]] = []
        for row in legacy:
            payload = _json(row["payload"])
            raw_type = payload.get("event_type") or payload.get("type")
            event_type = str(raw_type or "legacy.snapshot").strip()
            if not event_type:
                event_type = "legacy.snapshot"
            raw_data = payload.get("data")
            data = raw_data if isinstance(raw_data, dict) else payload
            result.append(
                {
                    "sequence": int(row["sequence"]),
                    "seq": int(row["sequence"]),
                    "type": event_type,
                    "event_type": event_type,
                    "data": data,
                    "created_at": row["created_at"],
                }
            )
        return result
