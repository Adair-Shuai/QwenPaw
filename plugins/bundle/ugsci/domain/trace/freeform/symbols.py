# -*- coding: utf-8 -*-
"""Symbol allowlist and unit inference (design §7).

Symbols are **explicit** when the agent supplies them (the ``symbols`` /
``inputs`` dicts).  When a symbol is *not* supplied, the engine **infers**
a unit by name lookup in a small built-in table and records the inference
in ``provenance``.  Unknown-name symbols carry unit ``""`` and are marked
``unit_unknown``.
"""

from __future__ import annotations

import re
from typing import Any

# ── Built-in name → unit inference table (§7) ──────────────────────────────
# Keys are lowercased symbol or alias patterns.  A reservoir engineer should
# review this table; a wrong inference is worse than a "unit unknown" flag.
_UNIT_INFER: dict[str, str] = {
    "p": "psi",
    "pres": "psi",
    "pressure": "psi",
    "pf": "psi",
    "p_i": "psi",
    "p_cur": "psi",
    "q": "stb/d",
    "qg": "mscf/d",
    "q_oil": "stb/d",
    "q_gas": "mscf/d",
    "g_p": "scf",
    "gp": "scf",
    "ogip": "scf",
    "g": "scf",
    "v": "m3",
    "volume": "m3",
    "temp": "k",
    "temperature": "k",
    "z": "",
    "zi": "",
    "z_i": "",
    "k": "md",
    "perm": "md",
    "permeability": "md",
    "phi": "",
    "porosity": "",
    "sw": "",
    "water_saturation": "",
    "so": "",
    "oil_saturation": "",
    "sg": "",
    "gas_saturation": "",
    "bo": "rb/stb",
    "b_o": "rb/stb",
    "bg": "rb/scf",
    "b_g": "rb/scf",
    "rs": "scf/stb",
    "gor": "scf/stb",
    "co": "1/psi",
    "cw": "1/psi",
    "cf": "1/psi",
    "ct": "1/psi",
    "h": "m",
    "net_pay": "m",
    "area": "m2",
    "a": "m2",
    "wgr": "",
    "cgr": "stb/mmscf",
    "re": "m",
    "rw": "m",
    "skin": "",
    "s": "",
    "dp": "psi",
    "delta_p": "psi",
    "j": "stb/d/psi",
    "aof": "mscf/d",
    "q_abs": "mscf/d",
    "c": "1/psi",
    "cv": "sm3",
    "g_cycled": "sm3",
    "g_working": "sm3",
    "cushion": "sm3",
    "cushion_fraction": "",
    "ooip": "stb",
    "stoiip": "stb",
    "rf": "",
    "recovery_factor": "",
    "eur": "stb",
    "b_gi": "rb/scf",
    "b_w": "rb/stb",
    "we": "rb",
    "w_p": "stb",
    "w_e": "bbl",
    "w_i": "bbl",
    "w_inj": "bbl",
    "f_w": "stb/d",
    "wor": "",
    "wcut": "",
    "rv": "stb/mmscf",
    "b": "rb/stb",
    "mu": "cp",
    "mu_o": "cp",
    "mu_w": "cp",
    "mu_g": "cp",
    "rho": "kg/m3",
    "rho_o": "kg/m3",
    "rho_w": "kg/m3",
    "rho_g": "kg/m3",
    "s_g": "",
    "s_o": "",
    "s_w": "",
    "s_wi": "",
    "s_oi": "",
    "s_or": "",
    "s_gr": "",
    "p_b": "psi",
    "p_d": "psi",
    "p_ws": "psi",
    "p_wf": "psi",
    "p_res": "psi",
    "p_r": "psi",
    "p_e": "psi",
    "delta_t": "d",
    "time": "d",
    "r": "m",
    "l": "m",
    "d": "m",
    "diameter": "m",
    "k_h": "md*m",
    "kh": "md*m",
    "pseudopressure": "psi2/cp",
    "m_p": "psi2/cp",
}


def _normalize_name(name: str) -> str:
    """Lowercase and strip common separators for name lookup."""
    return name.strip().lower().replace("-", "_").replace(" ", "")


def infer_unit(name: str) -> tuple[str, bool]:
    """Infer a unit for a symbol by name lookup.

    Returns ``(unit, inferred)`` where ``inferred`` is True if the unit
    was looked up (not explicitly supplied).
    """
    key = _normalize_name(name)
    if key in _UNIT_INFER:
        return _UNIT_INFER[key], True
    # Match complete underscore-delimited tokens for compound names such as
    # ``initial_pressure``.  Raw substring matching makes one-letter aliases
    # (``n``, ``p``, ``q``) incorrectly classify almost every unknown name.
    for pattern, unit in sorted(_UNIT_INFER.items(), key=lambda item: len(item[0]), reverse=True):
        if pattern and re.search(rf"(?:^|_){re.escape(pattern)}(?:_|$)", key):
            return unit, True
    return "", False  # unit_unknown


def build_symbol_table(
    explicit: dict[str, str],
    *,
    expr_symbols: set[str] | None = None,
) -> dict[str, dict[str, Any]]:
    """Merge explicit symbol units with inferred ones.

    Returns a dict ``name -> {unit, inferred, source}`` for every symbol
    in ``explicit`` plus every symbol in ``expr_symbols`` (the free symbols
    extracted from the parsed SymPy expression).
    """
    table: dict[str, dict[str, Any]] = {}
    # Explicit takes priority.
    for name, unit in explicit.items():
        table[name] = {
            "unit": unit,
            "inferred": False,
            "source": "explicit",
        }
    # Infer for any expression symbols not explicitly supplied.
    for name in expr_symbols or set():
        if name in table:
            continue
        unit, inferred = infer_unit(name)
        table[name] = {
            "unit": unit,
            "inferred": inferred,
            "source": "inferred" if inferred else "unit_unknown",
        }
    return table


def unit_unknown_symbols(table: dict[str, dict[str, Any]]) -> list[str]:
    """Return the names whose unit could not be inferred."""
    return [
        name for name, info in table.items()
        if info.get("source") == "unit_unknown"
    ]


def inferred_symbols(table: dict[str, dict[str, Any]]) -> list[str]:
    """Return the names whose unit was inferred (not explicit)."""
    return [
        name for name, info in table.items()
        if info.get("inferred") is True
    ]


__all__ = [
    "build_symbol_table",
    "infer_unit",
    "inferred_symbols",
    "unit_unknown_symbols",
]
