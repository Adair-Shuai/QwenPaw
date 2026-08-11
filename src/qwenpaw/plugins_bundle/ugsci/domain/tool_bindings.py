# -*- coding: utf-8 -*-
"""Single UGSci source for domain tool implementation bindings."""

from __future__ import annotations

from typing import Any, Callable


def get_domain_tool_bindings() -> dict[str, Callable[..., Any]]:
    from .computation.tools import (
        ugsci_geospatial_points_analyze, ugsci_graph_analyze, ugsci_ml_regression,
        ugsci_queue_simulate, ugsci_statistical_regression, ugsci_symbolic_polynomial_roots,
    )
    from .decline.tools import ugsci_decline_eur, ugsci_decline_fit, ugsci_decline_forecast
    from .deterministic.tools import (
        ugsci_black_oil_pvt, ugsci_conservation_check, ugsci_convert_units,
        ugsci_gas_material_balance, ugsci_nodal_analysis, ugsci_oil_material_balance,
        ugsci_volumetric_oil_in_place, ugsci_vogel_ipr,
    )
    from .stochastic.tools import ugsci_bayesian_normal_estimate, ugsci_multiobjective_quadratic
    from .storage_inventory.tools import (
        ugsci_storage_effective_inventory,
        ugsci_storage_inventory_accounting,
        ugsci_storage_inventory_evaluate,
    )
    from .well_log.tools import ugsci_welllog_export, ugsci_welllog_read, ugsci_welllog_validate
    from .neqsim.tools import (
        ugsci_neqsim_flash, ugsci_neqsim_phase_envelope, ugsci_neqsim_pipeline_flow,
        ugsci_neqsim_process_simulate, ugsci_neqsim_pvt,
    )

    return {
        "ugsci_welllog_read": ugsci_welllog_read,
        "ugsci_welllog_validate": ugsci_welllog_validate,
        "ugsci_welllog_export": ugsci_welllog_export,
        "ugsci_decline_fit": ugsci_decline_fit,
        "ugsci_decline_forecast": ugsci_decline_forecast,
        "ugsci_decline_eur": ugsci_decline_eur,
        "ugsci_convert_units": ugsci_convert_units,
        "ugsci_volumetric_oil_in_place": ugsci_volumetric_oil_in_place,
        "ugsci_oil_material_balance": ugsci_oil_material_balance,
        "ugsci_gas_material_balance": ugsci_gas_material_balance,
        "ugsci_black_oil_pvt": ugsci_black_oil_pvt,
        "ugsci_vogel_ipr": ugsci_vogel_ipr,
        "ugsci_nodal_analysis": ugsci_nodal_analysis,
        "ugsci_conservation_check": ugsci_conservation_check,
        "ugsci_storage_inventory_accounting": ugsci_storage_inventory_accounting,
        "ugsci_storage_effective_inventory": ugsci_storage_effective_inventory,
        "ugsci_storage_inventory_evaluate": ugsci_storage_inventory_evaluate,
        "ugsci_symbolic_polynomial_roots": ugsci_symbolic_polynomial_roots,
        "ugsci_bayesian_normal_estimate": ugsci_bayesian_normal_estimate,
        "ugsci_multiobjective_quadratic": ugsci_multiobjective_quadratic,
        "ugsci_queue_simulate": ugsci_queue_simulate,
        "ugsci_graph_analyze": ugsci_graph_analyze,
        "ugsci_geospatial_points_analyze": ugsci_geospatial_points_analyze,
        "ugsci_ml_regression": ugsci_ml_regression,
        "ugsci_statistical_regression": ugsci_statistical_regression,
        "ugsci_neqsim_flash": ugsci_neqsim_flash,
        "ugsci_neqsim_pvt": ugsci_neqsim_pvt,
        "ugsci_neqsim_phase_envelope": ugsci_neqsim_phase_envelope,
        "ugsci_neqsim_process_simulate": ugsci_neqsim_process_simulate,
        "ugsci_neqsim_pipeline_flow": ugsci_neqsim_pipeline_flow,
    }


__all__ = ["get_domain_tool_bindings"]
