import { Layout, message, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { Button } from "@agentscope-ai/design";
import { Info as InfoCircleOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher, {
  LANGUAGE_LIST,
} from "../components/LanguageSwitcher/index";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { useTheme } from "../contexts/ThemeContext";
import { Slot } from "../plugins/registry/Slot";
import { applyLanguagePreference } from "../utils/languagePreference";
import AppBrand from "./AppBrand";
import styles from "./index.module.less";

const { Header: AntHeader } = Layout;

export default function Header({ showBrand = false }: { showBrand?: boolean }) {
  const { t, i18n } = useTranslation();
  const { setThemeMode } = useTheme();

  const mobileMenuItems: MenuProps["items"] = [
    {
      key: "language",
      label: t("sidebar.settings.language"),
      children: LANGUAGE_LIST.map(({ key, label }) => ({
        key,
        label,
        onClick: () => {
          applyLanguagePreference(i18n, key, {
            onPersistError: () =>
              message.error(t("agentConfig.languageSaveFailed")),
          });
        },
      })),
    },
    {
      key: "theme",
      label: t("sidebar.settings.theme"),
      children: [
        {
          key: "light",
          label: t("theme.light"),
          onClick: () => setThemeMode("light"),
        },
        {
          key: "dark",
          label: t("theme.dark"),
          onClick: () => setThemeMode("dark"),
        },
        {
          key: "system",
          label: t("theme.system"),
          onClick: () => setThemeMode("system"),
        },
      ],
    },
  ];

  return (
    <AntHeader
      className={`${styles.header} ${
        showBrand ? styles.headerWithBrand : styles.headerPluginOnly
      }`}
    >
      <div className={styles.headerPluginLeft}>
        {showBrand && <AppBrand />}
        <Slot name="header.left" kind="fill" />
      </div>
      <div className={styles.headerActions}>
        <Slot name="header.right" kind="fill" />
        {showBrand && (
          <>
            <div className={styles.utilityGroup}>
              <span className={styles.hideOnMobile}>
                <LanguageSwitcher />
              </span>
              <span className={styles.hideOnMobile}>
                <ThemeToggleButton />
              </span>
            </div>
            <Dropdown menu={{ items: mobileMenuItems }} placement="bottomRight">
              <Button
                type="text"
                icon={<InfoCircleOutlined size="1em" />}
                className={styles.showOnMobile}
                title={t("header.resources")}
              />
            </Dropdown>
          </>
        )}
      </div>
    </AntHeader>
  );
}
