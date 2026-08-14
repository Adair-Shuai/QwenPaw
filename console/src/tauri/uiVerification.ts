import { invoke } from "@tauri-apps/api/core";
import {
  menuRegistry,
  routeRegistry,
  slotRegistry,
} from "../plugins/registry/store";
import { isTauriRuntime } from "./backendRuntime";

export interface PluginUiVerificationSnapshot {
  menus: Array<{ id: string }>;
  routes: Array<{ id: string; path: string; source: string }>;
  slots: Array<{
    name: string;
    kind: string;
    source: string;
    id?: string;
    order?: number;
  }>;
}

export function buildPluginUiVerificationSnapshot(): PluginUiVerificationSnapshot {
  return {
    // snapshot() without a location includes every current winner, including
    // entries whose visible() callback is false in the current route.
    menus: menuRegistry.snapshot().map((menu) => ({ id: menu.id })),
    routes: routeRegistry.snapshot().map((route) => ({
      id: route.id,
      path: route.path,
      source: route.source,
    })),
    slots: slotRegistry.snapshotAll().map((slot) => ({
      name: slot.name,
      kind: slot.kind,
      source: slot.source,
      id: slot.id,
      order: slot.order,
    })),
  };
}

/** Report real-webview plugin registration when release CI enables it. */
export async function reportPluginUiVerification(): Promise<void> {
  if (!isTauriRuntime()) return;
  try {
    await invoke("report_ui_verification", {
      snapshot: buildPluginUiVerificationSnapshot(),
    });
  } catch (err) {
    // Missing CI environment intentionally makes the native command a no-op.
    // A partial/misconfigured CI environment is surfaced here and the native
    // report verifier remains the release-blocking source of truth.
    console.warn("[PluginLoader] native UI verification report failed:", err);
  }
}
