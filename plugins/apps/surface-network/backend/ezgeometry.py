"""Read supported XRE MD1/CylinderV1 records in the tagged object's local frame."""

import math
import mmap
import re
import struct
from collections import Counter

RECORD = struct.Struct("<IIII")
CYLINDER = struct.Struct("<7f")


def load_geometry(path, models, owners):
    segments = {}
    stats = Counter()
    with (
        path.open("rb") as stream,
        mmap.mmap(stream.fileno(), 0, access=mmap.ACCESS_READ) as data,
    ):
        if data[:32] != b"X_R_E_Composite_FileSystem_v001\0":
            raise ValueError("不支持的 XRE 几何包版本")
        pos, name = 32, ""
        while pos < len(data):
            end, typ = struct.unpack_from("<QI", data, pos)
            if not pos + 12 <= end <= len(data):
                raise ValueError("XRE 记录边界无效")
            if typ == 3:
                if end - pos > 1024:
                    raise ValueError("XRE 资源名过长")
                name = data[pos + 16 : end].decode("utf-8", "replace")
            if typ == 4 and name in models:
                if data[pos + 16 : pos + 21] == b"MD1\0L":
                    _read_tree(
                        data, pos + 20, end, models[name], owners, segments, stats
                    )
                else:
                    stats["unsupported_tree"] += 1
            pos = end
    return segments, dict(stats)


def _read_tree(data, base, end, tree, owners, segments, stats):
    def uint(p):
        if not base <= p <= end - 4:
            raise ValueError("MD1 属性指针越界")
        return struct.unpack_from("<I", data, p)[0]

    def text_at(p):
        size = uint(p)
        if size > 65536 or p + 4 + size > end:
            raise ValueError("MD1 字符串越界")
        return data[p + 4 : p + 4 + size], p + 4 + size

    limit = uint(base + 1)
    if (
        (limit - 1) % 16
        or not base + limit < end
        or not 1 <= (limit - 1) // 16 <= 5_000_000
    ):
        raise ValueError("MD1 节点目录无效")
    visited = bytearray((limit - 1) // 16)
    stack = [(1, None)]
    while stack:
        off, owner = stack.pop()
        index = (off - 1) // 16
        if visited[index]:
            raise ValueError("MD1 节点目录重复引用")
        visited[index] = 1
        val, count, child, flag = RECORD.unpack_from(data, base + off)
        p = base + val
        if flag in (0x02000018, 0x0200001F, 0x02000010):
            # A non-trivial subassembly transform starts a new local frame.
            # Descendants rebind when a source node has its own asset record.
            if flag == 0x0200001F:
                owner = None
                p += 12
            if flag & 8:
                _, p = text_at(p)
            ident, _ = text_at(p)
            match = re.match(rb"([0-9]{1,16}),(?:seg|sect),", ident)
            if match:
                key = (tree, int(match[1]))
                if key in owners:
                    owner = key
        elif owner is not None and flag == 0x0300002B:
            typ, _ = text_at(base + uint(p))
            if typ == b"CylinderV1:":
                at = base + uint(p + 4)
                if uint(at) == 28 and at + 32 <= end:
                    values = CYLINDER.unpack_from(data, at + 4)
                    if (
                        all(map(math.isfinite, values))
                        and values[-1] > 0
                        and values[:3] != values[3:6]
                    ):
                        segments.setdefault(owner, bytearray()).extend(
                            data[at + 4 : at + 32]
                        )
                        stats["cylinders"] += 1
        if count:
            if (
                child < 1
                or (child - 1) % 16
                or child + count * 16 > limit
                or count > 1_000_000
            ):
                raise ValueError("MD1 子节点目录无效")
            stack.extend((child + i * 16, owner) for i in range(count))
    stats["trees"] += 1
