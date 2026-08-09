/**
 * Oil & Gas Visualization — Core runtime helpers.
 *
 * Provides access to the QwenPaw host API (React, antd, fetch).
 * This module MUST NOT import Three.js or any heavy 3D library —
 * those are loaded lazily by the viewer runtime only.
 */

import type * as ReactTypes from "react";

export interface QwenPawHost {
  React: typeof ReactTypes;
  antd: any;
  antdIcons: any;
  getApiUrl: (path: string) => string;
  getApiToken: () => string | null;
  fetch?: (path: string, init?: RequestInit) => Promise<Response>;
}

export function getHost(): QwenPawHost {
  const host = (
    window as Window & { QwenPaw?: { host?: unknown } }
  ).QwenPaw?.host;
  if (!host) throw new Error("[oilgas-vis] QwenPaw.host not available");
  return host as QwenPawHost;
}

function getToken(): string {
  try {
    return getHost().getApiToken() || "";
  } catch {
    return "";
  }
}

export function apiUrl(path: string): string {
  return getHost().getApiUrl(path);
}

/**
 * Authenticated fetch through the host transport.
 * Falls back to native fetch with Bearer token.
 */
export function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const host = getHost();
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string>),
  };

  if (host.fetch) {
    return host.fetch(path, { ...init, headers }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  }

  return fetch(apiUrl(path), { ...init, headers }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}

/**
 * Fetch raw binary data (for positions, indices, scalars).
 */
export async function fetchBinary(path: string): Promise<ArrayBuffer> {
  const host = getHost();
  const token = getToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetcher = host.fetch || fetch;
  const url = host.fetch ? path : apiUrl(path);
  const response = await fetcher(url, { headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.arrayBuffer();
}

/**
 * Check if we're in simple mode (UGSci's simplified navigation).
 */
export function isSimpleMode(): boolean {
  try {
    const stored = localStorage.getItem("qwenpaw_ui_mode");
    return stored === "simple" || stored === null;
  } catch {
    return true;
  }
}
