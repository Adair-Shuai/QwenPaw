"""Assemble eZWalker MD1 instances and CP1/CP2 meshes in the model's shared frame.

EZS1 stores true CylinderV1 end faces, a bounded surface overview and a compact
Torus display stream. Coordinates are little-endian relative to the Z-up origin.
"""

from collections import Counter
from contextlib import closing
from dataclasses import dataclass
from functools import lru_cache
import heapq
import math
import mmap
import sqlite3
import struct

UINT = struct.Struct("<I")
RECORD = struct.Struct("<4I")
VEC = struct.Struct("<3f")
BOX = struct.Struct("<6f")
SEGMENT = struct.Struct("<II7f")
TRIANGLE = struct.Struct("<II9f")
ARC = struct.Struct("<II11f")
HEADER = struct.Struct("<4sIII")
UNOWNED = 0xFFFFFFFF
IDENTITY = (1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0)
Z_UP = (1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0)
ZERO = (0, 0, 0)
ONE = (1, 1, 1)

MAX_CANDIDATES = 18000
MAX_TRIANGLES = 220000
ASSET_TRIANGLE_RESERVE = 8192
BOX_FACES = (
    (0, 3, 1),
    (0, 2, 3),
    (4, 5, 7),
    (4, 7, 6),
    (0, 1, 5),
    (0, 5, 4),
    (2, 6, 7),
    (2, 7, 3),
    (0, 4, 6),
    (0, 6, 2),
    (1, 3, 7),
    (1, 7, 5),
)


def _resources(data):
    if data[:32] != b"X_R_E_Composite_FileSystem_v001\0":
        raise ValueError("不支持的 XRE 几何包版本")
    names = {}
    pos, name = 32, ""
    while pos < len(data):
        if pos + 12 > len(data):
            raise ValueError("XRE 记录被截断")
        end, kind = struct.unpack_from("<QI", data, pos)
        if not pos + 12 <= end <= len(data):
            raise ValueError("XRE 记录边界无效")
        if kind in (3, 4) and pos + 16 > end:
            raise ValueError("XRE 资源头被截断")
        if kind == 3:
            if end - pos > 1024:
                raise ValueError("XRE 资源名过长")
            name = data[pos + 16 : end].decode("utf-8", "replace")
        elif kind == 4 and name.endswith((".mdl", ".msh", ".pos8", ".pos16", ".idx")):
            if name in names:
                raise ValueError("XRE 存在重名几何资源")
            names[name] = (pos + 16, end)
        pos = end
    return names


class Directory:
    """MD1 and MS1 use offsets relative to the byte following their four-byte magic."""

    def __init__(self, data, location):
        start, self.end = location
        self.base = start + 4
        self.data = data
        self.limit = self.uint(1)
        n = (self.limit - 1) // 16
        if (
            data[self.base : self.base + 1] != b"L"
            or (self.limit - 1) % 16
            or not 1 <= n <= 5_000_000
            or self.base + self.limit >= self.end
        ):
            raise ValueError("XRE 节点目录无效")

    def unpack(self, pattern, offset):
        address = self.base + offset
        if offset < 0 or address + pattern.size > self.end:
            raise ValueError("XRE 资源内指针越界")
        return pattern.unpack_from(self.data, address)

    def uint(self, offset):
        return self.unpack(UINT, offset)[0]

    def string(self, offset):
        size = self.uint(offset)
        start = self.base + offset + 4
        if size > 65536 or start + size > self.end:
            raise ValueError("XRE 字符串越界")
        return self.data[start : start + size], offset + 4 + size

    def children(self, start, count):
        if count and (
            start < 1
            or (start - 1) % 16
            or start + count * 16 > self.limit
            or count > 1_000_000
        ):
            raise ValueError("XRE 子节点目录无效")
        return range(start, start + count * 16, 16)


def _point(m, x, y, z):
    return (
        m[0] * x + m[1] * y + m[2] * z + m[3],
        m[4] * x + m[5] * y + m[6] * z + m[7],
        m[8] * x + m[9] * y + m[10] * z + m[11],
    )


def _compose(a, b):
    if b == IDENTITY:
        return a
    result = []
    for i in (0, 4, 8):
        result.extend(
            a[i] * b[j] + a[i + 1] * b[4 + j] + a[i + 2] * b[8 + j] for j in range(3)
        )
        result.append(a[i] * b[3] + a[i + 1] * b[7] + a[i + 2] * b[11] + a[i + 3])
    if not all(map(math.isfinite, result)):
        raise ValueError("模型的累积变换不是有限值")
    return tuple(result)


@lru_cache(maxsize=4096)
def _trs(position, scale, angles):
    if not all(map(math.isfinite, (*position, *scale, *angles))):
        raise ValueError("模型变换包含无效数值")
    x, y, z = position
    sx, sy, sz = scale
    if not any(angles):
        return (sx, 0, 0, x, 0, sy, 0, y, 0, 0, sz, z)
    # Native coordinates are Y-up. Heading, pitch and roll rotate about Y, X, Z.
    h, p, r = map(math.radians, angles)
    ch, cp, cr = math.cos(h), math.cos(p), math.cos(r)
    sh, sp, sr = math.sin(h), math.sin(p), math.sin(r)
    return (
        (ch * cr + sh * sp * sr) * sx,
        (-ch * sr + sh * sp * cr) * sy,
        sh * cp * sz,
        x,
        cp * sr * sx,
        cp * cr * sy,
        -sp * sz,
        y,
        (-sh * cr + ch * sp * sr) * sx,
        (sh * sr + ch * sp * cr) * sy,
        ch * cp * sz,
        z,
    )


@lru_cache(maxsize=4096)
def _circular_scale(m):
    # With shear or nonuniform scaling a cylinder can have an elliptical face.
    # It must not enter the circular-end evidence stream.
    a, b, c = tuple(tuple(m[i + j] for i in (0, 4, 8)) for j in range(3))
    squared = tuple(sum(v * v for v in col) for col in (a, b, c))
    tol = max(squared) * 1e-6
    if min(squared) <= 0 or max(squared) - min(squared) > tol:
        return None
    if any(
        abs(sum(i * j for i, j in zip(u, v))) > tol for u, v in ((a, b), (a, c), (b, c))
    ):
        return None
    return math.sqrt(sum(squared) / 3)


def _bounds(m, native):
    if not all(map(math.isfinite, native)) or any(
        native[i] > native[i + 3] for i in range(3)
    ):
        raise ValueError("模型包围盒无效")
    center = tuple((native[i] + native[i + 3]) * 0.5 for i in range(3))
    half = tuple((native[i + 3] - native[i]) * 0.5 for i in range(3))
    c = _point(m, *center)
    d = tuple(sum(abs(m[i + j]) * half[j] for j in range(3)) for i in (0, 4, 8))
    return tuple(c[j] - d[j] for j in range(3)) + tuple(c[j] + d[j] for j in range(3))


def _union(old, new):
    if old is None:
        return new
    return (
        min(old[0], new[0]),
        min(old[1], new[1]),
        min(old[2], new[2]),
        max(old[3], new[3]),
        max(old[4], new[4]),
        max(old[5], new[5]),
    )


def _relative(bounds, origin):
    if bounds is None:
        return None
    return [[bounds[k + i] - origin[i] for i in range(3)] for k in (0, 3)]


def _models(source, models):
    """Only use a shared frame when the source declares one across model trees."""
    with closing(
        sqlite3.connect(source.resolve().as_uri() + "?mode=ro&immutable=1", uri=True)
    ) as db:
        db.execute("pragma trusted_schema=off")
        db.execute("pragma query_only=on")
        tables = {r[1] for r in db.execute("pragma table_list") if r[2] == "table"}
        columns = {r[1] for r in db.execute("pragma table_info(t_plat_wlkx)")}
        records = {}
        if {
            "f_id",
            "f_parentID",
            "f_name",
            "f_guid",
        } <= columns and "t_plat_wlkx" in tables:
            records = {
                k: (p, n, g)
                for k, p, n, g in db.execute(
                    "select f_id,f_parentID,f_name,f_guid from t_plat_wlkx"
                )
            }
        placements = {}
        if "t_plat_node_list" in tables:
            for guid, *v in db.execute(
                "select f_guid,f_coord_x,f_coord_y,f_coord_z,f_heading,f_pitch,f_roll,"
                "f_scale_x,f_scale_y,f_scale_z from t_plat_node_list"
            ):
                placements[guid] = _trs(tuple(v[:3]), tuple(v[6:]), tuple(v[3:6]))
        native_bounds = {}
        if "t_plat_mdl_list" in tables:
            native_bounds = {
                k: v
                for k, *v in db.execute(
                    "select f_guid,f_min_x,f_min_y,f_min_z,f_max_x,f_max_y,f_max_z from t_plat_mdl_list"
                )
            }
    result = []
    active = {
        fname: tree
        for fname, tree in models.items()
        if isinstance(fname, str) and fname.lower().endswith(".mdl")
    }
    for filename, tree in active.items():
        if not isinstance(tree, int) or not 0 <= tree < UNOWNED:
            raise ValueError("模型树编号超出 EZS1 支持范围")
        parent, name, guid = records.get(tree, (0, filename, None))
        frame = placements.get(guid)
        if frame is None and len(active) == 1:
            frame = IDENTITY
        lineage = {tree}
        while frame is not None and parent not in (0, -1, None):
            if parent in lineage:
                raise ValueError("模型树的父级形成循环")
            lineage.add(parent)
            if parent not in records:
                frame = None
                break
            parent, _, pguid = records[parent]
            if pguid not in placements:
                frame = None
                break
            frame = _compose(placements[pguid], frame)
        if frame is not None:
            frame = _compose(Z_UP, frame)
        bounds = (
            _bounds(frame, native_bounds[guid])
            if frame is not None and guid in native_bounds
            else None
        )
        result.append((filename, tree, name, frame, bounds))
    return result


@dataclass
class Group:
    tree: int
    node: int
    name: str
    parent: object = None
    bounds: tuple | None = None
    segments: int = 0
    triangles: int = 0
    arcs: int = 0

    @property
    def key(self):
        return f"{self.tree}:{self.node}"

    def merge(self, bounds):
        self.bounds = _union(self.bounds, bounds)


def _node_id(ident):
    number, sep, rest = ident.partition(b",")
    if (
        sep
        and 1 <= len(number) <= 10
        and number.isdigit()
        and rest.startswith((b"seg,", b"sect,"))
    ):
        n = int(number)
        if n < UNOWNED:
            return n
    return None


def _walk(md, tree, owners, frame, root, groups, asset_children):
    visited = bytearray((md.limit - 1) // 16)
    stack = [(1, frame, UNOWNED, root)]
    while stack:
        off, transform, owner, group = stack.pop()
        index = (off - 1) // 16
        if visited[index]:
            raise ValueError("MD1 节点目录重复引用")
        visited[index] = 1
        p, count, child, flag = md.unpack(RECORD, off)
        kind = flag >> 24
        if kind == 2:
            if flag & ~0x0200001F or not flag & 16:
                # A group whose placement cannot be read must not inherit its parent's frame.
                yield None, p, flag, transform, owner, group
                continue
            parts = []
            for mask, default in ((1, ZERO), (2, ONE), (4, ZERO)):
                value = default
                if flag & mask:
                    value = md.unpack(VEC, md.uint(p))
                    p += 4
                parts.append(value)
            if flag & 7:
                transform = _compose(transform, _trs(*parts))
            name = b""
            if flag & 8:
                name, p = md.string(p)
            ident, _ = md.string(p)
            node = _node_id(ident)
            if node is not None:
                if (tree, node) in owners:
                    if owner != UNOWNED and owner != node:
                        asset_children.setdefault((tree, owner), set()).add(node)
                    owner = node
                lower = name.lower()
                if lower.endswith((b".rvm", b".wlkx")):
                    group = Group(tree, node, name.decode("utf-8", "replace"), group)
                    groups.append(group)
        elif kind == 3:
            if flag in (0x0300002B, 0x03000027):
                tag, _ = md.string(md.uint(p))
                yield tag, p, flag, transform, owner, group
            else:
                yield None, p, flag, transform, owner, group
        elif flag != 0x01000001:
            yield None, p, flag, transform, owner, group
            continue
        stack.extend(
            (i, transform, owner, group) for i in reversed(md.children(child, count))
        )


def _primitive(md, pointer, pattern):
    if md.uint(pointer) != pattern.size:
        return None
    v = md.unpack(pattern, pointer + 4)
    return v if all(map(math.isfinite, v)) else None


class CandidatePool:
    """Reserve a surface per unrepresented asset and submodel before allocating by size."""

    def __init__(self):
        self.by_owner = {}
        self.by_group = {}
        self.largest = []
        self.sequence = 0

    def add(self, owner, group, shape, frame, payload, bounds):
        sizes = sorted((bounds[i + 3] - bounds[i] for i in range(3)), reverse=True)
        if not sizes[0] > 0:
            return
        score = sizes[0] * (sizes[1] + 0.02 * sizes[0])
        self.sequence += 1
        item = (score, self.sequence, owner, group, shape, frame, payload)
        if owner != UNOWNED:
            key = (group.tree, owner)
            if key not in self.by_owner or score > self.by_owner[key][0]:
                self.by_owner[key] = item
        if group.key not in self.by_group or score > self.by_group[group.key][0]:
            self.by_group[group.key] = item
        if len(self.largest) < MAX_CANDIDATES:
            heapq.heappush(self.largest, item)
        elif score > self.largest[0][0]:
            heapq.heapreplace(self.largest, item)

    def ordered(self, represented):
        seen = set()
        for bucket in (
            self.by_group.values(),
            (v for k, v in self.by_owner.items() if k not in represented),
            self.largest,
        ):
            for item in sorted(bucket, reverse=True):
                if item[1] not in seen:
                    seen.add(item[1])
                    yield item


OCT_FACES = (
    (0, 2, 4),
    (2, 1, 4),
    (1, 3, 4),
    (3, 0, 4),
    (2, 0, 5),
    (1, 2, 5),
    (3, 1, 5),
    (0, 3, 5),
)
POS_FORMATS = {b"CP1\0": struct.Struct("<3B"), b"CP2\0": struct.Struct("<3H")}
INDEX_FORMATS = {1: struct.Struct("<B"), 2: struct.Struct("<H"), 4: struct.Struct("<I")}
FOUR = struct.Struct("<4f")
SEVEN = struct.Struct("<7f")
NINE = struct.Struct("<9f")
TWELVE = struct.Struct("<12f")


def _box_points(v):
    return tuple(
        tuple(
            v[j]
            + (v[3 + j] if i & 1 else 0)
            + (v[6 + j] if i & 2 else 0)
            + (v[9 + j] if i & 4 else 0)
            for j in range(3)
        )
        for i in range(8)
    )


def _point_bounds(points):
    x, y, z = zip(*points)
    return min(x), min(y), min(z), max(x), max(y), max(z)


def _mesh(data, resources, name, parent_frame, budget):
    """Decode indexed triangle lists, clustering source vertices for the overview LOD."""
    loc = resources.get(name)
    if loc is None or data[loc[0] : loc[0] + 4] != b"MS1\0":
        return (), ()
    mesh = Directory(data, loc)
    p, count, child, flag = mesh.unpack(RECORD, 1)
    if flag not in (0x05000007, 0x0500003F):
        return (), ()
    n_indices, n_vertices, mode = mesh.unpack(struct.Struct("<3I"), p)
    if (
        mode != 0x103
        or n_indices % 3
        or not 3 <= n_indices <= 2_000_000
        or not 3 <= n_vertices <= 500_000
    ):
        return (), ()
    p += 12
    if flag & 56:
        position, scale, rotation = (mesh.unpack(VEC, p + i) for i in (0, 12, 24))
        parent_frame = _compose(parent_frame, _trs(position, scale, rotation))
    pos = idx = None
    for i in mesh.children(child, count):
        ptr, _, _, child_flag = mesh.unpack(RECORD, i)
        if child_flag in (0x0A000003, 0x09000003):
            raw_name, _ = mesh.string(mesh.uint(ptr + 4))
            resource = resources.get(raw_name.decode("utf-8", "replace"))
            if child_flag == 0x0A000003:
                pos = resource
            else:
                idx = resource
    if pos is None or idx is None:
        return (), ()
    start, end = pos
    pos_struct = POS_FORMATS.get(data[start : start + 4])
    ib, ie = idx
    index_struct = INDEX_FORMATS.get((ie - ib - 4) // n_indices)
    if (
        not pos_struct
        or not index_struct
        or data[ib : ib + 4] != b"IDX\0"
        or end - start != 28 + n_vertices * pos_struct.size
        or ie - ib != 4 + n_indices * index_struct.size
    ):
        return (), ()
    sx, ox, sy, oy, sz, oz = BOX.unpack_from(data, start + 4)
    frame = _compose(parent_frame, _trs((ox, oy, oz), (sx, sy, sz), ZERO))
    points = list(pos_struct.iter_unpack(data[start + 28 : end]))
    faces = list(
        struct.Struct("<3" + index_struct.format[-1]).iter_unpack(data[ib + 4 : ie])
    )
    if any(a >= n_vertices or b >= n_vertices or c >= n_vertices for a, b, c in faces):
        raise ValueError("MS1 三角网索引越过顶点缓冲区")
    if len(faces) > budget:
        # Map the native indexed mesh to an increasingly coarse grid. Each retained
        # vertex is from the source mesh. Avoid an unconnected scatter of sampled faces.
        lo = _point_bounds(points)
        scales = abs(sx), abs(sy), abs(sz)
        spans = tuple(lo[j + 3] - lo[j] for j in range(3))
        longest = max(spans[j] * scales[j] for j in range(3))
        if longest == 0:
            return (), ()
        for n in (5, 3, 2, 1):
            steps = tuple(
                (
                    max(1, round(n * spans[j] * scales[j] / longest)) / spans[j]
                    if spans[j]
                    else 0
                )
                for j in range(3)
            )
            cells, remap = {}, []
            for i, (x, y, z) in enumerate(points):
                key = (
                    int((x - lo[0]) * steps[0] + 0.5),
                    int((y - lo[1]) * steps[1] + 0.5),
                    int((z - lo[2]) * steps[2] + 0.5),
                )
                remap.append(cells.setdefault(key, i))
            reduced, used = [], set()
            for a, b, c in faces:
                a, b, c = remap[a], remap[b], remap[c]
                if a != b and b != c and c != a:
                    key = tuple(sorted((a, b, c)))
                    if key not in used:
                        reduced.append((a, b, c))
                        used.add(key)
            if len(reduced) <= budget:
                faces = reduced
                break
        else:
            return (), ()
    # Indices from quantized buffers have seams; only expand the vertices still used.
    result = {i: _point(frame, *points[i]) for face in faces for i in face}
    return result, faces


def _surface(shape, frame, value, data, resources, budget):
    if shape == "mesh":
        return _mesh(data, resources, value, frame, budget)
    if shape == "sphere":
        x, y, z, r = value
        points = (
            (x + r, y, z),
            (x - r, y, z),
            (x, y + r, z),
            (x, y - r, z),
            (x, y, z + r),
            (x, y, z - r),
        )
        return tuple(_point(frame, *p) for p in points), OCT_FACES
    if shape == "box":
        return tuple(_point(frame, *p) for p in _box_points(value)), BOX_FACES
    return (), ()


def _finite_bounds(bounds):
    # These will be encoded in a Float32Array in the viewer.
    return all(math.isfinite(v) and abs(v) < 1e35 for v in bounds)


class Scene:
    def __init__(self, declared):
        self.bounds = declared
        self.origin = None
        if declared is not None:
            self.origin = tuple((declared[i] + declared[i + 3]) / 2 for i in range(3))
        self.axes, self.surfaces, self.arcs = bytearray(), bytearray(), bytearray()
        self.groups, self.trees = [], []
        self.represented = set()
        self.arc_owners = set()
        self.asset_children = {}
        self.asset_bounds = {}
        self.detail_triangles = 0
        self.pool = CandidatePool()
        self.source_types, self.skipped, self.drawn = Counter(), Counter(), Counter()

    def set_origin(self, bounds):
        if self.origin is None:
            self.origin = tuple((bounds[i] + bounds[i + 3]) / 2 for i in range(3))

    def record_bounds(self, group, owner, bounds):
        group.merge(bounds)
        if owner != UNOWNED:
            key = group.tree, owner
            self.asset_bounds[key] = _union(self.asset_bounds.get(key), bounds)

    def axis(self, md, pointer, frame, owner, group):
        values = _primitive(md, pointer, SEVEN)
        if not values or values[-1] <= 0 or values[:3] == values[3:6]:
            self.skipped["invalidCylinder"] += 1
            return
        scale = _circular_scale(frame)
        if scale is None:
            self.skipped["nonCircularTransform"] += 1
            return
        a, b = _point(frame, *values[:3]), _point(frame, *values[3:6])
        r = values[-1] * scale
        dx, dy, dz = b[0] - a[0], b[1] - a[1], b[2] - a[2]
        length = math.hypot(dx, dy, dz)
        if not length or not _finite_bounds((*a, *b, r)):
            self.skipped["invalidCylinder"] += 1
            return
        rx, ry, rz = (
            r * math.sqrt(max(0.0, 1 - (d / length) ** 2)) for d in (dx, dy, dz)
        )
        bounds = (
            min(a[0], b[0]) - rx,
            min(a[1], b[1]) - ry,
            min(a[2], b[2]) - rz,
            max(a[0], b[0]) + rx,
            max(a[1], b[1]) + ry,
            max(a[2], b[2]) + rz,
        )
        self.set_origin(bounds)
        x, y, z = self.origin
        self.axes.extend(
            SEGMENT.pack(
                group.tree,
                owner,
                a[0] - x,
                a[1] - y,
                a[2] - z,
                b[0] - x,
                b[1] - y,
                b[2] - z,
                r,
            )
        )
        group.segments += 1
        self.record_bounds(group, owner, bounds)
        if owner != UNOWNED:
            self.represented.add((group.tree, owner))

    def torus(self, md, pointer, frame, owner, group):
        values = _primitive(md, pointer, NINE)
        if not values:
            self.skipped["invalidTorus"] += 1
            return
        major, minor, sweep = values[6:]
        if major <= 0 or minor <= 0 or not 0 < abs(sweep) <= math.tau + 1e-5:
            self.skipped["invalidTorus"] += 1
            return
        scale = _circular_scale(frame)
        if scale is None:
            self.skipped["nonCircularTorusTransform"] += 1
            return
        pose = _compose(frame, _trs(values[:3], ONE, values[3:6]))
        center = pose[3], pose[7], pose[11]
        # Source Torus starts on local +X and sweeps towards +Z.
        u = tuple(pose[i] * major for i in (0, 4, 8))
        v = tuple(pose[i] * major for i in (2, 6, 10))
        tube = minor * scale
        if not _finite_bounds((*center, *u, *v, tube)):
            self.skipped["invalidTorus"] += 1
            return
        lo, hi = [], []
        start, span = min(0.0, sweep), abs(sweep)
        for c, a, b in zip(center, u, v):
            end = a * math.cos(sweep) + b * math.sin(sweep)
            amplitude = math.hypot(a, b)
            peak = math.atan2(b, a)
            # Include an interior extremum only when it falls on the signed arc.
            high = amplitude if (peak - start) % math.tau <= span else max(a, end)
            low = (
                -amplitude
                if (peak + math.pi - start) % math.tau <= span
                else min(a, end)
            )
            lo.append(c + low - tube)
            hi.append(c + high + tube)
        bounds = (*lo, *hi)
        self.set_origin(bounds)
        center_relative = tuple(c - o for c, o in zip(center, self.origin))
        self.arcs.extend(
            ARC.pack(group.tree, owner, *center_relative, *u, *v, sweep, tube)
        )
        group.arcs += 1
        self.record_bounds(group, owner, bounds)
        if owner != UNOWNED:
            self.arc_owners.add((group.tree, owner))

    def scan(self, md, tree, owners, frame, root):
        for tag, p, flag, frame, owner, group in _walk(
            md, tree, owners, frame, root, self.groups, self.asset_children
        ):
            if tag is None:
                self.skipped[f"flag:{flag:08x}"] += 1
                continue
            kind = tag.decode("utf-8", "replace").rstrip(":")
            self.source_types[kind] += 1
            pointer = md.uint(p + 4)
            if tag == b"CylinderV1:" and flag == 0x0300002B:
                self.axis(md, pointer, frame, owner, group)
                continue
            if tag == b"Torus:" and flag == 0x0300002B:
                self.torus(md, pointer, frame, owner, group)
                continue
            if tag == b"ShellV1:" and flag == 0x03000027:
                name, _ = md.string(pointer)
                value = name.decode("utf-8", "replace")
                bounds = _bounds(frame, md.unpack(BOX, md.uint(p + 8)))
                shape = "mesh"
            elif tag == b"BoxV1:" and flag == 0x0300002B:
                value = _primitive(md, pointer, TWELVE)
                if value is None:
                    self.skipped["invalidBox"] += 1
                    continue
                # Corner + three oriented edges. World bounds can use their component spans.
                x, y, z = _point(frame, *value[:3])
                center = (x, y, z)
                lo, hi = list(center), list(center)
                for off in (3, 6, 9):
                    vx, vy, vz = value[off : off + 3]
                    for j, i in enumerate((0, 4, 8)):
                        d = frame[i] * vx + frame[i + 1] * vy + frame[i + 2] * vz
                        lo[j] += min(d, 0)
                        hi[j] += max(d, 0)
                bounds = (*lo, *hi)
                shape = "box"
            elif tag == b"SphereV1:" and flag == 0x0300002B:
                value = _primitive(md, pointer, FOUR)
                if value is None or value[3] <= 0:
                    self.skipped["invalidSphere"] += 1
                    continue
                x, y, z, r = value
                bounds = _bounds(frame, (x - r, y - r, z - r, x + r, y + r, z + r))
                shape = "sphere"
            else:
                self.skipped[kind] += 1
                continue
            if not _finite_bounds(bounds):
                self.skipped["invalidBounds"] += 1
                continue
            self.set_origin(bounds)
            self.record_bounds(group, owner, bounds)
            self.pool.add(owner, group, shape, frame, value, bounds)

    def render_surface(self, item, data, resources, budget):
        _, _, owner, group, shape, frame, value = item
        points, faces = _surface(shape, frame, value, data, resources, budget)
        drawn = 0
        x, y, z = self.origin or ZERO
        for i, j, k in faces:
            a, b, c = points[i], points[j], points[k]
            if not _finite_bounds((*a, *b, *c)) or a == b or b == c or a == c:
                continue
            self.surfaces.extend(
                TRIANGLE.pack(
                    group.tree,
                    owner,
                    a[0] - x,
                    a[1] - y,
                    a[2] - z,
                    b[0] - x,
                    b[1] - y,
                    b[2] - z,
                    c[0] - x,
                    c[1] - y,
                    c[2] - z,
                )
            )
            drawn += 1
        if drawn:
            group.triangles += drawn
            if owner != UNOWNED:
                self.represented.add((group.tree, owner))
            self.drawn[shape] += 1
        return drawn

    def draw(self, data, resources):
        left = MAX_TRIANGLES
        for item in self.pool.ordered(self.represented):
            if left < 12:
                break
            group = item[3]
            # Large site envelopes keep more detail; smaller fittings get a lower LOD.
            budget = min(left, 128 if group.triangles == 0 else 40)
            drawn = self.render_surface(item, data, resources, budget)
            if not drawn:
                self.skipped["unavailableSurface"] += 1
            left -= drawn

        # Coarse vertex clustering can flatten a long, slender pipe into a line.
        # Restore its actual indexed mesh if no other surface or axis represents it.
        left = ASSET_TRIANGLE_RESERVE
        missing = self.pool.by_owner.keys() - self.represented - self.arc_owners
        for item in sorted((self.pool.by_owner[k] for k in missing), reverse=True):
            if left < 12:
                break
            drawn = self.render_surface(item, data, resources, min(1024, left))
            self.detail_triangles += drawn
            left -= drawn

    def child_locations(self, represented, origin):
        rows = []
        for (tree, node), children in sorted(self.asset_children.items()):
            if (tree, node) in represented:
                continue
            seen, matches, bounds = {node}, [], None
            stack = list(children)
            while stack:
                child = stack.pop()
                if child in seen:
                    continue
                seen.add(child)
                key = (tree, child)
                if key in represented:
                    matches.append(child)
                    bounds = _union(bounds, self.asset_bounds[key])
                stack.extend(self.asset_children.get(key, ()))
            if matches:
                rows.append(
                    {
                        "tree": tree,
                        "node": node,
                        "children": sorted(matches),
                        "bounds": _relative(bounds, origin),
                    }
                )
        return rows

    def summary(self):
        origin = self.origin or ZERO
        # Descendants precede parents when iterating in reverse discovery order.
        for g in reversed(self.groups):
            if g.bounds is not None:
                g.parent.merge(g.bounds)
            g.parent.segments += g.segments
            g.parent.triangles += g.triangles
            g.parent.arcs += g.arcs
        tree_rows = []
        for tree in self.trees:
            if tree.bounds is not None:
                self.bounds = _union(self.bounds, tree.bounds)
            tree_rows.append(
                {
                    "id": tree.tree,
                    "name": tree.name,
                    "bounds": _relative(tree.bounds, origin),
                    "count": tree.segments + tree.triangles + tree.arcs,
                    "segments": tree.segments,
                    "triangles": tree.triangles,
                    "arcs": tree.arcs,
                }
            )
        groups = [
            {
                "id": g.key,
                "tree": g.tree,
                "node": g.node,
                "name": g.name,
                "parent": g.parent.key if g.parent.parent is not None else None,
                "bounds": _relative(g.bounds, origin),
                "segments": g.segments,
                "triangles": g.triangles,
                "arcs": g.arcs,
            }
            for g in self.groups
            if g.bounds is not None
        ]
        represented = self.represented | self.arc_owners
        locations = self.child_locations(represented, origin)
        return {
            "version": 1,
            "upAxis": "Z",
            "origin": list(origin),
            "bounds": _relative(self.bounds, origin),
            "trees": tree_rows,
            "groups": groups,
            "segments": len(self.axes) // SEGMENT.size,
            "triangles": len(self.surfaces) // TRIANGLE.size,
            "arcs": len(self.arcs) // ARC.size,
            "objects": len(represented),
            "locatableObjects": len(represented) + len(locations),
            "assetChildren": locations,
            "sourcePrimitives": dict(self.source_types),
            "surfaceInstances": dict(self.drawn),
            "skipped": dict(self.skipped),
            "surfaceTriangleLimit": MAX_TRIANGLES + ASSET_TRIANGLE_RESERVE,
            "detailTriangles": self.detail_triangles,
        }


def build_scene(source, geometry, dst, models, owners):
    entries = _models(source, models)
    declared = None
    for _, _, _, _, box in entries:
        if box is not None:
            declared = _union(declared, box)
    scene = Scene(declared)
    with (
        geometry.open("rb") as stream,
        mmap.mmap(stream.fileno(), 0, access=mmap.ACCESS_READ) as data,
    ):
        resources = _resources(data)
        for filename, tree, name, frame, bounds in entries:
            group = Group(tree, -1, name or filename, bounds=bounds)
            scene.trees.append(group)
            if frame is None:
                scene.skipped["unplacedTree"] += 1
                continue
            location = resources.get(filename)
            if not location or data[location[0] : location[0] + 4] != b"MD1\0":
                scene.skipped["unsupportedTree"] += 1
                continue
            scene.scan(Directory(data, location), tree, owners, frame, group)
        scene.draw(data, resources)
    summary = scene.summary()
    payload = b"".join(
        (
            HEADER.pack(
                b"EZS1", summary["segments"], summary["triangles"], summary["arcs"]
            ),
            scene.axes,
            scene.surfaces,
            scene.arcs,
        )
    )
    dst.execute("create table if not exists ez_scene(payload blob not null)")
    dst.execute("delete from ez_scene")
    dst.execute("insert into ez_scene values(?)", (payload,))
    return summary
