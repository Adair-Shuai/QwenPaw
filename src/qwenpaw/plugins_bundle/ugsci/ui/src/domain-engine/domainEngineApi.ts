/**
 * API client for the domain engine backend.
 *
 * Routes are prefixed with /ugsci/domain-engines under the QwenPaw API root.
 * MCP provider status is queried from the shared /mcp routes.
 */

import { apiFetch } from "../core/runtime";
import type { EngineProbeResponse } from "./types";

export async function fetchDomainEngines(
  force = false,
): Promise<EngineProbeResponse[]> {
  const data = await apiFetch<{ engines: EngineProbeResponse[] }>(
    "/ugsci/domain-engines/list",
    force ? { bypassCache: true } : undefined,
  );
  return data?.engines || [];
}

export async function fetchDomainEngine(
  engineId: string,
): Promise<EngineProbeResponse> {
  return apiFetch<EngineProbeResponse>(
    `/ugsci/domain-engines/${encodeURIComponent(engineId)}`,
  );
}

export async function probeDomainEngines(): Promise<
  { engine_id: string; overall: string; dependencies: unknown[] }[]
> {
  const data = await apiFetch<{ results: unknown[] }>(
    "/ugsci/domain-engines/probe",
    { method: "POST" },
  );
  return (data?.results || []) as {
    engine_id: string;
    overall: string;
    dependencies: unknown[];
  }[];
}

export async function probeDomainEngine(
  engineId: string,
): Promise<{ engine_id: string; overall: string; dependencies: unknown[] }> {
  return apiFetch<{
    engine_id: string;
    overall: string;
    dependencies: unknown[];
  }>(`/ugsci/domain-engines/${encodeURIComponent(engineId)}/probe`, {
    method: "POST",
  });
}

// ─── MCP Provider Status ─────────────────────────────────────────────────────

/**
 * Minimal shape of MCPClientInfo returned by GET /mcp.
 * We only need the fields used for domain engine status derivation.
 */
interface MCPClientInfoMin {
  key: string;
  enabled: boolean;
}

/**
 * Result of querying MCP provider status for a single engine.
 */
export interface McpProviderStatus {
  key: string;
  enabled: boolean;
  toolCount: number;
  error: string | null;
}

export interface BuiltinToolStatus {
  name: string;
  enabled: boolean;
}

/** Fetch the current Agent's registered built-in tools. */
export async function fetchBuiltinToolStatuses(
  agentId: string,
  force = false,
): Promise<Map<string, BuiltinToolStatus>> {
  const tools = (await apiFetch<BuiltinToolStatus[]>("/tools", {
    headers: { "X-Agent-Id": agentId },
    ...(force ? { bypassCache: true } : {}),
  })) || [];
  return new Map(tools.map((tool) => [tool.name, tool]));
}

/**
 * Fetch all MCP clients and return a map keyed by provider key.
 *
 * Each value contains the enabled status and tool count (if queryable).
 * Errors are isolated per-provider — one failure does not affect others.
 */
export async function fetchMcpProviderStatuses(
  agentId: string,
  force = false,
): Promise<
  Map<string, McpProviderStatus>
> {
  const result = new Map<string, McpProviderStatus>();
  const requestOptions = {
    headers: { "X-Agent-Id": agentId },
    ...(force ? { bypassCache: true } : {}),
  };

  // Step 1: List all MCP clients
  let clients: MCPClientInfoMin[];
  try {
    clients = (await apiFetch<MCPClientInfoMin[]>(
      "/mcp",
      requestOptions,
    )) || [];
  } catch {
    // MCP API unavailable — return empty map (all MCP engines show "unavailable")
    return result;
  }

  // Step 2: For each client, query tool count
  for (const client of clients) {
    const key = client.key;
    if (!client.enabled) {
      result.set(key, { key, enabled: false, toolCount: 0, error: null });
      continue;
    }
    try {
      const tools = (await apiFetch<
        { name: string; enabled: boolean }[]
      >(
        `/mcp/tools/${encodeURIComponent(key)}`,
        requestOptions,
      )) || [];
      result.set(key, {
        key,
        enabled: true,
        toolCount: tools.filter((tool) => tool.enabled).length,
        error: null,
      });
    } catch (err: unknown) {
      result.set(key, {
        key,
        enabled: true,
        toolCount: 0,
        error: err instanceof Error ? err.message : "Tool query failed",
      });
    }
  }

  return result;
}
