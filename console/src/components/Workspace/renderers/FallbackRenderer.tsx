/** FallbackRenderer — 未知文件类型的兜底渲染器 */
import React from "react";
import { Button, Typography } from "antd";
import { DownloadOutlined, FileUnknownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";

const FallbackRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: 24,
        gap: 12,
        background: theme === "dark" ? "#1e1e1e" : "#fafafa",
      }}
    >
      <FileUnknownOutlined style={{ fontSize: 48, color: "#999" }} />
      <Typography.Text type="secondary">
        {t("workspace.unsupportedType", {
          type: artifact.mimeType || artifact.extension || "unknown",
        })}
      </Typography.Text>
      <Typography.Text style={{ fontSize: 12, color: "#999" }}>
        {artifact.title}
      </Typography.Text>
      {artifact.binaryUrl && (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => workspace.download?.(artifact)}
        >
          {t("workspace.download")}
        </Button>
      )}
    </div>
  );
};

export default FallbackRenderer;
