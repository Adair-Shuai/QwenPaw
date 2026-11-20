# -*- coding: utf-8 -*-
"""Closed release contract. Unsupported capabilities fail before execution."""

from pathlib import PurePosixPath
import re
from typing import Any, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


def relative_path(value: str) -> str:
    parts = PurePosixPath(value).parts
    if not parts or value.startswith("/") or value != "/".join(parts):
        raise ValueError("Unsafe package path")
    if (
        len(value) > 220
        or any(p in {".", ".."} or p.endswith((".", " ")) for p in parts)
        or re.search(r'[\\:\x00-\x1f<>"|?*%#]', value)
        or any(
            p.split(".")[0].upper()
            in {
                "CON",
                "PRN",
                "AUX",
                "NUL",
                *(f"COM{i}" for i in range(10)),
                *(f"LPT{i}" for i in range(10)),
            }
            for p in parts
        )
    ):
        raise ValueError("Unsafe package path")
    return value


class ClosedModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class Artifact(ClosedModel):
    path: str
    sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    size: int = Field(gt=0, le=512 * 1024 * 1024)

    _path = field_validator("path")(relative_path)


class SmokeTest(ClosedModel):
    tool: str = Field(min_length=1, max_length=128)
    arguments: dict[str, Any] = Field(default_factory=dict)
    # Assertions on structuredContent, including numeric values. No code eval.
    expected: dict[str, Any] = Field(min_length=1)


class PythonMCP(ClosedModel):
    entrypoint: str
    args: list[str] = Field(default_factory=list, max_length=30)
    tools: list[str] = Field(min_length=1, max_length=100)
    schemas: dict[str, str] = Field(default_factory=dict)
    smoke: list[SmokeTest] = Field(min_length=1, max_length=20)

    _path = field_validator("entrypoint")(relative_path)

    @model_validator(mode="after")
    def smoke_tools(self):
        if len(set(self.tools)) != len(self.tools):
            raise ValueError("Duplicate MCP tool declaration")
        if any(test.tool not in self.tools for test in self.smoke):
            raise ValueError("Smoke test must use a declared tool")
        if any("${" in arg.replace("${workspace}", "") for arg in self.args):
            raise ValueError("Only the workspace placeholder is supported")
        return self


class Release(ClosedModel):
    schema_version: Literal[1]
    id: str = Field(pattern=r"^[a-z0-9][a-z0-9.-]{1,79}$")
    version: str = Field(pattern=r"^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z0-9.]+)?$")
    name: str = Field(min_length=1, max_length=160)
    description: str = Field(default="", max_length=4000)
    core_min: str
    target: str = Field(pattern=r"^[a-z0-9][a-z0-9_-]{1,80}$")
    python: str = Field(pattern=r"^3\.[0-9]+$")
    artifact: Artifact
    files: dict[str, str] = Field(min_length=1, max_length=20000)
    instructions: str
    skills: list[str] = Field(min_length=1, max_length=100)
    wheels: list[str] = Field(min_length=1, max_length=200)
    mcp: PythonMCP
    # Human-readable unavailable optional capabilities, not executable config.
    optional_setup: list[str] = Field(default_factory=list, max_length=20)

    @model_validator(mode="after")
    def paths(self):
        if len({p.casefold() for p in self.files}) != len(self.files):
            raise ValueError("Case-colliding paths")
        for path, digest in self.files.items():  # pylint: disable=no-member
            relative_path(path)
            if not re.fullmatch(r"[0-9a-f]{64}", digest):
                raise ValueError("Invalid file digest")
        for path in [self.instructions, self.mcp.entrypoint, *self.wheels]:
            relative_path(path)
            if path not in self.files:
                raise ValueError("Required file missing from signed inventory")
        for path in self.skills:
            relative_path(path)
            if f"{path}/SKILL.md" not in self.files:
                raise ValueError("Skill missing from signed inventory")
        if len(set(self.skills)) != len(self.skills) or len(
            set(self.wheels),
        ) != len(
            self.wheels,
        ):
            raise ValueError("Duplicate package input")
        if len({PurePosixPath(s).name.casefold() for s in self.skills}) != len(
            self.skills,
        ):
            raise ValueError("Duplicate skill name")
        if any(not p.endswith(".whl") for p in self.wheels):
            raise ValueError("Only prebuilt wheels are supported")
        return self


class ReleaseRef(ClosedModel):
    target: str = Field(pattern=r"^[a-z0-9][a-z0-9_-]{1,80}$")
    python: str = Field(pattern=r"^3\.[0-9]+$")
    manifest: str
    sha256: str = Field(pattern=r"^[0-9a-f]{64}$")

    _path = field_validator("manifest")(relative_path)


class ReleaseIndex(ClosedModel):
    schema_version: Literal["expert-index.v1"]
    id: str = Field(pattern=r"^[a-z0-9][a-z0-9.-]{1,79}$")
    version: str = Field(pattern=r"^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z0-9.]+)?$")
    releases: list[ReleaseRef] = Field(min_length=1, max_length=20)

    @model_validator(mode="after")
    def unique_targets(self):
        if len({(r.target, r.python) for r in self.releases}) != len(
            self.releases,
        ):
            raise ValueError("Duplicate expert platform variant")
        return self
