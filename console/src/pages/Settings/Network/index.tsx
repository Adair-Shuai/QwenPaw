// [PROXY-BYPASS] Network proxy settings page.
// See: src/qwenpaw/docs/proxy-bypass-design.md
import { useState, useCallback, useEffect } from "react";
import { Button, Alert, Input, Segmented } from "antd";
import { useTranslation } from "react-i18next";

import api from "../../../api";
import type { NetworkConfig, ProxyMode } from "../../../api/modules/network";
import { PageHeader } from "@/components/PageHeader";
import { useAppMessage } from "../../../hooks/useAppMessage";
import styles from "./index.module.less";

function NetworkPage() {
  const { t } = useTranslation();
  const { message } = useAppMessage();

  const [config, setConfig] = useState<NetworkConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getConfig();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const handleSave = useCallback(async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.updateConfig(config);
      message.success(t("network.saveSuccess"));
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : t("network.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  }, [config, message, t]);

  const handleReset = useCallback(() => {
    void fetchConfig();
  }, [fetchConfig]);

  if (loading) {
    return (
      <div className={styles.networkPage}>
        <div className={styles.centerState}>
          <span className={styles.stateText}>{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.networkPage}>
        <div className={styles.centerState}>
          <span className={styles.stateTextError}>{error}</span>
          <Button size="small" onClick={fetchConfig} style={{ marginTop: 12 }}>
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.networkPage}>
      <PageHeader parent={t("network.parent")} current={t("network.title")} />

      <div className={styles.content}>
        <Alert
          type="info"
          showIcon
          className={styles.browserProxyAlert}
          message={t("network.browserProxyAlertTitle")}
          description={t("network.browserProxyAlertDesc")}
        />

        <div className={styles.card}>
          <div className={styles.cardTitle}>{t("network.proxyModeTitle")}</div>
          <div className={styles.cardDesc}>{t("network.proxyModeDesc")}</div>

          <Segmented<ProxyMode>
            value={config?.proxy_mode ?? "auto"}
            onChange={(val) =>
              setConfig((prev) => ({
                ...(prev as NetworkConfig),
                proxy_mode: val,
              }))
            }
            options={[
              { label: t("network.modeAuto"), value: "auto" },
              { label: t("network.modeDisabled"), value: "disabled" },
              { label: t("network.modeCustom"), value: "custom" },
            ]}
          />

          {config?.proxy_mode === "custom" && (
            <div className={styles.proxyUrlInput}>
              <Input
                placeholder={t("network.proxyUrlPlaceholder")}
                value={config.custom_proxy_url}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...(prev as NetworkConfig),
                    custom_proxy_url: e.target.value,
                  }))
                }
              />
            </div>
          )}

          <div className={styles.noProxyHint}>
            {t("network.noProxyHint", {
              hosts: config?.no_proxy_hosts?.join(", ") || "",
            })}
          </div>
        </div>
      </div>

      <div className={styles.footerButtons}>
        <Button onClick={handleReset} disabled={saving}>
          {t("common.reset")}
        </Button>
        <Button type="primary" onClick={handleSave} loading={saving}>
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}

export default NetworkPage;
