# -*- coding: utf-8 -*-
"""Dataset selection and resource contracts shared by every domain.

These operations keep the existing manifest and binary schema. They do not
choose a storage root or depend on HTTP, import workers, or viewer commands.
"""

from __future__ import annotations


class TimeStepNotFound(LookupError):
    """The requested viewer time step is absent from this dataset."""


def dataset_scalar_files(ds: dict, time_step: int = 0) -> dict[str, str]:
    """Match viewer selection: zero is static, positive values are index + 1.

    A known step can omit static-only properties; those keep their static
    values. An unknown step must never silently export the wrong snapshot.
    """
    scalars = dict((ds.get("files") or {}).get("scalars") or {})
    if time_step == 0:
        return scalars
    selected = next(
        (
            step
            for step in ds.get("time_steps") or []
            if step.get("index") == time_step - 1
        ),
        None,
    )
    if selected is None:
        raise TimeStepNotFound(f"Time step not found: {time_step}")
    scalars.update(selected.get("scalars") or {})
    return scalars


def property_association(ds: dict, property_name: str = "") -> str:
    descriptor = (ds.get("properties") or {}).get(property_name) or {}
    if isinstance(descriptor, dict) and descriptor.get("association") in (
        "point",
        "cell",
    ):
        return descriptor["association"]
    association = (ds.get("metadata") or {}).get("scalar_association")
    if association in ("point", "cell"):
        return association
    # The old LAS/DLIS resource contract omitted its point association.
    return (
        "point" if ds.get("source") in ("las", "dlis", "wellbore") else "cell"
    )


def build_resource_descriptors(ds: dict, resource_store) -> list[dict]:
    """Build ResourceDescriptor list for a dataset."""
    descriptors = []
    files = ds.get("files", {})

    if files.get("positions"):
        descriptors.append(
            resource_store.describe(
                files["positions"],
                "positions",
                "float32",
                [ds.get("n_vertices", 0) * 3],
            ),
        )
    if files.get("indices"):
        descriptors.append(
            resource_store.describe(
                files["indices"],
                "indices",
                "uint32",
                [ds.get("n_indices", 0)],
            ),
        )
    if files.get("cell_ids"):
        descriptors.append(
            resource_store.describe(
                files["cell_ids"],
                "cell-ids",
                "uint32",
                [ds.get("n_cells", 0)],
            ),
        )
    for prop_name, fname in files.get("scalars", {}).items():
        dtype = "float32" if fname.endswith(".f32") else "uint32"
        association = property_association(ds, prop_name)
        descriptor = resource_store.describe(
            fname,
            "property",
            dtype,
            [ds.get("n_vertices" if association == "point" else "n_cells", 0)],
            prop_name,
        )
        descriptor["association"] = association
        descriptor["propertyName"] = prop_name
        descriptors.append(descriptor)

    for step in ds.get("time_steps") or []:
        for prop_name, fname in (step.get("scalars") or {}).items():
            association = property_association(ds, prop_name)
            descriptor = resource_store.describe(
                fname,
                "property",
                "float32" if fname.endswith(".f32") else "uint32",
                [
                    ds.get(
                        "n_vertices" if association == "point" else "n_cells",
                        0,
                    ),
                ],
                prop_name,
            )
            descriptor.update(
                association=association,
                propertyName=prop_name,
                timeStep=int(step["index"]) + 1,
            )
            descriptors.append(descriptor)

    return descriptors


def dataset_resource_files(ds: dict) -> dict[str, str]:
    """Map resource_id → filename for a dataset."""
    result = {}
    files = ds.get("files", {})
    for key in ("positions", "indices", "cell_ids"):
        if files.get(key):
            result[files[key]] = files[key]
    for fname in files.get("scalars", {}).values():
        result[fname] = fname
    for step in ds.get("time_steps") or []:
        for fname in (step.get("scalars") or {}).values():
            result[fname] = fname
    return result
