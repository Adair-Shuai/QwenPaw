# -*- coding: utf-8 -*-
"""Small, explicit unit system used by the deterministic kernel."""

from __future__ import annotations

import math

from ..common.errors import DomainError, DomainErrorCode


# Factors map a value to the canonical SI unit for its physical dimension.
# ``_UNIT_KINDS`` adds petroleum-engineering semantics on top of that physical
# dimension so that a generic cubic metre can be used for either liquid or gas
# volumes, while stock-tank barrels remain liquid-only and standard cubic
# feet/metres remain gas-only.
_UNITS: dict[str, tuple[str, float]] = {
    "pa": ("pressure", 1.0),
    "kpa": ("pressure", 1_000.0),
    "mpa": ("pressure", 1_000_000.0),
    "bar": ("pressure", 100_000.0),
    "bara": ("pressure", 100_000.0),
    "psi": ("pressure", 6_894.757293168),
    "psia": ("pressure", 6_894.757293168),
    "m": ("length", 1.0),
    "cm": ("length", 0.01),
    "mm": ("length", 0.001),
    "km": ("length", 1_000.0),
    "ft": ("length", 0.3048),
    "in": ("length", 0.0254),
    "m2": ("area", 1.0),
    "cm2": ("area", 0.0001),
    "ft2": ("area", 0.09290304),
    "km2": ("area", 1_000_000.0),
    "acre": ("area", 4_046.8564224),
    "ha": ("area", 10_000.0),
    "m3": ("volume", 1.0),
    "l": ("volume", 0.001),
    "ft3": ("volume", 0.028316846592),
    "gal_us": ("volume", 0.003785411784),
    "stb": ("volume", 0.158987294928),
    "bbl": ("volume", 0.158987294928),
    "rb": ("volume", 0.158987294928),
    "scf": ("volume", 0.028316846592),
    "mscf": ("volume", 28.316846592),
    "mmscf": ("volume", 28_316.846592),
    "bscf": ("volume", 28_316_846.592),
    "sm3": ("volume", 1.0),
    "ksm3": ("volume", 1_000.0),
    "mmsm3": ("volume", 1_000_000.0),
    "bsm3": ("volume", 1_000_000_000.0),
    "1e8_sm3": ("volume", 100_000_000.0),
    "m3/d": ("rate", 1.0),
    "stb/d": ("rate", 0.158987294928),
    "bbl/d": ("rate", 0.158987294928),
    "ft3/d": ("rate", 0.028316846592),
    "scf/d": ("rate", 0.028316846592),
    "mscf/d": ("rate", 28.316846592),
    "mmscf/d": ("rate", 28_316.846592),
    "sm3/d": ("rate", 1.0),
    "1e4_sm3/d": ("rate", 10_000.0),
    "1/pa": ("compressibility", 1.0),
    "1/kpa": ("compressibility", 1e-3),
    "1/mpa": ("compressibility", 1e-6),
    "1/bar": ("compressibility", 1e-5),
    "1/psi": ("compressibility", 1 / 6_894.757293168),
    "pa/m": ("pressure_gradient", 1.0),
    "psi/ft": ("pressure_gradient", 6_894.757293168 / 0.3048),
    "k": ("temperature", 1.0),
    "c": ("temperature", 1.0),
    "f": ("temperature", 1.0),
    "r": ("temperature", 1.0),
    "scf/stb": ("gor", 1.0),
    "sm3/sm3": ("gor", 0.158987294928 / 0.028316846592),
    "m3/m3": ("gor", 0.158987294928 / 0.028316846592),
}

_GENERIC_KINDS: dict[str, set[str]] = {
    "m3": {"liquid_volume", "gas_volume"},
    "l": {"liquid_volume", "gas_volume"},
    "ft3": {"liquid_volume", "gas_volume"},
    "gal_us": {"liquid_volume"},
    "stb": {"liquid_volume"},
    "bbl": {"liquid_volume"},
    "rb": {"liquid_volume"},
    "scf": {"gas_volume"},
    "mscf": {"gas_volume"},
    "mmscf": {"gas_volume"},
    "bscf": {"gas_volume"},
    "sm3": {"gas_volume"},
    "ksm3": {"gas_volume"},
    "mmsm3": {"gas_volume"},
    "bsm3": {"gas_volume"},
    "1e8_sm3": {"gas_volume"},
    "m3/d": {"liquid_rate", "gas_rate"},
    "stb/d": {"liquid_rate"},
    "bbl/d": {"liquid_rate"},
    "ft3/d": {"liquid_rate", "gas_rate"},
    "scf/d": {"gas_rate"},
    "mscf/d": {"gas_rate"},
    "mmscf/d": {"gas_rate"},
    "sm3/d": {"gas_rate"},
    "1e4_sm3/d": {"gas_rate"},
}

_ALIASES = {
    "m^2": "m2",
    "m²": "m2",
    "ft^2": "ft2",
    "ft²": "ft2",
    "m^3": "m3",
    "m³": "m3",
    "ft^3": "ft3",
    "ft³": "ft3",
    "cuft": "ft3",
    "liter": "l",
    "litre": "l",
    "liters": "l",
    "litres": "l",
    "gallon": "gal_us",
    "gallons": "gal_us",
    "usgal": "gal_us",
    "stdm3": "sm3",
    "stdm^3": "sm3",
    "stdm³": "sm3",
    "sm^3": "sm3",
    "sm³": "sm3",
    "scm": "sm3",
    "kscm": "ksm3",
    "mmscm": "mmsm3",
    "gas_m3": "sm3",
    "gas-m3": "sm3",
    "standardm3": "sm3",
    "standardm^3": "sm3",
    "standardm³": "sm3",
    "1e8sm3": "1e8_sm3",
    "10^8sm3": "1e8_sm3",
    "10⁸sm³": "1e8_sm3",
    "亿方": "1e8_sm3",
    "亿立方米": "1e8_sm3",
    "stbpd": "stb/d",
    "bopd": "stb/d",
    "mscfd": "mscf/d",
    "mmscfd": "mmscf/d",
    "sm3d": "sm3/d",
    "m^3/d": "m3/d",
    "m³/d": "m3/d",
    "ft^3/d": "ft3/d",
    "ft³/d": "ft3/d",
    "sm^3/d": "sm3/d",
    "sm³/d": "sm3/d",
    "1e4sm3/d": "1e4_sm3/d",
    "10^4sm3/d": "1e4_sm3/d",
    "10⁴sm³/d": "1e4_sm3/d",
    "万方/日": "1e4_sm3/d",
    "degf": "f",
    "fahrenheit": "f",
    "°f": "f",
    "ºf": "f",
    "degc": "c",
    "celsius": "c",
    "°c": "c",
    "ºc": "c",
    "kelvin": "k",
    "degk": "k",
    "rankine": "r",
    "degr": "r",
    "°r": "r",
}


def normalize_unit(unit: str) -> str:
    if not isinstance(unit, str) or not unit.strip():
        raise DomainError(DomainErrorCode.INVALID_INPUT, "Unit must be a non-empty string")
    key = unit.strip().lower().replace(" ", "")
    return _ALIASES.get(key, key)


def convert(value: float, from_unit: str, to_unit: str) -> float:
    """Convert a finite scalar between units of the same dimension."""
    try:
        numeric = float(value)
    except (TypeError, ValueError) as exc:
        raise DomainError(DomainErrorCode.INVALID_INPUT, "Unit conversion requires a numeric value") from exc
    if not math.isfinite(numeric):
        raise DomainError(DomainErrorCode.INVALID_INPUT, "Unit conversion requires a finite value")
    source = normalize_unit(from_unit)
    target = normalize_unit(to_unit)
    if source not in _UNITS or target not in _UNITS:
        raise DomainError(DomainErrorCode.INVALID_INPUT, f"Unsupported unit conversion: {from_unit} -> {to_unit}")
    source_dimension, source_factor = _UNITS[source]
    target_dimension, target_factor = _UNITS[target]
    if source_dimension != target_dimension:
        raise DomainError(DomainErrorCode.INVALID_INPUT, f"Incompatible units: {from_unit} and {to_unit}")
    if source_dimension == "temperature":
        kelvin = {
            "k": numeric,
            "c": numeric + 273.15,
            "f": (numeric - 32.0) * 5.0 / 9.0 + 273.15,
            "r": numeric * 5.0 / 9.0,
        }[source]
        if kelvin < 0.0:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "Temperature cannot be below absolute zero")
        result = {
            "k": kelvin,
            "c": kelvin - 273.15,
            "f": (kelvin - 273.15) * 9.0 / 5.0 + 32.0,
            "r": kelvin * 9.0 / 5.0,
        }[target]
        return result if math.isfinite(result) else float("nan")
    return numeric * source_factor / target_factor


def require_unit(unit: str, dimension: str) -> str:
    normalized = normalize_unit(unit)
    if normalized not in _UNITS:
        raise DomainError(DomainErrorCode.INVALID_INPUT, f"Expected a {dimension} unit, got {unit}")
    physical_dimension = _UNITS[normalized][0]
    semantic_kinds = _GENERIC_KINDS.get(normalized, set())
    if physical_dimension != dimension and dimension not in semantic_kinds:
        raise DomainError(DomainErrorCode.INVALID_INPUT, f"Expected a {dimension} unit, got {unit}")
    return normalized
