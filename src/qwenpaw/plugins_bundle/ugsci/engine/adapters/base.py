# -*- coding: utf-8 -*-
"""Abstract base class for all simulator adapters."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, List, Optional


@dataclass(frozen=True)
class SimCapabilities:
    """Capabilities exposed by an adapter to the common runtime.

    The process lifecycle is shared by every simulator.  These flags keep
    simulator-specific limits in the adapter instead of scattering checks
    throughout the launcher, monitor, and terminal orchestration code.
    """

    supports_progress: bool = True
    supports_result_reading: bool = False
    supports_terminal_artifacts: bool = False
    supports_checkpoint_resume: bool = False
    supports_auto_tune: bool = False
    supports_input_inspection: bool = False
    tuning_keywords: tuple[str, ...] = ()


@dataclass
class SimProgress:
    """Parsed progress information from a running or finished simulation."""

    status: str = "unknown"  # running | completed | failed | unknown
    current_time: str = ""  # e.g. "01-JAN-2025" or "365 days"
    target_time: str = ""
    current_step: int = 0  # current time-step number
    total_steps: Optional[int] = None
    newton_iterations: int = 0  # Newton iterations in the last time-step
    material_balance_error: Optional[float] = None
    cfl_number: Optional[float] = None
    time_step_size: Optional[str] = None  # e.g. "1.0 days"


@dataclass
class SimSummary:
    """Summary vector data extracted from simulation results."""

    # Field-level (FOPR, FPR, etc.) — list of (time, value) tuples
    vectors: dict[str, list[tuple[float, float]]] = field(default_factory=dict)
    # Well-level (WOPR:name, WWPR:name, etc.)
    well_vectors: dict[str, list[tuple[float, float]]] = field(default_factory=dict)
    # Simulation dates
    dates: list[str] = field(default_factory=list)
    # Spatial/table exports are kept separate from time-series vectors.
    fields: list["SimFieldTable"] = field(default_factory=list)
    # Format-specific metadata (version, solved state, external dependencies).
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class SimFieldTable:
    """Bounded description of a spatial/table result export."""

    source_file: str
    kind: str
    coordinates: tuple[str, ...] = ()
    variables: tuple[str, ...] = ()
    row_count: int = 0
    column_count: int = 0
    sample_rows: list[list[Any]] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class SimWarning:
    """A single warning or error line from the simulation log."""

    level: str  # "warning" | "error" | "info"
    line_number: int = 0
    message: str = ""


class BaseSimAdapter:
    """Base class — subclasses implement simulator-specific parsing."""

    #: Unique identifier (e.g. ``"eclipse"``, ``"cmg_imex"``)
    simulator_id: str = ""
    #: Human-readable name
    display_name: str = ""
    #: File extension for the main input/deck file
    deck_extension: str = ""
    #: File extension for the printable log output
    log_extension: str = ""
    capabilities = SimCapabilities()

    def resolve_executable(self, engine: Any) -> str:
        """Resolve the executable for this simulator variant.

        Most engines expose one executable path.  Multi-module products such
        as CMG override this hook to select the executable matching the
        adapter variant (IMEX/STARS/GEM).
        """
        return str(getattr(engine, "executable_path", "") or "")

    def tuning_rules(self) -> dict[str, tuple[int, int, Any]]:
        """Return safe text-deck tuning rules for this simulator variant."""
        return {}

    def inspect_input(self, deck_file: str | Path) -> dict[str, Any]:
        """Return bounded, JSON-safe preflight metadata for an input model."""
        return {}

    def infer_terminal_status(
        self,
        working_dir: str | Path,
        *,
        start_ts: float = 0.0,
        case_stem: str = "",
    ) -> tuple[str | None, int | None, str | None]:
        """Infer a terminal state from current simulator artifacts.

        The common runtime uses this only after the process handle is lost.
        Adapters may override it when a simulator has a dedicated completion
        marker (for example ``.ECLEND``) in addition to its log file.
        """
        log_file = self.find_log_file(working_dir)
        if log_file is None:
            return (None, None, None)
        if start_ts > 0:
            try:
                if log_file.stat().st_mtime + 2.0 < start_ts:
                    return (None, None, None)
            except OSError:
                return (None, None, None)
        progress = self.parse_progress(working_dir)
        if progress.status == "completed":
            return ("completed", 0, None)
        if progress.status == "failed":
            return ("failed", None, "simulator log reports a failed terminal state")
        return (None, None, None)

    # ------------------------------------------------------------------
    # Command building
    # ------------------------------------------------------------------

    def build_command(
        self,
        executable: str,
        deck_file: str,
        output_file: str = "",
    ) -> list[str]:
        """Build the shell command to launch the simulator.

        Args:
            executable: Path to the simulator executable.
            deck_file: Path to the input/deck file.
            output_file: Optional output file path.

        Returns:
            List of command tokens (for ``subprocess`` / ``create_subprocess_exec``).
        """
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Log parsing
    # ------------------------------------------------------------------

    def find_log_file(self, working_dir: str | Path) -> Optional[Path]:
        """Locate the simulation log file in *working_dir*."""
        working_dir = Path(working_dir)
        if not working_dir.is_dir():
            return None
        pattern = f"*{self.log_extension}"
        matches = sorted(working_dir.glob(pattern), key=lambda p: p.stat().st_mtime, reverse=True)
        return matches[0] if matches else None

    def parse_progress(self, working_dir: str | Path) -> SimProgress:
        """Parse current progress from the simulation log.

        Returns a :class:`SimProgress` with whatever information could be
        extracted.  Fields that cannot be determined remain at their
        defaults.
        """
        raise NotImplementedError

    def parse_warnings(
        self,
        working_dir: str | Path,
        limit: int = 20,
    ) -> List[SimWarning]:
        """Extract recent warnings/errors from the log file."""
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Result parsing
    # ------------------------------------------------------------------

    def find_summary_file(
        self,
        working_dir: str | Path,
        case_stem: str = "",
    ) -> Optional[Path]:
        """Locate the summary / output file in *working_dir*."""
        raise NotImplementedError

    def read_summary(
        self,
        working_dir: str | Path,
        variables: Optional[List[str]] = None,
        wells: Optional[List[str]] = None,
        case_stem: str = "",
    ) -> SimSummary:
        """Read summary vector data from simulation results.

        Args:
            working_dir: Directory containing result files.
            variables: List of variable names to extract (e.g. FOPR, FPR).
                None = extract all available.
            wells: List of well names for well-level data.
                None = extract all available.
        """
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Deck editing helpers
    # ------------------------------------------------------------------

    def locate_keyword(
        self,
        deck_path: str | Path,
        keyword: str,
    ) -> Optional[tuple[int, int]]:
        """Find the line range of *keyword* in the deck file.

        Returns ``(start_line, end_line)`` (0-based, inclusive start,
        exclusive end) or ``None`` if not found.
        """
        deck_path = Path(deck_path)
        if not deck_path.is_file():
            return None
        keyword_upper = keyword.upper().strip()
        lines = deck_path.read_text(encoding="utf-8", errors="replace").splitlines()
        start = None
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped.upper() == keyword_upper:
                start = i
                continue
            if start is not None:
                # End of keyword: next keyword (all-caps word) or "/" alone
                if stripped == "/" or (
                    stripped and stripped.split()[0].isupper()
                    and not stripped.startswith("--")
                    and not stripped.startswith("'")
                    and not stripped.startswith('"')
                ):
                    return (start, i)
        if start is not None:
            return (start, len(lines))
        return None

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------

    @staticmethod
    def _read_log_tail(log_path: Path, n_lines: int = 500) -> str:
        """Read the last *n_lines* lines of a log file (for quick status)."""
        if not log_path or not log_path.is_file():
            return ""
        try:
            # Simulator logs can be hundreds of megabytes.  Read a bounded
            # tail instead of loading the full file for every monitoring tick.
            with log_path.open("rb") as handle:
                size = handle.seek(0, 2)
                handle.seek(max(0, size - 2 * 1024 * 1024))
                content = handle.read().decode("utf-8", errors="replace")
            lines = content.splitlines()
            return "\n".join(lines[-n_lines:]) if len(lines) > n_lines else content
        except Exception:
            return ""

    @staticmethod
    def _read_log_full(log_path: Path) -> str:
        """Read the entire log file."""
        if not log_path or not log_path.is_file():
            return ""
        try:
            return log_path.read_text(encoding="utf-8", errors="replace")
        except Exception:
            return ""
