/**
 * Type definitions for the domain engine UI.
 *
 * These types mirror the backend DTOs and must NOT reuse the simulation
 * EngineInfo type — domain engines have a different shape.
 */

export interface ProviderRef {
  kind: "builtin" | "driver" | "skill";
  id: string;
}

export interface DomainOperation {
  id: string;
  name: string;
  description: string;
  tool_names: string[];
  driver_tool_names: string[];
}

export interface DomainEngineDefinition {
  schema_version: number;
  id: string;
  name: string;
  description: string;
  domain: string;
  source: "builtin" | "mcp" | "library";
  provider: ProviderRef;
  operations: DomainOperation[];
  dependencies: string[];
  tags: string[];
}

export type ProbeStatus = "available" | "unavailable" | "unknown";

export interface DependencyStatusItem {
  name: string;
  status: ProbeStatus;
  reason: string;
  install_hint: string;
  enable_hint: string;
}

export interface DependencyStatus {
  overall: ProbeStatus;
  dependencies: DependencyStatusItem[];
}

export interface EngineProbeResponse {
  schema_version: number;
  engine: DomainEngineDefinition;
  dependency_status: DependencyStatus;
  checked_at: string;
}

/**
 * Frontend-derived view of a domain engine.
 *
 * Combines the static definition with runtime status (dependency probe,
 * MCP client status, discovered tool count) into a single object that
 * the UI components can consume.
 */
export interface DomainEngineView {
  definition: DomainEngineDefinition;
  dependencyStatus: DependencyStatus;
  checkedAt: string;
  /** Effective availability derived from dependency + MCP status. */
  effectiveStatus: ProbeStatus | "unconfigured" | "error";
  /** Number of tools discovered (for MCP engines, from tool list). */
  discoveredToolCount: number;
  /** MCP provider key (for MCP engines only). */
  mcpProviderKey: string | null;
}
