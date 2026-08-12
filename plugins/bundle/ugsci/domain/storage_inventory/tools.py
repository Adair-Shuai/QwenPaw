# -*- coding: utf-8 -*-
"""Agent-facing tools for deterministic storage-inventory evaluation."""

import json
from typing import Annotated, Any, Literal

from pydantic import Field
from typing_extensions import TypedDict

from ..common.errors import DomainError, DomainErrorCode, wrap_unknown_error
from ..computation.service import ComputationService
from .adapters import (
    EffectiveInventoryAdapter,
    InventoryAccountingAdapter,
    StorageInventoryEvaluationAdapter,
)
from .models import (
    EffectiveInventoryLayerRequest,
    EffectiveInventoryRequest,
    InventoryAccountingRequest,
    StorageInventoryEvaluationRequest,
)

_service = ComputationService()

CycleId = Annotated[str, Field(description="Evaluation-cycle identifier")]
InjectionStateId = Annotated[
    str,
    Field(description="Injection-end equilibrium-state identifier"),
]
EvaluationStateId = Annotated[
    str,
    Field(description="Later production/evaluation equilibrium-state identifier"),
]
GasVolumeUnit = Annotated[
    str,
    Field(
        description="Common standard-gas volume unit for every inventory and gas-volume input"
    ),
]
PressureUnit = Annotated[
    str,
    Field(description="Pressure unit shared by all layer pressure inputs"),
]
PressureBasis = Literal["absolute", "apparent_formation", "report_defined"]
GasRateUnit = Annotated[
    str,
    Field(
        description="Standard-gas daily-rate unit shared by actual and design peak rate"
    ),
]


class EffectiveInventoryLayerInput(TypedDict):
    """Public schema for one layer in the p/Z effective-inventory tools."""

    name: Annotated[str, Field(description="Unique layer or reservoir-unit name")]
    produced_gas: Annotated[
        float, Field(description="Gas produced from injection end to evaluation state")
    ]
    injection_end_pressure: Annotated[
        float,
        Field(description="Average absolute equilibrium pressure at injection end"),
    ]
    injection_end_z: Annotated[
        float, Field(description="Z factor at injection-end pressure and temperature")
    ]
    evaluation_pressure: Annotated[
        float,
        Field(description="Average absolute equilibrium pressure at evaluation state"),
    ]
    evaluation_z: Annotated[
        float, Field(description="Z factor at evaluation pressure and temperature")
    ]


def _chunk(payload: dict[str, Any], *, error: bool = False) -> Any:
    try:
        from agentscope.message import TextBlock, ToolResultState
        from agentscope.tool import ToolChunk
    except Exception:
        return {"error": error, "payload": payload}
    return ToolChunk(
        is_last=True,
        state=ToolResultState.ERROR if error else ToolResultState.SUCCESS,
        content=[
            TextBlock(
                type="text", text=json.dumps(payload, ensure_ascii=False, indent=2)
            )
        ],
    )


def _error(exc: Exception) -> Any:
    if isinstance(exc, DomainError):
        domain_error = exc
    elif isinstance(exc, (TypeError, ValueError, KeyError)):
        domain_error = DomainError(
            DomainErrorCode.INVALID_INPUT, f"Invalid storage inventory input: {exc}"
        )
    else:
        domain_error = wrap_unknown_error(exc)
    return _chunk(domain_error.to_dict(), error=True)


def _layers(
    values: list[EffectiveInventoryLayerInput],
) -> tuple[EffectiveInventoryLayerRequest, ...]:
    return tuple(EffectiveInventoryLayerRequest(**value) for value in values)


def _effective_request(
    layers: list[EffectiveInventoryLayerInput],
    cycle_id: str,
    injection_end_state_id: str,
    evaluation_state_id: str,
    gas_volume_unit: str,
    pressure_unit: str,
    pressure_basis: PressureBasis,
) -> EffectiveInventoryRequest:
    return EffectiveInventoryRequest(
        layers=_layers(layers),
        cycle_id=cycle_id,
        injection_end_state_id=injection_end_state_id,
        evaluation_state_id=evaluation_state_id,
        gas_volume_unit=gas_volume_unit,
        pressure_unit=pressure_unit,
        pressure_basis=pressure_basis,
    )


async def ugsci_storage_inventory_accounting(
    initial_inventory: Annotated[
        float,
        Field(description="Book inventory at the accounting-period start"),
    ],
    cumulative_injected: Annotated[
        float,
        Field(description="Cumulative injected gas over the same accounting period"),
    ],
    cumulative_produced: Annotated[
        float,
        Field(description="Cumulative produced gas over the same accounting period"),
    ],
    gas_volume_unit: GasVolumeUnit = "1e8_sm3",
) -> Any:
    """Calculate book inventory from one consistent metering boundary.

    Args:
        initial_inventory: Book inventory at the accounting-period start.
        cumulative_injected: Cumulative injected gas over the same period.
        cumulative_produced: Cumulative produced gas over the same period.
        gas_volume_unit: Common standard-gas volume unit for all inputs.
    """
    try:
        request = InventoryAccountingRequest(
            initial_inventory,
            cumulative_injected,
            cumulative_produced,
            gas_volume_unit,
        )
        result = _service.execute(
            "storage.inventory.accounting",
            InventoryAccountingAdapter(),
            request,
            method="injection_production_accounting",
        )
        return _chunk(result.to_dict())
    except Exception as exc:  # noqa: BLE001
        return _error(exc)


async def ugsci_storage_effective_inventory(
    layers: list[EffectiveInventoryLayerInput],
    cycle_id: CycleId,
    injection_end_state_id: InjectionStateId,
    evaluation_state_id: EvaluationStateId,
    gas_volume_unit: GasVolumeUnit = "1e8_sm3",
    pressure_unit: PressureUnit = "MPa",
    pressure_basis: Annotated[
        PressureBasis,
        Field(
            description="Explicit pressure basis shared by both states; use apparent_formation for 视地层压力; do not mix or silently convert"
        ),
    ] = "absolute",
) -> Any:
    """Calculate layer-first effective controlled inventory using the p/Z formula.

    Every layer requires: name, produced_gas, injection_end_pressure,
    injection_end_z, evaluation_pressure and evaluation_z.

    Args:
        layers: Layer-specific production, pressure and Z-factor data.
        cycle_id: Evaluation-cycle identifier.
        injection_end_state_id: Injection-end equilibrium-state identifier.
        evaluation_state_id: Later evaluation equilibrium-state identifier.
        gas_volume_unit: Common standard-gas volume unit for every gas volume.
        pressure_unit: Pressure unit shared by every layer.
        pressure_basis: Explicit basis shared by both states; use apparent_formation for 视地层压力.
    """
    try:
        request = _effective_request(
            layers,
            cycle_id,
            injection_end_state_id,
            evaluation_state_id,
            gas_volume_unit,
            pressure_unit,
            pressure_basis,
        )
        result = _service.execute(
            "storage.inventory.effective_controlled",
            EffectiveInventoryAdapter(),
            request,
            method="layered_p_over_z_withdrawal",
        )
        return _chunk(result.to_dict())
    except Exception as exc:  # noqa: BLE001
        return _error(exc)


async def ugsci_storage_inventory_evaluate(
    layers: list[EffectiveInventoryLayerInput],
    cycle_id: CycleId,
    injection_end_state_id: InjectionStateId,
    evaluation_state_id: EvaluationStateId,
    design_capacity: Annotated[
        float,
        Field(description="Approved design total capacity, in gas_volume_unit"),
    ],
    book_inventory: Annotated[
        float | None,
        Field(
            description="Known book inventory; omit when providing all three accounting inputs"
        ),
    ] = None,
    initial_inventory: Annotated[
        float | None,
        Field(
            description="Accounting-period initial inventory; provide with both cumulative totals"
        ),
    ] = None,
    cumulative_injected: Annotated[
        float | None,
        Field(
            description="Period cumulative injected gas; provide with the other accounting inputs"
        ),
    ] = None,
    cumulative_produced: Annotated[
        float | None,
        Field(
            description="Period cumulative produced gas; provide with the other accounting inputs"
        ),
    ] = None,
    working_gas: Annotated[
        float | None,
        Field(
            description="Actual cyclic working gas; provide together with design_working_gas"
        ),
    ] = None,
    design_working_gas: Annotated[
        float | None,
        Field(
            description="Design cyclic working gas; provide together with working_gas"
        ),
    ] = None,
    peak_daily_rate: Annotated[
        float | None,
        Field(
            description="Actual standard-gas peak daily rate; provide with design peak rate"
        ),
    ] = None,
    design_peak_daily_rate: Annotated[
        float | None,
        Field(
            description="Design standard-gas peak daily rate; provide with actual peak rate"
        ),
    ] = None,
    gas_volume_unit: GasVolumeUnit = "1e8_sm3",
    pressure_unit: PressureUnit = "MPa",
    pressure_basis: Annotated[
        PressureBasis,
        Field(
            description="Explicit pressure basis shared by both states; use apparent_formation for 视地层压力; do not mix or silently convert"
        ),
    ] = "absolute",
    daily_rate_unit: GasRateUnit = "1e4_sm3/d",
) -> Any:
    """Evaluate separated book, effective, working-gas and peak-capacity indicators.

    Every layer requires: name, produced_gas, injection_end_pressure,
    injection_end_z, evaluation_pressure and evaluation_z.  This composite
    operation already returns per-layer values, so callers do not need a
    separate effective-inventory call before it.  Provide either a known book
    inventory or all three injection/production accounting inputs.  The
    agent-facing calculation always returns a pending-review result; it cannot
    declare a result reviewed or approved.

    Args:
        layers: Layer-specific production, pressure and Z-factor data.
        cycle_id: Evaluation-cycle identifier.
        injection_end_state_id: Injection-end equilibrium-state identifier.
        evaluation_state_id: Later evaluation equilibrium-state identifier.
        design_capacity: Approved design total capacity in gas_volume_unit.
        book_inventory: Known book inventory; omit when using accounting inputs.
        initial_inventory: Initial inventory; provide with both cumulative totals.
        cumulative_injected: Cumulative injected gas for the accounting period.
        cumulative_produced: Cumulative produced gas for the accounting period.
        working_gas: Actual cyclic working gas; pair with design_working_gas.
        design_working_gas: Design cyclic working gas; pair with working_gas.
        peak_daily_rate: Actual standard-gas peak rate; pair with design peak rate.
        design_peak_daily_rate: Design standard-gas peak daily rate.
        gas_volume_unit: Common standard-gas volume unit for all gas volumes.
        pressure_unit: Pressure unit shared by every layer.
        pressure_basis: Explicit basis shared by both states; use apparent_formation for 视地层压力.
        daily_rate_unit: Standard-gas daily-rate unit for both peak rates.
    """
    try:
        effective = _effective_request(
            layers,
            cycle_id,
            injection_end_state_id,
            evaluation_state_id,
            gas_volume_unit,
            pressure_unit,
            pressure_basis,
        )
        request = StorageInventoryEvaluationRequest(
            effective_inventory=effective,
            design_capacity=design_capacity,
            book_inventory=book_inventory,
            initial_inventory=initial_inventory,
            cumulative_injected=cumulative_injected,
            cumulative_produced=cumulative_produced,
            working_gas=working_gas,
            design_working_gas=design_working_gas,
            peak_daily_rate=peak_daily_rate,
            design_peak_daily_rate=design_peak_daily_rate,
            daily_rate_unit=daily_rate_unit,
        )
        result = _service.execute(
            "storage.inventory.evaluate",
            StorageInventoryEvaluationAdapter(),
            request,
            method="separated_inventory_indicator_workflow",
        )
        return _chunk(result.to_dict())
    except Exception as exc:  # noqa: BLE001
        return _error(exc)


__all__ = [
    "EffectiveInventoryLayerInput",
    "ugsci_storage_effective_inventory",
    "ugsci_storage_inventory_accounting",
    "ugsci_storage_inventory_evaluate",
]
