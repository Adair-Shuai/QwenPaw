# -*- coding: utf-8 -*-
"""Provider-neutral file conversion and artifact routing.

The registry deliberately knows nothing about Three.js or a particular
simulator.  A provider registers a handler for one or more extensions and
returns a JSON-serializable artifact manifest.  This gives UGSci a common
conversion seam while allowing the existing readers to migrate incrementally.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping


@dataclass(frozen=True)
class ArtifactConversionRequest:
    """Input to one format conversion operation."""

    source: Path
    name: str
    output_dir: Path
    companions: tuple[Path, ...] = ()
    options: Mapping[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class FormatMatch:
    """A format detection result suitable for API/Agent responses."""

    format_id: str
    extension: str
    confidence: float = 1.0
    requires_companion: tuple[str, ...] = ()


@dataclass(frozen=True)
class ConversionHandler:
    """A provider-owned converter registered with UGSci."""

    format_id: str
    extensions: tuple[str, ...]
    convert: Callable[[ArtifactConversionRequest], dict[str, Any]]
    requires_companion: tuple[str, ...] = ()
    description: str = ""


class FileConversionRegistry:
    """Resolve source formats and delegate conversion to providers."""

    def __init__(self, handlers: Iterable[ConversionHandler] = ()) -> None:
        self._handlers: dict[str, ConversionHandler] = {}
        self._by_extension: dict[str, ConversionHandler] = {}
        for handler in handlers:
            self.register(handler)

    def register(self, handler: ConversionHandler) -> None:
        if not handler.format_id.strip():
            raise ValueError("format_id must not be empty")
        if not handler.extensions:
            raise ValueError("a conversion handler needs at least one extension")
        self._handlers[handler.format_id] = handler
        for extension in handler.extensions:
            normalized = _normalize_extension(extension)
            previous = self._by_extension.get(normalized)
            if previous is not None and previous.format_id != handler.format_id:
                raise ValueError(
                    f"extension {normalized!r} is already handled by "
                    f"{previous.format_id}",
                )
            self._by_extension[normalized] = handler

    def detect(self, source: Path) -> FormatMatch | None:
        extension = _normalize_extension(source.suffix)
        handler = self._by_extension.get(extension)
        if handler is None:
            return None
        return FormatMatch(
            format_id=handler.format_id,
            extension=extension,
            requires_companion=handler.requires_companion,
        )

    def list_formats(self) -> list[FormatMatch]:
        return [
            FormatMatch(
                format_id=handler.format_id,
                extension=handler.extensions[0],
                requires_companion=handler.requires_companion,
            )
            for handler in self._handlers.values()
        ]

    def convert(self, request: ArtifactConversionRequest) -> dict[str, Any]:
        match = self.detect(request.source)
        if match is None:
            extension = request.source.suffix.lower() or "none"
            raise ValueError(f"Unsupported import format: {extension}")
        handler = self._handlers[match.format_id]
        result = handler.convert(request)
        if not isinstance(result, dict):
            raise TypeError(
                f"converter {handler.format_id!r} must return a dict manifest",
            )
        result.setdefault("metadata", {})
        result["metadata"].setdefault("format_id", handler.format_id)
        result["metadata"].setdefault("source_path", str(request.source))
        return result


def _normalize_extension(extension: str) -> str:
    value = extension.strip().lower()
    return value if value.startswith(".") else f".{value}"


def find_companion(
    source: Path,
    extra_paths: Path | None | Iterable[Path | None],
    suffixes: set[str],
) -> Path | None:
    """Resolve an explicitly supplied or same-stem companion file."""

    normalized = (
        list(extra_paths)
        if not isinstance(extra_paths, Path) and extra_paths is not None
        else [extra_paths]
    )
    suffixes = {_normalize_extension(item) for item in suffixes}
    for candidate in normalized:
        if (
            candidate is not None
            and candidate.exists()
            and _normalize_extension(candidate.suffix) in suffixes
        ):
            return candidate

    if not source.parent.exists():
        return None
    for candidate in source.parent.iterdir():
        if candidate == source or not candidate.is_file():
            continue
        if (
            candidate.stem.lower() == source.stem.lower()
            and _normalize_extension(candidate.suffix) in suffixes
        ):
            return candidate
    return None

