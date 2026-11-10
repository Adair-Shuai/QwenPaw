import { Laptop, Monitor, type LucideIcon } from "lucide-react";

export const CDN_BASE = "https://ugsci-download.oss-cn-beijing.aliyuncs.com";

export const PLATFORM_ICONS: Record<string, LucideIcon> = {
  win: Monitor,
  mac: Laptop,
  linux: Monitor,
  "win-tauri": Monitor,
  "mac-tauri": Laptop,
};

export const KNOWN_PLUGIN_PLATFORM_KINDS = [
  "bundle",
  "tool",
  "apps",
  "app",
  "provider",
  "command",
  "hook",
  "frontend",
  "general",
] as const;
