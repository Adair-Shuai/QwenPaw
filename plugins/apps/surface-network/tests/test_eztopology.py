import importlib.util
import json
from pathlib import Path
import sqlite3

import pytest

MODULE = Path(__file__).resolve().parents[1] / "backend" / "eztopology.py"
spec = importlib.util.spec_from_file_location("surface_network_topology", MODULE)
topo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(topo)


@pytest.fixture
def catalog():
    db = sqlite3.connect(":memory:")
    db.execute("""create table asset(tree integer,node integer,tag text,name text,
           kind text,props text,primary key(tree,node))""")
    try:
        yield db
    finally:
        db.close()


def asset(db, node, tag, kind, name, *fields, tree=1):
    attrs = [("位号", tag), ("名称", name), ("TYPE", kind), *fields]
    db.execute(
        "insert into asset values(?,?,?,?,?,?)",
        (tree, node, tag, name, kind, json.dumps(attrs, ensure_ascii=False)),
    )


def test_preserves_typed_endpoint_fields_and_names_without_joining_ambiguous_assets(
    catalog,
):
    asset(
        catalog,
        1,
        "P-8",
        "站内管线",
        "由V-101至未登记管汇",
        ("起端", "V-101"),
        ("起端", "V-101"),
        ("终端", "XV-102"),
    )
    asset(catalog, 2, "V-101", "容器", "进口分离器")
    asset(catalog, 3, "XV-102", "阀门", "入口阀")
    asset(catalog, 3, "XV-102", "阀门", "另一入口阀", tree=2)
    asset(
        catalog,
        4,
        "K-8",
        "控制电缆",
        "控制电缆",
        ("起端", "V-101的控制柜"),
        ("终端", "进口分离器"),
    )
    asset(catalog, 5, "P-9", "管道", "P-9")
    asset(catalog, 6, "P-10", "管道", "引至V-101/A")
    assert topo.topology(catalog)["available"] is False
    catalog.execute("create table t_node_centerLines(f_treeid, f_handle, f_value)")
    info = topo.build_topology(catalog, catalog)
    assert info["centerlineRows"] == 0

    endpoints = topo.topology(catalog, kind="process")
    assert endpoints["count"] == 2
    start, end = endpoints["rows"]
    assert (start["owner"]["node"], start["role"], start["target"]["node"]) == (
        1,
        "起端",
        2,
    )
    assert (end["status"], end["matches"], end["target"]) == ("ambiguous", 2, None)
    cables = topo.topology(catalog, kind="cable")["rows"]
    assert [(r["field"], r["status"]) for r in cables] == [
        ("起端", "unresolved"),
        ("终端", "resolved"),
    ]
    assert cables[0]["evidence"] == "V-101的控制柜"

    refs = topo.topology(catalog, kind="reference")["rows"]
    assert [(r["text"], r["status"]) for r in refs] == [
        ("V-101", "resolved"),
        ("未登记管汇", "unresolved"),
        ("V-101/A", "unresolved"),
    ]
    assert refs[0]["field"] == "名称" and refs[0]["evidence"] == "由V-101至未登记管汇"
    assert refs[1]["target"] is None and refs[2]["target"] is None
    assert not topo.related(catalog, 2, 3)["rows"]
    # The existing catalog can recover the same references without original files.
    assert topo.build_topology(None, catalog)["count"] == info["count"]
    assert topo.related(catalog, 1, 2)["count"] == 3


def test_indexes_weld_membership_bidirectionally_without_guessing_split_line_sections(
    catalog,
):
    asset(catalog, 1, "80-PG-401", "站内管线", "管线")
    asset(catalog, 2, "U2-80-PG-401-5G-017", "焊口", "焊口")
    asset(catalog, 3, "80-PG-401A-B1-H12", "焊口", "焊口")
    asset(catalog, 4, "80-PG-402", "站内管线", "支线")
    asset(catalog, 5, "80-PG-402#1", "站内管线", "支线分段")
    asset(catalog, 6, "80-PG-402-D2-H03/H04", "焊口", "焊口")
    asset(catalog, 7, "80-PG-403#1", "站内管线", "其他管段")
    asset(catalog, 8, "80-PG-403-B2-H46", "焊口", "焊口")
    topo.build_topology(None, catalog)
    rows = topo.topology(catalog, kind="weld")["rows"]
    assert [(r["owner"]["node"], r["status"], r["matches"]) for r in rows] == [
        (2, "resolved", 1),
        (3, "unresolved", 0),
        (6, "ambiguous", 2),
        (8, "unresolved", 1),
    ]
    assert rows[0]["target"]["tag"] == "80-PG-401"
    assert rows[0]["evidence"] == "U2-80-PG-401-5G-017"
    assert topo.related(catalog, 1, 1)["rows"] == [rows[0]]
    assert topo.related(catalog, 1, 2)["rows"] == [rows[0]]


def test_pages_filter_and_locate_matching_face_candidates_apart_from_process_links(
    catalog,
):
    asset(catalog, 1, "P-25", "管道", "入口管段")
    for n in range(topo.PAGE_SIZE + 1):
        asset(catalog, 10 + n, f"FT-{n}", "流量计", "仪表")
    topo.build_topology(None, catalog)
    topo.add_relations(
        catalog,
        (
            (
                "contact",
                1,
                1,
                1,
                10 + n,
                "端面吻合",
                f"FT-{n}",
                "全站端面",
                "测试轴段端面",
                1,
            )
            for n in range(topo.PAGE_SIZE + 1)
        ),
    )
    counts = topo.topology_summary(catalog)
    assert counts["statuses"] == {"candidate": topo.PAGE_SIZE + 1}
    assert dict((r["id"], r["count"]) for r in counts["types"])["process"] == 0
    first = topo.topology(catalog, q="仪表")
    last = topo.topology(catalog, q="仪表", kind="contact", page=1)
    assert len(first["rows"]) == topo.PAGE_SIZE and last["count"] == topo.PAGE_SIZE + 1
    assert [r["target"]["tag"] for r in last["rows"]] == [f"FT-{topo.PAGE_SIZE}"]
    incoming = topo.related(catalog, 1, 10)
    assert incoming["statuses"] == {"candidate": 1}
    assert incoming["rows"][0]["owner"]["tag"] == "P-25"
    assert topo.topology(catalog, kind="process")["count"] == 0
