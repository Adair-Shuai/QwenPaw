import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import { useRequest } from "ahooks";
import { useAppMessage } from "@/hooks/useAppMessage";
import {
  fetchPluginCatalog,
  fetchPlugins,
  upgradeInstalledPlugin,
  type PluginInfo,
  type PluginUpdateInfo,
  uninstallPlugin,
} from "@/api/modules/plugin";
import {
  buildMarketDownloadUrl,
  fetchMarketPlugins,
  type MarketPluginEntry,
} from "@/api/modules/pluginMarket";
import { compareVersions } from "@/layouts/constants";
import { marketPluginMatches } from "@/utils/marketPluginIdentity";
import { reloadFrontendPlugin, reloadPawApp } from "@/plugins/usePluginLoader";
import { removePluginRuntime } from "@/plugins/pluginRuntimeCleanup";
import { removePluginAppState } from "@/os/osCleanup";
import { isUGSciCatalogPlugin } from "@/distribution";
import { runPluginUpgrade } from "../dependencyUpgrade";

const MARKET_PAGE_SIZE = 50;
const MARKET_MAX_PAGES = 20;

function addMarketUpdate(
  updates: Map<string, PluginUpdateInfo>,
  plugin: PluginInfo,
  entry: MarketPluginEntry,
) {
  if (!marketPluginMatches(plugin, entry)) return;
  if (compareVersions(entry.version, plugin.version) <= 0) return;
  const currentUpdate = updates.get(plugin.id);
  if (
    currentUpdate &&
    compareVersions(currentUpdate.version, entry.version) >= 0
  ) {
    return;
  }
  updates.set(plugin.id, {
    version: entry.version,
    source: buildMarketDownloadUrl(entry),
    name: entry.display_name,
  });
}

async function reloadInstalledPluginRuntime(plugin: PluginInfo): Promise<void> {
  if (!plugin.frontend_entry) return;
  if (plugin.plugin_type === "app") {
    await reloadPawApp(plugin.id);
    return;
  }
  await reloadFrontendPlugin(plugin.id);
}

export function usePluginManager() {
  const { t } = useTranslation();
  const { message } = useAppMessage();
  const [uninstallingId, setUninstallingId] = useState<string | null>(null);
  const [updates, setUpdates] = useState<Map<string, PluginUpdateInfo>>(
    new Map(),
  );
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingAll, setUpdatingAll] = useState(false);
  const [queuedIds, setQueuedIds] = useState<ReadonlySet<string>>(new Set());
  const queuedVersions = useRef(new Map<string, string>());
  const updateRequestRef = useRef<AbortController | null>(null);
  const marketEntriesRef = useRef<MarketPluginEntry[] | null>(null);

  const {
    data: plugins,
    loading,
    refresh,
  } = useRequest(fetchPlugins, {
    onError: () => message.error(t("pluginManager.loadFailed")),
  });

  const loadUpdates = useCallback(async (installed: PluginInfo[]) => {
    updateRequestRef.current?.abort();
    if (installed.length === 0) {
      setUpdates(new Map());
      return;
    }

    const controller = new AbortController();
    updateRequestRef.current = controller;
    setUpdatesLoading(true);
    try {
      const nextUpdates = new Map<string, PluginUpdateInfo>();
      const catalog = await fetchPluginCatalog().catch(() => null);
      if (controller.signal.aborted) return;

      for (const entry of catalog?.plugins ?? []) {
        const plugin = installed.find((item) => item.id === entry.plugin_id);
        if (!plugin || !entry.upgrade_available) continue;
        const currentUpdate = nextUpdates.get(plugin.id);
        if (
          currentUpdate &&
          compareVersions(currentUpdate.version, entry.version) >= 0
        ) {
          continue;
        }
        nextUpdates.set(plugin.id, {
          version: entry.version,
          source: entry.install_url,
          name: entry.name,
          channel: isUGSciCatalogPlugin(entry) ? "ugsci" : entry.channel,
          sha256: entry.sha256,
        });
      }

      let marketEntries = marketEntriesRef.current;
      if (marketEntries === null) {
        marketEntries = [];
        const seenEntryIds = new Set<string>();
        let page = 1;
        let total = Number.POSITIVE_INFINITY;
        try {
          while (
            !controller.signal.aborted &&
            page <= MARKET_MAX_PAGES &&
            marketEntries.length < total
          ) {
            const result = await fetchMarketPlugins(
              {
                page_number: page,
                page_size: MARKET_PAGE_SIZE,
                sort_by: "updated_time",
              },
              { signal: controller.signal },
            );
            total = result.total;
            if (result.plugins.length === 0) break;

            const previousSize = seenEntryIds.size;
            for (const entry of result.plugins) {
              if (seenEntryIds.has(entry.id)) continue;
              seenEntryIds.add(entry.id);
              marketEntries.push(entry);
            }
            if (seenEntryIds.size === previousSize) break;
            page += 1;
          }
          marketEntriesRef.current = marketEntries;
        } catch (err) {
          if (controller.signal.aborted) return;
          console.warn("Failed to check community plugin updates", err);
        }
      }

      if (controller.signal.aborted) return;
      for (const plugin of installed) {
        for (const entry of marketEntries) {
          addMarketUpdate(nextUpdates, plugin, entry);
        }
      }
      for (const [id, version] of queuedVersions.current) {
        if (nextUpdates.get(id)?.version === version) nextUpdates.delete(id);
      }
      setUpdates(nextUpdates);
    } finally {
      if (updateRequestRef.current === controller) {
        updateRequestRef.current = null;
        setUpdatesLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadUpdates(plugins ?? []);
    return () => updateRequestRef.current?.abort();
  }, [loadUpdates, plugins]);

  const refreshUpdates = useCallback(() => {
    marketEntriesRef.current = null;
    return refresh();
  }, [refresh]);

  const updateOne = useCallback(
    async (plugin: PluginInfo) => {
      const update = updates.get(plugin.id);
      if (!update || updatingId !== null || updatingAll) return;
      setUpdatingId(plugin.id);
      try {
        const result = await runPluginUpgrade(
          () => upgradeInstalledPlugin(plugin.id, update),
          t,
        );
        if (result === null) return;
        if (result.method === "core-update-required") {
          message.warning(t("pluginManager.coreUpdateRequired"));
          return;
        }
        if (result.method === "queued") {
          queuedVersions.current.set(plugin.id, update.version);
          setQueuedIds(new Set(queuedVersions.current.keys()));
          message.success(t("pluginManager.ugsciUpgradeQueued"));
        } else if (result.method === "replaced") {
          await reloadInstalledPluginRuntime(plugin);
          message.success(t("pluginManager.updateSuccess"));
        } else {
          message.info(t("pluginManager.catalogLatest"));
        }
        setUpdates((current) => {
          const next = new Map(current);
          next.delete(plugin.id);
          return next;
        });
      } catch (err) {
        message.error(
          err instanceof Error ? err.message : t("pluginManager.updateFailed"),
        );
      } finally {
        await refresh();
        setUpdatingId(null);
      }
    },
    [message, refresh, t, updates, updatingAll, updatingId],
  );

  const updateAll = useCallback(async () => {
    if (updatingAll || updatingId !== null || updates.size === 0) return;
    setUpdatingAll(true);
    const completedIds = new Set<string>();
    const failedPluginNames: string[] = [];
    let cancelled = false;
    try {
      for (const plugin of plugins ?? []) {
        const update = updates.get(plugin.id);
        if (!update) continue;
        setUpdatingId(plugin.id);
        try {
          const result = await runPluginUpgrade(
            () => upgradeInstalledPlugin(plugin.id, update),
            t,
          );
          if (result === null) {
            cancelled = true;
            break;
          }
          if (result.method === "core-update-required") {
            throw new Error(t("pluginManager.coreUpdateRequired"));
          }
          if (result.method === "queued") {
            queuedVersions.current.set(plugin.id, update.version);
            setQueuedIds(new Set(queuedVersions.current.keys()));
          } else if (result.method === "replaced") {
            await reloadInstalledPluginRuntime(plugin);
          }
          completedIds.add(plugin.id);
          setUpdates((current) => {
            const next = new Map(current);
            next.delete(plugin.id);
            return next;
          });
        } catch (error) {
          failedPluginNames.push(
            error instanceof Error && error.message
              ? `${plugin.name}: ${error.message}`
              : plugin.name,
          );
        }
      }
      if (cancelled) return;
      if (failedPluginNames.length === 0) {
        message.success(
          t(
            queuedVersions.current.size > 0
              ? "pluginManager.ugsciUpgradeQueued"
              : "pluginManager.updateAllSuccess",
          ),
        );
      } else {
        message.error(
          t("pluginManager.updateAllResult", {
            succeeded: completedIds.size,
            failed: failedPluginNames.length,
            names: failedPluginNames.join(", "),
          }),
        );
      }
    } finally {
      if (completedIds.size > 0) {
        setUpdates((current) => {
          const next = new Map(current);
          for (const id of completedIds) next.delete(id);
          return next;
        });
      }
      try {
        await refresh();
      } finally {
        setUpdatingId(null);
        setUpdatingAll(false);
      }
    }
  }, [message, plugins, refresh, t, updatingAll, updatingId, updates]);

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
            if (plugin.plugin_type === "app") {
              removePluginAppState(plugin.id);
            } else {
              removePluginRuntime(plugin.id);
            }
            message.success(t("pluginManager.uninstallSuccess"));
            await refresh();
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
    refresh,
    refreshUpdates,
    uninstallingId,
    handleUninstall,
    updates,
    updatesLoading,
    updatingId,
    updatingAll,
    queuedIds,
    updateOne,
    updateAll,
  };
}
