import importlib.util
from contextlib import closing
import json
from pathlib import Path
import sqlite3
import struct
import sys
import types

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1] / "backend"
PKG = "surface_network_overview_tests"
package = types.ModuleType(PKG)
package.__path__ = [str(ROOT)]
sys.modules[PKG] = package
reader = importlib.import_module(".ezwalker", PKG)


def catalog(path, segments):
    db = sqlite3.connect(path)
    db.executescript("""
        create table asset(tree integer,node integer,tag text,name text,kind text,site text,props text,geom blob,primary key(tree,node));
        create table meta(value text);
        create table ez_scene(payload blob);
    """)
    db.executemany(
        "insert into asset values(?,?,?,?,?,?,?,null)",
        [
            (
                tree,
                i,
                "P-1" if i == 1 else f"V-{i}",
                "管道" if i == 1 else "阀",
                "站内管线" if i == 1 else "球阀",
                "站",
                json.dumps([["管径", "D100"]], ensure_ascii=False),
            )
            for tree, i in sorted({r[:2] for r in segments})
        ],
    )
    data = struct.pack("<4sIII", b"EZS1", len(segments), 0, 0) + b"".join(
        struct.pack("<II7f", *s) for s in segments
    )
    db.execute("insert into ez_scene values(?)", (data,))
    db.execute(
        "insert into meta values(?)",
        (
            json.dumps(
                {
                    "revision": "test-model",
                    "scene": {"available": True, "segments": len(segments)},
                }
            ),
        ),
    )
    reader.build_topology(None, db)
    reader.contact_evidence(db, {"segments": len(segments)}, "m")
    db.commit()
    db.close()
    return data


def test_assembled_faces_require_opposed_unique_ends_and_exclude_crossings(tmp_path):
    segments = [
        (1, 1, 0, 0, 0, 1, 0, 0, 0.05),  # a pipe, with its only free tip near x=1
        (1, 2, 1.0004, 0, 0, 2, 0, 0, 0.05),  # uniquely mating face, 0.4 mm gap
        (1, 3, 0.5, -1, 0, 0.5, 1, 0, 0.05),  # crossing axes have no common end
        (1, 4, 0, 0, 0, 0, 1, 0, 0.05),  # transverse normal
        (1, 5, -1, 0, 0, 0, 0, 0, 0.08),  # incompatible radius
        (2, 6, -1, 0, 0, 0, 0, 0, 0.05),  # separate source tree
    ]
    catalog(tmp_path / "scene", segments)
    with sqlite3.connect(tmp_path / "scene") as db:
        result = reader.related(db, 1, 1)
        assert result["count"] == 1
        row = result["rows"][0]
        assert row["target"]["node"] == 2 and row["status"] == "candidate"
        assert "0.40 mm" in row["evidence"]
    # A second viable object or a matching continuation inside the source pipe
    # disqualifies the end. Picking the nearest of the two would be arbitrary.
    for i, extra in enumerate(
        [(1, 7, 1, 0, 0, 3, 0, 0, 0.05), (1, 1, 1, 0, 0, 3, 0, 0, 0.05)]
    ):
        loc = tmp_path / str(i)
        catalog(loc, [*segments, extra])
        with sqlite3.connect(loc) as db:
            assert reader.related(db, 1, 1)["count"] == 0


def test_scene_and_relations_follow_live_catalog_scope_and_revision(
    tmp_path, monkeypatch
):
    monkeypatch.setattr(reader, "WORKING_DIR", tmp_path)
    ctx = types.SimpleNamespace(user_id="engineer", agent_id="work")
    root = reader.storage(ctx)
    data = catalog(
        root / "catalog.sqlite",
        [(1, 1, 0, 0, 0, 1, 0, 0, 0.05), (1, 2, 1, 0, 0, 2, 0, 0, 0.05)],
    )
    app = FastAPI()
    app.include_router(reader.router)
    app.dependency_overrides[reader.get_scoped_ctx] = lambda: ctx
    with TestClient(app) as client:
        response = client.get("/ezwalker/scene", params={"revision": "test-model"})
        assert response.content == data
        assert response.headers["content-type"] == "application/octet-stream"
        assert client.get("/ezwalker/scene?revision=stale").status_code == 409
        assert client.get("/ezwalker/object/1/2").json()["related"]["count"] == 1
        assert client.get("/ezwalker/topology?kind=contact").json()["count"] == 1
        scoped = "/ezwalker/topology?tree=1&node=2"
        assert client.get(scoped + "&kind=contact&q=P-1").json()["count"] == 1
        assert client.get(scoped + "&kind=cable").json()["count"] == 0
        assert client.get(scoped + "&q=missing-tag").json()["count"] == 0
        assert client.get("/ezwalker/topology?tree=1").status_code == 422
        ctx.agent_id = "other"
        assert client.get("/ezwalker/scene").status_code == 404
        assert client.get("/ezwalker").json() is None


def test_catalog_publish_rejects_a_stale_rebuild_without_replacing_project(tmp_path):
    old = tmp_path / "catalog.sqlite"
    catalog(old, [(1, 1, 0, 0, 0, 1, 0, 0, 0.05)])
    new = tmp_path / "next.sqlite"
    catalog(new, [(1, 2, 0, 0, 0, 3, 0, 0, 0.05)])
    with pytest.raises(reader.HTTPException) as raised:
        reader.publish_catalog(new, tmp_path, "wrong-revision")
    assert raised.value.status_code == 409 and new.is_file()
    with closing(sqlite3.connect(old)) as db:
        assert db.execute("select node from asset").fetchone()[0] == 1
    reader.publish_catalog(new, tmp_path, "test-model")
    with closing(sqlite3.connect(old)) as db:
        assert db.execute("select node from asset").fetchone()[0] == 2


def test_older_attribute_catalog_recovers_relations_without_positioning_local_parts(
    tmp_path, monkeypatch
):
    monkeypatch.setattr(reader, "WORKING_DIR", tmp_path)
    ctx = types.SimpleNamespace(user_id="local", agent_id="project")
    root = reader.storage(ctx)
    with closing(sqlite3.connect(root / "catalog.sqlite")) as db, db:
        db.executescript("""
            create table asset(tree,node,tag,name,kind,site,props,geom);
            create table meta(value);
        """)
        before = {"revision": "old", "name": "legacy", "fields": 3, "objects": 2}
        db.execute("insert into meta values(?)", (json.dumps(before),))
        db.executemany(
            "insert into asset values(1,?,?,?,?,?,?,null)",
            [
                (
                    1,
                    "CAB-1",
                    "配电线",
                    "电缆",
                    "站",
                    json.dumps([["起端", "PS-01"]], ensure_ascii=False),
                ),
                (2, "PS-01", "配电柜", "配电柜", "站", "[]"),
            ],
        )
    result = reader.summary(ctx)
    assert result["revision"] == "old" and result["name"] == "legacy"
    assert result["scene"]["requiresSource"] and not result["scene"]["available"]
    assert result["topology"]["count"] == 1
    saved = reader.existing(ctx, "old")
    try:
        assert reader.related(saved, 1, 2)["rows"][0]["owner"]["tag"] == "CAB-1"
        assert saved.execute("select count(*) from asset").fetchone() == (2,)
    finally:
        saved.close()


def test_compact_indexes_preserve_search_results_evidence_and_local_geometry(
    tmp_path, monkeypatch
):
    monkeypatch.setattr(reader, "WORKING_DIR", tmp_path)
    ctx = types.SimpleNamespace(user_id="engineer", agent_id="index")
    path = reader.storage(ctx) / "catalog.sqlite"
    payload = catalog(
        path, [(1, 1, 0, 0, 0, 1, 0, 0, 0.05), (1, 2, 1, 0, 0, 2, 0, 0, 0.05)]
    )
    queries = [
        {},
        {"q": "p-1"},
        {"q": "端面", "kind": "contact"},
        {"q": "V-2", "kind": "cable"},
        {"page": 2},
    ]
    with closing(sqlite3.connect(path)) as db, db:
        db.execute("update asset set geom=? where node=1", (b"G" * 56,))
        previous = [reader.topology(db, **q) for q in queries]
        assets = db.execute("select * from asset order by tree,node").fetchall()
    summary = reader.summary(ctx)
    assert summary["revision"] == "test-model" and summary["catalogVersion"] >= 3
    with closing(reader.existing(ctx)) as db:
        assert [reader.topology(db, **q) for q in queries] == previous
        assert db.execute("select * from asset order by tree,node").fetchall() == assets
        assert db.execute("select payload from ez_scene").fetchone()[0] == payload
        assert db.execute("select count(*) from ez_relation_terms").fetchone() == (1,)
    assert reader.objects(q="p-1", kind="站内管线", ctx=ctx)["rows"] == [
        (1, 1, "P-1", "管道", "站内管线", "站", 2)
    ]
    assert reader.objects(kind="站内管线", page=1, ctx=ctx) == {"count": 1, "rows": []}
    assert reader.objects(q="V-20", ctx=ctx)["count"] == 0


def test_compressed_scene_revalidates_only_with_current_scope_and_revision(
    tmp_path, monkeypatch
):
    monkeypatch.setattr(reader, "WORKING_DIR", tmp_path)
    ctx = types.SimpleNamespace(user_id="operator", agent_id="east")
    record = (1, 1, 0, 0, 0, 1, 0, 0, 0.05)
    data = catalog(reader.storage(ctx) / "catalog.sqlite", [record] * 2400)
    app = FastAPI()
    app.include_router(reader.router)
    app.dependency_overrides[reader.get_scoped_ctx] = lambda: ctx
    with TestClient(app) as client:
        url = "/ezwalker/scene?revision=test-model"
        packed = client.get(url, headers={"Accept-Encoding": "gzip"})
        assert packed.status_code == 200 and packed.content == data
        assert (
            packed.headers["content-encoding"] == "gzip"
            and int(packed.headers["content-length"]) < len(data) // 2
        )
        assert (
            "private" in packed.headers["cache-control"]
            and packed.headers["vary"] == "Accept-Encoding"
        )
        tag = packed.headers["etag"]
        headers = {"Accept-Encoding": "gzip", "If-None-Match": tag}
        fresh = client.get(url, headers=headers)
        assert fresh.status_code == 304 and not fresh.content
        raw = client.get(
            url, headers={"Accept-Encoding": "br, gzip;q=0", "If-None-Match": tag}
        )
        assert (
            raw.content == data
            and "content-encoding" not in raw.headers
            and raw.headers["etag"] != tag
        )
        assert (
            client.get("/ezwalker/scene?revision=old", headers=headers).status_code
            == 409
        )
        ctx.agent_id = "west"
        assert client.get(url, headers=headers).status_code == 404
        other = catalog(
            reader.storage(ctx) / "catalog.sqlite",
            [(1, 1, 0, 0, 0, 5, 0, 0, 0.05)] * 2400,
        )
        scoped = client.get(url, headers=headers)
        assert (
            scoped.status_code == 200
            and scoped.content == other
            and scoped.headers["etag"] != tag
        )
