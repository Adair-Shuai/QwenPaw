# -*- coding: utf-8 -*-
"""Shared hexahedron topology for corner-point reservoir cells.

VTK_HEXAHEDRON winding (used by CMG, builtin GRDECL and the viewer)::

    3------2        7------6
    |      |        |      |
    0------1        4------5
     k = 0            k + 1

xtgeo / Eclipse ``get_xyz_corners`` uses pairing order instead
(SW, SE, NW, NE per layer)::

    2------3        6------7
    |      |        |      |
    0------1        4------5

Feeding pairing-order corners into VTK face tables produces hourglass
triangles on every cell.  :data:`XTGEO_TO_VTK` reorders one cell so the
shared VTK faces become proper structured quads.

Corner-point faces are often non-planar.  Splitting each quad along one
diagonal (two triangles) puts a crease on that diagonal.  OPM's
``compute_face_geometry_3d`` (opm-grid ``geometry.c``) fans four
triangles from the face-node average instead.  :func:`tessellate_hex_opm_fan`
matches that fill and assigns one area-weighted normal per logical face.
"""

from __future__ import annotations

from array import array
from typing import Sequence

VTK_HEX_FACES: tuple[tuple[int, int, int, int], ...] = (
    (0, 1, 2, 3),
    (4, 7, 6, 5),
    (0, 1, 5, 4),
    (3, 2, 6, 7),
    (0, 3, 7, 4),
    (1, 2, 6, 5),
)

VTK_HEX_EDGES: tuple[tuple[int, int], ...] = (
    (0, 1), (1, 2), (2, 3), (3, 0),
    (4, 5), (5, 6), (6, 7), (7, 4),
    (0, 4), (1, 5), (2, 6), (3, 7),
)

# vtk_corner_index -> xtgeo/Eclipse pairing index
XTGEO_TO_VTK: tuple[int, ...] = (0, 1, 3, 2, 4, 5, 7, 6)

# Viewer fill: 6 faces * (4 duplicated corners + 1 centroid)
HEX_FILL_VERTS_PER_FACE = 5
HEX_FILL_VERTS_PER_CELL = 6 * HEX_FILL_VERTS_PER_FACE
HEX_FILL_INDICES_PER_CELL = 6 * 4 * 3
# On-disk / MeshLab layout: 8 VTK corners + 6 face centroids
HEX_COMPACT_VERTS_PER_CELL = 8 + 6


def build_hex_triangle_indices(n_cells: int) -> array:
    """36 triangle indices per cell (6 quads) in VTK hex winding."""
    indices = array("I")
    for cell_index in range(n_cells):
        base = cell_index * 8
        for a, b, c, d in VTK_HEX_FACES:
            indices.extend((base + a, base + b, base + c, base + a, base + c, base + d))
    return indices


def eclipse_pairing_to_vtk(positions: Sequence[float]) -> list[float]:
    """Reorder 8-corner cells from Eclipse pairing to VTK hex winding."""
    if len(positions) % 24:
        raise ValueError("hex positions length must be a multiple of 24")
    remapped: list[float] = []
    for base in range(0, len(positions), 24):
        cell = positions[base:base + 24]
        for eclipse_index in XTGEO_TO_VTK:
            offset = eclipse_index * 3
            remapped.extend(cell[offset:offset + 3])
    return remapped


def _cross(a: tuple[float, float, float], b: tuple[float, float, float]) -> tuple[float, float, float]:
    return (
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    )


def hex_quad_normal_agreement(
    positions: Sequence[float],
    cell_index: int,
    face: tuple[int, int, int, int],
) -> float:
    """Return the cosine of the angle between the two triangle normals of a quad.

    ~+1 means a proper planar face; ~-1 means a bowtie / pairing-order face.
    """
    base = cell_index * 8

    def vertex(corner: int) -> tuple[float, float, float]:
        offset = (base + corner) * 3
        return (float(positions[offset]), float(positions[offset + 1]), float(positions[offset + 2]))

    a, b, c, d = (vertex(index) for index in face)
    n1 = _cross((b[0] - a[0], b[1] - a[1], b[2] - a[2]), (c[0] - a[0], c[1] - a[1], c[2] - a[2]))
    n2 = _cross((c[0] - a[0], c[1] - a[1], c[2] - a[2]), (d[0] - a[0], d[1] - a[1], d[2] - a[2]))
    len1 = (n1[0] ** 2 + n1[1] ** 2 + n1[2] ** 2) ** 0.5
    len2 = (n2[0] ** 2 + n2[1] ** 2 + n2[2] ** 2) ** 0.5
    if len1 == 0.0 or len2 == 0.0:
        return 0.0
    return (n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2]) / (len1 * len2)


def uses_eclipse_pairing(positions: Sequence[float], sample: int = 32) -> bool:
    """True when 8-corner cells use Eclipse pairing rather than VTK winding."""
    if len(positions) < 24 or len(positions) % 24:
        return False
    n_cells = len(positions) // 24
    vtk_score = 0.0
    eclipse_score = 0.0
    for cell_index in range(min(n_cells, max(1, sample))):
        vtk_score += hex_quad_normal_agreement(positions, cell_index, (0, 1, 2, 3))
        eclipse_score += hex_quad_normal_agreement(positions, cell_index, (0, 1, 3, 2))
    return eclipse_score > vtk_score + 0.25 * min(n_cells, sample)


def _normalize(vector: tuple[float, float, float]) -> tuple[float, float, float]:
    length = (vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2) ** 0.5
    if length == 0.0:
        return (0.0, 0.0, 1.0)
    return (vector[0] / length, vector[1] / length, vector[2] / length)


def opm_quad_normal(
    a: tuple[float, float, float],
    b: tuple[float, float, float],
    c: tuple[float, float, float],
    d: tuple[float, float, float],
) -> tuple[float, float, float]:
    """Area-weighted unit normal of a (possibly non-planar) quad.

    Matches OPM ``compute_face_geometry_3d``: average the face nodes, then
    accumulate ``cross(prev - centroid, curr - centroid)`` around the ring.
    """
    centroid = (
        (a[0] + b[0] + c[0] + d[0]) * 0.25,
        (a[1] + b[1] + c[1] + d[1]) * 0.25,
        (a[2] + b[2] + c[2] + d[2]) * 0.25,
    )
    ring = (a, b, c, d)
    previous = (
        d[0] - centroid[0],
        d[1] - centroid[1],
        d[2] - centroid[2],
    )
    accumulated = (0.0, 0.0, 0.0)
    for node in ring:
        current = (
            node[0] - centroid[0],
            node[1] - centroid[1],
            node[2] - centroid[2],
        )
        delta = _cross(previous, current)
        accumulated = (
            accumulated[0] + delta[0],
            accumulated[1] + delta[1],
            accumulated[2] + delta[2],
        )
        previous = current
    return _normalize(accumulated)


def hex_verts_per_cell(n_coordinates: int, n_cells: int) -> int:
    """Return vertices per cell when ``n_coordinates`` is a flat xyz array."""
    if n_cells <= 0 or n_coordinates % 3:
        return 0
    verts_per_cell = (n_coordinates // 3) // n_cells
    if verts_per_cell <= 0 or n_cells * verts_per_cell * 3 != n_coordinates:
        return 0
    return verts_per_cell


def extract_hex_corners(positions: Sequence[float], n_cells: int) -> list[float]:
    """Return the 8 VTK corners per cell from an 8- or 14-vert hex buffer."""
    verts_per_cell = hex_verts_per_cell(len(positions), n_cells)
    if verts_per_cell == 8:
        return [float(value) for value in positions]
    if verts_per_cell != HEX_COMPACT_VERTS_PER_CELL:
        raise ValueError("hex corners require 8 or 14 vertices per cell")
    corners: list[float] = []
    for cell_index in range(n_cells):
        start = cell_index * HEX_COMPACT_VERTS_PER_CELL * 3
        corners.extend(float(value) for value in positions[start:start + 24])
    return corners


def build_hex_centroid_fan_indices(n_cells: int) -> array:
    """72 OPM centroid-fan indices per cell into the 14-vert compact layout."""
    indices = array("I")
    for cell_index in range(n_cells):
        vert_base = cell_index * HEX_COMPACT_VERTS_PER_CELL
        for face_index, face in enumerate(VTK_HEX_FACES):
            midpoint = vert_base + 8 + face_index
            a, b, c, d = (vert_base + index for index in face)
            indices.extend((
                midpoint, a, b,
                midpoint, b, c,
                midpoint, c, d,
                midpoint, d, a,
            ))
    return indices


def compact_hex_centroid_mesh(
    corner_positions: Sequence[float],
) -> tuple[list[float], array]:
    """Expand 8-corner cells to the on-disk OPM centroid-fan mesh.

    Each cell is 8 VTK corners followed by 6 face centroids.  Indices fan
    four triangles from each centroid so a MeshLab/VTK dump has no
    diagonal crease on non-planar corner-point faces.
    """
    if len(corner_positions) % 24:
        raise ValueError("hex positions length must be a multiple of 24")
    n_cells = len(corner_positions) // 24
    positions: list[float] = []
    for cell_index in range(n_cells):
        source = cell_index * 24
        corners = [float(value) for value in corner_positions[source:source + 24]]
        positions.extend(corners)
        for face in VTK_HEX_FACES:
            points = [corners[index * 3:index * 3 + 3] for index in face]
            positions.extend((
                (points[0][0] + points[1][0] + points[2][0] + points[3][0]) * 0.25,
                (points[0][1] + points[1][1] + points[2][1] + points[3][1]) * 0.25,
                (points[0][2] + points[1][2] + points[2][2] + points[3][2]) * 0.25,
            ))
    return positions, build_hex_centroid_fan_indices(n_cells)


def tessellate_hex_opm_fan(
    corner_positions: Sequence[float],
) -> tuple[list[float], list[int], list[float]]:
    """Expand 8-corner cells to an OPM centroid-fan fill mesh.

    Each hex face becomes four triangles from the face-node average.  The
    four corners are duplicated per face so every vertex of that face can
    carry the same OPM normal — lighting then treats the logical quad as
    one facet instead of two diagonal folds.
    """
    if len(corner_positions) % 24:
        raise ValueError("hex positions length must be a multiple of 24")
    n_cells = len(corner_positions) // 24
    positions: list[float] = []
    indices: list[int] = []
    normals: list[float] = []
    for cell_index in range(n_cells):
        corner_base = cell_index * 8

        def corner(index: int) -> tuple[float, float, float]:
            offset = (corner_base + index) * 3
            return (
                float(corner_positions[offset]),
                float(corner_positions[offset + 1]),
                float(corner_positions[offset + 2]),
            )

        vert_base = cell_index * HEX_FILL_VERTS_PER_CELL
        for face_index, face in enumerate(VTK_HEX_FACES):
            a, b, c, d = (corner(index) for index in face)
            centroid = (
                (a[0] + b[0] + c[0] + d[0]) * 0.25,
                (a[1] + b[1] + c[1] + d[1]) * 0.25,
                (a[2] + b[2] + c[2] + d[2]) * 0.25,
            )
            normal = opm_quad_normal(a, b, c, d)
            face_vert = vert_base + face_index * HEX_FILL_VERTS_PER_FACE
            for point in (a, b, c, d, centroid):
                positions.extend(point)
                normals.extend(normal)
            midpoint = face_vert + 4
            indices.extend((
                midpoint, face_vert, face_vert + 1,
                midpoint, face_vert + 1, face_vert + 2,
                midpoint, face_vert + 2, face_vert + 3,
                midpoint, face_vert + 3, face_vert,
            ))
    return positions, indices, normals
