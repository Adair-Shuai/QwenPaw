# -*- coding: utf-8 -*-
"""Operation Descriptor contract helpers.

Operation metadata is intentionally JSON first so domain plugins do not need
to import Run Center runtime classes.  Older plugins only publish a title and
some execution flags; :func:`normalize_operation_descriptor` supplies the
stable contract envelope at the Run Center boundary without mutating the
plugin-owned descriptor.
"""

from __future__ import annotations

import copy
from typing import Any


DESCRIPTOR_CONTRACT_VERSION = "1.0"


def _object_schema() -> dict[str, Any]:
    return {"type": "object", "additionalProperties": True}


def normalize_operation_descriptor(
    descriptor: dict[str, Any] | None,
    *,
    operation: str | None = None,
) -> dict[str, Any]:
    """Return a stable, JSON-safe Operation Descriptor envelope.

    The function is deliberately additive.  Existing provider-specific keys
    remain untouched, while missing contract keys receive conservative
    defaults.  This lets Run Center consume descriptors from older UGSci
    versions and from third-party plugins during a rolling upgrade.
    """

    if descriptor is None:
        descriptor = {}
    if not isinstance(descriptor, dict):
        raise ValueError("descriptor must be a dictionary")
    value = copy.deepcopy(descriptor)

    value.setdefault("descriptor_contract_version", DESCRIPTOR_CONTRACT_VERSION)
    if operation and not value.get("operation"):
        value["operation"] = str(operation)

    input_schema = value.get("input_schema")
    if not isinstance(input_schema, dict):
        input_schema = _object_schema()
    value["input_schema"] = input_schema

    output_schema = value.get("output_schema")
    if not isinstance(output_schema, dict):
        output_schema = _object_schema()
    value["output_schema"] = output_schema

    units = value.get("units")
    if not isinstance(units, dict):
        units = {}
    units.setdefault("system", value.get("unit_system") or "SI")
    units.setdefault("inputs", {})
    units.setdefault("outputs", {})
    units.setdefault("required", [])
    value["units"] = units

    resources = value.get("resources")
    if not isinstance(resources, dict):
        resources = {}
    resources.setdefault("pool", "local")
    resources.setdefault("cpu", 1)
    resources.setdefault("memory_bytes", None)
    resources.setdefault("gpu", 0)
    resources.setdefault("disk_bytes", None)
    resources.setdefault("licenses", [])
    value["resources"] = resources

    risk = value.get("risk")
    if not isinstance(risk, dict):
        risk = {}
    risk.setdefault("level", value.get("risk_level") or "medium")
    risk.setdefault("requires_review", False)
    risk.setdefault("reasons", [])
    risk.setdefault("data_sensitivity", "internal")
    value["risk"] = risk

    estimate = value.get("estimate")
    if not isinstance(estimate, dict):
        estimate = {}
    estimate.setdefault("duration_seconds", None)
    estimate.setdefault("cpu_seconds", None)
    estimate.setdefault("memory_bytes", resources.get("memory_bytes"))
    estimate.setdefault("confidence", None)
    estimate.setdefault("method", "provider")
    value["estimate"] = estimate

    # Keep legacy top-level booleans as the canonical capability flags.  Do
    # not coerce arbitrary truthy values: malformed metadata should be visible
    # to a provider rather than silently changing scheduling semantics.
    value["supports_pause"] = (
        value["supports_pause"] if isinstance(value.get("supports_pause"), bool) else False
    )
    value["supports_cancel"] = (
        value["supports_cancel"] if isinstance(value.get("supports_cancel"), bool) else True
    )
    value["supports_resume"] = (
        value["supports_resume"]
        if isinstance(value.get("supports_resume"), bool)
        else True
    )
    value["deterministic"] = (
        value["deterministic"] if isinstance(value.get("deterministic"), bool) else False
    )
    value.setdefault("execution_class", "in_process")
    value.setdefault("dependencies", [])
    value.setdefault("required_providers", [])
    return value


def validate_json_schema(value: Any, schema: dict[str, Any]) -> list[str]:
    """Validate the small JSON-Schema subset used for operation inputs.

    This intentionally covers object/array/scalar types, required fields,
    properties, enum and numeric/string bounds.  Providers remain free to
    perform richer domain validation in their execution adapter.
    """

    errors: list[str] = []
    if not isinstance(schema, dict):
        return errors
    expected = schema.get("type")
    type_ok = {
        "object": isinstance(value, dict),
        "array": isinstance(value, list),
        "string": isinstance(value, str),
        "boolean": isinstance(value, bool),
        "integer": isinstance(value, int) and not isinstance(value, bool),
        "number": isinstance(value, (int, float)) and not isinstance(value, bool),
        "null": value is None,
    }
    if isinstance(expected, str) and expected in type_ok and not type_ok[expected]:
        return [f"value must be {expected}"]
    if "enum" in schema and value not in schema.get("enum", []):
        errors.append("value is not one of the allowed enum values")
    if isinstance(value, dict):
        required = schema.get("required") or []
        if isinstance(required, list):
            for key in required:
                if isinstance(key, str) and key not in value:
                    errors.append(f"missing required field: {key}")
        properties = schema.get("properties") or {}
        if isinstance(properties, dict):
            for key, child_schema in properties.items():
                if key in value and isinstance(child_schema, dict):
                    errors.extend(
                        f"{key}.{item}" if item != "value" else key
                        for item in validate_json_schema(value[key], child_schema)
                    )
    elif isinstance(value, list):
        item_schema = schema.get("items")
        if isinstance(item_schema, dict):
            for index, item in enumerate(value):
                errors.extend(
                    f"[{index}].{error}" if error != "value" else f"[{index}]"
                    for error in validate_json_schema(item, item_schema)
                )
    elif isinstance(value, str):
        minimum = schema.get("minLength")
        maximum = schema.get("maxLength")
        if isinstance(minimum, int) and len(value) < minimum:
            errors.append(f"string length must be >= {minimum}")
        if isinstance(maximum, int) and len(value) > maximum:
            errors.append(f"string length must be <= {maximum}")
    elif isinstance(value, (int, float)) and not isinstance(value, bool):
        minimum = schema.get("minimum")
        maximum = schema.get("maximum")
        if isinstance(minimum, (int, float)) and value < minimum:
            errors.append(f"value must be >= {minimum}")
        if isinstance(maximum, (int, float)) and value > maximum:
            errors.append(f"value must be <= {maximum}")
    return errors


__all__ = [
    "DESCRIPTOR_CONTRACT_VERSION",
    "normalize_operation_descriptor",
    "validate_json_schema",
]
