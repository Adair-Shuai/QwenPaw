/**
 * Runtime status derivation for domain engines.
 *
 * Rules:
 * - builtin: dependencies and all registered tools must be enabled to be
 *   available; partial enablement is reported separately. Missing required
 *   dependencies are unavailable; inconclusive probes are unknown.
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
): ProbeStatus | "needs_install" | "unconfigured" | "error" {
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

  let effectiveStatus: DomainEngineView["effectiveStatus"];
  let statusDescription = "";
  let discoveredToolCount: number;
  let mcpProviderKey: string | null;

  if (def.provider.kind === "driver") {
    if (depStatus.overall === "unavailable") {
      effectiveStatus = "needs_install";
    } else if (depStatus.overall !== "available") {
      effectiveStatus = "unknown";
    } else {
      effectiveStatus = deriveMcpStatus(mcpInfo);
    }
    discoveredToolCount = mcpInfo?.toolCount ?? 0;
    mcpProviderKey = mcpInfo?.key ?? def.provider.id;
  } else if (def.source === "builtin") {
    const dependencyStatus = deriveBuiltinStatus(depStatus);
    const requiredTools = [
      ...new Set(def.operations.flatMap((op) => op.tool_names)),
    ];
    const registeredTools = requiredTools.filter((name) =>
      builtinTools.has(name),
    );
    const enabledTools = registeredTools.filter(
      (name) => builtinTools.get(name)?.enabled,
    );
    if (dependencyStatus !== "available") {
      effectiveStatus = dependencyStatus;
    } else if (registeredTools.length !== requiredTools.length) {
      effectiveStatus = "error";
    } else if (enabledTools.length === 0) {
      effectiveStatus = "unconfigured";
    } else if (enabledTools.length < requiredTools.length) {
      effectiveStatus = "partial";
    } else {
      effectiveStatus = "available";
    }
    discoveredToolCount = enabledTools.length;
    mcpProviderKey = null;
    const missing = requiredTools.filter((name) => !builtinTools.has(name));
    const disabled = registeredTools.filter(
      (name) => !builtinTools.get(name)?.enabled,
    );
    if (dependencyStatus === "available") {
      statusDescription = missing.length
        ? `工具未完整注册：${missing.join("、")}`
        : disabled.length
        ? `当前专家已启用 ${enabledTools.length}/${
            requiredTools.length
          } 个工具；未启用：${disabled.join("、")}`
        : requiredTools.length
        ? `依赖检测通过，当前专家已启用全部 ${requiredTools.length} 个工具。`
        : "该能力未声明可调用工具。";
    }
  } else if (def.source === "mcp") {
    // MCP source
    effectiveStatus = deriveMcpStatus(mcpInfo);
    discoveredToolCount = mcpInfo?.toolCount ?? 0;
    mcpProviderKey = mcpInfo?.key ?? def.provider.id;
  } else {
    effectiveStatus = deriveBuiltinStatus(depStatus);
    discoveredToolCount = 0;
    mcpProviderKey = null;
    statusDescription =
      "依据运行依赖检测结果判断，尚未校验当前专家的调用工具。";
  }

  if (depStatus.overall !== "available") {
    const issues = depStatus.dependencies.filter(
      (dep) => dep.status !== "available",
    );
    statusDescription = issues.length
      ? issues
          .map(
            (dep) =>
              `${dep.name}：${
                dep.status === "unavailable" ? "未检测到可用依赖" : "尚未确认"
              }${dep.reason ? `（${dep.reason}）` : ""}`,
          )
          .join("；")
      : "尚未确认运行依赖状态，请刷新检测。";
  } else if (!statusDescription) {
    statusDescription = !mcpInfo
      ? "未发现当前专家的 MCP 服务配置，或服务状态查询未成功。"
      : !mcpInfo.enabled
      ? "当前专家尚未启用该 MCP 服务。"
      : mcpInfo.error
      ? `MCP 工具查询失败：${mcpInfo.error}`
      : mcpInfo.toolCount > 0
      ? `依赖检测通过，MCP 服务已启用并发现 ${mcpInfo.toolCount} 个已启用工具；具体函数以服务实际提供为准。`
      : "MCP 服务已启用，但未发现已启用的工具。";
  }
  return {
    definition: def,
    dependencyStatus: depStatus,
    checkedAt: response.checked_at,
    effectiveStatus,
    statusDescription,
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
  needs_install: "待安装",
  unconfigured: "未配置",
  partial: "部分可用",
  error: "错误",
};

export const STATUS_COLORS: Record<string, string> = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  needs_install: "warning",
  unconfigured: "warning",
  partial: "warning",
  error: "error",
};
