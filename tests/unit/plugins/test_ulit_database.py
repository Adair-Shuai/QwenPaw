# -*- coding: utf-8 -*-
"""Exercise ULit migrations, HTTP writes and worker connection cleanup."""

# pylint: disable=protected-access

from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
import importlib
from pathlib import Path
import sqlite3
import sys
import threading
import types

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest


@pytest.fixture(name="ulit_database")
def fixture_ulit_database(tmp_path, monkeypatch):
    """Import the app against a private data directory without registration."""
    name = "_ulit_database_regression"
    package = types.ModuleType(name)
    package.__path__ = [
        str(Path(__file__).parents[3] / "plugins/apps/ulit/backend"),
    ]
    monkeypatch.setitem(sys.modules, name, package)
    monkeypatch.setenv("ULIT_DATA_ROOT", str(tmp_path / "data"))
    database = importlib.import_module(f"{name}.database")
    try:
        yield database
    finally:
        database.close_db()
        for module in tuple(sys.modules):
            if module.startswith(name + "."):
                sys.modules.pop(module, None)


def test_legacy_migration_commits_index_and_releases_writer_lock(
    tmp_path,
    ulit_database,
):
    """Persist the rebuilt index before another connection writes a project."""
    path = tmp_path / "legacy.db"
    with closing(sqlite3.connect(path)) as legacy:
        legacy.executescript(ulit_database._SCHEMA_SQL)
        legacy.execute("INSERT INTO papers (id, title) VALUES ('p', 'Paper')")
        legacy.execute(
            "INSERT INTO files (id, paper_id, sha256, path) "
            "VALUES ('f', 'p', 'digest', 'paper.pdf')",
        )
        legacy.execute(
            "INSERT INTO documents (id, file_id) VALUES ('d', 'f')",
        )
        legacy.execute(
            "INSERT INTO chunks (id, document_id, page_start, text) "
            "VALUES ('c', 'd', 0, 'reservoir evidence')",
        )
        legacy.commit()
    database = ulit_database.Database(path)
    try:
        with closing(sqlite3.connect(path, timeout=0.1)) as worker:
            assert (
                worker.execute(
                    "SELECT value FROM schema_meta WHERE key='version'",
                ).fetchone()[0]
                == "2"
            )
            assert (
                worker.execute(
                    "SELECT count(*) FROM chunks_fts "
                    "WHERE chunks_fts MATCH 'reservoir'",
                ).fetchone()[0]
                == 1
            )
            worker.execute(
                "INSERT INTO projects (id, name) "
                "VALUES ('project', 'Research')",
            )
            worker.commit()
    finally:
        database.close()
    reopened = ulit_database.Database(path)
    try:
        assert (
            reopened.query_one("SELECT count(*) AS n FROM chunks_fts")["n"]
            == 1
        )
        assert (
            reopened.query_one("SELECT name FROM projects")["name"]
            == "Research"
        )
    finally:
        reopened.close()


def test_fresh_database_supports_real_project_http_writes(ulit_database):
    """Create, update and list through the real threaded HTTP services."""
    library = importlib.import_module(
        "_ulit_database_regression.routes.library",
    )
    app = FastAPI()
    app.include_router(library.router, prefix="/api/ulit")
    with TestClient(app) as client:
        assert client.get("/api/ulit/health").json()["database"] == "ok"
        created = client.post(
            "/api/ulit/projects",
            json={"name": "Research", "question": "Evidence?"},
        )
        assert created.status_code == 200, created.text
        project = created.json()
        assert project["name"] == "Research"
        changed = client.patch(
            f"/api/ulit/projects/{project['id']}",
            json={"name": "Reviewed"},
        )
        assert changed.status_code == 200, changed.text
        listed = client.get("/api/ulit/projects")
        assert listed.status_code == 200
        assert [(p["id"], p["name"]) for p in listed.json()["projects"]] == [
            (project["id"], "Reviewed"),
        ]
        version = ulit_database.get_db().query_one(
            "SELECT value FROM schema_meta WHERE key='version'",
        )
        assert version["value"] == "2"


def test_shutdown_closes_database_connections_from_all_workers(
    tmp_path,
    ulit_database,
):
    """Close worker handles and allow the same wrapper to reopen safely."""
    path = tmp_path / "workers.db"
    database = ulit_database.Database(path)
    barrier = threading.Barrier(3)

    def worker():
        connection = database._get_conn()
        barrier.wait(timeout=5)
        return connection

    with ThreadPoolExecutor(max_workers=2) as executor:
        pending = [executor.submit(worker) for _ in range(2)]
        barrier.wait(timeout=5)
        connections = [future.result(timeout=5) for future in pending]
        assert connections[0] is not connections[1]
        database.close()
        database.close()
        for connection in connections:
            with pytest.raises(sqlite3.ProgrammingError, match="closed"):
                connection.execute("SELECT 1")
        assert database.query_one("SELECT 1 AS n")["n"] == 1
        database.close()
    path.unlink()
    assert not path.exists()
