import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppMessage } from "@/hooks/useAppMessage";
import { subscribeToPluginChanges } from "@/utils/pluginChangeEvents";
import {
  fetchPluginCatalog,
  installPlugin,
  upgradeInstalledPlugin,
  type InstallPluginResult,
  type OfficialPluginCatalogEntry,
} from "@/api/modules/plugin";
import { isUGSciCatalogPlugin } from "@/distribution";
import { runPluginInstall, runPluginUpgrade } from "../dependencyUpgrade";

interface UseOfficialPluginsOptions {
  onInstalled: (result: InstallPluginResult) => void | Promise<void>;
}

export function useOfficialPlugins({ onInstalled }: UseOfficialPluginsOptions) {
  const { t } = useTranslation();
  const { message } = useAppMessage();
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [plugins, setPlugins] = useState<OfficialPluginCatalogEntry[]>([]);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadCatalog = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setCatalogError(null);
    try {
      const data = await fetchPluginCatalog();
      if (id !== requestId.current) return;
      setCatalogError(data.error || null);
      setPlugins(data.plugins ?? []);
    } catch (err) {
      if (id !== requestId.current) return;
      const msg =
        err instanceof Error
          ? err.message
          : t("pluginManager.catalogLoadFailed");
      setCatalogError(msg);
      setPlugins([]);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadCatalog();
    const unsubscribe = subscribeToPluginChanges(() => void loadCatalog());
    return () => {
      unsubscribe();
      ++requestId.current;
    };
  }, [loadCatalog]);

  const handleInstall = useCallback(
    async (entry: OfficialPluginCatalogEntry) => {
      setInstallingId(entry.id);
      try {
        if (entry.installed) {
          if (!entry.upgrade_available) {
            message.info(t("pluginManager.catalogLatest"));
            return;
          }
          const result = await runPluginUpgrade(
            () =>
              upgradeInstalledPlugin(entry.plugin_id, {
                source: entry.install_url,
                version: entry.version,
                name: entry.name,
                sha256: entry.sha256,
                channel: isUGSciCatalogPlugin(entry) ? "ugsci" : entry.channel,
              }),
            t,
          );
          if (result === null) return;
          if (result.method === "queued") {
            message.success(t("pluginManager.ugsciUpgradeQueued"));
          } else if (result.method === "core-update-required") {
            message.warning(t("pluginManager.coreUpdateRequired"));
          } else if (result.method === "up-to-date") {
            message.info(t("pluginManager.catalogLatest"));
          } else {
            await onInstalled({
              id: entry.plugin_id,
              name: entry.name,
              version: result.version,
              description: entry.description,
              loaded: true,
              message: "",
            });
            message.success(t("pluginManager.updateSuccess"));
          }
          return;
        }
        const result = await runPluginInstall(
          () => installPlugin(entry.install_url),
          t,
        );
        if (result === null) return;
        message.success(`${t("pluginManager.installSuccess")}: ${result.name}`);
        await onInstalled(result);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : t("pluginManager.installFailed");
        message.error(msg);
      } finally {
        setInstallingId(null);
      }
    },
    [message, onInstalled, t],
  );

  return {
    loading,
    catalogError,
    plugins,
    installingId,
    loadCatalog,
    handleInstall,
  };
}
