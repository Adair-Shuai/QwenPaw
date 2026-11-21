import importlib.util
from pathlib import Path
import sqlite3
import sys
import types

import pytest

ROOT = Path(__file__).resolve().parents[1] / "backend"
package = types.ModuleType("surface_network_test_backend")
package.__path__ = [str(ROOT)]
sys.modules[package.__name__] = package
spec = importlib.util.spec_from_file_location(
    package.__name__ + ".ezwalker", ROOT / "ezwalker.py"
)
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)


def test_import_keeps_duplicate_tags_and_original_attribute_values(tmp_path):
    source = tmp_path / "data.db"
    con = sqlite3.connect(source)
    con.executescript("""
    create table t_plat_attr_definition(f_id, f_name);
    insert into t_plat_attr_definition values(1,'位号'),(2,'名称'),(3,'TYPE'),(4,'量程'),(5,'ColorIndex');
    create table t_plat_attr_node(f_treeid,f_node_id,f_attr_def,f_value);
    insert into t_plat_attr_node values(1,12,1,'PT-7'),(1,12,2,'入口'),(1,12,3,'压力变送器'),(1,12,4,'0～16 MPa'),(2,12,1,'PT-7'),(2,12,3,'压力变送器'),(1,13,5,'9');
    create table t_plat_wlkx(f_mdlname,f_id);
    create table t_global_info(f_name,f_data);
    """)
    con.close()
    before = source.read_bytes()
    result = reader.build_catalog(
        source, None, tmp_path / "out", "test", {"references": [], "views": []}
    )
    assert result["objects"] == 2
    assert result["geometryObjects"] == 0
    con = sqlite3.connect(tmp_path / "out")
    try:
        assert con.execute(
            "select tree,node,tag from asset order by tree"
        ).fetchall() == [(1, 12, "PT-7"), (2, 12, "PT-7")]
        assert (
            "0～16 MPa"
            in con.execute("select props from asset where tree=1").fetchone()[0]
        )
    finally:
        con.close()
    assert source.read_bytes() == before


def test_wlp_reports_reference_without_opening_external_path(tmp_path):
    path = tmp_path / "test.wlp"
    con = sqlite3.connect(path)
    con.executescript(
        "create table t_model_Info(f_model_path);create table t_viewPoint(f_name);insert into t_viewPoint values('俯视');"
    )
    con.execute("insert into t_model_Info values(?)", (r"..\private\test.wlkx",))
    con.commit()
    con.close()
    assert reader.wlp_info(path) == {"references": ["test.wlkx"], "views": ["俯视"]}
    with pytest.raises(ValueError):
        reader.build_catalog(path, None, tmp_path / "invalid", "test", {})
