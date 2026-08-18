/**
 * UGSci distribution endpoints - the fork's single source of truth
 * (console mirror of `src/qwenpaw/distribution.py`).
 *
 * This file is fork-owned (no upstream QwenPaw counterpart), so it never
 * conflicts on upstream merges. Upstream files reference these values via a
 * single import line to keep their diff against upstream minimal:
 *
 * - `layouts/constants.ts`     -> DESKTOP_UPDATE_MANIFEST_URL
 * - `api/modules/plugin.ts`    -> UPSTREAM_PLUGIN_CDN, isUGSciCatalogPlugin
 *
 * Override the OSS base at build time with `VITE_UGSCI_DOWNLOAD_BASE_URL`
 * (staging / self-hosted mirrors).
 */

const env = (import.meta.env ?? {}) as Record<string, string | undefined>;

/** Root of the UGSci-download OSS bucket. */
export const UGSCI_DOWNLOAD_BASE_URL = (
  env.VITE_UGSCI_DOWNLOAD_BASE_URL ||
  "https://ugsci-download.oss-cn-beijing.aliyuncs.com"
).replace(/\/+$/, "");

/** Desktop (Tauri) promoted-release manifest. */
export const DESKTOP_UPDATE_MANIFEST_URL = `${UGSCI_DOWNLOAD_BASE_URL}/metadata/qwenpaw-tauri-latest.json`;

/** Core / pip / source version advertisement (not the desktop installer). */
export const CORE_UPDATE_MANIFEST_URL = `${UGSCI_DOWNLOAD_BASE_URL}/metadata/ugsci-core-latest.json`;

/**
 * Upstream QwenPaw official catalog CDN. Kept so upstream plugins/apps stay
 * installable and upgradable next to the UGSci catalog.
 */
export const UPSTREAM_PLUGIN_CDN = "https://download.qwenpaw.agentscope.io";

/** Catalog row used to decide the UGSci channel. */
export interface UGSciCatalogIdentity {
  plugin_id?: string;
  author?: string;
  channel?: string;
}

/**
 * UGSci catalog membership is derived from the published channel/author,
 * not a hardcoded ID list, so a newly released plugin appears without a
 * console rebuild.
 */
export function isUGSciCatalogPlugin(entry: UGSciCatalogIdentity): boolean {
  const channel = (entry.channel || "").trim().toLowerCase();
  if (channel === "community") {
    return false;
  }
  if (channel === "ugsci") {
    return true;
  }
  return (entry.author || "").toLowerCase().includes("ugsci");
}
