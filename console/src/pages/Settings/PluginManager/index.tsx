import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Tabs } from "antd";
import { CloudUpload, Plus } from "lucide-react";
import { MarketplaceHeader } from "@/pages/Market/components/MarketplaceHeader";
import { usePluginManager } from "./hooks/usePluginManager";
import { useInstallModal } from "./hooks/useInstallModal";
import { InstallPluginModal } from "./components/InstallPluginModal";
import { InstalledPluginList } from "./components/InstalledPluginList";
import { OfficialPluginList } from "./components/OfficialPluginList";
import { MarketPluginList } from "./components/MarketPluginList";
import { UGSciPublisherModal } from "@/components/UGSciPublisher/UGSciPublisherModal";
import styles from "./index.module.less";

export default function PluginManagerPage() {
  const { t } = useTranslation();
  const [publisherOpen, setPublisherOpen] = useState(false);

  const {
    plugins,
    loading,
    bundleState,
    refresh,
    uninstallingId,
    handleUninstall,
  } = usePluginManager();

  const installModal = useInstallModal(refresh);

  const tabItems = [
    {
      key: "installed",
      label: t("pluginManager.installed"),
      children: (
        <InstalledPluginList
          plugins={plugins}
          loading={loading}
          uninstallingId={uninstallingId}
          bundleState={bundleState}
          onRefresh={refresh}
          onUninstall={handleUninstall}
        />
      ),
    },
    {
      key: "official",
      label: t("pluginManager.officialTitle"),
      children: <OfficialPluginList source="qwenpaw" onInstalled={refresh} />,
    },
    {
      key: "ugsci",
      label: t("pluginManager.ugsciTitle"),
      children: <OfficialPluginList source="ugsci" onInstalled={refresh} />,
    },
    {
      key: "market",
      label: t("pluginManager.marketTitle"),
      children: <MarketPluginList onInstalled={refresh} />,
    },
  ];

  return (
    <div className={styles.page}>
      <MarketplaceHeader
        activeSection="plugins"
        extra={
          <div className={styles.headerActions}>
            <Button
              icon={<CloudUpload size={16} />}
              onClick={() => setPublisherOpen(true)}
            >
              发布到 UGSci
            </Button>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={installModal.openModal}
            >
              {t("pluginManager.installBtn")}
            </Button>
          </div>
        }
      />

      <div className={styles.content}>
        <Tabs items={tabItems} className={styles.tabs} />
      </div>

      <InstallPluginModal {...installModal} />
      <UGSciPublisherModal
        open={publisherOpen}
        kind="plugin"
        onClose={() => setPublisherOpen(false)}
      />
    </div>
  );
}
