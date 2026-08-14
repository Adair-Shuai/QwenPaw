import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import { useRequest } from "ahooks";
import { useAppMessage } from "@/hooks/useAppMessage";
import {
  fetchBundledPluginStatus,
  fetchPlugins,
  uninstallPlugin,
} from "@/api/modules/plugin";
import type { BundledPluginState, PluginInfo } from "@/api/modules/plugin";

export function usePluginManager() {
  const { t } = useTranslation();
  const { message } = useAppMessage();
  const [uninstallingId, setUninstallingId] = useState<string | null>(null);
  const [bundleState, setBundleState] = useState<BundledPluginState>("pending");

  const {
    data: plugins,
    loading,
    refresh,
  } = useRequest(fetchPlugins, {
    onError: () => message.error(t("pluginManager.loadFailed")),
  });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let refreshedAtRegistryReady = false;
    let refreshedAtReady = false;

    const poll = async () => {
      try {
        const status = await fetchBundledPluginStatus();
        if (cancelled) return;
        attempts = 0;
        setBundleState(status.state);
        if (status.state === "registry_ready") {
          if (!refreshedAtRegistryReady) {
            refreshedAtRegistryReady = true;
            // Menus and plugin manifests are authoritative now, while pages
            // that depend on agents/startup hooks continue to show loading.
            refresh();
          }
        } else if (status.state === "ready") {
          // The first list may have been a disk scan while PluginLoader was
          // still starting. Refresh once more after runtime hooks are ready so
          // loaded/status fields cannot remain stuck in their bootstrap state.
          if (!refreshedAtReady) {
            refreshedAtReady = true;
            refresh();
          }
          return;
        }
        if (status.state === "error") return;
      } catch {
        attempts += 1;
        // The backend may be in the short bootstrap/navigation window. Keep
        // retrying with a bounded backoff instead of showing "unloaded".
      }
      if (!cancelled) {
        timer = setTimeout(poll, Math.min(5000, 750 + attempts * 500));
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [refresh]);

  const handleUninstall = useCallback(
    (plugin: PluginInfo) => {
      Modal.confirm({
        title: t("pluginManager.confirmTitle"),
        content: t("pluginManager.uninstallConfirm", { name: plugin.name }),
        okType: "danger",
        okText: t("pluginManager.uninstall"),
        cancelText: t("common.cancel"),
        onOk: async () => {
          setUninstallingId(plugin.id);
          try {
            await uninstallPlugin(plugin.id);
            message.success(t("pluginManager.uninstallSuccess"));
            refresh();
            setTimeout(() => window.location.reload(), 800);
          } catch (err) {
            const msg =
              err instanceof Error
                ? err.message
                : t("pluginManager.uninstallFailed");
            message.error(msg);
          } finally {
            setUninstallingId(null);
          }
        },
      });
    },
    [message, t, refresh],
  );

  return {
    plugins,
    loading,
    bundleState,
    refresh,
    uninstallingId,
    handleUninstall,
  };
}
