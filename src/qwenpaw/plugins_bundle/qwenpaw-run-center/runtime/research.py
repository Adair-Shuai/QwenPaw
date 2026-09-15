"""Lightweight model registry and CMOST-style study foundation.

The module intentionally uses only the Python standard library.  Optional
scientific providers (SALib, pymoo and SMT) can build on the persisted model,
study, realization and metric contracts without becoming hard dependencies of
the Run Center plugin.
"""

from __future__ import annotations

import hashlib
import ast
import itertools
import json
import math
import random
import re
import statistics
import threading
import uuid
from pathlib import PurePosixPath, PureWindowsPath
from typing import Any

from .models import RunStatus
from .repository import RunRepository, _json, _now


_SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
_MODEL_STATUSES = frozenset({"draft", "validated", "frozen", "released"})
_MODEL_REF_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$")
_MODEL_TAG_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
_STUDY_TYPES = frozenset(
    {
        "scenario_compare",
        "uncertainty",
        "sensitivity",
        "optimization",
        "history_match_lite",
        "forecast",
    }
)

# A review is a small, auditable governance record.  It deliberately lives in
# the research repository so model/study/run identifiers and their fingerprints
# can be checked in one transaction, while remaining independent of any user
# or identity provider implementation.
_REVIEW_STATUSES = frozenset(
    {"pending", "changes_requested", "approved", "rejected", "cancelled"}
)
_REVIEW_TERMINAL_STATUSES = frozenset({"approved", "rejected", "cancelled"})
_REVIEW_TRANSITIONS: dict[str, frozenset[str]] = {
    "pending": frozenset({"changes_requested", "approved", "rejected", "cancelled"}),
    "changes_requested": frozenset({"pending", "approved", "rejected", "cancelled"}),
    "approved": frozenset(),
    "rejected": frozenset(),
    "cancelled": frozenset(),
}


class ReferenceConflictError(ValueError):
    """Raised when an asset is still referenced by durable work products."""

    def __init__(self, message: str, *, references: list[dict[str, Any]] | None = None) -> None:
        super().__init__(message)
        self.references = references or []


def _canonical(value: Any) -> str:
    try:
        return json.dumps(
            value,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        )
    except (TypeError, ValueError) as exc:
        raise ValueError("value must be JSON-safe and finite") from exc


def _fingerprint(value: Any) -> str:
    return hashlib.sha256(_canonical(value).encode("utf-8")).hexdigest()


def _required_text(value: Any, name: str) -> str:
    normalized = str(value or "").strip()
    if not normalized:
        raise ValueError(f"{name} is required")
    return normalized


def _safe_relative_path(value: Any) -> str:
    path = _required_text(value, "file path").replace("\\", "/")
    posix = PurePosixPath(path)
    windows = PureWindowsPath(path)
    if posix.is_absolute() or windows.is_absolute() or ".." in posix.parts:
        raise ValueError("model file paths must be relative and cannot escape the snapshot")
    return posix.as_posix()


def _percentile(values: list[float], percentile: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    if len(ordered) == 1:
        return ordered[0]
    position = (len(ordered) - 1) * percentile
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return ordered[lower]
    weight = position - lower
    return ordered[lower] * (1.0 - weight) + ordered[upper] * weight


def _decode_json_value(raw: Any, default: Any = None) -> Any:
    """Decode persisted JSON while preserving arrays and scalar values."""
    if isinstance(raw, (dict, list, int, float, bool)) or raw is None:
        value = raw
    else:
        try:
            value = json.loads(raw or "null")
        except (TypeError, ValueError, json.JSONDecodeError):
            return default
    return default if value is None and default is not None else value


class ResearchRepository:
    """Model, Study and decision-analysis services over the Run database."""

    def __init__(self, runs: RunRepository) -> None:
        self.runs = runs
        self._initialized = False
        # Design generation is idempotent by study/revision/sequence.  The
        # lock prevents duplicate work from concurrent requests in one
        # desktop process; the database conflict handling below also protects
        # retries and concurrent processes.
        self._design_lock = threading.RLock()

    def initialize(self) -> None:
        if self._initialized:
            return
        self.runs.initialize()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            statements = """
                CREATE TABLE IF NOT EXISTS models (
                    model_id TEXT PRIMARY KEY,
                    project_id TEXT,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL DEFAULT '',
                    created_by TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_models_project
                    ON models(project_id, updated_at DESC);

                CREATE TABLE IF NOT EXISTS model_versions (
                    version_id TEXT PRIMARY KEY,
                    model_id TEXT NOT NULL,
                    revision INTEGER NOT NULL,
                    parent_version_id TEXT,
                    branch_name TEXT NOT NULL DEFAULT 'main',
                    label TEXT NOT NULL DEFAULT '',
                    change_summary TEXT NOT NULL DEFAULT '',
                    status TEXT NOT NULL,
                    provider_id TEXT,
                    provider_version TEXT,
                    manifest TEXT NOT NULL,
                    parameters TEXT NOT NULL,
                    snapshot_hash TEXT NOT NULL,
                    created_by TEXT,
                    created_at TEXT NOT NULL,
                    frozen_at TEXT,
                    deleted_at TEXT,
                    UNIQUE(model_id, revision)
                );
                CREATE INDEX IF NOT EXISTS idx_model_versions_model
                    ON model_versions(model_id, revision DESC);
                CREATE TABLE IF NOT EXISTS model_branches (
                    model_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    head_version_id TEXT,
                    created_by TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT,
                    PRIMARY KEY(model_id, name),
                    FOREIGN KEY(model_id) REFERENCES models(model_id) ON DELETE CASCADE,
                    FOREIGN KEY(head_version_id) REFERENCES model_versions(version_id)
                );
                CREATE INDEX IF NOT EXISTS idx_model_branches_model
                    ON model_branches(model_id, updated_at DESC);

                CREATE TABLE IF NOT EXISTS model_tags (
                    model_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    version_id TEXT NOT NULL,
                    metadata TEXT NOT NULL DEFAULT '{}',
                    created_by TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT,
                    PRIMARY KEY(model_id, name),
                    FOREIGN KEY(model_id) REFERENCES models(model_id) ON DELETE CASCADE,
                    FOREIGN KEY(version_id) REFERENCES model_versions(version_id)
                );
                CREATE INDEX IF NOT EXISTS idx_model_tags_model
                    ON model_tags(model_id, updated_at DESC);

                CREATE TABLE IF NOT EXISTS model_files (
                    version_id TEXT NOT NULL,
                    path TEXT NOT NULL,
                    artifact_ref TEXT,
                    sha256 TEXT,
                    size_bytes INTEGER,
                    metadata TEXT NOT NULL,
                    PRIMARY KEY(version_id, path)
                );

                CREATE TABLE IF NOT EXISTS model_version_validations (
                    version_id TEXT PRIMARY KEY,
                    validator_version TEXT NOT NULL,
                    status TEXT NOT NULL,
                    report TEXT NOT NULL,
                    validated_at TEXT NOT NULL,
                    FOREIGN KEY(version_id) REFERENCES model_versions(version_id)
                );

                CREATE TABLE IF NOT EXISTS studies (
                    study_id TEXT PRIMARY KEY,
                    project_id TEXT,
                    model_version_id TEXT NOT NULL,
                    study_type TEXT NOT NULL,
                    name TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_by TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_studies_project
                    ON studies(project_id, updated_at DESC);

                CREATE TABLE IF NOT EXISTS study_revisions (
                    study_id TEXT NOT NULL,
                    revision INTEGER NOT NULL,
                    definition TEXT NOT NULL,
                    fingerprint TEXT NOT NULL,
                    created_by TEXT,
                    created_at TEXT NOT NULL,
                    PRIMARY KEY(study_id, revision)
                );

                CREATE TABLE IF NOT EXISTS realizations (
                    realization_id TEXT PRIMARY KEY,
                    study_id TEXT NOT NULL,
                    revision INTEGER NOT NULL,
                    design_fingerprint TEXT NOT NULL DEFAULT '',
                    design_version INTEGER NOT NULL DEFAULT 1,
                    sequence INTEGER NOT NULL,
                    seed INTEGER NOT NULL,
                    parameter_values TEXT NOT NULL,
                    run_id TEXT,
                    status TEXT NOT NULL,
                    failure_reason TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    UNIQUE(study_id, revision, design_fingerprint, sequence)
                );
                CREATE INDEX IF NOT EXISTS idx_realizations_study
                    ON realizations(study_id, revision, sequence);

                CREATE TABLE IF NOT EXISTS metrics (
                    metric_id TEXT PRIMARY KEY,
                    realization_id TEXT NOT NULL,
                    metric_key TEXT NOT NULL,
                    label TEXT NOT NULL DEFAULT '',
                    value REAL NOT NULL,
                    unit TEXT NOT NULL DEFAULT '',
                    time_basis TEXT NOT NULL DEFAULT '',
                    uncertainty TEXT NOT NULL,
                    provenance TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    UNIQUE(realization_id, metric_key, time_basis)
                );

                CREATE TABLE IF NOT EXISTS comparisons (
                    comparison_id TEXT PRIMARY KEY,
                    study_id TEXT,
                    name TEXT NOT NULL,
                    definition TEXT NOT NULL,
                    result TEXT NOT NULL,
                    created_by TEXT,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS research_reports (
                    report_id TEXT PRIMARY KEY,
                    project_id TEXT,
                    study_id TEXT,
                    comparison_id TEXT,
                    title TEXT NOT NULL,
                    format TEXT NOT NULL,
                    definition TEXT NOT NULL,
                    content TEXT NOT NULL,
                    artifact TEXT NOT NULL,
                    created_by TEXT,
                    created_at TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_research_reports_study
                    ON research_reports(study_id, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_research_reports_comparison
                    ON research_reports(comparison_id, created_at DESC);

                CREATE TABLE IF NOT EXISTS reviews (
                    review_id TEXT PRIMARY KEY,
                    project_id TEXT,
                    subject_type TEXT NOT NULL,
                    subject_id TEXT NOT NULL,
                    study_revision INTEGER,
                    model_version_id TEXT,
                    study_id TEXT,
                    comparison_id TEXT,
                    run_id TEXT,
                    input_fingerprint TEXT NOT NULL,
                    status TEXT NOT NULL,
                    requested_by TEXT,
                    reviewer_id TEXT,
                    request_reason TEXT NOT NULL DEFAULT '',
                    decision_comment TEXT NOT NULL DEFAULT '',
                    metadata TEXT NOT NULL,
                    snapshot TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    decided_at TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_reviews_subject
                    ON reviews(subject_type, subject_id, input_fingerprint, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_reviews_status
                    ON reviews(status, updated_at DESC);
                CREATE INDEX IF NOT EXISTS idx_reviews_project
                    ON reviews(project_id, updated_at DESC);

                CREATE TABLE IF NOT EXISTS review_events (
                    event_id TEXT PRIMARY KEY,
                    review_id TEXT NOT NULL,
                    from_status TEXT,
                    to_status TEXT NOT NULL,
                    actor_id TEXT,
                    comment TEXT NOT NULL DEFAULT '',
                    metadata TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(review_id) REFERENCES reviews(review_id) ON DELETE CASCADE
                );
                CREATE INDEX IF NOT EXISTS idx_review_events_review
                    ON review_events(review_id, created_at, event_id);

                CREATE TABLE IF NOT EXISTS surrogate_models (
                    surrogate_id TEXT PRIMARY KEY,
                    study_id TEXT NOT NULL,
                    study_revision INTEGER NOT NULL,
                    metric_key TEXT NOT NULL,
                    algorithm TEXT NOT NULL,
                    features TEXT NOT NULL,
                    coefficients TEXT NOT NULL,
                    training_realization_ids TEXT NOT NULL,
                    diagnostics TEXT NOT NULL,
                    applicability_domain TEXT NOT NULL,
                    created_by TEXT,
                    created_at TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_surrogate_models_study
                    ON surrogate_models(study_id, study_revision, created_at DESC);
                """
            # sqlite3.executescript() commits implicitly, which would escape
            # RunRepository's explicit transaction. Execute statements one by
            # one so schema creation remains atomic with the shared repository.
            for statement in statements.split(";"):
                if statement.strip():
                    conn.execute(statement)
            # Reviews were added after the first research schema shipped.
            # Keep desktop databases upgradeable without requiring a reset.
            review_columns = {
                row[1] for row in conn.execute("PRAGMA table_info(reviews)")
            }
            if "study_revision" not in review_columns:
                conn.execute("ALTER TABLE reviews ADD COLUMN study_revision INTEGER")
            if "snapshot" not in review_columns:
                conn.execute(
                    "ALTER TABLE reviews ADD COLUMN snapshot TEXT NOT NULL DEFAULT '{}'"
                )
            version_columns = {
                row[1] for row in conn.execute("PRAGMA table_info(model_versions)")
            }
            if "branch_name" not in version_columns:
                conn.execute(
                    "ALTER TABLE model_versions ADD COLUMN branch_name TEXT NOT NULL DEFAULT 'main'"
                )
            if "deleted_at" not in version_columns:
                conn.execute("ALTER TABLE model_versions ADD COLUMN deleted_at TEXT")
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_model_versions_branch "
                "ON model_versions(model_id, branch_name, revision DESC)"
            )
            # Branch/tag tables were introduced after the first model registry
            # release.  CREATE IF NOT EXISTS above is safe for new databases;
            # these statements also make upgrades explicit for existing ones.
            conn.execute(
                "CREATE TABLE IF NOT EXISTS model_branches ("
                "model_id TEXT NOT NULL, name TEXT NOT NULL, head_version_id TEXT, "
                "created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, "
                "deleted_at TEXT, PRIMARY KEY(model_id, name), "
                "FOREIGN KEY(model_id) REFERENCES models(model_id) ON DELETE CASCADE, "
                "FOREIGN KEY(head_version_id) REFERENCES model_versions(version_id))"
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_model_branches_model "
                "ON model_branches(model_id, updated_at DESC)"
            )
            conn.execute(
                "CREATE TABLE IF NOT EXISTS model_tags ("
                "model_id TEXT NOT NULL, name TEXT NOT NULL, version_id TEXT NOT NULL, "
                "metadata TEXT NOT NULL DEFAULT '{}', created_by TEXT, "
                "created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, "
                "PRIMARY KEY(model_id, name), "
                "FOREIGN KEY(model_id) REFERENCES models(model_id) ON DELETE CASCADE, "
                "FOREIGN KEY(version_id) REFERENCES model_versions(version_id))"
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_model_tags_model "
                "ON model_tags(model_id, updated_at DESC)"
            )
            conn.execute(
                "INSERT OR IGNORE INTO model_branches(model_id, name, head_version_id, "
                "created_by, created_at, updated_at) "
                "SELECT m.model_id, 'main', (SELECT mv.version_id FROM model_versions mv "
                "WHERE mv.model_id=m.model_id AND mv.deleted_at IS NULL ORDER BY mv.revision DESC LIMIT 1), "
                "m.created_by, m.created_at, m.updated_at FROM models m"
            )
            self._migrate_realization_design_schema(conn)
        self._initialized = True

    @staticmethod
    def _migrate_realization_design_schema(conn: Any) -> None:
        """Upgrade databases created before design fingerprints were persisted.

        The original realization key was ``(study_id, revision, sequence)``.
        That made a second DOE with different method/budget/seed collide with
        the first one.  Keep legacy rows readable, then rebuild the table with
        the design-aware uniqueness key.  This migration is intentionally
        local to the research schema and remains safe to run repeatedly.
        """
        columns = {row[1] for row in conn.execute("PRAGMA table_info(realizations)")}
        if "design_fingerprint" not in columns:
            conn.execute(
                "ALTER TABLE realizations ADD COLUMN design_fingerprint TEXT NOT NULL DEFAULT ''"
            )
        if "design_version" not in columns:
            conn.execute(
                "ALTER TABLE realizations ADD COLUMN design_version INTEGER NOT NULL DEFAULT 1"
            )

        legacy_unique = False
        for index in conn.execute("PRAGMA index_list(realizations)").fetchall():
            if not bool(index[2]):
                continue
            index_name = str(index[1]).replace('"', '""')
            index_columns = [
                row[2]
                for row in conn.execute(f'PRAGMA index_info("{index_name}")').fetchall()
            ]
            if index_columns == ["study_id", "revision", "sequence"]:
                legacy_unique = True
                break
        if not legacy_unique:
            # Keep the query index aligned with the new design-aware key.  A
            # pre-migration index may still use the old three columns because
            # old SQLite tables cannot create an index on newly added columns
            # until the migration has run.
            index_row = conn.execute(
                "SELECT name FROM pragma_index_list('realizations') "
                "WHERE name='idx_realizations_study'"
            ).fetchone()
            if index_row is not None:
                index_name = str(index_row[0]).replace('"', '""')
                index_columns = [
                    row[2]
                    for row in conn.execute(
                        f'PRAGMA index_info("{index_name}")'
                    ).fetchall()
                ]
                if index_columns != [
                    "study_id",
                    "revision",
                    "design_version",
                    "sequence",
                ]:
                    conn.execute('DROP INDEX "idx_realizations_study"')
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_realizations_study "
                "ON realizations(study_id, revision, design_version, sequence)"
            )
            return

        # Rebuild only when the old unique constraint is present.  SQLite
        # cannot alter a UNIQUE constraint in place, and this keeps existing
        # realization/run/metric identifiers intact.
        conn.execute("DROP INDEX IF EXISTS idx_realizations_study")
        conn.execute("ALTER TABLE realizations RENAME TO realizations_legacy")
        conn.execute(
            """CREATE TABLE realizations (
                realization_id TEXT PRIMARY KEY,
                study_id TEXT NOT NULL,
                revision INTEGER NOT NULL,
                design_fingerprint TEXT NOT NULL DEFAULT '',
                design_version INTEGER NOT NULL DEFAULT 1,
                sequence INTEGER NOT NULL,
                seed INTEGER NOT NULL,
                parameter_values TEXT NOT NULL,
                run_id TEXT,
                status TEXT NOT NULL,
                failure_reason TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(study_id, revision, design_fingerprint, sequence)
            )"""
        )
        conn.execute(
            """INSERT INTO realizations(
                realization_id, study_id, revision, design_fingerprint,
                design_version, sequence, seed, parameter_values, run_id,
                status, failure_reason, created_at, updated_at
            )
            SELECT realization_id, study_id, revision,
                COALESCE(design_fingerprint, ''), COALESCE(design_version, 1),
                sequence, seed, parameter_values, run_id, status,
                failure_reason, created_at, updated_at
            FROM realizations_legacy"""
        )
        conn.execute("DROP TABLE realizations_legacy")
        conn.execute(
            "CREATE INDEX idx_realizations_study ON realizations"
            "(study_id, revision, design_version, sequence)"
        )

    # -- Model registry -------------------------------------------------

    @staticmethod
    def _model_ref_name(value: Any, name: str = "branch_name") -> str:
        candidate = str(value or "").strip()
        pattern = _MODEL_REF_NAME_RE if name == "branch_name" else _MODEL_TAG_NAME_RE
        if not candidate or not pattern.fullmatch(candidate) or ".." in candidate.split("/"):
            raise ValueError(f"{name} must contain only letters, numbers, '.', '_' , '-' and '/'")
        return candidate

    def create_model(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(payload, dict):
            raise ValueError("model payload must be an object")
        self.initialize()
        model_id = str(payload.get("model_id") or uuid.uuid4().hex).strip()
        name = _required_text(payload.get("name"), "name")
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            if conn.execute(
                "SELECT 1 FROM models WHERE model_id=?", (model_id,)
            ).fetchone():
                raise ValueError(f"Model already exists: {model_id}")
            conn.execute(
                "INSERT INTO models(model_id, project_id, name, description, "
                "created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    model_id,
                    payload.get("project_id"),
                    name,
                    str(payload.get("description") or ""),
                    payload.get("created_by"),
                    now,
                    now,
                ),
            )
            conn.execute(
                "INSERT INTO model_branches(model_id, name, head_version_id, created_by, "
                "created_at, updated_at) VALUES (?, 'main', NULL, ?, ?, ?)",
                (model_id, payload.get("created_by"), now, now),
            )
        return self.get_model(model_id)  # type: ignore[return-value]

    def list_models(
        self, project_id: str | None = None, *, include_deleted: bool = False
    ) -> list[dict[str, Any]]:
        self.initialize()
        where = "WHERE 1=1" if include_deleted else "WHERE deleted_at IS NULL"
        values: list[Any] = []
        if project_id:
            where += " AND project_id=?"
            values.append(project_id)
        with self.runs._connection() as conn:  # noqa: SLF001
            rows = conn.execute(
                f"SELECT * FROM models {where} ORDER BY updated_at DESC", values
            ).fetchall()
        result: list[dict[str, Any]] = []
        for row in rows:
            item = dict(row)
            item["versions"] = self.list_model_versions(
                item["model_id"], include_deleted=include_deleted
            )
            item["branches"] = self.list_model_branches(
                item["model_id"], include_deleted=include_deleted
            )
            item["tags"] = self.list_model_tags(
                item["model_id"], include_deleted=include_deleted
            )
            result.append(item)
        return result

    def get_model(
        self, model_id: str, *, include_deleted: bool = False
    ) -> dict[str, Any] | None:
        self.initialize()
        deleted_clause = "" if include_deleted else " AND deleted_at IS NULL"
        with self.runs._connection() as conn:  # noqa: SLF001
            row = conn.execute(
                f"SELECT * FROM models WHERE model_id=?{deleted_clause}",
                (model_id,),
            ).fetchone()
        if row is None:
            return None
        item = dict(row)
        item["versions"] = self.list_model_versions(model_id, include_deleted=include_deleted)
        item["branches"] = self.list_model_branches(model_id, include_deleted=include_deleted)
        item["tags"] = self.list_model_tags(model_id, include_deleted=include_deleted)
        return item

    def create_model_version(
        self, model_id: str, payload: dict[str, Any]
    ) -> dict[str, Any]:
        if not isinstance(payload, dict):
            raise ValueError("model version payload must be an object")
        self.initialize()
        files = payload.get("files") or []
        if not isinstance(files, list):
            raise ValueError("files must be an array")
        normalized_files: list[dict[str, Any]] = []
        seen_paths: set[str] = set()
        for item in files:
            if not isinstance(item, dict):
                raise ValueError("each model file must be an object")
            path = _safe_relative_path(item.get("path"))
            if path in seen_paths:
                raise ValueError(f"duplicate model file path: {path}")
            seen_paths.add(path)
            sha256 = str(item.get("sha256") or "").strip().lower() or None
            if sha256 and not _SHA256_RE.fullmatch(sha256):
                raise ValueError(f"invalid SHA-256 for model file: {path}")
            size = item.get("size_bytes")
            if size is not None and (not isinstance(size, int) or size < 0):
                raise ValueError("size_bytes must be a non-negative integer")
            metadata = item.get("metadata") or {}
            if not isinstance(metadata, dict):
                raise ValueError("model file metadata must be an object")
            _canonical(metadata)
            normalized_files.append(
                {
                    "path": path,
                    "artifact_ref": item.get("artifact_ref"),
                    "sha256": sha256,
                    "size_bytes": size,
                    "metadata": metadata,
                }
            )
        parameters = payload.get("parameters") or {}
        manifest = payload.get("manifest") or {}
        if not isinstance(parameters, dict) or not isinstance(manifest, dict):
            raise ValueError("parameters and manifest must be objects")
        snapshot = {
            "manifest": manifest,
            "parameters": parameters,
            "files": sorted(normalized_files, key=lambda item: item["path"]),
            "provider_id": payload.get("provider_id"),
            "provider_version": payload.get("provider_version"),
        }
        snapshot_hash = _fingerprint(snapshot)
        status = str(payload.get("status") or "draft").strip().lower()
        if status not in _MODEL_STATUSES:
            raise ValueError(f"unsupported model version status: {status}")
        if status == "released":
            raise ValueError(
                "released model versions must be published through the release endpoint"
            )
        version_id = str(payload.get("version_id") or uuid.uuid4().hex).strip()
        if not version_id:
            raise ValueError("version_id must not be empty")
        branch_name = self._model_ref_name(payload.get("branch_name") or "main")
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            if not conn.execute(
                "SELECT 1 FROM models WHERE model_id=? AND deleted_at IS NULL",
                (model_id,),
            ).fetchone():
                raise KeyError(model_id)
            revision = int(
                conn.execute(
                    "SELECT COALESCE(MAX(revision), 0) + 1 FROM model_versions WHERE model_id=?",
                    (model_id,),
                ).fetchone()[0]
            )
            parent = payload.get("parent_version_id")
            if parent and not conn.execute(
                "SELECT 1 FROM model_versions WHERE version_id=? AND model_id=? AND deleted_at IS NULL",
                (parent, model_id),
            ).fetchone():
                raise ValueError("parent_version_id must belong to the same model")
            if not conn.execute(
                "SELECT 1 FROM model_branches WHERE model_id=? AND name=? AND deleted_at IS NULL",
                (model_id, branch_name),
            ).fetchone():
                raise ValueError(f"model branch does not exist: {branch_name}")
            if conn.execute(
                "SELECT 1 FROM model_versions WHERE version_id=?", (version_id,)
            ).fetchone():
                raise ValueError(f"Model version already exists: {version_id}")
            conn.execute(
                "INSERT INTO model_versions(version_id, model_id, revision, "
                "parent_version_id, branch_name, label, change_summary, status, provider_id, "
                "provider_version, manifest, parameters, snapshot_hash, created_by, "
                "created_at, frozen_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    version_id,
                    model_id,
                    revision,
                    parent,
                    branch_name,
                    str(payload.get("label") or f"v{revision}"),
                    str(payload.get("change_summary") or ""),
                    status,
                    payload.get("provider_id"),
                    payload.get("provider_version"),
                    _canonical(manifest),
                    _canonical(parameters),
                    snapshot_hash,
                    payload.get("created_by"),
                    now,
                    now if status in {"frozen", "released"} else None,
                ),
            )
            conn.executemany(
                "INSERT INTO model_files(version_id, path, artifact_ref, sha256, "
                "size_bytes, metadata) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    (
                        version_id,
                        item["path"],
                        item["artifact_ref"],
                        item["sha256"],
                        item["size_bytes"],
                        _canonical(item["metadata"]),
                    )
                    for item in normalized_files
                ],
            )
            conn.execute(
                "UPDATE models SET updated_at=? WHERE model_id=?", (now, model_id)
            )
            conn.execute(
                "UPDATE model_branches SET head_version_id=?, updated_at=? "
                "WHERE model_id=? AND name=? AND deleted_at IS NULL",
                (version_id, now, model_id, branch_name),
            )
        return self.get_model_version(version_id)  # type: ignore[return-value]

    def list_model_versions(
        self, model_id: str, *, include_deleted: bool = False
    ) -> list[dict[str, Any]]:
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            rows = conn.execute(
                "SELECT mv.*, vv.validator_version AS validation_validator_version, "
                "vv.status AS validation_status, vv.report AS validation_report, "
                "vv.validated_at AS validation_validated_at "
                "FROM model_versions mv LEFT JOIN model_version_validations vv "
                "ON vv.version_id=mv.version_id WHERE mv.model_id=? "
                + ("" if include_deleted else "AND mv.deleted_at IS NULL ")
                + "ORDER BY mv.revision DESC",
                (model_id,),
            ).fetchall()
        result: list[dict[str, Any]] = []
        for row in rows:
            item = self._version_row(row, include_files=False)
            if row["validation_status"] is not None:
                item["validation"] = {
                    "validator_version": row["validation_validator_version"],
                    "status": row["validation_status"],
                    "report": _json(row["validation_report"]),
                    "validated_at": row["validation_validated_at"],
                }
            else:
                item["validation"] = None
            result.append(item)
        return result

    def get_model_version(
        self, version_id: str, *, include_deleted: bool = False
    ) -> dict[str, Any] | None:
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT * FROM model_versions WHERE version_id=? "
                + ("" if include_deleted else "AND deleted_at IS NULL"),
                (version_id,),
            ).fetchone()
            files = conn.execute(
                "SELECT * FROM model_files WHERE version_id=? ORDER BY path", (version_id,)
            ).fetchall()
            validation = conn.execute(
                "SELECT validator_version, status, report, validated_at "
                "FROM model_version_validations WHERE version_id=?",
                (version_id,),
            ).fetchone()
        if row is None:
            return None
        item = self._version_row(row, include_files=False)
        item["files"] = [
            {
                **dict(file_row),
                "metadata": _json(file_row["metadata"]),
            }
            for file_row in files
        ]
        item["validation"] = (
            {
                "validator_version": validation["validator_version"],
                "status": validation["status"],
                "report": _json(validation["report"]),
                "validated_at": validation["validated_at"],
            }
            if validation is not None
            else None
        )
        return item

    def validate_model_version(
        self,
        version_id: str,
        *,
        inline_files: list[dict[str, Any]] | dict[str, Any] | None = None,
        check_syntax: bool = True,
        promote: bool = True,
    ) -> dict[str, Any]:
        """Validate a model snapshot without changing its immutable contents.

        Validation is deliberately provider-neutral.  It checks the persisted
        file manifest and JSON metadata, verifies manifest path references, and
        optionally parses inline Python scripts supplied by the caller.  The
        report is stored separately so validation history never rewrites the
        model-version snapshot or its content hash.
        """
        self.initialize()
        version = self.get_model_version(version_id)
        if version is None:
            raise KeyError(version_id)

        checks: list[dict[str, Any]] = []
        errors: list[str] = []
        warnings: list[str] = []
        file_paths: set[str] = set()
        for item in version.get("files") or []:
            try:
                path = _safe_relative_path(item.get("path"))
            except ValueError as exc:
                errors.append(str(exc))
                continue
            if path in file_paths:
                errors.append(f"duplicate model file path: {path}")
            file_paths.add(path)
        checks.append(
            {
                "name": "file_paths",
                "status": "passed" if not errors else "failed",
                "file_count": len(file_paths),
            }
        )

        manifest = version.get("manifest")
        if not isinstance(manifest, dict):
            errors.append("manifest must be an object")
            checks.append({"name": "manifest", "status": "failed"})
        else:
            manifest_error_count = 0
            for key in ("entrypoint", "main_script", "script", "deck", "input_deck"):
                value = manifest.get(key)
                if value in (None, ""):
                    continue
                if not isinstance(value, str):
                    errors.append(f"manifest.{key} must be a relative path")
                    manifest_error_count += 1
                    continue
                try:
                    normalized = _safe_relative_path(value)
                except ValueError as exc:
                    errors.append(f"manifest.{key}: {exc}")
                    manifest_error_count += 1
                    continue
                if normalized not in file_paths:
                    errors.append(f"manifest.{key} does not reference a model file: {normalized}")
                    manifest_error_count += 1
            checks.append(
                {
                    "name": "manifest",
                    "status": "failed" if manifest_error_count else "passed",
                }
            )

        parameters = version.get("parameters")
        parameter_error_count = 0
        if not isinstance(parameters, dict):
            errors.append("parameters must be an object")
            parameter_error_count += 1
        else:
            for key in parameters:
                if not isinstance(key, str) or not key.strip():
                    errors.append("parameter keys must be non-empty strings")
                    parameter_error_count += 1
        checks.append(
            {
                "name": "parameters",
                "status": "failed" if parameter_error_count else "passed",
                "parameter_count": len(parameters) if isinstance(parameters, dict) else 0,
            }
        )

        if inline_files is None:
            normalized_inline: list[dict[str, Any]] = []
        elif isinstance(inline_files, dict):
            normalized_inline = [
                {"path": path, "content": content}
                for path, content in inline_files.items()
            ]
        elif isinstance(inline_files, list):
            normalized_inline = inline_files
        else:
            raise ValueError("inline_files must be an array or object")

        syntax_errors = 0
        inline_paths: set[str] = set()
        for item in normalized_inline:
            if not isinstance(item, dict):
                errors.append("each inline file must be an object")
                syntax_errors += 1
                continue
            try:
                path = _safe_relative_path(item.get("path"))
            except ValueError as exc:
                errors.append(str(exc))
                syntax_errors += 1
                continue
            if path in inline_paths:
                errors.append(f"duplicate inline file path: {path}")
                syntax_errors += 1
                continue
            inline_paths.add(path)
            if path not in file_paths:
                errors.append(f"inline file is not declared by model version: {path}")
                syntax_errors += 1
            content = item.get("content")
            if not isinstance(content, str):
                errors.append(f"inline file content must be text: {path}")
                syntax_errors += 1
                continue
            if check_syntax and path.lower().endswith((".py", ".pyw")):
                try:
                    ast.parse(content, filename=path, mode="exec")
                except SyntaxError as exc:
                    location = f" line {exc.lineno}" if exc.lineno else ""
                    errors.append(f"Python syntax error in {path}{location}: {exc.msg}")
                    syntax_errors += 1
        if check_syntax and not normalized_inline:
            warnings.append("No inline script content supplied; Python syntax was not checked")
        checks.append(
            {
                "name": "python_syntax",
                "status": "failed" if syntax_errors else "passed",
                "checked_files": sum(
                    1
                    for item in normalized_inline
                    if isinstance(item, dict)
                    and str(item.get("path") or "").lower().endswith((".py", ".pyw"))
                ),
                "skipped": not check_syntax,
            }
        )

        valid = not errors
        now = _now()
        report = {
            "version_id": version_id,
            "validator_version": "1",
            "status": "passed" if valid else "failed",
            "valid": valid,
            "checked_at": now,
            "checks": checks,
            "errors": errors,
            "warnings": warnings,
        }
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            conn.execute(
                "INSERT INTO model_version_validations(version_id, validator_version, "
                "status, report, validated_at) VALUES (?, ?, ?, ?, ?) "
                "ON CONFLICT(version_id) DO UPDATE SET validator_version=excluded.validator_version, "
                "status=excluded.status, report=excluded.report, validated_at=excluded.validated_at",
                (version_id, "1", report["status"], _canonical(report), now),
            )
            if valid and promote and version.get("status") == "draft":
                conn.execute(
                    "UPDATE model_versions SET status='validated' WHERE version_id=?",
                    (version_id,),
                )
        latest = self.get_model_version(version_id)
        assert latest is not None
        return {"model_version": latest, "validation": report}

    @staticmethod
    def _version_row(row: Any, *, include_files: bool) -> dict[str, Any]:
        del include_files
        item = dict(row)
        for key in (
            "validation_validator_version",
            "validation_status",
            "validation_report",
            "validation_validated_at",
        ):
            item.pop(key, None)
        item["manifest"] = _json(row["manifest"])
        item["parameters"] = _json(row["parameters"])
        return item

    def freeze_model_version(self, version_id: str) -> dict[str, Any]:
        self.initialize()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT status, deleted_at FROM model_versions WHERE version_id=?", (version_id,)
            ).fetchone()
            if row is None:
                raise KeyError(version_id)
            if row["deleted_at"] is not None:
                raise ValueError("deleted model versions cannot be frozen")
            if row["status"] == "released":
                raise ValueError("released model versions are immutable")
            now = _now()
            conn.execute(
                "UPDATE model_versions SET status='frozen', frozen_at=? WHERE version_id=?",
                (now, version_id),
            )
        return self.get_model_version(version_id)  # type: ignore[return-value]

    def release_model_version(
        self,
        version_id: str,
        *,
        review_id: str | None = None,
        require_review: bool = False,
    ) -> dict[str, Any]:
        """Publish a validated model snapshot for production runs.

        Release is intentionally a one-way lifecycle transition.  A model
        version must have a persisted, passing validation report before it can
        be released; this prevents a caller from bypassing manifest and script
        checks by submitting ``status='released'`` at creation time.  Releasing
        an already released version is idempotent so retries from the UI or a
        disconnected client are safe.
        """
        self.initialize()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT status, snapshot_hash, deleted_at FROM model_versions WHERE version_id=?",
                (version_id,),
            ).fetchone()
            if row is None:
                raise KeyError(version_id)
            if row["deleted_at"] is not None:
                raise ValueError("deleted model versions cannot be released")
            current_status = str(row["status"] or "").strip().lower()
            if current_status == "released":
                # Keep the idempotent retry on the same immutable snapshot;
                # fetch the expanded representation after the write context.
                already_released = True
            else:
                already_released = False
            if not already_released and current_status not in {"validated", "frozen"}:
                raise ValueError(
                    "model version must pass validation and be validated or frozen before release"
                )
            validation = None if already_released else conn.execute(
                "SELECT status, report FROM model_version_validations "
                "WHERE version_id=?",
                (version_id,),
            ).fetchone()
            if not already_released and (
                validation is None or str(validation["status"]).lower() != "passed"
            ):
                raise ValueError(
                    "model version must pass validation before release"
                )
            if not already_released and (require_review or review_id is not None):
                # Approval is tied to the immutable model snapshot.  A review
                # for an older revision cannot authorize this release.
                approved = conn.execute(
                    "SELECT review_id FROM reviews WHERE review_id=? AND subject_type='model_version' "
                    "AND subject_id=? AND input_fingerprint=? AND status='approved'",
                    (
                        str(review_id or ""),
                        version_id,
                        str(row["snapshot_hash"] or "").lower(),
                    ),
                ).fetchone() if review_id else conn.execute(
                    "SELECT review_id FROM reviews WHERE subject_type='model_version' "
                    "AND subject_id=? AND input_fingerprint=? AND status='approved' "
                    "ORDER BY decided_at DESC LIMIT 1",
                    (version_id, str(row["snapshot_hash"] or "").lower()),
                ).fetchone()
                if approved is None:
                    raise ValueError("an approved review is required before model release")
            if not already_released:
                now = _now()
                conn.execute(
                    "UPDATE model_versions SET status='released', "
                    "frozen_at=COALESCE(frozen_at, ?) WHERE version_id=?",
                    (now, version_id),
                )
        return self.get_model_version(version_id)  # type: ignore[return-value]

    def diff_model_versions(self, left_id: str, right_id: str) -> dict[str, Any]:
        left = self.get_model_version(left_id)
        right = self.get_model_version(right_id)
        if left is None or right is None:
            raise KeyError(left_id if left is None else right_id)
        left_files = {item["path"]: item for item in left["files"]}
        right_files = {item["path"]: item for item in right["files"]}
        changed = [
            path
            for path in sorted(left_files.keys() & right_files.keys())
            if (
                left_files[path].get("sha256"),
                left_files[path].get("artifact_ref"),
                left_files[path].get("metadata"),
            )
            != (
                right_files[path].get("sha256"),
                right_files[path].get("artifact_ref"),
                right_files[path].get("metadata"),
            )
        ]
        parameter_keys = set(left["parameters"]) | set(right["parameters"])
        parameter_changes = {
            key: {"left": left["parameters"].get(key), "right": right["parameters"].get(key)}
            for key in sorted(parameter_keys)
            if left["parameters"].get(key) != right["parameters"].get(key)
        }
        return {
            "left_version_id": left_id,
            "right_version_id": right_id,
            "files": {
                "added": sorted(right_files.keys() - left_files.keys()),
                "removed": sorted(left_files.keys() - right_files.keys()),
                "changed": changed,
            },
            "parameters": parameter_changes,
            "manifest_changed": left["manifest"] != right["manifest"],
        }

    # -- Model branches, tags and lifecycle governance -----------------

    def list_model_branches(
        self, model_id: str, *, include_deleted: bool = False
    ) -> list[dict[str, Any]]:
        """List named model branches and their current heads.

        A branch is metadata pointing at an immutable model snapshot.  The
        branch record can move; the snapshot it points to never changes.
        """
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            rows = conn.execute(
                "SELECT * FROM model_branches WHERE model_id=? "
                + ("" if include_deleted else "AND deleted_at IS NULL ")
                + "ORDER BY name",
                (model_id,),
            ).fetchall()
        result: list[dict[str, Any]] = []
        for row in rows:
            item = dict(row)
            head_id = item.get("head_version_id")
            item["head"] = (
                self.get_model_version(str(head_id), include_deleted=include_deleted)
                if head_id
                else None
            )
            result.append(item)
        return result

    def get_model_branch(
        self, model_id: str, name: str, *, include_deleted: bool = False
    ) -> dict[str, Any] | None:
        branch_name = self._model_ref_name(name)
        branches = self.list_model_branches(model_id, include_deleted=include_deleted)
        return next((item for item in branches if item["name"] == branch_name), None)

    def create_model_branch(self, model_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(payload, dict):
            raise ValueError("model branch payload must be an object")
        self.initialize()
        name = self._model_ref_name(payload.get("name") or payload.get("branch_name"))
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            model = conn.execute(
                "SELECT deleted_at FROM models WHERE model_id=?", (model_id,)
            ).fetchone()
            if model is None or model["deleted_at"] is not None:
                raise KeyError(model_id)
            head_id = str(payload.get("head_version_id") or "").strip() or None
            if head_id:
                head = conn.execute(
                    "SELECT version_id FROM model_versions WHERE version_id=? "
                    "AND model_id=? AND deleted_at IS NULL",
                    (head_id, model_id),
                ).fetchone()
                if head is None:
                    raise ValueError("head_version_id must belong to an active version of the model")
            else:
                head = conn.execute(
                    "SELECT version_id FROM model_versions WHERE model_id=? "
                    "AND deleted_at IS NULL ORDER BY revision DESC LIMIT 1",
                    (model_id,),
                ).fetchone()
                head_id = head["version_id"] if head else None
            existing = conn.execute(
                "SELECT deleted_at FROM model_branches WHERE model_id=? AND name=?",
                (model_id, name),
            ).fetchone()
            if existing is not None and existing["deleted_at"] is None:
                raise ValueError(f"Model branch already exists: {name}")
            if existing is not None:
                conn.execute(
                    "UPDATE model_branches SET head_version_id=?, created_by=?, "
                    "updated_at=?, deleted_at=NULL WHERE model_id=? AND name=?",
                    (head_id, payload.get("created_by"), now, model_id, name),
                )
            else:
                conn.execute(
                    "INSERT INTO model_branches(model_id, name, head_version_id, created_by, "
                    "created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (model_id, name, head_id, payload.get("created_by"), now, now),
                )
        return self.get_model_branch(model_id, name)  # type: ignore[return-value]

    def set_model_branch_head(
        self, model_id: str, name: str, version_id: str
    ) -> dict[str, Any]:
        branch_name = self._model_ref_name(name)
        version_id = _required_text(version_id, "version_id")
        self.initialize()
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            branch = conn.execute(
                "SELECT 1 FROM model_branches WHERE model_id=? AND name=? AND deleted_at IS NULL",
                (model_id, branch_name),
            ).fetchone()
            if branch is None:
                raise KeyError(branch_name)
            version = conn.execute(
                "SELECT 1 FROM model_versions WHERE version_id=? AND model_id=? AND deleted_at IS NULL",
                (version_id, model_id),
            ).fetchone()
            if version is None:
                raise ValueError("version_id must belong to an active version of the model")
            conn.execute(
                "UPDATE model_branches SET head_version_id=?, updated_at=? "
                "WHERE model_id=? AND name=?",
                (version_id, now, model_id, branch_name),
            )
        return self.get_model_branch(model_id, branch_name)  # type: ignore[return-value]

    def list_model_tags(
        self, model_id: str, *, include_deleted: bool = False
    ) -> list[dict[str, Any]]:
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            rows = conn.execute(
                "SELECT * FROM model_tags WHERE model_id=? "
                + ("" if include_deleted else "AND deleted_at IS NULL ")
                + "ORDER BY name",
                (model_id,),
            ).fetchall()
        result: list[dict[str, Any]] = []
        for row in rows:
            item = dict(row)
            item["metadata"] = _json(item.get("metadata"))
            version_id = item.get("version_id")
            item["version"] = (
                self.get_model_version(str(version_id), include_deleted=include_deleted)
                if version_id
                else None
            )
            item["version_deleted"] = bool(item["version"] is None and version_id)
            result.append(item)
        return result

    def get_model_tag(
        self, model_id: str, name: str, *, include_deleted: bool = False
    ) -> dict[str, Any] | None:
        tag_name = self._model_ref_name(name, "tag_name")
        return next(
            (item for item in self.list_model_tags(model_id, include_deleted=include_deleted)
             if item["name"] == tag_name),
            None,
        )

    def create_model_tag(self, model_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(payload, dict):
            raise ValueError("model tag payload must be an object")
        self.initialize()
        name = self._model_ref_name(payload.get("name") or payload.get("tag_name"), "tag_name")
        version_id = _required_text(payload.get("version_id"), "version_id")
        metadata = payload.get("metadata") or {}
        if not isinstance(metadata, dict):
            raise ValueError("tag metadata must be an object")
        _canonical(metadata)
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            model = conn.execute(
                "SELECT deleted_at FROM models WHERE model_id=?", (model_id,)
            ).fetchone()
            if model is None or model["deleted_at"] is not None:
                raise KeyError(model_id)
            if conn.execute(
                "SELECT 1 FROM model_versions WHERE version_id=? AND model_id=? AND deleted_at IS NULL",
                (version_id, model_id),
            ).fetchone() is None:
                raise ValueError("version_id must belong to an active version of the model")
            existing = conn.execute(
                "SELECT deleted_at FROM model_tags WHERE model_id=? AND name=?",
                (model_id, name),
            ).fetchone()
            if existing is not None and existing["deleted_at"] is None:
                raise ValueError(f"Model tag already exists: {name}")
            if existing is not None:
                conn.execute(
                    "UPDATE model_tags SET version_id=?, metadata=?, created_by=?, "
                    "updated_at=?, deleted_at=NULL WHERE model_id=? AND name=?",
                    (version_id, _canonical(metadata), payload.get("created_by"), now, model_id, name),
                )
            else:
                conn.execute(
                    "INSERT INTO model_tags(model_id, name, version_id, metadata, created_by, "
                    "created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (model_id, name, version_id, _canonical(metadata), payload.get("created_by"), now, now),
                )
        return self.get_model_tag(model_id, name)  # type: ignore[return-value]

    def set_model_tag(self, model_id: str, name: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(payload, dict):
            raise ValueError("model tag payload must be an object")
        tag_name = self._model_ref_name(name, "tag_name")
        version_id = _required_text(payload.get("version_id"), "version_id")
        self.initialize()
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            if conn.execute(
                "SELECT 1 FROM model_tags WHERE model_id=? AND name=? AND deleted_at IS NULL",
                (model_id, tag_name),
            ).fetchone() is None:
                raise KeyError(tag_name)
            if conn.execute(
                "SELECT 1 FROM model_versions WHERE version_id=? AND model_id=? AND deleted_at IS NULL",
                (version_id, model_id),
            ).fetchone() is None:
                raise ValueError("version_id must belong to an active version of the model")
            metadata = payload.get("metadata") or {}
            if not isinstance(metadata, dict):
                raise ValueError("tag metadata must be an object")
            conn.execute(
                "UPDATE model_tags SET version_id=?, metadata=?, updated_at=? "
                "WHERE model_id=? AND name=?",
                (version_id, _canonical(metadata), now, model_id, tag_name),
            )
        return self.get_model_tag(model_id, tag_name)  # type: ignore[return-value]

    def delete_model_tag(self, model_id: str, name: str) -> dict[str, Any]:
        tag_name = self._model_ref_name(name, "tag_name")
        self.initialize()
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            if conn.execute(
                "SELECT 1 FROM model_tags WHERE model_id=? AND name=? AND deleted_at IS NULL",
                (model_id, tag_name),
            ).fetchone() is None:
                raise KeyError(tag_name)
            conn.execute(
                "UPDATE model_tags SET deleted_at=?, updated_at=? WHERE model_id=? AND name=?",
                (now, now, model_id, tag_name),
            )
        return self.get_model_tag(model_id, tag_name, include_deleted=True)  # type: ignore[return-value]

    def restore_model_tag(self, model_id: str, name: str) -> dict[str, Any]:
        tag_name = self._model_ref_name(name, "tag_name")
        self.initialize()
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT version_id, deleted_at FROM model_tags WHERE model_id=? AND name=?",
                (model_id, tag_name),
            ).fetchone()
            if row is None:
                raise KeyError(tag_name)
            if row["deleted_at"] is not None:
                if conn.execute(
                    "SELECT 1 FROM models WHERE model_id=? AND deleted_at IS NULL",
                    (model_id,),
                ).fetchone() is None:
                    raise ValueError("restore the parent model before restoring its tag")
                if conn.execute(
                    "SELECT 1 FROM model_versions WHERE version_id=? AND deleted_at IS NULL",
                    (row["version_id"],),
                ).fetchone() is None:
                    raise ValueError("restore the tagged model version before restoring its tag")
                conn.execute(
                    "UPDATE model_tags SET deleted_at=NULL, updated_at=? WHERE model_id=? AND name=?",
                    (now, model_id, tag_name),
                )
        return self.get_model_tag(model_id, tag_name)  # type: ignore[return-value]

    def delete_model_branch(self, model_id: str, name: str) -> dict[str, Any]:
        branch_name = self._model_ref_name(name)
        if branch_name == "main":
            raise ValueError("the main model branch cannot be deleted")
        self.initialize()
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            if conn.execute(
                "SELECT 1 FROM model_branches WHERE model_id=? AND name=? AND deleted_at IS NULL",
                (model_id, branch_name),
            ).fetchone() is None:
                raise KeyError(branch_name)
            conn.execute(
                "UPDATE model_branches SET deleted_at=?, updated_at=? WHERE model_id=? AND name=?",
                (now, now, model_id, branch_name),
            )
        return self.get_model_branch(model_id, branch_name, include_deleted=True)  # type: ignore[return-value]

    def restore_model_branch(self, model_id: str, name: str) -> dict[str, Any]:
        branch_name = self._model_ref_name(name)
        self.initialize()
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT head_version_id, deleted_at FROM model_branches WHERE model_id=? AND name=?",
                (model_id, branch_name),
            ).fetchone()
            if row is None:
                raise KeyError(branch_name)
            if row["deleted_at"] is not None:
                if conn.execute(
                    "SELECT 1 FROM models WHERE model_id=? AND deleted_at IS NULL",
                    (model_id,),
                ).fetchone() is None:
                    raise ValueError("restore the parent model before restoring its branch")
                head_id = row["head_version_id"]
                if head_id and conn.execute(
                    "SELECT 1 FROM model_versions WHERE version_id=? AND deleted_at IS NULL",
                    (head_id,),
                ).fetchone() is None:
                    head_id = None
                conn.execute(
                    "UPDATE model_branches SET head_version_id=?, deleted_at=NULL, updated_at=? "
                    "WHERE model_id=? AND name=?",
                    (head_id, now, model_id, branch_name),
                )
        return self.get_model_branch(model_id, branch_name)  # type: ignore[return-value]

    def model_version_references(self, version_id: str) -> list[dict[str, Any]]:
        """Return durable Run/Study/Report references blocking deletion."""
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            return self._model_version_references_tx(conn, version_id)

    @staticmethod
    def _model_version_references_tx(conn: Any, version_id: str) -> list[dict[str, Any]]:
        rows = conn.execute(
            "SELECT 'run' AS reference_type, run_id AS reference_id, status AS state "
            "FROM runs WHERE model_version_id=? "
            "UNION ALL SELECT 'study', study_id, status FROM studies WHERE model_version_id=? "
            "UNION ALL SELECT 'report', rr.report_id, rr.title FROM research_reports rr "
            "JOIN studies s ON s.study_id=rr.study_id WHERE s.model_version_id=? "
            "UNION ALL SELECT 'report', rr.report_id, rr.title FROM research_reports rr "
            "JOIN comparisons c ON c.comparison_id=rr.comparison_id "
            "JOIN studies s ON s.study_id=c.study_id WHERE s.model_version_id=? "
            "ORDER BY reference_type, reference_id",
            (version_id, version_id, version_id, version_id),
        ).fetchall()
        return [dict(row) for row in rows]

    def delete_model_version(self, version_id: str) -> dict[str, Any]:
        self.initialize()
        already_deleted = False
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT model_id, deleted_at FROM model_versions WHERE version_id=?",
                (version_id,),
            ).fetchone()
            if row is None:
                raise KeyError(version_id)
            if row["deleted_at"] is not None:
                already_deleted = True
            else:
                references = self._model_version_references_tx(conn, version_id)
                if references:
                    raise ReferenceConflictError(
                        "model version is still referenced by durable runs, studies, or reports",
                        references=references,
                    )
                now = _now()
                conn.execute(
                    "UPDATE model_versions SET deleted_at=? WHERE version_id=?",
                    (now, version_id),
                )
                # Keep branch history readable while ensuring a deleted snapshot is
                # never selected as the next branch head.
                conn.execute(
                    "UPDATE model_branches SET head_version_id=(SELECT version_id FROM model_versions "
                    "WHERE model_id=? AND branch_name=model_branches.name AND deleted_at IS NULL "
                    "ORDER BY revision DESC LIMIT 1), updated_at=? "
                    "WHERE model_id=? AND head_version_id=? AND deleted_at IS NULL",
                    (row["model_id"], now, row["model_id"], version_id),
                )
        del already_deleted
        return self.get_model_version(version_id, include_deleted=True)  # type: ignore[return-value]

    def restore_model_version(self, version_id: str) -> dict[str, Any]:
        self.initialize()
        already_active = False
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT model_id, deleted_at FROM model_versions WHERE version_id=?",
                (version_id,),
            ).fetchone()
            if row is None:
                raise KeyError(version_id)
            if row["deleted_at"] is None:
                already_active = True
            else:
                model = conn.execute(
                    "SELECT deleted_at FROM models WHERE model_id=?", (row["model_id"],)
                ).fetchone()
                if model is None or model["deleted_at"] is not None:
                    raise ValueError("restore the parent model before restoring its version")
                now = _now()
                conn.execute(
                    "UPDATE model_versions SET deleted_at=NULL WHERE version_id=?",
                    (version_id,),
                )
                conn.execute(
                    "UPDATE model_branches SET head_version_id=?, updated_at=? "
                    "WHERE model_id=? AND name=(SELECT branch_name FROM model_versions WHERE version_id=?) "
                    "AND deleted_at IS NULL AND head_version_id IS NULL",
                    (version_id, now, row["model_id"], version_id),
                )
        del already_active
        return self.get_model_version(version_id)  # type: ignore[return-value]

    def delete_model(self, model_id: str) -> dict[str, Any]:
        self.initialize()
        already_deleted = False
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT deleted_at FROM models WHERE model_id=?", (model_id,)
            ).fetchone()
            if row is None:
                raise KeyError(model_id)
            if row["deleted_at"] is not None:
                already_deleted = True
            else:
                versions = conn.execute(
                    "SELECT version_id FROM model_versions WHERE model_id=? AND deleted_at IS NULL",
                    (model_id,),
                ).fetchall()
                references: list[dict[str, Any]] = []
                for version in versions:
                    references.extend(
                        self._model_version_references_tx(conn, version["version_id"])
                    )
                if references:
                    raise ReferenceConflictError(
                        "model is still referenced by durable runs, studies, or reports",
                        references=references,
                    )
                now = _now()
                conn.execute("UPDATE models SET deleted_at=?, updated_at=? WHERE model_id=?", (now, now, model_id))
                conn.execute(
                    "UPDATE model_versions SET deleted_at=? WHERE model_id=? AND deleted_at IS NULL",
                    (now, model_id),
                )
                conn.execute(
                    "UPDATE model_branches SET deleted_at=?, updated_at=? "
                    "WHERE model_id=? AND deleted_at IS NULL",
                    (now, now, model_id),
                )
                conn.execute(
                    "UPDATE model_tags SET deleted_at=?, updated_at=? "
                    "WHERE model_id=? AND deleted_at IS NULL",
                    (now, now, model_id),
                )
        del already_deleted
        return self.get_model(model_id, include_deleted=True)  # type: ignore[return-value]

    def restore_model(self, model_id: str) -> dict[str, Any]:
        self.initialize()
        already_active = False
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT deleted_at FROM models WHERE model_id=?", (model_id,)
            ).fetchone()
            if row is None:
                raise KeyError(model_id)
            if row["deleted_at"] is None:
                already_active = True
            else:
                marker = row["deleted_at"]
                now = _now()
                conn.execute(
                    "UPDATE models SET deleted_at=NULL, updated_at=? WHERE model_id=?",
                    (now, model_id),
                )
                conn.execute(
                    "UPDATE model_versions SET deleted_at=NULL WHERE model_id=? AND deleted_at=?",
                    (model_id, marker),
                )
                conn.execute(
                    "UPDATE model_branches SET deleted_at=NULL, updated_at=? "
                    "WHERE model_id=? AND deleted_at=?",
                    (now, model_id, marker),
                )
                conn.execute(
                    "UPDATE model_tags SET deleted_at=NULL, updated_at=? "
                    "WHERE model_id=? AND deleted_at=?",
                    (now, model_id, marker),
                )
        del already_active
        return self.get_model(model_id)  # type: ignore[return-value]

    # -- Study and DOE --------------------------------------------------

    def create_study(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(payload, dict):
            raise ValueError("study payload must be an object")
        self.initialize()
        study_type = str(payload.get("type") or payload.get("study_type") or "").strip()
        if study_type not in _STUDY_TYPES:
            raise ValueError(f"unsupported study type: {study_type or '<empty>'}")
        model_version_id = _required_text(payload.get("model_version_id"), "model_version_id")
        if self.get_model_version(model_version_id) is None:
            raise ValueError("model_version_id does not exist")
        definition = payload.get("definition") or {}
        self._validate_study_definition(definition)
        study_id = str(payload.get("study_id") or uuid.uuid4().hex).strip()
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            if conn.execute(
                "SELECT 1 FROM studies WHERE study_id=?", (study_id,)
            ).fetchone():
                raise ValueError(f"Study already exists: {study_id}")
            conn.execute(
                "INSERT INTO studies(study_id, project_id, model_version_id, "
                "study_type, name, status, created_by, created_at, updated_at) "
                "VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?)",
                (
                    study_id,
                    payload.get("project_id"),
                    model_version_id,
                    study_type,
                    _required_text(payload.get("name"), "name"),
                    payload.get("created_by"),
                    now,
                    now,
                ),
            )
            conn.execute(
                "INSERT INTO study_revisions(study_id, revision, definition, "
                "fingerprint, created_by, created_at) VALUES (?, 1, ?, ?, ?, ?)",
                (
                    study_id,
                    _canonical(definition),
                    _fingerprint(definition),
                    payload.get("created_by"),
                    now,
                ),
            )
        return self.get_study(study_id)  # type: ignore[return-value]

    def delete_study(self, study_id: str) -> dict[str, Any]:
        """Soft-delete a Study while retaining its revisions and evidence."""
        self.initialize()
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT deleted_at FROM studies WHERE study_id=?", (study_id,)
            ).fetchone()
            if row is None:
                raise KeyError(study_id)
            if row["deleted_at"] is None:
                conn.execute(
                    "UPDATE studies SET deleted_at=?, updated_at=? WHERE study_id=?",
                    (now, now, study_id),
                )
        return self.get_study(study_id, include_deleted=True)  # type: ignore[return-value]

    def restore_study(self, study_id: str) -> dict[str, Any]:
        """Restore a soft-deleted Study without rewriting its revisions."""
        self.initialize()
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT deleted_at, model_version_id FROM studies WHERE study_id=?",
                (study_id,),
            ).fetchone()
            if row is None:
                raise KeyError(study_id)
            if row["deleted_at"] is not None:
                if conn.execute(
                    "SELECT 1 FROM model_versions WHERE version_id=? AND deleted_at IS NULL",
                    (row["model_version_id"],),
                ).fetchone() is None:
                    raise ValueError("restore the parent model version before restoring its Study")
                conn.execute(
                    "UPDATE studies SET deleted_at=NULL, updated_at=? WHERE study_id=?",
                    (now, study_id),
                )
        return self.get_study(study_id)  # type: ignore[return-value]

    def create_study_revision(
        self, study_id: str, definition: dict[str, Any], *, created_by: str | None = None
    ) -> dict[str, Any]:
        if not isinstance(definition, dict):
            raise ValueError("study definition must be an object")
        self.initialize()
        self._validate_study_definition(definition)
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            if not conn.execute(
                "SELECT 1 FROM studies WHERE study_id=? AND deleted_at IS NULL",
                (study_id,),
            ).fetchone():
                raise KeyError(study_id)
            revision = int(
                conn.execute(
                    "SELECT COALESCE(MAX(revision), 0) + 1 FROM study_revisions WHERE study_id=?",
                    (study_id,),
                ).fetchone()[0]
            )
            conn.execute(
                "INSERT INTO study_revisions(study_id, revision, definition, "
                "fingerprint, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    study_id,
                    revision,
                    _canonical(definition),
                    _fingerprint(definition),
                    created_by,
                    now,
                ),
            )
            conn.execute(
                "UPDATE studies SET status='draft', updated_at=? WHERE study_id=?",
                (now, study_id),
            )
        return self.get_study(study_id, revision=revision)  # type: ignore[return-value]

    def list_studies(self, project_id: str | None = None) -> list[dict[str, Any]]:
        self.initialize()
        where = "WHERE deleted_at IS NULL"
        values: list[Any] = []
        if project_id:
            where += " AND project_id=?"
            values.append(project_id)
        with self.runs._connection() as conn:  # noqa: SLF001
            rows = conn.execute(
                f"SELECT * FROM studies {where} ORDER BY updated_at DESC", values
            ).fetchall()
        return [dict(row) for row in rows]

    def get_study(
        self,
        study_id: str,
        *,
        revision: int | None = None,
        include_deleted: bool = False,
    ) -> dict[str, Any] | None:
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            study = conn.execute(
                "SELECT * FROM studies WHERE study_id=? "
                + ("" if include_deleted else "AND deleted_at IS NULL"),
                (study_id,),
            ).fetchone()
            if study is None:
                return None
            if revision is None:
                revision_row = conn.execute(
                    "SELECT * FROM study_revisions WHERE study_id=? ORDER BY revision DESC LIMIT 1",
                    (study_id,),
                ).fetchone()
            else:
                revision_row = conn.execute(
                    "SELECT * FROM study_revisions WHERE study_id=? AND revision=?",
                    (study_id, revision),
                ).fetchone()
        if revision_row is None:
            return None
        item = dict(study)
        item["revision"] = int(revision_row["revision"])
        item["definition"] = _json(revision_row["definition"])
        item["fingerprint"] = revision_row["fingerprint"]
        return item

    @staticmethod
    def _validate_study_definition(definition: Any) -> None:
        if not isinstance(definition, dict):
            raise ValueError("study definition must be an object")
        _canonical(definition)
        parameters = definition.get("parameters") or []
        if not isinstance(parameters, list):
            raise ValueError("definition.parameters must be an array")
        keys: set[str] = set()
        for parameter in parameters:
            if not isinstance(parameter, dict):
                raise ValueError("each parameter must be an object")
            key = _required_text(parameter.get("key"), "parameter key")
            if key in keys:
                raise ValueError(f"duplicate parameter key: {key}")
            keys.add(key)
            kind = str(parameter.get("type") or "continuous")
            if kind not in {"continuous", "integer", "categorical"}:
                raise ValueError(f"unsupported parameter type: {kind}")
            if kind == "categorical":
                values = parameter.get("values")
                if not isinstance(values, list) or not values:
                    raise ValueError(f"categorical parameter {key} requires values")
            else:
                lower = parameter.get("lower")
                upper = parameter.get("upper")
                if not isinstance(lower, (int, float)) or not isinstance(upper, (int, float)):
                    raise ValueError(f"numeric parameter {key} requires lower and upper")
                if not math.isfinite(float(lower)) or not math.isfinite(float(upper)) or lower > upper:
                    raise ValueError(f"invalid bounds for parameter: {key}")

    def generate_design(
        self,
        study_id: str,
        *,
        revision: int | None = None,
        method: str = "latin_hypercube",
        budget: int = 10,
        seed: int = 0,
        constraints: Any | None = None,
        enqueue: bool = False,
    ) -> list[dict[str, Any]]:
        with self._design_lock:
            if budget < 1 or budget > 10000:
                raise ValueError("budget must be between 1 and 10000")
            study = self.get_study(study_id, revision=revision)
            if study is None:
                raise KeyError(study_id)
            revision = int(study["revision"])
            definition = study["definition"]
            parameters = definition.get("parameters") or []
            normalized_method = self._normalize_design_method(method)
            points = self._design_points(parameters, normalized_method, budget, seed)
            effective_constraints = (
                definition.get("constraints") if constraints is None else constraints
            )
            if effective_constraints is None:
                effective_constraints = []
            # Constraints are part of a DOE request even when the lightweight
            # engine does not yet evaluate every domain-specific expression.
            # Persisting them in the fingerprint guarantees that changing a
            # constraint never reuses a previous design for this revision.
            _canonical(effective_constraints)
            # A Study revision can have multiple DOE designs.  The design
            # fingerprint is derived from the complete immutable Study
            # definition (including constraints), DOE method, budget, seed and
            # generated points.  This prevents a changed method/budget/seed
            # from silently reusing realizations created by an earlier design.
            design_fingerprint = _fingerprint(
                {
                    "study_fingerprint": study["fingerprint"],
                    "method": normalized_method,
                    "budget": budget,
                    "seed": seed,
                    "constraints": effective_constraints,
                    "parameters": parameters,
                    "points": points,
                }
            )
            existing = self.list_realizations(
                study_id,
                revision=revision,
                design_fingerprint=design_fingerprint,
            )
            # A request may have been interrupted after one or more Runs were
            # committed but before their realization rows were written.  Only
            # treat the design as complete when every generated point exists;
            # the stable sequence keys below make the retry idempotent.
            if len(existing) >= len(points):
                return existing
            design_version = self._design_version(
                study_id, revision, design_fingerprint
            )
            forward_operation = str(
                definition.get("forward_operation") or "study.realization.run"
            )
            provider_id = definition.get("provider_id")
            created: list[dict[str, Any]] = []
            for sequence, values in enumerate(points, start=1):
                # Stable IDs make retries safe even when the first request
                # committed the Run but failed before inserting its
                # realization row.
                realization_id = uuid.uuid5(
                    uuid.NAMESPACE_URL,
                    f"qwenpaw:study:{study_id}:{revision}:{design_fingerprint}:{sequence}",
                ).hex
                run = self.runs.create_run(
                    {
                        "operation": forward_operation,
                        "provider_id": provider_id,
                        "project_id": study.get("project_id"),
                        "model_version_id": study["model_version_id"],
                        "study_id": study_id,
                        "status": RunStatus.QUEUED if enqueue else RunStatus.DRAFT,
                        "input_snapshot": {
                            "study_revision": revision,
                            "study_fingerprint": study["fingerprint"],
                            "design_fingerprint": design_fingerprint,
                            "design_version": design_version,
                            "design_method": normalized_method,
                            "design_budget": budget,
                            "design_seed": seed,
                            "design_constraints": effective_constraints,
                            "realization_id": realization_id,
                            "seed": seed + sequence - 1,
                            "parameters": values,
                        },
                    },
                    idempotency_key=(
                        f"study:{study_id}:{revision}:{design_fingerprint}:{sequence}"
                    ),
                )
                now = _now()
                with self.runs._connection(write=True) as conn:  # noqa: SLF001
                    conn.execute(
                        "INSERT INTO realizations(realization_id, study_id, revision, "
                        "design_fingerprint, design_version, sequence, seed, "
                        "parameter_values, run_id, status, created_at, updated_at) "
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
                        "ON CONFLICT DO NOTHING",
                        (
                            realization_id,
                            study_id,
                            revision,
                            design_fingerprint,
                            design_version,
                            sequence,
                            seed + sequence - 1,
                            _canonical(values),
                            run["run_id"],
                            run["status"],
                            now,
                            now,
                        ),
                    )
                    row = conn.execute(
                        "SELECT * FROM realizations WHERE study_id=? AND revision=? "
                        "AND design_fingerprint=? AND sequence=?",
                        (study_id, revision, design_fingerprint, sequence),
                    ).fetchone()
                if row is None:  # pragma: no cover - defensive database guard
                    raise RuntimeError("failed to persist study realization")
                created.append(self._public_realization(row))
            with self.runs._connection(write=True) as conn:  # noqa: SLF001
                conn.execute(
                    "UPDATE studies SET status='running', updated_at=? WHERE study_id=?",
                    (_now(), study_id),
                )
            return created

    def _design_version(
        self, study_id: str, revision: int, design_fingerprint: str
    ) -> int:
        """Return a stable 1-based ordinal for a design in a Study revision."""
        self.initialize()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            existing = conn.execute(
                "SELECT design_version FROM realizations WHERE study_id=? "
                "AND revision=? AND design_fingerprint=? LIMIT 1",
                (study_id, revision, design_fingerprint),
            ).fetchone()
            if existing is not None:
                return int(existing[0])
            row = conn.execute(
                "SELECT COALESCE(MAX(design_version), 0) + 1 FROM realizations "
                "WHERE study_id=? AND revision=?",
                (study_id, revision),
            ).fetchone()
        return int(row[0])

    @classmethod
    def _design_points(
        cls,
        parameters: list[dict[str, Any]],
        method: str,
        budget: int,
        seed: int,
    ) -> list[dict[str, Any]]:
        method = cls._normalize_design_method(method)
        if not parameters:
            return [{}]
        rng = random.Random(seed)
        if method in {"latin_hypercube", "lhs"}:
            columns: list[list[float]] = []
            for _ in parameters:
                values = [(index + rng.random()) / budget for index in range(budget)]
                rng.shuffle(values)
                columns.append(values)
            samples = [[columns[col][row] for col in range(len(parameters))] for row in range(budget)]
        elif method in {"random", "monte_carlo"}:
            samples = [[rng.random() for _ in parameters] for _ in range(budget)]
        elif method == "sobol":
            # Scramble the deterministic low-discrepancy sequence with the
            # requested seed.  The first point remains reproducible for a
            # given seed while different Study realizations do not silently
            # share an identical design.
            base = cls._sobol_samples(len(parameters), budget)
            if seed:
                shift_rng = random.Random(seed)
                shifts = [shift_rng.random() for _ in parameters]
                samples = [
                    [(value + shifts[index]) % 1.0 for index, value in enumerate(point)]
                    for point in base
                ]
            else:
                samples = base
        elif method in {"full_factorial", "factorial"}:
            axes: list[list[float]] = []
            for parameter in parameters:
                if parameter.get("type") == "categorical":
                    count = len(parameter["values"])
                    axes.append([(index + 0.5) / count for index in range(count)])
                else:
                    levels = int(parameter.get("levels") or 2)
                    if levels < 1 or levels > 20:
                        raise ValueError("factorial levels must be between 1 and 20")
                    axes.append([0.5] if levels == 1 else [i / (levels - 1) for i in range(levels)])
            combinations = itertools.product(*axes)
            samples = list(itertools.islice(combinations, budget))
        else:
            raise ValueError(f"unsupported design method: {method or '<empty>'}")
        return [
            {
                parameter["key"]: cls._map_unit_interval(parameter, sample[index])
                for index, parameter in enumerate(parameters)
            }
            for sample in samples
        ]

    @staticmethod
    def _normalize_design_method(method: Any) -> str:
        normalized = str(method or "").strip().lower()
        return {
            "lhs": "latin_hypercube",
            "monte_carlo": "random",
            "factorial": "full_factorial",
        }.get(normalized, normalized)

    @staticmethod
    def _map_unit_interval(parameter: dict[str, Any], value: float) -> Any:
        kind = str(parameter.get("type") or "continuous")
        if kind == "categorical":
            values = parameter["values"]
            return values[min(len(values) - 1, int(value * len(values)))]
        lower = float(parameter["lower"])
        upper = float(parameter["upper"])
        mapped = lower + value * (upper - lower)
        return int(round(mapped)) if kind == "integer" else mapped

    @staticmethod
    def _sobol_samples(dimensions: int, count: int) -> list[list[float]]:
        """Generate a deterministic Sobol sequence for up to eight dimensions."""
        if dimensions < 1 or dimensions > 8:
            raise ValueError("built-in Sobol design supports 1 to 8 parameters")
        bits = 32
        # Primitive polynomial/direction seeds from the Bratley-Fox table.
        parameters = {
            2: (1, 0, [1]),
            3: (2, 1, [1, 3]),
            4: (3, 1, [1, 3, 1]),
            5: (3, 2, [1, 1, 1]),
            6: (4, 1, [1, 3, 5, 13]),
            7: (4, 4, [1, 1, 5, 5]),
            8: (5, 2, [1, 3, 3, 9, 7]),
        }
        directions: list[list[int]] = [[0] * (bits + 1) for _ in range(dimensions)]
        for index in range(1, bits + 1):
            directions[0][index] = 1 << (bits - index)
        for dimension in range(2, dimensions + 1):
            degree, coefficient, seeds = parameters[dimension]
            row = directions[dimension - 1]
            for index in range(1, degree + 1):
                row[index] = seeds[index - 1] << (bits - index)
            for index in range(degree + 1, bits + 1):
                value = row[index - degree] ^ (row[index - degree] >> degree)
                for offset in range(1, degree):
                    if (coefficient >> (degree - 1 - offset)) & 1:
                        value ^= row[index - offset]
                row[index] = value
        state = [0] * dimensions
        result: list[list[float]] = []
        scale = float(1 << bits)
        for sequence in range(1, count + 1):
            previous = sequence - 1
            direction_index = 1
            while previous & 1:
                previous >>= 1
                direction_index += 1
            for dimension in range(dimensions):
                state[dimension] ^= directions[dimension][direction_index]
            result.append([value / scale for value in state])
        return result

    def list_realizations(
        self,
        study_id: str,
        *,
        revision: int | None = None,
        design_fingerprint: str | None = None,
    ) -> list[dict[str, Any]]:
        self.initialize()
        clauses = ["study_id=?"]
        values: list[Any] = [study_id]
        if revision is not None:
            clauses.append("revision=?")
            values.append(revision)
        if design_fingerprint is not None:
            clauses.append("design_fingerprint=?")
            values.append(_required_text(design_fingerprint, "design_fingerprint"))
        with self.runs._connection() as conn:  # noqa: SLF001
            rows = conn.execute(
                f"SELECT * FROM realizations WHERE {' AND '.join(clauses)} "
                "ORDER BY revision, sequence",
                values,
            ).fetchall()
        return [self._public_realization(row) for row in rows]

    def list_designs(
        self, study_id: str, *, revision: int | None = None
    ) -> list[dict[str, Any]]:
        """List distinct DOE designs generated for a Study revision.

        A design is identified by its fingerprint; this endpoint gives the UI
        a compact catalog without requiring it to infer designs from points.
        """
        self.initialize()
        clauses = ["study_id=?"]
        values: list[Any] = [study_id]
        if revision is not None:
            clauses.append("revision=?")
            values.append(revision)
        with self.runs._connection() as conn:  # noqa: SLF001
            rows = conn.execute(
                "SELECT design_fingerprint, design_version, revision, COUNT(*) AS "
                "realization_count, MIN(seed) AS seed, MIN(created_at) AS created_at "
                f"FROM realizations WHERE {' AND '.join(clauses)} "
                "GROUP BY design_fingerprint, design_version, revision "
                "ORDER BY revision, design_version",
                values,
            ).fetchall()
        return [
            {
                "design_fingerprint": row["design_fingerprint"],
                "design_version": int(row["design_version"]),
                "revision": int(row["revision"]),
                "realization_count": int(row["realization_count"]),
                "seed": int(row["seed"]),
                "created_at": row["created_at"],
            }
            for row in rows
        ]

    @staticmethod
    def _public_realization(row: Any) -> dict[str, Any]:
        """Return a stable realization shape for fresh and replayed designs."""
        return {
            "realization_id": row["realization_id"],
            "study_id": row["study_id"],
            "revision": int(row["revision"]),
            "design_fingerprint": row["design_fingerprint"],
            "design_version": int(row["design_version"]),
            "sequence": int(row["sequence"]),
            "seed": int(row["seed"]),
            "parameter_values": _json(row["parameter_values"]),
            "run_id": row["run_id"],
            "status": row["status"],
            "failure_reason": row["failure_reason"],
        }

    # -- Metrics, uncertainty, sensitivity and comparison -------------

    def record_metrics(
        self, realization_id: str, metrics: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        self.initialize()
        if not isinstance(metrics, list) or not metrics:
            raise ValueError("metrics must be a non-empty array")
        if any(not isinstance(metric, dict) for metric in metrics):
            raise ValueError("each metric must be an object")
        metric_keys = [
            (_required_text(metric.get("key"), "metric key"), str(metric.get("time_basis") or ""))
            for metric in metrics
        ]
        if len(metric_keys) != len(set(metric_keys)):
            raise ValueError("metrics must not contain duplicate key/time_basis pairs")
        metric_ids = [str(metric.get("metric_id") or "").strip() for metric in metrics]
        supplied_ids = [metric_id for metric_id in metric_ids if metric_id]
        if len(supplied_ids) != len(set(supplied_ids)):
            raise ValueError("metrics must not contain duplicate metric_id values")
        now = _now()
        normalized: list[dict[str, Any]] = []
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            realization = conn.execute(
                "SELECT run_id FROM realizations WHERE realization_id=?", (realization_id,)
            ).fetchone()
            if realization is None:
                raise KeyError(realization_id)
            run_id = realization["run_id"]
            if run_id:
                run = conn.execute(
                    "SELECT status FROM runs WHERE run_id=?", (run_id,)
                ).fetchone()
                if run is None or str(run["status"]).strip().lower() != RunStatus.SUCCEEDED:
                    raise ValueError(
                        "metrics can only be recorded for a realization whose Run succeeded"
                    )
            for metric in metrics:
                key = _required_text(metric.get("key"), "metric key")
                value = metric.get("value")
                if not isinstance(value, (int, float)) or not math.isfinite(float(value)):
                    raise ValueError(f"metric {key} must have a finite numeric value")
                uncertainty = metric.get("uncertainty") or {}
                provenance = metric.get("provenance") or {}
                if not isinstance(uncertainty, dict) or not isinstance(provenance, dict):
                    raise ValueError("metric uncertainty and provenance must be objects")
                item = {
                    "metric_id": str(metric.get("metric_id") or uuid.uuid4().hex),
                    "realization_id": realization_id,
                    "key": key,
                    "label": str(metric.get("label") or key),
                    "value": float(value),
                    "unit": str(metric.get("unit") or ""),
                    "time_basis": str(metric.get("time_basis") or ""),
                    "uncertainty": uncertainty,
                    "provenance": provenance,
                    "created_at": now,
                }
                # A caller supplied metric id must not silently overwrite a
                # different realization's metric.  The primary key would
                # otherwise surface as an opaque SQLite error through HTTP.
                existing_id = conn.execute(
                    "SELECT metric_id FROM metrics WHERE metric_id=?",
                    (item["metric_id"],),
                ).fetchone()
                if existing_id is not None:
                    same_key = conn.execute(
                        "SELECT 1 FROM metrics WHERE metric_id=? AND realization_id=? "
                        "AND metric_key=? AND time_basis=?",
                        (
                            item["metric_id"],
                            realization_id,
                            key,
                            item["time_basis"],
                        ),
                    ).fetchone()
                    if same_key is None:
                        raise ValueError(
                            f"metric_id already belongs to another metric: {item['metric_id']}"
                        )
                conn.execute(
                    "INSERT INTO metrics(metric_id, realization_id, metric_key, label, "
                    "value, unit, time_basis, uncertainty, provenance, created_at) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(realization_id, "
                    "metric_key, time_basis) DO UPDATE SET value=excluded.value, "
                    "label=excluded.label, unit=excluded.unit, uncertainty=excluded.uncertainty, "
                    "provenance=excluded.provenance, created_at=excluded.created_at",
                    (
                        item["metric_id"],
                        realization_id,
                        key,
                        item["label"],
                        item["value"],
                        item["unit"],
                        item["time_basis"],
                        _canonical(uncertainty),
                        _canonical(provenance),
                        now,
                    ),
                )
                persisted = conn.execute(
                    "SELECT metric_id, created_at FROM metrics WHERE realization_id=? "
                    "AND metric_key=? AND time_basis=?",
                    (realization_id, key, item["time_basis"]),
                ).fetchone()
                if persisted is not None:
                    item["metric_id"] = persisted["metric_id"]
                    item["created_at"] = persisted["created_at"]
                normalized.append(item)
            conn.execute(
                "UPDATE realizations SET status='succeeded', updated_at=? WHERE realization_id=?",
                (now, realization_id),
            )
        return normalized

    def study_analysis(
        self,
        study_id: str,
        metric_key: str,
        *,
        time_basis: str | None = None,
    ) -> dict[str, Any]:
        self.initialize()
        metric_key = _required_text(metric_key, "metric key")
        normalized_time_basis = (
            str(time_basis).strip() if time_basis is not None else None
        )
        with self.runs._connection() as conn:  # noqa: SLF001
            time_clause = ""
            query_values: list[Any] = [metric_key]
            if normalized_time_basis is not None:
                time_clause = " AND m.time_basis=?"
                query_values.append(normalized_time_basis)
            query_values.append(study_id)
            rows = conn.execute(
                "SELECT r.realization_id, r.sequence, r.run_id, r.parameter_values, "
                "r.status, r.failure_reason, m.value, m.unit, m.label, m.time_basis FROM realizations r LEFT JOIN metrics m ON "
                "m.realization_id=r.realization_id AND m.metric_key=? "
                + time_clause + " "
                "WHERE r.study_id=? ORDER BY r.revision, r.sequence",
                query_values,
            ).fetchall()
            study = conn.execute(
                "SELECT sr.definition FROM studies s JOIN study_revisions sr "
                "ON sr.study_id=s.study_id WHERE s.study_id=? "
                "ORDER BY sr.revision DESC LIMIT 1",
                (study_id,),
            ).fetchone()
        definition = _json(study["definition"]) if study is not None else {}
        successful = [
            row for row in rows
            if row["value"] is not None and str(row["status"]).lower() == "succeeded"
        ]
        successful_ids = {row["realization_id"] for row in successful}
        values = [float(row["value"]) for row in successful]
        failures = [row for row in rows if row["realization_id"] not in successful_ids]
        failure_count = len(failures)
        units = sorted({str(row["unit"] or "") for row in successful})
        time_bases = sorted({str(row["time_basis"] or "") for row in successful})
        unit_consistent = len(units) <= 1
        time_basis_consistent = len(time_bases) <= 1
        samples = [
            {
                "realization_id": row["realization_id"],
                "sequence": int(row["sequence"]),
                "run_id": row["run_id"],
                "status": row["status"],
                "value": float(row["value"]) if row["value"] is not None else None,
                "unit": row["unit"] or "",
                "label": row["label"] or metric_key,
                "time_basis": row["time_basis"] or "",
                "parameters": _json(row["parameter_values"]),
            }
            for row in rows
        ]
        failure_details = [
            {
                "realization_id": row["realization_id"],
                "sequence": int(row["sequence"]),
                "run_id": row["run_id"],
                "status": row["status"],
                "reason": row["failure_reason"] or (
                    "metric_missing" if row["value"] is None else "run_not_succeeded"
                ),
            }
            for row in failures
        ]
        correlations: list[dict[str, Any]] = []
        parameter_keys = sorted(
            {
                key
                for row in successful
                for key, value in _json(row["parameter_values"]).items()
                if isinstance(value, (int, float))
            }
        )
        for key in parameter_keys:
            pairs = [
                (float(params[key]), float(row["value"]))
                for row in successful
                if isinstance((params := _json(row["parameter_values"])).get(key), (int, float))
            ]
            coefficient: float | None = None
            if len(pairs) >= 3:
                xs, ys = zip(*pairs)
                if len(set(xs)) > 1 and len(set(ys)) > 1:
                    coefficient = statistics.correlation(xs, ys)
            correlations.append(
                {
                    "parameter": key,
                    "coefficient": coefficient,
                    "absolute_effect": abs(coefficient) if coefficient is not None else None,
                    "sample_count": len(pairs),
                    "method": "pearson_screening",
                }
            )
        correlations.sort(
            key=lambda item: item["absolute_effect"] if item["absolute_effect"] is not None else -1,
            reverse=True,
        )
        return {
            "study_id": study_id,
            "metric_key": metric_key,
            "time_basis": normalized_time_basis,
            "sample_count": len(values),
            "failure_count": failure_count,
            "failure_ratio": failure_count / len(rows) if rows else 0.0,
            "unit": units[0] if len(units) == 1 else "",
            "units": units,
            "unit_consistent": unit_consistent,
            "time_bases": time_bases,
            "time_basis_consistent": time_basis_consistent,
            "samples": samples,
            "failures": failure_details,
            "coverage": {
                "total_realizations": len(rows),
                "successful_samples": len(successful),
                "failed_samples": failure_count,
                "success_ratio": len(successful) / len(rows) if rows else 0.0,
            },
            "assumptions": definition.get("assumptions") or [],
            "data_gaps": definition.get("data_gaps")
            or definition.get("data_requirements")
            or [],
            "statistics": {
                "minimum": min(values) if values else None,
                "maximum": max(values) if values else None,
                "mean": statistics.fmean(values) if values else None,
                "standard_deviation": statistics.stdev(values) if len(values) > 1 else None,
                "p10": _percentile(values, 0.10),
                "p50": _percentile(values, 0.50),
                "p90": _percentile(values, 0.90),
            },
            "sensitivity": correlations,
            "warnings": [
                *(["Fewer than 10 successful samples; percentile estimates are unstable."]
                  if 0 < len(values) < 10 else []),
                *(["Metric unit is inconsistent across successful samples."]
                  if not unit_consistent else []),
                *(["Metric time basis is inconsistent; pass time_basis to compare like-for-like samples."]
                  if not time_basis_consistent else []),
                *(["No successful samples are available for this metric."]
                  if not values and rows else []),
            ],
        }

    # -- Optional lightweight surrogate and recommendation helpers ------

    @staticmethod
    def _solve_linear_system(matrix: list[list[float]], vector: list[float]) -> list[float]:
        """Solve a small regularized linear system without scientific deps."""
        n = len(vector)
        augmented = [list(matrix[i]) + [float(vector[i])] for i in range(n)]
        for col in range(n):
            pivot = max(range(col, n), key=lambda row: abs(augmented[row][col]))
            if abs(augmented[pivot][col]) < 1e-12:
                augmented[col][col] += 1e-8
                pivot = col
            augmented[col], augmented[pivot] = augmented[pivot], augmented[col]
            scale = augmented[col][col]
            if abs(scale) < 1e-15:
                raise ValueError("surrogate design matrix is singular")
            augmented[col] = [value / scale for value in augmented[col]]
            for row in range(n):
                if row == col:
                    continue
                factor = augmented[row][col]
                if factor:
                    augmented[row] = [
                        left - factor * right
                        for left, right in zip(augmented[row], augmented[col])
                    ]
        return [augmented[i][-1] for i in range(n)]

    def train_surrogate(
        self,
        study_id: str,
        metric_key: str,
        *,
        revision: int | None = None,
        algorithm: str = "linear",
        min_samples: int = 3,
        created_by: str | None = None,
    ) -> dict[str, Any]:
        """Fit and persist a transparent numeric surrogate for a Study metric.

        This is deliberately a small standard-library baseline.  Providers
        can register richer Gaussian-process or tree models later while
        retaining the same persisted training-data and applicability contract.
        """
        normalized_algorithm = str(algorithm or "linear").strip().lower()
        if normalized_algorithm != "linear":
            raise ValueError("unsupported surrogate algorithm: " + normalized_algorithm)
        analysis = self.study_analysis(study_id, metric_key)
        samples = [
            sample for sample in analysis.get("samples", [])
            if sample.get("value") is not None and sample.get("status") == "succeeded"
        ]
        if len(samples) < max(3, int(min_samples)):
            raise ValueError("at least three successful samples are required for a surrogate")
        feature_keys = sorted({
            key
            for sample in samples
            for key, value in (sample.get("parameters") or {}).items()
            if isinstance(value, (int, float)) and not isinstance(value, bool)
        })
        if not feature_keys:
            raise ValueError("surrogate requires at least one numeric parameter")
        rows = [[1.0] + [float((sample.get("parameters") or {}).get(key)) for key in feature_keys] for sample in samples]
        targets = [float(sample["value"]) for sample in samples]
        width = len(feature_keys) + 1
        gram = [[0.0] * width for _ in range(width)]
        rhs = [0.0] * width
        for row, target in zip(rows, targets):
            for i in range(width):
                rhs[i] += row[i] * target
                for j in range(width):
                    gram[i][j] += row[i] * row[j]
        coefficients = self._solve_linear_system(gram, rhs)
        predictions = [sum(a * b for a, b in zip(coefficients, row)) for row in rows]
        residuals = [actual - predicted for actual, predicted in zip(targets, predictions)]
        mean_target = statistics.fmean(targets)
        ss_tot = sum((value - mean_target) ** 2 for value in targets)
        ss_res = sum(value * value for value in residuals)
        bounds = {
            key: {
                "minimum": min(float((sample.get("parameters") or {})[key]) for sample in samples),
                "maximum": max(float((sample.get("parameters") or {})[key]) for sample in samples),
            }
            for key in feature_keys
        }
        study = self.get_study(study_id, revision=revision)
        if study is None:
            raise KeyError(study_id)
        now = _now()
        surrogate_id = uuid.uuid4().hex
        diagnostics = {
            "sample_count": len(samples),
            "rmse": math.sqrt(ss_res / len(samples)),
            "r2": (1.0 - ss_res / ss_tot) if ss_tot > 1e-15 else None,
            "unit": analysis.get("unit") or "",
            "warning": "linear baseline; predictions outside the applicability domain are not valid",
        }
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            conn.execute(
                "INSERT INTO surrogate_models(surrogate_id, study_id, study_revision, metric_key, algorithm, features, coefficients, training_realization_ids, diagnostics, applicability_domain, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    surrogate_id, study_id, int(study["revision"]), metric_key,
                    normalized_algorithm, _canonical(feature_keys), _canonical(coefficients),
                    _canonical([sample["realization_id"] for sample in samples]),
                    _canonical(diagnostics), _canonical(bounds), created_by, now,
                ),
            )
        return {
            "surrogate_id": surrogate_id,
            "study_id": study_id,
            "study_revision": int(study["revision"]),
            "metric_key": metric_key,
            "algorithm": normalized_algorithm,
            "features": feature_keys,
            "coefficients": coefficients,
            "training_realization_ids": [sample["realization_id"] for sample in samples],
            "diagnostics": diagnostics,
            "applicability_domain": bounds,
            "created_by": created_by,
            "created_at": now,
        }

    def list_surrogates(self, study_id: str | None = None) -> list[dict[str, Any]]:
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            if study_id:
                rows = conn.execute("SELECT * FROM surrogate_models WHERE study_id=? ORDER BY created_at DESC", (study_id,)).fetchall()
            else:
                rows = conn.execute("SELECT * FROM surrogate_models ORDER BY created_at DESC").fetchall()
        return [self._public_surrogate(row) for row in rows]

    @staticmethod
    def _public_surrogate(row: Any) -> dict[str, Any]:
        return {
            "surrogate_id": row["surrogate_id"], "study_id": row["study_id"],
            "study_revision": int(row["study_revision"]), "metric_key": row["metric_key"],
            "algorithm": row["algorithm"], "features": _decode_json_value(row["features"], []),
            "coefficients": _decode_json_value(row["coefficients"], []),
            "training_realization_ids": _decode_json_value(row["training_realization_ids"], []),
            "diagnostics": _decode_json_value(row["diagnostics"], {}),
            "applicability_domain": _decode_json_value(row["applicability_domain"], {}),
            "created_by": row["created_by"], "created_at": row["created_at"],
        }

    def get_surrogate(self, surrogate_id: str) -> dict[str, Any] | None:
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            row = conn.execute("SELECT * FROM surrogate_models WHERE surrogate_id=?", (surrogate_id,)).fetchone()
        return self._public_surrogate(row) if row is not None else None

    def predict_surrogate(self, surrogate_id: str, parameters: dict[str, Any]) -> dict[str, Any]:
        surrogate = self.get_surrogate(surrogate_id)
        if surrogate is None:
            raise KeyError(surrogate_id)
        if not isinstance(parameters, dict):
            raise ValueError("parameters must be an object")
        features = surrogate["features"]
        values = [1.0]
        out_of_domain: list[str] = []
        for key in features:
            value = parameters.get(key)
            if not isinstance(value, (int, float)) or isinstance(value, bool) or not math.isfinite(float(value)):
                raise ValueError(f"numeric parameter is required: {key}")
            numeric = float(value)
            values.append(numeric)
            bounds = surrogate["applicability_domain"].get(key) or {}
            if numeric < float(bounds.get("minimum")) or numeric > float(bounds.get("maximum")):
                out_of_domain.append(key)
        prediction = sum(float(a) * float(b) for a, b in zip(surrogate["coefficients"], values))
        return {"surrogate_id": surrogate_id, "prediction": prediction, "unit": surrogate["diagnostics"].get("unit", ""), "out_of_domain": out_of_domain, "warning": "outside applicability domain; run a real simulation" if out_of_domain else None}

    def optimize_study(
        self,
        study_id: str,
        objectives: list[dict[str, Any]],
        *,
        limit: int = 10,
    ) -> dict[str, Any]:
        """Rank completed realizations as auditable candidate recommendations.

        This provider-neutral baseline deliberately optimizes only observed
        runs.  It is a safe first stage before a plugin contributes a genetic,
        Bayesian, or multi-objective optimizer that creates new realizations.
        """
        if not isinstance(objectives, list) or not objectives:
            raise ValueError("objectives must be a non-empty array")
        normalized: list[dict[str, str]] = []
        for objective in objectives:
            if not isinstance(objective, dict):
                raise ValueError("each objective must be an object")
            key = _required_text(objective.get("key"), "objective key")
            direction = str(objective.get("direction") or "maximize").strip().lower()
            if direction not in {"maximize", "minimize"}:
                raise ValueError("objective direction must be maximize or minimize")
            normalized.append({"key": key, "direction": direction})
        try:
            limit = max(1, min(1000, int(limit)))
        except (TypeError, ValueError):
            raise ValueError("limit must be a positive integer") from None
        study = self.get_study(study_id)
        if study is None:
            raise KeyError(study_id)
        realizations = self.list_realizations(study_id)
        placeholders = ",".join("?" for _ in realizations) or "NULL"
        metric_rows: list[Any] = []
        if realizations:
            with self.runs._connection() as conn:  # noqa: SLF001
                metric_rows = conn.execute(
                    f"SELECT realization_id, metric_key, value, unit FROM metrics WHERE realization_id IN ({placeholders})",
                    [item["realization_id"] for item in realizations],
                ).fetchall()
        by_id: dict[str, dict[str, Any]] = {item["realization_id"]: dict(item) for item in realizations}
        for row in metric_rows:
            by_id[row["realization_id"]].setdefault("metrics", {})[row["metric_key"]] = {
                "value": float(row["value"]), "unit": row["unit"] or ""
            }
        candidates = []
        for item in by_id.values():
            metrics = item.get("metrics") or {}
            if item.get("status") != "succeeded" or any(obj["key"] not in metrics for obj in normalized):
                continue
            score = []
            for obj in normalized:
                value = float(metrics[obj["key"]]["value"])
                score.append(value if obj["direction"] == "maximize" else -value)
            candidates.append({**item, "score": score})
        candidates.sort(key=lambda item: tuple(item["score"]), reverse=True)
        for item in candidates:
            item.pop("score", None)
        return {
            "study_id": study_id,
            "study_revision": int(study["revision"]),
            "algorithm": "observed-ranking",
            "objectives": normalized,
            "candidate_count": len(candidates),
            "candidates": candidates[:limit],
            "warnings": [
                "Only completed observed realizations were ranked; no new simulations were generated."
            ],
        }

    def create_comparison(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(payload, dict):
            raise ValueError("comparison payload must be an object")
        realization_ids = payload.get("realization_ids") or []
        metric_keys = payload.get("metric_keys") or []
        if not isinstance(realization_ids, list) or len(realization_ids) < 2:
            raise ValueError("comparison requires at least two realization_ids")
        if any(not isinstance(item, str) or not item.strip() for item in realization_ids):
            raise ValueError("comparison realization_ids must be non-empty strings")
        if len(realization_ids) != len(set(realization_ids)):
            raise ValueError("comparison realization_ids must be unique")
        if not isinstance(metric_keys, list) or not metric_keys:
            raise ValueError("comparison requires metric_keys")
        if any(not isinstance(key, str) or not key.strip() for key in metric_keys):
            raise ValueError("comparison metric_keys must be non-empty strings")
        if len(metric_keys) != len(set(metric_keys)):
            raise ValueError("comparison metric_keys must be unique")
        objectives = payload.get("objectives") or []
        if not isinstance(objectives, list):
            raise ValueError("objectives must be an array")
        normalized_objectives: list[dict[str, Any]] = []
        for objective in objectives:
            if not isinstance(objective, dict):
                raise ValueError("each comparison objective must be an object")
            key = _required_text(objective.get("key"), "objective key")
            direction = str(objective.get("direction") or "minimize").strip().lower()
            if direction not in {"minimize", "maximize"}:
                raise ValueError("objective direction must be minimize or maximize")
            normalized_objectives.append({"key": key, "direction": direction})
        objective_keys = [item["key"] for item in normalized_objectives]
        if len(objective_keys) != len(set(objective_keys)):
            raise ValueError("comparison objectives must use unique metric keys")
        placeholders = ",".join("?" for _ in realization_ids)
        with self.runs._connection() as conn:  # noqa: SLF001
            realization_rows = conn.execute(
                f"SELECT * FROM realizations WHERE realization_id IN ({placeholders})",
                realization_ids,
            ).fetchall()
            metric_rows = conn.execute(
                f"SELECT * FROM metrics WHERE realization_id IN ({placeholders})",
                realization_ids,
            ).fetchall()
        if len(realization_rows) != len(set(realization_ids)):
            raise ValueError("one or more realizations do not exist")
        study_id = payload.get("study_id")
        if study_id is not None:
            study_id = _required_text(study_id, "study_id")
            if any(row["study_id"] != study_id for row in realization_rows):
                raise ValueError("all realizations must belong to study_id")
        metrics_by_realization: dict[str, dict[str, Any]] = {
            realization_id: {} for realization_id in realization_ids
        }
        for row in metric_rows:
            if row["metric_key"] in metric_keys:
                metrics_by_realization[row["realization_id"]][row["metric_key"]] = {
                    "value": float(row["value"]),
                    "unit": row["unit"],
                    "time_basis": row["time_basis"],
                }
        result_rows = []
        realization_map = {row["realization_id"]: row for row in realization_rows}
        for realization_id in realization_ids:
            row = realization_map[realization_id]
            result_rows.append(
                {
                    "realization_id": realization_id,
                    "run_id": row["run_id"],
                    "status": row["status"],
                    "parameters": _json(row["parameter_values"]),
                    "metrics": metrics_by_realization[realization_id],
                }
            )
        # Keep comparison output useful for engineering review: callers need
        # to see why a row was excluded, whether units are comparable, and
        # which inputs actually differ between candidate scenarios.
        metric_units = {
            key: sorted(
                {
                    str(row["metrics"][key].get("unit") or "")
                    for row in result_rows
                    if key in row["metrics"]
                }
            )
            for key in metric_keys
        }
        unit_consistency = {
            key: len(units) <= 1 for key, units in metric_units.items()
        }
        parameter_keys = sorted(
            {
                key
                for row in result_rows
                for key in row["parameters"]
            }
        )
        input_differences = {
            key: [row["parameters"].get(key) for row in result_rows]
            for key in parameter_keys
            if len({json.dumps(row["parameters"].get(key), sort_keys=True, default=str)
                    for row in result_rows}) > 1
        }
        failed_rows = [
            {
                "realization_id": row["realization_id"],
                "run_id": row["run_id"],
                "status": row["status"],
                "missing_metrics": [key for key in metric_keys if key not in row["metrics"]],
            }
            for row in result_rows
            if str(row["status"]).lower() != "succeeded"
            or any(key not in row["metrics"] for key in metric_keys)
        ]
        assumptions: list[Any] = []
        data_gaps: list[Any] = []
        if study_id:
            study = self.get_study(study_id)
            if study:
                definition = study.get("definition") or {}
                assumptions = definition.get("assumptions") or []
                data_gaps = definition.get("data_gaps") or definition.get("data_requirements") or []
        pareto_ids = self._pareto_front(result_rows, normalized_objectives)
        result = {
            "rows": result_rows,
            "pareto_realization_ids": pareto_ids,
            "metric_units": metric_units,
            "unit_consistency": unit_consistency,
            "input_differences": input_differences,
            "failed_rows": failed_rows,
            "assumptions": assumptions,
            "data_gaps": data_gaps,
        }
        comparison_id = str(payload.get("comparison_id") or uuid.uuid4().hex)
        if not comparison_id.strip():
            raise ValueError("comparison_id must not be empty")
        now = _now()
        definition = {
            "realization_ids": realization_ids,
            "metric_keys": metric_keys,
            "objectives": normalized_objectives,
        }
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            if conn.execute(
                "SELECT 1 FROM comparisons WHERE comparison_id=?", (comparison_id,)
            ).fetchone():
                raise ValueError(f"Comparison already exists: {comparison_id}")
            conn.execute(
                "INSERT INTO comparisons(comparison_id, study_id, name, definition, "
                "result, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    comparison_id,
                    study_id,
                    _required_text(payload.get("name"), "name"),
                    _canonical(definition),
                    _canonical(result),
                    payload.get("created_by"),
                    now,
                ),
            )
        return {
            "comparison_id": comparison_id,
            "study_id": study_id,
            "name": payload["name"],
            "definition": definition,
            "result": result,
            "created_at": now,
        }

    def get_comparison(self, comparison_id: str) -> dict[str, Any] | None:
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT * FROM comparisons WHERE comparison_id=?",
                (comparison_id,),
            ).fetchone()
        if row is None:
            return None
        return {
            "comparison_id": row["comparison_id"],
            "study_id": row["study_id"],
            "name": row["name"],
            "definition": _json(row["definition"]),
            "result": _json(row["result"]),
            "created_by": row["created_by"],
            "created_at": row["created_at"],
        }

    def list_comparisons(self, *, study_id: str | None = None) -> list[dict[str, Any]]:
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            if study_id is None:
                rows = conn.execute(
                    "SELECT * FROM comparisons ORDER BY created_at DESC"
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM comparisons WHERE study_id=? ORDER BY created_at DESC",
                    (study_id,),
                ).fetchall()
        return [self.get_comparison(row["comparison_id"]) for row in rows if row is not None]  # type: ignore[misc]

    # -- Reviewable research reports ---------------------------------

    @staticmethod
    def _markdown_report(title: str, source: dict[str, Any]) -> str:
        """Render a deterministic, evidence-oriented engineering report.

        The report deliberately contains facts from the persisted analysis;
        it does not invent recommendations or silently hide failed samples.
        """
        lines = [f"# {title}", "", "## 结果概览", ""]
        if "statistics" in source:
            statistics_ = source.get("statistics") or {}
            lines.extend(
                [
                    f"- 指标：`{source.get('metric_key', '')}`",
                    f"- 单位：{source.get('unit') or '未声明'}",
                    f"- 成功样本：{source.get('sample_count', 0)}",
                    f"- 失败样本：{source.get('failure_count', 0)}",
                    f"- P10 / P50 / P90：{statistics_.get('p10')} / {statistics_.get('p50')} / {statistics_.get('p90')}",
                ]
            )
            lines.append("")
            lines.append("## 敏感性筛选")
            lines.append("")
            for item in source.get("sensitivity") or []:
                lines.append(
                    f"- `{item.get('parameter')}`：Pearson = {item.get('coefficient')}; 样本数 = {item.get('sample_count')}"
                )
            lines.append("")
        else:
            result = source.get("result") or {}
            lines.extend(
                [
                    f"- 比较 ID：`{source.get('comparison_id', '')}`",
                    f"- 方案数：{len(result.get('rows') or [])}",
                    f"- Pareto 方案：{', '.join(result.get('pareto_realization_ids') or []) or '无'}",
                    "",
                    "## 指标单位校验",
                    "",
                ]
            )
            for key, units in (result.get("metric_units") or {}).items():
                lines.append(f"- `{key}`：{', '.join(units) or '未声明'}")
            lines.extend(["", "## 输入差异", ""])
            for key, values in (result.get("input_differences") or {}).items():
                lines.append(f"- `{key}`：{json.dumps(values, ensure_ascii=False)}")
        lines.extend(["", "## 失败样本", ""])
        failures = source.get("failures") or source.get("failed_rows") or []
        if failures:
            for failure in failures:
                lines.append(
                    f"- `{failure.get('realization_id')}`：{failure.get('reason') or ', '.join(failure.get('missing_metrics') or []) or failure.get('status') or '失败'}"
                )
        else:
            lines.append("- 无")
        lines.extend(["", "## 假设", ""])
        assumptions = source.get("assumptions") or []
        lines.extend([f"- {item}" for item in assumptions] or ["- 未声明"])
        lines.extend(["", "## 数据缺口", ""])
        gaps = source.get("data_gaps") or []
        lines.extend([f"- {item}" for item in gaps] or ["- 未声明"])
        warnings = source.get("warnings") or []
        if warnings:
            lines.extend(["", "## 警告", "", *[f"- {item}" for item in warnings]])
        return "\n".join(lines).rstrip() + "\n"

    def create_report(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Create a durable JSON/Markdown report artifact for review/export."""
        if not isinstance(payload, dict):
            raise ValueError("report payload must be an object")
        study_id = str(payload.get("study_id") or "").strip() or None
        comparison_id = str(payload.get("comparison_id") or "").strip() or None
        if bool(study_id) == bool(comparison_id):
            raise ValueError("report requires exactly one of study_id or comparison_id")
        fmt = str(payload.get("format") or "markdown").strip().lower()
        if fmt not in {"markdown", "json"}:
            raise ValueError("report format must be markdown or json")
        title = _required_text(payload.get("title") or "研究结果报告", "title")
        metric_key = str(payload.get("metric_key") or "").strip()
        if study_id:
            study = self.get_study(study_id)
            if study is None:
                raise KeyError(study_id)
            if not metric_key:
                definition = study.get("definition") or {}
                metric_key = str(definition.get("report_metric") or "").strip()
            if not metric_key:
                raise ValueError("metric_key is required for study reports")
            source = self.study_analysis(study_id, metric_key)
        else:
            source = self.get_comparison(comparison_id or "")
            if source is None:
                raise KeyError(comparison_id)
        content = (
            self._markdown_report(title, source)
            if fmt == "markdown"
            else _canonical(source)
        )
        report_id = str(payload.get("report_id") or uuid.uuid4().hex).strip()
        if not report_id:
            raise ValueError("report_id must not be empty")
        media_type = "text/markdown; charset=utf-8" if fmt == "markdown" else "application/json"
        artifact = {
            "ref_id": f"report-{report_id}",
            "kind": "report",
            "uri": f"report://{report_id}",
            "media_type": media_type,
            "sha256": hashlib.sha256(content.encode("utf-8")).hexdigest(),
            "size_bytes": len(content.encode("utf-8")),
            "metadata": {
                "report_id": report_id,
                "format": fmt,
                "study_id": study_id,
                "comparison_id": comparison_id,
                "content": content,
            },
        }
        now = _now()
        definition = {
            "study_id": study_id,
            "comparison_id": comparison_id,
            "metric_key": metric_key or None,
            "format": fmt,
        }
        project_id = payload.get("project_id")
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            if conn.execute("SELECT 1 FROM research_reports WHERE report_id=?", (report_id,)).fetchone():
                raise ValueError(f"Report already exists: {report_id}")
            conn.execute(
                "INSERT INTO research_reports(report_id, project_id, study_id, comparison_id, title, format, definition, content, artifact, created_by, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (report_id, project_id, study_id, comparison_id, title, fmt,
                 _canonical(definition), content, _canonical(artifact), payload.get("created_by"), now),
            )
        return {
            "report_id": report_id,
            "project_id": project_id,
            "study_id": study_id,
            "comparison_id": comparison_id,
            "title": title,
            "format": fmt,
            "definition": definition,
            "content": content,
            "artifact": artifact,
            "created_by": payload.get("created_by"),
            "created_at": now,
        }

    def get_report(self, report_id: str) -> dict[str, Any] | None:
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            row = conn.execute("SELECT * FROM research_reports WHERE report_id=?", (report_id,)).fetchone()
        if row is None:
            return None
        return {
            "report_id": row["report_id"],
            "project_id": row["project_id"],
            "study_id": row["study_id"],
            "comparison_id": row["comparison_id"],
            "title": row["title"],
            "format": row["format"],
            "definition": _json(row["definition"]),
            "content": row["content"],
            "artifact": _json(row["artifact"]),
            "created_by": row["created_by"],
            "created_at": row["created_at"],
        }

    def list_reports(
        self, *, study_id: str | None = None, comparison_id: str | None = None
    ) -> list[dict[str, Any]]:
        self.initialize()
        clauses: list[str] = []
        values: list[Any] = []
        if study_id is not None:
            clauses.append("study_id=?")
            values.append(study_id)
        if comparison_id is not None:
            clauses.append("comparison_id=?")
            values.append(comparison_id)
        where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
        with self.runs._connection() as conn:  # noqa: SLF001
            rows = conn.execute(
                f"SELECT report_id FROM research_reports{where} ORDER BY created_at DESC", values
            ).fetchall()
        return [self.get_report(row["report_id"]) for row in rows if row is not None]  # type: ignore[misc]

    # -- Review and approval governance --------------------------------

    @staticmethod
    def _review_subject_type(value: Any) -> str:
        subject_type = str(value or "").strip().lower()
        aliases = {
            "model": "model_version",
            "model-version": "model_version",
            "modelversion": "model_version",
            "study_revision": "study",
            "scenario": "comparison",
        }
        subject_type = aliases.get(subject_type, subject_type)
        if subject_type not in {"model_version", "study", "comparison", "run", "operation"}:
            raise ValueError(
                "review subject_type must be model_version, study, comparison, run, or operation"
            )
        return subject_type

    @staticmethod
    def _review_status(value: Any) -> str:
        candidate = str(value or "pending").strip().lower()
        if candidate not in _REVIEW_STATUSES:
            raise ValueError(f"unsupported review status: {candidate or '<empty>'}")
        return candidate

    def _review_subject_snapshot(
        self,
        subject_type: str,
        subject_id: str,
        *,
        study_revision: int | None = None,
    ) -> dict[str, Any]:
        """Resolve a subject and its immutable fingerprint before creating a review."""
        subject_id = _required_text(subject_id, "subject_id")
        if subject_type == "model_version":
            version = self.get_model_version(subject_id)
            if version is None:
                raise KeyError(subject_id)
            return {
                "project_id": self._model_project_id(version["model_id"]),
                "model_version_id": subject_id,
                "fingerprint": _required_text(version.get("snapshot_hash"), "snapshot_hash"),
                "snapshot": {"subject_type": subject_type, "model_version": version},
            }
        if subject_type == "study":
            study = self.get_study(subject_id, revision=study_revision)
            if study is None:
                raise KeyError(subject_id)
            return {
                "project_id": study.get("project_id"),
                "study_id": subject_id,
                "study_revision": int(study["revision"]),
                "fingerprint": _required_text(study.get("fingerprint"), "study fingerprint"),
                "snapshot": {
                    "subject_type": subject_type,
                    "study_id": subject_id,
                    "revision": int(study["revision"]),
                    "fingerprint": study["fingerprint"],
                    "definition": study.get("definition") or {},
                },
            }
        if subject_type == "comparison":
            comparison = self.get_comparison(subject_id)
            if comparison is None:
                raise KeyError(subject_id)
            project_id = None
            study_id = comparison.get("study_id")
            if study_id:
                study = self.get_study(str(study_id))
                project_id = study.get("project_id") if study else None
            return {
                "project_id": project_id,
                "study_id": study_id,
                "comparison_id": subject_id,
                "fingerprint": _fingerprint(
                    {
                        "definition": comparison.get("definition") or {},
                        "result": comparison.get("result") or {},
                    }
                ),
                "snapshot": {"subject_type": subject_type, "comparison": comparison},
            }
        if subject_type == "run":
            run = self.runs.get_run(subject_id)
            if run is None:
                raise KeyError(subject_id)
            payload = dict(run.get("payload") or {})
            snapshot = payload.get("input_snapshot")
            if not isinstance(snapshot, dict):
                # Remove mutable lifecycle fields from the fallback snapshot.
                snapshot = {
                    key: value
                    for key, value in payload.items()
                    if key
                    not in {
                        "status",
                        "phase",
                        "progress",
                        "created_at",
                        "updated_at",
                        "started_at",
                        "finished_at",
                        "error",
                    }
                }
            fingerprint = (run.get("provenance") or {}).get("input_fingerprint")
            if not isinstance(fingerprint, str) or not _SHA256_RE.fullmatch(fingerprint):
                fingerprint = _fingerprint(snapshot)
            return {
                "project_id": run.get("project_id"),
                "model_version_id": run.get("model_version_id"),
                "study_id": run.get("study_id"),
                "run_id": subject_id,
                "fingerprint": fingerprint,
                "snapshot": {"subject_type": subject_type, "run": run, "input": snapshot},
            }
        operation = self.runs.get_operation(subject_id)
        if operation is None:
            raise KeyError(subject_id)
        descriptor = operation.get("descriptor") or {}
        return {
            "project_id": None,
            "fingerprint": _fingerprint(
                {
                    "operation": subject_id,
                    "provider_id": operation.get("provider_id"),
                    "descriptor": descriptor,
                }
            ),
            "snapshot": {"subject_type": subject_type, "operation": operation},
        }

    def _model_project_id(self, model_id: str) -> str | None:
        with self.runs._connection() as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT project_id FROM models WHERE model_id=?", (model_id,)
            ).fetchone()
        return row["project_id"] if row is not None else None

    @staticmethod
    def _public_review(row: Any) -> dict[str, Any]:
        item = dict(row)
        item["metadata"] = _json(item.get("metadata"))
        item["snapshot"] = _json(item.get("snapshot"))
        return item

    def create_review(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(payload, dict):
            raise ValueError("review payload must be an object")
        self.initialize()
        subject_type = self._review_subject_type(payload.get("subject_type"))
        subject_id = _required_text(payload.get("subject_id"), "subject_id")
        snapshot = self._review_subject_snapshot(
            subject_type,
            subject_id,
            study_revision=(
                int(payload["study_revision"])
                if payload.get("study_revision") is not None
                else None
            ),
        )
        supplied_fingerprint = payload.get("input_fingerprint")
        fingerprint = snapshot["fingerprint"]
        if supplied_fingerprint is not None:
            supplied_fingerprint = str(supplied_fingerprint).strip().lower()
            if not _SHA256_RE.fullmatch(supplied_fingerprint):
                raise ValueError("input_fingerprint must be a SHA-256 hex digest")
            if supplied_fingerprint != fingerprint:
                raise ValueError("input_fingerprint does not match the subject snapshot")
        fingerprint = str(fingerprint).lower()
        metadata = payload.get("metadata") or {}
        if not isinstance(metadata, dict):
            raise ValueError("review metadata must be an object")
        _canonical(metadata)
        status = self._review_status(payload.get("status"))
        if status != "pending":
            raise ValueError("new reviews must start in pending status")
        review_id = str(payload.get("review_id") or uuid.uuid4().hex).strip()
        if not review_id:
            raise ValueError("review_id must not be empty")
        now = _now()
        # Optional explicit bindings are checked against the resolved subject,
        # preventing a review from claiming evidence belonging to another run.
        for key in ("model_version_id", "study_id", "comparison_id", "run_id"):
            supplied = payload.get(key)
            resolved = snapshot.get(key)
            if supplied is not None and str(supplied) != str(resolved):
                raise ValueError(f"{key} does not match review subject")
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            if conn.execute(
                "SELECT 1 FROM reviews WHERE review_id=?", (review_id,)
            ).fetchone():
                raise ValueError(f"Review already exists: {review_id}")
            conn.execute(
                "INSERT INTO reviews(review_id, project_id, subject_type, subject_id, study_revision, "
                "model_version_id, study_id, comparison_id, run_id, input_fingerprint, status, "
                "requested_by, reviewer_id, request_reason, decision_comment, metadata, snapshot, created_at, "
                "updated_at, decided_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    review_id,
                    snapshot.get("project_id") or payload.get("project_id"),
                    subject_type,
                    subject_id,
                    snapshot.get("study_revision"),
                    snapshot.get("model_version_id") or payload.get("model_version_id"),
                    snapshot.get("study_id") or payload.get("study_id"),
                    snapshot.get("comparison_id") or payload.get("comparison_id"),
                    snapshot.get("run_id") or payload.get("run_id"),
                    fingerprint,
                    "pending",
                    payload.get("requested_by") or payload.get("created_by"),
                    None,
                    str(payload.get("request_reason") or payload.get("reason") or ""),
                    "",
                    _canonical(metadata),
                    _canonical(snapshot.get("snapshot") or {}),
                    now,
                    now,
                    None,
                ),
            )
            conn.execute(
                "INSERT INTO review_events(event_id, review_id, from_status, to_status, "
                "actor_id, comment, metadata, created_at) VALUES (?, ?, NULL, 'pending', ?, ?, ?, ?)",
                (
                    uuid.uuid4().hex,
                    review_id,
                    payload.get("requested_by") or payload.get("created_by"),
                    str(payload.get("request_reason") or payload.get("reason") or ""),
                    _canonical({}),
                    now,
                ),
            )
        return self.get_review(review_id)  # type: ignore[return-value]

    def get_review(self, review_id: str) -> dict[str, Any] | None:
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT * FROM reviews WHERE review_id=?", (review_id,)
            ).fetchone()
        return self._public_review(row) if row is not None else None

    def list_review_events(self, review_id: str) -> list[dict[str, Any]]:
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            if conn.execute(
                "SELECT 1 FROM reviews WHERE review_id=?", (review_id,)
            ).fetchone() is None:
                raise KeyError(review_id)
            rows = conn.execute(
                "SELECT * FROM review_events WHERE review_id=? "
                "ORDER BY created_at, event_id",
                (review_id,),
            ).fetchall()
        return [
            {**dict(row), "metadata": _json(row["metadata"])} for row in rows
        ]

    def list_reviews(
        self,
        *,
        project_id: str | None = None,
        subject_type: str | None = None,
        subject_id: str | None = None,
        status: str | None = None,
        input_fingerprint: str | None = None,
    ) -> list[dict[str, Any]]:
        self.initialize()
        clauses: list[str] = []
        values: list[Any] = []
        if project_id is not None:
            clauses.append("project_id=?")
            values.append(project_id)
        if subject_type is not None:
            clauses.append("subject_type=?")
            values.append(self._review_subject_type(subject_type))
        if subject_id is not None:
            clauses.append("subject_id=?")
            values.append(subject_id)
        if status is not None:
            clauses.append("status=?")
            values.append(self._review_status(status))
        if input_fingerprint is not None:
            normalized = str(input_fingerprint).strip().lower()
            if not _SHA256_RE.fullmatch(normalized):
                raise ValueError("input_fingerprint must be a SHA-256 hex digest")
            clauses.append("input_fingerprint=?")
            values.append(normalized)
        where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
        with self.runs._connection() as conn:  # noqa: SLF001
            rows = conn.execute(
                f"SELECT * FROM reviews{where} ORDER BY created_at DESC", values
            ).fetchall()
        return [self._public_review(row) for row in rows]

    def transition_review(
        self,
        review_id: str,
        status: str,
        *,
        reviewer_id: str | None = None,
        decision_comment: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        target = self._review_status(status)
        self.initialize()
        reviewer = str(reviewer_id or "").strip() or None
        comment = str(decision_comment or "")
        if target in {"approved", "rejected", "changes_requested"} and not reviewer:
            raise ValueError("reviewer_id is required for a review decision")
        if target in {"rejected", "changes_requested"} and not comment.strip():
            raise ValueError("decision_comment is required for this review decision")
        if metadata is not None:
            if not isinstance(metadata, dict):
                raise ValueError("review metadata must be an object")
            _canonical(metadata)
        now = _now()
        with self.runs._connection(write=True) as conn:  # noqa: SLF001
            row = conn.execute(
                "SELECT * FROM reviews WHERE review_id=?", (review_id,)
            ).fetchone()
            if row is None:
                raise KeyError(review_id)
            current = str(row["status"] or "pending")
            if target == current:
                return self._public_review(row)
            if current in _REVIEW_TERMINAL_STATUSES:
                raise ValueError(f"Terminal review is immutable: {current}")
            if target not in _REVIEW_TRANSITIONS.get(current, frozenset()):
                raise ValueError(f"Invalid review transition: {current} -> {target}")
            merged_metadata = _json(row["metadata"])
            if metadata:
                merged_metadata.update(metadata)
            decided_at = now if target in _REVIEW_TERMINAL_STATUSES else None
            conn.execute(
                "UPDATE reviews SET status=?, reviewer_id=COALESCE(?, reviewer_id), "
                "decision_comment=CASE WHEN ? <> '' THEN ? ELSE decision_comment END, "
                "metadata=?, updated_at=?, decided_at=? WHERE review_id=?",
                (
                    target,
                    reviewer,
                    comment,
                    comment,
                    _canonical(merged_metadata),
                    now,
                    decided_at,
                    review_id,
                ),
            )
            conn.execute(
                "INSERT INTO review_events(event_id, review_id, from_status, to_status, "
                "actor_id, comment, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    uuid.uuid4().hex,
                    review_id,
                    current,
                    target,
                    reviewer,
                    comment,
                    _canonical(metadata or {}),
                    now,
                ),
            )
            updated = conn.execute(
                "SELECT * FROM reviews WHERE review_id=?", (review_id,)
            ).fetchone()
            assert updated is not None
        return self._public_review(updated)

    def has_approved_review(
        self,
        *,
        subject_type: str,
        subject_id: str,
        input_fingerprint: str | None = None,
    ) -> bool:
        subject_type = self._review_subject_type(subject_type)
        self.initialize()
        clauses = ["subject_type=?", "subject_id=?", "status='approved'"]
        values: list[Any] = [subject_type, subject_id]
        if input_fingerprint:
            normalized = str(input_fingerprint).strip().lower()
            if not _SHA256_RE.fullmatch(normalized):
                return False
            clauses.append("input_fingerprint=?")
            values.append(normalized)
        with self.runs._connection() as conn:  # noqa: SLF001
            return conn.execute(
                f"SELECT 1 FROM reviews WHERE {' AND '.join(clauses)} LIMIT 1", values
            ).fetchone() is not None

    def require_review_for_run(self, run: dict[str, Any]) -> dict[str, Any] | None:
        """Return an approved review for a run's immutable input, if present."""
        payload = dict(run.get("payload") or {})
        requested_review_id = str(payload.get("review_id") or "").strip()
        subject_candidates: list[tuple[str, str, str | None]] = []
        run_id = str(run.get("run_id") or "").strip()
        if run_id:
            snapshot = self._review_subject_snapshot("run", run_id)
            subject_candidates.append(("run", run_id, snapshot["fingerprint"]))
        model_version_id = str(run.get("model_version_id") or "").strip()
        if model_version_id:
            snapshot = self._review_subject_snapshot("model_version", model_version_id)
            subject_candidates.append(("model_version", model_version_id, snapshot["fingerprint"]))
        study_id = str(run.get("study_id") or "").strip()
        if study_id:
            # DOE realizations retain the Study revision that produced their
            # immutable input.  Match approval against that revision instead
            # of the Study's current head, which may have changed while the
            # realization remained queued.
            input_snapshot = payload.get("input_snapshot")
            study_revision: int | None = None
            revision_is_valid = True
            if isinstance(input_snapshot, dict) and input_snapshot.get("study_revision") is not None:
                try:
                    study_revision = int(input_snapshot["study_revision"])
                    revision_is_valid = study_revision > 0
                except (TypeError, ValueError):
                    revision_is_valid = False
            if revision_is_valid:
                snapshot = self._review_subject_snapshot(
                    "study", study_id, study_revision=study_revision
                )
                subject_candidates.append(("study", study_id, snapshot["fingerprint"]))
        self.initialize()
        with self.runs._connection() as conn:  # noqa: SLF001
            for subject_type, subject_id, fingerprint in subject_candidates:
                if requested_review_id:
                    row = conn.execute(
                        "SELECT * FROM reviews WHERE review_id=? AND subject_type=? AND subject_id=? "
                        "AND input_fingerprint=? AND status='approved'",
                        (requested_review_id, subject_type, subject_id, fingerprint),
                    ).fetchone()
                else:
                    row = conn.execute(
                        "SELECT * FROM reviews WHERE subject_type=? AND subject_id=? "
                        "AND input_fingerprint=? AND status='approved' ORDER BY decided_at DESC LIMIT 1",
                        (subject_type, subject_id, fingerprint),
                    ).fetchone()
                if row is not None:
                    return self._public_review(row)
        return None

    @staticmethod
    def _pareto_front(
        rows: list[dict[str, Any]], objectives: list[dict[str, Any]]
    ) -> list[str]:
        if not objectives:
            return []
        normalized: list[tuple[str, list[float]]] = []
        for row in rows:
            values: list[float] = []
            complete = True
            for objective in objectives:
                key = str(objective.get("key") or "")
                metric = row["metrics"].get(key)
                if metric is None:
                    complete = False
                    break
                value = float(metric["value"])
                values.append(-value if objective.get("direction") == "maximize" else value)
            if complete:
                normalized.append((row["realization_id"], values))
        front: list[str] = []
        for candidate_id, candidate in normalized:
            dominated = False
            for other_id, other in normalized:
                if other_id == candidate_id:
                    continue
                if all(a <= b for a, b in zip(other, candidate)) and any(
                    a < b for a, b in zip(other, candidate)
                ):
                    dominated = True
                    break
            if not dominated:
                front.append(candidate_id)
        return front


__all__ = ["ResearchRepository"]
