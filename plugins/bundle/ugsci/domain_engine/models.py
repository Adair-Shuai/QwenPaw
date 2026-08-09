# -*- coding: utf-8 -*-
"""Domain engine data models.

These models describe the static catalog of domain engines.  They do
not represent runtime state — that is derived from QwenPaw's Driver and
Tool systems.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class DomainOperation:
    """A single operation offered by a domain engine."""

    id: str
    name: str
    description: str
    tool_names: tuple[str, ...] = ()
    driver_tool_names: tuple[str, ...] = ()


@dataclass(frozen=True)
class ProviderRef:
    """Reference to the implementation provider."""

    kind: Literal["builtin", "driver", "skill", "plugin"]
    id: str


@dataclass(frozen=True)
class DomainEngineDefinition:
    """Static definition of a domain engine.

    Attributes:
        schema_version: Envelope schema version (currently 1).
        id: Unique engine identifier.
        name: Human-readable name.
        description: Short description.
        domain: Domain category (e.g. ``"geology_well_logging"``).
        source: Whether the engine is built-in or MCP-backed.
        provider: Reference to the implementation provider.
        operations: Tuple of operations offered.
        dependencies: Tuple of dependency names (for probe).
        tags: Optional tags for search/filter.
    """

    schema_version: int
    id: str
    name: str
    description: str
    domain: str
    source: Literal["builtin", "mcp", "library", "plugin"]
    provider: ProviderRef
    operations: tuple[DomainOperation, ...]
    dependencies: tuple[str, ...] = ()
    tags: tuple[str, ...] = ()

    def to_dict(self) -> dict:
        """Serialize to JSON-safe dict."""
        return {
            "schema_version": self.schema_version,
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "domain": self.domain,
            "source": self.source,
            "provider": {
                "kind": self.provider.kind,
                "id": self.provider.id,
            },
            "operations": [
                {
                    "id": op.id,
                    "name": op.name,
                    "description": op.description,
                    "tool_names": list(op.tool_names),
                    "driver_tool_names": list(op.driver_tool_names),
                }
                for op in self.operations
            ],
            "dependencies": list(self.dependencies),
            "tags": list(self.tags),
        }
