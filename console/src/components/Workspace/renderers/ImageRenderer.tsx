/** ImageRenderer — 图片查看器，支持缩放、旋转和全屏 */
import React, { useState } from "react";
import { Button, Space, Tooltip } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";

const ImageRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const url = artifact.binaryUrl ?? "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: theme === "dark" ? "#1e1e1e" : "#fafafa",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px",
          borderBottom: `1px solid ${theme === "dark" ? "#333" : "#f0f0f0"}`,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, color: "#999" }}>
          {Math.round(zoom * 100)}%
        </span>
        <Space size={2}>
          <Tooltip title={t("workspace.zoomIn")}>
            <Button
              size="small"
              type="text"
              icon={<ZoomInOutlined />}
              onClick={() => setZoom((z) => Math.min(z + 0.25, 5))}
            />
          </Tooltip>
          <Tooltip title={t("workspace.zoomOut")}>
            <Button
              size="small"
              type="text"
              icon={<ZoomOutOutlined />}
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.1))}
            />
          </Tooltip>
          <Tooltip title={t("workspace.rotateLeft")}>
            <Button
              size="small"
              type="text"
              icon={<RotateLeftOutlined />}
              onClick={() => setRotation((r) => r - 90)}
            />
          </Tooltip>
          <Tooltip title={t("workspace.rotateRight")}>
            <Button
              size="small"
              type="text"
              icon={<RotateRightOutlined />}
              onClick={() => setRotation((r) => r + 90)}
            />
          </Tooltip>
          <Tooltip title={t("workspace.download")}>
            <Button
              size="small"
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => workspace.download?.(artifact)}
            />
          </Tooltip>
        </Space>
      </div>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <img
          src={url}
          alt={artifact.title}
          style={{
            maxWidth: "100%",
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: "transform 0.2s",
          }}
        />
      </div>
    </div>
  );
};

export default ImageRenderer;
