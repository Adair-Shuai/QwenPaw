# -*- coding: utf-8 -*-
"""COMSOL Multiphysics adapter with bounded, case-aware result parsing."""
from __future__ import annotations

import csv
import itertools
import json
import re
import zipfile
from pathlib import Path
from typing import Any, Iterable, List, Optional
from xml.etree import ElementTree

from .base import (
    BaseSimAdapter,
    SimCapabilities,
    SimFieldTable,
    SimProgress,
    SimSummary,
    SimWarning,
)

_MAX_FIELD_SAMPLES = 8
_MAX_TIME_SERIES_POINTS = 100_000
_DEFAULT_MAX_MPH_XML_BYTES = 64 * 1024 * 1024
_MAX_AUTO_EXPORT_FILES = 32
_ABSOLUTE_PATH_RE = re.compile(
    r"(?:[A-Za-z]:[\\/][^<>\r\n\"']+|\\\\[^\\/\s]+\\[^<>\r\n\"']+)"
)


def _local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def inspect_mph_metadata(
    path: str | Path,
    *,
    deep: bool = False,
    max_xml_bytes: int = _DEFAULT_MAX_MPH_XML_BYTES,
) -> dict[str, Any]:
    """Inspect dependency-free metadata from a COMSOL MPH ZIP container.

    Large numerical payloads are never decompressed.  Only small text entries
    are scanned, with per-entry and total byte limits, so this is safe for
    routine monitoring of multi-hundred-megabyte models.
    """
    mph_path = Path(path)
    max_xml_bytes = max(4096, int(max_xml_bytes))
    metadata: dict[str, Any] = {
        "source_file": mph_path.name,
        "format": "mph",
        "inspection_level": "deep" if deep else "basic",
    }
    try:
        metadata["size_bytes"] = mph_path.stat().st_size
    except OSError:
        return metadata

    try:
        with zipfile.ZipFile(mph_path) as archive:
            infos = archive.infolist()
            by_name = {info.filename.casefold(): info for info in infos}
            resource_names = {
                Path(info.filename).name.casefold()
                for info in infos
                if info.filename.casefold().startswith("resources/")
            }
            metadata["container"] = {
                "kind": "zip",
                "entry_count": len(infos),
                "has_modelinfo": "modelinfo.xml" in by_name,
                "savepoint_count": len({
                    info.filename.split("/", 1)[0].casefold()
                    for info in infos
                    if info.filename.casefold().startswith("savepoint")
                }),
                "embedded_resource_count": len(resource_names),
            }

            version_info = by_name.get("fileversion")
            if version_info and version_info.file_size <= 4096:
                raw_version = archive.read(version_info).decode("utf-8", errors="replace")
                metadata["file_version"] = raw_version.strip()
                if ":" in raw_version:
                    metadata["comsol_version"] = raw_version.split(":", 1)[1].strip()

            model_info = by_name.get("modelinfo.xml") or by_name.get(
                "fileversion/modelinfo.xml"
            )
            if model_info and model_info.file_size <= max_xml_bytes:
                raw_info = archive.read(model_info)
                try:
                    root = ElementTree.fromstring(raw_info)
                except ElementTree.ParseError:
                    root = None
                if root is not None:
                    metadata.update({
                        "comsol_version": root.attrib.get(
                            "comsolVersion", metadata.get("comsol_version", "")
                        ),
                        "model_type": root.attrib.get("modelType", ""),
                        "node_type": root.attrib.get("nodeType", ""),
                        "is_runnable": root.attrib.get("isRunnable", ""),
                        "protection": {
                            "password": root.attrib.get("passwordProtection", ""),
                            "runtime": root.attrib.get("runtimeProtection", ""),
                        },
                        "locale": root.attrib.get("locale", ""),
                        "timing": {
                            "expected_seconds": COMSOLAdapter._duration_seconds(
                                root.attrib.get("expectedComputationTime", "")
                            ),
                            "last_seconds": COMSOLAdapter._duration_seconds(
                                root.attrib.get("lastComputationTime", "")
                            ),
                        },
                    })
                    for child in root.iter():
                        name = _local_name(child.tag)
                        if name == "historyInfo":
                            metadata["timestamps"] = {
                                "created_in": child.attrib.get("createdIn", ""),
                                "created_date": child.attrib.get("createdDate", ""),
                                "last_modified_date": child.attrib.get(
                                    "lastModifiedDate", ""
                                ),
                            }
                        elif name == "licenseInfo":
                            products = child.attrib.get("products", "")
                            metadata["license_product_sets"] = [
                                [item for item in group.split("|") if item]
                                for group in products.split("##")
                                if group
                            ]
                        elif name == "physicsInfo":
                            metadata["physics"] = [
                                item
                                for item in child.attrib.get("physics", "").split("##")
                                if item
                            ]
                        elif name == "geom":
                            metadata.setdefault("geometries", []).append(dict(child.attrib))

            solution_entries = [
                info
                for info in infos
                if Path(info.filename).name.casefold().startswith("solution")
                and Path(info.filename).suffix.casefold() == ".mphbin"
            ]
            metadata["container"].update({
                "is_solved": metadata.get("node_type", "").casefold() == "solved",
                "has_solution_entries": bool(solution_entries),
                "solution_entry_count": len(solution_entries),
                "solution_entry_bytes": sum(info.file_size for info in solution_entries),
            })
            metadata["external_references"] = []
            if deep:
                dmodel = by_name.get("dmodel.xml")
                if dmodel:
                    if dmodel.flag_bits & 0x1:
                        metadata.setdefault("warnings", []).append(
                            "dmodel.xml is encrypted; external references were not inspected"
                        )
                    elif dmodel.file_size > max_xml_bytes:
                        metadata.setdefault("warnings", []).append(
                            "dmodel.xml exceeds the bounded inspection limit"
                        )
                    elif dmodel.compress_size and dmodel.file_size / dmodel.compress_size > 200:
                        metadata.setdefault("warnings", []).append(
                            "dmodel.xml has an unsafe compression ratio"
                        )
                    else:
                        references: dict[tuple[str, ...], dict[str, Any]] = {}
                        try:
                            with archive.open(dmodel) as dmodel_stream:
                                context_stack: list[str] = []
                                for event, element in ElementTree.iterparse(
                                    dmodel_stream,
                                    events=("start", "end"),
                                ):
                                    if event == "start":
                                        tag = _local_name(element.tag)
                                        operation = element.attrib.get("op", "")
                                        context_stack.append(
                                            f"{tag}:{operation}" if operation else tag
                                        )
                                        continue
                                    if _local_name(element.tag) == "propertyValue":
                                        property_name = element.attrib.get("name", "")
                                        value = element.attrib.get("value", "")
                                        context = list(reversed(context_stack[:-1]))[:20]
                                        references_in_value = _ABSOLUTE_PATH_RE.findall(value)
                                        if (
                                            not references_in_value
                                            and property_name.casefold() in {
                                                "p:filename",
                                                "p:coordfilename",
                                                "p:lastwrittenfile",
                                                "p:previousfilename",
                                            }
                                            and 0 < len(value) <= 2048
                                            and "\n" not in value
                                            and "\r" not in value
                                        ):
                                            references_in_value = [value]
                                        for match in references_in_value:
                                            reference = COMSOLAdapter._sanitise_external_reference(
                                                match,
                                                property_name,
                                                mph_path.parent,
                                                resource_names,
                                                context,
                                            )
                                            key = (
                                                reference["origin"],
                                                reference["role"],
                                                reference["property"],
                                                reference["basename"],
                                                reference["feature"],
                                            )
                                            references[key] = reference
                                    element.clear()
                                    if context_stack:
                                        context_stack.pop()
                        except ElementTree.ParseError:
                            metadata.setdefault("warnings", []).append(
                                "dmodel.xml could not be parsed"
                            )
                        metadata["external_references"] = list(references.values())[:200]
                        metadata["metadata_scan_bytes"] = dmodel.file_size
    except (OSError, zipfile.BadZipFile, RuntimeError) as exc:
        metadata["container"] = {"kind": "unreadable"}
        metadata["inspection_error"] = str(exc)
    return metadata


def _detect_delimiter(line: str) -> str:
    counts = {",": 0, ";": 0, "\t": 0}
    depth = 0
    quote = ""
    for char in line:
        if quote:
            if char == quote:
                quote = ""
        elif char in {'"', "'"}:
            quote = char
        elif char in "([{":
            depth += 1
        elif char in ")]}":
            depth = max(0, depth - 1)
        elif depth == 0 and char in counts:
            counts[char] += 1
    delimiter, count = max(counts.items(), key=lambda item: item[1])
    return delimiter if count else ","


def _split_comsol_columns(line: str, delimiter: str | None = None) -> list[str]:
    """Split a COMSOL header without splitting commas inside expressions."""
    delimiter = delimiter or _detect_delimiter(line)
    values: list[str] = []
    token: list[str] = []
    depth = 0
    quote = ""
    index = 0
    while index < len(line):
        char = line[index]
        if quote:
            if char == quote:
                if index + 1 < len(line) and line[index + 1] == quote:
                    token.append(char)
                    index += 1
                else:
                    quote = ""
            else:
                token.append(char)
        elif char in {'"', "'"}:
            quote = char
        elif char in "([{":
            depth += 1
            token.append(char)
        elif char in ")]}":
            depth = max(0, depth - 1)
            token.append(char)
        elif char == delimiter and depth == 0:
            values.append("".join(token).strip())
            token = []
        else:
            token.append(char)
        index += 1
    values.append("".join(token).strip())
    return values


def _numeric_cells(line: str, delimiter: str = ",") -> list[float] | None:
    try:
        raw = next(csv.reader([line], delimiter=delimiter))
        return [float(item.strip()) for item in raw]
    except (csv.Error, StopIteration, TypeError, ValueError):
        return None


class COMSOLAdapter(BaseSimAdapter):
    simulator_id = "comsol"
    display_name = "COMSOL Multiphysics"
    deck_extension = ".mph"
    log_extension = ".log"
    capabilities = SimCapabilities(
        supports_progress=True,
        supports_result_reading=True,
        supports_terminal_artifacts=True,
        supports_checkpoint_resume=False,
        supports_auto_tune=False,
        supports_input_inspection=True,
    )

    _RE_PROGRESS = re.compile(r"(\d+)%\s*", re.IGNORECASE)

    def inspect_input(self, deck_file: str | Path) -> dict[str, Any]:
        metadata = inspect_mph_metadata(deck_file, deep=True)
        warnings = list(metadata.get("warnings") or [])
        unresolved = {
            item.get("basename", "")
            for item in metadata.get("external_references", [])
            if item.get("role") == "input"
            and item.get("origin") == "active_property"
            and not item.get("sibling_exists")
            and not item.get("original_exists")
            and not item.get("embedded_match")
        }
        warnings.extend(
            f"unresolved external COMSOL input: {name}"
            for name in sorted(unresolved, key=str.casefold)
            if name
        )
        if metadata.get("inspection_error"):
            warnings.append("COMSOL MPH metadata inspection failed")
        metadata["warnings"] = warnings[:100]
        return metadata

    @staticmethod
    def _duration_seconds(value: str) -> float | None:
        match = re.search(r"([\d.]+)\s*s\b", value or "", re.IGNORECASE)
        return float(match.group(1)) if match else None

    @staticmethod
    def _sanitise_external_reference(
        value: str,
        property_name: str,
        model_directory: Path,
        resource_names: set[str],
        feature_context: list[str],
    ) -> dict[str, Any]:
        normalised = value.strip().strip("\"'").rstrip(" ,;)]}").replace("\\\\", "\\")
        basename = normalised.replace("\\", "/").rsplit("/", 1)[-1]
        is_absolute = bool(_ABSOLUTE_PATH_RE.match(normalised))
        original_path = Path(normalised)
        if not is_absolute:
            original_path = model_directory / original_path
        folded_property = property_name.casefold()
        folded_context = "|".join(feature_context).casefold()
        if "lastwritten" in folded_property:
            role = "output"
        elif "previous" in folded_property:
            role = "historical"
        elif "exportfeature" in folded_context or "results:" in folded_context:
            role = "export_input"
        elif "filename" in folded_property:
            role = "input"
        else:
            role = "unknown"
        origin = "active_property" if folded_property in {
            "p:filename", "p:coordfilename", "p:lastwrittenfile", "p:previousfilename"
        } else "embedded_property"
        return {
            "origin": origin,
            "role": role,
            "property": property_name[:128],
            "feature": feature_context[0][:128] if feature_context else "",
            "basename": basename[:255],
            "is_absolute": is_absolute,
            "sibling_exists": (model_directory / basename).is_file(),
            "original_exists": original_path.is_file(),
            "embedded_match": basename.casefold() in resource_names,
        }

    def build_command(
        self,
        executable: str,
        deck_file: str,
        output_file: str = "",
    ) -> list[str]:
        executable_name = Path(executable).name.casefold()
        cmd = [executable]
        if executable_name.startswith("comsol") and "batch" not in executable_name:
            cmd.append("batch")
        cmd.extend(["-inputfile", deck_file])
        cmd.extend(["-outputfile", str(Path(deck_file).with_suffix("")) + "_result.mph"])
        cmd.extend(["-tmpdir", str(Path(deck_file).parent)])
        return cmd

    def find_log_file(self, working_dir: str | Path) -> Optional[Path]:
        directory = Path(working_dir)
        if not directory.is_dir():
            return None
        matches = list(directory.glob("*.log"))
        return max(matches, key=lambda path: path.stat().st_mtime) if matches else None

    def parse_progress(self, working_dir: str | Path) -> SimProgress:
        progress = SimProgress()
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return progress
        log_tail = self._read_log_tail(log_file, 500)
        upper_tail = log_tail[-2000:].upper()
        if re.search(
            r"(?:COMSOL\s+MULTIPHYSICS.*(?:COMPLETED|FINISHED)|"
            r"SOLUTION\s+(?:COMPLETED|FINISHED)|BATCH\s+RUN\s+COMPLETED)",
            log_tail,
            re.IGNORECASE | re.DOTALL,
        ):
            progress.status = "completed"
        elif re.search(r"\b(?:ERROR|FAILED|ABORTED|FATAL)\b", upper_tail):
            progress.status = "failed"
        else:
            progress.status = "running"
        for line in reversed(log_tail.splitlines()):
            match = self._RE_PROGRESS.search(line)
            if match:
                progress.current_step = int(match.group(1))
                progress.current_time = f"{progress.current_step}%"
                progress.target_time = "100%"
                break
        return progress

    def infer_terminal_status(
        self,
        working_dir: str | Path,
        *,
        start_ts: float = 0.0,
        case_stem: str = "",
    ) -> tuple[str | None, int | None, str | None]:
        status, returncode, error = super().infer_terminal_status(
            working_dir, start_ts=start_ts, case_stem=case_stem
        )
        if status is not None:
            return status, returncode, error
        result = Path(working_dir) / f"{case_stem}_result.mph"
        if not case_stem or not result.is_file():
            return (None, None, None)
        try:
            if start_ts > 0 and result.stat().st_mtime + 2.0 < start_ts:
                return (None, None, None)
        except OSError:
            return (None, None, None)
        metadata = inspect_mph_metadata(result)
        if metadata.get("node_type", "").casefold() == "solved":
            return ("completed", 0, None)
        return (None, None, None)

    def parse_warnings(
        self,
        working_dir: str | Path,
        limit: int = 20,
    ) -> List[SimWarning]:
        warnings: List[SimWarning] = []
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return warnings
        for index, line in enumerate(self._read_log_tail(log_file, 5000).splitlines(), 1):
            upper = line.upper()
            if "WARNING" in upper:
                warnings.append(SimWarning("warning", index, line.strip()))
            elif "ERROR" in upper or "FATAL" in upper:
                warnings.append(SimWarning("error", index, line.strip()))
            if len(warnings) >= limit:
                break
        return warnings

    def find_summary_file(
        self,
        working_dir: str | Path,
        case_stem: str = "",
    ) -> Optional[Path]:
        directory = Path(working_dir)
        if not directory.is_dir():
            return None
        if case_stem:
            exact = [
                directory / f"{case_stem}_result.mph",
                directory / f"{case_stem}.mph",
            ]
            for candidate in exact:
                if candidate.is_file():
                    return candidate
            return None
        result_files = list(directory.glob("*_result.mph"))
        if result_files:
            return max(result_files, key=lambda path: path.stat().st_mtime)
        mph_files = list(directory.glob("*.mph"))
        return max(mph_files, key=lambda path: path.stat().st_mtime) if mph_files else None

    @staticmethod
    def _manifest_exports(directory: Path, case_stem: str) -> list[Path]:
        manifest_names = [
            f"{case_stem}.exports.json",
            f"{case_stem}_exports.json",
            "comsol_exports.json",
        ]
        selected: list[Path] = []
        directory_resolved = directory.resolve()
        for name in manifest_names:
            manifest = directory / name
            if not manifest.is_file():
                continue
            try:
                payload = json.loads(manifest.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            exports: Any = payload
            if isinstance(payload, dict):
                exports = payload.get("exports", payload.get(case_stem, []))
                if isinstance(exports, dict):
                    exports = exports.get(case_stem, [])
            if isinstance(exports, str):
                exports = [exports]
            if not isinstance(exports, list):
                continue
            for item in exports:
                if not isinstance(item, str):
                    continue
                candidate = (directory / item).resolve()
                try:
                    candidate.relative_to(directory_resolved)
                except ValueError:
                    continue
                if candidate.is_file() and candidate.suffix.casefold() == ".csv":
                    selected.append(candidate)
        return selected

    def _associated_csv_files(
        self,
        directory: Path,
        case_stem: str,
        mph_file: Path | None,
    ) -> tuple[list[Path], dict[str, Any] | None]:
        csv_files = sorted(directory.glob("*.csv"), key=lambda path: path.name.casefold())
        if case_stem:
            selected = self._manifest_exports(directory, case_stem)
            if selected:
                unique = {path.resolve(): path for path in selected}
                return (
                    sorted(unique.values(), key=lambda path: path.name.casefold()),
                    None,
                )

        mph_metadata: dict[str, Any] | None = None
        if mph_file is not None:
            mph_metadata = inspect_mph_metadata(mph_file, deep=True)
            selected = []
            directory_resolved = directory.resolve()
            for reference in mph_metadata.get("external_references", []):
                if reference.get("role") != "output":
                    continue
                basename = reference.get("basename")
                if not isinstance(basename, str) or not basename.casefold().endswith(".csv"):
                    continue
                candidate = (directory / basename).resolve()
                try:
                    candidate.relative_to(directory_resolved)
                except ValueError:
                    continue
                if candidate.is_file():
                    selected.append(candidate)
            if selected:
                unique = {path.resolve(): path for path in selected}
                ordered = sorted(unique.values(), key=lambda path: path.name.casefold())
                if len(ordered) > _MAX_AUTO_EXPORT_FILES:
                    mph_metadata.setdefault("warnings", []).append(
                        "automatic COMSOL export discovery was truncated"
                    )
                    ordered = ordered[:_MAX_AUTO_EXPORT_FILES]
                return ordered, mph_metadata

        if case_stem:
            selected = []
            folded = case_stem.casefold()
            for path in csv_files:
                stem = path.stem.casefold()
                if stem == folded or stem.startswith(folded + "_") or stem.startswith(
                    folded + "-"
                ):
                    selected.append(path)
            unique = {path.resolve(): path for path in selected}
            return (
                sorted(unique.values(), key=lambda path: path.name.casefold()),
                mph_metadata,
            )
        return (csv_files if len(csv_files) == 1 else []), mph_metadata

    def read_summary(
        self,
        working_dir: str | Path,
        variables: Optional[List[str]] = None,
        wells: Optional[List[str]] = None,
        case_stem: str = "",
    ) -> SimSummary:
        directory = Path(working_dir)
        summary = SimSummary()
        mph_file = self.find_summary_file(directory, case_stem=case_stem)
        csv_files, mph_metadata = self._associated_csv_files(
            directory,
            case_stem,
            mph_file,
        )
        for candidate in csv_files:
            parsed = self._read_csv(candidate, variables, wells)
            for name, points in parsed.vectors.items():
                summary.vectors.setdefault(name, []).extend(points)
            for name, points in parsed.well_vectors.items():
                summary.well_vectors.setdefault(name, []).extend(points)
            summary.dates.extend(parsed.dates)
            summary.fields.extend(parsed.fields)
            summary.metadata.setdefault("exports", []).append(parsed.metadata)

        if mph_file:
            mph_summary = self._read_mph(mph_file, variables, metadata=mph_metadata)
            if mph_summary is not None:
                summary.metadata["mph"] = mph_summary.metadata
                for name, points in mph_summary.vectors.items():
                    summary.vectors.setdefault(name, []).extend(points)
        return summary

    @staticmethod
    def _read_csv(
        path: Path,
        variables: Optional[List[str]],
        wells: Optional[List[str]],
    ) -> SimSummary:
        summary = SimSummary()
        metadata: dict[str, Any] = {
            "source_file": path.name,
            "size_bytes": path.stat().st_size if path.is_file() else 0,
        }
        header: list[str] | None = None
        delimiter = ","
        first_data = ""
        try:
            with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
                for raw_line in handle:
                    line = raw_line.strip()
                    if not line:
                        continue
                    if line.startswith("%"):
                        payload = line[1:].strip()
                        line_delimiter = _detect_delimiter(payload)
                        columns = _split_comsol_columns(payload, line_delimiter)
                        first = columns[0].strip().upper() if columns else ""
                        if len(columns) > 1 and first in {"TIME", "T", "DATE", "X", "Y", "Z", "R"}:
                            header = columns
                            delimiter = line_delimiter
                        elif len(columns) > 1:
                            metadata[columns[0].strip()] = ",".join(columns[1:]).strip()
                        continue
                    line_delimiter = _detect_delimiter(line)
                    if _numeric_cells(line, line_delimiter) is None:
                        # Conventional CSV export with a non-comment header.
                        header = _split_comsol_columns(line, line_delimiter)
                        delimiter = line_delimiter
                        continue
                    delimiter = line_delimiter
                    first_data = line
                    break
                if not first_data:
                    summary.metadata = metadata
                    return summary
                metadata["delimiter"] = "tab" if delimiter == "\t" else delimiter
                rows = itertools.chain([first_data], handle)
                if header and header[0].strip().upper() in {"TIME", "T", "DATE"}:
                    COMSOLAdapter._read_time_series_rows(
                        rows, header, summary, variables, wells, metadata, delimiter
                    )
                elif header:
                    COMSOLAdapter._read_field_rows(
                        rows, header, summary, variables, metadata, delimiter
                    )
                else:
                    COMSOLAdapter._read_matrix_rows(
                        rows, summary, metadata, path, delimiter
                    )
        except (OSError, csv.Error, UnicodeError):
            summary.metadata = metadata
            return summary
        summary.metadata = metadata
        return summary

    @staticmethod
    def _read_time_series_rows(
        rows: Iterable[str],
        header: list[str],
        summary: SimSummary,
        variables: Optional[List[str]],
        wells: Optional[List[str]],
        metadata: dict[str, Any],
        delimiter: str,
    ) -> None:
        allowed = {item.upper() for item in variables or []}
        allowed_wells = {item.upper() for item in wells or []}
        row_count = 0
        stored = 0
        time_name = header[0].strip().upper()
        for raw_line in rows:
            cells = _numeric_cells(raw_line, delimiter)
            if not cells or len(cells) < 2:
                continue
            row_count += 1
            if stored >= _MAX_TIME_SERIES_POINTS:
                continue
            raw_time = cells[0]
            for index, name in enumerate(header[1:], 1):
                if index >= len(cells):
                    break
                upper = name.strip().upper()
                if allowed and upper not in allowed:
                    continue
                if ":" in upper:
                    if allowed_wells and upper.split(":", 1)[1] not in allowed_wells:
                        continue
                    summary.well_vectors.setdefault(upper, []).append((raw_time, cells[index]))
                else:
                    summary.vectors.setdefault(upper, []).append((raw_time, cells[index]))
            stored += 1
        metadata.update(
            {
                "kind": "time_series",
                "time_column": time_name,
                "row_count": row_count,
                "stored_points": stored,
                "truncated": row_count > stored,
            }
        )

    @staticmethod
    def _read_field_rows(
        rows: Iterable[str],
        header: list[str],
        summary: SimSummary,
        variables: Optional[List[str]],
        metadata: dict[str, Any],
        delimiter: str,
    ) -> None:
        coordinate_count = 0
        for name in header:
            if name.strip().upper() in {"X", "Y", "Z", "R"}:
                coordinate_count += 1
            else:
                break
        allowed = {item.upper() for item in variables or []}
        selected_indices = list(range(coordinate_count))
        selected_variables: list[str] = []
        variable_units: list[str] = []
        variable_columns: list[int] = []
        for index, name in enumerate(header[coordinate_count:], coordinate_count):
            if not allowed or name.strip().upper() in allowed:
                selected_indices.append(index)
                selected_variables.append(name.strip())
                unit_match = re.search(r"\s+\(([^()]*)\)\s*$", name)
                variable_units.append(unit_match.group(1) if unit_match else "")
                variable_columns.append(index)
        samples: list[list[Any]] = []
        row_count = 0
        for raw_line in rows:
            cells = _numeric_cells(raw_line, delimiter)
            if not cells:
                continue
            row_count += 1
            if len(samples) < _MAX_FIELD_SAMPLES:
                samples.append([cells[index] if index < len(cells) else None for index in selected_indices])
        summary.fields.append(
            SimFieldTable(
                source_file=str(metadata["source_file"]),
                kind="spatial_point_cloud",
                coordinates=tuple(name.strip() for name in header[:coordinate_count]),
                variables=tuple(selected_variables),
                row_count=row_count,
                column_count=len(selected_indices),
                sample_rows=samples,
                metadata={
                    **metadata,
                    "original_column_count": len(header),
                    "coordinate_columns": list(range(coordinate_count)),
                    "coordinate_unit": metadata.get("Length unit", ""),
                    "variable_columns": variable_columns,
                    "variable_units": variable_units,
                    "sample_strategy": "first_rows",
                    "sample_truncated": row_count > len(samples),
                },
            )
        )
        metadata.update(
            {
                "kind": "spatial_point_cloud",
                "row_count": row_count,
                "column_count": len(header),
                "sample_rows": len(samples),
            }
        )

    @staticmethod
    def _read_matrix_rows(
        rows: Iterable[str],
        summary: SimSummary,
        metadata: dict[str, Any],
        path: Path,
        delimiter: str,
    ) -> None:
        samples: list[list[Any]] = []
        row_count = 0
        column_count = 0
        for raw_line in rows:
            cells = _numeric_cells(raw_line, delimiter)
            if not cells:
                continue
            row_count += 1
            column_count = max(column_count, len(cells))
            if len(samples) < _MAX_FIELD_SAMPLES:
                samples.append(cells)
        summary.fields.append(
            SimFieldTable(
                source_file=path.name,
                kind="headerless_table",
                variables=(),
                row_count=row_count,
                column_count=column_count,
                sample_rows=samples,
                metadata={
                    **metadata,
                    "warnings": [
                        "schema_required: headerless table columns remain unnamed"
                    ],
                    "sample_strategy": "first_rows",
                    "sample_truncated": row_count > len(samples),
                },
            )
        )
        metadata.update(
            {
                "kind": "headerless_table",
                "row_count": row_count,
                "column_count": column_count,
                "sample_rows": len(samples),
            }
        )

    @staticmethod
    def _read_mph(
        path: Path,
        variables: Optional[List[str]],
        metadata: dict[str, Any] | None = None,
    ) -> Optional[SimSummary]:
        summary = SimSummary(metadata=metadata or inspect_mph_metadata(path))
        summary.metadata["native_value_reader"] = (
            "COMSOL values require a separately managed, timeout-bounded JVM worker"
        )
        if variables:
            summary.metadata["requested_native_variables"] = [
                str(item) for item in variables[:100]
            ]
        return summary
