# -*- coding: utf-8 -*-
"""Bounded form definitions and strict, shared server-side value validation."""

from __future__ import annotations

import math
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class Option(StrictModel):
    label: str = Field(min_length=1, max_length=200)
    value: str = Field(min_length=1, max_length=200)


class InputField(StrictModel):
    name: str = Field(pattern=r"^[A-Za-z][A-Za-z0-9_]{0,63}$")
    label: str = Field(min_length=1, max_length=200)
    type: Literal[
        "string",
        "number",
        "integer",
        "boolean",
        "select",
        "multiselect",
    ]
    required: bool = False
    default: Any = None
    unit: str = Field(default="", max_length=80)
    description: str = Field(default="", max_length=2000)
    options: list[Option] = Field(default_factory=list, max_length=100)
    minimum: float | None = Field(default=None, allow_inf_nan=False)
    maximum: float | None = Field(default=None, allow_inf_nan=False)

    @model_validator(mode="after")
    def valid_definition(self):
        if not self.label.strip():
            raise ValueError("Field label cannot be blank")
        choice = self.type in {"select", "multiselect"}
        if choice != bool(self.options):
            raise ValueError("Only selection fields require options")
        if len({option.value for option in self.options}) != len(self.options):
            raise ValueError("Option values must be unique")
        if self.type not in {"number", "integer"} and (
            self.minimum is not None or self.maximum is not None
        ):
            raise ValueError("Only numeric fields accept minimum/maximum")
        if (
            self.minimum is not None
            and self.maximum is not None
            and self.minimum > self.maximum
        ):
            raise ValueError("minimum cannot exceed maximum")
        if "default" in self.model_fields_set:
            validate_value(self, self.default)
        return self


class Preview(StrictModel):
    label: str = Field(min_length=1, max_length=200)
    value: str = Field(max_length=4000)


class RequestDefinition(StrictModel):
    kind: Literal["clarify", "confirm", "form"]
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=4000)
    fields: list[InputField] = Field(min_length=1, max_length=32)
    preview: list[Preview] = Field(default_factory=list, max_length=20)

    @model_validator(mode="after")
    def unique_fields(self):
        if not self.title.strip():
            raise ValueError("Title cannot be blank")
        if len({field.name for field in self.fields}) != len(self.fields):
            raise ValueError("Field names must be unique")
        return self


class SessionBody(StrictModel):
    session_id: str = Field(min_length=1, max_length=512)


class RevisionBody(SessionBody):
    expected_revision: int = Field(ge=1)


class ValuesBody(RevisionBody):
    values: dict[str, Any]


def validate_value(field: InputField, value: Any) -> Any:
    """Reject coercion (especially bool -> number), unknown options and NaN."""
    if value is None:
        return None
    kind = field.type
    valid = False
    if kind == "string":
        valid = isinstance(value, str) and len(value) <= 8000
    elif kind in {"number", "integer"}:
        try:
            valid = type(value) in {int, float} and math.isfinite(value)
        except OverflowError:
            valid = False
        if valid and kind == "integer":
            valid = int(value) == value
        if valid and field.minimum is not None:
            valid = value >= field.minimum
        if valid and field.maximum is not None:
            valid = value <= field.maximum
    elif kind == "boolean":
        valid = type(value) is bool
    elif kind == "select":
        valid = isinstance(value, str) and value in {
            option.value for option in field.options
        }
    elif kind == "multiselect":
        valid = (
            isinstance(value, list)
            and len(value) <= len(field.options)
            and all(isinstance(item, str) for item in value)
            and len(set(value)) == len(value)
            and set(value).issubset({option.value for option in field.options})
        )
    if not valid:
        raise ValueError(f"Invalid value for field '{field.name}'")
    return value


def validate_values(
    definition: RequestDefinition,
    values: dict[str, Any],
    *,
    complete: bool,
) -> dict[str, Any]:
    fields = {field.name: field for field in definition.fields}
    if not isinstance(values, dict) or set(values) - set(fields):
        raise ValueError("Values contain unknown fields")
    result = {}
    for name, value in values.items():
        # A cleared control stays editable in a draft. Null denotes absence
        # and is never returned as an input value; explicit default:null is
        # likewise treated as no default by the service.
        if value is None:
            continue
        if value == "":
            if not complete:
                result[name] = ""
            continue
        result[name] = validate_value(fields[name], value)
    if complete:
        for name, field in fields.items():
            value = result.get(name)
            missing = (
                value is None
                or isinstance(value, str)
                and not value.strip()
                or value == []
            )
            if field.required and missing:
                raise ValueError(f"Field '{name}' is required")
    return result
