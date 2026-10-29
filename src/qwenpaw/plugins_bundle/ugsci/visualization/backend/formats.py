# -*- coding: utf-8 -*-
"""Oil & Gas format providers registered with the shared UGSci core.

The readers and geometry writers are UGSci providers. Format detection,
companion resolution and the conversion entry point are owned by
``ugsci.file_artifacts`` so the Viewer is not the only consumer.
"""

from __future__ import annotations

import json
import math
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
    except ImportError as exc:
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
                raise ImportError(
                    "UGSci file_artifacts package unavailable",
                ) from exc
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


# pylint: disable-next=R0912,R0915
def _json_to_dataset(request):
    from .converters.network import convert_network_to_lines
    from .converters.surface import convert_regular_surface
    from .converters.wellbore import convert_well_trajectory
    from .converters.geometry import finite_number

    payload = json.loads(request.source.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("可视化 JSON 顶层必须是对象")
    object_type = str(payload.get("type", "")).lower()
    if object_type == "featurecollection":

        def lines(geometry):
            if not isinstance(geometry, dict):
                return
            if geometry.get("type") == "GeometryCollection":
                for child in geometry.get("geometries") or []:
                    yield from lines(child)
            elif geometry.get("type") == "MultiLineString":
                yield from geometry.get("coordinates") or []
            elif geometry.get("type") == "LineString":
                yield geometry.get("coordinates") or []

        coordinates = payload.get("coordinate_system") or {}
        crs = coordinates.get("crs") or payload.get("crs")
        crs_name = str(crs)
        source_up = coordinates.get("z_positive", "up") == "up"
        prepared = []
        for feature in payload.get("features") or []:
            if not isinstance(feature, dict):
                continue
            for line in lines(feature.get("geometry")):
                if len(line) < 2 or any(
                    not isinstance(point, (list, tuple)) or len(point) < 2
                    for point in line
                ):
                    raise ValueError("GeoJSON 轨迹至少需要两个有效坐标点")
                x = [finite_number(point[0], "GeoJSON X") for point in line]
                y = [finite_number(point[1], "GeoJSON Y") for point in line]
                z = [
                    (
                        finite_number(point[2], "GeoJSON Z")
                        if len(point) > 2
                        else 0.0
                    )
                    for point in line
                ]
                if (
                    "4326" in crs_name
                    or "CRS84" in crs_name.upper()
                    or (
                        not crs
                        and all(
                            abs(east) <= 180 and abs(north) <= 90
                            for east, north in zip(x, y)
                        )
                    )
                ):
                    raise ValueError(
                        "GeoJSON 经纬度不能直接作为米制井轨迹；请先投影到工程坐标系，并声"
                        "明 coordinate_system.crs",
                    )
                tvd = [-value if source_up else value for value in z]
                md = [0.0]
                for index in range(1, len(line)):
                    distance = math.dist(
                        [x[index], y[index], tvd[index]],
                        [x[index - 1], y[index - 1], tvd[index - 1]],
                    )
                    if distance == 0:
                        raise ValueError("GeoJSON 轨迹含相邻重复测点")
                    md.append(md[-1] + distance)
                feature_properties = feature.get("properties") or {}
                label = str(
                    feature_properties.get("name")
                    or feature.get("id")
                    or request.name,
                )
                prepared.append((md, tvd, x, y, label))
        if not prepared:
            raise ValueError(
                "GeoJSON FeatureCollection contains no well "
                "trajectory LineString",
            )
        datasets = []
        for index, (md, tvd, x, y, label) in enumerate(prepared):
            name = (
                request.name if index == 0 else f"{request.name}_{index + 1}"
            )
            dataset = convert_well_trajectory(
                md,
                tvd,
                x,
                y,
                name,
                request.output_dir,
            )
            dataset["name"] = f"井轨迹：{label}（{len(md)} 个测点）"
            dataset["metadata"]["well_name"] = label
            dataset["metadata"]["coordinate_system"].update(
                {
                    "source_z_positive": "up" if source_up else "down",
                    "crs": crs_name if crs else None,
                },
            )
            datasets.append(dataset)
        primary = datasets[0]
        if len(datasets) > 1:
            primary["related_datasets"] = datasets[1:]
        return primary

    if object_type in {"surface", "horizon", "fault"}:
        return convert_regular_surface(
            payload["x"],
            payload["y"],
            payload["z"],
            request.name,
            request.output_dir,
        )
    if object_type in {"well", "wellbore", "trajectory"}:
        points = payload.get("points", payload)
        return convert_well_trajectory(
            points["md"],
            points["tvd"],
            points["x"],
            points["y"],
            request.name,
            request.output_dir,
        )
    if object_type in {"network", "pipeline", "pipe"}:
        return convert_network_to_lines(
            payload["segments"],
            request.name,
            request.output_dir,
        )
    raise ValueError(
        "Unsupported JSON oilfield object; expected type "
        "surface, well, or network",
    )


def build_registry():
    """Build the oil/gas provider registry for one import job."""
    (
        _,
        ConversionHandler,
        FileConversionRegistry,
        find_companion,
    ) = _request_types()
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
            str(request.source),
            request.name,
            request.output_dir,
            options=dict(request.options),
        )

    def roff(request):
        prop_path = request.options.get("property_path")
        properties = {"porosity": str(prop_path)} if prop_path else {}
        return convert_grid_to_binary(
            str(request.source),
            properties,
            request.name,
            request.output_dir,
        )

    def eclipse_grid(request):
        init_path = find_companion(
            request.source,
            request.companions,
            {".init"},
        )
        unrst_path = find_companion(
            request.source,
            request.companions,
            {".unrst"},
        )
        return EclipseReader().read(
            str(request.source),
            request.name,
            request.output_dir,
            options={
                "init_path": str(init_path) if init_path else None,
                "unrst_path": str(unrst_path) if unrst_path else None,
            },
        )

    def tnav(request):
        grid = find_companion(
            request.source,
            request.companions,
            {".egrid", ".grid", ".grdecl"},
        )
        init_path = find_companion(
            request.source,
            request.companions,
            {".init"},
        )
        unrst_path = find_companion(
            request.source,
            request.companions,
            {".unrst"},
        )
        return TNavigatorReader().read(
            str(request.source),
            request.name,
            request.output_dir,
            options={
                "grid_path": str(grid) if grid else None,
                "init_path": str(init_path) if init_path else None,
                "unrst_path": str(unrst_path) if unrst_path else None,
            },
        )

    def result_file(request):
        grid = find_companion(
            request.source,
            request.companions,
            {".egrid", ".grid", ".grdecl"},
        )
        if grid is None:
            raise ValueError(
                "INIT/UNRST import requires an EGRID/GRID/GRDECL companion",
            )
        options = {
            "init_path": (
                str(request.source)
                if request.source.suffix.lower() == ".init"
                else None
            ),
            "unrst_path": (
                str(request.source)
                if request.source.suffix.lower() == ".unrst"
                else None
            ),
        }
        return EclipseReader().read(
            str(grid),
            request.name,
            request.output_dir,
            options=options,
        )

    def cmg(request):
        sr3_path = find_companion(request.source, request.companions, {".sr3"})
        options = dict(request.options)
        if sr3_path:
            options["sr3_path"] = str(sr3_path)
        return CmgReader().read(
            str(request.source),
            request.name,
            request.output_dir,
            options=options,
        )

    def cmg_results(request):
        dat = find_companion(request.source, request.companions, {".dat"})
        if dat is None:
            raise ValueError(
                "SR3 import requires a same-stem CMG DAT companion",
            )
        return CmgReader().read(
            str(dat),
            request.name,
            request.output_dir,
            options={"sr3_path": str(request.source), **dict(request.options)},
        )

    return FileConversionRegistry(
        [
            ConversionHandler(
                "roff",
                (".roff", ".roffbin"),
                roff,
                (".egrid", ".grid", ".grdecl"),
            ),
            ConversionHandler(
                "eclipse",
                (".egrid", ".grid", ".grdecl"),
                eclipse_grid,
            ),
            ConversionHandler(
                "tnavigator",
                (".data", ".model", ".tnav", ".tpr"),
                tnav,
            ),
            ConversionHandler(
                "eclipse-results",
                (".init", ".unrst"),
                result_file,
                (".egrid", ".grid", ".grdecl"),
            ),
            ConversionHandler("cmg", (".dat",), cmg, (".sr3", ".irf")),
            ConversionHandler(
                "cmg-results",
                (".sr3",),
                cmg_results,
                (".dat",),
            ),
            ConversionHandler("las", (".las", ".las3"), reader(LasReader())),
            ConversionHandler("dlis", (".dlis",), reader(DlisReader())),
            ConversionHandler(
                "vtk",
                (".vtk", ".vtu", ".pvtu", ".vti", ".xdmf"),
                reader(VtkReader()),
            ),
            ConversionHandler(
                "tabular-network",
                (".csv", ".arrow", ".parquet"),
                reader(TabularNetworkReader()),
            ),
            ConversionHandler("json-oilfield", (".json",), _json_to_dataset),
        ],
    )


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
