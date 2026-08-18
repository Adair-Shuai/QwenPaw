import { getApiUrl } from "../config";
import { buildAuthHeaders } from "../authHeaders";
import { isUGSciCatalogPlugin, UPSTREAM_PLUGIN_CDN } from "../../distribution";
import { ApiError } from "../request";
import { componentsApi } from "./components";

/** Matches the backend ``PluginType`` enum values. */
export type PluginType =
  | "tool"
  | "provider"
  | "hook"
  | "command"
  | "frontend"
  | "channel"
  | "app"
  | "general";

/**
 * A single plugin record returned by `GET /api/plugins`.
 */
export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  enabled: boolean;
  /** Whether the plugin is currently loaded in memory. */
  loaded: boolean;
  /** Primary capability type declared in plugin.json. */
  plugin_type: PluginType;
  /** Frontend JS entry-point path (if any). */
  frontend_entry?: string;
}

export interface InstallPluginResult {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  loaded: boolean;
  message: string;
}

export interface PluginStatus {
  id: string;
  loaded: boolean;
  enabled: boolean;
  version?: string;
}

export type BundledPluginState =
  | "pending"
  | "running"
  | "files_ready"
  | "registry_ready"
  | "ready"
  | "error";

export interface BundledPluginStatus {
  state: BundledPluginState;
  installed: string[];
  error?: string | null;
  loaded_count?: number;
}

/** Entry from ``GET /api/plugins/catalog`` (official CDN manifest). */
export interface OfficialPluginCatalogEntry {
  id: string;
  plugin_id: string;
  name: string;
  description: string;
  /** Locale-keyed descriptions, e.g. { "zh-CN": "...", "en-US": "..." } */
  description_i18n?: Record<string, string>;
  version: string;
  author: string;
  kind: string;
  size: string;
  sha256: string;
  install_url: string;
  installed: boolean;
  installed_version?: string;
  upgrade_available: boolean;
  channel?: string;
}

export interface OfficialPluginCatalog {
  updated_at: string | null;
  plugins: OfficialPluginCatalogEntry[];
  error?: string | null;
}

export type PluginCatalogSource = "qwenpaw" | "ugsci";

interface RemoteCatalogFile {
  id?: string;
  plugin_id?: string;
  name?: string | Record<string, string>;
  description?: string | Record<string, string>;
  version?: string;
  author?: string;
  platform?: string;
  size?: string;
  sha256?: string;
  url?: string;
  qwenpaw_version?: { min?: string; max?: string };
}

const QWENPAW_PLUGIN_CDN = UPSTREAM_PLUGIN_CDN;

function comparePluginVersions(a: string, b: string): number {
  const tokenize = (value: string) =>
    value
      .replace(/^v/i, "")
      .split(/[.+-]/)
      .flatMap((part) => part.match(/\d+|[a-z]+/gi) ?? [])
      .map((part) => (/^\d+$/.test(part) ? Number(part) : part.toLowerCase()));
  const left = tokenize(a);
  const right = tokenize(b);
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const l = left[index] ?? 0;
    const r = right[index] ?? 0;
    if (l === r) continue;
    if (typeof l === "number" && typeof r === "number") return l - r;
    if (typeof l === "number") return 1;
    if (typeof r === "number") return -1;
    return l.localeCompare(r);
  }
  return 0;
}

function latestPerPlugin(
  plugins: OfficialPluginCatalogEntry[],
): OfficialPluginCatalogEntry[] {
  const latest = new Map<string, OfficialPluginCatalogEntry>();
  for (const entry of plugins) {
    const current = latest.get(entry.plugin_id);
    if (!current || comparePluginVersions(entry.version, current.version) > 0) {
      latest.set(entry.plugin_id, entry);
    }
  }
  return [...latest.values()].sort((a, b) =>
    `${a.kind}:${a.name}`.localeCompare(`${b.kind}:${b.name}`),
  );
}

function localizedValue(
  value: string | Record<string, string> | undefined,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value["zh-CN"] || value.zh || value["en-US"] || value.en || "";
}

function isCompatible(entry: RemoteCatalogFile, appVersion: string): boolean {
  if (!appVersion || !entry.qwenpaw_version) return true;
  const { min, max } = entry.qwenpaw_version;
  if (min && comparePluginVersions(appVersion, min) < 0) return false;
  if (max && comparePluginVersions(appVersion, max) > 0) return false;
  return true;
}

async function installedVersionMap(): Promise<Map<string, string>> {
  const plugins = await fetchPlugins();
  const installed = new Map<string, string>();
  for (const plugin of plugins) {
    const current = installed.get(plugin.id);
    if (!current || comparePluginVersions(plugin.version, current) > 0) {
      installed.set(plugin.id, plugin.version);
    }
  }
  return installed;
}

/**
 * Fetch the list of loaded plugins from the backend.
 */
export async function fetchPlugins(): Promise<PluginInfo[]> {
  const response = await fetch(getApiUrl("/plugins"), {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    console.warn("[plugin] Failed to fetch plugin list:", response.status);
    return [];
  }

  return response.json();
}

/**
 * Fetch the backend's bundled-plugin preparation state. The desktop HTTP
 * server becomes reachable before plugin discovery finishes, so callers must
 * not treat an early disk-scan response as the final runtime state.
 */
export async function fetchBundledPluginStatus(): Promise<BundledPluginStatus> {
  const response = await fetch(getApiUrl("/plugins/bundled/status"), {
    headers: buildAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Plugin startup status failed (${response.status})`);
  }

  return response.json();
}

/**
 * Install a plugin from a local path or HTTP(S) URL via hot-reload.
 */
export async function fetchPluginCatalog(): Promise<OfficialPluginCatalog> {
  const response = await fetch(getApiUrl("/plugins/catalog"), {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.detail ?? `Failed to load plugin catalog (${response.status})`,
    );
  }

  return response.json();
}

export async function fetchUGSciPluginCatalog(): Promise<OfficialPluginCatalog> {
  const [catalog, installed] = await Promise.all([
    fetchPluginCatalog(),
    installedVersionMap(),
  ]);
  const plugins = latestPerPlugin(catalog.plugins ?? [])
    .filter((entry) => isUGSciCatalogPlugin(entry))
    .map((entry) => {
      const installedVersion = installed.get(entry.plugin_id);
      return {
        ...entry,
        installed: Boolean(installedVersion),
        installed_version: installedVersion,
        upgrade_available: Boolean(
          installedVersion &&
            comparePluginVersions(entry.version, installedVersion) > 0,
        ),
      };
    });
  return { ...catalog, plugins };
}

export async function fetchQwenPawPluginCatalog(): Promise<OfficialPluginCatalog> {
  const [mainResponse, installed, versionResponse] = await Promise.all([
    fetch(`${QWENPAW_PLUGIN_CDN}/metadata/index.json`, { cache: "no-store" }),
    installedVersionMap(),
    fetch(getApiUrl("/version"), { headers: buildAuthHeaders() }).catch(
      () => null,
    ),
  ]);
  if (!mainResponse.ok) {
    throw new Error(`Failed to load QwenPaw catalog (${mainResponse.status})`);
  }
  const main = await mainResponse.json();
  const indexPath = main?.products?.plugins?.index_url;
  if (typeof indexPath !== "string" || !indexPath.startsWith("/")) {
    throw new Error("Invalid QwenPaw plugin catalog index");
  }
  const appVersion = versionResponse?.ok
    ? String((await versionResponse.json())?.version ?? "")
    : "";
  const indexResponse = await fetch(`${QWENPAW_PLUGIN_CDN}${indexPath}`, {
    cache: "no-store",
  });
  if (!indexResponse.ok) {
    throw new Error(`Failed to load QwenPaw plugins (${indexResponse.status})`);
  }
  const index = await indexResponse.json();
  const files = Object.values(index?.files ?? {}) as RemoteCatalogFile[];
  const plugins = files
    .filter((entry) => entry && isCompatible(entry, appVersion))
    .filter(
      (entry) => typeof entry.url === "string" && entry.url.startsWith("/"),
    )
    .map((entry) => {
      const pluginId = String(entry.plugin_id || entry.id || "");
      const catalogVersion = String(entry.version || "0.0.0");
      const installedVersion = installed.get(pluginId);
      const descriptions =
        typeof entry.description === "object" ? entry.description : undefined;
      return {
        id: String(entry.id || `${pluginId}-${catalogVersion}`),
        plugin_id: pluginId,
        name: localizedValue(entry.name) || pluginId,
        description: localizedValue(entry.description),
        description_i18n: descriptions,
        version: catalogVersion,
        author: String(entry.author || ""),
        kind: String(entry.platform || ""),
        size: String(entry.size || ""),
        sha256: String(entry.sha256 || ""),
        install_url: `${QWENPAW_PLUGIN_CDN}${entry.url}`,
        installed: Boolean(installedVersion),
        installed_version: installedVersion,
        upgrade_available: Boolean(
          installedVersion &&
            comparePluginVersions(catalogVersion, installedVersion) > 0,
        ),
      } satisfies OfficialPluginCatalogEntry;
    });
  return {
    updated_at: String(index?.updated_at ?? "") || null,
    plugins: latestPerPlugin(plugins),
    error: null,
  };
}

export interface RuntimePluginReplaceResult {
  id: string;
  name: string;
  version: string;
  restart_required: boolean;
  backup_path?: string;
}

export async function replaceInstalledPlugin(options: {
  source: string;
  pluginId: string;
  version?: string;
  sha256?: string;
}): Promise<RuntimePluginReplaceResult> {
  const response = await fetch(getApiUrl("/plugins/replace"), {
    method: "POST",
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: options.source,
      plugin_id: options.pluginId,
      version: options.version,
      sha256: options.sha256,
    }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.detail ?? `Plugin upgrade failed (${response.status})`,
    );
  }
  return response.json();
}

/** Minimal catalog fields needed to upgrade an installed UGSci plugin. */
export interface UGSciUpgradeSource {
  plugin_id: string;
  version: string;
  install_url?: string;
  sha256?: string;
  upgrade_available?: boolean;
}

export type UGSciUpgradeResult =
  | { method: "queued" }
  | { method: "replaced"; version: string }
  | { method: "up-to-date" };

/**
 * Upgrade an installed UGSci plugin/app.
 *
 * Primary path: the signed component updater (queued, applied at the next
 * safe restart). Fallback: the sha256-verified `/plugins/replace` hot swap,
 * used only when the signed path says the component is not managed (HTTP
 * 409). Network/5xx errors and an up-to-date signed answer do not fall
 * through to hot replace.
 */
function isUnmanagedComponentError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 409) {
    return false;
  }
  if (error.reason === "not_managed") {
    return true;
  }
  // Legacy string details from older backends.
  return !error.reason && /not managed/i.test(error.message);
}

function requireUGSciUpgradeDigest(sha256: string | undefined): string {
  const digest = (sha256 || "").trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(digest)) {
    throw new Error("UGSci catalog upgrade is missing a SHA-256 digest");
  }
  return digest;
}

export async function upgradeInstalledUGSciPlugin(
  entry: UGSciUpgradeSource,
): Promise<UGSciUpgradeResult> {
  try {
    const result = await componentsApi.queueComponentUpdate(entry.plugin_id);
    if (result.queued) return { method: "queued" };
    // Signed path answered; do not hot-replace just because the catalog is newer.
    return { method: "up-to-date" };
  } catch (error) {
    if (!isUnmanagedComponentError(error)) {
      throw error;
    }
  }
  if (!entry.upgrade_available || !entry.install_url) {
    return { method: "up-to-date" };
  }
  const replaced = await replaceInstalledPlugin({
    source: entry.install_url,
    pluginId: entry.plugin_id,
    version: entry.version,
    sha256: requireUGSciUpgradeDigest(entry.sha256),
  });
  return { method: "replaced", version: replaced.version };
}

export async function installPlugin(
  source: string,
  options?: { force?: boolean },
): Promise<InstallPluginResult> {
  const response = await fetch(getApiUrl("/plugins/install"), {
    method: "POST",
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ source, force: options?.force ?? false }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `Install failed (${response.status})`);
  }

  return response.json();
}

/**
 * Install a plugin from a local ZIP file via hot-reload.
 */
export async function uploadPlugin(file: File): Promise<InstallPluginResult> {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(getApiUrl("/plugins/upload"), {
    method: "POST",
    headers: buildAuthHeaders(),
    body: form,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `Upload failed (${response.status})`);
  }

  return response.json();
}

/**
 * Uninstall (hot-unload + delete) a plugin by ID.
 */
export async function uninstallPlugin(pluginId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/plugins/${pluginId}`), {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `Uninstall failed (${response.status})`);
  }
}

/**
 * Fetch the runtime status of a single plugin.
 */
export async function fetchPluginStatus(
  pluginId: string,
): Promise<PluginStatus> {
  const response = await fetch(getApiUrl(`/plugins/${pluginId}/status`), {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `Status fetch failed (${response.status})`);
  }

  return response.json();
}
