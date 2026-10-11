# -*- coding: utf-8 -*-
"""Atomic, content-addressed local dataset imports backed by SQLite."""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import sqlite3
import tempfile
from contextlib import closing
from dataclasses import fields
from datetime import datetime, timezone
from pathlib import Path

from .reader import Record, read_file

VERSION = "1.0.0"


def default_root() -> Path:
    from qwenpaw.constant import WORKING_DIR

    return Path(WORKING_DIR) / "ugsci" / "production-dynamics"


class DatasetStore:
    def __init__(self, root: Path | None = None):
        self.root = root if root is not None else default_root()

    def path(self, dataset_id: str) -> Path:
        if not re.fullmatch(r"[a-f0-9]{24}", dataset_id):
            raise ValueError("无效数据集 ID")
        return self.root / dataset_id

    def manifest(self, dataset_id: str) -> dict:
        return json.loads(
            (self.path(dataset_id) / "manifest.json").read_text(
                encoding="utf-8"
            )
        )

    def list(self) -> list[dict]:
        if not self.root.exists():
            return []
        return [
            json.loads(p.read_text(encoding="utf-8"))
            for p in sorted(self.root.glob("*/manifest.json"))
            if re.fullmatch(r"[a-f0-9]{24}", p.parent.name)
        ]

    def connect(self, dataset_id: str) -> sqlite3.Connection:
        path = self.path(dataset_id) / "records.sqlite"
        if not path.is_file():
            raise FileNotFoundError("数据集不存在")
        db = sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)
        db.row_factory = sqlite3.Row
        return db

    def import_path(self, input_path: str) -> dict:
        source = Path(input_path).expanduser().resolve()
        if not source.exists():
            raise ValueError("数据路径不存在")
        paths = sorted(
            p
            for p in (source.iterdir() if source.is_dir() else [source])
            if p.is_file()
            and p.suffix.lower() in (".xls", ".xlsx", ".csv")
            and not p.name.startswith("~$")
        )
        if not paths:
            raise ValueError("没有可导入的 XLS、XLSX 或 UTF-8 CSV 文件")
        if len(paths) > 100 or sum(p.stat().st_size for p in paths) > 1024**3:
            raise ValueError("单次导入限 100 个文件、1 GB")
        fingerprints = []
        digest = hashlib.sha256(VERSION.encode())
        for path in paths:
            h = hashlib.sha256()
            with path.open("rb") as stream:
                for block in iter(lambda: stream.read(1024 * 1024), b""):
                    h.update(block)
            sha = h.hexdigest()
            digest.update(path.name.encode() + sha.encode())
            fingerprints.append(
                {
                    "file": path.name,
                    "sha256": sha,
                    "bytes": path.stat().st_size,
                }
            )
        dataset_id = digest.hexdigest()[:24]
        destination = self.path(dataset_id)
        if (destination / "manifest.json").is_file():
            return {**self.manifest(dataset_id), "reused": True}
        self.root.mkdir(parents=True, exist_ok=True)
        stage = Path(tempfile.mkdtemp(prefix="import-", dir=self.root))
        issues, sources = [], []
        try:
            with closing(sqlite3.connect(stage / "records.sqlite")) as db, db:
                columns = [f.name for f in fields(Record)]
                db.execute(
                    "CREATE TABLE records (facility TEXT, well TEXT, day TEXT, mode TEXT, gas REAL, "
                    "hours REAL, pressure REAL, casing REAL, water REAL, vent REAL, note TEXT, "
                    "file TEXT, sheet TEXT, row INTEGER, UNIQUE(facility,well,day,mode))"
                )
                batch = []
                for path in paths:
                    # Import from a stable private snapshot, then discard the bytes.
                    snapshot = stage / path.name
                    shutil.copy2(path, snapshot)
                    if hashlib.sha256(
                        snapshot.read_bytes()
                    ).hexdigest() != next(
                        x["sha256"]
                        for x in fingerprints
                        if x["file"] == path.name
                    ):
                        raise ValueError("源文件在导入过程中发生变化，请重试")
                    for record in read_file(snapshot, issues, sources):
                        batch.append(record.values())
                        if len(batch) >= 2000:
                            self._insert(db, batch, issues)
                            batch.clear()
                    self._insert(db, batch, issues)
                    batch.clear()
                    snapshot.unlink()
                db.execute(
                    "CREATE INDEX by_history ON records(facility,well,mode,day)"
                )
                db.execute("CREATE INDEX by_day ON records(facility,day)")
                rows = db.execute("SELECT COUNT(*) FROM records").fetchone()[0]
                if not rows:
                    raise ValueError("没有有效的日记录")
                facilities = [
                    dict(
                        zip(
                            ("facility", "records", "wells", "start", "end"), r
                        )
                    )
                    for r in db.execute(
                        "SELECT facility,COUNT(*),COUNT(DISTINCT well),MIN(day),MAX(day) FROM records GROUP BY facility"
                    )
                ]
            counts = {}
            for issue in issues:
                counts[issue["code"]] = counts.get(issue["code"], 0) + 1
            manifest = {
                "id": dataset_id,
                "name": source.name,
                "version": VERSION,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "records": rows,
                "facilities": facilities,
                "files": fingerprints,
                "sources": sources,
                "quality_counts": counts,
                "quality_examples": issues[:100],
                "units": {
                    "gas": "万m³/日（原表日量）",
                    "pressure": "MPa（原表井口油压）",
                    "water": "t/日",
                },
                "gas_reference_conditions": "原表未提供标况温压，未做标况换算",
            }
            (stage / "manifest.json").write_text(
                json.dumps(manifest, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            # Full audit is streamed from disk on demand; summaries remain bounded.
            with (stage / "quality.jsonl").open(
                "w", encoding="utf-8"
            ) as stream:
                for issue in issues:
                    stream.write(json.dumps(issue, ensure_ascii=False) + "\n")
            try:
                stage.rename(destination)
            except FileExistsError:
                if not (destination / "manifest.json").is_file():
                    raise
            return {**self.manifest(dataset_id), "reused": False}
        finally:
            if stage.exists():
                if (
                    stage.resolve().parent != self.root.resolve()
                    or not stage.name.startswith("import-")
                ):
                    raise ValueError("导入临时目录超出数据目录")
                shutil.rmtree(stage)

    @staticmethod
    def _insert(db, batch, issues):
        for values in batch:
            try:
                db.execute(
                    "INSERT INTO records VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    values,
                )
            except sqlite3.IntegrityError:
                old = db.execute(
                    "SELECT * FROM records WHERE facility=? AND well=? AND day=? AND mode=?",
                    values[:4],
                ).fetchone()
                identical = tuple(old[4:11]) == tuple(values[4:11])
                if not identical:
                    # Ambiguous duplicates cannot contribute an arbitrary volume to totals.
                    db.execute(
                        "UPDATE records SET gas=NULL,hours=NULL,pressure=NULL,casing=NULL,water=NULL,vent=NULL "
                        "WHERE facility=? AND well=? AND day=? AND mode=?",
                        values[:4],
                    )
                issues.append(
                    {
                        "code": (
                            "duplicate_identical"
                            if identical
                            else "duplicate_conflict"
                        ),
                        "file": values[11],
                        "sheet": values[12],
                        "row": values[13],
                        "facility": values[0],
                        "well": values[1],
                        "day": values[2],
                        "message": (
                            "相同日记录已去重"
                            if identical
                            else "同井同日同方向记录冲突；对应数值排除统计，需复核"
                        ),
                    }
                )
