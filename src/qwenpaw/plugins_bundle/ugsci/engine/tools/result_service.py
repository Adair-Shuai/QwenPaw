# -*- coding: utf-8 -*-
"""Durable simulation results, collected independently of HTTP and \
solver workers.

Readers receive a stable, case-scoped copy. A failed/unfinished read \
never replaces
the last good series and never changes the solver's lifecycle state.
"""
from __future__ import annotations

import csv
import hashlib
import io
import json
import logging
import math
import re
import shutil
import sqlite3
import tempfile
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from . import job_store

logger = logging.getLogger(__name__)
TERMINAL = {
    "completed",
    "succeeded",
    "failed",
    "cancelled",
    "timeout",
    "error",
    "interrupted",
    "blocked",
}
MAX_FILE_BYTES = 128 * 1024 * 1024
MAX_TOTAL_BYTES = 256 * 1024 * 1024
MAX_POINTS = 600
POLL_SECONDS = 5.0
_workers: dict[str, "_Collector"] = {}
_workers_lock = threading.Lock()
_collect_locks: dict[str, threading.Lock] = {}
_storage_lock = threading.RLock()


def normalize_run_id(value: str) -> str:
    value = str(value).removeprefix("ugsci:")
    if not re.fullmatch(r"[A-Za-z0-9_.-]{1,160}", value):
        raise ValueError("Invalid simulation job id")
    return value


def _root() -> Path:
    return job_store.legacy_store_path().parent / "simulation-results"


def _connect() -> sqlite3.Connection:
    root = _root()
    root.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(root / "results.sqlite3", timeout=10)
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute(
        "CREATE TABLE IF NOT EXISTS results (run_id TEXT "
        "PRIMARY KEY, revision INTEGER NOT NULL, payload TEXT "
        "NOT NULL)",
    )
    return connection


def load_snapshot(run_id: str) -> dict[str, Any] | None:
    """Read only: this does not create storage, start workers, or parse \
files."""
    run_id = normalize_run_id(run_id)
    database = _root() / "results.sqlite3"
    if not database.is_file():
        return None
    with sqlite3.connect(
        database.as_uri() + "?mode=ro",
        uri=True,
        timeout=10,
    ) as connection:
        row = connection.execute(
            "SELECT payload FROM results WHERE run_id=?",
            (run_id,),
        ).fetchone()
    return json.loads(row[0]) if row else None


def read_job(run_id: str) -> dict[str, Any] | None:
    """Read existing job identity without migration or database \
initialization."""
    database = job_store.database_path()
    if database.is_file():
        with sqlite3.connect(
            database.resolve().as_uri() + "?mode=ro",
            uri=True,
            timeout=10,
        ) as connection:
            row = connection.execute(
                "SELECT payload FROM jobs WHERE job_id=?",
                (run_id,),
            ).fetchone()
        return json.loads(row[0]) if row else None
    legacy = job_store.legacy_store_path()
    if legacy.is_file():
        payload = json.loads(legacy.read_text(encoding="utf-8"))
        return payload.get(run_id) if isinstance(payload, dict) else None
    return None


def empty_snapshot(run_id: str, job: dict[str, Any]) -> dict[str, Any]:
    return {
        "schema_version": 1,
        "run_id": run_id,
        "revision": 0,
        "status": "not_collected",
        "job_status": job.get("status", "unknown"),
        "simulator": job.get("simulator", ""),
        "updated_at": None,
        "start_ts": job.get("start_ts"),
        "end_ts": job.get("end_ts"),
        "started_at": _iso_timestamp(job.get("start_ts")),
        "finished_at": _iso_timestamp(job.get("end_ts")),
        "simulation_time": None,
        "capabilities": {"checkpoint_resume": False},
        "metrics": [],
        "series": [],
        "fields": {"status": "not_collected", "datasets": [], "warnings": []},
        "warnings": ["尚未采集结果；可主动刷新已有任务结果。"],
        "stale": True,
        "collection_status": "not_collected",
        "finalized": False,
    }


def _iso_timestamp(value: Any) -> str | None:
    try:
        return (
            datetime.fromtimestamp(float(value), timezone.utc).isoformat()
            if value
            else None
        )
    except (ValueError, TypeError, OverflowError, OSError):
        return None


def _persist(run_id: str, snapshot: dict[str, Any]) -> dict[str, Any]:
    # Only the short commit is serialized; a solver terminal notification never
    # waits for an ongoing potentially slow parser or field conversion.
    with _storage_lock:
        return _persist_locked(run_id, snapshot)


def _persist_locked(run_id: str, snapshot: dict[str, Any]) -> dict[str, Any]:
    with _connect() as connection:
        connection.execute("BEGIN IMMEDIATE")
        row = connection.execute(
            "SELECT revision,payload FROM results WHERE run_id=?",
            (run_id,),
        ).fetchone()
        previous = json.loads(row[1]) if row else {}
        if (
            previous.get("status") in TERMINAL
            and snapshot.get("status") not in TERMINAL
        ):
            # An older in-flight parse cannot reopen a run after cancellation
            # or overwrite its finalization marker.
            for key in (
                "status",
                "job_status",
                "end_ts",
                "finished_at",
                "collection_status",
                "finalized",
                "archived",
            ):
                if key in previous:
                    snapshot[key] = previous[key]
        snapshot["revision"] = (row[0] if row else 0) + 1
        encoded = json.dumps(snapshot, ensure_ascii=False, allow_nan=False)
        connection.execute(
            "INSERT INTO results VALUES (?, ?, ?) ON "
            "CONFLICT(run_id) DO UPDATE SET "
            "revision=excluded.revision,payload=excluded.payload",
            (run_id, snapshot["revision"], encoded),
        )
    # Run Center links the scoped read-only API, never a guessed local path.
    # SQLite is the single authoritative archive (including the full series).
    return snapshot


def _finite(value: Any) -> float | None:
    try:
        number = float(value)
        return number if math.isfinite(number) else None
    except (ValueError, TypeError, OverflowError):
        return None


def _case_files(job: dict[str, Any]) -> list[Path]:
    directory = Path(
        str(job.get("output_dir") or job.get("working_dir") or ""),
    )
    stem = Path(str(job.get("deck_file") or "")).stem.casefold()
    if not stem or not directory.is_dir():
        return []
    extensions = {
        ".sms",
        ".rsm",
        ".smspec",
        ".unsmry",
        ".sr3",
        ".csv",
        ".out",
        ".prt",
        ".log",
        ".mph",
    }
    result = []
    for source in directory.iterdir():
        # Do not traverse symlinks or scan another case's output.
        if (
            source.is_symlink()
            or not source.is_file()
            or source.suffix.lower() not in extensions
        ):
            continue
        lower = source.name.casefold()
        if not (lower.startswith(stem + ".") or lower.startswith(stem + "_")):
            continue
        stat = source.stat()
        if float(job.get("start_ts") or 0) > stat.st_mtime + 2:
            continue
        result.append(source)
    return sorted(result)


def _fingerprint(paths: list[Path]) -> tuple:
    return tuple(
        (str(path), path.stat().st_size, path.stat().st_mtime_ns)
        for path in paths
    )


def _validate_copy(path: Path) -> None:
    if path.suffix.lower() in {".smspec", ".unsmry"}:
        from ..adapters.eclipse_summary import _element_width, _logical_records

        for _key, kind, count, body in _logical_records(path):
            if len(body) != count * (_element_width(kind) or 0):
                raise ValueError(f"{path.name}: incomplete binary array")
    elif path.suffix.lower() in {".csv", ".sms", ".rsm"}:
        data = path.read_bytes()
        if data and not data.endswith((b"\n", b"\r")):
            raise ValueError(f"{path.name}: incomplete text row")
        # Require consistent numeric row widths; an interrupted last row must
        # not silently drop one variable while advancing the time axis.
        width = None
        for line in data.decode("utf-8-sig", errors="replace").splitlines():
            cells = re.split(r"[,;\t ]+", line.strip())
            if not cells or _finite(cells[0]) is None:
                width = (
                    None  # RSM report pages/blocks may have different columns.
                )
                continue
            if width is not None and len(cells) != width:
                raise ValueError(
                    f"{path.name}: incomplete/inconsistent numeric row",
                )
            width = len(cells)
    elif path.suffix.lower() == ".sr3":
        import h5py

        with h5py.File(path, "r") as handle:
            if "General/MasterTimeTable" not in handle:
                raise ValueError("SR3 time table is unavailable")


def _stable_copy(paths: list[Path], destination: Path) -> tuple:
    before = _fingerprint(paths)
    if sum(item[1] for item in before) > MAX_TOTAL_BYTES or any(
        item[1] > MAX_FILE_BYTES for item in before
    ):
        raise ValueError("结果超过在线采集大小限制；保留已有结果，请使用专用后处理导入。")
    for source in paths:
        target = destination / source.name
        shutil.copyfile(source, target)
        _validate_copy(target)
    if _fingerprint(paths) != before:
        raise ValueError("结果文件仍在写入，稍后重试。")
    return before


def _time_axis(
    summary: Any,
    directory: Path,
    stem: str,
    simulator: str,
) -> tuple[dict[float, float] | None, str | None]:
    """Do not expose the legacy Eclipse reader's row index as physical time."""
    if simulator in {"eclipse", "intersect", "tnavigator", "opm_flow"}:
        if summary.metadata.get("physical_time"):
            return None, summary.metadata.get("time_unit")
        spec = next(
            (p for p in directory.iterdir() if p.suffix.lower() == ".smspec"),
            None,
        )
        if summary.metadata.get("format") == "Eclipse SMSPEC/UNSMRY" or (
            spec
            and not any(directory.glob("*.RSM"))
            and not any(directory.glob("*.SMS"))
        ):
            if spec:
                from ..adapters.eclipse_summary import (
                    _logical_records,
                    _strings,
                    _element_width,
                )

                keywords = []
                units = []
                for key, kind, count, body in _logical_records(spec):
                    if key == "KEYWORDS":
                        keywords = _strings(
                            body,
                            count,
                            _element_width(kind) or 8,
                        )
                    elif key == "UNITS":
                        units = _strings(
                            body,
                            count,
                            _element_width(kind) or 8,
                        )
                if not any(
                    key in keywords for key in ("TIME", "DAYS", "DAY", "YEARS")
                ):
                    raise ValueError("结果未声明物理时间，未将行号当作时间。")
                index = next(
                    (
                        i
                        for i, key in enumerate(keywords)
                        if key in {"TIME", "DAYS", "DAY"}
                    ),
                    None,
                )
                return None, units[index] if index is not None and index < len(
                    units,
                ) else ("day" if "YEARS" in keywords else None)
        dates = list(summary.dates)
        if not dates:
            raise ValueError("结果未声明物理时间，未将行号当作时间。")
        numeric = [_finite(item) for item in dates]
        if all(item is not None for item in numeric):
            unit = None
            for path in directory.iterdir():
                if path.suffix.lower() in {".rsm", ".sms"} and re.search(
                    r"\bDAYS\b",
                    path.read_text(errors="replace"),
                ):
                    unit = "day"
            return {
                float(i + 1): value
                for i, value in enumerate(numeric)
                if value is not None
            }, unit
        parsed = []
        for value in dates:
            date = None
            for fmt in ("%d-%b-%Y", "%Y-%m-%d", "%d/%m/%Y"):
                try:
                    date = datetime.strptime(value, fmt)
                    break
                except ValueError:
                    pass
            if date is None:
                raise ValueError("时间列无法可靠转换，保留已有曲线。")
            parsed.append(date)
        return {
            float(i + 1): (value - parsed[0]).total_seconds() / 86400
            for i, value in enumerate(parsed)
        }, "day"
    if simulator.startswith("cmg") and any(
        path.suffix.lower() == ".sr3" for path in directory.iterdir()
    ):
        return None, "day"  # SR3 reader explicitly uses Offset in days.
    return None, summary.metadata.get("time_unit")


def _eclipse_report(directory: Path):
    """Read RSM blocks, binding separate units/well-name rows before data.

    A unit like BAR is not a summary keyword. Repeated keywords must acquire
    distinct object identities; ambiguous columns fail closed, never merge.
    """
    from ..adapters.base import SimSummary

    source = next(
        (
            p
            for p in directory.iterdir()
            if p.suffix.lower() in {".rsm", ".sms"}
        ),
        None,
    )
    if source is None:
        return None
    result = SimSummary(metadata={"physical_time": True, "time_unit": None})
    columns = []
    time_index = None
    date_origin = None
    units_by_index = {}
    well_names = {}
    data_started = False
    time_units = {
        "DAYS",
        "DAY",
        "HOURS",
        "HOUR",
        "SECONDS",
        "SEC",
        "S",
        "YEARS",
        "YEAR",
    }
    plain_units = time_units | {
        "BAR",
        "BARA",
        "BARS",
        "PSI",
        "PSIA",
        "KPA",
        "MPA",
        "PA",
        "FRACTION",
        "UNITLESS",
        "NONE",
        "1",
        "%",
        "SM3",
        "RM3",
        "M3",
        "STB",
        "MSCF",
        "SCF",
        "K",
        "C",
        "DEGC",
        "KG",
        "M",
        "FT",
    }

    def is_unit(token):
        return token in plain_units or any(
            symbol in token for symbol in ("/", "**", "^", "%")
        )

    for line in source.read_text(
        encoding="utf-8",
        errors="replace",
    ).splitlines():
        cells = line.split()
        upper = [cell.upper() for cell in cells]
        # Units precede labels in standard RSM and must be handled before the
        # DAYS-header branch (BAR previously matched the broad B* pattern).
        if (
            time_index is not None
            and len(cells) == len(columns)
            and upper[time_index] in time_units
            and all(
                i == time_index or is_unit(token)
                for i, token in enumerate(upper)
            )
        ):
            result.metadata["time_unit"] = cells[time_index]
            units_by_index = {
                i: cells[i] for i in range(len(cells)) if i != time_index
            }
            continue
        candidate = next(
            (
                i
                for i, cell in enumerate(upper)
                if cell in {"TIME", "DAYS", "DATE"}
            ),
            None,
        )
        keywords = [cell for i, cell in enumerate(upper) if i != candidate]
        if (
            candidate is not None
            and keywords
            and all(
                re.fullmatch(r"[FWBRGC][A-Z0-9_]+(?::[^\s]+)?", cell)
                and not is_unit(cell)
                for cell in keywords
            )
        ):
            columns = upper
            time_index = candidate
            units_by_index = {}
            well_names = {}
            data_started = False
            if columns[candidate] == "DAYS":
                result.metadata["time_unit"] = "day"
            continue
        if time_index is None:
            continue
        unnamed_wells = [
            i
            for i, name in enumerate(columns)
            if i != time_index and name.startswith("W") and ":" not in name
        ]
        if not data_started and unnamed_wells and not well_names and cells:
            # Split tokens preserve identity in the common row with a blank
            # TIME cell, including mixed field and well columns. Requiring
            # textual identifiers avoids confusing optional numeric ID rows
            # with well names; ambiguous numeric-only labels are rejected.
            identifiers = None
            if len(cells) == len(unnamed_wells):
                identifiers = dict(zip(unnamed_wells, cells))
            elif len(cells) == len(columns) - 1:
                aligned = dict(
                    zip(
                        [i for i in range(len(columns)) if i != time_index],
                        cells,
                    ),
                )
                identifiers = {i: aligned[i] for i in unnamed_wells}
            elif len(cells) == len(columns) and cells[time_index] in {
                "-",
                "--",
            }:
                identifiers = {i: cells[i] for i in unnamed_wells}
            if identifiers and all(
                _finite(name) is None
                and (units_by_index or not is_unit(name.upper()))
                and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_.-]*", name)
                for name in identifiers.values()
            ):
                well_names = identifiers
                continue
        if len(cells) != len(columns):
            continue
        timestamp = _finite(cells[time_index])
        if timestamp is None and columns[time_index] == "DATE":
            for fmt in ("%d-%b-%Y", "%Y-%m-%d", "%d/%m/%Y"):
                try:
                    date = datetime.strptime(cells[time_index], fmt)
                    date_origin = date_origin or date
                    timestamp = (date - date_origin).total_seconds() / 86400
                    result.metadata["time_unit"] = "day"
                    break
                except ValueError:
                    pass
        if timestamp is None:
            continue
        names = [
            f"{name}:{well_names[index]}" if index in well_names else name
            for index, name in enumerate(columns)
        ]
        series_ids = [
            name for index, name in enumerate(names) if index != time_index
        ]
        if len(set(series_ids)) != len(series_ids):
            raise ValueError("RSM 含重复变量列，但井名/对象标识无法可靠对应；拒绝合并不同井的数据。")
        data_started = True
        for index, name in enumerate(names):
            if index == time_index:
                continue
            if index in units_by_index:
                result.metadata.setdefault("units", {})[name] = units_by_index[
                    index
                ]
            target = result.well_vectors if ":" in name else result.vectors
            points = target.setdefault(name, [])
            value = _finite(cells[index])
            # Overlapping report-page boundaries repeat the same sample.
            if not points or points[-1] != (timestamp, value):
                points.append(
                    (timestamp, value if value is not None else math.nan),
                )
    return result if result.vectors or result.well_vectors else None


def _series(
    summary: Any,
    axis: dict | None,
    time_unit: str | None,
) -> list[dict[str, Any]]:
    units = summary.metadata.get("units") or {}
    series = []
    for well_level, vectors in (
        (False, summary.vectors),
        (True, summary.well_vectors),
    ):
        for name, values in sorted(vectors.items()):
            # Binary summary readers can omit NaN entries. Restore gaps using
            # the explicit physical TIME vector, never report-step indices.
            timeline = (
                summary.vectors.get("TIME")
                or summary.vectors.get("DAYS")
                or []
            )
            if timeline and len({point[0] for point in values}) == len(values):
                by_time = dict(values)
                expected = [point[0] for point in timeline]
                if len(set(expected)) == len(expected):
                    values = [
                        (timestamp, by_time.get(timestamp))
                        for timestamp in expected
                    ]
            points = []
            previous = None
            for raw_time, raw_value in values:
                timestamp = _finite(
                    axis.get(float(raw_time))
                    if axis is not None
                    else raw_time,
                )
                if timestamp is None:
                    continue
                value = _finite(raw_value)
                # Preserve resets/duplicate physical times as separate
                # segments.
                if previous is not None and timestamp <= previous:
                    points.append({"time": timestamp, "value": None})
                points.append({"time": timestamp, "value": value})
                previous = timestamp
            if points:
                series.append(
                    {
                        "id": name,
                        "label": name,
                        "unit": units.get(name) or None,
                        "time_unit": time_unit,
                        "well": name.split(":", 1)[1]
                        if well_level and ":" in name
                        else None,
                        "points": points,
                        "total_points": len(values),
                        "sampled": False,
                    },
                )
    return series


def sampled_snapshot(
    snapshot: dict[str, Any],
    limit: int = MAX_POINTS,
) -> dict[str, Any]:
    result = json.loads(json.dumps(snapshot))
    for item in result.get("series", []) + result.get("metrics", []):
        points = item.get("points", [])
        if len(points) <= limit:
            item["sampled"] = False
            continue
        indices = {
            round(index * (len(points) - 1) / (limit - 1))
            for index in range(limit)
        }
        sampled = []
        previous = -1
        for index in sorted(indices):
            # Preserve an omitted missing-data segment so the chart cannot join
            # across a gap even when its null point was downsampled away.
            if any(
                point["value"] is None
                for point in points[previous + 1 : index]
            ):
                sampled.append({"time": points[index]["time"], "value": None})
            sampled.append(points[index])
            previous = index
        item["points"] = sampled
        item["sampled"] = True
    return result


def export_csv(snapshot: dict[str, Any], series_id: str) -> str:
    item = next(
        (
            item
            for item in snapshot.get("series", [])
            + snapshot.get("metrics", [])
            if item["id"] == series_id
        ),
        None,
    )
    if item is None:
        raise KeyError(series_id)
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(["time", "value", "time_unit", "unit"])

    # Prevent spreadsheet formulas in external unit labels.
    def cell(value):
        value = str(value or "")
        return "'" + value if value.startswith(("=", "+", "-", "@")) else value

    for point in item["points"]:
        writer.writerow(
            [
                point["time"],
                point["value"],
                cell(item.get("time_unit")),
                cell(item.get("unit")),
            ],
        )
    return output.getvalue()


def _publish_fields(run_id: str, job: dict[str, Any], final: bool):
    from ...visualization.backend.simulation import publish_simulation_fields

    return publish_simulation_fields(
        run_id,
        job["simulator"],
        job["deck_file"],
        str(job.get("output_dir") or job.get("working_dir")),
        final=final,
    )


def _evidenced_metrics(
    adapter: Any,
    directory: Path,
    progress: Any,
) -> dict[str, float | None]:
    """Adapter defaults and counts of tail lines are not measured metrics."""
    values = {
        "material_balance_error": _finite(progress.material_balance_error),
        "cfl_number": _finite(progress.cfl_number),
    }
    log_file = adapter.find_log_file(directory)
    if not log_file:
        return values
    tail = adapter.read_log_tail(log_file, 1000)
    steps = list(
        re.finditer(
            r"\b(?:REPORT\s+STEP|TIME\s*STEP)\s*(?:NO\.?\s*)?[#:=]?\s*(\d+)\b",
            tail,
            re.IGNORECASE,
        ),
    )
    if steps:
        values["current_step"] = float(steps[-1].group(1))
    else:
        row_pattern = getattr(adapter, "_RE_TIMESTEP_ROW", None)
        if row_pattern is not None:
            rows = [
                match
                for line in tail.splitlines()
                if (match := row_pattern.search(line))
            ]
            if rows:
                values["current_step"] = float(rows[-1].group(1))
    newton_pattern = getattr(adapter, "_RE_NEWTON", None)
    if newton_pattern is not None:
        iterations = list(newton_pattern.finditer(tail))
        if iterations:
            values["newton_iterations"] = float(iterations[-1].group(1))
    return values


def collect_once(
    run_id: str,
    *,
    final: bool = False,
    status: str | None = None,
    context: Any = None,
    force: bool = False,
) -> dict[str, Any]:
    run_id = normalize_run_id(run_id)
    with _workers_lock:
        lock = _collect_locks.setdefault(run_id, threading.Lock())
    with lock:
        job = job_store.load_job(run_id)
        if job is None:
            raise KeyError(run_id)
        previous = load_snapshot(run_id)
        snapshot = previous or empty_snapshot(run_id, job)
        snapshot["status"] = status or job.get("status", "unknown")
        snapshot["job_status"] = snapshot["status"]
        snapshot["start_ts"] = job.get("start_ts")
        snapshot["end_ts"] = job.get("end_ts")
        snapshot["started_at"] = _iso_timestamp(job.get("start_ts"))
        snapshot["finished_at"] = _iso_timestamp(job.get("end_ts"))
        snapshot["updated_at"] = datetime.now(timezone.utc).isoformat()
        snapshot["archived"] = bool(final)
        snapshot["collection_status"] = "finalizing" if final else "collecting"
        snapshot["finalized"] = False
        snapshot["warnings"] = []
        snapshot["stale"] = True
        parse_error = False
        now = time.time()
        try:
            from ..adapters import get_adapter

            adapter = get_adapter(job["simulator"])
            paths = _case_files(job)
            if not paths:
                raise ValueError("尚无本次任务的完整结果文件。")
            with tempfile.TemporaryDirectory(
                prefix="ugsci-result-",
            ) as temporary:
                directory = Path(temporary)
                fingerprint = _stable_copy(paths, directory)
                progress = adapter.parse_progress(directory)
                snapshot["simulation_time"] = progress.current_time or None
                metric_specs = (
                    ("current_step", "时间步", None),
                    ("newton_iterations", "Newton 迭代", None),
                    ("material_balance_error", "物质平衡误差", None),
                    ("cfl_number", "CFL", None),
                )
                metrics = {
                    item["id"]: item
                    for item in snapshot["metrics"]
                    if item.get("source") == "simulator_log"
                }
                evidenced = _evidenced_metrics(adapter, directory, progress)
                stamp = max(0.0, now - float(job.get("start_ts") or now))
                for key, label, unit in metric_specs:
                    if (
                        progress.status == "unknown"
                        and not progress.current_time
                        and not progress.current_step
                    ):
                        continue
                    value = evidenced.get(key)
                    if value is None:
                        continue
                    item = metrics.setdefault(
                        key,
                        {
                            "id": key,
                            "label": label,
                            "unit": unit,
                            "time_unit": "s",
                            "points": [],
                            "source": "simulator_log",
                        },
                    )
                    if (
                        not item["points"]
                        or item["points"][-1]["value"] != value
                    ):
                        item["points"].append({"time": stamp, "value": value})
                    item["total_points"] = len(item["points"])
                snapshot["metrics"] = list(metrics.values())
                digest = hashlib.sha256(repr(fingerprint).encode()).hexdigest()
                if (
                    force
                    or digest != snapshot.get("source_fingerprint")
                    or not snapshot["series"]
                ):
                    wells = None
                    if str(job["simulator"]).startswith("cmg"):
                        sr3 = next(
                            (
                                p
                                for p in directory.iterdir()
                                if p.suffix.lower() == ".sr3"
                            ),
                            None,
                        )
                        if sr3:
                            import h5py

                            with h5py.File(sr3, "r") as handle:
                                if "TimeSeries/WELLS/Origins" in handle:
                                    origins = handle[
                                        "TimeSeries/WELLS/Origins"
                                    ][:]
                                    wells = [
                                        value.decode(errors="replace")
                                        if isinstance(value, bytes)
                                        else str(value)
                                        for value in origins[:64]
                                    ]
                                    if len(origins) > 64:
                                        snapshot["warnings"].append(
                                            "在线采集最多展示 64 口井；其余井保留在原始结果文件。",
                                        )
                    summary = adapter.read_summary(
                        directory,
                        case_stem=Path(job["deck_file"]).stem,
                        wells=wells,
                    )
                    if job["simulator"] in {
                        "eclipse",
                        "intersect",
                        "tnavigator",
                        "opm_flow",
                    }:
                        suffixes = {
                            path.suffix.lower() for path in directory.iterdir()
                        }
                        binary = None
                        if {".smspec", ".unsmry"} <= suffixes:
                            from ..adapters.eclipse_summary import (
                                read_binary_summary,
                            )

                            binary = read_binary_summary(
                                directory,
                                Path(job["deck_file"]).stem,
                            )
                        summary = (
                            binary
                            if binary
                            and (binary.vectors or binary.well_vectors)
                            else (_eclipse_report(directory) or summary)
                        )
                    export_metadata = [summary.metadata] + list(
                        summary.metadata.get("exports") or [],
                    )
                    if any(
                        item.get("truncated")
                        for item in export_metadata
                        if isinstance(item, dict)
                    ):
                        snapshot["warnings"].append(
                            "源解析器限制了采集点数；CSV包含全部已解析数据，完整原始结果仍在求解器输出文件中。",
                        )
                    if summary.vectors or summary.well_vectors:
                        axis, unit = _time_axis(
                            summary,
                            directory,
                            Path(job["deck_file"]).stem,
                            job["simulator"],
                        )
                        series = _series(summary, axis, unit)
                        if series:
                            changed = series != snapshot["series"]
                            snapshot["stale"] = not final and not changed
                            snapshot["series"] = series
                            snapshot["source_fingerprint"] = digest
                            if changed or not snapshot.get("data_updated_at"):
                                snapshot["data_updated_at"] = snapshot[
                                    "updated_at"
                                ]
                    else:
                        snapshot["warnings"].append("尚无可解析曲线，保留上次结果。")
                else:
                    snapshot["stale"] = not final
                    if not final:
                        snapshot["warnings"].append("结果尚未更新，显示上次成功采集的数据。")
        except Exception as exc:
            parse_error = True
            snapshot["warnings"].append(f"结果采集暂不可用：{str(exc)[:500]}")
        try:
            snapshot["fields"] = _publish_fields(run_id, job, final)
        except Exception as exc:
            snapshot["warnings"].append(f"场图采集暂不可用：{str(exc)[:300]}")
            if snapshot.get("fields", {}).get("datasets"):
                snapshot["fields"]["status"] = "stale"
        snapshot["collection_status"] = (
            (
                "error"
                if parse_error and not snapshot["fields"].get("datasets")
                else "complete"
            )
            if final
            else "collecting"
        )
        snapshot["finalized"] = bool(final)
        snapshot = _persist(run_id, snapshot)
        _notify(run_id, snapshot, context)
        return snapshot


def _notify(run_id: str, snapshot: dict[str, Any], context: Any) -> None:
    try:
        if context is None:
            from .run_center_bridge import _plugin

            runtime = _plugin()
            repository = runtime.repository if runtime else None
        else:
            repository = context.repository
        if repository is None or repository.get_run(run_id) is None:
            return
        repository.append_event(
            run_id,
            "simulation.results.updated",
            {
                "run_id": run_id,
                "revision": snapshot["revision"],
                "status": snapshot["status"],
                "stale": snapshot["stale"],
            },
        )
        repository.add_artifact(
            run_id,
            {
                "ref_id": "simulation-results",
                "kind": "simulation_results",
                "uri": f"/api/ugsci/sim/jobs/{run_id}/results",
                "media_type": "application/json",
                "metadata": {
                    "run_id": run_id,
                    "revision": snapshot["revision"],
                },
            },
            role="result",
        )
    except Exception:
        logger.debug(
            "Run Center result notification unavailable for %s",
            run_id,
            exc_info=True,
        )


class _Collector:
    def __init__(self, run_id: str, context: Any = None):
        self.run_id = run_id
        self.context = context
        self.wake = threading.Event()
        self.final_status: str | None = None
        self.force_requested = True
        self.thread = threading.Thread(
            target=self.run,
            name=f"ugsci-results:{run_id}",
            daemon=True,
        )

    def run(self):
        try:
            while True:
                with _workers_lock:
                    force = self.force_requested
                    self.force_requested = False
                job = job_store.load_job(self.run_id)
                if job is None:
                    return
                status = self.final_status or job.get("status", "unknown")
                final = status in TERMINAL
                try:
                    collect_once(
                        self.run_id,
                        final=final,
                        status=status,
                        context=self.context,
                        force=force,
                    )
                except Exception:
                    logger.exception(
                        "Could not persist simulation result %s",
                        self.run_id,
                    )
                if final:
                    with _workers_lock:
                        if not self.force_requested:
                            # Remove under the same lock used by refresh so a
                            # request cannot wake an already-exiting worker.
                            if _workers.get(self.run_id) is self:
                                _workers.pop(self.run_id, None)
                            return
                    continue
                self.wake.wait(POLL_SECONDS)
                self.wake.clear()
        finally:
            with _workers_lock:
                if _workers.get(self.run_id) is self:
                    _workers.pop(self.run_id, None)


def start_collection(run_id: str, context: Any = None) -> None:
    run_id = normalize_run_id(run_id)
    with _workers_lock:
        existing = _workers.get(run_id)
        if existing:
            # An explicit refresh must rerun the parser even when source files
            # have not changed (e.g. to correct snapshots from an older
            # reader).
            existing.force_requested = True
            existing.wake.set()
            return
        job = job_store.load_job(run_id)
        if job is None:
            raise KeyError(run_id)
        snapshot = load_snapshot(run_id) or empty_snapshot(run_id, job)
        snapshot.update(
            status=job.get("status", "unknown"),
            collection_status="collecting",
            finalized=False,
        )
        _persist(run_id, snapshot)
        _notify(run_id, snapshot, context)
        collector = _Collector(run_id, context)
        _workers[run_id] = collector
        collector.thread.start()


def finish_collection(run_id: str, status: str) -> None:
    """Request final archival without blocking the solver on file parsing."""
    run_id = normalize_run_id(run_id)
    with _workers_lock:
        snapshot = load_snapshot(run_id)
        if (
            snapshot
            and snapshot.get("finalized")
            and snapshot.get("status") == status
        ):
            return
        job = job_store.load_job(run_id)
        if job is None:
            return
        snapshot = snapshot or empty_snapshot(run_id, job)
        snapshot.update(
            status=status,
            collection_status="finalizing",
            finalized=False,
        )
        _persist(run_id, snapshot)
        collector = _workers.get(run_id)
        if collector is None:
            collector = _Collector(run_id)
            _workers[run_id] = collector
            collector.final_status = status
            collector.thread.start()
        else:
            collector.final_status = status
            collector.wake.set()


def safe_start_collection(run_id: str, context: Any = None) -> None:
    try:
        start_collection(run_id, context)
    except Exception:
        logger.exception("Could not start result collection for %s", run_id)


def safe_finish_collection(run_id: str, status: str) -> None:
    try:
        finish_collection(run_id, status)
    except Exception:
        logger.exception("Could not finalize result collection for %s", run_id)
