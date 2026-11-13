import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Tag, Tooltip, Button, Space, Typography, Spin } from "antd";
import { Package, Trash2 } from "lucide-react";
import type {
  BundledPluginState,
  PluginType,
  PluginInfo,
} from "@/api/modules/plugin";
import { PluginTypeTag } from "../components/PluginTypeTag";
import { CommunityFeedback } from "@/components/CommunityFeedback";
import { PluginStatusTag } from "../components/PluginStatusTag";

const { Text } = Typography;

interface UsePluginColumnsOptions {
  uninstallingId: string | null;
  /** Bundled-plugin repair status; omit when the caller has no repair flow. */
  bundleState?: BundledPluginState;
  renderActivation: (record: PluginInfo) => ReactNode;
  onUninstall: (record: PluginInfo) => void;
}

export function usePluginColumns({
  uninstallingId,
  bundleState = "ready",
  renderActivation,
  onUninstall,
}: UsePluginColumnsOptions) {
  const { t } = useTranslation();

  return [
    {
      title: t("pluginManager.title"),
      dataIndex: "name",
      key: "name",
      render: (name: string, record: PluginInfo) => (
        <Space direction="vertical" size={2}>
          <Space size={8}>
            <CommunityFeedback
              origin={record.installation_origin}
              installedPluginId={record.id}
              installedVersion={record.version}
              resourceName={name}
              variant="inline"
            />
            <Package size={16} style={{ flexShrink: 0 }} />
            <Text strong>{name}</Text>
          </Space>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: t("pluginManager.type"),
      dataIndex: "plugin_type",
      key: "plugin_type",
      width: 110,
      render: (type: PluginType) => <PluginTypeTag type={type ?? "general"} />,
    },
    {
      title: t("pluginManager.version"),
      dataIndex: "version",
      key: "version",
      width: 100,
      render: (version: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {version}
        </Text>
      ),
    },
    {
      title: t("pluginManager.author"),
      dataIndex: "author",
      key: "author",
      width: 140,
      render: (author: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {author || t("pluginManager.unknown")}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "loaded",
      key: "loaded",
      width: 110,
      render: (loaded: boolean, record: PluginInfo) => {
        if (!loaded && bundleState !== "ready" && bundleState !== "error") {
          return (
            <Tag
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <Spin size="small" /> {t("common.loading")}
            </Tag>
          );
        }
        return <PluginStatusTag plugin={record} />;
      },
    },
    {
      title: "",
      key: "actions",
      width: 100,
      render: (_: unknown, record: PluginInfo) => (
        <Space>
          {renderActivation(record)}
          <Tooltip title={t("pluginManager.uninstall")}>
            <Button
              type="text"
              danger
              icon={<Trash2 size={14} />}
              loading={uninstallingId === record.id}
              onClick={() => onUninstall(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
}
