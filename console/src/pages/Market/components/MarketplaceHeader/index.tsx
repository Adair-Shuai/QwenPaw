import type { ReactNode } from "react";
import { Tabs, type TabsProps } from "@agentscope-ai/design";
import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { marketplaceExtensionRegistry } from "../../marketplaceRegistry";
import styles from "./index.module.less";

export type MarketplaceSection = string;

const SECTION_PATHS: Record<string, string> = {
  community: "/market?tab=community",
  apps: "/market",
  plugins: "/market?tab=plugins",
  skills: "/market?tab=skills",
};

interface MarketplaceHeaderProps {
  activeSection: MarketplaceSection;
  extra?: ReactNode;
}

export function MarketplaceHeader({
  activeSection,
  extra,
}: MarketplaceHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const extensions = useSyncExternalStore(
    (listener) => marketplaceExtensionRegistry.subscribe(listener),
    () => marketplaceExtensionRegistry.snapshot(),
    () => marketplaceExtensionRegistry.snapshot(),
  );
  const items: TabsProps["items"] = [
    { key: "apps", label: t("nav.apps", "Apps") },
    { key: "plugins", label: t("nav.plugins", "Plugins") },
    { key: "skills", label: t("nav.skills", "Skills") },
    ...extensions.map((extension) => ({
      key: extension.id,
      label: extension.label,
    })),
    { key: "community", label: t("communityCompose.nav", "Community") },
  ];

  const handleChange = (section: string) => {
    const basePath =
      SECTION_PATHS[section as keyof typeof SECTION_PATHS] ??
      `/market?tab=${encodeURIComponent(section)}`;
    const path = basePath.replace(
      "/market",
      pathname.startsWith("/settings/") ? "/settings/marketplace" : "/market",
    );
    const target = searchParams.get("target");
    const targetSuffix =
      target === "pool" || target === "workspace"
        ? `${path.includes("?") ? "&" : "?"}target=${target}`
        : "";
    navigate(`${path}${targetSuffix}`);
  };

  return (
    <PageHeader
      current={t("nav.marketplace", "Extension")}
      center={
        <div className={styles.navigation}>
          <Tabs
            className={styles.sectionSwitch}
            activeKey={activeSection}
            items={items}
            onChange={handleChange}
            type="segmented"
          />
        </div>
      }
      extra={extra}
    />
  );
}
