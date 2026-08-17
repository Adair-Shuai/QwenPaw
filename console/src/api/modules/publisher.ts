export type PublishAssetKind = "plugin" | "app";
export type PublishMode = "release" | "submission";

export interface PublisherStatus {
  direct_publish_configured: boolean;
  submission_configured: boolean;
  publish_endpoint?: string | null;
  submission_endpoint?: string | null;
  outbox_dir: string;
  inbox_dir: string;
  max_archive_mb: number;
}

export interface PublishInspection {
  plugin_id: string;
  name: string;
  version: string;
  asset_kind: PublishAssetKind;
  catalog_kind: "bundle" | "tool" | "apps";
  file_count: number;
  source_size_bytes: number;
  warnings: string[];
  blockers: string[];
}

export interface PublishResult extends PublishInspection {
  status: "published" | "submitted" | "prepared";
  sha256: string;
  archive_size_bytes: number;
  archive_path?: string;
  metadata_path?: string;
  remote?: unknown;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      (body as { detail?: string }).detail ??
        `Publisher request failed (${response.status})`,
    );
  }
  return body as T;
}

export async function fetchPublisherStatus(): Promise<PublisherStatus> {
  return parseResponse(
    await fetch(getApiUrl("/publisher/status"), {
      cache: "no-store",
      headers: buildAuthHeaders(),
    }),
  );
}

export async function inspectInstalledAsset(options: {
  pluginId: string;
  kind: PublishAssetKind;
}): Promise<PublishInspection> {
  return parseResponse(
    await fetch(getApiUrl("/publisher/inspect"), {
      method: "POST",
      headers: { ...buildAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(options),
    }),
  );
}

export async function publishInstalledAsset(options: {
  pluginId: string;
  kind: PublishAssetKind;
  mode: PublishMode;
}): Promise<PublishResult> {
  return parseResponse(
    await fetch(getApiUrl("/publisher/publish"), {
      method: "POST",
      headers: { ...buildAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(options),
    }),
  );
}

export async function uploadPublishArchive(options: {
  file: File;
  kind: PublishAssetKind;
  mode: PublishMode;
}): Promise<PublishResult> {
  return parseResponse(
    await fetch(getApiUrl("/publisher/upload"), {
      method: "POST",
      headers: {
        ...buildAuthHeaders(),
        "Content-Type": "application/zip",
        "X-UGSci-Filename": encodeURIComponent(options.file.name),
        "X-UGSci-Asset-Kind": options.kind,
        "X-UGSci-Publish-Mode": options.mode,
      },
      body: options.file,
    }),
  );
}
import { buildAuthHeaders } from "../authHeaders";
import { getApiUrl } from "../config";
