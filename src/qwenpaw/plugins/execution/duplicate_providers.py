# -*- coding: utf-8 -*-
"""Resolve duplicate Python providers for this consumer's read decisions."""

from __future__ import annotations

import base64
import csv
from dataclasses import dataclass
import hashlib
from importlib.util import source_from_cache
from importlib.machinery import EXTENSION_SUFFIXES
import io
import os
from pathlib import Path
import sys
import stat

from packaging.requirements import Requirement
from packaging.utils import canonicalize_name
from packaging.version import Version

from .dependencies import (
    _HeaderDistribution,
    _parse_record_entries,
    _record_names,
    dependency_error,
    valid_metadata_headers,
)


@dataclass(frozen=True)
class Provider:
    name: str
    path: Path
    version: str
    requires: tuple[str, ...]


@dataclass(frozen=True)
class ProviderChoice:
    candidates: tuple[Provider, ...]
    observed: Provider | None
    modules: dict[str, str]
    unresolved_source: bool

    @property
    def possible(self):
        return (self.observed,) if self.observed else self.candidates

    @property
    def requirements(self):
        # Only common edges are mandatory while the provider is uncertain.
        shared = set(self.possible[0].requires)
        for provider in self.possible[1:]:
            shared.intersection_update(provider.requires)
        return tuple(sorted(shared))

    def compatible(self, requirement):
        return (
            not self.unresolved_source
            and not requirement.url
            and all(
                requirement.specifier.contains(p.version, prereleases=True)
                for p in self.possible
            )
        )

    @property
    def same_requirements(self):
        return all(p.requires == self.requirements for p in self.possible)

    @property
    def uniform_contract(self):
        return (
            len({(Version(p.version), p.requires) for p in self.candidates})
            == 1
        )

    def refusal(self, requirement):
        versions = ", ".join(sorted({p.version for p in self.candidates}))
        active = self.observed.version if self.observed else "unconfirmed"
        return (
            f"DEPENDENCY_ENVIRONMENT_AMBIGUOUS: {requirement}. "
            f"Candidate versions: {versions}. Loaded provider: {active}."
        )

    def details(self):
        return {
            "candidates": [
                {"version": p.version, "metadata_path": str(p.path)}
                for p in self.candidates
            ],
            "observed_metadata_path": (
                str(self.observed.path) if self.observed else None
            ),
            "loaded_modules": self.modules,
        }


def _provider(path, name):
    headers = _HeaderDistribution(path).metadata
    try:
        if not valid_metadata_headers(headers, ("Name", "Version")) or (
            canonicalize_name(headers["Name"]) != name
        ):
            raise ValueError
        Version(headers["Version"])
        requires = {
            str(Requirement(value))
            for value in headers.get_all("Requires-Dist", ())
        }
    except (TypeError, ValueError):
        raise dependency_error() from None
    return Provider(name, path, headers["Version"], tuple(sorted(requires)))


def _observed_provider(providers):
    """Attribute loaded files by RECORD, including aliased distribution names.

    Unloaded roots, namespaces, incomplete records and mixed sources leave
    ownership unresolved. Inspecting sys.modules never imports a candidate.
    """
    owners = {}
    tops = set()
    complete = len({p.path.parent for p in providers}) == len(providers)
    for provider in providers:
        files = None
        try:
            # Bound optional provenance work on the plugin startup path.
            record_path = provider.path / "RECORD"
            data = b""
            if record_path.is_file():
                with record_path.open("rb") as record:
                    data = record.read(2 * 1024 * 1024 + 1)
            if len(data) <= 2 * 1024 * 1024:
                entries = _parse_record_entries(data.decode("utf-8"))
                files = _record_names(entries, allow_external=True)
        except (OSError, UnicodeError):
            pass
        roots = set()
        for item in files or ():
            parts = Path(item).parts
            if not item.endswith((".py", ".pyc", *EXTENSION_SUFFIXES)):
                continue
            top = parts[0] if len(parts) > 1 else parts[0].split(".")[0]
            if top.isidentifier() and top != "__pycache__":
                roots.add(os.path.normcase(top))
        complete &= bool(roots)
        if not roots:
            # Hints identify diagnostic module paths, never file ownership.
            roots.add(os.path.normcase(provider.name.replace("-", "_")))
            try:
                with (provider.path / "top_level.txt").open("rb") as stream:
                    hints = stream.read(4097)
                if len(hints) <= 4096:
                    roots.update(
                        os.path.normcase(h)
                        for h in hints.decode().split()
                        if h.isidentifier()
                    )
            except (OSError, UnicodeError):
                pass
        tops.update(roots)
        owners[provider] = files or set()

    seen, sources, examples = set(), set(), {}
    loaded_roots = set()
    has_loaded_module = False
    for name, module in sys.modules.copy().items():
        if not isinstance(name, str):
            continue
        top = os.path.normcase(name.partition(".")[0])
        if top not in tops:
            continue
        has_loaded_module = True
        if "." not in name:
            loaded_roots.add(top)
        origin = (
            vars(module).get("__file__")
            if isinstance(module, type(sys))
            else None
        )
        if not isinstance(origin, str) or not os.path.isabs(origin):
            complete = False
            continue
        path = Path(os.path.realpath(origin))
        matches = [
            p
            for p, files in owners.items()
            if path.is_relative_to(p.path.parent)
            and os.path.normcase(str(path.relative_to(p.path.parent))) in files
        ]
        # Keep one representative per root and source, including mixed imports.
        key = (top, tuple(matches), None if matches else str(path.parent))
        if key not in seen:
            seen.add(key)
            examples[name] = str(path)
        if len(matches) != 1 or not path.is_file():
            complete = False
        sources.update(matches)
    selected = None
    if complete and tops == loaded_roots and len(sources) == 1:
        selected = next(iter(sources))
    return (
        selected,
        examples,
        not complete or (has_loaded_module and selected is None),
    )


class _ModifiedPayload(ValueError):
    """A recorded runtime file differs from its installed digest."""


def _recorded_payload(provider):
    """Verify a small wheel's recorded source and data for read reuse only.

    Generated bytecode with a corresponding recorded source is excluded.
    This evidence never grants ownership, authorizes writes or proves which
    provider has loaded. Larger distributions keep their ordinary diagnostic.
    """
    root = provider.path.parent
    record = provider.path / "RECORD"
    budget = 1024 * 1024
    if not record.is_file() or record.stat().st_size > 64 * 1024:
        return None
    with record.open("rb") as stream:
        encoded = stream.read(64 * 1024 + 1)
    if len(encoded) > 64 * 1024:
        return None
    rows = list(csv.reader(io.StringIO(encoded.decode("utf-8")), strict=True))
    if not rows or len(rows) > 512:
        return None
    payload, cached_sources, seen = {}, set(), set()
    for row in rows:
        if len(row) != 3:
            return None
        relative, digest, size = row
        path = root / relative
        if (
            not relative
            or Path(relative).is_absolute()
            or ".." in Path(relative).parts
            or ":" in relative
            or path in seen
        ):
            return None
        seen.add(path)
        if path == record:
            continue
        if path.parent.name == "__pycache__" and path.suffix == ".pyc":
            cached_sources.add(Path(source_from_cache(str(path))))
            continue
        if (
            not path.resolve().is_relative_to(root)
            or not digest.startswith("sha256=")
            or not size.isdecimal()
        ):
            return None
        length = int(size)
        if length > budget:
            return None
        info = path.stat()
        if not stat.S_ISREG(info.st_mode):
            return None
        if info.st_size != length:
            raise _ModifiedPayload
        with path.open("rb") as stream:
            data = stream.read(length + 1)
        actual = (
            base64.urlsafe_b64encode(hashlib.sha256(data).digest())
            .rstrip(b"=")
            .decode()
        )
        if len(data) != length or actual != digest[7:]:
            raise _ModifiedPayload
        payload[path.relative_to(root)] = actual
        budget -= length
    if not all(p.relative_to(root) in payload for p in cached_sources):
        return None
    if (provider.path / "METADATA").relative_to(root) not in payload:
        return None
    return payload


def compare_recorded_payloads(choice, *, include_loaded=False):
    if (
        (choice.observed and not include_loaded)
        or choice.unresolved_source
        or not choice.uniform_contract
        or len(choice.candidates) > 3
    ):
        return "unverified"
    try:
        first, *rest = choice.candidates
        reference = _recorded_payload(first)
        if not reference:
            return "unverified"
        for provider in rest:
            other = _recorded_payload(provider)
            if other is None:
                return "unverified"
            if other != reference:
                return "different"
    except _ModifiedPayload:
        return "different"
    except (OSError, ValueError, RuntimeError, csv.Error):
        return "unverified"
    return "matching"


def duplicate_choice(name, distributions):
    """Inspect only collisions, deduplicating aliases of one metadata path."""
    # importlib.metadata providers without a filesystem path can still serve
    # version() to the legacy gate. The read inventory handles disk evidence.
    candidates = list(distributions)
    if len(candidates) < 2 and not _detached_files():
        return None
    return consumer_choice(read_providers(name, candidates))


def read_providers(name, distributions):
    paths = {}
    for dist in distributions:
        location = getattr(dist, "_path", None)
        if not isinstance(location, (str, os.PathLike)):
            raise dependency_error("DEPENDENCY_ENVIRONMENT_AMBIGUOUS")
        paths[Path(location).resolve()] = None
    return tuple(_provider(path, name) for path in paths)


def _detached_files():
    # Workers and server installations do not initialize the desktop runtime.
    runtime = sys.modules.get("qwenpaw.tauri.execution_runtime")
    return runtime.detached_import_files() if runtime else ()


def consumer_choice(providers, *, include_detached=True):
    if not providers:
        return None
    detached = _detached_files() if include_detached else ()
    if len(providers) == 1 and not detached:
        return None
    choice = resolve_providers(providers)
    if len(providers) > 1 or any(
        Path(p) in detached for p in choice.modules.values()
    ):
        return choice
    return None


def resolve_providers(providers):
    observed, modules, unresolved = _observed_provider(providers)
    return ProviderChoice(providers, observed, modules, unresolved)
