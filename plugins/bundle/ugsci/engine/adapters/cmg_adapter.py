# -*- coding: utf-8 -*-
"""CMG (IMEX / STARS / GEM) reservoir simulator adapter.

Parses:
- ``.out`` — printable output (progress, convergence, warnings)
- ``.irf`` — IRF binary result file (requires ``cmg_io`` or manual parsing)

Currently supports text-based parsing of the ``.out`` file for progress
and warnings.  Binary ``.irf`` parsing requires the CMG Results API
and will be added in a future iteration.
"""
from __future__ import annotations

import re
import csv
import importlib
from pathlib import Path
from typing import Any, List, Optional

from .base import BaseSimAdapter, SimCapabilities, SimProgress, SimSummary, SimWarning


class CMGAdapter(BaseSimAdapter):
    """Adapter for CMG simulators (IMEX, STARS, GEM)."""

    display_name = "CMG"
    deck_extension = ".dat"
    log_extension = ".out"

    def __init__(self, sim_type: str = "imex"):
        self.simulator_id = f"cmg_{sim_type}"
        self._sim_type = sim_type.lower()
        self.display_name = f"CMG {sim_type.upper()}"
        self.capabilities = SimCapabilities(
            supports_progress=True,
            supports_result_reading=True,
            supports_terminal_artifacts=True,
            supports_checkpoint_resume=False,
            # CMG decks have several incompatible solver-control dialects;
            # tuning remains opt-in until a module-specific rule is supplied.
            supports_auto_tune=False,
        )

    def resolve_executable(self, engine: Any) -> str:
        """Select the detected CMG module matching this adapter variant."""
        module_paths = getattr(engine, "module_paths", {}) or {}
        wanted = self._sim_type.upper()
        for name, path in module_paths.items():
            if str(name).upper() == wanted and path:
                return str(path)
        return super().resolve_executable(engine)

    # ------------------------------------------------------------------
    # Command
    # ------------------------------------------------------------------

    def build_command(
        self,
        executable: str,
        deck_file: str,
        output_file: str = "",
    ) -> list[str]:
        cmd = [executable, "-f", deck_file]
        if output_file:
            cmd.extend(["-o", output_file])
        else:
            base = deck_file.rsplit(".", 1)[0]
            cmd.extend(["-o", base + ".out"])
        # Produce the compact CMG log used for frequent progress checks.  The
        # printable ``.out`` file can exceed hundreds of megabytes.
        cmd.append("-log")
        return cmd

    def find_log_file(self, working_dir: str | Path) -> Optional[Path]:
        directory = Path(working_dir)
        if not directory.is_dir():
            return None
        simulation_logs = [
            path
            for path in directory.glob("*.log")
            if path.name.casefold() not in {"cmgjournal.log", "cmgmsg.log"}
        ]
        if simulation_logs:
            return max(simulation_logs, key=lambda path: path.stat().st_mtime)
        outputs = [*directory.glob("*.out"), *directory.glob("*.OUT")]
        return max(outputs, key=lambda path: path.stat().st_mtime) if outputs else None

    # ------------------------------------------------------------------
    # Progress parsing
    # ------------------------------------------------------------------

    _RE_TIME = re.compile(
        r"TIME\s*=\s*([\d.]+)\s*(DAYS|DAY|HOURS|HR)", re.IGNORECASE,
    )
    _RE_DT = re.compile(
        r"\bDT\s*=\s*([\d.eE+\-]+)", re.IGNORECASE,
    )
    _RE_NEWTON = re.compile(
        r"NEWTON\s+ITERATION\s*#?\s*(\d+)", re.IGNORECASE,
    )
    _RE_MBE = re.compile(
        r"MASS\s+BALANCE\s+ERROR\s*=\s*([\d.eE+\-]+)", re.IGNORECASE,
    )
    _RE_TIMESTEP_ROW = re.compile(
        r"^\s*(\d+)[A-Za-z]?\s+([\d.]+)\s+\d+\s+\d+\s+"
        r"([\d.]+)\s+(\d{4}:\d{2}:\d{2})\b",
    )
    _RE_MESSAGE_COUNTS = re.compile(
        r"(\d+)\s+Warning\s+messages?\.\s+(\d+)\s+Error\s+messages?\.",
        re.IGNORECASE,
    )

    def parse_progress(self, working_dir: str | Path) -> SimProgress:
        progress = SimProgress()
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return progress

        log_tail = self._read_log_tail(log_file, 1000)

        # Status
        upper_tail = log_tail[-300:].upper()
        message_counts = list(self._RE_MESSAGE_COUNTS.finditer(log_tail))
        final_error_count = int(message_counts[-1].group(2)) if message_counts else 0
        if final_error_count > 0:
            progress.status = "failed"
        elif re.search(
            r"(?:SIMULATION\s+COMPLETED|END\s+OF\s+SIMULATION|NORMAL\s+TERMINATION)",
            upper_tail,
        ) or re.search(r"^\s*STOP\s*$", upper_tail, re.MULTILINE):
            progress.status = "completed"
        elif re.search(
            r"(?:ABNORMAL\s+TERMINATION|FATAL\s+ERROR|\bFATAL\b)",
            upper_tail,
        ):
            progress.status = "failed"
        else:
            progress.status = "running"

        last_newton = 0
        for line in log_tail.splitlines():
            timestep = self._RE_TIMESTEP_ROW.search(line)
            if timestep:
                progress.current_step = int(timestep.group(1))
                progress.time_step_size = f"{timestep.group(2)} days"
                progress.current_time = f"{timestep.group(3)} days ({timestep.group(4)})"
                continue
            m = self._RE_TIME.search(line)
            if m:
                progress.current_time = f"{m.group(1)} {m.group(2)}"
                progress.current_step += 1

            m_dt = self._RE_DT.search(line)
            if m_dt:
                try:
                    progress.time_step_size = f"{float(m_dt.group(1))}"
                except ValueError:
                    pass

            m_newton = self._RE_NEWTON.search(line)
            if m_newton:
                last_newton = int(m_newton.group(1))

            m_mbe = self._RE_MBE.search(line)
            if m_mbe:
                try:
                    progress.material_balance_error = float(m_mbe.group(1))
                except ValueError:
                    pass

        progress.newton_iterations = last_newton
        return progress

    def parse_warnings(
        self, working_dir: str | Path, limit: int = 20,
    ) -> List[SimWarning]:
        warnings: List[SimWarning] = []
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return warnings

        log_tail = self._read_log_tail(log_file, 5000)
        for i, line in enumerate(log_tail.splitlines(), 1):
            upper = line.upper()
            if "WARNING" in upper:
                warnings.append(SimWarning("warning", i, line.strip()))
            elif "FATAL" in upper or ("ERROR" in upper and "STOP" in upper):
                warnings.append(SimWarning("error", i, line.strip()))
            if len(warnings) >= limit:
                break
        return warnings

    # ------------------------------------------------------------------
    # Result parsing
    # ------------------------------------------------------------------

    def find_summary_file(
        self,
        working_dir: str | Path,
        case_stem: str = "",
    ) -> Optional[Path]:
        """Find .irf or .out result file."""
        working_dir = Path(working_dir)
        for ext in [".sr3", ".irf", ".csv", ".out", ".SR3", ".IRF", ".CSV", ".OUT"]:
            matches = (
                list(working_dir.glob(f"{case_stem}{ext}"))
                if case_stem
                else list(working_dir.glob(f"*{ext}"))
            )
            if matches:
                return max(matches, key=lambda path: path.stat().st_mtime)
        return None

    def read_summary(
        self,
        working_dir: str | Path,
        variables: Optional[List[str]] = None,
        wells: Optional[List[str]] = None,
        case_stem: str = "",
    ) -> SimSummary:
        """Read summary data from CMG output.

        Note: Binary ``.irf`` parsing requires the CMG Results API.
        This implementation parses the text ``.out`` file for
        field-level summary data as a fallback.
        """
        summary = SimSummary()
        result_file = self.find_summary_file(working_dir, case_stem=case_stem)
        if result_file and result_file.suffix.lower() == ".sr3":
            sr3_summary = self._read_sr3_with_h5py(result_file, variables, wells)
            if sr3_summary is not None:
                return sr3_summary
        if result_file and result_file.suffix.lower() == ".irf":
            # The official CMG Results API is optional and proprietary.  Use
            # it when installed, while keeping a deterministic CSV export
            # fallback for headless machines and CI.
            api_summary = self._read_irf_with_optional_api(result_file, variables, wells)
            if api_summary is not None:
                return api_summary
        if result_file and result_file.suffix.lower() == ".csv":
            return self._read_csv_summary(result_file, variables, wells)
        log_file = self.find_log_file(working_dir)
        if not log_file or not log_file.is_file():
            return summary

        try:
            content = log_file.read_text(encoding="utf-8", errors="replace")
        except Exception:
            return summary

        # Parse summary blocks from .out — CMG prints field totals
        # in blocks like:
        #   "FIELD TOTALS"
        #   Time     FOPT     FWPT     FPR  ...
        in_summary = False
        current_time = 0.0

        for line in content.splitlines():
            upper = line.strip().upper()
            if "FIELD TOTALS" in upper or "FIELD RATES" in upper:
                in_summary = True
                continue
            if in_summary:
                fields = line.split()
                if len(fields) < 2:
                    in_summary = False
                    continue
                # Try to parse as data row
                try:
                    current_time = float(fields[0])
                    for j, val_str in enumerate(fields[1:], 1):
                        try:
                            val = float(val_str)
                            # Generic naming — real implementation would
                            # parse column headers
                            key = f"COL{j}"
                            summary.vectors.setdefault(key, []).append(
                                (current_time, val),
                            )
                        except ValueError:
                            pass
                except ValueError:
                    in_summary = False

        return summary

    @staticmethod
    def _decode_strings(values: Any) -> list[str]:
        decoded: list[str] = []
        for value in values:
            if isinstance(value, bytes):
                decoded.append(value.decode("utf-8", errors="replace").rstrip("\x00 "))
            else:
                decoded.append(str(value).rstrip("\x00 "))
        return decoded

    @classmethod
    def _read_sr3_with_h5py(
        cls,
        path: Path,
        variables: Optional[List[str]],
        wells: Optional[List[str]],
    ) -> Optional[SimSummary]:
        """Read CMG SR3 time-series directly from its HDF5 container."""
        try:
            h5py = importlib.import_module("h5py")
        except ImportError:
            return None
        summary = SimSummary()
        allowed = {item.upper() for item in variables or []}
        requested_wells = {item.upper() for item in wells or []}
        field_aliases = {
            ("PRO", "OILRATSC"): "FOPR",
            ("PRO", "WATRATSC"): "FWPR",
            ("PRO", "GASRATSC"): "FGPR",
            ("PRO", "OILVOLSC"): "FOPT",
            ("PRO", "WATVOLSC"): "FWPT",
            ("PRO", "GASVOLSC"): "FGPT",
            ("INJ", "WATRATSC"): "FWIR",
            ("INJ", "GASRATSC"): "FGIR",
            ("INJ", "WATVOLSC"): "FWIT",
            ("INJ", "GASVOLSC"): "FGIT",
        }
        well_aliases = {
            "OILRATSC": "WOPR",
            "WATRATSC": "WWPR",
            "GASRATSC": "WGPR",
            "BHP": "WBHP",
        }
        try:
            with h5py.File(path, "r") as handle:
                master = handle["General/MasterTimeTable"][:]
                offsets = {int(row["Index"]): float(row["Offset in days"]) for row in master}
                dates = {int(row["Index"]): float(row["Date"]) for row in master}

                groups = handle["TimeSeries/GROUPS"]
                group_variables = cls._decode_strings(groups["Variables"][:])
                group_origins = cls._decode_strings(groups["Origins"][:])
                group_steps = [int(value) for value in groups["Timesteps"][:]]
                summary.dates = [cls._format_sr3_date(dates.get(step)) for step in group_steps]
                for origin_index, origin in enumerate(group_origins):
                    role = "PRO" if "PRO" in origin.upper() else "INJ" if "INJ" in origin.upper() else ""
                    if not role:
                        continue
                    for variable_index, raw_name in enumerate(group_variables):
                        alias = field_aliases.get((role, raw_name.upper()))
                        if not alias or (allowed and alias not in allowed and raw_name.upper() not in allowed):
                            continue
                        values = groups["Data"][:, variable_index, origin_index]
                        summary.vectors[alias] = [
                            (offsets.get(step, float(index)), float(value))
                            for index, (step, value) in enumerate(zip(group_steps, values), 1)
                        ]

                # Loading all wells from a multi-gigabyte SR3 can consume
                # hundreds of MB in Python objects.  Read only explicitly
                # requested wells; field summaries remain available by default.
                if requested_wells:
                    well_group = handle["TimeSeries/WELLS"]
                    well_variables = cls._decode_strings(well_group["Variables"][:])
                    well_origins = cls._decode_strings(well_group["Origins"][:])
                    well_steps = [int(value) for value in well_group["Timesteps"][:]]
                    for origin_index, origin in enumerate(well_origins):
                        if origin.upper() not in requested_wells:
                            continue
                        for variable_index, raw_name in enumerate(well_variables):
                            alias = well_aliases.get(raw_name.upper())
                            if not alias or (allowed and alias not in allowed and raw_name.upper() not in allowed):
                                continue
                            values = well_group["Data"][:, variable_index, origin_index]
                            summary.well_vectors[f"{alias}:{origin}"] = [
                                (offsets.get(step, float(index)), float(value))
                                for index, (step, value) in enumerate(zip(well_steps, values), 1)
                            ]
            return summary
        except (OSError, KeyError, TypeError, ValueError):
            return None

    @staticmethod
    def _format_sr3_date(value: Optional[float]) -> str:
        if value is None:
            return ""
        digits = f"{int(value):08d}"
        return f"{digits[:4]}-{digits[4:6]}-{digits[6:8]}"

    @staticmethod
    def _read_csv_summary(
        path: Path,
        variables: Optional[List[str]],
        wells: Optional[List[str]],
    ) -> SimSummary:
        summary = SimSummary()
        try:
            with path.open("r", encoding="utf-8-sig", newline="") as handle:
                rows = list(csv.DictReader(handle))
        except (OSError, csv.Error):
            return summary
        if not rows:
            return summary
        allowed = {item.upper() for item in variables or []}
        allowed_wells = {item.upper() for item in wells or []}
        for index, row in enumerate(rows, 1):
            time_value = row.get("TIME") or row.get("DAYS") or row.get("DATE") or str(index)
            try:
                numeric_time = float(time_value)
            except (TypeError, ValueError):
                numeric_time = float(index)
                summary.dates.append(str(time_value))
            for name, raw in row.items():
                if not name or name.upper() in {"TIME", "DAYS", "DATE"}:
                    continue
                try:
                    value = float(raw)
                except (TypeError, ValueError):
                    continue
                upper = name.upper()
                if allowed and upper not in allowed:
                    continue
                if ":" in upper:
                    if allowed_wells and upper.split(":", 1)[1] not in allowed_wells:
                        continue
                    summary.well_vectors.setdefault(upper, []).append((numeric_time, value))
                else:
                    summary.vectors.setdefault(upper, []).append((numeric_time, value))
        return summary

    @staticmethod
    def _read_irf_with_optional_api(
        path: Path,
        variables: Optional[List[str]],
        wells: Optional[List[str]],
    ) -> Optional[SimSummary]:
        for module_name in ("cmg_io", "cmgresults"):
            try:
                module = importlib.import_module(module_name)
            except ImportError:
                continue
            reader = getattr(module, "read_irf", None) or getattr(module, "read_summary", None)
            if not callable(reader):
                continue
            try:
                payload = reader(str(path), variables=variables, wells=wells)
            except TypeError:
                try:
                    payload = reader(str(path))
                except Exception:
                    continue
            except Exception:
                continue
            if isinstance(payload, SimSummary):
                return payload
            if isinstance(payload, dict):
                return SimSummary(
                    vectors=dict(payload.get("vectors") or {}),
                    well_vectors=dict(payload.get("well_vectors") or {}),
                    dates=list(payload.get("dates") or []),
                )
        return None
