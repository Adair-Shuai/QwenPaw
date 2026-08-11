# -*- coding: utf-8 -*-
"""Capability-to-provider registry for UGSci calculations."""

from __future__ import annotations

import importlib.util
from dataclasses import dataclass
from typing import Any, Callable, Literal

from ..common.errors import DomainError, DomainErrorCode

ExecutionClass = Literal["deterministic", "stochastic", "external"]


@dataclass(frozen=True)
class ProviderSpec:
    capability_id: str
    provider_id: str
    factory: Callable[[], Any]
    execution_class: ExecutionClass = "deterministic"
    priority: int = 100
    dependency_package: str | None = None
    version: str = "1.0.0"

    def available(self) -> bool:
        return not self.dependency_package or importlib.util.find_spec(self.dependency_package) is not None


@dataclass(frozen=True)
class SupportLibrarySpec:
    package: str
    purpose: str
    optional: bool = True

    def available(self) -> bool:
        return importlib.util.find_spec(self.package) is not None


class CapabilityProviderRegistry:
    """Resolve a stable business capability to an available implementation."""

    def __init__(self) -> None:
        self._providers: dict[str, list[ProviderSpec]] = {}
        self._support_libraries: dict[str, SupportLibrarySpec] = {}

    def register(self, spec: ProviderSpec) -> None:
        providers = self._providers.setdefault(spec.capability_id, [])
        if any(item.provider_id == spec.provider_id for item in providers):
            raise ValueError(f"Duplicate provider: {spec.capability_id}/{spec.provider_id}")
        providers.append(spec)
        providers.sort(key=lambda item: item.priority)

    def register_support_library(self, spec: SupportLibrarySpec) -> None:
        existing = self._support_libraries.get(spec.package)
        if existing and existing != spec:
            raise ValueError(f"Duplicate support library: {spec.package}")
        self._support_libraries[spec.package] = spec

    def resolve(self, capability_id: str, *, execution_class: ExecutionClass = "deterministic") -> Any:
        candidates = [
            item
            for item in self._providers.get(capability_id, [])
            if item.execution_class == execution_class and item.available()
        ]
        if not candidates:
            known = self._providers.get(capability_id, [])
            if not known:
                raise DomainError(DomainErrorCode.UNSUPPORTED_OPERATION, f"No provider registered for {capability_id}")
            dependency = next((item.dependency_package for item in known if item.dependency_package), None)
            code = DomainErrorCode.DEPENDENCY_UNAVAILABLE if dependency else DomainErrorCode.ENGINE_UNAVAILABLE
            raise DomainError(code, f"No available provider for {capability_id}", details={"dependency": dependency or ""})
        provider = candidates[0]
        adapter = provider.factory()
        if (
            not getattr(adapter, "provider_version", None)
            and provider.version
            and not provider.dependency_package
        ):
            adapter.provider_version = provider.version
        return adapter

    def describe(self) -> list[dict[str, Any]]:
        return [
            {
                "capability_id": capability,
                "providers": [
                    {
                        "provider_id": item.provider_id,
                        "execution_class": item.execution_class,
                        "priority": item.priority,
                        "dependency_package": item.dependency_package,
                        "available": item.available(),
                        "version": item.version,
                    }
                    for item in specs
                ],
            }
            for capability, specs in sorted(self._providers.items())
        ]

    def support_library_status(self) -> list[dict[str, Any]]:
        return [
            {
                "package": spec.package,
                "purpose": spec.purpose,
                "optional": spec.optional,
                "available": spec.available(),
            }
            for spec in sorted(self._support_libraries.values(), key=lambda item: item.package)
        ]


def build_default_registry() -> CapabilityProviderRegistry:
    from .adapters import (
        ConservationCheckAdapter,
        GasMaterialBalanceAdapter,
        NodalAnalysisAdapter,
        OilMaterialBalanceAdapter,
        StandingBlackOilAdapter,
        UnitConversionAdapter,
        VolumetricOilInPlaceAdapter,
        VogelIPRAdapter,
    )
    from ..computation.adapters import (
        GeoPandasAdapter,
        NetworkXAdapter,
        ScikitLearnAdapter,
        SimPyAdapter,
        StatsmodelsAdapter,
        SymPyAdapter,
    )
    from ..stochastic.adapters import PyMCAdapter, PymooAdapter

    registry = CapabilityProviderRegistry()
    registrations = (
        ("units.convert", "ugsci-unit-system", UnitConversionAdapter, None, "1.1.0"),
        ("reservoir.volumetrics.oil_in_place", "ugsci-petroleum-core", VolumetricOilInPlaceAdapter, None, "1.1.0"),
        ("reservoir.material_balance.oil", "ugsci-petroleum-core", OilMaterialBalanceAdapter, None, "1.1.0"),
        ("reservoir.material_balance.gas_pz", "ugsci-petroleum-core", GasMaterialBalanceAdapter, None, "1.1.0"),
        ("fluid.pvt.standing_black_oil", "ugsci-petroleum-core", StandingBlackOilAdapter, None, "1.1.0"),
        ("production.ipr.vogel", "ugsci-petroleum-core", VogelIPRAdapter, None, "1.1.0"),
        ("production.nodal_analysis", "ugsci-petroleum-core", NodalAnalysisAdapter, None, "1.1.0"),
        ("validation.conservation_check", "ugsci-petroleum-core", ConservationCheckAdapter, None, "1.1.0"),
        ("math.symbolic", "ugsci-symbolic-sympy", SymPyAdapter, "sympy", "1.0.0"),
        ("simulation.queue.deterministic", "ugsci-queue-simpy", SimPyAdapter, "simpy", "1.0.0"),
        ("graph.network.analyze", "ugsci-graph-networkx", NetworkXAdapter, "networkx", "1.0.0"),
        ("geospatial.points.analyze", "ugsci-geospatial-geopandas", GeoPandasAdapter, "geopandas", "1.0.0"),
        ("machine_learning.linear_regression", "ugsci-ml-scikit-learn", ScikitLearnAdapter, "sklearn", "1.0.0"),
        ("statistics.ols_regression", "ugsci-statistics-statsmodels", StatsmodelsAdapter, "statsmodels", "1.0.0"),
    )
    for capability, provider_id, factory, dependency, version in registrations:
        registry.register(ProviderSpec(capability, provider_id, factory, dependency_package=dependency, version=version))
    registry.register(ProviderSpec("statistics.bayesian.normal_mean", "ugsci-bayesian-pymc", PyMCAdapter, execution_class="stochastic", dependency_package="pymc", version="1.0.0"))
    registry.register(ProviderSpec("optimization.quadratic.pareto", "ugsci-optimization-pymoo", PymooAdapter, execution_class="stochastic", dependency_package="pymoo", version="1.0.0"))
    registry.register_support_library(SupportLibrarySpec("pytoolbox", "Optional general-purpose helpers and compatibility utilities for UGSci Providers"))
    return registry


default_registry = build_default_registry()

__all__ = ["CapabilityProviderRegistry", "ProviderSpec", "SupportLibrarySpec", "default_registry"]
