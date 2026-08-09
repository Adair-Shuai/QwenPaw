# -*- coding: utf-8 -*-
"""LasioAdapter — read and export LAS files via the ``lasio`` library.

All ``import lasio`` and ``import numpy`` calls are deferred to method
bodies so that the module can be imported even when lasio is not
installed.  The adapter converts all third-party objects to UGSci
domain models before returning.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from ...common.errors import DomainError, DomainErrorCode
from ...common.result import ArtifactRef
from ...common.serialization import to_python_float, to_python_list
from ..models import LogCurve, WellLogDataset, WellMetadata
from ..ports import DependencyStatus, WellLogExportRequest, WellLogReadRequest

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.domain.well_log.lasio")

PROVIDER_ID = "ugsci-welllog-lasio"


class LasioAdapter:
    """Well log engine adapter backed by ``lasio``."""

    provider_id = PROVIDER_ID

    def dependency_status(self) -> DependencyStatus:
        """Check whether ``lasio`` is importable."""
        import importlib.util

        spec = importlib.util.find_spec("lasio")
        if spec is not None:
            return DependencyStatus(available=True)
        return DependencyStatus(
            available=False,
            reason="lasio package not found",
        )

    def read(self, request: WellLogReadRequest) -> WellLogDataset:
        """Read a LAS file and return a ``WellLogDataset``."""
        try:
            import lasio
        except ImportError as exc:
            raise DomainError(
                DomainErrorCode.DEPENDENCY_UNAVAILABLE,
                "lasio is not installed",
                details={"provider": PROVIDER_ID},
            ) from exc

        file_path = Path(request.path)

        # Check extension before existence — unsupported formats should
        # be rejected regardless of whether the file exists.
        if file_path.suffix.lower() != ".las":
            raise DomainError(
                DomainErrorCode.UNSUPPORTED_FORMAT,
                f"Unsupported file extension: {file_path.suffix}",
            )

        if not file_path.exists():
            raise DomainError(
                DomainErrorCode.FILE_NOT_FOUND,
                f"LAS file not found: {request.path}",
            )

        # Read with optional encoding
        read_kwargs: dict[str, Any] = {}
        if request.encoding:
            read_kwargs["encoding"] = request.encoding

        try:
            las = lasio.read(str(file_path), **read_kwargs)
        except Exception as exc:
            raise DomainError(
                DomainErrorCode.CALCULATION_FAILED,
                f"Failed to read LAS file: {type(exc).__name__}: {exc}",
            ) from exc

        warnings: list[str] = []

        # Extract well metadata
        metadata = self._extract_metadata(las, warnings)

        # Identify depth curve mnemonic (from first curve, not index_unit)
        depth_mnemonic = "DEPT"
        depth_values: list[float | None] = []
        curves: list[LogCurve] = []

        try:
            if las.curves:
                depth_mnemonic = str(las.curves[0].mnemonic) or "DEPT"
        except Exception:
            pass

        # Extract depth array
        try:
            depth_values = to_python_list(las.index)
        except Exception as exc:
            warnings.append(f"Failed to extract depth array: {exc}")
            depth_values = []

        # Extract curves (skip the depth/index curve)
        try:
            index_curve_mnemonics = set()
            # lasio stores index as first curve
            if las.curves:
                index_curve_mnemonics.add(las.curves[0].mnemonic.upper())
        except Exception:
            pass

        for curve in las.curves:
            try:
                mnem = curve.mnemonic
                if mnem.upper() in index_curve_mnemonics:
                    continue
                unit = str(curve.unit or "")
                descr = str(curve.descr or "")
                values = to_python_list(curve.data)
                curves.append(LogCurve(mnemonic=mnem, unit=unit, description=descr, values=values))
            except Exception as exc:
                warnings.append(f"Failed to extract curve {getattr(curve, 'mnemonic', '?')}: {exc}")

        # NULL value
        null_value: float | None = None
        try:
            null_value = to_python_float(las.null)
        except Exception:
            pass

        return WellLogDataset(
            metadata=metadata,
            depth_mnemonic=depth_mnemonic,
            depth=depth_values,
            curves=curves,
            source_path=str(file_path),
            null_value=null_value,
            warnings=warnings,
        )

    def export(self, request: WellLogExportRequest) -> ArtifactRef:
        """Read an input LAS and write a normalised copy to a new file."""
        try:
            import lasio
        except ImportError as exc:
            raise DomainError(
                DomainErrorCode.DEPENDENCY_UNAVAILABLE,
                "lasio is not installed",
                details={"provider": PROVIDER_ID},
            ) from exc

        input_path = Path(request.input_path).resolve()
        output_path = Path(request.output_path).resolve()

        # Prevent in-place overwrite
        if input_path == output_path:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "Output path must differ from input path",
            )

        if not input_path.exists():
            raise DomainError(
                DomainErrorCode.FILE_NOT_FOUND,
                f"Input LAS file not found: {request.input_path}",
            )

        if output_path.suffix.lower() != ".las":
            raise DomainError(
                DomainErrorCode.UNSUPPORTED_FORMAT,
                "Output must be a .las file",
            )

        read_kwargs: dict[str, Any] = {}
        if request.encoding:
            read_kwargs["encoding"] = request.encoding

        try:
            las = lasio.read(str(input_path), **read_kwargs)
        except Exception as exc:
            raise DomainError(
                DomainErrorCode.CALCULATION_FAILED,
                f"Failed to read input LAS: {type(exc).__name__}: {exc}",
            ) from exc

        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            las.write(str(output_path))
        except Exception as exc:
            raise DomainError(
                DomainErrorCode.CALCULATION_FAILED,
                f"Failed to write LAS file: {type(exc).__name__}: {exc}",
            ) from exc

        return ArtifactRef(
            path=request.output_path,
            media_type="text/plain",
            description=f"LAS file exported from {input_path.name}",
        )

    @staticmethod
    def _extract_metadata(las: Any, warnings: list[str]) -> WellMetadata:
        """Extract well header fields from a lasio LASFile object."""
        def _get_header(section: str, key: str) -> str:
            try:
                items = getattr(las, section, {})
                if key in items:
                    return str(items[key].value)
            except Exception:
                pass
            return ""

        well_name = _get_header("well", "WELL")
        uwi = _get_header("well", "UWI")
        field_name = _get_header("well", "FLD")
        company = _get_header("well", "COMP")

        start_depth = None
        stop_depth = None
        step = None
        depth_unit = ""

        try:
            start_depth = to_python_float(las.index_min)
            stop_depth = to_python_float(las.index_max)
        except Exception:
            pass

        try:
            depth_unit = str(las.index_unit or "")
        except Exception:
            pass

        try:
            # Try to get step from well header
            step_str = _get_header("well", "STEP")
            if step_str:
                step = to_python_float(step_str)
        except Exception:
            pass

        return WellMetadata(
            well_name=well_name,
            uwi=uwi,
            field=field_name,
            company=company,
            start_depth=start_depth,
            stop_depth=stop_depth,
            step=step,
            depth_unit=depth_unit,
        )
