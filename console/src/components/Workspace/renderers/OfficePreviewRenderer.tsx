import { useState } from "react";
import { Segmented } from "antd";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";
import OfficeDocRenderer from "./OfficeDocRenderer";
import OfficeScreenshotRenderer from "./OfficeScreenshotRenderer";

/** Keep the mode selector mounted so both preview paths remain reachable. */
export default function OfficePreviewRenderer(
  props: RendererContext & { initialMode?: string },
) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(props.initialMode ?? "html");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "6px 8px",
          borderBottom: "1px solid var(--app-border-color, #eee)",
        }}
      >
        <Segmented
          aria-label={t("workspace.officePreviewMode", "Office 预览模式")}
          value={mode}
          onChange={(value) => setMode(String(value))}
          options={[
            { value: "html", label: t("workspace.officeReading", "文档阅读") },
            { value: "print", label: t("workspace.officePrint", "打印版式") },
          ]}
        />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {mode === "html" ? (
          <OfficeDocRenderer {...props} />
        ) : (
          <OfficeScreenshotRenderer
            key={[
              props.artifact.id,
              props.artifact.binaryUrl,
              props.artifact.agentId,
              props.artifact.chatId,
              props.artifact.projectDirOverride,
            ].join("|")}
            {...props}
            onReadView={() => setMode("html")}
          />
        )}
      </div>
    </div>
  );
}

export function OfficePrintPreviewRenderer(props: RendererContext) {
  return <OfficePreviewRenderer {...props} initialMode="print" />;
}
