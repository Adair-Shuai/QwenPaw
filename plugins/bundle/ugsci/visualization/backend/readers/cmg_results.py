# -*- coding: utf-8 -*-
"""CMG SR3 spatial-property reader.

SR3 files are HDF5 containers. Field/well time series already live in the
simulator adapter; this module extracts grid properties (PRES, SOIL, SWAT,
SGAS, TEMP, ...) so the viewer can animate the same dynamic fields Eclipse
exposes through UNRST.

The on-disk layout has drifted across CMG versions. The reader therefore
walks a few known SpatialProperties trees and only keeps arrays whose length
matches the imported grid (active cells or the full IJK lattice).
"""

from __future__ import annotations

import logging
from array import array
from pathlib import Path
from typing import Any, Iterable

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.cmg_sr3")

_PROPERTY_ALIASES = {
    "PRES": "pressure",
    "PRESSURE": "pressure",
    "PRESGAS": "pressure",
    "SOIL": "soil",
    "OILSAT": "soil",
    "SO": "soil",
    "SWAT": "swat",
    "WATSAT": "swat",
    "SW": "swat",
    "SGAS": "sgas",
    "GASSAT": "sgas",
    "SG": "sgas",
    "TEMP": "temperature",
    "TEMPERATURE": "temperature",
    "TEMPC": "temperature",
}

_PREFERRED = {
    "PRES", "PRESSURE", "SOIL", "SWAT", "SGAS", "TEMP", "TEMPERATURE",
    "SO", "SW", "SG", "OILSAT", "WATSAT", "GASSAT",
}


def _write_f32(path: Path, values: array) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if values.typecode != "f":
        values = array("f", values)
    with path.open("wb") as handle:
        values.tofile(handle)


def _decode_name(value: Any) -> str:
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace").rstrip("\x00 ")
    return str(value).rstrip("\x00 ")


def _normalize_property(name: str) -> str:
    token = name.strip().split("/")[-1].upper()
    token = token.replace(" ", "").replace("-", "")
    return _PROPERTY_ALIASES.get(token, token.lower())


def _as_float_list(dataset: Any) -> list[float] | None:
    try:
        data = dataset[()]
    except Exception:
        try:
            data = dataset
        except Exception:
            return None
    try:
        flat = data.reshape(-1).tolist()
    except Exception:
        try:
            flat = list(data)
        except TypeError:
            return None
    values: list[float] = []
    for item in flat:
        try:
            number = float(item)
        except (TypeError, ValueError):
            return None
        values.append(0.0 if number != number else number)
    return values


def _select_steps(steps: list[Any], max_steps: int) -> list[Any]:
    if max_steps <= 0 or len(steps) <= max_steps:
        return list(steps)
    if max_steps == 1:
        return [steps[-1]]
    picked = [steps[0]]
    inner = max_steps - 2
    for index in range(1, inner + 1):
        picked.append(steps[index * (len(steps) - 1) // (inner + 1)])
    picked.append(steps[-1])
    unique: list[Any] = []
    seen: set[Any] = set()
    for item in picked:
        if item in seen:
            continue
        seen.add(item)
        unique.append(item)
    return unique


def _timestep_sort_key(name: str) -> tuple[int, str]:
    digits = "".join(character for character in name if character.isdigit())
    return (int(digits) if digits else 10**9, name)


def _looks_like_timestep(name: str) -> bool:
    stripped = name.strip()
    if not stripped:
        return False
    if stripped.isdigit():
        return True
    return stripped[:1].isdigit() and stripped.replace("_", "").isalnum()


def _gather_timestep_groups(spatial: Any) -> list[tuple[str, Any]]:
    """Return (label, group) pairs for the most common SR3 spatial layouts."""
    try:
        keys = list(spatial.keys())
    except Exception:
        return []

    timestep_keys = [key for key in keys if _looks_like_timestep(str(key))]
    if timestep_keys:
        groups: list[tuple[str, Any]] = []
        for key in sorted(timestep_keys, key=lambda item: _timestep_sort_key(str(item))):
            try:
                groups.append((str(key), spatial[key]))
            except Exception:
                continue
        return groups

    try:
        grid = spatial["GRID"]
    except Exception:
        grid = None
    if grid is not None:
        nested = _gather_timestep_groups(grid)
        if nested:
            return nested
    return []


def _datasets_in(group: Any) -> Iterable[tuple[str, Any]]:
    try:
        items = list(group.items())
    except Exception:
        return []
    found: list[tuple[str, Any]] = []
    for name, item in items:
        if hasattr(item, "shape") and not hasattr(item, "keys"):
            found.append((str(name), item))
        elif hasattr(item, "keys"):
            for nested_name, nested in _datasets_in(item):
                found.append((f"{name}/{nested_name}", nested))
    return found


def _active_values(values: list[float], active_ids: list[int], n_total: int) -> array | None:
    count = len(values)
    if count == len(active_ids):
        return array("f", (float(value) for value in values))
    if count == n_total:
        return array("f", (float(values[index]) for index in active_ids))
    return None


def attach_sr3_spatial_properties(
    sr3_path: Path,
    active_ids: list[int],
    n_total: int,
    prefix: str,
    bin_dir: Path,
    *,
    max_steps: int = 8,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Write dynamic scalar files and return UNRST-compatible time_steps."""
    try:
        h5py = __import__("h5py")
    except ImportError:
        return [], {"has_dynamic_results": False, "sr3_error": "h5py is not installed"}

    if not sr3_path.exists():
        return [], {"has_dynamic_results": False, "sr3_error": f"SR3 not found: {sr3_path}"}

    time_steps: list[dict[str, Any]] = []
    info: dict[str, Any] = {
        "has_dynamic_results": False,
        "sr3_path": sr3_path.name,
        "sr3_properties": [],
        "sr3_time_steps": 0,
    }

    try:
        with h5py.File(sr3_path, "r") as handle:
            spatial = None
            for candidate in ("SpatialProperties", "SPATIALPROPERTIES", "GridProperties"):
                if candidate in handle:
                    spatial = handle[candidate]
                    break
            if spatial is None:
                info["sr3_error"] = "SR3 has no SpatialProperties group"
                return [], info

            groups = _gather_timestep_groups(spatial)
            if groups:
                selected = _select_steps(groups, max_steps)
                for index, (label, group) in enumerate(selected):
                    scalars: dict[str, str] = {}
                    for raw_name, dataset in _datasets_in(group):
                        alias = _normalize_property(raw_name)
                        if alias in scalars:
                            continue
                        preferred = raw_name.split("/")[-1].upper().replace(" ", "")
                        if preferred not in _PREFERRED and alias not in set(_PROPERTY_ALIASES.values()):
                            if len(scalars) >= 4:
                                continue
                        values = _as_float_list(dataset)
                        if not values:
                            continue
                        active = _active_values(values, active_ids, n_total)
                        if active is None:
                            continue
                        filename = f"{prefix}_scalars_{alias}_ts{index}.f32"
                        _write_f32(bin_dir / filename, active)
                        scalars[alias] = filename
                    if not scalars:
                        continue
                    digits = "".join(character for character in label if character.isdigit())
                    time_steps.append({
                        "index": len(time_steps),
                        "step_number": int(digits) if digits else index,
                        "label": label,
                        "scalars": scalars,
                    })
            elif "Data" in spatial and "Variables" in spatial:
                variables = [_decode_name(item) for item in spatial["Variables"][:]]
                data = spatial["Data"]
                shape = getattr(data, "shape", ())
                step_count = int(shape[0]) if shape else 0
                selected_indices = _select_steps(list(range(step_count)), max_steps)
                for index, step in enumerate(selected_indices):
                    scalars = {}
                    for variable_index, raw_name in enumerate(variables):
                        alias = _normalize_property(raw_name)
                        try:
                            column = data[step, variable_index]
                        except Exception:
                            continue
                        values = _as_float_list(column)
                        if not values:
                            continue
                        active = _active_values(values, active_ids, n_total)
                        if active is None:
                            continue
                        filename = f"{prefix}_scalars_{alias}_ts{index}.f32"
                        _write_f32(bin_dir / filename, active)
                        scalars[alias] = filename
                    if scalars:
                        time_steps.append({
                            "index": len(time_steps),
                            "step_number": int(step),
                            "scalars": scalars,
                        })
    except (OSError, KeyError, TypeError, ValueError) as exc:
        logger.warning("Failed to read CMG SR3 spatial properties from %s: %s", sr3_path, exc)
        info["sr3_error"] = str(exc)
        return [], info

    properties = sorted({
        name for step in time_steps for name in step.get("scalars", {})
    })
    info.update({
        "has_dynamic_results": bool(time_steps),
        "sr3_properties": properties,
        "sr3_time_steps": len(time_steps),
    })
    return time_steps, info
