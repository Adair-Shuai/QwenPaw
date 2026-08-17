import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppMessage } from "@/hooks/useAppMessage";
import {
  fetchMarketPlugins,
  buildMarketDownloadUrl,
  type MarketPluginEntry,
  type MarketPluginSortBy,
} from "@/api/modules/pluginMarket";
import { installPlugin, replaceInstalledPlugin } from "@/api/modules/plugin";
import { isMarketPluginCompatible } from "@/utils/pluginCompatibility";

export { isMarketPluginCompatible } from "@/utils/pluginCompatibility";

interface UseMarketPluginsOptions {
  onInstalled: () => void;
}

function isNewerVersion(candidate: string, installed: string): boolean {
  const toParts = (value: string) =>
    value
      .replace(/^v/i, "")
      .split(/[.-]/)
      .map((part) => Number(part) || 0);
  const left = toParts(candidate);
  const right = toParts(installed);
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return false;
}

export function isMarketUpgradeAvailable(entry: MarketPluginEntry): boolean {
  return Boolean(
    entry.installed &&
      entry.installed_version &&
      isNewerVersion(entry.version, entry.installed_version),
  );
}

export function useMarketPlugins({ onInstalled }: UseMarketPluginsOptions) {
  const { t } = useTranslation();
  const { message } = useAppMessage();
  const tRef = useRef(t);
  tRef.current = t;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plugins, setPlugins] = useState<MarketPluginEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<MarketPluginSortBy>("downloads");
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [qwenpawVersion, setQwenpawVersion] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/version", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const version =
          typeof data === "object" && data !== null ? data.version : null;
        setQwenpawVersion(typeof version === "string" ? version : null);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("[useMarketPlugins] failed to fetch version:", err);
        setQwenpawVersion(null);
      });
    return () => {
      controller.abort();
    };
  }, []);

  const loadPlugins = useCallback(
    async (
      pageNum: number,
      keyword: string,
      cat: string | undefined,
      sort: MarketPluginSortBy,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMarketPlugins({
          page_number: pageNum,
          page_size: pageSize,
          search: keyword || undefined,
          category: cat || undefined,
          sort_by: sort,
        });
        setPlugins(data.plugins ?? []);
        setTotal(data.total);
      } catch {
        setError(tRef.current("pluginManager.marketUnavailable"));
        setPlugins([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    void loadPlugins(page, search, category, sortBy);
  }, [page, search, category, sortBy, loadPlugins]);

  const handleSearch = useCallback((keyword: string) => {
    setSearch(keyword);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((cat: string | undefined) => {
    setCategory(cat);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((sort: MarketPluginSortBy) => {
    setSortBy(sort);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRefresh = useCallback(() => {
    void loadPlugins(page, search, category, sortBy);
  }, [loadPlugins, page, search, category, sortBy]);

  const isCompatible = useCallback(
    (entry: MarketPluginEntry) =>
      isMarketPluginCompatible(entry, qwenpawVersion),
    [qwenpawVersion],
  );

  const handleInstall = useCallback(
    async (entry: MarketPluginEntry) => {
      setInstallingId(entry.id);
      try {
        const downloadUrl = buildMarketDownloadUrl(entry);
        if (entry.installed) {
          if (!isMarketUpgradeAvailable(entry)) {
            message.info(tRef.current("pluginManager.catalogLatest"));
            return;
          }
          const pluginId = entry.id.startsWith("@")
            ? entry.id.slice(1).split("/").pop() || entry.id.slice(1)
            : entry.id.split("/").pop() || entry.id;
          const result = await replaceInstalledPlugin({
            source: downloadUrl,
            pluginId,
            version: entry.version,
          });
          message.success(
            tRef.current("pluginManager.externalUpgradeReady", {
              version: result.version,
            }),
          );
          onInstalled();
          return;
        }
        const result = await installPlugin(downloadUrl);
        message.success(
          `${tRef.current("pluginManager.installSuccess")}: ${result.name}`,
        );
        onInstalled();
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : tRef.current("pluginManager.installFailed");
        message.error(msg);
      } finally {
        setInstallingId(null);
      }
    },
    [message, onInstalled],
  );

  return {
    loading,
    error,
    plugins,
    total,
    page,
    pageSize,
    category,
    sortBy,
    installingId,
    qwenpawVersion,
    isCompatible,
    handleSearch,
    handleCategoryChange,
    handleSortChange,
    handlePageChange,
    handleRefresh,
    handleInstall,
  };
}
