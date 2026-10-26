"""Publish immutable, completed simulation fields into the live viewer catalog.

Only small descriptors leave this module. Source files stay untouched; a failed
or half-written update never replaces the last usable dataset.
"""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import tempfile
import threading
from pathlib import Path
from typing import Any

from .cache.layout import CacheLayout
from .cache.manifest_store import ManifestStore
from .cache.resource_store import ResourceStore

_LOCK = threading.RLock()


def runtime_directory() -> Path:
    try:
        from qwenpaw.constant import WORKING_DIR
        root = Path(WORKING_DIR)
    except ImportError:
        root = Path.home() / ".qwenpaw"
    return root / "ugsci" / "visualization"


def runtime_manifest() -> ManifestStore:
    root = runtime_directory()
    return ManifestStore(root / "bin", CacheLayout(root))


class SimulationCatalog:
    """Overlay runtime simulation results without moving local example data."""
    def __init__(self, local: ManifestStore):
        self.local = local

    def read(self) -> dict:
        original = self.local.read()
        live = runtime_manifest().read().get("datasets", [])
        ids = {item["id"] for item in live}
        return {**original, "datasets": live + [item for item in original.get("datasets", []) if item["id"] not in ids]}

    def get_dataset(self, dataset_id: str) -> dict | None:
        return runtime_manifest().get_dataset(dataset_id) or self.local.get_dataset(dataset_id)

    def upsert(self, dataset: dict) -> None:
        if dataset.get("metadata", {}).get("simulation_run_id"):
            runtime_manifest().upsert(dataset)
        else:
            self.local.upsert(dataset)

    def remove(self, dataset_id: str) -> bool:
        return runtime_manifest().remove(dataset_id) or self.local.remove(dataset_id)


class SimulationResources(ResourceStore):
    def get_path(self, filename: str) -> Path:
        local = super().get_path(filename)
        if local.exists():
            return local
        return ResourceStore(runtime_directory() / "bin").get_path(filename)


def _atomic_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as out:
        json.dump(value, out, ensure_ascii=False)
        temp = Path(out.name)
    os.replace(temp, path)


def _file_digest(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _same_case(directory: Path, stem: str, suffixes: tuple[str, ...]) -> Path | None:
    if not directory.is_dir():
        return None
    matches = [p for p in directory.iterdir() if p.is_file() and p.stem.casefold() == stem.casefold()]
    for suffix in suffixes:
        candidates = [p for p in matches if p.suffix.casefold() == suffix]
        if len(candidates) > 1:
            raise ValueError(f"Ambiguous same-case {suffix} files")
        if candidates:
            return candidates[0]
    return None


def _stats(files: list[Path]) -> list[list[Any]]:
    return [[str(p.resolve()), p.stat().st_size, p.stat().st_mtime_ns] for p in files]


def _run_started(run_id: str) -> float:
    try:
        from ...engine.tools import job_store
        job = job_store.load_job(run_id) or {}
        return float(job.get("start_ts") or 0)
    except (ImportError, ValueError, TypeError, OSError):
        return 0.0


def _completed_restart(path: Path) -> tuple[int, bool]:
    """Locate the last ENDSOL boundary; ignore a trailing incomplete report.

    Reading every record materializes and validates its Fortran record framing.
    ENDSOL marks a complete solution section, so no frame advertises half of a
    pressure/saturation update. Well metadata after ENDSOL is not needed here.
    """
    import resfo
    end = 0
    with path.open("rb") as stream:
        try:
            for record in resfo.lazy_read(stream):
                keyword = record.read_keyword().strip()
                record.read_array()
                if keyword == "ENDSOL":
                    end = stream.tell()
        except (ValueError, EOFError, OSError, resfo.ResfoParsingError):
            return end, True
    return end, end < path.stat().st_size


def _descriptor(dataset: dict) -> dict:
    properties = set((dataset.get("files") or {}).get("scalars", {}))
    steps = []
    for step in dataset.get("time_steps", []):
        names = sorted(step.get("scalars", {}))
        properties.update(names)
        steps.append({"index": step["index"], "timeStep": step["index"] + 1,
                      "step_number": step.get("step_number"), "date": step.get("date"), "properties": names})
    return {"dataset_id": dataset["id"], "label": dataset.get("name", dataset["id"]),
            "revision": dataset.get("metadata", {}).get("revision", 1),
            "time_steps": steps, "properties": sorted(properties)}


def publish_simulation_fields(run_id: str, simulator: str, deck_file: str,
                              output_dir: str, final: bool = False) -> dict:
    """Collect stable same-case Eclipse fields and atomically publish a revision.

    Non-final sampling requires the same size/mtime on two visits. Full content
    hashes of copied complete frames avoid reconverting unchanged results even
    if the solver appended only a partial next frame. No numerical units are
    guessed. Unsupported formats are explicit, and old results remain usable.
    """
    with _LOCK:
        deck = Path(deck_file).resolve()
        root = runtime_directory()
        key = hashlib.sha256(f"{run_id}\0{deck}".encode()).hexdigest()[:20]
        dataset_id = f"simulation_{key}"
        store = runtime_manifest()
        previous = store.get_dataset(dataset_id)
        state_path = root / "runs" / f"{key}.json"
        try:
            state = json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {}
        except (OSError, ValueError):
            state = {}
        warnings: list[str] = []

        def response(status: str, dataset: dict | None = previous) -> dict:
            return {"status": status, "datasets": [_descriptor(dataset)] if dataset else [], "warnings": warnings}

        is_cmg = simulator.casefold() in {"cmg", "gem", "imex", "stars", "cmg_gem", "cmg_imex", "cmg_stars"}
        if not is_cmg and simulator.casefold() not in {"eclipse", "e100", "e300", "intersect", "tnavigator", "opm", "opm-flow", "opm_flow", "flow"}:
            warnings.append(f"{simulator}: automatic field publication is not supported; explicit viewer import remains available")
            return response("unsupported")
        if is_cmg and not final:
            warnings.append("CMG SR3 live field updates are not supported; a readable terminal snapshot is collected when the run ends")
            return response("stale" if previous else "pending")
        if is_cmg:
            warnings.append("CMG fields are a terminal SR3 snapshot; live SWMR streaming is not supported")
        try:
            output = Path(output_dir).resolve()
            grid = deck if is_cmg and deck.is_file() else _same_case(output, deck.stem, (".egrid", ".grid")) or _same_case(deck.parent, deck.stem, (".egrid", ".grid"))
            if not grid:
                warnings.append("Waiting for the same-case EGRID/GRID output")
                return response("stale" if previous else "pending")
            init = None if is_cmg else _same_case(output, deck.stem, (".init",)) or _same_case(grid.parent, deck.stem, (".init",))
            result_suffix = (".sr3",) if is_cmg else (".unrst",)
            restart = _same_case(output, deck.stem, result_suffix) or _same_case(grid.parent, deck.stem, result_suffix)
            started = _run_started(run_id)
            if restart and started and restart.stat().st_mtime < started:
                warnings.append("Restart output predates this run and was excluded")
                restart = None
            if is_cmg and not restart:
                warnings.append("No current same-case SR3 output; CMG automatic fields require a terminal SR3 snapshot")
                return response("stale" if previous else "unavailable")
            sources = [p for p in (grid, init, restart) if p]
            before = _stats(sources)
            stable = state.get("observed") == before
            # A running solver may append a new report every sampling interval.
            # Require static geometry/INIT stability; restart framing below
            # independently certifies complete dynamic sections.
            previous_stats = {item[0]: item for item in state.get("observed", [])}
            static_stable = all(previous_stats.get(item[0]) == item for item in before
                                if not restart or item[0] != str(restart.resolve()))
            state["observed"] = before
            _atomic_json(state_path, state)
            if not final and not static_stable:
                return response("stale" if previous else "pending")
            if stable and state.get("published_stats") == before and previous:
                if state.get("partial"):
                    warnings.append("Waiting for the next complete restart solution section")
                return response("stale" if state.get("partial") else "ready")
            staging = root / "staging"
            staging.mkdir(parents=True, exist_ok=True)
            with tempfile.TemporaryDirectory(prefix=f"{key}_", dir=staging) as temp:
                temp_dir = Path(temp)
                copies = []
                partial = False
                for source in sources:
                    copied = temp_dir / source.name
                    shutil.copyfile(source, copied)
                    copies.append(copied)
                if _stats(sources) != before:
                    warnings.append("Output changed during collection; retaining the last complete result")
                    return response("stale" if previous else "pending")
                if restart and not is_cmg:
                    copied_restart = temp_dir / restart.name
                    completed, partial = _completed_restart(copied_restart)
                    if partial:
                        warnings.append("Incomplete restart tail ignored; only completed solution sections are shown")
                    if not completed:
                        copied_restart.unlink()
                        copies.remove(copied_restart)
                    else:
                        with copied_restart.open("r+b") as stream:
                            stream.truncate(completed)
                fingerprint = hashlib.sha256(b"ugsci-simulation-fields-v1")
                for copied in copies:
                    fingerprint.update(copied.name.casefold().encode())
                    with copied.open("rb") as stream:
                        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                            fingerprint.update(chunk)
                digest = fingerprint.hexdigest()
                if previous and digest in {state.get("fingerprint"), previous.get("metadata", {}).get("source_fingerprint")}:
                    state["fingerprint"] = digest
                    state["published_stats"] = before
                    state["partial"] = partial
                    _atomic_json(state_path, state)
                    return response("stale" if partial else "ready")
                resources = temp_dir / "resources"
                resources.mkdir()
                prefix = f"{dataset_id}_{digest[:20]}"
                if is_cmg:
                    from .readers.cmg import CmgReader
                    dataset = CmgReader().read(str(temp_dir / grid.name), prefix, resources,
                                              {"sr3_path": str(temp_dir / restart.name), "max_steps": 0})
                    if not dataset.get("time_steps") or dataset.get("metadata", {}).get("sr3_error"):
                        raise ValueError(dataset.get("metadata", {}).get("sr3_error") or "No readable CMG spatial fields match the deck grid")
                    # Trajectories remain available through normal CMG import.
                    # This publisher owns only the coherent grid/field snapshot.
                    dataset.pop("related_datasets", None)
                else:
                    from .readers.eclipse import EclipseReader
                    dataset = EclipseReader().read(str(temp_dir / grid.name), prefix, resources, {"timeSteps": "range"})
                old_steps = previous.get("time_steps", []) if previous else []
                if len(dataset.get("time_steps", [])) < len(old_steps):
                    warnings.append("New snapshot has fewer complete frames; previous result retained")
                    return response("stale")
                dataset["id"] = dataset_id
                dataset["name"] = f"{deck.stem} · {simulator}"
                dataset.setdefault("metadata", {}).update({"managed": True, "simulation_run_id": run_id,
                    "revision": int((previous or {}).get("metadata", {}).get("revision", 0)) + 1,
                    "source_fingerprint": digest})
                from .api import _get_all_files
                required = set(_get_all_files(dataset).values())
                if not required or any(not (resources / name).is_file() for name in required):
                    raise ValueError("Converted frame is missing binary resources")
                destination = root / "bin"
                destination.mkdir(parents=True, exist_ok=True)
                for name in required:
                    target = ResourceStore(destination).get_path(name)
                    if target.exists():
                        if _file_digest(target) != _file_digest(resources / name):
                            raise ValueError("Immutable field resource integrity check failed")
                    else:
                        os.replace(resources / name, target)
                # Immutable resources are visible before the atomic catalog swap.
                store.upsert(dataset)
                state.update(fingerprint=digest, published_stats=before, partial=partial)
                _atomic_json(state_path, state)
                return response("ready", dataset)
        except Exception as exc:
            warnings.append(f"Field collection unavailable: {type(exc).__name__}: {exc}")
            return response("stale" if previous else "unavailable")
