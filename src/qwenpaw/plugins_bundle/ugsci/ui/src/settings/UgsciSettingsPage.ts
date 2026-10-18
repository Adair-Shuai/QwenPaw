import { getHost } from "../core/runtime";
import { GenUiSettingsSection } from "../genui/GenUiSettingsPage";

/** UGSci preferences live here so new settings share the same entry point. */
export function UgsciSettingsPage() {
  const { React, antd } = getHost();
  return React.createElement(
    "div",
    { style: { width: "100%" } },
    React.createElement(antd.Typography.Title, { level: 2 }, "UGSci 设置"),
    React.createElement(
      antd.Typography.Paragraph,
      { type: "secondary", style: { marginBottom: 28 } },
      "集中管理 UGSci 的功能与偏好设置。",
    ),
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
