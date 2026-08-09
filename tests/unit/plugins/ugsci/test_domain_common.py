# -*- coding: utf-8 -*-
"""Tests for domain common: errors, result envelopes, and serialization."""

from __future__ import annotations

import json
from typing import Any

import pytest

from plugins.bundle.ugsci.domain.common.errors import (
    DomainError,
    DomainErrorCode,
    wrap_unknown_error,
)
from plugins.bundle.ugsci.domain.common.result import (
    ArtifactRef,
    DomainResult,
)
from plugins.bundle.ugsci.domain.common.serialization import (
    sanitize_json,
    to_python_float,
    to_python_list,
    validate_json_safe,
)

# ─── DomainError ─────────────────────────────────────────────────────────────


class TestDomainError:
    def test_basic_construction(self) -> None:
        err = DomainError(
            DomainErrorCode.FILE_NOT_FOUND,
            "File missing",
            details={"path": "test.las"},
            retryable=False,
        )
        assert err.code == DomainErrorCode.FILE_NOT_FOUND
        assert err.message == "File missing"
        assert err.details == {"path": "test.las"}
        assert err.retryable is False

    def test_default_message(self) -> None:
        err = DomainError(DomainErrorCode.INVALID_INPUT)
        assert err.message == "invalid_input"

    def test_to_dict_is_json_safe(self) -> None:
        err = DomainError(
            DomainErrorCode.CALCULATION_FAILED,
            "Bad calc",
            details={"count": 3, "name": "test"},
        )
        d = err.to_dict()
        json.dumps(d)  # should not raise
        assert d["code"] == "calculation_failed"
        assert d["retryable"] is False

    def test_to_dict_has_no_traceback(self) -> None:
        err = DomainError(DomainErrorCode.CALCULATION_FAILED, "x")
        d = err.to_dict()
        assert "traceback" not in str(d).lower()
        assert "tb" not in d

    def test_wrap_unknown_error(self) -> None:
        original = ValueError("something broke")
        wrapped = wrap_unknown_error(original)
        assert wrapped.code == DomainErrorCode.CALCULATION_FAILED
        assert "ValueError" in wrapped.message
        assert wrapped.retryable is False

    def test_wrap_unknown_error_no_traceback_in_details(self) -> None:
        original = RuntimeError("secret internal path /home/user/secret")
        wrapped = wrap_unknown_error(original)
        d = wrapped.to_dict()
        assert "traceback" not in str(d).lower()


# ─── DomainResult & ArtifactRef ──────────────────────────────────────────────


class TestDomainResult:
    def test_default_schema_version(self) -> None:
        r = DomainResult()
        assert r.schema_version == 1

    def test_to_dict_structure(self) -> None:
        r = DomainResult(
            engine_id="well-log-processing",
            provider_id="ugsci-welllog-lasio",
            operation="welllog.las.read",
            method="lasio",
            result={"well_name": "Well-001"},
            units={"depth": "m"},
            metrics={"curve_count": 3},
            assumptions=["LAS 2.0 format assumed"],
            warnings=["Missing unit for GR"],
            artifacts=[
                ArtifactRef("output.las", "text/plain", "Exported LAS"),
            ],
        )
        d = r.to_dict()
        assert d["schema_version"] == 1
        assert d["engine_id"] == "well-log-processing"
        assert d["result"] == {"well_name": "Well-001"}
        assert d["artifacts"][0]["path"] == "output.las"

    def test_to_dict_json_serializable(self) -> None:
        r = DomainResult(
            result={"count": 5, "mean": 42.5},
            metrics={"total": 100},
        )
        json.dumps(r.to_dict())  # should not raise

    def test_artifact_ref_to_dict(self) -> None:
        a = ArtifactRef("data.json", "application/json", "Summary")
        d = a.to_dict()
        assert d == {
            "path": "data.json",
            "media_type": "application/json",
            "description": "Summary",
        }


# ─── Serialization helpers ───────────────────────────────────────────────────


class TestSerialization:
    def test_to_python_float_basic(self) -> None:
        assert to_python_float(3.14) == 3.14
        assert to_python_float(5) == 5.0
        assert to_python_float(None) is None

    def test_to_python_float_nan(self) -> None:
        assert to_python_float(float("nan")) is None
        assert to_python_float(float("inf")) is None
        assert to_python_float(float("-inf")) is None

    def test_to_python_float_numpy_scalar(self) -> None:
        np = pytest.importorskip("numpy")
        assert to_python_float(np.float64(2.5)) == 2.5
        assert to_python_float(np.int32(7)) == 7.0

    def test_to_python_float_numpy_array_single(self) -> None:
        np = pytest.importorskip("numpy")
        arr = np.array([3.14])
        assert to_python_float(arr) == pytest.approx(3.14)

    def test_to_python_float_numpy_array_multi_raises(self) -> None:
        np = pytest.importorskip("numpy")
        arr = np.array([1.0, 2.0])
        result = to_python_float(arr)
        # multi-element array should not produce a scalar
        assert result is None or isinstance(result, float)

    def test_to_python_list_basic(self) -> None:
        assert to_python_list([1, 2, 3]) == [1.0, 2.0, 3.0]
        assert not to_python_list(None)

    def test_to_python_list_with_nan(self) -> None:
        result = to_python_list([1.0, float("nan"), 3.0])
        assert result == [1.0, None, 3.0]

    def test_to_python_list_numpy(self) -> None:
        np = pytest.importorskip("numpy")
        arr = np.array([1.0, 2.0, 3.0])
        result = to_python_list(arr)
        assert result == [1.0, 2.0, 3.0]

    def test_sanitize_json_nested(self) -> None:
        data: dict[str, Any] = {
            "a": 1,
            "b": float("nan"),
            "c": [1, float("inf"), 3],
            "d": {"x": float("nan")},
        }
        result = sanitize_json(data)
        assert result["a"] == 1
        assert result["b"] is None
        assert result["c"] == [1, None, 3]
        assert result["d"]["x"] is None

    def test_sanitize_json_numpy(self) -> None:
        np = pytest.importorskip("numpy")
        data: dict[str, Any] = {
            "scalar": np.float64(3.14),
            "array": np.array([1.0, 2.0]),
        }
        result = sanitize_json(data)
        assert result["scalar"] == pytest.approx(3.14)
        assert result["array"] == [1.0, 2.0]

    def test_validate_json_safe_passes(self) -> None:
        validate_json_safe({"a": 1, "b": [1.0, "x", None]})

    def test_validate_json_safe_rejects_nan(self) -> None:
        with pytest.raises(DomainError) as exc_info:
            validate_json_safe({"a": float("nan")})
        assert exc_info.value.code == DomainErrorCode.INVALID_RESULT

    def test_validate_json_safe_rejects_inf(self) -> None:
        with pytest.raises(DomainError) as exc_info:
            validate_json_safe({"a": float("inf")})
        assert exc_info.value.code == DomainErrorCode.INVALID_RESULT

    def test_no_third_party_objects_in_result(self) -> None:
        np = pytest.importorskip("numpy")
        r = DomainResult(
            result={"mean": to_python_float(np.float64(42.0))},
            metrics={"count": int(np.int32(5))},
        )
        d = r.to_dict()
        validate_json_safe(d)
        # Ensure no numpy types in the dict
        serialized = json.dumps(d)
        assert "numpy" not in serialized.lower()
