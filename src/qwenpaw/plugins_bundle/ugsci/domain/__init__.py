# -*- coding: utf-8 -*-
"""UGSci domain capability layer.

This package contains thin domain wrappers that expose stable, namespaced
tools to agents without leaking third-party objects (lasio, numpy, scipy)
through the public interface.
"""

from .trace import (
    DerivationTrace,
    FormulaLibrary,
    FormulaSpec,
    TracedResult,
    TraceRecorder,
    TraceStep,
    TraceStepKind,
    VariableBinding,
    VariableSource,
    default_library,
    ugsci_derive_formula,
    ugsci_evaluate_formula,
    ugsci_formula_preview,
    ugsci_list_derivation_formulas,
    ugsci_trace_calculation,
    ugsci_transform_formula,
)

__all__ = [
    "DerivationTrace",
    "FormulaLibrary",
    "FormulaSpec",
    "TracedResult",
    "TraceRecorder",
    "TraceStep",
    "TraceStepKind",
    "VariableBinding",
    "VariableSource",
    "default_library",
    "ugsci_derive_formula",
    "ugsci_evaluate_formula",
    "ugsci_formula_preview",
    "ugsci_list_derivation_formulas",
    "ugsci_trace_calculation",
    "ugsci_transform_formula",
]
