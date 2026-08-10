# -*- coding: utf-8 -*-
"""Oil & Gas format providers registered with the shared UGSci core.

The readers and geometry writers are UGSci providers. Format detection,
companion resolution and the conversion entry point are owned by
``ugsci.file_artifacts`` so the Viewer is not the only consumer.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

def _request_types():
    """Compatibility tuple retained for the migrated JobManager tests."""
    try:
        from ...file_artifacts import (
            ArtifactConversionRequest,
            ConversionHandler,
            FileConversionRegistry,
            find_companion,
        )
    except ImportError:
        # The visualization package is also loaded directly by its focused
        # contract tests.  Resolve the same shared UGSci package explicitly
        # without reintroducing a dependency on the deleted plugin.
        import importlib.util
        import sys

        package_dir = Path(__file__).resolve().parents[2] / "file_artifacts"
        module_name = "_ugsci_file_artifacts_test"
        module = sys.modules.get(module_name)
        if module is None:
            spec = importlib.util.spec_from_file_location(
                module_name,
                package_dir / "__init__.py",
                submodule_search_locations=[str(package_dir)],
            )
            if spec is None or spec.loader is None:
                raise ImportError("UGSci file_artifacts package unavailable")
            module = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = module
            spec.loader.exec_module(module)
        ArtifactConversionRequest = module.ArtifactConversionRequest
        ConversionHandler = module.ConversionHandler
        FileConversionRegistry = module.FileConversionRegistry
        find_companion = module.find_companion
    return (
        ArtifactConversionRequest,
        ConversionHandler,
        FileConversionRegistry,
        find_companion,
    )


def _json_to_dataset(request):
    from .converters.network import convert_network_to_lines
    from .converters.surface import convert_regular_surface
    from .converters.wellbore import convert_well_trajectory

    payload = json.loads(request.source.read_text(encoding="utf-8"))
    object_type = str(payload.get("type", "")).lower()
    if object_type == "featurecollection":
        line = None
        for feature in payload.get("features", []):
            geometry = feature.get("geometry", {}) if isinstance(feature, dict) else {}
            geometries = (
                geometry.get("geometries", [])
                if geometry.get("type") == "GeometryCollection"
                else [geometry]
            )
            for item in geometries:
                if item.get("type") == "LineString" and item.get("coordinates"):
                    line = item["coordinates"]
                    break
            if line:
                break
        if not line or len(line) < 2:
            raise ValueError("GeoJSON FeatureCollection contains no well trajectory LineString")
        x = [float(point[0]) for point in line]
        y = [float(point[1]) for point in line]
        z = [float(point[2]) if len(point) > 2 else 0.0 for point in line]
        tvd = [abs(value) for value in z]
        md = [0.0]
        for index in range(1, len(line)):
            dx = x[index] - x[index - 1]
            dy = y[index] - y[index - 1]
            dz = tvd[index] - tvd[index - 1]
            md.append(md[-1] + (dx * dx + dy * dy + dz * dz) ** 0.5)
        return convert_well_trajectory(md, tvd, x, y, request.name, request.output_dir)

    if object_type in {"surface", "horizon", "fault"}:
        return convert_regular_surface(
            payload["x"], payload["y"], payload["z"], request.name, request.output_dir,
        )
    if object_type in {"well", "wellbore", "trajectory"}:
        points = payload.get("points", payload)
        return convert_well_trajectory(
            points["md"], points["tvd"], points["x"], points["y"],
            request.name, request.output_dir,
        )
    if object_type in {"network", "pipeline", "pipe"}:
        return convert_network_to_lines(
            payload["segments"], request.name, request.output_dir,
        )
    raise ValueError(
        "Unsupported JSON oilfield object; expected type surface, well, or network",
    )


def build_registry():
    """Build the oil/gas provider registry for one import job."""
    _, ConversionHandler, FileConversionRegistry, find_companion = _request_types()
    from .readers.cmg import CmgReader
    from .readers.dlis import DlisReader
    from .readers.eclipse import EclipseReader
    from .readers.las import LasReader
    from .readers.roff import convert_grid_to_binary
    from .readers.tabular_network import TabularNetworkReader
    from .readers.tnavigator import TNavigatorReader
    from .readers.vtk import VtkReader

    def reader(reader_instance):
        return lambda request: reader_instance.read(
            str(request.source), request.name, request.output_dir,
            options=dict(request.options),
        )

    def roff(request):
        prop_path = request.options.get("property_path")
        properties = {"porosity": str(prop_path)} if prop_path else {}
        return convert_grid_to_binary(
            str(request.source), properties, request.name, request.output_dir,
        )

    def eclipse_grid(request):
        init_path = find_companion(request.source, request.companions, {".init"})
        unrst_path = find_companion(request.source, request.companions, {".unrst"})
        return EclipseReader().read(
            str(request.source), request.name, request.output_dir,
            options={
                "init_path": str(init_path) if init_path else None,
                "unrst_path": str(unrst_path) if unrst_path else None,
            },
        )

    def tnav(request):
        grid = find_companion(request.source, request.companions, {".egrid", ".grid", ".grdecl"})
        init_path = find_companion(request.source, request.companions, {".init"})
        unrst_path = find_companion(request.source, request.companions, {".unrst"})
        return TNavigatorReader().read(
            str(request.source), request.name, request.output_dir,
            options={
                "grid_path": str(grid) if grid else None,
                "init_path": str(init_path) if init_path else None,
                "unrst_path": str(unrst_path) if unrst_path else None,
            },
        )

    def result_file(request):
        grid = find_companion(request.source, request.companions, {".egrid", ".grid", ".grdecl"})
        if grid is None:
            raise ValueError("INIT/UNRST import requires an EGRID/GRID/GRDECL companion")
        options = {
            "init_path": str(request.source) if request.source.suffix.lower() == ".init" else None,
            "unrst_path": str(request.source) if request.source.suffix.lower() == ".unrst" else None,
        }
        return EclipseReader().read(str(grid), request.name, request.output_dir, options=options)

    return FileConversionRegistry([
        ConversionHandler("roff", (".roff", ".roffbin"), roff, (".egrid", ".grid", ".grdecl")),
        ConversionHandler("eclipse", (".egrid", ".grid", ".grdecl"), eclipse_grid),
        ConversionHandler("tnavigator", (".data", ".model", ".tnav", ".tpr"), tnav),
        ConversionHandler("eclipse-results", (".init", ".unrst"), result_file, (".egrid", ".grid", ".grdecl")),
        ConversionHandler("cmg", (".dat",), reader(CmgReader())),
        ConversionHandler("las", (".las", ".las3"), reader(LasReader())),
        ConversionHandler("dlis", (".dlis",), reader(DlisReader())),
        ConversionHandler("vtk", (".vtk", ".vtu", ".pvtu", ".vti", ".xdmf"), reader(VtkReader())),
        ConversionHandler("tabular-network", (".csv", ".arrow", ".parquet"), reader(TabularNetworkReader())),
        ConversionHandler("json-oilfield", (".json",), _json_to_dataset),
    ])


def convert_source(
    source: Path,
    name: str,
    output_dir: Path,
    *,
    companions: list[Path] | None = None,
    options: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Convert a source file using the common UGSci routing contract."""
    ArtifactConversionRequest, _, _, _ = _request_types()
    request = ArtifactConversionRequest(
        source=source,
        name=name,
        output_dir=output_dir,
        companions=tuple(companions or ()),
        options=options or {},
    )
    return build_registry().convert(request)
