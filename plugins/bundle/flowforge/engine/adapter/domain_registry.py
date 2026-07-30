# -*- coding: utf-8 -*-
"""Adapter: domain model registry stubs.

LeAgent's ``domain_model_factory`` and ``domain_model_nodes`` modules
import from ``leagent.llm.domain_registry`` and ``leagent.llm.domain_models``
to build typed ``Model.<task>.<provider>`` workflow nodes for non-chat
capabilities (image generation, TTS, ASR, etc.).

QwenPaw doesn't have an equivalent domain-model registry yet.  These
stubs provide the same interface but return empty results so the
bootstrap doesn't crash.  When QwenPaw adds domain-model support, this
module can be updated to bridge to the native system.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class DomainParam:
    """Stub for LeAgent's ``DomainParam``."""

    id: str = ""
    io_type: str = "STRING"
    required: bool = False
    default: Any = None
    tooltip: str = ""
    multiline: bool = False
    min: Any = None
    max: Any = None
    choices: list[str] = field(default_factory=list)


@dataclass
class DomainModelSpec:
    """Stub for LeAgent's ``DomainModelSpec``."""

    task: str = ""
    provider: str = ""
    model: str = ""
    display_name: str = ""
    description: str = ""
    output: str = ""
    params: list[DomainParam] = field(default_factory=list)
    supports_progress: bool = False


@dataclass
class DomainModelAdapter:
    """Stub for LeAgent's ``DomainModelAdapter``."""

    spec: DomainModelSpec = field(default_factory=DomainModelSpec)

    async def invoke(self, **kwargs: Any) -> Any:
        raise NotImplementedError("Domain model adapters are not available in QwenPaw")


class DomainModelRegistry:
    """Stub registry — always empty."""

    def all(self) -> list[DomainModelAdapter]:
        return []

    def list_models(self) -> list[DomainModelAdapter]:
        return []

    def specs(self) -> list[DomainModelSpec]:
        return []


def get_domain_registry() -> DomainModelRegistry:
    """Return the process-wide (empty) domain registry."""
    return DomainModelRegistry()


def register_builtin_domain_models(registry: Any = None) -> None:
    """No-op — QwenPaw doesn't have built-in domain models yet."""
    pass


def load_domain_model_plugins() -> None:
    """No-op — no domain model plugins to load."""
    pass


__all__ = [
    "DomainModelAdapter",
    "DomainModelRegistry",
    "DomainModelSpec",
    "DomainParam",
    "get_domain_registry",
    "load_domain_model_plugins",
    "register_builtin_domain_models",
]
