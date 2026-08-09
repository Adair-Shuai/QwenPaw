/**
 * Runtime status derivation for domain engines.
 *
 * Rules:
 * - builtin: available if dependencies are available; unavailable if any
 *   required dependency is missing; unknown if probe fails.
 * - mcp: unavailable if provider not found; unconfigured if disabled;
 *   available if enabled and has tools; error if enabled but tool query fails.
 */

import type {
  DependencyStatus,
  DomainEngineDefinition,
  DomainEngineView,
  EngineProbeResponse,
  ProbeStatus,
} from "./types";

interface McpProviderInfo {
  key: string;
  enabled: boolean;
  toolCount: number;
  error: string | null;
}

interface BuiltinToolInfo {
  name: string;
  enabled: boolean;
}

/**
 * Derive the effective status for a builtin engine.
 */
function deriveBuiltinStatus(
  depStatus: DependencyStatus,
): ProbeStatus | "unconfigured" | "error" {
  if (!depStatus) return "unknown";
  if (depStatus.overall === "available") return "available";
  if (depStatus.overall === "unavailable") return "unavailable";
  return "unknown";
}

/**
 * Derive the effective status for an MCP engine.
 */
function deriveMcpStatus(
  provider: McpProviderInfo | null,
): ProbeStatus | "unconfigured" | "error" {
  if (!provider) return "unavailable";
  if (!provider.enabled) return "unconfigured";
  if (provider.error) return "error";
  if (provider.toolCount > 0) return "available";
  return "error";
}

/**
 * Build a DomainEngineView from the API response and optional MCP info.
 *
 * MCP info is gathered separately by querying /api/mcp and
 * /api/mcp/tools/{key} — this keeps the domain engine API pure.
 */
export function buildEngineView(
  response: EngineProbeResponse,
  mcpInfo: McpProviderInfo | null = null,
  builtinTools: Map<string, BuiltinToolInfo> = new Map(),
): DomainEngineView {
  const def = response.engine;
  const depStatus = response.dependency_status;

  let effectiveStatus: ProbeStatus | "unconfigured" | "error";
  let discoveredToolCount: number;
  let mcpProviderKey: string | null;

  if (def.source === "builtin") {
    const dependencyStatus = deriveBuiltinStatus(depStatus);
    const requiredTools = def.operations.flatMap((op) => op.tool_names);
    const registeredTools = requiredTools.filter((name) => builtinTools.has(name));
    const enabledTools = registeredTools.filter(
      (name) => builtinTools.get(name)?.enabled,
    );
    if (dependencyStatus !== "available") {
      effectiveStatus = dependencyStatus;
    } else if (registeredTools.length !== requiredTools.length) {
      effectiveStatus = "error";
    } else if (enabledTools.length === 0) {
      effectiveStatus = "unconfigured";
    } else {
      effectiveStatus = "available";
    }
    discoveredToolCount = enabledTools.length;
    mcpProviderKey = null;
  } else if (def.source === "mcp") {
    // MCP source
    effectiveStatus = deriveMcpStatus(mcpInfo);
    discoveredToolCount = mcpInfo?.toolCount ?? 0;
    mcpProviderKey = mcpInfo?.key ?? def.provider.id;
  } else {
    effectiveStatus = deriveBuiltinStatus(depStatus);
    discoveredToolCount = 0;
    mcpProviderKey = null;
  }

  return {
    definition: def,
    dependencyStatus: depStatus,
    checkedAt: response.checked_at,
    effectiveStatus,
    discoveredToolCount,
    mcpProviderKey,
  };
}

/**
 * Group engines by domain for display.
 */
export function groupByDomain(
  views: DomainEngineView[],
): Map<string, DomainEngineView[]> {
  const groups = new Map<string, DomainEngineView[]>();
  for (const view of views) {
    const domain = view.definition.domain;
    if (!groups.has(domain)) {
      groups.set(domain, []);
    }
    groups.get(domain)!.push(view);
  }
  return groups;
}

/**
 * Status display labels.
 */
export const STATUS_LABELS: Record<string, string> = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  unconfigured: "未配置",
  error: "错误",
};

export const STATUS_COLORS: Record<string, string> = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  unconfigured: "warning",
  error: "error",
};
