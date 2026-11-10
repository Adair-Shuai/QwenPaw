import type { ReactNode } from "react";
import {
  FolderOpen,
  House,
  PanelLeftOpen,
  Settings,
  Puzzle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SearchTrigger } from "../features/global-search/SearchTrigger";
import type { FlatMenuEntry } from "./registry/adapter";
import styles from "./dualSidebar.module.less";

export const DUAL_SIDEBAR_PRIMARY_KEYS = [
  "core.files",
  "ugsci.experts",
  "flowforge.editor",
  "core.app-center",
  "core.cron-jobs",
  "core.run-center",
  "core.inbox",
] as const;

export const DUAL_SIDEBAR_FIXED_KEYS: readonly string[] = [
  ...DUAL_SIDEBAR_PRIMARY_KEYS,
  "core.chat",
  "core.marketplace",
  "core.app-center.embed",
  "core.settings-center",
];

export default function DualSidebarNavigation({
  entries,
  selectedKey,
  collapsed,
  onExpand,
  onHome,
  onNavigate,
  onWorkspace,
  onSettings,
  inboxIcon,
  children,
  shortcuts = [],
  currentPath,
}: {
  entries: FlatMenuEntry[];
  selectedKey: string;
  collapsed: boolean;
  onExpand?: () => void;
  onHome: () => void;
  onNavigate: (entry: FlatMenuEntry) => void;
  onWorkspace?: (trigger: HTMLElement) => void;
  onSettings: () => void;
  inboxIcon: ReactNode;
  children: ReactNode;
  shortcuts?: FlatMenuEntry[];
  currentPath?: string;
}) {
  const { t } = useTranslation();
  const activeKey =
    selectedKey === "core.marketplace" ||
    selectedKey === "core.app-center.embed"
      ? "core.app-center"
      : selectedKey;
  const renderEntry = (key: string, label: string) => {
    const entry = entries.find((item) => item.key === key);
    if (!entry) return null;
    return (
      <button
        type="button"
        aria-label={label}
        title={typeof entry.label === "string" ? entry.label : label}
        aria-current={activeKey === key ? "page" : undefined}
        onClick={() => onNavigate(entry)}
      >
        {key === "core.inbox" ? inboxIcon : entry.icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <nav
      className={styles.rail}
      aria-label={t("sidebar.dualSidebar.navigation", "Feature navigation")}
    >
      <div className={styles.brand}>
        <span
          role="img"
          aria-label="UGSci"
          className={styles.brandMark}
          style={{
            maskImage: `url("${
              import.meta.env.BASE_URL
            }ugsci-mono/brand/mark.svg")`,
          }}
        />
        <strong>UGSci</strong>
      </div>
      <div className={styles.primary}>
        {collapsed && (
          <div className={styles.collapsedActions}>
            {onExpand && (
              <button
                type="button"
                aria-label={t(
                  "sidebar.dualSidebar.expand",
                  "Expand conversation pane",
                )}
                onClick={onExpand}
                title={t(
                  "sidebar.dualSidebar.expand",
                  "Expand conversation pane",
                )}
              >
                <PanelLeftOpen size={18} />
                <span>{t("sidebar.expand", "Expand sidebar")}</span>
              </button>
            )}
            <SearchTrigger compact />
          </div>
        )}
        <button
          type="button"
          aria-current={selectedKey === "core.chat" ? "page" : undefined}
          onClick={onHome}
        >
          <House size={18} />
          <span>{t("sidebar.dualSidebar.home", "Home")}</span>
        </button>
        {renderEntry(
          "ugsci.experts",
          t("sidebar.dualSidebar.experts", "Experts"),
        )}
        {renderEntry(
          "flowforge.editor",
          t("sidebar.dualSidebar.workflows", "Workflows"),
        )}
        {onWorkspace && (
          <button
            type="button"
            aria-current={selectedKey === "core.files" ? "page" : undefined}
            onClick={(event) => onWorkspace(event.currentTarget)}
          >
            <FolderOpen size={18} />
            <span>{t("sidebar.pageWorkspace", "Workspace")}</span>
          </button>
        )}
        {renderEntry("core.app-center", t("nav.apps", "Apps"))}
        {renderEntry(
          "core.cron-jobs",
          t("sidebar.dualSidebar.schedules", "Scheduled tasks"),
        )}
        <div className={styles.more}>{children}</div>
        <hr className={styles.divider} />
        <div
          className={styles.shortcuts}
          role="group"
          aria-label={t(
            "settingsCenter.dualSidebarEntries",
            "Custom shortcuts",
          )}
        >
          {shortcuts.map((entry) => (
            <button
              key={entry.key}
              type="button"
              title={typeof entry.label === "string" ? entry.label : undefined}
              aria-current={
                selectedKey === entry.key ||
                (entry.key.startsWith("pawapp:") &&
                  (currentPath === entry.path ||
                    currentPath?.startsWith(`${entry.path}/`)))
                  ? "page"
                  : undefined
              }
              onClick={() => onNavigate(entry)}
            >
              {entry.icon ?? <Puzzle size={18} />}
              <span>{entry.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={styles.secondary}>
        {renderEntry("core.run-center", t("sidebar.dualSidebar.runs", "Runs"))}
        {renderEntry("core.inbox", t("nav.inbox", "Inbox"))}
        <button
          type="button"
          aria-label={t("sidebar.dualSidebar.settings", "Open settings")}
          aria-current={
            selectedKey === "core.settings-center" ? "page" : undefined
          }
          onClick={onSettings}
        >
          <Settings size={18} />
          <span>{t("sidebar.quickMenu.settings", "Settings")}</span>
        </button>
      </div>
    </nav>
  );
}
