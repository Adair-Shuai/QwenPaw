import { getHost, type QwenPawHost } from "../core/runtime";
import { GenUiSettingsSection } from "../genui/GenUiSettingsPage";

function SidebarDensitySettingsSection({
  preference,
}: {
  preference: NonNullable<QwenPawHost["sidebarDensity"]>;
}) {
  const { React, antd } = getHost();
  const density = React.useSyncExternalStore(
    preference.subscribe,
    preference.get,
  );
  return React.createElement(
    "section",
    {
      "aria-labelledby": "ugsci-sidebar-density-title",
      style: { marginBottom: 28 },
    },
    React.createElement(
      antd.Typography.Title,
      { level: 3, id: "ugsci-sidebar-density-title" },
      "侧边栏",
    ),
    React.createElement(
      antd.Card,
      null,
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          },
        },
        React.createElement(
          "div",
          null,
          React.createElement(
            antd.Typography.Text,
            { strong: true },
            "图标紧凑程度",
          ),
          React.createElement(
            antd.Typography.Paragraph,
            { type: "secondary", style: { margin: "4px 0 0" } },
            "调整功能导航的图标间距。默认中等，可显示更多入口，修改后自动保存。",
          ),
        ),
        React.createElement(antd.Segmented, {
          "aria-label": "侧边栏图标紧凑程度",
          value: density,
          options: [
            { value: "comfortable", label: "宽松" },
            { value: "medium", label: "中等" },
            { value: "compact", label: "紧凑" },
          ],
          onChange: preference.set,
        }),
      ),
    ),
  );
}

/** UGSci preferences live here so new settings share the same entry point. */
export function UgsciSettingsPage() {
  const { React, antd, sidebarDensity } = getHost();
  return React.createElement(
    "div",
    { style: { width: "100%" } },
    React.createElement(antd.Typography.Title, { level: 2 }, "UGSci 设置"),
    React.createElement(
      antd.Typography.Paragraph,
      { type: "secondary", style: { marginBottom: 28 } },
      "集中管理 UGSci 的功能与偏好设置。",
    ),
    sidebarDensity &&
      React.createElement(SidebarDensitySettingsSection, {
        preference: sidebarDensity,
      }),
    React.createElement(GenUiSettingsSection),
  );
}

/** Preserve bookmarks while keeping Settings Center as the visible destination. */
export function LegacyGenUiSettingsRedirect() {
  const { React } = getHost();
  React.useEffect(() => {
    window.history.replaceState({}, "", "/settings/ugsci");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);
  return null;
}
