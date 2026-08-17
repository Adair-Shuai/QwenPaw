import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppMessage } from "@/hooks/useAppMessage";
import {
  fetchQwenPawPluginCatalog,
  fetchUGSciPluginCatalog,
  installPlugin,
  replaceInstalledPlugin,
  type OfficialPluginCatalogEntry,
  type PluginCatalogSource,
} from "@/api/modules/plugin";
import { api } from "@/api";

interface UseOfficialPluginsOptions {
  onInstalled: () => void;
  source: PluginCatalogSource;
}

export function useOfficialPlugins({
  onInstalled,
  source,
}: UseOfficialPluginsOptions) {
  const { t } = useTranslation();
  const { message } = useAppMessage();
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [plugins, setPlugins] = useState<OfficialPluginCatalogEntry[]>([]);
  const [installingId, setInstallingId] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setCatalogError(null);
    try {
      const data =
        source === "ugsci"
          ? await fetchUGSciPluginCatalog()
          : await fetchQwenPawPluginCatalog();
      if (data.error) {
        setCatalogError(data.error);
        setPlugins([]);
      } else {
        setPlugins(data.plugins ?? []);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : t("pluginManager.catalogLoadFailed");
      setCatalogError(msg);
      setPlugins([]);
    } finally {
      setLoading(false);
    }
  }, [source, t]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const handleInstall = useCallback(
    async (entry: OfficialPluginCatalogEntry) => {
      setInstallingId(entry.id);
      try {
        if (source === "ugsci" && entry.installed) {
          const result = await api.queueComponentUpdate(entry.plugin_id);
          if (!result.queued) {
            message.info(t("pluginManager.catalogLatest"));
            return;
          }
          message.success(t("pluginManager.ugsciUpgradeQueued"));
          return;
        }
        if (source === "qwenpaw" && entry.installed) {
          const result = await replaceInstalledPlugin({
            source: entry.install_url,
            pluginId: entry.plugin_id,
            version: entry.version,
            sha256: entry.sha256,
          });
          message.success(
            t("pluginManager.externalUpgradeReady", {
              version: result.version,
            }),
          );
          onInstalled();
          return;
        }
        const result = await installPlugin(entry.install_url, {
          force: false,
        });
        message.success(`${t("pluginManager.installSuccess")}: ${result.name}`);
        onInstalled();
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : t("pluginManager.installFailed");
        message.error(msg);
      } finally {
        setInstallingId(null);
      }
    },
    [message, onInstalled, source, t],
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
