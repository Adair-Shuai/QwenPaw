# -*- coding: utf-8 -*-
"""Strict JSON output contracts shared by validation and model execution."""

from __future__ import annotations

import copy
import json
import math
from typing import Any

from jsonschema import Draft202012Validator, SchemaError
from jsonschema.validators import validator_for
from referencing import Registry, Resource
from referencing.exceptions import NoSuchResource, Unresolvable
from referencing.jsonschema import DRAFT202012, UnknownDialect

from ...io import IO


def _pointer(path) -> str:
    return "".join(
        "/" + str(part).replace("~", "~0").replace("/", "~1") for part in path
    )


class StructuredOutputError(ValueError):
    """An actionable field error without copying the model's response."""

    def __init__(self, code: str, field: str, message: str, **location):
        super().__init__(f"{field}: {message}")
        self.diagnostic = {
            "code": code,
            "field": field,
            "message": message,
            **location,
        }


def _schema_error(message: str, path=()) -> StructuredOutputError:
    pointer = _pointer(path)
    return StructuredOutputError(
        "LLM_OUTPUT_SCHEMA_INVALID",
        "inputs.output_schema" + pointer,
        message,
        schema_path=pointer,
    )


def _schema_locations(value, path=()):
    yield id(value), path
    if isinstance(value, dict):
        for key, child in value.items():
            yield from _schema_locations(child, (*path, key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from _schema_locations(child, (*path, index))


def _unavailable_resource(uri: str):
    raise NoSuchResource(ref=uri)


def prepare_output_schema(value: Any):
    """Compile a schema and resolve local references without network access."""
    # pylint: disable=too-many-branches
    if not isinstance(value, dict):
        raise _schema_error("expected a JSON Schema object")
    schema = copy.deepcopy(value)
    try:
        json.dumps(schema, ensure_ascii=False, allow_nan=False)
    except (TypeError, ValueError) as exc:
        raise _schema_error("schema must contain finite JSON values") from exc
    dialect = schema.get("$schema")
    if dialect is not None and not isinstance(dialect, str):
        raise _schema_error("dialect must be a URI string", ("$schema",))
    validator_class = (
        validator_for(schema, default=None)
        if dialect is not None
        else Draft202012Validator
    )
    if validator_class is None:
        raise _schema_error("unsupported JSON Schema dialect", ("$schema",))
    try:
        validator_class.check_schema(schema)
    except SchemaError as exc:
        raise _schema_error(
            "invalid JSON Schema definition",
            exc.absolute_path,
        ) from exc

    try:
        resource = Resource.from_contents(
            schema,
            default_specification=DRAFT202012,
        )
        registry = (
            Registry(retrieve=_unavailable_resource)
            .with_resource(
                resource.id() or "",
                resource,
            )
            .crawl()
        )
    except UnknownDialect as exc:
        raise _schema_error(
            "unsupported embedded JSON Schema dialect",
        ) from exc
    locations = dict(_schema_locations(schema))
    stack = [(resource, registry.resolver())]
    while stack:
        current, resolver = stack.pop()
        resolver = resolver.in_subresource(current)
        definition = current.contents
        if isinstance(definition, dict):
            location = locations.get(id(definition), ())
            if "$schema" in definition:
                dialect_class = validator_for(definition, default=None)
                if dialect_class is None:
                    raise _schema_error(
                        "unsupported JSON Schema dialect",
                        (*location, "$schema"),
                    )
                try:
                    dialect_class.check_schema(definition)
                except SchemaError as exc:
                    raise _schema_error(
                        "invalid JSON Schema definition",
                        (*location, *exc.absolute_path),
                    ) from exc
            for keyword in ("$ref", "$dynamicRef", "$recursiveRef"):
                reference = definition.get(keyword)
                if reference is None:
                    continue
                path = (*location, keyword)
                if not isinstance(reference, str) or (
                    reference and not reference.startswith("#")
                ):
                    raise _schema_error(
                        "only local references are supported",
                        path,
                    )
                try:
                    resolver.lookup(reference)
                except Unresolvable as exc:
                    raise _schema_error(
                        "local reference does not resolve",
                        path,
                    ) from exc
        stack.extend((child, resolver) for child in current.subresources())
    return validator_class(
        schema,
        registry=registry,
        format_checker=validator_class.FORMAT_CHECKER,
    )


class OutputSchemaInput(IO.Object.Input):
    """Validate schemas through existing document and input diagnostics."""

    def validate(self, value: Any) -> tuple[bool, str | None]:
        if value is None and self.optional:
            return True, None
        try:
            prepare_output_schema(value)
        except (ValueError, TypeError) as exc:
            return False, str(exc)
        return True, None


def _finite_number(text: str) -> float:
    number = float(text)
    if not math.isfinite(number):
        raise ValueError("number is outside the finite JSON range")
    return number


def _invalid_constant(_text: str):
    raise ValueError("NaN and Infinity are not valid JSON values")


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON object key {key!r}")
        result[key] = value
    return result


def parse_structured_output(content: str, validator):
    """Decode exactly one JSON value and validate its declared contract."""
    try:
        value = json.loads(
            content,
            parse_float=_finite_number,
            parse_constant=_invalid_constant,
            object_pairs_hook=_unique_object,
        )
    except (ValueError, TypeError) as exc:
        message = (
            exc.msg if isinstance(exc, json.JSONDecodeError) else str(exc)
        )
        location = (
            {"line": exc.lineno, "column": exc.colno}
            if isinstance(exc, json.JSONDecodeError)
            else {}
        )
        raise StructuredOutputError(
            "LLM_OUTPUT_JSON_INVALID",
            "outputs.parsed",
            message,
            **location,
        ) from exc
    error = next(validator.iter_errors(value), None)
    if error is not None:
        path = list(error.absolute_path)
        if error.validator == "required" and isinstance(error.instance, dict):
            path.extend(
                next(
                    (
                        [key]
                        for key in error.validator_value
                        if key not in error.instance
                    ),
                    [],
                ),
            )
        message = (
            "expected " + json.dumps(error.validator_value, ensure_ascii=False)
            if error.validator == "type"
            else f"value violates {error.validator or 'schema'} constraint"
        )
        pointer = _pointer(path)
        raise StructuredOutputError(
            "LLM_OUTPUT_SCHEMA_MISMATCH",
            "outputs.parsed" + pointer,
            message,
            instance_path=pointer,
            schema_path=_pointer(error.absolute_schema_path),
        )
    return value
