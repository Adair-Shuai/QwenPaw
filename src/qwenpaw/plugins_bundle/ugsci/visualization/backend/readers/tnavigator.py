# -*- coding: utf-8 -*-
"""tNavigator/Eclipse-compatible deck reader.

tNavigator projects normally use Eclipse-compatible GRID/EGRID/GRDECL/INIT/
UNRST files plus a ``.DATA`` deck.  The deck itself is not a mesh, so this
reader resolves its INCLUDE statements or same-stem companion grid and then
delegates geometry/property conversion to :class:`EclipseReader`.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from .base import BaseReader, register_reader


_INCLUDE_RE = re.compile(r"^\s*INCLUDE\s+['\"]?([^'\"\s;]+)", re.I | re.M)
_GRID_SUFFIXES = {".egrid", ".grid", ".grdecl"}


class TNavigatorReader(BaseReader):
    """Resolve a tNavigator project deck to its Eclipse-compatible grid."""

    @property
    def format_id(self) -> str:
        return "tnavigator"

    @property
    def extensions(self) -> tuple[str, ...]:
        return (".data", ".model", ".tnav", ".tpr")

    @property
    def requires(self) -> tuple[str, ...]:
        return ("xtgeo",)

    def read(
        self,
        file_path: str,
        name: str,
        bin_dir: Path,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        source = Path(file_path)
        if not source.exists():
            raise FileNotFoundError(f"tNavigator deck not found: {source}")

        options = options or {}
        grid_path = Path(options["grid_path"]) if options.get("grid_path") else self._resolve_grid(source)
        if grid_path is None:
            raise ValueError(
                "tNavigator deck has no resolvable GRID/EGRID/GRDECL companion. "
                "Upload the deck together with its grid or keep INCLUDE paths relative."
            )

        from .eclipse import EclipseReader

        result = EclipseReader().read(str(grid_path), name, bin_dir, options)
        result["source"] = "tnavigator"
        result["name"] = result["name"].replace("Eclipse:", "tNavigator:", 1)
        result.setdefault("metadata", {}).update({
            "simulator": "tNavigator",
            "input_deck": source.name,
            "grid_file": grid_path.name,
            "format": source.suffix.lower().lstrip("."),
        })
        return result

    def _resolve_grid(self, source: Path) -> Path | None:
        # A deck may itself be a GRDECL-like grid file.
        try:
            text = source.read_text(encoding="utf-8", errors="replace")
        except OSError:
            text = ""
        upper = text.upper()
        if {"SPECGRID", "COORD", "ZCORN"}.issubset(set(re.findall(r"\b[A-Z][A-Z0-9_]+", upper))):
            return source

        # Resolve INCLUDE paths first, preserving the deck's relative layout.
        root = source.parent.resolve()
        for raw in _INCLUDE_RE.findall(text):
            candidate = (root / raw).resolve()
            try:
                candidate.relative_to(root)
            except ValueError:
                # Never allow a deck uploaded through the workspace preview
                # to escape its staging directory via INCLUDE paths.
                continue
            if candidate.exists() and candidate.suffix.lower() in _GRID_SUFFIXES:
                return candidate
            for suffix in _GRID_SUFFIXES:
                alternate = candidate.with_suffix(suffix)
                if alternate.exists():
                    return alternate

        # Finally use a same-stem companion, case-insensitively.
        for candidate in source.parent.iterdir():
            if candidate.stem.lower() == source.stem.lower() and candidate.suffix.lower() in _GRID_SUFFIXES:
                return candidate
        return None


register_reader(TNavigatorReader())
