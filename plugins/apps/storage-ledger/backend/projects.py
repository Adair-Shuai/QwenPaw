"""Isolated project files, catalog discovery and portable SQLite snapshots."""

import os
import re
import shutil
import sqlite3
import tempfile
from contextlib import closing, contextmanager
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException
from pydantic import BaseModel, Field, field_validator

from . import ledger


class ProjectFields(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    operator: str = Field(default="", max_length=120)
    region: str = Field(default="", max_length=120)
    description: str = Field(default="", max_length=1600)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value):
        if not value.strip():
            raise ValueError("请输入项目名称")
        return value.strip()


class ProjectUpdate(ProjectFields):
    archived: bool = False
    revision: int = Field(ge=1)


def location(legacy, identifier):
    if identifier == "legacy":
        return legacy
    if not re.fullmatch("[0-9a-f]{32}", identifier):
        raise HTTPException(404, "项目不存在")
    return legacy.parent / "projects" / (identifier + ".sqlite3")


def existing(legacy, identifier):
    path = location(legacy, identifier)
    if not path.is_file():
        raise HTTPException(404, "项目不存在")
    return path


def initialize(db):
    if not db.execute("SELECT 1 FROM project_info").fetchone():
        hint = db.execute(
            "SELECT 1 FROM source WHERE name LIKE '%呼图壁%' LIMIT 1"
        ).fetchone()
        db.execute(
            "INSERT OR IGNORE INTO project_info(id,name) VALUES(1,?)",
            ("呼图壁储气库" if hint else "已有储气库项目",),
        )


def info(db, identifier):
    initialize(db)
    row = dict(db.execute("SELECT * FROM project_info WHERE id=1").fetchone())
    row["id"] = identifier
    row["sources"] = db.execute("SELECT COUNT(*) FROM source").fetchone()[0]
    row["records"] = db.execute(
        "SELECT COALESCE(SUM(rows_count),0) FROM source"
    ).fetchone()[0]
    return row


def catalog(legacy):
    paths = [("legacy", legacy)] if legacy.is_file() else []
    paths.extend(
        (p.stem, p)
        for p in (legacy.parent / "projects").glob("*.sqlite3")
        if re.fullmatch("[0-9a-f]{32}", p.stem)
    )
    rows = []
    for identifier, path in paths:
        with ledger.database(path) as db:
            rows.append(info(db, identifier))
    return sorted(rows, key=lambda r: (r["modified"], r["id"]), reverse=True)


def edit(db, identifier, update):
    initialize(db)
    args = update.model_dump()
    matched = db.execute(
        """UPDATE project_info SET name=:name,operator=:operator,region=:region,
        description=:description,archived=:archived,revision=revision+1,modified=CURRENT_TIMESTAMP
        WHERE id=1 AND revision=:revision""",
        args,
    ).rowcount
    if not matched:
        raise HTTPException(409, "项目资料已变化，请刷新后重试")
    return info(db, identifier)


@contextmanager
def write_db(path):
    with ledger.database(path) as db:
        db.execute("BEGIN IMMEDIATE")
        meta = db.execute("SELECT archived FROM project_info").fetchone()
        if meta and meta[0]:
            raise HTTPException(409, "项目已归档，请先恢复项目")
        yield db
        initialize(db)
        db.execute("UPDATE project_info SET modified=CURRENT_TIMESTAMP")


@contextmanager
def staging(folder):
    folder.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix=".ledger-", suffix=".tmp", dir=folder)
    os.close(fd)
    path = Path(name)
    try:
        yield path
    finally:
        path.unlink(missing_ok=True)


def create(legacy, fields):
    identifier = uuid4().hex
    dest = location(legacy, identifier)
    with staging(dest.parent) as temp:
        with ledger.database(temp) as db:
            db.execute(
                """INSERT INTO project_info(id,name,operator,region,description)
                VALUES(1,:name,:operator,:region,:description)""",
                fields.model_dump(),
            )
            result = info(db, identifier)
        os.replace(temp, dest)
    return result


def snapshot(path):
    fd, name = tempfile.mkstemp(suffix=".ugsdb")
    os.close(fd)
    try:
        with ledger.database(path) as db:
            initialize(db)
            db.commit()
            with closing(sqlite3.connect(name)) as backup:
                db.backup(backup)
        return Path(name)
    except BaseException:
        Path(name).unlink(missing_ok=True)
        raise


def schema(db):
    return dict(db.execute("""SELECT name,sql FROM sqlite_master
        WHERE name NOT LIKE 'sqlite_%' AND sql IS NOT NULL"""))


def restore(legacy, stream):
    identifier = uuid4().hex
    dest = location(legacy, identifier)
    with staging(dest.parent) as temp:
        if stream.read(16) != b"SQLite format 3\x00":
            raise HTTPException(422, "请选择从本应用导出的 .ugsdb 项目备份")
        stream.seek(0)
        with temp.open("wb") as out:
            shutil.copyfileobj(stream, out, 1024 * 1024)
        try:
            with closing(sqlite3.connect(":memory:")) as template:
                template.executescript(ledger.SCHEMA)
                expected = schema(template)
            with closing(sqlite3.connect(temp)) as db:
                db.execute("PRAGMA trusted_schema=OFF")
                if (
                    schema(db) != expected
                    or db.execute("PRAGMA user_version").fetchone()[0] != 5
                    or db.execute("PRAGMA integrity_check").fetchone()[0] != "ok"
                ):
                    raise ValueError("备份结构或完整性校验失败")
                metadata = db.execute(
                    "SELECT name FROM project_info WHERE id=1"
                ).fetchone()
                if not metadata or not metadata[0]:
                    raise ValueError("备份缺少项目资料")
                db.execute(
                    """UPDATE project_info SET name=?,archived=0,revision=1,
                    created=CURRENT_TIMESTAMP,modified=CURRENT_TIMESTAMP WHERE id=1""",
                    (metadata[0][:94] + "（恢复）",),
                )
                db.commit()
            with ledger.database(temp) as db:
                result = info(db, identifier)
            os.replace(temp, dest)
            return result
        except (ValueError, sqlite3.DatabaseError) as exc:
            raise HTTPException(422, "无法恢复项目，备份格式或数据校验失败") from exc
