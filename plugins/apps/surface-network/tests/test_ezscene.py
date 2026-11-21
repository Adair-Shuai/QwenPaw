import importlib.util
import math
from pathlib import Path
import sqlite3
import struct
import sys

import pytest

backend = Path(__file__).resolve().parents[1] / "backend"
spec = importlib.util.spec_from_file_location(
    "surface_ezscene_tests", backend / "ezscene.py"
)
reader = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = reader
spec.loader.exec_module(reader)


def string(value):
    raw = value.encode()
    return struct.pack("<I", len(raw)) + raw


class Document:
    def __init__(self, magic, records):
        self.magic = magic
        self.data = bytearray(b"L" + bytes(records * 16))

    def put(self, data):
        address = len(self.data)
        self.data.extend(data)
        return address

    def record(self, index, pointer, children, flag):
        first, count = children
        struct.pack_into(
            "<4I", self.data, 1 + index * 16, pointer, count, 1 + first * 16, flag
        )

    def blob(self):
        return self.magic + self.data


def package(target, resources):
    data = bytearray(b"X_R_E_Composite_FileSystem_v001\0")
    for name, raw in resources:
        for typ, value in ((3, name.encode()), (4, raw)):
            data.extend(
                struct.pack("<QII", len(data) + 16 + len(value), typ, len(value))
            )
            data.extend(value)
    target.write_bytes(data)


def model(primitives, position=(0, 0, 0), scale=(1, 1, 1), angles=(0, 0, 0)):
    md = Document(b"MD1\0", 3 + len(primitives))
    root = md.put(string("mixed"))
    md.record(0, root, (1, 1), 0x01000001)
    group = md.put(string("东站.wlkx") + string("7,sect,"))
    md.record(1, group, (2, 1), 0x02000018)
    refs = [md.put(struct.pack("<3f", *v)) for v in (position, scale, angles)]
    group = md.put(struct.pack("<3I", *refs) + string("阀室.rvm") + string("8,seg,"))
    md.record(2, group, (3, len(primitives)), 0x0200001F)
    for i, (typ, v) in enumerate(primitives, 3):
        ptr = md.put(string(typ + ":"))
        if typ == "ShellV1":
            name, bb = v
            param = md.put(string(name))
            bounds = md.put(struct.pack("<6f", *bb))
            entry = md.put(struct.pack("<3I", ptr, param, bounds))
            flag = 0x03000027
        else:
            param = md.put(
                struct.pack("<I", len(v) * 4) + struct.pack(f"<{len(v)}f", *v)
            )
            entry = md.put(struct.pack("<4I", ptr, param, 0xFFFFFF, i))
            flag = 0x0300002B
        md.record(i, entry, (0, 0), flag)
    return md.blob()


def source(path, rows=()):
    con = sqlite3.connect(path)
    con.executescript("""
        create table t_plat_wlkx(f_id,f_parentID,f_name,f_guid,f_mdlname);
        create table t_plat_node_list(f_guid,f_coord_x,f_coord_y,f_coord_z,f_heading,f_pitch,f_roll,
            f_scale_x,f_scale_y,f_scale_z);
        create table t_plat_mdl_list(f_guid,f_min_x,f_min_y,f_min_z,f_max_x,f_max_y,f_max_z);
    """)
    for tree, name, frame, bounds in rows:
        guid = f"guid{tree}"
        con.execute(
            "insert into t_plat_wlkx values(?,0,?,?,?)", (tree, name, guid, name)
        )
        if frame:
            con.execute(
                "insert into t_plat_node_list values(?,?,?,?,?,?,?,?,?,?)",
                (guid, *frame),
            )
        if bounds:
            con.execute(
                "insert into t_plat_mdl_list values(?,?,?,?,?,?,?)", (guid, *bounds)
            )
    con.commit()
    con.close()


def build(path, models, assets):
    with sqlite3.connect(":memory:") as dst:
        info = reader.build_scene(
            path / "data.db", path / "model.package", dst, models, assets
        )
        (blob,) = dst.execute("select payload from ez_scene").fetchone()
    magic, axes, faces, arcs = struct.unpack_from("<4sIII", blob)
    assert (magic, axes, faces, arcs) == (
        b"EZS1",
        info["segments"],
        info["triangles"],
        info["arcs"],
    )
    split = 16 + axes * 36
    arc_start = split + faces * 44
    assert len(blob) == arc_start + arcs * 52
    return (
        info,
        list(struct.iter_unpack("<II7f", blob[16:split])),
        list(struct.iter_unpack("<II9f", blob[split:arc_start])),
        list(struct.iter_unpack("<II11f", blob[arc_start:])),
    )


def world(vertex, info):
    return tuple(a + b for a, b in zip(vertex, info["origin"]))


def test_assembled_cylinders_inherit_owner_and_transform_all_ancestors(tmp_path):
    # The catalog tags the outer group. Its descendant has a separate instance frame.
    source(
        tmp_path / "data.db",
        [(1, "first.mdl", (100, 20, 30, 0, 0, 0, 1, 1, 1), (-2, -3, -4, 2, 3, 4))],
    )
    md = model(
        [("CylinderV1", (1, 2, 3, 2, 2, 3, 0.5))],
        position=(4, 10, -6),
        scale=(2, 2, 2),
        angles=(90, 0, 0),
    )
    package(tmp_path / "model.package", [("first.mdl", md)])
    info, segments, triangles, arcs = build(tmp_path, {"first.mdl": 1}, {(1, 7)})
    assert not arcs
    assert not triangles and len(segments) == 1
    tree, node, *values = segments[0]
    assert (tree, node, values[-1]) == (1, 7, 1.0)
    # Native first endpoint (110,34,22), and heading rotates the axis onto native -Z.
    assert world(values[:3], info) == pytest.approx((110, -22, 34))
    assert world(values[3:6], info) == pytest.approx((110, -20, 34))
    assert info["origin"] == [100, -30, 20]
    assert info["objects"] == 1
    parent, child = info["groups"]
    assert child["parent"] == parent["id"]
    assert child["name"] == "阀室.rvm" and parent["segments"] == 1
    assert child["bounds"] == [[9, 8, 13], [11, 10, 15]]


def test_separate_model_trees_keep_placements_and_unresolved_models_separate(tmp_path):
    rows = [
        (1, "a.mdl", (10, 0, 0, 0, 0, 0, 1, 1, 1), None),
        (2, "b.mdl", (-20, 0, 0, 0, 0, 0, 1, 1, 1), None),
        (3, "unknown.mdl", None, None),
    ]
    source(tmp_path / "data.db", rows)
    md = model([("CylinderV1", (0, 0, 0, 2, 0, 0, 0.25))])
    package(tmp_path / "model.package", [(r[1], md) for r in rows])
    info, segments, _, _ = build(tmp_path, {r[1]: r[0] for r in rows}, {(1, 8)})
    assert [(s[0], s[1]) for s in segments] == [(1, 8), (2, 0xFFFFFFFF)]
    assert world(segments[0][2:5], info) == (10, 0, 0)
    assert world(segments[1][2:5], info) == (-20, 0, 0)
    assert info["skipped"]["unplacedTree"] == 1 and info["trees"][2]["bounds"] is None


def native_shell(
    position_type,
    positions=None,
    faces=None,
    transform=(20, 3, -2),
    coefficients=(0.2, 10, 1, 0, 1, 0),
):
    # MS1 maps quantized Y-up positions back into MD1 object space.
    positions = positions or [(0, 0, 0), (5, 0, 0), (0, 3, 0)]
    faces = faces or [(0, 1, 2)]
    mesh = Document(b"MS1\0", 3)
    root = mesh.put(
        struct.pack(
            "<3I9f", len(faces) * 3, len(positions), 0x103, *transform, 1, 1, 1, 0, 0, 0
        )
    )
    mesh.record(0, root, (1, 2), 0x0500003F)
    for i, (name, flag) in enumerate(
        ((f"test.{position_type}", 0x0A000003), ("test.idx", 0x09000003)), 1
    ):
        ptr = mesh.put(string(name))
        mesh.record(i, mesh.put(struct.pack("<2I", 0, ptr)), (0, 0), flag)
    packed = b"".join(
        struct.pack("<3B" if position_type == "pos8" else "<3H", *p) for p in positions
    )
    return [
        ("triangle.msh", mesh.blob()),
        (
            f"test.{position_type}",
            (b"CP1\0" if position_type == "pos8" else b"CP2\0")
            + struct.pack("<6f", *coefficients)
            + packed,
        ),
        ("test.idx", b"IDX\0" + b"".join(struct.pack("<3H", *f) for f in faces)),
    ]


@pytest.mark.parametrize("position_type", ["pos8", "pos16"])
def test_indexed_shell_combines_quantization_mesh_placement_and_assembly(
    tmp_path, position_type
):
    source(tmp_path / "data.db")
    raw = model(
        [("ShellV1", ("triangle.msh", (30, 3, -2, 31, 6, -2)))], position=(-100, 5, 28)
    )
    package(
        tmp_path / "model.package", [("shell.mdl", raw), *native_shell(position_type)]
    )
    info, segments, faces, _ = build(tmp_path, {"shell.mdl": 3}, {(3, 8)})
    assert not segments and len(faces) == 1 and info["surfaceInstances"] == {"mesh": 1}
    tree, node, *v = faces[0]
    assert (tree, node) == (3, 8)
    for i, point in enumerate(((-70, -26, 8), (-69, -26, 8), (-70, -26, 11))):
        assert world(v[3 * i : 3 * i + 3], info) == pytest.approx(point)


def test_nonuniform_instance_is_excluded_from_circular_end_evidence(tmp_path):
    source(tmp_path / "data.db")
    md = model(
        [
            ("CylinderV1", (0, 0, 0, 4, 0, 0, 0.25)),
            ("BoxV1", (2, 5, 7, 1, 0, 0, 0, 2, 0, 0, 0, 3)),
        ],
        scale=(2, 1, 1),
    )
    package(tmp_path / "model.package", [("one.mdl", md)])
    info, segments, faces, _ = build(tmp_path, {"one.mdl": 1}, set())
    assert not segments and len(faces) == 12 and all(f[1] == 0xFFFFFFFF for f in faces)
    points = [world(f[i : i + 3], info) for f in faces for i in (2, 5, 8)]
    assert tuple(map(min, zip(*points))) == (4, -10, 5)
    assert tuple(map(max, zip(*points))) == (6, -7, 7)
    assert info["skipped"]["nonCircularTransform"] == 1


def test_torus_uses_its_own_plane_and_meets_both_native_cylinder_ends(tmp_path):
    source(tmp_path / "data.db")
    raw = model(
        [
            ("CylinderV1", (1, 4, 2, 1, 4, 3, 0.25)),
            ("Torus", (1, 2, 3, 0, 0, 90, 2, 0.25, math.pi / 2)),
            ("CylinderV1", (1, 2, 5, 1, 1, 5, 0.25)),
            ("BoxV1", (0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1)),
        ],
        position=(8, -2, 6),
        scale=(2, 2, 2),
        angles=(90, 0, 0),
    )
    package(tmp_path / "model.package", [("unit.mdl", raw)])
    info, axes, triangles, arcs = build(tmp_path, {"unit.mdl": 1}, {(1, 7)})
    assert (len(axes), len(triangles), len(arcs)) == (2, 12, 1)
    tree, node, *params = arcs[0]
    assert (tree, node) == (1, 7) and info["objects"] == 1
    c, u, v = params[:3], params[3:6], params[6:9]
    sweep, radius = params[-2:]
    assert world(c, info) == pytest.approx((14, -4, 2))
    assert u == pytest.approx((0, 0, 4), abs=1e-6)
    assert v == pytest.approx((4, 0, 0), abs=1e-6)
    assert radius == pytest.approx(0.5)
    assert sweep == pytest.approx(math.pi / 2)
    for t, endpoint in ((0, axes[0][5:8]), (sweep, axes[1][2:5])):
        expected = tuple(
            c[j] + u[j] * math.cos(t) + v[j] * math.sin(t) for j in range(3)
        )
        assert expected == pytest.approx(endpoint, abs=1e-6)
    assert info["trees"][0]["arcs"] == 1
    assert all(g["arcs"] == 1 for g in info["groups"])


def test_signed_arc_extrema_fit_the_shared_floor_plan_without_straight_segments(
    tmp_path,
):
    source(tmp_path / "data.db")
    # Negative 270 degrees crosses extrema away from both endpoints.
    raw = model([("Torus", (0, 0, 0, 0, 0, 0, 4, 0.3, -math.pi * 1.5))])
    package(tmp_path / "model.package", [("unit.mdl", raw)])
    info, axes, triangles, arcs = build(tmp_path, {"unit.mdl": 2}, set())
    assert not axes and not triangles and len(arcs) == 1
    assert arcs[0][1] == 0xFFFFFFFF and info["objects"] == 0
    assert world(info["bounds"][0], info) == pytest.approx((-4.3, -4.3, -0.3))
    assert world(info["bounds"][1], info) == pytest.approx((4.3, 4.3, 0.3))


def test_slender_mesh_uses_source_triangles_when_overview_clustering_collapses(
    tmp_path,
):
    source(tmp_path / "data.db")
    # A thin diagonal tube needs more than the coarse clustering grid to keep its cross section.
    sides = 80
    points = []
    for center in (100, 30000):
        for i in range(sides):
            a = math.tau * i / sides
            points.append(
                (
                    center + round(50 * math.cos(a)),
                    center,
                    center + round(50 * math.sin(a)),
                )
            )
    faces = []
    for i in range(sides):
        j = (i + 1) % sides
        faces.extend(((i, j, i + sides), (j, j + sides, i + sides)))
    shell = native_shell(
        "pos16", points, faces, (0, 0, 0), (0.001, 0, 0.001, 0, 0.001, 0)
    )
    raw = model([("ShellV1", ("triangle.msh", (0.05, 0.1, 0.05, 30.05, 30, 30.05)))])
    package(tmp_path / "model.package", [("unit.mdl", raw), *shell])
    info, axes, triangles, arcs = build(tmp_path, {"unit.mdl": 1}, {(1, 8)})
    assert (
        not axes
        and not arcs
        and len(triangles) == len(faces) == info["detailTriangles"]
    )
    assert info["objects"] == info["locatableObjects"] == 1
    assert all(row[:2] == (1, 8) for row in triangles)
    for coord, vertex in enumerate(points[i] for i in faces[0]):
        world_vertex = world(triangles[0][2 + coord * 3 : 5 + coord * 3], info)
        assert world_vertex == pytest.approx(
            (vertex[0] * 0.001, -vertex[2] * 0.001, vertex[1] * 0.001), abs=2e-6
        )


def test_parent_asset_locates_owned_children_without_duplicating_geometry(tmp_path):
    source(tmp_path / "data.db")
    raw = model([("CylinderV1", (1, 2, 3, 4, 2, 3, 0.5))], position=(10, -2, 1))
    package(tmp_path / "model.package", [("unit.mdl", raw)])
    info, axes, triangles, arcs = build(tmp_path, {"unit.mdl": 1}, {(1, 7), (1, 8)})
    assert len(axes) == 1 and not triangles and not arcs
    assert axes[0][:2] == (1, 8)
    assert info["objects"] == 1 and info["locatableObjects"] == 2
    (item,) = info["assetChildren"]
    assert (item["tree"], item["node"], item["children"]) == (1, 7, [8])
    assert world(item["bounds"][0], info) == pytest.approx((11, -4.5, -0.5))
    assert world(item["bounds"][1], info) == pytest.approx((14, -3.5, 0.5))


def test_scene_rejects_out_of_bounds_resource_pointers_and_cycles(tmp_path):
    source(tmp_path / "data.db")
    data = bytearray(model([("CylinderV1", (0, 0, 0, 1, 0, 0, 0.1))]))
    struct.pack_into("<I", data, 5 + 3 * 16, 0xFFFFFFF0)
    package(tmp_path / "model.package", [("a.mdl", data)])
    with pytest.raises(ValueError, match="越界"):
        build(tmp_path, {"a.mdl": 1}, set())
    data = bytearray(model([]))
    struct.pack_into("<I", data, 5 + 8, 1)
    package(tmp_path / "model.package", [("a.mdl", data)])
    with pytest.raises(ValueError, match="重复引用"):
        build(tmp_path, {"a.mdl": 1}, set())
