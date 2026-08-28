# -*- coding: utf-8 -*-
"""Observable, step-traceable UGS calculations.

Public surface: the trace data model, the ``TraceRecorder`` builder, the
curated formula library, and the agent-facing trace tools.
"""

from .library import FormulaLibrary, FormulaSpec, default_library
from .models import (
    DerivationTrace,
    TraceStep,
    TraceStepGroup,
    TraceStepKind,
    TracedResult,
    VariableBinding,
    VariableSource,
)
from .recorder import TraceRecorder
from .tools import ugsci_list_derivation_formulas, ugsci_trace_calculation
from .library.material_balance import GAS_PZ_FORMULA, FORMULA_ID as GAS_PZ_FORMULA_ID
from .freeform.tools import (
    ugsci_derive_formula,
    ugsci_evaluate_formula,
    ugsci_formula_preview,
    ugsci_transform_formula,
)

__all__ = [
    "DerivationTrace",
    "FormulaLibrary",
    "FormulaSpec",
    "TraceRecorder",
    "TraceStep",
    "TraceStepGroup",
    "TraceStepKind",
    "TracedResult",
    "VariableBinding",
    "VariableSource",
    "default_library",
    "ugsci_list_derivation_formulas",
    "ugsci_trace_calculation",
    "ugsci_derive_formula",
    "ugsci_evaluate_formula",
    "ugsci_formula_preview",
    "ugsci_transform_formula",
    "GAS_PZ_FORMULA",
    "GAS_PZ_FORMULA_ID",
]
