import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Empty, Spin, Table, Tabs } from "antd";
import { CloudUpload, Package, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { usePluginManager } from "./hooks/usePluginManager";
import { usePluginColumns } from "./hooks/usePluginColumns";
import { useInstallModal } from "./hooks/useInstallModal";
import { InstallPluginModal } from "./components/InstallPluginModal";
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

  const columns = usePluginColumns({
    uninstallingId,
    bundleState,
    onUninstall: handleUninstall,
  });

  const tabItems = [
    {
      key: "installed",
      label: t("pluginManager.installed"),
      children: (
        <Spin spinning={loading}>
          {!loading && (!plugins || plugins.length === 0) ? (
            <Empty
              image={<Package size={48} strokeWidth={1} />}
              description={t("pluginManager.noPlugins")}
              style={{ marginTop: 24 }}
            />
          ) : (
            <Table
              dataSource={plugins}
              columns={columns}
              rowKey="id"
              pagination={false}
              className={styles.table}
            />
          )}
        </Spin>
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
      <PageHeader
        parent={t("nav.settings")}
        current={t("nav.pluginManager")}
        extra={
          <>
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
          </>
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
